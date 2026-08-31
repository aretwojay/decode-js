import Header from "../components/header.js";
import { fetchProjectBySlug } from "../lib/api.js";
import { appStore } from "../lib/store.js";
import {
  resolveProjectDetail,
  renderProjectDetail,
  renderProjectNotFound,
} from "../utils/project-detail.js";

/**
 * Portfolio Dynamic Detail Page Component (T0016)
 * Resolves project entity by dynamic route parameter `:slug`
 * @param {Object} [params] - Route parameters from BrowserRouter
 * @param {string} [params.slug] - Target project slug
 * @returns {Promise<Object>} Vanilla-engine structure object
 */
export default async function PageProjectDetail(params = {}) {
  const slug = params.slug || "";
  let fetchedProject = null;

  try {
    if (slug) {
      fetchedProject = await fetchProjectBySlug(slug);
    }
  } catch (err) {
    console.warn(`[PageProjectDetail] Failed to fetch project slug "${slug}" from API:`, err);
  }

  const storeState = appStore.getState ? appStore.getState() : appStore.get();
  const storeProjects = storeState?.projects || [];

  // Resolve project via API or local store fallback cascade
  const { project, status } = resolveProjectDetail(
    slug,
    fetchedProject,
    storeProjects
  );

  return {
    type: "div",
    attributes: [
      ["class", ["page", "page-project-detail"]],
      ["data-slug", slug],
    ],
    children: [
      // Top Navigation Header
      Header("/portfolio"),

      // Main Content Area
      {
        type: "main",
        attributes: [["class", ["project-detail-main"]]],
        children: [
          status === "success" && project
            ? renderProjectDetail(project)
            : renderProjectNotFound(slug),
        ],
      },
    ],
  };
}
