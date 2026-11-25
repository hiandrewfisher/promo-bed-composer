/* Promo Bed Composer — resource ledger.
   Counts only. It never holds a reference to anything it measures, so it cannot
   itself keep a buffer or a node alive. Byte figures are ESTIMATES computed from
   each object's own shape; they are not measured native memory. */
(function(){
 if(window.__PBCDIAG) return;
 var SID = (Date.now().toString(36)+Math.random().toString(36).slice(2,8));
 var T0  = Date.now();
 var ON  = true;

 /* ---- counters -------------------------------------------------------- */
 var R = Object.create(null);
 function cat(k){ return R[k] || (R[k] = {made:0,freed:0,out:0,peak:0,bytes:0,peakBytes:0,gc:0}); }
 function made(k,bytes,id){ if(!ON)return; var c=cat(k); c.made++; c.out++;
   if(c.out>c.peak)c.peak=c.out;
   if(bytes){ c.bytes+=bytes; if(c.bytes>c.peakBytes)c.peakBytes=c.bytes; }
   ev('+',k,bytes,id); }
 function freed(k,bytes,id){ if(!ON)return; var c=cat(k); c.freed++; c.out--;
   if(bytes) c.bytes-=bytes; ev('-',k,bytes,id); }

 /* GC observation: tells an explicit release apart from a collection */
 var FR = null;
 try{ FR = new FinalizationRegistry(function(h){ var c=cat(h.k); c.gc++; c.out--;
   if(h.b) c.bytes-=h.b; }); }catch(e){}
 function watch(obj,k,bytes){ if(FR&&obj){ try{ FR.register(obj,{k:k,b:bytes||0}) }catch(e){} } }

 /* ---- event ring ------------------------------------------------------ */
 var EV = [], EVMAX = 4000, SEQ = 0;
 function ev(sign,k,bytes,id){
   if(EV.length>=EVMAX) EV.shift();
   EV.push({n:++SEQ,t:Date.now()-T0,s:sign,k:k,b:bytes||0,id:id||null,stage:STAGE});
 }
 var STAGE='idle';
 function stage(name){ STAGE=name; ev('|','stage',0,name); snapshot(); }

 /* ---- patches --------------------------------------------------------- */
 function wrapCtor(scope,name,key,sizeOf){
   var C = scope[name]; if(!C) return;
   function P(){ var o = new (Function.prototype.bind.apply(C,[null].concat([].slice.call(arguments))));
     try{ var _b = sizeOf?sizeOf(o,arguments):0; made(key,_b); watch(o,key,_b); }catch(e){}
     return o; }
   P.prototype = C.prototype; try{ scope[name]=P }catch(e){}
 }
 var bufBytes = function(b){ try{ return b.length*b.numberOfChannels*4 }catch(e){ return 0 } };

 wrapCtor(window,'AudioContext','AudioContext');
 wrapCtor(window,'OfflineAudioContext','OfflineAudioContext',function(o,a){
   try{ return (o.length||0)*(o.destination?o.destination.channelCount:2)*4 }catch(e){ return 0 } });
 wrapCtor(window,'MessageChannel','MessageChannel');
 wrapCtor(window,'AudioBuffer','AudioBuffer',bufBytes);
 try{ var B=window.Blob; function PB(parts,opt){ var b=new B(parts,opt);
   made('Blob', b.size); watch(b,'Blob',b.size); return b } PB.prototype=B.prototype; window.Blob=PB; }catch(e){}
 try{ var F=window.File; function PF(parts,name,opt){ var f=new F(parts,name,opt);
   made('File(WAV)', f.size); watch(f,'File(WAV)',f.size); return f } PF.prototype=F.prototype; window.File=PF; }catch(e){}

 /* audio nodes, by type, plus their params */
 ['BaseAudioContext','AudioContext','OfflineAudioContext'].forEach(function(cn){
   var proto = window[cn] && window[cn].prototype; if(!proto) return;
   Object.getOwnPropertyNames(proto).forEach(function(m){
     if(m.indexOf('create')!==0) return;
     var orig; try{ orig = proto[m] }catch(e){ return }
     if(typeof orig!=='function') return;
     try{ proto[m] = function(){ var n = orig.apply(this,arguments);
       try{ var k='node:'+m.slice(6);
         var _nb = m==='createBuffer' ? bufBytes(n) : 0; made(k,_nb); watch(n,k,_nb);
       }catch(e){}
       return n } }catch(e){}
   });
   if(proto.decodeAudioData){ var dd=proto.decodeAudioData;
     try{ proto.decodeAudioData=function(){ made('decode:pending');
       var r = dd.apply(this,arguments);
       if(r&&r.then) return r.then(function(b){ freed('decode:pending'); var _db=bufBytes(b); made('AudioBuffer',_db); watch(b,'AudioBuffer',_db); return b },
                                   function(e){ freed('decode:pending'); throw e });
       return r } }catch(e){} }
 });

 /* connections */
 try{ var AN=window.AudioNode&&AudioNode.prototype;
   if(AN){ var co=AN.connect, di=AN.disconnect;
     AN.connect=function(){ made('connect() calls'); return co.apply(this,arguments) };
     AN.disconnect=function(){ freed('connect() calls'); return di.apply(this,arguments) }; } }catch(e){}

 /* object URLs */
 try{ var cu=URL.createObjectURL, ru=URL.revokeObjectURL;
   URL.createObjectURL=function(o){ made('ObjectURL', o&&o.size||0); return cu.apply(URL,arguments) };
   URL.revokeObjectURL=function(u){ freed('ObjectURL'); return ru.apply(URL,arguments) }; }catch(e){}

 /* timers, frames, listeners */
 var st=window.setTimeout,ct=window.clearTimeout,si=window.setInterval,ci=window.clearInterval;
 var timers=new Set(),intervals=new Set(),frames=new Set();
 function clearTracked(id){if(timers.delete(id))freed('timer');if(intervals.delete(id))freed('interval')}
 window.setTimeout=function(fn,delay,...args){if(typeof fn!=='function')return st.call(window,fn,delay,...args);var id=st.call(window,function(...a){if(timers.delete(id))freed('timer');return fn.apply(this,a)},delay,...args);timers.add(id);made('timer');return id};
 window.clearTimeout=function(id){clearTracked(id);return ct.call(window,id)};
 window.setInterval=function(...a){var id=si.apply(window,a);intervals.add(id);made('interval');return id};
 window.clearInterval=function(id){clearTracked(id);return ci.call(window,id)};
 var raf=window.requestAnimationFrame,caf=window.cancelAnimationFrame;
 window.requestAnimationFrame=function(fn){var id=raf.call(window,function(t){if(frames.delete(id))freed('frame');return fn(t)});frames.add(id);made('frame');return id};
 window.cancelAnimationFrame=function(id){if(frames.delete(id))freed('frame');return caf.call(window,id)};
 try{ var ET=EventTarget.prototype, al=ET.addEventListener, rl=ET.removeEventListener;
   ET.addEventListener=function(){ made('listener'); return al.apply(this,arguments) };
   ET.removeEventListener=function(){ freed('listener'); return rl.apply(this,arguments) }; }catch(e){}

 /* ---- periodic snapshot ----------------------------------------------- */
 var SNAPS=[], SNAPMAX=2000;
 function heap(){ try{ var m=performance.memory; return m?{u:Math.round(m.usedJSHeapSize/1048576),
   a:Math.round(m.totalJSHeapSize/1048576), l:Math.round(m.jsHeapSizeLimit/1048576)}:null }catch(e){ return null } }
 var NATIVE=null,natBusy=false;
 function native(){
   try{
     if(natBusy||!performance.measureUserAgentSpecificMemory||!self.crossOriginIsolated) return NATIVE;
     natBusy=true;
     performance.measureUserAgentSpecificMemory().then(function(m){
       natBusy=false;
       var by={};(m.breakdown||[]).forEach(function(b){ var t=(b.types||['other']).join('+');
         by[t]=(by[t]||0)+b.bytes });
       NATIVE={totalMB:+(m.bytes/1048576).toFixed(1),by:by};
     },function(){ natBusy=false });
   }catch(e){ natBusy=false }
   return NATIVE;
 }
 function engine(){ try{ return window.PBC&&PBC.mem?PBC.mem():null }catch(e){ return null } }
 function estat(){ try{ return window.PBC&&PBC.stat?PBC.stat():null }catch(e){ return null } }
 function snapshot(){
   if(!ON) return;
   var s={ t:Date.now()-T0, stage:STAGE, heap:heap(), native:native(), engine:engine(), stat:estat(),
           dom:(function(){ try{ return document.getElementsByTagName('*').length }catch(e){ return 0 } })(),
           beds:(function(){ try{ return document.querySelectorAll('.track').length }catch(e){ return 0 } })(),
           res:{} };
   for(var k in R){ var c=R[k]; s.res[k]={out:c.out,made:c.made,freed:c.freed,gc:c.gc,
     mb:+(c.bytes/1048576).toFixed(2),peak:c.peak,peakMb:+(c.peakBytes/1048576).toFixed(2)}; }
   SNAPS.push(s); if(SNAPS.length>SNAPMAX) SNAPS.shift();
   checkpoint(s);
   return s;
 }
 /* Preserve the last session's checkpoint before writing a new one. */
 try{var previous=JSON.parse(localStorage.getItem('pbc.diag.last')||'null');if(previous&&previous.sid!==SID)localStorage.setItem('pbc.diag.last.previous',JSON.stringify(previous))}catch(e){}
 /* compact emergency checkpoint: survives a renderer kill */
 function checkpoint(s){
   try{ localStorage.setItem('pbc.diag.last', JSON.stringify({sid:SID,at:Date.now(),snap:s})) }catch(e){}
 }

 /* ---- IndexedDB, bounded batches -------------------------------------- */
 var db=null, opening=false, pending=null, nextOpen=0, registered=false, dbState='opening';
 function dbStatus(state,error){dbState=state;try{localStorage.setItem('pbc.diag.storage',JSON.stringify({sid:SID,at:Date.now(),state,error:error?String(error):null}))}catch(e){}}
 function disconnect(state,error){var d=db;db=null;registered=false;pending=null;nextOpen=Date.now()+30000;if(d)try{d.close()}catch(e){}dbStatus(state,error)}
 function connect(){if(db||opening||Date.now()<nextOpen)return;opening=true;dbStatus('opening');
   try{var rq=indexedDB.open('pbc-diag');var deadline=st.call(window,function(){dbStatus('open-timeout','IndexedDB did not answer; using local checkpoint');},8000);
     rq.onupgradeneeded=function(e){var d=e.target.result;
       if(!d.objectStoreNames.contains('sessions'))d.createObjectStore('sessions',{keyPath:'sid'});
       if(!d.objectStoreNames.contains('snaps'))d.createObjectStore('snaps',{autoIncrement:true}).createIndex('sid','sid');
       if(!d.objectStoreNames.contains('events'))d.createObjectStore('events',{autoIncrement:true}).createIndex('sid','sid')};
     rq.onsuccess=function(){ct.call(window,deadline);opening=false;db=rq.result;registered=false;var d=db;
       d.onversionchange=function(){if(db===d)disconnect('versionchange');else d.close()};
       d.onclose=function(){if(db===d)disconnect('closed')};dbStatus('ready')};
     rq.onerror=function(){ct.call(window,deadline);opening=false;disconnect('open-error',rq.error)};
     rq.onblocked=function(){dbStatus('blocked','Another connection is blocking IndexedDB')};
   }catch(e){opening=false;disconnect('open-error',e)}
 }
 function persist(s,clean){if(!db||pending)return false;
   var tx,batch=EV.slice(0,500),d=db;
   try{tx=d.transaction(['sessions','snaps','events'],'readwrite');pending=tx;
     var timer=st.call(window,function(){if(pending!==tx)return;try{tx.abort()}catch(e){}disconnect('write-timeout','Diagnostic storage did not complete; using local checkpoint')},8000);
     tx.oncomplete=function(){ct.call(window,timer);if(pending!==tx)return;pending=null;registered=true;EV.splice(0,Math.min(EV.length,batch.length))};
     tx.onerror=tx.onabort=function(){ct.call(window,timer);if(pending===tx)disconnect('write-error',tx.error)};
     if(!registered||clean)tx.objectStore('sessions').put({sid:SID,started:T0,ua:navigator.userAgent,clean:!!clean});
     if(s)tx.objectStore('snaps').add({sid:SID,s:s});
     if(batch.length)tx.objectStore('events').add({sid:SID,t:s?s.t:Date.now()-T0,e:batch});
     return true;
   }catch(e){if(tx)try{tx.abort()}catch(err){}disconnect('write-error',e);return false}
 }
 connect();
 var tick=setInterval(function(){var s=snapshot();if(!s)return;connect();persist(s,false)},1000);
 window.addEventListener('pagehide',function(){try{var s=snapshot();if(s)persist(s,true)}catch(e){}});
 /* ---- console surface -------------------------------------------------- */
 function table(){ var s=snapshot(), rows=[];
   for(var k in s.res){ var c=s.res[k]; if(!c.made) continue;
     rows.push([k,c.made,c.freed,c.gc,c.out,c.mb,c.peak].join('\t')); }
   return 'session '+SID+'  t='+(s.t/1000).toFixed(0)+'s  stage='+s.stage+
     '  heap '+(s.heap?s.heap.u+'/'+s.heap.l+'MB':'?')+'  dom '+s.dom+'  beds '+s.beds+
     '\nresource\tmade\tfreed\tgc\tout\tMB\tpeak\n'+rows.join('\n');
 }
 window.__PBCDIAG={
   sid:SID, on:function(){ON=true}, off:function(){ON=false},
   snapshot:snapshot, stage:stage, table:function(){ console.log(table()); return table() },
   counters:function(){ return JSON.parse(JSON.stringify(R)) },
   snaps:function(){ return SNAPS.slice() },
   exportJSON:function(){ return JSON.stringify({sid:SID,started:T0,snaps:SNAPS,events:EV},null,1) },
   clear:function(){if(!db||pending)return false;try{var tx=db.transaction(['sessions','snaps','events'],'readwrite');for(var k of ['sessions','snaps','events'])tx.objectStore(k).clear();tx.oncomplete=function(){registered=false;try{localStorage.removeItem('pbc.diag.last');localStorage.removeItem('pbc.diag.last.previous')}catch(e){}};return true}catch(e){return false}}
 };
 try{ console.log('[PromoMixer] resource ledger on — session '+SID+
   '. __PBCDIAG.table() for the live counts, diagnostics.html for previous sessions.') }catch(e){}
})();

