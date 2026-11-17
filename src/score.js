/* ---------- score arranger: how closely a bed follows its public-domain source ----------
   F = 1: the score as written (its melody, its chords with their real timing, its bass line).
   F = 0: a new composition from the score: the opening motif developed (sequence, inversion,
   retrograde, augmentation), reharmonised with Tonal's key vocabulary under the source's
   phrase and cadence plan. In between, each layer moves by degrees.
   Everything here is in pitch relative to the tonic, and in beats from the start of the bed. */
const TYPEQ={'major':'maj','minor':'m','dominant seventh':'7','major seventh':'maj7','minor seventh':'m7','half-diminished':'hdim','diminished':'dim','diminished seventh':'dim7','suspended fourth':'sus4','suspended second':'sus2'};
function tonalVocab(mode,jazzy){const T=window.Tonal,out=[],seen=new Set();
 const add=(sym,w,fn)=>{if(!sym)return;let rel,q;if(T){const c=T.Chord.get(sym);if(!c||c.empty)return;q=TYPEQ[c.type];if(!q||!Q[q])return;rel=T.Note.chroma(c.tonic)}else return;const k=rel+':'+q;if(seen.has(k))return;seen.add(k);out.push({rel,q,w,fn,pcs:Q[q].map(x=>(rel+x)%12)})};
 if(T){if(mode=='min'||mode=='dor'){const k=T.Key.minorKey('C');const W=[1,.15,.55,.75,.45,.6,.65];k.natural.triads.forEach((s,i)=>add(s,W[i],'d'+i));add('G',.75,'V');add('G7',.6,'V7');if(mode=='dor')add('F',.7,'IV');if(jazzy){k.natural.chords.forEach((s,i)=>add(s,W[i]*.8,'d'+i));add('Dm7b5',.45,'ii')}}
  else{const k=T.Key.majorKey('C');const W=[1,.6,.3,.85,.9,.75,.05];k.triads.forEach((s,i)=>add(s,W[i],'d'+i));
   if(jazzy){k.chords.forEach((s,i)=>add(s,W[i]*.85,'d'+i));k.secondaryDominants.forEach((s,i)=>add(s,.32,'sec'+i));k.substituteDominants.forEach((s,i)=>add(s,.12,'sub'+i))}
   else{k.secondaryDominants.forEach((s,i)=>i>=1&&i<=5&&add(s,.18,'sec'+i));add('Bb',mode=='mix'?.85:.28,'bVII');add('Fm',.18,'iv');add('Ab',.14,'bVI')}
   if(mode=='mix')add('Gm',.5,'v')}}
 if(!out.length){const sc=SC[mode]||SC.maj;for(let i=0;i<7;i++){const r=sc[i],t=sc[(i+2)%7],f=sc[(i+4)%7],q=(mod(t-r,12)==4&&mod(f-r,12)==7)?'maj':(mod(t-r,12)==3&&mod(f-r,12)==7)?'m':'dim';out.push({rel:r,q,w:i==0?1:.6,fn:'d'+i,pcs:Q[q].map(x=>(r+x)%12)})}}
 return out}
