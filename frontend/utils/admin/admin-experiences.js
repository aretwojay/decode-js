import Link from "../../components/router/link.js";
import createState from "../../lib/create-state.js";
import reactive from "../../lib/reactive.js";
import {
  renderEmptyState,
  renderInlineConfirm,
  showToast,
} from "../../components/ui-feedback.js";
import {
  experienceCrud,
  extractBlocksText,
  textToBlocks,
  syncStoreFromApi,
} from "../../lib/api.js";
import {
  refresh,
  slugify,
  STATUT_LABELS,
  getAllowedStatuts,
  renderStatusBadge,
} from "./admin-common.js";

/**
 * 3. GESTIONNAIRE COMPLET D'EXPÉRIENCES PROFESSIONNELLES
 */
export function ExperiencesManager(experiences = []) {
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
