p='/home/claude/site/index.html';h=open(p,encoding='utf-8').read()
def rep(a,b):
    global h
    assert h.count(a)==1,(h.count(a),a[:90]);h=h.replace(a,b)
rep("t.chan=r.meta.chan;","t.chan=r.meta.chan;t.detail=r.meta.detail;t.metaAll={style:r.meta.style,source:r.meta.source,key:r.meta.key,bpm:r.meta.bpm,chords:r.meta.chords,lineup:r.meta.lineup,fit:r.meta.fit,offset:r.meta.offset,button:r.meta.button};")
rep("heart.onclick=()=>{t.fav=!t.fav;render()};","heart.title='Like: this one sounds good';heart.onclick=()=>{t.fav=!t.fav;if(t.fav)t.dis=false;t.ratedAt=Date.now();render()};const nope=document.createElement('button');nope.className='icon dislike'+(t.dis?' on':'');nope.textContent='👎';nope.title='Dislike: this one does not work';nope.onclick=()=>{t.dis=!t.dis;if(t.dis)t.fav=false;t.ratedAt=Date.now();render()};")
rep("head.append(pb,name,rr,ie,heart,dl);","head.append(pb,name,rr,ie,heart,nope,dl);")
rep('<button id="compose" class="primary">Generate 8 beds</button>','<button id="compose" class="primary">Generate 8 beds</button><button id="ratings" class="pill" title="Save a JSON of every detail of each bed you liked or disliked, to send back so the composer can learn which of its choices work">Export likes &amp; dislikes (JSON)</button>')
JS=r"""
function ratingsJSON(){const beds=s.tracks.filter(t=>(t.fav||t.dis)&&t.detail).map(t=>({rating:t.fav?'like':'dislike',name:t.name,ratedAt:t.ratedAt?new Date(t.ratedAt).toISOString():null,read:t.readLabel||null,bedLength:t.L,genreSliders:t.blend||null,scoreSlider:t.faith??null,summary:t.metaAll||null,line:t.metaLine||'',composerChoices:t.detail,userEdits:{instruments:t.ch||null,song:t.song||null},settingsAsRendered:{channels:t.chan||null,song:t.songDef||null}}));
 return{app:'Promo Bed Composer',exported:new Date().toISOString(),note:'Each entry records the decisions the composer made (structure, harmony, hook, instruments, patterns, groove, effects, mix) plus any edits, so likes and dislikes can be traced to specific choices.',counts:{like:beds.filter(b=>b.rating=='like').length,dislike:beds.filter(b=>b.rating=='dislike').length},beds}}
$('ratings').onclick=async()=>{const j=ratingsJSON();if(!j.beds.length){setStatus('Like or dislike some beds first (♡ / 👎 on each bed)');return}try{await deliver([{name:'bed-ratings-'+new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')+'.json',data:new TextEncoder().encode(JSON.stringify(j,null,1))}]);setStatus('Saved '+j.counts.like+' likes and '+j.counts.dislike+' dislikes')}catch(e){setStatus(e&&e.code==='declined'?'Save cancelled':'Export failed: '+(e&&e.message||e))}};
"""
rep("$('compose').onclick=()=>composeNew(8);","$('compose').onclick=()=>composeNew(8);"+JS)
rep("</style>",".dislike.on{color:#fff;background:#5a6b7c;border-color:#5a6b7c}</style>")
open(p,'w',encoding='utf-8').write(h);print('patch9 ok')
