import Header from "../components/header.js";

function Section(numero, titre, children) {
  return {
    type: "section",
    attributes: [["class", ["legal-section"]]],
    children: [{ type: "h2", children: [`${numero}. ${titre}`] }, ...children],
  };
}

function P(...children) {
  return { type: "p", children };
}

function List(items) {
  return {
    type: "ul",
    children: items.map((item) => ({ type: "li", children: Array.isArray(item) ? item : [item] })),
  };
}

export default function PageConfidentialite() {
  return {
    type: "div",
    attributes: [["class", ["page", "page-legal"]]],
    children: [
      Header("/confidentialite"),
      {
        type: "main",
        attributes: [["id", "main"], ["class", ["legal-content"]]],
        children: [
          { type: "h1", children: ["Politique de confidentialité"] },
          P("Imprint collecte des données personnelles pour vous permettre de créer et publier votre portfolio. Cette politique explique quelles données, pourquoi, combien de temps, et quels sont vos droits."),

          Section(1, "Qui sommes-nous ?", [
            P("Imprint est un projet réalisé par Iris AYIVODJI, Yaniss LAMBEAU et Ruben KABANGA MUYA, dans le cadre du titre RNCP39235 \"Chef de projet digital\", au sein de l'école .decode (10 rue de la Pierre Levée, 75011 Paris)."),
          ]),

          Section(2, "Référent données personnelles", [
            P(
              "En l'absence d'un DPO dédié (projet académique), toute question relative à vos données est à adresser à l'équipe projet : ",
              { type: "a", attributes: [["href", "mailto:contact@imprint.dev"]], children: ["contact@imprint.dev"] },
              "."
            ),
          ]),

          Section(3, "Données collectées", [
            P("Les données sont exclusivement déclaratives : celles que vous saisissez vous-même."),
            List([
              "Identification : nom d'utilisateur, adresse email, mot de passe (chiffré)",
              "Contenu du portfolio : profil, projets, compétences, expériences, formations que vous renseignez",
              "Préférence de thème sélectionnée",
            ]),
          ]),

          Section(4, "Finalités et base légale", [
            List([
              [{ type: "strong", children: ["Exécution du contrat"] }, " : créer votre compte et générer votre portfolio"],
              [{ type: "strong", children: ["Consentement"] }, " : cookies de mesure d'audience (facultatifs)"],
            ]),
            P("Aucune donnée n'est utilisée à des fins de prospection commerciale ou revendue à des tiers."),
          ]),

          Section(5, "Destinataires des données", [
            P(
              "Seule l'équipe projet a accès à vos données, dans le cadre de la maintenance du service. Elles sont hébergées chez Cloudflare, Inc. (voir nos ",
              {
                type: "a",
                attributes: [["href", "/mentions-legales"]],
                children: ["mentions légales"],
                events: [
                  [
                    "click",
                    (event) => {
                      event.preventDefault();
                      window.history.pushState({}, undefined, "/mentions-legales");
                      window.dispatchEvent(new Event("pushstate"));
                    },
                  ],
                ],
              },
              "). Aucune donnée n'est transférée à d'autres tiers."
            ),
          ]),

          Section(6, "Durée de conservation", [
            P("Vos données sont conservées tant que votre compte reste actif. En cas de suppression de compte, elles sont effacées sous 30 jours, sauf obligation légale contraire."),
          ]),

          Section(7, "Sécurité", [
            P("Mots de passe chiffrés, échanges sécurisés en HTTPS, données d'un compte strictement isolées des autres comptes (chaque utilisateur ne voit et ne modifie que son propre profil et ses propres projets)."),
          ]),

          Section(8, "Cookies", [
            P("Un cookie/stockage local strictement nécessaire (session de connexion) et, si vous l'acceptez via la bannière de consentement, un cookie de mesure d'audience anonymisée. Aucun cookie publicitaire."),
            {
              type: "button",
              attributes: [["type", "button"], ["class", ["link-button"]]],
              children: ["Gérer mes préférences cookies"],
              events: [["click", () => window.dispatchEvent(new Event("open-cookie-banner"))]],
            },
          ]),

          Section(9, "Vos droits", [
            P("Conformément au RGPD, vous disposez des droits suivants :"),
            List([
              [{ type: "strong", children: ["Accès"] }, " : obtenir la confirmation et le détail des données traitées"],
              [{ type: "strong", children: ["Rectification"] }, " : corriger une donnée inexacte ou incomplète"],
              [{ type: "strong", children: ["Effacement"] }, " : demander la suppression de vos données"],
              [{ type: "strong", children: ["Limitation"] }, " : demander la restriction d'un traitement"],
              [{ type: "strong", children: ["Opposition"] }, " : vous opposer à un traitement pour motif légitime"],
              [{ type: "strong", children: ["Portabilité"] }, " : récupérer vos données dans un format structuré"],
              [{ type: "strong", children: ["Retrait du consentement"] }, " : à tout moment, sans effet rétroactif"],
              [{ type: "strong", children: ["Réclamation"] }, " : auprès de la CNIL (3 Place de Fontenoy, 75007 Paris) si vous estimez vos droits non respectés"],
            ]),
            P(
              "Pour exercer ces droits, contactez ",
              { type: "a", attributes: [["href", "mailto:contact@imprint.dev"]], children: ["contact@imprint.dev"] },
              " en justifiant votre identité."
            ),
          ]),

          Section(10, "Mise à jour", [
            P("Cette politique peut être mise à jour ; consultez régulièrement cette page."),
          ]),
        ],
      },
    ],
  };
}
