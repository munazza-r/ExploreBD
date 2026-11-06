import { apiRequest, BASE_URL, getToken } from "./client";

export async function submitVerification(formData) {
  const res = await fetch(`${BASE_URL}/verification/submit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData, // FormData - browser sets multipart headers automatically
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to submit verification");
  return data;
}

export function fetchMyVerificationStatus() {
  return apiRequest("/verification/me");
}

export function fetchAllVerifications() {
  return apiRequest("/verification/all");
}

export function updateVerificationStatus(id, status, rejectionReason) {
  return apiRequest(`/verification/${id}/status`, { method: "PATCH", body: { status, rejectionReason } });
}
