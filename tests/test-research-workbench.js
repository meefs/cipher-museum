'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {JSDOM}=require('jsdom');
const R=require('../js/research-model');require('../js/detective/lang-model');
const root=path.join(__dirname,'..');

async function main() {
// Legacy migration retains literal characters, line breaks and Unicode positions.
const legacy={version:1,kind:'cipher-museum-transcription',raw:'😀 ?4\n56',mode:'symbols',width:1,annotations:{0:'uncertain',1:'missing'}};
let d=R.migrate(legacy);assert.equal(d.raw,legacy.raw);assert.equal(d.spans[0].literal,'😀');assert.equal(d.spans[1].start,2);
assert.deepEqual(R.migrate(JSON.parse(JSON.stringify(d))),d);
assert.throws(()=>R.migrate({...legacy,annotations:{99:'missing'}}),/annotation/);
assert.throws(()=>R.migrate({...legacy,version:3}),/Unsupported/);
assert.throws(()=>R.create('x'.repeat(10001)),/too long/);
const initial=JSON.stringify(d);d=R.revise(d,'😀 g7\n56','Dot distinguished from damage');
assert.equal(d.revisions[0].raw,legacy.raw);assert.equal(d.spans[1].revision,1);assert.equal(d.spans[1].literal,'?');
assert.equal(JSON.parse(initial).revision,1);assert.throws(()=>R.revise(d,'new',''),/why/);
assert.throws(()=>R.validate({...d,raw:'silently replaced'}),/match/);
assert.throws(()=>R.validate({...d,revision:1,raw:legacy.raw}),/latest/);
let empty=R.create('g1 g2');empty.source.imageName='folio.png';
const span={start:0,end:2,type:'ciphertext',uncertain:true,alternatives:['g1','g1-dot'],reading:'',reason:'Dot may be damage',region:[.1,.2,.2,.2]};
empty=R.annotate(empty,span);assert.equal(empty.spans[0].imageName,'folio.png');
assert.throws(()=>R.annotate(empty,{...span,uncertain:false}),/Resolving/);
assert.throws(()=>R.annotate(empty,{...span,region:[.9,0,.2,.1]}),/inside/);
assert.throws(()=>R.annotate(empty,{...span,reading:'invented'}),/alternatives/);
assert.throws(()=>R.annotate(empty,{...span,end:99}),/span end/);
const resolved=R.annotate(empty,{...span,uncertain:false,reading:'g1-dot',reason:'Compared repeated occurrences'});
assert.equal(resolved.spans.length,2);assert.equal(resolved.spans[0].uncertain,true);
let layers=R.addLayer(resolved,'diplomatic','revision-1','ancienne','Applied manuscript key');
layers=R.addLayer(layers,'normalized','layer-1','ancienne','Retained spelling after review');
layers=R.addLayer(layers,'translation','layer-2','old','Modern English translation');
assert.equal(layers.layers[2].parent,'layer-2');assert.equal(layers.raw,'g1 g2');
assert.throws(()=>R.validate({...layers,layers:[{...layers.layers[0],id:'revision-1'}]}),/reserved/,'Reading IDs cannot shadow source revisions');
assert.throws(()=>R.addLayer(layers,'translation','missing','old','note'),/earlier/);
assert.throws(()=>R.addLayer(R.revise(layers,'g3','New reading'),'translation','layer-1','old','note'),/different/);
assert.throws(()=>R.validate({...layers,source:{...layers.source,url:'javascript:alert(1)'}}),/http/);
assert.throws(()=>R.url('https://user:secret@example.com'),/credentials/);
const typed=[{symbol:'a',type:'letter',values:['É']},{symbol:'b',type:'syllable',values:['CH']},{symbol:'n',type:'null',values:[]},{symbol:'s',type:'space',values:[]},{symbol:'w',type:'word',values:['KING','QUEEN']},{symbol:'r',type:'repeat',values:[]},{symbol:'e',type:'erase',values:[]}];
assert.equal(R.applyKey(['a','b','n','s','w','?'],typed).text,'ÉCH ⟦KING/QUEEN⟧⟦??⟧');
assert.equal(R.applyKey(['a','r','e'],typed).text,'É');assert.equal(R.applyKey(['e'],typed).unresolved,1);
assert.equal(R.applyKey(['w','r'],typed).unresolved,2);assert.throws(()=>R.validateKey(typed.concat(typed[0])),/unique/);
assert.throws(()=>R.validateKey([{symbol:'x',type:'letter',values:['CH']}]),/single/);
// Segmentation consumes exactly the source and never invents a boundary or digit.
const segmented=R.segment('2228',{'2':'A','22':'N','8':'D'});
assert.equal(segmented.complete,true);assert.deepEqual(segmented.paths.map(p=>p.text).sort(),['AAAD','AND','NAD']);
segmented.paths.forEach(p=>assert.equal(p.codes.join(''),'2228'));
assert.deepEqual(R.segment('2228',{'2':'A','22':'N','8':'D'},[1]).paths.map(p=>p.text).sort(),['AAAD','AND']);
assert.equal(R.segment('2228',{'22':'N','8':'D'}).paths.length,0);
assert.equal(R.segment('2228',{'2':'A','22':'N','8':'D'},[],1).complete,false);
assert.throws(()=>R.segment('22 28',{'2':'A'}),/without spaces/);
assert.throws(()=>R.segment('2228',{'2':'A'},[4]),/boundary/);
assert.throws(()=>R.segment('2228',{'2':'A','8':'D'},[],100,()=>NaN),/cannot score/);
const capped=R.segment('2'.repeat(20),{'2':'A','22':'N'},[],1000);assert.equal(capped.complete,false);assert.ok(capped.paths.length<=32);
// Search mechanics: many-to-one assignments, deterministic replay, locks, consistency.
const tokens=['x','y','z','x','y','z','x','z'];
const options={seed:71,steps:800,locks:{x:'A',y:'A'}};
const scorer=p=>Array.from(p).filter(c=>c==='A').length;
const s=R.search(tokens,options,scorer),same=R.search(tokens,options,scorer);
assert.deepEqual(s,same);assert.equal(s.candidates[0].plaintext,'AAAAAAAA');assert.equal(s.verified,false);
assert.equal(s.task,'key-recovery-candidates');assert.equal(s.completedSteps,800);
for(const c of s.candidates){assert.equal(c.key.x,'A');assert.equal(c.key.y,'A');assert.equal(tokens.map(t=>c.key[t]).join(''),c.plaintext);}
const renamed=tokens.map(t=>({x:'new-99',y:'Δ',z:'42'})[t]);
const relabel=R.search(renamed,{...options,locks:{'new-99':'A','Δ':'A'}},scorer);
assert.deepEqual(relabel.trace,s.trace);assert.deepEqual(relabel.candidates.map(c=>c.plaintext),s.candidates.map(c=>c.plaintext));
const known=R.search(tokens,{seed:1,steps:100,locks:{x:'A',y:'A',z:'B'}},DetectiveLangModel.fitness);
assert.equal(known.task,'known-key-application');assert.equal(known.completedSteps,0);
assert.throws(()=>R.search(tokens,{...options,locks:{absent:'A'}},scorer),/present/);
assert.throws(()=>R.search(tokens,{...options,seed:-1},scorer),/seed/);
assert.throws(()=>R.search(Array(600).fill('x'),{seed:1,steps:100000},scorer),/20 million/);
assert.throws(()=>R.parseSymbols('a ? b'),/Resolve/);
assert.deepEqual(R.metrics('ABCD','ACD',{x:'A',y:'B'},{x:'A',y:'C'}),{exact:false,editDistance:1,plaintextError:.25,keyError:.5});
// Historical fixture is transcribed independently, not synthesized from the answer.
const z=JSON.parse(fs.readFileSync(path.join(root,'data/research/v1/z340-section-1.json')));
const route=R.z340Route();assert.equal(new Set(route).size,153);assert.equal(new Set(z.ciphertext).size,63);
assert.equal(route.map(i=>z.key[z.ciphertext[i]]).join(''),z.expectedDiplomatic);
assert.notEqual(R.z340Route('row-major').map(i=>z.key[z.ciphertext[i]]).join(''),z.expectedDiplomatic);
assert.match(z.expectedDiplomatic,/FAN/);assert.match(z.expectedDiplomatic,/BECAASE/);assert.match(z.expectedDiplomatic,/PARADLCE/);
// Worker really imports the language model in a worker-like global (no window).
const messages=[],scope={};scope.self=scope;scope.postMessage=x=>messages.push(x);vm.createContext(scope);
scope.fetch=async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,'data/research/v1/language-model.json')))});
scope.importScripts=(...files)=>files.forEach(f=>vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),scope));
vm.runInContext(fs.readFileSync(path.join(root,'js/research-worker.js'),'utf8'),scope);
await scope.onmessage({data:{raw:'x y x',options:{seed:1,steps:10,locks:{x:'A',y:'N'}}}});
assert.equal(messages.at(-1).result.candidates[0].plaintext,'ANA');

