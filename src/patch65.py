import io,sys,os
p=os.path.join(os.path.dirname(__file__),'..','index.html')
s=io.open(p,encoding='utf-8').read()
def need(a,l,n=1):
    if s.count(a)!=n: print('ANCHOR %s x%d (want %d)'%(l,s.count(a),n));sys.exit(1)

# ---- 1. a bus for the composed arrangement, so it can be faded against the
#         recording. the recording goes straight to the master and bypasses it.
a="const M=C.createGain();M.gain.value=.85;"
need(a,'M')
s=s.replace(a,a+"const CB=C.createGain();CB.gain.value=1;CB.connect(M);")
need("toward||M",'toward',3)
s=s.replace("toward||M","toward||CB")

# ---- 2. the slider crossfades across its whole travel: hard left is a new
#         composition, hard right is the recording itself, and the middle is both
a2=("{const F=o.faith??.7;\n"
    " if(o.piece&&o.piece.audio&&F>=.8&&typeof UL!=='undefined'){\n"
    "  const mg=Math.min(1,Math.max(0,(F-.8)/.17));\n")
need(a2,'faith')
s=s.replace(a2,
 "{const F=o.faith??.7;\n"
 " if(o.piece&&o.piece.audio&&F>0.02&&typeof UL!=='undefined'){\n"
 "  const mg=Math.sin(Math.min(1,F)*Math.PI/2);\n")
a3="   if(b){o={...o,mineBuf:b,mineGain:mg,mineOnly:F>=.97};\n"
need(a3,'mineset')
s=s.replace(a3,
 "   if(b){o={...o,mineBuf:b,mineGain:mg,mineOnly:F>=.985,compGain:Math.cos(Math.min(1,F)*Math.PI/2)};\n")
a4="    console.log('[PromoMixer] your recording '+(o.mineOnly?'as written':'under the arrangement at '+Math.round(mg*100)+'%')+' — '+o.piece.title)}"
need(a4,'minelog')
s=s.replace(a4,
 "    console.log('[PromoMixer] your recording '+(o.mineOnly?'as written, raw':\n"
 "      'at '+Math.round(mg*100)+'% against the arrangement at '+Math.round(o.compGain*100)+'%')+' — '+o.piece.title)}")

# the composed side comes down as the recording comes up
a5=" if(o.mineBuf){const sp=strip('mine',{}),b=o.mineBuf,"
need(a5,'minegraph')
s=s.replace(a5,
 " if(o.compGain!=null&&o.compGain<1)CB.gain.value=o.compGain;\n"
 " if(o.mineBuf){const sp=o.mineOnly?{inp:M}:strip('mine',{},M),b=o.mineBuf,")

# ---- 3. at the far end it is his file, so nothing colours it: no voice pocket,
#         no mastering, only a peak ceiling
a6="const SINK=C.createGain(),PKS=[];if(full){"
need(a6,'pocket')
s=s.replace(a6,"const SINK=C.createGain(),PKS=[];if(full&&!o.mineOnly){")
a7="const out=await master(raw,M2);"
need(a7,'master')
s=s.replace(a7,
 "const out=o.mineOnly?(function(b){let pk=0;for(let ch=0;ch<b.numberOfChannels;ch++){\n"
 "  const d=b.getChannelData(ch);for(let i=0;i<d.length;i++){const v=Math.abs(d[i]);if(v>pk)pk=v}}\n"
 " if(pk>0.891){const g=0.891/pk;for(let ch=0;ch<b.numberOfChannels;ch++){\n"
 "  const d=b.getChannelData(ch);for(let i=0;i<d.length;i++)d[i]*=g}}\n"
 " console.log('[PromoMixer] raw recording out, peak '+(20*Math.log10(Math.max(pk,1e-9))).toFixed(1)+' dBFS');\n"
 " return b})(raw):await master(raw,M2);")

# the recording keeps its own level when it is the whole bed
a8="  const g0=(o.mineGain??1)*0.9;"
need(a8,'g0')
s=s.replace(a8,"  const g0=o.mineOnly?1:(o.mineGain??1)*0.9;")

# ---- 4. the build line said v127 long after the badge moved on
a9='console.log("[PromoMixer] build v127 ("+window.PBC_BUILT+")")'
need(a9,'ver')
s=s.replace(a9,'console.log("[PromoMixer] build "+window.PBC_VERSION+" ("+window.PBC_BUILT+")")')

# ---- 5. the slider is about his own music now, not a public-domain score
a10='<label for="srcMix" class="gname" title="Every bed starts from a different public-domain score">Score</label><span class="mini">New composition from it</span>'
need(a10,'label')
s=s.replace(a10,'<label for="srcMix" class="gname" title="Hard left composes something new out of your library. Hard right is the recording itself. In between you hear both.">Source</label><span class="mini">New composition from it</span>')
a11='aria-label="How closely each bed follows its public-domain score"'
need(a11,'aria')
s=s.replace(a11,'aria-label="From a new composition built out of your library, through both together, to your recording as written"')

# ---- 6. separation is not a question to put to him: when the model is
#         reachable it is simply used
a12=('\'<label class="mineStem hidden" id="mineStemRow">\'+'
     '\'<input id="mineStems" type="checkbox"><span>Separate stems before analysing\'+')
need(a12,'stemrow')
s=s.replace(a12,
 '\'<label class="mineStem hidden" id="mineStemRow">\'+'
 '\'<span><b id="mineStemOn">Separating stems</b>\'+')
a13="'chords from the pitched parts alone — a full mix smears them with cymbals and kick spill. '+"
need(a13,'stemtext')
s=s.replace(a13,"'chords from the pitched parts alone — a full mix smears them with cymbals and kick spill. '+")
a14=" if(window.STEMS)STEMS.available().then(ok=>{if(ok)$$('mineStemRow').classList.remove('hidden')})\n  .catch(()=>{});"
need(a14,'stemshow')
s=s.replace(a14,
 " if(window.STEMS)STEMS.available().then(ok=>{window.PBC_STEMS=!!ok;\n"
 "   if(ok)$$('mineStemRow').classList.remove('hidden')}).catch(()=>{});")
a15="  const useStems=!!(document.getElementById('mineStems')||{}).checked;"
need(a15,'usestems')
s=s.replace(a15,"  const useStems=window.PBC_STEMS!==false;")

io.open(p,'w',encoding='utf-8').write(s);print('patch65 ok')
