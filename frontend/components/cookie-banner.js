import generateStructure from "../lib/generate-structure.js";

const CONSENT_KEY = "imprint_cookie_consent";

/**
 * Bandeau de consentement RGPD, monté une seule fois en dehors du routeur
 * (persiste entre les navigations, contrairement au contenu de #root).
 */
export default function mountCookieBanner(rootElement) {
  function render() {
    return {
      type: "div",
      attributes: [
        ["id", "cookie-banner"],
        ["role", "dialog"],
        ["aria-label", "Consentement aux cookies"],
        ["aria-describedby", "cookie-banner-text"],
        ["class", ["cookie-banner"]],
      ],
      children: [
        {
          type: "p",
          attributes: [["id", "cookie-banner-text"]],
          children: [
            "Nous utilisons des cookies strictement nécessaires au fonctionnement du site et, si vous l'acceptez, des cookies de mesure d'audience. Voir notre ",
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
        },
        {
          type: "div",
          attributes: [["class", ["cookie-banner-actions"]]],
          children: [
            {
              type: "button",
              attributes: [["type", "button"], ["class", ["cookie-btn", "cookie-btn-refuse"]]],
              children: ["Refuser"],
              events: [["click", () => setConsent("refused")]],
            },
            {
              type: "button",
              attributes: [["type", "button"], ["id", "cookie-accept"], ["class", ["cookie-btn", "cookie-btn-accept"]]],
              children: ["Accepter"],
              events: [["click", () => setConsent("accepted")]],
            },
          ],
        },
      ],
    };
  }

  function setConsent(value) {
    localStorage.setItem(CONSENT_KEY, value);
    rootElement.innerHTML = "";
  }

  function showBanner() {
    rootElement.innerHTML = "";
    rootElement.appendChild(generateStructure(render()));
  }

  if (!localStorage.getItem(CONSENT_KEY)) {
    showBanner();
  }

  // Permet de rouvrir le bandeau (ex: lien "Gérer les cookies" sur la page de confidentialité)
  window.addEventListener("open-cookie-banner", () => {
    showBanner();
    document.getElementById("cookie-accept")?.focus();
  });
}
