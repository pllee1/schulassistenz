---
name: "pruefung-entwerfen"
description: "Entwirft Klassenarbeiten, Klausuren, Tests und mündliche Prüfungen für jedes Fach und jede Stufe (schulassistenz): Aufgaben mit Operatoren und AFB, Erwartungshorizont, Notenschlüssel; Satz mit material-gestalten, Übergabe an pruefung-korrigieren."
---

# Prüfung entwerfen

Erstellt aus einer Einheit oder einer Themenliste eine fertige Prüfung samt Erwartungshorizont. Der Entwurf geht danach ins Layout und später direkt in die Korrektur. Damit ist die Kette **Einheit → Prüfung → Korrektur** geschlossen.

Arbeitet ohne Schülerdaten. Läuft deshalb auch, solange die Schulleitung die Verarbeitung von Schülerdaten noch nicht freigegeben hat.

## 0. Vorher

Profil über **schulprofil** lesen: Bundesland, Schulform, Lehrplan, Notenskala und Notenschlüssel der Stufe, Rundungsregel, Operatorenliste, Schüler-Code, Layout, Ablage. Fehlt der Notenschlüssel, einmal fragen und anbieten, ihn ins Profil zu übernehmen. Nie einen Notenschlüssel erfinden.

## 1. Rahmen klären

Kurz und gebündelt fragen, nur was fehlt:

- **Prüfungsart:** Klassenarbeit, Klausur, Test, Lernzielkontrolle, mündliche Prüfung, Präsentationsprüfung, Abiturvorbereitung.
- **Lerngruppe:** Fach, Jahrgang, Niveau (z. B. G/E, gA/eA, Förderschwerpunkt, Bildungsgang), Größe.
- **Inhalte:** Thema, Kompetenzen, was ausdrücklich nicht drankommt. Am besten den Klausurblock aus dem Stoffverteilungsplan von **einheit-planen** übernehmen (im Ordner der Einheit bzw. in gruppe.md unter Unterricht und Termine).
- **Dauer und Hilfsmittel:** Minuten, Taschenrechner, Formelsammlung, Wörterbuch, Material.
- **Vorgaben der Fachgruppe:** Muster einer alten Klausur, verbindliche Aufgabenformate, Gewichtung der AFB.
- **Nachteilsausgleich:** ob eine angepasste Fassung nötig ist (nur die Maßnahme, z. B. mehr Zeit, vergrößerte Schrift, Vorlesen). Keine Namen, keine Gründe.

Liegt eine alte Klausur als Muster vor, Aufbau, Umfang, Punkteverteilung und Formulierungen daraus übernehmen und das bestätigen lassen.

## 2. Bauplan vorlegen (vor dem Ausformulieren)

Eine Tabelle, damit die Lehrkraft in einer Minute zustimmen oder umsteuern kann:

| Aufgabe | Inhalt / Kompetenz | Operator | AFB | Punkte | Zeit (Min.) |
|---|---|---|---|---|---|

Regeln für den Bauplan:

- **AFB-Verteilung:** Schwerpunkt AFB II, AFB I stärker als AFB III (Richtwert etwa 30 / 50 / 20 %), sofern Profil oder Fachgruppe nichts anderes vorgeben. Grundschule und Förderschwerpunkte: AFB nur intern, auf dem Schülerblatt nicht ausweisen.
- **Operatoren** nur aus der Operatorenliste des Profils bzw. des Bundeslands. Ein Operator je Teilaufgabe.
- **Zeit realistisch:** Summe der geschätzten Bearbeitungszeiten höchstens 85 % der Prüfungszeit.
- **Abdeckung:** jede angekündigte Kompetenz mindestens einmal, nichts aus „nicht in der Klausur“.
- **Alltagsbezug:** wo das Fach es erlaubt, ein Kontext aus der Lebenswelt, der für alle verständlich ist.
- **Niveaustufen:** bei G/E oder gA/eA entweder gemeinsame Basis plus Zusatzaufgaben oder zwei Fassungen; im Bauplan kennzeichnen.

Erst nach Zustimmung ausformulieren.

## 3. Aufgaben ausformulieren

- Klare, kurze Aufgabenstellungen; Operator am Satzanfang und fett.
- Sprache dem Jahrgang angemessen; Fachbegriffe nur, wenn sie geübt wurden. Bei sprachlich schwächeren Gruppen Satzanfänge oder Wortspeicher als Hilfe anbieten (nicht bei Aufgaben, die genau das prüfen).
- Material (Texte, Abbildungen, Tabellen, Versuchsbeschreibungen) vollständig und mit Quelle. Bei Versuchen eine beschriftete Versuchsskizze vorsehen.
- Zahlenwerte so wählen, dass die Rechnung aufgeht und typische Fehler unterscheidbar werden.
- Keine Aufgabe, deren Lösung von einer anderen abhängt, ohne Ersatzwert („Falls du a) nicht lösen konntest, rechne mit …“).
- Bei Mehrfachauswahl: eindeutige Lösung, plausible Distraktoren, keine Negativ-Formulierungen ohne Hervorhebung.
- Kopf der Prüfung nach Profil: bei Schüler-Code (z. B. Sek I) nur Code-Feld, kein Namensfeld.

