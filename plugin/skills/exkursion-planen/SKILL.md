---
name: "exkursion-planen"
description: "Plant Exkursionen, Unterrichtsgänge, Wandertage und Schulfahrten jedes Fachs (schulassistenz): Lernort und Programm recherchieren, Verkehrsanbindung vergleichen, Kosten kalkulieren, Antrag an die Schulleitung, Buchungsanfragen, Elternbrief mit Einverständnis, Rücklauf- und Geldliste, Notfallplan, Vor- und Nachbereitung, Abrechnung. Nur Kürzel, bucht und verschickt nichts."
---

# Exkursion planen

Von der ersten Idee („mit der 10b ins Schülerlabor“) bis zur Abrechnung danach. Der Skill recherchiert, rechnet und schreibt alle Entwürfe; die Lehrkraft prüft, bucht, unterschreibt und verschickt.

Gilt für jede Art von Lerngang außerhalb der Schule: Unterrichtsgang (wenige Stunden, nah), Exkursion (Fach, halber oder ganzer Tag), Wandertag, Schulfahrt mit Übernachtung. Bei mehrtägigen Fahrten kommen Unterkunft, Programm je Tag und eine größere Kostenrechnung dazu (Abschnitt 4 und 5).

## 0. Vorher

- Profil über **schulprofil** lesen: Bundesland, Schulform, Briefkopf und Layout, Ablage, Freigabe der Schulleitung, Vorlagen (Antrag Schulfahrt/Unterrichtsgang, Elternbrief, Einverständniserklärung, Abrechnung) und `regeln.exkursionen` (Aufbau unten).
- **Rechtliches nie erfinden.** Genehmigungsweg, Antragsfrist, Zahl der Begleitpersonen, Kostengrenzen, Versicherung, Reisekosten der Lehrkräfte, Regeln zu Bade- oder Sportaktivitäten sind nach Land und Schule verschieden (Erlass des Landes zu Schulfahrten bzw. Wandertagen, Schulprogramm, Fahrtenkonzept, Konferenzbeschlüsse). Steht nichts im Profil: die aktuelle Fassung des Landeserlasses im Netz suchen, mit Quelle und Abrufdatum zusammenfassen, als `[prüfen]` kennzeichnen und anbieten, die Regeln nach Bestätigung ins Profil zu übernehmen. Was die Schule intern regelt (z. B. Antragsfrist), bei der Lehrkraft erfragen.
- Ist die Freigabe für Schülerdaten „offen“ oder „nicht erteilt“: Planung, Recherche, Antrag und Elternbrief gehen trotzdem (keine Schülerdaten). Rücklauf- und Geldliste dann nur als leere Vorlage ohne Kürzel.

Felder in `profil.md` (alle optional, leer = nachfragen bzw. Landesregeln recherchieren):

```yaml
regeln:
  exkursionen:
    erlass: <Titel und Link des Landeserlasses zu Schulfahrten/Wandertagen>
    genehmigung: <wer genehmigt, z. B. Schulleitung; Formular unter vorlagen>
    antrag_frist_wochen: <z. B. 4>
    begleitung: <Schlüssel, z. B. ab 20 Kindern zwei Begleitpersonen, gemischt>
    kostengrenze: <z. B. je Fahrt oder je Schuljahr, laut Fahrtenkonzept>
    zahlweg: <z. B. bar im Umschlag, Überweisung auf Schulkonto, Schulgeldsystem>
    zuschuss: <z. B. Förderverein, Bildung und Teilhabe; Ansprechperson als Rolle>
    reisekosten_lehrkraft: <Antrag/Erstattung nach Landesrecht, Formular>
    notfall: <Notfallnummern der Schule, Erste-Hilfe-Tasche, Ablauf>
    startort: <Adresse der Schule oder Haltestelle für die Verbindungssuche>
```

## 1. Eckdaten klären (eine Runde)

Nur fragen, was nicht schon im Auftrag, im Profil oder in der Gruppenakte steht:

