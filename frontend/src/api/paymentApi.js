import { apiRequest } from "./client";

export function initiatePayment(data) {
  return apiRequest("/payments/initiate", { method: "POST", body: data });
}

export function fetchAllPayments() {
  return apiRequest("/payments/all");
}

export function fetchGuideEarnings() {
  return apiRequest("/payments/guide/earnings");
}

export function markTourCompleted(id) {
  return apiRequest(`/payments/${id}/complete`, { method: "PATCH" });
}

export function releasePayment(id) {
  return apiRequest(`/payments/${id}/release`, { method: "PATCH" });
}

export function refundPayment(id, reason) {
  return apiRequest(`/payments/${id}/refund`, { method: "PATCH", body: { reason } });
}
