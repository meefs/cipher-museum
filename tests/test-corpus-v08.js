#!/usr/bin/env node
'use strict';

/** Regression checks for the corrected, complete Cipher Corpus v0.8 download. */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const readline = require('node:readline');
const zlib = require('node:zlib');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const v07Dir = path.join(root, 'public/corpus/v0.7');
const v08Dir = path.join(root, 'public/corpus/v0.8');

function run(script, ...args) {
  const result = spawnSync(process.execPath, [script, ...args],
    { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  assert.equal(result.status, 0, `${script} ${args.join(' ')}:\n${result.stdout}${result.stderr}`);
}

function digest(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function checkManifest(dir) {
  const entries = fs.readFileSync(path.join(dir, 'SHA256SUMS.txt'), 'utf8').trim().split('\n');
  assert.ok(entries.length >= 4, 'manifest covers the complete download and metadata');
  for (const entry of entries) {
    const match = entry.match(/^([a-f0-9]{64})  (\S+)$/);
    assert.ok(match, `well-formed manifest entry ${entry}`);
    assert.equal(digest(path.join(dir, match[2])), match[1], `checksum: ${match[2]}`);
  }
  return entries.map(entry => entry.split(/  /)[1]);
}

async function* jsonLines(input) {
  const lines = readline.createInterface({ input, crlfDelay: Infinity });
  for await (const line of lines) if (line.trim()) yield JSON.parse(line);
}

// An independent expression of the ACA horizontal rectangle rule: first
// ciphertext letter comes from the RIGHT square at the first plaintext row
// and second plaintext column; the second comes from the LEFT square at the
// second plaintext row and first plaintext column. The museum's escaping is
// mirrored solely to compare complete real corpus records, including X/Q/Z.
function acaTwoSquare(plaintext, key) {
  const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
  const clean = value => String(value).normalize('NFD').replace(/\p{M}/gu, '')
    .toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
  const square = keyword => [...new Set(clean(keyword) + alphabet)].join('');
  const left = square(key.key1), right = square(key.key2);
  let prepared = clean(plaintext).replace(/[XQZ]/g,
    letter => ({ X: 'ZA', Q: 'ZB', Z: 'ZC' })[letter]);
  if (prepared.length % 2) prepared += 'X';
  let result = '';
  for (let i = 0; i < prepared.length; i += 2) {
    const a = left.indexOf(prepared[i]), b = right.indexOf(prepared[i + 1]);
    assert.ok(a >= 0 && b >= 0, 'plaintext letters are in both squares');
    result += right[5 * Math.floor(a / 5) + b % 5];
    result += left[5 * Math.floor(b / 5) + a % 5];
  }
  return result;
}

async function main() {
  // Running this test from a clean checkout recreates only the derived plain
  // files; the actual compressed download must already be checked into Git.
  if (!fs.existsSync(path.join(v07Dir, 'all.jsonl'))) run('scripts/build-corpus-v07.js');
  assert.ok(fs.existsSync(path.join(v08Dir, 'all.jsonl.gz')),
    'the complete corrected gzip must be committed and downloadable');
  if (!fs.existsSync(path.join(v08Dir, 'all.jsonl'))) run('scripts/build-corpus-v08.js');

  const listed = checkManifest(v08Dir);
  assert.ok(listed.includes('all.jsonl.gz'), 'the downloadable gzip is checksummed');
  assert.ok(listed.includes('cipher-corpus.schema.json'), 'the v0.8 schema is checksummed');
  run('scripts/build-corpus-v08.js', '--check');

  const inventory = JSON.parse(fs.readFileSync(path.join(v08Dir, 'change-inventory.json'), 'utf8'));
  const stats = JSON.parse(fs.readFileSync(path.join(v08Dir, 'stats.json'), 'utf8'));
  assert.equal(inventory.corpus_version, '0.8');
  assert.equal(inventory.derived_from.corpus_version, '0.7');
  assert.equal(inventory.summary.records_in, 100313);
  assert.equal(inventory.summary.records_out, 100313);
  assert.equal(inventory.summary.two_square_recomputed, 1072);
  assert.equal(inventory.summary.source_citations_corrected, 5);
  assert.equal(stats.records, 100313);
  assert.equal(stats.raw_jsonl_sha256, digest(path.join(v08Dir, 'all.jsonl')),
    'the canonical uncompressed JSONL digest is committed in stats.json');

  const changedIds = new Set(inventory.corrections.map(item => item.id));
  assert.equal(changedIds.size, inventory.corrections.length, 'each changed ID appears once');
  assert.ok(inventory.corrections.every(item => item.fields && item.reason_code),
    'record-level inventory records fields and reasons');
  const changesById = new Map(inventory.corrections.map(item => [item.id, item]));

  // Check the shipped compressed download itself. Both the canonical plain
  // JSONL and the v0.7 predecessor must contain the same ordered IDs, and
  // unrelated fields may not change silently.
  const old = jsonLines(fs.createReadStream(path.join(v07Dir, 'all.jsonl')))[Symbol.asyncIterator]();
  const fresh = jsonLines(fs.createReadStream(path.join(v08Dir, 'all.jsonl')))[Symbol.asyncIterator]();
  const shipped = jsonLines(fs.createReadStream(path.join(v08Dir, 'all.jsonl.gz'))
    .pipe(zlib.createGunzip()))[Symbol.asyncIterator]();
  let count = 0, twoSquare = 0, changedCiphertext = 0, changedSource = 0;
  while (true) {
    const [previous, next, zipped] = await Promise.all([old.next(), fresh.next(), shipped.next()]);
    assert.equal(previous.done, next.done, 'v0.8 preserves v0.7 record count');
    assert.equal(next.done, zipped.done, 'compressed download is complete');
    if (next.done) break;
    const a = previous.value, b = next.value;
    assert.deepEqual(zipped.value, b, `${a.id}: gzip yields the canonical record`);
    assert.equal(b.id, a.id, 'ordered IDs are preserved');
    assert.equal(b.corpus_version, '0.8', `${a.id}: current release marker`);
    assert.equal(b.dataset_version, '0.8', `${a.id}: current dataset marker`);
    assert.equal(b.plaintext, a.plaintext, `${a.id}: plaintext preserved`);
    assert.deepEqual(b.key, a.key, `${a.id}: key preserved`);
    const unchanged = record => {
      const copy = { ...record };
      for (const field of ['corpus_version', 'dataset_version', 'ciphertext',
        'source_provenance', 'citation_erratum', 'source']) delete copy[field];
      return copy;
    };
    assert.deepEqual(unchanged(b), unchanged(a), `${a.id}: unrelated fields preserved`);
    if (a.cipher_type === 'two_square') {
      twoSquare += 1;
      assert.equal(b.ciphertext, acaTwoSquare(a.plaintext, a.key),
        `${a.id}: independent ACA rectangle calculation`);
      assert.equal(b.verification_method, 'engine_replay', `${a.id}: no fabricated status`);
      assert.equal(b.benchmark_eligible, true, `${a.id}: verified new pair`);
      if (a.ciphertext !== b.ciphertext) changedCiphertext += 1;
      assert.ok(changedIds.has(a.id), `${a.id}: recomputation is in the inventory`);
      if (a.ciphertext !== b.ciphertext) {
        assert.deepEqual(changesById.get(a.id).fields.ciphertext,
          { from: a.ciphertext, to: b.ciphertext }, `${a.id}: exact correction is recorded`);
      }
    } else {
      assert.equal(b.ciphertext, a.ciphertext, `${a.id}: other ciphertext preserved`);
    }
    if (JSON.stringify(a.source_provenance) !== JSON.stringify(b.source_provenance)) {
      changedSource += 1;
      assert.ok(changedIds.has(a.id), `${a.id}: citation change is in the inventory`);
      assert.equal(a.source_type, 'historical', `${a.id}: only historical citations corrected`);
      assert.equal(b.source_provenance.url, null, `${a.id}: unsupported citation retired`);
      assert.ok(b.citation_erratum?.previous_url,
        `${a.id}: retired URL retained in explicit audit field`);
      assert.deepEqual(changesById.get(a.id).fields.source_provenance,
        { from: a.source_provenance, to: b.source_provenance },
        `${a.id}: exact citation correction is recorded`);
    }
    if (a.source !== b.source) {
      assert.ok(changedIds.has(a.id), `${a.id}: source text change is in the inventory`);
      assert.equal(a.source_type, 'historical', `${a.id}: source text correction is historical`);
    }
    count += 1;
  }
  assert.equal(count, 100313);
  assert.equal(twoSquare, 1072);
  assert.equal(changedCiphertext, inventory.summary.two_square_ciphertexts_changed);
  assert.equal(changedSource, inventory.summary.source_citations_corrected);

  assert.equal(acaTwoSquare('ANOTHERDIGRAPHICSETU',
    { key1: 'DIALOGUE', key2: 'BIOGRAPHY' }), 'IRRTEHMKGIMEQGRUNMMZ',
  'independent reference reproduces the published ACA example');

  // A versioned dataset must not pass the permissive v0.6 contract by
  // accident, including when no --contract flag is supplied.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'corpus-v08-'));
  try {
    const one = path.join(dir, 'one.jsonl');
    const handle = fs.openSync(path.join(v08Dir, 'all.jsonl'), 'r');
    const prefix = Buffer.alloc(16 * 1024);
    try { fs.readSync(handle, prefix, 0, prefix.length, 0); }
    finally { fs.closeSync(handle); }
    const seed = JSON.parse(prefix.toString('utf8').split('\n')[0]);
    fs.writeFileSync(one, JSON.stringify(seed) + '\n');
    run('scripts/validate-corpus.js', one);
    const wrong = { ...seed, corpus_version: '0.9' };
    fs.writeFileSync(one, JSON.stringify(wrong) + '\n');
    const rejected = spawnSync(process.execPath, ['scripts/validate-corpus.js', one],
      { cwd: root, encoding: 'utf8' });
    assert.notEqual(rejected.status, 0, 'unknown future contract cannot downgrade to 0.6');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }

  console.log(`v0.8: ${count} full download records, ${twoSquare} ACA pairs, `
    + `${changedSource} historical citation corrections, checksum and reproducibility passed.`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
