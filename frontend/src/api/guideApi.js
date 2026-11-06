import { apiRequest } from "./client";

export function fetchGuides() {
  return apiRequest("/guides");
}

export function searchGuides(filters) {
  return apiRequest("/guides/search", { method: "POST", body: filters });
}

export function fetchGuideDetails(id) {
  return apiRequest(`/guides/${id}`);
}

export function fetchMyGuideProfile() {
  return apiRequest("/guides/me");
}

export function updateMyGuideProfile(data) {
  return apiRequest("/guides/me", { method: "PUT", body: data });
}
