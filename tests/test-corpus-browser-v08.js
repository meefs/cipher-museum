#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const zlib = require('node:zlib');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const sample = JSON.parse(read('public/corpus/v0.8/browser-sample.json'));
const original = JSON.parse(read('public/corpus/browser-sample.json'));
const withdrawn = new Set(JSON.parse(read('public/corpus/v0.7/excluded-records.json'))
  .records.map(record => record.id));

async function main() {
  assert.equal(sample.length, 104, 'sample omits three withdrawn records');
  assert.equal(new Set(sample.map(record => record.id)).size, sample.length);
  assert.deepEqual(sample.map(record => record.id), original.filter(record => !withdrawn.has(record.id))
    .map(record => record.id), 'the remaining balanced sample keeps its published order');
  assert.ok(sample.every(record => record.corpus_version === '0.8' &&
    record.dataset_version === '0.8' && record.pair_status && record.authenticity));
  assert.ok(sample.every(record => !withdrawn.has(record.id)));

  // Compare every sampled object with the actual downloadable gzip, not a
  // locally generated plain JSONL that may be absent from a clean checkout.
  const found = new Map();
  const ids = new Set(sample.map(record => record.id));
  const gzip = fs.createReadStream(path.join(root, 'public/corpus/v0.8/all.jsonl.gz'))
    .pipe(zlib.createGunzip());
  for await (const line of readline.createInterface({ input: gzip, crlfDelay: Infinity })) {
    if (!line) continue;
    const record = JSON.parse(line);
    if (ids.has(record.id)) found.set(record.id, record);
  }
  assert.equal(found.size, sample.length);
  sample.forEach(record => assert.deepEqual(record, found.get(record.id), record.id));
  const oldSquare = original.find(record => record.id === 'two-square-045');
  const newSquare = sample.find(record => record.id === 'two-square-045');
  assert.notEqual(newSquare.ciphertext, oldSquare.ciphertext,
    'on-page Two-square must use the corrected rectangle rule');

  const page = read('cipher-corpus.html');
  assert.match(page, /100,313 records/);
  assert.match(page, /v0\.8 · 41 historical records/);
  assert.match(page, /v0\.8 · 7 languages/);
  assert.match(page, /published v0\.6 archive has 100,326 records/);

  const dom = new JSDOM(page, {
    url: 'https://ciphermuseum.com/cipher-corpus.html', runScripts: 'outside-only'
  });
  try {
    const { window } = dom;
    window.HTMLCanvasElement.prototype.getContext = () => null;
    const historical = sample.find(record => record.id === 'hist-beale-001');
    const citation = sample.find(record => record.id === 'hist-caesar-suetonius-001');
    assert.equal(historical.pair_status, 'unverified_pair');
    assert.ok(citation.citation_erratum);
    let request;
    window.fetch = async url => {
      request = url;
      return { ok: true, json: async () => [newSquare, historical, citation] };
    };
    window.eval(read('js/cipher-corpus.js'));
    await new Promise(resolve => setTimeout(resolve, 20));
    assert.equal(request, 'public/corpus/v0.8/browser-sample.json');
    const cards = [...window.document.querySelectorAll('.corpus-card')];
    assert.equal(cards.length, 3);
    assert.equal(cards[0].querySelector('.corpus-ciphertext').textContent, newSquare.ciphertext);
    assert.match(cards[1].querySelector('.corpus-status').textContent,
      /Historical source attribution has not been independently verified/);
    assert.match(cards[1].querySelector('.corpus-status').textContent,
      /do not use as a known-answer test/);
    assert.match(cards[2].querySelector('.corpus-source').textContent,
      /teaching reconstruction, not a verified Suetonius ciphertext/);
  } finally {
    dom.window.close();
  }
  console.log('v0.8 browser sample matches the shipped corpus and labels historical limitations.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
