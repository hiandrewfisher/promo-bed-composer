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
 const cs=p.chords.filter(c=>c.length>=5&&c.slice(0,4).every(Number.isFinite)&&c[0]>=0&&c[0]<len&&c[1]>0).sort((a,b)=>a[0]-b[0]).map(c=>{let q=c[4]==='min'?'m':c[4];if(!chords[q])q='maj';let r=pc(c[2]-k),bass=pc(c[3]-k);const notes=chords[q].map(x=>pc(x+r));if(!notes.includes(bass))bass=r;return [c[0],Math.min(c[1],len-c[0]),r,bass,q]});
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
 for(const a of roles.values()){a.sort((x,y)=>x.t-y.t);let prev;for(const n of a){if(prev&&n.t>prev.t+.05){steps++;if(Math.abs(n.m-prev.m)>12)leaps++}prev=n}}
 let jumps=0,active=0;for(let i=0;i<bins.length;i++){if(bins[i]>.05)active++;if(i&&Math.abs(bins[i]-bins[i-1])>Math.max(2,bins[i-1]*2))jumps++}
 const bpm=c.bpm||120,range=S.bpm||[65,150],tempo=clamp(1-Math.max(0,range[0]-bpm,bpm-range[1])/30),target=clamp((A.rate||2.5)*30,range[0],range[1]),pace=clamp(1-Math.abs(bpm-target)/Math.max(50,target));
 const end=c.meta?.button||0,voiceEnd=(c.offset||0)+(A.len||0),tail=Math.max(0,L-voiceEnd);
 const d={harmony:clamp(good/Math.max(.001,total)-.3*clash/Math.max(.001,total)),flow:clamp(1-jumps/Math.max(1,bins.length)*2),voice:clamp(1-2*voice/Math.max(.001,energy))*.65+pace*.35,melody:clamp(1-leaps/Math.max(1,steps)*3),rhythm:clamp(.5+active/Math.max(1,bins.length)*.5),duration:clamp(1-Math.max(0,voiceEnd-L)/Math.max(1,L)-Math.max(0,end-L)/Math.max(1,L)-overflow/Math.max(.001,total)*.3)*(.8+.2*clamp(tail/1.2)),genre:tempo,mix:clamp(1-Math.max(0,roles.size-7)*.1)};
 const weights={harmony:20,flow:15,voice:15,melody:10,rhythm:10,duration:10,genre:10,mix:10};let score=Object.keys(weights).reduce((s,k)=>s+d[k]*weights[k],0);if(!notes.length)score=0;return {score:+score.toFixed(1),dimensions:Object.fromEntries(Object.entries(d).map(([k,v])=>[k,Math.round(v*100)])),notes:notes.length,hits:hits.length};
}
function refine(c,o){const L=o.L,A=o.A||{};for(const n of c.notes){if(n.skip)continue;if(!Number.isFinite(n.t)||!Number.isFinite(n.m)||!Number.isFinite(n.dur)||n.t>=L){n.skip=1;continue}n.dur=Math.max(.01,Math.min(n.dur,L-n.t));const r=n.r?.name||'',t=n.t-c.offset,a=t>=0&&t<(A.len||0)?A.act?.[Math.floor(t/(A.actHop||.05))]||0:0;if(/lead|riff|counter|dbl|color/.test(r))n.v=Math.max(.04,(n.v||.5)*(1-.25*a));}
 return c}
function pcm(b,A={},offset=0){let peak=0,sum=0,clip=0,invalid=0,count=0,voiceEnergy=0,voiceCount=0,otherEnergy=0,otherCount=0;const sr=b.sampleRate,hop=Math.max(1,Math.floor(sr/100)),env=[];let block=0,bn=0;
 for(let ch=0;ch<b.numberOfChannels;ch++){const x=b.getChannelData(ch);for(let i=0;i<x.length;i++){let v=x[i];if(!Number.isFinite(v)){invalid++;x[i]=v=0}peak=Math.max(peak,Math.abs(v));if(Math.abs(v)>=.999)clip++;sum+=v*v;count++;if(ch===0){block+=v*v;bn++;if(bn===hop){env.push(Math.sqrt(block/bn));block=bn=0}}const t=i/sr-offset;if(t>=0&&t<(A.len||0)&&(A.act?.[Math.floor(t/(A.actHop||.05))]||0)>.3){voiceEnergy+=v*v;voiceCount++}else{otherEnergy+=v*v;otherCount++}}}
 const rms=Math.sqrt(sum/Math.max(1,count)),db=x=>20*Math.log10(Math.max(1e-9,x)),g=peak>.95?.95/peak:1;if(g<1)for(let ch=0;ch<b.numberOfChannels;ch++){const x=b.getChannelData(ch);for(let i=0;i<x.length;i++)x[i]*=g}
 const silence=env.filter(x=>x<.0001).length/Math.max(1,env.length),speechDb=db(Math.sqrt(voiceEnergy/Math.max(1,voiceCount))),restDb=db(Math.sqrt(otherEnergy/Math.max(1,otherCount)));
 return {peakDb:+db(peak*g).toFixed(1),rmsDb:+db(rms*g).toFixed(1),clipped:clip,invalid,silence:+silence.toFixed(3),speechDb:+speechDb.toFixed(1),restDb:+restDb.toFixed(1),gain:g,pass:invalid===0&&rms>.0001&&silence<.9};
}
root.PBCQuality={repair,evaluate,refine,pcm};
})(typeof window==='object'?window:globalThis);
