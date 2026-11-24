import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
def one(a,l):
    if s.count(a)!=1: print('ANCHOR %s x%d'%(l,s.count(a)));sys.exit(1)

a='<script src="diagnostics.js"></script>'
one(a,'diag')
s=s.replace(a,a+'\n<script src="userlib.js"></script>')

# a piece from your own library, when the share says so, is just another score:
# same shape, same arranger, same instruments
a2="async function pickPiece(seed,avoid,faith,gk){if(!LIBI)LIBI=await libJSON('index.json');"
one(a2,'pick')
s=s.replace(a2,
"async function pickPiece(seed,avoid,faith,gk){\n"
" const share=+(window.PBC_MINE||0);\n"
" if(share>0&&window.UL){const R0=rng((seed^0xA11CE5)>>>0);\n"
"  if(R0()*100<share){try{const pc=await UL.pick(R0);\n"
"   if(pc&&pc.mel&&pc.mel.length>3&&pc.chords&&pc.chords.length){pc._i='u:'+pc.k;\n"
"    console.log('[PromoMixer] source: your library —',pc.title,'·',pc.bpm+' bpm ·',pc.mode);return pc}\n"
"  }catch(e){console.warn('[PromoMixer] library pick failed',e)}}}\n"
" if(!LIBI)LIBI=await libJSON('index.json');")

PANEL = r"""
/* ---------- your own music as source material ---------- */
(function(){
 const aside=document.querySelector('aside.controls');if(!aside||!window.UL)return;
 const d=document.createElement('details');d.className='creditsBox';d.id='mineBox';
 d.innerHTML='<summary>Your music library <b id="mineCount">(0)</b></summary>'+
  '<div class="mineBody">'+
  '<p class="sub">Point this at your own WAV or MP3 files. Each one is analysed once for key, tempo, chords and melody, and the beds get composed from that with the sampled instruments. The audio itself is never stored or uploaded.</p>'+
  '<div class="mineRow">'+
   '<label class="minePick">Choose folder<input id="mineDir" type="file" webkitdirectory multiple hidden></label>'+
   '<label class="minePick">Choose files<input id="mineFiles" type="file" accept="audio/*" multiple hidden></label>'+
   '<button id="mineClear" class="minePick">Clear</button>'+
  '</div>'+
  '<div id="mineProg" class="sub"></div>'+
  '<label class="mineShare">Share of beds from your library <output id="mineOut">0%</output>'+
   '<input id="mineSlider" type="range" min="0" max="100" step="5" value="0"></label>'+
  '</div>';
 aside.append(d);
 const $$=i=>document.getElementById(i);
 const count=async()=>{try{const n=await UL.count();
   $$('mineCount').textContent='('+n+')';
   $$('mineShare')&&0;
   const sl=$$('mineSlider');sl.disabled=!n;
   if(!n){sl.value=0;window.PBC_MINE=0;$$('mineOut').textContent='0%'}
   else if(+sl.value===0){sl.value=50;window.PBC_MINE=50;$$('mineOut').textContent='50%'}
   return n}catch(e){return 0}};
 const prog=t=>{$$('mineProg').textContent=t};
 async function take(files){
  if(!files||!files.length)return;
  prog('Reading '+files.length+' file'+(files.length>1?'s':'')+'…');
  const t0=performance.now();
  const r=await UL.ingest(files,x=>{
   prog(x.done?'':('Analysing '+(x.i+1)+' of '+x.n+' — '+(x.name||'').slice(0,42)));
  });
  await count();
  prog('Added '+r.ok+(r.skip?', '+r.skip+' already there':'')+(r.fail?', '+r.fail+' unreadable':'')+
   ' · '+Math.round((performance.now()-t0)/1000)+'s');
 }
 $$('mineDir').onchange=e=>take(e.target.files);
 $$('mineFiles').onchange=e=>take(e.target.files);
 $$('mineClear').onclick=async()=>{if(!confirm('Remove every analysed piece from your library?'))return;
  await UL.clear();await count();prog('Library cleared')};
 $$('mineSlider').oninput=e=>{window.PBC_MINE=+e.target.value;$$('mineOut').textContent=e.target.value+'%'};
 ['dragover','drop'].forEach(ev=>d.addEventListener(ev,e=>{e.preventDefault();
  if(ev==='drop'&&e.dataTransfer&&e.dataTransfer.files)take(e.dataTransfer.files)}));
 count();
})();
"""
s=s.rstrip()+'\n<script>'+PANEL+'</scr'+'ipt>\n'

CSS = """
#mineBox .mineBody{display:grid;gap:10px;padding:4px 2px 2px}
#mineBox .mineRow{display:flex;gap:8px;flex-wrap:wrap}
#mineBox .minePick{font:inherit;font-size:13px;font-weight:600;padding:7px 12px;border:1px solid currentColor;
 border-radius:8px;opacity:.75;cursor:pointer;background:none;color:inherit}
#mineBox .minePick:hover{opacity:1}
#mineBox .mineShare{display:grid;gap:6px;font-size:13px}
#mineBox .mineShare output{font-variant-numeric:tabular-nums;opacity:.7}
#mineBox input[type=range]:disabled{opacity:.4}
"""
s=s.replace('</style>',CSS+'</style>',1)
io.open(p,'w',encoding='utf-8').write(s);print('patch62 ok')
