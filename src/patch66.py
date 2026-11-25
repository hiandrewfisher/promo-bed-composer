import io,sys,os
p=os.path.join(os.path.dirname(__file__),'..','index.html')
s=io.open(p,encoding='utf-8').read()
def need(a,l,n=1):
    if s.count(a)!=n: print('ANCHOR %s x%d (want %d)'%(l,s.count(a),n));sys.exit(1)

# Below the knee the bed is a new composition drawn from the whole library and
# no recording plays; above it, the piece whose recording will play supplies the
# score, and that recording rises to full by the time the slider is hard right.
a="async function pickAny(seed,avoid,faith,gk){\n if(window.PBC_MINE_N>0&&window.UL){const R0=rng((seed^0xA11CE5)>>>0);\n  {try{const pc=await UL.pick(R0);"
need(a,'pickAny')
s=s.replace(a,
"const MINE_KNEE=0.25;\n"
"async function pickAny(seed,avoid,faith,gk){\n"
" if(window.PBC_MINE_N>0&&window.UL){const R0=rng((seed^0xA11CE5)>>>0);\n"
"  {try{const fresh=(faith??.7)<MINE_KNEE;\n"
"   const pc=fresh?(await UL.compose(R0))||await UL.pick(R0):await UL.pick(R0);")

a2="   if(pc&&pc.mel&&pc.mel.length>3&&pc.chords&&pc.chords.length){pc._i='u:'+pc.k;\n"
need(a2,'pcuse')
s=s.replace(a2,
"   if(pc&&pc.mel&&pc.mel.length>3&&pc.chords&&pc.chords.length){pc._i='u:'+(pc.k||'blend');\n"
"    if(pc.blended)pc.noAudio=1;\n")

# the crossfade starts at the knee, so the two ends are clean and the middle is both
a3=" if(o.piece&&o.piece.audio&&F>0.02&&typeof UL!=='undefined'){\n  const mg=Math.sin(Math.min(1,F)*Math.PI/2);\n"
need(a3,'knee')
s=s.replace(a3,
" const KN=0.25,fp=Math.max(0,Math.min(1,(F-KN)/(1-KN)));\n"
" if(o.piece&&o.piece.audio&&!o.piece.noAudio&&fp>0&&typeof UL!=='undefined'){\n"
"  const mg=Math.sin(fp*Math.PI/2);\n")
a4="   if(b){o={...o,mineBuf:b,mineGain:mg,mineOnly:F>=.985,compGain:Math.cos(Math.min(1,F)*Math.PI/2)};\n"
need(a4,'mineset2')
s=s.replace(a4,
"   if(b){o={...o,mineBuf:b,mineGain:mg,mineOnly:F>=.985,compGain:Math.cos(fp*Math.PI/2)};\n")
io.open(p,'w',encoding='utf-8').write(s);print('patch66 ok')
