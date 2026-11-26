# Schulassistenz-Helfer – Anleitung

(Funktioniert auch außerhalb von IServ: markierten Text auf jeder Webseite per Rechtsklick.)

Eine kleine Erweiterung für **Google Chrome** (läuft genauso in Microsoft Edge). Sie holt Mails und Messenger-Nachrichten aus IServ, ersetzt alle Namen durch Kürzel und gibt nur das Ergebnis an Claude. Claudes Antwort bekommt die Namen auf dem Rückweg wieder, direkt ins Antwortfeld. Die Kürzelliste bleibt nur in deinem Browser.

## Einrichten (einmalig, ca. 3 Minuten)

1. In Chrome `chrome://extensions` in die Adresszeile eingeben (Edge: `edge://extensions`).
2. Oben rechts den **Entwicklermodus** einschalten (Edge: Schalter links unten).
3. **„Entpackte Erweiterung laden“** klicken und diesen Ordner `iserv-helfer` auswählen.
4. Es öffnet sich die Einstellungsseite (sonst: Rechtsklick auf das Symbol → Erweiterungsoptionen):
   - **Kürzelliste:** Ab 0.28 bekommt der Helfer alle Kürzellisten automatisch von der Startseite (Ordner `kuerzellisten`, bei IServ aus dem Schülerdaten-Ordner), sobald du sie einmal mit verbundenem Datenordner öffnest. Hineinziehen nur noch für eine zusätzliche Liste (z. B. Eltern), alle Blätter werden gelesen.
   - **Deinen Namen** eintragen, er wird zu `L-ICH`.
   - Wählen, ob du Claude **im Browser** oder in der **Claude-App** nutzt.
   - Unter „Ausprobieren“ testen.
5. Oben rechts auf das Puzzle-Teil klicken und beim Schulassistenz-Helfer die Pinnnadel setzen, dann ist das Symbol immer sichtbar.

Chrome zeigt beim Start manchmal den Hinweis „Erweiterungen im Entwicklermodus deaktivieren“. Einfach auf **Behalten** bzw. das X klicken.

6. **Startseite (ab 0.9):** Ein Klick auf das Helfer-Symbol öffnet die Schulassistenz-Startseite, sie wohnt jetzt im Helfer (Anleitung: `startseite/Anleitung.md`). Das Helfer-Fenster für Mails öffnest du per Rechtsklick auf das Symbol oder auf der Seite (siehe „Benutzen“). Pseudonymisierer und Abschluss-Check gehören ab 0.10 ebenfalls zum Helfer. „Zugriff auf Datei-URLs zulassen“ braucht es nur noch, damit die alte Startseite-Datei einmal ihre Einstellungen übergibt, oder für eigene Knöpfe, die auf HTML-Dateien zeigen.
7. **Design (ab 0.11):** Startseite, Mail-Fenster, Einstellungen, Pseudonymisierer und Abschluss-Check haben das Design „Graphit & Heft“ (dunkles Graphit, Heftlinien, roter Rand) und ein neues Symbol (Heft mit Häkchen). Die Schriften Lora und Work Sans liegen im Ordner `schriften/` (freie OFL-Lizenz, Lizenztexte daneben).
8. **LEB-online (ab 0.12):** In LEB-online (Noten PLUS) erscheint beim Anlegen und Bewerten einer Leistungsüberprüfung oben rechts ein Helfer-Kasten. Er füllt Noten ein, die du in der Notenübersicht der Startseite mit „Nach LEB-online“ bereitgelegt hast. Speichern klickst du selbst (Anleitung: `startseite/Anleitung.md`, Abschnitt „Nach LEB-online übertragen“).

