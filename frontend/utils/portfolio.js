import { NavLink } from "../components/header.js";

/**
 * Fallback projects dataset for offline / empty store states
 */
export const DEFAULT_PROJECTS = [
  {
    id: 101,
    titre: "Vanilla SPA Engine & Architecture MVC",
    slug: "vanilla-spa-engine",
    resume:
      "Moteur de rendu frontend réactif complet en JavaScript ES Modules pur, sans framework ni dépendances tierces.",
    description:
      "Conception d'une architecture modulaire basée sur le pattern MVC, un routeur SPA History API, un gestionnaire d'état réactif et un compilateur de structures DOM.",
    technologies: ["JavaScript ES6+", "Reactive State", "SPA Router", "CSS3"],
    en_vedette: true,
    statut: "publie",
    date_realisation: "2024-03-15",
    lien_repo: "https://github.com",
    lien_demo: "https://demo.example.com",
  },
  {
    id: 102,
    titre: "CMS Headless Strapi 5 & API Sécurisée",
    slug: "strapi-headless-cms",
    resume:
      "Modélisation de données d'entreprise, contrôleurs personnalisés avec assainissement, validation stricte et ingestion contrôlée.",
    description:
      "Backend Strapi 5 avec collections modulaires, gestion multi-tenant, permissions granulaires et intégration PostgreSQL / SQLite.",
    technologies: ["Strapi 5", "TypeScript", "REST API", "PostgreSQL"],
    en_vedette: true,
    statut: "publie",
    date_realisation: "2024-02-20",
    lien_repo: "https://github.com",
  },
  {
    id: 103,
    titre: "Design System & Thèmes Cyberpunk / Minimal",
    slug: "design-system-themes",
    resume:
      "Système de thèmes modulaires dynamiques (Iris, Ruben, Yaniss) avec basculement d'attributs sans rechargement de page.",
    description:
      "Variables CSS modernes, glassmorphism, conformité accessibilité WCAG AA et animations légères.",
    technologies: ["CSS3", "Design System", "WCAG AA", "Web Components"],
    en_vedette: false,
    statut: "publie",
    date_realisation: "2024-01-10",
  },
  {
    id: 104,
    titre: "Plateforme E-Commerce Interactive",
    slug: "projet-ecommerce",
    resume:
      "Boutique en ligne avec catalogue interactif, filtrage en temps réel et panier réactif.",
    description:
      "Expérience utilisateur fluide intégrant la synchronisation locale du panier, la gestion des stocks et un parcours de commande optimisé.",
    technologies: ["JavaScript", "Strapi", "CSS3", "LocalState"],
    en_vedette: false,
    statut: "publie",
    date_realisation: "2023-11-28",
    lien_repo: "https://github.com",
    lien_demo: "https://shop.example.com",
  },
];

/**
 * Extracts and normalizes technologies from a project item
 * @param {Object} project
 * @returns {Array<string>}
 */
