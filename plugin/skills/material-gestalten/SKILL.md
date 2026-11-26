---
name: "material-gestalten"
description: "Setzt Unterrichtsmaterial und Prüfungen jedes Fachs (schulassistenz) als druckfertiges PDF im Layout „Klar · Band“ bzw. dem Layout der Schule: Arbeitsblätter, Hilfekarten, Exit-Tickets, Tafelbild, Klassenarbeiten. Auch wenn vorhandenes Material (Word, PDF, Foto) ins neue Layout gebracht, umgestaltet oder neu gesetzt werden soll."
---

# Material gestalten

Setzt fertig geplante Inhalte in ein einheitliches, ruhiges Layout. Inhalt und Didaktik kommen aus **unterricht-planen**, **einheit-planen** oder **pruefung-entwerfen**; dieser Skill regelt Aufbau und Satz. Ausgabe: PDF im Layout **„Klar · Band“** (HTML + Chromium, Abschnitt 2b), Word nur auf Wunsch. Nicht frei neu gestalten: gleiche Bausteine, gleiche Farben, damit Lernende sich auf jedem Blatt zurechtfinden.

Arbeitet ohne Schülerdaten.

## 0. Vorher: Layout aus dem Profil

Profil über **schulprofil** lesen: `layout`, `rahmen` (Lehrkraft-Kürzel, Schulform), `bewertung` (Notenschlüssel je Stufe, Schüler-Code), `ablage.material`.

- **Layout-Datei:** Steht in `layout.datei` eine Datei (z. B. `profil/layout/<schule>.layout.md`), gilt sie vor diesem Skill: Logo, ab welcher Klasse das Logo erscheint, Schrift, Fachfarben, Kopf- und Fußzeilen, Felder des Klausurkopfs, Bestandteile der Bewertungsseite, Sonderregeln.
- **Ohne Layout-Datei:** neutraler Standard: kein Logo, DejaVu Sans, Fachfarben aus der Standardpalette (Abschnitt 1), sonst alles wie unten.
- **Muster der Schule übernehmen:** Lädt die Lehrkraft ein Logo, einen Briefkopf oder ein Muster-Arbeitsblatt hoch, daraus eine Layout-Datei ableiten (Logo als PNG ablegen, Seitenverhältnis bestimmen, Haus- und Fachfarben ablesen, Kopfzeile und Pflichtfelder übernehmen). Die erkannte Struktur kurz zeigen, nach Bestätigung über **schulprofil** speichern und `layout.datei` eintragen.
- **Primarstufe:** Schrift aus `layout.schrift_primar` (z. B. Grundschrift). Die Datei ist meist nicht installiert: zuerst im Datenordner und in verbundenen Ordnern suchen (`<Name>*.ttf/.otf`), sonst die Lehrkraft vor dem Setzen um die Datei bitten. Nur auf ausdrücklichen Wunsch auf DejaVu ausweichen und das im Lieferhinweis nennen.
- **Lerngruppe:** Ist eine Lerngruppe genannt, Fach, Jahrgang und Niveau aus `lerngruppen/<gruppe>/gruppe.md` nehmen, nicht erfragen.

## 0a. Sonderregeln Primarstufe (Klasse 1–4)

Gelten für **alles** Material der Klassen 1–4 (AB, Hilfekarten, Exit-Tickets, Lernzielkontrollen, Klassenarbeiten). Was hier nicht geregelt ist, folgt den Abschnitten 1–6.

- **Logo erst ab der Klasse aus `layout.logo_ab_klasse`** (Standard 5; im Gerüst `SHOW_LOGO`). Ohne Logo rücken Fachname/Thema an den linken Rand; in der Klassenarbeits-Kopftabelle geht das Titelfeld über die volle Breite.
- **Fachfarbe bleibt** wie in Abschnitt 1 (Sachunterricht: nächstverwandte Gruppe, z. B. Naturwissenschaften). Merkkasten orange, Joker grau wie immer.
- **Primarschrift** (aus dem Profil, z. B. Grundschrift) für sämtlichen Text, siehe Abschnitt „Vorher“. Symbole, die die Schrift nicht enthält (✏ ✂ ★ ☺), mit DejaVu setzen oder als Flowable zeichnen.
- **Schriftgrößen:** Kl. 1–2: Text 16 pt (Zeilenabstand 1,5), Titel 20 pt, Tabellen 14 pt. Kl. 3–4: Text 14 pt, Titel 18 pt, Tabellen 12 pt. Kopfzeile 10 pt. Flattersatz, keine Silbentrennung.
- **Sprache:** wenige Worte, kurze Hauptsätze, ein Auftrag pro Satz, wiederkehrende Formulierungen. Bei Sprachschwierigkeiten in der Lerngruppe (gruppe.md, Layout-Hinweise) Material **differenziert** anbieten (z. B. Sterne ★ / ★★ / ★★★ oder zwei Fassungen) und **bildsprachlich** gestalten.
- **Arbeitsanweisungen mit Symbol** links neben jedem Auftrag (immer gleiche Bedeutung): Stift = schreiben, Auge = lesen, Ohr = zuhören, Schere = ausschneiden, Kleber = kleben, Buntstift = malen/anmalen, Verbinden-Linie = verbinden, zwei Köpfe = Partnerarbeit. Als einfache, flache Flowables zeichnen (ca. 10 mm, Strichstärke 1 pt, Fachfarbe).
- **Wortspeicher mit Bildern** (orange Kasten): Wort + kleines Bild (frei lizenziertes Piktogramm, z. B. ARASAAC oder Wikimedia Commons, mit Quelle; sonst ComfyUI-Bild oder Platzhalter nach Abschnitt 2a), Nomen mit Artikel; Artikelfarben nur, wenn das Layout sie vorsieht.
- **Schreibfelder statt 5-mm-Karo:** Deutsch/Sachunterricht → Schreiblineatur passend zur Klasse (Kl. 1 Lineatur 1, Kl. 2 Lineatur 2, Kl. 3 Lineatur 3, Kl. 4 Lineatur 4; Flowable `Lineatur`). Mathe → Kästchen 10 mm (Kl. 1–2) bzw. 7 mm (Kl. 3–4) [Schulvorgabe prüfen]. Großzügig Platz lassen.
- **Kopfzeile:** „Fach · Klasse n“ fett in Fachfarbe, darunter Thema; rechts „Name: ________“ mit langem Feld (Datum bei Kl. 1–2 optional). Linie in Fachfarbe.
- **Kein Lehrerjargon auf dem Schülerblatt:** keine AFB-Angaben, keine Operatoren-Fettung; AFB/Kompetenzbezug nur auf dem Lehrerblatt.
- **Hilfekarten** mit Bild statt Text, wo möglich; **Exit-Tickets** als Ankreuzen/Smiley-Skala („Das kann ich: ☺ ◔ ☹“).
- **Lernzielkontrollen ohne Noten** (Profil `skala_primar`, z. B. Kl. 1–2): keine Punktetabelle. Am Ende eine Rückmeldetabelle „Das kann ich schon“: je Lernziel eine Zeile mit Symbolskala (z. B. Sonne / Sonne mit Wolke / Wolke oder Ampel), Kreuz durch die Lehrkraft; darunter Kasten „Mündlich / im Unterricht“ ebenfalls mit Symbolen (macht mit, hört zu, arbeitet sorgfältig), Kommentarzeilen und Unterschrift Lehrkraft (Kürzel) | Erziehungsberechtigte. Punkte nur auf dem Lehrerblatt, falls die Lehrkraft sie zur Auswertung will.
- **Klassenarbeiten Kl. 3–4:** Namensfeld bzw. Code nach Profil. Aufgaben wie Abschnitt 4, aber ohne AFB-Zeile auf dem Schülerblatt und mit Schreibfeldern statt 5-mm-Karo; Punkte stehen kindgerecht als „__ / x Punkte“. Bewertungsseite mit Punktetabelle, Notenraster nach Schulvorgabe, Kasten „Mündliche Leistung“ mit kindgerechten Kriterien (meldet sich, erzählt in ganzen Sätzen, arbeitet mit anderen gut zusammen, macht Hausaufgaben) und Unterschrift Erziehungsberechtigte.

