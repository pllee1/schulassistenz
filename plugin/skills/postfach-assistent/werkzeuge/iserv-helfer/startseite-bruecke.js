/* IServ-Helfer · Brücke zur Schulassistenz-Startseite (lokale Datei).
   Holt auf Wunsch der Startseite den Stundenplan (iCal) von WebUntis und liest/schreibt den Schülerdaten-Ordner auf IServ (WebDAV).
   Läuft nur auf Schulassistenz-Start.html und nur, wenn „Zugriff auf Datei-URLs“ erlaubt ist. */
(() => {
  if (window.__saBruecke) return; window.__saBruecke = true;
  const markieren = () => document.documentElement.setAttribute("data-sa-helfer", chrome.runtime.getManifest().version);
  if (document.documentElement) markieren(); else document.addEventListener("DOMContentLoaded", markieren);
  window.addEventListener("message", async e => {
    if (e.source !== window || !e.data || e.data.sa !== "ical-holen") return;
    let antwort;
    try { antwort = await chrome.runtime.sendMessage({ cmd: "ical", url: String(e.data.url || "") }); }
    catch (err) { antwort = { ok: false, fehler: "Helfer nicht erreichbar. Bitte die Seite neu laden (F5)." }; }
    window.postMessage({ sa: "ical-antwort", id: e.data.id, ...(antwort || { ok: false, fehler: "Keine Antwort" }) }, "*");
  });
  // Vom Kalender-Finder gemerkte IServ-Kalenderadressen an die Startseite geben
  window.addEventListener("message", e => {
    if (e.source !== window || !e.data || e.data.sa !== "kal-adressen") return;
    chrome.storage.local.get(["saKalFeeds", "saKalQuellen", "saKalStand", "saKalHost"], d =>
      window.postMessage({ sa: "kal-adressen-antwort", id: e.data.id, feeds: d.saKalFeeds || [], quellen: d.saKalQuellen || [], stand: d.saKalStand || 0, host: d.saKalHost || "" }, "*"));
  });
  // Schülerdaten-Ordner auf IServ (WebDAV) lesen und schreiben
  window.addEventListener("message", async e => {
    if (e.source !== window || !e.data || e.data.sa !== "dav") return;
    let antwort;
    try { antwort = await chrome.runtime.sendMessage({ cmd: "dav", op: e.data.op, url: String(e.data.url || ""), daten: e.data.daten }); }
    catch (err) { antwort = { ok: false, fehler: "Helfer nicht erreichbar. Bitte die Seite neu laden (F5)." }; }
    window.postMessage({ sa: "dav-antwort", id: e.data.id, ...(antwort || { ok: false, fehler: "Keine Antwort" }) }, "*");
  });
  const melden = () => window.postMessage({ sa: "helfer-da", version: chrome.runtime.getManifest().version }, "*");
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", melden); else melden();
})();
