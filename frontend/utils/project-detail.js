import { NavLink } from "../components/header.js";
import { extractTechnologies } from "./portfolio.js";

/**
 * Resolves a project by slug with fallback cascade: API -> appStore -> not_found
 * @param {string} slug - Target project slug
 * @param {Object|null} fetchedProject - Project returned from API
 * @param {Array} [storeProjects] - Projects from local appStore
 * @returns {{ project: Object|null, status: "success"|"not_found" }}
 */
export function resolveProjectDetail(slug, fetchedProject, storeProjects = []) {
  if (fetchedProject && typeof fetchedProject === "object") {
    return { project: fetchedProject, status: "success" };
  }

  const normalizedSlug = (slug || "").trim().toLowerCase();
  if (!normalizedSlug) {
    return { project: null, status: "not_found" };
  }

  // 1. Search in store projects
  const pool = Array.isArray(storeProjects) ? storeProjects : [];

  const found = pool.find((p) => {
    const pSlug = (p.slug || "").toLowerCase();
    const pId = String(p.id);
    return pSlug === normalizedSlug || pId === normalizedSlug;
  });

  if (found) {
    return { project: found, status: "success" };
  }

  return { project: null, status: "not_found" };
}

/**
 * Formats ISO date string into readable French date
 * @param {string} dateStr
 * @returns {string}
 */
export function formatProjectDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Renders rich description content (handles multiline strings or Strapi 5 rich blocks)
 * @param {string|Array} description
 * @returns {Array<Object>} Array of Vanilla structure objects
 */
export function renderDescriptionContent(description) {
  if (!description) {
    return [
      {
        type: "p",
        attributes: [["class", ["project-detail-desc-empty"]]],
        children: ["Aucune description détaillée n'a été fournie pour ce projet."],
      },
    ];
  }

  if (typeof description === "string") {
    const paragraphs = description
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (paragraphs.length === 0) {
      return [{ type: "p", children: [description] }];
    }

    return paragraphs.map((para) => ({
      type: "p",
      attributes: [["class", ["project-detail-paragraph"]]],
      children: [para],
    }));
  }

  if (Array.isArray(description)) {
    // Strapi 5 blocks structure
    return description.map((block) => {
      if (block.type === "paragraph") {
        const text = (block.children || []).map((c) => c.text || "").join("");
        return {
          type: "p",
          attributes: [["class", ["project-detail-paragraph"]]],
          children: [text],
        };
      }
      if (block.type === "heading") {
        const level = block.level || 2;
        const text = (block.children || []).map((c) => c.text || "").join("");
        return {
          type: `h${level}`,
          children: [text],
        };
      }
      if (block.type === "list") {
        return {
          type: block.format === "ordered" ? "ol" : "ul",
          children: (block.children || []).map((item) => ({
            type: "li",
            children: [(item.children || []).map((c) => c.text || "").join("")],
          })),
        };
      }
      return {
        type: "p",
        children: [JSON.stringify(block)],
      };
    });
  }

  return [{ type: "p", children: [String(description)] }];
}

/**
 * Renders the project detail view structure
 * @param {Object} project - Validated project domain entity
 * @returns {Object} Vanilla-engine structure object
 */
