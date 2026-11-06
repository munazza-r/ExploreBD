import { apiRequest } from "./client";

export function createMeeting(data) {
  return apiRequest("/meetings", { method: "POST", body: data });
}

export function fetchTouristMeetings(touristName) {
  return apiRequest(`/meetings/tourist/${encodeURIComponent(touristName)}`);
}

export function fetchGuidePendingApprovals() {
  return apiRequest("/meetings/guide/pending");
}

export function approveMeetingPoints(id, approvedPoints) {
  return apiRequest(`/meetings/${id}/approve-points`, { method: "PATCH", body: { approvedPoints } });
}

export function updateMeetingPoint(id, data) {
  return apiRequest(`/meetings/${id}/meeting-point`, { method: "PATCH", body: data });
}

export function confirmMeeting(id) {
  return apiRequest(`/meetings/${id}/confirm`, { method: "PATCH" });
}

export function addFallbackPoint(data) {
  return apiRequest("/fallback-points", { method: "POST", body: data });
}

export function fetchMyFallbackPoints() {
  return apiRequest("/fallback-points/mine");
}

export function deleteFallbackPoint(id) {
  return apiRequest(`/fallback-points/${id}`, { method: "DELETE" });
}
