import Link from "../components/router/link.js";

export default function PageProjectDetail(params = {}) {
  const slug = params.slug || "inconnu";

  return {
    type: "div",
    attributes: [["class", ["page", "page-project-detail"]]],
    children: [
      {
        type: "h1",
        children: [`Détail du projet : ${slug}`],
      },
      {
        type: "nav",
        children: [
          Link("/portfolio", "← Retour au portfolio"),
          { type: "span", children: [" | "] },
          Link("/", "Accueil"),
        ],
      },
      {
        type: "section",
        children: [
          {
            type: "p",
            children: [
              `Paramètre dynamique extrait avec succès : slug = "${slug}".`,
            ],
          },
        ],
      },
    ],
  };
}
