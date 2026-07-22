const API_URL = '/api';

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