/* Schulassistenz-Helfer · Panel auf der Seite (IServ automatisch, andere Seiten über das Symbol) */
(function () {
  if (window.__saHelfer) return; window.__saHelfer = true;
  const P = window.SAPseudo;
  const istIServ = /\/iserv\//.test(location.pathname);

  const AUFTRAG = {
    uebersicht: "Postfach-Assistent: Hier ist meine Postfach-Übersicht (pseudonymisiert, nur Kürzel). Sortiere und priorisiere bitte, sag mir je Mail, was von mir erwartet wird, und schlag vor, was ich zuerst beantworte.",
    stundenplan: "Wochenplaner: Hier ist mein Stundenplan (pseudonymisiert). Lies daraus nur meine eigenen Stunden, Aufsichten und Vertretungen und zeig sie mir als Tabelle Tag · Stunde · Uhrzeit · Fach · Lerngruppe · Raum · Hinweis (z. B. Vertretung, Entfall). Frag bei Unklarem nach und speichere den Plan nach meiner Bestätigung in planung/stundenplan.md im Format der Startseite (Markdown-Liste je KW, z. B. „- Mo 16.11.: 08:00–09:30 13-che-ea (N104); …“, Ausfall als „entfällt“).",
    kalender: "Postfach-Assistent: Termine aus meinem IServ-Kalender für den Wochenplaner (pseudonymisiert, nur Kürzel). Lies die Termine unten, übernimm nur die, die mich betreffen (meine Lerngruppen, Fächer, Aufsichten, Funktionen und alle schulweiten Termine wie Konferenzen, Zeugnisse, Ferien laut Profil). Zeig sie mir als Tabelle (Art · Was · Datum/Uhrzeit · Dauer · Quelle „IServ-Kalender“), frag bei unklaren nach und trag sie nach meiner Bestätigung als Termine in meine Aufgabenliste für den Wochenplaner ein. Leite außerdem Vorbereitungsaufgaben ab (z. B. Zeugnisnoten eintragen vor der Zeugniskonferenz).",
    aufgaben: "Postfach-Assistent: Aufgaben und Termine für den Wochenplaner. Analysiere die folgenden Mails (pseudonymisiert, nur Kürzel): Zieh alle Termine, Aufgaben, Fristen und nötigen Antworten heraus, zeig sie mir als Tabelle und trag sie nach meiner Bestätigung in meine Aufgabenliste für den Wochenplaner ein. Termine bitte zusätzlich als .ics-Datei.",
    mehrere: "Postfach-Assistent: Hier sind mehrere Mails (pseudonymisiert, nur Kürzel). Fasse jede in einem Satz zusammen, sag mir, was jeweils von mir erwartet wird und bis wann, sortiere nach Dringlichkeit und entwirf Antworten, wo eine nötig ist.",
    mail: "Postfach-Assistent: Hier ist eine Mail (pseudonymisiert, nur Kürzel). Fasse sie in einem Satz zusammen, sag mir, was von mir erwartet wird und bis wann, und entwirf eine Antwort.",
    chat: "Postfach-Assistent: Hier ist ein Verlauf aus dem Messenger (pseudonymisiert, nur Kürzel). Fasse zusammen, was offen ist, und entwirf eine kurze Antwort.",
    frei: "Postfach-Assistent: "
  };
  const MODI = [["mail", "Eine Mail beantworten"], ["mehrere", "Mehrere Mails zusammenfassen & beantworten"], ["uebersicht", "Postfach sortieren: Was ist dringend?"], ["aufgaben", "Termine & Aufgaben aus Mails → Wochenplaner"], ["kalender", "IServ-Kalender → Wochenplaner"], ["stundenplan", "Stundenplan → Wochenplaner"], ["chat", "Messenger-Verlauf beantworten"], ["frei", "Nur pseudonymisieren, eigener Auftrag"]];
  // [vorher du, Claude macht, danach du]
  const HILFE = {
    mail: ["Eine Mail in IServ öffnen.", "Fasst sie in einem Satz zusammen, sagt, was von dir erwartet wird und bis wann, und schreibt einen Antwortentwurf.", "Entwurf in Claude kopieren → hier „Antwort einsetzen“ → in IServ lesen und selbst abschicken."],
    mehrere: ["In der Liste 2–15 Mails mit Strg+Klick auswählen.", "Fasst jede Mail kurz zusammen, sortiert nach Dringlichkeit und schreibt Antwortentwürfe, wo nötig.", "Je Antwort: Mail in IServ öffnen, „Antworten“, Entwurf über „Antwort einsetzen“ einfügen, selbst abschicken."],
    uebersicht: ["Posteingang öffnen, keine Mail auswählen.", "Liest nur die Zeilen der Liste (Absender, Betreff, Datum) und sagt dir, was dringend ist und womit du anfangen solltest. Keine Antworten.", "Die dringenden Mails öffnen und mit „Eine Mail beantworten“ weitermachen."],
    aufgaben: ["Eine Mail öffnen oder mehrere mit Strg+Klick auswählen.", "Sucht Termine, Fristen und Aufgaben heraus und zeigt sie dir als Tabelle. Nach deinem OK trägt Claude sie in deine Aufgabenliste für den Wochenplaner ein, Termine zusätzlich als Kalenderdatei.", "In Claude die Tabelle prüfen und „ok“ schreiben. Die Kalenderdatei bei Bedarf in IServ importieren."],
    kalender: ["IServ-Kalender in der Listen- oder Wochenansicht öffnen, gewünschten Zeitraum einstellen.", "Übernimmt nur die Termine, die dich betreffen, fragt bei unklaren nach und leitet Vorbereitungsaufgaben ab. Nach deinem OK landen sie in deiner Aufgabenliste.", "In Claude prüfen und „ok“ schreiben. Danach „Woche planen“ auf der Startseite."],
    chat: ["Den Chat im IServ-Messenger öffnen.", "Fasst zusammen, was offen ist, und schreibt eine kurze Antwort.", "Entwurf über „Antwort einsetzen“ ins Eingabefeld des Messengers, selbst senden."],
    stundenplan: ["Normalerweise nicht nötig: Die Startseite holt deinen Stundenplan automatisch aus WebUntis. Nur als Notlösung: WebUntis-Wochenansicht öffnen und auf das Symbol des Helfers klicken.", "Liest deine Stunden, Aufsichten und Vertretungen heraus und zeigt sie dir als Tabelle. Nach deinem OK speichert Claude den Plan für den Wochenplaner.", "In Claude prüfen und „ok“ schreiben. Danach „Woche planen“ auf der Startseite."],
    frei: ["Text markieren (oder ganze Seite nehmen).", "Nichts Bestimmtes: Der Text wird nur pseudonymisiert. Deinen Auftrag schreibst du selbst oben in das Textfeld.", "In Claude weiterarbeiten. Namen bei Bedarf über „Antwort einsetzen“ zurückholen."]
  };

  function modusRaten() {
    const u = location.pathname + location.hash + location.search;
    if (/messenger|chat/i.test(u)) return "chat";
    if (/calendar|kalender/i.test(u)) return "kalender";
    if (/timetable|stundenplan|untis|plan/i.test(u)) return "stundenplan";
    if (/mail/i.test(u)) return (lesePane() || /(show|message|read|view|uid|\/\d{2,})/i.test(u)) ? "mail" : "uebersicht";
    return "mail";
  }

  // ---- Dokumente inkl. gleicher-Ursprung-iframes (Mailtext und Editor stecken oft in iframes)
  function dokumente(doc = document, out = []) {
    out.push(doc);
    for (const f of doc.querySelectorAll("iframe,frame")) { try { if (f.contentDocument) dokumente(f.contentDocument, out); } catch (e) {} }
    return out;
  }
  // ---- nur die geöffnete Mail: vom Knopf „Antworten“ aus nach oben bis kurz vor Ordnerleiste/Mailliste
  const ANTWORT_RE = /^(antworten|allen antworten|reply)$/i;
  const LISTE_RE = /(Postfächer|Posteingang|Gesendete Elemente|Entwürfe|Papierkorb)/;
  function antwortKnopf(doc) {
    let notfall = null;
    for (const el of doc.querySelectorAll("button,a,[role=button],[role=menuitem],span,div")) {
      if (host.contains(el)) continue;
      const t = (el.textContent || "").trim(), l = (el.getAttribute("aria-label") || el.getAttribute("title") || "").trim();
      if (ANTWORT_RE.test(l)) return el;
      if (ANTWORT_RE.test(t)) { if (/^(BUTTON|A)$/.test(el.tagName) || el.getAttribute("role")) return el; if (!notfall) notfall = el; }
    }
    return notfall;
  }
  // Grenze erreicht: Ordnerleiste oder Mailliste ist im Bereich enthalten
  function istZuGross(n) {
    if (n.querySelector("nav,[role=navigation],[role=tree]")) return true;
    if (n.querySelectorAll("input[type=checkbox],[role=checkbox]").length >= 3) return true;
    if (n.querySelectorAll("[role=row],tr,li").length >= 8) return true;
    return /Postfächer/.test(n.innerText || "");
  }
  function mitIframes(el) {
    let t = (el.innerText || "").trim();
    for (const f of el.querySelectorAll("iframe,frame")) { try { const b = f.contentDocument && f.contentDocument.body; if (b && b.innerText.trim()) t += "\n\n" + b.innerText.trim(); } catch (e) {} }
    return t;
  }
  function leseBereich() {
    for (const d of dokumente()) {
      const k = antwortKnopf(d); if (!k) continue;
      let best = null, n = k.parentElement;
      while (n && n !== d.body && n !== d.documentElement) {
        if (istZuGross(n)) break;
        best = n; n = n.parentElement;
      }
      if (best) { const t = mitIframes(best); if (t.length > 20) return t; }
    }
    return null;
  }
  // ---- IServ-Mail (Stand IServ 3, Nov. 2026): Lesebereich section.z-message, Liste li.message-list-entry
  const schatten = el => { try { return el.shadowRoot || (chrome.dom && chrome.dom.openOrClosedShadowRoot ? chrome.dom.openOrClosedShadowRoot(el) : null); } catch (e) { return null; } };
  function sichtText(el) {
    // innerText plus Inhalte in Shadow-DOM (IServ zeigt den Mailtext in einem Shadow-Root) und iframes
    let t = (el.innerText || "").trim();
    for (const k of el.querySelectorAll("*")) {
      if (/^ISERV-/.test(k.tagName)) continue;
      const r = schatten(k); if (!r) continue;
      for (const c of r.children) if (!/^(STYLE|SCRIPT|LINK)$/.test(c.tagName)) { const x = (c.innerText || c.textContent || "").trim(); if (x) t += "\n\n" + x; }
      for (const f of r.querySelectorAll("iframe")) { try { const x = f.contentDocument.body.innerText.trim(); if (x) t += "\n\n" + x; } catch (e) {} }
    }
    for (const f of el.querySelectorAll("iframe")) { try { const x = f.contentDocument.body.innerText.trim(); if (x) t += "\n\n" + x; } catch (e) {} }
    return t.replace(/\n{3,}/g, "\n\n");
  }
  const lesePane = () => document.querySelector("section.z-message, .message-view section.content");
  function iservMail() { const p = lesePane(); if (!p) return null; const t = sichtText(p); if (/Keine Nachricht ausgewählt/i.test(t) && t.length < 80) return null; return t.length > 10 ? t : null; }
  function markierteZeilen() {
    return [...document.querySelectorAll("li.message-list-entry")].filter(li =>
      [...li.querySelectorAll("input[type=checkbox],input.message-list-entry__checkbox")].some(c => c.checked) ||
      li.matches("[aria-selected=true],[aria-checked=true],.selected,.is-selected,.checked") ||
      !!li.querySelector("[aria-selected=true],[aria-checked=true]"));
  }
  const warte = ms => new Promise(r => setTimeout(r, ms));
  // IServ hebt beim Öffnen einer Mail die Strg-Auswahl auf und baut die Liste neu auf.
  // Darum: Links vorher merken, jede Mail über ihren Link frisch suchen und öffnen, am Ende die Auswahl wiederherstellen.
  const linkVon = li => { const a = li.querySelector("a[href]"); return a ? a.getAttribute("href") : null; };
  const zeileZu = h => [...document.querySelectorAll("li.message-list-entry a[href]")].find(a => a.getAttribute("href") === h);
  async function markierteMailsHolen(status) {
    const links = markierteZeilen().map(linkVon).filter(Boolean).slice(0, 15);
    if (links.length < 2) return null;
    const teile = [];
    for (let i = 0; i < links.length; i++) {
      status(`Hole Mail ${i + 1} von ${links.length} …`);
      const a = zeileZu(links[i]); if (!a) continue;
      const vorher = (lesePane() || {}).innerText || "";
      a.click();
      for (let w = 0; w < 30; w++) { await warte(150); const p = lesePane(); if (p && p.innerText !== vorher && p.innerText.trim().length > 10) break; }
      await warte(400);
      const t = iservMail(); if (t) teile.push(`=== Mail ${i + 1} ===\n` + t);
    }
    // Auswahl wiederherstellen: erste Mail normal, die anderen mit Strg+Klick
    status("Stelle deine Auswahl wieder her …");
    for (let i = 0; i < links.length; i++) {
      const a = zeileZu(links[i]); if (!a) continue;
      a.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window, ctrlKey: i > 0, metaKey: false }));
      await warte(i === 0 ? 500 : 150);
    }
    letzteAnzahl = links.length;
    return teile.length ? teile.join("\n\n") : null;
  }
  let letzteAnzahl = 0;

  async function textHolen(modus, status = () => {}) {
    for (const d of dokumente()) { const s = d.getSelection && String(d.getSelection() || "").trim(); if (s) return { text: s, quelle: "markierter Text" }; }
    if (modus === "mail" || modus === "mehrere" || modus === "uebersicht" || modus === "aufgaben") {
      const mehr = await markierteMailsHolen(status); if (mehr) return { text: mehr, quelle: letzteAnzahl + " markierte Mails", modus: "mehrere" };
    }
    if (modus === "mail" || modus === "mehrere" || modus === "aufgaben") {
      const t = iservMail() || (lesePane() ? null : leseBereich()); if (t) return { text: t, quelle: "geöffnete Mail" };
      if (lesePane()) return { text: "", quelle: "⚠ Keine Mail geöffnet. Bitte eine Mail öffnen oder mehrere mit Strg+Klick auswählen, dann „Neu holen“." };
    }
    if (modus === "uebersicht") {
      const z = [...document.querySelectorAll("li.message-list-entry")];
      if (z.length) return { text: z.map(li => (li.innerText || "").replace(/\s*\n\s*/g, " · ").trim()).join("\n"), quelle: z.length + " Zeilen der Mailliste" };
    }
    if (modus === "kalender") {
      // Kalenderraster (z. B. FullCalendar): Tageszellen tragen data-date="JJJJ-MM-TT" → Termine mit echtem Datum, ohne Kalenderliste am Rand
      const zellen = [...document.querySelectorAll("[data-date]")].filter(z => /^\d{4}-\d{2}-\d{2}/.test(z.getAttribute("data-date")) && !host.contains(z));
      const heute = new Date(); heute.setHours(0, 0, 0, 0);
      const tage = new Map();
      for (const z of zellen) {
        const d = z.getAttribute("data-date").slice(0, 10);
        const ev = [...z.querySelectorAll("a, .fc-event, [class*=event]")].map(e => (e.innerText || "").replace(/\s*\n\s*/g, " ").trim()).filter(Boolean);
        if (!ev.length) continue;
        const alt = tage.get(d) || []; for (const e of ev) if (!alt.includes(e)) alt.push(e); tage.set(d, alt);
      }
      if (tage.size) {
        const WT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
        const zeilen = [...tage.keys()].sort().filter(d => new Date(d) >= heute).map(d => { const dt = new Date(d); return `${WT[dt.getDay()]} ${dt.toLocaleDateString("de-DE")}:\n` + tage.get(d).map(e => "  - " + e).join("\n"); });
        if (zeilen.length) return { text: `Heute: ${heute.toLocaleDateString("de-DE")} (vergangene Tage weggelassen)\n\n` + zeilen.join("\n"), quelle: `${zeilen.length} Tage mit Terminen ab heute` };
      }
    }
    if (modus === "kalender" || modus === "stundenplan") {
      const k = document.querySelector("#app-mount, .page-content, #content, [role=main]") || document.body;
      const t = sichtText(k); if (t) return { text: t.length > 40000 ? t.slice(0, 40000) + "\n[… gekürzt]" : t, quelle: modus === "stundenplan" ? "Stundenplanseite" : "Kalenderansicht (Tipp: Listen- oder Wochenansicht nutzen)" };
    }
    const teile = [];
    for (const d of dokumente()) {
      if (!d.body) continue;
      const root = d === document ? (d.querySelector("main,[role=main],#content,.content") || d.body) : d.body;
      const t = (root.innerText || "").trim(); if (t) teile.push(t);
    }
    let text = teile.join("\n\n---\n\n").replace(/\n{3,}/g, "\n\n");
    if (text.length > 40000) text = text.slice(0, 40000) + "\n[… gekürzt]";
    return { text, quelle: modus === "mail" ? "ganze Seite (Mail nicht erkannt, besser vorher markieren)" : "ganze Seite" };
  }
  // ---- Seitenaufbau ohne Inhalte (zum Anpassen an andere IServ-Versionen)
  function aufbau() {
    const zeilen = [];
    const geh = (el, tiefe) => {
      if (zeilen.length > 2500 || tiefe > 25 || el === host) return;
      const cls = (typeof el.className === "string" ? el.className : "").trim().split(/\s+/).filter(Boolean).slice(0, 4).join(".");
      const t = (el.textContent || "").trim();
      const knopf = /^(BUTTON|A)$/.test(el.tagName) && ANTWORT_RE.test(t) ? " ←ANTWORTEN" : "";
      zeilen.push("  ".repeat(tiefe) + el.tagName.toLowerCase() + (el.id ? "#" + el.id.replace(/\d{3,}/g, "N") : "") + (cls ? "." + cls : "") + (el.getAttribute("role") ? "[role=" + el.getAttribute("role") + "]" : "") + ["aria-selected", "aria-checked", "aria-current"].filter(x => el.hasAttribute(x)).map(x => "[" + x + "=" + el.getAttribute(x) + "]").join("") + (el.tagName === "INPUT" && el.checked ? "[checked]" : "") + (schatten(el) ? "{shadow}" : "") + " (" + t.length + " Z.)" + knopf);
      if (el.tagName === "IFRAME") { try { if (el.contentDocument && el.contentDocument.body) geh(el.contentDocument.body, tiefe + 1); } catch (e) {} }
      for (const c of el.children) if (!/^(SCRIPT|STYLE|SVG|PATH|NOSCRIPT)$/i.test(c.tagName)) geh(c, tiefe + 1);
    };
    geh(document.body, 0);
    return "Schulassistenz-Helfer Seitenaufbau (ohne Inhalte) · " + location.pathname.replace(/[^/]*@[^/]*/g, "ADRESSE").replace(/\d+/g, "N") + "\n" + zeilen.join("\n");
  }

  // ---- zuletzt angeklicktes Textfeld merken (für den Rückweg)
  let letztesFeld = null;
  const istFeld = el => el && (el.isContentEditable || (el.tagName === "TEXTAREA") || (el.tagName === "INPUT" && /^(text|search|)$/i.test(el.type || "")));
  const gehoert = new WeakSet();
  function feldBeobachten() {
    for (const d of dokumente()) {
      if (gehoert.has(d)) continue; gehoert.add(d);
      d.addEventListener("focusin", e => { const el = e.composedPath ? e.composedPath()[0] : e.target; if (istFeld(el) && !host.contains(el)) letztesFeld = el; }, true);
    }
  }
  setInterval(feldBeobachten, 2000);

  // ---- Oberfläche im Shadow-DOM (unabhängig vom IServ-Layout)
  const host = document.createElement("div"); host.id = "sa-helfer-host";
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `<style>
    :host{all:initial;color-scheme:light}
    *{box-sizing:border-box;font-family:system-ui,"Segoe UI",sans-serif}
    .fab{position:fixed;right:18px;bottom:18px;z-index:2147483646;background:#2f5d50;color:#fff;border:0;border-radius:22px;padding:10px 14px;font-size:14px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,.25);cursor:pointer}
    .fab:hover{background:#244a40}
    .panel{color-scheme:light;position:fixed;right:18px;bottom:70px;z-index:2147483647;width:min(460px,calc(100vw - 36px));max-height:calc(100vh - 100px);overflow:auto;background:#fff;color:#1d2321;border:1px solid #c9d3cf;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.25);padding:14px;font-size:14px;display:none}
    .panel.offen{display:block}
    h2{font-size:16px;margin:0 0 8px;display:flex;justify-content:space-between;align-items:center}
    .x{background:none;border:0;font-size:20px;cursor:pointer;color:#555}
    .tabs{display:flex;gap:4px;margin-bottom:10px}
    .tabs button{flex:1;padding:7px;border:1px solid #c9d3cf;background:#f3f6f5;color:#1d2321;border-radius:8px;cursor:pointer;font-size:13px}
    .tabs button.an{background:#2f5d50;color:#fff;border-color:#2f5d50}
    label{display:block;font-size:12px;color:#4a5552;margin:8px 0 3px}
    select,textarea{width:100%;color:#1d2321;background:#fff;font-size:13px;border:1px solid #c9d3cf;border-radius:8px;padding:6px}
    textarea{min-height:150px;font-family:ui-monospace,Consolas,monospace;font-size:12px}
    .zeile{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
    .b{padding:8px 12px;border-radius:8px;border:1px solid #2f5d50;background:#2f5d50;color:#fff;cursor:pointer;font-size:13px}
    .b2{background:#fff;color:#2f5d50}
    .info{font-size:12px;color:#4a5552;margin-top:6px}
    .warn{background:#fff4e0;border:1px solid #f0c27a;border-radius:8px;padding:8px;font-size:12px;margin-top:6px}
    .ok{background:#e6f3ee;border:1px solid #9cc9b8;border-radius:8px;padding:8px;font-size:12px;margin-top:6px}
    .verdacht{max-height:140px;overflow:auto;border:1px solid #eee;border-radius:8px;padding:4px 6px;margin-top:4px}
    .verdacht label{display:flex;gap:6px;align-items:flex-start;margin:3px 0;color:#1d2321;font-size:12px}
    .verdacht b{background:#ffe1a8}
    a{color:#2f5d50}
    .ver{display:none}
    /* Dunkles Design passend zu IServ im Dark-Theme (und zu Chromes automatischem Dunkelmodus) */
    .panel.dunkel{color-scheme:dark;background:#1f2423;color:#e8eeec;border-color:#3a4442}
    .dunkel label,.dunkel .info{color:#b9c6c2}
    .dunkel .tabs button{background:#2a302f;color:#e8eeec;border-color:#3a4442}
    .dunkel .tabs button.an{background:#3d7a68;border-color:#3d7a68;color:#fff}
    .dunkel select,.dunkel textarea{background:#2a302f;color:#e8eeec;border-color:#3a4442}
    .dunkel .hilfe{background:#2a302f} .dunkel .hilfe b{color:#8fd1bb}
    .dunkel .verdacht{border-color:#3a4442} .dunkel .verdacht label{color:#e8eeec} .dunkel .verdacht b{background:#6b5520;color:#fff}
    .dunkel .b{background:#3d7a68;border-color:#3d7a68;color:#fff} .dunkel .b2{background:transparent;color:#8fd1bb;border-color:#8fd1bb}
    .dunkel .warn{background:#4a3a1c;border-color:#8a6a2a;color:#f3e3c3} .dunkel .ok{background:#1f3d33;border-color:#3d7a68;color:#d6efe6}
    .dunkel a{color:#8fd1bb} .dunkel .x{color:#b9c6c2}
    .hilfe{background:#f3f6f5;border-radius:8px;padding:8px 10px;margin-top:6px;font-size:12px;line-height:1.45}
    .hilfe div{margin:2px 0} .hilfe b{color:#2f5d50;display:inline-block;min-width:92px}
  </style>
  <button class="fab" title="Schulassistenz-Helfer">✉ An Claude</button>
  <div class="panel" role="dialog" aria-label="Schulassistenz-Helfer">
    <h2>Schulassistenz-Helfer <button class="x" title="Schließen">×</button></h2>
    <div class="tabs"><button data-t="hin" class="an">An Claude</button><button data-t="rueck">Antwort einsetzen</button></div>
    <div data-s="hin">
      <div class="keineListe warn" style="display:none">Noch keine Kürzelliste geladen. Ohne Liste werden nur Mailadressen und Verdachtsstellen ersetzt. <a href="#" class="zuEinst">Kürzelliste laden</a></div>
      <label>Was soll Claude tun?</label><select class="modus"></select>
      <div class="hilfe"></div>
      <div class="info quelleInfo"></div>
      <label>Bitte prüfen: Stellen, die nach Namen oder Personendaten aussehen (Haken = wird ersetzt)</label>
      <div class="verdacht"></div>
      <label>So geht es an Claude (du kannst hier noch ändern)</label>
      <textarea class="aus"></textarea>
      <div class="zeile"><button class="b senden">Kopieren und Claude öffnen</button><button class="b b2 kopieren">Nur kopieren</button><button class="b b2 neu">Neu holen</button></div>
      <div class="zeile"><button class="b b2 person" title="Im Textfeld oben einen Namen markieren, dann klicken">Markierten Namen überall ersetzen</button></div>
      <div class="meld"></div>
      <div class="info" style="margin-top:10px">Holt er den falschen Text? <a href="#" class="aufbau">Seitenaufbau kopieren (ohne Inhalte)</a> und Claude schicken.</div>
    </div>
    <div data-s="rueck" style="display:none">
      <label>1. Claudes Entwurf hier einfügen (mit Kürzeln)</label>
      <textarea class="rein" placeholder="Strg+V"></textarea>
      <div class="zeile"><button class="b einsetzen">Namen einsetzen</button></div>
      <label>2. Ergebnis mit echten Namen (bleibt auf diesem Rechner)</label>
      <textarea class="klar"></textarea>
      <div class="zeile"><button class="b insFeld">Ins Antwortfeld einsetzen</button><button class="b b2 klarKopieren">Kopieren</button></div>
      <div class="info">Vorher in IServ auf „Antworten“ klicken und einmal ins Textfeld klicken. Abschicken tust du selbst.</div>
      <div class="meld2"></div>
    </div>
  </div>`;
  (document.body || document.documentElement).appendChild(host);
  const $ = s => root.querySelector(s);
  const fab = $(".fab"), panel = $(".panel");
  if (!istIServ) fab.style.display = "none";

  let liste = [], ziel = "web", basis = null, auto = new Map();
  const autoSpeichern = () => chrome.storage.local.set({ personenAuto: Object.fromEntries(auto) });
  function laden(cb) {
    chrome.storage.local.get({ liste: [], ichName: "", ziel: "web", knopf: true, personenAuto: {} }, v => {
      liste = v.liste.slice();
      auto = new Map(Object.entries(v.personenAuto || {}));
      if (v.ichName.trim()) { const t = v.ichName.trim().split(/\s+/); const nach = t.pop(); P.addPerson(t.join(" "), nach, "L-ICH", liste); }
      ziel = v.ziel; if (istIServ && !v.knopf) fab.style.display = "none";
      cb && cb();
    });
  }
  laden();
  chrome.storage.onChanged.addListener(() => laden());

  for (const [k, t] of MODI) { const o = document.createElement("option"); o.value = k; o.textContent = t; $(".modus").appendChild(o); }

  function zeigeTab(t) {
    root.querySelectorAll(".tabs button").forEach(b => b.classList.toggle("an", b.dataset.t === t));
    root.querySelectorAll("[data-s]").forEach(s => s.style.display = s.dataset.s === t ? "" : "none");
  }
  root.querySelectorAll(".tabs button").forEach(b => b.onclick = () => zeigeTab(b.dataset.t));

  function hilfeZeigen() {
    const h = HILFE[$(".modus").value]; const box = $(".hilfe"); box.innerHTML = "";
    if (!h) return;
    [["1. Vorher du:", h[0]], ["2. Claude:", h[1]], ["3. Danach du:", h[2]]].forEach(([k, v]) => { const d = document.createElement("div"); const b = document.createElement("b"); b.textContent = k; d.append(b, " " + v); box.appendChild(d); });
  }
  function ausgabeBauen() {
    hilfeZeigen();
    if (!basis) return;
    const text = P.verdachtAnwenden(basis.text, basis.verdacht);
    const m = $(".modus").value;
    $(".aus").value = AUFTRAG[m] + (m === "frei" ? "\n\n" : "\n\n---\n") + text + (m === "frei" ? "" : "\n---\n[pseudonymisiert mit dem Schulassistenz-Helfer]");
  }
  function verdachtZeigen() {
    const v = $(".verdacht"); v.innerHTML = "";
    if (!basis.verdacht.length) v.innerHTML = `<div class="info">Keine weiteren Verdachtsstellen gefunden. Trotzdem kurz unten drüberlesen.</div>`;
    basis.verdacht.forEach(h => {
      const l = document.createElement("label"); const c = document.createElement("input"); c.type = "checkbox"; c.checked = true;
      c.onchange = () => { h.an = c.checked; ausgabeBauen(); };
      const t = basis.text, ctx = s => s.replace(/\s+/g, " ");
      const sp = document.createElement("span");
      sp.append(h.art + ": …" + ctx(t.slice(Math.max(0, h.s - 30), h.s))); const b = document.createElement("b"); b.textContent = h.txt; sp.append(b, ctx(t.slice(h.e, h.e + 30)) + "…");
      l.append(c, sp); v.appendChild(l);
    });
  }
  async function holen(vorgabe) {
    $(".quelleInfo").textContent = "Hole Text …";
    let roh = await textHolen($(".modus").value, t => $(".quelleInfo").textContent = t);
    if (vorgabe && roh.quelle !== "markierter Text") roh = { text: vorgabe, quelle: "markierter Text" };
    if (roh.modus === "mehrere" && $(".modus").value === "mail") $(".modus").value = "mehrere";
    basis = P.pseudonymisieren(roh.text, liste, auto);
    basis.roh = roh;
    if (basis.neu.length) autoSpeichern();
    basis.verdacht.forEach(h => h.an = true);
    $(".keineListe").style.display = liste.length ? "none" : "";
    $(".quelleInfo").textContent = `Quelle: ${roh.quelle} · ${basis.ersetzt} Namen ersetzt${basis.neu.length ? " (davon neu aus Kopfzeilen/Signatur: " + basis.neu.map(x => x[1]).join(", ") + ")" : ""} · ${basis.mails} Mailadressen ersetzt · ${basis.verdacht.length} Stellen zu prüfen`;
    verdachtZeigen();
    ausgabeBauen(); $(".meld").innerHTML = "";
  }
  $(".person").onclick = () => {
    const ta = $(".aus"); const name = ta.value.slice(ta.selectionStart, ta.selectionEnd).trim().replace(/\s+/g, " ");
    if (!name || name.length < 3 || !basis) { $(".meld").innerHTML = `<div class="warn">Bitte im Textfeld zuerst einen Namen markieren (z. B. „Anna Muster“).</div>`; return; }
    const form = P.namensForm(name);
    if (!auto.has(form)) { P.autoNeu(auto, form, new Set(liste.map(r => r.kurz))); autoSpeichern(); }
    const roh = basis.roh; basis = P.pseudonymisieren(roh.text, liste, auto); basis.roh = roh; basis.verdacht.forEach(h => h.an = true);
    verdachtZeigen(); ausgabeBauen(); $(".meld").innerHTML = `<div class="ok">„${form.replace(/[<>&]/g, "")}“ wird jetzt überall als ${auto.get(form)} ersetzt, auch in künftigen Mails.</div>`;
  };
  $(".modus").onchange = () => holen();
  $(".neu").onclick = () => holen();

  async function kopieren(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) { const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); const ok = document.execCommand("copy"); ta.remove(); return ok; }
  }
  function namenRest(text) {
    // Sicherheitsnetz: steht ein Name aus der Liste noch im Text (z. B. nach eigener Änderung)?
    const r = P.pseudonymisieren(text, liste, new Map(auto), { kopf: false }); return r.ersetzt;
  }
  $(".kopieren").onclick = async () => {
    const t = $(".aus").value; if (namenRest(t)) { $(".meld").innerHTML = `<div class="warn">Im Text steht noch ein Name aus deiner Kürzelliste. Bitte „Neu holen“ oder den Namen entfernen.</div>`; return; }
    await kopieren(t); $(".meld").innerHTML = `<div class="ok">Kopiert. In Claude mit Strg+V einfügen.</div>`;
  };
  $(".senden").onclick = async () => {
    const t = $(".aus").value; if (namenRest(t)) { $(".meld").innerHTML = `<div class="warn">Im Text steht noch ein Name aus deiner Kürzelliste. Bitte „Neu holen“ oder den Namen entfernen.</div>`; return; }
    await kopieren(t);
    if (ziel === "kopieren") { $(".meld").innerHTML = `<div class="ok">Kopiert. Jetzt in der Claude-App mit Strg+V einfügen.</div>`; return; }
    const url = t.length < 6000 ? "https://claude.ai/new?q=" + encodeURIComponent(t) : "https://claude.ai/new";
    chrome.runtime.sendMessage({ cmd: "tab", url });
    $(".meld").innerHTML = `<div class="ok">${t.length < 6000 ? "Claude ist mit dem Text geöffnet. Bitte dort auf Senden klicken." : "Claude ist geöffnet. Der Text ist lang, bitte dort mit Strg+V einfügen."}</div>`;
  };
  $(".aufbau").onclick = async e => { e.preventDefault(); await kopieren(aufbau()); $(".meld").innerHTML = `<div class="ok">Seitenaufbau kopiert (nur Bausteine, keine Texte oder Namen). In den Chat mit Claude einfügen.</div>`; };
  $(".zuEinst").onclick = e => { e.preventDefault(); chrome.runtime.sendMessage({ cmd: "einstellungen" }); };

  // ---- Rückweg
  $(".einsetzen").onclick = () => { const r = P.zurueck($(".rein").value, liste, auto); $(".klar").value = r.text; $(".meld2").innerHTML = `<div class="info">${r.n} Kürzel durch Namen ersetzt. Platzhalter wie [Name] bitte selbst füllen.</div>`; };
  $(".klarKopieren").onclick = async () => { await kopieren($(".klar").value); $(".meld2").innerHTML = `<div class="ok">Kopiert.</div>`; };
  $(".insFeld").onclick = () => {
    const t = $(".klar").value; const f = letztesFeld;
    if (!f || !f.isConnected) { kopieren(t); $(".meld2").innerHTML = `<div class="warn">Kein Antwortfeld gefunden. Der Text ist kopiert: ins Antwortfeld klicken und Strg+V drücken.</div>`; return; }
    f.focus();
    if (f.isContentEditable) { f.ownerDocument.execCommand("insertText", false, t); }
    else { const s = f.selectionStart ?? f.value.length; f.setRangeText(t, s, f.selectionEnd ?? s, "end"); f.dispatchEvent(new Event("input", { bubbles: true })); }
    $(".meld2").innerHTML = `<div class="ok">Eingesetzt. Bitte vor dem Abschicken lesen.</div>`;
  };

  function istDunkel() {
    const farbe = el => { const c = getComputedStyle(el).backgroundColor.match(/[\d.]+/g); return c && (c.length < 4 || +c[3] > 0) ? c.slice(0, 3).map(Number) : null; };
    const c = farbe(document.body) || farbe(document.documentElement) || [255, 255, 255];
    return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) < 128 || /dark/.test(document.body.className) || matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function oeffnen(auswahl) { panel.classList.toggle("dunkel", istDunkel()); panel.classList.add("offen"); zeigeTab("hin"); $(".modus").value = auswahl ? "frei" : modusRaten(); laden(() => holen(auswahl)); }
  fab.onclick = () => panel.classList.contains("offen") ? panel.classList.remove("offen") : oeffnen();
  $(".x").onclick = () => panel.classList.remove("offen");
  chrome.runtime.onMessage.addListener(m => { if (m && m.cmd === "oeffnen") oeffnen(m.auswahl); if (m && m.cmd === "rueck") { panel.classList.toggle("dunkel", istDunkel()); panel.classList.add("offen"); zeigeTab("rueck"); } });
})();
