# BizAnalyzt Backend

Backend API for BizAnalyzt - Google Sheets integration via CSV with caching.

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Publish Your Google Sheet

1. Open your Google Sheet
2. Go to **File → Share → Publish to web**
3. Publish each tab as CSV
4. Copy the published URL (looks like: `https://docs.google.com/spreadsheets/d/e/2PACX-.../pub`)

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
CSV_PUBLISHED_URL=https://docs.google.com/spreadsheets/d/e/2PACX-1v.../pub
PORT=5000
CACHE_TTL=300
```

### 4. Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Cache Management
```
GET /api/cache/stats
DELETE /api/cache?sheet=SheetName
```

### Data Endpoints
```
GET /api/companies
GET /api/users
GET /api/user-company-mapping
GET /api/groups
GET /api/ledgers
GET /api/parties
GET /api/item-categories
GET /api/item-groups
GET /api/items
GET /api/vouchers
GET /api/voucher-lines
GET /api/bank-accounts
GET /api/cash-accounts
GET /api/settings
GET /api/reminder-log
```

### Dashboard Endpoints
```
GET /api/dashboard/summary?companyId=COMP-0001
GET /api/outstanding/receivable?companyId=COMP-0001
GET /api/outstanding/payable?companyId=COMP-0001
```

## Response Format

All endpoints return JSON:

```json
{
  "success": true,
  "count": 50,
  "data": [...]
}
```

Error response:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Sheet GIDs

The backend uses these GIDs to fetch specific sheets:

| Sheet | GID |
|-------|-----|
| Companies | 0 |
| Users | 1833896148 |
| UserCompanyMapping | 37199415 |
| Groups | 580064534 |
| Ledgers | 97230470 |
| Parties | 360235701 |
| ItemCategories | 1866030344 |
| ItemGroups | 145144998 |
| Items | 2067663692 |
| Vouchers | 759847801 |
| VoucherLines | 620669443 |
| BankAccounts | 2111437958 |
| CashAccounts | 898801878 |
| Settings | 1099457799 |
| ReminderLog | 1978497307 |

## Caching

- Default TTL: 5 minutes (300 seconds)
- Reduces Google Sheets requests
- Manual cache clear: `DELETE /api/cache`
- View cache stats: `GET /api/cache/stats`

## Security

- No authentication required (uses public published sheet)
- CORS configured for frontend origin
- `.env` is in `.gitignore` (never commit)

## Architecture

```
Frontend (React) → Backend API (Express) → Published Google Sheet (CSV)
                       ↓
                    Cache (Node-Cache)
```

## Troubleshooting

### Error: "Cannot find module"
```bash
npm install
```

### Error: "Failed to fetch CSV"
1. Verify `CSV_PUBLISHED_URL` in `.env`
2. Ensure sheet is published to web
3. Check the URL ends with `/pub`

### Error: "Empty data returned"
1. Check GID values match your sheet
2. Verify tab names in your Google Sheet
3. Ensure sheet has data

### Error: "CORS policy"
- Backend allows `http://localhost:5173` by default
- Update CORS origin in `src/server.js` if needed

## Testing

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test companies endpoint
curl http://localhost:5000/api/companies

# Test dashboard
curl "http://localhost:5000/api/dashboard/summary?companyId=COMP-0001"

# Test cache stats
curl http://localhost:5000/api/cache/stats
```

## Production Deployment

1. Set environment variables on your hosting platform:
   - `CSV_PUBLISHED_URL`
   - `PORT` (if different from 5000)
   - `CACHE_TTL` (if different from 300)

2. Build and run:
   ```bash
   npm install --production
   npm start
   ```

3. Update frontend `VITE_API_URL` to point to your production backend
