---
name: "schulprofil"
description: "Legt das Schulprofil der Lehrkraft an, liest es, passt hochgeladene Schulvorlagen (ILE-Bogen, Zeugnisformular, Briefkopf, Anträge) an und füllt sie als Word-Datei. Jeder schulassistenz-Skill fragt zuerst hier nach. Auch für die Datenschutz-Checkliste beim ersten Start."
---

# Schulprofil

Das Schulprofil sagt allen Skills des Plugins **schulassistenz**, wie die Schule der Lehrkraft arbeitet: Rahmen, Bewertung, Vorlagen, Layout, Ablage und Regeln. So funktioniert jeder Skill für jedes Fach, jede Schulform und jede Zielgruppe, ohne umgeschrieben zu werden.

Das Profil enthält **keine Schülerdaten**. Es darf deshalb im Kollegium geteilt werden.

## Wann dieser Skill läuft

1. **Erster Start:** Es gibt noch kein Profil. Dann Einrichtung (Abschnitt 2) und Datenschutz-Checkliste (Abschnitt 6).
2. **Abfrage durch andere Skills:** Ein Aufgaben-Skill braucht z. B. Notenschlüssel oder Layout. Dann Profil lesen (Abschnitt 3).
3. **Vorlage hochgeladen:** dokument-analyse hat eine leere Schulvorlage erkannt, oder die Lehrkraft lädt eine hoch. Dann Vorlage adaptieren (Abschnitt 4).
4. **Änderung:** Die Lehrkraft will etwas umstellen („wir haben einen neuen Notenschlüssel“).
5. **Startseite:** „Startseite einrichten“, oder ein neuer eigener Skill braucht einen Knopf (Abschnitt 2b).

## 1. Ablage

Das Profil liegt im Datenordner der Lehrkraft unter `profil/`:

```
<Datenordner>/
  Schulassistenz-Start.html  Startseite mit Knöpfen für alle Aufgaben (Abschnitt 2b)
  profil/
    profil.md          Einstellungen (Aufbau siehe Abschnitt 5)
    vorlagen/          Platzhalter-Fassungen (*.docx), Feldbeschreibungen (*.felder.md)
      original/        unveränderte Originale der Schule
    layout/            Logo, Schriften, Beispielseiten
  werkzeuge/
    pseudonymisierer/  lokales Werkzeug zum Pseudonymisieren und Schwärzen (Abschnitt 2a)
    startseite/        kacheln.js, meine-einstellungen.js, Anleitung.md (Abschnitt 2b)
```

Den Datenordner legt die Lehrkraft beim Einrichten fest (lokal, Dienst-Cloud oder Schulserver). Er steht in `profil.md` unter `ablage.datenordner`. Ist noch keiner festgelegt, fragen und nichts auf Verdacht anlegen.

**Schülerdaten-Ordner.** Daten mit Schülerbezug (`lerngruppen/`, `kuerzellisten/`, `ausgaben/`, `archiv/`) können getrennt vom Datenordner liegen, z. B. auf dem Schulserver (IServ „Eigene“, Anleitung der Startseite). Dann steht der Ort in `ablage.schuelerdaten` als Laufwerkspfad, über den Claude liest und schreibt (z. B. `I:\schulassistenz-daten`; die Lehrkraft verbindet IServ als Netzlaufwerk und gibt den Ordner in der Claude-App frei), und in `ablage.schuelerdaten_web` die WebDAV-Adresse für die Startseite (z. B. `https://<server>/webdav/Files/schulassistenz-daten`; der Browser liest sie über den IServ-Helfer ab 0.4, weil Chrome Netzlaufwerke nicht öffnet). In `meine-einstellungen.js` steht unter `schuelerdaten` die Web-Adresse. **Für alle Skills gilt:** Ist `ablage.schuelerdaten` gesetzt, liegen diese vier Ordner dort; jede Pfadangabe `<Datenordner>/lerngruppen/…`, `kuerzellisten/…`, `ausgaben/…` oder `archiv/…` in einem Skill meint dann diesen Ort. Profil, Werkzeuge, Planung und Material bleiben im Datenordner. Der Speicher dort ist oft knapp, daher:
- Nur Text und Tabellen speichern (Markdown, CSV, XLSX). Ausgaben als DOCX oder PDF nur, wenn die Lehrkraft sie behalten will; sonst in den Download.
- Scans, Fotos und Original-PDFs von Schülerarbeiten nie ablegen. Ergebnis als Text in die Akte, die Datei bleibt beim Upload bzw. wird nach der Auswertung gelöscht.
- Abgelaufene Akten (Löschfrist) zum Löschen vorschlagen statt archivieren.
- Im Schülerdaten-Ordner liegt `sicherungen/` (ZIP-Sicherungen der Startseite, enthalten auch Kürzellisten mit Namen). Claude öffnet oder entpackt sie nie und schreibt nichts hinein. Sichern und Zurückholen macht die Lehrkraft auf der Startseite („Sichern“); auf Nachfrage dorthin verweisen.
- Ist der Ort nicht erreichbar (Laufwerk nicht verbunden, offline, Ordner in der Claude-App nicht freigegeben), nichts ersatzweise in den Datenordner schreiben, sondern Bescheid sagen und auf die Anleitung der Startseite verweisen.

