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

Beim ersten Export einer Schulsoftware die Spaltenstruktur beschreiben und im Profil unter `werkzeuge.schulsoftware_export` merken, damit spätere Exporte ohne Rückfragen gelesen werden.

## 2. Fehlzeiten abgleichen

Eingaben: Fehlzeiten-Export (Kürzel, Datum, Stunden, Status entschuldigt/unentschuldigt/offen) und, falls getrennt geführt, die eingegangenen Entschuldigungen.

Schritte:

1. Je Kürzel zusammenfassen: Fehltage, Fehlstunden, davon entschuldigt, unentschuldigt, offen.
2. **Offene Entschuldigungen** mit Fristablauf nach Profilregel markieren.
3. **Auffälligkeiten** nach den Schwellenwerten des Profils (z. B. „ab x unentschuldigten Stunden Eltern informieren“). Ohne Regel im Profil nur sortieren, nicht bewerten.
4. Ergebnis als Tabelle: Kürzel · Fehlstunden · unentschuldigt · offen seit · nächster Schritt laut Schulregel.
5. **Erinnerungen** an Eltern bzw. volljährige Schülerinnen und Schüler als Entwurf: kurz, freundlich, sachlich, mit Datum und Frist, im Briefkopf des Profils. Namen nur als Serienbrief-Feld (`«Vorname»`, `«Anrede»`). Dazu die Serienbrief-Tabelle nach lernstandsakte, Abschnitt 6.
6. Fehlzeiten für das Zeugnis als Spalte bereitstellen (für den späteren Skill zeugnis-vorbereiten).

Keine Gründe für Fehlzeiten erfassen oder vermuten (Gesundheit ist besondere Kategorie). Häufen sich Fehlzeiten so, dass Schulpflicht oder Kindeswohl berührt sein könnten: nur auf das Verfahren der Schule hinweisen, nichts selbst einordnen.

Ist die lernstandsakte freigegeben: nach Bestätigung die Zahl der Fehltage je Halbjahr in die Kind-Akte schreiben (Bereich Leistungen oder Termine, nicht die einzelnen Tage).

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

Nicht für Unfallmeldungen, Meldungen an Jugendamt oder Gesundheitsamt, Ordnungsmaßnahmen oder Kinderschutz: Dort nur auf das zuständige Verfahren und die Zuständigen der Schule verweisen.

## 5. Ausgabe

- Dateien nach `ausgaben/` im Datenordner bzw. nach dem Ablagemuster des Profils; ohne Ablage als Dateien im Gespräch.
- Am Ende kurz: was erstellt wurde, was die Lehrkraft noch tun muss (Namen per Serienbrief einsetzen, prüfen, abschicken, in die Schulsoftware eintragen), offene `[ausfüllen]`-Stellen.

## 6. Grundsätze

- Der Mensch entscheidet: Der Skill verschickt nichts, trägt nichts in die Schulsoftware ein und meldet nichts. Alles sind Entwürfe.
- So wenig Daten wie nötig: nur die Spalten verarbeiten, die die Aufgabe braucht.
- Regeln kommen aus dem Profil, nicht aus Annahmen.
- Rechnen per Code, Ergebnisse nachprüfbar (Formeln in Excel).