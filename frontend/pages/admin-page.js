import Header from "../components/header.js";
import Link from "../components/router/link.js";
import { navigate } from "../utils/navigation.js";
import { isAuthenticated, getCurrentUser } from "../lib/auth.js";
import { renderFeedbackBanner } from "../components/ui-feedback.js";
import {
  fetchMyProfile,
  fetchMyExperiences,
  fetchMyProjects,
  fetchMyCompetences,
  fetchMyServices,
} from "../lib/api.js";

// Modular admin subcomponents
import { AdminAnchorLink } from "../utils/admin/admin-common.js";
import { ProfileForm } from "../utils/admin/admin-profile.js";
import { ProjectsManager } from "../utils/admin/admin-projects.js";
import { ExperiencesManager } from "../utils/admin/admin-experiences.js";
import { CompetencesManager } from "../utils/admin/admin-competences.js";
import { ServicesManager } from "../utils/admin/admin-services.js";

/**
 * PAGE D'ADMINISTRATION PRINCIPALE & ÉDITEUR DE PORTFOLIO
 * Coordonne l'authentification, le chargement des données et la composition des gestionnaires CRUD
 */
export default async function PageAdmin() {
  if (!isAuthenticated()) {
    return {
      type: "div",
      attributes: [["class", ["page", "page-admin"]]],
      children: [
        Header("/admin"),
        {
          type: "main",
          attributes: [
            ["id", "main-content"],
            ["tabindex", "-1"],
          ],
          children: [
            {
              type: "section",
              attributes: [["class", ["admin-unauth-box"]]],
              children: [
                { type: "h1", children: ["Mon compte"] },
                {
                  type: "p",
                  children: [
                    "Connectez-vous pour gérer votre profil, vos projets et vos expériences. ",
                    Link("/login", "Se connecter", ["btn", "btn-primary"]),
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  }

  let profile = null;
  let experiences = [];
  let projects = [];
  let competences = [];
  let services = [];
  const currentUser = getCurrentUser();

  try {
    profile = await fetchMyProfile();

    if (!profile) {
      return {
        type: "div",
        attributes: [["class", ["page", "page-admin"]]],
        children: [
          Header("/admin"),
          {
            type: "main",
            attributes: [
              ["id", "main-content"],
              ["tabindex", "-1"],
            ],
            children: [
              {
                type: "header",
                attributes: [["class", ["admin-main-header"]]],
                children: [
                  {
                    type: "h1",
                    children: ["Bienvenue sur votre espace d'administration"],
                  },
                  {
                    type: "p",
                    children: [
                      `Session active pour `,
                      {
                        type: "strong",
                        children: [
                          currentUser?.username ||
                            currentUser?.email ||
                            "Utilisateur",
                        ],
                      },
                      `. Créez votre profil pour démarrer.`,
                    ],
                  },
                ],
              },
              ProfileForm(null),
            ],
          },
        ],
      };
    }

    const [exp, proj, comp, serv] = await Promise.all([
      fetchMyExperiences(),
      fetchMyProjects(),
      fetchMyCompetences(),
      fetchMyServices(),
    ]);

    experiences = exp || [];
    projects = proj || [];
    competences = comp || [];
    services = serv || [];
  } catch (err) {
    console.error("[PageAdmin] Failed to load admin data:", err);
    return {
      type: "div",
      attributes: [["class", ["page", "page-admin"]]],
      children: [
        Header("/admin"),
        {
          type: "main",
          attributes: [
            ["id", "main-content"],
            ["tabindex", "-1"],
          ],
          children: [
            renderFeedbackBanner({
              type: "error",
              message:
                "Impossible de charger vos données d'administration : " +
                (err.message || "session expirée ou serveur indisponible."),
              actionText: "Se reconnecter",
              onAction: () => navigate("/login"),
            }),
          ],
        },
      ],
    };
  }

  return {
    type: "div",
    attributes: [["class", ["page", "page-admin"]]],
    children: [
      Header("/admin"),
      {
        type: "main",
        attributes: [
          ["id", "main-content"],
          ["tabindex", "-1"],
        ],
        children: [
          {
            type: "header",
            attributes: [["class", ["admin-main-header"]]],
            children: [
              {
                type: "div",
                attributes: [["class", ["admin-title-row"]]],
                children: [
                  {
                    type: "h1",
                    children: ["Éditeur de Portfolio & Administration"],
                  },
                  {
                    type: "span",
                    attributes: [["class", ["user-session-badge"]]],
                    children: [
                      `👤 ${currentUser?.username || currentUser?.email || "Connecté"}`,
                    ],
                  },
                ],
              },
              {
                type: "p",
                attributes: [["class", ["admin-lead"]]],
                children: [
                  "Modifiez vos contenus en direct. Vos modifications publiées sont synchronisées avec le CMS Strapi et visibles immédiatement par les visiteurs.",
                ],
              },
              {
                type: "nav",
                attributes: [
                  ["class", ["admin-quick-nav"]],
                  ["aria-label", "Accès rapide aux sections de gestion"],
                ],
                children: [
                  AdminAnchorLink("profile-management", "👤 Mon Profil"),
                  AdminAnchorLink(
                    "projects-management",
                    `💼 Projets (${projects.length})`,
                  ),
                  AdminAnchorLink(
                    "experiences-management",
                    `📋 Expériences (${experiences.length})`,
                  ),
                  AdminAnchorLink(
                    "competences-management",
                    `⚡ Compétences (${competences.length})`,
                  ),
                  AdminAnchorLink(
                    "services-management",
                    `🧩 Services (${services.length})`,
                  ),
                  {
                    type: "a",
                    attributes: [
                      ["href", "/portfolio"],
                      ["target", "_blank"],
                      ["rel", "noopener noreferrer"],
                      ["class", ["admin-nav-link", "admin-nav-link-ext"]],
                    ],
                    children: ["🌐 Voir le Portfolio Public"],
                  },
                ],
              },
            ],
          },
          ProfileForm(profile),
          ProjectsManager(projects),
          ExperiencesManager(experiences),
          CompetencesManager(competences),
          ServicesManager(services),
        ],
      },
    ],
  };
}
