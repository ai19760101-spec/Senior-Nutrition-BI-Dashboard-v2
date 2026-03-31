Set WshShell = CreateObject("WScript.Shell")
' Run the API in background (0 = hidden window)
WshShell.Run "node server/api.cjs", 0, False
