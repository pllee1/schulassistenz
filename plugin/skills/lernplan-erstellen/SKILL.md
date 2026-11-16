---
name: "lernplan-erstellen"
description: "Erstellt individuelle Lernpläne je Kind aus der Lernstandsakte (schulassistenz): Klausurlücken, Beobachtungen, Zeugnis- und Gesprächsvereinbarungen werden zu Zielen, Lernschritten mit Material, Selbstcheck und Überprüfungstermin; einzeln oder für eine ganze Lerngruppe. Nur Kürzel."
---

# Lernplan erstellen

Macht aus dem, was in der **lernstandsakte** über ein Kind steht, einen kurzen, machbaren Lernplan: Was kann das Kind schon, woran arbeitet es als Nächstes, mit welchem Material, bis wann, und woran merkt es selbst, dass es das Ziel erreicht hat. Der Skill sucht zusammen, schlägt vor und gestaltet; welche Ziele gelten, entscheiden Lehrkraft und Kind.

Für alle Fächer, Schulformen und Jahrgänge. Ein Lernplan ist hier ein pädagogisches Arbeitsmittel (individueller Lernplan, Lernvertrag, Förderplan der Lehrkraft). Ist an der Schule ein verbindlicher Förderplan vorgeschrieben (z. B. bei gefährdeter Versetzung, Nachteilsausgleich, sonderpädagogischer Unterstützung), gilt dessen Vorlage und Verfahren; der Skill liefert dann die Zuarbeit `[prüfen: Vorgaben der Schule und des Landes zum Förderplan]`.

## 0. Vorher

- Profil über **schulprofil** lesen: Freigabe der Schulleitung, Ablage (`ablage.schuelerdaten`), Notenskala, Lehrplan, Layout, Vorlagen (`vorlagen` mit `art: lernplan` oder `art: foerderplan`), Lernplattform (`werkzeuge.lernplattform`).
- Ist die Freigabe für Schülerdaten „offen“ oder „nicht erteilt“: nur mit ausgedachten Testkürzeln oder mit dem, was die Lehrkraft ohne Namen nennt, arbeiten, nichts in die Akte schreiben und das kurz sagen.
- Nur Kürzel. Kommt ein Name vor, nicht übernehmen und nach dem Kürzel fragen.
- Lädt die Lehrkraft eine Schulvorlage hoch (Förderplan, Lernvertrag, ILE-Bogen), über schulprofil (Abschnitt 4) als Vorlage adaptieren und deren Felder und Sprache nutzen. Ohne Vorlage: neutraler Aufbau aus Abschnitt 4.

## 1. Auftrag klären

Kurz fragen, nur was fehlt:

- **Für wen:** ein Kind (Kürzel + Lerngruppe), mehrere Kinder oder die ganze Lerngruppe (Abschnitt 6).
- **Anlass:** nach einer Klausur, vor dem Zeugnis, nach Konferenz oder Elterngespräch, Wiederholung vor einer Prüfung, Förderstunde, Freiarbeit/Lernzeit, auf Wunsch des Kindes.
- **Fach und Thema**, falls nicht aus dem Anlass klar. Als Klassenleitung/Tutor auch fachübergreifend (Arbeitsverhalten, Lernorganisation).
- **Zeitraum:** Standard 3–4 Wochen bis zur Überprüfung; vor einer Prüfung bis zum Prüfungstermin.
- **Wo gelernt wird:** im Unterricht (Lernzeit, Wochenplan, Förderstunde), zu Hause, auf der Lernplattform. Wie viel Zeit je Woche realistisch ist (Standard 2 × 20 Minuten).
- **Fassungen:** für das Kind (Standard), für die Lehrkraft, für die Eltern.

## 2. Daten sammeln

