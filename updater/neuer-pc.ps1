<#
  schulassistenz: neuen PC einrichten (Doppelklick auf "Neuer-PC-einrichten.cmd" im Datenordner)
  Erledigt alles, was Windows ohne dich kann, und führt durch den Rest:
    1. Datenordner prüfen, Werkzeuge in OneDrive "immer auf diesem Gerät behalten"
    2. automatische Updates einrichten (wie einrichten.cmd) und gleich aktualisieren
    3. IServ als Laufwerk verbinden (Schülerdaten, auf Wunsch Gruppenordner), Adressen aus profil\profil.md
    4. Schulassistenz-Helfer in Chrome/Edge: Erweiterungsseite öffnen, Ordnerpfad in die Zwischenablage
    5. Was danach noch fehlt (Claude-App-Ordner, Startseite)
  Speichert kein Passwort selbst. Das Passwort fürs Laufwerk fragt Windows ab und merkt es sich auf Wunsch in der Windows-Anmeldeinformationsverwaltung.
  Lädt nichts hoch.
#>
param([switch]$OhneLaufwerke, [switch]$OhneUpdate)

$ErrorActionPreference = 'Continue'
$Updater = $PSScriptRoot
$Root    = Split-Path (Split-Path $Updater -Parent) -Parent   # ...\werkzeuge\updater -> Datenordner
$Helfer  = Join-Path $Root 'werkzeuge\iserv-helfer'
$offen   = New-Object System.Collections.ArrayList

function Titel([string]$t) { Write-Host ''; Write-Host $t -ForegroundColor Cyan }
function Ok([string]$t)    { Write-Host ('  ok  ' + $t) -ForegroundColor Green }
function Hin([string]$t)   { Write-Host ('  ->  ' + $t) -ForegroundColor Yellow }
function Info([string]$t)  { Write-Host ('      ' + $t) }
function JaNein([string]$frage, [bool]$standard = $true) {
  $z = if ($standard) { '[J/n]' } else { '[j/N]' }
  $a = (Read-Host ('  ?   ' + $frage + ' ' + $z)).Trim().ToLower()
  if (-not $a) { return $standard }
  return $a.StartsWith('j') -or $a.StartsWith('y')
}

Write-Host 'schulassistenz: neuen PC einrichten' -ForegroundColor Cyan
Write-Host ('Datenordner: ' + $Root)

# ---------- 1. Datenordner ----------
Titel '1. Datenordner'
$profilDatei = Join-Path $Root 'profil\profil.md'
$einstDatei  = Join-Path $Root 'werkzeuge\startseite\meine-einstellungen.js'
if (-not (Test-Path (Join-Path $Root 'werkzeuge'))) {
  Hin 'Hier fehlt der Ordner "werkzeuge". Diese Datei muss im Datenordner liegen (dort, wo auch "profil" ist).'
  Read-Host 'Enter zum Beenden' | Out-Null; exit 1
}
if (Test-Path $profilDatei) { Ok 'Schulprofil gefunden' } else { Hin 'profil\profil.md fehlt noch. Ist OneDrive fertig mit dem Synchronisieren? Sonst in Claude: "Richte schulassistenz ein."'; [void]$offen.Add('Schulprofil fehlt (OneDrive abwarten oder in Claude einrichten)') }
# Werkzeuge immer lokal halten (Chrome lädt den Helfer aus diesem Ordner; bei "Nur online" würde er fehlen)
if ($Root -match '\\OneDrive') {
  try { & attrib.exe +P -U (Join-Path $Root 'werkzeuge') /S /D 2>$null | Out-Null; Ok 'OneDrive: Ordner "werkzeuge" bleibt immer auf diesem Gerät' } catch {}
}

