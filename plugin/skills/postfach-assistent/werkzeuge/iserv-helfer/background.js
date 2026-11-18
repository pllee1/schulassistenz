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

/* WebUntis-Fehlzeiten für die Fehlzeiten-Ampel der Startseite (ab 0.7).
   WebUntis erzeugt Berichte (reports.do) für jeden Klick neu und liefert sie unter einer Einmal-Adresse (msgId) aus.
   Ablauf: Die Startseite meldet „warten“ und öffnet die Berichtsseite von WebUntis. Die Lehrkraft klickt dort wie gewohnt
   auf CSV oder Excel. Der Helfer fängt genau diesen einen Download ab (nur WebUntis, nur CSV/Excel, nur innerhalb von 10 Minuten),
   holt die Datei selbst über die Anmeldung im Browser, bricht den Download ab und löscht ihn, damit keine Datei mit Klarnamen
   im Download-Ordner landet. Die Datei liegt nur im Arbeitsspeicher (storage.session), bis die Startseite sie abholt.
   Die Startseite ersetzt die Namen lokal durch Kürzel. Der Helfer schreibt nichts in WebUntis.
   Gemerkt wird nur die Adresse der Berichtsseite (ohne Daten). */
const WU_RE = /^https:\/\/[a-z0-9.-]+\.webuntis\.com\//i;
const WU_WARTEN_MS = 10 * 60 * 1000;
const sess = chrome.storage.session || chrome.storage.local;
const wuFormatVon = (url, datei) => { const f = ((url || "").match(/[?&]format=([a-z]+)/i) || [])[1] || ((datei || "").match(/\.([a-z]+)$/i) || [])[1] || ""; return f.toLowerCase(); };
async function wuDownload(d) {
  const url = d.finalUrl || d.url || "";
  if (!WU_RE.test(url) && !WU_RE.test(d.referrer || "")) return;
  const { saWuWarten } = await sess.get("saWuWarten");
  if (!saWuWarten || Date.now() - saWuWarten > WU_WARTEN_MS) return;
  const fmt = wuFormatVon(url, d.filename);
  if (d.referrer && WU_RE.test(d.referrer)) chrome.storage.local.set({ saWuSeite: d.referrer });
  if (fmt === "pdf") { await sess.set({ saWuHinweis: "pdf" }); return; }
  if (!/^(csv|xls|xlsx|txt)$/.test(fmt) && !/\.(csv|xlsx?|txt)$/i.test(d.filename || "")) return;
  await sess.remove("saWuWarten");
  chrome.downloads.cancel(d.id, () => chrome.downloads.erase({ id: d.id }, () => void chrome.runtime.lastError));
  try {
    if (/^(blob|data):/i.test(url)) throw new Error("WebUntis hat die Datei im Browser erzeugt. Bitte die Datei herunterladen und auf die Ampel ziehen.");
    const r = await fetch(url, { credentials: "include", cache: "no-store" });
    if (!r.ok) throw new Error("WebUntis antwortet mit " + r.status);
    const buf = await r.arrayBuffer();
    await sess.set({ saWuDatei: { daten: b64aus(buf), typ: r.headers.get("content-type") || "", name: fmt.toUpperCase() + "-Export", zeit: Date.now() } });
  } catch (e) {
    await sess.set({ saWuFehler: String((e && e.message) || e) });
  }
}
if (chrome.downloads && chrome.downloads.onCreated) chrome.downloads.onCreated.addListener(d => { wuDownload(d).catch(() => {}); });
async function wuExport(m) {
  if (m.op === "warten") {
    await sess.remove(["saWuDatei", "saWuFehler", "saWuHinweis"]); await sess.set({ saWuWarten: Date.now() });
    const { saWuSeite } = await chrome.storage.local.get("saWuSeite");
    const ziel = saWuSeite || (/^https:\/\/[a-z0-9.-]+\.webuntis\.com$/i.test(m.host || "") ? m.host + "/WebUntis/" : "");
    if (ziel) chrome.tabs.create({ url: ziel });
    return { ok: true, seite: !!saWuSeite, geoeffnet: !!ziel };
  }
  if (m.op === "abholen") {
    const d = await sess.get(["saWuDatei", "saWuFehler", "saWuHinweis", "saWuWarten"]);
    if (d.saWuDatei) { await sess.remove("saWuDatei"); return { ok: true, fertig: true, ...d.saWuDatei }; }
    if (d.saWuFehler) { await sess.remove("saWuFehler"); return { ok: false, fehler: d.saWuFehler }; }
    if (d.saWuHinweis) { await sess.remove("saWuHinweis"); return { ok: true, fertig: false, hinweis: d.saWuHinweis }; }
    return { ok: true, fertig: false, wartet: !!d.saWuWarten && Date.now() - d.saWuWarten < WU_WARTEN_MS };
  }
  if (m.op === "abbrechen") { await sess.remove(["saWuWarten", "saWuDatei", "saWuFehler", "saWuHinweis"]); return { ok: true }; }
  if (m.op === "status") { const { saWuSeite } = await chrome.storage.local.get("saWuSeite"); return { ok: true, seite: !!saWuSeite }; }
  if (m.op === "vergessen") { await chrome.storage.local.remove(["saWuSeite", "saWuExport", "saWuExportBlob"]); return { ok: true }; }
  return { ok: false, fehler: "Unbekannter Befehl" };
}
chrome.runtime.onMessage.addListener((m, sender, antwort) => {
  if (m.cmd !== "wu-export") return;
  wuExport(m).then(antwort).catch(e => antwort({ ok: false, fehler: "Helfer-Fehler (" + String((e && e.message) || e) + ")." }));
  return true;
});
// Alte, nicht mehr gültige Lern-Adressen (0.6) entfernen
chrome.storage.local.remove(["saWuExport", "saWuExportBlob"]);
