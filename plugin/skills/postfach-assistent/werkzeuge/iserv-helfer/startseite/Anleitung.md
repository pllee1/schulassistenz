# Startseite von schulassistenz

Eine Seite mit Knöpfen für alle Aufgaben des Plugins. Sie läuft im Browser, lädt nichts aus dem Internet nach und schickt nichts weg. Erst wenn du auf „In Claude öffnen“ klickst, öffnet sich Claude mit dem fertigen Auftrag.

## Öffnen

Ab Schulassistenz-Helfer 0.9 wohnt die Startseite im Helfer: **Klick auf das Helfer-Symbol** oben rechts in Chrome (Edge). Ist sie schon offen, holt der Klick ihren Tab nach vorn. Das Helfer-Fenster für Mails öffnest du per Rechtsklick auf das Symbol („Helfer-Fenster auf dieser Seite öffnen“) oder per Rechtsklick auf der Seite.

Tipp: Das Helfer-Symbol anheften (Puzzle-Symbol › Stecknadel), dann ist es immer sichtbar.

Beim ersten Öffnen einmal den Datenordner wählen (dein Ordner `schulassistenz`, meist im OneDrive unter `#Schule`, nicht Z: oder I:) und „Bei jedem Besuch erlauben“ anklicken. Die Freigabe bleibt dann auch nach einem Neustart von Chrome.

Liegen Akten und Kürzellisten auf IServ, fragt IServ nach jedem Chrome-Start einmal nach der Anmeldung. Die Startseite öffnet dafür von selbst ein kleines Anmeldefenster, das sich danach wieder schließt. „Passwort speichern“ in Chrome erspart das Tippen.

## Wo die Dateien liegen

```
werkzeuge/iserv-helfer/startseite/   die Startseite (gehört zum Helfer, wird bei Updates ersetzt)
<Datenordner>/
  werkzeuge/startseite/
    meine-einstellungen.js         deine Einstellungen und eigenen Knöpfe (gehört dir)
```

Die Startseite liest `meine-einstellungen.js` als Text, sie führt die Datei nicht aus. Ohne Zugriff auf den Datenordner gilt die zuletzt gelesene Fassung.

Die frühere Datei `Schulassistenz-Start.html` im Datenordner wird nicht mehr aktualisiert. Beim letzten Öffnen übergibt sie ihre gespeicherten Einstellungen (Kalender, Stundenplan-Link, Favoriten, Entwürfe) an den Helfer und zeigt oben einen Hinweis auf die neue Startseite. Danach kann sie gelöscht werden.

## Bedienen

Seit Helfer 0.23 hat die Startseite drei Bereiche und ein Zahnrad. Jede Funktion steht an genau einem Ort.