// Real page DOM: visible source revision, safe imports, no markup interpretation,
// segmentation invalidation, worker cancellation and receipt invalidation.
const dom=new JSDOM(fs.readFileSync(path.join(root,'lab/evidence-workbench.html'),'utf8'),{url:'https://ciphermuseum.com/lab/evidence-workbench.html',runScripts:'outside-only'});
const w=dom.window,$=id=>w.document.getElementById(id);let lastWorker;
w.Worker=class{constructor(){lastWorker=this;}postMessage(v){this.input=v;}terminate(){this.terminated=true;}};
w.eval(fs.readFileSync(path.join(root,'js/research-model.js'),'utf8'));w.eval(fs.readFileSync(path.join(root,'js/detective/lang-model.js'),'utf8'));w.eval(fs.readFileSync(path.join(root,'js/research-ui.js'),'utf8'));
$('source-raw').value='<img src=x onerror=alert(1)> g2';$('revision-reason').value='Initial source entry';$('save-revision').click();
assert.match($('revision-label').textContent,/revision 2/);assert.equal($('revision-list').querySelector('img'),null);
$('span-end').value='4';$('span-alternatives').value='glyph-1\nglyph-2';$('add-span').click();assert.match($('span-list').textContent,/unresolved/);
$('source-raw').value='edited';$('add-span').click();assert.match($('record-status').textContent,/Save the revised/);
$('revision-reason').value='Reread source';$('save-revision').click();assert.match($('span-list').textContent,/earlier source/);
$('segment-run').click();assert.match($('segment-output').textContent,/3 complete paths/);
$('segment-digits').value='222';$('segment-digits').dispatchEvent(new w.Event('input'));assert.match($('segment-output').textContent,/Recompute/);
$('typed-key').value=JSON.stringify(typed);$('key-input').value='a w';$('apply-key').click();assert.match($('key-output').textContent,/unresolved/);
$('search-example').click();$('search-run').click();assert.equal($('search-cancel').disabled,false);
$('search-cancel').click();assert.equal(lastWorker.terminated,true);assert.equal($('search-export').disabled,true);
lastWorker.onmessage({data:{result:s}});assert.equal($('search-export').disabled,true,'Cancelled worker messages cannot resurrect a receipt');
$('search-run').click();lastWorker.onmessage({data:{result:s}});assert.equal($('search-export').disabled,false);assert.match($('search-status').textContent,/unverified/);
$('search-seed').value='2';$('search-seed').dispatchEvent(new w.Event('input'));assert.equal($('search-export').disabled,true);assert.equal($('search-results').textContent,'');
dom.window.close();
console.log('Research workbench: provenance, segmentation, search, worker, historical replay and DOM checks passed.');

}
main().catch(error=>{console.error(error);process.exitCode=1;});
