/* Schulassistenz-Helfer · Kalender-Finder für die Schulassistenz-Startseite.
   Läuft nur auf der IServ-Kalenderseite. Merkt sich, über welche internen Adressen IServ die Termine lädt
   (nur die Adressen, keine Termine), damit die Startseite dieselben Adressen abrufen kann. */
(() => {
  if (window.__saKalFinder) return; window.__saKalFinder = true;
  const passt = u => /\/iserv\/calendar\//.test(u) && !/\.(js|css|png|svg|woff2?|ico)(\?|$)/.test(u);
  const sammeln = () => {
    const urls = performance.getEntriesByType("resource").map(e => e.name).filter(passt);
    if (!urls.length) return;
    const feeds = urls.filter(u => /[?&](start|from|begin)=/i.test(u));
    const quellen = urls.filter(u => /eventsource|sources/i.test(u) && !/[?&](start|from)=/i.test(u));
    if (!feeds.length && !quellen.length) return;
    chrome.storage.local.get(["saKalFeeds", "saKalQuellen"], d => {
      const f = [...new Set([...feeds, ...(d.saKalFeeds || [])])].slice(0, 25);
      const q = [...new Set([...quellen, ...(d.saKalQuellen || [])])].slice(0, 5);
      chrome.storage.local.set({ saKalFeeds: f, saKalQuellen: q, saKalStand: Date.now(), saKalHost: location.origin });
    });
  };
  setTimeout(sammeln, 2000); setTimeout(sammeln, 6000);
  try { new PerformanceObserver(() => sammeln()).observe({ type: "resource", buffered: true }); } catch (e) {}
})();
