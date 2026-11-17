import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
a=("const PEND_MAX=10,pend=s.queue.length+(s.lanes||0);"
   "if(pend>=PEND_MAX){setStatus(`Still working on ${pend} bed${pend>1?'s':''} — the next batch can start once those finish`);return}"
   "n=Math.max(1,Math.min(n,PEND_MAX-pend));")
if s.count(a)!=1: print('ANCHOR x%d'%s.count(a));sys.exit(1)
s=s.replace(a,'')   # no queue cap: queue as deep as the user likes
io.open(p,'w',encoding='utf-8').write(s);print('patch41 ok')
