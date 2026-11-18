/* schulassistenz · Fehlzeiten-Ampel (Startseite)
   Gehört zum Plugin und wird bei Updates ersetzt. Wird nach dem Hauptskript geladen und nutzt dessen Funktionen
   (ordner, sdRoot, sdSchreib, namenLesen, xlsxZeilen, abschnittErgaenzen, oeffne, store, esc, $ …).

   Ablauf: WebUntis-Export „Abwesenheiten“ (xls, xlsx, csv) per Schulassistenz-Helfer holen oder als Datei hineinziehen.
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
async function tabelleLesen(buf){
  const u=new Uint8Array(buf);
  if(u[0]===0xD0&&u[1]===0xCF){const wb=cfbStream(buf,["Workbook","Book"]);if(!wb)throw new Error("Die Excel-Datei lässt sich nicht lesen. Bitte in Excel als .xlsx oder .csv speichern und noch einmal versuchen.");return biffZeilen(wb)}
  if(u[0]===0x50&&u[1]===0x4B)return xlsxZeilen(buf);
  const t=textDekodieren(buf);
  if(/^\s*</.test(t)&&/<table/i.test(t))return htmlZeilen(t);
  return trennZeilen(t);
}

/* ---------- Spalten, Datum, Namen ---------- */
const norm=s=>String(s??"").normalize("NFC").toLowerCase().replace(/[,.;]/g," ").replace(/\s+/g," ").trim();
const SPALTEN={
  name:[/^sch(ü|ue)ler/i,/^name$/i,/^langname$/i,/^schüler\*innen$/i],
  klasse:[/^klasse/i],
  datum:[/^datum$/i,/^von$/i,/^beginn(datum)?$/i,/^date$/i],
  std:[/^fehlstd/i,/^fehlstunden/i,/^stunden$/i],
  min:[/^fehlmin/i,/^minuten$/i],
  grund:[/^abwesenheitsgrund/i,/^grund$/i],
  status:[/^status$/i,/^entschuldigungsstatus/i]
};
function spaltenFinden(zeilen){
  for(let i=0;i<Math.min(15,zeilen.length);i++){const h=(zeilen[i]||[]).map(x=>String(x??"").trim());const s={};
    for(const [k,res] of Object.entries(SPALTEN))s[k]=h.findIndex(x=>res.some(r=>r.test(x)));
    if(s.name>=0&&s.datum>=0)return {kopf:i,s}}
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
  const ziel=new Map();   // normierter Name → Set von {gruppe,kuerzel}
  for(const g of ordner.gruppen){const m=await namenLesen(g.id);
    for(const [k,n] of Object.entries(m)){const vor=norm(n.vor),nach=norm(n.nach);if(!vor&&!nach)continue;
      const varianten=new Set([`${nach} ${vor}`,`${vor} ${nach}`]);const v1=vor.split(" ")[0];if(v1&&v1!==vor){varianten.add(`${nach} ${v1}`);varianten.add(`${v1} ${nach}`)}
      for(const v of varianten){if(!ziel.has(v))ziel.set(v,[]);ziel.get(v).push({gruppe:g.id,kuerzel:k,anzeige:[n.vor,n.nach].filter(Boolean).join(" ")})}}}
  return ziel;
}

