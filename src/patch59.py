import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
def one(a,l):
    if s.count(a)!=1: print('ANCHOR %s x%d'%(l,s.count(a)));sys.exit(1)

# A finished take needs to leave nothing behind but its WAV and a small record of
# the settings that made it. The composer's full working notes for each bed — the
# channel dump, the note-level diagnostics, the source score, the song settings —
# go to disk with the audio and come back only when something actually opens them.
HELP = """
const HEAVY=['detail','chan','piece','songDef','metaAll'];
const HCACHE=new Set();
async function park(t){
  if(t.parked||!t.chan&&!t.detail)return;
  const dir=await opfs(); if(!dir)return;
  try{ const nm=t.id+'-'+(t.rev||0)+'.json',o={};
       for(const k of HEAVY)if(t[k]!=null)o[k]=t[k];
       const fh=await dir.getFileHandle(nm,{create:true});
       const w=await fh.createWritable(); await w.write(new Blob([JSON.stringify(o)],{type:'application/json'})); await w.close();
       t.parked=nm; t.hasChan=!!t.chan; t.hasSong=!!t.songDef;
       for(const k of HEAVY)t[k]=null; HCACHE.delete(t.id);
  }catch(e){ console.warn('[PromoMixer] could not park bed settings',e) } }
async function unpark(t){
  if(!t.parked)return t;
  const dir=await opfs(); if(!dir)return t;
  try{ const f=await (await dir.getFileHandle(t.parked)).getFile();
       const o=JSON.parse(await f.text());
       for(const k of HEAVY)if(o[k]!=null)t[k]=o[k];
       t.parked=null; HCACHE.add(t.id);
       // keep at most three beds unpacked at a time
       for(const other of s.tracks)if(other!==t&&HCACHE.has(other.id)&&HCACHE.size>3){HCACHE.delete(other.id);park(other)}
  }catch(e){ console.warn('[PromoMixer] could not read bed settings',e) }
  return t }
async function unparkAll(list){ for(const t of list)await unpark(t); }
"""
a="let OPFSDIR=null,OPFSOK=null;"
one(a,'opfsdecl'); s=s.replace(a,HELP+"let OPFSDIR=null,OPFSOK=null;")

a2="t.peaks=buildPeaks(r.buffer);t.peakDuration=r.buffer.duration;r.buffer=null;stash(t);"
one(a2,'done')
s=s.replace(a2,"t.peaks=buildPeaks(r.buffer);t.peakDuration=r.buffer.duration;r.buffer=null;stash(t);setTimeout(()=>park(t),0);")

a3="ie.disabled=!t.chan;ie.onclick=()=>{t.showEd=!t.showEd;render()};"
one(a3,'editor')
s=s.replace(a3,"ie.disabled=!(t.chan||t.hasChan);ie.onclick=async()=>{if(!t.showEd)await unpark(t);t.showEd=!t.showEd;render()};")

a4="ap.onclick=()=>{stopPrev();"
one(a4,'apply')
s=s.replace(a4,"ap.onclick=async()=>{await unpark(t);stopPrev();")

# the remix menu reads the source score and the channel list, so it unparks first
a5="b.onclick=()=>{menu.hidden=true;let blend=t.blend;"
one(a5,'remixopen')
s=s.replace(a5,"b.onclick=async()=>{menu.hidden=true;await unpark(t);let blend=t.blend;")

a6="$('ratings').onclick=async()=>{const j=ratingsJSON();"
one(a6,'ratings')
s=s.replace(a6,"$('ratings').onclick=async()=>{await unparkAll(s.tracks.filter(t=>t.stars>0));const j=ratingsJSON();")
io.open(p,'w',encoding='utf-8').write(s);print('patch59 ok')
