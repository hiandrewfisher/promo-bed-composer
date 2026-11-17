import io,sys
def one(s,a,f):
    if s.count(a)!=1: print('ANCHOR x%d in %s: %s'%(s.count(a),f,a[:60]));sys.exit(1)

# ---- revert the tempo penalty: that was the wrong lesson from the clash ratings
f='composer.js';s=io.open(f,encoding='utf-8').read()
a="-Math.abs(ring-2.4)*.45+R()*.5-((b>=112&&b<=126)?.55:0)-(b>138?.45+(b-138)*.012:0);"
one(s,a,f)
s=s.replace(a,"-Math.abs(ring-2.4)*.45+R()*.5;")
io.open(f,'w',encoding='utf-8').write(s)

f='engine.js';s=io.open(f,encoding='utf-8').read()

# ---- how piercing each instrument family is in the 2-5 kHz consonant band.
#      this is timbre, not pitch: a bright lead is a mosquito on any note it plays.
a="const CARVE={pad:"
one(s,a,f)
s=s.replace(a,
"const WHINE={organ:1,bell:1,synbrass:.95,synlead:.95,saw:.9,acid:.9,pipe:.85,reed:.8,brass:.78,solo:.72,mallet:.7,ss:.8,rd:.8,tb:.7,ens:.55,bow:.55,synpad:.5,synth:.5,synthpluck:.5,pad:.45,harp:.42,pluck:.38,guitar:.32,piano:.26,epiano:.26,pizz:.4,stac:.5,synbass:.1,b808:.1};\n"
"const CARVE={pad:")

# ---- a presence-band carve that follows the read. a peaking filter at 2.6 kHz on every
#      musical part, pulled down while the voice is speaking and released when it stops,
#      with the depth set by how piercing that instrument is.
a2="const DUCKD={},VDK=[];"
one(s,a2,f)
s=s.replace(a2,"const DUCKD={},VDK=[],PRES=[];")

a3="  if(['pad','pad2','keys','pulse'].includes(name)){DIPS.push(f('peaking',250,0,1))}\n"
one(s,a3,f)
s=s.replace(a3,a3+
"  if(full&&!/^(drums|perc|fx|mech|kick|snare|hat|cym|tom|sub|bass)$/.test(nb)){\n"
"   const rl=(c.roles||{})[name]||(c.roles||{})[nb],wh=WHINE[rl&&rl.kind]??.4;\n"
"   if(wh>0){st.eq=(st.eq||[]).concat([['p',3000,-1.6*wh,1.2]]);\n"
"    PRES.push([f('peaking',2600,0,1.1),5.5*wh]);PRES.push([f('peaking',4200,0,1.4),3.2*wh])}}\n")

a4="for(const[g,d]of VDK)g.gain.setValueCurveAtTime(vact.map(x=>1-d*x),0,L);"
one(s,a4,f)
s=s.replace(a4,a4+"for(const[fl,dp]of PRES)fl.gain.setValueCurveAtTime(vact.map(x=>-dp*x),0,L);")

io.open(f,'w',encoding='utf-8').write(s)
print('presence carve ok')
