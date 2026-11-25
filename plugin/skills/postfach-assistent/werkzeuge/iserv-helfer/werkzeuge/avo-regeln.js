/* Schulassistenz · Regel-Engine Abschluss-Check (AVO-Sek I, IGS Niedersachsen)
   Wörtliche Kopie der Regel-Engine aus abschluss-check.html (dort bleibt sie eingebettet, weil der Updater das Werkzeug
   auch als einzelne Datei Abschluss-Check.html ablegt). Bei Änderungen an den Regeln BEIDE Stellen gleich ändern.
   Genutzt von der Konferenz-Mappe der Startseite (startseite/konferenz.js): window.saAVO = { check, evalLevel, buildSubjects, SUBJECTS, LEVELS, FLD_KEYS }. */
(function () {
// Regel-Engine Abschluss-Check (AVO-Sek I, IGS Niedersachsen, Stand 13.09.2023)
// Grundlage: Wissensbasis "Regelwissen AVO-Sek I – Integrierte Gesamtschule"
const SUBJECTS = [
  { k: 'D', n: 'Deutsch', h: 4, fld: true, core: true },
  { k: 'M', n: 'Mathematik', h: 4, fld: true, core: true },
  { k: 'E', n: 'Englisch', h: 4, fld: true, core: true },
  { k: 'NW', n: 'Naturwissenschaften', h: 4, fld: true, core: false },
  { k: 'GL', n: 'Gesellschaftslehre', h: 3 },
  { k: 'WN', n: 'Werte und Normen', h: 2 },
  { k: 'SP', n: 'Sport', h: 2 },
  { k: 'KU', n: 'Kunst', h: 2 },
  { k: 'MU', n: 'Musik', h: 2 },
  { k: 'IN', n: 'Informatik', h: 2 },
  { k: 'AWT', n: 'Arbeit-Wirtschaft-Technik', h: 1 },
  { k: 'WPK', n: 'Wahlpflichtkurs', h: 4 },
];
const FLD_KEYS = ['D', 'M', 'E', 'NW'];

const LEVELS = {
  S15: { id: 'S15', name: 'Erweiterter Sekundarabschluss I', short: 'Erweiterter Sek I', par: '§ 15' },
  S14: { id: 'S14', name: 'Sekundarabschluss I – Realschulabschluss', short: 'Realschulabschluss', par: '§ 14' },
  S13: { id: 'S13', name: 'Sekundarabschluss I – Hauptschulabschluss', short: 'Sek I – Hauptschulabschluss', par: '§ 13' },
  H16b: { id: 'H16b', name: 'Hauptschulabschluss', short: 'Hauptschulabschluss', par: '§ 16 Abs. 2' },
  H16a: { id: 'H16a', name: 'Hauptschulabschluss', short: 'Hauptschulabschluss', par: '§ 16 Abs. 1' },
};

function buildSubjects(input) {
  const out = [];
  const missing = [];
  for (const s of SUBJECTS) {
    const g = input.grades[s.k];
    const sub = { ...s };
    if (s.k === 'WPK') {
      sub.frz = !!input.wpkFrz;
      sub.n = sub.frz ? 'Französisch (WPK, 2. Fremdsprache)' : (input.wpkName ? 'WPK ' + input.wpkName : 'Wahlpflichtkurs');
      sub.core = sub.frz; // § 24 Abs. 2: Pflicht- und Wahlpflichtfremdsprachen
    }
    if (s.fld) sub.level = input.levels[s.k] || null;
    if (!g) { missing.push(sub.n); continue; }
    sub.grade = +g;
    out.push(sub);
  }
  return { subs: out, missing };
}

const fmt2 = (x) => x.toFixed(2).replace('.', ',');
const label = (s) => (s.fld ? `${s.n} (${s.level}-Kurs)` : s.n);

// ---- Ausgleich ---------------------------------------------------------
function eligible(comp, def) {
  // D1 Stundenregel, D3 Kernfächer nur durch Kernfächer
  if (comp.h < def.h - 1) return false;
  if (def.core && !comp.core) return false;
  return true;
}
function effSurplus(comp, def, c4) {
  let s = comp.soll - comp.grade;
  // C4 (nur § 13): 4 im E-Kurs genügt als Ausgleich für eine 5 im G-Kurs / Fach ohne FLD
  if (c4 && comp.fld && comp.level === 'E' && comp.grade === 4 && def.grade === 5 && (!def.fld || def.level === 'G')) s = Math.max(s, 1);
  return s;
}
function pairsOf(arr) { const r = []; for (let i = 0; i < arr.length; i++) for (let j = 0; j < arr.length; j++) if (i !== j) r.push([arr[i], arr[j]]); return r; }

function compensate(rows, opts) {
  const defs = rows.filter((r) => r.def > 0);
  const comps = rows.filter((r) => r.def === 0 && !r.ignored);
  const n = defs.length;
  const can = (c, d, min) => eligible(c, d) && effSurplus(c, d, opts.c4) >= min;
  const txt = (d, cs) => `${d.n} (${d.grade}) durch ${cs.map((c) => `${c.n} (${c.grade})`).join(' und ')}`;
  if (n === 0) return { rank: 3, text: 'keine Unterschreitung' };
  if (n === 1 && defs[0].def === 1) return { rank: 2, text: `${defs[0].n}: eine Stufe unter Soll – unschädlich nach § 23 Abs. 3`, c1: true };
  // C2: zwei Fächer je eine Stufe
  if (n === 2 && defs.every((d) => d.def === 1)) {
    for (const [a, b] of pairsOf(comps)) if (can(a, defs[0], 1) && can(b, defs[1], 1))
      return { rank: 1, par: '§ 23 Abs. 4' + (opts.c4 && (effSurplus(a, defs[0], false) < 1 || effSurplus(b, defs[1], false) < 1) ? ' i. V. m. Abs. 6 Satz 2' : ''), text: `${txt(defs[0], [a])}; ${txt(defs[1], [b])}` };
  }
  // C3: ein Fach zwei Stufen
  const sixComp = (d) => {
    for (const c of comps) if (can(c, d, 2)) return [c];
    for (const [a, b] of pairsOf(comps)) if (a.k < b.k && can(a, d, 1) && can(b, d, 1)) return [a, b];
    return null;
  };
  if (n === 1 && defs[0].def === 2) {
    const cs = sixComp(defs[0]);
    if (cs) return { rank: 1, par: '§ 23 Abs. 5', text: txt(defs[0], cs) };
  }
  if (opts.c5) {
    // C5a: 5 in drei Fächern durch 3 in zwei Fächern (+ ein weiteres Fach 5 ohne Ausgleich)
    if ((n === 3 || n === 4) && defs.every((d) => d.def === 1)) {
      const frees = n === 4 ? defs.map((d) => [d]) : [[]];
      for (const free of frees) {
        const rest = defs.filter((d) => !free.includes(d));
        for (const [a, b] of pairsOf(comps)) {
          if (a.k > b.k) continue;
          if (a.soll - a.grade < 1 || b.soll - b.grade < 1) continue; // beide Ausgleichsfächer mind. 3
          if (rest.every((d) => can(a, d, 1) || can(b, d, 1)))
            return { rank: 1, par: '§ 23 Abs. 6 Satz 1', text: `${rest.map((d) => `${d.n} (${d.grade})`).join(', ')} durch ${a.n} (${a.grade}) und ${b.n} (${b.grade})` + (free.length ? `; ${free[0].n} (${free[0].grade}) als weitere 5 ohne Ausgleich` : '') };
        }
      }
    }
    // C5b: 6 in einem Fach durch 2 in einem oder 3 in zwei (+ eine weitere 5 ohne Ausgleich)
    const sixes = defs.filter((d) => d.def === 2);
    const others = defs.filter((d) => d.def !== 2);
    if (sixes.length === 1 && others.length <= 1 && others.every((d) => d.def === 1)) {
      const cs = sixComp(sixes[0]);
      if (cs) return { rank: 1, par: '§ 23 Abs. 6 Satz 1', text: txt(sixes[0], cs) + (others.length ? `; ${others[0].n} (${others[0].grade}) als weitere 5 ohne Ausgleich` : '') };
    }
  }
  return { rank: 0, text: 'Unterschreitungen nicht ausgleichbar (§ 23 Abs. 6 / C6) oder keine geeigneten Ausgleichsfächer (§ 24)' };
}

// ---- Soll-Zuordnungen je Stufe -----------------------------------------
function combos(arr, k) { if (k === 0) return [[]]; if (arr.length < k) return []; const [h, ...t] = arr; return [...combos(t, k - 1).map((c) => [h, ...c]), ...combos(t, k)]; }

function assignments(levelId, subs) {
  const E = subs.filter((s) => s.fld && s.level === 'E');
  const G = subs.filter((s) => s.fld && s.level === 'G');
  const non = subs.filter((s) => !s.fld);
  const base = () => Object.fromEntries(subs.map((s) => [s.k, { soll: 4, why: 'Mindestanforderung (§ 13 Satz 1)' }]));
  if (levelId === 'S13' || levelId === 'H16a' || levelId === 'H16b') return { list: [base()] };
  if (levelId === 'S14') {
    if (E.length < 2) return { structural: `Für den Realschulabschluss brauchst du mindestens 2 E-Kurse – belegt: ${E.length} (§ 14 Abs. 1, B2.1).` };
    const list = [];
    for (const pair of combos(non, Math.min(2, non.length))) {
      const a = base();
      for (const s of E) a[s.k] = { soll: 4, why: 'E-Kurs (§ 14)' };
      for (const s of G) a[s.k] = { soll: 3, why: 'G-Kurs (§ 14)' };
      for (const s of pair) a[s.k] = { soll: 3, why: 'eines der 2 Fächer ohne FLD (§ 14)' };
      list.push(a);
    }
    return { list };
  }
  if (levelId === 'S15') {
    if (E.length < 3) return { structural: `Für den Erweiterten Sek I brauchst du mindestens 3 E-Kurse – belegt: ${E.length} (§ 15 Abs. 1, B3.1).` };
    const list = [];
    if (E.length === 4) {
      for (const fourth of E) {
        const a = base();
        for (const s of E) a[s.k] = s === fourth ? { soll: 4, why: 'vierter E-Kurs (§ 15)' } : { soll: 3, why: 'einer der 3 E-Kurse (§ 15)' };
        list.push(a);
      }
    } else {
      const a = base();
      for (const s of E) a[s.k] = { soll: 3, why: 'einer der 3 E-Kurse (§ 15)' };
      for (const s of G) a[s.k] = { soll: 2, why: 'G-Kurs (§ 15)' };
      list.push(a);
    }
    return { list };
  }
}

function average15(subs) {
  // B3.3: Fächer ohne FLD + bis zu zwei E-Kurse mit 1–3, nur wenn sie den Schnitt verbessern (H2)
  const non = subs.filter((s) => !s.fld);
  const eGood = subs.filter((s) => s.fld && s.level === 'E' && s.grade <= 3).sort((a, b) => a.grade - b.grade);
  let best = null;
  for (let k = 0; k <= Math.min(2, eGood.length); k++) {
    const items = [...non, ...eGood.slice(0, k)];
    if (!items.length) continue;
    const sum = items.reduce((x, s) => x + s.grade, 0);
    const val = Math.floor((sum * 100) / items.length) / 100; // abschneiden, nicht runden
    if (!best || val < best.val) best = { items, sum, cnt: items.length, val };
  }
  if (!best) return null;
  best.ok = best.val <= 3.0;
  best.text = `(${best.items.map((s) => s.grade).join(' + ')}) / ${best.cnt} = ${best.sum} / ${best.cnt} = ${fmt2(best.val)}`;
  best.names = best.items.map((s) => (s.fld ? s.n + ' (E)' : s.n));
  return best;
}

function evalLevel(levelId, subs) {
  const L = LEVELS[levelId];
  const A = assignments(levelId, subs);
  const res = { ...L, rank: 0 };
  if (A.structural) { res.structural = A.structural; res.rows = null; return res; }
  const ignoreFL2 = levelId === 'S13' || levelId === 'H16a' || levelId === 'H16b';
  const opts = { c4: levelId === 'S13', c5: levelId === 'H16a' || levelId === 'H16b' };
  let best = null;
  for (const a of A.list) {
    const rows = subs.map((s) => {
      const r = { ...s, soll: a[s.k].soll, why: a[s.k].why };
      r.def = Math.max(0, r.grade - r.soll);
      if (ignoreFL2 && s.frz && s.grade >= 5) { r.def = 0; r.ignored = true; r.why = '2. Fremdsprache: 5/6 bleibt unberücksichtigt'; }
      return r;
    });
    const c = compensate(rows, opts);
    const total = rows.reduce((x, r) => x + r.def, 0);
    if (!best || c.rank > best.c.rank || (c.rank === best.c.rank && total < best.total)) best = { rows, c, total };
  }
  res.rows = best.rows;
  res.comp = best.c;
  res.rank = best.c.rank;
  if (levelId === 'S15') {
    res.avg = average15(subs);
    if (!res.avg || !res.avg.ok) res.rank = 0;
  }
  return res;
}

// ---- Gesamtprüfung -----------------------------------------------------
function check(input) {
  const { subs, missing } = buildSubjects(input);
  const need = [];
  for (const k of FLD_KEYS) {
    const s = SUBJECTS.find((x) => x.k === k);
    if (!input.grades[k]) need.push(`Note in ${s.n}`);
    if (!input.levels[k]) need.push(`Kurs (G/E) in ${s.n}`);
  }
  if (need.length) return { incomplete: need };
  const jg = +input.jg;
  const order = jg === 10 ? ['S15', 'S14', 'S13', 'H16b'] : ['H16a'];
  const levels = order.map((id) => evalLevel(id, subs));

  // Prüfungsschranke § 1 Abs. 3
  const pKeys = jg === 10 ? ['D', 'M', 'E'] : ['D', 'M'];
  if (input.muendlich && !pKeys.includes(input.muendlich)) pKeys.push(input.muendlich);
  const pSubs = pKeys.map((k) => subs.find((s) => s.k === k)).filter(Boolean);
  const pBad = pSubs.filter((s) => s.grade >= 5);
  const schranke = { subs: pSubs, bad: pBad, ok: pBad.length <= 1, below4: pSubs.filter((s) => s.grade > 4), muendlichFehlt: !input.muendlich };

  let reached = null, konferenz = [];
  for (const L of levels) {
    if (L.rank >= 2) { reached = L; break; }
    if (L.rank === 1) konferenz.push(L);
  }
  const above = reached ? levels.slice(0, levels.indexOf(reached)) : levels;
  const next = above.length ? above[above.length - 1] : null; // direkt höhere Stufe

  // Was-wäre-wenn: welche einzelne Verbesserung um eine Stufe reicht für die nächsthöhere Stufe?
  let hints = [];
  const target = konferenz.length ? konferenz[konferenz.length - 1] : next;
  if (target) {
    for (const s of subs) {
      if (s.grade <= 1) continue;
      const mod = subs.map((x) => (x === s ? { ...x, grade: x.grade - 1 } : x));
      if (evalLevel(target.id, mod).rank >= 2) hints.push(s);
    }
  }

  const final = input.stand === 'final';
  let sicherheit = 'hoch';
  if (!final || konferenz.length || missing.length || (schranke.muendlichFehlt)) sicherheit = 'mittel';

  return { jg, final, levels, reached: schranke.ok ? reached : null, reachedIgnoringSchranke: reached, konferenz: schranke.ok ? konferenz : [], schranke, missing, next, target, hints, sicherheit, subs };
}

const api = { check, evalLevel, buildSubjects, SUBJECTS, LEVELS, FLD_KEYS };
if (typeof window !== 'undefined') window.saAVO = api;
if (typeof module !== 'undefined') module.exports = api;
})();
