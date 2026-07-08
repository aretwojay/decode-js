import generateStructure from "../../lib/generate-structure.js";

export default function HashRouter(rootElement, routes) {
  function refreshPage() {
    const pathname = window.location.hash.slice(1);
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
  window.addEventListener("hashchange", refreshPage);
  refreshPage();
}

export function HashLink(url, title) {
  return {
    type: "a",
    attributes: [["href", "#" + url]],
    children: [title],
  };
}
