# Biz_Analyzt Development Guide

## Architecture

```
Frontend (React + Vite) → Backend API (Express) → Google Sheets (CSV)
         :3000                    :5001
```

## ⚠️ CRITICAL: Two Servers Required

This application requires **TWO running processes** to function:

### Option A: Use Concurrent Script (Recommended)
```bash
npm run dev:all
```
This starts both frontend and backend in a single terminal.

### Option B: Manual Startup (Two Terminals)
```bash
# Terminal 1 - Backend API
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

**If only one server is running, you will see:**
- `ERR_CONNECTION_REFUSED` in browser console
- Dashboard shows ₹0 or empty
- All API calls fail with "Failed to fetch"

## Environment Configuration

### Frontend (`.env` at project root)
```env
VITE_API_URL=http://localhost:5001/api
```

### Backend (`backend/.env`)
```env
CSV_PUBLISHED_URL=https://docs.google.com/spreadsheets/d/e/2PACX-.../pub
PORT=5001
CACHE_TTL=300
NODE_ENV=development
```

## Ports

| Service | Port | Default in Code |
|---------|------|-----------------|
| Frontend (Vite) | 3000 | 3000 |
| Backend API | 5001 | 5001 |

**Note:** Backend README shows PORT=5000, but actual .env uses 5001.

## Health Checks

```bash
# Backend health
curl http://localhost:5001/api/health

# Dashboard data
curl "http://localhost:5001/api/dashboard/summary?companyId=COMP-0002"

# Frontend
curl http://localhost:3000
```

## Troubleshooting

### Dashboard shows ₹0 / empty
1. Check if backend is running: `netstat -ano | findstr :5001`
2. If nothing listening, start backend: `cd backend && npm run dev`
3. Check browser Network tab for failed requests

### ERR_CONNECTION_REFUSED
- Backend is not running
- Start it with `npm run dev:backend` or `npm run dev:all`

### Changes not reflecting
- Frontend: Hot reload should work automatically
- Backend: Nodemon should restart automatically
- Data: Clear cache with `curl -X DELETE http://localhost:5001/api/cache`

## Git Commits

This project follows conventional commits:
```
<type>: <description>

Types: Fix, Feat, Refactor, Docs, Style, Test, Chore
```

## Recent Fixes (2025-08-13)

1. **Commit `4ad06a0`**: Baseline of broken state with mockData fallbacks
2. **Commit `7be23b0`**: Removed all mockData fallbacks from useGoogleSheetsData.js
3. **Commit `335024f`**: Removed dangling `useMockData` references

### Root Cause Analysis

The original bug had two layers:

1. **Primary bug**: Backend not running (killed by earlier `taskkill` command)
   - Symptom: `ERR_CONNECTION_REFUSED`
   - Fix: Start backend server

2. **Secondary bug**: Dangling `useMockData` references in frontend
   - After removing mockData fallbacks from hook, 7 references remained
   - These referenced an undefined variable
   - Fix: Remove all `useMockData` references

### Verification

After all fixes, dashboard should show real data:
- Total Sales: ₹1,14,16,146
- Total Purchases: ₹87,65,630
- Receivables: ₹21,95,361
- Payables: ₹7,23,529
