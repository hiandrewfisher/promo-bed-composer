p='index.html';s=open(p).read()
def rep(a,b,cnt=1):
    global s;n=s.count(a);assert n==cnt,(n,a[:80]);s=s.replace(a,b)
s=s.replace('</title>','</title><meta charset="utf-8">',1)
# ---- ducking: gentler default, duck level may go above the unducked level
s=s.replace('minDb:-18,maxDb:-4','minDb:-10,maxDb:-4')
rep("drag(low,(e,p)=>t.minDb=clamp(Math.min(t.maxDb,Math.round(p.min+(p.y-e.clientY)/11)),-40,6));","drag(low,(e,p)=>t.minDb=clamp(Math.round(p.min+(p.y-e.clientY)/11),-40,12));")
rep("drag(high,(e,p)=>t.maxDb=clamp(Math.round(p.max+(p.y-e.clientY)/11),-30,6));","drag(high,(e,p)=>t.maxDb=clamp(Math.round(p.max+(p.y-e.clientY)/11),-30,12));")
# ---- ramp curves (duck down / recover / end fade each get a curve)
rep("let sm=0,lastSpeech=-1e9;","let sm=0,lastSpeech=-1e9;const shS={};")
rep("levels[i]=db(t.maxDb+(t.minDb-t.maxDb)*effectiveDuck)*musicFade;","levels[i]=db(t.maxDb+(t.minDb-t.maxDb)*shapeDuck(shS,effectiveDuck))*musicFade;")
rep("state.musicGain.gain.setTargetAtTime(clamp(db(t.maxDb+(t.minDb-t.maxDb)*effectiveDuck)","state.musicGain.gain.setTargetAtTime(clamp(db(t.maxDb+(t.minDb-t.maxDb)*shapeDuck(state.shS||(state.shS={}),effectiveDuck))")
_i0=s.index("function paintRamp(){");_m="End ${s.endFade.toFixed(2)}s`}";old_paint=s[_i0:s.index(_m,_i0)+len(_m)]
new_paint=r"""function shapeDuck(st,v){v=clamp(v,0,1);const up=v>=(st.p??0)-1e-4;st.p=v;return Math.pow(v,up?(s.downShape||1):(s.upShape||1))}
function paintRamp(){const a=200+s.attack/3*250,r=550+s.release/3*350,fadeX=1000*(1-clamp(s.endFade/s.duration,.005,.95)),ds=s.downShape||1,us=s.upShape||1;
 $('attackDot').style.left=(a/10)+'%';$('attackDot').style.top='85px';$('releaseDot').style.left=(r/10)+'%';$('releaseDot').style.top='20px';
 let d='M0 20 L200 20';for(let i=1;i<=30;i++){const q=i/30;d+=` L${(200+(a-200)*q).toFixed(1)} ${(20+65*Math.pow(q,ds)).toFixed(1)}`}d+=' L550 85';for(let i=1;i<=30;i++){const q=i/30;d+=` L${(550+(r-550)*q).toFixed(1)} ${(20+65*Math.pow(1-q,us)).toFixed(1)}`}
 const begin=Math.max(r,fadeX);d+=` L${begin} 20`;for(let i=1;i<=45;i++){const q=i/45;d+=` L${(begin+(1000-begin)*q).toFixed(2)} ${(20+130*(1-Math.pow(1-q,s.fadeShape))).toFixed(2)}`}$('rampPath').setAttribute('d',d);
 const cd=(id,x,y)=>{const e=$(id);if(e){e.style.left=(x/10)+'%';e.style.top=y+'px'}};cd('downCurve',200+(a-200)*.5,20+65*Math.pow(.5,ds));cd('upCurve',550+(r-550)*.5,20+65*Math.pow(.5,us));cd('fadeCurve',begin+(1000-begin)*.5,20+130*(1-Math.pow(.5,s.fadeShape)));
 $('rampLabel').textContent=`Down ${s.attack.toFixed(2)}s · Up ${s.release.toFixed(2)}s · End ${s.endFade.toFixed(2)}s`}"""
