# Startseite von schulassistenz

Eine Seite mit Knöpfen für alle Aufgaben des Plugins. Sie läuft offline im Browser, lädt nichts aus dem Internet und schickt nichts weg. Erst wenn du auf „In Claude öffnen“ klickst, öffnet sich Claude mit dem fertigen Auftrag.

## Wo die Dateien liegen

```
<Datenordner>/
  Schulassistenz-Start.html        die Startseite (Doppelklick)
  werkzeuge/startseite/
    kacheln.js                     Knöpfe des Plugins (wird bei Updates ersetzt)
    meine-einstellungen.js         deine Einstellungen und eigenen Knöpfe (gehört dir)
    Anleitung.md                   diese Anleitung
```

Tipp: Rechtsklick auf `Schulassistenz-Start.html` → „Senden an“ → „Desktop (Verknüpfung erstellen)“. Oder die Seite im Browser als Lesezeichen speichern.

## Bedienen

- **Suchfeld:** Stichwort tippen, z. B. „Klausur“, „Eltern“, „AB“. Enter öffnet den ersten Treffer. Gibt es keinen Knopf, schickst du deinen Text direkt an Claude.
- **Live-Beobachtung:** Lerngruppe eintragen, „Starten“ (oder in der Wochenansicht auf die Stunde klicken). Es öffnet sich das Raster, siehe unten.
- **Favoriten:** Stern ★ an einem Knopf. „Zuletzt benutzt“ füllt sich von selbst.
- **Alle Werkzeuge:** in Reitern nach Arbeitsbereich. Reiter ohne Knöpfe sind ausgeblendet.
- **Blau „mit Claude“:** öffnet ein Feld für Lerngruppe, Kürzel oder Thema, zeigt den Auftrag und öffnet Claude. Steht im Kürzelfeld etwas, das wie ein Name aussieht, bleibt der Knopf gesperrt.
- **Grün „öffnet lokal“:** Pseudonymisierer öffnet sich direkt. Bei Ordnern zeigt die Seite den Pfad zum Kopieren (Explorer: Windows-Taste + E, Pfad einfügen).

## Live-Beobachtung im Raster

Braucht den verbundenen Datenordner. Das Raster zeigt jedes Kind der Lerngruppe als Kachel mit Kürzel und, falls in `kuerzellisten/Kuerzelliste-<lerngruppe>.xlsx` (oder `.csv`) eingetragen, Vorname und Anfangsbuchstabe des Nachnamens. Die Namen werden nur auf diesem Rechner gelesen und nirgends gespeichert.

- **Eintragen:** Kind antippen, dann Symbol: `++ + o -` mündliche Mitarbeit, `AV+ AV-` Arbeitsverhalten, `SV+ SV-` Sozialverhalten, `!` Auffälligkeit (später beschreiben), `*` besondere Stärke. Optional vorher eine Situation in Stichworten eintippen. Steht darin ein Name aus der Kürzelliste, nimmt die Seite den Eintrag nicht an.
- **Note:** Knopf „Note“ beim Kind öffnet ein Feld für eine Note (Test, Abfrage, Referat, Hausaufgabe, Protokoll, Sonstige Leistung), in Noten 1–6 (auch `2-` oder `2,3`) bzw. Punkten 0–15 ab Jahrgang 11. Optional ein Thema. Sie landet unter „Leistungen“ und zählt in der Notenübersicht zu „mündlich/sonstige“.
- **Fokus:** markiert die Kinder mit den bisher wenigsten Beobachtungen.
- **Rückgängig** nimmt den letzten Eintrag zurück. Der Entwurf wird laufend im Browser gesichert, auch wenn das Fenster zugeht.
- **Sitzplan anordnen:** ein Kind antippen, dann den Platz, vor den es soll. Die Reihenfolge bleibt je Lerngruppe gespeichert.
- **Stunde beenden:** Übersicht zum Prüfen. Situationen ergänzen, Einträge löschen, `!` braucht eine Beschreibung. „Freigeben und in Akten speichern“ schreibt je Kind eine Zeile in die Akte (nur Kürzel): Mitarbeit und Noten unter „Leistungen“, alles andere unter „Arbeits- und Sozialverhalten“.
- **Mit Claude auswerten:** gibt Claude nur Kürzel und Beobachtungszeilen, z. B. für mündliche Noten.

