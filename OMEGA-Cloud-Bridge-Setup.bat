@echo off
TITLE OMEGA Cloud Bridge - Senior Nutrition BI (Enterprise)
SETLOCAL EnableDelayedExpansion

echo ==================================================
echo   OMEGA-PRIME: ENTERPRISE CLOUD BRIDGE SETUP
echo ==================================================
echo.

:: 1. Administrative Check
net session >nul 2>&1
if !errorLevel! == 0 (
    echo [OK] Running with Administrative privileges.
) else (
    echo [ERROR] Please run this script as ADMINISTRATOR.
    pause
    exit /b 1
)

:: 2. Node.js Check
where node >nul 2>&1
if !errorLevel! == 0 (
    echo [OK] Node.js is installed.
) else (
    echo [ERROR] Node.js not found. Please install Node.js (LTS) first.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

:: 3. IP Configuration Check
echo.
echo [IMPORTANT] Please ensure "data/SQLDB.txt" has the correct SQL Server IP.
echo Current configuration:
if exist data\SQLDB.txt (
    type data\SQLDB.txt | findstr "伺服器名稱"
) else (
    echo [WARNING] data\SQLDB.txt NOT FOUND! Please copy it from your notebook.
)
set /p confirm="Is the configuration correct? (Y/N): "
if /i not "!confirm!" == "Y" (
    echo [ABORTED] Please edit data\SQLDB.txt and restart.
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
echo [STEP 2] Registering Background Service...
echo --------------------------------------------------
call npm run service:install

echo.
echo --------------------------------------------------
echo [STEP 3] Establishing Cloud Tunnel...
echo --------------------------------------------------
echo.
echo **************************************************
echo * SUCCESS: PLEASE COPY THE TUNNEL URL BELOW      *
echo * (e.g. https://xxx.untun.io) and send to OMEGA! *
echo **************************************************
echo.
npx untun@latest tunnel 3002

pause
