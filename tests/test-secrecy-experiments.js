'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom'),S=require('../js/secrecy-experiments');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
for(const prior of [0,.1,.5,.9,1]){
 const r=S.binary(prior,.5);near(r.information,0);near(r.pairwiseDistance,0);
 near(r.rows.reduce((sum,r)=>sum+r.p,0),1);near(r.decryptionError,0);
 for(const p of r.posteriorZero)if(p!==null)near(p,prior);
}
const biased=S.binary(.5,.25);near(biased.ciphertext[0],.5);near(biased.ciphertext[1],.5);
near(biased.pairwiseDistance,.5);near(biased.information,.18872187554086717);
near(S.binary(1,0).information,0);near(S.binary(.5,0).information,1);near(S.binary(1,0).pairwiseDistance,1);
const reused=S.twoMessages(false),fresh=S.twoMessages(true);
near(reused.singleInformation,0);near(reused.jointInformation,2);near(reused.jointDistance,.75);assert.equal(reused.count,64);
near(fresh.jointInformation,0);near(fresh.jointDistance,0);assert.equal(fresh.count,256);
assert.throws(()=>S.binary(-1,.5),/Probabilities/);
// Independent authentication-code enumeration: all3125 arbitrary substitution maps.
const E=[[[1,4],[2,3]],[[2,0],[3,4]],[[3,1],[4,0]],[[4,2],[0,1]],[[0,3],[1,2]]];
for(const prior of [.5,.9,1]){
 let best=0;
 for(let map=0;map<3125;map++){
  const replace=Array.from({length:5},(_,i)=>Math.floor(map/(5**i))%5);let success=0;
  for(let k=0;k<5;k++)for(let s=0;s<2;s++)for(const c of E[k][s])if(E[k][1-s].includes(replace[c]))success+=(s?1-prior:prior)/10;
  best=Math.max(best,success);
 }
 near(best,.5);
 for(let s=0;s<2;s++)for(let c=0;c<5;c++)near(E.filter(row=>row[s].includes(c)).length/10,.2);
}
// Wiring: changing a declared distribution updates the visible result, not a random sample.
const root=path.join(__dirname,'..'),dom=new JSDOM(fs.readFileSync(path.join(root,'ciphers/one-time-pad.html'),'utf8'),{runScripts:'outside-only'});
dom.window.eval(fs.readFileSync(path.join(root,'js/secrecy-experiments.js'),'utf8'));
const $=id=>dom.window.document.getElementById(id);
assert.equal($('secrecy-joint').children.length,4);
$('secrecy-bias').value='.25';$('secrecy-bias').dispatchEvent(new dom.window.Event('change'));
assert.match($('secrecy-result').textContent,/0\.18872 bits/);
$('secrecy-fresh').checked=true;$('secrecy-fresh').dispatchEvent(new dom.window.Event('change'));
assert.match($('secrecy-reuse-result').textContent,/256 equally likely/);
assert.match($('secrecy-reuse-result').textContent,/Joint I.*0\.00000 bits/);
dom.window.close();console.log('PASS exact secrecy distributions, joint pad-reuse controls, authentication enumeration and DOM');
