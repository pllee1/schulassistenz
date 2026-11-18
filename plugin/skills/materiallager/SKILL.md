---
name: materiallager
description: Materiallager von schulassistenz: eigenes Unterrichtsmaterial jedes Fachs finden, ablegen, verschlagworten und wiederverwenden; Wissensbasis (Quellen) je Einheit; hochgeladene ABs, Lösungen, Scans einsortieren. Ohne Schülerdaten.
---

# Materiallager

Teil von **schulassistenz**. Das Lager ist ein **Register** über die Materialordner der Lehrkraft: Die Ordner bleiben, wie sie sind, nichts wird ohne Auftrag verschoben oder umbenannt. Das Register sagt, was wo liegt, und macht es über Schlagworte auffindbar. Gilt für jedes Fach, jede Schulform und jede Ordnerordnung.

Arbeitet **ohne Schülerdaten**. Läuft deshalb auch ohne Freigabe der Schulleitung.

## 0. Vorher

Profil über **schulprofil** lesen:
- `ablage.material`: Ablagemuster für neues Material, z. B. `<Jahrgang>\<Kurs>\<Themenfeld>\<Nummer>_<Thema>`.
- `ablage.material_wurzel`: Ordner, in dem das Material liegt (z. B. `D:\Schule\Material`). Fehlt der Eintrag, aus `ablage.material` ableiten oder einmal fragen und ins Profil übernehmen.
- `ablage.quellen_ordner`: Name des Quellen-Ordners je Einheit (Standard `90_Quellen`).
- `ablage.material_ausschliessen`: Ordner, die nie ins Register kommen (siehe Abschnitt 6).
- `ablage.schulserver`, `ablage.schulserver_ordner`: Gruppenordner der Schule (z. B. Fachgruppe auf IServ), **nur lesen** (Regeln in **schulprofil**, Abschnitt 1).
- `rahmen`: Fächer, Jahrgänge, Lehrplan (für den Lehrplanbezug).

Fehlt ein Ablagemuster, die vorhandene Ordnerordnung ansehen, einen Vorschlag machen und nach Bestätigung über **schulprofil** speichern.

## 1. Dateien im Datenordner

```
materiallager/
  bestand.csv     erzeugt die Startseite („Material suchen“ → „Für Claude speichern“); nur lesen
  register.csv    gepflegt von diesem Skill: Schlagworte, Lehrplanbezug, Lizenz, Notizen
<Einheit>\90_Quellen\
  quellen.md      Wissensbasis der Einheit (Abschnitt 3)
```

`bestand-schulserver.csv` (von der Startseite, nur lesen): wie `bestand.csv` plus Spalte `gruppe`; `pfad` ist der volle Laufwerkspfad auf dem Schulserver (z. B. `S:\Fachgruppe-NaWi\…`).

