---
name: "lernstandsakte"
description: "Pseudonymisierter Speicher von schulassistenz je Kind und Lerngruppe (Noten, Lernstände, Ziele, Vereinbarungen mit Quelle): lesen, nach Freigabe eintragen, Auskunft, Löschen, Serienbrief-Tabellen für Namen."
---

# Lernstandsakte

Die lernstandsakte ist das Gedächtnis des Plugins **schulassistenz**. Alle Aufgaben-Skills lesen hier, was sie über ein Kind oder eine Lerngruppe wissen müssen, und schreiben ihre freigegebenen Ergebnisse zurück. So fließt eine Klausurnote ohne erneutes Hochladen ins Elterngespräch, in die Konferenz und in die nächste Stundenplanung.

Vor jedem Zugriff: Profil über **schulprofil** lesen (Datenordner, Schülerdaten-Ordner, Löschfrist, Freigabe der Schulleitung). Ist die Freigabe für Schülerdaten „nicht erteilt“, nichts lesen oder schreiben und das kurz sagen.

## 1. Ablage

Ist im Profil `ablage.schuelerdaten` gesetzt (z. B. Schulserver), liegt alles unten Gezeigte dort statt im Datenordner (schulprofil, Abschnitt 1). Dort nur Text speichern, keine Scans; ist der Ort nicht erreichbar, nicht ersatzweise in den Datenordner schreiben.

```
<Datenordner bzw. Schülerdaten-Ordner>/
  lerngruppen/
    <lerngruppe>/            z. B. 8b-physik, 10e-mathe
      gruppe.md              Lerngruppen-Akte
      <kuerzel>.md           Kind-Akte, z. B. KV001.md oder S07.md
    kuerzel-verknuepfung.md  welche Kürzel aus verschiedenen Lerngruppen zum selben Kind gehören
  ausgaben/                  fertige Entwürfe und Serienbrief-Tabellen
  archiv/<schuljahr>/        abgeschlossene Lerngruppen bis zur Löschfrist
```

Ein Kind in mehreren Lerngruppen derselben Lehrkraft hat je Gruppe eine eigene Akte. Das Kürzel kann je Gruppe gleich oder verschieden sein (z. B. M07 in 10-ma-e und N05 in 10-nawi-e). Keine Namen in Datei- oder Ordnernamen.

### Kürzel-Verknüpfung

Welche Kürzel zum selben Kind gehören, steht in `lerngruppen/kuerzel-verknuepfung.md`, eine Zeile je Kind:

```markdown
- P03 | M07 (10-ma-e), N05 (10-nawi-e), I12 (10d-inf) | bestätigt 2026-11-15
```

- Die Datei legt die Lehrkraft auf der Startseite an („Kürzel verknüpfen“). Die Seite vergleicht dafür lokal die Namen in den Kürzellisten; in der Datei stehen nur Kürzel. Claude kann die Zuordnung nicht selbst herstellen, weil es keine Namen sieht, und rät sie nie (auch nicht aus ähnlichen Leistungen oder Notizen).
- Nennt die Lehrkraft eine Zuordnung im Gespräch („M07 und N05 sind dasselbe Kind“), die Zeile nach Bestätigung ergänzen: vorhandene Kind-Nummer weiterführen, sonst die nächste freie `P..`. Zwei Kürzel aus derselben Lerngruppe nie verknüpfen.
- Die Kind-Nummer `P..` ist nur ein Ordnungsschlüssel und kein Kürzel; sie erscheint nicht in Akten oder Ausgaben.

## 2. Aufbau einer Kind-Akte

```markdown
---
kuerzel: KV001
lerngruppe: 8b-physik
schuljahr: 2026/27
angelegt: 2026-11-14
loeschen_ab: 2028-07-31
---
## Leistungen
- 2026-11-03 | Beleg | Klausur 2: 9/15 BE, Note 3; Schwerpunkt Einheiten umrechnen | Quelle: pruefung-korrigieren, Klausur 2 | bestätigt
## Lernstand
## Arbeits- und Sozialverhalten
- 2026-10-20 | Beobachtung | arbeitet in Experimentierphasen zuverlässig mit | Quelle: Lehrkraft | bestätigt
## Ziele und Maßnahmen
- 2026-11-10 | Vorschlag | Ziel: Formeln sicher umstellen bis Halbjahr | Quelle: elterngespraech-vorbereiten | offen
## Vereinbarungen
## Termine
- 2027-01-15 | Beleg | Überprüfung der Vereinbarungen | Quelle: Elterngespräch 2026-11-10 | bestätigt
- 2026-11-18 | Beleg | Eltern über Fehlzeiten informiert (unentschuldigt bis dahin: 12 Std.) | Quelle: Lehrkraft | bestätigt
```