- **Anlass und Lernziel:** Fach, Thema der Einheit, Lehrplanbezug (aus **einheit-planen** bzw. `gruppe.md`, wenn vorhanden). Ohne pädagogisches Ziel wird kein Antrag genehmigt, deshalb immer festhalten.
- **Ziel:** konkreter Lernort oder nur eine Idee („irgendwas zu Wasserqualität im Umkreis von 30 km“). Bei einer Idee 3 bis 5 Vorschläge recherchieren (Abschnitt 2).
- **Lerngruppe und Größe**, Jahrgang; Begleitpersonen (als Rolle, z. B. „Kollegin Bio“, „Referendar“, „Elternteil“).
- **Termin:** Wunschdatum oder Zeitraum. Gegen Stundenplan, Schulkalender und `planung/aufgaben.md` prüfen: Klausuren, Konferenzen, Ferien, Feiertage, Praktika, andere Fahrten derselben Gruppe. Kollisionen nennen.
- **Budget** je Kind, falls schon bekannt.
- **Organisatorisches ohne Personenbezug:** Wird ein barrierefreier Zugang gebraucht? Gibt es Kinder mit eigenem Schülerticket (spart Fahrkosten)? Nie nach Diagnosen, Allergien oder Medikamenten einzelner Kinder fragen; das erfragt die Schule auf Papier (Abschnitt 6).

## 2. Lernort und Programm recherchieren

Per Websuche, für jeden Vorschlag:

- Name, Adresse, Website, Ansprechstelle für Gruppen (Rolle oder Funktionsadresse von der Website)
- Gruppenangebote passend zu Jahrgang und Thema (Führung, Workshop, Labortag, Rallye), Dauer, Gruppengröße, Mindestalter
- Öffnungszeiten am Wunschtermin, Schließtage, Buchungsvorlauf, Anmeldeweg
- Preise für Schülergruppen und Begleitpersonen (oft frei), Storno
- Barrierefreiheit, Pausenraum oder Picknickplatz, Toiletten, Garderobe, Wetterabhängigkeit
- Bezug zum Lernziel: was die Gruppe dort konkret tut oder sieht

Jede Angabe mit Quelle (Link) und Abrufdatum. Preise und Zeiten immer `[prüfen]`, weil sich Webseiten ändern. Nichts ergänzen, was nicht auf einer Quelle steht. Ergebnis als Vergleichstabelle mit Empfehlung.

Für Lernorte, die in der Region bekannt und wiederholt besucht werden, die Recherche im **materiallager** als Vorlage ablegen (Abschnitt 9), damit sie nächstes Jahr nicht neu nötig ist.

## 3. Verkehrsanbindung

Vom Startort (Profil `startort`, sonst Adresse der Schule erfragen) zum Lernort, Hin- und Rückweg. Mögliche Varianten:

1. **Zu Fuß oder mit dem Rad:** Strecke, Zeit, Gefahrenstellen (große Kreuzungen, Strecke ohne Radweg) laut Karte.
2. **Öffentlicher Nahverkehr und Bahn:** Verbindungen über die Fahrplanauskunft des Verkehrsverbunds bzw. der Bahn suchen (im Browser, wenn verfügbar). Abfahrt, Umstiege mit Umstiegszeit, Fußweg von der Haltestelle, Fahrzeit, letzte sinnvolle Rückfahrt und eine Ersatzverbindung. Für große Gruppen: Gruppenreservierung bzw. Gruppenanmeldung beim Verkehrsunternehmen nötig? Gruppen- oder Schultarife des Verbunds, vorhandene Schüler- oder Deutschlandtickets. Fahrplandaten immer `[prüfen]` und den Link zur Auskunft mitgeben, weil Baustellen und Fahrplanwechsel sie ändern.
3. **Reisebus:** 2 bis 3 Busunternehmen der Region aus dem Netz heraussuchen; Anfrage als Mail-Entwurf (Datum, Abfahrt/Rückkehr, Personenzahl, Ziel, Wartezeit oder Leerfahrt, Bitte um Festpreis inkl. Steuern). Preise nur aus Angeboten, nie geschätzt; zur Orientierung höchstens eine Spanne mit Quelle.
4. **Mischformen:** z. B. Bahn hin, Bus zurück, oder Shuttle des Lernorts.

Ergebnis als Tabelle: Variante · Abfahrt/Ankunft · Fahrzeit · Umstiege · Kosten je Kind · Aufwand (Reservierung, Anfrage) · Risiko (Anschluss knapp, Wetter). Mit Empfehlung und Zeitplan des Tages (Treffpunkt, Abfahrt, Ankunft, Programm, Pause, Rückfahrt, Ankunft an der Schule). Puffer einplanen: mindestens 10 Minuten je Umstieg mit großer Gruppe, 15 bis 30 Minuten am Ende.

## 4. Kosten und Finanzierung

Kalkulation als Excel (.xlsx) mit Formeln, Summen per Code prüfen:

