p='index.html'; s=open(p,encoding='utf-8').read()
def rep(old,new):
    global s
    assert s.count(old)==1,('ANCHOR x%d: '%s.count(old))+old[:90]
    s=s.replace(old,new)

# --- replace the busy/dull tag strip with a "why" chip set -------------------
_a = s.index("const tags=document.createElement('div');tags.className='tags';")
_b = s.index("tags.append(tb)}", _a) + len("tags.append(tb)}")
old_tags = s[_a:_b]
new_tags = """const tags=document.createElement('div');tags.className='tags';
const wb=document.createElement('button');wb.type='button';wb.className='whyBtn'+(t.showWhy?' on':'');
const nWhy=Object.values(t.why||{}).filter(Boolean).length;
wb.textContent=nWhy?('WHY '+nWhy):'WHY';wb.title='Say what is wrong (or right) with this bed';
wb.onclick=()=>{t.showWhy=!t.showWhy;render()};tags.append(wb);
"""
s = s.replace(old_tags, new_tags)
rep("head.append(pb,name,rr,ie,stars,tags,dl)","head.append(pb,name,rr,ie,stars,tags,dl)")

# the chip panel, appended under the row head when open
rep("const info=document.createElement('div');info.className='bedmeta'+(t.composing?' busy':'');",
"""const whyBox=document.createElement('div');whyBox.className='whyBox';whyBox.hidden=!t.showWhy;
{const mk=(group,list)=>{const g=document.createElement('div');g.className='whyGroup';
   const lb=document.createElement('span');lb.className='whyLabel';lb.textContent=group;g.append(lb);
   for(const [k,lab,tip] of list){const c=document.createElement('button');c.type='button';
     c.className='whyChip w-'+(WHY_POLARITY[k]||'bad')+((t.why&&t.why[k])?' on':'');
     c.textContent=lab;c.title=tip;c.setAttribute('aria-pressed',(t.why&&t.why[k])?'true':'false');
     c.onpointerdown=ev=>{ev.preventDefault();PAINT=!(t.why&&t.why[k]);applyWhy(t,k,c,PAINT,wb)};
     c.onpointerenter=ev=>{if(PAINT!==null&&ev.buttons===1)applyWhy(t,k,c,PAINT,wb)};
     c.onclick=ev=>ev.preventDefault();g.append(c)}
   return g};
 whyBox.append(
  mk('Harmony',[['clash','CLASHING','Notes fight each other — dissonant, sour, out of key'],
                ['chordsOdd','CHORDS ODD','The chord moves are strange or unresolved'],
                ['chordsFast','CHORDS TOO FAST','Harmony changes faster than the ear wants']]),
  mk('Blend',[['badband','WRONG BAND','These instruments do not belong together'],
              ['offgenre','OFF-GENRE','An instrument does not fit the style'],
              ['muddy','MUDDY','Parts pile up in the same low-mid range'],
              ['harsh','HARSH','Shrill, piercing, fatiguing on top']]),
  mk('Rhythm',[['notlocked','NOT LOCKED','Parts do not agree on the groove'],
               ['grooveoff','GROOVE WRONG','Feel or swing is wrong for the style'],
               ['tempo','TEMPO OFF','Drags or rushes']]),
  mk('Density',[['busy','TOO BUSY','Too much going on at once'],
                ['noodly','NOODLY','One part plays far too many notes'],
                ['empty','TOO EMPTY','Not enough going on']]),
  mk('Mix',[['balance','BALANCE OFF','Something is too loud or buried'],
            ['washy','TOO WASHY','Drowned in reverb or delay'],
            ['dry','TOO DRY','Flat, no space around it']]),
  mk('Shape',[['aimless','AIMLESS','Melody wanders, no hook to hold onto'],
              ['repetitive','REPETITIVE','Same idea over and over'],
              ['nospace','CROWDS VOICE','Fights the read instead of sitting under it'],
              ['ending','BAD ENDING','Does not land properly']]),
  mk('Good',[['gHook','GOOD HOOK','The tune itself is strong'],
             ['gBand','GOOD BAND','The instruments suit each other'],
             ['gSits','SITS WELL','Leaves room for the voice'],
             ['gFeel','GOOD FEEL','Groove and tempo are right']]));
}
const info=document.createElement('div');info.className='bedmeta'+(t.composing?' busy':'');""")
rep("row.append(head,info,stage)","row.append(head,whyBox,info,stage)")

# polarity map + rubric, next to STAR_MEAN
rep("const STAR_MEAN=","const WHY_POLARITY={gHook:'good',gBand:'good',gSits:'good',gFeel:'good'};\n"
    "let PAINT=null;document.addEventListener('pointerup',()=>{PAINT=null});document.addEventListener('pointercancel',()=>{PAINT=null});\n"
    "function applyWhy(t,k,el,on,wb){t.why=t.why||{};if(!!t.why[k]===!!on)return;t.why[k]=on;t.ratedAt=Date.now();\n"
    " el.classList.toggle('on',!!on);el.setAttribute('aria-pressed',on?'true':'false');\n"
    " if(wb){const n=Object.values(t.why).filter(Boolean).length;wb.textContent=n?('WHY '+n):'WHY';wb.classList.add('on')}}\n"
    "const STAR_MEAN=")

