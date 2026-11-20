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
  {id:"konf-zeugnis",name:"Zeugnis-/Klassenkonferenz",farbe:"warn",
   muster:/zeugniskonferenz|klassenkonferenz|p(ä|ae)d(agogische|\.)?\s*konf|notenkonferenz|versetzungskonferenz|\bzk\b/i},
  {id:"notenschluss",name:"Notenschluss / Noteneingabe",farbe:"warn",
   muster:/notenschluss|noteneingabe|notenabgabe|zeugnisnoten|noten\s*(eintragen|abgeben)|leb[- ]?(schluss|abgabe|eingabe)/i},
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
  const S=(text,kachel,vor)=>({text,kachel,vor:vor||(gid?{gruppe:gid}:{})});
  switch(art){
    case "klassenarbeit":{
      if(tage>14)return S("Klausur entwerfen (Erwartungshorizont, Notenschlüssel)","pruefung");
      if(tage>0)return S("Klausur fertigstellen, Druck und Nachschreibtermin klären","pruefung");
      const z=akteZaehlen(gid,t.nr);
      if(!z||!z.mit)return S(`Korrigieren${t.nr?` (Klausur ${t.nr})`:""}`,"korrektur");
      if(z.mit<z.alle)return S(`Noten in den Akten: ${z.mit} von ${z.alle}. Fehlende nachtragen`,"notenuebersicht");
      return ob?S("Noten vollständig in den Akten (Oberstufe, nicht in LEB)",""):S(`Noten vollständig in den Akten → nach LEB-online übertragen`,"notenuebersicht")}
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
  const art=ARTEN.find(a=>a.muster.test(t.titel));
  t.art=art||null;t.gruppe=gruppeErkennen(t.titel);t.nr=art&&art.id==="klassenarbeit"?nummer(t.titel):null;
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
  const liste=termineSammeln(von,bis,gef).map(erkennen);
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
      <td>${t.schritt&&t.schritt.text?esc(t.schritt.text):""}${k?`<br><button class="btn ghost small" data-erk="${i}">${esc(k.titel)}</button>`:""}</td></tr>`});
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
  slot.scrollIntoView({behavior:"smooth",block:"start"});
}

const knopf=$("#w-erkennen");if(knopf)knopf.addEventListener("click",zeigen);
window.saErkennung={zeigen,_test:{ARTEN,gruppeErkennen,gruppeInfo,nummer,erkennen,schritt,woerter}};
})();
