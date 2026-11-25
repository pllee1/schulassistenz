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
        if (teile.includes("pruefungen")) h += d.pruefungen ? (() => { const z = d.pruefungen.slice().sort((a, b) => (a.tag + a.von).localeCompare(b.tag + b.von)); return block("Prüfungen", z.length, z.map(x => zeile(`${wann(x)} ${esc(x.von)}`, esc([x.fach, x.klassen].filter(Boolean).join(" · ") || x.name) + (x.raeume ? ` <span class="wu-raum">${esc(x.raeume)}</span>` : ""), x.art, "", esc([x.name, x.anzahl != null ? x.anzahl + " Schüler:innen" : "", x.text].filter(Boolean).join(" · ")))), "Keine Prüfungen in den nächsten sechs Wochen.", 4); })() : fehlt("pruefungen");
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
      + `<label class="wu-adr">WebUntis-Adresse deiner Schule<input type="url" id="wu-host" class="mono" placeholder="https://deine-schule.webuntis.com" value="${esc(o)}"></label>`;
    einst.querySelectorAll("[data-wu]").forEach(c => c.addEventListener("change", () => {
      const neu = Object.assign({}, store.get("wu-direkt", {})); neu[c.dataset.wu] = c.checked; store.set("wu-direkt", neu);
      if (!an().length) { stand = null; lage = ""; }
      wocheNeu(); holen();
    }));
    einst.querySelector("#wu-stoff-an").addEventListener("change", e => { store.set("wu-schreiben", Object.assign({}, store.get("wu-schreiben", {}), { stoff: e.target.checked })); stoffKnopf(); });
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
  if (raster) new MutationObserver(() => { const r = stGruppe(); if (!r || raster.hidden) { if (st) st = null; return; } stoffKnopf(); }).observe(raster, { childList: true });

  einstZeichnen(); zeichnen();
  if (an().length) holen();
  // Nach einer Pause (Tab war im Hintergrund) neu lesen, höchstens alle 10 Minuten
  document.addEventListener("visibilitychange", () => { if (!document.hidden && an().length && !laeuft && (!stand || Date.now() - stand.stand > 6e5)) holen(); });
  /* Für die Wochenansicht (start-a.js): Änderungen eines Tages, Doppelstunden zusammengefasst. Leer, solange der Bereich aus ist. */
  const aenderungen = iso => !an().includes("plan") || !stand || !stand.daten || !stand.daten.plan ? []
    : planZeilen(stand.daten.plan.filter(x => x.tag === iso), true).map(x => ({ von: x.von, bis: x.bis, fach: x.fach, was: planWas(x), marke: planArt(x)[0], aus: /^CANCELL?ED$/i.test(x.status), raum: x.raum, raumAlt: x.raumAlt, text: x.text }));
  window.saUntis = { holen, aenderungen, _test: { planArt, planWas, planZeilen } };
})();
