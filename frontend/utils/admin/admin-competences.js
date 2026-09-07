import createState from "../../lib/create-state.js";
import reactive from "../../lib/reactive.js";
import {
  renderEmptyState,
  renderInlineConfirm,
  showToast,
} from "../../components/ui-feedback.js";
import { competenceCrud, syncStoreFromApi } from "../../lib/api.js";
import {
  refresh,
  STATUT_LABELS,
  renderStatusBadge,
} from "./admin-common.js";

/**
 * 4. GESTIONNAIRE DE COMPÉTENCES TECHNIQUES
 */
export function CompetencesManager(competences = []) {
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
