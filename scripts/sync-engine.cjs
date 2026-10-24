const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..'),file=path.join(root,'index.html');let h=fs.readFileSync(file,'utf8');
function replace(a,b,code){const start=h.indexOf(a),end=h.indexOf(b,start);if(start<0||end<0)throw Error('Missing engine boundary: '+a);h=h.slice(0,start)+code+'\n'+h.slice(end)}
replace('// Heuristic passage discovery.','// Tonal supplies',fs.readFileSync(path.join(__dirname,'discovery.js'),'utf8'));
replace('// Preserve the discovered melody','const pickPiece=selectDistinctScore;',fs.readFileSync(path.join(__dirname,'hook-arranger.js'),'utf8')+'\n'+fs.readFileSync(path.join(__dirname,'faithful-score.js'),'utf8'));
fs.writeFileSync(file,h);console.log('Updated inline discovery, arranger and faithful-score modules');
