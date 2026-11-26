---
name: "unterricht-planen"
description: "Plant Stunden und Doppelstunden jedes Fachs und Jahrgangs (schulassistenz) tiefenstrukturorientiert und lehrplankonform: Lernziel, Alltagskontext, Kernaufgabe, Methoden, Verlaufsplan als HTML-Planungsübersicht."
---

# Unterrichtsplanung nach Tiefenstrukturen

Wird genutzt, wenn eine Stunde, Doppelstunde oder Einheit geplant, überarbeitet, begründet oder als Unterrichtsentwurf ausgearbeitet werden soll – für **alle Fächer und alle Jahrgänge** von der Primarstufe bis zum Abitur, auch für Förderschwerpunkte und inklusive Lerngruppen. Sprache: Deutsch. Rahmen: Lehrplan, schuleigener Arbeitsplan und Erlasse des Landes aus dem Schulprofil.

## Vorher: Profil, Lerngruppe, Stundenplan

Teil von **schulassistenz**. Was die anderen Bausteine schon wissen, wird genutzt und nicht erfragt:

- **Profil** über **schulprofil**: Bundesland, Schulform, Lehrplan, Operatorenliste, Layout (Fachfarbe für die Übersicht), Ablage, Werkzeuge (Lernplattform, Schul-KI).
- **Lerngruppe** aus `lerngruppen/<gruppe>/gruppe.md`: Fach, Jahrgang, Niveau, Größe. Aus den Bereichen **Schwerpunkte** (z. B. aus **pruefung-korrigieren**: „Logarithmus anwenden 38 %“) und **Unterricht** (Stand der Einheit) ergeben sich Vorwissen, Wiederholungsbedarf und Differenzierung. Kind-Akten nur lesen, wenn die Lehrkraft gezielt fördern will (z. B. „Hilfen für die Kürzel mit Lücke Bruchrechnung“); dann nur Kürzel nennen, keine Einzelheiten aus den Akten ins Material.
- **Einheit:** Gehört die Stunde zu einer Einheit aus **einheit-planen**, deren Stoffverteilungsplan lesen (Leitfrage, Stellung, Material, Klausurinhalte) und daran anschließen.
- **Materiallager:** Vor dem Neuerstellen über **materiallager** nach eigenem Material zum Thema suchen und die Wissensbasis der Einheit (`quellen.md`) lesen; Treffer als Ausgangspunkt nutzen. Recherchierte Fundstellen nach Bestätigung in `quellen.md` ergänzen.
- **Datum und Dauer** aus `planung/stundenplan.md` (Startseite), wenn ein Datum oder „nächste Stunde“ genannt ist: Einzel- oder Doppelstunde, Raum, entfällt.
- Freigabe der Schulleitung „offen“ oder „nicht erteilt“: Planung geht trotzdem, nur ohne Akten.

## Ausgabeumfang: gründlich denken, knapp schreiben

Alle Schritte, Prüfungen und Checks dieses Skills laufen **bei jeder Planung intern vollständig** ab. Wie viel davon im Output erscheint, richtet sich nach dem Anlass:

| Anlass | Ausgabe |
|---|---|
| **Alltagsstunde (Standard)** – keine besonderen Angaben | **A) Alltagsplanung**: kompakt, ca. eine Bildschirmseite. Nur Ergebnisse, keine Begründungen, keine Check-Tabellen. |
| Nutzer sagt „ausführlich“, „mit Begründung“, „erklär mir die Planung“ o. Ä. | **B) Ausführliche Stundenplanung** |
| Unterrichtsbesuch, Lehrprobe, Prüfung, Seminar, „Unterrichtsentwurf“ | **C) Ausführlicher Unterrichtsentwurf** |
| Mehrere Stunden / Reihe | **D) Einheit** |
| Nur Ideen gesucht („hast du eine Idee für …“) | **E) Ideenskizze** |
| Nutzer lädt eigenes Material zur Prüfung hoch | **F) Analyse vorhandener Materialien** |

Regeln für die Alltagsplanung:
- Der Nutzer erkennt Sinn und Begründung beim Lesen von Verlaufsplan und Material selbst – **nichts erklären, was der Plan schon zeigt**.
- Tiefenstruktur-Check und Qualitätscheck werden intern durchgeführt; Schwächen werden **direkt im Plan behoben**, nicht beschrieben. Nur was der Nutzer wissen muss (Sicherheit, ungeprüfte Fakten, bewusste Kompromisse), erscheint als **höchstens 3 kurze Hinweise**.
- Recherche Stufe 1 läuft still mit; Quellen nur als eine Zeile, wenn tatsächlich recherchiert wurde.
- Wird eine weniger bekannte Methode eingesetzt, genügt ein Halbsatz zur Durchführung direkt in der Verlaufsplan-Zelle.
- Am Ende genau ein Satz als Angebot, z. B.: „Auf Wunsch: Begründung, Material oder ausführliche Fassung.“
- Keine Rückfrage, wenn sich die Angaben aus dem Kontext sinnvoll erschließen lassen; Annahmen in der Kopfzeile kurz nennen.

## Leitidee

Unterricht hat zwei Ebenen (Kunter & Trautwein 2013; Trautwein, Sliwka & Dehmel 2018):

- **Sichtstrukturen**: Methoden, Sozialformen, Medien, Organisationsformen – was man von außen sieht.
- **Tiefenstrukturen**: die Qualität der Lehr-Lern-Prozesse – wie intensiv sich die Lernenden gedanklich mit dem Inhalt auseinandersetzen und wie gut sie dabei begleitet werden.

Für den Lernerfolg entscheiden die Tiefenstrukturen. Methodenvielfalt ist erwünscht, aber nie Selbstzweck (Mattes: Methoden sind „weder gut noch schlecht“, sondern passend oder unpassend). Daher die feste Reihenfolge:

> **Erst Lehrplanbezug, Ziel und Denkprozess, dann Kontext, dann Kernaufgabe – zuletzt die Methode.** Jede Methode braucht eine Funktion für das Denken der Lernenden.

**Offener Methodenpool:** Alle in diesem Skill genannten Methoden, Formate, Kontexte und Beispiele sind ein **Anregungspool – keine Pflichtliste und nicht abschließend**. Gewählt wird immer, was zu Ziel, Lerngruppe und Zeit am besten passt, auch wenn es hier nicht steht (eigenes Fach- und Methodenwissen, Fachdidaktik, Recherchefunde, Ideen aus früheren Gesprächen, Material des Nutzers). Auswahl in dieser Reihenfolge:
1. **Funktion** für den Denkprozess an genau diesem Inhalt,
2. **Passung** zu Fach, Alter und Lerngruppe,
3. **Aufwand** für die Lehrkraft – bei gleicher Wirkung gewinnt die Methode mit weniger Vorbereitung,
4. **Abwechslung** über die Einheit.
Bewährte Lieblingsformate (z. B. Mystery, Situationsrätsel) dürfen wiederkehren, sind aber kein Automatismus. Neue Methoden werden einfach verwendet – sie müssen nicht erst in den Skill aufgenommen werden; das geschieht nur, wenn der Nutzer es ausdrücklich wünscht.

Prüfmaßstab sind die drei Basisdimensionen:

| Dimension | Kernfrage |
|---|---|
| **Kognitive Aktivierung** | Werden *alle* Lernenden zu vertieftem Nachdenken über den Kern des Inhalts angeregt – nicht nur beschäftigt? |
| **Konstruktive Unterstützung** | Gibt es passende Hilfen, Feedback und einen fehlerfreundlichen, wertschätzenden Rahmen? |
| **Klassenführung** | Wird die Lernzeit gut genutzt: klare Ziele und Aufträge, Routinen, wenig Leerlauf und Störungen? |

