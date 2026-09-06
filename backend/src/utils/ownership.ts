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

export async function getOwnProfil(
  strapi: any,
  userId: number
): Promise<{ id: number; documentId: string } | null> {
  const profil = await strapi.db
    .query('api::profil.profil')
    .findOne({ where: { owner: userId }, select: ['id', 'documentId'] });
  return profil ? { id: profil.id, documentId: profil.documentId } : null;
}

export async function isOwnProfil(strapi: any, profilId: string | number, userId: number): Promise<boolean> {
  const isNumeric =
    typeof profilId === 'number' ||
    (!isNaN(Number(profilId)) && !isNaN(parseFloat(String(profilId))));
  const where = isNumeric
    ? { $or: [{ id: Number(profilId) }, { documentId: String(profilId) }] }
    : { documentId: String(profilId) };
  const profil = await strapi.db
    .query('api::profil.profil')
    .findOne({ where, populate: ['owner'] });
  return Boolean(profil?.owner?.id === userId || profil?.owner === userId);
}

export async function isOwnChildEntry(
  strapi: any,
  uid: string,
  entryId: string | number,
  userId: number
): Promise<boolean> {
  const ownProfil = await getOwnProfil(strapi, userId);
  if (!ownProfil) return false;

  const isNumeric =
    typeof entryId === 'number' ||
    (!isNaN(Number(entryId)) && !isNaN(parseFloat(String(entryId))));
  const where = isNumeric
    ? { $or: [{ id: Number(entryId) }, { documentId: String(entryId) }] }
    : { documentId: String(entryId) };

  // draftAndPublish : un documentId correspond à 2 lignes (brouillon + publiée)
  const rows = await strapi.db
    .query(uid)
    .findMany({ where, populate: ['profil'] });

  if (rows.length === 0) return false;

  for (const row of rows) {
    const p = (row as any)?.profil;
    if (!p) continue;

    // Check by ID or documentId
    if (typeof p === 'number' && p === ownProfil.id) return true;
    if (typeof p === 'string' && p === ownProfil.documentId) return true;
    if (typeof p === 'object') {
      if (p.id === ownProfil.id) return true;
      if (p.documentId && p.documentId === ownProfil.documentId) return true;
      if (p.owner && (p.owner.id === userId || p.owner === userId)) return true;
    }
  }

  return false;
}
