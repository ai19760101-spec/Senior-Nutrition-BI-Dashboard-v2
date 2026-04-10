@echo off
setlocal
:: Force UTF-8 for CMD output
chcp 65001 > nul
TITLE OMEGA RDP REMOTE DEPLOYER (ULTRA-CLEAN)

:: 1. Configuration (UNC Paths)
set SOURCE="\\tsclient\C\Antigravity_Project\HealthPreservationVillage\Senior-Nutrition-BI-Dashboard"
set TARGET="D:\Senior-Nutrition-BI-Dashboard-v2-main"

echo [OMEGA] Starting Remote Sync...
echo Source: %SOURCE%
echo Target: %TARGET%
echo.

:: 2. Handle UNC paths using pushd
pushd %SOURCE%
if %errorlevel% neq 0 (
    echo [ERROR] Access denied to Source. Check RDP Drive Redirection.
    pause
    exit /b
)

:: 3. Create target directory
if not exist %TARGET% mkdir %TARGET%

:: 4. Execute Sync
echo [*] Copying files via robocopy... (Skipping node_modules and .git)
robocopy . %TARGET% /E /XD node_modules .git /R:3 /W:5

:: 5. Release mount and conclude
popd
echo.
echo ========================================
echo ✅ Sync Completed Successfully!
echo Next: Run OMEGA-Launch-Bridge.bat in:
echo %TARGET%
echo ========================================
echo.

set /p CHOICE="Run 'npm install' on this host? (y/n): "
if /i "%CHOICE%"=="y" (
    cd /d %TARGET%
    npm install
)

pause