/* Bounded crash breadcrumbs: metadata only, never retain audio or tensors. */
(function(){
 const D=window.__PBCDIAG;if(!D)return;
 const key='pbc.diag.breadcrumbs',sid=D.sid,now=()=>performance.now();
 let seq=0,ring=[],active=new Map(),last=now(),dirty=false;
 let old;try{old=localStorage.getItem(key)}catch(e){}
 try{if(old)localStorage.setItem(key+'.previous',old)}catch(e){}
 let lastFlush=-1000,flushMs=0,flushCount=0;function flush(){const t=now();try{localStorage.setItem(key,JSON.stringify({sid,at:Date.now(),active:[...active.values()].slice(0,100),events:ring}));dirty=false;lastFlush=t;flushCount++;flushMs+=now()-t}catch(e){}}
 function log(type,data={},urgent=false){ring.push({n:++seq,t:Math.round(now()),type,...data});if(ring.length>256)ring.shift();dirty=true;if(urgent&&now()-lastFlush>250)flush()}
 function size(x){return x?.byteLength??x?.size??(x?.length&&x?.numberOfChannels?x.length*x.numberOfChannels*4:0)}
 function wrap(o,k,label,meta){if(!o||typeof o[k]!=='function'||o[k].__pbcTrace)return;const f=o[k];function traced(...a){let id=++seq,t=now(),d={id,label,...(meta?meta(a,this):{})};active.set(id,d);log('begin',d,true);function end(ok,v){active.delete(id);log(ok?'end':'error',{id,label,ms:Math.round(now()-t),bytes:size(v),error:ok?undefined:String(v).slice(0,300)},!ok);return v}try{let v=f.apply(this,a);if(v&&typeof v.then==='function'){v.then(x=>end(true,x),e=>end(false,e));return v}return end(true,v)}catch(e){end(false,e);throw e}}traced.__pbcTrace=true;try{o[k]=traced}catch(e){}}
 wrap(window,'fetch','fetch',a=>({url:String(a[0]?.url??a[0]).split('?')[0].slice(0,200)}));
 for(const k of ['arrayBuffer','json','blob','text'])wrap(window.Response?.prototype,k,'response.'+k);
 wrap(window.Blob?.prototype,'arrayBuffer','blob.read',(_,o)=>({bytes:o.size}));
 wrap(window.BaseAudioContext?.prototype,'decodeAudioData','audio.decode',a=>({bytes:size(a[0])}));
 wrap(window.OfflineAudioContext?.prototype,'startRendering','audio.render',(_,o)=>({frames:o.length,rate:o.sampleRate}));
 wrap(window.AudioContext?.prototype,'close','audio.close');
 wrap(window.WebAssembly,'instantiate','wasm.instantiate',a=>({bytes:size(a[0])}));
 wrap(window.WebAssembly,'instantiateStreaming','wasm.streaming');
 wrap(window.WebAssembly?.Memory?.prototype,'grow','wasm.grow',(a,o)=>({pages:a[0],bytes:o.buffer.byteLength}));
 wrap(window.IDBObjectStore?.prototype,'put','storage.put',(_,o)=>({store:o.name}));
 wrap(window.IDBObjectStore?.prototype,'add','storage.add',(_,o)=>({store:o.name}));
 addEventListener('error',e=>log('window.error',{message:String(e.message||e.type),file:e.filename,line:e.lineno},true));
 addEventListener('unhandledrejection',e=>log('rejection',{message:String(e.reason).slice(0,500)},true));
 addEventListener('pagehide',()=>log('pagehide',{},true));
 document.addEventListener('visibilitychange',()=>log('visibility',{state:document.visibilityState},true));
 try{new PerformanceObserver(l=>{for(const e of l.getEntries())log('longtask',{ms:Math.round(e.duration)})}).observe({type:'longtask',buffered:true})}catch(e){}
 const stage=D.stage;D.stage=function(name){log('stage',{name},true);return stage.apply(this,arguments)};
 const timer=setInterval(()=>{let t=now(),m=performance.memory;log('heartbeat',{lag:Math.max(0,Math.round(t-last-1000)),heap:m?.usedJSHeapSize,limit:m?.jsHeapSizeLimit,active:active.size,flushMs,flushCount});last=t;const ort=window.ort;wrap(ort?.InferenceSession,'create','onnx.create',a=>({bytes:size(a[0])}));wrap(ort?.InferenceSession?.prototype,'run','onnx.run');wrap(ort?.InferenceSession?.prototype,'release','onnx.release');if(dirty)flush()},1000);
 D.trace=log;D.breadcrumbs=()=>({sid,active:[...active.values()],events:ring.slice()});D.previousBreadcrumbs=()=>JSON.parse(localStorage.getItem(key+'.previous')||'null');
})();

