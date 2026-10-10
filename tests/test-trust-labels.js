#!/usr/bin/env node
'use strict';

// Policy is deliberately independent of the manifest: adding a secure entry
// to the data source must not silently expand the modern-security allowlist.
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const { buildTrustLabels, LABELS } = require('../scripts/build-trust-labels');

const ROOT = path.resolve(__dirname, '..');
const SECURE_ALLOWLIST = new Set([
  'ciphers/one-time-pad.html',
  'ciphers/vernam.html',
  'ciphers/aes.html',
  'ciphers/rsa.html',
  'ciphers/sha256.html',
  'ciphers/diffie-hellman.html',
  'ciphers/ecdsa.html',
  'ciphers/shamir-secret-sharing.html',
  'ciphers/zero-knowledge-proofs.html'
]);
const HISTORICAL_SYSTEMS = ['sigaba', 'typex', 'kl-7', 'fialka', 'navajo-code-talkers'];
const CONTEXT_EXHIBITS = [
  'egyptian-substitution', 'aeneas-tacticus', 'rosetta-stone', 'chinese-telegraph', 'morse',
  'phaistos-disc', 'bletchley-park', 'cabinet-noir', 'kerckhoffs', 'station-hypo', 'bible-code',
  'rochefort', 'beurling', 'dilly-knox', 'yardley', 'mavis-batey', 'gchq-trio', 'kahn',
  'dunin', 'lasry', 'agnes-driscoll', 'bill-tutte', 'elizebeth-friedman', 'joan-clarke', 'leo-marks',
  'freemason-pigpen', 'bach-motif', 'sator-square', 'field-hollers', 'gold-bug', 'dancing-men',
  'da-vinci-code', 'national-treasure', 'gravity-falls', 'cicada-3301', 'mit-mystery-hunt', 'krypto-arg'
];

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }
function parse(rel) {
  return new JSDOM(read(rel), { virtualConsole: new VirtualConsole() });
}
function htmlFiles(dir) {
  return fs.readdirSync(path.join(ROOT, dir)).filter(f => f.endsWith('.html')).map(f => `${dir}/${f}`);
}

const { exhibits } = JSON.parse(read('data/exhibit-trust.json'));
const byPath = new Map(exhibits.map(e => [e.path, e]));
assert.equal(byPath.size, exhibits.length, 'Every manifest path is unique');
assert.equal(new Set(exhibits.map(e => e.number)).size, exhibits.length, 'Every exhibit number is unique');
assert.deepEqual([...byPath.keys()].sort(), [
  ...htmlFiles('ciphers'), ...htmlFiles('hall-of-foundations').filter(f => !f.endsWith('/index.html'))
].sort(), 'The audit covers every cipher, protocol, and Foundations exhibit on disk');

for (const entry of exhibits) {
  assert(entry.label === null || Object.hasOwn(LABELS, entry.label), `${entry.path}: known category or no label`);
  assert.equal(entry.label === 'secure', SECURE_ALLOWLIST.has(entry.path),
    `${entry.path}: Secure (Modern) is reserved for the explicit allowlist`);
  if (entry.path.startsWith('hall-of-foundations/')) {
    assert.equal(entry.label, null, `${entry.path}: mathematics carries no cipher trust label`);
  }
}
for (const slug of CONTEXT_EXHIBITS) {
  assert.equal(byPath.get(`ciphers/${slug}.html`)?.label, null, `${slug}: context has no cipher trust label`);
}
for (const slug of HISTORICAL_SYSTEMS) {
  const rel = `ciphers/${slug}.html`;
  assert.equal(byPath.get(rel)?.label, 'historical', `${slug}: obsolete service success is Historical Only`);
  const dom = parse(rel);
  assert.match(dom.window.document.querySelector('.cipher-significance').textContent,
    /never publicly broken/i, `${slug}: qualify the historical claim in exhibit prose`);
  assert.equal(dom.window.document.querySelector('.page-meta .sec-secure'), null,
    `${slug}: service history must not use a green security badge`);
  dom.window.close();
}
for (const slug of ['enigma', 'lorenz', 'purple', 'des', 'great-cipher', 'm209', 'chaocipher',
  'copiale', 'mary-stuart-castelnau-letters', 'venona']) {
  assert.equal(byPath.get(`ciphers/${slug}.html`)?.label, 'broken', `${slug}: documented breaks retain Broken`);
}

