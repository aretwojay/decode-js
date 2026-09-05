import Header from "../components/header.js";
import { fetchProjects } from "../lib/api.js";
import { appStore } from "../lib/store.js";
import createState from "../lib/create-state.js";
import reactive from "../lib/reactive.js";
import { getTheme } from "../lib/theme.js";
import useOffline from "../lib/use-offline.js";
import {
  extractAllTechnologies,
  renderProjectsGrid,
  renderPortfolioIris,
} from "../utils/portfolio.js";

/**
 * Portfolio Catalogue Page Component (T0015)
 * @returns {Promise<Object>} Vanilla-engine structure object
 */
export default async function PagePortfolio() {
  const offline = useOffline({
    defaultMessage: "Mode hors-ligne : serveur distant indisponible.",
  });
  const currentTheme = getTheme();

  let projects = await offline.execute(
    () => fetchProjects({ theme: currentTheme }),
    { fallback: [] },
  );

  // Only fall back to local cache if offline
  if (offline.isOffline()) {
    const storeState = appStore.getState ? appStore.getState() : appStore.get();
    if (storeState?.projects && storeState.projects.length > 0) {
      projects = storeState.projects;
      offline.setOffline(
        "Mode hors-ligne : projets affichés depuis le cache local.",
      );
    }
  }

  if (currentTheme === "iris") {
    return {
      type: "div",
      attributes: [["class", ["page", "page-portfolio"]]],
      children: [
        Header("/portfolio"),
        ...offline.getBannerChildren(),
        renderPortfolioIris(projects),
      ],
    };
  }

  const allTechs = extractAllTechnologies(projects);

  // Local reactive state for search and filters
  const filterState = createState({
    search: "",
    techFilter: "all",
    statusFilter: "all",
  });

  // Subscribe to update controls when state is reset or changed externally
  filterState.subscribe((state) => {
    if (typeof document === "undefined") return;

    // 1. Synchronize search input without disrupting focus if already matching
    const searchInputs = document.querySelectorAll(
      ".page-portfolio .search-input",
    );
    searchInputs.forEach((input) => {
      if (input.value !== state.search) {
        input.value = state.search;
      }
    });

    // 2. Synchronize status filter active pills
    const statusBtns = document.querySelectorAll(
      ".page-portfolio [data-status]",
    );
    statusBtns.forEach((btn) => {
      const val = btn.dataset.status;
      if (val === state.statusFilter) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // 3. Synchronize technology filter active pills
    const techBtns = document.querySelectorAll(".page-portfolio [data-tech]");
    techBtns.forEach((btn) => {
      const val = btn.dataset.tech;
      if (val === state.techFilter) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  });

  // Reactive node that only replaces the grid and metadata, leaving controls mounted and focused
  const reactiveGridNode = reactive(filterState, (state) =>
    renderProjectsGrid(state, projects, filterState.setState),
  );

  return {
    type: "div",
    attributes: [["class", ["page", "page-portfolio"]]],
    children: [
      // Top Navigation Header
      Header("/portfolio"),

      // Main Content Area
      {
        type: "main",
        children: [
          ...offline.getBannerChildren(),

          // Page Title & Header
          {
            type: "header",
            attributes: [["class", ["page-header"]]],
            children: [
              {
                type: "h1",
                attributes: [["class", ["page-title"]]],
                children: ["Portfolio & Projets"],
              },
              {
                type: "p",
                attributes: [["class", ["page-description"]]],
                children: [
                  "Explorez les projets réalisés, les architectures logicielles conçues et les démonstrations techniques développées.",
                ],
              },
            ],
          },

          // Stable Filter & Search Controls (Preserves input focus and cursor)
          {
            type: "section",
            attributes: [
              ["class", ["catalogue-controls"]],
              ["aria-label", "Filtres et recherche de projets"],
            ],
            children: [
              // Search Input Box
              {
                type: "div",
                attributes: [["class", ["search-bar-wrapper"]]],
                children: [
                  {
                    type: "span",
                    attributes: [["class", ["search-icon"]]],
                    children: ["🔍"],
                  },
                  {
                    type: "input",
                    attributes: [
                      ["type", "text"],
                      ["class", ["search-input"]],
                      [
                        "placeholder",
                        "Rechercher par mot-clé, titre, technologie…",
                      ],
                      ["value", filterState.get().search],
                      ["aria-label", "Rechercher un projet"],
                    ],
                    events: [
                      [
                        "input",
                        (e) => {
                          filterState.setState((s) => ({
                            ...s,
                            search: e.target.value,
                          }));
                        },
                      ],
                    ],
                  },
                ],
              },

              // Status Filter Pills
              {
                type: "div",
                attributes: [["class", ["filter-section"]]],
                children: [
                  {
                    type: "span",
                    attributes: [["class", ["filter-heading"]]],
                    children: ["Filtrer par visibilité :"],
                  },
                  {
                    type: "div",
                    attributes: [["class", ["filter-pills-list"]]],
                    children: [
                      {
                        type: "button",
                        attributes: [
                          ["class", ["filter-pill", "active"]],
                          ["type", "button"],
                          ["data-status", "all"],
                        ],
                        children: ["Tous les projets"],
                        events: [
                          [
                            "click",
                            () =>
                              filterState.setState((s) => ({
                                ...s,
                                statusFilter: "all",
                              })),
                          ],
                        ],
                      },
                      {
                        type: "button",
                        attributes: [
                          ["class", ["filter-pill"]],
                          ["type", "button"],
                          ["data-status", "en_vedette"],
                        ],
                        children: ["⭐ En vedette"],
                        events: [
                          [
                            "click",
                            () =>
                              filterState.setState((s) => ({
                                ...s,
                                statusFilter:
                                  s.statusFilter === "en_vedette"
                                    ? "all"
                                    : "en_vedette",
                              })),
                          ],
                        ],
                      },
                    ],
                  },
                ],
              },

              // Technology Filter Pills
              allTechs.length > 0
                ? {
                    type: "div",
                    attributes: [["class", ["filter-section"]]],
                    children: [
                      {
                        type: "span",
                        attributes: [["class", ["filter-heading"]]],
                        children: ["Technologies & Compétences :"],
                      },
                      {
                        type: "div",
                        attributes: [["class", ["filter-pills-list"]]],
                        children: [
                          {
                            type: "button",
                            attributes: [
                              ["class", ["filter-pill", "active"]],
                              ["type", "button"],
                              ["data-tech", "all"],
                            ],
                            children: ["Toutes"],
                            events: [
                              [
                                "click",
                                () =>
                                  filterState.setState((s) => ({
                                    ...s,
                                    techFilter: "all",
                                  })),
                              ],
                            ],
                          },
                          ...allTechs.map((tech) => ({
                            type: "button",
                            attributes: [
                              ["class", ["filter-pill"]],
                              ["type", "button"],
                              ["data-tech", tech],
                            ],
                            children: [tech],
                            events: [
                              [
                                "click",
                                () =>
                                  filterState.setState((s) => ({
                                    ...s,
                                    techFilter:
                                      s.techFilter === tech ? "all" : tech,
                                  })),
                              ],
                            ],
                          })),
                        ],
                      },
                    ],
                  }
                : { type: "span", children: [] },
            ],
          },

          // Reactive Results Area (Grid, Empty state, Counter)
          reactiveGridNode,
        ],
      },
    ],
  };
}
