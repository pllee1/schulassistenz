#!/usr/bin/env python3
"""schulassistenz · material-gestalten · Layout „Klar · Band“ (Standard ab Klasse 5)

Baukasten für Arbeitsblätter, Klassenarbeiten/Klausuren und Bewertungsseiten als HTML,
gedruckt mit Chromium zu A4-PDF. Gewählt von der Lehrkraft am 18.11.2026 (Variante 1c „Band“).

Nutzung (Beispiel: ../beispiele/beispiel_nawi10.py):
    import sys; sys.path.insert(0, "<Skill>/skripte"); import klar as K
    cfg = K.Profil(fach="Naturwissenschaften", jahrgang="Jahrgang 10", thema="Säuren und Laugen",
                   farbe="#0F6E56", hell="#E1F5EE", logo="<Datenordner>/profil/layout/logo.png",
                   lk="Wo", schuljahr="2026/27", code=True, noten={1: 87, 2: 73, 3: 59, 4: 45, 5: 18})
    seiten = [K.ab_seite(cfg, nr=3, frage="…", inhalt=[...]), ...]
    K.speichern(cfg, seiten, "AB3.pdf")      # schreibt AB3.html + AB3.pdf + AB3-1.png … + *_grau.png

Regeln:
- Keine CSS-Verläufe mit Transparenz und keine Hintergrund-Kacheln für Linien/Karo: manche PDF-Betrachter
  zeigen solche Muster als pinke Flächen. Linien sind echte Rahmenlinien, Kästchen echte SVG-Linien.
- Jede Seite ist fest A4 (.page); Inhalt, der nicht passt, wird abgeschnitten. Nach dem Rendern
  prüfen() aufrufen: meldet Seiten, deren Inhalt überläuft.
"""
import base64, html, math, mimetypes, shutil, subprocess, sys, json, tempfile
from dataclasses import dataclass, field
from pathlib import Path

HIER = Path(__file__).resolve().parent
SCHRIFTEN = (HIER.parent.parent / "plakat-gestalten" / "schriften").resolve()


@dataclass
class Profil:
    fach: str = "Fach"
    jahrgang: str = "Jahrgang"
    thema: str = ""
    farbe: str = "#0F6E56"          # Fachfarbe (Akzent) aus layout.fachfarben bzw. Standardpalette
    hell: str = "#E1F5EE"           # Fachfarbe hell
    logo: str | None = None         # Pfad zur Logo-Datei; None = kein Logo
    lk: str = ""                    # Lehrkraft-Kürzel
    schuljahr: str = ""
    code: bool = False              # Schüler-Code statt Name (bewertung.schueler_code)
    code_stellen: int = 5
    noten: dict = field(default_factory=dict)   # Notenschlüssel {Note: ab %}; Sek II {15: 95, …}
    notenpunkte: bool = False       # Sek II: Kopfzeile „NP“ statt „Note“
    muendlich: bool = True          # Kasten „Mündliche Leistung“ auf der Bewertungsseite (Layout-Datei)
    unterschrift2: str = "Unterschrift Erziehungsberechtigte"   # Oberstufe: „Kenntnisnahme“


ICON = {
    "partner": '<svg viewBox="0 0 24 24" class="ico"><circle cx="8" cy="7" r="3.2"/><circle cx="16.5" cy="8" r="2.8"/><path d="M2.5 20c0-3.8 2.5-6.3 5.5-6.3s5.5 2.5 5.5 6.3M12.5 20c.3-3.2 2-5.3 4-5.3 2.6 0 4.4 2.3 4.4 5.3"/></svg>',
    "allein": '<svg viewBox="0 0 24 24" class="ico"><circle cx="12" cy="7" r="3.4"/><path d="M5.5 20.5c0-4 2.9-6.8 6.5-6.8s6.5 2.8 6.5 6.8"/></svg>',
    "gruppe": '<svg viewBox="0 0 24 24" class="ico"><circle cx="6" cy="8" r="2.5"/><circle cx="12" cy="6.5" r="2.8"/><circle cx="18" cy="8" r="2.5"/><path d="M1.5 19c0-3 2-5 4.5-5M22.5 19c0-3-2-5-4.5-5M7 20c0-3.6 2.2-6 5-6s5 2.4 5 6"/></svg>',
    "zeit": '<svg viewBox="0 0 24 24" class="ico"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5.2l3.4 2"/></svg>',
    "brille": '<svg viewBox="0 0 24 24" class="ico"><path d="M3 10h18M4 10l1 5.5a2.5 2.5 0 0 0 2.5 2h2.2a2 2 0 0 0 1.9-1.4l.4-1.3h0l.4 1.3a2 2 0 0 0 1.9 1.4h2.2a2.5 2.5 0 0 0 2.5-2L20 10"/></svg>',
    "hilfe": '<svg viewBox="0 0 24 24" class="ico"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/></svg>',
}


