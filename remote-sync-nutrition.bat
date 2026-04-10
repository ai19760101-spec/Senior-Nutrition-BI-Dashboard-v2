@echo off
setlocal
TITLE OMEGA RDP REMOTE DEPLOYER

:: 1. 設定來源與目標 (UNC 路徑)
:: 來源：您的本地筆電 C 槽道路 (經由 RDP 重新導向)
:: 目標：這台遠端伺服器的 D 槽
set SOURCE="\\tsclient\C\Antigravity_Project\HealthPreservationVillage\Senior-Nutrition-BI-Dashboard"
set TARGET="D:\Senior-Nutrition-BI-Dashboard-v2-main"

echo [OMEGA] Starting Remote Sync for Senior Nutrition BI Dashboard...
echo Source: %SOURCE%
echo Target: %TARGET%
echo.

:: 2. 檢查來源是否存在 (確保 RDP 磁碟機共用已開啟)
if not exist %SOURCE% (
    echo [ERROR] 無法存取本地路徑: %SOURCE%
    echo 請確保連線 RDP 時，「本機資源」->「其他」中的 C 槽已勾選共用。
    pause
    exit /b
)

:: 3. 建立目標資料夾
if not exist %TARGET% mkdir %TARGET%

:: 4. 使用 robocopy 執行同步
:: /E: 複製子目錄
:: /XD: 排除大型或敏感資料夾
:: /R, /W: 失敗重試設定
echo [*] 同步數據中... (排除 node_modules 與 .git 以節省時間)
robocopy %SOURCE% %TARGET% /E /XD node_modules .git /R:3 /W:5

:: 5. 完成
echo.
echo ✅ 同步完成 (Sync Completed Successfully!)
echo 下一步：請至 %TARGET% 目錄開啟 OMEGA-Launch-Bridge.bat 啟動服務。
echo.

set /p CHOICE="是否要在這台主機執行 'npm install'? (y/n): "
if /i "%CHOICE%"=="y" (
    cd /d %TARGET%
    npm install
)

pause
