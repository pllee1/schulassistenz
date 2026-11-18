/* schulassistenz · Sicherung der Schülerdaten (Startseite)
   Gehört zum Plugin und wird bei Updates ersetzt. Wird nach dem Hauptskript der Startseite geladen
   und nutzt dessen Funktionen (sdRoot, sdSchreib, sdDateien, ordner, store …).

   Was gesichert wird: lerngruppen/, kuerzellisten/, ausgaben/, archiv/ aus dem Schülerdaten-Ordner
   (bei IServ dort, sonst im Datenordner). Zwei Ziele:
   1. Kopie im Schülerdaten-Ordner unter sicherungen/ (ZIP, schützt vor versehentlichem Löschen/Überschreiben).
   2. Datei zum Mitnehmen, z. B. USB-Stick (mit Passwort verschlüsselt, AES-GCM; schützt vor Ausfall des Servers).
   Protokoll: sicherungen/protokoll.md (nur Datum, Ziel, Dateiname, Anzahl; keine Schülerdaten).
   Erinnerung: alle E.sicherung_tage Tage (Standard 7, 0 = aus). Löschfrist: Abgelaufenes wird nie zurückgeholt. */
(function(){
"use strict";
if(typeof sdRoot!=="function")return;
const SICH_ORDNER=["lerngruppen","kuerzellisten","ausgaben","archiv"];
const TAGE=()=>{const t=parseInt(E.sicherung_tage,10);return isNaN(t)?7:Math.max(0,t)};
const BEHALTEN=()=>{const t=parseInt(E.sicherung_behalten,10);return isNaN(t)?4:Math.max(1,t)};
const MAGIC=new TextEncoder().encode("SASICH1\n");

const css=document.createElement("style");
css.textContent=`.sich-hinweis{background:var(--surface);border:1px solid var(--line);border-left:4px solid var(--warn);border-radius:10px;padding:10px 14px;display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center}
.sich-hinweis p{margin:0;flex:1 1 260px;font-size:14px}
.sich-liste{display:grid;gap:6px}
.sich-zeile{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;border:1px solid var(--line);border-radius:8px;padding:6px 10px;font-size:13.5px}
.sich-zeile b{font-family:var(--f-mono);font-size:12.5px;overflow-wrap:anywhere}.sich-zeile .sp{flex:1}
.sich-pw{display:flex;flex-wrap:wrap;gap:8px;align-items:end}.sich-pw label{display:grid;gap:4px;font-size:12.5px;color:var(--muted);flex:1 1 180px}
.sich-pw input{font:inherit;padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink)}
.sich-stat{display:flex;flex-wrap:wrap;gap:6px}.sich-stat span{background:var(--bg);border-radius:999px;padding:2px 10px;font-size:12.5px}
.sich-details summary{cursor:pointer;font-size:13px;color:var(--muted)}.sich-details ul{margin:6px 0 0;padding-left:18px;font-size:12.5px;max-height:220px;overflow:auto}`;
document.head.appendChild(css);
const box=document.createElement("section");box.id="sich-hinweis";box.hidden=true;box.setAttribute("aria-label","Erinnerung Sicherung");
const einr=document.getElementById("einr");if(einr)einr.after(box);else document.querySelector(".wrap").prepend(box);

/* ---------- ZIP schreiben und lesen ---------- */
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc32=u=>{let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CRC[(c^u[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0};
async function strom(u,art,neu){return new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(neu?new CompressionStream(art):new DecompressionStream(art))).arrayBuffer())}
async function zipBauen(dateien){
  const te=new TextEncoder(),teile=[],zentral=[];let off=0;const d=new Date();
  const zeit=(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1),tag=((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate();
  for(const f of dateien){
    const name=te.encode(f.rel),roh=f.bytes,crc=crc32(roh);let daten=await strom(roh,"deflate-raw",true),meth=8;
    if(daten.length>=roh.length){daten=roh;meth=0}
    const lh=new DataView(new ArrayBuffer(30));
    lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,meth,true);lh.setUint16(10,zeit,true);lh.setUint16(12,tag,true);
    lh.setUint32(14,crc,true);lh.setUint32(18,daten.length,true);lh.setUint32(22,roh.length,true);lh.setUint16(26,name.length,true);lh.setUint16(28,0,true);
    teile.push(new Uint8Array(lh.buffer),name,daten);
    const ch=new DataView(new ArrayBuffer(46));
    ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(10,meth,true);ch.setUint16(12,zeit,true);ch.setUint16(14,tag,true);
    ch.setUint32(16,crc,true);ch.setUint32(20,daten.length,true);ch.setUint32(24,roh.length,true);ch.setUint16(28,name.length,true);ch.setUint32(42,off,true);
    zentral.push(new Uint8Array(ch.buffer),name);off+=30+name.length+daten.length}
  let zl=0;zentral.forEach(x=>zl+=x.length);
  const e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,dateien.length,true);e.setUint16(10,dateien.length,true);e.setUint32(12,zl,true);e.setUint32(16,off,true);
  return new Uint8Array(await new Blob([...teile,...zentral,new Uint8Array(e.buffer)]).arrayBuffer())}
async function zipEntpacken(buf){
  const dv=new DataView(buf.buffer,buf.byteOffset,buf.byteLength);let eocd=-1;
  for(let i=buf.byteLength-22;i>=Math.max(0,buf.byteLength-66000);i--)if(dv.getUint32(i,true)===0x06054b50){eocd=i;break}
  if(eocd<0)throw new Error("Das ist keine gültige Sicherung (ZIP nicht lesbar).");
  const n=dv.getUint16(eocd+10,true);let off=dv.getUint32(eocd+16,true);const td=new TextDecoder(),out=[];
  for(let k=0;k<n;k++){
    if(dv.getUint32(off,true)!==0x02014b50)break;
    const meth=dv.getUint16(off+10,true),crc=dv.getUint32(off+16,true),cs=dv.getUint32(off+20,true),nl=dv.getUint16(off+28,true),el=dv.getUint16(off+30,true),cl=dv.getUint16(off+32,true),lo=dv.getUint32(off+42,true);
    const rel=td.decode(buf.subarray(off+46,off+46+nl));off+=46+nl+el+cl;
    if(rel.endsWith("/"))continue;
    const s=lo+30+dv.getUint16(lo+26,true)+dv.getUint16(lo+28,true);const roh=buf.subarray(s,s+cs);
    const bytes=meth===0?roh.slice():await strom(roh,"deflate-raw",false);
    if(crc32(bytes)!==crc)throw new Error("Die Sicherung ist beschädigt ("+rel+").");
    out.push({rel,bytes})}
  return out}

/* ---------- Verschlüsselung (Passwort → PBKDF2 → AES-GCM) ---------- */
async function schluessel(pw,salz){const k=await crypto.subtle.importKey("raw",new TextEncoder().encode(pw),"PBKDF2",false,["deriveKey"]);
  return crypto.subtle.deriveKey({name:"PBKDF2",salt:salz,iterations:310000,hash:"SHA-256"},k,{name:"AES-GCM",length:256},false,["encrypt","decrypt"])}
async function verschluesseln(zip,pw){const salz=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
  const c=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},await schluessel(pw,salz),zip));
  return new Uint8Array(await new Blob([MAGIC,salz,iv,c]).arrayBuffer())}
