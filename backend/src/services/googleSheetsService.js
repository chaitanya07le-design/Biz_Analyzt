const { google } = require('googleapis');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: parseInt(process.env.CACHE_TTL) || 300 });

let sheetsClient = null;

const initializeSheetsClient = async () => {
  if (sheetsClient) return sheetsClient;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const authClient = await auth.getClient();
    sheetsClient = google.sheets({ version: 'v4', auth: authClient });
    
    console.log('✅ Google Sheets client initialized');
    return sheetsClient;
  } catch (error) {
    console.error('❌ Failed to initialize Google Sheets client:', error.message);
    throw error;
  }
};

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

const SHEET_GIDS = {
  companies: 0,
  users: 1833896148,
  userCompanyMapping: 37199415,
  groups: 580064534,
  ledgers: 97230470,
  parties: 360235701,
  itemCategories: 1866030344,
  itemGroups: 145144998,
  items: 2067663692,
  vouchers: 759847801,
  voucherLines: 620669443,
  bankAccounts: 2111437958,
  cashAccounts: 898801878,
  settings: 1099457799,
  reminderLog: 1978497307,
};

const fetchSheetData = async (sheetName) => {
  const cacheKey = `sheet_${sheetName}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    console.log(`📦 Cache hit for ${sheetName}`);
    return cachedData;
  }

  try {
    const sheets = await initializeSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: sheetName,
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      console.warn(`⚠️  No data found in sheet: ${sheetName}`);
      return [];
    }

    const [headers, ...dataRows] = rows;
    
    const formattedData = dataRows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

    cache.set(cacheKey, formattedData);
    console.log(`✅ Fetched ${formattedData.length} rows from ${sheetName}`);
    
    return formattedData;
  } catch (error) {
    console.error(`❌ Error fetching ${sheetName}:`, error.message);
    throw error;
  }
};

const fetchSheetDataByGid = async (gid) => {
  const cacheKey = `sheet_gid_${gid}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  try {
    const sheets = await initializeSheetsClient();
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheet = response.data.sheets.find(s => s.properties.sheetId === parseInt(gid));
    
    if (!sheet) {
      throw new Error(`Sheet with GID ${gid} not found`);
    }

    const sheetName = sheet.properties.title;
    return await fetchSheetData(sheetName);
  } catch (error) {
    console.error(`❌ Error fetching sheet with GID ${gid}:`, error.message);
    throw error;
  }
};

const clearCache = (sheetName = null) => {
  if (sheetName) {
    cache.del(`sheet_${sheetName}`);
    console.log(`🗑️  Cache cleared for ${sheetName}`);
  } else {
    cache.flushAll();
    console.log('🗑️  All cache cleared');
  }
};

const getCacheStats = () => {
  return cache.getStats();
};

module.exports = {
  initializeSheetsClient,
  fetchSheetData,
  fetchSheetDataByGid,
  clearCache,
  getCacheStats,
  SHEET_GIDS,
};
