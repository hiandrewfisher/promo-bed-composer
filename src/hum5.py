import io,sys
f='engine.js';s=io.open(f,encoding='utf-8').read()
a=" {const byRole={};for(const e of ev.filter(e=>SCOOPK.has(e.r.kind)&&(e.r.name=='lead'||e.r.name=='dbl')"
if s.count(a)!=1: print('ANCHOR x%d'%s.count(a));sys.exit(1)

BLOCK = r"""
 // ---- harmonizer, scalar ladders and gap filler -------------------------------
 // the scale is inferred from the arrangement's own pitch histogram, so every added
 // note is quantised to notes the piece already uses, plus the chord sounding under it.
 {const mo=x=>((x%12)+12)%12,H12=new Array(12).fill(0);
  for(const e of ev)H12[mo(e.m)]++;
  const tn=ev.length||1,SCA=[];for(let i=0;i<12;i++)if(H12[i]/tn>=.025)SCA.push(i);
  const okScale=p=>SCA.length<3||SCA.includes(mo(p));
  const chordOf=B=>{const c=cAt(B);return (c&&c.pcs)||[]};
  const stepDown=(from,B,limit)=>{const pcs=chordOf(B);for(let m=from;m>from-limit;m--)if(pcs.includes(mo(m)))return m;return null};
  const quiet=B=>{try{return vA(B)<.3}catch(e){return true}};
  const add=o=>ev.push(o);

  // 1. harmonizer: a second voice under the lead, nearest chord tone, never parallel,
  //    never closer than a minor third, 72% velocity, its own timing and tuning.
  const LD=ev.filter(e=>e.r.name=='lead'&&!e.r.fx&&!e.sym).sort((a,b)=>a.B-b.B);
  if(LD.length&&(o.song||{}).harm!==0){
   const reg=LD[0].r.reg||[40,90];let prev=null,prevLead=null,added=0;
   for(const e of LD){
    if(e.d<.75||e.v<.25)continue;
    if(added>LD.length*.6)break;
    let cand=stepDown(e.m-3,e.B,9);
    if(cand==null||!okScale(cand))cand=stepDown(e.m-3,e.B,13);
    if(cand==null)continue;
    const alt=stepDown(cand-1,e.B,6);
    // prefer the smaller move from the last harmony note, and refuse parallel motion
    if(prev!=null&&alt!=null&&Math.abs(alt-prev)<Math.abs(cand-prev))cand=alt;
    if(prev!=null&&prevLead!=null&&(e.m-prevLead)!==0&&(cand-prev)===(e.m-prevLead)&&Math.abs(cand-prev)>0){
      const other=stepDown(cand-1,e.B,6);if(other!=null&&e.m-other>=3)cand=other}
    if(e.m-cand<3||cand<reg[0]-2)continue;
    add({...e,m:cand,v:e.v*.72,dt:(e.dt||0)+H.rg(-14,14),det:(e.det||0)+H.rg(-5,5),uni:9,sc:Math.round((e.sc||0)*.6)});
    prev=cand;prevLead=e.m;added++}}

  // 2. scalar ladders: a short accelerating run into a wide upward leap or the first
  //    note after a rest. only into long notes, never into fast passages, and rationed
  //    to roughly one phrase in five the way a player would.
  for(const nm of['lead','dbl','counter']){
   const P2=ev.filter(e=>e.r.name==nm&&!e.r.fx&&!e.sym&&!e.uni).sort((a,b)=>a.B-b.B);
   let lastLad=-99;
   for(let i=0;i<P2.length;i++){
    const e=P2[i],pv=i?P2[i-1]:null;
    if(e.d<1||e.B-lastLad<4||e.B<1)continue;
    const gap=pv?e.B-(pv.B+pv.d):9,leap=pv?e.m-pv.m:0;
    if(!(gap>=.5||leap>=5))continue;
    if(!H.ch(.22))continue;
    const room=Math.min(gap>=.5?gap*.75:.5,.75);if(room<.18)continue;
    const steps=2+(H.ch(.5)?1:0)+(H.ch(.25)?1:0);
    const pcs=chordOf(e.B);let m=e.m,tones=[];
    for(let k=0;k<steps;k++){let nx=null;
     for(let q=m-1;q>m-4;q--)if(okScale(q)&&(pcs.includes(mo(q))||SCA.includes(mo(q)))){nx=q;break}
     if(nx==null)break;tones.unshift(nx);m=nx}
    if(tones.length<2)continue;
    // spacing tightens toward the target: a human accelerates into the landing note
    const spans=[];let acc=0;
    for(let k=tones.length-1;k>=0;k--){const w=(.020+.012*(tones.length-1-k))/bl;acc+=w;spans.unshift(acc)}
    if(acc>room)continue;
    tones.forEach((p,k)=>add({r:e.r,B:e.B-spans[k],d:spans[k]-(k<tones.length-1?spans[k+1]:0)+.012/bl,
      m:p,v:clamp(e.v*(.42+.42*k/Math.max(1,tones.length-1)),.05,1),dt:(e.dt||0)+H.rg(-6,6),leg2:1,lad:1}));
    e.leg2=1;lastLad=e.B}}

  // 3. sparse-gap filler: when the lead rests for half a beat or more AND the read is
  //    quiet, a supporting part puts two or three chord tones in the hole. it never
  //    plays over the voice, and it stops the moment the lead comes back.
  if(LD.length){
   const host=ev.find(e=>['keys','riff','pulse','color'].includes(e.r.name)&&!e.r.fx);
   if(host){const hreg=host.r.reg||[55,79];let fills=0;
    for(let i=0;i<LD.length-1;i++){
     const a0=LD[i].B+LD[i].d,b0=LD[i+1].B,gap=b0-a0;
     if(gap<1.2||gap>8||fills>=4)continue;
     if(!quiet(a0+gap*.5))continue;
     if(!H.ch(.5))continue;
     const pcs=chordOf(a0+.25);if(!pcs.length)continue;
     const n2=2+(H.ch(.4)?1:0),step=Math.min(.5,(gap-.4)/n2);
     for(let k=0;k<n2;k++){const B2=a0+.3+k*step;
      if(B2+step>=b0-.15)break;
      let p=null;for(let q=hreg[0]+((hreg[1]-hreg[0])>>1)+k*2;q<hreg[1];q++)if(pcs.includes(mo(q))){p=q;break}
      if(p==null)continue;
      add({r:host.r,B:B2,d:step*.85,m:p,v:clamp(LD[i].v*.55*(1-.35*k),.05,1),dt:(host.dt||0)+H.rg(-10,10),fill:1})}
     fills++}}}
 }
"""
s=s.replace(a, BLOCK+a)
io.open(f,'w',encoding='utf-8').write(s);print('harmonizer/ladders/filler ok')
