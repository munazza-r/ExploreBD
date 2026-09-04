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
