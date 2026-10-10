const fs=require('fs'),cp=require('child_process'),assert=require('assert/strict'),path=require('path');
const root='/tmp/cipher-hostile-20261010-mutation',out=__dirname,results=[];
function clean(){assert.equal(cp.execFileSync('git',['status','--porcelain','--untracked-files=no'],{cwd:root,encoding:'utf8'}),'');}
function checkout(sha){clean();cp.execFileSync('git',['checkout','--detach',sha],{cwd:root,stdio:'pipe'});clean();}
function check(name,script){const r=cp.spawnSync(process.execPath,[script],{cwd:root,encoding:'utf8'});fs.writeFileSync(path.join(out,`pre-${name}.log`),r.stdout+r.stderr);assert.equal(r.status,0,name+' was accepted by pre-fix detector');results.push({name,sha:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),script,exit:r.status});}
checkout('663cbffe736b88353ac4d17ecff300c5d6ae665e');
const file=path.join(root,'tests/engines/scaling.js'),before=fs.readFileSync(file);
try{
 fs.writeFileSync(file,before.toString().replace('const RATIO_LIMIT = 10;','const RATIO_LIMIT = 20;'));
 check('threshold20-old-canary','tests/engines/scaling-canary.js');
 const guard=require(file),caesar=global.CipherEngines.caesar;let checksum=0;
 const bad={...caesar,encode(t,k){const n=Math.ceil(t.length/8);for(let i=0;i<n;i++)for(let j=0;j<n;j++)checksum^=t.charCodeAt((i+j)%t.length)+i*j;return caesar.encode(t,k);}};
 const known='ATTACKATDAWN';assert.equal(bad.encode(known,'KEY'),caesar.encode(known,'KEY'));assert.equal(bad.decode(bad.encode(known,'KEY'),'KEY'),known);
 const measurement=guard.measureEngine('caesar',bad);let accepted=false;try{guard.run({caesar:bad});accepted=true;}catch(e){console.error(e);}
 assert(accepted,'Weakened pre-fix production guard accepts actual quadratic work');results.push({name:'threshold20-quadratic-production-acceptance',sha:'663cbffe736b88353ac4d17ecff300c5d6ae665e',measurement,accepted,checksum});
}finally{fs.writeFileSync(file,before);clean();}
checkout('1e190e0e7d347e5684d36a40827e602ac821045d');
for(const[slug,old,wrong]of [['nema','<strong>Historical Only</strong> classification','<strong>Broken</strong> classification'],['hagelin-c36','This lineage carries <strong>Broken</strong>','This lineage carries <strong>Historical Only</strong>']]){
 const f=path.join(root,'ciphers/'+slug+'.html'),saved=fs.readFileSync(f);assert(saved.toString().includes(old));
 try{fs.writeFileSync(f,saved.toString().replace(old,wrong));check(slug+'-wrong-prose-trust','tests/test-trust-labels.js');check(slug+'-wrong-prose-historical','tests/test-historical-exhibits.js');}
 finally{fs.writeFileSync(f,saved);clean();}
}
fs.writeFileSync(path.join(out,'pre-regression-results.json'),JSON.stringify({results,allRestored:true},null,2)+'\n');console.log('Pre-fix detector gaps reproduced; all changes restored.');