## 1. Logo und Fachfarben

Logo: Datei aus `layout.logo` (Seitenverhältnis aus der Bilddatei, im Gerüst `LW`). Ohne Logo bleibt der Platz frei, nichts erfinden.

Fachfarben: aus der Layout-Datei, sonst diese **Standardpalette**. Die **Fachfarbe** färbt Titel, Kopfzeilen-Fachname, Linie unter der Kopfzeile, Auftrags-/Regelkasten (hell) und die Rahmen der Klausur-Kopftabelle. **Funktionsfarben sind in allen Fächern gleich:** Merkkasten/Wortspeicher orange hell `#FAEEDA`, Joker grau hell `#F1EFE8`. Pluspol rot `#A32D2D`, Minuspol blau `#185FA5`.

| Fach | Akzent | hell |
|---|---|---|
| Mathematik (Blau) | #185FA5 | #E6F1FB |
| Physik (Indigo) | #3C3489 | #EEEDFE |
| Naturwissenschaften (Smaragdgrün) | #0F6E56 | #E1F5EE |
| Chemie (Petrolblau) | #1B6F7E | #E0F2F4 |
| Biologie (Olivgrün) | #5C6B1F | #F0F2DE |
| AWT (Violett) | #6B3FA0 | #F2ECFA |
| Informatik (Schieferblau) | #3D5468 | #E9EEF3 |
| Deutsch (Ziegelrot) | #A8401C | #FAECE7 |
| Sport (Kirschrot) | #B01E3C | #FBE8EC |
| Englisch / Fremdsprachen (Pflaume) | #7A3478 | #F6EAF5 |
| Werte und Normen / Religion (Beere) | #8C2F5A | #FBEAF0 |
| Gesellschaftslehre, Geschichte, Erdkunde, Politik (Rostbraun) | #8A4B2A | #F4E8E1 |
| Kunst / Musik / DS (Magenta) | #C03A86 | #FCE8F3 |

Nicht gelistetes Fach: Farbe der nächstverwandten Gruppe.

## 2. Skizzen

- **Bei jedem Versuch immer eine Versuchsskizze** des Aufbaus auf das Durchführungsblatt (und in Klausuren, wenn ein Versuch beschrieben oder ausgewertet wird): Geräte, Gefäße, Stoffe/Lösungen, Elektroden, Messgeräte und Schaltung (Amperemeter in Reihe, Voltmeter parallel) eindeutig beschriftet.
- **Darüber hinaus eine Skizze, wenn es sich anbietet**: Modellvorstellungen (Teilchenebene), Abläufe, Energie- oder Potenzialdiagramme, leere Diagrammraster zum Eintragen, Hilfeskizzen auf Hilfekarten.
- **Versuchsskizzen** (Geräteaufbau, Schaltungen) **immer selbst zeichnen, nie per Bildgenerierung (ComfyUI)**, als eigene ReportLab-Flowables: flach, keine Verläufe, dünne Linien; Beschriftungen rechts daneben mit gestrichelten Hinweislinien (fetter Titel 8,5 pt + Erläuterung 8 pt). Farben: Fachfarbe für Hervorhebungen, Pluspol rot, Minuspol blau, Flüssigkeiten hellblau.
- **Alle anderen Abbildungen** (Querschnitte, Profile, Modellbilder, Kreisläufe, Bildfolgen, Schaubilder) nach dem **Illustrationsstil** zeichnen: Datei `referenzen/illustrationsstil.md` im Skill **plakat-gestalten** (Ordner neben diesem Skill: `../plakat-gestalten/`). Als SVG bauen, mit `../plakat-gestalten/skripte/render.py <datei>.svg --dpi 300` rendern, Graustufen-Probe ansehen und das PNG als `Image` in Druckgröße einsetzen. Beschriftung im Bild ca. 8–9 pt, Fachfarbe nur als Akzent.
- **Diagramme mit Messwerten** (Säulen, Linien, Streudiagramme, Auswertungen) nach dem Skill **dataviz** bauen, wenn verfügbar; Fachfarbe als erste Reihe, leere Diagrammraster zum Eintragen weiter als Flowable.
- Bei Schülerversuchen unter die Skizze: „Erst aufbauen, dann von der Lehrkraft prüfen lassen, dann einschalten.“ (bei Stromkreisen) bzw. passende Sicherheitszeile.