# ---------- Stil (Basis + „Klar“ + Variante „Band“) ----------
CSS = """
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#fff;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;height:297mm;position:relative;overflow:hidden;padding:12mm 16mm 11mm;display:flex;flex-direction:column;page-break-after:always;font-size:10pt;line-height:1.36}
.page:last-child{page-break-after:auto}
main{flex:1;display:flex;flex-direction:column}
main>*{flex-shrink:0}
.fuss{display:flex;justify-content:space-between;font-size:7.8pt;color:var(--grau);margin-top:3mm}
p{margin:0 0 1.4mm}
.op{font-weight:700}
.ico{width:1.15em;height:1.15em;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;vertical-align:-.2em;margin-right:.3em}
.tag{display:inline-flex;align-items:center;font-size:8.3pt;color:var(--grau);margin-left:3mm;white-space:nowrap}
.feld{display:flex;align-items:flex-end;gap:2mm;font-size:8.5pt}
.feld span{color:var(--grau);white-space:nowrap}
.feld i{flex:1;border-bottom:.8pt solid var(--ink);min-width:20mm;height:5mm}
.feld .wert{font-weight:600}
.codeboxes{display:flex;gap:1mm}
.codeboxes b{width:6.5mm;height:7.5mm;border:1pt solid var(--acc);border-radius:1mm;background:#fff}
.code.klein .codeboxes b{width:5.2mm;height:6mm}
.aufgabe{display:grid;grid-template-columns:10mm 1fr;gap:0 3mm;margin-bottom:2.2mm}
.a-rand{display:flex;flex-direction:column;align-items:center;gap:1mm}
.a-kopf{display:flex;align-items:baseline;margin-bottom:1.2mm}
.a-titel{font-weight:700;font-size:11.2pt}
.a-meta{margin-left:auto;display:flex}
.niveau{font-size:7.5pt;color:var(--grau);letter-spacing:.05em}
.versuch{display:grid;grid-template-columns:1fr 50mm;gap:4mm;align-items:start;margin-bottom:2mm}
.schritte{margin:1mm 0 1.5mm 5mm;font-size:9.6pt}
.schritte li{margin-bottom:.6mm;padding-left:1mm}
.klein{font-size:9.3pt}
.sicherheit{display:flex;gap:1.5mm;align-items:flex-start;font-size:9pt;color:var(--rot)}
.sicherheit .ico{flex:none;margin-top:.5mm}
table{border-collapse:collapse;width:100%}
.mess{font-size:9.2pt}
.mess th{font-size:8.2pt;text-align:left;font-weight:700;padding:1.3mm 2mm}
.mess td{height:5.6mm;padding:0 2mm}
.mess td:first-child{width:34mm}
.skala{margin:0 auto 1mm;width:70%}
.satzanfang{font-style:italic;color:var(--grau);font-size:9.2pt}
.hilfe-verweis{display:inline-flex;align-items:center;font-size:8.6pt;color:var(--grau);white-space:nowrap}
.mit-hilfe{display:flex;justify-content:space-between;gap:4mm;align-items:baseline}
.kopf-titel{white-space:nowrap}
.luecke{display:inline-block;width:24mm;border-bottom:.8pt solid var(--ink);height:3.8mm;vertical-align:-.6mm}
.luecke.kurz{width:15mm}
.abschluss{margin-top:auto;padding-top:1mm;display:grid;grid-template-columns:1fr 52mm;gap:4mm;align-items:stretch}
.merk p{font-size:9.4pt;line-height:1.6}
.wortspeicher{font-size:8.8pt!important;line-height:1.4!important;margin-top:1mm}
.joker{font-size:9pt}
/* Klassenarbeit */
.teil{display:grid;grid-template-columns:7mm 1fr 30mm;gap:2mm;align-items:start}
.t-nr{font-weight:700}
.t-pkt{display:grid;grid-template-columns:auto auto;gap:.4mm 1.5mm;justify-content:end;align-items:center;font-size:8.6pt}
.pbox{width:8mm;height:6mm;border:1pt solid var(--ink);display:inline-block}
.afb{grid-column:1/3;text-align:right;font-size:7.6pt;color:var(--grau)}
.material{display:grid;grid-template-columns:1fr 92mm;gap:4mm;margin-bottom:2.5mm;align-items:start}
.quelle{font-size:7.6pt;color:var(--grau)}
.ka-aufgabe{margin-bottom:1mm}
.ka-a{display:flex;align-items:center;gap:2.5mm;margin:1mm 0 2mm}
.hinweis{font-size:8.9pt;margin-bottom:4mm}
.hinweis p{margin-bottom:.8mm}
.folge-kopf{display:flex;align-items:center;gap:4mm;padding-bottom:2.5mm;margin-bottom:5mm}
.folge-kopf .logo{height:9mm}
.fk-titel{font-weight:700;font-size:10pt;flex:1}
.sek{margin-bottom:4mm}
.b-block{margin-bottom:4.5mm}
.b-label{font-weight:700;font-size:9.6pt;margin-bottom:1.5mm}
.ptab,.nsk{font-size:9.6pt;text-align:center}
.ptab th,.nsk th{text-align:left;width:26mm;font-size:8.6pt;padding:1.6mm 2mm}
.ptab td,.nsk td{padding:1.6mm 1mm}
.ptab tr.leer td{height:10mm}
.fein{font-size:7.8pt;color:var(--grau);margin-top:1.2mm}
.ergebnis{display:flex;align-items:center;justify-content:space-between;padding:4mm 5mm;margin-bottom:5mm}
.erg-text{font-size:11pt}
.notenfeld{width:32mm;height:20mm;position:relative;background:#fff}
.notenfeld span{position:absolute;top:1.2mm;left:2mm;font-size:7.6pt;color:var(--grau)}
.notenfeld.klein{width:24mm;height:17mm;flex:none}
.muendlich{display:flex;gap:5mm;align-items:flex-start;padding:3.5mm 4mm;margin-bottom:5mm}
.m-links{flex:1}
.mu-kopf{font-weight:700;font-size:9.6pt;margin-bottom:1.5mm}
.mu-kopf span{font-weight:400;color:var(--grau);font-size:8.6pt}
.ktab{font-size:8.6pt}
.ktab th{font-size:8pt;width:9mm;text-align:center;color:var(--grau);font-weight:600}
.ktab td{padding:.9mm 1mm}
.ktab td i{display:block;width:3.4mm;height:3.4mm;border:.8pt solid var(--ink);margin:auto;background:#fff}
.entw{font-size:8.6pt;margin-top:1.8mm;display:flex;gap:5mm;align-items:center}
.pf{display:inline-flex;align-items:center;gap:1.2mm}
.pf i{width:3.4mm;height:3.4mm;border:.8pt solid var(--ink);display:inline-block}
.kommentar{margin-bottom:6mm}
.unterschriften{display:grid;grid-template-columns:1fr 1fr;gap:12mm;margin-top:auto}
.unterschriften i{display:block;border-bottom:.8pt solid var(--ink);height:10mm}
.unterschriften span{font-size:7.8pt;color:var(--grau)}

body{font-family:'Instrument Sans',sans-serif}
.kopf{display:flex;align-items:center;gap:4mm;padding-bottom:2.5mm;border-bottom:1.4pt solid var(--acc);margin-bottom:4mm}
.kopf .logo{height:12mm}
.kopf-titel{padding-left:4mm;border-left:.8pt solid var(--linie)}
.fach{font-weight:700;color:var(--acc);font-size:10.5pt}
.thema{color:var(--grau);font-size:9pt}
.felder{margin-left:auto;display:grid;grid-template-columns:52mm 30mm;gap:2.4mm 4mm;background:var(--tint);border-radius:2.5mm;padding:2.5mm 4mm 3mm}
.felder .f-name{grid-column:1/3}
.ab-titel{display:flex;align-items:baseline;gap:3mm;font-size:16.5pt;line-height:1.15;margin-bottom:2.2mm}
.ab-nr{font-size:9pt;font-weight:700;color:#fff;background:var(--acc);border-radius:10mm;padding:.8mm 3mm;transform:translateY(-1mm)}
.situation{background:var(--tint);border-radius:2.5mm;padding:2.6mm 4.5mm 1.4mm;margin-bottom:3.2mm;border-left:1.6mm solid var(--acc)}
.sit-kopf{font-size:7.8pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--acc);margin-bottom:.8mm}
.a-nr{width:8mm;height:8mm;border-radius:50%;background:var(--acc);color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;font-size:11pt}
.a-kopf{border-bottom:.6pt solid var(--linie);padding-bottom:1mm}
.mess{border-radius:2mm;overflow:hidden}
.mess th{background:var(--tint);color:var(--acc)}
.mess td,.mess th{border:.6pt solid #c3ccd1}
.merk{background:var(--merk);border-radius:2.5mm;padding:3mm 4.5mm}
.merk-kopf{display:inline-block;font-weight:700;font-size:8pt;letter-spacing:.08em;text-transform:uppercase;color:#fff;background:var(--merkd);border-radius:1.2mm;padding:.4mm 2.2mm;margin-bottom:1.5mm}
.joker{background:var(--joker);border-radius:2.5mm;padding:3mm 4mm}
.joker b:first-child{display:block;margin-bottom:1mm}
/* KA */
.ka-kopf{border:1.2pt solid var(--acc);border-radius:3mm;overflow:hidden;margin-bottom:4mm}
.ka-oben{display:flex;align-items:center;gap:5mm;background:var(--tint);padding:3mm 5mm}
.ka-oben .logo{height:13mm;background:#fff;border-radius:1.5mm;padding:1mm}
.ka-art{font-weight:700;font-size:13.5pt;color:var(--acc)}
.ka-thema{font-size:10pt}
.ka-felder{display:grid;grid-template-columns:auto 1fr 1fr;gap:3mm 6mm;padding:3.5mm 5mm 4mm;align-items:end}
.ka-felder .code{grid-row:1/3;flex-direction:column;align-items:flex-start;gap:1.2mm}
.hinweis{background:var(--joker);border-radius:2.5mm;padding:2.8mm 4mm}
.ka-a{font-size:12pt;color:var(--acc)}
.ka-a .a-nr{width:7mm;height:7mm;font-size:10pt}
.teil{padding-bottom:1mm;border-bottom:.6pt solid var(--linie)}
.t-nr{color:var(--acc)}
.pbox{border-color:var(--acc);border-radius:1.2mm}
.afb{color:var(--acc);font-weight:700}
.karo{border-radius:1.5mm}
.material{background:var(--tint);border-radius:2.5mm;padding:3mm 4mm}
.m-kopf{font-size:7.8pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--acc);margin-bottom:1mm}
.m-bild{background:#fff;border-radius:1.5mm;padding:1mm}
.folge-kopf{border-bottom:1.4pt solid var(--acc)}
.fk-titel{color:var(--acc)}
.sek{font-size:17pt}
.b-label{color:var(--acc)}
.ptab th,.nsk th{background:var(--tint);color:var(--acc)}
.ptab td,.ptab th,.nsk td,.nsk th{border:.6pt solid #c3ccd1}
.ptab .sum{font-weight:700;background:#f4f7f6}
.nsk tr:first-child td{font-weight:700;font-size:11pt;color:var(--acc)}
.ergebnis{border:1.2pt solid var(--acc);border-radius:3mm}
.notenfeld{border:1.2pt solid var(--acc);border-radius:2mm}
.muendlich{background:var(--tint);border-radius:2.5mm}
.ktab td{border-bottom:.5pt solid #c3ccd1}
.page{padding-top:0}
.kopf{margin:0 -16mm 3.5mm;padding:6mm 16mm 3.5mm;background:var(--tint);border-bottom:1.6pt solid var(--acc)}
.felder{background:#fff}
.kopf .logo{background:#fff;border-radius:2mm;padding:1mm}
.ab-nr{border-radius:1.2mm}
.situation{border-left:0;border-radius:0;background:none;border-top:.6pt solid var(--linie);border-bottom:.6pt solid var(--linie);padding:2mm 0 1.2mm}
.a-nr{border-radius:1.8mm}
.a-kopf{background:var(--tint);border-bottom:0;border-radius:1.5mm;padding:.8mm 2.5mm}
.a-meta .tag{color:var(--acc)}
.ka-kopf{margin:0 -16mm 4mm;border:0;border-radius:0;border-bottom:1.6pt solid var(--acc)}
.ka-oben{padding:7mm 16mm 3mm}
.ka-felder{padding:3.5mm 16mm 4mm;background:#fff}
.ka-a{background:var(--tint);border-radius:1.5mm;padding:1mm 2.5mm;color:var(--acc)}
.ka-a .a-nr{border-radius:1.5mm}
.folge-kopf{margin:0 -16mm 5mm;padding:7mm 16mm 3mm;background:var(--tint)}
.folge-kopf .logo{background:#fff;border-radius:1.5mm;padding:.8mm}
"""

