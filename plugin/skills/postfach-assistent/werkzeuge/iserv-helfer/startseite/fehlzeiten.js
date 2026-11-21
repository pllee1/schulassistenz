/* schulassistenz · Fehlzeiten-Ampel (Startseite)
   Gehört zum Plugin und wird bei Updates ersetzt. Wird nach dem Hauptskript geladen und nutzt dessen Funktionen
   (ordner, sdRoot, sdSchreib, namenLesen, xlsxZeilen, abschnittErgaenzen, oeffne, store, esc, $ …).

   Ablauf: WebUntis-Export „Abwesenheiten“ oder IServ-Klassenbuch › Statistik › Abwesenheiten (xls, xlsx, csv) per
   Schulassistenz-Helfer holen oder als Datei(en) hineinziehen. IServ exportiert auch je Kind eine Datei
   (<Nachname>_<Vornamen>_Klasse_<k>_Abwesenheiten.xlsx, ohne Namensspalte): Dann kommt der Name aus dem Dateinamen.
   Die Datei wird nur in diesem Fenster gelesen. Namen werden über die Kürzellisten durch Kürzel ersetzt.
   Behalten werden nur Kürzel, Datum, Stunden, Minuten, Status und „Verspätung ja/nein“.
   Verworfen werden Namen, Externe Id, Abwesenheitsgründe, Texte, Lehrkraft und Fach.
   Gespeichert wird <Schülerdaten>/ausgaben/fehlzeiten/fehlzeiten-<gruppe>.tsv (nur Kürzel). Diese Datei liest auch der Skill verwaltungsassistent.
   Regeln aus profil/profil.md, regeln.fehlzeiten (Frist, Elternschwelle, was als entschuldigt gilt, Verspätungen).
   Letzte Benachrichtigung der Eltern: Termine-Eintrag „Eltern über Fehlzeiten informiert“ in der Akte. */
(function(){
"use strict";
if(typeof sdRoot!=="function")return;

/* ---------- Tabellen lesen: xls (BIFF8), xls als HTML, xlsx, csv/tsv ---------- */
function cfbStream(buf,namen){
  const dv=new DataView(buf),u8=new Uint8Array(buf);
  if(dv.getUint32(0,true)!==0xE011CFD0)return null;
  const ss=1<<dv.getUint16(30,true),mss=1<<dv.getUint16(32,true);
  const nFat=dv.getUint32(44,true),dir0=dv.getUint32(48,true),cutoff=dv.getUint32(56,true),mfat0=dv.getUint32(60,true),dif0=dv.getUint32(68,true);
  const off=s=>512+s*ss;
  const fatSek=[];for(let i=0;i<109&&fatSek.length<nFat;i++){const s=dv.getUint32(76+i*4,true);if(s<0xFFFFFFFA)fatSek.push(s)}
  let d=dif0,schutz=0;while(fatSek.length<nFat&&d<0xFFFFFFFA&&schutz++<10000){for(let i=0;i<ss/4-1&&fatSek.length<nFat;i++){const s=dv.getUint32(off(d)+i*4,true);if(s<0xFFFFFFFA)fatSek.push(s)}d=dv.getUint32(off(d)+ss-4,true)}
  const fat=[];for(const s of fatSek)for(let i=0;i<ss/4;i++)fat.push(dv.getUint32(off(s)+i*4,true));
  const kette=(s,t)=>{const o=[];let n=0;while(s<0xFFFFFFFA&&n++<1e6){o.push(s);s=t[s]}return o};
  const lesen=(s,groesse)=>{const out=new Uint8Array(groesse);let p=0;for(const k of kette(s,fat)){const n=Math.min(ss,groesse-p);if(n<=0)break;out.set(u8.subarray(off(k),off(k)+n),p);p+=n}return out};
  const dirS=kette(dir0,fat);const eintraege=[];
  for(const s of dirS)for(let i=0;i<ss/128;i++){const o=off(s)+i*128;const nl=dv.getUint16(o+64,true);let name="";for(let j=0;j<Math.max(0,nl/2-1);j++)name+=String.fromCharCode(dv.getUint16(o+j*2,true));
    eintraege.push({name,typ:u8[o+66],start:dv.getUint32(o+116,true),groesse:dv.getUint32(o+120,true)})}
  const root=eintraege.find(e=>e.typ===5);const e=eintraege.find(x=>x.typ===2&&namen.includes(x.name));if(!e)return null;
  if(e.groesse>=cutoff||!root)return lesen(e.start,e.groesse);
  const mini=lesen(root.start,root.groesse);const mfat=[];for(const s of kette(mfat0,fat))for(let i=0;i<ss/4;i++)mfat.push(dv.getUint32(off(s)+i*4,true));
  const out=new Uint8Array(e.groesse);let p=0;for(const k of kette(e.start,mfat)){const n=Math.min(mss,e.groesse-p);if(n<=0)break;out.set(mini.subarray(k*mss,k*mss+n),p);p+=n}return out;
}
function biffZeilen(wb){
  const dv=new DataView(wb.buffer,wb.byteOffset,wb.byteLength);const zeilen=[];const sst=[];
  const rk=v=>{let n;if(v&2)n=v>>2;else{const b=new DataView(new ArrayBuffer(8));b.setUint32(4,v&0xFFFFFFFC,true);n=b.getFloat64(0,true)}return v&1?n/100:n};
  const setze=(r,c,v)=>{(zeilen[r]=zeilen[r]||[])[c]=v};
  let p=0,blatt=-1,fertig=false,formelZelle=null;
  while(p+4<=wb.length&&!fertig){
    const typ=dv.getUint16(p,true),len=dv.getUint16(p+2,true),d=p+4;
    if(typ===0x00FC){ // SST mit CONTINUE
      const teile=[[d,len]];let q=d+len;while(q+4<=wb.length&&dv.getUint16(q,true)===0x003C){const l=dv.getUint16(q+2,true);teile.push([q+4,l]);q+=4+l}
      let ti=0,pos=teile[0][0]+8;const ende=()=>teile[ti][0]+teile[ti][1];
      const weiter=()=>{if(pos>=ende()&&ti<teile.length-1){ti++;pos=teile[ti][0];return true}return false};
      const u8=()=>{weiter();return wb[pos++]},u16=()=>{weiter();const v=dv.getUint16(pos,true);pos+=2;return v},u32=()=>{weiter();const v=dv.getUint32(pos,true);pos+=4;return v};
      const anzahl=dv.getUint32(d+4,true);
      for(let i=0;i<anzahl&&ti<teile.length;i++){
        let cch=u16(),fl=u8();let runs=0,ext=0;if(fl&8)runs=u16();if(fl&4)ext=u32();let s="";
        while(cch>0){if(pos>=ende()){if(!weiter())break;fl=wb[pos++]}
          const breit=fl&1;const verf=Math.floor((ende()-pos)/(breit?2:1));const n=Math.min(cch,verf);
          for(let k=0;k<n;k++){s+=String.fromCharCode(breit?dv.getUint16(pos,true):wb[pos]);pos+=breit?2:1}cch-=n;if(n===0&&cch>0){if(!weiter())break;fl=wb[pos++]}}
        let skip=runs*4+ext;while(skip>0){if(pos>=ende()&&!weiter())break;const n=Math.min(skip,ende()-pos);pos+=n;skip-=n}
        sst.push(s)}
      p=q;continue}
    if(typ===0x0809){const dt=dv.getUint16(d+2,true);if(dt===0x0010){blatt++;if(blatt>0)fertig=true}}
    else if(typ===0x000A&&blatt===0)fertig=true;
    else if(blatt===0){
      const r=len>=4?dv.getUint16(d,true):0,c=len>=4?dv.getUint16(d+2,true):0;
      if(typ===0x00FD)setze(r,c,sst[dv.getUint32(d+6,true)]??"");
      else if(typ===0x0203)setze(r,c,dv.getFloat64(d+6,true));
      else if(typ===0x027E)setze(r,c,rk(dv.getUint32(d+6,true)));
      else if(typ===0x00BD){const last=dv.getUint16(d+len-2,true);for(let k=c,o=d+4;k<=last;k++,o+=6)setze(r,k,rk(dv.getUint32(o+2,true)))}
      else if(typ===0x0204||typ===0x00D6){const cch=dv.getUint16(d+6,true),fl=wb[d+8];let s="";for(let k=0;k<cch;k++)s+=String.fromCharCode(fl&1?dv.getUint16(d+9+k*2,true):wb[d+9+k]);setze(r,c,s)}
      else if(typ===0x0205)setze(r,c,wb[d+7]?"":wb[d+6]);
      else if(typ===0x0006){if(dv.getUint16(d+12,true)===0xFFFF){const art=wb[d+6];if(art===0)formelZelle=[r,c];else if(art===1)setze(r,c,wb[d+8]);else setze(r,c,"")}else setze(r,c,dv.getFloat64(d+6,true))}
      else if(typ===0x0207&&formelZelle){const cch=dv.getUint16(d,true),fl=wb[d+2];let s="";for(let k=0;k<cch;k++)s+=String.fromCharCode(fl&1?dv.getUint16(d+3+k*2,true):wb[d+3+k]);setze(formelZelle[0],formelZelle[1],s);formelZelle=null}
    }
    p=d+len;
  }
  return Array.from(zeilen,z=>z||[]);
}
function textDekodieren(buf){
  const u=new Uint8Array(buf);
  if(u[0]===0xFF&&u[1]===0xFE)return new TextDecoder("utf-16le").decode(buf);
  if(u[0]===0xFE&&u[1]===0xFF)return new TextDecoder("utf-16be").decode(buf);
  try{return new TextDecoder("utf-8",{fatal:true}).decode(buf)}catch{return new TextDecoder("windows-1252").decode(buf)}
}
function trennZeilen(t){
  t=t.replace(/^﻿/,"");const z=t.split(/\r?\n/).filter(x=>x.trim());if(!z.length)return [];
  const k=z[0];const sep=[["\t",(k.match(/\t/g)||[]).length],[";",(k.match(/;/g)||[]).length],[",",(k.match(/,/g)||[]).length]].sort((a,b)=>b[1]-a[1])[0][0];
  const zeile=s=>{const o=[];let cur="",q=false;for(let i=0;i<s.length;i++){const ch=s[i];if(q){if(ch==='"'&&s[i+1]==='"'){cur+='"';i++}else if(ch==='"')q=false;else cur+=ch}else if(ch==='"')q=true;else if(ch===sep){o.push(cur);cur=""}else cur+=ch}o.push(cur);return o.map(x=>x.trim())};
  return z.map(zeile);
}
function htmlZeilen(t){const d=new DOMParser().parseFromString(t,"text/html");const tab=[...d.querySelectorAll("table")].sort((a,b)=>b.rows.length-a.rows.length)[0];if(!tab)return [];
  return [...tab.rows].map(r=>[...r.cells].map(c=>c.textContent.replace(/\s+/g," ").trim()))}
/* ---------- WebUntis-PDF „Fehlzeiten pro Schüler*in“ (AbsencePerStudent) ---------- */
async function pdfLib(){
  if(!window.pdfjsLib)await new Promise((ok,f)=>{const s=document.createElement("script");s.src="../lib/pdf.min.js";s.onload=ok;s.onerror=()=>f(new Error("Der PDF-Leser des Helfers fehlt. Bitte den Helfer aktualisieren."));document.head.appendChild(s)});
  pdfjsLib.GlobalWorkerOptions.workerSrc="../lib/pdf.worker.min.js";return pdfjsLib}
async function pdfZeilen(buf){
  const lib=await pdfLib();const pdf=await lib.getDocument({data:new Uint8Array(buf).slice(),isEvalSupported:false}).promise;
  const out=[["Schüler*innen","Klasse","Datum","Fehlstd","Fehlmin","Status","Abwesenheitsgrund","Fach","Lehrkraft"]];
  let spalten=null,name="",klasse="",ich="",gesehen=false;
  for(let p=1;p<=pdf.numPages;p++){
    const tc=await (await pdf.getPage(p)).getTextContent();
    const items=tc.items.filter(i=>i.str&&i.str.trim()).map(i=>({t:i.str.trim(),x:i.transform[4],w:i.width||0,y:i.transform[5]}));
    const zeilen=[];for(const it of items){const z=zeilen.find(z=>Math.abs(z.y-it.y)<2.5);if(z)z.i.push(it);else zeilen.push({y:it.y,i:[it]})}
    zeilen.sort((a,b)=>b.y-a.y);zeilen.forEach(z=>z.i.sort((a,b)=>a.x-b.x));
    for(const z of zeilen){const txt=z.i.map(i=>i.t).join(" ").replace(/\s+/g," ").trim();
      if(/Abwesenheitsgrund/.test(txt)&&/Status/.test(txt)){spalten=z.i.map(i=>({t:i.t,m:i.x+i.w/2}));gesehen=true;continue}
      let m=txt.match(/^(.+?)\s*\(\d{4,}\)$/);if(m){name=m[1].trim();continue}
      m=txt.match(/^Klasse\s+(\S+)$/);if(m){klasse=m[1];continue}
      m=txt.match(/^(\S+)\s+\d{2}\.\d{2}\.\d{4}\s+\d{1,2}:\d{2}$/);if(m){ich=m[1];continue}
      m=txt.match(/^(?:Mo|Di|Mi|Do|Fr|Sa|So)\.?\s+(\d{2}\.\d{2}\.\d{2,4})\s+(\d+)\s+(\d+):(\d{2})/);
      if(!m||!name||!spalten)continue;
      const st=(txt.match(/(nicht entsch\.?|entsch\.?|offen)$/i)||[])[1]||"";
      const w={};for(const it of z.i){const mx=it.x+it.w/2;let best="",bd=1e9;for(const c of spalten){const d=Math.abs(c.m-mx);if(d<bd){bd=d;best=c.t}}w[best]=w[best]?w[best]+" "+it.t:it.t}
      const feld=re=>{const k=Object.keys(w).find(x=>re.test(x));return k?w[k]:""};
      const fach=feld(/^Fach$/i),lk=feld(/^Lehrkraft/i),grund=feld(/^Abwesenheitsgrund/i);
      out.push([name,klasse,m[1],+m[2],(+m[3])*60+(+m[4]),st,/^(nicht |entsch|offen)/i.test(grund)?"":grund,/^\d/.test(fach)?"":fach,lk])}
  }
  if(!gesehen)throw new Error("Das ist keine WebUntis-PDF „Fehlzeiten pro Schüler*in“. Bitte in WebUntis den Bericht „Abwesenheiten“ pro Schüler*in als PDF ausgeben.");
  out.ich=ich;out.pdf=true;return out;
}
async function tabelleLesen(buf){
  const u=new Uint8Array(buf);
  if(u[0]===0x25&&u[1]===0x50&&u[2]===0x44&&u[3]===0x46)return pdfZeilen(buf);
  if(u[0]===0xD0&&u[1]===0xCF){const wb=cfbStream(buf,["Workbook","Book"]);if(!wb)throw new Error("Die Excel-Datei lässt sich nicht lesen. Bitte in Excel als .xlsx oder .csv speichern und noch einmal versuchen.");return biffZeilen(wb)}
  if(u[0]===0x50&&u[1]===0x4B)return xlsxZeilen(buf);
  const t=textDekodieren(buf);
  if(/^\s*</.test(t)&&/<table/i.test(t))return htmlZeilen(t);
  return trennZeilen(t);
}

/* ---------- Spalten, Datum, Namen ---------- */
const norm=s=>String(s??"").normalize("NFKC").toLowerCase().replace(/[\u00ad\u200b-\u200d\ufeff]/g,"").replace(/[\u2010-\u2015\u2212]/g,"-").replace(/[,.;()]/g," ").replace(/\s*-\s*/g,"-").replace(/\s+/g," ").trim();
const tokenKey=s=>norm(s).split(/[\s-]+/).filter(Boolean).sort().join(" ");
// Ohne Akzente (Dateinamen aus dem IServ-Klassenbuch schreiben z. B. „Dundar“ statt „Dündar“, „Gurcin“ statt „Gürçin“)
const ohneAkzent=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ß/g,"ss").replace(/æ/g,"ae").replace(/ø/g,"o").replace(/ł/g,"l");
const SPALTEN={
  name:[/^sch(ü|ue)ler/i,/^name$/i,/^langname$/i,/^schüler\*innen$/i],
  klasse:[/^klasse/i],
  datum:[/^datum$/i,/^von$/i,/^beginn(datum)?$/i,/^date$/i],
  std:[/^fehlstd/i,/^fehlstunden/i,/^stunden$/i],
  min:[/^fehlmin/i,/^minuten$/i],
  grund:[/^abwesenheitsgrund/i,/^grund$/i],
  status:[/^status$/i,/^entschuldigungsstatus/i],
  zeitraum:[/^zeitraum$/i],
  tage:[/^fehltage$/i],
  verp:[/^verp(\.|asst)?\s*unterricht/i],
  wu:[/^externe id$/i,/^abwesenheitsgrund/i],
  lehrkraft:[/^lehrkraft/i,/^lehrer/i],
  fach:[/^fach$/i]
};
// Vermerke (IServ-Klassenbuch › Statistik › Vermerke), laut Ansicht in IServ: Wertung, Klasse, Schüler, Datum („04.11.2026 - 2. Stunde“),
// Lehrer, Kategorie, Bemerkung. Lehrer und Stunde werden nicht übernommen. Ein Fach gibt es dort nicht; steht eine Fach-Spalte in der Datei, kommt sie mit.
const VERMERK_SPALTEN={
  name:[/^sch(ü|ue)ler/i,/^name$/i],
  datum:[/^datum$/i,/^date$/i,/^tag$/i],
  text:[/^vermerk$/i,/^sch(ü|ue)lervermerk/i,/^bemerkung/i,/^text$/i,/^inhalt$/i,/^kommentar/i,/^beschreibung/i,/^notiz/i],
  art:[/^art$/i,/^vermerkart/i,/^kategorie/i,/^typ$/i,/^vermerktyp/i,/^grund$/i],
  wertung:[/^wertung$/i,/^bewertung$/i],
  fach:[/^fach$/i,/^f(ä|ae)cher$/i,/^unterricht$/i,/^verp(\.|asst)?\s*unterricht/i,/^kurs$/i,/^stunde$/i],
  fehl:[/^fehlstunden/i,/^fehlstd/i,/^fehlmin/i]
};
// Fach aus „1. De in Klasse 2b  (MI)“ (IServ, mehrere Zeilen möglich) oder einfach „Deutsch“; die Lehrkraft in Klammern fällt weg.
function fachAus(v){
  const zeilen=String(v??"").split(/\n|;/).map(x=>x.trim()).filter(Boolean);const out=[];
  for(const z of zeilen){let m=z.match(/^\d+\.\s*(.+?)\s+in\s+/i);let f=m?m[1]:/^\d+\.\s*std/i.test(z)||/^\d+$/.test(z)?"":z.replace(/\s*\([^)]*\)\s*$/,"");
    f=f.trim();if(f&&f!=="-"&&f.length<=30&&!out.includes(f))out.push(f)}
  return out.join("/");
}
function vermerkSpalten(zeilen,ohneName){
  for(let i=0;i<Math.min(15,zeilen.length);i++){const h=(zeilen[i]||[]).map(x=>String(x??"").trim());const s={};
    for(const [k,res] of Object.entries(VERMERK_SPALTEN))s[k]=h.findIndex(x=>res.some(r=>r.test(x)));
    if(s.fehl<0&&s.datum>=0&&(s.text>=0||s.art>=0)&&(s.name>=0||ohneName))return {kopf:i,s}}
  return null;
}
// Freitext: Namen aus allen Kürzellisten durch Kürzel ersetzen (ganzer Name zuerst, dann einzelne Vor-/Nachnamen;
// mehrdeutige einzelne Namen werden zu [Name]). Was danach noch wie ein Name aussieht, markiert die Vorschau.
let namenWoerter=null;
async function namenWoerterLaden(){
  const voll=[],einzel=new Map();
  for(const g of ordner.gruppen){const m=await namenLesen(g.id);
    for(const [k,n] of Object.entries(m)){const vor=String(n.vor||"").trim(),nach=String(n.nach||"").trim();
      for(const v of [`${vor} ${nach}`,`${nach} ${vor}`,`${nach}, ${vor}`])if(vor&&nach)voll.push([v,k]);
      for(const w of `${vor} ${nach}`.split(/[\s-]+/))if(w.length>=3){const key=w.toLowerCase();if(!einzel.has(key))einzel.set(key,new Set());einzel.get(key).add(k)}}}
  voll.sort((a,b)=>b[0].length-a[0].length);namenWoerter={voll,einzel};return namenWoerter;
}
const reEsc=x=>x.replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&");
function textPseudo(t){
  if(!namenWoerter)return t;let x=String(t||"");
  for(const [v,k] of namenWoerter.voll)x=x.replace(new RegExp(`(^|[^\\p{L}])${reEsc(v)}(?![\\p{L}])`,"giu"),(m,a)=>a+k);
  x=x.replace(/\p{Lu}\p{L}{2,}/gu,w=>{const l=namenWoerter.einzel.get(w.toLowerCase());if(!l)return w;return l.size===1?[...l][0]:"[Name]"});
  return x;
}
const nameRest=t=>nameVerdacht(String(t||""));

