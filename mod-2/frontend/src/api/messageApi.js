function authState() {
  try {
    return JSON.parse(localStorage.getItem('explorebdAuth'));
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const auth = authState();
  const response = await fetch(`/api/messages${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth?.token || ''}`,
      ...options.headers
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Message request failed');
    error.status = response.status;
    throw error;
  }
  return data;
}

export function fetchConversations() {
  return request('/conversations');
}

export function fetchMessages(counterpartId) {
  return request(`/${encodeURIComponent(counterpartId)}`);
}

export function sendMessage(counterpartId, content) {
  return request(`/${encodeURIComponent(counterpartId)}`, {
    method: 'POST',
    body: JSON.stringify({ content })
  });
}

export function getCurrentAuth() {
  return authState();
}