## 2a. Abbildungen: erst finden, dann zeichnen

Abbildungen in dieser Reihenfolge beschaffen, nie umgekehrt:

1. **Abbildungen der Lehrkraft** (hochgeladen, aus dem Schulbuch, aus ihrem Materialordner) haben Vorrang. Zu Beginn kurz fragen, ob es eigene Bilder gibt, wenn das Thema Abbildungen braucht.
2. **Frei lizenzierte Fotos und Schemata suchen**, z. B. auf Wikimedia Commons (commons.wikimedia.org), sonst Openverse oder Seiten mit gemeinfreien Bildern von Behörden und Forschungseinrichtungen. Nur Lizenzen, die Nutzung im Unterricht erlauben (gemeinfrei/CC0, CC BY, CC BY-SA). Bild in ausreichender Auflösung laden (mind. ca. 1000 px Breite für halbe Satzbreite), mit Python prüfen, ob es lesbar ist, zuschneiden statt verzerren. Unter jedes Bild eine Quellenzeile 7,5 pt grau: „Foto/Grafik: <Urheber>, <Lizenz>, via Wikimedia Commons“. Im Lehrerblatt alle Quellen mit Link sammeln.
3. **Selbst zeichnen nur Schemata:** Versuchsaufbauten (flach, Abschnitt 2), Querschnitte und Profile, Pfeil- und Flussdiagramme, Kreisläufe, Teilchenmodelle, Bildfolgen, Diagrammraster, Zeitleisten; alles außer Versuchsaufbauten im **Illustrationsstil** (Abschnitt 2). Für Biologie- und Medizinmotive (Zelle, Organ, Laborgerät) vorher Servier Medical Art (CC BY 4.0) und Bioicons prüfen. **Keine realistischen Ansichten von Szenen, Landschaften, Tieren, Pflanzen, Menschen oder Gegenständen nachbilden** (Vulkan- oder Gebirgspanorama, Zelle als Foto-Ersatz, Organ, Gebäude, Strichmännchen): Das sieht als Vektorzeichnung schlecht aus und lenkt ab. Ein Vulkan oder Berg **im Querschnitt bzw. Profil** ist dagegen ein Schema und ausdrücklich erwünscht (Beispiel: `../plakat-gestalten/beispiele/`).
3b. **Gegenständliches mit ComfyUI erzeugen (optional):** Sind die Tools des MCP-Servers `comfyui` vorhanden, dürfen gegenständliche Bilder ohne Fachdetail (Bildkarten, Wortspeicher-Bilder, Situations- und Einstiegsbilder) lokal erzeugt werden, statt einen Platzhalter zu setzen. Regeln, Prompt-Stil, Prüfung und Kennzeichnung: `../plakat-gestalten/referenzen/bildgenerierung.md`. **Alles, was genau stimmen muss** (Versuchsskizzen, Schaltungen, Querschnitte, Modelle, Diagramme, alles Beschriftete), **wird nie generiert**, sondern nach Schritt 3 gezeichnet.
4. **Nichts Passendes gefunden:** statt einer schlechten Zeichnung einen **Platzhalter** setzen: grauer Rahmen in der vorgesehenen Größe, darin „Abbildung einfügen: <was zu sehen sein soll>“ und „Suchbegriff: <Begriff> (z. B. Wikimedia Commons)“. Im Abschlusshinweis die Platzhalter nennen.

Lieber ein gutes Foto als drei Skizzen. Eine Abbildung muss eine Aufgabe tragen (beschreiben, vergleichen, beschriften, auswerten), sonst weglassen.

## 2b. Layout „Klar · Band“ (Standard ab Klasse 5)

Alle Arbeitsblätter, Lehrerblätter, Tafelbilder, Klassenarbeiten, Klausuren und Tests ab Klasse 5 werden mit dem Baukasten `skripte/klar.py` gesetzt (HTML/CSS, gedruckt mit Chromium über Playwright zu A4-PDF). Ein vollständiges Muster mit AB, Klassenarbeit Seite 1 und Bewertungsseite steht in `beispiele/beispiel_nawi10.py`. Vor der ersten Nutzung ansehen und genauso aufbauen.

- **Aussehen:** Der Kopf ist ein helles Band in der Fachfarbe über die volle Blattbreite (Logo auf weißem Feld, „Fach · Jahrgang“ fett in Fachfarbe, Thema grau, rechts ein weißes Feld mit Name, Datum und Klasse) mit einer Linie in der Fachfarbe darunter. Aufgabennummern stehen in Kästchen in der Fachfarbe, Aufgabenköpfe auf einem hellen Balken mit Sozialform- und Zeitmarken (Symbol + Text). Situation zwischen zwei feinen Linien, Merkkasten orange mit Reiter „Merke“, Joker grau. Schrift Instrument Sans (OFL, aus `../plakat-gestalten/schriften/`). Text 10 pt, Titel 16,5 pt.
- **Werte aus dem Profil** in `K.Profil(...)`: Fach, Jahrgang, Thema, Fachfarbe + hell (Abschnitt 1), Logo (ab `logo_ab_klasse`, sonst `None`), Lehrkraft-Kürzel, Schuljahr, `code` (Schüler-Code für den Jahrgang), `noten` (Notenschlüssel der Stufe), `notenpunkte` (Sek II), `muendlich` (Kasten laut Layout-Datei), `unterschrift2` (Oberstufe „Kenntnisnahme“).
- **Bausteine:** `kopf_ab`, `ab_titel`, `situation`, `aufgabe` (mit `tag`, Niveau ★), `op`, `versuch`, `schritte`, `sicherheit`, `tabelle`, `bild` (mit Quellenzeile), `platzhalter`, `auftrag_mit_hilfe`/`hilfe` (Hilfekarten-Verweis), `satzanfang`, `linien`, `karo`, `merk` + `luecke`, `joker`, `abschluss`, `seite`/`ab_seite` (`quer=True` für Tafelbild, `kopf_ab(cfg, "lehrer"|"tafel")`). Klassenarbeit: `ka_kopf`, `hinweis`, `ka_aufgabe`, `teil` (Punktekasten „/ x BE“, AFB, Kästchenfeld), `material`, `folge_kopf`, `ka_fuss`, `bewertung` (Punktetabelle, Notenschlüssel aus `noten` mit aufgerundeten BE-Grenzen, Ergebnis, Mündliche Leistung, Kommentar, Unterschriften).
- **Druck:** `K.speichern(cfg, seiten, "Datei.pdf")` schreibt HTML, PDF, PNG je Seite und Graustufen-Probe (`*_grau.png`) und meldet Seiten, deren Inhalt überläuft. Jede `seite` ist genau ein A4-Blatt: Läuft etwas über, kürzen, Kästchenfelder verkleinern oder auf eine zweite Seite verteilen, nie verkleinert drucken.
- **Keine CSS-Verläufe oder Hintergrundmuster** für Linien, Karo oder Flächen: Manche PDF-Betrachter zeigen sie als pinke Flächen. Schreiblinien (`linien`) und Kästchen (`karo`) sind echte Linien; Verläufe nur innerhalb von SVG-Abbildungen.
- **Primarstufe (Kl. 1–4)** und Rechner ohne Chromium/Playwright: ReportLab-Gerüst aus Abschnitt 6 mit denselben Inhalten.
- **Chromium fehlt:** Bricht `K.speichern` mit „Playwright/Chromium nötig“ ab, zuerst `pip install playwright` und `python -m playwright install chromium` versuchen. Erst wenn das nicht geht (kein Netz), ReportLab-Gerüst nehmen und im Lieferhinweis sagen, dass das Blatt deshalb nicht im Layout „Klar · Band“ ist. Nie still ein anderes Layout liefern.

