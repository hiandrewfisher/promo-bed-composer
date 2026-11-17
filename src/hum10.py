import io,sys
f='engine.js';s=io.open(f,encoding='utf-8').read()
def one(a):
    if s.count(a)!=1: print('ANCHOR x%d: %s'%(s.count(a),a[:70]));sys.exit(1)

a=" {const Qn=[...c.notes.map(n=>[n.t,0,n]),...c.hits.map(h=>[h.t,1,h])].sort((a,b)=>a[0]-b[0]);let qi=0;const sched=u=>{while(qi<Qn.length&&Qn[qi][0]<u){const[,k,x]=Qn[qi++];k?playH(x):playN(x)}};sched(1.1);\n  for(let w=1;w<L-.2;w++){const at=Math.round((w-.05)*SR/128)*128/SR;C.suspend(at).then(()=>{sched(w+1.1);C.resume()})}}"
one(a)
s=s.replace(a,
" // just-in-time scheduling needs a main-thread callback for every second of audio. a\n"
" // hidden or throttled tab stops delivering those, and the render then hangs for ever\n"
" // with no error. so: schedule everything up front when hidden, bail out of the\n"
" // just-in-time path the moment we are hidden, and keep a watchdog behind both.\n"
" {const Qn=[...c.notes.map(n=>[n.t,0,n]),...c.hits.map(h=>[h.t,1,h])].sort((a,b)=>a[0]-b[0]);let qi=0;\n"
"  const sched=u=>{while(qi<Qn.length&&Qn[qi][0]<u){const[,k,x]=Qn[qi++];k?playH(x):playN(x)}};sched(1.1);\n"
"  let flushed=false,onHide=null,wd=null;\n"
"  const wake=()=>{try{C.resume()}catch(e){}};\n"
"  const flushAll=why=>{if(flushed)return;flushed=true;\n"
"   if(onHide){try{document.removeEventListener('visibilitychange',onHide)}catch(e){}onHide=null}\n"
"   if(wd){clearTimeout(wd);wd=null}\n"
"   try{sched(Infinity)}catch(e){console.error('[PromoMixer] flush',e)}\n"
"   if(why)try{console.log('[PromoMixer] scheduling the rest of the bed up front ('+why+')')}catch(e){}\n"
"   wake()};\n"
"  const hidden=typeof document!=='undefined'&&document.hidden;\n"
"  if(hidden)flushAll('panel hidden');\n"
"  else{\n"
"   onHide=()=>{if(document.hidden)flushAll('panel hidden mid-render')};\n"
"   try{document.addEventListener('visibilitychange',onHide)}catch(e){}\n"
"   for(let w=1;w<L-.2;w++){const at=Math.round((w-.05)*SR/128)*128/SR;\n"
"    C.suspend(at).then(()=>{if(flushed){wake();return}sched(w+1.1);wake()},()=>{flushAll('suspend rejected')})}\n"
"   wd=setTimeout(()=>flushAll('render stalled'),Math.max(10000,L*800));\n"
"  }\n"
"  CLEANUP.push(()=>{if(onHide){try{document.removeEventListener('visibilitychange',onHide)}catch(e){}onHide=null}if(wd){clearTimeout(wd);wd=null}});\n"
" }")

a2=" return await C.startRendering()};"
one(a2)
s=s.replace(a2," try{return await C.startRendering()}finally{for(const fn of CLEANUP)try{fn()}catch(e){}CLEANUP.length=0}};")

# CLEANUP lives with the other per-render arrays
a3="const DUCKD={},VDK=[],PRES=[];"
one(a3)
s=s.replace(a3,"const DUCKD={},VDK=[],PRES=[],CLEANUP=[];")
io.open(f,'w',encoding='utf-8').write(s);print('stall fix ok')
