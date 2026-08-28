import Header from "../components/header.js";
import Link from "../components/router/link.js";

export default function PagePortfolio() {
  return {
    type: "div",
    attributes: [["class", ["page", "page-portfolio"]]],
    children: [
      Header("/portfolio"),
      {
        type: "main",
        children: [
          {
            type: "h1",
            children: ["Portfolio & Projets"],
          },
          {
            type: "section",
            children: [
              {
                type: "p",
                children: ["Catalogue des projets réalisés :"],
              },
              {
                type: "ul",
                attributes: [["class", ["routes-list"]]],
                children: [
                  {
                    type: "li",
                    children: [
                      Link("/portfolio/projet-ecommerce", "Projet E-commerce (voir détail)"),
                    ],
                  },
                  {
                    type: "li",
                    children: [
                      Link("/portfolio/vanilla-spa-engine", "Vanilla SPA Engine (voir détail)"),
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}
