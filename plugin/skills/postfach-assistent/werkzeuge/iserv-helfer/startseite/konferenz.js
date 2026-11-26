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

function prognose(kind,jg,kurse){
  if(!window.saAVO||!(jg===9||jg===10))return null;
  const fn=fachnoten(kind.noten||[]);const grades={},levels={};let wpkName="",wpkFrz=false;
  for(const f of fn)if(f.k&&!grades[f.k]){grades[f.k]=f.note;if(f.k==="WPK"){wpkName=f.fach.replace(/^WPK\s*/i,"");wpkFrz=/franz/i.test(f.fach)}}
  for(const k of ["D","M","E","NW"]){const c=(kurse||kind.kurse||{})[k];if(c&&c.a)levels[k]=c.a}
  if(!fn.length)return {r:null,text:{titel:"keine Noten",gruende:["Noch keine Einzelnoten aus der LEB-Lernstandskontrolle"]}};
  const fehlKurs=["D","M","E","NW"].filter(k=>!levels[k]);
  if(fehlKurs.length)return {r:null,text:{titel:"keine Prognose",gruende:["Kurs E/G fehlt (in LEB nicht eingetragen, links von Hand nachtragen): "+fehlKurs.map(k=>KURZ[k]).join(", ")]}};
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
  const sauber={gid:K.gid,jg:K.jg,stand:K.stand,quellen:K.quellen,kinder:K.kinder};   // nur Kürzel, keine Namen
  await schreibe(d,DATEI(K.gid)+".json",JSON.stringify(sauber,null,1));
  await schreibe(d,DATEI(K.gid)+".tsv",await tabelle(K,"tsv"));
}

/* ---------- Kurse: LEB, von Hand, Akte, eigene Kurs-Lerngruppe ---------- */
const KURS_FACH={D:"Deutsch",M:"Mathematik",E:"Englisch",NW:"Naturwissenschaften"};
const KURS_ZEILE=/^- (\d{4}-\d{2}-\d{2}) \| [^|]*\| Kurs (Deutsch|Mathematik|Englisch|Naturwissenschaften): ([EG])-Kurs[^|]*\|[^|]*\| (bestätigt|offen)\s*$/gm;
function akteVon(gid,k){const g=ordner.gruppen.find(x=>x.id===gid);const a=g&&g.akten.find(x=>x.kuerzel===k);return a?a.text||"":""}
function kurseAusAkte(text){const o={};for(const m of String(text).matchAll(KURS_ZEILE)){const s=Object.keys(KURS_FACH).find(x=>KURS_FACH[x]===m[2]);if(s)o[s]=m[3]}return o}
const feldVon=(t,n)=>((String(t||"").match(new RegExp("^"+n+":\\s*(.+)$","mi"))||[])[1]||"").trim();
function kurseAusGruppen(gid,k){
  const o={};const v=(typeof verkn!=="undefined"?verkn:[]).find(x=>x.kuerzel.some(y=>y.k===k&&y.g===gid));if(!v)return o;
  for(const y of v.kuerzel){if(y.g===gid)continue;const g=ordner.gruppen.find(x=>x.id===y.g);if(!g)continue;
    const s=fachKey(feldVon(g.gruppeText,"fach"));const kurs=feldVon(g.gruppeText,"kurs")+" "+y.g;
    const st=/(^|[\s-])E(-?kurs)?\b|erweitert/i.test(kurs)?"E":/(^|[\s-])G(-?kurs)?\b|grundkurs/i.test(kurs)?"G":"";
    if(KURS_FACH[s]&&st&&!o[s])o[s]={a:st,g:y.g}}
  return o;
}
/* Wirksamer Kurs je Fach: LEB-Niveaustufen > von Hand (Mappe) > Akte > eigene Kurs-Lerngruppe */
function kurseEff(k,kind){
  const o={};const akte=kurseAusAkte(akteVon(K.gid,k)),gr=kurseAusGruppen(K.gid,k),hand=kind.kurseHand||{};
  for(const s of Object.keys(KURS_FACH)){const l=(kind.kurse||{})[s];
    if(l&&l.a)o[s]={...l,q:"leb"};else if(hand[s])o[s]={a:hand[s],q:"hand"};else if(akte[s])o[s]={a:akte[s],q:"akte"};else if(gr[s])o[s]={a:gr[s].a,q:"gruppe",g:gr[s].g}}
  return o;
}
async function akteSchreiben(k,zeilenListe){
  const sd=await sdSchreib();const gd=await (await sd.getDirectoryHandle("lerngruppen")).getDirectoryHandle(K.gid);
  const fh=await gd.getFileHandle(k+".md");let t=await (await fh.getFile()).text();let n=0;
  for(const z of zeilenListe){if(kurseAusAkte(t)[z.s]===z.a)continue;t=abschnittErgaenzen(t,"Lernstand",z.zeile);n++}
  if(n){const w=await fh.createWritable();await w.write(t);await w.close()}
  return n;
}
const kursZeile=(s,a,quelle,art)=>({s,a,zeile:`- ${heuteISO()} | ${art} | Kurs ${KURS_FACH[s]}: ${a}-Kurs | Quelle: ${quelle} | bestätigt`});
async function aktenNeuLesen(){try{if(typeof ordnerLesen==="function"&&typeof ordnerHandle!=="undefined"){await ordnerLesen(ordnerHandle);if(typeof renderOrdner==="function")renderOrdner()}}catch{}}

