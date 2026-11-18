#!/usr/bin/env python3
"""Word-Vorlagen der Schule füllen (schulassistenz, Skill schulprofil, Abschnitt 4a).

Arbeitet direkt im Original-Dokument: Logo, Kopf- und Fußzeile, Schriften, Tabellen,
Textfelder und Ränder bleiben, wie die Schule sie angelegt hat. Nur Text wird ersetzt.

Drei Aufgaben:

  felder(vorlage)                         Platzhalter {{name}} im Dokument auflisten
  fuellen(vorlage, ziel, werte)           {{name}} durch Werte ersetzen
  ersetzen(vorlage, ziel, {alt: neu})     wörtlichen Text ersetzen (z. B. um aus einem
                                          ausgefüllten Muster eine Platzhalter-Fassung zu machen)
  brief(vorlage, ziel, absaetze)          Briefkopf-Vorlage: Kopf/Fußzeile behalten,
                                          Textkörper durch neue Absätze ersetzen

Regeln für Werte:
  - Text wird auch dann gefunden, wenn Word ihn auf mehrere Läufe (Formatierungen) verteilt hat.
    Die Formatierung des ersten Zeichens gilt für den ganzen Ersatz.
  - Steht ein Platzhalter allein in einem Absatz und ist der Wert eine Liste oder enthält
    Zeilenumbrüche, wird der Absatz je Zeile kopiert (gleiche Formatierung).
  - Formularschutz der Vorlage wird im Ergebnis aufgehoben (Entwurf bleibt in Word änderbar);
    fuellen(..., schutz_aufheben=False) lässt ihn stehen.
  - Platzhalter ohne Wert bleiben stehen; fuellen() meldet sie, damit nichts unbemerkt leer bleibt.

Kommandozeile:
  python vorlage.py felder  vorlage.docx
  python vorlage.py fuellen vorlage.docx ziel.docx werte.json
  python vorlage.py brief   briefkopf.docx ziel.docx text.md     (Absätze durch Leerzeilen getrennt)

Text-Auszeichnung in brief(): Absatz mit "**…**" ganz fett; "- " am Anfang = Aufzählung mit „–“;
"[[RECHTS]]" am Anfang = rechtsbündig (z. B. Ort und Datum); "[[ABSTAND]]" = leere Zeile.
Schülernamen nie einsetzen: Namen nur als Serienbrief-Feld «Vorname» (lernstandsakte, Abschnitt 6).
"""
import copy
import json
import re
import sys

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn

PLATZHALTER = re.compile(r"\{\{\s*([A-Za-z0-9_äöüÄÖÜß.-]+)\s*\}\}")


# ---------------------------------------------------------------- Hilfen
def _teile(doc):
    """Alle XML-Teile mit Text: Hauptdokument, Kopf- und Fußzeilen, Fußnoten."""
    teile = [doc.part]
    for rel in doc.part.rels.values():
        if rel.is_external:
            continue
        t = rel.target_part
        if any(k in t.content_type for k in ("header", "footer", "footnotes", "endnotes")):
            if hasattr(t, "_element") or hasattr(t, "element"):
                teile.append(t)
    return teile


def _wurzel(teil):
    return getattr(teil, "_element", None) if hasattr(teil, "_element") else teil.element


def _absaetze(doc):
    """Alle w:p-Elemente, auch in Tabellen und Textfeldern."""
    for teil in _teile(doc):
        w = _wurzel(teil)
        if w is None:
            continue
        for p in w.iter(qn("w:p")):
            yield p


def _texte(p):
    # nur direkte Läufe dieses Absatzes, nicht die verschachtelter Textfelder
    erg = []
    for t in p.iter(qn("w:t")):
        anc = t.getparent()
        while anc is not None and anc.tag != qn("w:p"):
            anc = anc.getparent()
        if anc is p:
            erg.append(t)
    return erg


def _ersetze_im_absatz(p, muster, ersatz_fn):
    """Ersetzt Treffer von `muster` (regex) über Laufgrenzen hinweg. Gibt Anzahl zurück."""
    ts = _texte(p)
    if not ts:
        return 0
    voll = "".join(t.text or "" for t in ts)
    treffer = list(muster.finditer(voll))
    if not treffer:
        return 0
    # Position -> (Index des w:t, Offset)
    grenzen, pos = [], 0
    for t in ts:
        grenzen.append(pos)
        pos += len(t.text or "")

    def ort(i):
        for k in range(len(ts) - 1, -1, -1):
            if i >= grenzen[k]:
                return k, i - grenzen[k]
        return 0, 0

    for m in reversed(treffer):
        neu = ersatz_fn(m)
        if neu is None:
            continue
        k1, o1 = ort(m.start())
        k2, o2 = ort(m.end() - 1)
        o2 += 1
        if k1 == k2:
            s = ts[k1].text
            ts[k1].text = s[:o1] + neu + s[o2:]
        else:
            ts[k1].text = ts[k1].text[:o1] + neu
            for k in range(k1 + 1, k2):
                ts[k].text = ""
            ts[k2].text = ts[k2].text[o2:]
        for k in (k1, k2):
            ts[k].set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    return len(treffer)


def _als_zeilen(wert):
    if isinstance(wert, (list, tuple)):
        return [str(x) for x in wert]
    return str(wert).split("\n")


def _speichern(doc, ziel, schutz_aufheben=True):
    """Formularschutz der Schulvorlage (nur Formularfelder bearbeitbar) aufheben, damit die
    Lehrkraft den Entwurf in Word noch ändern kann. Mit schutz_aufheben=False bleibt er."""
    if schutz_aufheben:
        st = doc.settings.element
        for s in st.findall(qn("w:documentProtection")):
            s.set(qn("w:enforcement"), "0")
    doc.save(ziel)


