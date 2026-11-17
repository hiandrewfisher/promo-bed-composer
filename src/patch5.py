# the source slider becomes faithfulness: every bed is built on a different library piece;
# the slider sets how closely it follows it (as written <-> a new composition from it)
p='/home/claude/site/index.html';h=open(p,encoding='utf-8').read()
def rep(a,b):
    global h
    assert h.count(a)==1,(h.count(a),a[:100]);h=h.replace(a,b)
rep('<label for="srcMix" class="gname">Source</label><span class="mini">Original</span><input type="range" id="srcMix" min="0" max="100" step="5" value="100" aria-label="Share of beds built on a piece from the library"><span class="mini">Library</span><b id="srcVal" class="gpct">100%</b>',
    '<label for="srcMix" class="gname" title="Every bed starts from a different public-domain score">Score</label><span class="mini">New composition from it</span><input type="range" id="srcMix" min="0" max="100" step="5" value="60" aria-label="How closely each bed follows its public-domain score"><span class="mini">As written</span><b id="srcVal" class="gpct">60%</b>')
rep("s.src=100;","s.src=60;")
rep("src=R()*100<s.src?'library':'original';queueBed(newBed('mix',sd,src,blend))","src='library';const nb0=newBed('mix',sd,src,blend);nb0.faith=s.src/100;queueBed(nb0)")
rep("const nb=newBed(t.style,(t.seed^Math.imul((t.takes=(t.takes||0)+1),0x85EBCA6B))>>>0,t.source,t.blend);","const nb=newBed(t.style,(t.seed^Math.imul((t.takes=(t.takes||0)+1),0x85EBCA6B))>>>0,'library',t.blend);nb.faith=t.faith??s.src/100;")
rep("PBC.render({seed:t.seed,genre:t.style,blend:t.blend,source:t.source,","PBC.render({seed:t.seed,genre:t.style,blend:t.blend,source:'library',faith:t.faith??s.src/100,")
rep("t.metaLine=`${m.style} · ${m.source?'after '+m.source+' · ':''}${m.key}","t.metaLine=`${m.style} · ${m.source?(m.faith>=80?'':m.faith<=25?'new composition from ':'arranged from ')+m.source+' · ':''}${m.key}")
open(p,'w',encoding='utf-8').write(h)
open('/home/claude/promo-bed-composer-standalone.html','w',encoding='utf-8').write('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+h+'</html>')
print('patch5 ok')
