#!/usr/bin/env node
'use strict';
// Review C5–C8: test visible attribution, model distinctions and actual ECDSA readouts.
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { JSDOM } = require('jsdom');
const ROOT = process.env.MUSEUM_REVIEW_ROOT || path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const text = html => new JSDOM(html).window.document.documentElement.textContent.replace(/\s+/g, ' ');
let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; }
  catch (error) { failed++; console.error('FAIL ' + name + ': ' + error.message); }
}

test('Lorenz separates manual recovery, structure inference and later machinery', () => {
  const s = text(read('ciphers/lorenz.html'));
  assert.match(s, /Tiltman.{0,140}recover.{0,160}(?:1941|by hand)/);
  assert.match(s, /Tutte and the Research Section.{0,170}early 1942/);
  assert.match(s, /(?:operational.{0,50}February 1944|February 1944.{0,50}operational)/);
  assert.doesNotMatch(s, /Required Colossus|Colossus \(1943\)/);
  assert.match(s, /readable output suggests a candidate placement, but does not prove the guess/i);
  assert.match(read('ciphers/lorenz.html'), /tiltman\.pdf/);
});
test('Tutte biography does not date completed reconstruction to 1941', () => {
  const html = read('ciphers/bill-tutte.html'), s = text(html);
  assert.match(s, /Tiltman.{0,180}recover/);
  assert.match(s, /structure, by early 1942/);
  assert.doesNotMatch(s, /reconstruction, 1941|from ciphertext alone, 1941/);
  const d = new JSDOM(html).window.document;
  assert.match(d.querySelector('meta[name="description"]').content, /Tiltman/);
});
for (const page of ['halls/codebreakers.html', 'halls/machines.html', 'timeline.html']) {
  test(page + ' carries the three-stage chronology', () => {
    const s = text(read(page));
    assert.match(s, /Tiltman.{0,180}1941/);
    assert.match(s, /early 1942/);
    assert.match(s, /February 1944/);
    assert.doesNotMatch(s, /Colossus \(1943\)/);
  });
}
test('Zimmermann metadata describes successive transmission legs', () => {
  const html = read('ciphers/zimmermann.html'), dom = new JSDOM(html), d = dom.window.document;
  for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
    const description = d.querySelector(selector).content;
    assert.match(description, /0075 to Washington, then re-encoded in 13040 for Mexico/);
    assert.doesNotMatch(description, /two-stage|3DES|Triple DES/i);
  }
  assert.match(d.body.textContent, /teaching choice, not a reconstruction/);
  assert.match(html, /the_zimmermann_telegram\.pdf/);
  dom.window.close();
});
test('ECDSA distinguishes deterministic nonce derivation from other protections', () => {
  const html = read('ciphers/ecdsa.html'), s = text(html);
  assert.match(s, /not guarantee collision-free nonces/);
  assert.match(s, /amount and structure of leakage, measurement noise and the number of signatures/);
  assert.match(s, /does not remove side-channel or fault risks/);
  assert.match(s, /does not implement RFC 6979/);
  assert.doesNotMatch(s, /different messages cannot collide|partial leakage is fatal|coincidence never happens|always in the same place/);
  assert.match(html, /rfc6979\.html#section-4/);
  assert.doesNotMatch(text(read('halls/modern-crypto.html')), /always at the same one-time nonce/);
});
test('ECDSA page preserves known nonce recovery and qualifies both verification outcomes', () => {
  const dom = new JSDOM(read('ciphers/ecdsa.html'), { runScripts: 'outside-only' });
  const w = dom.window, d = w.document;
  w.eval(fs.readFileSync(path.resolve(__dirname, '../js/protocol-math.js'), 'utf8'));
  for (const script of d.querySelectorAll('script:not([src])')) w.eval(script.textContent);
  d.getElementById('reuse').click();
  assert.deepEqual(JSON.parse(JSON.stringify(w.__reuse.s1)), { r: 54, s: 46 });
  assert.deepEqual(JSON.parse(JSON.stringify(w.__reuse.s2)), { r: 54, s: 78 });
  d.getElementById('attack').click();
  const recovery = d.getElementById('atkOut').textContent;
  assert.match(recovery, /k = .* = 7/);
  assert.match(recovery, /d = .* = 42/);
  // Traverse the actual visitor controls until both toy outcomes occur.
  const outcomes = new Set();
  for (let h = 0; h < 103; h++) {
    d.getElementById('h').value = String(h);
    d.getElementById('sign').click();
    if (/degenerate/i.test(d.getElementById('sigOut').textContent)) continue;
    d.getElementById('verifyOther').click();
    const output = d.getElementById('sigOut').textContent;
    assert.match(output, /negligibly likely.*not mathematically impossible/);
    assert.doesNotMatch(output, /never happens|as it must be/);
    if (/accepted/.test(output)) outcomes.add('accepted');
    if (/REJECTED/.test(output)) outcomes.add('rejected');
  }
  assert.deepEqual([...outcomes].sort(), ['accepted', 'rejected']);
  dom.window.close();
});
test('Diffie–Hellman states the DLP-solver to CDH-solver implication only', () => {
  const html = read('ciphers/diffie-hellman.html'), s = text(html);
  assert.match(s, /computational Diffie–Hellman problem \(CDH\)/);
  assert.match(s, /A DLP solver gives a CDH solver/);
  assert.match(s, /converse is not established for arbitrary groups/);
  assert.doesNotMatch(s, /cannot recover a, b, or K without solving|Security rests on the discrete logarithm problem/);
  assert.match(html, /hall-of-foundations\/reduction\.html/);
  assert.match(s, /Dan Boneh and Victor Shoup, A Graduate Course in Applied Cryptography, version 0.6/);
  assert.doesNotMatch(html, /href="https:\/\/toc\.cryptobook\.us/);
  // Independent integer arithmetic pins the explanatory toy vector.
  assert.equal((5n ** 6n) % 23n, 8n);
  assert.equal((5n ** 15n) % 23n, 19n);
  assert.equal((19n ** 6n) % 23n, 2n);
  assert.equal((8n ** 15n) % 23n, 2n);
  assert.match(s, /19[^.]*mod 23 = 2/);
});
console.log(`history-modern-review: ${passed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
