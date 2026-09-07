import { AuthHeader } from "../components/header.js";
import Footer from "../components/footer.js";
import Link from "../components/router/link.js";
import createState from "../lib/create-state.js";
import reactive from "../lib/reactive.js";
import { register } from "../lib/auth.js";
import { navigate } from "../utils/navigation.js";
import { renderAuthFeedback } from "../utils/auth-forms.js";

const formState = createState({
  username: "",
  email: "",
  password: "",
  consentement: false,
  error: "",
  loading: false,
});

export default function PageSignup() {
  async function handleSubmit(event) {
    event.preventDefault();
    const { username, email, password, consentement } = formState.get();

    if (!username || username.length < 3) {
      formState.set((s) => ({
        ...s,
        error: "Le nom d'utilisateur doit comporter au moins 3 caractères.",
      }));
      return;
    }
    if (!email || !email.includes("@")) {
      formState.set((s) => ({ ...s, error: "Veuillez saisir une adresse email valide." }));
      return;
    }
    if (!password || password.length < 6) {
      formState.set((s) => ({
        ...s,
        error: "Le mot de passe doit comporter au moins 6 caractères.",
      }));
      return;
    }
    if (!consentement) {
      formState.set((s) => ({
        ...s,
        error: "Vous devez accepter la politique de confidentialité pour créer un compte.",
      }));
      return;
    }

    formState.set((s) => ({ ...s, error: "", loading: true }));
    try {
      await register({ username, email, password });
      navigate("/admin");
    } catch (err) {
      formState.set((s) => ({ ...s, error: err.message || "Erreur lors de l'inscription.", loading: false }));
    }
  }

  return {
    type: "div",
    attributes: [["class", ["page", "page-auth", "page-signup"]]],
    children: [
      AuthHeader(),
      {
        type: "main",
        attributes: [
          ["id", "main-content"],
          ["tabindex", "-1"],
          ["class", ["auth-main"]],
        ],
        children: [
          {
            type: "div",
            attributes: [["class", ["auth-card"]]],
            children: [
              // Header de la carte
              {
                type: "div",
                attributes: [["class", ["auth-card-header"]]],
                children: [
                  {
                    type: "div",
                    attributes: [["class", ["auth-badge-icon"]]],
                    children: ["✨"],
                  },
                  {
                    type: "h1",
                    attributes: [["class", ["auth-title"]]],
                    children: ["Créer un compte"],
                  },
                  {
                    type: "p",
                    attributes: [["class", ["auth-subtitle"]]],
                    children: [
                      "Inscrivez-vous pour personnaliser votre profil et administrer vos projets.",
                    ],
                  },
                ],
              },

              // Formulaire
              {
                type: "form",
                attributes: [
                  ["id", "signup-form"],
                  ["class", ["auth-form"]],
                ],
                events: [["submit", handleSubmit]],
                children: [
                  {
                    type: "div",
                    attributes: [["class", ["form-group"]]],
                    children: [
                      {
                        type: "label",
                        attributes: [["for", "signup-username"]],
                        children: ["Nom d'utilisateur *"],
                      },
                      {
                        type: "input",
                        attributes: [
                          ["id", "signup-username"],
                          ["name", "username"],
                          ["type", "text"],
                          ["required", true],
                          ["minlength", 3],
                          ["autocomplete", "username"],
                          ["placeholder", "ex: alexdev"],
                          ["class", ["form-control"]],
                        ],
                        events: [
                          [
                            "input",
                            (e) =>
                              formState.set((s) => ({
                                ...s,
                                username: e.target.value,
                              })),
                          ],
                        ],
                      },
                    ],
                  },
                  {
                    type: "div",
                    attributes: [["class", ["form-group"]]],
                    children: [
                      {
                        type: "label",
                        attributes: [["for", "signup-email"]],
                        children: ["Adresse Email *"],
                      },
                      {
                        type: "input",
                        attributes: [
                          ["id", "signup-email"],
                          ["name", "email"],
                          ["type", "email"],
                          ["required", true],
                          ["autocomplete", "email"],
                          ["placeholder", "ex: alex@example.com"],
                          ["class", ["form-control"]],
                        ],
                        events: [
                          [
                            "input",
                            (e) =>
                              formState.set((s) => ({
                                ...s,
                                email: e.target.value,
                              })),
                          ],
                        ],
                      },
                    ],
                  },
                  {
                    type: "div",
                    attributes: [["class", ["form-group"]]],
                    children: [
                      {
                        type: "label",
                        attributes: [["for", "signup-password"]],
                        children: ["Mot de passe *"],
                      },
                      {
                        type: "input",
                        attributes: [
                          ["id", "signup-password"],
                          ["name", "password"],
                          ["type", "password"],
                          ["required", true],
                          ["minlength", 6],
                          ["autocomplete", "new-password"],
                          ["placeholder", "Au moins 6 caractères"],
                          ["class", ["form-control"]],
                        ],
                        events: [
                          [
                            "input",
                            (e) =>
                              formState.set((s) => ({
                                ...s,
                                password: e.target.value,
                              })),
                          ],
                        ],
                      },
                    ],
                  },

                  {
                    type: "div",
                    attributes: [["class", ["form-group", "form-group-checkbox"]]],
                    children: [
                      {
                        type: "label",
                        attributes: [["class", ["checkbox-label"]]],
                        children: [
                          {
                            type: "input",
                            attributes: [
                              ["id", "signup-consentement"],
                              ["name", "consentement"],
                              ["type", "checkbox"],
                              ["required", true],
                            ],
                            events: [
                              [
                                "change",
                                (e) =>
                                  formState.set((s) => ({
                                    ...s,
                                    consentement: e.target.checked,
                                  })),
                              ],
                            ],
                          },
                          " J'accepte que mes données soient traitées conformément à la ",
                          Link("/confidentialite", "politique de confidentialité", ["auth-link-accent"]),
                          " *",
                        ],
                      },
                    ],
                  },

                  // Retour d'erreur ou chargement
                  reactive(formState, (s) =>
                    renderAuthFeedback(s, "Création du compte en cours…")
                  ),

                  // Bouton de soumission
                  reactive(formState, (s) => ({
                    type: "button",
                    attributes: [
                      ["type", "submit"],
                      ["class", ["btn", "btn-primary", "btn-auth-submit"]],
                      ...(s.loading ? [["disabled", "disabled"]] : []),
                    ],
                    children: [s.loading ? "Création…" : "Créer mon compte"],
                  })),
                ],
              },

              // Footer de la carte
              {
                type: "div",
                attributes: [["class", ["auth-card-footer"]]],
                children: [
                  {
                    type: "p",
                    children: [
                      "Déjà un compte ? ",
                      Link("/login", "Se connecter", ["auth-link-accent"]),
                    ],
                  },
                  {
                    type: "div",
                    attributes: [["class", ["auth-back-home"]]],
                    children: [
                      Link("/", "← Retour à l'accueil", ["auth-link-secondary"]),
                    ],
                  },
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
