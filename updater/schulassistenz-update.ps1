<#
  schulassistenz-Update
  Holt die neueste Fassung von Startseite, Schulassistenz-Helfer und Werkzeugen aus GitHub
  und ersetzt im Datenordner nur Dateien, die sich geändert haben.
  Nie angefasst: meine-einstellungen.js, Profil, Planung, Lerngruppen, Kürzellisten, Ausgaben.
  Es wird nichts hochgeladen, nur heruntergeladen.

  Aufruf:
    schulassistenz-update.ps1              Update (läuft unsichtbar per Aufgabenplanung/Autostart)
    schulassistenz-update.ps1 -Einrichten  Einmalig je PC: Autostart + Aufgabe alle 2 Stunden anlegen
    schulassistenz-update.ps1 -Entfernen   Autostart und Aufgabe wieder löschen
    schulassistenz-update.ps1 -Jetzt       Sofort aktualisieren, auch wenn GitHub nichts Neues meldet
#>
param([switch]$Einrichten, [switch]$Entfernen, [switch]$Jetzt)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}

$Updater  = $PSScriptRoot
$Root     = Split-Path (Split-Path $Updater -Parent) -Parent   # ...\werkzeuge\updater -> Datenordner
$Repo     = 'pllee1/schulassistenz'
$Branch   = 'main'
$QuelleTxt = Join-Path $Updater 'quelle.txt'                    # optional: andere Quelle "besitzer/repo"
if (Test-Path $QuelleTxt) { $q = (Get-Content $QuelleTxt -Raw).Trim(); if ($q -match '^[\w.-]+/[\w.-]+$') { $Repo = $q } }
$Local    = Join-Path $env:LOCALAPPDATA 'schulassistenz-update'
$LogDatei = Join-Path $Local 'update.log'
$StandDatei = Join-Path $Local 'letzter-stand.txt'
$TaskName = 'schulassistenz-Update'
$Interaktiv = [bool]($Einrichten -or $Jetzt)
New-Item -ItemType Directory -Force -Path $Local | Out-Null

function Log([string]$t) {
  $z = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') + '  ' + $t
  Add-Content -Path $LogDatei -Value $z -Encoding UTF8
  if ($Interaktiv) { Write-Host $t }
}
function KurzLog {
  try { $l = Get-Content $LogDatei -Encoding UTF8; if ($l.Count -gt 400) { $l[-300..-1] | Set-Content $LogDatei -Encoding UTF8 } } catch {}
}

$Startbefehl = 'conhost.exe'
$StartArgs   = '--headless powershell.exe -NoProfile -ExecutionPolicy Bypass -File "' + (Join-Path $Updater 'schulassistenz-update.ps1') + '"'
$Autostart   = Join-Path ([Environment]::GetFolderPath('Startup')) 'schulassistenz-Update.lnk'

if ($Entfernen) {
  Remove-Item $Autostart -ErrorAction SilentlyContinue
  try { Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction Stop } catch {}
  Write-Host 'Automatische Updates sind auf diesem PC ausgeschaltet.'
  exit 0
}

