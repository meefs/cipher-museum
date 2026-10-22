#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const exercise = require('../js/multiple-anagramming');
const root = path.resolve(__dirname, '..');

// These vectors are pinned independently of the UI. Write each message in
// four five-letter rows and read columns 3,1,5,2,4 (control: 5,2,4,1,3).
const vectors = [
  ['ECEOMHRTTUANEEINTORO', 'MEETTHECOURIERATNOON'],
  ['ITFUBWBEGRRKRAEDNEOS', 'BRINGWATERBEFOREDUSK'],
  ['OEHOSTRNTORDCHTRUNEA', 'SCOUTTHENORTHERNROAD'],
  ['RTRKEPEDDROSSEBENOFU', 'SENDREPORTBEFOREDUSK']
];
const initial = [0, 1, 2, 3, 4];
const correct = [1, 3, 0, 4, 2];
assert.deepEqual(exercise.fixtures.map(f => [f.ciphertext, f.plaintext]), vectors);
vectors.slice(0, 3).forEach(([ct, pt]) => assert.equal(exercise.reconstruct(ct, correct), pt));
assert.equal(exercise.reconstruct(vectors[3][0], correct), 'ESRNDPETOREBRFODEKUS');
assert.notEqual(exercise.reconstruct(vectors[3][0], correct), vectors[3][1], 'shared key must not solve the different-key control');
assert.equal(exercise.reconstruct(vectors[3][0], [3, 1, 4, 2, 0]), vectors[3][1], 'control has its own valid ordering');

function permutations(xs) {
  if (!xs.length) return [[]];
  return xs.flatMap((x, i) => permutations(xs.filter((_, j) => i !== j)).map(tail => [x, ...tail]));
}
const letters = s => s.split('').sort().join('');
for (const order of permutations(initial)) {
  for (const [ct] of vectors) {
    assert.equal(letters(exercise.reconstruct(ct, order)), letters(ct), 'a column move must preserve every message letter');
  }
  const score = exercise.contactScore(order);
  assert(Number.isInteger(score) && score >= 0 && score <= 48);
}
assert.equal(exercise.contactScore(initial), 9);
assert.equal(exercise.contactScore(correct), 25);
assert.deepEqual(exercise.move(initial, 0, -1), initial, 'left boundary is stable');
assert.deepEqual(exercise.move(initial, 4, 1), initial, 'right boundary is stable');
assert.deepEqual(exercise.move(initial, 2, -1), [0, 2, 1, 3, 4]);
assert.deepEqual(initial, [0, 1, 2, 3, 4], 'moves must not mutate an earlier arrangement');
assert.throws(() => exercise.reconstruct(vectors[0][0], [0, 0, 1, 2, 3]), /exactly once/);
assert.throws(() => exercise.reconstruct('SHORT', initial), /twenty/);

const html = fs.readFileSync(path.join(root, 'ciphers/columnar.html'), 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://ciphermuseum.com/ciphers/columnar.html' });
const { document, Event } = dom.window;
dom.window.eval(fs.readFileSync(path.join(root, 'js/multiple-anagramming.js'), 'utf8'));
dom.window.MultipleAnagramming.mount(document);
const byId = id => document.getElementById(id);
const candidates = () => Array.from(document.querySelectorAll('.ma-candidate'), el => el.textContent);
assert.equal(document.querySelectorAll('.demo-section[data-cipher="columnar"]').length, 1, 'retain existing known-key demo');
assert.equal(document.querySelectorAll('.ma-strip').length, 5);
assert.equal(candidates().length, 4);
assert.equal(document.querySelectorAll('.ma-check-result').length, 0, 'do not label a guess checked before checking');
assert(byId('ma-left').disabled);
const before = candidates();
byId('ma-right').click();
assert.equal(byId('ma-order').textContent, 'B → A → C → D → E');
assert(candidates().every((text, i) => text !== before[i]), 'one move must update every intercept, including control');
assert.match(byId('ma-status').textContent, /every intercept/);

// Keyboard-operable select + ordinary buttons recover B,D,A,E,C manually.
byId('ma-selected').value = '3';
byId('ma-selected').dispatchEvent(new Event('change'));
byId('ma-left').click();
byId('ma-left').click();
byId('ma-selected').value = '4';
byId('ma-selected').dispatchEvent(new Event('change'));
byId('ma-left').click();
assert.equal(byId('ma-order').textContent, 'B → D → A → E → C');
assert.deepEqual(candidates().slice(0, 3), vectors.slice(0, 3).map(v => v[1]));
byId('ma-check').click();
assert.match(byId('ma-status').textContent, /All three same-key messages match/);
assert.equal(document.querySelectorAll('.ma-check-result').length, 4);
assert.match(document.querySelectorAll('.ma-check-result')[3].textContent, /Does not match.*different column order/);
byId('ma-control').checked = false;
byId('ma-control').dispatchEvent(new Event('change'));
assert.equal(candidates().length, 3);
assert.equal(document.querySelectorAll('.ma-column').length, 15);
byId('ma-control').checked = true;
byId('ma-control').dispatchEvent(new Event('change'));
assert.equal(candidates().length, 4);
byId('ma-reset').click();
assert.equal(byId('ma-order').textContent, 'A → B → C → D → E');
assert.equal(document.querySelectorAll('.ma-check-result').length, 0);
byId('ma-check').click();
assert.match(byId('ma-status').textContent, /does not match all three/);
byId('ma-reveal').click();
assert.deepEqual(candidates().slice(0, 3), vectors.slice(0, 3).map(v => v[1]));
assert.notEqual(candidates()[3], vectors[3][1]);
assert.match(byId('ma-score').textContent, /25 of 48/);
assert.equal(byId('ma-status').getAttribute('role'), 'status');
assert(document.querySelector('label[for="ma-selected"]'));
assert.match(byId('multiple-anagramming').textContent, /not a probability or confirmation/);
assert.match(byId('multiple-anagramming').textContent, /synthetic/);
assert.match(byId('multiple-anagramming').textContent, /1939.*1956/);
assert.match(byId('multiple-anagramming').textContent, /2017.*§3\.7/);
assert.equal(document.querySelector('.ma-sources a[href$="#gaines"]').getAttribute('href'), '../further-reading.html#gaines');
assert.equal(document.querySelector('.ma-sources a[href$="#holden"]').getAttribute('href'), '../further-reading.html#holden');
dom.window.close();
console.log('PASS multiple anagramming: 120 permutations, four fixed vectors, manual controls, shared-key limit and rendered sources.');
