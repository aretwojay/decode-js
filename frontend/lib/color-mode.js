import createState from "./create-state.js";

const STORAGE_KEY = "color-mode";

function readStoredMode() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

const modeState = createState(readStoredMode() === "light" ? "light" : "dark");

export function getMode() {
  return modeState.get();
}

export function setMode(mode) {
  const next = mode === "light" ? "light" : "dark";
  modeState.set(next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {}
}

export function toggleMode() {
  setMode(getMode() === "light" ? "dark" : "light");
}

export function subscribeMode(listener) {
  modeState.subscribe(listener);
}

export function applyMode(mode) {
  if (typeof document === "undefined" || !document.body) return;
  document.body.dataset.mode = mode;
}

subscribeMode(applyMode);
applyMode(getMode());
