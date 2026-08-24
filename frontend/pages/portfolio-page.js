import Link from "../components/router/link.js";

export default function PagePortfolio() {
  return {
    type: "div",
    attributes: [["class", ["page", "page-portfolio"]]],
    children: [
      {
        type: "h1",
        children: ["Portfolio & Projets"],
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
            children: ["Catalogue des projets réalisés :"],
          },
          {
            type: "ul",
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
                  Link("/portfolio/portfolio-vanilla-js", "Portfolio Vanilla JS (voir détail)"),
                ],
              },
              {
                type: "li",
                children: [
                  Link("/portfolio/application-mobile-flutter", "Application Mobile (voir détail)"),
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}
