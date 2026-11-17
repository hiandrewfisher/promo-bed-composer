p='index.html'; s=open(p,encoding='utf-8').read()
def rep(old,new):
    global s
    assert s.count(old)==1,('ANCHOR x%d: '%s.count(old))+old[:90]
    s=s.replace(old,new)

# ── 1. Narrow UNAVAILABLE to what is genuinely unpublished ───────────────
# I hand-wrote the previous list and missed cl_stac, which then 404'd. The
# staccato files are ~0.1 MB each and are now published, so only the six
# organ banks remain out (they are 8 MB and organ scores 12.5% good, the
# worst of any instrument kind in 589 rated beds).
old=s[s.index("const UNAVAILABLE=new Set("):s.index("\nconst INS")]
s=s.replace(old,"const UNAVAILABLE=new Set(['organ_loud','organ_ped','renorg4','renorgfull','pipe_organ','ren_organ'])")

# ── 2. A negative scheduling time must never abort a note ────────────────
# Logged: RangeError 'setValueAtTime' Time must be a finite non-negative
# number: -0.0642789 / -0.620636, thrown inside playN and uncaught, which
# abandons the rest of that note's envelope. A negative time is never
# meaningful; the Web Audio meaning of "as early as possible" is 0.
GUARD = """
(function(){
  if(typeof AudioParam==='undefined'||AudioParam.prototype.__timeGuard)return;
  const M=['setValueAtTime','linearRampToValueAtTime','exponentialRampToValueAtTime','setTargetAtTime'];
  for(const fn of M){
    const orig=AudioParam.prototype[fn];
    if(typeof orig!=='function')continue;
    AudioParam.prototype[fn]=function(value,time,...rest){
      let t=time;
      if(!(typeof t==='number'&&isFinite(t))||t<0) t=0;
      return orig.call(this,value,t,...rest);
    };
  }
  for(const fn of ['start','stop']){
    const orig=AudioBufferSourceNode.prototype[fn];
    if(typeof orig!=='function')continue;
    AudioBufferSourceNode.prototype[fn]=function(when,...rest){
      let w=when;
      if(w!==undefined&&(!(typeof w==='number'&&isFinite(w))||w<0)) w=0;
      return orig.call(this,w,...rest);
    };
  }
  AudioParam.prototype.__timeGuard=true;
})();
"""
rep("const UNAVAILABLE=new Set(", GUARD+"const UNAVAILABLE=new Set(")
open(p,'w',encoding='utf-8').write(s)
print('ok 34')
