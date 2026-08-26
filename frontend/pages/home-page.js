import Link from "../components/router/link.js";

export default function PageHome() {
  return {
    type: "div",
    attributes: [["class", ["page", "page-home"]]],
    children: [
      {
        type: "header",
        children: [
          {
            type: "h1",
            children: ["Générateur de Portfolio / CV"],
          },
          {
            type: "nav",
            attributes: [["class", ["main-nav"]]],
            children: [
              Link("/", "Accueil"),
              { type: "span", children: [" | "] },
              Link("/portfolio", "Portfolio"),
              { type: "span", children: [" | "] },
              Link("/experiences", "Expériences"),
              { type: "span", children: [" | "] },
              Link("/cv", "CV"),
              { type: "span", children: [" | "] },
              Link("/contact", "Contact"),
              { type: "span", children: [" | "] },
              Link("/admin", "Administration"),
              { type: "span", children: [" | "] },
              Link("/table", "Démo Table"),
              { type: "span", children: [" | "] },
              Link("/gallery", "Démo Galerie"),
            ],
          },
        ],
      },
      {
        type: "main",
        children: [
          {
            type: "section",
            attributes: [["class", ["intro-section"]]],
            children: [
              {
                type: "p",
                children: [
                  "Bienvenue sur l'application SPA Vanilla JavaScript. Choisissez une section pour naviguer :",
                ],
              },
            ],
          },
          {
            type: "section",
            attributes: [["class", ["routes-directory"]]],
            children: [
              {
                type: "h2",
                children: ["Pages & Vues Applicatives"],
              },
              {
                type: "ul",
                attributes: [["class", ["routes-list"]]],
                children: [
                  {
                    type: "li",
                    children: [
                      Link("/", "Accueil (/)"),
                      { type: "span", children: [" — Page d'accueil et présentation générale"] },
                    ],
                  },
                  {
                    type: "li",
                    children: [
                      Link("/portfolio", "Portfolio & Projets (/portfolio)"),
                      { type: "span", children: [" — Catalogue des projets réalisés"] },
                    ],
                  },
                  {
                    type: "li",
                    children: [
                      Link("/portfolio/projet-ecommerce", "Détail Projet (/portfolio/projet-ecommerce)"),
                      { type: "span", children: [" — Route dynamique avec paramètre :slug"] },
                    ],
                  },
                  {
                    type: "li",
                    children: [
                      Link("/experiences", "Expériences (/experiences)"),
                      { type: "span", children: [" — Liste des expériences professionnelles depuis le CMS"] },
                    ],
                  },
                  {
                    type: "li",
                    children: [
                      Link("/cv", "Curriculum Vitae (/cv)"),
                      { type: "span", children: [" — Vue CV interactive avec thèmes et état réactif"] },
                    ],
                  },
                  {
                    type: "li",
                    children: [
                      Link("/contact", "Contact (/contact)"),
                      { type: "span", children: [" — Formulaire de contact connecté à l'API Strapi"] },
                    ],
                  },
                ],
              },
              {
                type: "h2",
                children: ["Espace Administration & Démos Techniques"],
              },
              {
                type: "ul",
                attributes: [["class", ["routes-list"]]],
                children: [
                  {
                    type: "li",
                    children: [
                      Link("/admin", "Administration (/admin)"),
                      { type: "span", children: [" — Panneau d'administration CMS Strapi"] },
                    ],
                  },
                  {
                    type: "li",
                    children: [
                      Link("/table", "Démo Table Réactive (/table)"),
                      { type: "span", children: [" — Composant tableau avec modification réactive de cellules"] },
                    ],
                  },
                  {
                    type: "li",
                    children: [
                      Link("/gallery", "Démo Galerie (/gallery)"),
                      { type: "span", children: [" — Galerie d'images et sélecteur de médias"] },
                    ],
                  },
                  {
                    type: "li",
                    children: [
                      Link("/page-inexistante-404", "Route 404 (/page-inexistante-404)"),
                      { type: "span", children: [" — Page de fallback introuvable"] },
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
