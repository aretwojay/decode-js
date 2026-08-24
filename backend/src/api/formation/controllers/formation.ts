/**
 * formation controller
 * Extends core controller with domain validation on create and update.
 * Core sanitization and validation are automatically handled by super methods.
 */

import { factories } from '@strapi/strapi';

const VALID_STATUTS = ['brouillon', 'pret_a_relire', 'publie', 'archive'];
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default factories.createCoreController('api::formation.formation', ({ strapi }) => ({
  async create(ctx) {
    const rawData = (ctx.request.body?.data || ctx.request.body || {}) as Record<string, any>;
    const errors: Record<string, string> = {};

    const etablissement = typeof rawData.etablissement === 'string' ? rawData.etablissement.trim() : '';
    const diplome = typeof rawData.diplome === 'string' ? rawData.diplome.trim() : '';
    const description = typeof rawData.description === 'string' ? rawData.description.trim() : '';
    const dateDebut = typeof rawData.date_debut === 'string' ? rawData.date_debut.trim() : '';
    const dateFin = typeof rawData.date_fin === 'string' ? rawData.date_fin.trim() : '';
    const statut = typeof rawData.statut === 'string' ? rawData.statut.trim() : 'brouillon';

    if (!etablissement || etablissement.length < 2 || etablissement.length > 150) {
      errors.etablissement = "Le nom de l'établissement est requis (entre 2 et 150 caractères).";
    }

    if (!diplome || diplome.length < 2 || diplome.length > 150) {
      errors.diplome = 'Le diplôme ou intitulé de la formation est requis (entre 2 et 150 caractères).';
    }

    if (description && description.length > 2000) {
      errors.description = 'La description ne doit pas dépasser 2000 caractères.';
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
        etablissement,
        diplome,
        description: description || null,
        date_debut: dateDebut,
        date_fin: dateFin || null,
        en_cours: Boolean(rawData.en_cours),
        statut: statut || 'brouillon',
      },
    };

    return await super.create(ctx);
  },

  async update(ctx) {
    const rawData = (ctx.request.body?.data || ctx.request.body || {}) as Record<string, any>;
    const errors: Record<string, string> = {};

    if (rawData.etablissement !== undefined) {
      const etablissement = typeof rawData.etablissement === 'string' ? rawData.etablissement.trim() : '';
      if (!etablissement || etablissement.length < 2 || etablissement.length > 150) {
        errors.etablissement = "L'établissement doit comporter entre 2 et 150 caractères.";
      }
    }

    if (rawData.diplome !== undefined) {
      const diplome = typeof rawData.diplome === 'string' ? rawData.diplome.trim() : '';
      if (!diplome || diplome.length < 2 || diplome.length > 150) {
        errors.diplome = 'Le diplôme doit comporter entre 2 et 150 caractères.';
      }
    }

    if (rawData.description !== undefined && rawData.description !== null) {
      const description = typeof rawData.description === 'string' ? rawData.description.trim() : '';
      if (description.length > 2000) {
        errors.description = 'La description ne doit pas dépasser 2000 caractères.';
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
}));
