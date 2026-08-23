const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5064/api/itinerary";

export async function generateItinerary(data) {
  const res = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to generate itinerary");
  return res.json();
}
