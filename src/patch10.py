p='index.html';s=open(p).read()
def rep(a,b):
    global s;assert s.count(a)>=1,a[:80];s=s.replace(a,b)
rep("ctx,piece:t.piece||undefined,ch:t.ch||null,song:t.song||null},step=>","ctx,piece:t.piece||undefined,ch:t.ch||null,song:t.song||null,avoidIns:t.avoidIns||(t.avoidIns=recentIns()),avoidKeys:t.avoidKeys||(t.avoidKeys=RECK.slice(-3)),avoidGenres:t.avoidGenres||(t.avoidGenres=recentSlots()),avoidBpm:t.avoidBpm||(t.avoidBpm=RECB.slice(-4))},step=>")
rep("ctx,piece:t.piece||undefined,ch:t.edit,","ctx,piece:t.piece||undefined,avoidIns:t.avoidIns||{},avoidGenres:t.avoidGenres||{},avoidKeys:t.avoidKeys||[],avoidBpm:t.avoidBpm||[],ch:t.edit,")
rep("if(r.meta.pieceId!=null)s.usedPieces.add(r.meta.pieceId);","if(r.meta.pieceId!=null)s.usedPieces.add(r.meta.pieceId);if(!t.insLogged&&r.meta.detail&&r.meta.detail.roles){t.insLogged=1;RECENT.push(Object.values(r.meta.detail.roles).map(x=>x.id));if(r.meta.detail.slots){RECS.push(r.meta.detail.slots);if(RECS.length>5)RECS.shift()}RECK.push(r.meta.detail.keyPc);RECB.push(r.meta.detail.bpm);if(RECK.length>6){RECK.shift();RECB.shift()}if(RECENT.length>10)RECENT.shift()}")
rep("async function work(){","const RECENT=[],RECK=[],RECB=[],RECS=[];function recentSlots(){const m={};RECS.forEach((sl,i)=>{const w=RECS.length-i<=2?1:.5;for(const k in sl)if(sl[k])m[k+':'+sl[k]]=(m[k+':'+sl[k]]||0)+w});return m}function recentIns(){const m={};RECENT.forEach((ids,i)=>{const w=RECENT.length-i<=4?1:.5;for(const x of new Set(ids))m[x]=(m[x]||0)+w});return m}\nasync function work(){")
open(p,'w').write(s)
