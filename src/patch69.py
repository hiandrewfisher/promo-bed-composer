import io,sys,os
p=os.path.join(os.path.dirname(__file__),'..','index.html')
s=io.open(p,encoding='utf-8').read()
def need(a,l,n=1):
    if s.count(a)!=n: print('ANCHOR %s x%d (want %d)'%(l,s.count(a),n));sys.exit(1)

# A take that has been parked to OPFS has t.file=null and keeps its name in
# t.fname. This handler read x.file.name, so every resize after the first park
# threw, and resize fires continuously while the window is dragged: an exception
# per event, which is the freeze. It also redrew every row's canvas on every
# event, so it is now coalesced onto one frame.
a=("window.addEventListener('resize',()=>{if(s.voice)draw($('voiceCanvas'),s.voice);"
   "for(const row of $('list').querySelectorAll('.track')){"
   "const t=s.tracks.find(x=>x.file.name===row.querySelector('.trackname').textContent);"
   "if(t?.buffer)draw(row.querySelector('canvas'),t.buffer,'#1476be',db(t.level))}});")
need(a,'resize')
s=s.replace(a,
"const takeName=x=>x&&(x.file?x.file.name:x.fname)||'';\n"
"let REDRAW=0;\n"
"function redrawAll(){REDRAW=0;\n"
" try{if(s.voice)draw($('voiceCanvas'),s.voice)}catch(e){}\n"
" const list=$('list'); if(!list)return;\n"
" for(const row of list.querySelectorAll('.track')){\n"
"  const nm=row.querySelector('.trackname'); if(!nm)continue;\n"
"  const want=nm.textContent;\n"
"  const t=s.tracks.find(x=>takeName(x)===want);\n"
"  const cv=row.querySelector('canvas');\n"
"  if(t&&t.buffer&&cv){try{draw(cv,t.buffer,'#1476be',db(t.level))}catch(e){}}\n"
" }}\n"
"window.addEventListener('resize',()=>{if(!REDRAW)REDRAW=requestAnimationFrame(redrawAll)});")

# the same assumption inside an error handler: if a parked take fails to
# prepare, reading its name there threw a second time, out of the catch
a2="prepared(t).catch(err=>console.warn('[PromoMixer] preload',t.file.name,err.message))"
need(a2,'preload')
s=s.replace(a2,"prepared(t).catch(err=>console.warn('[PromoMixer] preload',takeName(t),err&&err.message))")
io.open(p,'w',encoding='utf-8').write(s);print('patch69 ok')
