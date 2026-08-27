import Link from "../components/router/link.js";
import { register } from "../lib/api.js";
import { saveToken, isAuthenticated } from "../lib/auth.js";

export default async function PageRegister() {
  if (isAuthenticated()) {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new Event("pushstate"));
    return { type: "div", children: [] };
  }

  return {
    type: "div",
    attributes: [["class", ["page", "page-register"]]],
    children: [
      { type: "h1", children: ["Créer un compte"] },
      {
        type: "input",
        attributes: [
          ["type", "text"],
          ["id", "register-username"],
          ["placeholder", "Nom d'utilisateur"],
        ],
      },
      {
        type: "input",
        attributes: [
          ["type", "email"],
          ["id", "register-email"],
          ["placeholder", "Email"],
        ],
      },
      {
        type: "input",
        attributes: [
          ["type", "password"],
          ["id", "register-password"],
          ["placeholder", "Mot de passe"],
        ],
      },
      {
        type: "button",
        children: ["S'inscrire"],
        events: [
          [
            "click",
            async () => {
              const username =
                document.getElementById("register-username").value;
              const email = document.getElementById("register-email").value;
              const password =
                document.getElementById("register-password").value;

              if (!username || !email || !password) {
                alert("Merci de remplir tous les champs.");
                return;
              }

              try {
                const response = await register(username, email, password);
                saveToken(response.jwt);
                window.history.pushState({}, "", "/choisir-theme");
                window.dispatchEvent(new Event("pushstate"));
              } catch (e) {
                alert("Erreur : " + e.message);
              }
            },
          ],
        ],
      },
      {
        type: "p",
        children: [Link("/connexion", "Déjà un compte ? Se connecter")],
      },
    ],
  };
}
