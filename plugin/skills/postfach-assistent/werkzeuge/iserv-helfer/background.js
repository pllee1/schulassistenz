/* Schulassistenz-Helfer · Hintergrund: Menüeinträge, Symbol, Tabs */
const DATEIEN = ["pseudo.js", "helfer.js"];
chrome.runtime.onInstalled.addListener(async d => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: "sa-auswahl", title: "Markierten Text pseudonymisiert an Claude", contexts: ["selection"] });
    chrome.contextMenus.create({ id: "sa-seite", title: "Diese Seite pseudonymisiert an Claude", contexts: ["page", "frame"] });
    chrome.contextMenus.create({ id: "sa-rueck", title: "Claudes Antwort: Namen wieder einsetzen", contexts: ["page", "frame", "editable"] });
  });
  // Schon offene IServ-Tabs sofort ausstatten (sonst erst nach Neuladen)
  try {
    const tabs = await chrome.tabs.query({ url: ["https://*/iserv/*", "http://*/iserv/*"] });
    for (const t of tabs) chrome.scripting.executeScript({ target: { tabId: t.id }, files: DATEIEN }).catch(() => {});
  } catch (e) {}
  if (d.reason === "install") chrome.runtime.openOptionsPage();
});
function hinweis(text) {
  chrome.action.setBadgeText({ text: "!" }); chrome.action.setBadgeBackgroundColor({ color: "#b5562a" });
  chrome.action.setTitle({ title: "Schulassistenz-Helfer: " + text });
  setTimeout(() => { chrome.action.setBadgeText({ text: "" }); chrome.action.setTitle({ title: "Schulassistenz-Helfer öffnen" }); }, 6000);
}
async function senden(tab, msg) {
  if (!tab || !tab.id) return;
  if (!/^https?:/.test(tab.url || "https:")) { hinweis("Auf dieser Seite geht es nicht. Bitte in IServ oder auf einer normalen Webseite benutzen."); return; }
  try { await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: DATEIEN }); }
  catch (e) { hinweis("Diese Seite lässt keine Erweiterungen zu. Bitte Seite neu laden (F5) und noch einmal versuchen."); return; }
  try { await chrome.tabs.sendMessage(tab.id, msg); }
  catch (e) { hinweis("Bitte die Seite einmal neu laden (F5) und noch einmal versuchen."); }
}
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "sa-auswahl") senden(tab, { cmd: "oeffnen", auswahl: info.selectionText });
  if (info.menuItemId === "sa-seite") senden(tab, { cmd: "oeffnen" });
  if (info.menuItemId === "sa-rueck") senden(tab, { cmd: "rueck" });
});
chrome.action.onClicked.addListener(tab => senden(tab, { cmd: "oeffnen" }));
chrome.runtime.onMessage.addListener(m => {
  if (m.cmd === "tab") chrome.tabs.create({ url: m.url });
  if (m.cmd === "einstellungen") chrome.runtime.openOptionsPage();
});

/* Kalender für die Schulassistenz-Startseite:
   WebUntis-iCal-Links (ohne Cookies), IServ-ICS-Freigaben und IServ-CalDAV-Kalender (über die Anmeldung im Browser) */
