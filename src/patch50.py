import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
def one(a,l):
    if s.count(a)!=1: print('ANCHOR %s x%d'%(l,s.count(a)));sys.exit(1)

# the observer held a strong reference to every canvas it had ever been given, so
# each discarded row's canvas stayed reachable. drop the ones no longer on the page.
a="$('list').append(frag);"
one(a,'append')
s=s.replace(a,a+"\n{const ob=window.waveObserver;if(ob&&ob._seen){for(const c of [...ob._seen])if(!c.isConnected){try{ob.unobserve(c)}catch(e){}c._track=null;ob._seen.delete(c)}}}")
a2="canvas._track=t;window.waveObserver.observe(canvas);"
one(a2,'observe')
s=s.replace(a2,"canvas._track=t;(window.waveObserver._seen||(window.waveObserver._seen=new Set())).add(canvas);window.waveObserver.observe(canvas);")
a3="if(tr)trackWave(c,tr);window.waveObserver.unobserve(c)"
one(a3,'unobs')
s=s.replace(a3,"if(tr)trackWave(c,tr);window.waveObserver.unobserve(c);if(window.waveObserver._seen)window.waveObserver._seen.delete(c)")

# how much the finished takes are actually holding, so intentional growth can be
# told apart from a leak
a4="function queueBed(t,quiet){"
one(a4,'queue')
s=s.replace(a4,"globalThis.__PBCWAV=()=>{let n=0;for(const t of s.tracks)if(t.file)n+=t.file.size||0;return n};\n"
 "function queueBed(t,quiet){")

# each pool on its own line in the breadcrumb log
a5="(e.cache!=null?('  samples '+String(e.cache).padStart(5)+'MB/'+e.notes+'n/'+e.banks+'b'):'')+"
one(a5,'fmt')
s=s.replace(a5,"(e.cache!=null?('  pcm '+String(e.cache).padStart(5)+'MB/'+e.notes+'n  banks '+(e.bankMB==null?e.banks+'b':e.bankMB+'MB/'+e.banks+'b')+'  wav '+(e.wav==null?'?':e.wav+'MB')):'')+")
a6="cache:m?m.cacheMB:null,notes:m?m.cachedNotes:null,banks:m?m.banks:null,"
one(a6,'crumb')
s=s.replace(a6,"cache:m?m.cacheMB:null,notes:m?m.cachedNotes:null,banks:m?m.banks:null,bankMB:m?m.bankMB:null,wav:m?m.wavMB:null,kits:m?m.kits:null,")
io.open(p,'w',encoding='utf-8').write(s);print('patch50 ok')