Ergänzend mitdenken (Synthesemodell nach Praetorius & Charalambous 2018): fachliche Qualität der Inhalte, Unterstützung des Übens, formatives Assessment, Adaptivität/Differenzierung, sozio-emotionale Unterstützung.

Fehlformen, die aktiv vermieden werden (Fauth & Leuders 2018):
- **Aktivität ≠ Aktivierung**: Stationen, Bewegung, Basteln oder Rallyes ohne inhaltlichen Denkkern.
- **Routinisierung**: Eine offene Problemaufgabe wird durch zu enge Vorgaben zur Abarbeitungsaufgabe.
- **Allein lassen**: Offene Phasen ohne Unterstützung überfordern gerade schwächere Lernende.
- **Üben gegen Aktivieren ausspielen**: Festigung und Übung gehören dazu.
- **Wenige Wortmeldungen = ganze Klasse**: Beteiligung aller wird geplant (Einzel-Denkzeit vor dem Austausch).

## Pflichtprinzip 1: Orientierung am Lehrplan

Jede Planung wird aus dem **gültigen Lehrplan** für Bundesland, Schulform, Fach und Jahrgang abgeleitet. Welcher das ist, steht im Profil (`rahmen.bundesland`, `rahmen.schulform`, `rahmen.lehrplan`). Die Bezeichnung folgt dem Land: Kerncurriculum (Niedersachsen, Hessen), Kernlehrplan (NRW), Bildungsplan (Baden-Württemberg, Hamburg), LehrplanPLUS (Bayern), Rahmenlehrplan (Berlin/Brandenburg) usw.; im Folgenden kurz „Lehrplan“.

**Welcher Lehrplan?**
- Lehrplan der **Stufe und Schulform** (Primarstufe, Sek I nach Schulform bzw. Schulzweig, gymnasiale Oberstufe mit Anforderungsniveaus wie gA/eA bzw. Grund-/Leistungskurs), in der Oberstufe dazu die Vorgaben zur Abiturprüfung und die Operatorenliste des Landes.
- **Förderschwerpunkte**: ggf. die curricularen Vorgaben für den jeweiligen Förderschwerpunkt.
- **Fachleistungsdifferenzierung** (z. B. G-/E-Kurse an Gesamtschulen): Anforderungen je Niveau getrennt ausweisen; welches Niveau die Lerngruppe hat, steht in gruppe.md.
- Der **schuleigene Arbeitsplan** (SAP, schulinternes Curriculum) konkretisiert den Lehrplan; seine Vorgaben haben Vorrang. Liegt er im Profil unter `vorlagen` (`art: sap`), ihn lesen. Fehlt er, aber es gibt Gruppenordner auf dem Schulserver (`ablage.schulserver`), dort nach dem Arbeitsplan des Fachs suchen (nur lesen) und anbieten, ihn mit **schulprofil** (Abschnitt 4b) zusammenzufassen.
- **Länderhinweis Niedersachsen:** Kerncurricula (KC) unter cuvo.nibis.de; an der IGS teils eigene KCs (z. B. Naturwissenschaften, Gesellschaftslehre); Fachleistungsdifferenzierung laut Erlass „Die Arbeit in den Schuljahrgängen 5 bis 10 der IGS“: G-/E-Kurse in Mathematik und Englisch ab Jg. 7, Deutsch ab Jg. 8, Naturwissenschaften ab Jg. 9. Für andere Länder die entsprechenden Landesportale nutzen.

**So wird der Lehrplan eingebunden**
1. **Lehrplan-Verortung**: Titel und Jahr, Themenfeld/Unterrichtseinheit, Doppeljahrgang bzw. Halbjahr (in der Alltagsplanung als kurzer Vermerk in der Kopfzeile).
2. **Angestrebte Kompetenzen** werden nach den **Kompetenzbereichen des Lehrplans** gegliedert (prozess- und inhaltsbezogene Kompetenzen bzw. fachspezifische Bereiche) und möglichst nah am Wortlaut formuliert (ausführlich nur in B und C; in A genügt ein Zielsatz).
3. **Basiskonzepte / Leitideen** des Fachs explizit benennen, wenn der Lehrplan sie ausweist.
4. **Operatoren und Anforderungsbereiche I–III** für Aufgaben und Lernziele nutzen (ab Sek I, verbindlich in der Oberstufe; Schwerpunkt AFB II, AFB I stärker als AFB III), Operatorenliste aus dem Profil.
5. **Querschnittsaufgaben** aufgreifen, wo inhaltlich passend (nicht als Pflichtübung): Medienbildung, Bildung für nachhaltige Entwicklung (BNE), durchgängige Sprachbildung, berufliche Orientierung, Demokratiebildung, Inklusion.

**Ehrlichkeitsregel:** Lehrplaninhalte werden nie erfunden. Wenn der genaue Wortlaut nicht sicher bekannt ist, wird im gültigen Lehrplan nachgeschlagen (Websuche im Landesportal). Gelingt das nicht, wird die Kompetenz sinngemäß formuliert und mit „[Formulierung im Lehrplan prüfen]“ markiert. Lädt die Lehrkraft Lehrplan oder Arbeitsplan hoch, ist dieser Text maßgeblich.

## Pflichtprinzip 2: Alltagsbezug

Jede Planung hat einen **echten Alltags- bzw. Lebensweltkontext**. Kriterien (in Anlehnung an Chemie im Kontext, fachübergreifend):

1. Er ist eine **Frage oder ein Problem**, keine bloße Einkleidung („Lisa kauft 3 Äpfel …“ zählt nicht).
2. Er stammt aus der **Lebenswelt der Altersgruppe** (siehe „Altersspezifische Hinweise“).
3. Er ist **so komplex, dass der Fachinhalt zur Lösung wirklich gebraucht wird**.
4. Er ist der **rote Faden**: Einstieg mit dem Problem → Leitfrage → Erarbeitung → Rückkehr zum Kontext („Jetzt können wir erklären, warum …“) → Transfer auf einen zweiten Kontext.
5. Vom Kontext wird bewusst zum **fachlichen Konzept abstrahiert** (Basiskonzept, Regel, Begriff, Modell, Kriterium).

Bewährte Kontextformen (Beispiele, nicht abschließend):
- **Rätselhaftes Ereignis mit provokanter Leitfrage** (z. B. Nyos-Katastrophe 1986: „Eine Strafe Gottes?“ – Mystery zum chemischen Gleichgewicht).
- **Persönliche Nachricht mit Alltagsproblem** (z. B. WhatsApp vom Opa: Kaffeemaschine kaputt trotz Entkalken).
- **Alltagsirrtum zum Widerlegen**; **Detektivszenario**; **Situationsrätsel** im Stil von Black Stories.
- **Echter Auftrag mit Adressat**: Brief an die Schulleitung, Erklärvideo für Fünftklässler, Plakat für den Elternabend, Präsentation für den Austauschpartner.
- **Entscheidungs- oder Dilemmafrage**, **Produktvergleich**, **aktuelle Nachricht**.
- **Lokaler Bezug**: Schulhof, Wohnort, Schulgarten, regionale Betriebe, Geschichte vor Ort.

## Ablauf der Planung

(Alle Schritte laufen intern immer ab; was davon ausgegeben wird, regelt „Ausgabeumfang“.)

### Schritt 0 – Rahmen klären
Benötigt: Schulform, Jahrgang, Fach, Niveau (G/E, gA/eA, Förderschwerpunkt), Größe und Besonderheiten der Lerngruppe, Thema, Dauer (90 / 60 / 45 / ca. 35 Min.), Stellung in der Einheit, Vorwissen, vorhandenes Material, Ausstattung, Vorgaben des schuleigenen Arbeitsplans.
- Was aus dem Gesprächskontext bekannt ist, wird genutzt und nicht erneut gefragt.
- Fehlt Wesentliches (Fach, Jahrgang, Schulform, Thema, Dauer), höchstens **eine kurze Rückfrage**; sonst mit begründeten Annahmen planen und diese oben nennen.
- Eigenes Material des Nutzers ist der Ausgangspunkt – die Stunde wird darum herum geplant.
- **Geringer Vorbereitungsaufwand**: Schulausstattung und Alltagsmaterialien; aufwendige Neuerstellung nur, wenn das Material wiederverwendbar ist.

