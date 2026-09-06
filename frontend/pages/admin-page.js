import Header from "../components/header.js";
import Link from "../components/router/link.js";
import { navigate } from "../utils/navigation.js";
import { isAuthenticated, getCurrentUser } from "../lib/auth.js";
import createState from "../lib/create-state.js";
import reactive from "../lib/reactive.js";
import {
  renderFeedbackBanner,
  renderEmptyState,
  renderInlineConfirm,
  showToast,
} from "../components/ui-feedback.js";
import {
  fetchMyProfile,
  createProfile,
  updateProfile,
  fetchMyExperiences,
  fetchMyProjects,
  fetchMyCompetences,
  experienceCrud,
  projectCrud,
  competenceCrud,
  extractBlocksText,
  textToBlocks,
  syncStoreFromApi,
} from "../lib/api.js";
import { extractTechnologies } from "../utils/portfolio.js";

function refresh() {
  window.dispatchEvent(new Event("pushstate"));
}

function slugify(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const STATUT_LABELS = {
  brouillon: "Brouillon",
  pret_a_relire: "Prêt à relire",
  publie: "Publié (En ligne)",
  archive: "Archivé",
};

function getAllowedStatuts(currentStatus) {
  if (!currentStatus) return ["brouillon", "pret_a_relire", "publie", "archive"];
  const transitions = {
    brouillon: ["brouillon", "pret_a_relire"],
    pret_a_relire: ["pret_a_relire", "brouillon", "publie"],
    publie: ["publie", "brouillon", "archive"],
    archive: ["archive", "brouillon"],
  };
  return transitions[currentStatus] || ["brouillon", "pret_a_relire", "publie", "archive"];
}

function renderStatusBadge(statut) {
  const label = STATUT_LABELS[statut] || statut || "Brouillon";
  return {
    type: "span",
    attributes: [["class", ["badge-statut", `badge-statut-${statut || "brouillon"}`]]],
    children: [label],
  };
}

function AdminAnchorLink(targetId, label, extraClass = "") {
  return {
    type: "a",
    attributes: [
      ["href", `#${targetId}`],
      ["class", ["admin-nav-link", extraClass].filter(Boolean)],
    ],
    events: [
      [
        "click",
        (event) => {
          event.preventDefault();
          const target = document.getElementById(targetId);
          if (target) {
            target.scrollIntoView({ behavior: "smooth" });
            if (typeof window !== "undefined" && window.history?.replaceState) {
              window.history.replaceState(null, "", `#${targetId}`);
            }
          }
        },
      ],
    ],
    children: [label],
  };
}

/**
 * 1. FORMULAIRE DE PROFIL UTILISATEUR
 */
function ProfileForm(profile) {
  const isNew = !profile;

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const data = {
      nom: form.nom.value.trim(),
      titre: form.titre.value.trim(),
      email: form.email.value.trim(),
      biographie: form.biographie.value.trim(),
      telephone: form.telephone?.value?.trim() || null,
      localisation: form.localisation?.value?.trim() || null,
      github: form.github?.value?.trim() || null,
      linkedin: form.linkedin?.value?.trim() || null,
      theme: form.theme?.value || "ruben",
    };

    try {
      if (isNew) {
        await createProfile(data);
        showToast("Profil créé avec succès !", "success");
      } else {
        await updateProfile(profile.documentId, data);
        showToast("Profil mis à jour avec succès !", "success");
      }
      await syncStoreFromApi();
      refresh();
    } catch (err) {
      showToast("Erreur lors de l'enregistrement : " + err.message, "error");
    }
  }

  const themes = [
    { value: "ruben", label: "Ruben (Sombre / Développeur)" },
    { value: "iris", label: "Iris (Moderne / Créatif)" },
    { value: "yaniss", label: "Yaniss (Minimaliste / Épuré)" },
  ];

  return {
    type: "section",
    attributes: [
      ["id", "profile-management"],
      ["class", ["admin-section", "admin-profile-section"]],
    ],
    children: [
      {
        type: "header",
        attributes: [["class", ["admin-section-header"]]],
        children: [
          { type: "h2", children: [isNew ? "Créer mon profil" : "Mon Profil & Identité"] },
          {
            type: "p",
            attributes: [["class", ["admin-section-desc"]]],
            children: [
              isNew
                ? "Créez votre profil pour commencer à publier des projets et expériences sur votre portfolio."
                : "Ces informations alimentent la page d'accueil, le CV en ligne et les métadonnées SEO.",
            ],
          },
        ],
      },
      {
        type: "form",
        attributes: [["class", ["admin-form", "admin-form-grid"]]],
        events: [["submit", handleSubmit]],
        children: [
          // Ligne 1 : Nom et Titre
          {
            type: "div",
            attributes: [["class", ["form-row-2col"]]],
            children: [
              {
                type: "div",
                attributes: [["class", ["form-group"]]],
                children: [
                  {
                    type: "label",
                    attributes: [["for", "profile-nom"]],
                    children: ["Nom complet *"],
                  },
                  {
                    type: "input",
                    attributes: [
                      ["id", "profile-nom"],
                      ["name", "nom"],
                      ["type", "text"],
                      ["required", true],
                      ["placeholder", "ex: Ruben K."],
                      ["value", profile?.nom || ""],
                    ],
                  },
                ],
              },
              {
                type: "div",
                attributes: [["class", ["form-group"]]],
                children: [
                  {
                    type: "label",
                    attributes: [["for", "profile-titre"]],
                    children: ["Titre professionnel *"],
                  },
                  {
                    type: "input",
                    attributes: [
                      ["id", "profile-titre"],
                      ["name", "titre"],
                      ["type", "text"],
                      ["required", true],
                      ["placeholder", "ex: Développeur Full Stack & Architecte"],
                      ["value", profile?.titre || ""],
                    ],
                  },
                ],
              },
            ],
          },

          // Ligne 2 : Email et Téléphone
          {
            type: "div",
            attributes: [["class", ["form-row-2col"]]],
            children: [
              {
                type: "div",
                attributes: [["class", ["form-group"]]],
                children: [
                  {
                    type: "label",
                    attributes: [["for", "profile-email"]],
                    children: ["Adresse Email *"],
                  },
                  {
                    type: "input",
                    attributes: [
                      ["id", "profile-email"],
                      ["name", "email"],
                      ["type", "email"],
                      ["required", true],
                      ["placeholder", "ex: contact@example.com"],
                      ["value", profile?.email || ""],
                    ],
                  },
                ],
              },
              {
                type: "div",
                attributes: [["class", ["form-group"]]],
                children: [
                  {
                    type: "label",
                    attributes: [["for", "profile-telephone"]],
                    children: ["Numéro de téléphone"],
                  },
                  {
                    type: "input",
                    attributes: [
                      ["id", "profile-telephone"],
                      ["name", "telephone"],
                      ["type", "tel"],
                      ["placeholder", "ex: +33 6 12 34 56 78"],
                      ["value", profile?.telephone || ""],
                    ],
                  },
                ],
              },
            ],
          },

          // Ligne 3 : Localisation et Thème graphique
          {
            type: "div",
            attributes: [["class", ["form-row-2col"]]],
            children: [
              {
                type: "div",
                attributes: [["class", ["form-group"]]],
                children: [
                  {
                    type: "label",
                    attributes: [["for", "profile-localisation"]],
                    children: ["Localisation"],
                  },
                  {
                    type: "input",
                    attributes: [
                      ["id", "profile-localisation"],
                      ["name", "localisation"],
                      ["type", "text"],
                      ["placeholder", "ex: Paris, France (Disponible en hybride)"],
                      ["value", profile?.localisation || ""],
                    ],
                  },
                ],
              },
              {
                type: "div",
                attributes: [["class", ["form-group"]]],
                children: [
                  {
                    type: "label",
                    attributes: [["for", "profile-theme"]],
                    children: ["Thème par défaut du portfolio"],
                  },
                  {
                    type: "select",
                    attributes: [
                      ["id", "profile-theme"],
                      ["name", "theme"],
                    ],
                    children: themes.map((t) => ({
                      type: "option",
                      attributes: [
                        ["value", t.value],
                        ...(profile?.theme === t.value ? [["selected", "selected"]] : []),
                      ],
                      children: [t.label],
                    })),
                  },
                ],
              },
            ],
          },

          // Ligne 4 : Liens sociaux (GitHub & LinkedIn)
          {
            type: "div",
            attributes: [["class", ["form-row-2col"]]],
            children: [
              {
                type: "div",
                attributes: [["class", ["form-group"]]],
                children: [
                  {
                    type: "label",
                    attributes: [["for", "profile-github"]],
                    children: ["Lien GitHub"],
                  },
                  {
                    type: "input",
                    attributes: [
                      ["id", "profile-github"],
                      ["name", "github"],
                      ["type", "url"],
                      ["placeholder", "https://github.com/mon-compte"],
                      ["value", profile?.github || ""],
                    ],
                  },
                ],
              },
              {
                type: "div",
                attributes: [["class", ["form-group"]]],
                children: [
                  {
                    type: "label",
                    attributes: [["for", "profile-linkedin"]],
                    children: ["Lien LinkedIn"],
                  },
                  {
                    type: "input",
                    attributes: [
                      ["id", "profile-linkedin"],
                      ["name", "linkedin"],
                      ["type", "url"],
                      ["placeholder", "https://linkedin.com/in/mon-compte"],
                      ["value", profile?.linkedin || ""],
                    ],
                  },
                ],
              },
            ],
          },

          // Ligne 5 : Biographie
          {
            type: "div",
            attributes: [["class", ["form-group"]]],
            children: [
              {
                type: "label",
                attributes: [["for", "profile-bio"]],
                children: ["Biographie & Présentation"],
              },
              {
                type: "textarea",
                attributes: [
                  ["id", "profile-bio"],
                  ["name", "biographie"],
                  ["rows", 4],
                  ["placeholder", "Présentez votre parcours, vos spécialités et votre vision technique..."],
                ],
                children: [profile?.biographie || ""],
              },
            ],
          },

          // Bouton de soumission
          {
            type: "div",
            attributes: [["class", ["form-actions"]]],
            children: [
              {
                type: "button",
                attributes: [
                  ["type", "submit"],
                  ["class", ["btn", "btn-primary"]],
                ],
                children: [isNew ? "Créer mon profil" : "Enregistrer les modifications du profil"],
              },
            ],
          },
        ],
      },
    ],
  };
}

