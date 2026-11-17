import io,sys
f='engine.js';s=io.open(f,encoding='utf-8').read()
def one(a):
    if s.count(a)!=1: print('ANCHOR x%d: %s'%(s.count(a),a[:72]));sys.exit(1)

# ---- A. buried, 65% of beds. the balancer could trim one part +20 dB and another -24,
#         a 44 dB spread; measured spreads were 18-34 dB. hold the whole spread to 13 dB,
#         keeping the balancer's ordering and intent but never letting a part vanish.
a=" for(const n of SN){const low=/^(bass|sub|drums)$/.test(n);out.g[n]=clamp(dl[n]-md,-24,low?2:20);before+=TOT[n];after+=TOT[n]*10**(out.g[n]/10)}"
one(a)
s=s.replace(a,
" for(const n of SN){const low=/^(bass|sub|drums)$/.test(n);out.g[n]=clamp(dl[n]-md,-16,low?2:14)}\n"
" {const gs=SN.map(n=>out.g[n]),spread=Math.max(...gs)-Math.min(...gs),CAP=13;\n"
"  if(spread>CAP){const k=CAP/spread;for(const n of SN)out.g[n]=+(out.g[n]*k).toFixed(2)}}\n"
" for(const n of SN){before+=TOT[n];after+=TOT[n]*10**(out.g[n]/10)}")

# ---- B. register collisions drove whiny (.29 vs .11), flat, sour and stiff. after the
#         voice-band pass, prise overlapping parts into their own octaves.
a2="   best.mean+=dir;if(!inBand(best))share-=best.n/tot}}\n"
one(a2)
s=s.replace(a2,a2+
" {const pr={};for(const e of ev){if(e.r.fx)continue;const q=pr[e.r.name]||(pr[e.r.name]={n:0,sum:0,r:e.r});q.n++;q.sum+=e.m}\n"
"  const ks=Object.keys(pr);for(const k of ks)pr[k].mean=pr[k].sum/pr[k].n;\n"
"  ks.sort((a,b)=>pr[a].mean-pr[b].mean);\n"
"  for(let i=1;i<ks.length;i++){const lo=pr[ks[i-1]],hi=pr[ks[i]];\n"
"   if(hi.mean-lo.mean>=5||hi.r.name=='lead'&&lo.r.name=='lead')continue;\n"
"   const mv=hi.r.name=='lead'?lo:hi,dir=mv===hi?12:-12;\n"
"   if(mv.moved2||/^(bass|sub)$/.test(mv.r.name)&&dir>0)continue;\n"
"   const ins=INS[mv.r.id];if(!ins)continue;\n"
"   if(mv.mean+dir<ins[4]+1||mv.mean+dir>ins[5]-1)continue;\n"
"   for(const e of ev)if(e.r.name===mv.r.name)e.m+=dir;\n"
"   mv.mean+=dir;mv.moved2=1;ks.sort((a,b)=>pr[a].mean-pr[b].mean);i=0}}\n")
a2b="  for(let guard=0;share>.45&&guard<3;guard++){"
one(a2b)
s=s.replace(a2b,"  for(let guard=0;share>.40&&guard<4;guard++){")

# ---- C. the human effects were gated behind note lengths most notes never reach,
#         which is why STIFF, NO SLIDES, NO FLOURISHES and NO DYNAMICS all fired.
a3="dmin=k=='guitar'||k=='harp'||k=='pluck'?1:.45;"
one(a3); s=s.replace(a3,"dmin=k=='guitar'||k=='harp'||k=='pluck'?.6:.3;")
a4="*(n.dur>.5?1:0);"
one(a4); s=s.replace(a4,"*(n.dur>.3?1:0);")
a5="if(n.dur>=.6&&!r.fx&&EX>0){"
one(a5); s=s.replace(a5,"if(n.dur>=.4&&!r.fx&&EX>0){")
a6="    if(e.d<1||e.B-lastLad<4||e.B<1)continue;"
one(a6); s=s.replace(a6,"    if(e.d<.75||e.B-lastLad<2.5||e.B<1)continue;")
a7="    if(!H.ch(.22))continue;"
one(a7); s=s.replace(a7,"    if(!H.ch(.45))continue;")
a8="&&e.d>=.5&&!e.sc){"
one(a8); s=s.replace(a8,"&&e.d>=.35&&!e.sc){")
io.open(f,'w',encoding='utf-8').write(s);print('v105 fixes ok')
