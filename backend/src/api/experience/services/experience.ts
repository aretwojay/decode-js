/**
 * experience service
 * Reusable business logic for professional experiences
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::experience.experience', ({ strapi }) => ({
  async findOrdered(params: Record<string, any> = {}) {
    const fetchParams: Record<string, any> = (this.getFetchParams ? this.getFetchParams(params) : params) as any;
    return await strapi.documents('api::experience.experience').findMany({
      ...fetchParams,
      sort: fetchParams.sort || [{ date_debut: 'desc' }],
      status: 'published',
    });
  },
}));
