/* Local score repair, arrangement evaluation and PCM quality control. */
(function(root){
'use strict';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),pc=x=>((x%12)+12)%12,mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
const scales={maj:[0,2,4,5,7,9,11],min:[0,2,3,5,7,8,10]},chords={maj:[0,4,7],m:[0,3,7],7:[0,4,7,10],maj7:[0,4,7,11],m7:[0,3,7,10],dim:[0,3,6],sus2:[0,2,7],sus4:[0,5,7],add9:[0,4,7,2],m9:[0,3,7,10,2],maj9:[0,4,7,11,2]};
const nearest=(n,pcs)=>{let best=n,dist=Infinity;for(let i=-12;i<=12;i++)if(pcs.includes(pc(n+i))&&Math.abs(i)<dist){best=n+i;dist=Math.abs(i)}return best};
function repair(p){
 if(!p||!p.mel?.length||!p.chords?.length)throw Error('No reliable melody or harmony extracted');
 if(p.scoreRepair===1)return p;
 const k=pc(Math.round(p.key||0)),mode=p.mode==='min'?'min':'maj',scale=scales[mode],len=Math.max(4,Math.floor((p.len||4)/4)*4);
 // User-library transcription uses absolute pitch classes; arranger uses tonic-relative classes.
 const cs=p.chords.filter(c=>c.length>=5&&c.slice(0,4).every(Number.isFinite)&&c[0]>=0&&c[0]<len&&c[1]>0).sort((a,b)=>a[0]-b[0]).map(c=>{let q=c[4]==='min'?'m':c[4]==='sus'?'sus4':c[4];if(!chords[q]){const iv=root.Tonal?.ChordType?.get(q)?.intervals?.map(x=>root.Tonal.Interval.semitones(x));if(iv?.length&&iv.every(Number.isFinite))chords[q]=iv.map(pc);else q='maj'}let r=pc(c[2]-k),bass=pc(c[3]-k);const notes=chords[q].map(x=>pc(x+r));if(!notes.includes(bass))bass=r;return [c[0],Math.min(c[1],len-c[0]),r,bass,q]});
 if(!cs.length)throw Error('No usable chords');
 const raw=p.mel.filter(n=>n.length>=3&&n.every(Number.isFinite)&&n[0]>=0&&n[0]<len&&n[1]>.12).sort((a,b)=>a[0]-b[0]),mel=[];let prev=null,ci=0,fixes=0;
 for(const n of raw){const t=Math.round(n[0]*4)/4;while(ci+1<cs.length&&cs[ci+1][0]<=t)ci++;const c=cs[ci],ct=chords[c[4]].map(x=>pc(x+c[2])),strong=Math.abs(t-Math.round(t/2)*2)<.01;
  let m=Math.round(n[2]-k);if(prev!==null){while(m-prev>7)m-=12;while(prev-m>7)m+=12}while(m<48)m+=12;while(m>83)m-=12;
  const old=m;m=nearest(m,strong?ct:[...new Set([...scale,...ct])]);if(m!==old)fixes++;
  const d=Math.min(len-t,Math.max(.25,Math.round(n[1]*4)/4));if(d<=0)continue;
  const last=mel[mel.length-1];if(last&&last[0]+last[1]>t)last[1]=Math.max(0,t-last[0]);if(last&&last[1]===0)mel.pop();
  const before=mel[mel.length-1];if(before&&before[2]===m&&Math.abs(before[0]+before[1]-t)<.001)before[1]+=d;else mel.push([t,d,m]);prev=m;
 }
 if(mel.length<4)throw Error('Too little reliable melodic material');
 return {...p,key:k,mode,len,mel,chords:cs,scoreRepair:1,noAudio:1,repair:{notes:mel.length,adjusted:fixes}};
}
function evaluate(c,o){
 const L=o.L,A=o.A||{},S=c.S||{},notes=c.notes.filter(n=>!n.skip&&Number.isFinite(n.m)&&Number.isFinite(n.t)&&Number.isFinite(n.dur)),hits=c.hits||[],roles=new Map(),bins=new Float32Array(Math.max(1,Math.ceil(L*4)));
 let total=0,good=0,clash=0,overflow=0,voice=0,energy=0,leaps=0,steps=0;
 for(const n of notes){const role=n.r?.name||'other';if(!roles.has(role))roles.set(role,[]);roles.get(role).push(n);const w=Math.min(2,n.dur)*Math.max(.1,n.v||.5);total+=w;const ct=c._cAt?.(n.B)?.pcs;const scale=scales[c.meta?.song?.mode]||scales.maj;const inKey=scale.includes(pc(n.m-c.key));good+=w*(inKey?1:.3);if(Array.isArray(ct)&&ct.length&&!ct.includes(pc(n.m))&&Math.abs(n.B-Math.round(n.B))<.1)clash+=w;
  if(n.t+n.dur>L+.06)overflow+=w;const t=n.t-c.offset;const a=t>=0&&t<(A.len||0)?A.act?.[Math.floor(t/(A.actHop||.05))]||0:0;if(/lead|riff|counter|dbl|color/.test(role))voice+=w*a;energy+=w;
  for(let i=Math.max(0,Math.floor(n.t*4));i<Math.min(bins.length,Math.ceil((n.t+n.dur)*4));i++)bins[i]+=w;
 }
 for(const [role,a] of roles){if(!/lead|riff|counter|bass/.test(role))continue;a.sort((x,y)=>x.t-y.t);let prev;for(const n of a){if(prev&&n.t>prev.t+.05){steps++;if(Math.abs(n.m-prev.m)>12)leaps++}prev=n}}
 let jumps=0,active=0;for(let i=0;i<bins.length;i++){if(bins[i]>.05)active++;if(i&&Math.abs(bins[i]-bins[i-1])>Math.max(2,bins[i-1]*2))jumps++}
 const bpm=c.bpm||120,range=S.bpm||[65,150],tempo=clamp(1-Math.max(0,range[0]-bpm,bpm-range[1])/30),target=clamp((A.rate||2.5)*30,range[0],range[1]),pace=clamp(1-Math.abs(bpm-target)/Math.max(50,target));
 const end=c.meta?.button||0,voiceEnd=(c.offset||0)+(A.len||0),tail=Math.max(0,L-voiceEnd);
 const d={harmony:clamp(good/Math.max(.001,total)-.3*clash/Math.max(.001,total)),flow:clamp(1-jumps/Math.max(1,bins.length)*2),voice:clamp(1-2*voice/Math.max(.001,energy))*.65+pace*.35,melody:clamp(1-leaps/Math.max(1,steps)*3),rhythm:clamp(.5+active/Math.max(1,bins.length)*.5),duration:clamp(1-Math.max(0,voiceEnd-L)/Math.max(1,L)-Math.max(0,end-L)/Math.max(1,L)-overflow/Math.max(.001,total)*.3)*(.8+.2*clamp(tail/1.2)),genre:tempo,mix:clamp(1-Math.max(0,roles.size-7)*.1)};
 const diag=c.meta?.detail?.diagnostics||{};if(Number.isFinite(diag.clashShare))d.harmony=clamp(d.harmony*(1-3*diag.clashShare));if(Number.isFinite(diag.registerCollisionShare))d.mix=clamp(d.mix*(1-.4*diag.registerCollisionShare));if(Number.isFinite(diag.dominantShare))d.mix=clamp(d.mix*(1-Math.max(0,diag.dominantShare-.55)));if(A.energy<.25&&bpm>target)d.voice*=clamp(1-(bpm-target)/200);const weights={harmony:20,flow:15,voice:15,melody:10,rhythm:10,duration:10,genre:10,mix:10};let score=Object.keys(weights).reduce((s,k)=>s+d[k]*weights[k],0);if(!notes.length)score=0;return {score:+score.toFixed(1),dimensions:Object.fromEntries(Object.entries(d).map(([k,v])=>[k,Math.round(v*100)])),notes:notes.length,hits:hits.length};
}
function refine(c,o){const L=o.L,A=o.A||{},end=c.meta?.button||L,scale=end>L-.12?Math.max(.75,(L-.12)/end):1,shift=0;if(scale<1){for(const e of [...c.notes,...c.hits]){e.t=e.t*scale+shift;if(e.dur!=null)e.dur*=scale;if(e.fitT!=null)e.fitT*=scale;if(e.t<0){if(e.dur!=null&&e.t+e.dur>0){e.dur+=e.t;e.t=0}else e.skip=1}}c.offset=Math.max(0,Math.min(c.offset*scale,L-(A.len||0)));c.bpm=c.bpm/scale;c.meta.offset=c.offset;c.meta.button=Math.max(0,Math.min(L-.12,end*scale+shift));c.meta.bpm=Math.round(c.bpm*10)/10;c.meta.song.bpm=c.meta.bpm;if(c.meta.detail)c.meta.detail.bpm=c.meta.bpm;if(c.liftT!=null)c.liftT=Math.max(0,c.liftT*scale+shift)}c.offset=Math.max(0,Math.min(c.offset,L-(A.len||0)));c.meta.offset=c.offset;for(const n of c.notes){if(n.skip)continue;if(!Number.isFinite(n.t)||!Number.isFinite(n.m)||!Number.isFinite(n.dur)||n.t>=L){n.skip=1;continue}n.dur=Math.max(.01,Math.min(n.dur,L-n.t));const r=n.r?.name||'',t=n.t-c.offset,a=t>=0&&t<(A.len||0)?A.act?.[Math.floor(t/(A.actHop||.05))]||0:0;if(/lead|riff|counter|dbl|color/.test(r)){const overlap=Array.isArray(A.range)&&n.m>=A.range[0]-5&&n.m<=A.range[1]+17;n.v=Math.max(.04,(n.v||.5)*(1-(overlap?.42:.25)*a))}}
 return c}
function pcm(b,A={},offset=0){let peak=0,sum=0,clip=0,invalid=0,count=0,voiceEnergy=0,voiceCount=0,otherEnergy=0,otherCount=0;const sr=b.sampleRate,hop=Math.max(1,Math.floor(sr/100)),env=[];let block=0,bn=0;
 for(let ch=0;ch<b.numberOfChannels;ch++){const x=b.getChannelData(ch);for(let i=0;i<x.length;i++){let v=x[i];if(!Number.isFinite(v)){invalid++;x[i]=v=0}peak=Math.max(peak,Math.abs(v));if(Math.abs(v)>=.999)clip++;sum+=v*v;count++;if(ch===0){block+=v*v;bn++;if(bn===hop){env.push(Math.sqrt(block/bn));block=bn=0}}const t=i/sr-offset;if(t>=0&&t<(A.len||0)&&(A.act?.[Math.floor(t/(A.actHop||.05))]||0)>.3){voiceEnergy+=v*v;voiceCount++}else{otherEnergy+=v*v;otherCount++}}}
 const rms=Math.sqrt(sum/Math.max(1,count)),db=x=>20*Math.log10(Math.max(1e-9,x)),g=peak>.95?.95/peak:1;if(g<1)for(let ch=0;ch<b.numberOfChannels;ch++){const x=b.getChannelData(ch);for(let i=0;i<x.length;i++)x[i]*=g}
 let bass=0,mid=0,high=0,prev=0,lp=0,mp=0;const x=b.getChannelData(0),a1=1-Math.exp(-2*Math.PI*250/sr),a2=1-Math.exp(-2*Math.PI*3500/sr);for(let i=0;i<x.length;i++){const v=x[i];lp+=a1*(v-lp);mp+=a2*(v-mp);bass+=lp*lp;mid+=(mp-lp)**2;high+=(v-mp)**2;prev=v}const spec=bass+mid+high||1;const silence=env.filter(x=>x<.0001).length/Math.max(1,env.length),speechDb=db(Math.sqrt(voiceEnergy/Math.max(1,voiceCount))),restDb=db(Math.sqrt(otherEnergy/Math.max(1,otherCount)));
 return {peakDb:+db(peak*g).toFixed(1),rmsDb:+db(rms*g).toFixed(1),clipped:clip,invalid,silence:+silence.toFixed(3),speechDb:+speechDb.toFixed(1),restDb:+restDb.toFixed(1),gain:g,bands:{bass:+(bass/spec).toFixed(3),mid:+(mid/spec).toFixed(3),high:+(high/spec).toFixed(3)},pass:invalid===0&&rms>.0001&&silence<.9};
}
root.PBCQuality={repair,evaluate,refine,pcm};
})(typeof window==='object'?window:globalThis);

