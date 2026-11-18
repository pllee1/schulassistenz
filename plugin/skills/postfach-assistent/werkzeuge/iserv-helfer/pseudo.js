/* Schulassistenz-Helfer · Ersetzungslogik (gleiche Regeln wie der Pseudonymisierer) */
(function (g) {
  if (g.SAPseudo) return;
  const B = "(?<![\\p{L}\\p{N}])", E = "(?![\\p{L}\\p{N}])";
  const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const translit = s => s.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss");

  function addPerson(vor, nach, kurz, rows) {
    vor = (vor || "").trim(); nach = (nach || "").trim(); kurz = (kurz || "").trim(); if (!kurz) return;
    if (vor && nach) { rows.push({ orig: vor + " " + nach, kurz }); rows.push({ orig: nach + ", " + vor, kurz }); }
    if (vor) rows.push({ orig: vor, kurz });
    if (nach) rows.push({ orig: nach, kurz });
    for (const t of (vor + " " + nach).split(/[\s-]+/)) if (t.length > 2 && !rows.some(r => r.orig === t && r.kurz === kurz)) rows.push({ orig: t, kurz });
  }
  function tabelleEinlesen(rows) {
    rows = rows.map(r => r.map(c => String(c ?? "").trim())).filter(r => r.some(c => c));
    if (!rows.length) return [];
    const h = rows[0].map(c => c.toLowerCase());
    const iK = h.findIndex(c => /k(ü|ue)rzel|code|pseudonym|ersatz/.test(c));
    const iV = h.findIndex(c => c.startsWith("vorname")), iN = h.findIndex(c => c.startsWith("nachname") || c.startsWith("familienname"));
    const out = [];
    if (iV >= 0 && iN >= 0 && iK >= 0) { rows.slice(1).forEach(r => addPerson(r[iV], r[iN], r[iK], out)); return out; }
    const kopf = iK >= 0 || h.some(c => /original|name|klartext/.test(c));
    let iO = kopf ? h.findIndex(c => /original|name|klartext/.test(c)) : 0; if (iO < 0) iO = 0;
    const iK2 = kopf && iK >= 0 ? iK : (iO === 0 ? 1 : 0);
    rows.slice(kopf ? 1 : 0).forEach(r => { if (r[iO] && r[iK2]) out.push({ orig: r[iO], kurz: r[iK2] }); });
    return out;
  }
  function paare(liste) {
    const m = new Map();
    for (const r of liste) { const o = (r.orig || "").trim(), k = (r.kurz || "").trim(); if (o && k && !m.has(o)) { m.set(o, k); const up = o.toUpperCase(); if (!m.has(up)) m.set(up, k); } }
    return m;
  }
  function rueckPaare(liste) {
    const m = new Map();
    for (const r of liste) { const o = (r.orig || "").trim(), k = (r.kurz || "").trim(); if (o && k && !m.has(k)) m.set(k, o); }
    return m;
  }
  function matcher(map) {
    const keys = [...map.keys()].sort((a, b) => b.length - a.length);
    if (!keys.length) return () => [];
    const re = new RegExp(B + "(" + keys.map(k => reEsc(k).replace(/\s+/g, "\\s+")).join("|") + ")(s|’s|'s)?" + E, "gu");
    const norm = new Map([...map].map(([k, v]) => [k.replace(/\s+/g, " "), v]));
    return text => { const out = []; re.lastIndex = 0; let m;
      while ((m = re.exec(text))) { const key = m[1].replace(/\s+/g, " "); out.push({ s: m.index, e: m.index + m[0].length, rep: (norm.get(key) ?? key) + (m[2] || ""), orig: m[0] }); }
      return out; };
  }
  function replaceText(text, find) { let r = "", last = 0, n = 0; for (const m of find(text)) { r += text.slice(last, m.s) + m.rep; last = m.e; n++; } return { text: r + text.slice(last), n }; }

  // Mailadressen: vorname.nachname@schule.de -> [Mail K07], sonst [E-Mail]
  function mailsErsetzen(text, liste) {
    const tok = new Map(), voll = new Map();
    for (const r of liste) { const o = (r.orig || "").trim(), k = (r.kurz || "").trim(); if (!o || !k) continue;
      if (/\s/.test(o) && !/,/.test(o)) { const t = translit(o).split(/\s+/).join("."); if (!voll.has(t)) voll.set(t, k); }
      else if (!/,/.test(o) && o.length > 2) { const t = translit(o); if (!tok.has(t)) tok.set(t, k); } }
    let n = 0;
    const out = text.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/gu, adr => {
      n++;
      const lokal = translit(adr.split("@")[0]).replace(/[_+-]/g, ".");
      if (voll.has(lokal)) return "[Mail " + voll.get(lokal) + "]";
      const teile = lokal.split(".");
      const ks = [...new Set(teile.map(t => tok.get(t)).filter(Boolean))];
      return ks.length ? "[Mail " + ks[0] + "]" : "[E-Mail]";
    });
    return { text: out, n };
  }

  const VORNAMEN = "Ben Paul Leon Finn Elias Jonas Luis Noah Felix Lukas Max Henry Emil Theo Liam Anton Moritz Jakob Tim Tom Niklas Julian David Jan Erik Fabian Philipp Simon Alexander Leo Matteo Oskar Samuel Vincent Daniel Jannik Johannes Marlon Nico Lennard Lennart Mats Mattis Ole Till Tobias Florian Sebastian Kevin Dennis Marcel Mohammed Mohamed Muhammed Ali Ahmed Ahmad Omar Yusuf Emir Mustafa Mehmet Hamza Ibrahim Hassan Hussein Karim Amir Can Deniz Efe Arda Kerem Baran Eren Ömer Adam Mia Emma Hannah Hanna Sofia Sophia Emilia Lina Marie Mila Ella Lea Leah Clara Klara Lena Luisa Louisa Anna Frieda Ida Greta Mathilda Lia Amelie Charlotte Johanna Laura Sarah Sara Julia Lisa Lara Leonie Nele Paula Pia Maja Maya Zoe Elena Emily Helena Katharina Lilly Lili Merle Annika Jana Jasmin Jessica Melina Michelle Nina Vanessa Vivien Carla Fiona Selin Elif Zeynep Ayla Aylin Defne Ela Esra Meryem Fatma Aisha Aya Amira Layla Leyla Mariam Maryam Nour Yasmin Hiba Alina Sofie Victoria Viktoria Valentina Anastasia Daria Polina Oleksandr Olena Kateryna Maksym Artem Dmytro Bohdan Natalia Zofia Kacper Jakub Wiktoria Szymon Michael Thomas Andreas Stefan Christian Markus Martin Frank Jürgen Peter Klaus Uwe Ralf Torsten Thorsten Sven Jens Dirk Holger Carsten Matthias Oliver Sabine Petra Andrea Claudia Susanne Nicole Stefanie Katrin Kathrin Birgit Anja Silke Tanja Sandra Melanie Martina Monika Heike Kerstin Ute Simone Christina Christine Daniela Bianca Manuela Nadine Yvonne Ines".split(" ");
  const VSET = new Set(VORNAMEN);
  const MUSTER = [
    { art: "Geburtsdatum", re: /(?:geb\.|geboren(?: am)?|Geburtsdatum:?)\s*\d{1,2}\.\s?\d{1,2}\.\s?\d{2,4}/gu, rep: "[Geburtsdatum]" },
    { art: "Telefon", re: /(?:\+49|0049|(?<![\d.])0)[\s/-]?\d{2,5}[\s/-]?\d{3,}(?:[\s-]?\d+)?/gu, rep: "[Telefon]" },
    { art: "Adresse", re: /[A-ZÄÖÜ][\p{L}-]*(?:straße|strasse|str\.|weg|allee|platz|gasse|ring|damm|chaussee|stieg)\s?\d+\s?[a-z]?\b/gu, rep: "[Adresse]" },
    { art: "PLZ/Ort", re: /(?<!\d)\d{5}\s[A-ZÄÖÜ][\p{L}-]+/gu, rep: "[Ort]" },
    { art: "Name nach Anrede", re: /(?<=(?:Herr|Herrn|Frau|Fr\.|Hr\.|Familie|Mutter|Vater|Schwester|Bruder|Oma|Opa|Liebe|Lieber|Hallo|Hi|Name:|Von:|An:|Erziehungsberechtigte[rn]?:)\s)[A-ZÄÖÜ][\p{L}-]+(?:\s[A-ZÄÖÜ][\p{L}-]+)?/gu, rep: "[Name]" },
    { art: "Signatur", re: /(?<=\n\s*--\s*\n\s*)[A-ZÄÖÜ][\p{L}-]+(?:\s[A-ZÄÖÜ][\p{L}-]+){0,2}/gu, rep: "[Name]" },
    { art: "Gruß mit Name", re: /(?<=(?:Grüße|Grüßen|Gruß|LG|VG|MfG|Danke)[,!]?\s*\n\s*)[A-ZÄÖÜ][\p{L}-]+(?:\s[A-ZÄÖÜ][\p{L}-]+)?/gu, rep: "[Name]" },
  ];
  // Wörter, die nach „Hallo/Liebe/Von:“ oft stehen, aber keine Namen sind
  const KEIN_NAME = new Set("Grüße Gruß Grüßen Dank Kollegin Kollege Leute Zusammen Eltern Kollegen Kolleginnen Kollegium Klasse Herr Frau Damen Herren Schüler Schülerinnen Alle Team Schulleitung Sekretariat Ihnen Euch Dich Sie Mail Nachricht Montag Dienstag Mittwoch Donnerstag Freitag Samstag Sonntag".split(" "));
  function pruefen(text, kuerzel) {
    const hits = [];
    for (const m of MUSTER) { m.re.lastIndex = 0; let x; while ((x = m.re.exec(text))) {
      const t = x[0]; const erstes = t.split(/\s/)[0];
      const ganz = (text.slice(x.index).match(/^[\p{L}\p{N}-]+/u) || [""])[0];
      if (m.rep === "[Name]" && (KEIN_NAME.has(erstes) || kuerzel.has(erstes) || kuerzel.has(ganz) || /^\p{N}/u.test(text.slice(x.index + t.length)))) { m.re.lastIndex = x.index + Math.max(1, erstes.length); continue; }
      hits.push({ art: m.art, s: x.index, e: x.index + t.length, txt: t, rep: m.rep }); } }
    const re = new RegExp(B + "([A-ZÄÖÜ][a-zäöüß]+)" + E, "gu"); let x;
    while ((x = re.exec(text))) if (VSET.has(x[1])) hits.push({ art: "Vorname?", s: x.index, e: x.index + x[0].length, txt: x[0], rep: "[Name]" });
    hits.sort((a, b) => a.s - b.s || (b.e - b.s) - (a.e - a.s));
    const out = []; let end = -1; for (const h of hits) { if (h.s >= end) { out.push(h); end = h.e; } }
    return out;
  }

  // Hauptfunktion: Klartext -> pseudonymisierter Text + Verdachtsstellen
  // Namen, die in Kopfzeilen vor einer Mailadresse stehen („Annette Muster <a.muster@…>“, „Muster, Annette <…>“)
  // und Namen direkt unter dem Signaturtrenner „--“. Diese Personen stehen oft nicht in der Kürzelliste (Kolleg:innen, Externe).
  const WORT = "[A-ZÄÖÜ][\\p{L}'’-]+";
  const NAME_RE = new RegExp("^(?:(?:Dr\\.|Prof\\.)\\s+)?(?:" + WORT + "\\s+){1,3}" + WORT + "$|^" + WORT + ",\\s*" + WORT + "(?:\\s+" + WORT + ")?$", "u");
  const KEIN_PERSONENWORT = /^(Klasse|Kurs|Jahrgang|Jg|Fachgruppe|Fachschaft|Lehrer|Lehrkräfte|Kollegium|Schulleitung|Sekretariat|Verwaltung|Team|Gruppe|Eltern|Elternvertreter|Schülervertretung|Förderverein|IServ|Admin|Info|Noreply)$/i;
  function kopfNamen(text) {
    const namen = new Set();
    const pruef = roh => {
      let n = roh.replace(/^["'„“]+|["'„“]+$/g, "").replace(/^(Von|An|Cc|Bcc|Kopie|Absender|From|To)(?:\s*:|\s)\s*/i, "").trim();
      if (!NAME_RE.test(n)) return;
      if (n.split(/[\s,]+/).some(w => KEIN_PERSONENWORT.test(w))) return;
      namen.add(n);
    };
    const re = /<[^<>\s]+@[^<>\s]+>/g; let m;
    while ((m = re.exec(text))) {
      const vor = text.slice(Math.max(0, m.index - 80), m.index);
      const teil = vor.split(/[\n,;:]|(?:>\s*,?)/).pop();
      // „Muster, Annette <…>“: Komma gehört zum Namen
      const mitKomma = (vor.match(/([A-ZÄÖÜ][\p{L}'’-]+,\s*[A-ZÄÖÜ][\p{L}'’-]+(?:\s+[A-ZÄÖÜ][\p{L}'’-]+)?)\s*$/u) || [])[1];
      if (mitKomma && NAME_RE.test(mitKomma)) pruef(mitKomma); else pruef(teil.trim());
    }
    // Signatur: erste nicht-leere Zeile nach „--“
    const sig = /\n\s*--\s*\n\s*([^\n]{3,60})/g;
    while ((m = sig.exec(text))) pruef(m[1].trim());
    return [...namen];
  }
  function namensForm(n) { // „Muster, Annette“ -> „Annette Muster“
    const k = n.match(/^([^,]+),\s*(.+)$/); return k ? (k[2] + " " + k[1]).trim() : n.replace(/^(Dr\.|Prof\.)\s+/, "").trim();
  }
  // auto: Map „Vorname Nachname“ -> Kürzel (P1, P2 …), bleibt auf diesem Rechner, damit dieselbe Person immer dasselbe Kürzel hat
  function autoListe(auto) {
    const out = [];
    for (const [name, code] of auto) { const t = name.split(/\s+/); const nach = t.pop(); addPerson(t.join(" "), nach, code, out); }
    return out;
  }
  function autoNeu(auto, name, belegt) {
    let n = 1; const codes = new Set([...auto.values(), ...belegt]);
    while (codes.has("P" + n)) n++;
    auto.set(name, "P" + n); return "P" + n;
  }
  function pseudonymisieren(text, liste, auto = new Map(), opts = {}) {
    const bekannt = paare(liste), belegt = new Set(liste.map(r => (r.kurz || "").trim()));
    const neu = [];
    if (opts.kopf !== false) {
      for (const roh of kopfNamen(text)) {
        const name = namensForm(roh);
        if (bekannt.has(name) || bekannt.has(roh) || auto.has(name)) continue;
        neu.push([name, autoNeu(auto, name, belegt)]);
      }
    }
    const alle = liste.concat(autoListe(auto));
    const a = mailsErsetzen(text, alle);
    const b = replaceText(a.text, matcher(paare(alle)));
    const kuerzel = new Set(alle.map(r => (r.kurz || "").trim()).filter(Boolean));
    return { text: b.text, ersetzt: b.n, mails: a.n, neu, verdacht: pruefen(b.text, kuerzel) };
  }
  function verdachtAnwenden(text, verdacht) {
    let r = "", last = 0; for (const h of verdacht.filter(h => h.an)) { r += text.slice(last, h.s) + h.rep; last = h.e; } return r + text.slice(last);
  }
  function zurueck(text, liste, auto = new Map()) { return replaceText(text, matcher(rueckPaare(liste.concat(autoListe(auto))))); }

  g.SAPseudo = { tabelleEinlesen, addPerson, pseudonymisieren, verdachtAnwenden, zurueck, kopfNamen, autoNeu, namensForm };
})(typeof window !== "undefined" ? window : self);
