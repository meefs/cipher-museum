#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const swSource = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const offlineSource = fs.readFileSync(path.join(root, 'offline.html'), 'utf8');

async function navigateOffline(pageWasVisited) {
  const listeners = {};
  const requestedUrl = 'https://ciphermuseum.com/ciphers/unvisited-exhibit.html';
  const visitedPage = { name: 'visited exhibit' };
  const homePage = { name: 'homepage' };
  const offlinePage = { name: 'offline notice' };
  const cacheLookups = [];

  vm.runInNewContext(swSource, {
    self: {
      location: { origin: 'https://ciphermuseum.com' },
      addEventListener: (type, handler) => { listeners[type] = handler; }
    },
    URL,
    caches: {
      match: async (request) => {
        const name = typeof request === 'string' ? request : request.url;
        cacheLookups.push(name);
        if (name === requestedUrl) return pageWasVisited ? visitedPage : undefined;
        if (name === '/offline.html') return offlinePage;
        if (name === '/index.html') return homePage;
        return undefined;
      }
    },
    fetch: async () => { throw new Error('Simulated network failure'); }
  });

  let response;
  listeners.fetch({
    request: { method: 'GET', mode: 'navigate', url: requestedUrl },
    respondWith: (promise) => { response = promise; }
  });
  assert(response, 'navigation was handled by the service worker');
  return { result: await response, cacheLookups, offlinePage, visitedPage };
}

(async () => {
  const cold = await navigateOffline(false);
  assert.equal(cold.result, cold.offlinePage, 'uncached exhibit shows the offline notice');
  assert(!cold.cacheLookups.includes('/index.html'), 'uncached exhibit must not show the homepage');

  const warm = await navigateOffline(true);
  assert.equal(warm.result, warm.visitedPage, 'visited exhibit remains available offline');
  assert(!warm.cacheLookups.includes('/offline.html'), 'cached exhibit does not show offline notice');

  const page = new JSDOM(offlineSource, { url: 'https://ciphermuseum.com/ciphers/unvisited-exhibit.html' });
  const document = page.window.document;
  assert.match(document.title, /unavailable offline/i);
  assert.match(document.querySelector('main h1').textContent, /not available offline/i);
  assert.equal(document.querySelector('main a').href, 'https://ciphermuseum.com/index.html',
    'museum entrance link works at a nested exhibit URL');
  assert.equal(document.querySelector('script[src], link[href], img[src]'), null,
    'the offline notice has no unavailable external dependencies');
  console.log('Offline fallback: uncached notice, visited exhibit, and nested-path assets verified.');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
