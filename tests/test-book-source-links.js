#!/usr/bin/env node
'use strict';

// Exercise the rendered corpus cards, including a new source URL not present in
// the historical erratum table. Bibliographic data must survive unchanged.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const fixture = JSON.parse(read('public/corpus/v0.8/browser-sample.json'))[0];
const directEbook = /(?:gutenberg\.org\/(?:ebooks|files|cache)|books\.google\.|inventwithpython\.com\/cracking|crypto\.stanford\.edu\/[^\s]*cryptobook|shoup\.net\/pg\/|uwaterloo\.ca\/hac\/|tekniskkulturarv\.dk\/book\/|cryptool\.org\/en\/ctbook\/|\.(?:epub|mobi|azw3?)(?:[?#]|$))/i;

async function render(urls) {
  const records = urls.map((source_url, i) => ({ ...fixture, id: 'book-link-test-' + i, source_url,
    source: 'Author, Complete Book Title (edition, year).', citation_erratum: undefined }));
  const before = JSON.stringify(records);
  const dom = new JSDOM(read('cipher-corpus.html'), {
    url: 'https://ciphermuseum.com/cipher-corpus.html', runScripts: 'outside-only'
  });
  try {
    dom.window.HTMLCanvasElement.prototype.getContext = () => null;
    dom.window.fetch = async () => ({ ok: true, json: async () => records });
    dom.window.eval(read('js/cipher-corpus.js'));
    await new Promise(resolve => setTimeout(resolve, 20));
    assert.equal(JSON.stringify(records), before, 'Rendering must not rewrite archival source data.');
    return [...dom.window.document.querySelectorAll('.corpus-card')].map(card => ({
      links: [...card.querySelectorAll('.corpus-source a')].map(a => a.href),
      credit: card.querySelector('.corpus-source')?.textContent || ''
    }));
  } finally { dom.window.close(); }
}

async function main() {
  const ebooks = [
    'https://www.gutenberg.org/ebooks/12345',
    'https://books.google.com/books?id=example',
    'https://openlibrary.org/books/example',
    'https://inventwithpython.com/cracking/chapter5.html',
    'https://crypto.stanford.edu/~dabo/cryptobook/',
    'https://shoup.net/pg/pg.pdf',
    'https://cacr.uwaterloo.ca/hac/about/chap7.pdf',
    'https://tekniskkulturarv.dk/book/example',
    'https://example.org/book.EPUB?download=1',
    'https://example.org/book.mobi'
  ];
  for (const card of await render(ebooks)) {
    assert.deepEqual(card.links, [], 'An ebook credit must not become a live ebook link.');
    assert.match(card.credit, /Book source credited/);
  }
  const primary = [
    'https://crypto.stanford.edu/~dabo/pubs/papers/weilsigs.pdf',
    'https://www.nsa.gov/primary-document.pdf',
    'https://archive.org/stream/41788379082740/41788379082740_djvu.txt',
    'https://www.usni.org/press/books/seizing-enigma'
  ];
  (await render(primary)).forEach((card, i) => assert.deepEqual(card.links, [primary[i]],
    'Primary papers, archival documents and publisher information pages remain usable.'));

  // Check public HTML links independently of corpus policy, without treating
  // quoted source_url metadata or archival PDF documents as ebook links.
  let pages = 0;
  function scan(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (['.git', 'node_modules', 'tmp', 'docs', 'tests', 'scripts'].includes(entry.name)) continue;
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) scan(file);
      else if (entry.name.endsWith('.html')) {
        pages++;
        const html = fs.readFileSync(file, 'utf8');
        for (const match of html.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)) {
          assert.doesNotMatch(match[1], directEbook,
            path.relative(root, file) + ': direct ebook URL');
        }
      }
    }
  }
  scan(root);
  for (const match of read('js/demo-loader.js').matchAll(/\burl\s*:\s*["']([^"']+)["']/g)) {
    assert.doesNotMatch(match[1], directEbook, 'Shared dynamic bibliography: direct ebook URL');
  }
  console.log('Book source links: 10 ebook destinations suppressed, 4 primary/catalogue controls retained, metadata unchanged, ' + pages + ' public HTML pages scanned.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
