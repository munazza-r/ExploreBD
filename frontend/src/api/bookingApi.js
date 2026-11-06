import { apiRequest } from "./client";

export function createBooking(data) {
  return apiRequest("/bookings", { method: "POST", body: data });
}

export function fetchBookings() {
  return apiRequest("/bookings");
}

export function editBooking(id, data) {
  return apiRequest(`/bookings/${id}`, { method: "PATCH", body: data });
}

export function updateBookingStatus(id, status) {
  return apiRequest(`/bookings/${id}/status`, { method: "PATCH", body: { status } });
}

export function checkAvailableGuides(guideNames, date, time) {
  const params = new URLSearchParams({ guideNames: guideNames.join(","), date, time });
  return apiRequest(`/bookings/available-guides?${params}`);
}
