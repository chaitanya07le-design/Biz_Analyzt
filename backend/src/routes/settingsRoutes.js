const express = require('express');
const router = express.Router();
const { fetchSheetData, initializeSheetsClient, clearCache } = require('../services/googleSheetsService');

// Format: CompanyId | Category | SettingKey | SettingValue | UpdatedAt | UpdatedBy
const SETTINGS_SHEET_NAME = 'Settings';

router.get('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    
    // Check if the sheet exists, if not it will throw an error or return empty
    let settingsData = [];
    try {
      settingsData = await fetchSheetData(SETTINGS_SHEET_NAME);
    } catch (e) {
      console.warn(`Settings sheet not found or empty: ${e.message}`);
    }

    // Filter by companyId
    const companySettings = settingsData.filter(
      row => (row.CompanyId || row.CompanyID) === companyId
    );

    // Group by category and key, taking the last (most recent) if there are duplicates
    const settings = {};
    companySettings.forEach(row => {
      const category = row.Category;
      const key = row.SettingKey;
      let value = row.SettingValue;
      
      try {
        // Parse JSON arrays/objects if applicable
        if (value.startsWith('[') || value.startsWith('{')) {
          value = JSON.parse(value);
        }
      } catch (e) {}

      if (!settings[category]) {
        settings[category] = {};
      }
      settings[category][key] = value;
    });

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

router.post('/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { category, settings, updatedBy = 'system' } = req.body;
    
    if (!category || !settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid settings format' });
    }

    const sheets = await initializeSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    
    let existingData = [];
    let headers = [];
    
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: SETTINGS_SHEET_NAME,
      });
      if (response.data.values && response.data.values.length > 0) {
        headers = response.data.values[0];
        existingData = response.data.values;
      }
    } catch (e) {
      console.warn(`Settings sheet not found or empty: ${e.message}`);
    }

    // Ensure headers exist
    if (headers.length === 0) {
      headers = ['CompanyId', 'Category', 'SettingKey', 'SettingValue', 'UpdatedAt', 'UpdatedBy'];
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: SETTINGS_SHEET_NAME,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [headers],
        },
      });
    }

    const timestamp = new Date().toISOString();
    
    // For each key in settings, update if exists, else append
    for (const [key, value] of Object.entries(settings)) {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      let rowIndex = -1;
      for (let i = 1; i < existingData.length; i++) {
        const row = existingData[i];
        const rowCompanyId = row[headers.indexOf('CompanyId')] || row[headers.indexOf('CompanyID')];
        const rowCategory = row[headers.indexOf('Category')];
        const rowKey = row[headers.indexOf('SettingKey')];
        
        if (rowCompanyId === companyId && rowCategory === category && rowKey === key) {
          rowIndex = i;
          break;
        }
      }

      if (rowIndex !== -1) {
        // Update existing row
        // A=1, B=2, C=3, etc.
        const rowNum = rowIndex + 1; // +1 because rows are 1-indexed
        
        // Construct the row array based on headers
        const updateRow = new Array(headers.length).fill('');
        updateRow[headers.indexOf('CompanyId')] = companyId;
        updateRow[headers.indexOf('Category')] = category;
        updateRow[headers.indexOf('SettingKey')] = key;
        updateRow[headers.indexOf('SettingValue')] = stringValue;
        updateRow[headers.indexOf('UpdatedAt')] = timestamp;
        updateRow[headers.indexOf('UpdatedBy')] = updatedBy;

        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${SETTINGS_SHEET_NAME}!A${rowNum}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [updateRow],
          },
        });
      } else {
        // Append new row
        const appendRow = new Array(headers.length).fill('');
        appendRow[headers.indexOf('CompanyId')] = companyId;
        appendRow[headers.indexOf('Category')] = category;
        appendRow[headers.indexOf('SettingKey')] = key;
        appendRow[headers.indexOf('SettingValue')] = stringValue;
        appendRow[headers.indexOf('UpdatedAt')] = timestamp;
        appendRow[headers.indexOf('UpdatedBy')] = updatedBy;

        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: SETTINGS_SHEET_NAME,
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          requestBody: {
            values: [appendRow],
          },
        });
      }
    }

    clearCache(SETTINGS_SHEET_NAME);

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});

module.exports = router;
