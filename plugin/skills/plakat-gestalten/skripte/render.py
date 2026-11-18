#!/usr/bin/env python3
"""schulassistenz · plakat-gestalten · SVG/HTML rendern

Rendert eine SVG- oder HTML-Datei zu PNG (Kontrolle, Einbau in PDFs) und auf Wunsch zu PDF (Druck).
Installiert vorher die Schriften aus ../schriften für fontconfig, damit sie in der SVG per
font-family ("Instrument Sans", "Work Sans", "Lora", "Outfit") gefunden werden.

Aufruf:
  python3 render.py grafik.svg                      -> grafik.png (2-fach) + grafik_grau.png
  python3 render.py grafik.svg --pdf                -> zusätzlich grafik.pdf
  python3 render.py plakat.svg --dpi 300 --pdf      -> Druckauflösung
HTML-Seiten geben ihr Druckformat mit CSS an, z. B. @page{size:297mm 420mm;margin:0} für A3.
Optionen: --scale N (Pixelfaktor, Standard 2), --dpi N (statt scale; nutzt width/height in mm/px der SVG),
          --kein-grau (keine Graustufen-Probe)

Reihenfolge der Renderer: Chromium über Playwright (Python oder Node) > rsvg-convert > cairosvg.
cairosvg kennt keine Filter (Körnung, weicher Rauch fallen weg) – dann meldet das Skript das.
"""
import argparse, os, re, shutil, subprocess, sys, tempfile, json
from pathlib import Path

HIER = Path(__file__).resolve().parent
SCHRIFTEN = HIER.parent / "schriften"


def schriften_installieren():
    ziel = Path.home() / ".local/share/fonts/schulassistenz"
    try:
        ziel.mkdir(parents=True, exist_ok=True)
        neu = False
        for f in SCHRIFTEN.glob("*.ttf"):
            if not (ziel / f.name).exists():
                shutil.copy2(f, ziel / f.name); neu = True
        if neu and shutil.which("fc-cache"):
            subprocess.run(["fc-cache", "-f", str(ziel)], capture_output=True)
    except Exception as e:  # nur Hinweis, Rendern geht trotzdem
        print("Hinweis: Schriften nicht installiert:", e)


def masse(svg_text):
    """Breite/Höhe der SVG in px (mm -> px bei 96 dpi)."""
    def wert(name):
        m = re.search(r'<svg[^>]*\s%s="([\d.]+)(mm|px)?"' % name, svg_text)
        if not m:
            return None
        v = float(m.group(1))
        return v * 96 / 25.4 if m.group(2) == "mm" else v
    w, h = wert("width"), wert("height")
    if w is None or h is None:
        m = re.search(r'viewBox="[\d.\-]+ [\d.\-]+ ([\d.]+) ([\d.]+)"', svg_text)
        if m:
            w, h = float(m.group(1)), float(m.group(2))
    return w or 800, h or 600


def html_huelle(src: Path):
    if src.suffix.lower() in (".html", ".htm"):
        return src
    svg = src.read_text(encoding="utf-8")
    w, h = masse(svg)
    tmp = Path(tempfile.mkdtemp()) / "huelle.html"
    tmp.write_text(
        "<!doctype html><meta charset='utf-8'><style>html,body{margin:0;background:#fff}"
        f"svg{{display:block;width:{w}px;height:{h}px}}</style>" + svg, encoding="utf-8")
    return tmp


