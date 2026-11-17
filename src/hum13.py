import io,sys
f='engine.js';s=io.open(f,encoding='utf-8').read()
def one(a):
    if s.count(a)!=1: print('ANCHOR x%d: %s'%(s.count(a),a[:72]));sys.exit(1)

# the song's own sections, from the bed length and the piece — not from where the read
# happens to stop. a listener should not be able to see the voice length in the waveform.
a=" const sect=B=>B<0?'intro':B<vEnd?'voice':B<bbB?'post':'button';"
one(a)
s=s.replace(a," const SECB=Math.max(4,Math.round(bbB*.62/4)*4);\n"
 " const sect=B=>B<0?'intro':B<SECB?'voice':B<bbB?'post':'button';")

# nothing in the arrangement leans on the read's envelope any more
a2="const st=sect(B);let v=base*I(B)*acc(B,x.acc)*(1+.04*H.g());if(st=='voice')v*=(r.name=='pad'?.85:r.name=='riff'?.8:.7)*(1-.18*vA(B));"
one(a2)
s=s.replace(a2,"const st=sect(B);let v=base*I(B)*acc(B,x.acc)*(1+.04*H.g());")

a3="vA(B)<.45&&vS(B"
if s.count(a3)==1:
    i=s.find(a3); j=s.find(')',s.find('vS(B',i))
    seg=s[i:j+1]
    s=s.replace(seg,'true')

# the gap filler fills musical rests, not gaps in the read
a4="  const quiet=B=>{try{return vA(B)<.3}catch(e){return true}};"
one(a4); s=s.replace(a4,"  const quiet=B=>true;")

# no voice-following on the effect returns either: the duck lives in the player
a5="for(const g of FXD)g.gain.setValueCurveAtTime(vact.map(x=>1-.5*x),0,L);"
one(a5); s=s.replace(a5,"for(const g of FXD)g.gain.value=1;")
a6="for(const[g,lv]of RET)g.gain.setValueCurveAtTime(cv2.map((x,i)=>lv*(1-.29*x)*(1-.38*vact[i])),0,L);"
one(a6); s=s.replace(a6,"for(const[g,lv]of RET)g.gain.setValueCurveAtTime(cv2.map(x=>lv*(1-.29*x)),0,L);")
io.open(f,'w',encoding='utf-8').write(s);print('voice-shaping removed')
