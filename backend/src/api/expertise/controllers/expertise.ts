/**
 * expertise controller
 * Extends core controller with domain validation on create and update.
 * Core sanitization and validation are automatically handled by super methods.
 */

import { factories } from '@strapi/strapi';
import { getOwnProfilId, isOwnChildEntry, dedupeByDocumentId } from '../../../utils/ownership';
import { checkStatusTransition } from '../../../utils/workflow';

const VALID_STATUTS = ['brouillon', 'pret_a_relire', 'publie', 'archive'];

export default factories.createCoreController('api::expertise.expertise', ({ strapi }) => ({
  async find(ctx) {
    if (ctx.state.user) {
      const ownProfilId = await getOwnProfilId(strapi, ctx.state.user.id);
      const entries = await strapi.db
        .query('api::expertise.expertise')
        .findMany({ where: { profil: ownProfilId } });
      return { data: dedupeByDocumentId(entries), meta: {} };
    }
    return await super.find(ctx);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const rows = await strapi.db
      .query('api::expertise.expertise')
      .findMany({ where: { documentId: id }, populate: { profil: { populate: ['owner'] } } });
    if (rows.length === 0) return ctx.notFound();

    const publishedRow = rows.find((r) => r.publishedAt);
    const draftRow = rows.find((r) => !r.publishedAt);
    const isOwner = Boolean(
      ctx.state.user &&
        [publishedRow, draftRow].some((r) => r?.profil?.owner?.id === ctx.state.user.id)
    );
    if (!publishedRow && !isOwner) return ctx.forbidden();

    return await super.findOne(ctx);
  },

  async create(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Vous devez être connecté pour créer une expertise.');
    const ownProfilId = await getOwnProfilId(strapi, ctx.state.user.id);
    if (!ownProfilId) return ctx.badRequest('Créez d\'abord votre profil.');

    const rawData = (ctx.request.body?.data || ctx.request.body || {}) as Record<string, any>;
    const errors: Record<string, string> = {};

    const titre = typeof rawData.titre === 'string' ? rawData.titre.trim() : '';
    const description = typeof rawData.description === 'string' ? rawData.description.trim() : '';
    const statut = typeof rawData.statut === 'string' ? rawData.statut.trim() : 'brouillon';

    if (!titre || titre.length < 2 || titre.length > 100) {
      errors.titre = 'Le titre est requis (entre 2 et 100 caractères).';
    }

    if (!description || description.length < 2 || description.length > 500) {
      errors.description = 'La description est requise (entre 2 et 500 caractères).';
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
        description,
        statut: statut || 'brouillon',
        profil: ownProfilId,
      },
    };

    return await super.create(ctx);
  },

  async update(ctx) {
    const { id } = ctx.params;
    if (!ctx.state.user || !(await isOwnChildEntry(strapi, 'api::expertise.expertise', id, ctx.state.user.id))) {
      return ctx.forbidden();
    }

    const rawData = (ctx.request.body?.data || ctx.request.body || {}) as Record<string, any>;

    if (rawData.statut !== undefined) {
      const current = await strapi.db.query('api::expertise.expertise').findOne({ where: { documentId: id }, select: ['statut'] });
      if (current && rawData.statut !== current.statut) {
        const transitionError = checkStatusTransition(current.statut, rawData.statut);
        if (transitionError) {
          return ctx.badRequest(transitionError);
        }
      }
    }
    const errors: Record<string, string> = {};

    if (rawData.titre !== undefined) {
      const titre = typeof rawData.titre === 'string' ? rawData.titre.trim() : '';
      if (!titre || titre.length < 2 || titre.length > 100) {
        errors.titre = 'Le titre doit comporter entre 2 et 100 caractères.';
      }
    }

    if (rawData.description !== undefined) {
      const description = typeof rawData.description === 'string' ? rawData.description.trim() : '';
      if (!description || description.length < 2 || description.length > 500) {
        errors.description = 'La description doit comporter entre 2 et 500 caractères.';
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
    if (!ctx.state.user || !(await isOwnChildEntry(strapi, 'api::expertise.expertise', id, ctx.state.user.id))) {
      return ctx.forbidden();
    }
    return await super.delete(ctx);
  },
}));
