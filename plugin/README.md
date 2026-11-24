# schulassistenz – Einrichtung für Kolleginnen und Kollegen

Ein Plugin für Claude, das Lehrkräften Routinearbeit abnimmt. Es passt sich an Fach, Schulform und Bundesland an: Alles, was von Schule zu Schule verschieden ist, steht in deinem eigenen **Schulprofil**. Schülerinnen und Schüler kommen nur als **Kürzel** vor (z. B. M07). Die Namen bleiben auf deinem Rechner.

Zeitbedarf: etwa 20 Minuten für die Grundeinrichtung, 10 weitere für die optionalen Teile.

## 1. Vorher klären: Datenschutz

Sprich mit deiner Schulleitung, bevor du mit Schülerdaten arbeitest (auch mit pseudonymisierten). Claude erstellt dir dafür eine Checkliste: Schreibe nach der Installation „Erstelle die Datenschutz-Checkliste für die Schulleitung“.
Bis zur Freigabe arbeitet das Plugin nur mit Aufgaben ohne Schülerdaten (Planung, Material, Prüfungen entwerfen, Wochenplanung).

## 2. Plugin installieren

**Empfohlen, mit automatischen Updates:** In der Claude-Desktop-App links in der Seitenleiste auf **Plugins** gehen, oben rechts auf **„Hinzufügen“** klicken und den Marketplace `pllee1/schulassistenz` eintragen. Dann das Plugin **schulassistenz** installieren und einen neuen Chat starten. Neue Fassungen holt Claude von dort. Eine früher direkt hochgeladene Fassung („Von dir“) vorher über „…“ entfernen.

Ohne GitHub: die Datei `schulassistenz.plugin` speichern und unter **Plugins** → „Hinzufügen“ hochladen. Updates musst du dann selbst neu hochladen.

Am besten nutzt du Claude in der Desktop-App mit Zugriff auf einen Ordner deines Rechners. Dann kann Claude Dateien direkt in deinen Datenordner schreiben. Ohne Ordnerzugriff bekommst du die Dateien zum Herunterladen.

## 3. Schulprofil anlegen (Claude fragt dich ab)

Schreibe in Claude: **„Richte schulassistenz ein.“**
Claude fragt in vier kurzen Runden nach Schule und Rahmen (Bundesland, Schulform, Fächer, Jahrgänge), Bewertung (Notenskala, Notenschlüssel, Gewichtung), Vorlagen und Layout, Ablage und Werkzeuge. Was du nicht weißt, bleibt leer, dann gilt ein neutraler Standard.

- **Datenordner wählen:** ein Ordner nur für schulassistenz, z. B. `Dokumente\Schule\schulassistenz` oder ein Ordner in der Dienst-Cloud, wenn die Schulleitung das so festlegt.
- **Schülerdaten getrennt ablegen (optional):** Akten, Kürzellisten und Ausgaben mit Schülerbezug können auf dem Schulserver liegen (z. B. IServ „Eigene“: die Startseite greift über den Schulassistenz-Helfer zu, Claude über ein Netzlaufwerk), der Rest im Datenordner. Sie brauchen nur wenige KB je Lerngruppe. Anleitung: Startseite, Abschnitt „Schülerdaten auf dem Schulserver“.
- **Gruppenordner der Schule lesen (optional):** Schuleigene Arbeitspläne, Vorlagen und Fachgruppenmaterial aus den Gruppenordnern des Schulservers (z. B. IServ „Gruppen“) nur lesend nutzen: „Material suchen“ durchsucht sie über den Schulassistenz-Helfer ab 0.5, Claude liest sie über ein Netzlaufwerk und fasst z. B. den Arbeitsplan fürs Planen zusammen. Dort wird nie etwas geändert. Anleitung: Startseite, Abschnitt „Gruppenordner der Schule“.
- **Vorlagen deiner Schule** (Briefkopf, ILE-Bogen, Zeugnisformular, Notenschlüssel, Logo) kannst du hochladen. Claude übernimmt Aufbau und Formulierungen ins Profil.

Claude legt dabei in deinem Datenordner an:
```
<Datenordner>/
  profil/profil.md            dein Schulprofil
  werkzeuge/startseite/       Knöpfe und deine Einstellungen
  werkzeuge/pseudonymisierer/ Pseudonymisierer + Kürzelliste-Vorlage
  lerngruppen/  planung/  ausgaben/
```

## 4. Startseite öffnen und Einrichtungs-Checkliste abarbeiten

Den Schulassistenz-Helfer in **Chrome oder Edge** laden (siehe `werkzeuge/iserv-helfer/Anleitung.md`) und auf sein Symbol klicken: Das öffnet die Startseite. Oben steht die Checkliste **„Einrichtung auf diesem PC“**. Sie zeigt, was noch fehlt, und verschwindet, wenn alles erledigt ist. Unten holt „Einrichtung prüfen“ sie zurück.

