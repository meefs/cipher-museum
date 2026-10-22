#!/usr/bin/env node
'use strict';
// Independent fixed vectors, algebraic properties, and actual page controls.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const pad = require('../js/pad-experiments.js');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/pad-experiments.js'), 'utf8');

function decimalFixture(api) {
  const v = api.decimalTrial('12345', '24680', '78901', '12345');
  assert.equal(v.c1, '80246');
  assert.equal(v.c2, '92581');
  assert.equal(v.difference, '98765');
  assert.equal(v.candidate, '24680');
  assert.match(v.meaning, /^Unknown/);
  // Ordinary subtraction would give 87665, not the carryless result.
  assert.notEqual(v.difference, String((80246 - 92581 + 100000) % 100000));
}
decimalFixture(pad);
assert.equal(pad.decimalCombine('00000', '11111', true), '99999');
assert.equal(pad.decimalCombine('99999', '11111', false), '00000');
assert.equal(pad.decimalTrial('12345', '13579', '78901', '12345').meaning, 'DAWN');
assert.notEqual(pad.decimalTrial('12345', '13579', '78901', '00000').candidate, '13579');
assert.equal(pad.lookup('00000').startsWith('Unknown'), true);
for (const bad of ['1234', '123456', '12 45', '-1234', '1e004', '<img>']) {
  assert.throws(() => pad.decimalCombine(bad, '12345', false), /five digits/);
}

// Sender encryption and receiver decryption cancel any pad, including wraparound.
// The attack itself accepts only ciphertext, location, and delta, not the key.
const message = 'ZEBRA';
const key = 'HODIZ';
const ciphertext = pad.letterCombine(message, key, false);
assert.equal(ciphertext, 'GSEZZ');
assert.equal(pad.tamper(ciphertext, 1, 1), 'HSEZZ');
assert.equal(pad.letterCombine('HSEZZ', key, true), 'AEBRA');
for (let position = 1; position <= message.length; position++) {
  for (let delta = 0; delta < 26; delta++) {
    const result = pad.letterCombine(pad.tamper(ciphertext, position, delta), key, true);
    for (let i = 0; i < message.length; i++) {
      const expected = i === position - 1
        ? String.fromCharCode(65 + ((message.charCodeAt(i) - 65 + delta) % 26)) : message[i];
      assert.equal(result[i], expected, `position ${position}, delta ${delta}, letter ${i}`);
    }
  }
}
assert.throws(() => pad.letterCombine('ABCDE', 'ABC', false), /exactly one/);
assert.throws(() => pad.tamper('ABCDE', 0, 1), /position/);
assert.throws(() => pad.tamper('ABCDE', 6, 1), /position/);
assert.throws(() => pad.tamper('ABCDE', 1, 26), /shift/);

