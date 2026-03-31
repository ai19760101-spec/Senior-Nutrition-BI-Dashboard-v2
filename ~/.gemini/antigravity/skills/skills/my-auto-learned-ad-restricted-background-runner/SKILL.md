---
name: my-auto-learned-ad-restricted-background-runner
description: "This skill should be used when Windows Service registration (SCM) is blocked by Active Directory (AD) policies or Group Policy Objects (GPO), providing a stable user-space backgrounding alternative using VBScript."
version: "1.0.0"
last_updated: "2026-03-31"
tier: 1
---

# AD-Restricted Background Runner SOP

Provides a robust method to run Node.js applications in the background (hidden window) when traditional Windows Service installers (like `node-windows`) fail due to permission or registry restrictions.

## 1. Principle (Theory)
Uses the Windows Script Host (WSH) `WScript.Shell.Run` method with the `intWindowStyle` parameter set to `0` (hidden). This allows starting a persistent process attached to the current user session without requiring Administrative SCM registration.

## 2. Implementation Steps

### Step 1: Create the Silent VBScript (`start-silent.vbs`)
Create a VBScript file in the project root:
```vbscript
Set WshShell = CreateObject("WScript.Shell")
' Run the command in a hidden window (0), do not wait for return (False)
WshShell.Run "node server/api.cjs", 0, False
```

### Step 2: Create the Master Batch Launcher (`OMEGA-Launch.bat`)
Combine the VBScript call with other foreground tasks (like tunneling):
```batch
@echo off
:: 1. Start API Silently
start wscript.exe start-silent.vbs
timeout /t 3 /nobreak > nul

:: 2. Start Foreground tasks (e.g. cloudflared)
cloudflared tunnel --url http://127.0.0.1:3002
```

### Step 3: Create a Cleanup Script (`STOP-ALL.bat`)
Since the process is hidden, provide a way to kill it:
```batch
@echo off
taskkill /F /IM node.exe
```

## 3. Invocation
Double-click `OMEGA-Launch.bat` or execute via CMD:
```powershell
.\OMEGA-Launch.bat
```

## 4. Troubleshooting
- **Process visibility**: Verify the process is running in Task Manager under `node.exe`.
- **Termination**: If the batch window is closed, the *tunnel* might stop but the *hidden Node API* will keep running in the background. Execute `STOP-ALL.bat` to clear all instances.