Pflicht:
1. **Browser:** Chrome oder Edge.
2. **Dateien:** `kacheln.js` und `meine-einstellungen.js` liegen in `werkzeuge/startseite/`.
3. **Datenordner verbinden:** einmal rechts auf „Datenordner verbinden“ klicken und den Ordner erlauben.
4. **Profil:** `profil/profil.md` ist vorhanden (aus Schritt 3).
5. **Lerngruppen und Kürzellisten** (erst nach Freigabe der Schulleitung, im Profil `regeln.ki_freigabe_schulleitung: erteilt`): Mit „Neue Lerngruppe“ legst du je Kurs einen Ordner mit Akten an (z. B. `7b-deutsch`, Kürzel D01 … D28). Dann trägst du in `kuerzellisten/Kuerzelliste-<lerngruppe>.xlsx` **selbst** die Namen neben die Kürzel ein. Diese Liste lädst du nie hoch. Die Startseite liest sie nur lokal.

Optional:
6. **Schulassistenz-Helfer** (für IServ und WebUntis): Browser-Erweiterung, die Mails und Messenger-Nachrichten pseudonymisiert an Claude gibt, die Namen in der Antwort wieder einsetzt und für die Fehlzeiten-Ampel der Startseite den Abwesenheiten-Export aus WebUntis holt. Bitte Claude: „Stell mir den Schulassistenz-Helfer bereit“. Dann in `chrome://extensions` den Entwicklermodus einschalten, „Entpackte Erweiterung laden“, den Ordner `iserv-helfer` wählen. Die Kürzellisten bekommt er ab 0.28 automatisch von der Startseite. Für Stundenplan und Kalender auf der Startseite zusätzlich unter „Details“ **„Zugriff auf Datei-URLs zulassen“**.
7. **Stundenplan:** auf der Startseite unter „Stundenplan“ deinen persönlichen iCal-Link aus WebUntis (o. Ä.) eintragen oder eine `.ics`-Datei hineinziehen. Der Link enthält einen persönlichen Schlüssel: Er bleibt nur in deinem Browser, gib ihn nie an Claude oder andere weiter.
8. **Schulkalender:** „IServ verbinden“ oder einen Kalender-Link (`.ics`) ergänzen. Ein Filter zeigt nur Termine, die deine Jahrgänge, Klassen und Fächer betreffen.

Was in Dateien steht, wandert mit dem Datenordner auf andere PCs. **Weiterer PC (Windows):** Wenn der Datenordner dort angekommen ist, `Neuer-PC-einrichten.cmd` im Datenordner doppelklicken. Es richtet Updates ein, verbindet IServ als Laufwerk und führt durch das Laden des Helfers. Auf der Startseite übernimmst du danach mit einem Klick die Einstellungen des anderen PCs (Kalender, Filter, Favoriten, Sitzpläne, WebUntis- und LEB-Zuordnungen, Kürzel für Kolleg:innen). Neu nötig sind dann nur noch die Datenordner-Freigabe im Browser und der iCal-Link, weil er einen persönlichen Schlüssel enthält und nie in eine Datei kommt.

## 5. Was das Plugin kann

| Bereich | Skill | Beispielauftrag |
|---|---|---|
| Kern | schulprofil | „Passe den ILE-Bogen meiner Schule an“ |
| Kern | dokument-analyse | Zeugnis oder Förderplan hochladen: „Lies das für die Akte aus“ |
| Kern | lernstandsakte | „Was ist zu M07 gespeichert?“ |
| Planen | unterricht-planen | „Plane eine Doppelstunde Fotosynthese, 7b“ |
| Planen | einheit-planen | „Plane die Einheit Bruchrechnung bis zur Klassenarbeit“ |
| Planen | exkursion-planen | „Plane einen Unterrichtsgang der 8a ins Schülerlabor: Anfahrt, Kosten, Antrag, Elternbrief“ |
| Material | material-gestalten | „Mach daraus ein Arbeitsblatt mit Hilfekarten“ |
| Material | plakat-gestalten | „Mach aus meiner Skizze eine Bildfolge in 4 Bildern“ oder „Lernplakat A3 zum Wasserkreislauf“ |
| Material | materiallager | Startseite „Material suchen“, oder Screenshots hochladen: „Sortier das in die Einheit Redoxreihe ein“ |
| Fördern | lernplan-erstellen | „Mach aus der Klausur Lernpläne für 10-ma-e“ oder „Lernplan für M07“ |
| Bewerten | pruefung-entwerfen | „Entwirf eine Klassenarbeit mit Erwartungshorizont“ |
| Bewerten | pruefung-korrigieren | Scans hochladen: „Korrigiere nach dem Erwartungshorizont“ |
| Bewerten | beobachtung-dokumentieren | Live-Raster auf der Startseite oder „Notiz zu D04: …“ |
| Berichten | zeugnis-vorbereiten | „Notenvorschläge und Tischvorlage für die Zeugniskonferenz“ |
| Berichten | elterngespraech-vorbereiten | „Bereite das Elterngespräch zu D12 vor“ |
| Kommunikation | postfach-assistent | Mails per Schulassistenz-Helfer: „Sortiere und entwirf Antworten“ |
| Verwaltung | verwaltungsassistent | Fehlzeiten-Export: „Wer braucht eine Erinnerung?“ |
| Selbstmanagement | wochenplaner | Startseite „Woche planen“ |

