import ThemeSwitcher from "./theme-switcher.js";
import { isAuthenticated, getCurrentUser, logout } from "../lib/auth.js";

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

  const links = [
    { url: "/", label: "Accueil" },
    { url: "/portfolio", label: "Portfolio" },
    { url: "/experiences", label: "Expériences" },
    { url: "/cv", label: "CV" },
    { url: "/contact", label: "Contact" },
  ];

  return {
    type: "header",
    attributes: [["class", ["site-header"]]],
    children: [
      NavLink(
        "/",
        [
          {
            type: "span",
            attributes: [["class", ["site-logo"]]],
            children: ["⚡ Portfolio.js"],
          },
        ],
        ["logo-link"]
      ),
      {
        type: "nav",
        attributes: [["class", ["main-nav"]], ["aria-label", "Navigation principale"]],
        children: [
          ...links.map(({ url, label }) =>
            NavLink(
              url,
              label,
              activePath === url ? ["nav-link", "active"] : ["nav-link"]
            )
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
                  attributes: [["href", "#"], ["class", ["nav-link", "logout-btn"]]],
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
            : [
                NavLink(
                  "/login",
                  "Login",
                  activePath === "/login" ? ["nav-link", "active"] : ["nav-link"]
                ),
                NavLink(
                  "/signup",
                  "Signup",
                  activePath === "/signup" ? ["nav-link", "active"] : ["nav-link"]
                ),
              ]),
        ],
      },
      ThemeSwitcher(),
    ],
  };
}
