import { NavLink } from "../components/header.js";
import { getTheme } from "../lib/theme.js";
import { extractTechnologies } from "./portfolio.js";


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
      profile?.biographie ||
      storeProfile?.biographie ||
      "Concepteur d'applications web performantes, spécialisé en architectures Vanilla JavaScript modernes, Strapi CMS et écosystèmes réactifs haute disponibilité.",
    isAvailable: profile?.disponible !== undefined ? profile.disponible : true,
    githubUrl: profile?.github || "https://github.com",
    linkedinUrl: profile?.linkedin || "https://linkedin.com",
    candidateEmail: profile?.email || storeProfile?.email || "",
    candidatePhone: profile?.telephone || storeProfile?.telephone || "",
    candidateLocation: profile?.localisation || storeProfile?.localisation || "",
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

  const isIris = getTheme() === "iris";

  if (isIris) {
    const nameParts = candidateName.trim().split(/\s+/);
    const firstName = nameParts[0] || candidateName;
    const lastName = nameParts.slice(1).join(" ");

    return {
      type: "section",
      attributes: [
        ["class", ["hero-section"]],
        ["aria-labelledby", "hero-heading"],
      ],
      children: [
        {
          type: "img",
          attributes: [
            ["src", "/public/iris/Decorations.svg"],
            ["alt", ""],
            ["class", ["hero-sparkles"]],
          ],
        },
        {
          type: "div",
          attributes: [["class", ["hero-text"]]],
          children: [
            {
              type: "h1",
              attributes: [
                ["id", "hero-heading"],
                ["class", ["hero-title"]],
              ],
              children: lastName
                ? [
                    `${firstName} `,
                    {
                      type: "span",
                      attributes: [["class", ["highlight"]]],
                      children: [lastName],
                    },
                  ]
                : [firstName],
            },
            {
              type: "p",
              attributes: [["class", ["hero-subtitle"]]],
              children: [candidateTitle],
            },
            {
              type: "p",
              attributes: [["class", ["hero-bio"]]],
              children: [
                "Développeuse fullstack passionnée par le développement web et l'architecture logicielle, j'aime relever les défis complexes et transformer des idées en produits concrets qui fonctionnent.",
              ],
            },
            {
              type: "div",
              attributes: [["class", ["hero-actions"]]],
              children: [
                NavLink("/#contact", "Contactez - Moi", ["btn", "btn-primary"]),
              ],
            },
          ],
        },
        {
          type: "div",
          attributes: [["class", ["hero-photo-wrap"]]],
          children: [
            {
              type: "img",
              attributes: [
                ["src", "/public/iris/Group%201.svg"],
                ["alt", `Photo de ${candidateName}`],
                ["class", ["hero-photo"]],
              ],
            },
          ],
        },
      ],
    };
  }

  const heroText = {
    type: "div",
    attributes: [["class", ["hero-text"]]],
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

  return {
    type: "section",
    attributes: [
      ["class", ["hero-section"]],
      ["aria-labelledby", "hero-heading"],
    ],
    children: [heroText],
  };
}

/**
 * Renders "À propos" section of Home page
 * @param {Object} candidateData
 * @returns {Object} Vanilla-engine structure object
 */
export function renderAboutSection(candidateData) {
  return {
    type: "section",
    attributes: [
      ["id", "about"],
      ["class", ["section", "about-section"]],
      ["aria-labelledby", "about-heading"],
    ],
    children: [
      {
        type: "div",
        attributes: [["class", ["section-header", "section-header-center"]]],
        children: [
          {
            type: "h2",
            attributes: [["id", "about-heading"], ["class", ["section-title"]]],
            children: ["À propos"],
          },
          {
            type: "p",
            attributes: [["class", ["section-subtitle"]]],
            children: ["Apprenez à me connaître"],
          },
        ],
      },
      {
        type: "p",
        attributes: [["class", ["about-bio"]]],
        children: [
          candidateData.candidateBio ||
            "Développeuse fullstack passionnée par le développement web et l'architecture logicielle.",
        ],
      },
      {
        type: "div",
        attributes: [["class", ["hero-actions", "centered-actions"]]],
        children: [
          NavLink("/cv", "Télécharger mon CV", ["btn", "btn-primary"]),
        ],
      },
    ],
  };
}

