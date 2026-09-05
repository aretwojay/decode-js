import Header from "../components/header.js";
import { syncStoreFromApi } from "../lib/api.js";
import reactive from "../lib/reactive.js";
import { appStore } from "../lib/store.js";
import useOffline from "../lib/use-offline.js";
import { renderCVTemplate } from "../utils/cv.js";

/**
 * CV page - data-driven candidate view
 * Uses the existing appStore + API sync, and updates live on state change.
 */
export default async function PageCV() {
  const offline = useOffline({
    defaultMessage: "Mode hors-ligne : serveur distant indisponible.",
  });

  await offline.execute(() => syncStoreFromApi(appStore));

  return {
    type: "div",
    attributes: [["class", ["page", "page-cv"]]],
    children: [
      Header("/cv"),
      ...offline.getBannerChildren(),
      reactive(appStore, renderCVTemplate),
    ],
  };
}
