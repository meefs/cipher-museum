#!/usr/bin/env node
'use strict';

/**
 * build-corpus-v07.js — derive the canonical Cipher Corpus v0.7 dataset from the
 * immutable v0.6 archive.
 *
 * The v0.6 files are never written. Everything this script emits lands under
 * public/corpus/v0.7/, so v0.6 keeps its bytes, its checksums and its DOI.
 *
 * Run:  node scripts/build-corpus-v07.js            (write outputs)
 *       node scripts/build-corpus-v07.js --check    (verify outputs are current)
 *
 * It applies the four deferred v0.6 findings:
 *
 *   CM-002  Historical records gain explicit `authenticity` and `pair_status`
 *           classifications plus a `benchmark_eligible` flag; records whose
 *           ciphertext matches a source-review trigger are withheld; the
 *           Kryptos K1 pair and key are corrected from a verified primary source.
 *   CM-008  Both length fields are recomputed from `plaintext` alone by the one
 *           definition in scripts/corpus-text-metrics.js.
 *   CM-014  Duplicate tags are removed deterministically, first occurrence kept.
 *   CM-020  The schema's `split` description no longer calls a downloadable
 *           label held-out evaluation data.
 *
 * Determinism: input order is preserved, object keys are emitted in a fixed
 * order, and no clock or random source is consulted except the release date
 * recorded in the manifest, which is read from the decisions file.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const metrics = require('./corpus-text-metrics.js');

const ROOT = path.resolve(__dirname, '..');
const V06_JSONL = path.join(ROOT, 'public/corpus/all.jsonl');
const V06_SCHEMA = path.join(ROOT, 'public/corpus/cipher-corpus.schema.json');
const REVIEW = path.join(ROOT, 'data/corpus-historical-review.json');
const DECISIONS = path.join(ROOT, 'data/corpus-v0.7-decisions.json');
const OUT_DIR = path.join(ROOT, 'public/corpus/v0.7');

const CORPUS_VERSION = '0.7';
const CHECK_ONLY = process.argv.includes('--check');

/* ------------------------------------------------------------------ helpers */

const letters = value => String(value ?? '').toUpperCase().replace(/[^A-Z]/g, '');
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Deterministic historical ciphertext review trigger (CM-002).
 *
 * A ciphertext of 20+ A-Z letters whose letters are all distinct, or which is a
 * contiguous run of the alphabet, merits source verification. The probability
 * of 25 distinct letters is ~1.7e-9 only under independent uniform A-Z draws;
 * it is not the probability of fabrication under arbitrary cipher models.
 * Historical API name retained for callers. Null means only that this specific
 * pattern is absent; it does not establish historical authenticity.
 */
function fabricationSignature(ciphertext) {
  const text = letters(ciphertext);
  if (text.length < 20) return null;
  if (ALPHABET.includes(text)) {
    return { signature: 'contiguous-alphabet-run', ciphertext_letters: text.length, distinct_letters: new Set(text).size };
  }
  if (new Set(text).size === text.length) {
    return { signature: 'all-distinct-letters', ciphertext_letters: text.length, distinct_letters: new Set(text).size };
  }
  return null;
}

/** P(all letters distinct) for a length-n string drawn uniformly from A-Z. */
function distinctProbability(n) {
  let p = 1;
  for (let i = 0; i < n && i < 26; i += 1) p *= (26 - i) / 26;
  return n > 26 ? 0 : p;
}

/** Remove duplicate tags, keeping first occurrence order (CM-014). */
function dedupeTags(tags) {
  if (!Array.isArray(tags)) return tags;
  const seen = new Set();
  const out = [];
  for (const tag of tags) {
    if (seen.has(tag)) continue;
    seen.add(tag);
    out.push(tag);
  }
  return out;
}

