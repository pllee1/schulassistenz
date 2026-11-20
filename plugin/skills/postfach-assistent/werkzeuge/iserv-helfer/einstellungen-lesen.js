/* Schulassistenz · meine-einstellungen.js lesen, ohne sie auszuführen.
   Erweiterungsseiten dürfen keine Skripte aus dem Datenordner laden. Deshalb wird der Text der Datei
   gelesen und die Zuweisungen window.NAME = { … }; bzw. [ … ]; als Daten ausgewertet (JSON mit Kommentaren,
   Schlüsseln ohne Anführungszeichen, einfachen Anführungszeichen und Kommas am Ende). */
(function (g) {
  function ohneKommentare(t) {
    let o = "", i = 0, q = null;
    while (i < t.length) {
      const c = t[i], n = t[i + 1];
      if (q) { o += c; if (c === "\\") { o += n || ""; i += 2; continue; } if (c === q) q = null; i++; continue; }
      if (c === '"' || c === "'" || c === "`") { q = c; o += c; i++; continue; }
      if (c === "/" && n === "/") { while (i < t.length && t[i] !== "\n") i++; continue; }
      if (c === "/" && n === "*") { const e = t.indexOf("*/", i + 2); i = e < 0 ? t.length : e + 2; continue; }
      o += c; i++;
    }
    return o;
  }
  // Wandelt ein JS-Literal (Objekt/Liste) in JSON um: Schlüssel quoten, '…' → "…", Kommas am Ende weg
  function zuJson(t) {
    let o = "", i = 0;
    while (i < t.length) {
      const c = t[i];
      if (c === '"') { let j = i + 1; while (j < t.length && t[j] !== '"') j += t[j] === "\\" ? 2 : 1; o += t.slice(i, j + 1); i = j + 1; continue; }
      if (c === "'" || c === "`") {
        let j = i + 1, s = "";
        while (j < t.length && t[j] !== c) { if (t[j] === "\\") { s += t[j + 1] === c ? c : t[j] + t[j + 1]; j += 2; } else { s += t[j] === '"' ? '\\"' : t[j]; j++; } }
        o += '"' + s + '"'; i = j + 1; continue;
      }
      if (/[A-Za-z_$]/.test(c)) {
        let j = i; while (j < t.length && /[\w$]/.test(t[j])) j++;
        const w = t.slice(i, j); let k = j; while (/\s/.test(t[k] || "")) k++;
        o += (t[k] === ":" && !["true", "false", "null"].includes(w)) ? '"' + w + '"' : w; i = j; continue;
      }
      o += c; i++;
    }
    return o.replace(/,(\s*[}\]])/g, "$1");
  }
  // Findet das Ende des Literals ab Position start ({ oder [)
  function literalEnde(t, start) {
    let tiefe = 0, q = null;
    for (let i = start; i < t.length; i++) {
      const c = t[i];
      if (q) { if (c === "\\") { i++; continue; } if (c === q) q = null; continue; }
      if (c === '"' || c === "'" || c === "`") { q = c; continue; }
      if (c === "{" || c === "[") tiefe++;
      else if (c === "}" || c === "]") { tiefe--; if (tiefe === 0) return i + 1; }
    }
    return -1;
  }
  function einstellungenLesen(text) {
    const t = ohneKommentare(String(text || "").replace(/^﻿/, ""));
    const erg = {}, fehler = [];
    const re = /window\.([A-Za-z_$][\w$]*)\s*=\s*/g; let m;
    while ((m = re.exec(t))) {
      const s = re.lastIndex; if (t[s] !== "{" && t[s] !== "[") continue;
      const e = literalEnde(t, s); if (e < 0) { fehler.push(m[1] + ": nicht abgeschlossen"); continue; }
      try { erg[m[1]] = JSON.parse(zuJson(t.slice(s, e))); } catch (x) { fehler.push(m[1] + ": " + x.message); }
      re.lastIndex = e;
    }
    return { werte: erg, fehler };
  }
  g.saEinstellungenLesen = einstellungenLesen;
})(typeof window !== "undefined" ? window : globalThis);