// Weitere Spalten, falls WebUntis den Status anders benennt (der Reihe nach)
const STATUS_WEITERE=[/status/i,/^entschuldigt$/i,/^entsch\.?$/i,/^unentsch/i,/^entschuldigung$/i];
function spaltenFinden(zeilen,ohneName){
  for(let i=0;i<Math.min(15,zeilen.length);i++){const h=(zeilen[i]||[]).map(x=>String(x??"").trim());const s={};
    for(const [k,res] of Object.entries(SPALTEN))s[k]=h.findIndex(x=>res.some(r=>r.test(x)));
    if(s.datum>=0&&(s.name>=0||ohneName)){if(s.status<0)for(const r of STATUS_WEITERE){const j=h.findIndex(x=>r.test(x)&&!/text|nummer|grund/i.test(x));if(j>=0){s.status=j;break}}
      return {kopf:i,s,kopfzeile:h}}}
  return null;
}
function datumISO(v){
  if(typeof v==="number"&&v>20000&&v<80000){const d=new Date(Date.UTC(1899,11,30)+Math.round(v)*864e5);return d.toISOString().slice(0,10)}
  const t=String(v??"").trim();let m=t.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
  if(m){const j=m[3].length===2?2000+ +m[3]:+m[3];return `${j}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`}
  m=t.match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return m[0];
  if(/^\d{5}(\.\d+)?$/.test(t))return datumISO(parseFloat(t));
  return "";
}
const zahl=v=>{const n=parseFloat(String(v??"").replace(",","."));return isNaN(n)?0:n};
async function alleNamen(){
  const ziel=new Map();   // normierter Name (und Wortmenge) → [{gruppe,kuerzel}]
  const add=(v,e)=>{if(!v)return;if(!ziel.has(v))ziel.set(v,[]);const l=ziel.get(v);if(!l.some(x=>x.gruppe===e.gruppe&&x.kuerzel===e.kuerzel))l.push(e)};
  for(const g of ordner.gruppen){const m=await namenLesen(g.id);let letzterNach="";
    for(const [k,n] of Object.entries(m)){let vor=norm(n.vor),nach=norm(n.nach);if(!vor&&!nach)continue;
      // Leerer Nachname direkt unter einem Geschwisterkind (z. B. verbundene Zellen in Excel): Nachname der Zeile darüber
      const nachnamen=nach?[nach]:letzterNach?[letzterNach,""]:[""];if(nach)letzterNach=nach;
      const e={gruppe:g.id,kuerzel:k,anzeige:[n.vor,n.nach].filter(Boolean).join(" ")};
      for(const nn of nachnamen){const varianten=new Set([`${nn} ${vor}`.trim(),`${vor} ${nn}`.trim()]);const v1=vor.split(" ")[0];if(v1&&v1!==vor){varianten.add(`${nn} ${v1}`.trim());varianten.add(`${v1} ${nn}`.trim())}
        for(const v of varianten){add(v,e);add("§"+tokenKey(v),e);add("~"+ohneAkzent(tokenKey(v)),e)}}}}
  return ziel;
}

