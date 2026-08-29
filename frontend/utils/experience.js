/**
 * Experience Utilities & Render Helpers
 */

/**
 * Fallback experiences dataset for offline / initial states
 */
export const DEFAULT_EXPERIENCES = [
  {
    id: 1,
    titre: "Lead Développeur Frontend & Architecte Vanilla JS",
    entreprise: "Tech Innovation Studio",
    date_debut: "2023-09-01",
    date_fin: "",
    description:
      "Conception intégrale du moteur Vanilla-Engine pour portfolios dynamiques : routage History SPA, gestion d'état réactif par abonnements et moteur d'interpolation de templates sans framework.",
    competences: [
      { id: 1, titre: "Vanilla JS" },
      { id: 2, titre: "Architecture Logicielle" },
      { id: 3, titre: "Performance Web" },
      { id: 4, titre: "Design System" },
    ],
    statut: "publie",
  },
  {
    id: 2,
    titre: "Développeur Fullstack Web & Strapi CMS",
    entreprise: "Digital Horizons Agency",
    date_debut: "2022-03-01",
    date_fin: "2023-08-31",
    description:
      "Développement d'APIs Headless Strapi 5, gestion des permissions granulaires, assainissement des entrées utilisateur, sécurisation des flux et création d'interfaces d'administration personnalisées.",
    competences: [
      { id: 5, titre: "Strapi 5" },
      { id: 6, titre: "TypeScript" },
      { id: 7, titre: "PostgreSQL" },
      { id: 8, titre: "REST API" },
    ],
    statut: "publie",
  },
  {
    id: 3,
    titre: "Intégrateur Web & Développeur UI/UX",
    entreprise: "Creative Studio Paris",
    date_debut: "2020-10-01",
    date_fin: "2022-02-28",
    description:
      "Intégration d'interfaces web responsives conformes aux normes WCAG AA, développement de systèmes de thèmes dynamiques et optimisation des Core Web Vitals.",
    competences: [
      { id: 9, titre: "CSS3 / SASS" },
      { id: 10, titre: "Accessibilité WCAG" },
      { id: 11, titre: "UI/UX Design" },
    ],
    statut: "publie",
  },
];

/**
 * Formats ISO dates into a readable French period string
 * @param {string} startDate
 * @param {string} endDate
 * @returns {{ text: string, isCurrent: boolean }}
 */
