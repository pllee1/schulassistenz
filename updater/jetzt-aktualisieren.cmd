@echo off
rem schulassistenz: sofort aktualisieren (Doppelklick)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0schulassistenz-update.ps1" -Jetzt
echo.
pause
