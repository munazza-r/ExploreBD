import { apiRequest } from "./client";

export function sendMessage(data) {
  return apiRequest("/messages", { method: "POST", body: data });
}

export function fetchMessages(conversationId) {
  return apiRequest(`/messages/${conversationId}`);
}
