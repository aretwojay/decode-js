/**
 * competence controller
 * Extends core controller with domain validation on create and update.
 * Core sanitization and validation are automatically handled by super methods.
 */

import { factories } from '@strapi/strapi';
import { getOwnProfilId, isOwnChildEntry, dedupeByDocumentId } from '../../../utils/ownership';

const VALID_NIVEAUX = ['expert', 'avance', 'intermediaire', 'débutant'];
const VALID_STATUTS = ['brouillon', 'pret_a_relire', 'publie', 'archive'];

export default factories.createCoreController('api::competence.competence', ({ strapi }) => ({
  async find(ctx) {
    if (ctx.state.user) {
      const ownProfilId = await getOwnProfilId(strapi, ctx.state.user.id);
      const entries = await strapi.db
        .query('api::competence.competence')
        .findMany({ where: { profil: ownProfilId } });
      return { data: dedupeByDocumentId(entries), meta: {} };
    }
    return await super.find(ctx);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const entry = await strapi.db
      .query('api::competence.competence')
      .findOne({ where: { id }, populate: { profil: { populate: ['owner'] } } });
    if (!entry) return ctx.notFound();

    const isOwner = Boolean(ctx.state.user && entry.profil?.owner?.id === ctx.state.user.id);
    if (!entry.publishedAt && !isOwner) return ctx.forbidden();

    return await super.findOne(ctx);
  },

  async create(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Vous devez être connecté pour créer une compétence.');
    const ownProfilId = await getOwnProfilId(strapi, ctx.state.user.id);
    if (!ownProfilId) return ctx.badRequest('Créez d\'abord votre profil.');

    const rawData = (ctx.request.body?.data || ctx.request.body || {}) as Record<string, any>;
    const errors: Record<string, string> = {};

    const titre = typeof rawData.titre === 'string' ? rawData.titre.trim() : '';
    const niveau = typeof rawData.niveau === 'string' ? rawData.niveau.trim() : '';
    const statut = typeof rawData.statut === 'string' ? rawData.statut.trim() : 'brouillon';

    if (!titre || titre.length < 2 || titre.length > 100) {
      errors.titre = 'Le titre est requis (entre 2 et 100 caractères).';
    }

    if (!niveau || !VALID_NIVEAUX.includes(niveau)) {
      errors.niveau = `Le niveau est requis et doit être l'un des suivants : ${VALID_NIVEAUX.join(', ')}.`;
    }

    if (statut && !VALID_STATUTS.includes(statut)) {
      errors.statut = `Le statut doit être l'un des suivants : ${VALID_STATUTS.join(', ')}.`;
    }

    if (Object.keys(errors).length > 0) {
      return ctx.badRequest('Validation error', { errors });
    }

    ctx.request.body = {
      data: {
        ...rawData,
        titre,
        niveau,
        statut: statut || 'brouillon',
        profil: ownProfilId,
      },
    };

    return await super.create(ctx);
  },

  async update(ctx) {
    const { id } = ctx.params;
    if (!ctx.state.user || !(await isOwnChildEntry(strapi, 'api::competence.competence', id, ctx.state.user.id))) {
      return ctx.forbidden();
    }

    const rawData = (ctx.request.body?.data || ctx.request.body || {}) as Record<string, any>;
    const errors: Record<string, string> = {};

    if (rawData.titre !== undefined) {
      const titre = typeof rawData.titre === 'string' ? rawData.titre.trim() : '';
      if (!titre || titre.length < 2 || titre.length > 100) {
        errors.titre = 'Le titre doit comporter entre 2 et 100 caractères.';
      }
    }

    if (rawData.niveau !== undefined) {
      const niveau = typeof rawData.niveau === 'string' ? rawData.niveau.trim() : '';
      if (!VALID_NIVEAUX.includes(niveau)) {
        errors.niveau = `Le niveau doit être l'un des suivants : ${VALID_NIVEAUX.join(', ')}.`;
      }
    }

    if (rawData.statut !== undefined) {
      const statut = typeof rawData.statut === 'string' ? rawData.statut.trim() : '';
      if (!VALID_STATUTS.includes(statut)) {
        errors.statut = `Le statut doit être l'un des suivants : ${VALID_STATUTS.join(', ')}.`;
      }
    }

    if (Object.keys(errors).length > 0) {
      return ctx.badRequest('Validation error', { errors });
    }

    return await super.update(ctx);
  },

  async delete(ctx) {
    const { id } = ctx.params;
    if (!ctx.state.user || !(await isOwnChildEntry(strapi, 'api::competence.competence', id, ctx.state.user.id))) {
      return ctx.forbidden();
    }
    return await super.delete(ctx);
  },
}));
