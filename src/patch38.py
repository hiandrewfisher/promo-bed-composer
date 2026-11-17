import io,sys
p='index.html'
s=io.open(p,encoding='utf-8').read()
def one(a):
    if s.count(a)!=1:
        print('ANCHOR x%d: %s'%(s.count(a),a[:70]));sys.exit(1)

# 1. queueBed: quiet mode so a batch doesn't fire work()/progress() once per bed
a="function queueBed(t){t.L=s.duration;t.A=analysis();t.readLabel=`read ${fmt(t.read[0])}–${fmt(t.read[1])} · ${t.L}s bed`;s.queue.push(t);s.total++;progress(`${s.queue.length} bed${s.queue.length>1?'s':''} waiting`);work()}"
one(a)
b="function queueBed(t,quiet){t.L=s.duration;t.A=analysis();t.readLabel=`read ${fmt(t.read[0])}–${fmt(t.read[1])} · ${t.L}s bed`;s.queue.push(t);s.total++;if(!quiet){progress(`${s.queue.length} bed${s.queue.length>1?'s':''} waiting`);work()}}"
s=s.replace(a,b)

# 2. composeNew: refuse/trim a new batch while beds are still pending, and queue it in one pass
a2="function composeNew(n){if(!s.voice){setStatus('Add a voice recording first');return}"
one(a2)
b2=("function composeNew(n){if(!s.voice){setStatus('Add a voice recording first');return}"
    "const PEND_MAX=10,pend=s.queue.length+(s.lanes||0);"
    "if(pend>=PEND_MAX){setStatus(`Still working on ${pend} bed${pend>1?'s':''} — the next batch can start once those finish`);return}"
    "n=Math.max(1,Math.min(n,PEND_MAX-pend));")
s=s.replace(a2,b2)

a3="nb0.faith=s.src/100;queueBed(nb0)}"
one(a3)
s=s.replace(a3,"nb0.faith=s.src/100;queueBed(nb0,1)}progress(`${s.queue.length} bed${s.queue.length>1?'s':''} waiting`);work();")

# 3. release the decoded render once it has been written to the WAV + peaks
a4="t.peaks=buildPeaks(r.buffer);t.peakDuration=r.buffer.duration;"
one(a4)
s=s.replace(a4,"t.peaks=buildPeaks(r.buffer);t.peakDuration=r.buffer.duration;r.buffer=null;if(r.stems)r.stems=null;")

io.open(p,'w',encoding='utf-8').write(s)
print('patch38 ok')
