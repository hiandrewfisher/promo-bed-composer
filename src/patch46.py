import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
a="try{const m=performance.memory;if(m&&m.jsHeapSizeLimit){"
if s.count(a)!=1: print('ANCHOR x%d'%s.count(a));sys.exit(1)
# a 60s bed is twice the main-thread work of a 30s one: render fewer at once
s=s.replace(a,"if(s.duration>=50)lanes=1;else if(s.duration>=35)lanes=Math.min(lanes,2);"
 "try{const m=performance.memory;if(m&&m.jsHeapSizeLimit){")
io.open(p,'w',encoding='utf-8').write(s);print('lanes by length ok')
