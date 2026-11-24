# schulassistenz

Plugin für Claude, das Lehrkräften Routinearbeit im Schulalltag abnimmt: Unterricht und Einheiten planen, Material und Prüfungen gestalten und korrigieren, Beobachtungen, Lernstandsakten, Zeugnisse, Elterngespräche, Postfach, Verwaltung und Wochenplanung. Für alle Fächer und Schulformen; alles Schulspezifische steht im eigenen Schulprofil.

Schülerinnen und Schüler kommen nur als Kürzel vor. Dieses Verzeichnis enthält keine Schülerdaten und keine persönlichen Einstellungen.

## Installieren

In der Claude-Desktop-App links in der Seitenleiste auf **Plugins** → oben rechts **„Hinzufügen“** → Marketplace `pllee1/schulassistenz` eintragen → Plugin **schulassistenz** installieren. Danach in einem neuen Chat „Richte schulassistenz ein.“ schreiben.

Wurde früher schon eine Fassung direkt hochgeladen (erscheint unter Plugins als „Von dir“ mit älterer Versionsnummer), diese zuerst über „…“ entfernen – sonst bleibt die alte Fassung stehen und die Marketplace-Fassung wird nicht aktiv.

Ausführliche Einrichtung: [plugin/README.md](plugin/README.md)

## Aufbau

- `.claude-plugin/marketplace.json` – Marketplace-Eintrag
- `plugin/` – das Plugin (Skills und Werkzeuge: Startseite, Pseudonymisierer, Schulassistenz-Helfer, Abschluss-Check)
- `updater/` – Windows-Skript, das die Werkzeuge im Datenordner automatisch aktuell hält ([LIESMICH](updater/LIESMICH.md))

## Gestaltung der Werkzeuge

Alle lokalen Werkzeuge (Startseite und ihre Module, Pseudonymisierer, Helfer-Fenster, neue Tools) haben ein **dunkles Design**, unabhängig von der Einstellung des Systems. Farben wie auf der Startseite: Hintergrund `#11161e`, Flächen `#19212c`, Text `#e6ebf2`, gedämpft `#9aa5b5`, Linien `#2a3544`, Akzent `#7fb0f0`, ok `#6fcf97`, Warnung `#f2b45a`, Fehler `#ff8a80`, dazu `color-scheme: dark`. Neue Module der Startseite nutzen die CSS-Variablen der Startseite (`--bg`, `--surface`, `--ink`, `--muted`, `--line`, `--accent`, `--ok`, `--warn`, `--err` …) statt eigener Farben. Ausdrucke (PDF, Briefe, Arbeitsblätter) bleiben hell.

## Neue Fassung veröffentlichen

1. Änderungen in `plugin/` vornehmen.
2. Version in `plugin/.claude-plugin/plugin.json` und `.claude-plugin/marketplace.json` erhöhen (beim Schulassistenz-Helfer zusätzlich in dessen `manifest.json`).
3. Auf `main` hochladen. Claude-App und Updater holen die neue Fassung von selbst.