ZUSATZ_CSS = """
.linien{display:block}
.linien i{display:block;height:7.5mm;border-bottom:.7pt solid var(--linie)}
.karo{position:relative;overflow:hidden;border:.7pt solid #9aa5ad;margin:1mm 0 3mm;background:#fff}
.karo svg{position:absolute;left:0;top:0}
.platzhalter{border:1pt dashed #9aa5ad;border-radius:2mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:var(--grau);font-size:8.6pt;padding:3mm}
.abb{margin:1mm 0 2mm}
.abb img{display:block;max-width:100%}
.lehrer-hinweis{font-weight:700;font-size:8.5pt;color:var(--acc)}
.page.quer{width:297mm;height:210mm;page:quer}
@page quer{size:A4 landscape;margin:0}
.tafel h1{font-size:22pt;color:var(--acc);margin-bottom:5mm}
.tafel{font-size:16pt;line-height:1.35}
.ohne-logo .kopf-titel{border-left:0;padding-left:0}
.folge-kopf .f-name{min-width:60mm}
.quer .merk p{font-size:16pt;line-height:1.4}
.quer .merk-kopf{font-size:10pt}
"""


def _schriften_css():
    def ff(fam, datei, gewicht="400", stil="normal"):
        return (f"@font-face{{font-family:'{fam}';src:url('{(SCHRIFTEN / datei).as_uri()}');"
                f"font-weight:{gewicht};font-style:{stil}}}")
    return "".join([ff("Instrument Sans", "InstrumentSans-Regular.ttf"),
                    ff("Instrument Sans", "InstrumentSans-Bold.ttf", "700"),
                    ff("Instrument Sans", "InstrumentSans-Italic.ttf", "400", "italic")])


