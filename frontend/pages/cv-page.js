import Link from "../components/router/link.js";
import reactive from "../lib/reactive.js";
import { appStore, updateProfile, addSkill, removeSkill, resetStore } from "../lib/store.js";

function renderCVPreview(state) {
  const { profile, skills, experiences } = state;

  return {
    type: "section",
    attributes: [
      ["id", "cv-preview-container"],
      ["style", [
        ["border", "2px solid #3b82f6"],
        ["borderRadius", "8px"],
        ["padding", "16px"],
        ["marginTop", "16px"],
        ["backgroundColor", "#f8fafc"],
      ]],
    ],
    children: [
      {
        type: "h2",
        attributes: [["style", [["color", "#1e3a8a"], ["marginTop", "0"]]]],
        children: ["Aperçu Réactif en Temps Réel (Live Preview)"],
      },
      {
        type: "div",
        attributes: [["id", "preview-profile"]],
        children: [
          {
            type: "h3",
            attributes: [["id", "preview-name"], ["style", [["margin", "4px 0"]]]],
            children: [profile.nom || "(Nom vide)"],
          },
          {
            type: "p",
            attributes: [["id", "preview-title"], ["style", [["fontWeight", "bold"], ["color", "#475569"]]]],
            children: [profile.titre || "(Titre vide)"],
          },
          {
            type: "p",
            attributes: [["id", "preview-bio"], ["style", [["fontStyle", "italic"]]]],
            children: [profile.bio || "(Bio vide)"],
          },
          {
            type: "p",
            attributes: [["style", [["fontSize", "0.9em"], ["color", "#64748b"]]]],
            children: [`📍 ${profile.ville} | ✉️ ${profile.email}`],
          },
        ],
      },
      {
        type: "hr",
      },
      {
        type: "div",
        children: [
          {
            type: "h4",
            children: ["Compétences :"],
          },
          {
            type: "ul",
            attributes: [["id", "preview-skills-list"]],
            children: skills.map((skill) => ({
              type: "li",
              children: [
                `${skill.titre} (${skill.niveau}) `,
                {
                  type: "button",
                  attributes: [["style", [["marginLeft", "8px"], ["fontSize", "0.8em"], ["cursor", "pointer"]]]],
                  events: [
                    ["click", () => removeSkill(skill.id)],
                  ],
                  children: ["✖ Supprimer"],
                },
              ],
            })),
          },
        ],
      },
      {
        type: "div",
        children: [
          {
            type: "h4",
            children: ["Expériences :"],
          },
          {
            type: "ul",
            children: experiences.map((exp) => ({
              type: "li",
              children: [
                {
                  type: "strong",
                  children: [`${exp.titre} @ ${exp.entreprise} `],
                },
                `(${exp.date_debut} - ${exp.date_fin || "Présent"}) : ${exp.description}`,
              ],
            })),
          },
        ],
      },
    ],
  };
}

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
          ["style", [
            ["marginTop", "16px"],
            ["padding", "16px"],
            ["border", "1px solid #cbd5e1"],
            ["borderRadius", "8px"],
          ]],
        ],
        children: [
          {
            type: "h3",
            children: ["Formulaire d'Édition du Profil"],
          },
          {
            type: "div",
            attributes: [["style", [["display", "flex"], ["flexDirection", "column"], ["gap", "10px"], ["maxWidth", "500px"]]]],
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
                attributes: [["style", [["marginTop", "8px"], ["display", "flex"], ["gap", "8px"]]]],
                children: [
                  {
                    type: "button",
                    attributes: [
                      ["id", "btn-add-skill-ts"],
                      ["style", [["padding", "6px 12px"], ["cursor", "pointer"]]],
                    ],
                    events: [
                      ["click", () => addSkill({ titre: "TypeScript", niveau: "avance" })],
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
                      ["click", () => addSkill({ titre: "Node.js", niveau: "expert" })],
                    ],
                    children: ["+ Ajouter Compétence Node.js"],
                  },
                  {
                    type: "button",
                    attributes: [
                      ["id", "btn-reset-store"],
                      ["style", [["padding", "6px 12px"], ["cursor", "pointer"], ["backgroundColor", "#fee2e2"], ["borderColor", "#f87171"]]],
                    ],
                    events: [
                      ["click", () => {
                        resetStore();
                        window.location.reload();
                      }],
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
