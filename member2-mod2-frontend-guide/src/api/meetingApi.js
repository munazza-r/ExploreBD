const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5062/api/meetings";
const FALLBACK_POINTS_URL = import.meta.env.VITE_FALLBACK_URL || "http://localhost:5062/api/fallback-points";

// ---- Tourist-side calls ----

export async function createMeeting(data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to create meeting");
  return res.json();
}

export async function fetchTouristMeetings(touristName) {
  const res = await fetch(`${BASE_URL}/tourist/${encodeURIComponent(touristName)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch meetings");
  return res.json();
}

export async function updateMeetingPoint(id, data) {
  const res = await fetch(`${BASE_URL}/${id}/meeting-point`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to update meeting point");
  return res.json();
}

export async function confirmMeeting(id) {
  const res = await fetch(`${BASE_URL}/${id}/confirm`, { method: "PATCH", cache: "no-store" });
  if (!res.ok) throw new Error("Failed to confirm meeting");
  return res.json();
}

// ---- Guide-side calls ----

export async function fetchGuidePendingApprovals(guideName) {
  const res = await fetch(`${BASE_URL}/guide/${encodeURIComponent(guideName)}/pending`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch pending approvals");
  return res.json();
}

export async function approveMeetingPoints(id, approvedPoints) {
  const res = await fetch(`${BASE_URL}/${id}/approve-points`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approvedPoints }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to approve meeting points");
  return res.json();
}

// ---- Guide fallback point settings ----

export async function addFallbackPoint(data) {
  const res = await fetch(FALLBACK_POINTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to add fallback point");
  return res.json();
}

export async function fetchFallbackPoints(guideName) {
  const res = await fetch(`${FALLBACK_POINTS_URL}/${encodeURIComponent(guideName)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch fallback points");
  return res.json();
}

export async function deleteFallbackPoint(id) {
  const res = await fetch(`${FALLBACK_POINTS_URL}/${id}`, { method: "DELETE", cache: "no-store" });
  if (!res.ok) throw new Error("Failed to delete fallback point");
  return res.json();
}
