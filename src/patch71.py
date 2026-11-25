import io,sys,os
p=os.path.join(os.path.dirname(__file__),'..','index.html')
s=io.open(p,encoding='utf-8').read()
def need(a,l,n=1):
    if s.count(a)!=n: print('ANCHOR %s x%d (want %d)'%(l,s.count(a),n));sys.exit(1)

# A decoded recording is held whole: a 98-second stereo track is 35 MB of
# native audio memory, and two of them sit in the cache. A bed only ever plays
# from 8s to 8s+L, so everything past that was held for nothing. Native audio
# memory does not show up in the JS heap, which is why the page could die with
# the heap reading 132 MB of 4192 and no exception anywhere.
a=("    if(fl){b=await DC.decodeAudioData(await fl.arrayBuffer());MINEBUF.set(o.piece.audio,b);\n"
   "     while(MINEBUF.size>2)MINEBUF.delete(MINEBUF.keys().next().value)}}")
need(a,'decode')
s=s.replace(a,
"    if(fl){const full=await DC.decodeAudioData(await fl.arrayBuffer());\n"
"     const sr=full.sampleRate,keep=Math.min(full.length,Math.ceil((L+9)*sr));\n"
"     if(keep<full.length-sr){                       // worth the copy\n"
"      b=DC.createBuffer(full.numberOfChannels,keep,sr);\n"
"      for(let ch=0;ch<full.numberOfChannels;ch++)\n"
"       b.copyToChannel(full.getChannelData(ch).subarray(0,keep),ch);\n"
"      console.log('[PromoMixer] kept '+(keep/sr).toFixed(0)+'s of '+full.duration.toFixed(0)+\n"
"       's of '+o.piece.title+' ('+Math.round(keep*full.numberOfChannels*4/1048576)+'MB instead of '+\n"
"       Math.round(full.length*full.numberOfChannels*4/1048576)+'MB)');\n"
"     } else b=full;\n"
"     MINEBUF.set(o.piece.audio,b);\n"
"     while(MINEBUF.size>2)MINEBUF.delete(MINEBUF.keys().next().value)}}")

# one trimmed recording is enough to hold; clearing the cache mid-queue would
# only force the next bed to decode the same file again
a2="     while(MINEBUF.size>2)MINEBUF.delete(MINEBUF.keys().next().value)}}"
need(a2,'cap')
s=s.replace(a2,"     while(MINEBUF.size>1)MINEBUF.delete(MINEBUF.keys().next().value)}}")
io.open(p,'w',encoding='utf-8').write(s);print('patch71 ok')