- **Heute:** deine Stunden des Tages. An der laufenden bzw. nächsten Stunde steht der Knopf „● Live-Beobachtung“, daneben „Gruppe“. Darunter die Woche mit Kalender, unten der **Schnellstart** (Werkzeuge mit ★). Rechts **Als Nächstes** (die vier dringendsten Punkte, „Alle Termine ansehen“ für die ganze Liste). Ist einer Stunde noch keine Lerngruppe zugeordnet, steht dort „Lerngruppe zuordnen“.
- **Lerngruppen:** links deine Gruppen, rechts die gewählte Gruppe mit vier Reitern: **Akten**, **Noten**, **Fehlzeiten**, **Namen & Kürzel** (Namensliste, Kürzel verknüpfen, Code-Zuordnung, Kürzel nachschlagen). Oben „● Live-Beobachtung“ und „Nach LEB-online“, unten Aufträge an Claude, bei denen die Gruppe schon eingetragen ist.
- **Werkzeuge:** alle Aufträge an Claude und die Werkzeuge auf diesem Rechner (Kennzeichen „PC“) auf einer Seite, in sieben Gruppen. ★ setzt ein Werkzeug in den Schnellstart.
- **⚙ Einrichtung & Daten:** Einrichtung prüfen, Sicherung, Neu einlesen, Ordner wählen, Stundenplan-Link, Kalender, Outlook-Export, Dateien und Ordner (Schulprofil, Kürzelliste, Akten-Ordner, Ausgaben). Ein Punkt am Zahnrad heißt: hier ist etwas zu tun.
- **Suchfeld oben:** findet Werkzeuge, Lerngruppen und Kürzel (z. B. „M07“ öffnet die Akte). Umlaute dürfen als ae/oe/ue getippt werden. Enter öffnet den ersten Treffer. Findet die Suche nichts, schickst du den Text direkt an Claude.
- **Fenster** (Auftrag an Claude, Termine, Sicherung …) erscheinen mittig über der Seite. In der Lerngruppe erscheinen sie im Inhaltsbereich; nach „Schließen“ ist der Reiter wieder da.
- **Namen ändern:** Doppelklick auf einen Namen (Akten mit „Namen einblenden“, Noten, Live-Beobachtung) öffnet ein kleines Feld. Enter speichert in der Kürzelliste, Esc bricht ab. Namen stehen nur dort, deshalb ist der neue Name danach überall zu sehen. Die Kürzel ändern sich nicht.
- **Tastatur:** `/` Suche, `Esc` Fenster schließen, `Alt`+`1`/`2`/`3` Heute, Lerngruppen, Werkzeuge, `Alt`+`0` Einrichtung & Daten. Die Zurück-Taste des Browsers springt zur vorigen Ansicht; die Seite öffnet beim nächsten Mal dort, wo du warst.
- **Blau „mit Claude“:** öffnet ein Feld für Lerngruppe, Kürzel oder Thema, zeigt den Auftrag und öffnet Claude. Steht im Kürzelfeld etwas, das wie ein Name aussieht, bleibt der Knopf gesperrt.
- **Werkzeuge auf diesem PC:** Pseudonymisierer und Abschluss-Check öffnen sich als eigene Seite des Helfers. Sie sind abgeschottet: kein Netz, kein Zugriff auf andere Daten.

## Live-Beobachtung im Raster

Braucht den verbundenen Datenordner. Das Raster zeigt jedes Kind der Lerngruppe als Kachel mit Kürzel und, falls in `kuerzellisten/Kuerzelliste-<lerngruppe>.xlsx` (oder `.csv`) eingetragen, Vorname und Anfangsbuchstabe des Nachnamens. Die Namen werden nur auf diesem Rechner gelesen und nirgends gespeichert.

- **Eintragen:** Kind antippen, dann Symbol: `++ + o -` mündliche Mitarbeit, `AV+ AV-` Arbeitsverhalten, `SV+ SV-` Sozialverhalten, `!` Auffälligkeit (später beschreiben), `*` besondere Stärke. Optional vorher eine Situation in Stichworten eintippen. Steht darin ein Name aus der Kürzelliste, nimmt die Seite den Eintrag nicht an.
- **Note:** Knopf „Note“ beim Kind öffnet ein Feld für eine Note (Mitarbeit, Test, Abfrage, Referat, Hausaufgabe, Protokoll, Sonstige Leistung), in Noten 1–6 (auch `2-` oder `2,3`) bzw. Punkten 0–15 ab Jahrgang 11. Optional ein Thema. Sie landet unter „Leistungen“ und zählt in der Notenübersicht zu „mündlich/sonstige“.
- **Regler und Zahl:** Neben dem Mitarbeitsregler steht die Zahl in einem Feld. Du kannst sie auch eintippen (Noten z. B. `2,5` oder `2-`, Punkte `0–15`, Symbole `-2` bis `2` oder `++` … `--`). Der Regler springt mit. Enter trägt den Wert für dieses Kind sofort ein, sonst übernimmt „Regler eintragen“ alle geänderten auf einmal.
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
- **Weitere Kalender** (IServ-Kalender, Schulkalender, Prüfungstermine): im Kalender auf „Kalender hinzufügen“, Namen und iCal-Link (Abo- oder Export-Link) einfügen. Der Schulassistenz-Helfer ruft WebUntis- und IServ-Kalender ab. Andere Kalender oder ohne Helfer: die .ics-Datei herunterladen und hineinziehen. Sie liegt dann in `planung/kalender/`. Links mit Schlüssel bleiben nur im Browser.
- **IServ-Kalender** (Öffentlich, Lehrer, Klausurplan, Teams, Ferien): im Kalender auf „Kalender hinzufügen“, dann „IServ verbinden“ mit der Adresse eurer IServ-Seite. Der Schulassistenz-Helfer (ab 0.3.0) holt bei jedem Öffnen alle Kalender, die du in IServ eingeblendet hast, über deine Anmeldung in diesem Browser. Bist du nicht angemeldet, sagt die Seite Bescheid. Einzelne Kalender blendest du über die farbigen Punkte aus. (CalDAV-Adressen gehen nur, wenn eure Schule das ohne extra Anmeldung erlaubt.)
- **Filter:** Schulkalender werden gefiltert (bei „Kalender hinzufügen“ je Kalender „Filter an/aus“). Sichtbar bleibt, was keinen Jahrgang nennt (schulweit) oder deine Jahrgänge, Klassen und Fächer betrifft; dazu Stichworte für „immer“ und „nie“. Knopf „Filter“ im Kalender zum Anpassen und Ausprobieren; dauerhaft in `meine-einstellungen.js` unter `kalender_filter`. „Ausgeblendete zeigen“ blendet das Weggefilterte durchgestrichen ein.
- **Namen:** Termintitel, die an Claude gehen (Woche planen, `planung/stundenplan.md`), werden geprüft. Namen aus deinen Kürzellisten und Muster wie „Elterngespräch Becker“ werden durch [Name] ersetzt.
- **Woche planen:** gibt Claude deine Stunden (nur Lerngruppen-Kürzel und Räume) und offenen Punkte mit. Ist der Datenordner mit Schreibrecht verbunden, legt die Seite außerdem `planung/stundenplan.md` für den Wochenplaner ab.

