/* Schulassistenz-Helfer · WebUntis direkt lesen (ab 0.32)
   Liest über die Anmeldung im Browser, was WebUntis der Lehrkraft selbst anzeigt: Stundenplan mit Vertretungen, Prüfungen,
   Hausaufgaben und offene Klassenbuch-Stunden. Für die Startseite, je Bereich einzeln schaltbar (anfangs alles aus).
   - Lesen: Es werden ausschließlich die unten aufgeführten Abfrage-Adressen aufgerufen (WUD_WEGE).
   - Ab 0.38 eine einzige schreibende Anfrage, eigener Schalter (anfangs aus): den Lehrstoff einer eigenen Stunde von heute eintragen
     (wudStoffSchreiben). Nur nach Vorschau und Klick der Lehrkraft in der Live-Beobachtung.
   - Ab 0.39, eigener Schalter (anfangs aus): Abwesende der Stunde im Klassenbuch eintragen (wudAbwSchreiben), ebenfalls nur nach Vorschau und Klick.
     Sonst wird in WebUntis nichts geändert.
   - Nur von Seiten des Helfers aus aufrufbar, nur für Adressen der Form https://<schule>.webuntis.com.
   - Namen von Schüler:innen und Lehrkräften werden hier verworfen und nie weitergegeben. Freitexte (z. B. Vertretungstext) bleiben
     auf der Startseite in diesem Browser und gehen nicht an Claude. */
