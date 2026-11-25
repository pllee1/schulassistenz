/* Schulassistenz-Helfer – LEB-online, Klassenbewertungen
   Ab 0.40: Vorschläge von Claude zum Arbeits- und Sozialverhalten ins geöffnete Formular füllen (siehe „Vorschläge“ weiter unten).
   Der Helfer setzt nur die Felder Arbeitsverhalten, Sozialverhalten und die drei Bemerkungen. Er klickt nicht auf Speichern,
   ruft keine Adresse auf und löst keine Ereignisse der Seite aus. Gespeichert wird nur, wenn die Lehrkraft selbst auf Speichern klickt.
   Die Vorschläge enthalten nur Kürzel und liegen im Speicher des Helfers in diesem Browser. Namen setzt der Helfer erst hier im Formular ein.

   Ab 0.34: Aufbau und Textbausteine ablesen
   Vorstufe für „Claude schlägt AV/SV-Bemerkungen vor, der Helfer füllt vor“. Dieser Baustein liest nur die geöffnete Seite:
   Feldnamen, Feldarten und die Auswahllisten der Textbausteine (Texte der Schule mit Platzhalter, keine Schülerdaten).
   Er klickt nichts, ruft keine Adresse auf, ändert kein Feld und liest keine eingetragenen Werte. Überschriften werden unkenntlich
   gemacht (nur die Form bleibt), der Bericht läuft zusätzlich durch die Kürzelliste und verlässt den Browser nur, wenn du ihn kopierst. */
