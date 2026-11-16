# Pseudonymisierer – Anleitung

Ein kleines Werkzeug, das Namen und andere Personendaten aus Schuldokumenten entfernt, **bevor** du sie bei Claude hochlädst. Es ist eine einzige Datei (`Pseudonymisierer.html`), die im Browser läuft. Es wird nichts installiert und keine Datei verlässt deinen Rechner, auch ohne Internet funktioniert alles.

## Einrichten (einmalig)

1. Beim ersten Start legt schulassistenz `Pseudonymisierer.html`, `Kuerzelliste-Vorlage.xlsx` und diese Anleitung in deinen Datenordner unter `werkzeuge/pseudonymisierer/`. Fehlen sie dort, sag „Pseudonymisierer einrichten“.
2. Die Vorlage öffnen und als **Kürzelliste** speichern. Blatt 1: Vorname, Nachname, Kürzel je Kind (z. B. S01) und, falls Klassenarbeiten einen Schüler-Code tragen, in der Spalte rechts daneben den **Schüler-Code** (z. B. KV001). Die Startseite macht daraus unter „Code-Zuordnung“ eine Liste Code → Kürzel ohne Namen. Blatt 2 „Weitere Personen“: Eltern, Geschwister, Kolleg:innen, z. B. „Erika Muster → S01-Mutter“.
3. Die Kürzelliste **nie hochladen**. Sie ist der Schlüssel zu den echten Namen.

Tipp: Kürzel sollen keine normalen Wörter sein (gut: S01, KV003; schlecht: Max, Rot). Je Lerngruppe eine Liste oder eine Liste fürs ganze Schuljahr, beides geht.

## Benutzen

Doppelklick auf `Pseudonymisierer.html`, es öffnet sich im Browser.

**Reiter 1 · Kürzelliste:** Liste hineinziehen. Mehrere Listen (z. B. eine je Kurs) kannst du gleichzeitig oder nacheinander hineinziehen, sie werden zusammengeführt. Dabei gilt:
  - **Gleiches Kind in mehreren Kursen** (gleicher voller Name, z. B. in Info I04 und in Mathe M11): Es behält überall sein erstes Kürzel (I04), damit es nur eine Akte gibt. Der Rückweg setzt auch bei M11 den richtigen Namen ein. Nichts zu tun.
  - **Verschiedene Kinder mit gleichem Vor- oder Nachnamen** (zwei „Mia“): Volle Namen werden immer eindeutig ersetzt. Steht im Text nur „Mia“, schreibt das Tool „[I09 oder I15]“ und du wählst in der Prüfliste das richtige Kind. In Excel-Tabellen mit getrennten Spalten für Vor- und Nachname löst das Tool das selbst über die Zeile.
  - Pro Kind siehst du mehrere Zeilen: fett der volle Name, grau weitere Schreibweisen (Nachname, Vorname · nur Vorname · nur Nachname). Das ist so gewollt. Alternativ Namen einfügen und „Liste erzeugen“, dann „Liste als CSV speichern“.

**Reiter 2 · Word, Excel & Text** (.docx, .xlsx, .txt, .md, .csv): Datei hineinziehen. Das Tool ersetzt alle Namen aus der Liste, auch in Kopf- und Fußzeilen, Kommentaren und im Dateinamen, und löscht die Autorangaben. Danach zeigt eine **Prüfliste** Stellen, die nach Personendaten aussehen, aber nicht in der Liste stehen: Adressen, Telefonnummern, Mailadressen, Geburtsdaten, Namen nach „Frau“, „Herr“, „Bruder“ usw. und häufige Vornamen. Haken setzen oder entfernen, „Pseudonymisierte Datei speichern“. Sie landet im Download-Ordner mit der Endung `_pseudo`.

**Excel-Notentabellen:** Die ganze Tabelle kann hinein. Namen werden in allen Zellen, Blättern und Kommentaren ersetzt; Noten, Formeln und Formatierung bleiben, wie sie sind. Stehen in einer Namensspalte Personen, die in keiner Kürzelliste stehen (z. B. ein neues Kind), meldet die Prüfliste sie als „Name fehlt in Liste?“ und schlägt `[unbekannt-1]` usw. vor. Besser: das Kind in die Kürzelliste aufnehmen und die Tabelle neu hineinziehen. Trägt ein Tabellenblatt einen Namen als Reiterbeschriftung, weist das Tool darauf hin; den Reiter bitte selbst umbenennen. Die `_pseudo.xlsx` kannst du dann hochladen, damit die Noten in die Lernstandsakten übernommen werden.

