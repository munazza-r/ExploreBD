import { apiRequest } from "./client";

export function issuePass(bookingId) {
  return apiRequest("/qr-passes/issue", { method: "POST", body: { bookingId } });
}

export function fetchMyPass(bookingId) {
  return apiRequest(`/qr-passes/mine/${bookingId}`);
}

export function verifyPass(token) {
  return apiRequest("/qr-passes/verify", { method: "POST", body: { token } });
}
