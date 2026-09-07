import createState from "../lib/create-state.js";
import reactive from "../lib/reactive.js";
import { sendMessage } from "../lib/api.js";
import { getTheme } from "../lib/theme.js";
import { showToast } from "../components/ui-feedback.js";

const formState = createState({
  nom: "",
  email: "",
  sujet: "",
  contenu: "",
  status: "idle",
  error: "",
});

function renderFeedback(state) {
  if (state.status === "loading") return { type: "p", attributes: [["role", "status"], ["aria-live", "polite"]], children: ["Envoi en cours…"] };
  if (state.status === "success") {
    return {
      type: "p",
      attributes: [
        ["class", ["form-feedback", "form-feedback-success"]],
        ["role", "status"],
        ["aria-live", "polite"],
      ],
      children: ["Message envoyé, merci ! Je reviens vers vous rapidement."],
    };
  }
  if (state.status === "error") {
    return {
      type: "p",
      attributes: [
        ["class", ["form-feedback", "form-feedback-error"]],
        ["role", "alert"],
        ["aria-live", "assertive"],
        ["id", "contact-form-error"],
      ],
      children: [state.error],
    };
  }
  return { type: "p", children: [""] };
}

export function renderContactSection({
  headingTag = "h2",
  phone = "",
  email = "contact@example.com",
  location = "",
  initialSubject = "",
  contactTagline = "",
} = {}) {
  const isIris = getTheme() === "iris";
  const isYaniss = getTheme() === "yaniss";
  const phoneHref = `tel:${phone.replace(/[^+\d]/g, "")}`;

  // Pre-fill subject from parameters or URL if provided
  const urlParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const paramSubject = initialSubject || urlParams?.get("subject") || "";
  if (paramSubject && !formState.get().sujet) {
    formState.set((s) => ({ ...s, sujet: paramSubject }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const { nom, email, sujet, contenu } = formState.get();

    if (!nom || nom.length < 2) {
      formState.set((s) => ({ ...s, status: "error", error: "Le nom complet est requis." }));
      return;
    }
    if (!email || !email.includes("@")) {
      formState.set((s) => ({ ...s, status: "error", error: "Adresse email invalide." }));
      return;
    }
    if (!contenu || contenu.length < 5) {
      formState.set((s) => ({ ...s, status: "error", error: "Le message est trop court." }));
      return;
    }

    formState.set((s) => ({ ...s, status: "loading", error: "" }));
    const result = await sendMessage({ nom, email, sujet, contenu });
    if (result.success) {
      formState.set({ nom: "", email: "", sujet: "", contenu: "", status: "success", error: "" });
      showToast("Message envoyé avec succès ! Merci.", "success");
    } else {
      const errText = result.error || "Erreur lors de l'envoi du message.";
      formState.set((s) => ({ ...s, status: "error", error: errText }));
      showToast(errText, "error");
    }
  }

  if (isYaniss) {
    const state = formState.get();
    const tagline = contactTagline || "[ Formulaire de contact pour une mise en relation direct ]";

    return {
      type: "section",
      attributes: [
        ["id", "contact"],
        ["class", ["section", "contact-section-yaniss"]],
      ],
      children: [
        {
          type: "div",
          attributes: [["class", ["section-header-center"]]],
          children: [
            {
              type: "p",
              attributes: [["class", ["contact-tagline-yaniss"]]],
              children: [tagline],
            },
            {
              type: headingTag,
              attributes: [["class", ["section-title"]]],
              children: [
                "TRAVAILLONS ",
                { type: "span", attributes: [["class", ["highlight"]]], children: ["ENSEMBLE"] },
              ],
            },
          ],
        },
        {
          type: "div",
          attributes: [["class", ["contact-card-yaniss"]]],
          children: [
            {
              type: "div",
              attributes: [["class", ["contact-card-yaniss-image"]]],
              children: [
                { type: "img", attributes: [["src", "/public/yaniss/contact-envelope.png"], ["alt", ""]] },
              ],
            },
            {
              type: "form",
              attributes: [["class", ["contact-form-yaniss"]]],
              events: [["submit", handleSubmit]],
              children: [
                {
                  type: "div",
                  attributes: [["class", ["contact-form-yaniss-row"]]],
                  children: [
                    {
                      type: "input",
                      attributes: [["type", "text"], ["placeholder", "prénom"], ["value", state.nom || ""]],
                      events: [["input", (e) => formState.set((s) => ({ ...s, nom: e.target.value }))]],
                    },
                    {
                      type: "input",
                      attributes: [["type", "text"], ["placeholder", "entreprise"], ["value", state.sujet || ""]],
                      events: [["input", (e) => formState.set((s) => ({ ...s, sujet: e.target.value }))]],
                    },
                  ],
                },
                {
                  type: "input",
                  attributes: [["type", "email"], ["placeholder", "mail"], ["value", state.email || ""]],
                  events: [["input", (e) => formState.set((s) => ({ ...s, email: e.target.value }))]],
                },
                {
                  type: "textarea",
                  attributes: [["rows", 6], ["placeholder", "message"]],
                  events: [["input", (e) => formState.set((s) => ({ ...s, contenu: e.target.value }))]],
                  children: [state.contenu || ""],
                },
                {
                  type: "button",
                  attributes: [["type", "submit"], ["class", ["btn", "btn-primary"]]],
                  children: ["Envoyer le message"],
                },
                reactive(formState, renderFeedback),
              ],
            },
          ],
        },
      ],
    };
  }

  return {
    type: "section",
    attributes: [
      ["id", "contact"],
      ["class", ["section", "contact-section"]],
    ],
    children: [
      {
        type: "div",
        attributes: [["class", ["section-header", "section-header-center"]]],
        children: [
          { type: headingTag, attributes: [["class", ["section-title"]]], children: ["Contact"] },
          { type: "p", attributes: [["class", ["section-subtitle"]]], children: ["Travaillons ensemble"] },
        ],
      },
      {
        type: "div",
        attributes: [["class", ["contact-layout"]]],
        children: [
          {
            type: "div",
            attributes: [["class", ["contact-info"]]],
            children: [
              isIris
                ? {
                    type: "img",
                    attributes: [
                      ["src", "/public/iris/contact.jpg"],
                      ["alt", ""],
                      ["class", ["contact-image"]],
                    ],
                  }
                : { type: "span", children: [] },
              phone
                ? {
                    type: "div",
                    attributes: [["class", ["contact-info-item"]]],
                    children: [
                      isIris
                        ? { type: "span", attributes: [["class", ["contact-icon-badge"]]], children: [{ type: "div", attributes: [["class", ["contact-icon-glyph", "icon-phone"]]], children: [] }] }
                        : "📞 ",
                      {
                        type: "a",
                        attributes: [["href", phoneHref]],
                        children: [phone],
                      },
                    ],
                  }
                : { type: "span", children: [] },
              {
                type: "div",
                attributes: [["class", ["contact-info-item"]]],
                children: [
                  isIris
                    ? { type: "span", attributes: [["class", ["contact-icon-badge"]]], children: [{ type: "div", attributes: [["class", ["contact-icon-glyph", "icon-mail"]]], children: [] }] }
                    : "✉️ ",
                  {
                    type: "a",
                    attributes: [["href", `mailto:${email}`]],
                    children: [email],
                  },
                ],
              },
              location
                ? {
                    type: "div",
                    attributes: [["class", ["contact-info-item"]]],
                    children: [
                      isIris
                        ? { type: "span", attributes: [["class", ["contact-icon-badge"]]], children: [{ type: "div", attributes: [["class", ["contact-icon-glyph", "icon-pin"]]], children: [] }] }
                        : "📍 ",
                      { type: "span", children: [location] },
                    ],
                  }
                : { type: "span", children: [] },
            ],
          },
          {
            type: "form",
            attributes: [["class", ["contact-form"]]],
            events: [["submit", handleSubmit]],
            children: [
              {
                type: "label",
                attributes: [["for", "contact-nom"]],
                children: [
                  "Nom complet *",
                  {
                    type: "input",
                    attributes: [
                      ["id", "contact-nom"],
                      ["type", "text"],
                      ["required", "true"],
                      ["aria-required", "true"],
                      ["placeholder", "John Doe"],
                    ],
                    events: [["input", (e) => formState.set((s) => ({ ...s, nom: e.target.value }))]],
                  },
                ],
              },
              {
                type: "label",
                attributes: [["for", "contact-email"]],
                children: [
                  "Adresse mail *",
                  {
                    type: "input",
                    attributes: [
                      ["id", "contact-email"],
                      ["type", "email"],
                      ["required", "true"],
                      ["aria-required", "true"],
                      ["placeholder", "example@mail.com"],
                    ],
                    events: [["input", (e) => formState.set((s) => ({ ...s, email: e.target.value }))]],
                  },
                ],
              },
              {
                type: "label",
                attributes: [["for", "contact-sujet"]],
                children: [
                  "Sujet",
                  {
                    type: "input",
                    attributes: [
                      ["id", "contact-sujet"],
                      ["type", "text"],
                      ["placeholder", "Objet du message..."],
                      ["value", formState.get().sujet || ""],
                    ],
                    events: [
                      [
                        "input",
                        (e) =>
                          formState.set((s) => ({ ...s, sujet: e.target.value })),
                      ],
                    ],
                  },
                ],
              },
              {
                type: "label",
                attributes: [["for", "contact-contenu"]],
                children: [
                  "Message *",
                  {
                    type: "textarea",
                    attributes: [
                      ["id", "contact-contenu"],
                      ["rows", 5],
                      ["required", "true"],
                      ["aria-required", "true"],
                      ["placeholder", "Votre message..."],
                    ],
                    events: [["input", (e) => formState.set((s) => ({ ...s, contenu: e.target.value }))]],
                  },
                ],
              },
              {
                type: "button",
                attributes: [["type", "submit"], ["class", ["btn", "btn-primary"]]],
                children: ["Envoyer le message"],
              },
              reactive(formState, renderFeedback),
            ],
          },
        ],
      },
    ],
  };
}
