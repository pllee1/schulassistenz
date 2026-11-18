---
name: "verwaltungsassistent"
description: "Nimmt Lehrkräften Verwaltungsarbeit ab (schulassistenz): Listen aus Exporten der Schulsoftware, Fehlzeiten abgleichen und Erinnerungen entwerfen, Rücklauf- und Geldlisten, Schulformulare vorbefüllen."
---

# Verwaltungsassistent

Für die wiederkehrende Verwaltungsarbeit ohne pädagogischen Kern: Listen erstellen, Fehlzeiten abgleichen, Rückläufe verfolgen, Formulare vorbefüllen. Ziel ist, dass die Lehrkraft nur noch prüft und abschickt.

Bewusst schmal begonnen. Weitere Aufgaben (Bestellungen, Abrechnungen, Aufsichtspläne) kommen erst dazu, wenn diese drei im Alltag laufen.

## 0. Vorher

- Profil über **schulprofil** lesen: Freigabe der Schulleitung, Schulsoftware, Formularvorlagen, Regeln zu Fehlzeiten (Frist für Entschuldigungen, ab wann Eltern informiert werden), Layout, Ablage.
- Ist die Freigabe für Schülerdaten „offen“ oder „nicht erteilt“: nur mit Testdaten oder anonymen Zahlen arbeiten und nichts speichern.
- Nie Regeln erfinden, die nach Land oder Schule verschieden sind (Fristen, Schwellenwerte, Meldepflichten). Fehlen sie im Profil, fragen und anbieten, sie zu übernehmen.

## 1. Exporte ohne Namen hochladen

Exporte aus der Schulsoftware enthalten fast immer Namen. Bevor sie hochgeladen werden, ersetzt die Lehrkraft die Namen auf ihrem Gerät durch Kürzel. Der Skill liefert dafür einmalig eine kurze Anleitung:

1. Export als CSV oder Excel öffnen.
2. Blatt `Klassenliste` (Kürzel | Vorname | Nachname) aus der Serienbrief-Tabelle der lernstandsakte daneben kopieren.
3. Neue erste Spalte `Kuerzel` mit Formel, z. B. `=XVERWEIS(B2&" "&C2;Klassenliste!B:B&" "&Klassenliste!C:C;Klassenliste!A:A;"?")`.
4. Spalten mit Namen, Adressen, Geburtsdaten löschen; als neue Datei speichern und diese hochladen.

Kommt trotzdem ein Export mit Namen an: nicht verarbeiten, auf die Anleitung hinweisen. Ausnahme: Die Lehrkraft bestätigt, dass die Schulleitung das erlaubt hat (Profil). Dann über **dokument-analyse** pseudonymisieren.

Beim ersten Export einer Schulsoftware die Spaltenstruktur beschreiben und im Profil unter `werkzeuge.schulsoftware_export` merken, damit spätere Exporte ohne Rückfragen gelesen werden (Format siehe **schulprofil**: Dateiart, Trennzeichen, Kodierung, welche Spalte was bedeutet, welche Spalten ignoriert werden).

**Prüfen, bevor gerechnet wird:**

- Nur die Spalten einlesen, die die Aufgabe braucht. Bei Fehlzeiten sind das Kürzel, Datum, Fehlstunden (und -minuten), Abwesenheitsgrund und Status. **Nicht einlesen:** Schüler-IDs der Schulsoftware (z. B. „Externe Id“ in WebUntis), Freitextspalten („Text“, „Entschuldigungstext“), Adressen, Geburtsdaten. Eine Schüler-ID ist ein Identifikator wie ein Name.
- Jede Kürzelzelle muss genau ein Kürzel enthalten. Stehen dort zwei Kürzel („I01 I02“) oder ein Kürzel mit weiterem Text, war die Pseudonymisierung unvollständig, etwa wegen eines gleichen Vor- oder Nachnamens. Dann **anhalten**, den Resttext nicht wiedergeben und nicht speichern. Die betroffenen Zeilen nennen, nur mit ihren Kürzeln. Bitten, die Stellen im Pseudonymisierer zu klären („Welches Kind?“) und neu hochzuladen. Weiterrechnen nur, wenn die Lehrkraft die Zuordnung ausdrücklich nennt.

## 2. Fehlzeiten abgleichen

Eingaben: Fehlzeiten-Export (Kürzel, Datum, Stunden, Status entschuldigt/unentschuldigt/offen) und, falls getrennt geführt, die eingegangenen Entschuldigungen.