s=s.replace(old_paint,new_paint)
rep('<div class="rampdot" id="endFadeDot"','<div class="rampdot curve" id="downCurve" title="Drag up or down to curve the duck-down ramp"></div><div class="rampdot curve" id="upCurve" title="Drag up or down to curve the recovery ramp"></div><div class="rampdot curve" id="fadeCurve" title="Drag up or down to curve the end fade"></div><div class="rampdot" id="endFadeDot"')
rep("s.endFade=clamp((1-x)*s.duration,.05,s.duration*.4);s.fadeShape=clamp(Math.log(clamp(1-(y*160-20)/130,.001,.999))/Math.log(.5),.2,5);paintEndFade()","s.endFade=clamp((1-x)*s.duration,.05,s.duration*.4);paintEndFade()")
rep("dot.style.top=(20+130*(1-Math.pow(.5,s.fadeShape)))+'px';","dot.style.top='20px';")
rep('<span class="mini">Blu','<span class="mini" style="display:none">Blu')
# ---- remix menu
a0=s.index("const rr=document.createElement('select');");a1=s.index("added at the bottom')};",a0)+len("added at the bottom')};")
s=s[:a0]+r"""const rr=document.createElement('div');rr.className='remixWrap';const rb=document.createElement('button');rb.type='button';rb.className='pill remixBtn';rb.textContent='⟳ Remix';rb.title='Make another version of this bed, added at the bottom';const menu=document.createElement('div');menu.className='remixMenu';menu.hidden=true;
 const cur=document.createElement('label');cur.className='remixCheck';const cb=document.createElement('input');cb.type='checkbox';cb.checked=s.remixCurrent!==false;cb.onchange=()=>{s.remixCurrent=cb.checked};cur.append(cb,document.createTextNode(' Use the genre mix set above'));
 const opt=(how,label,sub)=>{const b=document.createElement('button');b.type='button';b.className='remixOpt';b.innerHTML=`<b>${label}</b><span>${sub}</span>`;b.onclick=()=>{menu.hidden=true;let blend=t.blend;if(cb.checked){const ids=GEN.map(g=>g.id).filter(k=>s.gw[k]>0);if(ids.length){blend={};for(const k of ids)blend[k]=s.gw[k]}}
  const nb=newBed(t.style,(t.seed^Math.imul((t.takes=(t.takes||0)+1),0x85EBCA6B))>>>0,'library',blend);nb.faith=t.faith??s.src/100;const ids={};for(const[k,v]of Object.entries(t.chan||{}))if(v&&v.id)ids[k]=v.id;
  if(how=='tune'){nb.keepIns=ids;nb.song=t.song?{...t.song}:null}if(how=='ins'){nb.piece=t.piece;const av={...recentIns()};for(const x of Object.values(ids))av[x]=(av[x]||0)+4;nb.avoidIns=av}
  queueBed(nb);setStatus(label+' — from '+t.name+', added at the bottom')};return b};
 menu.append(cur,opt('tune','New tune, same instruments','A different melody and chords played by this bed’s band'),opt('both','New tune, new instruments','A fresh bed in the same style'),opt('ins','Same tune, new instruments','This melody played by a different band'));
 rb.onclick=e=>{e.stopPropagation();document.querySelectorAll('.remixMenu').forEach(m=>{if(m!==menu)m.hidden=true});menu.hidden=!menu.hidden};menu.onclick=e=>e.stopPropagation();rr.append(rb,menu);"""+s[a1:]