## Als Nächstes

Unter dem Suchfeld zeigt der Kasten **„Als Nächstes“** alle Karten mit einem konkreten nächsten Schritt in einer Reihe zum seitlichen Scrollen (Überfälliges zuerst, rot/ocker markiert): Klassenarbeiten und Tests, Mitarbeitsnoten (alle Lerngruppen auf einer Karte, Lerngruppen mit Lücken ocker), Zeugniskonferenz, Bewertungsstopp, Elternsprechtag, Ausflüge, Prüfungen. Jede Karte hat einen Knopf für den nächsten Schritt, „Später“ (eine Woche ausblenden) und ✓ (erledigt). „Alle Termine ansehen“ öffnet die ausführliche Liste. Dort steht die Mitarbeitsnote vor jedem Bewertungsstopp und vor den großen Ferien immer als eigene Zeile (eine Zeile für alle Lerngruppen); in „Als Nächstes“ erscheint sie 3 Wochen vorher. Klassenarbeiten anderer Fächer in deiner Klasse (z. B. Deutsch in der 10d) stehen nur zur Info da. Deine eigenen Klassenarbeiten und Tests sind blau markiert („Meine“); über „Anzeigen“ kannst du auf „nur meine Lerngruppen“ oder „nur meine Klausuren und Tests“ filtern. Fächer werden auch abgekürzt und in zusammengesetzten Wörtern erkannt (Bio, Ch, Inf, NW, Mathearbeit, Bioklausur …).

Die ausführliche Liste zeigt die Termine der eingeschalteten Kalender (und aus `planung/aufgaben.md`) als Liste: erkannte Art (Klassenarbeit, Test/Referat, Zeugniskonferenz, Konferenz, Elternsprechtag, Wandertag/Exkursion, Unterrichtsfrei, Fortbildung …), die passende Lerngruppe (aus Fach, Jahrgang, Klasse und Kurs im Titel, z. B. „KA 2 MA E“ → 10-ma-e) und einen Vorschlag für den nächsten Schritt mit Knopf zur passenden Kachel. Ist eine Klassenarbeit vollständig in den Akten oder steht die Mitarbeitsnote an, führt „Nach LEB-online“ direkt zum vorausgefüllten LEB-Fenster (Speichern klickst du selbst). Bei Klassenarbeiten zählt die Seite, wie viele Akten schon „Klausur n“ enthalten. Vor den großen Ferien (mind. 5 Tage, aus dem Kalender oder `ferien` in meine-einstellungen.js) erscheint 3 Wochen vorher je Lerngruppe eine Erinnerung „Mitarbeitsnote n. Quartal vor den …ferien“ für den letzten Schultag, mit der Zahl der Kürzel, die im Quartal weniger als 2 Mitarbeitseinträge haben.

