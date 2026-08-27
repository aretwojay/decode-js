import { appStore } from "./store.js";
import { authHeaders } from "./auth.js";


export const API_BASE_URL =
  (typeof window !== "undefined" && window.__API_URL__) ||
  "http://localhost:1337";

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

export function normalizeCollection(response) {
  if (!response || !Array.isArray(response.data)) {
    return [];
  }
  return response.data.map(normalizeEntity).filter(Boolean);
}

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

async function apiMutate(endpoint, method, data) {
  return apiFetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: data !== undefined ? JSON.stringify({ data }) : undefined,
  });
}

export async function fetchProjects({ featured = false, statut } = {}) {
  try {
    let query = `projets?populate=*`;
    if (statut) query += `&filters[statut][$eq]=${encodeURIComponent(statut)}`;
    if (featured) query += `&filters[en_vedette][$eq]=true`;
    const res = await apiFetch(query);
    return normalizeCollection(res);
  } catch (err) {
    return [];
  }
}

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

export async function fetchExperiences({ statut } = {}) {
  try {
    let query = `experiences?populate=*&sort[0]=date_debut:desc`;
    if (statut) query += `&filters[statut][$eq]=${encodeURIComponent(statut)}`;
    const res = await apiFetch(query);
    return normalizeCollection(res);
  } catch (err) {
    return [];
  }
}

export async function fetchSkills({ statut, niveau } = {}) {
  try {
    let query = `competences?populate=*`;
    if (statut) query += `&filters[statut][$eq]=${encodeURIComponent(statut)}`;
    if (niveau) query += `&filters[niveau][$eq]=${encodeURIComponent(niveau)}`;
    const res = await apiFetch(query);
    return normalizeCollection(res);
  } catch (err) {
    return [];
  }
}

export const fetchCompetences = fetchSkills;

export async function fetchFormations({ statut } = {}) {
  try {
    let query = `formations?populate=*&sort[0]=date_debut:desc`;
    if (statut) query += `&filters[statut][$eq]=${encodeURIComponent(statut)}`;
    const res = await apiFetch(query);
    return normalizeCollection(res);
  } catch (err) {
    return [];
  }
}

export async function fetchProfile({ statut } = {}) {
  try {
    let query = `profils?populate=*`;
    if (statut) query += `&filters[statut][$eq]=${encodeURIComponent(statut)}`;
    const res = await apiFetch(query);
    const profils = normalizeCollection(res);
    return profils[0] || null;
  } catch (err) {
    return null;
  }
}

export async function sendMessage(messageData) {
  try {
    const res = await apiFetch("messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: messageData }),
    });
    return { success: true, data: normalizeEntity(res.data) };
  } catch (err) {
    return { success: false, error: err.message, details: err.details || null };
  }
}

export async function syncStoreFromApi(storeInstance = appStore) {
  const current = storeInstance.getState ? storeInstance.getState() : storeInstance.get();

  if (storeInstance.setState) {
    storeInstance.setState((state) => ({ ...state, loading: true, error: null }));
  }

  try {
    const [profile, projects, experiences, skills, formations] = await Promise.all([
      fetchProfile(),
      fetchProjects(),
      fetchExperiences(),
      fetchSkills(),
      fetchFormations(),
    ]);

    const patch = { loading: false, error: null };
    if (profile) patch.profile = profile;
    if (projects?.length) patch.projects = projects;
    if (experiences?.length) patch.experiences = experiences;
    if (skills?.length) patch.skills = skills;
    if (formations?.length) patch.formations = formations;

    if (storeInstance.setState) {
      storeInstance.setState((state) => ({ ...state, ...patch }));
    } else if (storeInstance.set) {
      storeInstance.set({ ...current, ...patch });
    }

    return storeInstance.getState ? storeInstance.getState() : storeInstance.get();
  } catch (err) {
    console.error("[API Client] Failed to synchronize store with API:", err);
    const errorPatch = { loading: false, error: err.message };
    if (storeInstance.setState) {
      storeInstance.setState((state) => ({ ...state, ...errorPatch }));
    }
    return storeInstance.getState ? storeInstance.getState() : storeInstance.get();
  }
}


export const createExperience = (data) => apiMutate("experiences", "POST", data);
export const updateExperience = (id, data) => apiMutate(`experiences/${id}`, "PUT", data);
export const deleteExperience = (id) => apiMutate(`experiences/${id}`, "DELETE");

export const createProjet = (data) => apiMutate("projets", "POST", data);
export const updateProjet = (id, data) => apiMutate(`projets/${id}`, "PUT", data);
export const deleteProjet = (id) => apiMutate(`projets/${id}`, "DELETE");

export const createCompetence = (data) => apiMutate("competences", "POST", data);
export const updateCompetence = (id, data) => apiMutate(`competences/${id}`, "PUT", data);
export const deleteCompetence = (id) => apiMutate(`competences/${id}`, "DELETE");


export const getExperiences = fetchExperiences;
export const getProjets = fetchProjects;
export const getCompetences = fetchSkills;

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
  createExperience,
  updateExperience,
  deleteExperience,
  createProjet,
  updateProjet,
  deleteProjet,
  createCompetence,
  updateCompetence,
  deleteCompetence,
};