/* Schulassistenz-Helfer – LEB-online (Noten PLUS)
   Füllt im Fenster „Bewerten“ die Noten aus dem bereitgelegten Paket der Startseite (Notenübersicht › „Nach LEB-online“)
   und füllt „Anlegen“ vor. Klickt NIE „Speichern“ oder „Löschen“, ruft keine Adresse auf, überschreibt vorhandene Noten nur
   nach Häkchen. Die Namen kommen aus deiner Kürzelliste und bleiben in diesem Browser. */
(() => {
  if (window.__saLeb) return; window.__saLeb = true;
  const notenSel = [...document.querySelectorAll('select[name^="note["]')];
  const artSel = document.querySelector('select[name="leistungsarten_id"]');
  const istBewerten = notenSel.length > 0 && notenSel.every(s => s.closest("tr"));
  const istAnlegen = !!artSel && !!document.querySelector('input[name="bezeichnung"]');
  const U = new URL(location.href);
  const sid = U.searchParams.get("sid");
  const bereich = (location.pathname.match(/\/lernstandskontrolle\/(kurse|klassen)\//) || [])[1] || null;
  const gParam = b => b === "kurse" ? "kurse_id" : "zeug_klassen_faecher_id";
  const istListeL = !istBewerten && !istAnlegen && /\/leistungen\/index\.php$/.test(location.pathname) && !!U.searchParams.get(gParam(bereich));
  const istListeG = !istBewerten && !istAnlegen && /\/lernstandskontrolle\/(kurse|klassen)\/index\.php$/.test(location.pathname);
  // Sitzung merken (nur in diesem Browser), damit die Startseite LEB-online direkt an der richtigen Stelle öffnen kann
  if (sid) try { chrome.runtime.sendMessage({ cmd: "leb-sitzung", origin: location.origin, sid }).catch(() => { }); } catch { }
  if (!istBewerten && !istAnlegen && !istListeL && !istListeG) return;

  // ---------- Namen vergleichen ----------
  const norm = s => String(s || "").toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[-‐–]/g, " ").replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
  // LEB zeigt „Nachname, Vorname(n)“
  function lebName(t) {
    const s = String(t || "").replace(/\s+/g, " ").trim(); const i = s.indexOf(",");
    return i < 0 ? { nach: norm(s), vor: "" } : { nach: norm(s.slice(0, i)), vor: norm(s.slice(i + 1)) };
  }
  // streng: gleicher Nachname und gleicher Vorname; sonst gleicher Nachname und ein Vorname ist der Anfang des anderen (nur wenn eindeutig)
  // Die Kürzelliste kann Vor- und Nachname vertauscht haben; deshalb zählen beide Reihenfolgen.
  const reihen = e => { const a = norm(e.nach), b = norm(e.vor); return a === b ? [[a, b]] : [[a, b], [b, a]]; };
  const vorPasst = (a, b) => !!a && !!b && (a === b || b.startsWith(a + " ") || a.startsWith(b + " "));
  const streng = (e, n) => reihen(e).some(([na, vo]) => na === n.nach && vo === n.vor);
  const locker = (e, n) => reihen(e).some(([na, vo]) => na === n.nach && vorPasst(vo, n.vor));
  // erst exakt, dann gleicher Nachname + ein Vorname ist der Anfang des anderen (nur wenn in beide Richtungen eindeutig)
  function zuordnen(zeilen, eintraege) {
    const frei = new Set(eintraege.map((_, i) => i));
    const erg = zeilen.map(() => null);
    zeilen.forEach((z, zi) => {
      const t = [...frei].filter(i => streng(eintraege[i], z.n));
      if (t.length === 1) { erg[zi] = t[0]; frei.delete(t[0]); }
    });
    zeilen.forEach((z, zi) => {
      if (erg[zi] != null) return;
      const t = [...frei].filter(i => locker(eintraege[i], z.n));
      if (t.length !== 1) return;
      const e = eintraege[t[0]];
      if (zeilen.some((y, yi) => yi !== zi && erg[yi] == null && locker(e, y.n))) return;
      erg[zi] = t[0]; frei.delete(t[0]);
    });
    return { erg, uebrig: [...frei] };
  }

  // ---------- Oberfläche (Design „Graphit & Heft“) ----------
  const host = document.createElement("div"); host.id = "sa-leb";
  const root = host.attachShadow({ mode: "closed" });
  root.innerHTML = `<style>
    :host{all:initial}
    .bar{color-scheme:dark;position:fixed;top:10px;right:10px;z-index:2147483647;width:min(430px,calc(100vw - 20px));max-height:calc(100vh - 20px);overflow:auto;background:#191816;color:#efe8da;border:1px solid #38342f;border-top:4px solid #e9786a;border-radius:10px;box-shadow:0 18px 50px rgba(0,0,0,.5);padding:12px 14px;font:13.5px/1.45 system-ui,"Segoe UI",sans-serif}
    .bar.klein .rest{display:none}
    h2{font:700 15px Georgia,serif;margin:0 0 8px;display:flex;align-items:center;gap:8px}
    h2 span{flex:1}
    .x{background:none;border:0;color:#aaa196;font-size:18px;cursor:pointer;padding:0 4px}
    .was{background:#22201d;border-radius:8px;padding:7px 9px;margin-bottom:8px}
    .was b{color:#8fb3e8}
    .row{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
    button.b{padding:7px 12px;border-radius:8px;border:1px solid #8fb3e8;background:#8fb3e8;color:#101a2b;font-weight:700;cursor:pointer;font-size:13px}
    button.b2{background:transparent;color:#efe8da;border-color:#38342f;font-weight:400}
    button.b2:hover{border-color:#8fb3e8}
    button:disabled{opacity:.5;cursor:default}
    .info{font-size:12px;color:#aaa196;margin-top:6px}
    .warn{border:1px solid #e0b45c;background:#2c2618;border-radius:8px;padding:7px 9px;margin:6px 0}
    .ok{border:1px solid #79b98a;background:#1b2a1f;border-radius:8px;padding:7px 9px;margin:6px 0}
    ul{margin:4px 0 0;padding-left:18px}
    li{margin:2px 0}
    .tag{display:inline-block;min-width:14px;padding:0 6px;border-radius:9px;font-size:12px;font-weight:700;margin-right:4px}
    .t-neu{background:#79b98a;color:#10200f}.t-gleich{background:#4a463f;color:#efe8da}.t-anders{background:#e0b45c;color:#2b1f05}.t-fehlt{background:#e9786a;color:#2a0f0b}
    label.ub{display:flex;gap:6px;align-items:center;margin:2px 0}
  </style><div class="bar" role="region" aria-label="Schulassistenz-Helfer für LEB-online"><h2><span>Schulassistenz · LEB-online</span><button class="x" id="mini" title="Ein-/ausklappen">–</button><button class="x" id="zu" title="Schließen">×</button></h2><div class="rest" id="inhalt">Lade …</div></div>`;
  document.documentElement.appendChild(host);
  const $ = s => root.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  $("#zu").addEventListener("click", () => host.remove());
  $("#mini").addEventListener("click", () => $(".bar").classList.toggle("klein"));
  const zeigen = html => { $("#inhalt").innerHTML = html; };
  const ART = { 1: "mündlich/fachspezifisch", 2: "schriftlich" };
  const datumDE = iso => { const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? `${m[3]}.${m[2]}.${m[1]}` : String(iso || ""); };

  async function paketHolen() {
    try { const r = await chrome.runtime.sendMessage({ cmd: "leb-paket" }); return r && r.paket ? r.paket : null; } catch { return null; }
  }
  const ohnePaket = `<p>Noch keine Noten bereitgelegt.</p><p class="info">So geht's: Startseite öffnen (Helfer-Symbol) › Notenübersicht › Lerngruppe wählen › „Nach LEB-online“ › Leistung wählen › „Für LEB-online bereitlegen“. Danach dieses Fenster neu laden.</p>`;

  // ---------- Anlegen vorausfüllen ----------
  async function anlegen() {
    const p = await paketHolen();
    if (!p) return zeigen(ohnePaket);
    zeigen(`<div class="was">Bereitgelegt: <b>${esc(p.titel)}</b><br>${esc(p.gruppe)} · ${esc(ART[p.leistungsart] || "")} · ${esc(datumDE(p.datum))}</div>
      <div class="row"><button class="b" id="fill">Formular vorausfüllen</button></div>
      <p class="info">Setzt Leistungsart, Datum und Bezeichnung. Gewichtung und Notiz bleiben, wie sie sind. Gespeichert wird erst, wenn du „Speichern“ klickst.</p><div id="msg"></div>`);
    $("#fill").addEventListener("click", () => {
      const setze = (el, v) => { if (!el || v == null || v === "") return false; el.value = String(v); el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); el.style.outline = "3px solid #e0b45c"; return true; };
      const n = [setze(artSel, p.leistungsart), setze(document.querySelector('input[name="datum"]'), datumDE(p.datum)), setze(document.querySelector('input[name="bezeichnung"]'), p.bezeichnung)].filter(Boolean).length;
      $("#msg").innerHTML = `<div class="ok">${n} Felder ausgefüllt (gelb umrandet). Bitte prüfen und dann selbst „Speichern“ klicken. Danach „Bewerten“ öffnen.</div>`;
    });
    const bez = document.querySelector('input[name="bezeichnung"]');
    if (window.name === "sa-anlegen" && bez && !bez.value.trim()) $("#fill").click();
  }

  // ---------- Bewerten ----------
  const zeilen = notenSel.map(sel => {
    const tr = sel.closest("tr");
    const zelle = [...tr.cells].find(c => !c.contains(sel) && !c.querySelector("select,input,textarea") && c.textContent.trim());
    return { sel, tr, n: lebName(zelle ? zelle.textContent : ""), name: zelle ? zelle.textContent.trim() : "", nt: tr.querySelector('input[name^="nicht_abgefragt["]') };
  });
  const lebWert = z => { const v = parseInt(z.sel.value, 10); return v >= 1 && v <= 6 ? v : null; };
  const markiere = (z, farbe) => { z.tr.style.outline = farbe ? `3px solid ${farbe}` : ""; z.tr.style.outlineOffset = "-2px"; };
  const FARBE = { neu: "#79b98a", anders: "#e0b45c", fehlt: "#e9786a" };

  function vergleich(p) {
    const { erg, uebrig } = zuordnen(zeilen, p.eintraege);
    const r = { neu: [], gleich: [], anders: [], ohne: [], lebOhneAkte: [], nichtZu: [], uebrig: uebrig.map(i => p.eintraege[i]).filter(e => e.note != null) };
    zeilen.forEach((z, zi) => {
      const i = erg[zi]; const e = i == null ? null : p.eintraege[i]; const l = lebWert(z);
      if (!e) { r.nichtZu.push({ z }); return; }
      if (e.note == null) { (l == null ? r.ohne : r.lebOhneAkte).push({ z, e, l }); return; }
      if (l == null) r.neu.push({ z, e }); else if (l === e.note) r.gleich.push({ z, e, l }); else r.anders.push({ z, e, l });
    });
    r.quote = zeilen.length ? (zeilen.length - r.nichtZu.length) / zeilen.length : 0;
    return r;
  }

  // Leistungsart laut Seitenkopf (Text über dem Formular): 1 mündlich, 2 schriftlich, null unklar
  function seitenArt() {
    try {
      const f = notenSel[0].form; if (!f) return null;
      const r = document.createRange(); r.setStart(document.body, 0); r.setEndBefore(f);
      const t = r.toString().toLowerCase(); const m = /m(ü|ue)ndlich/.test(t), sc = /schriftlich/.test(t);
      return m && !sc ? 1 : sc && !m ? 2 : null;
    } catch { return null; }
  }
  // Bezeichnung, Datum und Art dieser Leistungsüberprüfung aus der Liste (Fenster, aus dem „Bewerten“ geöffnet wurde, sonst Liste neu laden)
  let infoCache;
  // Zeilen einer LEB-Liste (Leistungsüberprüfungen): id, Bezeichnung, Datum, Leistungsart – keine Namen
  function tabelleZeilen(doc) {
    const trs = [...doc.querySelectorAll('tr[id^="t"]')].filter(t => /^t\d+$/.test(t.id));
    if (!trs.length) return [];
    const tab = trs[0].closest("table");
    const kopf = [...tab.querySelectorAll("tr")].find(x => !trs.includes(x) && (x.querySelector("th") || /datum/i.test(x.textContent)));
    const th = kopf ? [...kopf.cells].map(c => c.textContent.trim().toLowerCase()) : [];
    return trs.map(tr => {
      const zelle = n => { const i = th.findIndex(t => t.startsWith(n)); return i >= 0 && tr.cells[i] ? tr.cells[i].textContent.trim() : ""; };
      return { id: tr.id.slice(1), tr, bezeichnung: zelle("bezeichnung"), datum: zelle("datum"), art: zelle("leistungsart") };
    });
  }
  async function leistungInfo() {
    if (infoCache !== undefined) return infoCache;
    infoCache = null;
    try {
      const u = new URL(location.href);
      const id = u.searchParams.get("leistungen_id") || u.searchParams.get("leistungen_kurse_id");
      if (!id) return null;
      const ausTabelle = doc => { const z = tabelleZeilen(doc).find(x => x.id === String(id)); return z ? { bezeichnung: z.bezeichnung, datum: z.datum, art: z.art } : null; };
      try { if (window.opener && window.opener.document) infoCache = ausTabelle(window.opener.document); } catch { }
      if (!infoCache) {
        const q = new URLSearchParams();
        for (const k of ["sid", "zeug_klassen_faecher_id", "kurse_id"]) if (u.searchParams.get(k)) q.set(k, u.searchParams.get(k));
        const buf = await fetch(new URL("index.php?" + q, location.href), { credentials: "include" }).then(r => r.arrayBuffer());
        infoCache = ausTabelle(new DOMParser().parseFromString((() => { try { return new TextDecoder("utf-8", { fatal: true }).decode(buf); } catch { return new TextDecoder("windows-1252").decode(buf); } })(), "text/html"));
      }
    } catch { infoCache = null; }
    return infoCache;
  }
  const bezNorm = t => norm(t).replace(/\b(nr|nummer)\b/g, "").replace(/\s+/g, " ").trim();
  async function bewerten(meldung = "") {
    const p = await paketHolen();
    if (!p) return zeigen(ohnePaket);
    const r = vergleich(p);
    zeilen.forEach(z => markiere(z, ""));
    const info = await leistungInfo();
    const infoArt = info && info.art ? (/m(ü|ue)ndlich/i.test(info.art) ? 1 : /schriftlich/i.test(info.art) ? 2 : null) : null;
    const sArt = infoArt != null ? infoArt : seitenArt();
    const artFalsch = sArt != null && p.leistungsart && +p.leistungsart !== sArt;
    const bezGleich = !!(info && info.bezeichnung && bezNorm(info.bezeichnung) === bezNorm(p.bezeichnung || p.titel));
    const gruppeOk = r.quote >= 0.5;
    const passt = gruppeOk && !artFalsch;
    const liste = (a, f) => a.length ? `<ul>${a.map(f).join("")}</ul>` : "";
    zeigen(`<div class="was">Bereitgelegt: <b>${esc(p.titel)}</b><br>${esc(p.gruppe)} · ${esc(ART[p.leistungsart] || "")}${p.datum ? " · " + esc(datumDE(p.datum)) : ""}</div>
      ${meldung}
      ${info && info.bezeichnung ? (bezGleich ? `<div class="ok">Passt: Dieses Fenster ist „${esc(info.bezeichnung)}“${info.datum ? " vom " + esc(info.datum) : ""}.</div>` : `<div class="warn"><b>Andere Leistung?</b> Dieses Fenster ist „${esc(info.bezeichnung)}“${info.datum ? " vom " + esc(info.datum) : ""}, bereitgelegt ist „${esc(p.bezeichnung || p.titel)}“.</div>`) : ""}
      ${artFalsch ? `<div class="warn"><b>Falsche Leistung?</b> Bereitgelegt ist „${esc(p.titel)}“ (${esc(ART[p.leistungsart])}), dieses Fenster gehört aber zu einer Leistungsüberprüfung „${esc(ART[sArt])}“. Eintragen ist gesperrt. Bitte in der Startseite die richtige Leistung bereitlegen.</div>` : ""}
      ${gruppeOk ? "" : `<div class="warn"><b>Passt die Lerngruppe?</b> Nur ${zeilen.length - r.nichtZu.length} von ${zeilen.length} Namen in diesem Fenster stehen in der Kürzelliste von ${esc(p.gruppe)}. Eintragen ist gesperrt.</div>`}
      <div><span class="tag t-neu">${r.neu.length}</span>werden neu eingetragen</div>
      <div><span class="tag t-gleich">${r.gleich.length}</span>stehen schon so in LEB-online</div>
      <div><span class="tag t-anders">${r.anders.length}</span>stehen in LEB-online anders (nur mit Häkchen überschreiben)</div>
      ${r.anders.length > 1 ? `<label class="ub"><input type="checkbox" id="alle-ueb">alle abweichenden mit der Akten-Note überschreiben</label>` : ""}
      ${liste(r.anders, (x, i) => `<li><label class="ub"><input type="checkbox" class="ueb" data-i="${i}">${esc(x.z.name)} (${esc(x.e.k)}): LEB ${x.l}, Akte ${x.e.note} · überschreiben</label></li>`)}
      <div><span class="tag t-fehlt">${r.nichtZu.length + r.uebrig.length}</span>nicht zugeordnet</div>
      ${passt ? "" : `<div class="info">Liste ausgeblendet, weil fast nichts passt.</div>`}${!passt ? "" : liste(r.nichtZu, x => `<li>${esc(x.z.name)} (nicht in der Kürzelliste, bleibt leer)</li>`)}
      ${!passt ? "" : liste(r.uebrig, e => `<li>${esc(e.k)} (${esc([e.nach, e.vor].filter(Boolean).join(", "))}) steht nicht in diesem Fenster</li>`)}
      ${r.ohne.length + r.lebOhneAkte.length ? `<div class="info">${r.ohne.length + r.lebOhneAkte.length} ohne Note in der Akte (bleiben unverändert)${r.lebOhneAkte.length ? `, davon ${r.lebOhneAkte.length} mit Note in LEB-online` : ""}.</div>` : ""}
      ${passt && (r.neu.length || r.anders.length) ? `<label class="ub"><input type="checkbox" id="bestaetigt"${bezGleich ? " checked" : ""}><b>${info && info.bezeichnung && !bezGleich ? `Trotzdem: „${esc(info.bezeichnung)}“ ist die richtige Leistung für „${esc(p.titel)}“.` : `Ja, dieses Fenster ist „${esc(p.titel)}“.`}</b></label>` : ""}
      <div class="row"><button class="b" id="fill"${bezGleich && passt && (r.neu.length || r.anders.length) ? "" : " disabled"}>Noten eintragen</button><button class="b b2" id="neu">Neu prüfen</button></div>
      <p class="info">Eingetragene Felder sind grün, abweichende gelb, nicht zugeordnete rot umrandet. Prüfen, dann selbst unten „Speichern“ klicken. Nach dem Speichern zeigt dieser Kasten den Abgleich.</p>`);
    // Zuordnung Lerngruppe → LEB-Klasse/Kurs lernen (nur Kennungen, keine Namen)
    if (r.quote >= 0.9 && bereich && U.searchParams.get(gParam(bereich))) try { chrome.runtime.sendMessage({ cmd: "leb-ziel", gruppe: p.gruppe, bereich, id: U.searchParams.get(gParam(bereich)) }).catch(() => { }); } catch { }
    r.nichtZu.forEach(x => markiere(x.z, FARBE.fehlt));
    r.anders.forEach(x => markiere(x.z, FARBE.anders));
    $("#neu").addEventListener("click", () => bewerten());
    if ($("#bestaetigt")) $("#bestaetigt").addEventListener("change", e => { $("#fill").disabled = !e.target.checked; });
    if ($("#alle-ueb")) $("#alle-ueb").addEventListener("change", e => root.querySelectorAll(".ueb").forEach(c => { c.checked = e.target.checked; }));
    $("#fill").addEventListener("click", () => {
      if (!passt || !$("#bestaetigt") || !$("#bestaetigt").checked) return;
      const ueb = new Set([...root.querySelectorAll(".ueb:checked")].map(c => +c.dataset.i));
      const ziel = [...r.neu, ...r.anders.filter((_, i) => ueb.has(i))];
      let n = 0;
      for (const x of ziel) {
        const v = String(x.e.note); if (![...x.z.sel.options].some(o => o.value === v)) continue;
        x.z.sel.value = v; x.z.sel.dispatchEvent(new Event("change", { bubbles: true }));
        if (x.z.nt && x.z.nt.checked) { x.z.nt.checked = false; x.z.nt.dispatchEvent(new Event("change", { bubbles: true })); }
        n++;
      }
      bewerten(`<div class="ok">${n} ${n === 1 ? "Note" : "Noten"} eingetragen. Bitte prüfen und unten selbst „Speichern“ klicken.</div>`).then(() => ziel.forEach(x => markiere(x.z, FARBE.neu)));
    });
    // Direkt aus der Startseite geöffnet: bei passender Bezeichnung leere Felder sofort füllen (einmal je Fensterladen)
    if (window.name === "sa-bewerten" && !autoFertig && bezGleich && passt && r.neu.length) { autoFertig = true; $("#fill").click(); }
  }
  let autoFertig = false;

  // ---------- Direkter Weg: Listen-Seiten ----------
  const zielHolen = async gruppe => { try { const r = await chrome.runtime.sendMessage({ cmd: "leb-ziel-holen", gruppe }); return r && r.ziel; } catch { return null; } };
  const listeUrl = z => `${location.origin}/lernstandskontrolle/${z.bereich}/leistungen/index.php?sid=${encodeURIComponent(sid)}&${gParam(z.bereich)}=${encodeURIComponent(z.id)}`;
  const POPUP = "left=100,top=40,width=900,height=820,scrollbars=yes,resizable=yes";
  async function listeGruppen() {
    const p = await paketHolen();
    if (!p || !p.direkt) return host.remove();
    const z = await zielHolen(p.gruppe);
    if (z && sid) { zeigen(`<p>Öffne die Leistungsüberprüfungen von ${esc(p.gruppe)} …</p>`); location.href = listeUrl(z); return; }
    const anders = bereich === "kurse" ? "klassen" : "kurse";
    zeigen(`<div class="was">Direkt nach LEB-online: <b>${esc(p.titel)}</b><br>${esc(p.gruppe)}</div>
      <p>Einmalig: Welche Zeile ist <b>${esc(p.gruppe)}</b>? Bitte die Zeile anklicken, dann „Merken und weiter“. Danach geht es künftig direkt.</p>
      <div id="gew" class="info">Noch keine Zeile gewählt.</div>
      <div class="row"><button class="b" id="weiter" disabled>Merken und weiter</button><button class="b b2" id="anders">Steht unter ${anders === "kurse" ? "Kurse" : "Klassen"}</button></div>`);
    let gew = null;
    document.addEventListener("click", e => {
      const tr = e.target.closest && e.target.closest('tr[id^="t"]'); if (!tr || !/^t\d+$/.test(tr.id)) return;
      gew = tr.id.slice(1); $("#weiter").disabled = false;
      $("#gew").textContent = "Gewählt: " + [...tr.cells].map(c => c.textContent.trim()).filter(Boolean).slice(0, 6).join(" · ");
    }, true);
    $("#anders").addEventListener("click", () => { location.href = `${location.origin}/lernstandskontrolle/${anders}/index.php?sid=${encodeURIComponent(sid)}`; });
    $("#weiter").addEventListener("click", async () => {
      if (!gew) return; const neu = { bereich, id: gew };
      try { await chrome.runtime.sendMessage({ cmd: "leb-ziel", gruppe: p.gruppe, ...neu }); } catch { }
      location.href = listeUrl(neu);
    });
  }
  async function listeLeistungen() {
    const p = await paketHolen();
    if (!p || !p.direkt) return host.remove();
    const gid = U.searchParams.get(gParam(bereich));
    const z = await zielHolen(p.gruppe);
    if (z && !(z.bereich === bereich && String(z.id) === String(gid))) {
      zeigen(`<div class="warn">Diese Liste gehört nicht zu ${esc(p.gruppe)}.</div><div class="row"><button class="b" id="hin">Zu ${esc(p.gruppe)} wechseln</button></div>`);
      $("#hin").addEventListener("click", () => { location.href = listeUrl(z); }); return;
    }
    const treffer = tabelleZeilen(document).filter(x => bezNorm(x.bezeichnung) === bezNorm(p.bezeichnung || p.titel));
    const kopf = `<div class="was">Direkt nach LEB-online: <b>${esc(p.titel)}</b><br>${esc(p.gruppe)} · ${esc(ART[p.leistungsart] || "")}${p.datum ? " · " + esc(datumDE(p.datum)) : ""}</div>`;
    const bewertUrl = id => `bewertungsform.php?sid=${encodeURIComponent(sid)}&${gParam(bereich)}=${encodeURIComponent(gid)}&${bereich === "kurse" ? "leistungen_kurse_id" : "leistungen_id"}=${encodeURIComponent(id)}`;
    if (treffer.length === 1) {
      const t = treffer[0]; t.tr.style.outline = "3px solid #79b98a";
      zeigen(`${kopf}<div class="ok">„${esc(t.bezeichnung)}“${t.datum ? " vom " + esc(t.datum) : ""} ist angelegt.</div>
        <div class="row"><button class="b" id="bew">Bewerten öffnen</button><button class="b b2" id="neu">Neu prüfen</button></div>
        <p class="info">Im Bewerten-Fenster trägt der Helfer die Noten gleich ein. Prüfen, dann selbst „Speichern“ klicken.</p>`);
      $("#bew").addEventListener("click", () => window.open(bewertUrl(t.id), "sa-bewerten", POPUP));
    } else if (treffer.length > 1) {
      zeigen(`${kopf}<div class="warn">„${esc(p.bezeichnung)}“ gibt es hier ${treffer.length}-mal. Bitte die richtige Zeile markieren und wie gewohnt „Bewerten“ klicken.</div><div class="row"><button class="b b2" id="neu">Neu prüfen</button></div>`);
    } else {
      const j = (document.documentElement.innerHTML.match(/form\.php\?[^'"<>]*?jahrgaenge_id=(\d+)/) || [])[1];
      const anlegenUrl = `form.php?sid=${encodeURIComponent(sid)}${j ? "&jahrgaenge_id=" + j : ""}&${gParam(bereich)}=${encodeURIComponent(gid)}`;
      zeigen(`${kopf}<p>„${esc(p.bezeichnung || p.titel)}“ ist hier noch nicht angelegt.</p>
        <div class="row"><button class="b" id="anl">Anlegen öffnen (vorausgefüllt)</button><button class="b b2" id="neu">Neu prüfen</button></div>
        <p class="info">Im Anlegen-Fenster stehen Leistungsart, Datum und Bezeichnung schon drin. Gewichtung prüfen, selbst „Speichern“ klicken, dann hier „Neu prüfen“.</p>`);
      $("#anl").addEventListener("click", () => window.open(anlegenUrl, "sa-anlegen", POPUP));
    }
    if ($("#neu")) $("#neu").addEventListener("click", () => location.reload());
  }

  (istListeG ? listeGruppen() : istListeL ? listeLeistungen() : istBewerten ? bewerten() : anlegen()).catch(e => zeigen(`<div class="warn">Fehler: ${esc(e && e.message || e)}</div>`));
})();