if ($Einrichten) {
  Write-Host 'schulassistenz: automatische Updates einrichten' -ForegroundColor Cyan
  Write-Host ('Datenordner: ' + $Root)
  if (-not (Test-Path (Join-Path $Root 'werkzeuge'))) {
    Write-Host 'Der Ordner "werkzeuge" fehlt hier. Bitte den Ordner "updater" nach <Datenordner>\werkzeuge\updater legen.' -ForegroundColor Red
    exit 1
  }
  # 1) Bei jeder Anmeldung (Autostart-Verknüpfung, braucht keine Admin-Rechte)
  $sh = New-Object -ComObject WScript.Shell
  $lnk = $sh.CreateShortcut($Autostart)
  $lnk.TargetPath = $Startbefehl; $lnk.Arguments = $StartArgs; $lnk.WindowStyle = 7
  $lnk.WorkingDirectory = $Updater; $lnk.Description = 'schulassistenz: Updates aus GitHub holen'
  $lnk.Save()
  Write-Host '  ok  Update bei jeder Anmeldung (Autostart)'
  # 2) Zusätzlich alle 2 Stunden, solange du angemeldet bist
  try {
    $a = New-ScheduledTaskAction -Execute $Startbefehl -Argument $StartArgs -WorkingDirectory $Updater
    $t = New-ScheduledTaskTrigger -Once -At ((Get-Date).AddMinutes(5)) -RepetitionInterval (New-TimeSpan -Hours 2) -RepetitionDuration (New-TimeSpan -Days 3650)
    $s = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 10) -MultipleInstances IgnoreNew
    Register-ScheduledTask -TaskName $TaskName -Action $a -Trigger $t -Settings $s -Description 'schulassistenz: Updates aus GitHub holen' -Force | Out-Null
    Write-Host '  ok  Update alle 2 Stunden (Aufgabenplanung)'
  } catch {
    Write-Host ('  --  Aufgabenplanung nicht möglich (' + $_.Exception.Message + '). Update bei Anmeldung reicht aus.') -ForegroundColor Yellow
  }
  Write-Host ''
  Write-Host 'Erstes Update läuft ...' -ForegroundColor Cyan
  $Jetzt = $true
}

# ---- Nur eine Ausführung gleichzeitig ----
$mutex = New-Object System.Threading.Mutex($false, 'Local\schulassistenz-update')
if (-not $mutex.WaitOne(0)) { exit 0 }

