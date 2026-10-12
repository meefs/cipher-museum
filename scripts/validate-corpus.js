#!/usr/bin/env node
'use strict';

/**
 * validate-corpus.js — validate a Cipher Corpus file against a dataset contract.
 *
 * Usage:
 *   node scripts/validate-corpus.js <corpus.jsonl> [--contract 0.6|0.7] [--schema <file>]
 *
 * The contract is a property of the dataset being validated, not of individual
 * records. This matters for duplicate tags: 484 records in the published v0.6
 * archive carry a repeated tag, those bytes are immutable and checksum-verified,
 * so the 0.6 contract tolerates them. The 0.7 contract does not, for any record,
 * whatever generator batch it originally came from. A historical batch label can
 * no longer wave a record past validation — only validating the legacy dataset
 * itself can, and that mode is selected explicitly.
 *
 * Contract 0.6 (immutable archive): schema validation plus the semantic checks
 * that were added as errata — unique IDs, non-empty required strings, non-empty
 * object keys, non-negative integer lengths.
 *
 * Contract 0.7 adds: unique tags everywhere; both length fields equal to the
 * values computed by scripts/corpus-text-metrics.js from the plaintext;
 * text_length >= normalized_text_length; the classification fields present and
 * internally consistent; and corpus_version matching the contract.
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const metrics = require('./corpus-text-metrics.js');

const ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = { corpus: null, contract: null, schema: null };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--contract') { args.contract = argv[i + 1]; i += 1; continue; }
    if (value === '--schema') { args.schema = argv[i + 1]; i += 1; continue; }
    if (value.startsWith('--')) continue;
    if (!args.corpus) args.corpus = value;
  }
  return args;
}

const CONTRACTS = {
  '0.6': {
    schema: path.join(ROOT, 'public/corpus/cipher-corpus.schema.json'),
    allowDuplicateTags: true,
    enforceLengthContract: false,
    requireClassification: false
  },
  '0.7': {
    schema: path.join(ROOT, 'public/corpus/v0.7/cipher-corpus.schema.json'),
    allowDuplicateTags: false,
    enforceLengthContract: true,
    requireClassification: true
  }
};

const REQUIRED_NON_EMPTY_STRINGS = [
  'id', 'title', 'cipher_family', 'cipher_type', 'plaintext', 'ciphertext',
  'source', 'license', 'created_by', 'dataset_version'
];

function semanticErrors(record, contract, seenIds) {
  const errors = [];

  for (const field of REQUIRED_NON_EMPTY_STRINGS) {
    if (typeof record[field] !== 'string' || !record[field].trim()) {
      errors.push(`${field} must be a non-empty string`);
    }
  }
  if (seenIds.has(record.id)) errors.push(`duplicate id ${record.id}`);
  seenIds.add(record.id);

  if (!record.key || typeof record.key !== 'object' || Array.isArray(record.key)
    || Object.keys(record.key).length === 0) {
    errors.push('key must be a non-empty object');
  }
  if (!Number.isInteger(record.text_length) || record.text_length < 0
    || !Number.isInteger(record.normalized_text_length) || record.normalized_text_length < 0) {
    errors.push('length fields must be non-negative integers');
  }

  if (Array.isArray(record.tags) && new Set(record.tags).size !== record.tags.length
    && !contract.allowDuplicateTags) {
    errors.push('tags must be unique');
  }

  if (contract.enforceLengthContract) {
    for (const drift of metrics.metricsDrift(record)) errors.push(drift);
    if (record.text_length < record.normalized_text_length) {
      errors.push('text_length must be >= normalized_text_length');
    }
  }

  if (contract.requireClassification) {
    if (record.benchmark_eligible !== (record.pair_status === 'verified_pair')) {
      errors.push('benchmark_eligible must be true exactly when pair_status is verified_pair');
    }
    if (record.verified !== record.benchmark_eligible) {
      errors.push('verified must equal benchmark_eligible in this contract');
    }
    const verifiedMethods = ['engine_replay', 'documented_computation'];
    if (record.pair_status === 'verified_pair' && !verifiedMethods.includes(record.verification_method)) {
      errors.push('a verified_pair must record how it was verified');
    }
    if (record.pair_status !== 'verified_pair' && record.verification_method !== 'none') {
      errors.push('verification_method must be "none" unless the pair is verified');
    }
    if (record.source_type === 'synthetic' && record.authenticity !== 'synthetic') {
      errors.push('synthetic records must carry authenticity "synthetic"');
    }
    if (record.source_type === 'historical' && record.authenticity === 'synthetic') {
      errors.push('historical records must not carry authenticity "synthetic"');
    }
  }

  return errors;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.corpus) {
    console.error('Usage: node validate-corpus.js <corpus.jsonl> [--contract 0.6|0.7] [--schema <file>]');
    process.exit(1);
  }

  let contractName = args.contract;
  if (!contractName) {
    // Infer from the file's own records so a caller cannot silently validate a
    // v0.7 dataset against the laxer legacy contract.
    const firstLine = fs.readFileSync(args.corpus, 'utf8').split('\n').find(line => line.trim());
    const first = firstLine ? JSON.parse(firstLine) : {};
    contractName = first.corpus_version === '0.7' ? '0.7' : '0.6';
  }
  const contract = CONTRACTS[contractName];
  if (!contract) {
    console.error(`Unknown contract ${contractName}; expected 0.6 or 0.7`);
    process.exit(1);
  }

  const schemaPath = args.schema || contract.schema;
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  const seenIds = new Set();
  let pass = 0;
  let fail = 0;
  let reported = 0;

  const lines = fs.readFileSync(args.corpus, 'utf8').split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    if (!line.trim()) continue;
    let record;
    try {
      record = JSON.parse(line);
    } catch (error) {
      console.error(`Line ${index + 1}: Invalid JSON: ${error}`);
      fail += 1;
      continue;
    }
    if (contract.requireClassification && record.corpus_version !== contractName) {
      console.error(`Line ${index + 1} (${record.id || 'no-id'}): corpus_version ${record.corpus_version} does not match contract ${contractName}`);
      fail += 1;
      continue;
    }
    const errors = semanticErrors(record, contract, seenIds);
    const schemaValid = validate(record);
    if (!schemaValid || errors.length) {
      fail += 1;
      if (reported < 50) {
        reported += 1;
        const schemaText = schemaValid ? '' : ajv.errorsText(validate.errors, { separator: '\n  ' });
        console.error(`Line ${index + 1} (${record.id || 'no-id'}):\n  ${[schemaText, ...errors].filter(Boolean).join('\n  ')}`);
      }
    } else {
      pass += 1;
    }
  }

  console.log(`\ncontract ${contractName}: ${pass} valid, ${fail} invalid records.`);
  process.exit(fail ? 1 : 0);
}

if (require.main === module) main();

module.exports = { main, semanticErrors, CONTRACTS };
