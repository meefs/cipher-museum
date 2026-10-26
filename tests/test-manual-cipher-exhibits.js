#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const ROOT = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const vectors = require('./engines/helpers/historical-vectors');
const entries = JSON.parse(read('data/exhibit-trust.json')).exhibits;
const search = JSON.parse(read('js/search-index.json')).entries;
const cards = JSON.parse(read('data/artifact-cards.json')).cards;
const { computeCounts } = require('../scripts/build-counts');
const cases = [
  ['rs44', 'rasterschluessel44', 165, 'transposition', 'IV', vectors.rs44, 'rs-row', '0', '5'],
  ['double-playfair', 'doublePlayfair', 166, 'substitution', 'II', vectors.doublePlayfair, 'dp-a', 'AAAAAAAAAAAAAAAAAAAAAAAAA', 'HILQETUARSBKXFGPWCOZDVYMN'],
  ['amsco', 'amsco', 167, 'transposition', 'IV', vectors.amsco, 'amsco-key', '41125', '41325']
];
const core = [...read('sw.js').match(/const CORE = \[([\s\S]*?)\];/)[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1].slice(1));
for (const [slug, engine, number, hall, roman, vector, invalidId, bad, good] of cases) {
  const file = `ciphers/${slug}.html`, raw = read(file), errors = [];
  const vc = new VirtualConsole(); vc.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(raw, { runScripts: 'outside-only', pretendToBeVisual: true,
    url: 'http://localhost/' + file, virtualConsole: vc });
  const w = dom.window, d = w.document, $ = id => d.getElementById(id);
  w.matchMedia = () => ({ matches: true }); // Actual reduced-motion path, no timer flakiness.
  for (const script of d.querySelectorAll('script[src]')) {
    const rel = path.posix.normalize(path.posix.join('ciphers', script.getAttribute('src')));
    assert(core.includes(rel), file + ': cold-offline script ' + rel);
    // Navigation is unrelated to these controls and has its own wiring suites.
    if (!rel.endsWith('/nav.js') && !rel.endsWith('/lightbox.js')) w.eval(read(rel));
  }
  const input = (id, value) => { $(id).value = value; $(id).dispatchEvent(new w.Event('input', { bubbles: true })); };
  assert.deepEqual(errors, []);
  assert.equal(d.querySelector('[data-manual-demo]').dataset.manualDemo, engine);
  assert.equal($('manual-message').value, vector.plain);
  assert.equal($('manual-output').textContent, vector.cipher, file + ': complete independent source vector through real UI');
  assert(raw.includes(vector.cipher), file + ': displayed example equals source answer');
  assert.match($('manual-animation-status').textContent, /^0 \/ /);
  const step = $('manual-step'); step.focus(); step.click();
  assert.equal(d.activeElement, step, 'Keyboard focus survives rendering');
  assert.match($('manual-animation-status').textContent, /^1 \/ /);
  assert(d.querySelector('.manual-active') || slug === 'double-playfair', 'Current cell is highlighted');
  $('manual-play').click();
  assert.equal($('manual-progress-output').textContent, vector.cipher, 'Complete animation agrees with complete result');
  assert.equal($('manual-play').disabled, true);
  $('manual-use-output').click();
  assert.equal($('manual-output').textContent, vector.plain, 'Actual opposite-mode control decrypts independent vector');
  assert.equal(d.querySelector('[data-mode="decrypt"]').getAttribute('aria-pressed'), 'true');
  $('manual-play').click();
  assert.equal($('manual-progress-output').textContent, vector.plain, 'Animated decryption reconstructs the same plaintext');
  input(invalidId, bad);
  for (const id of ['manual-output', 'manual-caption', 'manual-grid', 'manual-progress-output', 'manual-animation-status']) {
    assert.equal($(id).textContent, '', file + ': invalid input clears derived state ' + id);
  }
  assert($('manual-status').textContent.length > 0);
  assert.equal($('manual-use-output').disabled, true);
  if ($('manual-squares')) assert.equal($('manual-squares').children.length, 0);
  input(invalidId, good);
  assert.equal($('manual-output').textContent, vector.plain, 'Invalid → valid recovers without stale mode or trace');
  assert($('manual-caption').textContent.length > 0);
  d.querySelector('[data-mode="encrypt"]').click(); input('manual-message', vector.plain);
  if (slug === 'double-playfair') {
    // 34 arrangement steps, then vertical pair formation, then both real substitutions.
    for (let i = 0; i < 35; i++) $('manual-step').click();
    assert.match($('manual-animation-status').textContent, /Form pair FA vertically/);
    $('manual-step').click(); assert.match($('manual-animation-status').textContent, /First substitution: FA → TR/);
    $('manual-step').click(); assert.match($('manual-animation-status').textContent, /Second substitution: TR → VD/);
    input('manual-message', 'JJ'); $('manual-use-output').click(); assert.equal($('manual-output').textContent, 'IIII', 'December 1941 §4 doubles J, not generic Playfair J→I');
    input('manual-message', 'JI'); assert.match($('manual-status').textContent, /ciphertext J is invalid/);
  }
  if (slug === 'rs44') {
    assert.match(raw, /tactical time 1203/, 'Original March manual §28 uses time 1203');
    input('rs-minute', ''); assert.equal($('manual-output').textContent, '', 'An empty minute is not silently zero');
    assert.match($('manual-status').textContent, /minute are required/);
    input('rs-minute', '3'); assert.equal($('manual-output').textContent, vector.cipher);
    input('manual-message', 'A'.repeat(59)); assert.equal($('manual-output').textContent, '');
    input('rs-policy', 'short'); assert.equal($('manual-output').textContent.length, 59);
    input('manual-message', 'A'.repeat(201)); assert.equal($('manual-output').textContent, '');
    input('manual-message', 'A'.repeat(200)); assert.equal($('manual-output').textContent.length, 200);
  }
  if (slug === 'amsco') {
    input('amsco-key', '12'); input('manual-message', 'ABCDEF');
    assert.equal($('manual-output').textContent, 'ABDCEF', 'Even width must alternate row starts');
    input('amsco-first', '1'); assert.equal($('manual-output').textContent, 'ADEBCF', 'Single-first rows A|BC / DE|F read ADE then BCF');
  }
  for (const node of d.querySelectorAll('link[rel="stylesheet"]')) assert(core.includes(path.posix.normalize(path.posix.join('ciphers', node.getAttribute('href')))));
  const e = entries.find(e => e.number === number);
  assert.deepEqual(e && [e.path, e.label, e.collection, e.interactive], [file, 'broken', 'cipher-history', true]);
  assert.equal(search.filter(e => e.u === file).length, 1);
  assert.equal(search.find(e => e.u === file).exhibitNumber, number);
  assert.equal(cards[slug].hall, roman); assert.equal(cards[slug].trust.key, 'broken');
  assert.match(raw, new RegExp('Exhibit ' + number + ' of ' + computeCounts().total));
  for (const rel of ['museum-map.html', 'comparison.html', 'sitemap.xml', `halls/${hall}.html`]) assert(read(rel).includes(file), rel + ': registration');
  assert(read('lab/workbench.html').includes("id:'" + engine + "'"));
  assert(read('js/demo-loader.js').includes("engine:'" + engine + "'"));
  assert(core.includes(file), 'First-visit offline page registration');
  dom.window.close();
}
for (const [a,b] of [['rs44','turning-grille'],['rs44','columnar'],['rs44','myszkowski'],['amsco','columnar'],['amsco','myszkowski'],['double-playfair','playfair'],['double-playfair','two-square']]) {
  for (const [from,to] of [[a,b],[b,a]]) assert(read(`ciphers/${from}.html`).includes(to + '.html'), 'Reciprocal contextual link ' + from + ' → ' + to);
}
// Undated AMSCO must not be sorted as year zero. Exercise the real comparison UI.
{
  const dom = new JSDOM(read('comparison.html'), { runScripts: 'outside-only' });
  dom.window.eval(read('js/trust-labels.js'));
  for (const script of dom.window.document.querySelectorAll('script:not([src])')) dom.window.eval(script.textContent);
  const d = dom.window.document;
  for (const column of ['year', 'era']) for (let direction = 0; direction < 2; direction++) {
    d.querySelector(`th[data-col="${column}"]`).click();
    const rows = [...d.querySelectorAll('#cipher-tbody tr')];
    const amsco = rows.find(row => row.querySelector('a').getAttribute('href') === 'ciphers/amsco.html');
    assert.match(amsco.textContent, /AMSCO.*Undated specification/);
    const undatedHrefs = new Set([...read('comparison.html').matchAll(/href:'([^']+)'[^\n]*?year:null/g)].map(m => m[1]));
    const undated = row => undatedHrefs.has(row.querySelector('a').getAttribute('href'));
    const firstUndated = rows.findIndex(undated);
    assert(firstUndated > 0);
    assert(rows.slice(firstUndated).every(undated), 'All undated entries sort after dated entries in either direction');
  }
  dom.window.close();
}
const readme = read('README.md'), index = readme.slice(readme.indexOf('## 📖 Complete Cipher Index'));
for (const [slug] of cases) assert(index.includes('ciphers/' + slug + '.html'), 'README full index: ' + slug);
const hallRows = readme.slice(readme.indexOf('| Hall |'), readme.indexOf('###', readme.indexOf('| Hall |'))).split('\n').filter(s => /^\| \[[IVX]+\]/.test(s));
for (const row of hallRows) assert.equal(row.split('|').length, 5, 'README hall overview keeps three columns');
console.log('Manual-cipher exhibits passed: independent UI answers, animation stages, valid/invalid recovery, accessible controls and complete registration.');
