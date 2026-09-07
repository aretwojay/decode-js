import Link from "../../components/router/link.js";
import createState from "../../lib/create-state.js";
import reactive from "../../lib/reactive.js";
import {
  renderEmptyState,
  renderInlineConfirm,
  showToast,
} from "../../components/ui-feedback.js";
import {
  projectCrud,
  extractBlocksText,
  textToBlocks,
  syncStoreFromApi,
  uploadMedia,
} from "../../lib/api.js";
import { extractTechnologies } from "../portfolio.js";
import {
  refresh,
  slugify,
  STATUT_LABELS,
  getAllowedStatuts,
  renderStatusBadge,
} from "./admin-common.js";

/**
 * 2. GESTIONNAIRE COMPLET DE PROJETS (CRUD ENRICHI + UPLOAD MÉDIAS)
 */
export function ProjectsManager(projects = []) {
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
              ". Vous pouvez y associer des fichiers et visuels via la médiathèque.",
            ],
          },
        ],
      },

      // Formulaire réactif (Mode Création ou Modification)
      reactive(editingProjectState, (editingProject) => {
        const isEditing = Boolean(editingProject);
        const allowedStatuts = getAllowedStatuts(editingProject?.statut);

        // Médias existants rattachés au projet
        const initialExistingMedia = Array.isArray(editingProject?.image)
          ? editingProject.image
          : editingProject?.image && typeof editingProject.image === "object"
          ? [editingProject.image]
          : [];

        const existingMediaState = createState(initialExistingMedia);
        const pendingFilesState = createState([]);
        const isUploadingState = createState(false);

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

          isUploadingState.set(true);

          try {
            // 1. Uploader les nouveaux fichiers sélectionnés s'il y en a
            const pendingFiles = pendingFilesState.get() || [];
            let newlyUploadedMedia = [];

            if (pendingFiles.length > 0) {
              showToast(`Upload de ${pendingFiles.length} fichier(s) en cours...`, "info");
              newlyUploadedMedia = await uploadMedia(pendingFiles);
              showToast("Fichier(s) téléversé(s) dans la médiathèque avec succès !", "success");
            }

            // 2. Assembler la liste de tous les IDs de médias (conservés + nouvellement uploadés)
            const remainingExistingIds = (existingMediaState.get() || [])
              .map((m) => m.id)
              .filter(Boolean);
            const newMediaIds = newlyUploadedMedia
              .map((m) => m.id)
              .filter(Boolean);
            const allMediaIds = [...remainingExistingIds, ...newMediaIds];

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
              image: allMediaIds,
            };

            if (isEditing) {
              await projectCrud.update(editingProject.documentId, payload);
              showToast(`Projet « ${titre} » mis à jour avec succès !`, "success");
            } else {
              await projectCrud.create(payload);
              showToast(`Projet « ${titre} » créé avec succès !`, "success");
            }

            editingProjectState.set(null);
            pendingFilesState.set([]);
            await syncStoreFromApi();
            refresh();
          } catch (err) {
            console.error("[ProjectsManager] Erreur soumission projet:", err);
            showToast("Erreur lors de l'enregistrement du projet : " + err.message, "error");
          } finally {
            isUploadingState.set(false);
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

            // SECTION UPLOAD FICHIERS & MÉDIATHÈQUE (T0029)
            {
              type: "div",
              attributes: [["class", ["form-group", "admin-media-upload-section"]]],
              children: [
                {
                  type: "label",
                  attributes: [["for", "proj-files"], ["class", ["form-label-bold"]]],
                  children: ["📁 Visuels & Médias du projet (Strapi Media Library)"],
                },
                {
                  type: "p",
                  attributes: [["class", ["form-help-text"]]],
                  children: [
                    "Ajoutez un ou plusieurs fichiers (PNG, JPEG, WebP, SVG, PDF). Les visuels seront affichés en couverture sur le catalogue et en galerie sur la fiche détaillée.",
                  ],
                },

                // Sélecteur de fichiers
                {
                  type: "div",
                  attributes: [["class", ["file-input-wrapper"]]],
                  children: [
                    {
                      type: "input",
                      attributes: [
                        ["id", "proj-files"],
                        ["name", "media_files"],
                        ["type", "file"],
                        ["multiple", true],
                        ["accept", "image/*,application/pdf"],
                        ["class", ["form-control-file"]],
                      ],
                      events: [
                        [
                          "change",
                          (event) => {
                            const files = Array.from(event.target.files || []);
                            pendingFilesState.set(files);
                          },
                        ],
                      ],
                    },
                  ],
                },

                // Aperçu réactif des nouveaux fichiers sélectionnés localement
                reactive(pendingFilesState, (pendingFiles) => {
                  if (!pendingFiles || pendingFiles.length === 0) {
                    return { type: "span", children: [] };
                  }
                  return {
                    type: "div",
                    attributes: [["class", ["pending-media-box"]]],
                    children: [
                      {
                        type: "p",
                        attributes: [["class", ["pending-media-title"]]],
                        children: [`📤 ${pendingFiles.length} nouveau(x) fichier(s) prêt(s) à être téléversé(s) :`],
                      },
                      {
                        type: "ul",
                        attributes: [["class", ["pending-media-list"]]],
                        children: pendingFiles.map((file) => ({
                          type: "li",
                          attributes: [["class", ["pending-media-item"]]],
                          children: [
                            `📄 ${file.name} `,
                            {
                              type: "span",
                              attributes: [["class", ["media-size-badge"]]],
                              children: [`(${Math.round(file.size / 1024)} Ko)`],
                            },
                          ],
                        })),
                      },
                    ],
                  };
                }),

                // Aperçu réactif des médias déjà associés
                reactive(existingMediaState, (mediaList) => {
                  if (!mediaList || mediaList.length === 0) {
                    return {
                      type: "p",
                      attributes: [["class", ["existing-media-empty"]]],
                      children: ["Aucun fichier actuellement associé à ce projet."],
                    };
                  }

                  return {
                    type: "div",
                    attributes: [["class", ["existing-media-wrapper"]]],
                    children: [
                      {
                        type: "p",
                        attributes: [["class", ["existing-media-title"]]],
                        children: [`🖼️ Médias associés (${mediaList.length}) :`],
                      },
                      {
                        type: "div",
                        attributes: [["class", ["existing-media-grid"]]],
                        children: mediaList.map((m) => {
                          const isImg = m.mime?.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(m.url || "");
                          const mediaUrl = m.url?.startsWith("http") ? m.url : m.url ? m.url : "";

                          return {
                            type: "div",
                            attributes: [["class", ["media-preview-card"]]],
                            children: [
                              isImg && mediaUrl
                                ? {
                                    type: "img",
                                    attributes: [
                                      ["src", mediaUrl],
                                      ["alt", m.alternativeText || m.name || "Visuel projet"],
                                      ["class", ["media-thumbnail"]],
                                    ],
                                  }
                                : {
                                    type: "div",
                                    attributes: [["class", ["media-doc-placeholder"]]],
                                    children: ["📄 Document"],
                                  },
                              {
                                type: "div",
                                attributes: [["class", ["media-card-info"]]],
                                children: [
                                  {
                                    type: "span",
                                    attributes: [["class", ["media-card-name"]], ["title", m.name || ""]],
                                    children: [m.name || "Fichier"],
                                  },
                                ],
                              },
                              {
                                type: "button",
                                attributes: [
                                  ["type", "button"],
                                  ["class", ["btn", "btn-sm", "btn-danger", "media-remove-btn"]],
                                  ["title", "Retirer ce fichier du projet"],
                                ],
                                events: [
                                  [
                                    "click",
                                    () => {
                                      const updated = existingMediaState.get().filter((item) => item.id !== m.id);
                                      existingMediaState.set(updated);
                                      showToast(`Média « ${m.name || ""} » retiré du projet. Enregistrez pour valider.`, "info");
                                    },
                                  ],
                                ],
                                children: ["✕ Retirer"],
                              },
                            ],
                          };
                        }),
                      },
                    ],
                  };
                }),
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

            // Boutons d'action & indicateur de chargement
            reactive(isUploadingState, (isUploading) => ({
              type: "div",
              attributes: [["class", ["form-actions"]]],
              children: [
                {
                  type: "button",
                  attributes: [
                    ["type", "submit"],
                    ["class", ["btn", "btn-primary"]],
                    ...(isUploading ? [["disabled", "disabled"]] : []),
                  ],
                  children: [
                    isUploading
                      ? "⏳ Téléversement & Enregistrement en cours..."
                      : isEditing
                      ? "Enregistrer les modifications"
                      : "Créer le projet",
                  ],
                },
                isEditing && !isUploading
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
            })),
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
              const projectImages = Array.isArray(p.image) ? p.image : p.image ? [p.image] : [];
              const hasImages = projectImages.length > 0;

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
                          hasImages
                            ? {
                                type: "span",
                                attributes: [["class", ["badge-media-count"]]],
                                children: [`🖼️ ${projectImages.length} média(s)`],
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
