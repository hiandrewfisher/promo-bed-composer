p='index.html';s=open(p).read()
def rep(a,b):
    global s;assert s.count(a)==1,(s.count(a),a[:70]);s=s.replace(a,b)
# ---- random genre picker ----
rep("function composeNew(n){if(!s.voice){setStatus('Add a voice recording first');return}const ids=GEN.map(g=>g.id).filter(k=>s.gw[k]>0);if(!ids.length){setStatus('Turn up at least one genre in the genre mix');return}",
"function composeNew(n){if(!s.voice){setStatus('Add a voice recording first');return}const ids=GEN.map(g=>g.id).filter(k=>s.gw[k]>0);if(!s.randGenre&&!ids.length){setStatus('Turn up at least one genre in the genre mix');return}")
rep("const blend={};for(const k of ids)blend[k]=s.gw[k];for(let i=0;i<n;i++){const sd=(base^Math.imul(batch*16+i+1,0x9E3779B1))>>>0,src='library';const nb0=newBed('mix',sd,src,blend);",
"const blend={};for(const k of ids)blend[k]=s.gw[k];for(let i=0;i<n;i++){const sd=(base^Math.imul(batch*16+i+1,0x9E3779B1))>>>0,src='library';const bl=s.randGenre?randomBlend(sd):blend;const nb0=newBed('mix',sd,src,bl);")
rep("const RECENT=[],RECK=[],RECB=[],RECS=[];",
"""// pick N weights 1-100, scale them so the biggest is 100, then hand them to N genres at random
function randomBlend(seed){const R=(a=>()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296})((seed^0xc0ffee)>>>0);
 const choices=[1,2,3,5,10,20];let n=s.randCount;if(n=='random'||n==null)n=choices[Math.floor(R()*choices.length)];n=Math.max(1,Math.min(+n,GEN.length));
 const w=[];for(let i=0;i<n;i++)w.push(1+Math.floor(R()*100));const mx=Math.max(...w),k=100/mx;
 const pool=GEN.map(g=>g.id);for(let i=pool.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
 const out={};for(let i=0;i<n;i++)out[pool[i]]=Math.max(1,Math.round(w[i]*k));return out}
const RECENT=[],RECK=[],RECB=[],RECS=[];""")
# the bed shows which genres the dice gave it
rep("$('filenamePreview').textContent='Saves as '+filename(0);","$('filenamePreview').textContent='Saves as '+filename(0);")
js=r"""
;{const $=id=>document.getElementById(id),box=document.querySelector('.genreBox');if(box){
 s.randGenre=false;s.randCount=5;
 const bar=document.createElement('div');bar.className='randbar';
 const lab=document.createElement('label');lab.className='randtoggle';
 const cb=document.createElement('input');cb.type='checkbox';
 const sel=document.createElement('select');sel.className='randcount';sel.setAttribute('aria-label','How many genres per bed');
 for(const v of [1,2,3,5,10,20,'random'])sel.add(new Option(v=='random'?'a random number of genres':v+(v==1?' genre':' genres'),v,false,v==5));
 lab.append(cb,document.createTextNode(' Pick genres for me'));
 const note=document.createElement('span');note.className='mini';note.textContent='each bed gets its own mix';
 bar.append(lab,sel,note);box.before(bar);
 const apply=()=>{s.randGenre=cb.checked;s.randCount=sel.value=='random'?'random':+sel.value;
  box.classList.toggle('dimmed',cb.checked);box.querySelectorAll('input,button').forEach(el=>{el.disabled=cb.checked});
  sel.disabled=!cb.checked;
  const t=document.querySelector('.gtools');if(t)t.querySelectorAll('input').forEach(el=>el.disabled=cb.checked);
  note.textContent=cb.checked?'each bed gets its own mix':'using the sliders below';
  if(cb.checked&&!box.open)box.open=false};
 cb.onchange=apply;sel.onchange=apply;apply();
}}
"""
css=r"""<style>
.randbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 8px}
.randtoggle{display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;white-space:nowrap}
.randcount{font:inherit;font-size:12.5px;padding:4px 8px;border:1px solid #d6dee8;border-radius:999px;background:#fff;color:inherit}
.randcount:disabled{opacity:.45}
.genreBox.dimmed{opacity:.45}
.genreBox.dimmed>summary{pointer-events:none}
@media (prefers-color-scheme:dark){.randcount{background:#ffffff0d;border-color:#ffffff22}}
</style>"""
_mi=s.index('function paintRamp(');_end=s.rindex('})()',_mi,s.index('</script>',_mi))
s=s[:_end]+js+s[_end:]+css
open(p,'w').write(s)