### Schritt 0b – Gezielte Recherche
Recherche liefert **Rohmaterial, keine fertige Stunde**. Die Stunde wird weiterhin vom Lernziel aus gebaut. Umfang nach drei Stufen:

**Stufe 1 – immer (kurz, in der Alltagsplanung still)**
- **Lehrplan-Wortlaut** prüfen (siehe Pflichtprinzip 1).
- **Faktencheck des Kontexts**: Zahlen, Daten, reale Fälle und Bedingungen auf Plausibilität prüfen (z. B. Druckwerte, Grenzwerte, Jahreszahlen, typische Folgen). Gerade bei Situationsrätseln, Mysterys und Fallanalysen entscheidet das über die Glaubwürdigkeit.
- **Sicherheitsdaten** bei Experimenten: Gefahrstoffeinstufung, GHS-Piktogramme, H-/P-Sätze (z. B. GESTIS-Stoffdatenbank, Richtlinie zur Sicherheit im Unterricht [RiSU]); Hinweise in den Verlaufsplan übernehmen.

**Stufe 2 – bei neuen oder ungewohnten Themen, Unterrichtsbesuchen, Prüfungsstunden oder auf Wunsch**
Kurze Ideenrecherche (2–4 gezielte Suchen) nach erprobten Unterrichtsideen, Methoden, Kontexten und Experimenten in seriösen Quellen:
- **Landesportale und Fortbildung**: Bildungsserver und Unterstützungsportale der Länder (z. B. NiBiS, Landesbildungsserver Baden-Württemberg, Lehrerfortbildung NRW).
- **Fachdidaktische Konzepte und Projekte**: Chemie/Physik/Biologie im Kontext, SINUS, IPN Kiel, Fachdidaktik-Seiten von Hochschulen.
- **Fachzeitschriften**: z. B. *Unterricht Chemie/Biologie/Physik*, *Praxis der Naturwissenschaften*, *Naturwissenschaften im Unterricht*, *Praxis Deutsch*, *Geographie heute*, *mathematik lehren* – oft kostenpflichtig: dann nur Idee und Fundstelle nennen.
- **Offene Bildungsmaterialien (OER)**: z. B. ZUM, WirLernenOnline, Mundo.
- **Mit Vorsicht**: kommerzielle Material-Tauschbörsen und Blogs ohne Qualitätsprüfung – häufig methodisch bunt, aber tiefenstrukturell schwach.
- Bei Standardthemen ohne Faktenrisiko entfällt Stufe 2.

**Stufe 3 – immer nach der Recherche**
- Gefundenes **durch den Tiefenstruktur-Check** laufen lassen und an Lerngruppe, Lehrplan und Zeit anpassen – nicht 1:1 übernehmen.
- **Urheberrecht** beachten: keine Texte, Abbildungen oder Arbeitsblätter aus geschützten Quellen kopieren; stattdessen eigene Fassung erstellen und auf die Quelle verweisen.
- **Quellen angeben** (in A als eine Zeile, in B/C als eigener Abschnitt).
- Ist keine Websuche möglich oder bleibt ein Fakt unsicher: offen sagen und mit „[prüfen]“ markieren.

### Schritt 1 – Wohin? Lehrplan-Verortung, Hauptintention, Kompetenzen
- **Lehrplan-Verortung** (siehe Pflichtprinzip 1).
- **Hauptintention in einem Satz**: „Die SuS [Handlung an der Kernaufgabe] und [erklären/beurteilen/gestalten …] dadurch [Fachkonzept] am Beispiel [Kontext].“
- **Angestrebte Kompetenzen** nach den Kompetenzbereichen des Lehrplans, mit Operatoren, überprüfbar.
- Kernidee: Was sollen die Lernenden *verstanden bzw. gekonnt* haben – nicht: was sollen sie getan haben?

### Schritt 2 – Woher? Vorwissen und Lernendenvorstellungen
- Benötigtes Vorwissen benennen (auch aus früheren Jahrgängen laut Lehrplan; fehlt es → Hilfeangebot).
- **2–4 konkrete erwartbare Schwierigkeiten bzw. Fehlvorstellungen** (fachtypische Beispiele siehe unten). Die Kernaufgabe soll möglichst genau dort einen **kognitiven Konflikt** auslösen.

### Schritt 3 – Alltagskontext und Leitfrage
Kontext nach den Kriterien wählen; **Leitfrage/Stundenfrage**, die sichtbar bleibt und am Ende beantwortet wird. **Didaktische Reduktion** festlegen: Was wird bewusst weggelassen?

### Schritt 4 – Kernaufgabe (Herzstück)
Die Kernaufgabe wird **wörtlich als Arbeitsauftrag** ausformuliert und erfüllt möglichst viele Merkmale:
- nicht mit Routineschema lösbar; Bekanntes auf Neues anwenden
- mehrere Lösungswege oder Deutungen möglich
- löst Irritation aus (Vorhersage → Beobachtung → Erklärung; widersprüchliche Quellen/Positionen)
- verlangt fachtypische Denkhandlungen (Begründen, Verknüpfen, Modellieren, Deuten, Urteilen, Gestalten)
- Informationen müssen ausgewählt, geordnet und in Beziehung gesetzt werden
- Denkprozess wird als Produkt sichtbar (Plakat, Text, Modell, Messwert, Gestaltung, Bewegungsfolge, Grafiz)

Für Formatideen siehe **„Aktivierende Lernarrangements“** – oder ein besser passendes Format außerhalb der Liste.

### Schritt 5 – Phasierung um die Kernaufgabe
Standardbogen (problemorientiert, induktiv; an Fach, Alter und Dauer anpassen; Abweichungen sind erlaubt, wenn sie der Sache dienen):

1. **Einstieg / Problematisierung** – Kontext, Phänomen oder Problem; Leitfrage. Kein langer Wiederholungsblock vorab, wenn er die Neugier bremst.
2. **Hypothesen / Planung** – Vermutungen individuell notieren, Vorgehen klären, ggf. in Teilfragen gliedern.
3. **Erarbeitung I** – Kernaufgabe, möglichst selbstständig, mit gestuften Hilfen; Lehrkraft beobachtet und notiert Lösungswege.
4. **Teilsicherung / Austausch** – Lösungen vergleichen (Gallery Walk, Neriage-Prinzip: gezielt auswählen, erst einfachere, dann weiterführende Ansätze; erst verstehen, dann bewerten).
5. **Erarbeitung II / Systematisierung** – **bewusste Lösung vom Einzelfall** hin zum Konzept (Tabelle, Regel, Fachbegriffe, Kriterien).
6. **Sicherung** – bündeln und sprachlich präzisieren; die Lehrkraft darf hier stärker lenken.
7. **Transfer / Bewertung / Anwendung** in einem zweiten Kontext.
8. **Diagnose / Rückkehr zur Leitfrage** – z. B. Exit-Ticket mit Begründung.

Immer eine **Didaktische Reserve** und eine **Notbremse** einplanen (was entfällt bei Zeitnot; Bearbeitungsstand nach jeder Teilphase erfragen; Lernprodukte fotografisch sichern).

