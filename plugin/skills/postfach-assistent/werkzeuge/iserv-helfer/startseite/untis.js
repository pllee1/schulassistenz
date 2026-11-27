/* Schulassistenz-Startseite · WebUntis direkt lesen (ab Helfer 0.32)
   Zeigt auf „Heute“, was der Helfer über deine Anmeldung aus WebUntis liest: Änderungen im Stundenplan, Prüfungen,
   Hausaufgaben und offene Klassenbuch-Stunden. Jeder Bereich hat einen eigenen Schalter (Einrichtung & Daten), anfangs ist alles aus.
   Lesend, mit einer Ausnahme (ab 0.38, eigener Schalter, anfangs aus): Aus der Live-Beobachtung trägt der Helfer nach Vorschau und Klick
   den Lehrstoff der Stunde in WebUntis ein. Die Daten bleiben in dieser Seite (kein Speichern, nichts geht an Claude). Namen von Personen liefert der Helfer nicht mit. */
(() => {
  const TEILE = [
    { id: "plan", name: "Änderungen im Stundenplan", text: "Vertretung, Entfall, Raumwechsel, Aufsichten (diese und nächste Woche)" },
    { id: "pruefungen", name: "Prüfungen", text: "eingetragene Klassenarbeiten und Klausuren deiner Lerngruppen (6 Wochen)" },
    { id: "hausaufgaben", name: "Hausaufgaben", text: "deine Einträge und, als Klassenleitung, alle Fächer deiner Klasse" },
    { id: "offen", name: "Offene Klassenbuch-Stunden", text: "Stunden ohne Anwesenheitskontrolle oder ohne Lehrstoff (6 Wochen)" }
  ];
  const sec = $("#untis"), einst = $("#wu-einst");
  if (!sec) return;
  const an = () => { const s = store.get("wu-direkt", {}); return TEILE.map(t => t.id).filter(id => s && s[id] === true); };
  let stand = null, lage = "", meldung = "", laeuft = false, gemerkt = "";

  const hostAus = u => { try { const x = new URL(String(u || "")); return /\.webuntis\.com$/i.test(x.hostname) && x.protocol === "https:" ? x.origin : ""; } catch (e) { return ""; } };
  async function host() {
    const fest = hostAus(store.get("wu-host", "")); if (fest) return fest;
    const ical = hostAus(store.get("ical", "")); if (ical) return ical;
    try { const d = await chrome.storage.local.get("saWuSeite"); gemerkt = hostAus(d.saWuSeite); } catch (e) {}
    return gemerkt;
  }
  const tagKurz = iso => { const d = new Date(iso + "T12:00"); return isNaN(d) ? esc(iso) : d.toLocaleDateString("de-DE", { weekday: "short" }).replace(".", "") + " " + d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }); };
  const heuteIso = () => isoTag(new Date());
  const wann = x => { const h = heuteIso(), m = isoTag(new Date(Date.now() + 864e5)); return x.tag === h ? "heute" : x.tag === m ? "morgen" : tagKurz(x.tag); };

  function planArt(x) {
    if (/^CANCELL?ED$/i.test(x.status)) return ["Entfall", "warn"];
    if (/^ADDITIONAL$/i.test(x.status) || /^ADDITIONAL_PERIOD$/i.test(x.art)) return ["Zusätzlich", "neu"];
    if (/^MOVED$/i.test(x.detail)) return ["Verlegt", "neu"];
    if (/^SUBSTITUTED$/i.test(x.detail) || x.lehrkraftGeaendert) return ["Vertretung", "neu"];
    if (x.raumAlt) return ["Raum geändert", "neu"];
    return ["Geändert", "neu"];
  }
  const planWas = x => /^BREAK_SUPERVISION$/i.test(x.art) ? "Aufsicht" : /^STAND_BY_PERIOD$/i.test(x.art) ? "Bereitschaft" : /^EVENT$/i.test(x.art) ? (x.name || "Veranstaltung") : [x.fach, x.klasse].filter(Boolean).join(" · ") || "Stunde";
  // Einzelstunden einer Doppelstunde mit gleicher Änderung zu einer Zeile zusammenfassen
  function planZeilen(liste, alle) {
    const h = heuteIso(), aus = [];
    for (const x of liste.filter(x => x.geaendert && (alle || x.tag >= h)).sort((a, b) => (a.tag + a.von).localeCompare(b.tag + b.von))) {
      const v = aus[aus.length - 1];
      if (v && v.tag === x.tag && v.bis === x.von && planWas(v) === planWas(x) && planArt(v)[0] === planArt(x)[0] && v.raum === x.raum && v.text === x.text) v.bis = x.bis;
      else aus.push({ ...x });
    }
    return aus;
  }
  const zeile = (zeit, haupt, marke, klasse, neben) => `<li class="wu-z"><span class="wu-zeit">${zeit}</span><span class="wu-haupt">${haupt}${neben ? `<span class="wu-neben">${neben}</span>` : ""}</span>${marke ? `<span class="wu-marke ${klasse || ""}">${esc(marke)}</span>` : ""}</li>`;
  const block = (titel, zahl, zeilen, leer, max) => {
    const zu = zeilen.length > max;
    return `<div class="wu-block"><h4>${esc(titel)}${zahl ? ` <span class="nx-zahl">${zahl}</span>` : ""}</h4>${zeilen.length
      ? `<ul class="wu-liste">${zeilen.slice(0, max).join("")}</ul>${zu ? `<details class="wu-mehr"><summary>${zeilen.length - max} weitere</summary><ul class="wu-liste">${zeilen.slice(max).join("")}</ul></details>` : ""}`
      : `<p class="note">${esc(leer)}</p>`}</div>`;
  };

  function zeichnen() {
    const teile = an();
    if (!teile.length) { sec.hidden = true; sec.innerHTML = ""; return; }
    sec.hidden = false;
    const zu = store.get("wu-zu", false);
    const uhr = stand ? new Date(stand.stand).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "";
    let h = `<div class="nx-kopf"><h3 id="wu-h" class="klapp-t" role="button" tabindex="0" aria-expanded="${!zu}">WebUntis</h3><span class="note">${laeuft ? "lädt …" : uhr ? "Stand " + uhr : ""}</span><span class="sp"></span>
      <button class="linkbtn" id="wu-neu"${laeuft ? " disabled" : ""}>Aktualisieren</button><button class="linkbtn" id="wu-auf">In WebUntis öffnen</button><button class="linkbtn" id="wu-wahl">Bereiche wählen</button></div>`;
    sec.classList.toggle("zu", !!zu);
    if (!zu) {
      if (lage === "abgemeldet") h += `<p class="note wu-hinweis">Du bist in diesem Browser nicht bei WebUntis angemeldet. <button class="btn primary small" id="wu-login">WebUntis öffnen und anmelden</button></p>`;
      else if (lage === "adresse") h += `<p class="note wu-hinweis">Die Adresse deiner Schule in WebUntis fehlt noch. Trage sie unter <button class="linkbtn" id="wu-wahl2">Einrichtung &amp; Daten</button> ein.</p>`;
      else if (lage) h += `<p class="note wu-hinweis">${esc(meldung || "WebUntis konnte nicht gelesen werden.")}</p>`;
      const d = (stand && stand.daten) || {}, f = (stand && stand.fehler) || {};
      const fehlt = id => f[id] ? `<div class="wu-block"><h4>${esc(TEILE.find(t => t.id === id).name)}</h4><p class="note">${esc(f[id])}</p></div>` : "";
      if (stand) {
        h += `<div class="wu-raster">`;
        if (teile.includes("plan")) h += d.plan ? (() => { const z = planZeilen(d.plan); return block("Änderungen im Stundenplan", z.length, z.map(x => { const [m, k] = planArt(x); return zeile(`${wann(x)} ${esc(x.von)}`, esc(planWas(x)) + (x.raum ? ` <span class="wu-raum">${esc(x.raum)}${x.raumAlt && x.raumAlt !== x.raum ? ` <s>${esc(x.raumAlt)}</s>` : ""}</span>` : ""), m, k, esc(x.text)); }), "Keine Änderungen bis Ende nächster Woche.", 5); })() : fehlt("plan");
        if (teile.includes("pruefungen")) h += d.pruefungen ? (() => { const z = pruefMitHinweisen(); return block("Prüfungen", z.length, z.map(x => zeile(`${wann(x)} ${esc(x.von)}`, esc([x.fach, x.klassen].filter(Boolean).join(" · ") || x.name) + (x.raeume ? ` <span class="wu-raum">${esc(x.raeume)}</span>` : ""), x.hinweise.length ? "Überschneidung" : x.art, x.hinweise.length ? "warn" : "", esc([x.hinweise.length ? "Achtung: " + x.hinweise.join("; ") : "", x.hinweise.length ? x.art : "", x.name, x.anzahl != null ? x.anzahl + " Schüler:innen" : "", x.text].filter(Boolean).join(" · ")))), "Keine Prüfungen in den nächsten sechs Wochen.", 4); })() : fehlt("pruefungen");
        if (teile.includes("hausaufgaben")) h += d.hausaufgaben ? (() => { const hI = heuteIso(), z = d.hausaufgaben.filter(x => x.faellig >= hI); return block("Hausaufgaben fällig", z.length, z.map(x => zeile(x.faellig === hI ? "heute" : tagKurz(x.faellig), esc([x.fach, x.klasse].filter(Boolean).join(" · ")), x.eigen ? "meine" : "", "neu", esc(x.text + (x.bemerkung ? " · " + x.bemerkung : "")))), "Keine Hausaufgaben mit Termin ab heute.", 4); })() : fehlt("hausaufgaben");
        if (teile.includes("offen")) h += d.offen ? (() => { const z = d.offen.liste.slice().sort((a, b) => (b.tag + b.von).localeCompare(a.tag + a.von)); return block("Offene Klassenbuch-Stunden", z.length, z.map(x => zeile(`${tagKurz(x.tag)} ${esc(x.von)}`, esc([x.fach, x.klassen].filter(Boolean).join(" · ")), [x.anwesenheit ? "Anwesenheit" : "", x.thema ? "Lehrstoff" : ""].filter(Boolean).join(" + ") || "offen", "warn", "")), "Alles eingetragen.", 4); })() : fehlt("offen");
        h += `</div>`;
      } else if (!lage) h += `<p class="note">${laeuft ? "WebUntis wird gelesen …" : ""}</p>`;
    }
    sec.innerHTML = h;
    const k = (id, f) => { const b = sec.querySelector(id); if (b) b.addEventListener("click", f); };
    k("#wu-neu", () => holen());
    k("#wu-h", () => { store.set("wu-zu", !store.get("wu-zu", false)); zeichnen(); });
    const auf = async () => { const o = await host(); if (o) chrome.runtime.sendMessage({ cmd: "tab", url: o + "/WebUntis/" }); };
    k("#wu-auf", auf); k("#wu-login", auf);
    const wahl = () => { location.hash = "#einstellungen"; setTimeout(() => { if (einst) einst.scrollIntoView({ behavior: "smooth", block: "center" }); }, 200); };
    k("#wu-wahl", wahl); k("#wu-wahl2", wahl);
  }

  const wocheNeu = () => { try { if (typeof renderWoche === "function") renderWoche(); } catch (e) {} };
  async function holen() {
    const teile = an();
    if (!teile.length || laeuft) { zeichnen(); return; }
    laeuft = true; zeichnen();
    try {
      const o = await host();
      if (!o) { lage = "adresse"; stand = null; return; }
      const r = await chrome.runtime.sendMessage({ cmd: "wu-direkt", host: o, teile });
      if (r && r.ok) { stand = r; lage = ""; meldung = ""; }
      else { lage = (r && r.art) || "fehler"; meldung = (r && r.fehler) || ""; if (lage === "abgemeldet" || lage === "adresse") stand = null; }
    } catch (e) { lage = "fehler"; meldung = "Der Helfer antwortet nicht. Bitte die Seite neu laden."; }
    finally { laeuft = false; zeichnen(); wocheNeu(); }
  }

  /* Schalter unter „Einrichtung & Daten“ */
  async function einstZeichnen() {
    if (!einst) return;
    const s = store.get("wu-direkt", {}), o = await host();
    einst.querySelector("#wu-schalter").innerHTML = TEILE.map(t => `<label class="wu-schalter"><input type="checkbox" data-wu="${t.id}"${s && s[t.id] === true ? " checked" : ""}><span><b>${esc(t.name)}</b><br><span class="note">${esc(t.text)}</span></span></label>`).join("")
      + `<p class="note" style="margin:10px 0 2px"><b>In WebUntis eintragen</b> (der Helfer schreibt nur hier, nur nach Vorschau und deinem Klick)</p><label class="wu-schalter"><input type="checkbox" id="wu-stoff-an"${stoffAn() ? " checked" : ""}><span><b>Lehrstoff aus der Live-Beobachtung</b><br><span class="note">Knopf „Lehrstoff“ in der Live-Beobachtung: Text eingeben, Vorschau ansehen, dann trägt der Helfer ihn bei der Stunde in WebUntis ein.</span></span></label>`
      + `<label class="wu-schalter"><input type="checkbox" id="wu-abw-an"${abwAn() ? " checked" : ""}><span><b>Abwesende aus der Live-Beobachtung</b><br><span class="note">Knopf „Abwesende“ in der Live-Beobachtung: Wer dort als krank oder fehlt markiert ist, wird nach Vorschau im Klassenbuch der Stunde als abwesend eingetragen. Dafür öffnet sich das Klassenbuch in einem neuen Tab. Verspätungen trägst du weiter selbst ein.</span></span></label>`
      + `<label class="wu-schalter"><input type="checkbox" id="wu-spaet-an"${spaetAn() ? " checked" : ""}><span><b>Verspätung sofort eintragen</b><br><span class="note">Ohne Vorschau: Sobald du in der Live-Beobachtung „zu spät“ mit Minuten speicherst, trägt der Helfer die Verspätung in der gerade laufenden Stunde ein. WebUntis nimmt dafür die Uhrzeit dieses Moments, nicht deine Minuten. Das Klassenbuch öffnet sich kurz in einem Tab im Hintergrund.</span></span></label>`
      + `<label class="wu-adr">WebUntis-Adresse deiner Schule<input type="url" id="wu-host" class="mono" placeholder="https://deine-schule.webuntis.com" value="${esc(o)}"></label>`;
    einst.querySelectorAll("[data-wu]").forEach(c => c.addEventListener("change", () => {
      const neu = Object.assign({}, store.get("wu-direkt", {})); neu[c.dataset.wu] = c.checked; store.set("wu-direkt", neu);
      if (!an().length) { stand = null; lage = ""; }
      wocheNeu(); holen();
    }));
    einst.querySelector("#wu-stoff-an").addEventListener("change", e => { store.set("wu-schreiben", Object.assign({}, store.get("wu-schreiben", {}), { stoff: e.target.checked })); stoffKnopf(); });
    einst.querySelector("#wu-abw-an").addEventListener("change", e => { store.set("wu-schreiben", Object.assign({}, store.get("wu-schreiben", {}), { abw: e.target.checked })); abwKnopf(); });
    einst.querySelector("#wu-spaet-an").addEventListener("change", e => { store.set("wu-schreiben", Object.assign({}, store.get("wu-schreiben", {}), { spaet: e.target.checked })); });
    const feld = einst.querySelector("#wu-host");
    feld.addEventListener("change", async () => { const v = hostAus(feld.value.trim()); store.set("wu-host", v); if (!v) await einstZeichnen(); holen(); });
  }

  /* ---- Lehrstoff aus der Live-Beobachtung in WebUntis eintragen (ab 0.38) ----
     Ablauf: Knopf „Lehrstoff“ im Kopf der Live-Beobachtung → Stunde wählen, Text schreiben → Vorschau → erst „Jetzt in WebUntis eintragen“ schreibt. */
  const stoffAn = () => (store.get("wu-schreiben", {}) || {}).stoff === true;
  const raster = $("#raster");
  let st = null;   // { lage: "laden"|"bearbeiten"|"vorschau"|"senden"|"fertig"|"fehler", stunden, wahl, text, meldung }
  const stGruppe = () => { try { return typeof R !== "undefined" && R ? R : null; } catch (e) { return null; } };
  const stSchluessel = () => { const r = stGruppe(); return r ? `live-stoff-${r.gid}-${r.heute}` : ""; };
  const stStd = () => st && st.stunden ? st.stunden[st.wahl] : null;
  const stAlt = s => [...new Set((s ? s.themen : []).map(x => (x.text || "").trim()).filter(Boolean))];
  const stName = s => `${s.von} bis ${s.bis} · ${[s.fach, s.klasse].filter(Boolean).join(" · ") || "Stunde"}`;
  function stoffKnopf() {
    if (!raster) return;
    const kopf = raster.querySelector(".r-kopf"), da = raster.querySelector("#r-stoff"), ende = kopf && (kopf.querySelector("#r-ende") || kopf.querySelector("#r-zurueck"));
    if (!stoffAn() || !ende) { if (da) da.remove(); const f = raster.querySelector("#r-stoff-feld"); if (f) f.remove(); return; }
    if (!da) { const b = document.createElement("button"); b.className = "btn ghost small"; b.id = "r-stoff"; b.textContent = "Lehrstoff"; b.title = "Lehrstoff dieser Stunde in WebUntis eintragen (mit Vorschau)"; b.addEventListener("click", () => { if (st) { st = null; stoffZeichnen(); } else stoffOeffnen(); }); kopf.insertBefore(b, ende); }
    if (st && !raster.querySelector("#r-stoff-feld")) stoffZeichnen();
  }
  async function stoffOeffnen() {
    st = { lage: "laden", stunden: null, wahl: 0, text: store.get(stSchluessel(), ""), meldung: "" }; stoffZeichnen();
    let r; try { const o = await host(); r = o ? await chrome.runtime.sendMessage({ cmd: "wu-stoff", op: "lesen", host: o }) : { ok: false, fehler: "Die WebUntis-Adresse deiner Schule fehlt noch (Einrichtung & Daten)." }; } catch (e) { r = { ok: false, fehler: "Der Helfer antwortet nicht. Bitte die Seite neu laden." }; }
    if (!st) return;
    if (!r || !r.ok) { st.lage = "fehler"; st.meldung = (r && r.fehler) || "WebUntis konnte nicht gelesen werden."; stoffZeichnen(); return; }
    st.stunden = r.stunden || [];
    if (!st.stunden.length) { st.lage = "fehler"; st.meldung = "Für heute steht in WebUntis keine Stunde von dir, in die Lehrstoff eingetragen werden kann."; stoffZeichnen(); return; }
    // Vorauswahl: die Stunde, in der die Live-Beobachtung begonnen wurde, sonst die laufende oder zuletzt begonnene
    const g = stGruppe(), jetzt = (g && g.zeit) || hhmm(new Date());
    let w = st.stunden.findIndex(x => x.von <= jetzt && jetzt <= x.bis);
    if (w < 0) { w = 0; st.stunden.forEach((x, i) => { if (x.von <= jetzt) w = i; }); }
    st.wahl = w; if (!st.text) st.text = stAlt(stStd())[0] || "";
    st.lage = "bearbeiten"; stoffZeichnen();
  }
  function stoffZeichnen() {
    if (!raster) return;
    let f = raster.querySelector("#r-stoff-feld");
    if (!st) { if (f) f.remove(); return; }
    const kopf = raster.querySelector(".r-kopf"); if (!kopf) return;
    if (!f) { f = document.createElement("div"); f.id = "r-stoff-feld"; f.className = "wu-stoff"; kopf.insertAdjacentElement("afterend", f); }
    const s = stStd(), alt = stAlt(s);
    let h = `<div class="nx-kopf"><h3>Lehrstoff für WebUntis</h3><span class="sp"></span><button class="linkbtn" id="st-zu">Schließen</button></div>`;
    if (st.lage === "laden") h += `<p class="note">Deine Stunden von heute werden aus WebUntis gelesen …</p>`;
    else if (st.lage === "fehler") h += `<p class="note wu-hinweis">${esc(st.meldung)}</p>`;
    else if (st.lage === "bearbeiten") {
      const sperre = s.themen.some(x => !x.kann) ? "WebUntis lässt für diese Stunde keinen Lehrstoff von dir zu." : s.themen.some(x => x.anhaenge) ? "An dieser Stunde hängen Dateien. Bitte den Lehrstoff dort direkt in WebUntis ändern." : "";
      h += `<label class="wu-adr">Stunde<select id="st-wahl">${st.stunden.map((x, i) => `<option value="${i}"${i === st.wahl ? " selected" : ""}>${esc(stName(x))}${x.ids.length > 1 ? " (Doppelstunde)" : ""}${stAlt(x).length ? " · hat schon Lehrstoff" : ""}</option>`).join("")}</select></label>
        <label class="wu-adr">Lehrstoff<textarea id="st-text" rows="3" maxlength="1000" placeholder="Was war Inhalt der Stunde? Bitte keine Namen von Schüler:innen.">${esc(st.text)}</textarea></label>
        ${alt.length ? `<p class="note">Steht bisher in WebUntis: „${esc(alt.join("“ / „"))}“. Dein Text ersetzt das.</p>` : ""}
        ${st.meldung ? `<p class="note wu-hinweis">${esc(st.meldung)}</p>` : ""}${sperre ? `<p class="note wu-hinweis">${esc(sperre)}</p>` : ""}
        <div class="actions"><button class="btn primary small" id="st-vor"${sperre ? " disabled" : ""}>Vorschau</button><span class="note">Noch wird nichts eingetragen.</span></div>`;
    } else if (st.lage === "vorschau" || st.lage === "senden") {
      h += `<p class="note">Das wird in WebUntis eingetragen:</p><dl class="wu-vorschau"><dt>Stunde</dt><dd>heute, ${esc(stName(s))}${s.ids.length > 1 ? " (beide Stunden der Doppelstunde)" : ""}</dd><dt>Lehrstoff</dt><dd class="is-mailtext">${esc(st.text)}</dd>${alt.length ? `<dt>Ersetzt</dt><dd>„${esc(alt.join("“ / „"))}“</dd>` : ""}</dl>
        <div class="actions"><button class="btn primary small" id="st-los"${st.lage === "senden" ? " disabled" : ""}>${st.lage === "senden" ? "Wird eingetragen …" : "Jetzt in WebUntis eintragen"}</button><button class="btn ghost small" id="st-zurueck"${st.lage === "senden" ? " disabled" : ""}>Zurück</button></div>`;
    } else if (st.lage === "fertig") h += `<p class="note wu-ok">${esc(st.meldung)}</p><div class="actions"><button class="btn ghost small" id="st-nochmal">Ändern</button></div>`;
    f.innerHTML = h;
    const k = (id, fn, ev) => { const b = f.querySelector(id); if (b) b.addEventListener(ev || "click", fn); };
    k("#st-zu", () => { st = null; stoffZeichnen(); });
    k("#st-wahl", e => { st.wahl = +e.target.value; st.meldung = ""; if (!st.text.trim()) st.text = stAlt(stStd())[0] || ""; stoffZeichnen(); }, "change");
    k("#st-text", e => { st.text = e.target.value; store.set(stSchluessel(), st.text); }, "input");
    k("#st-vor", () => { st.text = st.text.trim(); if (!st.text) { st.meldung = "Bitte zuerst den Lehrstoff eingeben."; stoffZeichnen(); return; } st.meldung = ""; st.lage = "vorschau"; stoffZeichnen(); });
    k("#st-zurueck", () => { st.lage = "bearbeiten"; stoffZeichnen(); });
    k("#st-nochmal", () => stoffOeffnen());
    k("#st-los", async () => {
      if (st.lage !== "vorschau") return;
      st.lage = "senden"; stoffZeichnen();
      let r; try { r = await chrome.runtime.sendMessage({ cmd: "wu-stoff", op: "schreiben", host: await host(), ids: s.ids, text: st.text }); } catch (e) { r = { ok: false, fehler: "Der Helfer antwortet nicht. Bitte in WebUntis nachsehen, ob der Eintrag angekommen ist." }; }
      if (!st) return;
      if (r && r.ok) { st.lage = "fertig"; st.meldung = r.stimmt ? `Eingetragen und in WebUntis nachgelesen: ${stName(s)}.` : "WebUntis hat den Eintrag angenommen, zeigt aber einen anderen Text. Bitte in WebUntis nachsehen."; store.set(stSchluessel(), ""); if (an().includes("offen")) holen(); }
      else { st.lage = "bearbeiten"; st.meldung = (r && r.fehler) || "Der Eintrag hat nicht geklappt."; }
      stoffZeichnen();
    });
  }
  /* ---- Abwesende aus der Live-Beobachtung im WebUntis-Klassenbuch eintragen (ab 0.39) ----
     Wer in der Live-Beobachtung als krank oder fehlt markiert ist. Vorschau, dann öffnet der Helfer das Klassenbuch der Stunde und trägt ein. */
  const abwAn = () => (store.get("wu-schreiben", {}) || {}).abw === true;
  let ab = null;   // { lage: "laden"|"bearbeiten"|"vorschau"|"senden"|"fertig"|"fehler", stunden, wahl, meldung, erg }
  const abListe = () => { const r = stGruppe(); if (!r) return []; return [...new Set((r.eintraege || []).filter(e => e.kat === "A" && e.st !== "spät").map(e => e.k))].map(k => { const n = (r.namen || {})[k] || {}; return { k, vor: n.vor || "", nach: n.nach || "" }; }); };
  const abWer = x => { const r = stGruppe(); return esc(x.k) + (r && r.namenZeigen && (x.vor || x.nach) ? ` <span class="wu-raum">${esc([x.vor, x.nach].filter(Boolean).join(" "))}</span>` : ""); };
  function abwKnopf() {
    if (!raster) return;
    const kopf = raster.querySelector(".r-kopf"), da = raster.querySelector("#r-abw"), ende = kopf && kopf.querySelector("#r-ende");
    if (!abwAn() || !ende) { if (da) da.remove(); const f = raster.querySelector("#r-abw-feld"); if (f) f.remove(); return; }
    if (!da) { const b = document.createElement("button"); b.className = "btn ghost small"; b.id = "r-abw"; b.textContent = "Abwesende"; b.title = "Als krank oder fehlt Markierte im WebUntis-Klassenbuch eintragen (mit Vorschau)"; b.addEventListener("click", () => { if (ab) { ab = null; abwZeichnen(); } else abwOeffnen(); }); kopf.insertBefore(b, ende); }
    if (ab) abwZeichnen();
  }
  async function abwOeffnen() {
    ab = { lage: "laden", stunden: null, wahl: 0, meldung: "", erg: null }; abwZeichnen();
    let r; try { const o = await host(); r = o ? await chrome.runtime.sendMessage({ cmd: "wu-stoff", op: "lesen", host: o }) : { ok: false, fehler: "Die WebUntis-Adresse deiner Schule fehlt noch (Einrichtung & Daten)." }; } catch (e) { r = { ok: false, fehler: "Der Helfer antwortet nicht. Bitte die Seite neu laden." }; }
    if (!ab) return;
    if (!r || !r.ok) { ab.lage = "fehler"; ab.meldung = (r && r.fehler) || "WebUntis konnte nicht gelesen werden."; abwZeichnen(); return; }
    ab.stunden = r.stunden || [];
    if (!ab.stunden.length) { ab.lage = "fehler"; ab.meldung = "Für heute steht in WebUntis keine Stunde von dir."; abwZeichnen(); return; }
    const g = stGruppe(), jetzt = (g && g.zeit) || hhmm(new Date());
    let w = ab.stunden.findIndex(x => x.von <= jetzt && jetzt <= x.bis);
    if (w < 0) { w = 0; ab.stunden.forEach((x, i) => { if (x.von <= jetzt) w = i; }); }
    ab.wahl = w; ab.lage = "bearbeiten"; abwZeichnen();
  }
  function abwZeichnen() {
    if (!raster) return;
    let f = raster.querySelector("#r-abw-feld");
    if (!ab) { if (f) f.remove(); return; }
    const kopf = raster.querySelector(".r-kopf"); if (!kopf) return;
    if (!f) { f = document.createElement("div"); f.id = "r-abw-feld"; f.className = "wu-stoff"; kopf.insertAdjacentElement("afterend", f); }
    const s = ab.stunden ? ab.stunden[ab.wahl] : null, alle = abListe(), mit = alle.filter(x => x.vor && x.nach), ohne = alle.filter(x => !(x.vor && x.nach));
    let h = `<div class="nx-kopf"><h3>Abwesende für WebUntis</h3><span class="sp"></span><button class="linkbtn" id="ab-zu">Schließen</button></div>`;
    if (ab.lage === "laden") h += `<p class="note">Deine Stunden von heute werden aus WebUntis gelesen …</p>`;
    else if (ab.lage === "fehler") h += `<p class="note wu-hinweis">${esc(ab.meldung)}</p>`;
    else if (ab.lage === "bearbeiten" || ab.lage === "vorschau" || ab.lage === "senden") {
      const vor = ab.lage !== "bearbeiten", laeuft = ab.lage === "senden";
      h += vor ? `<p class="note">Das wird in WebUntis eingetragen:</p>` : "";
      h += `<dl class="wu-vorschau"><dt>Stunde</dt><dd>${vor ? "heute, " + esc(stName(s)) : `<select id="ab-wahl">${ab.stunden.map((x, i) => `<option value="${i}"${i === ab.wahl ? " selected" : ""}>${esc(stName(x))}${x.ids.length > 1 ? " (Doppelstunde)" : ""}</option>`).join("")}</select>`}</dd>
        <dt>Abwesend</dt><dd>${mit.length ? mit.map(abWer).join(", ") : `<span class="note">Niemand. Markiere in der Liste „krank“ oder „fehlt“.</span>`}</dd>
        ${ohne.length ? `<dt>Nicht dabei</dt><dd>${ohne.map(abWer).join(", ")} <span class="note">(kein Name in der Kürzelliste, bitte selbst eintragen)</span></dd>` : ""}</dl>
        <p class="note">${vor ? "WebUntis öffnet sich mit dem Klassenbuch dieser Stunde in einem neuen Tab. Wer dort schon abwesend ist, bleibt unverändert. Der Grund bleibt offen." : "Verspätungen und Gründe überträgt der Helfer nicht. Die Namen werden nur in diesem Browser mit der Schülerliste von WebUntis verglichen."}</p>
        ${ab.meldung ? `<p class="note wu-hinweis">${esc(ab.meldung)}</p>` : ""}
        <div class="actions">${vor ? `<button class="btn primary small" id="ab-los"${laeuft ? " disabled" : ""}>${laeuft ? "Wird eingetragen …" : "Jetzt in WebUntis eintragen"}</button><button class="btn ghost small" id="ab-zurueck"${laeuft ? " disabled" : ""}>Zurück</button>` : `<button class="btn primary small" id="ab-vor"${mit.length ? "" : " disabled"}>Vorschau</button><span class="note">Noch wird nichts eingetragen.</span>`}</div>`;
    } else if (ab.lage === "fertig") {
      const e = ab.erg || {}, li = (t, l) => l && l.length ? `<dt>${t}</dt><dd>${l.map(k => abWer(alle.find(x => x.k === k) || { k })).join(", ")}</dd>` : "";
      h += `<dl class="wu-vorschau">${li("Eingetragen", e.eingetragen)}${li("War schon abwesend", e.schon)}${li("Nicht gefunden", e.unbekannt)}</dl>
        <p class="note${e.bestaetigt ? "" : " wu-hinweis"}">${e.bestaetigt ? "WebUntis führt die Eingetragenen jetzt als abwesend." : "WebUntis hat den Eintrag nicht sichtbar bestätigt. Bitte im geöffneten Tab nachsehen."}${e.unbekannt && e.unbekannt.length ? " Nicht Gefundene bitte im geöffneten Klassenbuch selbst eintragen (Name weicht ab oder Kind gehört nicht zu dieser Stunde)." : ""}</p>`;
    }
    f.innerHTML = h;
    const k = (id, fn, ev) => { const b = f.querySelector(id); if (b) b.addEventListener(ev || "click", fn); };
    k("#ab-zu", () => { ab = null; abwZeichnen(); });
    k("#ab-wahl", e => { ab.wahl = +e.target.value; ab.meldung = ""; }, "change");
    k("#ab-vor", () => { ab.meldung = ""; ab.lage = "vorschau"; abwZeichnen(); });
    k("#ab-zurueck", () => { ab.lage = "bearbeiten"; abwZeichnen(); });
    k("#ab-los", async () => {
      if (ab.lage !== "vorschau") return;
      const kinder = abListe().filter(x => x.vor && x.nach); if (!kinder.length) { ab.lage = "bearbeiten"; abwZeichnen(); return; }
      ab.lage = "senden"; abwZeichnen();
      let r; try { r = await chrome.runtime.sendMessage({ cmd: "wu-abw", host: await host(), ids: s.ids, kinder }); } catch (e) { r = { ok: false, fehler: "Der Helfer antwortet nicht. Bitte in WebUntis nachsehen, ob etwas eingetragen wurde." }; }
      if (!ab) return;
      if (r && r.ok) { ab.lage = "fertig"; ab.erg = r; if (an().includes("offen")) holen(); }
      else { ab.lage = "bearbeiten"; ab.meldung = (r && r.fehler) || "Der Eintrag hat nicht geklappt."; }
      abwZeichnen();
    });
  }
  /* ---- Verspätung sofort eintragen (ab 0.39, Pauls Wunsch 25.11.): ohne Vorschau, in der laufenden Stunde ---- */
  const spaetAn = () => (store.get("wu-schreiben", {}) || {}).spaet === true;
  let sp = [];   // Meldungen dieser Stunde: { k, lage: "laeuft"|"ok"|"offen"|"fehler", text }
  function spaetZeichnen() {
    if (!raster) return;
    let f = raster.querySelector("#r-spaet-feld");
    const kopf = raster.querySelector(".r-kopf");
    if (!sp.length || !kopf) { if (f) f.remove(); return; }
    if (!f) { f = document.createElement("div"); f.id = "r-spaet-feld"; f.className = "wu-stoff wu-spaet"; kopf.insertAdjacentElement("afterend", f); }
    f.innerHTML = sp.slice(-4).map(x => `<p class="note${x.lage === "fehler" || x.lage === "offen" ? " wu-hinweis" : ""}"><b>${esc(x.k)}</b> ${esc(x.text)}</p>`).join("") + `<button class="linkbtn" id="sp-zu">Ausblenden</button>`;
    f.querySelector("#sp-zu").addEventListener("click", () => { sp = []; spaetZeichnen(); });
  }
  async function spaetSofort(k) {
    if (!spaetAn()) return;
    const r = stGruppe(), n = (r && r.namen && r.namen[k]) || {}, m = { k, lage: "laeuft", text: "Verspätung wird in WebUntis eingetragen …" };
    sp.push(m); spaetZeichnen();
    if (!n.vor || !n.nach) { m.lage = "fehler"; m.text = "hat keinen Namen in der Kürzelliste. Verspätung bitte selbst in WebUntis eintragen."; spaetZeichnen(); return; }
    let a; try { const o = await host(); a = o ? await chrome.runtime.sendMessage({ cmd: "wu-abw", op: "spaet", host: o, kinder: [{ k, vor: n.vor, nach: n.nach }] }) : { ok: false, fehler: "Die WebUntis-Adresse deiner Schule fehlt noch (Einrichtung & Daten)." }; } catch (e) { a = { ok: false, fehler: "Der Helfer antwortet nicht. Bitte in WebUntis nachsehen." }; }
    if (!a || !a.ok) { m.lage = "fehler"; m.text = ((a && a.fehler) || "Der Eintrag hat nicht geklappt.") + " Nicht eingetragen."; }
    else if (a.unbekannt && a.unbekannt.length) { m.lage = "fehler"; m.text = "wurde in der Schülerliste dieser Stunde nicht gefunden. Verspätung bitte im geöffneten Klassenbuch selbst eintragen."; }
    else if (a.bestaetigt) { m.lage = "ok"; m.text = "Verspätung in WebUntis eingetragen (" + hhmm(new Date()) + " Uhr)."; }
    else { m.lage = "offen"; m.text = "Verspätung an WebUntis gesendet, aber nicht sichtbar bestätigt. Bitte im geöffneten Klassenbuch-Tab nachsehen."; }
    spaetZeichnen();
  }
  if (raster) new MutationObserver(() => { const r = stGruppe(); if (!r || raster.hidden) { st = null; ab = null; sp = []; return; } stoffKnopf(); abwKnopf(); if (sp.length && !raster.querySelector("#r-spaet-feld")) spaetZeichnen(); }).observe(raster, { childList: true });

  einstZeichnen(); zeichnen();
  if (an().length) holen();
  // Nach einer Pause (Tab war im Hintergrund) neu lesen, höchstens alle 10 Minuten
  document.addEventListener("visibilitychange", () => { if (!document.hidden && an().length && !laeuft && (!stand || Date.now() - stand.stand > 6e5)) holen(); });
  /* ---- Prüfungen für den Wochenplaner, mit Hinweisen auf Überschneidungen (ab 0.44) ----
     Geprüft wird nur, was WebUntis für deine Prüfungen liefert, und was in deinen Kalendern steht:
     zwei Prüfungen einer Klasse am selben Tag, mehr als drei in einer Woche, zeitgleiche Prüfungen, Prüfung während eines Kalendertermins. */
  const pruefListe = () => an().includes("pruefungen") && stand && stand.daten && Array.isArray(stand.daten.pruefungen) ? stand.daten.pruefungen : [];
  const pruefKl = x => String(x.klassen || "").split(",").map(k => k.trim()).filter(Boolean);
  const pruefMo = iso => { const d = new Date(iso + "T12:00"); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return isoTag(d); };
  const pruefName = x => [x.art, x.fach, x.klassen].filter(Boolean).join(" ") || x.name || "Prüfung";
  const schneidet = (a1, a2, b1, b2) => a1 && a2 && b1 && b2 && a1 < b2 && b1 < a2;
  function pruefMitHinweisen() {
    const l = pruefListe().slice().sort((a, b) => (a.tag + a.von).localeCompare(b.tag + b.von)).map(x => Object.assign({}, x, { hinweise: [] }));
    const jeWoche = {};
    l.forEach((x, i) => {
      for (const k of pruefKl(x)) { const s = pruefMo(x.tag) + "|" + k; (jeWoche[s] = jeWoche[s] || []).push(i); }
      l.forEach((y, j) => {
        if (j <= i || y.tag !== x.tag) return;
        const gem = pruefKl(x).filter(k => pruefKl(y).includes(k));
        if (schneidet(x.von, x.bis, y.von, y.bis)) { x.hinweise.push(`zeitgleich mit ${pruefName(y)} (${y.von})`); y.hinweise.push(`zeitgleich mit ${pruefName(x)} (${x.von})`); }
        else if (gem.length) { x.hinweise.push(`${gem.join(", ")} schreibt am selben Tag auch ${[y.art, y.fach].filter(Boolean).join(" ") || "eine Prüfung"}`); y.hinweise.push(`${gem.join(", ")} schreibt am selben Tag auch ${[x.art, x.fach].filter(Boolean).join(" ") || "eine Prüfung"}`); }
      });
      // Kalendertermine mit Uhrzeit am selben Tag (aus den eingebundenen Kalendern der Startseite)
      try { if (typeof termineAm === "function") for (const t of termineAm(x.tag).filter(t => t.art === "kal" && !t.weg && t.zeit && t.bis)) if (schneidet(x.von, x.bis, t.zeit, t.bis)) x.hinweise.push(`überschneidet sich mit dem Termin „${typeof titelSicher === "function" ? titelSicher(t.titel) : "Termin"}“ (${t.zeit} bis ${t.bis})`); } catch (e) {}
    });
    for (const s in jeWoche) if (jeWoche[s].length > 3) for (const i of jeWoche[s]) l[i].hinweise.push(`${s.split("|")[1]} hat in dieser Woche ${jeWoche[s].length} Prüfungen`);
    return l;
  }
  /* Für „Woche planen“ und planung/stundenplan.md (start-a.js): Prüfungen eines Tages als Textzeilen, Hinweise getrennt */
  const pruefungen = iso => pruefMitHinweisen().filter(x => x.tag === iso).map(x => ({ text: `${x.von}${x.bis ? "–" + x.bis : ""} ${pruefName(x)}${x.raeume ? " (" + x.raeume + ")" : ""}${x.anzahl != null ? ", " + x.anzahl + " Arbeiten" : ""}`, hinweise: x.hinweise.slice() }));

  /* Für die Wochenansicht (start-a.js): Änderungen eines Tages, Doppelstunden zusammengefasst. Leer, solange der Bereich aus ist. */
  const aenderungen = iso => !an().includes("plan") || !stand || !stand.daten || !stand.daten.plan ? []
    : planZeilen(stand.daten.plan.filter(x => x.tag === iso), true).map(x => ({ von: x.von, bis: x.bis, fach: x.fach, was: planWas(x), marke: planArt(x)[0], aus: /^CANCELL?ED$/i.test(x.status), raum: x.raum, raumAlt: x.raumAlt, text: x.text }));
  window.saUntis = { holen, aenderungen, pruefungen, spaetSofort, _test: { planArt, planWas, planZeilen } };
})();
