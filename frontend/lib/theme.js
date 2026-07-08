import createState from "./create-state.js";

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
}

export function subscribeTheme(listener) {
  themeState.subscribe(listener);
}

export function applyTheme(themeName) {
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

