---
name: "dokument-analyse"
description: "Eingangstor von schulassistenz für hochgeladene Schuldokumente (Zeugnis, Klausur, ILE-Bogen, Förderplan, Protokoll, Export): erkennt, pseudonymisiert, liest aus, legt nach Freigabe in der lernstandsakte ab."
---

# Dokument-Analyse

Jedes Schuldokument, das eine Lehrkraft hochlädt, läuft zuerst durch diesen Skill. Andere Skills rufen ihn auf, statt selbst zu parsen. Er bewertet nicht, er liest aus.

Vor dem Start: Profil über den Skill **schulprofil** lesen (Datenordner, Schüler-Code, Vorlagen, Stand der Freigabe durch die Schulleitung). Ist die Freigabe für Schülerdaten „nicht erteilt“, Dokumente mit Schülerdaten nicht verarbeiten und das kurz begründen.

## 1. Erkennen

Dokumentart bestimmen und kurz nennen:

| Art | Erkennbar an | Ziel |
|---|---|---|
| Zeugnis | Fächer mit Noten, Bemerkungen, Fehlzeiten | lernstandsakte |
| Klausur mit Korrektur | Punkte, Randbemerkungen, Note | lernstandsakte |
| Ergebnis von pruefung-korrigieren | Excel mit Code, Punkten, Note | lernstandsakte (direkt, ohne Neu-Auslesen) |
| ILE-Bogen, Lernentwicklungsbericht | Kompetenzen mit Stufen, Fließtext | lernstandsakte |
| Förderplan | Ausgangslage, Ziele, Maßnahmen, Evaluation | lernstandsakte |
| Gesprächs- oder Konferenzprotokoll | Datum, Teilnehmende, Vereinbarungen | lernstandsakte |
| Beobachtungsnotiz | kurze datierte Notizen | lernstandsakte |
| Export der Schulsoftware | Tabelle mit vielen Schülerzeilen | lernstandsakte (Lerngruppe) |
| Leere Schulvorlage | Felder ohne Inhalt | schulprofil (Vorlage adaptieren) |
| Unterrichtsmaterial (AB, Lösung, Buchseite, Tafelbild, Screenshot) | Aufgaben, kein Personenbezug | materiallager (einsortieren, Wissensbasis der Einheit) bzw. der passende Aufgaben-Skill |

Ist die Art unklar, nachfragen. Mehrere Dokumente in einer Datei getrennt behandeln.

## 2. Pseudonymisieren

**Am besten kommt nichts mit Klarnamen an.** Empfiehl vor dem Hochladen das lokale Werkzeug **Pseudonymisierer** (`schulassistenz/werkzeuge/pseudonymisierer/Pseudonymisierer.html` im Datenordner, läuft offline im Browser): Word- und Textdateien werden über die Kürzelliste der Lehrkraft ersetzt, Scans, Fotos und Handschriftliches dort geschwärzt (Kopfbereich oder von Hand markiert). Lädt die Lehrkraft dennoch ein Dokument mit Klarnamen hoch, einmal kurz auf das Werkzeug hinweisen (nicht bei jedem Dokument wiederholen) und dann wie folgt verfahren.

Bevor irgendetwas gespeichert oder an einen anderen Skill weitergegeben wird:

1. **Kürzel bestimmen:**
   - Trägt das Dokument einen Schüler-Code (z. B. „KV001“ bei Klassenarbeiten), diesen als Kürzel nehmen.
   - Sonst fragen: „Welches Kürzel soll dieses Kind in der Akte haben?“ Vorschlag: nächstes freies Kürzel der Lerngruppe (S01, S02 …) oder der Code aus der Klassenliste der Lehrkraft. Die Lehrkraft ordnet selbst zu.
   - Die Zuordnung Kürzel zu Name **nie anfordern, speichern oder verarbeiten**. Lädt die Lehrkraft eine Namensliste hoch, nicht verwenden und darauf hinweisen.
