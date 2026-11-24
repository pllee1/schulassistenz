# Bilder mit ComfyUI erzeugen (optional)

Gilt für **material-gestalten** und **plakat-gestalten**. Voraussetzung: Die Tools des MCP-Servers `comfyui` sind in der Sitzung vorhanden (lokal in der Claude-Desktop-App eingetragen, in Chats als `…comfyui__…`-Tools durchgereicht; ComfyUI läuft auf dem Rechner der Lehrkraft; Einrichtung in `plugin/README.md`, Abschnitt „Bilder mit ComfyUI“). Nicht über den Browser auf ComfyUI zugreifen. Fehlen sie, diesen Weg überspringen, nicht nachfragen und nichts installieren.

## 1. Grundregel: genau → zeichnen, gegenständlich → ComfyUI

KI-Bildmodelle erfinden Details: falsche Geräte, Kabel ins Leere, zu viele Beine, Fantasie-Schrift. Deshalb:

**Nie mit ComfyUI, immer selbst zeichnen (SVG/ReportLab nach material-gestalten Abschnitt 2 und Illustrationsstil):**
- Versuchsskizzen, Geräteaufbauten, Schaltungen, Messaufbauten,
- Querschnitte und Profile, Modellbilder, Teilchenmodelle, Strukturformeln,
- Kreisläufe, Abläufe, Pfeil- und Flussdiagramme, Diagramme und Diagrammraster, Zeitleisten, Karten,
- alles mit Beschriftung, Zahlen, Mengen oder einer Anordnung, die fachlich stimmen muss.

**ComfyUI möglich**, wo bisher nur ein Platzhalter bliebe, weil nichts Gegenständliches gezeichnet wird (material-gestalten 2a, Schritt 3):
- Bildkarten und Wortspeicher-Bilder (Kl. 1–4: Tiere, Gegenstände, Tätigkeiten), Bilder für Hilfekarten ohne Fachdetail,
- Situationsbilder für den Alltagsbezug („Worum es geht“), Einstiegsbilder, Erzählanlässe,
- Blickfang auf Plakaten und Aushängen, Hintergrundmotive ohne Fachinhalt.

Ein **echtes, frei lizenziertes Foto geht vor**, wenn ein bestimmter Ort, ein echtes Objekt oder ein bestimmtes Lebewesen gezeigt werden soll (Rammelsberg, ein Mineral, eine Pflanzenart). Bei einem **Set von Bildkarten** in einheitlichem Stil darf ComfyUI zuerst kommen, weil gemischte Fotos und Piktogramme unruhig wirken.

Verboten: reale Personen und Lernende, Fotos von Lernenden als Vorlage, Logos, Marken und bekannte Figuren aus Büchern, Filmen und Spielen, Gewalt, Gruseliges.

## 2. Ablauf

1. **Erreichbar?** `health_check` (oder `get_system_stats`) aufrufen. Antwortet ComfyUI nicht: einen Satz an die Lehrkraft („ComfyUI läuft nicht. Starte es, dann erzeuge ich die Bilder.“) und weiter mit Platzhalter (Abschnitt 4).
2. **Modelle und Workflow:** `list_local_models` und `list_workflows`; nur vorhandene Modelle nutzen. Gibt es einen gespeicherten Workflow `bildkarte-klein.json` (FLUX.2 [klein], Text zu Bild), immer diesen verwenden: `get_workflow` (Format `api`), im Knoten mit Titel „Prompt“ (`PrimitiveStringMultiline`) den Text ersetzen, bei `SaveImage` den `filename_prefix` auf `KI_<Motiv>` setzen, Breite/Höhe in den `PrimitiveInt`-Knoten „Width“/„Height“ anpassen und mit `enqueue_workflow` starten. `generate_image` nur, wenn kein solcher Workflow existiert und ein Checkpoint-Modell vorhanden ist (FLUX.2 liegt unter `diffusion_models` und funktioniert damit nicht). **Ohne Rückfrage nie** `download_model`, Custom Nodes installieren, `restart_comfyui` oder Civitai/Hugging Face nutzen.
3. **Prompt** auf Englisch, einheitlich für das ganze Material:
   - Stil: `flat vector illustration, children's book style, soft muted colors, clean outlines, plain white background, single centered subject, no text`
   - Negativ (nur bei Modellen mit Negativ-Prompt, nicht bei FLUX.2 [klein] mit CFG 1): `text, letters, words, numbers, watermark, signature, logo, frame, photo, realistic, scary, blurry, extra limbs`
   - Motiv knapp und konkret („a red apple“, „a child watering plants in a school garden“). Farben nach der Naturpalette des Illustrationsstils, die Fachfarbe höchstens als Akzent.
   - Format: Bildkarte 1024 × 1024, Situationsbild 1216 × 832 (quer), Plakat-Blickfang nach Fläche. Bei Sets denselben Seed-Bereich und Prompt-Rahmen verwenden.
4. **Erzeugen:** je Motiv 2–3 Varianten (Seed im Knoten `RandomNoise` ändern oder Zufall lassen). Status mit `get_job_status`; ein Bild dauert etwa 5–25 Sekunden.
5. **Ansehen und prüfen** (`list_assets` → `view_image` mit der `asset_id`), jede Variante:
   - Stimmt das Motiv fachlich und sachlich (Anzahl Beine, Blätter, Finger, Form)? Kein Text und keine Pseudo-Schrift im Bild?
   - Kindgerecht, freundlich, eindeutig erkennbar auch klein (Bildkarte 25 mm)?
   - Graustufen-Probe (mit Python/PIL in Graustufen umwandeln und ansehen): Bleibt das Motiv auf dem Schwarz-Weiß-Kopierer erkennbar?
   - Passt keine Variante: Prompt einmal schärfen. Danach Platzhalter statt eines schlechten Bildes.
6. **Übernehmen:** `view_image` legt eine Kopie in der Sitzung ab (Pfad steht in der Antwort); diese Datei weiterverwenden. Sonst liegt das Bild im Ausgabeordner von ComfyUI (Desktop unter Windows: `%LOCALAPPDATA%\Comfy-Desktop\ComfyUI-Shared\output`). Im Ordner der Einheit als `KI_<Motiv>.png` ablegen. Beschriftungen setzt das Layout (`bild` bzw. SVG-Text), nie das Bildmodell.

## 3. Kennzeichnung und Ablage

- Quellenzeile unter dem Bild (7,5 pt grau): „Bild: KI-generiert (ComfyUI, <Modell>)“. Im Lehrerblatt bei den Quellen dazu den Prompt notieren, damit das Bild wieder erzeugt werden kann.
- Lizenz des Modells beachten (Unterrichtsnutzung muss erlaubt sein); im Zweifel im Abschlusshinweis nennen.
- In **materiallager** eintragen: Art „Abbildung“, Lizenz „KI-generiert, <Modell>“, Prompt als Schlagwort-Notiz.
- Keine Schülerdaten, Namen oder Kürzel in Prompts. Die Erzeugung läuft lokal, es verlässt nichts den Rechner.

## 4. Ohne ComfyUI

Platzhalter wie in material-gestalten 2a, Schritt 4, zusätzlich mit der Zeile „Mit ComfyUI erzeugbar: <Prompt>“, wenn das Motiv nach Abschnitt 1 dafür geeignet ist. So lässt sich das Bild später nachholen.
