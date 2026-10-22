#!/usr/bin/env node
'use strict';
// Book-review regressions: constraint solving, evidence preservation and UI wiring.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const W = require('../js/detective/workspaces.js');
const root = path.join(__dirname, '..');

async function main() {
  // Original small fixture, computed independently by comparing shared A/B assignments.
  assert.equal(W.pattern('NOON'), '0.1.1.0');
  const result = W.candidates('ABBA AB', 'NOON DEED NO DO', {});
  assert.deepEqual(result.local, [['NOON', 'DEED'], ['NO', 'DO']]);
  assert.deepEqual(result.compatible, [['NOON'], ['NO']]);
  assert.equal(result.solutions.length, 1);
  assert.deepEqual(result.solutions[0].map, { A: 'N', B: 'O' });
  assert.equal(W.decode('ABBA AB', result.solutions[0].map), 'NOON NO');
  assert.equal(W.candidates('ABBAAB', 'NOON DEED NO DO', {}).solutions.length, 0, 'No invented word boundaries');
  assert.throws(() => W.candidates('AB?BA', 'NO ON', {}), /resolved A–Z/);
  assert.throws(() => W.candidates('AB◆BA', 'NO ON', {}), /resolved A–Z/);
  assert.equal(W.candidates('AB', 'AA', {}).solutions.length, 0, 'A substitution must be one-to-one');
  assert.equal(W.candidates('ABBA', 'NOON DEED', {}).solutions.length, 2, 'Do not turn multiple candidates into a unique answer');

  const desk = new W.Desk('ABBA AB!');
  assert.equal(W.decode(desk.state.text, desk.state.map), '···· ··!');
  desk.assign('A', 'N'); desk.lock('A', true);
  assert.throws(() => desk.assign('A', 'D'), /Unlock/);
  assert.throws(() => desk.assign('B', 'N'), /already assigned/);
  assert.throws(() => desk.assign('B', '◆'), /A–Z/);
  assert.equal(desk.suggest([{ cipher: 'A', plain: 'E' }, { cipher: 'B', plain: 'N' }, { cipher: 'C', plain: 'O' }]), 1);
  assert.deepEqual(desk.state.map, { A: 'N', C: 'O' });
  assert.equal(desk.state.locks.A, true, 'Suggestion attempts preserve locks');
  desk.undo(); assert.deepEqual(desk.state.map, { A: 'N' });
  desk.assign('B', 'O'); assert.equal(W.decode(desk.state.text, desk.state.map), 'NOON NO!');
  desk.clear(); assert.deepEqual(desk.state.map, { A: 'N' });
  desk.undo(); assert.deepEqual(desk.state.map, { A: 'N', B: 'O' });
  desk.setText('XYZ'); desk.undo();
  assert.equal(desk.state.text, 'ABBA AB!'); assert.equal(desk.state.locks.A, true);
  assert.throws(() => desk.apply({ A: 'D', B: 'O' }), /conflicts/);

  const raw = '12 ?4 56\n12 34 5? ◆';
  const pairs = W.tokenize(raw, 'digits', 2);
  assert.deepEqual(pairs.tokens.map(t => t.text), ['12', '?4', '56', '12', '34', '5?']);
  assert.equal(pairs.tokens[2].start, 7, 'Unreadable symbol retains its source position');
  assert.equal(W.tokenize(raw, 'digits', 1).tokens.length, 12);
  assert.equal(W.tokenize(raw, 'symbols', 1).tokens.at(-1).text, '◆');
  assert.deepEqual(pairs.excluded, [{ symbol: '◆', position: 19 }]);
  assert.deepEqual(W.tokenize('12◆34', 'digits', 5).tokens.map(t => t.text), ['12', '34'], 'Never concatenate across an excluded glyph');
  const saved = { version: 1, kind: 'cipher-museum-transcription', raw, mode: 'digits', width: 2, annotations: { '1': 'uncertain', '5': 'missing' } };
  assert.deepEqual(W.validateDocument(JSON.parse(JSON.stringify(saved))), saved);
  assert.equal(W.projectionAllowed(saved, pairs), false);
  assert.throws(() => W.validateDocument({ ...saved, annotations: { 9: 'missing' } }), /position/);
  assert.throws(() => W.validateDocument({ ...saved, mode: 'guess' }), /supported alphabet/);
  assert.throws(() => W.validateDocument({ ...saved, raw: 'A'.repeat(10001) }), /10,000/);
  const alphabetCopy = W.tokenize('Ab é ß 12\nC?', 'letters', 1);
  assert.equal(alphabetCopy.projection, 'ABC', 'Optional ASCII copy must not secretly transliterate or invent letters');
  assert.equal(alphabetCopy.tokens.at(-1).text, '?');

  const playback = fs.readFileSync(path.join(root, 'js/detective/playback.js'), 'utf8');
  assert.ok(!playback.includes('Every investigation begins the same way'), 'Do not teach universal destructive normalization');
  assert.ok(playback.includes('Preserve the original transcription first'));
  assert.ok(playback.includes('not a universal preparation rule'));

  const html = fs.readFileSync(path.join(root, 'cipher-detective.html'), 'utf8');
  const dom = new JSDOM(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ''), { runScripts: 'outside-only', url: 'https://ciphermuseum.com/cipher-detective.html' });
  const w = dom.window, d = w.document;
  for (const file of ['analyses.js', 'attacks.js', 'workspaces.js']) w.eval(fs.readFileSync(path.join(root, 'js/detective', file), 'utf8'));
  await new Promise(resolve => w.addEventListener('load', resolve));
  function click(id) { d.getElementById(id).click(); }
  function change(id, value) { const node = d.getElementById(id); node.value = value; node.dispatchEvent(new w.Event('change', { bubbles: true })); }
  assert.equal(d.querySelectorAll('#manual-key input[type=text]').length, 26);
  assert.equal(d.querySelectorAll('#manual-key input[type=checkbox]').length, 26);
  for (const input of d.querySelectorAll('#manual-key input')) assert.ok(input.getAttribute('aria-label'), 'Keyboard controls have accessible names');
  click('manual-patterns'); assert.equal(d.getElementById('manual-apply').disabled, false);
  assert.match(d.getElementById('manual-candidates').textContent, /Pattern \+ current key: NOON, DEED/);
  click('manual-apply'); assert.equal(d.getElementById('manual-plain').textContent, 'NOON NO');
  click('manual-lock-A'); click('manual-frequency');
  assert.equal(d.getElementById('manual-map-A').value, 'N'); assert.equal(d.getElementById('manual-lock-A').checked, true);
  change('manual-map-C', 'N'); assert.match(d.getElementById('manual-status').textContent, /already assigned/);
  assert.equal(d.getElementById('manual-map-C').value, '');
  click('manual-undo'); assert.equal(d.getElementById('manual-lock-A').checked, false);
  change('manual-cipher', 'AB?BA'); click('manual-patterns');
  assert.match(d.getElementById('manual-status').textContent, /resolved A–Z/);

  click('prep-example'); click('prep-export');
  const json = d.getElementById('prep-json').value, exported = JSON.parse(json);
  assert.equal(exported.raw, raw); assert.equal(exported.annotations['1'], 'uncertain');
  change('prep-width', '1');
  assert.equal(d.getElementById('prep-width').value, '2', 'Retokenization cannot silently erase uncertainty');
  assert.match(d.getElementById('prep-status').textContent, /Change refused/);
  click('prep-clear-annotations'); change('prep-width', '1');
  assert.equal(d.querySelectorAll('#prep-tokens tr').length, 12);
  d.getElementById('prep-json').value = json; click('prep-import');
  assert.equal(d.getElementById('prep-width').value, '2'); assert.equal(d.getElementById('prep-raw').value, raw);
  assert.equal(d.querySelectorAll('#prep-tokens select')[1].value, 'uncertain');
  assert.equal(d.getElementById('prep-send').disabled, true);
  // A clean alphabetic text marked uncertain also cannot evade its status by changing width.
  click('prep-clear-annotations'); change('prep-raw', 'Ab CD'); change('prep-mode', 'letters');
  const tokenStatus = d.querySelector('#prep-tokens select'); tokenStatus.value = 'uncertain'; tokenStatus.dispatchEvent(new w.Event('change'));
  assert.equal(d.activeElement, d.querySelector('#prep-tokens select'), 'Annotation updates retain keyboard focus');
  change('prep-width', '1'); assert.equal(d.getElementById('prep-send').disabled, true);
  click('prep-clear-annotations'); click('prep-send');
  assert.equal(d.getElementById('detective-input').value, 'ABCD');
  assert.equal(d.getElementById('prep-raw').value, 'Ab CD', 'Projection does not overwrite the source');
  assert.match(d.getElementById('prep-projection-note').textContent, /removes 1/);
  d.getElementById('prep-json').value = '{"version":1,"raw":"replacement"}'; click('prep-import');
  assert.equal(d.getElementById('prep-raw').value, 'Ab CD', 'Invalid import leaves evidence intact');
  assert.match(d.getElementById('prep-status').textContent, /Could not load/);
  dom.window.close();
  console.log('Detective review: substitution constraints, locks/undo, transcription preservation, source scope and DOM wiring passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
