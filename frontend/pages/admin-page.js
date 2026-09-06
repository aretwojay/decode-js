import Header from "../components/header.js";
import Link from "../components/router/link.js";
import { navigate } from "../utils/navigation.js";
import { isAuthenticated } from "../lib/auth.js";
import createState from "../lib/create-state.js";
import reactive from "../lib/reactive.js";
import {
  renderFeedbackBanner,
  renderEmptyState,
  renderInlineConfirm,
  showToast,
} from "../components/ui-feedback.js";
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
        showToast("Profil créé avec succès !", "success");
      } else {
        await updateProfile(profile.documentId, data);
        showToast("Profil mis à jour avec succès !", "success");
      }
      refresh();
    } catch (err) {
      showToast("Erreur lors de l'enregistrement : " + err.message, "error");
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
  const deletingIdState = createState(null);

  async function handleAdd(event) {
    event.preventDefault();
    const form = event.target;
    const data = { [labelField]: form[labelField].value, ...extraFields };
    try {
      await crud.create(data);
      showToast(`${title} ajouté(e) avec succès !`, "success");
      form.reset();
      refresh();
    } catch (err) {
      showToast("Erreur lors de l'ajout : " + err.message, "error");
    }
  }

  async function handleDelete(documentId) {
    try {
      await crud.remove(documentId);
      showToast(`Élément supprimé avec succès.`, "info");
      deletingIdState.set(null);
      refresh();
    } catch (err) {
      showToast("Erreur lors de la suppression : " + err.message, "error");
    }
  }

  return {
    type: "section",
    attributes: [["class", ["admin-section"]]],
    children: [
      { type: "h2", children: [title] },
      items.length === 0
        ? renderEmptyState({
            icon: "📋",
            title: `Aucun élément dans « ${title} »`,
            description: `Utilisez le formulaire ci-dessous pour ajouter votre premier élément à cette section.`,
          })
        : reactive(deletingIdState, (deletingId) => ({
            type: "ul",
            attributes: [["class", ["admin-list"]]],
            children: items.map((item) => {
              const isDeleting = deletingId === item.documentId;
              return {
                type: "li",
                attributes: [["class", ["admin-row"]]],
                children: [
                  {
                    type: "span",
                    attributes: [["class", ["admin-row-title"]]],
                    children: [item[labelField] || "(sans titre)"],
                  },
                  isDeleting
                    ? renderInlineConfirm({
                        message: "Supprimer définitivement ?",
                        onConfirm: () => handleDelete(item.documentId),
                        onCancel: () => deletingIdState.set(null),
                      })
                    : {
                        type: "button",
                        attributes: [
                          ["type", "button"],
                          ["class", ["btn", "btn-sm", "btn-secondary"]],
                        ],
                        children: ["Supprimer"],
                        events: [
                          ["click", () => deletingIdState.set(item.documentId)],
                        ],
                      },
                ],
              };
            }),
          })),
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
            attributes: [
              ["type", "submit"],
              ["class", ["btn", "btn-primary"]],
            ],
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

  let profile = null;
  let experiences = [];
  let projects = [];
  let competences = [];

  try {
    profile = await fetchMyProfile();

    if (!profile) {
      return {
        type: "div",
        attributes: [["class", ["page", "page-admin"]]],
        children: [
          Header("/admin"),
          { type: "main", children: [ProfileForm(null)] },
        ],
      };
    }

    const [exp, proj, comp] = await Promise.all([
      fetchMyExperiences(),
      fetchMyProjects(),
      fetchMyCompetences(),
    ]);

    experiences = exp || [];
    projects = proj || [];
    competences = comp || [];
  } catch (err) {
    console.error("[PageAdmin] Failed to load admin data:", err);
    return {
      type: "div",
      attributes: [["class", ["page", "page-admin"]]],
      children: [
        Header("/admin"),
        {
          type: "main",
          children: [
            renderFeedbackBanner({
              type: "error",
              message:
                "Impossible de charger vos données d'administration : " +
                (err.message || "session expirée ou serveur indisponible."),
              actionText: "Se reconnecter",
              onAction: () => navigate("/login"),
            }),
          ],
        },
      ],
    };
  }

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
                description: [
                  {
                    type: "paragraph",
                    children: [{ type: "text", text: "À compléter" }],
                  },
                ],
              }),
            remove: experienceCrud.remove,
          }),
          CrudSection("Projets", projects, "titre", {
            create: (data) =>
              projectCrud.create({
                ...data,
                slug: slugify(data.titre),
                description: [
                  {
                    type: "paragraph",
                    children: [{ type: "text", text: "À compléter" }],
                  },
                ],
              }),
            remove: projectCrud.remove,
          }),
          CrudSection("Compétences", competences, "titre", {
            create: (data) =>
              competenceCrud.create({ ...data, niveau: "intermediaire" }),
            remove: competenceCrud.remove,
          }),
        ],
      },
    ],
  };
}
