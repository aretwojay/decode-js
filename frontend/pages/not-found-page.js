import Header, { NavLink } from "../components/header.js";
import Footer from "../components/footer.js";
import { updateHead } from "../utils/head-manager.js";

/**
 * Global 404 Not Found Page Component (T0020)
 * @returns {Object} Vanilla-engine structure object
 */
export default function Page404() {
  updateHead({
    title: "Page introuvable | 404",
    description:
      "L'adresse que vous tentez d'ouvrir n'existe pas ou a été déplacée.",
    type: "website",
  });

  return {
    type: "div",
    attributes: [["class", ["page", "page-404"]]],
    children: [
      Header("/"),
      {
        type: "main",
        attributes: [
          ["id", "main-content"],
          ["tabindex", "-1"],
        ],
        children: [
          {
            type: "div",
            attributes: [["class", ["empty-state-card", "not-found-card"]]],
            children: [
              {
                type: "div",
                attributes: [["class", ["empty-state-icon"]]],
                children: ["🧭"],
              },
              {
                type: "h1",
                attributes: [["class", ["empty-state-title"]]],
                children: ["Page introuvable"],
              },
              {
                type: "p",
                attributes: [["class", ["empty-state-desc"]]],
                children: [
                  "L'adresse que vous tentez d'ouvrir n'existe pas ou a été déplacée.",
                ],
              },
              {
                type: "div",
                attributes: [["class", ["empty-state-action"]]],
                children: [
                  NavLink("/", "← Retour à l'accueil", [
                    "btn",
                    "btn-primary",
                    "empty-state-btn",
                  ]),
                  NavLink("/portfolio", "Explorer le portfolio", [
                    "btn",
                    "btn-secondary",
                    "empty-state-btn",
                  ]),
                ],
              },
            ],
          },
        ],
      },
      Footer(),
    ],
  };
}