## Material suchen (Materiallager)

Die Kachel „Material suchen“ (Reiter Material) macht deine vorhandenen Materialordner durchsuchbar, ohne etwas zu verschieben oder hochzuladen. Beim ersten Mal den Ordner wählen, in dem dein Unterrichtsmaterial liegt, dann „Jetzt einlesen“. Die Seite leitet Jahrgang, Fach, Kurs, Thema und Art (Arbeitsblatt, Lösung, Prüfung, Planung, Quelle …) aus Ordner- und Dateinamen ab; Schlagworte, die Claude ins Register (`materiallager/register.csv`) schreibt, werden mit durchsucht.

- Filter für Fach, Jahrgang und Art; „nur Wissensbasis“ zeigt die Quellen der Einheiten (Ordner `90_Quellen`, Buchseiten, Literatur).
- „Ansehen“ öffnet PDFs und Bilder im Browser, Word- und PowerPoint-Dateien kommen als Kopie; zum Bearbeiten „Pfad kopieren“ und im Explorer öffnen.
- „Weiterverwenden“ gibt Claude Titel und Pfad mit, z. B. für eine Fassung auf anderem Niveau.
- „Für Claude speichern“ legt `materiallager/bestand.csv` im Datenordner an, damit Claude den Bestand ohne Suchen kennt. Nach größeren Änderungen „Neu einlesen“.
- Auch das Suchfeld oben zeigt Treffer aus dem Materiallager.
- Übersprungen werden immer der Datenordner und Ordner mit Schülerdaten (Anträge, Elternbriefe, Noten, Korrektur, Zeugnis, Protokolle …). Eigene Ausnahmen in `meine-einstellungen.js` unter `materiallager.ausschliessen`.
- Der Ordnerzugriff gilt nur in diesem Browser und muss an jedem PC einmal erteilt werden.

## Woche und Stundenplan

- **Stundenplan:** Knopf „Stundenplan“, dann den Kalender-Link (iCal) aus WebUntis einfügen (Profil → Freigaben/Abonnement). Der Link ist ein persönlicher Schlüssel. Er bleibt nur in diesem Browser gespeichert und steht in keiner Datei. Darf der Browser den Plan nicht direkt abrufen, „Datei herunterladen“ klicken und die .ics-Datei ins Feld ziehen (oder als `planung/stundenplan.ics` im Datenordner speichern).
- **Wochenansicht:** Montag bis Freitag mit deinen Stunden, Terminen und Fristen aus `planung/aufgaben.md`. Am Wochenende zeigt sie schon die kommende Woche. Klick auf eine Stunde: Lerngruppe zuordnen (einmal je Kurs), dann direkt Live-Beobachtung, Stunde planen oder Akten.
- **Termine:** Die Wochenansicht zeigt neben den Stunden alle Termine: aus der Aufgabenliste (`planung/aufgaben.md`) und aus weiteren Kalendern. Ganztägige Termine stehen oben.
- **Kalender:** Knopf „Kalender“ klappt eine Monatsansicht auf (und wieder zu). Je Tag: Zahl der Stunden, Termine, Fristen. Klick auf einen Tag zeigt alles dazu; dort kannst du auch einen Termin eintragen. Er landet in `planung/aufgaben.md`, die auch der Wochenplaner liest. Die farbigen Punkte oben blenden einzelne Kalender aus und ein.
- **Weitere Kalender** (IServ-Kalender, Schulkalender, Prüfungstermine): im Kalender auf „Kalender hinzufügen“, Namen und iCal-Link (Abo- oder Export-Link) einfügen. Der IServ-Helfer ruft WebUntis- und IServ-Kalender ab. Andere Kalender oder ohne Helfer: die .ics-Datei herunterladen und hineinziehen. Sie liegt dann in `planung/kalender/`. Links mit Schlüssel bleiben nur im Browser.
- **IServ-Kalender** (Öffentlich, Lehrer, Klausurplan, Teams, Ferien): im Kalender auf „Kalender hinzufügen“, dann „IServ verbinden“ mit der Adresse eurer IServ-Seite. Der IServ-Helfer (ab 0.3.0) holt bei jedem Öffnen alle Kalender, die du in IServ eingeblendet hast, über deine Anmeldung in diesem Browser. Bist du nicht angemeldet, sagt die Seite Bescheid. Einzelne Kalender blendest du über die farbigen Punkte aus. (CalDAV-Adressen gehen nur, wenn eure Schule das ohne extra Anmeldung erlaubt.)
- **Filter:** Schulkalender werden gefiltert (bei „Kalender hinzufügen“ je Kalender „Filter an/aus“). Sichtbar bleibt, was keinen Jahrgang nennt (schulweit) oder deine Jahrgänge, Klassen und Fächer betrifft; dazu Stichworte für „immer“ und „nie“. Knopf „Filter“ im Kalender zum Anpassen und Ausprobieren; dauerhaft in `meine-einstellungen.js` unter `kalender_filter`. „Ausgeblendete zeigen“ blendet das Weggefilterte durchgestrichen ein.
- **Namen:** Termintitel, die an Claude gehen (Woche planen, `planung/stundenplan.md`), werden geprüft. Namen aus deinen Kürzellisten und Muster wie „Elterngespräch Becker“ werden durch [Name] ersetzt.
- **Woche planen:** gibt Claude deine Stunden (nur Lerngruppen-Kürzel und Räume) und offenen Punkte mit. Ist der Datenordner mit Schreibrecht verbunden, legt die Seite außerdem `planung/stundenplan.md` für den Wochenplaner ab.

