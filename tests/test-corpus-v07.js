#!/usr/bin/env node
'use strict';

/**
 * test-corpus-v07.js — regression coverage for the four deferred v0.6 findings,
 * resolved in corpus v0.7.
 *
 * This tests the shipped dataset and the generated artifacts, not only the
 * helper functions: the assertions read public/corpus/v0.7/*, re-run the
 * generator in --check mode, and drive the real validator through spawned
 * processes for the negative cases. A fix that exists only in a helper and
 * never reached the published bytes fails here.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const metrics = require(path.join(root, 'scripts/corpus-text-metrics.js'));
const builder = require(path.join(root, 'scripts/build-corpus-v07.js'));

const V07_DIR = path.join(root, 'public/corpus/v0.7');

// The canonical v0.7 file is derived, not committed (120MB). Build it if it is
// absent so a clean checkout tests the real artifact; the checksum assertions
// below then confirm the rebuild matches the committed manifest byte for byte.
if (!fs.existsSync(path.join(V07_DIR, 'all.jsonl'))) {
  const built = spawnSync(process.execPath, ['scripts/build-corpus-v07.js'],
    { cwd: root, encoding: 'utf8' });
  if (built.status !== 0) {
    throw new Error(`could not build corpus v0.7:\n${built.stdout}${built.stderr}`);
  }
}
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const readJson = relative => JSON.parse(read(relative));

const records = read('public/corpus/v0.7/all.jsonl').split('\n').filter(Boolean).map(JSON.parse);
const schema = readJson('public/corpus/v0.7/cipher-corpus.schema.json');
const stats = readJson('public/corpus/v0.7/stats.json');
const excluded = readJson('public/corpus/v0.7/excluded-records.json');
const inventory = readJson('public/corpus/v0.7/change-inventory.json');
const decisions = readJson('data/corpus-v0.7-decisions.json');

let checks = 0;
const check = (label, fn) => { fn(); checks += 1; void label; };

/* ---------------------------------------------- the shipped dataset itself */

check('dataset is non-empty and self-consistent', () => {
  assert.ok(records.length > 100000, 'v0.7 ships the full corpus');
  assert.equal(records.length, stats.records, 'stats.json record count matches the dataset');
  assert.equal(new Set(records.map(r => r.id)).size, records.length, 'IDs are unique');
  for (const record of records) {
    assert.equal(record.corpus_version, '0.7', `${record.id}: corpus_version`);
  }
});

check('the checksum manifest covers the shipped files and matches their bytes', () => {
  const manifest = read('public/corpus/v0.7/SHA256SUMS.txt').trim().split('\n');
  assert.ok(manifest.length >= 5, 'manifest lists the released files');
  for (const line of manifest) {
    const [digest, name] = line.split(/\s+/);
    const actual = crypto.createHash('sha256')
      .update(fs.readFileSync(path.join(V07_DIR, name))).digest('hex');
    assert.equal(actual, digest, `${name}: checksum matches the shipped bytes`);
  }
});

