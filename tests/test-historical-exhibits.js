#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const api = require('../js/historical-ciphers');
const { computeCounts } = require('../scripts/build-counts');
const ROOT = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');

// Trust names belong to generated badges, never independently maintained
// explanatory prose. This catches the reviewed NEMA "Broken" mutation and
// the corresponding Hagelin statement without discarding historical facts.
for (const slug of ['nema', 'hagelin-c36']) {
  const dom = new JSDOM(read(`ciphers/${slug}.html`));
  const panels = [...dom.window.document.querySelectorAll('.panel-body')];
  for (const panel of panels) panel.querySelectorAll('.trust-label').forEach(node => node.remove());
  const prose = panels.map(panel => panel.textContent).join(' ');
  for (const { text } of Object.values(require('../data/trust-labels.json'))) {
    assert(!prose.includes(text), `${slug}: classification statements must use canonical badges, not independent prose (${text})`);
  }
  dom.window.close();
}

// Independent known-answer tests: round trips alone would accept the wrong
// rotor wiring, a different transposition, or the wrong tie convention.
const nemaVector = 'HRSBVOOTZUCRWLMGRMGVWYWOVNF';
assert.equal(api.nema('A'.repeat(27), 'MQQPZQSOEV').output, nemaVector,
  'NEMA: Geoff Sullivan reference vector published in rmsk2/nema_test.cpp');
assert.equal(api.nema(nemaVector, 'MQQPZQSOEV').output, 'A'.repeat(27));
const holes = [0, 1, 2, 5];
assert.equal(api.turningGrille('ABCDEFGHIJKLMNOP', 4, holes).output, 'ABCEMDFGNOIHPJKL');
assert.equal(api.turningGrille('ABCEMDFGNOIHPJKL', 4, holes, true).output, 'ABCDEFGHIJKLMNOP');
assert.equal(api.myszkowski('WEAREDISCOVEREDFLEEATONCE', 'TOMATO').output, 'ROFOACDTEDSEEEACWEIVRLENE');
// ACA's published BANANA example, independent of the exhibit's own example.
const acaPlain = 'Incomplete columnar with pattern word key and letters under same number taken off by row from top to bottom';
const acaCipher = 'NOPEE OUNRI HATRW RKYNL TESNE SMNME TKNFB RWRMO TBTOI LLWTO ATDER OOTOC MTCMA TPEND EDERU RAUBA EFYFO POTM';
assert.equal(api.myszkowski(acaPlain, 'BANANA').output, api.clean(acaCipher));
assert.equal(api.myszkowski(acaCipher, 'BANANA', true).output, api.clean(acaPlain));
assert.throws(() => api.nema('HELLO', 'ABC'), /ten/);
assert.throws(() => api.grilleOrder(4, [0, 3, 12, 15]), /overlap/);
assert.throws(() => api.turningGrille('ABC', 4, holes, true), /complete/);
assert.throws(() => api.myszkowski('HELLO', ''), /keyword/);

for (let length = 0; length <= 100; length++) {
  const text = Array.from({ length }, (_, i) => 'AZQXENIGMA'[i % 10]).join('');
  const key = length % 2 ? 'AAAAAAAAAA' : 'ZXCVBNMASD';
  assert.equal(api.nema(api.nema(text, key).output, key).output, text);
  for (const word of ['TOMATO', 'BANANA', 'ZEBRA', 'AAAAAAAA', 'ABRACADABRA']) {
    assert.equal(api.myszkowski(api.myszkowski(text, word).output, word, true).output, text);
  }
  const result = api.turningGrille(text, 4, holes);
  assert.equal(api.turningGrille(result.output, 4, holes, true).output, text + 'X'.repeat(result.padding),
    'Grille padding is retained, including real trailing X letters');
}
const period = api.nema('A'.repeat(17577), 'AAAAAAAAAA').output;
assert.equal(period[0], period[17576], 'Military NEMA repeats after the published 17,576-step cycle');