const istVerschluesselt=u=>u.length>MAGIC.length&&MAGIC.every((b,i)=>u[i]===b);
async function entschluesseln(u,pw){const o=MAGIC.length,salz=u.subarray(o,o+16),iv=u.subarray(o+16,o+28);
  try{return new Uint8Array(await crypto.subtle.decrypt({name:"AES-GCM",iv},await schluessel(pw,salz),u.subarray(o+28)))}
  catch{throw new Error("Passwort falsch oder Datei beschädigt.")}}

/* ---------- Daten einsammeln, Protokoll ---------- */
const jetzt=()=>{const d=new Date(),z=n=>String(n).padStart(2,"0");return {tag:heuteISO(),uhr:z(d.getHours())+":"+z(d.getMinutes()),stempel:heuteISO()+"-"+z(d.getHours())+z(d.getMinutes())}};
function bereit(){return ordner.zustand==="an"&&!!sdRoot()&&(!sdExtern()||sdZustand==="an")}
/* Löschfrist: Akten mit loeschen_ab ≤ heute, ganze Gruppen mit abgelaufener gruppe.md samt Kürzelliste */
function fristTeilen(dateien){const heute=heuteISO(),td=new TextDecoder(),weg=new Set(),gruppen=new Set();
  for(const d of dateien){if(!/\.md$/i.test(d.rel))continue;const f=(td.decode(d.bytes).match(/^loeschen_ab:\s*(\d{4}-\d{2}-\d{2})/m)||[])[1];
    if(f&&f<=heute){weg.add(d.rel);const g=d.rel.match(/^(?:archiv\/[^/]+\/|)lerngruppen\/([^/]+)\/gruppe\.md$/)||d.rel.match(/^archiv\/[^/]+\/([^/]+)\/gruppe\.md$/);if(g)gruppen.add(g[1])}}
  const ok=[],frist=[];
  for(const d of dateien){const gid=(d.rel.match(/^kuerzellisten\/Kuerzelliste-(.+)\.(xlsx|csv)$/i)||[])[1]||(d.rel.match(/^lerngruppen\/([^/]+)\//)||[])[1]||(d.rel.match(/^archiv\/[^/]+\/([^/]+)\//)||[])[1];
    (weg.has(d.rel)||(gid&&gruppen.has(gid))?frist:ok).push(d)}
  return {ok,frist}}
async function einsammeln(){const root=sdRoot();const out=[];
  for(const o of SICH_ORDNER){const d=await unterordner(root,o);if(!d)continue;
    for(const f of await sdDateien(d,o+"/")){if(/(^|\/)(~\$|\.~lock)/.test(f.rel)||/(^|\/)(desktop\.ini|Thumbs\.db)$/i.test(f.rel))continue;
      out.push({rel:f.rel,bytes:new Uint8Array(await (await f.h.getFile()).arrayBuffer())})}}
  return fristTeilen(out).ok}
function zipMitInfo(dateien,art){const info={programm:"schulassistenz",art,erstellt:new Date().toISOString(),version:window.SA_PLUGIN_VERSION||"",dateien:dateien.length};
  return zipBauen([...dateien,{rel:"sicherung.json",bytes:new TextEncoder().encode(JSON.stringify(info,null,1))}])}
async function sichOrdner(anlegen){const root=anlegen?await sdSchreib():sdRoot();if(!root)return null;
  try{return await root.getDirectoryHandle("sicherungen",anlegen?{create:true}:undefined)}catch{return null}}
async function lesenText(dir,name){try{return await (await (await dir.getFileHandle(name)).getFile()).text()}catch{return ""}}
async function protokoll(){const d=await sichOrdner(false);if(!d)return [];
  return (await lesenText(d,"protokoll.md")).split(/\r?\n/).map(z=>z.match(/^-\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})?\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*(\d+)/)).filter(Boolean)
    .map(m=>({tag:m[1],uhr:m[2]||"",ziel:m[3],name:m[4],n:+m[5]}))}
