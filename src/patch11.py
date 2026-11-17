p='index.html';s=open(p).read()
def rep(a,b):
    global s;assert s.count(a)==1,(s.count(a),a[:70]);s=s.replace(a,b)
# remix dropdown
rep("const rr=document.createElement('button');rr.className='icon';rr.textContent='⟳';rr.title='Compose another take with the same genre mix: a new piece from the library, added at the bottom';rr.onclick=()=>{const nb=newBed(t.style,(t.seed^Math.imul((t.takes=(t.takes||0)+1),0x85EBCA6B))>>>0,'library',t.blend);nb.faith=t.faith??s.src/100;queueBed(nb);setStatus('Another take of '+t.name+' will be added at the bottom')};",
"""const rr=document.createElement('select');rr.className='remix';rr.title='Make another version of this bed, added at the bottom';rr.innerHTML='<option value="">⟳ Remix…</option><option value="tune">New tune, same instruments</option><option value="both">New tune, new instruments</option><option value="ins">Same tune, new instruments</option>';
rr.onchange=()=>{const how=rr.value;rr.value='';if(!how)return;const nb=newBed(t.style,(t.seed^Math.imul((t.takes=(t.takes||0)+1),0x85EBCA6B))>>>0,'library',t.blend);nb.faith=t.faith??s.src/100;const ids={};for(const[k,v]of Object.entries(t.chan||{}))if(v&&v.id)ids[k]=v.id;
 if(how=='tune'){nb.keepIns=ids;nb.song=t.song?{...t.song}:null}
 if(how=='ins'){nb.piece=t.piece;const av={...recentIns()};for(const x of Object.values(ids))av[x]=(av[x]||0)+4;nb.avoidIns=av}
 queueBed(nb);setStatus(({tune:'A new tune with the same instruments',both:'A new tune with new instruments',ins:'The same tune with new instruments'})[how]+' — from '+t.name+', added at the bottom')};""")
rep("avoidIns:t.avoidIns||(t.avoidIns=recentIns()),","avoidIns:t.avoidIns||(t.avoidIns=recentIns()),keepIns:t.keepIns||null,")
# cancel queue
rep('<button id="compose" class="primary">Generate 8 beds</button>','<button id="compose" class="primary">Generate 8 beds</button><button id="cancelQ" class="pill" title="Stop composing the beds still waiting in line (the one being made right now finishes)">Cancel queue</button>')
rep("$('compose').onclick=()=>composeNew(8);","$('compose').onclick=()=>composeNew(8);$('cancelQ').onclick=()=>{const n=s.queue.length;s.queue.length=0;s.total=s.done+(s.working?1:0);progress(n?`Cancelled ${n} waiting bed${n>1?'s':''}`:'Nothing waiting');setStatus(n?`Cancelled ${n} waiting bed${n>1?'s':''}`:'Nothing in the queue')};")
s=s.replace('</style>','select.remix{font:inherit;font-size:12px;padding:3px 6px;border-radius:999px;border:1px solid var(--line,#8884);background:transparent;color:inherit;cursor:pointer;max-width:12em}\n</style>',1)
open(p,'w').write(s)