## 2c. Vorhandenes Material ins Layout bringen

Sagt die Lehrkraft „neues Layout anwenden“, „ins neue Layout bringen“, „im Klar-Band-Layout setzen“ oder hängt ein eigenes Arbeitsblatt, eine Klassenarbeit oder ein Tafelbild an (Word, PDF, Foto, Text im Chat), gilt:

1. **Inhalt übernehmen, nicht neu erfinden:** Text, Aufgaben, Punkte, Tabellen und Abbildungen auslesen (Word/PDF als Text, Fotos und Scans ansehen). Wortlaut und Reihenfolge der Aufgaben bleiben; nur offensichtliche Tippfehler korrigieren und in der Rückmeldung nennen.
2. **Zuordnen:** Fach, Jahrgang und Thema aus dem Dokument oder der Lerngruppe; Bausteine aus Abschnitt 2b wählen (Situation, Aufgaben mit Sozialform/Zeit, Merke, Tabellen, Linien/Kästchen für Antworten). Abbildungen aus dem Original ausschneiden und mit `bild` einsetzen; geht das nicht, `platzhalter`.
3. **Setzen** mit `skripte/klar.py` wie in `beispiele/beispiel_nawi10.py`, Überlauf und Graustufen-Probe prüfen.
4. **Liefern:** PDF neben dem Original ablegen (gleicher Name + „_klar“) bzw. nach `ablage.material`; kurz nennen, was geändert wurde. Mehrere Dateien: eine nach der anderen, gleiche Fachfarbe.

Fehlt in der Anfrage ein Dokument, nachfragen, welches Material umgesetzt werden soll (Datei anhängen oder Pfad nennen), statt nichts zu tun.

## 3. Arbeitsblätter (Material zu einer Stunde)

- A4, Ränder 16 mm, Satzbreite 178 mm, Layout „Klar · Band“ (Abschnitt 2b). Im ReportLab-Gerüst (Kl. 1–4, Notlösung): Ränder 18 mm, DejaVu Sans, Titel 15 pt, Text 10,5 pt, Tabellen 9,5 pt.
- **Kopfzeile jede Seite** (`kopf_ab`; im ReportLab-Gerüst als Zeile): Logo (9–12 mm hoch) links (wenn vorhanden, ab `logo_ab_klasse`), daneben „Fach · Jahrgang“ (z. B. „Chemie eA · Jahrgang 13“) fett in Fachfarbe und darunter das Thema grau; rechts „Name: ___ Datum: ___“ (Lehrerblatt: „Lehrerblatt – nicht für SuS“); darunter Linie 1,2 pt in Fachfarbe. Seitenzahl unten rechts.
- **AB-Aufbau:** Titel „AB n · Leitfrage“ → Situation („Worum es geht“) → nummerierte Aufgaben mit Titel, Sozialform und Zeit als Marken („1 · Vorhersage“, allein, 3 Min.) und Niveau ★/★★/★★★ → Merkkasten (orange) als Lückentext mit Wortspeicher → Joker (grau). Satzanfänge kursiv grau. Tabellen mit dünnem grauem Gitter, Kopfzeile grau. Antwortlinien grau, 7–8 mm.
- Versuchsblätter: Material → Durchführung → Sicherheit (rot) → **Versuchsskizze** → Messtabelle → Beobachtung/Auswertung.
- Schulbuchabbildungen zuschneiden (Randnotizen weg), Quellenzeile 7,5 pt grau. Urheberrecht beachten: nur Abbildungen aus Material, das die Lehrkraft nutzen darf.
- **Hilfekarten-Verweis an der Aufgabe (immer):** Gibt es zu einer Teilaufgabe Hilfekarten, steht der Verweis direkt an dieser Teilaufgabe – rechtsbündig in der Aufgabenzeile oder als eigene Zeile darunter, 9 pt, grau, mit 💡: „💡 Hilfekarte 2a“ bzw. „💡 Hilfekarten 2a · 2b · 2c“. Die Karten heißen nach Aufgabe und Stufe (2a/2b/2c) und tragen im Kartenkopf den Rückverweis („Hilfekarte 2a · zu AB 1, Aufgabe 2“). Keine Karte ohne Verweis, kein Verweis ohne Karte; im Lehrerblatt (Spalte Material) dieselben Nummern verwenden. Kl. 1–4: nur 💡 + Kartennummer bzw. Kartenbild, kein Text.
- **Rechnungen mit Legende und Beispielrechnung (immer):** Steht auf einem AB, im Tafelbild oder im Lehrerblatt eine Formel oder Rechnung, wird sie gesetzt als (1) **Legende** direkt unter der Formel – kleine zweispaltige Tabelle Zeichen | Bedeutung und Einheit, Konstanten mit Wert – und (2) **Beispielrechnung** im Merk- oder Jokerkasten bei der Aufgabe: Gegeben/Gesucht → Formel → Umstellen → Einsetzen mit Einheiten → Ergebnis mit Einheit und Antwortsatz; links die Rechenschritte, rechts grau kursiv je ein kurzer Kommentar („Masse durch molare Masse teilen, g kürzt sich“). Beispielzahlen anders als in der Aufgabe; ist der Rechenweg selbst das Lernziel, kommt die Beispielrechnung auf eine Hilfekarte (an der Aufgabe verwiesen), die Legende bleibt auf dem AB. Tafelbild: Musterrechnung mit Legende. Lehrerblatt: Lösung im selben Schema. Kl. 1–4: Rechenweg als Bild (Plättchen, Zahlenstrahl, Rechenhaus) statt Text-Legende.
- Ein AB möglichst eine Seite, sonst genau zwei. Seitenumbruch vor jedem AB.
- **Gesamtdatei:** AB 1, AB 2 … → Seite „Hilfekarten zum Ausschneiden“ (2×2-Karten, 84 mm, orange, grauer Rahmen) + „Exit-Tickets (2 pro Seite) ✂“ → Lehrerblatt (eine Seite, 8,6 pt): Ablauf-Tabelle (Zeit | Phase | Was passiert | Material, letzte Zeile Reserve), „Bewusst weggelassen“, Lösungen-Tabelle, Hinweise (Sicherheit, [prüfen], Messhinweise wie Schaltung und Messbereich) → **Tafelbild** (eigene Seite, s. u.).
- **Tafelbild (immer, eigene Seite nach dem Lehrerblatt):** A4 **quer**, damit es auch per Beamer gezeigt werden kann. Kopfzeile wie oben, rechts „Tafelbild“ statt Name/Datum (kein „nicht für SuS“, da zeigbar). Inhalt: Überschrift/Leitfrage (22 pt fett, Fachfarbe) → Struktur des Stundenergebnisses (Gegenüberstellung, Pfeilkette, Tabelle oder Skizze; Text 16–18 pt, gut lesbar aus der letzten Reihe) → Merksatz im orangen Kasten. Satzbreite quer 261 mm (Kästen/Tabellen entsprechend breit, `box(..., w=261*mm)`). Wenige Worte, so wie es an der Tafel stehen soll; Teile, die erst im Unterricht entstehen, als Lücke mit grauem Lösungstext kennzeichnen. Kreidefarben optional klein in Grau in Klammern („gelb“). Kl. 1–4: Primarschrift, Logo nach Profil, bildhaft. Ein Tafelbild pro Stunde; bei mehreren Stunden je eine Seite.

