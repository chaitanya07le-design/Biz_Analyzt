# Google Sheets Connection Setup Guide

## Overview

This guide explains how BizAnalyzt connects to your Google Sheets database using a simple CSV-based approach.

## Architecture

```
Frontend (React) → Backend API (Express) → Published Google Sheet (CSV)
                       ↓
                    Cache (Node-Cache, 5 min TTL)
```

## Advantages of CSV Approach

- **No Google Cloud Account Required** - No service account setup
- **No Authentication Complexity** - Uses publicly published sheet
- **Simpler Configuration** - Just one URL to configure
- **Works Immediately** - No approval process

## Prerequisites

- Node.js installed (v18+)
- A Google Sheet with your data

## Step-by-Step Setup

### Step 1: Publish Your Google Sheet

1. Open your Google Sheet
2. Go to **File → Share → Publish to web**
3. Select each tab and publish as CSV
4. Copy the base URL (it will look like: `https://docs.google.com/spreadsheets/d/e/2PACX-.../pub`)

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 3: Configure Environment Variables

1. Copy the environment template:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `.env` with your published sheet URL:
   ```env
   CSV_PUBLISHED_URL=https://docs.google.com/spreadsheets/d/e/2PACX-1vR9Gv345vBE5KLcPq4XzffOhyUXg1oovBqv3hu4MKH9pYLBLgY1GiPrbWGGq4V17oi8Ix_MATM54z_p/pub
   PORT=5000
   CACHE_TTL=300
   ```

### Step 4: Install Frontend Dependencies

```bash
cd ..  # Back to root directory
npm install
```

### Step 5: Run the Application

**Option A: Run Backend and Frontend separately**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

**Option B: Run Both Together**

```bash
npm run dev:all
```

### Step 6: Test the Connection

1. **Test Backend Health**
   ```bash
   curl http://localhost:5000/api/health
   ```
   
   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2024-08-06T...",
     "cache": {...}
   }
   ```

2. **Test Companies Endpoint**
   ```bash
   curl http://localhost:5000/api/companies
   ```

3. **Open Frontend**
   - Go to: http://localhost:5173
   - The app should now load data from Google Sheets!

## Sheet Structure

Your Google Sheet should have these 15 tabs:

| Sheet Name | GID | Description |
|------------|-----|-------------|
| Companies | 0 | Company master data |
| Users | 1833896148 | User accounts |
| UserCompanyMapping | 37199415 | User-company relationships |
| Groups | 580064534 | Account groups |
| Ledgers | 97230470 | Ledger accounts |
| Parties | 360235701 | Customer/Supplier master |
| ItemCategories | 1866030344 | Item categories |
| ItemGroups | 145144998 | Item groups |
| Items | 2067663692 | Item master |
| Vouchers | 759847801 | Transaction headers |
| VoucherLines | 620669443 | Transaction line items |
| BankAccounts | 2111437958 | Bank account details |
| CashAccounts | 898801878 | Cash account details |
| Settings | 1099457799 | Application settings |
| ReminderLog | 1978497307 | Payment reminders |

### Company Filtering

All Company-scoped tabs must have a `CompanyID` column for proper filtering.

## API Endpoints

### Data Endpoints
- `GET /api/companies` - All companies
- `GET /api/users` - All users
- `GET /api/ledgers?companyId=COMP-0001` - Ledgers by company
- `GET /api/parties?companyId=COMP-0001` - Parties by company
- `GET /api/items?companyId=COMP-0001` - Items by company
- `GET /api/vouchers?companyId=COMP-0001` - Vouchers by company
- `GET /api/bank-accounts?companyId=COMP-0001` - Bank accounts
- `GET /api/cash-accounts?companyId=COMP-0001` - Cash accounts

### Dashboard Endpoints
- `GET /api/dashboard/summary?companyId=COMP-0001` - Dashboard metrics
- `GET /api/outstanding/receivable?companyId=COMP-0001` - Receivables
- `GET /api/outstanding/payable?companyId=COMP-0001` - Payables

### Cache Management
- `GET /api/cache/stats` - Cache statistics
- `DELETE /api/cache` - Clear all cache
- `DELETE /api/cache?sheet=Companies` - Clear specific sheet cache

## Using the Frontend Hook

The `useGoogleSheetsData` hook provides easy access to all data:

```javascript
import useGoogleSheetsData from '../hooks/useGoogleSheetsData';

const MyComponent = () => {
  const { 
    companies, 
    parties, 
    items, 
    vouchers, 
    loading, 
    error,
    connectionStatus 
  } = useGoogleSheetsData('COMP-0001');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {companies.map(c => <li key={c.id}>{c.name}</li>)}
    </ul>
  );
};
```

## Caching Strategy

- **Default TTL:** 5 minutes (300 seconds)
- **Cache Invalidation:**
  - Automatic after TTL expires
  - Manual via `DELETE /api/cache`
- **Benefits:**
  - Reduces API calls to Google Sheets
  - Improves response time
  - Stays within rate limits

## Troubleshooting

### Error: "Failed to fetch CSV"
- Verify the CSV_PUBLISHED_URL in `.env`
- Ensure the sheet is published to web (not just shared)
- Check that all GIDs are correct

### Error: "Cannot find module"
```bash
cd backend && npm install
cd .. && npm install
```

### Error: "CORS policy"
- Backend CORS is configured for `http://localhost:5173`
- If using different port, update `backend/src/server.js`

### Error: "Empty data returned"
- Check if sheet has the expected tab names
- Verify GID values in `csvService.js`
- Ensure sheet has data in the expected format

### Error: "Company filtering not working"
- Ensure your sheets have a `CompanyID` column
- Check that CompanyID values match the pattern (e.g., "COMP-0001")

## Security Considerations

1. **Sheet Visibility** - Published sheets are publicly accessible via the URL
   - Only publish sheets that don't contain sensitive information
   - Or restrict access to internal network in production

2. **Production Deployment** - Use environment variables on your hosting platform
   - Don't commit `.env` file to version control
   - `.env` is already in `.gitignore`

3. **Data Privacy** - Consider what data is stored in the sheet
   - Avoid storing passwords or API keys
   - Use the Settings tab for non-sensitive configuration only

## Files Created

### Backend
- `backend/package.json` - Node.js dependencies
- `backend/.env.example` - Environment template
- `backend/.env` - Your configuration (not committed)
- `backend/src/server.js` - Express server
- `backend/src/services/csvService.js` - CSV fetch and parse service
- `backend/src/routes/dataRoutes.js` - API routes
- `backend/README.md` - Backend documentation

### Frontend
- `src/services/api.js` - API client
- `src/hooks/useGoogleSheetsData.js` - Data fetching hook
- `.env` - Frontend environment variables

### Root
- `package.json` - Updated with `concurrently` script
- `GOOGLE_SHEETS_SETUP.md` - This documentation

## Support

If you encounter issues:
1. Check backend logs in terminal
2. Check browser console for errors
3. Test API endpoints with curl or Postman
4. Verify your Google Sheet is properly published