def esc(t):
    return html.escape(str(t), quote=False)


def daten_uri(pfad):
    p = Path(pfad)
    typ = mimetypes.guess_type(p.name)[0] or "image/png"
    return f"data:{typ};base64," + base64.b64encode(p.read_bytes()).decode()


def _logo(cfg, cls="logo"):
    return f'<img class="{cls}" src="{daten_uri(cfg.logo)}">' if cfg.logo else ""


# ---------- kleine Bausteine ----------
def tag(icon, text):
    """Sozialform/Zeit-Marke rechts im Aufgabenkopf: tag("partner", "Partnerarbeit"), tag("zeit", "15 Min.")."""
    return f'<span class="tag">{ICON.get(icon, "")}{text}</span>'


def feld(label, wert=None, cls=""):
    inner = f'<b class="wert">{wert}</b>' if wert else "<i></i>"
    return f'<div class="feld {cls}"><span>{label}</span>{inner}</div>'


def codefeld(cfg, klein=False):
    return (f'<div class="feld code{" klein" if klein else ""}"><span>Code</span><div class="codeboxes">'
            + "<b></b>" * cfg.code_stellen + "</div></div>")


def op(wort):
    """Operator fett: op("Erkläre")."""
    return f'<b class="op">{wort}</b>'


def linien(n=2):
    """n Schreiblinien (7,5 mm) als echte Linien."""
    return '<div class="linien">' + "<i></i>" * n + "</div>"