// Check what a visitor actually sees, not only what the source data says.
function checkBadge(badge, entry, surface) {
  assert(entry, `${surface}: badge belongs to a known exhibit`);
  assert.notEqual(entry.label, null, `${surface}: context must not render a badge`);
  const definition = LABELS[entry.label];
  assert.equal(badge.textContent.trim(), definition.text, `${surface}: visible label matches source`);
  const modifiers = [...badge.classList].filter(c => /^trust-label--/.test(c) && c !== 'trust-label--sm');
  assert.deepEqual(modifiers, [`trust-label--${entry.label}`], `${surface}: class agrees with visible label`);
  if (badge.tagName === 'SPAN') {
    const tooltip = entry.label === 'historical' ? definition.description : definition.text;
    assert.equal(badge.title, tooltip, `${surface}: tooltip matches category`);
  } else {
    assert.equal(badge.title, definition.description, `${surface}: tooltip matches category`);
    assert.match(badge.getAttribute('aria-label'), new RegExp(definition.text.replace(/[()]/g, '\\$&')),
      `${surface}: accessible label agrees with visible label`);
    assert.equal(badge.getAttribute('href'), '../museum-map.html#trust-labels', `${surface}: badge links to definitions`);
  }
  if (badge.classList.contains('trust-label--secure') || badge.textContent.includes('Secure (Modern)')) {
    assert(SECURE_ALLOWLIST.has(entry.path), `${surface}: unauthorized Secure (Modern) on ${entry.path}`);
  }
}

const allHtml = [
  ...fs.readdirSync(ROOT).filter(f => f.endsWith('.html')),
  ...['ciphers', 'halls', 'hall-of-foundations', 'lab', 'tours', 'community'].flatMap(htmlFiles)
];
const rosterPaths = new Set();
for (const rel of allHtml) {
  const dom = parse(rel);
  const d = dom.window.document;
  const ownEntry = byPath.get(rel);
  if (ownEntry) {
    assert.equal(d.querySelectorAll('.trust-label-wrap').length, ownEntry.label === null ? 0 : 1,
      `${rel}: exactly the expected number of badge wrappers`);
    assert.equal(d.querySelectorAll('.trust-label').length, ownEntry.label === null ? 0 : 1,
      `${rel}: exactly the expected number of trust badges`);
  }
  if (rel === 'museum-map.html') {
    for (const row of d.querySelectorAll('.cipher-table tbody tr')) {
      const href = row.querySelector('a').getAttribute('href');
      const entry = byPath.get(href);
      assert(entry, `${href}: roster entry exists in manifest`);
      assert(!rosterPaths.has(href), `${href}: appears in roster exactly once`);
      rosterPaths.add(href);
      assert.equal(Number(row.cells[0].textContent), entry.number, `${href}: roster number matches source`);
      assert.equal(row.querySelectorAll('.trust-label').length, entry.label === null ? 0 : 1,
        `${href}: map renders or omits the badge according to source`);
    }
  }
  for (const badge of d.querySelectorAll('.trust-label')) {
    if (rel === 'museum-map.html' && badge.closest('#trust-labels')) {
      const key = Object.keys(LABELS).find(k => badge.classList.contains(`trust-label--${k}`));
      assert.equal(badge.textContent.trim(), LABELS[key]?.text, 'Map legend uses one of the four existing categories');
      continue;
    }
    let entry = ownEntry;
    if (rel === 'museum-map.html') entry = byPath.get(badge.closest('tr')?.querySelector('a')?.getAttribute('href'));
    if (rel.startsWith('halls/')) entry = byPath.get(badge.closest('a.cipher-card')?.getAttribute('href')?.replace(/^\.\.\//, ''));
    checkBadge(badge, entry, rel);
  }

  // Catch the exact modern label even if someone uses legacy badge markup,
  // plain text, a tooltip, or an accessible name instead of .trust-label.
  const nodes = d.querySelectorAll('body *');
  for (const node of nodes) {
    const ownText = [...node.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ');
    if (![ownText, node.title, node.getAttribute('aria-label')].some(t => t?.includes('Secure (Modern)'))) continue;
    if (rel === 'museum-map.html' && node.closest('#trust-labels')) continue;
    let target = ownEntry?.path;
    if (rel === 'museum-map.html') target = node.closest('tr')?.querySelector('a')?.getAttribute('href');
    if (rel.startsWith('halls/')) target = node.closest('a.cipher-card')?.getAttribute('href')?.replace(/^\.\.\//, '');
    assert(SECURE_ALLOWLIST.has(target), `${rel}: Secure (Modern) appears outside the explicit allowlist (${target})`);
  }
  dom.window.close();
}
assert.deepEqual([...rosterPaths].sort(), exhibits.filter(e => e.path.startsWith('ciphers/')).map(e => e.path).sort(),
  'Every cipher and protocol appears in the roster');
const searchEntries = new Map(JSON.parse(read('js/search-index.json')).entries.map(e => [e.u, e]));
for (const slug of HISTORICAL_SYSTEMS) {
  const rel = `ciphers/${slug}.html`;
  assert.equal(searchEntries.get(rel)?.b, 'Historical Only',
    `${rel}: search uses the canonical label after service-history badges are removed`);
}
for (const entry of searchEntries.values()) {
  if (entry.b === 'Secure (Modern)') {
    assert(SECURE_ALLOWLIST.has(entry.u), `${entry.u}: search must respect the modern-security allowlist`);
  }
}
assert.deepEqual(buildTrustLabels({ check: true }), [], 'All rendered badges are current; run npm run build:trust-labels');

console.log(`Trust-label audit passed: ${exhibits.length} exhibits, ${SECURE_ALLOWLIST.size} modern systems, all HTML surfaces agree.`);
