---
name: wochenplaner
description: Plant die Arbeitswoche einer Lehrkraft (schulassistenz) aus Stundenplan, Terminen, Fristen und offenen Aufgaben: Prioritäten, feste Zeitfenster für Vorbereitung und Korrektur, Puffer, geschützte Pausen und Feierabend, Erreichbarkeitszeiten. Ohne Schülerdaten.
---

# Wochenplaner

Macht aus allem, was in einer Schulwoche ansteht, einen realistischen Plan: Was ist wirklich dran, wann wird es erledigt, was kann warten. Ziel ist Entlastung, nicht mehr Arbeit in weniger Zeit. Pausen und Feierabend sind Termine wie alle anderen.

Braucht keine Schülerdaten. Aufgaben werden mit Lerngruppe oder Kürzel benannt, nie mit Namen.

## 0. Vorher

Profil über **schulprofil** lesen: Stundenplan-Quelle, Kalender bzw. Kommunikationssystem, Ablage. Beim ersten Mal die persönlichen Rahmenwerte erfragen und in `profil.md` unter `selbstmanagement` speichern (nach Bestätigung):

- **Arbeitszeitrahmen:** frühester Beginn, spätester Feierabend je Wochentag, arbeitsfreie Tage (z. B. Samstag frei, Sonntag höchstens 2 Stunden).
- **Erreichbarkeit:** wann Mails und Nachrichten gelesen werden (z. B. zweimal täglich, nicht nach 18 Uhr).
- **Feste private Termine**, die geschützt bleiben (nur als „privat“, ohne Inhalt).
- **Erfahrungswerte:** Minuten je Klausur beim Korrigieren je Stufe, Vorbereitungszeit je Stunde neu bzw. vorhanden.
- **Energie:** zu welcher Tageszeit konzentrierte Arbeit am besten gelingt.

Ohne Angaben: neutraler Rahmen (Werktage, Feierabend 18 Uhr, Wochenende frei) und das im Plan sagen.

## 1. Eingänge sammeln

Alles nutzen, was da ist, nichts verlangen, was fehlt:

- **Stundenplan** mit Unterricht, Aufsichten, Vertretungen, Sprechstunde. Quellen in dieser Reihenfolge:
  1. Block „Unterricht (feste Blöcke, aus WebUntis)“ im Auftrag. Den schreibt der Knopf „Woche planen“ der Startseite hinein: je Tag Uhrzeit, Lerngruppe (Kürzel), Raum, „entfällt“.
  2. `<Datenordner>/planung/stundenplan.md`. Die Startseite schreibt die Datei aus dem iCal-Abo der Lehrkraft und aktualisiert sie bei jedem Laden. Das Datum „Stand“ beachten: Ist es älter als eine Woche, darauf hinweisen.
  3. WebUntis-Export (.ics), Foto oder Liste von der Lehrkraft.
  Den iCal-Link (persönlicher Zugangsschlüssel) nie erfragen, speichern oder weitergeben. Fehlt der Stundenplan, auf den Knopf „Stundenplan“ der Startseite verweisen oder um einen Screenshot bitten.
- **Prüfungen:** Steht im Auftrag oder in `stundenplan.md` je Tag „Prüfungen: …“ (aus WebUntis, über die Startseite), sind das feste Termine. Danach gleich ein Korrekturfenster einplanen (Umfang aus „n Arbeiten“ schätzen, Rückgabefrist aus dem Profil). Steht dort ein Abschnitt „Überschneidungen bei Prüfungen“, diese zuerst nennen, je Fall einen Ausweg vorschlagen (verlegen, tauschen, Aufsicht klären) und nichts selbst umplanen. Die Liste zeigt nur die Prüfungen, an denen die Lehrkraft beteiligt ist. Ob eine Klasse bei anderen Lehrkräften weitere Arbeiten schreibt, steht dort nicht.
- **Termine** aus dem Kalender (z. B. IServ-Kalender als .ics, Liste oder Foto): Konferenzen, Elterngespräche, Fortbildungen.
- **Fristen:** Notenabgabe, Zeugnisse, Klausurrückgabe, Anträge.
- **Offene Aufgaben** aus der gemeinsamen Aufgabenliste (Abschnitt 1a, dort landen u. a. Aufgaben und Termine aus Mails über den **postfach-assistent**), von der Lehrkraft (diktiert oder als Liste) und aus anderen Skills: Korrekturen nach **pruefung-entwerfen**, Termine aus der **lernstandsakte**, Vorbereitung aus der Unterrichtsplanung.

Für jede Aufgabe kurz klären oder schätzen: Dauer, Frist, ob sie an einen Ort oder ein Gerät gebunden ist. Schätzungen als solche kennzeichnen und die Erfahrungswerte aus dem Profil nutzen.

## 1a. Gemeinsame Aufgabenliste

Andere Skills (vor allem **postfach-assistent**) tragen Aufgaben und Termine in eine gemeinsame Liste ein; der Wochenplaner liest sie bei jeder Planung als ersten Eingang.

Datei: `<Datenordner>/planung/aufgaben.md`. Aufbau:

```
# Aufgabenliste
| Nr | Art | Was | Datum/Frist | Dauer | Quelle | Status |
|----|-----|-----|-------------|-------|--------|--------|
| 12 | Termin | Fachkonferenz Chemie, R. 104 | 2026-11-19 14:30 | 90 | Mail L-SL 13.11. | offen |
| 13 | Aufgabe | Noten 10d eintragen | bis 2026-11-21 | 30~ | Mail L-SL 13.11. | geplant KW47 |
```

