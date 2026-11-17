p='index.html'; s=open(p,encoding='utf-8').read()
def rep(old,new):
    global s
    assert s.count(old)==1,('ANCHOR x%d: '%s.count(old))+old[:90]
    s=s.replace(old,new)

# ── FIX A: BAD ENDING ─────────────────────────────────────────────────────
# bbB floors to a whole 4-bar group after shaving 1.9s, so the music buttons
# out up to 4 bars early. Measured: every bed ended 3-6s before the read did.
rep("let bbB=Math.max(4,Math.floor((L-1.9-ib*bl)/(4*bl))*4);",
"""let bbB=Math.max(4,Math.floor((L-1.9-ib*bl)/(4*bl))*4);
 { // never button out while the read is still going
   const roomB=Math.max(4,Math.floor((L-0.35-ib*bl)/(4*bl))*4);
   if(bbB<postB) bbB=Math.max(bbB,Math.min(roomB,Math.ceil(postB/4)*4));
   if(bbB<postB) bbB=roomB;
 }""")

# ── FIX B: CLASHING ───────────────────────────────────────────────────────
# Out-of-key notes cannot explain it (26/36 flagged beds had none). The usual
# cause is two parts a semitone or tritone apart at the same instant. Resolve
# those by octave-shifting or nudging the lower-priority voice to a chord tone.
anchor="   if(drop.size){ for(let i=ev.length-1;i>=0;i--) if(drop.has(ev[i])) ev.splice(i,1); }"
rep(anchor, anchor + """
   // --- resolve simultaneous semitone / tritone clashes between parts ---
   try{
    const PRI={lead:5,keys:3,pad:2,bass:4,arp:2,pluck:2};
    const pri=e=>PRI[e.r&&e.r.name]||1;
    const at={};
    for(const e of ev){ if(!e.r||typeof e.m!=='number'||e.riser)continue;
      const g=Math.round(e.B*4)/4; (at[g]=at[g]||[]).push(e); }
    let fixed=0;
    for(const g in at){
      const list=at[g]; if(list.length<2)continue;
      for(let pass=0;pass<2;pass++){
        let touched=false;
        for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){
          const a=list[i],b=list[j];
          if(a.r.name===b.r.name)continue;
          const raw=Math.abs(a.m-b.m), iv=raw%12, ivc=Math.min(iv,12-iv);
          if(ivc!==1&&ivc!==6)continue;
          if(raw>=11)continue;              // a 9th apart is fine, leave it
          const victim = pri(a)<=pri(b)?a:b, other = victim===a?b:a;
          const c=cAt(victim.B);
          let best=null,bestD=99;
          if(c&&c.pcs&&c.pcs.length){
            for(const pc of c.pcs){
              for(let oct=-1;oct<=1;oct++){
                const cand=Math.round(victim.m/12)*12+pc+oct*12;
                const d2=Math.abs(cand-victim.m);
                const r2=Math.abs(cand-other.m)%12, c2=Math.min(r2,12-r2);
                if(c2===1||c2===6)continue;
                if(d2<bestD&&d2<=4){bestD=d2;best=cand}
              }
            }
          }
          if(best===null){ best = victim.m + (victim.m<other.m?-12:12); }
          if(best!==victim.m){ victim.m=best; fixed++; touched=true; }
        }
        if(!touched)break;
      }
    }
   }catch(err){}""")

# ── FIX C: BALANCE ────────────────────────────────────────────────────────
# One part hogging the arrangement reads as "something too loud". Trim the
# dominant voice when it carries far more than its share of the notes.
rep("""   // the lead carries the tune: keep it sparse and inside a comfortable span""",
"""   // no single part should carry most of the arrangement
   try{
    const cnt={};
    for(const e of ev){ if(!e.r||e.riser)continue; cnt[e.r.name]=(cnt[e.r.name]||0)+1 }
    const tot=Object.values(cnt).reduce((a,b)=>a+b,0)||1;
    const names=Object.keys(cnt);
    if(names.length>=3){
      const top=names.reduce((a,b)=>cnt[a]>=cnt[b]?a:b);
      const LIMIT=Math.max(0.42,1.6/names.length);
      if(cnt[top]/tot>LIMIT){
        const want=Math.round(LIMIT*tot);
        const a=ev.filter(e=>e.r&&e.r.name===top&&!e.riser).sort((x,y)=>x.B-y.B);
        for(let i=0;i<a.length;i++){
          const e=a[i],pv=a[i-1],nx=a[i+1];
          const onBar=Math.abs(e.B/4-Math.round(e.B/4))<0.02;
          const onBeat=Math.abs(e.B-Math.round(e.B))<0.02;
          const gap=Math.min(pv?e.B-pv.B:9, nx?nx.B-e.B:9);
          e._bk=(onBar?6:0)+(onBeat?3:0)+(e.d||0)*2+Math.min(2,gap*3);
        }
        const ord=a.slice().sort((x,y)=>x._bk-y._bk); let n=a.length; const kill=new Set();
        for(const e of ord){ if(n<=want)break; kill.add(e); n--; }
        for(let i=ev.length-1;i>=0;i--) if(kill.has(ev[i])) ev.splice(i,1);
      }
    }
   }catch(err){}
   // the lead carries the tune: keep it sparse and inside a comfortable span""")
open(p,'w',encoding='utf-8').write(s)
print('ok 26')
