import generateStructure from "../../lib/generate-structure.js";

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

export default function BrowserRouter(rootElement, routes) {
  async function refreshPage() {
    const pathname = window.location.pathname;
    const match = matchRoute(routes, pathname) ?? { generator: routes["*"], params: {} };
    const structure = await match.generator(match.params); // await, que ce soit sync ou async

    if (rootElement.childNodes[0]) {
      rootElement.replaceChild(generateStructure(structure), rootElement.childNodes[0]);
    } else {
      rootElement.appendChild(generateStructure(structure));
    }

    if (window.location.hash) {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) target.scrollIntoView({ behavior: "smooth" });
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
    events: [["click", (event) => {
      event.preventDefault();
      window.history.pushState({}, undefined, url);
      window.dispatchEvent(new Event("pushstate"));
    }]],
  };
}
