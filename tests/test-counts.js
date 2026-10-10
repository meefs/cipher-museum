#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { computeCounts, renderCounts } = require('../scripts/build-counts');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');
const c = computeCounts();
const es = JSON.parse(read('data/exhibit-trust.json')).exhibits;
assert.equal(c.total, c.cipherHistory + c.foundations + c.protocols);
assert.equal(c.total, es.length);
assert.deepEqual(es.map(e => e.number).sort((a,b)=>a-b), Array.from({length:c.total},(_,i)=>i+1));
assert.deepEqual([c.foundationsFirst,c.foundationsLast,c.protocolsFirst,c.protocolsLast],[141,157,158,160]);
// Pin historical identity/category allocation, while allowing append-only growth.
assert.equal(es.find(e=>e.number===164).path,'ciphers/myszkowski.html');
for (const e of es) {
  assert.equal(e.collection, e.number>=141 && e.number<=157 ? 'foundations' :
    e.number>=158 && e.number<=160 ? 'protocols' : 'cipher-history', e.path);
  const html = read(e.path);
  const chip = /Exhibit\s+(\d+)\s+of\s+(\d+)/.exec(html);
  if (chip) assert.deepEqual(chip.slice(1).map(Number), [e.number, c.total], e.path);
  // Check the declared interactive has an actual entry point, not a menu.
  if (e.interactive) assert.match(html, /data-cipher=|historical-(?:message|demo)|<main[\s\S]*(?:<button|<input|<select)/, e.path);
}
for (const [p, text] of renderCounts(c)) assert.equal(read(p), text.replace(/\r\n/g,'\n'), `Stale generated count: ${p}`);
assert.deepEqual([...renderCounts(c)], [...renderCounts(c)], 'Rendering is deterministic');
assert.match(read('index.html'), /Cipher &amp; History Exhibits/);
assert.doesNotMatch(read('museum-map.html'), /140 Ciphers/);
assert.match(read('museum-map.html'), /data-count="cipherHistory"/);
const search = JSON.parse(read('js/search-index.json')).entries;
assert.deepEqual(search.filter(e=>e.exhibitNumber).map(e=>[e.exhibitNumber,e.u,e.collection]).sort((a,b)=>a[0]-b[0]),
  es.map(e=>[e.number,e.path,e.collection]).sort((a,b)=>a[0]-b[0]), 'Search registrations preserve canonical IDs');
assert.match(read('search.html'), /Number\.isInteger\(e\.exhibitNumber\)/);
assert.equal(es.find(e=>e.path==='ciphers/dorabella.html').interactive, true);
assert.equal(es.find(e=>e.path==='ciphers/hagelin-c36.html').interactive, false);
// A real controllable visualization counts even without a button/demo marker.
const { JSDOM } = require('jsdom');
for (const [id,file,input,value,output,expected] of [
 [144,'hall-of-foundations/prime-number-theorem.html','xr','2000','pread',/π\(2000\) = 303/],
 [151,'hall-of-foundations/entropy.html','pr','25','hread',/entropy = 0\.811/],
 [140,'ciphers/bible-code.html','els-search',null,'els-word-display',/FIRE/]
]) {
 assert.equal(es.find(e=>e.number===id).interactive,true,file+' has a working interactive');
 const html=read(file).replace(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g,(_,src)=> {
  const target=path.resolve(root,path.dirname(file),src);
  return fs.existsSync(target)?'<script>'+fs.readFileSync(target,'utf8').replace(/<\/script/gi,'<\\/script')+'</script>':'';
 });
 const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'+file});
 const el=dom.window.document.getElementById(input);
 if(value!==null){el.value=value;el.dispatchEvent(new dom.window.Event('input',{bubbles:true}));}else el.click();
 assert.match(dom.window.document.getElementById(output).textContent,expected,file+' real control');
 dom.window.close();
}
for (const id of [109,110,112,113,124,127,128,129]) {
 const e=es.find(e=>e.number===id);assert.equal(e.interactive,true,e.path);
 const dom=new JSDOM(read(e.path),{runScripts:'dangerously',pretendToBeVisual:true});
 dom.window.eval(read('js/ui-delegates.js'));
 dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
 if(id===124){dom.window.document.querySelector('[data-fn="runHollerCode"]').click();assert(dom.window.document.getElementById('hollerOutput').textContent.length>0);}
 else {dom.window.document.getElementById('input').value='REVIEWINPUT';dom.window.document.querySelector('[data-fn="encode"]').click();assert(dom.window.document.getElementById('output').textContent.length>0,e.path+' real delegated control');}
 dom.window.close();
}
for (const block of read('README.md').matchAll(/```[\s\S]*?```/g)) assert(!block[0].includes('<!-- count:'),'Count plumbing must not display inside fenced code');
console.log('Count registrations, categories, canonical search identities, static totals and idempotence passed: '+JSON.stringify(c));
