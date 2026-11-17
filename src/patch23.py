p='index.html'; s=open(p,encoding='utf-8').read()
def rep(old,new):
    global s
    assert s.count(old)==1,('ANCHOR x%d: '%s.count(old))+old[:90]
    s=s.replace(old,new)

anchor="  const per={};for(const e of ev){const k=e.r.name+(e.uni?'*':'');per[k]=(per[k]||0)+1}"
rep(anchor, """  // --- diagnostics: measurable correlates of the ways a bed can sound wrong ---
  let DIAG=null;
  try{
   const parts={};
   for(const e of ev){ if(!e.r)continue; const k=e.r.name; (parts[k]=parts[k]||[]).push(e); }
   const info={},ranges=[];
   let chordTone=0,inScale=0,noteTot=0,lowN=0,highN=0;
   const SCS=new Set((scale||[]).map(x=>(x+key)%12));
   for(const k in parts){
     const a=parts[k],ms=a.map(e=>e.m).filter(x=>typeof x==='number');
     if(!ms.length)continue;
     const lo=Math.min(...ms),hi=Math.max(...ms);
     let on=0,ct=0;
     for(const e of a){
       if(Math.abs(e.B-Math.round(e.B))<0.02)on++;
       const pc=mod(Math.round(e.m),12); noteTot++;
       const c=cAt(e.B);
       if(c&&c.pcs&&c.pcs.includes(pc)){ct++;chordTone++}
       else if(SCS.has(pc))inScale++;
       if(e.m<48)lowN++; if(e.m>84)highN++;
     }
     info[k]={notes:a.length,lo,hi,mean:+(ms.reduce((x,y)=>x+y,0)/ms.length).toFixed(1),
              onBeatShare:+(on/a.length).toFixed(2),chordToneShare:+(ct/a.length).toFixed(2)};
     ranges.push([k,lo,hi]);
   }
   // register collision: pairs of parts sharing most of their range
   let collide=0,pairs=0;
   for(let i=0;i<ranges.length;i++)for(let j=i+1;j<ranges.length;j++){
     const [,l1,h1]=ranges[i],[,l2,h2]=ranges[j];
     const ov=Math.min(h1,h2)-Math.max(l1,l2), sm=Math.min(h1-l1,h2-l2)||1;
     pairs++; if(ov/sm>0.6)collide++;
   }
   // rhythmic pile-up: onsets shared by three or more parts
   const grid={};
   for(const e of ev){ if(!e.r)continue; const g=Math.round(e.B*4)/4; (grid[g]=grid[g]||new Set()).add(e.r.name); }
   const slots=Object.values(grid), stacked=slots.filter(x=>x.size>=3).length;
   // mix spread
   let mb=[];try{const src=(typeof MB!=='undefined'&&MB&&MB.g)?MB.g:((typeof bal!=='undefined'&&bal&&bal.g)?bal.g:null);
     if(src)mb=Object.values(src).filter(x=>typeof x==='number')}catch(e){}
   DIAG={
     parts:info, voices:Object.keys(info).length,
     registerCollisionPairs:collide, registerPairs:pairs,
     registerCollisionShare:pairs?+(collide/pairs).toFixed(2):0,
     chordToneShare:noteTot?+(chordTone/noteTot).toFixed(2):null,
     outOfKeyShare:noteTot?+((noteTot-chordTone-inScale)/noteTot).toFixed(2):null,
     lowNotes:lowN, highNotes:highN,
     lowShare:noteTot?+(lowN/noteTot).toFixed(2):0, highShare:noteTot?+(highN/noteTot).toFixed(2):0,
     onsetSlots:slots.length, stackedOnsets:stacked,
     stackedOnsetShare:slots.length?+(stacked/slots.length).toFixed(2):0,
     gainSpreadDb:mb.length?+(Math.max(...mb)-Math.min(...mb)).toFixed(1):null
   };
  }catch(err){DIAG={error:String(err).slice(0,120)}}
""" + anchor)

rep("meta.detail={seed:o.seed,","meta.detail={diagnostics:DIAG,seed:o.seed,")
open(p,'w',encoding='utf-8').write(s)
print('ok 23')
