---
name: "plakat-gestalten"
description: "Gestaltet Lernplakate, Infografiken, Schaubilder, Bildfolgen und Aushänge jedes Fachs (schulassistenz) als ansehnliche SVG/PDF im Layout der Schule: Illustrationsstil mit Verläufen und Führungslinien, Druck- und Kopierer-Probe."
---

# Plakat gestalten

Für alles, was **angeschaut** wird statt bearbeitet: Lernplakate für die Klassenwand, Infografiken, Schaubilder und Bildfolgen (z. B. „Wie entsteht ein Erzlager?“ in vier Bildern), Aushänge (Elternabend, AG, Projekttag, Exkursion), Plakatvorlagen für Schülerpräsentationen, Folien-Grafiken für den Beamer. Arbeitsblätter, Klausuren und Tafelbilder setzt **material-gestalten**; dessen Abbildungen zeichnet es nach demselben Illustrationsstil (siehe unten).

Arbeitet ohne Schülerdaten. Auf Aushängen keine Namen von Lernenden; Fotos von Lernenden nur, wenn die Lehrkraft die Einwilligung bestätigt.

**Pflichtlektüre vor dem ersten Strich:** `referenzen/illustrationsstil.md` (in diesem Skill-Ordner). Dort stehen Palette, Beschriftung, Bausteine, Prüfschleife. Zwei vollständige Beispiele liegen in `beispiele/`. Vor dem ersten KI-Bild (ComfyUI) zusätzlich `referenzen/bildgenerierung.md` lesen.

## 0. Vorher

- **Profil** über **schulprofil** lesen: `layout` (Layout-Datei mit Logo, Schrift, Fachfarben), `rahmen`, `ablage.material`. Ohne Layout-Datei: neutraler Standard (kein Logo, Instrument Sans, Fachfarben aus material-gestalten Abschnitt 1).
- **Lerngruppe** genannt: Fach, Jahrgang, Niveau aus `lerngruppen/<gruppe>/gruppe.md`.
- **materiallager** fragen, ob es zum Thema schon Plakate, Bilder oder eine Wissensbasis (`quellen.md`) gibt. Inhalte von dort nehmen statt neu erfinden; vorhandene Grafiken überarbeiten statt neu zeichnen.
- Hat die Lehrkraft eine eigene Skizze, ein Foto der Tafel oder eine alte Grafik hochgeladen: das ist die inhaltliche Vorlage. Inhalt übernehmen, Gestaltung nach dem Illustrationsstil erneuern.

## 1. Klären (kurz, höchstens drei Fragen, sonst sinnvoll annehmen)

- **Wozu?** Lernplakat (dauerhaft an der Wand), Bildfolge/Schaubild (für ein AB oder den Beamer), Aushang (Information), Präsentationsvorlage.
- **Kernaussage** in einem Satz. Alles auf dem Plakat dient dieser Aussage.
- **Format und Lesedistanz:** A4 hoch (Aushang), A3 (Lernplakat, Standard), A2/A1 (Druckerei oder A3-Kacheln), 16:9 (Beamer), 800 × 560 je Bild (Bildfolge für AB).
- **Druck:** farbig oder Schwarz-Weiß-Kopierer? Ohne Angabe: beides muss funktionieren.

## 2. Aufbau

**Lernplakat / Infografik**
- Eine Überschrift als Frage oder Aussage, 1 Kernbild oder Schaubild als Blickfang (ca. 40–60 % der Fläche), 3–5 Inhaltsblöcke, ein Merksatz.
- Lesepfad eindeutig: oben links → unten rechts, oder nummeriert, oder im Kreis (Kreisläufe). Die **Form des Schaubilds folgt dem Inhalt**: Kreislauf als Kreis, Ablauf als Pfeilkette, Vergleich als Spalten nebeneinander, Aufbau als Querschnitt, Ordnung als Baum, Zeit als Zeitleiste. Probe: Würde man den Zusammenhang auch ohne Text an der Anordnung erkennen? Wenn nicht, Anordnung ändern.
- Raster: Ränder 5 % der kurzen Seite, Spalten mit gleichem Abstand, alles an Rasterlinien ausgerichtet.
- Text knapp: Stichworte und kurze Sätze, Fachbegriffe fett, keine Absätze über 3 Zeilen.

**Schriftgrößen (Lesedistanz Klassenraum bis 6 m)**

| Format | Überschrift | Zwischentitel | Text | Beschriftung im Bild |
|---|---|---|---|---|
| A4 Aushang | 32–40 pt | 18 pt | 12–14 pt | 10 pt |
| A3 Lernplakat | 54–72 pt | 28 pt | 18–20 pt | 14 pt |
| A2 / A1 | ×1,4 / ×2 von A3 | | | |
| Beamer 16:9 (1920 px) | 64 px | 40 px | 32 px | 26 px |

Überschrift in Outfit fett oder der Layout-Schrift, Text in Instrument Sans (bzw. Layout-Schrift). Primarstufe: Primarschrift, größer, Bild vor Text.

