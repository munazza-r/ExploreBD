const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5062/api/meetings";

export async function createMeeting(data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create meeting");
  return res.json();
}

export async function fetchMeetings() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch meetings");
  return res.json();
}

// touristCoords is optional: { lat, lng }. When provided, the backend uses these
// real coordinates instead of geocoding the touristLocation text.
export async function getRouteInfo(touristLocation, guideLocation, touristCoords) {
  const res = await fetch(`${BASE_URL}/route-info`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      touristLocation,
      guideLocation,
      touristLat: touristCoords?.lat,
      touristLng: touristCoords?.lng,
    }),
  });
  if (!res.ok) throw new Error("Failed to fetch route info");
  return res.json();
}

export async function updateMeetingPoint(id, data) {
  const res = await fetch(`${BASE_URL}/${id}/meeting-point`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update meeting point");
  return res.json();
}

export async function confirmMeeting(id) {
  const res = await fetch(`${BASE_URL}/${id}/confirm`, {
    method: "PATCH",
  });
  if (!res.ok) throw new Error("Failed to confirm meeting");
  return res.json();
}
