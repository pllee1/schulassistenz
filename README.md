# schulassistenz

Plugin für Claude, das Lehrkräften Routinearbeit im Schulalltag abnimmt: Unterricht und Einheiten planen, Material und Prüfungen gestalten und korrigieren, Beobachtungen, Lernstandsakten, Zeugnisse, Elterngespräche, Postfach, Verwaltung und Wochenplanung. Für alle Fächer und Schulformen; alles Schulspezifische steht im eigenen Schulprofil.

Schülerinnen und Schüler kommen nur als Kürzel vor. Dieses Verzeichnis enthält keine Schülerdaten und keine persönlichen Einstellungen.

## Installieren

In der Claude-Desktop-App: „Anpassen“ → Plugins → „Marketplace hinzufügen“ (Add marketplace) → `pllee1/schulassistenz` → Plugin **schulassistenz** installieren. Danach „Richte schulassistenz ein.“ schreiben.

Ausführliche Einrichtung: [plugin/README.md](plugin/README.md)

## Aufbau

- `.claude-plugin/marketplace.json` – Marketplace-Eintrag
- `plugin/` – das Plugin (Skills und Werkzeuge: Startseite, Pseudonymisierer, IServ-Helfer, Abschluss-Check)
- `updater/` – Windows-Skript, das die Werkzeuge im Datenordner automatisch aktuell hält ([LIESMICH](updater/LIESMICH.md))

## Neue Fassung veröffentlichen

1. Änderungen in `plugin/` vornehmen.
2. Version in `plugin/.claude-plugin/plugin.json` und `.claude-plugin/marketplace.json` erhöhen (beim IServ-Helfer zusätzlich in dessen `manifest.json`).
3. Auf `main` hochladen. Claude-App und Updater holen die neue Fassung von selbst.
