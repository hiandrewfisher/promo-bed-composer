import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()

# ---------- chips rebuilt from 155 rated beds: the nine tags never used are gone,
# ---------- and the five tags doing all the work are split into what they meant.
i=s.find("whyBox.append(")
j=s.find("));",i)
if i<0 or j<0: print('no whyBox.append');sys.exit(1)
NEW = """whyBox.append(
  mk('The mosquito',[['whiny','WHINY','A shrill mid/high instrument drilling through everything'],
             ['lamb','STRAINED LEAD','The lead sounds pinched or wrong in its register'],
             ['harsh','HARSH TOP','The whole top end is piercing, fatiguing'],
             ['sour','SOUR NOTES','Pitches genuinely fight — wrong notes, not just bright']]),
  mk('Band',[['wrongins','WRONG INSTRUMENT','One instrument does not belong in this band or style'],
             ['muddy','MUDDY','Parts pile up and smear the low-mid']]),
  mk('Tune',[['nohook','NO HOOK','Nothing in it I would remember'],
             ['wander','WANDERS','The line rambles, never settles into a shape'],
             ['noarc','GOES NOWHERE','No build and no arrival — it just loops'],
             ['repetitive','REPETITIVE','The same idea over and over'],
             ['chordsOdd','ODD CHORDS','Chord moves are strange or unresolved']]),
  mk('Under the read',[['maskvoice','MASKS THE VOICE','Sits right in the voice frequency range'],
             ['toodense','TOO DENSE UNDER READ','Too much happening while I am talking'],
             ['pumping','PUMPING','I can hear it ducking out of the way']]),
  mk('Density',[['busy','TOO BUSY','Too many parts going at once'],
             ['noodly','NOODLY','One part plays far too many notes']]),
  mk('Ending',[['endearly','ENDS EARLY','Music stops before the read does'],
             ['endabrupt','ABRUPT END','Cuts off instead of resolving'],
             ['endlong','TRAILS ON','Keeps going after it should have landed']]),
  mk('Balance',[['tooloud','ONE PART TOO LOUD','Something is sticking out'],
             ['buried','SOMETHING BURIED','A part I should hear is lost'],
             ['drumsloud','DRUMS TOO LOUD','The kit is on top of the music']]),
  mk('Not human enough',[['noVib','NO VIBRATO','Long notes sit dead still, no wobble at all'],
             ['seasick','TOO MUCH WOBBLE','Vibrato or tremolo overdone, it sounds woozy'],
             ['stiff','STIFF TIMING','Everything lands exactly on the grid'],
             ['flat','NO DYNAMICS','Every note the same volume, no swell or taper'],
             ['noSlide','NO SLIDES','Notes start dead on pitch, nobody lips or fingers in'],
             ['noRuns','NO FLOURISHES','No grace notes or runs into the important notes'],
             ['tooClean','TOO CLEAN','No breath, no keys, no fingers — nothing physical'],
             ['locked','CHORDS LOCKED','Chord notes hit at exactly the same instant'],
             ['rooms','DIFFERENT ROOMS','The parts do not sound recorded in one place']]),
  mk('Good',[['gFeel','RIGHT FEEL','Groove and tempo are right'],
             ['gBand','RIGHT BAND','These instruments belong together'],
             ['gSits','SITS UNDER','Leaves room for the voice']]));"""
s=s.replace(s[i:j+3],NEW)

a="const WHY_POLARITY={gHook:'good',gBand:'good',gSits:'good',gFeel:'good'};"
if s.count(a)!=1: print('polarity x%d'%s.count(a));sys.exit(1)
s=s.replace(a,"const WHY_POLARITY={gFeel:'good',gBand:'good',gSits:'good'};")


i2=s.find("reasonKey:{")
j2=s.find("}",i2)
if i2<0: print('no reasonKey');sys.exit(1)
s=s[:i2]+("reasonKey:{whiny:'a shrill mid/high instrument drilling through',"
 "lamb:'the lead sounds pinched or wrong in its register',harsh:'the whole top end is piercing',"
 "sour:'pitches genuinely fight - wrong notes',wrongins:'one instrument does not belong in this band or style',"
 "muddy:'parts smear the low-mid',nohook:'nothing memorable in it',wander:'the line rambles, no shape',"
 "noarc:'no build and no arrival, it just loops',repetitive:'the same idea over and over',"
 "chordsOdd:'chord moves strange or unresolved',maskvoice:'sits in the voice frequency range',"
 "toodense:'too much happening under the read',pumping:'the ducking is audible',"
 "busy:'too many parts at once',noodly:'one part plays far too many notes',"
 "endearly:'music stops before the read does',endabrupt:'cuts off instead of resolving',"
 "endlong:'keeps going after it should have landed',tooloud:'something sticks out',"
 "buried:'a part I should hear is lost',drumsloud:'the kit is on top of the music',"
 "noVib:'long notes sit dead still',seasick:'vibrato or tremolo overdone',stiff:'everything lands exactly on the grid',flat:'every note the same volume',noSlide:'notes start dead on pitch, no lip or finger in',noRuns:'no grace notes or runs into important notes',tooClean:'no breath, keys or finger noise',locked:'chord notes hit at the same instant',rooms:'the parts do not sound recorded in one place',gFeel:'GOOD: groove and tempo right',gBand:'GOOD: the instruments belong together',"
 "gSits:'GOOD: leaves room for the voice'")+s[j2:]
io.open(p,'w',encoding='utf-8').write(s);print('chips rebuilt ok')
