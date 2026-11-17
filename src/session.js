/* ---------- The Session: tens of thousands of traditional tunes, fetched and converted by the app itself ----------
   The app downloads the public tunes file from the TheSession-data repository the first time it runs, keeps it in the
   browser cache, reads each tune's ABC notation, and harmonises it with the same chord-finding the library uses. */
const SESSION_URL='https://raw.githubusercontent.com/adactio/TheSession-data/main/json/tunes.json';
let SESS=null,SESSP=null;
async function sessionTunes(){if(SESS)return SESS;if(SESSP)return SESSP;
 SESSP=(async()=>{let txt=null,cache=null;try{if(window.caches)cache=await caches.open('pbc-session-v1');const r=cache&&await cache.match(SESSION_URL);if(r)txt=await r.text()}catch(e){}
  if(!txt){const r=await fetch(SESSION_URL);if(!r.ok)throw new Error('The Session '+r.status);txt=await r.text();try{cache&&await cache.put(SESSION_URL,new Response(txt,{headers:{'content-type':'application/json'}}))}catch(e){}}
  const all=JSON.parse(txt),seen=new Set(),out=[];for(const t of all){if(!t||!t.abc||seen.has(t.tune_id))continue;seen.add(t.tune_id);out.push(t)}SESS=out;return out})();
 try{return await SESSP}catch(e){SESSP=null;throw e}}
