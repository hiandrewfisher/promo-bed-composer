function composeScore(o){
 if((o.fidelity??1)<1)return composeDiscovered(o);
 const piece=o.piece,L=o.L,bpm=120,beat=.5,key=0,S=structuredClone(o.blend?blendG(o.blend,o.seed):G[o.genre]||G.indie),notes=[],hits=[],roles={};
 S.kits=[];S.pump=0;S.master={...MASTER,sat:0,ex:0,wow:0,vinyl:0};S.mix={lead:{...STRIP.keys,lvl:.8,pan:0,spread:0,verb:{t:'room',s:.06}},keys:{...STRIP.keys,lvl:.38,pan:0,spread:0,verb:{t:'room',s:.06}},bass:{...STRIP.bass,lvl:.32,pan:0,verb:{t:'room',s:0}}};S.n='Stored score rendition';
 for(const name of ['lead','keys','bass'])roles[name]={name,id:'grand',kind:'piano',reg:[INS.grand[4],INS.grand[5]],guitar:false,drift:0};
 const add=(r,B,d,m,v,extra={})=>{if(B*beat>=L||d<=0)return;notes.push({r,B,d,m,v,dt:0,sc:0,t:B*beat,dur:Math.max(.02,Math.min(d*beat,L-B*beat)),...extra})},sourceLength=Math.max(piece.len,...piece.mel.map(n=>n[0]+n[1]));
 for(let offset=0;offset*beat<L;offset+=sourceLength){piece.mel.forEach((n,i)=>add(roles.lead,n[0]+offset,n[1],n[2],.62,{sourceIndex:i}));for(const c of piece.chords){const B=c[0]+offset,root=mod(c[2],12),iv=Q[c[4]]||Q.maj;for(const x of iv.slice(0,3))add(roles.keys,B,c[1],near(root+x,55+x,36,88),.34);add(roles.bass,B,c[1],near(c[3],36,24,48),.4)}}
 const meta={genre:S.n,style:'Faithful stored-score rendition',source:piece.composer+', '+piece.title,title:piece.title,pieceId:piece._i,sourceFingerprint:piece._fingerprint||scoreIdentity(piece).hash,sourceFidelity:1,reference:'Normalized melody and chord reduction; original key, tempo and orchestration unavailable',key:NOTE[0]+' '+MODEN[piece.mode==='min'?'min':'maj'],bpm,chords:piece.chords.slice(0,12).map(c=>NOTE[mod(c[2],12)]+QN[c[4]]).join(' - '),offset:1.2,button:L,lineup:Object.values(roles).map(r=>INS[r.id][0]),sourceNotes:piece.mel.length};
 return{notes,hits,roles,meta,offset:1.2,S,bpm,key,score:piece,scoreFidelity:1};
}
