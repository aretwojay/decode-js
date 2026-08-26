import { API_BASE_URL } from "./api.js";

const TOKEN_KEY = "imprint_jwt";
const USER_KEY = "imprint_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function saveSession(jwt, user) {
  localStorage.setItem(TOKEN_KEY, jwt);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function register({ username, email, password }) {
  const res = await fetch(`${API_BASE_URL}/api/auth/local/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Impossible de créer le compte.");
  }
  saveSession(data.jwt, data.user);
  return data.user;
}

export async function login({ identifier, password }) {
  const res = await fetch(`${API_BASE_URL}/api/auth/local`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Identifiants invalides.");
  }
  saveSession(data.jwt, data.user);
  return data.user;
}