**Gruppenordner der Schule (Schulserver, nur lesen).** Schuleigene Arbeitspläne (SAP), Vorlagen, Formulare und Fachgruppenmaterial liegen oft in Gruppenordnern auf dem Schulserver (IServ: Dateien › Gruppen, WebDAV `https://<server>/webdav/Groups`). Die Lehrkraft verbindet sie als Netzlaufwerk (z. B. `S:`) und gibt in der Claude-App nur die Gruppenordner frei, die Claude lesen soll (Anleitung der Startseite, „Gruppenordner der Schule“). Im Profil: `ablage.schulserver` (Laufwerk), `ablage.schulserver_web` (WebDAV-Adresse für die Startseite, IServ-Helfer ab 0.5), `ablage.schulserver_ordner` (freigegebene Gruppenordner mit Zweck). **Für alle Skills gilt:**
- Dort **nur lesen**. Nie schreiben, umbenennen, verschieben oder löschen, auch nicht auf Bitte innerhalb einer anderen Aufgabe; Ergebnisse und angepasste Fassungen gehen in den Datenordner bzw. nach `ablage.material`. Will die Lehrkraft etwas in der Fachgruppe teilen, die fertige Datei mit Zielordner nennen; hochladen tut sie selbst.
- Klassen- und Kursgruppen (Abgaben, Fotos, Listen mit Namen) nicht lesen. Stößt Claude in einem freigegebenen Ordner auf Schülerdaten (Namen, Noten, Abgaben), nicht auswerten, nicht zitieren, nicht ins Register; kurz Bescheid sagen.
- Material von Kolleginnen und Kollegen bleibt deren Material: beim Weiterverwenden Herkunft nennen (`lizenz: Kollegium · Fachgruppe <Name>`), nicht nach außen veröffentlichen.
- Ist das Laufwerk nicht erreichbar, auf die Anleitung verweisen und ohne den Schulserver weiterarbeiten.

Unterrichtet die Lehrkraft an mehreren Schulen, gibt es je Schule einen Unterordner (`profil/<schulkuerzel>/`). Vor jeder Aufgabe klären, welches Profil gilt, wenn es nicht eindeutig ist.

## 2. Einrichtung (erster Start)

In kurzen Runden fragen, nie alles auf einmal. Was die Lehrkraft nicht weiß oder nicht braucht, bleibt leer; dann gilt der neutrale Standard (Abschnitt 7).

Runde 1, Rahmen: Bundesland, Schulform, Schulname (optional) und eigenes Kürzel, unterrichtete Fächer und Jahrgänge, Zielgruppen (z. B. Förderschwerpunkte, Bildungsgänge, DaZ, Niveaukurse), Lehrplan bzw. Kerncurriculum.