(() => {
  if (window.__saLebKb) return; window.__saLebKb = true;
  if (window.top !== window && !document.querySelector("form")) return;
  const form = [...document.forms].find(f => f.querySelector('[name*="verhalten"],[name*="textbaustein"],[name*="bemerkung"]'));
  if (!form) return;
  const maske = t => String(t || "").replace(/\s+/g, " ").trim().replace(/[A-Za-zÀ-ÿ]/g, "x").replace(/\d/g, "9").slice(0, 60);
  const zahlWeg = t => String(t || "").replace(/\d{3,}/g, "999");
  const pfad = u => { try { return new URL(u, location.href).pathname; } catch (e) { return ""; } };
  const BAUSTEIN = /textbaustein|verhalten|zeugnisart|abschlu/i;

  function bericht() {
    const z = [];
    z.push("LEB-online Klassenbewertung: Aufbau (ohne Werte) und Textbausteine");
    z.push("Seite: " + location.pathname + " · Parameter: " + [...new URL(location.href).searchParams.keys()].join(", "));
    z.push("Formular: " + (form.method || "get").toUpperCase() + " " + pfad(form.action) + " · Felder: " + form.elements.length);
    z.push(""); z.push("## Überschriften (unkenntlich, nur Form)");
    document.querySelectorAll("h1,h2,h3,h4,caption,legend,th").forEach(h => { const t = maske(h.textContent); if (t) z.push(h.tagName.toLowerCase() + (h.className ? "." + String(h.className).split(/\s+/)[0] : "") + ": " + t); });
    z.push(""); z.push("## Felder");
    const gesehen = new Set();
    for (const el of form.elements) {
      if (!el.name) continue;
      const name = el.name.replace(/\[\d+\]/g, "[n]"), art = el.tagName.toLowerCase() + (el.type && el.tagName === "INPUT" ? ":" + el.type : "");
      const k = name + "|" + art; if (gesehen.has(k)) continue; gesehen.add(k);
      const ereignisse = [...el.attributes].filter(a => /^on/.test(a.name)).map(a => a.name + "=" + zahlWeg(a.value).slice(0, 160));
      let label = ""; const l = el.id && document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
      if (l) label = l.textContent; else { const td = el.closest("td"); const vor = td && td.previousElementSibling; if (vor && !vor.querySelector("input,select,textarea")) label = vor.textContent; }
      label = String(label || "").replace(/\s+/g, " ").trim();
      // Beschriftung nur bei Einzelfeldern und nur, wenn sie nicht wie ein Name aussieht („Nachname, Vorname“)
      if (label.length > 45 || /\d{2,}/.test(label) || /\[\d+\]/.test(el.name) || /^[^,:]+,\s*\S+/.test(label)) label = "";
      z.push("- " + name + " | " + art + (el.tagName === "SELECT" ? " | " + el.options.length + " Einträge" : "") + (el.maxLength > 0 ? " | max " + el.maxLength : "")
        + (el.tagName === "TEXTAREA" ? " | " + (el.value ? "gefüllt" : "leer") : "") + (label ? " | Beschriftung: " + label : "") + (el.disabled || el.readOnly ? " | gesperrt" : "") + (ereignisse.length ? " | " + ereignisse.join(" ; ") : ""));
    }
    z.push(""); z.push("## Knöpfe");
    form.querySelectorAll('button,input[type=submit],input[type=button],a[onclick]').forEach(b => z.push("- " + b.tagName.toLowerCase() + ": " + String(b.value || b.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40) + (b.getAttribute("onclick") ? " | onclick=" + zahlWeg(b.getAttribute("onclick")).slice(0, 120) : "")));
    z.push(""); z.push("## Adressen in den Skripten der Seite");
    const adr = new Set(); document.querySelectorAll("script:not([src])").forEach(s => (s.textContent.match(/[\w\/.-]+\.php/g) || []).forEach(a => adr.add(a)));
    z.push([...adr].slice(0, 30).join(", ") || "keine");
    z.push(""); z.push("## Auswahllisten (Texte der Schule)");
    const listen = new Set();
    for (const el of form.elements) {
      if (el.tagName !== "SELECT" || !BAUSTEIN.test(el.name) || listen.has(el.name.replace(/\[\d+\]/g, "[n]"))) continue;
      listen.add(el.name.replace(/\[\d+\]/g, "[n]"));
      z.push("### " + el.name.replace(/\[\d+\]/g, "[n]"));
      for (const o of el.options) z.push(o.value + " = " + String(o.textContent || "").replace(/\s+/g, " ").trim().slice(0, 400));
    }
    return z.join("\n");
  }
  async function sicher(text) {
    // zusätzlich durch die Kürzelliste: sollte doch ein Name in einer Auswahlliste stehen, wird er zum Kürzel
    try {
      const v = await chrome.storage.local.get({ liste: [], ichName: "" });
      if (window.SAPseudo && v.liste.length) { const r = window.SAPseudo.pseudonymisieren(text, v.liste.slice()); return { text: r.text, ersetzt: r.ersetzt }; }
    } catch (e) {}
    return { text, ersetzt: 0 };
  }

  const host = document.createElement("div");
  const root = host.attachShadow({ mode: "closed" });
  root.innerHTML = `<style>
    :host{all:initial}
    .bar{color-scheme:dark;position:fixed;bottom:10px;right:10px;z-index:2147483647;width:min(460px,calc(100vw - 20px));max-height:calc(100vh - 20px);overflow:auto;background:#191816;color:#efe8da;border:1px solid #38342f;border-top:4px solid #8fb3e8;border-radius:10px;box-shadow:0 18px 50px rgba(0,0,0,.5);padding:10px 12px;font:13.5px/1.45 system-ui,"Segoe UI",sans-serif}
    h2{font:700 14.5px Georgia,serif;margin:0 0 6px;display:flex;gap:8px}h2 span{flex:1}
    .x{background:none;border:0;color:#aaa196;font-size:18px;cursor:pointer;padding:0 4px}
    p{margin:6px 0;color:#aaa196;font-size:12.5px}
    button.b{padding:7px 12px;border-radius:8px;border:1px solid #8fb3e8;background:#8fb3e8;color:#101a2b;font-weight:700;cursor:pointer;font-size:13px}
    textarea{width:100%;box-sizing:border-box;height:220px;background:#22201d;color:#efe8da;border:1px solid #38342f;border-radius:8px;font:12px Consolas,monospace;margin-top:8px}
    .ok{color:#8fcf9f}.warn{color:#e8b86a}
    textarea.kl{height:110px}select.w{background:#22201d;color:#efe8da;border:1px solid #38342f;border-radius:6px;padding:4px 6px;font:inherit}
    dl{display:grid;grid-template-columns:max-content 1fr;gap:4px 10px;margin:8px 0}dt{color:#aaa196}dd{margin:0;white-space:pre-wrap}
    button.g{padding:6px 10px;border-radius:8px;border:1px solid #38342f;background:#22201d;color:#efe8da;cursor:pointer;font-size:12.5px}
    details{margin-top:10px;border-top:1px solid #38342f;padding-top:6px}summary{cursor:pointer;color:#aaa196;font-size:12.5px}
    label.c{display:flex;gap:6px;align-items:center;color:#e8b86a;font-size:12.5px;margin:6px 0}
  </style><div class="bar"><h2><span>Schulassistenz: Arbeits- und Sozialverhalten</span><button class="x" title="Schließen">×</button></h2>
    <div id="vs"></div>
    <details id="vs-neu"><summary>Vorschläge von Claude einfügen oder ersetzen</summary>
      <p>Füge hier die Liste aus Claude ein (Kachel „Arbeits- und Sozialverhalten“). Eine Zeile je Kind, nur Kürzel:<br><code>I07 | AV: b | SV: c | AV-Bemerkung: … | SV-Bemerkung: … | Zeugnis: …</code></p>
      <textarea class="kl" id="vs-text" spellcheck="false"></textarea><button class="b" id="vs-ok">Vorschläge übernehmen</button> <button class="g" id="vs-weg">Alle löschen</button> <span id="vs-info"></span></details>
    <details><summary>Aufbau und Textbausteine ablesen (einmalig)</summary>
    <p>Einmalig, damit Claude passende AV/SV-Bausteine vorschlagen kann: Der Helfer liest den Aufbau dieses Formulars und die Auswahllisten der Textbausteine. Keine eingetragenen Werte, keine Namen. Er ändert und speichert nichts.</p>
    <button class="b" id="los">Aufbau und Textbausteine anzeigen</button>
    <div id="aus" hidden><textarea readonly></textarea><p id="info"></p><button class="b" id="kopie">In die Zwischenablage kopieren</button> <span class="ok" id="ok"></span></div></details></div>`;
  root.querySelector(".x").addEventListener("click", () => host.remove());
  root.querySelector("#los").addEventListener("click", async () => {
    const r = await sicher(bericht());
    root.querySelector("textarea").value = r.text; root.querySelector("#aus").hidden = false;
    root.querySelector("#info").textContent = "Bitte kurz durchsehen: Es dürfen keine Namen darin stehen" + (r.ersetzt ? " (" + r.ersetzt + " Namen aus deiner Kürzelliste wurden ersetzt)." : ".");
  });
  root.querySelector("#kopie").addEventListener("click", async () => {
    const t = root.querySelector("textarea"); try { await navigator.clipboard.writeText(t.value); } catch (e) { t.select(); document.execCommand("copy"); }
    root.querySelector("#ok").textContent = "kopiert";
  });
  /* ---- Vorschläge (ab 0.40) ---- */
  const esc = t => String(t == null ? "" : t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const KUERZEL = /^[A-Za-zÄÖÜ]{1,4}\d{1,3}$/;
  function lesen(text) {
    const aus = {}, fehler = [];
    for (const roh of String(text || "").split(/\r?\n/)) {
      const z = roh.replace(/^\s*[-*•]\s*/, "").trim(); if (!z || !z.includes("|")) continue;
      const teile = z.split("|").map(x => x.trim()), k = teile.shift().replace(/[*_`:]/g, "").trim();
      if (!KUERZEL.test(k)) { if (!/k(ü|ue)rzel/i.test(k) && !/^-+$/.test(k)) fehler.push(k.slice(0, 20)); continue; }
      const e = {};
      for (const t of teile) {
        const m = t.match(/^([^:]{1,25}):\s*([\s\S]*)$/); if (!m) continue;
        const name = m[1].toLowerCase().replace(/[^a-zäöü]/g, ""), wert = m[2].trim();
        if (name === "av" || name === "sv") { const b = (wert.match(/^[a-eA-E]\b/) || [""])[0].toLowerCase(); if (b) e[name] = b; }
        else if (/^avbem/.test(name)) e.avText = wert.slice(0, 1500);
        else if (/^svbem/.test(name)) e.svText = wert.slice(0, 1500);
        else if (/^zeugnis/.test(name)) e.zeugnis = wert.slice(0, 2000);
      }
      if (Object.keys(e).length) aus[k.toUpperCase()] = e;
    }
    return { aus, fehler };
  }
  const feld = n => form.elements[n];
  const stufe = (sel, b) => sel && b ? [...sel.options].find(o => new RegExp("^\\s*" + b + "\\s*[-–]", "i").test(o.textContent)) : null;
  const satz = o => o ? String(o.textContent).replace(/^\s*[a-e]\s*[-–]\s*/i, "").replace(/\s+/g, " ").trim() : "";
  let liste = [], daten = {}, wahl = "";
  const vorname = k => { const r = liste.find(x => x.kurz === k && /,\s/.test(x.orig)); return r ? r.orig.split(/,\s*/)[1] : ""; };
  // Kürzel im Text durch Namen ersetzen: das eigene Kürzel durch den Vornamen, andere über die Kürzelliste
  function klar(text, k) {
    let t = String(text || ""); const v = vorname(k);
    if (v) t = t.replace(new RegExp("(^|[^A-Za-z0-9ÄÖÜäöü])" + k + "(?![A-Za-z0-9])", "g"), "$1" + v);
    try { if (window.SAPseudo && liste.length) t = window.SAPseudo.zurueck(t, liste).text; } catch (e) {}
    return t;
  }
  function erkennen() {
    // Welches Kind zeigt das Formular? Sichtbaren Text der Seite (ohne Auswahllisten und Eingaben) durch die Kürzelliste schicken und nachsehen, welches Kürzel der Vorschläge vorkommt.
    const keys = Object.keys(daten); if (!keys.length || !window.SAPseudo || !liste.length) return "";
    const kopie = document.body.cloneNode(true); kopie.querySelectorAll("select,textarea,script,style,input").forEach(x => x.remove());
    // Textstücke einzeln sammeln, damit Namen in benachbarten Tabellenzellen nicht zusammenkleben
    const stuecke = [], lauf = document.createTreeWalker(kopie, NodeFilter.SHOW_TEXT); while (lauf.nextNode()) stuecke.push(lauf.currentNode.nodeValue);
    let t = ""; try { t = window.SAPseudo.pseudonymisieren(stuecke.join(" ").replace(/\s+/g, " ").slice(0, 20000), liste.slice()).text; } catch (e) { return ""; }
    const da = keys.filter(k => new RegExp("(^|[^A-Za-z0-9])" + k + "(?![A-Za-z0-9])").test(t));
    return da.length === 1 ? da[0] : "";
  }
  function plan(k) {
    const e = daten[k]; if (!e) return [];
    const p = [], av = feld("arbeitsverhalten_id"), sv = feld("sozialverhalten_id");
    const eins = (kurz, sel, ta, b, zusatz, titel) => {
      const o = stufe(sel, b);
      if (b && sel) p.push({ titel: titel, el: sel, neu: o ? o.value : null, zeigt: o ? o.textContent.trim() : "Stufe „" + b + "“ gibt es in der Liste nicht", fehlt: !o });
      if (ta && (zusatz || o)) p.push({ titel: titel + " Bemerkung", el: ta, neu: [o ? satz(o) : "", klar(zusatz, k)].filter(Boolean).join(" ") });
    };
    eins("av", av, feld("arbeitsverhalten_bemerkung"), e.av, e.avText, "Arbeitsverhalten");
    eins("sv", sv, feld("sozialverhalten_bemerkung"), e.sv, e.svText, "Sozialverhalten");
    if (e.zeugnis && feld("zeugnis_bemerkung")) p.push({ titel: "Bemerkungen (Zeugnis)", el: feld("zeugnis_bemerkung"), neu: klar(e.zeugnis, k) });
    return p;
  }
  function zeichnen(meldung, art) {
    const box = root.querySelector("#vs"), keys = Object.keys(daten).sort((a, b) => a.localeCompare(b, "de", { numeric: true }));
    if (!keys.length) { box.innerHTML = `<p>Noch keine Vorschläge im Helfer. Lass sie dir von Claude geben (Startseite, Kachel „Arbeits- und Sozialverhalten“) und füge sie unten ein.</p>`; root.querySelector("#vs-neu").open = true; return; }
    const p = plan(wahl), belegt = p.filter(x => !x.fehlt && x.el.value && x.el.value !== "0" && String(x.el.value).trim() !== String(x.neu).trim());
    box.innerHTML = `<p>${keys.length} Vorschläge im Helfer. Dieses Formular: <select class="w" id="vs-k"><option value="">Kürzel wählen …</option>${keys.map(k => `<option${k === wahl ? " selected" : ""}>${esc(k)}</option>`).join("")}</select>${wahl && vorname(wahl) ? " " + esc(vorname(wahl)) : ""}</p>`
      + (wahl ? (p.length ? `<dl>${p.map(x => `<dt>${esc(x.titel)}</dt><dd${x.fehlt ? ' class="warn"' : ""}>${esc(x.el.tagName === "SELECT" ? x.zeigt : x.neu)}</dd>`).join("")}</dl>`
          + (belegt.length ? `<label class="c"><input type="checkbox" id="vs-ers"> Im Formular steht schon etwas anderes (${belegt.map(x => esc(x.titel)).join(", ")}). Ersetzen.</label>` : "")
          + `<button class="b" id="vs-fuellen">Ins Formular füllen</button>` : `<p class="warn">Für ${esc(wahl)} steht nichts Verwertbares in den Vorschlägen.</p>`)
        : `<p class="warn">Der Helfer konnte das Kind auf dieser Seite nicht sicher erkennen. Bitte das Kürzel wählen.</p>`)
      + (meldung ? `<p class="${art || "ok"}">${esc(meldung)}</p>` : "") + `<p>Der Helfer speichert nichts. Bitte prüfen und selbst auf „Speichern“ klicken.</p>`;
    const k = box.querySelector("#vs-k"); if (k) k.addEventListener("change", () => { wahl = k.value; zeichnen(); });
    const b = box.querySelector("#vs-fuellen"); if (b) b.addEventListener("click", () => {
      const ers = box.querySelector("#vs-ers"); if (belegt.length && !(ers && ers.checked)) { zeichnen("Bitte zuerst „Ersetzen“ ankreuzen oder die Felder selbst ausfüllen.", "warn"); return; }
      let n = 0;
      for (const x of p) { if (x.fehlt) continue; x.el.value = x.neu; x.el.style.outline = "2px solid #8fb3e8"; n++; }   // nur Werte setzen: keine Ereignisse, keine Aufrufe
      zeichnen(n + " Felder gefüllt (blau umrandet), noch nicht gespeichert.", "ok");
    });
  }
  async function vsLaden() {
    try { const v = await chrome.storage.local.get({ liste: [], saLebKb: null }); liste = v.liste || []; daten = (v.saLebKb && v.saLebKb.eintraege) || {}; } catch (e) {}
    wahl = erkennen(); zeichnen();
  }
  root.querySelector("#vs-ok").addEventListener("click", async () => {
    const r = lesen(root.querySelector("#vs-text").value), n = Object.keys(r.aus).length, info = root.querySelector("#vs-info");
    if (!n) { info.className = "warn"; info.textContent = "Keine Zeile erkannt. Erwartet wird: Kürzel | AV: b | SV: c | …"; return; }
    daten = Object.assign({}, daten, r.aus);
    try { await chrome.storage.local.set({ saLebKb: { stand: Date.now(), eintraege: daten } }); } catch (e) {}
    info.className = "ok"; info.textContent = n + " übernommen" + (r.fehler.length ? ", nicht erkannt: " + r.fehler.slice(0, 5).join(", ") : "") + ".";
    root.querySelector("#vs-text").value = ""; wahl = wahl || erkennen(); zeichnen();
  });
  root.querySelector("#vs-weg").addEventListener("click", async () => { daten = {}; wahl = ""; try { await chrome.storage.local.remove("saLebKb"); } catch (e) {} root.querySelector("#vs-info").textContent = "gelöscht"; zeichnen(); });
  vsLaden();
  (document.body || document.documentElement).appendChild(host);
})();