# ---- layout and look, applied once the page is built
js=r"""<script>{const $=id=>document.getElementById(id),aside=document.querySelector('aside.controls');if(!aside)return;
document.addEventListener('click',()=>document.querySelectorAll('.remixMenu').forEach(m=>m.hidden=true));
const vp=$('voicePanel'),gen=$('compose').closest('.panel'),ramps=$('rampGraph').closest('.panel');
// 1 · Voice: upload + segment together, first
const vd=$('voiceDrop');vp.querySelector('.sectiontitle h2').textContent='1 · Voice read';vp.querySelector('.sectiontitle').after(vd);aside.prepend(vp);
// 2 · Music beds: genre mix folded, no info card, no credits wall
const md=$('musicDrop');const up=md&&md.closest('.uploads');if(md)md.remove();if(up&&!up.children.length)up.remove();
const h=document.createElement('div');h.className='sectiontitle';h.innerHTML='<h2>2 · Make music beds</h2>';gen.prepend(h);
const gh=gen.querySelector('.ghead'),gm=$('genreMix'),det=document.createElement('details');det.className='genreBox';const sm=document.createElement('summary');det.append(sm);gh.before(det);det.append(gh,gm);
const sumUp=()=>{const on=[...gm.querySelectorAll('input[type=range]')].map(r=>[r.closest('.grow').querySelector('.gname').textContent,+r.value]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);sm.innerHTML='<b>Genre mix</b><span class="mini">'+(on.length?on.slice(0,3).map(x=>x[0]).join(', ')+(on.length>3?' + '+(on.length-3)+' more':''):'none selected')+'</span>'};sumUp();gm.addEventListener('input',sumUp);gh.addEventListener('click',()=>setTimeout(sumUp,0));
const sr=gen.querySelector('.srcrow');if(sr)det.after(sr);
const fromTxt=[...gen.querySelectorAll('.toolbar .mini')].find(x=>/selected read/.test(x.textContent));if(fromTxt)fromTxt.remove();
const rat=$('ratings');const bt=document.querySelector('section.audios .toolbar');if(rat&&bt){rat.textContent='Export ratings (JSON)';bt.append(rat)}
const cr=gen.querySelector('.credits');if(cr){const d2=document.createElement('details');d2.className='creditsBox';d2.innerHTML='<summary>Sound sources &amp; licenses</summary>';d2.append(cr);aside.append(d2)}
// 3 · Mix with the voice
ramps.querySelector('h2').textContent='3 · Mix with the voice';const rs=ramps.querySelector('.sectiontitle .sub');if(rs)rs.textContent='Drag the round handles to time the duck and fade; drag the small square handles up or down to curve each ramp.';
aside.insertBefore(gen,ramps);
// curve handles
const curveDrag=(id,set)=>{const el=$(id);if(!el)return;el.onpointerdown=e=>{e.stopPropagation();el.setPointerCapture(e.pointerId)};el.onpointermove=e=>{if(!el.hasPointerCapture(e.pointerId))return;const r=$('rampGraph').getBoundingClientRect(),y=(e.clientY-r.top)*(160/r.height);set(y);paintRamp()};el.onpointerup=()=>{s.cache&&s.cache.clear();if(s.active>=0&&typeof live!=='undefined'&&live)play(s.active,livePosition()/live.length)}};
const ex=f=>Math.max(.2,Math.min(5,Math.log(Math.max(.001,Math.min(.999,f)))/Math.log(.5)));
curveDrag('downCurve',y=>s.downShape=ex((y-20)/65));curveDrag('upCurve',y=>s.upShape=ex((y-20)/65));curveDrag('fadeCurve',y=>s.fadeShape=ex(1-(y-20)/130));
try{paintRamp()}catch(e){}
}</script>"""
css=r"""<style>
aside.controls{display:flex;flex-direction:column;gap:16px}
aside.controls .panel{margin:0}
.panel .sectiontitle{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}
.panel .sectiontitle h2{margin:0;font-size:17px;letter-spacing:-.01em}
#voicePanel #voiceDrop{margin:0 0 12px}
.toolbar,.between{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.toolbar .push{margin-left:auto}
.genreBox{border:1px solid #d9e2ec;border-radius:12px;padding:0 12px;margin:4px 0 12px;background:#fbfcfe}
.genreBox>summary{cursor:pointer;list-style:none;display:flex;align-items:baseline;gap:10px;padding:11px 0;flex-wrap:wrap}
.genreBox>summary::-webkit-details-marker{display:none}
.genreBox>summary::before{content:'▸';color:#1768d2;font-size:12px}
.genreBox[open]>summary::before{content:'▾'}
.genreBox[open]{padding-bottom:12px}
.genreBox .ghead{margin:0 0 8px}
.srcrow{margin:6px 0 12px}
.creditsBox{font-size:12px;color:#5b6b7c;padding:0 4px}
.creditsBox summary{cursor:pointer;padding:6px 0}
.creditsBox .credits{margin:6px 0 0}
.rampdot.curve{width:12px;height:12px;border-radius:3px;background:#fff;border:2px solid #1768d2;transform:translate(-50%,-50%) rotate(45deg);cursor:ns-resize}
.remixWrap{position:relative;display:inline-block}
.remixBtn{white-space:nowrap}
.remixMenu{position:absolute;z-index:30;top:calc(100% + 6px);left:0;width:min(290px,80vw);background:#fff;border:1px solid #d6dee8;border-radius:12px;box-shadow:0 10px 30px #0f203826;padding:8px;display:grid;gap:4px}
.remixMenu[hidden]{display:none}
.remixCheck{display:flex;align-items:center;gap:6px;font-size:12.5px;padding:6px 8px 8px;border-bottom:1px solid #e6ecf2;margin-bottom:2px;cursor:pointer}
.remixOpt{display:grid;gap:2px;text-align:left;background:none;border:0;border-radius:8px;padding:8px 10px;cursor:pointer;font:inherit;color:inherit}
.remixOpt:hover,.remixOpt:focus-visible{background:#eef4fc}
.remixOpt b{font-size:13.5px;font-weight:600}
.remixOpt span{font-size:12px;color:#5b6b7c}
@media (max-width:760px){.top{flex-direction:column;align-items:flex-start;gap:6px}.top .status{text-align:left}section.audios .sectiontitle{flex-wrap:wrap}#export{padding:8px 14px}.workspace{gap:14px}.panel{padding:14px}.toolbar .push{margin-left:0}}
@media (prefers-color-scheme:dark){.genreBox{background:#ffffff08;border-color:#ffffff22}.remixMenu{background:#1b2230;border-color:#ffffff22}.remixOpt:hover{background:#ffffff12}.remixOpt span,.creditsBox{color:#9aa8b8}.remixCheck{border-color:#ffffff1a}.rampdot.curve{background:#1b2230}}
</style>"""
_mi=s.index('function paintRamp(');_end=s.rindex('})()',_mi,s.index('</script>',_mi));s=s[:_end]+'\n;'+js.replace('<script>','').replace('</script>','')+'\n'+s[_end:]+css
open(p,'w').write(s)
