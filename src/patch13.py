p='index.html';s=open(p).read()
def rep(a,b,cnt=1):
    global s;n=s.count(a);assert n==cnt,(n,a[:80]);s=s.replace(a,b)
rep("function paintEndFade(){","function paintEndFade(){if(!$('endFadeDot'))return paintRamp();")
# no demo read
rep("(async()=>{setStatus('Synthesizing demo read');","(async()=>{setStatus('Add a voice read to begin');return;")
# no "find next segment"
rep('<button id="detect" class="pill">Find next segment ↗</button>','<button id="detect" class="pill hidden" hidden></button>')
# one file-name field
rep('<span class="mini">File naming</span><input id="promoName" value="PROMO 3" aria-label="Promo name"><input id="voicer" value="Angela Johnston" aria-label="Voicer"><input id="campaign" value="Oct26" aria-label="Campaign"><span id="filenamePreview" class="mini"></span>',
    '<label class="mini fnLabel" for="fileName">File name</label><input id="fileName" value="Promo bed" aria-label="File name"><span id="filenamePreview" class="mini"></span><span class="hidden"><input id="promoName"><input id="voicer"><input id="campaign"></span>')
rep("return [safe($('promoName').value),safe($('campaign').value),safe($('voicer').value)].concat(t?[safe(t.name)]:[]).filter(Boolean).join('.')+'.wav'}","return (safe($('fileName').value)||'Promo bed')+'.wav'}")
rep("$('filenamePreview').textContent=filename(0);","$('filenamePreview').textContent='Saves as '+filename(0);")
rep("for(const id of ['promoName','voicer','campaign']){","for(const id of ['fileName']){")
# parallel composing: 2-3 beds at once, each on its own audio thread
rep("async function work(){if(s.working)return;s.working=true;try{","async function work(){const lanes=Math.min(3,Math.max(1,(navigator.hardwareConcurrency||4)>>1));if((s.lanes||0)>=lanes)return;s.lanes=(s.lanes||0)+1;s.working=true;if(s.queue.length>1)setTimeout(work,0);try{")
rep("finally{s.working=false;if(!s.queue.length){s.done=s.total=0;progress('All beds ready')}}}","finally{s.lanes--;if(!s.lanes){s.working=false;if(!s.queue.length){s.done=s.total=0;progress('All beds ready')}}}}")
# new ramp model: hold the duck through the whole read; three movable ramps with steepness and curve
rep("levels[i]=db(t.maxDb+(t.minDb-t.maxDb)*shapeDuck(shS,effectiveDuck))*musicFade;","levels[i]=db(t.maxDb+(t.minDb-t.maxDb)*duckAt(t,time))*fadeAt(time,length);")
rep("clamp(db(t.maxDb+(t.minDb-t.maxDb)*shapeDuck(state.shS||(state.shS={}),effectiveDuck))*Math.pow(fade,s.fadeShape),0,2)","clamp(db(t.maxDb+(t.minDb-t.maxDb)*duckAt(t,tm))*fadeAt(tm,state.length),0,2)")
_i0=s.index("function shapeDuck(");_m="$('rampLabel').textContent=`Down ${s.attack.toFixed(2)}s · Up ${s.release.toFixed(2)}s · End ${s.endFade.toFixed(2)}s`}"
old=s[_i0:s.index(_m,_i0)+len(_m)]
new=r"""const RP={inPos:-.1,inLen:.35,inCurve:1,outPos:.35,outLen:.7,outCurve:1};
function rp(k){return s[k]??RP[k]}
function rampV(x,c){return Math.pow(clamp(x,0,1),c)}
function duckAt(t,time){const vs=t.offset,ve=t.offset+voiceOutputLength(),a0=vs+rp('inPos')-rp('inLen')/2,b0=ve+rp('outPos')-rp('outLen')/2;let d=time>=a0?rampV((time-a0)/Math.max(.01,rp('inLen')),rp('inCurve')):0;if(time>=b0)d=Math.min(d,1-rampV((time-b0)/Math.max(.01,rp('outLen')),rp('outCurve')));return clamp(d,0,1)}
function fadeAt(time,length){const f0=length-s.endFade+(s.fadePos||0);return time<f0?1:Math.pow(1-clamp((time-f0)/Math.max(.02,s.endFade),0,1),s.fadeShape)}
function paintRamp(){const g=$('rampGraph');if(!g||!g._ready)return;s.attack=rp('inLen');s.release=rp('outLen');
 const VS=250,VE=640,BE=960,K=110,UP=30,DN=100,Z=150,X=x=>clamp(x,2,998);
 const ramps=[['in',VS+rp('inPos')*K,rp('inLen')*K,UP,DN,rp('inCurve')],['out',VE+rp('outPos')*K,rp('outLen')*K,DN,UP,rp('outCurve')],['fade',BE+(s.fadePos||0)*K-s.endFade*K/2,s.endFade*K,UP,Z,s.fadeShape]];
 let d=`M0 ${UP}`;for(const[id,cx,w,y0,y1,c]of ramps){const x0=cx-w/2;d+=` L${X(x0)} ${y0}`;for(let i=1;i<=32;i++){const q=i/32,v=id=='in'?rampV(q,c):id=='out'?1-rampV(q,c):1-Math.pow(1-q,c);const yy=id=='fade'?UP+(Z-UP)*(1-Math.pow(1-q,c)):id=='in'?UP+(DN-UP)*rampV(q,c):DN-(DN-UP)*rampV(q,c);d+=` L${X(x0+w*q).toFixed(1)} ${yy.toFixed(1)}`}}d+=` L1000 ${Z}`;$('rampPath').setAttribute('d',d);
 for(const[id,cx,w,y0,y1,c]of ramps){const bend=Math.log(c)/Math.log(4),mid=id=='fade'?UP+(Z-UP)*(1-Math.pow(.5,c)):id=='in'?UP+(DN-UP)*rampV(.5,c):DN-(DN-UP)*rampV(.5,c);
  const pos=(el,x,y)=>{el.style.left=(X(x)/10)+'%';el.style.top=y+'px'};pos(g._h[id].c,cx,mid);const off=clamp(bend,-1,1)*30;pos(g._h[id].a,cx-w/2,y0+(y1>y0?off:-off));pos(g._h[id].b,cx+w/2,y1-(y1>y0?off:-off));
  const ln=g._h[id].l;ln[0].setAttribute('d',`M${X(cx-w/2)} ${y0} L${X(cx-w/2)} ${y0+(y1>y0?off:-off)}`);ln[1].setAttribute('d',`M${X(cx+w/2)} ${y1} L${X(cx+w/2)} ${y1-(y1>y0?off:-off)}`)}
 $('rampLabel').textContent=`In ${rp('inLen').toFixed(2)}s · Out ${rp('outLen').toFixed(2)}s · Fade ${s.endFade.toFixed(2)}s`}"""
