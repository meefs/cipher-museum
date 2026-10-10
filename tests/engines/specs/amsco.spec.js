'use strict';
const assert = require('node:assert/strict');
const {test} = require('node:test');
const {fc,engines} = require('../helpers/engine-spec');
const e=engines.amsco;const {amsco:v}=require('../helpers/historical-vectors');
test('AMSCO: ACA p32 complete example, cell boundaries and incomplete row',()=>{
 assert.equal(e.encode(v.plain,'41325'),v.cipher);assert.equal(e.decode(v.cipher,'41325'),v.plain);
 const t=e.trace(v.plain,'41325');assert.deepEqual(t.cells.slice(0,5).map(c=>c.value),['IN','C','OM','P','LE']);assert.deepEqual(t.cells.slice(-3).map(c=>c.value),['A','PH','S']);
 // Independently hand-derived even-width guard: rows AB|C / D|EF => A B D | C E F.
 assert.equal(e.encode('ABCDEF',{order:[1,2],first:2}),'ABDCEF');
 assert.equal(e.decode('ABDCEF',{order:[1,2],first:2}),'ABCDEF');
});
test('AMSCO: 250 rank permutations, both first-cell conventions, every ragged ending',()=>{
 fc.assert(fc.property(fc.integer({min:2,max:12}).chain(n=>fc.shuffledSubarray(Array.from({length:n},(_,i)=>i+1),{minLength:n,maxLength:n})),fc.constantFrom(1,2),fc.array(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'),{maxLength:2048}),
 (order,first,a)=>{const p=a.join(''),k={order,first};assert.equal(e.decode(e.encode(p,k),k),p);}),{numRuns:250,seed:193002});
 for(const order of [[2,1],[4,1,3,2],[4,1,3,2,5]])for(const first of [1,2])for(let n=0;n<40;n++) {const p='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(2).slice(0,n),k={order,first};assert.equal(e.decode(e.encode(p,k),k),p);}
});
test('AMSCO: invalid keys, no null padding, normalization and isolated large execution',()=>{
 for(const key of ['11','1','41324','0 1','abc',{order:[1,2],first:0},{order:null}])assert.match(e.encode('TEST',key),/^Error:/);
 assert.equal(e.encode('','41325'),'');assert.equal(e.decode(e.encode('café!123','41325'),'41325'),'CAFE');
 assert.equal(e.decode(e.encode('café 中文 مرحبا 🔑 Jé','41325'),'41325'), 'CAFEJE', 'Documented nonalphabet and accent normalization');
 for (const key of [undefined,null,'','manual']) assert.equal(e.encode(v.plain,key),v.cipher,'Explicit default-key convention');
 const p='AZ'.repeat(51200), started=performance.now();assert.equal(e.decode(e.encode(p,'41325'),'41325'),p);
 assert(performance.now()-started<5000,'Exact 100 KB roundtrip must finish within five seconds');
 const before=e.encode(v.plain,'41325');e.encode('TEST','bad');engines.caesar.encode('OTHER','13');assert.equal(e.encode(v.plain,'41325'),before);
});
