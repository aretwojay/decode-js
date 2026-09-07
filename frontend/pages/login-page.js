import { AuthHeader } from "../components/header.js";
import Footer from "../components/footer.js";
import Link from "../components/router/link.js";
import createState from "../lib/create-state.js";
import reactive from "../lib/reactive.js";
import { login } from "../lib/auth.js";
import { navigate } from "../utils/navigation.js";
import { renderAuthFeedback } from "../utils/auth-forms.js";

const formState = createState({
  identifier: "",
  password: "",
  error: "",
  loading: false,
});

export default function PageLogin() {
  async function handleSubmit(event) {
    event.preventDefault();
    const { identifier, password } = formState.get();

    if (!identifier || !password) {
      formState.set((s) => ({ ...s, error: "Veuillez renseigner votre identifiant et mot de passe." }));
      return;
    }

    formState.set((s) => ({ ...s, error: "", loading: true }));
    try {
      await login({ identifier, password });
      navigate("/admin");
    } catch (err) {
      formState.set((s) => ({ ...s, error: err.message || "Identifiants invalides.", loading: false }));
    }
  }

  return {
    type: "div",
    attributes: [["class", ["page", "page-auth", "page-login"]]],
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
                    children: ["🔐"],
                  },
                  {
                    type: "h1",
                    attributes: [["class", ["auth-title"]]],
                    children: ["Connexion"],
                  },
                  {
                    type: "p",
                    attributes: [["class", ["auth-subtitle"]]],
                    children: [
                      "Accédez à votre espace d'administration pour gérer votre portfolio.",
                    ],
                  },
                ],
              },

              // Formulaire
              {
                type: "form",
                attributes: [
                  ["id", "login-form"],
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
                        attributes: [["for", "login-identifier"]],
                        children: ["Email ou nom d'utilisateur *"],
                      },
                      {
                        type: "input",
                        attributes: [
                          ["id", "login-identifier"],
                          ["name", "identifier"],
                          ["type", "text"],
                          ["required", true],
                          ["autocomplete", "username"],
                          ["placeholder", "ex: ruben@example.com"],
                          ["class", ["form-control"]],
                        ],
                        events: [
                          [
                            "input",
                            (e) =>
                              formState.set((s) => ({
                                ...s,
                                identifier: e.target.value,
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
                        attributes: [["for", "login-password"]],
                        children: ["Mot de passe *"],
                      },
                      {
                        type: "input",
                        attributes: [
                          ["id", "login-password"],
                          ["name", "password"],
                          ["type", "password"],
                          ["required", true],
                          ["autocomplete", "current-password"],
                          ["placeholder", "••••••••"],
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

                  // Retour d'erreur ou de chargement
                  reactive(formState, (s) => renderAuthFeedback(s, "Connexion en cours…")),

                  // Bouton de soumission
                  reactive(formState, (s) => ({
                    type: "button",
                    attributes: [
                      ["type", "submit"],
                      ["class", ["btn", "btn-primary", "btn-auth-submit"]],
                      ...(s.loading ? [["disabled", "disabled"]] : []),
                    ],
                    children: [s.loading ? "Connexion…" : "Se connecter"],
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
                      "Pas encore de compte ? ",
                      Link("/signup", "Créer un compte", ["auth-link-accent"]),
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
