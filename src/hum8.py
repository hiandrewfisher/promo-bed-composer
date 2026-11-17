import io,sys
f='engine.js';s=io.open(f,encoding='utf-8').read()
def one(a):
    if s.count(a)!=1: print('ANCHOR x%d: %s'%(s.count(a),a[:70]));sys.exit(1)

# low interval limit: two voices close together down low is what turns into mud.
# a fifth is the minimum below C3, a major third below G3.
a="    if(e.m-cand<3||cand<reg[0]-2)continue;\n"
one(a)
s=s.replace(a,
"    const LIL=cand<48?7:cand<55?4:3;\n"
"    if(e.m-cand<LIL){let up=cand+12;if(up<e.m-3&&okScale(up))cand=up;else continue}\n"
"    if(cand<reg[0]-2)continue;\n")

# the harmony voice stands beside the lead, not on top of it; fillers sit wider and further back
a2="    add({...e,m:cand,v:e.v*.72,dt:(e.dt||0)+H.rg(-14,14),det:(e.det||0)+H.rg(-5,5),uni:9,sc:Math.round((e.sc||0)*.6)});"
one(a2)
s=s.replace(a2,"    add({...e,m:cand,v:e.v*.72,dt:(e.dt||0)+H.rg(-14,14),det:(e.det||0)+H.rg(-5,5),uni:9,"
 "pan:(e.pan||0)+(H.ch(.5)?.15:-.15),sc:Math.round((e.sc||0)*.6)});")
a3="dt:(host.dt||0)+H.rg(-10,10),fill:1})"
one(a3)
s=s.replace(a3,"dt:(host.dt||0)+H.rg(-10,10),pan:(host.pan||0)+(k%2?.34:-.34),fill:1})")

# a room absorbs the top over distance: anything placed behind the lead loses its air
a4="lp.Q.value=.5;"
one(a4)
s=s.replace(a4,"lp.Q.value=.5;if(n.fill)lp.frequency.value=Math.min(lp.frequency.value,12500);else if(n.uni==9)lp.frequency.value=Math.min(lp.frequency.value,14500);")

# release noise was sitting in the ear-fatigue band: bow lift down to 2 kHz, string squeak capped
a5="rb.frequency.value=k=='piano'||k=='epiano'?clamp(180+n.m*3,160,620):k=='bow'?2600:clamp(440*Math.pow(2,(n.m-69)/12)*4.5,1500,7000);"
one(a5)
s=s.replace(a5,"rb.frequency.value=k=='piano'||k=='epiano'?clamp(180+n.m*3,160,620):k=='bow'?2000:clamp(440*Math.pow(2,(n.m-69)/12)*4.5,1500,5600);")
a6="    rb.Q.value=k=='bow'?1.6:.9;"
one(a6)
s=s.replace(a6,"    rb.Q.value=k=='bow'?.8:.9;")
io.open(f,'w',encoding='utf-8').write(s);print('mix fixes ok')
