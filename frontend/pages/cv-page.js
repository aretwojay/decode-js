import Link from "../components/router/link.js";
import ThemeSwitcher from "../components/theme-switcher.js";
import { syncStoreFromApi } from "../lib/api.js";
import reactive from "../lib/reactive.js";
import { appStore } from "../lib/store.js";
import { renderCVTemplate } from "../utils/cv.js";

/**
 * CV page - data-driven candidate view
 * Uses the existing appStore + API sync, and updates live on state change.
 */
export default async function PageCV() {
  try {
    await syncStoreFromApi(appStore);
  } catch (error) {
    console.warn(
      "[PageCV] API sync failed, keeping current store state:",
      error,
    );
  }

  return {
    type: "div",
    attributes: [["class", ["page", "page-cv"]]],
    children: [
      {
        type: "div",
        attributes: [["class", ["cv-page-header"]]],
        children: [
          {
            type: "nav",
            attributes: [["class", ["cv-breadcrumb"]]],
            children: [
              Link("/", "← Accueil"),
              { type: "span", children: [" | "] },
              Link("/portfolio", "Portfolio"),
              { type: "span", children: [" | "] },
              Link("/experiences", "Expériences"),
              { type: "span", children: [" | "] },
              Link("/contact", "Contact"),
            ],
          },
          ThemeSwitcher(),
        ],
      },
      reactive(appStore, renderCVTemplate),
    ],
  };
}
