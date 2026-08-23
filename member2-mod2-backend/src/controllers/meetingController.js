const prisma = require("../db");

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Fallback mock points, only used if no API key is set or a Google call fails.
const FALLBACK_POINTS = [
  { name: "Shahbagh", distance: "5.6 km", time: "16 mins" },
  { name: "Dhaka University", distance: "6.2 km", time: "18 mins" },
  { name: "Panthapath", distance: "5.1 km", time: "15 mins" },
  { name: "Dhanmondi 27", distance: "4.9 km", time: "14 mins" },
];

// Convert a place name (e.g. "Mirpur 10, Dhaka") into { lat, lng }
async function geocodeLocation(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${GOOGLE_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "OK" || !data.results.length) {
    throw new Error(`Geocoding failed for "${address}": ${data.status}`);
  }
  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng };
}

// Convert { lat, lng } back into a readable place name
async function reverseGeocode(lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "OK" || !data.results.length) {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
  // Prefer a short, human-friendly component (neighborhood/sublocality) over the full address
  const result = data.results.find((r) =>
    r.types.some((t) => ["neighborhood", "sublocality", "political"].includes(t))
  ) || data.results[0];
  return result.formatted_address.split(",")[0];
}

// Get real driving distance + duration from origin to destination
async function getDistanceAndTime(origin, destination) {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${GOOGLE_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const element = data?.rows?.[0]?.elements?.[0];
  if (!element || element.status !== "OK") {
    return { distance: "N/A", time: "N/A" };
  }
  return {
    distance: element.distance.text,
    time: element.duration.text,
  };
}

// Calculate a point a given fraction of the way between two coordinates (straight-line interpolation)
function interpolate(a, b, fraction) {
  return {
    lat: a.lat + (b.lat - a.lat) * fraction,
    lng: a.lng + (b.lng - a.lng) * fraction,
  };
}

// POST /api/meetings - create a new meeting session for a confirmed booking
async function createMeeting(req, res) {
  try {
    const { touristName, guideName, tourDetails, touristLocation, guideLocation } = req.body;

    if (!touristName || !guideName || !tourDetails || !touristLocation || !guideLocation) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const meeting = await prisma.meeting.create({
      data: { touristName, guideName, tourDetails, touristLocation, guideLocation },
    });

    res.status(201).json({ response: "Meeting session created", meeting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while creating the meeting" });
  }
}

// GET /api/meetings - list all meetings
async function getMeetings(req, res) {
  try {
    const meetings = await prisma.meeting.findMany({ orderBy: { createdAt: "desc" } });
    res.status(200).json(meetings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while fetching meetings" });
  }
}

// POST /api/meetings/route-info - get suggested meeting points + distances
// Body can include touristLat/touristLng (real browser geolocation) in addition to
// the plain-text touristLocation/guideLocation fields.
async function getRouteInfo(req, res) {
  try {
    const { touristLocation, guideLocation, touristLat, touristLng } = req.body;

    if (!GOOGLE_KEY) {
      // No API key configured - fall back to the static mock list.
      return res.status(200).json({
        touristLocation,
        guideLocation,
        suggestedMeetingPoints: FALLBACK_POINTS,
      });
    }

    // 1. Get real coordinates for both people
    const touristCoords =
      touristLat !== undefined && touristLng !== undefined
        ? { lat: Number(touristLat), lng: Number(touristLng) }
        : await geocodeLocation(`${touristLocation}, Dhaka`);

    const guideCoords = await geocodeLocation(`${guideLocation}, Dhaka`);

    // 2. Pick a random number of points (2 to 4 inclusive) along the line between them
    const numPoints = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4
    // Spread fractions between ~30% and ~70% of the way, so points sit meaningfully
    // "between" the two people rather than right on top of either one.
    const fractions = Array.from({ length: numPoints }, (_, i) =>
      0.3 + (i * 0.4) / Math.max(numPoints - 1, 1)
    );

    // 3. For each fraction: interpolate coords, reverse-geocode a name, get real distance/time
    const suggestedMeetingPoints = await Promise.all(
      fractions.map(async (fraction) => {
        const point = interpolate(touristCoords, guideCoords, fraction);
        const name = await reverseGeocode(point.lat, point.lng);
        const { distance, time } = await getDistanceAndTime(touristCoords, point);
        return { name, distance, time, lat: point.lat, lng: point.lng };
      })
    );

    res.status(200).json({
      touristLocation,
      guideLocation,
      suggestedMeetingPoints,
    });
  } catch (err) {
    console.error(err);
    // If any Google API call fails (bad key, quota, network), don't break the page -
    // fall back to the static list so the UI still works.
    res.status(200).json({
      touristLocation: req.body.touristLocation,
      guideLocation: req.body.guideLocation,
      suggestedMeetingPoints: FALLBACK_POINTS,
    });
  }
}

// PATCH /api/meetings/:id/meeting-point - save the chosen meeting point
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

// PATCH /api/meetings/:id/confirm - lock in the meeting
async function confirmMeeting(req, res) {
  try {
    const { id } = req.params;
    const meeting = await prisma.meeting.update({
      where: { id },
      data: { status: "Confirmed" },
    });
    res.status(200).json({ response: "Meeting confirmed", meeting });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while confirming the meeting" });
  }
}

module.exports = { createMeeting, getMeetings, getRouteInfo, updateMeetingPoint, confirmMeeting };