const SERVICES = [
  {
    icon: "code",
    emoji: "💻",
    title: "Langages & Frameworks",
    desc: "Les technos avec lesquelles je construis, du front au back. HTML, CSS, JavaScript, Angular, Vue.js, Node.js, PHP / Laravel, PostgreSQL, MySQL.",
  },
  {
    icon: "palette",
    emoji: "🎨",
    title: "Interfaces graphiques & multimédia",
    desc: "Je conçois et j'intègre des interfaces soignées, du visuel jusqu'au code, sur tous les écrans. Figma, Canva, intégration responsive, maquettage, visuels & mise en page.",
  },
  {
    icon: "search",
    emoji: "🔍",
    title: "SEO & performance",
    desc: "Je construis des sites avec une structure propre et des pages rapides, deux bases essentielles pour être bien référencé sur Google.",
  },
];

/**
 * Renders "Ce que je fais" (services) section of Home page
 * @returns {Object} Vanilla-engine structure object
 */
export function renderServicesSection() {
  const isIris = getTheme() === "iris";

  return {
    type: "section",
    attributes: [
      ["id", "services"],
      ["class", ["section", "services-section"]],
      ["aria-labelledby", "services-heading"],
    ],
    children: [
      {
        type: "div",
        attributes: [["class", ["section-header", "section-header-center"]]],
        children: [
          {
            type: "h2",
            attributes: [["id", "services-heading"], ["class", ["section-title"]]],
            children: ["Ce que je fais"],
          },
          {
            type: "p",
            attributes: [["class", ["section-subtitle"]]],
            children: ["Mes services"],
          },
        ],
      },
      {
        type: "div",
        attributes: [["class", ["grid", "services-grid"]]],
        children: SERVICES.map((service) => ({
          type: "div",
          attributes: [["class", ["card", "service-card"]]],
          children: [
            {
              type: "div",
              attributes: [["class", ["service-icon"]]],
              children: isIris
                ? [{ type: "div", attributes: [["class", ["service-icon-glyph", `icon-${service.icon}`]]], children: [] }]
                : [service.emoji],
            },
            {
              type: "h3",
              attributes: [["class", ["card-title"]]],
              children: [service.title],
            },
            {
              type: "p",
              attributes: [["class", ["card-summary"]]],
              children: [service.desc],
            },
          ],
        })),
      },
      {
        type: "div",
        attributes: [["class", ["card", "service-card", "service-card-wide"]]],
        children: [
          {
            type: "div",
            attributes: [["class", ["service-wide-text"]]],
            children: [
              {
                type: "div",
                attributes: [["class", ["service-icon"]]],
                children: isIris
                  ? [{ type: "div", attributes: [["class", ["service-icon-glyph", "icon-cloud"]]], children: [] }]
                  : ["☁️"],
              },
              {
                type: "h3",
                attributes: [["class", ["card-title"]]],
                children: ["Déploiement & cloud"],
              },
              {
                type: "p",
                attributes: [["class", ["card-summary"]]],
                children: [
                  "Développer une appli, c'est bien ; la mettre en ligne et la faire tourner de façon fiable, c'est ce qui compte vraiment. Mise en production de bout en bout : hébergement, services cloud, envoi d'emails et sécurisation de l'application une fois en ligne. Git / GitHub • Docker • Mise en production • Webhooks • Sécurité des accès.",
                ],
              },
            ],
          },
          isIris
            ? { type: "img", attributes: [["src", "/public/iris/cloud.png"], ["alt", ""], ["class", ["service-wide-image"]]] }
            : { type: "span", children: [] },
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
  const isIris = getTheme() === "iris";

  return {
    type: "section",
    attributes: [
      ["class", ["section", "featured-section"]],
      ["aria-labelledby", "featured-heading"],
    ],
    children: [
      {
        type: "div",
        attributes: [["class", ["section-header", ...(isIris ? ["section-header-center"] : [])]]],
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
                  isIris
                    ? "Mes projets"
                    : hasFeatured
                    ? "Projets en Vedette"
                    : "Projets Récents",
                ],
              },
              {
                type: "p",
                attributes: [["class", ["section-subtitle"]]],
                children: [
                  isIris
                    ? "Une partie de mon travail"
                    : hasFeatured
                    ? "Sélection de réalisations techniques et architectures logicielles"
                    : "Aperçu des derniers projets publiés",
                ],
              },
            ],
          },
          isIris
            ? { type: "span", children: [] }
            : NavLink("/portfolio", "Voir tout le catalogue →", ["section-link"]),
        ],
      },
      {
        type: "div",
        attributes: [["class", ["grid", "projects-grid"]]],
        children: projectsToDisplay.map((project, index) => {
          const projectTags =
            project.competences && project.competences.length > 0
              ? project.competences.map((c) => c.titre || c.name || c)
              : extractTechnologies(project);

          const coverImage =
            Array.isArray(project.image) && project.image.length > 0
              ? project.image[0].formats?.small?.url || project.image[0].url
              : null;

          if (isIris) {
            return {
              type: "div",
              attributes: [["class", ["project-card-wrap"]]],
              children: [
                {
                  type: "span",
                  attributes: [["class", ["project-index"]]],
                  children: [`Projet ${index + 1}`],
                },
                NavLink(
                  `/portfolio#project-${project.slug || project.id}`,
                  [
                    coverImage
                      ? {
                          type: "img",
                          attributes: [
                            ["src", coverImage],
                            ["alt", project.titre || "Projet"],
                            ["class", ["project-cover"]],
                          ],
                        }
                      : { type: "span", children: [] },
                    {
                      type: "div",
                      attributes: [["class", ["project-card-body"]]],
                      children: [
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
                      ],
                    },
                  ],
                  ["card", "project-card"]
                ),
              ],
            };
          }

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
      isIris
        ? {
            type: "div",
            attributes: [["class", ["hero-actions", "centered-actions"]]],
            children: [NavLink("/portfolio", "Voir plus", ["btn", "btn-primary"])],
          }
        : { type: "div", children: [] },
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
  const isIris = getTheme() === "iris";

  if (isIris) {
    return {
      type: "footer",
      attributes: [["class", ["site-footer", "site-footer-iris"]]],
      children: [
        {
          type: "div",
          attributes: [["class", ["footer-find-me"]]],
          children: [
            { type: "span", children: ["Retrouver moi sur :"] },
            {
              type: "a",
              attributes: [
                ["href", "#"],
                ["target", "_blank"],
                ["rel", "noopener noreferrer"],
                ["class", ["footer-icon-link"]],
                ["aria-label", "Instagram"],
              ],
              children: [{ type: "div", attributes: [["class", ["footer-icon", "icon-instagram"]]], children: [] }],
            },
            { type: "span", attributes: [["class", ["footer-sep"]]], children: ["|"] },
            {
              type: "a",
              attributes: [
                ["href", linkedinUrl],
                ["target", "_blank"],
                ["rel", "noopener noreferrer"],
                ["class", ["footer-icon-link"]],
                ["aria-label", "LinkedIn"],
              ],
              children: [{ type: "div", attributes: [["class", ["footer-icon", "icon-linkedin"]]], children: [] }],
            },
          ],
        },
        {
          type: "div",
          attributes: [["class", ["footer-handle"]]],
          children: [
            { type: "span", children: ["@irisayivodjiDev"] },
            {
              type: "a",
              attributes: [
                ["href", githubUrl],
                ["target", "_blank"],
                ["rel", "noopener noreferrer"],
                ["class", ["footer-icon-link"]],
                ["aria-label", "GitHub"],
              ],
              children: [{ type: "div", attributes: [["class", ["footer-icon", "icon-github"]]], children: [] }],
            },
          ],
        },
      ],
    };
  }

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
