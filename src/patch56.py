import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
def one(a,l):
    if s.count(a)!=1: print('ANCHOR %s x%d'%(l,s.count(a)));sys.exit(1)

# A BiquadFilter was built for every note whether or not it was used: the node is
# only wired in when lpOn, yet it was always constructed, always given a frequency
# and a Q. That is thousands of unused native nodes per bed. Carry the cutoff in a
# plain number and build the filter only when it is actually in the chain.
a="const g=C.createGain(),lp=C.createBiquadFilter(),pn=C.createStereoPanner();lp.type='lowpass';"
one(a,'mk')
s=s.replace(a,"const g=C.createGain(),pn=C.createStereoPanner();let lp=null,lpF=20000,lpQ=.5;")

a2="lp.frequency.value=clamp((20000-(20000-f0)*(UXr.track??1))*(1+.05*H.g()),500,20000)}lp.Q.value=.5;"
one(a2,'set')
s=s.replace(a2,"lpF=clamp((20000-(20000-f0)*(UXr.track??1))*(1+.05*H.g()),500,20000)}")
a3="if(n.fill)lp.frequency.value=Math.min(lp.frequency.value,12500);else if(n.uni==9)lp.frequency.value=Math.min(lp.frequency.value,14500);"
one(a3,'air')
s=s.replace(a3,"if(n.fill)lpF=Math.min(lpF,12500);else if(n.uni==9)lpF=Math.min(lpF,14500);")

a4="if(k=='acid'){lp.Q.value=5+9*v;const f0=clamp(600+7000*v*v,600,9000);lp.frequency.setValueAtTime(f0,t);lp.frequency.setTargetAtTime(Math.max(280,f0*.1),t+.008,.07+.12*(1-v))}"
one(a4,'acid')
s=s.replace(a4,"let acidF=null;if(k=='acid'){lpQ=5+9*v;acidF=clamp(600+7000*v*v,600,9000);lpF=Math.min(lpF,acidF)}")

a5="const lpOn=k=='acid'||lp.frequency.value<18500||(sus&&n.dur>=.9&&lp.frequency.value*1.3<18500);"
one(a5,'on')
s=s.replace(a5,
"const lpOn=k=='acid'||lpF<18500||(sus&&n.dur>=.9&&lpF*1.3<18500);\n"
"  if(lpOn){lp=C.createBiquadFilter();lp.type='lowpass';lp.frequency.value=lpF;lp.Q.value=lpQ;\n"
"   if(acidF!=null){lp.frequency.setValueAtTime(acidF,t);lp.frequency.setTargetAtTime(Math.max(280,acidF*.1),t+.008,.07+.12*(1-v))}}")

a6="f0=lp.frequency.value;g.gain.linearRampToValueAtTime"
one(a6,'swellf0')
s=s.replace(a6,"f0=lpF;g.gain.linearRampToValueAtTime")
a7="lp.frequency.setValueAtTime(f0*(1-.25*amt),start);lp.frequency.linearRampToValueAtTime(Math.min(20000,f0*(1+.6*amt)),pk);lp.frequency.linearRampToValueAtTime(f0*.85,Math.max(pk+.05,end));"
one(a7,'swell')
s=s.replace(a7,"if(lp){lp.frequency.setValueAtTime(f0*(1-.25*amt),start);lp.frequency.linearRampToValueAtTime(Math.min(20000,f0*(1+.6*amt)),pk);lp.frequency.linearRampToValueAtTime(f0*.85,Math.max(pk+.05,end))}")
io.open(p,'w',encoding='utf-8').write(s);print('patch56 ok')
