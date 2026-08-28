import Header from "../components/header.js";

export default function PageContact() {
  return {
    type: "div",
    attributes: [["class", ["page", "page-contact"]]],
    children: [
      Header("/contact"),
      {
        type: "main",
        children: [
          {
            type: "h1",
            children: ["Contact"],
          },
          {
            type: "section",
            children: [
              {
                type: "p",
                children: [
                  "Formulaire de contact et coordonnées du candidat connectés à l'API Strapi.",
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}
