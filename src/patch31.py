p='index.html'; s=open(p,encoding='utf-8').read()
def rep(old,new):
    global s
    assert s.count(old)==1,('ANCHOR x%d: '%s.count(old))+old[:90]
    s=s.replace(old,new)

# ── per-note gain variance ───────────────────────────────────────────────
# Existing detune variance was H.g()*0.5 cents - far too small to break the
# machine-gun effect. Real players vary 1-3 dB note to note.
rep("gn=Math.pow(v,1.6)*(r.fx?.9:1)*(n.gm||1)",
    "gn=Math.pow(v,1.6)*(r.fx?.9:1)*(n.gm||1)*(0.87+0.26*(((Math.sin((n.B+2.3)*9.71+(n.m||0)*4.17)*43758.5453)%1+1)%1))")

# arrangement-arc attempt removed: measured 5.4->5.4, 3.7->4.0, 5.5->5.6 dB.
# Removing parts did not lower output level (the mix compressor/limiter holds it
# up), so it only thinned beds with no dynamic payoff. Needs to be done at the
# mix stage, not by deleting notes.

open(p,'w',encoding='utf-8').write(s)
print('ok 31')
