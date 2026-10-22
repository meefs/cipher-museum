#!/usr/bin/env node
'use strict';

// Exercise the real page controls, then independently check the published Hill
// examples. A plausible-looking plaintext must not be announced as verified.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const ROOT = path.resolve(__dirname, '..');
const SOURCE = process.env.CLASSICAL_REVIEW_ROOT || ROOT;
const read = name => fs.readFileSync(path.join(SOURCE, name), 'utf8');
const html = read('cryptanalysis.html');
const dom = new JSDOM(html, { runScripts: 'outside-only' });
const { window } = dom;
const doc = window.document;
for (const script of doc.querySelectorAll('script:not([src])')) window.eval(script.textContent);
window.eval(fs.readFileSync(path.join(ROOT, 'js/ui-delegates.js'), 'utf8'));
const set = (id, value) => { if (doc.getElementById(id)) doc.getElementById(id).value = value; };
const text = id => doc.getElementById(id).textContent;
const click = fn => doc.querySelector('[data-fn="' + fn + '"]').click();
function known(plain, cipher, period = '') {
  set('kpaPlain', plain); set('kpaCipher', cipher); set('kpaPeriod', period);
  click('runKPA');
  return text('kpaResult');
}
function crib(cipher, guess) {
  set('cribCipher', cipher); set('cribWord', guess); click('runCribDrag');
  return text('cribResult');
}

try {
  doc.getElementById('tab-btn-kpa').click();
  assert.equal(doc.getElementById('tab-kpa').hidden, false, 'the KPA tab remains reachable');
  const partial = known('ATTACK', 'LXFOPVEFRNHR');
  assert.match(partial, /Observed keystream \(6 positions\): LEMONL/);
  assert.match(partial, /Supported plaintext span: ATTACK/);
  assert.match(partial, /Unknown remainder: 6 ciphertext positions/);
  assert.doesNotMatch(partial, /ATTACKTBFZUG|decrypt full ciphertext|Verification|Repeating key detected/i,
    'the unobserved tail must not be extrapolated and called verified');
  assert.match(partial, /Longer periods and nonrepeating keys remain possible/);

  // Even a real repeated prefix is compatible with an arbitrary later key.
  const repeated = known('AAAAAA', 'ABCABCXYZ');
  assert.match(repeated, /Period hypothesis: 3 \(fragment ABC\)/);
  assert.match(repeated, /does not prove the complete key repeats/);
  assert.match(repeated, /Unknown remainder: 3/);
  assert.doesNotMatch(repeated, /Unverified extension/, 'extension requires an explicit assumption');
  const ambiguous = known('AA', 'ABCD');
  assert.match(ambiguous, /Observed keystream \(2 positions\): AB/);
  assert.match(ambiguous, /Unknown remainder: 2/);
  assert.doesNotMatch(ambiguous, /Assumed key/, 'a short observation does not identify a complete key');

  const assumed = known('ATTACK', 'LXFOPVEFRNHR', '5');
  assert.match(assumed, /Assumed key: LEMON \(period 5\)/);
  assert.match(assumed, /Unverified extension under this assumption: ATDAWN/);
  assert.match(assumed, /independent plaintext or other evidence/);
  assert.match(known('ATTACK', 'LXFOPVEFRNHR', '3'), /Period 3 rejected/);
  assert.match(known('ATTACK', 'LXFOPVEFRNHR', '7'), /Cannot test that period/);
  assert.match(known('ATTACK', 'LXFOPVEFRNHR', '2.5'), /Cannot test that period/);
  assert.match(known('ATTACK', 'LXFOPVEFRNHR', '0'), /Cannot test that period/);
  // Real browsers retain badInput for a typed, unfinished number such as 1e,
  // although .value is empty. JSDOM needs that browser validity state supplied.
  const periodInput = doc.getElementById('kpaPeriod');
  Object.defineProperty(periodInput, 'validity', { value: { badInput: true }, configurable: true });
  assert.match(known('ATTACK', 'LXFOPVEFRNHR', ''), /Cannot test that period/);
  delete periodInput.validity;
  assert.match(known('ATTACKATDAWN', 'LXFOPVEFRNHR'), /Period hypothesis: 5 \(fragment LEMON\)/);
  assert.match(known('ATTACKATDAWN', 'LXFOPV'), /Extra plaintext has no matching ciphertext/);
  assert.doesNotMatch(known('ATTACKATDAWN', 'LXFOPV'), /Unknown remainder/);
  assert.match(known('', 'LXFOPV'), /Enter both/);
  assert.match(known('attack!', 'lxfopv'), /LEMONL/, 'the stated A–Z projection remains consistent');

  doc.getElementById('tab-btn-crib').click();
  assert.equal(doc.getElementById('tab-crib').hidden, false, 'the crib tab remains reachable');
  assert.match(crib('LXFOPV', 'ATTACK'), /Key fragment = LEMONL/, 'mod26 subtraction matches the independent vector');
  for (const nonperiodic of ['ABACBC', 'AAAABBBB']) {
    assert.doesNotMatch(crib(nonperiodic, 'A'.repeat(nonperiodic.length)), /Period \d+ fits|★ possible match/,
      'few distinct symbols are not a repeated period: ' + nonperiodic);
  }
  assert.match(crib('ABCABC', 'AAAAAA'), /Period 3 fits this fragment \(hypothesis\)/);
  assert.match(crib('ABABABAB', 'AAAAAAAA'), /Period 2 fits this fragment \(hypothesis\)/);
  assert.match(crib('AAAA', 'AAAA'), /Period 1 fits/);
  assert.match(crib('ABC', 'LONGER'), /Crib is longer/);
  const cribText = text('tab-crib');
  assert.match(cribText, /Vigenère or running-key/);
  assert.match(cribText, /rotor and plugboard constraints/);
  assert.match(cribText, /not confirmation/);
  assert.doesNotMatch(cribText, /XOR or subtraction produces readable text|This is how Bletchley Park broke Enigma/);
} finally {
  window.close();
}

