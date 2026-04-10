Set WshShell = CreateObject("WScript.Shell")
' Run the command in a hidden window (0), do not wait for return (False)
WshShell.Run "node server/api.cjs", 0, False
