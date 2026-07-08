import generateStructure from "../../lib/generate-structure.js";

export default function BrowserRouter(rootElement, routes) {
  function refreshPage() {
    const pathname = window.location.pathname;
    const generator = routes[pathname] ?? routes["*"];
    if (rootElement.childNodes[0]) {
      rootElement.replaceChild(
        generateStructure(generator()),
        rootElement.childNodes[0],
      );
    } else {
      rootElement.appendChild(generateStructure(generator()));
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