- **Art:** Termin · Aufgabe · Antwort. **Dauer** in Minuten, `~` = geschätzt. **Quelle:** Skill bzw. Mail als Rolle/Kürzel + Datum, nie Namen oder Mailtext.
- **Status:** `offen` → `geplant KW<nn>` (beim Planen) → `erledigt <Datum>` (im Wochenrückblick oder wenn die Lehrkraft es sagt) oder `gestrichen`.
- Nur Zeilen anhängen oder den Status ändern; erledigte Zeilen älter als 4 Wochen nach Bestätigung nach `planung/archiv/` verschieben.
- Gibt es keinen Datenordner, die Liste im Gespräch führen und am Ende als Block zum Speichern ausgeben.

Beim Planen: alle Zeilen mit Status `offen` und überfällige `geplant`-Zeilen übernehmen, Termine fest setzen, Aufgaben nach Abschnitt 2 priorisieren, danach den Status in der Liste aktualisieren (nach Bestätigung des Plans).

## 2. Priorisieren

Jede Aufgabe einer Stufe zuordnen und die Zuordnung kurz zeigen:

1. **Fest:** Termine und Unterricht, nicht verschiebbar.
2. **Frist diese Woche:** muss bis zu einem Datum fertig sein.
3. **Wichtig, ohne Frist:** bringt Unterricht oder Entlastung voran (z. B. Material für die nächste Einheit, Korrektur früh beginnen).
4. **Kann warten oder wegfallen:** vorschlagen, was verschoben, verkürzt, geteilt oder gestrichen werden kann („Arbeitsblatt aus dem Archiv statt neu“, „Kurzrückmeldung statt ausführlichem Kommentar“).

Passt die Arbeit nicht in den Rahmen, das offen sagen und Entlastung vorschlagen, statt den Feierabend zu verschieben. Mögliche Entlastung: wiederverwenden (Materialarchiv), Korrektur auf mehrere Tage verteilen, Aufgaben delegieren oder im Team teilen, Frist nachfragen.

## 3. Woche planen

Regeln für den Plan:

- **Feste Zeitfenster** (Blöcke von 30 bis 90 Minuten) für konzentrierte Arbeit in die Energie-Zeiten der Lehrkraft legen; Kleinkram bündeln.
- **Korrektur verteilen:** Klausuren in Portionen planen (z. B. 8 Arbeiten je Block), Rückgabetermin rückwärts einplanen.
- **Puffer:** etwa 20 % der geplanten Arbeitszeit frei lassen, mindestens ein Puffer-Block an jedem Unterrichtstag.
- **Pausen schützen:** zwischen Unterricht und Arbeitsblock mindestens 15 Minuten, Mittagspause als Termin.
- **Unterricht ist fest:** Stunden aus dem Stundenplan sind unverschiebbare Blöcke. Entfallene Stunden („entfällt“) werden frei und zuerst für fällige Aufgaben genutzt. Bei Vertretungen und Änderungen nachfragen, ob sie schon im Plan stehen.
- **Freistunden nutzen:** Lücken zwischen zwei Stunden in der Schule für kurze, ortsgebundene Aufgaben einplanen (Kopieren, Absprachen, Kleinkram, Mails nur in Mail-Zeiten). Lücken unter 30 Minuten bleiben Pause.
- **Erreichbarkeit:** feste Mail-Zeiten laut Profil als kurze Blöcke; außerhalb davon keine Mail-Aufgaben einplanen.
- **Feierabend und freie Tage** werden nicht verplant. Ausnahme nur, wenn die Lehrkraft es ausdrücklich will, und dann begrenzt.

## 4. Ausgabe

1. **Wochenübersicht:** Tabelle Montag bis Sonntag mit Uhrzeit, Block und Art (Unterricht, Termin, Arbeitsblock, Puffer, Pause, privat). Farbig nach Art, wenn als HTML oder PDF ausgegeben; Layout aus dem Profil.
2. **Top 3 der Woche:** die drei Aufgaben, die den größten Unterschied machen.
3. **Bewusst verschoben:** was diese Woche nicht drankommt und wann es geplant ist.
4. **Kalenderdatei (.ics)** mit den Arbeitsblöcken, damit die Lehrkraft sie in ihren Kalender (z. B. IServ) importieren kann. Nichts selbst in einen Kalender eintragen.
5. Auf Wunsch eine **Abwesenheits- bzw. Erreichbarkeitsnotiz** als Text für das Mailprogramm.

Ablage nach Profil unter `ausgaben/wochenplan_<JJJJ-KW>`; sonst als Dateien im Gespräch.

## 5. Unter der Woche

- **Umplanen:** Fällt etwas aus oder kommt etwas dazu, nur den betroffenen Teil neu planen und sagen, was sich dadurch verschiebt.
- **Tagesblick:** auf Wunsch morgens eine kurze Liste für heute (Termine, ein bis drei Aufgaben, Feierabendzeit).
- **Wochenrückblick:** am Ende der Woche kurz fragen, was geschafft wurde und wo die Schätzungen daneben lagen. Erfahrungswerte im Profil anpassen (nach Bestätigung).

## 6. Grundsätze

- Der Mensch entscheidet: Der Plan ist ein Vorschlag; Prioritäten setzt die Lehrkraft.
- Entlastung vor Effizienz: lieber eine Aufgabe streichen als die Pause.
- Realistisch statt ideal: Schätzungen offenlegen, Puffer einplanen.
- Keine Bewertung der Arbeitsweise; bei dauerhaft überfüllten Wochen sachlich auf die Arbeitslast hinweisen und Entlastung vorschlagen.
- Private Termine bleiben privat: nur als Block ohne Inhalt.