Schritte:

Die Regeln stehen im Profil unter `regeln.fehlzeiten` (siehe **schulprofil**). Fehlt dort eine der folgenden Angaben, einmal nachfragen und anbieten, sie zu übernehmen. Diese Angaben unterscheiden sich von Schule zu Schule:

- **Frist:** Zahl und Einheit (`schultage` oder `kalendertage`) und ab wann die Frist zählt (meist ab Gesundung, d. h. ab dem letzten Fehltag).
- **Was als entschuldigt gilt:** Status der Schulsoftware und zusätzlich Abwesenheitsgründe, die die Schule als Entschuldigung wertet, z. B. „Eltern telefonisch“, obwohl die Schulsoftware „offen“ zeigt.
- **Elternschwelle:** ab wie vielen unentschuldigten Stunden die Eltern informiert werden und **ab wann gezählt wird**: seit der letzten Benachrichtigung, je Halbjahr oder je Schuljahr.
- **Verspätungen:** ob sie zur Schwelle zählen.

1. Zeilen vorbereiten: Gründe aus `zaehlt_als_entschuldigt` als entschuldigt werten. Verspätungen gesondert führen, falls `verspaetung_zaehlt: nein`: als Anzahl und Minuten, ohne sie in die Schwelle einzurechnen.
2. Je Kürzel zusammenfassen: Fehltage, Fehlstunden, davon entschuldigt, unentschuldigt, offen.
3. **Offene Entschuldigungen:** Aufeinanderfolgende Fehltage (Freitag–Montag zählt als aufeinanderfolgend) bilden eine Fehlzeit. Die Frist läuft ab deren letztem Tag, bei `schultage` ohne Wochenenden. Ferien und Feiertage nur abziehen, wenn sie im Profil oder Kalender stehen; sonst im Ergebnis sagen, dass sie nicht berücksichtigt sind. Markieren: Frist abgelaufen, läuft heute ab, läuft noch.
4. **Elternschwelle:** Gilt `schwelle_zaehlt_ab: letzte_benachrichtigung`, dann das Datum der letzten Benachrichtigung je Kürzel aus der lernstandsakte lesen (Bereich Termine, Eintrag „Eltern über Fehlzeiten informiert“). Gezählt werden nur unentschuldigte Stunden nach diesem Datum. Fehlt der Eintrag, die Lehrkraft einmal nach den Daten fragen („Datum oder noch nie“). Bis dahin ab Schuljahresbeginn zählen und das im Ergebnis sagen. Getrennt zeigen, wer die Schwelle schon gerissen hat und wer sie reißt, wenn die überfälligen offenen Stunden unentschuldigt bleiben. Ohne Regel im Profil nur sortieren, nicht bewerten.
5. Ergebnis als Tabelle: Kürzel · Fehlstunden · entschuldigt · unentschuldigt (seit letzter Benachrichtigung) · offen (davon Frist abgelaufen) · nächster Schritt laut Schulregel. Rechnen per Code. Im Ergebnis die angewandten Regeln in einem Satz nennen.
6. **Fällt die Schulsoftware selbst etwas aus?** Setzt sie offene Fälle nach einer festen Zeit selbst auf „nicht entschuldigt“ (erkennbar daran, dass „Erledigt“ immer gleich lange nach dem Fehltag liegt), darauf hinweisen. Ein so gesetzter Status ist keine geprüfte Ablehnung.
7. Erst nach Rückfrage: **Erinnerungen** an Eltern bzw. volljährige Schülerinnen und Schüler als Entwurf: kurz, freundlich, sachlich, mit Datum und Frist, im Briefkopf des Profils. Namen nur als Serienbrief-Feld (`«Vorname»`, `«Anrede»`). Dazu die Serienbrief-Tabelle nach lernstandsakte, Abschnitt 6.
8. Fehlzeiten für das Zeugnis als Spalte bereitstellen (für den späteren Skill zeugnis-vorbereiten).

Keine Gründe für Fehlzeiten erfassen oder vermuten (Gesundheit ist besondere Kategorie). Häufen sich Fehlzeiten so, dass Schulpflicht oder Kindeswohl berührt sein könnten: nur auf das Verfahren der Schule hinweisen, nichts selbst einordnen.

