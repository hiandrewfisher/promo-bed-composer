import io,sys,os
p=os.path.join(os.path.dirname(__file__),'..','index.html')
s=io.open(p,encoding='utf-8').read()
def one(a,l):
    if s.count(a)!=1: print('ANCHOR %s x%d'%(l,s.count(a)));sys.exit(1)

a='<script src="userlib.js"></script>'
one(a,'ul')
s=s.replace(a,a+'\n<script src="stems.js"></script>')

# separation is opt-in: accurate, but about half a second of work per second of
# audio, which is not something to do to a thousand files by default
a2='\'<div id="mineProg" class="sub"></div>\'+'
one(a2,'prog')
s=s.replace(a2,
 '\'<label class="mineStem hidden" id="mineStemRow">\'+'
 '\'<input id="mineStems" type="checkbox"><span>Separate stems before analysing\'+'
 '\'<span class="sub">Splits each track into vocals, drums, bass and the rest, then reads the key and \'+'
 '\'chords from the pitched parts alone — a full mix smears them with cymbals and kick spill. \'+'
 '\'Much more accurate, and much slower. It runs here on your machine; nothing is uploaded.</span></span></label>\'+'
 +a2)

a3=("  const r=await UL.ingest(files,x=>{\n"
    "   prog(x.done?'':('Analysing '+(x.i+1)+' of '+x.n+' — '+(x.name||'').slice(0,42)));\n"
    "  });")
one(a3,'ingest')
s=s.replace(a3,
 "  const useStems=!!(document.getElementById('mineStems')||{}).checked;\n"
 "  const r=await UL.ingest(files,x=>{\n"
 "   if(x.done){prog('');return}\n"
 "   if(x.stage){prog(x.stage+' '+Math.round((x.frac||0)*100)+'% — '+(x.i+1)+' of '+x.n+' — '+(x.name||'').slice(0,34));return}\n"
 "   prog('Analysing '+(x.i+1)+' of '+x.n+' — '+(x.name||'').slice(0,42));\n"
 "  },{stems:useStems});")

# the checkbox appears only where the model is actually reachable from this origin
a5=" count();\n})();"
one(a5,'tail')
s=s.replace(a5,
" count();\n"
" if(window.STEMS)STEMS.available().then(ok=>{if(ok)$$('mineStemRow').classList.remove('hidden')})\n"
"  .catch(()=>{});\n"
"})();")

CSS = """
#mineBox .mineStem{display:flex;gap:7px;font-size:13px;align-items:flex-start;cursor:pointer}
#mineBox .mineStem input{margin-top:3px;flex:none}
#mineBox .mineStem .sub{display:block;font-size:12px;opacity:.65;margin:2px 0 0}
"""
s=s.replace('</style>',CSS+'</style>',1)
io.open(p,'w',encoding='utf-8').write(s);print('patch64 ok')
