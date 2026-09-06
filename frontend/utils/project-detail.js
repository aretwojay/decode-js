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
 * Checks if a media item is an image based on mime type or URL extension
 * @param {Object} media
 * @returns {boolean}
 */
export function isImageMedia(media) {
  if (!media || !media.url) return false;
  if (typeof media.mime === "string" && media.mime.startsWith("image/")) {
    return true;
  }
  return /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(media.url);
}

/**
 * Resolves media items list from project.image (array or single object)
 * @param {Array|Object|null} imageField
 * @returns {Array<Object>}
 */
export function extractProjectMedia(imageField) {
  if (!imageField) return [];
  if (Array.isArray(imageField)) {
    return imageField.filter((m) => m && typeof m === "object" && m.url);
  }
  if (typeof imageField === "object" && imageField.url) {
    return [imageField];
  }
  return [];
}

/**
 * Renders the project detail view structure
 * @param {Object} project - Validated project domain entity
 * @returns {Object} Vanilla-engine structure object
 */
export function renderProjectDetail(project) {
  const techs = extractTechnologies(project);
  const formattedDate = formatProjectDate(project.date_realisation);
  const allMedia = extractProjectMedia(project.image);
  const imageMedia = allMedia.filter(isImageMedia);
  const documentMedia = allMedia.filter((m) => !isImageMedia(m));

  // The primary cover image is the first image (if any)
  const coverImage = imageMedia.length > 0 ? imageMedia[0] : null;

  // Display gallery/attachments section if multiple media exist, or if there are attached documents
  const hasGallery = allMedia.length > 1 || documentMedia.length > 0;

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
          NavLink("/", "Accueil", ["breadcrumb-link"]),
          {
            type: "span",
            attributes: [["class", ["breadcrumb-separator"]]],
            children: [" > "],
          },
          NavLink("/portfolio", "Portfolio", ["breadcrumb-link"]),
          {
            type: "span",
            attributes: [["class", ["breadcrumb-separator"]]],
            children: [" > "],
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
      // Cover Media / Main Image Preview (if image exists)
      // ------------------------------------------
      coverImage
        ? {
            type: "figure",
            attributes: [["class", ["project-detail-media-wrapper"]]],
            children: [
              {
                type: "img",
                attributes: [
                  ["src", coverImage.url],
                  [
                    "alt",
                    coverImage.alternativeText ||
                      project.titre ||
                      "Illustration principale du projet",
                  ],
                  ["class", ["project-detail-cover-image"]],
                  ["loading", "lazy"],
                ],
              },
              coverImage.caption
                ? {
                    type: "figcaption",
                    attributes: [["class", ["project-media-caption"]]],
                    children: [coverImage.caption],
                  }
                : { type: "span", children: [] },
            ],
          }
        : { type: "span", children: [] },

      // ------------------------------------------
      // Media Gallery & Attachments Section (displays ALL files)
      // ------------------------------------------
      hasGallery
        ? {
            type: "section",
            attributes: [
              ["class", ["project-detail-gallery-section"]],
              ["aria-label", "Galerie d'illustrations et documents du projet"],
            ],
            children: [
              {
                type: "h2",
                attributes: [["class", ["project-detail-subtitle"]]],
                children: [
                  documentMedia.length > 0 && imageMedia.length === 0
                    ? "Documents & Fichiers associés"
                    : "Galerie & Fichiers associés",
                ],
              },
              {
                type: "div",
                attributes: [["class", ["project-detail-gallery-grid"]]],
                children: allMedia.map((m, idx) => {
                  if (!isImageMedia(m)) {
                    // Document link (PDF, etc.)
                    const isPdf =
                      m.mime === "application/pdf" ||
                      (m.url && m.url.toLowerCase().endsWith(".pdf"));
                    const badgeText = isPdf
                      ? "PDF"
                      : (m.ext || "Fichier").replace(/^\./, "").toUpperCase();

                    return {
                      type: "a",
                      attributes: [
                        ["href", m.url],
                        ["target", "_blank"],
                        ["rel", "noopener noreferrer"],
                        ["class", ["gallery-file-link"]],
                        [
                          "title",
                          `Ouvrir le document : ${m.name || "Document"}`,
                        ],
                      ],
                      children: [
                        {
                          type: "span",
                          attributes: [["class", ["gallery-file-icon"]]],
                          children: [isPdf ? "📄" : "📎"],
                        },
                        {
                          type: "span",
                          attributes: [["class", ["gallery-file-name"]]],
                          children: [m.name || `Document ${idx + 1}`],
                        },
                        {
                          type: "span",
                          attributes: [["class", ["gallery-file-badge"]]],
                          children: [badgeText],
                        },
                      ],
                    };
                  }

                  return {
                    type: "figure",
                    attributes: [["class", ["gallery-item-card"]]],
                    children: [
                      {
                        type: "img",
                        attributes: [
                          [
                            "src",
                            m.formats?.medium?.url ||
                              m.formats?.small?.url ||
                              m.url,
                          ],
                          [
                            "alt",
                            m.alternativeText ||
                              `${project.titre || "Projet"} - Vue ${idx + 1}`,
                          ],
                          ["class", ["gallery-item-img"]],
                          ["loading", "lazy"],
                        ],
                      },
                      m.caption || m.name
                        ? {
                            type: "figcaption",
                            attributes: [["class", ["gallery-item-caption"]]],
                            children: [m.caption || m.name],
                          }
                        : { type: "span", children: [] },
                    ],
                  };
                }),
              },
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
                children: techs.map((t) =>
                  NavLink(
                    `/portfolio?tech=${encodeURIComponent(t)}`,
                    t,
                    ["tag", "tag-large", "tag-clickable"],
                    [["title", `Voir tous les projets utilisant ${t}`]]
                  )
                ),
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
            `/contact?subject=${encodeURIComponent(
              `Discussion sur le projet : ${project.titre || "Projet"}`
            )}`,
            "💬 Discuter de ce projet",
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
