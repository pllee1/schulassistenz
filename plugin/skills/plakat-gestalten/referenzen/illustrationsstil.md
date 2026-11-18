# Illustrationsstil von schulassistenz

Gilt für alle selbst gezeichneten Abbildungen: Querschnitte, Profile, Modellbilder, Bildfolgen, Schaubilder, Infografiken und Plakate. Der Skill **material-gestalten** und der Skill **plakat-gestalten** verweisen hierher. Versuchsskizzen (Geräteaufbau) bleiben bewusst flach und technisch, siehe material-gestalten Abschnitt 2.

Ziel: Abbildungen, die ruhig, stofflich und professionell wirken, auch nach dem Schwarz-Weiß-Kopierer noch lesbar sind und eine Aufgabe tragen. Gebaut wird als **SVG**, gerendert mit `skripte/render.py` (PNG zum Prüfen und Einbauen, PDF für den Druck).

## 1. Was eine Abbildung ansehnlich macht

1. **Stoff statt Fläche.** Jede größere Fläche bekommt einen sanften linearen Verlauf (oben heller, unten dunkler; Unterschied ca. 10–20 % Helligkeit). Gesteine, Böden und Papier zusätzlich eine leichte Körnung (Filter `koernung`, Deckkraft 0,08–0,12). Keine knalligen Reinfarben.
2. **Weiche Phänomene weich zeichnen.** Rauch, Dampf, Wolken, Glut, Licht: aus vielen überlappenden Kreisen oder Pfaden, dann Filter `rauch` (Turbulenz + Unschärfe) bzw. `weich`. Nie einzelne harte Kreise nebeneinander.
3. **Formen leicht unregelmäßig.** Erdoberflächen, Schichtgrenzen, Wasserlinien als Bézierkurven mit kleinen Schwankungen, nicht als gerade Linien oder exakte Bögen. Technische Dinge (Gefäße, Gebäude, Pfeile) dagegen sauber geometrisch.
4. **Licht und Tiefe sparsam.** Eine Lichtrichtung (oben links). Ein heller Kantenstrich (1–3 px, Deckkraft 0,5–0,7) an Oberkanten, eine leichte Schattenseite an Körpern (Verlauf quer). Hintergrund blasser und weniger gesättigt als der Vordergrund (Luftperspektive).
5. **Begrenzte Palette.** Pro Abbildung höchstens 5 Farbfamilien plus Neutraltöne. Naturtöne aus Abschnitt 3, die Fachfarbe nur als Akzent (Nummern, Hervorhebungen, Pfeile, auf die es ankommt).
6. **Beschriftung als System, nicht als Aufkleber.** Keine weißen Kästchen mitten im Bild. Beschriftungen in einer Schrift, zwei Größen, mit Führungslinien (Abschnitt 4).
7. **Weißraum und Ruhe.** Lieber ein Element weniger. Jede Form muss etwas zeigen, das für die Aufgabe nötig ist.
8. **Nichts Gegenständliches nachbauen, das man nicht gut kann.** Keine Menschen, Strichmännchen, Tiere, Pflanzen im Detail, Organe, Fahrzeuge. Stattdessen: Symbol (Förderturm-Silhouette, Baum als Dreieck), frei lizenzierte Illustration (Abschnitt 7) oder Platzhalter.

## 2. Bildfolgen (Bild 1–4, Vorher–Nachher, Ablauf)

- **Gleicher Ausschnitt, gleicher Maßstab, gleicher Horizont** in allen Bildern, damit die Veränderung ins Auge springt. Elemente, die bleiben, stehen an derselben Stelle und haben dieselbe Farbe.
- Gleiche Bildgröße und gleiches Seitenverhältnis (Standard 800 × 560, also 10:7).
- **Nummer** als Kreis oben links in der Fachfarbe (Durchmesser 40 px, Ziffer fett weiß).
- Was sich ändert, wird betont (Akzentfarbe, Pfeil), was gleich bleibt, tritt zurück (blasser).
- Bewegung durch Pfeile mit Richtung: weiche, leicht gebogene Pfeile mit kleiner Spitze, nie dicke Blockpfeile.
- Zeit: falls wichtig, kleine Zeitmarke unten rechts („vor 390 Mio. Jahren“), nicht in der Bildmitte.

## 3. Naturpalette (Verläufe oben → unten)

