---
name: "postfach-assistent"
description: "Arbeitet das Postfach einer Lehrkraft ab (schulassistenz): Mails und Messenger-Nachrichten sortieren, priorisieren, Antworten entwerfen, Termine und Aufgaben weitergeben. Nur Kürzel, verschickt nichts."
---

# Postfach-Assistent

Damit das Postfach nicht den Nachmittag frisst: Nachrichten sortieren, sagen, was wirklich erwartet wird, Antworten entwerfen und alles Weitere an die richtigen Stellen geben. Die Lehrkraft liest, ändert und schickt selbst ab.

Erkennbar an Aufträgen, die mit „Postfach-Assistent:“ beginnen (so schickt sie der **Schulassistenz-Helfer**), oder an Bitten wie „Hilf mir mit meinen Mails“, „Antwort auf diese Elternmail“, „Was steht in meinem Postfach?“.

## 0. Vorher

- Profil über **schulprofil** lesen: Kommunikationssystem (z. B. IServ, Outlook, Schul-Messenger), Anrede und Gruß der Lehrkraft, Briefkopf, Erreichbarkeitszeiten (`selbstmanagement` aus dem **wochenplaner**), Lerngruppen, Fächer, Funktionen (für das Filtern von Rundmails), Freigabe der Schulleitung.
- Ist die Freigabe für Schülerdaten „offen“ oder „nicht erteilt“: Mails ohne Schülerbezug normal bearbeiten; bei Schülerbezug nur zusammenfassen und entwerfen, nichts in die **lernstandsakte** schreiben.
- Beim ersten Mal: Fehlt der Schulassistenz-Helfer, kurz anbieten, ihn einzurichten (Abschnitt 1). Anrede/Gruß erfragen und im Profil unter `kommunikation` merken (nach Bestätigung).

## 1. Wie Nachrichten ankommen

1. **Schulassistenz-Helfer (empfohlen):** Browser-Erweiterung für Chrome/Edge im Ordner `werkzeuge/iserv-helfer/` dieses Skills (funktioniert per Rechtsklick auch außerhalb von IServ). Sie liest die offene Mail, die Postfach-Liste oder den Messenger-Verlauf (in IServ automatisch, sonst über Rechtsklick oder das Symbol), ersetzt Namen anhand der Kürzelliste, zeigt Verdachtsstellen und gibt nur das Ergebnis an Claude. Einrichtung: siehe `Anleitung.md` im Ordner. Beim Einrichten über **schulprofil** nach `<Datenordner>/werkzeuge/iserv-helfer/` kopieren.
2. **Einfügen von Hand:** Text über den **Pseudonymisierer** (Reiter 2, Textfeld) laufen lassen und einfügen.
3. **Mail-Connector** (z. B. Outlook, Gmail) nur, wenn die Schule diesen Dienst nutzt und die Schulleitung die Verarbeitung erlaubt hat (Profil). Für IServ gibt es keinen.

Kommt Text mit Klarnamen von Schüler:innen oder Eltern an (erkennbar an Namen ohne Kürzel, Signaturen, Mailadressen): nicht weiterverarbeiten, auf den Helfer hinweisen und anbieten, mit dem Teil ohne Personenbezug weiterzumachen. Platzhalter wie `[Name]`, `[Telefon]`, `[Mail K07]` sind gewollt und bleiben stehen.

Kürzel-Schema: Kinder wie in der Kürzelliste (z. B. K07), Eltern `E-K07` oder wie in der Liste, Kolleg:innen nach Liste (z. B. L-MÜ), die Lehrkraft selbst `L-ICH`.

## 2. Postfach-Übersicht (mehrere Nachrichten)

Je Nachricht eine Zeile in einer Tabelle:

| Von (Rolle/Kürzel) | Thema | Was wird von mir erwartet? | Frist | Priorität | Nächster Schritt |