/* Producer judgment: score, direction, ensemble and post-render diagnostics. */
(function producerModule(root){
'use strict';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)), mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0, round=x=>Math.round(x*1000)/1000, pc=m=>((m%12)+12)%12;
const melodic=n=>/^(lead|riff|counter|dbl|color)$/.test(n.r?.name||'');
function phrase(p,d,events,original,originalD,context){
 const n=p.length;if(n<2)return .5;
 const {cAt,prior,motif,lyrical=0,fidelity=0}=context;
 const intervals=p.slice(1).map((m,i)=>m-p[i]),source=original.slice(1).map((m,i)=>m-original[i]),range=Math.max(...p)-Math.min(...p);
 let rhythm=0,identity=0,resolution=0,tension=0,leaps=0,repeats=0,shape=0;
 for(let i=0;i<n;i++){
  const gap=i+1<n?events[i+1].B-events[i].B:Math.max(.2,d[i]),ct=cAt(events[i].B)?.pcs||[],inside=ct.includes(pc(p[i]));
  identity+=Math.max(0,1-Math.abs(p[i]-original[i])/7);
  rhythm+=Math.max(0,1-Math.abs(d[i]-originalD[i])/Math.max(.25,originalD[i]));
  if(!inside&&ct.length){const next=events[i+1],res=next&&Math.abs(p[i+1]-p[i])<=2&&Math.abs(p[i+1]-p[i])>0&&cAt(next.B)?.pcs.includes(pc(p[i+1]));if(res)resolution++;else if(d[i]>=.5||Math.abs(events[i].B-Math.round(events[i].B))<.04)tension++}
  if(i){const iv=intervals[i-1];if(Math.abs(iv)>7){const after=intervals[i];if(after==null||Math.sign(after)===Math.sign(iv)||Math.abs(after)>4)leaps++}if(iv===0&&i>1&&intervals[i-2]===0)repeats++;shape+=Math.sign(iv)===Math.sign(source[i-1])?1:0}
  if(gap<.1)rhythm-=.1;
 }
 const anchor=(cAt(events[n-1].B)?.pcs||[]).includes(pc(p[n-1]))?1:.35;
 const first=prior==null?1:clamp(1-Math.max(0,Math.abs(p[0]-prior)-5)/9);
 const contour=shape/(n-1),motifFit=motif?.length?mean(intervals.slice(0,motif.length).map((v,i)=>Math.sign(v)===motif[i]?1:0)):.6;
 const span=range===0?.28:range<=14?1:clamp(1-(range-14)/18);
 const expressive=clamp(.75+resolution/n*.7-tension/n*1.7-leaps/n*.8-repeats/n*(lyrical>.5?.55:.15));
 return clamp(.22*expressive+.15*anchor+.12*first+.12*span+.10*rhythm/n+.13*contour+.08*motifFit+.08*identity/n-fidelity*(1-identity/n)*.25);
}
function direct(events,P,o){
 if(!P||P.amount<=0)return;
 const role=P.grammar?.role||'lead',groups=new Map();
 for(const n of events){if(n.r?.name!==role||n.r.fx||n.uni||n.sym||n.lad||n.opening||n.B<0)continue;const k=Math.floor(n.B/P.period);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(n)}
 for(const a of groups.values()){
  a.sort((x,y)=>x.B-y.B||y.v-x.v);const line=a.filter((n,i)=>!i||n.B-a[i-1].B>.05);if(line.length<3)continue;
  const lo=Math.min(...line.map(n=>n.m)),hi=Math.max(...line.map(n=>n.m));
  let best=null,score=-Infinity;for(let i=0;i<line.length;i++){const n=line[i],prev=line[i-1],next=line[i+1],x=i/(line.length-1),pitch=(n.m-lo)/Math.max(1,hi-lo),s=.95*Math.min(2,n.d)+.6*pitch+.7*Math.sin(Math.PI*x)+.45*(prev?Math.min(1,Math.abs(n.m-prev.m)/5):0)+.35*(next&&next.m<n.m?1:0)-.5*(i===0?1:0);if(s>score){score=s;best=n}}
  for(const n of line){n.phraseFocus=n===best?1:n===line[line.length-1]?.5:clamp(.20+.26*(1-Math.abs(n.B-best.B)/P.period));n.phraseEnd=n===line[line.length-1]?1:0}
 }
}
function shape(n,prev,next,k,context){
 const {importance,connected,relax,accent,force,metrical,dur,mel}=context;
 if(n.opening)return 'attack';
 if(connected&&n.leg2)return 'connected';
 if(dur<.19)return 'accent';
 if(n.phraseEnd&&dur>.32)return 'taper';
 if(!mel)return connected?'flow':force>.76&&metrical>.7?'accent':'flow';
 if(importance>.76&&accent>.7&&force>.62)return 'accent';
 if(importance>.72&&dur>.42)return relax>.7||k==='harmonica'?'swell':'arch';
 if(connected)return 'flow';
 if(dur>.65&&relax>.7&&(!prev||prev.phraseEnd||n.t-prev.t-prev.dur>.13))return 'swell';
 if(force>.74&&metrical>.7&&accent>.7)return 'accent';
 return 'flow';
}
function arrange(c,o){
 const p=c.meta.detail?.expression||{},role=p.grammar?.role||'lead',L=Math.max(.1,o.L||1),notes=c.notes.filter(n=>!n.skip&&!n.r?.fx&&!n.uni&&!n.sym&&Number.isFinite(n.t)&&Number.isFinite(n.m)&&Number.isFinite(n.dur)&&n.t<L),lead=notes.filter(n=>n.r.name===role&&!n.lad).sort((a,b)=>a.t-b.t),line=lead.filter((n,i)=>!i||n.t-lead[i-1].t>.045);
 const step=.25,N=Math.max(1,Math.ceil(L/step)),bins=Array.from({length:N},()=>({fg:0,bg:0,low:0,parts:new Set()}));
 let out=0,clash=0,weight=0,voice=0,unresolved=0;
 for(const n of notes){const w=Math.min(2,n.dur)*Math.max(.05,n.v||.1),ct=c._cAt?.(n.B)?.pcs||[];weight+=w;if(n.t+n.dur>L+.12)out+=w;const pc0=pc(n.m);if(ct.length&&!ct.includes(pc0)&&ct.some(m=>pc(pc0-m)===1)&&!n.intentional&&n.dur>.45)clash+=w;
  const foreground=melodic(n),a=o.A||{},t=n.t-c.offset,act=t>=0&&t<(a.len||0)?a.act?.[Math.floor(t/(a.actHop||.05))]||0:0;if(foreground&&n.m>=48&&n.m<=79)voice+=w*act;
  for(let i=Math.max(0,Math.floor(n.t/step));i<Math.min(N,Math.ceil((n.t+n.dur)/step));i++){const b=bins[i],power=(n.v||.1)**2;if(foreground)b.fg+=power;else b.bg+=power;if(n.m<48)b.low+=power;b.parts.add(n.r.name)}
 }
 const leaps=[],durations=[],gaps=[],contour=[];for(let i=0;i<line.length;i++){const n=line[i],prev=line[i-1],next=line[i+1],ct=c._cAt?.(n.B)?.pcs||[];durations.push(n.dur);if(prev){const iv=n.m-prev.m;leaps.push(Math.abs(iv)>9&&(!next||Math.sign(next.m-n.m)===Math.sign(iv))?1:0);contour.push(Math.sign(iv));gaps.push(Math.max(0,n.t-prev.t-prev.dur))}if(ct.length&&!ct.includes(pc(n.m))&&n.dur>.55&&!(next&&Math.abs(next.m-n.m)<=2&&c._cAt?.(next.B)?.pcs.includes(pc(next.m))))unresolved++}
 const active=bins.filter(b=>b.fg+b.bg>.003), crowded=mean(active.map(b=>clamp((b.parts.size-5)/4))),competition=mean(active.map(b=>b.fg>.05?clamp((b.fg-b.bg*.9)/Math.max(.1,b.fg))*.15+clamp((b.parts.size-4)/5)*.35:0)), density=active.length/N;
 const varied=durations.length>2?clamp((Math.max(...durations)-Math.min(...durations))/Math.max(.35,mean(durations))* .65):.5, hook=contour.length>5?mean(contour.slice(3).map((x,i)=>x===contour[i]?1:0)):.5;
 const melody=line.length?clamp(.77-.48*mean(leaps)-.65*unresolved/line.length+.10*varied+.08*hook):.65, harmony=clamp(1-2.1*clash/Math.max(.001,weight)), space=clamp(1-.65*crowded-.55*competition-.75*voice/Math.max(.001,weight)), flow=clamp(.65+.35*density-.6*out/Math.max(.001,weight)), dynamics=clamp(.6+.2*varied+.2*mean(gaps.map(g=>g>.07?1:0))), fit=(c.meta.fit?.inKey||70)/100;
 const band=ensemble(notes,role,L),score=100*(.24*melody+.17*harmony+.16*space+.12*flow+.08*dynamics+.05*fit+.10*band.harmony+.08*band.collaboration);
 return{score:round(score),melody:round(melody),harmony:round(harmony),space:round(space),flow:round(flow),dynamics:round(dynamics),voiceFit:round(fit),ensembleHarmony:round(band.harmony),collaboration:round(band.collaboration),responseShare:round(band.responseShare),leadNotes:line.length};
}
function support(notes,P,o){
 if(!P||P.amount<=0)return;
 const role=P.grammar?.role||'lead',focal=notes.filter(n=>n.r.name===role&&n.focus&&!n.uni&&!n.sym),scale=clamp(P.amount/3),bins=new Set(),leadBins=new Map();
 for(const n of notes){if(n.r.name!==role||n.uni||n.sym||n.skip)continue;for(let i=Math.floor(n.t*8);i<Math.ceil((n.t+n.dur)*8);i++){const a=leadBins.get(i)||[];a.push(n);leadBins.set(i,a)}}
 for(const n of focal)for(let i=Math.floor(n.t*8);i<=Math.ceil((n.t+Math.min(1.5,n.dur))*8);i++)bins.add(i);
 let softened=0,restrained=0,answers=0,clashSoftened=0;
 for(const n of notes){if(n.r.fx||n.opening||n.r.name===role||/^(bass|sub)$/.test(n.r.name))continue;const name=n.r.name;if(bins.has(Math.floor(n.t*8))&&/^(counter|dbl|color|riff|pulse|keys2)$/.test(name)){n.v*=1-scale*(/^(counter|dbl|color)$/.test(name)?.30:.13);softened++}
  const active=leadBins.get(Math.floor(n.t*8))||[],respond=/^(counter|color|riff)$/.test(name),collision=active.some(a=>[1,13].includes(Math.abs(a.m-n.m))&&!a.intentional&&!n.intentional);if(collision){n.v*=1-.38*scale;clashSoftened++}if(respond&&!active.length){answers++;}else if(n.pressure&&/^(pad|pad2|keys2|dbl|counter|color|pulse)$/.test(name)){n.pressure.vibrato*=1-.30*scale;n.pressure.tremolo*=1-.28*scale;restrained++}
 }
 P.producer={version:2,foreground:role,focalNotes:focal.length,softened,restrained,answers,clashSoftened};
}
function inspect(buffer){
 const sr=buffer.sampleRate,hop=Math.max(8,Math.floor(sr/20)),n=buffer.length,channels=Array.from({length:buffer.numberOfChannels},(_,i)=>buffer.getChannelData(i)),env=[];let peak=0,invalid=0,first=null,total=0,count=0,clip=0;
 for(let j=0;j<n;j+=hop){let sum=0,k=0;for(let i=j;i<Math.min(n,j+hop);i+=8)for(const ch of channels){const x=ch[i];if(!Number.isFinite(x)){invalid++;continue}peak=Math.max(peak,Math.abs(x));if(Math.abs(x)>=.999)clip++;sum+=x*x;k++}const rms=Math.sqrt(sum/Math.max(1,k));if(first===null&&rms>.001)first=j/sr;env.push(rms);total+=sum;count+=k}
 const active=env.filter(x=>x>.001).sort((a,b)=>a-b),q=x=>active[Math.floor((active.length-1)*x)]||1e-9,db=x=>20*Math.log10(Math.max(1e-9,x));
 return{sampleStride:8,firstAudibleSeconds:first,peakDb:round(db(peak)),rmsDb:round(db(Math.sqrt(total/Math.max(1,count)))),dynamicSpreadDb:round(db(q(.9)/q(.1))),silenceShare:round(1-active.length/Math.max(1,env.length)),sampledClips:clip,sampledInvalid:invalid,pass:invalid===0&&first!==null&&first<=.15&&clip===0};
}
function curve(points,k,n,context){
 const {shape,importance,strength,dur}=context;
 if(strength<=0||shape==='strike'||n.opening)return points;
 const breath=/^(harmonica|flute|recorder|clarinet|oboe|bassoon|sax|reed|pipe|voice)$/.test(k),bow=/^(cello|violin|erhu|bow|solo|ens)$/.test(k),brass=/^(horn|trumpet|trombone|brass)$/.test(k);
 if(!breath&&!bow&&!brass)return points;
 let target;
 if(k==='harmonica')target=shape==='swell'?[.20,.65,1.25,.48]:shape==='accent'?[1.24,.92,.96,.58]:shape==='taper'?[.88,1.02,.56,.12]:shape==='connected'?[.78,1.01,1.13,.75]:[.73,1.08,.91,.52];
 else if(breath)target=shape==='swell'?[.34,.82,1.18,.62]:shape==='taper'?[.88,.99,.64,.18]:shape==='accent'?[1.12,1,.9,.62]:[.77,1.04,.95,.68];
 else if(bow)target=shape==='swell'?[.30,.75,1.2,.77]:shape==='taper'?[.94,1.03,.71,.21]:shape==='accent'?[1.2,.90,1,.72]:[.8,1.08,1.02,.8];
 else target=shape==='swell'?[.45,.85,1.16,.76]:shape==='accent'?[1.25,1.04,.94,.61]:shape==='taper'?[.91,.99,.7,.24]:[.86,1.06,.96,.68];
 const mix=clamp(.38+.42*strength+.12*importance)*clamp(dur/.6);
 return points.map((x,i)=>clamp(x+(target[i]-x)*mix,.08,1.45));
}
// Compare simultaneous performances, not just individual notes against a scale.
// Close unresolved friction is different from an intentional melodic suspension.
function ensemble(notes,role,L){
 const hop=.125,N=Math.max(1,Math.ceil(L/hop)),bins=Array.from({length:N},()=>[]);let friction=0,pairs=0,contests=0,windows=0,answers=0,leadWindows=0;
 for(const n of notes){if(n.r.fx||n.uni||n.sym||n.skip||n.v<.08)continue;for(let i=Math.max(0,Math.floor(n.t/hop));i<Math.min(N,Math.ceil((n.t+n.dur)/hop));i++){const at=(i+.5)*hop;if(at>=n.t-.02&&at<n.t+n.dur)bins[i].push(n)}}
 for(const bin of bins){
  const main=bin.filter(n=>n.r.name===role),secondary=bin.filter(n=>n.r.name!==role&&n.r.name!=='dbl'&&melodic(n));if(main.length){leadWindows++;const m=Math.max(...main.map(n=>n.v));if(secondary.some(n=>n.v>m*.85&&main.some(a=>Math.abs(a.m-n.m)<12)))contests++}else if(secondary.length)answers++;
  if(bin.length<2)continue;windows++;
  for(let i=0;i<bin.length;i++)for(let j=i+1;j<bin.length;j++){const a=bin[i],b=bin[j];if(a.r.name===b.r.name)continue;const d=Math.abs(a.m-b.m),w=a.v*b.v;pairs+=w;if(!a.intentional&&!b.intentional&&(d===1||d===13||(d<12&&Math.max(a.m,b.m)<48&&d<5)))friction+=w;}
 }
 return{harmony:clamp(1-4*friction/Math.max(.001,pairs)),collaboration:clamp(1-contests/Math.max(1,leadWindows)),responseShare:answers/N,windows,leadWindows};
}
root.PBCProducer={phrase,direct,shape,curve,arrange,support,inspect,ensemble};
})(typeof window==='object'?window:globalThis);


