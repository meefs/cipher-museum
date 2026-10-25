'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const result=spawnSync(process.execPath,['scripts/evaluate-research.js','--check'],{cwd:path.join(__dirname,'..'),encoding:'utf8'});
process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');
assert.equal(result.status,0,'Versioned research evaluation must reproduce from its fixtures, model and solver.');
const report=require('../data/research/v1/evaluation.json');
for(const r of report.records){
  assert.equal(r.allSymbolsLocked.metrics.exact,true,'Known-key application must reproduce the plaintext.');
  assert.equal(r.relabellingInvariant,true,'Arbitrary symbol names cannot change search behavior.');
  assert.equal(r.unassisted.verified,false,'A score never certifies a historical reading.');
  assert.equal(r.differentIndependentKey.metrics.exact,false,'The previous key does not transfer to an independent encryption.');
}
assert.equal(report.historical.correctRouteExact,true);assert.equal(report.historical.wrongRouteExact,false);
assert.equal(report.damagedTranscription.searchRejected,true);assert.equal(report.randomNegativeControl.verified,false);
console.log('Research evaluation replay and separation of application, recovery, noise and history passed.');