const WUD_HOST = /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.webuntis\.com$/i;
const WUD_WEGE = [
  /^rest\/view\/v1\/timetable\/entries\?[\w=&%.:-]*$/,
  /^rest\/view\/v1\/exams\?[\w=&%.:-]*$/,
  /^rest\/view\/v1\/classreg\/homework\/(list|meta)$/,
  /^rest\/view\/v1\/classreg\/open-periods(\/meta)?$/,
  /^rest\/view\/v1\/classreg\/lesson-topics\/period\/\d+$/
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
/* ---- Lehrstoff (ab 0.38): eigene Stunden von heute lesen und, nach Vorschau und Klick der Lehrkraft, den Lehrstoff eintragen ---- */
const WUD_STOFF_MAX = 1000;
async function wudStunden(o, t, pid) {
  const heute = new Date(); heute.setHours(12, 0, 0, 0); const iso = wudIso(heute);
  const j = await wudJson(o, t, "rest/view/v1/timetable/entries?start=" + iso + "&end=" + iso + "&format=1&resourceType=TEACHER&resources=" + encodeURIComponent(pid) + "&periodTypes=&timetableType=MY_TIMETABLE&layout=START_TIME");
  const roh = []; for (const tag of (j && j.days) || []) for (const g of tag.gridEntries || []) roh.push(g);
  const plan = wudPlan(j), aus = [];
  roh.forEach((g, i) => {
    const e = plan[i], ids = (Array.isArray(g.ids) ? g.ids : []).filter(x => Number.isInteger(x) && x > 0);
    if (!e || e.tag !== iso || !ids.length || !/^(NORMAL_TEACHING_PERIOD|ADDITIONAL_PERIOD)$/.test(e.art) || /^CANCELL?ED$/i.test(e.status)) return;
    aus.push({ ids, tag: e.tag, von: e.von, bis: e.bis, fach: e.fach, klasse: e.klasse });
  });
  return aus.sort((a, b) => a.von.localeCompare(b.von));
}
async function wudThema(o, t, periodId) {
  const j = await wudJson(o, t, "rest/view/v1/classreg/lesson-topics/period/" + periodId);
  const x = ((j && j.periodTopics) || []).find(y => y && y.period && y.period.id === periodId);
  if (!x) return { periodId, text: "", kann: false, anhaenge: 0, roh: null };
  const th = x.topic || null;
  return { periodId, text: String((th && th.text) || ""), kann: x.canSave === true, anhaenge: ((th && th.attachments) || []).length, roh: th };
}
async function wudStoffLesen(o) {
  const { t, pid } = await wudToken(o);
  const stunden = await wudStunden(o, t, pid);
  for (const s of stunden) { s.themen = []; for (const id of s.ids) { const th = await wudThema(o, t, id); s.themen.push({ periodId: id, text: th.text, kann: th.kann, anhaenge: th.anhaenge }); } }
  return { ok: true, stand: Date.now(), stunden };
}
// Die einzige schreibende Anfrage des Helfers an WebUntis. Feste Adresse, fester Aufbau; nur eigene Stunden von heute.
async function wudStoffSchreiben(o, ids, text) {
  text = String(text == null ? "" : text).replace(/\r/g, "").trim();
  if (!text) throw new WudFehler("eingabe", "Der Lehrstoff ist leer.");
  if (text.length > WUD_STOFF_MAX) throw new WudFehler("eingabe", "Der Lehrstoff ist zu lang (höchstens " + WUD_STOFF_MAX + " Zeichen).");
  ids = (Array.isArray(ids) ? ids : []).map(Number).filter(x => Number.isInteger(x) && x > 0);
  if (!ids.length || ids.length > 4) throw new WudFehler("eingabe", "Keine Stunde gewählt.");
  const { t, pid } = await wudToken(o);
  const stunde = (await wudStunden(o, t, pid)).find(s => ids.every(id => s.ids.includes(id)));
  if (!stunde) throw new WudFehler("eingabe", "Diese Stunde steht heute nicht in deinem Stundenplan.");
  const fertig = [];
  for (const id of ids) {
    const th = await wudThema(o, t, id);
    if (!th.kann) throw new WudFehler("recht", "WebUntis lässt für diese Stunde keinen Lehrstoff zu." + (fertig.length ? " Die erste Stunde ist bereits eingetragen." : ""));
    if (th.anhaenge) throw new WudFehler("eingabe", "An dieser Stunde hängen Dateien. Bitte den Lehrstoff dort direkt in WebUntis ändern.");
    const topic = { periodId: id, text, attachments: [] };
    if (th.roh && th.roh.id) topic.id = th.roh.id;
    if (th.roh && th.roh.methodId) topic.methodId = th.roh.methodId;
    let r;
    try {
      r = await fetch(o + "/WebUntis/api/rest/view/v1/classreg/lesson-topics", { method: "PUT", credentials: "omit", cache: "no-store",
        headers: { Authorization: "Bearer " + t, Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ forceBlock: false, topic }) });
    } catch (e) { throw new WudFehler("netz", "WebUntis ist gerade nicht erreichbar." + (fertig.length ? " Die erste Stunde ist bereits eingetragen." : "")); }
    if (r.status === 401) throw new WudFehler("abgemeldet", "Bitte in diesem Browser bei WebUntis anmelden.");
    if (!r.ok) throw new WudFehler(r.status === 403 ? "recht" : "antwort", "WebUntis hat den Eintrag abgelehnt (" + r.status + ")." + (fertig.length ? " Die erste Stunde ist bereits eingetragen." : ""));
    fertig.push(id);
  }
  // Zur Kontrolle zurücklesen
  const jetzt = []; for (const id of ids) jetzt.push((await wudThema(o, t, id)).text);
  return { ok: true, eingetragen: fertig.length, stimmt: jetzt.every(x => x.trim() === text) };
}

/* ---- Abwesende (ab 0.39): in der Live-Beobachtung als krank/fehlt Markierte im Klassenbuch der Stunde als abwesend eintragen ----
   WebUntis führt Abwesenheiten je Stunde noch in der alten Klassenbuch-Seite. Der Helfer öffnet diese Seite der eigenen Stunde von heute
   in einem neuen Tab und löst dort denselben Befehl aus wie der Knopf „Abwesend“ der Seite (für die zugeordneten Kinder, in einem Schritt).
   Nur nach Vorschau und Klick der Lehrkraft. Die Namen für die Zuordnung kommen aus der Kürzelliste, bleiben in diesem Browser
   und werden nur mit der Schülerliste der geöffneten Seite verglichen. Zurück an die Startseite gehen nur Kürzel. */
