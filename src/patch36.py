p='index.html'; s=open(p,encoding='utf-8').read()
def rep(old,new):
    global s
    assert s.count(old)==1,('ANCHOR x%d: '%s.count(old))+old[:90]
    s=s.replace(old,new)

# INS is keyed by id but bank() is called with the FILE name, and for the
# organs those differ: INS.pipeorgan -> file 'pipe_organ', INS.renorgan ->
# 'ren_organ'. substitute() looked up INS[fileName], found nothing, returned
# null, and bank() then fetched the missing file -> 404 and a silent part.
rep("const UNAVAILABLE=new Set(['organ_loud','organ_ped','renorg4','renorgfull','pipe_organ','ren_organ'])",
    "const UNAVAILABLE=new Set(['organ_loud','organ_ped','renorg4','renorgfull',"
    "'pipe_organ','ren_organ','pipeorgan','renorgan'])")

# resolve an INS entry by its key OR by its file name, and always land on a
# real instrument rather than returning null
rep("""function substitute(id){
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
}""",
"""function insFind(id){
  if(typeof INS==='undefined')return null;
  if(INS[id])return INS[id];
  for(const k in INS) if(INS[k][1]===id) return INS[k];   // match by file name
  return null;
}
function substitute(id){
  try{
    const cur=insFind(id);
    const kind=cur?cur[3]:null;
    const bad=n=>typeof UNAVAILABLE!=='undefined'&&UNAVAILABLE.has(n);
    const alt=kind&&FALLBACK[kind];
    if(alt&&insFind(alt)&&alt!==id&&!bad(alt))return insFind(alt)[1]||alt;
    if(kind)for(const k in INS){
      if(INS[k][3]===kind&&k!==id&&!bad(k)&&!bad(INS[k][1]))return INS[k][1]||k;
    }
    // last resort: a keyboard that is certainly published
    for(const safe of ['pianet','kawai_legacy','wurli_f','vibes','nylon']){
      const e=insFind(safe); if(e&&!bad(safe)&&!bad(e[1]))return e[1]||safe;
    }
  }catch(e){}
  return null;
}""")

# bank() must resolve the substitute's FONT correctly too
rep("""  if(typeof UNAVAILABLE!=='undefined'&&UNAVAILABLE.has(name)){
    const sub=substitute(name);
    if(sub&&typeof INS!=='undefined'&&INS[sub]){name=sub;dir=INS[sub][2]||dir}
  }""",
"""  if(typeof UNAVAILABLE!=='undefined'&&UNAVAILABLE.has(name)){
    const sub=substitute(name);
    if(sub){const e=insFind(sub); name=sub; if(e&&e[2])dir=e[2]}
  }""")
rep("""    .catch(err=>{const sub=substitute(name);
      if(sub&&typeof INS!=='undefined'&&INS[sub])return bank(INS[sub][2]||dir,sub);
      throw err});""",
"""    .catch(err=>{const sub=substitute(name);
      if(sub&&sub!==name){const e=insFind(sub);return bank((e&&e[2])||dir,sub)}
      throw err});""")
open(p,'w',encoding='utf-8').write(s)
print('ok 36')
