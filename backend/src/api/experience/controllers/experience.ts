/**
 * experience controller
 * Extends core controller with domain validation on create and update.
 * Core sanitization and validation are automatically handled by super methods.
 */

import { factories } from '@strapi/strapi';
import { getOwnProfilId, isOwnChildEntry, dedupeByDocumentId } from '../../../utils/ownership';

const VALID_STATUTS = ['brouillon', 'pret_a_relire', 'publie', 'archive'];
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default factories.createCoreController('api::experience.experience', ({ strapi }) => ({
  async find(ctx) {
    if (ctx.state.user) {
      const ownProfilId = await getOwnProfilId(strapi, ctx.state.user.id);
      const entries = await strapi.db
        .query('api::experience.experience')
        .findMany({ where: { profil: ownProfilId } });
      return { data: dedupeByDocumentId(entries), meta: {} };
    }
    return await super.find(ctx);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const entry = await strapi.db
      .query('api::experience.experience')
      .findOne({ where: { id }, populate: { profil: { populate: ['owner'] } } });
    if (!entry) return ctx.notFound();

    const isOwner = Boolean(ctx.state.user && entry.profil?.owner?.id === ctx.state.user.id);
    if (!entry.publishedAt && !isOwner) return ctx.forbidden();

    return await super.findOne(ctx);
  },

  async create(ctx) {
    if (!ctx.state.user) return ctx.unauthorized('Vous devez être connecté pour créer une expérience.');
    const ownProfilId = await getOwnProfilId(strapi, ctx.state.user.id);
    if (!ownProfilId) return ctx.badRequest('Créez d\'abord votre profil.');

    const rawData = (ctx.request.body?.data || ctx.request.body || {}) as Record<string, any>;
    const errors: Record<string, string> = {};

    const titre = typeof rawData.titre === 'string' ? rawData.titre.trim() : '';
    const entreprise = typeof rawData.entreprise === 'string' ? rawData.entreprise.trim() : '';
    const dateDebut = typeof rawData.date_debut === 'string' ? rawData.date_debut.trim() : '';
    const dateFin = typeof rawData.date_fin === 'string' ? rawData.date_fin.trim() : '';
    const statut = typeof rawData.statut === 'string' ? rawData.statut.trim() : 'brouillon';

    if (!titre || titre.length < 2 || titre.length > 150) {
      errors.titre = 'Le titre du poste est requis (entre 2 et 150 caractères).';
    }

    if (!entreprise || entreprise.length < 2 || entreprise.length > 150) {
      errors.entreprise = "Le nom de l'entreprise est requis (entre 2 et 150 caractères).";
    }

    if (!rawData.description || (Array.isArray(rawData.description) && rawData.description.length === 0)) {
      errors.description = 'La description de votre expérience est requise.';
    }

    if (!dateDebut || !ISO_DATE_REGEX.test(dateDebut)) {
      errors.date_debut = 'La date de début est requise au format AAAA-MM-JJ.';
    }

    if (dateFin) {
      if (!ISO_DATE_REGEX.test(dateFin)) {
        errors.date_fin = 'La date de fin doit être au format AAAA-MM-JJ.';
      } else if (dateDebut && ISO_DATE_REGEX.test(dateDebut) && dateFin < dateDebut) {
        errors.date_fin = 'La date de fin ne peut pas être antérieure à la date de début.';
      }
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
        entreprise,
        date_debut: dateDebut,
        date_fin: dateFin || null,
        statut: statut || 'brouillon',
        profil: ownProfilId,
      },
    };

    return await super.create(ctx);
  },

  async update(ctx) {
    const { id } = ctx.params;
    if (!ctx.state.user || !(await isOwnChildEntry(strapi, 'api::experience.experience', id, ctx.state.user.id))) {
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

    if (rawData.entreprise !== undefined) {
      const entreprise = typeof rawData.entreprise === 'string' ? rawData.entreprise.trim() : '';
      if (!entreprise || entreprise.length < 2 || entreprise.length > 150) {
        errors.entreprise = "L'entreprise doit comporter entre 2 et 150 caractères.";
      }
    }

    if (rawData.date_debut !== undefined) {
      const dateDebut = typeof rawData.date_debut === 'string' ? rawData.date_debut.trim() : '';
      if (!dateDebut || !ISO_DATE_REGEX.test(dateDebut)) {
        errors.date_debut = 'La date de début doit être au format AAAA-MM-JJ.';
      }
    }

    if (rawData.date_fin !== undefined && rawData.date_fin !== null) {
      const dateFin = typeof rawData.date_fin === 'string' ? rawData.date_fin.trim() : '';
      if (dateFin && !ISO_DATE_REGEX.test(dateFin)) {
        errors.date_fin = 'La date de fin doit être au format AAAA-MM-JJ.';
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
    if (!ctx.state.user || !(await isOwnChildEntry(strapi, 'api::experience.experience', id, ctx.state.user.id))) {
      return ctx.forbidden();
    }
    return await super.delete(ctx);
  },
}));
