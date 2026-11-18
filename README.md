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

## Neue Fassung veröffentlichen

1. Änderungen in `plugin/` vornehmen.
2. Version in `plugin/.claude-plugin/plugin.json` und `.claude-plugin/marketplace.json` erhöhen (beim Schulassistenz-Helfer zusätzlich in dessen `manifest.json`).
3. Auf `main` hochladen. Claude-App und Updater holen die neue Fassung von selbst.
