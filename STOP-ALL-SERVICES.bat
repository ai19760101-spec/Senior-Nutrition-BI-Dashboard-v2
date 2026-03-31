@echo off
TITLE OMEGA CLEANUP: STOP BACKGROUND API
echo ==================================================
echo   OMEGA-PRIME: STOPPING HIDDEN API SERVICE
echo ==================================================
echo.

:: Kill node.exe processes
taskkill /F /IM node.exe
echo [OK] Background API has been killed (if it was running).

pause
