@echo off
echo ========================================================
echo   RentEase Public Tunnel Generator (Open Anywhere)
echo ========================================================
echo.
echo Choose an option to share your application (Port 3000):
echo.
echo 1) Pinggy (Instant public HTTPS link, uses Windows built-in SSH, no signup)
echo 2) Cloudflare Quick Tunnel (Free public HTTPS link via trycloudflare.com)
echo 3) Ngrok (Supports permanent free static domain for 1 week)
echo.
set /p choice="Enter choice (1, 2, or 3): "

if "%choice%"=="1" (
    echo.
    echo Starting Pinggy Tunnel... (Make sure backend and frontend are running)
    ssh -p 443 -R0:localhost:3000 a.pinggy.io
)

if "%choice%"=="2" (
    echo.
    echo Starting Cloudflare Tunnel...
    npx -y @cloudflare/cloudflared tunnel --url http://localhost:3000
)

if "%choice%"=="3" (
    echo.
    set /p domain="Enter your free ngrok static domain (or press Enter to use random): "
    if "%domain%"=="" (
        npx -y ngrok http 3000
    ) else (
        npx -y ngrok http --url=%domain% 3000
    )
)

pause