def karo(hoehe_mm, raster=5.0):
    """Kästchenfeld volle Breite; hoehe_mm wird auf ganze Kästchen gerundet."""
    h = max(1, round(hoehe_mm / raster)) * raster
    breite = 300
    zeilen = [f'<line x1="{x*raster}" y1="0" x2="{x*raster}" y2="{h}"/>' for x in range(1, int(breite / raster))]
    zeilen += [f'<line x1="0" y1="{y*raster}" x2="{breite}" y2="{y*raster}"/>' for y in range(1, int(h / raster))]
    svg = (f'<svg width="{breite}mm" height="{h}mm" viewBox="0 0 {breite} {h}" stroke="#cfd6db" '
           f'stroke-width=".18">{"".join(zeilen)}</svg>')
    return f'<div class="karo" style="height:{h}mm">{svg}</div>'


def satzanfang(text):
    return f'<p class="satzanfang">{text}</p>'


def hilfe(text):
    """Hilfekarten-Verweis, z. B. hilfe("Hilfekarte 3a")."""
    return f'<span class="hilfe-verweis">{ICON["hilfe"]}{text}</span>'


def auftrag_mit_hilfe(auftrag_html, hilfe_text):
    return f'<p class="mit-hilfe"><span>{auftrag_html}</span>{hilfe(hilfe_text)}</p>'


def sicherheit(text):
    return f'<p class="sicherheit">{ICON["brille"]}<span><b>Sicherheit:</b> {text}</span></p>'


def schritte(liste):
    return '<ol class="schritte">' + "".join(f"<li>{s}</li>" for s in liste) + "</ol>"


def tabelle(kopf, zeilen, leer=0, erste_breite_mm=34):
    """Tabelle zum Ausfüllen: kopf = Spaltennamen, zeilen = Listen (leere Zellen ""), leer = zusätzliche Leerzeilen."""
    t = '<table class="mess"><thead><tr>' + "".join(
        f'<th style="width:{erste_breite_mm}mm">{k}</th>' if i == 0 else f"<th>{k}</th>" for i, k in enumerate(kopf))
    t += "</tr></thead><tbody>"
    for z in list(zeilen) + [[""] * len(kopf)] * leer:
        t += "<tr>" + "".join(f"<td>{c}</td>" for c in z) + "</tr>"
    return t + "</tbody></table>"


def bild(pfad_oder_svg, breite="100%", quelle=None, cls="abb"):
    """Abbildung: SVG-Text, PNG/JPG/SVG-Pfad; quelle = Quellenzeile (Pflicht bei fremden Bildern)."""
    if str(pfad_oder_svg).lstrip().startswith("<svg"):
        inhalt = pfad_oder_svg
    else:
        inhalt = f'<img src="{daten_uri(pfad_oder_svg)}" style="width:100%">'
    q = f'<p class="quelle">{quelle}</p>' if quelle else ""
    return f'<div class="{cls}" style="width:{breite}">{inhalt}{q}</div>'


