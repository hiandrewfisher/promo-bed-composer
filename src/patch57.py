import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
def one(a,l):
    if s.count(a)!=1: print('ANCHOR %s x%d'%(l,s.count(a)));sys.exit(1)

# Finished takes were the one thing in the ledger that grew without bound: 5 MB of
# WAV and ~108 DOM nodes per bed, never released, so the session got heavier the
# longer it ran whatever the caches did. Park each WAV in the origin-private file
# system as soon as its waveform is drawn and read it back on demand.
HELP = """
let OPFSDIR=null,OPFSOK=null;
async function opfs(){ if(OPFSOK===false)return null;
  if(OPFSDIR)return OPFSDIR;
  try{ const root=await navigator.storage.getDirectory();
       OPFSDIR=await root.getDirectoryHandle('beds',{create:true}); OPFSOK=true; return OPFSDIR }
  catch(e){ OPFSOK=false; return null } }
async function stash(t){
  if(!t.file||t.ofs)return;
  const dir=await opfs(); if(!dir)return;
  try{ const nm=t.id+'-'+(t.rev||0)+'.wav';
       const fh=await dir.getFileHandle(nm,{create:true});
       const w=await fh.createWritable(); await w.write(t.file); await w.close();
       t.ofs=nm; t.fname=t.file.name; t.fsize=t.file.size; t.file=null;
  }catch(e){ console.warn('[PromoMixer] could not park the take on disk',e) } }
const FCACHE=new Map();
async function fileOf(t){
  if(t.file)return t.file;
  const hit=FCACHE.get(t.id); if(hit&&hit.rev===t.rev)return hit.f;
  if(!t.ofs)return null;
  const dir=await opfs(); if(!dir)return null;
  const f=await (await dir.getFileHandle(t.ofs)).getFile();
  FCACHE.set(t.id,{rev:t.rev,f}); while(FCACHE.size>2)FCACHE.delete(FCACHE.keys().next().value);
  return f }
async function dropStash(t){ try{ const dir=await opfs(); if(dir&&t.ofs)await dir.removeEntry(t.ofs) }catch(e){} }
"""
a="globalThis.__PBCWAV=()=>{let n=0;for(const t of s.tracks)if(t.file)n+=t.file.size||0;return n};"
one(a,'wav')
s=s.replace(a,HELP+"globalThis.__PBCWAV=()=>{let n=0;for(const t of s.tracks)if(t.file)n+=t.file.size||0;return n};\n"
 "globalThis.__PBCWAVDISK=()=>{let n=0;for(const t of s.tracks)if(t.ofs)n+=t.fsize||0;return n};")

a2="if(!t.buffer){try{t.buffer=await decode(t.file)}catch(err){throw Error('Unable to read '+t.file.name+'. Re"
one(a2,'getMix')
s=s.replace(a2,"if(!t.buffer){try{t.buffer=await decode(await fileOf(t))}catch(err){throw Error('Unable to read '+(t.fname||t.name+'.wav')+'. Re")

a3="t.liveBuf=await decode(t.file);"
one(a3,'live')
s=s.replace(a3,"t.liveBuf=await decode(await fileOf(t));")

a4="const buf=t.buffer||await decode(t.file);t.peaks=buildPeaks(buf);t.peakDuration=buf.duration;"
one(a4,'peaks')
s=s.replace(a4,"const buf=t.buffer||await decode(await fileOf(t));t.peaks=buildPeaks(buf);t.peakDuration=buf.duration;")
a5="console.warn('[PromoMixer] waveform',t.file.name,err)"
one(a5,'warn')
s=s.replace(a5,"console.warn('[PromoMixer] waveform',t.fname||t.name,err)")

a6="t.peaks=buildPeaks(r.buffer);t.peakDuration=r.buffer.duration;r.buffer=null;"
one(a6,'done')
s=s.replace(a6,"t.peaks=buildPeaks(r.buffer);t.peakDuration=r.buffer.duration;r.buffer=null;stash(t);")
io.open(p,'w',encoding='utf-8').write(s);print('patch57 ok')
