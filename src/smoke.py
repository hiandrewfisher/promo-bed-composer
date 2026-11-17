#!/usr/bin/env python3
"""Build gate: load the page, generate a bed, assert the UI is intact.
Exits non-zero if the generator is broken — so a publish cannot ship a dead build."""
import asyncio,sys,subprocess,time,os
from playwright.async_api import async_playwright
VOICE='/tmp/claude-0/-home-claude/0e82ccdc-c18d-5c24-982a-f6e76f5d9c9b/scratchpad/rad/voice.wav'
async def main():
  fails=[]
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    ctx=await b.new_context(viewport={'width':1340,'height':1000})
    pg=await ctx.new_page()
    await pg.route('**fonts.g**',lambda r: asyncio.ensure_future(r.abort()))
    errs=[]
    pg.on('pageerror',lambda e:errs.append('pageerror: '+str(e)[:200]))
    pg.on('console',lambda m:errs.append('console: '+m.text[:200])
          if m.type=='error' and 'ERR_FAILED' not in m.text else None)
    await pg.goto('http://localhost:8765/index.html',wait_until='commit')
    await pg.wait_for_timeout(2500)
    # structural checks that a syntax check cannot catch
    for sel,label in [('#compose','generate button'),('#export','export button'),
                      ('#ratings','ratings button'),('#voice','voice input')]:
        if not await pg.query_selector(sel): fails.append('missing '+label)
    await pg.set_input_files('#voice',VOICE); await pg.wait_for_timeout(3000)
    await pg.click('[data-duration="20"]',timeout=5000)   # the freeze regression
    await pg.wait_for_timeout(500)
    if await pg.evaluate('1+1')!=2: fails.append('page froze on duration change')
    await pg.click('#compose',timeout=5000)
    rows=0
    for _ in range(80):
        await pg.wait_for_timeout(2000)
        rows=await pg.evaluate("()=>document.querySelectorAll('.track').length")
        if rows: break
    if not rows:
        st=''
        try: st=(await pg.inner_text('#status'))[:120]
        except Exception: pass
        fails.append('no bed generated. status: '+st)
    else:
        row=pg.locator('.track').first
        for sel,label in [('.star','star widget'),('.remixBtn','remix button'),
                          ('.trackname','track name'),('.whyBtn','why button')]:
            if await row.locator(sel).count()==0: fails.append('row missing '+label)
        try:
            await row.locator('.star').nth(2).click(timeout=6000)
            await pg.wait_for_timeout(400)
            if await row.locator('.whyChip').count()<20: fails.append('reason chips did not open')
        except Exception as e: fails.append('cannot rate: '+str(e)[:80])
    bad=[e for e in errs if 'ERR_FAILED' not in e]
    if bad: fails.append('console errors: '+'; '.join(bad[:3]))
    await b.close()
  if fails:
    print('SMOKE FAIL'); [print('  -',f) for f in fails]; sys.exit(1)
  print('SMOKE OK (bed generated, controls present, chips open, no errors)')
asyncio.run(main())
