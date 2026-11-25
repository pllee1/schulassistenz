/* Schulassistenz-Startseite · IServ direkt lesen (ab Helfer 0.35; Mail anzeigen und als gelesen markieren ab 0.36)
   Zeigt auf „Heute“, was der Helfer über deine Anmeldung aus IServ liest: ungelesene Mails, heutige Krankmeldungen deiner
   Schüler:innen und offene Anträge. Jeder Bereich hat einen eigenen Schalter (Einrichtung & Daten), anfangs ist alles aus.
   Lesend, mit einer Ausnahme: Der Haken an einer Mail markiert sie in IServ als gelesen (rücknehmbar). Der Helfer liefert Kürzel; Namen nur, solange im Kasten „Namen zeigen“ eingeschaltet ist. Die Daten bleiben in dieser Seite (kein Speichern, nichts geht an Claude). */
(() => {
  const TEILE = [
    { id: "mail", name: "Ungelesene Mails", text: "Anzahl im Posteingang, Absender als Kürzel und Betreff. Ein Klick auf eine Mail zeigt ihren Text (sie bleibt ungelesen), der Haken ✓ markiert sie in IServ als gelesen." },
    { id: "krank", name: "Krankmeldungen heute", text: "nur Kinder aus deinen Kürzellisten, als Kürzel (braucht DieSchulApp in IServ)" },
    { id: "antraege", name: "Offene Anträge", text: "Anzahl noch nicht bearbeiteter Beurlaubungsanträge (DieSchulApp)" }
  ];
  const sec = $("#iservk"), einst = $("#is-einst");
  if (!sec) return;
  const an = () => { const s = store.get("is-direkt", {}); return TEILE.map(t => t.id).filter(id => s && s[id] === true); };
  let stand = null, lage = "", meldung = "", laeuft = false;
  // Aufgeklappte Mails (nur in dieser Seite, nichts wird gespeichert) und die zuletzt per Haken als gelesen markierten (für „rückgängig“)
  let offen = {}, erledigt = [], mailMeldung = "";
  const mailLi = x => {
    const o = offen[x.id], kann = x.mb && x.uid != null;
    return `<li class="wu-z"><span class="wu-zeit">${esc(mailZeit(x.zeit))}</span><${kann ? `button type="button" data-is-auf="${esc(x.id)}" aria-expanded="${!!o}" title="Text der Mail hier anzeigen. In IServ bleibt sie ungelesen."` : "span"} class="wu-haupt is-auf">${wer(x.von, x.klar && x.klar.von)}${x.anhang ? ` <span class="wu-raum">mit Anhang</span>` : ""}<span class="wu-neben">${esc(namenAn() && x.klar ? x.klar.betreff : x.betreff)}</span></${kann ? "button" : "span"}>${kann ? `<button class="nx-mini is-weg" data-is-ok="${esc(x.id)}" title="In IServ als gelesen markieren"${x.wartet ? " disabled" : ""}>✓</button>` : ""}</li>`
      + (o ? `<li class="is-text">${o.laedt ? `<p class="note">Mail wird geladen …</p>` : o.fehler ? `<p class="note">${esc(o.fehler)}</p>`
        : `<div class="is-mailtext">${esc(o.text) || `<span class="note">Die Mail hat keinen Text.</span>`}</div><p class="note">${[o.gekuerzt ? "gekürzt, der ganze Text steht in IServ" : "", o.anhaenge ? `${o.anhaenge} ${o.anhaenge === 1 ? "Anhang" : "Anhänge"} (nur in IServ zu öffnen)` : "", o.ungelesen === false ? "IServ führt diese Mail jetzt als gelesen" : ""].filter(Boolean).join(" · ")}</p><p><button class="btn small" data-is-antw="${esc(x.id)}" title="Öffnet die Mail in IServ. Dort schreibst und sendest du die Antwort selbst.">In IServ antworten</button></p>`}</li>` : "");
  };
  // Namen statt Kürzel: nur auf Wunsch, nur in dieser Seite. Ausgeschaltet fragt die Seite die Namen gar nicht erst an.
  const namenAn = () => store.get("is-namen", false) === true;
  const wer = (kuerzel, klar) => namenAn() && klar ? `${esc(klar)} <span class="wu-raum">${esc(kuerzel)}</span>` : esc(kuerzel);

  const hostAus = u => { try { const x = new URL(String(u || "").trim()); return x.protocol === "https:" && /\./.test(x.hostname) ? x.origin : ""; } catch (e) { return ""; } };
  async function host() {
    const fest = hostAus(store.get("is-host", "")); if (fest) return fest;
    const sd = hostAus(typeof E !== "undefined" && E.schuelerdaten); if (sd) return sd;
    try { const d = await chrome.storage.local.get("saEinstellungen"); const k = d.saEinstellungen && d.saEinstellungen.e && d.saEinstellungen.e.klassenbuch; const a = hostAus(k && k.iserv); if (a) return a; } catch (e) {}
    return "";
  }
  const tagKurz = iso => { const d = new Date(String(iso).slice(0, 10) + "T12:00"); return isNaN(d) ? "" : d.toLocaleDateString("de-DE", { weekday: "short" }).replace(".", "") + " " + d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }); };
  const heuteIso = () => isoTag(new Date());
  const mailZeit = z => { const d = new Date(z); if (isNaN(d)) return ""; return isoTag(d) === heuteIso() ? d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : tagKurz(isoTag(d)); };
  const zeile = (zeit, haupt, marke, klasse, neben) => `<li class="wu-z"><span class="wu-zeit">${zeit}</span><span class="wu-haupt">${haupt}${neben ? `<span class="wu-neben">${neben}</span>` : ""}</span>${marke ? `<span class="wu-marke ${klasse || ""}">${esc(marke)}</span>` : ""}</li>`;
  const block = (titel, zahl, zeilen, leer, max, fuss) => {
    const zu = zeilen.length > max;
    return `<div class="wu-block"><h4>${esc(titel)}${zahl ? ` <span class="nx-zahl">${zahl}</span>` : ""}</h4>${zeilen.length
      ? `<ul class="wu-liste">${zeilen.slice(0, max).join("")}</ul>${zu ? `<details class="wu-mehr"><summary>${zeilen.length - max} weitere</summary><ul class="wu-liste">${zeilen.slice(max).join("")}</ul></details>` : ""}`
      : `<p class="note">${esc(leer)}</p>`}${fuss ? `<p class="note">${fuss}</p>` : ""}</div>`;
  };

  function zeichnen() {
    const teile = an();
    if (!teile.length) { sec.hidden = true; sec.innerHTML = ""; return; }
    sec.hidden = false;
    const zu = store.get("is-zu", false);
    const uhr = stand ? new Date(stand.stand).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) : "";
    let h = `<div class="nx-kopf"><h3 id="is-h" class="klapp-t" role="button" tabindex="0" aria-expanded="${!zu}">IServ</h3><span class="note">${laeuft ? "lädt …" : uhr ? "Stand " + uhr : ""}</span><span class="sp"></span>
      <button class="linkbtn" id="is-namen" aria-pressed="${namenAn()}" title="Zeigt Namen statt Kürzel, nur hier im Browser. Claude bekommt weiterhin nur Kürzel.">${namenAn() ? "Namen ausblenden" : "Namen zeigen"}</button><button class="linkbtn" id="is-neu"${laeuft ? " disabled" : ""}>Aktualisieren</button><button class="linkbtn" id="is-auf">Posteingang öffnen</button><button class="linkbtn" id="is-wahl">Bereiche wählen</button></div>`;
    sec.classList.toggle("zu", !!zu);
    if (!zu) {
      if (lage === "abgemeldet") h += `<p class="note wu-hinweis">Du bist in diesem Browser nicht bei IServ angemeldet. <button class="btn primary small" id="is-login">IServ öffnen und anmelden</button></p>`;
      else if (lage === "adresse") h += `<p class="note wu-hinweis">Die IServ-Adresse deiner Schule fehlt noch. Trage sie unter <button class="linkbtn" id="is-wahl2">Einrichtung &amp; Daten</button> ein.</p>`;
      else if (lage) h += `<p class="note wu-hinweis">${esc(meldung || "IServ konnte nicht gelesen werden.")}</p>`;
      const d = (stand && stand.daten) || {}, f = (stand && stand.fehler) || {};
      const fehlt = id => f[id] ? `<div class="wu-block"><h4>${esc(TEILE.find(t => t.id === id).name)}</h4><p class="note">${esc(f[id])}</p></div>` : "";
      if (stand) {
        h += `<div class="wu-raster">`;
        if (teile.includes("mail")) h += d.mail ? block("Ungelesene Mails", d.mail.ungelesen, d.mail.liste.map(mailLi), "Keine ungelesenen Mails im Posteingang.", 5,
          [mailMeldung ? esc(mailMeldung) : "", d.mail.ungelesen > d.mail.liste.length && d.mail.liste.length ? `und ${d.mail.ungelesen - d.mail.liste.length} ältere` : "",
            erledigt.length ? `${erledigt.length} als gelesen markiert · <button class="linkbtn" id="is-ok-zurueck">${erledigt.length === 1 ? "rückgängig" : "letzte rückgängig"}</button>` : "",
            d.mail.elternbriefe ? `${d.mail.elternbriefe} ${d.mail.elternbriefe === 1 ? "Elternbrief" : "Elternbriefe"} mit Neuigkeiten` : ""].filter(Boolean).join(" · "))
          : fehlt("mail");
        if (teile.includes("krank")) h += d.krank ? block("Krankmeldungen heute", d.krank.meine.length, d.krank.meine.map(x => {
          const ganz = x.stVon == null || (x.stVon <= 1 && x.stBis >= 6);
          return zeile(namenAn() && x.klar ? "" : esc(x.kuerzel), namenAn() && x.klar ? wer(x.kuerzel, x.klar) + ` <span class="wu-raum">${esc(x.klasse || "")}</span>` : esc(x.klasse || ""), x.beurlaubung ? "Beurlaubung" : x.schriftlich ? "schriftlich" : "gemeldet", x.schriftlich ? "" : "warn",
            esc([x.bis && x.bis !== x.von ? "bis " + tagKurz(x.bis) : "", ganz ? "" : `${x.stVon}. bis ${x.stBis}. Stunde`].filter(Boolean).join(" · ")));
        }), "Heute ist niemand aus deinen Kürzellisten krankgemeldet.", 6, d.krank.schule ? `${d.krank.schule} Meldungen an der ganzen Schule` : "") : fehlt("krank");
        if (teile.includes("antraege")) h += d.antraege ? block("Offene Anträge", d.antraege.offen || 0, d.antraege.offen ? [zeile("", `${d.antraege.offen} ${d.antraege.offen === 1 ? "Antrag wartet" : "Anträge warten"} auf Bearbeitung`, "", "", "")] : [], "Keine offenen Anträge.", 1) : fehlt("antraege");
        h += `</div>`;
      } else if (!lage) h += `<p class="note">${laeuft ? "IServ wird gelesen …" : ""}</p>`;
    }
    sec.innerHTML = h;
    const k = (id, f) => { const b = sec.querySelector(id); if (b) b.addEventListener("click", f); };
    k("#is-neu", () => holen());
    k("#is-namen", () => { store.set("is-namen", !namenAn()); if (!namenAn() && stand && stand.daten) { for (const x of ((stand.daten.mail || {}).liste || [])) delete x.klar; for (const x of ((stand.daten.krank || {}).meine || [])) delete x.klar; } offen = {}; zeichnen(); if (namenAn()) holen(); });
    const mailVon = id => (((stand && stand.daten && stand.daten.mail) || {}).liste || []).find(x => x.id === id);
    const auftrag = async (x, op) => { const o = await host(); try { return await chrome.runtime.sendMessage({ cmd: "is-mail", host: o, op, mb: x.mb, uid: x.uid, namen: namenAn() }); } catch (e) { return { ok: false, fehler: "Der Helfer antwortet nicht. Bitte die Seite neu laden." }; } };
    sec.querySelectorAll("[data-is-auf]").forEach(b => b.addEventListener("click", async () => {
      const id = b.dataset.isAuf, x = mailVon(id); if (!x) return;
      if (offen[id]) { delete offen[id]; zeichnen(); return; }
      offen[id] = { laedt: true }; zeichnen();
      const r = await auftrag(x, "zeigen");
      if (!offen[id]) return;
      offen[id] = r && r.ok ? r : { fehler: (r && r.fehler) || "Die Mail konnte nicht geladen werden." }; zeichnen();
    }));
    sec.querySelectorAll("[data-is-ok]").forEach(b => b.addEventListener("click", async () => {
      const x = mailVon(b.dataset.isOk); if (!x || x.wartet) return;
      x.wartet = true; mailMeldung = ""; zeichnen();
      const r = await auftrag(x, "gelesen"); delete x.wartet;
      if (r && r.ok) { const m = stand.daten.mail; m.liste = m.liste.filter(y => y !== x); m.ungelesen = Math.max(0, m.ungelesen - 1); delete offen[x.id]; erledigt.push({ mb: x.mb, uid: x.uid }); }
      else mailMeldung = (r && r.fehler) || "Die Mail konnte nicht als gelesen markiert werden.";
      zeichnen();
    }));
    sec.querySelectorAll("[data-is-antw]").forEach(b => b.addEventListener("click", async () => { const x = mailVon(b.dataset.isAntw); if (!x) return; const r = await auftrag(x, "antworten"); if (!(r && r.ok)) { mailMeldung = (r && r.fehler) || "Die Mail ließ sich nicht in IServ öffnen."; zeichnen(); } }));
    k("#is-ok-zurueck", async () => {
      const x = erledigt[erledigt.length - 1]; if (!x) return;
      const r = await auftrag(x, "ungelesen");
      if (r && r.ok) { erledigt.pop(); mailMeldung = ""; holen(); } else { mailMeldung = (r && r.fehler) || "Das Zurücknehmen hat nicht geklappt."; zeichnen(); }
    });
    k("#is-h", () => { store.set("is-zu", !store.get("is-zu", false)); zeichnen(); });
    const auf = async weg => { const o = await host(); if (o) chrome.runtime.sendMessage({ cmd: "tab", url: o + weg }); };
    k("#is-auf", () => auf("/iserv/mail")); k("#is-login", () => auf("/iserv/"));
    const wahl = () => { location.hash = "#einstellungen"; setTimeout(() => { if (einst) einst.scrollIntoView({ behavior: "smooth", block: "center" }); }, 200); };
    k("#is-wahl", wahl); k("#is-wahl2", wahl);
  }

  async function holen() {
    const teile = an();
    if (!teile.length || laeuft) { zeichnen(); return; }
    laeuft = true; zeichnen();
    try {
      const o = await host();
      if (!o) { lage = "adresse"; stand = null; return; }
      const r = await chrome.runtime.sendMessage({ cmd: "is-direkt", host: o, teile, namen: namenAn() });
      if (r && r.ok) { stand = r; lage = ""; meldung = ""; }
      else { lage = (r && r.art) || "fehler"; meldung = (r && r.fehler) || ""; if (lage === "abgemeldet" || lage === "adresse") stand = null; }
    } catch (e) { lage = "fehler"; meldung = "Der Helfer antwortet nicht. Bitte die Seite neu laden."; }
    finally { laeuft = false; zeichnen(); }
  }

  async function einstZeichnen() {
    if (!einst) return;
    const s = store.get("is-direkt", {}), o = await host();
    einst.querySelector("#is-schalter").innerHTML = TEILE.map(t => `<label class="wu-schalter"><input type="checkbox" data-is="${t.id}"${s && s[t.id] === true ? " checked" : ""}><span><b>${esc(t.name)}</b><br><span class="note">${esc(t.text)}</span></span></label>`).join("")
      + `<label class="wu-adr">IServ-Adresse deiner Schule<input type="url" id="is-host" class="mono" placeholder="https://deine-schule.de" value="${esc(o)}"></label>`;
    einst.querySelectorAll("[data-is]").forEach(c => c.addEventListener("change", () => {
      const neu = Object.assign({}, store.get("is-direkt", {})); neu[c.dataset.is] = c.checked; store.set("is-direkt", neu);
      if (!an().length) { stand = null; lage = ""; }
      holen();
    }));
    const feld = einst.querySelector("#is-host");
    feld.addEventListener("change", async () => { const v = hostAus(feld.value); store.set("is-host", v); if (!v) await einstZeichnen(); else feld.value = v; holen(); });
  }

  einstZeichnen(); zeichnen();
  if (an().length) holen();
  document.addEventListener("visibilitychange", () => { if (!document.hidden && an().length && !laeuft && (!stand || Date.now() - stand.stand > 6e5)) holen(); });
  window.saIservDirekt = { holen };
})();