| Stoff | hell | mittel | dunkel | Hinweis |
|---|---|---|---|---|
| Himmel | #e3eef5 | #bcd6e8 | #9fc3dd | unten heller (Horizont) |
| Meer, Wasser | #8cc6ea | #5a9fcf | #3a7fb3 | Lichtstrahlen weiß 0,15 |
| Tiefsee | #5a9fcf | #2f6f9f | #1f4f78 | nur wenn Druckfassung geprüft |
| Sand, Sediment | #d8c39e | #b59a76 | #8c7154 | Körnung, Schichtlinien |
| Gestein, Fels | #c2b8aa | #9a8f80 | #6f665b | Körnung |
| Magma, Glut | #c8441f | #9e2c16 | #6e1d0f | Glühen: #ffb35c, weich |
| Erz, Metall | #5a5866 | #3b3a40 | #2a2930 | Funkeln #d9b44a, #d9dde2 |
| Wiese, Wald | #8fb879 | #6f9a5a | #4f7a40 | |
| Eis, Schnee | #ffffff | #e6f0f6 | #c9dbe6 | bläuliche Schatten |
| Holz, Gebäude | #a8744f | #8a5a3c | #6e4530 | |
| Rauch | #5d5650 | #3a3632 | #2a2522 | Filter `rauch` |
| Flüssigkeit im Glas | #d6ecf7 | #b4dbef | | halbtransparent 0,7 |

Textfarbe dunkel `#1d2a33`, hell `#ffffff`. Fachfarbe aus dem Layout (material-gestalten Abschnitt 1).

## 4. Beschriftung

- **Schrift:** aus der Layout-Datei (`layout.schrift_grafik`, sonst `layout.schrift`), wenn die Datei vorliegt; sonst **Instrument Sans** (liegt im Ordner `schriften/`). Für Plakat-Überschriften alternativ **Outfit** (fett), für ruhige, textreiche Plakate **Lora** (Serifen). Primarstufe: Primarschrift aus dem Profil.
- **Größen (bei 800 px Bildbreite):** Beschriftung 17 px halbfett, Zusatz 15 px normal, Nummer 20 px fett. Auf A4 halbe Breite ergibt das ca. 8–9 pt. Nie kleiner als 7 pt im Druck.
- **Halo statt Kasten:** dunkle Schrift mit hellem Rand: `paint-order:stroke; stroke:#fff; stroke-opacity:.85; stroke-width:3.5px; stroke-linejoin:round`. Auf sehr dunklem Grund umgekehrt weiße Schrift ohne Rand.
- **Führungslinien:** 1,4 px, Textfarbe, am Objekt ein Punkt (r = 3), dann waagerecht (ggf. mit einem Knick) zur Beschriftung. Beschriftungen bündig in einer Spalte am Bildrand, wenn möglich. Linien kreuzen sich nie.
- Flächen, die groß genug sind (Meer, Boden), werden direkt in der Fläche beschriftet, links bündig mit 40 px Abstand zum Rand.
- **Zum Ausfüllen:** Für Beschriftungsaufgaben die Beschriftung durch eine Linie + Ziffer ersetzen; Lösung im Lehrerblatt.

## 5. Druck und Kopierer

- Viele Schulen kopieren schwarz-weiß. `render.py` erzeugt immer eine **Graustufen-Probe** (`*_grau.png`). Ansehen und prüfen: Sind benachbarte Flächen unterscheidbar (Helligkeitsabstand ≥ 15 %)? Ist jede Beschriftung lesbar? Sonst Helligkeit staffeln (z. B. Wasser hell, Gestein mittel, Magma dunkel) oder Muster ergänzen (Schichtlinien, Punktraster).
- Farbe nie als einziges Unterscheidungsmerkmal (auch wegen Farbsehschwäche): zusätzlich Beschriftung, Muster oder Form. Rot und Grün nicht als Gegensatzpaar.
- Für AB-Einbau: PNG mit `--dpi 300` in voller Druckgröße rendern und in ReportLab als `Image` einsetzen (Breite in mm vorgeben). Für Plakate PDF (`--pdf`).

## 6. Prüfschleife (immer)

1. Rendern, PNG und Graustufen-Probe ansehen.
2. Prüfen: Überlappt Text etwas? Ragt etwas aus dem Bild? Kreuzen sich Führungslinien? Ist das Wichtigste auf Anhieb zu sehen? Stimmt der Fachinhalt (Schichtfolge, Pfeilrichtung, Größenverhältnisse)?
3. Zweiter Durchgang **verfeinern statt ergänzen**: Abstände angleichen, Kanten ruhiger, Farben harmonisieren, Überflüssiges streichen. Nicht noch mehr Formen hinzufügen.
4. Erst dann ausliefern. Wirkt eine Form trotzdem laienhaft: durch Symbol, frei lizenzierte Illustration oder Platzhalter ersetzen.

## 7. Frei lizenzierte Illustrationen

Für Motive, die man nicht schematisch zeichnen kann, vor dem Platzhalter hier suchen (Lizenz je Bild prüfen, Quellenzeile setzen, im Materiallager vermerken):

- **Servier Medical Art** (smart.servier.com): Biologie, Medizin, Zellen, Organe, Laborgeräte. Lizenz CC BY 4.0, Quellenzeile „Servier Medical Art, CC BY 4.0“.
- **Bioicons** (bioicons.com): Biologie- und Chemie-Piktogramme, Lizenz je Symbol (CC0, CC BY, CC BY-SA, MIT).
- **Wikimedia Commons**: Fotos, Karten, Schaubilder, Lizenz je Datei.
- **Openverse** (openverse.org): Suchmaschine über frei lizenzierte Bilder.
- **ARASAAC** (arasaac.org): Piktogramme für Primarstufe und Sprachförderung, CC BY-NC-SA (nicht kommerziell: im Unterricht in Ordnung).

