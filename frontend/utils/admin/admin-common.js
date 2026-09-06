/**
 * Shared administration utilities, status badges and anchor navigation
 */

export function refresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("pushstate"));
  }
}

export function slugify(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const STATUT_LABELS = {
  brouillon: "Brouillon",
  pret_a_relire: "Prêt à relire",
  publie: "Publié (En ligne)",
  archive: "Archivé",
};

export function getAllowedStatuts(currentStatus) {
  if (!currentStatus) return ["brouillon", "pret_a_relire", "publie", "archive"];
  const transitions = {
    brouillon: ["brouillon", "pret_a_relire"],
    pret_a_relire: ["pret_a_relire", "brouillon", "publie"],
    publie: ["publie", "brouillon", "archive"],
    archive: ["archive", "brouillon"],
  };
  return transitions[currentStatus] || ["brouillon", "pret_a_relire", "publie", "archive"];
}

export function renderStatusBadge(statut) {
  const label = STATUT_LABELS[statut] || statut || "Brouillon";
  return {
    type: "span",
    attributes: [["class", ["badge-statut", `badge-statut-${statut || "brouillon"}`]]],
    children: [label],
  };
}

export function AdminAnchorLink(targetId, label, extraClass = "") {
  return {
    type: "a",
    attributes: [
      ["href", `#${targetId}`],
      ["class", ["admin-nav-link", extraClass].filter(Boolean)],
    ],
    events: [
      [
        "click",
        (event) => {
          event.preventDefault();
          const target = document.getElementById(targetId);
          if (target) {
            target.scrollIntoView({ behavior: "smooth" });
            if (typeof window !== "undefined" && window.history?.replaceState) {
              window.history.replaceState(null, "", `#${targetId}`);
            }
          }
        },
      ],
    ],
    children: [label],
  };
}
