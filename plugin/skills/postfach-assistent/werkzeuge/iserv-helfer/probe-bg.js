/* Schulassistenz-Helfer · Schnittstellen-Probe (ab 0.29), Hintergrundteil.
   Zweck: einmalig herausfinden, über welche Datenadressen IServ und WebUntis ihre eigenen Seiten füllen,
   damit der Helfer später dort lesen kann statt vom Bildschirm.
   Notiert werden nur Adressen (Zahlen, Kennungen und Werte unkenntlich) und Feldnamen mit Datentyp.
   Inhalte (Texte, Namen, Zahlenwerte) werden gelesen, sofort verworfen und nie gespeichert.
   Die Probe stellt nur GET-Anfragen (lesen) und eine CalDAV-Abfrage nach Kalenderordnern. Sie verschickt nichts:
   Der Bericht bleibt in diesem Browser, bis die Lehrkraft ihn selbst kopiert. */
const PR_MAX_MS = 15 * 60 * 1000;
const prSess = chrome.storage.session || chrome.storage.local;
let prKette = Promise.resolve();
const prSeriell = f => (prKette = prKette.catch(() => {}).then(f));
const prPause = ms => new Promise(r => setTimeout(r, ms));
const prUrsprung = t => { try { const u = new URL(/^https?:\/\//i.test(t) ? t : "https://" + t); return u.protocol === "https:" ? u.origin : ""; } catch (e) { return ""; } };

/* ---------- Unkenntlich machen ---------- */
const PR_PARAM = /^[A-Za-z_][\w.\[\]-]{0,39}$/;
function prWert(v, k, pfad) {
  if (v === "") return "";
  if (/reports\.do$/i.test(pfad || "") && /^name$/i.test(k || "") && /^[A-Za-z]{3,40}$/.test(v)) return v;                   // Name des Berichts
  if (/^format$/i.test(k || "") && /^(pdf|csv|xlsx?|json|ics|html?|txt|xml)$/i.test(v)) return v.toLowerCase();   // Exportformat
  if (/^(true|false)$/.test(v)) return v;
  if (/^[A-Z][A-Z_]{1,23}$/.test(v)) return v;                       // Aufzählungen wie TEACHER, MY_TIMETABLE
  if (/^\d{4}-?\d{2}-?\d{2}(T.*)?$/.test(v) || /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(v) || /^1\d{12}$/.test(v)) return "<datum>";
  if (/^-?\d+$/.test(v)) return "<n>";
  return "<…>";
}
function prMaskPfad(pfad) {
  let frei = true;
  return pfad.split("/").map(s => {
    if (!s) return s;
    let d; try { d = decodeURIComponent(s); } catch (e) { d = s; }
    if (!frei) return "<…>";
    if (/^(caldav|carddav|webdav)$/i.test(d)) { frei = false; return d; }
    if (/^\d+$/.test(d)) return "<n>";
    if (/\./.test(d) && !/^[\w-]+\.(do|json|php|ics|xml|html?|txt|csv)$/i.test(d)) return "<…>";   // z. B. vorname.nachname
    if (/[@!:#$ ,;=+~%]/.test(d) || /\d{4,}/.test(d) || /^[0-9a-f-]{16,}$/i.test(d) || d.length > 40 || /[^\x21-\x7e]/.test(d)) return "<…>";
    return d;
  }).join("/");
}
function prMaskUrl(url, ziel) {
  let u; try { u = new URL(url); } catch (e) { return null; }
  let wo;
  if (ziel.iserv && u.origin === ziel.iserv) wo = "IServ";
  else if (ziel.wu && u.origin === ziel.wu) wo = "WebUntis";
  else if (ziel.leb && u.origin === ziel.leb) wo = "LEB";
  else if (ziel.iserv && u.hostname.endsWith("." + new URL(ziel.iserv).hostname)) wo = u.hostname.slice(0, -new URL(ziel.iserv).hostname.length - 1).replace(/[^a-z0-9.-]/gi, "").slice(0, 30) + ".IServ";
  else if (/\.webuntis\.com$/i.test(u.hostname)) wo = "WebUntis(andere Adresse)";
  else wo = "fremd:" + u.hostname.replace(/[^a-z0-9.-]/gi, "").slice(0, 60);
  const namen = [...new Set([...u.searchParams.keys()])].sort();
  const q = namen.map(k => (PR_PARAM.test(k) ? k : "<…>") + "=" + [...new Set(u.searchParams.getAll(k).map(v => prWert(v, k, u.pathname)))].join("|"));
  const pfad = prMaskPfad(u.pathname);
  return { wo, pfad, text: wo + " " + pfad + (q.length ? " ?" + q.join(" &") : ""), sig: wo + " " + pfad + "?" + namen.map(k => PR_PARAM.test(k) ? k : "<…>").join("&") };
}

/* ---------- Form einer Antwort: nur Feldnamen und Datentypen ---------- */
const PR_FELD = /^[a-z_$@][A-Za-z0-9_$-]{0,39}$/;
function prText(s) {
  if (!s) return "text(leer)";
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return "text(datum+zeit)";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s) || /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(s) || /^\d{8}$/.test(s)) return "text(datum)";
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(s)) return "text(uhrzeit)";
  if (/^https?:\/\//.test(s)) return "text(adresse)";
  if (/^#[0-9a-f]{3,8}$/i.test(s)) return "text(farbe)";
  if (/^-?\d+$/.test(s)) return "text(ziffern)";
  if (/<[a-z][^>]*>/i.test(s)) return "text(html)";
  if (/^[A-Z][A-Z0-9_]{1,30}$/.test(s)) return "text(GROSSWORT)";
  return s.length > 200 ? "text(lang)" : "text";
}
const prZahl = n => Number.isInteger(n) ? (n >= 19000101 && n <= 21001231 ? "zahl(datum?)" : n >= 1e12 && n < 3e12 ? "zahl(zeitstempel?)" : "zahl") : "kommazahl";
const prNeu = () => ({ t: new Set(), o: null, a: null, n: 0, m: null, mn: 0 });
function prAdd(k, v, tiefe) {
  if (v === null || v === undefined) { k.t.add("null"); return; }
  if (Array.isArray(v)) { k.a = k.a || prNeu(); k.n = Math.max(k.n, v.length); if (tiefe < 8) for (const x of v.slice(0, 25)) prAdd(k.a, x, tiefe + 1); return; }
  if (typeof v === "object") {
    const keys = Object.keys(v);
    if (keys.length > 40 || keys.some(s => !PR_FELD.test(s))) {      // Schlüssel könnten Daten sein (Kennungen, Namen): nicht notieren
      k.m = k.m || prNeu(); k.mn = Math.max(k.mn, keys.length);
      if (tiefe < 8) for (const s of keys.slice(0, 25)) prAdd(k.m, v[s], tiefe + 1);
      return;
    }
    k.o = k.o || new Map();
    for (const s of keys) { if (!k.o.has(s)) k.o.set(s, prNeu()); if (tiefe < 8) prAdd(k.o.get(s), v[s], tiefe + 1); }
    return;
  }
  k.t.add(typeof v === "string" ? prText(v) : typeof v === "number" ? prZahl(v) : typeof v === "boolean" ? "bool" : "anderes");
}
function prZeig(k, ein) {
  const teile = [...k.t].sort();
  if (k.o) teile.push(k.o.size ? "{\n" + [...k.o].map(([s, x]) => ein + "  " + s + ": " + prZeig(x, ein + "  ")).join("\n") + "\n" + ein + "}" : "{}");
  if (k.m) teile.push("{<Schlüssel> ×" + k.mn + ": " + prZeig(k.m, ein) + "}");
  if (k.a) teile.push("[" + (k.n ? prZeig(k.a, ein) : "") + "] ×" + k.n);
  return teile.join(" | ") || "leer";
}
function prForm(wert, ein) { const k = prNeu(); prAdd(k, wert, 0); return prZeig(k, ein || "    "); }
function prInhalt(typ, text) {
  const t = text.replace(/^﻿/, "").trimStart();
  if (/json/i.test(typ) || /^[{\[]/.test(t)) { try { return "JSON " + prForm(JSON.parse(t)); } catch (e) {} }
  if (/xml/i.test(typ) || /^<\?xml/.test(t)) return "XML mit den Elementen: " + [...new Set([...t.matchAll(/<([A-Za-z][\w:.-]{0,40})[\s>\/]/g)].map(m => m[1]))].slice(0, 40).join(", ");
  if (/html/i.test(typ) || /^<(!doctype|html)/i.test(t)) return "HTML-Seite" + (/type=["']?password|j_username|name=["']?_password/i.test(t) ? " (sieht nach Anmeldeseite aus)" : "");
  if (/calendar/i.test(typ) || /^BEGIN:VCALENDAR/.test(t)) return "iCal-Kalender";
  if (/^[\w-]+\.[\w-]+\.[\w-]+$/.test(t.trim()) && t.length > 60) return "Kennung (Token)";
  return "anderes Format";
}
async function prLesen(url, opt) {
  const ab = new AbortController(); const zeit = setTimeout(() => ab.abort(), 15000);
  try {
    const r = await fetch(url, { credentials: "include", cache: "no-store", redirect: "follow", ...opt, signal: ab.signal });
    const typ = (r.headers.get("content-type") || "").split(";")[0].trim();
    if (/^(image|audio|video|font)\//i.test(typ)) return { status: r.status, typ, groesse: 0, form: "Mediendatei (nicht gelesen)", text: "" };
    const text = (await r.text()).slice(0, 4e6);
    return { status: r.status, typ, groesse: text.length, form: text ? prInhalt(typ, text) : "leer", text, umgeleitet: r.redirected };
  } catch (e) { return { status: 0, typ: "", groesse: 0, form: "keine Antwort (" + (e && e.name === "AbortError" ? "Zeit abgelaufen" : "Netzwerkfehler") + ")", text: "" }; }
  finally { clearTimeout(zeit); }
}
const prZeile = (titel, a) => titel + "\n  → " + (a.status || "–") + (a.typ ? " " + a.typ.replace(/[^\w/+.-]/g, "") : "") + (a.groesse ? ", " + (a.groesse < 1024 ? a.groesse + " Zeichen" : Math.round(a.groesse / 1024) + " KB") : "") + (a.umgeleitet ? ", umgeleitet" : "") + "\n    " + a.form;

/* ---------- Aufzeichnung: welche Datenadressen rufen die Seiten selbst auf? ---------- */
const prZustand = async () => {
  const { saProbe } = await prSess.get("saProbe");
  return saProbe && Date.now() - saProbe.zeit < PR_MAX_MS ? saProbe : null;
};
const prKoerper = new Map();   // requestId → Form des gesendeten Inhalts (nur Feldnamen)
async function prMerken(e) {
  await prSeriell(async () => {
    const z = await prZustand(); if (!z) return;
    const m = prMaskUrl(e.url, z); if (!m) return;
    if (m.wo !== "IServ" && m.wo !== "WebUntis" && !e.extern) return;
    const { saProbeFunde = [] } = await prSess.get("saProbeFunde");
    const key = (e.m || "?") + " " + m.sig;
    let f = saProbeFunde.find(x => x.key === key);
    if (f) { f.n++; if (e.status && !f.status) { f.status = e.status; f.typ = e.typ; } if (e.koerper && !f.koerper) f.koerper = e.koerper; }
    else if (saProbeFunde.length < 400) saProbeFunde.push(f = { key, m: e.m || "?", url: e.url, text: m.text, wo: m.wo, status: e.status || 0, typ: e.typ || "", n: 1, koerper: e.koerper || "", extern: !!e.extern });
    await prSess.set({ saProbeFunde });
  });
}
const PR_FILTER = { urls: ["https://*.webuntis.com/*", "https://*/iserv/*"], types: ["xmlhttprequest", "sub_frame"] };
const prEigen = r => r.tabId < 0 && r.initiator && r.initiator.startsWith("chrome-extension://");
if (chrome.webRequest && chrome.webRequest.onBeforeRequest) {
  chrome.webRequest.onBeforeRequest.addListener(r => {
    if (prEigen(r) || r.method === "GET" || !r.requestBody) return;
    let form = "";
    try {
      if (r.requestBody.formData) form = "Formular mit den Feldern: " + Object.keys(r.requestBody.formData).map(k => PR_PARAM.test(k) ? k : "<…>").join(", ");
      else if (r.requestBody.raw && r.requestBody.raw[0] && r.requestBody.raw[0].bytes) form = prInhalt("", new TextDecoder().decode(r.requestBody.raw[0].bytes).slice(0, 2e5));
    } catch (e) {}
    if (form) { prKoerper.set(r.requestId, form); if (prKoerper.size > 300) prKoerper.delete(prKoerper.keys().next().value); }
  }, PR_FILTER, ["requestBody"]);
  chrome.webRequest.onCompleted.addListener(r => {
    if (prEigen(r)) return;
    const koerper = prKoerper.get(r.requestId) || ""; prKoerper.delete(r.requestId);
    const typ = ((r.responseHeaders || []).find(h => /^content-type$/i.test(h.name)) || {}).value || "";
    prMerken({ m: r.method, url: r.url, status: r.statusCode, typ: typ.split(";")[0].trim(), koerper }).catch(() => {});
  }, PR_FILTER, ["responseHeaders"]);
}

/* ---------- Automatischer Rundgang (ab 0.30, mit Untermenüs und LEB-online ab 0.31) ----------
   Geht in einem Tab nacheinander die Menüseiten von IServ, WebUntis und LEB-online durch, damit die Aufzeichnung alle
   Bereiche sieht, ohne dass die Lehrkraft jede Seite selbst anklickt. Von jeder besuchten Seite werden die dort
   sichtbaren Menü-, Reiter- und Unterpunkt-Links eingesammelt und ebenfalls besucht (bis zur eingestellten Tiefe).
   Es werden nur Seiten geöffnet (wie ein Klick auf einen Link), keine Knöpfe gedrückt und keine Formulare abgeschickt.
   Adressen, die nach Abmelden, Löschen, Anlegen, Senden, Herunterladen o. Ä. aussehen, werden ausgelassen.
   LEB-online: nur Listen-Seiten (index.php), nie form.php oder Adressen mit „del“, und nur im schon offenen LEB-Tab,
   weil LEB nur eine Anmeldung gleichzeitig verträgt. Von jeder Seite werden nur Beschriftungen der Bedienoberfläche
   notiert (Überschriften, Reiter, Knöpfe, Tabellenspalten, Feldnamen, Exportmöglichkeiten), keine Tabelleninhalte. */
const PR_NICHT = /(log-?out|abmeld|sign-?out|delete|remove|l(oe|ö|%C3%B6)sch|sudo|\/su([\/?#]|$)|admin|switch|locale|toggle|dismiss|download|export|print|\.pdf|\.zip|\.csv|\.xlsx?|\/new([\/?#]|$)|create|\/add([\/?#]|$)|edit|upload|import|send|compose|write|reset|password|passwort|2fa|token|oauth|saml|impersonat|profil|entfern|rss|feed|atom|\.xml|\.ics|ical|webcal|\.do\?.*format=|archiv(e|ier)|[?&]del(=|&|$)|mark|read=|hide|ausblend|subscribe|accept|decline|reject|confirm|vote|join|leave|complete|erledig|annehm|ablehn|best(ae|ä|%C3%A4)tig|\/help([\/?#]|$))/i;
const PR_SYS = {
  IServ: { max: 90, tiefe: 2 },
  WebUntis: { max: 50, tiefe: 3 },
  LEB: { max: 30, tiefe: 3 }
};
// Macht aus einem Link ein Besuchsziel mit Schlüssel (gleichartige Seiten zählen nur einmal) oder null
function prZiel(sys, origin, l) {
  let u; try { u = new URL(l.href); } catch (e) { return null; }
  if (u.origin !== origin) return null;
  const ohneSid = new URLSearchParams(u.search); ohneSid.delete("sid");
  if (PR_NICHT.test(u.pathname + "?" + ohneSid.toString() + u.hash)) return null;
  if (/\.(js|css|png|jpe?g|gif|svg|ico|woff2?|ttf)$/i.test(u.pathname)) return null;
  const muster = p => p.split("/").map(s => /\d/.test(s) && !/^v\d$/i.test(s) ? "#" : s).join("/");
  let key, href;
  if (sys === "IServ") {
    const m = u.pathname.match(/^\/iserv\/([^\/]+)/);
    if (!m || u.search || /^(app|auth|public|css|js|assets|static|login|logo|help|du)$/i.test(m[1])) return null;
    // Keine Einzeleinträge öffnen (eine Mail, ein Forenbeitrag, eine Nachricht): Das Öffnen könnte sie als gelesen markieren, und ihr Titel gehört nicht in den Bericht
    if (u.pathname.split("/").some(t => /\d/.test(t) && !/^v\d$/i.test(t))) return null;
    if (m[1] === "file" && u.pathname.replace(/\/$/, "").split("/").length > 5) return null;                             // Dateien: nur die oberste Ebene, keine Ordner der Lehrkraft
    key = muster(u.pathname.replace(/\/$/, "")); href = u.origin + u.pathname;
  } else if (sys === "LEB") {
    if (!/\/lernstandskontrolle\//i.test(u.pathname) || !/(\/|\/index\.php)$/i.test(u.pathname)) return null;
    if ([...ohneSid.keys()].some(k => !/(_id|^id|halbjahr|jahr|seite|page|sort|order)$/i.test(k))) return null;        // nur Auswahl-Parameter, nichts, was etwas auslösen könnte
    key = u.pathname + "?" + [...new Set(ohneSid.keys())].sort().join("&"); href = u.toString();
  } else {
    key = muster(u.pathname.replace(/\/$/, "")) + muster(u.hash.split("?")[0]);
    if (key === "" || /^\/WebUntis$/i.test(key)) return null;
    href = u.origin + u.pathname + u.search + u.hash;
  }
  // Beschriftung nur von Menüpunkten übernehmen; bei Links aus dem Seiteninhalt könnte sie ein Titel oder Name sein
  return { key: sys + " " + key, href, text: !l.menue || /[:@\d]/.test(l.text || "") || String(l.text || "").length > 32 ? "" : String(l.text || "").replace(/\s+/g, " ").trim() };
}
// Die folgenden zwei Funktionen laufen in der Seite (chrome.scripting) und müssen ohne äußere Namen auskommen.
function prSeiteMenue() {
  const MENUE = "nav, aside, [role=navigation], [role=menu], [role=menubar], [role=tablist], [class*=sidebar], [class*=Sidebar], [class*=menu], [class*=Menu], [class*=nav-], [class*=subnav], [class*=tabs]";
  const INHALT = "tbody, [role=row], [role=grid], [role=listitem], [role=article], article, .message, mat-row";
  const sauber = s => (s || "").replace(/\s+/g, " ").trim();
  const links = () => {
    const out = [];
    for (const a of document.querySelectorAll("a[href]")) {
      const t = sauber(a.innerText || a.getAttribute("title") || a.getAttribute("aria-label")).slice(0, 40);
      const imMenue = !!a.closest(MENUE) && !a.closest(INHALT);
      if (/hauptinhalt|skip to/i.test(t)) continue;
      if (!imMenue && (a.closest(INHALT) || t.length < 3 || t.length > 32 || /\d|@/.test(t))) continue;   // Links im Inhalt nur mit kurzer Beschriftung, nie aus Tabellen und Listen
      out.push({ href: a.href, text: t, menue: imMenue });
      if (out.length >= 600) break;
    }
    return out;
  };
  // Eingeklappte Menügruppen aufklappen (nur in Menübereichen), damit Unterpunkte sichtbar werden
  const zu = [...document.querySelectorAll("[aria-expanded=false]")].filter(el => el.closest(MENUE) && !el.closest(INHALT) && !/^(select|input|textarea)$/i.test(el.tagName)).slice(0, 30);
  for (const el of zu) { try { el.click(); } catch (e) {} }
  return new Promise(r => setTimeout(() => r({ links: links(), aufgeklappt: zu.length, anmeldung: !!document.querySelector("input[type=password]") }), zu.length ? 900 : 50));
}
function prSeiteFakten() {
  const INHALT = "tbody, [role=row], [role=grid], [role=listitem], [role=article], article, .message, mat-row";
  const sauber = s => (s || "").replace(/\b[a-z]+(_[a-z]+)+\b/g, " ").replace(/\s+/g, " ").trim();      // Symbol-Namen wie keyboard_arrow_down weglassen
  const gut = s => s.length >= 3 && s.length <= 32 && !/\d/.test(s) && !/@/.test(s);
  const sammeln = (sel, max, auchInhalt) => { const set = new Set(); for (const el of document.querySelectorAll(sel)) { if (!auchInhalt && el.closest(INHALT)) continue; const t = sauber(el.innerText || el.value || el.getAttribute("aria-label") || el.getAttribute("title")); if (gut(t)) set.add(t); if (set.size >= max) break; } return [...set]; };
  const exporte = [];
  for (const a of document.querySelectorAll("a[href]")) {
    if (a.closest(INHALT)) continue;
    const h = a.href || "", t = sauber(a.innerText || a.title);
    if (/reports\.do|[?&]format=|\.(pdf|csv|xlsx?)(\?|$)|export|download/i.test(h) || /^(pdf|csv|excel|export\w*|drucken|bericht\w*)$/i.test(t)) exporte.push({ href: /^https:/.test(h) ? h.slice(0, 600) : "", text: gut(t) ? t : "" });
    if (exporte.length >= 25) break;
  }
  for (const b of document.querySelectorAll("button,[role=button],input[type=button],input[type=submit]")) {
    if (b.closest(INHALT)) continue;
    const t = sauber(b.innerText || b.value || b.title || b.getAttribute("aria-label"));
    if (/pdf|csv|excel|export|drucken|bericht/i.test(t) && gut(t) && exporte.length < 40) exporte.push({ href: "", text: t });
  }
  // Namen der Formularfelder (technische Bezeichner, keine Werte); Zähler in eckigen Klammern vereinheitlicht
  const namen = new Set();
  for (const el of document.querySelectorAll("input[name], select[name], textarea[name]")) {
    const n = (el.getAttribute("name") || "").replace(/\[\d+\]/g, "[n]").replace(/\d{3,}/g, "N");
    if (!/^[A-Za-z_][\w\[\]-]{1,40}$/.test(n) || (el.type || "").toLowerCase() === "hidden" && /sid|token|csrf/i.test(n)) continue;
    namen.add(n + (el.tagName === "SELECT" ? " (Auswahl, " + el.options.length + ")" : el.tagName === "TEXTAREA" ? " (Text)" : el.type && !/^text$/i.test(el.type) ? " (" + el.type.toLowerCase() + ")" : ""));
    if (namen.size >= 40) break;
  }
  return { eingebettet: window !== top, anmeldung: !!document.querySelector("input[type=password]"), h: sammeln("h1,h2", 4), reiter: sammeln("[role=tab], .nav-tabs a, .tabs a", 12),
    knoepfe: sammeln("button, a.btn, [role=button], input[type=submit], input[type=button]", 20), spalten: sammeln("th, [role=columnheader]", 25, true), felder: sammeln("label", 20), namen: [...namen], exporte,
    zeilen: document.querySelectorAll("tbody tr, [role=row]").length };
}
async function prSkript(tabId, func, alle) {
  try { const r = await chrome.scripting.executeScript({ target: { tabId, allFrames: !!alle }, func }); return r.map(x => x.result).filter(Boolean); } catch (e) { return []; }
}
function prLaden(tabId, url) {
  return new Promise(res => {
    let fertig = false;
    const ende = () => { if (fertig) return; fertig = true; chrome.tabs.onUpdated.removeListener(h); clearTimeout(t); res(); };
    const h = (id, info) => { if (id === tabId && info.status === "complete") ende(); };
    chrome.tabs.onUpdated.addListener(h);
    const t = setTimeout(ende, 10000);
    chrome.tabs.update(tabId, { url }).catch(ende);
  });
}
// Ein System abgehen: Startseite lesen, Links einsammeln, Seite für Seite besuchen, dabei neue Unterpunkte nachtragen
async function prAbgehen(sys, origin, start, tabId, seiten, melden, tabNeu) {
  const tabDa = async () => { try { await chrome.tabs.get(tabId); return true; } catch (e) { return false; } };
  const grenze = PR_SYS[sys];
  const funde = async () => ((await prSess.get("saProbeFunde")).saProbeFunde || []);
  const kopf = { sys, kopf: true, links: 0, ziele: 0, aufgeklappt: 0, anmeldung: false, offen: 0 };
  seiten.push(kopf);
  const gesehen = new Set(), schlange = [];
  const eintragen = (links, tiefe) => {
    for (const l of links) { const z = prZiel(sys, origin, l); if (!z || gesehen.has(z.key)) continue; gesehen.add(z.key); schlange.push({ ...z, tiefe }); }
  };
  const lesen = async tiefe => {
    const teile = await prSkript(tabId, prSeiteMenue, true);
    const links = teile.flatMap(t => t.links || []);
    kopf.links += links.length; kopf.aufgeklappt += teile.reduce((n, t) => n + (t.aufgeklappt || 0), 0);
    if (tiefe <= grenze.tiefe) eintragen(links.filter(l => l.menue).concat(links.filter(l => !l.menue)), tiefe);
    return teile.some(t => t.anmeldung);
  };
  await melden(sys + ": Menü lesen");
  if (start) { await prLaden(tabId, start); await prPause(3500); }
  kopf.anmeldung = await lesen(1);
  if (sys === "WebUntis") {                                                           // gemerkte Berichtsseite der Fehlzeiten-Ampel mit besuchen
    const { saWuSeite } = await chrome.storage.local.get("saWuSeite");
    if (typeof saWuSeite === "string") eintragen([{ href: saWuSeite, text: "Berichte (gemerkte Seite)", menue: true }], 1);
  }
  let i = 0;
  while (schlange.length && i < grenze.max) {
    if (!(await prZustand())) break;                                                   // abgebrochen
    if (!(await tabDa())) {                                                           // Tab wurde geschlossen (von der Seite oder von Hand)
      kopf.tabVerloren = (kopf.tabVerloren || 0) + 1;
      if (!tabNeu || kopf.tabVerloren > 3) { kopf.abbruch = true; break; }
      tabId = await tabNeu();
    }
    const zl = schlange.shift(); i++;
    await melden(sys + ": Seite " + i + " (noch " + schlange.length + " bekannt)");
    await prSeriell(async () => { const z = await prZustand(); if (z) await prSess.set({ saProbe: { ...z, zeit: Date.now() } }); });   // Aufzeichnung läuft weiter
    const vor = new Set((await funde()).map(f => f.key));
    await prLaden(tabId, zl.href); await prPause(1800); await prKette.catch(() => {});
    if (!(await tabDa())) { seiten.push({ sys, text: zl.text, url: zl.href, gelandet: "", tiefe: zl.tiefe, fakten: [], daten: [], zu: true }); await prSess.set({ saProbeTour: seiten }); continue; }
    const fakten = await prSkript(tabId, prSeiteFakten, true);
    await lesen(zl.tiefe + 1);
    let gelandet = ""; try { gelandet = (await chrome.tabs.get(tabId)).url || ""; } catch (e) {}
    seiten.push({ sys, text: zl.text, url: zl.href, gelandet, tiefe: zl.tiefe, fakten, daten: (await funde()).filter(f => !vor.has(f.key)).map(f => f.m + " " + f.text).slice(0, 15) });
    await prSess.set({ saProbeTour: seiten });
  }
  kopf.ziele = i; kopf.offen = schlange.length;
}
async function prRundgang(zurueckTab) {
  const z = await prZustand(); if (!z) return;
  await chrome.storage.local.set({ saProbeAn: Date.now() });
  const melden = t => prSess.set({ saProbeTourLauf: { text: t, zeit: Date.now() } });
  const seiten = [];
  await melden("Tab wird geöffnet");
  let tab = null;
  try {
    if (z.iserv || z.wu) {
      tab = await chrome.tabs.create({ url: "about:blank", active: true });
      const tabNeu = async () => { tab = await chrome.tabs.create({ url: "about:blank", active: true }); return tab.id; };
      if (z.iserv) await prAbgehen("IServ", z.iserv, z.iserv + "/iserv/", tab.id, seiten, melden, tabNeu);
      try { await chrome.tabs.get(tab.id); } catch (e) { await tabNeu(); }
      if (z.wu) await prAbgehen("WebUntis", z.wu, z.wu + "/WebUntis/", tab.id, seiten, melden, tabNeu);
    }
    if (z.leb) {
      // LEB-online verträgt nur eine Anmeldung: den schon offenen Tab benutzen, nie einen zweiten öffnen
      let lebTab = null;
      try { lebTab = (await chrome.tabs.query({ url: z.leb + "/*" })).find(t => /\/lernstandskontrolle\//.test(t.url || "") && /[?&]sid=/.test(t.url || "")) || null; } catch (e) {}
      if (!lebTab) seiten.push({ sys: "LEB", kopf: true, links: 0, ziele: 0, aufgeklappt: 0, anmeldung: false, offen: 0, fehlt: true });
      else {
        const zurueck = lebTab.url;
        try { await chrome.tabs.update(lebTab.id, { active: true }); await prAbgehen("LEB", z.leb, "", lebTab.id, seiten, melden); }
        finally { try { await prLaden(lebTab.id, zurueck); } catch (e) {} }
      }
    }
  } finally {
    await prSess.set({ saProbeTour: seiten });
    await prSess.remove("saProbeTourLauf");
    if (tab) try { await chrome.tabs.remove(tab.id); } catch (e) {}
    if (zurueckTab) try { await chrome.tabs.update(zurueckTab, { active: true }); } catch (e) {}
  }
}
// Rundgang als Berichtsteil und als Liste der Bereiche für die Wunschliste
function prTourBericht(seiten, ziel) {
  const zeilen = [], bereiche = [];
  // Beschriftungen, die auf den meisten Seiten eines Systems stehen (Menü, Abmelden …), gehören zum Rahmen und werden weggelassen
  const rahmen = {};
  for (const sys of Object.keys(PR_SYS)) {
    const ss = seiten.filter(s => s.sys === sys && !s.kopf), zahl = new Map();
    for (const s of ss) for (const t of new Set((s.fakten || []).flatMap(x => [...(x.knoepfe || []), ...(x.reiter || []), ...(x.exporte || []).map(e => e.text)]))) zahl.set(t, (zahl.get(t) || 0) + 1);
    rahmen[sys] = new Set(ss.length >= 5 ? [...zahl].filter(([, n]) => n >= ss.length * 0.6).map(([t]) => t) : []);
  }
  const liste = (titel, a) => { if (a && a.length) zeilen.push("    " + titel + ": " + a.join(" · ")); };
  for (const s of seiten) {
    if (s.kopf) {
      zeilen.push("-- " + s.sys + (s.fehlt ? ": in keinem Tab geöffnet und angemeldet, deshalb übersprungen --" : ": " + s.links + " Links gelesen, " + s.ziele + " Seiten besucht" + (s.offen ? ", " + s.offen + " weitere nicht mehr besucht (Obergrenze)" : "") + (s.aufgeklappt ? ", " + s.aufgeklappt + "-mal Menügruppen aufgeklappt" : "") + (s.tabVerloren ? ", Tab " + s.tabVerloren + "-mal geschlossen und neu geöffnet" : "") + (s.abbruch ? ", ABGEBROCHEN, weil der Tab geschlossen wurde" : "") + (s.anmeldung ? "  ACHTUNG: Anmeldeseite, bitte erst anmelden" : "") + " --"));
      continue;
    }
    const m = prMaskUrl(s.url, ziel) || { text: "?", pfad: "?" };
    const g = s.gelandet ? prMaskUrl(s.gelandet, ziel) : null;
    const f = s.fakten || [], weg = rahmen[s.sys] || new Set();
    const alle = k => [...new Set(f.flatMap(x => x[k] || []))].filter(t => !weg.has(t));
    const name = s.text || m.pfad.split("/").filter(x => x && !/^<|^index\.php$/.test(x)).slice(-2).join(" › ") || "?";
    zeilen.push((s.tiefe > 1 ? "  ".repeat(s.tiefe - 1) + "↳ " : "") + "[" + s.sys + "] " + name + "   " + m.text.replace(/^\S+ /, "") + (g && g.pfad !== m.pfad ? "   → gelandet auf " + g.pfad : "") + (f.some(x => x.anmeldung) ? "   (Anmeldeseite)" : "") + (s.zu ? "   (diese Seite hat den Tab geschlossen)" : ""));
    liste("Überschriften", alle("h").slice(0, 5)); liste("Reiter", alle("reiter").slice(0, 12)); liste("Knöpfe", alle("knoepfe").slice(0, 20));
    liste("Tabellenspalten", alle("spalten").slice(0, 25)); liste("Eingabefelder", alle("felder").slice(0, 15)); liste("Feldnamen", alle("namen").slice(0, 40));
    const ex = [...new Set(f.flatMap(x => x.exporte || []).filter(e => !weg.has(e.text)).map(e => (e.text || "Link") + (e.href ? " (" + ((prMaskUrl(e.href, ziel) || {}).text || "?") + ")" : "")))].slice(0, 12);
    liste("Export", ex);
    const zeilenZahl = Math.max(0, ...f.map(x => x.zeilen || 0)); if (zeilenZahl) zeilen.push("    Tabellenzeilen auf der Seite: " + zeilenZahl);
    if (f.some(x => x.eingebettet)) zeilen.push("    enthält eingebettete Seite(n)");
    zeilen.push("    Datenadressen dieser Seite (" + (s.daten || []).length + ")" + ((s.daten || []).length ? ":" : ""), ...(s.daten || []).map(d => "      " + d));
    bereiche.push({ sys: s.sys, name, pfad: m.pfad, tiefe: s.tiefe || 1, daten: (s.daten || []).length, spalten: alle("spalten").slice(0, 8), export: ex.length > 0 });
  }
  return { zeilen, bereiche };
}

/* ---------- Auswertung ---------- */
const prTag = (d, mitStrich) => { const s = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); return mitStrich ? s : s.replace(/-/g, ""); };
async function prWebUntis(wu, melden) {
  const out = []; const kopf = {};
  const heute = new Date(); const mo = new Date(heute); mo.setDate(mo.getDate() - ((mo.getDay() + 6) % 7)); const fr = new Date(mo); fr.setDate(fr.getDate() + 4);
  const von = new Date(heute); von.setDate(von.getDate() - 30); const bis = new Date(heute); bis.setDate(bis.getDate() + 60);
  melden("WebUntis: Anmeldung prüfen");
  let tok = await prLesen(wu + "/WebUntis/api/token/new");
  for (let n = 0; n < 2 && tok.status !== 200; n++) { await prPause(2500); tok = await prLesen(wu + "/WebUntis/api/token/new"); }
  let person = "";
  if (tok.status === 200 && /^[\w-]+\.[\w-]+\.[\w-]+$/.test(tok.text.trim())) {
    kopf.Authorization = "Bearer " + tok.text.trim();
    try {
      const p = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(tok.text.trim().split(".")[1].replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0))));
      person = String(p.person_id || p.personId || "");
      tok.form = "Kennung (Token) mit den Angaben: " + prForm(p);
    } catch (e) {}
  }
  out.push(prZeile("GET WebUntis /WebUntis/api/token/new", tok));
  if (tok.status !== 200 || !kopf.Authorization) { out.push("  Hinweis: Ohne diese Kennung sind die folgenden Abfragen wahrscheinlich gesperrt. Bist du in WebUntis angemeldet?"); }
  const P = person || "0";
  const liste = [
    "/WebUntis/api/rest/view/v1/app/data",
    "/WebUntis/api/rest/view/v1/timetable/entries?start=" + prTag(mo, 1) + "&end=" + prTag(fr, 1) + "&format=1&resourceType=TEACHER&resources=" + P + "&periodTypes=&timetableType=MY_TIMETABLE",
    "/WebUntis/api/rest/view/v1/timetable/filter?resourceType=TEACHER&timetableType=MY_TIMETABLE",
    "/WebUntis/api/public/timetable/weekly/data?elementType=2&elementId=" + P + "&date=" + prTag(heute, 1) + "&formatId=1",
    "/WebUntis/api/daytimetable/dayLesson?date=" + prTag(heute) + "&id=" + P + "&type=2",
    "/WebUntis/api/exams?startDate=" + prTag(von) + "&endDate=" + prTag(bis),
    "/WebUntis/api/homeworks/lessons?startDate=" + prTag(von) + "&endDate=" + prTag(bis),
    "/WebUntis/api/classreg/absences/students?startDate=" + prTag(von) + "&endDate=" + prTag(heute) + "&studentId=-1&excuseStatusId=-1",
    "/WebUntis/api/classreg/absences/meta",
    "/WebUntis/api/classreg/classservices?startDate=" + prTag(mo) + "&endDate=" + prTag(fr),
    "/WebUntis/api/rest/view/v1/messages"
  ];
  const ziel = { wu };
  for (const pfad of liste) {
    melden("WebUntis: " + pfad.split("?")[0]);
    const a = await prLesen(wu + pfad, { headers: { ...kopf, Accept: "application/json, text/plain, */*" } });
    out.push(prZeile("GET " + prMaskUrl(wu + pfad, ziel).text, a));
    await prPause(200);
  }
  return { text: out, kopf };
}
async function prIServ(iserv, melden) {
  const out = []; const ziel = { iserv };
  melden("IServ: Kalenderordner (CalDAV)");
  const frage = '<?xml version="1.0" encoding="utf-8"?><d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><d:resourcetype/><d:current-user-principal/><c:calendar-home-set/></d:prop></d:propfind>';
  const dav = async (url, tiefe) => {
    const a = await prLesen(url, { method: "PROPFIND", headers: { Depth: String(tiefe), "Content-Type": "application/xml; charset=utf-8" }, body: frage });
    const antworten = a.text.split(/<(?:[\w-]+:)?response[\s>]/i).slice(1);
    const kal = antworten.filter(x => /<(?:[\w-]+:)?calendar[\s\/>]/i.test(x)).length;
    const heim = (a.text.match(/calendar-home-set[^>]*>\s*<(?:[\w-]+:)?href[^>]*>([^<]+)</i) || [])[1] || "";
    const prinz = (a.text.match(/current-user-principal[^>]*>\s*<(?:[\w-]+:)?href[^>]*>([^<]+)</i) || [])[1] || "";
    a.form = antworten.length + " Einträge, davon " + kal + " Kalender" + (heim ? ", Kalender-Stammordner genannt" : "") + (prinz ? ", Benutzerordner genannt" : "");
    out.push(prZeile("PROPFIND (Tiefe " + tiefe + ") " + prMaskUrl(url, ziel).text, a));
    return { kal, heim, prinz };
  };
  const abs = h => { try { const u = new URL(h, iserv); return u.origin === iserv ? u.toString() : ""; } catch (e) { return ""; } };
  let d = await dav(iserv + "/caldav/", 1);
  if (!d.kal && !d.heim && d.prinz && abs(d.prinz)) d = await dav(abs(d.prinz), 0);
  if (!d.kal && d.heim && abs(d.heim)) await dav(abs(d.heim), 1);
  for (const pfad of ["/iserv/mail/api/folder/list", "/iserv/mail/api/message/list?path=INBOX&length=5&start=0"]) {
    melden("IServ: " + pfad.split("?")[0]);
    const a = await prLesen(iserv + pfad, { headers: { Accept: "application/json, text/plain, */*", "X-Requested-With": "XMLHttpRequest" } });
    out.push(prZeile("GET " + prMaskUrl(iserv + pfad, ziel).text + "   (geraten)", a));
    await prPause(200);
  }
  return out;
}
async function prNamenFilter() {
  // Sicherheitsnetz: Kommt trotz allem ein Name aus den Kürzellisten im Bericht vor, wird er ersetzt und gezählt.
  const v = await chrome.storage.local.get({ liste: [], listeExtra: [], ichName: "", personenAuto: {} });
  const roh = [...(v.liste || []).map(r => r && r.orig), ...(v.listeExtra || []).map(r => r && r.orig), v.ichName, ...Object.keys(v.personenAuto || {}), ...Object.values(v.personenAuto || {}).map(x => x && (x.name || x.orig))];
  const worte = new Set();
  for (const s of roh) if (typeof s === "string") for (const w of s.split(/[\s,;()\/.-]+/)) if (w.length >= 3 && /\p{L}/u.test(w) && !/^(?:[A-Z]{1,2}\d+|L-ICH|P\d+)$/.test(w)) worte.add(w);
  return text => {
    let n = 0;
    for (const w of worte) {
      const re = new RegExp("(?<![\\p{L}\\p{N}_])" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![\\p{L}\\p{N}_])", w.length >= 4 ? "giu" : "gu");
      text = text.replace(re, () => { n++; return "<Name>"; });
    }
    return { text, n };
  };
}
async function prAuswerten() {
  const z0 = (await prSess.get("saProbe")).saProbe || {};
  const ziel = { iserv: z0.iserv || "", wu: z0.wu || "", leb: z0.leb || "" };
  await prSeriell(() => prSess.set({ saProbe: { ...z0, zeit: 0 } }));                 // Aufzeichnung beenden
  await chrome.storage.local.remove("saProbeAn");
  const melden = t => prSess.set({ saProbeLauf: { text: t, zeit: Date.now() } });
  const teile = ["SCHNITTSTELLEN-PROBE · Schulassistenz-Helfer " + chrome.runtime.getManifest().version + " · " + prTag(new Date(), 1),
    "Enthält nur Adressen und Feldnamen mit Datentyp. Keine Inhalte, keine Namen, keine Zahlenwerte.", ""];
  let kopf = {};
  if (ziel.wu) { const w = await prWebUntis(ziel.wu, melden); kopf = w.kopf; teile.push("== WebUntis: bekannte Adressen ==", ...w.text, ""); }
  if (ziel.iserv) teile.push("== IServ: bekannte Adressen ==", ...(await prIServ(ziel.iserv, melden)), "");
  const { saProbeFunde = [], saProbeTour = [] } = await prSess.get(["saProbeFunde", "saProbeTour"]);
  const tour = prTourBericht(saProbeTour, ziel);
  if (saProbeTour.length) teile.push("== Rundgang: gefundene Bereiche (bitte hier besonders auf Namen achten) ==", ...tour.zeilen, "");
  const eigene = saProbeFunde.filter(f => !f.extern), fremde = saProbeFunde.filter(f => f.extern);
  teile.push("== Mitgeschnitten: Adressen, die die Seiten selbst aufgerufen haben (" + eigene.length + ") ==");
  let i = 0;
  for (const f of eigene) {
    i++;
    const titel = f.m + " " + f.text + "   (×" + f.n + ", beim Mitschnitt: " + (f.status || "–") + (f.typ ? " " + f.typ.replace(/[^\w/+.-]/g, "") : "") + ")";
    const medien = /^(image|font|audio|video)\/|javascript|css/i.test(f.typ);
    if (f.m === "GET" && !medien && i <= 120) {
      melden("Mitschnitt auswerten: " + i + " von " + eigene.length);
      const a = await prLesen(f.url, { headers: { ...(f.wo === "WebUntis" ? kopf : { "X-Requested-With": "XMLHttpRequest" }), Accept: "application/json, text/plain, */*" } });
      teile.push(prZeile(titel, a));
      await prPause(150);
    } else teile.push(titel + (f.koerper ? "\n    gesendet: " + f.koerper : "") + (f.m !== "GET" ? "\n    (nicht wiederholt, weil keine reine Leseanfrage)" : ""));
  }
  if (!eigene.length) teile.push("(nichts aufgezeichnet)");
  teile.push("", "== Mitgeschnitten: Adressen außerhalb von /iserv/ (z. B. Messenger), nur Adresse (" + fremde.length + ") ==", ...fremde.map(f => f.text + "   (×" + f.n + ")"));
  if (!fremde.length) teile.push("(keine)");
  const filter = await prNamenFilter();
  const { text, n } = filter(teile.join("\n"));
  const bericht = text + "\n\nNamensprüfung: " + (n ? n + " Treffer aus deinen Kürzellisten wurden durch <Name> ersetzt." : "kein Name aus deinen Kürzellisten gefunden.") + "\n";
  const bereiche = tour.bereiche.map(b => ({ ...b, name: filter(b.name).text, spalten: b.spalten.map(x => filter(x).text) }));
  await chrome.storage.local.set({ saProbeBericht: { text: bericht, zeit: Date.now(), bereiche } });
  await prSess.remove(["saProbeFunde", "saProbeLauf", "saProbe", "saProbeTour", "saProbeTourLauf"]);
}
async function prBefehl(m, sender) {
  if (m.op === "quelle") {                                                            // vom Inhaltsskript auf IServ-Seiten
    const z = await prZustand(); if (!z || !sender.tab) return { ok: true };
    for (const url of (Array.isArray(m.urls) ? m.urls : []).slice(0, 200)) if (typeof url === "string" && /^https:\/\//.test(url)) await prMerken({ m: "?", url, extern: true });
    return { ok: true };
  }
  if (!sender || !String(sender.url || "").startsWith(chrome.runtime.getURL(""))) return { ok: false, fehler: "Nur von der Probe-Seite." };
  if (m.op === "status") {
    const z = await prZustand();
    const d = await prSess.get(["saProbeFunde", "saProbeLauf", "saProbeTourLauf", "saProbeTour"]);
    const l = await chrome.storage.local.get(["saProbeBericht", "saKalHost", "saWuSeite", "saLebOrigin"]);
    return { ok: true, laeuft: !!z, seit: z ? z.zeit : 0, funde: (d.saProbeFunde || []).length, auswertung: d.saProbeLauf && Date.now() - d.saProbeLauf.zeit < 60000 ? d.saProbeLauf.text : "",
      rundgang: d.saProbeTourLauf && Date.now() - d.saProbeTourLauf.zeit < 60000 ? d.saProbeTourLauf.text : "", besucht: (d.saProbeTour || []).filter(s => !s.kopf).length,
      bericht: l.saProbeBericht || null, iserv: (z && z.iserv) || prUrsprung(l.saKalHost || ""), wu: (z && z.wu) || prUrsprung(l.saWuSeite || ""), leb: z ? z.leb || "" : prUrsprung(l.saLebOrigin || "") };
  }
  if (m.op === "start") {
    const iserv = prUrsprung(m.iserv || ""), wu = prUrsprung(m.wu || ""), leb = prUrsprung(m.leb || "");
    if (!iserv && !wu && !leb) return { ok: false, fehler: "Bitte mindestens eine Adresse eintragen (https://…)." };
    if (wu && !/\.webuntis\.com$/i.test(new URL(wu).hostname)) return { ok: false, fehler: "Die WebUntis-Adresse muss auf .webuntis.com enden." };
    await prSeriell(() => prSess.set({ saProbe: { zeit: Date.now(), iserv, wu, leb }, saProbeFunde: [] }));
    await prSess.remove(["saProbeLauf", "saProbeTour", "saProbeTourLauf"]);
    await chrome.storage.local.set({ saProbeAn: Date.now() });
    return { ok: true, iserv, wu, leb };
  }
  if (m.op === "rundgang") {
    if (!(await prZustand())) return { ok: false, fehler: "Bitte zuerst die Aufzeichnung starten." };
    const { saProbeTourLauf } = await prSess.get("saProbeTourLauf");
    if (saProbeTourLauf && Date.now() - saProbeTourLauf.zeit < 60000) return { ok: false, fehler: "Der Rundgang läuft schon." };
    await prSess.set({ saProbeTourLauf: { text: "Rundgang beginnt", zeit: Date.now() } });
    prRundgang(sender.tab && sender.tab.id).catch(() => prSess.remove("saProbeTourLauf"));
    return { ok: true };
  }
  if (m.op === "auswerten") {
    const { saProbe } = await prSess.get("saProbe");
    if (!saProbe) return { ok: false, fehler: "Es läuft keine Aufzeichnung." };
    await prSess.set({ saProbeLauf: { text: "Auswertung beginnt", zeit: Date.now() } });
    prAuswerten().catch(async e => { await chrome.storage.local.set({ saProbeBericht: { text: "Die Auswertung ist abgebrochen (" + String((e && e.message) || e).slice(0, 200) + ").", zeit: Date.now(), fehler: true } }); await prSess.remove(["saProbeLauf", "saProbe"]); });
    return { ok: true };
  }
  if (m.op === "loeschen") {
    await prSeriell(() => prSess.remove(["saProbe", "saProbeFunde", "saProbeLauf", "saProbeTour", "saProbeTourLauf"]));
    await chrome.storage.local.remove(["saProbeBericht", "saProbeAn", "saProbeWunsch"]);
    return { ok: true };
  }
  return { ok: false, fehler: "Unbekannter Befehl" };
}
chrome.runtime.onMessage.addListener((m, sender, antwort) => {
  if (!m || m.cmd !== "probe") return;
  prBefehl(m, sender).then(antwort).catch(e => antwort({ ok: false, fehler: "Helfer-Fehler (" + String((e && e.message) || e) + ")." }));
  return true;
});
