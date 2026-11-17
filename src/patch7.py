p='/home/claude/site/index.html';h=open(p,encoding='utf-8').read()
def rep(a,b):
    global h
    assert h.count(a)==1,(h.count(a),a[:80]);h=h.replace(a,b)
rep("122 real recorded instruments and articulations (strings, keys, guitars, basses, mallets, harps; no winds), 6 kits · 19 genres","190 real recorded instruments incl. 68 hardware synths (Juno-6, Jupiter-4, JD-800, JX-3P, SH-2, Xpander, Chroma Polaris, Analog Four…), 14 kits incl. TR-909, TR-707, DMX, SP-12, Linn 9000, CR-78, TR-606 · 27 genres")
rep("Real recordings: Salamander Grand (A. Holm","Synths: Public Samples hardware multisamples (public-domain dedication). Drum machines: Synth Abuse collection via smpldsnds Drum Abuse packs. FX: Sonic Pi samples (CC0) and Public Samples Drones. Real recordings: Salamander Grand (A. Holm")
rep("GDEF={electronic:40,","GDEF={steelpan:0,mbira:0,marimbag:0,eastasian:0,nordic:0,celtic:0,baroque:0,church:0,bluegrass:0,reggae:0,meditation:0,classicalguitar:0,spanish:0,cellosolo:0,house:0,deephouse:0,techno:0,trance:0,synthwave:0,futurebass:0,dnb:0,downtempo:0,electronic:40,")
open(p,'w',encoding='utf-8').write(h);print('patch7 ok')
