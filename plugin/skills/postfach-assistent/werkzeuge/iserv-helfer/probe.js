/* Schulassistenz-Helfer · Schnittstellen-Probe, Bedienseite. Die Arbeit macht probe-bg.js im Hintergrund. */
const $ = s => document.querySelector(s);
const frage = m => chrome.runtime.sendMessage({ cmd: "probe", ...m }).catch(e => ({ ok: false, fehler: String((e && e.message) || e) }));
let gefuellt = false, berichtZeit = 0, ziel = { iserv: "", wu: "" };

function zeigen(s) {
  if (!s || !s.ok) return;
  if (!gefuellt) { $("#iserv").value = s.iserv || ""; $("#wu").value = s.wu || ""; gefuellt = true; }
  if (s.laeuft) ziel = { iserv: s.iserv, wu: s.wu };
  const wertet = !!s.auswertung;
  $("#k2").classList.toggle("aus", !s.laeuft && !wertet);
  $("#start").disabled = s.laeuft || wertet;
  $("#iserv").disabled = $("#wu").disabled = s.laeuft || wertet;
  $("#fertig").disabled = $("#abbruch").disabled = !s.laeuft;
  $("#wuAuf").disabled = !s.laeuft || !ziel.wu; $("#iservAuf").disabled = !s.laeuft || !ziel.iserv;
  $("#zahl").textContent = s.funde || 0;
  $("#lauf").textContent = wertet ? "Auswertung läuft: " + s.auswertung + " …" : s.laeuft ? "Aufzeichnung läuft seit " + new Date(s.seit).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) + " Uhr." : "";
  const b = s.bericht;
  $("#k3").classList.toggle("aus", !b);
  $("#kopieren").disabled = $("#speichern").disabled = $("#loeschen").disabled = !b;
  if (b && b.zeit !== berichtZeit) { berichtZeit = b.zeit; $("#bericht").value = b.text; $("#berichtInfo").textContent = ""; }
  if (!b && berichtZeit) { berichtZeit = 0; $("#bericht").value = ""; }
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
