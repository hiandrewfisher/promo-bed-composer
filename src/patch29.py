p='index.html'; s=open(p,encoding='utf-8').read()
def rep(old,new):
    global s
    assert s.count(old)==1,('ANCHOR x%d: '%s.count(old))+old[:90]
    s=s.replace(old,new)

# Derive the groove from the SEED PIECE itself, so the generated parts and the
# source score share one rhythmic signature instead of two unrelated ones.
old = "    const SPB=0.25, LOCK=/^(keys|pulse|color|riff|counter|dbl|arp|pluck|bass)[0-9]*$/;"
new = """    const SPB=0.25, LOCK=/^(keys|pulse|color|riff|counter|dbl|arp|pluck|bass)[0-9]*$/;
    // --- fit a Euclidean cell to the seed's own rhythm ---
    // Histogram the score's onsets over the 16 steps of a bar, then pick the
    // E(k,16) rotation that best matches it. The groove then comes from the
    // piece rather than from a dice roll.
    function fitCell(list,fallbackK){
      const hist=new Array(16).fill(0);
      let n=0;
      for(const ev2 of (list||[])){
        const b=ev2[0]; if(typeof b!=='number')continue;
        const step=Math.round((b%4)/SPB)%16;
        hist[((step%16)+16)%16]++; n++;
      }
      if(n<8) return null;
      const active=hist.filter(x=>x>0).length;
      let k=Math.max(2,Math.min(13,active||fallbackK));
      let bestCell=null,bestScore=-1,bestK=k,bestRot=0;
      const total=hist.reduce((a,b)=>a+b,0)||1;
      for(let kk=Math.max(2,k-2);kk<=Math.min(13,k+2);kk++){
        const base=EUC(kk,16);
        for(let r=0;r<16;r++){
          const c=rot(base,r);
          let sc=0;
          for(let i=0;i<16;i++) sc += c[i]? hist[i]/total : -0.35*(hist[i]/total);
          if(sc>bestScore){bestScore=sc;bestCell=c;bestK=kk;bestRot=r}
        }
      }
      return bestCell?{cell:bestCell,k:bestK,rot:bestRot,fit:+bestScore.toFixed(3)}:null;
    }
    let SEEDFIT=null, SEEDBASS=null;
    try{
      if(piece&&piece.mel) SEEDFIT=fitCell(piece.mel,5);
      if(piece&&piece.bass) SEEDBASS=fitCell(piece.bass,3);
    }catch(e){}"""
rep(old,new)

# use the seed's cell for melodic roles, the seed's bass cell for the low end
old2 = """      const k=ks[Math.floor(Math.abs(Math.sin((o.seed||1)*(base.length+3)))*ks.length)%ks.length];
      const cell=rot(EUC(k,16),EUC_ROT[base]||0);"""
new2 = """      let cell,k;
      const seedSrc = /^bass|^sub/.test(base) ? (SEEDBASS||SEEDFIT) : (SEEDFIT||SEEDBASS);
      if(seedSrc){
        // every part shares the seed's signature, rotated so they interlock
        k=seedSrc.k;
        cell=rot(seedSrc.cell,EUC_ROT[base]||0);
      }else{
        k=ks[Math.floor(Math.abs(Math.sin((o.seed||1)*(base.length+3)))*ks.length)%ks.length];
        cell=rot(EUC(k,16),EUC_ROT[base]||0);
      }"""
rep(old2,new2)

# record what was derived, so it is inspectable rather than a black box
rep("try{window.__glock={moved,made,cut,roles:Array.from(locked)}}catch(e){}",
    "try{window.__glock={moved,made,cut,roles:Array.from(locked),\n"
    "      seedFit:SEEDFIT&&{k:SEEDFIT.k,rot:SEEDFIT.rot,fit:SEEDFIT.fit,cell:SEEDFIT.cell.map(x=>x?'x':'.').join('')},\n"
    "      seedBass:SEEDBASS&&{k:SEEDBASS.k,rot:SEEDBASS.rot,fit:SEEDBASS.fit,cell:SEEDBASS.cell.map(x=>x?'x':'.').join('')},\n"
    "      piece:piece&&piece.title}}catch(e){}")

# carry it into the export for later analysis
rep("     DIAG.voiceBandShare=",
    "     try{DIAG.groove=window.__glock||null}catch(e){}\n     DIAG.voiceBandShare=")
open(p,'w',encoding='utf-8').write(s)
print('ok 29')
