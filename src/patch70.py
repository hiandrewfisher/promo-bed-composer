import io,sys,os
p=os.path.join(os.path.dirname(__file__),'..','index.html')
s=io.open(p,encoding='utf-8').read()
def need(a,l,n=1):
    if s.count(a)!=n: print('ANCHOR %s x%d (want %d)'%(l,s.count(a),n));sys.exit(1)

# At the "as written" end, pick a piece whose recording is really there. Landing
# on one whose audio was never stored, or has since been evicted, is why the far
# end could come out as an arrangement with no recording in it at all.
a=("  {try{const fresh=(faith??.7)<MINE_KNEE;\n"
   "   const pc=fresh?(await UL.compose(R0))||await UL.pick(R0):await UL.pick(R0);")
need(a,'pick')
s=s.replace(a,
"  {try{const F0=faith??.7,fresh=F0<MINE_KNEE;\n"
"   const pc=fresh?(await UL.compose(R0))||await UL.pick(R0)\n"
"     :((F0>=.5&&UL.pickPlayable?await UL.pickPlayable(R0):null)||await UL.pick(R0));")

# and say so when it cannot, instead of quietly handing back an arrangement
a2=("   if(b){o={...o,mineBuf:b,mineGain:mg,mineOnly:F>=.985,compGain:Math.cos(fp*Math.PI/2)};\n")
need(a2,'mineset')
s=s.replace(a2,
"   if(!b)console.warn('[PromoMixer] \"as written\" has nothing to play for '+o.piece.title+\n"
"     ' — its audio is not in storage, so this bed is the arrangement only. Add the file again to restore it.');\n"
+a2)

# confirm() is ignored inside a sandboxed artifact frame, so Clear did nothing
# there at all. Two clicks, no modal.
a3="""$$('mineClear').onclick=async()=>{if(!confirm('Remove every analysed piece from your library?'))return;
  await UL.clear();await count();prog('Library cleared')};"""
need(a3,'clear')
s=s.replace(a3,
"""let armed=0;
 $$('mineClear').onclick=async()=>{
  if(!armed){armed=1;$$('mineClear').textContent='Really clear?';
   setTimeout(()=>{armed=0;$$('mineClear').textContent='Clear'},4000);return}
  armed=0;$$('mineClear').textContent='Clear';
  await UL.clear();await count();prog('Library cleared')};""")

# the panel should say what the library can actually do, not just how many
a4="""   window.PBC_MINE_N=n;"""
need(a4,'count')
s=s.replace(a4,
"""   window.PBC_MINE_N=n;
   if(UL.stats)UL.stats().then(st=>{const el=$$('mineHealth');if(!el)return;
    const bits=[];
    bits.push(st.playable+' of '+st.n+' can play as written');
    if(st.stale)bits.push(st.stale+' analysed by an older version \\u2014 add them again to re-read them');
    el.textContent=bits.join(' \\u00b7 ');
    el.className='sub'+(st.stale||st.playable<st.n?' mineWarn':'')}).catch(()=>{});""")
a5='\'<div id="mineProg" class="sub"></div>\'+'
need(a5,'prog')
s=s.replace(a5,a5+'\'<div id="mineHealth" class="sub"></div>\'+')

CSS="#mineBox .mineWarn{color:#c2410c}\n@media (prefers-color-scheme:dark){:root:not([data-theme=\"light\"]) #mineBox .mineWarn{color:#fdba74}}\n"
s=s.replace('</style>',CSS+'</style>',1)
io.open(p,'w',encoding='utf-8').write(s);print('patch70 ok')
