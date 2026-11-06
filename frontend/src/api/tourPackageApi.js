import { apiRequest } from "./client";

export function createPackage(data) {
  return apiRequest("/tour-packages", { method: "POST", body: data });
}

export function fetchMyPackages() {
  return apiRequest("/tour-packages/mine");
}

export function fetchPublishedPackages() {
  return apiRequest("/tour-packages");
}