function scorePlan(piece,F,S,R,H,need,mode){
 const f=1-F,sc=SC[mode]||SC.maj,meter=piece.meter||[piece.bar==3?3:4,4],compound=meter[1]==8&&meter[0]%3==0,beatQ=compound?1.5:1,bpbQ=piece.bar,bpb=Math.round(bpbQ/beatQ),triple=bpb==3;
 // beats per source bar after mapping: duple metres keep their rhythm exactly; triple metres are re-barred into four
 const barB=triple?4:bpb,L2q=Math.ceil(piece.len/bpbQ-1e-6)*bpbQ,L2B=(L2q/bpbQ)*barB;
 const qToB=q=>{const bar=Math.floor(q/bpbQ+1e-9),pos=(q-bar*bpbQ)/beatQ;const b=triple?(pos<1?pos*2:2+(pos-1)):pos;return bar*barB+b};
 // where in the score to start: a phrase start that lets a phrase end land near the end of the bed
 const pe=(piece.phr&&piece.phr.length?piece.phr:[piece.len]).map(qToB);
 const starts=[...new Set([0,...pe].map(ps=>{const n=piece.mel.find(m=>qToB(m[0])>=ps-1e-6);return n?Math.ceil(qToB(n[0])/barB-.01)*barB:null}).filter(x=>x!=null&&x<L2B))];
 let p0=0,best=-1e9;for(const s0 of starts){const e=s0+need;let dd=1e9;for(const q of pe)dd=Math.min(dd,Math.abs(q-e));if(e>L2B+1e-6)dd+=2;const v=-dd-.012*s0+R()*.6;if(v>best){best=v;p0=s0}}
 const span=need+16,loops=Math.ceil((p0+span)/L2B)+1;
 const seq=(arr,withEnd)=>{const out=[];for(let k=0;k<loops;k++)for(const n of arr){const a=qToB(n[0])+k*L2B-p0,b=qToB(n[0]+n[1])+k*L2B-p0;if(b<-8||a>span)continue;out.push([a,Math.max(.12,b-a),...n.slice(2)])}return out.sort((x,y)=>x[0]-y[0])};
 const srcMel=seq(piece.mel),srcCh=seq(piece.chords),srcBass=piece.bass&&piece.bass.length?seq(piece.bass):null;
 const phrB=[];for(let k=0;k<loops;k++)for(const q of pe)phrB.push(q+k*L2B-p0);
 const deg=rel=>{let bd=99,bi=0;for(let k=-21;k<=35;k++){const v=12*Math.floor(k/7)+sc[mod(k,7)];const d=Math.abs(v-rel);if(d<bd){bd=d;bi=k}}return bi},fromDeg=k=>12*Math.floor(k/7)+sc[mod(k,7)];
 // ---- harmony ----
 const srcAt=B=>{let c=null;for(const x of srcCh){if(x[0]<=B+1e-6)c=x;else break}return c||srcCh[0]};
 let chords;
 if(F>=.66){chords=[];for(const x of srcCh){if(chords.length&&x[1]<.5&&F<.9){continue}chords.push({B:x[0],rel:x[2],bass:x[3],q:x[4],src:1})}}
 else{const jazzy=['jazz','soul','lofi','bossa'].includes(S.color),V=tonalVocab(mode,jazzy),step=2,n=Math.ceil((span+8)/step),lam=2.4*F/.66;
  const em=[];for(let i=0;i<n;i++){const a=i*step-8,b=a+step,src=srcAt(a+.01);em.push(V.map(c=>{let s=0,W=0;for(const m of srcMel){const x0=Math.max(m[0],a),x1=Math.min(m[0]+m[1],b);if(x1<=x0)continue;const strong=Math.abs(m[0]-a)<1e-6?1.8:Math.abs(mod(m[0],1))<1e-6?1.25:1,w=(x1-x0)*strong,pc=mod(m[2],12);s+=w*(c.pcs.includes(pc)?1:sc.includes(pc)?-.2:-1);W+=w}
   let v=(W?s/W:0)*2.2+c.w*.5+R()*.18;if(src&&c.rel==src[2]&&(c.q==src[4]||Q[c.q]&&Q[src[4]]&&Q[c.q][1]==Q[src[4]][1]))v+=lam;const end=phrB.some(p=>Math.abs(p-b)<.6);if(end&&c.rel==0)v+=1.1;return v}))}
  const NV=V.length,Vt=[],Bk=[];Vt.push(em[0].slice());Bk.push(new Array(NV).fill(0));
  for(let i=1;i<n;i++){const row=new Array(NV).fill(-1e9),bk=new Array(NV).fill(0);for(let j=0;j<NV;j++)for(let k=0;k<NV;k++){const a=V[k],b=V[j];let t=Vt[i-1][k]+(j==k?.2:0);const dn=mod(a.rel-b.rel,12);if(j!=k){if(dn==7)t+=.38;else if(dn==2||dn==10)t+=.1}if(a.fn&&a.fn.startsWith('sec')&&mod(a.rel-b.rel,12)!=7)t-=1.2;if(a.fn&&a.fn.startsWith('sub')&&mod(a.rel-b.rel,12)!=1)t-=1.2;if(j!=k&&mod(i*step,4)>1e-6)t-=.3;if(t>row[j]){row[j]=t;bk[j]=k}}for(let j=0;j<NV;j++)row[j]+=em[i][j];Vt.push(row);Bk.push(bk)}
  let j=0;for(let k=1;k<NV;k++)if(Vt[n-1][k]>Vt[n-1][j])j=k;const path=[j];for(let i=n-1;i>0;i--){j=Bk[i][j];path.push(j)}path.reverse();
  chords=[];path.forEach((j,i)=>{const c=V[j],B=i*step-8;if(chords.length&&chords[chords.length-1].rel==c.rel&&chords[chords.length-1].q==c.q)return;chords.push({B,rel:c.rel,bass:c.rel,q:c.q})})}
 const chAt=B=>{let c=chords[0];for(const x of chords){if(x.B<=B+1e-6)c=x;else break}return c};
 const ctOf=c=>Q[c.q].map(x=>(c.rel+x)%12);
 // ---- melody ----
 let mel=srcMel.map(m=>({B:m[0],d:m[1],rel:m[2]}));
 const strongB=B=>Math.abs(mod(B,2))<1e-6;
 // keep strong-beat notes inside a new harmony (only when the harmony moved away from the source)
 if(F<.66)for(const m of mel){if(!strongB(m.B))continue;const c=chAt(m.B),ct=ctOf(c);if(ct.includes(mod(m.rel,12)))continue;for(const dd of[-1,1,-2,2]){const r2=fromDeg(deg(m.rel)+(dd>0?1:-1)*Math.ceil(Math.abs(dd)/2));if(ct.includes(mod(r2,12))){m.rel=r2;break}}}
 // development: units of two bars after the first statement are transformed with growing freedom
 const unit=8,motif=mel.filter(m=>m.B>=0&&m.B<unit).map(m=>({o:m.B,d:m.d,k:deg(m.rel)}));
 if(f>.45&&motif.length>=3){const gen=clamp((f-.45)/.55,0,1),out=mel.filter(m=>m.B<unit);
  for(let u=unit;u<span;u+=unit){const src=mel.filter(m=>m.B>=u&&m.B<u+unit);if(R()>gen&&src.length){out.push(...src);continue}
   const op=H.pick(['seq','seq','inv','retro','aug','orig','dim']),c0=chAt(u),k0=motif[0].k,shift=op=='seq'?H.pick([-2,-1,1,2,3]):0;
   let notes=motif.map(n=>({o:n.o,d:n.d,k:n.k}));
   if(op=='inv')notes=notes.map(n=>({...n,k:2*k0-n.k}));
   if(op=='retro'){const tot=notes.length;notes=notes.map((n,i)=>({o:n.o,d:n.d,k:motif[tot-1-i].k}))}
   if(op=='aug')notes=notes.filter(n=>n.o<unit/2).map(n=>({o:n.o*2,d:n.d*2,k:n.k}));
   if(op=='dim'){const half=notes.map(n=>({o:n.o/2,d:n.d/2,k:n.k}));notes=half.concat(half.map(n=>({...n,o:n.o+unit/2,k:n.k+1})))}
   // aim the unit at the chord: move the whole shape so its first note is a chord tone
   const ct=ctOf(c0);let best2=0,bd2=99;for(let s2=-4;s2<=4;s2++){const r2=fromDeg(notes[0].k+shift+s2);if(ct.includes(mod(r2,12))&&Math.abs(s2)<bd2){bd2=Math.abs(s2);best2=s2}}
   for(const n of notes){const B=u+n.o;if(B>=span)continue;let r2=fromDeg(n.k+shift+best2);const c=chAt(B),ctt=ctOf(c);if(strongB(B)&&!ctt.includes(mod(r2,12))){for(const s3 of[1,-1,2,-2]){if(ctt.includes(mod(fromDeg(n.k+shift+best2+s3),12))){r2=fromDeg(n.k+shift+best2+s3);break}}}out.push({B,d:n.d,rel:r2})}}
  mel=out.sort((a,b)=>a.B-b.B)}
 // ornament and push: passing and neighbour tones, anticipations
 if(f>.12){const out=[];for(let i=0;i<mel.length;i++){const m=mel[i],nx=mel[i+1];out.push(m);if(!nx)continue;const gap=nx.B-m.B,dk=deg(nx.rel)-deg(m.rel);
   if(m.d>=1&&gap>=1&&Math.abs(dk)==2&&R()<.5*f){m.d=gap/2;out.push({B:m.B+gap/2,d:gap/2,rel:fromDeg(deg(m.rel)+Math.sign(dk))})}
   else if(m.d>=2&&R()<.25*f){const h=m.d/2;m.d=h*.5;out.push({B:m.B+h*.5,d:h*.5,rel:fromDeg(deg(m.rel)+1)},{B:m.B+h,d:h,rel:m.rel})}}
  mel=out;for(const m of mel)if(strongB(m.B)&&m.B>.5&&m.d>=1&&R()<.35*f*(S.push||.35)/.35){m.B-=.5;m.d+=.5}}
 // a harmony voice a diatonic third or sixth away on long notes: more of it as the arrangement opens up
 const harm=[];if(f>.15&&f<.95)for(const m of mel){if(m.d<1||R()>.6*Math.min(1,f*1.6))continue;const c=chAt(m.B),ct=ctOf(c);for(const dk of[-2,-5,2]){const r2=fromDeg(deg(m.rel)+dk);if(ct.includes(mod(r2,12))){harm.push({B:m.B,d:m.d,rel:r2});break}}}
 const bass=F>=.75&&srcBass?srcBass.map(m=>({B:m[0],d:m[1],rel:m[2]})):null;
 return{mel,harm,chords,bass,p0,barB,triple,compound,chAt,L2B}}
