/**
 * competence service
 * Reusable business logic for skills
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::competence.competence', ({ strapi }) => ({
  async findByNiveau(niveau: 'expert' | 'avance' | 'intermediaire' | 'débutant', params: Record<string, any> = {}) {
    const fetchParams: Record<string, any> = (this.getFetchParams ? this.getFetchParams(params) : params) as any;
    return await strapi.documents('api::competence.competence').findMany({
      ...fetchParams,
      filters: {
        ...(fetchParams.filters || {}),
        niveau,
      },
      status: 'published',
    });
  },
}));
