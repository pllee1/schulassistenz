# Schulassistenz-Helfer – Anleitung

(Funktioniert auch außerhalb von IServ: markierten Text auf jeder Webseite per Rechtsklick.)

Eine kleine Erweiterung für **Google Chrome** (läuft genauso in Microsoft Edge). Sie holt Mails und Messenger-Nachrichten aus IServ, ersetzt alle Namen durch Kürzel und gibt nur das Ergebnis an Claude. Claudes Antwort bekommt die Namen auf dem Rückweg wieder, direkt ins Antwortfeld. Die Kürzelliste bleibt nur in deinem Browser.

## Einrichten (einmalig, ca. 3 Minuten)

1. In Chrome `chrome://extensions` in die Adresszeile eingeben (Edge: `edge://extensions`).
2. Oben rechts den **Entwicklermodus** einschalten (Edge: Schalter links unten).
3. **„Entpackte Erweiterung laden“** klicken und diesen Ordner `iserv-helfer` auswählen.
4. Es öffnet sich die Einstellungsseite (sonst: Rechtsklick auf das Symbol → Erweiterungsoptionen):
   - **Kürzelliste** hineinziehen (dieselbe Excel-Datei wie für den Pseudonymisierer, alle Blätter werden gelesen).
   - **Deinen Namen** eintragen, er wird zu `L-ICH`.
   - Wählen, ob du Claude **im Browser** oder in der **Claude-App** nutzt.
   - Unter „Ausprobieren“ testen.
5. Oben rechts auf das Puzzle-Teil klicken und beim Schulassistenz-Helfer die Pinnnadel setzen, dann ist das Symbol immer sichtbar.

Chrome zeigt beim Start manchmal den Hinweis „Erweiterungen im Entwicklermodus deaktivieren“. Einfach auf **Behalten** bzw. das X klicken.

6. **Startseite (ab 0.9):** Ein Klick auf das Helfer-Symbol öffnet die Schulassistenz-Startseite, sie wohnt jetzt im Helfer (Anleitung: `startseite/Anleitung.md`). Das Helfer-Fenster für Mails öffnest du per Rechtsklick auf das Symbol oder auf der Seite (siehe „Benutzen“). Pseudonymisierer und Abschluss-Check gehören ab 0.10 ebenfalls zum Helfer. „Zugriff auf Datei-URLs zulassen“ braucht es nur noch, damit die alte Startseite-Datei einmal ihre Einstellungen übergibt, oder für eigene Knöpfe, die auf HTML-Dateien zeigen.
7. **Design (ab 0.11):** Startseite, Mail-Fenster, Einstellungen und Pseudonymisierer haben das Design „Graphit & Heft“ (dunkles Graphit, Heftlinien, roter Rand) und ein neues Symbol (Heft mit Häkchen). Die Schriften Lora und Work Sans liegen im Ordner `schriften/` (freie OFL-Lizenz, Lizenztexte daneben).

Ändert sich deine Kürzelliste, einfach die neue Datei wieder hineinziehen.

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
