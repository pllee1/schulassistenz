/* schulassistenz · Konferenz-Mappe (Startseite, ab Helfer 0.40)
   Gehört zum Plugin und wird bei Updates ersetzt. Wird nach ansicht.js geladen und nutzt Funktionen der Startseite
   (ordner, sdRoot, sdSchreib, schreibe, lies, namenLesen, store, esc, $, oeffne, sdPfad, heuteISO, datumDE).

   Ablauf: In LEB-online druckt die Lehrkraft selbst die Berichte als PDF (Klassenbewertungen › Berichte:
   „Lernstandskontrolle“ für alle Schüler und „Niveaustufen“) und zieht sie hier hinein. Der Helfer ruft LEB-online
   dafür NIE auf (direkte Aufrufe melden dort ab). Die PDFs werden nur in diesem Fenster gelesen.
   Behalten werden je Kind (Name → Kürzel über die Kürzelliste der Lerngruppe): Einzelnoten mit Fach, Leistungsart,
   Datum, Gewichtung (ohne Bezeichnung) und die Kurse E/G in D, M, E, NW (aktuell und nächstes Halbjahr).
   Daraus: Fachschnitt (mündlich/fachspezifisch 60 %, schriftlich 40 %, änderbar unter konferenz.muendlich in
   meine-einstellungen.js), Abschlussprognose nach AVO-Sek I mit Begründung (Regeln aus werkzeuge/avo-regeln.js)
   und die ganzen Fehltage aus der Fehlzeiten-Ampel.
   Gespeichert wird <Schülerdaten>/ausgaben/konferenz/konferenz-<gruppe>.json und .tsv (nur Kürzel); die .tsv liest
   der Skill zeugnis-vorbereiten für die Tischvorlage. Namen, Bezeichnungen der Leistungsüberprüfungen und
   Dateinamen werden nicht gespeichert. Anfangs aus (Schalter im Reiter „Konferenz“ der Lerngruppe). */
