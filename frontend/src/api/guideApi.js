// Small wrapper around fetch() so components don't repeat boilerplate.
// Update this if your teammates already have a shared API base URL setup.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/guides";
// If your project uses Create React App instead of Vite, replace the line above with:
// const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/guides";

export async function fetchAllGuides() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch guides");
  return res.json();
}

export async function searchGuides(filters) {
  const res = await fetch(`${BASE_URL}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters),
  });
  if (!res.ok) throw new Error("Failed to search guides");
  return res.json();
}

export async function getGuideDetails(id) {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch guide details");
  return res.json();
}

export async function updateGuideAvailability(id, availability) {
  const res = await fetch(`${BASE_URL}/${id}/availability`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ availability }),
  });
  if (!res.ok) throw new Error("Failed to update availability");
  return res.json();
}
