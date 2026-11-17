/* ---------- the arranger: plan the song first, then fill it ----------
   1. Form: intro, verse under the read, a lift after it, a dominant into the final hit (the cadence lives in compose).
   2. Harmony: one proven chord loop, chosen because it fits the source melody's structural notes; at the
      "as written" end the source's own bar-by-bar harmony is the favourite. The lift may move to a related loop.
   3. Hook: the source's opening motif, simplified to an even rhythm grid and fitted to the loop. It answers the
      read in its pauses and is stated in full (statement + answer) in the lift. No melody runs under the voice. */
function arrangePlan(piece,F,S,R,H,ctx,mode){
 const{bbB,ib,postB,gaps}=ctx,sc=SC[mode]||SC.maj,isMin=mode=='min'||mode=='dor';
 const meter=piece.meter||[piece.bar==3?3:4,4],compound=meter[1]==8&&meter[0]%3==0,beatQ=compound?1.5:1,bpbQ=piece.bar,bpb=Math.round(bpbQ/beatQ),triple=bpb==3;
 const barB=triple?4:bpb,L2q=Math.ceil(piece.len/bpbQ-1e-6)*bpbQ,L2B=(L2q/bpbQ)*barB;
 const qToB=q=>{const bar=Math.floor(q/bpbQ+1e-9),pos=(q-bar*bpbQ)/beatQ;const b=triple?(pos<1?pos*2:2+(pos-1)):pos;return bar*barB+b};
 // start at the top of the piece (where its main motif is) unless reimagining, then any phrase start
 const pe=(piece.phr&&piece.phr.length?piece.phr:[piece.len]).map(qToB);
 const starts=[...new Set([0,...pe].map(ps=>{const n=piece.mel.find(m=>qToB(m[0])>=ps-1e-6);return n?Math.ceil(qToB(n[0])/barB-.01)*barB:null}).filter(x=>x!=null&&x<L2B-8))];
 const HKs=(piece.hk||[]).map(h=>Math.round(qToB(h[0])/barB)*barB).filter(x=>x>=0&&x<L2B-8),p0=HKs.length?(F>=.5?HKs[0]:HKs[Math.floor(R()*HKs.length)]):(F>=.5||starts.length<2?(starts[0]||0):H.pick(starts));
 const seq=arr=>{const out=[];for(let k=0;k<3;k++)for(const n of arr){const a=qToB(n[0])+k*L2B-p0,b=qToB(n[0]+n[1])+k*L2B-p0;if(b<0||a>64)continue;out.push([a,Math.max(.12,b-a),...n.slice(2)])}return out.sort((x,y)=>x[0]-y[0])};
 const src=seq(piece.mel),srcCh=seq(piece.chords);
 const deg=rel=>{let bd=99,bi=0;for(let k=-21;k<=35;k++){const v=12*Math.floor(k/7)+sc[mod(k,7)];const d=Math.abs(v-rel);if(d<bd){bd=d;bi=k}}return bi},fromDeg=k=>12*Math.floor(k/7)+sc[mod(k,7)];
 // ---- structural notes of the first eight bars (for fitting the harmony) ----
 const skel=[];for(let w=0;w<64;w+=1){const inW=src.filter(m=>m[0]>=w-1e-6&&m[0]<w+1-1e-6);if(!inW.length)continue;let b=inW[0],bs=-1;for(const m of inW){const v=Math.min(m[1],1)+(Math.abs(m[0]-w)<1e-6?.6:0);if(v>bs){bs=v;b=m}}skel.push({B:w,rel:b[2],w:(mod(w,4)<1e-6?2:mod(w,2)<1e-6?1.3:.8)*Math.min(1.5,b[1]+.25)})}
 // ---- chord loops: the genre's pool plus the source's own bar-level harmony ----
 const fam=PROGS[S.prog]||PROGS.pop,base=[...new Set([...(isMin?fam.min:fam.maj),...(isMin?PROGS.pop.min:PROGS.pop.maj)])];
 const parse=sym=>{const c=chord(sym,0);return{rel:c.rel,q:c.q}};
 const loops=base.map(p=>({ch:p.split(' ').map(parse),src:0}));
 {const sl=[];for(let b=0;b<4;b++){const a=b*4,e=a+4;let bc=null,bo=0;for(const x of srcCh){const ov=Math.min(e,x[0]+x[1])-Math.max(a,x[0]);if(ov>bo){bo=ov;bc=x}}if(bc){const q=['maj','m','7','dim'].includes(bc[4])?bc[4]:['maj7','add9','6'].includes(bc[4])?'maj':['m7','m9','madd9'].includes(bc[4])?'m':'maj';sl.push({rel:bc[2],q})}}
  if(sl.length==4&&new Set(sl.map(c=>c.rel)).size>=2)loops.push({ch:sl,src:1})}
 const fitLoop=(lp,rot)=>{let s=0,W=0;for(const n of skel){const c=lp.ch[mod(Math.floor(n.B/4)+rot,lp.ch.length)],ct=Q[c.q].map(x=>(c.rel+x)%12),pc=mod(n.rel,12);s+=n.w*(ct.includes(pc)?1:sc.includes(pc)?-.12:-1);W+=n.w}return W?s/W:0};
 const scored=[];for(const lp of loops)for(let rot=0;rot<lp.ch.length;rot++){if(lp.src&&rot)continue;const first=lp.ch[rot%lp.ch.length];let v=fitLoop(lp,rot)+(lp.src?1.1*F:0)+(first.rel==0?.12:0)+R()*.1;scored.push({v,ch:lp.ch.slice(rot).concat(lp.ch.slice(0,rot)),src:lp.src})}
 scored.sort((a,b)=>b.v-a.v);const pickTop=n=>{const t=scored.slice(0,n);return t[Math.min(t.length-1,Math.floor(R()*R()*t.length))]};
 const verse=pickTop(F>=.7?1:3);let lift=verse;
 if(F<.85){const alt=scored.filter(x=>x.v>verse.v-.35&&x.ch[0].rel!=verse.ch[0].rel);if(alt.length)lift=alt[0]}
 // ---- harmony by phrase: the song has sections, each with its own functional progression and cadence ----
 // verse phrases alternate an open ending (half cadence on the dominant) and a closed one (back home);
 // a contrasting phrase starts away from home; two bars of build (predominant, then the dominant of the dominant)
 // lead into the lift, which gets its own stronger progression. Chords are chosen per bar to fit the source melody.
 const liftBar=Math.round(postB/4)*4,nb=Math.ceil(bbB/4)+2,jz=['jazz','soul','lofi','bossa','gospel'].includes(S.color)||['soul','jazz','gospel'].includes(S.prog);
 const FN=mode=='dor'?{T:[[0,'m'],[3,'maj']],PD:[[5,'maj'],[2,'m'],[10,'maj']],D:[[7,'m'],[10,'maj']]}:mode=='mix'?{T:[[0,'maj'],[9,'m']],PD:[[5,'maj'],[2,'m']],D:[[10,'maj'],[7,'m']]}:
  isMin?{T:[[0,'m'],[8,'maj'],[3,'maj']],PD:[[5,'m'],[8,'maj'],[2,'dim']],D:[[7,'7'],[7,'maj'],[10,'maj']]}:{T:[[0,'maj'],[9,'m'],[4,'m']],PD:[[5,'maj'],[2,'m']],D:[[7,'maj'],[7,'7']]};
 const TPL={A:[['T','PD','D','D'],['T','T','PD','D'],['T','D','PD','D']],A2:[['T','PD','D','T'],['T','PD','PD','T'],['T','D','PD','T']],B:[['PD','T','PD','D'],['T','PD','T','D'],['PD','D','T','PD']],C:[['PD','T','D','T'],['T','D','T','PD'],['PD','D','T','T'],['T','PD','D','T']]};
 const srcBar=b=>skel.filter(n=>n.B>=b*4&&n.B<b*4+4);
 const fitC=(rel,q,notes)=>{const ct=Q[q].map(x=>(rel+x)%12);let s2=0,W=0;for(const n of notes){const pc=mod(n.rel,12);s2+=n.w*(ct.includes(pc)?1:sc.includes(pc)?-.15:-1);W+=n.w}return W?s2/W:0};
 const srcRelAt=bar=>{let bc=null,bo=0;const a=bar*4,e=a+4;for(const x of srcCh){const ov=Math.min(e,x[0]+x[1])-Math.max(a,x[0]);if(ov>bo){bo=ov;bc=x}}return bc?bc[2]:null};
 const pickFn=(fn,notes,prev,first,sb)=>{let best=null,bv=-1e9;const sr=srcRelAt(sb);for(const[rel,q]of FN[fn]){let v=fitC(rel,q,notes)+(sr!=null&&sr==rel?.55+.7*F:0)+(first&&fn=='T'&&rel==0?.6:0)+(prev&&prev.rel==rel?-.5:0)+(prev&&mod(prev.rel-rel,12)==7?.25:0)+R()*.25;if(v>bv){bv=v;best={rel,q}}}return best};
 const plan=[];let b=0,ph=0;const verseBars=Math.max(0,liftBar/4);
 while(b<verseBars){const left=verseBars-b;const kind=left<=2&&verseBars>=6?'pre':ph%4==0?'A':ph%4==1?'A2':ph%4==2?'B':'A2';
  if(kind=='pre'){for(let k=0;k<left;k++)plan.push({bar:b+k,fn:k==left-1?'D':'PD',sec:'pre'});b+=left;break}
  const tpl=H.pick(TPL[kind]),n=Math.min(4,left);for(let k=0;k<n;k++)plan.push({bar:b+k,fn:tpl[k],sec:ph==0?'verse1':'verse2',end:k==n-1});
  // a verse that runs straight into the lift ends on the dominant
  b+=n;ph++}
 if(verseBars>=6&&!plan.some(p=>p.sec=='pre')){const l=plan[plan.length-1];if(l)l.fn='D'}
 for(let k=0;b<nb;b++,k++){const tpl=TPL.C[(k>>2)%TPL.C.length==0?H.pick([0,1,2,3]):(k>>2)%4];plan.push({bar:b,fn:tpl[k%4],sec:'lift'})}
 const chords=[];let prev=null;
 for(let B=Math.floor(-ib/4)*4;B<0;B+=4){chords.push({B,rel:FN.T[0][0],bass:FN.T[0][0],q:FN.T[0][1]})}
 for(const p of plan){const srcIdx=p.sec=='lift'?(p.bar-verseBars):p.bar,notes=srcBar(mod(srcIdx,16));const c=pickFn(p.fn,notes,prev,p.bar==0||p.bar==verseBars,mod(srcIdx,16));
  // movement inside the bar: before a minor target (ii or vi) or the dominant, the second half becomes its own dominant
  const nx=plan.find(q=>q.bar==p.bar+1);let half=null;
  if(nx&&p.sec!='lift'&&H.ch(jz?.4:.22)){const tgt=FN[nx.fn][0];if(tgt&&tgt[0]!=0&&!(isMin&&tgt[0]==7)){half={rel:(tgt[0]+7)%12,q:'7'}}}
  chords.push({B:p.bar*4,rel:c.rel,bass:c.rel,q:c.q,sec:p.sec});if(half)chords.push({B:p.bar*4+2,rel:half.rel,bass:half.rel,q:half.q,sec:p.sec});prev=half||c}
 const secs=[];for(const p of plan){const l=secs[secs.length-1];if(l&&l.k==p.sec)l.B1=p.bar*4+4;else secs.push({k:p.sec,B0:p.bar*4,B1:p.bar*4+4})}
 const secAt=B=>{for(const x of secs)if(B>=x.B0-1e-6&&B<x.B1)return x.k;return B<0?'intro':'lift'};
 const chAt=B=>{let c=chords[0];for(const x of chords){if(x.B<=B+1e-6)c=x;else break}return c},ctOf=c=>Q[c.q].map(x=>(c.rel+x)%12);
 // ---- the hook: the opening motif, on an even grid, fitted to the loop ----
 const grid=compound?1/3:.5,hookLen=F>=.6?16:8;
 let hk=[];for(const m of src){if(m[0]>=hookLen-1e-6)break;const o=Math.round(m[0]/grid)*grid;if(hk.length&&Math.abs(hk[hk.length-1].o-o)<1e-6)continue;hk.push({o,rel:m[2]})}
 hk=hk.filter((n,i)=>{const nx=hk[i+1];return !nx||nx.o-n.o>=grid-1e-6});
 for(let i=0;i<hk.length;i++)hk[i].d=Math.min((hk[i+1]?hk[i+1].o:hookLen)-hk[i].o,2);
 // fewer notes when the source is busy: keep at most three per beat, preferring strong positions
 if(hk.length>hookLen*1.6){hk=hk.filter(n=>Math.abs(mod(n.o,1))<1e-6||Math.abs(mod(n.o,1)-.5)<1e-6);for(let i=0;i<hk.length;i++)hk[i].d=Math.min((hk[i+1]?hk[i+1].o:hookLen)-hk[i].o,2)}
 // ---- genre phrasing: outside folk styles the source's pitches are re-sung in the genre's own rhythm ----
 let straightOut=compound;{const nm=S.n||'',FAMR=[[/House|Techno|Deep House/,[[0,.75,1.5,2.5,3.25,4,4.75,5.5,6.5],[0,.75,1.5,2.5,3.5,4,4.5,5.25,6]]],
  [/Drum & Bass|Ambient|Chillout|Future Bass|Cinematic|Epic Drive/,[[0,1.5,3,4,5.5],[0,1,2.5,4,6]]],
  [/Synthwave|Trance|EDM|Synth-Pop/,[[0,.5,1,1.5,2.5,3,4,4.5,5,6],[0,.5,1.5,2,3,4,5,5.5,6.5]]],
  [/Funk|Soul/,[[0,.75,1.5,2.25,3,4,4.75,5.5,6.25],[.5,1.25,2,3,4,4.75,5.25,6]]],
  [/Pop|Build|Indie|Keys/,[[0,1,1.5,2.5,3.5,4,5,5.5,6.5],[0,.5,1.5,2.5,4,5,6]]]];
  const fr=F<.9&&!/Folk|Americana|Campfire|World|Chamber|Jazz|Bossa|Lo-fi/.test(nm)?FAMR.find(([r])=>r.test(nm)):null;
  if(fr&&hk.length>=3){const tp=fr[1][Math.floor(R()*fr[1].length)],tp2=fr[1][(fr[1].indexOf(tp)+1)%fr[1].length],at=o=>{let b=hk[0];for(const n of hk){if(n.o<=o+1e-6)b=n;else break}return b.rel};
   const nh=[];for(let o0=0;o0<hookLen;o0+=8){const t=(o0/8)%2?tp2:tp;for(const x of t)if(o0+x<hookLen)nh.push({o:o0+x,rel:at(o0+x)})}
   for(let i=0;i<nh.length;i++)nh[i].d=Math.max(.25,Math.min((nh[i+1]?nh[i+1].o:hookLen)-nh[i].o,2)*.92);hk=nh;straightOut=false}}
 const fitNote=(rel,B,strong)=>{const ct=ctOf(chAt(B));if(strong){if(ct.includes(mod(rel,12)))return rel;for(const dd of[1,-1,2,-2,3,-3])if(ct.includes(mod(rel+dd,12)))return rel+dd}if(sc.includes(mod(rel,12)))return rel;return fromDeg(deg(rel))};
 const place=(at,notes,ending)=>notes.map((n,i)=>{const B=at+n.o,strong=Math.abs(mod(B,2))<1e-6||n.d>=1;let rel=fitNote(n.rel,B,strong);if(ending&&i==notes.length-1){const ct=ctOf(chAt(B));let bb=rel,bd=99;for(let k=-7;k<=7;k++){const r2=rel+k;if(mod(r2,12)==0||(ct.includes(mod(r2,12))&&mod(r2-0,12)==(isMin?3:4))){if(Math.abs(k)<bd){bd=Math.abs(k);bb=r2}}}rel=bb}return{B,d:n.d,rel}});
 // the answer: the same rhythm, its second half moved by a step (sequence) and resolved
 const answer=hk.map(n=>({...n,rel:n.o>=hookLen/2?fromDeg(deg(n.rel)+(F>=.6?0:H.pick([-1,1,2]))):n.rel}));
 const mel=[];
 // in the read's pauses: the head of the hook, as an answer to the voice
 for(const[g0,g1]of gaps){if(g1-g0<.9||g0<0||g1>postB+1)continue;const at=Math.ceil(g0/grid)*grid,room=g1-at+.5,frag=hk.filter(n=>n.o+Math.min(n.d,1)<=room).slice(0,6);if(frag.length>=1)mel.push(...place(at,frag.map((n,i)=>i==frag.length-1?{...n,d:Math.max(n.d,1)}:n),true))}
 {const stp=F>=.75?1:F>=.4?1.5:2,end=Math.min(liftBar,bbB-2),busy=B=>mel.some(m=>B>=m.B-.25&&B<m.B+m.d);let last=null;for(let B=0;B<end-1e-6;B+=stp){if(busy(B)){last=null;continue}const n=src.find(m=>m[0]<=B+1e-6&&m[0]+m[1]>B+1e-6)||src.find(m=>m[0]>B&&m[0]<B+stp*.5);if(!n){last=null;continue}const rel=fitNote(n[2],B,true);if(last&&last.rel===rel&&last.B+last.d>=B-1e-6){last.d+=stp;continue}last={B,d:stp,rel,sim:1};mel.push(last)}for(const m of mel)if(m.sim)m.d=Math.min(m.d,4)}
 // the lift: statement and answer, as long as there is room before the cadence
 for(let at=liftBar,k=0;at<bbB-2-1e-6;at+=hookLen,k++){const body=(k%2?answer:hk).filter(n=>at+n.o<bbB-2-1e-6);mel.push(...place(at,body,k%2==1||at+hookLen>=bbB-2))}
 const harm=[];if(F<.95)for(const m of mel){if(m.B<liftBar||m.d<1)continue;const ct=ctOf(chAt(m.B));for(const dk of[-2,-5]){const r2=fromDeg(deg(m.rel)+dk);if(ct.includes(mod(r2,12))){harm.push({B:m.B,d:m.d,rel:r2});break}}}
 return{mel,harm,chords,bass:null,p0,chAt,barB,triple,compound:straightOut,loop:'phrases',hookLen,secs,secAt}}
