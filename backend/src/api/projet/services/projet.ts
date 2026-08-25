/**
 * projet service
 * Reusable business logic for projects
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::projet.projet', ({ strapi }) => ({
  async findBySlug(slug: string, params: Record<string, any> = {}) {
    const fetchParams: Record<string, any> = (this.getFetchParams ? this.getFetchParams(params) : params) as any;
    const documents = await strapi.documents('api::projet.projet').findMany({
      ...fetchParams,
      filters: {
        ...(fetchParams.filters || {}),
        slug,
      },
      status: 'published',
    });
    return documents?.[0] || null;
  },

  async findFeatured(params: Record<string, any> = {}) {
    const fetchParams: Record<string, any> = (this.getFetchParams ? this.getFetchParams(params) : params) as any;
    return await strapi.documents('api::projet.projet').findMany({
      ...fetchParams,
      filters: {
        ...(fetchParams.filters || {}),
        en_vedette: true,
      },
      status: 'published',
    });
  },
}));
