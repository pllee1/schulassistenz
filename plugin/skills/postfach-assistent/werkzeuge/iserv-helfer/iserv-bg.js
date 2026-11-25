/* Schulassistenz-Helfer · IServ direkt lesen (ab 0.35)
   Liest über die Anmeldung im Browser: ungelesene Mails im Posteingang, heutige Krankmeldungen (DieSchulApp) und offene Anträge.
   Für die Startseite, je Bereich einzeln schaltbar (anfangs alles aus).
   - Nur lesend: ausschließlich GET auf die unten aufgeführten Adressen (ISD_WEGE). Es wird nur die Liste der Mails gelesen,
     nie eine einzelne Mail geöffnet. Der Ungelesen-Zähler bleibt dadurch unverändert (am 25.11.2026 geprüft).
   - Nur von Seiten des Helfers aus aufrufbar.
   - Klarnamen verlassen diesen Baustein nicht: Absender und Betreff werden hier mit der Kürzelliste ersetzt (unbekannte Absender
     bekommen wie im Helfer-Fenster P1, P2 …), Krankmeldungen werden nur für Kinder aus deinen Kürzellisten weitergegeben, als Kürzel.
     Die Notiz einer Krankmeldung (kann Gesundheitsangaben enthalten) wird nie gelesen. */
