/* stems.js — Spleeter 4-stem separation, entirely in the browser.
   Model: Deezer Spleeter 4stems (MIT), TF checkpoint converted to ONNX fp32.
   Runtime: onnxruntime-web 1.20.1 (MIT), WASM backend, vendored in models/.
   No network calls beyond this origin. No audio leaves the machine. */
(function(){
'use strict';
const W=4096, H=1024, F=1024, T=512, HB=W/2+1;
const NAMES=['vocals','drums','bass','other'];

/* ---- periodic hann + window-sum (exact, not assumed COLA) ---- */
const win=new Float32Array(W);
for(let i=0;i<W;i++) win[i]=0.5-0.5*Math.cos(2*Math.PI*i/W);

/* ---- iterative radix-2 complex FFT, size 4096 ---- */
const LG=Math.log2(W)|0;
const REV=new Uint16Array(W);
for(let i=0;i<W;i++){let r=0;for(let b=0;b<LG;b++) if(i>>b&1) r|=1<<(LG-1-b); REV[i]=r}
const CS=new Float32Array(W/2), SN=new Float32Array(W/2);
for(let i=0;i<W/2;i++){CS[i]=Math.cos(-2*Math.PI*i/W);SN[i]=Math.sin(-2*Math.PI*i/W)}
function fft(re,im,inv){
 for(let i=0;i<W;i++){const j=REV[i];if(j>i){let t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}
 for(let len=2;len<=W;len<<=1){
  const half=len>>1, step=W/len;
  for(let i=0;i<W;i+=len){
   for(let k=0;k<half;k++){
    const t=k*step, c=CS[t], s=inv?-SN[t]:SN[t];
    const a=i+k, b=a+half;
    const xr=re[b]*c-im[b]*s, xi=re[b]*s+im[b]*c;
    re[b]=re[a]-xr; im[b]=im[a]-xi; re[a]+=xr; im[a]+=xi;
   }}}
 if(inv){const n=1/W;for(let i=0;i<W;i++){re[i]*=n;im[i]*=n}}
}

/* ---- model loading: chunked fp32 ONNX, cached in OPFS ---- */
let SES=null, LOADING=null;
const PARTS=4;
/* The model is 157 MB, which fits the site but not an artifact already carrying
   the sample library. So look for it next to the page first, and otherwise on
   the published site, which serves these files with CORS. Either way the audio
   stays here: the only thing crossing the network is the model, downloading. */
/* A published artifact runs under a Content Security Policy whose connect-src
   is its own frame only, so fetching the model from anywhere else is refused
   before it leaves the page. Only reach for the published site when this page
   was told to, or is already being served from it: everywhere else the model
   has to sit beside the page or the feature stays off. */
const HOME=window.PBC_MODELS?window.PBC_MODELS+'models/'
 :(/(^|\.)github\.io$/.test(location.hostname)?'https://hiandrewfisher.github.io/promo-bed-composer/models/':null);
let BASE=null;
async function findBase(){
 if(BASE)return BASE;
 const tries=[new URL('models/',document.baseURI).href, HOME].filter(Boolean);
 for(const b of tries){
  try{const r=await fetch(b+'4stems.onnx.part0',{method:'HEAD',mode:'cors'});
   if(r.ok){BASE=b;console.log('[stems] model at '+b);return b}}catch(e){}
 }
 return null;
}
async function cached(){
 try{
  const d=await navigator.storage.getDirectory();
  const m=await d.getDirectoryHandle('models',{create:true});
  try{const f=await m.getFileHandle('4stems.onnx');const fl=await f.getFile();
      if(fl.size>157000000) return new Uint8Array(await fl.arrayBuffer())}catch(e){}
  return {dir:m};
 }catch(e){return null}
}
async function bytes(onProgress){
 const c=await cached();
 if(c instanceof Uint8Array){onProgress&&onProgress(1,'from cache');return c}
 const base=await findBase(); if(!base)throw new Error('the separation model is not reachable');
 const bufs=[]; let got=0, total=157441415;
 for(let i=0;i<PARTS;i++){
  const r=await fetch(base+'4stems.onnx.part'+i,{mode:'cors'});
  if(!r.ok) throw new Error('model part '+i+' missing ('+r.status+')');
  const b=new Uint8Array(await r.arrayBuffer());
  bufs.push(b); got+=b.length; onProgress&&onProgress(got/total,'downloading');
 }
 const all=new Uint8Array(got); let o=0; for(const b of bufs){all.set(b,o);o+=b.length}
 bufs.length=0;
 if(c&&c.dir){try{const h=await c.dir.getFileHandle('4stems.onnx',{create:true});
   const w=await h.createWritable();await w.write(all);await w.close()}catch(e){}}
 return all;
}
async function session(onProgress){
 if(SES) return SES;
 if(LOADING) return LOADING;
 LOADING=(async()=>{
  const base=await findBase();
  if(!base)throw new Error('the separation model is not reachable');
  if(!window.ort){await new Promise((res,rej)=>{const s=document.createElement('script');
    s.src=base+'ort.wasm.min.js';s.crossOrigin='anonymous';
    s.onload=res;s.onerror=()=>rej(new Error('onnxruntime-web failed to load'));
    document.head.appendChild(s)})}
  ort.env.wasm.wasmPaths=base; ort.env.wasm.numThreads=1; ort.env.logLevel='error';
  const b=await bytes(onProgress);
  onProgress&&onProgress(1,'starting model');
  SES=await ort.InferenceSession.create(b,{executionProviders:['wasm'],graphOptimizationLevel:'all'});
  LOADING=null; return SES;
 })();
 return LOADING;
}

/* ---- separation ----
   Streams segment by segment so peak memory is one 512-frame spectrogram
   (8 MB) plus the output stems, never the whole track's complex STFT. */
async function separate(buf,opt){
 opt=opt||{};
 const onProgress=opt.onProgress, maxSec=opt.maxSec||60;
 const ses=await session(onProgress);
 const sr=buf.sampleRate, L=Math.min(buf.length,Math.ceil(maxSec*sr));
 const ch=[buf.getChannelData(0), buf.numberOfChannels>1?buf.getChannelData(1):buf.getChannelData(0)];
 const nF=Math.max(1,1+Math.floor((L-W)/H));
 const segs=Math.ceil(nF/T);
 const out=NAMES.map(()=>[new Float32Array(L),new Float32Array(L)]);
 const wsum=new Float32Array(L);
 const re=new Float32Array(W), im=new Float32Array(W);
 const mag=new Float32Array(T*F*2);
 // full half-spectrum kept so the band above the model's 1024 bins is not thrown away
 const SR=new Float32Array(T*HB*2), SI=new Float32Array(T*HB*2);
 const ext=new Float32Array(T*2*4); // per frame/channel/stem mask for the unmodelled band
 for(let s=0;s<segs;s++){
  const f0=s*T, fn=Math.min(T,nF-f0);
  mag.fill(0); SR.fill(0); SI.fill(0);
  for(let f=0;f<fn;f++){
   const off=(f0+f)*H;
   for(let c=0;c<2;c++){
    const d=ch[c];
    for(let i=0;i<W;i++){const j=off+i; re[i]=(j<L?d[j]:0)*win[i]; im[i]=0}
    fft(re,im,false);
    const hb=(f*HB)*2+c, mb=(f*F)*2+c;
    for(let k=0;k<HB;k++){const p=hb+k*2; SR[p]=re[k]; SI[p]=im[k]}
    for(let k=0;k<F;k++) mag[mb+k*2]=Math.sqrt(re[k]*re[k]+im[k]*im[k]);
   }}
  const r=await ses.run({[ses.inputNames[0]]:new ort.Tensor('float32',mag,[1,T,F,2])});
  const masks=ses.outputNames.map(n=>r[n].data);
  // Spleeter models only the lowest 1024 bins. Extend each stem's mask over the
  // remaining band using its mean across the top modelled bins: the four masks
  // sum to 1 pointwise, so their means do too and the band is conserved, landing
  // mostly in drums and other, where cymbals and air belong.
  for(let f=0;f<fn;f++) for(let c=0;c<2;c++){
   const mb=(f*F)*2+c;
   for(let st=0;st<4;st++){const m=masks[st];let a=0;
    for(let k=F-32;k<F;k++) a+=m[mb+k*2];
    ext[((f*2+c)*4)+st]=a/32}}
  for(let st=0;st<4;st++){
   const m=masks[st], o0=out[st][0], o1=out[st][1];
   for(let f=0;f<fn;f++){
    const off=(f0+f)*H;
    for(let c=0;c<2;c++){
     const mb=(f*F)*2+c, hb=(f*HB)*2+c, xm=ext[((f*2+c)*4)+st];
     re.fill(0); im.fill(0);
     for(let k=0;k<HB;k++){
       const g=k<F?m[mb+k*2]:xm, p=hb+k*2;
       const gr=SR[p]*g, gi=SI[p]*g;
       re[k]=gr; im[k]=gi;
       if(k>0&&k<W-k){re[W-k]=gr; im[W-k]=-gi}}
     fft(re,im,true);
     const dst=c?o1:o0;
     for(let i=0;i<W;i++){const j=off+i; if(j<L) dst[j]+=re[i]*win[i]}
    }}}
  if(s===0){for(let f=0;f<nF;f++){const off=f*H;
    for(let i=0;i<W;i++){const j=off+i; if(j<L) wsum[j]+=win[i]*win[i]}}}
  onProgress&&onProgress((s+1)/segs,'separating');
 }
 for(let j=0;j<L;j++){const w=wsum[j]>1e-6?1/wsum[j]:0;
  for(let st=0;st<4;st++){out[st][0][j]*=w; out[st][1][j]*=w}}
 const res={};
 NAMES.forEach((n,i)=>{res[n]=out[i]});
 res.sampleRate=sr; res.length=L;
 return res;
}

async function available(){return !!(await findBase())}
function release(){if(SES){try{SES.release()}catch(e){}SES=null}}

window.STEMS={separate,available,release,names:NAMES};
})();
