@echo off
echo ========================================================
echo   Starting RentEase (Backend + Frontend)
echo ========================================================
echo.

echo Starting Backend on port 5000...
start "RentEase Backend (Port 5000)" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend on port 3000...
start "RentEase Frontend (Port 3000)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   RentEase is running!
echo   Local Address:   http://localhost:3000
echo   Wi-Fi / LAN URL: http://10.196.105.96:3000
echo ========================================================
echo.
pause
