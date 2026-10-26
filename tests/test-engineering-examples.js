'use strict';
// Independently recompute the published worked examples; no browser crypto widget.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const page = file => new JSDOM(fs.readFileSync(path.join(root, file), 'utf8')).window.document;
const cells = row => [...row.cells].map(cell => cell.textContent.trim());
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

const hashPage = page('ciphers/sha256.html');
const encode = fields => Buffer.concat(fields.map(field => {
  const bytes = Buffer.from(field, 'utf8');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(bytes.length);
  return Buffer.concat([length, bytes]);
}));
function decodeTwo(bytes) {
  const fields = [];
  let offset = 0;
  for (let i = 0; i < 2; i++) {
    assert.ok(offset + 4 <= bytes.length, 'complete length prefix');
    const length = bytes.readUInt32BE(offset);
    offset += 4;
    assert.ok(offset + length <= bytes.length, 'complete field');
    fields.push(new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(offset, offset + length)));
    offset += length;
  }
  assert.equal(offset, bytes.length, 'no trailing data');
  return fields;
}
const tupleRows = [...hashPage.querySelectorAll('#tuple-example tbody tr')];
assert.equal(tupleRows.length, 2);
const encoded = tupleRows.map(row => {
  const [fieldsText, hex] = cells(row);
  const fields = JSON.parse(fieldsText);
  const bytes = Buffer.from(hex.replace(/ /g, ''), 'hex');
  assert.deepEqual(bytes, encode(fields), 'published bytes match UTF-8 byte lengths');
  assert.deepEqual(decodeTwo(bytes), fields);
  return { fields, bytes };
});
assert.equal(encoded[0].fields.join(''), encoded[1].fields.join(''));
assert.equal(sha(Buffer.from(encoded[0].fields.join(''))), sha(Buffer.from(encoded[1].fields.join(''))));
assert.notEqual(sha(encoded[0].bytes), sha(encoded[1].bytes));
for (const fields of [['', ''], ['a|b', '|'], ['é', '🔑']]) {
  assert.deepEqual(decodeTwo(encode(fields)), fields);
}
assert.equal(encode(['é', '']).readUInt32BE(0), 2);
assert.throws(() => decodeTwo(encoded[0].bytes.subarray(0, 3)));
assert.throws(() => decodeTwo(encoded[0].bytes.subarray(0, -1)));
assert.throws(() => decodeTwo(Buffer.concat([encoded[0].bytes, Buffer.from([0])])));

const dhPage = page('ciphers/diffie-hellman.html');
const ikm = Buffer.from(Array.from({ length: 32 }, (_, i) => i));
const salt = Buffer.alloc(32);
const prk = crypto.createHmac('sha256', salt).update(ikm).digest('hex');
assert.equal(dhPage.querySelector('#hkdf-prk').textContent, prk);
const derived = [...dhPage.querySelectorAll('#hkdf-example tbody tr')].map(row => {
  const [info, length, hex] = cells(row);
  const expected = Buffer.from(crypto.hkdfSync('sha256', ikm, salt, Buffer.from(info, 'utf8'), Number(length))).toString('hex');
  assert.equal(hex, expected, 'published HKDF fixture matches Node/OpenSSL');
  return { info, length: Number(length), hex };
});
assert.equal(derived.length, 3);
assert.equal(derived[0].info, derived[1].info);
assert.equal(derived[0].hex, derived[1].hex.slice(0, derived[0].length * 2));
assert.notEqual(derived[1].hex, derived[2].hex);
// Independent one-block HKDF-Expand calculation of the 32-byte fixture.
assert.equal(crypto.createHmac('sha256', Buffer.from(prk, 'hex'))
  .update(Buffer.concat([Buffer.from(derived[1].info), Buffer.from([1])])).digest('hex'), derived[1].hex);

const modern = page('modern.html');
const key = Buffer.from('published teaching test key');
const tag = packet => crypto.createHmac('sha256', key)
  .update(encode([String(packet.counter), packet.body])).digest('hex');
const a = { counter: 1, body: 'A' };
const b = { counter: 2, body: 'B' };
a.tag = tag(a); b.tag = tag(b);
const events = [a, b, a, { ...a, counter: 3 }, { ...a, reset: true }];
let last = null;
let highest = 0;
const expected = events.map(packet => {
  if (packet.reset) { last = null; highest = 0; }
  const valid = tag(packet) === packet.tag;
  const lastAccept = valid && packet.tag !== last;
  const counterAccept = valid && packet.counter > highest;
  if (lastAccept) last = packet.tag;
  if (counterAccept) highest = packet.counter;
  return [valid ? 'Valid' : 'Invalid', lastAccept ? 'Accept' : 'Reject',
    `${counterAccept ? 'Accept' : 'Reject'}; highest = ${highest}`];
});
const replayRows = [...modern.querySelectorAll('#replay-example tbody tr')];
assert.equal(replayRows.length, events.length);
replayRows.forEach((row, i) => assert.deepEqual(cells(row).slice(1), expected[i]));
assert.equal(expected[2][0], 'Valid');
assert.equal(expected[2][1], 'Accept');
assert.equal(expected[3][2], 'Reject; highest = 2');
assert.equal(expected[4][2], 'Accept; highest = 1');

const learn = page('learn.html');
for (const link of learn.querySelectorAll('[aria-labelledby="protocol-lessons-heading"] a')) {
  const [file, id] = link.getAttribute('href').split('#');
  assert.ok(page(file).getElementById(id), `learning link target ${file}#${id}`);
}
for (const [doc, selector, url] of [
  [modern, '#replay-freshness', 'https://systemslibrarian.github.io/crypto-lab-fte/'],
  [hashPage, '#structured-hashing', 'https://systemslibrarian.github.io/crypto-lab-context-ward/'],
  [dhPage, '#key-derivation', 'https://systemslibrarian.github.io/crypto-lab-kdf-chain/']
]) {
  assert.ok(doc.querySelector(`${selector} a[href="${url}"]`), 'reuse existing lab at its base URL');
  assert.equal(doc.querySelectorAll(`${selector} input, ${selector} button, ${selector} script`).length, 0);
}
console.log('Engineering examples: tuple bytes/UTF-8/decoding, HKDF fixtures/prefix, replay state and lesson links passed.');
