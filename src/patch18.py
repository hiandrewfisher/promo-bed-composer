core=open('chunky/core.css',encoding='utf-8').read()

EXTRA = """
/* neutralise the earlier box-shadow buttons */
button.ck,.pill.ck,.primary.ck{
  box-shadow:none !important;background:transparent !important;border:0 !important;
  padding:0 !important;border-radius:0 !important;color:var(--ink) !important;
  min-height:var(--h) !important;overflow:visible !important;}
.ck{font-family:Archivo,system-ui,sans-serif}
/* clicks must always land on the button, never on the decorative layers */
.ck>.ck-top,.ck>.ck-top>.ck-cap,.ck .ck-layer,.ck .ck-emo{pointer-events:none}
.ck-cap{font-weight:900;letter-spacing:1px;text-transform:uppercase}
.ck-sm{--w:auto;--h:38px;--fs:.68rem}
.ck-sm .ck-cap{letter-spacing:.06em;padding-inline:12px}
.ck-t{--w:auto;--h:44px;--fs:.72rem}
.ck-t .ck-cap{padding-inline:16px}
.ck-p{--w:auto;--h:52px;--fs:.8rem}
.ck-p .ck-cap{padding-inline:20px}
.ck-q{--w:46px;--h:46px}
.ck-on{--y:var(--push)}
.ck-on .ck-back{filter:drop-shadow(0 1px 1px rgba(0,0,0,.2))}
.ck[disabled]{opacity:.45;pointer-events:none}
.pills,.toolbar,.controls,.settings,.gapControls,.between{align-items:flex-start !important;row-gap:14px !important}
.rampdot{box-shadow:0 1px 3px #0003 !important;background:#fff !important;border-radius:50% !important}
"""

JS = r"""
(function(){
 var SKIP=/rampdot|bedx|trackname|remixOpt|star|knob|tag-|why|ck\b/;
 function hue(b){
   var id=b.id||'', c=b.className||'', t=(b.textContent||'').toLowerCase();
   if(id==='export'||/export\b/.test(t)&&!/ratings/.test(t)) return 'ck-gn';
   if(id==='ratings'||/ratings/.test(t)) return 'ck-yl';
   if(b.classList.contains('primary')||id==='compose') return 'ck-bl';
   if(b.classList.contains('selected')||b.getAttribute('aria-pressed')==='true') return 'ck-bl';
   if(/cancel queue|delete/.test(t)) return 'ck-sl';
   return 'ck-wh';
 }
 function size(b){
   var txt=(b.textContent||'').trim();
   if(b.classList.contains('icon')||(txt.length<=2&&!b.querySelector('*'))) return 'ck-q';
   if(b.classList.contains('primary')||b.id==='compose'||b.id==='export') return 'ck-p';
   if(b.classList.contains('mini')||b.classList.contains('chip')) return 'ck-sm';
   return 'ck-t';
 }
 function wrap(b){
   if(b.dataset.ck==='1'&&b.querySelector(':scope>.ck-top')) return;
   if(SKIP.test(b.className)) return;
   var inner=b.innerHTML;
   b.dataset.ck='1';
   b.classList.add('ck',size(b),hue(b));
   b.innerHTML='<span class="ck-layer ck-back"></span><span class="ck-top">'+
     '<span class="ck-layer ck-front"></span><span class="ck-cap">'+inner+'</span></span>';
 }
 function sync(b){
   if(!b.dataset.ck) return;
   var want=hue(b);
   ['ck-bl','ck-gn','ck-yl','ck-sl','ck-wh','ck-rd','ck-or','ck-te','ck-pi','ck-pu','ck-am'].forEach(function(h){
     if(h!==want) b.classList.remove(h);});
   b.classList.add(want);
   b.classList.toggle('ck-on', b.classList.contains('selected')||b.getAttribute('aria-pressed')==='true');
 }
 function pass(root){
   (root||document).querySelectorAll('button,a.pill,label.pill').forEach(function(b){wrap(b);sync(b);});
 }
 var obs=null,scheduled=false;
 function run(){
   scheduled=false;
   if(obs) obs.disconnect();
   try{ pass(); } catch(e){}
   if(obs) obs.observe(document.documentElement,{childList:true,subtree:true,
     attributes:true,attributeFilter:['class','aria-pressed','disabled']});
 }
 function schedule(){ if(scheduled) return; scheduled=true; requestAnimationFrame(run); }
 function boot(){
   pass();
   obs=new MutationObserver(schedule);
   obs.observe(document.documentElement,{childList:true,subtree:true,
     attributes:true,attributeFilter:['class','aria-pressed','disabled']});
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
 else boot();
})();
"""

p='index.html'; s=open(p,encoding='utf-8').read()
s += '\n<style id="chunky-core">'+core+EXTRA+'</style>\n<script id="chunky-js">'+JS+'</scr'+'ipt>\n'
open(p,'w',encoding='utf-8').write(s)
print('ok 18')
