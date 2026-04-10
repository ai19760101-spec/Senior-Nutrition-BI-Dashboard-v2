@echo off
setlocal
pushd "\\tsclient\C\Antigravity_Project\HealthPreservationVillage\Senior-Nutrition-BI-Dashboard"
if errorlevel 1 (
    echo [ERROR] Cannot access \\tsclient\C.
    echo Please make sure RDP Drive Sharing is enabled for C: drive.
    pause
    exit /b
)
robocopy . "D:\Senior-Nutrition-BI-Dashboard-v2-main" /E /XD node_modules .git /R:3 /W:5
popd
echo Sync Completed!
pause
