/* Schulassistenz-Startseite · Bereiche und Bedienung (Helfer 0.23, „Helfer neu sortiert“, Pauls Freigabe 20.11.2026)
   Drei Bereiche (Heute, Lerngruppen, Werkzeuge) und ⚙ Einrichtung & Daten. Jede Funktion hat genau einen Ort.
   - Lerngruppe = eigene Ansicht mit Reitern Akten, Noten, Fehlzeiten, Namen & Kürzel (statt Fenster oben auf der Seite).
   - Alle anderen Fenster (Aufträge an Claude, Termine, Sicherung …) erscheinen mittig über der Seite, Esc schließt.
   - Adresse (#heute, #gruppe/10-ma-e/noten …): Zurück im Browser funktioniert, die Seite öffnet dort, wo man war.
   - Namen per Doppelklick ändern: gespeichert wird nur in der Kürzelliste (einzige Stelle mit Namen), danach überall neu.
   Läuft nach start-a.js, sicherung.js, fehlzeiten.js, erkennung.js und start-b.js; nutzt deren Funktionen. */
(function(){
"use strict";
const slot=$("#panel-slot"),dialog=$("#dialog"),dialogBox=dialog.querySelector(".dialog-box"),inhalt=$("#lg-inhalt");
const REITER=[["akten","Akten"],["noten","Noten"],["fehlzeiten","Fehlzeiten"],["namen","Namen & Kürzel"]];
const CLAUDE_GRUPPE=["korrektur","beob-note","zeugnis-noten","wiederholung","lernplaene-gruppe"];
const S={v:"heute",gid:null,reiter:store.get("lg-reiter","akten"),tabAktiv:false,leer:0};
const gruppeVon=gid=>ordner.gruppen.find(g=>g.id===gid);

/* ---------- Bereiche ---------- */
function ansichtZeigen(v){
  S.v=v;
  document.querySelectorAll(".ansicht").forEach(a=>a.hidden=a.dataset.v!==v);
  document.querySelectorAll("#nav a,#nav-einst").forEach(a=>{if(a.dataset.v===v)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
  // Fenster-Bereich: in der Lerngruppe sitzt er in der Ansicht, sonst mittig über der Seite
  const ziel=v==="gruppen"?inhalt:dialogBox;
  if(slot.parentNode!==ziel){S.tabAktiv=false;slot.innerHTML="";ziel.appendChild(slot)}
  dialogPruefen();
  if(v==="heute")renderHeute();
  if(v==="einstellungen")renderEinst();
  if(v==="gruppen")gruppeZeigen(S.gid||store.get("letzte-gruppe","")||((ordner.gruppen[0]||{}).id),S.reiter,true);
}
function adresseLesen(){
  const h=decodeURIComponent(location.hash.replace(/^#/,""));
  const m=h.match(/^gruppe\/([^/]+)(?:\/(\w+))?$/);
  if(m){S.gid=m[1];if(m[2])S.reiter=m[2];return "gruppen"}
  return ["heute","gruppen","werkzeuge","einstellungen"].includes(h)?h:null;
}
function geheZu(hash){if(location.hash!=="#"+hash)location.hash=hash;else anwenden()}
function anwenden(){
  if(!$("#raster").hidden&&!location.hash.startsWith("#live"))$("#raster").hidden=true;
  const v=adresseLesen()||store.get("ansicht","heute");
  store.set("ansicht",v==="werkzeuge"&&$("#q").value?store.get("ansicht","heute"):v);
  ansichtZeigen(v);
}
window.addEventListener("hashchange",anwenden);

/* ---------- Fenster mittig (alles außerhalb der Lerngruppe) ---------- */
function dialogPruefen(){
  const voll=slot.childElementCount>0;
  if(slot.parentNode===dialogBox){dialog.hidden=!voll;document.body.style.overflow=voll?"hidden":"";if(voll&&!dialog.dataset.offen){dialog.dataset.offen="1";dialog.scrollTop=0;const f=slot.querySelector("input,select,textarea,button");if(f&&!f.matches("#p-close"))setTimeout(()=>f.focus({preventScroll:true}),30)}if(!voll)delete dialog.dataset.offen}
  else{dialog.hidden=true;document.body.style.overflow="";
    // In der Lerngruppe: wird der Inhalt geschlossen (z. B. Auftrag an Claude), wieder den Reiter zeigen
    if(!voll&&S.v==="gruppen"&&S.gid&&S.leer<3){S.leer++;setTimeout(()=>{if(!slot.childElementCount&&S.v==="gruppen")reiterZeigen()},0)}
    if(voll)S.leer=0}
}
new MutationObserver(dialogPruefen).observe(slot,{childList:true});
dialog.addEventListener("mousedown",e=>{if(e.target===dialog){const b=slot.querySelector("#p-close,#n-close,[id$='-close'],[id$='-zu']");if(b&&!slot.querySelector("textarea:not([readonly]),input[type=text]:not([readonly])"))b.click()}});
// Fenster, die sich selbst in Sicht scrollen wollen: innerhalb des Fensters bleiben
const sv=Element.prototype.scrollIntoView;Element.prototype.scrollIntoView=function(o){if(this===slot)return;return sv.call(this,o)};

/* ---------- Live-Beobachtung: eigene Ansicht ---------- */
new MutationObserver(()=>{const an=!$("#raster").hidden;document.body.classList.toggle("live-an",an);if(an){slot.innerHTML="";window.scrollTo({top:0})}}).observe($("#raster"),{attributes:true,attributeFilter:["hidden"]});

/* ---------- Lerngruppe ---------- */
const _zeigeGruppe=zeigeGruppe,_zeigeNoten=zeigeNoten,_kl=kuerzellisteBearbeiten,_fz=window.saFehlzeiten&&window.saFehlzeiten.zeigen;
function imReiter(gid){return S.v==="gruppen"&&S.gid===gid&&slot.parentNode===inhalt}
zeigeGruppe=function(g){if(g&&imReiter(g.id)&&S.reiter==="akten")return _zeigeGruppe(g);return gruppeZeigen(g&&g.id,"akten")};
zeigeNoten=function(gid,opt){gid=gid||S.gid||store.get("noten-gruppe","");if(imReiter(gid)&&S.reiter==="noten")return _zeigeNoten(gid,opt);S.notenOpt=opt;return gruppeZeigen(gid,"noten")};
kuerzellisteBearbeiten=function(g){if(g&&imReiter(g.id)&&S.reiter==="namen")return _kl(g);return gruppeZeigen(g&&g.id,"namen")};
if(window.saFehlzeiten&&_fz)window.saFehlzeiten.zeigen=function(gid){gid=gid||S.gid||store.get("fz-gruppe","")||((ordner.gruppen.find(x=>/^\d+[a-z]/i.test(x.id))||ordner.gruppen[0]||{}).id);if(imReiter(gid)&&S.reiter==="fehlzeiten")return _fz(gid);return gruppeZeigen(gid,"fehlzeiten")};

function gruppeZeigen(gid,reiter,ausAdresse){
  if(gid&&ordner.gruppen.length&&!gruppeVon(gid))gid=ordner.gruppen[0].id;
  if(reiter)S.reiter=REITER.some(r=>r[0]===reiter)?reiter:"akten";
  S.gid=gid||null;if(gid)store.set("letzte-gruppe",gid);store.set("lg-reiter",S.reiter);
  const ziel=gid?`gruppe/${gid}/${S.reiter}`:"gruppen";
  if(!ausAdresse&&decodeURIComponent(location.hash.slice(1))!==ziel){location.hash=ziel;return}
  if(S.v!=="gruppen"){S.v="gruppen";ansichtZeigen("gruppen");return}
  document.querySelectorAll("#groups .group").forEach(b=>b.setAttribute("aria-current",String(b.dataset.g===gid)));
  const g=gid&&gruppeVon(gid);
  const kopf=$("#lg-kopf"),reit=$("#lg-reiter"),extra=$("#lg-extra"),cl=$("#lg-claude");
  if(!g){
    kopf.innerHTML="";reit.innerHTML="";extra.hidden=true;cl.hidden=true;slot.innerHTML="";
    inhaltLeer(ordner.zustand==="an"?"Noch keine Lerngruppe angelegt. Links mit „+ Neue Lerngruppe“ beginnen.":"Sobald links dein Datenordner verbunden ist, stehen hier deine Lerngruppen mit Akten, Noten, Fehlzeiten und Namen.");return}
  const feld=n=>((g.gruppeText.match(new RegExp("^"+n+":\\s*(.+)$","mi"))||[])[1]||"").trim();
  const info=[feld("fach")+(feld("kurs")?" "+feld("kurs"):""),`${g.akten.length} Kinder`,g.offen?`${g.offen} offene ${g.offen===1?"Punkt":"Punkte"}`:""].filter(Boolean).join(" · ");
  kopf.innerHTML=`<h2>${esc(g.id)}</h2><span class="info">${esc(info)}</span><span class="sp"></span><button class="btn live-btn" id="lg-live">● Live-Beobachtung</button><button class="btn primary" id="lg-leb" title="Noten für LEB-online auswählen und eintragen lassen; speichern tust du in LEB-online selbst">Nach LEB-online</button>`;
  $("#lg-live").addEventListener("click",()=>{store.set("letzte-gruppe",g.id);rasterStarten(g.id,null)});
  if(typeof skalaStandard==="function"&&skalaStandard(g.id,g.gruppeText)==="np")$("#lg-leb").hidden=true;
  $("#lg-leb").addEventListener("click",async()=>{S.notenOpt={leb:store.get("leb-quelle-"+g.id,null)};if(S.reiter==="noten")await reiterZeigen();else await gruppeZeigen(g.id,"noten");
    for(let i=0;i<20;i++){const b=document.querySelector("#lg-inhalt .n-edit");if(b){b.scrollIntoView({block:"nearest",behavior:"smooth"});break}await new Promise(r=>setTimeout(r,100))}});
  reit.innerHTML=REITER.map(([id,n])=>`<button role="tab" aria-selected="${id===S.reiter}" data-r="${id}">${esc(n)}</button>`).join("");
  reit.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>gruppeZeigen(g.id,b.dataset.r)));
  const ks=CLAUDE_GRUPPE.map(id=>ALLE.find(k=>k.id===id)).filter(Boolean);
  cl.hidden=!ks.length;cl.innerHTML=`<span class="t">Mit Claude für ${esc(g.id)}</span>`+ks.map(k=>`<button class="btn small" data-k="${esc(k.id)}" title="${esc(k.kurz)}">${esc(k.titel)}</button>`).join("")+`<button class="btn small ghost" data-mehr="1" style="background:transparent;border-color:transparent;color:var(--accent)">Mehr …</button>`;
  cl.querySelectorAll("button[data-k]").forEach(b=>b.addEventListener("click",()=>{const k=ALLE.find(x=>x.id===b.dataset.k);if(k)oeffne(k,{gruppe:g.id})}));
  cl.querySelector("[data-mehr]").addEventListener("click",()=>{$("#q").value="";geheZu("werkzeuge")});
  reiterZeigen();
}
function inhaltLeer(text){slot.innerHTML="";const p=document.createElement("p");p.className="lg-leer";p.textContent=text;slot.appendChild(p);S.leer=0}
function reiterZeigen(){
  const g=gruppeVon(S.gid);if(!g)return;
  const extra=$("#lg-extra");extra.hidden=true;extra.innerHTML="";S.tabAktiv=true;S.leer=0;
  if(S.reiter==="akten")return _zeigeGruppe(g);
  if(S.reiter==="noten"){const o=S.notenOpt;S.notenOpt=null;store.set("noten-gruppe",g.id);return _zeigeNoten(g.id,o)}
  if(S.reiter==="fehlzeiten"){store.set("fz-gruppe",g.id);if(_fz)return _fz(g.id);return inhaltLeer("Die Fehlzeiten-Ampel ist auf diesem Gerät nicht geladen.")}
  if(S.reiter==="namen"){
    extra.hidden=false;
    const k=(t,fn,tipp)=>{const b=document.createElement("button");b.className="btn ghost small";b.textContent=t;if(tipp)b.title=tipp;b.addEventListener("click",fn);extra.appendChild(b)};
    k("Namensliste",()=>_kl(g),"Namen und Codes dieser Lerngruppe bearbeiten");
    if(ordner.gruppen.length>1)k("Kürzel verknüpfen",zeigeVerknuepfen,"Dasselbe Kind in mehreren Lerngruppen verbinden");
    k("Code-Zuordnung",zeigeCodeZuordnung,"Codes auf Klassenarbeiten den Kürzeln zuordnen");
    k("Kürzel nachschlagen",zeigeKuerzel,"Kürzel aus allen Lerngruppen nachschlagen");
    return _kl(g);
  }
}

/* ---------- Heute ---------- */
const WT=["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
function tagHeute(){const d=new Date();d.setHours(0,0,0,0);while(d.getDay()===0||d.getDay()===6)d.setDate(d.getDate()+1);return d}
function gruppeFuer(e){const z=gruppeZu(e);if(z)return z;try{const r=window.saErkennung&&saErkennung._test.gruppeErkennen(e.titel||"");return r&&r.id||""}catch{return ""}}
function renderHeute(){
  const box=$("#tag-liste");if(!box)return;
  const d=tagHeute(),iso=isoTag(d),istHeute=iso===isoTag(new Date()),jetzt=new Date();
  $("#tag-h").textContent=(istHeute?"":"Nächster Schultag: ")+`${WT[d.getDay()]}, ${d.getDate()}. ${d.toLocaleDateString("de-DE",{month:"long"})}`;
  $("#tag-kw").textContent="KW "+kw(d);
  const std=plan.events.filter(e=>isoTag(e.start)===iso),ter=termineAm(iso,false,true);
  const reihe=[...ter.filter(t=>t.ganz).map(t=>({t,z:""})),...[...std.map(e=>({e,z:hhmm(e.start)})),...ter.filter(t=>!t.ganz).map(t=>({t,z:t.zeit}))].sort((a,b)=>a.z.localeCompare(b.z))];
  box.innerHTML="";
  if(!plan.events.length){const p=document.createElement("div");p.className="tl-leer";p.innerHTML=`<span>Noch kein Stundenplan. Mit dem Link aus WebUntis stehen hier deine Stunden des Tages, mit Knopf für die Live-Beobachtung.</span>`;
    const b=document.createElement("button");b.className="btn primary small";b.textContent="Stundenplan einrichten";b.addEventListener("click",zeigePlanEinrichten);p.appendChild(b);box.appendChild(p)}
  else if(!reihe.length){const p=document.createElement("div");p.className="tl-leer";p.textContent="An diesem Tag hast du keinen Unterricht und keine Termine.";box.appendChild(p)}
  let jetztGesetzt=false;
  reihe.forEach(({e,t})=>{
    const r=document.createElement("div");
    if(t){r.className="st termin"+(t.art==="frist"?" frist":"");r.innerHTML=`<span class="z">${esc(t.zeit||"ganztags")}</span><div><b>${esc(t.titel)}</b><small>${esc([t.raum,t.quelle].filter(Boolean).join(" · "))}</small></div><div class="akt"></div>`;box.appendChild(r);return}
    const ende=e.ende||new Date(+e.start+45*6e4);
    const aus=e.status==="CANCELLED"||/entf[aä]llt|ausfall|cancel/i.test((e.titel||"")+" "+(e.info||""));
    const vorbei=istHeute&&ende<jetzt,laeuft=istHeute&&!aus&&e.start<=jetzt&&jetzt<ende;
    const naechste=istHeute&&!aus&&!laeuft&&!vorbei&&!jetztGesetzt&&!reihe.some(x=>x.e&&x.e.start<=jetzt&&jetzt<(x.e.ende||x.e.start));
    const gid=gruppeFuer(e),g=gid&&gruppeVon(gid);
    r.className="st"+(laeuft?" jetzt":"")+(vorbei?" vorbei":"")+(aus?" aus":"");
    r.innerHTML=`<span class="z">${hhmm(e.start)}</span><div><b>${esc(gid||e.titel||"Stunde")}${laeuft?'<span class="jetzt-tag">jetzt</span>':naechste?'<span class="jetzt-tag" style="color:var(--accent)">als Nächstes</span>':""}</b><small>${esc([gid&&e.titel!==gid?e.titel:"",e.raum,e.info].filter(Boolean).join(" · "))}</small></div><div class="akt"></div>`;
    if(laeuft||naechste)jetztGesetzt=true;
    const akt=r.querySelector(".akt");
    const knopf=(text,cls,fn,tipp)=>{const b=document.createElement("button");b.className="btn small "+cls;b.textContent=text;if(tipp)b.title=tipp;b.addEventListener("click",fn);akt.appendChild(b)};
    if(g&&!aus){
      if(!vorbei)knopf("● Live-Beobachtung",laeuft||naechste?"live-btn":"ghost",()=>{store.set("letzte-gruppe",g.id);rasterStarten(g.id,e)});
      knopf("Gruppe","ghost",()=>gruppeZeigen(g.id,store.get("lg-reiter","akten")),"Akten, Noten, Fehlzeiten und Namen von "+g.id);
    }else if(!aus)knopf(gid?"Stunde":"Lerngruppe zuordnen","ghost",()=>zeigeStunde(e),"Welche Lerngruppe ist das? Die Zuordnung gilt für alle Stunden mit diesem Titel.");
    box.appendChild(r);
  });
}
const _rw=renderWoche;renderWoche=function(){_rw();renderHeute()};
setInterval(()=>{if(S.v==="heute"&&!document.hidden)renderHeute()},60000);

/* ---------- Einrichtung & Daten ---------- */
function renderEinst(){
  einrOffen=true;einrBereit=true;renderEinrichtung();
  const d=$("#einst-daten");d.innerHTML="";
  const k=(box,t,fn,cls,tipp)=>{const b=document.createElement("button");b.className="btn small "+(cls||"ghost");b.textContent=t;if(tipp)b.title=tipp;b.addEventListener("click",fn);box.appendChild(b);return b};
  $("#einst-daten-note").textContent=ordner.zustand==="an"?`${ordner.gruppen.length} Lerngruppen, ${ordner.gruppen.reduce((s,g)=>s+g.akten.length,0)} Akten. ${sdExtern()?"Akten und Kürzellisten liegen in "+sdPfad("")+".":"Akten und Kürzellisten liegen im Datenordner."}`:"Datenordner noch nicht verbunden.";
  if(window.saSicherung)k(d,"Sichern oder zurückholen",()=>saSicherung.zeigen(),"primary");
  k(d,"Neu einlesen",()=>ordnerStart(true),"","Akten, Aufgaben und Kürzellisten neu lesen, z. B. nachdem Claude etwas geändert hat");
  k(d,"Datenordner wählen",ordnerVerbinden);
  if(sdExtern()&&!sdDav())k(d,"Schülerdaten-Ordner wählen",sdVerbinden);
  if(sdExtern())umzugPruefen().then(n=>{if(n)k(d,"Schülerdaten umziehen ("+n+")",zeigeUmzug,"primary")});
  const kal=$("#einst-kal");kal.innerHTML="";
  k(kal,"Stundenplan-Link",zeigePlanEinrichten);
  k(kal,"Kalender und Quellen",()=>{geheZu("heute");setTimeout(()=>{if($("#kal-sec").hidden)$("#w-kal").click();$("#kal-sec").scrollIntoView({block:"start",behavior:"smooth"})},60)});
  k(kal,"Für Outlook",()=>{try{outlookExport()}catch{}},"","Termine als Datei für Outlook speichern");
  const bed=$("#einst-bed");bed.innerHTML="";
  if(window.chrome&&chrome.runtime&&chrome.runtime.openOptionsPage)k(bed,"Helfer-Einstellungen",()=>chrome.runtime.openOptionsPage(),"","Kürzel für Kolleginnen und Kollegen, Anmeldung, Test");
  const dat=$("#einst-dateien");dat.innerHTML="";
  ["profil","profil-aendern","kuerzelliste","akten-ordner","ausgaben","helfer"].map(id=>ALLE.find(x=>x.id===id)).filter(Boolean).forEach(x=>dat.appendChild(kachel(x)));
  ALLE.filter(x=>x.eigen&&x.bereich==="werkzeuge").forEach(x=>dat.appendChild(kachel(x)));
}

/* ---------- Hinweise oben: höchstens eine Zeile je Thema, sonst Punkt am Zahnrad ---------- */
const hinweise=$("#hinweise");
const sich=$("#sich-hinweis");if(sich)hinweise.appendChild(sich);
function hinweisePruefen(){
  let einrOffenPunkte=0;try{if(einrBereit)einrOffenPunkte=einrPunkte().filter(x=>x.pflicht&&!x.ok).length}catch{}
  let h=$("#einr-hw");
  if(einrOffenPunkte&&S.v!=="einstellungen"){if(!h){h=document.createElement("div");h.id="einr-hw";h.className="hw";hinweise.prepend(h)}
    h.innerHTML=`<span>Einrichtung auf diesem PC: noch ${einrOffenPunkte} ${einrOffenPunkte===1?"Schritt":"Schritte"} nötig.</span><a class="btn primary small" href="#einstellungen">Ansehen</a>`}
  else if(h)h.remove();
  $("#rad-punkt").hidden=!(einrOffenPunkte||(sich&&!sich.hidden));
}
new MutationObserver(hinweisePruefen).observe($("#einr"),{childList:true,attributes:true});
if(sich)new MutationObserver(hinweisePruefen).observe(sich,{attributes:true,attributeFilter:["hidden"]});
const _ro=renderOrdner;renderOrdner=function(){_ro();setTimeout(()=>{hinweisePruefen();if(S.v==="gruppen")gruppeZeigen(S.gid,S.reiter,true);if(S.v==="heute")renderHeute();if(S.v==="einstellungen")renderEinst()},0)};

/* ---------- Suche: findet auch Lerngruppen und Kürzel ---------- */
function suchZiele(roh){
  const q=suchNorm(roh).trim();if(!q)return [];const out=[];
  for(const g of ordner.gruppen){if(suchNorm(g.id).includes(q))out.push({titel:g.id,kurz:`Lerngruppe · ${g.akten.length} Kinder`,los:()=>{$("#q").value="";render();gruppeZeigen(g.id,store.get("lg-reiter","akten"))}})}
  const k=roh.trim().toUpperCase();
  if(/^[A-ZÄÖÜ]{1,3}\d{1,3}$/.test(k))for(const g of ordner.gruppen){if(g.akten.some(a=>a.kuerzel.toUpperCase()===k))out.push({titel:`${k} in ${g.id}`,kurz:"Akte öffnen",los:()=>{$("#q").value="";render();gruppeZeigen(g.id,"akten");setTimeout(()=>{const b=document.querySelector(`#kids .kid[data-k="${CSS.escape(k)}"]`)||[...document.querySelectorAll("#kids .kid")].find(x=>x.dataset.k.toUpperCase()===k);if(b)b.click()},80)}})}
  for(const [w,titel,r] of [["noten","Noten",""],["fehlzeit","Fehlzeiten",""],["akte","Akten",""],["namen","Namen & Kürzel",""],["kuerzel","Namen & Kürzel",""]]){if(q.length>=4&&w.startsWith(q.slice(0,Math.min(q.length,w.length)))&&w.includes(q.slice(0,4))){const id={Noten:"noten",Fehlzeiten:"fehlzeiten",Akten:"akten","Namen & Kürzel":"namen"}[titel];if(!out.some(o=>o.titel===titel))out.push({titel,kurz:`in der Lerngruppe ${S.gid||store.get("letzte-gruppe","")||""}`.trim(),los:()=>{$("#q").value="";render();gruppeZeigen(S.gid||store.get("letzte-gruppe","")||((ordner.gruppen[0]||{}).id),id)}})}}
  return out.slice(0,8);
}
$("#q").addEventListener("input",()=>{if($("#q").value.trim()){if(S.v!=="werkzeuge"){S.vorSuche=location.hash||"#heute";geheZu("werkzeuge")}}});
$("#q").addEventListener("keydown",e=>{if(e.key==="Escape"&&S.vorSuche){const z=S.vorSuche;S.vorSuche=null;location.hash=z}});

/* ---------- Tastatur ---------- */
document.addEventListener("keydown",e=>{
  const tippt=e.target&&e.target.matches&&e.target.matches("input,textarea,select,[contenteditable]");
  if(e.key==="Escape"&&!$(".nm-edit")){const b=[...slot.querySelectorAll("#p-close,#n-close,[id$='-close']")].find(x=>x.offsetParent);
    if(!dialog.hidden){if(b)b.click();else slot.innerHTML="";e.preventDefault();return}
    if(S.v==="gruppen"&&b){b.click();e.preventDefault();return}}
  if(e.altKey&&!e.ctrlKey&&!e.metaKey){const z={"1":"heute","2":"gruppen","3":"werkzeuge","0":"einstellungen"}[e.key];if(z){e.preventDefault();if(z==="gruppen"&&S.gid)geheZu(`gruppe/${S.gid}/${S.reiter}`);else geheZu(z)}return}
  if(!tippt&&e.key==="/"&&!e.ctrlKey&&!e.metaKey){e.preventDefault();$("#q").focus();$("#q").select()}
});
document.querySelectorAll("#nav a").forEach(a=>a.addEventListener("click",e=>{if(a.dataset.v==="gruppen"&&S.gid){e.preventDefault();geheZu(`gruppe/${S.gid}/${S.reiter}`)}if($("#q").value){$("#q").value="";render()}}));

/* ---------- Namen per Doppelklick ändern (Pauls Wunsch 20.11.) ----------
   Namen stehen nur in der Kürzelliste. Akten, Noten und alles für Claude enthalten nur Kürzel.
   Darum genügt es, die eine Zeile der Kürzelliste zu ändern; danach zeigt jede Ansicht den neuen Namen. */
async function nameSpeichern(gid,k,vor,nach){
  const sd=await sdSchreib();const kl=await sd.getDirectoryHandle("kuerzellisten",{create:true});
  const liste=await kuerzellisteLaden(gid);const sp=kuerzelSpalten(liste.zeilen);
  if(sp.iK<0||sp.iV<0||sp.iN<0)throw new Error(`In ${liste.name} fehlen die Spalten Kürzel, Vorname oder Nachname.`);
  const alt=liste.zeilen.slice(sp.kopf+1).find(z=>String(z[sp.iK]||"").trim()===k);
  const code=sp.iC>=0&&alt?String(alt[sp.iC]??"").trim():"";
  const werte={[k]:{vor,nach,code}};
  const daten=liste.art==="xlsx"?await xlsxNamenSchreiben(liste.buf,sp,werte):csvNamenSchreiben(liste,sp,werte);
  const fh=await kl.getFileHandle(liste.name,{create:true});const w=await fh.createWritable();await w.write(daten);await w.close();
  return liste.name;
}
async function nameRoh(gid,k){try{const l=await kuerzellisteLaden(gid);const sp=kuerzelSpalten(l.zeilen);const z=l.zeilen.slice(sp.kopf+1).find(x=>String(x[sp.iK]||"").trim()===k);return z?{vor:String(z[sp.iV]??"").trim(),nach:String(z[sp.iN]??"").trim()}:{vor:"",nach:""}}catch{return {vor:"",nach:""}}}
function toast(text,fehler){let t=$(".nm-toast");if(!t){t=document.createElement("div");t.className="nm-toast";t.setAttribute("role","status");document.body.appendChild(t)}
  t.textContent=text;t.classList.toggle("fehler",!!fehler);clearTimeout(t._z);t._z=setTimeout(()=>t.remove(),fehler?7000:3500)}
async function nachNamensAenderung(gid){
  try{await namenSammeln(sdRoot(),ordner.gruppen.map(g=>g.id))}catch{}
  if(typeof R!=="undefined"&&R&&R.gid===gid&&!$("#raster").hidden){R.namen=await namenLesen(gid);rasterZeichnen()}
  if(S.v==="gruppen"&&S.gid===gid&&slot.parentNode===inhalt)reiterZeigen();
  else if(slot.querySelector(".n-tab"))try{_zeigeNoten(gid)}catch{}
}
document.addEventListener("dblclick",async e=>{
  const el=e.target.closest&&e.target.closest("[data-nm-k][data-nm-g]");if(!el)return;
  e.preventDefault();e.stopPropagation();window.getSelection&&window.getSelection().removeAllRanges();
  const k=el.dataset.nmK,gid=el.dataset.nmG;$(".nm-edit")&&$(".nm-edit").remove();
  const n=await nameRoh(gid,k);
  const box=document.createElement("div");box.className="nm-edit";box.setAttribute("role","dialog");box.setAttribute("aria-label",`Namen von ${k} ändern`);
  box.innerHTML=`<b class="m">${esc(k)} · ${esc(gid)}</b><div class="zeile"><input id="nm-vor" placeholder="Vorname" value="${esc(n.vor)}" autocomplete="off" spellcheck="false" aria-label="Vorname"><input id="nm-nach" placeholder="Nachname" value="${esc(n.nach)}" autocomplete="off" spellcheck="false" aria-label="Nachname"></div><small>Enter speichert in der Kürzelliste, Esc bricht ab. Der Name bleibt ${esc(listenOrt())}.</small>`;
  document.body.appendChild(box);
  const r=el.getBoundingClientRect();box.style.left=Math.max(8,Math.min(innerWidth-310,r.left))+"px";box.style.top=(r.bottom+6+box.offsetHeight>innerHeight?Math.max(8,r.top-box.offsetHeight-6):r.bottom+6)+"px";
  const vI=box.querySelector("#nm-vor"),nI=box.querySelector("#nm-nach");vI.focus();vI.select();
  const zu=()=>{box.remove();document.removeEventListener("mousedown",aussen,true)};
  const aussen=ev=>{if(!box.contains(ev.target))zu()};setTimeout(()=>document.addEventListener("mousedown",aussen,true),0);
  box.addEventListener("keydown",async ev=>{
    if(ev.key==="Escape"){ev.preventDefault();ev.stopPropagation();zu();return}
    if(ev.key!=="Enter")return;ev.preventDefault();
    const vor=vI.value.replace(/\s+/g," ").trim(),nach=nI.value.replace(/\s+/g," ").trim();
    if(vor===n.vor&&nach===n.nach){zu();return}
    vI.disabled=nI.disabled=true;
    try{const datei=await nameSpeichern(gid,k,vor,nach);zu();toast(`Gespeichert: ${k} heißt jetzt ${[vor,nach].filter(Boolean).join(" ")||"(ohne Namen)"} (${datei}).`);await nachNamensAenderung(gid)}
    catch(err){vI.disabled=nI.disabled=false;toast(/NoModification|InvalidState|locked|gesperrt/i.test(String(err&&(err.name+err.message)))?"Die Kürzelliste ist gerade gesperrt (in Excel geöffnet?). Bitte Excel schließen und nochmal Enter.":(err&&err.message)||"Speichern hat nicht geklappt.",true)}
  });
},true);

/* ---------- Ein-/Ausklappen ---------- */
const klappZu=()=>store.get("klapp-zu",[])||[];
function klappen(t){const key=t.dataset.klapp;
  if(key==="nx"){store.set("nx-zu",!store.get("nx-zu",false));try{saErkennung.naechstes()}catch{}return}
  const box=t.closest(".klappbar,.wz-gruppe");if(!box)return;const zu=!box.classList.contains("zu");
  box.classList.toggle("zu",zu);t.setAttribute("aria-expanded",String(!zu));
  const l=klappZu().filter(x=>x!==key);if(zu)l.push(key);store.set("klapp-zu",l)}
document.addEventListener("click",e=>{const t=e.target.closest(".klapp-t[data-klapp]");if(t){e.preventDefault();klappen(t);return}
  const ter=e.target.closest("#woche .ter");if(ter&&!e.target.closest("button,a"))ter.classList.toggle("auf")});
document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches(".klapp-t[data-klapp]")){e.preventDefault();klappen(e.target)}});
document.querySelectorAll(".klappbar .klapp-t[data-klapp]").forEach(t=>{const zu=klappZu().includes(t.dataset.klapp);t.closest(".klappbar").classList.toggle("zu",zu);t.setAttribute("aria-expanded",String(!zu))});

window.saAnsicht={gruppe:(gid,reiter)=>gruppeZeigen(gid,reiter||store.get("lg-reiter","akten")),suchZiele,geheZu,nameSpeichern};
render();anwenden();hinweisePruefen();
})();
