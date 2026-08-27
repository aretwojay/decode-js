const API_URL = '/api';
import { getToken } from './auth.js';

export async function getExperiences() {
  try {
    const response = await fetch(`${API_URL}/experiences?populate=*`);
    if (!response.ok) throw new Error('Erreur réseau');
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des expériences:', error);
    return [];
  }
}

export async function getProjets() {
  const response = await fetch(`${API_URL}/projets?populate=*`);
  const json = await response.json();
  return json.data;
}

export async function getCompetences() {
  const response = await fetch(`${API_URL}/competences?populate=*`);
  const json = await response.json();
  return json.data;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(identifier, password) {
  const res = await fetch(`${API_URL}/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  if (!res.ok) throw new Error('Identifiants invalides');
  return res.json();
}

export async function register(username, email, password) {
  const res = await fetch(`${API_URL}/auth/local/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Erreur lors de l'inscription");
  }
  return res.json();
}

async function crudRequest(path, method, data) {
  const res = await fetch(`${API_URL}/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: data ? JSON.stringify({ data }) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Erreur API');
  }
  return res.json();
}

export const createExperience = (data) => crudRequest('experiences', 'POST', data);
export const updateExperience = (id, data) => crudRequest(`experiences/${id}`, 'PUT', data);
export const deleteExperience = (id) => crudRequest(`experiences/${id}`, 'DELETE');

export const createProjet = (data) => crudRequest('projets', 'POST', data);
export const updateProjet = (id, data) => crudRequest(`projets/${id}`, 'PUT', data);
export const deleteProjet = (id) => crudRequest(`projets/${id}`, 'DELETE');

export const createCompetence = (data) => crudRequest('competences', 'POST', data);
export const updateCompetence = (id, data) => crudRequest(`competences/${id}`, 'PUT', data);
export const deleteCompetence = (id) => crudRequest(`competences/${id}`, 'DELETE');