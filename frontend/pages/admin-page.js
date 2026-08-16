import Link from "../components/router/link.js";

export default function PageAdmin() {
  return {
    type: "div",
    attributes: [["class", ["page", "page-admin"]]],
    children: [
      {
        type: "h1",
        children: ["Administration CMS Strapi"],
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
              "Accès au panneau d'administration Strapi pour la gestion des contenus et des workflows éditoriaux :",
            ],
          },
          {
            type: "p",
            children: [
              {
                type: "a",
                attributes: [
                  ["href", "http://localhost:1337/admin"],
                  ["target", "_blank"],
                  ["rel", "noopener noreferrer"],
                ],
                children: ["Ouvrir Strapi Admin (http://localhost:1337/admin) ↗"],
              },
            ],
          },
        ],
      },
    ],
  };
}
