p='index.html'; s=open(p,encoding='utf-8').read()
def rep(old,new):
    global s
    assert s.count(old)==1,('ANCHOR x%d: '%s.count(old))+old[:90]
    s=s.replace(old,new)

# ── 1. Pre-delay was capped at 0.2 s ────────────────────────────────────
# Logged repeatedly: "Delay.delayTime.value 0.267 outside nominal range
# [0, 0.2]; clamped". Pre-delay is exactly what makes reverb sound distant,
# so the effect was being silently cut. Also give the lead a far send.
rep("""  if(full&&st.verb&&st.verb.s){const pd=C.createDelay(.2);pd.delayTime.value=st.pre||.015;const sg=C.createGain();sg.gain.value=st.verb.s;nd.connect(pd).connect(sg).connect(verb(st.verb.t))}""",
"""  if(full&&st.verb&&st.verb.s){
    // a melody sitting alone in the upper mids reads as thin and exposed;
    // distance (long pre-delay + a hall + a much bigger send) puts it in a room
    const SHRILL=/^(reed|pipe|bow|solo|ens|organ|mallet)$/;
    const far=/^(lead|counter|dbl)/.test(name||'')&&SHRILL.test((st.kind||''));
    const pd=C.createDelay(1.6);
    pd.delayTime.value=Math.min(1.5, far?Math.max(st.pre||.015,.065):(st.pre||.015));
    const sg=C.createGain();sg.gain.value=st.verb.s*(far?2.1:1);
    nd.connect(pd).connect(sg).connect(verb(far?'hall':st.verb.t))}""")

# make the kind visible to the strip so the rule above can see it
rep("const play=()=>{const s=C.createBufferSource();s.buffer=Sb;",
    "try{if(sp&&sp.st&&!sp.st.kind)sp.st.kind=k}catch(e){}\n  const play=()=>{const s=C.createBufferSource();s.buffer=Sb;")

# ── 2. Lead: drop the register, slow the pacing, add a harmony voice ────
anchor="    // --- microtiming: lay back off-beats, keep downbeats tight ---"
rep(anchor, """    // --- lead: give it a body instead of one exposed thin line ---
    try{
     const SHRILL=/^(reed|pipe|bow|solo|ens|organ)$/;
     const ln=(roles&&roles.lead&&roles.lead.name)||'lead';
     const lr=roles&&roles.lead;
     const lead=ev.filter(e=>e.r&&e.r.name===ln&&!e.riser&&typeof e.m==='number');
     if(lead.length>2&&lr&&SHRILL.test(lr.kind||'')){
       const entry=(typeof INS!=='undefined'&&(INS[lr.id]||null));
       const lo=entry?entry[4]:0, hi=entry?entry[5]:127;
       // a clarinet or violin screaming in the upper mids is the "dying lamb":
       // take it down an octave when the instrument can still play it
       const ms=lead.map(e=>e.m);
       const med=ms.slice().sort((a,b)=>a-b)[Math.floor(ms.length/2)];
       if(med>=64 && Math.min(...ms)-12>=lo){
         for(const e of lead) e.m-=12;
       }
       // pacing: let each note breathe
       for(const e of lead) e.d=(e.d||0)*1.3;
       // --- real voice leading, not parallel motion ---
       // Rules applied, in the order a harmony writer would weigh them:
       //  * the voice takes a chord member the lead is NOT on (completes the chord)
       //  * it moves by the smallest interval available (stepwise preferred)
       //  * no parallel perfect fifths or octaves with the lead
       //  * contrary motion when the lead leaps
       //  * no voice crossing, spacing kept between a 3rd and a 10th
       //  * a 7th resolves down by step; a held pitch ties instead of re-attacking
       const add=[];
       const seq=lead.slice().sort((a,b)=>a.B-b.B);
       let prevH=null, prevL=null, prevNote=null;
       for(const e of seq){
         const c=cAt(e.B);
         if(!c||!c.pcs||!c.pcs.length){prevL=e.m;continue}
         const leadPc=((Math.round(e.m)%12)+12)%12;
         const cands=[];
         for(const pc of c.pcs){
           for(let oct=-2;oct<=0;oct++){
             const m=Math.round(e.m/12)*12+pc+oct*12;
             const iv=e.m-m;
             if(iv<3||iv>16)continue;                 // 3rd .. 10th below, never crossing
             if(iv%12===0)continue;                   // no octave/unison doubling of the lead
             const sameTone=(pc===leadPc);
             let sc=0;
             // completing the chord beats doubling what the lead already has
             sc += sameTone?-6:3;
             // consonant, singable spacing
             if(iv===3||iv===4||iv===8||iv===9)sc+=3;  // 3rds and 6ths
             else if(iv===7||iv===5)sc+=0.5;           // 5ths and 4ths: thinner
             else if(iv===6||iv===1||iv===2)sc-=4;     // tritone/seconds below: harsh
             // voice leading: move as little as possible
             if(prevH!=null){
               const step=Math.abs(m-prevH);
               sc += step===0?2.5 : step<=2?3 : step<=4?1 : step<=7?-1 : -5;
               // parallel perfect fifths and octaves with the lead
               if(prevL!=null){
                 const pIv=prevL-prevH, nIv=iv;
                 if((pIv%12===7&&nIv%12===7)||(pIv%12===0&&nIv%12===0))sc-=8;
                 // contrary motion when the lead leaps
                 const leadMove=e.m-prevL, harmMove=m-prevH;
                 if(Math.abs(leadMove)>=5){
                   if(leadMove*harmMove<0)sc+=2.5;      // opposite direction
                   else if(leadMove*harmMove>0)sc-=1.5; // both leaping the same way
                 }
                 // a 7th wants to fall by step
                 if(Math.abs(prevL-prevH)===10&&(m-prevH)===-1)sc+=2;
               }
             }
             cands.push([sc,m]);
           }
         }
         if(!cands.length){prevL=e.m;continue}
         cands.sort((a,b)=>b[0]-a[0]);
         const pick=cands[0][1];
         // hold the note rather than re-articulating the same pitch
         if(prevNote&&pick===prevH&&(e.B-prevNote.B)<=4){
           prevNote.d=Math.max(prevNote.d||0,(e.B-prevNote.B)+(e.d||0));
         }else{
           const h=Object.assign(Object.create(Object.getPrototypeOf(e)),e);
           h.m=pick; h.v=(e.v||.7)*0.68; h.harm=true;
           add.push(h); prevNote=h;
         }
         prevH=pick; prevL=e.m;
       }
       if(add.length) [].push.apply(ev,add);
       ev.sort((x,y)=>x.B-y.B);
     }
    }catch(err){}
""" + anchor)

# ── 3. Organs are back in ───────────────────────────────────────────────
rep("const UNAVAILABLE=new Set(['organ_loud','organ_ped','renorg4','renorgfull','pipe_organ','ren_organ','pipeorgan','renorgan'])",
    "const UNAVAILABLE=new Set([])")
open(p,'w',encoding='utf-8').write(s)
print('ok 37')