**Aufräumzeit bei Experimenten (Pflicht):** Sobald in der Stunde experimentiert wird (Schüler- oder Demonstrationsversuch, auch Egg-Race, Modellversuch, Mikroskopieren, Bau-/Werkaufträge), wird eine **eigene Aufräumphase mit Zeitangabe** in den Verlaufsplan eingetragen.
- **Richtwerte**: Schülerversuche in Gruppen 5–10 Min. (je nach Geräteaufwand, Spülen, Entsorgung von Chemikalienresten, Trocknen); kleine Freihand- oder Partnerversuche ca. 5 Min.; reiner Lehrerversuch: ggf. nur Abbau durch die Lehrkraft während einer Schreib-/Sicherungsphase vermerken.
- **Platzierung**: direkt nach der Versuchsphase (vor Auswertung/Sicherung), damit die Tische für die Sicherung frei sind und das Aufräumen nicht ins Stundenende gedrängt wird. Ausnahme: Versuche, die bis zur Auswertung aufgebaut bleiben müssen – dann Aufräumen vor dem Exit-Ticket.
- **Organisation**: Aufräumroutine festlegen (Rollen wie Material-/Entsorgungsverantwortliche, Entsorgungsbehälter nach Gefahrstoffen getrennt, Kontrollblick der Lehrkraft, Hände waschen); im Arbeitsauftrag bzw. auf dem Versuchsblatt als letzter Schritt nennen.
- **Nie Notbremse**: Die Aufräumzeit wird bei Zeitnot **nicht** gekürzt – stattdessen entfallen Reserve, Transfer oder Teile der Systematisierung.

Zeitraster:
- **90 Min.**: voller Bogen; Erarbeitung I ca. 35–45 Min.; Austausch nicht wegkürzen; 5 Min. Puffer.
- **60 Min.**: Erarbeitung in Teilschritte mit Zwischensicherung; Transfer als Reserve.
- **45 Min.**: Einstieg ≤ 8 Min., eine Kernaufgabe, knappe Sicherung, Exit-Ticket.
- **verkürzte Stunden (ca. 35 Min.)**: ein Kontext, ein Denkimpuls, Rituale, kurze Phasen.

### Schritt 6 – Methoden zuordnen (Funktion vor Form)
Jede Methode wird aus ihrer **Funktion** abgeleitet – aus dem Methodenpool oder darüber hinaus, nach den Auswahlkriterien des offenen Methodenpools (Funktion → Passung → Aufwand → Abwechslung). In B/C wird sie in der Spalte „Tiefenstruktur-Funktion“ begründet. Methodenvielfalt wird **über die Einheit** gesichert (handelnd, bildlich, sprachlich, symbolisch; Einzel-, Partner-, Gruppenarbeit), nicht durch viele Wechsel in einer Stunde (Faustregel: 2–3 Sozialformwechsel pro 45 Min.). In B/C auch **verworfene methodische Alternativen** nennen.

### Schritt 7 – Konstruktive Unterstützung und Differenzierung
- **Gestufte Hilfen** (Hilfekarten 1–3: Denkanstoß → Teilschritt → Teillösung), Impulsfragen, Lösungskontrolle.
- **Hilfekarten immer an der Aufgabe verweisen (Pflicht):** Jede Hilfekarte gehört zu einer bestimmten (Teil-)Aufgabe und wird genau dort sichtbar angekündigt – direkt hinter oder unter der Aufgabenstellung, z. B. „💡 Hilfekarte 2a“ bzw. „Hilfe? → Hilfekarten 2a · 2b · 2c“. Das gilt überall, wo die Aufgabe steht: auf dem Arbeitsblatt, in der wörtlich ausgegebenen Kernaufgabe, im Verlaufsplan (Spalte Material) und im Lehrerblatt.
  - **Eindeutige Benennung:** Die Karte trägt die Aufgabennummer und bei gestuften Hilfen die Stufe (Hilfekarte 2a = Denkanstoß, 2b = Teilschritt, 2c = Teillösung zu Aufgabe 2). Auf der Karte selbst steht der Rückverweis („Hilfekarte 2a · zu AB 1, Aufgabe 2“).
  - **Keine verwaisten Karten:** Es gibt keine Hilfekarte ohne Verweis an einer Aufgabe und keinen Verweis ohne Karte. Vor der Ausgabe abgleichen: Liste der Karten ↔ Verweise an den Aufgaben.
  - **Kl. 1–4:** Verweis als Symbol (💡 + Kartennummer bzw. Kartenbild) statt Text.
- **Rechnungen immer mit Legende und Beispielrechnung (Pflicht):** Sobald in Aufgabe, Material, Lehrerblatt oder Tafelbild eine Formel oder Rechnung vorkommt (z. B. n = m/M, c = n/V, ΔG = −z·F·ΔE, Dreisatz, Prozent-, Zins- oder Flächenrechnung), gehören zwei Bausteine dazu:
  - **Legende** direkt an der Formel: jedes Formelzeichen mit Bedeutung und Einheit („n = Stoffmenge in mol · m = Masse in g · M = molare Masse in g/mol“), Konstanten mit Wert und Einheit (F = 96 485 C/mol), Indizes und Vorzeichen kurz erklärt (z. B. „ΔE = E(Akzeptor) − E(Donator)“).
  - **Beispielrechnung**, Schritt für Schritt erklärt: Gegeben/Gesucht → Formel → ggf. umstellen → Werte mit Einheiten einsetzen → ausrechnen (Einheiten mitführen) → Ergebnis mit Einheit und Antwortsatz. Zu jedem Schritt ein kurzer Kommentar, was und warum gerechnet wird (Kommentarspalte oder Randnotiz).
  - **Andere Zahlen bzw. anderer Kontext** als in der Aufgabe, damit die Beispielrechnung die Aufgabe nicht vorwegnimmt. Ist das Finden des Rechenwegs selbst das Lernziel, steht die Beispielrechnung als gestufte Hilfekarte bereit (an der Aufgabe verwiesen) statt offen auf dem AB; die Legende bleibt immer sichtbar.
  - **Ort:** auf dem AB als Merk- oder Jokerkasten bei der Aufgabe, im Tafelbild als Musterrechnung mit Legende, im Lehrerblatt die vollständige Lösung im selben Schema.
  - **Kl. 1–4:** Rechenweg bildlich (Plättchen, Zahlenstrahl, Rechenhaus) mit Symbolen und wenigen Worten statt Legende in Sätzen.
- **Sprachbildung**: Satzanfänge/Formulierungshilfen für die fachtypischen Sprachhandlungen (erklären, begründen, vergleichen, beurteilen), Wortspeicher, Hilfen für Lernende mit Deutsch als Zweitsprache.
- **Differenzierung**: gleiche Kernfrage, unterschiedliche Offenheit/Unterstützung; G/E, gA/eA oder sonderpädagogischer Förderbedarf ausweisen; Expertenaufgabe auf AFB III.
- **Verbindliche Teilergebnisse und Rollen** aktivieren auch ruhige Lernende.
- Digitale Werkzeuge, wo sie Mehrwert haben (Lernplattform, Selbstlern-Maps, KI-Lerncoach mit gestuften Hinweisen statt fertiger Lösungen).

### Schritt 8 – Klassenführung
- Jeder Auftrag nennt: **Was – Wer mit wem – Wie lange – Welches Produkt – Was, wenn fertig?** Ablauf sichtbar. Gibt es zu einer Aufgabe Hilfekarten, nennt der Auftrag sie an dieser Aufgabe (siehe Schritt 7) und sagt, wo sie liegen (z. B. Hilfetisch, Umschlag).
- Material vorbereitet (z. B. Umschläge pro Gruppe), Rollen, Signale für Übergänge, Sicherheitshinweise (Experimente, Sport, Werkzeug).
- Bei Experimenten: feste Aufräumroutine mit Zeit und Zuständigkeiten (siehe Schritt 5, „Aufräumzeit bei Experimenten“); analog Auf- und Abbauzeit im Sport.
- Rituale und Lenkungsgrad an Alter und Lerngruppe anpassen (siehe Altersstufen).