(function(){
"use strict";

/* ---------- Text und Namen ---------- */
const norm=s=>String(s??"").normalize("NFKC").toLowerCase().replace(/[­​-‍﻿]/g,"").replace(/[‐-―−]/g,"-").replace(/\s+/g," ").trim();
const ohneAkzent=s=>String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/ß/g,"ss").replace(/æ/g,"ae").replace(/ø/g,"o").replace(/ł/g,"l");
const woerter=s=>ohneAkzent(norm(s)).replace(/\.{2,}|…/g," … ").split(/[\s,;()\-]+/).filter(Boolean);

/* Ordnet einen Namen aus dem PDF („Nachname, Vorname“, „Vorname Nachname“, auch abgeschnitten mit „...“) einem Kürzel zu.
   namen: {Kürzel: {vor, nach}}. Liefert das Kürzel oder "" (kein oder kein eindeutiger Treffer). */
function zuordnen(roh,namen){
  const w=woerter(roh);const gekuerzt=w.includes("…");const t=w.filter(x=>x!=="…");if(!t.length)return "";
  const letztes=t[t.length-1];
  const hat=x=>t.includes(x)||(gekuerzt&&letztes.length>=1&&x.startsWith(letztes));
  const treffer=[],voll=[];
  for(const [k,n] of Object.entries(namen||{})){
    const v=woerter(n.vor),na=woerter(n.nach);if(!v.length||!na.length)continue;
    if(!na.every(hat)||!hat(v[0]))continue;
    treffer.push(k);if(v.every(x=>t.includes(x))&&na.every(x=>t.includes(x)))voll.push(k);
  }
  if(treffer.length===1)return treffer[0];
  if(voll.length===1)return voll[0];
  return "";
}

/* ---------- PDF lesen ---------- */
async function pdfLib(){
  if(!window.pdfjsLib)await new Promise((ok,f)=>{const s=document.createElement("script");s.src="../lib/pdf.min.js";s.onload=ok;s.onerror=()=>f(new Error("Der PDF-Leser des Helfers fehlt. Bitte den Helfer aktualisieren."));document.head.appendChild(s)});
  pdfjsLib.GlobalWorkerOptions.workerSrc="../lib/pdf.worker.min.js";return pdfjsLib}
/* Seiten als Zeilen: [{seite, y, i:[{t,x,w}], txt}] von oben nach unten */
async function pdfZeilen(buf){
  const lib=await pdfLib();const pdf=await lib.getDocument({data:new Uint8Array(buf).slice(),isEvalSupported:false}).promise;const out=[];
  for(let p=1;p<=pdf.numPages;p++){
    const tc=await (await pdf.getPage(p)).getTextContent();
    const items=tc.items.filter(i=>i.str&&i.str.trim()).map(i=>({t:i.str.trim(),x:i.transform[4],w:i.width||0,y:i.transform[5]}));
    const zeilen=[];for(const it of items){const z=zeilen.find(z=>Math.abs(z.y-it.y)<2.5);if(z)z.i.push(it);else zeilen.push({seite:p,y:it.y,i:[it]})}
    zeilen.sort((a,b)=>b.y-a.y);for(const z of zeilen){z.i.sort((a,b)=>a.x-b.x);z.txt=z.i.map(i=>i.t).join(" ").replace(/\s+/g," ").trim();out.push(z)}
  }
  return out;
}
function artVon(zeilen){
  const alle=zeilen.map(z=>z.txt).join("\n");
  if(/Aktuell/.test(alle)&&/N(ä|ae)\.?\s*Hj/.test(alle)&&/\bDE\b/.test(alle)&&/\bMA\b/.test(alle))return "niveau";
  if(/Gewichtung/.test(alle)&&/(m(ü|ue)ndlich|schriftlich)/i.test(alle)&&/\d+-fach/.test(alle))return "lernstand";
  return "";
}

/* Lernstandskontrolle: je Kind Fach-Abschnitte mit Zeilen „mündlich/ fachspezifisch …“ bzw. „schriftlich …“ (Kopf mit Gewichtung, Note)
   und Datenzeilen „<Bezeichnung> (TT.MM.JJJJ) n-fach [Note]“. Der Name steht in der Zeile vor „(… der Schülerin / des Schülers)“. */
function lernstandLesen(zeilen){
  const kinder=[];let kind=null,fach="",art="",noteX=null,vorige=null;
  const istKopf=z=>/Gewichtung/.test(z.txt)&&/^(m(ü|ue)ndlich|schriftlich)/i.test(z.txt);
  const istDaten=z=>/\(\d{2}\.\d{2}\.\d{4}\)/.test(z.txt)&&/\d+-fach/.test(z.txt);
  for(let n=0;n<zeilen.length;n++){
    const z=zeilen[n];
    if(/Sch(ü|ue)lerin\s*\/\s*des\s+Sch(ü|ue)lers/i.test(z.txt)){
      const name=vorige&&vorige.seite===z.seite?vorige.txt:"";
      if(!kind||kind.roh!==name){kind={roh:name,noten:[]};kinder.push(kind);fach="";art=""}
      vorige=z;continue}
    if(istKopf(z)){
      art=/^schriftlich/i.test(z.txt)?"s":"m";
      const nt=z.i.find(i=>/^Note$/i.test(i.t));noteX=nt?nt.x+nt.w/2:null;
      if(vorige&&vorige.seite===z.seite&&!istKopf(vorige)&&!istDaten(vorige)&&!/Sch(ü|ue)lerin/i.test(vorige.txt))fach=vorige.txt;
      vorige=z;continue}
    if(istDaten(z)&&kind&&fach&&art){
      const d=z.txt.match(/\((\d{2})\.(\d{2})\.(\d{4})\)/);const g=z.txt.match(/(\d+)-fach/);
      let note=null;for(const it of z.i){if(!/^[1-6]$/.test(it.t))continue;const mx=it.x+it.w/2;if(noteX==null||Math.abs(mx-noteX)<25)note=+it.t}
      kind.noten.push({fach,art,datum:`${d[3]}-${d[2]}-${d[1]}`,gewicht:+g[1],note});
    }
    vorige=z;
  }
  const klasse=(zeilen.map(z=>z.txt.match(/Klasse:?\s*(\d{1,2}[a-z]?)\b/i)).find(Boolean)||[])[1]||"";
  return {kinder:kinder.filter(k=>k.noten.length||k.roh),klasse};
}

/* Niveaustufen: Kopf „DE MA EN NW E G“, darunter „Aktuell Nä. Hj“ je Fach; Zeilen „n. Nachname, Vorname  E E G G …“. */
const NIV={DE:"D",MA:"M",EN:"E",NW:"NW"};
function niveauLesen(zeilen){
  const kinder=[];let spalten=null;
  for(const z of zeilen){
    const fk=z.i.filter(i=>NIV[i.t]);
    if(fk.length>=2&&!spalten){spalten={faecher:fk.map(i=>({k:NIV[i.t],m:i.x+i.w/2})),sub:null};continue}
    if(spalten&&!spalten.sub&&/Aktuell/.test(z.txt)){
      // Teilstücke „Aktuell“ / „Nä.“ (auch „Nä. Hj“ oder „Nä.Hj“) als Spaltenmitten, je Fach ein Paar von links nach rechts
      const st=[];for(const i of z.i){if(/^Aktuell/.test(i.t))st.push({a:"a",m:i.x+Math.min(i.w,30)/2});else if(/^N(ä|ae)\.?/.test(i.t))st.push({a:"n",m:i.x+Math.min(i.w,30)/2})}
      const paare=[];for(let j=0;j+1<st.length;j++)if(st[j].a==="a"&&st[j+1].a==="n"){paare.push([st[j].m,st[j+1].m]);j++}
      const f=spalten.faecher.slice().sort((a,b)=>a.m-b.m);
      spalten.sub=[];f.forEach((x,j)=>{if(paare[j]){spalten.sub.push({k:x.k,a:"a",m:paare[j][0]});spalten.sub.push({k:x.k,a:"n",m:paare[j][1]})}});
      spalten.links=spalten.sub.length?Math.min(...spalten.sub.map(s=>s.m))-20:Infinity;continue}
    if(!spalten||!spalten.sub||!spalten.sub.length)continue;
    const m=z.txt.match(/^(\d+)\.\s*(.*)$/);if(!m)continue;
    const nameTeile=z.i.filter(i=>i.x<spalten.links).map(i=>i.t).join(" ").replace(/^\d+\.\s*/,"").trim();
    const kurse={};
    for(const i of z.i){if(i.x<spalten.links||!/^[EG]$/.test(i.t))continue;const mx=i.x+i.w/2;let best=null,bd=1e9;for(const s of spalten.sub){const d=Math.abs(s.m-mx);if(d<bd){bd=d;best=s}}
      if(best&&bd<22){kurse[best.k]=kurse[best.k]||{};kurse[best.k][best.a]=i.t}}
    kinder.push({roh:nameTeile,kurse});
  }
  return {kinder};
}

/* Unbekannter Bericht: Aufbau ohne Namen (Wörter mit großem Anfangsbuchstaben, die nicht bekannt sind, werden unkenntlich) */
const BEKANNT=new Set(("Schuljahr Klasse Halbjahr Fach Fächer Note Noten Gewichtung Punkte Prozent Erreicht Aktuell Summe Gesamt Fehltage Fehlstunden unentschuldigt entschuldigt "+
  "Arbeitsverhalten Sozialverhalten AV SV Bemerkung Bemerkungen Zeugnis Zeugnisart Abschluss Erwarteter Errechneter Klassenlehrer Klassenlehrerin Lehrer Lehrkraft Datum Seite "+
  "Deutsch Englisch Mathematik Naturwissenschaften Gesellschaftslehre Informatik Kunst Musik Sport Werte Normen Religion Arbeit Wirtschaft Technik Französisch Spanisch WPK "+
  "DE MA EN NW GL E G HS RS S1 E-S1 ZL FÖ Niveaustufe Niveaustufen Leistungsübersicht Lernentwicklung Lernstandskontrolle Klassenbewertung Zeugnisausgabe Status Schüler Schülerin").split(" "));
function aufbauText(zeilen){
  const z=[];let seite=0;
  for(const r of zeilen){if(r.seite!==seite){seite=r.seite;z.push(`--- Seite ${seite}`)}
    z.push(Math.round(r.y)+": "+r.i.map(i=>i.t.split(/\s+/).map(w=>BEKANNT.has(w.replace(/[:.,()]/g,""))||!/^\p{Lu}/u.test(w)&&!/\p{L}{2,}/u.test(w.replace(/^\p{Ll}+$/u,""))||/^\p{Ll}/u.test(w)?w:"X".repeat(Math.min(w.length,3))).join(" ")+"@"+Math.round(i.x)).join("  "))}
  return z.slice(0,400).join("\n");
}

/* ---------- Rechnen ---------- */
const FACH=[[/^deutsch/i,"D"],[/^mathe/i,"M"],[/^englisch/i,"E"],[/^(naturwiss|nawi)/i,"NW"],[/^gesellschaft/i,"GL"],[/werte|religion/i,"WN"],[/^sport/i,"SP"],[/^kunst/i,"KU"],[/^musik/i,"MU"],[/^informatik/i,"IN"],[/arbeit|wirtschaft|^awt/i,"AWT"],[/^(wpk|wahlpflicht)|franz(ö|oe)sisch|spanisch/i,"WPK"]];
const fachKey=f=>{for(const [re,k] of FACH)if(re.test(String(f||"").trim()))return k;return ""};
const KURZ={D:"De",M:"Ma",E:"En",NW:"NW",GL:"GL",WN:"WuN",SP:"Sp",KU:"Ku",MU:"Mu",IN:"Inf",AWT:"AWT",WPK:"WPK"};
const anteilM=()=>{const v=+(((typeof E!=="undefined"&&E)||{}).konferenz||{}).muendlich;return v>0&&v<100?v/100:0.6};
function schnitt(l){const g=l.reduce((s,x)=>s+x.gewicht,0);return g?l.reduce((s,x)=>s+x.note*x.gewicht,0)/g:null}
function fachnoten(noten){
  const pro=new Map();for(const n of noten){if(n.note==null)continue;const f=n.fach;if(!pro.has(f))pro.set(f,[]);pro.get(f).push(n)}
  const out=[];const a=anteilM();
  for(const [f,l] of pro){const m=schnitt(l.filter(x=>x.art==="m")),s=schnitt(l.filter(x=>x.art==="s"));
    const wert=m!=null&&s!=null?a*m+(1-a)*s:m!=null?m:s;
    out.push({fach:f,k:fachKey(f),wert,note:Math.min(6,Math.max(1,Math.round(wert))),anzahl:l.length,m,s})}
  return out;
}
const fmt=x=>x==null?"":x.toFixed(1).replace(".",",");
const jgAus=(...q)=>{for(const x of q){const m=String(x||"").match(/^\D*?(\d{1,2})/);if(m)return +m[1]}return 0};

function prognose(kind,jg){
  if(!window.saAVO||!(jg===9||jg===10))return null;
  const fn=fachnoten(kind.noten||[]);const grades={},levels={};let wpkName="",wpkFrz=false;
  for(const f of fn)if(f.k&&!grades[f.k]){grades[f.k]=f.note;if(f.k==="WPK"){wpkName=f.fach.replace(/^WPK\s*/i,"");wpkFrz=/franz/i.test(f.fach)}}
  for(const k of ["D","M","E","NW"]){const c=(kind.kurse||{})[k];if(c&&c.a)levels[k]=c.a}
  if(!fn.length)return {r:null,text:{titel:"keine Noten",gruende:["Noch keine Einzelnoten aus der LEB-Lernstandskontrolle"]}};
  const fehlKurs=["D","M","E","NW"].filter(k=>!levels[k]);
  if(fehlKurs.length)return {r:null,text:{titel:"keine Prognose",gruende:["Kurs E/G fehlt in den LEB-Niveaustufen: "+fehlKurs.map(k=>KURZ[k]).join(", ")]}};
  const r=saAVO.check({jg,stand:"prognose",wpkFrz,wpkName,muendlich:"",grades,levels});
  // „Ohne Note“ nur für Fächer, die das Kind laut LEB hat (Eintrag ohne Note), nicht für alle Fächer der AVO
  const belegt=new Set((kind.noten||[]).map(n=>fachKey(n.fach)).filter(Boolean));
  r.missing=(r.missing||[]).filter(n=>{const s=saAVO.SUBJECTS.find(x=>x.n===n||(x.k==="WPK"&&/WPK|Wahlpflicht|Franz/.test(n)));return s&&belegt.has(s.k)});
  return {r,text:begruendung(r)};
}
const nm=s=>s.fld?`${s.n} (${s.level})`:s.n;
function begruendung(r){
  if(r.incomplete)return {titel:"keine Prognose",gruende:["Es fehlt: "+r.incomplete.join(", ")]};
  const g=[];let titel;
  const {reached,konferenz,schranke}=r;
  if(!schranke.ok){titel="zurzeit kein Abschluss";g.push(`Prüfungsfächer: ${schranke.bad.map(s=>`${s.n} ${s.grade}`).join(", ")}; höchstens eines darf schlechter als 4 sein (§ 1 Abs. 3)`)}
  else if(reached){titel=reached.short+(reached.comp&&reached.comp.c1?" (eine Note eine Stufe unter Soll, unschädlich)":"");g.push(`${reached.name} erreicht (${reached.par})`)}
  else if(konferenz.length){titel=konferenz[konferenz.length-1].short+" nur mit Ausgleich";}
  else titel="zurzeit kein Abschluss";
  for(const L of konferenz)g.push(`${L.short} mit Ausgleich möglich (${L.comp.par||L.par}, Konferenzentscheidung): ${L.comp.text}`);
  const t=r.target;
  if(t&&schranke.ok){
    if(t.structural)g.push(`${t.short}: ${t.structural}`);
    else{const d=(t.rows||[]).filter(x=>x.grade-x.soll>0&&!x.ignored).map(x=>`${nm(x)} ${x.grade} statt ${x.soll}`);
      if(d.length)g.push(`Für ${t.short} fehlt: ${d.join(", ")}`);
      if(t.avg&&!t.avg.ok)g.push(`Für ${t.short}: Schnitt Fächer ohne Kurs ${t.avg.val.toFixed(2).replace(".",",")} (nötig ≤ 3,00)`)}
    if(r.hints.length)g.push(`Eine Notenstufe besser in ${r.hints.map(s=>s.n).join(" oder ")} reicht für ${t.short}`);
  }
  if(r.missing.length)g.push("Ohne Note: "+r.missing.join(", "));
  return {titel,gruende:g};
}

/* ---------- Speicher ---------- */
const DATEI=gid=>`konferenz-${gid}`;
async function laden(gid){
  try{const root=sdRoot();if(!root)return null;const d=await (await root.getDirectoryHandle("ausgaben")).getDirectoryHandle("konferenz");
    const t=await lies(await d.getFileHandle(DATEI(gid)+".json"));return t?JSON.parse(t):null}catch{return null}
}
async function speichern(K){
  const root=await sdSchreib();const a=await root.getDirectoryHandle("ausgaben",{create:true});const d=await a.getDirectoryHandle("konferenz",{create:true});
  const sauber={gid:K.gid,jg:K.jg,stand:K.stand,quellen:K.quellen,kinder:K.kinder};
  await schreibe(d,DATEI(K.gid)+".json",JSON.stringify(sauber,null,1));
  await schreibe(d,DATEI(K.gid)+".tsv",await tabelle(K,"tsv"));
}

/* ---------- Übersicht ---------- */
async function fehltage(gid){try{return window.saFehlzeiten&&saFehlzeiten.tage?await saFehlzeiten.tage(gid):null}catch{return null}}
function faecherReihe(K){
  const f=new Map();for(const k of Object.values(K.kinder))for(const x of fachnoten(k.noten||[]))if(!f.has(x.fach))f.set(x.fach,x.k);
  const ord=Object.keys(KURZ);return [...f.entries()].sort((a,b)=>(ord.indexOf(a[1])+1||99)-(ord.indexOf(b[1])+1||99)||a[0].localeCompare(b[0],"de")).map(x=>x[0]);
}
async function zeilen(K){
  const ft=await fehltage(K.gid);const faecher=faecherReihe(K);
  const out=Object.keys(K.kinder).sort((a,b)=>a.localeCompare(b,"de",{numeric:true})).map(k=>{
    const kind=K.kinder[k];const fn=new Map(fachnoten(kind.noten||[]).map(x=>[x.fach,x]));
    const t=ft&&ft.tage&&ft.tage.get(k);const p=prognose(kind,K.jg);
    return {k,kurse:kind.kurse||{},fn,ft:t?{ganz:t.unentschuldigt+t.entschuldigt+t.offen,unent:t.unentschuldigt,offen:t.offen}:null,p}});
  return {faecher,out,ftStand:ft&&ft.stand};
}
const kursText=c=>!c||!c.a?"–":c.a+(c.n&&c.n!==c.a?"→"+c.n:"");
async function tabelle(K,form){
  const {faecher,out,ftStand}=await zeilen(K);
  const kopf=["Kuerzel","Kurs_D","Kurs_M","Kurs_E","Kurs_NW",...faecher.map(f=>KURZ[fachKey(f)]||f),"Fehltage","davon_unent","Prognose","Begruendung"];
  const z=out.map(x=>[x.k,...["D","M","E","NW"].map(s=>kursText(x.kurse[s])),...faecher.map(f=>{const v=x.fn.get(f);return v?`${fmt(v.wert)} (${v.anzahl})`:""}),
    x.ft?String(x.ft.ganz):"",x.ft?String(x.ft.unent):"",x.p?x.p.text.titel:"",x.p?x.p.text.gruende.join("; "):""]);
  const info=`# Konferenz-Mappe ${K.gid} · Stand ${K.stand} · Quellen: ${(K.quellen||[]).join(", ")} · Fachschnitt aus LEB-Einzelnoten (mündlich ${Math.round(anteilM()*100)} %, schriftlich ${100-Math.round(anteilM()*100)} %), in Klammern Zahl der Noten; Kurs „E→G“ = Wechsel zum nächsten Halbjahr; Fehltage = ganze Tage${ftStand?" (Fehlzeiten-Stand "+ftStand+")":" (kein Fehlzeiten-Stand)"}; Prognose nach AVO-Sek I, ohne mündliches Prüfungsfach · nur Kürzel`;
  if(form==="tsv")return [info,kopf.join("\t"),...z.map(r=>r.join("\t"))].join("\n")+"\n";
  return {kopf,z,info,faecher,out};
}

/* ---------- Anzeige ---------- */
const css=document.createElement("style");
css.textContent=`.kf-tab{width:100%;border-collapse:collapse;font-size:13px}.kf-tab th{text-align:left;font-weight:600;color:var(--muted);font-size:11.5px;padding:4px 5px;border-bottom:1px solid var(--line);white-space:nowrap}
.kf-tab td{padding:5px;border-bottom:1px solid var(--line);vertical-align:top}.kf-tab td.z{text-align:center;font-variant-numeric:tabular-nums;white-space:nowrap}
.kf-tab .k{font-family:var(--f-mono);font-weight:600;white-space:nowrap}.kf-tab .nm{color:var(--muted);font-size:12px}
.kf-tab td.schwach{color:var(--err);font-weight:600}.kf-tab td.kurs{font-family:var(--f-mono);text-align:center}
.kf-tab .pg b{display:block}.kf-tab .pg ul{margin:2px 0 0;padding-left:16px;font-size:12px;color:var(--muted)}
.kf-wrap{overflow-x:auto}.kf-drop{border:1.5px dashed var(--line);border-radius:10px;padding:12px;text-align:center;font-size:13.5px;color:var(--muted)}.kf-drop.ueber{border-color:var(--accent);color:var(--ink)}
.kf-hinweis{border-left:4px solid var(--warn);background:var(--warn-soft);border-radius:8px;padding:8px 12px;font-size:13px}
.kf-hinweis ul{margin:4px 0 0;padding-left:18px}.kf-aufbau{width:100%;min-height:160px;font-family:var(--f-mono);font-size:11.5px}`;
document.head.appendChild(css);

let K=null;           // {gid, jg, stand, quellen, kinder:{Kürzel:{noten, kurse}}}
let ohne=[];          // nicht zugeordnete Namen (nur in diesem Fenster)
let aufbau="";        // Aufbau eines unbekannten Berichts zum Kopieren
const AN=()=>!!store.get("konf-an",false);

async function zeigen(gid){
  const slot=$("#panel-slot");
  if(!AN()){
    slot.innerHTML=`<div class="panel"><h4>Konferenz-Mappe</h4><p>Für Zeugnis- und Pädagogische Konferenzen: Du druckst in LEB-online unter <b>Klassenbewertungen › Berichte</b> die PDFs „Lernstandskontrolle“ (alle Schüler) und „Niveaustufen“ und ziehst sie hier hinein. Der Helfer liest sie nur in diesem Fenster, ersetzt Namen durch Kürzel und zeigt je Kind Kurse, Fachschnitte aller Fächer, ganze Fehltage und eine Abschlussprognose mit Begründung. LEB-online selbst wird dabei nicht aufgerufen.</p>
      <div class="actions"><button class="btn primary" id="kf-an">Konferenz-Mappe einschalten</button></div></div>`;
    $("#kf-an").addEventListener("click",()=>{store.set("konf-an",true);zeigen(gid)});return}
  if(ordner.zustand!=="an"||!sdRoot()){slot.innerHTML=`<div class="panel"><h4>Konferenz-Mappe</h4><p>Dafür braucht die Seite deine Kürzellisten. Bitte unter „Lerngruppen“ zuerst den Datenordner verbinden.</p></div>`;return}
  if(!K||K.gid!==gid){ohne=[];aufbau="";const g=ordner.gruppen.find(x=>x.id===gid);
    K=(await laden(gid))||{gid,jg:jgAus(gid),stand:"",quellen:[],kinder:{}};if(!K.jg)K.jg=jgAus(gid,g&&g.gruppeText)}
  await zeichnen();
}
async function zeichnen(meldung){
  const slot=$("#panel-slot");const namen=await namenLesen(K.gid);const zeigeNamen=store.get("namen-zeigen",true);
  const n=Object.keys(K.kinder).length;
  let tab="";
  if(n){const t=await tabelle(K,"html");
    tab=`<div class="kf-wrap"><table class="kf-tab"><thead><tr><th>Kürzel</th><th title="Kurs Deutsch">D</th><th title="Kurs Mathematik">M</th><th title="Kurs Englisch">E</th><th title="Kurs Naturwissenschaften">NW</th>${t.faecher.map(f=>`<th title="${esc(f)}">${esc(KURZ[fachKey(f)]||f.slice(0,8))}</th>`).join("")}<th title="ganze Fehltage (davon unentschuldigt)">Fehlt.</th><th>Prognose (AVO)</th></tr></thead><tbody>`+
      t.out.map(x=>{const nmn=namen[x.k]&&zeigeNamen?`<div class="nm">${esc([namen[x.k].vor,namen[x.k].nach].filter(Boolean).join(" "))}</div>`:"";
        return `<tr><td class="k">${esc(x.k)}${nmn}</td>${["D","M","E","NW"].map(s=>`<td class="kurs">${esc(kursText(x.kurse[s]))}</td>`).join("")}`+
          t.faecher.map(f=>{const v=x.fn.get(f);return v?`<td class="z${v.wert>=4.5?" schwach":""}" title="${v.anzahl} ${v.anzahl===1?"Note":"Noten"}${v.m!=null?" · mündl. "+fmt(v.m):""}${v.s!=null?" · schriftl. "+fmt(v.s):""}">${fmt(v.wert)}</td>`:`<td class="z">–</td>`}).join("")+
          `<td class="z">${x.ft?esc(x.ft.ganz+(x.ft.unent?" ("+x.ft.unent+")":"")):"–"}</td><td class="pg">${x.p?`<b>${esc(x.p.text.titel)}</b><ul>${x.p.text.gruende.map(g=>`<li>${esc(g)}</li>`).join("")}</ul>`:"–"}</td></tr>`}).join("")+
      `</tbody></table></div><p class="note">${esc(t.info.replace(/^# /,""))}</p>`}
  slot.innerHTML=`<div class="panel" role="region" aria-label="Konferenz-Mappe"><h4>Konferenz-Mappe ${esc(K.gid)}${K.stand?` <small style="font-weight:400;font-size:13px;color:var(--muted)">Stand ${esc(datumDE(K.stand))}</small>`:""}</h4>
    ${meldung?`<div class="kf-hinweis">${meldung}</div>`:""}
    <div class="kf-drop" id="kf-drop">LEB-PDFs hierher ziehen („Lernstandskontrolle“ für alle Schüler, „Niveaustufen“) oder <label class="btn small ghost" style="display:inline-flex">auswählen<input type="file" id="kf-datei" accept=".pdf" multiple hidden></label></div>
    ${ohne.length?`<div class="kf-hinweis"><b>${ohne.length} ${ohne.length===1?"Name":"Namen"} nicht zugeordnet</b> (nur hier sichtbar, nicht gespeichert). Bitte in „Namen & Kürzel“ ergänzen oder die Schreibweise angleichen:<ul>${ohne.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`:""}
    ${aufbau?`<div class="kf-hinweis"><b>Diesen Bericht kenne ich noch nicht.</b> Unten steht sein Aufbau ohne Namen. Wenn du ihn kopierst und Claude schickst, kann er eingebaut werden.<textarea class="kf-aufbau" id="kf-aufbau" readonly>${esc(aufbau)}</textarea><button class="btn small" id="kf-aufbau-kopie">Aufbau kopieren</button></div>`:""}
    ${n?tab:`<p class="note">Noch keine Daten für ${esc(K.gid)}.</p>`}
    <div class="actions">${n?`<button class="btn primary" id="kf-claude">Tischvorlage mit Claude</button><button class="btn ghost" id="kf-kopie">Tabelle kopieren (nur Kürzel)</button>`:""}
      <label style="display:inline-flex;gap:6px;align-items:center;font-size:13px"><input type="checkbox" id="kf-namen"${zeigeNamen?" checked":""}> Namen zeigen</label>
      ${n?`<button class="btn ghost small" id="kf-leeren">Daten löschen</button>`:""}<span class="toast" id="kf-toast" role="status"></span></div></div>`;
  const drop=$("#kf-drop");
  drop.addEventListener("dragover",e=>{e.preventDefault();drop.classList.add("ueber")});drop.addEventListener("dragleave",()=>drop.classList.remove("ueber"));
  drop.addEventListener("drop",e=>{e.preventDefault();drop.classList.remove("ueber");einlesen([...e.dataTransfer.files])});
  $("#kf-datei").addEventListener("change",e=>einlesen([...e.target.files]));
  $("#kf-namen").addEventListener("change",e=>{store.set("namen-zeigen",e.target.checked);zeichnen()});
  if($("#kf-aufbau-kopie"))$("#kf-aufbau-kopie").addEventListener("click",()=>kopieren(aufbau));
  if($("#kf-kopie"))$("#kf-kopie").addEventListener("click",async()=>kopieren(await tabelle(K,"tsv")));
  if($("#kf-claude"))$("#kf-claude").addEventListener("click",anClaude);
  if($("#kf-leeren"))$("#kf-leeren").addEventListener("click",async()=>{if(!confirm(`Konferenz-Daten von ${K.gid} löschen?`))return;K={gid:K.gid,jg:K.jg,stand:"",quellen:[],kinder:{}};ohne=[];
    try{const d=await (await (await sdSchreib()).getDirectoryHandle("ausgaben")).getDirectoryHandle("konferenz");for(const e of [".json",".tsv"])try{await d.removeEntry(DATEI(K.gid)+e)}catch{}}catch{}zeichnen("Gelöscht.")});
}
async function kopieren(t){try{await navigator.clipboard.writeText(t);const x=$("#kf-toast");if(x){x.textContent="Kopiert";setTimeout(()=>x.textContent="",2000)}}catch{}}

async function einlesen(dateien){
  const namen=await namenLesen(K.gid);const meld=[];let neu=0;
  for(const f of dateien){
    let z;try{z=await pdfZeilen(await f.arrayBuffer())}catch(e){meld.push(`Eine Datei ließ sich nicht als PDF lesen.`);continue}
    const art=artVon(z);
    if(art==="lernstand"){
      const r=lernstandLesen(z);if(!K.jg)K.jg=jgAus(r.klasse);let n=0;
      for(const kind of r.kinder){const k=zuordnen(kind.roh,namen);if(!k){if(kind.roh&&!ohne.includes(kind.roh))ohne.push(kind.roh);continue}
        K.kinder[k]=K.kinder[k]||{};K.kinder[k].noten=kind.noten;n++}
      meld.push(`Lernstandskontrolle: ${n} von ${r.kinder.length} ${r.kinder.length===1?"Kind":"Kindern"} übernommen.`);if(n)neu++;
      if(!K.quellen.includes("LEB Lernstandskontrolle"))K.quellen.push("LEB Lernstandskontrolle");
    }else if(art==="niveau"){
      const r=niveauLesen(z);let n=0;
      for(const kind of r.kinder){const k=zuordnen(kind.roh,namen);if(!k){if(kind.roh&&!ohne.includes(kind.roh))ohne.push(kind.roh);continue}
        K.kinder[k]=K.kinder[k]||{};K.kinder[k].kurse=kind.kurse;n++}
      meld.push(`Niveaustufen: ${n} von ${r.kinder.length} Kindern übernommen.`);if(n)neu++;
      if(!K.quellen.includes("LEB Niveaustufen"))K.quellen.push("LEB Niveaustufen");
    }else{aufbau=aufbauText(z);meld.push("Ein Bericht hat ein unbekanntes Format (siehe unten).")}
  }
  if(neu){K.stand=heuteISO();try{await speichern(K);meld.push(`Gespeichert unter ${esc(sdPfad("ausgaben/konferenz/"+DATEI(K.gid)+".tsv"))} (nur Kürzel).`)}catch(e){meld.push("Speichern ging nicht: "+esc(e.message||e))}}
  zeichnen(meld.join("<br>"));
}

async function anClaude(){
  const t=await tabelle(K,"tsv");
  oeffne({id:"konferenz-mappe",titel:"Tischvorlage mit Claude",typ:"claude",felder:[],auftrag:
`Zeugnis vorbereiten (zeugnis-vorbereiten): Erstelle die Tischvorlage für die Konferenz der Lerngruppe ${K.gid}.
Daten aus LEB-online und der Fehlzeiten-Ampel (nur Kürzel), gespeichert unter ${sdPfad("ausgaben/konferenz/"+DATEI(K.gid)+".tsv")}:

${t}
Die Fachschnitte sind aus den Einzelnoten in LEB-online berechnet, keine festgelegten Zeugnisnoten. Die Prognose ist eine Einschätzung nach AVO-Sek I ohne mündliches Prüfungsfach. Hebe Kinder mit Abschlussgefährdung, Kurswechseln und auffälligen Fehlzeiten hervor.`});
}

window.saKonferenz={zeigen,oeffnen:gid=>{gid=gid||store.get("konf-gruppe","")||((ordner.gruppen.find(x=>/^\d+[a-z]/i.test(x.id))||ordner.gruppen[0]||{}).id);if(typeof gruppeZeigen==="function")return gruppeZeigen(gid,"konferenz");return zeigen(gid)},
  _test:{zuordnen,pdfZeilen,artVon,lernstandLesen,niveauLesen,aufbauText,fachnoten,prognose,begruendung,setK:x=>{K=x},tabelle:f=>tabelle(K,f)}};
})();