## 4. Klassenarbeiten, Klausuren, Tests

- **Code statt Name**, wenn das Profil einen Schüler-Code für den Jahrgang vorsieht (`bewertung.schueler_code`, im Gerüst `CODE`): **kein Namensfeld**, die Lernenden tragen ihren Code ein (Format aus dem Profil). Die Zuordnung Code → Name führt nur die Lehrkraft; sie steht nirgends auf der Arbeit. Gilt auf allen Seiten. Ohne Code: Feld „Kürzel“ empfehlen (Akten-Kürzel aus der Kürzelliste), damit **pruefung-korrigieren** die Ergebnisse ohne Schwärzen der Akte zuordnen kann; „Name“ nur, wenn die Lehrkraft das will.
- **Seite 1: Kopf** (`ka_kopf`: helles Band in Fachfarbe über die volle Breite mit Logo, „Klassenarbeit/Klausur Nr. x · Fach“ fett in Fachfarbe und Thema; im ReportLab-Gerüst als Kopftabelle mit Rahmen 1 pt Fachfarbe, Kl. 1–4 ohne Logo). Darunter Felder mit kleinen grauen Beschriftungen: bei Code **Code** mit Einzelkästchen je Zeichen (je 7 mm, Rahmen Fachfarbe; Flowable `CodeFeld`), sonst Kürzel bzw. Name | Datum | Kurs/Klasse (mit Lehrkraft-Kürzel), dann Bearbeitungszeit | Hilfsmittel. Weitere Pflichtfelder aus der Layout-Datei. Bei Code im grauen Hinweiskasten als erste Zeile fett: „Trage oben nur deinen Code ein – nicht deinen Namen.“
- Danach grauer Hinweiskasten, ggf. Material-Kasten (Fachfarbe hell) mit Versuchsskizze.
- **Aufgaben** (`ka_aufgabe` + `teil`): Überschrift mit Nummernkästchen auf hellem Balken. Jede Teilaufgabe als Zeile: Buchstabe | Text mit fettem Operator | rechts Punktekasten „☐ / x BE“ und darunter „AFB I/II/III“; Linie darunter. Direkt darunter ein **Kästchenfeld (5-mm-Karo)** in passender Höhe. Teilaufgabe + Kästchenfeld (und die Aufgabenüberschrift mit der ersten Teilaufgabe) immer per KeepTogether zusammenhalten.
- **Folgeseiten** (`folge_kopf`, helles Band): kleine Kopfzeile mit Logo (falls vorhanden), „Klausur Nr. x · Fach · Jahrgang“, rechts „Code: ________“ bzw. „Kürzel/Name: ___“, Linie in Fachfarbe. Fußzeile links „Lehrkraft-Kürzel · Schuljahr“, rechts „Seite n“.
- **Letzte Seite „Bewertung“:** bei Code oben rechts ebenfalls nur „Code: ________“.
  1. Punktetabelle: Aufgabe | erreichbar | erreicht, letzte Spalte Summe.
  2. **Bewertungsraster** aus dem Notenschlüssel der Stufe im Profil bzw. aus dem Erwartungshorizont von **pruefung-entwerfen** (Kopfzeile in Fachfarbe hell, Zeile „ab BE“ nach der Rundungsregel des Profils aus der Gesamtpunktzahl berechnen, per Code). Ohne Schlüssel im Profil nachfragen, nie einen erfinden. Primarstufe: kindgerechte Sprache.
     Hinweiszeile 8 pt grau: „BE = Bewertungseinheiten.“ plus Rundungsregel in Kurzform.
  3. Ergebniskasten (Rahmen Fachfarbe): „Ergebnis: ___ / x BE = ___ %“ und ein großes Feld für Note/Notenpunkte.
  4. Nur wenn die Layout-Datei es vorsieht: **Kasten „Mündliche Leistung (Stand: ___)“** mit Ankreuz-Kriterien in zwei Spalten (Beteiligung, Fachsprache, Zuverlässigkeit in Gruppen-/Experimentierphasen, eigene Ideen, Aufgaben vollständig, Entwicklung ↗ → ↘) und rechts Feld „Note“.
  5. „Kommentar“ mit 4 Linien; Unterschriftzeilen „Datum, Unterschrift Lehrkraft (Kürzel)“ | bis Sek I: „Unterschrift Erziehungsberechtigte“, Oberstufe: „Kenntnisnahme“ (oder wie in der Layout-Datei).
