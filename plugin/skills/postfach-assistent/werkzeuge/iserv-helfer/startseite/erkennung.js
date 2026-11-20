/* schulassistenz · Termine erkennen (Probe für „Als Nächstes“)
   Gehört zum Plugin und wird bei Updates ersetzt. Wird nach dem Hauptskript geladen und nutzt dessen Funktionen
   (kalListe, evRelevant, ordner, ALLE, oeffne, store, esc, $, isoTag, datumDE …).

   Nur Ansicht: liest die Termine der eingeschalteten Kalender (IServ, WebUntis-Abo, Kalenderdateien) und
   planung/aufgaben.md, ordnet jedem Termin eine Art zu (Klassenarbeit, Konferenz, Wandertag …), sucht die passende
   Lerngruppe und schlägt den nächsten Schritt vor. Es wird nichts gespeichert und nichts an Claude geschickt;
   Termintitel bleiben in diesem Fenster. */
(function(){
"use strict";
if(typeof kalListe!=="function")return;

/* ---------- Arten von Terminen ---------- */
/* Reihenfolge zählt: die erste passende Art gewinnt. */
const ARTEN=[
  {id:"mitarbeit",name:"Mitarbeitsnote (Quartal)",farbe:"warn",muster:/^Mitarbeitsnote( \d\. Quartal)? (vor den |bis zum )/,nurIntern:true},
  {id:"konf-zeugnis",name:"Zeugnis-/Klassenkonferenz",farbe:"warn",
   muster:/zeugniskonferenz|klassenkonferenz|p(ä|ae)d(agogische|\.)?\s*konf|notenkonferenz|versetzungskonferenz|\bzk\b/i},
  {id:"notenschluss",name:"Notenschluss / Noteneingabe",farbe:"warn",
   muster:/notenschluss|bewertungs(stopp|schluss|ende)|notenstopp|noteneingabe|notenabgabe|zeugnisnoten|noten\s*(eintragen|abgeben)|leb[- ]?(schluss|abgabe|eingabe)/i},
  {id:"zeugnisausgabe",name:"Zeugnisausgabe",farbe:"",muster:/zeugnisausgabe|zeugnisse\s*(ausgeben|ausgabe)|zeugnistag/i},
  {id:"pruefung",name:"Abschluss-/Abiturprüfung",farbe:"warn",
   muster:/abitur|abiprüfung|abschlussprüfung|mündliche\s*prüfung|präsentationsprüfung|prüfungstag|nachprüfung/i},
  {id:"klassenarbeit",name:"Klassenarbeit / Klausur",farbe:"warn",
   muster:/\bka\s*\d|\bka\b|klassenarbeit|klausur(?!tagung)|lernkontrolle|lernzielkontrolle|\blzk\b|vergleichsarbeit|\bvera\b|\barbeit\s*\d/i},
  {id:"test",name:"Test / Referat",farbe:"",
   muster:/\btest\b|\btests\b|referat|präsentation|vortrag|abfrage|vokabeltest|hausaufgabenüberprüfung/i},
  {id:"konferenz",name:"Konferenz / Besprechung",farbe:"",
   muster:/konferenz|dienstbesprechung|\bdb\b|fachgruppe|fachschaft|\bfk\b|steuergruppe|teamsitzung|besprechung|schulvorstand|arbeitskreis|\bag\s+[a-zäöü]/i},
  {id:"eltern",name:"Elternsprechtag / Elternabend",farbe:"",
   muster:/elternsprechtag|elternabend|elternsprechabend|elterngespräch|elternversammlung|klassenpflegschaft|schulelternrat|elternrat/i},
  {id:"ausflug",name:"Wandertag / Exkursion / Fahrt",farbe:"",
   muster:/wandertag|exkursion|ausflug|klassenfahrt|studienfahrt|kursfahrt|abschlussfahrt|skifahrt|schullandheim|museum|theaterbesuch|unterrichtsgang|lerngang|betriebsbesichtigung/i},
  {id:"projekt",name:"Projekttag / Sondertag",farbe:"",
   muster:/projekttag|projektwoche|sportfest|bundesjugendspiele|sponsorenlauf|schulfest|tag der offenen tür|berufsorientierung|\bbo[- ]?tag|praktikum|girls.?day|boys.?day|zukunftstag|methodentag|bewerbungstraining/i},
  {id:"frei",name:"Unterrichtsfrei",farbe:"ok",
   muster:/ferien|feiertag|brückentag|beweglicher\s*ferientag|unterrichtsfrei|studientag|schulfrei|pädagogischer\s*tag/i},
  {id:"fortbildung",name:"Fortbildung",farbe:"",muster:/fortbildung|schilf|\bfobi\b|workshop|seminar|tagung/i},
  {id:"aufsicht",name:"Aufsicht / Vertretung",farbe:"",muster:/aufsicht|pausenaufsicht|vertretung|bereitschaft|präsenz/i},
  {id:"frist",name:"Frist / Abgabe",farbe:"",muster:/\bfrist\b|abgabe|deadline|einreichen|rückmeldung bis/i},
];

/* ---------- Lerngruppe aus dem Titel erkennen ---------- */
const FACH={ma:["ma","mathe","mathematik"],mathematik:["ma","mathe","mathematik"],
  nawi:["nawi","nw","naturwissenschaften","naturwissenschaft"],nw:["nawi","nw","naturwissenschaften"],
  inf:["inf","info","informatik","if"],informatik:["inf","info","informatik","if"],
  bio:["bio","biologie","bi"],biologie:["bio","biologie","bi"],che:["che","ch","chemie"],chemie:["che","ch","chemie"],
  phy:["phy","ph","physik"],physik:["phy","ph","physik"],de:["de","deu","deutsch"],deutsch:["de","deu","deutsch"],
  en:["en","eng","englisch"],englisch:["en","eng","englisch"],ek:["ek","erdkunde","geo"],ge:["ge","geschichte"],
  po:["po","politik","pw"],sp:["sp","sport"],mu:["mu","musik"],ku:["ku","kunst"],re:["re","rel","religion"],wn:["wn","werte"],
  fr:["fr","franz","französisch"],la:["la","latein"],sn:["sn","spa","spanisch"],wpk:["wpk"]};
const woerter=t=>String(t||"").toLowerCase().replace(/\b(\d{1,2})([a-f])\b/g,"$1 $2 $1$2").split(/[^a-zäöüß0-9]+/).filter(Boolean);
function gruppeInfo(g){
  const t=g.gruppeText||"";const feld=n=>((t.match(new RegExp("^"+n+":\\s*(.+)$","mi"))||[])[1]||"").trim();
  const teile=g.id.toLowerCase().split(/[-_ ]+/);
  const m=g.id.match(/^(\d{1,2})([a-f])?/i);
  const jg=+(feld("jahrgang")||(m&&m[1])||0),klasse=m&&m[2]?(m[1]+m[2]).toLowerCase():"";
  const fachW=new Set();[...teile,...woerter(feld("fach"))].forEach(x=>(FACH[x]||[]).forEach(w=>fachW.add(w)));
  const rest=teile.filter(x=>!/^\d/.test(x)&&!FACH[x]);  // z. B. e (E-Kurs), ea, wpk
  if(/e-?kurs/i.test(feld("kurs")))rest.push("e");if(/\bwpk\b/i.test(g.id))rest.push("wpk");
  return {id:g.id,jg,klasse,fachW,rest:[...new Set(rest)],oberstufe:jg>=11};
}
function gruppeErkennen(titel){
  const w=woerter(titel),ws=new Set(w);if(!w.length)return null;
  const zahlen=w.filter(x=>/^(5|6|7|8|9|10|11|12|13)$/.test(x)).map(Number);
  const klassen=w.filter(x=>/^(5|6|7|8|9|10|11|12|13)[a-f]$/.test(x));
  const kand=[];
  for(const g of (ordner.gruppen||[]).map(gruppeInfo)){
    if(zahlen.length&&g.jg&&!zahlen.includes(g.jg))continue;
    if(klassen.length&&g.klasse&&!klassen.includes(g.klasse))continue;
    const fach=[...g.fachW].some(x=>ws.has(x));
    if(!fach&&!(g.klasse&&klassen.includes(g.klasse)))continue;
    let p=fach?2:0;if(g.klasse&&klassen.includes(g.klasse))p+=2;if(g.jg&&zahlen.includes(g.jg))p+=1;
    p+=g.rest.filter(x=>ws.has(x)).length;
    kand.push({g,p})}
  if(!kand.length)return null;
  kand.sort((a,b)=>b.p-a.p);
  if(kand.length>1&&kand[0].p===kand[1].p)return {mehrdeutig:kand.filter(k=>k.p===kand[0].p).map(k=>k.g.id)};
  return {id:kand[0].g.id,oberstufe:kand[0].g.oberstufe};
}
function bezugText(titel,gr){
  if(gr&&gr.id)return gr.id;
  if(gr&&gr.mehrdeutig)return "unklar: "+gr.mehrdeutig.join(" / ");
  const jg=typeof kfJahrgaenge==="function"?[...kfJahrgaenge(titel)].sort((a,b)=>a-b):[];
  const kl=[...String(titel).matchAll(/(?<![\d])(5|6|7|8|9|10|11|12|13)\s?([a-f])(?![a-zäöüß])/gi)].map(m=>m[1]+m[2].toLowerCase());
  if(kl.length)return "Klasse "+[...new Set(kl)].join(", ");
  if(jg.length)return "Jg. "+jg.join(", ");
  return "";
}
const nummer=t=>{const m=String(t).match(/(?:\bka|klassenarbeit|klausur|arbeit)\s*(?:nr\.?\s*)?(\d{1,2})\b(?![.:]\d)/i)||String(t).match(/\b(\d)\.\s*(?:ka|klassenarbeit|klausur|arbeit)\b/i);return m?+m[1]:null};

/* ---------- Nächster Schritt je Art und Zeitpunkt ---------- */
function akteZaehlen(gid,nr){
  const g=(ordner.gruppen||[]).find(x=>x.id===gid);if(!g||!nr)return null;
  const re=new RegExp("\\|\\s*Klausur\\s*"+nr+"\\s*:","i");
  return {mit:g.akten.filter(a=>re.test(a.text)).length,alle:g.akten.length};
}
function schritt(art,t,tage){
  const gid=t.gruppe&&t.gruppe.id,ob=t.gruppe&&t.gruppe.oberstufe;
  const S=(text,kachel,vor,leb)=>({text,kachel,vor:vor||(gid?{gruppe:gid}:{}),leb:leb&&gid&&!ob?leb:null});
  switch(art){
    case "klassenarbeit":{
      if(tage>14)return S("Klausur entwerfen (Erwartungshorizont, Notenschlüssel)","pruefung");
      if(tage>0)return S("Klausur fertigstellen, Druck und Nachschreibtermin klären","pruefung");
      const z=akteZaehlen(gid,t.nr);
      if(!z||!z.mit)return S(`Korrigieren${t.nr?` (Klausur ${t.nr})`:""}`,"korrektur");
      if(z.mit<z.alle)return S(`Noten in den Akten: ${z.mit} von ${z.alle}. Fehlende nachtragen`,"notenuebersicht");
      return ob?S("Noten vollständig in den Akten (Oberstufe, nicht in LEB)",""):S(`Noten vollständig in den Akten → nach LEB-online übertragen`,"notenuebersicht",null,t.nr?"ka:Nr. "+t.nr:null)}
    case "mitarbeit":{const m=t._mm;if(!m)return S("","");
      const seit=`seit ${datumDE(m.ab)}`;
      const vor=m.wenig?`${m.wenig} von ${m.alle} mit weniger als 2 Mitarbeitseinträgen ${seit}${m.ohne?` (${m.ohne} ohne)`:""}. `:`Alle haben mindestens 2 Einträge ${seit}. `;
      return S(vor+(ob?"Note festsetzen.":"Note festsetzen, dann nach LEB-online."),"beob-note",null,"mm")}
    case "test":return tage>0?S("Angesagt. Danach Noten eintragen",""):S("Noten eintragen (Live-Beobachtung oder Notenübersicht)","notenuebersicht");
    case "konf-zeugnis":return tage>21?S("Vormerken. Ab 3 Wochen vorher Zeugnisnoten vorbereiten",""):tage>=0?S("Zeugnisnoten und Tischvorlage vorbereiten","konferenz"):S("Beschlüsse in die Akten übernehmen","dokument");
    case "notenschluss":return tage>=0?S("Zeugnisnoten vorbereiten und eintragen","zeugnis-noten"):S("Vorbei. Noten vollständig?","notenuebersicht");
    case "zeugnisausgabe":return S(tage>=0?"Zeugnisse prüfen, Bemerkungen fertig?":"Vorbei","");
    case "pruefung":return S(tage>=0?"Prüfung vorbereiten (Aufgaben, Protokoll)":"Protokoll ablegen",tage>=0?"pruefung":"dokument");
    case "konferenz":return tage>=0?S("Tagesordnung und Unterlagen im Postfach suchen","postfach",{}):S("Protokoll/Beschlüsse sichten","dokument",{});
    case "eltern":return tage>=0?S("Gespräche vorbereiten (Akte, Noten, Fehlzeiten)","eltern"):S("Gesprächsprotokolle schreiben","eltern-protokoll");
    case "ausflug":return tage>21?S("Exkursion planen (Ort, Anfahrt, Kosten)","exkursion"):tage>=0?S("Elternbrief und Rücklauf","exkursion-elternbrief"):S("Rücklauf und Geld abrechnen","exkursion-ruecklauf");
    case "projekt":return S(tage>=0?"Vormerken, Woche anpassen":"Vorbei",tage>=0?"woche":"",{});
    case "frei":return S(tage>=0?"Stunden fallen aus. Woche/Einheit anpassen":"Vorbei",tage>=0?"woche":"",{});
    case "fortbildung":return S(tage>=0?"Vertretung/Material für ausfallende Stunden klären":"Unterlagen ablegen",tage>=0?"woche":"",{});
    case "frist":return S(tage>=0?"Frist vormerken":"Abgelaufen. Erledigt?","",{});
    default:return S("","",{});
  }
}


/* ---------- Mündliche Mitarbeitsnote vor den Ferien ---------- */
/* Ferien aus meine-einstellungen.js (ferien) und aus Kalenderterminen mit „Ferien“ im Titel.
   Je Ferienbeginn in den nächsten 3 Wochen: eine Erinnerung je Lerngruppe, Zeitraum seit den letzten Ferien. */
const plusT=(iso,n)=>{const d=new Date(iso+"T12:00");d.setDate(d.getDate()+n);return isoTag(d)};
function ferienListe(){
  const l=[];
  (Array.isArray(E.ferien)?E.ferien:[]).forEach(x=>{const [a,b]=Array.isArray(x)?[x[0],x[1]||x[0]]:[x,x];if(/^\d{4}-\d{2}-\d{2}$/.test(a))l.push({von:a,bis:b,name:"Ferien"})});
  for(const k of kalListe()){if(!k.an)continue;for(const e of (k.events||[])){
    if(!e.start||!/ferien/i.test(e.titel||"")||/feiertag|beweglich/i.test(e.titel||""))continue;
    let bis=e.ende?new Date(e.ende):new Date(e.start);if(e.ganz&&e.ende)bis.setDate(bis.getDate()-1);
    l.push({von:isoTag(e.start),bis:isoTag(bis<e.start?e.start:bis),name:(e.titel||"Ferien").trim()})}}
  // gleiche oder überlappende Ferien zusammenfassen, Kalendername bevorzugen
  l.sort((a,b)=>a.von.localeCompare(b.von));const out=[];
  for(const f of l){const o=out.find(x=>f.von<=plusT(x.bis,3)&&f.bis>=plusT(x.von,-3));
    if(o){if(f.bis>o.bis)o.bis=f.bis;if(f.von<o.von)o.von=f.von;if(o.name==="Ferien")o.name=f.name}else out.push({...f})}
  return out;
}
/* Quartale richten sich nach den großen Ferien (mind. 5 Tage): Herbst-, Weihnachts-, Osterferien.
   Quartal n endet mit dem letzten Ferientag, so dass Noten aus den Ferien noch zum alten Quartal zählen.
   Ohne drei bekannte große Ferien: null (dann gelten feste Monate). */
const tageZw=(a,b)=>Math.round((new Date(b+"T12:00")-new Date(a+"T12:00"))/864e5);
function grosseFerien(sj){const j=+sj;return ferienListe().filter(f=>tageZw(f.von,f.bis)>=4&&f.von>=`${j}-08-15`&&f.von<=`${j+1}-06-30`)}
/* Notenschluss zum Halbjahr (1.12.–15.2.) und am Schuljahresende (15.4.–31.7.): Kalendertermin („Notenschluss“,
   „Noteneingabe“ …) oder notenschluss in meine-einstellungen.js (Datum oder Liste).
   Das 2. Quartal endet am Halbjahres-Notenschluss, das 4. am Notenschluss zum Schuljahresende. */
function notenschluss(sj,halbjahr){
  const j=+sj,a=halbjahr?`${j}-12-01`:`${j+1}-04-15`,b=halbjahr?`${j+1}-02-15`:`${j+1}-07-31`,l=[];
  [].concat(E.bewertungsstopp||[],E.notenschluss||[]).forEach(x=>{if(/^\d{4}-\d{2}-\d{2}$/.test(String(x)))l.push(String(x))});
  const ns=ARTEN.find(x=>x.id==="notenschluss").muster;
  for(const k of kalListe()){if(!k.an)continue;for(const e of (k.events||[]))if(e.start&&ns.test(e.titel||""))l.push(isoTag(e.start))}
  return l.filter(d=>d>=a&&d<=b).sort().pop()||"";
}
function quartale(sj){
  const j=+sj;if(!j)return null;const g=grosseFerien(sj).slice(0,3),ns=notenschluss(sj),hj=notenschluss(sj,true);
  if(g.length<3&&!ns&&!hj)return null;
  const e=g.length<3?[`${j}-10-31`,`${j+1}-01-31`,`${j+1}-04-30`]:[g[0].bis,g[1].bis,g[2].bis];
  if(hj)e[1]=hj;
  const ende4=ns||`${j+1}-07-31`;
  return [[`${j}-08-01`,e[0]],[plusT(e[0],1),e[1]],[plusT(e[1],1),e[2]],[plusT(e[2],1),ende4]];
}
function schuljahrVon(iso){const [y,m]=iso.split("-").map(Number);return m>=8?y:y-1}
function letzterSchultag(iso){let d=plusT(iso,-1);for(let i=0;i<4;i++){const w=new Date(d+"T12:00").getDay();if(w!==0&&w!==6)break;d=plusT(d,-1)}return d}
/* Anlässe für die Mitarbeitsnote: vor Herbst- und Osterferien; 2. und 4. Quartal zum Notenschluss
   (ohne bekannten Notenschluss: vor den Weihnachts- bzw. Sommerferien). */
function mmAnlaesse(){
  const fl=ferienListe().filter(f=>tageZw(f.von,f.bis)>=4),out=[];
  fl.forEach((f,i)=>{const sj=schuljahrVon(f.von);
    if(f.von>=`${sj+1}-06-01`&&notenschluss(sj))return;  // Sommer: stattdessen Notenschluss
    if(f.von>=`${sj}-12-01`&&f.von<=`${sj+1}-02-15`&&notenschluss(sj,true))return;  // Weihnachten/Halbjahr: stattdessen Halbjahres-Notenschluss
    const name=/ferien/i.test(f.name)?f.name.replace(/^\s*(die\s+)?/i,""):"Ferien";
    out.push({tag:letzterSchultag(f.von),grenze:f.von,sj,titelEnde:`vor den ${name}`,quelle:"Erinnerung (Ferienbeginn "+datumDE(f.von)+")",vorher:i>0?plusT(fl[i-1].bis,1):plusT(f.von,-70)})});
  const jetzt=schuljahrVon(isoTag(new Date()));
  [jetzt,jetzt-1].forEach(sj=>[true,false].forEach(h=>{const ns=notenschluss(sj,h);if(ns)out.push({tag:ns,grenze:plusT(ns,1),sj,titelEnde:h?"bis zum Bewertungsstopp (Halbjahr)":"bis zum Bewertungsstopp",quelle:"Erinnerung (Bewertungsstopp "+datumDE(ns)+")",vorher:plusT(ns,-70)})}));
  return out;
}
function ferienErinnerungen(von,bis){
  const heute=isoTag(new Date()),out=[];
  for(const x of mmAnlaesse()){
    const tage=tageZw(heute,x.tag);
    if(tage>21||tage<-2||new Date(x.tag+"T12:00")<von||new Date(x.tag+"T12:00")>bis)continue;
    const q=quartale(x.sj);const qn=q?q.findIndex(r=>x.tag>=r[0]&&x.tag<=r[1])+1:0;
    const ab=q&&qn?q[qn-1][0]:x.vorher;
    for(const g of (ordner.gruppen||[])){
      const info=gruppeInfo(g);let wenig=0,ohne=0;
      g.akten.forEach(a=>{const n=(typeof notenAusAkte==="function"?notenAusAkte(a.text).mm:[]).filter(e=>!e.alt&&e.d>=ab&&e.d<x.grenze).length;if(n<2)wenig++;if(!n)ohne++});
      out.push({iso:x.tag,zeit:"",titel:`Mitarbeitsnote${qn?` ${qn}. Quartal`:""} ${x.titelEnde}`,quelle:x.quelle,weg:false,
        _mm:{ab,wenig,ohne,alle:g.akten.length},_gruppe:{id:g.id,oberstufe:info.oberstufe}})}
  }
  return out;
}

/* ---------- Termine sammeln ---------- */
function termineSammeln(von,bis,auchGefiltert){
  const out=[];
  for(const k of kalListe()){
    if(!k.an)continue;
    for(const e of (k.events||[])){
      if(!e.start||e.start<von||e.start>bis)continue;
      if(typeof istAus==="function"&&istAus(e))continue;
      const rel=typeof evRelevant==="function"?evRelevant(e,k):true;
      if(!rel&&!auchGefiltert)continue;
      out.push({iso:isoTag(e.start),zeit:e.ganz?"":hhmm(e.start),titel:e.titel||"",quelle:k.name||"Kalender",weg:!rel})}}
  for(const a of (ordner.aufgaben||[])){
    if(!a.datum)continue;const d=new Date(a.datum+"T12:00");if(d<von||d>bis)continue;
    if(/erledigt/i.test(a.status||""))continue;
    out.push({iso:a.datum,zeit:a.zeit||"",titel:(a.art?a.art+": ":"")+a.was,quelle:"Aufgaben (aufgaben.md)",weg:false})}
  // gleiche Termine aus mehreren Kalendern nur einmal
  const seen=new Set();
  return out.filter(t=>{const s=t.iso+"|"+t.titel.toLowerCase().trim();if(seen.has(s))return false;seen.add(s);return true})
    .sort((a,b)=>(a.iso+a.zeit).localeCompare(b.iso+b.zeit));
}
function erkennen(t){
  const art=t._mm?ARTEN.find(a=>a.id==="mitarbeit"):ARTEN.find(a=>!a.nurIntern&&a.muster.test(t.titel));
  t.art=art||null;t.gruppe=t._gruppe||gruppeErkennen(t.titel);t.nr=art&&art.id==="klassenarbeit"?nummer(t.titel):null;
  const heute=new Date();heute.setHours(0,0,0,0);
  t.tage=Math.round((new Date(t.iso+"T00:00")-heute)/864e5);
  t.schritt=art?schritt(art.id,t,t.tage):null;
  return t;
}

/* ---------- Ansicht ---------- */
function zeigen(){
  const slot=$("#panel-slot");
  const zr=store.get("erk-zeitraum","2-8"),alle=store.get("erk-alle",true),gef=store.get("erk-gefiltert",false);
  const [zv,zn]=zr.split("-").map(Number);
  const von=new Date();von.setHours(0,0,0,0);von.setDate(von.getDate()-7*zv);
  const bis=new Date();bis.setHours(23,59,59,0);bis.setDate(bis.getDate()+7*zn);
  const liste=[...termineSammeln(von,bis,gef),...ferienErinnerungen(von,bis)].sort((a,b)=>(a.iso+a.zeit).localeCompare(b.iso+b.zeit)).map(erkennen);
  const kalZahl=kalListe().filter(k=>k.an&&(k.events||[]).length).length;
  const zaehl={};liste.forEach(t=>{const n=t.art?t.art.name:"nicht erkannt";zaehl[n]=(zaehl[n]||0)+1});
  const erkannt=liste.filter(t=>t.art).length;
  const zeilen=liste.filter(t=>alle||t.art).map((t,i)=>{
    const tagTxt=t.tage===0?"heute":t.tage>0?`in ${t.tage} T.`:`vor ${-t.tage} T.`;
    const k=t.schritt&&t.schritt.kachel?ALLE.find(x=>x.id===t.schritt.kachel):null;
    const bez=bezugText(t.titel,t.gruppe)+(t.nr?` · Nr. ${t.nr}`:"");
    return `<tr${t.art?"":' style="opacity:.6"'}${t.weg?' title="Vom Kalenderfilter ausgeblendet"':""}>
      <td style="white-space:nowrap">${esc(datumDE(t.iso))}${t.zeit?` ${esc(t.zeit)}`:""}<br><span class="note">${tagTxt}</span></td>
      <td>${esc(t.titel)}<br><span class="note">${esc(t.quelle)}${t.weg?" · gefiltert":""}</span></td>
      <td>${t.art?`<span class="chip ${t.art.farbe}" style="white-space:nowrap">${esc(t.art.name)}</span>`:'<span class="note">nicht erkannt</span>'}</td>
      <td>${bez?esc(bez):'<span class="note">–</span>'}</td>
      <td>${t.schritt&&t.schritt.text?esc(t.schritt.text):""}${k?`<br><button class="btn ghost small" data-erk="${i}">${esc(k.titel)}</button>`:""}${t.schritt&&t.schritt.leb&&typeof window.saLebOeffnen==="function"?` <button class="btn ghost small" data-erk-leb="${i}">Nach LEB-online</button>`:""}</td></tr>`});
  const sichtbar=liste.filter(t=>alle||t.art);
  slot.innerHTML=`<div class="panel"><h4>Termine erkennen (Probe)</h4>
    <p class="note">Nur Ansicht: Termine aus den eingeschalteten Kalendern${(ordner.aufgaben||[]).length?" und aus aufgaben.md":""} werden einer Art zugeordnet, mit deiner Lerngruppe verknüpft und bekommen einen Vorschlag für den nächsten Schritt. Gespeichert oder an Claude geschickt wird nichts.</p>
    <div class="fields">
      <label style="flex:0 1 340px">Zeitraum<select id="erk-zr">
        ${[["2-8","2 Wochen zurück bis 8 Wochen voraus"],["0-4","nächste 4 Wochen"],["4-12","4 Wochen zurück bis 12 Wochen voraus"],["20-40","ganzes Schuljahr (soweit geladen)"]].map(([v,l])=>`<option value="${v}"${v===zr?" selected":""}>${l}</option>`).join("")}</select></label>
    </div>
    <p class="note" style="display:flex;gap:18px;flex-wrap:wrap;margin-top:6px"><span style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" id="erk-alle"${alle?" checked":""}><label for="erk-alle">auch nicht erkannte zeigen</label></span><span style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" id="erk-gef"${gef?" checked":""}><label for="erk-gef">auch vom Kalenderfilter ausgeblendete</label></span></p>
    <p class="note" style="margin:8px 0">${liste.length} Termine aus ${kalZahl} Kalender${kalZahl===1?"":"n"}, davon ${erkannt} erkannt. ${Object.entries(zaehl).sort((a,b)=>b[1]-a[1]).map(([n,z])=>`<span class="chip"><b>${z}</b> ${esc(n)}</span>`).join(" ")}</p>
    ${kalZahl?"":`<p class="note">Noch keine Termine geladen. Bitte erst im Kalender (Knopf „Kalender“ oben) IServ verbinden oder aktualisieren.</p>`}
    <div class="r-tab-wrap"><table class="r-tab"><thead><tr><th>Wann</th><th>Termin</th><th>Erkannt als</th><th>Bezug</th><th>Nächster Schritt</th></tr></thead><tbody>${zeilen.join("")}</tbody></table></div>
    <p class="note" style="margin-top:8px">Falsch erkannt oder fehlt eine Art? Sag Claude, welcher Termin (Art und Titelmuster reichen, keine Namen), dann wird die Erkennung angepasst.</p>
    <div class="actions"><button class="btn ghost" id="erk-zu">Schließen</button></div></div>`;
  $("#erk-zr").addEventListener("change",e=>{store.set("erk-zeitraum",e.target.value);zeigen()});
  $("#erk-alle").addEventListener("change",e=>{store.set("erk-alle",e.target.checked);zeigen()});
  $("#erk-gef").addEventListener("change",e=>{store.set("erk-gefiltert",e.target.checked);zeigen()});
  $("#erk-zu").addEventListener("click",()=>slot.innerHTML="");
  slot.querySelectorAll("[data-erk]").forEach(b=>b.addEventListener("click",()=>{
    const t=sichtbar[+b.dataset.erk];const k=ALLE.find(x=>x.id===t.schritt.kachel);if(!k)return;
    const vor={...t.schritt.vor};
    if(k.typ==="claude"&&(k.felder||[]).includes("thema")&&!vor.thema)vor.thema=`${typeof titelSicher==="function"?titelSicher(t.titel):t.art.name} am ${datumDE(t.iso)}`;  // Titel ohne Namen
    oeffne(k,vor)}));
  slot.querySelectorAll("[data-erk-leb]").forEach(b=>b.addEventListener("click",()=>{
    const t=sichtbar[+b.dataset.erkLeb];if(typeof window.saLebOeffnen==="function")window.saLebOeffnen(t.gruppe.id,t.schritt.leb)}));
  slot.scrollIntoView({behavior:"smooth",block:"start"});
}

/* ---------- „Als Nächstes“: kompakter Kasten über der Wochenansicht ----------
   Zeigt nur Termine mit einem konkreten nächsten Schritt, höchstens 4 Karten, Überfälliges zuerst.
   Mitarbeitsnoten aller Lerngruppen werden zu einer Karte zusammengefasst. „Erledigt“ und „Später“ merkt sich der Browser. */
const NX_ARTEN=new Set(["klassenarbeit","test","mitarbeit","konf-zeugnis","notenschluss","eltern","ausflug","pruefung"]);
const NX_KURZ={klassenarbeit:"Klassenarbeit",test:"Test/Referat",mitarbeit:"Mitarbeitsnote","konf-zeugnis":"Konferenz",notenschluss:"Bewertungsstopp",eltern:"Eltern",ausflug:"Ausflug",pruefung:"Prüfung"};
const nxWeg=()=>store.get("nx-weg",{})||{};
const nxKey=t=>t.iso+"|"+(t._mm?"mitarbeit":t.titel.toLowerCase().trim());
function nxAusgeblendet(t){const w=nxWeg()[nxKey(t)];if(!w)return false;if(w==="erledigt")return true;return isoTag(new Date())<w}
function nxSetzen(key,wert){const w=nxWeg();
  const heute=isoTag(new Date());for(const k in w)if(w[k]!=="erledigt"&&w[k]<=heute||k.slice(0,10)<plusT(heute,-120))delete w[k];  // aufräumen
  w[key]=wert;store.set("nx-weg",w)}
function nxKarten(){
  const von=new Date();von.setHours(0,0,0,0);von.setDate(von.getDate()-42);
  const bis=new Date();bis.setHours(23,59,59,0);bis.setDate(bis.getDate()+21);
  const liste=[...termineSammeln(von,bis,false),...ferienErinnerungen(von,bis)].map(erkennen).filter(t=>{
    if(!t.art||!NX_ARTEN.has(t.art.id)||!t.schritt||!(t.schritt.kachel||t.schritt.leb))return false;
    if(t.art.id==="test"&&t.tage>0)return false;               // angesagt, noch nichts zu tun
    if(t.tage>(t.art.id==="ausflug"||t.art.id==="mitarbeit"?21:14))return false;
    if(t.tage<(t.art.id==="klassenarbeit"?-42:-14))return false;
    return !nxAusgeblendet(t)});
  // Mitarbeitsnoten je Termin zusammenfassen
  const karten=[],mm={};
  for(const t of liste){
    if(t._mm){const k=t.iso;if(!mm[k]){mm[k]={...t,gruppen:[]};karten.push(mm[k])}mm[k].gruppen.push(t);continue}
    karten.push(t)}
  karten.sort((a,b)=>{const ua=a.tage<0?0:1,ub=b.tage<0?0:1;return ua-ub||(ua===0?a.tage-b.tage:a.tage-b.tage)});
  return karten;
}
function nxTag(t){return t.tage===0?"heute":t.tage===1?"morgen":t.tage>0?`in ${t.tage} Tagen`:t.tage===-1?"gestern":`vor ${-t.tage} Tagen`}
function naechstes(){
  const sec=$("#naechstes");if(!sec)return;
  if(ordner.zustand!=="an"&&!kalListe().some(k=>(k.events||[]).length)){sec.hidden=true;return}
  sec.hidden=false;
  const zu=store.get("nx-zu",false);
  const alle=nxKarten(),karten=alle.slice(0,4),mehr=alle.length-karten.length;
  const kopf=`<div class="nx-kopf"><h3 id="nx-h">Als Nächstes</h3>${alle.length?`<span class="nx-zahl">${alle.length}</span>`:""}<span class="sp"></span>
    <button class="linkbtn" id="nx-alle">Alle Termine ansehen</button>
    <button class="btn ghost small" id="nx-zu" aria-expanded="${!zu}">${zu?"Einblenden":"Ausblenden"}</button></div>`;
  if(zu){sec.innerHTML=kopf;nxVerdrahten(sec,[]);return}
  const karte=(t,i)=>{
    const dringend=t.tage<=3;
    const kopfz=`${esc(NX_KURZ[t.art.id]||t.art.name)} · ${nxTag(t)}`;
    let titel,text,knoepfe="";
    if(t._mm){
      titel=esc(t.titel.replace(/^Mitarbeitsnote\s*/,"").replace(/^(\d\. Quartal)\s*/,"$1, "));
      const offen=t.gruppen.filter(g=>g._mm.wenig).length;
      text=offen?`${offen} von ${t.gruppen.length} Lerngruppen mit Lücken (weniger als 2 Einträge)`:"Alle Lerngruppen haben genug Einträge";
      knoepfe=`<div class="nx-gruppen">${t.gruppen.map((g,j)=>`<button class="nx-gr${g._mm.wenig?" offen":""}" data-nx-mm="${i}|${j}" title="${g._mm.wenig?`${g._mm.wenig} von ${g._mm.alle} mit weniger als 2 Einträgen`:"genug Einträge"}">${esc(g._gruppe.id)}${g._mm.wenig?` · ${g._mm.wenig}`:""}</button>`).join("")}</div>`;
    }else{
      titel=esc(t.titel)+(t.gruppe&&t.gruppe.id&&!t.titel.toLowerCase().includes(t.gruppe.id)?` <span class="nx-bez">${esc(t.gruppe.id)}</span>`:"");
      text=esc(t.schritt.text);
      const k=t.schritt.kachel?ALLE.find(x=>x.id===t.schritt.kachel):null;
      knoepfe=`<div class="nx-knoepfe">${k?`<button class="btn primary small" data-nx="${i}">${esc(k.titel)}</button>`:""}${t.schritt.leb&&typeof window.saLebOeffnen==="function"?`<button class="btn ghost small" data-nx-leb="${i}">Nach LEB-online</button>`:""}</div>`;
    }
    return `<article class="nx-karte${dringend?" dringend":""}${t.tage<0?" vorbei":""}">
      <div class="nx-zeile"><span class="nx-art">${kopfz}</span><span class="sp"></span>
        <button class="nx-mini" data-nx-spaeter="${i}" title="Eine Woche ausblenden">Später</button>
        <button class="nx-mini" data-nx-fertig="${i}" title="Erledigt, nicht mehr zeigen">✓</button></div>
      <div class="nx-titel">${titel}</div><div class="nx-text">${text}</div>${knoepfe}</article>`};
  sec.innerHTML=kopf+(karten.length?`<div class="nx-liste">${karten.map(karte).join("")}</div>`:`<p class="note">Nichts Dringendes in den nächsten zwei Wochen.</p>`)
    +(mehr>0?`<button class="linkbtn nx-mehr" id="nx-mehr">${mehr} weitere</button>`:"");
  nxVerdrahten(sec,karten);
}
function nxVerdrahten(sec,karten){
  const q=(sel,f)=>sec.querySelectorAll(sel).forEach(b=>b.addEventListener("click",()=>f(b)));
  q("#nx-alle",()=>zeigen());q("#nx-mehr",()=>zeigen());
  q("#nx-zu",()=>{store.set("nx-zu",!store.get("nx-zu",false));naechstes()});
  q("[data-nx]",b=>{const t=karten[+b.dataset.nx];const k=ALLE.find(x=>x.id===t.schritt.kachel);if(!k)return;
    const vor={...t.schritt.vor};if(k.typ==="claude"&&(k.felder||[]).includes("thema")&&!vor.thema)vor.thema=`${typeof titelSicher==="function"?titelSicher(t.titel):t.art.name} am ${datumDE(t.iso)}`;
    oeffne(k,vor);$("#panel-slot").scrollIntoView({behavior:"smooth",block:"start"})});
  q("[data-nx-leb]",b=>{const t=karten[+b.dataset.nxLeb];if(typeof window.saLebOeffnen==="function")window.saLebOeffnen(t.gruppe.id,t.schritt.leb)});
  q("[data-nx-mm]",b=>{const [i,j]=b.dataset.nxMm.split("|").map(Number);const g=karten[i].gruppen[j];
    const k=ALLE.find(x=>x.id==="beob-note");if(k){oeffne(k,{gruppe:g._gruppe.id});$("#panel-slot").scrollIntoView({behavior:"smooth",block:"start"})}});
  q("[data-nx-spaeter]",b=>{nxSetzen(nxKey(karten[+b.dataset.nxSpaeter]),plusT(isoTag(new Date()),7));naechstes()});
  q("[data-nx-fertig]",b=>{nxSetzen(nxKey(karten[+b.dataset.nxFertig]),"erledigt");naechstes()});
}
// neu zeichnen, wann immer die Wochenansicht neu gezeichnet wird (Kalender geladen, Ordner verbunden …)
let nxT=null;const nxBald=()=>{clearTimeout(nxT);nxT=setTimeout(()=>{try{naechstes()}catch(e){console.warn("Als Nächstes:",e)}},150)};
if(typeof renderWoche==="function"){const alt=renderWoche;window.renderWoche=renderWoche=function(){const r=alt.apply(this,arguments);nxBald();return r}}
nxBald();
const knopf=$("#w-erkennen");if(knopf)knopf.addEventListener("click",zeigen);
window.saErkennung={zeigen,naechstes,quartale,notenschluss,_test:{mmAnlaesse,ferienListe,ferienErinnerungen,ARTEN,gruppeErkennen,gruppeInfo,nummer,erkennen,schritt,woerter}};
})();
