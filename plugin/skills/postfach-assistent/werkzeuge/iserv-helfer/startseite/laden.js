/* Schulassistenz-Startseite im Helfer · Laden
   1. Übernimmt einmalig die Browserdaten der alten Startseite (Datei Schulassistenz-Start.html): Einstellungen, Kalenderquellen,
      Stundenplan-Link, Entwürfe. Die Brücke hat sie beim letzten Öffnen der alten Seite in den Speicher des Helfers kopiert.
   2. Liest meine-einstellungen.js aus dem Datenordner als Text und wertet sie aus (Erweiterungsseiten dürfen sie nicht ausführen).
      Ohne Ordnerzugriff gilt die zuletzt gelesene Fassung (nur auf diesem Gerät gespeichert, keine Schülerdaten).
   3. Lädt danach die eigentliche Startseite (start-a.js, sicherung.js, fehlzeiten.js, start-b.js). */
(() => {
  const EINST = ["werkzeuge", "startseite", "meine-einstellungen.js"];
  const idbGet = k => new Promise(ok => {
    try {
      const r = indexedDB.open("schulassistenz", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("h");
      r.onsuccess = () => { try { const g = r.result.transaction("h").objectStore("h").get(k); g.onsuccess = () => ok(g.result || null); g.onerror = () => ok(null); } catch (e) { ok(null); } };
      r.onerror = () => ok(null);
    } catch (e) { ok(null); }
  });
  async function einstLesen(h) {
    let d = h;
    for (const t of EINST.slice(0, -1)) d = await d.getDirectoryHandle(t);
    const text = await (await (await d.getFileHandle(EINST[EINST.length - 1])).getFile()).text();
    const r = window.saEinstellungenLesen(text);
    if (!r.werte.SA_EINSTELLUNGEN) throw new Error(r.fehler.join("; ") || "SA_EINSTELLUNGEN fehlt");
    return { e: r.werte.SA_EINSTELLUNGEN, k: r.werte.SA_MEINE_KACHELN || [] };
  }
  const skript = src => new Promise((ok, f) => { const s = document.createElement("script"); s.src = src; s.async = false; s.onload = ok; s.onerror = () => f(new Error(src)); document.body.appendChild(s); });

  async function umzugUebernehmen() {
    try {
      const { saUmzug, saUmzugFertig } = await chrome.storage.local.get(["saUmzug", "saUmzugFertig"]);
      if (!saUmzug || saUmzugFertig) return;
      let n = 0;
      for (const [k, v] of Object.entries(saUmzug.daten || {})) if (localStorage.getItem(k) === null) { localStorage.setItem(k, v); n++; }
      await chrome.storage.local.set({ saUmzugFertig: { zeit: Date.now(), anzahl: n } });
    } catch (e) {}
  }

  let quelle = "keine", aktuell = null;
  async function einstellungen() {
    const h = await idbGet("datenordner");
    if (h) {
      let recht = "prompt"; try { recht = await h.queryPermission({ mode: "read" }); } catch (e) {}
      if (recht === "granted") {
        try { aktuell = await einstLesen(h); quelle = "datei"; chrome.storage.local.set({ saEinstellungen: { ...aktuell, zeit: Date.now() } }); }
        catch (e) { quelle = e && e.name === "NotFoundError" ? "fehlt" : "fehlerhaft"; console.warn("meine-einstellungen.js:", e); }
      }
    }
    if (quelle !== "datei") {
      const { saEinstellungen } = await chrome.storage.local.get("saEinstellungen");
      if (saEinstellungen && quelle === "keine") { aktuell = saEinstellungen; quelle = "gemerkt"; }
    }
    if (aktuell) { window.SA_EINSTELLUNGEN = aktuell.e; window.SA_MEINE_KACHELN = aktuell.k; }
    else if (quelle === "keine") { window.SA_EINSTELLUNGEN = {}; window.SA_MEINE_KACHELN = []; }   // noch kein Ordner: Einrichtung führt hin
    window.saEinstellungenQuelle = quelle;
  }
  /* Wird von der Startseite aufgerufen, sobald der Datenordner (wieder) erreichbar ist.
     Weichen die Einstellungen in der Datei von den geladenen ab, lädt die Seite einmal neu. Gibt true zurück, wenn sie neu lädt. */
  window.saNachVerbinden = async h => {
    if (quelle === "datei") return false;
    try {
      const neu = await einstLesen(h);
      chrome.storage.local.set({ saEinstellungen: { ...neu, zeit: Date.now() } });
      if (JSON.stringify({ e: neu.e, k: neu.k }) !== JSON.stringify(aktuell ? { e: aktuell.e, k: aktuell.k } : null)) { location.reload(); return true; }
      quelle = "datei";
    } catch (e) {}
    return false;
  };
  /* Werkzeuge, die noch als Datei im Datenordner liegen (Pseudonymisierer, Abschluss-Check): Ordner-Adresse dieses Geräts */
  window.saDateiOrdner = async () => {
    const { saDateiOrdner } = await chrome.storage.local.get("saDateiOrdner");
    if (saDateiOrdner) return saDateiOrdner;
    const p = String((window.SA_EINSTELLUNGEN || {}).datenordner || "").trim();
    return p ? "file:///" + p.replace(/\\/g, "/").replace(/\/?$/, "/").split("/").map(encodeURIComponent).join("/").replace(/^([A-Za-z])%3A/, "$1:") : "";
  };

  const los = async () => {
    await umzugUebernehmen();
    await einstellungen();
    for (const s of ["start-a.js", "sicherung.js", "fehlzeiten.js", "start-b.js"]) {
      try { await skript(s); } catch (e) { console.error("Nicht geladen:", e.message); }
    }
    window.postMessage({ sa: "helfer-da", version: chrome.runtime.getManifest().version }, "*");
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", los); else los();
})();
