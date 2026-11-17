import io,sys
def one(s,a,f):
    if s.count(a)!=1: print('ANCHOR x%d in %s: %s'%(s.count(a),f,a[:60]));sys.exit(1)

# ---- 1. harmonic rhythm: 8 chords/bar rated 2.60 and was flagged "aimless" on 5 of 5 beds
for f in ('composer.js','engine.js'):
    s=io.open(f,encoding='utf-8').read()
    a="const cpb=bpm>108&&H.ch(.4)?8:4;"
    one(s,a,f)
    s=s.replace(a,"const cpb=4;")
    io.open(f,'w',encoding='utf-8').write(s)

# ---- 2. tempo: the rated dead zones (112-125 and 140+) get a scoring penalty,
#         inside each genre's own range so no genre is overridden
f='composer.js';s=io.open(f,encoding='utf-8').read()
a="-Math.abs(ring-2.4)*.45+R()*.5;"
one(s,a,f)
s=s.replace(a,"-Math.abs(ring-2.4)*.45+R()*.5-((b>=112&&b<=126)?.55:0)-(b>138?.45+(b-138)*.012:0);")
io.open(f,'w',encoding='utf-8').write(s)

# ---- 3. keep the arrangement out of the read's band.
#         measured: 0% "fights the read" below .40 band share, 80% above .70
f='engine.js';s=io.open(f,encoding='utf-8').read()
a=" for(let i=ev.length-1;i>=0;i--)if(ev[i].drop)ev.splice(i,1);\n"
one(s,a,f)
s=s.replace(a,a+
" // the read lives in C3-C5. when most of the arrangement crowds that band it fights the\n"
" // voice however well it is mixed, so lift the worst offender clear of it.\n"
" {const byR={};for(const e of ev){if(e.r.fx)continue;const q=byR[e.r.name]||(byR[e.r.name]={n:0,sum:0,r:e.r});q.n++;q.sum+=e.m}\n"
"  const tot=ev.length||1;const inBand=q=>q.mean>=48&&q.mean<=72;\n"
"  for(const k in byR)byR[k].mean=byR[k].sum/byR[k].n;\n"
"  let share=0;for(const k in byR)if(inBand(byR[k]))share+=byR[k].n/tot;\n"
"  for(let guard=0;share>.45&&guard<3;guard++){\n"
"   let best=null;for(const k in byR){const q=byR[k];if(q.moved||q.r.name=='lead'||!inBand(q))continue;if(!best||q.n>best.n)best=q}\n"
"   if(!best)break;best.moved=1;\n"
"   const ins=INS[best.r.id],lo=ins?ins[4]:0,hi=ins?ins[5]:127,sp=best.r.reg||[lo,hi];\n"
"   let dir=0;\n"
"   if(/^(bass|sub)/.test(best.r.name)){if(best.mean-12>=Math.max(lo,sp[0]-12))dir=-12}\n"
"   else if(best.mean+12<=Math.min(hi,(sp[1]||hi)+12))dir=12;\n"
"   else if(best.mean-12>=Math.max(lo,(sp[0]||lo)-12))dir=-12;\n"
"   if(!dir)continue;\n"
"   for(const e of ev)if(e.r.name===best.r.name)e.m+=dir;\n"
"   best.mean+=dir;if(!inBand(best))share-=best.n/tot}}\n")
io.open(f,'w',encoding='utf-8').write(s)
print('rating-driven fixes ok')
