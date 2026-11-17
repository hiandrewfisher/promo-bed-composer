import io,sys
p='engine.js';s=io.open(p,encoding='utf-8').read()
a="if(false){const ns=C.createBufferSource()"
if s.count(a)!=1: print('ANCHOR x%d'%s.count(a));sys.exit(1)
# breath / air noise through the bore, and the key-pad click, for the wind family
s=s.replace(a,"if(full&&!r.fx&&['reed','pipe','brass','solo','ss','rd','tb'].includes(k)&&n.dur>.2){const ns=C.createBufferSource()")
b="const a0=(.6-v)*.2*gn;"
if s.count(b)!=1: print('ANCHOR2 x%d'%s.count(b));sys.exit(1)
s=s.replace(b,"const a0=Math.max(.1,.9-v)*.085*gn*((o.song||{}).expr??1);")
io.open(p,'w',encoding='utf-8').write(s);print('breath noise ok')
