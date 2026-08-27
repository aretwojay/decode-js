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
            children: [
              Link("/", "Accueil"),
              { type: "span", children: [" | "] },
              Link("/portfolio", "Portfolio"),
              { type: "span", children: [" | "] },
              Link("/cv", "CV"),
              { type: "span", children: [" | "] },
              Link("/contact", "Contact"),
              { type: "span", children: [" | "] },
              Link("/dashboard", "Administration"),
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
            type: "p",
            children: [
              "Bienvenue sur l'application SPA Vanilla JavaScript. Choisissez une section pour naviguer.",
            ],
          },
        ],
      },
    ],
  };
}
