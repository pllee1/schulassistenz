/* Schulassistenz-Startseite · IServ direkt lesen (ab Helfer 0.35)
   Zeigt auf „Heute“, was der Helfer über deine Anmeldung aus IServ liest: ungelesene Mails, heutige Krankmeldungen deiner
   Schüler:innen und offene Anträge. Jeder Bereich hat einen eigenen Schalter (Einrichtung & Daten), anfangs ist alles aus.
   Nur lesend. Der Helfer liefert Kürzel; Namen nur, solange im Kasten „Namen zeigen“ eingeschaltet ist. Die Daten bleiben in dieser Seite (kein Speichern, nichts geht an Claude). */
(() => {
  const TEILE = [
    { id: "mail", name: "Ungelesene Mails", text: "Anzahl im Posteingang, Absender als Kürzel und Betreff. Es wird keine Mail geöffnet, sie bleiben ungelesen." },
    { id: "krank", name: "Krankmeldungen heute", text: "nur Kinder aus deinen Kürzellisten, als Kürzel (braucht DieSchulApp in IServ)" },
    { id: "antraege", name: "Offene Anträge", text: "Anzahl noch nicht bearbeiteter Beurlaubungsanträge (DieSchulApp)" }
  ];
  const sec = $("#iservk"), einst = $("#is-einst");
  if (!sec) return;
  const an = () => { const s = store.get("is-direkt", {}); return TEILE.map(t => t.id).filter(id => s && s[id] === true); };
  let stand = null, lage = "", meldung = "", laeuft = false;
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
        if (teile.includes("mail")) h += d.mail ? (() => {
          // „✓“ blendet eine Mail nur hier aus (in IServ bleibt sie ungelesen). Gemerkt wird nur ihre Nummer mit Datum.
          const weg = new Set(store.get("is-mail-weg", [])), sicht = d.mail.liste.filter(x => !weg.has(x.id)), aus = d.mail.liste.length - sicht.length;
          return block("Ungelesene Mails", Math.max(0, d.mail.ungelesen - aus), sicht.map(x => zeile(esc(mailZeit(x.zeit)), wer(x.von, x.klar && x.klar.von) + (x.anhang ? ` <span class="wu-raum">mit Anhang</span>` : ""), "", "", esc(namenAn() && x.klar ? x.klar.betreff : x.betreff))
            .replace("</li>", `<button class="nx-mini is-weg" data-is-weg="${esc(x.id)}" title="Hier ausblenden. In IServ bleibt die Mail ungelesen.">✓</button></li>`)),
            aus ? "Alle ungelesenen Mails sind hier ausgeblendet." : "Keine ungelesenen Mails im Posteingang.", 5,
            [d.mail.ungelesen > d.mail.liste.length && d.mail.liste.length ? `und ${d.mail.ungelesen - d.mail.liste.length} ältere` : "", aus ? `${aus} ausgeblendet · <button class="linkbtn" id="is-weg-zurueck">wieder zeigen</button>` : "", d.mail.elternbriefe ? `${d.mail.elternbriefe} ${d.mail.elternbriefe === 1 ? "Elternbrief" : "Elternbriefe"} mit Neuigkeiten` : ""].filter(Boolean).join(" · "));
        })() : fehlt("mail");
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
    k("#is-namen", () => { store.set("is-namen", !namenAn()); if (!namenAn() && stand && stand.daten) { for (const x of ((stand.daten.mail || {}).liste || [])) delete x.klar; for (const x of ((stand.daten.krank || {}).meine || [])) delete x.klar; } zeichnen(); if (namenAn()) holen(); });
    sec.querySelectorAll("[data-is-weg]").forEach(b => b.addEventListener("click", () => { const l = store.get("is-mail-weg", []).filter(x => x !== b.dataset.isWeg); l.push(b.dataset.isWeg); store.set("is-mail-weg", l.slice(-300)); zeichnen(); }));
    k("#is-weg-zurueck", () => { store.set("is-mail-weg", []); zeichnen(); });
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
