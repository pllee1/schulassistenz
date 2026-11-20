/* Schulassistenz-Helfer · Hintergrund: Menüeinträge, Symbol, Tabs */
const DATEIEN = ["pseudo.js", "helfer.js"];
chrome.runtime.onInstalled.addListener(async d => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: "sa-auswahl", title: "Markierten Text pseudonymisiert an Claude", contexts: ["selection"] });
    chrome.contextMenus.create({ id: "sa-seite", title: "Diese Seite pseudonymisiert an Claude", contexts: ["page", "frame"] });
    chrome.contextMenus.create({ id: "sa-rueck", title: "Claudes Antwort: Namen wieder einsetzen", contexts: ["page", "frame", "editable"] });
    chrome.contextMenus.create({ id: "sa-fenster", title: "Helfer-Fenster auf dieser Seite öffnen", contexts: ["action"] });
    chrome.contextMenus.create({ id: "sa-start", title: "Startseite öffnen", contexts: ["action"] });
  });
  // Schon offene IServ-Tabs sofort ausstatten (sonst erst nach Neuladen)
  try {
    const tabs = await chrome.tabs.query({ url: ["https://*/iserv/*", "http://*/iserv/*"] });
    for (const t of tabs) chrome.scripting.executeScript({ target: { tabId: t.id }, files: DATEIEN }).catch(() => {});
  } catch (e) {}
  if (d.reason === "install") chrome.runtime.openOptionsPage();
  else if (d.reason === "update" && !(await chrome.storage.local.get("saStartGezeigt")).saStartGezeigt) { await chrome.storage.local.set({ saStartGezeigt: Date.now() }); startseiteOeffnen(); }
});
function hinweis(text) {
  chrome.action.setBadgeText({ text: "!" }); chrome.action.setBadgeBackgroundColor({ color: "#b5562a" });
  chrome.action.setTitle({ title: "Schulassistenz-Helfer: " + text });
  setTimeout(() => { chrome.action.setBadgeText({ text: "" }); chrome.action.setTitle({ title: "Schulassistenz-Startseite öffnen (Rechtsklick: Helfer-Fenster)" }); }, 6000);
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
  if (info.menuItemId === "sa-fenster") senden(tab, { cmd: "oeffnen" });
  if (info.menuItemId === "sa-start") startseiteOeffnen();
});
/* Klick auf das Symbol öffnet die Startseite (ab 0.9). Ist sie schon offen, wird ihr Tab nach vorn geholt.
   Das Helfer-Fenster für Mails gibt es per Rechtsklick auf das Symbol oder auf der Seite. */