Jeder Eintrag ist eine Zeile: `Datum | Art | Inhalt | Quelle | Status`.

- **Art:** `Beleg` (aus einem Dokument), `Beobachtung` (von der Lehrkraft notiert), `Vorschlag` (von einem Skill abgeleitet).
- **Status:** `bestätigt` oder `offen`. Ein Vorschlag bleibt `offen`, bis die Lehrkraft ihn annimmt. Skills behandeln offene Vorschläge nie wie Tatsachen und kennzeichnen sie, wenn sie sie zeigen.
- **Korrigiert oder gestrichen:** Die Noteneinsicht der Startseite setzt den Status alter Einträge auf `ersetzt <Datum>` bzw. `gestrichen <Datum>[: Grund]`. Eine Korrektur steht als neue Zeile direkt darunter, mit dem Datum des alten Eintrags und `Quelle: Noteneinsicht, Korrektur <Datum>, ersetzt Eintrag vom <Datum> (<alter Wert>)`. Einträge mit `ersetzt` oder `gestrichen` zählen nicht mehr (keine Noten, keine Auswertung), bleiben aber als Nachweis stehen; nicht löschen.
- Neueste Einträge unten im Bereich. Bestehende Einträge nicht umschreiben; Korrekturen als neuer Eintrag mit Verweis („ersetzt Eintrag vom 03.11.“), außer die Lehrkraft will einen Fehler direkt löschen.

## 3. Lerngruppen-Akte (gruppe.md)

Kopf: Lerngruppe, Fach, Jahrgang, Schuljahr, Liste der Kürzel, Löschdatum. Bereiche:

- **Leistungen:** Notenspiegel je Klausur, Durchschnitt je Aufgabe
- **Schwerpunkte:** was der Gruppe insgesamt schwerfällt (z. B. aus pruefung-korrigieren); planende Skills (unterricht-planen, einheit-planen) lesen diesen Bereich für Wiederholung und Differenzierung
- **Unterricht:** Stand der Einheit, nächste Klausur mit Termin und Inhalten
- **Termine:** Elternabend, Sprechtag, Konferenzen

Keine Einträge zu einzelnen Kindern in gruppe.md.

## 4. Schreiben

Nur drei Wege führen in die Akte:

1. **dokument-analyse** übergibt freigegebene Belege.
2. **Ein Aufgaben-Skill** übergibt ein von der Lehrkraft freigegebenes Ergebnis (z. B. Vereinbarungen aus dem Elterngespräch, Notenliste aus der Korrektur).
3. **Die Lehrkraft** diktiert eine Beobachtung („Notiz zu KV001: hat heute die Gruppe gut angeleitet“).

Vor dem Schreiben die geplanten Einträge zeigen, nach dem Schreiben kurz bestätigen („3 Einträge in KV001 ergänzt“). Fehlt die Akte, anlegen, mit Löschdatum aus dem Profil (Schuljahresende plus Löschfrist). Nichts schreiben, was dokument-analyse nicht übernehmen dürfte (Namen, Gesundheit, Diagnosen, Kinderschutz).

## 5. Lesen

- Ein Skill liest nur die Bereiche, die er braucht (Elternbrief zur Klassenfahrt: keine Noten; Elterngespräch: Leistungen, Lernstand, ASV, Ziele, Vereinbarungen).
- **Über Lerngruppen hinweg:** Geht es um ein Kind (nicht um eine Fachnote), zuerst in `kuerzel-verknuepfung.md` nachsehen und die Akten aller verknüpften Kürzel mitlesen. Beim Zeigen jeden Eintrag mit Kürzel und Lerngruppe kennzeichnen („N05, 10-nawi-e: …“) und Fächer nicht vermischen: Noten und mündliche Mitarbeit gelten je Fach; fachübergreifend zusammenfassen nur Arbeits- und Sozialverhalten, Ziele, Vereinbarungen und Termine. Geschrieben wird immer in die Akte der Lerngruppe, aus der der Eintrag stammt.
- Fehlt die Datei oder ein Kürzel darin, nur die genannte Akte lesen und bei Bedarf kurz darauf hinweisen, dass sich weitere Akten über „Kürzel verknüpfen“ auf der Startseite einbeziehen lassen.
- Beim Zeigen immer Quelle und Datum mitnennen, offene Vorschläge als solche markieren.
- Widersprüche (zwei unterschiedliche Noten für dieselbe Klausur) nicht auflösen, sondern der Lehrkraft zeigen.
- Ist eine Akte veraltet (letzter Eintrag älter als ein halbes Jahr), das beim Lesen erwähnen.

