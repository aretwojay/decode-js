import { NavLink } from "../components/header.js";

/**
 * Fallback showcase projects for home landing page
 */
export const DEFAULT_HOME_PROJECTS = [
  {
    id: 101,
    slug: "vanilla-spa-engine",
    titre: "Vanilla SPA Engine & Architecture MVC",
    resume:
      "Moteur de rendu frontend réactif complet en JavaScript pur (ES Modules), sans aucun framework ni dépendance externe.",
    en_vedette: true,
    competences: [
      { id: 1, titre: "JavaScript ES6+" },
      { id: 2, titre: "Reactive State" },
      { id: 3, titre: "SPA Router" },
    ],
  },
  {
    id: 102,
    slug: "strapi-headless-cms",
    titre: "CMS Headless Strapi 5 & API Sécurisée",
    resume:
      "Modélisation de données d'entreprise, contrôleurs personnalisés avec assainissement, validation stricte et ingestion contrôlée.",
    en_vedette: true,
    competences: [
      { id: 4, titre: "Strapi 5" },
      { id: 5, titre: "TypeScript" },
      { id: 6, titre: "REST API" },
    ],
  },
];

/**
 * Resolves candidate profile fields with fallbacks
 * @param {Object} profile
 * @param {Object} storeProfile
 * @returns {Object}
 */
export function resolveCandidateProfile(profile, storeProfile) {
  return {
    candidateName: profile?.nom || storeProfile?.nom || "Ruben Kabangamuya",
    candidateTitle:
      profile?.titre ||
      storeProfile?.titre ||
      "Ingénieur Fullstack & Développeur Web",
    candidateBio:
      profile?.bio ||
      storeProfile?.bio ||
      "Concepteur d'applications web performantes, spécialisé en architectures Vanilla JavaScript modernes, Strapi CMS et écosystèmes réactifs haute disponibilité.",
    isAvailable: profile?.disponible !== undefined ? profile.disponible : true,
    githubUrl: profile?.github || "https://github.com",
    linkedinUrl: profile?.linkedin || "https://linkedin.com",
  };
}

/**
 * Resolves list of projects to showcase on the home landing
 * @param {Array} featuredProjects
 * @param {Array} allProjects
 * @param {Array} storeProjects
 * @returns {{ projectsToDisplay: Array, hasFeatured: boolean }}
 */
export function resolveProjectsToDisplay(
  featuredProjects = [],
  allProjects = [],
  storeProjects = []
) {
  const hasFeatured = featuredProjects.length > 0;
  const projectsToDisplay = hasFeatured
    ? featuredProjects
    : allProjects.length > 0
    ? allProjects.slice(0, 3)
    : storeProjects && storeProjects.length > 0
    ? storeProjects.slice(0, 3)
    : DEFAULT_HOME_PROJECTS;

  return { projectsToDisplay, hasFeatured };
}

/**
 * Renders Hero section of Home page
 * @param {Object} candidateData
 * @returns {Object} Vanilla-engine structure object
 */
export function renderHeroSection(candidateData) {
  const { candidateName, candidateTitle, candidateBio, isAvailable } =
    candidateData;

  return {
    type: "section",
    attributes: [
      ["class", ["hero-section"]],
      ["aria-labelledby", "hero-heading"],
    ],
    children: [
      {
        type: "div",
        attributes: [["class", ["hero-badge-container"]]],
        children: [
          {
            type: "span",
            attributes: [["class", ["availability-badge"]]],
            children: [
              {
                type: "span",
                attributes: [["class", ["badge-dot"]]],
                children: [],
              },
              isAvailable
                ? "Disponible pour de nouvelles opportunités"
                : "En mission actuellement",
            ],
          },
        ],
      },
      {
        type: "h1",
        attributes: [
          ["id", "hero-heading"],
          ["class", ["hero-title"]],
        ],
        children: [
          "Bonjour, je suis ",
          {
            type: "span",
            attributes: [["class", ["highlight"]]],
            children: [candidateName],
          },
          ".",
        ],
      },
      {
        type: "p",
        attributes: [["class", ["hero-subtitle"]]],
        children: [candidateTitle],
      },
      {
        type: "p",
        attributes: [["class", ["hero-bio"]]],
        children: [candidateBio],
      },
      {
        type: "div",
        attributes: [["class", ["hero-actions"]]],
        children: [
          NavLink("/portfolio", "Explorer les Projets →", ["btn", "btn-primary"]),
          NavLink("/cv", "Consulter mon CV", ["btn", "btn-secondary"]),
          NavLink("/contact", "Me Contacter", ["btn", "btn-secondary"]),
        ],
      },
    ],
  };
}

/**
 * Renders Featured Projects section of Home page
 * @param {Array} projectsToDisplay
 * @param {boolean} hasFeatured
 * @returns {Object} Vanilla-engine structure object
 */
