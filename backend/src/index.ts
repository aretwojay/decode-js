import type { Core } from '@strapi/strapi';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
      });

      if (!publicRole) {
        return;
      }

      const publicActions = [
        'api::competence.competence.find',
        'api::competence.competence.findOne',
        'api::experience.experience.find',
        'api::experience.experience.findOne',
        'api::projet.projet.find',
        'api::projet.projet.findOne',
        'api::formation.formation.find',
        'api::formation.formation.findOne',
        'api::profil.profil.find',
        'api::profil.profil.findOne',
        'api::message.message.create',
      ];

      for (const action of publicActions) {
        const existingPermission = await strapi.db
          .query('plugin::users-permissions.permission')
          .findOne({
            where: {
              action,
              role: publicRole.id,
            },
          });

        if (!existingPermission) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: {
              action,
              role: publicRole.id,
            },
          });
        }
      }

      // Utilisateurs connectés : CRUD complet, restreint à leurs propres données
      // par les controllers (voir src/utils/ownership.ts).
      const authenticatedRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' },
      });

      if (authenticatedRole) {
        const contentTypes = ['profil', 'projet', 'competence', 'experience', 'formation'];
        const crud = ['find', 'findOne', 'create', 'update', 'delete'];
        const authenticatedActions = contentTypes.flatMap((ct) =>
          crud.map((action) => `api::${ct}.${ct}.${action}`)
        );

        for (const action of authenticatedActions) {
          const existingPermission = await strapi.db
            .query('plugin::users-permissions.permission')
            .findOne({
              where: {
                action,
                role: authenticatedRole.id,
              },
            });

          if (!existingPermission) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: authenticatedRole.id,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du bootstrap des permissions :', error);
    }
  },
};

