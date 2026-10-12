#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const index = JSON.parse(fs.readFileSync(path.join(root, 'js/search-index.json'), 'utf8'));
const dom = new JSDOM('', { url: 'https://ciphermuseum.com/search.html', runScripts: 'outside-only' });
dom.window.fetch = async () => ({ ok: true, json: async () => index });
dom.window.eval(fs.readFileSync(path.join(root, 'js/search.js'), 'utf8'));

(async () => {
  await dom.window.CipherSearch.load();
  assert.equal(dom.window.CipherSearch.normalize('Vigenère'), 'vigenere');
  assert.ok(dom.window.CipherSearch.query('vigenere').some(hit => /Vigenère/i.test(hit.entry.title)),
    'ASCII query should match accented title');
  assert.ok(dom.window.CipherSearch.query('vigener').some(hit => /Vigenère/i.test(hit.entry.title)),
    'partial normalized query should match');
  assert.ok(dom.window.CipherSearch.query('wwi').every(hit => /(^|\W)wwi(\W|$)/i.test(
    dom.window.CipherSearch.normalize([hit.entry.title, hit.entry.created, hit.entry.summary, ...hit.entry.tags].join(' '))
  )), 'WWI query must not match an entry solely because it contains WWII');

  // Apostrophes are elided, not folded to one form: the exhibit is titled
  // "Ethiopian Geʼez Monastic Ciphers" with U+02BC, and a visitor types "geez".
  assert.equal(dom.window.CipherSearch.normalize('Geʼez'), 'geez');
  for (const spelling of ['geez', "ge'ez", 'geʼez', 'ge’ez']) {
    assert.ok(dom.window.CipherSearch.query(spelling).some(hit => /Geʼez/.test(hit.entry.title)),
      `apostrophe-insensitive query ${JSON.stringify(spelling)} should reach the Geʼez exhibit`);
  }
  assert.ok(dom.window.CipherSearch.query("shamir's").some(hit => /Shamir/.test(hit.entry.title)),
    'eliding apostrophes must not break a possessive title');

  // Titles hyphenate designations that visitors type closed up. Each of these
  // returned nothing at all before matching consulted a separator-insensitive
  // form, and the closed-up spelling must also rank its own exhibit first.
  for (const [typed, expected] of [['m209', /M-209/], ['sha256', /SHA-256/], ['kl7', /KL-7/], ['c38', /C-38/]]) {
    const hits = dom.window.CipherSearch.query(typed);
    assert.ok(hits.length, `${typed} must reach its exhibit`);
    assert.match(hits[0].entry.title, expected, `${typed} should rank its own exhibit first`);
  }

  // Era tokens keep the strict word test on every path, flattened included:
  // a separator-insensitive haystack must not let "wwi" reach "WWII".
  assert.ok(dom.window.CipherSearch.query('wwi').every(hit => /(^|\W)wwi(\W|$)/i.test(
    dom.window.CipherSearch.normalize([hit.entry.title, hit.entry.created, hit.entry.summary, ...hit.entry.tags].join(' '))
  )), 'flattened matching must not reopen the WWI/WWII boundary');

  // Curated keywords in scripts/build-search-index.js, for exhibits whose
  // obvious search term is in neither the title nor the meta description.
  for (const [typed, expected] of [['amharic', /Geʼez/], ['stuart', /Mary Queen of Scots/]]) {
    assert.ok(dom.window.CipherSearch.query(typed).some(hit => expected.test(hit.entry.title)),
      `curated keyword ${JSON.stringify(typed)} should reach its exhibit`);
  }

  const searchHtml = fs.readFileSync(path.join(root, 'search.html'), 'utf8');
  const page = new JSDOM(searchHtml, {
    url: 'https://ciphermuseum.com/search.html?q=enigma&kind=cipher',
    runScripts: 'outside-only'
  });
  page.window.fetch = async () => ({ ok: true, json: async () => index });
  page.window.TrustLabels = { badge: value => value };
  page.window.eval(fs.readFileSync(path.join(root, 'js/search.js'), 'utf8'));
  const inline = [...page.window.document.querySelectorAll('script:not([src])')].at(-1).textContent;
  page.window.eval(inline);
  page.window.document.dispatchEvent(new page.window.Event('DOMContentLoaded'));
  await new Promise(resolve => page.window.setTimeout(resolve, 0));

  const queryInput = page.window.document.getElementById('q');
  const kindFilter = page.window.document.getElementById('kind-filter');
  assert.equal(queryInput.value, 'enigma', 'deep-link query should populate the control');
  assert.equal(kindFilter.value, 'cipher', 'deep-link filter should populate the control');

  queryInput.value = 'vigenere';
  queryInput.dispatchEvent(new page.window.Event('input'));
  await new Promise(resolve => page.window.setTimeout(resolve, 100));
  assert.equal(new page.window.URL(page.window.location.href).searchParams.get('q'), 'vigenere',
    'edited query should replace the current URL state');

  kindFilter.value = 'hall';
  kindFilter.dispatchEvent(new page.window.Event('change'));
  assert.equal(new page.window.URL(page.window.location.href).searchParams.get('kind'), 'hall',
    'changed filter should be shareable in the URL');

  page.window.history.pushState({}, '', '/search.html?q=caesar&kind=page');
  page.window.dispatchEvent(new page.window.PopStateEvent('popstate'));
  assert.equal(queryInput.value, 'caesar', 'popstate should restore the query control');
  assert.equal(kindFilter.value, 'page', 'popstate should restore the filter control');

  console.log('Search normalization, partial matching, era-token boundaries, and URL state passed.');
})().catch(error => { console.error(error); process.exit(1); });
