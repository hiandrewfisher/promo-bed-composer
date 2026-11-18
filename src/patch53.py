import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
tag='<script src="diagnostics.js"></scr'+"'+'"+'ipt>'
# the ledger must install its patches before any app code runs
if 'diagnostics.js' in s: print('already present');sys.exit(0)
s='<script src="diagnostics.js"></'+'script>\n'+s
io.open(p,'w',encoding='utf-8').write(s);print('patch53 ok')
