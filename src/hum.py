import io,sys
p='engine.js';s=io.open(p,encoding='utf-8').read()
def one(a):
    if s.count(a)!=1: print('ANCHOR x%d: %s'%(s.count(a),a[:70]));sys.exit(1)

# 1. vibrato on nearly every kind (keyboards keep 0 pitch-vibrato: a piano cannot bend)
a="VD={bow:17,solo:17,ens:6,reed:14,pipe:10,brass:9,synlead:9,synbrass:7,guitar:7,harp:4,pluck:9,stac:0}[k]??0"
one(a)
s=s.replace(a,"VD={bow:17,solo:17,ens:6,reed:14,pipe:10,brass:9,synlead:9,synbrass:7,guitar:7,harp:4,pluck:9,pizz:3,mallet:3,pad:5,synpad:5,saw:4,synth:4,synthpluck:3,acid:3,ss:12,rd:12,tb:9,stac:0,piano:0,epiano:0,organ:0,synbass:0,b808:0}[k]??4")

# 2. amplitude tremolo, locked to the same LFO as the vibrato, for every kind that
#    has a player (or a motor) pulsing the volume
a2="const lpOn=k=='acid'||lp.frequency.value<18500||(sus&&n.dur>=.9&&lp.frequency.value*1.3<18500);let tail=lpOn?lp:g;"
one(a2)
s=s.replace(a2,
"const TD=(full&&!r.fx?{reed:.11,pipe:.10,brass:.075,solo:.07,bow:.055,ens:.05,ss:.10,rd:.10,tb:.08,mallet:.26,organ:.055,pad:.05,synpad:.05,saw:.04,synth:.04,epiano:.035,guitar:.03,harp:.03,pluck:.03,piano:0,stac:0,b808:0,synbass:0}[k]??.03:0)*((o.song||{}).expr??1)*(n.dur>.5?1:0);\n"
"  let tre=null;if(TD>0){tre=C.createGain();tre.gain.value=1;g.connect(tre)}const src0=tre||g;\n"
"  const lpOn=k=='acid'||lp.frequency.value<18500||(sus&&n.dur>=.9&&lp.frequency.value*1.3<18500);let tail=lpOn?lp:src0;")
a3="if(lpOn)g.connect(lp);tail.connect(pn).connect(sp.inp);"
one(a3)
s=s.replace(a3,"if(lpOn)src0.connect(lp);tail.connect(pn).connect(sp.inp);")

# the tremolo LFO: same 4.5-6.5Hz band, same delayed ramp-in as the vibrato,
# so volume and pitch pulse together the way a player's diaphragm does
a4="  let drf=null;if(full&&!r.fx&&/^syn|saw|acid|synthpluck|synth$/.test(k)){"
one(a4)
s=s.replace(a4,
"  if(tre){const on=(UXr.vibDelay??(.14+.22*R()))*(n.leg2?.5:1),rt=(k=='mallet'?6.9:k=='organ'?5.9:4.9+.9*R())*(k=='mallet'?1:1),\n"
"    dep=TD*(.65+.5*v)*(n.dur<.9?.6:1),to=C.createOscillator(),tg=C.createGain();\n"
"   to.frequency.setValueAtTime(rt*.86,start);to.frequency.linearRampToValueAtTime(rt,start+on+.7);\n"
"   tg.gain.setValueAtTime(0,start);tg.gain.setValueAtTime(0,start+Math.max(0,on));tg.gain.linearRampToValueAtTime(dep*.55,start+on+.28);tg.gain.linearRampToValueAtTime(dep,start+on+.75+.3*R());\n"
"   to.connect(tg).connect(tre.gain);to.start(start);to.stop(stopAt+.05)}\n"
"  let drf=null;if(full&&!r.fx&&/^syn|saw|acid|synthpluck|synth$/.test(k)){")

# 3. wow and flutter on the electromechanical keyboards and organs: a slow motor/tape
#    drift plus a fast shallow flutter, exactly as a Rhodes or a Mellotron does
a5="drf=DRF[r.name]}"
one(a5)
s=s.replace(a5,
"drf=DRF[r.name]}\n"
"  if(full&&!r.fx&&(k=='epiano'||k=='organ'||k=='mallet')){if(!DRF[r.name]){const o1=C.createOscillator(),o2=C.createOscillator(),gg=C.createGain(),g2=C.createGain();"
"o1.frequency.value=.32+.5*R();o2.frequency.value=5+2*R();gg.gain.value=k=='organ'?3.2:5.2;o1.connect(gg);g2.gain.value=.38;o2.connect(g2).connect(gg);o1.start(0);o2.start(0);DRF[r.name]=gg}drf=DRF[r.name]}")

io.open(p,'w',encoding='utf-8').write(s);print('engine humanization ok')
