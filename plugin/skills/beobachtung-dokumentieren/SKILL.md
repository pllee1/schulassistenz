---
name: beobachtung-dokumentieren
description: Hält mündliche Mitarbeit, Arbeits- und Sozialverhalten und besondere Beobachtungen fest (schulassistenz): Live-Notizen in der Stunde, Nachtrag danach, Druckbogen; Auswertung und Vorschlag mündliche Note. Nur Kürzel.
---

# Beobachtung dokumentieren

Macht aus kurzen Notizen am Rechner eine belastbare Grundlage für mündliche Noten, Zeugnisbemerkungen, Lernentwicklungsberichte, ILE-Bögen, Elterngespräche und Konferenzen. Die Lehrkraft tippt so wenig wie möglich; der Skill ordnet zu, fragt gesammelt nach und wertet aus.

## 0. Vorher

- Profil über **schulprofil** lesen: Freigabe der Schulleitung, Datenordner, Kriterienraster (Vorlage der Schule), Stufen, Notenskala, Gewichtung mündlich.
- Ist die Freigabe für Schülerdaten „offen“ oder „nicht erteilt“: nur mit ausgedachten Testkürzeln arbeiten, nichts in die lernstandsakte schreiben und das kurz sagen.
- Nur Kürzel (z. B. K07, S12 oder Schüler-Code). Kommt ein Name vor, nicht übernehmen und nach dem Kürzel fragen.

## 1. Einrichten (einmal je Lerngruppe)

1. **Lerngruppe und Kürzelliste** (nur Kürzel) aus der lernstandsakte übernehmen oder anlegen.
2. **Kriterienraster** festlegen:
   - Gibt es eine Vorlage der Schule (ASV-Katalog, Beobachtungsbogen, Zeugnisformular) im Profil, deren Kategorien und Stufen verwenden.
   - Sonst neutraler Standard:
     - **Mündliche Mitarbeit (MM):** Häufigkeit; Qualität der Beiträge; Fachsprache; Fragen stellen; auf andere eingehen.
     - **Arbeitsverhalten (AV):** Sorgfalt und Vollständigkeit; Selbstständigkeit; Ausdauer; Material und Hausaufgaben.
     - **Sozialverhalten (SV):** Zusammenarbeit; Hilfsbereitschaft; Umgang mit Regeln; Konfliktverhalten.
   - Stufen einstellbar, Standard 4 Stufen: `++` deutlich über den Erwartungen, `+` über, `o` entspricht, `-` unter den Erwartungen. Optional Notenbezug nach Profil.
3. **Schülergerechte Fassung** des Rasters als eine Seite zum Aushängen oder Teilen anbieten („Daran erkennst du gute mündliche Mitarbeit“).
4. **Fokusrotation:** wie viele Kinder pro Stunde im Fokus stehen (Standard 4–6). Der Skill schlägt sie vor (Abschnitt 4).

Raster und Rotation in der Lerngruppen-Akte (`gruppe.md`, Bereich Unterricht) speichern, nach Bestätigung.

## 2. Live-Modus (während der Stunde)

Die Lehrkraft tippt eine Zeile pro Beobachtung, so kurz sie will. Kürzel zuerst, dann Symbol, dann optional ein paar Wörter:

```
K12 ++ Hypothese begründet
K07 AV- Material vergessen
K03 !
K05 SV+ hilft K09 beim Aufbau
K12 + Frage zu Einheiten
```

Lesart:

| Eingabe | Bedeutung |
|---|---|
| `++`, `+`, `o`, `-` ohne Kürzel der Kategorie | mündliche Mitarbeit |
| `AV` / `SV` vor dem Symbol | Arbeits- bzw. Sozialverhalten |
| `!` | Auffälligkeit, später ergänzen |
| `*` | besondere Stärke oder Fortschritt |
| freier Text | Situation in Stichworten |

Regeln im Live-Modus:

- Nicht unterbrechen: keine Rückfragen während der Stunde. Jede Zeile kurz bestätigen (z. B. „✓ K12 MM ++“), mehr nicht.
- Datum, Uhrzeit, Fach und Lerngruppe automatisch ergänzen.
- Unklares sammeln (unbekanntes Kürzel, Symbol ohne Kategorie, `!` ohne Text) und erst am Ende fragen.
- Am Ende der Stunde (Lehrkraft schreibt „Ende“ oder wechselt in den Nachtrag): Liste der Einträge zeigen, offene Fragen gebündelt stellen, dann zur Freigabe vorlegen.

### Live-Raster auf der Startseite

Die Startseite von schulassistenz hat ein eigenes Live-Raster (Kind antippen, Symbol wählen, „Stunde beenden“, Freigabe). Es zeigt Namen nur lokal und schreibt die freigegebenen Einträge selbst in die Akten, mit `Quelle: beobachtung-dokumentieren (Live-Raster)`. Diese Einträge sind schon bestätigt; nicht erneut schreiben, aber bei Auswertungen wie alle anderen Beobachtungen nutzen. Fragt die Lehrkraft nach einem schnellen Weg für die Stunde, auf das Raster verweisen.

Die Skala für die mündliche Mitarbeit wählt die Lehrkraft im Raster je Lerngruppe. In den Akten steht sie so:
- Symbole: `MM ++`, `MM +`, `MM o`, `MM -`, `MM --`
- Noten: `MM Note 2` (1–6)
- Notenpunkte: `MM 12 NP` (0–15)

