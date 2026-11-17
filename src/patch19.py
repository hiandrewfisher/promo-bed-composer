CSS = open('chunky/root.css',encoding='utf-8').read() + """
/* fields + summaries: squircle face via border-image, wall via ::before. No DOM changes. */
select,input[type=text],details>summary{
  position:relative;z-index:0;border-style:solid !important;border-width:0 !important;border-color:transparent !important;outline:0;
  border-image:var(--face-src) 23 fill/23px/0 stretch !important;
  background-color:transparent !important;box-shadow:none !important;
  min-height:46px;padding:13px 18px;line-height:1.35;color:#2f6bd8 !important;
  font-family:Archivo,system-ui,sans-serif;font-weight:800;
  appearance:none;-webkit-appearance:none;
  filter:drop-shadow(0 3px 3px rgba(0,0,0,.14));}
details>summary{list-style:none;cursor:pointer;display:block}
select{display:flex;align-items:center;padding-top:0;padding-bottom:0}
details>summary::-webkit-details-marker{display:none}
input[type=text]{font-weight:700;letter-spacing:0;text-transform:none;color:#1e293b !important}
select{padding-right:36px;cursor:pointer;
  background-image:linear-gradient(45deg,transparent 50%,currentColor 50%),
    linear-gradient(135deg,currentColor 50%,transparent 50%) !important;
  background-position:calc(100% - 21px) 50%,calc(100% - 15px) 50% !important;
  background-size:6px 6px,6px 6px !important;background-repeat:no-repeat !important}
.rampdot,.rampbox select,[class*="bedx"] select{filter:none !important}
.ck-q{--w:48px;--h:48px}
.ck-q .ck-cap{font-size:1rem}
"""
p='index.html'; s=open(p,encoding='utf-8').read()
s += '\n<style id="chunky-fields">'+CSS+'</style>\n'
open(p,'w',encoding='utf-8').write(s)
print('ok 19')