**Quartale nach Ferien:** Sind Herbst-, Weihnachts- und Osterferien bekannt, endet das 1. Quartal mit den Herbstferien, das 2. mit den Weihnachtsferien, das 3. mit den Osterferien, das 4. am 31. Juli. Steht ein Bewertungsstopp (oder Notenschluss) im Kalender (oder `bewertungsstopp: ["2027-01-15", "2027-06-18"]` in meine-einstellungen.js), endet das 2. Quartal am Bewertungsstopp zum Halbjahr und das 4. am Bewertungsstopp zum Schuljahresende; die Erinnerung kommt dann vor dem Bewertungsstopp statt vor den Weihnachts- bzw. Sommerferien. Das gilt auch für „mündlich n. Quartal“ beim Übertragen nach LEB-online. Ohne diese Ferien gelten feste Monate (Ende Oktober, Januar, April, Juli). Nur Ansicht: Es wird nichts gespeichert. Gehen Termintitel als Thema an Claude, werden Namen vorher ersetzt.

## Fehlzeiten-Ampel (WebUntis)

Kachel „Fehlzeiten-Ampel“ (Verwaltung) oder rechts unter „Fehlzeiten“. Für Klassenleitungen und Tutorinnen und Tutoren.

- **Export holen:** „Aus WebUntis holen“ (Schulassistenz-Helfer ab 0.8). Beim ersten Mal öffnet sich WebUntis. Danach holt der Helfer den Bericht mit einem Klick selbst (gleiche Klasse bzw. gleicher Kurs wie beim ersten Mal; Zeitraum bis heute). Beim ersten Mal: Dort bei „Fehlzeiten pro Schüler*in“ (pro Stunde, Zeitraum „Aktuelles Schuljahr“) auf CSV oder Excel klicken. Der Helfer übernimmt die Datei direkt, sie landet nicht im Download-Ordner. Ohne Helfer: die Datei herunterladen, hineinziehen und danach im Download-Ordner löschen (sie enthält Klarnamen). Tipp: `webuntis: "https://<schule>.webuntis.com"` in `meine-einstellungen.js` öffnet beim ersten Mal gleich eure WebUntis-Seite.
- **Was passiert:** Die Datei wird nur in diesem Fenster gelesen. Namen werden über die Kürzellisten zu Kürzeln. Namen, die in keiner Kürzelliste stehen, zeigt die Seite nur dir und lässt ihre Zeilen weg.
- **Ampel:** Rot = Eltern informieren (Schwelle aus dem Profil erreicht, gezählt ab der letzten Benachrichtigung). Gelb = Entschuldigungsfrist abgelaufen oder endet heute, oder die Schwelle wäre erreicht, wenn überfällige Stunden unentschuldigt bleiben. Grün = nichts zu tun. Regeln aus `profil/profil.md`, `regeln.fehlzeiten`.
- **„Eltern informiert …“** trägt das Datum in die Akte ein (Bereich Termine). Ab dann zählt die Schwelle neu.
- **„Stand speichern“** legt `ausgaben/fehlzeiten/fehlzeiten-<gruppe>.tsv` an, nur mit Kürzeln. Die liest auch Claude („Mit Claude abgleichen“). Abwesenheitsgründe, Texte und die Externe Id werden nie gespeichert.
- **Ferien:** Damit Ferien nicht als Schultage zählen, in `meine-einstellungen.js` eintragen, z. B. `ferien: [["2026-12-23", "2027-01-08"]]`.

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
- Optional: Schulassistenz-Helfer (mit „Zugriff auf Datei-URLs zulassen“), Stundenplan aus WebUntis, IServ-Kalender.

Was in Dateien steht, kommt über deinen Cloud-Speicher (z. B. OneDrive) auf andere PCs mit. Nur im Browser gespeichert und daher auf jedem PC neu nötig: Datenordner-Freigabe, iCal-Link, IServ-Verbindung, Filter-Änderungen, Sitzpläne, Favoriten, „Vor-/Nachname tauschen“. Ist alles erledigt, verschwindet der Hinweis. Unten auf der Seite holt „Einrichtung prüfen“ ihn jederzeit zurück.

## Kürzel nachschlagen

