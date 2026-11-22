/* Schulassistenz-Startseite · Einstellungen auf andere PCs mitnehmen (ab Helfer 0.28)
   1. Hält eine Kopie der Browser-Einstellungen in Dateien, die über Cloud-Speicher bzw. IServ auf andere PCs mitkommen:
      - <Datenordner>/werkzeuge/startseite/browser-einstellungen.json: Einstellungen der Startseite und des Helfers,
        ohne Namen und ohne persönliche Links (kein iCal-Link, keine eigenen Kalender-Links mit Schlüssel).
      - <Schülerdaten>/kuerzellisten/helfer-personen.json: eigener Name und automatische Kürzel P1, P2 … des Helfers.
        Liegt bei den Kürzellisten, weil Namen darin stehen, und geht wie diese nie an Claude.
   2. Findet die Startseite auf einem PC zum ersten Mal eine solche Datei von einem anderen PC, bietet sie „Übernehmen“ an.
      Bis zur Entscheidung schreibt dieser PC nichts, damit die gute Kopie nicht von einem leeren Browser überschrieben wird.
   3. Gibt dem Helfer die Kürzellisten aus kuerzellisten/ (alle Dateien, alle Blätter), damit niemand sie mehr hineinziehen muss.
      Eine von Hand hineingezogene Datei bleibt zusätzlich erhalten (steht zuerst, wichtig für Anreden beim Rückweg). */
