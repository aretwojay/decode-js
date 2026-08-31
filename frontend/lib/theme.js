import createState from "./create-state.js";
import { appStore } from "./store.js";

export const AvailablesThemes = ["iris", "yaniss", "ruben"];

const themeState = createState(AvailablesThemes[0]);

export function getTheme() {
  return themeState.get();
}

export function setTheme(themeName) {
  if (!AvailablesThemes.includes(themeName)) {
    throw new Error(`Ce Thème n'existe pas : "${themeName}".`);
  }
  themeState.set(themeName);

  if (appStore && typeof appStore.setState === "function") {
    appStore.setState((state) => ({
      ...state,
      theme: themeName,
    }));
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
  link.href = `./themes/${themeName}.css`;
}

subscribeTheme(applyTheme);
applyTheme(getTheme());
