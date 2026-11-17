import io
p='index.html';s=open(p,encoding='utf-8').read()
CSS = """
/* --- 3D button corrections --- */
button:not(.rampdot):not([class*="bedx"]),.pill,.primary{
  vertical-align:middle !important;
  color:var(--ink-btn) !important;
}
.toolbar,.pills,.controls,.settings,.gapControls,.between{align-items:center !important}
.primary,#compose,#export{--ink-btn:#fff !important}
#ratings{--ink-btn:#153789 !important}
#compose:disabled,button:disabled{opacity:.5}
button:not(.rampdot):not([class*="bedx"]):active,.pill:active{
  transform:translateY(calc(var(--lift) - 3px));
  box-shadow:inset 0 2px 0 #ffffff33,inset 0 -2px 0 #0000001f,inset 0 0 0 1px #0000000f,
    0 3px 0 -2px var(--slab, color-mix(in oklab, var(--face) 80%, #0A1733)),
    1px 5px 10px -6px #16305c4d;}
"""
s = s + '\n<style id="ui-3d-fix">'+CSS+'</style>\n'
open(p,'w',encoding='utf-8').write(s)
print('ok 17')
