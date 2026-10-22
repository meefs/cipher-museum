#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const readline = require('node:readline');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const BASE = path.join(ROOT, 'public/corpus');
const OUT = path.join(BASE, 'v0.8');
const readJsonl = file => fs.readFileSync(file, 'utf8').trimEnd().split('\n').map(JSON.parse);
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

async function selectedCanonical(ids) {
  const found = new Map();
  const lines = readline.createInterface({
    input: fs.createReadStream(path.join(OUT, 'all.jsonl.gz')).pipe(zlib.createGunzip()),
    crlfDelay: Infinity
  });
  for await (const line of lines) {
    if (!line) continue;
    const value = JSON.parse(line);
    if (ids.has(value.id)) found.set(value.id, value);
  }
  return found;
}

async function main() {
  const rebuild = spawnSync(process.execPath,
    ['scripts/build-corpus-v08-supplements.js', '--check'],
    { cwd: ROOT, encoding: 'utf8' });
  assert.equal(rebuild.status, 0, `supplement builder check: ${rebuild.stderr}`);

  const manifest = JSON.parse(fs.readFileSync(path.join(OUT, 'supplements-manifest.json'), 'utf8'));
  assert.equal(manifest.historical.records, 87);
  assert.equal(manifest.historical.excluded_withdrawn, 13);
  assert.equal(manifest.historical.canonical_v0_8, 42);
  assert.equal(manifest.historical.canonical_historical, 41);
  assert.equal(manifest.historical.canonical_reclassified_synthetic, 1);
  assert.equal(manifest.historical.legacy_unreviewed, 45);
  assert.deepEqual(manifest.historical.citation_review_states, {
    context_passage_checked: 13,
    not_independently_checked: 4,
    historical_claim_not_substantiated: 1,
    full_text_access_unavailable: 27
  });
  assert.equal(manifest.llm_eval.records, 300);
  assert.equal(manifest.llm_eval.two_square_prompts_corrected, 3);
  assert.equal(manifest.llm_eval.keyless_prompt_labels_corrected, 62);

  const checks = fs.readFileSync(path.join(OUT, 'supplements-SHA256SUMS.txt'), 'utf8')
    .trim().split('\n');
  assert.equal(checks.length, 3);
  for (const line of checks) {
    const match = /^([0-9a-f]{64})  ([\w.-]+)$/.exec(line);
    assert.ok(match, `valid checksum line ${line}`);
    assert.equal(digest(path.join(OUT, match[2])), match[1], match[2]);
  }

  const oldHistory = readJsonl(path.join(BASE, 'historical.jsonl'));
  const currentHistory = readJsonl(path.join(OUT, 'historical-supplement.jsonl'));
  const excluded = new Set(JSON.parse(fs.readFileSync(path.join(BASE, 'v0.7/excluded-records.json')))
    .records.map(record => record.id));
  const retained = oldHistory.filter(record => !excluded.has(record.id));
  assert.equal(currentHistory.length, 87);
  assert.deepEqual(currentHistory.map(record => record.id), retained.map(record => record.id),
    'supplement preserves source order, minus the withdrawn records');
  assert.equal(new Set(currentHistory.map(record => record.id)).size, 87);
  const wanted = new Set([...currentHistory.map(record => record.id),
    'two-square-002', 'two-square-003', 'two-square-004',
    'two-square-005', 'two-square-006', 'two-square-007']);
  const canonical = await selectedCanonical(wanted);
  let matched = 0, supplemental = 0;
  for (const record of currentHistory) {
    if (canonical.has(record.id)) {
      matched++;
      assert.equal(record.supplement_inclusion, 'canonical_v0.8');
      const { supplement_release, supplement_inclusion, ...copy } = record;
      assert.deepEqual(copy, canonical.get(record.id), `${record.id}: canonical record matches v0.8`);
    } else {
      supplemental++;
      assert.equal(record.supplement_inclusion, 'legacy_unreviewed');
      assert.equal(record.verified, false, `${record.id}: not automatically verified`);
      assert.equal(record.pair_status, 'unverified_pair');
      assert.equal(record.authenticity, 'catalogued_unreviewed');
      assert.equal(record.benchmark_eligible, false);
      assert.ok(['context_only_not_pair_provenance', 'contextual_reference_does_not_support_specific_claim']
        .includes(record.source_link_status));
      assert.equal(record.pair_review.status, 'not_source_authenticated');
      assert.equal(record.source_provenance.license, 'not_assessed');
      assert.ok(record.citation_review.status in manifest.historical.citation_review_states);
    }
  }
  assert.equal(matched, 42);
  assert.equal(supplemental, 45);
  assert.equal(currentHistory.find(record => record.id === 'hist-enigma-001').source_type,
    'synthetic', 'the one reclassified canonical record is never advertised as authentic');
  assert.deepEqual(currentHistory.filter(record => record.supplement_inclusion === 'legacy_unreviewed' &&
    record.source_type === 'synthetic').map(record => record.id).sort(),
  ['hist-geez-001', 'hist-homophonic-001', 'hist-railfence-001', 'hist-straddling-001',
    'hist-twosquare-001']);
  const beale = currentHistory.find(record => record.id === 'hist-beale-paper1-001');
  const aeneas = currentHistory.find(record => record.id === 'hist-aeneas-001');
  assert.equal(beale.source_provenance.url, null);
  assert.equal(beale.citation_erratum.previous_url, 'https://www.gutenberg.org/ebooks/12994');
  assert.equal(aeneas.source_provenance.url,
    'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Aeneas_Tacticus/E*.html');
  assert.equal(aeneas.source_link_status, 'context_only_not_pair_provenance');
  assert.equal(aeneas.citation_erratum.previous_url, 'https://www.gutenberg.org/ebooks/31958');

  const oldEval = readJsonl(path.join(BASE, 'llm-3shot-eval.jsonl'));
  const currentEval = readJsonl(path.join(OUT, 'llm-3shot-eval.jsonl'));
  assert.equal(currentEval.length, oldEval.length);
  const changed = currentEval.filter((record, i) => JSON.stringify(record) !== JSON.stringify(oldEval[i]));
  assert.equal(changed.length, 65, 'three Two-square and 62 fixed-convention prompts change');
  const correctedSquares = changed.filter(record => record.cipher_type === 'two_square');
  assert.deepEqual(correctedSquares.map(record => record.id),
    ['eval-two-square-005', 'eval-two-square-006', 'eval-two-square-007']);
  assert.equal(changed.filter(record => record.prompts.key_recovery.evaluation.target ===
    'No external key (fixed teaching convention)').length, 62);
  for (const prompt of correctedSquares) {
    const challenge = canonical.get(prompt.source_record);
    const examples = ['two-square-002', 'two-square-003', 'two-square-004']
      .map(id => canonical.get(id));
    const matches = [...prompt.prompts.three_shot.prompt.matchAll(/Ciphertext: ([A-Z]+)/g)];
    assert.deepEqual(matches.map(match => match[1]),
      [...examples.map(record => record.ciphertext), challenge.ciphertext],
      `${prompt.id}: all three examples and challenge use corrected pairs`);
    assert.ok(prompt.prompts.challenge.prompt.includes(`Ciphertext: ${challenge.ciphertext}\n`));
    assert.ok(prompt.prompts.key_recovery.prompt.includes(`Ciphertext: ${challenge.ciphertext}\n`));
    assert.equal(prompt.prompts.three_shot.evaluation.target, challenge.plaintext);
    assert.equal(prompt.prompts.challenge.evaluation.target, challenge.plaintext);
  }
  console.log('v0.8 supplements: 87 historical entries, 300 LLM prompts and checksums verified');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