## 6. Klarnamen per Serienbrief

Die KI kennt nur Kürzel. Namen kommen am Ende auf dem Gerät der Lehrkraft ins Dokument.

Für einzelne Texte (Gesprächsnotiz, Bemerkung) geht es ohne Serienbrief: Die Lehrkraft zieht die Datei mit Kürzeln in den Reiter „Rückweg“ des lokalen **Pseudonymisierers** (`schulassistenz/werkzeuge/pseudonymisierer/`), der die Namen aus ihrer Kürzelliste einsetzt. Darauf hinweisen, wenn ein Ergebnis mit Kürzeln ausgegeben wird.

Braucht ein Ergebnis Namen (Elternbriefe, Gesprächsnotizen, Zeugnisbemerkungen, Notenlisten), liefert der Skill zusätzlich zum Entwurf eine **Serienbrief-Tabelle** nach `ausgaben/`:

- Format: Excel (.xlsx), eine Zeile je Kind, erste Spalte `Kuerzel`, dann die Textfelder (z. B. `Bemerkung`, `Staerken`, `Vereinbarung`). In Texten steht der Platzhalter `«Vorname»` statt eines Namens; Pronomen neutral oder so, wie die Lehrkraft es vorgibt.
- Ein zweites Blatt `Klassenliste` mit den Spalten `Kuerzel | Vorname | Nachname`, leer, mit dem Hinweis: „Hier deine Klassenliste einfügen. Nur lokal, nicht hochladen.“
- Im ersten Blatt holen Formeln die Namen aus der Klassenliste (wie in pruefung-korrigieren: `=IFERROR(_xlfn.XLOOKUP(A2,Klassenliste!A:A,Klassenliste!B:B),"– Kürzel fehlt –")`).
- Dazu eine Word-Vorlage (.docx) im Layout des Profils mit Seriendruckfeldern (`«Vorname»`, `«Bemerkung»` …), die auf diese Tabelle verweist.
- Kurzanleitung für die Lehrkraft: Tabelle öffnen, Klassenliste einfügen, speichern; Word-Vorlage öffnen, „Sendungen → Fertigstellen und zusammenführen“.

Die ausgefüllte Klassenliste nie anfordern oder verarbeiten.

## 7. Auskunft

Auf Wunsch („Was ist zu KV001 gespeichert?“) alle Einträge der Kind-Akte vollständig zeigen, mit Quellen, dazu die Akten aller verknüpften Kürzel (je Lerngruppe getrennt). Das unterstützt Auskunftsanfragen von Eltern. Die Lehrkraft setzt den Namen selbst ein.

## 8. Schuljahreswechsel und Löschen

Zum Schuljahresende (oder auf Wunsch) eine Liste zeigen:

- Lerngruppen, die enden → nach `archiv/<schuljahr>/` verschieben?
- Akten, deren `loeschen_ab` erreicht ist → löschen?
- Offene Vorschläge, die nie bestätigt wurden → löschen?
- Zeilen in `kuerzel-verknuepfung.md`, deren Akten gelöscht oder archiviert werden → mit entfernen bzw. mit archivieren?

Nichts ohne Bestätigung verschieben oder löschen. Nach dem Löschen bestätigen, was entfernt wurde.

Sicherungen: Die Startseite legt Sicherungen in `sicherungen/` im Schülerdaten-Ordner ab und nimmt Abgelaufenes nicht mehr auf. Nach dem Löschen abgelaufener Akten daran erinnern, auf der Startseite eine neue Sicherung anzulegen und ältere Sicherungen (dort „Ältere löschen“, auf dem USB-Stick von Hand) zu löschen, damit keine Kopie über die Löschfrist hinaus bleibt.

## 9. Grundsätze

- Der Mensch entscheidet: Nur Freigegebenes wird gültig; Vorschläge bleiben offen.
- Sachliche, stärkenorientierte Sprache, keine Etiketten über Kinder.
- So wenig wie nötig: Was kein Skill braucht, kommt nicht in die Akte.