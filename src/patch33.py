p='index.html'; s=open(p,encoding='utf-8').read()
def rep(old,new):
    global s
    assert s.count(old)==1,('ANCHOR x%d: '%s.count(old))+old[:90]
    s=s.replace(old,new)

# ── 1. Drop the organs from the instrument pool ──────────────────────────
# Their sample files are not published (no room under the 256 MB cap) so the
# composer picked them and the bank 404'd, leaving a silent part. Measured:
# organ as a kind scores 12.5% good, the worst of any instrument. Removing
# them from selection fixes the 404 and follows the ratings.
MISSING=['organ_loud','organ_ped','renorg4','renorgfull','pipe_organ','ren_organ',
         'tpt_stac','ob_stac','tbn_stac','oldtbn_short','erhu_short','black_stac',
         'darkblack_stac','green_stac','psaltery_sp','vc_sec_spic']
guard = "const UNAVAILABLE=new Set(%s);\n" % repr(MISSING)
rep("const INS", guard+"const INS")

# ── 2. A part never silently vanishes ────────────────────────────────────
# grab() threw and the role rendered empty. Now an unavailable or failed bank
# falls back to a published instrument of the same kind.
rep("function grab(dir,name){const r=await fetch(LOCAL[dir]+name+'.json');if(!r.ok)throw Error('Could not load '+name);return r.json()}",
"""function grab(dir,name){const r=await fetch(LOCAL[dir]+name+'.json');if(!r.ok)throw Error('Could not load '+name);return r.json()}
const FALLBACK={organ:'pianet',stac:'vla_sec_pizz',pipe:'recorder',brass:'trumpet',
  reed:'clarinet',bow:'cello',pluck:'nylon',mallet:'vibes',piano:'kawai_legacy'};
function substitute(id){
  try{
    const cur=(typeof INS!=='undefined'&&INS[id])||null;
    const kind=cur?cur[3]:null;
    const alt=kind&&FALLBACK[kind];
    if(alt&&typeof INS!=='undefined'&&INS[alt]&&alt!==id)return alt;
    for(const k in (typeof INS!=='undefined'?INS:{})){
      if(INS[k][3]===kind&&k!==id&&!(typeof UNAVAILABLE!=='undefined'&&UNAVAILABLE.has(k)))return k;
    }
  }catch(e){}
  return null;
}""")

# apply the guard where an instrument is resolved for a role
rep("function bank(dir,name){const k=dir+'/'+name;let p=banks.get(k);if(!p){p=grab(dir,name).then(j=>({keys:Object.keys(j.samples).map(Number).sort((a,b)=>a-b),b64:j.samples,tune:j.tune||{}}));banks.set(k,p);p.catch(()=>banks.delete(k))}return p}",
"""function bank(dir,name){
  // an instrument whose samples are not published must never become a silent part
  if(typeof UNAVAILABLE!=='undefined'&&UNAVAILABLE.has(name)){
    const sub=substitute(name);
    if(sub&&typeof INS!=='undefined'&&INS[sub]){name=sub;dir=INS[sub][2]||dir}
  }
  const k=dir+'/'+name;let p=banks.get(k);
  if(!p){p=grab(dir,name).then(j=>({keys:Object.keys(j.samples).map(Number).sort((a,b)=>a-b),b64:j.samples,tune:j.tune||{}}))
    .catch(err=>{const sub=substitute(name);
      if(sub&&typeof INS!=='undefined'&&INS[sub])return bank(INS[sub][2]||dir,sub);
      throw err});
   banks.set(k,p);p.catch(()=>banks.delete(k))}
  return p}""")
open(p,'w',encoding='utf-8').write(s)
print('ok 33')
