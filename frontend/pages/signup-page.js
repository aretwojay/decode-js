import Link from "../components/router/link.js";
import createState from "../lib/create-state.js";
import reactive from "../lib/reactive.js";
import { register } from "../lib/auth.js";

function navigate(url) {
  window.history.pushState({}, undefined, url);
  window.dispatchEvent(new Event("pushstate"));
}

const formState = createState({ username: "", email: "", password: "", error: "", loading: false });

function renderFeedback(state) {
  if (state.loading) {
    return { type: "p", children: ["Création du compte…"] };
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

export default function PageSignup() {
  async function handleSubmit(event) {
    event.preventDefault();
    const { username, email, password } = formState.get();

    if (!username || username.length < 3) {
      formState.set((s) => ({ ...s, error: "Le nom d'utilisateur doit faire au moins 3 caractères." }));
      return;
    }
    if (!email || !email.includes("@")) {
      formState.set((s) => ({ ...s, error: "Adresse email invalide." }));
      return;
    }
    if (!password || password.length < 6) {
      formState.set((s) => ({ ...s, error: "Le mot de passe doit faire au moins 6 caractères." }));
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
      {
        type: "h1",
        children: ["Créer mon compte"],
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
              "Nom d'utilisateur",
              {
                type: "input",
                attributes: [["type", "text"], ["required", true]],
                events: [["input", (e) => formState.set((s) => ({ ...s, username: e.target.value }))]],
              },
            ],
          },
          {
            type: "label",
            children: [
              "Email",
              {
                type: "input",
                attributes: [["type", "email"], ["required", true]],
                events: [["input", (e) => formState.set((s) => ({ ...s, email: e.target.value }))]],
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
            children: ["Créer mon compte"],
          },
          reactive(formState, renderFeedback),
        ],
      },
      {
        type: "p",
        children: ["Déjà un compte ? ", Link("/login", "Se connecter")],
      },
    ],
  };
}
