import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
def one(a):
    if s.count(a)!=1: print('ANCHOR x%d: %s'%(s.count(a),a[:60]));sys.exit(1)
# setTimeout is clamped to about once a second in a hidden tab, which is what made
# generation crawl when the panel was not on screen. a MessageChannel yield is not clamped.
a="async function work(){"
one(a)
s=s.replace(a,"function yieldNow(){return new Promise(r=>{try{const mc=new MessageChannel();mc.port1.onmessage=()=>r();mc.port2.postMessage(0)}catch(e){setTimeout(r,0)}})}\n"
 "async function work(){")
a2="if(s.queue.length>1)setTimeout(work,0);"
one(a2); s=s.replace(a2,"if(s.queue.length>1)yieldNow().then(work);")
a3="await new Promise(r=>setTimeout(r,0))}}finally{"
one(a3); s=s.replace(a3,"await yieldNow()}}finally{")
io.open(p,'w',encoding='utf-8').write(s);print('unthrottled yields ok')
