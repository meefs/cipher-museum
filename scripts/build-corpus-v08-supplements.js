#!/usr/bin/env node
'use strict';

/**
 * Publish corrected, separately versioned supporting downloads. The v0.6
 * exports remain frozen. A historical supplement is an inventory of teaching
 * records, not a source-authenticated benchmark.
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const readline = require('node:readline');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public/corpus/v0.8');
const OLD = path.join(ROOT, 'public/corpus');
const CHECK = process.argv.includes('--check');
const names = ['historical-supplement.jsonl', 'llm-3shot-eval.jsonl',
  'supplements-manifest.json', 'supplements-SHA256SUMS.txt'];
const changedIds = ['two-square-002', 'two-square-003', 'two-square-004',
  'two-square-005', 'two-square-006', 'two-square-007'];
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const jsonl = values => values.map(value => JSON.stringify(value)).join('\n') + '\n';

async function readSelected(input, predicate) {
  const found = new Map();
  const lines = readline.createInterface({ input, crlfDelay: Infinity });
  for await (const line of lines) {
    if (!line) continue;
    const record = JSON.parse(line);
    if (predicate(record)) found.set(record.id, record);
  }
  return found;
}

function write(name, value) {
  const file = path.join(OUT, name);
  if (CHECK) {
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== value)
      throw new Error(`Stale or missing ${name}: run node scripts/build-corpus-v08-supplements.js`);
  } else {
    fs.writeFileSync(file, value);
  }
}

function fixHistorical(previous, canonical, excluded) {
  if (previous.length !== 100 || excluded.size !== 13)
    throw new Error('Unexpected historical supplement or exclusion count');
  const ids = new Set();
  const output = [];
  let inCanonical = 0, canonicalHistorical = 0, canonicalSynthetic = 0, legacyUnreviewed = 0;
  for (const original of previous) {
    if (ids.has(original.id)) throw new Error(`Duplicate historical ID ${original.id}`);
    ids.add(original.id);
    if (excluded.has(original.id)) continue;
    const current = canonical.get(original.id);
    if (current) {
      if (current.corpus_version !== '0.8' ||
          !['historical', 'synthetic'].includes(current.source_type))
        throw new Error(`Unexpected canonical record ${original.id}`);
      output.push({ ...current, supplement_release: '0.8', supplement_inclusion: 'canonical_v0.8' });
      inCanonical++;
      if (current.source_type === 'historical') canonicalHistorical++;
      else canonicalSynthetic++;
      continue;
    }
    // The older supplement includes records never admitted to the canonical
    // set. A v0.6 verified flag cannot assert that these historical pairs are
    // authenticated or reproducible under the modern corpus contract.
    const record = {
      ...original,
      legacy_verified_flag: original.verified,
      verified: false,
      pair_status: 'unverified_pair',
      verification_method: 'none',
      benchmark_eligible: false,
      authenticity: 'catalogued_unreviewed',
      supplement_release: '0.8',
      supplement_inclusion: 'legacy_unreviewed',
      source_link_status: 'context_only_not_pair_provenance'
    };
    if (original.id === 'hist-aeneas-001') {
      const bad = 'https://www.gutenberg.org/ebooks/31958';
      if (record.source_provenance?.url !== bad)
        throw new Error('Reviewed Aeneas wrong-work citation has changed');
      record.source_provenance = {
        ...record.source_provenance,
        url: null,
        archive: 'Original source citation unresolved'
      };
      record.source_link_status = 'wrong_work_retired';
      record.citation_erratum = {
        status: 'wrong_work',
        previous_url: bad,
        previous_archive: original.source_provenance.archive,
        reviewed_on: '2026-10-22',
        note: 'Project Gutenberg 31958 is Tunturikoski, not Aeneas Tacticus. A source for this teaching pair has not been verified.'
      };
    }
    output.push(record);
    legacyUnreviewed++;
  }
  if (ids.size !== 100 || output.length !== 87 || inCanonical !== 42 ||
      canonicalHistorical !== 41 || canonicalSynthetic !== 1 || legacyUnreviewed !== 45 ||
      ![...excluded].every(id => ids.has(id)))
    throw new Error('Historical supplement ID accounting changed');
  if (output.some(record => excluded.has(record.id)))
    throw new Error('Withdrawn record retained in corrected supplement');
  return { records: output, inCanonical, canonicalHistorical, canonicalSynthetic, legacyUnreviewed };
}

function correctEval(previous, canonical, originalById) {
  if (previous.length !== 300) throw new Error('Unexpected LLM export count');
  let corrected = 0;
  const output = previous.map(original => {
    if (original.cipher_type !== 'two_square') return original;
    const challengeId = original.source_record;
    const expected = ['two-square-005', 'two-square-006', 'two-square-007'][corrected];
    if (challengeId !== expected) throw new Error(`Unexpected Two-square prompt ${challengeId}`);
    const ids = [...changedIds.slice(0, 3), challengeId];
    const oldRecords = ids.map(id => originalById.get(id));
    const newRecords = ids.map(id => canonical.get(id));
    if ([...oldRecords, ...newRecords].some(record => !record))
      throw new Error(`Missing Two-square pair for ${challengeId}`);
    if (original.prompts.three_shot.evaluation.target !== newRecords[3].plaintext ||
        original.prompts.challenge.evaluation.target !== newRecords[3].plaintext)
      throw new Error(`Mismatched evaluation plaintext for ${challengeId}`);
    const updated = structuredClone(original);
    const keys = ['three_shot', 'challenge', 'key_recovery'];
    for (const kind of keys) {
      let prompt = updated.prompts[kind].prompt;
      const matches = [...prompt.matchAll(/Ciphertext: ([A-Z]+)/g)];
      const pairIds = kind === 'three_shot' ? [0, 1, 2, 3] : [3];
      if (matches.length !== pairIds.length) throw new Error(`Unexpected ${kind} examples for ${challengeId}`);
      let position = 0;
      prompt = prompt.replace(/Ciphertext: ([A-Z]+)/g, (whole, cipher) => {
        const i = pairIds[position++];
        if (cipher !== oldRecords[i].ciphertext)
          throw new Error(`Prompt disagrees with archived ${ids[i]}: ${cipher}`);
        return `Ciphertext: ${newRecords[i].ciphertext}`;
      });
      updated.prompts[kind].prompt = prompt;
    }
    corrected++;
    return updated;
  });
  if (corrected !== 3) throw new Error(`Unexpected corrected LLM prompt count: ${corrected}`);
  return { records: output, corrected };
}

async function main() {
  const historical = fs.readFileSync(path.join(OLD, 'historical.jsonl'), 'utf8')
    .trimEnd().split('\n').map(line => JSON.parse(line));
  const evalRows = fs.readFileSync(path.join(OLD, 'llm-3shot-eval.jsonl'), 'utf8')
    .trimEnd().split('\n').map(line => JSON.parse(line));
  const excluded = new Set(JSON.parse(fs.readFileSync(path.join(OLD, 'v0.7/excluded-records.json'), 'utf8'))
    .records.map(record => record.id));
  const historyIds = new Set(historical.map(record => record.id));
  const wanted = new Set([...historyIds, ...changedIds]);
  const canonical = await readSelected(fs.createReadStream(path.join(OUT, 'all.jsonl.gz'))
    .pipe(zlib.createGunzip()), record => wanted.has(record.id));
  const originalById = await readSelected(fs.createReadStream(path.join(OLD, 'all.jsonl')),
    record => changedIds.includes(record.id));
  const revisedHistory = fixHistorical(historical, canonical, excluded);
  const revisedEval = correctEval(evalRows, canonical, originalById);
  const files = {
    'historical-supplement.jsonl': jsonl(revisedHistory.records),
    'llm-3shot-eval.jsonl': jsonl(revisedEval.records)
  };
  files['supplements-manifest.json'] = JSON.stringify({
    supplement_release: '0.8',
    full_corpus: 'public/corpus/v0.8/all.jsonl.gz',
    historical: {
      file: 'historical-supplement.jsonl',
      source_file: 'public/corpus/historical.jsonl',
      source_count: historical.length,
      excluded_withdrawn: excluded.size,
      records: revisedHistory.records.length,
      canonical_v0_8: revisedHistory.inCanonical,
      canonical_historical: revisedHistory.canonicalHistorical,
      canonical_reclassified_synthetic: revisedHistory.canonicalSynthetic,
      legacy_unreviewed: revisedHistory.legacyUnreviewed,
      note: 'Historical titles and contextual links do not authenticate pairs. One formerly historical entry was reclassified synthetic in v0.8. Only canonical records retain their v0.8 pair status. Retained supplemental-only records are unreviewed and excluded from benchmarks.'
    },
    llm_eval: {
      file: 'llm-3shot-eval.jsonl',
      source_file: 'public/corpus/llm-3shot-eval.jsonl',
      records: revisedEval.records.length,
      two_square_prompts_corrected: revisedEval.corrected,
      note: 'Only the three outdated Two-square prompts changed; other legacy evaluation prompts were copied without a full revalidation.'
    },
    published_v0_6_files_unchanged: true
  }, null, 2) + '\n';
  files['supplements-SHA256SUMS.txt'] = Object.entries(files)
    .map(([name, content]) => `${sha256(content)}  ${name}`).join('\n') + '\n';
  for (const name of names) write(name, files[name]);
  console.log(`v0.8 supporting downloads ${CHECK ? 'verified' : 'built'}: 87 historical, 300 LLM prompts`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
