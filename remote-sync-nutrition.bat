@echo off
setlocal
TITLE OMEGA RDP REMOTE DEPLOYER (FIXED)

:: 1. 設定來源與目標
set SOURCE="\\tsclient\C\Antigravity_Project\HealthPreservationVillage\Senior-Nutrition-BI-Dashboard"
set TARGET="D:\Senior-Nutrition-BI-Dashboard-v2-main"

echo [OMEGA] Starting Remote Sync...
echo Source: %SOURCE%
echo Target: %TARGET%
echo.

:: 2. 解決 UNC 路徑不支援問題 (使用 pushd 自動掛載)
pushd %SOURCE%
if %errorlevel% neq 0 (
    echo [ERROR] Cannot access Source. Ensure RDP Drive Sharing is enabled.
    pause
    exit /b
)

:: 3. 建立目標資料夾
if not exist %TARGET% mkdir %TARGET%

:: 4. 執行同步
echo [*] Synchronizing files... (Excluding node_modules and .git)
robocopy . %TARGET% /E /XD node_modules .git /R:3 /W:5

:: 5. 釋放掛載並完成
popd
echo.
echo Sync Completed!
echo Next: Run OMEGA-Launch-Bridge.bat in %TARGET%
echo.

set /p CHOICE="Run 'npm install' on this host? (y/n): "
if /i "%CHOICE%"=="y" (
    cd /d %TARGET%
    npm install
)

pause
