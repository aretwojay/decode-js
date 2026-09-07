import { showToast } from "../../components/ui-feedback.js";
import {
  createProfile,
  updateProfile,
  syncStoreFromApi,
} from "../../lib/api.js";
import { refresh } from "./admin-common.js";
import { setTheme, getTheme, AvailablesThemes } from "../../lib/theme.js";

/**
 * 1. FORMULAIRE DE PROFIL UTILISATEUR
 */
export function ProfileForm(profile) {
  const isNew = !profile;

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const chosenTheme = form.theme?.value || "ruben";
    const data = {
      nom: form.nom.value.trim(),
      titre: form.titre.value.trim(),
      email: form.email.value.trim(),
      biographie: form.biographie.value.trim(),
      telephone: form.telephone?.value?.trim() || null,
      localisation: form.localisation?.value?.trim() || null,
      github: form.github?.value?.trim() || null,
      linkedin: form.linkedin?.value?.trim() || null,
      theme: chosenTheme,
      accroche_disponibilite: form.accroche_disponibilite?.value?.trim() || null,
      accroche_portfolio: form.accroche_portfolio?.value?.trim() || null,
      intro_portfolio: form.intro_portfolio?.value?.trim() || null,
      message_collaboration: form.message_collaboration?.value?.trim() || null,
      accroche_contact: form.accroche_contact?.value?.trim() || null,
    };

    try {
      if (isNew) {
        await createProfile(data);
        showToast("Profil créé avec succès !", "success");
      } else {
        await updateProfile(profile.documentId, data);
        showToast("Profil mis à jour avec succès !", "success");
      }
      setTheme(chosenTheme);
      await syncStoreFromApi();
      refresh();
    } catch (err) {
      showToast("Erreur lors de l'enregistrement : " + err.message, "error");
    }
  }

  const themes = [
    { value: "ruben", label: "Ruben (Sombre / Développeur)" },
    { value: "iris", label: "Iris (Moderne / Créatif)" },
    { value: "yaniss", label: "Yaniss (Minimaliste / Épuré)" },
  ];

  return {
    type: "section",
    attributes: [
      ["id", "profile-management"],
      ["class", ["admin-section", "admin-profile-section"]],
    ],
    children: [
      {
        type: "header",
        attributes: [["class", ["admin-section-header"]]],
        children: [
          { type: "h2", children: [isNew ? "Créer mon profil" : "Mon Profil & Identité"] },
          {
            type: "p",
            attributes: [["class", ["admin-section-desc"]]],
            children: [
              isNew
                ? "Créez votre profil pour commencer à publier des projets et expériences sur votre portfolio."
                : "Ces informations alimentent la page d'accueil, le CV en ligne et les métadonnées SEO.",
            ],
          },
        ],
      },
      {
        type: "form",
        attributes: [["class", ["admin-form", "admin-form-grid"]]],
        events: [["submit", handleSubmit]],
        children: [
          // Ligne 1 : Nom et Titre
          {
            type: "div",
            attributes: [["class", ["form-row-2col"]]],
            children: [
              {
                type: "div",
                attributes: [["class", ["form-group"]]],
                children: [
                  {
                    type: "label",
                    attributes: [["for", "profile-nom"]],
                    children: ["Nom complet *"],
                  },
                  {
                    type: "input",
                    attributes: [
                      ["id", "profile-nom"],
                      ["name", "nom"],
                      ["type", "text"],
                      ["required", true],
                      ["placeholder", "ex: Ruben K."],
                      ["value", profile?.nom || ""],
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
                    attributes: [["for", "profile-titre"]],
                    children: ["Titre professionnel *"],
                  },
                  {
                    type: "input",
                    attributes: [
                      ["id", "profile-titre"],
                      ["name", "titre"],
                      ["type", "text"],
                      ["required", true],
                      ["placeholder", "ex: Développeur Full Stack & Architecte"],
                      ["value", profile?.titre || ""],
                    ],
                  },
                ],
              },
            ],
          },

          // Ligne 2 : Email et Téléphone
          {
            type: "div",
            attributes: [["class", ["form-row-2col"]]],
            children: [
              {
                type: "div",
                attributes: [["class", ["form-group"]]],
                children: [
                  {
                    type: "label",
                    attributes: [["for", "profile-email"]],
                    children: ["Adresse Email *"],
                  },
                  {
                    type: "input",
                    attributes: [
                      ["id", "profile-email"],
                      ["name", "email"],
                      ["type", "email"],
                      ["required", true],
                      ["placeholder", "ex: contact@example.com"],
                      ["value", profile?.email || ""],
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
                    attributes: [["for", "profile-telephone"]],
                    children: ["Numéro de téléphone"],
                  },
                  {
                    type: "input",
                    attributes: [
                      ["id", "profile-telephone"],
                      ["name", "telephone"],
                      ["type", "tel"],
                      ["placeholder", "ex: +33 6 12 34 56 78"],
                      ["value", profile?.telephone || ""],
                    ],
                  },
                ],
              },
            ],
          },

          // Ligne 3 : Localisation et Thème graphique
          {
            type: "div",
            attributes: [["class", ["form-row-2col"]]],
            children: [
              {
                type: "div",
                attributes: [["class", ["form-group"]]],
                children: [
                  {
                    type: "label",
                    attributes: [["for", "profile-localisation"]],
                    children: ["Localisation"],
                  },
                  {
                    type: "input",
                    attributes: [
                      ["id", "profile-localisation"],
                      ["name", "localisation"],
                      ["type", "text"],
                      ["placeholder", "ex: Paris, France (Disponible en hybride)"],
                      ["value", profile?.localisation || ""],
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
                    attributes: [["for", "profile-theme"]],
                    children: ["Thème par défaut du portfolio"],
                  },
                  {
                    type: "select",
                    attributes: [
                      ["id", "profile-theme"],
                      ["name", "theme"],
                    ],
                    events: [
                      [
                        "change",
                        (event) => {
                          const chosenTheme = event.target.value;
                          if (AvailablesThemes.includes(chosenTheme)) {
                            setTheme(chosenTheme);
                            showToast(`Thème « ${chosenTheme} » appliqué en direct ! Pensez à enregistrer pour le conserver.`, "info");
                          }
                        },
                      ],
                    ],
                    children: themes.map((t) => ({
                      type: "option",
                      attributes: [
                        ["value", t.value],
                        ...((profile?.theme || getTheme()) === t.value ? [["selected", "selected"]] : []),
                      ],
                      children: [t.label],
                    })),
                  },
                  {
                    type: "p",
                    attributes: [["class", ["form-help-text"]]],
                    children: [
                      "Ce thème définit le design et le CSS de l'ensemble du site. La sélection change le style instantanément pour tester le rendu.",
                    ],
                  },
                ],
              },
            ],
          },

          // Ligne 4 : Liens sociaux (GitHub & LinkedIn)
          {
            type: "div",
            attributes: [["class", ["form-row-2col"]]],
            children: [
              {
                type: "div",
                attributes: [["class", ["form-group"]]],
                children: [
                  {
                    type: "label",
                    attributes: [["for", "profile-github"]],
                    children: ["Lien GitHub"],
                  },
                  {
                    type: "input",
                    attributes: [
                      ["id", "profile-github"],
                      ["name", "github"],
                      ["type", "url"],
                      ["placeholder", "https://github.com/mon-compte"],
                      ["value", profile?.github || ""],
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
                    attributes: [["for", "profile-linkedin"]],
                    children: ["Lien LinkedIn"],
                  },
                  {
                    type: "input",
                    attributes: [
                      ["id", "profile-linkedin"],
                      ["name", "linkedin"],
                      ["type", "url"],
                      ["placeholder", "https://linkedin.com/in/mon-compte"],
                      ["value", profile?.linkedin || ""],
                    ],
                  },
                ],
              },
            ],
          },

          // Ligne 5 : Accroches courtes (disponibilité, portfolio, contact)
          {
            type: "div",
            attributes: [["class", ["form-row-2col"]]],
            children: [
              {
                type: "div",
                attributes: [["class", ["form-group"]]],
                children: [
                  {
                    type: "label",
                    attributes: [["for", "profile-accroche-disponibilite"]],
                    children: ["Accroche de disponibilité"],
                  },
                  {
                    type: "input",
                    attributes: [
                      ["id", "profile-accroche-disponibilite"],
                      ["name", "accroche_disponibilite"],
                      ["type", "text"],
                      ["maxlength", 200],
                      ["placeholder", "ex: Disponible pour une alternance dès septembre 2026"],
                      ["value", profile?.accroche_disponibilite || ""],
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
                    attributes: [["for", "profile-accroche-portfolio"]],
                    children: ["Accroche du portfolio"],
                  },
                  {
                    type: "input",
                    attributes: [
                      ["id", "profile-accroche-portfolio"],
                      ["name", "accroche_portfolio"],
                      ["type", "text"],
                      ["maxlength", 150],
                      ["placeholder", "ex: Développeur passionné par le web moderne"],
                      ["value", profile?.accroche_portfolio || ""],
                    ],
                  },
                ],
              },
            ],
          },

          // Ligne 6 : Accroche de contact
          {
            type: "div",
            attributes: [["class", ["form-group"]]],
            children: [
              {
                type: "label",
                attributes: [["for", "profile-accroche-contact"]],
                children: ["Accroche de la section Contact"],
              },
              {
                type: "input",
                attributes: [
                  ["id", "profile-accroche-contact"],
                  ["name", "accroche_contact"],
                  ["type", "text"],
                  ["maxlength", 150],
                  ["placeholder", "ex: Une question, un projet ? Écrivez-moi"],
                  ["value", profile?.accroche_contact || ""],
                ],
              },
            ],
          },

          // Ligne 7 : Biographie
          {
            type: "div",
            attributes: [["class", ["form-group"]]],
            children: [
              {
                type: "label",
                attributes: [["for", "profile-bio"]],
                children: ["Biographie & Présentation"],
              },
              {
                type: "textarea",
                attributes: [
                  ["id", "profile-bio"],
                  ["name", "biographie"],
                  ["rows", 4],
                  ["placeholder", "Présentez votre parcours, vos spécialités et votre vision technique..."],
                ],
                children: [profile?.biographie || ""],
              },
            ],
          },

          // Ligne 8 : Introduction du portfolio
          {
            type: "div",
            attributes: [["class", ["form-group"]]],
            children: [
              {
                type: "label",
                attributes: [["for", "profile-intro-portfolio"]],
                children: ["Introduction du portfolio"],
              },
              {
                type: "textarea",
                attributes: [
                  ["id", "profile-intro-portfolio"],
                  ["name", "intro_portfolio"],
                  ["rows", 3],
                  ["maxlength", 400],
                  ["placeholder", "Le texte d'introduction affiché en haut de votre page projets..."],
                ],
                children: [profile?.intro_portfolio || ""],
              },
            ],
          },

          // Ligne 9 : Message de collaboration
          {
            type: "div",
            attributes: [["class", ["form-group"]]],
            children: [
              {
                type: "label",
                attributes: [["for", "profile-message-collaboration"]],
                children: ["Message de collaboration"],
              },
              {
                type: "textarea",
                attributes: [
                  ["id", "profile-message-collaboration"],
                  ["name", "message_collaboration"],
                  ["rows", 3],
                  ["maxlength", 400],
                  ["placeholder", "Le message affiché pour inviter les visiteurs à collaborer avec vous..."],
                ],
                children: [profile?.message_collaboration || ""],
              },
            ],
          },

          // Bouton de soumission
          {
            type: "div",
            attributes: [["class", ["form-actions"]]],
            children: [
              {
                type: "button",
                attributes: [
                  ["type", "submit"],
                  ["class", ["btn", "btn-primary"]],
                ],
                children: [isNew ? "Créer mon profil" : "Enregistrer les modifications du profil"],
              },
            ],
          },
        ],
      },
    ],
  };
}