**Bildfolge / Schaubild für ein AB**
- Nach `referenzen/illustrationsstil.md` Abschnitt 2 (gleicher Ausschnitt, gleiche Farben, Nummern). Jedes Bild einzeln als SVG und PNG (300 dpi in Druckgröße), damit material-gestalten sie einbauen kann (z. B. Bilder zum Ausschneiden und Einkleben, Beschriftungsaufgaben).
- Für Zuordnungs- oder Beschriftungsaufgaben eine **Schülerfassung** (Beschriftung durch Linie + Ziffer ersetzt, Bildreihenfolge gemischt) und eine **Lösungsfassung** erzeugen.

**Aushang**
- Wer, was, wann, wo, was mitbringen, Rückmeldung bis wann. Datum und Uhrzeit groß. Logo und Schulname nach Layout-Datei. QR-Code nur, wenn die Lehrkraft eine Adresse vorgibt.

## 3. Abbildungen beschaffen

Reihenfolge wie in material-gestalten Abschnitt 2a:
1. Bilder der Lehrkraft,
2. frei lizenzierte Bilder und Illustrationen (Wikimedia Commons, Servier Medical Art, Bioicons, Openverse; Liste im Illustrationsstil Abschnitt 7) mit Quellenzeile,
3. selbst gezeichnet nach dem Illustrationsstil: Querschnitte, Profile, Modellbilder, Kreisläufe, Bildfolgen, Schaubilder, Symbole, Versuchsaufbauten – alles, was fachlich genau stimmen muss, **nie generiert**,
4. gegenständliche Motive ohne Fachdetail (Blickfang, Situationsbild, Bildkarten) mit **ComfyUI**, wenn dessen Tools vorhanden sind: nach `referenzen/bildgenerierung.md`,
5. sonst Platzhalter mit Suchbegriff (und Prompt-Vorschlag für ComfyUI).

Messwert-Diagramme nach dem Skill **dataviz** (wenn vorhanden), Fachfarbe als erste Reihe.

## 4. Bauen

- Plakat als **eine SVG** in Zielgröße (Breite/Höhe in mm, `viewBox` in mm oder px), Schrift per `font-family`. Text, der umbrechen muss, vorher in Zeilen teilen (SVG bricht nicht um) oder das Plakat als HTML mit eingebetteten SVG-Bildern bauen; beides rendert `render.py`.
- Farben: Fachfarbe (Akzent und Überschrift), Funktionsfarben wie in material-gestalten (Merkkasten orange hell `#FAEEDA`), Naturpalette für Abbildungen. Hintergrund weiß oder sehr hell, nie vollflächig dunkel (Toner, Lesbarkeit).
- Logo nach Layout-Datei oben links oder unten rechts, klein.
- Quellenzeilen unten in 7–8 pt grau gesammelt.

## 5. Rendern und prüfen

```bash
python3 <skill-ordner>/skripte/render.py plakat.svg --pdf --dpi 150   # Plakat: PDF + PNG + Graustufen-Probe
python3 <skill-ordner>/skripte/render.py bild1.svg --dpi 300          # Bild für ein AB
```

`<skill-ordner>` ist der Ordner dieser SKILL.md. Das Skript installiert die Schriften aus `schriften/` und nimmt Chromium (Playwright), sonst rsvg-convert, sonst cairosvg (ohne Filter, dann Filter durch Verläufe ersetzen).

Dann die **Prüfschleife** aus dem Illustrationsstil Abschnitt 6: PNG und Graustufen-Probe ansehen, Überlappungen und Überlauf beheben, Fachinhalt prüfen, im zweiten Durchgang verfeinern statt ergänzen. Zusätzlich beim Plakat: Ist die Kernaussage aus 3 m Entfernung (PNG auf 25 % verkleinert) noch erkennbar?

Große Formate auf A3/A4 kacheln, wenn die Schule keinen Plotter hat: `qpdf`/`pdfposter` oder per Python in Kacheln mit 10 mm Überlappung und Klebemarken.

## 6. Ablieferung

- Dateien: `Plakat_<Kurztitel>.pdf` (Druck), `.png` (Vorschau, Beamer), `.svg` (bearbeitbar, z. B. in Inkscape). Bei Bildfolgen je Bild `Bild1_<Kurztitel>.png/.svg` und eine Übersicht.
- Ablage nach `ablage.material` im Profil (Ordner der Einheit, falls aus **einheit-planen**), sonst als Dateien im Gespräch.
- Ins Register von **materiallager** eintragen (Art „Plakat“, „Infografik“ oder „Abbildung“, Thema, Schlagworte, Lizenz fremder Bilder).
- Im Abschlusshinweis kurz nennen: Format, Druckempfehlung (farbig / S-W geprüft), Platzhalter, fremde Bilder mit Lizenz.

## Lizenzhinweis

Die Schriften in `schriften/` stehen unter der SIL Open Font License 1.1 (Lizenztexte daneben). Einzelne Prüf- und Sorgfaltsregeln sind angelehnt an den Skill „canvas-design“ aus github.com/anthropics/skills (Apache License 2.0), siehe NOTICE im Plugin.
