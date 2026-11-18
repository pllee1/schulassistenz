#!/usr/bin/env python3
"""Beispiel für das Layout „Klar · Band“: NaWi Jg. 10, Säuren und Laugen.
Erzeugt Arbeitsblatt + Klassenarbeit (Seite 1 und Bewertungsseite) als PDF.
Aufruf: python3 beispiel_nawi10.py [Zielordner] [Logo-Datei]
Die Abbildungen unten sind Muster für den Illustrationsstil (pH-Skala) und flache Versuchsskizzen.
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "skripte"))
import klar as K

INK = "#1d2a33"


def ph_skala(acc, font, w=640, h=104, marker=True):
    # Universalindikator-Farben 0..14
    cols = ["#c8323a", "#d9443a", "#e2603a", "#ea8236", "#f0a833", "#e8c43a", "#c9cc3e",
            "#8fbf4a", "#4ea65a", "#2f9182", "#2f7aa6", "#3a5fa8", "#4a4aa0", "#5a3c94", "#5e2f80"]
    x0, x1 = 30, w - 30
    seg = (x1 - x0) / 15
    stops = "".join(f'<stop offset="{i/14:.3f}" stop-color="{c}"/>' for i, c in enumerate(cols))
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="100%" style="font-family:{font}">',
         '<defs>',
         f'<linearGradient id="phg" x1="0" x2="1">{stops}</linearGradient>',
         '<linearGradient id="phshade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>',
         '<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .10 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>',
         '</defs>']
    y, bh = 44, 30
    s.append(f'<rect x="{x0}" y="{y}" width="{x1-x0}" height="{bh}" rx="6" fill="url(#phg)"/>')
    s.append(f'<rect x="{x0}" y="{y}" width="{x1-x0}" height="{bh}" rx="6" fill="url(#phshade)"/>')
    s.append(f'<rect x="{x0}" y="{y}" width="{x1-x0}" height="{bh}" rx="6" fill="#fff" filter="url(#grain)"/>')
    s.append(f'<rect x="{x0}" y="{y}" width="{x1-x0}" height="{bh}" rx="6" fill="none" stroke="{INK}" stroke-width="1.2"/>')
    for i in range(15):
        cx = x0 + seg * (i + .5)
        if i:
            xx = x0 + seg * i
            s.append(f'<line x1="{xx}" y1="{y+bh-7}" x2="{xx}" y2="{y+bh}" stroke="{INK}" stroke-width="1"/>')
        s.append(f'<text x="{cx}" y="{y+bh+17}" font-size="14" font-weight="600" text-anchor="middle" fill="{INK}">{i}</text>')
    # Bereiche oben
    def klammer(a, b, txt, anchor_mid=True):
        xa, xb = x0 + seg * a + 4, x0 + seg * b - 4
        s.append(f'<path d="M{xa},{y-6} v-6 H{xb} v6" fill="none" stroke="{INK}" stroke-width="1.2"/>')
        s.append(f'<text x="{(xa+xb)/2}" y="{y-18}" font-size="14" font-weight="600" text-anchor="middle" fill="{INK}">{txt}</text>')
    klammer(0, 7, "← immer stärker sauer")
    klammer(8, 15, "immer stärker alkalisch →")
    nx = x0 + seg * 7.5
    s.append(f'<circle cx="{nx}" cy="{y-12}" r="3" fill="{acc}"/><text x="{nx}" y="{y-20}" font-size="13" text-anchor="middle" fill="{acc}" font-weight="700">neutral</text>')
    if marker:
        # Beispiel-Pfeil zum Eintragen (leer)
        for i, px in enumerate([2.5, 6.5, 11.5]):
            pass
    s.append('</svg>')
    return "".join(s)


def versuch(acc, font, w=325, h=222):
    """Flache Versuchsskizze: Reagenzglasständer mit drei Gläsern + Pipettenflasche."""
    L = '#1d2a33'
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="100%" style="font-family:{font}">']
    # Ständer
    s.append(f'<rect x="18" y="120" width="150" height="10" rx="2" fill="#fff" stroke="{L}" stroke-width="1.4"/>')
    s.append(f'<rect x="18" y="186" width="150" height="10" rx="2" fill="#fff" stroke="{L}" stroke-width="1.4"/>')
    s.append(f'<line x1="24" y1="130" x2="24" y2="186" stroke="{L}" stroke-width="1.4"/><line x1="162" y1="130" x2="162" y2="186" stroke="{L}" stroke-width="1.4"/>')
    fills = ["#e8a0a0", "#cfe3a6", "#a9b8e3"]
    for i, cx in enumerate([52, 93, 134]):
        # Glas
        s.append(f'<path d="M{cx-11},70 V176 a11,11 0 0 0 22,0 V70" fill="#fff" stroke="{L}" stroke-width="1.4"/>')
        s.append(f'<path d="M{cx-11},140 V176 a11,11 0 0 0 22,0 V140 Z" fill="{fills[i]}" fill-opacity=".85"/>')
        s.append(f'<line x1="{cx-11}" y1="140" x2="{cx+11}" y2="140" stroke="{L}" stroke-width="1"/>')
        s.append(f'<path d="M{cx-11},70 V176 a11,11 0 0 0 22,0 V70" fill="none" stroke="{L}" stroke-width="1.4"/>')
        s.append(f'<line x1="{cx-14}" y1="70" x2="{cx+14}" y2="70" stroke="{L}" stroke-width="1.4"/>')
        s.append(f'<text x="{cx}" y="212" font-size="13" text-anchor="middle" fill="{L}" font-weight="700">{i+1}</text>')
    # Pipette über Glas 1
    s.append(f'<path d="M48,20 h8 v28 l-2,14 h-4 l-2,-14 Z" fill="#fff" stroke="{L}" stroke-width="1.3"/>')
    s.append(f'<ellipse cx="52" cy="16" rx="7" ry="8" fill="{acc}" fill-opacity=".25" stroke="{L}" stroke-width="1.3"/>')
    s.append(f'<circle cx="52" cy="70" r="2.4" fill="{acc}"/>')
    # Hinweislinien
    def label(px, py, ty, t, sub):
        s.append(f'<circle cx="{px}" cy="{py}" r="2.5" fill="{L}"/>')
        s.append(f'<path d="M{px},{py} L190,{ty} H198" fill="none" stroke="{L}" stroke-width="1" stroke-dasharray="3 2"/>')
        s.append(f'<text x="202" y="{ty+1}" font-size="12.5" font-weight="700" fill="{L}">{t}</text>')
        s.append(f'<text x="202" y="{ty+16}" font-size="11.5" fill="#4b5862">{sub}</text>')
    label(58, 30, 26, "Pipette", "Universalindikator")
    label(145, 150, 100, "Reagenzglas", "je 2 mL Probe")
    label(150, 191, 170, "Ständer", "Gläser nummerieren")
    s.append('</svg>')
    return "".join(s)


def titration(acc, font, w=420, h=250):
    """Messkurve: pH gegen Volumen Natronlauge."""
    import math
    L = '#1d2a33'
    ox, oy, pw, ph = 52, 18, 340, 190
    def X(v): return ox + v / 40 * pw
    def Y(p): return oy + ph - p / 14 * ph
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="100%" style="font-family:{font}">']
    for v in range(0, 41, 5):
        s.append(f'<line x1="{X(v)}" y1="{oy}" x2="{X(v)}" y2="{oy+ph}" stroke="#c9d1d6" stroke-width="{1 if v%10==0 else .6}"/>')
        if v % 10 == 0:
            s.append(f'<text x="{X(v)}" y="{oy+ph+16}" font-size="12" text-anchor="middle" fill="{L}">{v}</text>')
    for p in range(0, 15, 1):
        s.append(f'<line x1="{ox}" y1="{Y(p)}" x2="{ox+pw}" y2="{Y(p)}" stroke="#c9d1d6" stroke-width="{1 if p%2==0 else .5}"/>')
        if p % 2 == 0:
            s.append(f'<text x="{ox-8}" y="{Y(p)+4}" font-size="12" text-anchor="end" fill="{L}">{p}</text>')
    s.append(f'<line x1="{ox}" y1="{oy+ph}" x2="{ox+pw}" y2="{oy+ph}" stroke="{L}" stroke-width="1.4"/>')
    s.append(f'<line x1="{ox}" y1="{oy}" x2="{ox}" y2="{oy+ph}" stroke="{L}" stroke-width="1.4"/>')
    # Kurve: starke Säure / starke Base, 20 mL c=0.1
    pts = []
    for i in range(0, 401):
        v = i / 10
        na, nb = 20 * 0.1, v * 0.1
        tot = (20 + v) / 1000
        if abs(na - nb) < 1e-9:
            p = 7
        elif na > nb:
            p = -math.log10((na - nb) / 1000 / tot)
        else:
            p = 14 + math.log10((nb - na) / 1000 / tot)
        p = max(0.8, min(13.2, p))
        pts.append(f"{X(v):.1f},{Y(p):.1f}")
    s.append(f'<polyline points="{" ".join(pts)}" fill="none" stroke="{acc}" stroke-width="3" stroke-linejoin="round"/>')
    # Messpunkte
    for v in [0, 5, 10, 15, 18, 19, 19.5, 20.5, 21, 22, 25, 30, 35, 40]:
        na, nb = 2.0, v * 0.1
        tot = (20 + v) / 1000
        p = -math.log10((na - nb) / 1000 / tot) if na > nb else 14 + math.log10((nb - na) / 1000 / tot)
        s.append(f'<circle cx="{X(v):.1f}" cy="{Y(p):.1f}" r="3.2" fill="#fff" stroke="{L}" stroke-width="1.3"/>')
    s.append(f'<text x="{ox+pw/2}" y="{h-4}" font-size="12.5" text-anchor="middle" fill="{L}">V (Natronlauge) in mL</text>')
    s.append(f'<text x="14" y="{oy+ph/2}" font-size="12.5" text-anchor="middle" fill="{L}" transform="rotate(-90 14 {oy+ph/2})">pH-Wert</text>')
    s.append('</svg>')
    return "".join(s)



def main():
    ziel = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve(); ziel.mkdir(parents=True, exist_ok=True)
    logo = sys.argv[2] if len(sys.argv) > 2 else None
    font = "'Instrument Sans',sans-serif"; acc = "#0F6E56"
    cfg = K.Profil(fach="Naturwissenschaften", jahrgang="Jahrgang 10", thema="Säuren und Laugen", farbe=acc,
                   hell="#E1F5EE", logo=logo, lk="Wo", schuljahr="2026/27", code=True,
                   noten={1: 87, 2: 73, 3: 59, 4: 45, 5: 18})
    stoffe = ["Zitronensaft", "Essigreiniger", "Cola", "Leitungswasser", "Kernseifenlösung", "Natronlösung"]
    ab = K.ab_seite(cfg, [
        K.ab_titel(3, "Wie sauer ist unser Alltag?"),
        K.situation("Zitronensaft, Essigreiniger, Seife, Natron: Manche Haushaltsstoffe lösen Kalk, andere fühlen sich seifig an. "
                    "Mit Universalindikator findet ihr heraus, wie sauer oder alkalisch sie wirklich sind."),
        K.aufgabe(1, "Vermutung", f'<p>{K.op("Ordne")} die sechs Stoffe ein, bevor du misst: sauer, neutral oder alkalisch? '
                  "Trage deine Vermutung in die Tabelle ein.</p>", K.tag("allein", "allein") + K.tag("zeit", "3 Min."), "★"),
        K.aufgabe(2, "Versuch", K.versuch(
            '<p class="klein"><b>Material:</b> Reagenzglasständer, 6 Reagenzgläser, Pipette, Universalindikator, Farbskala, die sechs Proben</p>'
            + K.schritte(["Gläser nummerieren und je 2 mL Probe einfüllen.", "Zwei Tropfen Universalindikator dazugeben, leicht schwenken.",
                          "Farbe mit der Farbskala vergleichen, pH-Wert notieren."])
            + K.sicherheit("Schutzbrille tragen. Proben nicht probieren."), versuch(acc, font))
            + K.tabelle(["Stoff", "Vermutung", "Farbe", "pH-Wert", "sauer · neutral · alkalisch"], [[s, "", "", "", ""] for s in stoffe]),
            K.tag("partner", "Partnerarbeit") + K.tag("zeit", "15 Min."), "★"),
        K.aufgabe(3, "Auswertung", f'<p>{K.op("Trage")} die sechs Stoffe als Pfeil mit Namen an der pH-Skala ein.</p>'
                  + f'<div class="skala">{ph_skala(acc, font)}</div>'
                  + K.auftrag_mit_hilfe(f'{K.op("Vergleiche")} deine Vermutung mit dem Messergebnis und {K.op("erkläre")} eine Abweichung.', "Hilfekarte 3a")
                  + K.satzanfang("Ich hatte vermutet, dass … Gemessen habe ich …, weil …") + K.linien(2),
                  K.tag("partner", "Partnerarbeit") + K.tag("zeit", "8 Min."), "★★"),
        K.abschluss(K.merk(f"Saure Lösungen haben einen pH-Wert {K.luecke()} 7, alkalische Lösungen (Laugen) einen pH-Wert {K.luecke()} 7. "
                           f"Reines Wasser ist {K.luecke()} (pH 7). Je {K.luecke()} der pH-Wert, desto saurer ist die Lösung.",
                           "größer als · kleiner · neutral · kleiner als"),
                    K.joker(f'Natronlösung löst keinen Kalk. {K.op("Begründe")}, warum Natron trotzdem gegen Sodbrennen hilft.')),
    ])
    K.speichern(cfg, [ab], ziel / "Beispiel_AB.pdf")

    ka1 = K.seite(K.ka_kopf(cfg, "Klassenarbeit Nr. 2 · Naturwissenschaften", "Säuren, Laugen und Neutralisation",
                            "10 NaWi E · Wo", "90 Minuten", "Taschenrechner, PSE"), [
        K.hinweis(cfg, "Schreibe in die Kästchenfelder. Reicht der Platz nicht, nutze die Rückseite und notiere die Aufgabe. "
                       "Achte auf Fachsprache und vollständige Sätze. Erreichbar sind 30 BE."),
        K.ka_aufgabe(1, "Eigenschaften von Säuren und Laugen", [
            K.teil("a", f'{K.op("Nenne")} je zwei Eigenschaften saurer und alkalischer Lösungen.', 4, "I", 20),
            K.teil("b", f'{K.op("Gib")} die Teilchen {K.op("an")}, die für die saure bzw. die alkalische Wirkung verantwortlich sind.', 2, "I", 10)]),
        K.ka_aufgabe(2, "Neutralisation", [
            K.material("<p>Zu 20 mL Salzsäure wird schrittweise Natronlauge getropft. Nach jeder Zugabe wird der pH-Wert gemessen.</p>"
                       '<p class="quelle">Abb. 1: Messkurve der Neutralisation</p>', titration(acc, font)),
            K.teil("a", f'{K.op("Beschreibe")} den Verlauf der Messkurve in Abb. 1.', 4, "II", 20)]),
    ], K.ka_fuss(cfg), "Seite 1 von 4", cls="ka")
    bew = K.seite(K.folge_kopf(cfg, "Klassenarbeit Nr. 2 · Naturwissenschaften · Jahrgang 10"),
                  K.bewertung(cfg, [("1a", 4), ("1b", 2), ("2a", 4), ("2b", 5), ("2c", 5), ("3a", 4), ("3b", 6)], ""),
                  K.ka_fuss(cfg), "Seite 4 von 4", cls="ka bew")
    K.speichern(cfg, [ka1, bew], ziel / "Beispiel_KA.pdf")


if __name__ == "__main__":
    main()