// Independent arithmetic for the page's block-column convention: C = K P.
const mod = n => ((n % 26) + 26) % 26;
const multiply = (a, b) => [
  mod(a[0] * b[0] + a[1] * b[2]), mod(a[0] * b[1] + a[1] * b[3]),
  mod(a[2] * b[0] + a[3] * b[2]), mod(a[2] * b[1] + a[3] * b[3])
];
const K = [3, 3, 2, 5];
const P = [7, 11, 8, 11]; // columns HI, LL
const C = [19, 14, 2, 25]; // columns TC, OZ
assert.deepEqual(multiply(K, P), C);
const inverseP = [25, 1, 22, 23]; // determinant -11; its inverse is 7 mod26
assert.deepEqual(multiply(P, inverseP), [1, 0, 0, 1]);
assert.deepEqual(multiply(C, inverseP), K, 'two suitable blocks recover the documented key');
const ambiguousP = [0, 0, 0, 1]; // columns AA, AB
const otherK = [5, 3, 2, 5];
assert.deepEqual(multiply(K, ambiguousP), [0, 3, 0, 5]);
assert.deepEqual(multiply(otherK, ambiguousP), [0, 3, 0, 5], 'these observations do not identify a unique key');
const engines = require(path.join(ROOT, 'js/ciphers/all-engines.js'));
assert.equal(engines.hill.encode('HILL', '3,3,2,5'), 'TCOZ');
assert.equal(engines.hill.encode('AAAB', '3,3,2,5'), 'AADF');
assert.equal(engines.hill.encode('AAAB', '5,3,2,5'), 'AADF');

function pageText(name) {
  const page = new JSDOM(read(name));
  const result = page.window.document.body.textContent.replace(/\s+/g, ' ');
  page.window.close();
  return result;
}
const hill = pageText('ciphers/hill.html');
assert.match(hill, /gcd\(det\(P\), 26\) = 1/);
assert.match(hill, /Merely knowing n blocks does not guarantee/);
assert.match(hill, /AA and AB both map to AA and DF/);
assert.match(hill, /X\/Q\/Z escaping/);
assert.doesNotMatch(hill, /two known pairs are sufficient/);
const analysis = pageText('cryptanalysis.html');
assert.match(analysis, /gcd\(det\(P\), 26\) = 1/);
assert.match(analysis, /HILL → TCOZ/);
assert.doesNotMatch(analysis, /just two known plaintext-ciphertext pairs|two matched pairs give the Hill matrix/);
const running = pageText('ciphers/running-key.html');
assert.match(running, /does not give the perfect secrecy/);
assert.match(running, /Even without finding the book, statistical attacks/);
assert.match(running, /uniformly random, independent of the message, and used only once/);
assert.doesNotMatch(running, /statistically similar to a one-time pad|same statistical properties as the one-time pad|Security depends entirely on the key text/);
for (const name of ['ciphers/hill.html', 'ciphers/running-key.html']) {
  assert.match(read(name), /further-reading\.html#holden/, name + ' links to the reading trail');
}
console.log('Classical review: supported keystreams, real crib periods, running-key limits, and Hill recovery passed.');
