@echo off
setlocal
:: Force Local Path normalization
pushd "\\tsclient\C\Antigravity_Project\HealthPreservationVillage\Senior-Nutrition-BI-Dashboard"
if errorlevel 1 (
    echo [ERROR] Cannot access \\tsclient\C.
    echo Please make sure RDP Drive Sharing is enabled for C: drive.
    pause
    exit /b
)

echo [OMEGA] Starting Remote Sync...
if not exist "D:\Senior-Nutrition-BI-Dashboard-v2-main" mkdir "D:\Senior-Nutrition-BI-Dashboard-v2-main"

:: Execute Robocopy
robocopy . "D:\Senior-Nutrition-BI-Dashboard-v2-main" /E /XD node_modules .git /R:3 /W:5
popd

echo.
echo ========================================
echo Sync Completed!
echo ========================================
echo.

set /p CHOICE="Run 'npm install' on this host? (y/n): "
if /i "%CHOICE%"=="y" (
    echo [INFO] Entering D drive...
    cd /d "D:\Senior-Nutrition-BI-Dashboard-v2-main"
    echo [INFO] Running npm install...
    npm install
)

echo.
echo Next step: Run OMEGA-Launch-Bridge.bat in D drive.
pause
