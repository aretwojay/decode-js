import Link from "../components/router/link.js";
import {
  getExperiences, getProjets, getCompetences,
  createExperience, deleteExperience,
  createProjet, deleteProjet,
  createCompetence, deleteCompetence,
  login,
} from "../lib/api.js";
import { isAuthenticated, saveToken, clearToken } from "../lib/auth.js";

function loginForm() {
  return {
    type: "div",
    attributes: [["class", ["login-form"]]],
    children: [
      { type: "h2", children: ["Connexion Admin"] },
      { type: "input", attributes: [["type", "email"], ["id", "login-email"], ["placeholder", "Email"]] },
      { type: "input", attributes: [["type", "password"], ["id", "login-password"], ["placeholder", "Mot de passe"]] },
      {
        type: "button",
        children: ["Se connecter"],
        events: [["click", async () => {
          const email = document.getElementById("login-email").value;
          const password = document.getElementById("login-password").value;
          try {
            const response = await login(email, password);
            saveToken(response.jwt);
            window.location.reload();
          } catch (e) {
            alert("Erreur : " + e.message);
          }
        }]],
      },
    ],
  };
}

function makeSection(key, title, items, labelField, createFn, deleteFn) {
  return {
    type: "div",
    attributes: [["class", ["admin-section"]]],
    children: [
      { type: "h3", children: [title] },
      {
        type: "div",
        children: items.map((item) => ({
          type: "div",
          attributes: [["class", ["admin-row"]]],
          children: [
            { type: "span", children: [item[labelField] ?? "(sans titre)"] },
            {
              type: "button",
              children: ["Supprimer"],
              events: [["click", async () => {
                if (confirm("Confirmer la suppression ?")) {
                  await deleteFn(item.documentId ?? item.id);
                  window.location.reload();
                }
              }]],
            },
          ],
        })),
      },
      {
        type: "div",
        attributes: [["class", ["admin-add-form"]]],
        children: [
          { type: "input", attributes: [["type", "text"], ["id", `new-${key}-titre`], ["placeholder", `Nouveau ${title}...`]] },
          {
            type: "button",
            children: ["Ajouter"],
            events: [["click", async () => {
              const input = document.getElementById(`new-${key}-titre`);
              const value = input.value;
              if (!value) return;
              try {
                await createFn({ [labelField]: value, slug: value.toLowerCase().replace(/\s+/g, "-") });
                window.location.reload();
              } catch (e) {
                alert("Erreur : " + e.message);
              }
            }]],
          },
        ],
      },
    ],
  };
}

export default async function PageAdmin() {
  const baseChildren = [
    { type: "h1", children: ["Administration CMS Strapi"] },
    { type: "nav", children: [Link("/", "← Retour à l'accueil")] },
  ];

  if (!isAuthenticated()) {
    return {
      type: "div",
      attributes: [["class", ["page", "page-admin"]]],
      children: [...baseChildren, loginForm()],
    };
  }

  const [experiences, projets, competences] = await Promise.all([
    getExperiences(),
    getProjets(),
    getCompetences(),
  ]);

  return {
    type: "div",
    attributes: [["class", ["page", "page-admin"]]],
    children: [
      ...baseChildren,
      {
        type: "button",
        children: ["Se déconnecter"],
        events: [["click", () => { clearToken(); window.location.reload(); }]],
      },
      makeSection("experience", "Expérience", experiences, "titre", createExperience, deleteExperience),
      makeSection("projet", "Projet", projets, "titre", createProjet, deleteProjet),
      makeSection("competence", "Compétence", competences, "nom", createCompetence, deleteCompetence),
    ],
  };
}
