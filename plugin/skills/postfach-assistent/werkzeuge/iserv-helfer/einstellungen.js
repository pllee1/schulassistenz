const $ = s => document.querySelector(s), P = window.SAPseudo;
function zeigen(liste, name) {
  const k = new Set(liste.map(r => r.kurz)).size;
  $("#status").innerHTML = liste.length ? `<span class="ok">${liste.length} Einträge, ${k} Kürzel geladen${name ? " aus „" + name + "“" : ""}.</span>` : "Noch keine Liste geladen.";
  const tb = $("#tab tbody"); tb.innerHTML = "";
  for (const r of liste.slice(0, 500)) { const tr = document.createElement("tr"); const a = document.createElement("td"), b = document.createElement("td"); a.textContent = r.orig; b.textContent = r.kurz; tr.append(a, b); tb.append(tr); }
}
function autoListeZeigen() {
  chrome.storage.local.get({ listeAutoInfo: null, listeExtra: null }, v => {
    const i = v.listeAutoInfo, el = $("#autoListe"); if (!el) return;
    el.innerHTML = i && i.dateien && i.dateien.length
      ? `<span class="ok">Automatisch: ${i.dateien.length} Kürzelliste${i.dateien.length === 1 ? "" : "n"} aus ${i.ort ? i.ort.replace(/[&<>]/g, "") : "kuerzellisten"} (Stand ${new Date(i.stand).toLocaleString("de-DE")}).</span>${v.listeExtra && v.listeExtra.length ? ` Dazu ${v.listeExtra.length} Einträge aus einer hineingezogenen Datei.` : ""}`
      : "Noch nicht automatisch geladen. Öffne einmal die Startseite mit verbundenem Datenordner (und bei IServ angemeldet).";
  });
}
autoListeZeigen();
chrome.storage.onChanged.addListener(c => { if (c.listeAutoInfo || c.listeExtra) autoListeZeigen(); if (c.liste) zeigen(c.liste.newValue || []); });
chrome.storage.local.get({ liste: [], ichName: "", ziel: "web", knopf: true }, v => {
  zeigen(v.liste); $("#ich").value = v.ichName;
  document.querySelector(`input[name=ziel][value=${v.ziel}]`).checked = true; $("#knopf").checked = v.knopf;
});
async function einlesen(f) {
  try {
    let liste = [];
    if (/\.xlsx?$/i.test(f.name)) {
      const wb = XLSX.read(await f.arrayBuffer(), { type: "array" });
      for (const n of wb.SheetNames) liste = liste.concat(P.tabelleEinlesen(XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: false })));
    } else {
      let txt = await f.text(); if (txt.includes("�")) txt = new TextDecoder("windows-1252").decode(await f.arrayBuffer());
      const l0 = txt.split("\n")[0]; const sep = l0.includes("\t") ? "\t" : ((l0.match(/;/g) || []).length >= (l0.match(/,/g) || []).length ? ";" : ",");
      liste = P.tabelleEinlesen(txt.split(/\r?\n/).map(l => l.split(sep).map(c => c.replace(/^"|"$/g, ""))));
    }
    if (!liste.length) { $("#status").innerHTML = `<span class="err">In der Datei wurden keine Spalten Vorname/Nachname/Kürzel oder Original/Kürzel gefunden.</span>`; return; }
    // Hineingezogene Liste gilt zusätzlich zu den Kürzellisten, die die Startseite automatisch übergibt (ab 0.28), und steht zuerst.
    chrome.storage.local.get({ listeAutoTeil: [] }, d => {
      const s = new Set(), alle = [];
      for (const r of liste.concat(d.listeAutoTeil || [])) { const k = r.orig + "\u0001" + r.kurz; if (!s.has(k)) { s.add(k); alle.push(r); } }
      chrome.storage.local.set({ liste: alle, listeExtra: liste }, () => zeigen(alle, f.name));
    });
  } catch (e) { $("#status").innerHTML = `<span class="err">Datei konnte nicht gelesen werden: ${e.message}</span>`; }
}
const d = $("#drop");
d.onclick = () => $("#datei").click();
$("#datei").onchange = e => e.target.files[0] && einlesen(e.target.files[0]);
d.ondragover = e => { e.preventDefault(); d.classList.add("over"); };
d.ondragleave = () => d.classList.remove("over");
d.ondrop = e => { e.preventDefault(); d.classList.remove("over"); e.dataTransfer.files[0] && einlesen(e.dataTransfer.files[0]); };
$("#leeren").onclick = () => chrome.storage.local.set({ liste: [], listeExtra: [], listeAutoTeil: [] }, () => zeigen([]));
$("#ichSpeichern").onclick = () => chrome.storage.local.set({ ichName: $("#ich").value.trim() }, () => { $("#ichOk").textContent = "gespeichert"; setTimeout(() => $("#ichOk").textContent = "", 2000); });
document.querySelectorAll("input[name=ziel]").forEach(r => r.onchange = () => chrome.storage.local.set({ ziel: r.value }));
$("#knopf").onchange = () => chrome.storage.local.set({ knopf: $("#knopf").checked });
$("#testen").onclick = () => chrome.storage.local.get({ liste: [], ichName: "" }, v => {
  const liste = v.liste.slice();
  if (v.ichName) { const t = v.ichName.split(/\s+/); const n = t.pop(); P.addPerson(t.join(" "), n, "L-ICH", liste); }
  const r = P.pseudonymisieren($("#testEin").value, liste);
  r.verdacht.forEach(h => h.an = true);
  $("#testAus").value = P.verdachtAnwenden(r.text, r.verdacht) + `\n\n(${r.ersetzt} Namen aus der Liste, ${r.mails} Mailadressen, ${r.verdacht.length} Verdachtsstellen ersetzt)`;
});

function autoZeigen() {
  chrome.storage.local.get({ personenAuto: {} }, v => {
    const e = Object.entries(v.personenAuto || {});
    $("#autoInfo").textContent = e.length ? `${e.length} Personen automatisch zugeordnet.` : "Noch keine.";
    const tb = $("#autoTab tbody"); tb.innerHTML = "";
    for (const [n, k] of e.sort((a, b) => a[1].localeCompare(b[1], "de", { numeric: true }))) { const tr = document.createElement("tr"); const a = document.createElement("td"), b = document.createElement("td"); a.textContent = n; b.textContent = k; tr.append(a, b); tb.append(tr); }
  });
}
autoZeigen();
chrome.storage.onChanged.addListener(autoZeigen);
$("#autoLeeren").onclick = () => chrome.storage.local.set({ personenAuto: {} }, autoZeigen);
