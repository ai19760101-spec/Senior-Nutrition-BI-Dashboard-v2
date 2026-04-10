@echo off
setlocal
cd /d %~dp0
TITLE OMEGA SERVICE CLEANUP (FIXED)

echo [INFO] Stopping all Node processes...
taskkill /F /IM node.exe /T

echo [INFO] Stopping all Cloudflared processes...
taskkill /F /IM cloudflared.exe /T

echo [SUCCESS] Services cleaned.
pause
