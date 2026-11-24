/* Schulassistenz-Helfer · Schnittstellen-Probe, Bedienseite. Die Arbeit macht probe-bg.js im Hintergrund. */
const $ = s => document.querySelector(s);
const frage = m => chrome.runtime.sendMessage({ cmd: "probe", ...m }).catch(e => ({ ok: false, fehler: String((e && e.message) || e) }));
let gefuellt = false, berichtZeit = 0, ziel = { iserv: "", wu: "" }, basis = "", bereiche = [], wunsch = {};

/* Wunschliste: je gefundenem Bereich ankreuzen, ob der Helfer ihn lesen soll. Bleibt in diesem Browser, bis der Bericht kopiert wird. */
const WAHL = [["", "–"], ["ja", "Ja, brauche ich"], ["vielleicht", "Vielleicht"], ["nein", "Nein"]];
const schluessel = b => b.sys + " " + b.pfad;
function wunschText() {
  const z = [];
  for (const b of bereiche) { const w = wunsch[schluessel(b)]; if (w && (w.w || w.t)) z.push("[" + b.sys + "] " + b.name + ": " + ((WAHL.find(x => x[0] === w.w) || [])[1] || "–") + (w.t ? " · " + w.t : "")); }
  const frei = (wunsch._frei || "").trim();
  if (!z.length && !frei) return "";
  return "\n== Deine Wünsche ==\n" + z.join("\n") + (frei ? (z.length ? "\n" : "") + "Sonst noch: " + frei : "") + "\n";
}
const berichtZeigen = () => { $("#bericht").value = basis + wunschText(); };
const wunschMerken = () => { chrome.storage.local.set({ saProbeWunsch: wunsch }); berichtZeigen(); };
function wunschBauen() {
  const box = $("#wunsch"); box.textContent = "";
  let sys = "";
  for (const b of bereiche) {
    if (b.sys !== sys) { sys = b.sys; const h = document.createElement("div"); h.className = "sys"; h.textContent = sys; box.append(h); }
    const k = schluessel(b), w = wunsch[k] || (wunsch[k] = { w: "", t: "" });
    const z = document.createElement("div"); z.className = "wz";
    const n = document.createElement("div"); n.textContent = b.name;
    const kl = document.createElement("small");
    kl.textContent = [b.daten ? b.daten + " Datenadresse" + (b.daten === 1 ? "" : "n") : "keine Datenadresse gesehen", b.export ? "Export vorhanden" : "", b.spalten && b.spalten.length ? "Spalten: " + b.spalten.join(", ") : ""].filter(Boolean).join(" · ");
    n.append(kl);
    const s = document.createElement("select"); s.setAttribute("aria-label", "Brauche ich " + b.name + "?");
    for (const [v, t] of WAHL) { const o = document.createElement("option"); o.value = v; o.textContent = t; s.append(o); }
    s.value = w.w || ""; s.onchange = () => { w.w = s.value; wunschMerken(); };
    const i = document.createElement("input"); i.type = "text"; i.placeholder = "Was soll der Helfer hier für dich tun?"; i.value = w.t || ""; i.setAttribute("aria-label", "Wunsch zu " + b.name);
    i.oninput = () => { w.t = i.value; wunschMerken(); };
    z.append(n, s, i); box.append(z);
  }
  $("#frei").value = wunsch._frei || "";
}

function zeigen(s) {
  if (!s || !s.ok) return;
  if (!gefuellt) { $("#iserv").value = s.iserv || ""; $("#wu").value = s.wu || ""; gefuellt = true; }
  if (s.laeuft) ziel = { iserv: s.iserv, wu: s.wu };
  const wertet = !!s.auswertung, tour = !!s.rundgang;
  $("#k2").classList.toggle("aus", !s.laeuft && !wertet);
  $("#start").disabled = s.laeuft || wertet;
  $("#iserv").disabled = $("#wu").disabled = s.laeuft || wertet;
  $("#fertig").disabled = $("#abbruch").disabled = !s.laeuft || tour;
  $("#rundgang").disabled = !s.laeuft || tour;
  $("#tourInfo").textContent = tour ? s.rundgang + " …" : s.besucht ? s.besucht + " Seiten besucht. Jetzt „Beenden und auswerten“." : "";
  $("#wuAuf").disabled = !s.laeuft || !ziel.wu; $("#iservAuf").disabled = !s.laeuft || !ziel.iserv;
  $("#zahl").textContent = s.funde || 0;
  $("#lauf").textContent = wertet ? "Auswertung läuft: " + s.auswertung + " …" : s.laeuft ? "Aufzeichnung läuft seit " + new Date(s.seit).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) + " Uhr." : "";
  const b = s.bericht;
  $("#k3").classList.toggle("aus", !b);
  $("#kopieren").disabled = $("#speichern").disabled = $("#loeschen").disabled = !b;
  if (b && b.zeit !== berichtZeit) {
    berichtZeit = b.zeit; basis = b.text; bereiche = b.bereiche || []; $("#berichtInfo").textContent = "";
    chrome.storage.local.get({ saProbeWunsch: {} }, d => { wunsch = d.saProbeWunsch || {}; wunschBauen(); berichtZeigen(); });
  }
  if (!b && berichtZeit) { berichtZeit = 0; basis = ""; bereiche = []; wunsch = {}; $("#bericht").value = ""; }
  $("#kw").classList.toggle("aus", !b || !bereiche.length);
}
const neu = () => frage({ op: "status" }).then(zeigen);

$("#start").onclick = async () => {
  $("#startInfo").textContent = "";
  const a = await frage({ op: "start", iserv: $("#iserv").value.trim(), wu: $("#wu").value.trim() });
  if (!a.ok) { $("#startInfo").textContent = a.fehler || "Das hat nicht geklappt."; return; }
  ziel = { iserv: a.iserv, wu: a.wu }; neu();
};
$("#wuAuf").onclick = () => { if (ziel.wu) chrome.tabs.create({ url: ziel.wu + "/WebUntis/" }); };
$("#iservAuf").onclick = () => { if (ziel.iserv) chrome.tabs.create({ url: ziel.iserv + "/iserv/" }); };
$("#rundgang").onclick = async () => { const a = await frage({ op: "rundgang" }); if (!a.ok) $("#tourInfo").textContent = a.fehler || ""; neu(); };
$("#frei").oninput = () => { wunsch._frei = $("#frei").value; wunschMerken(); };
$("#fertig").onclick = async () => { const a = await frage({ op: "auswerten" }); if (!a.ok) $("#lauf").textContent = a.fehler || ""; neu(); };
$("#abbruch").onclick = async () => { await frage({ op: "loeschen" }); neu(); };
$("#loeschen").onclick = async () => { await frage({ op: "loeschen" }); neu(); };
$("#kopieren").onclick = async () => {
  const t = $("#bericht").value;
  try { await navigator.clipboard.writeText(t); } catch (e) { $("#bericht").select(); document.execCommand("copy"); }
  $("#berichtInfo").textContent = "Kopiert. Jetzt bei Claude einfügen (Strg+V).";
};
$("#speichern").onclick = () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([$("#bericht").value], { type: "text/plain;charset=utf-8" }));
  a.download = "schnittstellen-probe.txt"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};
neu(); setInterval(neu, 2000);