try { if (typeof SAPseudo === "undefined") importScripts("pseudo.js"); } catch (e) {}
const ISD_HOST = /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+$/i;
const ISD_WEGE = [
  /^\/iserv\/mail$/,
  /^\/iserv\/app\/navigation\/badges$/,
  /^\/iserv\/mail\/api\/v2\/account\/[^/?#]+\/mailbox$/,
  /^\/iserv\/mail\/api\/v2\/account\/[^/?#]+\/message\?flag%5Bseen%5D=false&limit=\d+&offset=0&order=desc&sort=date&mailbox%5B%5D=[\w%.~-]+$/,
  /^\/iserv\/dieschulapp\/api\/1\.0\/sickNotes\/\?filterBy=[\w:().,-]+$/,
  /^\/iserv\/dieschulapp\/api\/1\.0\/user-requests-to-school\/student-absences\/meta\/\?filterBy=accepted:is\(null\)$/
];
class IsdFehler extends Error { constructor(art, text) { super(text); this.art = art; } }
async function isdHolen(o, weg, alsText) {
  if (!ISD_WEGE.some(w => w.test(weg))) throw new IsdFehler("intern", "Adresse nicht erlaubt: " + weg.split("?")[0]);
  let r;
  try { r = await fetch(o + weg, { method: "GET", credentials: "include", cache: "no-store", redirect: "follow", headers: { Accept: alsText ? "text/html" : "application/json" } }); }
  catch (e) { throw new IsdFehler("netz", "IServ ist gerade nicht erreichbar."); }
  const ct = r.headers.get("content-type") || "";
  if (r.status === 401 || r.status === 403 || (r.redirected && /\/(login|auth)/.test(r.url)) || (!alsText && r.ok && !/json/i.test(ct))) throw new IsdFehler("abgemeldet", "Bitte in diesem Browser bei IServ anmelden.");
  if (r.status === 404) throw new IsdFehler("fehlt", "Diesen Bereich gibt es an dieser Schule nicht.");
  if (!r.ok) throw new IsdFehler("antwort", "IServ antwortet mit " + r.status + ".");
  if (alsText) { const t = await r.text(); if (/name="_password"|id="login/i.test(t)) throw new IsdFehler("abgemeldet", "Bitte in diesem Browser bei IServ anmelden."); return t; }
  try { return await r.json(); } catch (e) { throw new IsdFehler("antwort", "IServ hat keine Daten geliefert."); }
}

/* ---- Namen zu Kürzeln (bleibt in diesem Baustein) ---- */
async function isdNamen() {
  const v = await chrome.storage.local.get({ liste: [], ichName: "", personenAuto: {} });
  const liste = (v.liste || []).slice();
  if (v.ichName && typeof SAPseudo !== "undefined") { const t = v.ichName.trim().split(/\s+/); const n = t.pop(); SAPseudo.addPerson(t.join(" "), n, "L-ICH", liste); }
  return { liste, auto: new Map(Object.entries(v.personenAuto || {})), autoVorher: JSON.stringify(v.personenAuto || {}) };
}
// Text mit Kürzeln statt Namen; Verdachtsstellen (mögliche weitere Namen) werden ebenfalls ersetzt
function isdErsetzen(text, N) {
  if (typeof SAPseudo === "undefined") return "";
  const r = SAPseudo.pseudonymisieren(String(text || ""), N.liste, N.auto, { kopf: false });
  (r.verdacht || []).forEach(h => h.an = true);
  return SAPseudo.verdachtAnwenden(r.text, r.verdacht || []);
}
// Eine Person als Kürzel; unbekannte Absender bekommen ein P-Kürzel (wie im Helfer-Fenster), Kinder ohne Kürzel: null
function isdPerson(name, N, neuErlaubt) {
  if (typeof SAPseudo === "undefined") return null;
  const form = SAPseudo.namensForm(String(name || "").replace(/\s+/g, " ").trim()); if (!form) return null;
  const r = SAPseudo.pseudonymisieren(form, N.liste, N.auto, { kopf: false });
  const t = r.text.trim();
  if (r.ersetzt > 0 && !/\s/.test(t)) return t;
  if (!neuErlaubt) return null;
  return SAPseudo.autoNeu(N.auto, form, new Set(N.liste.map(x => (x.kurz || "").trim())));
}

const isdIso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
async function isdLesen(o, teile) {
  const N = await isdNamen();
  const aus = {}, fehler = {};
  const teil = async (name, f) => { if (!teile.includes(name)) return; try { aus[name] = await f(); } catch (e) { if (e.art === "abgemeldet" || e.art === "netz") throw e; fehler[name] = String(e.message || e); } };
  await teil("mail", async () => {
    const html = await isdHolen(o, "/iserv/mail", true);
    const m = html.match(/<script id="php-data" type="application\/json">([\s\S]*?)<\/script>/);
    let konto = null; try { konto = Object.keys(JSON.parse(m[1]).accounts.valid)[0]; } catch (e) {}
    if (!konto) throw new IsdFehler("antwort", "Das Mailkonto wurde auf der IServ-Mailseite nicht gefunden.");
    const basis = "/iserv/mail/api/v2/account/" + encodeURIComponent(konto);
    const mb = await isdHolen(o, basis + "/mailbox");
    const inbox = mb && mb.mailboxes && mb.mailboxes.inbox;
    if (!inbox || !inbox.mailboxId) throw new IsdFehler("antwort", "Der Posteingang wurde nicht gefunden.");
    let briefe = null; try { const b = await isdHolen(o, "/iserv/app/navigation/badges"); if (typeof b.parentletter === "number") briefe = b.parentletter; } catch (e) { if (e.art === "abgemeldet" || e.art === "netz") throw e; }
    let liste = [];
    if (inbox.unreadCount > 0) {
      const l = await isdHolen(o, basis + "/message?flag%5Bseen%5D=false&limit=8&offset=0&order=desc&sort=date&mailbox%5B%5D=" + encodeURIComponent(inbox.mailboxId));
      liste = ((l && l.items) || []).filter(x => x.read === false).map(x => {
        const a = (x.from || [])[0] || {};
        return { zeit: String(x.date || ""), von: isdPerson(a.personal || a.mailbox || "", N, true) || "?", betreff: isdErsetzen(x.subject, N).slice(0, 140), anhang: (x.attachmentCount || 0) > 0 };
      });
    }
    return { ungelesen: typeof inbox.unreadCount === "number" ? inbox.unreadCount : liste.length, liste, elternbriefe: briefe };
  });
  await teil("krank", async () => {
    const h = isdIso(new Date());
    const l = await isdHolen(o, "/iserv/dieschulapp/api/1.0/sickNotes/?filterBy=sickFromDateAsString:smallerOrEqualThan(" + h + "),sickTillDateAsString:greaterOrEqualThan(" + h + ")");
    const alle = Array.isArray(l) ? l : [], meine = [], da = new Set();
    const kuerzel = new Set(N.liste.map(r => (r.kurz || "").trim()).filter(k => k && k !== "L-ICH"));
    for (const x of alle) {
      const u = x.sickUser || {};
      const k = isdPerson(((u.forename || "") + " " + (u.surname || "")).trim() || u.displayname, N, false);
      if (!k || !kuerzel.has(k)) continue;   // nur Kinder aus den eigenen Kürzellisten
      const key = k + "|" + x.sickFromDateAsString + "|" + x.sickTillDateAsString; if (da.has(key)) continue; da.add(key);
      meine.push({ kuerzel: k, klasse: String((u.mainCourse && u.mainCourse.name) || "").slice(0, 30), von: String(x.sickFromDateAsString || ""), bis: String(x.sickTillDateAsString || ""),
        stVon: typeof x.sickFromLessonNumber === "number" ? x.sickFromLessonNumber : null, stBis: typeof x.sickTillLessonNumber === "number" ? x.sickTillLessonNumber : null,
        beurlaubung: x.type === "exeat", schriftlich: !!x.hasWrittenConfirmation, offen: x.status === "open" });   // note (Freitext) wird nie gelesen
    }
    return { schule: alle.length, meine: meine.sort((a, b) => a.kuerzel.localeCompare(b.kuerzel, "de", { numeric: true })) };
  });
  await teil("antraege", async () => {
    const j = await isdHolen(o, "/iserv/dieschulapp/api/1.0/user-requests-to-school/student-absences/meta/?filterBy=accepted:is(null)");
    return { offen: typeof (j && j.numberOfResults) === "number" ? j.numberOfResults : null };
  });
  // neu vergebene P-Kürzel merken, damit dieselbe Person überall dasselbe Kürzel behält
  const autoJetzt = Object.fromEntries(N.auto);
  if (JSON.stringify(autoJetzt) !== N.autoVorher) try { await chrome.storage.local.set({ personenAuto: autoJetzt }); } catch (e) {}
  return { ok: true, stand: Date.now(), daten: aus, fehler };
}

if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) chrome.runtime.onMessage.addListener((m, sender, antwort) => {
  if (!m || m.cmd !== "is-direkt") return;
  if (!sender || !String(sender.url || "").startsWith(chrome.runtime.getURL(""))) { antwort({ ok: false, art: "intern", fehler: "Nur von der Startseite aus." }); return; }
  const o = String(m.host || "").replace(/\/+$/, "");
  const teile = (Array.isArray(m.teile) ? m.teile : []).filter(x => ["mail", "krank", "antraege"].includes(x));
  if (!ISD_HOST.test(o)) { antwort({ ok: false, art: "adresse", fehler: "Die IServ-Adresse fehlt oder passt nicht (https://deine-schule.de)." }); return; }
  if (!teile.length) { antwort({ ok: true, stand: Date.now(), daten: {}, fehler: {} }); return; }
  isdLesen(o, teile).then(antwort).catch(e => antwort({ ok: false, art: e.art || "fehler", fehler: String((e && e.message) || e) }));
  return true;
});
