/**
 * Génère un slug à partir d'un texte (ex: "Jean Dupont" -> "jean-dupont").
 * Les champs de type `uid` de Strapi ne se génèrent automatiquement que
 * depuis l'admin (bouton "regénérer") ; l'API REST brute exige une valeur.
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
