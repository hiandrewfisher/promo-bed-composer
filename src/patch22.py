p='index.html'; s=open(p,encoding='utf-8').read()
def rep(old,new):
    global s
    assert s.count(old)==1, ('ANCHOR x%d: '%s.count(old))+old[:80]
    s=s.replace(old,new)

# tag buttons next to the stars
rep("stars.append(sb)}",
"""stars.append(sb)}
const tags=document.createElement('div');tags.className='tags';
for(const [k,lab,tip] of [['busy','BUSY','Too busy / obnoxious — too much going on'],['dull','DULL','Too boring — not enough going on']]){
  const tb=document.createElement('button');tb.type='button';
  tb.className='tag tag-'+k+((t.tags&&t.tags[k])?' on':'');tb.textContent=lab;tb.title=tip;
  tb.setAttribute('aria-pressed',(t.tags&&t.tags[k])?'true':'false');
  tb.onclick=()=>{t.tags=t.tags||{};t.tags[k]=!t.tags[k];if(t.tags[k]&&t.tags[k==='busy'?'dull':'busy'])t.tags[k==='busy'?'dull':'busy']=false;t.ratedAt=Date.now();render()};
  tags.append(tb)}""")
rep("head.append(pb,name,rr,ie,stars,dl)","head.append(pb,name,rr,ie,stars,tags,dl)")

# carry the tags into the export, with the measured features they bear on
rep("stars:t.stars,meaning:STAR_MEAN[t.stars],name:t.name,id:t.id||null,",
    "stars:t.stars,meaning:STAR_MEAN[t.stars],name:t.name,id:t.id||null,\n"
    "  tooBusy:!!(t.tags&&t.tags.busy),tooDull:!!(t.tags&&t.tags.dull),")

# measured busyness, so 'busy'/'dull' can be tied to numbers not vibes
rep("composerChoices:t.detail||null,",
    "measured:(function(){const c=t.detail||{};const nc=c.noteCounts||{};const beats=Math.max(1,c.finalBeat||1);\n"
    "    const vals=Object.values(nc);return{notesTotal:vals.reduce((a,b)=>a+b,0),notesPerBeat:+(vals.reduce((a,b)=>a+b,0)/beats).toFixed(2),\n"
    "    busiestVoice:vals.length?Math.max(...vals):0,busiestVoicePerBeat:vals.length?+(Math.max(...vals)/beats).toFixed(2):0,\n"
    "    voices:vals.length,drumHits:Object.values(c.drumHitCounts||{}).reduce((a,b)=>a+b,0),beats:beats,\n    gainSpreadDb:(function(){const g=((c.mixBalance||{}).g)||null;if(!g)return null;const v=Object.values(g).filter(x=>typeof x==='number');return v.length?+(Math.max(...v)-Math.min(...v)).toFixed(1):null})()}})(),\n"
    "  composerChoices:t.detail||null,")

rep("note:'Each entry is one bed rated 1-5 stars,",
    "note:'tooBusy/tooDull say WHICH failure mode a low rating is: busy=obnoxious/too much, dull=boring/too little. They are independent of the star value and either may be absent. Each entry is one bed rated 1-5 stars,")

rep("counts:{rated:beds.length,byStar},",
    "counts:{rated:beds.length,byStar,tooBusy:beds.filter(b=>b.tooBusy).length,tooDull:beds.filter(b=>b.tooDull).length},")

CSS = """
.tags{display:inline-flex;gap:4px;flex:0 0 auto;margin-left:6px}
.tags .tag{border:1px solid #d3dceb !important;background:#fff !important;box-shadow:none !important;
  padding:3px 7px !important;min-height:0 !important;border-radius:7px !important;
  font-size:9.5px !important;font-weight:900 !important;letter-spacing:.06em !important;
  color:#8696ad !important;cursor:pointer;font-family:inherit !important;line-height:1.5}
.tags .tag:hover{border-color:#9fb2cc !important;color:#53637c !important}
.tags .tag-busy.on{background:#F54144 !important;border-color:#F54144 !important;color:#fff !important}
.tags .tag-dull.on{background:#8696ad !important;border-color:#8696ad !important;color:#fff !important}
"""
s += '\n<style id="bed-tags">'+CSS+'</style>\n'
open(p,'w',encoding='utf-8').write(s)
print('ok 22')
