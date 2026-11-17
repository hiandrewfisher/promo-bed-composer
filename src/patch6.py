# load The Session's tunes in the background when the app opens, and show the library size
p='/home/claude/site/index.html';h=open(p,encoding='utf-8').read()
def rep(a,b):
    global h
    assert h.count(a)==1,(h.count(a),a[:100]);h=h.replace(a,b)
rep("s.src=60;","""s.src=60;{const sub=$('musicSub'),base=sub?sub.textContent:'',show=t=>{if(t&&sub)sub.textContent=base.replace(/public-domain pieces/,'public-domain pieces + '+t.length.toLocaleString()+' tunes from The Session')},
 wrap=document.createElement('span'),btn=document.createElement('button'),inp=document.createElement('input');btn.className='pill';btn.textContent='Add The Session tunes';btn.title='This page cannot download from GitHub itself. Download tunes.json from github.com/adactio/TheSession-data (json folder), then pick it here. The app converts the tunes and remembers them.';btn.style.cssText='margin-left:8px;padding:2px 10px;font-size:12px;display:none';inp.type='file';inp.accept='.json,application/json';inp.style.display='none';
 btn.onclick=()=>inp.click();inp.onchange=async()=>{const f=inp.files[0];if(!f)return;setStatus('Reading The Session tunes');try{const t=await PBC.loadSessionFile(f);show(t);btn.style.display='none';setStatus(t.length.toLocaleString()+' tunes from The Session added to the library')}catch(e){setStatus('Could not read that file: '+e.message)}};
 wrap.append(btn,inp);sub&&sub.after(wrap);setTimeout(()=>PBC.preloadSession().then(t=>{if(t)show(t);else btn.style.display='inline-block'}),1500);setTimeout(()=>{if(!PBC.session())btn.style.display='inline-block'},9000)}""")
open(p,'w',encoding='utf-8').write(h)
open('/home/claude/promo-bed-composer-standalone.html','w',encoding='utf-8').write('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+h+'</html>')
print('patch6 ok')