/**
 * 2. GESTIONNAIRE COMPLET DE PROJETS (CRUD ENRICHI)
 */
function ProjectsManager(projects = []) {
  const editingProjectState = createState(null);
  const deletingIdState = createState(null);

  return {
    type: "section",
    attributes: [
      ["id", "projects-management"],
      ["class", ["admin-section", "admin-projects-section"]],
    ],
    children: [
      {
        type: "header",
        attributes: [["class", ["admin-section-header"]]],
        children: [
          { type: "h2", children: ["Mes Projets & Réalisations"] },
          {
            type: "p",
            attributes: [["class", ["admin-section-desc"]]],
            children: [
              "Gérez l'ensemble des projets de votre catalogue. Les projets au statut « Publié » apparaissent immédiatement sur ",
              Link("/portfolio", "la galerie publique /portfolio"),
              ".",
            ],
          },
        ],
      },

      // Formulaire réactif (Mode Création ou Modification)
      reactive(editingProjectState, (editingProject) => {
        const isEditing = Boolean(editingProject);
        const allowedStatuts = getAllowedStatuts(editingProject?.statut);

        async function handleProjectSubmit(event) {
          event.preventDefault();
          const form = event.target;

          const titre = form.titre.value.trim();
          const resume = form.resume.value.trim();
          const rawDesc = form.description.value.trim();
          const technologies = form.technologies.value.trim();
          const dateRealisation = form.date_realisation.value || null;
          const lienDemo = form.lien_demo.value.trim() || null;
          const lienRepo = form.lien_repo.value.trim() || null;
          const enVedette = Boolean(form.en_vedette.checked);
          const statut = form.statut.value;

          const payload = {
            titre,
            slug: isEditing && editingProject.slug ? editingProject.slug : slugify(titre),
            resume: resume || null,
            description: textToBlocks(rawDesc),
            technologies: technologies || null,
            date_realisation: dateRealisation,
            lien_demo: lienDemo,
            lien_repo: lienRepo,
            en_vedette: enVedette,
            statut,
            publishedAt: statut === "publie" ? new Date().toISOString() : null,
          };

          try {
            if (isEditing) {
              await projectCrud.update(editingProject.documentId, payload);
              showToast(`Projet « ${titre} » mis à jour avec succès !`, "success");
            } else {
              await projectCrud.create(payload);
              showToast(`Projet « ${titre} » créé avec succès !`, "success");
            }
            editingProjectState.set(null);
            await syncStoreFromApi();
            refresh();
          } catch (err) {
            showToast("Erreur lors de l'enregistrement du projet : " + err.message, "error");
          }
        }

        const initialDescText = isEditing
          ? extractBlocksText(editingProject.descriptionBlocks || editingProject.description)
          : "";
        const initialTechs = isEditing ? extractTechnologies(editingProject).join(", ") : "";

        return {
          type: "form",
          attributes: [
            ["id", "project-editor-form"],
            ["class", ["admin-form", "admin-form-box", isEditing ? "admin-form-editing" : "admin-form-new"]],
          ],
          events: [["submit", handleProjectSubmit]],
          children: [
            {
              type: "div",
              attributes: [["class", ["form-box-header"]]],
              children: [
                {
                  type: "h3",
                  children: [isEditing ? `✏️ Modifier le projet : ${editingProject.titre}` : "➕ Ajouter un nouveau projet"],
                },
                isEditing
                  ? {
                      type: "button",
                      attributes: [
                        ["type", "button"],
                        ["class", ["btn", "btn-sm", "btn-secondary"]],
                      ],
                      events: [["click", () => editingProjectState.set(null)]],
                      children: ["✕ Annuler la modification"],
                    }
                  : { type: "span", children: [] },
              ],
            },

            // Ligne Titre & Statut
            {
              type: "div",
              attributes: [["class", ["form-row-2col"]]],
              children: [
                {
                  type: "div",
                  attributes: [["class", ["form-group"]]],
                  children: [
                    {
                      type: "label",
                      attributes: [["for", "proj-titre"]],
                      children: ["Titre du projet *"],
                    },
                    {
                      type: "input",
                      attributes: [
                        ["id", "proj-titre"],
                        ["name", "titre"],
                        ["type", "text"],
                        ["required", true],
                        ["minlength", 2],
                        ["placeholder", "ex: Plateforme E-Commerce Haute Performance"],
                        ["value", editingProject?.titre || ""],
                      ],
                    },
                  ],
                },
                {
                  type: "div",
                  attributes: [["class", ["form-group"]]],
                  children: [
                    {
                      type: "label",
                      attributes: [["for", "proj-statut"]],
                      children: ["Statut du workflow *"],
                    },
                    {
                      type: "select",
                      attributes: [
                        ["id", "proj-statut"],
                        ["name", "statut"],
                        ["required", true],
                      ],
                      children: allowedStatuts.map((s) => ({
                        type: "option",
                        attributes: [
                          ["value", s],
                          ...((editingProject?.statut || "publie") === s ? [["selected", "selected"]] : []),
                        ],
                        children: [STATUT_LABELS[s] || s],
                      })),
                    },
                  ],
                },
              ],
            },

            // Résumé
            {
              type: "div",
              attributes: [["class", ["form-group"]]],
              children: [
                {
                  type: "label",
                  attributes: [["for", "proj-resume"]],
                  children: ["Résumé court (affiché sur les cartes du catalogue)"],
                },
                {
                  type: "textarea",
                  attributes: [
                    ["id", "proj-resume"],
                    ["name", "resume"],
                    ["rows", 2],
                    ["maxlength", 500],
                    ["placeholder", "Synthèse concise du projet en 1 ou 2 phrases percutantes..."],
                  ],
                  children: [editingProject?.resume || ""],
                },
              ],
            },

            // Description détaillée
            {
              type: "div",
              attributes: [["class", ["form-group"]]],
              children: [
                {
                  type: "label",
                  attributes: [["for", "proj-desc"]],
                  children: ["Description complète & Architecture *"],
                },
                {
                  type: "textarea",
                  attributes: [
                    ["id", "proj-desc"],
                    ["name", "description"],
                    ["rows", 5],
                    ["required", true],
                    ["placeholder", "Détaillez le contexte, les défis techniques relevés, l'architecture mise en œuvre et les résultats mesurables..."],
                  ],
                  children: [initialDescText],
                },
              ],
            },

            // Technologies & Date de réalisation
            {
              type: "div",
              attributes: [["class", ["form-row-2col"]]],
              children: [
                {
                  type: "div",
                  attributes: [["class", ["form-group"]]],
                  children: [
                    {
                      type: "label",
                      attributes: [["for", "proj-techs"]],
                      children: ["Technologies utilisées (séparées par des virgules)"],
                    },
                    {
                      type: "input",
                      attributes: [
                        ["id", "proj-techs"],
                        ["name", "technologies"],
                        ["type", "text"],
                        ["placeholder", "Vanilla JS, CSS Modules, Strapi 5, Docker"],
                        ["value", initialTechs],
                      ],
                    },
                  ],
                },
                {
                  type: "div",
                  attributes: [["class", ["form-group"]]],
                  children: [
                    {
                      type: "label",
                      attributes: [["for", "proj-date"]],
                      children: ["Date de réalisation"],
                    },
                    {
                      type: "input",
                      attributes: [
                        ["id", "proj-date"],
                        ["name", "date_realisation"],
                        ["type", "date"],
                        ["value", editingProject?.date_realisation || ""],
                      ],
                    },
                  ],
                },
              ],
            },

            // Liens Démo & GitHub
            {
              type: "div",
              attributes: [["class", ["form-row-2col"]]],
              children: [
                {
                  type: "div",
                  attributes: [["class", ["form-group"]]],
                  children: [
                    {
                      type: "label",
                      attributes: [["for", "proj-demo"]],
                      children: ["Lien de Démo Live (URL valide)"],
                    },
                    {
                      type: "input",
                      attributes: [
                        ["id", "proj-demo"],
                        ["name", "lien_demo"],
                        ["type", "url"],
                        ["placeholder", "https://demo.monprojet.fr"],
                        ["value", editingProject?.lien_demo || ""],
                      ],
                    },
                  ],
                },
                {
                  type: "div",
                  attributes: [["class", ["form-group"]]],
                  children: [
                    {
                      type: "label",
                      attributes: [["for", "proj-repo"]],
                      children: ["Dépôt GitHub / GitLab (URL valide)"],
                    },
                    {
                      type: "input",
                      attributes: [
                        ["id", "proj-repo"],
                        ["name", "lien_repo"],
                        ["type", "url"],
                        ["placeholder", "https://github.com/ruben/decode-js"],
                        ["value", editingProject?.lien_repo || ""],
                      ],
                    },
                  ],
                },
              ],
            },

            // Option En vedette
            {
              type: "div",
              attributes: [["class", ["form-group", "form-group-checkbox"]]],
              children: [
                {
                  type: "label",
                  attributes: [["class", ["checkbox-label"]]],
                  children: [
                    {
                      type: "input",
                      attributes: [
                        ["name", "en_vedette"],
                        ["type", "checkbox"],
                        ...(editingProject?.en_vedette ? [["checked", "checked"]] : []),
                      ],
                    },
                    " Mettre ce projet en vedette (Star ⭐ affichée sur le portfolio)",
                  ],
                },
              ],
            },

            // Boutons d'action
            {
              type: "div",
              attributes: [["class", ["form-actions"]]],
              children: [
                {
                  type: "button",
                  attributes: [
                    ["type", "submit"],
                    ["class", ["btn", "btn-primary"]],
                  ],
                  children: [isEditing ? "Enregistrer les modifications" : "Créer le projet"],
                },
                isEditing
                  ? {
                      type: "button",
                      attributes: [
                        ["type", "button"],
                        ["class", ["btn", "btn-secondary"]],
                      ],
                      events: [["click", () => editingProjectState.set(null)]],
                      children: ["Annuler"],
                    }
                  : { type: "span", children: [] },
              ],
            },
          ],
        };
      }),

      // Liste des projets
      projects.length === 0
        ? renderEmptyState({
            icon: "💼",
            title: "Aucun projet pour le moment",
            description: "Utilisez le formulaire ci-dessus pour ajouter votre premier projet.",
          })
        : reactive(deletingIdState, (deletingId) => ({
            type: "div",
            attributes: [["class", ["admin-cards-grid"]]],
            children: projects.map((p) => {
              const isDeleting = deletingId === p.documentId;
              const techs = extractTechnologies(p);

              return {
                type: "article",
                attributes: [
                  [
                    "class",
                    [
                      "admin-card",
                      editingProjectState.get()?.documentId === p.documentId ? "admin-card-active" : "",
                    ].filter(Boolean),
                  ],
                ],
                children: [
                  {
                    type: "div",
                    attributes: [["class", ["admin-card-header"]]],
                    children: [
                      {
                        type: "div",
                        attributes: [["class", ["admin-card-title-wrap"]]],
                        children: [
                          {
                            type: "h4",
                            attributes: [["class", ["admin-card-title"]]],
                            children: [p.titre || "(Sans titre)"],
                          },
                          p.en_vedette
                            ? {
                                type: "span",
                                attributes: [["class", ["badge-star"]]],
                                children: ["⭐ En vedette"],
                              }
                            : { type: "span", children: [] },
                        ],
                      },
                      renderStatusBadge(p.statut),
                    ],
                  },
                  p.resume
                    ? {
                        type: "p",
                        attributes: [["class", ["admin-card-resume"]]],
                        children: [p.resume],
                      }
                    : { type: "span", children: [] },

                  techs.length > 0
                    ? {
                        type: "div",
                        attributes: [["class", ["admin-techs-chips"]]],
                        children: techs.map((t) => ({
                          type: "span",
                          attributes: [["class", ["tech-chip"]]],
                          children: [t],
                        })),
                      }
                    : { type: "span", children: [] },

                  {
                    type: "div",
                    attributes: [["class", ["admin-card-footer"]]],
                    children: [
                      {
                        type: "div",
                        attributes: [["class", ["admin-card-links"]]],
                        children: [
                          p.statut === "publie" && p.slug
                            ? Link(
                                `/portfolio/${p.slug}`,
                                "👁️ Voir sur le site",
                                ["admin-view-link"],
                                [["target", "_blank"], ["title", "Ouvrir la fiche publique du projet"]]
                              )
                            : { type: "span", children: [] },
                          p.lien_demo
                            ? {
                                type: "a",
                                attributes: [
                                  ["href", p.lien_demo],
                                  ["target", "_blank"],
                                  ["rel", "noopener noreferrer"],
                                  ["class", ["admin-meta-link"]],
                                ],
                                children: ["🚀 Démo"],
                              }
                            : { type: "span", children: [] },
                          p.lien_repo
                            ? {
                                type: "a",
                                attributes: [
                                  ["href", p.lien_repo],
                                  ["target", "_blank"],
                                  ["rel", "noopener noreferrer"],
                                  ["class", ["admin-meta-link"]],
                                ],
                                children: ["💻 Code"],
                              }
                            : { type: "span", children: [] },
                        ],
                      },
                      {
                        type: "div",
                        attributes: [["class", ["admin-card-actions"]]],
                        children: isDeleting
                          ? [
                              renderInlineConfirm({
                                message: "Supprimer définitivement ce projet ?",
                                onConfirm: async () => {
                                  try {
                                    await projectCrud.remove(p.documentId);
                                    showToast("Projet supprimé.", "info");
                                    deletingIdState.set(null);
                                    await syncStoreFromApi();
                                    refresh();
                                  } catch (err) {
                                    showToast("Erreur lors de la suppression : " + err.message, "error");
                                  }
                                },
                                onCancel: () => deletingIdState.set(null),
                              }),
                            ]
                          : [
                              {
                                type: "button",
                                attributes: [
                                  ["type", "button"],
                                  ["class", ["btn", "btn-sm", "btn-secondary"]],
                                ],
                                events: [
                                  [
                                    "click",
                                    () => {
                                      editingProjectState.set(p);
                                      const formEl = document.getElementById("project-editor-form");
                                      if (formEl) formEl.scrollIntoView({ behavior: "smooth" });
                                    },
                                  ],
                                ],
                                children: ["✏️ Modifier"],
                              },
                              {
                                type: "button",
                                attributes: [
                                  ["type", "button"],
                                  ["class", ["btn", "btn-sm", "btn-danger"]],
                                ],
                                events: [["click", () => deletingIdState.set(p.documentId)]],
                                children: ["🗑️ Supprimer"],
                              },
                            ],
                      },
                    ],
                  },
                ],
              };
            }),
          })),
    ],
  };
}

