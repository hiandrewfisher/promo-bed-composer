import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
a="async function work(){const lanes=Math.min(3,Math.max(1,(navigator.hardwareConcurrency||4)>>1));"
if s.count(a)!=1: print('ANCHOR x%d'%s.count(a));sys.exit(1)
# render fewer beds at once when the tab is already close to its heap ceiling:
# slower beats a dead page, and the breadcrumb log records when this kicks in
s=s.replace(a,"async function work(){let lanes=Math.min(3,Math.max(1,(navigator.hardwareConcurrency||4)>>1));"
 "try{const m=performance.memory;if(m&&m.jsHeapSizeLimit){const fr=m.usedJSHeapSize/m.jsHeapSizeLimit;"
 "if(fr>.78){lanes=1;console.log('[PromoMixer] heap at '+Math.round(fr*100)+'% — rendering one bed at a time')}"
 "else if(fr>.6)lanes=Math.min(lanes,2)}}catch(e){}")
io.open(p,'w',encoding='utf-8').write(s);print('adaptive lanes ok')