function load(slug) {
  const errors = [];
  const console = new VirtualConsole();
  console.on('jsdomError', error => errors.push(error.message));
  const html = read(`ciphers/${slug}.html`).replace(/<script src="([^"]+)"[^>]*><\/script>/g, (_, src) =>
    '<script>' + fs.readFileSync(path.resolve(ROOT, 'ciphers', src), 'utf8').replace(/<\/script>/gi, '<\\/script') + '</script>');
  const dom = new JSDOM(html, { runScripts: 'dangerously', virtualConsole: console });
  const d = dom.window.document;
  return { dom, d, errors, $: id => d.getElementById(id),
    input(id, value) { const el = d.getElementById(id); el.value = value;
      el.dispatchEvent(new dom.window.Event('input', { bubbles: true })); } };
}

const p = load('nema');
assert.deepEqual(p.errors, []);
assert.equal(p.$('historical-output').textContent, nemaVector, 'NEMA UI announces the reference result');
assert.match(read('ciphers/nema.html'), new RegExp(nemaVector), 'NEMA worked example agrees with the result');
assert.equal(p.$('nema-trace').children.length, 12);
p.$('historical-use-output').click();
assert.equal(p.$('historical-output').textContent, 'A'.repeat(27), 'Opposite mode resets the machine before decrypting');
p.input('nema-windows', 'ABC');
assert.match(p.$('historical-status').textContent, /ten/);
assert.equal(p.$('historical-output').textContent, '', 'Invalid keys clear stale output');
assert.equal(p.$('nema-trace').children.length, 0);
p.dom.window.close();

const g = load('turning-grille');
assert.deepEqual(g.errors, []);
assert.equal(g.$('historical-output').textContent, 'ABCEMDFGNOIHPJKL');
assert.match(read('ciphers/turning-grille.html'), /ABCEMDFGNOIHPJKL/, 'Grille worked example is pinned');
const masks = [];
for (let rotation = 0; rotation < 4; rotation++) {
  masks.push([...g.$('grille-grid').children].flatMap((cell, i) => cell.getAttribute('aria-pressed') === 'true' ? [i] : []));
  assert.match(g.$('grille-angle').textContent, new RegExp(`${rotation * 90}°`));
  g.$('grille-rotate').click();
}
assert.equal(new Set(masks.flat()).size, 16, 'The visible mask covers each cell exactly once');
assert.deepEqual(masks, api.grilleOrder(4, holes).orientations);
g.$('grille-grid').children[15].click();
assert.notEqual(g.$('historical-output').textContent, 'ABCEMDFGNOIHPJKL', 'Changing a hole changes the cipher');
assert.equal(g.d.querySelectorAll('#grille-grid [aria-pressed="true"]').length, 4);
g.$('grille-rotate').click();
g.$('grille-grid').children[8].click();
assert.equal(g.d.querySelectorAll('#grille-grid [aria-pressed="true"]').length, 4, 'Editing a rotated mask keeps a valid orbit');
g.input('historical-message', 'HELLOX');
g.$('historical-use-output').click();
assert.equal(g.$('historical-output').textContent, 'HELLOX' + 'X'.repeat(10));
g.$('grille-reset').click();
g.$('grille-size').value = '6';
g.$('grille-size').dispatchEvent(new g.dom.window.Event('change', { bubbles: true }));
assert.equal(g.$('historical-output').textContent, '', 'Incomplete ciphertext is rejected after changing block size');
g.d.querySelector('[data-mode="encrypt"]').click();
assert.equal(g.$('grille-grid').children.length, 36);
assert.equal(g.d.querySelectorAll('#grille-grid [aria-pressed="true"]').length, 9);
g.$('historical-use-output').click();
assert.equal(g.$('historical-output').textContent.length, 36);
g.$('grille-size').value = '8';
g.$('grille-size').dispatchEvent(new g.dom.window.Event('change', { bubbles: true }));
g.d.querySelector('[data-mode="encrypt"]').click();
assert.equal(g.$('grille-grid').children.length, 64);
assert.equal(g.d.querySelectorAll('#grille-grid [aria-pressed="true"]').length, 16);
g.dom.window.close();