## 4. Erwartungshorizont

Für jede Teilaufgabe:

- **Musterlösung** vollständig, mit Rechenweg bzw. erwarteten Kernaussagen.
- **Bewertungskriterien** als Liste mit Punkten je Kriterium; Teilpunkt-Regeln (z. B. „Ansatz richtig, Rechenfehler: 2 von 3 P.“), Folgefehler-Regel.
- **Gleichwertige Alternativen**, die volle Punkte bekommen.
- **Typische Fehler**, die erwartet werden, und wie sie bewertet werden.
- Operator, AFB und Kompetenzbezug.

Dazu die Gesamtpunktzahl und der **Notenschlüssel** aus dem Profil, umgerechnet in Punkte (BE nach Profilregel aufrunden). Punkte im Erwartungshorizont, auf dem Aufgabenblatt und im Notenschlüssel müssen übereinstimmen; per Code nachrechnen, nicht im Kopf.

Der Erwartungshorizont ist so aufgebaut, dass **pruefung-korrigieren** ihn direkt verwenden kann (Aufgabenübersicht, Kriterien, Maximalpunkte, Teilpunkt-Regeln, Notenschlüssel an einer Stelle).

## 5. Mündliche Prüfung

Statt Aufgabenblatt:

- **Prüfungsaufgabe** für die Vorbereitungszeit (Material + 2–4 Teilaufgaben, AFB I bis III).
- **Gesprächsteil:** Leitfragen in steigender Anforderung, mit Impulsen für den Fall, dass die Antwort stockt.
- **Erwartungshorizont** mit Kriterien für Inhalt, Fachsprache, Strukturierung, Gesprächsfähigkeit.
- **Protokollbogen** (Vorlage der Schule aus dem Profil, sonst neutral): Zeit, Fragen, Antworten in Stichworten, Bewertung, Unterschriften Prüfer und Protokollant. Ohne Namen; der Name wird erst vor Ort eingetragen.

## 6. Qualitätsprüfung vor der Ausgabe

- Jede Teilaufgabe hat Operator, Punkte und im Erwartungshorizont eine Lösung.
- Summen stimmen überall; Notenschlüssel aus dem Profil, nicht geschätzt.
- AFB-Verteilung und Zeitbedarf passen zum Bauplan.
- Fachlich richtig: Lösungen selbst nachgerechnet bzw. geprüft; Unsicheres als `[prüfen]` markieren statt glätten.
- Keine Aufgabe verrät die Lösung einer anderen.
- Angepasste Fassung (Nachteilsausgleich) inhaltlich gleichwertig.

Gefundene Probleme der Lehrkraft nennen, nicht still korrigieren, wenn sie den Bauplan betreffen.

## 7. Ausgabe

1. **Prüfung** (Schülerfassung) mit **material-gestalten** setzen (Abschnitt 4, Layout aus dem Profil). Ohne Layout-Vorgabe: neutraler Standard.
2. **Erwartungshorizont** als eigenes Lehrer-Dokument im selben Layout.
3. Optional: **angepasste Fassung**, **Nachschreibklausur** mit gleichem Bauplan und anderen Kontexten bzw. Zahlen, **Bewertungsbogen** für die Rückgabe.
4. Ablage nach dem Ablagemuster des Profils und Eintrag ins Register nach **materiallager** (Art Prüfung bzw. Erwartungshorizont); sonst als Dateien im Gespräch. Ältere Prüfungen zum Thema (auch Fachgruppenklausuren vom Schulserver, nur lesen) vorher über **materiallager** suchen und als Anregung anbieten (Nachschreibklausur, gleiche Schwerpunkte), und die Wissensbasis der Einheit (`quellen.md`) für Inhalte und Kontexte lesen.

Am Ende kurz sagen: Gesamtpunktzahl, AFB-Verteilung, geschätzte Bearbeitungszeit, offene `[prüfen]`-Stellen, und dass die Unterlagen für **pruefung-korrigieren** bereitliegen.

## 8. Weitergabe

- Nach dem Schreiben der Prüfung: Blanko-Klausur, Erwartungshorizont und Notenschlüssel an **pruefung-korrigieren** übergeben, wenn die Korrektur ansteht; alles im Ordner der Einheit ablegen, damit die Korrektur es dort findet.
- Ist die lernstandsakte freigegeben, den Prüfungstermin und die Inhalte in die Lerngruppen-Akte (Bereich Unterricht bzw. Termine) eintragen, nach Bestätigung.

## 9. Grundsätze

- Der Mensch entscheidet: Bauplan, Aufgaben und Erwartungshorizont sind Entwürfe; nichts geht ohne Freigabe der Lehrkraft an die Lerngruppe.
- Fair und transparent: nur Geübtes prüfen, klare Aufgaben, nachvollziehbare Bewertung.
- Allgemein gültig: alle Werte, die nach Schule, Fach oder Bundesland variieren, kommen aus dem Profil oder werden erfragt.