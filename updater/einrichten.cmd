@echo off
rem schulassistenz: automatische Updates auf diesem PC einrichten (einmal doppelklicken)
rem Zum Ausschalten: einrichten.cmd entfernen   (oder Doppelklick auf ausschalten.cmd)
if /i "%~1"=="entfernen" (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0schulassistenz-update.ps1" -Entfernen
) else (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0schulassistenz-update.ps1" -Einrichten
)
echo.
pause
