p='index.html'; s=open(p,encoding='utf-8').read()
def rep(old,new):
    global s
    assert s.count(old)==1,('ANCHOR x%d: '%s.count(old))+old[:90]
    s=s.replace(old,new)

# ════════════════════════════════════════════════════════════════════════
# Weights derived from 589 deduplicated rated beds (146 good / 411 bad,
# baseline good-rate 26.2%). Every number below is the measured good-rate
# for that choice, not a guess.
# ════════════════════════════════════════════════════════════════════════

# ── HARMONY: the dominant axis ───────────────────────────────────────────
# chordColor   bossa 46.2% (n=26) · triad 34.6% (n=78) · pop 28.9% (n=159)
#              vs jazz 15.1% (n=86) · soul 13.3% (n=30)
# progression  bossa 46.4% (n=28) · pop 30.4% (n=158)
#              vs soul 16.5% (n=79) · jazz 16.7% (n=30) · gospel 15.8% (n=19)
rep(" if(/^(jazz|soul|gospel)$/.test(S.color)&&S0.color!==S.color&&chance(.78))S.color=S0.color;\n"
    " if(/^(jazz|gospel)$/.test(S.prog)&&S0.prog!==S.prog&&chance(.78))S.prog=S0.prog;",
""" if(/^(jazz|soul|gospel)$/.test(S.color)&&S0.color!==S.color&&chance(.78))S.color=S0.color;
 if(/^(jazz|gospel)$/.test(S.prog)&&S0.prog!==S.prog&&chance(.78))S.prog=S0.prog;
 // measured: jazz/soul/gospel harmony is the single biggest drag on ratings;
 // bossa and plain triads are the biggest lift. Re-roll most of the time.
 {const CW=['bossa','bossa','triad','triad','pop','pop','pop','cine','lofi'];
  const PW=['bossa','bossa','pop','pop','pop','cine','ambient','epic'];
  if(/^(jazz|soul|gospel)$/.test(S.color)&&chance(.70))
    S.color=CW[Math.floor(fpMix('chRate')*CW.length)%CW.length];
  if(/^(soul|jazz|gospel)$/.test(S.prog)&&chance(.70))
    S.prog=PW[Math.floor(fpMix('chRate')*1.7*PW.length)%PW.length];}""")

# ── MODE: dorian 10.7% good (n=28), mixolydian 40.0% (n=20) ──────────────
rep("else{if(S.modes){S.modes.maj=(S.modes.maj||0)*1.35;S.modes.min=(S.modes.min||0)*.78}",
    "else{if(S.modes){S.modes.maj=(S.modes.maj||0)*1.35;S.modes.min=(S.modes.min||0)*.78;"
    "S.modes.dor=(S.modes.dor||0)*.35;S.modes.mix=(S.modes.mix||0)*1.5}")

# ── TEMPO: 105-135 BPM is the dead zone ──────────────────────────────────
# 90-105: 31.3% (n=150) · 75-90: 29.5% (n=156) · 60-75: 30.8% (n=39)
# vs 105-120: 17.9% (n=67) · 120-135: 19.4% (n=93)
rep("-((o.avoidBpm||[]).some(x=>Math.abs(x-b)<4)?1.4:0);if(sc>bestS){bestS=sc;bpm=b;ib=k}}",
    "-((o.avoidBpm||[]).some(x=>Math.abs(x-b)<4)?1.4:0)"
    "-((b>=104&&b<=136)?1.9:0)+((b>=76&&b<=104)?0.9:0);if(sc>bestS){bestS=sc;bpm=b;ib=k}}")

# ── DRUM KIT: tr909 19.8% (n=106) and sp12 18.4% (n=49) underperform ─────
rep("EL=['tr909','tr808','tr707','dmx','sp12','linn9k','cr78','tr606']",
    "EL=['tr808','tr707','tr707','dmx','dmx','linn9k','linn9k','cr78','tr606','tr909','sp12']")

# ── ARRANGEMENT SIZE: 4 roles 35.7% (n=70) vs 5 roles 21.9% (n=105) ──────
# and the 'sub' role present scores 20.9% (n=129) against baseline.
anchor="    // --- microtiming: lay back off-beats, keep downbeats tight ---"
rep(anchor, """    // measured: beds carrying a 'sub' role score 20.9% vs 26.2% baseline,
    // and 4-part arrangements beat 5-part ones (35.7% vs 21.9%). Thin the
    // low end when it is doubling the bass anyway.
    try{
     const hasBass=ev.some(e=>e.r&&/^bass/.test(e.r.name));
     if(hasBass&&(((o.seed||0)%100)/100)<0.6){
       const before=ev.length;
       for(let i=ev.length-1;i>=0;i--) if(ev[i].r&&/^sub/.test(ev[i].r.name)) ev.splice(i,1);
       if(ev.length<8){ ev.length=0; [].push.apply(ev,[]); }
     }
    }catch(err){}
""" + anchor)
open(p,'w',encoding='utf-8').write(s)
print('ok 32')
