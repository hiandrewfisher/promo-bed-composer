p='/home/claude/site/index.html';h=open(p,encoding='utf-8').read()
def rep(a,b):
    global h
    assert h.count(a)==1,(h.count(a),a[:90]);h=h.replace(a,b)
rep('function invalidate(){scheduleRecompose();s.cache.clear();','function invalidate(){s.cache.clear();')
rep("el.onpointerup=e=>{if(!prev)return;const was=prev;prev=null;if(el===clip&&Math.abs(t.offset-was.offset)>.01){t.lockOffset=true;queueBed(t,true)}update()}","el.onpointerup=e=>{if(!prev)return;prev=null;update()}")
rep("s.analysis=null;if(s.tracks.length)recomposeAll();else composeNew(s.firstCount||8)","s.analysis=null;setStatus('Select the part of the read to use, pick a bed length, then press Generate');render()")
rep("if(s.voice){updateSelection();render();recomposeAll()}};$('detect')","if(s.voice){updateSelection();render()}};$('detect')")
rep("for(const t of s.tracks){t.bedLength=s.duration;t.offset=clamp(t.offset,0,Math.max(0,t.bedLength-voiceOutputLength()))}","")
rep('<button id="compose" class="primary">Compose 8 beds</button><button id="recompose" class="pill" title="Rewrite every bed around the current voice selection">Recompose all</button>','<button id="compose" class="primary">Generate 8 beds</button><span class="mini">from the selected read and bed length</span>')
rep('<div id="list"><div class="empty">Composing beds around the demo read…</div></div>','<div id="list"><div class="empty">Select the part of the read to use, pick a bed length, then press Generate. New beds are always added at the bottom.</div></div>')
rep("(s.queue.length?'Composing the first bed…':'Press Compose to write beds around your read.')","(s.queue.length?'Composing the first bed…':'Select the part of the read to use, pick a bed length, then press Generate. New beds are always added at the bottom.')")
rep("rr.title='Recompose this bed with a new arrangement';rr.onclick=()=>{t.seed=newSeed();t.lockOffset=false;queueBed(t,true)};","rr.title='Compose another take in this style for the current selection (added at the bottom)';rr.onclick=()=>{const nb=newBed(t.style,(t.seed^Math.imul((t.takes=(t.takes||0)+1),0x85EBCA6B))>>>0);queueBed(nb);setStatus('Another take of '+t.name+' will be added at the bottom')};")
rep("info.textContent=t.composing?'Recomposing for the current read…':t.metaLine||'';","info.textContent=t.metaLine||'';")
rep("""const newSeed=()=>Math.random()*2**31|0;
function newBed(style){const seed=newSeed(),adj=PBC.ADJ[seed%PBC.ADJ.length];return{id:'bed-'+seed,seed,style,name:adj+' '+STY[style].n,rev:0,file:null,buffer:null,loading:false,level:0,fav:false,minDb:-18,maxDb:-4,offset:1.2,bedLength:s.duration,musicStart:0,lockOffset:false}}""",
"""const fnv=str=>{let x=0x811c9dc5;for(let i=0;i<str.length;i++){x^=str.charCodeAt(i);x=Math.imul(x,16777619)}return x>>>0};
function selectionSeed(){let e=0;const env=s.env||[];for(let i=0;i<env.length;i+=7)e+=env[i];return fnv([s.start.toFixed(3),s.voiceLength.toFixed(3),JSON.stringify(s.skips.map(z=>[+z.start.toFixed(3),+z.end.toFixed(3)])),s.duration,s.voice?s.voice.length:0,e.toFixed(3)].join('|'))}
s.batches={};const names=new Set();
function newBed(style,seed){const adj=PBC.ADJ[seed%PBC.ADJ.length];let nm=adj+' '+STY[style].n,k=2;while(names.has(nm))nm=adj+' '+STY[style].n+' '+k++;names.add(nm);return{id:'bed-'+seed+'-'+names.size,seed,style,name:nm,rev:0,file:null,buffer:null,loading:false,level:0,fav:false,minDb:-18,maxDb:-4,offset:1.2,bedLength:s.duration,musicStart:0,read:[s.start,s.start+s.voiceLength]}}""")
rep("""function queueBed(t,front){const at=s.queue.indexOf(t);if(at>=0)s.queue.splice(at,1);front?s.queue.unshift(t):s.queue.push(t);s.total++;t.composing=true;if(t._info){t._info.textContent='Recomposing for the current read…';t._info.classList.add('busy')}work()}""",
"""function queueBed(t){t.L=s.duration;t.A=analysis();t.readLabel=`read ${fmt(t.read[0])}–${fmt(t.read[1])} · ${t.L}s bed`;s.queue.push(t);s.total++;progress(`${s.queue.length} bed${s.queue.length>1?'s':''} waiting`);work()}""")
rep("""function composeNew(n){if(!s.voice){setStatus('Add a voice recording first');return}let ks=[...s.styles];if(!ks.length)ks=Object.keys(STY);ks.sort(()=>Math.random()-.5);for(let i=0;i<n;i++)queueBed(newBed(ks[i%ks.length]));render()}""",
"""function composeNew(n){if(!s.voice){setStatus('Add a voice recording first');return}const base=selectionSeed(),batch=s.batches[base]=(s.batches[base]||0)+1;let ks=[...s.styles];if(!ks.length)ks=Object.keys(STY);const R=(a=>()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296})(base^batch);ks=ks.map(k=>[R(),k]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);for(let i=0;i<n;i++)queueBed(newBed(ks[i%ks.length],(base^Math.imul(batch*16+i+1,0x9E3779B1))>>>0));setStatus(`Generating ${n} beds for ${fmt(s.start)}–${fmt(s.start+s.voiceLength)} · ${s.duration}s`);render()}""")
rep("""function recomposeAll(){clearTimeout(recTimer);s.analysis=null;const act=s.tracks[s.active];for(const t of s.tracks)if(t!==act)queueBed(t);if(act)queueBed(act,true)}
function scheduleRecompose(){clearTimeout(recTimer);recTimer=setTimeout(()=>{if(s.tracks.length)recomposeAll()},700)}
""","")
rep("""while(s.queue.length&&s.voice){const t=s.queue.shift(),A=analysis(),L=s.duration;""","""while(s.queue.length&&s.voice){const t=s.queue.shift(),A=t.A,L=t.L;""")
rep("""offset:t.lockOffset?t.offset:null""","""offset:null""")
rep("""if(s.queue.includes(t)){s.done++;continue}""","")
rep("""if(!t.lockOffset)t.offset=clamp(r.offset,0,Math.max(0,L-voiceOutputLength()));const m=r.meta;t.metaLine=`${m.key} · ${m.bpm} BPM · ${m.lineup.join(' / ')}`;""","""t.offset=clamp(r.offset,0,Math.max(0,L-voiceOutputLength()));const m=r.meta;t.metaLine=`${m.key} · ${m.bpm} BPM · ${t.readLabel} · ${m.lineup.join(' / ')}`;""")
rep("""render();const i=s.tracks.indexOf(t);if(i===s.active&&live)play(i,livePosition()/live.length)}""","""render()}""")
rep("""$('compose').onclick=()=>composeNew(8);$('recompose').onclick=()=>{if(s.tracks.length)recomposeAll()};""","""$('compose').onclick=()=>composeNew(8);""")
rep("s.firstCount=6;","")
rep("let recTimer=0;","")
rep('372 sampled instruments · 10 styles','Studio-recorded pianos, strings, guitars, winds, sax and Wurlitzer · 12 styles, incl. 414 classical scores reimagined')
rep('Samples: FluidR3 GM (Frank Wen, CC BY 3.0), Musyng Kite and FatBoy (CC BY-SA 3.0) via midi-js-soundfonts; Perfect Drums (TEC Again, WTFPL).','Recordings: Salamander Grand Piano (Alexander Holm, CC BY 3.0); VSCO 2 Community Edition and VCSL (Versilian Studios, CC0); Ivy Audio upright via VSCO; Greg Sullivan Wurlitzer EP200 (CC BY 3.0); nylon guitar (quartertone, Freesound) and steel guitar (University of Iowa) via tonejs-instruments. Scores: music21 corpus (public-domain works; Bach chorales encoded by Margaret Greentree). Effects: Musyng Kite and FatBoy (CC BY-SA 3.0), FluidR3 GM (Frank Wen, CC BY 3.0); Perfect Drums (TEC Again, WTFPL).')
rep("Drag the orange clip to move the voice and the bed recomposes around it.","Drag the orange clip to move the voice.")
rep("every bed is rewritten to fit the new read.","press Generate to write new beds for it.")
rep('t.metaLine=`${m.key} · ${m.bpm} BPM · ${t.readLabel} · ${m.lineup.join(\' / \')}`;','t.metaLine=`${m.source?\'after \'+m.source+\' · \':\'\'}${m.key} · ${m.bpm} BPM · ${t.readLabel} · ${m.lineup.join(\' / \')}`;')
rep('t.metaFull=`${m.style}\\nChords:','t.metaFull=`${m.style}${m.source?\'\\nAfter \'+m.source:\'\'}\\nChords:')
open(p,'w',encoding='utf-8').write(h)
s2=open(p,encoding='utf-8').read()
open('/home/claude/promo-bed-composer-standalone.html','w',encoding='utf-8').write('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+s2+'</html>')
print('patched')
