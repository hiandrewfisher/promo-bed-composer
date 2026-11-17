import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
def one(a,l):
    if s.count(a)!=1: print('ANCHOR %s x%d'%(l,s.count(a)));sys.exit(1)

# the accounting race: remember() added a decoded buffer's bytes when the decode
# resolved, without checking the entry was still cached. an entry evicted while it
# was still decoding therefore added bytes drop() had already declined to subtract,
# so cacheBytes drifted upward permanently. once it sat above the budget, every
# insert evicted live samples while real memory was far lower — fine at first,
# progressively worse with use.
a="function drop(id){if(cache.delete(id)){cacheBytes-=bufBytes.get(id)||0;bufBytes.delete(id)}}"
one(a,'drop')
s=s.replace(a,"function drop(id){if(cache.delete(id)){cacheBytes-=bufBytes.get(id)||0;bufBytes.delete(id)}}")

a2="function trimCache(){while(cacheBytes>BYTE_CAP&&order.length>6)drop(order.shift());}"
if s.count(a2)!=1:
    a2="function trimCache(){while(cacheBytes>BYTE_CAP&&order.length>6)drop(order.shift())}"
one(a2,'trim')
s=s.replace(a2,"function trimCache(){while(cacheBytes>BYTE_CAP&&order.length){const id=order.shift();if(cache.has(id))drop(id)}}")

a3=("function remember(id,p){cache.set(id,p);order.push(id);"
    "p.then(b=>{try{const n=b.length*b.numberOfChannels*4;bufBytes.set(id,n);cacheBytes+=n;trimCache()}catch(e){}},()=>drop(id));"
    "while(order.length>CAP)drop(order.shift());return p}")
one(a3,'remember')
s=s.replace(a3,
"function remember(id,p){if(cache.has(id))drop(id);cache.set(id,p);order.push(id);"
"p.then(b=>{if(cache.get(id)!==p)return;"
"try{const n=b.length*b.numberOfChannels*4;cacheBytes-=bufBytes.get(id)||0;bufBytes.set(id,n);cacheBytes+=n;trimCache()}catch(e){}},"
"()=>{if(cache.get(id)===p)drop(id)});"
"while(order.length>CAP){const old=order.shift();if(cache.has(old))drop(old)}return p}")

# compressed banks: bounded already, now also measured, and evictions accounted
a4="const banks=new Map(),BANK_CAP=8;"
one(a4,'banks')
s=s.replace(a4,"const banks=new Map(),BANK_CAP=8,bankBytes=new Map();let bankTotal=0;")
a5="   banks.set(k,p);p.catch(()=>banks.delete(k));"
one(a5,'bankset')
s=s.replace(a5,
"   banks.set(k,p);\n"
"   p.then(j=>{if(banks.get(k)!==p)return;let n=0;try{for(const q in j.b64)n+=j.b64[q].length}catch(e){}"
"bankTotal-=bankBytes.get(k)||0;bankBytes.set(k,n);bankTotal+=n},"
"()=>{if(banks.get(k)===p){banks.delete(k);bankTotal-=bankBytes.get(k)||0;bankBytes.delete(k)}});")
a6="   while(banks.size>BANK_CAP){const old=banks.keys().next().value;if(old===k)break;banks.delete(old)}}"
one(a6,'bankcap')
s=s.replace(a6,"   while(banks.size>BANK_CAP){const old=banks.keys().next().value;if(old===k)break;banks.delete(old);bankTotal-=bankBytes.get(old)||0;bankBytes.delete(old)}}")

# the kit map grew without limit and was never accounted
a7="const kits=new Map();function kitFile(n){let p=kits.get(n);if(!p){p=grab('kit',n);kits.set(n,p);p.catch(()=>kits.delete(n))}return p}"
one(a7,'kits')
s=s.replace(a7,
"const kits=new Map(),KIT_CAP=6;function kitFile(n){let p=kits.get(n);"
"if(p){kits.delete(n);kits.set(n,p);return p}"
"p=grab('kit',n);kits.set(n,p);p.catch(()=>{if(kits.get(n)===p)kits.delete(n)});"
"while(kits.size>KIT_CAP){const old=kits.keys().next().value;if(old===n)break;kits.delete(old)}return p}")

# each pool reported on its own, including the WAVs held by finished tracks
a8="PBC={stat:()=>Object.assign({},PBCSTAT),yield:yieldTask,mem:()=>({cacheMB:+(cacheBytes/1048576).toFixed(1),cachedNotes:cache.size,banks:banks.size}),"
one(a8,'mem')
s=s.replace(a8,"PBC={stat:()=>Object.assign({},PBCSTAT),yield:yieldTask,mem:()=>({cacheMB:+(cacheBytes/1048576).toFixed(1),cachedNotes:cache.size,banks:banks.size,"
"bankMB:+(bankTotal/1048576).toFixed(1),kits:kits.size,"
"wavMB:+((typeof globalThis.__PBCWAV==='function'?globalThis.__PBCWAV()||0:0)/1048576).toFixed(1)}),")
io.open(p,'w',encoding='utf-8').write(s);print('patch49 ok')
