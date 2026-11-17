import io,sys
f='engine.js';s=io.open(f,encoding='utf-8').read()
def one(a):
    if s.count(a)!=1: print('ANCHOR x%d: %s'%(s.count(a),a[:70]));sys.exit(1)

# #4 chord spread, per family: a horn section is not a piano roll is not a guitar strum
a=" const strum=(r,B,d,v,base,dir,spread)=>v.forEach((m,i)=>N(r,B,d,m,base*(dir>0?.92+.08*i/v.length:1-.06*i/v.length),{dt:(dir>0?i:v.length-1-i)*spread}));"
one(a)
s=s.replace(a,
" const SPREADK={brass:2.6,reed:2.6,pipe:2.4,ss:2.6,rd:2.6,tb:2.4,solo:2.4,bow:3.2,ens:3.0,"
"guitar:1.8,pluck:1.8,harp:1.5,piano:1.0,epiano:1.0,organ:.5,mallet:.9,synpad:1.2,saw:1.0,synlead:1.0,synbrass:1.4,synth:1.0,stac:.7};\n"
" const strum=(r,B,d,v,base,dir,spread)=>{const kf=SPREADK[r.kind]??1,sp=spread*kf;"
"v.forEach((m,i)=>N(r,B,d,m,base*(dir>0?.92+.08*i/v.length:1-.06*i/v.length),{dt:(dir>0?i:v.length-1-i)*sp+H.rg(-3,3)}))};")

# #6 pitch scoop beyond the winds: synth leads lip up, bowed strings slide into pitch
a2=" {const byRole={};for(const e of ev.filter(e=>SCOOPK.has(e.r.kind)&&(e.r.name=='lead'||e.r.name=='dbl')"
one(a2)
s=s.replace(a2,
" {const byR2={};for(const e of ev.filter(e=>['synlead','saw','synbrass','acid','bow','solo'].includes(e.r.kind)&&['lead','dbl','counter'].includes(e.r.name)&&!e.uni).sort((a,b)=>a.B-b.B)){\n"
"   const pe=byR2[e.r.name];if((!pe||e.B-(pe.B+pe.d)>=.5)&&e.d>=.5&&!e.sc){\n"
"    e.sc=['bow','solo'].includes(e.r.kind)?-H.rg(8,15):H.rg(20,50);e.slideT=.035+.02*R()}\n"
"   byR2[e.r.name]=e}}\n"+a2)

# #9 the sounds the instrument makes that are not the note: a felt damper falling back,
#    a finger leaving a wound string, the bow lifting off
a3="  if(sus&&stopAt-start>avail-.25){"
one(a3)
s=s.replace(a3,
"  if(full&&!r.fx&&v>.18&&{piano:1,epiano:1,guitar:1,pluck:1,harp:1,bow:1,stac:0}[k]){\n"
"   const rs=C.createBufferSource(),rb=C.createBiquadFilter(),rg2=C.createGain(),rt=Math.min(end,L-.08);\n"
"   if(rt>start+.05){rs.buffer=NZ;rb.type='bandpass';\n"
"    rb.frequency.value=k=='piano'||k=='epiano'?clamp(180+n.m*3,160,620):k=='bow'?2600:clamp(440*Math.pow(2,(n.m-69)/12)*4.5,1500,7000);\n"
"    rb.Q.value=k=='bow'?1.6:.9;rg2.gain.setValueAtTime(0,rt);\n"
"    const ra=(k=='piano'||k=='epiano'?.016:k=='bow'?.010:.013)*gn;\n"
"    rg2.gain.linearRampToValueAtTime(ra,rt+.006);rg2.gain.setTargetAtTime(0,rt+.008,k=='bow'?.045:.022);\n"
"    rs.connect(rb).connect(rg2).connect(pn);rs.start(rt,R()*1.2);rs.stop(rt+.3)}}\n"+a3)
io.open(f,'w',encoding='utf-8').write(s);print('spread/scoop/release-noise ok')