- Erwartungshorizont als separates Lehrer-PDF im gleichen Layout (kommt von **pruefung-entwerfen**).

## 5. Ablieferung

- Jede Seite als PNG rendern (pdftoppm) und prüfen: Überlauf, Überlappungen, abgerissene Aufgaben, lesbare Skizzen. Abbildungen kritisch ansehen (Prüfschleife des Illustrationsstils, auch Graustufen-Probe für den Schwarz-Weiß-Kopierer): Wirkt eine eigene Zeichnung laienhaft oder stellt sie etwas Gegenständliches dar, durch ein frei lizenziertes Bild oder einen Platzhalter ersetzen (Abschnitt 2a). Jedes fremde Bild hat eine Quellenzeile.
- Gesamt-PDF + Einzel-PDFs je AB (qpdf): `AB1_<Kurztitel>.pdf` …, `Hilfekarten_Exit-Tickets.pdf`, `Lehrerblatt.pdf`, `Tafelbild.pdf` (Querformat).
- Ablage nach `ablage.material` im Profil über den Ordnerzugriff auf dem Rechner der Lehrkraft (Nummer fortlaufend aus vorhandenen Ordnern); ohne Ablagemuster als Dateien im Gespräch. Geänderte Dateien überschreiben; gesperrte Dateien: Lehrkraft bitten, sie zu schließen.
- Gehört das Material zu einer Einheit aus **einheit-planen**, in deren Ordner ablegen und dort im Stoffverteilungsplan verlinken.
- Vorher über **materiallager** prüfen, ob es schon Passendes gibt (dann anpassen statt neu), und die Wissensbasis der Einheit (`quellen.md`) als Inhaltsquelle nutzen. Jede abgelegte Datei nach **materiallager** (Abschnitt 5) ins Register eintragen, fremde Bilder mit Lizenz.

## 6. Gerüst ReportLab (Primarstufe Kl. 1–4 und Notlösung ohne Chromium)

Ab Klasse 5 gilt der Baukasten aus Abschnitt 2b. Dieses Gerüst nur für Kl. 1–4 (Primarschrift, Lineatur) oder wenn Playwright/Chromium fehlt; dann im Lieferhinweis nennen.

