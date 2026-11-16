---
name: "einheit-planen"
description: "Plant eine komplette Unterrichtseinheit jedes Fachs (schulassistenz) von der Stoffverteilung bis zur Klausur, mit Terminen aus dem Stundenplan, Gruppenakte und Wochenplaner."
---

# Einheit planen

Plant eine Unterrichtseinheit als Ganzes und hält sie danach am Laufen: Stoffverteilungsplan, Stunde für Stunde, Material, Wiederholung, Klausur. Die einzelnen Bausteine erledigen andere Skills; dieser Skill führt sie zusammen.

| Schritt | Baustein |
|---|---|
| Jede Stunde | **unterricht-planen** |
| Arbeitsblätter, Hilfekarten, Tafelbild | **material-gestalten** |
| Klausur und Erwartungshorizont | **pruefung-entwerfen** |
| Korrektur und Rückmeldung | **pruefung-korrigieren** |
| Vorbereitungszeit, Fristen | **wochenplaner** |
| Lernplattform, Schul-KI | Skills der Lehrkraft laut Profil (z. B. edumaps-selbstlern-map, paddy-agent) |

Arbeitet ohne Daten einzelner Kinder.

## 0. Vorher

- Profil über **schulprofil** lesen: Bundesland, Schulform, Lehrplan, schuleigene Arbeitspläne unter `vorlagen`, Layout, `ablage.material`, `werkzeuge` (Lernplattform, Schul-KI).
- **Lerngruppe** aus `lerngruppen/<gruppe>/gruppe.md`: Fach, Jahrgang, Niveau, Anzahl. Aus **Schwerpunkte** und **Leistungen** (z. B. Notenspiegel und schwache Aufgabenbereiche der letzten Klausur) ergibt sich, welches Vorwissen fehlt und was in die Stunden eingebaut werden muss.
- **Stundenplan** aus `planung/stundenplan.md` (Startseite, aus dem Stundenplan-Abo): Wochentage und Uhrzeiten der Lerngruppe, Einzel- oder Doppelstunde. Der Plan reicht nur wenige Wochen; die weiteren Termine aus dem Wochenmuster fortschreiben und als „aus Wochenmuster“ kennzeichnen.
- **Materiallager:** Über **materiallager** vorhandenes Material zum Thema suchen (alle Jahrgänge und Kurse) und die **Wissensbasis** der Einheit (`90_Quellen\quellen.md` im Ordner der Einheit) lesen. Gibt es sie noch nicht, den Quellen-Ordner anlegen und fragen, welche Quellen es gibt (Buchseiten, Material aus dem Kollegium, Uploads); Hochgeladenes nach **materiallager** Abschnitt 4 dort einsortieren. Der Stoffverteilungsplan baut auf diesen Quellen auf.
- **Termine**, die Stunden kosten: Ferien, Feiertage, Studientage, Klausurplan, Exkursionen aus `planung/aufgaben.md` und den Kalendern, die die Startseite einbindet. Fehlt etwas, die Lehrkraft fragen statt raten.

## 1. Rahmen klären

Nur fragen, was aus Profil, gruppe.md und Stundenplan nicht hervorgeht, gebündelt in einer Nachricht:

- **Thema** und Stellung im Schuljahr; Startdatum, Klausurtermin und Klausurinhalte (oder ob die Klausur noch festgelegt wird).
- **Material:** Schulbuch (Titel, Seiten), Kopiervorlagen, schuleigener Arbeitsplan. Ein Arbeitsplan dient zur Orientierung der Abfolge; veraltete Buchverweise und Links nicht übernehmen.
- **Ausstattung:** Fachräume, Geräte, Chemikalien, digitale Endgeräte; was wegfällt.
- **Vorwissen** realistisch einschätzen (gruppe.md hilft); im Zweifel von wenig ausgehen und Grundlagen in die Stunden integrieren statt eigene Wiederholungsstunden zu bauen.

## 2. Stoffverteilungsplan

Festes Format. Als HTML-Seite ausgeben (Artifact veröffentlichen und Link nennen) und zusätzlich als .html-Datei nach `ablage.material` ablegen. Gestaltung wie die Planungsübersicht in **unterricht-planen** (Fachfarbe aus dem Layout, helles und dunkles Theme, auf dem Handy lesbar, druckfreundlich).

1. **Kopf:** Fach, Kurs/Niveau, Jahrgang, Nummer der Einheit, Titel, ein Satz zur Grundlage (Lehrplan, Arbeitsplan, Buch mit Seiten). Darunter Fakten-Chips: Zeitraum, Stundenraster, Anzahl Stunden, Klausurtermin.
2. **Rahmenkasten** in zwei Spalten: Differenzierung (z. B. Niveaus des Buches mit Farben N1/N2/N3 und wie die Lernenden wählen; bei G/E-Kursen getrennt) | „Bewusst weggelassen“ (was nicht behandelt wird und warum).
3. **Übersichtstabelle:** Termin | Thema | Leitfrage | Buch/Material. Ausfälle und Einzelstunden kennzeichnen, letzte Zeile Klausur.
4. **Ein Block je Stunde bzw. Doppelstunde:** Kopfband mit Datum und Thema (Hinweis bei Ausfall) → Leitfrage (alltagsnah, als echte Frage) → Lernziel („Die SuS …“, beobachtbar) → Alltagsbezug → Ablauf-Tabelle Zeit | Phase | Was passiert (Einstieg aktivierend; Exit-Ticket am Ende mit konkreter Aufgabe) → Aufgaben differenziert in drei farbigen Kacheln N1/N2/N3 mit Seite und Nummer → Hinweiskasten für Hausaufgabe, Zeitpuffer/Kürzungsvorschlag, Vorbereitung.
5. **Wiederholungsstunde** vor der Klausur (Checkliste „Das kann ich“, Test im eigenen Niveau mit Selbstkontrolle). Schwerpunkte aus der letzten Klausur der Gruppe gezielt aufgreifen.
6. **Klausurblock** (hervorgehoben): Inhalte | Nicht in der Klausur | Hilfsmittel.
7. Fußzeile: Grundlage und Stand-Datum.