const m = load('myszkowski');
assert.deepEqual(m.errors, []);
assert.equal(m.$('historical-output').textContent, 'ROFOACDTEDSEEEACWEIVRLENE');
assert.match(read('ciphers/myszkowski.html'), /ROFOACDTEDSEEEACWEIVRLENE/);
assert.match(m.$('myszkowski-ranks').textContent, /4 3 2 1 4 3/);
m.$('historical-use-output').click();
assert.equal(m.$('historical-output').textContent, 'WEAREDISCOVEREDFLEEATONCE');
m.input('myszkowski-key', 'BANANA');
assert.match(m.$('myszkowski-ranks').textContent, /2 1 3 1 3 1/);
m.input('myszkowski-key', '');
assert.match(m.$('historical-status').textContent, /keyword/);
assert.equal(m.$('historical-output').textContent, '');
m.dom.window.close();

const entries = JSON.parse(read('data/exhibit-trust.json')).exhibits;
assert.deepEqual(entries.map(e => e.number).sort((a, b) => a - b), Array.from({ length: 164 }, (_, i) => i + 1));
const counts = computeCounts();
assert.deepEqual([counts.foundationsFirst, counts.foundationsLast, counts.protocolsFirst, counts.protocolsLast],
  [141, 157, 158, 160], 'Appending new ciphers must not renumber existing wings');
const search = JSON.parse(read('js/search-index.json')).entries;
const artifactData = JSON.parse(read('data/artifact-cards.json'));
assert.equal(artifactData.totalExhibits, counts.ciphers + counts.protocols);
for (const [slug, number, label, hall] of [
  ['nema', 161, 'historical', 'machines'], ['hagelin-c36', 162, 'broken', 'machines'],
  ['turning-grille', 163, 'broken', 'transposition'], ['myszkowski', 164, 'broken', 'transposition']
]) {
  const rel = `ciphers/${slug}.html`;
  assert(entries.some(e => e.path === rel && e.number === number && e.label === label));
  assert.equal(search.filter(e => e.u === rel).length, 1, `${slug}: searchable exactly once`);
  assert.equal(search.find(e => e.u === rel).b, label === 'historical' ? 'Historical Only' : 'Broken');
  assert.match(read('sitemap.xml'), new RegExp(`https://ciphermuseum.com/ciphers/${slug}\.html`));
  assert.match(read(`halls/${hall}.html`), new RegExp(`href="../ciphers/${slug}\.html" class="cipher-card"`));
  assert.equal(artifactData.cards[slug].hall, hall === 'machines' ? 'VII' : 'IV');
  assert.deepEqual(artifactData.cards[slug].trust, { key: label, ...Object.fromEntries(
    Object.entries(require('../data/trust-labels.json')[label]).filter(([key]) => key !== 'icon')) });
  assert.equal(artifactData.cards[slug].securityFailure, entries.find(e => e.path === rel).note);
  assert.match(read('sw.js'), new RegExp(`'/ciphers/${slug}\\.html'`), `${slug}: precached for offline use`);
}
for (const [page, target] of [['m209', 'hagelin-c36'], ['hagelin-c36', 'm209'],
  ['cardano-grille', 'turning-grille'], ['turning-grille', 'cardano-grille'], ['columnar', 'myszkowski'], ['myszkowski', 'columnar']]) {
  assert.match(read(`ciphers/${page}.html`), new RegExp(`href="(?:../ciphers/)?${target}\.html"`), 'Reciprocal contextual link');
}
console.log('Historical exhibits passed: independent vectors, edge cases, live controls, catalog registration, and stable numbering.');
