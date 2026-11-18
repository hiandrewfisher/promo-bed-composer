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
 try{ FR = new FinalizationRegistry(function(k){ var c=cat(k); c.gc++; c.out--; }); }catch(e){}
 function watch(obj,k){ if(FR&&obj){ try{ FR.register(obj,k) }catch(e){} } }

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
     try{ made(key, sizeOf?sizeOf(o,arguments):0); watch(o,key); }catch(e){}
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
   made('Blob', b.size); watch(b,'Blob'); return b } PB.prototype=B.prototype; window.Blob=PB; }catch(e){}
 try{ var F=window.File; function PF(parts,name,opt){ var f=new F(parts,name,opt);
   made('File(WAV)', f.size); watch(f,'File(WAV)'); return f } PF.prototype=F.prototype; window.File=PF; }catch(e){}

 /* audio nodes, by type, plus their params */
 ['BaseAudioContext','AudioContext','OfflineAudioContext'].forEach(function(cn){
   var proto = window[cn] && window[cn].prototype; if(!proto) return;
   Object.getOwnPropertyNames(proto).forEach(function(m){
     if(m.indexOf('create')!==0) return;
     var orig; try{ orig = proto[m] }catch(e){ return }
     if(typeof orig!=='function') return;
     try{ proto[m] = function(){ var n = orig.apply(this,arguments);
       try{ var k='node:'+m.slice(6);
         made(k, m==='createBuffer' ? bufBytes(n) : 0); watch(n,k);
       }catch(e){}
       return n } }catch(e){}
   });
   if(proto.decodeAudioData){ var dd=proto.decodeAudioData;
     try{ proto.decodeAudioData=function(){ made('decode:pending');
       var r = dd.apply(this,arguments);
       if(r&&r.then) return r.then(function(b){ freed('decode:pending'); made('AudioBuffer',bufBytes(b)); watch(b,'AudioBuffer'); return b },
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
 var st=window.setTimeout, ct=window.clearTimeout, si=window.setInterval, ci=window.clearInterval;
 window.setTimeout=function(){ made('timer'); var a=[].slice.call(arguments);
   if(typeof a[0]==='function'){ var f=a[0]; a[0]=function(){ freed('timer'); return f.apply(this,arguments) } }
   return st.apply(window,a) };
 window.clearTimeout=function(id){ freed('timer'); return ct.call(window,id) };
 window.setInterval=function(){ made('interval'); return si.apply(window,arguments) };
 window.clearInterval=function(id){ freed('interval'); return ci.call(window,id) };
 var raf=window.requestAnimationFrame, caf=window.cancelAnimationFrame;
 window.requestAnimationFrame=function(fn){ made('frame');
   return raf.call(window,function(t){ freed('frame'); return fn(t) }) };
 window.cancelAnimationFrame=function(id){ freed('frame'); return caf.call(window,id) };
 try{ var ET=EventTarget.prototype, al=ET.addEventListener, rl=ET.removeEventListener;
   ET.addEventListener=function(){ made('listener'); return al.apply(this,arguments) };
   ET.removeEventListener=function(){ freed('listener'); return rl.apply(this,arguments) }; }catch(e){}

 /* ---- periodic snapshot ----------------------------------------------- */
 var SNAPS=[], SNAPMAX=2000;
 function heap(){ try{ var m=performance.memory; return m?{u:Math.round(m.usedJSHeapSize/1048576),
   a:Math.round(m.totalJSHeapSize/1048576), l:Math.round(m.jsHeapSizeLimit/1048576)}:null }catch(e){ return null } }
 function engine(){ try{ return window.PBC&&PBC.mem?PBC.mem():null }catch(e){ return null } }
 function estat(){ try{ return window.PBC&&PBC.stat?PBC.stat():null }catch(e){ return null } }
 function snapshot(){
   if(!ON) return;
   var s={ t:Date.now()-T0, stage:STAGE, heap:heap(), engine:engine(), stat:estat(),
           dom:(function(){ try{ return document.getElementsByTagName('*').length }catch(e){ return 0 } })(),
           beds:(function(){ try{ return document.querySelectorAll('.track').length }catch(e){ return 0 } })(),
           res:{} };
   for(var k in R){ var c=R[k]; s.res[k]={out:c.out,made:c.made,freed:c.freed,gc:c.gc,
     mb:+(c.bytes/1048576).toFixed(2),peak:c.peak,peakMb:+(c.peakBytes/1048576).toFixed(2)}; }
   SNAPS.push(s); if(SNAPS.length>SNAPMAX) SNAPS.shift();
   checkpoint(s);
   return s;
 }
 /* compact emergency checkpoint: survives a renderer kill */
 function checkpoint(s){
   try{ localStorage.setItem('pbc.diag.last', JSON.stringify({sid:SID,at:Date.now(),snap:s})) }catch(e){}
 }

 /* ---- IndexedDB, bounded batches -------------------------------------- */
 var db=null, qSnap=[], qEv=0;
 try{ var rq=indexedDB.open('pbc-diag',1);
   rq.onupgradeneeded=function(e){ var d=e.target.result;
     if(!d.objectStoreNames.contains('sessions')) d.createObjectStore('sessions',{keyPath:'sid'});
     if(!d.objectStoreNames.contains('snaps')) d.createObjectStore('snaps',{autoIncrement:true}).createIndex('sid','sid');
     if(!d.objectStoreNames.contains('events')) d.createObjectStore('events',{autoIncrement:true}).createIndex('sid','sid'); };
   rq.onsuccess=function(e){ db=e.target.result; put('sessions',{sid:SID,started:T0,ua:navigator.userAgent,clean:false}); };
 }catch(e){}
 function put(store,val){ if(!db) return; try{ var tx=db.transaction(store,'readwrite'); tx.objectStore(store).put(val) }catch(e){} }
 function add(store,val){ if(!db) return; try{ var tx=db.transaction(store,'readwrite'); tx.objectStore(store).add(val) }catch(e){} }

 var tick=setInterval(function(){
   var s=snapshot(); if(!s) return;
   add('snaps',{sid:SID,s:s});
   if(EV.length){ var batch=EV.splice(0,Math.min(EV.length,500)); add('events',{sid:SID,t:s.t,e:batch}); }
 },1000);

 window.addEventListener('pagehide',function(){
   try{ var s=snapshot(); add('snaps',{sid:SID,s:s}); put('sessions',{sid:SID,started:T0,ua:navigator.userAgent,clean:true}) }catch(e){}
 });

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
   clear:function(){ try{ indexedDB.deleteDatabase('pbc-diag'); localStorage.removeItem('pbc.diag.last') }catch(e){} }
 };
 try{ console.log('[PromoMixer] resource ledger on — session '+SID+
   '. __PBCDIAG.table() for the live counts, diagnostics.html for previous sessions.') }catch(e){}
})();