const START_URL = chrome.runtime.getURL("startseite/start.html");
async function startseiteOeffnen() {
  try {
    const offen = chrome.runtime.getContexts ? await chrome.runtime.getContexts({ contextTypes: ["TAB"], documentUrls: [START_URL] }) : [];
    const t = offen.find(c => c.tabId >= 0);
    if (t) { const tab = await chrome.tabs.update(t.tabId, { active: true }); if (tab && tab.windowId) chrome.windows.update(tab.windowId, { focused: true }); return; }
  } catch (e) {}
  chrome.tabs.create({ url: START_URL });
}
chrome.action.onClicked.addListener(() => startseiteOeffnen());
chrome.action.setTitle({ title: "Schulassistenz-Startseite öffnen (Rechtsklick: Helfer-Fenster)" });
chrome.runtime.onMessage.addListener(m => {
  if (m.cmd === "tab") chrome.tabs.create({ url: m.url });
  if (m.cmd === "einstellungen") chrome.runtime.openOptionsPage();
  if (m.cmd === "startseite") startseiteOeffnen();
});
/* Umzug von der alten Startseite (Datei) und Werkzeuge, die noch als Datei im Datenordner liegen */
chrome.runtime.onMessage.addListener((m, sender, antwort) => {
  if (m.cmd === "umzug") {
    // Nur von der alten Startseite-Datei: Browserdaten (Schlüssel sa-…) und Ordner-Adresse dieses Geräts merken
    const url = (sender && sender.url) || "";
    if (!/^file:\/\/\/.*Schulassistenz-Start\.html/i.test(url)) { antwort({ ok: false }); return; }
    const daten = {};
    for (const [k, v] of Object.entries(m.daten || {})) if (/^sa-/.test(k) && typeof v === "string") daten[k] = v;
    chrome.storage.local.get(["saUmzugFertig"]).then(async d => {
      const ordnerUrl = url.split(/[?#]/)[0].replace(/[^/]*$/, "");
      await chrome.storage.local.set(d.saUmzugFertig ? { saDateiOrdner: ordnerUrl } : { saUmzug: { daten, zeit: Date.now() }, saDateiOrdner: ordnerUrl });
      antwort({ ok: true, schonUebernommen: !!d.saUmzugFertig });
    });
    return true;
  }
  if (m.cmd === "datei-oeffnen") {
    const url = String(m.url || "");
    if (!/^file:\/\/\/[^?#]+\.html?$/i.test(url) || !sender || !String(sender.url || "").startsWith(chrome.runtime.getURL(""))) { antwort({ ok: false }); return; }
    chrome.extension.isAllowedFileSchemeAccess(erlaubt => {
      if (!erlaubt) { antwort({ ok: false, datei: false }); return; }
      chrome.tabs.create({ url }); antwort({ ok: true });
    });
    return true;
  }
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
/* IServ-Anmeldung für den Dateizugriff (WebDAV): IServ fragt per Browser-Anmeldefenster, das Chrome nur bis zum Beenden behält.
   Der Helfer öffnet dafür ein kleines Fenster, erkennt die erfolgreiche Anmeldung, schließt es selbst und sagt der Startseite Bescheid.
   Benutzername und Passwort gibt die Lehrkraft nur in das Fenster von Chrome ein; der Helfer sieht und speichert sie nicht. */
let davFenster = null;
function davAnmelden(url) {
  if (davFenster) { chrome.windows.update(davFenster.fensterId, { focused: true }).catch(() => {}); return; }
  chrome.windows.create({ url, type: "popup", width: 520, height: 420, focused: true }).then(w => {
    const tabId = w.tabs && w.tabs[0] && w.tabs[0].id;
    const fertig = d => {
      if (d.tabId !== tabId || d.type !== "main_frame") return;
      if (d.statusCode >= 200 && d.statusCode < 400) {
        chrome.webRequest.onCompleted.removeListener(fertig);
        chrome.windows.remove(w.id).catch(() => {});
        davFenster = null;
        chrome.runtime.sendMessage({ cmd: "dav-angemeldet" }).catch(() => {});
      }
    };
    davFenster = { fensterId: w.id, fertig };
    chrome.webRequest.onCompleted.addListener(fertig, { urls: ["https://*/webdav/*"], tabId });
    chrome.windows.onRemoved.addListener(function weg(id) { if (id === w.id) { chrome.webRequest.onCompleted.removeListener(fertig); davFenster = null; chrome.windows.onRemoved.removeListener(weg); } });
  }).catch(() => chrome.tabs.create({ url }));
}
async function dav(m) {
  const url = String(m.url || "");
  if (!DAV_RE.test(url)) return { ok: false, fehler: "Der Helfer greift nur auf IServ „Eigene“ (…/webdav/Files/…) und Gruppenordner (…/webdav/Groups/…) zu." };
  if (DAV_GRUPPEN_RE.test(url) && !["liste", "lesen", "anmelden"].includes(m.op)) return { ok: false, fehler: "Gruppenordner auf dem Schulserver liest der Helfer nur, er ändert dort nichts." };
  if (m.op === "anmelden") { davAnmelden(url.replace(/(\/webdav\/(Files|Groups)).*$/, "$1/")); return { ok: true, fenster: true }; }
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
    wuLernen(url);
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
  if (m.op === "holen") return wuHolen(m);
  if (m.op === "abbrechen") { await sess.remove(["saWuWarten", "saWuDatei", "saWuFehler", "saWuHinweis"]); return { ok: true }; }
  if (m.op === "status") { const d = await chrome.storage.local.get(["saWuSeite", "saWuStart"]); return { ok: true, seite: !!d.saWuSeite, gelernt: d.saWuStart ? d.saWuStart.gelernt : 0 }; }
  if (m.op === "vergessen") { await chrome.storage.local.remove(["saWuSeite", "saWuStart", "saWuExport", "saWuExportBlob"]); return { ok: true }; }
  return { ok: false, fehler: "Unbekannter Befehl" };
}
chrome.runtime.onMessage.addListener((m, sender, antwort) => {
  if (m.cmd !== "wu-export") return;
  wuExport(m).then(antwort).catch(e => antwort({ ok: false, fehler: "Helfer-Fehler (" + String((e && e.message) || e) + ")." }));
  return true;
});
/* Ab 0.8: Bericht selbst anfordern. Während des Abfangens (op „warten“) liest der Helfer die Anfragen an reports.do mit
   (nur Adresse, Methode und Formularfelder wie Klasse, Bericht, Zeitraum; keine Antworten, keine Namen). Kommt danach der
   abgefangene Download, merkt er sich die Start-Anfrage und das Muster der Download-Adresse. „holen“ stellt die Start-Anfrage
   später selbst (Zeitraum angepasst), liest die msgId aus der Antwort und holt die fertige Datei ab. Nur lesend. */
let wuMitschnitt = [];
if (chrome.webRequest && chrome.webRequest.onBeforeRequest) {
  chrome.webRequest.onBeforeRequest.addListener(r => {
    if (r.tabId < 0 && r.initiator && r.initiator.startsWith("chrome-extension://")) return;   // eigene Anfragen
    sess.get("saWuWarten").then(({ saWuWarten }) => {
      if (!saWuWarten || Date.now() - saWuWarten > WU_WARTEN_MS) return;
      const form = r.requestBody && r.requestBody.formData ? r.requestBody.formData : null;
      wuMitschnitt.push({ method: r.method, url: r.url, form, zeit: Date.now() });
      if (wuMitschnitt.length > 40) wuMitschnitt.shift();
    });
  }, { urls: ["https://*.webuntis.com/*reports.do*"] }, ["requestBody"]);
}
const wuHatMsg = u => /[?&]msgId=/i.test(u);
function wuLernen(downloadUrl) {
  const start = [...wuMitschnitt].reverse().find(x => !wuHatMsg(x.url) && (/[?&](name|format)=/i.test(x.url) || (x.form && (x.form.name || x.form.format))));
  if (!start || !wuHatMsg(downloadUrl)) return;
  chrome.storage.local.set({ saWuStart: { method: start.method, url: start.url, form: start.form, download: downloadUrl, gelernt: Date.now() } });
  wuMitschnitt = [];
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
function wuParse(v) {
  let m;
  if ((m = /^(\d{4})(\d{2})(\d{2})$/.exec(v))) return `${m[1]}-${m[2]}-${m[3]}`;
  if ((m = /^(\d{4}-\d{2}-\d{2})/.exec(v))) return m[1];
  if ((m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(v))) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  if (/^1\d{12}$/.test(v)) return new Date(+v).toISOString().slice(0, 10);
  return "";
}
// Zeitraum anpassen: Ende auf heute, wenn das gelernte Ende vorbei ist; Anfang auf Schuljahresbeginn, wenn er nicht passt.
function wuDatenAnpassen(paare, von, bis) {
  const dk = paare.filter(([k, v]) => WU_DATUM.test(v)).map(([k]) => k);
  const istVon = k => /(^|_)(sd|start|von|from|begin)|startdate/i.test(k), istBis = k => /(^|_)(ed|end|bis|to)|enddate/i.test(k);
  let kv = dk.find(istVon), kb = dk.find(istBis); if (!kv && !kb && dk.length === 2) [kv, kb] = dk;
  return paare.map(([k, v]) => {
    const iso = wuParse(v);
    if (k === kb && bis && iso && iso < bis) return [k, wuFormat(v, bis)];
    if (k === kv && von && iso && (iso > von || iso < von.replace(/^(\d{4})/, (x, j) => String(+j - 1)))) return [k, wuFormat(v, von)];
    return [k, v];
  });
}
const pause = ms => new Promise(r => setTimeout(r, ms));
const istDatei = (typ, buf) => { const u = new Uint8Array(buf.slice(0, 8)); if (u[0] === 0xD0 && u[1] === 0xCF) return true; if (u[0] === 0x50 && u[1] === 0x4B) return true;
  if (/json|html/i.test(typ)) return false; if (/pdf/i.test(typ)) return false; return /csv|excel|spreadsheet|octet|text\/plain/i.test(typ); };
async function wuHolen(m) {
  const { saWuStart: st } = await chrome.storage.local.get("saWuStart");
  if (!st) return { ok: false, lernen: true };
  const u = new URL(st.url);
  const q = wuDatenAnpassen([...u.searchParams.entries()], m.von, m.bis); u.search = ""; for (const [k, v] of q) u.searchParams.append(k, v);
  const opt = { credentials: "include", cache: "no-store", method: st.method || "GET" };
  if (st.form && opt.method !== "GET") { const f = new URLSearchParams(); for (const [k, v] of wuDatenAnpassen(Object.entries(st.form).flatMap(([k, l]) => l.map(x => [k, x])), m.von, m.bis)) f.append(k, v); opt.body = f; }
  const r = await fetch(u.toString(), opt);
  if (r.status === 401 || r.status === 403) return { ok: false, anmelden: true, fehler: "Bitte in WebUntis anmelden und noch einmal versuchen." };
  if (!r.ok) return { ok: false, fehler: "WebUntis antwortet auf die Berichtsanfrage mit " + r.status };
  const typ0 = r.headers.get("content-type") || ""; const buf0 = await r.arrayBuffer();
  if (istDatei(typ0, buf0)) return { ok: true, daten: b64aus(buf0), typ: typ0 };
  const text = new TextDecoder().decode(buf0.slice(0, 20000));
  if (/<form[^>]*login|j_username|name="?password/i.test(text)) return { ok: false, anmelden: true, fehler: "WebUntis zeigt die Anmeldeseite. Bitte in WebUntis anmelden und noch einmal versuchen." };
  const msg = (text.match(/"?(?:msgId|messageId)"?\s*[:=]\s*"?(\d+)/i) || text.match(/msgId=(\d+)/i) || [])[1];
  if (!msg) return { ok: false, fehler: "WebUntis hat keine Berichtsnummer geschickt (Antwort: " + (typ0 || "ohne Typ") + ", " + buf0.byteLength + " Bytes).", neuLernen: true };
  const dl = new URL(st.download); dl.searchParams.set("msgId", msg);
  for (let i = 0; i < 40; i++) {
    await pause(i < 5 ? 1000 : 2000);
    const d = await fetch(dl.toString(), { credentials: "include", cache: "no-store" });
    if (!d.ok) continue;
    const typ = d.headers.get("content-type") || ""; const buf = await d.arrayBuffer();
    if (istDatei(typ, buf)) return { ok: true, daten: b64aus(buf), typ };
  }
  return { ok: false, fehler: "WebUntis hat den Bericht nicht rechtzeitig fertiggestellt. Bitte noch einmal versuchen." };
}
// Alte, nicht mehr gültige Lern-Adressen (0.6) entfernen
chrome.storage.local.remove(["saWuExport", "saWuExportBlob"]);

// LEB-online: bereitgelegtes Notenpaket (aus der Notenübersicht der Startseite) an das Fenster „Bewerten“/„Anlegen“ geben.
// Liegt nur in chrome.storage.session (verschwindet beim Schließen von Chrome) und gilt höchstens 12 Stunden.
chrome.runtime.onMessage.addListener((m, sender, antwort) => {
  if (m.cmd !== "leb-paket") return;
  chrome.storage.session.get("saLeb").then(({ saLeb }) => {
    if (!saLeb || !saLeb.zeit || Date.now() - saLeb.zeit > 12 * 3600 * 1000) return antwort({ paket: null });
    antwort({ paket: saLeb });
  }).catch(() => antwort({ paket: null }));
  return true;
});
