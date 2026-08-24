/**
 * formation service
 * Reusable business logic for education and degrees
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::formation.formation', ({ strapi }) => ({
  async findOrdered(params: Record<string, any> = {}) {
    const fetchParams: Record<string, any> = (this.getFetchParams ? this.getFetchParams(params) : params) as any;
    return await strapi.documents('api::formation.formation').findMany({
      ...fetchParams,
      sort: fetchParams.sort || [{ date_debut: 'desc' }],
      status: 'published',
    });
  },
}));
