import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
def one(a,l):
    if s.count(a)!=1: print('ANCHOR %s x%d'%(l,s.count(a)));sys.exit(1)

# The 3D-button decorator re-scanned the WHOLE document on every mutation: with 100
# beds on screen that is 3,000+ buttons walked per frame, and the transport writes
# classes every frame during playback, so it ran every frame and got slower with
# each bed generated. Scan only what actually changed.
a=""" function pass(root){
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
 }"""
one(a,'chunky')
NEW = """ var SEL='button,a.pill,label.pill';
 function pass(root){
   var r=root||document;
   if(r.nodeType===1&&r.matches&&r.matches(SEL)){wrap(r);sync(r);}
   r.querySelectorAll(SEL).forEach(function(b){wrap(b);sync(b);});
 }
 var obs=null,scheduled=false,pending=new Set(),full=false;
 var OBSOPT={childList:true,subtree:true,attributes:true,
   attributeFilter:['class','aria-pressed','disabled']};
 function run(){
   scheduled=false;
   if(obs) obs.disconnect();
   try{
     if(full){ pass(); full=false; }
     else { pending.forEach(function(n){ if(n&&n.isConnected&&n.nodeType===1) pass(n); }); }
   }catch(e){}
   pending.clear();
   if(obs) obs.observe(document.documentElement,OBSOPT);
 }
 function schedule(){ if(scheduled) return; scheduled=true; requestAnimationFrame(run); }
 function note(ms){
   for(var i=0;i<ms.length;i++){
     var m=ms[i];
     if(m.type==='attributes'){ pending.add(m.target); }
     else { for(var j=0;j<m.addedNodes.length;j++){ var n=m.addedNodes[j];
              if(n.nodeType===1) pending.add(n); } }
     if(pending.size>300){ full=true; pending.clear(); break; }
   }
   if(full||pending.size) schedule();
 }
 function boot(){
   pass();
   obs=new MutationObserver(note);
   obs.observe(document.documentElement,OBSOPT);
 }"""
s=s.replace(a,NEW)
io.open(p,'w',encoding='utf-8').write(s);print('patch51 ok')