Die Knöpfe der Startseite schicken diese Aufträge mit Platzhaltern an Claude. Eigene Skills kannst du als zusätzliche Knöpfe in `meine-einstellungen.js` eintragen lassen.

## 6. Regeln, die immer gelten

- **Vor jedem Upload mit Schülerbezug** den Pseudonymisierer nutzen (`werkzeuge/pseudonymisierer/Pseudonymisierer.html`, läuft offline): Word- und Textdateien werden über die Kürzelliste ersetzt, Scans und Handschrift geschwärzt.
- **Namen zurück** kommen nur lokal: per Serienbrief oder im Reiter „Rückweg“ des Pseudonymisierers.
- **Alles sind Entwürfe.** Claude schreibt erst nach deiner Freigabe in Akten und verschickt nichts.
- **Keine sensiblen Daten** wie Diagnosen, Gesundheit, Religion oder Herkunft in die Akten. Jede Akte hat ein Löschdatum aus deinem Profil.

## Bilder mit ComfyUI (optional)

Für Bildkarten, Wortspeicher- und Situationsbilder kann Claude Bilder **lokal auf deinem PC** erzeugen, wenn dort ComfyUI läuft. Versuchsskizzen, Schaltungen, Querschnitte und Diagramme zeichnet Claude weiterhin selbst, weil KI-Bilder dabei Details erfinden.

1. **ComfyUI Desktop** installieren (NVIDIA-Grafikkarte mit mind. 8 GB sinnvoll). Unter „Vorlagen“ die Text-zu-Bild-Vorlage **FLUX.2 [klein] 4B** öffnen, den **Distilled**-Knoten aktivieren (Strg + B, Base-Knoten und dessen Save-Image ausschalten), fehlende Modelle laden, bei `vae_name` `flux2-vae.safetensors` wählen, mit Run testen und den Workflow als **`bildkarte-klein`** speichern.
2. **Node.js** installieren: PowerShell öffnen, `winget install OpenJS.NodeJS.LTS`, danach PowerShell neu öffnen und mit `node -v` prüfen.
3. **Claude ganz beenden** (Taskleiste → Claude-Symbol → Beenden). Dann in der Claude-App unter Einstellungen → Desktop-App → Lokale MCP-Server → **Konfiguration bearbeiten** die Datei `claude_desktop_config.json` im Editor öffnen und direkt hinter die erste `{` einfügen (mit Komma am Ende, sonst nichts ändern):
   ```
     "mcpServers": {
       "comfyui": {
         "command": "cmd",
         "args": ["/c", "npx", "-y", "comfyui-mcp@0.16.0"],
         "env": { "COMFYUI_URL": "http://127.0.0.1:8188" }
       }
     },
   ```
   Am besten bei beendetem Claude bearbeiten, sonst kann Claude den Eintrag beim Beenden überschreiben.
4. ComfyUI starten, Claude starten. Unter „Lokale MCP-Server“ steht dann `comfyui` mit „Läuft“. Test im Chat: „Erzeuge eine Bildkarte: ein Igel.“

Der Server gehört bewusst nicht ins Plugin: Server aus Plugins laufen in Claudes Cloud-Umgebung und erreichen dein ComfyUI nicht. Ohne ComfyUI setzt Claude Platzhalter mit einem Prompt-Vorschlag. Es werden nur Modelle genutzt, die du selbst installiert hast.

## Updates

**Skills:** kommen über den Marketplace von selbst (siehe Abschnitt 2). Falls Claude eine neue Fassung nicht sofort zeigt: beim Marketplace schulassistenz auf „Aktualisieren“ (Update) klicken.

**Startseite, Schulassistenz-Helfer, Pseudonymisierer (Windows):** Im Datenordner liegt `werkzeuge\updater\`. Einmal je PC `einrichten.cmd` doppelklicken. Danach holt der PC bei jeder Anmeldung und alle zwei Stunden die neueste Fassung aus GitHub und ersetzt nur geänderte Dateien. Der Schulassistenz-Helfer lädt sich danach selbst neu (offene IServ-Tabs einmal mit F5 neu laden). Dein Profil, deine Akten, Kürzellisten und `meine-einstellungen.js` werden nie ersetzt. Eigene Ausnahmen trägst du in `werkzeuge\updater\nicht-ersetzen.txt` ein (eine Datei je Zeile, z. B. `werkzeuge/abschluss-check/Abschluss-Check.html`). Den Ordner `updater` gibt es auf GitHub unter `updater/`, falls er dir noch fehlt: dann alle Dateien daraus nach `<Datenordner>\werkzeuge\updater\` legen.

Ohne den Updater: Schreibe nach einem Update „Aktualisiere die Werkzeuge im Datenordner“.

## Lizenzen

Schriften im Skill plakat-gestalten: SIL Open Font License 1.1. Einzelne Gestaltungsregeln angelehnt an anthropics/skills (Apache License 2.0). Einzelheiten in der Datei NOTICE.