9. **Schnittstellen-Probe (ab 0.29, einmalig):** Auf der Einstellungsseite unten „Probe öffnen“. Du trägst die Adressen von IServ und WebUntis ein, startest die Aufzeichnung und klickst einmal durch Stundenplan, Klassenbuch, Posteingang, Kalender und Messenger. **Ab 0.30** geht der Helfer die Menüseiten auf Knopfdruck selbst durch („Automatischen Rundgang starten“), hält je Bereich fest, was er anbietet (Reiter, Tabellenspalten, Export), und fragt dich danach, welche Bereiche er künftig lesen soll. **Ab 0.31** folgt der Rundgang auch Untermenüs und Reitern und nimmt LEB-online mit (im schon offenen LEB-Tab, nur Listen, keine Formulare). Der Helfer notiert dabei nur, über welche Datenadressen die Seiten ihre Daten holen und wie die Felder heißen (z. B. „subject: text“). Inhalte, Namen und Zahlenwerte werden nicht gespeichert, es wird nur gelesen, und der Bericht verlässt den Browser nur, wenn du ihn selbst kopierst.

Ändert sich eine Kürzelliste, holt die Startseite sie beim nächsten Öffnen von selbst. Eine zusätzlich hineingezogene Liste bleibt erhalten und steht beim Rückweg zuerst.

**Neuer PC (ab 0.28):** `Neuer-PC-einrichten.cmd` im Datenordner doppelklicken. Dein Name und die Kürzel P1, P2 … kommen über die Startseite („Übernehmen“) mit.

**Tipp für die Rückrichtung:** Pro Kürzel wird beim Rückweg der *erste* Eintrag der Liste eingesetzt. Für Eltern im Blatt „Weitere Personen“ also so eintragen, wie die Anrede lauten soll, z. B. `Mustermann → E-K07` (dann wird aus „Liebe Frau E-K07“ „Liebe Frau Mustermann“).

## Benutzen

**Mail beantworten**
1. Mail in IServ öffnen, unten rechts auf **„✉ An Claude“** klicken.
2. Prüfen: Oben stehen Stellen, die nach Namen aussehen, aber nicht in der Liste sind (Haken = wird ersetzt). Unten der Text, wie er an Claude geht. Du kannst darin noch ändern.
3. **„Kopieren und Claude öffnen“**, in Claude auf Senden.
4. Claudes Entwurf kopieren. In IServ auf „Antworten“, ins Textfeld klicken, dann im Helfer auf **„Antwort einsetzen“**: Entwurf einfügen → **„Namen einsetzen“** → **„Ins Antwortfeld einsetzen“**. Lesen, abschicken.

**Mehrere Mails auf einmal:** In der Liste die Kästchen der gewünschten Mails anhaken (bis 15), dann „✉ An Claude“. Der Helfer öffnet sie nacheinander kurz, sammelt die Texte und springt zurück. Die Mails gelten danach in IServ als gelesen.

**Aufgaben und Termine in den Wochenplaner:** Eine Mail öffnen oder mehrere anhaken, „✉ An Claude“, als Auftrag **„Aufgaben & Termine → Wochenplaner“** wählen. Claude zeigt dir die gefundenen Termine und Aufgaben und trägt sie nach deinem OK in `planung/aufgaben.md` ein. Termine bekommst du als Kalenderdatei.

**Kalender übernehmen:** In IServ den Kalender öffnen, am besten in der **Listen- oder Wochenansicht** mit dem gewünschten Zeitraum, dann „✉ An Claude“. „Kalender → Wochenplaner“ ist vorgewählt. Claude übernimmt nur die Termine, die dich betreffen, fragt bei unklaren nach und leitet Vorbereitungsaufgaben ab (z. B. Noten eintragen vor der Zeugniskonferenz).

**Postfach durchgehen:** In der Postfach-Liste auf „✉ An Claude“ klicken, „Postfach-Übersicht sortieren“ ist dann vorgewählt. Claude sortiert nach Dringlichkeit und sagt, was zu tun ist.

**Messenger:** Chat öffnen, „✉ An Claude“, „Messenger-Verlauf beantworten“.

**Nur einen Teil schicken:** Text markieren, dann „✉ An Claude“. Dann geht nur die Markierung.

