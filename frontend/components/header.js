import ThemeSwitcher from "./theme-switcher.js";
import { isAuthenticated, getCurrentUser, logout } from "../lib/auth.js";
import { getTheme } from "../lib/theme.js";
import { getMode, toggleMode } from "../lib/color-mode.js";
import { fetchProfile } from "../lib/api.js";

function scheduleCvLinkUpdate() {
  if (typeof window === "undefined") return;
  setTimeout(async () => {
    const profile = await fetchProfile();
    const cvUrl = profile?.cv_pdf?.url;
    if (!cvUrl) return;
    document.querySelectorAll(".cv-nav-link").forEach((el) => {
      el.setAttribute("href", cvUrl);
    });
  }, 0);
}

function MobileMenuToggle() {
  return {
    type: "button",
    attributes: [
      ["type", "button"],
      ["class", ["mobile-menu-toggle"]],
      ["aria-label", "Ouvrir le menu"],
      ["aria-expanded", "false"],
    ],
    events: [
      [
        "click",
        (event) => {
          const nav = document.querySelector(".main-nav");
          const isOpen = nav?.classList.toggle("is-open");
          event.currentTarget.classList.toggle("is-open", isOpen);
          event.currentTarget.setAttribute("aria-expanded", String(Boolean(isOpen)));
        },
      ],
    ],
    children: [
      { type: "span", attributes: [["class", ["mobile-menu-toggle-icon"]]], children: [] },
    ],
  };
}

function ModeToggle() {
  const mode = getMode();
  return {
    type: "button",
    attributes: [
      ["type", "button"],
      ["class", ["mode-toggle"]],
      [
        "aria-label",
        mode === "light" ? "Passer en mode sombre" : "Passer en mode clair",
      ],
    ],
    events: [
      [
        "click",
        (event) => {
          event.preventDefault();
          toggleMode();
          const isLight = getMode() === "light";
          event.currentTarget.setAttribute(
            "aria-label",
            isLight ? "Passer en mode sombre" : "Passer en mode clair",
          );
        },
      ],
    ],
    children: [
      {
        type: "span",
        attributes: [["class", ["mode-toggle-icon"]]],
        children: [],
      },
    ],
  };
}

/**
 * Creates an accessible client-side link element with custom classes and children
 * @param {string} url
 * @param {Array|string} children
 * @param {Array<string>} [classNames=[]]
 * @param {Array} [extraAttrs=[]]
 * @returns {Object} Vanilla-engine structure object
 */
export function NavLink(url, children, classNames = [], extraAttrs = []) {
  return {
    type: "a",
    attributes: [
      ["href", url],
      ["class", Array.isArray(classNames) ? classNames : [classNames]],
      ...extraAttrs,
    ],
    events: [
      [
        "click",
        (event) => {
          event.preventDefault();
          window.history.pushState({}, undefined, url);
          window.dispatchEvent(new Event("pushstate"));
        },
      ],
    ],
    children: Array.isArray(children) ? children : [children],
  };
}

/**
 * Reusable Header & Navigation component
 * @param {string} [activePath="/"]
 * @returns {Object} Vanilla-engine structure object
 */
export default function Header(activePath = "/") {
  const authenticated = isAuthenticated();
  const currentUser = getCurrentUser();
  const isIris = getTheme() === "iris";

  if (isIris) scheduleCvLinkUpdate();

  const links = isIris
    ? [
        { url: "/", label: "Accueil" },
        { url: "/#about", label: "A Propos" },
        { url: "/#services", label: "Mes services" },
        { url: "/portfolio", label: "Projets" },
        { url: "/#contact", label: "Contact" },
      ]
    : [
        { url: "/", label: "Accueil" },
        { url: "/portfolio", label: "Portfolio" },
        { url: "/experiences", label: "Expériences" },
        { url: "/cv", label: "CV" },
        { url: "/contact", label: "Contact" },
      ];

  const logo = NavLink(
    "/",
    [
      {
        type: "span",
        attributes: [["class", ["site-logo"]]],
        children: [isIris ? "Iris" : "⚡ Portfolio.js"],
      },
    ],
    ["logo-link"],
  );

  const nav = {
    type: "nav",
    attributes: [
      ["class", ["main-nav"]],
      ["aria-label", "Navigation principale"],
    ],
    children: [
      ...links.map(({ url, label }) =>
        NavLink(
          url,
          label,
          activePath === url ? ["nav-link", "active"] : ["nav-link"],
        ),
      ),
      ...(authenticated
        ? [
            {
              type: "span",
              attributes: [["class", ["nav-link", "user-status"]]],
              children: [`👤 ${currentUser?.username ?? ""}`],
            },
            {
              type: "a",
              attributes: [
                ["href", "#"],
                ["class", ["nav-link", "logout-btn"]],
              ],
              children: ["Déconnexion"],
              events: [
                [
                  "click",
                  (event) => {
                    event.preventDefault();
                    logout();
                    window.history.pushState({}, undefined, "/");
                    window.dispatchEvent(new Event("pushstate"));
                  },
                ],
              ],
            },
          ]
        : isIris
          ? []
          : [
              NavLink(
                "/login",
                "Login",
                activePath === "/login" ? ["nav-link", "active"] : ["nav-link"],
              ),
              NavLink(
                "/signup",
                "Signup",
                activePath === "/signup"
                  ? ["nav-link", "active"]
                  : ["nav-link"],
              ),
            ]),
      ...(isIris
        ? [
            {
              type: "a",
              attributes: [
                ["href", "/cv"],
                ["target", "_blank"],
                ["rel", "noopener noreferrer"],
                ["class", ["nav-link", "cv-nav-link"]],
              ],
              children: ["Mon CV"],
            },
            ModeToggle(),
          ]
        : []),
    ],
  };

  if (isIris) {
    return {
      type: "header",
      attributes: [["class", ["site-header", "site-header-iris"]]],
      children: [
        {
          type: "div",
          attributes: [["class", ["header-topbar"]]],
          children: [ThemeSwitcher()],
        },
        {
          type: "div",
          attributes: [["class", ["header-mainrow"]]],
          children: [logo, nav, MobileMenuToggle()],
        },
      ],
    };
  }

  return {
    type: "header",
    attributes: [["class", ["site-header"]]],
    children: [logo, nav, ThemeSwitcher()],
  };
}
