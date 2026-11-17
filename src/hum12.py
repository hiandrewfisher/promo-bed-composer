import io,sys
f='engine.js';s=io.open(f,encoding='utf-8').read()
def one(a):
    if s.count(a)!=1: print('ANCHOR x%d: %s'%(s.count(a),a[:70]));sys.exit(1)

# resume() on an OfflineAudioContext that has not begun rendering throws InvalidStateError.
# the hidden-panel flush runs before startRendering, so it must not resume anything.
a="const DUCKD={},VDK=[],PRES=[],CLEANUP=[];let PENDING=null;"
one(a); s=s.replace(a,"const DUCKD={},VDK=[],PRES=[],CLEANUP=[];let PENDING=null,STARTED=false;")

a2="  const wake=()=>{try{C.resume()}catch(e){}};"
one(a2)
s=s.replace(a2,"  const wake=()=>{if(!STARTED)return;try{const p=C.resume();if(p&&p.catch)p.catch(()=>{})}catch(e){}};")

a3=" if(PENDING)try{await PENDING}catch(e){}\n try{return await C.startRendering()}finally{"
one(a3)
s=s.replace(a3," if(PENDING)try{await PENDING}catch(e){}\n STARTED=true;\n try{return await C.startRendering()}finally{STARTED=false;")
a4="CLEANUP.length=0;PENDING=null}};"
one(a4); s=s.replace(a4,"CLEANUP.length=0;PENDING=null}};")
io.open(f,'w',encoding='utf-8').write(s);print('resume guard ok')
