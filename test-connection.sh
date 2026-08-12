#!/bin/bash

echo "=========================================="
echo "BizAnalyzt - Google Sheets Connection Test"
echo "=========================================="
echo ""

echo "Step 1: Installing backend dependencies..."
cd backend
npm install
echo "✅ Backend dependencies installed"
echo ""

echo "Step 2: Checking for .env file..."
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Edit backend/.env with your Google Cloud credentials!"
    echo "   1. Add GOOGLE_SERVICE_ACCOUNT_EMAIL"
    echo "   2. Add GOOGLE_PRIVATE_KEY"
    echo "   3. Share your Google Sheet with the service account email"
    echo ""
    echo "Press Enter when you've updated .env..."
    read
else
    echo "✅ .env file exists"
fi
echo ""

echo "Step 3: Installing frontend dependencies..."
cd ..
npm install
echo "✅ Frontend dependencies installed"
echo ""

echo "Step 4: Testing backend connection..."
cd backend
npm start &
BACKEND_PID=$!
sleep 3

echo "Testing API health endpoint..."
HEALTH=$(curl -s http://localhost:5000/api/health)

if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo "✅ Backend is running successfully!"
    echo "$HEALTH" | python -m json.tool 2>/dev/null || echo "$HEALTH"
else
    echo "❌ Backend failed to start. Check logs above."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi
echo ""

echo "Step 5: Testing Google Sheets connection..."
COMPANIES=$(curl -s http://localhost:5000/api/companies)

if echo "$COMPANIES" | grep -q '"success":true'; then
    echo "✅ Google Sheets connection successful!"
    echo ""
    echo "Sample data:"
    echo "$COMPANIES" | python -m json.tool 2>/dev/null | head -20 || echo "$COMPANIES" | head -20
else
    echo "❌ Google Sheets connection failed!"
    echo "Check your .env configuration and Google Sheet permissions."
    echo ""
    echo "Response:"
    echo "$COMPANIES"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi
echo ""

kill $BACKEND_PID 2>/dev/null

echo "=========================================="
echo "✅ ALL TESTS PASSED!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Run backend:  cd backend && npm run dev"
echo "2. Run frontend: npm run dev"
echo "3. Or run both:  npm run dev:all"
echo ""
echo "Visit: http://localhost:5173"
echo ""
