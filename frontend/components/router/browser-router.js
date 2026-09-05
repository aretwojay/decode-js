import generateStructure from "../../lib/generate-structure.js";
import Header from "../header.js";
import Link from "./link.js";

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
  async function refreshPage() {
    const pathname = window.location.pathname;
    setRouteLoading(true);

    try {
      const match = matchRoute(routes, pathname) ?? {
        generator: routes["*"],
        params: {},
      };
      const structure = await match.generator(match.params);

      if (rootElement.childNodes[0]) {
        rootElement.replaceChild(
          generateStructure(structure),
          rootElement.childNodes[0]
        );
      } else {
        rootElement.appendChild(generateStructure(structure));
      }

      if (window.location.hash) {
        const target = document.getElementById(window.location.hash.slice(1));
        if (target) target.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      console.error("[BrowserRouter] Error loading route:", pathname, err);
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

export function BrowserLink(url, title) {
  return {
    type: "a",
    attributes: [["href", url]],
    children: [title],
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
  };
}
