import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
def one(a,l):
    if s.count(a)!=1: print('ANCHOR %s x%d'%(l,s.count(a)));sys.exit(1)

# Percussion as data through one shared mixer instead of a node chain per hit.
# Every hit used to build a BufferSource, a Gain, a BiquadFilter and a
# StereoPanner — about 1,300 nodes a bed for the kit alone. The arithmetic a hit
# needs is exact and cheap in PCM: resample, scale, one RBJ lowpass, constant
# pan. Each drum group is mixed into a single stereo buffer and played through
# the group's existing strip, so the kit sounds the same and costs ONE node.
a="const dbus=strip('drums',mixOf('drums'));const playH=h=>{"
one(a,'playH')
NEW = """const dbus=strip('drums',mixOf('drums'));
 const HMIX={};
 const hitParams=h=>{const b=HB[h.hid];if(!b)return null;
  const grp=GROUP[h.n]||'perc';let kr=1;
  if(h.hid.startsWith('tr808/k')){let best=0,bd=99;
   for(const tg of[c.key,(c.key+7)%12])for(let d=-4;d<=4;d++)if(mod(31+d,12)==tg&&Math.abs(d-.22)<bd){bd=Math.abs(d-.22);best=d}
   kr=2**((best-.22+TUNE/100)/12)}
  let st0=Math.max(0,h.t),off=0;
  if(grp=='fx'){kr=1;if(h.fitT)kr=clamp(b.duration/h.fitT,.8,1.35);
   if(h.n=='drop')kr*=2**((mod(c.key+6,12)-6)/12);
   if(h.align=='end'){st0=h.t-b.duration/kr;if(st0<0){off=-st0*kr;st0=0}}}
  const sp=grp=='fx'?strip('fx',mixOf('fx')):strip(grp,mixOf(grp),dbus.inp);
  return {b,grp,sp,rate:kr*(1+H.g()*.008),st0,off,
   gain:Math.pow(clamp(h.v,0,1),1.5)*(grp=='kick'?1:grp=='cym'?.6:grp=='hat'?.55:.85),
   cut:clamp(2500+16000*h.v,2000,19000),
   pan:clamp((DPAN[h.n]??sp.st.pan??0)+(sp.st.spread?H.g()*.1:0),-.8,.8),
   stop:Math.min(L,grp=='fx'?st0+(b.duration-off)/kr+.05:h.t+(grp=='cym'?5:2.2))}};
 // one RBJ lowpass, the same shape BiquadFilterNode uses, held as four numbers
 const lpCoef=(f,sr)=>{const w=2*Math.PI*Math.min(f,sr*.49)/sr,cs=Math.cos(w),al=Math.sin(w)/(2*0.7071),
   b0=(1-cs)/2,b1=1-cs,b2=b0,a0=1+al,a1=-2*cs,a2=1-al;
   return [b0/a0,b1/a0,b2/a0,a1/a0,a2/a0]};
 const mixHits=hits=>{
  const by={};
  for(const h of hits){if(h.skip)continue;const q=hitParams(h);if(!q||q.st0>=L)continue;
   (by[q.grp]=by[q.grp]||{sp:q.sp,list:[]}).list.push(q)}
  let voices=0;
  for(const grp in by){
   const {sp,list}=by[grp],N=Math.ceil(L*SR)+1,
     Lch=new Float32Array(N),Rch=new Float32Array(N);
   for(const q of list){
    const src=q.b.getChannelData(0),src2=q.b.numberOfChannels>1?q.b.getChannelData(1):src,
      n0=Math.round(q.st0*SR),end=Math.min(N,Math.round(q.stop*SR)),
      step=q.rate*q.b.sampleRate/SR,
      [c0,c1,c2,d1,d2]=lpCoef(q.cut,SR),
      gl=q.gain*Math.sqrt((1-q.pan)*.5)*1.4142,gr=q.gain*Math.sqrt((1+q.pan)*.5)*1.4142;
    let pos=q.off*q.b.sampleRate,x1=0,x2=0,y1=0,y2=0,z1=0,z2=0,w1=0,w2=0;
    for(let i=n0;i<end;i++){
     const k=pos|0;if(k>=src.length-1)break;
     const fr=pos-k;
     let a=src[k]+(src[k+1]-src[k])*fr, b=src2[k]+(src2[k+1]-src2[k])*fr;
     const ya=c0*a+c1*x1+c2*x2-d1*y1-d2*y2; x2=x1;x1=a;y2=y1;y1=ya;
     const yb=c0*b+c1*z1+c2*z2-d1*w1-d2*w2; z2=z1;z1=b;w2=w1;w1=yb;
     Lch[i]+=ya*gl; Rch[i]+=yb*gr;
     pos+=step}
    voices++}
   const buf=new AudioBuffer({length:N,sampleRate:SR,numberOfChannels:2});
   buf.copyToChannel(Lch,0);buf.copyToChannel(Rch,1);
   const src=C.createBufferSource();src.buffer=buf;src.connect(sp.inp);src.start(0);
   HMIX[grp]=1}
  return voices};
 const playH=h=>{"""
s=s.replace(a,NEW)

# the scheduler hands percussion to the mixer once, up front, instead of per hit
a2="const Qn=[...c.notes.map(n=>[n.t,0,n]),...c.hits.map(h=>[h.t,1,h])].sort((a,b)=>a[0]-b[0]);let qi=0;"
one(a2,'queue')
s=s.replace(a2,"let hitsDone=0;try{hitsDone=mixHits(c.hits)}catch(e){console.error('[PromoMixer] drum mix',e)}\n"
 "  const Qn=[...c.notes.map(n=>[n.t,0,n]),...(hitsDone?[]:c.hits.map(h=>[h.t,1,h]))].sort((a,b)=>a[0]-b[0]);let qi=0;")
io.open(p,'w',encoding='utf-8').write(s);print('patch61 ok')
