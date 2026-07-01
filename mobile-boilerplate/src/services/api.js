import { API_BASE_URL } from '../config';

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // Network-level failure (server unreachable, wrong IP, no network, etc.)
    throw new Error(
      `Could not reach the server at ${API_BASE_URL}. Check that the backend is running and that your phone and computer are on the same network. (${err.message})`
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // No JSON body (e.g. 204) — fine, leave data as null.
  }

  if (!response.ok) {
    throw new Error(data?.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),

  createBooking: (payload) => request('/bookings', { method: 'POST', body: payload }),
  getActiveBooking: () => request('/bookings/active'),
  getBookingHistory: () => request('/bookings/history'),
  getJobInvites: () => request('/bookings/invites'),
  acceptJob: (bookingId) => request(`/bookings/${bookingId}/accept`, { method: 'PATCH' }),
  updateBookingStatus: (bookingId, status) =>
    request(`/bookings/${bookingId}/status`, { method: 'PATCH', body: { status } }),

  getMessages: (bookingId) => request(`/messages/${bookingId}`),
};