Rechts unter „Lerngruppen und Akten“ öffnet „Kürzel nachschlagen“ eine Liste aller Kürzel mit Namen aus deinen Kürzellisten. Du kannst nach Name oder Kürzel suchen und nach Lerngruppe filtern. „Akte“ öffnet die Akte, „Auch als“ zeigt verknüpfte Kürzel. Unter „Kürzellisten-Dateien“ findest du die Pfade zum Bearbeiten in Excel. Die Namen werden nur auf diesem Rechner angezeigt und gehen nie an Claude.

### Kürzelliste bearbeiten

Im Akten-Fenster einer Lerngruppe (Klick auf die Lerngruppe) öffnet **Kürzelliste bearbeiten** alle Kürzel der Gruppe mit Vor- und Nachname (und Schüler-Code, falls die Spalte da ist). Dort Schreibfehler korrigieren oder fehlende Namen eintragen, geänderte Zeilen werden markiert, dann **Speichern**. Die Seite schreibt direkt in deine Kürzelliste (Excel-Datei bleibt Excel-Datei, Formatierung bleibt erhalten; sonst die CSV). Kürzel selbst lassen sich hier nicht ändern, dafür gibt es „Kürzel hinzufügen“ und „Kürzel entfernen“. Dasselbe geht über „Kürzel nachschlagen“ › „Kürzellisten-Dateien“ › „Bearbeiten“. Ist die Datei gerade in Excel geöffnet, Excel vorher schließen. Die Namen bleiben auf deinem Rechner bzw. auf IServ und gehen nie an Claude.

## Notenübersicht: Noten eintragen und korrigieren

„Noten bearbeiten“ schaltet die Übersicht zum Eintragen um.

- **Korrigieren oder streichen:** eine Note antippen, richtige Note und optional einen Grund eingeben. Die alte Zeile bleibt in der Akte stehen und bekommt den Status `ersetzt <Datum>` (bzw. `gestrichen <Datum>`), sie erscheint durchgestrichen und zählt nicht mehr. Die korrigierte Note steht direkt darunter, mit dem Datum der alten Note und dem Vermerk „Korrektur …, ersetzt Eintrag vom …“.
- **+ Note:** neue Note für ein Kind (Mitarbeit, Klausur mit Nr., Test, Abfrage, Referat …, Datum, Bemerkung).
- **Für alle eintragen:** eine Spalte für die ganze Gruppe, z. B. Klausur 2. Werte eintippen, Enter springt zum nächsten Kind, leere Felder werden übersprungen.
- Alle Änderungen sind erst ein Entwurf (orange, bleibt in diesem Browser). Erst **In Akten speichern** schreibt sie, nur mit Kürzeln. Einzelne Änderungen nimmst du mit ✕ zurück.

## Nach LEB-online übertragen

Für Schulen mit LEB-online (Noten PLUS). Der Helfer füllt dort Formulare aus, **„Speichern“ klickst du immer selbst**. Er klickt nie „Löschen“ und überschreibt keine vorhandene Note ohne dein Häkchen.

1. Notenübersicht › Lerngruppe wählen › **Nach LEB-online**.
2. Unter „Was“ wählen: eine Klassenarbeit, einen Test oder ein Referat (je Datum) oder **Mündliche Note (Quartal)**. Bei der mündlichen Note wird der Durchschnitt der Mitarbeitsnoten im gewählten Quartal auf eine ganze Note gerundet. Leistungsart und Bezeichnung lassen sich ändern.
3. Vorschau prüfen, dann **Für LEB-online bereitlegen**. Die Noten liegen zusammen mit den Namen aus deiner Kürzelliste nur in diesem Browser und höchstens 12 Stunden (bis Chrome geschlossen wird).
4. In LEB-online: Noten PLUS › Klassen oder Kurse › Leistungsüberprüfungen › **Anlegen**. Oben rechts erscheint der Helfer-Kasten, „Formular vorausfüllen“ setzt Leistungsart, Datum und Bezeichnung. Gewichtung prüfen, selbst speichern.
5. Die neue Leistungsüberprüfung markieren › **Bewerten**. Der Kasten zeigt, wie viele Noten neu sind, schon stimmen oder abweichen. **Noten eintragen** füllt die leeren Felder (grün). Abweichende (gelb) bleiben, außer du setzt das Häkchen „überschreiben“. Namen, die nicht in der Kürzelliste stehen, sind rot und bleiben leer. Passen weniger als die Hälfte der Namen, ist Eintragen gesperrt (falsche Lerngruppe?).
   Sicherungen: Der Kasten liest Bezeichnung, Datum und Leistungsart dieser Leistungsüberprüfung aus der LEB-Liste. Stimmt die Bezeichnung mit dem Paket überein, steht dort „Passt“. Weicht sie ab oder passt die Leistungsart (mündlich/schriftlich) nicht, ist Eintragen gesperrt bzw. braucht ein ausdrückliches „Trotzdem“-Häkchen. Deshalb beim Anlegen „Formular vorausfüllen“ nutzen: Dann heißen beide gleich (z. B. „mündlich 2. Quartal“, „Klassenarbeit 1“).
