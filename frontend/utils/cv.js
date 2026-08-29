import { removeSkill } from "../lib/store.js";

/**
 * CV Live Preview Reactive Render Helper
 * @param {Object} state - Current appStore state
 * @returns {Object} Vanilla-engine structure object
 */
export function renderCVPreview(state) {
  const { profile, skills, experiences } = state;

  return {
    type: "section",
    attributes: [
      ["id", "cv-preview-container"],
      [
        "style",
        [
          ["border", "2px solid #3b82f6"],
          ["borderRadius", "8px"],
          ["padding", "16px"],
          ["marginTop", "16px"],
          ["backgroundColor", "#f8fafc"],
        ],
      ],
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
            attributes: [
              ["id", "preview-title"],
              ["style", [["fontWeight", "bold"], ["color", "#475569"]]],
            ],
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
                  attributes: [
                    [
                      "style",
                      [
                        ["marginLeft", "8px"],
                        ["fontSize", "0.8em"],
                        ["cursor", "pointer"],
                      ],
                    ],
                  ],
                  events: [["click", () => removeSkill(skill.id)]],
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