async function caldavHolen(url) {
  const basis = url.replace(/[?#].*$/, "").replace(/\/?$/, "/");
  const anmeldung = s => new Error("IServ lässt den Kalender nur mit Anmeldung abrufen (" + s + "). Bitte in diesem Browser bei IServ angemeldet sein und noch einmal versuchen.");
  // 1. Export als .ics (viele CalDAV-Server können das)
  try {
    const r = await fetch(basis + "?export", { credentials: "include", cache: "no-store" });
    if (r.ok) { const t = await r.text(); if (/BEGIN:VCALENDAR/.test(t)) return t; }
  } catch (e) {}
  // 2. CalDAV-Abfrage für den Zeitraum der Startseite
  const f = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const von = new Date(Date.now() - 150 * 864e5), bis = new Date(Date.now() + 400 * 864e5);
  const body = `<?xml version="1.0" encoding="utf-8"?><c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><c:calendar-data/></d:prop><c:filter><c:comp-filter name="VCALENDAR"><c:comp-filter name="VEVENT"><c:time-range start="${f(von)}" end="${f(bis)}"/></c:comp-filter></c:comp-filter></c:filter></c:calendar-query>`;
  const r = await fetch(basis, { method: "REPORT", credentials: "include", cache: "no-store", headers: { "Depth": "1", "Content-Type": "application/xml; charset=utf-8" }, body });
  if (r.status === 401 || r.status === 403) throw anmeldung(r.status);
  if (!r.ok) throw new Error("IServ antwortet mit " + r.status);
  const xml = await r.text();
  const ent = t => t.replace(/^\s*<!\[CDATA\[/, "").replace(/\]\]>\s*$/, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#13;|&#x0?D;/gi, "\r").replace(/&#10;|&#x0?A;/gi, "\n").replace(/&amp;/g, "&");
  const teile = [...xml.matchAll(/<(?:[\w-]+:)?calendar-data[^>]*>([\s\S]*?)<\/(?:[\w-]+:)?calendar-data>/gi)].map(m => ent(m[1]));
  if (!teile.length && !/multistatus/i.test(xml)) throw anmeldung("keine Kalenderdaten");
  const ev = teile.flatMap(t => t.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || []);
  return "BEGIN:VCALENDAR\r\nVERSION:2.0\r\n" + ev.join("\r\n") + "\r\nEND:VCALENDAR\r\n";
}
chrome.runtime.onMessage.addListener((m, sender, antwort) => {
  if (m.cmd !== "ical") return;
  const url = m.url || "";
  const untis = /^https:\/\/[a-z0-9.-]+\.webuntis\.com\/WebUntis\/ical_export\?/i.test(url);
  const iserv = /^https:\/\/[a-z0-9.-]+\/iserv\/[^?#]*(calendar|kalender|ical|\.ics)/i.test(url);  // IServ-Kalender (ICS-Freigabe)
  const caldav = /^https:\/\/[a-z0-9.-]+\/caldav\/[^?#]+$/i.test(url);                            // IServ-CalDAV (z. B. öffentlicher Kalender)
  if (!untis && !iserv && !caldav) { antwort({ ok: false, fehler: "Der Helfer ruft nur Kalenderlinks aus WebUntis und IServ ab." }); return; }
  const holen = caldav ? caldavHolen(url)
    : fetch(url, { cache: "no-store", credentials: iserv ? "include" : "omit" }).then(r => r.ok ? r.text() : Promise.reject(new Error((untis ? "WebUntis" : "IServ") + " antwortet mit " + r.status)));
  holen.then(t => antwort({ ok: true, text: t })).catch(e => antwort({ ok: false, fehler: String((e && e.message) || e) }));
  return true;
});

/* Schülerdaten-Ordner auf IServ (WebDAV, Bereich „Eigene“) und Gruppenordner (Bereich „Groups“) für die Startseite.
   Nur Adressen der Form https://<host>/webdav/Files/… (lesen und schreiben) und https://<host>/webdav/Groups/… (nur lesen).
   Anmeldung über den Browser (kein Passwort im Helfer). */
const DAV_RE = /^https:\/\/[a-z0-9.-]+\/webdav\/(Files|Groups)(\/[^?#]*)?$/i;
const DAV_GRUPPEN_RE = /^https:\/\/[a-z0-9.-]+\/webdav\/Groups(\/|$)/i;
const b64aus = buf => { const u = new Uint8Array(buf); let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
const b64ein = t => { const s = atob(t || ""); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };
const xmlText = t => t.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
function davListe(xml, basisUrl) {
  const basis = new URL(basisUrl).pathname.replace(/\/?$/, "/");
  const out = [];
  for (const m of xml.matchAll(/<(?:[\w-]+:)?response\b[^>]*>([\s\S]*?)<\/(?:[\w-]+:)?response>/gi)) {
    const r = m[1];
    const href = xmlText(((r.match(/<(?:[\w-]+:)?href[^>]*>([\s\S]*?)<\/(?:[\w-]+:)?href>/i) || [])[1] || "").trim());
    let pfad; try { pfad = new URL(href, basisUrl).pathname; } catch (e) { continue; }
    if (pfad.replace(/\/?$/, "/") === basis) continue;
    const name = decodeURIComponent(pfad.replace(/\/$/, "").split("/").pop());
    const dir = /<(?:[\w-]+:)?collection\s*\/?>/i.test(r);
    const size = parseInt((r.match(/<(?:[\w-]+:)?getcontentlength[^>]*>(\d+)</i) || [])[1] || "0", 10);
    const mod = ((r.match(/<(?:[\w-]+:)?getlastmodified[^>]*>([^<]*)</i) || [])[1] || "").trim();
    if (name) out.push({ name, dir, size, mod });
  }
  return out;
}
async function dav(m) {
  const url = String(m.url || "");
  if (!DAV_RE.test(url)) return { ok: false, fehler: "Der Helfer greift nur auf IServ „Eigene“ (…/webdav/Files/…) und Gruppenordner (…/webdav/Groups/…) zu." };
  if (DAV_GRUPPEN_RE.test(url) && !["liste", "lesen", "anmelden"].includes(m.op)) return { ok: false, fehler: "Gruppenordner auf dem Schulserver liest der Helfer nur, er ändert dort nichts." };
  if (m.op === "anmelden") { chrome.tabs.create({ url: url.replace(/(\/webdav\/(Files|Groups)).*$/, "$1/") }); return { ok: true }; }
  const opt = { credentials: "include", cache: "no-store" };
  let r;
  if (m.op === "liste") r = await fetch(url.replace(/\/?$/, "/"), { ...opt, method: "PROPFIND", headers: { "Depth": "1", "Content-Type": "application/xml; charset=utf-8" },
    body: '<?xml version="1.0" encoding="utf-8"?><d:propfind xmlns:d="DAV:"><d:prop><d:resourcetype/><d:getcontentlength/><d:getlastmodified/></d:prop></d:propfind>' });
  else if (m.op === "lesen") r = await fetch(url, { ...opt, method: "GET" });
  else if (m.op === "schreiben") r = await fetch(url, { ...opt, method: "PUT", body: b64ein(m.daten) });
  else if (m.op === "ordner") r = await fetch(url.replace(/\/?$/, "/"), { ...opt, method: "MKCOL" });
  else if (m.op === "loeschen") r = await fetch(url, { ...opt, method: "DELETE" });
  else return { ok: false, fehler: "Unbekannter Befehl" };
  if (r.status === 401 || r.status === 403) return { ok: false, status: r.status, anmelden: true, fehler: "Bitte bei IServ anmelden (Anmeldefenster im neuen Tab), dann noch einmal versuchen." };
  if (r.status === 404) return { ok: false, status: 404, fehlt: true, fehler: "Nicht gefunden" };
  if (m.op === "ordner" && r.status === 405) return { ok: true, status: 405 };   // gibt es schon
  if (!r.ok && r.status !== 207) return { ok: false, status: r.status, fehler: "IServ antwortet mit " + r.status };
  if (m.op === "liste") return { ok: true, eintraege: davListe(await r.text(), url.replace(/\/?$/, "/")) };
  if (m.op === "lesen") return { ok: true, daten: b64aus(await r.arrayBuffer()) };
  return { ok: true, status: r.status };
}
chrome.runtime.onMessage.addListener((m, sender, antwort) => {
  if (m.cmd !== "dav") return;
  dav(m).then(antwort).catch(e => antwort({ ok: false, fehler: "IServ nicht erreichbar (" + String((e && e.message) || e) + "). Internetverbindung prüfen." }));
  return true;
});

/* Selbst-Update: Das schulassistenz-Update (Windows) ersetzt die Dateien dieses Ordners.
   Der Helfer merkt das und lädt sich selbst neu. Offene IServ-Tabs danach einmal neu laden (F5). */
async function aufNeueFassungPruefen() {
  try {
    const r = await fetch(chrome.runtime.getURL("manifest.json") + "?t=" + Date.now(), { cache: "no-store" });
    const platte = (await r.json()).version;
    if (platte && platte !== chrome.runtime.getManifest().version) chrome.runtime.reload();
  } catch (e) {}
}
chrome.alarms.create("sa-neue-fassung", { periodInMinutes: 30 });
chrome.alarms.onAlarm.addListener(a => { if (a.name === "sa-neue-fassung") aufNeueFassungPruefen(); });
chrome.runtime.onStartup.addListener(aufNeueFassungPruefen);
aufNeueFassungPruefen();

/* WebUntis-Fehlzeiten für die Fehlzeiten-Ampel der Startseite.
   Lernen: Exportiert die Lehrkraft einmal selbst in WebUntis den Bericht „Abwesenheiten“ (z. B. AbsencePerStudent),
   merkt sich der Helfer nur die Adresse dieses Downloads (keine Daten, kein Passwort).
   Holen: Auf Knopfdruck der Startseite ruft er dieselbe Adresse mit dem gewünschten Zeitraum über die WebUntis-Anmeldung
   im Browser ab (nur lesend) und gibt die Datei an die Startseite. Namen ersetzt die Startseite lokal durch Kürzel. */
const WU_RE = /^https:\/\/[a-z0-9.-]+\.webuntis\.com\//i;
const wuPasst = (url, datei) => WU_RE.test(url || "") && /absen|abwesen|fehlzeit/i.test((url || "") + " " + (datei || ""));
if (chrome.downloads && chrome.downloads.onCreated) {
  chrome.downloads.onCreated.addListener(d => {
    const url = d.finalUrl || d.url || "";
    if (wuPasst(url, d.filename)) chrome.storage.local.set({ saWuExport: { url, gelernt: Date.now() } });
    else if (/^blob:https:\/\/[a-z0-9.-]+\.webuntis\.com\//i.test(url) && /absen|abwesen/i.test(d.filename || "")) chrome.storage.local.set({ saWuExportBlob: Date.now() });
  });
  chrome.downloads.onChanged.addListener(c => {
    if (!c.filename || !c.filename.current) return;
    chrome.downloads.search({ id: c.id }, l => { const d = l && l[0]; if (d && wuPasst(d.finalUrl || d.url, c.filename.current)) chrome.storage.local.set({ saWuExport: { url: d.finalUrl || d.url, gelernt: Date.now() } }); });
  });
}
const WU_DATUM = /^(\d{8}|\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?|\d{1,2}\.\d{1,2}\.\d{4}|1\d{12})$/;
function wuFormat(alt, iso) {
  if (/^\d{8}$/.test(alt)) return iso.replace(/-/g, "");
  if (/^\d{4}-\d{2}-\d{2}T/.test(alt)) return iso + alt.slice(10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(alt)) return iso;
  if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(alt)) { const [j, m, t] = iso.split("-"); return `${t}.${m}.${j}`; }
  if (/^1\d{12}$/.test(alt)) return String(new Date(iso + "T00:00:00").getTime());
  return alt;
}
// Aufbau der Adresse ohne Werte (für die Fehlersuche): Pfad, Namen der Parameter und welche wie ein Datum aussehen
function wuAufbau(url) {
  const u = new URL(url);
  return u.host + u.pathname.replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, "<id>").replace(/\d{5,}/g, "<zahl>") + (u.search ? "?" + [...u.searchParams.entries()].map(([k, v]) => k + "=" + (WU_DATUM.test(v) ? "<datum>" : /^\d+$/.test(v) ? "<zahl>" : v.length > 24 ? "<text>" : v)).join("&") : "") + (u.hash ? " #" + u.hash.length : "");
}
function wuZeitraum(url, von, bis) {
  const u = new URL(url); const keys = [...u.searchParams.keys()];
  const datumsKeys = keys.filter(k => WU_DATUM.test(u.searchParams.get(k)));
  const setze = (k, iso) => { u.searchParams.set(k, wuFormat(u.searchParams.get(k), iso)); };
  const istVon = k => /(^|_)(sd|start|von|from|begin)|startdate|^rpt_sd$/i.test(k), istBis = k => /(^|_)(ed|end|bis|to)|enddate|^rpt_ed$/i.test(k);
  let kv = datumsKeys.find(istVon), kb = datumsKeys.find(istBis);
  if (!kv && !kb && datumsKeys.length === 2) [kv, kb] = datumsKeys;
  if (kv && von) setze(kv, von); if (kb && bis) setze(kb, bis);
  return { url: u.toString(), zeitraum: !!(kv || kb) };
}
async function wuExport(m) {
  const d = await chrome.storage.local.get(["saWuExport", "saWuExportBlob"]);
  if (m.op === "status") return { ok: true, aufbau: d.saWuExport ? wuAufbau(d.saWuExport.url) : "", gelernt: d.saWuExport ? d.saWuExport.gelernt : 0, host: d.saWuExport ? new URL(d.saWuExport.url).host : "", blob: d.saWuExportBlob || 0 };
  if (m.op === "vergessen") { await chrome.storage.local.remove(["saWuExport", "saWuExportBlob"]); return { ok: true }; }
  if (m.op === "anmelden") { if (d.saWuExport) chrome.tabs.create({ url: new URL(d.saWuExport.url).origin + "/WebUntis/" }); return { ok: true }; }
  if (m.op !== "holen") return { ok: false, fehler: "Unbekannter Befehl" };
  if (!d.saWuExport) return { ok: false, lernen: true, fehler: "Der Helfer kennt den Export deiner Schule noch nicht." };
  const z = wuZeitraum(d.saWuExport.url, m.von, m.bis);
  const r = await fetch(z.url, { credentials: "include", cache: "no-store" });
  if (r.status === 401 || r.status === 403) return { ok: false, anmelden: true, fehler: "Bitte in WebUntis anmelden und noch einmal versuchen." };
  if (!r.ok) return { ok: false, fehler: "WebUntis antwortet mit " + r.status };
  const typ = r.headers.get("content-type") || "";
  const buf = await r.arrayBuffer();
  if (/text\/html/i.test(typ)) {
    const t = new TextDecoder().decode(buf.slice(0, 20000));
    if (/<form[^>]*login|j_username|name="?password|anmelden/i.test(t) && !/<table/i.test(t)) return { ok: false, anmelden: true, fehler: "WebUntis zeigt die Anmeldeseite. Bitte in WebUntis anmelden und noch einmal versuchen." };
  }
  const cd = r.headers.get("content-disposition") || "";
  const name = decodeURIComponent(((cd.match(/filename\*=UTF-8''([^;]+)/i) || cd.match(/filename="?([^";]+)"?/i) || [])[1] || "WebUntis-Export").trim());
  return { ok: true, daten: b64aus(buf), typ, name, zeitraum: z.zeitraum, aufbau: wuAufbau(d.saWuExport.url), gelernt: d.saWuExport.gelernt };
}
chrome.runtime.onMessage.addListener((m, sender, antwort) => {
  if (m.cmd !== "wu-export") return;
  wuExport(m).then(antwort).catch(e => antwort({ ok: false, fehler: "WebUntis nicht erreichbar (" + String((e && e.message) || e) + ")." }));
  return true;
});
