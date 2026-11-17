import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
def one(a,l):
    if s.count(a)!=1: print('ANCHOR %s x%d'%(l,s.count(a)));sys.exit(1)

# the UI yield used its own per-call MessageChannel too; route it through the
# engine's shared one
a="function yieldNow(){return new Promise(r=>{try{const mc=new MessageChannel();mc.port1.onmessage=()=>r();mc.port2.postMessage(0)}catch(e){setTimeout(r,0)}})}"
one(a,'yieldNow')
s=s.replace(a,"function yieldNow(){try{if(PBC&&PBC.yield)return PBC.yield()}catch(e){}return new Promise(r=>setTimeout(r,0))}")

# three clicks inside a second queued 24 beds: that is a double-fire, not intent.
# ignore repeat presses within 600ms. deliberate extra batches still queue freely.
a2="function composeNew(n){if(!s.voice){setStatus('Add a voice recording first');return}"
one(a2,'composeNew')
s=s.replace(a2,"let LASTGEN=0;\nfunction composeNew(n){const now=Date.now();if(now-LASTGEN<600)return;LASTGEN=now;"
 "if(!s.voice){setStatus('Add a voice recording first');return}")

# counters beside the memory pools in the breadcrumb log
a3="cache:m?m.cacheMB:null,notes:m?m.cachedNotes:null,banks:m?m.banks:null,bankMB:m?m.bankMB:null,wav:m?m.wavMB:null,kits:m?m.kits:null,"
one(a3,'crumb')
s=s.replace(a3,a3+"st:(function(){try{const q=PBC.stat();return q.ctxMade+'/'+q.ctxDone+'ctx '+q.yields+'y '+(q.visAdd-q.visRemove)+'vis '+(q.watchSet-q.watchCleared)+'wd'}catch(e){return null}})(),")
a4="(e.dom!=null?('  dom '+String(e.dom).padStart(5)+'/'+e.rows+'rows'):'')+"
one(a4,'fmt')
s=s.replace(a4,a4+"(e.st?('  '+e.st):'')+")
io.open(p,'w',encoding='utf-8').write(s);print('patch52 ok')
