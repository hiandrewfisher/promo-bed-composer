const {chromium}=require('playwright'),assert=require('node:assert/strict');
function wav(seconds,voice=false){const sr=22050,n=sr*seconds,b=Buffer.alloc(44+n*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(sr,24);b.writeUInt32LE(sr*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);
for(let i=0;i<n;i++){const t=i/sr,p=[65,69,72,67,65,70,74,69][Math.floor(t*2)%8],f=voice?120+15*Math.sin(t*3):440*2**((p-69)/12),e=voice?(t%.6<.4?.6:0):.7,v=e*(Math.sin(2*Math.PI*f*t)*.25+Math.sin(2*Math.PI*f*2*t)*.07);b.writeInt16LE(Math.round(v*32767),44+i*2)}return b}
(async()=>{const browser=await chromium.launch();try{const page=await browser.newPage(),errors=[],logs=[];page.on('pageerror',e=>errors.push(e.message));page.on('crash',()=>errors.push('Renderer crashed'));page.on('console',m=>{if(m.text().includes('[PromoMixer]'))logs.push(m.text())});
 await page.goto('http://localhost:8765/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>/^v\d+$/.test(window.PBC_VERSION)&&!!document.getElementById('mineFiles'));
 assert.equal(await page.locator('#mineMode').inputValue(),'midi');assert.equal(await page.locator('#mineCount').textContent(),'(0)');
 await page.evaluate(()=>window.PBC_SECONDARY=false);
 await page.locator('#voice').setInputFiles({name:'voice-fixture.wav',mimeType:'audio/wav',buffer:wav(15,true)});
 await page.waitForFunction(()=>document.getElementById('status').textContent.includes('press Generate'),{},{timeout:60000});
 // Direct folder mode must not invoke the generator or decode the whole library.
 await page.locator('#mineMode').selectOption('mix');
 await page.evaluate(()=>{window.PBC.render=()=>{throw Error('Generator invoked in direct mode')};window.PBCPrepareLibrary=()=>{throw Error('Transcription invoked in direct mode')}});
 await page.evaluate(({audio})=>{const bytes=Uint8Array.from(audio);const dt=new DataTransfer();for(let i=0;i<3;i++)dt.items.add(new File([bytes],'track-'+i+'.wav',{type:'audio/wav'}));const f=document.getElementById('mixFiles');f.files=dt.files;f.dispatchEvent(new Event('change'))},{audio:[...wav(2)]});
 await page.locator('#compose').click();await page.waitForFunction(()=>document.getElementById('summary').textContent==='3 beds');
 assert.equal(await page.locator('.whyBox:visible').count(),0);assert.equal(await page.locator('.remixBtn').count(),0);
 await page.locator('.track').first().locator('.star').nth(1).click();assert.equal(await page.locator('.whyBox:visible').count(),1);
 await page.locator('.track').first().locator('.star').nth(1).click();assert.equal(await page.locator('.whyBox:visible').count(),0);
 await page.locator('#clearSelection').click();assert.equal(await page.locator('#selection').isVisible(),false);
 await page.locator('#voicePreview').click();await page.waitForFunction(()=>document.getElementById('voicePreview').textContent==='■');
 await page.locator('#voicePreview').click();
 await page.locator('#skipMode').click();const rect=await page.locator('#voiceWave').boundingBox();await page.mouse.move(rect.x+rect.width*.2,rect.y+rect.height*.6);await page.mouse.down();await page.mouse.move(rect.x+rect.width*.4,rect.y+rect.height*.6,{steps:5});await page.mouse.up();assert.equal(await page.locator('.skipRegion').count(),1);
 await page.locator('.skipDelete').click();assert.equal(await page.locator('.skipRegion').count(),0);
 assert.equal(await page.locator('.ck').count(),0);assert.deepEqual(errors,[]);
 console.log('Browser: direct folder mode, rating gating, voice audition, editable skips and flat controls');
 await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!document.getElementById('mineFiles'));
 await page.evaluate(()=>window.PBC_SECONDARY=false);
 await page.locator('#voice').setInputFiles({name:'voice-fixture.wav',mimeType:'audio/wav',buffer:wav(15,true)});
 await page.waitForFunction(()=>document.getElementById('status').textContent.includes('press Generate'),{},{timeout:60000});
 await page.locator('#mineMode').selectOption('audio');assert(await page.locator('.sourceUpload').isVisible());
 await page.locator('#mineFiles').setInputFiles({name:'music-fixture.wav',mimeType:'audio/wav',buffer:wav(16)});
 assert.equal(await page.locator('#mineMode').inputValue(),'audio');assert.equal(await page.locator('#mineCount').textContent(),'(0)');
 await page.locator('#compose').click();
 await page.waitForFunction(()=>document.getElementById('summary').textContent==='8 beds'&&!window.PBCSourceBusy(),{},{timeout:600000});
 assert.equal(await page.locator('#mineCount').textContent(),'(1)');assert.equal(logs.filter(x=>x.includes('rendered audio quality')).length,8);
 assert.deepEqual(errors,[]);console.log('Browser: eight rendered beds from one uploaded recording');
 for(const width of [320,360,390,430,760,1280]){await page.setViewportSize({width,height:width===1280?800:844});await page.waitForTimeout(80);const layout=await page.evaluate(()=>{const doc=document.documentElement;const panel=document.querySelector('.audios>.panel');const header=document.querySelector('.rowhead');return{width:innerWidth,scroll:doc.scrollWidth,panel:panel.getBoundingClientRect().width,header:header?.getBoundingClientRect().width,footer:getComputedStyle(document.querySelector('.footer')).position,nav:getComputedStyle(document.querySelector('.mobileJump')).display,listOverflow:getComputedStyle(document.querySelector('#list')).overflowY,overflow:[...document.querySelectorAll('.panel,.rowhead,.generateActions,.fxFields,.genreBox,.footer')].filter(e=>e.getBoundingClientRect().width>0&&e.scrollWidth>e.clientWidth+3).map(e=>e.className)}});assert(layout.scroll<=width+1,JSON.stringify(layout));assert.deepEqual(layout.overflow,[],JSON.stringify(layout));assert.equal(layout.footer,width<=760?'fixed':'sticky');assert.equal(layout.nav,width<=760?'grid':'none');if(width<=760)assert.equal(layout.listOverflow,'visible');console.log('Layout '+width+'px: '+JSON.stringify(layout));}
 await page.setViewportSize({width:390,height:844});await page.locator('.mobileJump a[href="#bedsPanel"]').click();assert.equal(await page.evaluate(()=>location.hash),'#bedsPanel');await page.locator('.track').first().locator('.star').nth(3).click();assert.equal(await page.locator('.whyBox:visible').count(),1);assert.deepEqual(errors,[]);console.log('Mobile section navigation and rating interaction passed');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
