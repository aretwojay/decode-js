/**
 * profil service
 * Reusable business logic for profile and contact details
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::profil.profil', ({ strapi }) => ({
  async getPublicProfile(params: Record<string, any> = {}) {
    const fetchParams: Record<string, any> = (this.getFetchParams ? this.getFetchParams(params) : params) as any;
    const documents = await strapi.documents('api::profil.profil').findMany({
      ...fetchParams,
      status: 'published',
    });
    return documents?.[0] || null;
  },
}));
