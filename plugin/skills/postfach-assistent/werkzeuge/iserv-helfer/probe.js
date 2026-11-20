/* Schulassistenz-Helfer · Probe „Startseite im Helfer“ (Schritt 1 des Umzugs).
   Prüft auf einer Seite der Erweiterung: Ordnerfreigabe für den Datenordner (bleibt sie nach Neustart / Browserdaten löschen?),
   Lesen von profil.md und meine-einstellungen.js (gelesen, nicht ausgeführt), IServ-Schülerdaten über WebDAV und den Speicher der Erweiterung.
   Zeigt keine Namen und keine Inhalte von Akten. Schreibt nur beim „Schreibtest“ eine kleine Datei, die sofort wieder gelöscht wird. */
(() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const zeile = (art, text) => `<span class="chip ${art}">${{ ok: "ok", warn: "Achtung", err: "Fehler", neutral: "Info" }[art]}</span><span>${text}</span>`;
  const jetzt = () => new Date().toLocaleString("de-DE", { dateStyle: "short", timeStyle: "medium" });
  const lauf = { zeit: jetzt(), ordner: "–", iserv: "–", speicher: "–" };
  let ordner = null, einst = null;

  /* Ordner-Handle in IndexedDB der Erweiterung */
  const db = () => new Promise((ok, f) => { const r = indexedDB.open("sa-helfer-startseite", 1); r.onupgradeneeded = () => r.result.createObjectStore("handles"); r.onsuccess = () => ok(r.result); r.onerror = () => f(r.error); });
  const hGet = async k => { const d = await db(); return new Promise(ok => { const r = d.transaction("handles").objectStore("handles").get(k); r.onsuccess = () => ok(r.result); r.onerror = () => ok(null); }); };
  const hSet = async (k, v) => { const d = await db(); return new Promise(ok => { const t = d.transaction("handles", "readwrite"); t.objectStore("handles").put(v, k); t.oncomplete = ok; t.onerror = ok; }); };

  async function protokoll() {
    const { saProbe = [] } = await chrome.storage.local.get("saProbe");
    $("protokoll").innerHTML = saProbe.map(x => `<tr><td>${esc(x.zeit)}</td><td>${esc(x.ordner)}</td><td>${esc(x.iserv)}</td><td>${esc(x.speicher)}</td></tr>`).join("") || `<tr><td colspan="4">noch leer</td></tr>`;
  }
  async function merken() {
    const { saProbe = [] } = await chrome.storage.local.get("saProbe");
    const rest = saProbe.filter(x => x.zeit !== lauf.zeit);
    await chrome.storage.local.set({ saProbe: [lauf, ...rest].slice(0, 30) });
    protokoll();
  }

  async function dateiText(dir, ...teile) {
    let d = dir;
    for (const t of teile.slice(0, -1)) d = await d.getDirectoryHandle(t);
    const f = await (await d.getFileHandle(teile[teile.length - 1])).getFile();
    return { text: await f.text(), groesse: f.size };
  }

  async function ordnerPruefen(fragen) {
    const st = $("st-ordner"); $("b-erlauben").hidden = true; $("b-schreibtest").hidden = true;
    ordner = await hGet("datenordner");
    if (!ordner) { st.innerHTML = zeile("warn", "Noch kein Datenordner gewählt (oder die Freigabe ist verloren gegangen)."); lauf.ordner = "kein Ordner gemerkt"; return merken(); }
    let recht = await ordner.queryPermission({ mode: "readwrite" });
    if (recht !== "granted" && fragen) recht = await ordner.requestPermission({ mode: "readwrite" });
    if (recht !== "granted") {
      st.innerHTML = zeile("warn", `Ordner <b>${esc(ordner.name)}</b> ist gemerkt, Chrome möchte den Zugriff aber noch einmal bestätigt haben (Status: ${esc(recht)}).`);
      $("b-erlauben").hidden = false; lauf.ordner = "gemerkt, Bestätigung nötig"; return merken();
    }
    const out = [zeile("ok", `Ordner <b>${esc(ordner.name)}</b> verbunden, ohne neu zu wählen.`)];
    lauf.ordner = "verbunden";
    try { const p = await dateiText(ordner, "profil.md"); out.push(zeile("ok", `profil.md gelesen (${p.text.split("\n").length} Zeilen).`)); }
    catch (e) { out.push(zeile("err", "profil.md nicht gefunden. Ist das der richtige Ordner (schulassistenz im OneDrive)?")); lauf.ordner = "verbunden, profil.md fehlt"; }
    try {
      const m = await dateiText(ordner, "werkzeuge", "startseite", "meine-einstellungen.js");
      const r = saEinstellungenLesen(m.text); einst = r.werte.SA_EINSTELLUNGEN || null;
      if (einst && !r.fehler.length) out.push(zeile("ok", `meine-einstellungen.js gelesen, ohne sie auszuführen: ${Object.keys(einst).length} Einstellungen, ${(r.werte.SA_MEINE_KACHELN || []).length} eigene Kacheln.`));
      else out.push(zeile("err", "meine-einstellungen.js konnte nicht ausgewertet werden: " + esc(r.fehler.join("; ") || "SA_EINSTELLUNGEN fehlt")));
    } catch (e) { out.push(zeile("warn", "werkzeuge\\startseite\\meine-einstellungen.js nicht gefunden.")); }
    st.innerHTML = out.join(""); $("b-schreibtest").hidden = false;
    return merken();
  }

  $("b-waehlen").onclick = async () => {
    try {
      const h = await window.showDirectoryPicker({ id: "sa-datenordner", mode: "readwrite", startIn: "documents" });
      await hSet("datenordner", h); await ordnerPruefen(true);
    } catch (e) {
      if (e && e.name === "AbortError") return;
      $("st-ordner").innerHTML = zeile("err", "Chrome hat den Ordner abgelehnt (" + esc(e && e.message || e) + "). Bitte den Ordner schulassistenz im OneDrive wählen, nicht Z: oder I:.");
    }
  };
  $("b-erlauben").onclick = () => ordnerPruefen(true);
  $("b-schreibtest").onclick = async () => {
    try {
      const p = await ordner.getDirectoryHandle("planung", { create: true });
      const f = await p.getFileHandle(".helfer-probe.txt", { create: true });
      const w = await f.createWritable(); await w.write("Probe " + new Date().toISOString()); await w.close();
      await p.removeEntry(".helfer-probe.txt");
      $("st-ordner").insertAdjacentHTML("beforeend", zeile("ok", "Schreibtest: kleine Datei in planung\\ angelegt und wieder gelöscht."));
      lauf.ordner = "verbunden, schreiben ok"; merken();
    } catch (e) { $("st-ordner").insertAdjacentHTML("beforeend", zeile("err", "Schreibtest fehlgeschlagen: " + esc(e && e.message || e))); }
  };

  /* IServ über den Hintergrund des Helfers (dieselbe Anmeldung wie bisher, keine Brücke nötig) */
  const dav = (op, url) => chrome.runtime.sendMessage({ cmd: "dav", op, url });
  let davBasis = "";
  $("b-iserv").onclick = async () => {
    const st = $("st-iserv"); $("b-anmelden").hidden = true;
    davBasis = String((einst && einst.schuelerdaten) || "").trim().replace(/\/?$/, "/");
    if (!/^https:\/\/[^/]+\/webdav\/Files\//i.test(davBasis)) { st.innerHTML = zeile("warn", "In meine-einstellungen.js ist keine IServ-Adresse (schuelerdaten: https://…/webdav/Files/…) eingetragen, oder der Datenordner ist noch nicht verbunden."); lauf.iserv = "keine Adresse"; return merken(); }
    st.innerHTML = zeile("neutral", "Frage IServ …");
    try {
      const wurzel = await dav("liste", davBasis);
      if (!wurzel || !wurzel.ok) {
        if (wurzel && wurzel.anmelden) { st.innerHTML = zeile("warn", "IServ möchte eine Anmeldung. Bitte anmelden und danach noch einmal „IServ prüfen“."); $("b-anmelden").hidden = false; lauf.iserv = "Anmeldung nötig"; }
        else { st.innerHTML = zeile("err", esc((wurzel && wurzel.fehler) || "Keine Antwort vom Helfer")); lauf.iserv = "Fehler"; }
        return merken();
      }
      const lg = await dav("liste", davBasis + "lerngruppen/");
      const kl = await dav("liste", davBasis + "kuerzellisten/");
      const gruppen = lg.ok ? lg.eintraege.filter(e => e.dir) : [];
      const listen = kl.ok ? kl.eintraege.filter(e => !e.dir) : [];
      const out = [zeile("ok", `IServ-Ordner erreicht: ${wurzel.eintraege.length} Einträge.`),
                   zeile(gruppen.length ? "ok" : "warn", `lerngruppen: ${gruppen.length} Gruppen.`),
                   zeile(listen.length ? "ok" : "warn", `kuerzellisten: ${listen.length} Dateien.`)];
      if (gruppen[0]) {
        const g = await dav("lesen", davBasis + "lerngruppen/" + encodeURIComponent(gruppen[0].name) + "/gruppe.md");
        out.push(g.ok ? zeile("ok", `Eine gruppe.md gelesen (${(Math.round(atob(g.daten).length / 10) / 100).toLocaleString("de-DE")} KB).`) : zeile("warn", "gruppe.md der ersten Gruppe nicht lesbar."));
      }
      st.innerHTML = out.join(""); lauf.iserv = `ok (${gruppen.length} Gruppen)`;
    } catch (e) { st.innerHTML = zeile("err", "Helfer nicht erreichbar: " + esc(e && e.message || e)); lauf.iserv = "Fehler"; }
    merken();
  };
  $("b-anmelden").onclick = () => dav("anmelden", davBasis);

  /* Speicher der Erweiterung: überlebt er Neustart und „Browserdaten löschen“? */
  async function speicherPruefen() {
    const { saProbeErstmals } = await chrome.storage.local.get("saProbeErstmals");
    let ls = null; try { ls = localStorage.getItem("sa-probe-erstmals"); if (!ls) localStorage.setItem("sa-probe-erstmals", lauf.zeit); } catch (e) {}
    if (!saProbeErstmals) await chrome.storage.local.set({ saProbeErstmals: lauf.zeit });
    $("st-speicher").innerHTML =
      zeile(saProbeErstmals ? "ok" : "neutral", saProbeErstmals ? `Speicher der Erweiterung: Probe läuft seit ${esc(saProbeErstmals)}, Daten sind noch da.` : "Speicher der Erweiterung: erster Lauf, Startzeit gemerkt.") +
      zeile(ls ? "ok" : "neutral", ls ? `Seitenspeicher (wie bisher localStorage): noch da seit ${esc(ls)}.` : "Seitenspeicher (localStorage): erster Lauf oder gelöscht.");
    lauf.speicher = (saProbeErstmals ? "Erweiterung da" : "Erweiterung neu") + ", " + (ls ? "Seite da" : "Seite neu");
  }
  $("b-leeren").onclick = async () => { await chrome.storage.local.remove(["saProbe", "saProbeErstmals"]); try { localStorage.removeItem("sa-probe-erstmals"); } catch (e) {} protokoll(); };

  (async () => {
    await speicherPruefen();
    await merken();
    await ordnerPruefen(false);
    if (einst && einst.schuelerdaten) $("b-iserv").click();
  })();
})();
