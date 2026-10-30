'use strict';
const assert=require('node:assert/strict');
const R=require('../js/research-model');
let failed=0;
function test(name,fn){try{fn();console.log('PASS '+name);}catch(e){failed++;console.error('FAIL '+name+': '+e.message);}}
test('saturated counts do not manufacture forced boundaries',()=>{
  for(const budget of [1,32]){
    const r=R.segment('2'.repeat(80),{'2':'A','22':'N'},[],budget);
    assert.equal(r.totalCapped,true);
    assert.equal(r.ambiguity.filter(a=>a.forced).length,0);
    assert.equal(r.ambiguity.filter(a=>a.impossible).length,0);
  }
  assert.equal(R.segment('2'.repeat(79)+'8',{'2':'A','22':'N','8':'D'},[],1).ambiguity.at(-1).forced,true);
});
test('inventories retain earlier decisions across rebuilds and round trips',()=>{
  let d=R.buildInventory(R.create('g1 g2 g1'));
  d=R.splitClass(d,'class-1',[2],'g1-dot','A visible diacritic');
  const old=JSON.parse(JSON.stringify(d.inventory));
  d=R.buildInventory(R.revise(d,'g1 g2 g1 g3','Added the final symbol'));
  assert.deepEqual(d.inventoryArchive,[old]);
  d=R.buildInventory(d);
  const reopened=R.validate(JSON.parse(JSON.stringify(d)));
  assert.equal(reopened.inventoryArchive.length,2);
  assert.match(reopened.inventoryArchive[0].history.at(-1).detail,/visible diacritic/);
  assert.equal(reopened.inventoryArchive[0].occurrences[2].literal,'g1');
  assert.throws(()=>R.validate({...d,inventoryArchive:[{...old,revision:999}]}),/source revision/);
});
test('duplicate support cannot become corroboration',()=>{
  assert.throws(()=>R.addHypothesis(R.create('a'),{claim:'Same hand',confidence:'well-supported',
    supports:[{ref:'folio1',note:'Shape match'},{ref:' folio1 ',note:'Same observation again'}]}),/separately recorded/);
});
const state={scoringModel:'model-A',solver:'annealing',selectedLayer:'revision-1',
  search:{raw:'a b a',algorithm:'annealing',seed:0,steps:10,beam:0,locks:{}},
  segmentation:{digits:'222',key:{2:'A',22:'N'},boundaries:[],budget:100,scoring:'neutral',lineBreaks:'boundary'},
  candidates:[{plaintext:'ANA',score:-1,key:{a:'A',b:'N'},chosen:true,provenance:'test'}]};
const bundle=R.bundle(R.create('a b a'),state),clone=x=>JSON.parse(JSON.stringify(x));
test('every solver input and model dependency invalidates its receipt',()=>{
  assert.equal(R.openBundle(clone(bundle)).stale.search,false);
  for(const mutate of [b=>b.search.locks={a:'A'},b=>b.search.seed=1,b=>b.search.steps=11,
    b=>b.search.beam=10,b=>b.search.algorithm='beam',b=>b.tool.scoringModel='model-B',
    b=>b.tool.solver='beam',b=>b.tool.modelBuild='different-build']){
    const b=clone(bundle);mutate(b);const r=R.openBundle(b);
    assert.equal(r.stale.search,true);assert.equal(r.stale.candidates,true);
    assert.equal(r.search.producedWith.scoringModel,'model-A','original producing tool remains readable after settings change');
  }
});
test('all segmentation settings invalidate dependent results',()=>{
  for(const mutate of [b=>b.segmentation.boundaries=[1],b=>b.segmentation.budget=1,
    b=>b.segmentation.scoring='english',b=>b.segmentation.lineBreaks='span']){
    const b=clone(bundle);mutate(b);assert.equal(R.openBundle(b).stale.segmentation,true);
  }
});
test('nonexistent revision selections are rejected',()=>{
  assert.throws(()=>R.openBundle({...clone(bundle),selectedLayer:'revision-999'}),/does not contain/);
});
test('legacy receipts remain readable and explicitly unbound',()=>{
  const b=clone(bundle);b.version=1;delete b.search.configurationFingerprint;delete b.segmentation.configurationFingerprint;
  const r=R.openBundle(b);assert.equal(r.stale.search,true);assert.equal(r.stale.segmentation,true);
  assert.equal(r.candidates.length,1);
});
if(failed)process.exitCode=1;
