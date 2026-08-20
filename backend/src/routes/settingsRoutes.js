const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Path to local settings store — persists to disk, needs no Google credentials
const SETTINGS_FILE = path.join(__dirname, '../../data/settings.json');

/**
 * Read all settings from disk.
 * Returns {} if file is missing or corrupt.
 */
function readSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      return {};
    }
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[settingsRoutes] Could not read settings.json:', e.message);
    return {};
  }
}

/**
 * Write all settings to disk.
 */
function writeSettings(data) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// GET /api/settings/:companyId
// Returns all settings for a company grouped by category
router.get('/:companyId', (req, res) => {
  try {
    const { companyId } = req.params;
    const all = readSettings();
    const companySettings = all[companyId] || {};
    res.json({ success: true, data: companySettings });
  } catch (error) {
    console.error('[settingsRoutes] GET error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

// POST /api/settings/:companyId
// Body: { category: string, settings: object }
// Deep-merges settings[category] for this company and persists to disk
router.post('/:companyId', (req, res) => {
  try {
    const { companyId } = req.params;
    const { category, settings } = req.body;

    if (!category || !settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request: category and settings object are required',
      });
    }

    const all = readSettings();

    if (!all[companyId]) {
      all[companyId] = {};
    }

    // Deep-merge incoming settings into the existing category data
    all[companyId][category] = {
      ...(all[companyId][category] || {}),
      ...settings,
    };

    writeSettings(all);

    console.log(`[settingsRoutes] Saved ${Object.keys(settings).length} key(s) → ${companyId}/${category}`);
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('[settingsRoutes] POST error:', error);
    res.status(500).json({ success: false, error: 'Failed to save settings' });
  }
});

module.exports = router;
