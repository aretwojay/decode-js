/**
 * Machine à états pour le champ `statut` du workflow éditorial
 * (brouillon → prêt à relire → publié → archivé), partagée par tous
 * les content-types qui portent ce champ (profil, projet, competence,
 * experience, formation).
 *
 * Transitions autorisées : le pipeline avance dans l'ordre (pas moyen
 * de sauter une étape), mais on peut revenir en arrière pour corriger
 * ou dépublier, et réactiver un contenu archivé.
 */
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  brouillon: ['pret_a_relire'],
  pret_a_relire: ['brouillon', 'publie'],
  publie: ['brouillon', 'archive'],
  archive: ['brouillon'],
};

/**
 * Vérifie qu'un changement de statut est autorisé.
 * @returns null si la transition est valide, sinon un message d'erreur
 */
export function checkStatusTransition(from: string, to: string): string | null {
  if (from === to) return null;
  const allowed = STATUS_TRANSITIONS[from];
  if (!allowed) return `Statut de départ inconnu : ${from}.`;
  if (!allowed.includes(to)) {
    return `Transition invalide : impossible de passer de "${from}" à "${to}". Transitions autorisées depuis "${from}" : ${allowed.join(', ')}.`;
  }
  return null;
}