async function protokollieren(ziel,name,n,zusatz){store.set("sich-letzte",heuteISO());try{const d=await sichOrdner(true);let t=await lesenText(d,"protokoll.md");
  if(!t.trim())t="# Sicherungen der Schülerdaten\n\nNur Datum, Ziel und Dateiname, keine Schülerdaten. Geschrieben von der Startseite.\n\n";
  const j=jetzt();t=t.replace(/\s*$/,"\n")+`- ${j.tag} ${j.uhr} | ${ziel} | ${name} | ${n} Dateien${zusatz?" | "+zusatz:""}\n`;
  await schreibe(d,"protokoll.md",t)}catch(e){console.warn("Protokoll der Sicherung nicht geschrieben",e)}}
async function sicherungenListe(){const d=await sichOrdner(false);if(!d)return [];const r=[];
  for await(const [n,h] of d.entries())if(h.kind==="file"&&/\.(zip|sasicherung)$/i.test(n))r.push({name:n,h,d});
  const st=n=>(n.match(/(\d{4}-\d{2}-\d{2}-\d{4})/)||[])[1]||"";return r.sort((a,b)=>st(a.name)<st(b.name)?1:st(a.name)>st(b.name)?-1:0)}
const tageSeit=t=>t?Math.floor((new Date(heuteISO())-new Date(t))/864e5):null;

