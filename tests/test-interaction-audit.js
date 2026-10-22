#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = p => process.env.CIPHER_AUDIT_BASELINE === '1'
  ? require('node:child_process').execFileSync('git', ['show', 'HEAD:' + p], { cwd: root, encoding: 'utf8' })
  : fs.readFileSync(path.join(root, p), 'utf8');
const tick = ms => new Promise(resolve => setTimeout(resolve, ms));
let failed = 0;
async function check(name, fn) { try { await fn(); console.log('PASS ' + name); } catch (e) { failed++; console.error('FAIL ' + name + ': ' + e.message); } }
function create(html, url = 'https://ciphermuseum.com/index.html') {
  const errors = [], vc = new VirtualConsole(); vc.on('jsdomError', e => errors.push(e.message));
  const dom = new JSDOM(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ''), { url, runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc });
  dom.errors = errors;
  dom.window.HTMLElement.prototype.scrollIntoView = function () {};
  dom.window.scrollTo = function () {};
  return dom;
}
const load = (dom, scripts) => scripts.forEach(p => dom.window.eval(read(p)));
const change = (w, el, value) => { el.value = value; el.dispatchEvent(new w.Event('input', { bubbles: true })); };
async function ready(dom) { if (dom.window.document.readyState !== 'complete') await new Promise(r => dom.window.addEventListener('load', r, { once: true })); }

