/* Your own music as source material.
   An audio file is analysed once into the same compact score record the bundled
   library uses — key, tempo, bar-by-bar chords, a melody line, phrase marks —
   and only that record is kept. The audio is never stored and never uploaded.
   Records live in IndexedDB, so thousands of files cost a few megabytes. */
(function(){
if(window.UL)return;
const DB='pbc-userlib',VER=1,STORE='pieces';
const log=(...a)=>{try{console.log('[PromoMixer/library]',...a)}catch(e){}};
let dbp=null;
const open=()=>dbp||(dbp=new Promise((res,rej)=>{
  const q=indexedDB.open(DB,VER);
  q.onupgradeneeded=e=>{const d=e.target.result;
    if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'k'})};
  q.onsuccess=e=>res(e.target.result); q.onerror=()=>rej(q.error)}));
const tx=async(mode,fn)=>{const d=await open();return new Promise((res,rej)=>{
  const t=d.transaction(STORE,mode),s=t.objectStore(STORE);let out;
  try{out=fn(s)}catch(e){rej(e);return}
  t.oncomplete=()=>res(out instanceof IDBRequest?out.result:out); t.onerror=()=>rej(t.error)})};

/* ---- the analysis worker ------------------------------------------------ */
function kernel(){
 const PC=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
 // Krumhansl-Schmuckler profiles, normalised
 const KMAJ=[6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88];
 const KMIN=[6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17];
 const TPL={maj:[0,4,7],min:[0,3,7],'7':[0,4,7,10],m7:[0,3,7,10],sus:[0,5,7]};
 const goertzel=(x,n0,n1,f,sr)=>{const w=2*Math.PI*f/sr,c=2*Math.cos(w);
   let s1=0,s2=0;for(let i=n0;i<n1;i++){const s=x[i]+c*s1-s2;s2=s1;s1=s}
   return Math.sqrt(Math.max(0,s1*s1+s2*s2-c*s1*s2))/(n1-n0)};
 onmessage=({data:{pcm,sr,name}})=>{
  const t0=performance.now(),x=new Float32Array(pcm),N=x.length;
  const post=(stage,extra)=>postMessage({type:'stage',stage,...extra});
  try{
   post('analyse.begin',{frames:N,seconds:+(N/sr).toFixed(1)});
   const HOP=Math.round(sr*0.023),WIN=HOP*2,F=Math.floor((N-WIN)/HOP);
   if(F<8)throw new Error('too short');
   // chroma per frame over five octaves, plus a bass chroma from the lowest two
   const CH=new Float32Array(F*12),BASS=new Float32Array(F*12),EN=new Float32Array(F);
   for(let f=0;f<F;f++){const a=f*HOP,b=a+WIN;let e=0;
    for(let i=a;i<b;i++)e+=x[i]*x[i];EN[f]=Math.sqrt(e/WIN);
    for(let p=0;p<12;p++){let m=0,mb=0;
     for(let o=2;o<7;o++){const hz=440*Math.pow(2,(p+12*o-57)/12);
      if(hz>sr*0.45)continue;const g=goertzel(x,a,b,hz,sr);m+=g;if(o<4)mb+=g}
     CH[f*12+p]=m;BASS[f*12+p]=mb}}
   post('chroma.ready',{frames:F});
   // onset envelope from positive spectral flux, then tempo by autocorrelation
   const FL=new Float32Array(F);
   for(let f=1;f<F;f++){let s=0;for(let p=0;p<12;p++){const d=CH[f*12+p]-CH[(f-1)*12+p];if(d>0)s+=d}FL[f]=s}
   let mx=0;for(let f=0;f<F;f++)if(FL[f]>mx)mx=FL[f];
   if(mx>0)for(let f=0;f<F;f++)FL[f]/=mx;
   const fps=sr/HOP;let bpm=0,bs=-1;
   for(let b=60;b<=190;b+=0.25){const lag=60/b*fps;if(lag>=F/2)continue;
    let s=0,n=0;for(let m=1;m<=4;m++){const L=Math.round(lag*m);if(L>=F)break;
     for(let f=0;f+L<F;f++){s+=FL[f]*FL[f+L];n++}}
    if(n){const lg=Math.log2(b/112),w=Math.exp(-0.5*(lg/0.42)*(lg/0.42));
     const v=s/n*w;if(v>bs){bs=v;bpm=b}}}
   if(!bpm)bpm=110;
   while(bpm<76)bpm*=2;while(bpm>168)bpm/=2;
   const lag=60/bpm*fps;
   let ph=0,ps=-1;
   for(let o=0;o<Math.round(lag);o++){let s=0;for(let f=o;f<F;f+=lag)s+=FL[Math.round(f)]||0;
    if(s>ps){ps=s;ph=o}}
   post('tempo.ready',{bpm:+bpm.toFixed(1),confidence:+bs.toFixed(4)});
   // key by correlating the mean chroma with both profiles at all twelve roots
   const mean=new Float32Array(12);
   for(let f=0;f<F;f++)for(let p=0;p<12;p++)mean[p]+=CH[f*12+p];
   let tot=0;for(let p=0;p<12;p++)tot+=mean[p];
   if(tot>0)for(let p=0;p<12;p++)mean[p]/=tot;
   const corr=(a,b)=>{let s=0;for(let i=0;i<12;i++)s+=a[i]*b[i];return s};
   let key=0,mode='maj',ks=-1;
   for(let r=0;r<12;r++){const rot=new Float32Array(12);
    for(let i=0;i<12;i++)rot[i]=mean[(i+r)%12];
    const a=corr(rot,KMAJ),b=corr(rot,KMIN);
    if(a>ks){ks=a;key=r;mode='maj'}if(b>ks){ks=b;key=r;mode='min'}}
   post('key.ready',{key:PC[key],mode});
   // chords every half bar, melody every beat, from the same chroma
   const beatF=lag,bars=Math.max(2,Math.floor((F-ph)/(beatF*4))),BAR=4;
   const chords=[],mel=[];
   for(let h=0;h<bars*2;h++){
    const a=Math.round(ph+h*beatF*2),b=Math.min(F,Math.round(a+beatF*2));
    if(b-a<2)break;
    const seg=new Float32Array(12),bas=new Float32Array(12);
    for(let f=a;f<b;f++)for(let p=0;p<12;p++){seg[p]+=CH[f*12+p];bas[p]+=BASS[f*12+p]}
    let st=0;for(let p=0;p<12;p++)st+=seg[p];
    if(st>0)for(let p=0;p<12;p++)seg[p]/=st;
    let best=null,bv=-1;
    for(const q in TPL)for(let r=0;r<12;r++){
     let s=0,o=0;for(const iv of TPL[q])s+=seg[(r+iv)%12];
     for(let p=0;p<12;p++)if(!TPL[q].some(iv=>(r+iv)%12===p))o+=seg[p];
     const v=s/TPL[q].length-o*0.35;
     if(v>bv){bv=v;best=[r,q]}}
    let bp=0,bb=-1;for(let p=0;p<12;p++)if(bas[p]>bb){bb=bas[p];bp=p}
    chords.push([h*2,2,best[0],bp,best[1]]);
   }
   for(let bt=0;bt<bars*BAR;bt++){
    const a=Math.round(ph+bt*beatF),b=Math.min(F,Math.round(a+beatF));
    if(b-a<2)break;
    let bp=0,bv=-1;
    for(let p=0;p<12;p++){let s=0;for(let f=a;f<b;f++)s+=CH[f*12+p];if(s>bv){bv=s;bp=p}}
    // put it in the octave that actually carries the energy
    let oct=5,ov=-1;
    for(let o=4;o<7;o++){const hz=440*Math.pow(2,(bp+12*o-57)/12);if(hz>sr*0.45)continue;
     const g=goertzel(x,a*HOP,Math.min(N,b*HOP),hz,sr);if(g>ov){ov=g;oct=o}}
    const midi=bp+12*oct;
    if(mel.length&&mel[mel.length-1][2]===midi)mel[mel.length-1][1]+=1;
    else mel.push([bt,1,midi]);
   }
   const phr=[];for(let i=8;i<=bars;i+=8)phr.push(i*BAR);
   if(!phr.length)phr.push(bars*BAR);
   // energy arc, four quartiles, for the arranger
   const arc=[0,0,0,0];for(let f=0;f<F;f++)arc[Math.min(3,Math.floor(f*4/F))]+=EN[f];
   const am=Math.max(...arc)||1;
   post('analyse.complete',{bars,chords:chords.length,melody:mel.length,ms:Math.round(performance.now()-t0)});
   postMessage({type:'done',piece:{
     title:name.replace(/\.[^.]+$/,''),composer:'Your library',
     mode,bar:BAR,len:bars*BAR,mel,chords,phr,
     key,bpm:+bpm.toFixed(1),arc:arc.map(v=>+(v/am).toFixed(3)),mine:1}});
  }catch(e){postMessage({type:'error',message:e.message})}
 };
}

