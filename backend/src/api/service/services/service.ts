/**
 * service service
 * Reusable business logic for the "Ce que je fais" service cards
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::service.service', ({ strapi }) => ({
  async findOrdered(params: Record<string, any> = {}) {
    const fetchParams: Record<string, any> = (this.getFetchParams ? this.getFetchParams(params) : params) as any;
    return await strapi.documents('api::service.service').findMany({
      ...fetchParams,
      sort: fetchParams.sort || [{ ordre: 'asc' }],
      status: 'published',
    });
  },
}));
