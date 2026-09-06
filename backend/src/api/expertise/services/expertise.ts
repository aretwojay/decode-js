/**
 * expertise service
 * Reusable business logic for expertise cards
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::expertise.expertise', ({ strapi }) => ({
  async findOrdered(params: Record<string, any> = {}) {
    const fetchParams: Record<string, any> = (this.getFetchParams ? this.getFetchParams(params) : params) as any;
    return await strapi.documents('api::expertise.expertise').findMany({
      ...fetchParams,
      sort: fetchParams.sort || { ordre: 'asc' },
      status: 'published',
    });
  },
}));