### Schritt 9 – Tiefenstruktur-Check (intern immer; ausgegeben nur in B/C)
Ehrlich prüfen und Schwächen – wenn möglich – direkt im Plan verbessern. In der Alltagsplanung erscheint die Tabelle nicht; nur verbleibende, für den Nutzer relevante Punkte werden als kurzer Hinweis genannt.

| Prüffrage | ✓ / ! | Wo in der Stunde? |
|---|---|---|
| Sind die Ziele aus dem gültigen Lehrplan abgeleitet und nach dessen Kompetenzbereichen formuliert? | | |
| Gibt es eine Kernaufgabe, an der *alle* wirklich nachdenken müssen? | | |
| Werden Vorwissen und mindestens eine Fehlvorstellung aufgegriffen? | | |
| Ist der Alltagsbezug echt und kehrt er am Ende zurück? | | |
| Sind Fakten des Kontexts und Sicherheitsdaten geprüft, Recherchefunde angepasst und Quellen angegeben? | | |
| Kommen fachtypische Denk- und Arbeitsweisen vor? | | |
| Passt die Planung zur Altersstufe (Phasenlänge, Abstraktion, Selbstständigkeit)? | | |
| Gibt es Einzel-Denkzeit vor dem Austausch? | | |
| Werden Lösungen verglichen, vernetzt und vom Fall zum Konzept abstrahiert? | | |
| Gibt es gestufte Hilfen, Sprachhilfen und Differenzierung? | | |
| Wird der Lernstand sichtbar (formativ)? | | |
| Sind Aufträge, Zeiten, Übergänge und Reserve klar? | | |
| Ist die Methode die passendste (nicht nur die naheliegendste aus dem Pool), hat sie eine klare Funktion, und ist der Aufwand vertretbar? | | |
| Bei Experimenten: Ist eine eigene Aufräumphase mit realistischer Zeit und Zuständigkeiten eingeplant (nicht in der Notbremse)? | | |
| Bei Rechnungen: Hat jede Formel eine Legende (Zeichen, Bedeutung, Einheit) und gibt es eine erklärte Beispielrechnung mit anderen Zahlen? | | |

Wird ein Situationsrätsel eingesetzt, kommt zusätzlich dessen Prüfliste („Prüfen vor dem Einsatz“) zur Anwendung – ebenfalls intern, ausgegeben nur in B, C oder F.

## Altersspezifische Hinweise

Richtwerte, an die Lerngruppe anpassen. Faustregel für eine Arbeitsphase ohne Tätigkeitswechsel: Alter in Jahren × 1–2 Minuten.

- **Kl. 1–2:** Phasen 5–10 Min., Rituale, Bewegungspausen; handelnd und anschaulich (Gegenstand, Bild, Geschichte); Aufträge kurz, mündlich, mit Symbolen; Staunen und Vorhersagen, Mini-Mystery mit 6–8 Bildkarten; große Schrift, ggf. Grundschrift.
- **Kl. 3–4:** Phasen 10–15 Min.; Lernwege, Stationen mit Denkkern; erstes Begründen mit Satzanfängen, Forscherfragen; Übergang zu Kl. 5 vorbereiten.
- **Kl. 5–6:** Phasen 15–20 Min.; Neugier, Handlung, Wettbewerb (Egg-Race, Detektivauftrag, Situationsrätsel); Fachmethoden schrittweise mit Methodenkarten.
- **Kl. 7–8:** Peers, Identität, Fairness und Relevanz; Wahlmöglichkeiten und Rollen; kooperative Formate mit individueller Verantwortung; Fachsprache systematisch aufbauen.
- **Kl. 9–10:** Abschlüsse und Berufsorientierung; Bewertungsaufgaben, Projekte, Debatten; Operatoren und Anforderungsbereiche üben; Kursniveaus (z. B. G/E) klar ausweisen; Selbstlernen ausbauen.
- **Einführungsphase:** heterogene Lernstände → Eingangsdiagnose, Grundlagen mit Hilfekarten auffrischen; Wissenschaftspropädeutik (Fachtexte, Protokolle, Facharbeit).
- **Qualifikationsphase:** abiturorientiert, nicht abiturfixiert (Operatoren, AFB I–III, Klausurformate; Anforderungsniveaus trennen); selbstständige Phasen bis 45 Min.; Kontexte aus Forschung, Medizin, Ethik.
- **Inklusion:** gemeinsamer Gegenstand, unterschiedliche Zugänge und Ziele (zieldifferent, gestufte Niveaus); Visualisierung, leichte Sprache, Ablaufpläne; Absprachen mit Förderschullehrkraft bzw. Schulbegleitung vermerken.

## Fachspezifische Hinweise

Orientierung und Beispiele; Kompetenzbereiche immer aus dem gültigen Lehrplan. Je Fach: Denkhandlungen · Kontexte · typische Fehlvorstellungen · passende Formate.

- **Deutsch:** Texte deuten und am Text belegen, Schreibprozesse planen und überarbeiten, Sprache untersuchen (Proben) · echte Schreibanlässe, Jugendliteratur, Werbung, Social Media · Nacherzählen statt Deuten, Regeln ohne Verständnis · Interpretationswerkstatt, Gerichtsverhandlung über eine Figur, Rechtschreibdetektiv, Situationsrätsel als Schreibanlass.
- **Fremdsprachen:** Bedeutung aushandeln, Muster entdecken, Sprachmittlung, interkulturell vergleichen; Task-based Learning, Information Gap · Austausch, Reisen, Serien, Alltag Gleichaltriger · Wort-für-Wort-Übersetzen, Sprechangst · Kriminalfall in der Zielsprache, Situationsrätsel für Fragebildung, Simulation, Debatte.
- **Mathematik:** Probleme lösen, modellieren, argumentieren, Darstellungen wechseln (Tabelle – Graph – Term – Situation); produktives Üben einplanen · Handytarif, Sport, Zinsen, Daten aus Umfragen · „Multiplizieren vergrößert immer“, „0,25 > 0,3“, Graph als Bild der Situation · Fermi-Aufgaben, Fehlerdetektiv, Lernumgebung mit natürlicher Differenzierung, Escape-Room.
- **Naturwissenschaften:** Phänomene erklären, Hypothesen experimentell prüfen, Modelle und Modellgrenzen, Stoff- und Teilchenebene (Chemie), Struktur und Funktion (Biologie), Mathematisieren (Physik), Bewerten · Küche, Körper, Klima, Energie, Kosmetik, Medizin · Gase haben keine Masse, Stoffe verschwinden beim Verbrennen, Strom wird verbraucht, Pflanzen holen Nahrung aus dem Boden · Egg-Race, Mystery, Kriminalfall, POE, Situationsrätsel, Legekarten. Gefährdungsbeurteilung im Verlaufsplan, Basiskonzepte explizit, Aufräumphase mit Zeit und Entsorgung.
- **Sachunterricht:** fragen, vermuten, beobachten, ordnen; Perspektiven verbinden · Schulumgebung, Wasser, Wetter, Tiere, früher und heute · animistische Erklärungen · Forscherecke, Concept Cartoon, Rätselgeschichte im Sitzkreis, Unterrichtsgang.
- **Gesellschaftswissenschaften:** Quellen kritisch analysieren, multiperspektivisch deuten, Ursachen und Folgen verknüpfen, Sach- und Werturteil trennen · Geschichte vor Ort, Nachrichten, Lieferketten, Wahlen · Gegenwartsmaßstäbe, Monokausalität, „Darstellung = Quelle“ · Mystery, Planspiel, Talkshow, Fallanalyse.
- **Werte und Normen, Religion, Philosophie:** Perspektiven übernehmen, Begriffe klären, argumentieren, urteilen · Freundschaft, Gerechtigkeit, Medien- und Tierethik, Feste · Meinung ohne Begründung, Moralisieren; kein Bekenntniszwang · Dilemma-Geschichte, Fishbowl, Gedankenexperiment, moralisches Mystery.
- **Kunst, Musik, Darstellendes Spiel:** wahrnehmen, gestalten, experimentieren, deuten; Gestaltungsentscheidungen begründen · Werbung, Musikvideos, Filmmusik, Architektur im Ort · Hemmungen; Bewertung über transparente Kriterien · Gestaltungsauftrag mit begrenztem Material, Galeriegang, Produktion für echtes Publikum.
- **Sport:** Bewegungsprobleme lösen, Taktik verstehen, Fairness reflektieren · Verein, Fitness, Trendsport · viel Bewegungs-, wenig Lernzeit; Bloßstellung vermeiden · Spielproblem, Choreografie-Auftrag. Sicherheit und Aufbau im Verlaufsplan.
- **Informatik, Technik, AWT:** Probleme zerlegen, Algorithmen entwerfen, testen und debuggen, Systeme modellieren · Apps, Datenschutz, Smart Home, Reparieren · „Der Computer denkt“, „Programmieren = Tippen“ · Unplugged, Pair Programming, Bug-Hunt, Escape-Room, Situationsrätsel als Debugging-Training.
- **Andere Fächer:** Leitfrage *Was tun Expertinnen und Experten dieses Fachs, wenn sie denken?* Genau diese Tätigkeit wird zur Kernaufgabe.

