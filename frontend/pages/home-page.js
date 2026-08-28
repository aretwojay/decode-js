import Link from "../components/router/link.js";
import ThemeSwitcher from "../components/theme-switcher.js";
import { fetchProfile, fetchProjects } from "../lib/api.js";
import { appStore } from "../lib/store.js";

/**
 * Creates an accessible client-side link element with custom classes and children
 * @param {string} url
 * @param {Array|string} children
 * @param {Array<string>} [classNames=[]]
 * @param {Array} [extraAttrs=[]]
 * @returns {Object} Vanilla-engine structure object
 */
function NavLink(url, children, classNames = [], extraAttrs = []) {
  return {
    type: "a",
    attributes: [
      ["href", url],
      ["class", Array.isArray(classNames) ? classNames : [classNames]],
      ...extraAttrs,
    ],
    events: [
      [
        "click",
        (event) => {
          event.preventDefault();
          window.history.pushState({}, undefined, url);
          window.dispatchEvent(new Event("pushstate"));
        },
      ],
    ],
    children: Array.isArray(children) ? children : [children],
  };
}

/**
 * Single-Page Landing View (T0014)
 * Complete root route featuring Hero, Featured Projects, Quick Actions, and Theme Switcher
 * @returns {Promise<Object>} Vanilla-engine structure object
 */
export default async function PageHome() {
  // 1. Fetch live data with graceful offline/store fallback
  let profile = null;
  let featuredProjects = [];

  try {
    const [fetchedProfile, fetchedProjects] = await Promise.all([
      fetchProfile(),
      fetchProjects({ featured: true }),
    ]);

    profile = fetchedProfile;
    featuredProjects = fetchedProjects || [];
  } catch (err) {
    console.warn("[PageHome] API offline, falling back to appStore:", err);
  }

  const storeState = appStore.getState ? appStore.getState() : appStore.get();
  
  // Resolve Candidate Profile
  const candidateName =
    profile?.nom || storeState?.profile?.name || "Ruben Kabangamuya";
  const candidateTitle =
    profile?.titre || storeState?.profile?.title || "Ingénieur Fullstack & Développeur Web";
  const candidateBio =
    profile?.bio ||
    storeState?.profile?.bio ||
    "Concepteur d'applications web performantes, spécialisé en architectures Vanilla JavaScript modernes, Strapi CMS et écosystèmes réactifs haute disponibilité.";
  const isAvailable =
    profile?.disponible !== undefined ? profile.disponible : true;
  const githubUrl = profile?.github || "https://github.com";
  const linkedinUrl = profile?.linkedin || "https://linkedin.com";

  // Resolve Featured Projects (with fallback showcase if empty)
  const projectsToDisplay =
    featuredProjects.length > 0
      ? featuredProjects
      : (storeState?.projects && storeState.projects.length > 0
          ? storeState.projects.slice(0, 3)
          : [
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
            ]);

  return {
    type: "div",
    attributes: [["class", ["page", "page-home"]]],
    children: [
      // ==========================================
      // Header & Navigation Bar
      // ==========================================
      {
        type: "header",
        attributes: [["class", ["site-header"]]],
        children: [
          NavLink(
            "/",
            [
              {
                type: "span",
                attributes: [["class", ["site-logo"]]],
                children: ["⚡ Portfolio.js"],
              },
            ],
            ["logo-link"]
          ),
          {
            type: "nav",
            attributes: [["class", ["main-nav"]], ["aria-label", "Navigation principale"]],
            children: [
              NavLink("/", "Accueil", ["nav-link", "active"]),
              NavLink("/portfolio", "Portfolio", ["nav-link"]),
              NavLink("/experiences", "Expériences", ["nav-link"]),
              NavLink("/cv", "CV", ["nav-link"]),
              NavLink("/contact", "Contact", ["nav-link"]),
            ],
          },
          ThemeSwitcher(),
        ],
      },

      // ==========================================
      // Main Content
      // ==========================================
      {
        type: "main",
        children: [
          // ------------------------------------------
          // Hero Section
          // ------------------------------------------
          {
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
          },

          // ------------------------------------------
          // Featured Projects Section
          // ------------------------------------------
          {
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
                        children: ["Projets en Vedette"],
                      },
                      {
                        type: "p",
                        attributes: [["class", ["section-subtitle"]]],
                        children: [
                          "Sélection de réalisations techniques et architectures logicielles",
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
                      {
                        type: "span",
                        attributes: [["class", ["card-tag-featured"]]],
                        children: ["En Vedette"],
                      },
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
                              children: [typeof tag === "string" ? tag : tag.titre || tag.name || String(tag)],
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
          },

          // ------------------------------------------
          // Quick Navigation & Explorer Section
          // ------------------------------------------
          {
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
          },

          // ------------------------------------------
          // Démos & Espace Technique
          // ------------------------------------------
          {
            type: "section",
            attributes: [["class", ["section", "demos-section"]]],
            children: [
              {
                type: "p",
                attributes: [["style", [["color", "var(--text-muted)"], ["fontSize", "0.85rem"]]]],
                children: [
                  "Démos techniques du moteur Vanilla : ",
                  NavLink("/table", "Table Réactive", ["footer-link"]),
                  { type: "span", children: [" • "] },
                  NavLink("/gallery", "Galerie d'Images", ["footer-link"]),
                  { type: "span", children: [" • "] },
                  NavLink("/admin", "Espace Admin Strapi", ["footer-link"]),
                ],
              },
            ],
          },
        ],
      },

      // ==========================================
      // Footer
      // ==========================================
      {
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
      },
    ],
  };
}
