import Header from "../components/header.js";
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
      formState.set((s) => ({ ...s, error: "Email et mot de passe requis." }));
      return;
    }

    formState.set((s) => ({ ...s, error: "", loading: true }));
    try {
      await login({ identifier, password });
      navigate("/");
    } catch (err) {
      formState.set((s) => ({ ...s, error: err.message, loading: false }));
    }
  }

  return {
    type: "div",
    attributes: [["class", ["page", "page-login"]]],
    children: [
      Header("/login"),
      {
        type: "main",
        children: [
          {
            type: "h1",
            children: ["Se connecter"],
          },
          {
            type: "form",
            attributes: [
              [
                "style",
                [
                  ["display", "flex"],
                  ["flexDirection", "column"],
                  ["gap", "12px"],
                  ["maxWidth", "400px"],
                  ["marginTop", "20px"],
                ],
              ],
            ],
            events: [["submit", handleSubmit]],
            children: [
              {
                type: "label",
                children: [
                  "Email ou nom d'utilisateur",
                  {
                    type: "input",
                    attributes: [
                      ["type", "text"],
                      ["required", true],
                      [
                        "style",
                        [
                          ["width", "100%"],
                          ["padding", "8px"],
                          ["marginTop", "4px"],
                        ],
                      ],
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
                type: "label",
                children: [
                  "Mot de passe",
                  {
                    type: "input",
                    attributes: [
                      ["type", "password"],
                      ["required", true],
                      [
                        "style",
                        [
                          ["width", "100%"],
                          ["padding", "8px"],
                          ["marginTop", "4px"],
                        ],
                      ],
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
                type: "button",
                attributes: [
                  ["type", "submit"],
                  ["class", ["btn", "btn-primary"]],
                ],
                children: ["Se connecter"],
              },
              reactive(formState, (s) => renderAuthFeedback(s, "Connexion…")),
            ],
          },
          {
            type: "p",
            attributes: [["style", [["marginTop", "16px"]]]],
            children: ["Pas encore de compte ? ", Link("/signup", "Créer un compte")],
          },
        ],
      },
    ],
  };
}
