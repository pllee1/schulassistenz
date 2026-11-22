# schulassistenz-Update (Windows)

Hält Startseite, Schulassistenz-Helfer, Pseudonymisierer und Abschluss-Check im Datenordner aktuell. Es lädt nur herunter, es lädt nichts hoch.

**Neuer PC:** `Neuer-PC-einrichten.cmd` im Datenordner doppelklicken. Es macht alles von `einrichten.cmd` und verbindet zusätzlich IServ als Laufwerk (Adressen aus `profil\profil.md`, Passwort fragt Windows ab), öffnet die Erweiterungsseite von Chrome bzw. Edge mit dem Helfer-Pfad in der Zwischenablage und sagt am Ende, was noch fehlt. Mehrfach starten schadet nicht, es ändert nur Fehlendes.

**Einrichten (einmal je PC):** `einrichten.cmd` doppelklicken. Das legt an:
- eine Autostart-Verknüpfung „schulassistenz-Update“ (läuft bei jeder Anmeldung unsichtbar),
- eine Aufgabe „schulassistenz-Update“ in der Aufgabenplanung (alle 2 Stunden).

Keine Admin-Rechte nötig.

**Sofort aktualisieren:** `jetzt-aktualisieren.cmd` doppelklicken.

**Ausschalten:** Eingabeaufforderung hier öffnen und `einrichten.cmd entfernen` eingeben.

**Nie ersetzt:** `meine-einstellungen.js`, `profil\`, `planung\`, `lerngruppen\`, `kuerzellisten\`, `ausgaben\`, `archiv\`, `material\`. Gelöscht wird nie etwas.

**Eigene Ausnahmen:** Datei `nicht-ersetzen.txt` in diesem Ordner, eine Datei je Zeile, relativ zum Datenordner, z. B.
```
werkzeuge/abschluss-check/Abschluss-Check.html
```

**Protokoll:** `%LOCALAPPDATA%\schulassistenz-update\update.log`

**Schulassistenz-Helfer:** prüft alle 30 Minuten und beim Browserstart, ob neue Dateien da sind, und lädt sich dann selbst neu. Offene IServ-Tabs danach einmal mit F5 neu laden.

**Andere Quelle:** Wer eine eigene Kopie des Repositorys nutzt, schreibt `besitzer/repo` in `quelle.txt` in diesem Ordner.

Liegt der Datenordner in OneDrive und ist auf zwei PCs eingerichtet, ist das kein Problem: Der zweite PC findet die Dateien schon aktuell vor und ersetzt nichts.