Termine immer gegen Stundenplan, Ausfälle und Klausurtermin prüfen; per Code nachzählen, ob die Stunden reichen. Reicht die Zeit nicht, Kürzungsvorschläge machen statt Stunden zu überladen.

Nach Zustimmung der Lehrkraft (Bestätigung vor dem Schreiben):
- **gruppe.md**, Bereich Unterricht: `Datum | Beleg | Einheit 3 Exponentialfunktionen geplant, 8 Doppelstunden bis 2026-12-18; Plan: <Dateipfad> | Quelle: einheit-planen | bestätigt`; Bereich Termine: Klausurtermin mit Inhalten.
- **planung/aufgaben.md**: Klausurtermin (Art Termin), „Klausur entwerfen“ mit Frist zwei Wochen vorher, Vorbereitungen mit Vorlauf (Bestellungen, Exkursion anmelden).

## 3. Jede Stunde

- Immer mit **unterricht-planen** planen, im Format A, außer die Lehrkraft will mehr.
- Nur ein Thema pro Stunde, nicht überladen. Demonstrationen schlank, Experimente schnell und einfach.
- Methodenvielfalt (nicht nur Buch und Arbeitsblatt), Simulationen und Videos, immer Alltagsbezug.
- Ausrichten an den drei Basisdimensionen: kognitive Aktivierung, konstruktive Unterstützung, strukturierte Klassenführung.
- Lieferumfang je Stunde: Verlaufsplan, Arbeitsblatt mit Hilfekarten und Lösungen, Tafelbild, Exit-Ticket; gesetzt mit **material-gestalten**.
- Nach gehaltenen Stunden die Rückmeldung der Lehrkraft einarbeiten: Stoffverteilungsplan anpassen (verschobene Termine, gekürzte Inhalte) und den Stand in gruppe.md festhalten. Verschiebt sich etwas, Klausurinhalte prüfen und die Lehrkraft fragen, ob sie angepasst werden.

## 4. Lernplattform und Schul-KI (optional)

Nur, wenn das Profil eine Lernplattform bzw. Schul-KI nennt und die Lehrkraft einen passenden Skill hat. Dann einmal zu Beginn fragen, ob die Einheit dort begleitet werden soll (z. B. Hub-Seite für die Einheit, eine Seite je Stunde, ein KI-Lerncoach mit Wissensbasis). Umsetzung nach dem Skill der Lehrkraft; dieser Skill sorgt nur dafür, dass Dateinamen, Reihenfolge und „sichtbar ab“-Termine zum Stoffverteilungsplan passen. Ohne solchen Skill: nichts anbieten außer einer schlichten HTML-Selbstlernseite je Stunde, wenn die Lehrkraft das will.

## 5. Ablage

- Pfad nach `ablage.material` im Profil (z. B. `<Jahrgang>\<Kurs>\<Themenfeld>\<Nummer>_<Thema>`), auf dem Rechner der Lehrkraft über den Ordnerzugriff anlegen. Ohne Ablagemuster: Dateien im Gespräch.
- Je Stunde ablegen: Planung (HTML), Gesamtdatei des Materials (PDF), Schülerfassungen einzeln ohne Lösungen, ggf. Dateien für die Lernplattform. Stoffverteilungsplan im Ordner der Einheit, Links darin auf die Stundendateien aktualisieren.
- Jede abgelegte Datei nach **materiallager** (Abschnitt 5) ins Register eintragen; Quellen und Fundstellen der Planung in `quellen.md`.
- Nur ein Gespräch legt für eine Einheit ab, damit nichts doppelt landet.

## 6. Klausur

- Rechtzeitig (Aufgabe aus Abschnitt 2) mit **pruefung-entwerfen**: Klausurblock des Stoffverteilungsplans als Inhalte übergeben, Erwartungshorizont und Notenschlüssel aus dem Profil. Satz mit **material-gestalten**, Ablage im Ordner der Einheit.
- Nach dem Schreiben: Korrektur mit **pruefung-korrigieren**; dessen Schwerpunkte fließen über gruppe.md in die nächste Einheit (Schritt 0).

## 7. Grundsätze

- Der Mensch entscheidet: Plan und Termine sind Vorschläge; Akten und Aufgabenliste werden erst nach Bestätigung geändert.
- Allgemein gültig: Lehrplan, Layout, Ablage und Werkzeuge kommen aus dem Profil, nicht aus diesem Skill.
- Entlastung vor Perfektion: vorhandenes Material und Buch zuerst, Neues nur, wenn es wiederverwendbar ist.