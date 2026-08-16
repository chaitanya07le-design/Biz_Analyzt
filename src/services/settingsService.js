import api from './api';

export const settingsService = {
  /**
   * Fetch all settings for a specific company
   * @param {string} companyId 
   * @returns {Promise<Object>} An object with categories as keys, and key-value pairs as values.
   */
  getAllSettings: async (companyId) => {
    try {
      const response = await api.get(`/settings/${companyId}`);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return {};
    } catch (error) {
      console.error('Error fetching settings:', error);
      return {};
    }
  },

  /**
   * Update one or more settings for a specific company and category
   * @param {string} companyId 
   * @param {string} category 
   * @param {Object} settings Object containing key-value pairs to update
   * @returns {Promise<boolean>}
   */
  updateSettings: async (companyId, category, settings) => {
    try {
      const response = await api.post(`/settings/${companyId}`, {
        category,
        settings,
        updatedBy: 'system' // In a real app, this would be the logged-in user
      });
      return response.data?.success || false;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  }
};