def platzhalter(was, suchbegriff, hoehe_mm=40, breite="100%"):
    return (f'<div class="platzhalter" style="height:{hoehe_mm}mm;width:{breite}"><b>Abbildung einfügen: {was}</b>'
            f'<span>Suchbegriff: {suchbegriff} (z. B. Wikimedia Commons)</span></div>')


def versuch(text_html, skizze_html):
    """Versuchsblock: links Material/Durchführung/Sicherheit, rechts Versuchsskizze (50 mm)."""
    return f'<div class="versuch"><div class="v-text">{text_html}</div><div class="v-bild">{skizze_html}</div></div>'


# ---------- Arbeitsblatt ----------
def kopf_ab(cfg, rechts="felder"):
    """Kopfband. rechts = "felder" (Name/Datum/Klasse), "lehrer" (Lehrerblatt) oder "tafel"."""
    if rechts == "lehrer":
        r = '<div class="felder lehrer-hinweis">Lehrerblatt – nicht für SuS</div>'
    elif rechts == "tafel":
        r = '<div class="felder lehrer-hinweis">Tafelbild</div>'
    else:
        r = f'<div class="felder">{feld("Name", cls="f-name")}{feld("Datum")}{feld("Klasse")}</div>'
    return (f'<header class="kopf{"" if cfg.logo else " ohne-logo"}">{_logo(cfg)}'
            f'<div class="kopf-titel"><div class="fach">{esc(cfg.fach)} · {esc(cfg.jahrgang)}</div>'
            f'<div class="thema">{esc(cfg.thema)}</div></div>{r}</header>')


def ab_titel(nr, frage):
    nr_html = f'<span class="ab-nr">AB {nr}</span>' if nr not in (None, "") else ""
    return f'<h1 class="ab-titel">{nr_html}<span class="ab-frage">{frage}</span></h1>'


def situation(text, kopf="Worum es geht"):
    return f'<div class="situation"><div class="sit-kopf">{kopf}</div><p>{text}</p></div>'


def aufgabe(nr, titel, inhalt, meta="", niveau=""):
    """Aufgabe mit Nummernkästchen. meta = tag(...)+tag(...); niveau = "★" / "★★" / "★★★"."""
    n = f'<span class="niveau">{niveau}</span>' if niveau else ""
    return (f'<div class="aufgabe"><div class="a-rand"><span class="a-nr">{nr}</span>{n}</div>'
            f'<div class="a-inhalt"><div class="a-kopf"><span class="a-titel">{titel}</span>'
            f'<span class="a-meta">{meta}</span></div>{inhalt}</div></div>')


def merk(text, wortspeicher=None, kopf="Merke"):
    ws = f'<p class="wortspeicher"><b>Wortspeicher:</b> {wortspeicher}</p>' if wortspeicher else ""
    return f'<div class="merk"><div class="merk-kopf">{kopf}</div><p>{text}</p>{ws}</div>'


def luecke(kurz=False):
    return f'<span class="luecke{" kurz" if kurz else ""}"></span>'


def joker(text, kopf="Joker ★★★"):
    return f'<div class="joker"><b>{kopf}</b> {text}</div>'


def abschluss(merk_html, joker_html=""):
    """Merkkasten (+ Joker) am Seitenende."""
    if not joker_html:
        return f'<div class="abschluss" style="grid-template-columns:1fr">{merk_html}</div>'
    return f'<div class="abschluss">{merk_html}{joker_html}</div>'


def seite(kopf, inhalt, fuss_links="", fuss_rechts="", quer=False, cls=""):
    if isinstance(inhalt, (list, tuple)):
        inhalt = "".join(inhalt)
    return (f'<section class="page{" quer" if quer else ""} {cls}">{kopf}<main>{inhalt}</main>'
            f'<footer class="fuss"><span>{fuss_links}</span><span>{fuss_rechts}</span></footer></section>')


def ab_seite(cfg, inhalt, seite_nr=1):
    fl = " · ".join(x for x in [cfg.lk, cfg.fach, cfg.thema] if x)
    return seite(kopf_ab(cfg), inhalt, esc(fl), f"Seite {seite_nr}", cls="ab")


# ---------- Klassenarbeit / Klausur ----------
def ka_kopf(cfg, art, titel, kurs, zeit, hilfsmittel):
    """Kopf Seite 1: art z. B. "Klassenarbeit Nr. 2 · Naturwissenschaften"; Code-Kästchen oder Name je nach cfg.code."""
    erste = codefeld(cfg) if cfg.code else feld("Name", cls="f-name")
    return (f'<header class="ka-kopf"><div class="ka-oben">{_logo(cfg)}<div class="ka-titel">'
            f'<div class="ka-art">{art}</div><div class="ka-thema">{titel}</div></div></div>'
            f'<div class="ka-felder">{erste}{feld("Datum")}{feld("Kurs", kurs)}'
            f'{feld("Bearbeitungszeit", zeit)}{feld("Hilfsmittel", hilfsmittel)}</div></header>')


