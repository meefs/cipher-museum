#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const records = fs.readFileSync(path.join(root, 'public/corpus/all.jsonl'), 'utf8')
  .trim().split('\n').map(JSON.parse);
const historical = records.filter(record => record.source_type === 'historical');
const review = JSON.parse(fs.readFileSync(path.join(root, 'data/corpus-historical-review.json'), 'utf8'));

assert.equal(records.length, 100326);
assert.equal(new Set(records.map(record => record.id)).size, records.length, 'canonical IDs must be unique');
assert.equal(historical.length, 54);
assert.deepEqual(
  [...review.scope.record_ids].sort(),
  historical.map(record => record.id).sort(),
  'machine-readable historical review must cover every canonical historical record'
);
assert.equal(review.scope.count, historical.length);
assert.equal(new Set(review.known_pair_defects.map(defect => defect.id)).size, 5);
for (const defect of review.known_pair_defects) {
  assert.ok(review.scope.record_ids.includes(defect.id), `erratum outside review scope: ${defect.id}`);
  const record = records.find(candidate => candidate.id === defect.id);
  const letterCount = value => [...value].filter(character => /\p{L}/u.test(character)).length;
  assert.equal(defect.plaintext_letter_count, letterCount(record.plaintext),
    `stale plaintext count in erratum: ${defect.id}`);
  assert.equal(defect.ciphertext_letter_count, letterCount(record.ciphertext),
    `stale ciphertext count in erratum: ${defect.id}`);
}
assert.ok(records.filter(record => record.dataset_version !== '0.6')
  .some(record => new Set(record.tags).size !== record.tags.length), 'expected immutable legacy duplicate tags');
assert.ok(records.filter(record => record.dataset_version === '0.6')
  .every(record => new Set(record.tags).size === record.tags.length), 'new v0.6 records must not contain duplicate tags');

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'cipher-corpus-semantics-'));
const invalidPath = path.join(temp, 'invalid.jsonl');
const invalid = structuredClone(records.find(record => record.dataset_version === '0.6'));
invalid.tags.push(invalid.tags[0]);
fs.writeFileSync(invalidPath, JSON.stringify(invalid) + '\n');
const result = spawnSync(process.execPath, ['scripts/validate-corpus-v0.2.js', invalidPath], {
  cwd: root,
  encoding: 'utf8'
});
fs.rmSync(temp, { recursive: true, force: true });
assert.notEqual(result.status, 0, 'validator must reject duplicate tags in new-version records');
assert.match(result.stderr, /tags must be unique/);

// The rule must not be pinned to one release label. `dataset_version` is a
// per-batch generator label and not a release ordering, so the guard
// grandfathers the immutable batches by name and everything else fails closed.
// "2.0" is the case that matters: 70,656 published records carry it, it sorts
// after "0.6", and it is older data.
function validateRecord(record) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cipher-corpus-batch-'));
  const file = path.join(dir, 'record.jsonl');
  fs.writeFileSync(file, JSON.stringify(record) + '\n');
  const run = spawnSync(process.execPath, ['scripts/validate-corpus-v0.2.js', file], {
    cwd: root,
    encoding: 'utf8'
  });
  fs.rmSync(dir, { recursive: true, force: true });
  return run;
}
const newBatch = records.find(record => record.dataset_version === '0.6');
for (const version of ['0.7', '1.0', '2.0', '0.5', 'unreleased']) {
  const candidate = structuredClone(newBatch);
  candidate.id = `${newBatch.id}-${version}`;
  candidate.dataset_version = version;
  candidate.tags = [...candidate.tags, candidate.tags[0]];
  const run = validateRecord(candidate);
  assert.notEqual(run.status, 0,
    `validator must reject duplicate tags under batch label ${version}, not only "0.6"`);
  assert.match(run.stderr, /tags must be unique/);
}
// The 484 published duplicates stay valid: their bytes cannot be rewritten.
const legacyDuplicate = records.find(record =>
  record.dataset_version === '0.2' && new Set(record.tags).size !== record.tags.length);
assert(legacyDuplicate, 'the immutable archive still carries its grandfathered duplicates');
assert.equal(validateRecord(legacyDuplicate).status, 0,
  'validator must keep accepting the immutable pre-v0.6 duplicate tags');

const corpusPage = fs.readFileSync(path.join(root, 'cipher-corpus.html'), 'utf8');
assert.doesNotMatch(corpusPage, /historical records with verified provenance/i);
assert.match(corpusPage, /legacy <code>verified<\/code> field is not a claim/i);

// The published schema still describes `blind` as held-out for evaluation, the
// wording every executable surface retired. Its bytes are checksummed in
// SHA256SUMS.txt and verified by the deploy job, so the repair is an erratum,
// and the erratum must stand as long as the wording ships. Guarded as a
// conditional so a corrected schema in a future release retires this check
// instead of stranding a stale note.
const errata = fs.readFileSync(path.join(root, 'docs/CORPUS-V06-ERRATA.md'), 'utf8');
for (const relative of ['public/corpus/cipher-corpus.schema.json',
  'public/corpus/archive/cipher-corpus.schema.v0.2.json']) {
  const schema = JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
  const description = schema.properties.split ? schema.properties.split.description || '' : '';
  if (!/held[- ]out/i.test(description)) continue;
  assert.match(errata, /`cipher-corpus\.schema\.json` describes `blind`/,
    `${relative} still calls blind held-out; the errata must record it`);
  assert.match(errata, /downloadable evaluation\s+split label only/,
    `${relative}: the errata must state what the label actually means`);
  assert.match(errata, /cannot be corrected without invalidating published v0\.6 checksums/,
    `${relative}: the errata must explain why the bytes are not edited`);
}
// Nothing executable may carry the retired wording as its own description.
for (const relative of ['scripts/benchmark-runner.js', 'scripts/generate-benchmark-report.js',
  'docs/blind-split-policy.md', 'docs/CORPUS_PUBLISHING.md']) {
  const text = fs.readFileSync(path.join(root, relative), 'utf8');
  for (const line of text.split('\n')) {
    if (!/held[- ]out/i.test(line)) continue;
    assert.match(line, /not confidential|separately held[- ]out|has not been downloaded|never confidential/i,
      `${relative}: "held-out" may appear only to deny it describes this corpus — ${line.trim()}`);
  }
}

console.log('Corpus semantic checks passed: IDs, historical review scope, errata, v0.6 tag uniqueness, and blind-split wording.');
