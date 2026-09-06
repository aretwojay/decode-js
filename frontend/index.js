import BrowserRouter from "./components/router/browser-router.js";
import routes from "./routes/index.js";
import "./lib/string-interpolate.js";
import "./lib/theme.js";
import { syncThemeFromProfile } from "./lib/theme.js";
import { initAuth } from "./lib/auth.js";
import { fetchProfile } from "./lib/api.js";
import BackToTop, { initBackToTopVisibility } from "./components/back-to-top.js";
import generateStructure from "./lib/generate-structure.js";

// Initialize and validate Strapi session in background
initAuth();

// Synchronize portfolio default theme from primary Strapi profile on startup
fetchProfile()
  .then((profile) => {
    if (profile) {
      syncThemeFromProfile(profile);
    }
  })
  .catch(() => {});

const rootElement = document.getElementById("root");

const routerContainer = document.createElement("div");
routerContainer.id = "main-content";
routerContainer.setAttribute("tabindex", "-1");
rootElement.appendChild(routerContainer);
BrowserRouter(routerContainer, routes);

rootElement.appendChild(generateStructure(BackToTop()));
initBackToTopVisibility();

/* render(rootElement, {
  type: BrowserRouter,
  attributes: [["routes", routes]],
}); */
