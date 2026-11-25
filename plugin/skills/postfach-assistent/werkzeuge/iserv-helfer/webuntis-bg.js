/* Schulassistenz-Helfer · WebUntis direkt lesen (ab 0.32)
   Liest über die Anmeldung im Browser, was WebUntis der Lehrkraft selbst anzeigt: Stundenplan mit Vertretungen, Prüfungen,
   Hausaufgaben und offene Klassenbuch-Stunden. Für die Startseite, je Bereich einzeln schaltbar (anfangs alles aus).
   - Nur lesend: Es werden ausschließlich die unten aufgeführten Abfrage-Adressen aufgerufen (WUD_WEGE). Nichts wird in WebUntis geändert.
   - Nur von Seiten des Helfers aus aufrufbar, nur für Adressen der Form https://<schule>.webuntis.com.
   - Namen von Schüler:innen und Lehrkräften werden hier verworfen und nie weitergegeben. Freitexte (z. B. Vertretungstext) bleiben
     auf der Startseite in diesem Browser und gehen nicht an Claude. */
const WUD_HOST = /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.webuntis\.com$/i;
const WUD_WEGE = [
  /^rest\/view\/v1\/timetable\/entries\?[\w=&%.:-]*$/,
  /^rest\/view\/v1\/exams\?[\w=&%.:-]*$/,
  /^rest\/view\/v1\/classreg\/homework\/(list|meta)$/,
  /^rest\/view\/v1\/classreg\/open-periods(\/meta)?$/
];
class WudFehler extends Error { constructor(art, text) { super(text); this.art = art; } }

