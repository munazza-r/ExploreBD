const prisma = require("../db");

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;
const APPROVAL_WINDOW_MINUTES = Number(process.env.APPROVAL_WINDOW_MINUTES) || 10;

// Fallback mock points, only used if no API key is set or a Google call fails,
// AND the guide has no pre-configured fallback points of their own.
const GENERIC_FALLBACK_POINTS = [
  { name: "Shahbagh", distance: "5.6 km", time: "16 mins" },
  { name: "Dhaka University", distance: "6.2 km", time: "18 mins" },
  { name: "Panthapath", distance: "5.1 km", time: "15 mins" },
  { name: "Dhanmondi 27", distance: "4.9 km", time: "14 mins" },
];

async function geocodeLocation(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "OK" || !data.results.length) {
    throw new Error(`Geocoding failed for "${address}": ${data.status}`);
  }
  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng };
}

async function reverseGeocode(lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "OK" || !data.results.length) {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
  const result = data.results.find((r) =>
    r.types.some((t) => ["neighborhood", "sublocality", "political"].includes(t))
  ) || data.results[0];
  return result.formatted_address.split(",")[0];
}

async function getDistanceAndTime(origin, destination) {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${GOOGLE_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const element = data?.rows?.[0]?.elements?.[0];
  if (!element || element.status !== "OK") return { distance: "N/A", time: "N/A" };
  return { distance: element.distance.text, time: element.duration.text };
}

function interpolate(a, b, fraction) {
  return { lat: a.lat + (b.lat - a.lat) * fraction, lng: a.lng + (b.lng - a.lng) * fraction };
}

// Straight-line distance between two coordinates, in km (used to find the nearest fallback point)
function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Core suggestion-generation logic, reused when a booking is confirmed.
async function generateSuggestedPoints(touristLocation, guideLocation) {
  if (!GOOGLE_KEY) {
    return { points: GENERIC_FALLBACK_POINTS, midpoint: null };
  }
  try {
    const touristCoords = await geocodeLocation(`${touristLocation}, Dhaka`);
    const guideCoords = await geocodeLocation(`${guideLocation}, Dhaka`);
    const numPoints = Math.floor(Math.random() * 3) + 2;
    const fractions = Array.from({ length: numPoints }, (_, i) => 0.3 + (i * 0.4) / Math.max(numPoints - 1, 1));

    const points = await Promise.all(
      fractions.map(async (fraction) => {
        const point = interpolate(touristCoords, guideCoords, fraction);
        const name = await reverseGeocode(point.lat, point.lng);
        const { distance, time } = await getDistanceAndTime(touristCoords, point);
        return { name, distance, time, lat: point.lat, lng: point.lng };
      })
    );
    const midpoint = interpolate(touristCoords, guideCoords, 0.5);
    return { points, midpoint };
  } catch (err) {
    console.error("Suggestion generation failed, using generic fallback:", err.message);
    return { points: GENERIC_FALLBACK_POINTS, midpoint: null };
  }
}

// If a meeting's approval window has expired with no guide response, auto-resolve it
// using the guide's pre-configured fallback points (nearest to the midpoint), or the
// original suggested points if the guide has no fallback points saved.
async function applyFallbackIfExpired(meeting) {
  if (meeting.status !== "Awaiting Guide Approval" || !meeting.approvalRequestedAt) return meeting;

  const minutesElapsed = (Date.now() - new Date(meeting.approvalRequestedAt).getTime()) / 60000;
  if (minutesElapsed < APPROVAL_WINDOW_MINUTES) return meeting;

  const guideFallbacks = await prisma.guideFallbackPoint.findMany({
    where: { guideName: meeting.guideName },
  });

  let chosenPoints;
  if (guideFallbacks.length > 0 && meeting.suggestedPoints?.midpoint) {
    // Sort the guide's saved fallback points by distance to the calculated midpoint
    const midpoint = meeting.suggestedPoints.midpoint;
    chosenPoints = guideFallbacks
      .filter((p) => p.lat != null && p.lng != null)
      .map((p) => ({
        name: p.pointName,
        distanceKm: haversineKm(midpoint, { lat: p.lat, lng: p.lng }),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 3)
      .map((p) => ({ name: p.name, distance: `${p.distanceKm.toFixed(1)} km`, time: "N/A" }));
  }

  // If the guide has no usable fallback points, just take the top 3 originally suggested points
  if (!chosenPoints || chosenPoints.length === 0) {
    chosenPoints = (meeting.suggestedPoints?.points || GENERIC_FALLBACK_POINTS).slice(0, 3);
  }

  return prisma.meeting.update({
    where: { id: meeting.id },
    data: {
      guideApprovedPoints: chosenPoints,
      status: "Fallback Used",
      usedFallback: true,
    },
  });
}

// POST /api/meetings - booking confirmed: create the meeting AND generate suggestions immediately
async function createMeeting(req, res) {
  try {
    const { touristName, guideName, tourDetails, touristLocation, guideLocation } = req.body;

    if (!touristName || !guideName || !tourDetails || !touristLocation || !guideLocation) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const { points, midpoint } = await generateSuggestedPoints(touristLocation, guideLocation);

    const meeting = await prisma.meeting.create({
      data: {
        touristName,
        guideName,
        tourDetails,
        touristLocation,
        guideLocation,
        suggestedPoints: { points, midpoint },
        approvalRequestedAt: new Date(),
        status: "Awaiting Guide Approval",
      },
    });

    res.status(201).json({ response: "Meeting created, awaiting guide approval", meeting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while creating the meeting" });
  }
}

// GET /api/meetings - list all meetings (testing/admin)
async function getMeetings(req, res) {
  try {
    const meetings = await prisma.meeting.findMany({ orderBy: { createdAt: "desc" } });
    res.status(200).json(meetings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while fetching meetings" });
  }
}

// GET /api/meetings/tourist/:touristName - tourist's own meetings.
// Checks and applies the fallback timer before returning, so the tourist never gets stuck.
async function getTouristMeetings(req, res) {
  try {
    const { touristName } = req.params;
    let meetings = await prisma.meeting.findMany({ where: { touristName }, orderBy: { createdAt: "desc" } });
    meetings = await Promise.all(meetings.map(applyFallbackIfExpired));
    res.status(200).json(meetings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while fetching meetings" });
  }
}

// GET /api/meetings/guide/:guideName/pending - guide's approval queue.
// Also applies the fallback timer, so expired requests disappear from the queue automatically.
async function getGuidePendingApprovals(req, res) {
  try {
    const { guideName } = req.params;
    let meetings = await prisma.meeting.findMany({
      where: { guideName, status: "Awaiting Guide Approval" },
      orderBy: { createdAt: "asc" },
    });
    meetings = await Promise.all(meetings.map(applyFallbackIfExpired));
    // Only keep the ones still actually pending after the fallback check
    const stillPending = meetings.filter((m) => m.status === "Awaiting Guide Approval");
    res.status(200).json(stillPending);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while fetching pending approvals" });
  }
}

// PATCH /api/meetings/:id/approve-points - guide approves a subset of the suggested points
async function approveMeetingPoints(req, res) {
  try {
    const { id } = req.params;
    const { approvedPoints } = req.body; // array of point objects the guide is okay with

    if (!approvedPoints || approvedPoints.length === 0) {
      return res.status(400).json({ error: "Select at least one meeting point to approve" });
    }

    const meeting = await prisma.meeting.update({
      where: { id },
      data: { guideApprovedPoints: approvedPoints, status: "Approved" },
    });

    res.status(200).json({ response: "Meeting points approved", meeting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while approving meeting points" });
  }
}

// PATCH /api/meetings/:id/meeting-point - tourist's final choice from the approved list
async function updateMeetingPoint(req, res) {
  try {
    const { id } = req.params;
    const { meetingPoint, distance, duration, traffic } = req.body;
    const meeting = await prisma.meeting.update({
      where: { id },
      data: { meetingPoint, distance, duration, traffic },
    });
    res.status(200).json({ response: "Meeting point updated", meeting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while updating the meeting point" });
  }
}

// PATCH /api/meetings/:id/confirm - lock in the final meeting
async function confirmMeeting(req, res) {
  try {
    const { id } = req.params;
    const meeting = await prisma.meeting.update({ where: { id }, data: { status: "Confirmed" } });
    res.status(200).json({ response: "Meeting confirmed", meeting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while confirming the meeting" });
  }
}

// ---- Guide fallback point settings (profile-level, not tied to a single meeting) ----

// POST /api/fallback-points - guide adds a pre-approved fallback point
async function addFallbackPoint(req, res) {
  try {
    const { guideName, area, pointName, lat, lng } = req.body;
    if (!guideName || !area || !pointName) {
      return res.status(400).json({ error: "guideName, area, and pointName are required" });
    }
    const point = await prisma.guideFallbackPoint.create({ data: { guideName, area, pointName, lat, lng } });
    res.status(201).json({ response: "Fallback point added", point });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while adding the fallback point" });
  }
}

// GET /api/fallback-points/:guideName - list a guide's saved fallback points
async function getFallbackPoints(req, res) {
  try {
    const { guideName } = req.params;
    const points = await prisma.guideFallbackPoint.findMany({ where: { guideName } });
    res.status(200).json(points);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while fetching fallback points" });
  }
}

// DELETE /api/fallback-points/:id
async function deleteFallbackPoint(req, res) {
  try {
    const { id } = req.params;
    await prisma.guideFallbackPoint.delete({ where: { id } });
    res.status(200).json({ response: "Fallback point removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while removing the fallback point" });
  }
}

module.exports = {
  createMeeting,
  getMeetings,
  getTouristMeetings,
  getGuidePendingApprovals,
  approveMeetingPoints,
  updateMeetingPoint,
  confirmMeeting,
  addFallbackPoint,
  getFallbackPoints,
  deleteFallbackPoint,
};
