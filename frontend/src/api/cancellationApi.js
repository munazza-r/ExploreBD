import { apiRequest } from "./client";

export function cancelAsTourist(data) {
  return apiRequest("/cancellation/cancel/tourist", { method: "POST", body: data });
}

export function cancelAsGuide(data) {
  return apiRequest("/cancellation/cancel/guide", { method: "POST", body: data });
}

export function submitCompensationClaim(data) {
  return apiRequest("/cancellation/compensation/request", { method: "POST", body: data });
}

export function submitSosRequest(data) {
  return apiRequest("/cancellation/sos/request", { method: "POST", body: data });
}

export function fetchMyRequests() {
  return apiRequest("/cancellation/mine");
}

export function fetchAllCancellationRequests() {
  return apiRequest("/cancellation/requests");
}

export function fetchAllSosRequests() {
  return apiRequest("/cancellation/sos/all");
}

export function resolveCompensation(requestId, status) {
  return apiRequest("/cancellation/compensation/admin-resolve", { method: "PATCH", body: { requestId, status } });
}
