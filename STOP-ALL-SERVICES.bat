@echo off
TITLE OMEGA SERVICE CLEANUP

echo [INFO] Stopping all Node processes...
taskkill /F /IM node.exe /T

echo [INFO] Stopping all Cloudflared processes...
taskkill /F /IM cloudflared.exe /T

echo [SUCCESS] Services cleaned.
pause
