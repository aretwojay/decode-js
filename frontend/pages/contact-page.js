import Link from "../components/router/link.js";

export default function PageContact() {
  return {
    type: "div",
    attributes: [["class", ["page", "page-contact"]]],
    children: [
      {
        type: "h1",
        children: ["Contact"],
      },
      {
        type: "nav",
        children: [
          Link("/", "← Retour à l'accueil"),
        ],
      },
      {
        type: "section",
        children: [
          {
            type: "p",
            children: [
              "Formulaire de contact et coordonnées du candidat.",
            ],
          },
        ],
      },
    ],
  };
}
