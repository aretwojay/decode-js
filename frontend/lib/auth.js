import { AUTH_TOKEN_KEY, buildApiUrl } from "./api.js";

const USER_KEY = "imprint_user";

function getStorage() {
  if (typeof window === "undefined" || !("localStorage" in window)) return null;

  try {
    return window.localStorage;
  } catch (error) {
    console.warn(
      "getStorage: localStorage is not available",
      error && error.message ? error.message : error,
    );
    return null;
  }
}

export function getToken() {
  const storage = getStorage();
  if (!storage) return null;

  try {
    return storage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.warn(
      "getToken: unable to read token from localStorage",
      error && error.message ? error.message : error,
    );
    return null;
  }
}

export function getCurrentUser() {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn(
      "getCurrentUser: unable to read user from localStorage",
      error && error.message ? error.message : error,
    );
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function saveSession(jwt, user) {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(AUTH_TOKEN_KEY, jwt);
    storage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn(
      "saveSession: unable to persist auth data",
      error && error.message ? error.message : error,
    );
  }
}

export function logout() {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(AUTH_TOKEN_KEY);
    storage.removeItem(USER_KEY);
  } catch (error) {
    console.warn(
      "logout: unable to remove auth data",
      error && error.message ? error.message : error,
    );
  }
}

export async function register({ username, email, password }) {
  const res = await fetch(buildApiUrl("auth/local/register"), {
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
  const res = await fetch(buildApiUrl("auth/local"), {
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
