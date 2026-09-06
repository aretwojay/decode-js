import generateStructure from "../../lib/generate-structure.js";
import Header from "../header.js";
import Link from "./link.js";
import { setRouteHead, updateHead } from "../../utils/head-manager.js";

export function matchRoute(routes, pathname) {
  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");

  if (routes[normalizedPath]) {
    return { generator: routes[normalizedPath], params: {} };
  }

  const pathSegments = normalizedPath.replace(/^\/+|\/+$/g, "").split("/");

  for (const [pattern, generator] of Object.entries(routes)) {
    if (pattern === "*") continue;
    const patternSegments = pattern.replace(/^\/+|\/+$/g, "").split("/");
    if (patternSegments.length !== pathSegments.length) continue;

    const params = {};
    let isMatch = true;

    for (let i = 0; i < patternSegments.length; i++) {
      const pSeg = patternSegments[i];
      const uSeg = pathSegments[i];
      if (pSeg.startsWith(":")) {
        params[pSeg.slice(1)] = decodeURIComponent(uSeg);
      } else if (pSeg !== uSeg) {
        isMatch = false;
        break;
      }
    }
    if (isMatch) return { generator, params };
  }

  if (routes["*"]) return { generator: routes["*"], params: {} };
  return null;
}

function setRouteLoading(isLoading) {
  if (typeof document === "undefined") return;
  let bar = document.getElementById("route-progress-bar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "route-progress-bar";
    bar.className = "route-progress-bar";
    document.body.prepend(bar);
  }
  if (isLoading) {
    bar.classList.add("active");
  } else {
    bar.classList.remove("active");
  }
}

function renderRouterError(error, pathname, onRetry) {
  return {
    type: "div",
    attributes: [["class", ["page", "page-error"]]],
    children: [
      Header(pathname),
      {
        type: "main",
        attributes: [
          ["id", "main-content"],
          ["tabindex", "-1"],
        ],
        children: [
          {
            type: "div",
            attributes: [["class", ["empty-state-card", "error-state-card"]]],
            children: [
              {
                type: "div",
                attributes: [["class", ["empty-state-icon"]]],
                children: ["⚠️"],
              },
              {
                type: "h2",
                attributes: [["class", ["empty-state-title"]]],
                children: ["Impossible de charger cette page"],
              },
              {
                type: "p",
                attributes: [["class", ["empty-state-desc"]]],
                children: [
                  error?.message ||
                    "Une erreur inattendue est survenue lors de la navigation.",
                ],
              },
              {
                type: "div",
                attributes: [["class", ["empty-state-action"]]],
                children: [
                  {
                    type: "button",
                    attributes: [
                      ["type", "button"],
                      ["class", ["btn", "btn-primary", "empty-state-btn"]],
                    ],
                    events: [["click", onRetry]],
                    children: ["🔄 Réessayer"],
                  },
                  Link("/", "← Retour à l'accueil", [
                    "btn",
                    "btn-secondary",
                    "empty-state-btn",
                  ]),
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

export default function BrowserRouter(rootElement, routes) {
  let isInitialRender = true;

  async function refreshPage() {
    const pathname = window.location.pathname;
    const shouldMoveFocus = !isInitialRender;
    isInitialRender = false;
    setRouteLoading(true);

    try {
      const match = matchRoute(routes, pathname) ?? {
        generator: routes["*"],
        params: {},
      };

      // Set baseline SEO head tags for the detected route (T0021)
      setRouteHead(pathname);

      const structure = await match.generator(match.params);

      if (rootElement.childNodes[0]) {
        rootElement.replaceChild(
          generateStructure(structure),
          rootElement.childNodes[0]
        );
      } else {
        rootElement.appendChild(generateStructure(structure));
      }

      // Scroll restoration & anchor management (T0020 Axe 1)
      if (window.location.hash) {
        setTimeout(() => {
          const hashId = window.location.hash.slice(1);
          const target = document.getElementById(hashId);
          if (target) {
            target.scrollIntoView({ behavior: "smooth" });
          }
        }, 50);
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }

      // Focus management for screen readers and keyboard navigation (T0020 Axe 1)
      if (shouldMoveFocus) {
        const focusTarget =
          rootElement.querySelector("main") || rootElement.querySelector("h1");
        if (focusTarget) {
          focusTarget.setAttribute("tabindex", "-1");
          focusTarget.focus({ preventScroll: true });
        }
      }
    } catch (err) {
      console.error("[BrowserRouter] Error loading route:", pathname, err);
      updateHead({
        title: "Impossible de charger cette page | Erreur",
        description:
          err?.message || "Une erreur inattendue est survenue lors de la navigation.",
      });
      const errorStructure = renderRouterError(err, pathname, refreshPage);
      if (rootElement.childNodes[0]) {
        rootElement.replaceChild(
          generateStructure(errorStructure),
          rootElement.childNodes[0]
        );
      } else {
        rootElement.appendChild(generateStructure(errorStructure));
      }
    } finally {
      setRouteLoading(false);
    }
  }

  window.addEventListener("popstate", refreshPage);
  window.addEventListener("pushstate", refreshPage);
  refreshPage();
}

export function BrowserLink(url, title, classNames = [], extraAttrs = []) {
  const isAnchor = typeof url === "string" && url.startsWith("#");
  const isTargetBlank =
    Array.isArray(extraAttrs) &&
    extraAttrs.some(([k, v]) => k === "target" && v === "_blank");

  return {
    type: "a",
    attributes: [
      ["href", url],
      ...(Array.isArray(classNames) && classNames.length > 0
        ? [["class", classNames]]
        : typeof classNames === "string" && classNames
        ? [["class", [classNames]]]
        : []),
      ...(Array.isArray(extraAttrs) ? extraAttrs : []),
    ],
    children: Array.isArray(title) ? title : [title],
    events: [
      [
        "click",
        (event) => {
          if (isTargetBlank) {
            return;
          }
          if (isAnchor) {
            event.preventDefault();
            const targetId = url.slice(1);
            const target = document.getElementById(targetId);
            if (target) {
              target.scrollIntoView({ behavior: "smooth" });
              if (typeof window !== "undefined" && window.history?.replaceState) {
                window.history.replaceState(null, "", url);
              }
            }
            return;
          }
          event.preventDefault();
          window.history.pushState({}, undefined, url);
          window.dispatchEvent(new Event("pushstate"));
        },
      ],
    ],
  };
}
