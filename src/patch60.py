import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
def one(a,l):
    if s.count(a)!=1: print('ANCHOR %s x%d'%(l,s.count(a)));sys.exit(1)

# Reuse the DSP machinery instead of minting it per note.
# From the ledger, one bed built ~19,600 nodes: 6,200 gains, 4,400 biquads,
# 3,600 panners, 4,200 buffer sources, 1,230 oscillators. The oscillators and
# most of the panners are the same signal over and over.

# 1. one vibrato oscillator per part, not per note. Every note of a part shares a
#    player's single hand, which is what a real one has; the per-note depth
#    envelope still shapes each note separately.
a="const vo=C.createOscillator(),r0=(k=='bow'||k=='solo'||isErhu?5.4:k=='guitar'||k=='harp'?5:5.6)+.8*R();vo.frequency.setValueAtTime(r0-.7,start);vo.frequency.linearRampToValueAtTime(r0,start+on+.8);VIB[r.name].connect(vo.frequency);vo.connect(vib);vo.start(start);vo.stop(start+n.dur+1.6)}}"
one(a,'vib')
s=s.replace(a,
"let vo=VOSC[r.name];\n"
"   if(!vo){const r0=(k=='bow'||k=='solo'||isErhu?5.4:k=='guitar'||k=='harp'?5:5.6)+.8*R();\n"
"    vo=C.createOscillator();vo.frequency.value=r0;VIB[r.name].connect(vo.frequency);vo.start(0);VOSC[r.name]=vo}\n"
"   vo.connect(vib)}}")

# 2. one tremolo oscillator per part as well
a2="dep=TD*(.65+.5*v)*(n.dur<.9?.6:1),to=C.createOscillator(),tg=C.createGain();\n   to.frequency.setValueAtTime(rt*.86,start);to.frequency.linearRampToValueAtTime(rt,start+on+.7);\n"
one(a2,'trem')
s=s.replace(a2,
"dep=TD*(.65+.5*v)*(n.dur<.9?.6:1),tg=C.createGain();\n"
"   let to=TOSC[r.name];if(!to){to=C.createOscillator();to.frequency.value=rt;to.start(0);TOSC[r.name]=to}\n")
a3="   to.connect(tg).connect(tre.gain);to.start(start);to.stop(stopAt+.05)}"
one(a3,'tremconn')
s=s.replace(a3,"   to.connect(tg).connect(tre.gain)}")

# 3. the per-note panner only existed to add a few hundredths of jitter on parts
#    that are not spread; those notes go straight to the part's own strip, which
#    already carries its pan.
a4="const g=C.createGain(),pn=C.createStereoPanner();let lp=null,lpF=20000,lpQ=.5;"
one(a4,'mk')
s=s.replace(a4,"const g=C.createGain();const panOff=(n.pan||0)*(sp.st.sep??1)+(sp.st.spread||0)*(n.m-62)/40;\n"
 "  const pn=(Math.abs(panOff)>.02||Math.abs(sp.st.pan||0)>.02)?C.createStereoPanner():null;\n"
 "  let lp=null,lpF=20000,lpQ=.5;")
a5="pn.pan.value=clamp((sp.st.pan||0)+(n.pan||0)*(sp.st.sep??1)+(sp.st.spread||0)*(n.m-62)/40+H.g()*.03,-.9,.9);"
one(a5,'panset')
s=s.replace(a5,"if(pn)pn.pan.value=clamp((sp.st.pan||0)+panOff+H.g()*.03,-.9,.9);")
a6="if(lpOn)src0.connect(lp);tail.connect(pn).connect(sp.inp);"
one(a6,'wire')
s=s.replace(a6,"if(lpOn)src0.connect(lp);if(pn)tail.connect(pn).connect(sp.inp);else tail.connect(sp.inp);")
# the two places that fed the panner directly
s=s.replace("rs.connect(rb).connect(rg2).connect(pn);","rs.connect(rb).connect(rg2).connect(pn||sp.inp);")
s=s.replace("ns.connect(bp).connect(ng).connect(pn);","ns.connect(bp).connect(ng).connect(pn||sp.inp);")

a7="const DRF={};"
one(a7,'drf')
s=s.replace(a7,"const DRF={},VOSC={},TOSC={};")
io.open(p,'w',encoding='utf-8').write(s);print('patch60 ok')