/* Supplemental proxies: no strong references to resources. */
(function(){
 const D=window.__PBCDIAG;if(!D?.trace)return;
 const log=D.trace, ids=new WeakMap();let next=0;
 function id(o){if(!ids.has(o))ids.set(o,++next);return ids.get(o)}
 function patch(o,k,cb){if(!o||typeof o[k]!=='function')return;const f=o[k];try{o[k]=function(...a){return cb.call(this,f,a)}}catch(e){}}
 function ctor(k,cb){const C=window[k];if(!C)return;try{window[k]=new Proxy(C,{construct(t,a,n){const o=Reflect.construct(t,a,n);cb(o,a);return o}})}catch(e){}}
 ctor('Worker',(w,a)=>{const n=id(w);log('worker.create',{id:n,url:String(a[0]).split('?')[0]},true);w.addEventListener('error',e=>log('worker.error',{id:n,message:e.message},true));w.addEventListener('messageerror',()=>log('worker.messageerror',{id:n},true))});
 patch(window.Worker?.prototype,'terminate',function(f,a){log('worker.terminate',{id:id(this)},true);return f.apply(this,a)});
 let messages=0,bytes=0;
 patch(window.Worker?.prototype,'postMessage',function(f,a){messages++;const x=a[1]?.transfer||a[1];if(Array.isArray(x))for(const b of x)bytes+=b?.byteLength||0;return f.apply(this,a)});
 const seen=new WeakSet();function tensor(t,kind){if(!t||typeof t!=='object'||seen.has(t))return;seen.add(t);let count=Array.isArray(t.dims)?t.dims.reduce((a,b)=>a*b,1):0;log('tensor.observe',{id:id(t),kind,count,type:t.type});}
 function install(){const ort=window.ort,p=ort?.InferenceSession?.prototype;if(p&&!p.__pbcTensor){p.__pbcTensor=true;patch(p,'run',function(f,a){for(const t of Object.values(a[0]||{}))tensor(t,'input');const v=f.apply(this,a);v.then(out=>{for(const t of Object.values(out||{}))tensor(t,'output')},()=>{});return v})}const tp=ort?.Tensor?.prototype;if(tp&&!tp.__pbcDispose){tp.__pbcDispose=true;patch(tp,'dispose',function(f,a){log('tensor.dispose',{id:id(this)});return f.apply(this,a)})}}
 setInterval(()=>{install();log('worker.traffic',{messages,transferBytes:bytes});messages=bytes=0},1000);
 D.trace('diagnostics.version',{version:2},true);
})();