```python
import base64
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table,
                                TableStyle, PageBreak, Flowable, Image, KeepTogether, NextPageTemplate)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.fonts import addMapping
D = "/usr/share/fonts/truetype/dejavu/"
for n, f in [("DV","DejaVuSans.ttf"),("DVB","DejaVuSans-Bold.ttf"),("DVI","DejaVuSans-Oblique.ttf")]:
    pdfmetrics.registerFont(TTFont(n, D+f))
addMapping("DV",0,0,"DV"); addMapping("DV",1,0,"DVB"); addMapping("DV",0,1,"DVI"); addMapping("DV",1,1,"DVB")
# ---- Werte aus dem Layout des Profils (ohne Profil: neutraler Standard) ----
PRIMAR_SCHRIFT = None     # layout.schrift_primar, z. B. "Grundschrift"; None = DejaVu auch in Kl. 1–4
LOGO = None               # Pfad zur Logo-Datei aus layout.logo, z. B. "<Datenordner>/profil/layout/logo.png"; None = kein Logo
LOGO_AB = 5               # layout.logo_ab_klasse
LK = ""                   # rahmen.lehrkraft_kuerzel, z. B. "Wo" (Fußzeile Klausur, Unterschriftzeile)
SCHULJAHR = "2026/27"
KLASSE = 13               # Klassenstufe 1–13
SHOW_LOGO = bool(LOGO) and KLASSE >= LOGO_AB
LW = 9*mm*(Image(LOGO).imageWidth/Image(LOGO).imageHeight) if SHOW_LOGO else 0   # Logobreite bei 9 mm Höhe
GS = KLASSE <= 4          # Primarstufe: Größen, Symbole, Schreibfelder nach Abschnitt 0a
CODE = False              # True, wenn bewertung.schueler_code.jahrgaenge die KLASSE enthält
NOTEN = {}                # Notenschlüssel der Stufe aus dem Profil, z. B. {1: 87, 2: 73, 3: 59, 4: 45, 5: 18}
if GS and PRIMAR_SCHRIFT:  # Primarschrift registrieren (Datei suchen oder anfordern, s. Abschnitt 0)
    import glob
    fs = sorted(glob.glob(f"**/{PRIMAR_SCHRIFT}*.[ot]tf", recursive=True))
    assert fs, "Schriftdatei fehlt – Lehrkraft um die Datei bitten"
    reg = next((f for f in fs if "bold" not in f.lower() and "fett" not in f.lower()), fs[0])
    bold = next((f for f in fs if "bold" in f.lower() or "fett" in f.lower()), reg)
    pdfmetrics.registerFont(TTFont("GS", reg)); pdfmetrics.registerFont(TTFont("GSB", bold))
    addMapping("GS",0,0,"GS"); addMapping("GS",1,0,"GSB"); addMapping("GS",0,1,"GS"); addMapping("GS",1,1,"GSB")
F, FB = ("GS", "GSB") if GS and PRIMAR_SCHRIFT else ("DV", "DVB")   # in allen Styles und on_page statt "DV"/"DVB" verwenden

FACH, JG, THEMA = "Chemie eA", "Jahrgang 13", "Thema"
ACC, ACC_L = colors.HexColor("#1B6F7E"), colors.HexColor("#E0F2F4")   # Fachfarbe aus layout.fachfarben bzw. Standardpalette
GRAY, GRAY_L = colors.HexColor("#5F5E5A"), colors.HexColor("#F1EFE8")
AMB_L, LGRID = colors.HexColor("#FAEEDA"), colors.HexColor("#B4B2A9")
RED, BLUE = colors.HexColor("#A32D2D"), colors.HexColor("#185FA5")
BS = 16 if KLASSE <= 2 else 14 if GS else 10.5   # Grundtextgröße
body = ParagraphStyle("b", fontName=F, fontSize=BS, leading=BS*1.5 if GS else 14.5)
small = ParagraphStyle("s", parent=body, fontSize=9, leading=12)
h1 = ParagraphStyle("h1", parent=body, fontName=FB, fontSize=BS+4 if GS else 15, leading=(BS+4)*1.3 if GS else 19, textColor=ACC, spaceAfter=4)
h2 = ParagraphStyle("h2", parent=body, fontName=FB, fontSize=BS+1 if GS else 11.5, leading=(BS+1)*1.35 if GS else 15, spaceBefore=8, spaceAfter=3)
auf = ParagraphStyle("auf", parent=h2, textColor=ACC, spaceBefore=10)
cell = ParagraphStyle("c", parent=body, fontSize=BS-2 if GS else 9.5, leading=(BS-2)*1.35 if GS else 12.5)
cellb = ParagraphStyle("cb", parent=cell, fontName=FB)
center = ParagraphStyle("ct", parent=cell, alignment=TA_CENTER)
lab = ParagraphStyle("lab", parent=cell, fontSize=8, leading=10, textColor=GRAY)
def P(t, s=body): return Paragraph(t, s)

def box(content, bg=GRAY_L, pad=6, w=174*mm):  # Tafelbild (quer): w=261*mm
    if not isinstance(content, list): content = [content]
    t = Table([[content]], colWidths=[w])
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),bg),("LEFTPADDING",(0,0),(-1,-1),pad+2),
        ("RIGHTPADDING",(0,0),(-1,-1),pad+2),("TOPPADDING",(0,0),(-1,-1),pad),("BOTTOMPADDING",(0,0),(-1,-1),pad)]))
    return t

def tbl(data, widths, extra=(), header=True, padv=4):
    t = Table(data, colWidths=widths)
    st = [("GRID",(0,0),(-1,-1),0.4,LGRID),("VALIGN",(0,0),(-1,-1),"MIDDLE"),
          ("TOPPADDING",(0,0),(-1,-1),padv),("BOTTOMPADDING",(0,0),(-1,-1),padv)]
    if header: st.append(("BACKGROUND",(0,0),(-1,0),GRAY_L))
    t.setStyle(TableStyle(st+list(extra))); return t

def lines(n, w=174*mm, gap=8*mm):
    class L(Flowable):
        def wrap(self, aw, ah): return w, n*gap
        def draw(self):
            self.canv.setStrokeColor(LGRID); self.canv.setLineWidth(0.4)
            for i in range(n): self.canv.line(0, i*gap, w, i*gap)
    return L()

class Karo(Flowable):                       # Kästchenfeld: 5 mm (Sek), Grundschule Mathe 10 mm (Kl. 1–2) / 7 mm (Kl. 3–4)
    def __init__(self, h, w=174*mm, s=5): self.w, self.h, self.s = w, h, s
    def wrap(self, aw, ah): return self.w, self.h
    def draw(self):
        c, s = self.canv, self.s*mm; c.setStrokeColor(colors.HexColor("#D9D7CF")); c.setLineWidth(0.3)
        nx, ny = int(self.w//s), int(self.h//s)
        for i in range(nx+1): c.line(i*s, 0, i*s, ny*s)
        for j in range(ny+1): c.line(0, j*s, nx*s, j*s)

class Lineatur(Flowable):                   # Grundschul-Schreiblineatur; nr = 1..4 (Kl. 1–4)
    H = {1: (5, 5, 5), 2: (4, 4, 4), 3: (3.5, 3.5, 3.5), 4: (3, 3, 3)}   # Ober-/Mittel-/Unterlänge in mm [an Schulheft anpassen]
    def __init__(self, n, nr=2, w=174*mm, gap=6*mm): self.n, self.nr, self.w, self.gap = n, nr, w, gap
    def wrap(self, aw, ah):
        o, m, u = self.H[self.nr]; self.zh = (o+m+u)*mm; return self.w, self.n*(self.zh+self.gap)
    def draw(self):
        c = self.canv; o, m, u = [x*mm for x in self.H[self.nr]]
        for i in range(self.n):
            y0 = i*(self.zh+self.gap)                      # Unterkante der Zeile
            c.setStrokeColor(colors.HexColor("#D9D7CF")); c.setLineWidth(0.4)
            c.line(0, y0, self.w, y0); c.line(0, y0+u+m+o, self.w, y0+u+m+o)
            c.setFillColor(colors.HexColor("#F4F3EE")); c.rect(0, y0+u, self.w, m, stroke=0, fill=1)   # Mittelband
            c.setStrokeColor(colors.HexColor("#8A8880")); c.setLineWidth(0.6); c.line(0, y0+u, self.w, y0+u)  # Grundlinie
            c.setStrokeColor(colors.HexColor("#D9D7CF")); c.setLineWidth(0.4); c.line(0, y0+u+m, self.w, y0+u+m)

class Sketch(Flowable):                     # Basis für Versuchsskizzen: draw_fn(c) zeichnet in mm-Koordinaten
    def __init__(self, draw_fn, h=70*mm, w=174*mm): self.f, self.w, self.h = draw_fn, w, h
    def wrap(self, aw, ah): return self.w, self.h
    def draw(self): self.f(self.canv)
    # Beispiel Elektrolyse: Becherglas (offenes U), Lösung #DCEFF5, Elektroden grau mit rot/blauem Rand,
    # Netzgerät-Kasten oben, Kreis "A" in Reihe, Kreis "V" parallel an den Elektroden,
    # Beschriftungen ab x = 82 mm rechts mit gestrichelten Hinweislinien.

class CodeFeld(Flowable):                   # Klausur-Kopftabelle Kl. 5–10: Code (z. B. KV001) statt Name
    def __init__(self, n=5, s=7*mm): self.n, self.s = n, s
    def wrap(self, aw, ah): return self.n*self.s, self.s
    def draw(self):
        c = self.canv; c.setStrokeColor(ACC); c.setLineWidth(0.8)
        for i in range(self.n): c.rect(i*self.s, 0, self.s, self.s, stroke=1, fill=0)
# Einbau in die Kopftabelle: [P("Code (z. B. KV001)", lab), CodeFeld()] als Zelleninhalt

def task(nr, text, pts, afb, karo_h):         # Klausur-Teilaufgabe + Kästchenfeld
    t = Table([[P(f"<b>{nr}</b>", cell), P(text, cell),
                P(f"<b>{pts} P.</b><br/><font size=7.5 color='#5F5E5A'>AFB {afb}</font>", center)]],
              colWidths=[11*mm, 145*mm, 18*mm])
    t.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),0),
        ("TOPPADDING",(0,0),(-1,-1),3),("BOTTOMPADDING",(0,0),(-1,-1),3),("LINEBELOW",(0,0),(-1,-1),0.3,LGRID)]))
    return [t, Spacer(1,2), Karo(karo_h)]   # mit KeepTogether(...) einbinden

class Tag(Flowable):                         # Tag("L") VOR den PageBreak zum Lehrerblatt; Tag("T") + NextPageTemplate("quer") VOR den PageBreak zum Tafelbild
    def __init__(self, t): self.settag = t
    def wrap(self, aw, ah): return 0, 0
    def draw(self): pass

def on_page_ab(c, doc):                      # Kopfzeile Arbeitsblätter
    c.saveState(); lw = LW
    if SHOW_LOGO:                            # Kl. 1–4: kein Logo, Text beginnt am linken Rand
        c.drawImage(LOGO, 18*mm, 283.5*mm, width=lw, height=9*mm, mask="auto")
    x0 = 18*mm+lw+3*mm if SHOW_LOGO else 18*mm
    hs = 10 if GS else 8.5                   # Kopfzeilengröße
    c.setFont(FB, hs); c.setFillColor(ACC); c.drawString(x0, 288.5*mm, f"{FACH} · {JG}")   # GS: JG = "Klasse 2"
    c.setFont(F, hs-0.5); c.setFillColor(GRAY); c.drawString(x0, 284.6*mm, THEMA)
    if getattr(doc, "tag", "") == "L":
        c.setFont(FB, 8); c.drawRightString(192*mm, 286*mm, "Lehrerblatt – nicht für SuS")
    elif getattr(doc, "tag", "") == "T":
        c.setFont(FB, 8); c.drawRightString(192*mm, 286*mm, "Tafelbild")
    elif GS:
        c.setFont(F, hs); c.drawRightString(192*mm, 286*mm, "Name: ____________________________")
    else:
        c.drawRightString(192*mm, 286*mm, "Name: ______________________   Datum: ___________")
    c.setStrokeColor(ACC); c.setLineWidth(1.2); c.line(18*mm, 282.3*mm, 192*mm, 282.3*mm)
    c.setFont("DV", 8); c.setFillColor(GRAY); c.drawRightString(192*mm, 10*mm, f"{doc.page}")
    c.restoreState()

def on_page_quer(c, doc):                    # Kopfzeile Tafelbild (A4 quer, 297 × 210 mm)
    c.saveState(); lw = LW
    if SHOW_LOGO: c.drawImage(LOGO, 18*mm, 193.5*mm, width=lw, height=9*mm, mask="auto")
    x0 = 18*mm+lw+3*mm if SHOW_LOGO else 18*mm; hs = 10 if GS else 8.5
    c.setFont(FB, hs); c.setFillColor(ACC); c.drawString(x0, 198.5*mm, f"{FACH} · {JG}")
    c.setFont(F, hs-0.5); c.setFillColor(GRAY); c.drawString(x0, 194.6*mm, THEMA)
    c.setFont(FB, 8); c.drawRightString(279*mm, 196*mm, "Tafelbild")
    c.setStrokeColor(ACC); c.setLineWidth(1.2); c.line(18*mm, 192.3*mm, 279*mm, 192.3*mm)
    c.restoreState()

class Doc(BaseDocTemplate):                  # AB: topMargin 16 mm, Frame-Höhe 263 mm
    def __init__(self, fn, on_page=on_page_ab, frame_h=263*mm, **kw):
        super().__init__(fn, pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=16*mm, bottomMargin=15*mm, **kw)
        fr = Frame(18*mm, 15*mm, 174*mm, frame_h, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        frq = Frame(18*mm, 15*mm, 261*mm, 165*mm, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([PageTemplate("p", [fr], onPage=on_page),
                               PageTemplate("quer", [frq], onPage=on_page_quer, pagesize=landscape(A4))]); self.tag = ""
    def afterFlowable(self, f):
        if hasattr(f, "settag"): self.tag = f.settag
# Klausur: eigenes on_page (Seite 1 ohne Kopfzeile wegen Kopftabelle; Folgeseiten Logo 7 mm nur wenn SHOW_LOGO,
# "Klausur Nr. x · Fach · Jahrgang", rechts "Code: ________" wenn CODE, sonst "Name: ___", Linie bei 283,5 mm; Fußzeile f"{LK} · {SCHULJAHR}" / "Seite n"),
# Frame-Höhe 266 mm.
```

## 7. Grundsätze

- Ruhig und wiedererkennbar: wenige Farben, feste Bausteine, viel Weißraum. Lesbarkeit vor Schmuck.
- Abbildungen: eigene vor frei lizenzierten vor selbst gezeichneten Schemata; nie Gegenständliches zeichnen, sondern per ComfyUI erzeugen (falls vorhanden) oder Platzhalter mit Suchbegriff. Versuchsskizzen und alles Genaue immer zeichnen, nie generieren.
- Barrierearm: Schrift nicht kleiner als im Abschnitt angegeben, keine Information nur über Farbe, Kontrast ausreichend.
- Alle schulspezifischen Werte (Logo, Farben, Felder, Notenschlüssel, Ablage) aus dem Profil; ohne Profil neutral.
- Vor der Lieferung jede Seite als Bild prüfen (Abschnitt 5).