1. Aus der **lernstandsakte** der Lerngruppe lesen (nur diese Bereiche):
   - **Leistungen:** Klausuren und Tests mit Stärke und Lücke (aus **pruefung-korrigieren**), mündliche Mitarbeit (aus **beobachtung-dokumentieren**), Zeugnisnoten (aus **zeugnis-vorbereiten**).
   - **Lernstand:** Belege aus **dokument-analyse** (Zeugnis, ILE-Bogen, Lernstandserhebung, Diagnosetest).
   - **Arbeits- und Sozialverhalten:** nur, soweit es für das Lernen zählt (z. B. Hausaufgaben, Arbeitsbeginn, Material dabei, Anwesenheit).
   - **Ziele und Maßnahmen, Vereinbarungen:** frühere Lernpläne, Vereinbarungen aus **elterngespraech-vorbereiten**, Konferenzbeschlüsse. Laufende Ziele weiterführen statt neue daneben zu stellen.
   - **Termine:** anstehende Klausuren, Überprüfungstermine.
2. Aus `gruppe.md`: **Schwerpunkte** der Gruppe und **Unterricht** (Stand der Einheit, nächste Klausur mit Inhalten). So passt der Plan zu dem, was als Nächstes im Unterricht kommt.
3. Verknüpfte Kürzel aus `lerngruppen/kuerzel-verknuepfung.md` nur einbeziehen, wenn der Plan fachübergreifend ist; Fachleistungen anderer Fächer nicht vermischen (lernstandsakte, Abschnitt 5).
4. Feiner wird der Plan mit der **Excel-Auswertung einer Korrektur** (Punkte je Teilaufgabe, `_pseudo.xlsx`) oder einem Diagnosebogen. Lädt die Lehrkraft so etwas hoch, über **dokument-analyse** einlesen und Teilaufgaben auf Kompetenzen bzw. Themen abbilden (Aufgabenübersicht der Klausur aus pruefung-korrigieren, Phase A1).
5. **Datenlage prüfen:** Gibt es zu Fach und Thema keinen Beleg (keine Klausur, kein Test, keine Beobachtung), nicht raten. Anbieten: (a) kurzer Diagnosetest oder Selbsteinschätzungsbogen über **pruefung-entwerfen**, (b) die Lehrkraft nennt zwei, drei Stichworte, (c) allgemeiner Plan zum kommenden Thema ohne individuelle Lücken, ausdrücklich so gekennzeichnet.
6. Offene Vorschläge aus der Akte nur als offen nennen, nie als Tatsache verwenden.

## 3. Vom Befund zum Ziel

1. **Stärken (zuerst):** zwei bis drei belegte Stärken aus der Akte, mit Quelle. Sie stehen im Plan vorn und werden, wo es passt, als Hebel genutzt („du erklärst gut → erkläre deiner Lernpartnerin …“).
2. **Ansatzpunkte:** höchstens drei Lücken, die (a) belegt sind, (b) für das Weiterlernen am wichtigsten sind (Voraussetzung für das nächste Thema vor Einzelheiten) und (c) im Zeitraum erreichbar sind. Mehr Lücken bleiben in der Lehrkraft-Fassung als „später“.
3. **Ziele** je Ansatzpunkt, als Kann-Satz aus Sicht des Kindes, konkret und überprüfbar: „Ich kann Gleichungen mit Klammern lösen und die Probe machen.“ Am Lehrplan bzw. an der Kompetenzsprache des Profils orientiert, ohne Fachjargon in der Kinderfassung. Ein Ziel zum Lernverhalten ist möglich, wenn die Akte es belegt („Ich fange in der Lernzeit nach spätestens 5 Minuten an.“).
4. **Niveau:** Bei Kindern, die schon sicher sind, Ziele zur Vertiefung oder Erweiterung statt zur Wiederholung (Förderung gilt in beide Richtungen).

## 4. Aufbau des Lernplans

Neutraler Standard (eine Seite je Kind, Vorlage der Schule hat Vorrang):

1. **Kopf:** «Vorname» (Serienbrief-Feld) bzw. Kürzel, Lerngruppe, Fach, Zeitraum, Überprüfung am.
2. **Das kannst du schon:** die Stärken in einem Satz je Punkt.
3. **Deine Ziele:** ein bis drei Kann-Sätze, nummeriert.
4. **So kommst du hin:** je Ziel zwei bis vier kleine Lernschritte in sinnvoller Reihenfolge (verstehen → üben → anwenden → prüfen), je Schritt: was tun, welches Material, wie lange, Pflicht oder Wahl. Hilfen benennen (Hilfekarte, Erklärvideo, Lösung zum Selbstkontrollieren, Lernpartner, Sprechstunde).
5. **Selbstcheck:** je Ziel eine kleine Aufgabe oder Frage, mit der das Kind prüft, ob es das kann, und eine Einschätzung zum Ankreuzen (sicher / fast / noch nicht), einmal zu Beginn und einmal am Ende.
6. **Unterstützung:** was die Lehrkraft tut (z. B. Rückmeldung zu Schritt 2, Förderstunde), was Eltern tun können (freundlich, machbar, ohne Fachaufgaben), wo das Kind Hilfe holt.
7. **Abschluss:** Überprüfung (Termin, Form: Kurztest, Gespräch, Lerntagebuch), Platz für Notizen, optional Unterschriften (Kind, Lehrkraft, Eltern), wenn die Schule Lernverträge nutzt.

