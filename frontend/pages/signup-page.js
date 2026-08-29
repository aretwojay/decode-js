import Header from "../components/header.js";
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
  error: "",
  loading: false,
});

export default function PageSignup() {
  async function handleSubmit(event) {
    event.preventDefault();
    const { username, email, password } = formState.get();

    if (!username || username.length < 3) {
      formState.set((s) => ({
        ...s,
        error: "Le nom d'utilisateur doit faire au moins 3 caractères.",
      }));
      return;
    }
    if (!email || !email.includes("@")) {
      formState.set((s) => ({ ...s, error: "Adresse email invalide." }));
      return;
    }
    if (!password || password.length < 6) {
      formState.set((s) => ({
        ...s,
        error: "Le mot de passe doit faire au moins 6 caractères.",
      }));
      return;
    }

    formState.set((s) => ({ ...s, error: "", loading: true }));
    try {
      await register({ username, email, password });
      navigate("/");
    } catch (err) {
      formState.set((s) => ({ ...s, error: err.message, loading: false }));
    }
  }

  return {
    type: "div",
    attributes: [["class", ["page", "page-signup"]]],
    children: [
      Header("/signup"),
      {
        type: "main",
        children: [
          {
            type: "h1",
            children: ["Créer mon compte"],
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
                  "Nom d'utilisateur",
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
                            username: e.target.value,
                          })),
                      ],
                    ],
                  },
                ],
              },
              {
                type: "label",
                children: [
                  "Email",
                  {
                    type: "input",
                    attributes: [
                      ["type", "email"],
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
                            email: e.target.value,
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
                children: ["Créer mon compte"],
              },
              reactive(formState, (s) =>
                renderAuthFeedback(s, "Création du compte…")
              ),
            ],
          },
          {
            type: "p",
            attributes: [["style", [["marginTop", "16px"]]]],
            children: ["Déjà un compte ? ", Link("/login", "Se connecter")],
          },
        ],
      },
    ],
  };
}
