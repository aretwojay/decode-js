import createState from "./create-state.js";
import { appStore } from "./store.js";

export const AvailablesThemes = ["iris", "yaniss", "ruben"];

const STORAGE_KEY = "site-theme";

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return AvailablesThemes.includes(stored) ? stored : null;
  } catch {
    return null;
  }
}

function getInitialTheme() {
  try {
    const storeState =
      appStore && typeof appStore.getState === "function"
        ? appStore.getState()
        : appStore && typeof appStore.get === "function"
        ? appStore.get()
        : null;
    if (storeState?.profile?.theme && AvailablesThemes.includes(storeState.profile.theme)) {
      return storeState.profile.theme;
    }
  } catch {}
  return readStoredTheme() || "ruben";
}

const themeState = createState(getInitialTheme());

export function getTheme() {
  return themeState.get();
}

export function setTheme(themeName) {
  if (!AvailablesThemes.includes(themeName)) {
    throw new Error(`Ce Thème n'existe pas : "${themeName}".`);
  }
  themeState.set(themeName);

  try {
    localStorage.setItem(STORAGE_KEY, themeName);
  } catch {}

  if (appStore && typeof appStore.setState === "function") {
    appStore.setState((state) => ({
      ...state,
      theme: themeName,
      ...(state?.profile ? { profile: { ...state.profile, theme: themeName } } : {}),
    }));
  }
}

export function syncThemeFromProfile(profile) {
  if (profile?.theme && AvailablesThemes.includes(profile.theme)) {
    if (getTheme() !== profile.theme) {
      setTheme(profile.theme);
    }
  }
}

export function subscribeTheme(listener) {
  themeState.subscribe(listener);
}

export function applyTheme(themeName) {
  if (typeof document === "undefined") return;

  if (document.body) {
    document.body.dataset.theme = themeName;
  }

  let link = document.getElementById("theme-stylesheet");
  if (!link) {
    link = document.createElement("link");
    link.id = "theme-stylesheet";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  // Chemin absolu pour être valide sur toutes les sous-routes SPA (ex: /portfolio/:slug)
  link.href = `/themes/${themeName}.css`;
}

subscribeTheme(applyTheme);
applyTheme(getTheme());

// Écoute réactive des mises à jour du profil dans le store
if (appStore && typeof appStore.subscribe === "function") {
  appStore.subscribe((state) => {
    if (state?.profile?.theme && AvailablesThemes.includes(state.profile.theme)) {
      if (getTheme() !== state.profile.theme) {
        setTheme(state.profile.theme);
      }
    }
  });
}

// Synchronisation automatique au démarrage côté navigateur
if (typeof window !== "undefined") {
  setTimeout(async () => {
    try {
      const { fetchProfile } = await import("./api.js");
      const profile = await fetchProfile();
      if (profile?.theme) {
        syncThemeFromProfile(profile);
      }
    } catch {}
  }, 0);
}

export default {
  AvailablesThemes,
  getTheme,
  setTheme,
  syncThemeFromProfile,
  subscribeTheme,
  applyTheme,
};

