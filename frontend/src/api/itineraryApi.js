import { apiRequest } from "./client";

export function generateItinerary(data) {
  return apiRequest("/itinerary/generate", { method: "POST", body: data });
}