# ---------------------------------------------------------------- Aufgaben
def felder(vorlage):
    doc = Document(vorlage)
    namen = []
    for p in _absaetze(doc):
        voll = "".join(t.text or "" for t in _texte(p))
        for m in PLATZHALTER.finditer(voll):
            if m.group(1) not in namen:
                namen.append(m.group(1))
    return namen


def fuellen(vorlage, ziel, werte, schutz_aufheben=True):
    """Ersetzt {{name}}. Gibt die Liste der Platzhalter ohne Wert zurück."""
    doc = Document(vorlage)
    offen = []
    # 1. Absätze, die nur aus einem Platzhalter bestehen und mehrere Zeilen bekommen
    for p in list(_absaetze(doc)):
        voll = "".join(t.text or "" for t in _texte(p)).strip()
        m = PLATZHALTER.fullmatch(voll)
        if m and m.group(1) in werte:
            zeilen = _als_zeilen(werte[m.group(1)])
            if len(zeilen) > 1:
                vorbild = copy.deepcopy(p)
                _ersetze_im_absatz(p, PLATZHALTER, lambda _m, z=zeilen[0]: z)
                letzter = p
                for z in zeilen[1:]:
                    neu = copy.deepcopy(vorbild)
                    _ersetze_im_absatz(neu, PLATZHALTER, lambda _m, z=z: z)
                    letzter.addnext(neu)
                    letzter = neu
    # 2. alle übrigen Platzhalter im Fließtext
    def ersatz(m):
        n = m.group(1)
        if n in werte:
            return " ".join(_als_zeilen(werte[n]))
        if n not in offen:
            offen.append(n)
        return None
    for p in _absaetze(doc):
        _ersetze_im_absatz(p, PLATZHALTER, ersatz)
    _speichern(doc, ziel, schutz_aufheben)
    return offen


def ersetzen(vorlage, ziel, paare):
    """Wörtliche Ersetzung {alter Text: neuer Text}. Gibt nicht gefundene Texte zurück."""
    doc = Document(vorlage)
    gefunden = {a: 0 for a in paare}
    for p in _absaetze(doc):
        for alt, neu in paare.items():
            gefunden[alt] += _ersetze_im_absatz(p, re.compile(re.escape(alt)), lambda _m, n=neu: n)
    doc.save(ziel)   # Schutz bleibt: Platzhalter-Fassung soll wie das Original sein
    return [a for a, n in gefunden.items() if n == 0]


def brief(vorlage, ziel, absaetze, schrift=None, groesse=None):
    """Textkörper der Briefkopf-Vorlage durch `absaetze` (Liste von Strings) ersetzen.
    Kopf- und Fußzeilen, Ränder und Abschnittsformat bleiben. Schrift/Größe: aus der
    Formatvorlage „Standard“ der Vorlage, sonst die angegebenen Werte."""
    from docx.shared import Pt
    doc = Document(vorlage)
    body = doc.element.body
    # Hat die Vorlage mehrere Abschnitte, trägt meist der erste den Briefkopf (Logo, Fußzeile).
    # Dessen Einstellungen werden zum einzigen Abschnitt des Briefs.
    innen = [s for s in body.iter(qn("w:sectPr")) if s.getparent().tag == qn("w:pPr")]
    if innen:
        letzter = body.find(qn("w:sectPr"))
        neu = copy.deepcopy(innen[0])
        if letzter is not None:
            body.replace(letzter, neu)
        else:
            body.append(neu)
    for kind in list(body):
        if kind.tag != qn("w:sectPr"):
            body.remove(kind)
    einzeln = []
    for roh in absaetze:   # Aufzählungen: jede "- "-Zeile wird ein eigener Absatz
        if "\n- " in roh:
            einzeln += [z for z in re.split(r"\n(?=- )", roh) if z.strip()]
        else:
            einzeln.append(roh)
    for roh in einzeln:
        text = roh.rstrip()
        rechts = text.startswith("[[RECHTS]]")
        if rechts:
            text = text[len("[[RECHTS]]"):].lstrip()
        if text == "[[ABSTAND]]":
            text = ""
        fett = text.startswith("**") and text.endswith("**") and len(text) > 4
        if fett:
            text = text[2:-2]
        if text.startswith("- "):
            text = "–\t" + text[2:]
        p = doc.add_paragraph()
        zeilen = text.split("\n")
        for i, z in enumerate(zeilen):
            r = p.add_run(z)
            r.bold = fett or None
            if schrift:
                r.font.name = schrift
            if groesse:
                r.font.size = Pt(groesse)
            if i < len(zeilen) - 1:
                r.add_break()
        if rechts:
            p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        if roh.startswith("- "):
            p.paragraph_format.left_indent = Pt(14)
            p.paragraph_format.first_line_indent = Pt(-14)
    _speichern(doc, ziel)


# ---------------------------------------------------------------- Kommandozeile
if __name__ == "__main__":
    a = sys.argv[1:]
    if not a or a[0] not in ("felder", "fuellen", "brief"):
        print(__doc__)
        sys.exit(1)
    if a[0] == "felder":
        print("\n".join(felder(a[1])) or "(keine Platzhalter)")
    elif a[0] == "fuellen":
        with open(a[3], encoding="utf-8") as f:
            offen = fuellen(a[1], a[2], json.load(f))
        print("gespeichert:", a[2])
        if offen:
            print("OHNE WERT:", ", ".join(offen))
    else:
        with open(a[3], encoding="utf-8") as f:
            teile = [t.strip("\n") for t in re.split(r"\n\s*\n", f.read()) if t.strip()]
        brief(a[1], a[2], teile)
        print("gespeichert:", a[2])
