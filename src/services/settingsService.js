import api from './api';

// Pucho W-Settings-Persistence webhook — writes settings to Google Sheets
const PUCHO_SETTINGS_WEBHOOK = 'https://studio.pucho.ai/api/v1/webhooks/Lpp7cWtvLbW8UXrA9Igtt';

export const settingsService = {
  /**
   * Fetch all settings for a specific company
   * @param {string} companyId 
   * @returns {Promise<Object>} An object with categories as keys, and key-value pairs as values.
   */
  getAllSettings: async (companyId) => {
    try {
      // api.get() already unwraps the { success, data } envelope and returns data.data,
      // so `response` here IS the settings object (e.g. { Currency: {...}, Date: {...} })
      const response = await api.get(`/settings/${companyId}`);
      return response || {};
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
      // Pucho webhook → Google Sheets persistence (non-blocking)
      fetch(PUCHO_SETTINGS_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, category, settings }),
      }).catch((e) => console.warn('Settings webhook failed (non-blocking):', e));

      // Local backend persistence
      await api.post(`/settings/${companyId}`, {
        category,
        settings,
        updatedBy: 'system' // In a real app, this would be the logged-in user
      });
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  }
};