# rating a bed opens its reason panel
rep("function setStars(t,v){t.stars=v;t.fav=v>=4;t.dis=v>0&&v<=2;t.ratedAt=v?Date.now():null}",
    "function setStars(t,v){t.stars=v;t.fav=v>=4;t.dis=v>0&&v<=2;t.ratedAt=v?Date.now():null;if(v)t.showWhy=true}")

# --- export ------------------------------------------------------------------
rep("  tooBusy:!!(t.tags&&t.tags.busy),tooDull:!!(t.tags&&t.tags.dull),",
    "  reasons:Object.keys(t.why||{}).filter(k=>t.why[k]),\n"
    "  reasonsBad:Object.keys(t.why||{}).filter(k=>t.why[k]&&!WHY_POLARITY[k]),\n"
    "  reasonsGood:Object.keys(t.why||{}).filter(k=>t.why[k]&&WHY_POLARITY[k]==='good'),")

rep("counts:{rated:beds.length,byStar,tooBusy:beds.filter(b=>b.tooBusy).length,tooDull:beds.filter(b=>b.tooDull).length},",
    "counts:{rated:beds.length,byStar,reasonTally:(function(){const o={};for(const b of beds)for(const r of b.reasons)o[r]=(o[r]||0)+1;return o})()},")

rep("note:'tooBusy/tooDull say WHICH failure mode a low rating is: busy=obnoxious/too much, dull=boring/too little. They are independent of the star value and either may be absent.",
    "reasonKey:{clash:'notes fight / dissonant',chordsOdd:'strange or unresolved chord moves',chordsFast:'harmony changes too fast',badband:'instruments do not belong together',offgenre:'an instrument does not fit the style',muddy:'parts pile up in the same low-mid range',harsh:'shrill / piercing on top',notlocked:'parts disagree on the groove',grooveoff:'feel or swing wrong for the style',tempo:'drags or rushes',busy:'too much at once',noodly:'one part plays far too many notes',empty:'not enough going on',balance:'something too loud or buried',washy:'drowned in reverb or delay',dry:'flat, no space',aimless:'melody wanders, no hook',repetitive:'same idea over and over',nospace:'fights the read instead of sitting under it',ending:'does not land',gHook:'GOOD: strong tune',gBand:'GOOD: instruments suit each other',gSits:'GOOD: leaves room for the voice',gFeel:'GOOD: groove and tempo right'},\n"
    " note:'reasons[] names WHY a bed works or fails, chosen by the listener; composerChoices.diagnostics carries the measured correlates (register collisions, chord-tone share, out-of-key share, stacked onsets, low/high note share, gain spread) so each named reason can be tied to numbers.")

CSS = """
.tags{display:inline-flex;gap:4px;flex:0 0 auto;margin-left:6px}
.whyBtn{border:1px solid #d3dceb !important;background:#fff !important;box-shadow:none !important;
  padding:4px 9px !important;min-height:0 !important;border-radius:7px !important;
  font-size:9.5px !important;font-weight:900 !important;letter-spacing:.06em !important;
  color:#8696ad !important;cursor:pointer;font-family:inherit !important;line-height:1.5}
.whyBtn:hover{border-color:#9fb2cc !important;color:#53637c !important}
.whyBtn.on{background:#2859DE !important;border-color:#2859DE !important;color:#fff !important}
.whyBox{margin:8px 0 2px;padding:12px 14px;user-select:none;background:#f7f9fc;border:1px solid #e3eaf4;border-radius:12px;
  display:flex;flex-direction:column;gap:7px}
.whyGroup{display:flex;align-items:center;flex-wrap:wrap;gap:6px}
.whyLabel{font-size:9.5px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;
  color:#9aa8bd;width:62px;flex:0 0 62px}
.whyChip{border:1px solid #d8e0ec !important;background:#fff !important;box-shadow:none !important;
  padding:7px 13px !important;min-height:0 !important;border-radius:999px !important;
  font-size:10.5px !important;font-weight:800 !important;letter-spacing:.05em !important;
  color:#5b6b82 !important;cursor:pointer;font-family:inherit !important;line-height:1.5;
  touch-action:none;user-select:none;-webkit-user-select:none;transition:background .08s,border-color .08s,color .08s}
.whyChip:hover{border-color:#9fb2cc !important;color:#334155 !important}
.whyChip.w-bad.on{background:#F54144 !important;border-color:#F54144 !important;color:#fff !important}
.whyChip.w-good.on{background:#188F69 !important;border-color:#188F69 !important;color:#fff !important}
"""
s += '\n<style id="why-chips">'+CSS+'</style>\n'
open(p,'w',encoding='utf-8').write(s)
print('ok 24')
