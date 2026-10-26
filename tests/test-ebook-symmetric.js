#!/usr/bin/env node
'use strict';
// Independent arithmetic oracles for the static EBR-06/07/08/20/21 examples.
// No attack engine or simulated trace generator is added to the Museum.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = file => new JSDOM(fs.readFileSync(path.join(root, file), 'utf8')).window.document;
const aes = read('ciphers/aes.html');
const des = read('ciphers/des.html');
const evidence = read('lab/modern-attack-evidence.html');
const rows = (doc, id) => [...doc.querySelectorAll(`#${id} tbody tr`)].map(tr => [...tr.cells].map(c => c.textContent.trim()));

// DES S1: outer bits select a row; inner four select a column.
const s1 = [
  [14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7],
  [0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8],
  [4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0],
  [15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13]
];
const S = x => s1[((x & 32) >> 4) | (x & 1)][(x >> 1) & 15];
const ddt = Array.from({length:64}, (_, delta) => {
  const counts = Array(16).fill(0);
  for (let x = 0; x < 64; x++) counts[S(x) ^ S(x ^ delta)]++;
  assert.equal(counts.reduce((a,b) => a+b), 64);
  if (delta) assert.ok(counts.every(n => n % 2 === 0));
  return counts;
});
assert.deepEqual(ddt[0], [64, ...Array(15).fill(0)]);
for (const [delta, count, fraction] of rows(des, 's1-ddt')) {
  assert.equal(+count, ddt[0x34][parseInt(delta, 16)]);
  const [n, d = 1] = fraction.split('/').map(Number);
  assert.equal(n / d, +count / 64);
}
const survivors = rows(des, 's1-key-filter').map(([inputs, delta, shown]) => {
  const [a, b] = inputs.split(',').map(x => parseInt(x, 16));
  const actual = Array.from({length:64}, (_, k) => k).filter(k => (S(a ^ k) ^ S(b ^ k)) === parseInt(delta, 16));
  assert.deepEqual(shown.split(',').map(x => parseInt(x, 16)), actual);
  return actual;
});
assert.deepEqual(survivors[0].filter(x => survivors[1].includes(x)), [0x17, 0x23]);
assert.match(des.querySelector('#s1-differential').parentElement.textContent, /\{17, 23\}/);

// Exact marginal distributions and centered products over every byte/mask.
const hw = x => x.toString(2).replaceAll('0', '').length;
const binomial = [1,8,28,56,70,56,28,8,1];
const covariance = [];
for (let v = 0; v < 256; v++) {
  const histA = Array(9).fill(0), histB = Array(9).fill(0);
  let centeredSum = 0;
  for (let m = 0; m < 256; m++) {
    const a = hw(m), b = hw(v ^ m);
    histA[a]++; histB[b]++;
    centeredSum += (a - 4) * (b - 4);
  }
  assert.deepEqual(histA, binomial); assert.deepEqual(histB, binomial);
  assert.equal(centeredSum, 256 * (2 - hw(v) / 2));
  covariance[v] = centeredSum / 256;
}
for (const [v, weight, cov] of rows(aes, 'mask-covariance')) {
  assert.equal(+weight, hw(+v));
  assert.equal(Number(cov.replace('−', '-')), covariance[+v]);
}

// MDS criterion: independently check every square minor of AES MixColumns.
const mul = (a, b) => {
  let out = 0;
  for (; b; b >>= 1) {
    if (b & 1) out ^= a;
    a = (a << 1) ^ ((a & 128) ? 0x11b : 0);
  }
  return out;
};
const matrix = [[2,3,1,1],[1,2,3,1],[1,1,2,3],[3,1,1,2]];
const subsets = Array.from({length:15}, (_, i) => [0,1,2,3].filter(j => (i+1) & (1 << j)));
function det(m) {
  if (m.length === 1) return m[0][0];
  // In characteristic two, determinant signs coincide.
  return m[0].reduce((value, x, j) => value ^ mul(x, det(m.slice(1).map(row => row.filter((_, k) => k !== j)))), 0);
}
let minors = 0;
for (const rs of subsets) for (const cs of subsets) if (rs.length === cs.length) {
  assert.notEqual(det(rs.map(r => cs.map(c => matrix[r][c]))), 0);
  minors++;
}
assert.equal(minors, 69);
for (let column = 0; column < 4; column++) {
  assert.equal(new Set([0,1,2,3].map(row => (column - row + 4) % 4)).size, 4);
}
assert.match(aes.querySelector('#wide-trail').parentElement.textContent, /at least 25 active S-boxes in an individual nonzero four-round differential trail/);

// Read the exponent from actual markup, retaining phase and variant labels.
const resourceRows = [...evidence.querySelectorAll('#des-resources tbody tr')];
assert.deepEqual(resourceRows.map(r => +r.querySelector('sup').textContent), [47,36,37,55]);
assert.match(resourceRows[2].textContent, /Analysis work.*excluding collection/);
assert.match(resourceRows[3].textContent, /Separate known-plaintext variant/);
assert.equal(2 ** 35 * 2 ** 13 / 2, 2 ** 47);
assert.equal(2 ** 35 * 4, 2 ** 37);
assert.match(evidence.querySelector('#power-leakage').textContent, /simulated leakage/);
assert.match(aes.querySelector('#masking').parentElement.textContent, /fresh, independent, uniformly random/);

// New links must reach the existing labs; local deep links must resolve.
for (const [doc, slug] of [[aes,'aes-anatomy'],[aes,'masked-core'],[aes,'power-trace'],[des,'biham-lens']]) {
  assert.ok(doc.querySelector(`a[href="https://systemslibrarian.github.io/crypto-lab-${slug}/"]`));
}
for (const [file, doc] of [['ciphers/aes.html', aes], ['ciphers/des.html', des], ['lab/modern-attack-evidence.html', evidence]]) {
  for (const a of doc.querySelectorAll('a[href*="#"]')) {
    const href = a.getAttribute('href');
    if (/^https?:/.test(href)) continue;
    const [target, id] = href.split('#');
    const destination = target ? read(path.relative(root, path.resolve(root, path.dirname(file), target))) : doc;
    assert.ok(destination.getElementById(id), `${file}: missing anchor ${href}`);
  }
}
console.log('PASS: displayed DES fixtures; 65,536 mask pairs; 69 AES minors; phase accounting; lab links and local anchors');
