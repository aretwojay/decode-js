import Header from "../components/header.js";
import { fetchExperiences } from "../lib/api.js";
import { appStore } from "../lib/store.js";
import createState from "../lib/create-state.js";
import reactive from "../lib/reactive.js";
import {
  DEFAULT_EXPERIENCES,
  extractAllSkills,
  sortExperiencesChronologically,
  renderExperiencesResults,
} from "../utils/experience.js";

/**
 * Experiences Catalogue Page Component (T0015)
 * @returns {Promise<Object>} Vanilla-engine structure object
 */
export default async function PageExperience() {
  let experiences = [];

  try {
    const fetched = await fetchExperiences();
    if (fetched && fetched.length > 0) {
      experiences = fetched;
    }
  } catch (err) {
    console.warn("[PageExperience] API offline, falling back to local store:", err);
  }

  // Fallback to appStore if API returned empty
  if (experiences.length === 0) {
    const storeState = appStore.getState ? appStore.getState() : appStore.get();
    if (storeState?.experiences && storeState.experiences.length > 0) {
      experiences = storeState.experiences;
    } else {
      experiences = DEFAULT_EXPERIENCES;
    }
  }

  const sortedExperiences = sortExperiencesChronologically(experiences);
  const allSkills = extractAllSkills(sortedExperiences);

  // Local reactive state for search and filters
  const filterState = createState({
    search: "",
    skillFilter: "all",
  });

  // Subscribe to update controls when state is reset or changed externally
  filterState.subscribe((state) => {
    if (typeof document === "undefined") return;

    // 1. Synchronize search input without disrupting focus
    const searchInputs = document.querySelectorAll(
      ".page-experiences .search-input"
    );
    searchInputs.forEach((input) => {
      if (input.value !== state.search) {
        input.value = state.search;
      }
    });

    // 2. Synchronize skill filter active pills
    const skillBtns = document.querySelectorAll(
      ".page-experiences [data-skill]"
    );
    skillBtns.forEach((btn) => {
      const val = btn.dataset.skill;
      if (val === state.skillFilter) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  });

  // Reactive node that only replaces the results area (timeline, count), leaving controls mounted and focused
  const reactiveResultsNode = reactive(filterState, (state) =>
    renderExperiencesResults(state, sortedExperiences, filterState.setState)
  );

  return {
    type: "div",
    attributes: [["class", ["page", "page-experiences"]]],
    children: [
      // Top Navigation Header
      Header("/experiences"),

      // Main Content Area
      {
        type: "main",
        children: [
          // Page Title & Header
          {
            type: "header",
            attributes: [["class", ["page-header"]]],
            children: [
              {
                type: "h1",
                attributes: [["class", ["page-title"]]],
                children: ["Expériences Professionnelles"],
              },
              {
                type: "p",
                attributes: [["class", ["page-description"]]],
                children: [
                  "Parcours professionnel, responsabilités exercées, compétences techniques mises en œuvre et réalisations majeures.",
                ],
              },
            ],
          },

          // Stable Filter & Search Controls (Preserves input focus and cursor)
          {
            type: "section",
            attributes: [
              ["class", ["catalogue-controls"]],
              ["aria-label", "Filtres et recherche d'expériences"],
            ],
            children: [
              // Search Bar
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
                      ["placeholder", "Rechercher par poste, entreprise, compétence…"],
                      ["value", filterState.get().search],
                      ["aria-label", "Rechercher une expérience"],
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

              // Skills Filter Pills
              allSkills.length > 0
                ? {
                    type: "div",
                    attributes: [["class", ["filter-section"]]],
                    children: [
                      {
                        type: "span",
                        attributes: [["class", ["filter-heading"]]],
                        children: ["Compétences mobilisées :"],
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
                              ["data-skill", "all"],
                            ],
                            children: ["Toutes"],
                            events: [
                              [
                                "click",
                                () =>
                                  filterState.setState((s) => ({
                                    ...s,
                                    skillFilter: "all",
                                  })),
                              ],
                            ],
                          },
                          ...allSkills.map((skill) => ({
                            type: "button",
                            attributes: [
                              ["class", ["filter-pill"]],
                              ["type", "button"],
                              ["data-skill", skill],
                            ],
                            children: [skill],
                            events: [
                              [
                                "click",
                                () =>
                                  filterState.setState((s) => ({
                                    ...s,
                                    skillFilter:
                                      s.skillFilter === skill ? "all" : skill,
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

          // Reactive Results Area (Timeline, Count, Empty state)
          reactiveResultsNode,
        ],
      },
    ],
  };
}