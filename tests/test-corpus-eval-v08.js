#!/usr/bin/env node
'use strict';

/** Review the v0.8 supporting export against the full canonical v0.8 corpus. */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');
const zlib = require('node:zlib');
const {
  engineNameFor, extractKey, expectedPlaintext, applyPlaintextPolicy,
  compactCiphertext
} = require('./engines/corpus-replay');

const root = path.resolve(__dirname, '..');
const base = path.join(root, 'public/corpus');
const current = path.join(base, 'v0.8');
const readJsonl = file => fs.readFileSync(file, 'utf8').trimEnd().split('\n').map(JSON.parse);

function describeKey(record) {
  const key = record.key;
  if (key?.type === 'none' && key.value == null) return 'No external key (fixed teaching convention)';
  if (key?.type === 'settings') return JSON.stringify(key.settings);
  if (!key || typeof key !== 'object') return String(key ?? 'none');
  if (key.value != null) return String(key.value);
  const fields = Object.entries(key).filter(([name]) => name !== 'type' && name !== 'label')
    .map(([name, value]) => `${name}=${value}`);
  return fields.length ? fields.join(', ') : String(key.type ?? 'none');
}

function shotKey(record) {
  return record.key?.type === 'none' && record.key.value == null
    ? 'none (fixed teaching convention)' : describeKey(record);
}

function answer(record) {
  return record.cipher_type === 'double_playfair' ? expectedPlaintext(record) : record.plaintext;
}

function replayPair(record) {
  const engine = global.CipherEngines[engineNameFor(record.cipher_type)];
  assert.ok(engine, `${record.id}: engine exists`);
  // The archived v0.6 Two-square records need the explicit legacy prefix,
  // whereas the corrected v0.8 pairs use the ACA rectangle convention.
  let key = extractKey(record);
  if (record.cipher_type === 'two_square') {
    assert.ok(key.startsWith('legacy:'), `${record.id}: replay helper legacy prefix`);
    key = key.slice('legacy:'.length);
  }
  const encrypted = engine.encode(record.plaintext, key);
  assert.equal(compactCiphertext(encrypted), compactCiphertext(record.ciphertext),
    `${record.id}: encode matches released pair`);
  const decrypted = engine.decode(record.ciphertext, key);
  assert.equal(applyPlaintextPolicy(decrypted, record), expectedPlaintext(record),
    `${record.id}: decode matches released pair`);
}

async function main() {
  const released = readJsonl(path.join(current, 'llm-3shot-eval.jsonl'));
  const archived = readJsonl(path.join(base, 'llm-3shot-eval.jsonl'));
  assert.equal(released.length, 300);
  assert.equal(archived.length, 300);

  const byId = new Map(), byType = new Map();
  const input = readline.createInterface({
    input: fs.createReadStream(path.join(current, 'all.jsonl.gz')).pipe(zlib.createGunzip()),
    crlfDelay: Infinity
  });
  for await (const line of input) {
    if (!line) continue;
    const record = JSON.parse(line);
    if (record.split !== 'public' || record.transcription_quality !== 'clean'
      || record.source_type === 'historical' || !record.plaintext || !record.ciphertext) continue;
    byId.set(record.id, record);
    if (!byType.has(record.cipher_type)) byType.set(record.cipher_type, []);
    byType.get(record.cipher_type).push(record);
  }
  for (const records of byType.values()) records.sort((a, b) => a.id.localeCompare(b.id));

  let correctedTwoSquare = 0, correctedKeyless = 0, unchanged = 0;
  let pairUses = 0;
  const seen = new Set();
  for (const [position, prompt] of released.entries()) {
    const id = prompt.source_record;
    const source = byId.get(id);
    assert.ok(source, `${id}: present in canonical v0.8 download`);
    assert.ok(!seen.has(id), `${id}: appears once in evaluation set`);
    seen.add(id);
    assert.equal(prompt.id, `eval-${id}`);
    assert.equal(prompt.cipher_type, source.cipher_type);
    assert.equal(prompt.difficulty, source.difficulty);
    const shots = byType.get(source.cipher_type).slice(0, 3);
    assert.equal(shots.length, 3, `${id}: three examples`);
    assert.ok(shots.every(record => record.id !== source.id), `${id}: no target leaked as example`);

    const three = prompt.prompts.three_shot;
    const challenge = prompt.prompts.challenge;
    const recovery = prompt.prompts.key_recovery;
    assert.deepEqual(Object.keys(prompt.prompts).sort(),
      ['challenge', 'key_recovery', 'three_shot']);
    assert.equal((three.prompt.match(/Example [1-3]:/g) || []).length, 3,
      `${id}: exactly three numbered examples`);
    for (const [i, shot] of shots.entries()) {
      assert.ok(three.prompt.includes(`Example ${i + 1}:\nCiphertext: ${shot.ciphertext}\nKey: ${shotKey(shot)}\nPlaintext: ${answer(shot)}`),
        `${id}: example ${i + 1} is an exact verified pair`);
    }
    assert.ok(three.prompt.includes(`Now decrypt this message.\nCiphertext: ${source.ciphertext}\nKey: ${shotKey(source)}\nPlaintext:`),
      `${id}: target ciphertext and key appear in three-shot prompt`);
    assert.ok(challenge.prompt.includes(`Ciphertext: ${source.ciphertext}\nPlaintext:`),
      `${id}: challenge ciphertext is current`);
    assert.ok(recovery.prompt.includes(`Plaintext: ${source.plaintext}\nCiphertext: ${source.ciphertext}\n`),
      `${id}: known-plaintext pair is current`);
    assert.equal(three.evaluation.target, answer(source), `${id}: three-shot target`);
    assert.equal(challenge.evaluation.target, answer(source), `${id}: challenge target`);
    assert.equal(recovery.evaluation.target, describeKey(source), `${id}: key/settings target`);

    const keyless = source.key?.type === 'none' && source.key.value == null;
    if (keyless) {
      correctedKeyless++;
      assert.ok(!JSON.stringify(prompt).includes('value=null'), `${id}: null is not a key`);
      assert.match(recovery.prompt, /no external key/i,
        `${id}: keyless recovery question is meaningful`);
    }
    if (prompt.cipher_type === 'two_square') correctedTwoSquare++;
    if (JSON.stringify(prompt) === JSON.stringify(archived[position])) unchanged++;

    for (const pair of [source, ...shots]) {
      assert.equal(pair.verified, true, `${pair.id}: verified`);
      assert.equal(pair.pair_status, 'verified_pair', `${pair.id}: pair status`);
      assert.equal(pair.verification_method, 'engine_replay', `${pair.id}: method`);
      assert.equal(pair.benchmark_eligible, true, `${pair.id}: benchmark eligible`);
      replayPair(pair);
      pairUses++;
    }
  }
  assert.equal(seen.size, 300);
  assert.equal(correctedTwoSquare, 3);
  assert.equal(correctedKeyless, 62);
  assert.equal(unchanged, 235, 'only 3 Two-square and 62 keyless prompt records differ from v0.6');
  assert.equal(pairUses, 1200);
  console.log('v0.8 evaluation: 300 prompts, 1,200 verified pair uses, '
    + '3 Two-square and 62 keyless corrections passed');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