/* ---------- Regeln aus dem Profil ---------- */
function flowMap(s){const o={};let tiefe=0,cur="";const teile=[];for(const ch of s){if(ch==="["||ch==="{")tiefe++;if(ch==="]"||ch==="}")tiefe--;if(ch===","&&tiefe===0){teile.push(cur);cur=""}else cur+=ch}teile.push(cur);
  for(const t of teile){const i=t.indexOf(":");if(i<0)continue;const k=t.slice(0,i).trim();let v=t.slice(i+1).trim();
    if(/^\[.*\]$/.test(v))v=v.slice(1,-1).split(",").map(x=>x.trim().replace(/^['"]|['"]$/g,"")).filter(x=>x&&!/^</.test(x));else v=v.replace(/^['"]|['"]$/g,"");o[k]=v}return o}
function regeln(){
  const t=(ordner.profil&&ordner.profil.text)||"";const r={frist:3,einheit:"schultage",schwelle:5,ab:"letzte_benachrichtigung",verspaetung:false,entschuldigt:[],ausProfil:false};
  const m=t.match(/^\s*fehlzeiten:\s*\{(.+)\}\s*(#.*)?$/m);
  if(m){const f=flowMap(m[1]);r.ausProfil=true;
    if(f.frist&&!isNaN(parseInt(f.frist,10)))r.frist=parseInt(f.frist,10);
    if(f.frist_einheit)r.einheit=/kalender/i.test(f.frist_einheit)?"kalendertage":"schultage";
    if(f.eltern_ab_unentsch_std&&!isNaN(parseFloat(f.eltern_ab_unentsch_std)))r.schwelle=parseFloat(f.eltern_ab_unentsch_std);
    if(f.schwelle_zaehlt_ab)r.ab=f.schwelle_zaehlt_ab;
    if(f.verspaetung_zaehlt)r.verspaetung=/^(ja|true)/i.test(f.verspaetung_zaehlt);
    if(Array.isArray(f.zaehlt_als_entschuldigt)){r.entschuldigtText=f.zaehlt_als_entschuldigt;r.entschuldigt=f.zaehlt_als_entschuldigt.map(norm)}}
  else{const a=t.match(/fehlzeiten_eltern_informieren_ab:\s*(\d+)/);if(a){r.schwelle=+a[1];r.ausProfil=true}const b=t.match(/fehlzeiten_entschuldigung_frist:\s*(\d+)/);if(b)r.frist=+b[1]}
  return r;
}
const ferien=()=>(Array.isArray(E.ferien)?E.ferien:[]).map(x=>Array.isArray(x)?[x[0],x[1]||x[0]]:[x,x]).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x[0]));
const istFrei=iso=>{const d=new Date(iso+"T12:00:00");const w=d.getDay();return w===0||w===6||ferien().some(([a,b])=>iso>=a&&iso<=b)};
const plusTage=(iso,n)=>{const d=new Date(iso+"T12:00:00");d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
function fristEnde(iso,r){if(r.einheit==="kalendertage")return plusTage(iso,r.frist);let d=iso,n=0;while(n<r.frist){d=plusTage(d,1);if(!istFrei(d))n++}return d}
function naechsterSchultag(iso){let d=plusTage(iso,1);let n=0;while(istFrei(d)&&n++<30)d=plusTage(d,1);return d}
const schuljahrBeginn=()=>{const d=new Date();const j=d.getMonth()>=7?d.getFullYear():d.getFullYear()-1;return `${j}-08-01`};

/* ---------- Datei → pseudonymisierte Zeilen ---------- */
async function verarbeiten(buf){
  const zeilen=await tabelleLesen(buf);const sp=spaltenFinden(zeilen);
  if(!sp)throw new Error("In der Datei fehlt die Kopfzeile mit Schülername und Datum. Ist es der Bericht „Abwesenheiten“ (pro Schüler) aus WebUntis?");
  const {kopf,s}=sp;const r=regeln();const namen=await alleNamen();
  const daten=[],fehlend=new Map(),klassen=new Map(),doppelt=new Map();
  for(const z of zeilen.slice(kopf+1)){if(!z)continue;
    const name=String(z[s.name]??"").trim();const iso=datumISO(z[s.datum]);if(!name||!iso)continue;
    const kl=s.klasse>=0?String(z[s.klasse]??"").trim():"";if(kl)klassen.set(kl,(klassen.get(kl)||0)+1);
    const std=s.std>=0?zahl(z[s.std]):1,min=s.min>=0?zahl(z[s.min]):0;
    const grund=s.grund>=0?norm(z[s.grund]):"";const st=s.status>=0?norm(z[s.status]):"";
    let status=/nicht|unent/.test(st)?"unentschuldigt":/entsch/.test(st)?"entschuldigt":"offen";
    if(status!=="entschuldigt"&&grund&&r.entschuldigt.includes(grund))status="entschuldigt";
    const verspaetung=(std===0&&min>0&&min<45)||/versp(ä|ae)t/.test(grund);
    const treffer=namen.get(norm(name))||[];
    daten.push({name,treffer,iso,std,min,status,verspaetung,kl});
    if(!treffer.length)fehlend.set(name,(fehlend.get(name)||0)+1);
    else if(new Set(treffer.map(t=>t.gruppe)).size<treffer.length)doppelt.set(name,treffer);
  }
  if(!daten.length)throw new Error("In der Datei stehen keine Fehlzeilen (Name und Datum).");
  return {daten,fehlend,klassen,doppelt,regeln:r};
}
function gruppeVorschlag(erg){
  const gezaehlt=new Map();for(const d of erg.daten)for(const t of d.treffer)gezaehlt.set(t.gruppe,(gezaehlt.get(t.gruppe)||0)+1);
  const best=[...gezaehlt.entries()].sort((a,b)=>b[1]-a[1])[0];return best?best[0]:(ordner.gruppen[0]||{}).id||"";
}
function pseudoZeilen(erg,gid){
  const out=[];let ohne=0;
  for(const d of erg.daten){const t=d.treffer.find(x=>x.gruppe===gid);if(!t){if(d.treffer.length)ohne++;continue}
    out.push({k:t.kuerzel,iso:d.iso,std:d.std,min:d.min,status:d.status,verspaetung:d.verspaetung})}
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
    const unent=l.filter(z=>z.status==="unentschuldigt"&&zaehlt(z)&&(!seit||z.iso>seit)).reduce((s,z)=>s+z.std,0);
    const ent=l.filter(z=>z.status==="entschuldigt"&&!z.verspaetung).reduce((s,z)=>s+z.std,0);
    const versp=l.filter(z=>z.verspaetung).length;
    // offene Fehlzeiten: zusammenhängende Schultage
    const tage=[...new Set(l.filter(z=>z.status==="offen"&&!z.verspaetung).map(z=>z.iso))].sort();const bloecke=[];
    for(const t of tage){const b=bloecke[bloecke.length-1];if(b&&naechsterSchultag(b.bis)>=t)b.bis=t;else bloecke.push({von:t,bis:t})}
    let offenStd=0,ueberStd=0;const fristen=[];
    for(const b of bloecke){const std=l.filter(z=>z.status==="offen"&&!z.verspaetung&&z.iso>=b.von&&z.iso<=b.bis).reduce((s,z)=>s+z.std,0);
      const ende=fristEnde(b.bis,r);const zustand=heute>ende?"abgelaufen":heute===ende?"heute":"laeuft";offenStd+=std;if(zustand==="abgelaufen")ueberStd+=std;fristen.push({...b,std,ende,zustand})}
    const farbe=unent>=r.schwelle?"rot":(ueberStd>0||fristen.some(f=>f.zustand==="heute")||unent+ueberStd>=r.schwelle)?"gelb":"gruen";
    const schritte=[];
    if(unent>=r.schwelle)schritte.push(`Eltern informieren (${fmt(unent)} unentsch. Std.${seit?" seit "+datumDE(seit):""})`);
    const ab=fristen.filter(f=>f.zustand==="abgelaufen");if(ab.length)schritte.push(`Entschuldigung fehlt: ${ab.map(f=>tag(f)).join(", ")}`);
    const hz=fristen.filter(f=>f.zustand==="heute");if(hz.length)schritte.push(`Frist endet heute: ${hz.map(f=>tag(f)).join(", ")}`);
    const lf=fristen.filter(f=>f.zustand==="laeuft");if(lf.length)schritte.push(`Entschuldigung bis ${lf.map(f=>datumDE(f.ende)).join(", ")} (${lf.map(f=>tag(f)).join(", ")})`);
    if(farbe!=="rot"&&unent+ueberStd>=r.schwelle&&unent<r.schwelle)schritte.push("Schwelle erreicht, falls die offenen Stunden unentschuldigt bleiben");
    liste.push({k,unent,ent,versp,offenStd,ueberStd,fristen,farbe,seit,schritte});
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
  const kopf=`# Fehlzeiten ${gid} · Stand ${heuteISO()} · Quelle: ${quelle}${zeitraum?" · Zeitraum "+zeitraum:""} · nur Kürzel (Startseite, Fehlzeiten-Ampel)`;
  const t=[kopf,"Kuerzel\tDatum\tFehlstd\tFehlmin\tStatus\tVerspaetung",...zeilen.map(z=>[z.k,z.iso,z.std,z.min,z.status,z.verspaetung?"ja":"nein"].join("\t"))].join("\n")+"\n";
  await schreibe(f,DATEI(gid),t);
}
async function standLesen(gid){
  try{const root=sdRoot();if(!root)return null;const f=await (await root.getDirectoryHandle("ausgaben")).getDirectoryHandle("fehlzeiten");
    const t=await lies(await f.getFileHandle(DATEI(gid)));if(!t)return null;const z=t.split(/\r?\n/);
    const stand=((z[0]||"").match(/Stand (\d{4}-\d{2}-\d{2})/)||[])[1]||"";const zeitraum=((z[0]||"").match(/Zeitraum ([^·]+)/)||[])[1]||"";
    const zeilen=z.slice(2).filter(Boolean).map(x=>{const [k,iso,std,min,status,v]=x.split("\t");return {k,iso,std:zahl(std),min:zahl(min),status,verspaetung:v==="ja"}});
    return {stand,zeitraum:zeitraum.trim(),zeilen}}catch{return null}
}

/* ---------- Helfer: Export aus WebUntis holen ---------- */
function wuRuf(op,extra){return new Promise((ok,nein)=>{const id=Math.random().toString(36).slice(2);
  const t=setTimeout(()=>{window.removeEventListener("message",h);nein(new Error("Der Schulassistenz-Helfer antwortet nicht. Ist Version 0.6 geladen? Seite neu laden (F5)."))},60000);
  function h(e){if(e.source!==window||!e.data||e.data.sa!=="wu-export-antwort"||e.data.id!==id)return;clearTimeout(t);window.removeEventListener("message",h);ok(e.data)}
  window.addEventListener("message",h);window.postMessage({sa:"wu-export",op,id,...(extra||{})},"*")})}
const helferVersion=()=>document.documentElement.getAttribute("data-sa-helfer")||"";
const helferKann=()=>{const v=helferVersion().split(".").map(Number);return v.length>1&&(v[0]>0||v[1]>=6)};

/* ---------- Oberfläche ---------- */
const css=document.createElement("style");
css.textContent=`.fz-dot{display:inline-block;width:11px;height:11px;border-radius:50%;flex:none;vertical-align:-1px}
.fz-dot.rot{background:var(--err)}.fz-dot.gelb{background:var(--warn)}.fz-dot.gruen{background:var(--ok)}
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
  if(ordner.zustand!=="an"||!sdRoot()){slot.innerHTML=`<div class="panel"><h4>Fehlzeiten-Ampel</h4><p>Dafür braucht die Seite deine Akten und Kürzellisten. Bitte rechts zuerst den Datenordner${sdExtern()?" und den Schülerdaten-Ordner":""} verbinden.</p><div class="actions"><button class="btn ghost" id="p-close">Schließen</button></div></div>`;$("#p-close").addEventListener("click",()=>slot.innerHTML="");return}
  if(!F||(gid&&F.gid!==gid)){const g=gid||store.get("fz-gruppe","")||((ordner.gruppen.find(x=>/^\d+[a-z]/i.test(x.id))||ordner.gruppen[0]||{}).id);
    const s=g?await standLesen(g):null;F=s?{gid:g,zeilen:s.zeilen,stand:s.stand,zeitraum:s.zeitraum,quelle:"gespeicherter Stand",neu:false}:{gid:g,zeilen:null}}
  zeichnen();slot.scrollIntoView({block:"nearest",behavior:"smooth"});
}
function zeichnen(meldung){
  const slot=$("#panel-slot");const r=regeln(),heute=heuteISO();
  const namen=F.namen||{};const zeigeNamen=store.get("namen-zeigen",true);
  const gruppenOpt=ordner.gruppen.map(g=>`<option value="${esc(g.id)}"${g.id===F.gid?" selected":""}>${esc(g.id)}</option>`).join("");
  const regelText=`Regeln${r.ausProfil?" aus dem Profil":" (Standard, nicht im Profil)"}: Eltern ab ${fmt(r.schwelle)} unentschuldigten Stunden${r.ab==="letzte_benachrichtigung"?" seit der letzten Benachrichtigung":r.ab==="halbjahr"?" je Halbjahr":" im Schuljahr"}; Entschuldigung bis ${r.frist} ${r.einheit==="kalendertage"?"Kalendertage":"Schultage"} nach dem letzten Fehltag${ferien().length?"":" (Ferien und Feiertage nicht berücksichtigt, eintragbar in meine-einstellungen.js unter ferien)"}; Verspätungen zählen ${r.verspaetung?"":"nicht "}zur Schwelle${r.entschuldigt.length?"; als entschuldigt gilt auch: "+(r.entschuldigtText||r.entschuldigt).join(", "):""}.`;
  let tabelle="",sum="";
  if(F.zeilen){
    const a=ampel(F.zeilen,F.gid,r,heute);F.ampel=a;const n=f=>a.filter(x=>x.farbe===f).length;
    sum=`<div class="fz-sum"><span><span class="fz-dot rot"></span><b>${n("rot")}</b> Eltern informieren</span><span><span class="fz-dot gelb"></span><b>${n("gelb")}</b> Entschuldigung fällig oder Schwelle droht</span><span><span class="fz-dot gruen"></span><b>${n("gruen")}</b> ohne Handlungsbedarf</span>${F.stand?`<span class="note">Stand ${datumDE(F.stand)}${F.zeitraum?" · "+esc(F.zeitraum):""}</span>`:""}</div>`;
    tabelle=`<div class="fz-tab-wrap"><table class="fz-tab"><thead><tr><th></th><th>Kürzel</th><th style="text-align:right">unentsch.</th><th style="text-align:right">offen</th><th style="text-align:right">entsch.</th><th style="text-align:right">zu spät</th><th>Nächster Schritt</th></tr></thead><tbody>${a.map(x=>{
      const nm=zeigeNamen&&namen[x.k]?`<div class="nm">${esc([namen[x.k].vor,namen[x.k].nach].filter(Boolean).join(" "))}</div>`:"";
      return `<tr class="${x.farbe}"><td><span class="fz-dot ${x.farbe}" title="${x.farbe==="rot"?"rot":x.farbe==="gelb"?"gelb":"grün"}"></span></td><td><span class="k">${esc(x.k)}</span>${nm}</td><td class="z">${fmt(x.unent)}${x.seit?`<div class="nm">seit ${datumDE(x.seit)}</div>`:""}</td><td class="z">${fmt(x.offenStd)}${x.ueberStd?`<div class="nm">${fmt(x.ueberStd)} überfällig</div>`:""}</td><td class="z">${fmt(x.ent)}</td><td class="z">${x.versp||""}</td><td class="sch">${x.schritte.map(s=>`<div>${esc(s)}</div>`).join("")}${x.unent>0||x.farbe==="rot"?`<div><button class="linkbtn" data-inf="${esc(x.k)}">Eltern informiert …</button></div><div class="fz-ja" data-ja="${esc(x.k)}" hidden></div>`:""}</td></tr>`}).join("")}</tbody></table></div>`;
  }
  const fehl=F.fehlend&&F.fehlend.size?`<div class="fz-warn"><b>${F.fehlend.size===1?"1 Name steht":F.fehlend.size+" Namen stehen"} in keiner Kürzelliste.</b> Ihre Zeilen werden nicht gespeichert und nicht ausgewertet. Trag sie in die Kürzelliste ein (rechts „Kürzel hinzufügen“) und lies die Datei noch einmal ein. Die Namen siehst nur du in diesem Fenster:<ul>${[...F.fehlend.entries()].map(([n,c])=>`<li>${esc(n)} (${c} Zeilen)</li>`).join("")}</ul></div>`:"";
  const ohne=F.ohne?`<div class="fz-warn">${F.ohne} Zeilen gehören zu Kindern aus anderen Lerngruppen und sind hier nicht enthalten. Andere Lerngruppe wählen, um sie zu sehen.</div>`:"";
  const helfer=helferKann()?`<button class="btn primary" id="fz-holen">Aus WebUntis holen</button>`:"";
  slot.innerHTML=`<div class="panel" role="region" aria-label="Fehlzeiten-Ampel"><div class="p-kopf"><h4>Fehlzeiten-Ampel</h4><span class="sp"></span><label class="r-skala">Lerngruppe <select id="fz-gruppe">${gruppenOpt}</select></label><label class="r-skala"><input type="checkbox" id="fz-namen"${zeigeNamen?" checked":""}> Namen zeigen</label></div>
    <div class="actions" style="margin-top:0">${helfer}<label class="btn ${helfer?"ghost":"primary"}">Export-Datei wählen<input type="file" id="fz-datei" accept=".xls,.xlsx,.csv,.txt,.tsv,.htm,.html" hidden></label><span class="toast" id="fz-toast">${esc(meldung||"")}</span></div>
    <div class="fz-drop" id="fz-drop">WebUntis-Export „Abwesenheiten“ hierher ziehen (.xls, .xlsx oder .csv). Die Datei wird nur in diesem Fenster gelesen.</div>
    <p class="guard" id="fz-guard" hidden></p>
    <div id="fz-lernen"></div>
    ${fehl}${ohne}${sum}${tabelle}
    ${F.zeilen?"":`<p class="note">Für ${esc(F.gid||"diese Lerngruppe")} ist noch kein Stand gespeichert.</p>`}
    <p class="note">${esc(regelText)}</p>
    <p class="note">Datenschutz: Gespeichert und an Claude gegeben werden nur Kürzel, Datum, Stunden und Status. Namen, Externe Id, Abwesenheitsgründe, Texte und Lehrkräfte werden verworfen. Ablage: ${esc(sdPfad("ausgaben/fehlzeiten/"+DATEI(F.gid||"<gruppe>")))}.</p>
    <div class="actions">${F.zeilen&&F.neu?`<button class="btn primary" id="fz-speichern">Stand speichern</button>`:""}${F.zeilen?`<button class="btn ghost" id="fz-claude">Mit Claude abgleichen</button>`:""}<button class="btn ghost" id="p-close">Schließen</button></div></div>`;
  $("#p-close").addEventListener("click",()=>{slot.innerHTML=""});
  $("#fz-namen").addEventListener("change",e=>{store.set("namen-zeigen",e.target.checked);zeichnen()});
  $("#fz-gruppe").addEventListener("change",async e=>{const g=e.target.value;store.set("fz-gruppe",g);
    if(F.roh){const p=pseudoZeilen(F.roh,g);F={...F,gid:g,zeilen:p.zeilen,ohne:p.ohne,namen:await namenLesen(g)};}
    else{const s=await standLesen(g);F=s?{gid:g,zeilen:s.zeilen,stand:s.stand,zeitraum:s.zeitraum,quelle:"gespeicherter Stand",neu:false,namen:await namenLesen(g)}:{gid:g,zeilen:null}}
    zeichnen()});
  const datei=$("#fz-datei");datei.addEventListener("change",()=>{if(datei.files[0])einlesen(datei.files[0].arrayBuffer(),"Datei "+datei.files[0].name)});
  const drop=$("#fz-drop");["dragenter","dragover"].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.add("ueber")}));
  ["dragleave","drop"].forEach(t=>drop.addEventListener(t,()=>drop.classList.remove("ueber")));
  drop.addEventListener("drop",e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)einlesen(f.arrayBuffer(),"Datei "+f.name)});
  if($("#fz-holen"))$("#fz-holen").addEventListener("click",holen);
  if($("#fz-speichern"))$("#fz-speichern").addEventListener("click",speichern);
  if($("#fz-claude"))$("#fz-claude").addEventListener("click",anClaude);
  slot.querySelectorAll("[data-inf]").forEach(b=>b.addEventListener("click",()=>informiertFragen(b.dataset.inf)));
  if(!F.namen&&F.gid)namenLesen(F.gid).then(m=>{F.namen=m;if(Object.keys(m).length&&F.zeilen&&store.get("namen-zeigen",true))zeichnen(meldung)});
}
async function einlesen(bufP,quelle,zeitraum){
  const g=$("#fz-guard");g.hidden=true;$("#fz-toast").textContent="Lese …";
  try{const erg=await verarbeiten(await bufP);const gid=F.gid&&erg.daten.some(d=>d.treffer.some(t=>t.gruppe===F.gid))?F.gid:gruppeVorschlag(erg);
    const p=pseudoZeilen(erg,gid);
    F={gid,roh:erg,zeilen:p.zeilen,ohne:p.ohne,fehlend:erg.fehlend,doppelt:erg.doppelt,stand:heuteISO(),zeitraum:zeitraum||"",quelle,neu:true,namen:await namenLesen(gid)};
    zeichnen(`${erg.daten.length} Zeilen gelesen. Noch nicht gespeichert.`)}
  catch(e){$("#fz-toast").textContent="";g.hidden=false;g.textContent=e.message||String(e)}
}
async function holen(){
  const g=$("#fz-guard");g.hidden=true;const t=$("#fz-toast");t.textContent="Frage WebUntis …";
  try{const von=schuljahrBeginn(),bis=heuteISO();const a=await wuRuf("holen",{von,bis});
    if(!a.ok){t.textContent="";
      if(a.lernen)return lernenZeigen();
      g.hidden=false;g.textContent=a.fehler||"WebUntis hat nicht geantwortet.";
      if(a.anmelden){const b=document.createElement("button");b.className="btn small ghost";b.textContent="WebUntis öffnen";b.style.marginLeft="8px";b.addEventListener("click",()=>wuRuf("anmelden"));g.appendChild(b)}
      return}
    const buf=davBuf(a.daten);
    await einlesen(Promise.resolve(buf),"WebUntis über den Helfer",a.zeitraum?`${datumDE(von)}–${datumDE(bis)}`:"Zeitraum wie beim ersten Export")}
  catch(e){t.textContent="";g.hidden=false;g.textContent=e.message||String(e)}
}
async function lernenZeigen(){
  let blob=false;try{const s=await wuRuf("status");blob=!!s.blob}catch{}
  $("#fz-lernen").innerHTML=`<div class="fz-warn"><b>Einmal einrichten:</b> Der Helfer lernt den Export deiner Schule, wenn du ihn einmal selbst herunterlädst.<ol style="margin:6px 0 0;padding-left:18px"><li>In WebUntis den Bericht <b>Abwesenheiten pro Schüler</b> deiner Klasse öffnen (Klassenbuch › Berichte bzw. Abwesenheiten › Berichte), Zeitraum ab Schuljahresbeginn.</li><li>Als Excel oder CSV herunterladen. Der Helfer merkt sich nur die Adresse, keine Daten.</li><li>Die heruntergeladene Datei hierher ziehen. Danach im Download-Ordner löschen, sie enthält Klarnamen.</li></ol>Ab dann reicht „Aus WebUntis holen“.${blob?"<br><b>Hinweis:</b> WebUntis hat die Datei bei dir im Browser erzeugt. Dann kann der Helfer sie nicht selbst holen, und du ziehst die Datei jedes Mal hierher.":""}</div>`;
}
async function speichern(){
  const g=$("#fz-guard");g.hidden=true;
  try{await standSpeichern(F.gid,F.zeilen,F.quelle,F.zeitraum);F.neu=false;F.roh=null;F.fehlend=null;F.ohne=0;await seitenleiste();zeichnen("Gespeichert (nur Kürzel). Die Ampel steht jetzt auch rechts.")}
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

window.saFehlzeiten={zeigen,aktualisieren:()=>seitenleiste().catch(()=>{}),_test:{tabelleLesen,verarbeiten,ampel,regeln,fristEnde,datumISO,pseudoZeilen,cfbStream,biffZeilen}};
})();
