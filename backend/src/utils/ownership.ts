/**
 * Helpers partagés pour l'isolation des données par utilisateur (multi-tenant).
 *
 * Modèle : chaque `profil` a un `owner` (l'utilisateur Strapi qui l'a créé).
 * `projet`, `competence`, `experience` et `formation` appartiennent à un `profil`
 * via leur relation `profil`. L'appartenance à un utilisateur se déduit donc en
 * deux sauts : entry -> profil -> owner.
 */

/**
 * Avec draftAndPublish, une entrée existe en 2 lignes (brouillon + publiée)
 * partageant le même documentId. Pour une vue "mes données", on ne veut
 * afficher qu'une seule ligne par document : la version brouillon (la plus
 * à jour) si elle existe, sinon la version publiée.
 */
export function dedupeByDocumentId<T extends { documentId: string; publishedAt: string | null }>(
  entries: T[]
): T[] {
  const byDocument = new Map<string, T>();
  for (const entry of entries) {
    const current = byDocument.get(entry.documentId);
    if (!current || (current.publishedAt !== null && entry.publishedAt === null)) {
      byDocument.set(entry.documentId, entry);
    }
  }
  return Array.from(byDocument.values());
}

export async function getOwnProfilId(strapi: any, userId: number): Promise<number | null> {
  const profil = await strapi.db
    .query('api::profil.profil')
    .findOne({ where: { owner: userId }, select: ['id'] });
  return profil?.id ?? null;
}

export async function isOwnProfil(strapi: any, profilId: string | number, userId: number): Promise<boolean> {
  const profil = await strapi.db
    .query('api::profil.profil')
    .findOne({ where: { documentId: profilId }, populate: ['owner'] });
  return Boolean(profil?.owner?.id === userId);
}

export async function isOwnChildEntry(
  strapi: any,
  uid: string,
  entryId: string | number,
  userId: number
): Promise<boolean> {
  // draftAndPublish : un documentId correspond à 2 lignes (brouillon +
  // publiée) ; on vérifie les deux plutôt qu'une seule prise au hasard.
  const rows = await strapi.db
    .query(uid)
    .findMany({ where: { documentId: entryId }, populate: { profil: { populate: ['owner'] } } });
  return rows.some((row: any) => row?.profil?.owner?.id === userId);
}
