const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5071/api/bookings";

export async function createBooking(data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create booking");
  }
  return res.json();
}

export async function fetchBookings() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

export async function editBooking(id, data) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to edit booking");
  }
  return res.json();
}

export async function updateBookingStatus(id, status) {
  const res = await fetch(`${BASE_URL}/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update booking");
  }
  return res.json();
}

// Checks whether a single guide is free at a given date/time.
// Returns true if available, false if already booked for that slot.
export async function checkGuideAvailability(guideName, date, time) {
  const params = new URLSearchParams({ guideNames: guideName, date, time });
  const res = await fetch(`${BASE_URL}/available-guides?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to check availability");
  const data = await res.json();
  return data.guides?.[0]?.available ?? true;
}