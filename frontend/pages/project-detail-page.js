import Header from "../components/header.js";
import Footer from "../components/footer.js";
import { fetchProjectBySlug } from "../lib/api.js";
import { appStore } from "../lib/store.js";
import useOffline from "../lib/use-offline.js";
import {
  resolveProjectDetail,
  renderProjectDetail,
  renderProjectNotFound,
} from "../utils/project-detail.js";
import { updateHead } from "../utils/head-manager.js";

/**
 * Portfolio Dynamic Detail Page Component (T0016)
 * Resolves project entity by dynamic route parameter `:slug`
 * @param {Object} [params] - Route parameters from BrowserRouter
 * @param {string} [params.slug] - Target project slug
 * @returns {Promise<Object>} Vanilla-engine structure object
 */
export default async function PageProjectDetail(params = {}) {
  const slug = params.slug || "";
  const offline = useOffline({
    defaultMessage: "Mode hors-ligne : serveur distant indisponible.",
  });

  const fetchedProject = slug
    ? await offline.execute(() => fetchProjectBySlug(slug), { fallback: null })
    : null;

  const isOffline = offline.isOffline();
  const storeState = isOffline
    ? appStore.getState
      ? appStore.getState()
      : appStore.get()
    : null;
  const storeProjects = storeState?.projects || [];

  // Resolve project via API or local store fallback cascade
  const { project, status } = resolveProjectDetail(
    slug,
    fetchedProject,
    storeProjects,
  );

  if (isOffline && !fetchedProject && project) {
    offline.setOffline("Mode hors-ligne : projet affiché depuis le cache local.");
  }

  // Dynamic SEO metadata based on resolved project domain entity (T0021)
  if (status === "success" && project) {
    const desc =
      project.resume ||
      (typeof project.description === "string"
        ? project.description.slice(0, 160)
        : "Présentation et architecture du projet.");
    updateHead({
      title: `${project.titre || "Projet"} | Portfolio`,
      description: desc,
      type: "article",
      image: project.image?.url || null,
    });
  } else {
    updateHead({
      title: "Projet introuvable | Portfolio",
      description: `Le projet "${slug}" n'a pas été trouvé ou n'existe plus.`,
      type: "website",
      image: null,
    });
  }

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
        attributes: [
          ["id", "main-content"],
          ["tabindex", "-1"],
          ["class", ["project-detail-main"]],
        ],
        children: [
          ...offline.getBannerChildren(),
          status === "success" && project
            ? renderProjectDetail(project)
            : renderProjectNotFound(slug, offline.isOffline()),
        ],
      },
      Footer(),
    ],
  };
}
