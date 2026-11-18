/* schulassistenz · Meine Einstellungen für die Startseite
   Diese Datei gehört dir. Sie wird bei Updates des Plugins nicht ersetzt.
   Speichern als: <Datenordner>/werkzeuge/startseite/meine-einstellungen.js
   Claude ergänzt sie, wenn du einen eigenen Skill anlegst. Du kannst sie auch selbst mit dem Editor ändern.
   Keine Schülernamen eintragen. */
window.SA_EINSTELLUNGEN = {
  schule: "",                      // z. B. "Gesamtschule Musterstadt"
  datenordner: "",                 // voller Pfad, nur für die Anzeige und „Pfad kopieren“
  schuelerdaten_freigabe: "offen", // offen | erteilt | nicht erteilt (Genehmigung der Schulleitung)
  lerngruppen: [],                 // z. B. ["7a-deutsch", "9c-mathe"]; werden auch aus dem Akten-Ordner gelesen
  // Optional: eigener Ort für Schülerdaten (lerngruppen/, kuerzellisten/, ausgaben/), z. B. Schulserver als Netzlaufwerk.
  // Leer = alles im Datenordner. Beispiel IServ (über den IServ-Helfer ab 0.4): "https://<eure-iserv-adresse>/webdav/Files/schulassistenz-daten"
  schuelerdaten: "",
  kuerzelliste: "",                // wo deine Kürzelliste liegt (nur Anzeige), z. B. "D:\\Schule\\Kuerzelliste.xlsx"
  claude: "web",                   // "web": Knopf öffnet claude.ai im Browser. "kopieren": Auftrag nur kopieren (für die Claude-App)
  favoriten: ["pruefung", "eltern", "woche", "pseudonymisierer"], // Startauswahl, danach per ★ auf der Seite
  // Optional: Materiallager. wurzel = Ordner mit deinem Unterrichtsmaterial (nur Anzeige), ausschliessen = Ordner, die nie eingelesen werden.
  // materiallager: { wurzel: "D:\\Schule\\Material", ausschliessen: ["Privat"], quellen_ordner: "90_Quellen" },
  // Optional: Gruppenordner der Schule (nur lesen), z. B. IServ „Gruppen“ über den IServ-Helfer ab 0.5.
  // web = WebDAV-Adresse der Gruppen, laufwerk = derselbe Ort als Netzlaufwerk für Claude (nur Anzeige), gruppen = feste Auswahl (leer = auf der Seite wählen)
  // schulordner: { web: "https://<eure-iserv-adresse>/webdav/Groups", laufwerk: "S:\\", gruppen: [] },
  // Optional: Filter für Schulkalender. Ohne Eintrag leitet die Seite Jahrgänge und Klassen aus „lerngruppen“ ab.
  // kalender_filter: { jahrgaenge: [7, 8], klassen: ["7b"], faecher: ["Deutsch"], immer: ["Gesamtkonferenz", "Ferien"], nie: ["AG"] }
};

/* Eigene Kacheln, gleicher Aufbau wie in kacheln.js. Beispiel:
window.SA_MEINE_KACHELN = [
  { id: "vokabeltest", titel: "Vokabeltest", kurz: "Aus der Lektion", bereich: "bewerten", typ: "claude",
    felder: ["gruppe", "thema"], auftrag: "Erstelle einen Vokabeltest für {gruppe} zu {thema}.", neu_seit: "2026-11-15" }
];
*/
window.SA_MEINE_KACHELN = [];
