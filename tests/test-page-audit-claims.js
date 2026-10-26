#!/usr/bin/env node
'use strict';
// Public claims must agree across prose, fact boxes and metadata.
// The mutation checks demonstrate that restoring an old error is rejected.
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
function visible(html) {
  const dom = new JSDOM(html), d = dom.window.document;
  d.querySelectorAll('script,style').forEach(e => e.remove());
  const s = [d.body.textContent, ...Array.from(d.querySelectorAll('meta[content]'), e => e.content)].join(' ').replace(/\s+/g, ' ');
  dom.window.close();
  return s;
}
const checks = [
  ['ciphers/joan-clarke.html', s => {
    assert.match(s, /MBE 1946/);
    assert.doesNotMatch(s, /MBE 1947|Developed Banburismus|continuous Naval Enigma breaks/);
  }, 'MBE 1947'],
  ['ciphers/gchq-trio.html', s => {
    assert.match(s, /Companion of the Order of the Bath \(CB\) in 2008/);
    assert.doesNotMatch(s, /CMG 2008|St Michael and St George|No one knew for 27 years/);
  }, 'Clifford Cocks: CMG 2008'],
  ['ciphers/bill-tutte.html', s => {
    assert.match(s, /keystream first recovered by John Tiltman/);
    assert.doesNotMatch(s, /two identical messages alone|near-identical pair of ciphertexts|relay-based systems/);
  }, 'He deduced the machine from two identical messages alone.'],
  ['ciphers/station-hypo.html', s => {
    assert.match(s, /not a decrypted Japanese naval attack plan/);
    assert.doesNotMatch(s, /attack .*came through a diplomatic channel|carriers Japan could not replace/);
  }, 'The Pearl Harbor attack came through a diplomatic channel.'],
  ['ciphers/chinese-telegraph.html', s => {
    assert.match(s, /digit by digit modulo 10, without carries/);
    assert.match(s, /modulo 10,000, with carries/);
    assert.match(s, /invented A–Z table/);
    assert.doesNotMatch(s, /mainland Chinese passports, and Taiwanese name registrations all carry|precisely the technique Rochefort/);
  }, 'Hong Kong identity cards, mainland Chinese passports, and Taiwanese name registrations all carry CCC numbers.'],
  ['ciphers/fractionated-morse.html', s => {
    assert.match(s, /26 of the 27 possible triples/);
    assert.match(s, /removing spaces and punctuation/);
    assert.doesNotMatch(s, /~1880s/);
  }, 'Invented ~1880s.'],
  ['ciphers/one-time-pad.html', s => {
    assert.match(s, /no random-source provenance claimed/);
    assert.match(s, /ciphertext does not change the prior probabilities/i);
    assert.doesNotMatch(s, /from true random source|Violate any condition → security collapses/);
  }, 'This fixed example comes from true random source — dice, radiation, etc.'],
  ['ciphers/vernam.html', s => {
    assert.match(s, /pseudorandom generator instead supports computational security/);
    assert.match(s, /decimal additive pages/);
    assert.doesNotMatch(s, /non-random\s*→ Vigenère-equivalent/);
  }, 'Repeating or non-random → Vigenère-equivalent (breakable)'],
  ['ciphers/cardano-grille.html', s => {
    // Independent combinatorial calculation pins the actual seven-hole example.
    let c = 1; for (let i = 1; i <= 7; i++) c = c * (26 - i) / i;
    assert.equal(c, 480700);
    assert.match(s, /seven holes/);
    assert.match(s, /C\(25,7\) = 480,700/);
    assert.doesNotMatch(s, /every past and future message becomes readable/);
  }, 'Once captured, every past and future message becomes readable.'],
  ['ciphers/vic.html', s => {
    assert.match(s, /not interoperable with historical VIC traffic/);
    assert.match(s, /two ordinary columnar transpositions/);
    assert.doesNotMatch(s, /resisted all NSA attacks|most complex and secure pencil-and-paper cipher/);
  }, 'The cipher resisted all NSA attacks.']
];
for (const [file, check, oldError] of checks) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  check(visible(html));
  const regressed = html.replace('</body>', `<p>${oldError}</p></body>`);
  assert.throws(() => check(visible(regressed)), assert.AssertionError, `${file}: old error escaped the guard`);
}
console.log(`page-audit-claims: ${checks.length} page checks and ${checks.length} deliberately regressed examples passed`);
