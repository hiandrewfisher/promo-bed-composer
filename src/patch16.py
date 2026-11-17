p='index.html';s=open(p).read()

CSS = r"""
/* ============================================================
   Shared UI: Public Radio Production look + 3D keycap buttons
   Button spec measured from the reference art:
     face  flat colour, 1-2px lighter top rim, ~3px darker inner base
     slab  the same shape in a darker tone, 8px below, 2px inset
     drop  soft ambient shadow, offset slightly right
   ============================================================ */
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800;900&display=swap');
:root{
  --ink:#182540; --muted:#5a6a80; --blue:#2859DE; --blue-d:#153789;
  --red:#E63B36; --gold:#F4BD27; --gold-d:#94700C; --green:#188F69; --green-d:#0A543E;
  --line:#d8dce2; --case:#eef2f7; --canvas:#f4f7fb;
  font-family:Archivo,'Archivo',system-ui,-apple-system,Segoe UI,sans-serif;
  color:var(--ink); background:var(--canvas);
}
body{background:var(--canvas); color:var(--ink); font-family:inherit}
h1,h2,h3,.sectiontitle h2{font-weight:900; letter-spacing:-.03em; color:var(--ink)}
h1{letter-spacing:-.045em}
.sub,.mini,.status{color:var(--muted)}
.panel{
  background:#fff; border:0; border-radius:24px; padding:22px;
  box-shadow:inset 0 3px #fff, inset 0 -5px #e6ebf2,
    0 1px 2px #23304517, 0 3px 6px #23304514, 0 9px 15px #23304512, 0 18px 29px #23304514;
}
.panel .sectiontitle h2{font-size:17px; letter-spacing:-.01em}

/* ---------- 3D buttons ---------- */
button,.pill,.primary,.icon{font-family:inherit}
button:not(.rampdot):not([class*="bedx"]),
.pill,.primary{
  --face:#FFFFFF; --ink-btn:var(--ink); --lift:8px;
  position:relative; display:inline-flex; align-items:center; justify-content:center; gap:9px;
  border:0; cursor:pointer; color:var(--ink-btn);
  font-weight:900; text-transform:uppercase; letter-spacing:.07em; font-size:12px; line-height:1.1;
  padding:11px 17px; min-height:42px; border-radius:12px;
  background:var(--face);
  box-shadow:
    inset 0 2px 0 #ffffff47,
    inset 0 -3px 0 #00000017,
    inset 0 0 0 1px #0000000f,
    0 var(--lift) 0 -2px var(--slab, color-mix(in oklab, var(--face) 80%, #0A1733)),
    2px calc(var(--lift) + 4px) 14px -6px #16305c4d;
  transition:transform .08s ease-out, box-shadow .08s ease-out, filter .12s;
}
button:not(.rampdot):hover,.pill:hover,.primary:hover{filter:brightness(1.04)}
button:not(.rampdot):active,.pill:active,.primary:active{
  transform:translateY(calc(var(--lift) - 2px));
  box-shadow:
    inset 0 1px 0 #ffffff33, inset 0 0 0 1px #0000001a,
    0 2px 0 -2px var(--slab, color-mix(in oklab, var(--face) 80%, #0A1733)),
    1px 3px 6px -4px #16305c45;
}
button:disabled,.pill:disabled,.primary:disabled{opacity:.45; cursor:default}
button:disabled:active{transform:none}
button:focus-visible,.pill:focus-visible,.primary:focus-visible{outline:3px solid var(--blue); outline-offset:3px}

/* white face: a light rim keeps the edge legible */
.pill,button:not(.primary):not(.rampdot){
  --face:#FFFFFF; --slab:#C9D6E6; --ink-btn:var(--ink);
  box-shadow:
    inset 0 2px 0 #fff, inset 0 0 0 2px #E4EAF3,
    0 var(--lift) 0 -2px var(--slab),
    2px calc(var(--lift) + 4px) 14px -6px #16305c33;
}
.pill:active,button:not(.primary):not(.rampdot):active{
  box-shadow:inset 0 0 0 2px #E4EAF3, 0 2px 0 -2px var(--slab), 1px 3px 6px -4px #16305c33;
}
/* selected toggles sit pressed into their base */
.pill.selected,button.selected{
  --face:var(--blue); --slab:var(--blue-d); --ink-btn:#fff;
  transform:translateY(3px);
  box-shadow:
    inset 0 2px 5px #00000030, inset 0 1px 0 #ffffff2e,
    0 5px 0 -2px var(--slab), 1px 7px 11px -6px #16305c45;
}
.pill.selected:active,button.selected:active{transform:translateY(6px)}
/* primary action */
.primary{--face:var(--blue); --slab:var(--blue-d); --ink-btn:#fff; font-size:12.5px; padding:12px 20px; min-height:46px}
#compose{--face:var(--blue); --slab:var(--blue-d); font-size:13px; padding:13px 22px; min-height:50px; border-radius:13px}
#export{--face:var(--green); --slab:var(--green-d); --ink-btn:#fff}
#ratings{--face:var(--gold); --slab:var(--gold-d); --ink-btn:var(--ink)}
button.icon,.icon{padding:0; width:42px; min-width:42px; height:42px; border-radius:12px}
.bedrow .icon,.icon.small{width:38px;min-width:38px;height:38px;border-radius:11px}

/* tiny controls inside dense rows keep a shallower base */
.toolbar .pill,.pills .pill,.between .pill,.gapControls .pill,.settings .pill{
  --lift:6px; font-size:11px; letter-spacing:.06em; padding:9px 13px; min-height:36px; border-radius:11px
}
.chip,.chip.pill{--lift:5px; min-height:30px; padding:6px 11px; font-size:10.5px; border-radius:9px}

/* rows of buttons need clearance for the base */
.toolbar,.pills,.between,.buttons,.settings,.gapControls{row-gap:18px}
.toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px 10px}

/* the ramp editor's handles must stay exactly as they are */
.rampdot,.rampdot.curve{box-shadow:0 1px 3px #0003 !important; text-transform:none; letter-spacing:0}
select,input[type=text],input[type=search],input[type=date],input[type=number]{
  font-family:inherit; border-radius:11px; border:2px solid #cfd9e6; padding:9px 12px; background:#fff; color:var(--ink);
  box-shadow:inset 0 2px 5px #24394b12;
}
select:focus,input:focus{outline:2px solid var(--blue); outline-offset:0; border-color:var(--blue)}
"""

s=s+'\n<style id="ui-3d">'+CSS+'</style>\n'
open(p,'w').write(s)
print('patched',len(s))
