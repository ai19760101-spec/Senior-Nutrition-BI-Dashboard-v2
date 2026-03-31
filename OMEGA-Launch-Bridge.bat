@echo off
TITLE OMEGA AD-COMPATIBLE LAUNCHER
echo ==================================================
echo   OMEGA-PRIME: SILENT API + TUNNEL LAUNCHER
echo ==================================================
echo.

:: 1. Start API Silently (via VBScript)
echo [STEP 1] Starting Background API...
start wscript.exe start-api-silent.vbs
timeout /t 3 /nobreak > nul

:: 2. Start Cloudflare Tunnel (In foreground to show URL)
echo [STEP 2] Launching Tunnel (DO NOT CLOSE THIS WINDOW)...
echo.
cloudflared tunnel --url http://127.0.0.1:3002

pause