**Andere Seiten (Outlook im Browser, Moodle, WebUntis-Nachrichten …):** Text markieren, Rechtsklick → **„Markierten Text pseudonymisiert an Claude“**, oder Rechtsklick auf das Symbol der Erweiterung › „Helfer-Fenster auf dieser Seite öffnen“.

## Schülerdaten-Ordner für die Startseite (ab 0.4)

Liegen Akten und Kürzellisten auf IServ (Dateien › Eigene), liest und schreibt die Startseite sie über den Helfer. Er greift dafür nur auf Adressen `https://<server>/webdav/Files/…` zu und nutzt deine Anmeldung im Browser. Ein Passwort speichert er nicht. Nach einem Neustart des Browsers fragt die Startseite einmal „Bei IServ anmelden“. Einrichtung: Anleitung der Startseite, Abschnitt „Schülerdaten auf dem Schulserver“.

## Gruppenordner der Schule (ab 0.5)

Ab 0.5 liest der Helfer auch die Gruppenordner auf IServ (Dateien › Gruppen, Adressen `https://<server>/webdav/Groups/…`), damit „Material suchen“ auf der Startseite Arbeitspläne, Vorlagen und Fachgruppenmaterial mit durchsucht. Dort nur lesen: Schreiben, Ordner anlegen und Löschen lehnt der Helfer für Gruppenordner ab. Einrichtung: Anleitung der Startseite, Abschnitt „Gruppenordner der Schule“.

## Fehlzeiten aus WebUntis (ab 0.7, ab 0.8 mit einem Klick)

**Ab 0.8:** Beim ersten Abfangen merkt sich der Helfer zusätzlich die Anfrage, die WebUntis beim Klick auf CSV/Excel stellt (Adresse, Klasse, Bericht, Zeitraum; keine Inhalte, keine Namen; dafür die Berechtigung „webRequest“). Danach stellt „Aus WebUntis holen“ diese Anfrage selbst, wartet, bis WebUntis die Datei fertig hat, und holt sie ab. Ohne WebUntis-Tab. Klappt das nicht (z. B. abgemeldet oder WebUntis hat sich geändert), öffnet die Startseite wieder den WebUntis-Tab wie unten beschrieben.

Für die Fehlzeiten-Ampel der Startseite. WebUntis erzeugt jeden Bericht beim Klick neu, deshalb läuft es so: Auf der Startseite „Aus WebUntis holen“ klicken. Der Helfer öffnet WebUntis (beim ersten Mal die Startseite von WebUntis, danach direkt die Berichtsseite). Dort wie gewohnt Klasse bzw. Kurs und „Aktuelles Schuljahr“ wählen und bei „Fehlzeiten pro Schüler*in“ (pro Stunde) auf CSV oder Excel klicken. Der Helfer fängt genau diesen Download ab (nur WebUntis, nur innerhalb von 10 Minuten nach dem Klick auf der Startseite), holt die Datei über deine Anmeldung, löscht den Download und gibt die Datei an die Startseite. Sie landet nicht im Download-Ordner und liegt nur im Arbeitsspeicher, bis die Startseite sie abholt. Die Namen ersetzt die Startseite durch Kürzel. Der Helfer schreibt nichts in WebUntis. Dafür braucht er die Berechtigung „Downloads verwalten“.

Der Ordner heißt weiter `iserv-helfer`, damit dein Browser die Erweiterung beim Update wiederfindet.

## WebUntis direkt lesen (ab 0.32)

Die Startseite kann auf „Heute“ einen Kasten **WebUntis** zeigen. Der Helfer liest dafür über deine Anmeldung im Browser, was WebUntis dir selbst anzeigt. Vier Bereiche, jeder mit eigenem Schalter unter ⚙ „Einrichtung & Daten“ › „WebUntis direkt lesen“. Anfangs ist alles aus, und solange alles aus ist, fragt der Helfer WebUntis nicht ab.