# ---------- 2. Updates ----------
Titel '2. Automatische Updates'
if ($OhneUpdate) { Info 'übersprungen' }
else {
  try { & (Join-Path $Updater 'schulassistenz-update.ps1') -Einrichten } catch { Hin ('Updater: ' + $_.Exception.Message) }
}
if (Test-Path (Join-Path $Helfer 'manifest.json')) {
  try { $v = (Get-Content (Join-Path $Helfer 'manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json).version; Ok ('Schulassistenz-Helfer ' + $v + ' liegt bereit') } catch {}
} else { Hin 'Der Ordner werkzeuge\iserv-helfer fehlt. Bitte später "jetzt-aktualisieren.cmd" im Ordner werkzeuge\updater starten.' ; [void]$offen.Add('Helfer-Ordner fehlt (jetzt-aktualisieren.cmd)') }

# ---------- 3. Laufwerke ----------
function Wert([string]$text, [string]$name) {
  if (-not $text) { return '' }
  $m = [regex]::Match($text, '(?m)^\s*' + [regex]::Escape($name) + ':\s*(.+?)\s*(#.*)?$')
  if (-not $m.Success) { return '' }
  $w = $m.Groups[1].Value.Trim().Trim("'").Trim('"')
  if ($w -match '<') { return '' }
  return $w
}
$profil = if (Test-Path $profilDatei) { Get-Content $profilDatei -Raw -Encoding UTF8 } else { '' }
$einst  = if (Test-Path $einstDatei)  { Get-Content $einstDatei  -Raw -Encoding UTF8 } else { '' }
$einst  = ($einst -split "`r?`n" | Where-Object { $_ -notmatch '^\s*//' }) -join "`n"   # Beispiele in Kommentaren nicht mitlesen
$sdPfad = Wert $profil 'schuelerdaten'
$sdWeb  = Wert $profil 'schuelerdaten_web'
if (-not $sdWeb -and $einst -match 'schuelerdaten\s*:\s*"(https://[^"<]+)"') { $sdWeb = $Matches[1] }
$grPfad = Wert $profil 'schulserver'
$grWeb  = Wert $profil 'schulserver_web'
if (-not $grWeb -and $einst -match 'schulordner\s*:\s*\{[^}]*web\s*:\s*"(https://[^"<]+)"') { $grWeb = $Matches[1] }
if (-not $grPfad -and $einst -match 'schulordner\s*:\s*\{[^}]*laufwerk\s*:\s*"([^"]+)"') { $grPfad = $Matches[1] -replace '\\\\', '\' }

function Laufwerk([string]$pfad, [string]$web, [string]$wofuer) {
  if (-not ($pfad -match '^([A-Za-z]):\\?(.*)$')) { Hin ($wofuer + ': kein Laufwerk im Profil (' + $pfad + ').'); return $false }
  $lw = $Matches[1].ToUpper() + ':'; $rest = $Matches[2].Trim('\')
  if (Test-Path $pfad) { Ok ($wofuer + ': ' + $pfad + ' ist erreichbar'); return $true }
  if (-not ($web -match '^https://([^/]+)(/.*)?$')) { Hin ($wofuer + ': Die Web-Adresse fehlt im Profil. Laufwerk bitte im Explorer verbinden (Anleitung der Startseite).'); return $false }
  $server = $Matches[1]; $weg = [uri]::UnescapeDataString(($Matches[2] + '').TrimEnd('/'))
  if ($rest) {
    $r = '/' + ($rest -replace '\\', '/')
    if (-not $weg.ToLower().EndsWith($r.ToLower())) { Hin ($wofuer + ': Laufwerk ' + $lw + ' passt nicht zur Adresse ' + $web + '. Bitte im Explorer verbinden.'); return $false }
    $weg = $weg.Substring(0, $weg.Length - $r.Length)
  }
  $unc = '\\' + $server + '@SSL' + ($weg -replace '/', '\')
  if (Test-Path ($lw + '\')) {
    $belegt = (Get-PSDrive -Name $lw.TrimEnd(':') -ErrorAction SilentlyContinue).DisplayRoot
    Hin ($wofuer + ': Laufwerk ' + $lw + ' ist schon belegt' + $(if ($belegt) { ' (' + $belegt + ')' } else { '' }) + ', aber ' + $pfad + ' fehlt dort.')
    return $false
  }
  Info ($wofuer + ': verbinde ' + $lw + ' mit ' + $unc)
  Info 'Windows fragt gleich nach deinem IServ-Benutzernamen und Passwort (wie beim Anmelden in IServ).'
  try { Start-Service WebClient -ErrorAction SilentlyContinue } catch {}
  & net.exe use $lw $unc /persistent:yes /savecred
  if ($LASTEXITCODE -eq 0 -and (Test-Path ($lw + '\'))) {
    if ($rest -and -not (Test-Path $pfad)) { Hin ($lw + ' ist verbunden, aber ' + $pfad + ' fehlt dort noch.'); return $false }
    Ok ($wofuer + ': ' + $lw + ' verbunden (kommt nach jedem Neustart wieder)'); return $true
  }
  Hin ($wofuer + ': Verbinden hat nicht geklappt. Im Explorer: "Dieser PC" rechtsklicken > "Netzlaufwerk verbinden", Laufwerk ' + $lw + ', Ordner ' + $unc)
  return $false
}

Titel '3. IServ als Laufwerk (für Claude)'
$freigeben = New-Object System.Collections.ArrayList
[void]$freigeben.Add($Root)
if ($OhneLaufwerke) { Info 'übersprungen' }
else {
  if ($sdPfad) {
    if (Laufwerk $sdPfad $sdWeb 'Schülerdaten') { [void]$freigeben.Add($sdPfad) } else { [void]$offen.Add('Laufwerk für Schülerdaten (' + $sdPfad + ')') }
  } else { Info 'Kein eigener Schülerdaten-Ordner im Profil, nichts zu verbinden.' }
  if ($grPfad) {
    if (Test-Path $grPfad) { Ok ('Gruppenordner: ' + $grPfad + ' ist erreichbar') }
    elseif (JaNein ('Gruppenordner der Schule (' + $grPfad + ', nur lesen) auch verbinden?') $false) {
      if (-not (Laufwerk $grPfad $grWeb 'Gruppenordner')) { [void]$offen.Add('Laufwerk für Gruppenordner (' + $grPfad + ')') }
    }
  }
}

# ---------- 4. Schulassistenz-Helfer ----------
Titel '4. Schulassistenz-Helfer in Chrome oder Edge'
function HelferId([string]$userData) {
  if (-not (Test-Path $userData)) { return $null }
  foreach ($p in Get-ChildItem $userData -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq 'Default' -or $_.Name -like 'Profile *' }) {
    foreach ($f in 'Secure Preferences', 'Preferences') {
      $datei = Join-Path $p.FullName $f
      if (-not (Test-Path $datei)) { continue }
      try {
        $j = Get-Content $datei -Raw -Encoding UTF8 | ConvertFrom-Json
        $s = $j.extensions.settings
        if (-not $s) { continue }
        foreach ($e in $s.PSObject.Properties) {
          $pfad = [string]$e.Value.path
          if ($pfad -and ($pfad.TrimEnd('\') -ieq $Helfer.TrimEnd('\'))) { return $e.Name }
        }
      } catch {
        # Datei ließ sich nicht als JSON lesen: dann nur nachsehen, ob der Ordner darin vorkommt
        try { if ((Get-Content $datei -Raw -Encoding UTF8).ToLower().Contains(($Helfer.TrimEnd('\') -replace '\\', '\\').ToLower())) { return 'geladen' } } catch {}
      }
    }
  }
  return $null
}
$browser = $null; $exe = $null
$chromeExe = @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe", "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe") | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
$edgeExe   = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if ($chromeExe) { $browser = 'Chrome'; $exe = $chromeExe; $ud = Join-Path $env:LOCALAPPDATA 'Google\Chrome\User Data'; $seite = 'chrome://extensions' }
elseif ($edgeExe) { $browser = 'Edge'; $exe = $edgeExe; $ud = Join-Path $env:LOCALAPPDATA 'Microsoft\Edge\User Data'; $seite = 'edge://extensions' }
$id = if ($browser) { HelferId $ud } else { $null }
if (-not $browser) { Hin 'Weder Chrome noch Edge gefunden. Bitte Google Chrome installieren und diese Datei noch einmal starten.'; [void]$offen.Add('Chrome installieren, dann Helfer laden') }
elseif ($id) { Ok ('Der Helfer ist in ' + $browser + ' schon geladen') }
elseif (Test-Path (Join-Path $Helfer 'manifest.json')) {
  try { Set-Clipboard -Value $Helfer; $kopiert = $true } catch { $kopiert = $false }
  Start-Process $exe $seite -ErrorAction SilentlyContinue
  Info ($browser + ' öffnet jetzt die Erweiterungen (sonst ' + $seite + ' in die Adresszeile eingeben). Dort:')
  Info '  a) oben rechts "Entwicklermodus" einschalten'
  Info '  b) "Entpackte Erweiterung laden" klicken'
  Info ('  c) im Ordner-Fenster oben in die Adresszeile ' + $(if ($kopiert) { 'mit Strg+V einfügen' } else { 'eintragen' }) + ': ' + $Helfer)
  Info '     und "Ordner auswählen" klicken'
  Info '  d) Puzzle-Symbol oben rechts > beim Schulassistenz-Helfer die Pinnnadel setzen'
  Read-Host '  Enter drücken, wenn der Helfer geladen ist' | Out-Null
  Start-Sleep -Seconds 2
  $id = HelferId $ud
  if ($id) { Ok 'Helfer erkannt' } else { Hin 'Helfer noch nicht erkannt (Chrome speichert das manchmal erst später). Falls er fehlt: Schritte oben wiederholen.' }
}

# ---------- 5. Zum Schluss ----------
Titel '5. Noch zwei Dinge von Hand'
Info 'Claude-App: links "Ordner" bzw. beim Chat "Ordner hinzufügen" und diese Ordner freigeben:'
foreach ($f in $freigeben) { Info ('  - ' + $f) }
Info 'Startseite: auf das Heft-Symbol des Helfers klicken, dann'
Info '  - "Datenordner verbinden" und diesen Ordner wählen (Pfad liegt gleich in der Zwischenablage):'
Info ('    ' + $Root)
Info '  - bei "Einstellungen von deinem anderen PC gefunden" auf "Übernehmen" klicken'
Info '  - bei IServ anmelden, wenn die Seite fragt, und den Stundenplan-Link aus WebUntis einmal einfügen'
try { Set-Clipboard -Value $Root } catch {}
if ($id -and $id -match '^[a-p]{32}$') { Start-Process $exe ('chrome-extension://' + $id + '/startseite/start.html') -ErrorAction SilentlyContinue }

Write-Host ''
if ($offen.Count) {
  Write-Host 'Noch offen:' -ForegroundColor Yellow
  foreach ($o in $offen) { Write-Host ('  - ' + $o) -ForegroundColor Yellow }
} else { Write-Host 'Fertig. Diese Datei kannst du jederzeit wieder starten, sie ändert nur, was noch fehlt.' -ForegroundColor Green }