/* ---- ingest ------------------------------------------------------------- */
let AC=null,W=null,WU=null;
const ctx=()=>{if(AC)return AC;
  try{AC=new AudioContext({sampleRate:11025})}catch(e){AC=new AudioContext()}
  return AC};
/* Spleeter is trained at 44.1k, so separation needs its own context at that rate */
let AC44=null;
const ctx44=()=>{if(AC44)return AC44;
  try{AC44=new AudioContext({sampleRate:44100})}catch(e){AC44=new AudioContext()}
  return AC44};
const worker=()=>{if(W)return W;
  WU=URL.createObjectURL(new Blob(['('+kernel.toString()+')()'],{type:'text/javascript'}));
  W=new Worker(WU);URL.revokeObjectURL(WU);WU=null;return W};
const shut=()=>{if(W){W.terminate();W=null;log('worker released')}
  if(AC){AC.close().catch(()=>{});AC=null}
  if(AC44){AC44.close().catch(()=>{});AC44=null}
  if(window.STEMS)STEMS.release();};

const keyOf=f=>f.name+'|'+f.size;
const safe=k=>k.replace(/[^A-Za-z0-9._-]+/g,'_').slice(0,120);
let DIR=null;
async function dir(){if(DIR)return DIR;
 try{const root=await navigator.storage.getDirectory();DIR=await root.getDirectoryHandle('mine',{create:true})}
 catch(e){log('no private file system; audio will not be kept',e.message);DIR=false}
 return DIR}
