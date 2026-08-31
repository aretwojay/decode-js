import BrowserRouter from "./components/router/browser-router.js";
import routes from "./routes/index.js";
import mountCookieBanner from "./components/cookie-banner.js";
import "./lib/string-interpolate.js";
import "./lib/theme.js";
const rootElement = document.getElementById("root");
BrowserRouter(rootElement, routes);
mountCookieBanner(document.getElementById("cookie-banner-root"));

/* render(rootElement, {
  type: BrowserRouter,
  attributes: [["routes", routes]],
}); */
