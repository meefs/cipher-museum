'use strict';
const assert = require('node:assert/strict');
const {test} = require('node:test');
const {fc,engines} = require('../helpers/engine-spec');
const e=engines.doublePlayfair;const {doublePlayfair:v}=require('../helpers/historical-vectors');
test('Double Playfair: complete December 1941 example and both substitution cases',()=>{
 assert.equal(e.encode(v.plain),v.cipher);assert.equal(e.decode(v.cipher),v.plain);
 for(const [p,m,c] of [['AA','VR','FY'],['FA','TR','VD']]) {const t=e.trace(p);assert.equal(t.pairs[0].stage1.result,m);assert.equal(t.output,c);assert.equal(e.decode(c),p);}
 assert.deepEqual(e.trace(v.plain).blocks,[{top:'FEINDLIQERANGRIFF',bottom:'AUFSTRASZEADORFST'},{top:'RIQBEHAUSE',bottom:'NABGEWEHRT'}]);
});
test('Double Playfair: 250 independent random squares and normalized-domain roundtrips',()=>{
 const alphabet=[...'ABCDEFGHIKLMNOPQRSTUVWXYZ'];const square=fc.shuffledSubarray(alphabet,{minLength:25,maxLength:25}).map(a=>a.join(''));
 fc.assert(fc.property(fc.array(fc.constantFrom(...alphabet),{maxLength:500}),square,square,(a,squareA,squareB)=>{
  const p=a.join(''),k={squareA,squareB};assert.equal(e.decode(e.encode(p,k),k),p+(p.length%2?'Z':''));
 }),{numRuns:250,seed:194112});
});
test('Double Playfair: malformed keys, partial pairs, retained padding, normalization, isolation',()=>{
 assert.equal(e.encode(''),'');assert.equal(e.decode(e.encode('AXA')),'AXAZ');assert.equal(e.decode(e.encode('JJ')),'IIII');
 for(const key of [{squareA:'A'.repeat(25)},{squareB:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'},{filler:'X'},{filler:'J'},{filler:''},'junk']) assert.match(e.encode('TEST',key),/^Error:/);
 assert.match(e.decode('ABC'),/^Error:/);assert.match(e.decode('JI'),/^Error:/);assert.match(e.encode('A'.repeat(501),{strict:true}),/^Error:/);
 assert.equal(e.decode(e.encode('A'.repeat(500),{strict:true}),{strict:true}),'A'.repeat(500));
 assert.equal(e.decode(e.encode('café! J 12')),'CAFEII');
 assert.equal(e.decode(e.encode('café 中文 مرحبا 🔑 Jé')), 'CAFEIIEZ', 'Normalization then historical J→II, retained odd filler');
 for (const key of [undefined,null,'','manual']) assert.equal(e.encode(v.plain,key),v.cipher,'Explicit default-key convention');
 const p='AZ'.repeat(51200), started=performance.now(),ct=e.encode(p);assert.equal(e.decode(ct),p);
 assert(performance.now()-started<5000,'Exact 100 KB roundtrip must finish within five seconds');
 assert.equal(e.trace(v.plain).output,e.encode(v.plain),'Optional visualization capture must not change substitution');
 const before=e.encode(v.plain);e.decode('X');engines.caesar.encode('OTHER','7');assert.equal(e.encode(v.plain),before);
});
