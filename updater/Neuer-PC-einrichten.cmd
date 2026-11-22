@echo off
rem schulassistenz: neuen PC einrichten (Doppelklick). Liegt im Datenordner, kommt ueber OneDrive mit.
rem Richtet Updates ein, verbindet IServ als Laufwerk und fuehrt durch das Laden des Schulassistenz-Helfers.
if not exist "%~dp0werkzeuge\updater\neuer-pc.ps1" (
  echo Es fehlt werkzeuge\updater\neuer-pc.ps1. Ist OneDrive fertig mit dem Synchronisieren?
  pause
  exit /b 1
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0werkzeuge\updater\neuer-pc.ps1" %*
echo.
pause