Runde 2, Bewertung: Notenskala je Stufe, Notenschlüssel (Prozentgrenzen) je Fachgruppe, Rundungsregel, Gewichtung schriftlich zu mündlich, Operatorenliste, ob Klassenarbeiten mit Schüler-Code statt Namen geschrieben werden.

Runde 3, Vorlagen und Layout: „Hast du Vorlagen deiner Schule, die das Plugin füllen soll? Zum Beispiel Briefkopf, ILE-Bogen, Zeugnisformular, Förderplan, Protokollvorlage, Anträge an die Schulleitung.“ Jede hochgeladene Vorlage nach Abschnitt 4 verarbeiten. Dazu Logo, Schrift, Fachfarben, Sonderregeln (z. B. Grundschrift in der Primarstufe).

Runde 4, Ablage und Werkzeuge: Datenordner, Ablagemuster für fertiges Material, Gruppenordner auf dem Schulserver (welche, wofür; Abschnitt 4b), Lernplattform, Schul-KI, Schulsoftware für Exporte.

Runde 5, Regeln: Löschfrist für Schülerdaten, Stand der Freigabe durch die Schulleitung (Abschnitt 6).

Am Ende eine Zusammenfassung zeigen, Bestätigung einholen und erst dann `profil.md` schreiben.

**Vorhandene Dokumente nutzen:** Lädt die Lehrkraft eine alte Klausur, ein Arbeitsblatt oder einen Elternbrief hoch, Werte daraus vorschlagen (Notenschlüssel vom Deckblatt, Farben und Logo aus dem Layout) statt sie abzufragen. Immer bestätigen lassen.

## 2a. Pseudonymisierer bereitstellen

Fester Bestandteil von schulassistenz. Der Ordner `werkzeuge/pseudonymisierer/` dieses Skills enthält `Pseudonymisierer.html` (läuft offline im Browser, nichts verlässt den Rechner), `Kuerzelliste-Vorlage.xlsx` und `Anleitung.md`.

- Sobald der Datenordner feststeht (Runde 4), die drei Dateien nach `<Datenordner>/werkzeuge/pseudonymisierer/` kopieren und in zwei Sätzen erklären: Vor jedem Upload mit Schülerbezug Dokumente dort pseudonymisieren (Word, Text) oder schwärzen (Scans, Fotos, Handschrift); Ergebnisse mit Kürzeln dort im Reiter „Rückweg“ wieder mit Namen füllen. Die Kürzelliste legt die Lehrkraft aus der Vorlage an und lädt sie nie hoch.
- Kann Claude nicht in den Datenordner schreiben, die drei Dateien zum Herunterladen ausgeben.
- Auf Wunsch („Pseudonymisierer einrichten“) oder wenn der Ordner fehlt, erneut bereitstellen. Eine vorhandene, neuere Fassung nicht ungefragt überschreiben.
- In die Datenschutz-Checkliste (Abschnitt 6) gehört der Hinweis, dass Dokumente vor dem Upload mit diesem Werkzeug pseudonymisiert werden.

## 2b. Startseite bereitstellen

Fester Bestandteil von schulassistenz. Der Ordner `werkzeuge/startseite/` dieses Skills enthält `Schulassistenz-Start.html` (offline, lädt nichts nach), `kacheln.js` (Knöpfe des Plugins), `meine-einstellungen-vorlage.js` und `Anleitung.md`.