/**
 * 3. GESTIONNAIRE COMPLET D'EXPÉRIENCES PROFESSIONNELLES
 */
function ExperiencesManager(experiences = []) {
  const editingExpState = createState(null);
  const deletingIdState = createState(null);

  return {
    type: "section",
    attributes: [
      ["id", "experiences-management"],
      ["class", ["admin-section", "admin-experiences-section"]],
    ],
    children: [
      {
        type: "header",
        attributes: [["class", ["admin-section-header"]]],
        children: [
          { type: "h2", children: ["Mes Expériences Professionnelles"] },
          {
            type: "p",
            attributes: [["class", ["admin-section-desc"]]],
            children: [
              "Ces postes et missions alimentent la chronologie du ",
              Link("/cv", "CV interactif"),
              " et de la page ",
              Link("/experiences", "Expériences"),
              ".",
            ],
          },
        ],
      },

      // Formulaire réactif (Mode Création ou Modification)
      reactive(editingExpState, (editingExp) => {
        const isEditing = Boolean(editingExp);
        const allowedStatuts = getAllowedStatuts(editingExp?.statut);

        async function handleExpSubmit(event) {
          event.preventDefault();
          const form = event.target;

          const titre = form.titre.value.trim();
          const entreprise = form.entreprise.value.trim();
          const dateDebut = form.date_debut.value;
          const dateFin = form.date_fin.value || null;
          const rawDesc = form.description.value.trim();
          const statut = form.statut.value;

          const payload = {
            titre,
            entreprise,
            slug: isEditing && editingExp.slug ? editingExp.slug : slugify(`${titre}-${entreprise}`),
            date_debut: dateDebut,
            date_fin: dateFin,
            description: textToBlocks(rawDesc),
            statut,
            publishedAt: statut === "publie" ? new Date().toISOString() : null,
          };

          try {
            if (isEditing) {
              await experienceCrud.update(editingExp.documentId, payload);
              showToast(`Expérience chez ${entreprise} mise à jour !`, "success");
            } else {
              await experienceCrud.create(payload);
              showToast(`Expérience chez ${entreprise} ajoutée !`, "success");
            }
            editingExpState.set(null);
            await syncStoreFromApi();
            refresh();
          } catch (err) {
            showToast("Erreur lors de l'enregistrement : " + err.message, "error");
          }
        }

        const initialDesc = isEditing
          ? extractBlocksText(editingExp.descriptionBlocks || editingExp.description)
          : "";

        return {
          type: "form",
          attributes: [
            ["id", "experience-editor-form"],
            ["class", ["admin-form", "admin-form-box", isEditing ? "admin-form-editing" : "admin-form-new"]],
          ],
          events: [["submit", handleExpSubmit]],
          children: [
            {
              type: "div",
              attributes: [["class", ["form-box-header"]]],
              children: [
                {
                  type: "h3",
                  children: [isEditing ? `✏️ Modifier : ${editingExp.titre}` : "➕ Ajouter une nouvelle expérience"],
                },
                isEditing
                  ? {
                      type: "button",
                      attributes: [
                        ["type", "button"],
                        ["class", ["btn", "btn-sm", "btn-secondary"]],
                      ],
                      events: [["click", () => editingExpState.set(null)]],
                      children: ["✕ Annuler la modification"],
                    }
                  : { type: "span", children: [] },
              ],
            },

            // Ligne 1 : Intitulé & Entreprise
            {
              type: "div",
              attributes: [["class", ["form-row-2col"]]],
              children: [
                {
                  type: "div",
                  attributes: [["class", ["form-group"]]],
                  children: [
                    {
                      type: "label",
                      attributes: [["for", "exp-titre"]],
                      children: ["Intitulé du poste *"],
                    },
                    {
                      type: "input",
                      attributes: [
                        ["id", "exp-titre"],
                        ["name", "titre"],
                        ["type", "text"],
                        ["required", true],
                        ["placeholder", "ex: Lead Développeur Frontend"],
                        ["value", editingExp?.titre || ""],
                      ],
                    },
                  ],
                },
                {
                  type: "div",
                  attributes: [["class", ["form-group"]]],
                  children: [
                    {
                      type: "label",
                      attributes: [["for", "exp-entreprise"]],
                      children: ["Entreprise / Société *"],
                    },
                    {
                      type: "input",
                      attributes: [
                        ["id", "exp-entreprise"],
                        ["name", "entreprise"],
                        ["type", "text"],
                        ["required", true],
                        ["placeholder", "ex: Acme Corp"],
                        ["value", editingExp?.entreprise || ""],
                      ],
                    },
                  ],
                },
              ],
            },

            // Ligne 2 : Date début & Date fin
            {
              type: "div",
              attributes: [["class", ["form-row-2col"]]],
              children: [
                {
                  type: "div",
                  attributes: [["class", ["form-group"]]],
                  children: [
                    {
                      type: "label",
                      attributes: [["for", "exp-debut"]],
                      children: ["Date de début *"],
                    },
                    {
                      type: "input",
                      attributes: [
                        ["id", "exp-debut"],
                        ["name", "date_debut"],
                        ["type", "date"],
                        ["required", true],
                        ["value", editingExp?.date_debut || ""],
                      ],
                    },
                  ],
                },
                {
                  type: "div",
                  attributes: [["class", ["form-group"]]],
                  children: [
                    {
                      type: "label",
                      attributes: [["for", "exp-fin"]],
                      children: ["Date de fin (laisser vide si poste actuel)"],
                    },
                    {
                      type: "input",
                      attributes: [
                        ["id", "exp-fin"],
                        ["name", "date_fin"],
                        ["type", "date"],
                        ["value", editingExp?.date_fin || ""],
                      ],
                    },
                  ],
                },
              ],
            },

            // Ligne 3 : Description des missions
            {
              type: "div",
              attributes: [["class", ["form-group"]]],
              children: [
                {
                  type: "label",
                  attributes: [["for", "exp-desc"]],
                  children: ["Description des responsabilités & réalisations *"],
                },
                {
                  type: "textarea",
                  attributes: [
                    ["id", "exp-desc"],
                    ["name", "description"],
                    ["rows", 4],
                    ["required", true],
                    ["placeholder", "Expliquez vos missions principales, les technologies utilisées et l'impact opérationnel..."],
                  ],
                  children: [initialDesc],
                },
              ],
            },

            // Ligne 4 : Statut
            {
              type: "div",
              attributes: [["class", ["form-group"]]],
              children: [
                {
                  type: "label",
                  attributes: [["for", "exp-statut"]],
                  children: ["Statut *"],
                },
                {
                  type: "select",
                  attributes: [
                    ["id", "exp-statut"],
                    ["name", "statut"],
                    ["required", true],
                  ],
                  children: allowedStatuts.map((s) => ({
                    type: "option",
                    attributes: [
                      ["value", s],
                      ...((editingExp?.statut || "publie") === s ? [["selected", "selected"]] : []),
                    ],
                    children: [STATUT_LABELS[s] || s],
                  })),
                },
              ],
            },

            // Actions
            {
              type: "div",
              attributes: [["class", ["form-actions"]]],
              children: [
                {
                  type: "button",
                  attributes: [
                    ["type", "submit"],
                    ["class", ["btn", "btn-primary"]],
                  ],
                  children: [isEditing ? "Enregistrer les modifications" : "Ajouter l'expérience"],
                },
                isEditing
                  ? {
                      type: "button",
                      attributes: [
                        ["type", "button"],
                        ["class", ["btn", "btn-secondary"]],
                      ],
                      events: [["click", () => editingExpState.set(null)]],
                      children: ["Annuler"],
                    }
                  : { type: "span", children: [] },
              ],
            },
          ],
        };
      }),

      // Liste des expériences
      experiences.length === 0
        ? renderEmptyState({
            icon: "📋",
            title: "Aucune expérience enregistrée",
            description: "Ajoutez votre parcours professionnel avec le formulaire ci-dessus.",
          })
        : reactive(deletingIdState, (deletingId) => ({
            type: "div",
            attributes: [["class", ["admin-cards-grid"]]],
            children: experiences.map((exp) => {
              const isDeleting = deletingId === exp.documentId;
              const dateDebut = exp.date_debut || "";
              const dateFin = exp.date_fin ? exp.date_fin : "Aujourd'hui";

              return {
                type: "article",
                attributes: [["class", ["admin-card"]]],
                children: [
                  {
                    type: "div",
                    attributes: [["class", ["admin-card-header"]]],
                    children: [
                      {
                        type: "div",
                        attributes: [["class", ["admin-card-title-wrap"]]],
                        children: [
                          {
                            type: "h4",
                            attributes: [["class", ["admin-card-title"]]],
                            children: [exp.titre || "(Sans titre)"],
                          },
                          {
                            type: "span",
                            attributes: [["class", ["admin-card-subtitle"]]],
                            children: [exp.entreprise ? ` @ ${exp.entreprise}` : ""],
                          },
                        ],
                      },
                      renderStatusBadge(exp.statut),
                    ],
                  },
                  {
                    type: "p",
                    attributes: [["class", ["admin-card-dates"]]],
                    children: [`📅 ${dateDebut} → ${dateFin}`],
                  },
                  {
                    type: "div",
                    attributes: [["class", ["admin-card-footer"]]],
                    children: [
                      { type: "span", children: [] },
                      {
                        type: "div",
                        attributes: [["class", ["admin-card-actions"]]],
                        children: isDeleting
                          ? [
                              renderInlineConfirm({
                                message: "Supprimer cette expérience ?",
                                onConfirm: async () => {
                                  try {
                                    await experienceCrud.remove(exp.documentId);
                                    showToast("Expérience supprimée.", "info");
                                    deletingIdState.set(null);
                                    await syncStoreFromApi();
                                    refresh();
                                  } catch (err) {
                                    showToast("Erreur lors de la suppression : " + err.message, "error");
                                  }
                                },
                                onCancel: () => deletingIdState.set(null),
                              }),
                            ]
                          : [
                              {
                                type: "button",
                                attributes: [
                                  ["type", "button"],
                                  ["class", ["btn", "btn-sm", "btn-secondary"]],
                                ],
                                events: [
                                  [
                                    "click",
                                    () => {
                                      editingExpState.set(exp);
                                      const formEl = document.getElementById("experience-editor-form");
                                      if (formEl) formEl.scrollIntoView({ behavior: "smooth" });
                                    },
                                  ],
                                ],
                                children: ["✏️ Modifier"],
                              },
                              {
                                type: "button",
                                attributes: [
                                  ["type", "button"],
                                  ["class", ["btn", "btn-sm", "btn-danger"]],
                                ],
                                events: [["click", () => deletingIdState.set(exp.documentId)]],
                                children: ["🗑️ Supprimer"],
                              },
                            ],
                      },
                    ],
                  },
                ],
              };
            }),
          })),
    ],
  };
}