## Kürzel verknüpfen

Ein Kind in mehreren deiner Lerngruppen hat je Gruppe ein eigenes Kürzel (z. B. M07 in Mathe, N05 in NaWi). Rechts unter den Lerngruppen „Kürzel verknüpfen“: Die Seite vergleicht die Namen in deinen Kürzellisten und schlägt vor, welche Kürzel zum selben Kind gehören. Du bestätigst, und sie schreibt `lerngruppen/kuerzel-verknuepfung.md`, nur mit Kürzeln. Darüber führen Claude und die Skills (Akte, Elterngespräch, Beobachtung) die Akten eines Kindes zusammen. Von Hand verknüpfen und lösen geht dort auch. Gleiche Namen innerhalb einer Gruppe werden nicht automatisch verknüpft.

## Code-Zuordnung

Tragen Klassenarbeiten statt des Namens einen Schüler-Code (z. B. KV001), ergänze in der Kürzelliste rechts neben „Kürzel“ die Spalte **Schüler-Code** und trag die Codes ein. Rechts unter den Lerngruppen „Code-Zuordnung“ zeigt Code, Kürzel und Name (nur auf deinem Rechner) und warnt bei doppelten Codes. „Speichern“ schreibt je Lerngruppe `lerngruppen/<gruppe>/code-zuordnung.md`, nur mit Code und Kürzel. Damit trägt **pruefung-korrigieren** Korrekturergebnisse in die richtigen Akten ein. Nach Änderungen an den Codes erneut speichern.

## Akten anzeigen (Edge oder Chrome)

Rechts „Datenordner verbinden“ und den Ordner wählen, in dem die Startseite liegt. Die Seite liest dann die Lernstandsakten und zeigt je Lerngruppe die Zahl der Akten und der offenen Punkte. Klick auf eine Lerngruppe zeigt die Akten, „Mit Claude besprechen“ öffnet einen Auftrag dazu. Die Seite liest nur, sie ändert nichts. Der Browser fragt einmal je Sitzung nach („Akten anzeigen“).

Lernstandsakten gibt es erst, wenn die Schulleitung der Verarbeitung von Schülerdaten zugestimmt hat.

## Einstellungen

In `meine-einstellungen.js` (mit dem Editor öffnen):

- `claude: "web"` öffnet claude.ai im Browser. Arbeitest du mit der Claude-App, stell auf `"kopieren"`. Dann wird der Auftrag kopiert und du fügst ihn in der App mit Strg+V ein.
- `lerngruppen`: Vorschläge für das Feld Lerngruppe, z. B. `["10d-bio", "11-che"]`.
- `kuerzelliste`: wo deine Kürzelliste liegt (nur zur Anzeige).
- `SA_MEINE_KACHELN`: eigene Knöpfe. Legst du mit Claude einen neuen Skill an, trägt Claude ihn hier ein.

Keine Schülernamen in diese Dateien schreiben.

## Neue Knöpfe

Neue Skills des Plugins bringen ihren Knopf in `kacheln.js` mit. Er steht 14 Tage mit „neu“ da. Nach einem Update einfach die Seite neu laden (F5).

