# every bed uses the whole slider mix as a blend; each bed is seeded by a different piece from the library
p='/home/claude/site/index.html';h=open(p,encoding='utf-8').read()
def rep(a,b):
    global h
    assert h.count(a)==1,(h.count(a),a[:100]);h=h.replace(a,b)
rep('<span class="mini">share of each batch</span>','<span class="mini">blended into every bed</span>')
rep('<label for="srcMix" class="gname">Composition</label><span class="mini">Original</span><input type="range" id="srcMix" min="0" max="100" step="5" value="30" aria-label="Share of beds built on classical scores"><span class="mini">Classical</span><b id="srcVal" class="gpct">30%</b>',
    '<label for="srcMix" class="gname">Source</label><span class="mini">Original</span><input type="range" id="srcMix" min="0" max="100" step="5" value="100" aria-label="Share of beds built on a piece from the library"><span class="mini">Library</span><b id="srcVal" class="gpct">100%</b>')
rep("s.src=30;","s.src=100;s.usedPieces=new Set();STY.mix={n:'Mix'};")
# composeNew: one blend for all beds; different seeds, so different pieces and instrument draws
i=h.index("const tot=ids.reduce((a,k)=>a+s.gw[k],0),cnt=ids.map(");j=h.index("setStatus(`Generating ${n} beds",i)
h=h[:i]+"const blend={};for(const k of ids)blend[k]=s.gw[k];for(let i=0;i<n;i++){const sd=(base^Math.imul(batch*16+i+1,0x9E3779B1))>>>0,src=R()*100<s.src?'library':'original';queueBed(newBed('mix',sd,src,blend))}"+h[j:]
rep("function newBed(style,seed,source){","function newBed(style,seed,source,blend){")
rep("return{id:'bed-'+seed+'-'+names.size,seed,style,source:source||'original',name:nm,","return{id:'bed-'+seed+'-'+names.size,seed,style,blend:blend?{...blend}:null,source:source||'original',name:nm,")
rep("const nb=newBed(t.style,(t.seed^Math.imul((t.takes=(t.takes||0)+1),0x85EBCA6B))>>>0,t.source);","const nb=newBed(t.style,(t.seed^Math.imul((t.takes=(t.takes||0)+1),0x85EBCA6B))>>>0,t.source,t.blend);")
rep("rr.title='Compose another take in this genre for the current selection (added at the bottom)'","rr.title='Compose another take with the same genre mix: a new piece from the library, added at the bottom'")
rep("PBC.render({seed:t.seed,genre:t.style,source:t.source,L,offset:null,A,ctx}","PBC.render({seed:t.seed,genre:t.style,blend:t.blend,source:t.source,avoid:s.usedPieces,L,offset:null,A,ctx}")
# name each bed after its source piece once composed
rep("t.file=new File([wav(r.buffer)],t.name+'.wav',{type:'audio/wav'});",
    "if(r.meta.pieceId!=null)s.usedPieces.add(r.meta.pieceId);if(r.meta.title&&!t.renamed){names.delete(t.name);let nm=r.meta.title.replace(/[\\\\/:*?\"<>|]+/g,' ').replace(/\\s+/g,' ').trim().slice(0,48),base2=nm,k=2;while(names.has(nm))nm=base2+' '+k++;names.add(nm);t.name=nm;t.renamed=1}t.file=new File([wav(r.buffer)],t.name+'.wav',{type:'audio/wav'});")
rep("t.metaLine=`${m.source?'after '+m.source+' · ':''}${m.key}","t.metaLine=`${m.style} · ${m.source?'after '+m.source+' · ':''}${m.key}")
open(p,'w',encoding='utf-8').write(h)
s2=h
open('/home/claude/promo-bed-composer-standalone.html','w',encoding='utf-8').write('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+s2+'</html>')
print('patch4 ok')
# keep the seek bar alive when the row that hosts it is re-rendered (it was detached, so lookups returned null)
h=open(p,encoding='utf-8').read()
a="const $=id=>document.getElementById(id),AC="
assert h.count(a)==1
h=h.replace(a,"const __el={},$=id=>{const e=document.getElementById(id);if(e){__el[id]=e;return e}return __el[id]||null},AC=")
a="$('transport').onclick=toggleLive;"
assert h.count(a)==1
h=h.replace(a,"$('seek');$('seekCursor');$('clock');"+a)
open(p,'w',encoding='utf-8').write(h)
open('/home/claude/promo-bed-composer-standalone.html','w',encoding='utf-8').write('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+h+'</html>')
print('seek fix ok')