**Reiter 3 · Scans, Fotos & PDF schwärzen:** für alles Handschriftliche und Gescannte (siehe unten).

**Reiter 4 · Rückweg:** Eine Datei von Claude mit Kürzeln (z. B. Gesprächsnotiz) hineinziehen. Das Tool setzt die echten Namen wieder ein und speichert sie mit der Endung `_klar`. Diese Datei nicht wieder hochladen.

## Handschriftliches, Scans und Fotos

Bei Handschrift kann ein Programm Namen nicht zuverlässig selbst finden. Deshalb gilt hier: **Du markierst, das Tool schwärzt sicher.**

1. Scan (PDF) oder Handyfotos (JPG) in Reiter 3 ziehen. Mehrere Fotos werden eine PDF.
2. Mit der Maus oder dem Finger ein Rechteck über jeden Namen, jede Unterschrift und Adresse ziehen. Klick auf ein schwarzes Feld nimmt es wieder weg.
3. Steht der Name immer oben (Klausurkopf, Formular), genügt **„Kopfbereich aller Seiten schwärzen“**, das schwärzt den oberen Rand jeder Seite auf einmal.
4. Bei PDFs mit echtem Text (aus Word erzeugt) schwärzt das Tool Namen aus der Liste automatisch und zeigt weitere Verdachtsstellen orange umrandet. Ein Klick darauf schwärzt sie.
5. „Geschwärzte PDF speichern“ und die neue PDF einmal ansehen.

Die neue PDF besteht nur noch aus Bildern der Seiten. Was geschwärzt ist, ist **endgültig** weg und lässt sich auch nicht durch Kopieren oder Wegklicken zurückholen (anders als beim Schwärzen mit einem Textmarker-Kasten in einem PDF-Programm). Kamera- und GPS-Daten aus Handyfotos werden dabei ebenfalls entfernt. Claude kann die Handschrift im Rest der Seite trotzdem lesen.

**Am wenigsten Arbeit macht es, wenn der Name gar nicht erst aufs Papier kommt:**

- Bei Klassenarbeiten und Klausuren schreiben die Schüler:innen ihr Kürzel oder ihre Nummer aus der Klassenliste aufs Deckblatt statt des Namens (der Name kommt z. B. nur auf ein abtrennbares Deckblatt oder die Rückseite, die du nicht scannst).
- Beim Scannen den Namen mit einem Post-it abdecken oder den Kopf umknicken.
- Eigene Notizen (Beobachtungen, Gesprächsnotizen) gleich mit Kürzel schreiben.

## Grenzen

- Das Tool findet Namen, die in der Liste stehen, und typische Muster. Spitznamen, Tippfehler oder ungewöhnliche Namen findet es nur, wenn du sie in die Liste aufnimmst. **Vor dem Hochladen das Ergebnis immer kurz selbst ansehen.**
- Bilder *in* einer Word-Datei (eingescannte Unterschrift, Foto) bleiben unverändert. Solche Dateien als PDF speichern und in Reiter 3 schwärzen.
- Alte .doc- und .xls-Dateien vorher als .docx bzw. .xlsx speichern.
- Ein Nachname, der auch ein normales Wort ist (z. B. „Wolf“), wird überall ersetzt, auch im Fachtext. In dem Fall die Datei nach dem Speichern kurz prüfen.
- Die Schulleitung entscheidet, ob Schülerdaten überhaupt (auch pseudonymisiert) mit Claude verarbeitet werden dürfen. Das Werkzeug ersetzt diese Klärung nicht.

## Für Technikinteressierte

Die Datei enthält die Bibliotheken pdf.js, pdf-lib, JSZip und SheetJS, damit sie offline läuft. Der lesbare Quelltext liegt im Projekt unter `entwicklung/pseudonymisierer/quellcode/`.
