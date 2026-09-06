import BrowserRouter from "./components/router/browser-router.js";
import routes from "./routes/index.js";
import "./lib/string-interpolate.js";
import "./lib/theme.js";
import BackToTop, { initBackToTopVisibility } from "./components/back-to-top.js";
import generateStructure from "./lib/generate-structure.js";

const rootElement = document.getElementById("root");

const routerContainer = document.createElement("div");
rootElement.appendChild(routerContainer);
BrowserRouter(routerContainer, routes);

rootElement.appendChild(generateStructure(BackToTop()));
initBackToTopVisibility();

/* render(rootElement, {
  type: BrowserRouter,
  attributes: [["routes", routes]],
}); */
