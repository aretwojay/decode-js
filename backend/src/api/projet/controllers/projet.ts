/**
 * projet controller
 * Extends core controller with domain validation on create and update.
 * Core sanitization and validation are automatically handled by super methods.
 */

import { factories } from '@strapi/strapi';
import { getOwnProfilId, isOwnChildEntry, dedupeByDocumentId } from '../../../utils/ownership';

const VALID_STATUTS = ['brouillon', 'pret_a_relire', 'publie', 'archive'];
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const URL_REGEX = /^(https?:\/\/|www\.)[^\s/$.?#].[^\s]*$/i;

export default factories.createCoreController('api::projet.projet', ({ strapi }) => ({
  // Un utilisateur connecté ne voit que les projets de son propre profil (tous statuts).
  async find(ctx) {
    if (ctx.state.user) {
      const ownProfilId = await getOwnProfilId(strapi, ctx.state.user.id);
      const entries = await strapi.db
        .query('api::projet.projet')
        .findMany({ where: { profil: ownProfilId } });
      return { data: dedupeByDocumentId(entries), meta: {} };
    }
    return await super.find(ctx);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const entry = await strapi.db
      .query('api::projet.projet')
      .findOne({ where: { id }, populate: { profil: { populate: ['owner'] } } });
    if (!entry) return ctx.notFound();

    const isOwner = Boolean(ctx.state.user && entry.profil?.owner?.id === ctx.state.user.id);
    if (!entry.publishedAt && !isOwner) return ctx.forbidden();

    return await super.findOne(ctx);
  },

  async create(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Vous devez être connecté pour créer un projet.');
    const ownProfilId = await getOwnProfilId(strapi, ctx.state.user.id);
    if (!ownProfilId) return ctx.badRequest('Créez d\'abord votre profil.');

    const rawData = (ctx.request.body?.data || ctx.request.body || {}) as Record<string, any>;
    const errors: Record<string, string> = {};

    const titre = typeof rawData.titre === 'string' ? rawData.titre.trim() : '';
    const resume = typeof rawData.resume === 'string' ? rawData.resume.trim() : '';
    const lienRepo = typeof rawData.lien_repo === 'string' ? rawData.lien_repo.trim() : '';
    const lienDemo = typeof rawData.lien_demo === 'string' ? rawData.lien_demo.trim() : '';
    const dateRealisation = typeof rawData.date_realisation === 'string' ? rawData.date_realisation.trim() : '';
    const statut = typeof rawData.statut === 'string' ? rawData.statut.trim() : 'brouillon';

    if (!titre || titre.length < 2 || titre.length > 150) {
      errors.titre = 'Le titre du projet est requis (entre 2 et 150 caractères).';
    }

    if (resume && resume.length > 500) {
      errors.resume = 'Le résumé ne doit pas dépasser 500 caractères.';
    }

    if (!rawData.description || (Array.isArray(rawData.description) && rawData.description.length === 0)) {
      errors.description = 'La description détaillée du projet est requise.';
    }

    if (lienRepo && !URL_REGEX.test(lienRepo)) {
      errors.lien_repo = 'Le lien du dépôt doit être une URL valide (ex: https://github.com/...).';
    }

    if (lienDemo && !URL_REGEX.test(lienDemo)) {
      errors.lien_demo = 'Le lien de démo doit être une URL valide.';
    }

    if (dateRealisation && !ISO_DATE_REGEX.test(dateRealisation)) {
      errors.date_realisation = 'La date de réalisation doit être au format AAAA-MM-JJ.';
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
        resume: resume || null,
        lien_repo: lienRepo || null,
        lien_demo: lienDemo || null,
        date_realisation: dateRealisation || null,
        en_vedette: Boolean(rawData.en_vedette),
        statut: statut || 'brouillon',
        profil: ownProfilId,
      },
    };

    return await super.create(ctx);
  },

  async update(ctx) {
    const { id } = ctx.params;
    if (!ctx.state.user || !(await isOwnChildEntry(strapi, 'api::projet.projet', id, ctx.state.user.id))) {
      return ctx.forbidden();
    }

    const rawData = (ctx.request.body?.data || ctx.request.body || {}) as Record<string, any>;
    const errors: Record<string, string> = {};

    if (rawData.titre !== undefined) {
      const titre = typeof rawData.titre === 'string' ? rawData.titre.trim() : '';
      if (!titre || titre.length < 2 || titre.length > 150) {
        errors.titre = 'Le titre doit comporter entre 2 et 150 caractères.';
      }
    }

    if (rawData.resume !== undefined && rawData.resume !== null) {
      const resume = typeof rawData.resume === 'string' ? rawData.resume.trim() : '';
      if (resume.length > 500) {
        errors.resume = 'Le résumé ne doit pas dépasser 500 caractères.';
      }
    }

    if (rawData.lien_repo !== undefined && rawData.lien_repo !== null) {
      const lienRepo = typeof rawData.lien_repo === 'string' ? rawData.lien_repo.trim() : '';
      if (lienRepo && !URL_REGEX.test(lienRepo)) {
        errors.lien_repo = 'Le lien du dépôt doit être une URL valide.';
      }
    }

    if (rawData.lien_demo !== undefined && rawData.lien_demo !== null) {
      const lienDemo = typeof rawData.lien_demo === 'string' ? rawData.lien_demo.trim() : '';
      if (lienDemo && !URL_REGEX.test(lienDemo)) {
        errors.lien_demo = 'Le lien de démo doit être une URL valide.';
      }
    }

    if (rawData.date_realisation !== undefined && rawData.date_realisation !== null) {
      const dateRealisation = typeof rawData.date_realisation === 'string' ? rawData.date_realisation.trim() : '';
      if (dateRealisation && !ISO_DATE_REGEX.test(dateRealisation)) {
        errors.date_realisation = 'La date de réalisation doit être au format AAAA-MM-JJ.';
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
    if (!ctx.state.user || !(await isOwnChildEntry(strapi, 'api::projet.projet', id, ctx.state.user.id))) {
      return ctx.forbidden();
    }
    return await super.delete(ctx);
  },
}));
