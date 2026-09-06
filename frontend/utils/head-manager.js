/**
 * SEO & Head Manager dynamique SPA (T0021)
 *
 * Fournit une gestion centralisée des métadonnées du document :
 * - document.title
 * - meta description
 * - Open Graph (og:title, og:description, og:type, og:url, og:image)
 * - link[rel="canonical"]
 */

export const DEFAULT_META = {
  title: "Portfolio — Développeur Fullstack & Ingénieur Frontend",
  description:
    "Portfolio professionnel et CV interactif développé avec une architecture Vanilla JavaScript moderne et Strapi CMS.",
  type: "website",
  image: null,
};

export const DEFAULT_META_REGISTRY = {
  "/": {
    title: "Ruben Kabangamuya — Développeur Fullstack & Ingénieur Frontend",
    description:
      "Portfolio professionnel et CV interactif développé avec une architecture Vanilla JavaScript moderne et Strapi CMS.",
    type: "website",
  },
  "/portfolio": {
    title: "Portfolio & Projets | Ruben Kabangamuya",
    description:
      "Explorez les projets réalisés, les architectures logicielles conçues et les démonstrations techniques développées.",
    type: "website",
  },
  "/experiences": {
    title: "Expériences Professionnelles | Ruben Kabangamuya",
    description:
      "Parcours professionnel, réalisations techniques et compétences développées.",
    type: "website",
  },
  "/cv": {
    title: "Curriculum Vitae | Ruben Kabangamuya",
    description:
      "Consultez mon parcours professionnel, mes formations et mes compétences techniques.",
    type: "website",
  },
  "/contact": {
    title: "Contact | Ruben Kabangamuya",
    description:
      "Prendre contact pour des opportunités professionnelles, collaborations ou missions freelance.",
    type: "website",
  },
  "/admin": {
    title: "Administration | Portfolio",
    description: "Espace d'administration des contenus Strapi.",
    type: "website",
  },
  "/table": {
    title: "Démonstration Table Réactive | Portfolio",
    description: "Module réactif de tableau de données avec Vanilla JS.",
    type: "website",
  },
  "/gallery": {
    title: "Galerie d'Images | Portfolio",
    description: "Galerie multimédia dynamique et responsive.",
    type: "website",
  },
  "/signup": {
    title: "Créer un compte | Portfolio",
    description: "Inscription à l'espace utilisateur du portfolio.",
    type: "website",
  },
  "/login": {
    title: "Connexion | Portfolio",
    description: "Connexion à l'espace utilisateur et administration.",
    type: "website",
  },
  "*": {
    title: "Page introuvable | 404",
    description:
      "L'adresse que vous tentez d'ouvrir n'existe pas ou a été déplacée.",
    type: "website",
  },
};

/**
 * Updates or creates a meta tag in document.head
 * @param {string} key - Name or property value (e.g. "description", "og:title")
 * @param {string|null} content - Attribute content
 * @param {boolean} [isProperty=false] - If true, uses property attribute instead of name
 */
export function setMetaTag(key, content, isProperty = false) {
  if (
    typeof document === "undefined" ||
    !document.head ||
    typeof document.head.querySelector !== "function"
  ) {
    return;
  }
  const attribute = isProperty ? "property" : "name";
  let meta = document.head.querySelector(`meta[${attribute}="${key}"]`);

  if (content === null || content === undefined || content === "") {
    if (meta) meta.remove();
    return;
  }

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", String(content));
}

/**
 * Updates or creates the canonical link element in document.head
 * @param {string|null} url
 */
export function setCanonical(url) {
  if (
    typeof document === "undefined" ||
    !document.head ||
    typeof document.head.querySelector !== "function"
  ) {
    return;
  }
  let link = document.head.querySelector('link[rel="canonical"]');

  if (!url) {
    if (link) link.remove();
    return;
  }

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", String(url));
}

/**
 * Updates document.title and all relevant head meta tags
 * @param {Object} [options]
 * @param {string} [options.title]
 * @param {string} [options.description]
 * @param {string} [options.type]
 * @param {string} [options.url]
 * @param {string|null} [options.image]
 */
export function updateHead(options = {}) {
  if (typeof document === "undefined") return;

  const title = options.title || DEFAULT_META.title;
  const description = options.description || DEFAULT_META.description;
  const type = options.type || DEFAULT_META.type;
  const url =
    options.url ||
    (typeof window !== "undefined" ? window.location.href : "");

  // 1. Title
  document.title = title;

  // 2. Standard Meta Description
  setMetaTag("description", description, false);

  // 3. Open Graph Tags
  setMetaTag("og:title", title, true);
  setMetaTag("og:description", description, true);
  setMetaTag("og:type", type, true);
  if (url) {
    setMetaTag("og:url", url, true);
  }

  // 4. Open Graph Image (normalize relative URLs to absolute)
  let imageUrl = options.image || null;
  if (
    imageUrl &&
    typeof window !== "undefined" &&
    !imageUrl.startsWith("http://") &&
    !imageUrl.startsWith("https://")
  ) {
    const origin = window.location.origin || "";
    imageUrl = `${origin.replace(/\/$/, "")}/${imageUrl.replace(/^\//, "")}`;
  }
  setMetaTag("og:image", imageUrl, true);

  // 5. Canonical Link
  if (url) {
    setCanonical(url);
  }
}

/**
 * Applies default or customized metadata for a given route pathname
 * @param {string} pathname
 * @param {Object} [customMeta={}]
 * @returns {Object} Applied metadata object
 */
export function setRouteHead(pathname, customMeta = {}) {
  const normalized =
    pathname === "/" ? "/" : (pathname || "").replace(/\/+$/, "");
  const defaultRouteMeta =
    DEFAULT_META_REGISTRY[normalized] ||
    DEFAULT_META_REGISTRY["*"] ||
    DEFAULT_META;

  const merged = {
    ...DEFAULT_META,
    ...defaultRouteMeta,
    ...customMeta,
  };

  updateHead(merged);
  return merged;
}
