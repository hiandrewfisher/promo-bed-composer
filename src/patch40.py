import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
def one(a):
    if s.count(a)!=1: print('ANCHOR x%d: %s'%(s.count(a),a[:70]));sys.exit(1)

# A. keep a mono sample mono instead of duplicating it into two channels
a="function tidy(a){const n=a.length,ch=a.numberOfChannels,o=new AudioBuffer({length:n,sampleRate:a.sampleRate,numberOfChannels:2});let pk=0;for(let c=0;c<2;c++){const s=a.getChannelData(Math.min(c,ch-1)),d=o.getChannelData(c);for(let i=0;i<n;i++){d[i]=s[i];const v=s[i]<0?-s[i]:s[i];if(v>pk)pk=v}}const g=pk?.7/pk:1;for(let c=0;c<2;c++){const d=o.getChannelData(c);for(let i=0;i<n;i++)d[i]*=g}return o}"
one(a)
s=s.replace(a,"function tidy(a){const n=a.length,ch=Math.min(2,a.numberOfChannels),o=new AudioBuffer({length:n,sampleRate:a.sampleRate,numberOfChannels:ch});let pk=0;for(let c=0;c<ch;c++){const s=a.getChannelData(c),d=o.getChannelData(c);for(let i=0;i<n;i++){d[i]=s[i];const v=s[i]<0?-s[i]:s[i];if(v>pk)pk=v}}const g=pk?.7/pk:1;for(let c=0;c<ch;c++){const d=o.getChannelData(c);for(let i=0;i<n;i++)d[i]*=g}return o}")

# B. budget the decoded-sample cache in megabytes, not in note count:
#    a 7s stereo piano note is 2.5MB, a short synth note is 0.1MB — a count cap
#    both over-evicts the small ones and under-protects the huge ones.
a2="const cache=new Map(),order=[],CAP=96;\nfunction remember(id,p){cache.set(id,p);order.push(id);p.catch(()=>cache.delete(id));while(order.length>CAP)cache.delete(order.shift());return p}"
one(a2)
s=s.replace(a2,
"const cache=new Map(),order=[],CAP=900,BYTE_CAP=200*1048576,bufBytes=new Map();let cacheBytes=0;\n"
"function drop(id){if(cache.delete(id)){cacheBytes-=bufBytes.get(id)||0;bufBytes.delete(id)}}\n"
"function trimCache(){while(cacheBytes>BYTE_CAP&&order.length>6)drop(order.shift())}\n"
"function remember(id,p){cache.set(id,p);order.push(id);"
"p.then(b=>{try{const n=b.length*b.numberOfChannels*4;bufBytes.set(id,n);cacheBytes+=n;trimCache()}catch(e){}},()=>drop(id));"
"while(order.length>CAP)drop(order.shift());return p}")

io.open(p,'w',encoding='utf-8').write(s);print('patch40 ok')
