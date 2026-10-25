#!/usr/bin/env node
'use strict';
// Public evaluation, not a blind capability benchmark. Keep failures in the output.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.join(__dirname,'..'),R=require('../js/research-model');const model=require('../js/research-language-model').build(require('../data/research/v1/language-model.json'));
const suite=require('../data/research/v1/exercises.json');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex');
function encrypt(text,seed){
  const plaintext=text.toUpperCase().replace(/[^A-Z]/g,''),random=R.rng(seed),letters=[...new Set(plaintext)],pool=Array.from({length:letters.length*2},(_,i)=>'g'+i);
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const key={},byLetter={};letters.forEach((c,i)=>{byLetter[c]=pool.slice(2*i,2*i+2);byLetter[c].forEach(s=>{key[s]=c;});});
  const tokens=Array.from(plaintext,c=>byLetter[c][Math.floor(random()*2)]);
  const used=Object.fromEntries(Object.entries(key).filter(([s])=>tokens.includes(s)));
  return{plaintext,tokens,key:used};
}
const records=[];
for(const item of suite.cases){
  const e=encrypt(item.text,item.keySeed),options={seed:41,steps:15000,locks:{}};
  const result=R.search(e.tokens,options,model.fitness);
  const known=R.search(e.tokens,{...options,locks:e.key},model.fitness);
  const locks={...e.key};delete locks[e.tokens[0]];
  const assisted=R.search(e.tokens,{...options,steps:3000,locks},model.fitness);
  const renamed=e.tokens.map(s=>'renamed-'+s),renamedResult=R.search(renamed,options,model.fitness);
  const shifted=encrypt(item.text,item.keySeed+1);
  const wrongKeyText=shifted.tokens.map(s=>e.key[s]||'?').join('');
  records.push({id:item.id,kind:'synthetic',language:item.language,keySeed:item.keySeed,sourceDocument:item.id,
    tokens:e.tokens.length,symbols:Object.keys(e.key).length,inputNormalization:'Uppercase ASCII letters only; original prose retained in exercises.json.',
    unassisted:{options,metrics:R.metrics(e.plaintext,result.candidates[0].plaintext,e.key,result.candidates[0].key),candidate:result.candidates[0].plaintext,verified:result.verified},
    allSymbolsLocked:{task:known.task,metrics:R.metrics(e.plaintext,known.candidates[0].plaintext,e.key,known.candidates[0].key)},
    oneSymbolUnlocked:{unlocked:e.tokens[0],locks,seed:41,steps:3000,metrics:R.metrics(e.plaintext,assisted.candidates[0].plaintext,e.key,assisted.candidates[0].key)},
    relabellingInvariant:JSON.stringify(result.candidates.map(c=>[c.plaintext,c.score]))===JSON.stringify(renamedResult.candidates.map(c=>[c.plaintext,c.score])),
    differentIndependentKey:{metrics:R.metrics(shifted.plaintext,wrongKeyText,shifted.key,e.key),meaning:'Applying the old key to a new independent key is a negative control, not recovery.'}});
}
const clean='ABCDEF',damaged='AB?DEF';let rejected=false;try{R.parseSymbols(damaged.split('').join(' '));}catch(_){rejected=true;}
const z=require('../data/research/v1/z340-section-1.json');
const random=R.rng(27),noise=Array.from({length:160},()=>String(Math.floor(random()*35)));
const noiseResult=R.search(noise,{seed:41,steps:3000,locks:{}},model.fitness);
const report={version:1,model:model.id,modelSha256:hash('data/research/v1/language-model.json'),scorerSha256:hash('js/research-language-model.js'),solverSha256:hash('js/research-model.js'),fixturesSha256:hash('data/research/v1/exercises.json'),
  scope:'Public demonstrations; no training, blind holdout or historical-language coverage claim. One-symbol-unlocked runs disclose the rest of the key; they do not establish general recovery.',records,
  damagedTranscription:{input:damaged,glyphError:R.metrics(clean,damaged).plaintextError,unresolvedCoverage:1/6,searchRejected:rejected,plaintextError:null,reason:'Missing glyphs are not silently deleted or sent to letter-only search.'},
  segmentation:{source:'2228',expectedBoundaries:[1,3],allPaths:R.segment('2228',{'2':'A','22':'N','8':'D'}).paths,wrongHypothesisBoundarySymmetricDifference:1,meaning:'2|2|2|8 adds a boundary after digit 2 compared with 2|22|8. No unique segmentation is selected by the source alone.'},
  historical:{id:z.id,kind:z.kind,correctRouteExact:R.z340Route().map(i=>z.key[z.ciphertext[i]]).join('')===z.expectedDiplomatic,wrongRouteExact:R.z340Route('row-major').map(i=>z.key[z.ciphertext[i]]).join('')===z.expectedDiplomatic,task:'known-key replay',fullZ340Recovery:false},
  randomNegativeControl:{tokens:noise.length,verified:noiseResult.verified,candidate:noiseResult.candidates[0].plaintext,plaintextError:null,meaning:'Random input has no planted plaintext. An English-looking candidate is not a successful decipherment.'}};
const out=path.join(root,'data/research/v1/evaluation.json'),encoded=JSON.stringify(report,null,2)+'\n';
if(process.argv.includes('--check')){if(!fs.existsSync(out)||fs.readFileSync(out,'utf8')!==encoded){console.error('Research evaluation is stale.');process.exitCode=1;}}
else fs.writeFileSync(out,encoded);
for(const r of records)console.log(r.id+': unassisted plaintext error '+(100*r.unassisted.metrics.plaintextError).toFixed(1)+'%; one-symbol-unlocked error '+(100*r.oneSymbolUnlocked.metrics.plaintextError).toFixed(1)+'%; relabelling invariant '+r.relabellingInvariant);