- Zusammen mit dem Pseudonymisierer einrichten (Runde 4): `Schulassistenz-Start.html` direkt in den `<Datenordner>` kopieren, `kacheln.js` und `Anleitung.md` nach `<Datenordner>/werkzeuge/startseite/`.
- `meine-einstellungen-vorlage.js` als `meine-einstellungen.js` dort ablegen und aus dem Profil füllen: `schule` (Schule, Bundesland), `datenordner` (voller Pfad), `schuelerdaten` (nur wenn gesetzt: die Web-Adresse aus `ablage.schuelerdaten_web`, sonst der Pfad), `schuelerdaten_freigabe` (offen | erteilt | nicht erteilt). Fragen: Claude im Browser (`claude: "web"`) oder in der App (`"kopieren"`)? Lerngruppen nur als Kürzel wie `10d-bio`. Keine Schülernamen.
- In zwei Sätzen erklären: Doppelklick öffnet die Startseite; Knöpfe öffnen Claude mit fertigem Auftrag oder lokale Werkzeuge. Verknüpfung auf dem Desktop anbieten (Anleitung).
- **Updates:** `kacheln.js` und `Schulassistenz-Start.html` dürfen ersetzt werden. `meine-einstellungen.js` gehört der Lehrkraft: nie ersetzen, nur gezielt ergänzen.
- **Neue Skills des Plugins** bringen ihren Eintrag in `kacheln.js` mit (Felder im Kopf der Datei; `neu_seit` auf das Datum setzen).
- **Eigene Skills der Lehrkraft:** Legt die Lehrkraft einen eigenen Skill an oder nutzt einen Skill außerhalb des Plugins regelmäßig, anbieten, einen Knopf in `SA_MEINE_KACHELN` von `meine-einstellungen.js` einzutragen: kurzer Titel aus Sicht der Lehrkraft, `bereich` passend zur Workflow-Map, `auftrag` mit Platzhaltern `{gruppe}`, `{kuerzel}`, `{thema}`, `{datum}`, ein paar Suchwörter, `neu_seit`. Kann Claude nicht in den Ordner schreiben, die geänderte Datei zum Herunterladen ausgeben.
- Ein Auftrag auf einem Knopf enthält nie Namen, nur Platzhalter.

## 3. Profil lesen (für andere Skills)

- Nur die Abschnitte lesen, die die Aufgabe braucht.
- Fehlt ein Wert, den die Aufgabe zwingend braucht (z. B. der Notenschlüssel für eine Klausur), einmal nachfragen und anbieten, ihn ins Profil zu übernehmen.
- Fehlt ein Wert, der nur Komfort ist (z. B. Logo), neutralen Standard nehmen und das im Ergebnis kurz sagen.
- Nie Werte erfinden, die nach Schule oder Bundesland unterschiedlich sind (Notengrenzen, Fristen, Formulare).

## 4. Vorlage adaptieren

Ziel: Ein späteres Ergebnis sieht aus wie das Original der Schule und benutzt dessen Kategorien und Sprache.

1. **Art bestimmen:** ILE-Bogen, Zeugnisformular, Förderplan, Lernentwicklungsbericht, Protokoll, Elternbrief, Konferenzvorlage, Notenliste, sonstiges.
2. **Struktur auslesen:** Abschnitte und Felder in ihrer Reihenfolge, je Feld: Bezeichnung, Typ (Freitext, Ankreuzen, Skala, Note, Datum, Unterschrift), erlaubte Werte bzw. Stufen (z. B. „sicher / teilweise / noch nicht“), Längenvorgabe, Pflichtfeld ja/nein.
3. **Sprache auslesen:** typische Formulierungen und Satzanfänge, Anrede, Du/Sie, Fachbegriffe der Schule. Enthält das Muster echte Schülerdaten, diese nicht übernehmen.
4. **Feldbeschreibung schreiben:** `profil/vorlagen/<name>.felder.md`, dazu das Original in `profil/vorlagen/` ablegen. Aufbau:

```markdown
---
vorlage: ILE-Bogen Jahrgang 5–6
original: ile-bogen-5-6.docx
art: ile
stand: 2026-11-14
---
## Abschnitt: Deutsch – Lesen
- feld: liest flüssig | typ: skala | werte: sicher, teilweise, noch nicht | pflicht: ja
- feld: Bemerkung Lesen | typ: freitext | max: 300 Zeichen | pflicht: nein
## Sprache
- stärkenorientiert, 3. Person („Lena liest …“), keine Fachdiagnosen
```

5. **Bestätigen lassen:** Die erkannte Struktur kurz zeigen („Ich habe 4 Abschnitte, 18 Felder und die Skala sicher/teilweise/noch nicht erkannt“). Erst nach Bestätigung in `profil.md` unter `vorlagen` eintragen.

Wo möglich, das Original-Dokument (Word, PDF-Formular) später direkt füllen statt es nachzubauen (Abschnitt 4a).

