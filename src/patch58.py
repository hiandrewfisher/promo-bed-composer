import io,sys,time,os
p='index.html';s=io.open(p,encoding='utf-8').read()
VER=os.environ.get('PBC_VER','122')
STAMP=time.strftime('%Y-%m-%d %H:%M',time.gmtime())
a="<h1>Promo Bed Composer</h1>"
if s.count(a)!=1: print('ANCHOR x%d'%s.count(a));sys.exit(1)
s=s.replace(a,'<h1>Promo Bed Composer <span class="ver" title="build %s UTC">v%s</span></h1>'%(STAMP,VER))
# a quiet badge beside the title, and the same string in the console and the ledger
s=s.replace('</style>','.ver{font-size:11px;font-weight:600;letter-spacing:.04em;vertical-align:middle;'
 'opacity:.55;padding:2px 6px;border:1px solid currentColor;border-radius:999px;margin-left:8px}\n</style>',1)
s=s+('\n<script>window.PBC_VERSION="v%s";window.PBC_BUILT="%s UTC";'
 'try{console.log("[PromoMixer] build v%s ("+window.PBC_BUILT+")")}catch(e){}</scr'+chr(105)+'pt>\n')%(VER,STAMP,VER)
io.open(p,'w',encoding='utf-8').write(s);print('patch58 version badge v%s'%VER)
