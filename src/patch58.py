import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
def one(a,l):
    if s.count(a)!=1: print('ANCHOR %s x%d'%(l,s.count(a)));sys.exit(1)

# Decoded audio is the largest pool and it is native memory the heap figure never
# shows. Halve the budget again: an evicted sample costs one re-decode.
a="if(l)return Math.max(48,Math.min(96,Math.round(l/1048576*0.05)))*1048576}catch(e){}return 96*1048576"
one(a,'cap')
s=s.replace(a,"if(l)return Math.max(32,Math.min(48,Math.round(l/1048576*0.025)))*1048576}catch(e){}return 48*1048576")
io.open(p,'w',encoding='utf-8').write(s);print('patch58 ok')
