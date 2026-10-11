#!/usr/bin/env node
'use strict';

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'community/index.html'), 'utf8');

assert.doesNotMatch(html, /type=["']email["']/i,
  'the static draft tool does not collect email addresses');
assert.doesNotMatch(html, /recorded for review|notify you by email|Submit for Review/i,
  'the page does not claim that a local action submitted data');
assert.doesNotMatch(html, /Daily Challenge|Daily Reset|By a Museum Visitor/i,
  'the page does not present nonexistent recurring or visitor-contributed content');
assert.match(html, /does not transmit or submit anything/i,
  'the local-only boundary is disclosed before the form');
assert.match(html, /href=["']\.\.\/ciphers\/dorabella\.html["']/,
  'the Dorabella topic links to its own exhibit');
assert.doesNotMatch(html, /localStorage/i,
  'contribution contents are not retained in browser storage');

const dom = new JSDOM(html, {
  runScripts: 'outside-only',
  url: 'https://ciphermuseum.com/community/index.html'
});
const { window } = dom;
let blobParts;
let objectUrlRevoked = false;
let downloaded;

window.Blob = class BlobCapture {
  constructor(parts, options) {
    blobParts = parts;
    this.type = options.type;
  }
};
window.URL.createObjectURL = blob => {
  assert.equal(blob.type, 'text/plain;charset=utf-8');
  return 'blob:test-draft';
};
window.URL.revokeObjectURL = url => {
  assert.equal(url, 'blob:test-draft');
  objectUrlRevoked = true;
};
window.HTMLAnchorElement.prototype.click = function () {
  downloaded = { href: this.href, filename: this.download };
};

for (const script of window.document.querySelectorAll('script:not([src])')) {
  window.eval(script.textContent);
}

window.document.getElementById('commName').value = 'Ada Example';
window.document.getElementById('commType').value = 'correction';
window.document.getElementById('commTitle').value = 'Correct the sample';
window.document.getElementById('commBody').value = 'The independently checked value is 17.';
window.document.getElementById('commSources').value = 'Archive catalogue 123';
window.document.getElementById('downloadDraft').click();

assert.deepEqual(downloaded, {
  href: 'blob:test-draft',
  filename: 'cipher-museum-correct-the-sample-draft.txt'
});
const draft = blobParts.join('');
assert.match(draft, /Author: Ada Example/);
assert.match(draft, /Type: correction/);
assert.match(draft, /The independently checked value is 17\./);
assert.match(draft, /Archive catalogue 123/);
assert.equal(window.document.getElementById('commSuccess').style.display, 'block');

setTimeout(() => {
  assert.equal(objectUrlRevoked, true, 'temporary download URL is revoked');
  dom.window.close();
  console.log('Community contribution flow: local-only disclosure, no PII collection, and draft download verified.');
}, 0);