def chromium(src: Path, png: Path, pdf: Path | None, scale: float):
    seite = html_huelle(src)
    w, h = masse(src.read_text(encoding="utf-8")) if src.suffix.lower() == ".svg" else (None, None)
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            b = p.chromium.launch()
            pg = b.new_page(device_scale_factor=scale, viewport={"width": int(w or 1200), "height": int(h or 800)})
            pg.goto(seite.as_uri()); pg.wait_for_timeout(400)
            pg.screenshot(path=str(png), full_page=True)
            if pdf:
                if w:
                    pg.pdf(path=str(pdf), width=f"{w}px", height=f"{h}px", print_background=True)
                else:  # HTML: Seitengröße aus CSS @page
                    pg.pdf(path=str(pdf), print_background=True, prefer_css_page_size=True)
            b.close()
        return True
    except ImportError:
        pass
    if shutil.which("node"):
        js = Path(tempfile.mkdtemp()) / "r.js"
        js.write_text("""
const {chromium}=require('playwright');(async()=>{const a=JSON.parse(process.argv[2]);
const b=await chromium.launch();const p=await b.newPage({deviceScaleFactor:a.scale,viewport:{width:a.w,height:a.h}});
await p.goto(a.url);await p.waitForTimeout(400);await p.screenshot({path:a.png,fullPage:true});
if(a.pdf)await p.pdf(a.css?{path:a.pdf,printBackground:true,preferCSSPageSize:true}:{path:a.pdf,width:a.w+'px',height:a.h+'px',printBackground:true});await b.close();})()
.catch(e=>{console.error(e.message);process.exit(1)});""")
        arg = json.dumps({"url": seite.as_uri(), "png": str(png), "pdf": str(pdf) if pdf else None,
                          "scale": scale, "w": int(w or 1200), "h": int(h or 800), "css": w is None})
        r = subprocess.run(["node", str(js), arg], capture_output=True, text=True)
        if r.returncode == 0:
            return True
    return False


def rsvg(src: Path, png: Path, pdf: Path | None, scale: float):
    if src.suffix.lower() != ".svg" or not shutil.which("rsvg-convert"):
        return False
    subprocess.run(["rsvg-convert", "-z", str(scale), "-o", str(png), str(src)], check=True)
    if pdf:
        subprocess.run(["rsvg-convert", "-f", "pdf", "-o", str(pdf), str(src)], check=True)
    return True


def cairo(src: Path, png: Path, pdf: Path | None, scale: float):
    if src.suffix.lower() != ".svg":
        return False
    try:
        import cairosvg
    except ImportError:
        subprocess.run([sys.executable, "-m", "pip", "install", "-q", "cairosvg"], capture_output=True)
        try:
            import cairosvg
        except ImportError:
            return False
    cairosvg.svg2png(url=str(src), write_to=str(png), scale=scale)
    if pdf:
        cairosvg.svg2pdf(url=str(src), write_to=str(pdf))
    print("ACHTUNG: gerendert mit cairosvg – Filter (Körnung, weicher Rauch, Unschärfe) fehlen. "
          "Grafik ohne Filter prüfen oder Filter durch Verläufe ersetzen.")
    return True


def grau(png: Path):
    try:
        from PIL import Image
    except ImportError:
        return None
    ziel = png.with_name(png.stem + "_grau.png")
    Image.open(png).convert("L").save(ziel)
    return ziel


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("datei")
    ap.add_argument("--pdf", action="store_true")
    ap.add_argument("--scale", type=float, default=2)
    ap.add_argument("--dpi", type=float)
    ap.add_argument("--kein-grau", action="store_true")
    a = ap.parse_args()
    src = Path(a.datei).resolve()
    scale = a.dpi / 96 if a.dpi else a.scale
    png = src.with_suffix(".png"); pdf = src.with_suffix(".pdf") if a.pdf else None
    schriften_installieren()
    for name, fn in (("Chromium", chromium), ("rsvg-convert", rsvg), ("cairosvg", cairo)):
        try:
            if fn(src, png, pdf, scale):
                print(f"gerendert mit {name}: {png}" + (f" und {pdf}" if pdf else ""))
                break
        except Exception as e:
            print(f"{name} fehlgeschlagen: {e}")
    else:
        sys.exit("Kein Renderer verfügbar (Playwright/Chromium, rsvg-convert oder cairosvg).")
    if not a.kein_grau:
        g = grau(png)
        if g:
            print(f"Graustufen-Probe (Schwarz-Weiß-Kopierer): {g}")


if __name__ == "__main__":
    main()
