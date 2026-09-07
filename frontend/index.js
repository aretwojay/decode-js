import BrowserRouter from "./components/router/browser-router.js";
import routes from "./routes/index.js";
import "./lib/string-interpolate.js";
import "./lib/theme.js";
import { initAuth } from "./lib/auth.js";
import BackToTop, { initBackToTopVisibility } from "./components/back-to-top.js";
import mountCookieBanner from "./components/cookie-banner.js";
import generateStructure from "./lib/generate-structure.js";

// Initialize and validate Strapi session in background
initAuth();

const rootElement = document.getElementById("root");

const routerContainer = document.createElement("div");
routerContainer.id = "main-content";
routerContainer.setAttribute("tabindex", "-1");
rootElement.appendChild(routerContainer);
BrowserRouter(routerContainer, routes);

rootElement.appendChild(generateStructure(BackToTop()));
initBackToTopVisibility();

mountCookieBanner(document.getElementById("cookie-banner-root"));

/* render(rootElement, {
  type: BrowserRouter,
  attributes: [["routes", routes]],
}); */
