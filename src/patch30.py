p='index.html'; s=open(p,encoding='utf-8').read()
def rep(old,new):
    global s
    assert s.count(old)==1,('ANCHOR x%d: '%s.count(old))+old[:90]
    s=s.replace(old,new)

# ── 1. No two notes identical ────────────────────────────────────────────
# One sample per pitch and nothing varied per note is the machine-gun
# signature: every repeat of a pitch was byte-identical. Deterministic
# per-note hash (the app must stay reproducible), applied as cents of
# detune and a few ms of sample-start offset on sustaining instruments.
rep("""  const play=()=>{const s=C.createBufferSource();s.buffer=Sb;""",
"""  const HSH=(a,b)=>{const x=Math.sin((a+1.7)*12.9898+(b+3.1)*78.233)*43758.5453;return x-Math.floor(x)};
  const hm=HSH(n.B||0,n.m||0), hm2=HSH((n.m||0)*1.37,(n.B||0)*2.11);
  const play=()=>{const s=C.createBufferSource();s.buffer=Sb;
    // real players never repeat a note exactly: pitch, attack and bow/pick
    // position all move slightly. Percussive hits get less.
    const perc=/^(pluck|synthpluck|glock|xylo|marimba|vibes|harp|pizz)/.test(k||'');
    s.detune.value=(s.detune.value||0)+(hm*2-1)*(perc?4.5:7.5);""")

# start the sample a few ms in, so the attack transient differs note to note
rep("}else s.playbackRate.value=rate;if(mod_)mod_.connect(s.detune);return s};",
    "}else s.playbackRate.value=rate;if(mod_)mod_.connect(s.detune);s._hoff=(hm2*0.009);return s};")

# ── 2. Human microtiming ─────────────────────────────────────────────────
# Measured references breathe; a quantised grid does not. Real players sit
# slightly behind the beat on backbeats and push syncopations. Deterministic,
# scaled per role so the rhythm section stays tighter than the melody.
anchor="    ev.sort((x,y)=>x.B-y.B);"
rep(anchor, """    // --- microtiming: lay back off-beats, keep downbeats tight ---
    try{
     const TIGHT={bass:0.35,sub:0.3,keys:0.8,pulse:0.6,color:1.0,riff:0.9,
                  counter:1.0,lead:1.15,pad:0.5,arp:0.7,pluck:0.9,dbl:1.0};
     for(const e of ev){
       if(!e.r||e.riser)continue;
       const base=e.r.name.replace(/[0-9]+$/,'');
       const amt=(TIGHT[base]!==undefined?TIGHT[base]:0.8);
       const pos=((e.B%1)+1)%1;
       const onBeat=pos<0.02||pos>0.98;
       const h=Math.sin((e.B+1.3)*7.919+(e.m||0)*3.141);
       // off-beats drift later (laid back), downbeats barely move
       const lay = onBeat ? 0.0015 : 0.0075;
       e.B = Math.max(0, e.B + (h*0.5+ (onBeat?0:0.35))*lay*amt);
     }
    }catch(err){}
""" + anchor)
open(p,'w',encoding='utf-8').write(s)
print('ok 30')
