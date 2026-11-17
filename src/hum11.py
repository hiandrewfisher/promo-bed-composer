import io,sys
f='engine.js';s=io.open(f,encoding='utf-8').read()
def one(a):
    if s.count(a)!=1: print('ANCHOR x%d: %s'%(s.count(a),a[:70]));sys.exit(1)

a = """  let flushed=false,onHide=null,wd=null;
  const wake=()=>{try{C.resume()}catch(e){}};
  const flushAll=why=>{if(flushed)return;flushed=true;
   if(onHide){try{document.removeEventListener('visibilitychange',onHide)}catch(e){}onHide=null}
   if(wd){clearTimeout(wd);wd=null}
   try{sched(Infinity)}catch(e){console.error('[PromoMixer] flush',e)}
   if(why)try{console.log('[PromoMixer] scheduling the rest of the bed up front ('+why+')')}catch(e){}
   wake()};
  const hidden=typeof document!=='undefined'&&document.hidden;
  if(hidden)flushAll('panel hidden');
  else{
   onHide=()=>{if(document.hidden)flushAll('panel hidden mid-render')};
   try{document.addEventListener('visibilitychange',onHide)}catch(e){}
   for(let w=1;w<L-.2;w++){const at=Math.round((w-.05)*SR/128)*128/SR;
    C.suspend(at).then(()=>{if(flushed){wake();return}sched(w+1.1);wake()},()=>{flushAll('suspend rejected')})}
   wd=setTimeout(()=>flushAll('render stalled'),Math.max(10000,L*800));
  }
"""
one(a)
NEW = """  let flushed=false,flushDone=false,onHide=null,wd=null;
  const wake=()=>{try{C.resume()}catch(e){}};
  // the flush is sliced into 10 ms pieces with a yield between them, so it can never
  // become one long task. the context stays suspended across the yields, so the render
  // head does not advance and every note still lands on its own time.
  const slice=()=>{const t0=(performance&&performance.now)?performance.now():Date.now();
   while(qi<Qn.length){const[,k,x]=Qn[qi++];try{k?playH(x):playN(x)}catch(e){console.error('[PromoMixer] note',e)}
    if((((performance&&performance.now)?performance.now():Date.now())-t0)>10)return false}
   return true};
  const flushAll=why=>{if(flushed)return PENDING;flushed=true;
   if(onHide){try{document.removeEventListener('visibilitychange',onHide)}catch(e){}onHide=null}
   if(wd){clearTimeout(wd);wd=null}
   if(why)try{console.log('[PromoMixer] scheduling the rest of this bed in slices ('+why+')')}catch(e){}
   PENDING=(async()=>{let n=0;
     while(!slice()){n++;await yieldTask();if(n>20000)break}
     flushDone=true;wake()})();
   return PENDING};
  const hidden=typeof document!=='undefined'&&document.hidden;
  if(hidden)flushAll('panel hidden');
  else{
   onHide=()=>{if(document.hidden)flushAll('panel hidden mid-render')};
   try{document.addEventListener('visibilitychange',onHide)}catch(e){}
   for(let w=1;w<L-.2;w++){const at=Math.round((w-.05)*SR/128)*128/SR;
    C.suspend(at).then(()=>{if(flushed){if(flushDone)wake();return}sched(w+1.1);wake()},()=>{flushAll('suspend rejected')})}
   wd=setTimeout(()=>flushAll('render stalled'),Math.max(20000,L*1600));
  }
"""
s=s.replace(a,NEW)

# a yield that a background tab cannot clamp, and the per-render flush promise
a2="const DUCKD={},VDK=[],PRES=[],CLEANUP=[];"
one(a2)
s=s.replace(a2,"const DUCKD={},VDK=[],PRES=[],CLEANUP=[];let PENDING=null;\n"
 " const yieldTask=()=>new Promise(r=>{try{if(typeof scheduler!=='undefined'&&scheduler.postTask){scheduler.postTask(r,{priority:'user-visible'});return}"
 "const mc=new MessageChannel();mc.port1.onmessage=()=>r();mc.port2.postMessage(0)}catch(e){setTimeout(r,0)}});")

# do not start rendering until an up-front flush has finished laying the notes down
a3=" try{return await C.startRendering()}finally{"
one(a3)
s=s.replace(a3," if(PENDING)try{await PENDING}catch(e){}\n try{return await C.startRendering()}finally{")
a4="for(const fn of CLEANUP)try{fn()}catch(e){}CLEANUP.length=0}};"
one(a4)
s=s.replace(a4,"for(const fn of CLEANUP)try{fn()}catch(e){}CLEANUP.length=0;PENDING=null}};")
io.open(f,'w',encoding='utf-8').write(s);print('sliced flush ok')
