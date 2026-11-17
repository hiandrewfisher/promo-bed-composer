import io,sys
f='engine.js';s=io.open(f,encoding='utf-8').read()
def one(a):
    if s.count(a)!=1: print('ANCHOR x%d: %s'%(s.count(a),a[:70]));sys.exit(1)

# drop the per-instrument, voice-triggered presence carve: one dip per song instead
a=("  if(full&&!/^(drums|perc|fx|mech|kick|snare|hat|cym|tom|sub|bass)$/.test(nb)){\n"
   "   const rl=(c.roles||{})[name]||(c.roles||{})[nb],wh=WHINE[rl&&rl.kind]??.4;\n"
   "   if(wh>0){st.eq=(st.eq||[]).concat([['p',3000,-1.6*wh,1.2]]);\n"
   "    PRES.push([f('peaking',2600,0,1.1),5.5*wh]);PRES.push([f('peaking',4200,0,1.4),3.2*wh])}}\n")
one(a); s=s.replace(a,'')
a2="for(const[fl,dp]of PRES)fl.gain.setValueCurveAtTime(vact.map(x=>-dp*x),0,L);"
one(a2); s=s.replace(a2,'')

# one mid dip for the whole song, placed from the read's own median pitch:
# a 110 Hz voice carves near 2 kHz, a 200 Hz voice nearer 3.6 kHz. depth stays the
# user's control; only the frequency is derived.
a3="['middip',1300,-(g.midDip??2)]"
one(a3)
s=s.replace(a3,"['middip',clamp(((o.A&&o.A.f0)||150)*18,1100,3800),-(g.midDip??2)]")
io.open(f,'w',encoding='utf-8').write(s);print('per-song mid dip ok')
