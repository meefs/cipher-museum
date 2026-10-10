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
console.log('Count registrations, categories, canonical search identities, static totals and idempotence passed: '+JSON.stringify(c));