## Aktivierende Lernarrangements (Kernaufgaben-Formate)

Bewährte Beispiele, keine abschließende Liste; ein besser passendes Format hat Vorrang. Die Bauhinweise sind der Qualitätsmaßstab, wenn eines gewählt wird.

### Mystery
Gruppen ordnen zu einer rätselhaften Leitfrage Informationskarten und verbinden sie mit **beschrifteten Pfeilen** (weil / dadurch / führt zu); fördert kausales, systemisches Denken (Leat 1998).
- **Einstieg:** kurze, emotionale Erzählung mit überraschendem Ende und provokanter Leitfrage; offene Frage, fachlich klare Lösung.
- **Karten mischen:** Kontextkarten (Fakten zum Fall), Fachkarten (Prinzipien, **nicht** auf den Fall angewendet), Daten-/Grafikkarten, Distraktoren, optional Perspektivkarten. Anzahl: Kl. 1–4 ca. 6–10 Bildkarten, Kl. 5–8 ca. 12–18, ab Kl. 9 ca. 15–30. Nicht durchnummerieren.
- **Ablauf 90 Min.:** Einstieg 5′ → Mystery 40–45′ → Gallery Walk 10′ → Systematisierung vom Fall zum Prinzip 15′ (Pflicht) → Sicherung 10′. Bei Überforderung Hilfekarten, Start- und Zielkarte vorgeben, weniger Karten.

### Leitfragen-Problemlösen mit Legekarten
Alltagsproblem in **3 Teilfragen**, je ein Umschlag mit Anweisungen (Versuch, Recherche), Informationen und Hilfen; Lösungsweg auf Poster, Zwischensicherung nach Teilfrage 1, Gallery Walk, begründetes Urteil am Ende.

### Egg-Race / Konstruktions- und Gestaltungsauftrag
Ungewöhnliches praktisches Problem mit vorgegebenem Material und Zeitlimit, auch in Kunst, Musik, Sport. Lehrkraft hält sich zurück; danach **zwingend** Präsentation, Vergleich der Lösungswege und Rückführung aufs Fachkonzept.

### Kriminalfall / Detektivauftrag
Schlussfolgern aus Indizien; jeder Schluss begründet, Ergebnis als „Gutachten“.

### Situationsrätsel (Ja-/Nein-Fragen)
Lehrkraft schildert eine kurze, scheinbar unmögliche Situation; die Lernenden stellen **nur Ja-/Nein-Fragen**, jede Frage ist eine Hypothese. Die Auflösung ist das Fachkonzept der Stunde. Ab Kl. 1 einsetzbar.
- **Bau:** Vorderseite 1–3 Sätze (z. B. Mann und Hund brechen im Weinkeller zusammen), Lösung 2–4 Sätze (CO₂ aus der Gärung, höhere Dichte als Luft), Schlüsselfakten für die Spielleitung, 2–3 gestufte Tipps. Weitere Ideen: Meerwasser und Verdursten (Osmose), geplatzte Flasche im Gefrierfach (Dichteanomalie), Stahlschiff (Auftrieb), Alufolie auf Amalgamfüllung (galvanische Zelle).
- **Varianten:** Einstieg im Plenum mit 1 Min. stiller Notierzeit; Kleingruppen mit rotierender Spielleitung und Fragenprotokoll („hat uns weitergebracht / nicht“); Kopplung Story → Vorhersage → Versuch → Systematisierung → Rückkehr zur Story; Lernende schreiben selbst Stories als Transfer; Story als Exit-Ticket.
- **Prüfen vor dem Einsatz** (intern, Mängel direkt beheben; als Tabelle nur in B, C, F): fachlich korrekt; Zahlen plausibel und per Faktencheck geprüft (Symptome statt Überdramatisierung); nur mit dem Fachkonzept lösbar; Unterschiede zwischen Story und Modellversuch als Aufgabe gestellt, Modellgrenzen benannt; jedes nötige Detail erfragbar; Tipps vom Kontext zum Konzept gestuft; Material verrät die Lösung nicht; Vorhersage, Rückkehr und Transfer eingeplant; altersgerecht, nicht makaber (eigene Stories statt der Originalkarten); Versuch gefährdungsbeurteilt; Kopf, Operatoren, Quellen, Sprachhilfen.

### Weitere Formate
- **Predict – Observe – Explain:** schriftlich vorhersagen, Überraschendes beobachten, Widerspruch erklären; zielt auf Fehlvorstellungen.
- **Concept Cartoon / Streitgespräch:** Figuren mit verschiedenen Positionen, begründet entscheiden.
- **Fallanalyse / Dilemma:** realer Fall → Analyse → Kriterien → begründetes Urteil.
- **Gruppenpuzzle:** aktivierend nur mit Abschlussaufgabe, die alle Teilaspekte braucht.
- **Escape-Room:** verkettete Rätsel, jeder Code fachlich hergeleitet; gut zum Üben.
- **Planspiel / Rollenspiel / Debatte:** Argumente vorher fachlich erarbeiten, Beobachtungsaufträge fürs Publikum.
- **Forschendes Lernen:** Frage → Hypothese → Planung → Durchführung → Auswertung → Rückbezug; Öffnungsgrad dosieren.
- **Projekt / Lernen durch Engagement:** echtes Produkt für echtes Publikum, fachliche Meilensteine und Reflexion.

## Methodenpool für einzelne Phasen (nach Funktion)

Basiert u. a. auf Mattes, *Methoden für den Unterricht*. **Anregungen, nicht abschließend** – jede andere Methode, die die Funktion der Phase besser oder mit weniger Aufwand erfüllt, ist ausdrücklich erwünscht.

