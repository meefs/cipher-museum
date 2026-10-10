#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');

for (const slug of ['caesar', 'aeneas-tacticus']) {
  for (const dataFirst of [true, false]) {
    for (const domFirst of [true, false]) {
      const dom = new JSDOM('', { runScripts: 'outside-only', url: `https://ciphermuseum.com/ciphers/${slug}.html` });
      const { window } = dom;
      const installMarkup = () => {
        window.document.body.innerHTML = '<main id="main-content"><header class="page-hero">Exhibit</header></main>';
        window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
      };
      window.eval(read('js/trust-labels.js'));
      if (domFirst) installMarkup();
      const scripts = ['js/artifact-cards-data.min.js', 'js/artifact-cards.js'];
      if (!dataFirst) scripts.reverse();
      scripts.forEach(script => window.eval(read(script)));
      if (!domFirst) installMarkup();

      const cards = () => window.document.querySelectorAll('.artifact-card');
      const context = `${slug}: data ${dataFirst ? 'first' : 'last'}, DOM ${domFirst ? 'first' : 'last'}`;
      assert.equal(cards().length, 1, `${context}: rendering survives either dependency order`);
      assert.equal(cards()[0].dataset.artifactSlug, slug);
      assert.equal(cards()[0].querySelectorAll('.trust-label').length, slug === 'caesar' ? 1 : 0,
        `${context}: context badges remain omitted`);

      // Script reloads, duplicate readiness notifications and DOM events must
      // not duplicate a visitor's card.
      scripts.forEach(script => window.eval(read(script)));
      window.dispatchEvent(new window.Event('artifact-cards-ready'));
      window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
      assert.equal(cards().length, 1, `${context}: exactly one card after repeated delivery`);
      dom.window.close();
    }
  }
}
console.log('Artifact loading passed: both data/renderer orders, delayed DOM, context omissions and exactly-once rendering.');
