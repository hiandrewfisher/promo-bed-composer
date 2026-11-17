import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
a="var h=heap(), m=PBC&&PBC.mem?(function(){try{return PBC.mem()}catch(e){return null}})():null;"
if s.count(a)!=1: print('ANCHOR x%d'%s.count(a));sys.exit(1)
# native audio and DOM counts beside the JS heap, so a leak shows up in whichever
# pool it is actually growing in
s=s.replace(a,a+"\n   var dom=0,rows=0;try{dom=document.getElementsByTagName('*').length;rows=(window.__ROWC&&window.__ROWC.size)||0}catch(e){}")
b="cache:m?m.cacheMB:null,notes:m?m.cachedNotes:null,banks:m?m.banks:null,"
if s.count(b)!=1: print('ANCHOR2 x%d'%s.count(b));sys.exit(1)
s=s.replace(b,b+"dom:dom,rows:rows,")
c="(e.cache!=null?('  samples '+String(e.cache).padStart(5)+'MB/'+e.notes+'n/'+e.banks+'b'):'')+"
if s.count(c)!=1: print('ANCHOR3 x%d'%s.count(c));sys.exit(1)
s=s.replace(c,c+"(e.dom!=null?('  dom '+String(e.dom).padStart(5)+'/'+e.rows+'rows'):'')+")
io.open(p,'w',encoding='utf-8').write(s);print('patch48 ok')
