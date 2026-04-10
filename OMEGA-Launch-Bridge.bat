@echo off
TITLE OMEGA AD-COMPATIBLE LAUNCHER

echo [STEP 1] Starting Background API Silently...
start wscript.exe start-api-silent.vbs
timeout /t 3 /nobreak > nul

echo [STEP 2] Launching Tunnel (DO NOT CLOSE THIS WINDOW)...
:: Using the latest documented tunnel approach
npx -y cloudflared tunnel --url http://127.0.0.1:3002