Liegt die Vorlage in einem Gruppenordner auf dem Schulserver, das Original dort lassen: In `profil/vorlagen/` kommen die Feldbeschreibung und eine Kopie des Originals (zum Füllen), im Kopf `original: <Pfad auf dem Schulserver>` und `stand` (Änderungsdatum der Datei). Beim nächsten Gebrauch das Änderungsdatum vergleichen; ist das Original neuer, anbieten, die Beschreibung zu erneuern.

## 4a. Word-Vorlagen der Schule füllen

Werkzeug: `skripte/vorlage.py` in diesem Skill (python-docx). Es arbeitet im Original: Logo, Kopf- und Fußzeile, Tabellen, Textfelder, Schriften und Ränder bleiben, nur Text wird ersetzt, auch wenn Word ihn auf mehrere Formatierungen verteilt hat. Ergebnis ist ein Word-Entwurf, den die Lehrkraft noch ändern kann (ein Formularschutz der Vorlage wird dafür aufgehoben). Für eine Prüfansicht nach PDF umwandeln (LibreOffice) und die Seite als Bild ansehen.

**Beim Aufnehmen einer Word-Vorlage (zu Abschnitt 4):**
1. Original unverändert nach `profil/vorlagen/original/` legen.
2. Art bestimmen und, wo nötig, eine **Platzhalter-Fassung** anlegen: Beispielwerte des Musters (Datum, Klasse, Zahlen, Anrede, Musterbegründung) mit `vorlage.ersetzen(original, ziel, {"Musterstadt, den 09.03.2026": "Musterstadt, den {{datum}}", …})` durch `{{name}}` ersetzen, Tabellenzellen einzeln. Feste Teile (Betreff, Rechtsgrundlage, Unterschriftsfelder, Ankreuzfelder) bleiben. Mit `vorlage.felder(ziel)` prüfen, ob alle Platzhalter da sind, und eine Probe füllen und ansehen.
3. Ein Muster mit echten Personendaten (Schülernamen, Noten Einzelner) nie als Platzhalter-Fassung übernehmen, ohne diese Daten zu entfernen. Namen von Kolleginnen und Kollegen oder der Schulleitung (z. B. in der Anrede) als Standardwert in die Feldbeschreibung, nicht fest ins Dokument.
4. Feldbeschreibung `*.felder.md` (Aufbau wie Abschnitt 4) mit Platzhaltern, Pflichtfeldern, festen Teilen, Sprache der Schule (Musterformulierungen als Vorschlag) und Ablauf (wer unterschreibt, wer informiert wird).
5. Im Profil unter `vorlagen` eintragen: `art`, bei Bedarf `anlass` (wofür genau), `datei`, `beschreibung`.

**Arten, die andere Skills suchen:**

| art | wofür | wer nutzt sie |
|---|---|---|
| `briefkopf` | jedes Schreiben der Schule: Elternbriefe, Einladungen, Erinnerungen, Anträge ohne eigenes Formular, Bescheinigungen, Protokolle | elterngespraech-vorbereiten, exkursion-planen, verwaltungsassistent, zeugnis-vorbereiten, postfach-assistent (Briefe), pruefung-korrigieren |
| `antrag` (+ `anlass`) | Formular an die Schulleitung, z. B. `anlass: unterschreitung` (Arbeit mit zu vielen schwachen Noten), `schulfahrt` | pruefung-korrigieren (10.3a), exkursion-planen |
| `elternbrief` (+ `anlass`) | festes Schreiben der Schule zu einem Anlass | wie oben |
| `ile`, `foerderplan`, `zeugnis`, `protokoll`, `sap` | wie in den jeweiligen Skills | |

