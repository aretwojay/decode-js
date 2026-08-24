/**
 * message controller
 * Extends core controller with domain validation and security rules on create.
 * Core sanitization and validation are automatically handled by super methods.
 */

import { factories } from '@strapi/strapi';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default factories.createCoreController('api::message.message', ({ strapi }) => ({
  async create(ctx) {
    const rawData = (ctx.request.body?.data || ctx.request.body || {}) as Record<string, any>;
    const errors: Record<string, string> = {};

    const nom = typeof rawData.nom === 'string' ? rawData.nom.trim() : '';
    const email = typeof rawData.email === 'string' ? rawData.email.trim() : '';
    const sujet = typeof rawData.sujet === 'string' ? rawData.sujet.trim() : '';
    const contenu = typeof rawData.contenu === 'string' ? rawData.contenu.trim() : '';

    if (!nom || nom.length < 2 || nom.length > 100) {
      errors.nom = 'Le nom est requis (entre 2 et 100 caractères).';
    }

    if (!email || !EMAIL_REGEX.test(email) || email.length > 255) {
      errors.email = 'Une adresse email valide est requise.';
    }

    if (!contenu || contenu.length < 5 || contenu.length > 5000) {
      errors.contenu = 'Le message est requis (entre 5 et 5000 caractères).';
    }

    if (sujet.length > 200) {
      errors.sujet = 'Le sujet ne doit pas dépasser 200 caractères.';
    }

    if (Object.keys(errors).length > 0) {
      return ctx.badRequest('Validation error', { errors });
    }

    // Force sanitization and secure defaults (lu: false)
    ctx.request.body = {
      data: {
        ...rawData,
        nom,
        email,
        sujet: sujet || 'Sans sujet',
        contenu,
        lu: false,
      },
    };

    return await super.create(ctx);
  },
}));