2. **Ersetzen bzw. weglassen:** Vor- und Nachname (auch Spitznamen und Namen in Fließtext), Namen von Eltern, Geschwistern, Mitschülern, Adressen, Telefonnummern, Mailadressen, Geburtsdatum (nur Jahrgang behalten, falls nötig), Schülernummern der Schulsoftware, Unterschriften, Fotos.
3. **Nicht übernehmen (besondere Kategorien):** Gesundheitsangaben, Diagnosen, Religion, Herkunft, familiäre Konflikte. Bei Nachteilsausgleich nur die Maßnahme („verlängerte Bearbeitungszeit 25 %“), nicht den Grund. Will die Lehrkraft eine solche Angabe ausdrücklich behalten, nachfragen, ob das mit der Schulleitung geklärt ist.
4. **Kinderschutz oder Krise erkennbar?** Nichts davon in die Akte. Die Lehrkraft auf das Verfahren der Schule hinweisen und die Analyse dieses Teils beenden.

Im Gespräch selbst ebenfalls nur das Kürzel benutzen.

## 3. Auslesen

Je Kürzel strukturierte Einträge bilden. Jeder Eintrag hat:

- **Datum** des Dokuments (nicht das Upload-Datum)
- **Bereich:** leistungen, lernstand, asv (Arbeits- und Sozialverhalten), ziele, vereinbarungen, termine
- **Art:** Beleg (steht so im Dokument)
- **Inhalt:** knapp, sachlich, wortnah; Noten und Punkte exakt
- **Quelle:** Dokumentart, Titel bzw. Dateiname, Seite oder Abschnitt

Was ausgelesen wird, je Art:

- Zeugnis: Noten je Fach, Bemerkungen zu Arbeits- und Sozialverhalten, Versetzungsvermerke, Fehlzeiten (Zahl, nicht Gründe).
- Klausur: Punkte je Aufgabe, Gesamt, Note, Fehlerschwerpunkte (aus Randbemerkungen oder Aufgabenprofil: welche Kompetenz fehlte).
- ILE-Bogen, Bericht: Stufe je Kompetenz, Stärken, nächste Schritte. Kategorien der Schulvorlage übernehmen, wenn eine Feldbeschreibung im Profil existiert.
- Förderplan: Ziele (überprüfbar formuliert), Maßnahmen, Zuständige als Rolle (nicht Name), Überprüfungstermin.
- Protokoll: Vereinbarungen mit Zuständigkeit (Rolle) und Termin.
- Export: je Zeile die Spalten, die die Lehrkraft braucht; vorher fragen, welche.

**Nicht deuten:** keine Schlüsse wie „hat wohl Konzentrationsprobleme“. Leitet sich etwas ab, ist es ein Vorschlag eines anderen Skills, kein Beleg.

**Unsichere Stellen:** wie in pruefung-korrigieren kennzeichnen: `[unleserlich]`, `[unsicher: …]`, `[Zuordnung unsicher]`. Schwache Scans in höherer Auflösung und mit mehr Kontrast prüfen, bevor etwas als leer oder unleserlich gilt. Nie raten.

## 4. Vorlegen und freigeben

Eine kurze Übersicht zeigen, bevor etwas gespeichert wird:

> Zeugnis Halbjahr 8b, Kürzel S07: 11 Noten, 2 Bemerkungen zum Arbeits- und Sozialverhalten, 4 Fehltage. 1 Stelle unsicher (Note Musik: 2 oder 3?). Nicht übernommen: Geburtsdatum, Adresse.

Darunter die Einträge als Tabelle (Datum · Bereich · Inhalt · Quelle). Die Lehrkraft korrigiert oder bestätigt. Erst nach Bestätigung an **lernstandsakte** übergeben. Bei vielen Dokumenten gesammelt bestätigen lassen, Auffälligkeiten zuerst.

## 5. Aufräumen

- Das Original liegt nur so lange in `eingang/`, wie die Analyse dauert. Danach vorschlagen, es dort zu löschen; das Original bleibt bei der Lehrkraft bzw. in der Schulsoftware.
- In der Akte steht nur der Verweis auf die Quelle, keine Kopie des Dokuments.
- Scans, Fotos und PDFs mit Schülerbezug nie dauerhaft ablegen, auch nicht im Schülerdaten-Ordner (`ablage.schuelerdaten`). Gespeichert wird nur das bestätigte Ergebnis als Text.

## 6. Übergabe an andere Skills

Ruft ein Aufgaben-Skill diesen Skill auf (z. B. elterngespraech-vorbereiten mit einem Zeugnis), nach der Freigabe zurückgeben: Kürzel, freigegebene Einträge, offene Unsicherheiten. Der aufrufende Skill liest danach aus der lernstandsakte.