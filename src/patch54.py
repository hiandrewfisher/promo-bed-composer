import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
def one(a,l):
    if s.count(a)!=1: print('ANCHOR %s x%d'%(l,s.count(a)));sys.exit(1)

# The ledger shows the real shape: between beds the live AudioBuffer count settles
# to the cache size plus ~15, so nothing accumulates. But EVERY render adds a
# transient 130-160 buffers on top of the cache while it decodes and renders, and
# the cache baseline grows toward its budget. Peak heap therefore climbed
# 201 -> 262 -> 383 -> 479 MB across seven beds while the resting level stayed flat.
# The budget is the term to cut: it is paid for on every render, twice over.
a="BYTE_CAP=200*1048576"
one(a,'cap')
s=s.replace(a,"BYTE_CAP=(function(){try{const l=performance.memory&&performance.memory.jsHeapSizeLimit;"
 "if(l)return Math.max(48,Math.min(96,Math.round(l/1048576*0.05)))*1048576}catch(e){}return 96*1048576})()")
io.open(p,'w',encoding='utf-8').write(s);print('patch54 ok')