/* ---------- Erinnerung ---------- */
let erinnertAm=null;
async function erinnern(){
  if(!TAGE()||!bereit()||!ordner.gruppen.length){box.hidden=true;return}
  if(store.get("sich-spaeter","")===heuteISO()){box.hidden=true;return}
  let letzte=store.get("sich-letzte","");
  if(erinnertAm!==heuteISO()){try{const p=await protokoll();const neu=p.map(x=>x.tag).sort().pop();if(neu)letzte=neu;store.set("sich-letzte",letzte||"");erinnertAm=heuteISO()}catch{}}
  const t=tageSeit(letzte);
  if(t!==null&&t<TAGE()){box.hidden=true;return}
  box.className="sich-hinweis";box.hidden=false;
  box.innerHTML=`<p>${t===null?"Von deinen Schülerdaten gibt es noch keine Sicherung.":`Deine letzte Sicherung der Schülerdaten ist ${t} Tage alt (${esc(datumDE(letzte))}).`} Einmal pro Woche sichern schützt vor versehentlichem Löschen.</p>
    <button class="btn primary small" id="sich-jetzt">Jetzt sichern</button><button class="btn ghost small" id="sich-morgen">Morgen erinnern</button>`;
  box.querySelector("#sich-jetzt").addEventListener("click",()=>zeigen());
  box.querySelector("#sich-morgen").addEventListener("click",()=>{store.set("sich-spaeter",heuteISO());box.hidden=true});
}

