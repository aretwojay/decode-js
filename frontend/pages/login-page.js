import Link from "../components/router/link.js";
import createState from "../lib/create-state.js";
import reactive from "../lib/reactive.js";
import { login } from "../lib/auth.js";

function navigate(url) {
  window.history.pushState({}, undefined, url);
  window.dispatchEvent(new Event("pushstate"));
}

const formState = createState({ identifier: "", password: "", error: "", loading: false });

function renderFeedback(state) {
  if (state.loading) {
    return { type: "p", children: ["Connexion…"] };
  }
  if (state.error) {
    return {
      type: "p",
      attributes: [["style", [["color", "#c0392b"]]]],
      children: [state.error],
    };
  }
  return { type: "p", children: [""] };
}

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
      {
        type: "h1",
        children: ["Se connecter"],
      },
      {
        type: "nav",
        children: [Link("/", "← Retour à l'accueil")],
      },
      {
        type: "form",
        attributes: [["style", [["display", "flex"], ["flexDirection", "column"], ["gap", "10px"], ["maxWidth", "400px"]]]],
        events: [["submit", handleSubmit]],
        children: [
          {
            type: "label",
            children: [
              "Email",
              {
                type: "input",
                attributes: [["type", "email"], ["required", true]],
                events: [["input", (e) => formState.set((s) => ({ ...s, identifier: e.target.value }))]],
              },
            ],
          },
          {
            type: "label",
            children: [
              "Mot de passe",
              {
                type: "input",
                attributes: [["type", "password"], ["required", true]],
                events: [["input", (e) => formState.set((s) => ({ ...s, password: e.target.value }))]],
              },
            ],
          },
          {
            type: "button",
            attributes: [["type", "submit"]],
            children: ["Se connecter"],
          },
          reactive(formState, renderFeedback),
        ],
      },
      {
        type: "p",
        children: ["Pas encore de compte ? ", Link("/signup", "Créer un compte")],
      },
    ],
  };
}
