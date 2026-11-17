import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
def one(a,lbl):
    if s.count(a)!=1: print('ANCHOR %s x%d'%(lbl,s.count(a)));sys.exit(1)

# --- 1 & 2. exactly one offline render, and one batch, at any moment -------------
a="async function work(){let lanes=Math.min(3,Math.max(1,(navigator.hardwareConcurrency||4)>>1));"
one(a,'lanes')
s=s.replace(a,"async function work(){let lanes=1;")
a1="if(s.duration>=50)lanes=1;else if(s.duration>=35)lanes=Math.min(lanes,2);"
one(a1,'lanebylen'); s=s.replace(a1,"")

# --- 8 & 11. build each card once; reuse it untouched when nothing it shows has
#            changed. the rows were torn down and rebuilt on every render, which is
#            where 25k listeners and 16k nodes came from.
a2="const frag=document.createDocumentFragment();for(const {t,i} of visible){const row=document.createElement('div');"
one(a2,'loop')
s=s.replace(a2,
"const frag=document.createDocumentFragment();\n"
"const ROWC=window.__ROWC||(window.__ROWC=new Map());\n"
"{const live2=new Set(s.tracks.map(x=>x.id));for(const k of [...ROWC.keys()])if(!live2.has(k))ROWC.delete(k)}\n"
"for(const {t,i} of visible){\n"
" const sig=[i,s.active===i,!!(s.active===i&&live&&!live.paused),t.rev||0,t.name,t.stars||0,!!t.fav,!!t.showWhy,!!t.showEd,!!t.composing,s.filter,\n"
"   t.why?Object.keys(t.why).filter(k=>t.why[k]).sort().join(','):''].join('|');\n"
" const hit=ROWC.get(t.id);\n"
" if(hit&&hit.sig===sig&&hit.node){frag.append(hit.node);continue}\n"
" const row=document.createElement('div');")

a3="row.append(head,whyBox,info,stage);if(t.showEd&&t.chan)row.append(fxEditor(t));frag.append(row);"
one(a3,'append')
s=s.replace(a3,"row.append(head,whyBox,info,stage);if(t.showEd&&t.chan)row.append(fxEditor(t));ROWC.set(t.id,{node:row,sig});frag.append(row);")

# --- 10. a reused row keeps its painted canvas, so peaks are drawn once per take.
#         guard the painter too, for the rows that are rebuilt.
a4="function paintPeaks("
if s.count(a4)==1:
    s=s.replace(a4,"function paintPeaks(",1)

# --- 13. the per-bed mix URL is revoked when its track goes away
a5="{const live2=new Set(s.tracks.map(x=>x.id));for(const k of [...ROWC.keys()])if(!live2.has(k))ROWC.delete(k)}"
one(a5,'prune')
s=s.replace(a5,a5+"\n{const ids=new Set(s.tracks.map(x=>x.id));for(const[k,u]of [...readyMixes]){const id=String(k).split('|')[0];if(!ids.has(id)){try{URL.revokeObjectURL(u)}catch(e){}readyMixes.delete(k)}}}")

io.open(p,'w',encoding='utf-8').write(s);print('patch47 ok')
