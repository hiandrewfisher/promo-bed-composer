// Bounded secondary transcription. Use the same pinned TFJS instance as Basic Pitch.
self.onunhandledrejection=e=>{e.preventDefault();self.postMessage({error:String(e.reason?.message||e.reason)});self.close()};
self.onmessage=async({data:{pcm}})=>{
 try{
  const tf=await import('https://esm.sh/@tensorflow/tfjs@3.21.0');
  const {BasicPitch,outputToNotesPoly,noteFramesToTime}=await import('https://esm.sh/@spotify/basic-pitch@1.0.1?deps=@tensorflow/tfjs@3.21.0');
  if(!await tf.setBackend('cpu'))throw Error('CPU backend unavailable');
  await tf.ready();
  if(tf.getBackend()!=='cpu')throw Error('Worker requires CPU backend');
  self.postMessage({backend:tf.getBackend()});
  const model=await tf.loadGraphModel('https://cdn.jsdelivr.net/npm/@spotify/basic-pitch@1.0.1/model/model.json');
  try{
   const bp=new BasicPitch(model),frames=[],onsets=[];
   await bp.evaluateModel(new Float32Array(pcm),(f,o)=>{frames.push(...f);onsets.push(...o)},p=>self.postMessage({progress:p}));
   const notes=noteFramesToTime(outputToNotesPoly(frames,onsets,.35,.35,7)).map(n=>[n.startTimeSeconds,n.durationSeconds,n.pitchMidi,n.amplitude]);
   self.postMessage({notes});
  }finally{model.dispose()}
 }catch(e){self.postMessage({error:String(e.message||e)})}
};