**Füllen (für alle Skills):**
- Formular mit Platzhaltern: `vorlage.fuellen(datei, ziel, werte)`. Steht ein Platzhalter allein im Absatz, wird eine Liste (z. B. Begründungssätze) zu mehreren Absätzen. Meldet das Werkzeug Platzhalter ohne Wert, nachfragen statt leer lassen.
- Briefkopf: `vorlage.brief(datei, ziel, absaetze)` ersetzt den Textkörper und behält Kopf und Fuß der ersten Seite. Aufbau des Briefs nach der Feldbeschreibung (Empfänger, Ort und Datum rechts, fetter Betreff, Anrede, Text, Gruß, Unterschriftslinie).
- Kommandozeile: `python vorlage.py felder|fuellen|brief …` (Hilfe im Kopf der Datei).
- **Ohne Vorlage im Profil:** neutral im Layout des Profils (Abschnitt 7) und einmal anbieten, die Vorlage der Schule aufzunehmen.
- **Namen:** Schülernamen nie einsetzen, nur Serienbrief-Felder (`«Vorname»`) nach lernstandsakte, Abschnitt 6. Ausgefüllte Vorlagen mit Schülerbezug nach `ausgaben/`.

## 4b. Gruppenordner auswerten (Schulserver)

Auslöser: „Schau dir den Fachgruppenordner an“, „Lies unseren SAP Chemie“, Einrichtung Runde 4, oder ein Skill braucht den schuleigenen Arbeitsplan.

1. **Überblick:** Die freigegebenen Gruppenordner durchsehen (Ordner- und Dateinamen, höchstens drei Ebenen, nichts öffnen) oder `materiallager/bestand-schulserver.csv` lesen, wenn die Startseite sie angelegt hat. Kurze Übersicht je Ordner: was dort liegt (Arbeitspläne, Vorlagen, Formulare, Material nach Jahrgängen, Protokolle), was davon für die Lehrkraft nützlich ist, was Schülerdaten enthalten könnte (nicht öffnen).
2. **Vorschlag:** Welche Ordner kommen nach `ablage.schulserver_ordner`, welche Dokumente werden Vorlagen (Abschnitt 4) oder Arbeitspläne (Schritt 3), welches Material gehört ins Register des **materiallager**. Erst nach Bestätigung eintragen.
3. **Schuleigener Arbeitsplan (SAP):** Datei lesen und als `profil/vorlagen/sap-<fach>.md` zusammenfassen: je Jahrgang bzw. Halbjahr die Themen bzw. Einheiten in Reihenfolge, Stundenansatz, verbindliche Kompetenzen, Methoden- und Medienbezüge, Experimente, Leistungsnachweise (Anzahl, Art), Fachgruppenabsprachen (z. B. Bewertung, Operatoren). Wortlaut verbindlicher Vorgaben übernehmen, nichts ergänzen; Unklares mit „[im SAP prüfen]“ markieren. Im Kopf `original` (Pfad auf dem Schulserver) und `stand`. **unterricht-planen**, **einheit-planen** und **pruefung-entwerfen** lesen diese Zusammenfassung; das Original nur, wenn Details fehlen.
4. **Fachgruppenabsprachen** (Notenschlüssel, Gewichtung, Operatorenliste) aus dem Ordner als Vorschlag für Runde 2 nutzen, nie stillschweigend überschreiben.

## 5. Aufbau von profil.md

Markdown mit YAML-Kopf. Leere Werte weglassen.