Noten und Punkte sind Einzelwerte und gehen direkt in den Vorschlag der mündlichen Teilnote ein (Umrechnung nach Profil, in der Oberstufe sonst üblich: 15–13 = 1, 12–10 = 2, 9–7 = 3, 6–4 = 4, 3–1 = 5, 0 = 6). Symbole sind Tendenzen: nur nach einer Zuordnung umrechnen, die die Lehrkraft bestätigt hat, sonst als Verteilung zeigen. Gemischte Skalen in einem Zeitraum offen ausweisen.

## 3. Nachtrag-Modus (nach der Stunde)

Geführter Durchgang, kurz und in fester Reihenfolge:

1. Offene Live-Notizen klären (`!`-Einträge ergänzen, Unklares zuordnen).
2. **Fokuskinder der Stunde** nacheinander: je Kind die Rasterkategorien mit einem Symbol abfragen („K04: MM? AV? SV?“), freie Notiz optional. Leere Eingabe = nicht beobachtet, nicht „o“.
3. Weitere Kinder, zu denen der Lehrkraft noch etwas einfällt.
4. Liste aller Einträge zur Freigabe.

Beide Modi lassen sich mischen: live notieren, danach im Nachtrag ergänzen.

## 4. Beobachtungsrhythmus

- Vor der Stunde auf Wunsch die **Fokuskinder** vorschlagen: zuerst die, die am längsten nicht beobachtet wurden, dann gleichmäßig rotierend.
- **Hinweis auf Lücken:** Kinder ohne Beobachtung seit einer einstellbaren Zeit (Standard 3 Wochen bzw. 6 Stunden der Lerngruppe) nennen.
- Keine Bewertung der Lücke; es geht nur darum, dass alle gleich oft gesehen werden.

## 5. Druckbogen (Notlösung ohne Rechner)

- Ein Blatt je Lerngruppe und Stunde im Layout des Profils: Kopf mit Datum, Fach, Lerngruppe; Tabelle mit den Kürzeln als Zeilen, Spalten MM, AV, SV, Notiz; Legende der Symbole unten.
- Danach entweder abtippen (Live-Syntax) oder als Foto hochladen. Fotos laufen über **dokument-analyse**; Unleserliches wird markiert und nachgefragt, nie geraten.

## 6. Freigabe und Speichern

- Vor dem Speichern alle Einträge der Stunde als Tabelle zeigen: Kürzel · Kategorie · Stufe · Situation.
- Nach Freigabe je Kind in die **lernstandsakte** schreiben, Bereich „Arbeits- und Sozialverhalten“ bzw. „Leistungen“ (für mündliche Mitarbeit), Art `Beobachtung`, Quelle `beobachtung-dokumentieren, <Fach> <Lerngruppe>`, Status `bestätigt`.
- Format eines Eintrags: `2026-11-16 | Beobachtung | MM ++: Hypothese begründet (Physik 10d, 3. Std.) | Quelle: beobachtung-dokumentieren | bestätigt`.
- Nur beobachtbares Verhalten. Deutungen, Diagnosen, Vermutungen über Gründe oder familiäre Umstände nicht übernehmen; stattdessen die Lehrkraft bitten, die Situation beobachtbar zu formulieren.
- Hinweise auf Kinderschutz oder Krisen nicht dokumentieren, sondern auf das Verfahren der Schule verweisen.

## 7. Auswertung

Auf Wunsch, z. B. vor Zeugnissen, Konferenzen oder Elterngesprächen:

- **Verlauf je Kind:** Einträge chronologisch, Häufung je Kategorie, Entwicklung (früher/jetzt), Stärken. Hat das Kind laut `lerngruppen/kuerzel-verknuepfung.md` weitere Kürzel, auf Wunsch die Beobachtungen aus diesen Lerngruppen daneben zeigen (je Lerngruppe getrennt): AV und SV dürfen fachübergreifend verglichen werden, MM nicht.
- **Überblick je Klasse:** Tabelle Kürzel × Kategorie mit Anzahl und Tendenz; Kinder mit wenigen Beobachtungen markiert.
- **Vorschlag mündliche Teilnote:** nur aus den MM-Einträgen der jeweiligen Lerngruppe (also des Fachs), nie aus verknüpften Akten anderer Fächer, nach der Skala des Profils, mit Begründung (Anzahl der Beobachtungen, Verteilung der Stufen, Entwicklung). Bei weniger als 5 Beobachtungen im Zeitraum deutliche Warnung „Datenlage dünn“. Immer als `Vorschlag` mit Status `offen`; die Note setzt die Lehrkraft.
- **ASV-Formulierungsbausteine:** sachliche, stärkenorientierte Sätze passend zu den Kategorien und Stufen der Schule, mit `«Vorname»` als Platzhalter, für zeugnis-vorbereiten und lernentwicklung-dokumentieren.
- **Export:** Excel (.xlsx) für die Notenliste (Kürzel, Anzahl, Vorschlag MM, ASV-Tendenz), mit leerem Blatt `Klassenliste` für Namen per Serienbrief nach lernstandsakte, Abschnitt 6.

## 8. Weitergabe

Abnehmer lesen die Einträge aus der lernstandsakte: zeugnis-vorbereiten, lernentwicklung-dokumentieren (LEB, ILE), elterngespraech-vorbereiten, konferenz-vorbereiten, foerderplan-schreiben.

## 9. Grundsätze

- Der Mensch entscheidet: Einträge erst nach Freigabe gültig; Notenvorschläge bleiben Vorschläge.
- Schnell vor vollständig: lieber eine kurze echte Beobachtung als ein ausgefülltes Raster aus dem Gedächtnis.
- Fair: alle Kinder gleich oft im Blick, nicht beobachtet ist nicht schlecht.
- Datenschutz: nur Kürzel, nur Beobachtbares, Löschung nach Profil (Schuljahresende plus Frist).
