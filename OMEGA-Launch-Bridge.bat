@echo off
setlocal
:: Force UTF-8
chcp 65001 > nul
cd /d %~dp0
TITLE OMEGA AD-COMPATIBLE LAUNCHER

echo [STEP 1] Starting Background API Silently...
start wscript.exe start-api-silent.vbs
timeout /t 3 /nobreak > nul

echo [STEP 2] Launching Tunnel (DO NOT CLOSE THIS WINDOW)...
npx -y cloudflared tunnel --url http://127.0.0.1:3002
