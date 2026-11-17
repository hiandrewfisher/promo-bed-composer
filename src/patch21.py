p='index.html'; s=open(p,encoding='utf-8').read()
def rep(old,new):
    global s
    assert s.count(old)==1, ('ANCHOR x%d: '%s.count(old))+old[:80]
    s=s.replace(old,new)

# ── FIX 1 ────────────────────────────────────────────────────────────────
# Note flurry: cap the busiest single melodic voice. Drops the least
# structural notes (off-beat, short, quiet, tightly spaced) until under cap.
anchor=" {const per={};for(const e of ev){const k=e.r.name+(e.uni?'*':'');per[k]=(per[k]||0)+1}"
rep(anchor, """ {// --- thin any voice that is noodling: busiest part drove ratings down hard ---
  try{
   const beatsTot=Math.max(1,bbB||1), CAPR=3.0, CAPA=180;
   const cap=Math.max(40,Math.min(CAPA,Math.round(beatsTot*CAPR)));
   const byRole=new Map();
   for(const e of ev){if(!e.r||e.riser)continue;const k=e.r.name;if(!byRole.has(k))byRole.set(k,[]);byRole.get(k).push(e)}
   const drop=new Set();
   for(const [rn,list] of byRole){
     if(list.length<=cap)continue;
     const arr=list.slice().sort((a,b)=>a.B-b.B);
     for(let i=0;i<arr.length;i++){
       const e=arr[i],prev=arr[i-1],next=arr[i+1];
       const onBeat=Math.abs(e.B-Math.round(e.B))<0.02;
       const onBar=Math.abs(e.B/4-Math.round(e.B/4))<0.02;
       const gapP=prev?e.B-prev.B:9, gapN=next?next.B-e.B:9;
       const tight=Math.min(gapP,gapN);
       e._keep = (onBar?6:0)+(onBeat?3:0)+(e.d||0)*2+(e.v||0)*2+Math.min(2,tight*3)
                 +((e.mel&&e.mel>1)?1:0);
     }
     const order=arr.slice().sort((a,b)=>a._keep-b._keep);
     let n=arr.length;
     for(const e of order){ if(n<=cap)break; drop.add(e); n--; }
   }
   if(drop.size){ for(let i=ev.length-1;i>=0;i--) if(drop.has(ev[i])) ev.splice(i,1); }
  }catch(err){}
  const per={};for(const e of ev){const k=e.r.name+(e.uni?'*':'');per[k]=(per[k]||0)+1}""")

# ── FIX 2 ────────────────────────────────────────────────────────────────
# Harmony: jazz/soul/gospel colouring and progressions rated 1.56-1.60.
# Revert most drift INTO them; genres that are natively jazz keep their identity.
rep("if(S0.prog&&PALT[S0.prog]&&chance(.45*EXAG)){const a=PALT[S0.prog];S.prog=a[Math.min(a.length-1,Math.floor(fpMix('chRate')*a.length))]}",
    "if(S0.prog&&PALT[S0.prog]&&chance(.45*EXAG)){const a=PALT[S0.prog];S.prog=a[Math.min(a.length-1,Math.floor(fpMix('chRate')*a.length))]}\n"
    " if(/^(jazz|soul|gospel)$/.test(S.color)&&S0.color!==S.color&&chance(.78))S.color=S0.color;\n"
    " if(/^(jazz|gospel)$/.test(S.prog)&&S0.prog!==S.prog&&chance(.78))S.prog=S0.prog;")

# Soften the extension-heavy palettes themselves (fewer 9ths/13ths, more plain tones)
rep("soul:{M:['maj9','maj7'],m:['m9','m7'],D:['9','7sus4'],d:['hdim'],s:['7sus4']}",
    "soul:{M:['maj7','maj','add9'],m:['m7','m'],D:['7','sus4'],d:['hdim'],s:['sus4']}")
rep("jazz:{M:['maj9','69'],m:['m9','m7'],D:['13','9'],d:['hdim'],s:['7sus4']}",
    "jazz:{M:['maj7','69','maj'],m:['m7','m9'],D:['9','7'],d:['hdim'],s:['7sus4']}")
rep("gospel:{M:['maj','add9','6'],m:['m7'],D:['7','9'],d:['dim7'],s:['sus4']}",
    "gospel:{M:['maj','add9','6'],m:['m7','m'],D:['7','maj'],d:['dim7'],s:['sus4']}")
rep("funk:{M:['9','7','maj'],m:['m7','m9','m7'],D:['9','7'],d:['hdim'],s:['7sus4']}",
    "funk:{M:['7','maj','9'],m:['m7','m'],D:['7','9'],d:['hdim'],s:['7sus4']}")

# ── FIX 3 ────────────────────────────────────────────────────────────────
# Minor mode averaged 1.80 vs 2.20 major: nudge, don't ban.
rep("else{let best=-1e9;const KS=[];for(const md in S.modes)",
    "else{if(S.modes){S.modes.maj=(S.modes.maj||0)*1.35;S.modes.min=(S.modes.min||0)*.78}let best=-1e9;const KS=[];for(const md in S.modes)")

open(p,'w',encoding='utf-8').write(s)
print('ok 21')
