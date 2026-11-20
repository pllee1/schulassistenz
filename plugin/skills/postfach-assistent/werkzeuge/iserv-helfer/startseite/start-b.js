/* Schulassistenz-Startseite · Tooltips (vorher eingebettetes Skript in Schulassistenz-Start.html). */
/* ---------- Tooltips: Knopf-Erklärungen beim Überfahren (Maus) oder Fokus (Tastatur) ----------
   Reihenfolge: data-tipp am Knopf, sonst Text aus TIPPS (nach Beschriftung), sonst vorhandenes title. */
(function(){
  const ordnerTipp=()=>{const o=(typeof seitenOrdner==="function"&&seitenOrdner())||"…\\schulassistenz";
    return "Wähle den <b>schulassistenz-Ordner auf diesem Gerät</b> ("+o.replace(/[<>&]/g,"")+"), also den Ordner, in dem diese Startseite liegt. Nicht den IServ-Ordner (Z: oder I:): Akten holt die Seite selbst über den Helfer."};
  const TIPPS={
    "Datenordner verbinden":ordnerTipp,
    "Anderen Ordner wählen":ordnerTipp,
    "Akten anzeigen":"Chrome fragt einmal je Sitzung, ob die Seite deinen Datenordner lesen darf. Mit „Bei jedem Besuch zulassen“ fragt er nicht mehr.",
    "Schülerdaten-Ordner verbinden":"Ordner mit Akten und Kürzellisten wählen. Liegen sie auf IServ, nimm besser den Helfer-Weg (Einstellung schuelerdaten mit https-Adresse).",
    "Anderen Schülerdaten-Ordner wählen":"Einen anderen Ordner für Akten und Kürzellisten wählen.",
    "Schülerdaten öffnen":"Zugriff auf den Schülerdaten-Ordner für diese Sitzung erlauben.",
    "Bei IServ anmelden":"Öffnet IServ in einem neuen Tab. Dort anmelden, dann hier „Erneut versuchen“.",
    "Erneut versuchen":"Liest die Akten noch einmal von IServ bzw. aus dem Ordner.",
    "IServ verbinden":"Verbindet die Seite über den Schulassistenz-Helfer mit IServ (Mails, Kalender, Dateien).",
    "Neu einlesen":"Liest Akten, Aufgaben und Kürzellisten neu ein, z. B. nachdem Claude etwas geändert hat.",
    "Neu laden":"Holt die Daten noch einmal.",
    "Neu lesen":"Liest die Datei noch einmal ein.",
    "Neue Lerngruppe":"Legt eine Lerngruppe mit Gruppenakte, einer Akte je Kürzel und einer Kürzelliste an.",
    "Notenübersicht":"Alle Noten einer Lerngruppe auf einen Blick, mit Vorschlag nach deiner Gewichtung.",
    "Kürzel nachschlagen":"Zeigt, welcher Name zu einem Kürzel gehört. Namen bleiben auf diesem Gerät.",
    "Kürzel verknüpfen":"Verbindet Kürzel derselben Person aus verschiedenen Lerngruppen.",
    "Code-Zuordnung":"Ordnet Codes (z. B. aus Klausuren) den Kürzeln einer Lerngruppe zu.",
    "Sichern":"Sicherung von Akten und Kürzellisten anlegen oder zurückholen.",
    "Jetzt sichern":"Speichert den heutigen Stand als Sicherung.",
    "Schülerdaten umziehen":"Kopiert Akten und Kürzellisten aus dem Datenordner in den Schülerdaten-Ordner (prüft jede Datei, überschreibt nichts).",
    "1. Kopieren und prüfen":"Kopiert alle Dateien und vergleicht sie danach Byte für Byte.",
    "2. Alte Fassung im Datenordner löschen":"Löscht nur Dateien, deren Kopie geprüft ist.",
    "Mit Claude besprechen":"Gibt diese Akte (nur Kürzel, keine Namen) als Auftrag an Claude.",
    "Mit Claude auswerten":"Gibt die Daten (nur Kürzel) als Auftrag an Claude zur Auswertung.",
    "Mit Claude abgleichen":"Lässt Claude die Fehlzeiten mit den Akten abgleichen (nur Kürzel).",
    "Als Auftrag an Claude":"Öffnet Claude mit deinem Text als Auftrag.",
    "Auftrag kopieren":"Kopiert den Auftrag. In Claude mit Strg+V einfügen.",
    "In Claude öffnen":"Öffnet Claude mit diesem Auftrag. Angehängte Dateien dort noch hineinziehen.",
    "Auftrag neu aus den Feldern erzeugen":"Verwirft deine Änderungen am Auftragstext und baut ihn aus den Feldern neu.",
    "Dateien anhängen":"Dateien für Claude auswählen. Sie werden im Auftrag genannt.",
    "Kürzel hinzufügen":"Neue Akte für ein weiteres Kind in dieser Lerngruppe anlegen.",
    "Kürzel entfernen":"Entfernt die Akte dieses Kürzels (mit Rückfrage).",
    "Namen einblenden":"Zeigt die Namen aus der Kürzelliste, nur hier auf dem Bildschirm. Sie gehen nie an Claude.",
    "Namen ausblenden":"Zeigt wieder nur Kürzel.",
    "Starten":"Startet die Live-Beobachtung für die gewählte Lerngruppe.",
    "Live-Beobachtung":"Notizen und Noten während der Stunde, direkt in die Akten.",
    "Stunde beenden":"Beendet die Beobachtung. Danach kannst du die Notizen prüfen und in die Akten speichern.",
    "In Akten speichern":"Schreibt die bestätigten Notizen in die Akten.",
    "Freigeben und in Akten speichern":"Übernimmt die Einträge und schreibt sie in die Akten.",
    "Für alle eintragen":"Trägt denselben Eintrag für alle Kinder der Gruppe ein.",
    "Regler eintragen":"Übernimmt den Wert vom Regler als Note.",
    "Stunde planen":"Öffnet den Auftrag „Stunde planen“ für diese Stunde.",
    "Woche planen":"Auftrag an Claude: Woche mit Stundenplan, Terminen und Aufgaben planen.",
    "Stundenplan":"Stundenplan per iCal-Link aus WebUntis laden. Der Link bleibt nur in diesem Browser.",
    "Kalender":"Monatskalender ein- oder ausblenden.",
    "Kalender hinzufügen":"Weiteren Kalender (z. B. IServ oder Schulkalender) per iCal-Link einbinden.",
    "Aktuell":"Springt zur aktuellen Woche.",
    "Heute":"Springt zu heute.",
    "Termin eintragen":"Eigenen Termin in deinen Kalender eintragen.",
    "Für Outlook":"Speichert den Termin als Kalenderdatei für Outlook.",
    "Speichern und laden":"Merkt sich den Link in diesem Browser und lädt die Termine.",
    "Material anzeigen":"Zeigt dein Material zum Suchbegriff.",
    "Nur Schulserver durchsuchen":"Sucht nur in den Gruppenordnern der Schule (nur lesend).",
    "Gruppenordner wählen":"Wählt, welche Gruppenordner der Schule durchsucht werden.",
    "Für Claude speichern":"Speichert das Verzeichnis, damit Claude dein Material auch findet.",
    "Wissensbasis anlegen":"Legt in der Einheit den Ordner 90_Quellen für Hintergrundtexte an.",
    "Pfad kopieren":"Kopiert den Pfad, z. B. zum Einfügen im Explorer.",
    "Pseudonymisierer":"Ersetzt Namen in Dateien durch Kürzel, bevor sie an Claude gehen.",
    "Alle Werkzeuge":"Zeigt alle Knöpfe nach Bereichen.",
    "Einrichtung prüfen":"Zeigt, was auf diesem Gerät schon eingerichtet ist und was noch fehlt.",
    "Zurück auf meine Einstellungen":"Verwirft Änderungen hier und nimmt wieder die Werte aus meine-einstellungen.js.",
    "Aus WebUntis holen":"Holt den Fehlzeiten-Bericht über den Helfer aus WebUntis (nur lesen).",
    "Stand speichern":"Merkt sich den heutigen Fehlzeiten-Stand für den nächsten Vergleich.",
    "Eltern informiert":"Vermerkt in der Akte, dass die Eltern benachrichtigt wurden. Die Schwelle zählt ab dann neu.",
    "In die Akte":"Schreibt den Vermerk in die Akte.",
    "Ansehen / zurückholen":"Zeigt vorhandene Sicherungen und holt Dateien daraus zurück.",
    "Morgen erinnern":"Erinnert morgen wieder an die Sicherung.",
    "Vor-/Nachname tauschen":"Vertauscht Vor- und Nachname in dieser Zeile.",
    "Rückgängig":"Nimmt den letzten Schritt zurück.",
    "Änderung zurücknehmen":"Stellt den vorherigen Eintrag wieder her.",
    "Drucken":"Druckt diese Ansicht (oder als PDF speichern)."
  };
  const OHNE=/^(Schließen|Abbrechen|OK|Ja, löschen|Speichern|Anlegen|Hinzufügen|Übernehmen|Ansehen|Öffnen|Löschen|Lösen|Ausblenden|Anzeigen|Liste schließen|Weiterverwenden|Verwerfen|Alle verwerfen|Streichen|Korrigieren|Note|\+ Note|‹|›)$/;
  const schluessel=t=>t.replace(/\s+/g," ").replace(/\s*\(\d+\)\s*$/,"").replace(/\s*…\s*$/,"").trim();
  function textFuer(el){
    if(el.dataset.tipp)return el.dataset.tipp;
    const k=schluessel(el.innerText||el.textContent||"");
    let t=TIPPS[k];if(typeof t==="function")t=t();
    if(t)return t;
    return el.dataset.tippTitle||"";
  }
  const box=document.createElement("div");box.id="tipp";box.setAttribute("role","tooltip");document.body.appendChild(box);
  let ziel=null,uhr=null;
  function zeigen(el){
    const t=textFuer(el);if(!t)return;
    box.innerHTML=/<b>/.test(t)?t:t.replace(/[<>&]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c]));
    box.style.left="0px";box.style.top="0px";box.classList.add("an");
    const r=el.getBoundingClientRect(),b=box.getBoundingClientRect(),vw=innerWidth,vh=innerHeight;
    let x=Math.min(Math.max(8,r.left+r.width/2-b.width/2),vw-b.width-8),y=r.bottom+8;
    if(y+b.height>vh-8)y=r.top-b.height-8;
    box.style.left=x+"px";box.style.top=Math.max(8,y)+"px";
    if(!el.id)el.id="tk"+Math.random().toString(36).slice(2,8);
    box.dataset.fuer=el.id;el.setAttribute("aria-describedby","tipp");
  }
  function weg(){clearTimeout(uhr);box.classList.remove("an");if(ziel)ziel.removeAttribute("aria-describedby");ziel=null}
  const KNOEPFE=".btn,button,label.btn,a.btn,.linkbtn";
  // Vorhandene title-Texte in den eigenen Tooltip übernehmen (sonst erscheinen zwei Hinweise)
  function titelUebernehmen(el){if(el.title){el.dataset.tippTitle=el.title;el.removeAttribute("title")}}
  document.addEventListener("pointerover",e=>{
    const el=e.target.closest&&e.target.closest(KNOEPFE);if(!el||el===ziel)return;
    if(OHNE.test(schluessel(el.innerText||""))&&!el.dataset.tipp&&!el.title&&!el.dataset.tippTitle)return;
    titelUebernehmen(el);weg();ziel=el;uhr=setTimeout(()=>{if(ziel===el)zeigen(el)},350);
  });
  document.addEventListener("pointerout",e=>{if(ziel&&!ziel.contains(e.relatedTarget))weg()});
  document.addEventListener("focusin",e=>{const el=e.target.closest&&e.target.closest(KNOEPFE);if(!el||!el.matches(":focus-visible"))return;titelUebernehmen(el);weg();ziel=el;zeigen(el)});
  document.addEventListener("focusout",weg);
  document.addEventListener("pointerdown",weg);
  document.addEventListener("keydown",e=>{if(e.key==="Escape")weg()});
  addEventListener("scroll",weg,true);
  window.saTipps=TIPPS; // andere Module (Fehlzeiten, Sicherung, Kacheln) können Texte ergänzen
})();
