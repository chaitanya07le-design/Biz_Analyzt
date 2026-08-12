@echo off
echo ==========================================
echo BizAnalyzt - Google Sheets Connection Test
echo ==========================================
echo.

echo Step 1: Installing backend dependencies...
cd backend
call npm install
echo ✅ Backend dependencies installed
echo.

echo Step 2: Checking for .env file...
if not exist .env (
    echo ⚠️  .env file not found!
    echo Creating .env from template...
    copy .env.example .env
    echo ✅ .env file created
    echo.
    echo ⚠️  IMPORTANT: Edit backend\.env with your Google Cloud credentials!
    echo    1. Add GOOGLE_SERVICE_ACCOUNT_EMAIL
    echo    2. Add GOOGLE_PRIVATE_KEY
    echo    3. Share your Google Sheet with the service account email
    echo.
    echo Press any key when you've updated .env...
    pause >nul
) else (
    echo ✅ .env file exists
)
echo.

echo Step 3: Installing frontend dependencies...
cd ..
call npm install
echo ✅ Frontend dependencies installed
echo.

echo Step 4: Testing backend connection...
cd backend
start /B npm start
timeout /t 3 /nobreak >nul

echo Testing API health endpoint...
curl -s http://localhost:5000/api/health > health_check.json
type health_check.json
echo.

echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Edit backend\.env with your Google Cloud credentials
echo 2. Share your Google Sheet with the service account email
echo 3. Run: npm run dev:all
echo 4. Visit: http://localhost:5173
echo.
pause
