const {chromium}=require('playwright'),assert=require('node:assert/strict');
function wav(seconds,voice=false){const sr=22050,n=sr*seconds,b=Buffer.alloc(44+n*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(sr,24);b.writeUInt32LE(sr*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);
for(let i=0;i<n;i++){const t=i/sr,p=[65,69,72,67,65,70,74,69][Math.floor(t*2)%8],f=voice?120+15*Math.sin(t*3):440*2**((p-69)/12),e=voice?(t%.6<.4?.6:0):.7,v=e*(Math.sin(2*Math.PI*f*t)*.25+Math.sin(2*Math.PI*f*2*t)*.07);b.writeInt16LE(Math.round(v*32767),44+i*2)}return b}
(async()=>{const browser=await chromium.launch();try{const page=await browser.newPage(),errors=[],logs=[];page.on('pageerror',e=>errors.push(e.message));page.on('crash',()=>errors.push('Renderer crashed'));page.on('console',m=>{if(m.text().includes('[PromoMixer]'))logs.push(m.text())});
 await page.goto('http://localhost:8765/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>/^v\d+$/.test(window.PBC_VERSION)&&!!document.getElementById('mineFiles'));
 assert.equal(await page.locator('#mineMode').inputValue(),'midi');assert.equal(await page.locator('#mineCount').textContent(),'(0)');
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
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