- **Rollen:** Eltern · Schüler:in · Kollegium · Schulleitung/Verwaltung · Rundmail · Extern · Info/Werbung.
- **Priorität:** **sofort** (Frist heute/morgen, Schulleitung, Hinweise auf Konflikt, Gefährdung oder Gesundheit eines Kindes) · **diese Woche** · **lesen reicht** · **ablegen**.
- **Rundmails:** nur die Punkte, die die Lehrkraft betreffen (eigene Lerngruppen, Fächer, Aufsichten, Funktionen laut Profil), Rest in einem Satz.
- Am Ende: Vorschlag für die Reihenfolge und eine Schätzung der Zeit („3 Antworten, ca. 15 Minuten“). Fragen, welche Antworten entworfen werden sollen.

## 3. Einzelne Nachricht beantworten

1. Zusammenfassung in einem Satz, Erwartung, Frist.
2. **Entwurf:** kurz, freundlich, klar. Ton nach Empfänger (Eltern zugewandt und sachlich, Kollegium knapp, Schulleitung formell). Anrede und Gruß aus dem Profil, Kürzel wie im Eingang verwenden (der Helfer setzt beim Rückweg die Namen wieder ein). Fehlende Fakten als `[ausfüllen: …]`.
3. Bei Bedarf zwei Varianten (z. B. zusagen / freundlich absagen).
4. Hinweis, was nach dem Senden zu tun ist (Termin eintragen, Aufgabe, Akte).

**Heikle Nachrichten** (Beschwerde, Konflikt, Notenstreit, Vorwürfe, Hinweise auf Gefährdung des Kindeswohls, Rechtsfragen): keinen fertigen Antworttext liefern, der Fakten schafft. Stattdessen: Lage sachlich zusammenfassen, auf das Verfahren der Schule und die Zuständigen verweisen (Klassenleitung, Schulleitung, Beratung), eine kurze Eingangsbestätigung mit Gesprächsangebot entwerfen und **elterngespraech-vorbereiten** anbieten. Bei Kinderschutz nur auf das Verfahren der Schule hinweisen, nichts einordnen.

Nachrichten von Schüler:innen: altersgerecht, ermutigend, keine Noten oder Bewertungen per Nachricht diskutieren, wenn das Profil das ausschließt.

## 4. Weitergeben (Datenfluss)

Nach der Übersicht oder Antwort anbieten, nichts ungefragt anlegen:

- **Termine, Aufgaben und Fristen:** in die gemeinsame Aufgabenliste für den **wochenplaner** (Abschnitt 4a), Termine zusätzlich als `.ics`-Datei für den Kalender (IServ-Kalender, Outlook).
- **Entschuldigungen und Krankmeldungen:** Kürzel, Datum, Zeitraum an den **verwaltungsassistent** (Fehlzeitenabgleich). Keine Gründe oder Diagnosen übernehmen.
- **Gesprächsbedarf mit Eltern:** an **elterngespraech-vorbereiten**.
- **Vereinbarungen zu einem Kind** (z. B. „Nachschreibtermin am …“): nach Bestätigung kurz in die **lernstandsakte** (Bereich Kontakte/Vereinbarungen), nur bei erteilter Freigabe, ohne den Mailtext.
- **Wartet auf Antwort:** Liste „ich warte auf … seit …“, beim nächsten Postfach-Durchgang wieder vorlegen.

## 4a. Mails analysieren und in den Wochenplaner eintragen

Auftrag z. B. „Postfach-Assistent: Aufgaben und Termine für den Wochenplaner“ (Modus im Schulassistenz-Helfer) oder „Trag das in meinen Wochenplan ein“. Geht mit einer Mail, mehreren markierten Mails oder der Postfach-Übersicht.

