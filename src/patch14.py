p='index.html';s=open(p).read()
def rep(a,b):
    global s;assert s.count(a)==1,(s.count(a),a[:70]);s=s.replace(a,b)
# every subgenre starts at 0 so the familiar defaults stay put
rep("const GDEF={steelpan:0,","const GDEF={__sub:0,steelpan:0,")
rep("for(const g of GEN){s.gw[g.id]=GDEF[g.id]??30;","for(const g of GEN){s.gw[g.id]=GDEF[g.id]??(PBC.G[g.id]&&PBC.G[g.id].parent?0:30);")
# search + grouping over the genre rows
js=r"""
;{const $=id=>document.getElementById(id),mix=$('genreMix');if(mix&&window.PBC&&PBC.G){
 const FAMILY=[['Pop & rock',['drivepop','campfire','indie','brooklyn','anthem','epic','synthpop']],['Electronic',['electronic','house','deephouse','techno','trance','synthwave','futurebass','dnb','downtempo']],['Soul, funk & hip-hop',['soul','funk','lofi']],['Jazz',['jazz']],['Latin & Caribbean',['bossa','reggae','steelpan']],['Folk, country & blues',['folk','americana','campfire','bluegrass','celtic','nordic']],['World',['world','mbira','marimbag','eastasian','spanish']],['Classical & solo',['chamber','baroque','church','cellosolo','classicalguitar','cinematic']],['Calm & ambient',['ambient','meditation']]];
 const famOf=id=>{const g=PBC.G[id],root=g&&g.parent?g.parent:id;for(const[name,ids]of FAMILY)if(ids.includes(root)||ids.includes(id))return name;return 'More'};
 const rows=[...mix.querySelectorAll('.grow')],info=new Map();
 for(const r of rows){const inp=r.querySelector('input');const id=inp.id.slice(3);info.set(r,{id,name:(r.querySelector('.gname')||{}).textContent||id,fam:famOf(id),sub:!!(PBC.G[id]&&PBC.G[id].parent)})}
 // search box
 const tools=document.createElement('div');tools.className='gtools';
 const q=document.createElement('input');q.type='search';q.placeholder='Search '+rows.length+' genres…';q.className='gsearch';q.setAttribute('aria-label','Search genres');
 const cnt=document.createElement('span');cnt.className='mini gcount';tools.append(q,cnt);mix.before(tools);
 // group rows into collapsible sections
 const groups=new Map();
 for(const r of rows){const f=info.get(r).fam;if(!groups.has(f))groups.set(f,[]);groups.get(f).push(r)}
 const order=FAMILY.map(x=>x[0]).concat('More'),boxes=[];
 for(const f of order){const list=groups.get(f);if(!list||!list.length)continue;
  const det=document.createElement('details');det.className='gfam';const sum=document.createElement('summary');det.append(sum);
  const body=document.createElement('div');body.className='gfambody';det.append(body);
  for(const r of list)body.append(r);
  mix.append(det);boxes.push({det,sum,f,list})}
 const refresh=()=>{const term=q.value.trim().toLowerCase();let shown=0,on=0;
  for(const{det,sum,f,list}of boxes){let vis=0,act=0;
   for(const r of list){const d=info.get(r),w=s.gw[d.id]||0;const hit=!term||d.name.toLowerCase().includes(term)||f.toLowerCase().includes(term);
    r.style.display=hit?'':'none';if(hit)vis++;if(w>0)act++}
   det.style.display=vis?'':'none';shown+=vis;on+=act;
   sum.innerHTML=`<b>${f}</b><span class="mini">${act?act+' on · ':''}${vis} genre${vis==1?'':'s'}</span>`;
   if(term&&vis)det.open=true;else if(!term)det.open=act>0}
  cnt.textContent=on?on+' genre'+(on==1?'':'s')+' in the mix':'nothing selected yet';};
 q.oninput=refresh;mix.addEventListener('input',()=>setTimeout(refresh,0));refresh();
 // Even / Clear should only touch what is visible, so they stay useful with 200 genres
 const ev=$('gEven'),cl=$('gClear');
 if(ev)ev.onclick=()=>{for(const r of rows){if(r.style.display=='none')continue;const d=info.get(r);if(d.sub)continue;s.gw[d.id]=50;$('gw_'+d.id).value=50}updGenre();refresh()};
 if(cl)cl.onclick=()=>{for(const r of rows){const d=info.get(r);s.gw[d.id]=0;$('gw_'+d.id).value=0}updGenre();refresh()};
}}
"""
css=r"""<style>
.gtools{display:flex;align-items:center;gap:10px;margin:0 0 8px;flex-wrap:wrap}
.gsearch{flex:1;min-width:150px;font:inherit;font-size:13px;padding:6px 10px;border:1px solid #d6dee8;border-radius:999px;background:#fff;color:inherit}
.gcount{white-space:nowrap}
details.gfam{border-top:1px solid #e6ecf2}
details.gfam>summary{cursor:pointer;list-style:none;display:flex;align-items:baseline;gap:8px;padding:8px 2px;flex-wrap:wrap}
details.gfam>summary::-webkit-details-marker{display:none}
details.gfam>summary::before{content:'▸';color:#1768d2;font-size:11px}
details.gfam[open]>summary::before{content:'▾'}
.gfambody{padding:2px 0 8px}
@media (prefers-color-scheme:dark){.gsearch{background:#ffffff0d;border-color:#ffffff22}details.gfam{border-color:#ffffff1a}}
</style>"""
_mi=s.index('function paintRamp(');_end=s.rindex('})()',_mi,s.index('</script>',_mi))
s=s[:_end]+js+s[_end:]+css
open(p,'w').write(s)
