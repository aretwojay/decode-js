/**
 * message service
 * Reusable business logic for contact messages
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::message.message', ({ strapi }) => ({
  async markAsRead(documentId: string) {
    return await strapi.documents('api::message.message').update({
      documentId,
      data: {
        lu: true,
      },
    });
  },

  async countUnread() {
    return await strapi.documents('api::message.message').count({
      filters: {
        lu: false,
      },
    });
  },
}));
