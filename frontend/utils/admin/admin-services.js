import createState from "../../lib/create-state.js";
import reactive from "../../lib/reactive.js";
import {
  renderEmptyState,
  renderInlineConfirm,
  showToast,
} from "../../components/ui-feedback.js";
import { serviceCrud, syncStoreFromApi } from "../../lib/api.js";
import { refresh, STATUT_LABELS, renderStatusBadge } from "./admin-common.js";

const ICONE_LABELS = {
  code: "💻 Code",
  palette: "🎨 Design",
  search: "🔍 SEO",
  cloud: "☁️ Cloud",
};

/**
 * 5. GESTIONNAIRE DES SERVICES ("CE QUE JE FAIS" / "CHAMPS D'EXPERTISE")
 */
export function ServicesManager(services = []) {
  const deletingIdState = createState(null);

  async function handleAdd(event) {
    event.preventDefault();
    const form = event.target;
    const titre = form.titre.value.trim();
    const description = form.description.value.trim();
    const icone = form.icone.value;
    const statut = form.statut.value;
    const ordre = services.length;

    try {
      await serviceCrud.create({
        titre,
        description,
        icone,
        ordre,
        affichage_large: false,
        statut,
        publishedAt: statut === "publie" ? new Date().toISOString() : null,
      });
      showToast(`Service « ${titre} » ajouté !`, "success");
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
      ["id", "services-management"],
      ["class", ["admin-section", "admin-services-section"]],
    ],
    children: [
      {
        type: "header",
        attributes: [["class", ["admin-section-header"]]],
        children: [
          { type: "h2", children: ["Mes Services & Expertises"] },
          {
            type: "p",
            attributes: [["class", ["admin-section-desc"]]],
            children: [
              "Les cartes affichées dans la section « Ce que je fais » / « Champs d'expertise » de votre page d'accueil.",
            ],
          },
        ],
      },

      // Formulaire d'ajout rapide
      {
        type: "form",
        attributes: [["class", ["admin-form", "admin-form-box", "admin-service-form"]]],
        events: [["submit", handleAdd]],
        children: [
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
                    attributes: [["for", "service-titre"]],
                    children: ["Titre *"],
                  },
                  {
                    type: "input",
                    attributes: [
                      ["id", "service-titre"],
                      ["name", "titre"],
                      ["type", "text"],
                      ["required", true],
                      ["maxlength", 100],
                      ["placeholder", "ex: Langages & Frameworks"],
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
                    attributes: [["for", "service-icone"]],
                    children: ["Icône *"],
                  },
                  {
                    type: "select",
                    attributes: [
                      ["id", "service-icone"],
                      ["name", "icone"],
                      ["required", true],
                    ],
                    children: Object.entries(ICONE_LABELS).map(([val, label]) => ({
                      type: "option",
                      attributes: [["value", val]],
                      children: [label],
                    })),
                  },
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
                attributes: [["for", "service-description"]],
                children: ["Description *"],
              },
              {
                type: "textarea",
                attributes: [
                  ["id", "service-description"],
                  ["name", "description"],
                  ["rows", 3],
                  ["required", true],
                  ["maxlength", 500],
                  ["placeholder", "Décrivez ce service en quelques phrases..."],
                ],
                children: [],
              },
            ],
          },
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
                    attributes: [["for", "service-statut"]],
                    children: ["Statut *"],
                  },
                  {
                    type: "select",
                    attributes: [
                      ["id", "service-statut"],
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
              { type: "span", children: [] },
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
                children: ["➕ Ajouter le service"],
              },
            ],
          },
        ],
      },

      // Liste des services existants
      services.length === 0
        ? renderEmptyState({
            icon: "🧩",
            title: "Aucun service enregistré",
            description: "Ajoutez vos services ci-dessus pour qu'ils apparaissent sur votre page d'accueil.",
          })
        : reactive(deletingIdState, (deletingId) => ({
            type: "div",
            attributes: [["class", ["admin-services-grid"]]],
            children: services.map((s) => {
              const isDeleting = deletingId === s.documentId;
              return {
                type: "div",
                attributes: [["class", ["service-admin-chip"]]],
                children: [
                  {
                    type: "div",
                    attributes: [["class", ["service-chip-content"]]],
                    children: [
                      {
                        type: "strong",
                        attributes: [["class", ["service-chip-title"]]],
                        children: [s.titre || "(Sans titre)"],
                      },
                      {
                        type: "p",
                        attributes: [["class", ["service-chip-desc"]]],
                        children: [s.description || ""],
                      },
                      renderStatusBadge(s.statut),
                    ],
                  },
                  isDeleting
                    ? renderInlineConfirm({
                        message: "Supprimer ?",
                        onConfirm: async () => {
                          try {
                            await serviceCrud.remove(s.documentId);
                            showToast("Service supprimé.", "info");
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
                          ["title", "Supprimer ce service"],
                        ],
                        events: [["click", () => deletingIdState.set(s.documentId)]],
                        children: ["✕"],
                      },
                ],
              };
            }),
          })),
    ],
  };
}
