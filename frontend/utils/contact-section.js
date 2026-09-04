import createState from "../lib/create-state.js";
import reactive from "../lib/reactive.js";
import { sendMessage } from "../lib/api.js";
import { getTheme } from "../lib/theme.js";

const formState = createState({
  nom: "",
  email: "",
  contenu: "",
  status: "idle",
  error: "",
});

function renderFeedback(state) {
  if (state.status === "loading") return { type: "p", children: ["Envoi en cours…"] };
  if (state.status === "success") {
    return {
      type: "p",
      attributes: [["class", ["form-feedback", "form-feedback-success"]]],
      children: ["Message envoyé, merci ! Je reviens vers vous rapidement."],
    };
  }
  if (state.status === "error") {
    return {
      type: "p",
      attributes: [["class", ["form-feedback", "form-feedback-error"]]],
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
} = {}) {
  const isIris = getTheme() === "iris";
  const phoneHref = `tel:${phone.replace(/[^+\d]/g, "")}`;

  async function handleSubmit(event) {
    event.preventDefault();
    const { nom, email, contenu } = formState.get();

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
    const result = await sendMessage({ nom, email, contenu });
    if (result.success) {
      formState.set({ nom: "", email: "", contenu: "", status: "success", error: "" });
    } else {
      formState.set((s) => ({ ...s, status: "error", error: result.error || "Erreur lors de l'envoi." }));
    }
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
                children: [
                  "Nom complet",
                  {
                    type: "input",
                    attributes: [["type", "text"], ["placeholder", "John Doe"]],
                    events: [["input", (e) => formState.set((s) => ({ ...s, nom: e.target.value }))]],
                  },
                ],
              },
              {
                type: "label",
                children: [
                  "Adresse mail",
                  {
                    type: "input",
                    attributes: [["type", "email"], ["placeholder", "example@mail.com"]],
                    events: [["input", (e) => formState.set((s) => ({ ...s, email: e.target.value }))]],
                  },
                ],
              },
              {
                type: "label",
                children: [
                  "Message",
                  {
                    type: "textarea",
                    attributes: [["rows", 5], ["placeholder", "Votre message..."]],
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