- Fahrt (je Variante), Eintritt bzw. Programm, Material, ggf. Unterkunft und Verpflegung (mehrtägig), Rücklage für Unvorhergesehenes (nach Profil, sonst fragen)
- Begleitpersonen getrennt: Was zahlt der Lernort, was trägt die Schule, was läuft über Reisekosten nach Landesrecht (`reisekosten_lehrkraft`)? Nicht auf die Kinder umlegen, wenn Profil oder Erlass das ausschließen.
- **Betrag je Kind**, gerundet nach Absprache, und Abgleich mit `kostengrenze`
- Zuschüsse (Förderverein, Bildung und Teilhabe, Fördertöpfe des Lernorts): nur als Möglichkeit nennen, mit Ansprechstelle als Rolle

Bei mehrtägigen Fahrten zusätzlich Anzahlungen, Stornobedingungen und Zahlungsfristen in eine Zeitleiste.

## 5. Genehmigung und Organisation

Alle Texte als Entwurf, im Layout und Briefkopf des Profils.

1. **Antrag an die Schulleitung:** Vorlage der Schule aus dem Profil, sonst neutraler Antrag: Art, Lerngruppe, Datum und Uhrzeit, Ziel, pädagogisches Ziel und Lehrplanbezug, Programm, Verkehrsmittel, Begleitung (Rollen), Kosten je Kind, ausfallender Unterricht der Lehrkraft und der Begleitpersonen, Vorschlag zur Vertretung bzw. Aufgaben für Lerngruppen, die ausfallen. Antragsfrist aus dem Profil in die Aufgabenliste.
2. **Reisekosten bzw. Dienstreise** der Lehrkräfte nach Landesregel (`reisekosten_lehrkraft`); Formular über **verwaltungsassistent** (Abschnitt 4) vorbefüllen.
3. **Buchungsanfragen** an Lernort und ggf. Busunternehmen als Mail-Entwürfe; über **postfach-assistent** weiterzubearbeiten, wenn die Antworten kommen. Nichts selbst buchen oder abschicken.
4. **Info ans Kollegium** (Fachkolleginnen, Klassenleitung, Vertretungsplanung): kurze Mail mit Datum, Gruppe, ausfallenden Stunden.
5. **Notfallplan** (eine Seite für die Tasche): Zeitplan, Adressen, Treffpunkte, Telefonnummern der Schule und des Lernorts, Ablauf bei Unfall, verlorenem Kind, Ausfall der Verbindung; Erste-Hilfe-Tasche; Hinweis, die Notfallkontakte und gesundheitlichen Hinweise der Eltern (Papier) mitzunehmen. Keine Namen und keine Gesundheitsdaten in diesem Dokument.
6. **Checkliste am Tag** (Vorabend, Abfahrt, vor Ort, Rückkehr) und Schlechtwetter-Alternative.
7. **Mehrtägig zusätzlich:** Unterkunftsrecherche wie Abschnitt 2, Zimmerbelegung nur mit Kürzeln, Programm je Tag, Hausordnung, Elternabend zur Fahrt (Stichpunkte und Folien über **material-gestalten**).

## 6. Elternbrief und Einverständnis

Im Briefkopf des Profils, kurz und in klarer Sprache. Bei volljährigen Schülerinnen und Schülern an diese selbst.

**Brief:** Anlass und Lernziel in zwei Sätzen, Datum, Treffpunkt und Uhrzeit, voraussichtliche Rückkehr (Ort und Uhrzeit), Verkehrsmittel, Programm, Kosten je Kind mit Zahlweg und Frist, Hinweis auf Zuschüsse („Sprechen Sie uns vertraulich an“), Kleidung und Verpflegung, was mitzubringen ist (z. B. Schülerticket), Erreichbarkeit am Tag (Diensttelefon der Schule, keine private Nummer ungefragt), Rückgabefrist des Abschnitts.

**Abschnitt zum Zurückgeben** (bzw. Vorlage der Schule aus dem Profil):
- Einverständnis zur Teilnahme
- Notfallkontakt am Tag
- freiwillige Hinweise, die die Begleitung kennen sollte (z. B. Allergien, Medikamente) – nur auf Papier, bleibt bei der Lehrkraft, wird nie hochgeladen oder in die Akte übernommen
- falls vorgesehen: Erlaubnis, nach der Rückkehr allein nach Hause zu gehen bzw. direkt vom Zielort entlassen zu werden (nur wenn Erlass und Schule das zulassen)
- Fotos: getrennt und freiwillig, nach der Einwilligungsvorlage der Schule; ohne Vorlage nur darauf hinweisen
- Unterschrift, Datum