/* ---------- Regeln aus dem Profil ---------- */
function flowMap(s){const o={};let tiefe=0,cur="";const teile=[];for(const ch of s){if(ch==="["||ch==="{")tiefe++;if(ch==="]"||ch==="}")tiefe--;if(ch===","&&tiefe===0){teile.push(cur);cur=""}else cur+=ch}teile.push(cur);
  for(const t of teile){const i=t.indexOf(":");if(i<0)continue;const k=t.slice(0,i).trim();let v=t.slice(i+1).trim();
    if(/^\[.*\]$/.test(v))v=v.slice(1,-1).split(",").map(x=>x.trim().replace(/^['"]|['"]$/g,"")).filter(x=>x&&!/^</.test(x));else v=v.replace(/^['"]|['"]$/g,"");o[k]=v}return o}
function regeln(){
  const t=(ordner.profil&&ordner.profil.text)||"";const r={frist:3,einheit:"schultage",schwelle:5,ab:"letzte_benachrichtigung",verspaetung:false,fristUnent:false,entschuldigt:[],ausProfil:false};
  const m=t.match(/^\s*fehlzeiten:\s*\{(.+)\}\s*(#.*)?$/m);
  if(m){const f=flowMap(m[1]);r.ausProfil=true;
    if(f.frist&&!isNaN(parseInt(f.frist,10)))r.frist=parseInt(f.frist,10);
    if(f.frist_einheit)r.einheit=/kalender/i.test(f.frist_einheit)?"kalendertage":"schultage";
    if(f.eltern_ab_unentsch_std&&!isNaN(parseFloat(f.eltern_ab_unentsch_std)))r.schwelle=parseFloat(f.eltern_ab_unentsch_std);
    if(f.schwelle_zaehlt_ab)r.ab=f.schwelle_zaehlt_ab;
    if(f.verspaetung_zaehlt)r.verspaetung=/^(ja|true)/i.test(f.verspaetung_zaehlt);
    if(f.nach_frist_unentschuldigt)r.fristUnent=/^(ja|true)/i.test(f.nach_frist_unentschuldigt);
    if(Array.isArray(f.zaehlt_als_entschuldigt)){r.entschuldigtText=f.zaehlt_als_entschuldigt;r.entschuldigt=f.zaehlt_als_entschuldigt.map(norm)}}
  else{const a=t.match(/fehlzeiten_eltern_informieren_ab:\s*(\d+)/);if(a){r.schwelle=+a[1];r.ausProfil=true}const b=t.match(/fehlzeiten_entschuldigung_frist:\s*(\d+)/);if(b)r.frist=+b[1]}
  r.vorwarn=null;r.profil={...r};
  // Eigene Schwellen (Startseite › Fehlzeiten › „Schwellen anpassen“), nur in diesem Browser
  const o=store.get("fz-regeln",null);
  if(o&&typeof o==="object"){r.lokal=true;
    if(o.schwelle>0)r.schwelle=+o.schwelle;if(o.vorwarn>0&&o.vorwarn<r.schwelle)r.vorwarn=+o.vorwarn;
    if(o.frist>=0&&o.frist!==""&&o.frist!=null)r.frist=+o.frist;if(o.einheit)r.einheit=o.einheit;if(o.ab)r.ab=o.ab;if(typeof o.verspaetung==="boolean")r.verspaetung=o.verspaetung;if(typeof o.fristUnent==="boolean")r.fristUnent=o.fristUnent}
  return r;
}
const ferien=()=>(Array.isArray(E.ferien)?E.ferien:[]).map(x=>Array.isArray(x)?[x[0],x[1]||x[0]]:[x,x]).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x[0]));
const istFrei=iso=>{const d=new Date(iso+"T12:00:00");const w=d.getDay();return w===0||w===6||ferien().some(([a,b])=>iso>=a&&iso<=b)};
const plusTage=(iso,n)=>{const d=new Date(iso+"T12:00:00");d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
function fristEnde(iso,r){if(r.einheit==="kalendertage")return plusTage(iso,r.frist);let d=iso,n=0;while(n<r.frist){d=plusTage(d,1);if(!istFrei(d))n++}return d}
function naechsterSchultag(iso){let d=plusTage(iso,1);let n=0;while(istFrei(d)&&n++<30)d=plusTage(d,1);return d}
// Schuljahresbeginn: erster Tag nach den Sommerferien (aus E.ferien), sonst 1. August. WebUntis lehnt Zeiträume vor dem Schuljahr ab.
const schuljahrBeginn=()=>{const d=new Date();const j=d.getMonth()>=7?d.getFullYear():d.getFullYear()-1;
  const sommer=ferien().filter(([a,b])=>b>=`${j}-07-01`&&b<=`${j}-09-30`).map(x=>x[1]).sort().pop();return sommer?plusTage(sommer,1):`${j}-08-01`};

/* ---------- Datei → pseudonymisierte Zeilen ---------- */
// IServ-Klassenbuch: Export je Kind heißt <Nachname>_<Vornamen>_Klasse_<k>_Abwesenheiten.xlsx (bzw. _Fehlzeiten_Summe)
function nameAusDatei(n){
  n=String(n||"").split(/[\\/]/).pop().replace(/\.[a-z0-9]+$/i,"").replace(/\s*\(\d+\)$/,"");
  let m=n.match(/^(.+?)_Klasse_([^_]+)_(Abwesenheiten|Fehlzeiten|Vermerke)/i);if(m)return {name:m[1].replace(/_+/g," ").trim(),kl:m[2]};
  m=n.match(/^(.+?)_(Abwesenheiten|Fehlzeiten)/i);if(m&&/_/.test(m[1]))return {name:m[1].replace(/_+/g," ").trim(),kl:""};
  return null;
}
const klasseNorm=k=>String(k||"").trim().replace(/^klasse\s*/i,"");
async function verarbeiten(eingabe){
  const dateien=Array.isArray(eingabe)?eingabe:[{buf:eingabe,name:""}];
  const r=regeln();const namen=await alleNamen();
  const aehnlich=new Map(),daten=[],fehlend=new Map(),klassen=new Map(),doppelt=new Map(),gesehen=new Set();const hinweise=[],herkunft=new Set(),stWerte=new Map(),vermerke=[];let spName="",kopfLetzt=[];let summen=0,ohneKopf=0,pdf=0,ichAlle="";
  for(const datei of dateien){
  const buf=await datei.buf;
  const zeilen=await tabelleLesen(buf);const ausDatei=nameAusDatei(datei.name);
  const vs=vermerkSpalten(zeilen,!!ausDatei);
  if(vs){const {kopf,s}=vs;herkunft.add("IServ-Klassenbuch");
    for(const z of zeilen.slice(kopf+1)){if(!z)continue;
      const name=(s.name>=0?String(z[s.name]??"").trim():"")||(ausDatei?ausDatei.name:"");const iso=datumISO(z[s.datum]);
      const fach=s.fach>=0?fachAus(z[s.fach]):"";
      const zelle=i=>{const v=i>=0?String(z[i]??"").replace(/\s+/g," ").trim():"";return /^[-–—]$/.test(v)?"":v};
      const text=zelle(s.text),art=zelle(s.art),w=norm(zelle(s.wertung));
      const wertung=/neg|^-$|^−$/.test(w)?"negativ":/pos|^\+$/.test(w)?"positiv":/neutr/.test(w)?"neutral":"";
      if(!name||!iso||(!text&&!art))continue;
      const treffer=namen.get(norm(name))||namen.get("§"+tokenKey(name))||namen.get("~"+ohneAkzent(tokenKey(name)))||[];
      const schl=["v",tokenKey(name),iso,art,text].join("|");if(gesehen.has(schl))continue;gesehen.add(schl);
      vermerke.push({name,treffer,iso,art,text,fach,wertung});if(!treffer.length)fehlend.set(name,(fehlend.get(name)||0)+1)}
    continue}
  const sp=spaltenFinden(zeilen,!!ausDatei);
  if(!sp){const kopfz=zeilen.slice(0,15).map(z=>(z||[]).map(x=>String(x??"").trim()));
    if(kopfz.some(z=>z.some(x=>/^fehltage$/i.test(x))||(z.some(x=>/^negativ$/i.test(x))&&z.some(x=>/^positiv$/i.test(x)))))summen++;else ohneKopf++;continue}
  const {kopf,s,kopfzeile}=sp;const proDatei=new Map();const ich=String(zeilen.ich||"").trim().toLowerCase();if(zeilen.ich){ichAlle=zeilen.ich;herkunft.add("WebUntis-PDF")}
  if(s.name<0&&!ausDatei){ohneKopf++;continue}
  if(s.status>=0)spName=kopfzeile[s.status];kopfLetzt=kopfzeile;const spUnent=/^unentsch/i.test(s.status>=0?kopfzeile[s.status]:"");
  if(s.verp>=0||ausDatei)herkunft.add("IServ-Klassenbuch");else if(s.wu>=0)herkunft.add("WebUntis");
  for(const z of zeilen.slice(kopf+1)){if(!z)continue;
    const name=(s.name>=0?String(z[s.name]??"").trim():"")||(ausDatei?ausDatei.name:"");const iso=datumISO(z[s.datum]);if(!name||!iso)continue;
    const kl=klasseNorm(s.klasse>=0?String(z[s.klasse]??""):(ausDatei?ausDatei.kl:""));if(kl)klassen.set(kl,(klassen.get(kl)||0)+1);
    const std=s.std>=0?zahl(z[s.std]):1,min=s.min>=0?zahl(z[s.min]):0;
    const grund=s.grund>=0?norm(z[s.grund]):"";const st=s.status>=0?norm(z[s.status]):"";
    if(/keine fehlzeit/.test(st+" "+grund)||(s.std>=0&&std===0&&min===0))continue;   // IServ: „Sonstige Abwesenheit (keine Fehlzeit)“
    const ft=s.tage>=0?zahl(z[s.tage]):null;
    if(s.status>=0)stWerte.set(st||"(leer)",(stWerte.get(st||"(leer)")||0)+1);
    let status=/nicht|unent|^u$/.test(st)?"unentschuldigt":/entsch|^e$/.test(st)?"entschuldigt":"offen";
    // Ja/Nein-Spalten („Entschuldigt: ja“ bzw. „Unentschuldigt: ja“)
    if(status==="offen"&&/^(ja|x|1|true|wahr)$/.test(st))status=spUnent?"unentschuldigt":"entschuldigt";
    else if(status==="offen"&&/^(nein|0|false|falsch)$/.test(st))status=spUnent?"entschuldigt":"unentschuldigt";
    if(status!=="entschuldigt"&&grund&&r.entschuldigt.includes(grund))status="entschuldigt";
    const zr=s.zeitraum>=0?norm(z[s.zeitraum]):"";
    // WebUntis-PDF: Verspätung = 0 Schulstunden (so zählt auch WebUntis); sonst nach Minuten bzw. Grund
    const verspaetung=zeilen.pdf?(std===0&&min>0):(std===0&&min>0&&min<45)||/versp(ä|ae)t/.test(grund)||(std===0&&/zu sp(ä|ae)t/.test(zr));
    // gleiche Zeilen innerhalb einer Datei sind verschiedene Stunden (z. B. Doppelstunde in der WebUntis-PDF); doppelt eingelesene Dateien zählen nur einmal
    const roh=[tokenKey(name),iso,std,min,status,zr].join("|");const nr=(proDatei.get(roh)||0)+1;proDatei.set(roh,nr);const schluessel=roh+"#"+nr;if(gesehen.has(schluessel))continue;gesehen.add(schluessel);
    const treffer=namen.get(norm(name))||namen.get("§"+tokenKey(name))||namen.get("~"+ohneAkzent(tokenKey(name)))||[];
    const mein=ich&&s.lehrkraft>=0?String(z[s.lehrkraft]??"").toLowerCase().split(/[\s,;/]+/).includes(ich):undefined;
    const fach=s.fach>=0?String(z[s.fach]??"").replace(/\s+/g," ").trim().slice(0,20):"";
    daten.push({name,treffer,iso,std,min,status,verspaetung,kl,ft,mein,fach});
    if(!treffer.length)fehlend.set(name,(fehlend.get(name)||0)+1);
    if(!treffer.length&&!aehnlich.has(name)){const t=new Set(tokenKey(name).split(" "));const kand=new Map();for(const [key,l] of namen)if(key.startsWith("§")&&key.slice(1).split(" ").some(x=>x.length>2&&t.has(x)))for(const e of l)kand.set(e.gruppe+"/"+e.kuerzel,e);aehnlich.set(name,[...kand.values()].slice(0,4))}
    else if(new Set(treffer.map(t=>t.gruppe)).size<treffer.length)doppelt.set(name,treffer);
  }}
  if(pdf)hinweise.push(`${pdf===1?"Eine PDF-Datei wurde":pdf+" PDF-Dateien wurden"} übersprungen. Bitte beim Export „Excel“ oder „CSV“ wählen.`);
  if(summen&&(daten.length||vermerke.length))hinweise.push(`${summen===1?"Eine Summen- bzw. Übersichtsdatei":summen+" Summen- bzw. Übersichtsdateien"} (z. B. Fehlzeiten_Summe, Schülerübersicht nach Wertung) übersprungen: Die Summen rechnet die Seite selbst.`);
  if(ohneKopf)hinweise.push(`${ohneKopf===1?"Eine Datei hat":ohneKopf+" Dateien haben"} keine passende Kopfzeile (Schüler bzw. Dateiname und Datum) und wurde${ohneKopf===1?"":"n"} übersprungen.`);
  if(!daten.length&&!vermerke.length){
    if(pdf&&!summen&&!ohneKopf)throw new Error("PDF-Dateien kann die Seite nicht lesen. Bitte beim Export „Excel“ oder „CSV“ wählen.");
    if(summen&&!ohneKopf)throw new Error("Das ist nur eine Summe bzw. Übersicht. Die Seite braucht die einzelnen Einträge: im IServ-Klassenbuch unter Statistik › Abwesenheiten bzw. bei den Schülervermerken (Liste mit Datum, Kategorie, Bemerkung) exportieren.");
    throw new Error(dateien.length>1?"In den Dateien stehen keine Fehlzeilen (Name und Datum).":"In der Datei fehlt die Kopfzeile mit Schülername und Datum (oder es stehen keine Fehlzeiten darin). Ist es der Bericht „Abwesenheiten“ aus WebUntis bzw. aus dem IServ-Klassenbuch (Statistik)?");}
  const statusInfo={spalte:spName||null,werte:[...stWerte].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([w,n])=>[w.slice(0,30),n]),erkannt:daten.filter(d=>d.status!=="offen").length,
    kopf:kopfLetzt.filter(Boolean).map(x=>x.slice(0,30))};
  return {daten,fehlend,klassen,doppelt,regeln:r,aehnlich,hinweise,dateien:dateien.length-pdf,herkunft:[...herkunft].join(" + "),statusInfo,vermerke,ich:ichAlle};
}
function gruppeVorschlag(erg){
  const kl=[...erg.klassen.entries()].sort((a,b)=>b[1]-a[1])[0];
  if(kl){const k=klasseNorm(kl[0]).toLowerCase().replace(/\s+/g,"");const passend=ordner.gruppen.filter(g=>g.id.toLowerCase()===k||g.id.toLowerCase().startsWith(k+"-"));
    if(passend.length){const treffer=g=>erg.daten.filter(d=>d.treffer.some(t=>t.gruppe===g.id)).length;return passend.sort((a,b)=>treffer(b)-treffer(a))[0].id}}
  const gezaehlt=new Map();for(const d of erg.daten)for(const t of d.treffer)gezaehlt.set(t.gruppe,(gezaehlt.get(t.gruppe)||0)+1);
  const best=[...gezaehlt.entries()].sort((a,b)=>b[1]-a[1])[0];return best?best[0]:(ordner.gruppen[0]||{}).id||"";
}
function pseudoZeilen(erg,gid){
  const out=[];let ohne=0;
  for(const d of erg.daten){const t=d.treffer.find(x=>x.gruppe===gid);if(!t){if(d.treffer.length)ohne++;continue}
    out.push({k:t.kuerzel,iso:d.iso,std:d.std,min:d.min,status:d.status,verspaetung:d.verspaetung,ft:d.ft,mein:d.mein,fach:d.fach||""})}
  out.sort((a,b)=>a.k.localeCompare(b.k,"de",{numeric:true})||a.iso.localeCompare(b.iso));return {zeilen:out,ohne};
}

/* ---------- Ampel berechnen ---------- */
function benachrichtigt(gid,k){
  const g=ordner.gruppen.find(x=>x.id===gid);const a=g&&g.akten.find(x=>x.kuerzel===k);if(!a)return "";
  const d=[...a.text.matchAll(/^\s*-?\s*(\d{4}-\d{2}-\d{2})\s*\|[^\n]*Eltern über Fehlzeiten informiert/gm)].map(x=>x[1]).sort();return d.length?d[d.length-1]:"";
}
function ampel(zeilen,gid,r,heute){
  const pro=new Map();
  for(const z of zeilen){if(!pro.has(z.k))pro.set(z.k,[]);pro.get(z.k).push(z)}
  const g=ordner.gruppen.find(x=>x.id===gid);if(g)for(const a of g.akten)if(!pro.has(a.kuerzel))pro.set(a.kuerzel,[]);
  const liste=[];
  for(const [k,l] of pro){
    const seit=r.ab==="letzte_benachrichtigung"?benachrichtigt(gid,k):r.ab==="schuljahr"?"":"";
    const zaehlt=z=>!z.verspaetung||r.verspaetung;
    let unent=l.filter(z=>z.status==="unentschuldigt"&&zaehlt(z)&&(!seit||z.iso>seit)).reduce((s,z)=>s+z.std,0);
    const ent=l.filter(z=>z.status==="entschuldigt"&&!z.verspaetung).reduce((s,z)=>s+z.std,0);
    const versp=l.filter(z=>z.verspaetung).length;
    // offene Fehlzeiten: zusammenhängende Schultage
    const tage=[...new Set(l.filter(z=>z.status==="offen"&&!z.verspaetung).map(z=>z.iso))].sort();const bloecke=[];
    for(const t of tage){const b=bloecke[bloecke.length-1];if(b&&naechsterSchultag(b.bis)>=t)b.bis=t;else bloecke.push({von:t,bis:t})}
    let offenStd=0,ueberStd=0;const fristen=[];
    for(const b of bloecke){const std=l.filter(z=>z.status==="offen"&&!z.verspaetung&&z.iso>=b.von&&z.iso<=b.bis).reduce((s,z)=>s+z.std,0);
      const ende=fristEnde(b.bis,r);const zustand=heute>ende?"abgelaufen":heute===ende?"heute":"laeuft";offenStd+=std;if(zustand==="abgelaufen")ueberStd+=std;fristen.push({...b,std,ende,zustand})}
    // Regel „nach Ablauf der Frist gilt als unentschuldigt“: überfällige offene Stunden zählen zur Schwelle
    let ausFrist=0;if(r.fristUnent){ausFrist=fristen.filter(f=>f.zustand==="abgelaufen").reduce((s,f)=>s+l.filter(z=>z.status==="offen"&&!z.verspaetung&&z.iso>=f.von&&z.iso<=f.bis&&(!seit||z.iso>seit)).reduce((a,z)=>a+z.std,0),0);unent+=ausFrist;ueberStd=0}
    const vor=r.vorwarn!=null&&unent>=r.vorwarn&&unent<r.schwelle;
    const farbe=unent>=r.schwelle?"rot":(vor||ueberStd>0||fristen.some(f=>f.zustand==="heute")||unent+ueberStd>=r.schwelle)?"gelb":"gruen";
    const schritte=[];
    if(unent>=r.schwelle)schritte.push(`Eltern informieren (${fmt(unent)} unentsch. Std.${seit?" seit "+datumDE(seit):""})`);
    const ab=fristen.filter(f=>f.zustand==="abgelaufen");if(ab.length)schritte.push(`Entschuldigung fehlt: ${ab.map(f=>tag(f)).join(", ")}`);
    const hz=fristen.filter(f=>f.zustand==="heute");if(hz.length)schritte.push(`Frist endet heute: ${hz.map(f=>tag(f)).join(", ")}`);
    const lf=fristen.filter(f=>f.zustand==="laeuft");if(lf.length)schritte.push(`Entschuldigung bis ${lf.map(f=>datumDE(f.ende)).join(", ")} (${lf.map(f=>tag(f)).join(", ")})`);
    if(farbe!=="rot"&&unent+ueberStd>=r.schwelle&&unent<r.schwelle)schritte.push("Schwelle erreicht, falls die offenen Stunden unentschuldigt bleiben");
    if(vor)schritte.push(`Vorwarnung: ${fmt(unent)} unentsch. Std. (Eltern ab ${fmt(r.schwelle)})`);
    liste.push({k,unent,ausFrist,ent,versp,offenStd,ueberStd,fristen,farbe,seit,schritte});
  }
  const rang={rot:0,gelb:1,gruen:2};
  return liste.sort((a,b)=>rang[a.farbe]-rang[b.farbe]||b.unent-a.unent||b.ueberStd-a.ueberStd||a.k.localeCompare(b.k,"de",{numeric:true}));
}
const fmt=n=>String(Math.round(n*10)/10).replace(".",",");
const tag=f=>f.von===f.bis?datumDE(f.von):`${datumDE(f.von)}–${datumDE(f.bis)}`;

/* ---------- Datei im Schülerdaten-Ordner ---------- */
const DATEI=gid=>`fehlzeiten-${gid}.tsv`;
async function standSpeichern(gid,zeilen,quelle,zeitraum){
  const root=await sdSchreib();const a=await root.getDirectoryHandle("ausgaben",{create:true});const f=await a.getDirectoryHandle("fehlzeiten",{create:true});
  const mitTage=zeilen.some(z=>z.ft!=null);const mitMein=zeilen.some(z=>z.mein!==undefined);
  const kopf=`# Fehlzeiten ${gid} · Stand ${heuteISO()} · Quelle: ${quelle}${zeitraum?" · Zeitraum "+zeitraum:""} · nur Kürzel (Startseite, Fehlzeiten-Ampel)`;
  const t=[kopf,"Kuerzel\tDatum\tFehlstd\tFehlmin\tStatus\tVerspaetung"+(mitTage?"\tFehltage":"")+(mitMein?"\tMeinUnterricht\tFach":""),...zeilen.map(z=>[z.k,z.iso,z.std,z.min,z.status,z.verspaetung?"ja":"nein",...(mitTage?[z.ft??""]:[]),...(mitMein?[z.mein===true?"ja":z.mein===false?"nein":"",z.fach||""]:[])].join("\t"))].join("\n")+"\n";
  await schreibe(f,DATEI(gid),t);
}
async function standLesen(gid){
  try{const root=sdRoot();if(!root)return null;const f=await (await root.getDirectoryHandle("ausgaben")).getDirectoryHandle("fehlzeiten");
    const t=await lies(await f.getFileHandle(DATEI(gid)));if(!t)return null;const z=t.split(/\r?\n/);
    const stand=((z[0]||"").match(/Stand (\d{4}-\d{2}-\d{2})/)||[])[1]||"";const quelle=((z[0]||"").match(/Quelle: ([^·]+)/)||[])[1]||"";const zeitraum=((z[0]||"").match(/Zeitraum ([^·]+)/)||[])[1]||"";
    const kopfS=(z[1]||"").split("\t");const sp=n=>kopfS.indexOf(n);const iFt=sp("Fehltage"),iMn=sp("MeinUnterricht"),iFa=sp("Fach");
    const zeilen=z.slice(2).filter(Boolean).map(x=>{const c=x.split("\t");const [k,iso,std,min,status,v]=c;const ft=iFt>=0?c[iFt]:null,mn=iMn>=0?c[iMn]:"";
      return {k,iso,std:zahl(std),min:zahl(min),status,verspaetung:v==="ja",ft:ft==null||ft===""?null:zahl(ft),mein:mn==="ja"?true:mn==="nein"?false:undefined,fach:iFa>=0?c[iFa]||"":""}});
    return {stand,zeitraum:zeitraum.trim(),quelle:quelle.trim(),zeilen}}catch{return null}
}

/* ---------- Helfer: Export aus WebUntis holen ---------- */
function wuRuf(op,extra){return new Promise((ok,nein)=>{const id=Math.random().toString(36).slice(2);
  const t=setTimeout(()=>{window.removeEventListener("message",h);nein(new Error("Der Schulassistenz-Helfer antwortet nicht. Ist Version 0.8 geladen? Seite neu laden (F5)."))},60000);
  function h(e){if(e.source!==window||!e.data||e.data.sa!=="wu-export-antwort"||e.data.id!==id)return;clearTimeout(t);window.removeEventListener("message",h);ok(e.data)}
  window.addEventListener("message",h);window.postMessage({sa:"wu-export",op,id,...(extra||{})},"*")})}
function kbRuf(op,extra){return new Promise((ok,nein)=>{const id=Math.random().toString(36).slice(2);
  const t=setTimeout(()=>{window.removeEventListener("message",h);nein(new Error("Der Schulassistenz-Helfer antwortet nicht. Ist Version 0.25 geladen? Seite neu laden (F5)."))},60000);
  function h(e){if(e.source!==window||!e.data||e.data.sa!=="kb-export-antwort"||e.data.id!==id)return;clearTimeout(t);window.removeEventListener("message",h);ok(e.data)}
  window.addEventListener("message",h);window.postMessage({sa:"kb-export",op,id,...(extra||{})},"*")})}
const helferAb=(a,b)=>{const v=helferVersion().split(".").map(Number);return v.length>1&&(v[0]>a||(v[0]===a&&v[1]>=b))};
// Woher kommen die Fehlzeiten? meine-einstellungen.js: klassenbuch: "webuntis" | "iserv" | "beide". Ohne Angabe: WebUntis, wenn
// eine WebUntis-Adresse eingetragen ist, sonst beide Knöpfe.
const quellen=()=>{const k=String(E.klassenbuch||"").toLowerCase();if(k==="iserv")return {wu:false,kb:true};if(k==="webuntis")return {wu:true,kb:false};
  if(k==="beide")return {wu:true,kb:true};return E.webuntis?{wu:true,kb:false}:{wu:true,kb:true}};
const iservHost=()=>{for(const v of [E.iserv,E.schuelerdaten,E.schulordner&&E.schulordner.web]){const m=String(v||"").match(/^https:\/\/[a-z0-9.-]+/i);if(m&&!/webuntis\.com$/i.test(m[0]))return m[0]}return ""};
const helferVersion=()=>document.documentElement.getAttribute("data-sa-helfer")||"";
const helferKann=()=>{const v=helferVersion().split(".").map(Number);return v.length>1&&(v[0]>0||v[1]>=8)};

/* ---------- Oberfläche ---------- */
const css=document.createElement("style");
css.textContent=`.fz-dot{display:inline-block;width:11px;height:11px;border-radius:50%;flex:none;vertical-align:-1px}
.fz-dot.rot{background:var(--err)}.fz-dot.gelb{background:var(--warn)}.fz-dot.gruen{background:var(--ok)}
.fz-sicht{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;margin:8px 0}.fz-sicht .seg{display:flex;gap:4px}
.fz-regeln{margin:6px 0 10px;border:1px solid var(--line);border-radius:10px;padding:6px 12px}.fz-regeln summary{cursor:pointer;font-weight:600;font-size:13.5px}.fz-rg{display:grid;gap:8px;margin:10px 0 4px;font-size:13.5px}.fz-rg input[type=number]{width:70px}.fz-rg input,.fz-rg select{margin:0 4px}
.fz-tab{width:100%;border-collapse:collapse;font-size:13.5px}.fz-tab th{text-align:left;font-weight:600;color:var(--muted);font-size:12px;padding:4px 6px;border-bottom:1px solid var(--line)}
.fz-tab td{padding:6px;border-bottom:1px solid var(--line);vertical-align:top}.fz-tab td.z{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.fz-tab .k{font-family:var(--f-mono);font-weight:600;white-space:nowrap}.fz-tab .nm{color:var(--muted);font-size:12.5px}
.fz-tab tr.gruen td{color:var(--muted)}.fz-tab .sch{font-size:12.5px}.fz-tab .sch div+div{margin-top:2px}
.fz-sum{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;margin:6px 0}.fz-sum span{display:inline-flex;gap:6px;align-items:center}
.fz-drop{border:1.5px dashed var(--line);border-radius:10px;padding:12px;text-align:center;font-size:13.5px;color:var(--muted)}.fz-drop.ueber{border-color:var(--accent);color:var(--ink)}
.fz-warn{border-left:4px solid var(--warn);background:var(--warn-soft);border-radius:8px;padding:8px 12px;font-size:13px;margin:8px 0}
.fz-warn ul{margin:4px 0 0;padding-left:18px;max-height:160px;overflow:auto}
.fz-side{margin-top:14px;display:grid;gap:6px}.fz-side h3{margin:0}
.fz-side button.group{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.fz-ja{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:4px}
.fz-tab-wrap{overflow-x:auto}`;
document.head.appendChild(css);
const side=document.createElement("section");side.className="fz-side";side.id="fz-side";side.hidden=true;side.setAttribute("aria-label","Fehlzeiten-Ampel");
const aside=document.querySelector("aside.side");if(aside)aside.appendChild(side);

let F=null;   // aktueller Stand im Panel: {gid, zeilen, stand, quelle, fehlend, doppelt, ohne, neu}
async function seitenleiste(){
  if(ordner.zustand!=="an"||!sdRoot()){side.hidden=true;return}
  const st=[];for(const g of ordner.gruppen){const s=await standLesen(g.id);if(s)st.push({g,s})}
  if(!st.length){side.hidden=true;return}
  const r=regeln(),heute=heuteISO();
  side.innerHTML=`<h3>Fehlzeiten</h3>`+st.map(({g,s})=>{const a=ampel(s.zeilen,g.id,r,heute);const n=f=>a.filter(x=>x.farbe===f).length;
    return `<button class="group" data-g="${esc(g.id)}"><b>${esc(g.id)}</b><span><span class="fz-dot rot"></span> ${n("rot")}</span><span><span class="fz-dot gelb"></span> ${n("gelb")}</span><span><span class="fz-dot gruen"></span> ${n("gruen")}</span><small style="flex-basis:100%">Stand ${datumDE(s.stand)}${s.stand<heute?" · neu holen?":""}</small></button>`}).join("");
  side.hidden=false;
  side.querySelectorAll("button[data-g]").forEach(b=>b.addEventListener("click",()=>zeigen(b.dataset.g)));
}

async function zeigen(gid){
  const slot=$("#panel-slot");
  if(ordner.zustand!=="an"||!sdRoot()){slot.innerHTML=`<div class="panel"><h4>Fehlzeiten-Ampel</h4><p>Dafür braucht die Seite deine Akten und Kürzellisten. Bitte unter „Lerngruppen“ zuerst den Datenordner${sdExtern()?" und den Schülerdaten-Ordner":""} verbinden.</p><div class="actions"><button class="btn ghost" id="p-close">Schließen</button></div></div>`;$("#p-close").addEventListener("click",()=>slot.innerHTML="");return}
  if(!F||(gid&&F.gid!==gid)){const g=gid||store.get("fz-gruppe","")||((ordner.gruppen.find(x=>/^\d+[a-z]/i.test(x.id))||ordner.gruppen[0]||{}).id);
    const s=g?await standLesen(g):null;F=s?{gid:g,zeilen:s.zeilen,stand:s.stand,zeitraum:s.zeitraum,quelle:"gespeicherter Stand",herkunft:s.quelle,neu:false}:{gid:g,zeilen:null}}
  zeichnen();slot.scrollIntoView({block:"nearest",behavior:"smooth"});
}
function zeichnen(meldung){
  const slot=$("#panel-slot");const r=regeln(),heute=heuteISO();
  const namen=F.namen||{};const zeigeNamen=store.get("namen-zeigen",true);
  const gruppenOpt=ordner.gruppen.map(g=>`<option value="${esc(g.id)}"${g.id===F.gid?" selected":""}>${esc(g.id)}</option>`).join("");
  const regelText=`Regeln${r.lokal?" (eigene Werte, in diesem Browser)":r.ausProfil?" aus dem Profil":" (Standard, nicht im Profil)"}: Eltern ab ${fmt(r.schwelle)} unentschuldigten Stunden${r.ab==="letzte_benachrichtigung"?" seit der letzten Benachrichtigung":r.ab==="halbjahr"?" je Halbjahr":" im Schuljahr"}; Entschuldigung bis ${r.frist} ${r.einheit==="kalendertage"?"Kalendertage":"Schultage"} nach dem letzten Fehltag${ferien().length?"":" (Ferien und Feiertage nicht berücksichtigt, eintragbar in meine-einstellungen.js unter ferien)"}; ${r.fristUnent?"danach zählen offene Stunden als unentschuldigt; ":""}Verspätungen zählen ${r.verspaetung?"":"nicht "}zur Schwelle${r.entschuldigt.length?"; als entschuldigt gilt auch: "+(r.entschuldigtText||r.entschuldigt).join(", "):""}.`;
  // Klassenleitung: alle Fächer; sonst der eigene Unterricht bzw. nur das Fach dieser Lerngruppe (braucht die WebUntis-PDF mit Lehrkraft und Fach)
  const kl=(store.get("fz-klassenleitung",[])||[]).includes(F.gid);const hatMein=!!(F.zeilen&&F.zeilen.some(z=>z.mein!==undefined));
  const meineFaecher=hatMein?[...new Set(F.zeilen.filter(z=>z.mein&&z.fach).map(z=>z.fach))].sort((a,b)=>a.localeCompare(b,"de")):[];
  const gFach=norm(((ordner.gruppen.find(g=>g.id===F.gid)||{}).gruppeText||"").match(/^fach:\s*(.+)$/mi)?.[1]||"");
  const fachPasst=f=>{const a=norm(f).split(" ")[0];return !!gFach&&a.length>=2&&(gFach.startsWith(a)||a.startsWith(gFach.split(" ")[0]))};
  const vorFach=meineFaecher.find(fachPasst);
  let sicht=hatMein?(store.get("fz-sicht-"+F.gid,null)||(kl?"alle":vorFach?"fach:"+vorFach:"mein")):"alle";
  if(sicht.startsWith("fach:")&&!meineFaecher.includes(sicht.slice(5)))sicht="mein";
  const sichtFilter=z=>sicht==="alle"?true:sicht==="mein"?z.mein:z.mein&&z.fach===sicht.slice(5);
  const sichtHTML=F.zeilen?`<div class="fz-sicht"><label class="r-skala"><input type="checkbox" id="fz-kl"${kl?" checked":""}> Meine Klasse (Klassenleitung)</label>${hatMein?`<div class="seg" role="group" aria-label="Welche Fehlzeiten zählen"><button class="btn small${sicht==="alle"?" primary":" ghost"}" data-sicht="alle">Alle Fächer</button><button class="btn small${sicht==="mein"?" primary":" ghost"}" data-sicht="mein">Mein Unterricht${F.ich?" ("+esc(F.ich)+")":""}</button>${meineFaecher.length>1?`<label class="r-skala">nur <select id="fz-fach"><option value="">Fach wählen</option>${meineFaecher.map(f=>`<option${sicht==="fach:"+f?" selected":""}>${esc(f)}</option>`).join("")}</select></label>`:""}</div>`:`<span class="note">Für die Trennung nach Fach die WebUntis-PDF „Fehlzeiten pro Schüler*in“ hochladen (sie enthält Fach und Lehrkraft je Stunde).</span>`}</div>
    ${hatMein?`<p class="note fz-sicht-info">${sicht==="alle"?"Gezählt werden alle Fehlstunden in allen Fächern (Sicht der Klassenleitung).":sicht==="mein"?`Gezählt werden nur Stunden, in denen ${esc(F.ich||"du")} als Lehrkraft eingetragen ist.`:`Gezählt werden nur deine Stunden im Fach ${esc(sicht.slice(5))}.`}</p>`:""}`:"";
  let tabelle="",sum="";
  if(F.zeilen){
    const a=ampel(F.zeilen.filter(sichtFilter),F.gid,r,heute);F.ampel=a;const n=f=>a.filter(x=>x.farbe===f).length;
    sum=`<div class="fz-sum"><span><span class="fz-dot rot"></span><b>${n("rot")}</b> Eltern informieren</span><span><span class="fz-dot gelb"></span><b>${n("gelb")}</b> Entschuldigung fällig oder Schwelle droht</span><span><span class="fz-dot gruen"></span><b>${n("gruen")}</b> ohne Handlungsbedarf</span>${F.stand?`<span class="note">Stand ${datumDE(F.stand)}${F.zeitraum?" · "+esc(F.zeitraum):""}</span>`:""}</div>`;
    tabelle=`<div class="fz-tab-wrap"><table class="fz-tab"><thead><tr><th></th><th>Kürzel</th><th style="text-align:right">unentsch.</th><th style="text-align:right">offen</th><th style="text-align:right">entsch.</th><th style="text-align:right">zu spät</th><th>Nächster Schritt</th></tr></thead><tbody>${a.map(x=>{
      const nm=zeigeNamen&&namen[x.k]?`<div class="nm">${esc([namen[x.k].vor,namen[x.k].nach].filter(Boolean).join(" "))}</div>`:"";
      return `<tr class="${x.farbe}"><td><span class="fz-dot ${x.farbe}" title="${x.farbe==="rot"?"rot":x.farbe==="gelb"?"gelb":"grün"}"></span></td><td><span class="k">${esc(x.k)}</span>${nm}</td><td class="z">${fmt(x.unent)}${x.ausFrist?`<div class="nm">davon ${fmt(x.ausFrist)} Frist abgelaufen</div>`:""}${x.seit?`<div class="nm">seit ${datumDE(x.seit)}</div>`:""}</td><td class="z">${fmt(x.offenStd)}${x.ueberStd?`<div class="nm">${fmt(x.ueberStd)} überfällig</div>`:""}</td><td class="z">${fmt(x.ent)}</td><td class="z">${x.versp||""}</td><td class="sch">${x.schritte.map(s=>`<div>${esc(s)}</div>`).join("")}${x.unent>0||x.farbe==="rot"?`<div><button class="linkbtn" data-inf="${esc(x.k)}">Eltern informiert …</button></div><div class="fz-ja" data-ja="${esc(x.k)}" hidden></div>`:""}</td></tr>`}).join("")}</tbody></table></div>`;
  }
  const fehl=F.fehlend&&F.fehlend.size?`<div class="fz-warn"><b>${F.fehlend.size===1?"1 Name steht":F.fehlend.size+" Namen stehen"} in keiner Kürzelliste.</b> Ihre Zeilen werden nicht gespeichert und nicht ausgewertet. Trag sie in die Kürzelliste ein (Lerngruppe › Akten › „Kürzel hinzufügen“) und lies die Datei noch einmal ein. Die Namen siehst nur du in diesem Fenster:<ul>${[...F.fehlend.entries()].map(([n,c])=>{const a=(F.aehnlich&&F.aehnlich.get(n))||[];return `<li>${esc(n)} (${c} Zeilen)${a.length?` · ähnlich in der Kürzelliste: ${a.map(e=>`${esc(e.kuerzel)} ${esc(e.anzeige)} (${esc(e.gruppe)})`).join(", ")}. Steht dort der Name anders geschrieben oder fehlt der Nachname?`:""}</li>`}).join("")}</ul></div>`:"";
  const kurz=F.neu&&F.datenVon&&F.datenVon>plusTage(schuljahrBeginn(),45)?`<div class="fz-warn"><b>Die Datei enthält erst Fehlzeiten ab ${datumDE(F.datenVon)}.</b> Ist beim Export als Zeitraum das ganze Schuljahr eingestellt (WebUntis: „Aktuelles Schuljahr“, IServ-Klassenbuch: „Von“ = erster Schultag)? Kinder ohne Fehlzeiten haben im IServ-Klassenbuch keine Zeilen, das ist in Ordnung. Für die Elternschwelle braucht die Ampel alle Fehlzeiten seit Schuljahresbeginn bzw. seit der letzten Benachrichtigung.</div>`:"";
  const klasseHinweis=F.neu&&F.klassen&&F.klassen.length===1&&!F.gid.toLowerCase().startsWith(F.klassen[0].toLowerCase())?`<div class="fz-warn">Die Datei ist für die Klasse ${esc(F.klassen[0])}, angezeigt wird ${esc(F.gid)}. Oben unter „Lerngruppe“ kannst du wechseln.</div>`:"";
  const si=F.neu&&F.statusInfo;const statusWarn=si&&!si.erkannt?`<div class="fz-warn"><b>In der Datei ist bei keiner Fehlzeit „entschuldigt“ oder „unentschuldigt“ erkennbar.</b> Deshalb steht alles unter „offen“. ${si.spalte?`Gelesen wurde die Spalte „${esc(si.spalte)}“ mit den Werten ${si.werte.map(([w,n])=>`„${esc(w)}“ (${n})`).join(", ")}.`:"Eine Status-Spalte wurde nicht gefunden."} Spalten in der Datei: ${si.kopf.map(esc).join(" · ")}. Schick Claude bitte ein Bildschirmfoto dieses Hinweises (enthält keine Namen).</div>`:"";
  const ohne=F.ohne?`<div class="fz-warn">${F.ohne} Zeilen gehören zu Kindern aus anderen Lerngruppen und sind hier nicht enthalten. Andere Lerngruppe wählen, um sie zu sehen.</div>`:"";
  const q=quellen();
  const helfer=(helferKann()&&q.wu?`<button class="btn primary" id="fz-holen">Aus WebUntis holen</button>`:"")+(helferAb(0,25)&&q.kb?`<button class="btn ${helferKann()&&q.wu?"ghost":"primary"}" id="fz-kb">Aus dem IServ-Klassenbuch holen</button>`:"");
  const hinw=F.neu&&F.hinweise&&F.hinweise.length?`<div class="fz-warn">${F.hinweise.map(esc).join("<br>")}</div>`:"";
  slot.innerHTML=`<div class="panel" role="region" aria-label="Fehlzeiten-Ampel"><div class="p-kopf"><h4>Fehlzeiten-Ampel</h4><span class="sp"></span><label class="r-skala">Lerngruppe <select id="fz-gruppe">${gruppenOpt}</select></label><label class="r-skala"><input type="checkbox" id="fz-namen"${zeigeNamen?" checked":""}> Namen zeigen</label></div>
    <div class="actions" style="margin-top:0">${helfer}<label class="btn ${helfer?"ghost":"primary"}">Export-Datei(en) wählen<input type="file" id="fz-datei" accept=".xls,.xlsx,.csv,.txt,.tsv,.htm,.html,.pdf" multiple hidden></label><span class="toast" id="fz-toast">${esc(meldung||"")}</span></div>
    <div class="fz-drop" id="fz-drop">Export „Abwesenheiten“ aus WebUntis (auch die PDF „Fehlzeiten pro Schüler*in“) oder dem IServ-Klassenbuch hierher ziehen (.pdf, .xls, .xlsx oder .csv, auch mehrere Dateien auf einmal, z. B. eine je Kind). Die Dateien werden nur in diesem Fenster gelesen.</div>
    <p class="guard" id="fz-guard" hidden></p>
    <div id="fz-lernen"></div>
    ${hinw}${kurz}${klasseHinweis}${statusWarn}${fehl}${ohne}${sichtHTML}${sum}<details class="fz-regeln"${store.get("fz-regeln-offen",false)?" open":""}><summary>Schwellen anpassen${r.lokal?" (eigene Werte aktiv)":""}</summary>
      <div class="fz-rg">
        <label>Eltern informieren ab <input type="number" id="fzr-schwelle" min="1" step="0.5" value="${esc(r.schwelle)}"> unentsch. Std.</label>
        <label>Vorwarnung (gelb) ab <input type="number" id="fzr-vorwarn" min="1" step="0.5" value="${r.vorwarn!=null?esc(r.vorwarn):""}" placeholder="aus"> unentsch. Std.</label>
        <label>Stunden zählen <select id="fzr-ab"><option value="letzte_benachrichtigung"${r.ab==="letzte_benachrichtigung"?" selected":""}>seit der letzten Benachrichtigung</option><option value="schuljahr"${r.ab!=="letzte_benachrichtigung"?" selected":""}>im ganzen Schuljahr</option></select></label>
        <label>Entschuldigung bis <input type="number" id="fzr-frist" min="0" step="1" value="${esc(r.frist)}"> <select id="fzr-einheit"><option value="schultage"${r.einheit!=="kalendertage"?" selected":""}>Schultage</option><option value="kalendertage"${r.einheit==="kalendertage"?" selected":""}>Kalendertage</option></select> nach dem letzten Fehltag</label>
        <label><input type="checkbox" id="fzr-frist-unent"${r.fristUnent?" checked":""}> Nach Ablauf der Frist zählen offene Stunden als unentschuldigt</label>
        <label><input type="checkbox" id="fzr-versp"${r.verspaetung?" checked":""}> Verspätungen zählen zur Schwelle</label>
      </div>
      <div class="actions"><button class="btn primary small" id="fzr-ok">Übernehmen</button>${r.lokal?`<button class="btn ghost small" id="fzr-weg">Zurück auf ${r.ausProfil?"Profil":"Standard"} (${fmt(r.profil.schwelle)} Std., ${r.profil.frist} ${r.profil.einheit==="kalendertage"?"Kalendertage":"Schultage"})</button>`:""}</div>
      <p class="note">Gilt sofort für alle Lerngruppen und nur in diesem Browser. Dauerhaft für Claude steht die Regel in deinem Profil (regeln.fehlzeiten).</p>
    </details>${tabelle}
    <div id="fz-akte"></div>${vermerkeHTML()}
    ${F.zeilen?"":`<p class="note">Für ${esc(F.gid||"diese Lerngruppe")} ist noch kein Stand gespeichert.</p>`}
    <p class="note">${esc(regelText)}</p>
    <p class="note">Datenschutz: Gespeichert und an Claude gegeben werden nur Kürzel, Datum, Stunden und Status, bei der WebUntis-PDF auch das Fach und ob es deine Stunde war. Namen, Externe Id bzw. Schüler-ID, Abwesenheitsgründe, Texte, Kürzel anderer Lehrkräfte und „Verp. Unterricht“ werden verworfen. Ablage: ${esc(sdPfad("ausgaben/fehlzeiten/"+DATEI(F.gid||"<gruppe>")))}.</p>
    <div class="actions">${F.zeilen&&F.neu?`<button class="btn primary" id="fz-speichern">Stand speichern</button>`:""}${F.zeilen&&F.zeilen.length?`<button class="btn ghost" id="fz-akten" title="Je Kind eine Zeile mit den ganzen Fehltagen in die Akte (Bereich Termine)">In die Akten übernehmen …</button>`:""}${F.zeilen?`<button class="btn ghost" id="fz-claude">Mit Claude abgleichen</button>`:""}<button class="btn ghost" id="p-close">Schließen</button></div></div>`;
  $("#p-close").addEventListener("click",()=>{slot.innerHTML=""});
  $("#fz-namen").addEventListener("change",e=>{store.set("namen-zeigen",e.target.checked);zeichnen()});
  if($("#fz-kl"))$("#fz-kl").addEventListener("change",e=>{const l=(store.get("fz-klassenleitung",[])||[]).filter(x=>x!==F.gid);if(e.target.checked)l.push(F.gid);store.set("fz-klassenleitung",l);store.set("fz-sicht-"+F.gid,null);
    zeichnen(e.target.checked?`${F.gid} ist als deine Klasse markiert: Es zählen alle Fächer.`:"")});
  slot.querySelectorAll("[data-sicht]").forEach(b=>b.addEventListener("click",()=>{store.set("fz-sicht-"+F.gid,b.dataset.sicht);zeichnen()}));
  if($("#fz-fach"))$("#fz-fach").addEventListener("change",e=>{store.set("fz-sicht-"+F.gid,e.target.value?"fach:"+e.target.value:"mein");zeichnen()});
  slot.querySelector(".fz-regeln").addEventListener("toggle",e=>store.set("fz-regeln-offen",e.target.open));
  $("#fzr-ok").addEventListener("click",()=>{const zahl=id=>{const v=parseFloat(String($(id).value).replace(",","."));return isNaN(v)?null:v};
    const schwelle=zahl("#fzr-schwelle"),vorwarn=zahl("#fzr-vorwarn"),frist=zahl("#fzr-frist");
    if(!(schwelle>0)){$("#fz-toast").textContent="Bitte eine Schwelle über 0 eintragen.";return}
    if(vorwarn!=null&&vorwarn>=schwelle){$("#fz-toast").textContent="Die Vorwarnung muss kleiner als die Schwelle sein.";return}
    store.set("fz-regeln",{schwelle,vorwarn,frist:frist==null?null:Math.max(0,Math.round(frist)),einheit:$("#fzr-einheit").value,ab:$("#fzr-ab").value,verspaetung:$("#fzr-versp").checked,fristUnent:$("#fzr-frist-unent").checked});
    zeichnen("Schwellen übernommen.")});
  if($("#fzr-weg"))$("#fzr-weg").addEventListener("click",()=>{store.set("fz-regeln",null);zeichnen("Wieder die Werte aus dem "+(regeln().ausProfil?"Profil":"Standard")+".")});
  $("#fz-gruppe").addEventListener("change",async e=>{const g=e.target.value;store.set("fz-gruppe",g);
    if(F.roh&&F.roh.daten.length){const p=pseudoZeilen(F.roh,g);F={...F,gid:g,zeilen:p.zeilen,ohne:p.ohne,vermerke:vermerkeFuer(F.roh,g),namen:await namenLesen(g)};}
    else if(F.roh){const st=await standLesen(g);F={...F,gid:g,zeilen:st?st.zeilen:null,stand:st&&st.stand,zeitraum:st&&st.zeitraum,herkunft:st&&st.quelle,vermerke:vermerkeFuer(F.roh,g),namen:await namenLesen(g)}}
    else{const s=await standLesen(g);F=s?{gid:g,zeilen:s.zeilen,stand:s.stand,zeitraum:s.zeitraum,quelle:"gespeicherter Stand",herkunft:s.quelle,neu:false,namen:await namenLesen(g)}:{gid:g,zeilen:null}}
    zeichnen()});
  const ausListe=l=>[...l].map(f=>({buf:f.arrayBuffer(),name:f.name}));
  const datei=$("#fz-datei");datei.addEventListener("change",()=>{if(datei.files.length)einlesen(ausListe(datei.files),datei.files.length===1?"Datei "+datei.files[0].name:datei.files.length+" Dateien")});
  const drop=$("#fz-drop");["dragenter","dragover"].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.add("ueber")}));
  ["dragleave","drop"].forEach(t=>drop.addEventListener(t,()=>drop.classList.remove("ueber")));
  drop.addEventListener("drop",e=>{e.preventDefault();const l=e.dataTransfer.files;if(l.length)einlesen(ausListe(l),l.length===1?"Datei "+l[0].name:l.length+" Dateien")});
  if($("#fz-holen"))$("#fz-holen").addEventListener("click",holen);
  if($("#fz-kb"))$("#fz-kb").addEventListener("click",holenIServ);
  if($("#fz-akten"))$("#fz-akten").addEventListener("click",aktenVorschau);
  vermerkeVerdrahten();
  if($("#fz-speichern"))$("#fz-speichern").addEventListener("click",speichern);
  if($("#fz-claude"))$("#fz-claude").addEventListener("click",anClaude);
  slot.querySelectorAll("[data-inf]").forEach(b=>b.addEventListener("click",()=>informiertFragen(b.dataset.inf)));
  if(!F.namen&&F.gid)namenLesen(F.gid).then(m=>{F.namen=m;if(Object.keys(m).length&&F.zeilen&&store.get("namen-zeigen",true))zeichnen(meldung)});
}
async function einlesen(bufP,quelle,zeitraum){
  const g=$("#fz-guard");g.hidden=true;$("#fz-toast").textContent="Lese …";
  try{const erg=await verarbeiten(Array.isArray(bufP)?bufP:[{buf:bufP,name:""}]);
    const alle=[...erg.daten,...erg.vermerke];const gid=F.gid&&alle.some(d=>d.treffer.some(t=>t.gruppe===F.gid))?F.gid:gruppeVorschlag({...erg,daten:alle});
    if(erg.vermerke.length)await namenWoerterLaden();
    if(!erg.daten.length){   // nur Vermerke: gespeicherten Fehlzeiten-Stand behalten
      const st=await standLesen(gid);
      F={...(st?{gid,zeilen:st.zeilen,stand:st.stand,zeitraum:st.zeitraum,quelle:"gespeicherter Stand",herkunft:st.quelle,neu:false}:{gid,zeilen:null}),
        roh:erg,vermerke:vermerkeFuer(erg,gid),fehlend:erg.fehlend,aehnlich:erg.aehnlich,hinweise:erg.hinweise,namen:await namenLesen(gid)};
      zeichnen(`${erg.vermerke.length} Vermerke gelesen. Unten auswählen, was in die Akten soll.`);return}
    const p=pseudoZeilen(erg,gid);
    const tage=erg.daten.map(d=>d.iso).sort();const daten=`${datumDE(tage[0])}–${datumDE(tage[tage.length-1])}`;
    F={gid,roh:erg,zeilen:p.zeilen,ohne:p.ohne,hinweise:erg.hinweise,herkunft:erg.herkunft,fehlend:erg.fehlend,aehnlich:erg.aehnlich,doppelt:erg.doppelt,stand:heuteISO(),zeitraum:zeitraum||("Fehlzeiten vom "+daten),datenVon:tage[0],quelle,neu:true,namen:await namenLesen(gid),klassen:[...erg.klassen.keys()],statusInfo:erg.statusInfo,ich:erg.ich,vermerke:vermerkeFuer(erg,gid)};
    zeichnen(`${erg.daten.length} Zeilen${erg.vermerke.length?" und "+erg.vermerke.length+" Vermerke":""}${erg.dateien>1?" aus "+erg.dateien+" Dateien":""} gelesen. Noch nicht gespeichert.`)}
  catch(e){$("#fz-toast").textContent="";g.hidden=false;g.textContent=(e.message||String(e))+(F.antwortNeu?" ("+F.antwortNeu+")":"");F.antwortNeu=""}
}
let wartenTimer=null;
function wartenEnde(){if(wartenTimer){clearInterval(wartenTimer);wartenTimer=null}const l=$("#fz-lernen");if(l)l.innerHTML=""}
async function holen(){
  const g=$("#fz-guard");g.hidden=true;const t=$("#fz-toast");
  t.textContent="Frage WebUntis …";
  let a=null;try{a=await wuRuf("holen",{von:schuljahrBeginn(),bis:heuteISO()})}catch(e){a={ok:false,fehler:e.message}}
  t.textContent="";
  if(a&&a.ok){const buf=davBuf(a.daten);F.antwortNeu=`Antwort von WebUntis: ${a.typ||"ohne Typ"}, ${buf.byteLength} Bytes`;return einlesen(Promise.resolve(buf),"WebUntis über den Helfer","")}
  if(a&&a.anmelden){g.hidden=false;g.textContent=a.fehler;return}
  if(a&&!a.lernen){g.hidden=false;g.textContent=(a.fehler||"WebUntis hat nicht geantwortet.")+" Jetzt über den WebUntis-Tab:"}
  return holenUeberTab();
}
async function holenUeberTab(){
  const g=$("#fz-guard");
  try{const host=(String(E.webuntis||"").match(/^https:\/\/[a-z0-9.-]+\.webuntis\.com/i)||[])[0]||"";
    const a=await wuRuf("warten",{host});if(!a.ok)throw new Error(a.fehler||"Der Helfer antwortet nicht.");
    const box=$("#fz-lernen");
    box.innerHTML=`<div class="fz-warn"><b>${a.geoeffnet?"WebUntis ist in einem neuen Tab geöffnet.":"Öffne jetzt WebUntis."}</b> ${a.seite?"":"Geh dort zu Klassenbuch › Berichte (Abwesenheiten). "}Wähle Klasse bzw. Kurs und als Zeitraum <b>Aktuelles Schuljahr</b>, dann bei <b>Fehlzeiten pro Schüler*in</b> („pro Stunde“) auf das <b>CSV</b>- oder <b>Excel</b>-Symbol klicken.<br>Der Helfer übernimmt die Datei direkt hierher. Sie landet nicht im Download-Ordner. Er wartet 10 Minuten. Dabei merkt er sich die Anfrage, ab dann holt „Aus WebUntis holen“ den Bericht ohne diesen Schritt. <span id="fz-wstat"></span> <button class="btn small ghost" id="fz-wab">Abbrechen</button></div>`;
    $("#fz-wab").addEventListener("click",()=>{wuRuf("abbrechen").catch(()=>{});wartenEnde()});
    const start=Date.now();if(wartenTimer)clearInterval(wartenTimer);
    wartenTimer=setInterval(async()=>{
      if(!document.body.contains(box)||Date.now()-start>10*6e4){wartenEnde();return}
      let r;try{r=await wuRuf("abholen")}catch{return}
      if(!r.ok){wartenEnde();g.hidden=false;g.textContent=r.fehler||"Abholen hat nicht geklappt.";return}
      if(r.hinweis==="pdf"){const w=$("#fz-wstat");if(w)w.innerHTML="<b>Das war die PDF. Bitte das CSV- oder Excel-Symbol nehmen.</b>";return}
      if(r.fertig){wartenEnde();const buf=davBuf(r.daten);F.antwortNeu=`Antwort von WebUntis: ${r.typ||"ohne Typ"}, ${buf.byteLength} Bytes`;await einlesen(Promise.resolve(buf),"WebUntis über den Helfer","");return}
      if(!r.wartet)wartenEnde();
    },1500);
  }catch(e){g.hidden=false;g.textContent=e.message||String(e)}
}
/* ---------- IServ-Klassenbuch über den Helfer (ab 0.25) ---------- */
let kbDateien=[];
async function holenIServ(){
  const g=$("#fz-guard");g.hidden=true;
  try{const a=await kbRuf("warten",{host:iservHost()});if(!a.ok)throw new Error(a.fehler||"Der Helfer antwortet nicht.");
    kbDateien=[];const box=$("#fz-lernen");
    box.innerHTML=`<div class="fz-warn"><b>${a.geoeffnet?"Das IServ-Klassenbuch ist in einem neuen Tab geöffnet.":"Öffne jetzt in IServ das Modul Klassenbuch."}</b> Dort <b>Statistik › Abwesenheiten</b> wählen, oben Klasse bzw. Gruppe und als Zeitraum das ganze Schuljahr einstellen, dann rechts über der Liste auf das Download-Symbol und <b>Excel</b> oder <b>CSV</b> klicken. Exportierst du je Kind eine Datei, einfach alle nacheinander (oder alle angehakt) exportieren. Vermerke gehen genauso: Statistik › Vermerke › Download.<br>Der Helfer übernimmt die Dateien direkt hierher, sie landen nicht im Download-Ordner. Er wartet 10 Minuten. <span id="fz-wstat"></span> <button class="btn small ghost" id="fz-wab">Fertig</button></div>`;
    $("#fz-wab").addEventListener("click",()=>{kbRuf("abbrechen").catch(()=>{});wartenEnde()});
    const start=Date.now();if(wartenTimer)clearInterval(wartenTimer);
    wartenTimer=setInterval(async()=>{
      if(!document.body.contains(box)||Date.now()-start>30*6e4){kbRuf("abbrechen").catch(()=>{});wartenEnde();return}
      let r;try{r=await kbRuf("abholen")}catch{return}
      if(!r.ok){const w=$("#fz-wstat");if(w)w.innerHTML="<b>"+esc(r.fehler||"Abholen hat nicht geklappt.")+"</b>";if(!r.wartet&&wartenTimer){clearInterval(wartenTimer);wartenTimer=null}return}
      if(r.fertig&&r.dateien&&r.dateien.length){
        for(const d of r.dateien)kbDateien.push({buf:Promise.resolve(davBuf(d.daten)),name:d.name||""});
        const w=$("#fz-wstat");if(w)w.innerHTML=`<b>${kbDateien.length} ${kbDateien.length===1?"Datei":"Dateien"} übernommen.</b> Weitere exportieren oder „Fertig“.`;
        await einlesen(kbDateien.slice(),"IServ-Klassenbuch über den Helfer","");
        const w2=$("#fz-wstat");if(w2)w2.innerHTML=`<b>${kbDateien.length} ${kbDateien.length===1?"Datei":"Dateien"} übernommen.</b> Weitere exportieren oder „Fertig“.`;return}
      if(!r.wartet)wartenEnde();
    },1500);
  }catch(e){g.hidden=false;g.textContent=e.message||String(e)}
}

/* ---------- Summen in die Akten (Bereich Termine, je Kind eine Zeile, nach Bestätigung) ---------- */
function aktenSummen(){
  const pro=new Map();
  for(const z of F.zeilen){if(!pro.has(z.k))pro.set(z.k,[]);pro.get(z.k).push(z)}
  const g=ordner.gruppen.find(x=>x.id===F.gid);const daten=F.zeilen.map(z=>z.iso).sort();
  const von=F.datenVon||daten[0],bis=F.stand||heuteISO();const out=[];
  // Nur ganze Fehltage (Pauls Regel). IServ liefert sie als Spalte „Fehltage“. Ohne diese Spalte (WebUntis) gilt ein Tag als ganz,
  // wenn das Kind an dem Tag so viele Stunden fehlt wie das Kind mit den meisten Fehlstunden an diesem Tag (mindestens 4).
  const tagStd=new Map();for(const z of F.zeilen)if(!z.verspaetung){const key=z.k+"|"+z.iso;tagStd.set(key,(tagStd.get(key)||0)+z.std)}
  const tagMax=new Map();for(const [key,n] of tagStd){const iso=key.split("|")[1];tagMax.set(iso,Math.max(tagMax.get(iso)||0,n))}
  for(const [k,l] of pro){
    const mitFt=l.some(z=>z.ft!=null);const tage={unentschuldigt:0,entschuldigt:0,offen:0};
    if(mitFt)for(const z of l)tage[z.status]+=(z.ft||0);
    else{const proTag=new Map();for(const z of l)if(!z.verspaetung){if(!proTag.has(z.iso))proTag.set(z.iso,{std:0,st:{}});const t=proTag.get(z.iso);t.std+=z.std;t.st[z.status]=(t.st[z.status]||0)+z.std}
      for(const [iso,t] of proTag){const max=tagMax.get(iso)||0;if(max>=4&&t.std>=max){const st=Object.entries(t.st).sort((a,b)=>b[1]-a[1])[0][0];tage[st]++}}}
    const ganz=tage.unentschuldigt+tage.entschuldigt+tage.offen;if(!ganz)continue;
    const det=Object.entries(tage).filter(x=>x[1]).map(x=>`${x[0]} ${fmt(x[1])}`);
    const inhalt=`Fehlzeiten-Stand ${datumDE(bis)} (seit ${datumDE(von)}): ${fmt(ganz)} ${ganz===1?"ganzer Fehltag":"ganze Fehltage"}${det.length?" ("+det.join(", ")+")":""}`;
    const hk=F.herkunft||F.quelle||"";const zeile=`- ${bis} | Beleg | ${inhalt} | Quelle: ${/iserv/i.test(hk)?"IServ-Klassenbuch":/webuntis/i.test(hk)?"WebUntis":"Fehlzeiten-Export"} (Startseite, Fehlzeiten) | bestätigt`;
    const akte=g&&g.akten.find(a=>a.kuerzel===k);const schon=akte&&akte.text.includes(`| ${inhalt} |`);
    out.push({k,zeile,inhalt,akte:!!akte,schon});
  }
  return out.sort((a,b)=>a.k.localeCompare(b.k,"de",{numeric:true}));
}
function aktenVorschau(){
  const box=$("#fz-akte");if(!box)return;const l=aktenSummen();const neu=l.filter(x=>x.akte&&!x.schon);
  box.innerHTML=`<div class="fz-warn" style="border-left-color:var(--accent);background:transparent;border:1px solid var(--line);border-left-width:4px"><b>In die Akten übernehmen (Bereich Termine)</b><br>Je Kind eine Zeile mit der Zahl der ganzen Fehltage (einzelne Stunden und Verspätungen zählen nicht), keine Daten und keine Gründe. Kinder ohne ganzen Fehltag bekommen keine Zeile.${F.neu?" Der Stand ist noch nicht gespeichert; die Akten-Zeile entsteht trotzdem aus den gelesenen Zahlen.":""}
    <ul>${l.map(x=>`<li><span class="k" style="font-family:var(--f-mono);font-weight:600">${esc(x.k)}</span> ${esc(x.inhalt)}${!x.akte?" <i>(keine Akte, wird übersprungen)</i>":x.schon?" <i>(steht schon in der Akte)</i>":""}</li>`).join("")}</ul>
    <div class="fz-ja"><button class="btn small primary" id="fz-akte-ok"${neu.length?"":" disabled"}>${neu.length} ${neu.length===1?"Akte":"Akten"} ergänzen</button><button class="btn small ghost" id="fz-akte-ab">Abbrechen</button></div></div>`;
  $("#fz-akte-ab").addEventListener("click",()=>{box.innerHTML=""});
  $("#fz-akte-ok").addEventListener("click",async()=>{const g=$("#fz-guard");
    try{const sd=await sdSchreib();const gd=await (await sd.getDirectoryHandle("lerngruppen")).getDirectoryHandle(F.gid);let n=0;
      for(const x of neu){const fh=await gd.getFileHandle(x.k+".md");let t=await (await fh.getFile()).text();if(t.includes(`| ${x.inhalt} |`))continue;
        t=abschnittErgaenzen(t,"Termine",x.zeile);const w=await fh.createWritable();await w.write(t);await w.close();n++}
      await ordnerLesen(ordnerHandle);renderOrdner();box.innerHTML="";zeichnen(`${n} ${n===1?"Akte":"Akten"} ergänzt (Bereich Termine).`)}
    catch(e){g.hidden=false;g.textContent=(e&&e.message)||"Eintragen hat nicht geklappt."}});
}
/* ---------- Vermerke (IServ-Klassenbuch) in die Akten ---------- */
function vermerkeFuer(erg,gid){
  return (erg.vermerke||[]).map(v=>{const t=v.treffer.find(x=>x.gruppe===gid);if(!t)return null;const text=textPseudo(v.text),art=textPseudo(v.art);
    return {k:t.kuerzel,iso:v.iso,art,text,fach:v.fach||"",wertung:v.wertung||"",verdacht:nameRest(text),an:true}}).filter(Boolean)
    .sort((a,b)=>a.k.localeCompare(b.k,"de",{numeric:true})||a.iso.localeCompare(b.iso));
}
const vInhalt=v=>{const t=!v.art?v.text:!v.text||v.text.toLowerCase().includes(v.art.toLowerCase())?(v.text||v.art):`${v.art}: ${v.text}`;return v.fach?`${v.fach} – ${t}`:t};
function vermerkZeilen(modus){
  const an=(F.vermerke||[]).filter(v=>v.an&&vInhalt(v));const out=[];
  if(modus==="einzeln"){for(const v of an)out.push({k:v.k,inhalt:`Vermerk im Klassenbuch${v.wertung?" ("+v.wertung+")":""}: ${vInhalt(v)}`,datum:v.iso});return out}
  const pro=new Map();for(const v of an){if(!pro.has(v.k))pro.set(v.k,[]);pro.get(v.k).push(v)}
  for(const [k,l] of pro){const zaehl=new Map();for(const v of l){const x=vInhalt(v);zaehl.set(x,(zaehl.get(x)||0)+1)}
    const d=l.map(v=>v.iso).sort();
    const wz=["negativ","neutral","positiv"].map(w=>[w,l.filter(v=>v.wertung===w).length]).filter(x=>x[1]);
    const kopfW=`${l.length} ${l.length===1?"Vermerk":"Vermerke"}${wz.length?" ("+wz.map(([w,n])=>`${n} ${w}`).join(", ")+")":""}`;
    out.push({k,datum:heuteISO(),inhalt:`${kopfW} im Klassenbuch ${d[0]===d[d.length-1]?datumDE(d[0]):datumDE(d[0])+"–"+datumDE(d[d.length-1])}: ${[...zaehl].map(([x,n])=>n>1?`${x} (${n}×)`:x).join("; ")}`})}
  return out;
}
function vermerkeHTML(){
  const V=F.vermerke;if(!V||!V.length)return "";const modus=store.get("fz-vermerk-modus","zusammen");
  const pro=new Map();V.forEach((v,i)=>{if(!pro.has(v.k))pro.set(v.k,[]);pro.get(v.k).push([v,i])});
  const verd=V.filter(v=>v.an&&v.verdacht).length;
  return `<div class="fz-vm"><h4 style="margin:14px 0 4px">Vermerke aus dem Klassenbuch (${V.length})</h4>
    <p class="note" style="margin:0 0 6px">Namen in den Texten sind schon durch Kürzel ersetzt. Du kannst jeden Text noch ändern oder abwählen. Das Fach steht vorn; Lehrkräfte und Stunden werden nicht übernommen.</p>
    ${verd?`<div class="fz-warn"><b>${verd===1?"1 Text enthält":verd+" Texte enthalten"} vielleicht noch einen Namen</b> (gelb markiert). Bitte prüfen und ändern, bevor du sie übernimmst.</div>`:""}
    <div class="fz-tab-wrap"><table class="fz-tab"><thead><tr><th></th><th>Kürzel</th><th>Datum</th><th>Vermerk</th></tr></thead><tbody>${[...pro].map(([k,l])=>l.map(([v,i],j)=>`<tr><td><input type="checkbox" data-vm-an="${i}"${v.an?" checked":""} aria-label="übernehmen"></td><td>${j?"":`<span class="k">${esc(k)}</span>`}</td><td class="z" style="text-align:left">${datumDE(v.iso)}${v.wertung?`<div class="nm">${esc(v.wertung)}</div>`:""}</td><td><input type="text" data-vm-t="${i}" value="${esc(vInhalt(v))}" style="width:100%;${v.verdacht?"outline:2px solid var(--warn)":""}"></td></tr>`).join("")).join("")}</tbody></table></div>
    <div class="fz-ja" style="margin-top:6px"><label class="r-skala"><input type="radio" name="fz-vm-modus" value="zusammen"${modus!=="einzeln"?" checked":""}> je Kind eine Zeile (mit Anzahl)</label><label class="r-skala"><input type="radio" name="fz-vm-modus" value="einzeln"${modus==="einzeln"?" checked":""}> jeder Vermerk eine Zeile</label>
    <button class="btn small primary" id="fz-vm-ok">Ausgewählte in die Akten</button></div>
    <p class="note">Ziel: Bereich „Arbeits- und Sozialverhalten“ der Akte, als Beleg mit Quelle IServ-Klassenbuch. Was schon in der Akte steht, wird nicht doppelt geschrieben.</p></div>`;
}
function vermerkeVerdrahten(){
  const slot=$("#panel-slot");if(!slot||!F.vermerke)return;
  slot.querySelectorAll("[data-vm-an]").forEach(c=>c.addEventListener("change",()=>{F.vermerke[+c.dataset.vmAn].an=c.checked}));
  slot.querySelectorAll("[data-vm-t]").forEach(c=>c.addEventListener("input",()=>{const v=F.vermerke[+c.dataset.vmT];v.art="";v.fach="";v.text=c.value.trim();v.verdacht=nameRest(v.text);c.style.outline=v.verdacht?"2px solid var(--warn)":""}));
  slot.querySelectorAll('[name="fz-vm-modus"]').forEach(r=>r.addEventListener("change",()=>store.set("fz-vermerk-modus",r.value)));
  const ok=$("#fz-vm-ok");if(ok)ok.addEventListener("click",vermerkeSchreiben);
}
async function vermerkeSchreiben(){
  const g=$("#fz-guard");g.hidden=true;const modus=store.get("fz-vermerk-modus","zusammen");const l=vermerkZeilen(modus);
  if(!l.length){$("#fz-toast").textContent="Kein Vermerk ausgewählt.";return}
  try{const sd=await sdSchreib();const gd=await (await sd.getDirectoryHandle("lerngruppen")).getDirectoryHandle(F.gid);let n=0,ohne=0;const akten=new Set();
    for(const x of l){let fh;try{fh=await gd.getFileHandle(x.k+".md")}catch{ohne++;continue}
      let t=await (await fh.getFile()).text();if(t.includes(`| ${x.inhalt} |`))continue;
      t=abschnittErgaenzen(t,"Arbeits- und Sozialverhalten",`- ${x.datum} | Beleg | ${x.inhalt} | Quelle: IServ-Klassenbuch (Startseite) | bestätigt`);
      const w=await fh.createWritable();await w.write(t);await w.close();n++;akten.add(x.k)}
    await ordnerLesen(ordnerHandle);renderOrdner();F.vermerke=null;
    zeichnen(`${n} ${n===1?"Eintrag":"Einträge"} in ${akten.size} ${akten.size===1?"Akte":"Akten"} geschrieben (Arbeits- und Sozialverhalten).${ohne?` ${ohne} ohne Akte übersprungen.`:""}`)}
  catch(e){g.hidden=false;g.textContent=(e&&e.message)||"Eintragen hat nicht geklappt."}
}
async function speichern(){
  const g=$("#fz-guard");g.hidden=true;
  try{await standSpeichern(F.gid,F.zeilen,(F.herkunft&&!(F.quelle||"").includes(F.herkunft)?F.herkunft+", ":"")+F.quelle,F.zeitraum);F.neu=false;F.roh=null;F.fehlend=null;F.ohne=0;await seitenleiste();zeichnen("Gespeichert (nur Kürzel). Die Ampel steht jetzt im Reiter „Fehlzeiten“ der Lerngruppe.")}
  catch(e){g.hidden=false;g.textContent=e.message||"Speichern hat nicht geklappt."}
}
function informiertFragen(k){
  const box=document.querySelector(`[data-ja="${CSS.escape(k)}"]`);if(!box)return;const x=(F.ampel||[]).find(a=>a.k===k);
  box.hidden=false;box.innerHTML=`<label class="r-skala">am <input type="date" value="${heuteISO()}" max="${heuteISO()}"></label><button class="btn small primary">In die Akte</button><button class="btn small ghost">Abbrechen</button>`;
  const [ein]=box.querySelectorAll("input"),[ok,ab]=box.querySelectorAll("button");
  ab.addEventListener("click",()=>{box.hidden=true;box.innerHTML=""});
  ok.addEventListener("click",async()=>{const d=ein.value||heuteISO();
    const bis=F.zeilen.filter(z=>z.k===k&&z.status==="unentschuldigt"&&(!z.verspaetung||regeln().verspaetung)&&(!x.seit||z.iso>x.seit)&&z.iso<=d).reduce((s,z)=>s+z.std,0);
    try{const sd=await sdSchreib();const gd=await (await sd.getDirectoryHandle("lerngruppen")).getDirectoryHandle(F.gid);const fh=await gd.getFileHandle(k+".md");
      let t=await (await fh.getFile()).text();t=abschnittErgaenzen(t,"Termine",`- ${d} | Beleg | Eltern über Fehlzeiten informiert (unentschuldigt bis dahin: ${fmt(bis)} Std.) | Quelle: Lehrkraft (Startseite, Fehlzeiten-Ampel) | bestätigt`);
      const w=await fh.createWritable();await w.write(t);await w.close();
      await ordnerLesen(ordnerHandle);renderOrdner();zeichnen(`${k}: Benachrichtigung vom ${datumDE(d)} in der Akte vermerkt. Die Schwelle zählt ab jetzt neu.`)}
    catch(e){const g=$("#fz-guard");g.hidden=false;g.textContent=(e&&e.message)||"Eintragen hat nicht geklappt."}});
}
function anClaude(){
  const a=F.ampel||[];const r=regeln();
  const z=x=>`${x.k}: unentschuldigt ${fmt(x.unent)} Std.${x.seit?" seit "+x.seit:""}, offen ${fmt(x.offenStd)} Std.${x.ueberStd?" (davon "+fmt(x.ueberStd)+" Frist abgelaufen)":""}, entschuldigt ${fmt(x.ent)} Std., Verspätungen ${x.versp}`;
  const rot=a.filter(x=>x.farbe==="rot"),gelb=a.filter(x=>x.farbe==="gelb");
  oeffne({id:"fehlzeiten-ampel",titel:"Fehlzeiten mit Claude abgleichen",typ:"claude",felder:[],auftrag:
`Fehlzeiten abgleichen (verwaltungsassistent), Lerngruppe ${F.gid}, Stand ${F.stand||heuteISO()}${F.neu?" (noch nicht gespeichert)":""}.
Datei (nur Kürzel): ${sdPfad("ausgaben/fehlzeiten/"+DATEI(F.gid))}
Ampel der Startseite nach den Regeln aus meinem Profil (Eltern ab ${fmt(r.schwelle)} unentsch. Std., Frist ${r.frist} ${r.einheit==="kalendertage"?"Kalendertage":"Schultage"}):
Rot (Eltern informieren):
${rot.map(z).join("\n")||"(niemand)"}
Gelb (Entschuldigung fällig oder Schwelle droht):
${gelb.map(z).join("\n")||"(niemand)"}
Bitte prüfe die Auswertung und sag mir, was als Nächstes zu tun ist. Entwürfe für Elternbriefe nur nach Rückfrage.`});
}

window.saFehlzeiten={zeigen,aktualisieren:()=>seitenleiste().catch(()=>{}),_test:{pdfZeilen,nameAusDatei,textPseudo,namenWoerterLaden,vermerkeFuer,aktenSummen:()=>aktenSummen(),setF:x=>{F=x},tabelleLesen,verarbeiten,ampel,regeln,fristEnde,datumISO,pseudoZeilen,cfbStream,biffZeilen}};
})();
