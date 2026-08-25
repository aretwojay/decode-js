/**
 * message lifecycle hooks
 */

export default {
  beforeCreate(event: { params: { data: Record<string, any> } }) {
    const { data } = event.params;
    if (data) {
      if (typeof data.email === 'string') {
        data.email = data.email.toLowerCase().trim();
      }
      if (typeof data.nom === 'string') {
        data.nom = data.nom.trim();
      }
      // Guarantee unread status on creation at the database level
      data.lu = false;
    }
  },
};