/* ---------- AV/SV und Fehltage aus LEB-online (vom Helfer beim Öffnen der Bewertungsformulare gemerkt) ---------- */
async function lebUebernehmen(namen){
  if(!(window.chrome&&chrome.storage&&chrome.storage.local))return {neu:0,offen:0};
  const {saLebKonf={}}=await chrome.storage.local.get("saLebKonf");let neu=0,offen=0;
  for(const [id,d] of Object.entries(saLebKonf)){
    const treffer=new Set();for(const t of d.kandidaten||[]){const k=zuordnen(t,namen);if(k)treffer.add(k)}
    if(treffer.size!==1){offen++;continue}
    const k=[...treffer][0];K.kinder[k]=K.kinder[k]||{};
    K.kinder[k].leb={halbjahr:d.halbjahr,stand:new Date(d.zeit).toISOString().slice(0,10),fehltage:d.fehltage,unent:d.unent,av:d.av,sv:d.sv,errechnet:d.errechnet,erwartet:d.erwartet,zeugnisart:d.zeugnisart,
      faecher:(d.faecher||[]).map(f=>({fach:f.fach,werte:f.werte})),summen:d.summen||{av:{},sv:{}},aufbau:d.aufbau||""};
    delete saLebKonf[id];neu++}
  if(neu){await chrome.storage.local.set({saLebKonf});if(!K.quellen.includes("LEB Klassenbewertung"))K.quellen.push("LEB Klassenbewertung");K.stand=heuteISO();await speichern(K)}
  return {neu,offen};
}
function asvText(l){
  if(!l)return "";const z=(o)=>Object.entries(o||{}).sort().map(([s,n])=>`${n}×${s}`).join(" ");
  const sum={av:{},sv:{}};
  if(l.faecher&&l.faecher.length)for(const f of l.faecher){if(f.werte[0])sum.av[f.werte[0]]=(sum.av[f.werte[0]]||0)+1;if(f.werte[1])sum.sv[f.werte[1]]=(sum.sv[f.werte[1]]||0)+1}
  else{sum.av=l.summen.av;sum.sv=l.summen.sv}
  const teile=[];if(Object.keys(sum.av).length||Object.keys(sum.sv).length)teile.push(`Fachlehrkräfte AV ${z(sum.av)||"–"}, SV ${z(sum.sv)||"–"}`);
  if(l.av||l.sv)teile.push(`Klassenbewertung AV ${l.av||"–"}, SV ${l.sv||"–"}`);
  return teile.join("; ");
}

/* ---------- Übersicht ---------- */
async function fehltage(gid){try{return window.saFehlzeiten&&saFehlzeiten.tage?await saFehlzeiten.tage(gid):null}catch{return null}}
function spalte(f){const k=fachKey(f);if(/franz/i.test(f))return "Franz.";if(/spanisch/i.test(f))return "Span.";
  if(k==="WPK"){const r=f.replace(/^\s*(WPK|Wahlpflicht\S*)\s*/i,"");const t=(r.split(/\s+-\s+/).pop()||r).trim();return "WPK "+(t.length>12?t.slice(0,11)+"…":t)}
  return KURZ[k]||(f.length>10?f.slice(0,9)+"…":f)}
