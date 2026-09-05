export function getCurrentAuth() {
  try {
    return JSON.parse(localStorage.getItem('explorebdAuth'));
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const auth = getCurrentAuth();
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth?.token || ""}`,
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || data.error || "Something went wrong.");
    error.code = data.code;
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function login(email, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const auth = { token: data.token, user: data.user };
  localStorage.setItem("explorebdAuth", JSON.stringify(auth));
  return auth;
}

export function logout() {
  localStorage.removeItem("explorebdAuth");
  window.location.replace("/");
}

export function fetchMyBooking() {
  return request("/passes/me");
}

export function fetchBookingPass(bookingId) {
  return request(`/passes/${encodeURIComponent(bookingId)}`);
}

export function verifyBookingPass(token) {
  return request("/passes/verify", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}