- **Änderungen im Stundenplan:** Vertretung, Entfall, Raumwechsel, verlegte und zusätzliche Stunden, Aufsichten (diese und nächste Woche).
  **Ab 0.33** stehen diese Änderungen auch in der Wochenansicht direkt an der Stunde (Entfall durchgestrichen, Vertretung und Raumwechsel markiert). Entfallene Stunden, die der Stundenplan-Link nicht mehr liefert, erscheinen als eigene Zeile.
- **Prüfungen:** eingetragene Klassenarbeiten und Klausuren deiner Lerngruppen (sechs Wochen voraus).
- **Hausaufgaben:** deine eigenen Einträge und, als Klassenleitung, die Hausaufgaben aller Fächer deiner Klasse (fällig ab heute).
- **Offene Klassenbuch-Stunden:** Stunden der letzten sechs Wochen, in denen Anwesenheitskontrolle oder Lehrstoff fehlen.

Die WebUntis-Adresse deiner Schule nimmt der Helfer aus dem Stundenplan-Link. Fehlt der, trägst du sie neben den Schaltern ein (https://deine-schule.webuntis.com). Bist du bei WebUntis abgemeldet, zeigt der Kasten einen Knopf zum Anmelden. Dein Passwort sieht der Helfer nie.

Der Helfer liest nur: Er ruft ausschließlich die vier Abfragen auf, die auch WebUntis selbst für diese Seiten benutzt, und ändert nichts. Namen von Schüler:innen und Lehrkräften übernimmt er nicht (bei Prüfungen nur die Anzahl). Die Daten stehen nur im geöffneten Tab, werden nicht gespeichert und gehen nicht an Claude. Fehlzeiten kommen weiter über den Export (nächster Abschnitt), weil dort Namen stehen, die die Startseite erst durch Kürzel ersetzt.

## Lehrstoff aus der Live-Beobachtung in WebUntis eintragen (ab 0.38)

Das ist die einzige Stelle, an der der Helfer in WebUntis schreibt. Eigener Schalter unter ⚙ „Einrichtung & Daten“ › „WebUntis direkt lesen“ › „In WebUntis eintragen“, anfangs aus.

Ist er an, steht im Kopf der Live-Beobachtung der Knopf **Lehrstoff**. Der Helfer liest deine Stunden von heute, wählt die laufende vor (änderbar) und zeigt, was dort schon eingetragen ist. Du schreibst den Text, klickst „Vorschau“ und siehst genau, was bei welcher Stunde eingetragen wird. Erst „Jetzt in WebUntis eintragen“ schreibt. Danach liest der Helfer den Eintrag zur Kontrolle zurück. Bei einer Doppelstunde bekommen beide Stunden denselben Text.

Grenzen: nur eigene Stunden von heute, nur der Lehrstoff (keine Abwesenheiten, keine Hausaufgaben), höchstens 1000 Zeichen. Hängen an der Stunde Dateien oder lässt WebUntis den Eintrag nicht zu, trägt der Helfer nichts ein. Bitte keine Namen von Schüler:innen in den Lehrstoff schreiben.

## Abwesende aus der Live-Beobachtung in WebUntis eintragen (ab 0.39)

Zweiter Schalter unter „In WebUntis eintragen“, anfangs aus. Ist er an, steht im Kopf der Live-Beobachtung der Knopf **Abwesende**. Er sammelt alle, die du in der Stunde als „krank“ oder „fehlt“ markiert hast, und zeigt in der Vorschau, wer bei welcher Stunde eingetragen wird. Erst „Jetzt in WebUntis eintragen“ schreibt: Der Helfer öffnet das Klassenbuch der Stunde in einem neuen Tab und trägt die Kinder dort in einem Schritt als abwesend ein, so wie der Knopf „Abwesend“ der Seite. Danach siehst du, wer eingetragen wurde, wer schon abwesend war und wen der Helfer nicht gefunden hat.

Grenzen: nur eigene Stunden von heute. Der Grund bleibt offen (krank und fehlt werden gleich eingetragen). Verspätungen laufen getrennt (nächster Absatz). Die Zuordnung läuft über Vor- und Nachname aus deiner Kürzelliste, nur in diesem Browser. Kinder ohne Namen in der Liste oder mit abweichendem Namen trägst du im geöffneten Klassenbuch selbst ein.

**Verspätung sofort eintragen** (dritter Schalter, anfangs aus): Speicherst du in der Live-Beobachtung bei einem Kind „zu spät“ mit Minuten, trägt der Helfer die Verspätung ohne Vorschau sofort in der gerade laufenden Stunde ein. WebUntis rechnet dabei vom Stundenbeginn bis zu diesem Moment, deine Minuten gehen nicht mit. Das Klassenbuch öffnet sich dafür kurz in einem Tab im Hintergrund und schließt sich wieder. Unter dem Kopf der Live-Beobachtung steht, ob es geklappt hat. Läuft gerade keine Stunde von dir oder findet der Helfer das Kind nicht, trägt er nichts ein und sagt das. Änderst du nur die Minuten, wird nichts erneut gesendet.

## IServ direkt lesen (ab 0.35, Mails anzeigen und abhaken ab 0.38)

Wie bei WebUntis kann die Startseite auf „Heute“ einen Kasten **IServ** zeigen. Drei Bereiche, jeder mit eigenem Schalter unter ⚙ „Einrichtung & Daten“ › „IServ direkt lesen“, anfangs alles aus:

- **Ungelesene Mails:** Anzahl im Posteingang, dazu Absender als Kürzel und Betreff (Namen im Betreff werden ersetzt) und die Zahl der Elternbriefe mit Neuigkeiten. Ein Klick auf eine Mail klappt ihren Text im Kasten auf (mit Kürzeln, mit „Namen zeigen“ im Klartext). In IServ bleibt sie dabei ungelesen. Der Haken ✓ markiert die Mail in IServ als gelesen, sie verschwindet aus dem Kasten. „rückgängig“ setzt die zuletzt abgehakte Mail wieder auf ungelesen. „In IServ antworten“ öffnet die Mail in IServ, dort schreibst und sendest du selbst. Anhänge öffnest du ebenfalls in IServ.
- **Krankmeldungen heute** (braucht DieSchulApp in IServ): nur Kinder, die in deinen Kürzellisten stehen, als Kürzel mit Klasse, Dauer und Stunden. Die Notiz der Krankmeldung liest der Helfer nie.
- **Offene Anträge** (DieSchulApp): Anzahl der noch nicht bearbeiteten Beurlaubungsanträge.

Der Helfer liest nur (ausschließlich lesende Abrufe auf eine feste Liste von Adressen). Einzige Ausnahme ist das Gelesen-Zeichen einer Mail, das er auf deinen Klick setzt oder zurücknimmt. Er löscht, verschiebt und sendet nichts. Klarnamen ersetzt er schon im Hintergrund durch Kürzel. Mit „Namen zeigen“ im Kasten blendest du die Namen ein und wieder aus (anfangs aus). Das gilt nur für die Anzeige in diesem Browser. Unbekannte Absender bekommen wie im Helfer-Fenster ein Kürzel P1, P2 … (Zuordnung unter Einstellungen des Helfers › „Weitere Personen“). Nichts wird gespeichert, nichts geht an Claude.

## LEB-online, Klassenbewertung: Textbausteine ablesen (ab 0.34, einmalig)

Vorstufe für „Claude schlägt Bemerkungen zum Arbeits- und Sozialverhalten vor, der Helfer füllt vor“. Öffnest du in LEB-online unter Klassenbewertungen das Bewertungsformular eines Kindes, erscheint unten rechts ein Kasten „Textbausteine ablesen“. Ein Klick zeigt den Aufbau des Formulars (Feldnamen, Feldarten) und die Auswahllisten der Textbausteine. Eingetragene Werte liest der Helfer nicht, Überschriften macht er unkenntlich, und der Text läuft zusätzlich durch deine Kürzelliste. Er klickt nichts, ruft nichts auf und speichert nichts. Den Text kopierst du selbst und gibst ihn an Claude.

## Konferenz-Mappe aus LEB-online (ab 0.41)
Für Zeugnis- und Pädagogische Konferenzen als Klassenleitung: In der Lerngruppe den Reiter **Konferenz** öffnen und einmal einschalten (anfangs aus). In LEB-online druckst du unter **Klassenbewertungen › Berichte** selbst die PDFs **„Lernstandskontrolle“** (Leistungsart beide, Schüler „Alle Schüler“) und **„Niveaustufen“** und ziehst sie in die Mappe. Der Helfer ruft LEB-online dafür nicht auf, liest die PDFs nur in diesem Fenster und ersetzt die Namen über die Kürzelliste der Lerngruppe.
Angezeigt werden je Kind: Kurse E/G in Deutsch, Mathe, Englisch, NaWi (aktuell → nächstes Halbjahr), der Schnitt jedes Fachs aus den Einzelnoten (mündlich/fachspezifisch 60 %, schriftlich 40 %; änderbar in meine-einstellungen.js unter `konferenz: { muendlich: 60 }`), die ganzen Fehltage aus der Fehlzeiten-Ampel und eine Abschlussprognose nach AVO-Sek I mit Begründung (Regeln des Abschluss-Checks, ohne mündliches Prüfungsfach). Gespeichert wird nur mit Kürzeln unter `ausgaben/konferenz/`. „Tischvorlage mit Claude“ gibt die Tabelle an den Skill zeugnis-vorbereiten. Namen, die nicht zugeordnet werden konnten, stehen nur im Fenster. Einen unbekannten LEB-Bericht zeigt die Mappe als Aufbau ohne Namen zum Kopieren, damit er eingebaut werden kann.

## Was die Erweiterung ersetzt

- Alle Namen aus der Kürzelliste (auch „Nachname, Vorname“ und Teile von Doppelnamen) und deinen eigenen Namen.
- **Weitere Personen automatisch:** Namen aus „Von“/„An“ (vor einer Mailadresse) und unter dem Signaturtrenner „--“, die nicht in deiner Liste stehen (z. B. Kolleg:innen), bekommen automatisch ein Kürzel P1, P2 … und werden überall im Text ersetzt, auch Vornamen allein. Dieselbe Person behält ihr Kürzel; die Zuordnung bleibt im Browser (Einstellungen → „Weitere Personen“). Fehlt trotzdem ein Name: im Textfeld markieren → **„Markierten Namen überall ersetzen“**.
- Mailadressen: `vorname.nachname@…` wird zu `[Mail K07]`, andere zu `[E-Mail]`.
- Vorgeschlagen zum Ersetzen: Telefonnummern, Adressen, PLZ/Ort, Geburtsdaten, Namen nach „Frau“, „Herr“, „Liebe“, „Hallo“, „Von:“ und unter Grüßen, häufige Vornamen.
- Sicherheitsnetz: Steht nach deinen Änderungen noch ein Name aus der Liste im Text, wird nichts kopiert.

## Grenzen

- Namen, die weder in der Liste stehen noch einem Muster folgen (z. B. ein Spitzname), findet die Erweiterung nicht. **Vor dem Senden den Text kurz ansehen.**
- Anhänge werden nicht gelesen. Dafür den Pseudonymisierer nutzen.
- IServ kann sein Aussehen ändern. Holt die Erweiterung zu viel oder zu wenig Text, den gewünschten Teil markieren und dann klicken.
- Die Schulleitung entscheidet, ob Schülerdaten überhaupt (auch pseudonymisiert) mit Claude verarbeitet werden dürfen.
- Nichts wird automatisch verschickt. Abschicken tust immer du.
