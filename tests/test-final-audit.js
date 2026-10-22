'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
require('../js/ciphers/all-engines.js');
const loadEngines = () => global.CipherEngines;
let failures = 0;
function check(name, fn) { try { fn(); console.log('PASS '+name); } catch (e) { failures++; console.error('FAIL '+name+': '+e.message); } }
function page(slug) {
 const dom = new JSDOM(fs.readFileSync('ciphers/'+slug+'.html','utf8'), {runScripts:'outside-only'});
 for(const s of dom.window.document.querySelectorAll('script:not([src])')) { if(s.type!=='application/ld+json') dom.window.eval(s.textContent); }
 return dom;
}
check('ACA horizontal Two-square independent published example',()=>{
 const e=loadEngines().twosquare;
 // First ten pairs of the ACA example; no museum filler escaping required.
 assert.equal(e.encode('ANOTHERDIGRAPHICSETU','DIALOGUE,BIOGRAPHY'),'IRRTEHMKGIMEQGRUNMMZ');
 assert.equal(e.decode('IRRTEHMKGIMEQGRUNMMZ','DIALOGUE,BIOGRAPHY'),'ANOTHERDIGRAPHICSETU');
 assert.equal(e.encode('AB','A,A'),'BA','same-row pair reverses');
});
check('Playfair decrypt never inserts plaintext fillers',()=>{
 const dom=page('playfair'),d=dom.window.document;
 d.getElementById('pf-msg-input').value='AA';dom.window.setMode('decrypt');
 assert.equal(d.getElementById('pf-msg-pairs').textContent,'Digraphs: AA');
 assert.equal(d.getElementById('pf-msg-output').textContent.replace(/\s/g,'').length,2);
 d.getElementById('pf-msg-input').value='ABC';dom.window.setMode('decrypt');
 assert.match(d.getElementById('pf-msg-output').textContent,/even|pairs/i);dom.window.close();
});
check('Sator anagram checks multiplicities, not just allowed characters',()=>{
 const dom=page('sator-square'),d=dom.window.document;
 d.getElementById('input').value='PATER NOSXX XXXXX XXXXX XXXXX';dom.window.encode();
 assert.match(d.getElementById('output').textContent,/PATER NOSTER[^\n]*❌/);
 d.getElementById('input').value='SATOR AREPO TENET OPERA ROTAS';dom.window.encode();
 assert.match(d.getElementById('output').textContent,/PATER NOSTER[^\n]*✅/);dom.window.close();
});
check('Shugborough rejects extra words rather than confirming a prefix',()=>{
 const dom=page('shugborough'),d=dom.window.document;
 d.getElementById('input').value='One Under One Stone Very Ancient Very Valuable EXTRA';dom.window.encode();
 assert.match(d.getElementById('output').textContent,/exactly 8/i);dom.window.close();
});
check('Microdot illustration handles Unicode and discloses encoding only',()=>{
 const dom=page('microdot');const out=dom.window.mdEncode('é 😀');
 assert.match(out,/not.*microdot|no.*optical/i);assert.match(out,/base64/i);dom.window.close();
});
if(failures)process.exit(1);
