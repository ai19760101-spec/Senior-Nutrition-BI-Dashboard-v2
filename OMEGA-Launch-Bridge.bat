@echo off
setlocal
:: Fix UNC path support by auto-mounting a temporary drive letter
pushd "%~dp0"
TITLE OMEGA AD-COMPATIBLE LAUNCHER

echo [STEP 1] Starting Background API Silently...
start wscript.exe start-api-silent.vbs
timeout /t 3 /nobreak > nul

echo [STEP 2] Launching Tunnel (DO NOT CLOSE THIS WINDOW)...
npx -y cloudflared tunnel --url http://127.0.0.1:3002
popd