```markdown
---
profil: <schulkuerzel>
stand: 2026-11-14
rahmen:
  bundesland: <z. B. Hessen>
  schulform: <z. B. Gesamtschule>
  schule: <Name oder Kürzel>
  lehrkraft_kuerzel: <Kürzel>
  faecher: [Chemie, Physik]
  jahrgaenge: [5-13]
  zielgruppen: [G-/E-Kurse, Inklusion]
  lehrplan: <Lehrplan des Landes, z. B. Kerncurricula>
bewertung:
  skala_sek1: Noten 1–6 mit Tendenzen
  skala_sek2: Notenpunkte 0–15
  notenschluessel_sek1: {1: 87, 2: 73, 3: 59, 4: 45, 5: 18}
  rundung: im Zweifel zugunsten der Schülerin / des Schülers
  schueler_code: {jahrgaenge: 5-10, format: "2 Buchstaben + 3 Ziffern, z. B. KV001"}
vorlagen:
  - {art: ile, datei: vorlagen/ile-bogen-5-6.felder.md}
  - {art: sap, fach: <Fach>, jahrgaenge: <z. B. 5-10>, datei: vorlagen/sap-<fach>.md, original: <Pfad auf dem Schulserver>}
  - {art: briefkopf, datei: vorlagen/<schule>-briefkopf.docx, beschreibung: vorlagen/<schule>-briefkopf.felder.md}
  - {art: antrag, anlass: unterschreitung, datei: vorlagen/<…>.docx, beschreibung: vorlagen/<…>.felder.md}
layout:
  standard: <Name des Layouts oder Verweis auf einen Layout-Skill>
ablage:
  datenordner: <Pfad>
  schuelerdaten: <Pfad>   # optional: Ort für lerngruppen/, kuerzellisten/, ausgaben/, archiv/ (z. B. I:\schulassistenz-daten auf dem Schulserver); leer = Datenordner
  schuelerdaten_web: <https://…/webdav/Files/…>   # optional: dieselbe Ablage als WebDAV-Adresse für die Startseite (IServ-Helfer)
  schulserver: <Laufwerk>   # optional: Gruppenordner der Schule, nur lesen (z. B. S:\ = IServ Gruppen)
  schulserver_web: <https://…/webdav/Groups>   # optional: dieselben Ordner für die Startseite (IServ-Helfer ab 0.5)
  schulserver_ordner:   # nur die freigegebenen; Klassen- und Kursgruppen nie
    - {ordner: <z. B. Fachgruppe-NaWi>, zweck: <z. B. SAP und Material NaWi>}
  material: <Ablagemuster>
  material_wurzel: <Ordner, in dem das Unterrichtsmaterial liegt>   # für materiallager
  quellen_ordner: 90_Quellen   # Wissensbasis je Einheit
  material_ausschliessen: [<Ordner ohne Unterrichtsmaterial, z. B. mit Schülerdaten>]
werkzeuge:
  lernplattform: <z. B. Edumaps, Moodle>
  schul_ki: <z. B. Paddy>
  schulsoftware_export:   # vom verwaltungsassistent beim ersten Export gemerkt
    - {software: <z. B. WebUntis>, export: <z. B. AbsencePerStudent>, format: <z. B. CSV, Tab, UTF-8>, spalten: {kuerzel: <Spalte>, datum: <Spalte>, stunden: <Spalte>, minuten: <Spalte>, grund: <Spalte>, status: <Spalte>}, status_werte: {entschuldigt: <Wert>, unentschuldigt: <Wert>, offen: <Wert>}, ignorieren: [<z. B. Externe Id, Text, Entschuldigungstext>]}
regeln:
  loeschfrist_monate: 24
  ki_freigabe_schulleitung: offen | erteilt am <Datum> | nicht erteilt
  fehlzeiten: {frist: 3, frist_einheit: schultage, frist_ab: gesundung, zaehlt_als_entschuldigt: [<z. B. Eltern telefonisch>], eltern_ab_unentsch_std: 5, schwelle_zaehlt_ab: letzte_benachrichtigung, verspaetung_zaehlt: nein}   # Werte der Schule; schwelle_zaehlt_ab: letzte_benachrichtigung | halbjahr | schuljahr
  klassenarbeit_unterschreitung: {schwelle_prozent: 30, vergleich: mehr_als, noten: [5, 6], ohne: zieldifferent, folge: <z. B. Arbeit wird nicht gewertet>, ausnahme: <z. B. Zustimmung der Schulleitung>, info_an: <z. B. Klassenelternvertretung>, quelle: <Erlass>, vorlagen: [antrag, elternbrief]}   # nur eintragen, was Land/Schule vorgeben (pruefung-korrigieren 10.3a)
  exkursionen: {erlass: <Landeserlass Schulfahrten>, antrag_frist_wochen: 4, begleitung: <Schlüssel>, kostengrenze: <…>, zahlweg: <…>, startort: <Adresse/Haltestelle>}   # Felder siehe exkursion-planen
---
Freie Hinweise der Lehrkraft (z. B. Fachgruppenabsprachen).
```