**Kinderfassung:** Du-Form, kurze Sätze, ein Gedanke je Zeile; Primarstufe besonders kurz und mit Symbolen. Positive Formulierungen, keine Noten im Plan, keine Vergleiche mit anderen Kindern.

**Lehrkraft-Fassung:** zusätzlich Befund mit Quellen und Datum, ausgelassene Lücken („später“), Begründung der Auswahl, offene Fragen `[prüfen: …]`.

**Elternfassung** (auf Wunsch): Ziele, was zu Hause hilft, Termin der Überprüfung; einfache Sprache, bei Bedarf übersetzbar.

## 5. Material zuordnen

1. Zuerst im **materiallager** suchen (Thema, Jahrgang, Niveau; Wissensbasis der Einheit). Treffer mit Titel und Pfad in den Lernschritt schreiben. Vorhandenes vor neuem.
2. Fehlt passendes Material, anbieten, es über **material-gestalten** zu erstellen (Übungsblatt mit gestuften Hilfen und Lösungen zur Selbstkontrolle). Bei mehreren Kindern mit derselben Lücke ein gemeinsames Blatt statt vieler einzelner.
3. Schulbuchseiten und Online-Angebote nur, wenn die Lehrkraft sie nennt oder sie im Register stehen; keine erfundenen Seitenzahlen oder Links.
4. Nutzt die Schule eine Lernplattform (Profil `werkzeuge.lernplattform`), anbieten, die Lernschritte dort als Pfad anzulegen, sofern ein passender Adapter-Skill vorhanden ist (z. B. für Edumaps); sonst eine Linkliste.
5. Neues Material nach Bestätigung im materiallager ablegen (ohne Schülerdaten, ohne Kürzel im Material).

## 6. Lernpläne für eine ganze Lerngruppe

Für alle Kinder einen eigenen Plan von Hand zu schreiben, kostet zu viel Zeit. Deshalb in Bausteinen:

1. Aus den Akten aller Kürzel eine **Übersicht** bauen: Kürzel × Ansatzpunkt (aus Klausur-Lücken, Teilaufgaben, Beobachtungen), dazu „sicher/Erweiterung“.
2. **Bausteine** bilden: drei bis sechs Lernpakete zu den häufigsten Ansatzpunkten plus ein Erweiterungspaket. Jedes Paket hat Ziel, Lernschritte, Material, Selbstcheck.
3. Jedem Kind ein bis drei Pakete zuordnen (Vorschlag), Kinder ohne Beleg als „Datenlage dünn“ markieren und nicht zuordnen.
4. Die Lehrkraft prüft die Zuordnung in einer Tabelle (Spalte `Pakete (Lehrkraft)` zum Ändern) und kann einzelne Kinder individuell nachschärfen.
5. Daraus je Kind ein Plan per Serienbrief (Abschnitt 7); die Pakete gibt es zusätzlich als Stationen- oder Wochenplanmaterial für den Unterricht (über **unterricht-planen**, z. B. Förderstunde oder Lernzeit).

## 7. Ausgabe und Namen

- Format nach Wunsch: PDF oder Word im Layout des Profils (Gestaltung nach **material-gestalten**), für viele Kinder als **Serienbrief**: Tabelle (.xlsx) mit `Kuerzel`, Feldern für Stärken, Ziele, Lernschritte, Selbstcheck, Termin, plus Blatt `Klassenliste` und Word-Vorlage nach lernstandsakte, Abschnitt 6. Einzelpläne mit `«Vorname»` gehen über den Rückweg im **Pseudonymisierer**.
- Ablage in `ausgaben/lernplaene/`, Dateinamen ohne Namen: `2026-11-20_10-ma-e_M07_lernplan.pdf`, `2026-11-20_10-ma-e_lernplaene.xlsx`.
- Material ohne Kürzel, damit es wiederverwendbar ist.

