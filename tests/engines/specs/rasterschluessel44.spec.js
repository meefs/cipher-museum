'use strict';
const assert = require('node:assert/strict');
const {test} = require('node:test');
const {fc,engines} = require('../helpers/engine-spec');
const e=engines.rasterschluessel44;
const {rs44:v,rs44Wrap:w} = require('../helpers/historical-vectors');
test('RS44: original March 1944 examples, including bottom-to-top wrap',()=>{
 for(const vector of [v,w]) {assert.equal(e.encode(vector.plain,vector.key),vector.cipher);assert.equal(e.decode(vector.cipher,vector.key),vector.plain);}
 const t=e.trace(v.plain);assert.equal(t.grid.length,24);assert(t.grid.every(r=>[...r].filter(c=>c==='.').length===10));
 assert.deepEqual([t.sum,t.readColumn,t.firstRank],[17,5,19]);
 assert.equal(e.trace(w.plain,w.key).firstRank,12);
});
test('RS44: 250 valid-key properties across every start and length',()=>{
 fc.assert(fc.property(fc.array(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'),{maxLength:200}),fc.integer({min:0,max:23}),fc.integer({min:0,max:24}),fc.integer({min:0,max:59}),
  (letters,startRow,startColumn,minute)=>{const p=letters.join(''),k={startRow,startColumn,minute};assert.equal(e.decode(e.encode(p,k),k),p);}),{numRuns:250,seed:4401944});
});
test('RS44: exact limits, blocked/white starts, rank wrap and invalid recovery',()=>{
 assert.equal(e.encode(''),'');for(const n of [60,200]) assert.equal(e.decode(e.encode('A'.repeat(n),{strict:true}),{strict:true}),'A'.repeat(n));
 for(const n of [0,59,201,240,102400])assert.match(e.encode('A'.repeat(n),{strict:true}),/^Error:/);
 for(const k of [{startRow:-1},{startColumn:25},{minute:60},{order:Array(25).fill(1)},{grid:['.'.repeat(25)]},{grid:null},{strict:'yes'},'garbage']) assert.match(e.encode(v.plain,k),/^Error:/);
 assert.equal(e.trace('ABC',{startRow:0,startColumn:0}).actualBeginning,2);
 assert.equal(e.trace('ABC',{startRow:0,startColumn:2}).actualBeginning,2,'White beginning is included, not skipped');
 const wrapped=e.trace('A'.repeat(99),{minute:59,startColumn:13});assert.equal(wrapped.sum,32);assert.equal(wrapped.readColumn,20);
 assert.equal(e.encode('café! 123',{}), e.encode('CAFE',{}));
 assert.equal(e.decode(e.encode('café 中文 مرحبا 🔑 Jé')), 'CAFEJE', 'Documented nonalphabet and accent normalization');
 for (const key of [undefined,null,'','manual']) assert.equal(e.encode(v.plain,key),v.cipher,'Explicit default-key convention');
 const before=e.encode(v.plain);e.encode('WRONG',{order:[]});engines.caesar.encode('OTHER','3');assert.equal(e.encode(v.plain),before);
 const key={startRow:4,startColumn:13,minute:3};const original=JSON.stringify(key);e.encode(v.plain,key);assert.equal(JSON.stringify(key),original);
});