check('the generator reproduces the shipped artifacts exactly', () => {
  const result = spawnSync(process.execPath, ['scripts/build-corpus-v07.js', '--check'],
    { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0,
    `v0.7 artifacts are not reproducible from the generator:\n${result.stdout}${result.stderr}`);
});

/* ------------------------------------------- v0.6 remains byte-for-byte safe */

check('the immutable v0.6 archive still verifies against its own manifest', () => {
  const manifest = read('public/corpus/SHA256SUMS.txt').trim().split('\n');
  for (const line of manifest) {
    const [digest, name] = line.split(/\s+/);
    const file = path.join(root, 'public/corpus', name);
    const actual = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    assert.equal(actual, digest, `v0.6 ${name} must be byte-identical`);
  }
});

/* ------------------------------------------------------------------- CM-002 */

check('CM-002: no fabricated ciphertext ships in v0.7', () => {
  for (const record of records) {
    assert.equal(builder.fabricationSignature(record.ciphertext), null,
      `${record.id}: ciphertext has a fabricated-placeholder signature`);
  }
});

check('CM-002: every withdrawn record is listed with its evidence and kept in v0.6', () => {
  assert.equal(excluded.count, excluded.records.length);
  assert.ok(excluded.count > 0, 'the exclusion list is not silently empty');
  const shipped = new Set(records.map(r => r.id));
  const legacy = new Set(read('public/corpus/all.jsonl').split('\n').filter(Boolean)
    .map(line => JSON.parse(line).id));
  for (const entry of excluded.records) {
    assert.ok(!shipped.has(entry.id), `${entry.id}: withdrawn record must not ship`);
    assert.ok(legacy.has(entry.id), `${entry.id}: withdrawn record stays in the v0.6 archive`);
    assert.ok(entry.evidence.signature, `${entry.id}: records why it was withdrawn`);
    assert.ok(entry.evidence.ciphertext_letters >= 20, `${entry.id}: evidence includes the measurement`);
  }
  // Retired IDs are not reused.
  for (const entry of excluded.records) {
    assert.ok(!shipped.has(entry.id), `${entry.id}: retired ID must not be reused`);
  }
});

check('CM-002: the Kryptos K1 correction is verified by recomputation, not assertion', () => {
  const k1 = records.find(record => record.id === 'hist-kryptos-k1-001');
  assert.ok(k1, 'K1 ships in v0.7');
  const alphabet = k1.key.alphabet_key;
  const keyword = k1.key.keyword;
  const ciphertext = k1.ciphertext.replace(/[^A-Z]/g, '');
  let decrypted = '';
  for (let i = 0; i < ciphertext.length; i += 1) {
    const c = alphabet.indexOf(ciphertext[i]);
    const k = alphabet.indexOf(keyword[i % keyword.length]);
    decrypted += alphabet[((c - k) % 26 + 26) % 26];
  }
  assert.equal(decrypted, k1.plaintext.replace(/[^A-Z]/g, ''),
    'K1 ciphertext must decrypt to the stored plaintext under the recorded key');
  assert.equal(ciphertext.length, 63, 'K1 is the full 63-character section');
  assert.equal(k1.pair_status, 'verified_pair');
  assert.equal(k1.verification_method, 'documented_computation');
});

check('CM-002: classification is present, consistent, and gates benchmark eligibility', () => {
  const authenticity = new Set(schema.properties.authenticity.enum);
  const pairStatus = new Set(schema.properties.pair_status.enum);
  for (const record of records) {
    assert.ok(authenticity.has(record.authenticity), `${record.id}: known authenticity`);
    assert.ok(pairStatus.has(record.pair_status), `${record.id}: known pair_status`);
    assert.equal(record.benchmark_eligible, record.pair_status === 'verified_pair',
      `${record.id}: benchmark eligibility follows pair status`);
    assert.equal(record.verified, record.benchmark_eligible,
      `${record.id}: the legacy verified flag now means benchmark-eligible`);
    if (record.source_type === 'synthetic') {
      assert.equal(record.authenticity, 'synthetic', `${record.id}`);
    }
  }
  // The records the v0.6 review called defective must not claim to be pairs.
  for (const entry of decisions.excerpts) {
    const record = records.find(candidate => candidate.id === entry.id);
    if (!record) continue;
    assert.equal(record.pair_status, 'not_a_pair', `${entry.id}: excerpt is not a pair`);
    assert.equal(record.benchmark_eligible, false, `${entry.id}: excluded from benchmarks`);
  }
});

check('CM-002: overlap between defects and reconstructions is handled, not double-counted', () => {
  const review = readJson('data/corpus-historical-review.json');
  const defects = new Set(review.known_pair_defects.map(entry => entry.id));
  const reconstructions = new Set(review.declared_reconstructions);
  const overlap = [...defects].filter(id => reconstructions.has(id));
  assert.deepEqual(overlap, ['hist-enigma-barbarossa-001'],
    'the one record in both lists is the known overlap');
  assert.equal(new Set([...defects, ...reconstructions]).size, 15,
    'the two lists cover 15 distinct records, not 16');
});

/* ------------------------------------------------------------------- CM-008 */

check('CM-008: the length contract is defined once and applied to every record', () => {
  assert.equal(metrics.textLength('ATTACK AT DAWN'), 14);
  assert.equal(metrics.normalizedTextLength('ATTACK AT DAWN'), 12);
  // Accents fold to one letter whether stored composed or decomposed.
  assert.equal(metrics.normalizedTextLength('Attaqué'), 7);
  assert.equal(metrics.normalizedTextLength('Attaqué'), 7);
  // Code points, not UTF-16 units.
  assert.equal(metrics.textLength('\u{1F600}A'), 2);
  for (const record of records) {
    assert.deepEqual(metrics.metricsDrift(record), [],
      `${record.id}: shipped length fields match the contract`);
    assert.ok(record.text_length >= record.normalized_text_length,
      `${record.id}: text_length >= normalized_text_length`);
  }
});

check('CM-008: the schema documents the contract rather than just "integer"', () => {
  for (const field of ['text_length', 'normalized_text_length']) {
    const description = schema.properties[field].description || '';
    assert.match(description, /plaintext/i, `${field} description names its source field`);
    assert.equal(schema.properties[field].minimum, 0, `${field} has a minimum`);
  }
});

/* ------------------------------------------------------------------- CM-014 */

check('CM-014: no shipped v0.7 record carries a duplicate tag', () => {
  for (const record of records) {
    if (!Array.isArray(record.tags)) continue;
    assert.equal(new Set(record.tags).size, record.tags.length,
      `${record.id}: tags are unique`);
  }
  assert.equal(schema.properties.tags.uniqueItems, true, 'the schema requires uniqueness');
});

check('CM-014: deduplication preserves first-use order', () => {
  assert.deepEqual(builder.dedupeTags(['b', 'a', 'b', 'c', 'a']), ['b', 'a', 'c']);
});

/* ------------------------------------------------------------------- CM-020 */

check('CM-020: the v0.7 schema stops calling a downloadable label held-out data', () => {
  const description = schema.properties.split.description;
  assert.doesNotMatch(description, /\bheld-out for evaluation\b/i,
    'the retired v0.6 wording must not return');
  assert.match(description, /downloadable|published/i, 'it says both splits are available');
  assert.match(description, /not secret|neither label is secret/i,
    'it states plainly that the label is not secrecy');
  assert.match(description, /v0\.6|errata/i, 'it points at the immutable v0.6 erratum');
});

check('CM-020: the immutable v0.6 schema is untouched and still covered by its erratum', () => {
  const legacy = readJson('public/corpus/cipher-corpus.schema.json');
  assert.match(legacy.properties.split.description, /held-out for evaluation/,
    'v0.6 bytes are preserved exactly, wording included');
  assert.match(read('docs/CORPUS-V06-ERRATA.md'), /cipher-corpus\.schema\.json` describes `blind`/,
    'the erratum still records it');
});

/* ------------------------------------- negative cases: the validator bites */

function validateRecord(record, extraArgs = []) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'corpus-v07-'));
  const file = path.join(dir, 'one.jsonl');
  fs.writeFileSync(file, JSON.stringify(record) + '\n');
  const result = spawnSync(process.execPath,
    ['scripts/validate-corpus.js', file, '--contract', '0.7', ...extraArgs],
    { cwd: root, encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  return result;
}

const valid = records.find(record => record.source_type === 'synthetic' && record.benchmark_eligible);

check('a clean v0.7 record passes, so the negative cases below mean something', () => {
  assert.equal(validateRecord(valid).status, 0, 'the control record validates');
});

check('negative: duplicate tags are rejected whatever batch the record came from', () => {
  for (const batch of ['0.2', '0.5', '2.0', '0.6', 'anything-else']) {
    const bad = { ...valid, id: `${valid.id}-dup-${batch}`, source_batch: batch,
      tags: [...valid.tags, valid.tags[0]] };
    const result = validateRecord(bad);
    assert.notEqual(result.status, 0,
      `a v0.7 record from batch ${batch} with duplicate tags must be rejected`);
    assert.match(result.stderr, /tags must be unique/);
  }
});

check('negative: wrong length fields are rejected', () => {
  for (const field of ['text_length', 'normalized_text_length']) {
    const bad = { ...valid, id: `${valid.id}-${field}`, [field]: valid[field] + 1 };
    const result = validateRecord(bad);
    assert.notEqual(result.status, 0, `${field} drift must be rejected`);
    assert.match(result.stderr, new RegExp(`${field} is`));
  }
});

check('negative: inconsistent classification is rejected', () => {
  const cases = [
    [{ benchmark_eligible: false }, /benchmark_eligible must be true exactly/],
    [{ pair_status: 'not_a_pair', verification_method: 'engine_replay', benchmark_eligible: false, verified: false }, /verification_method must be "none"/],
    [{ verification_method: 'none' }, /must record how it was verified/],
    [{ authenticity: 'authentic_artifact' }, /synthetic records must carry authenticity/]
  ];
  for (const [patch, pattern] of cases) {
    const bad = { ...valid, id: `${valid.id}-cls`, ...patch };
    const result = validateRecord(bad);
    assert.notEqual(result.status, 0, `inconsistent record must be rejected: ${JSON.stringify(patch)}`);
    assert.match(result.stderr, pattern);
  }
});

check('negative: a v0.6-era record cannot pass the v0.7 contract', () => {
  const legacy = JSON.parse(read('public/corpus/all.jsonl').split('\n')[0]);
  const result = validateRecord(legacy);
  assert.notEqual(result.status, 0, 'a legacy record must not satisfy the v0.7 contract');
});

check('the legacy contract still accepts the immutable archive, duplicates included', () => {
  const legacyWithDuplicateTags = read('public/corpus/all.jsonl').split('\n').filter(Boolean)
    .map(JSON.parse)
    .find(record => Array.isArray(record.tags) && new Set(record.tags).size !== record.tags.length);
  assert.ok(legacyWithDuplicateTags, 'the archive still contains its grandfathered duplicates');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'corpus-v06-'));
  const file = path.join(dir, 'one.jsonl');
  fs.writeFileSync(file, JSON.stringify(legacyWithDuplicateTags) + '\n');
  const result = spawnSync(process.execPath,
    ['scripts/validate-corpus.js', file, '--contract', '0.6'], { cwd: root, encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  assert.equal(result.status, 0, 'immutable v0.6 bytes must keep validating');
});

/* ---------------------------------- the replay guard that missed all of this */

check('the replay no longer lets a historical-variant rule excuse a fabricated ciphertext', () => {
  const replay = require(path.join(root, 'tests/engines/corpus-replay.js'));
  // The two detectors must agree, or the corpus generator and the replay guard
  // could disagree about what counts as fabricated.
  for (const sample of ['QWERTYUIOPASDFGHJKLZXCVBNM', 'ABCDEFGHIJKLMNOPQRSTU', 'NCZWVYSXNSVCXFP', '']) {
    assert.equal(replay.isFabricatedCiphertext(sample),
      builder.fabricationSignature(sample) !== null,
      `fabrication detectors disagree about ${JSON.stringify(sample.slice(0, 20))}`);
  }
  // The enumerated tolerance list must be exactly the fabricated records in the
  // frozen archive: not fewer (a real one slips through) and not more (a licence
  // to add new ones).
  const legacyFabricated = read('public/corpus/all.jsonl').split('\n').filter(Boolean)
    .map(JSON.parse)
    .filter(record => record.source_type === 'historical'
      && replay.isFabricatedCiphertext(record.ciphertext))
    .map(record => record.id);
  assert.deepEqual([...replay.FABRICATED_V06_IDS].sort(), legacyFabricated.sort(),
    'the enumerated v0.6 fabrication tolerances must match the archive exactly');
  assert.equal(legacyFabricated.length, 13);
  // And every one of them is withdrawn from v0.7.
  const shipped = new Set(records.map(record => record.id));
  for (const id of legacyFabricated) {
    assert.ok(!shipped.has(id), `${id}: tolerated in v0.6, must be withdrawn from v0.7`);
  }
});

/* ------------------------------------------------------- dataset consumers */

check('the evaluation export is reproducible and skips records that are not pairs', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-eval-'));
  const run = (file, extra = []) => spawnSync(process.execPath, [
    'scripts/export-llm-3shot.js',
    '--input', 'public/corpus/v0.7/all.jsonl',
    '--count', '25',
    '--output', path.join(dir, file),
    ...extra
  ], { cwd: root, encoding: 'utf8' });

  const first = run('a.jsonl');
  assert.equal(first.status, 0, `export failed:\n${first.stdout}${first.stderr}`);
  const second = run('b.jsonl');
  assert.equal(fs.readFileSync(path.join(dir, 'a.jsonl'), 'utf8'),
    fs.readFileSync(path.join(dir, 'b.jsonl'), 'utf8'),
    'two runs over the same corpus must produce the same evaluation set');

  const reseeded = run('c.jsonl', ['--seed', 'a-different-seed']);
  assert.equal(reseeded.status, 0);
  assert.notEqual(fs.readFileSync(path.join(dir, 'a.jsonl'), 'utf8'),
    fs.readFileSync(path.join(dir, 'c.jsonl'), 'utf8'),
    'a different seed must select a different evaluation set');

  // Nothing that is not a verified pair may reach an evaluation export.
  const ineligible = new Set(records.filter(r => !r.benchmark_eligible).map(r => r.id));
  assert.ok(ineligible.size > 0, 'the corpus does contain records that are not pairs');
  for (const line of fs.readFileSync(path.join(dir, 'a.jsonl'), 'utf8').split('\n').filter(Boolean)) {
    const exported = JSON.parse(line);
    const id = exported.id || (exported.metadata && exported.metadata.id);
    if (id) assert.ok(!ineligible.has(id), `${id}: exported despite not being a verified pair`);
  }
  assert.match(first.stdout, /Excluded \d+ record\(s\) that are not verified pairs/);
  fs.rmSync(dir, { recursive: true, force: true });
});

check('the benchmark runner filters on benchmark_eligible', () => {
  const runner = read('scripts/benchmark-runner.js');
  assert.match(runner, /benchmark_eligible === true/,
    'the runner must filter the dataset on verified pairs');
  assert.match(runner, /records_skipped_not_verified_pairs/,
    'and must report how many records it skipped');
});

/* ------------------------------------------------- inventory and accounting */

check('the change inventory accounts for every difference from v0.6', () => {
  const legacy = read('public/corpus/all.jsonl').split('\n').filter(Boolean).length;
  assert.equal(inventory.summary.records_in, legacy);
  assert.equal(inventory.summary.records_out, records.length);
  assert.equal(inventory.summary.records_in - inventory.summary.records_excluded,
    inventory.summary.records_out, 'records in minus withdrawn equals records out');
  assert.equal(inventory.excluded_ids.length, excluded.count);
  assert.ok(inventory.summary.records_changed > 0, 'the inventory is not empty');
});

console.log(`Corpus v0.7 checks passed: ${checks} groups over ${records.length} shipped records, `
  + `${excluded.count} withdrawn, negative cases included.`);
