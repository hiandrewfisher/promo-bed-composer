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
