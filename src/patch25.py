p='index.html'; s=open(p,encoding='utf-8').read()
def rep(old,new):
    global s
    assert s.count(old)==1,('ANCHOR x%d: '%s.count(old))+old[:90]
    s=s.replace(old,new)

# ── AIMLESS ───────────────────────────────────────────────────────────────
# Flagged beds: lead 24.2 notes vs 15.9 (P=100%), range 14.6 vs 11.9 semitones
# (99%), 14.4 chords vs 12.4 (93%). Hold the lead to a tighter, more singable
# shape; fold stray octave leaps back toward the melody's centre.
anchor="   if(drop.size){ for(let i=ev.length-1;i>=0;i--) if(drop.has(ev[i])) ev.splice(i,1); }"
rep(anchor, anchor + """
   // the lead carries the tune: keep it sparse and inside a comfortable span
   try{
    const leadName=(roles&&roles.lead&&roles.lead.name)||'lead';
    const lead=ev.filter(e=>e.r&&e.r.name===leadName&&!e.riser);
    if(lead.length>6){
      const LCAP=Math.max(8,Math.min(20,Math.round(Math.max(1,bbB||1)*0.42)));
      if(lead.length>LCAP){
        const a=lead.slice().sort((x,y)=>x.B-y.B);
        for(let i=0;i<a.length;i++){
          const e=a[i],pv=a[i-1],nx=a[i+1];
          const onBar=Math.abs(e.B/4-Math.round(e.B/4))<0.02;
          const onBeat=Math.abs(e.B-Math.round(e.B))<0.02;
          const gap=Math.min(pv?e.B-pv.B:9, nx?nx.B-e.B:9);
          e._lk=(onBar?6:0)+(onBeat?3:0)+(e.d||0)*2.5+Math.min(2,gap*3);
        }
        const ord=a.slice().sort((x,y)=>x._lk-y._lk); let n=a.length; const kill=new Set();
        for(const e of ord){ if(n<=LCAP)break; kill.add(e); n--; }
        for(let i=ev.length-1;i>=0;i--) if(kill.has(ev[i])) ev.splice(i,1);
      }
      // narrow the span: fold outliers by octaves toward the median
      const live=ev.filter(e=>e.r&&e.r.name===leadName&&typeof e.m==='number');
      if(live.length>3){
        const ms=live.map(e=>e.m).sort((x,y)=>x-y);
        const mid=ms[Math.floor(ms.length/2)], SPAN=7;
        for(const e of live){
          let g=0;
          while(e.m-mid>SPAN && g++<3) e.m-=12;
          while(mid-e.m>SPAN && g++<3) e.m+=12;
        }
      }
    }
   }catch(err){}""")

# ── CROWDS VOICE ──────────────────────────────────────────────────────────
# Flagged beds put 76.6% of notes in the speech band (midi 48-72) vs 64.6%,
# and were ducked 2.2 dB less. Start beds further out of the way.
assert s.count("minDb:-10")==2
s=s.replace("minDb:-10","minDb:-13")

# ── NEW DIAGNOSTICS ───────────────────────────────────────────────────────
# 26/36 beds flagged CLASHING have zero out-of-key notes, so out-of-key cannot
# be the cause. Measure simultaneous interval dissonance instead, and per-part
# note share, so the next round can test CLASH and BALANCE properly.
rep("""     gainSpreadDb:mb.length?+(Math.max(...mb)-Math.min(...mb)).toFixed(1):null
   };""",
"""     gainSpreadDb:mb.length?+(Math.max(...mb)-Math.min(...mb)).toFixed(1):null
   };
   // simultaneous dissonance: pairs of parts sounding a semitone / major 7th /
   // tritone apart at the same moment -- the usual source of "clashing"
   try{
     const at={};
     for(const e of ev){ if(!e.r||typeof e.m!=='number')continue;
       const g=Math.round(e.B*4)/4; (at[g]=at[g]||[]).push(e.m); }
     let harsh=0,tri=0,pairsN=0,sounding=0;
     for(const g in at){ const ms=at[g]; if(ms.length<2)continue; sounding++;
       for(let i=0;i<ms.length;i++)for(let j=i+1;j<ms.length;j++){
         pairsN++;
         const iv=Math.abs(ms[i]-ms[j])%12, ivc=Math.min(iv,12-iv);
         if(ivc===1)harsh++; else if(ivc===6)tri++;
       } }
     DIAG.simultaneousPairs=pairsN;
     DIAG.semitoneClashes=harsh; DIAG.tritoneClashes=tri;
     DIAG.clashShare=pairsN?+((harsh+tri)/pairsN).toFixed(3):0;
     DIAG.semitoneShare=pairsN?+(harsh/pairsN).toFixed(3):0;
     DIAG.chordsSounding=sounding;
     // per-part share of all notes: a part hogging the arrangement
     const tn=Object.values(DIAG.parts).reduce((a,v)=>a+v.notes,0)||1;
     let hog=0,hogName=null;
     for(const k in DIAG.parts){ const sh=DIAG.parts[k].notes/tn;
       DIAG.parts[k].share=+sh.toFixed(2); if(sh>hog){hog=sh;hogName=k} }
     DIAG.dominantPart=hogName; DIAG.dominantShare=+hog.toFixed(2);
     const leadP=DIAG.parts[(roles&&roles.lead&&roles.lead.name)||'lead'];
     DIAG.leadNotes=leadP?leadP.notes:null;
     DIAG.leadSpan=leadP?(leadP.hi-leadP.lo):null;
     DIAG.voiceBandShare=+(Object.values(DIAG.parts)
        .filter(v=>v.mean>=48&&v.mean<=72)
        .reduce((a,v)=>a+v.notes,0)/tn).toFixed(2);
   }catch(e){}""")
open(p,'w',encoding='utf-8').write(s)
print('ok 25')