const ABC_MODES={major:'maj',minor:'min',dorian:'dor',mixolydian:'mix',aeolian:'min',ionian:'maj'};
const LETTER_PC={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function abcToPiece(t){
 const ms=/^([A-G])([b#]?)(\w+)$/.exec(String(t.mode||'').trim());if(!ms)return null;const md=ABC_MODES[ms[3].toLowerCase()];if(!md)return null;
 const tonicName=ms[1]+(ms[2]||''),tonic=mod(LETTER_PC[ms[1]]+(ms[2]=='#'?1:ms[2]=='b'?-1:0),12);
 const mt=/^(\d+)\/(\d+)$/.exec(String(t.meter||'4/4').trim());if(!mt)return null;const num=+mt[1],den=+mt[2];
 if(![[4,4],[2,4],[3,4],[6,8],[12,8],[9,8],[2,2],[3,2]].some(([a,b])=>a==num&&b==den))return null;
 const bar=num*4/den,unit=.5;
 // key signature: which letters carry sharps or flats, from the mode's scale (Tonal when present)
 const ksig={};{let notes=null;try{const T=window.Tonal;if(T){const sc=T.Scale.get(tonicName+' '+({maj:'major',min:'minor',dor:'dorian',mix:'mixolydian'})[md]);if(sc&&!sc.empty)notes=sc.notes}}catch(e){}
  if(!notes){const pcs=(SC[md]||SC.maj).map(x=>(tonic+x)%12);for(const L in LETTER_PC){const p=LETTER_PC[L];ksig[L]=pcs.includes(p)?0:pcs.includes((p+1)%12)?1:pcs.includes((p+11)%12)?-1:0}}
  else for(const n of notes){const L=n[0],acc=n.slice(1);ksig[L]=acc=='#'?1:acc=='##'?2:acc=='b'?-1:acc=='bb'?-2:0}}
 let s=String(t.abc).replace(/%[^\n]*/g,'').replace(/\\\n/g,' ').replace(/"[^"]*"/g,'').replace(/![^!]*!/g,'').replace(/\+[^+\s]*\+/g,'').replace(/\{[^}]*\}/g,'');
 if(/\[[KM]:/.test(s)||/^\s*[KM]:/m.test(s))return null; // key or metre changes mid-tune: leave those out
 s=s.replace(/^\s*[A-Za-z]:.*$/gm,'');
 const mel=[];let pos=0,barAcc={},skip=false,tup=0,tupN=0,broken=0,last=null,firstBar=null;
 let i=0;const N=s.length;
 const lenAt=()=>{let a=0,b=1,m=/^(\d*)(\/*)(\d*)/.exec(s.slice(i));i+=m[0].length;const n1=m[1]?+m[1]:1;let d=1;if(m[2]){const sl=m[2].length;d=m[3]?+m[3]:2**sl}return n1/d};
 while(i<N){const c=s[i];
  if(c=='|'||c==':'||(c=='['&&/[12|]/.test(s[i+1]||''))){let tok='';while(i<N&&/[|:\[\]12]/.test(s[i])){if(tok.length&&s[i]=='['&&!/[12|]/.test(s[i+1]||''))break;tok+=s[i++]}
   if(/[|\]:]/.test(tok)){if(firstBar==null&&pos>0)firstBar=pos;barAcc={}}
   if(/[\[|]1/.test(tok)&&!/2/.test(tok))skip=true;else if(/2/.test(tok))skip=false;
   continue}
  if(c=='('&&/\d/.test(s[i+1])){tup=+s[i+1];tupN=tup;i+=2;while(s[i]==':'||/\d/.test(s[i]))i++;continue}
  if(c=='>'||c=='<'){let k=0;while(s[i]==c){k++;i++}if(last){const f=c=='>'?1-.5**k:-(1-.5**k);const dd=last.d*f;last.d+=dd;pos+=dd;broken=-f}continue}
  let acc=null;if(c=='^'||c=='_'||c=='='){acc=0;while(s[i]=='^'||s[i]=='_'||s[i]=='='){acc+=s[i]=='^'?1:s[i]=='_'?-1:0;if(s[i]=='=')acc=0;i++}}
  const L=s[i];
  if(L&&/[A-Ga-gzx]/.test(L)){i++;let oct=0;while(s[i]==','||s[i]=="'"){oct+=s[i]==','?-1:1;i++}let d=lenAt()*unit;
   if(tup){d*=tup==3?2/3:tup==2?3/2:tup==4?3/4:(tup-1)/tup;tupN--;if(tupN<=0)tup=0}
   if(broken){d*=1+broken;broken=0}
   if(/[zx]/.test(L)){if(!skip)pos+=d;last=null;continue}
   const up=L.toUpperCase(),key2=up+oct+(L==up?0:1);if(acc!=null)barAcc[key2]=acc;const a=barAcc[key2]??ksig[up]??0;
   const midi=60+LETTER_PC[up]+a+12*(oct+(L==up?0:1));if(!skip){const n={o:pos,d,m:midi};mel.push(n);last=n;pos+=d}continue}
  if(c=='['){const j=s.indexOf(']',i);if(j<0)break;const inner=s.slice(i+1,j);i=j+1;const notes=[...inner.matchAll(/([\^_=]*)([A-Ga-g])([,']*)/g)];if(!notes.length)continue;
   let best=null;for(const nm of notes){const up=nm[2].toUpperCase(),oct=(nm[3].match(/'/g)||[]).length-(nm[3].match(/,/g)||[]).length+(nm[2]==up?0:1);const midi=60+LETTER_PC[up]+(ksig[up]||0)+12*oct;if(!best||midi>best)best=midi}
   let d=lenAt()*unit;if(!skip){const n={o:pos,d,m:best};mel.push(n);last=n;pos+=d}continue}
  i++}
 if(mel.length<16)return null;
 const pick=firstBar!=null&&firstBar>0&&firstBar<bar-1e-6?bar-firstBar:0;
 let m2=mel.map(n=>[+(n.o+pick).toFixed(3),+n.d.toFixed(3),n.m-tonic]);
 const end0=Math.min(Math.max(...m2.map(n=>n[0]+n[1])),32*bar+pick),end=Math.ceil(end0/bar-1e-6)*bar;m2=m2.filter(n=>n[0]<end);
 const rng2=Math.max(...m2.map(n=>n[2]))-Math.min(...m2.map(n=>n[2]));if(rng2>26)return null;
 const chords=harmonizeTune(m2,md,end,bar);if(chords.length<3)return null;
 const pl=bar>=3?4*bar:8*bar,phr=[];for(let x=pl;x<=end+1e-6;x+=pl)phr.push(+x.toFixed(3));
 return{title:String(t.name||'Untitled').trim(),composer:'Traditional · The Session ('+(t.type||'tune')+')',mode:md,meter:[num,den],bar,len:end,mel:m2,chords,phr,_i:'s'+t.tune_id}}
const HCANDS={maj:[[0,'maj',.4],[2,'m',.15],[4,'m',0],[5,'maj',.35],[7,'maj',.4],[7,'7',.22],[9,'m',.22]],min:[[0,'m',.4],[3,'maj',.25],[5,'m',.3],[7,'m',.1],[7,'maj',.3],[7,'7',.2],[8,'maj',.25],[10,'maj',.25]],
 dor:[[0,'m',.6],[2,'m',.1],[3,'maj',.2],[5,'maj',.35],[7,'m',.2],[10,'maj',.35]],mix:[[0,'maj',.6],[2,'m',.15],[5,'maj',.35],[7,'m',.2],[9,'m',.1],[10,'maj',.4]]};
function harmonizeTune(mel,md,end,bar){const step=bar<=3?bar:bar/2,n=Math.max(1,Math.ceil(end/step-1e-6)),C=HCANDS[md]||HCANDS.maj,sc=new Set(SC[md]||SC.maj);
 const em=[];for(let i=0;i<n;i++){const a=i*step,b=a+step;em.push(C.map(([rel,q,pr])=>{const cs=Q[q].map(x=>(rel+x)%12);let s=0,W=0;for(const[o,d,m]of mel){const x0=Math.max(o,a),x1=Math.min(o+d,b);if(x1<=x0)continue;const w=(x1-x0)*(Math.abs(o-a)<1e-6?1.7:Math.abs(mod(o-a,1))<1e-6?1.25:1),pc=mod(m,12);s+=w*(cs.includes(pc)?1:sc.has(pc)?-.25:-.8);W+=w}return(W?s/W:0)*2.2+pr*.5}))}
 const TR=(a,b)=>{const k=a[0]+a[1]+'>'+b[0];return{'7maj>0':.3,'77>0':.4,'5maj>0':.1,'5m>0':.1,'5maj>7':.12,'2m>7':.18,'10maj>0':.25,'9m>5':.1,'9m>2':.1,'8maj>10':.15}[k]||0};
 const V=[C.map((c,j)=>em[0][j]+(c[0]==0?.4:0))],Bk=[C.map(()=>0)];
 for(let i=1;i<n;i++){const row=[],bk=[];C.forEach((c,j)=>{let best=-1e9,bi=0;C.forEach((p,k)=>{let t=V[i-1][k]+(k==j?.18:0)+TR(p,c);if(k!=j&&step<bar&&mod(i*step,bar)>1e-6)t-=.25;if(t>best){best=t;bi=k}});row.push(best+em[i][j]+(i==n-1&&c[0]==0?1.2:0));bk.push(bi)});V.push(row);Bk.push(bk)}
 let j=0;V[n-1].forEach((v,k)=>{if(v>V[n-1][j])j=k});const path=[j];for(let i=n-1;i>0;i--){j=Bk[i][j];path.push(j)}path.reverse();
 const out=[];path.forEach((j,i)=>{const[rel,q]=C[j];const l=out[out.length-1];if(l&&l[2]==rel&&l[4]==q)l[1]=+(l[1]+step).toFixed(3);else out.push([+(i*step).toFixed(3),step,rel,rel,q])});return out}
async function pickAny(seed,avoid,faith){const R=rng((seed^0x5e55)>>>0);let nLib=LIBI?LIBI.n.length:4400,nS=SESS?SESS.length:0;
 if(nS&&R()<nS/(nS+nLib)){for(let t=0;t<40;t++){const tt=SESS[Math.floor(R()*nS)],id='s'+tt.tune_id;if(avoid&&avoid.has(id))continue;if(faith>=.75&&/^(3|9)\//.test(String(tt.meter)))continue;const p=abcToPiece(tt);if(p)return p}}
 return pickPiece(seed,avoid,faith)}