/** Stable key order so regeneration is byte-identical. */
const KEY_ORDER = [
  'id', 'title', 'cipher_family', 'cipher_type', 'plaintext', 'ciphertext', 'key',
  'language', 'alphabet', 'text_length', 'normalized_text_length', 'spacing',
  'punctuation', 'casing', 'difficulty', 'source_type', 'source', 'license',
  'expected_attacks', 'tags', 'created_by', 'verified', 'dataset_version',
  'source_batch', 'corpus_version', 'authenticity', 'pair_status',
  'verification_method', 'benchmark_eligible', 'split', 'transcription_quality',
  'source_provenance'
];

function orderKeys(record) {
  const out = {};
  for (const key of KEY_ORDER) if (key in record) out[key] = record[key];
  for (const key of Object.keys(record)) if (!(key in out)) out[key] = record[key];
  return out;
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

/* -------------------------------------------------------------------- build */

function build() {
  const decisions = JSON.parse(fs.readFileSync(DECISIONS, 'utf8'));
  const review = JSON.parse(fs.readFileSync(REVIEW, 'utf8'));
  const source = fs.readFileSync(V06_JSONL, 'utf8').split('\n').filter(Boolean);

  const reconstructionIds = new Set(decisions.reconstructions.ids);
  const correctionsById = new Map(decisions.corrections.map(entry => [entry.id, entry]));
  const excerptsById = new Map(decisions.excerpts.map(entry => [entry.id, entry]));
  // Records that do not round-trip through the museum engines, established by
  // scripts/build-corpus-replay-status.js. Its totals match the repository's own
  // pinned replay accounting exactly (99,800 reproducing / 526 not).
  const replayStatus = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data/corpus-v0.7-replay-status.json'), 'utf8'));
  const notReproducing = new Set(replayStatus.not_reproducing_ids.map(entry => entry.id));
  const reproduces = id => !notReproducing.has(id);

  const records = [];
  const excluded = [];
  const changes = [];

  for (const line of source) {
    const original = JSON.parse(line);
    const record = { ...original };
    const recordChanges = [];

    // ---- CM-002: withhold source-unverified historical ciphertexts -------
    if (record.source_type === 'historical') {
      const reviewTrigger = fabricationSignature(record.ciphertext);
      if (reviewTrigger) {
        excluded.push({
          id: record.id,
          title: record.title,
          cipher_type: record.cipher_type,
          reason: 'historical ciphertext attribution unverified; pattern requires source review',
          evidence: {
            ...reviewTrigger,
            uniform_probability_all_distinct: Number(distinctProbability(reviewTrigger.ciphertext_letters).toExponential(2)),
            ciphertext: String(record.ciphertext)
          },
          source: record.source,
          retained_in: 'public/corpus/all.jsonl (immutable v0.6)'
        });
        continue;
      }
    }

    // ---- CM-002: verified corrections -----------------------------------
    const correction = correctionsById.get(record.id);
    if (correction) {
      for (const [field, change] of Object.entries(correction.fields)) {
        const before = record[field];
        if (JSON.stringify(before) !== JSON.stringify(change.from)) {
          throw new Error(`${record.id}: ${field} does not match the recorded "from" value; decisions file is stale`);
        }
        record[field] = change.to;
        recordChanges.push({ field, from: before, to: change.to, reason: change.reason });
      }
    }

    // ---- CM-002: classification ------------------------------------------
    if (record.source_type === 'historical') {
      const excerpt = excerptsById.get(record.id);
      if (excerpt) {
        record.authenticity = excerpt.authenticity;
        record.pair_status = excerpt.pair_status;
      } else if (correction) {
        record.authenticity = correction.resulting_authenticity;
        record.pair_status = correction.resulting_pair_status;
      } else {
        record.authenticity = reconstructionIds.has(record.id) ? 'reconstruction' : 'catalogued_unreviewed';
        record.pair_status = reproduces(record.id) ? 'verified_pair' : 'unverified_pair';
      }
    } else {
      record.authenticity = 'synthetic';
      record.pair_status = reproduces(record.id) ? 'verified_pair' : 'unverified_pair';
    }

    // How the pair was verified. Engine replay is the common case; a correction
    // verified against a primary source records documented_computation so that
    // engine-driven tooling can filter to what it can actually execute.
    if (record.pair_status !== 'verified_pair') {
      record.verification_method = 'none';
    } else if (reproduces(record.id)) {
      record.verification_method = 'engine_replay';
    } else {
      record.verification_method = 'documented_computation';
    }
    record.benchmark_eligible = record.pair_status === 'verified_pair';

    // `verified` was a meaningless generator flag in v0.6. In v0.7 it is
    // defined as the benchmark-eligibility of a reproducible pair.
    const verifiedBefore = record.verified;
    record.verified = record.benchmark_eligible;
    if (verifiedBefore !== record.verified) {
      recordChanges.push({ field: 'verified', from: verifiedBefore, to: record.verified, reason: 'v0.7 redefines verified as "pair reproduces and is benchmark-eligible"' });
    }

    // ---- CM-014: unique tags ---------------------------------------------
    const tagsBefore = record.tags;
    const tagsAfter = dedupeTags(tagsBefore);
    if (Array.isArray(tagsBefore) && tagsAfter.length !== tagsBefore.length) {
      record.tags = tagsAfter;
      recordChanges.push({ field: 'tags', from: tagsBefore, to: tagsAfter, reason: 'duplicate tags removed (CM-014)' });
    }

    // ---- CM-008: length fields -------------------------------------------
    const expected = metrics.metricsFor(record);
    for (const field of ['text_length', 'normalized_text_length']) {
      if (record[field] !== expected[field]) {
        recordChanges.push({ field, from: record[field], to: expected[field], reason: 'recomputed from plaintext by the v0.7 length contract (CM-008)' });
        record[field] = expected[field];
      }
    }

    // ---- release labelling ------------------------------------------------
    // dataset_version was a per-batch generator label. v0.7 makes it the
    // release and preserves the batch in source_batch.
    record.source_batch = original.dataset_version;
    record.dataset_version = CORPUS_VERSION;
    record.corpus_version = CORPUS_VERSION;

    records.push(orderKeys(record));
    if (recordChanges.length) changes.push({ id: record.id, changes: recordChanges });
  }

  return { records, excluded, changes, decisions, review, sourceCount: source.length };
}

/* ------------------------------------------------------------------ outputs */

function schemaFor(records) {
  const base = JSON.parse(fs.readFileSync(V06_SCHEMA, 'utf8'));
  const schema = { ...base };
  schema.$version = CORPUS_VERSION;
  schema.title = 'Cipher Corpus Record (v0.7)';
  schema.properties = { ...base.properties };

  // CM-020: describe the label accurately. Both splits ship in the public
  // download; neither is confidential or unseen.
  schema.properties.split = {
    type: 'string',
    enum: ['public', 'blind'],
    description: 'Benchmark split label. Both splits are published and downloadable: "public" is the default evaluation split and "blind" is a held-aside subset used to report a second score on records a tool was not tuned against. Neither label is secret, confidential, or withheld from the download. For a genuinely unseen evaluation, use data that has not been distributed. The immutable v0.6 schema described this label less accurately; its exact archived wording and the correction are recorded in docs/CORPUS-V06-ERRATA.md.'
  };

  // CM-008: the length fields now carry their contract.
  schema.properties.text_length = {
    type: 'integer',
    minimum: 0,
    description: 'Unicode code points in the plaintext after NFC normalization, counting every character as written. Derived from plaintext only; see scripts/corpus-text-metrics.js.'
  };
  schema.properties.normalized_text_length = {
    type: 'integer',
    minimum: 0,
    description: 'Cipher-relevant symbols in the plaintext: NFD normalize, drop combining marks, then count code points in Unicode categories L and N. Never exceeds text_length. Derived from plaintext only.'
  };

  // CM-014: uniqueness is part of the contract, not a convention.
  schema.properties.tags = {
    type: 'array',
    items: { type: 'string' },
    uniqueItems: true,
    description: 'Topic tags, unique within a record and ordered by first use.'
  };

  // CM-002: the classification fields.
  schema.properties.authenticity = {
    type: 'string',
    enum: ['authentic_artifact', 'authentic_excerpt', 'reconstruction', 'catalogued_unreviewed', 'synthetic'],
    description: 'What the material is. See data/corpus-v0.7-decisions.json for the definition of each value.'
  };
  schema.properties.pair_status = {
    type: 'string',
    enum: ['verified_pair', 'unverified_pair', 'not_a_pair'],
    description: 'Whether plaintext and ciphertext form a reproducible known-answer pair. Independent of authenticity: a teaching reconstruction can be a verified pair, and an authentic artifact may not be.'
  };
  schema.properties.verification_method = {
    type: 'string',
    enum: ['engine_replay', 'documented_computation', 'none'],
    description: 'How pair_status was established. engine_replay: the record round-trips through this repository\'s engines. documented_computation: verified against a primary source by a procedure recorded in data/corpus-v0.7-decisions.json, which the engines do not implement. none: not a verified pair. Tooling that drives the museum engines should filter on engine_replay.'
  };
  schema.properties.benchmark_eligible = {
    type: 'boolean',
    description: 'True only when pair_status is verified_pair. Benchmarks and any claim requiring a complete verified pair must filter on this field.'
  };
  schema.properties.verified = {
    type: 'boolean',
    description: 'v0.7 meaning: the pair reproduces and is benchmark-eligible, equal to benchmark_eligible. In v0.6 and earlier this was a generator/reviewer flag with no such guarantee.'
  };
  schema.properties.source_batch = {
    type: 'string',
    description: 'The generator batch label this record came from ("0.2", "0.5", "2.0", "0.6"). Provenance only; it does not order releases.'
  };
  schema.properties.corpus_version = {
    type: 'string',
    description: 'The dataset release this record belongs to.'
  };

  schema.required = [...base.required];
  for (const field of ['authenticity', 'pair_status', 'verification_method', 'benchmark_eligible', 'corpus_version', 'source_batch']) {
    if (!schema.required.includes(field)) schema.required.push(field);
  }
  return schema;
}

function statsFor(records) {
  const tally = field => records.reduce((acc, record) => {
    const key = String(record[field]);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const normalized = records.map(record => record.normalized_text_length);
  return {
    corpus_version: CORPUS_VERSION,
    records: records.length,
    cipher_types: new Set(records.map(record => record.cipher_type)).size,
    languages: new Set(records.map(record => record.language)).size,
    by_source_type: tally('source_type'),
    by_split: tally('split'),
    by_authenticity: tally('authenticity'),
    by_pair_status: tally('pair_status'),
    by_verification_method: tally('verification_method'),
    by_source_batch: tally('source_batch'),
    benchmark_eligible: records.filter(record => record.benchmark_eligible).length,
    normalized_text_length: {
      definition: 'See scripts/corpus-text-metrics.js',
      min: Math.min(...normalized),
      max: Math.max(...normalized),
      mean: Number((normalized.reduce((a, b) => a + b, 0) / normalized.length).toFixed(3))
    }
  };
}

function writeIfChanged(file, contents, written) {
  const exists = fs.existsSync(file);
  const current = exists ? fs.readFileSync(file, 'utf8') : null;
  if (current === contents) return false;
  if (CHECK_ONLY) {
    written.push(`${path.relative(ROOT, file)} is ${exists ? 'out of date' : 'missing'}`);
    return true;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
  written.push(path.relative(ROOT, file));
  return true;
}

function main() {
  const { records, excluded, changes, decisions, sourceCount } = build();
  const stale = [];

  const jsonl = records.map(record => JSON.stringify(record)).join('\n') + '\n';
  writeIfChanged(path.join(OUT_DIR, 'all.jsonl'), jsonl, stale);
  writeIfChanged(path.join(OUT_DIR, 'cipher-corpus.schema.json'),
    JSON.stringify(schemaFor(records), null, 2) + '\n', stale);
  writeIfChanged(path.join(OUT_DIR, 'stats.json'),
    JSON.stringify(statsFor(records), null, 2) + '\n', stale);
  writeIfChanged(path.join(OUT_DIR, 'excluded-records.json'), JSON.stringify({
    corpus_version: CORPUS_VERSION,
    policy: decisions.exclusion_policy,
    count: excluded.length,
    records: excluded
  }, null, 2) + '\n', stale);

  // Record-level inventory, compactly encoded. Every changed record appears.
  // Reasons are shared codes rather than a sentence repeated 84,000 times, and
  // the bulk length recomputation stores just the two before/after pairs, which
  // keeps the committed artifact reviewable instead of tens of megabytes.
  const REASON_CODES = {
    len: 'length fields recomputed from plaintext by the v0.7 contract (CM-008)',
    tags: 'duplicate tags removed, first use kept (CM-014)',
    verified: 'verified redefined as "pair reproduces and is benchmark-eligible"',
    ciphertext: 'ciphertext corrected against a verified primary source (CM-002)',
    key: 'key corrected against a verified primary source (CM-002)'
  };
  const codeFor = field => (field === 'text_length' || field === 'normalized_text_length')
    ? 'len' : (REASON_CODES[field] ? field : 'other');

  const changedFields = {};
  const compact = [];
  for (const entry of changes) {
    const row = { id: entry.id, reasons: [] };
    for (const change of entry.changes) {
      changedFields[change.field] = (changedFields[change.field] || 0) + 1;
      const code = codeFor(change.field);
      if (!row.reasons.includes(code)) row.reasons.push(code);
      if (change.field === 'text_length') row.tl = [change.from, change.to];
      else if (change.field === 'normalized_text_length') row.nl = [change.from, change.to];
      else if (change.field === 'tags') row.tags = { from: change.from, to: change.to };
      else if (change.field === 'verified') row.verified = [change.from, change.to];
      else row[change.field] = { from: change.from, to: change.to };
    }
    compact.push(row);
  }
  writeIfChanged(path.join(OUT_DIR, 'change-inventory.json'), JSON.stringify({
    corpus_version: CORPUS_VERSION,
    derived_from: { file: 'public/corpus/all.jsonl', corpus_version: '0.6', records: sourceCount },
    reason_codes: REASON_CODES,
    encoding: 'tl = [text_length before, after]; nl = [normalized_text_length before, after]; other fields carry {from, to}.',
    summary: {
      records_in: sourceCount,
      records_out: records.length,
      records_excluded: excluded.length,
      records_changed: changes.length,
      fields_changed: changedFields
    },
    excluded_ids: excluded.map(entry => entry.id),
    records: compact
  }) + '\n', stale);

  if (CHECK_ONLY) {
    if (stale.length) {
      console.error('v0.7 outputs are not current:\n  ' + stale.join('\n  '));
      process.exitCode = 1;
    } else {
      console.log(`v0.7 outputs are current: ${records.length} records, ${excluded.length} excluded.`);
    }
    return;
  }

  // Checksum manifest over exactly what this script emits.
  const manifestFiles = ['all.jsonl', 'cipher-corpus.schema.json', 'stats.json',
    'excluded-records.json', 'change-inventory.json'];
  const manifest = manifestFiles
    .map(name => `${sha256(path.join(OUT_DIR, name))}  ${name}`)
    .join('\n') + '\n';
  fs.writeFileSync(path.join(OUT_DIR, 'SHA256SUMS.txt'), manifest);

  console.log(`Cipher Corpus v0.7 built: ${records.length} records `
    + `(${sourceCount} in, ${excluded.length} withdrawn, ${changes.length} changed).`);
  console.log('Wrote: ' + manifestFiles.concat('SHA256SUMS.txt').join(', '));
}

if (require.main === module) main();

module.exports = { fabricationSignature, dedupeTags, distinctProbability, CORPUS_VERSION };
