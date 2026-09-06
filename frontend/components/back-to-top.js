export default function BackToTop() {
  return {
    type: "button",
    attributes: [
      ["type", "button"],
      ["class", ["back-to-top"]],
      ["aria-label", "Retour en haut de la page"],
    ],
    events: [
      [
        "click",
        () => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      ],
    ],
    children: [
      { type: "span", attributes: [["class", ["back-to-top-icon"]]], children: [] },
    ],
  };
}

export function initBackToTopVisibility() {
  if (typeof window === "undefined") return;

  const el = document.querySelector(".back-to-top");
  if (!el) return;

  const toggle = () => {
    el.classList.toggle("is-visible", window.scrollY > 400);
  };

  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
}
