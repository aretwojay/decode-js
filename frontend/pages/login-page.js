import Link from "../components/router/link.js";
import { login } from "../lib/api.js";
import { saveToken, isAuthenticated } from "../lib/auth.js";

export default async function PageLogin() {
  if (isAuthenticated()) {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new Event("pushstate"));
    return { type: "div", children: [] };
  }

  return {
    type: "div",
    attributes: [["class", ["page", "page-login"]]],
    children: [
      { type: "h1", children: ["Connexion"] },
      {
        type: "input",
        attributes: [
          ["type", "email"],
          ["id", "login-email"],
          ["placeholder", "Email"],
        ],
      },
      {
        type: "input",
        attributes: [
          ["type", "password"],
          ["id", "login-password"],
          ["placeholder", "Mot de passe"],
        ],
      },
      {
        type: "button",
        children: ["Se connecter"],
        events: [
          [
            "click",
            async () => {
              const identifier = document.getElementById("login-email").value;
              const password = document.getElementById("login-password").value;

              try {
                const response = await login(identifier, password);
                saveToken(response.jwt);
                window.history.pushState({}, "", "/");
                window.dispatchEvent(new Event("pushstate"));
              } catch (e) {
                alert("Identifiants invalides.");
              }
            },
          ],
        ],
      },
      {
        type: "p",
        children: [Link("/inscription", "Pas encore de compte ? S'inscrire")],
      },
    ],
  };
}
