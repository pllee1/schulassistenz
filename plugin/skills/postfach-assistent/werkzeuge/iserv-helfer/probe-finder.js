/* Schulassistenz-Helfer · Schnittstellen-Probe, Teil auf IServ-Seiten.
   Tut nur etwas, solange die Lehrkraft die Probe gestartet hat (höchstens 15 Minuten): meldet dem Helfer, welche
   Datenadressen die Seite außerhalb von /iserv/ aufruft (z. B. der Messenger). Nur die Adressen, keine Inhalte. */
(() => {
  if (window.__saProbeFinder) return; window.__saProbeFinder = true;
  let aktiv = false, beobachter = null; const gesehen = new Set();
  const eigene = location.origin + "/iserv/";
  const senden = () => {
    if (!aktiv) return;
    const neu = performance.getEntriesByType("resource").filter(e => /^(fetch|xmlhttprequest)$/.test(e.initiatorType) && !e.name.startsWith(eigene) && !gesehen.has(e.name)).map(e => e.name);
    if (!neu.length) return;
    neu.forEach(u => gesehen.add(u));
    try { chrome.runtime.sendMessage({ cmd: "probe", op: "quelle", urls: neu.slice(0, 200) }).catch(() => {}); } catch (e) {}
  };
  const setzen = an => {
    aktiv = !!an && Date.now() - an < 15 * 60 * 1000;
    if (aktiv && !beobachter) { try { beobachter = new PerformanceObserver(() => senden()); beobachter.observe({ type: "resource", buffered: true }); } catch (e) {} senden(); }
  };
  try {
    chrome.storage.local.get("saProbeAn", d => setzen(d && d.saProbeAn));
    chrome.storage.onChanged.addListener((c, bereich) => { if (bereich === "local" && c.saProbeAn) setzen(c.saProbeAn.newValue); });
  } catch (e) {}
})();
