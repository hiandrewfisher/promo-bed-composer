p='index.html'; s=open(p,encoding='utf-8').read()
def rep(old,new):
    global s
    assert s.count(old)==1,('ANCHOR x%d: '%s.count(old))+old[:90]
    s=s.replace(old,new)

# Bjorklund's algorithm (Toussaint 2005, "The Euclidean Algorithm Generates
# Traditional Musical Rhythms"). Verified to reproduce tresillo E(3,8),
# cinquillo E(5,8), bossa E(5,16), samba E(7,16), aksak E(4,9), Venda E(5,12).

# the pass itself: force each rhythm role onto ONE repeating Euclidean cell
anchor="   // --- resolve simultaneous semitone / tritone clashes between parts ---"
rep(anchor, """   // --- Euclidean groove lock ---
   // Snapping to legal positions is not repetition: each bar still used a
   // different subset. This imposes the SAME cell every bar, which is what
   // drives the references' +0.85 onset autocorrelation at one bar.
   try{
    try{window.__glock={stage:'entered'}}catch(e){}
    function EUC(k,n){
      if(n<=0)return[];if(k<=0)return new Array(n).fill(0);if(k>=n)return new Array(n).fill(1);
      let a=[],b=[];
      for(let i=0;i<k;i++)a.push([1]);
      for(let i=0;i<n-k;i++)b.push([0]);
      while(b.length>1&&a.length>0){
        const m=Math.min(a.length,b.length),na=[],nb=[];
        for(let i=0;i<m;i++)na.push(a[i].concat(b[i]));
        if(a.length>m){for(let i=m;i<a.length;i++)nb.push(a[i])}
        else{for(let i=m;i<b.length;i++)nb.push(b[i])}
        a=na;b=nb;
      }
      const out=[];for(const g of a.concat(b))for(const x of g)out.push(x);
      return out.slice(0,n);
    }
    function rot(arr,r){const n=arr.length;if(!n)return arr;r=((r%n)+n)%n;return arr.slice(r).concat(arr.slice(0,r))}
    // pulses per 16-step bar, per role: sparse anchors vs busy motion
    const EUC_K={bass:[3,5],pulse:[7,9,11],riff:[5,7,9],color:[3,5,7],counter:[3,5],
                 keys:[4,5,7],dbl:[5,7],arp:[9,11,13],pluck:[5,7,9],pad:[2,3]};
    const EUC_ROT={bass:0,keys:0,pulse:2,riff:4,color:6,counter:3,dbl:5,arp:1,pluck:7,pad:0};
    const SPB=0.25, LOCK=/^(keys|pulse|color|riff|counter|dbl|arp|pluck|bass)[0-9]*$/;
    const byRole={};
    for(const e of ev){ if(!e.r||e.riser)continue; (byRole[e.r.name]=byRole[e.r.name]||[]).push(e) }
    let moved=0,made=0,cut=0;
    for(const rn in byRole){
      if(!LOCK.test(rn))continue;
      const base=rn.replace(/[0-9]+$/,''), ks=EUC_K[base]; if(!ks)continue;
      const src=byRole[rn]; if(src.length<4)continue;
      const k=ks[Math.floor(Math.abs(Math.sin((o.seed||1)*(base.length+3)))*ks.length)%ks.length];
      const cell=rot(EUC(k,16),EUC_ROT[base]||0);
      const proto=src[Math.floor(src.length/2)];
      const dur=src.reduce((a,b)=>a+(b.d||0),0)/src.length;
      const vel=src.reduce((a,b)=>a+(b.v||0),0)/src.length;
      const pitches=src.map(e=>e.m).filter(x=>typeof x==='number').sort((a,b)=>a-b);
      const mid=pitches.length?pitches[Math.floor(pitches.length/2)]:60;
      const want=[];
      const bars=Math.ceil((bbB||16)/4);
      for(let bar=0;bar<bars;bar++)for(let i=0;i<16;i++){
        if(!cell[i])continue;
        const B=bar*4+i*SPB; if(B>=bbB)continue;
        want.push(B);
      }
      const used=new Set(), out=[];
      for(const B of want){
        // reuse the nearest existing note so every field stays valid
        let best=null,bd=9;
        for(const e of src){ if(used.has(e))continue; const d=Math.abs(e.B-B); if(d<bd){bd=d;best=e} }
        if(best&&bd<=1.0){ used.add(best); if(best.B!==B){best.B=B;moved++} out.push(best) }
        else if(best!==null||src.length){
          const cl=Object.assign(Object.create(Object.getPrototypeOf(proto)),proto);
          cl.B=B; cl.d=dur||cl.d; cl.v=vel||cl.v;
          const c=cAt(B);
          if(c&&c.pcs&&c.pcs.length){
            let bm=mid,bdp=99;
            for(const pc of c.pcs)for(let oct=-1;oct<=1;oct++){
              const cand=Math.round(mid/12)*12+pc+oct*12, dd=Math.abs(cand-mid);
              if(dd<bdp){bdp=dd;bm=cand}
            }
            cl.m=bm;
          }
          out.push(cl); made++;
        }
      }
      for(const e of src) if(!used.has(e)&&out.indexOf(e)<0) cut++;
      byRole[rn]=out;
    }
    const locked=new Set(Object.keys(byRole).filter(r=>LOCK.test(r)));
    const rest=ev.filter(e=>!e.r||e.riser||!locked.has(e.r.name));
    const fresh=[];
    for(const r of locked) [].push.apply(fresh, byRole[r]);
    ev.length=0; [].push.apply(ev, rest.concat(fresh));
    ev.sort((x,y)=>x.B-y.B);
    try{window.__glock={moved,made,cut,roles:Array.from(locked)}}catch(e){}
   }catch(err){try{window.__glock={err:String(err).slice(0,120)}}catch(e){}}
""" + anchor)

# expose the toggle so A/B is possible
rep("s={voice:null,env:null,skips:[]","s={grooveLock:true,voice:null,env:null,skips:[]")
open(p,'w',encoding='utf-8').write(s)
print('ok 27')