## Einrichtung auf einem neuen PC

Oben auf der Startseite erscheint „Einrichtung auf diesem PC“, solange etwas fehlt. „Anzeigen“ klappt die Liste auf, mit Knöpfen zum Erledigen:

- Pflicht: Edge oder Chrome, Werkzeug-Dateien gefunden, Datenordner verbunden, Schulprofil, Kürzellisten mit Namen.
- Optional: IServ-Helfer (mit „Zugriff auf Datei-URLs zulassen“), Stundenplan aus WebUntis, IServ-Kalender.

Was in Dateien steht, kommt über deinen Cloud-Speicher (z. B. OneDrive) auf andere PCs mit. Nur im Browser gespeichert und daher auf jedem PC neu nötig: Datenordner-Freigabe, iCal-Link, IServ-Verbindung, Filter-Änderungen, Sitzpläne, Favoriten, „Vor-/Nachname tauschen“. Ist alles erledigt, verschwindet der Hinweis. Unten auf der Seite holt „Einrichtung prüfen“ ihn jederzeit zurück.

## Kürzel nachschlagen

Rechts unter „Lerngruppen und Akten“ öffnet „Kürzel nachschlagen“ eine Liste aller Kürzel mit Namen aus deinen Kürzellisten. Du kannst nach Name oder Kürzel suchen und nach Lerngruppe filtern. „Akte“ öffnet die Akte, „Auch als“ zeigt verknüpfte Kürzel. Unter „Kürzellisten-Dateien“ findest du die Pfade zum Bearbeiten in Excel. Die Namen werden nur auf diesem Rechner angezeigt und gehen nie an Claude.

## Notenübersicht: Noten eintragen und korrigieren

„Noten bearbeiten“ schaltet die Übersicht zum Eintragen um.

- **Korrigieren oder streichen:** eine Note antippen, richtige Note und optional einen Grund eingeben. Die alte Zeile bleibt in der Akte stehen und bekommt den Status `ersetzt <Datum>` (bzw. `gestrichen <Datum>`), sie erscheint durchgestrichen und zählt nicht mehr. Die korrigierte Note steht direkt darunter, mit dem Datum der alten Note und dem Vermerk „Korrektur …, ersetzt Eintrag vom …“.
- **+ Note:** neue Note für ein Kind (Mitarbeit, Klausur mit Nr., Test, Abfrage, Referat …, Datum, Bemerkung).
- **Für alle eintragen:** eine Spalte für die ganze Gruppe, z. B. Klausur 2. Werte eintippen, Enter springt zum nächsten Kind, leere Felder werden übersprungen.
- Alle Änderungen sind erst ein Entwurf (orange, bleibt in diesem Browser). Erst **In Akten speichern** schreibt sie, nur mit Kürzeln. Einzelne Änderungen nimmst du mit ✕ zurück.

## Skala im Live-Raster

Oben im Raster wählst du unter „Mitarbeit als“ zwischen Symbolen (++ bis --), Noten 1–6 und Punkten 0–15. Die Wahl gilt je Lerngruppe und bleibt in diesem Browser gespeichert. Voreingestellt sind Punkte ab Jahrgang 11, sonst Symbole. Wer es dauerhaft festlegen will, trägt in meine-einstellungen.js z. B. `live_skala: { "13-che-ea": "np", "10d-inf": "note" }` ein. In den Akten steht dann `MM ++`, `MM Note 2` oder `MM 12 NP`.

## Termine in Outlook

Im Kalender (Knopf „Kalender“) erzeugt „Für Outlook“ die Datei „Schulassistenz-Termine.ics“: gefilterte Kalendertermine plus Termine und Fristen aus der Aufgabenliste, ohne Stundenplan, von heute bis in 6 Monaten, Schülernamen durch [Name] ersetzt. In Outlook doppelklicken oder „Kalender hinzufügen“ → „Aus Datei hochladen“. Das ist ein Stand von heute, nicht automatisch aktuell.

Automatisch aktuell geht nur ungefiltert: Die ICS-Links einzelner IServ-Kalender (in IServ beim Kalender „Link-Freigabe“) in Outlook unter „Kalender hinzufügen“ → „Aus dem Internet abonnieren“ eintragen. Outlook aktualisiert sie dann selbst, alle paar Stunden.

## Schülerdaten sichern

