p='index.html'; s=open(p,encoding='utf-8').read()
def rep(old,new,n=1):
    global s
    assert s.count(old)>=1, 'MISSING: '+old[:90]
    s=s.replace(old,new,n)

# 1 ── star widget replaces heart + thumbs-down
old_heart = """const heart=document.createElement('button');heart.className='icon heart'+(t.fav?' on':'');heart.textContent=t.fav?'♥':'♡';heart.title='Like: this one sounds good';heart.onclick=()=>{t.fav=!t.fav;if(t.fav)t.dis=false;t.ratedAt=Date.now();render()};const nope=document.createElement('button');nope.className='icon dislike'+(t.dis?' on':'');nope.textContent='👎';nope.title='Dislike: this one does not work';nope.onclick=()=>{t.dis=!t.dis;if(t.dis)t.fav=false;t.ratedAt=Date.now();render()};"""
new_stars = """const stars=document.createElement('div');stars.className='stars';stars.setAttribute('role','radiogroup');stars.setAttribute('aria-label','Rate this bed, 1 to 5 stars');for(let sv=1;sv<=5;sv++){const sb=document.createElement('button');sb.type='button';const cur=t.stars||0;sb.className='star'+(cur>=sv?' on':'');sb.textContent=cur>=sv?'★':'☆';sb.title=sv+(sv>1?' stars — ':' star — ')+STAR_MEAN[sv];sb.setAttribute('aria-label',sb.title);sb.setAttribute('aria-pressed',cur===sv?'true':'false');sb.onclick=()=>{setStars(t,t.stars===sv?0:sv);render()};stars.append(sb)}"""
rep(old_heart,new_stars)
rep("head.append(pb,name,rr,ie,heart,nope,dl)","head.append(pb,name,rr,ie,stars,dl)")

# 2 ── rubric + setter, injected before render()
helper = """const STAR_MEAN={1:'almost nothing about it that I like',2:'something very, very obnoxious or very, very boring about it',3:'one thing that is obnoxious or boring about it',4:'one thing that is slightly obnoxious or slightly boring about it',5:'pretty dang good'};
function setStars(t,v){t.stars=v;t.fav=v>=4;t.dis=v>0&&v<=2;t.ratedAt=v?Date.now():null}
function starCount(){return s.tracks.filter(t=>t.stars>0).length}
function render(){"""
rep("function render(){",helper)

# 3 ── header counts + empty-state copy
rep("$('export').textContent='↓ Export ♥ '+s.tracks.filter(t=>t.fav).length;",
    "$('export').textContent='↓ Export ★ '+s.tracks.filter(t=>t.fav).length;")
rep("'Mark a favorite by tapping ♡'","'Rate a bed 4 or 5 stars to see it here'")

# 4 ── full-detail ratings export
old_json_start = s.index("function ratingsJSON(){")
old_json_end   = s.index("$('ratings').onclick=")
new_json = """function ratingsJSON(){const beds=s.tracks.filter(t=>t.stars>0).map(t=>({
  stars:t.stars,meaning:STAR_MEAN[t.stars],name:t.name,id:t.id||null,
  ratedAt:t.ratedAt?new Date(t.ratedAt).toISOString():null,
  identity:{seed:t.seed??null,style:t.style??null,styleName:(typeof STY!=='undefined'&&STY[t.style]&&STY[t.style].n)||null,
    source:t.source||null,take:t.takes||0,piece:t.piece||null},
  read:t.readLabel||null,
  lengths:{bedLength:t.bedLength??t.L??null,requestedLength:t.L??null,
    voiceLength:s.voiceLength??null,voiceOffset:t.offset??null,musicStart:t.musicStart??null},
  levels:{maxDb:t.maxDb??null,minDb:t.minDb??null,attack:s.attack??null,release:s.release??null},
  genreSliders:t.blend||null,scoreSlider:t.faith??null,
  summary:t.metaAll||null,line:t.metaLine||'',full:t.metaFull||null,
  composerChoices:t.detail||null,
  instrumentsAsRendered:t.chan||null,
  songAsRendered:t.songDef||null,
  userEdits:{instruments:t.ch||null,song:t.song||null,keepIns:t.keepIns||null,avoidIns:t.avoidIns||null}
}));
const byStar={};for(let i=1;i<=5;i++)byStar[i]=beds.filter(b=>b.stars===i).length;
return{app:'Promo Bed Composer',exported:new Date().toISOString(),
 scale:{1:STAR_MEAN[1],2:STAR_MEAN[2],3:STAR_MEAN[3],4:STAR_MEAN[4],5:STAR_MEAN[5]},
 note:'Each entry is one bed rated 1-5 stars, with every decision behind it: identity and seed, the genre sliders and score slider that produced it, the structure/harmony/hook/instrument/pattern/groove/effect choices, the instruments and song as actually rendered, the lengths and levels, and any manual edits. Compare entries across star levels to find which specific choices track with high and low ratings.',
 counts:{rated:beds.length,byStar},
 session:{genreWeights:s.gw||null,scoreSlider:s.src??null,voiceLength:s.voiceLength??null,totalBeds:s.tracks.length},
 beds}}
"""
s = s[:old_json_start] + new_json + s[old_json_end:]

# 5 ── ratings export messaging
rep("if(!j.beds.length){setStatus('Like or dislike some beds first (♡ / 👎 on each bed)');return}",
    "if(!j.beds.length){setStatus('Rate some beds first — tap 1 to 5 stars on each bed');return}")
rep("setStatus('Saved '+j.counts.like+' likes and '+j.counts.dislike+' dislikes')",
    "setStatus('Saved ratings for '+j.counts.rated+' bed'+(j.counts.rated==1?'':'s'))")

# 6 ── star styling (plain, not chunky keys)
CSS = """
.stars{display:inline-flex;align-items:center;gap:0;flex:0 0 auto}
.stars .star{border:0 !important;background:none !important;box-shadow:none !important;
  padding:0 2px !important;min-height:0 !important;min-width:0 !important;border-radius:0 !important;
  cursor:pointer;line-height:1;font-size:20px !important;color:#c3cedb !important;
  font-family:inherit !important;letter-spacing:0 !important;text-transform:none !important;
  font-weight:400 !important;transition:color .12s,transform .12s}
.stars .star.on{color:#F4BD27 !important}
.stars:has(.star:hover) .star{color:#F4BD27 !important}
.stars .star:hover~.star{color:#c3cedb !important}
.stars .star:hover{transform:scale(1.18)}
/* the bed name is a label, not a key */
.trackname{border:0 !important;background:none !important;box-shadow:none !important;
  padding:0 !important;min-height:0 !important;border-radius:0 !important;
  text-transform:none !important;letter-spacing:0 !important;font-weight:700 !important;
  font-size:14px !important;color:#182540 !important;text-align:left !important;
  flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rowhead{gap:8px}
"""

s += '\n<style id="star-rating">'+CSS+'</style>\n'
open(p,'w',encoding='utf-8').write(s)
print('ok 20')