/* ---------- Panel ---------- */
async function zeigen(){
  const slot=$("#panel-slot");
  if(!bereit()){slot.innerHTML=`<div class="panel"><h4>Schülerdaten sichern</h4><p>Dafür braucht die Seite deine Akten. Bitte rechts unter „Lerngruppen und Akten“ den Datenordner${sdExtern()?" und den Schülerdaten-Ordner":""} verbinden.</p><div class="actions"><button class="btn ghost" id="p-close">Schließen</button></div></div>`;
    $("#p-close").addEventListener("click",()=>slot.innerHTML="");slot.scrollIntoView({block:"nearest",behavior:"smooth"});return}
  slot.innerHTML=`<div class="panel"><div class="p-kopf"><h4>Schülerdaten sichern</h4><span class="sp"></span><button class="btn ghost small" id="p-close">Schließen</button></div>
    <p class="note" id="sich-stand">Lese den Stand …</p>
    <div><b>1. Kopie ${sdDav()?"auf IServ":"im Schülerdaten-Ordner"}</b><p class="note">Legt eine ZIP-Datei in <span class="path">${esc(sdPfad("sicherungen/"))}</span> ab. Schützt vor versehentlichem Löschen oder Überschreiben. Akten mit abgelaufener Löschfrist werden nicht mitgesichert. Es bleiben die neuesten ${BEHALTEN()} Sicherungen, ältere schlägt die Seite zum Löschen vor.</p>
      <div class="actions"><button class="btn primary" id="sich-server">Jetzt sichern</button><span class="toast" id="sich-t1" role="status"></span></div></div>
    <div><b>2. Datei zum Mitnehmen (verschlüsselt)</b><p class="note">Für den Fall, dass der Server ausfällt. Die Datei ist mit deinem Passwort verschlüsselt und lässt sich nur hier auf der Startseite öffnen. Speichere sie auf einem USB-Stick oder an einem Ort, den die Schulleitung erlaubt, nicht in einem privaten Cloud-Speicher. Ohne Passwort ist die Sicherung verloren; schreib es nicht in eine Datei.</p>
      <div class="sich-pw"><label>Passwort (mind. 10 Zeichen)<input type="password" id="sich-pw1" autocomplete="new-password"></label><label>Passwort wiederholen<input type="password" id="sich-pw2" autocomplete="new-password"></label><button class="btn ghost" id="sich-datei">Datei speichern …</button></div>
      <span class="toast" id="sich-t2" role="status"></span></div>
    <div><b>Sicherungen</b><div class="sich-liste" id="sich-liste"><p class="note">…</p></div>
      <div class="actions" style="margin-top:8px"><label class="btn ghost small" style="cursor:pointer">Sicherungsdatei öffnen …<input type="file" id="sich-oeffnen" accept=".sasicherung,.zip" hidden></label><span class="toast" id="sich-t3" role="status"></span></div></div>
    <div id="sich-pruef"></div>
    <div class="guard" id="sich-fehler" hidden></div></div>`;
  $("#p-close").addEventListener("click",()=>slot.innerHTML="");
  const fehler=m=>{const g=$("#sich-fehler");if(!g)return;g.hidden=!m;g.textContent=m||""};
  async function stand(){
    const p=await protokoll().catch(()=>[]);const s=$("#sich-stand");if(!s)return;
    const le=(z)=>{const x=p.filter(y=>y.ziel===z).pop();return x?`${datumDE(x.tag)}${x.uhr?" "+x.uhr:""} (${x.n} Dateien)`:"noch nie"};
    s.textContent=`Letzte Kopie ${sdDav()?"auf IServ":"im Schülerdaten-Ordner"}: ${le("Server")}. Letzte Datei zum Mitnehmen: ${le("Datei")}.${TAGE()?` Die Startseite erinnert dich alle ${TAGE()} Tage.`:" Erinnerung ist ausgeschaltet."}`;
    const liste=await sicherungenListe().catch(()=>[]);const l=$("#sich-liste");if(!l)return;
    const alt=liste.filter(x=>/\.zip$/i.test(x.name)).slice(BEHALTEN());
    l.innerHTML=liste.length?liste.map((x,i)=>`<div class="sich-zeile"><b>${esc(x.name)}</b><span class="sp"></span><button class="btn ghost small" data-i="${i}" data-a="ansehen">Ansehen / zurückholen</button><button class="btn ghost small" data-i="${i}" data-a="weg">Löschen</button></div>`).join("")
      +(alt.length?`<div class="actions"><button class="btn ghost small" id="sich-alt">Ältere löschen (${alt.length})</button></div>`:""):`<p class="note">Noch keine Sicherung auf dem Server.</p>`;
    l.querySelectorAll("button[data-a]").forEach(b=>b.addEventListener("click",async()=>{const x=liste[+b.dataset.i];fehler("");
      if(b.dataset.a==="ansehen"){try{pruefen(new Uint8Array(await (await x.h.getFile()).arrayBuffer()),x.name)}catch(e){fehler(e.message)}}
      else frage(`Sicherung <b>${esc(x.name)}</b> löschen?`,"Löschen",async()=>{try{await sdSchreib();await x.d.removeEntry(x.name);await stand()}catch(e){fehler(e.message)}})}));
    if($("#sich-alt"))$("#sich-alt").addEventListener("click",()=>frage(`${alt.length} ältere Sicherungen löschen? Es bleiben die neuesten ${BEHALTEN()}.`,"Löschen",async()=>{
      try{await sdSchreib();for(const x of alt)await x.d.removeEntry(x.name);await stand()}catch(e){fehler(e.message)}}));
  }
  function frage(text,ja,fn){const p=$("#sich-pruef");p.innerHTML=`<div class="guard frage"><span>${text}</span> <button class="btn primary small" id="sf-ja">${esc(ja)}</button> <button class="btn ghost small" id="sf-nein">Abbrechen</button></div>`;
    $("#sf-nein").addEventListener("click",()=>p.innerHTML="");$("#sf-ja").addEventListener("click",()=>{p.innerHTML="";fn()})}

  $("#sich-server").addEventListener("click",async()=>{const t=$("#sich-t1"),b=$("#sich-server");fehler("");b.disabled=true;
    try{t.textContent="Sammle Dateien …";const f=await einsammeln();if(!f.length)throw new Error("Im Schülerdaten-Ordner liegen noch keine Dateien.");
      t.textContent=`Packe ${f.length} Dateien …`;const zip=await zipMitInfo(f,"server");
      const d=await sichOrdner(true);const name=`sicherung-${jetzt().stempel}.zip`;
      t.textContent="Speichere …";const fh=await d.getFileHandle(name,{create:true});const w=await fh.createWritable();await w.write(zip);await w.close();
      if(typeof DavDatei!=="undefined"&&fh instanceof DavDatei)fh.inhalt=null;
      const zurueck=new Uint8Array(await (await fh.getFile()).arrayBuffer());
      if(zurueck.length!==zip.length||(await zipEntpacken(zurueck)).length!==f.length+1)throw new Error("Die gespeicherte Sicherung ließ sich nicht prüfen. Bitte erneut versuchen.");
      await protokollieren("Server",name,f.length);t.textContent=`Gesichert und geprüft: ${f.length} Dateien (${kb(zip.length)}).`;box.hidden=true;await stand()}
    catch(e){t.textContent="";fehler((e&&e.message)||"Sichern hat nicht geklappt.")}finally{b.disabled=false}});

  $("#sich-datei").addEventListener("click",async()=>{const t=$("#sich-t2");fehler("");const p1=$("#sich-pw1").value,p2=$("#sich-pw2").value;
    if(p1.length<10){fehler("Das Passwort braucht mindestens 10 Zeichen.");return}if(p1!==p2){fehler("Die beiden Passwörter sind verschieden.");return}
    const name=`schulassistenz-sicherung-${jetzt().stempel}.sasicherung`;let ziel=null;
    if(window.showSaveFilePicker){try{ziel=await showSaveFilePicker({suggestedName:name,id:"sa-sicherung",types:[{description:"Schulassistenz-Sicherung",accept:{"application/octet-stream":[".sasicherung"]}}]})}catch(e){if(e&&e.name==="AbortError")return;ziel=null}}
    try{t.textContent="Sammle Dateien …";const f=await einsammeln();if(!f.length)throw new Error("Im Schülerdaten-Ordner liegen noch keine Dateien.");
      t.textContent="Verschlüssele …";const daten=await verschluesseln(await zipMitInfo(f,"datei"),p1);
      const probe=await zipEntpacken(await entschluesseln(daten,p1));if(probe.length!==f.length+1)throw new Error("Prüfung der Sicherung fehlgeschlagen.");
      let gespeichert=name;
      if(ziel){const w=await ziel.createWritable();await w.write(daten);await w.close();gespeichert=ziel.name}
      else{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([daten],{type:"application/octet-stream"}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000)}
      $("#sich-pw1").value="";$("#sich-pw2").value="";
      await protokollieren("Datei",gespeichert,f.length,"verschlüsselt");
      t.textContent=`Gespeichert: ${gespeichert} (${f.length} Dateien, ${kb(daten.length)}).${ziel?"":" Sie liegt in deinen Downloads; verschiebe sie auf den USB-Stick."} Ältere Dateien dort kannst du löschen.`;box.hidden=true;await stand()}
    catch(e){t.textContent="";fehler((e&&e.message)||"Speichern hat nicht geklappt.")}});

  $("#sich-oeffnen").addEventListener("change",async e=>{const f=e.target.files&&e.target.files[0];e.target.value="";if(!f)return;fehler("");
    try{pruefen(new Uint8Array(await f.arrayBuffer()),f.name)}catch(x){fehler(x.message)}});

  /* Zurückholen: zeigt, was fehlt oder anders ist. Abgelaufenes (loeschen_ab) wird nie zurückgeholt. */
  async function pruefen(u,name){
    const p=$("#sich-pruef");
    if(istVerschluesselt(u)){
      p.innerHTML=`<div class="panel" style="border-color:var(--line)"><b>${esc(name)}</b><div class="sich-pw"><label>Passwort der Sicherung<input type="password" id="sich-pw-auf" autocomplete="off"></label><button class="btn primary" id="sich-auf">Öffnen</button></div></div>`;
      const los=async()=>{try{const z=await entschluesseln(u,$("#sich-pw-auf").value);vergleichen(await zipEntpacken(z),name)}catch(e){fehler(e.message)}};
      $("#sich-auf").addEventListener("click",los);$("#sich-pw-auf").addEventListener("keydown",e=>{if(e.key==="Enter")los()});$("#sich-pw-auf").focus();return}
    vergleichen(await zipEntpacken(u),name)}
  async function vergleichen(dateien,name){
    fehler("");const p=$("#sich-pruef");p.innerHTML=`<p class="note">Vergleiche mit dem aktuellen Stand …</p>`;
    const info=(()=>{const x=dateien.find(d=>d.rel==="sicherung.json");try{return x?JSON.parse(new TextDecoder().decode(x.bytes)):null}catch{return null}})();
    dateien=dateien.filter(d=>d.rel!=="sicherung.json"&&SICH_ORDNER.includes(d.rel.split("/")[0])&&!d.rel.split("/").includes(".."));
    const ab=fristTeilen(dateien);
    const root=sdRoot(),stat={fehlt:[],gleich:[],anders:[],frist:ab.frist};
    for(const d of ab.ok){
      let jetzt=null;try{let dir=root;const t=d.rel.split("/");for(const x of t.slice(0,-1))dir=await dir.getDirectoryHandle(x);jetzt=new Uint8Array(await (await (await dir.getFileHandle(t[t.length-1])).getFile()).arrayBuffer())}catch{}
      if(!jetzt)stat.fehlt.push(d);else if(gleicheBytes(jetzt.buffer,d.bytes.slice().buffer))stat.gleich.push(d);else stat.anders.push(d)}
    const li=a=>a.map(d=>`<li>${esc(d.rel)}</li>`).join("");
    p.innerHTML=`<div class="panel" style="border-color:var(--line)"><b>${esc(name)}</b>${info&&info.erstellt?`<span class="note">erstellt ${esc(datumDE(info.erstellt.slice(0,10)))}</span>`:""}
      <div class="sich-stat"><span>${stat.gleich.length} unverändert</span><span>${stat.fehlt.length} fehlen heute</span><span>${stat.anders.length} heute anders</span>${stat.frist.length?`<span>${stat.frist.length} Löschfrist abgelaufen</span>`:""}</div>
      ${stat.fehlt.length?`<details class="sich-details"><summary>Fehlen heute (${stat.fehlt.length})</summary><ul>${li(stat.fehlt)}</ul></details>`:""}
      ${stat.anders.length?`<details class="sich-details"><summary>Heute anders (${stat.anders.length})</summary><ul>${li(stat.anders)}</ul></details>`:""}
      ${stat.frist.length?`<p class="note">Dateien mit abgelaufener Löschfrist werden nicht zurückgeholt.</p>`:""}
      <p class="note">Vor dem Zurückholen sichert die Seite den heutigen Stand automatisch unter sicherungen/. Es wird nichts gelöscht.</p>
      <div class="actions">${stat.fehlt.length?`<button class="btn primary" id="sich-fehlende">Fehlende zurückholen (${stat.fehlt.length})</button>`:""}${stat.anders.length?`<button class="btn ghost" id="sich-ersetzen">Auch geänderte durch die Sicherung ersetzen (${stat.anders.length})</button>`:""}${!stat.fehlt.length&&!stat.anders.length?`<span class="toast">Alles ist auf dem Stand der Sicherung oder neuer.</span>`:""}<span class="toast" id="sich-t4" role="status"></span></div></div>`;
    const zurueck=async liste=>{const t=$("#sich-t4");
      try{t.textContent="Sichere den heutigen Stand …";const f=await einsammeln();
        if(f.length){const d=await sichOrdner(true);const n=`vor-wiederherstellung-${jetzt().stempel}.zip`;await schreibe(d,n,await zipMitInfo(f,"vor-wiederherstellung"));await protokollieren("Server",n,f.length,"vor dem Zurückholen")}
        const root=await sdSchreib();let n=0;
        for(const d of liste){t.textContent=`Schreibe ${++n} von ${liste.length} …`;const teile=d.rel.split("/");let dir=root;for(const x of teile.slice(0,-1))dir=await dir.getDirectoryHandle(x,{create:true});await schreibe(dir,teile[teile.length-1],d.bytes)}
        t.textContent=`${liste.length} Dateien zurückgeholt.`;await ordnerLesen(ordnerHandle);renderOrdner();await stand()}
      catch(e){t.textContent="";fehler((e&&e.message)||"Zurückholen hat nicht geklappt.")}};
    if($("#sich-fehlende"))$("#sich-fehlende").addEventListener("click",()=>zurueck(stat.fehlt));
    if($("#sich-ersetzen"))$("#sich-ersetzen").addEventListener("click",()=>frage(`${stat.anders.length} Dateien durch die Fassung aus der Sicherung ersetzen? Neuere Einträge in diesen Dateien gehen dann verloren (sie bleiben in der automatischen Sicherung von heute).`,"Ersetzen",()=>zurueck([...stat.fehlt,...stat.anders])));
    p.scrollIntoView({block:"nearest",behavior:"smooth"})}
  await stand();
  slot.scrollIntoView({block:"nearest",behavior:"smooth"});
}
window.saSicherung={zeigen,erinnern,zipBauen,zipEntpacken,verschluesseln,entschluesseln};
setTimeout(erinnern,0);
})();
