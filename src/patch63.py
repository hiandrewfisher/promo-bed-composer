import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
def one(a,l):
    if s.count(a)!=1: print('ANCHOR %s x%d'%(l,s.count(a)));sys.exit(1)

# a neutral path for your own recording: no carve, no character EQ, it is already mixed
a="const STRIP={"
one(a,'strip')
s=s.replace(a,"const STRIP={mine:{pan:0,spread:0,hpf:0,verb:{t:'room',s:.05},pre:0,eq:[]},",1)

# at the far "as written" end the bed is the recording. below that it fades under
# the composed arrangement, and under 80% it is composition only.
a2="async function render(o,onStep){DC=o.ctx;"
one(a2,'render')
s=s.replace(a2,
"const MINEBUF=new Map();\n"
"async function render(o,onStep){DC=o.ctx;")

a3="const c=compose(o);"
one(a3,'compose')
s=s.replace(a3,
"{const F=o.faith??.7;\n"
" if(o.piece&&o.piece.audio&&F>=.8&&typeof UL!=='undefined'){\n"
"  const mg=Math.min(1,Math.max(0,(F-.8)/.17));\n"
"  try{let b=MINEBUF.get(o.piece.audio);\n"
"   if(!b){onStep&&onStep('Reading your recording');const fl=await UL.audio(o.piece);\n"
"    if(fl){b=await DC.decodeAudioData(await fl.arrayBuffer());MINEBUF.set(o.piece.audio,b);\n"
"     while(MINEBUF.size>2)MINEBUF.delete(MINEBUF.keys().next().value)}}\n"
"   if(b){o={...o,mineBuf:b,mineGain:mg,mineOnly:F>=.97};\n"
"    console.log('[PromoMixer] your recording '+(o.mineOnly?'as written':'under the arrangement at '+Math.round(mg*100)+'%')+' — '+o.piece.title)}\n"
"  }catch(e){console.warn('[PromoMixer] could not use your recording',e)}}}\n"
"const c=compose(o);")

# the composed arrangement steps aside when the recording is playing as written
a4="if(o.ch){for(const n of c.notes){"
one(a4,'mute')
s=s.replace(a4,"if(o.mineOnly){for(const n of c.notes)n.skip=1;for(const h of c.hits)h.skip=1}\nif(o.ch){for(const n of c.notes){")

a5="const SN=[...new Set(c.notes.filter(n=>!n.skip&&SB[n.id]&&n.r.name!='mech').map(n=>n.r.name))]"
one(a5,'sn')
s=s.replace(a5,"const SN=[...new Set(c.notes.filter(n=>!n.skip&&SB[n.id]&&n.r.name!='mech').map(n=>n.r.name))];if(o.mineBuf)SN.push('mine')")

# one source, one strip, the same master chain, ending fade and voice ducking as
# anything else the engine mixes
a6=" {let hitsDone=0;try{hitsDone=mixHits(c.hits)}catch(e){console.error('[PromoMixer] drum mix',e)}"
one(a6,'sched')
s=s.replace(a6,
" if(o.mineBuf){const sp=strip('mine',{}),b=o.mineBuf,src=C.createBufferSource(),mg=C.createGain();\n"
"  src.buffer=b;\n"
"  // start where the track has settled, and loop if it is shorter than the bed\n"
"  const head=Math.min(Math.max(0,b.duration-L),b.duration>L+8?8:0);\n"
"  if(b.duration<L+.05){src.loop=true;src.loopStart=0;src.loopEnd=b.duration}\n"
"  const g0=(o.mineGain??1)*0.9;\n"
"  mg.gain.setValueAtTime(0,0);mg.gain.linearRampToValueAtTime(g0,.12);\n"
"  mg.gain.setValueAtTime(g0,Math.max(.2,L-1.2));mg.gain.linearRampToValueAtTime(0,L-.02);\n"
"  src.connect(mg).connect(sp.inp);src.start(0,head);src.stop(L);\n"
"  console.log('[PromoMixer] recording in at '+Math.round(g0*100)+'%, from '+head.toFixed(1)+'s of '+b.duration.toFixed(1)+'s');}\n"
+a6)
io.open(p,'w',encoding='utf-8').write(s);print('patch63 ok')
