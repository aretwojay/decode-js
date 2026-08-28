import { AvailablesThemes, getTheme, setTheme, subscribeTheme } from "../lib/theme.js";

/**
 * Reusable Theme Switcher Component
 * Generates an interactive theme toggle bar for available themes ('iris', 'yaniss', 'ruben')
 * @returns {Object} Vanilla-engine structure object
 */
export default function ThemeSwitcher() {
  const currentTheme = getTheme();

  return {
    type: "div",
    attributes: [
      ["class", ["theme-switcher-container"]],
      ["id", "theme-switcher"],
      ["role", "group"],
      ["aria-label", "Sélecteur de thème"],
    ],
    children: [
      {
        type: "span",
        attributes: [["class", ["theme-label"]]],
        children: ["Thème :"],
      },
      ...AvailablesThemes.map((themeName) => {
        const isActive = themeName === currentTheme;
        return {
          type: "button",
          attributes: [
            [
              "class",
              isActive ? ["theme-btn", "active"] : ["theme-btn"],
            ],
            ["type", "button"],
            ["data-theme", themeName],
            ["aria-pressed", String(isActive)],
          ],
          events: [
            [
              "click",
              (e) => {
                e.preventDefault();
                setTheme(themeName);
                // Update local visual active state on click
                const container = document.getElementById("theme-switcher");
                if (container) {
                  container.querySelectorAll(".theme-btn").forEach((btn) => {
                    if (btn.dataset.theme === themeName) {
                      btn.classList.add("active");
                      btn.setAttribute("aria-pressed", "true");
                    } else {
                      btn.classList.remove("active");
                      btn.setAttribute("aria-pressed", "false");
                    }
                  });
                }
              },
            ],
          ],
          children: [themeName],
        };
      }),
    ],
  };
}
