import io,sys,os
p=os.path.join(os.path.dirname(__file__),'..','index.html')
s=io.open(p,encoding='utf-8').read()
def need(a,l,n=1):
    if s.count(a)!=n: print('ANCHOR %s x%d (want %d)'%(l,s.count(a),n));sys.exit(1)

# "as written" has to mean his file. Routing it into the master still ran it
# through the glue compressor, the exciter and the mid/side stage, which cost
# about 12 dB and changed it second by second. At the far end it now goes
# straight to the output and nothing touches it but the ending fade.
a=" if(o.mineBuf){const sp=o.mineOnly?{inp:M}:strip('mine',{},M),b=o.mineBuf,"
need(a,'route')
s=s.replace(a,
" if(o.mineBuf){const sp=o.mineOnly\n"
"   ?(function(){const g=C.createGain();g.connect(C.destination);return{inp:g}})()\n"
"   :strip('mine',{},M),b=o.mineBuf,")
io.open(p,'w',encoding='utf-8').write(s);print('patch68 ok')
