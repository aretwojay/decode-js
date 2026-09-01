import Header from "../components/header.js";
import Link from "../components/router/link.js";
import { navigate } from "../utils/navigation.js";
import { isAuthenticated } from "../lib/auth.js";
import {
  fetchMyProfile,
  createProfile,
  updateProfile,
  fetchMyExperiences,
  fetchMyProjects,
  fetchMyCompetences,
  experienceCrud,
  projectCrud,
  competenceCrud,
} from "../lib/api.js";

function refresh() {
  window.dispatchEvent(new Event("pushstate"));
}

function ProfileForm(profile) {
  const isNew = !profile;

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const data = {
      nom: form.nom.value,
      titre: form.titre.value,
      email: form.email.value,
      biographie: form.biographie.value,
    };
    try {
      if (isNew) {
        await createProfile(data);
      } else {
        await updateProfile(profile.documentId, data);
      }
      refresh();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }

  return {
    type: "form",
    attributes: [["class", ["admin-section"]]],
    events: [["submit", handleSubmit]],
    children: [
      { type: "h2", children: [isNew ? "Créer mon profil" : "Mon profil"] },
      !isNew
        ? { type: "p", children: [] }
        : {
            type: "p",
            children: [
              "Créez votre profil pour commencer à publier votre portfolio.",
            ],
          },
      {
        type: "label",
        children: [
          "Nom complet",
          {
            type: "input",
            attributes: [
              ["name", "nom"],
              ["type", "text"],
              ["required", true],
              ["value", profile?.nom || ""],
            ],
          },
        ],
      },
      {
        type: "label",
        children: [
          "Titre professionnel",
          {
            type: "input",
            attributes: [
              ["name", "titre"],
              ["type", "text"],
              ["required", true],
              ["value", profile?.titre || ""],
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
              ["name", "email"],
              ["type", "email"],
              ["required", true],
              ["value", profile?.email || ""],
            ],
          },
        ],
      },
      {
        type: "label",
        children: [
          "Biographie",
          {
            type: "textarea",
            attributes: [["name", "biographie"], ["rows", 4]],
            children: [profile?.biographie || ""],
          },
        ],
      },
      {
        type: "button",
        attributes: [["type", "submit"], ["class", ["btn", "btn-primary"]]],
        children: [isNew ? "Créer mon profil" : "Enregistrer"],
      },
    ],
  };
}

function CrudSection(title, items, labelField, crud, extraFields = {}) {
  async function handleAdd(event) {
    event.preventDefault();
    const form = event.target;
    const data = { [labelField]: form[labelField].value, ...extraFields };
    try {
      await crud.create(data);
      refresh();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }

  async function handleDelete(documentId) {
    if (!confirm("Confirmer la suppression ?")) return;
    try {
      await crud.remove(documentId);
      refresh();
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }

  return {
    type: "section",
    attributes: [["class", ["admin-section"]]],
    children: [
      { type: "h2", children: [title] },
      {
        type: "ul",
        children:
          items.length === 0
            ? [{ type: "li", children: ["Rien pour l'instant."] }]
            : items.map((item) => ({
                type: "li",
                attributes: [["class", ["admin-row"]]],
                children: [
                  { type: "span", children: [item[labelField] || "(sans titre)"] },
                  {
                    type: "button",
                    attributes: [["type", "button"]],
                    children: ["Supprimer"],
                    events: [["click", () => handleDelete(item.documentId)]],
                  },
                ],
              })),
      },
      {
        type: "form",
        attributes: [["class", ["admin-add-form"]]],
        events: [["submit", handleAdd]],
        children: [
          {
            type: "input",
            attributes: [
              ["name", labelField],
              ["type", "text"],
              ["placeholder", `Nouveau : ${title.toLowerCase()}`],
              ["required", true],
            ],
          },
          {
            type: "button",
            attributes: [["type", "submit"]],
            children: ["Ajouter"],
          },
        ],
      },
    ],
  };
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function PageAdmin() {
  if (!isAuthenticated()) {
    return {
      type: "div",
      attributes: [["class", ["page", "page-admin"]]],
      children: [
        Header("/admin"),
        {
          type: "main",
          children: [
            { type: "h1", children: ["Mon compte"] },
            {
              type: "p",
              children: [
                "Connecte-toi pour gérer ton portfolio. ",
                Link("/login", "Se connecter"),
              ],
            },
          ],
        },
      ],
    };
  }

  const profile = await fetchMyProfile();

  if (!profile) {
    return {
      type: "div",
      attributes: [["class", ["page", "page-admin"]]],
      children: [Header("/admin"), { type: "main", children: [ProfileForm(null)] }],
    };
  }

  const [experiences, projects, competences] = await Promise.all([
    fetchMyExperiences(),
    fetchMyProjects(),
    fetchMyCompetences(),
  ]);

  return {
    type: "div",
    attributes: [["class", ["page", "page-admin"]]],
    children: [
      Header("/admin"),
      {
        type: "main",
        children: [
          { type: "h1", children: ["Mon compte"] },
          ProfileForm(profile),
          CrudSection("Expériences", experiences, "titre", {
            create: (data) =>
              experienceCrud.create({
                ...data,
                slug: slugify(data.titre),
                entreprise: "À compléter",
                date_debut: new Date().toISOString().slice(0, 10),
                description: [{ type: "paragraph", children: [{ type: "text", text: "À compléter" }] }],
              }),
            remove: experienceCrud.remove,
          }),
          CrudSection("Projets", projects, "titre", {
            create: (data) =>
              projectCrud.create({
                ...data,
                slug: slugify(data.titre),
                description: [{ type: "paragraph", children: [{ type: "text", text: "À compléter" }] }],
              }),
            remove: projectCrud.remove,
          }),
          CrudSection("Compétences", competences, "titre", {
            create: (data) => competenceCrud.create({ ...data, niveau: "intermediaire" }),
            remove: competenceCrud.remove,
          }),
        ],
      },
    ],
  };
}
