import Link from "../components/router/link.js";
import reactive from "../lib/reactive.js";
import { appStore, updateProfile, addSkill, resetStore } from "../lib/store.js";
import { renderCVPreview } from "../utils/cv.js";

/**
 * CV & Profile State Management Page Component
 * @returns {Object} Vanilla-engine structure object
 */
export default function PageCV() {
  const currentProfile = appStore.getState().profile;

  return {
    type: "div",
    attributes: [["class", ["page", "page-cv"]]],
    children: [
      {
        type: "h1",
        children: ["Éditeur & Curriculum Vitae (State Management)"],
      },
      {
        type: "nav",
        children: [
          Link("/", "← Accueil"),
          { type: "span", children: [" | "] },
          Link("/portfolio", "Portfolio"),
          { type: "span", children: [" | "] },
          Link("/contact", "Contact"),
        ],
      },
      {
        type: "section",
        attributes: [
          ["id", "editor-form-section"],
          [
            "style",
            [
              ["marginTop", "16px"],
              ["padding", "16px"],
              ["border", "1px solid #cbd5e1"],
              ["borderRadius", "8px"],
            ],
          ],
        ],
        children: [
          {
            type: "h3",
            children: ["Formulaire d'Édition du Profil"],
          },
          {
            type: "div",
            attributes: [
              [
                "style",
                [
                  ["display", "flex"],
                  ["flexDirection", "column"],
                  ["gap", "10px"],
                  ["maxWidth", "500px"],
                ],
              ],
            ],
            children: [
              {
                type: "label",
                children: [
                  "Nom complet : ",
                  {
                    type: "input",
                    attributes: [
                      ["id", "input-nom"],
                      ["type", "text"],
                      ["value", currentProfile.nom],
                      ["style", [["width", "100%"], ["padding", "6px"]]],
                    ],
                    events: [
                      ["input", (e) => updateProfile({ nom: e.target.value })],
                    ],
                  },
                ],
              },
              {
                type: "label",
                children: [
                  "Titre professionnel : ",
                  {
                    type: "input",
                    attributes: [
                      ["id", "input-titre"],
                      ["type", "text"],
                      ["value", currentProfile.titre],
                      ["style", [["width", "100%"], ["padding", "6px"]]],
                    ],
                    events: [
                      ["input", (e) => updateProfile({ titre: e.target.value })],
                    ],
                  },
                ],
              },
              {
                type: "label",
                children: [
                  "Bio / Résumé : ",
                  {
                    type: "input",
                    attributes: [
                      ["id", "input-bio"],
                      ["type", "text"],
                      ["value", currentProfile.bio],
                      ["style", [["width", "100%"], ["padding", "6px"]]],
                    ],
                    events: [
                      ["input", (e) => updateProfile({ bio: e.target.value })],
                    ],
                  },
                ],
              },
              {
                type: "div",
                attributes: [
                  [
                    "style",
                    [["marginTop", "8px"], ["display", "flex"], ["gap", "8px"]],
                  ],
                ],
                children: [
                  {
                    type: "button",
                    attributes: [
                      ["id", "btn-add-skill-ts"],
                      ["style", [["padding", "6px 12px"], ["cursor", "pointer"]]],
                    ],
                    events: [
                      [
                        "click",
                        () =>
                          addSkill({ titre: "TypeScript", niveau: "avance" }),
                      ],
                    ],
                    children: ["+ Ajouter Compétence TypeScript"],
                  },
                  {
                    type: "button",
                    attributes: [
                      ["id", "btn-add-skill-node"],
                      ["style", [["padding", "6px 12px"], ["cursor", "pointer"]]],
                    ],
                    events: [
                      [
                        "click",
                        () =>
                          addSkill({ titre: "Node.js", niveau: "expert" }),
                      ],
                    ],
                    children: ["+ Ajouter Compétence Node.js"],
                  },
                  {
                    type: "button",
                    attributes: [
                      ["id", "btn-reset-store"],
                      [
                        "style",
                        [
                          ["padding", "6px 12px"],
                          ["cursor", "pointer"],
                          ["backgroundColor", "#fee2e2"],
                          ["borderColor", "#f87171"],
                        ],
                      ],
                    ],
                    events: [
                      [
                        "click",
                        () => {
                          resetStore();
                          window.location.reload();
                        },
                      ],
                    ],
                    children: ["🔄 Réinitialiser le store"],
                  },
                ],
              },
            ],
          },
        ],
      },
      // Intégration du composant réactif lié à appStore
      reactive(appStore, renderCVPreview),
    ],
  };
}