## 8. Freigabe und Speichern

- Vor dem Schreiben die geplanten Einträge zeigen, danach kurz bestätigen („3 Lernpläne in 10-ma-e eingetragen“).
- Je Kind in die Kind-Akte, Bereich **Ziele und Maßnahmen**: `2026-11-20 | Vorschlag | Lernplan Mathe bis 2026-12-15: Ziel 1 Gleichungen mit Klammern lösen; Ziel 2 Textaufgaben in Gleichungen übersetzen | Quelle: lernplan-erstellen | offen`. Bespricht die Lehrkraft den Plan mit dem Kind und nimmt ihn an, Status auf `bestätigt` setzen (als neuer Eintrag mit Verweis, lernstandsakte Abschnitt 2).
- Bereich **Termine**: Überprüfung mit Datum. Nach Bestätigung auch als Aufgabe in `planung/aufgaben.md` für den **wochenplaner** („Lernpläne 10-ma-e überprüfen | bis 2026-12-15 | 30~ | lernplan-erstellen“).
- In `gruppe.md` höchstens einen Eintrag unter **Unterricht** („Lernpakete Gleichungen ab 20.11., Überprüfung 15.12.“), keine einzelnen Kinder.

## 9. Überprüfen und fortschreiben

Auslöser: Überprüfungstermin erreicht, neue Klausur, oder „Wie lief der Lernplan von M07?“

1. Den letzten Lernplan aus der Akte lesen, dazu neue Belege seit dem Start (Selbstcheck, Test, Beobachtungen).
2. Je Ziel: erreicht / teilweise / nicht erreicht, mit Beleg. Ohne Beleg nachfragen, nicht schätzen.
3. Nach Freigabe in die Akte: `… | Beleg | Lernplan Mathe: Ziel 1 erreicht (Kurztest 2026-12-15), Ziel 2 teilweise | Quelle: lernplan-erstellen, Überprüfung | bestätigt`.
4. Vorschlag für den nächsten Plan: erreichte Ziele abschließen, teilweise erreichte mit kleinerem Schritt oder anderer Hilfe weiterführen. Wiederholt nicht erreichte Ziele trotz Plan: anbieten, das im Elterngespräch (**elterngespraech-vorbereiten**) oder in der Konferenz (**zeugnis-vorbereiten**) aufzugreifen.

## 10. Weitergabe

- Liest: lernstandsakte, pruefung-korrigieren (Lücken, Teilaufgaben), beobachtung-dokumentieren, zeugnis-vorbereiten, elterngespraech-vorbereiten (Vereinbarungen), dokument-analyse (Diagnosen der Schule wie ILE-Bögen), materiallager.
- Gibt weiter: Ziele und Überprüfungen an die lernstandsakte; Materialwünsche an material-gestalten; Förderstunde oder Lernzeit an unterricht-planen; Überprüfungstermine an wochenplaner; Ergebnisse an elterngespraech-vorbereiten und zeugnis-vorbereiten.

## 11. Grundsätze

- Der Mensch entscheidet: Ziele sind Vorschläge, bis Lehrkraft und Kind sie annehmen.
- Wenig und machbar: höchstens drei Ziele, kleine Schritte, realistischer Zeitraum. Ein Plan, der erledigt wird, hilft mehr als ein vollständiger.
- Stärken zuerst, belegt statt vermutet, keine Etiketten, keine Diagnosen, keine Vermutungen über Gründe, Familie oder Gesundheit.
- Fair: gleicher Maßstab für alle Kinder einer Lerngruppe; Förderung auch für leistungsstarke Kinder.
- Rechtliches (verbindliche Förderpläne, Nachteilsausgleich, Versetzung) prüft die Lehrkraft `[prüfen: …]`.
- Datenschutz: nur Kürzel, Namen erst lokal per Serienbrief oder Pseudonymisierer, nur in den Bereichen der Akte, die der Plan braucht.