async function keep(f,k){const d=await dir();if(!d)return null;
 const nm=safe(k)+'.'+(f.name.split('.').pop()||'bin').toLowerCase();
 try{const h=await d.getFileHandle(nm,{create:true}),w=await h.createWritable();
  await w.write(f);await w.close();return nm}
 catch(e){log('could not keep the audio for',f.name,e.message);return null}}

async function has(k){return !!(await tx('readonly',s=>s.get(k)))}

function analyse(mono,sr,name){
 const w=worker();
 return new Promise((res,rej)=>{
  const onmsg=({data:x})=>{
   if(x.type==='stage'){log(x.stage,x);return}
   w.removeEventListener('message',onmsg);
   x.type==='done'?res(x.piece):rej(new Error(x.message||'analysis failed'))};
  w.addEventListener('message',onmsg);
  w.postMessage({pcm:mono.buffer,sr,name},[mono.buffer])});
}

const MAXSEC=60;
let since=0;

/* Separate first, then read the harmony from the pitched stems alone. A full mix
   smears the chroma with cymbals and kick spill, which is what made every track
   come back minor; bass and other carry the actual chords. */
async function stemMono(f,onStage){
 const ab=await f.arrayBuffer();
 let buf;
 try{buf=await ctx44().decodeAudioData(ab)}catch(e){return null}
 let st=null;
 try{st=await window.STEMS.separate(buf,{maxSec:MAXSEC,onProgress:(p,m)=>onStage&&onStage(m,p)})}
 catch(e){log('separation failed for',f.name,e.message);return null}
 finally{buf=null}
 const L=st.length,m=Math.floor(L/4),mono=new Float32Array(m);
 const b0=st.bass[0],b1=st.bass[1],o0=st.other[0],o1=st.other[1];
 for(let i=0;i<m;i++){const j=i*4;
  mono[i]=((b0[j]+b1[j]+o0[j]+o1[j])+(b0[j+1]+b1[j+1]+o0[j+1]+o1[j+1])
          +(b0[j+2]+b1[j+2]+o0[j+2]+o1[j+2])+(b0[j+3]+b1[j+3]+o0[j+3]+o1[j+3]))*0.125}
 let pe=0,he=0;
 const d0=st.drums[0];
 for(let i=0;i<L;i+=7){pe+=d0[i]*d0[i];he+=(b0[i]+o0[i])*(b0[i]+o0[i])}
 return {mono,sr:st.sampleRate/4,drumShare:pe/Math.max(pe+he,1e-9)};
}