export function formatPeriod(startDate, endDate) {
  if (!startDate) return { text: "Période non renseignée", isCurrent: false };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("fr-FR", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const startFormatted = formatDate(startDate);
  const isCurrent = !endDate || endDate.trim() === "";
  const endFormatted = isCurrent ? "Aujourd'hui" : formatDate(endDate);

  return {
    text: `${startFormatted} — ${endFormatted}`,
    isCurrent,
  };
}

/**
 * Extracts skills from an experience entity
 * @param {Object} exp
 * @returns {Array<string>}
 */
export function extractExperienceSkills(exp) {
  if (!exp) return [];
  if (Array.isArray(exp.competences)) {
    return exp.competences
      .map((c) => (typeof c === "string" ? c : c.titre || c.nom || ""))
      .filter(Boolean);
  }
  return [];
}

/**
 * Extracts distinct list of all skills across experiences
 * @param {Array} experiences
 * @returns {Array<string>}
 */
export function extractAllSkills(experiences) {
  const skillSet = new Set();
  for (const exp of experiences) {
    for (const s of extractExperienceSkills(exp)) {
      if (s) skillSet.add(s);
    }
  }
  return Array.from(skillSet).sort();
}

/**
 * Sorts experiences chronologically (most recent start date first)
 * @param {Array} experiences
 * @returns {Array}
 */
export function sortExperiencesChronologically(experiences) {
  return [...experiences].sort((a, b) => {
    const dateA = a.date_debut ? new Date(a.date_debut).getTime() : 0;
    const dateB = b.date_debut ? new Date(b.date_debut).getTime() : 0;
    return dateB - dateA;
  });
}

/**
 * Renders the reactive experiences timeline list and metadata bar
 * @param {Object} state - { search, skillFilter }
 * @param {Array} allExperiences
 * @param {Function} updateState
 * @returns {Object} Vanilla-engine structure object
 */
export function renderExperiencesResults(state, allExperiences, updateState) {
  const { search, skillFilter } = state;
  const searchLower = (search || "").trim().toLowerCase();

  const filteredExperiences = allExperiences.filter((exp) => {
    // Search query match
    if (searchLower) {
      const roleMatch = (exp.titre || "").toLowerCase().includes(searchLower);
      const companyMatch = (exp.entreprise || "").toLowerCase().includes(searchLower);
      const descMatch = (typeof exp.description === "string" ? exp.description : "")
        .toLowerCase()
        .includes(searchLower);
      const skills = extractExperienceSkills(exp);
      const skillMatch = skills.some((s) => s.toLowerCase().includes(searchLower));

      if (!roleMatch && !companyMatch && !descMatch && !skillMatch) {
        return false;
      }
    }

    // Skill filter match
    if (skillFilter && skillFilter !== "all") {
      const skills = extractExperienceSkills(exp);
      if (!skills.includes(skillFilter)) {
        return false;
      }
    }

    return true;
  });

  const hasActiveFilters = searchLower !== "" || (skillFilter && skillFilter !== "all");

  return {
    type: "div",
    attributes: [["class", ["catalogue-results-area"]]],
    children: [
      // ------------------------------------------
      // Metadata & Counter Bar
      // ------------------------------------------
      {
        type: "div",
        attributes: [["class", ["catalogue-meta-bar"]]],
        children: [
          {
            type: "span",
            attributes: [["class", ["catalogue-count"]]],
            children: [
              "Affichage de ",
              {
                type: "strong",
                children: [`${filteredExperiences.length}`],
              },
              ` sur ${allExperiences.length} expérience${allExperiences.length > 1 ? "s" : ""}`,
            ],
          },
          hasActiveFilters
            ? {
                type: "button",
                attributes: [
                  ["class", ["clear-filters-btn"]],
                  ["type", "button"],
                ],
                children: ["✕ Réinitialiser les filtres"],
                events: [
                  [
                    "click",
                    () =>
                      updateState(() => ({
                        search: "",
                        skillFilter: "all",
                      })),
                  ],
                ],
              }
            : { type: "span", children: [] },
        ],
      },

      // ------------------------------------------
      // Experiences Timeline List or Empty State
      // ------------------------------------------
      filteredExperiences.length > 0
        ? {
            type: "div",
            attributes: [
              ["class", ["experience-list"]],
              ["aria-label", "Parcours professionnel chronologique"],
            ],
            children: filteredExperiences.map((exp) => {
              const skills = extractExperienceSkills(exp);
              const period = formatPeriod(exp.date_debut, exp.date_fin);

              return {
                type: "article",
                attributes: [["class", ["experience-card"]]],
                children: [
                  // Card Header: Role & Period Pill
                  {
                    type: "div",
                    attributes: [["class", ["experience-card-header"]]],
                    children: [
                      {
                        type: "div",
                        children: [
                          {
                            type: "h2",
                            attributes: [["class", ["experience-role-title"]]],
                            children: [exp.titre || "Poste professionnel"],
                          },
                          {
                            type: "p",
                            attributes: [["class", ["experience-company-name"]]],
                            children: [exp.entreprise || "Entreprise"],
                          },
                        ],
                      },
                      {
                        type: "span",
                        attributes: [
                          [
                            "class",
                            [
                              "period-pill",
                              period.isCurrent ? "current" : "",
                            ].filter(Boolean),
                          ],
                        ],
                        children: [
                          period.isCurrent ? "🟢 " : "🗓️ ",
                          period.text,
                        ],
                      },
                    ],
                  },

                  // Description
                  {
                    type: "p",
                    attributes: [["class", ["experience-desc"]]],
                    children: [
                      typeof exp.description === "string"
                        ? exp.description
                        : "Détail des missions et réalisations professionnelles.",
                    ],
                  },

                  // Competence Tags
                  skills.length > 0
                    ? {
                        type: "div",
                        attributes: [["class", ["tags-list"]]],
                        children: skills.map((s) => ({
                          type: "span",
                          attributes: [["class", ["tag"]]],
                          children: [s],
                        })),
                      }
                    : { type: "span", children: [] },
                ],
              };
            }),
          }
        : {
            type: "div",
            attributes: [["class", ["empty-state-card"]]],
            children: [
              {
                type: "span",
                attributes: [["class", ["empty-state-icon"]]],
                children: ["💼"],
              },
              {
                type: "h3",
                attributes: [["class", ["empty-state-title"]]],
                children: ["Aucune expérience trouvée"],
              },
              {
                type: "p",
                attributes: [["class", ["empty-state-desc"]]],
                children: [
                  "Aucune expérience ne correspond à votre recherche ou filtre. Essayez avec d'autres mots-clés.",
                ],
              },
              {
                type: "button",
                attributes: [
                  ["class", ["btn", "btn-secondary"]],
                  ["type", "button"],
                ],
                children: ["Réinitialiser les filtres"],
                events: [
                  [
                    "click",
                    () =>
                      updateState(() => ({
                        search: "",
                        skillFilter: "all",
                      })),
                  ],
                ],
              },
            ],
          },
    ],
  };
}
