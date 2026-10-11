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

const corpusPage = fs.readFileSync(path.join(root, 'cipher-corpus.html'), 'utf8');
assert.doesNotMatch(corpusPage, /historical records with verified provenance/i);
assert.match(corpusPage, /legacy <code>verified<\/code> field is not a claim/i);

console.log('Corpus semantic checks passed: IDs, historical review scope, errata, and v0.6 tag uniqueness.');
