/**
 * projet lifecycle hooks
 */

export default {
  beforeCreate(event: { params: { data: Record<string, any> } }) {
    const { data } = event.params;
    if (data) {
      if (!data.slug && typeof data.titre === 'string') {
        data.slug = data.titre
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }
    }
  },
};
