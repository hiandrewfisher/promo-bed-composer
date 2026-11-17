import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
def one(a):
    if s.count(a)!=1: print('ANCHOR x%d: %s'%(s.count(a),a[:60]));sys.exit(1)

# A. bound the raw sample-bank map (each entry is a multi-MB base64 blob kept forever)
a="   banks.set(k,p);p.catch(()=>banks.delete(k))}\n  return p}"
one(a)
s=s.replace(a,
"   banks.set(k,p);p.catch(()=>banks.delete(k));\n"
"   while(banks.size>BANK_CAP){const old=banks.keys().next().value;if(old===k)break;banks.delete(old)}}\n"
"  else{banks.delete(k);banks.set(k,p)}\n"
"  return p}")

a2="const banks=new Map();\n"
one(a2)
s=s.replace(a2,"const banks=new Map(),BANK_CAP=8;\n")

# B. the decoded-note cache: 260 stereo AudioBuffers is hundreds of MB
a3="const cache=new Map(),order=[],CAP=260;"
one(a3)
s=s.replace(a3,"const cache=new Map(),order=[],CAP=96;")

io.open(p,'w',encoding='utf-8').write(s);print('patch39 ok')