`bestand.csv` und `register.csv`: UTF-8, Trennzeichen Semikolon, Pfade relativ zur Materialwurzel mit `\`.

- **bestand.csv:** `pfad;titel;art;fach;jahrgang;niveau;thema;stunde;wissensbasis;groesse_kb;geaendert` (aus Ordnernamen abgeleitet).
- **register.csv:** `pfad;titel;art;fach;jahrgang;niveau;thema;lehrplan;schlagworte;lizenz;notiz;stand`. Eine Zeile je Datei oder je Link (`pfad` = URL). Leere Felder übernimmt die Startseite aus dem Bestand. Schlagworte mit Komma, klein, ohne Füllwörter. `lizenz`: `eigen`, `CC BY 4.0 · Autor · Quelle-URL`, `Schulbuch · Verlag · S. 34 (nur im Unterricht)`, `unklar`.

**Art** (feste Liste, damit die Suche filtern kann): Arbeitsblatt, Lösung, Hilfekarten, Exit-Ticket, Tafelbild, Planung, Prüfung, Erwartungshorizont, Präsentation, Bild, Video, Simulation, Experiment, Quelle, Lernplattform, Material.

Nur Zeilen anhängen oder ändern, nie die Datei neu schreiben, ohne die vorhandenen Zeilen zu übernehmen. Vor dem Schreiben die aktuelle Fassung lesen.

## 2. Suchen und wiederverwenden

Auslöser: „Habe ich schon etwas zu …?“, „Such mir das AB zur Redoxreihe“, und immer, bevor **unterricht-planen**, **einheit-planen**, **material-gestalten** oder **pruefung-entwerfen** etwas neu erstellen.

1. `register.csv`, `bestand.csv` und, wenn vorhanden, `bestand-schulserver.csv` lesen; ist der Ordner verbunden und der Bestand älter als eine Woche oder fehlt er, im Materialordner selbst suchen (Ordnernamen, Dateinamen). Ohne Ordnerzugriff (z. B. im Browser-Chat): um die Datei `bestand.csv` bitten oder darum, die Startseite „Material suchen“ zu nutzen.
2. Treffer knapp zeigen: Titel, Art, Jahrgang/Kurs, Pfad, Stand; Treffer vom Schulserver mit „Schulserver · <Gruppe>“ kennzeichnen. Höchstens 8, die besten zuerst (gleiches Thema und Jahrgang > gleiches Thema anderer Jahrgang > verwandtes Thema). Wissensbasis der Einheit (`quellen.md`) zuerst nennen, wenn es sie gibt.
3. Anbieten: so verwenden, anpassen (anderes Niveau, anderer Jahrgang, kürzer, differenziert) mit **material-gestalten**, oder neu erstellen. Entlastung vor Perfektion: Vorhandenes zuerst.
4. Inhalte nur lesen, wenn die Lehrkraft es will oder für die Anpassung nötig ist (PDF/DOCX/PPTX-Text auslesen).

**Material vom Schulserver:** Gleichrangig mit eigenem Material suchen, wenn `ablage.schulserver` gesetzt ist; dort nur lesen. Anpassen heißt immer: neue Datei im eigenen Material (`ablage.material`), Herkunft im Register (`lizenz: Kollegium · Fachgruppe <Name>`, `notiz: Vorlage <Pfad auf dem Schulserver>`). Ins Register darf eine Zeile mit dem Schulserver-Pfad (voller Laufwerkspfad), um Schlagworte zu vergeben; die Datei selbst bleibt unverändert. In `quellen.md` einer Einheit Schulserver-Material verlinken, nicht kopieren.

## 3. Wissensbasis einer Einheit

Für jede Einheit gibt es im Ordner der Einheit einen Quellen-Ordner (`ablage.quellen_ordner`, Standard `90_Quellen`). Dort liegt alles, was als **Materialquelle** dient: Buchseiten, Fremdmaterial von Kolleginnen und Kollegen, Kerncurriculum-Auszug, Fachtexte, Paper, Fotos von Tafelbildern, hochgeladene Arbeitsblätter und Lösungen, Linklisten.

`quellen.md` ist das Inhaltsverzeichnis der Wissensbasis:

```markdown
---
einheit: Donator-Akzeptor-Prinzip
fach: Naturwissenschaften
jahrgang: 10
kurs: E-Kurs
lehrplan: KC Naturwissenschaften IGS Nds., Basiskonzept Chemische Reaktion
stand: 2026-11-15
---
## Quellen
- 2026-11-15 | Buchseiten S. 112–125 Redoxreihe | Datei: 90_Quellen\Buch_S112-125_Redoxreihe.pdf | Schulbuch · Verlag (nur im Unterricht) | Kern: Metalle nach Edelheit ordnen, Verdrängungsreaktionen
- 2026-11-15 | AB Elektrolyse (von Kollegin) | Datei: 90_Quellen\AB_Elektrolyse_Kollegium.pdf | Kollegium, Weitergabe erlaubt | mit Lösung
- 2026-11-15 | Simulation Galvanische Zelle | Link: https://… | CC BY 4.0 · PhET | für DS4
## Lücken
- Kein Material zu Akkus und Recycling, Alltagsbezug fehlt
```

Ablauf:
- **Neue Einheit:** Zu Beginn (auch aus **einheit-planen** heraus) den Quellen-Ordner anlegen und fragen, welche Quellen es gibt (Buch, Kollegium, eigenes Altmaterial aus dem Register). Passendes Altmaterial aus dem Register in `quellen.md` verlinken, nicht kopieren.
- **Recherche** (z. B. aus **unterricht-planen**, Schritt 0b): Gefundene Fundstellen mit Lizenz als Link-Zeilen in `quellen.md`; frei lizenzierte Dateien nur mit Quellenzeile herunterladen. Geschützte Texte und Bilder nicht als Datei ablegen, nur Fundstelle.
- **Lesen:** Planung, Material und Prüfung zur Einheit lesen `quellen.md` zuerst und bauen auf diesen Quellen auf. Stimmt etwas nicht mehr (Buchseite, toter Link), die Zeile anpassen.
- **Lücken** festhalten, wenn bei der Planung auffällt, dass etwas fehlt.
- Für eine Schul-KI oder Lernplattform (z. B. ein Wissens-PDF für einen Lerncoach) ist `quellen.md` die Grundlage.

## 4. Hochgeladenes einsortieren

Lädt die Lehrkraft Screenshots, Fotos, Scans oder PDFs von Arbeitsblättern, Lösungen, Buchseiten oder Tafelbildern hoch:

1. **Schülerdaten prüfen** (Abschnitt 6). Bei Schülerarbeiten, Namen, Codes, Handschrift von Kindern: nicht ablegen, auf den Pseudonymisierer (Schwärzen) verweisen.
2. **Erkennen:** Art, Fach, Jahrgang, Thema, Aufgabenbereich, Herkunft (eigen, Buch, Kollegium, Internet) und Lizenz. Text auslesen (bei Bildern lesen, was zu sehen ist), damit Schlagworte stimmen. Gehört eine Lösung zu einem AB im Lager, das AB suchen und beide gleich benennen.
3. **Ziel vorschlagen**, gesammelt in einer kurzen Tabelle: Datei → Zielordner → neuer Dateiname → Art, Schlagworte, Lizenz. Ziel: zur laufenden Einheit der Quellen-Ordner (für fremdes und zugeliefertes Material) bzw. der Ordner der Stunde (für fertiges eigenes Material); sonst nach `ablage.material`. Dateiname: `<Art>_<Thema>[_Loesung].<ext>`, in Stundenordnern mit Nummer der Stunde, keine Umlaute und Leerzeichen im Dateinamen.
4. **Nach Bestätigung** (eine Antwort für alle Dateien genügt): Dateien über den Ordnerzugriff auf dem Rechner der Lehrkraft schreiben, mehrere Screenshots einer Seite auf Wunsch zu einem PDF zusammenfassen, Original behalten. Zeilen in `register.csv` und, wenn es zu einer Einheit gehört, in `quellen.md` anhängen. Ohne Ordnerzugriff: Dateien zum Herunterladen mit Zielpfad nennen.
5. Kurz bestätigen: was wo liegt.

## 5. Neues Material ablegen (aus anderen Skills)

**unterricht-planen**, **einheit-planen**, **material-gestalten** und **pruefung-entwerfen** legen fertige Dateien nach `ablage.material` ab und rufen dafür dieses Verfahren auf:
- Ordner nach Ablagemuster; Nummer fortlaufend aus den vorhandenen Ordnern.
- Je Datei eine Zeile in `register.csv` mit Art, Fach, Jahrgang, Niveau, Thema, Lehrplanbezug (Kompetenz in Kurzform), Schlagworten, `lizenz: eigen` bzw. Quellen fremder Bilder, `stand`.
- Gehört es zu einer Einheit: im Stoffverteilungsplan verlinken; in `quellen.md` nur, wenn es als Quelle für weitere Stunden dient.
- Gibt es eine ältere Fassung, nicht überschreiben, sondern fragen (ersetzen oder `_v2`).

## 6. Keine Schülerdaten im Lager

- Nie in Register, Bestand oder Quellen-Ordner: Namen, Kürzel, Schüler-Codes, korrigierte Arbeiten, Notenlisten, Zeugnisse, Anträge, Elternbriefe mit Empfängern, Fotos von Kindern.
- Ausgeschlossen sind immer der Datenordner von schulassistenz und Ordner mit Namen wie Anträge, Elternbrief, Noten, Korrektur, Kürzelliste, Klassenliste, Zeugnis, Gutachten, Protokoll, Attest, Entschuldigung. Eigene Ausnahmen in `ablage.material_ausschliessen` (Profil) und in `meine-einstellungen.js` unter `materiallager.ausschliessen` (Startseite).
- Schülerlösungen als Musterlösung nur geschwärzt (Pseudonymisierer) und nach Bestätigung; Art `Lösung`, Notiz „anonymisierte Schülerlösung“.
- Findet sich beim Verschlagworten eine Datei mit Schülerdaten in einem Materialordner, nicht ins Register aufnehmen und die Lehrkraft darauf hinweisen.

## 7. Bestand verschlagworten und pflegen

Auf Wunsch („Verschlagworte meinen Ordner 10\Nawi E“):
- Ordnerweise, höchstens etwa 40 Dateien je Durchgang. Aus Pfad und Inhalt Art, Thema, Lehrplanbezug und Schlagworte ableiten; Vorschlag als Tabelle, nach Bestätigung in `register.csv`.
- **Dubletten** (gleicher Name oder gleiche Größe) und **Fassungen** melden, nichts löschen.
- **Lizenz:** fremde Bilder ohne Quelle als `unklar` markieren und zur Nachrecherche anbieten (Regeln wie **material-gestalten**, Abschnitt 2a).
- Umbenennen oder Verschieben nur auf ausdrücklichen Auftrag, mit Liste vorher und ohne Dateien zu löschen.

## 8. Startseite

Kachel **Material suchen** (lokal): Die Startseite liest den Materialordner im Browser und, wenn in `meine-einstellungen.js` `schulordner` eingetragen ist, über den IServ-Helfer (ab 0.5, nur lesen) die gewählten Gruppenordner des Schulservers, leitet Jahrgang, Fach, Kurs, Thema und Art aus den Ordnernamen ab, mischt `register.csv` ein und sucht ohne Claude. „Für Claude speichern“ schreibt `materiallager/bestand.csv` und `bestand-schulserver.csv`. „Weiterverwenden“ öffnet Claude mit Titel und Pfad. Neue Kacheln zu diesem Skill in `kacheln.js`.

## 9. Grundsätze

- Ordnerordnung der Lehrkraft respektieren; das Register passt sich an, nicht umgekehrt.
- Allgemein gültig: Fächer, Jahrgänge, Muster und Ausschlüsse kommen aus dem Profil.
- Vorhandenes vor Neuem; jede neue Datei ist sofort wiederauffindbar.
- Urheberrecht: Fremdes nur mit Quelle und Lizenz; Schulbuchscans nur für den eigenen Unterricht, nie auf Lernplattformen veröffentlichen ohne Erlaubnis.
- Schreibt nur nach Bestätigung, löscht nie.
