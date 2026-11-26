/* Schulassistenz-Helfer – LEB-online, Bewertungsformular der Klassenbewertung (ab 0.42): für die Konferenz-Mappe mitlesen
   Läuft nur, wenn die Konferenz-Mappe auf der Startseite eingeschaltet ist (chrome.storage.local saKonfAn).
   Liest beim Öffnen des Formulars, was dort steht: Fehltage (gesamt, unentschuldigt), die AV/SV-Stufen (eigene Auswahl und,
   soweit auf der Seite sichtbar, die Bewertungen der Fachlehrkräfte), errechneter und erwarteter Abschluss, Zeugnisart.
   Der Helfer klickt nichts, ruft keine Adresse auf und ändert kein Feld.
   Zur Zuordnung merkt er sich kurze Texte der Seite (darunter der Name des Kindes) NUR in diesem Browser (chrome.storage.local
   saLebKonf); die Startseite ordnet sie über die Kürzelliste zu, speichert nur das Kürzel und löscht den Eintrag dann.
   Einträge, die nicht zugeordnet werden, verfallen nach 12 Stunden. */
(() => {
  if (window.__saLebKonf) return; window.__saLebKonf = true;
  const form = [...document.forms].find(f => f.querySelector('[name="fehltage"],[name="arbeitsverhalten_id"]'));
  if (!form) return;
  const FACH = /^(deutsch|mathe|mathematik|englisch|naturwissenschaften|nawi|gesellschaftslehre|gl|werte und normen|religion|sport|kunst|musik|informatik|arbeit-wirtschaft-technik|awt|wpk|wahlpflicht|französisch|spanisch|de|ma|en|nw|ku|mu|sp|inf|wn)\b/i;
  const klein = t => String(t || "").replace(/\s+/g, " ").trim();
  const wert = n => { const el = form.elements[n]; return el ? klein(el.value) : ""; };
  const auswahl = n => { const el = form.elements[n]; if (!el || el.tagName !== "SELECT" || !el.value || el.value === "0") return ""; return klein(el.options[el.selectedIndex] && el.options[el.selectedIndex].textContent); };
  const stufe = n => (auswahl(n).match(/^([a-e])\s*-/i) || [])[1] || "";
  const abschluss = n => (auswahl(n).match(/^([A-ZÄÖÜ0-9-]+)\s*-/) || [])[1] || "";
  const maske = t => klein(t).split(" ").map(w => /^[a-e]$/i.test(w) || /^\d+[x×]?$/.test(w) || /^(AV|SV|x|×|\/|-|:)$/.test(w) || FACH.test(w) || /^(Arbeitsverhalten|Sozialverhalten|Fach|Lehrkraft|Bewertung|Bemerkung)$/i.test(w) ? w : "X".repeat(Math.min(3, w.length))).join(" ");

  function lesen() {
    // AV/SV der Fachlehrkräfte: Zeilen mit Fach und Stufen a–e (wenn „AV / SV einblenden“ offen ist) und Zusammenfassungen „2x c“
    const faecher = [], summen = { av: {}, sv: {} };
    for (const tr of document.querySelectorAll("tr")) {
      if (tr.querySelector("select,textarea,input:not([type=hidden])")) continue;
      const zellen = [...tr.cells].map(c => klein(c.textContent));
      const f = zellen.find(z => FACH.test(z) && z.length < 40);
      const st = zellen.filter(z => /^[a-e]$/i.test(z)).map(z => z.toLowerCase());
      if (f && st.length) faecher.push({ fach: f, werte: st.slice(0, 2) });
    }
    const alle = [...document.querySelectorAll("td,th,div,span,p,b,label")].filter(e => !e.querySelector("td,th,div,p,table"));
    let kontext = "";
    for (const e of alle) {
      const t = klein(e.textContent);
      if (/arbeitsverhalten|\bAV\b/i.test(t)) kontext = "av"; else if (/sozialverhalten|\bSV\b/i.test(t)) kontext = "sv";
      for (const m of t.matchAll(/(\d+)\s*[x×]\s*([a-e])\b/gi)) if (kontext) summen[kontext][m[2].toLowerCase()] = (summen[kontext][m[2].toLowerCase()] || 0) + +m[1];
    }
    // Texte zur Zuordnung (nur lokal): Titel und kurze Texte außerhalb der Formularfelder
    const kandidaten = [];
    const add = t => { t = klein(t); if (t.length >= 4 && t.length <= 70 && /\p{L}{2,}/u.test(t) && !kandidaten.includes(t) && kandidaten.length < 60) kandidaten.push(t); };
    add(document.title);
    for (const e of alle) { if (e.closest("select,textarea,option")) continue; add(e.textContent); }
    const erkannt = faecher.length || Object.keys(summen.av).length || Object.keys(summen.sv).length;
    let aufbau = "";
    if (!erkannt) { const tab = [...document.querySelectorAll("table")].filter(t => !t.querySelector("select,textarea")).map(t => [...t.rows].slice(0, 30).map(r => [...r.cells].map(c => maske(c.textContent)).join(" | ")).join("\n")).join("\n---\n"); aufbau = tab.slice(0, 3000); }
    const zart = form.querySelector('[name="zeugnisart"]:checked');
    return {
      zeit: Date.now(), halbjahr: wert("halbjahr"), klassen_id: wert("klassen_id"),
      kandidaten, fehltage: wert("fehltage"), unent: wert("fehltage_unentschuldigt"),
      av: stufe("arbeitsverhalten_id"), sv: stufe("sozialverhalten_id"),
      avBem: !!wert("arbeitsverhalten_bemerkung"), svBem: !!wert("sozialverhalten_bemerkung"),
      errechnet: abschluss("abschluesse_id"), erwartet: abschluss("erwartete_abschluesse_id"),
      zeugnisart: zart ? ["Normal", "Abschluss", "Abgang", "Zwischen"][+zart.value] || zart.value : "",
      faecher: faecher.slice(0, 20), summen, aufbau
    };
  }
  let badge = null;
  async function merken() {
    const id = wert("klassen_schueler_id"); if (!id) return;
    const { saLebKonf = {} } = await chrome.storage.local.get("saLebKonf");
    const grenze = Date.now() - 12 * 3600e3;
    for (const [k, v] of Object.entries(saLebKonf)) if (!v || v.zeit < grenze) delete saLebKonf[k];
    const d = lesen(); saLebKonf[id] = d;
    await chrome.storage.local.set({ saLebKonf });
    zeigen(d);
  }
  function zeigen(d) {
    if (!badge) {
      const host = document.createElement("div"); const root = host.attachShadow({ mode: "closed" });
      root.innerHTML = `<style>:host{all:initial}.b{position:fixed;left:10px;bottom:10px;z-index:2147483646;background:#191816;color:#efe8da;border:1px solid #38342f;border-left:4px solid #8fcf9f;border-radius:8px;padding:6px 10px;font:12.5px/1.4 system-ui,"Segoe UI",sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.4);max-width:360px}</style><div class="b"></div>`;
      badge = root.querySelector(".b"); (document.body || document.documentElement).appendChild(host);
    }
    const asv = d.faecher.length ? d.faecher.length + " Fächer" : (Object.keys(d.summen.av).length || Object.keys(d.summen.sv).length) ? "Zusammenfassung" : "nicht gefunden";
    badge.textContent = `Schulassistenz: für die Konferenz-Mappe gemerkt · Fehltage ${d.fehltage || "–"}${d.unent ? " (" + d.unent + " unent.)" : ""} · AV/SV der Fachlehrkräfte: ${asv}`;
    fehltageKnopf(badge);
  }
  /* Fehltage aus der Fehlzeiten-Ampel vorausfüllen (Startseite legt sie mit Namen nur lokal bereit). Nur Felder setzen, nie speichern. */
  const ohneAkz = s => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss").toLowerCase();
  const woerter = s => ohneAkz(s).split(/[^a-z]+/).filter(Boolean);
  function kindFinden(liste, kandidaten) {
    const texte = kandidaten.map(woerter); const treffer = [];
    for (const k of liste) { const v = woerter(k.vor)[0], n = woerter(k.nach); if (!v || !n.length) continue;
      if (texte.some(t => n.every(x => t.includes(x)) && t.includes(v))) treffer.push(k); }
    return treffer.length === 1 ? treffer[0] : null;
  }
  let fz = null;
  async function fehltageVorschlag() {
    const { saKonfFehltage } = await chrome.storage.local.get("saKonfFehltage");
    if (!saKonfFehltage || Date.now() - saKonfFehltage.zeit > 14 * 86400e3) return;
    const k = kindFinden(saKonfFehltage.kinder || [], lesen().kandidaten); if (!k) return;
    fz = { ...k, stand: saKonfFehltage.stand };
  }
  function fehltageKnopf(box) {
    if (!fz) return;
    const f1 = form.elements.fehltage, f2 = form.elements.fehltage_unentschuldigt; if (!f1) return;
    const gleich = String(f1.value).trim() === String(fz.tage) && (!f2 || String(f2.value).trim() === String(fz.unent));
    const zeile = document.createElement("div"); zeile.style.marginTop = "4px";
    zeile.textContent = `WebUntis${fz.stand ? " (Stand " + fz.stand.split("-").reverse().join(".") + ")" : ""}: ${fz.tage} ganze Fehltage, davon ${fz.unent} unentschuldigt${fz.offen ? ", " + fz.offen + " noch offen" : ""}. `;
    if (gleich) { const s = document.createElement("b"); s.textContent = "Stimmt mit dem Formular überein."; zeile.appendChild(s); }
    else {
      const b = document.createElement("button"); const alt = String(f1.value).trim();
      b.textContent = alt ? `Eintragen (ersetzt ${alt}${f2 && f2.value ? "/" + f2.value : ""})` : "Eintragen";
      b.style.cssText = "margin-left:4px;padding:3px 9px;border-radius:6px;border:1px solid #8fcf9f;background:#8fcf9f;color:#10221a;font-weight:700;cursor:pointer";
      b.addEventListener("click", () => {
        for (const [el, v] of [[f1, fz.tage], [f2, fz.unent]]) { if (!el) continue; el.value = String(v); el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); el.style.outline = "2px solid #8fcf9f"; }
        b.replaceWith(Object.assign(document.createElement("b"), { textContent: "Eingetragen. Bitte prüfen und in LEB-online selbst speichern." }));
      });
      zeile.appendChild(b);
    }
    box.appendChild(zeile);
  }
  chrome.storage.local.get("saKonfAn").then(({ saKonfAn }) => {
    if (!saKonfAn) return;
    fehltageVorschlag().catch(() => {}).finally(() => merken().catch(() => {}));
    form.addEventListener("change", () => merken().catch(() => {}));
    // „AV / SV einblenden“ verändert die Seite: dann noch einmal lesen
    let t = null; new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => merken().catch(() => {}), 600); }).observe(document.body, { childList: true, subtree: true });
  }).catch(() => {});
})();