function faecherReihe(K){
  const f=new Map();for(const k of Object.values(K.kinder))for(const x of fachnoten(k.noten||[]))if(!f.has(x.fach))f.set(x.fach,x.k);
  const ord=Object.keys(KURZ);return [...f.entries()].sort((a,b)=>(ord.indexOf(a[1])+1||99)-(ord.indexOf(b[1])+1||99)||a[0].localeCompare(b[0],"de")).map(x=>x[0]);
}
async function zeilen(K){
  const ft=await fehltage(K.gid);const faecher=faecherReihe(K);
  const out=Object.keys(K.kinder).sort((a,b)=>a.localeCompare(b,"de",{numeric:true})).map(k=>{
    const kind=K.kinder[k];const fn=new Map(fachnoten(kind.noten||[]).map(x=>[x.fach,x]));const kurse=kurseEff(k,kind);
    const t=ft&&ft.tage&&ft.tage.get(k);const st=ft&&ft.stunden&&ft.stunden.get(k);const p=prognose(kind,K.jg,kurse);
    const l=kind.leb||null;
    const fz=l&&l.fehltage!==""&&l.fehltage!=null?{text:`${l.fehltage}${l.unent&&l.unent!=="0"?" ("+l.unent+")":""}`,q:"LEB-online",tage:l.fehltage,unent:l.unent}
      :t||st?{text:`${t?t.unentschuldigt+t.entschuldigt+t.offen:0} T${st?" · "+fmtStd(st.std)+" Std.":""}`,q:"Fehlzeiten-Ampel"+(ft.stand?" "+datumDE(ft.stand):""),tage:t?t.unentschuldigt+t.entschuldigt+t.offen:0,unent:t?t.unentschuldigt:0,std:st?st.std:null,ustd:st?st.unent:null}:null;
    return {k,kurse,fn,fz,asv:asvText(l),leb:l,p}});
  return {faecher,out,ftStand:ft&&ft.stand};
}
const fmtStd=n=>String(Math.round(n*10)/10).replace(".",",");
const MARK={leb:"",hand:"✎",akte:"*",gruppe:"°"};
const kursText=c=>!c||!c.a?"–":c.a+(c.n&&c.n!==c.a?"→"+c.n:"")+(MARK[c.q]||"");
async function tabelle(K,form,namen){
  const {faecher,out,ftStand}=await zeilen(K);
  const kopf=["Kuerzel",...(namen?["Vorname","Nachname"]:[]),"Kurs_D","Kurs_M","Kurs_E","Kurs_NW",...faecher.map(spalte),"Fehltage","davon_unent","Fehlstunden","AV_SV","Abschluss_erwartet_LEB","Prognose","Begruendung"];
  const z=out.map(x=>[x.k,...(namen?[(namen[x.k]||{}).vor||"",(namen[x.k]||{}).nach||""]:[]),...["D","M","E","NW"].map(s=>kursText(x.kurse[s])),...faecher.map(f=>{const v=x.fn.get(f);return v?`${fmt(v.wert)} (${v.anzahl})`:""}),
    x.fz?String(x.fz.tage):"",x.fz?String(x.fz.unent||0):"",x.fz&&x.fz.std!=null?fmtStd(x.fz.std):"",x.asv,x.leb&&x.leb.erwartet||"",x.p?x.p.text.titel:"",x.p?x.p.text.gruende.join("; "):""]);
  const info=`# Konferenz-Mappe ${K.gid} · Stand ${K.stand} · Quellen: ${(K.quellen||[]).join(", ")} · Fachschnitt aus LEB-Einzelnoten (mündlich ${Math.round(anteilM()*100)} %, schriftlich ${100-Math.round(anteilM()*100)} %), in Klammern Zahl der Noten; Kurs „E→G“ = Wechsel zum nächsten Halbjahr, ✎ = von Hand, * = aus der Akte, ° = aus der eigenen Kurs-Lerngruppe; Fehltage aus LEB-online (Klassenbewertung), sonst ganze Tage aus der Fehlzeiten-Ampel${ftStand?" (Stand "+ftStand+")":""}; AV/SV: Stufen a–e der Fachlehrkräfte bzw. der Klassenbewertung; Prognose nach AVO-Sek I, ohne mündliches Prüfungsfach${namen?"":" · nur Kürzel"}`;
  if(form==="tsv")return [info,kopf.join("\t"),...z.map(r=>r.join("\t"))].join("\n")+"\n";
  if(form==="csv"){const q=v=>{v=String(v??"");return /[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};return "﻿"+[kopf,...z].map(r=>r.map(q).join(";")).join("\r\n")+"\r\n"}
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
.kf-hinweis ul{margin:4px 0 0;padding-left:18px}.kf-tab select.kf-kurs{font:inherit;font-family:var(--f-mono);padding:0 2px;background:transparent;color:inherit;border:1px dashed var(--line);border-radius:4px}.kf-tab .kf-q{font-size:11px;color:var(--muted);margin-left:1px}.kf-tab td.asv{font-size:12px;min-width:120px}.kf-tab td.pg{min-width:240px}.kf-aufbau{width:100%;min-height:160px;font-family:var(--f-mono);font-size:11.5px}`;
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
    $("#kf-an").addEventListener("click",()=>{store.set("konf-an",true);try{chrome.storage.local.set({saKonfAn:true})}catch{}zeigen(gid)});return}
  try{chrome.storage.local.set({saKonfAn:true})}catch{}
  if(ordner.zustand!=="an"||!sdRoot()){slot.innerHTML=`<div class="panel"><h4>Konferenz-Mappe</h4><p>Dafür braucht die Seite deine Kürzellisten. Bitte unter „Lerngruppen“ zuerst den Datenordner verbinden.</p></div>`;return}
  if(!K||K.gid!==gid){ohne=[];aufbau="";const g=ordner.gruppen.find(x=>x.id===gid);
    K=(await laden(gid))||{gid,jg:jgAus(gid),stand:"",quellen:[],kinder:{}};if(!K.jg)K.jg=jgAus(gid,g&&g.gruppeText)}
  await zeichnen();
}
async function zeichnen(meldung){
  const slot=$("#panel-slot");const namen=await namenLesen(K.gid);const zeigeNamen=store.get("namen-zeigen",true);
  let lebInfo={neu:0,offen:0};try{lebInfo=await lebUebernehmen(namen)}catch{}
  const n=Object.keys(K.kinder).length;
  let tab="",aktenNeu=[];
  if(n){const t=await tabelle(K,"html");
    for(const x of t.out)for(const s of Object.keys(KURS_FACH)){const c=x.kurse[s];if(c&&c.q==="leb"&&c.a&&kurseAusAkte(akteVon(K.gid,x.k))[s]!==c.a&&akteVon(K.gid,x.k))aktenNeu.push({k:x.k,s,a:c.a})}
    const kursZelle=(x,s)=>{const c=x.kurse[s];if(c&&c.q==="leb")return `<td class="kurs" title="LEB-online Niveaustufen">${esc(kursText(c))}</td>`;
      const tip=!c?"In LEB nicht eingetragen: von Hand wählen (kommt auch in die Akte)":c.q==="hand"?"von Hand eingetragen":c.q==="akte"?"aus der Akte":`aus deiner Kurs-Lerngruppe ${c.g}`;
      return `<td class="kurs"><select class="kf-kurs${c?" "+c.q:""}" data-k="${esc(x.k)}" data-s="${s}" title="${esc(tip)}"><option value="">–</option><option${c&&c.a==="E"?" selected":""}>E</option><option${c&&c.a==="G"?" selected":""}>G</option></select>${c?`<span class="kf-q">${MARK[c.q]}</span>`:""}</td>`};
    tab=`<div class="kf-wrap"><table class="kf-tab"><thead><tr><th>Kürzel</th><th title="Kurs Deutsch">D</th><th title="Kurs Mathematik">M</th><th title="Kurs Englisch">E</th><th title="Kurs Naturwissenschaften">NW</th>${t.faecher.map(f=>`<th title="${esc(f)}">${esc(spalte(f))}</th>`).join("")}<th title="Fehltage (davon unentschuldigt)">Fehlt.</th><th>AV / SV</th><th>Prognose (AVO)</th></tr></thead><tbody>`+
      t.out.map(x=>{const nmn=namen[x.k]&&zeigeNamen?`<div class="nm">${esc([namen[x.k].vor,namen[x.k].nach].filter(Boolean).join(" "))}</div>`:"";
        const lebAbschl=x.leb&&(x.leb.erwartet||x.leb.errechnet)?`<li>LEB: ${x.leb.errechnet?"errechnet "+esc(x.leb.errechnet):""}${x.leb.errechnet&&x.leb.erwartet?", ":""}${x.leb.erwartet?"erwartet "+esc(x.leb.erwartet):""}</li>`:"";
        return `<tr><td class="k">${esc(x.k)}${nmn}</td>${["D","M","E","NW"].map(s=>kursZelle(x,s)).join("")}`+
          t.faecher.map(f=>{const v=x.fn.get(f);return v?`<td class="z${v.wert>=4.5?" schwach":""}" title="${esc(f)}: ${v.anzahl} ${v.anzahl===1?"Note":"Noten"}${v.m!=null?" · mündl. "+fmt(v.m):""}${v.s!=null?" · schriftl. "+fmt(v.s):""}">${fmt(v.wert)}</td>`:`<td class="z">–</td>`}).join("")+
          `<td class="z" title="${x.fz?esc(x.fz.q):"keine Fehlzeiten"}">${x.fz?esc(x.fz.text):"–"}</td>`+
          `<td class="asv" title="${x.leb&&x.leb.faecher&&x.leb.faecher.length?esc(x.leb.faecher.map(f=>f.fach+": "+f.werte.join("/")).join(" · ")):""}">${x.asv?esc(x.asv):"–"}</td>`+
          `<td class="pg">${x.p?`<b>${esc(x.p.text.titel)}</b><ul>${x.p.text.gruende.map(g=>`<li>${esc(g)}</li>`).join("")}${lebAbschl}</ul>`:"–"}</td></tr>`}).join("")+
      `</tbody></table></div><p class="note">${esc(t.info.replace(/^# /,""))}</p>`}
  const asvFehlt=n&&!Object.values(K.kinder).some(k=>k.leb);
  const aufbauLeb=Object.values(K.kinder).map(k=>k.leb&&k.leb.aufbau).find(Boolean)||"";
  slot.innerHTML=`<div class="panel" role="region" aria-label="Konferenz-Mappe"><h4>Konferenz-Mappe ${esc(K.gid)}${K.stand?` <small style="font-weight:400;font-size:13px;color:var(--muted)">Stand ${esc(datumDE(K.stand))}</small>`:""}</h4>
    ${meldung?`<div class="kf-hinweis">${meldung}</div>`:""}
    ${lebInfo.neu?`<div class="kf-hinweis">${lebInfo.neu} ${lebInfo.neu===1?"Bewertungsformular":"Bewertungsformulare"} aus LEB-online übernommen (Fehltage, AV/SV, Abschluss).</div>`:""}
    ${lebInfo.offen?`<div class="kf-hinweis">${lebInfo.offen} gemerkte ${lebInfo.offen===1?"Formular passt":"Formulare passen"} zu keinem Kind dieser Lerngruppe (andere Klasse oder Name abweichend geschrieben). Sie verfallen nach 12 Stunden.</div>`:""}
    <div class="kf-drop" id="kf-drop">LEB-PDFs hierher ziehen („Lernstandskontrolle“ für alle Schüler, „Niveaustufen“) oder <label class="btn small ghost" style="display:inline-flex">auswählen<input type="file" id="kf-datei" accept=".pdf" multiple hidden></label></div>
    ${asvFehlt?`<p class="note"><b>AV/SV und Fehltage aus LEB-online:</b> Öffne in LEB-online <b>Klassenbewertungen › ${esc(K.gid.split("-")[0])} › Schüler › Bewerten</b> nacheinander für jedes Kind (am besten mit „AV / SV einblenden“). Der Helfer merkt sich dabei Fehltage, AV/SV und Abschluss, er ändert nichts. Danach diese Mappe neu öffnen.</p>`:""}
    ${aufbauLeb&&!Object.values(K.kinder).some(k=>k.leb&&(k.leb.faecher.length||Object.keys(k.leb.summen.av||{}).length))?`<div class="kf-hinweis"><b>Die AV/SV der Fachlehrkräfte habe ich auf der LEB-Seite noch nicht gefunden.</b> Hier der Aufbau ohne Namen; schick ihn Claude, dann wird es angepasst.<textarea class="kf-aufbau" readonly>${esc(aufbauLeb)}</textarea><button class="btn small" id="kf-aufbau-leb">Aufbau kopieren</button></div>`:""}
    ${ohne.length?`<div class="kf-hinweis"><b>${ohne.length} ${ohne.length===1?"Name":"Namen"} nicht zugeordnet</b> (nur hier sichtbar, nicht gespeichert). Bitte in „Namen & Kürzel“ ergänzen oder die Schreibweise angleichen:<ul>${ohne.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div>`:""}
    ${aufbau?`<div class="kf-hinweis"><b>Diesen Bericht kenne ich noch nicht.</b> Unten steht sein Aufbau ohne Namen. Wenn du ihn kopierst und Claude schickst, kann er eingebaut werden.<textarea class="kf-aufbau" id="kf-aufbau" readonly>${esc(aufbau)}</textarea><button class="btn small" id="kf-aufbau-kopie">Aufbau kopieren</button></div>`:""}
    ${aktenNeu.length?`<div class="kf-hinweis"><b>${aktenNeu.length} ${aktenNeu.length===1?"Kurs":"Kurse"} aus LEB stehen noch nicht in den Akten.</b> <button class="btn small" id="kf-akten">In die Akten schreiben (Bereich Lernstand)</button></div>`:""}
    ${n?tab:`<p class="note">Noch keine Daten für ${esc(K.gid)}.</p>`}
    <div class="actions">${n?`<button class="btn primary" id="kf-claude">Tischvorlage mit Claude</button><button class="btn ghost" id="kf-kopie">Tabelle kopieren (nur Kürzel)</button><button class="btn ghost" id="kf-export" title="Excel-Datei (CSV) mit Vor- und Nachnamen, wird nur auf diesem Rechner gespeichert">Mit Namen exportieren</button>`:""}
      <label style="display:inline-flex;gap:6px;align-items:center;font-size:13px"><input type="checkbox" id="kf-namen"${zeigeNamen?" checked":""}> Namen zeigen</label>
      ${n?`<button class="btn ghost small" id="kf-leeren">Daten löschen</button>`:""}<span class="toast" id="kf-toast" role="status"></span></div></div>`;
  const drop=$("#kf-drop");
  drop.addEventListener("dragover",e=>{e.preventDefault();drop.classList.add("ueber")});drop.addEventListener("dragleave",()=>drop.classList.remove("ueber"));
  drop.addEventListener("drop",e=>{e.preventDefault();drop.classList.remove("ueber");einlesen([...e.dataTransfer.files])});
  $("#kf-datei").addEventListener("change",e=>einlesen([...e.target.files]));
  $("#kf-namen").addEventListener("change",e=>{store.set("namen-zeigen",e.target.checked);zeichnen()});
  if($("#kf-aufbau-kopie"))$("#kf-aufbau-kopie").addEventListener("click",()=>kopieren(aufbau));
  if($("#kf-aufbau-leb"))$("#kf-aufbau-leb").addEventListener("click",()=>kopieren(aufbauLeb));
  if($("#kf-kopie"))$("#kf-kopie").addEventListener("click",async()=>kopieren(await tabelle(K,"tsv")));
  if($("#kf-export"))$("#kf-export").addEventListener("click",async()=>{
    const csv=await tabelle(K,"csv",namen);const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
    a.download=`Konferenz-${K.gid}-${heuteISO()}-mit-Namen.csv`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);
    const x=$("#kf-toast");if(x)x.textContent="Gespeichert im Download-Ordner. Enthält Namen: nicht an Claude geben."});
  if($("#kf-claude"))$("#kf-claude").addEventListener("click",anClaude);
  slot.querySelectorAll("select.kf-kurs").forEach(sel=>sel.addEventListener("change",async()=>{
    const k=sel.dataset.k,s=sel.dataset.s,a=sel.value;K.kinder[k]=K.kinder[k]||{};const h=K.kinder[k].kurseHand=K.kinder[k].kurseHand||{};
    if(a)h[s]=a;else delete h[s];let msg="";
    try{await speichern(K);if(a&&akteVon(K.gid,k)){const m=await akteSchreiben(k,[kursZeile(s,a,"Lehrkraft (Startseite, Konferenz-Mappe)","Beobachtung")]);if(m){await aktenNeuLesen();msg=`Kurs ${KURS_FACH[s]} ${a} für ${k} in die Akte geschrieben.`}}}
    catch(e){msg="Speichern ging nicht: "+esc(e.message||e)}
    zeichnen(msg)}));
  if($("#kf-akten"))$("#kf-akten").addEventListener("click",async()=>{let m=0;
    try{const pro={};for(const x of aktenNeu)(pro[x.k]=pro[x.k]||[]).push(kursZeile(x.s,x.a,"LEB-online Niveaustufen (Startseite, Konferenz-Mappe)","Beleg"));
      for(const [k,l] of Object.entries(pro))m+=await akteSchreiben(k,l);await aktenNeuLesen();zeichnen(`${m} ${m===1?"Kurs":"Kurse"} in die Akten geschrieben.`)}
    catch(e){zeichnen("In die Akten schreiben ging nicht: "+esc(e.message||e))}});
  if($("#kf-leeren"))$("#kf-leeren").addEventListener("click",async()=>{if(!confirm(`Konferenz-Daten von ${K.gid} löschen? Die Akten bleiben unverändert.`))return;K={gid:K.gid,jg:K.jg,stand:"",quellen:[],kinder:{}};ohne=[];
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
