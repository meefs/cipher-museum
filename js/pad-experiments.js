/* Small, original teaching fixtures; not historical traffic or secure messaging. */
(function (root) {
  'use strict';
  function mod(n, base) { return ((n % base) + base) % base; }
  function decimalGroup(value) {
    if (!/^\d{5}$/.test(value)) throw new Error('Enter exactly five digits in each decimal field, including leading zeroes.');
    return value;
  }
  function decimalCombine(a, b, subtract) {
    decimalGroup(a); decimalGroup(b);
    return a.split('').map(function (digit, i) {
      return String(mod(Number(digit) + (subtract ? -1 : 1) * Number(b[i]), 10));
    }).join('');
  }
  var sampleBook = Object.freeze({ '12345': 'MEET', '13579': 'DAWN', '97531': 'COURIER' });
  function lookup(group) { return sampleBook[group] || 'Unknown — no meaning supplied in this invented codebook'; }
  function decimalTrial(a, b, pad, guess) {
    var c1 = decimalCombine(a, pad, false), c2 = decimalCombine(b, pad, false);
    var difference = decimalCombine(c1, c2, true);
    var candidate = decimalCombine(guess, difference, true);
    return { c1: c1, c2: c2, difference: difference, candidate: candidate, meaning: lookup(candidate) };
  }
  function letters(value) {
    if (!/^[A-Z]{1,32}$/.test(value)) throw new Error('Use 1–32 uppercase A–Z letters, without spaces, for the message and pad.');
    return value;
  }
  function letterCombine(a, b, subtract) {
    letters(a); letters(b);
    if (a.length !== b.length) throw new Error('The demonstration pad must have exactly one letter for every message letter.');
    return a.split('').map(function (letter, i) {
      return String.fromCharCode(65 + mod(letter.charCodeAt(0) - 65 + (subtract ? -1 : 1) * (b.charCodeAt(i) - 65), 26));
    }).join('');
  }
  function tamper(ciphertext, position, delta) {
    letters(ciphertext);
    if (!Number.isInteger(position) || position < 1 || position > ciphertext.length) throw new Error('Choose a position from 1 to the message length.');
    if (!Number.isInteger(delta) || delta < 0 || delta > 25) throw new Error('Choose a whole-number shift from 0 to 25.');
    var changed = ciphertext.split('');
    changed[position - 1] = String.fromCharCode(65 + mod(changed[position - 1].charCodeAt(0) - 65 + delta, 26));
    return changed.join('');
  }
  function mountDecimal(doc) {
    if (!doc.getElementById('venona-decimal-experiment')) return;
    function el(id) { return doc.getElementById('decimal-' + id); }
    function render() {
      el('error').textContent = '';
      try {
        var a = el('a').value, b = el('b').value, pad = el('pad').value;
        var result = decimalTrial(a, b, pad, el('guess').value);
        el('results').hidden = false;
        el('cipher-a').textContent = result.c1;
        el('cipher-b').textContent = result.c2;
        el('difference').textContent = result.difference;
        el('candidate').textContent = result.candidate;
        el('meaning').textContent = result.meaning;
        el('steps').textContent = a.split('').map(function (digit, i) {
          return 'Column ' + (i + 1) + ': ' + digit + ' + ' + pad[i] + ' → ' + result.c1[i] +
            '; ' + b[i] + ' + ' + pad[i] + ' → ' + result.c2[i] +
            '; ' + result.c1[i] + ' − ' + result.c2[i] + ' → ' + result.difference[i];
        }).join('\n') + '\nAll results are reduced modulo 10, independently in each column.';
      } catch (e) {
        el('results').hidden = true;
        el('error').textContent = e.message;
      }
    }
    el('run').addEventListener('click', render);
    ['a', 'b', 'pad', 'guess'].forEach(function (id) {
      el(id).addEventListener('input', render);
    });
    render();
  }
  function mountTampering(doc) {
    if (!doc.getElementById('otp-tampering-experiment')) return;
    function el(id) { return doc.getElementById('tamper-' + id); }
    function render() {
      var hidden = el('hide').checked;
      el('sender').hidden = hidden;
      el('error').textContent = '';
      try {
        var plain = el('message').value, pad = el('pad').value;
        var ciphertext = letterCombine(plain, pad, false);
        el('position').max = String(plain.length);
        if (!el('position').value || !el('delta').value) throw new Error('Enter both a position and a shift.');
        var position = Number(el('position').value), delta = Number(el('delta').value);
        var altered = tamper(ciphertext, position, delta);
        var received = letterCombine(altered, pad, true);
        el('results').hidden = false;
        el('cipher').textContent = ciphertext;
        el('altered').textContent = altered;
        el('original').textContent = hidden ? 'Hidden in attacker view' : plain;
        el('received').textContent = hidden ? 'Hidden in attacker view' : received;
        el('outcome').textContent = delta === 0
          ? 'Shift 0 leaves every letter unchanged.'
          : 'The receiver’s letter at position ' + position + ' shifts by ' + delta + ' modulo 26. Every other letter stays unchanged.';
        el('equation').textContent = hidden
          ? 'At the chosen position: (C + Δ − K) mod 26 = (P + Δ) mod 26. No knowledge of P or K is needed to apply Δ to C.'
          : 'At position ' + position + ': ' + plain[position - 1] + '(' + (plain.charCodeAt(position - 1) - 65) + ') + ' + delta +
            ' mod 26 → ' + received[position - 1] + '(' + (received.charCodeAt(position - 1) - 65) + ').';
      } catch (e) {
        el('results').hidden = true;
        el('error').textContent = e.message;
      }
    }
    el('run').addEventListener('click', render);
    ['message', 'pad', 'position', 'delta'].forEach(function (id) { el(id).addEventListener('input', render); });
    el('hide').addEventListener('change', render);
    render();
  }
  function mount(doc) { mountDecimal(doc); mountTampering(doc); }
  var api = { decimalCombine: decimalCombine, decimalTrial: decimalTrial, lookup: lookup, letterCombine: letterCombine, tamper: tamper, mount: mount };
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root.document) {
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', function () { mount(root.document); });
    else mount(root.document);
  }
})(typeof window !== 'undefined' ? window : globalThis);
