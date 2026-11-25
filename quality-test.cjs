// Run with node quality-test.cjs, no browser or downloads required.
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8'),userlib=fs.readFileSync('userlib.js','utf8'),quality=fs.readFileSync('quality.js','utf8');
for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!/\bsrc=/.test(m[1]))new Function(m[2]);
new Function(userlib);new Function(quality);new Function(fs.readFileSync('pitch-worker.js','utf8'));
const w={},i=html.indexOf('window.PBC={'),a=html.lastIndexOf('<script>',i)+8,b=html.indexOf('</script>',i);
new Function('window','document','location','navigator','MessageChannel','fetch','setTimeout','clearTimeout','performance',html.slice(a,b))(w,{}, {href:'https://example.com/'},{},class {constructor(){this.port1={};this.port2={postMessage(){}}}},async()=>{throw Error('network disabled')},()=>0,()=>{},{now:()=>0});
new Function('window',quality)(w);
const Q=w.PBCQuality,k=userlib.slice(userlib.indexOf('function kernel(){'),userlib.indexOf('/* ---- ingest')),out=[];
const worker=new Function('postMessage','performance','let onmessage;'+k+';kernel();return onmessage')(x=>out.push(x),{now:()=>Date.now()});
const sr=11025,pcm=new Float32Array(sr*12);
for(let i=0;i<pcm.length;i++){let t=i/sr,m=[65,69,72,67,65,70,74,69][Math.floor(t*2)%8];pcm[i]=.2*Math.sin(2*Math.PI*440*Math.pow(2,(m-69)/12)*t)+.08*Math.sin(2*Math.PI*174.614*t)}
worker({data:{pcm:pcm.buffer,sr,name:'fixture.wav'}});assert.equal(out.at(-1).type,'done');
const p=Q.repair({...out.at(-1).piece,_i:'fixture'});assert(p.mel.length>=4);assert.equal(Q.repair(p),p);
for(const genre of ['indie','jazz','cinematic','ambient']){const ids=new Set();for(let n=0;n<8;n++){const A={len:25,rate:3,pauses:[{t:6,d:.5}],onsets:[6.5],f0:125,midi:48,pc:0,cents:0,hist:Array(12).fill(1),ph:[],range:[45,53],act:Array(500).fill(.5),smooth:Array(500).fill(.5),actHop:.05,acf:[],energy:.4};let best;for(let j=0;j<3;j++){const o={seed:123+n*100003+j*12317,genre,faith:.8,L:25,A,piece:p},c=Q.refine(w.PBC._compose(o),o),rating=Q.evaluate(c,o);if(!best||rating.score>best.rating.score)best={c,rating}}const {c,rating}=best;assert(c.notes.length>0);assert(Number.isFinite(rating.score));assert(c.offset+A.len<=25.00001);assert(c.meta.button<=25.00001);ids.add(JSON.stringify(c.notes.slice(0,16).map(n=>[n.m,n.t,n.r.id])))}assert.equal(ids.size,8);console.log(genre+': 8 unique, duration-matched scores')}
const fake=a=>({sampleRate:44100,numberOfChannels:1,getChannelData:()=>a});
assert(!Q.pcm(fake(new Float32Array(44100))).pass);assert(Q.pcm(fake(new Float32Array(44100).fill(.3))).pass);
assert(html.includes('window.PBCSourceBusy='));
assert(userlib.includes('Math.min(list.length,opts.limit,1)'));
console.log('96 candidate scores, 32 selected scores, transcription and PCM checks passed');

(async()=>{const sample=(hz,amp)=>{const sampleRate=16000,x=Float32Array.from({length:16000},(_,i)=>amp*Math.sin(2*Math.PI*hz*i/sampleRate));return {sampleRate,duration:1,numberOfChannels:1,getChannelData:()=>x}};
 const note=(name,id,m,v)=>({r:{name,kind:'piano'},id,m,key:m,t:0,dur:1,v,tune:0});
 const b=await w.PBC._balance({notes:[note('keys','a',69,.8),note('lead','b',72,.3)],hits:[]},['keys','lead'],{}, {a:sample(440,.6),b:sample(523,.2)},{},3);
 assert(Object.values(b.g).every(Number.isFinite));assert(b.g.lead>b.g.keys);
 assert.equal([...html.matchAll(/await graph\(/g)].length,1);
 assert(!html.includes('graph(false)'));console.log('Sample-based balancing: finite gains, quieter part boosted relative to louder part, one graph pass');
})().catch(e=>{console.error(e);process.exitCode=1});
