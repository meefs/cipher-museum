#!/usr/bin/env node
// validate-corpus-v0.2.js
// Validates all records in a JSONL file against the v0.2 schema
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const schemaPath = path.join(__dirname, '../public/corpus/cipher-corpus.schema.json');
const corpusPath = process.argv[2];
if (!corpusPath) {
  console.error('Usage: node validate-corpus-v0.2.js <corpus.jsonl>');
  process.exit(1);
}
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const ajv = new Ajv({allErrors: true, strict: false});
addFormats(ajv);
const validate = ajv.compile(schema);

// Duplicate tags carry no meaning and are rejected. Only the immutable
// published batches that already contain them are grandfathered, and they are
// named explicitly rather than compared: `dataset_version` is a per-batch
// generator label, not a release ordering — "0.2" is batch 1, "2.0" is batches
// 2 and 3, "0.5" the v0.5 regeneration and "0.6" the v0.6 additions, so "2.0"
// is older data than "0.6" despite sorting after it. Any unrecognised or
// future label therefore fails closed and must ship unique tags.
const LEGACY_DUPLICATE_TAG_BATCHES = new Set(['0.2']);

let fail = 0, pass = 0;
const seenIds = new Set();
const requiredNonEmptyStrings = [
  'id', 'title', 'cipher_family', 'cipher_type', 'plaintext', 'ciphertext',
  'source', 'license', 'created_by', 'dataset_version'
];
for (const [i, line] of fs.readFileSync(corpusPath, 'utf8').split(/\r?\n/).entries()) {
  if (!line.trim()) continue;
  let rec;
  try { rec = JSON.parse(line); } catch (e) {
    console.error(`Line ${i+1}: Invalid JSON: ${e}`);
    fail++;
    continue;
  }
  const semanticErrors = [];
  for (const field of requiredNonEmptyStrings) {
    if (typeof rec[field] !== 'string' || !rec[field].trim()) semanticErrors.push(`${field} must be a non-empty string`);
  }
  if (seenIds.has(rec.id)) semanticErrors.push(`duplicate id ${rec.id}`);
  seenIds.add(rec.id);
  if (!rec.key || typeof rec.key !== 'object' || Array.isArray(rec.key) || Object.keys(rec.key).length === 0) {
    semanticErrors.push('key must be a non-empty object');
  }
  if (!Number.isInteger(rec.text_length) || rec.text_length < 0 ||
      !Number.isInteger(rec.normalized_text_length) || rec.normalized_text_length < 0) {
    semanticErrors.push('length fields must be non-negative integers');
  }
  if (Array.isArray(rec.tags) && new Set(rec.tags).size !== rec.tags.length &&
      !LEGACY_DUPLICATE_TAG_BATCHES.has(String(rec.dataset_version))) {
    semanticErrors.push('tags must be unique (duplicates are grandfathered only for immutable batch '
      + [...LEGACY_DUPLICATE_TAG_BATCHES].join(', ') + ')');
  }
  const valid = validate(rec);
  if (!valid || semanticErrors.length) {
    fail++;
    const schemaText = valid ? '' : ajv.errorsText(validate.errors, {separator:'\n  '});
    console.error(`Line ${i+1} (${rec.id||'no-id'}):\n  ${[schemaText, ...semanticErrors].filter(Boolean).join('\n  ')}`);
  } else {
    pass++;
  }
}
console.log(`\n${pass} valid, ${fail} invalid records.`);
process.exit(fail ? 1 : 0);
