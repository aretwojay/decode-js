import BrowserRouter from "./components/router/browser-router.js";
import routes from "./routes/index.js";

const rootElement = document.getElementById("root");
BrowserRouter(rootElement, routes);

/* render(rootElement, {
  type: BrowserRouter,
  attributes: [["routes", routes]],
}); */