function load(file) {
  const html = fs.readFileSync(path.join(root, 'ciphers', file), 'utf8');
  assert.match(html, /<script src="\.\.\/js\/pad-experiments\.js" defer><\/script>/);
  const dom = new JSDOM(html, { runScripts: 'outside-only' });
  dom.window.eval(source);
  dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  const doc = dom.window.document;
  return {
    doc, dom,
    get: id => doc.getElementById(id),
    set(id, value) {
      const input = doc.getElementById(id);
      input.value = value;
      input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    },
    click: id => doc.getElementById(id).click()
  };
}
{
  const p = load('venona.html');
  assert.equal(p.get('decimal-cipher-a').textContent, '80246');
  assert.equal(p.get('decimal-cipher-b').textContent, '92581');
  assert.equal(p.get('decimal-difference').textContent, '98765');
  assert.equal(p.get('decimal-candidate').textContent, '24680');
  assert.match(p.get('decimal-meaning').textContent, /Unknown/);
  assert.match(p.get('decimal-steps').textContent, /Column 5: 5 \+ 1 → 6; 0 \+ 1 → 1; 6 − 1 → 5/);
  p.set('decimal-b', '13579');
  assert.equal(p.get('decimal-meaning').textContent, 'DAWN');
  p.set('decimal-guess', '00000');
  assert.notEqual(p.get('decimal-candidate').textContent, '13579');
  p.set('decimal-pad', '12x45');
  assert.equal(p.get('decimal-results').hidden, true);
  assert.match(p.get('decimal-error').textContent, /five digits/);
  p.set('decimal-pad', '78901');
  p.click('decimal-run');
  assert.equal(p.get('decimal-results').hidden, false);
  const text = p.get('venona-decimal-experiment').textContent;
  assert.match(text, /invented five-digit groups/);
  assert.match(text, /not a historical message/);
  assert.match(text, /A wrong guess/);
  assert.ok(p.doc.querySelector('a[href*="venona_story.pdf"]'));
  assert.ok(p.get('venona-pad-reuse-demo'), 'existing XOR exercise preserved');
  assert.doesNotMatch(p.doc.body.textContent, /mutually known-plaintext constraints/);
  assert.match(p.doc.body.textContent, /XOR panel shows the analogous cancellation in binary/);
  p.dom.window.close();
}
{
  const p = load('one-time-pad.html');
  assert.equal(p.get('tamper-hide').checked, true);
  assert.equal(p.get('tamper-sender').hidden, true);
  assert.equal(p.get('tamper-cipher').textContent, 'GSEZZ');
  assert.equal(p.get('tamper-altered').textContent, 'HSEZZ');
  assert.equal(p.get('tamper-received').textContent, 'Hidden in attacker view');
  assert.doesNotMatch(p.get('tamper-equation').textContent, /ZEBRA|HODIZ|AEBRA/);
  p.click('tamper-hide');
  assert.equal(p.get('tamper-sender').hidden, false);
  assert.equal(p.get('tamper-original').textContent, 'ZEBRA');
  assert.equal(p.get('tamper-received').textContent, 'AEBRA');
  p.set('tamper-position', '5');
  p.set('tamper-delta', '25');
  assert.equal(p.get('tamper-received').textContent, 'ZEBRZ');
  p.set('tamper-delta', '0');
  assert.equal(p.get('tamper-received').textContent, 'ZEBRA');
  assert.match(p.get('tamper-outcome').textContent, /unchanged/);
  p.set('tamper-message', 'HELLO');
  p.set('tamper-pad', 'XMCKL');
  assert.equal(p.get('tamper-cipher').textContent, 'EQNVZ');
  p.set('tamper-pad', 'XM');
  assert.equal(p.get('tamper-results').hidden, true);
  assert.match(p.get('tamper-error').textContent, /exactly one/);
  p.set('tamper-pad', 'XMCKL');
  p.set('tamper-delta', '');
  assert.equal(p.get('tamper-results').hidden, true);
  assert.match(p.get('tamper-error').textContent, /both a position and a shift/);
  const text = p.get('otp-tampering-experiment').textContent;
  assert.match(text, /does not authenticate the message/);
  assert.match(text, /does not mean the attacker can create a meaningful sentence/);
  assert.match(text, /fixed example/);
  assert.match(text, /§4\.1\.2/);
  for (const input of p.doc.querySelectorAll('#otp-tampering-experiment input')) {
    assert.ok(p.doc.querySelector(`label[for="${input.id}"]`));
  }
  p.dom.window.close();
}

// Prove the arithmetic guard rejects a plausible wrong implementation. No tracked
// file is changed: this mutant computes the whole group with carries/borrows.
{
  const context = { module: { exports: {} } };
  vm.runInNewContext(source.replace(
    "return a.split('').map(function (digit, i) {",
    "return String(mod(Number(a) + (subtract ? -1 : 1) * Number(b), 100000)).padStart(5, '0'); return a.split('').map(function (digit, i) {"
  ), context);
  assert.throws(() => decimalFixture(context.module.exports), assert.AssertionError,
    'decimal fixture must catch ordinary integer arithmetic');
}
{
  const context = { module: { exports: {} } };
  vm.runInNewContext(source.replace('return changed.join(\'\');', 'return ciphertext;'), context);
  assert.throws(() => assert.equal(context.module.exports.tamper('GSEZZ', 1, 1), 'HSEZZ'),
    assert.AssertionError, 'tampering fixture must catch a control that changes nothing');
}
console.log('Pad experiments: fixed vectors, tampering properties, UI controls, source/limit labels, and mutation guard passed.');