(() => {
  const DATEI = ["werkzeuge", "startseite", "browser-einstellungen.json"];
  const PERSONEN = ["kuerzellisten", "helfer-personen.json"];
  // Nur in diesem Browser: persönlicher Stundenplan-Link, Zwischenspeicher, Zustand dieser Funktion
  const NIE = new Set(["ical", "ical-ok", "plan-cache", "kal-cache", "kal-fehler", "einr-zu", "tab", "umzug", "umzug-stand", "geraet-id"]);
  const HELFER = ["ziel", "knopf", "saWuStart", "saWuSeite", "saKbSeite", "saLebZiele", "saLebOrigin", "saKalHost"];
  const geheim = s => /https?:\/\/[^"\s]*(\.ics\b|ical|[?&](otp|token|key|secret|school)=)/i.test(String(s || ""));
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36) + ":" + s.length; };
  const geraet = () => { let id = store.get("geraet-id", ""); if (!id) { id = Math.random().toString(36).slice(2, 10); store.set("geraet-id", id); } return id; };
  const zeitDE = t => { try { return new Date(t).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };
  const hatChrome = () => !!(window.chrome && chrome.storage && chrome.storage.local);

  async function ordnerPfad(root, teile, anlegen) {
    let d = root; for (const t of teile.slice(0, -1)) d = await d.getDirectoryHandle(t, anlegen ? { create: true } : undefined); return d;
  }
  async function jsonLesen(root, teile) {
    if (!root) return null;
    try { const d = await ordnerPfad(root, teile); const t = await lies(await d.getFileHandle(teile[teile.length - 1])); return t ? JSON.parse(t) : null; } catch { return null; }
  }
  async function darfSchreiben(h) { try { return (await h.queryPermission({ mode: "readwrite" })) === "granted"; } catch { return false; } }

  /* ---------- Was mitkommt ---------- */
  function lokaleWerte() {
    const l = {}; let weg = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i); if (!k || !k.startsWith("sa-")) continue;
      const n = k.slice(3); if (NIE.has(n)) continue;
      let v = localStorage.getItem(k);
      if (n === "kal-quellen") {   // IServ-Kalender (Anmeldung über den Browser) ja, eigene Kalender-Links nein
        try { const q = JSON.parse(v) || []; const gut = q.filter(x => !x.url || (/\/caldav\//i.test(x.url) && !geheim(x.url))); weg += q.length - gut.length; v = JSON.stringify(gut); } catch { continue; }
      } else if (geheim(v)) { weg++; continue; }
      l[n] = v;
    }
    return { l, weg };
  }
  async function helferWerte() {
    if (!hatChrome()) return { h: {}, p: null };
    const d = await chrome.storage.local.get([...HELFER, "ichName", "personenAuto"]);
    const h = {}; for (const k of HELFER) if (d[k] !== undefined && !geheim(JSON.stringify(d[k]))) h[k] = d[k];
    const auto = d.personenAuto || {};
    const p = (d.ichName || Object.keys(auto).length) ? { ichName: d.ichName || "", personenAuto: auto } : null;
    return { h, p };
  }

  /* ---------- Sichern (nur wenn sich etwas geändert hat und Schreiben ohne Rückfrage erlaubt ist) ---------- */
  let laeuft = false, zuletzt = null, ohneRecht = false, angebot = null, weggelassen = 0;
  async function sichern(mitNachfrage) {
    if (laeuft || !ordnerHandle) return;
    const m = store.get("umzug", null); if (!m || !m.entschieden) return;
    laeuft = true;
    try {
      const { l, weg } = lokaleWerte(); weggelassen = weg;
      const { h, p } = await helferWerte();
      const inhalt = JSON.stringify({ startseite: l, helfer: h });
      const personen = p ? JSON.stringify(p) : "";
      const stand = store.get("umzug-stand", {});
      const neu = { a: hash(inhalt), b: personen ? hash(personen) : stand.b || "" };
      if (neu.a !== stand.a) {
        let ok = await darfSchreiben(ordnerHandle);
        if (!ok && mitNachfrage) { try { await schreibRecht(); ok = true; } catch {} }
        ohneRecht = !ok;
        if (ok) {
          const d = await ordnerPfad(ordnerHandle, DATEI, true);
          await schreibe(d, DATEI[DATEI.length - 1], JSON.stringify({
            hinweis: "Schulassistenz: Einstellungen der Startseite und des Helfers für andere PCs. Ohne Namen, ohne Stundenplan-Link. Wird von der Startseite geschrieben.",
            version: 1, stand: new Date().toISOString(), geraet: geraet(), startseite: l, helfer: h }, null, 1));
          stand.a = neu.a; zuletzt = Date.now();
        }
      }
      const sd = sdRoot();
      if (personen && neu.b !== stand.b && sd && (sd instanceof DavOrdner || await darfSchreiben(sd))) {
        try {
          const d = await ordnerPfad(sd, PERSONEN, true);
          await schreibe(d, PERSONEN[1], JSON.stringify({ hinweis: "Schulassistenz-Helfer: eigener Name und automatische Kürzel (P1, P2 …). Enthält Namen: nie hochladen.", version: 1, stand: new Date().toISOString(), geraet: geraet(), ...p }, null, 1));
          stand.b = neu.b;
        } catch (e) { console.warn("helfer-personen.json:", e); }
      }
      store.set("umzug-stand", stand);
    } catch (e) { console.warn("Einstellungen sichern:", e); }
    finally { laeuft = false; }
    renderEinrichtung();
  }

  /* ---------- Übernehmen ---------- */
  async function uebernehmen() {
    const a = angebot && angebot.a; if (!a) return;
    let n = 0;
    for (const [k, v] of Object.entries(a.startseite || {})) { if (NIE.has(k) || typeof v !== "string") continue; try { localStorage.setItem("sa-" + k, v); n++; } catch {} }
    if (hatChrome()) {
      const h = {}; for (const k of HELFER) if (a.helfer && a.helfer[k] !== undefined) h[k] = a.helfer[k];
      const b = angebot.b;
      if (b) {
        const d = await chrome.storage.local.get({ ichName: "", personenAuto: {} });
        if (!d.ichName && b.ichName) h.ichName = b.ichName;
        const mein = d.personenAuto || {}, belegt = new Set(Object.values(mein)), neu = { ...mein };
        for (const [name, k] of Object.entries(b.personenAuto || {})) if (!(name in neu) && !belegt.has(k)) { neu[name] = k; belegt.add(k); }
        h.personenAuto = neu;
      }
      await chrome.storage.local.set(h);
    }
    store.set("umzug", { entschieden: "uebernommen", zeit: Date.now(), von: a.stand, anzahl: n });
    store.set("umzug-stand", {});
    location.reload();
  }
  function behalten() {
    store.set("umzug", { entschieden: "behalten", zeit: Date.now() });
    angebot = null; zeigeAngebot(); sichern(false);
  }

  function zeigeAngebot() {
    let el = $("#umzug-hw");
    if (!angebot) { if (el) el.remove(); renderEinrichtung(); return; }
    const hw = $("#hinweise"); if (!hw) return;
    if (!el) { el = document.createElement("div"); el.id = "umzug-hw"; el.className = "hw"; hw.prepend(el); }
    el.innerHTML = `<span><b>Einstellungen von deinem anderen PC gefunden</b> (Stand ${esc(zeitDE(angebot.a.stand))}): Kalender, Filter, Favoriten, Sitzpläne, WebUntis- und LEB-Zuordnungen${angebot.b ? ", eigener Name und Kürzel für Kolleg:innen" : ""}. Den Stundenplan-Link trägst du hier einmal neu ein.</span>
      <button class="btn primary small" id="umzug-ja">Übernehmen</button><button class="btn ghost small" id="umzug-nein">Nicht nötig</button>`;
    $("#umzug-ja").addEventListener("click", uebernehmen);
    $("#umzug-nein").addEventListener("click", behalten);
    einrOffen = true; renderEinrichtung();
  }

  /* ---------- Kürzellisten für den Helfer ---------- */
  // Kopfzeile: mind. zwei gefüllte Zellen, eine davon heißt Kürzel/Code/Pseudonym (eine Titelzeile „Kürzelliste 10d“ darüber zählt nicht)
  const kopfZeile = z => (z || []).filter(x => String(x || "").trim()).length >= 2 && (z || []).some(x => /^\s*(k(ü|ue)rzel|sch(ü|ue)ler-?code|code|pseudonym|ersatz)\b/i.test(String(x || "")));
  function zeilenEinlesen(zeilen) {
    const i = zeilen.findIndex(kopfZeile);
    return window.SAPseudo.tabelleEinlesen(i > 0 ? zeilen.slice(i) : zeilen);
  }
  async function dateiEinlesen(name, f) {
    const buf = await f.arrayBuffer();
    if (/\.xlsx$/i.test(name)) {
      if (!window.XLSX) return [];
      const wb = XLSX.read(buf, { type: "array" }); let l = [];
      for (const n of wb.SheetNames) l = l.concat(zeilenEinlesen(XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: false, defval: "" })));
      return l;
    }
    let txt = new TextDecoder().decode(buf); if (txt.includes("�")) txt = new TextDecoder("windows-1252").decode(buf);
    txt = txt.replace(/^﻿/, "");
    const l0 = txt.split("\n")[0]; const sep = l0.includes("\t") ? "\t" : ((l0.match(/;/g) || []).length >= (l0.match(/,/g) || []).length ? ";" : ",");
    return zeilenEinlesen(txt.split(/\r?\n/).map(z => z.split(sep).map(c => c.replace(/^"|"$/g, "").trim())));
  }
  const dedupe = l => { const s = new Set(), out = []; for (const r of l) { const k = r.orig + "\u0001" + r.kurz; if (!s.has(k)) { s.add(k); out.push(r); } } return out; };
  let listeInfo = null;
  const skript = src => new Promise(ok => { const x = document.createElement("script"); x.src = src; x.onload = ok; x.onerror = ok; document.head.appendChild(x); });
  async function helferListe() {
    if (!hatChrome()) return;
    const sd = sdRoot(); if (!sd) return;
    let kl; try { kl = await sd.getDirectoryHandle("kuerzellisten"); } catch { return; }
    const dateien = [];
    try { for await (const [n, fh] of kl.entries()) if (fh.kind === "file" && /\.(xlsx|csv)$/i.test(n) && !/^~\$/.test(n) && !/vorlage/i.test(n)) dateien.push([n, fh]); } catch { return; }
    dateien.sort((a, b) => a[0].localeCompare(b[0], "de", { numeric: true }));
    if (!dateien.length) return;
    if (!window.SAPseudo) await skript("../pseudo.js");
    if (!window.XLSX && dateien.some(([n]) => /\.xlsx$/i.test(n))) await skript("../lib/xlsx.mini.min.js");
    if (!window.SAPseudo) return;
    let auto = [], gelesen = [];
    for (const [n, fh] of dateien) { try { const l = await dateiEinlesen(n, await fh.getFile()); if (l.length) { auto = auto.concat(l); gelesen.push(n); } } catch (e) { console.warn("Kürzelliste", n, e); } }
    if (!auto.length) return;
    auto = dedupe(auto);
    const d = await chrome.storage.local.get({ liste: [], listeExtra: null, listeAutoTeil: null });
    let extra = d.listeExtra;
    if (extra === null) {   // erster Lauf: was bisher hineingezogen war und nicht in den Kürzellisten steht, bleibt zusätzlich
      const s = new Set(auto.map(r => r.orig + "\u0001" + r.kurz));
      extra = (d.liste || []).filter(r => !s.has(r.orig + "\u0001" + r.kurz));
    }
    const liste = dedupe(extra.concat(auto));
    listeInfo = { dateien: gelesen, auto: auto.length, extra: extra.length };
    if (d.listeExtra !== null && JSON.stringify(d.listeAutoTeil) === JSON.stringify(auto)) return;
    await chrome.storage.local.set({ liste, listeExtra: extra, listeAutoTeil: auto, listeAutoInfo: { dateien: gelesen, stand: Date.now(), ort: sdExtern() ? sdPfad("kuerzellisten") : pfad("kuerzellisten") } });
  }

  /* ---------- Nach dem Einlesen der Ordner (aus start-a.js) ---------- */
  let geprueft = false;
  window.saNachLesen = async () => {
    try { await helferListe(); } catch (e) { console.warn("Kürzellisten für den Helfer:", e); }
    if (!ordnerHandle) return;
    const m = store.get("umzug", null);
    if (!m || !m.entschieden) {
      if (geprueft && angebot) return;
      geprueft = true;
      const a = await jsonLesen(ordnerHandle, DATEI);
      if (!a || !a.startseite || a.geraet === geraet()) { store.set("umzug", { entschieden: a ? "eigene" : "erste", zeit: Date.now() }); return sichern(false); }
      angebot = { a, b: await jsonLesen(sdRoot(), PERSONEN) };
      return zeigeAngebot();
    }
    if (!angebot && m.entschieden === "uebernommen" && !m.gemeldet) {
      store.set("umzug", { ...m, gemeldet: true });
      setTimeout(() => { try { toast(`Einstellungen vom anderen PC übernommen. Jetzt noch den Stundenplan-Link eintragen (Heute › Stundenplan).`); } catch {} }, 800);
    }
    sichern(false);
  };
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") sichern(false); });
  setInterval(() => sichern(false), 5 * 60 * 1000);

  /* ---------- Punkt in „Einrichtung auf diesem PC“ ---------- */
  window.saUmzugPunkte = () => {
    const m = store.get("umzug", null);
    const punkte = [];
    if (angebot) punkte.push({ id: "umzug", pflicht: false, ok: false, titel: "Einstellungen vom anderen PC übernehmen",
      hilfe: `Gefunden: Stand ${zeitDE(angebot.a.stand)}. Übernimmt Kalender, Filter, Favoriten, Sitzpläne, WebUntis- und LEB-Zuordnungen${angebot.b ? ", deinen Namen und die Kürzel für Kolleg:innen" : ""}. Der Stundenplan-Link bleibt draußen.`,
      knopf: ["Übernehmen", uebernehmen] });
    else if (m && m.entschieden) {
      const st = store.get("umzug-stand", {});
      punkte.push({ id: "umzug", pflicht: false, ok: !ohneRecht && !!st.a, titel: "Einstellungen für andere PCs gesichert",
        hilfe: ohneRecht ? "Die Seite darf gerade nicht in den Datenordner schreiben. Einmal „Erlauben“ klicken." :
          `Liegt in ${pfad(DATEI.join("/"))}${weggelassen ? ` (ohne ${weggelassen} Kalender-Link${weggelassen === 1 ? "" : "s"} mit persönlichem Schlüssel)` : ""}. Ein anderer PC übernimmt sie beim ersten Öffnen der Startseite.${listeInfo ? ` Der Helfer nutzt automatisch ${listeInfo.dateien.length} Kürzelliste${listeInfo.dateien.length === 1 ? "" : "n"}${listeInfo.extra ? " plus deine hineingezogene Liste" : ""}.` : ""}`,
        knopf: ohneRecht || !st.a ? ["Erlauben und sichern", () => sichern(true)] : null });
    }
    return punkte;
  };
})();