/**
 * 4. GESTIONNAIRE DE COMPÉTENCES TECHNIQUES
 */
function CompetencesManager(competences = []) {
  const deletingIdState = createState(null);

  const NIVEAU_LABELS = {
    débutant: "Débutant",
    intermediaire: "Intermédiaire",
    avance: "Avancé",
    expert: "Expert ⭐",
  };

  async function handleAdd(event) {
    event.preventDefault();
    const form = event.target;
    const titre = form.titre.value.trim();
    const niveau = form.niveau.value;
    const statut = form.statut.value;

    try {
      await competenceCrud.create({
        titre,
        niveau,
        statut,
        publishedAt: statut === "publie" ? new Date().toISOString() : null,
      });
      showToast(`Compétence « ${titre} » ajoutée !`, "success");
      form.reset();
      await syncStoreFromApi();
      refresh();
    } catch (err) {
      showToast("Erreur lors de l'ajout : " + err.message, "error");
    }
  }

  return {
    type: "section",
    attributes: [
      ["id", "competences-management"],
      ["class", ["admin-section", "admin-competences-section"]],
    ],
    children: [
      {
        type: "header",
        attributes: [["class", ["admin-section-header"]]],
        children: [
          { type: "h2", children: ["Mes Compétences Techniques"] },
          {
            type: "p",
            attributes: [["class", ["admin-section-desc"]]],
            children: ["Compétences affichées sur votre CV et utilisées pour les filtres du portfolio."],
          },
        ],
      },

      // Formulaire d'ajout rapide
      {
        type: "form",
        attributes: [["class", ["admin-form", "admin-form-box", "admin-comp-form"]]],
        events: [["submit", handleAdd]],
        children: [
          {
            type: "div",
            attributes: [["class", ["form-row-3col"]]],
            children: [
              {
                type: "div",
                attributes: [["class", ["form-group"]]],
                children: [
                  {
                    type: "label",
                    attributes: [["for", "comp-titre"]],
                    children: ["Compétence *"],
                  },
                  {
                    type: "input",
                    attributes: [
                      ["id", "comp-titre"],
                      ["name", "titre"],
                      ["type", "text"],
                      ["required", true],
                      ["placeholder", "ex: TypeScript, React, Docker..."],
                    ],
                  },
                ],
              },
              {
                type: "div",
                attributes: [["class", ["form-group"]]],
                children: [
                  {
                    type: "label",
                    attributes: [["for", "comp-niveau"]],
                    children: ["Niveau *"],
                  },
                  {
                    type: "select",
                    attributes: [
                      ["id", "comp-niveau"],
                      ["name", "niveau"],
                      ["required", true],
                    ],
                    children: Object.entries(NIVEAU_LABELS).map(([val, label]) => ({
                      type: "option",
                      attributes: [
                        ["value", val],
                        ...(val === "avance" ? [["selected", "selected"]] : []),
                      ],
                      children: [label],
                    })),
                  },
                ],
              },
              {
                type: "div",
                attributes: [["class", ["form-group"]]],
                children: [
                  {
                    type: "label",
                    attributes: [["for", "comp-statut"]],
                    children: ["Statut *"],
                  },
                  {
                    type: "select",
                    attributes: [
                      ["id", "comp-statut"],
                      ["name", "statut"],
                      ["required", true],
                    ],
                    children: ["publie", "brouillon"].map((s) => ({
                      type: "option",
                      attributes: [["value", s]],
                      children: [STATUT_LABELS[s] || s],
                    })),
                  },
                ],
              },
            ],
          },
          {
            type: "div",
            attributes: [["class", ["form-actions"]]],
            children: [
              {
                type: "button",
                attributes: [
                  ["type", "submit"],
                  ["class", ["btn", "btn-primary"]],
                ],
                children: ["➕ Ajouter la compétence"],
              },
            ],
          },
        ],
      },

      // Liste des compétences en badges
      competences.length === 0
        ? renderEmptyState({
            icon: "⚡",
            title: "Aucune compétence enregistrée",
            description: "Ajoutez vos compétences clés ci-dessus.",
          })
        : reactive(deletingIdState, (deletingId) => ({
            type: "div",
            attributes: [["class", ["admin-competences-grid"]]],
            children: competences.map((c) => {
              const isDeleting = deletingId === c.documentId;
              return {
                type: "div",
                attributes: [["class", ["competence-admin-chip"]]],
                children: [
                  {
                    type: "div",
                    attributes: [["class", ["competence-chip-content"]]],
                    children: [
                      {
                        type: "strong",
                        attributes: [["class", ["competence-chip-title"]]],
                        children: [c.titre || "(Sans nom)"],
                      },
                      {
                        type: "span",
                        attributes: [["class", ["competence-chip-level", `level-${c.niveau || "intermediaire"}`]]],
                        children: [NIVEAU_LABELS[c.niveau] || c.niveau || "Intermédiaire"],
                      },
                      renderStatusBadge(c.statut),
                    ],
                  },
                  isDeleting
                    ? renderInlineConfirm({
                        message: "Supprimer ?",
                        onConfirm: async () => {
                          try {
                            await competenceCrud.remove(c.documentId);
                            showToast("Compétence supprimée.", "info");
                            deletingIdState.set(null);
                            await syncStoreFromApi();
                            refresh();
                          } catch (err) {
                            showToast("Erreur lors de la suppression : " + err.message, "error");
                          }
                        },
                        onCancel: () => deletingIdState.set(null),
                      })
                    : {
                        type: "button",
                        attributes: [
                          ["type", "button"],
                          ["class", ["btn", "btn-sm", "btn-danger-outline"]],
                          ["title", "Supprimer cette compétence"],
                        ],
                        events: [["click", () => deletingIdState.set(c.documentId)]],
                        children: ["✕"],
                      },
                ],
              };
            }),
          })),
    ],
  };
}

/**
 * 5. PAGE ADMIN PRINCIPALE
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
                  { type: "h1", children: ["Bienvenue sur votre espace d'administration"] },
                  {
                    type: "p",
                    children: [
                      `Session active pour `,
                      { type: "strong", children: [currentUser?.username || currentUser?.email || "Utilisateur"] },
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

    const [exp, proj, comp] = await Promise.all([
      fetchMyExperiences(),
      fetchMyProjects(),
      fetchMyCompetences(),
    ]);

    experiences = exp || [];
    projects = proj || [];
    competences = comp || [];
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
                  { type: "h1", children: ["Éditeur de Portfolio & Administration"] },
                  {
                    type: "span",
                    attributes: [["class", ["user-session-badge"]]],
                    children: [`👤 ${currentUser?.username || currentUser?.email || "Connecté"}`],
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
                  AdminAnchorLink("projects-management", `💼 Projets (${projects.length})`),
                  AdminAnchorLink("experiences-management", `📋 Expériences (${experiences.length})`),
                  AdminAnchorLink("competences-management", `⚡ Compétences (${competences.length})`),
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
        ],
      },
    ],
  };
}