export function renderFeaturedSection(projectsToDisplay, hasFeatured) {
  return {
    type: "section",
    attributes: [
      ["class", ["section", "featured-section"]],
      ["aria-labelledby", "featured-heading"],
    ],
    children: [
      {
        type: "div",
        attributes: [["class", ["section-header"]]],
        children: [
          {
            type: "div",
            children: [
              {
                type: "h2",
                attributes: [
                  ["id", "featured-heading"],
                  ["class", ["section-title"]],
                ],
                children: [
                  hasFeatured ? "Projets en Vedette" : "Projets Récents",
                ],
              },
              {
                type: "p",
                attributes: [["class", ["section-subtitle"]]],
                children: [
                  hasFeatured
                    ? "Sélection de réalisations techniques et architectures logicielles"
                    : "Aperçu des derniers projets publiés",
                ],
              },
            ],
          },
          NavLink("/portfolio", "Voir tout le catalogue →", ["section-link"]),
        ],
      },
      {
        type: "div",
        attributes: [["class", ["grid", "projects-grid"]]],
        children: projectsToDisplay.map((project) => {
          const projectTags =
            project.competences && project.competences.length > 0
              ? project.competences.map((c) => c.titre || c.name || c)
              : Array.isArray(project.technologies)
              ? project.technologies
              : [];

          return {
            type: "article",
            attributes: [["class", ["card", "project-card"]]],
            children: [
              Boolean(project.en_vedette)
                ? {
                    type: "span",
                    attributes: [["class", ["card-tag-featured"]]],
                    children: ["⭐ En Vedette"],
                  }
                : { type: "span", children: [] },
              {
                type: "h3",
                attributes: [["class", ["card-title"]]],
                children: [project.titre || "Projet"],
              },
              {
                type: "p",
                attributes: [["class", ["card-summary"]]],
                children: [
                  project.resume ||
                    (typeof project.description === "string"
                      ? project.description
                      : "Architecture et réalisation technique."),
                ],
              },
              projectTags.length > 0
                ? {
                    type: "div",
                    attributes: [["class", ["tags-list"]]],
                    children: projectTags.map((tag) => ({
                      type: "span",
                      attributes: [["class", ["tag"]]],
                      children: [
                        typeof tag === "string"
                          ? tag
                          : tag.titre || tag.name || String(tag),
                      ],
                    })),
                  }
                : { type: "div", children: [] },
              NavLink(
                `/portfolio/${project.slug || project.id}`,
                ["Découvrir le projet →"],
                ["card-footer-link"]
              ),
            ],
          };
        }),
      },
    ],
  };
}

/**
 * Renders Quick Overview / Navigation Cards section
 * @returns {Object} Vanilla-engine structure object
 */
export function renderOverviewSection() {
  return {
    type: "section",
    attributes: [
      ["class", ["section", "overview-section"]],
      ["aria-labelledby", "explore-heading"],
    ],
    children: [
      {
        type: "div",
        attributes: [["class", ["section-header"]]],
        children: [
          {
            type: "h2",
            attributes: [
              ["id", "explore-heading"],
              ["class", ["section-title"]],
            ],
            children: ["Parcours & Sections"],
          },
        ],
      },
      {
        type: "div",
        attributes: [["class", ["overview-grid"]]],
        children: [
          NavLink(
            "/experiences",
            [
              {
                type: "div",
                attributes: [["class", ["overview-card-title"]]],
                children: ["💼 Expériences"],
              },
              {
                type: "p",
                attributes: [["class", ["overview-card-desc"]]],
                children: [
                  "Historique des postes, missions et réalisations professionnelles.",
                ],
              },
            ],
            ["overview-card"]
          ),
          NavLink(
            "/cv",
            [
              {
                type: "div",
                attributes: [["class", ["overview-card-title"]]],
                children: ["📄 Curriculum Vitae"],
              },
              {
                type: "p",
                attributes: [["class", ["overview-card-desc"]]],
                children: [
                  "Vue interactive complète, compétences, diplômes et sélecteur de styles.",
                ],
              },
            ],
            ["overview-card"]
          ),
          NavLink(
            "/contact",
            [
              {
                type: "div",
                attributes: [["class", ["overview-card-title"]]],
                children: ["✉️ Contact"],
              },
              {
                type: "p",
                attributes: [["class", ["overview-card-desc"]]],
                children: [
                  "Formulaire direct relié à l'API d'ingestion sécurisée.",
                ],
              },
            ],
            ["overview-card"]
          ),
        ],
      },
    ],
  };
}

/**
 * Renders Site Footer
 * @param {string} candidateName
 * @param {string} githubUrl
 * @param {string} linkedinUrl
 * @returns {Object} Vanilla-engine structure object
 */
export function renderSiteFooter(candidateName, githubUrl, linkedinUrl) {
  return {
    type: "footer",
    attributes: [["class", ["site-footer"]]],
    children: [
      {
        type: "div",
        children: [
          `© ${new Date().getFullYear()} ${candidateName}. Propulsé par Vanilla-Engine & Strapi 5.`,
        ],
      },
      {
        type: "div",
        attributes: [["class", ["footer-socials"]]],
        children: [
          {
            type: "a",
            attributes: [
              ["href", githubUrl],
              ["target", "_blank"],
              ["rel", "noopener noreferrer"],
              ["class", ["footer-link"]],
            ],
            children: ["GitHub"],
          },
          {
            type: "a",
            attributes: [
              ["href", linkedinUrl],
              ["target", "_blank"],
              ["rel", "noopener noreferrer"],
              ["class", ["footer-link"]],
            ],
            children: ["LinkedIn"],
          },
        ],
      },
    ],
  };
}