(async () => {
  await check('Learning Path opens and completes a keyboard-accessible quiz', async () => {
    const dom = create('<button id="outside">Outside</button>', 'https://ciphermuseum.com/halls/ancient.html');
    try {
      load(dom, ['js/learning-path.js']);
      const w = dom.window, d = w.document;
      d.getElementById('lpToggle').click();
      const opener = d.getElementById('lpQuizBtn'); opener.focus(); opener.click();
      assert.equal(d.querySelectorAll('#quizOpts button').length, 4, 'Take Quiz must mount its options before querying them');
      assert.equal(d.activeElement, d.querySelector('#quizOpts button'), 'Focus enters the quiz');
      assert.equal(d.querySelector('[role=dialog]').getAttribute('aria-modal'), 'true');
      for (let i = 0; i < 3; i++) d.querySelectorAll('#quizOpts button')[1].click();
      assert.match(d.querySelector('[role=dialog]').textContent, /Hall Completed/);
      assert.deepEqual(JSON.parse(w.localStorage.getItem('ciphermuseum.path.passed')), ['ancient']);
      d.getElementById('quizClose').click();
      assert.equal(d.querySelector('[role=dialog]'), null);
      assert.match(d.getElementById('lpNext').textContent, /PASSED/);
      assert.ok(d.activeElement !== d.body, 'Closing restores useful keyboard focus even after next-bar replacement');
      assert.deepEqual(dom.errors, []);
    } finally { dom.window.close(); }
  });
  await check('Learning Path survives unavailable or malformed saved progress', async () => {
    for (const blocked of [true, false]) {
      const dom = create('', 'https://ciphermuseum.com/halls/ancient.html');
      try {
        if (blocked) Object.defineProperty(dom.window, 'localStorage', { get() { throw new Error('Storage denied'); } });
        else dom.window.localStorage.setItem('ciphermuseum.path.passed', '{"ancient":true}');
        load(dom, ['js/learning-path.js']);
        dom.window.document.getElementById('lpToggle').click();
        assert.equal(dom.window.document.getElementById('lpToggle').getAttribute('aria-pressed'), 'true');
        assert.equal(dom.window.document.getElementById('lpProgress').getAttribute('aria-valuenow'), '0');
        assert.deepEqual(dom.errors, []);
      } finally { dom.window.close(); }
    }
  });
  await check('Search highlighting preserves text, entities and overlapping tokens', async () => {
    const dom = create('');
    try {
      load(dom, ['js/search.js']);
      for (const [text, query] of [['Mark the marker', 'mark ar'], ['<tag> & "quote"', 'lt amp quot'], ['A <script> example', 'script']]) {
        const out = dom.window.document.createElement('div'); out.innerHTML = dom.window.CipherSearch.highlight(text, query);
        assert.equal(out.textContent, text, 'Highlighting must not change the result text');
        assert.ok([...out.querySelectorAll('*')].every(el => el.tagName === 'MARK'), 'Only highlight markup may be inserted');
        assert.equal(out.querySelector('mark mark'), null, 'Overlapping tokens must not nest highlight markup');
      }
    } finally { dom.window.close(); }
  });
  await check('Search filters all matching results before limiting displayed cards', async () => {
    const raw = read('search.html'), dom = create(raw, 'https://ciphermuseum.com/search.html?q=needle&kind=hall');
    try {
      const w = dom.window, d = w.document;
      const entries = Array.from({length:70}, (_, i) => ({t:'Needle', u:'ciphers/test' + i + '.html', k:'cipher', s:'Needle', g:[]}));
      entries.push({t:'Needle', u:'halls/ancient.html', k:'hall', s:'Needle hall', g:[]});
      w.fetch = async () => ({ ok:true, json:async () => ({ entries }) });
      load(dom, ['js/search.js']);
      const parsed = new JSDOM(raw); w.eval([...parsed.window.document.querySelectorAll('script:not([src])')].at(-1).textContent); parsed.window.close();
      await ready(dom); await tick(0);
      assert.equal(d.querySelectorAll('.sr-card').length, 1, 'A hall below 70 cipher matches must still be found');
      assert.match(d.querySelector('.sr-card').href, /halls\/ancient.html$/);
    } finally { dom.window.close(); }
  });
  await check('Search distinguishes an unavailable index from no matches and retries', async () => {
    const raw = read('search.html'), dom = create(raw, 'https://ciphermuseum.com/search.html?q=needle');
    try {
      const w = dom.window, d = w.document; let broken = true, requests = 0;
      w.fetch = async () => { requests++; if (broken) throw new Error('Offline'); return { ok:true, json:async () => ({entries:[{t:'Needle',u:'index.html',k:'page',s:'Result',g:[]}]}) }; };
      load(dom, ['js/search.js']);
      const parsed = new JSDOM(raw); w.eval([...parsed.window.document.querySelectorAll('script:not([src])')].at(-1).textContent); parsed.window.close();
      await ready(dom); await tick(0);
      assert.match(d.getElementById('status').textContent, /could not be loaded/i);
      assert.equal(d.getElementById('empty').style.display, 'none');
      broken = false; d.getElementById('searchRetry').click(); await tick(0);
      assert.equal(requests, 2, 'A failed index request must not be cached as a successful empty index');
      assert.equal(d.querySelectorAll('.sr-card').length, 1);
    } finally { dom.window.close(); }
  });
  await check('Learning dashboard validates saved progress and resets without storage', async () => {
    for (const data of ['{"ancient":true}', '["ancient","ancient","unknown"]', null]) {
      const raw = read('my-path.html'), dom = create(raw, 'https://ciphermuseum.com/my-path.html');
      try {
        const w = dom.window, d = w.document;
        if (data === null) Object.defineProperty(w, 'localStorage', {get() { throw new Error('Storage denied'); }});
        else w.localStorage.setItem('ciphermuseum.path.passed', data);
        w.confirm = () => true;
        const parsed = new JSDOM(raw); [...parsed.window.document.querySelectorAll('script:not([src])')].forEach(script => w.eval(script.textContent)); parsed.window.close();
        assert.equal(d.querySelectorAll('.path-card').length, 11);
        assert.match(d.getElementById('summary').textContent, data && data.startsWith('[') ? /1 \/ 11/ : /0 \/ 11/);
        d.getElementById('resetBtn').click();
        assert.match(d.getElementById('summary').textContent, /0 \/ 11/);
        assert.deepEqual(dom.errors, []);
      } finally { dom.window.close(); }
    }
  });
  await check('Detective recommendations link to existing exhibit pages', async () => {
    const dom = create('');
    try {
      load(dom, ['js/detective/analyses.js', 'js/detective/scoring.js']);
      const w = dom.window;
      const result = w.DetectiveScoring.rank(w.DetectiveAnalyses.run('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(30)));
      assert.ok(result.suspects.some(s => s.id === 'otp'), 'Uniform fixture should include the OTP/random hypothesis');
      for (const suspect of result.suspects) if (suspect.url) assert.ok(fs.existsSync(path.join(root, suspect.url)), 'Missing recommendation destination: ' + suspect.url);
    } finally { dom.window.close(); }
  });
  await check('Detective invalidates previous and queued solver/playback results on edit', async () => {
    const dom = create(read('cipher-detective.html'), 'https://ciphermuseum.com/cipher-detective.html');
    try {
      load(dom, ['js/detective/analyses.js', 'js/detective/scoring.js', 'js/detective/render.js', 'js/detective/playback.js']);
      let calls = 0;
      dom.window.DetectiveSolvers = { solveAuto() { calls++; return { skipped: 'OLD RESULT' }; } };
      load(dom, ['js/detective/detective.js']); await ready(dom);
      const w = dom.window, d = w.document, input = d.getElementById('detective-input'), button = d.getElementById('det-autosolve-btn');
      change(w, input, 'KHOORZRUOG'); d.getElementById('det-watch-btn').click();
      assert.equal(d.getElementById('det-playback-area').hidden, false);
      button.click(); change(w, input, ''); await tick(50);
      assert.equal(calls, 0, 'A queued solve for discarded input must not run');
      assert.equal(button.disabled, true, 'Clearing input must not be undone by the old solve callback');
      assert.equal(d.getElementById('det-autosolve-result').textContent, '');
      assert.equal(d.getElementById('det-playback-area').hidden, true);
      change(w, input, 'KHOORZRUOG'); button.click(); await tick(50);
      assert.match(d.getElementById('det-autosolve-result').textContent, /OLD RESULT/);
      change(w, input, 'SOMETHINGNEW');
      assert.equal(d.getElementById('det-autosolve-result').textContent, '', 'Results from previous text must be removed');
      assert.deepEqual(dom.errors, []);
    } finally { dom.window.close(); }
  });
  await check('Lightbox traps focus and restores focus and existing scroll style', async () => {
    const dom = create('<button id="background">Background</button><figure class="figure"><img src="test.png" alt="Test figure"></figure>');
    try {
      dom.window.document.body.style.overflow = 'auto';
      load(dom, ['js/lightbox.js']); await ready(dom);
      const w = dom.window, d = w.document, trigger = d.querySelector('.figure img');
      trigger.focus(); trigger.click();
      const dialog = d.querySelector('.lightbox-overlay'), close = d.querySelector('.lightbox-close');
      assert.equal(dialog.getAttribute('aria-modal'), 'true');
      const tab = new w.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }); close.dispatchEvent(tab);
      assert.equal(tab.defaultPrevented, true, 'The sole modal control must keep Tab inside');
      assert.equal(d.activeElement, close);
      close.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      assert.equal(dialog.classList.contains('active'), false); assert.equal(d.activeElement, trigger);
      assert.equal(d.body.style.overflow, 'auto');
    } finally { dom.window.close(); }
  });
  await check('Corpus tools carry ciphertext without clipboard and render no duplicate external buttons', async () => {
    const dom = create(read('cipher-corpus.html'), 'https://ciphermuseum.com/cipher-corpus.html');
    try {
      const w = dom.window, d = w.document, opened = [];
      w.open = (...args) => opened.push(args);
      w.HTMLCanvasElement.prototype.getContext = () => null;
      const record = { id:'audit', title:'Audit', cipher_type:'caesar', cipher_family:'substitution', difficulty:'beginner', language:'en', source_type:'synthetic', ciphertext:'AB ?&#+\nCD', plaintext:'test', key:3 };
      w.fetch = async () => ({ ok:true, json:async () => [record] });
      load(dom, ['js/detective-integration.js', 'js/cipher-corpus.js']); await ready(dom); await tick(10);
      assert.equal(d.querySelectorAll('.corpus-actions button').length, 4, 'One canonical set of actions');
      d.querySelector('.btn-detective').click(); d.querySelector('.btn-workbench').click();
      assert.equal(opened.length, 2, 'Tool navigation must not depend on clipboard support');
      const detective = new w.URL(opened[0][0], w.location.href), bench = new w.URL(opened[1][0], w.location.href);
      assert.equal(detective.origin, w.location.origin); assert.equal(detective.pathname, '/cipher-detective.html');
      assert.equal(decodeURIComponent(detective.hash.slice(1)), record.ciphertext);
      assert.equal(new w.URLSearchParams(bench.hash.slice(1)).get('ct'), record.ciphertext);
      d.querySelector('.btn-copy').click(); await tick(0);
      assert.doesNotMatch(d.querySelector('.btn-copy').textContent, /^Copied/);
      assert.deepEqual(dom.errors, []);
    } finally { dom.window.close(); }
  });
  await check('Workbench receives ciphertext and warns when a running key repeats', async () => {
    const raw = read('lab/workbench.html'), dom = create(raw, 'https://ciphermuseum.com/lab/workbench.html#ct=HELLO%20WORLD');
    try {
      load(dom, ['js/ciphers/all-engines.js']);
      const inline = [...new JSDOM(raw).window.document.querySelectorAll('script:not([src])')].map(s => s.textContent);
      inline.forEach(s => dom.window.eval(s));
      const w = dom.window, d = w.document;
      assert.equal(d.getElementById('wbInput').value, 'HELLO WORLD');
      const cipher = d.getElementById('wbCipher'); cipher.value = 'runningKey'; cipher.dispatchEvent(new w.Event('change'));
      d.getElementById('wbKey').value = 'KEY'; d.getElementById('wbEncode').click();
      assert.match(d.getElementById('wbKeyWarning').textContent, /repeat/i);
      assert.equal(d.getElementById('wbKeyWarning').hidden, false);
      d.getElementById('wbKey').value = 'KEYLONGENOUGH'; d.getElementById('wbEncode').click();
      assert.equal(d.getElementById('wbKeyWarning').hidden, true);
      d.getElementById('wbClear').click(); assert.equal(d.getElementById('wbInput').value, '');
      d.getElementById('wbCopy').click(); await tick(0); assert.notEqual(d.getElementById('wbCopy').textContent, 'COPIED');
    } finally { dom.window.close(); }
  });
  await check('Generic Running Key demo warns about a repeated short key', async () => {
    const dom = create('<main><section class="demo-section" data-cipher="runningKey"></section></main>', 'https://ciphermuseum.com/ciphers/running-key.html');
    try {
      load(dom, ['js/ciphers/all-engines.js', 'js/demo-loader.js']); await ready(dom);
      const d = dom.window.document;
      d.getElementById('demo-msg-runningKey').value = 'HELLOWORLD'; d.getElementById('demo-key-runningKey').value = 'KEY'; d.getElementById('demo-run-runningKey').click();
      const warning = d.querySelector('.demo-key-warning'); assert.ok(warning); assert.equal(warning.hidden, false); assert.match(warning.textContent, /repeat/i);
      d.getElementById('demo-clear-runningKey').click(); assert.equal(warning.hidden, true);
    } finally { dom.window.close(); }
  });
  await check('Vernam demos accept and round-trip the full-byte automatic pad', async () => {
    for (const workbench of [false, true]) {
      const raw = workbench ? read('lab/workbench.html') : '<section class="demo-section" data-cipher="vernam"></section>';
      const dom = create(raw, 'https://ciphermuseum.com/' + (workbench ? 'lab/workbench.html' : 'ciphers/vernam.html'));
      try {
        const w = dom.window, d = w.document;
        Object.defineProperty(w.crypto, 'getRandomValues', { value(a) { for (let i = 0; i < a.length; i++) a[i] = [0, 255, 128, 127][i % 4]; return a; } });
        load(dom, ['js/ciphers/all-engines.js']);
        if (workbench) {
          const parsed = new JSDOM(raw);
          [...parsed.window.document.querySelectorAll('script:not([src])')].forEach(script => w.eval(script.textContent)); parsed.window.close();
          d.getElementById('wbCipher').value = 'vernam'; d.getElementById('wbCipher').dispatchEvent(new w.Event('change'));
        } else { load(dom, ['js/demo-loader.js']); await ready(dom); }
        const input = d.getElementById(workbench ? 'wbInput' : 'demo-msg-vernam');
        const key = d.getElementById(workbench ? 'wbKey' : 'demo-key-vernam');
        const output = workbench ? d.getElementById('wbOutput') : d.querySelector('.output-box');
        input.value = 'HHHH'; key.value = ''; d.getElementById(workbench ? 'wbEncode' : 'demo-run-vernam').click();
        assert.match(output.textContent, /48b7c837/i);
        const pad = output.textContent.match(/\[Key: (hex:[0-9a-f]+)\]/i);
        assert.ok(pad, 'UI preserves the full-byte hex pad annotation');
        input.value = output.textContent.split('\n')[0]; key.value = pad[1];
        if (workbench) d.getElementById('wbDecode').click();
        else { d.querySelectorAll('.mode-btn')[1].click(); d.getElementById('demo-run-vernam').click(); }
        assert.equal(output.textContent, 'HHHH');
      } finally { dom.window.close(); }
    }
  });
  await check('Corpus repairs display links without rewriting published provenance', async () => {
    const dom = create(read('cipher-corpus.html'), 'https://ciphermuseum.com/cipher-corpus.html');
    try {
      const w = dom.window, d = w.document;
      const original = 'https://www.cs.cornell.edu/courses/cs6820/2012fa/handouts/alberti.pdf';
      const record = JSON.parse(read('public/corpus/browser-sample.json')).find(r => r.source_provenance && r.source_provenance.url === original);
      assert.ok(record, 'Fixture must exercise a real current browser record');
      w.HTMLCanvasElement.prototype.getContext = () => null;
      const wrongRecord = read('public/corpus/historical.jsonl').trim().split('\n').map(line => JSON.parse(line)).find(r => r.id === 'hist-beale-paper1-001');
      w.fetch = async () => ({ ok:true, json:async () => [record, wrongRecord] });
      let downloaded = '';
      w.Blob = class { constructor(parts) { downloaded = parts.join(''); } };
      w.URL.createObjectURL = () => 'blob:audit'; w.URL.revokeObjectURL = () => {};
      w.HTMLAnchorElement.prototype.click = function () {};
      load(dom, ['js/detective-integration.js', 'js/cipher-corpus.js']); await ready(dom); await tick(10);
      const source = d.querySelector('.corpus-source'); assert.ok(source, 'Live record offers its source citation');
      assert.equal(source.querySelector('a').href, 'https://library.cmu.edu/about/news/2023-01/Alberti-La-Cifra');
      assert.match(source.textContent, /does not authenticate the record/);
      d.querySelector('.btn-download-rec').click(); assert.equal(JSON.parse(downloaded).source_provenance.url, original);
      assert.equal(record.source_provenance.url, original);
      const wrongSource = d.querySelectorAll('.corpus-source')[1];
      assert.match(wrongSource.textContent, /different work/);
      assert.match(wrongSource.textContent, /Sydney Smith/);
      assert.equal(wrongSource.querySelector('a').href, 'https://archive.org/details/41733399077263');
      d.querySelectorAll('.btn-download-rec')[1].click();
      assert.equal(JSON.parse(downloaded).source_provenance.url, 'https://www.gutenberg.org/ebooks/12994');
    } finally { dom.window.close(); }
  });
  await check('Challenge load failures are visible and retryable; hints, load, solve and reset work', async () => {
    const dom = create(read('cipher-detective.html'), 'https://ciphermuseum.com/cipher-detective.html');
    try {
      const w = dom.window, d = w.document, data = JSON.parse(read('data/detective-challenges.json'));
      let broken = true;
      w.fetch = async () => { if (broken) throw new Error('Offline'); return { ok:true, json:async () => data }; };
      load(dom, ['js/detective/challenges.js']);
      w.DetectiveChallenges.init(); await tick(0);
      assert.match(d.getElementById('det-challenge-mode').textContent, /could not be loaded/i);
      broken = false; d.getElementById('det-challenge-retry').click(); await tick(0);
      assert.equal(d.querySelectorAll('.challenge-card').length, data.challenges.length);
      const first = data.challenges[0]; d.querySelector('.challenge-card').click();
      d.querySelector('.hint-btn').click();
      assert.equal(d.getElementById('hint-' + first.id + '-0').hidden, false);
      d.getElementById('det-challenge-load-ct').click();
      assert.equal(d.getElementById('detective-input').value, first.ciphertext);
      d.getElementById('det-challenge-reveal').click();
      assert.equal(d.getElementById('det-challenge-solution-' + first.id).hidden, false);
      d.getElementById('det-challenge-solve').click();
      assert.equal(w.DetectiveChallenges.getProgress().completed, 1);
      d.getElementById('det-challenge-back').click(); w.confirm = () => true;
      d.getElementById('det-challenge-reset').click();
      assert.equal(w.DetectiveChallenges.getProgress().completed, 0);
      d.getElementById('det-challenge-close').click(); assert.equal(d.getElementById('det-challenge-mode').hidden, true);
      assert.deepEqual(dom.errors, []);
    } finally { dom.window.close(); }
  });
  await check('Navigation, keyboard shortcuts, footer and delegated controls work at root and nested URLs', async () => {
    for (const route of ['search.html', 'ciphers/caesar.html', 'hall-of-foundations/index.html', 'lab/workbench.html']) {
      const dom = create('<nav class="museum-nav"><div class="nav-inner"><ul class="nav-links"></ul></div></nav><input id="q"><button data-reveal-next>Reveal</button><p hidden style="display:none">Answer</p><footer></footer>', 'https://ciphermuseum.com/' + route);
      try {
        const w = dom.window, d = w.document; load(dom, ['js/nav.js', 'js/footer.js', 'js/ui-delegates.js']);
        const menu = d.querySelector('.nav-hamburger'); menu.click(); assert.equal(menu.getAttribute('aria-expanded'), 'true');
        d.dispatchEvent(new w.KeyboardEvent('keydown', { key:'Escape', bubbles:true }));
        assert.equal(menu.getAttribute('aria-expanded'), 'false'); assert.equal(d.activeElement, menu);
        const slash = new w.KeyboardEvent('keydown', { key:'/', bubbles:true, cancelable:true }); d.body.dispatchEvent(slash);
        assert.equal(d.activeElement, d.getElementById('q'));
        assert.equal(new w.URL(d.querySelector('.nav-links a').href).pathname, '/museum-map.html');
        assert.equal(new w.URL(d.querySelector('footer a').href).pathname, '/museum-map.html');
        d.querySelector('[data-reveal-next]').click(); assert.equal(d.querySelector('p').hidden, false);
        assert.deepEqual(dom.errors, []);
      } finally { dom.window.close(); }
    }
  });
  if (failed) process.exitCode = 1;
})();
