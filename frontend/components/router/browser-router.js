import generateStructure from "../../lib/generate-structure.js";

export default function BrowserRouter(rootElement, routes) {
  async function refreshPage() {
    const pathname = window.location.pathname;
    const generator = routes[pathname] ?? routes["*"];
    
    const structure = await generator(); // on attend, que ce soit sync ou async

    if (rootElement.childNodes[0]) {
      rootElement.replaceChild(
        generateStructure(structure),
        rootElement.childNodes[0],
      );
    } else {
      rootElement.appendChild(generateStructure(structure));
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
