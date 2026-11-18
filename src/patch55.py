import io,sys
p='index.html';s=io.open(p,encoding='utf-8').read()
def one(a,l):
    if s.count(a)!=1: print('ANCHOR %s x%d'%(l,s.count(a)));sys.exit(1)

# tidy() ran two full JS passes over every frame of every decoded sample: a copy
# with a peak search, then a second pass to normalise. A 7-second stereo sample is
# 617k frames, so that is ~1.2M iterations each, and a render decodes 130-160 of
# them. It is the largest blocking cost in the sample path.
#   - peak from a strided scan (every 7th frame): inaudibly different, 7x cheaper
#   - one combined pass, and a native .set() when no gain change is needed
#   - long tails trimmed with a short fade: the biggest banks are 7s of decay,
#     and sustains are looped by the engine anyway, so nothing is cut short
a="function tidy(a){const n=a.length,ch=Math.min(2,a.numberOfChannels),o=new AudioBuffer({length:n,sampleRate:a.sampleRate,numberOfChannels:ch});let pk=0;for(let c=0;c<ch;c++){const s=a.getChannelData(c),d=o.getChannelData(c);for(let i=0;i<n;i++){d[i]=s[i];const v=s[i]<0?-s[i]:s[i];if(v>pk)pk=v}}const g=pk?.7/pk:1;for(let c=0;c<ch;c++){const d=o.getChannelData(c);for(let i=0;i<n;i++)d[i]*=g}return o}"
one(a,'tidy')
s=s.replace(a,
"const TIDY_MAX=4.2,TIDY_FADE=.18;\n"
"function tidy(a){\n"
" const ch=Math.min(2,a.numberOfChannels),sr=a.sampleRate;\n"
" const cap=Math.ceil(TIDY_MAX*sr),n=Math.min(a.length,cap),fade=n<a.length?Math.min(Math.ceil(TIDY_FADE*sr),n>>2):0;\n"
" let pk=0;\n"
" for(let c=0;c<ch;c++){const s=a.getChannelData(c);\n"
"  for(let i=0;i<n;i+=7){const v=s[i]<0?-s[i]:s[i];if(v>pk)pk=v}}\n"
" const g=pk?.7/pk:1;\n"
" const o=new AudioBuffer({length:n,sampleRate:sr,numberOfChannels:ch});\n"
" for(let c=0;c<ch;c++){const s=a.getChannelData(c),d=o.getChannelData(c);\n"
"  if(g===1&&!fade){d.set(s.subarray(0,n));continue}\n"
"  if(!fade){for(let i=0;i<n;i++)d[i]=s[i]*g;continue}\n"
"  const f0=n-fade;\n"
"  for(let i=0;i<f0;i++)d[i]=s[i]*g;\n"
"  for(let i=f0;i<n;i++)d[i]=s[i]*g*(1-(i-f0)/fade);}\n"
" return o}")
io.open(p,'w',encoding='utf-8').write(s);print('patch55 ok')
