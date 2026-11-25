// Optional bounded secondary transcription, entirely in an isolated worker.
self.onmessage=async({data:{pcm}})=>{
 try{
  const {BasicPitch,outputToNotesPoly,noteFramesToTime}=await import('https://esm.sh/@spotify/basic-pitch@1.0.1');
  const bp=new BasicPitch('https://cdn.jsdelivr.net/npm/@spotify/basic-pitch@1.0.1/model/model.json');
  const frames=[],onsets=[];
  await bp.evaluateModel(new Float32Array(pcm),(f,o)=>{frames.push(...f);onsets.push(...o)},p=>self.postMessage({progress:p}));
  const notes=noteFramesToTime(outputToNotesPoly(frames,onsets,.35,.35,7)).map(n=>[n.startTimeSeconds,n.durationSeconds,n.pitchMidi,n.amplitude]);
  self.postMessage({notes});
 }catch(e){self.postMessage({error:String(e.message||e)})}
};
