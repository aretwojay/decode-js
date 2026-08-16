import Link from "../components/router/link.js";

export default function PageCV() {
  return {
    type: "div",
    attributes: [["class", ["page", "page-cv"]]],
    children: [
      {
        type: "h1",
        children: ["Curriculum Vitae"],
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
              "Vue CV : expériences professionnelles, compétences et formations.",
            ],
          },
        ],
      },
    ],
  };
}