## 6. Datenschutz-Checkliste für das Gespräch mit der Schulleitung

Beim ersten Start immer anbieten, außerdem jederzeit auf Wunsch. Als druckbares Dokument (eine bis zwei Seiten) im Layout des Profils ausgeben, in `ausgaben/` ablegen. Ohne Rechtsberatung: Die Checkliste nennt die Fragen, die Schulleitung und Datenschutzbeauftragte klären, keine Antworten.

Inhalt:

**A. Was das Plugin tut**
- Unterstützt bei Planung, Material, Bewertung, Berichten und Elternarbeit. Alle Ergebnisse sind Entwürfe; die Lehrkraft prüft und entscheidet.
- Schülerdaten werden beim Eingang pseudonymisiert (Kürzel bzw. Schüler-Code statt Name). Die Zuordnung Kürzel zu Name bleibt bei der Lehrkraft und wird nicht an die KI gegeben.
- Namen kommen erst am Ende per Serienbrief auf dem Gerät der Lehrkraft ins Dokument.
- Keine Gesundheitsdaten, Diagnosen, Religion oder Herkunft in der Akte; beim Nachteilsausgleich nur die Maßnahme.
- Daten liegen als lesbare Dateien im Datenordner, jede Akte mit Löschdatum.

**B. Zu klärende Fragen**
- [ ] Ist die Nutzung des KI-Dienstes für dienstliche Zwecke erlaubt? Für welche Daten (keine Schülerdaten / nur pseudonymisierte / weitere)?
- [ ] Reicht es, Dokumente vor dem Upload lokal mit dem Pseudonymisierer zu pseudonymisieren bzw. zu schwärzen (Kürzelliste bleibt auf dem Gerät)?
- [ ] Wo darf der Datenordner liegen: Dienstgerät, Privatgerät mit Genehmigung, Dienst-Cloud, Schulserver? Dürfen die Schülerdaten (Akten, Kürzellisten) auf dem Schulserver liegen und vom Privatgerät aus geöffnet werden?
- [ ] Ist für die Verarbeitung auf einem privaten Gerät eine Genehmigung nötig, und liegt sie vor?
- [ ] Muss der Dienst ins Verzeichnis der Verarbeitungstätigkeiten der Schule aufgenommen werden?
- [ ] Gibt es einen Vertrag zur Auftragsverarbeitung bzw. eine Freigabe des Landes oder Schulträgers für den Dienst?
- [ ] Welche Löschfristen gelten für Notizen, Beobachtungen und Notenlisten?
- [ ] Müssen Eltern bzw. Schülerinnen und Schüler informiert werden?
- [ ] Welche Kategorien sind ausdrücklich ausgeschlossen (z. B. Förderdiagnostik, Kinderschutzfälle)?

**C. Ergebnis des Gesprächs**
Datum, Gesprächspartner, Entscheidungen, Auflagen. Felder zum Ausfüllen.

Nach dem Gespräch das Ergebnis in `regeln.ki_freigabe_schulleitung` eintragen. Ist die Freigabe „nicht erteilt“ oder „offen“, arbeiten die Skills nur mit Aufgaben ohne Schülerdaten (Planung, Material, Prüfungen entwerfen) und sagen das kurz, wenn eine Aufgabe Schülerdaten bräuchte.

## 7. Neutraler Standard (ohne Profil)

- Layout: schlicht, A4, serifenlose Schrift, kein Logo, eine Akzentfarbe.
- Noten: 1–6 ohne festen Schlüssel; vor jeder Bewertung den Schlüssel erfragen.
- Lehrplan: nicht annehmen, nachfragen.
- Ablage: Ergebnisse nur als Datei im Gespräch, nichts in Ordner schreiben.

## 8. Grundsätze

- Der Mensch entscheidet: Jede Änderung am Profil erst nach Bestätigung schreiben.
- Profil kurz halten: nur Werte, die ein Skill wirklich nutzt.
- Bei Widersprüchen (zwei Notenschlüssel) nachfragen, nie selbst wählen.