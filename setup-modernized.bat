@echo off
TITLE Senior Nutrition BI - One-Click Deployer (OMEGA v2)
SETLOCAL EnableDelayedExpansion

echo ==================================================
echo   Senior Nutrition BI Dashboard - OMEGA DEPLOYER
echo ==================================================
echo.

:: Check for Administrative privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Running with Administrative privileges.
) else (
    echo [ERROR] Please run this script as ADMINISTRATOR.
    pause
    exit /b 1
)

:: Check Node.js
where node >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Node.js is installed.
) else (
    echo [ERROR] Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

echo.
echo --------------------------------------------------
echo [STEP 1] Installing Dependencies...
echo --------------------------------------------------
call npm install --no-audit

echo.
echo --------------------------------------------------
echo [STEP 2] Installing Windows Service...
echo --------------------------------------------------
call npm run service:install

echo.
echo --------------------------------------------------
echo [STEP 3] Opening Cloudflare Tunnel...
echo --------------------------------------------------
echo.
echo **************************************************
echo * IMPORTANT: COPY THE https://xxx.untun.io URL   *
echo * BELOW AND SEND IT BACK TO OMEGA (SHERLUCK)!     *
echo **************************************************
echo.
npx untun@latest tunnel 3002

pause
