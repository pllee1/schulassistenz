/* Schulassistenz-Helfer – LEB-online, Klassenbewertungen (ab 0.34): Aufbau und Textbausteine ablesen
   Vorstufe für „Claude schlägt AV/SV-Bemerkungen vor, der Helfer füllt vor“. Dieser Baustein liest nur die geöffnete Seite:
   Feldnamen, Feldarten und die Auswahllisten der Textbausteine (Texte der Schule mit Platzhalter, keine Schülerdaten).
   Er klickt nichts, ruft keine Adresse auf, ändert kein Feld und liest keine eingetragenen Werte. Überschriften werden unkenntlich
   gemacht (nur die Form bleibt), der Bericht läuft zusätzlich durch die Kürzelliste und verlässt den Browser nur, wenn du ihn kopierst. */
(() => {
  if (window.__saLebKb) return; window.__saLebKb = true;
  if (window.top !== window && !document.querySelector("form")) return;
  const form = [...document.forms].find(f => f.querySelector('[name*="verhalten"],[name*="textbaustein"],[name*="bemerkung"]'));
  if (!form) return;
  const maske = t => String(t || "").replace(/\s+/g, " ").trim().replace(/[A-Za-zÀ-ÿ]/g, "x").replace(/\d/g, "9").slice(0, 60);
  const zahlWeg = t => String(t || "").replace(/\d{3,}/g, "999");
  const pfad = u => { try { return new URL(u, location.href).pathname; } catch (e) { return ""; } };
  const BAUSTEIN = /textbaustein|verhalten|zeugnisart|abschlu/i;

  function bericht() {
    const z = [];
    z.push("LEB-online Klassenbewertung: Aufbau (ohne Werte) und Textbausteine");
    z.push("Seite: " + location.pathname + " · Parameter: " + [...new URL(location.href).searchParams.keys()].join(", "));
    z.push("Formular: " + (form.method || "get").toUpperCase() + " " + pfad(form.action) + " · Felder: " + form.elements.length);
    z.push(""); z.push("## Überschriften (unkenntlich, nur Form)");
    document.querySelectorAll("h1,h2,h3,h4,caption,legend,th").forEach(h => { const t = maske(h.textContent); if (t) z.push(h.tagName.toLowerCase() + (h.className ? "." + String(h.className).split(/\s+/)[0] : "") + ": " + t); });
    z.push(""); z.push("## Felder");
    const gesehen = new Set();
    for (const el of form.elements) {
      if (!el.name) continue;
      const name = el.name.replace(/\[\d+\]/g, "[n]"), art = el.tagName.toLowerCase() + (el.type && el.tagName === "INPUT" ? ":" + el.type : "");
      const k = name + "|" + art; if (gesehen.has(k)) continue; gesehen.add(k);
      const ereignisse = [...el.attributes].filter(a => /^on/.test(a.name)).map(a => a.name + "=" + zahlWeg(a.value).slice(0, 160));
      let label = ""; const l = el.id && document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
      if (l) label = l.textContent; else { const td = el.closest("td"); const vor = td && td.previousElementSibling; if (vor && !vor.querySelector("input,select,textarea")) label = vor.textContent; }
      label = String(label || "").replace(/\s+/g, " ").trim();
      // Beschriftung nur bei Einzelfeldern und nur, wenn sie nicht wie ein Name aussieht („Nachname, Vorname“)
      if (label.length > 45 || /\d{2,}/.test(label) || /\[\d+\]/.test(el.name) || /^[^,:]+,\s*\S+/.test(label)) label = "";
      z.push("- " + name + " | " + art + (el.tagName === "SELECT" ? " | " + el.options.length + " Einträge" : "") + (el.maxLength > 0 ? " | max " + el.maxLength : "")
        + (el.tagName === "TEXTAREA" ? " | " + (el.value ? "gefüllt" : "leer") : "") + (label ? " | Beschriftung: " + label : "") + (el.disabled || el.readOnly ? " | gesperrt" : "") + (ereignisse.length ? " | " + ereignisse.join(" ; ") : ""));
    }
    z.push(""); z.push("## Knöpfe");
    form.querySelectorAll('button,input[type=submit],input[type=button],a[onclick]').forEach(b => z.push("- " + b.tagName.toLowerCase() + ": " + String(b.value || b.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40) + (b.getAttribute("onclick") ? " | onclick=" + zahlWeg(b.getAttribute("onclick")).slice(0, 120) : "")));
    z.push(""); z.push("## Adressen in den Skripten der Seite");
    const adr = new Set(); document.querySelectorAll("script:not([src])").forEach(s => (s.textContent.match(/[\w\/.-]+\.php/g) || []).forEach(a => adr.add(a)));
    z.push([...adr].slice(0, 30).join(", ") || "keine");
    z.push(""); z.push("## Auswahllisten (Texte der Schule)");
    const listen = new Set();
    for (const el of form.elements) {
      if (el.tagName !== "SELECT" || !BAUSTEIN.test(el.name) || listen.has(el.name.replace(/\[\d+\]/g, "[n]"))) continue;
      listen.add(el.name.replace(/\[\d+\]/g, "[n]"));
      z.push("### " + el.name.replace(/\[\d+\]/g, "[n]"));
      for (const o of el.options) z.push(o.value + " = " + String(o.textContent || "").replace(/\s+/g, " ").trim().slice(0, 400));
    }
    return z.join("\n");
  }
  async function sicher(text) {
    // zusätzlich durch die Kürzelliste: sollte doch ein Name in einer Auswahlliste stehen, wird er zum Kürzel
    try {
      const v = await chrome.storage.local.get({ liste: [], ichName: "" });
      if (window.SAPseudo && v.liste.length) { const r = window.SAPseudo.pseudonymisieren(text, v.liste.slice()); return { text: r.text, ersetzt: r.ersetzt }; }
    } catch (e) {}
    return { text, ersetzt: 0 };
  }

  const host = document.createElement("div");
  const root = host.attachShadow({ mode: "closed" });
  root.innerHTML = `<style>
    :host{all:initial}
    .bar{color-scheme:dark;position:fixed;bottom:10px;right:10px;z-index:2147483647;width:min(460px,calc(100vw - 20px));max-height:calc(100vh - 20px);overflow:auto;background:#191816;color:#efe8da;border:1px solid #38342f;border-top:4px solid #8fb3e8;border-radius:10px;box-shadow:0 18px 50px rgba(0,0,0,.5);padding:10px 12px;font:13.5px/1.45 system-ui,"Segoe UI",sans-serif}
    h2{font:700 14.5px Georgia,serif;margin:0 0 6px;display:flex;gap:8px}h2 span{flex:1}
    .x{background:none;border:0;color:#aaa196;font-size:18px;cursor:pointer;padding:0 4px}
    p{margin:6px 0;color:#aaa196;font-size:12.5px}
    button.b{padding:7px 12px;border-radius:8px;border:1px solid #8fb3e8;background:#8fb3e8;color:#101a2b;font-weight:700;cursor:pointer;font-size:13px}
    textarea{width:100%;box-sizing:border-box;height:220px;background:#22201d;color:#efe8da;border:1px solid #38342f;border-radius:8px;font:12px Consolas,monospace;margin-top:8px}
    .ok{color:#8fcf9f}
  </style><div class="bar"><h2><span>Schulassistenz: Textbausteine ablesen</span><button class="x" title="Schließen">×</button></h2>
    <p>Einmalig, damit Claude passende AV/SV-Bausteine vorschlagen kann: Der Helfer liest den Aufbau dieses Formulars und die Auswahllisten der Textbausteine. Keine eingetragenen Werte, keine Namen. Er ändert und speichert nichts.</p>
    <button class="b" id="los">Aufbau und Textbausteine anzeigen</button>
    <div id="aus" hidden><textarea readonly></textarea><p id="info"></p><button class="b" id="kopie">In die Zwischenablage kopieren</button> <span class="ok" id="ok"></span></div></div>`;
  root.querySelector(".x").addEventListener("click", () => host.remove());
  root.querySelector("#los").addEventListener("click", async () => {
    const r = await sicher(bericht());
    root.querySelector("textarea").value = r.text; root.querySelector("#aus").hidden = false;
    root.querySelector("#info").textContent = "Bitte kurz durchsehen: Es dürfen keine Namen darin stehen" + (r.ersetzt ? " (" + r.ersetzt + " Namen aus deiner Kürzelliste wurden ersetzt)." : ".");
  });
  root.querySelector("#kopie").addEventListener("click", async () => {
    const t = root.querySelector("textarea"); try { await navigator.clipboard.writeText(t.value); } catch (e) { t.select(); document.execCommand("copy"); }
    root.querySelector("#ok").textContent = "kopiert";
  });
  (document.body || document.documentElement).appendChild(host);
})();
