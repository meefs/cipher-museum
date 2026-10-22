#!/usr/bin/env node
'use strict';

// Reproduce the supplemental-only teaching pairs with the current museum
// engines. A replay match establishes a local calculation, never historical
// provenance or an independent source transcription.

const fs = require('node:fs');
const path = require('node:path');
const helpers = require('../tests/engines/corpus-replay.js');
const engines = require('../js/ciphers/all-engines.js');

const ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(ROOT, 'public/corpus/v0.8/historical-supplement.jsonl');
const OUTPUT = path.join(ROOT, 'data/corpus-v0.8-supplement-replay-audit.json');
const CHECK = process.argv.includes('--check');

function replay(record) {
  const engine = engines[helpers.engineNameFor(record.cipher_type)];
  if (!engine) return { encode: 'no_engine', decode: 'no_engine' };
  let key;
  try { key = helpers.extractKey(record); }
  catch { return { encode: 'invalid_key', decode: 'invalid_key' }; }
  const result = {};
  try {
    result.encode = helpers.compactCiphertext(engine.encode(record.plaintext, key)) ===
      helpers.compactCiphertext(record.ciphertext) ? 'match' : 'mismatch';
  } catch { result.encode = 'threw'; }
  try {
    result.decode = helpers.applyPlaintextPolicy(engine.decode(record.ciphertext, key), record) ===
      helpers.expectedPlaintext(record) ? 'match' : 'mismatch';
  } catch { result.decode = 'threw'; }
  return result;
}

function audit() {
  const lines = fs.readFileSync(INPUT, 'utf8').trimEnd().split('\n');
  const records = lines.map(line => JSON.parse(line));
  const supplemental = records.filter(record => record.supplement_inclusion === 'legacy_unreviewed');
  if (records.length !== 87 || supplemental.length !== 45 ||
      new Set(supplemental.map(record => record.id)).size !== 45) {
    throw new Error('Unexpected v0.8 supplement accounting; review the audit scope');
  }
  const results = supplemental.map(record => {
    const status = replay(record);
    return { id: record.id, cipher_type: record.cipher_type,
      encode: status.encode, decode: status.decode };
  });
  const counts = {};
  for (const row of results) {
    const label = `${row.encode}_${row.decode}`;
    counts[label] = (counts[label] || 0) + 1;
  }
  return {
    audit_date: '2026-10-22',
    input: 'public/corpus/v0.8/historical-supplement.jsonl',
    engine: 'js/ciphers/all-engines.js via tests/engines/corpus-replay.js key and text policies',
    scope: 'Only the 45 legacy_unreviewed supplemental-only records',
    limitation: 'A local engine replay is not evidence of a historical ciphertext or source-verified pair. These records remain unverified and benchmark-ineligible even when their teaching examples reproduce.',
    counts,
    records: results
  };
}

function main() {
  const value = JSON.stringify(audit(), null, 2) + '\n';
  if (CHECK) {
    if (!fs.existsSync(OUTPUT) || fs.readFileSync(OUTPUT, 'utf8') !== value)
      throw new Error('Supplement replay audit changed; review and regenerate it');
  } else {
    fs.writeFileSync(OUTPUT, value);
  }
  console.log(`Supplement replay audit ${CHECK ? 'current' : 'written'}`);
}

if (require.main === module) main();
module.exports = { audit };
