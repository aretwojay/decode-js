import Header from "../components/header.js";

function Section(numero, titre, paragraphes) {
  return {
    type: "section",
    attributes: [["class", ["legal-section"]]],
    children: [
      { type: "h2", children: [`${numero}. ${titre}`] },
      ...paragraphes.map((p) => ({ type: "p", children: Array.isArray(p) ? p : [p] })),
    ],
  };
}

export default function PageMentionsLegales() {
  return {
    type: "div",
    attributes: [["class", ["page", "page-legal"]]],
    children: [
      Header("/mentions-legales"),
      {
        type: "main",
        attributes: [["id", "main"], ["class", ["legal-content"]]],
        children: [
          { type: "h1", children: ["Mentions légales"] },
          Section(1, "Éditeur du site", [
            "Ce site est un projet réalisé dans le cadre du titre RNCP39235 \"Chef de projet digital\", au sein de l'école .decode (SAS Decode — Code APE 8542Z, SIRET 939 510 376 00022), 10 rue de la Pierre Levée, 75011 Paris.",
            "Édité par l'équipe projet : Iris AYIVODJI, Yaniss LAMBEAU, Ruben KABANGA MUYA.",
          ]),
          Section(2, "Contact", [
            [
              "Email : ",
              {
                type: "a",
                attributes: [["href", "mailto:contact@imprint.dev"]],
                children: ["contact@imprint.dev"],
              },
            ],
          ]),
          Section(3, "Directeur de publication", [
            "L'équipe projet, dans le cadre de son évaluation académique (Bloc 2 — RNCP39235).",
          ]),
          Section(4, "Hébergement", [
            "Cloudflare, Inc. — 101 Townsend St, San Francisco, CA 94107, États-Unis. Prestataire sélectionné via appel d'offres (Lot 3 — Infrastructure).",
          ]),
          Section(5, "Données personnelles", [
            [
              "Le traitement des données personnelles est détaillé dans notre ",
              {
                type: "a",
                attributes: [["href", "/confidentialite"]],
                children: ["politique de confidentialité"],
                events: [
                  [
                    "click",
                    (event) => {
                      event.preventDefault();
                      window.history.pushState({}, undefined, "/confidentialite");
                      window.dispatchEvent(new Event("pushstate"));
                    },
                  ],
                ],
              },
              ".",
            ],
          ]),
          Section(6, "Liens externes", [
            "Ce site peut contenir des liens vers des sites tiers. Nous ne sommes pas responsables de leur contenu ni de leurs pratiques en matière de confidentialité.",
          ]),
        ],
      },
    ],
  };
}