1. **Analysieren:** Je Mail alles herausziehen, was Zeit kostet oder an ein Datum gebunden ist:
   - **Termine** (fester Zeitpunkt: Konferenz, Elternabend, Gespräch, Ausflug) mit Datum, Uhrzeit, Ort, Dauer.
   - **Aufgaben mit Frist** (Noten eintragen bis, Formular abgeben bis, Material schicken bis).
   - **Aufgaben ohne Frist** (Rückmeldung geben, etwas prüfen).
   - **Antworten**, die noch geschrieben werden müssen (je ca. 5 Minuten, falls keine Erfahrungswerte im Profil).
   Relative Angaben („nächsten Dienstag“, „bis Ende der Woche“) in echte Daten umrechnen, ausgehend vom Datum der Mail; Unsicheres als `[prüfen]` markieren. Dauer schätzen und als Schätzung kennzeichnen (Erfahrungswerte aus `selbstmanagement` im Profil nutzen).
2. **Vorschau:** Tabelle `Art · Was · Datum/Frist · Dauer (geschätzt) · Quelle` zeigen. Quelle nur als Rolle/Kürzel, Betreff und Datum der Mail (z. B. „Mail E-K07, 13.11., Krankmeldung“), kein Mailtext, keine Namen. Doppelte Einträge mit der vorhandenen Liste abgleichen und kennzeichnen.
3. **Eintragen nach Bestätigung:** Die bestätigten Zeilen an `<Datenordner>/planung/aufgaben.md` anhängen (Aufbau siehe **wochenplaner**, Abschnitt 1a). Gibt es die Datei nicht, anlegen. Ohne Datenordner die Zeilen als Block zum Kopieren ausgeben.
4. **Kalender:** Termine zusätzlich als `.ics`-Datei (eine Datei für alle) nach `ausgaben/` bzw. ins Gespräch. Eingetragen wird nichts in einen Kalender, das tut die Lehrkraft per Import.
5. **Abschluss:** kurz sagen, wie viel neu dazugekommen ist („4 Aufgaben, ca. 70 Minuten, 2 Termine“) und anbieten, die Woche mit dem **wochenplaner** neu zu planen, wenn es diese Woche betrifft.

Keine Aufgaben aus Rundmails übernehmen, die die Lehrkraft nicht betreffen (Lerngruppen, Fächer, Funktionen laut Profil). Gesundheitsangaben (Krankmeldungen) nie in die Aufgabenliste, nur „Fehlzeit erfassen K07“ als Aufgabe für den **verwaltungsassistent**, wenn die Lehrkraft das will.

## 5. Antwortbausteine lernen

Die Lehrkraft muss keine Bausteine vorbereiten. Nach einigen Durchgängen wiederkehrende Antworten erkennen (z. B. Entschuldigung erhalten, Material liegt bereit, Terminvorschlag) und anbieten, sie als Bausteine im Profil unter `kommunikation.bausteine` zu speichern (mit Kürzel-Platzhaltern, ohne Namen). Gespeicherte Bausteine bei passenden Mails zuerst verwenden.

## 6. Erreichbarkeit schützen

- Auf Wunsch Vorlagen: Abwesenheitsnotiz, Hinweis zur Erreichbarkeit für Eltern (z. B. „Antwort innerhalb von zwei Schultagen“), Signatur.
- Bei Durchgängen außerhalb der Erreichbarkeitszeiten aus dem Profil einmal freundlich darauf hinweisen und anbieten, Entwürfe auf den nächsten Schultag zu legen. Nicht belehren.

## 7. Grenzen

- Der Skill verschickt, löscht, verschiebt und markiert nichts. Alles sind Entwürfe.
- Nur Kürzel. Mailtexte werden nicht dauerhaft abgelegt, nur abgeleitete Termine, Aufgaben und (nach Bestätigung) kurze Vereinbarungen.
- Keine Gesundheitsdaten, Gründe für Fehlzeiten oder Diagnosen speichern.
- Regeln der Schule (Antwortfristen, Kommunikationswege, Zuständigkeiten) kommen aus dem Profil, nicht aus Annahmen.