def hinweis(cfg, text):
    erste = "<p><b>Trage oben nur deinen Code ein, nicht deinen Namen.</b></p>" if cfg.code else ""
    return f'<div class="hinweis">{erste}<p>{text}</p></div>'


def teil(bst, text, be, afb, karo_mm=0):
    """Teilaufgabe mit Punktekasten und AFB; darunter Kästchenfeld (karo_mm=0: keins)."""
    k = karo(karo_mm) if karo_mm else ""
    return (f'<div class="teil-block"><div class="teil"><div class="t-nr">{bst}</div><div class="t-text">{text}</div>'
            f'<div class="t-pkt"><span class="pbox"></span><span class="pmax">/ {be} BE</span>'
            f'<span class="afb">AFB {afb}</span></div></div>{k}</div>')


def material(text, bild_html="", kopf="Material"):
    if not bild_html:
        return f'<div class="material" style="grid-template-columns:1fr"><div class="m-text"><div class="m-kopf">{kopf}</div>{text}</div></div>'
    return (f'<div class="material"><div class="m-text"><div class="m-kopf">{kopf}</div>{text}</div>'
            f'<div class="m-bild">{bild_html}</div></div>')


def ka_aufgabe(nr, titel, inhalt):
    if isinstance(inhalt, (list, tuple)):
        inhalt = "".join(inhalt)
    return f'<div class="ka-aufgabe"><h2 class="ka-a"><span class="a-nr">{nr}</span>{titel}</h2>{inhalt}</div>'


def folge_kopf(cfg, titel):
    rechts = codefeld(cfg, klein=True) if cfg.code else feld("Name", cls="f-name")
    return f'<header class="folge-kopf">{_logo(cfg)}<div class="fk-titel">{titel}</div>{rechts}</header>'


def ka_fuss(cfg):
    return esc(" · ".join(x for x in [cfg.lk, f"Schuljahr {cfg.schuljahr}" if cfg.schuljahr else ""] if x))


def grenzen(cfg, gesamt):
    """Notenschlüssel → [(Note, ab BE, ab %)], BE aufgerundet (Profil: rundung)."""
    return [(n, math.ceil(gesamt * p / 100), p) for n, p in sorted(cfg.noten.items(), key=lambda x: -x[1])] + \
           ([(0, 0, 0)] if cfg.notenpunkte else [(max(cfg.noten) + 1, 0, 0)] if cfg.noten else [])


def bewertung(cfg, teile, titel_kopf, hinweis_rundung="Grenzen aufgerundet; bei Grenzwerten zugunsten der Schülerin oder des Schülers."):
    """Bewertungsseite. teile = [("1a", 4), ("1b", 2), …]."""
    gesamt = sum(p for _, p in teile)
    pt = '<table class="ptab"><tr><th>Aufgabe</th>' + "".join(f"<td>{t}</td>" for t, _ in teile) + '<td class="sum">Summe</td></tr>'
    pt += '<tr><th>erreichbar</th>' + "".join(f"<td>{p}</td>" for _, p in teile) + f'<td class="sum">{gesamt}</td></tr>'
    pt += '<tr class="leer"><th>erreicht</th>' + "<td></td>" * len(teile) + '<td class="sum"></td></tr></table>'
    if cfg.noten:
        g = grenzen(cfg, gesamt)
        kopfz = "NP" if cfg.notenpunkte else "Note"
        ns = f'<table class="nsk"><tr><th>{kopfz}</th>' + "".join(f"<td>{n}</td>" for n, _, _ in g) + "</tr>"
        ns += "<tr><th>ab BE</th>" + "".join(f"<td>{b}</td>" for _, b, _ in g) + "</tr>"
        ns += "<tr><th>ab %</th>" + "".join(f"<td>{p}</td>" for _, _, p in g) + "</tr></table>"
        ns_block = (f'<div class="b-block"><div class="b-label">Notenschlüssel</div>{ns}'
                    f'<p class="fein">BE = Bewertungseinheiten. {hinweis_rundung}</p></div>')
    else:
        ns_block = ""   # nie einen Schlüssel erfinden: vorher im Profil nachsehen bzw. nachfragen
    mu = ""
    if cfg.muendlich:
        krit = ["Beteiligung", "Fachsprache", "Zuverlässigkeit in Gruppen- und Experimentierphasen", "Eigene Ideen", "Aufgaben vollständig"]
        km = '<table class="ktab"><tr><th></th><th>++</th><th>+</th><th>o</th><th>–</th></tr>' + "".join(
            f'<tr><td>{k}</td>' + "<td><i></i></td>" * 4 + "</tr>" for k in krit) + "</table>"
        mu = (f'<div class="muendlich"><div class="m-links"><div class="mu-kopf">Mündliche Leistung '
              f'<span>(Stand: {luecke(True)})</span></div>{km}<div class="entw">Entwicklung '
              '<span class="pf"><i></i> ↗</span><span class="pf"><i></i> →</span><span class="pf"><i></i> ↘</span></div></div>'
              '<div class="notenfeld klein"><span>Note</span></div></div>')
    inhalt = (f'<h2 class="sek">Bewertung</h2><div class="b-block"><div class="b-label">Punkte</div>{pt}</div>{ns_block}'
              f'<div class="ergebnis"><div class="erg-text">Ergebnis: {luecke(True)} / {gesamt} BE = {luecke(True)} %</div>'
              f'<div class="notenfeld"><span>{"Notenpunkte" if cfg.notenpunkte else "Note"}</span></div></div>{mu}'
              f'<div class="kommentar"><div class="b-label">Kommentar</div>{linien(4)}</div>'
              f'<div class="unterschriften"><div><i></i><span>Datum, Unterschrift Lehrkraft ({esc(cfg.lk)})</span></div>'
              f'<div><i></i><span>{cfg.unterschrift2}</span></div></div>')
    return inhalt