function wudAbwInSeite(periodIds, kinder) {
  // Läuft in der WebUntis-Seite selbst (kein Zugriff auf den Helfer). Gibt nur Kürzel zurück.
  const norm = t => String(t || "").replace(/[äÄ]/g, "ae").replace(/[öÖ]/g, "oe").replace(/[üÜ]/g, "ue").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ß/g, "ss").toLowerCase().replace(/[^a-z ]+/g, " ").replace(/\s+/g, " ").trim();
  const warte = ms => new Promise(r => setTimeout(r, ms));
  const form = () => { try { const reg = window.require && window.require("dijit/registry"); const w = reg && reg.byId("classregPageForm"); return w && w.viewModel && Array.isArray(w.viewModel.students) ? w : null; } catch (e) { return null; } };
  return (async () => {
    let w = null; for (let i = 0; i < 60 && !(w = form()); i++) await warte(250);
    if (!w) return { ok: false, fehler: "Die Klassenbuch-Seite von WebUntis ist nicht wie erwartet aufgebaut. Bitte die Abwesenden dort selbst eintragen." };
    const vm = w.viewModel;
    if (!vm.period || !periodIds.includes(vm.period.id)) return { ok: false, fehler: "WebUntis zeigt eine andere Stunde als gewählt. Es wurde nichts eingetragen." };
    if (vm.absenceAllowed === false) return { ok: false, fehler: "WebUntis lässt für diese Stunde keine Abwesenheiten von dir zu." };
    const aus = { ok: true, eingetragen: [], schon: [], unbekannt: [], bestaetigt: false }, ids = [], zu = {};
    for (const k of kinder) {
      const v = norm(k.vor), n = norm(k.nach);
      const passt = vm.students.filter(s => {
        const sv = norm(s.foreName), sn = norm(s.longName);
        if (!v || !n || !sv || !sn) return false;
        return sn === n && (sv === v || sv.split(" ")[0] === v.split(" ")[0]);
      });
      if (passt.length !== 1) { aus.unbekannt.push(k.k); continue; }
      if (passt[0].absent) { aus.schon.push(k.k); continue; }
      ids.push(passt[0].id); zu[passt[0].id] = k.k;
    }
    if (!ids.length) { aus.bestaetigt = true; return aus; }
    try { w.submitCommand("multinsert", { selId: ids }); } catch (e) { return { ok: false, fehler: "WebUntis hat den Befehl nicht angenommen. Bitte die Abwesenden dort selbst eintragen." }; }
    // Die Seite baut sich nach dem Befehl neu auf oder aktualisiert ihre Liste. Nachsehen, ob die Kinder jetzt als abwesend geführt werden.
    for (let i = 0; i < 48; i++) {
      await warte(250); const f = form(); if (!f) continue;
      const jetzt = new Set(f.viewModel.students.filter(s => s.absent).map(s => s.id));
      if (ids.every(id => jetzt.has(id))) { aus.bestaetigt = true; break; }
    }
    aus.eingetragen = ids.map(id => zu[id]);
    return aus;
  })();
}
async function wudAbwSchreiben(o, ids, kinder) {
  ids = (Array.isArray(ids) ? ids : []).map(Number).filter(x => Number.isInteger(x) && x > 0);
  kinder = (Array.isArray(kinder) ? kinder : []).filter(k => k && typeof k.k === "string").slice(0, 60).map(k => ({ k: k.k.slice(0, 20), vor: String(k.vor || "").slice(0, 80), nach: String(k.nach || "").slice(0, 80) }));
  if (!ids.length || ids.length > 4) throw new WudFehler("eingabe", "Keine Stunde gewählt.");
  if (!kinder.length) throw new WudFehler("eingabe", "Niemand ist als abwesend markiert.");
  const { t, pid } = await wudToken(o);
  if (!(await wudStunden(o, t, pid)).some(s => ids.every(id => s.ids.includes(id)))) throw new WudFehler("eingabe", "Diese Stunde steht heute nicht in deinem Stundenplan.");
  const tab = await chrome.tabs.create({ url: o + "/WebUntis/embedded.do#classregpage?ttid=" + ids[0], active: true });
  await new Promise(fertig => {
    const ende = setTimeout(() => { chrome.tabs.onUpdated.removeListener(h); fertig(); }, 20000);
    const h = (id, info) => { if (id === tab.id && info.status === "complete") { clearTimeout(ende); chrome.tabs.onUpdated.removeListener(h); fertig(); } };
    chrome.tabs.onUpdated.addListener(h);
  });
  let r;
  try { r = await chrome.scripting.executeScript({ target: { tabId: tab.id }, world: "MAIN", func: wudAbwInSeite, args: [ids, kinder] }); }
  catch (e) { throw new WudFehler("antwort", "Die Klassenbuch-Seite von WebUntis ließ sich nicht öffnen. Bitte die Abwesenden dort selbst eintragen."); }
  const aus = r && r[0] && r[0].result;
  if (!aus) throw new WudFehler("antwort", "WebUntis hat nicht geantwortet. Bitte im geöffneten Tab nachsehen.");
  if (!aus.ok) throw new WudFehler("antwort", aus.fehler || "Der Eintrag hat nicht geklappt.");
  return aus;
}

