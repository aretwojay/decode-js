/**
 * API Client & Integration Layer (T0013)
 * Pure Vanilla JS fetch helpers and data adapters for Strapi 5 REST API
 */

import { appStore } from "./store.js";

/**
 * Base URL for the Strapi Content API.
 * - En local, le frontend (port 5500) et Strapi (port 1337) sont sur des
 *   origines différentes : on cible localhost:1337 explicitement.
 * - En production, nginx sert le frontend et proxy /api/ vers Strapi sur
 *   la même origine : on utilise directement l'origine courante.
 */
function resolveApiBaseUrl() {
  if (typeof window === "undefined") return "http://localhost:1337";
  if (window.__API_URL__) return window.__API_URL__;
  if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return "http://localhost:1337";
  }
  return window.location.origin;
}

export const API_BASE_URL = resolveApiBaseUrl();

/**
 * Checks if a value represents a Strapi media file or array of media files
 * @param {*} val
 * @returns {boolean}
 */
function isMediaObject(val) {
  if (!val || typeof val !== "object") return false;

  if (Array.isArray(val)) {
    return val.length > 0 && val.every((item) => isMediaObject(item));
  }

  return (
    typeof val.url === "string" &&
    (val.mime !== undefined ||
      val.formats !== undefined ||
      val.ext !== undefined ||
      val.hash !== undefined ||
      val.provider !== undefined ||
      val.url.startsWith("/uploads/") ||
      val.url.startsWith("http"))
  );
}

/**
 * Extracts plain text from Strapi 5 rich text blocks
 * @param {Array|string} blocks
 * @returns {string}
 */
