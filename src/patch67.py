import io,sys,os
p=os.path.join(os.path.dirname(__file__),'..','index.html')
s=io.open(p,encoding='utf-8').read()
def need(a,l,n=1):
    if s.count(a)!=n: print('ANCHOR %s x%d (want %d)'%(l,s.count(a),n));sys.exit(1)

# patch65 gated this whole block, but it also carries mout.connect(destination),
# so a raw bed came out silent. Only the voice pocket should step aside.
a="const SINK=C.createGain(),PKS=[];if(full&&!o.mineOnly){"
need(a,'regate')
s=s.replace(a,"const SINK=C.createGain(),PKS=[];if(full){")
a2=" if(A.act&&A.act.length){const h=A.actHop||.05,f1=clamp((A.f0||140)*2,170,520),"
need(a2,'pocket')
s=s.replace(a2," if(A.act&&A.act.length&&!o.mineOnly){const h=A.actHop||.05,f1=clamp((A.f0||140)*2,170,520),")
io.open(p,'w',encoding='utf-8').write(s);print('patch67 ok')