async function one(f,useStems,onStage){
 const k=keyOf(f);
 if(await has(k)){log('already analysed',f.name);return 'skip'}
 let ab,buf,mono=null,sr=0,extra=null;
 if(useStems&&window.STEMS){
  const r=await stemMono(f,onStage);
  if(r){mono=r.mono;sr=r.sr;extra={stems:1,drumShare:+r.drumShare.toFixed(3)};
   log('analysed from stems',f.name,'drums',Math.round(r.drumShare*100)+'%')}
 }
 if(!mono) try{
  ab=await f.arrayBuffer();
  try{buf=await ctx().decodeAudioData(ab)}
  catch(e){log('cannot decode',f.name,e.message);return 'fail'}
  ab=null;
  sr=buf.sampleRate;
  const n=Math.min(buf.length,Math.ceil(MAXSEC*sr)),chs=buf.numberOfChannels;
  mono=new Float32Array(n);
  for(let c=0;c<chs;c++){const d=buf.getChannelData(c);for(let i=0;i<n;i++)mono[i]+=d[i]/chs}
 }finally{ buf=null;ab=null }
 if(!mono||mono.length<sr)return 'fail';
 const piece=await analyse(mono,sr,f.name);
 mono=null;
 if(extra)Object.assign(piece,extra);
 piece.k=k;piece.added=Date.now();piece.bytes=f.size;
 piece.audio=await keep(f,k);piece.type=f.type||'';
 await tx('readwrite',s=>s.put(piece));
 // the decoder holds memory of its own; give it back every so often
 if(++since>=12){since=0;if(AC){try{await AC.close()}catch(e){}AC=null;log('decoder recycled')}}
 return 'ok';
}

const UL={
 /* the recording itself, read back on demand */
 async audio(piece){if(!piece||!piece.audio)return null;const d=await dir();if(!d)return null;
  try{return await (await d.getFileHandle(piece.audio)).getFile()}catch(e){log('audio missing for',piece.title);return null}},

 async ingest(files,onProgress,opts){
  const list=[...files].filter(f=>/\.(wav|mp3|m4a|aac|ogg|oga|flac|opus|webm|aif|aiff)$/i.test(f.name));
  log('ingest',list.length,'of',files.length,'files');
  let ok=0,skip=0,fail=0;
  for(let i=0;i<list.length;i++){
   const f=list[i];
   onProgress&&onProgress({i,n:list.length,name:f.name,ok,skip,fail});
   try{const r=await one(f,opts&&opts.stems,(m,p)=>
     onProgress&&onProgress({i,n:list.length,name:f.name,ok,skip,fail,stage:m,frac:p}));
    r==='ok'?ok++:r==='skip'?skip++:fail++}
   catch(e){fail++;log('failed',f.name,e.message)}
   await new Promise(r=>requestAnimationFrame(()=>r()));
  }
  shut();
  onProgress&&onProgress({i:list.length,n:list.length,ok,skip,fail,done:true});
  log('ingest complete',{ok,skip,fail});
  return {ok,skip,fail,total:list.length};
 },
 count(){return tx('readonly',s=>s.count())},
 keys(){return tx('readonly',s=>s.getAllKeys())},
 all(){return tx('readonly',s=>s.getAll())},
 async pick(r){
  const ks=await UL.keys();if(!ks.length)return null;
  const k=ks[Math.floor(r()*ks.length)%ks.length];
  return tx('readonly',s=>s.get(k));
 },
 async clear(){dbp=null;
  try{const d=await dir();if(d)for await (const nm of d.keys())await d.removeEntry(nm).catch(()=>{})}catch(e){}
  return new Promise(res=>{const q=indexedDB.deleteDatabase(DB);
   q.onsuccess=q.onerror=q.onblocked=()=>{log('library cleared');res()}})},
 shut
};
window.UL=UL;
UL.count().then(n=>{window.PBC_MINE_N=n;log('ready,',n,'pieces stored')}).catch(e=>log('store unavailable',e.message));
})();