Rechts bei den Lerngruppen „Sichern“ (oder Kachel „Schülerdaten sichern“ unter Verwaltung). Gesichert werden `lerngruppen/`, `kuerzellisten/`, `ausgaben/` und `archiv/` aus dem Schülerdaten-Ordner. Akten mit abgelaufener Löschfrist kommen nicht in die Sicherung.

1. **Kopie auf dem Server:** „Jetzt sichern“ legt eine ZIP-Datei in `sicherungen/` im Schülerdaten-Ordner ab (bei IServ also auf IServ) und prüft sie. Schützt vor versehentlichem Löschen oder Überschreiben. Es bleiben die neuesten 4; ältere schlägt die Seite zum Löschen vor.
2. **Datei zum Mitnehmen:** Mit Passwort (mind. 10 Zeichen) verschlüsselt (AES-256). Für einen USB-Stick oder einen Ort, den die Schulleitung erlaubt, nicht für einen privaten Cloud-Speicher. Öffnen lässt sie sich nur auf der Startseite („Sicherungsdatei öffnen“). Ohne Passwort ist sie verloren. Ältere Dateien auf dem Stick löschen, eine aktuelle reicht.

**Zurückholen:** Bei einer Sicherung „Ansehen / zurückholen“. Die Seite zeigt, welche Dateien heute fehlen oder anders sind. „Fehlende zurückholen“ ergänzt nur, „Auch geänderte ersetzen“ überschreibt nach Rückfrage. Vorher sichert sie den heutigen Stand automatisch (`vor-wiederherstellung-….zip`). Dateien mit abgelaufener Löschfrist werden nie zurückgeholt.

**Erinnerung:** Ist die letzte Sicherung 7 Tage alt, erscheint oben ein Hinweis mit „Jetzt sichern“ und „Morgen erinnern“. Das Protokoll steht in `sicherungen/protokoll.md` (nur Datum, Ziel, Dateiname). Ändern in `meine-einstellungen.js`: `sicherung_tage: 7` (0 = aus), `sicherung_behalten: 4`.

## Schülerdaten auf dem Schulserver (z. B. IServ)

Akten, Kürzellisten und Ausgaben mit Schülerbezug können getrennt vom Datenordner auf dem Schulserver liegen. Profil, Planung, Werkzeuge und Material bleiben im Datenordner. Der Platzbedarf ist klein: Text-Akten und Kürzellisten brauchen je Lerngruppe etwa 20 bis 50 KB im Schuljahr. Scans von Schülerarbeiten werden nicht gespeichert.

Chrome und Edge öffnen keine Netzlaufwerke. Die Startseite greift deshalb über den **IServ-Helfer (ab 0.4)** auf IServ zu, Claude dagegen über ein **Netzlaufwerk**.

1. **Ordner anlegen:** In IServ unter Dateien › Eigene einen Ordner `schulassistenz-daten` anlegen.
2. **Startseite:** In `meine-einstellungen.js` eintragen: `schuelerdaten: "https://<eure-iserv-adresse>/webdav/Files/schulassistenz-daten"`. IServ-Helfer in `chrome://extensions` aktualisieren, Startseite neu laden, rechts „Bei IServ anmelden“ (einmal je Browser-Sitzung), dann „Erneut versuchen“.
3. **Claude:** Explorer › „Dieser PC“ rechtsklicken › „Netzlaufwerk verbinden“, Laufwerk z. B. I:, Ordner `https://<eure-iserv-adresse>/webdav/Files`, „Verbindung bei Anmeldung wiederherstellen“ anhaken, mit IServ-Daten anmelden. In der Claude-App den Ordner `I:\schulassistenz-daten` freigeben. Im Profil steht er unter `ablage.schuelerdaten`.
4. **Umziehen:** Liegen noch Akten im Datenordner, erscheint rechts „Schülerdaten umziehen“. Schritt 1 kopiert alles und vergleicht jede Datei. Vorhandenes wird nie überschrieben. Schritt 2 löscht die alte Fassung erst auf deinen Klick. Liegt der Datenordner in einem Cloud-Speicher, danach dort den Papierkorb leeren.

Ohne Internet zeigt die Seite keine Akten an, alles andere funktioniert weiter. Die Genehmigung der Schulleitung für die Arbeit am Privatgerät bleibt nötig; den neuen Speicherort der Schulleitung kurz mitteilen.
