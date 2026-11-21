/* Schulassistenz-Helfer · Brücke zur Schulassistenz-Startseite.
   Ab Helfer 0.9 wohnt die Startseite im Helfer (startseite/start.html) und lädt diese Datei selbst als Skript.
   Auf der alten Startseite-Datei (Schulassistenz-Start.html) zeigt sie zusätzlich einen Hinweis und übergibt einmalig
   die Browserdaten der alten Seite (Einstellungen, Kalender, Stundenplan-Link, Entwürfe) an den Helfer.
   Holt auf Wunsch der Startseite den Stundenplan (iCal) und den Fehlzeiten-Export von WebUntis und liest/schreibt den Schülerdaten-Ordner auf IServ (WebDAV).
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
  // WebUntis-Fehlzeiten-Export für die Fehlzeiten-Ampel
  window.addEventListener("message", async e => {
    if (e.source !== window || !e.data || e.data.sa !== "wu-export") return;
    let antwort;
    try { antwort = await chrome.runtime.sendMessage({ cmd: "wu-export", op: e.data.op, host: e.data.host, von: e.data.von, bis: e.data.bis }); }
    catch (err) { antwort = { ok: false, fehler: "Helfer nicht erreichbar. Bitte die Seite neu laden (F5)." }; }
    window.postMessage({ sa: "wu-export-antwort", id: e.data.id, ...(antwort || { ok: false, fehler: "Keine Antwort" }) }, "*");
  });
  // IServ-Klassenbuch: Statistik-Export für die Akten
  window.addEventListener("message", async e => {
    if (e.source !== window || !e.data || e.data.sa !== "kb-export") return;
    let antwort;
    try { antwort = await chrome.runtime.sendMessage({ cmd: "kb-export", op: e.data.op, host: e.data.host }); }
    catch (err) { antwort = { ok: false, fehler: "Helfer nicht erreichbar. Bitte die Seite neu laden (F5)." }; }
    window.postMessage({ sa: "kb-export-antwort", id: e.data.id, ...(antwort || { ok: false, fehler: "Keine Antwort" }) }, "*");
  });
  // Alte Startseite (Datei): Browserdaten an den Helfer übergeben und auf die neue Startseite hinweisen
  if (location.protocol === "file:") {
    const daten = {};
    try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/^sa-/.test(k)) daten[k] = localStorage.getItem(k); } } catch (e) {}
    chrome.runtime.sendMessage({ cmd: "umzug", daten }).catch(() => {});
    const hinweis = () => {
      if (document.getElementById("sa-umzug-hinweis")) return;
      const d = document.createElement("div"); d.id = "sa-umzug-hinweis";
      d.style.cssText = "position:sticky;top:0;z-index:9999;background:#1d2c42;color:#e6ebf2;border-bottom:1px solid #7fb0f0;padding:10px 16px;font:15px 'Segoe UI',system-ui,sans-serif;display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center";
      d.innerHTML = '<span>Die Startseite wohnt jetzt im Schulassistenz-Helfer: <b>Klick auf das Helfer-Symbol</b> oben rechts in Chrome. Diese Datei wird nicht mehr aktualisiert.</span>';
      const b = document.createElement("button"); b.textContent = "Neue Startseite öffnen";
      b.style.cssText = "font:inherit;padding:6px 12px;border-radius:8px;border:1px solid #7fb0f0;background:#7fb0f0;color:#11161e;cursor:pointer";
      b.addEventListener("click", () => chrome.runtime.sendMessage({ cmd: "startseite" }).catch(() => {}));
      d.appendChild(b); document.body.prepend(d);
    };
    if (document.body) hinweis(); else document.addEventListener("DOMContentLoaded", hinweis);
  }
  const melden = () => window.postMessage({ sa: "helfer-da", version: chrome.runtime.getManifest().version }, "*");
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", melden); else melden();
})();
