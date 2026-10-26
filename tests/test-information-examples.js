'use strict';
// Run with node tests/test-information-examples.js.
// Check the live IC result and independently derive the static distribution examples.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-10, `${a} != ${b}`);
const entropy = ps => ps.reduce((h, p) => h - (p ? p * Math.log2(p) : 0), 0);
const stripScripts = html => html.replace(/<script\b[^>]*\bsrc=["'][^"']+["'][^>]*><\/script>/gi, '');
const wb = new JSDOM(stripScripts(read('lab/workbench.html')), {
  runScripts: 'dangerously', url: 'https://example.test/lab/workbench.html'
});
const d = wb.window.document;
function input(text) {
  d.getElementById('wbInput').value = text;
  d.getElementById('wbInput').dispatchEvent(new wb.window.Event('input'));
  return { value: d.getElementById('icVal').textContent, hint: d.getElementById('icHint').textContent };
}
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const repeated = input(alphabet.repeat(100));
assert.equal(repeated.value, (26 * 100 * 99 / (2600 * 2599)).toFixed(4));
assert.equal(repeated.value, '0.0381');
assert.match(repeated.hint, /balanced deterministic text/);
assert.deepEqual(input([...alphabet].map(c => c.repeat(100)).join('')), repeated);
assert.equal(input('A'.repeat(100)).value, '1.0000');
assert.match(input('A'.repeat(100)).hint, /Higher observed coincidence/);
assert.match(input('ABCDEFGHIJKLMNOPQRST'.repeat(10)).hint, /above the uniform-letter reference/);
for (const text of ['', 'a', '!?', 'Aa', 'ABCDE', alphabet.repeat(100), 'A'.repeat(100)]) {
  const result = input(text);
  assert.doesNotMatch(result.hint, /monoalphabetic|polyalphabetic|natural language|short key|or random/);
}
assert.equal(input('a').value, '—');
assert.equal(input('aA').value, '1.0000');
wb.window.close();

const exhibit = new JSDOM(read('hall-of-foundations/entropy.html')).window.document;
assert.ok(exhibit.getElementById('entropy-rate'));
assert.ok(exhibit.getElementById('first-guess'));
assert.ok(exhibit.getElementById('privacy-amplification'));
// Enumerate all phases: every position is uniform but each entire block has only 26 possibilities.
for (const n of [1, 2, 3, 8]) {
  const blocks = new Map();
  for (let phase = 0; phase < 26; phase++) {
    const block = Array.from({ length: n }, (_, i) => alphabet[(phase + i) % 26]).join('');
    blocks.set(block, (blocks.get(block) || 0) + 1 / 26);
  }
  assert.equal(blocks.size, 26);
  near(entropy([...blocks.values()]), Math.log2(26));
  for (let position = 0; position < n; position++) {
    const counts = new Map();
    for (const [block, probability] of blocks) counts.set(block[position], (counts.get(block[position]) || 0) + probability);
    near(entropy([...counts.values()]), Math.log2(26));
  }
}
// Independent uniform blocks have 26^n equally likely outcomes (small n only).
for (const n of [1, 2, 3]) near(entropy(Array(26 ** n).fill(26 ** -n)), n * Math.log2(26));
assert.match(exhibit.getElementById('entropy-rate-table').textContent, /0 bits per letter/);
// Mixture formula against full distributions, including both degenerate endpoints.
for (let n = 1; n <= 8; n++) for (const a of [0, .5, .99, 1]) {
  const q = (1 - a) / 2 ** n, best = a + q;
  const probabilities = Array(2 ** n).fill(q); probabilities[0] += a;
  near(probabilities.reduce((x, y) => x + y), 1);
  near(entropy(probabilities), entropy([best]) + (2 ** n - 1) * entropy([q]));
  near(-Math.log2(Math.max(...probabilities)), -Math.log2(best));
  if (a === 0) near(entropy(probabilities), n);
  if (a === 1) near(entropy(probabilities), 0);
}
const q = 2 ** -257, best = .5 + q;
const H = entropy([best]) - (1 - best) * Math.log2(q); // avoids huge outcome enumeration
near(H, 129); near(-Math.log2(best), 1);
assert.match(exhibit.getElementById('first-guess-table').textContent, /Approximately 129 bits/);
assert.match(exhibit.getElementById('first-guess-table').textContent, /1\/2 \+ 2⁻²⁵⁷/);
// Read every displayed row, then verify XOR and secrecy conditional on the actual observation.
const rows = [...exhibit.querySelectorAll('#privacy-outcomes tbody tr')].map(row => [...row.cells].map(c => c.textContent.trim()));
assert.equal(rows.length, 8);
assert.equal(new Set(rows.map(r => r[0] + ':' + r[1])).size, 8);
const groups = new Map(), parityControl = new Map();
for (const [bits, position, observed, output] of rows) {
  assert.match(bits, /^[01]{2}$/); assert.ok(['1', '2'].includes(position));
  assert.equal(observed, bits[Number(position) - 1]);
  assert.equal(Number(output), Number(bits[0]) ^ Number(bits[1]));
  const key = position + ':' + observed;
  groups.set(key, [...(groups.get(key) || []), Number(output)]);
  parityControl.set(output, [...(parityControl.get(output) || []), Number(output)]);
}
assert.equal(groups.size, 4);
for (const values of groups.values()) assert.deepEqual(values.sort(), [0, 1]);
for (const [known, values] of parityControl) assert.ok(values.every(v => v === Number(known)));
console.log('Information examples: live IC, cyclic/independent entropy, mixture endpoints, eight leakage rows and parity control passed.');
