import { getTheme } from "../lib/theme.js";
import { NavLink } from "./header.js";
import { appStore } from "../lib/store.js";

/**
 * Reusable Global Footer Component (T0020)
 * Provides consistent navigation, social links, availability status, and dynamic copyright.
 *
 * @param {Object} [options]
 * @param {string} [options.candidateName]
 * @param {string} [options.githubUrl]
 * @param {string} [options.linkedinUrl]
 * @param {boolean} [options.isAvailable]
 * @returns {Object} Vanilla-engine structure object
 */
export default function Footer(options = {}) {
  const storeState =
    appStore && typeof appStore.getState === "function"
      ? appStore.getState()
      : appStore && typeof appStore.get === "function"
      ? appStore.get()
      : null;
  const profile = storeState?.profile;

  const candidateName =
    options.candidateName || profile?.nom || "Ruben Kabangamuya";
  const githubUrl =
    options.githubUrl || profile?.github || "https://github.com";
  const linkedinUrl =
    options.linkedinUrl || profile?.linkedin || "https://linkedin.com";
  const isAvailable =
    options.isAvailable !== undefined
      ? options.isAvailable
      : profile?.disponible !== undefined
      ? profile.disponible
      : true;

  const isIris = getTheme() === "iris";

  if (isIris) {
    return {
      type: "footer",
      attributes: [["class", ["site-footer", "site-footer-iris"]]],
      children: [
        {
          type: "div",
          attributes: [["class", ["footer-find-me"]]],
          children: [
            { type: "span", children: ["Retrouver moi sur :"] },
            {
              type: "a",
              attributes: [
                ["href", "#"],
                ["target", "_blank"],
                ["rel", "noopener noreferrer"],
                ["class", ["footer-icon-link"]],
                ["aria-label", "Instagram"],
              ],
              children: [
                {
                  type: "div",
                  attributes: [["class", ["footer-icon", "icon-instagram"]]],
                  children: [],
                },
              ],
            },
            {
              type: "span",
              attributes: [["class", ["footer-sep"]]],
              children: ["|"],
            },
            {
              type: "a",
              attributes: [
                ["href", linkedinUrl],
                ["target", "_blank"],
                ["rel", "noopener noreferrer"],
                ["class", ["footer-icon-link"]],
                ["aria-label", "LinkedIn"],
              ],
              children: [
                {
                  type: "div",
                  attributes: [["class", ["footer-icon", "icon-linkedin"]]],
                  children: [],
                },
              ],
            },
          ],
        },
        {
          type: "div",
          attributes: [["class", ["footer-handle"]]],
          children: [
            { type: "span", children: ["@irisayivodjiDev"] },
            {
              type: "a",
              attributes: [
                ["href", githubUrl],
                ["target", "_blank"],
                ["rel", "noopener noreferrer"],
                ["class", ["footer-icon-link"]],
                ["aria-label", "GitHub"],
              ],
              children: [
                {
                  type: "div",
                  attributes: [["class", ["footer-icon", "icon-github"]]],
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    };
  }

  return {
    type: "footer",
    attributes: [["class", ["site-footer"]]],
    children: [
      {
        type: "div",
        attributes: [["class", ["footer-content"]]],
        children: [
          {
            type: "div",
            attributes: [["class", ["footer-brand-info"]]],
            children: [
              {
                type: "p",
                attributes: [["class", ["footer-copyright"]]],
                children: [
                  `© ${new Date().getFullYear()} ${candidateName}. Propulsé par Vanilla-Engine & Strapi 5.`,
                ],
              },
              isAvailable
                ? {
                    type: "span",
                    attributes: [
                      ["class", ["footer-availability", "status-available"]],
                    ],
                    children: ["🟢 Disponible pour de nouveaux projets"],
                  }
                : {
                    type: "span",
                    attributes: [
                      ["class", ["footer-availability", "status-busy"]],
                    ],
                    children: ["🟡 Actuellement en mission"],
                  },
            ],
          },
          {
            type: "nav",
            attributes: [
              ["class", ["footer-nav"]],
              ["aria-label", "Navigation pied de page"],
            ],
            children: [
              NavLink("/", "Accueil", ["footer-link"]),
              NavLink("/portfolio", "Portfolio", ["footer-link"]),
              NavLink("/experiences", "Expériences", ["footer-link"]),
              NavLink("/cv", "CV", ["footer-link"]),
              NavLink("/contact", "Contact", ["footer-link"]),
            ],
          },
          {
            type: "div",
            attributes: [["class", ["footer-socials"]]],
            children: [
              {
                type: "a",
                attributes: [
                  ["href", githubUrl],
                  ["target", "_blank"],
                  ["rel", "noopener noreferrer"],
                  ["class", ["footer-link", "footer-social-link"]],
                ],
                children: ["GitHub"],
              },
              {
                type: "a",
                attributes: [
                  ["href", linkedinUrl],
                  ["target", "_blank"],
                  ["rel", "noopener noreferrer"],
                  ["class", ["footer-link", "footer-social-link"]],
                ],
                children: ["LinkedIn"],
              },
            ],
          },
        ],
      },
    ],
  };
}
