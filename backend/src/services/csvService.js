const axios = require('axios');
const { parse } = require('csv-parse/sync');
const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');

const cache = new NodeCache({ stdTTL: parseInt(process.env.CACHE_TTL) || 300 });

const USE_LOCAL_FILES = process.env.USE_LOCAL_FILES === 'true';
const LOCAL_CSV_PATH = process.env.LOCAL_CSV_PATH || path.join(__dirname, '../../../seed_data_output');

const CSV_BASE_URL = process.env.CSV_PUBLISHED_URL || 
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR9Gv345vBE5KLcPq4XzffOhyUXg1oovBqv3hu4MKH9pYLBLgY1GiPrbWGGq4V17oi8Ix_MATM54z_p/pub';

const FILE_NAME_MAP = {
  'Companies': 'Companies.csv',
  'Users': 'Users.csv',
  'UserCompanyMapping': 'UserCompanyMapping.csv',
  'Groups': 'Groups.csv',
  'Ledgers': 'Ledgers.csv',
  'Parties': 'Parties.csv',
  'ItemCategories': 'ItemCategories.csv',
  'ItemGroups': 'ItemGroups.csv',
  'Items': 'Items.csv',
  'Vouchers': 'Vouchers.csv',
  'VoucherLines': 'VoucherLines.csv',
  'BankAccounts': 'BankAccounts.csv',
  'CashAccounts': 'CashAccounts.csv',
  'Settings': 'Settings.csv',
  'ReminderLog': 'ReminderLog.csv',
  'StockBatches': 'StockBatches.csv',
  'CustomerMovement': 'CustomerMovement.csv',
  'ItemStockStatus': 'ItemStockStatus.csv',
  'SyncLog': 'SyncLog.csv',
  'GeographicSummary': 'GeographicSummary.csv',
  'Orders': 'Orders.csv',
};

const SHEET_GIDS = {
  'Companies': 0,
  'Users': 1833896148,
  'UserCompanyMapping': 37199415,
  'Groups': 580064534,
  'Ledgers': 97230470,
  'Parties': 360235701,
  'ItemCategories': 1866030344,
  'ItemGroups': 145144998,
  'Items': 2067663692,
  'Vouchers': 759847801,
  'VoucherLines': 620669443,
  'BankAccounts': 2111437958,
  'CashAccounts': 898801878,
  'Settings': 1099457799,
  'ReminderLog': 1978497307,
  'StockBatches': 854991912,
  'CustomerMovement': 1597857915,
  'ItemStockStatus': 1021045067,
  'SyncLog': 195158647,
  'GeographicSummary': 818293555,
  'Orders': 2111574083,
};

const fetchCSVFromLocal = (sheetName) => {
  const fileName = FILE_NAME_MAP[sheetName];
  if (!fileName) {
    throw new Error(`Unknown sheet name: ${sheetName}`);
  }

  const filePath = path.join(LOCAL_CSV_PATH, fileName);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Local file not found: ${filePath}`);
  }

  console.log(`📁 Reading ${sheetName} from local file: ${filePath}`);
  return fs.readFileSync(filePath, 'utf-8');
};

const fetchCSV = async (sheetName) => {
  const gid = SHEET_GIDS[sheetName];
  if (gid === undefined) {
    throw new Error(`Unknown sheet name: ${sheetName}`);
  }

  const url = `${CSV_BASE_URL}?output=csv&gid=${gid}`;
  
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching CSV for ${sheetName}:`, error.message);
    throw error;
  }
};

const parseCSV = (csvData) => {
  try {
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      relax_quotes: true
    });

    return records;
  } catch (error) {
    console.error('Error parsing CSV:', error.message);
    throw error;
  }
};

const fetchSheetData = async (sheetName) => {
  const cacheKey = `sheet_${sheetName}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    console.log(`📦 Cache hit for ${sheetName}`);
    return cachedData;
  }

  try {
    const gid = SHEET_GIDS[sheetName];
    if (gid === undefined) {
      console.error(`❌ Unknown sheet name: ${sheetName}`);
      console.error(`Available sheets:`, Object.keys(SHEET_GIDS));
      throw new Error(`Unknown sheet name: ${sheetName}`);
    }

    let csvData;
    if (USE_LOCAL_FILES) {
      csvData = fetchCSVFromLocal(sheetName);
    } else {
      console.log(`⬇️  Fetching ${sheetName} from Google Sheets (gid=${gid})...`);
      csvData = await fetchCSV(sheetName);
    }
    
    let jsonData = parseCSV(csvData);
    jsonData = normalizeData(sheetName, jsonData);
    
    cache.set(cacheKey, jsonData);
    console.log(`✅ Fetched ${jsonData.length} rows from ${sheetName}`);
    
    return jsonData;
  } catch (error) {
    console.error(`❌ Error fetching ${sheetName}:`, error.message);
    throw error;
  }
};

const normalizeCompanyID = (companyId) => {
  if (!companyId) return companyId;
  return companyId.replace(/^CMP-/i, 'COMP-');
};

const fixMalformedBankRow = (row) => {
  const branchName = row.BranchName || '';
  if (branchName && /\d/.test(branchName)) {
    const match = branchName.match(/^(.+?)(\d+\.?\d*)$/);
    if (match) {
      row.BranchName = match[1];
      row.OpeningBalance = match[2];
    }
  }
  return row;
};

const normalizeData = (sheetName, data) => {
  if (sheetName === 'CashAccounts' || sheetName === 'BankAccounts') {
    data = data.map(row => {
      const normalized = { ...row };
      if (normalized.CompanyID) {
        normalized.CompanyID = normalizeCompanyID(normalized.CompanyID);
      }
      if (sheetName === 'BankAccounts') {
        fixMalformedBankRow(normalized);
      }
      return normalized;
    });
  }
  return data;
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
  fetchSheetData,
  clearCache,
  getCacheStats,
  SHEET_GIDS,
};