/* Creative director v1: one seeded artistic state, genre-conditioned inspiration,
   motif search, ensemble direction, perceptual checks and bounded preference memory. */
(function(root){
'use strict';
const P=root.PBCProducer,C=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0,rd=x=>Math.round(x*1000)/1000,pc=x=>((x%12)+12)%12,db=x=>10*Math.log10(Math.max(1e-12,x));
const hash=(s,k)=>{let h=(s>>>0)^2166136261;for(const c of String(k))h=Math.imul(h^c.charCodeAt(0),16777619);return (h^(h>>>16))>>>0};
function random(s){return()=>{s=(s+0x6d2b79f5)>>>0;let t=Math.imul(s^(s>>>15),1|s);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296}}
const axes=['cohesion','melody','arc','audibility','groove','chemistry','harmony','edge'],prior=[.23,.19,.17,.16,.11,.07,.04,.03],store='pbc.creative.memory.1',tag=[['disconnected','rooms'],['nohook','wander','repetitive'],['emotionFlat','noarc','noPayoff','tooRestrained'],['buried','duringThin','afterThin','duringMusicQuiet'],['stiff','flat'],['wrongins','syntheticTone'],['sour','chordsOdd'],['overExpressed','seasick','noRuns']];
let mem;function memory(){if(!mem){try{mem=JSON.parse(root.localStorage?.getItem(store)||'{}')}catch(e){mem={}}if(!mem||typeof mem!=='object'||Array.isArray(mem))mem={}}return mem}
function observe(b){if(!b||!b.id)return;const m=memory(),s=+b.stars,x=b.expression||b.detail?.expression||b.composerChoices?.expression||{},d=x.creative?.evaluation?.dimensions;if(s>=1&&s<=5)m[b.id]={stars:s,reasons:(b.reasons||Object.keys(b.why||{}).filter(k=>b.why[k])).slice(0,40),d:d?Object.fromEntries(axes.filter(k=>Number.isFinite(d[k])).map(k=>[k,C(d[k])])):null};else delete m[b.id];while(Object.keys(m).length>192)delete m[Object.keys(m)[0]];try{root.localStorage?.setItem(store,JSON.stringify(m))}catch(e){}}
function importRatings(data){if(!Array.isArray(data?.beds))throw Error('Invalid ratings export');for(const b of data.beds.slice(-192))observe(b);return data.beds.length}
function weights(){const rows=Object.values(memory()),a=prior.map((w,i)=>w*(1+.5*rows.filter(r=>r.reasons?.some(t=>tag[i].includes(t))).length/(rows.length+25))),train=rows.filter(r=>axes.every(k=>Number.isFinite(r.d?.[k])));if(train.length>=8){for(let epoch=0;epoch<5;epoch++){const g=prior.map(()=>0);let n=0;for(let i=0;i<train.length;i++)for(let j=0;j<i;j++){const u=train[i],v=train[j],s=Math.sign(u.stars-v.stars);if(!s)continue;const diff=axes.map(k=>s*(u.d[k]-v.d[k])),p=1/(1+Math.exp(-4*diff.reduce((t,x,k)=>t+a[k]*x,0)));for(let k=0;k<g.length;k++)g[k]+=(1-p)*diff[k];n++}for(let k=0;k<a.length;k++)a[k]=C(a[k]+.14*(g[k]/Math.max(1,n)-.4*(a[k]-prior[k])),prior[k]*.65,prior[k]*1.65)}}const total=a.reduce((s,x)=>s+x,0);return a.map(x=>x/total)}
function perceive(o){const A=o.A||{},p=o.piece||{},m=(p.mel||[]).filter(n=>n.length>=3&&n.slice(0,3).every(Number.isFinite)).slice(0,512),iv=m.slice(1).map((n,i)=>n[2]-m[i][2]),pulse=(A.acf||[]).filter(a=>a[0]>=.3&&a[0]<=1.2&&Number.isFinite(a[1])).sort((a,b)=>b[1]-a[1])[0]||null;return{m,step:m.length?avg(iv.map(v=>Math.abs(v)<=2?1:0)):.6,sync:m.length?avg(m.map(n=>Math.abs(n[0]-Math.round(n[0]))>.05?1:0)):.4,energy:C(A.energy??.4),rate:C((A.rate||2.5)/5),minor:p.mode==='min'||p.mode==='dor'?1:0,pulse,pauses:(A.pauses||[]).length}}
function mindset(o){const x=perceive(o),R=random(hash(o.seed,'mind')),a=R(),b=R(),c=R(),d=R(),e=R();return{x,z:{warmth:C(.35+.35*a+.3*(1-x.energy)),intimacy:C(.25+.35*a+.4*(1-x.energy)),playfulness:C(.2+.4*b+.2*x.energy+.2*(1-x.minor)),melancholy:C(.15+.4*(1-b)+.35*x.minor),confidence:C(.2+.45*c+.35*x.energy),curiosity:.25+.65*d,boldness:.18+.52*c+.2*d,restraint:.25+.35*(1-c)+.25*a,rhythmic:C(.2+.3*x.rate+.2*x.sync+.3*b),harmonic:.3+.4*d+.2*x.minor,melodic:C(.35+.35*a+.2*x.step+.1*e),sensitivity:C(.3+.3*a+.25*d+.15*(1-x.energy))}}}
function genre(o,G){const ids=Object.keys(o.blend||{}).filter(k=>G[k]&&o.blend[k]>0);if(!ids.length)return null;const {x,z}=mindset(o),R=random(hash(o.seed,'genre')),target=x.pulse?60/x.pulse[0]:45+100*x.rate,rank=ids.map(k=>{const g=G[k],mid=avg(g.bpm||[80,120]),tempo=Math.exp(-Math.abs(mid-target)/55),motion=C((mid-65)/85),feel=1-Math.abs(motion-(.5*x.energy+.3*x.rate+.2*z.confidence)),lyric=g.melody==='lyric'?z.melodic:.5+.25*z.rhythmic,harm=x.minor?(g.modes?.min||0)>0?1:.35:(g.modes?.maj||0)>0?1:.6,fit=.32*tempo+.30*feel+.23*lyric+.15*harm;return[k,fit,o.blend[k]*Math.exp(2*(fit-.5)+.65*(R()-.5))]});let t=R()*rank.reduce((s,a)=>s+a[2],0),anchor=rank.at(-1)[0];for(const a of rank){t-=a[2];if(t<=0){anchor=a[0];break}}const out=Object.fromEntries(rank.map(([k,f,w])=>[k,w*(k===anchor?1.65:1)]));return{anchor,weights:out,fit:Object.fromEntries(rank.map(([k,f])=>[k,rd(f)])),selected:ids}}
function profile(o,p,plan){const {x,z}=mindset(o),R=random(hash(o.seed,'inspiration')),v=p.values,motifs=[],seen=new Set();function add(ns,ts,source){const iv=ns.slice(1).map((n,i)=>n-ns[i]),g=ts.slice(1).map((t,i)=>Math.max(.125,t-ts[i])),k=iv.join(',')+'|'+g.map(x=>Math.round(x*4)).join(',');if(seen.has(k)||!iv.length)return;seen.add(k);const span=Math.max(...ns)-Math.min(...ns),q=.36*avg(iv.map(n=>Math.abs(n)>7?0:n===0?.35:1))+.2*C(span/7)+.2*(1-C(span/24))+.14*z.melodic+.1*R();motifs.push({iv,g,source,score:rd(q)})}
 for(let i=0;i<x.m.length-1&&motifs.length<112;i+=Math.max(1,Math.floor(x.m.length/112)))for(const n of [2,3,4]){const a=x.m.slice(i,i+n);if(a.length===n)add(a.map(n=>n[2]),a.map(n=>n[0]),'source')}
 const ph=(o.A?.ph||[]).filter(n=>Number.isFinite(n[0])&&Number.isFinite(n[1])).slice(0,256);for(let i=0;i<ph.length-2&&motifs.length<128;i+=Math.max(2,Math.floor(ph.length/12))){const a=ph.slice(i,i+3);if(a[2][0]-a[0][0]>.12)add(a.map(n=>Math.round(n[1])),a.map(n=>n[0]),'voice contour')}
 for(const iv of [[2,2,-2],[-3,2,-2],[3,-2,-1],[0,3,-2],[5,-2,-3],[-2,-2,4],[2,-1,2],[0,0,3]]){const a=[60];for(const n of iv)a.push(a.at(-1)+n);add(a,[0,.5,1,2],'vocabulary')}
 motifs.sort((a,b)=>b.score-a.score);const top=motifs.slice(0,12),primary=top[Math.floor(R()*Math.min(4,top.length))],mood=Object.entries({tender:z.warmth+z.intimacy,longing:z.melancholy+z.sensitivity,playful:z.playfulness+z.rhythmic,determined:z.confidence+z.boldness,hopeful:z.warmth+z.confidence,reflective:z.intimacy+z.restraint}).sort((a,b)=>b[1]-a[1])[0][0],strength=C(p.amount/3),targets={sway:79.8*.6+40*z.rhythmic,flexibility:66.2*.6+40*z.sensitivity,interaction:75.8*.6+40*z.sensitivity,phrasing:79.6*.6+40*z.melodic,repetition:56.6*.7+30*(1-z.curiosity),tenderness:100*z.warmth,longing:100*z.melancholy,joy:100*z.playfulness,warmth:100*z.warmth,intimacy:100*z.intimacy,tension:100*z.boldness,restraint:100*z.restraint,complexity:100*z.harmonic,playfulness:100*z.playfulness};for(const [k,t] of Object.entries(targets)){const r=p.ranges[k];if(r&&Number.isFinite(v[k]))v[k]=Math.round(C(v[k]*(1-.42*strength)+t*.42*strength,r.min,r.max))}
 if(strength){p.mood=mood;p.period=z.restraint+z.melodic>1.05?16:8;p.phase=.12+R()*.18}p.creative={version:1,seed:o.seed,streams:{genre:hash(o.seed,'genre'),mind:hash(o.seed,'mind'),inspiration:hash(o.seed,'inspiration'),interpretation:hash(o.seed,'interpretation'),humanization:hash(o.seed,'humanization')},state:z,genre:plan||{anchor:o.genre,selected:[o.genre]},perception:{sourceNotes:x.m.length,stepShare:rd(x.step),syncopation:rd(x.sync),voiceEnergy:x.energy,speechRate:x.rate,pauses:x.pauses,pulse:x.pulse},mood,primary,motifs:top,discoveries:[],feedbackSamples:Object.keys(memory()).length};return p}
function motifScore(p,cr){if(p.length<2||!cr?.primary)return .5;const iv=cr.primary.iv;return avg(p.slice(1).map((n,i)=>Math.exp(-Math.abs(n-p[i]-iv[i%iv.length])/3)))}
function imagine(p,arr,orig,d0,nearest){const cr=p.creative;if(!cr)return[];const R=random(hash(cr.streams.inspiration,arr[0].B)),out=[];for(const m of cr.motifs.slice(0,6))for(let k=0;k<4;k++){const a=[nearest(orig[0],0,0)],d=d0.slice();for(let i=1;i<orig.length;i++){const iv=m.iv[(i-1)%m.iv.length],t=k===2?orig[i]*.55+(a[i-1]+iv)*.45:a[i-1]+(k===1?-iv:iv)*(k===3?.65:1);a.push(nearest(C(t,a[i-1]-7,a[i-1]+7),i,i===orig.length-1?0:1));const gap=arr[i+1]?arr[i+1].B-arr[i].B:d0[i];d[i]=Math.max(.05,Math.min(Math.max(.05,gap-.025),d0[i]*(.88+.24*R())))}out.push({p:a,d})}return out}
function discover(p,a,events){const cr=p.creative;if(!cr||a.length<3)return;const iv=a.slice(1,5).map((x,i)=>x-a[i]),g=events.slice(1,5).map((x,i)=>x.B-events[i].B);cr.discoveries.push({beat:events[0].B,iv});if(cr.discoveries.length>24)cr.discoveries.shift();if(cr.discoveries.length===1||cr.state.curiosity>.7){const m={iv,g,source:'discovery',score:.8};cr.primary=m;cr.motifs=[m,...cr.motifs].slice(0,12)}}
const fam=k=>/bass|sub/.test(k)?'bass':/bow|solo|ens/.test(k)?'bow':/reed|pipe|brass/.test(k)?'wind':/syn|pad/.test(k)?'electronic':/guitar|harp/.test(k)?'pluck':/piano|organ|keys/.test(k)?'keys':k;
function chemistry(a,b){a=fam(a);b=fam(b);return a===b?a==='bass'?.25:a==='electronic'?.8:.62:a==='bass'||b==='bass'?.92:[a,b].includes('keys')||[a,b].includes('pluck')?.84:.75}
function instrument(kind,used,P,role){if(!P?.creative||!P.amount)return 1;const z=P.creative.state,f=used.length?avg(used.map(k=>chemistry(kind,k))):.8,lead=/lead|riff|counter/.test(role),a=lead&&['bow','wind','keys'].includes(fam(kind))?z.melodic:lead?z.rhythmic:.5;return Math.exp(2*(f-.75)+.7*(a-.5))}
function arc(P,b,total){const z=P.creative.state,x=C(b/Math.max(4,total)),peak=.68+.18*z.restraint,y=x<peak?Math.pow(x/peak,.75+z.restraint):Math.pow(C((1-x)/(1-peak)),.6)*.7;return C(.23+.55*y+.22*(.5+.5*Math.sin(2*Math.PI*(b/P.period-.13))))}
function rehearse(ev,dr,P,o,cAt,bb){if(!P.creative||!P.amount||o.ch||o.song||o.solo)return;const cr=P.creative,role=P.grammar?.role||'lead',lead=ev.filter(n=>n.r.name===role&&!n.uni&&!n.sym&&!n.lad&&n.B>=0).sort((a,b)=>a.B-b.B),others=ev.filter(n=>/^(riff|counter|color)$/.test(n.r.name)&&n.r.name!==role&&!n.uni&&!n.sym&&!n.lad),s=C(P.amount/3);let answers=0;for(let i=0;i<lead.length-1&&answers<12;i++){const a=lead[i],b=lead[i+1],start=a.B+a.d,end=b.B;if(end-start<.45||end-start>5)continue;const n=others.find(x=>x.B>=start-.02&&x.B<end-.12&&x.B+x.d<=end+.03&&!x.intentional);if(!n)continue;const iv=cr.primary.iv,target=a.m-iv[i%iv.length],pcs=cAt(n.B)?.pcs||[],reg=n.r.reg;let best=n.m,dist=Math.abs(best-target);for(let m=Math.max(reg[0],n.m-5);m<=Math.min(reg[1],n.m+5);m++)if(pcs.includes(pc(m))&&Math.abs(m-a.m)<=12&&Math.abs(m-target)<dist){best=m;dist=Math.abs(m-target)}if(best!==n.m){n.m=best;n.answer=1;n.v=C(n.v*(1+.15*s),.03,1);answers++}}
 for(const n of ev)if(!n.r.fx&&!n.opening&&!n.uni&&!n.sym&&n.B>=0)n.v=C(n.v*(1+s*(n.r.name===role?.34:.16)*(arc(P,n.B,bb)-.55)),.025,1);for(const d of dr)if(d.B>=0)d.v=C(d.v*(1+s*.2*(arc(P,d.B,bb)-.55)),.02,1);cr.rehearsal={answers,sharedArc:true}}
const old=P.arrange,oldSupport=P.support,oldInspect=P.inspect;
P.arrange=function(c,o){const x=c.meta?.detail?.expression,cr=x?.creative;if(!cr||!x.amount)return old(c,o);const b=old(c,o),role=x.grammar?.role||'lead',L=Math.max(.1,o.L),notes=c.notes.filter(n=>!n.skip&&!n.r.fx&&!n.uni&&!n.sym&&n.t<L),by=new Map(),bins=Array.from({length:Math.ceil(L*4)},()=>[0,0]);for(const n of notes){if(!by.has(n.r.name))by.set(n.r.name,[]);by.get(n.r.name).push(n);for(let i=Math.max(0,Math.floor(n.t*4));i<Math.min(bins.length,Math.ceil((n.t+n.dur)*4));i++)bins[i][n.r.name===role?0:1]+=n.v*n.v}
 const groups=[...by.values()],line=(by.get(role)||[]).slice().sort((a,b)=>a.t-b.t).filter((n,i,a)=>!i||n.t-a[i-1].t>.045),iv=line.slice(1).map((n,i)=>n.m-line[i].m),rep=avg(iv.map((v,i)=>i>1&&v===iv[i-1]&&v===iv[i-2]?1:0)),variety=C(new Set(iv).size/Math.max(1,Math.min(8,iv.length))),pairs=[],rh=[];for(let i=0;i<groups.length;i++){for(let j=0;j<i;j++)pairs.push(chemistry(groups[i][0].r.kind,groups[j][0].r.kind));const a=groups[i].slice().sort((a,b)=>a.t-b.t);for(let j=1;j<a.length;j++){const d=a[j].B-a[j-1].B;if(d>.09&&d<4)rh.push(C(1-Math.abs(a[j].t-a[j-1].t-d*60/c.bpm)/.15))}}
 const fg=bins.filter(a=>a[0]>.004),aud=fg.length?avg(fg.map(a=>C((db(a[0]/(a[1]+.005))+15)/20))):.5,e=bins.map(a=>a[0]+a[1]),seg=[0,1,2].map(i=>avg(e.slice(Math.floor(i*e.length/3),Math.floor((i+1)*e.length/3)))),contrast=C((Math.abs(db((seg[1]+.01)/(seg[0]+.01)))+Math.abs(db((seg[2]+.01)/(seg[1]+.01))))/12),rhythm=rh.length?avg(rh):.65,chem=pairs.length?avg(pairs):.8,density=notes.length/Math.max(1,L*c.bpm/60),fit=Math.exp(-Math.max(0,density-12)/16),answers=cr.rehearsal?.answers||0;
 const d={cohesion:C(.25*b.collaboration+.25*rhythm+.25*chem+.25*C(.4+answers/Math.max(2,line.length)*4)),melody:C(.5*b.melody+.2*variety+.2*(1-rep)+.1*motifScore(line.map(n=>n.m),cr)),arc:C(.45*contrast+.3*b.dynamics+.25*C((x.phrases?.length||0)/3)),audibility:C(.75*aud+.25*fit),groove:C(.55*rhythm+.25*x.values.sway/100+.2*fit),chemistry:chem,harmony:C(.55*b.harmony+.45*b.ensembleHarmony),edge:C(.45*variety+.35*(1-rep)+.2*cr.state.boldness)},w=weights(),score=100*Math.exp(axes.reduce((s,k,i)=>s+w[i]*Math.log(Math.max(.015,d[k])),0)),v={...b,score:rd(score),priorScore:b.score,dimensions:Object.fromEntries(axes.map(k=>[k,rd(d[k])])),weights:Object.fromEntries(axes.map((k,i)=>[k,rd(w[i])])),collaboration:rd(d.cohesion),leadNotes:line.length,estimatedAudibility:rd(aud),density:rd(density)};cr.evaluation=v;return v};
P.support=function(notes,x,o){if(!x?.creative||!x.amount){oldSupport(notes,x,o);return}const role=x.grammar?.role||'lead',lead=notes.filter(n=>n.r.name===role&&!n.uni&&!n.sym),s=C(x.amount/3);let count=0;for(const n of notes){if(n.opening||n.r.fx||n.r.name===role||!/^(counter|color|riff|dbl)$/.test(n.r.name))continue;if(lead.some(m=>m.focus&&m.t<n.t+n.dur&&m.t+m.dur>n.t&&Math.abs(m.m-n.m)<12)){n.v*=1-.14*s;count++}}x.producer={version:3,foreground:role,focalNotes:lead.filter(n=>n.focus).length,softened:count,answers:x.creative.rehearsal?.answers||0}};
function mix(c,SN,env,out){const x=c.meta?.detail?.expression;if(!x?.creative||!x.amount)return;const role=x.grammar?.role||'lead',fg=SN.includes(role)?role:SN.find(n=>/lead|riff|counter/.test(n));if(!fg)return;const g=n=>10**((out.g[n]||0)/10),others=SN.filter(n=>n!==fg&&!/bass|sub|drums|mine/.test(n)),sig=env[fg],rat=[];for(let i=0;i<sig.length;i++)if(sig[i]>1e-9){let bg=0;for(const n of others)bg+=env[n][i]*g(n);if(bg>1e-9)rat.push(db(sig[i]*g(fg)/bg))}rat.sort((a,b)=>a-b);const med=rat[Math.floor(rat.length*.5)]??0,need=C(-3-med,0,9),boost=C(need*.55,0,6);out.g[fg]=rd(C((out.g[fg]||0)+boost,-26,18));for(const n of others){let overlap=0,total=0;for(let i=0;i<sig.length;i++){total+=env[n][i];if(sig[i]>1e-9)overlap+=env[n][i]}out.g[n]=rd(C((out.g[n]||0)-need*.45*overlap/Math.max(1e-12,total),-30,12))}out.producer={foreground:fg,estimatedMaskingBeforeDb:rd(med),foregroundBoostDb:rd(boost)}}
P.inspect=function(buffer){const d=oldInspect(buffer),sr=buffer.sampleRate,a=buffer.getChannelData(0),b=buffer.numberOfChannels>1?buffer.getChannelData(1):a,step=Math.max(1,Math.round(sr/12000)),alpha=1-Math.exp(-2*Math.PI*350/ (sr/step)),beta=1-Math.exp(-2*Math.PI*3200/(sr/step));let low=0,mid=0,l=0,m=0,h=0,xy=0,xx=0,yy=0;for(let i=0;i<a.length;i+=step){const v=(a[i]+b[i])*.5;low+=alpha*(v-low);mid+=beta*(v-mid);l+=low*low;m+=(mid-low)**2;h+=(v-mid)**2;xy+=a[i]*b[i];xx+=a[i]**2;yy+=b[i]**2}const total=l+m+h||1;return{...d,spectral:{low:rd(l/total),mid:rd(m/total),high:rd(h/total)},stereoCorrelation:rd(xy/Math.max(1e-12,Math.sqrt(xx*yy)))}};
Object.assign(P,{genre,profile,imagine,discover,motifScore,instrument,rehearse,mix,observe,importRatings,weights});
})(typeof window==='object'?window:globalThis);
