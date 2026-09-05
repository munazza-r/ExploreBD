const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api";

function getToken() {
  return localStorage.getItem("explorebd_token");
}

// One shared request function every feature's API file calls.
// Automatically attaches the Bearer token if the user is logged in.
export async function apiRequest(path, { method = "GET", body, isForm = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isForm && body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed (${res.status})`);
  }
  return data;
}

export { BASE_URL, getToken };
