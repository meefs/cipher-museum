#!/usr/bin/env node
'use strict';

// The bug this guards: an animation left running while the UI is reset or
// stepped keeps mutating state the visitor has already moved on from, and a
// second Run leaves two timers writing to the same readout.
//
// This test drives the real controls and counts live timers. It used to match
// source text instead — patterns like /var runInterval = null;/ — which a
// `var`-to-`let` refactor would have broken for no reason, and which a genuine
// leak would have passed as long as the declaration kept its shape.
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.resolve(__dirname, '..');

function openPage(relative, dependencies) {
  const virtualConsole = new VirtualConsole();
  const scriptErrors = [];
  virtualConsole.on('jsdomError', error => scriptErrors.push(error.message || String(error)));
  const dom = new JSDOM(fs.readFileSync(path.join(root, relative), 'utf8'), {
    url: `https://ciphermuseum.com/${relative}`,
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole,
    // Instrumentation has to be installed before the page's inline scripts
    // run, so the count reflects timers the page actually owns.
    beforeParse(window) {
      // The inline controllers rest on a pure-logic module the page loads by
      // <script src>. Evaluate those explicitly instead of enabling jsdom's
      // resource loader, so the test stays offline, deterministic, and fails
      // loudly if a dependency is renamed rather than silently testing a page
      // whose handlers never got wired.
      for (const dependency of dependencies) {
        window.eval(fs.readFileSync(path.join(root, dependency), 'utf8'));
      }
      const live = new Set();
      const nativeSet = window.setInterval;
      const nativeClear = window.clearInterval;
      window.setInterval = function (...args) {
        const handle = nativeSet.apply(window, args);
        live.add(handle);
        return handle;
      };
      window.clearInterval = function (handle) {
        live.delete(handle);
        return nativeClear.call(window, handle);
      };
      // Both pages skip animation altogether for a visitor who asks for
      // reduced motion, which would make every assertion below vacuous. Pin
      // the query so the animated path is the one under test.
      window.matchMedia = query => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
        dispatchEvent() { return false; }
      });
      window.__liveIntervals = live;
    }
  });
  return { window: dom.window, scriptErrors };
}

async function checkController({ relative, runId, stepId, resetId, dependencies = [] }) {
  const { window, scriptErrors } = openPage(relative, dependencies);
  if (window.document.readyState !== 'complete') {
    await new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
  }
  const live = window.__liveIntervals;
  const label = relative;

  function click(id) {
    const element = window.document.getElementById(id);
    assert(element, `${label}: #${id} exists`);
    element.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  }

  try {
    assert.equal(window.matchMedia('(prefers-reduced-motion: reduce)').matches, false,
      `${label}: the animated path is the one under test`);
    assert.equal(live.size, 0, `${label}: no timer runs before the visitor asks for one`);

    click(runId);
    assert.equal(live.size, 1, `${label}: Run starts exactly one timer`);

    // The original defect: each Run installed another timer over the last.
    click(runId);
    click(runId);
    assert.equal(live.size, 1,
      `${label}: a replacement Run cancels the animation already in flight`);

    click(stepId);
    assert.equal(live.size, 0,
      `${label}: Step cancels the animation rather than racing it`);

    click(runId);
    assert.equal(live.size, 1, `${label}: Run restarts after Step`);
    click(resetId);
    assert.equal(live.size, 0,
      `${label}: Reset cancels the animation before resetting state`);

    // A page that threw on load could satisfy every count above by wiring
    // nothing at all, so the clicks must have reached live handlers.
    assert.deepEqual(scriptErrors, [], `${label}: inline scripts run without error`);
  } finally {
    // Tear down unconditionally: a leaked interval would otherwise keep the
    // event loop alive and hang the suite instead of failing it.
    window.close();
  }
  return label;
}

const controllers = [
  {
    relative: 'hall-of-foundations/finite-fields.html',
    runId: 'run',
    stepId: 'step',
    resetId: 'wreset',
    dependencies: ['hall-of-foundations/ec-math.js']
  },
  {
    relative: 'ciphers/wadsworth-cipher.html',
    runId: 'wd-all',
    stepId: 'wd-step',
    resetId: 'wd-reset'
  }
];

(async () => {
  for (const controller of controllers) await checkController(controller);
  console.log(`Animation cancellation checks passed: ${controllers.length} controllers driven through `
    + 'Run, repeated Run, Step and Reset with live timers counted.');
})().catch(error => { console.error(error); process.exitCode = 1; });