s=s.replace(old,new)
js=r"""<script>{const $=id=>document.getElementById(id),g=$('rampGraph');if(!g)return;const panel=g.closest('.panel');
 // strip the old controls
 for(const id of ['attackDot','releaseDot','endFadeDot','downCurve','upCurve','fadeCurve'])$(id)&&$(id).remove();const gc=panel.querySelector('.gapControls');if(gc)gc.remove();s.gapLift=0;s.gapHold=0;
 const btw=$('endFadeLabel')&&$('endFadeLabel').closest('.between');if(btw)btw.remove();[...panel.querySelectorAll('p.mini')].forEach(p=>p.remove());
 const sub=panel.querySelector('.sectiontitle .sub');if(sub)sub.textContent='Drag a circle to move a ramp. Drag its small handles sideways for steepness, up or down for curve.';
 const t0=g.querySelector('.ramptitle');if(t0)t0.remove();
 // picture of the read and the bed end
 const svg=g.querySelector('svg');svg.setAttribute('viewBox','0 0 1000 170');const NS='http://www.w3.org/2000/svg',mk=(tag,at)=>{const e=document.createElementNS(NS,tag);for(const k in at)e.setAttribute(k,at[k]);return e};
 const vg=mk('g',{});vg.append(mk('rect',{x:250,y:118,width:390,height:40,rx:6,fill:'#f2a24a',opacity:.22}));for(let x=258;x<632;x+=7){const h=6+Math.abs(Math.sin(x*.37)*14+Math.sin(x*.11)*8);vg.append(mk('rect',{x,y:138-h/2,width:3.2,height:h,rx:1.5,fill:'#e08a2c',opacity:.75}))}
 const tx=(x,y,t,anchor)=>{const e=mk('text',{x,y,'font-size':12,fill:'#6b7a8c','text-anchor':anchor||'middle'});e.textContent=t;return e};vg.append(mk('path',{d:'M960 10 V165',stroke:'#9fb0c3','stroke-dasharray':'4 4','vector-effect':'non-scaling-stroke'}));svg.prepend(vg);svg.querySelectorAll('path[stroke-dasharray="6 5"]').forEach(x=>x.remove());const lab=(txt,css)=>{const e=document.createElement('span');e.className='rlab';e.textContent=txt;e.style.cssText=css;g.append(e)};lab('Voice read','left:44.5%;top:98px;transform:translateX(-50%)');lab('Bed ends','right:5%;top:4px');lab('Music level','left:6px;top:4px');
 g.style.height='170px';g._h={};
 for(const id of ['in','out','fade']){const l=[mk('path',{stroke:'#1768d2','stroke-width':1.5,opacity:.6}),mk('path',{stroke:'#1768d2','stroke-width':1.5,opacity:.6})];svg.append(...l);const c=document.createElement('div'),a=document.createElement('div'),b=document.createElement('div');c.className='rampdot';a.className=b.className='rampdot tan';c.title='Drag left or right to move this ramp';a.title=b.title='Drag sideways for steepness, up or down for curve';g.append(c,a,b);g._h[id]={c,a,b,l}}
 g._ready=true;
 const keys={in:['inPos','inLen','inCurve'],out:['outPos','outLen','outCurve'],fade:['fadePos','endFade','fadeShape']},CX={in:250,out:640,fade:960},K=110;
 const commit=()=>{s.cache&&s.cache.clear();if(s.active>=0&&typeof live!=='undefined'&&live)play(s.active,livePosition()/live.length)};
 const pt=e=>{const r=g.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*1000,y:(e.clientY-r.top)*(170/r.height)}};
 for(const id of ['in','out','fade']){const[kp,kl,kc]=keys[id],h=g._h[id];
  const center=()=>id=='fade'?960+(s.fadePos||0)*K-s.endFade*K/2:CX[id]+rp(kp)*K;
  h.c.onpointerdown=e=>{e.preventDefault();h.c.setPointerCapture(e.pointerId);h.c._x=pt(e).x;h.c._p=id=='fade'?(s.fadePos||0):rp(kp)};
  h.c.onpointermove=e=>{if(!h.c.hasPointerCapture(e.pointerId))return;const dx=(pt(e).x-h.c._x)/K;if(id=='fade')s.fadePos=clamp(h.c._p+dx,-s.duration*.5,0);else s[kp]=clamp(h.c._p+dx,id=='in'?-3:-1.5,id=='in'?1.5:3);paintRamp()};h.c.onpointerup=commit;
  for(const[side,el]of[[-1,h.a],[1,h.b]]){el.onpointerdown=e=>{e.preventDefault();el.setPointerCapture(e.pointerId);el._y=pt(e).y;el._c=id=='fade'?s.fadeShape:rp(kc)};
   el.onpointermove=e=>{if(!el.hasPointerCapture(e.pointerId))return;const q=pt(e),w=Math.max(.04,Math.abs(q.x-center())*2/K);if(id=='fade')s.endFade=clamp(w,.05,s.duration*.5);else s[kl]=clamp(w,.03,4);
    const down=id!='out',dy=(q.y-el._y)*(side<0?1:-1)*(down?1:-1),c=clamp(el._c*Math.pow(4,dy/40),.2,5);if(id=='fade')s.fadeShape=c;else s[kc]=c;paintRamp()};el.onpointerup=commit}}
 paintRamp();
}</script>
<style>.rampdot.tan{width:10px;height:10px;border-radius:2px;background:#fff;border:2px solid #1768d2;cursor:move}.fnLabel{display:block;margin-bottom:4px}.rlab{position:absolute;font-size:11px;color:#6b7a8c;pointer-events:none;white-space:nowrap}#rampPath{vector-effect:non-scaling-stroke;stroke-width:2.5}#fileName{width:100%;box-sizing:border-box}#voicePanel .settings{display:block}#voicePanel .settings #filenamePreview{display:block;margin-top:4px}
@media (prefers-color-scheme:dark){.rampdot.tan{background:#1b2230}}</style>"""
_js,_css=js.split('</script>');_mi=s.index('function paintRamp(');_end=s.rindex('})()',_mi,s.index('</script>',_mi));s=s[:_end]+'\n;'+_js.replace('<script>','')+'\n'+s[_end:]+_css
open(p,'w').write(s)