# ---------- Dokument und Druck ----------
def dokument(cfg, seiten, titel="Material"):
    farben = (f":root{{--acc:{cfg.farbe};--tint:{cfg.hell};--ink:#1d2a33;--grau:#5b6770;--linie:#b9c2c8;"
              "--merk:#FAEEDA;--merkd:#b8742a;--joker:#F1EFE8;--rot:#A32D2D}")
    return (f"<!doctype html><html lang=de><head><meta charset=utf-8><title>{esc(titel)}</title><style>"
            f"{_schriften_css()}{farben}{CSS}{ZUSATZ_CSS}</style></head><body>{''.join(seiten)}</body></html>")


_JS = """
const {chromium}=require('playwright');(async()=>{const a=JSON.parse(process.argv[2]);
const b=await chromium.launch();const p=await b.newPage();await p.goto(a.url);
await p.evaluate(()=>document.fonts.ready);
const ueber=await p.evaluate(()=>[...document.querySelectorAll('.page')].map((s,i)=>{const m=s.querySelector('main');
 return (m.scrollHeight>m.clientHeight+2||s.scrollHeight>s.clientHeight+2)?i+1:0}).filter(x=>x));
await p.pdf({path:a.pdf,printBackground:true,preferCSSPageSize:true});await b.close();
console.log(JSON.stringify(ueber));})().catch(e=>{console.error(e.message);process.exit(1)});"""


def speichern(cfg, seiten, ziel_pdf, titel=None, png=True):
    """Schreibt HTML + PDF (+ PNG je Seite und Graustufen-Probe). Gibt Liste überlaufender Seiten zurück."""
    ziel = Path(ziel_pdf).resolve()
    html_pfad = ziel.with_suffix(".html")
    html_pfad.write_text(dokument(cfg, seiten, titel or ziel.stem), encoding="utf-8")
    ueber = None
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            b = p.chromium.launch(); pg = b.new_page(); pg.goto(html_pfad.as_uri())
            pg.evaluate("document.fonts.ready")
            ueber = pg.evaluate("""[...document.querySelectorAll('.page')].map((s,i)=>{const m=s.querySelector('main');
              return (m.scrollHeight>m.clientHeight+2||s.scrollHeight>s.clientHeight+2)?i+1:0}).filter(x=>x)""")
            pg.pdf(path=str(ziel), print_background=True, prefer_css_page_size=True); b.close()
    except ImportError:
        js = Path(tempfile.mkdtemp()) / "k.js"; js.write_text(_JS)
        r = subprocess.run(["node", str(js), json.dumps({"url": html_pfad.as_uri(), "pdf": str(ziel)})],
                           capture_output=True, text=True)
        if r.returncode:
            sys.exit("PDF fehlgeschlagen (Playwright/Chromium nötig): " + r.stderr[-400:])
        ueber = json.loads(r.stdout.strip().splitlines()[-1])
    if png and shutil.which("pdftoppm"):
        subprocess.run(["pdftoppm", "-r", "110", "-png", str(ziel), str(ziel.with_suffix(""))], capture_output=True)
        try:
            from PIL import Image
            for f in sorted(ziel.parent.glob(ziel.stem + "-*.png")):
                if not f.stem.endswith("_grau"):
                    Image.open(f).convert("L").save(f.with_name(f.stem + "_grau.png"))
        except ImportError:
            pass
    if ueber:
        print("ACHTUNG: Inhalt läuft über auf Seite(n)", ueber, "– kürzen, Kästchenfelder verkleinern oder auf zwei Seiten verteilen.")
    print("gespeichert:", ziel)
    return ueber or []