$tmp = $null
try {
  KurzLog
  # ---- Was ist der neueste Stand auf GitHub? (kleine Abfrage, spart den Download) ----
  $sha = $null
  for ($i = 1; $i -le 4 -and -not $sha; $i++) {
    try {
      $r = Invoke-WebRequest -UseBasicParsing -TimeoutSec 20 -Headers @{ 'Accept' = 'application/vnd.github.sha'; 'User-Agent' = 'schulassistenz-update' } -Uri ("https://api.github.com/repos/$Repo/commits/$Branch")
      $sha = ([string]$r.Content).Trim()
    } catch {
      if ($i -lt 4 -and -not $Interaktiv) { Start-Sleep -Seconds (15 * $i) } elseif ($Interaktiv) { break }
    }
  }
  $alt = if (Test-Path $StandDatei) { (Get-Content $StandDatei -Raw).Trim() } else { '' }
  if ($sha -and $sha -eq $alt -and -not $Jetzt) { exit 0 }   # nichts Neues

  # ---- Herunterladen und entpacken ----
  $tmp = Join-Path $env:TEMP ('sa-update-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
  New-Item -ItemType Directory -Path $tmp | Out-Null
  $zip = Join-Path $tmp 'repo.zip'
  Invoke-WebRequest -UseBasicParsing -TimeoutSec 120 -Headers @{ 'User-Agent' = 'schulassistenz-update' } -Uri ("https://codeload.github.com/$Repo/zip/refs/heads/$Branch") -OutFile $zip
  Expand-Archive -Path $zip -DestinationPath (Join-Path $tmp 'x') -Force
  $quelle = Get-ChildItem (Join-Path $tmp 'x') -Directory | Select-Object -First 1
  if (-not $quelle) { throw 'Download leer' }
  $qr = $quelle.FullName

  $zuordnung = Join-Path $qr 'updater\zuordnung.txt'
  if (-not (Test-Path $zuordnung)) { throw 'zuordnung.txt fehlt im Download' }

  # Eigene Ausnahmen: Dateien, die auf diesem Datenordner nie ersetzt werden (eine je Zeile, relativ zum Datenordner)
  $ausnahmen = @()
  $nichtDatei = Join-Path $Updater 'nicht-ersetzen.txt'
  if (Test-Path $nichtDatei) {
    $ausnahmen = Get-Content $nichtDatei -Encoding UTF8 | ForEach-Object { $_.Trim() } | Where-Object { $_ -and -not $_.StartsWith('#') } | ForEach-Object { ($_ -replace '/', '\').TrimStart('\').ToLower() }
  }
  $gesperrt = '(^|\\)(meine-einstellungen\.js|nicht-ersetzen\.txt|quelle\.txt)$|^(profil|planung|lerngruppen|kuerzellisten|ausgaben|archiv|material)\\'

  # Liste aller Dateien: Quelle -> Ziel
  $paare = New-Object System.Collections.ArrayList
  foreach ($zeile in Get-Content $zuordnung -Encoding UTF8) {
    $z = $zeile.Trim()
    if (-not $z -or $z.StartsWith('#') -or $z -notmatch '=>') { continue }
    $teile = $z -split '=>', 2
    $von = $teile[0].Trim() -replace '/', '\'
    $nach = $teile[1].Trim() -replace '/', '\'
    if ($nach -match '\.\.' -or [IO.Path]::IsPathRooted($nach)) { continue }
    $vonVoll = Join-Path $qr $von
    if ($von.EndsWith('\')) {
      if (-not (Test-Path $vonVoll)) { continue }
      Get-ChildItem $vonVoll -Recurse -File | ForEach-Object {
        $rel = $_.FullName.Substring($vonVoll.Length).TrimStart('\')
        [void]$paare.Add(@($_.FullName, ($nach + $rel)))
      }
    } elseif (Test-Path $vonVoll) {
      [void]$paare.Add(@($vonVoll, $nach))
    }
  }

  # manifest.json zuletzt, damit der Schulassistenz-Helfer erst neu lädt, wenn alle Dateien da sind
  $paare = @($paare | Sort-Object { if ((Split-Path $_[1] -Leaf) -eq 'manifest.json') { 1 } else { 0 } })
  $neu = @(); $fehler = 0
  foreach ($p in $paare) {
    $rel = $p[1].TrimStart('\')
    $relKlein = $rel.ToLower()
    if ($relKlein -match $gesperrt) { continue }
    if ($ausnahmen -contains $relKlein) { continue }
    $ziel = Join-Path $Root $rel
    if ((Test-Path $ziel) -and ((Get-FileHash $p[0] -Algorithm SHA256).Hash -eq (Get-FileHash $ziel -Algorithm SHA256).Hash)) { continue }
    try {
      $ordner = Split-Path $ziel -Parent
      if (-not (Test-Path $ordner)) { New-Item -ItemType Directory -Force -Path $ordner | Out-Null }
      $zwischen = $ziel + '.sa-neu'
      Copy-Item $p[0] $zwischen -Force
      Move-Item $zwischen $ziel -Force
      $neu += $rel
    } catch {
      $fehler++; Log ('Fehler bei ' + $rel + ': ' + $_.Exception.Message)
    }
  }

  # Versionen für das Protokoll
  $ver = ''
  try { $ver = 'Plugin ' + ((Get-Content (Join-Path $qr 'plugin\.claude-plugin\plugin.json') -Raw | ConvertFrom-Json).version) } catch {}
  try { $ver += ', Helfer ' + ((Get-Content (Join-Path $qr 'plugin\skills\postfach-assistent\werkzeuge\iserv-helfer\manifest.json') -Raw | ConvertFrom-Json).version) } catch {}

  if ($neu.Count -gt 0) { Log ("Aktualisiert ($ver): " + ($neu -join ', ')) }
  elseif ($Interaktiv) { Log ("Alles aktuell ($ver).") }
  if ($fehler -eq 0 -and $sha) { Set-Content -Path $StandDatei -Value $sha -Encoding ASCII }
} catch {
  Log ('Update fehlgeschlagen: ' + $_.Exception.Message)
} finally {
  if ($tmp -and (Test-Path $tmp)) { Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue }
  try { $mutex.ReleaseMutex() } catch {}
}

if ($Einrichten) {
  Write-Host ''
  Write-Host 'Fertig. Ab jetzt aktualisiert sich schulassistenz auf diesem PC von selbst.' -ForegroundColor Green
  Write-Host ('Protokoll: ' + $LogDatei)
}