if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) chrome.runtime.onMessage.addListener((m, sender, antwort) => {
  if (m && m.cmd === "wu-abw") {
    if (!sender || !String(sender.url || "").startsWith(chrome.runtime.getURL(""))) { antwort({ ok: false, art: "intern", fehler: "Nur von der Startseite aus." }); return; }
    const o = String(m.host || "").replace(/\/+$/, "");
    if (!WUD_HOST.test(o)) { antwort({ ok: false, art: "adresse", fehler: "Die WebUntis-Adresse fehlt oder passt nicht (https://<schule>.webuntis.com)." }); return; }
    wudAbwSchreiben(o, m.ids, m.kinder).then(antwort).catch(e => antwort({ ok: false, art: e.art || "fehler", fehler: String((e && e.message) || e) }));
    return true;
  }
  if (m && m.cmd === "wu-stoff") {
    if (!sender || !String(sender.url || "").startsWith(chrome.runtime.getURL(""))) { antwort({ ok: false, art: "intern", fehler: "Nur von der Startseite aus." }); return; }
    const o = String(m.host || "").replace(/\/+$/, "");
    if (!WUD_HOST.test(o)) { antwort({ ok: false, art: "adresse", fehler: "Die WebUntis-Adresse fehlt oder passt nicht (https://<schule>.webuntis.com)." }); return; }
    (m.op === "schreiben" ? wudStoffSchreiben(o, m.ids, m.text) : wudStoffLesen(o)).then(antwort).catch(e => antwort({ ok: false, art: e.art || "fehler", fehler: String((e && e.message) || e) }));
    return true;
  }
  if (!m || m.cmd !== "wu-direkt") return;
  if (!sender || !String(sender.url || "").startsWith(chrome.runtime.getURL(""))) { antwort({ ok: false, art: "intern", fehler: "Nur von der Startseite aus." }); return; }
  const o = String(m.host || "").replace(/\/+$/, "");
  const teile = (Array.isArray(m.teile) ? m.teile : []).filter(x => ["plan", "pruefungen", "hausaufgaben", "offen"].includes(x));
  if (!WUD_HOST.test(o)) { antwort({ ok: false, art: "adresse", fehler: "Die WebUntis-Adresse fehlt oder passt nicht (https://<schule>.webuntis.com)." }); return; }
  if (!teile.length) { antwort({ ok: true, stand: Date.now(), daten: {}, fehler: {} }); return; }
  wudLesen(o, teile).then(antwort).catch(e => antwort({ ok: false, art: e.art || "fehler", fehler: String((e && e.message) || e) }));
  return true;
});