async function wudToken(o) {
  let r;
  try { r = await fetch(o + "/WebUntis/api/token/new", { credentials: "include", cache: "no-store" }); }
  catch (e) { throw new WudFehler("netz", "WebUntis ist gerade nicht erreichbar."); }
  const t = r.ok ? (await r.text()).trim() : "";
  // Abgemeldet liefert WebUntis die Anmeldeseite (Status 200) statt eines Tokens
  if (!/^[\w-]+\.[\w-]+\.[\w-]+$/.test(t)) throw new WudFehler("abgemeldet", "Bitte in diesem Browser bei WebUntis anmelden.");
  let pid = null;
  try { pid = JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).person_id; } catch (e) {}
  if (pid == null) throw new WudFehler("abgemeldet", "WebUntis hat keine Lehrkraft zur Anmeldung geliefert.");
  return { t, pid };
}
async function wudJson(o, tok, weg, body) {
  if (!WUD_WEGE.some(w => w.test(weg))) throw new WudFehler("intern", "Adresse nicht erlaubt: " + weg.split("?")[0]);
  let r;
  try {
    r = await fetch(o + "/WebUntis/api/" + weg, {
      method: body ? "POST" : "GET", credentials: "omit", cache: "no-store",
      headers: Object.assign({ Authorization: "Bearer " + tok, Accept: "application/json" }, body ? { "Content-Type": "application/json" } : {}),
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (e) { throw new WudFehler("netz", "WebUntis ist gerade nicht erreichbar."); }
  if (r.status === 401) throw new WudFehler("abgemeldet", "Bitte in diesem Browser bei WebUntis anmelden.");
  if (r.status === 403) throw new WudFehler("recht", "WebUntis gibt diesen Bereich für dein Konto nicht frei.");
  if (!r.ok) throw new WudFehler("antwort", "WebUntis antwortet mit " + r.status + ".");
  try { return await r.json(); } catch (e) { throw new WudFehler("antwort", "WebUntis hat keine Daten geliefert."); }
}

/* ---- Antworten auf das Nötige kürzen (reine Funktionen, ohne Namen von Personen) ---- */
const wudKurz = x => { x = (x && x.el) || x; return (x && (x.shortName || x.nameShort || x.displayName || x.name || x.longName)) || ""; };
const wudTag = v => { const s = String(v == null ? "" : v); return /^\d{8}$/.test(s) ? s.slice(0, 4) + "-" + s.slice(4, 6) + "-" + s.slice(6) : s.slice(0, 10); };
const wudZeit = v => { const m = String(v == null ? "" : v).match(/T(\d\d:\d\d)/); if (m) return m[1]; const s = String(v == null ? "" : v); return /^\d{3,4}$/.test(s) ? s.padStart(4, "0").replace(/(\d\d)(\d\d)/, "$1:$2") : ""; };
const wudText = (...t) => [...new Set(t.flat().map(x => typeof x === "string" ? x.trim() : (x && typeof x.text === "string" ? x.text.trim() : "")).filter(Boolean))].join(" · ").slice(0, 400);
const wudDazu = (a, b) => !b || a.split(", ").includes(b) ? a : (a ? a + ", " + b : b);

function wudPlan(j) {
  const out = [];
  for (const tag of (j && j.days) || []) for (const g of tag.gridEntries || []) {
    const d = g.duration || {};
    const e = { tag: wudTag(d.start || tag.date), von: wudZeit(d.start), bis: wudZeit(d.end), art: String(g.type || ""), status: String(g.status || ""), detail: String(g.statusDetail || ""),
      fach: "", klasse: "", raum: "", fachAlt: "", klasseAlt: "", raumAlt: "", lehrkraftGeaendert: false, geaendert: false,
      name: /^EVENT$/i.test(g.type || "") ? String(g.name || "").slice(0, 120) : "", text: wudText(g.lessonText, g.substitutionText, g.notesAll, g.lessonInfo, g.texts || []) };
    for (let p = 1; p <= 7; p++) for (const x of g["position" + p] || []) for (const c of ["current", "removed"]) {
      const el = x && x[c]; if (!el) continue;
      const typ = String(el.type || "").toUpperCase(), anders = c === "removed" || (el.status && !/^(REGULAR|NO_DATA)$/i.test(el.status));
      if (typ === "TEACHER") { if (anders) e.lehrkraftGeaendert = true; continue; }          // Namen von Lehrkräften nie übernehmen
      const feld = typ === "SUBJECT" ? "fach" : typ === "CLASS" ? "klasse" : typ === "ROOM" ? "raum" : "";
      if (!feld) continue;
      const k = feld + (c === "removed" ? "Alt" : "");
      e[k] = wudDazu(e[k], wudKurz(el));
      if (anders) e.geaendert = true;
    }
    if (e.status && !/^REGULAR$/i.test(e.status)) e.geaendert = true;
    if (e.lehrkraftGeaendert) e.geaendert = true;
    out.push(e);
  }
  return out;
}
function wudPruefungen(j) {
  return ((j && j.exams) || []).map(x => ({
    tag: wudTag(x.examStart || x.date), von: wudZeit(x.examStart), bis: wudZeit(x.examEnd),
    name: String(x.examName || x.name || "").slice(0, 120), art: wudKurz(x.examType), fach: wudKurz(x.subject),
    klassen: (x.classes || []).map(wudKurz).filter(Boolean).join(", "), raeume: (x.rooms || []).map(wudKurz).filter(Boolean).join(", "),
    anzahl: typeof x.numStudents === "number" ? x.numStudents : null, text: wudText(x.examText)
  }));   // students[] und teachers[] (Namen) bleiben hier
}
function wudHausaufgaben(j, klasse, eigen) {
  return ((j && j.homeworkList) || []).map(x => ({
    id: x.id, tag: wudTag(x.date), faellig: wudTag(x.dueDate), fach: wudKurz(x.subject), klasse: klasse || "", eigen: !!eigen,
    text: wudText(x.homework), bemerkung: wudText(x.remark), erledigt: !!x.completed
  }));   // createdByUser (Kürzel der Lehrkraft) bleibt hier
}
function wudOffen(j) {
  const liste = ((j && j.periods) || []).map(x => {
    const p = x.period || {}, d = p.dtRange || p.dateRange || {};
    return { tag: wudTag(d.start), von: wudZeit(d.start), bis: wudZeit(d.end), fach: wudKurz(p.subject), klassen: (p.classes || []).map(wudKurz).filter(Boolean).join(", "),
      anwesenheit: !!x.absCheckNeeded && !x.absChecked, thema: !!x.topicNeeded && !x.topicShort };
  });
  return { gesamt: liste.length, stunden: typeof (j && j.total) === "number" ? j.total : null, liste };   // total = alle Stunden im Zeitraum, periods = die offenen
}

const wudIso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const wudPlus = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

async function wudLesen(o, teile) {
  const { t, pid } = await wudToken(o);
  const heute = new Date(); heute.setHours(12, 0, 0, 0);
  const aus = {}, fehler = {};
  const teil = async (name, f) => { if (!teile.includes(name)) return; try { aus[name] = await f(); } catch (e) { if (e.art === "abgemeldet" || e.art === "netz") throw e; fehler[name] = String(e.message || e); } };
  await teil("plan", async () => {
    const mo = wudPlus(heute, -((heute.getDay() + 6) % 7)); let alle = [];
    for (const w of [0, 7]) {
      const q = "start=" + wudIso(wudPlus(mo, w)) + "&end=" + wudIso(wudPlus(mo, w + 6)) + "&format=1&resourceType=TEACHER&resources=" + encodeURIComponent(pid) + "&periodTypes=&timetableType=MY_TIMETABLE&layout=START_TIME";
      alle = alle.concat(wudPlan(await wudJson(o, t, "rest/view/v1/timetable/entries?" + q)));
    }
    return alle;
  });
  await teil("pruefungen", async () => wudPruefungen(await wudJson(o, t, "rest/view/v1/exams?start=" + wudIso(heute) + "&end=" + wudIso(wudPlus(heute, 42)) + "&withDeleted=false")));
  await teil("hausaufgaben", async () => {
    // Eigene Einträge und, für Klassenleitungen, alle Fächer der eigenen Klasse (WebUntis nennt sie in den Vorgaben der Seite „Offene Stunden“)
    const zeit = { dateRangeType: "CUSTOM", dateRange: { start: wudIso(wudPlus(heute, -14)), end: wudIso(wudPlus(heute, 28)) } };
    let alle = wudHausaufgaben(await wudJson(o, t, "rest/view/v1/classreg/homework/list", Object.assign({ classId: null, teacherId: pid, subjectId: null }, zeit)), "", true);
    let klassen = [];
    try {
      const m = await wudJson(o, t, "rest/view/v1/classreg/open-periods/meta");
      klassen = ((m && m.myClassIds) || []).slice(0, 3).map(id => ({ id, name: wudKurz(((m.classes || []).find(k => ((k && k.el) || k || {}).id === id))) }));
    } catch (e) { if (e.art === "abgemeldet" || e.art === "netz") throw e; }
    const da = new Set(alle.map(x => x.id));
    for (const k of klassen) for (const h of wudHausaufgaben(await wudJson(o, t, "rest/view/v1/classreg/homework/list", Object.assign({ classId: k.id, teacherId: null, subjectId: null }, zeit)), k.name || "Klasse", false)) if (!da.has(h.id)) { da.add(h.id); alle.push(h); }
    return alle.sort((a, b) => (a.faellig || "").localeCompare(b.faellig || ""));
  });
  await teil("offen", async () => {
    const m = await wudJson(o, t, "rest/view/v1/classreg/open-periods/meta");
    return wudOffen(await wudJson(o, t, "rest/view/v1/classreg/open-periods", { teacherId: pid, filter: m.defaultFilter || (m.allowedFilters || [])[0] || "TOPIC_OR_ABSENCE_OPEN", dateRange: { start: wudIso(wudPlus(heute, -42)), end: wudIso(heute) } }));
  });
  return { ok: true, stand: Date.now(), daten: aus, fehler };
}
if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) chrome.runtime.onMessage.addListener((m, sender, antwort) => {
  if (!m || m.cmd !== "wu-direkt") return;
  if (!sender || !String(sender.url || "").startsWith(chrome.runtime.getURL(""))) { antwort({ ok: false, art: "intern", fehler: "Nur von der Startseite aus." }); return; }
  const o = String(m.host || "").replace(/\/+$/, "");
  const teile = (Array.isArray(m.teile) ? m.teile : []).filter(x => ["plan", "pruefungen", "hausaufgaben", "offen"].includes(x));
  if (!WUD_HOST.test(o)) { antwort({ ok: false, art: "adresse", fehler: "Die WebUntis-Adresse fehlt oder passt nicht (https://<schule>.webuntis.com)." }); return; }
  if (!teile.length) { antwort({ ok: true, stand: Date.now(), daten: {}, fehler: {} }); return; }
  wudLesen(o, teile).then(antwort).catch(e => antwort({ ok: false, art: e.art || "fehler", fehler: String((e && e.message) || e) }));
  return true;
});
