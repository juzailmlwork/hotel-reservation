const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5004/api';
const TOKEN_KEY = 'admin_token';

let unauthorizedHandler = () => {};

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// Called when a request made with a token comes back 401 (expired or invalid token).
export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

// Returns the token's expiry time in ms, or null if it can't be read.
export function getTokenExpiry(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // A 401 without a token is just a failed login, not an expired session.
    if (res.status === 401 && token) {
      setToken(null);
      unauthorizedHandler(data.code);
    }
    const error = new Error(data.message || 'Request failed');
    error.status = res.status;
    error.code = data.code;
    error.errors = data.errors;
    throw error;
  }
  return data;
}

export const api = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (credentials) => request('/auth/register', { method: 'POST', body: credentials }),
  me: () => request('/auth/me'),
  listUsers: () => request('/users'),
  createUser: (credentials) => request('/users', { method: 'POST', body: credentials }),
};