6. Prüfen und unten selbst **Speichern** klicken. Öffnest du „Bewerten“ danach erneut, zeigt der Kasten den Abgleich.

**Direkt in LEB-online (ab Helfer 0.15):** Statt „Nur bereitlegen“ den Knopf **Direkt in LEB-online** nehmen. Dafür muss LEB-online in **einem** Tab geöffnet und angemeldet sein (seit Helfer 0.18.3): Der Helfer schaltet genau diesen Tab zur richtigen Klasse bzw. zum richtigen Kurs und öffnet keinen weiteren Tab. Bitte LEB-online nie in mehreren Tabs oder Fenstern gleichzeitig anmelden, sonst wirft LEB-online dich auf die Anmeldung zurück. Ist die Leistungsüberprüfung noch nicht angelegt, öffnet „Anlegen öffnen“ das Formular, füllt es aus und **speichert das Anlegen selbst** (ab Helfer 0.21, Gewichtung bleibt 1-fach; gibt es die Bezeichnung schon, speichert er nicht). Im selben Fenster öffnet sich danach „Bewerten“ mit den Noten. Ist sie angelegt, öffnet „Bewerten öffnen“ das Fenster und trägt die Noten sofort ein (nur leere Felder, nur bei gleicher Bezeichnung): prüfen, Speichern. Beim allerersten Mal je Lerngruppe klickst du in LEB-online einmal die passende Zeile an („Merken und weiter“). Ist die LEB-Anmeldung abgelaufen: anmelden, dann Noten PLUS › Kurse bzw. Klassen anklicken, der Helfer macht weiter.

**Bessere LEB-Note in die Akte (ab Helfer 0.19):** Steht bei einer mündlichen Quartalsnote in LEB-online eine bessere Note als in der Akte, bietet der Kasten „Bessere LEB-Noten in die Akte“ an. Der Helfer merkt sie als „Quartalsnote“ vor; in der Notenübersicht der Lerngruppe erscheint sie als ungespeicherte Änderung, „In Akten speichern“ schreibt sie in die Akte. Eine Quartalsnote legt die mündliche Note für dieses Quartal fest (statt des Durchschnitts) und zählt nicht zusätzlich in den Durchschnitt.

**Schreibweise aus LEB-online übernehmen (ab Helfer 0.20):** Bei „ähnlich geschrieben“ die Haken der richtigen Personen setzen und „Angehakte Schreibweisen in die Kürzelliste“ klicken. In der Startseite unter Akten der Lerngruppe › „Kürzelliste bearbeiten“ stehen die LEB-Schreibweisen dann schon drin (markiert); „Speichern“ schreibt sie in die Kürzelliste, „Änderungen verwerfen“ verwirft sie.

**Mit zwei Klicks (ab Helfer 0.22):** Steht eine korrigierte Klassenarbeit in den Akten, zeigt „Als Nächstes“ die Karte mit „Nach LEB-online“. Ein Klick darauf legt die Noten bereit, schaltet deinen angemeldeten LEB-Tab zur Lerngruppe, legt die Leistungsüberprüfung an und öffnet „Bewerten“ mit den Noten. Du prüfst und klickst „Speichern“. Dafür einmal in Chrome Pop-ups für LEB-online erlauben (Schloss-Symbol links in der Adresszeile › Website-Einstellungen › Pop-ups und Weiterleitungen: Zulassen).

Claude sieht dabei nichts: Die Zuordnung Name ↔ Kürzel passiert nur im Helfer in deinem Browser.

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

