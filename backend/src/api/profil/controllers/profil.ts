/**
 * profil controller
 * Extends core controller with domain validation on create and update.
 * Core sanitization and validation are automatically handled by super methods.
 */

import { factories } from '@strapi/strapi';

const VALID_STATUTS = ['brouillon', 'pret_a_relire', 'publie', 'archive'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^(https?:\/\/|www\.)[^\s/$.?#].[^\s]*$/i;

export default factories.createCoreController('api::profil.profil', ({ strapi }) => ({
  async create(ctx) {
    const rawData = (ctx.request.body?.data || ctx.request.body || {}) as Record<string, any>;
    const errors: Record<string, string> = {};

    const nom = typeof rawData.nom === 'string' ? rawData.nom.trim() : '';
    const titre = typeof rawData.titre === 'string' ? rawData.titre.trim() : '';
    const email = typeof rawData.email === 'string' ? rawData.email.trim() : '';
    const biographie = typeof rawData.biographie === 'string' ? rawData.biographie.trim() : '';
    const telephone = typeof rawData.telephone === 'string' ? rawData.telephone.trim() : '';
    const localisation = typeof rawData.localisation === 'string' ? rawData.localisation.trim() : '';
    const github = typeof rawData.github === 'string' ? rawData.github.trim() : '';
    const linkedin = typeof rawData.linkedin === 'string' ? rawData.linkedin.trim() : '';
    const twitter = typeof rawData.twitter === 'string' ? rawData.twitter.trim() : '';
    const statut = typeof rawData.statut === 'string' ? rawData.statut.trim() : 'brouillon';

    if (!nom || nom.length < 2 || nom.length > 100) {
      errors.nom = 'Le nom complet est requis (entre 2 et 100 caractères).';
    }

    if (!titre || titre.length < 2 || titre.length > 150) {
      errors.titre = 'Le titre professionnel est requis (entre 2 et 150 caractères).';
    }

    if (!email || !EMAIL_REGEX.test(email) || email.length > 255) {
      errors.email = 'Une adresse email valide est requise.';
    }

    if (biographie && biographie.length > 3000) {
      errors.biographie = 'La biographie ne doit pas dépasser 3000 caractères.';
    }

    if (telephone && telephone.length > 30) {
      errors.telephone = 'Le numéro de téléphone ne doit pas dépasser 30 caractères.';
    }

    if (localisation && localisation.length > 100) {
      errors.localisation = 'La localisation ne doit pas dépasser 100 caractères.';
    }

    if (github) {
      if (github.length > 200) {
        errors.github = 'Le lien GitHub ne doit pas dépasser 200 caractères.';
      } else if (!URL_REGEX.test(github)) {
        errors.github = 'Le lien GitHub doit être une URL valide (ex: https://github.com/...).';
      }
    }

    if (linkedin) {
      if (linkedin.length > 200) {
        errors.linkedin = 'Le lien LinkedIn ne doit pas dépasser 200 caractères.';
      } else if (!URL_REGEX.test(linkedin)) {
        errors.linkedin = 'Le lien LinkedIn doit être une URL valide.';
      }
    }

    if (twitter) {
      if (twitter.length > 200) {
        errors.twitter = 'Le lien Twitter / X ne doit pas dépasser 200 caractères.';
      } else if (!URL_REGEX.test(twitter)) {
        errors.twitter = 'Le lien Twitter / X doit être une URL valide.';
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
        nom,
        titre,
        email,
        biographie: biographie || null,
        telephone: telephone || null,
        localisation: localisation || null,
        github: github || null,
        linkedin: linkedin || null,
        twitter: twitter || null,
        disponible: rawData.disponible !== undefined ? Boolean(rawData.disponible) : true,
        statut: statut || 'brouillon',
      },
    };

    return await super.create(ctx);
  },

  async update(ctx) {
    const rawData = (ctx.request.body?.data || ctx.request.body || {}) as Record<string, any>;
    const errors: Record<string, string> = {};

    if (rawData.nom !== undefined) {
      const nom = typeof rawData.nom === 'string' ? rawData.nom.trim() : '';
      if (!nom || nom.length < 2 || nom.length > 100) {
        errors.nom = 'Le nom complet doit comporter entre 2 et 100 caractères.';
      }
    }

    if (rawData.titre !== undefined) {
      const titre = typeof rawData.titre === 'string' ? rawData.titre.trim() : '';
      if (!titre || titre.length < 2 || titre.length > 150) {
        errors.titre = 'Le titre professionnel doit comporter entre 2 et 150 caractères.';
      }
    }

    if (rawData.email !== undefined) {
      const email = typeof rawData.email === 'string' ? rawData.email.trim() : '';
      if (!email || !EMAIL_REGEX.test(email) || email.length > 255) {
        errors.email = 'Une adresse email valide est requise.';
      }
    }

    if (rawData.biographie !== undefined && rawData.biographie !== null) {
      const biographie = typeof rawData.biographie === 'string' ? rawData.biographie.trim() : '';
      if (biographie.length > 3000) {
        errors.biographie = 'La biographie ne doit pas dépasser 3000 caractères.';
      }
    }

    if (rawData.telephone !== undefined && rawData.telephone !== null) {
      const telephone = typeof rawData.telephone === 'string' ? rawData.telephone.trim() : '';
      if (telephone.length > 30) {
        errors.telephone = 'Le numéro de téléphone ne doit pas dépasser 30 caractères.';
      }
    }

    if (rawData.localisation !== undefined && rawData.localisation !== null) {
      const localisation = typeof rawData.localisation === 'string' ? rawData.localisation.trim() : '';
      if (localisation.length > 100) {
        errors.localisation = 'La localisation ne doit pas dépasser 100 caractères.';
      }
    }

    for (const field of ['github', 'linkedin', 'twitter'] as const) {
      if (rawData[field] !== undefined && rawData[field] !== null) {
        const value = typeof rawData[field] === 'string' ? rawData[field].trim() : '';
        if (value) {
          if (value.length > 200) {
            errors[field] = `Le lien ${field} ne doit pas dépasser 200 caractères.`;
          } else if (!URL_REGEX.test(value)) {
            errors[field] = `Le lien ${field} doit être une URL valide.`;
          }
        }
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