export function extractBlocksText(blocks) {
  if (!blocks) return "";
  if (typeof blocks === "string") return blocks;
  if (Array.isArray(blocks)) {
    return blocks
      .map((block) => {
        if (block?.children && Array.isArray(block.children)) {
          return block.children.map((child) => child.text || "").join("");
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return "";
}

/**
 * Normalizes a media object or array of media objects from Strapi
 * Ensures absolute URLs for images and attachments
 * @param {Object|Array} media
 * @returns {Object|Array|null}
 */
export function normalizeMedia(media) {
  if (!media) return null;

  if (Array.isArray(media)) {
    return media.map(normalizeMedia).filter(Boolean);
  }

  const rawUrl = typeof media.url === "string" ? media.url : "";
  const fullUrl = rawUrl.startsWith("http")
    ? rawUrl
    : rawUrl
    ? `${API_BASE_URL}${rawUrl}`
    : "";

  // Normalize responsive formats if present
  const normalizedFormats = {};
  if (media.formats && typeof media.formats === "object") {
    for (const [formatKey, formatVal] of Object.entries(media.formats)) {
      if (formatVal && formatVal.url) {
        normalizedFormats[formatKey] = {
          ...formatVal,
          url: formatVal.url.startsWith("http")
            ? formatVal.url
            : `${API_BASE_URL}${formatVal.url}`,
        };
      }
    }
  }

  return {
    id: media.id,
    documentId: media.documentId,
    name: media.name || "",
    caption: media.caption || "",
    alternativeText: media.alternativeText || "",
    width: media.width || null,
    height: media.height || null,
    mime: media.mime || "",
    url: fullUrl,
    formats: normalizedFormats,
  };
}

/**
 * Normalizes a single Strapi 5 entity into a clean Vanilla JS domain object
 * @param {Object} item
 * @returns {Object|null}
 */
export function normalizeEntity(item) {
  if (!item || typeof item !== "object") return null;

  const normalized = {
    id: item.id,
    documentId: item.documentId,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
    publishedAt: item.publishedAt || null,
  };

  for (const [key, value] of Object.entries(item)) {
    if (["id", "documentId", "createdAt", "updatedAt", "publishedAt"].includes(key)) {
      continue;
    }

    if (value && typeof value === "object") {
      // Check if it is a rich text blocks structure
      if (Array.isArray(value) && value[0]?.type && value[0]?.children) {
        normalized[key] = extractBlocksText(value);
        normalized[`${key}Blocks`] = value;
      } else if (isMediaObject(value)) {
        normalized[key] = normalizeMedia(value);
      } else if (Array.isArray(value)) {
        normalized[key] = value.map((subItem) =>
          subItem && typeof subItem === "object" ? normalizeEntity(subItem) : subItem
        );
      } else {
        normalized[key] = normalizeEntity(value);
      }
    } else {
      normalized[key] = value;
    }
  }

  return normalized;
}

/**
 * Normalizes a Strapi collection response ({ data: [...] })
 * @param {Object} response
 * @returns {Array}
 */
export function normalizeCollection(response) {
  if (!response || !Array.isArray(response.data)) {
    return [];
  }
  return response.data.map(normalizeEntity).filter(Boolean);
}

/**
 * Base HTTP request helper with error resilience
 * @param {string} endpoint
 * @param {Object} options
 * @returns {Promise<Object>}
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}/api/${endpoint.replace(/^\//, "")}`;
  const fetchOptions = {
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
    ...options,
  };

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        data?.error?.message || `HTTP ${response.status} - ${response.statusText}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.details = data?.error?.details || null;
      throw error;
    }

    return data;
  } catch (err) {
    console.warn(`[API Client] Error on ${url}:`, err.message);
    throw err;
  }
}

/**
 * Fetches published projects
 * @param {Object} [options]
 * @param {boolean} [options.featured] - Filter for featured projects
 * @param {string} [options.statut] - Optional workflow status filter
 * @returns {Promise<Array>}
 */
export async function fetchProjects({ featured = false, statut } = {}) {
  try {
    let query = `projets?populate=*`;
    if (statut) {
      query += `&filters[statut][$eq]=${encodeURIComponent(statut)}`;
    }
    if (featured) {
      query += `&filters[en_vedette][$eq]=true`;
    }
    const res = await apiFetch(query);
    return normalizeCollection(res);
  } catch (err) {
    return [];
  }
}

/**
 * Fetches a single published project by its slug
 * @param {string} slug
 * @returns {Promise<Object|null>}
 */
export async function fetchProjectBySlug(slug) {
  if (!slug) return null;
  try {
    const query = `projets?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`;
    const res = await apiFetch(query);
    const projects = normalizeCollection(res);
    return projects[0] || null;
  } catch (err) {
    return null;
  }
}

/**
 * Fetches published professional experiences ordered by date_debut descending
 * @param {Object} [options]
 * @param {string} [options.statut] - Optional workflow status filter
 * @returns {Promise<Array>}
 */
export async function fetchExperiences({ statut } = {}) {
  try {
    let query = `experiences?populate=*&sort[0]=date_debut:desc`;
    if (statut) {
      query += `&filters[statut][$eq]=${encodeURIComponent(statut)}`;
    }
    const res = await apiFetch(query);
    return normalizeCollection(res);
  } catch (err) {
    return [];
  }
}

/**
 * Fetches published skills / competences
 * @param {Object} [options]
 * @param {string} [options.statut] - Optional workflow status filter
 * @param {string} [options.niveau] - Optional level filter
 * @returns {Promise<Array>}
 */
export async function fetchSkills({ statut, niveau } = {}) {
  try {
    let query = `competences?populate=*`;
    if (statut) {
      query += `&filters[statut][$eq]=${encodeURIComponent(statut)}`;
    }
    if (niveau) {
      query += `&filters[niveau][$eq]=${encodeURIComponent(niveau)}`;
    }
    const res = await apiFetch(query);
    return normalizeCollection(res);
  } catch (err) {
    return [];
  }
}

export const fetchCompetences = fetchSkills;

/**
 * Fetches published formations / diplomas ordered by date_debut descending
 * @param {Object} [options]
 * @param {string} [options.statut] - Optional workflow status filter
 * @returns {Promise<Array>}
 */
export async function fetchFormations({ statut } = {}) {
  try {
    let query = `formations?populate=*&sort[0]=date_debut:desc`;
    if (statut) {
      query += `&filters[statut][$eq]=${encodeURIComponent(statut)}`;
    }
    const res = await apiFetch(query);
    return normalizeCollection(res);
  } catch (err) {
    return [];
  }
}

/**
 * Fetches primary published candidate profile
 * @param {Object} [options]
 * @param {string} [options.statut] - Optional workflow status filter
 * @returns {Promise<Object|null>}
 */
export async function fetchProfile({ statut } = {}) {
  try {
    let query = `profils?populate=*`;
    if (statut) {
      query += `&filters[statut][$eq]=${encodeURIComponent(statut)}`;
    }
    const res = await apiFetch(query);
    const profils = normalizeCollection(res);
    return profils[0] || null;
  } catch (err) {
    return null;
  }
}

/**
 * Sends a contact message to the controlled public ingestion endpoint
 * @param {Object} messageData
 * @param {string} messageData.nom
 * @param {string} messageData.email
 * @param {string} [messageData.sujet]
 * @param {string} messageData.contenu
 * @returns {Promise<{success: boolean, data?: Object, error?: string, details?: Object}>}
 */
export async function sendMessage(messageData) {
  try {
    const res = await apiFetch("messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: messageData }),
    });

    return {
      success: true,
      data: normalizeEntity(res.data),
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      details: err.details || null,
    };
  }
}

/**
 * Synchronizes the reactive store with published CMS entities
 * Seamlessly updates appStore using its existing setState method
 * @param {Object} [storeInstance=appStore]
 * @returns {Promise<Object>}
 */
export async function syncStoreFromApi(storeInstance = appStore) {
  const current = storeInstance.getState ? storeInstance.getState() : storeInstance.get();
  
  if (storeInstance.setState) {
    storeInstance.setState((state) => ({ ...state, loading: true, error: null }));
  }

  try {
    const [profile, projects, experiences, skills, formations] =
      await Promise.all([
        fetchProfile(),
        fetchProjects(),
        fetchExperiences(),
        fetchSkills(),
        fetchFormations(),
      ]);

    const patch = {
      loading: false,
      error: null,
    };

    if (profile) patch.profile = profile;
    if (projects && projects.length > 0) patch.projects = projects;
    if (experiences && experiences.length > 0) patch.experiences = experiences;
    if (skills && skills.length > 0) patch.skills = skills;
    if (formations && formations.length > 0) patch.formations = formations;

    if (storeInstance.setState) {
      storeInstance.setState((state) => ({
        ...state,
        ...patch,
      }));
    } else if (storeInstance.set) {
      storeInstance.set({
        ...current,
        ...patch,
      });
    }

    return storeInstance.getState ? storeInstance.getState() : storeInstance.get();
  } catch (err) {
    console.error("[API Client] Failed to synchronize store with API:", err);
    const errorPatch = {
      loading: false,
      error: err.message,
    };
    if (storeInstance.setState) {
      storeInstance.setState((state) => ({ ...state, ...errorPatch }));
    }
    return storeInstance.getState ? storeInstance.getState() : storeInstance.get();
  }
}

export default {
  API_BASE_URL,
  extractBlocksText,
  normalizeMedia,
  normalizeEntity,
  normalizeCollection,
  fetchProjects,
  fetchProjectBySlug,
  fetchExperiences,
  fetchSkills,
  fetchCompetences,
  fetchFormations,
  fetchProfile,
  sendMessage,
  syncStoreFromApi,
};