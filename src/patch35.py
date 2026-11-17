p='index.html'; s=open(p,encoding='utf-8').read()
def rep(old,new):
    global s
    assert s.count(old)==1,('ANCHOR x%d: '%s.count(old))+old[:90]
    s=s.replace(old,new)

# The instrument picker hid every wind, brass, reed and organ because those
# sample banks used to 404. They have been published since v82, so the filter
# was withholding instruments the user owns. Offer everything that can
# actually play: only the six organ banks remain genuinely unavailable.
rep("insList=()=>insOpts||(insOpts=Object.entries(PBC.INS).filter(([k,v])=>!['pipe','reed','brass','organ'].includes(v[3])&&!/harm|sax|tpt|tbn|horn|tuba|oboe|clarinet|bassoon|flute|fl_|picc|rec_|recorder|ocarina|bsn|ob_|cl_|wartuba|mtg_/.test(k)).sort((a,b)=>a[1][0].localeCompare(b[1][0])));",
    "insList=()=>insOpts||(insOpts=Object.entries(PBC.INS).filter(([k,v])=>!(typeof UNAVAILABLE!=='undefined'&&UNAVAILABLE.has(k))).sort((a,b)=>a[1][0].localeCompare(b[1][0])));")
open(p,'w',encoding='utf-8').write(s)
print('ok 35')