Namen nur als Serienbrief-Feld (`«Vorname»`, `«Nachname»`, `«Anrede»`) mit der Serienbrief-Tabelle nach **lernstandsakte**, Abschnitt 6, oder als Brief ohne Namen zum Verteilen. Auf Wunsch eine Fassung in einfacher Sprache oder Übersetzungen mit dem Hinweis, dass die deutsche Fassung gilt.

## 7. Rücklauf und Geld

An **verwaltungsassistent**, Abschnitt 3, übergeben bzw. nach dessen Regeln erstellen:

- **Rücklaufliste:** Kürzel · Einverständnis (Datum) · Notfallkontakt abgegeben (ja/nein, nie der Inhalt) · Foto-Einwilligung (ja/nein/keine Angabe) · fehlt noch
- **Geldliste:** Kürzel · Betrag · bezahlt am · offen · Zuschuss (nur „ja“, kein Grund); Summen per Formel, keine Kontodaten
- **Erinnerung** als Entwurf für alle, bei denen etwas fehlt, ohne Bloßstellen einzelner Kinder vor der Klasse

Listen nach `ausgaben/` (Schülerdaten-Ort laut Profil). Für Kinder, die nicht mitfahren: Hinweis auf Betreuung bzw. Unterricht in einer anderen Lerngruppe nach Schulregel, ohne Gründe zu erfassen.

## 8. Unterricht vor und nach der Exkursion

- **Vorbereitung:** Einstiegsstunde, Forschungs- oder Beobachtungsauftrag, Rallye, Bogen für vor Ort über **unterricht-planen** und **material-gestalten**; in die Einheit über **einheit-planen** einordnen.
- **Nachbereitung:** Auswertungsstunde, Sicherung, ggf. Bewertungsanteil (Portfolio, Bericht) nach Profil; Beobachtungen über **beobachtung-dokumentieren**, nicht in diesem Skill.
- **Abrechnung:** Einnahmen und Ausgaben gegenüberstellen, Restbetrag oder Nachforderung je Kind, Abrechnungsformular der Schule über **verwaltungsassistent** vorbefüllen; Belege sammelt die Lehrkraft.
- **Rückblick** in drei Zeilen (was lief gut, was ändern, lohnt sich der Ort wieder) für die Vorlage in Abschnitt 9.

## 9. Ablage und Termine

- Planungsmappe ohne Schülerdaten: `<Datenordner>/planung/exkursionen/<JJJJ-MM-TT>-<ziel>/` mit `plan.md` (Eckdaten, Zeitplan, Verbindungen, Kosten, Status je Schritt, Quellen), Kalkulation, Antrag, Elternbrief, Notfallplan, Anfragen. Ohne Ablage alles als Dateien im Gespräch.
- Listen mit Kürzeln nach `ausgaben/` (Abschnitt 7).
- **Fristen** nach Bestätigung in `planung/aufgaben.md` für den **wochenplaner**: Antrag einreichen, Buchung bestätigen, Elternbrief austeilen, Rücklauf- und Zahlungsfrist, Erinnerung, Fahrkarten bzw. Reservierung, Vorabend-Checkliste, Abrechnung. Den Termin selbst als Hinweis „in den Schulkalender eintragen“.
- Nach der Fahrt die Mappe (ohne Listen) auf Wunsch im **materiallager** als Vorlage für den Lernort ablegen.

Am Ende jeder Sitzung kurz: was erstellt wurde, was die Lehrkraft jetzt tun muss (prüfen, Antrag abgeben, Anfrage abschicken, Briefe drucken), offene `[prüfen]`- und `[ausfüllen]`-Stellen, nächste Frist.

## 10. Grundsätze

- Der Mensch entscheidet: Der Skill bucht nichts, verschickt nichts, zahlt nichts und reicht nichts ein. Alles sind Entwürfe.
- Recherche mit Quelle und Abrufdatum; Preise, Zeiten und Fahrpläne immer zum Prüfen markiert.
- Regeln aus Profil und Landeserlass, nie aus Annahmen. Unklare Rechtsfragen (Aufsicht, Haftung, Schwimmen, Übernachtung) an die Schulleitung verweisen.
- So wenig Daten wie nötig: Kinder nur als Kürzel, keine Gesundheitsdaten, keine Gründe für Nichtteilnahme oder Zuschüsse.
- Rechnen per Code, Ergebnisse nachprüfbar (Formeln in Excel).