Ist die lernstandsakte freigegeben: nach Bestätigung die Zahl der Fehltage je Halbjahr in die Kind-Akte schreiben (Bereich Leistungen oder Termine, nicht die einzelnen Tage).

**Benachrichtigung festhalten:** Sagt die Lehrkraft, dass sie Eltern informiert hat (oder gibt Daten aus der Vergangenheit an), nach Bestätigung in die Kind-Akte schreiben, Bereich Termine: `2026-11-18 | Beleg | Eltern über Fehlzeiten informiert (unentschuldigt bis dahin: 12 Std.) | Quelle: Lehrkraft | bestätigt`. Ab diesem Datum zählt die Schwelle neu. Bei „noch nie“ nichts eintragen.

## 3. Listen

Typische Listen, alle mit Kürzeln und Serienbrief-Tabelle für Namen:

- **Rücklauf-Listen:** Einverständniserklärungen, Elternbrief-Abschnitte, Formulare. Spalten: Kürzel · eingegangen (Datum) · fehlt noch. Dazu eine Erinnerung als Entwurf für alle, bei denen etwas fehlt.
- **Geld-Listen:** Klassenfahrt, Ausflug, Kopiergeld. Spalten: Kürzel · Betrag · bezahlt am · offen. Summen per Formel. Keine Kontodaten.
- **Noten- und Teilnotenlisten** für Konferenzen: aus dem Excel-Export von **pruefung-korrigieren** und aus der lernstandsakte zusammenführen; Spalten nach der Notenliste der Schule (Profil). Gewichtung nur nach Profil, nie geschätzt.
- **Gruppen- und Sitzlisten**, Listen für Wahlen (Kurse, AGs, Projekte) aus Rückmeldungen.
- **Eintrag in die Schulsoftware vorbereiten:** Werte in der Reihenfolge und dem Format, das die Schulsoftware zum Import oder Abtippen braucht. Eintragen tut die Lehrkraft selbst.

Ausgabe als Excel (.xlsx) mit Formeln statt fester Werte, wo sich etwas ändert; dazu eine druckbare Fassung im Layout des Profils. Summen und Zählungen per Code prüfen, nicht im Kopf.

## 4. Formulare vorbefüllen

Für Formulare der Schule (Antrag Klassenfahrt oder Unterrichtsgang, Kostenaufstellung, Abrechnung, Bestellungen, Raum- und Gerätebuchung):

1. Vorlage aus dem Profil nehmen; neue Formulare zuerst über **schulprofil** (Vorlage adaptieren) aufnehmen.
2. Felder füllen, die aus Profil, Planung oder Gespräch bekannt sind (Lerngruppe, Termin, Ziel, Begleitung als Rolle, Kosten aus der Geld-Liste).
3. Felder mit Personenbezug (Name eines Kindes, Unterschrift) leer lassen oder als Serienbrief-Feld setzen.
4. Unbekannte Pflichtfelder als `[ausfüllen]` markieren und am Ende auflisten.
5. Wo möglich das Original (Word, PDF-Formular) direkt füllen statt nachzubauen.

Für die ganze Planung einer Exkursion oder Schulfahrt (Lernort, Anfahrt, Kosten, Antrag, Elternbrief) gibt es **exkursion-planen**; es übergibt Rücklauf-, Geldlisten und Abrechnung hierher.

Nicht für Unfallmeldungen, Meldungen an Jugendamt oder Gesundheitsamt, Ordnungsmaßnahmen oder Kinderschutz: Dort nur auf das zuständige Verfahren und die Zuständigen der Schule verweisen.

## 5. Ausgabe

- Dateien nach `ausgaben/` im Datenordner bzw. nach dem Ablagemuster des Profils; ohne Ablage als Dateien im Gespräch.
- Am Ende kurz: was erstellt wurde, was die Lehrkraft noch tun muss (Namen per Serienbrief einsetzen, prüfen, abschicken, in die Schulsoftware eintragen), offene `[ausfüllen]`-Stellen.

## 6. Grundsätze

- Der Mensch entscheidet: Der Skill verschickt nichts, trägt nichts in die Schulsoftware ein und meldet nichts. Alles sind Entwürfe.
- So wenig Daten wie nötig: nur die Spalten verarbeiten, die die Aufgabe braucht.
- Regeln kommen aus dem Profil, nicht aus Annahmen.
- Rechnen per Code, Ergebnisse nachprüfbar (Formeln in Excel).