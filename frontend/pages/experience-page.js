import { fetchExperiences } from "../lib/api.js";
import Link from "../components/router/link.js";

export default async function PageExperience() {
  const experiences = await fetchExperiences();

  return {
    type: "div",
    attributes: [["class", ["page", "page-experiences"]]],
    children: [
      {
        type: "h1",
        children: ["Expériences Professionnelles"],
      },
      {
        type: "nav",
        children: [
          Link("/", "← Retour à l'accueil"),
        ],
      },
      {
        type: "section",
        attributes: [["class", ["experience-list"]]],
        children:
          experiences && experiences.length > 0
            ? experiences.map((exp) => ({
                type: "div",
                attributes: [["class", ["experience-card"]]],
                children: [
                  { type: "h3", children: [exp.titre || "Poste"] },
                  {
                    type: "p",
                    attributes: [["class", ["experience-company"]]],
                    children: [
                      exp.entreprise || "",
                      exp.date_debut ? ` (${exp.date_debut}${exp.date_fin ? " - " + exp.date_fin : " - Présent"})` : "",
                    ],
                  },
                  {
                    type: "p",
                    attributes: [["class", ["experience-description"]]],
                    children: [
                      typeof exp.description === "string"
                        ? exp.description
                        : "Détails de l'expérience professionnelle.",
                    ],
                  },
                ],
              }))
            : [
                {
                  type: "p",
                  attributes: [["class", ["empty-state"]]],
                  children: ["Aucune expérience publiée pour le moment. Consultez le panneau d'administration pour en ajouter."],
                },
              ],
      },
    ],
  };
}