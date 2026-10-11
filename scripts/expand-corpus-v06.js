#!/usr/bin/env node
'use strict';

// Append-only, deterministic expansion. Old records (including known deviations)
// must not be rewritten to make a test pass. The v0.5 prefix is hash-pinned.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { engineNameFor, extractKey, expectedPlaintext } = require('../tests/engines/corpus-replay');
const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'public/corpus');
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const BASE_SHA256 = '7ad2982444c55bd26bd0b67694135d8bfc93134bdab7ef1d8d613c7370194f83';
const types = ['rs44', 'double_playfair', 'amsco'];
const labels = { rs44: 'RS44', double_playfair: 'German Double Playfair', amsco: 'AMSCO' };
const exhibits = { rs44: 'rs44', double_playfair: 'double-playfair', amsco: 'amsco' };

function rng(seed) {
  let s = seed >>> 0;
  return n => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s % n; };
}
function shuffle(values, next) {
  const a = [...values];
  for (let i = a.length - 1; i > 0; i--) { const j = next(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function generate() {
  const result = [];
  const words = 'ARCHIVE BRIDGE CANDLE DOOR EAST FIELD GARDEN HILL ISLAND JOURNAL KEY LANTERN MAP NORTH ORCHARD PAPER QUIET RIVER SOUTH TOWER UNION VALLEY WEST YARD ZONE'.split(' ');
  for (const [typeIndex, type] of types.entries()) for (let i = 0; i < 100; i++) {
    const next = rng(600000 + typeIndex * 1000 + i);
    // Freshly authored synthetic teaching text, not an intercepted message.
    const code = String.fromCharCode(65 + typeIndex, 65 + Math.floor(i / 26), 65 + i % 26);
    let plain = 'THEARCHIVE' + code + 'REQUESTS';
    for (let j = 0; j < 40; j++) plain += words[next(words.length)];
    const length = type === 'rs44' ? 60 + i % 141 : 19 + i;
    plain = plain.slice(0, length);
    let settings;
    if (type === 'rs44') {
      settings = {
        grid: Array.from({length:24}, () => shuffle('.'.repeat(10) + '#'.repeat(15), next).join('')),
        order: shuffle(Array.from({length:25}, (_, j) => j + 1), next),
        startRow: next(24), startColumn: next(25), minute: next(60), strict: true
      };
    } else if (type === 'double_playfair') {
      settings = { squareA: shuffle('ABCDEFGHIKLMNOPQRSTUVWXYZ', next).join(''),
        squareB: shuffle('ABCDEFGHIKLMNOPQRSTUVWXYZ', next).join(''), filler: 'Z', strict: true };
    } else {
      settings = { order: shuffle(Array.from({length: 2 + i % 9}, (_, j) => j + 1), next), first: 1 + i % 2 };
    }
    const record = {
      id: `v06-${type}-${String(i + 1).padStart(3, '0')}`,
      title: `${labels[type]} synthetic exercise ${i + 1}`,
      cipher_family: type === 'double_playfair' ? 'polygraphic' : 'transposition', cipher_type: type,
      plaintext: plain, ciphertext: '', key: { type: 'settings', settings }, language: 'en', alphabet: 'A-Z',
      text_length: plain.length, normalized_text_length: plain.length, spacing: 'removed', punctuation: 'removed', casing: 'uppercase',
      difficulty: type === 'amsco' ? 'intermediate' : 'advanced', source_type: 'synthetic',
      source: 'Deterministic original teaching text; scripts/expand-corpus-v06.js, seed 600000 + typeIndex*1000 + index.',
      license: 'CC0-1.0', expected_attacks: type === 'amsco' ? ['column permutation search', 'language scoring'] :
        type === 'rs44' ? ['known-stencil message fitting', 'crib analysis'] : ['known-plaintext analysis', 'heuristic key search'],
      tags: ['manual-cipher', 'v0.6', 'synthetic'], created_by: 'Cipher Museum', verified: true, dataset_version: '0.6',
      split: i < 70 ? 'public' : 'blind', transcription_quality: 'clean',
      source_provenance: {url: 'https://github.com/systemslibrarian/cipher-museum/blob/main/scripts/expand-corpus-v06.js',
        archive: 'Cipher Museum source repository; original synthetic exercises', publication_date: '2026-10-11', license: 'CC0-1.0'},
      related_exhibit_url: `https://ciphermuseum.com/ciphers/${exhibits[type]}.html`,
      notes: type === 'rs44' ? 'March 1944 calculated-readout procedure with synthetic valid stencil and explicit settings; already prepared A-Z, 60–200 letters. Not historical traffic.' :
        type === 'double_playfair' ? 'December 1941 procedure; J expands to II; odd prepared length retains filler Z on decryption. Squares are synthetic. Not historical traffic.' :
        'ACA AMSCO convention; first cell size is explicit, first row and first column alternate; ragged final cells are retained. Not historical traffic.',
      scoring_notes: type === 'double_playfair' ? 'Score prepared plaintext with J→II and retained final Z for odd prepared length; do not strip arbitrary trailing Z.' : 'Score exact prepared A-Z plaintext.'
    };
    const engine = global.CipherEngines[engineNameFor(type)];
    record.ciphertext = engine.encode(plain, extractKey(record));
    if (record.ciphertext.startsWith('Error:') || engine.decode(record.ciphertext, extractKey(record)) !== expectedPlaintext(record)) throw new Error('Invalid new record: ' + record.id);
    result.push(record);
  }
  return result;
}

async function main() {
  const original = fs.readFileSync(path.join(dir, 'all.jsonl'), 'utf8');
  const lines = original.trimEnd().split('\n');
  const base = lines.slice(0, 100026).join('\n') + '\n';
  if (hash(base) !== BASE_SHA256) throw new Error('v0.5 baseline changed; refusing expansion');
  const additions = generate();
  const tail = additions.map(r => JSON.stringify(r)).join('\n') + '\n';
  if (lines.length !== 100026 && original !== base + tail) throw new Error('Unexpected existing expansion; refusing overwrite');
  fs.writeFileSync(path.join(dir, 'all.jsonl'), base + tail);
  fs.writeFileSync(path.join(dir, 'manual-ciphers-v0.6.jsonl'), tail);
  const records = [...lines.slice(0, 100026).map(l => JSON.parse(l)), ...additions];
  // Keep legacy supplemental records and ordering; append only the new records.
  for (const difficulty of ['beginner', 'intermediate', 'advanced', 'expert']) {
    const file = path.join(dir, difficulty + '.jsonl');
    const old = fs.readFileSync(file, 'utf8').trimEnd().split('\n').filter(l => !JSON.parse(l).id.startsWith('v06-'));
    fs.writeFileSync(file, old.concat(additions.filter(r => r.difficulty === difficulty).map(r => JSON.stringify(r))).join('\n') + '\n');
  }
  const out = fs.createWriteStream(path.join(dir, 'all.json'));
  out.write('[\n');
  for (let i = 0; i < records.length; i++) {
    const text = JSON.stringify(records[i], null, 2).split('\n').map(l => '  ' + l).join('\n');
    if (!out.write(text + (i + 1 < records.length ? ',\n' : '\n'))) await new Promise(resolve => out.once('drain', resolve));
  }
  out.write(']\n'); await new Promise(resolve => out.end(resolve));
  // Include keys and conventions in CSV too, so its new records are reproducible.
  const columns = ['id','title','cipher_family','cipher_type','plaintext','ciphertext','difficulty','language','source_type','license','verified','dataset_version','split','key','notes','scoring_notes'];
  const csv = fs.createWriteStream(path.join(dir, 'all.csv'));
  csv.write(columns.join(',') + '\n');
  for (const r of records) {
    const row = columns.map(k => '"' + String(k === 'key' ? JSON.stringify(r.key) : k === 'verified' ? (r.verified ? 'True' : 'False') : r[k] ?? '').replace(/"/g, '""') + '"').join(',');
    if (!csv.write(row + '\n')) await new Promise(resolve => csv.once('drain', resolve));
  }
  await new Promise(resolve => csv.end(resolve));
  const samplePath = path.join(dir, 'browser-sample.json');
  const sample = JSON.parse(fs.readFileSync(samplePath, 'utf8')).filter(r => !r.id.startsWith('v06-'));
  fs.writeFileSync(samplePath, JSON.stringify(sample.concat(additions.filter(r => r.id.endsWith('-001') || r.id.endsWith('-002') || r.id.endsWith('-003'))), null, 2) + '\n');
  const counts = {}, engineCounts = {};
  for (const r of records) { counts[r.cipher_type] = (counts[r.cipher_type] || 0) + 1; const e = engineNameFor(r.cipher_type); engineCounts[e] = (engineCounts[e] || 0) + 1; }
  const manifestPath = path.join(root, 'corpus/engine-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.generated = '2026-10-11'; manifest.dataset_version = '0.6'; manifest.total_records = records.length;
  for (const e of manifest.engines) e.record_count = engineCounts[e.name] || 0;
  for (const type of types) if (!manifest.engines.some(e => e.name === engineNameFor(type))) manifest.engines.push({name:engineNameFor(type),label:labels[type],category:type === 'double_playfair' ? 'polygraphic' : 'transposition',difficulty:type === 'amsco' ? 'intermediate' : 'advanced',variants:100,record_count:100});
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  const stats = {version:'0.6', date:'2026-10-11', records:records.length, cipherTypes:Object.keys(counts).length,
    coveredEngines:Object.keys(engineCounts).length, registeredEngines:Object.keys(global.CipherEngines).length,
    languages:[...new Set(records.map(r => r.language))].sort(), historicalRecords:records.filter(r => r.source_type === 'historical').length,
    baseline:{version:'0.5', records:100026, sha256:BASE_SHA256, commit:'3213743bb6b4ce81233339a40794f2e6f986cf6d'},
    addedRecords:additions.length, perType:counts, perEngine:engineCounts};
  fs.writeFileSync(path.join(dir, 'stats.json'), JSON.stringify(stats, null, 2) + '\n');
  const evalRun = spawnSync(process.execPath, ['scripts/generate-llm-eval.js'], {cwd:root,stdio:'inherit'});
  if (evalRun.status !== 0) throw new Error('Evaluation export failed');
  const checksumPath = path.join(dir, 'SHA256SUMS.txt');
  const files = [...new Set(fs.readFileSync(checksumPath, 'utf8').trim().split('\n').map(l => l.split(/\s+/)[1]).concat(['manual-ciphers-v0.6.jsonl','browser-sample.json','stats.json','cipher-corpus.schema.json']))];
  fs.writeFileSync(checksumPath, files.map(f => hash(fs.readFileSync(path.join(dir, f))) + '  ' + f).join('\n') + '\n');
  console.log(JSON.stringify({...stats,perType:undefined,perEngine:undefined}));
}
if (require.main === module) main().catch(e => { console.error(e); process.exitCode = 1; });
module.exports = { generate, BASE_SHA256 };