export function renderProjectDetail(project) {
  const techs = extractTechnologies(project);
  const formattedDate = formatProjectDate(project.date_realisation);

  return {
    type: "article",
    attributes: [
      ["class", ["project-detail-card"]],
      ["aria-labelledby", "project-detail-title"],
    ],
    children: [
      // ------------------------------------------
      // Breadcrumb Navigation
      // ------------------------------------------
      {
        type: "nav",
        attributes: [
          ["class", ["project-breadcrumb"]],
          ["aria-label", "Fil d'Ariane"],
        ],
        children: [
          NavLink("/portfolio", "← Retour au catalogue", ["breadcrumb-link"]),
          {
            type: "span",
            attributes: [["class", ["breadcrumb-separator"]]],
            children: [" / "],
          },
          {
            type: "span",
            attributes: [["class", ["breadcrumb-current"]]],
            children: [project.titre || "Projet"],
          },
        ],
      },

      // ------------------------------------------
      // Header Section: Meta Badges, Title, Summary
      // ------------------------------------------
      {
        type: "header",
        attributes: [["class", ["project-detail-header"]]],
        children: [
          {
            type: "div",
            attributes: [["class", ["project-meta-badges"]]],
            children: [
              Boolean(project.en_vedette)
                ? {
                    type: "span",
                    attributes: [["class", ["card-tag-featured"]]],
                    children: ["⭐ En Vedette"],
                  }
                : { type: "span", children: [] },
              formattedDate
                ? {
                    type: "span",
                    attributes: [["class", ["project-date-badge"]]],
                    children: [`🗓️ ${formattedDate}`],
                  }
                : { type: "span", children: [] },
            ],
          },
          {
            type: "h1",
            attributes: [
              ["id", "project-detail-title"],
              ["class", ["project-detail-title"]],
            ],
            children: [project.titre || "Projet sans titre"],
          },
          project.resume
            ? {
                type: "p",
                attributes: [["class", ["project-detail-resume"]]],
                children: [project.resume],
              }
            : { type: "span", children: [] },
        ],
      },

      // ------------------------------------------
      // Media / Cover Image Preview (if present)
      // ------------------------------------------
      project.image && project.image.url
        ? {
            type: "figure",
            attributes: [["class", ["project-detail-media-wrapper"]]],
            children: [
              {
                type: "img",
                attributes: [
                  ["src", project.image.url],
                  [
                    "alt",
                    project.image.alternativeText ||
                      project.titre ||
                      "Illustration du projet",
                  ],
                  ["class", ["project-detail-cover-image"]],
                  ["loading", "lazy"],
                ],
              },
              project.image.caption
                ? {
                    type: "figcaption",
                    attributes: [["class", ["project-media-caption"]]],
                    children: [project.image.caption],
                  }
                : { type: "span", children: [] },
            ],
          }
        : { type: "span", children: [] },

      // ------------------------------------------
      // Technologies & Competences Section
      // ------------------------------------------
      techs.length > 0
        ? {
            type: "section",
            attributes: [
              ["class", ["project-detail-techs-section"]],
              ["aria-label", "Technologies et compétences du projet"],
            ],
            children: [
              {
                type: "h2",
                attributes: [["class", ["project-detail-subtitle"]]],
                children: ["Technologies & Compétences"],
              },
              {
                type: "div",
                attributes: [["class", ["tags-list", "techs-detail-list"]]],
                children: techs.map((t) => ({
                  type: "span",
                  attributes: [["class", ["tag", "tag-large"]]],
                  children: [t],
                })),
              },
            ],
          }
        : { type: "span", children: [] },

      // ------------------------------------------
      // Detailed Content / Description
      // ------------------------------------------
      {
        type: "section",
        attributes: [
          ["class", ["project-detail-body-section"]],
          ["aria-label", "Description détaillée du projet"],
        ],
        children: [
          {
            type: "h2",
            attributes: [["class", ["project-detail-subtitle"]]],
            children: ["Présentation & Architecture"],
          },
          {
            type: "div",
            attributes: [["class", ["project-detail-content-area"]]],
            children: renderDescriptionContent(
              project.descriptionBlocks || project.description
            ),
          },
        ],
      },

      // ------------------------------------------
      // Action Links (Demo, Repo, Contact)
      // ------------------------------------------
      {
        type: "div",
        attributes: [["class", ["project-detail-actions-bar"]]],
        children: [
          project.lien_demo
            ? {
                type: "a",
                attributes: [
                  ["href", project.lien_demo],
                  ["target", "_blank"],
                  ["rel", "noopener noreferrer"],
                  ["class", ["btn", "btn-primary", "action-btn"]],
                ],
                children: ["🚀 Démo Live"],
              }
            : { type: "span", children: [] },
          project.lien_repo
            ? {
                type: "a",
                attributes: [
                  ["href", project.lien_repo],
                  ["target", "_blank"],
                  ["rel", "noopener noreferrer"],
                  ["class", ["btn", "btn-secondary", "action-btn"]],
                ],
                children: ["💻 Dépôt GitHub"],
              }
            : { type: "span", children: [] },
          NavLink(
            "/contact",
            "✉️ Me contacter à propos de ce projet",
            ["btn", "btn-secondary", "action-btn"]
          ),
        ],
      },
    ],
  };
}

/**
 * Renders the 404 Project Not Found view structure
 * @param {string} slug - Missing project slug
 * @returns {Object} Vanilla-engine structure object
 */
export function renderProjectNotFound(slug, isOffline = false) {
  return {
    type: "section",
    attributes: [
      ["class", ["empty-state-card", "not-found-card"]],
      ["role", "alert"],
      ["aria-live", "polite"],
    ],
    children: [
      {
        type: "span",
        attributes: [["class", ["empty-state-icon"]]],
        children: [isOffline ? "📡" : "🔍"],
      },
      {
        type: "h1",
        attributes: [["class", ["empty-state-title"]]],
        children: [
          isOffline ? "Projet indisponible hors-ligne" : "Projet introuvable",
        ],
      },
      {
        type: "p",
        attributes: [["class", ["empty-state-desc"]]],
        children: [
          isOffline
            ? `Impossible de charger le projet « ${slug || "non spécifié"} » car le serveur distant est indisponible et aucun cache local n'est disponible.`
            : `Le projet identifié par le slug « ${slug || "non spécifié"} » n'existe pas ou n'est plus accessible publiquement.`,
        ],
      },
      {
        type: "div",
        attributes: [["class", ["not-found-actions"]]],
        children: [
          ...(isOffline
            ? [
                {
                  type: "button",
                  attributes: [
                    ["class", ["btn", "btn-primary"]],
                    ["type", "button"],
                  ],
                  children: ["🔄 Réessayer la connexion"],
                  events: [
                    [
                      "click",
                      () => {
                        if (typeof window !== "undefined") {
                          window.location.reload();
                        }
                      },
                    ],
                  ],
                },
              ]
            : []),
          NavLink(
            "/portfolio",
            "← Retourner au catalogue de projets",
            [isOffline ? "btn-secondary" : "btn-primary", "btn"],
          ),
          NavLink("/", "Accueil du portfolio", ["btn", "btn-secondary"]),
        ],
      },
    ],
  };
}
