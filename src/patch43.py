import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()

LOG = r"""
<script>
/* crash breadcrumbs: every milestone, the heap and the sample-cache size are written to
   localStorage as they happen. if the tab dies the writes survive, so the next load
   prints exactly where it stopped and how much memory was in play at that moment. */
(function(){
 var K='pbc.crumbs', MAX=500, buf=[], dirty=false, t0=Date.now();
 function now(){return ((Date.now()-t0)/1000).toFixed(1)}
 function heap(){ try{ var m=performance.memory; if(!m)return null;
   return {u:Math.round(m.usedJSHeapSize/1048576), t:Math.round(m.totalJSHeapSize/1048576), l:Math.round(m.jsHeapSizeLimit/1048576)} }catch(e){return null} }
 function flush(sync){ dirty=false;
   try{ localStorage.setItem(K, JSON.stringify(buf.slice(-MAX))) }catch(e){
     try{ buf=buf.slice(-120); localStorage.setItem(K, JSON.stringify(buf)) }catch(e2){} } }
 var timer=null;
 function push(kind,msg,extra){
   var h=heap(), m=PBC&&PBC.mem?(function(){try{return PBC.mem()}catch(e){return null}})():null;
   buf.push({s:+now(),k:kind,m:String(msg).slice(0,220),
             heap:h?h.u:null,lim:h?h.l:null,cache:m?m.cacheMB:null,notes:m?m.cachedNotes:null,banks:m?m.banks:null,
             x:extra||undefined});
   if(buf.length>MAX+80)buf=buf.slice(-MAX);
   dirty=true;
   if(kind==='ERR'||kind==='FATAL'){flush(true);return}
   if(!timer)timer=setTimeout(function(){timer=null;if(dirty)flush()},400);
 }
 /* read the previous run before this one overwrites it */
 var prev=null;
 try{ prev=JSON.parse(localStorage.getItem(K)||'null') }catch(e){}
 var unclean = prev && prev.length && prev[prev.length-1].k!=='BYE';
 try{ if(unclean) localStorage.setItem('pbc.lastcrash', JSON.stringify(prev)) }catch(e){}
 buf=[]; push('BOOT','page loaded');

 /* existing [PromoMixer] milestones become breadcrumbs with no call-site changes */
 var L=console.log;
 console.log=function(){ try{ if(typeof arguments[0]==='string'&&arguments[0].indexOf('[PromoMixer]')===0)
     push('STEP', Array.prototype.slice.call(arguments,1).join(' ')||arguments[0]); }catch(e){}
   return L.apply(console,arguments) };
 var E=console.error;
 console.error=function(){ try{ push('ERR', Array.prototype.slice.call(arguments).map(function(a){
     return a&&a.stack?a.stack:(a&&a.message?a.message:String(a))}).join(' | ')) }catch(e){}
   return E.apply(console,arguments) };

 window.addEventListener('error',function(e){ push('FATAL','window.onerror: '+(e.message||'')+' @'+(e.filename||'')+':'+(e.lineno||'')+(e.error&&e.error.stack?'\n'+e.error.stack:'')) });
 window.addEventListener('unhandledrejection',function(e){ var r=e.reason;
   push('FATAL','unhandled rejection: '+(r&&r.stack?r.stack:(r&&r.message?r.message:String(r)))) });
 window.addEventListener('pagehide',function(){ push('BYE','page closed'); flush(true) });
 document.addEventListener('visibilitychange',function(){ push('VIS',document.visibilityState) });

 /* a heartbeat, so an out-of-memory kill leaves a visible ramp instead of silence */
 var lastWarn=0;
 setInterval(function(){ var h=heap(); if(!h)return;
   var frac=h.l?h.u/h.l:0;
   if(frac>0.72 && Date.now()-lastWarn>4000){ lastWarn=Date.now();
     push('MEMWARN','heap '+h.u+' / '+h.l+' MB ('+Math.round(frac*100)+'% of tab limit)'); flush(true);
     L('[PromoMixer] memory '+h.u+'/'+h.l+'MB — '+Math.round(frac*100)+'% of this tab’s limit'); }
   else push('TICK','heap');
 },1000);

 function fmt(list){ if(!list||!list.length)return '(no log)';
   return list.map(function(e){
     return (e.s+'s').padStart(7)+'  '+e.k.padEnd(7)+' '+
       (e.heap!=null?('heap '+String(e.heap).padStart(4)+'/'+e.lim+'MB'):'heap    ?')+
       (e.cache!=null?('  samples '+String(e.cache).padStart(5)+'MB/'+e.notes+'n/'+e.banks+'b'):'')+
       '  '+e.m }).join('\n') }
 window.PBCCRASH=function(){ var c=null; try{c=JSON.parse(localStorage.getItem('pbc.lastcrash')||'null')}catch(e){}
   var txt='=== PREVIOUS RUN (ended without closing) ===\n'+fmt(c)+'\n\n=== THIS RUN ===\n'+fmt(buf);
   L(txt); try{navigator.clipboard&&navigator.clipboard.writeText(txt)}catch(e){} return txt };
 window.PBCLOG=function(){ L(fmt(buf)); return fmt(buf) };

 if(unclean){ var tail=prev.slice(-40);
   console.warn('[PromoMixer] the previous run ended without closing the page — last '+tail.length+
     ' breadcrumbs below. run PBCCRASH() to copy the full log.');
   L(fmt(tail)); }
 else L('[PromoMixer] crash logging on. PBCLOG() for this run, PBCCRASH() for the last bad one.');
})();
</scr'+'ipt>
"""
LOG = LOG.replace("</scr'+'ipt>", "</scr"+chr(39)+"+"+chr(39)+"ipt>")
# write the tag without closing the host script prematurely
LOG = LOG.replace("</scr'+'ipt>", "</script>")
s = s + LOG
io.open(p,'w',encoding='utf-8').write(s);print('crash logging ok')
