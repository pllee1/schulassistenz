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
function prWert(v) {
  if (v === "") return "";
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
  else if (ziel.iserv && u.hostname.endsWith("." + new URL(ziel.iserv).hostname)) wo = u.hostname.slice(0, -new URL(ziel.iserv).hostname.length - 1).replace(/[^a-z0-9.-]/gi, "").slice(0, 30) + ".IServ";
  else if (/\.webuntis\.com$/i.test(u.hostname)) wo = "WebUntis(andere Adresse)";
  else wo = "fremd:" + u.hostname.replace(/[^a-z0-9.-]/gi, "").slice(0, 60);
  const namen = [...new Set([...u.searchParams.keys()])].sort();
  const q = namen.map(k => (PR_PARAM.test(k) ? k : "<…>") + "=" + [...new Set(u.searchParams.getAll(k).map(prWert))].join("|"));
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
const PR_FILTER = { urls: ["https://*.webuntis.com/*", "https://*/iserv/*"], types: ["xmlhttprequest"] };
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

/* ---------- Auswertung ---------- */
const prTag = (d, mitStrich) => { const s = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); return mitStrich ? s : s.replace(/-/g, ""); };
async function prWebUntis(wu, melden) {
  const out = []; const kopf = {};
  const heute = new Date(); const mo = new Date(heute); mo.setDate(mo.getDate() - ((mo.getDay() + 6) % 7)); const fr = new Date(mo); fr.setDate(fr.getDate() + 4);
  const von = new Date(heute); von.setDate(von.getDate() - 30); const bis = new Date(heute); bis.setDate(bis.getDate() + 60);
  melden("WebUntis: Anmeldung prüfen");
  const tok = await prLesen(wu + "/WebUntis/api/token/new");
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
  const ziel = { iserv: z0.iserv || "", wu: z0.wu || "" };
  await prSeriell(() => prSess.set({ saProbe: { ...z0, zeit: 0 } }));                 // Aufzeichnung beenden
  await chrome.storage.local.remove("saProbeAn");
  const melden = t => prSess.set({ saProbeLauf: { text: t, zeit: Date.now() } });
  const teile = ["SCHNITTSTELLEN-PROBE · Schulassistenz-Helfer " + chrome.runtime.getManifest().version + " · " + prTag(new Date(), 1),
    "Enthält nur Adressen und Feldnamen mit Datentyp. Keine Inhalte, keine Namen, keine Zahlenwerte.", ""];
  let kopf = {};
  if (ziel.wu) { const w = await prWebUntis(ziel.wu, melden); kopf = w.kopf; teile.push("== WebUntis: bekannte Adressen ==", ...w.text, ""); }
  if (ziel.iserv) teile.push("== IServ: bekannte Adressen ==", ...(await prIServ(ziel.iserv, melden)), "");
  const { saProbeFunde = [] } = await prSess.get("saProbeFunde");
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
  await chrome.storage.local.set({ saProbeBericht: { text: bericht, zeit: Date.now() } });
  await prSess.remove(["saProbeFunde", "saProbeLauf", "saProbe"]);
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
    const d = await prSess.get(["saProbeFunde", "saProbeLauf"]);
    const l = await chrome.storage.local.get(["saProbeBericht", "saKalHost", "saWuSeite"]);
    return { ok: true, laeuft: !!z, seit: z ? z.zeit : 0, funde: (d.saProbeFunde || []).length, auswertung: d.saProbeLauf && Date.now() - d.saProbeLauf.zeit < 60000 ? d.saProbeLauf.text : "",
      bericht: l.saProbeBericht || null, iserv: (z && z.iserv) || prUrsprung(l.saKalHost || ""), wu: (z && z.wu) || prUrsprung(l.saWuSeite || "") };
  }
  if (m.op === "start") {
    const iserv = prUrsprung(m.iserv || ""), wu = prUrsprung(m.wu || "");
    if (!iserv && !wu) return { ok: false, fehler: "Bitte mindestens eine Adresse eintragen (https://…)." };
    if (wu && !/\.webuntis\.com$/i.test(new URL(wu).hostname)) return { ok: false, fehler: "Die WebUntis-Adresse muss auf .webuntis.com enden." };
    await prSeriell(() => prSess.set({ saProbe: { zeit: Date.now(), iserv, wu }, saProbeFunde: [] }));
    await prSess.remove("saProbeLauf");
    await chrome.storage.local.set({ saProbeAn: Date.now() });
    return { ok: true, iserv, wu };
  }
  if (m.op === "auswerten") {
    const { saProbe } = await prSess.get("saProbe");
    if (!saProbe) return { ok: false, fehler: "Es läuft keine Aufzeichnung." };
    await prSess.set({ saProbeLauf: { text: "Auswertung beginnt", zeit: Date.now() } });
    prAuswerten().catch(async e => { await chrome.storage.local.set({ saProbeBericht: { text: "Die Auswertung ist abgebrochen (" + String((e && e.message) || e).slice(0, 200) + ").", zeit: Date.now(), fehler: true } }); await prSess.remove(["saProbeLauf", "saProbe"]); });
    return { ok: true };
  }
  if (m.op === "loeschen") {
    await prSeriell(() => prSess.remove(["saProbe", "saProbeFunde", "saProbeLauf"]));
    await chrome.storage.local.remove(["saProbeBericht", "saProbeAn"]);
    return { ok: true };
  }
  return { ok: false, fehler: "Unbekannter Befehl" };
}
chrome.runtime.onMessage.addListener((m, sender, antwort) => {
  if (!m || m.cmd !== "probe") return;
  prBefehl(m, sender).then(antwort).catch(e => antwort({ ok: false, fehler: "Helfer-Fehler (" + String((e && e.message) || e) + ")." }));
  return true;
});
