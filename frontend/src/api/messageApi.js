const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5063/api/messages";

export async function sendMessage(data) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function fetchMessages(conversationId) {
  const res = await fetch(`${BASE_URL}/${conversationId}`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}