Chrome und Edge öffnen keine Netzlaufwerke. Die Startseite greift deshalb über den **Schulassistenz-Helfer (ab 0.4)** auf IServ zu, Claude dagegen über ein **Netzlaufwerk**.

1. **Ordner anlegen:** In IServ unter Dateien › Eigene einen Ordner `schulassistenz-daten` anlegen.
2. **Startseite:** In `meine-einstellungen.js` eintragen: `schuelerdaten: "https://<eure-iserv-adresse>/webdav/Files/schulassistenz-daten"`. Schulassistenz-Helfer in `chrome://extensions` aktualisieren, Startseite neu laden, rechts „Bei IServ anmelden“ (einmal je Browser-Sitzung), dann „Erneut versuchen“.
3. **Claude:** Explorer › „Dieser PC“ rechtsklicken › „Netzlaufwerk verbinden“, Laufwerk z. B. I:, Ordner `https://<eure-iserv-adresse>/webdav/Files`, „Verbindung bei Anmeldung wiederherstellen“ anhaken, mit IServ-Daten anmelden. In der Claude-App den Ordner `I:\schulassistenz-daten` freigeben. Im Profil steht er unter `ablage.schuelerdaten`.
4. **Umziehen:** Liegen noch Akten im Datenordner, erscheint rechts „Schülerdaten umziehen“. Schritt 1 kopiert alles und vergleicht jede Datei. Vorhandenes wird nie überschrieben. Schritt 2 löscht die alte Fassung erst auf deinen Klick. Liegt der Datenordner in einem Cloud-Speicher, danach dort den Papierkorb leeren.

Ohne Internet zeigt die Seite keine Akten an, alles andere funktioniert weiter. Die Genehmigung der Schulleitung für die Arbeit am Privatgerät bleibt nötig; den neuen Speicherort der Schulleitung kurz mitteilen.

## Gruppenordner der Schule (z. B. IServ Gruppen)

Schuleigene Arbeitspläne, Vorlagen und Material der Fachgruppen liegen oft in den Gruppenordnern auf dem Schulserver (IServ: Dateien › Gruppen). schulassistenz kann sie **nur lesen**: durchsuchen, öffnen, auswerten und als Vorlage für eigenes Material nutzen. Dort wird nie etwas geändert, verschoben oder gelöscht; Anpassungen landen immer in deinem eigenen Material.

1. **Startseite:** In `meine-einstellungen.js` eintragen:
   `schulordner: { web: "https://<eure-iserv-adresse>/webdav/Groups", laufwerk: "S:\\" },`
   Schulassistenz-Helfer ab 0.5 nötig (in `chrome://extensions` aktualisieren), Startseite neu laden. Unter „Material suchen“ dann „Gruppenordner wählen“ (Klassen- und Kursgruppen sind abgewählt, weil dort Abgaben von Schülerinnen und Schülern liegen) und „Schulserver einlesen“. Treffer tragen das Zeichen „Schulserver“; der Filter „Quelle“ trennt dein Material vom Schulserver. „Für Claude speichern“ legt zusätzlich `materiallager/bestand-schulserver.csv` an.
2. **Claude:** Explorer › „Dieser PC“ rechtsklicken › „Netzlaufwerk verbinden“, Laufwerk **S:**, Ordner `https://<eure-iserv-adresse>/webdav/Groups`, „Verbindung bei Anmeldung wiederherstellen“ anhaken, mit IServ-Daten anmelden (wie beim Laufwerk für die Schülerdaten). In der Claude-App nur die Gruppenordner freigeben, die Claude lesen soll, z. B. `S:\Fachgruppe-NaWi` und `S:\Lehrer`. Klassen- und Kursgruppen nicht freigeben. Im Profil steht das unter `ablage.schulserver`.
3. **Auf jedem PC** einmal: Netzlaufwerk verbinden und in der Claude-App freigeben; auf der Startseite „Gruppenordner wählen“ und „Schulserver einlesen“.

Gut zu wissen: Windows lädt über ein solches Laufwerk Dateien nur bis 50 MB. Größere Videos öffnest du direkt in IServ. Ohne Internet bleibt die zuletzt eingelesene Liste in der Suche, öffnen geht dann nicht.