SVG-Dateien dieser Quellen lassen sich direkt in die eigene SVG einsetzen (als `<image href=…>` oder eingebettet) und mit der Palette umfärben, wenn die Lizenz Bearbeitungen erlaubt (CC BY, CC BY-SA, CC0).

## 8. Bausteine (SVG)

In `<defs>` einsetzen, IDs bei Bedarf anpassen. Vollständige Beispiele: `beispiele/erzbildung-1-heisse-quelle.svg` (Meer, Schlote, Rauch, Glut) und `beispiele/erzbildung-4-rammelsberg.svg` (Berg, Schichten, Erzlager, Wetter).

```xml
<!-- Grundgerüst einer Abbildung -->
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" viewBox="0 0 800 560">
<style>
  .lab{font:600 17px 'Instrument Sans',sans-serif;fill:#1d2a33;paint-order:stroke;stroke:#fff;stroke-opacity:.85;stroke-width:3.5px;stroke-linejoin:round}
  .zus{font:400 15px 'Instrument Sans',sans-serif;fill:#1d2a33;paint-order:stroke;stroke:#fff;stroke-opacity:.85;stroke-width:3px}
  .labw{font:600 17px 'Instrument Sans',sans-serif;fill:#fff}
  .num{font:700 20px 'Instrument Sans',sans-serif;fill:#fff}
</style>
<defs>
  <clipPath id="bild"><rect width="800" height="560" rx="10"/></clipPath>

  <!-- Verlauf, Beispiel Wasser -->
  <linearGradient id="wasser" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8cc6ea"/><stop offset=".55" stop-color="#5a9fcf"/><stop offset="1" stop-color="#3a7fb3"/>
  </linearGradient>

  <!-- Körnung: als Rechteck über die Fläche legen: <rect … filter="url(#koernung)" fill="#000"/> -->
  <filter id="koernung"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="2"/>
    <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .10 0"/>
    <feComposite in2="SourceGraphic" operator="in"/></filter>

  <!-- Rauch, Dampf, Wolken: auf eine Gruppe vieler Kreise anwenden -->
  <filter id="rauch" x="-60%" y="-30%" width="220%" height="160%">
    <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="4"/>
    <feDisplacementMap in="SourceGraphic" scale="30"/>
    <feGaussianBlur stdDeviation="4"/></filter>

  <!-- weiches Glühen, Wolken, Lichtschein -->
  <filter id="weich" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="14"/></filter>

  <!-- Lichtstrahl im Wasser -->
  <linearGradient id="strahl" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>

  <!-- Körper mit Schattenseite (Licht von links) -->
  <linearGradient id="koerper" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#2a2522"/><stop offset=".45" stop-color="#4a413b"/><stop offset="1" stop-color="#1c1917"/></linearGradient>

  <!-- Pfeilspitze für weiche Pfeile -->
  <marker id="spitze" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,1 L9,5 L0,9 Z" fill="context-stroke"/></marker>
</defs>
<g clip-path="url(#bild)">
  <!-- Fläche mit Verlauf und unregelmäßiger Oberkante -->
  <path d="M0,330 C120,322 200,338 330,330 C460,322 560,340 800,328 V470 H0Z" fill="url(#wasser)"/>
  <!-- heller Kantenstrich -->
  <path d="M0,330 C120,322 200,338 330,330 C460,322 560,340 800,328" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/>
  <!-- weicher Pfeil -->
  <path d="M200,300 C240,260 300,250 340,270" fill="none" stroke="#8a3b12" stroke-width="3" stroke-linecap="round" marker-end="url(#spitze)"/>
  <!-- Beschriftung mit Führungslinie -->
  <g stroke="#1d2a33" stroke-width="1.4" fill="none"><circle cx="300" cy="128" r="3" fill="#1d2a33"/><path d="M300,128 H392"/></g>
  <text x="400" y="134" class="lab">Beschriftung</text>
  <!-- Nummer einer Bildfolge -->
  <circle cx="34" cy="34" r="20" fill="#8a3b12"/><text x="34" y="41" text-anchor="middle" class="num">1</text>
</g>
</svg>
```

Rauchfahne erzeugen (Python, Kreise werden nach oben größer und wandern leicht):

```python
import random
def fahne(x, y=300, seed=1, oben=40):
    random.seed(seed); r, teile = 10, []
    while y > oben:
        teile.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.0f}"/>')
        y -= r * 0.7; x += random.uniform(-6, 6); r = min(r + 1.6, 38)
    return '<g filter="url(#rauch)" fill="#35312e" opacity=".9">' + "".join(teile) + "</g>"
```

Diagramme mit Messwerten (Säulen, Linien, Streudiagramme) nicht hier, sondern nach dem Skill **dataviz** bauen (wenn verfügbar), mit der Fachfarbe als erster Reihenfarbe und denselben Schriften.
