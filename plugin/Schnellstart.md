# schulassistenz – Schnellstart (ca. 15 Minuten)

Kurzanleitung zum Einrichten von Plugin und Schulassistenz-Helfer. Ausführlich: [README.md](README.md).

**Vorab:** Mit der Schulleitung klären, dass du mit pseudonymisierten Schülerdaten arbeiten darfst. Claude erstellt dir dafür eine Checkliste („Erstelle die Datenschutz-Checkliste für die Schulleitung“). Claude sieht nur Kürzel wie K07. Die Namen bleiben auf deinem Rechner.

## 1. Plugin installieren
1. **Claude-Desktop-App** öffnen → links **Plugins** → **Hinzufügen** → Marketplace `pllee1/schulassistenz` eintragen → **schulassistenz** installieren.
2. Claude Zugriff auf einen Ordner geben, z. B. `Dokumente\Schule`.
3. Neuer Chat: **„Richte schulassistenz ein.“** Claude fragt Schule, Fächer, Jahrgänge, Bewertung und Ablage ab und legt den **Datenordner** an (Profil, Werkzeuge, Lerngruppen).

## 2. Schulassistenz-Helfer in Chrome oder Edge laden
1. In Claude: **„Stell mir den Schulassistenz-Helfer bereit.“** Er liegt danach in `<Datenordner>\werkzeuge\iserv-helfer`.
2. `chrome://extensions` (Edge: `edge://extensions`) öffnen → **Entwicklermodus** an → **Entpackte Erweiterung laden** → Ordner `iserv-helfer` wählen.
3. Beim Puzzle-Symbol den Helfer anheften. **Ein Klick auf das Heft-Symbol öffnet die Startseite.**
4. Den Hinweis „Erweiterungen im Entwicklermodus deaktivieren“ beim Chrome-Start einfach wegklicken.

## 3. Startseite einrichten
Oben steht **„Einrichtung auf diesem PC“**. Die Punkte der Reihe nach abarbeiten:
1. **Datenordner verbinden** (einmal erlauben).
2. **Lerngruppe anlegen** (z. B. `7b-deutsch`). Die Seite legt Akten mit Kürzeln an.
3. In der **Kürzelliste** (`kuerzellisten\Kuerzelliste-<gruppe>.xlsx`) selbst die Namen neben die Kürzel schreiben. Diese Datei nie hochladen.
4. Optional: **Stundenplan** (iCal-Link aus WebUntis o. Ä., bleibt nur im Browser) und **Schulkalender** (IServ verbinden).

**Zweiter PC:** Wenn OneDrive den Datenordner geholt hat, dort `Neuer-PC-einrichten.cmd` doppelklicken (Updates, IServ-Laufwerk, Helfer-Pfad in der Zwischenablage). Dann Helfer laden, Startseite öffnen, „Datenordner verbinden“ und „Einstellungen von deinem anderen PC übernehmen“. Nur den Stundenplan-Link trägst du dort neu ein.

## 4. Loslegen
- **Heute:** Tagesplan, Woche und „Als Nächstes“.
- **Lerngruppen:** Akten, Noten, Fehlzeiten, Namen & Kürzel, Live-Beobachtung.
- **Werkzeuge:** Aufträge an Claude (Stunde planen, Arbeitsblatt, Klassenarbeit, Elterngespräch …), Pseudonymisierer, Abschluss-Check.
- **Mails:** In IServ unten rechts **„✉ An Claude“**. Namen gehen als Kürzel raus und kommen in der Antwort zurück.

## Optional: Fehlzeiten und Vermerke
Lerngruppe › **Fehlzeiten** liest den Abwesenheits-Export aus **WebUntis** oder dem **IServ-Klassenbuch** (Statistik › Abwesenheiten bzw. Vermerke, als Excel oder CSV). Mit dem Helfer geht das per Knopf, ohne Datei im Download-Ordner. Welche Knöpfe erscheinen, steht in `werkzeuge\startseite\meine-einstellungen.js`: `klassenbuch: "webuntis"`, `"iserv"` oder `"beide"`, außerdem `webuntis: "https://<schule>.webuntis.com"` bzw. `iserv: "https://<eure-iserv-adresse>"`.

## Gut zu wissen
- Alles sind Entwürfe. In Akten wird erst nach deinem Klick geschrieben, und nichts wird verschickt.
- Keine Diagnosen, Gesundheits- oder Herkunftsangaben in die Akten.
- **Kürzellisten** gibt die Startseite dem Helfer automatisch, Hineinziehen ist nicht mehr nötig.
- **Updates** kommen von selbst über die Claude-App. Für die Werkzeuge im Datenordner richtet `werkzeuge\updater\einrichten.cmd` die automatische Aktualisierung ein (einmal je PC). Der Helfer lädt sich danach selbst neu.