- **Einstieg**: Phänomen/Demonstration mit schriftlicher Vorhersage; Nachricht/Zeitungsmeldung; **Situationsrätsel (Black-Stories-Prinzip)** mit Ja-/Nein-Fragen und Notierzeit vorab; stummer Impuls (Bild, Gegenstand, Film, Musik); Brainstorming/Punktabfrage (Ergebnisse weiterverwenden); Kugellager; Fantasiereise; Sitzkreis mit Gegenstand in der Mitte.
- **Erarbeitung**: siehe Lernarrangements; Modellieren/Modellbau; Lernen an Stationen (nur mit verbindender Abschlussaufgabe); Texterschließung mit Leitfrage (Texteinsammelmethode, Exzerpieren); Schaubilder/Statistiken interpretieren; Erkundung, Expertenbefragung, Interview, Umfrage; Wochenplan/Selbstlern-Map.
- **Austausch und Diskurs**: Think-Pair-Share; Placemat; Neriage-Lösungsvergleich; Gallery Walk mit Beobachtungsauftrag; Schreibgespräch; Fishbowl; Präsentation mit Feedbackbogen.
- **Sicherung**: strukturiertes Tafelbild; Systematisierungstabelle; **Grafiz** (Grafik + Notiz auf einer Seite: oben Thema/Name/Datum; links Skizze/Schaubild/Fließschema; rechts das Wichtigste in Stichpunkten; darunter das Thema in eigenen Worten und ganzen Sätzen; ggf. Fachwörter und Quellen); Concept-Map mit beschrifteten Pfeilen; Lernplakat; Merksatz in eigenen Worten; Foto der Lernprodukte.
- **Üben und Transfer**: Transferaufgabe mit neuem Kontext; gestufte Aufgaben AFB I–III mit Lösungskontrolle; Quiz; Lernende erklären Lernenden; Fehlerdetektiv; **eigene Situationsrätsel schreiben** und von anderen lösen lassen.
- **Diagnose und Reflexion**: Exit-Ticket mit Begründung (auch als Mini-Situationsrätsel); Ampelkarten; Blitzlicht; Rückkehr zur Leitfrage; Lerntagebuch/Portfolio; Feedback zur Unterrichtsqualität.
- **Lehrergelenkte Phasen** (gezielt): kurzer, visualisierter Lehrervortrag, wenn Grundlagen fehlen (Mattes' Lernschleife: Einführung → Voraussetzungen erarbeiten → Auftragsübergabe → eigenverantwortliches Lernen → Präsentation → Feedback → Sicherung → weiterführende Fragen); fragend-entwickelndes Gespräch nur mit echten Denkfragen und Wartezeit; lenkende Sicherung zur fachlich korrekten Formulierung.

## Ausgabeformate

### A) Alltagsplanung (Standard)
Kompakt, ca. eine Bildschirmseite bzw. eine A4-Seite (ohne Material). Kein Fließtext, keine Begründungen, keine Check-Tabellen.

1. **Kopfzeile** (eine Zeile): Lerngruppe · Fach/Niveau · Thema · Dauer · Lehrplanbezug in Kurzform · ggf. Annahmen
2. **Leitfrage & Kontext** (1–2 Sätze) und **Ziel** (1 Satz: „Am Ende können die SuS …“)
3. **Verlaufsplan** mit knappen Zellen; bei Experimenten eine eigene Zeile **Aufräumen** (Zeit + Kurzroutine); letzte Zeile **Reserve**:

| Zeit | Phase | Was passiert | Sozialform | Material |
|---|---|---|---|---|

4. **Kernaufgabe** wörtlich (bei Situationsrätsel/Mystery: Rätsel- bzw. Einstiegstext, Lösung und Tipps in Kurzform)
5. **Hilfen/Differenzierung**: höchstens 3 Stichpunkte; Hilfekarten mit Zuordnung nennen („Hilfekarten 2a–c → Aufgabe 2“) und an der jeweiligen Aufgabe verweisen (Schritt 7); bei Rechnungen Legende und Beispielrechnung (Schritt 7) – in der Kernaufgabe bzw. im Material, nicht nur erwähnt
6. **Sicherung & Exit-Ticket**: Tafelbild-Skizze bzw. Merksatz und eine Diagnosefrage
7. **Hinweise** (nur wenn nötig, höchstens 3): Sicherheit, „[prüfen]“-Fakten, bewusste Kompromisse; ggf. eine Quellenzeile
8. **Materialien**, wenn gewünscht oder vom Nutzer vorgesehen

Abschluss: ein Satz mit Angebot (Begründung, Material, ausführliche Fassung).

### B) Ausführliche Stundenplanung (auf Wunsch)
1. **Kopf**: Schulform · Lerngruppe · Fach/Niveau · Thema der Einheit · Thema der Stunde (gern als Leitfrage) · Dauer · Stellung in der Einheit · Annahmen
2. **Lehrplan-Verortung** (Titel/Jahr, Themenfeld, Bezug zum Arbeitsplan)
3. **Hauptintention** und **angestrebte Kompetenzen** (nach den Kompetenzbereichen des Lehrplans)
4. **Alltagskontext & Leitfrage**, didaktische Reduktion
5. **Verlaufsplan (Stundenraster)**:

| Phase / Zeit | Lehrer-Verhalten | SuS-Verhalten | Sozialform | Medien / Material | Tiefenstruktur-Funktion |
|---|---|---|---|---|---|

   bei Experimenten eigene Zeile **Aufräumen** (Zeit, Rollen, Entsorgung); letzte Zeile: **Didaktische Reserve**
6. **Kernaufgabe(n)** wörtlich (bei Mystery: Einstiegstext, Regeln, Kartenliste mit Kartentyp; bei Situationsrätsel: Vorderseite, Lösung, Schlüsselfakten, gestufte Tipps – plus ausgefüllter Qualitätscheck)
7. **Erwartete Lösungen, Schwierigkeiten & Fehlvorstellungen** mit Impulsen der Lehrkraft
8. **Gestufte Hilfen, Sprachhilfen, Differenzierung**
9. **Sicherung**: Tafelbild-/Tabellen-/Grafiz-Entwurf
10. **Diagnose**: Exit-Ticket mit Erwartungshorizont
11. **Tiefenstruktur-Check**
12. **Kurzbegründung** (3–6 Sätze)
13. **Materialien**, wenn gewünscht oder sinnvoll
14. **Quellen und Anregungen** (Recherchefunde, Lehrplan-Fundstelle, Faktenquellen)

### C) Ausführlicher Unterrichtsentwurf (Unterrichtsbesuche, Prüfungen)
1. Kopf (Lehrkraft, Lerngruppe, Raum, Zeit, Thema der Einheit, Thema der Stunde)
2. **Einbindung in die Unterrichtseinheit** (nummerierte Stundenliste, aktuelle Stunde markiert)
3. **Hauptintention der Stunde**
4. **Bezug zu den curricularen Vorgaben** (Lehrplan des Landes mit Titel, Jahr, Seite; schuleigener Arbeitsplan)
5. **Angestrebte Kompetenzen** (Tabelle Kompetenzbereich | Kompetenz)
6. **Unterrichtliche Voraussetzungen und Lerngruppenanalyse** – nur mit Angaben des Nutzers, nichts erfinden; Lücken markieren
7. **Didaktische Entscheidungen** (Bedeutung des Inhalts, Kontext und seine Funktion für kognitive Aktivierung, knappe Sachanalyse, didaktische Reduktion, erwartbare Schwierigkeiten, Unterstützungsangebote, kurz- und langfristige Lernerfolgsindikatoren)
8. **Methodische Entscheidungen** (entlang der Phasen; Rolle der Lehrkraft; Medienwahl; verworfene Alternativen; Notfallplan)
9. **Literatur** (inkl. Recherchequellen aus Schritt 0b)
10. **Anhang**: Stundenraster, Materialien, Folien, Musterlösung

Tiefenstruktur-Begriffe werden in den Begründungen explizit verwendet. Seminarspezifische Vorgaben des Nutzers haben Vorrang.

### D) Einheit
Standard: kompakte Übersicht (Stunde | Leitfrage/Kontext | Kernaufgabe/Format | Schwerpunkt-Methode | Kompetenz laut Lehrplan), die Methodenvielfalt, Progression und den Wechsel von Erarbeiten, Üben, Anwenden sichtbar macht. Einzelstunden danach nur auf Wunsch – dann im Format A (oder B/C, wenn verlangt).

### E) Ideenskizze
Wenn nur Ideen gesucht werden: 2–3 Vorschläge mit je Kontext/Leitfrage, Kernaufgabe in einem Satz und einem Drei-Zeilen-Ablauf – bewusst verschiedenartig und gern auch mit Methoden außerhalb des Pools. Danach fragen, welche Idee ausgearbeitet werden soll.

### F) Analyse vorhandener Materialien
Standard kompakt: die 2–3 wichtigsten **Stärken** und die 3–5 wichtigsten **Änderungen**, jeweils mit konkretem Gegenvorschlag (umformulierter Text, neue Aufgabe); auf Wunsch zusätzlich verbesserter Ablauf als Tabelle, Lehrplan-Einordnung und vollständiger Qualitätscheck. Fakten und Sicherheitsangaben im Material per Faktencheck (Schritt 0b, Stufe 1) prüfen.

## Ausgabe als HTML-Planungsübersicht

Jede Planung im Format A bis D wird als **HTML-Seite** ausgegeben, nicht als Word-Datei und nicht nur als Chattext. Word oder PDF nur auf ausdrücklichen Wunsch. E und F bleiben Chattext, außer die Lehrkraft wünscht eine Seite.

- Als Artifact veröffentlichen und den Link nennen. Zusätzlich die .html-Datei nach `ablage.material` ablegen (im Ordner der Einheit, falls vorhanden), Dateiname z. B. `DS05_Akkus-und-Recycling_Planung.html` (Nummer zweistellig), und nach **materiallager** ins Register eintragen.
- Im Chat nur Leitfrage, Ziel und höchstens 3 Hinweise nennen, nicht die ganze Planung wiederholen.
- Gleiche Optik wie der Stoffverteilungsplan aus **einheit-planen**, damit Einheit und Stunden zusammenpassen.

**Aufbau (Format A, Reihenfolge fest)**
1. **Kopf**: Fach · Kurs/Niveau · Jahrgang · Einheit/Themenfeld, darunter Nummer und Titel der Stunde. Fakten-Chips: Datum, Dauer, Lehrplanbezug in Kurzform, Hauptmethode, Experiment ja/nein. Annahmen klein darunter.
2. **Leitfrage** groß hervorgehoben mit Alltagskontext (1–2 Sätze), darunter **Ziel** („Am Ende können die SuS …“).
3. **Verlaufsplan**: optional ein schmales Zeitband über der Tabelle (Phasen als Balken proportional zu den Minuten). Dann Tabelle Zeit | Phase | Was passiert | Sozialform | Material. Aufräumen und Reserve farblich abgesetzt.
4. **Kernaufgabe** als Kasten im Wortlaut (bei Mystery oder Situationsrätsel Einstiegstext, Lösung und Tipps in Kurzform).
5. **Zwei Spalten**: Hilfen/Differenzierung | Hinweise (Sicherheit, „[prüfen]“-Fakten, bewusste Kompromisse, „Bewusst weggelassen“).
6. **Vorbereitung** bei Experimenten: Material pro Gruppe und für die Klasse, Gefahrstofftabelle Stoff | Gefahr | Schutz | Entsorgung.
7. **Sicherung**: Tafelbild-Skizze bzw. Merksatz. Exit-Ticket nur, wenn es zur Planung gehört.
8. **Lösungen bzw. Erwartungshorizont** einklappbar (`<details>`).
9. **Material und Medien** als Links (AB-PDFs, Videos, Simulationen), Hausaufgabe. Fußzeile mit Grundlage und Stand-Datum.

B und C im gleichen Stil, zusätzliche Abschnitte als eigene Blöcke, Tiefenstruktur-Check als Tabelle mit ✓ / !. D wie der Stoffverteilungsplan in **einheit-planen**.

**Gestaltung:** ruhig und übersichtlich, Fachfarbe aus dem Layout des Profils als Akzent (sonst Standardpalette aus **material-gestalten**). Helles und dunkles Theme, auf dem Handy lesbar (keine horizontale Scrollleiste, Tabellen umbrechen). Druckfreundlich (`@media print`: helles Theme, `<details>` aufgeklappt, keine Schatten, Tabellenzeilen nicht teilen). Abkürzungen wie „DS“ ausschreiben.

## Weitergabe an andere Bausteine

- **Material** (Arbeitsblätter, Hilfekarten, Exit-Ticket, Lehrerblatt, Tafelbild) auf Wunsch mit **material-gestalten** setzen; Nummern der Hilfekarten in Planung und Material gleich; Legenden und Beispielrechnungen zu Rechnungen (Schritt 7) mitgeben.
- **Lernplattform und Schul-KI:** Stehen sie im Profil (`werkzeuge.lernplattform`, `werkzeuge.schul_ki`) und gibt es dafür einen Skill der Lehrkraft (z. B. edumaps-selbstlern-map, paddy-agent), einmal anbieten, die Stunde dort aufzubereiten. Sonst nicht erwähnen.
- **Gruppen-Akte:** Nach der Stunde (oder wenn die Lehrkraft Rückmeldung gibt) nach Bestätigung unter Unterricht in gruppe.md eintragen: `Datum | Beleg | DS05 Akkus und Recycling gehalten; Exit-Ticket: 15/20 richtig, Fehlvorstellung Strom wird verbraucht | Quelle: unterricht-planen | bestätigt`. Ergebnisse einzelner Kinder aus Exit-Tickets gehören über **beobachtung-dokumentieren** in die Kind-Akten, nicht in gruppe.md.
- **Wochenplaner:** Vorbereitung, die außerhalb der Stunde Zeit kostet (Experiment aufbauen, Material kopieren, Chemikalien bestellen), nach Bestätigung als Aufgabe mit Frist (Stundendatum) und geschätzter Dauer in `planung/aufgaben.md`.
- **Rückmeldung der Lehrkraft** nach einer gehaltenen Stunde („lief zu lang“, „Einstieg zündete nicht“) in der Planung der nächsten Stunde berücksichtigen und unter Unterricht in gruppe.md festhalten.

## Grundlagen (für Begründungen)

- Kunter, M. & Trautwein, U. (2013): *Psychologie des Unterrichts.* Schöningh/UTB.
- Trautwein, U., Sliwka, A. & Dehmel, A. (2018): *Wirksamer Unterricht, Bd. 1: Grundlagen.* Landesinstitut für Schulentwicklung Stuttgart.
- Fauth, B. & Leuders, T. (2018): *Wirksamer Unterricht, Bd. 2: Kognitive Aktivierung.* Landesinstitut für Schulentwicklung Stuttgart.
- Praetorius, A.-K. & Charalambous, C. (2018): Classroom observation frameworks for studying instructional quality. *ZDM*, 50.
- Helmke, A. (2012): *Unterrichtsqualität und Lehrerprofessionalität* (Angebots-Nutzungs-Modell).
- Chemie im Kontext (CHiK): Begegnung – Neugier/Planung – Erarbeitung – Vertiefung/Vernetzung; Basiskonzepte.
- Leat, D. (1998): *Thinking Through Geography* (Ursprung der Mystery-Methode); Schuler, S. et al.: Mysterys im Unterricht.
- Mattes, W.: *Methoden für den Unterricht.* Schöningh.
- Gärtner, H.-J. & von Borstel, G.: *Chemische Egg-Races in der Sekundarstufe 1.*
- Black Stories (moses. Verlag) als Vorbild für Situationsrätsel mit Ja-/Nein-Fragen (laterales Denken).
- Lehrpläne und Erlasse des jeweiligen Landes (Niedersachsen: Kerncurricula unter cuvo.nibis.de, Orientierungsrahmen Medienbildung, Erlass BNE); KMK-Bildungsstandards.
- KMK: Richtlinie zur Sicherheit im Unterricht (RiSU); IFA: GESTIS-Stoffdatenbank (Sicherheitsdaten für Experimente).