export function extractTechnologies(project) {
  if (!project) return [];
  if (Array.isArray(project.technologies)) {
    return project.technologies;
  }
  if (typeof project.technologies === "string") {
    try {
      const parsed = JSON.parse(project.technologies);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return project.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
  }
  if (Array.isArray(project.competences)) {
    return project.competences.map((c) => c.titre || c.nom || "").filter(Boolean);
  }
  return [];
}

/**
 * Extracts distinct list of all technologies across projects
 * @param {Array} projects
 * @returns {Array<string>}
 */
export function extractAllTechnologies(projects) {
  const techSet = new Set();
  for (const p of projects) {
    for (const t of extractTechnologies(p)) {
      if (t) techSet.add(t);
    }
  }
  return Array.from(techSet).sort();
}

function collectBlockText(node) {
  if (!node) return "";
  if (typeof node.text === "string") return node.text;
  if (Array.isArray(node.children)) return node.children.map(collectBlockText).join("");
  return "";
}

export function extractProjectHighlights(project) {
  const blocks = project?.descriptionBlocks;
  if (!Array.isArray(blocks) || blocks.length === 0) {
    const text = typeof project?.description === "string" ? project.description : "";
    return text ? [text] : [];
  }

  const bullets = [];
  for (const block of blocks) {
    if (block.type === "list" && Array.isArray(block.children)) {
      for (const item of block.children) {
        const text = collectBlockText(item).trim();
        if (text) bullets.push(text);
      }
    } else {
      const text = collectBlockText(block).trim();
      if (text) bullets.push(text);
    }
  }
  return bullets;
}

function scheduleScrollReveal() {
  if (typeof window === "undefined") return;
  setTimeout(() => {
    const blocks = document.querySelectorAll(".portfolio-block");
    if (!blocks.length) return;

    if (typeof IntersectionObserver === "undefined") {
      blocks.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    blocks.forEach((el) => observer.observe(el));
  }, 0);
}

export function renderPortfolioIris(projects) {
  scheduleScrollReveal();

  return {
    type: "main",
    children: [
      {
        type: "section",
        attributes: [["class", ["section", "portfolio-hero-iris"]]],
        children: [
          {
            type: "div",
            attributes: [["class", ["section-header-center"]]],
            children: [
              { type: "h1", attributes: [["class", ["section-title"]]], children: ["Mes projets"] },
              {
                type: "p",
                attributes: [["class", ["section-subtitle", "portfolio-subtitle-large"]]],
                children: ["Tableau de bord Techniques et Réalisations"],
              },
              {
                type: "p",
                attributes: [["class", ["portfolio-lead"]]],
                children: [
                  "Une sélection d'applications web robustes et scalables, mêlant architectures back-end complexes et intégrations front-end.",
                ],
              },
            ],
          },
        ],
      },
      {
        type: "section",
        attributes: [["class", ["section", "portfolio-list-iris"]]],
        children: projects.map((project) => {
          const coverImage =
            Array.isArray(project.image) && project.image.length > 0
              ? project.image[0].formats?.medium?.url || project.image[0].url
              : null;

          const highlights = extractProjectHighlights(project);
          const year = project.date_realisation
            ? String(project.date_realisation).slice(0, 4)
            : null;
          const techs = extractTechnologies(project);

          return {
            type: "article",
            attributes: [
              ["id", `project-${project.slug || project.id}`],
              ["class", ["portfolio-block"]],
            ],
            children: [
              {
                type: "div",
                attributes: [["class", ["portfolio-block-image"]]],
                children: [
                  ...(coverImage
                    ? [{ type: "img", attributes: [["src", coverImage], ["alt", project.titre || "Projet"]] }]
                    : []),
                  ...(techs.length > 0
                    ? [
                        {
                          type: "div",
                          attributes: [["class", ["portfolio-tags"]]],
                          children: techs.map((t) => ({
                            type: "span",
                            attributes: [["class", ["tag"]]],
                            children: [t],
                          })),
                        },
                      ]
                    : []),
                ],
              },
              {
                type: "div",
                attributes: [["class", ["portfolio-block-body"]]],
                children: [
                  {
                    type: "h2",
                    attributes: [["class", ["portfolio-block-title"]]],
                    children: [project.resume || project.titre || "Projet"],
                  },
                  highlights.length > 0
                    ? {
                        type: "ul",
                        attributes: [["class", ["portfolio-highlights"]]],
                        children: highlights.map((h) => ({ type: "li", children: [h] })),
                      }
                    : { type: "span", children: [] },
                  {
                    type: "div",
                    attributes: [["class", ["portfolio-info"]]],
                    children: [
                      {
                        type: "span",
                        attributes: [["class", ["portfolio-info-label"]]],
                        children: ["Info du projet"],
                      },
                      year
                        ? {
                            type: "div",
                            attributes: [["class", ["portfolio-info-row"]]],
                            children: [
                              { type: "span", children: ["Année"] },
                              { type: "span", children: [year] },
                            ],
                          }
                        : { type: "span", children: [] },
                      project.role
                        ? {
                            type: "div",
                            attributes: [["class", ["portfolio-info-row"]]],
                            children: [
                              { type: "span", children: ["Rôle"] },
                              { type: "span", children: [project.role] },
                            ],
                          }
                        : { type: "span", children: [] },
                    ],
                  },
                  {
                    type: "div",
                    attributes: [["class", ["portfolio-block-actions"]]],
                    children: [
                      project.lien_demo
                        ? {
                            type: "a",
                            attributes: [
                              ["href", project.lien_demo],
                              ["target", "_blank"],
                              ["rel", "noopener noreferrer"],
                              ["class", ["portfolio-action-link"]],
                            ],
                            children: ["Voir le projet ↗"],
                          }
                        : { type: "span", children: [] },
                      project.lien_mobile
                        ? {
                            type: "a",
                            attributes: [
                              ["href", project.lien_mobile],
                              ["target", "_blank"],
                              ["rel", "noopener noreferrer"],
                              ["class", ["portfolio-action-link", "portfolio-action-link-alt"]],
                            ],
                            children: ["Télécharger l'app mobile ▶"],
                          }
                        : { type: "span", children: [] },
                    ],
                  },
                ],
              },
            ],
          };
        }),
      },
    ],
  };
}

/**
 * Renders the reactive projects grid and metadata count bar
 * @param {Object} state - { search, techFilter, statusFilter }
 * @param {Array} allProjects
 * @param {Function} updateState
 * @returns {Object} Vanilla-engine structure object
 */
export function renderProjectsGrid(state, allProjects, updateState) {
  const { search, techFilter, statusFilter } = state;
  const searchLower = (search || "").trim().toLowerCase();

  const filteredProjects = allProjects.filter((p) => {
    // Search query match
    if (searchLower) {
      const titleMatch = (p.titre || "").toLowerCase().includes(searchLower);
      const resumeMatch = (p.resume || "").toLowerCase().includes(searchLower);
      const descMatch = (typeof p.description === "string" ? p.description : "")
        .toLowerCase()
        .includes(searchLower);
      const techs = extractTechnologies(p);
      const techMatch = techs.some((t) => t.toLowerCase().includes(searchLower));

      if (!titleMatch && !resumeMatch && !descMatch && !techMatch) {
        return false;
      }
    }

    // Technology filter match
    if (techFilter && techFilter !== "all") {
      const techs = extractTechnologies(p);
      if (!techs.includes(techFilter)) {
        return false;
      }
    }

    // Status filter match
    if (statusFilter === "en_vedette") {
      if (!p.en_vedette) return false;
    } else if (statusFilter && statusFilter !== "all") {
      if (p.statut !== statusFilter) return false;
    }

    return true;
  });

  const hasActiveFilters =
    searchLower !== "" || techFilter !== "all" || statusFilter !== "all";

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
                children: [`${filteredProjects.length}`],
              },
              ` sur ${allProjects.length} projet${allProjects.length > 1 ? "s" : ""}`,
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
                        techFilter: "all",
                        statusFilter: "all",
                      })),
                  ],
                ],
              }
            : { type: "span", children: [] },
        ],
      },

      // ------------------------------------------
      // Projects Grid or Empty State
      // ------------------------------------------
      filteredProjects.length > 0
        ? {
            type: "div",
            attributes: [
              ["class", ["grid"]],
              ["aria-label", "Liste des projets du portfolio"],
            ],
            children: filteredProjects.map((project) => {
              const techs = extractTechnologies(project);
              const projectSlug = project.slug || `projet-${project.id}`;

              return {
                type: "article",
                attributes: [["class", ["card"]]],
                children: [
                  {
                    type: "div",
                    children: [
                      Boolean(project.en_vedette)
                        ? {
                            type: "span",
                            attributes: [["class", ["card-tag-featured"]]],
                            children: ["⭐ En vedette"],
                          }
                        : { type: "span", children: [] },
                      {
                        type: "h2",
                        attributes: [["class", ["card-title"]]],
                        children: [project.titre || "Projet sans titre"],
                      },
                      {
                        type: "p",
                        attributes: [["class", ["card-summary"]]],
                        children: [
                          project.resume ||
                            (typeof project.description === "string"
                              ? project.description
                              : "Consultez la fiche détaillée pour plus d'informations."),
                        ],
                      },
                      techs.length > 0
                        ? {
                            type: "div",
                            attributes: [["class", ["tags-list"]]],
                            children: techs.map((t) => ({
                              type: "span",
                              attributes: [["class", ["tag"]]],
                              children: [t],
                            })),
                          }
                        : { type: "span", children: [] },
                    ],
                  },

                  // Card Actions & Links
                  {
                    type: "div",
                    attributes: [["class", ["card-footer-wrapper"]]],
                    children: [
                      NavLink(
                        `/portfolio/${projectSlug}`,
                        ["Détails du projet →"],
                        ["card-footer-link"]
                      ),
                      (project.lien_repo || project.lien_demo)
                        ? {
                            type: "div",
                            attributes: [["class", ["card-actions"]]],
                            children: [
                              project.lien_demo
                                ? {
                                    type: "a",
                                    attributes: [
                                      ["href", project.lien_demo],
                                      ["target", "_blank"],
                                      ["rel", "noopener noreferrer"],
                                      ["class", ["card-action-link"]],
                                    ],
                                    children: ["🚀 Démo live"],
                                  }
                                : { type: "span", children: [] },
                              project.lien_repo
                                ? {
                                    type: "a",
                                    attributes: [
                                      ["href", project.lien_repo],
                                      ["target", "_blank"],
                                      ["rel", "noopener noreferrer"],
                                      [
                                        "class",
                                        ["card-action-link", "card-action-secondary"],
                                      ],
                                    ],
                                    children: ["💻 GitHub"],
                                  }
                                : { type: "span", children: [] },
                            ].filter(Boolean),
                          }
                        : { type: "span", children: [] },
                    ],
                  },
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
                children: ["🔎"],
              },
              {
                type: "h3",
                attributes: [["class", ["empty-state-title"]]],
                children: ["Aucun projet trouvé"],
              },
              {
                type: "p",
                attributes: [["class", ["empty-state-desc"]]],
                children: [
                  "Aucun projet ne correspond à vos critères de recherche ou filtres actuels. Essayez d'ajuster les termes recherchés ou réinitialisez les filtres.",
                ],
              },
              {
                type: "button",
                attributes: [
                  ["class", ["btn", "btn-secondary"]],
                  ["type", "button"],
                ],
                children: ["Réinitialiser la recherche"],
                events: [
                  [
                    "click",
                    () =>
                      updateState(() => ({
                        search: "",
                        techFilter: "all",
                        statusFilter: "all",
                      })),
                  ],
                ],
              },
            ],
          },
    ],
  };
}
