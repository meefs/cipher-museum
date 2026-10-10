'use strict';
// Review evidence, deliberately separate from the production engines and their
// fixture helper. Expected ciphertexts were read from the primary publications.
// Run: node docs/manual-cipher-independent-reference-check.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
global.window = {};
require(path.join(root, 'js/ciphers/all-engines.js'));
const engines = window.CipherEngines;

// RS44 figure geometry comes from the separately transcribed research fixture.
// This is not a claim of an independent second transcription of all 600 cells.
// The two printed ciphertexts independently constrain the reproduced operation.
const grid = [
  '##..###..#..#.##.#.##.###', '.##.#.#..#.##.##.###.##.#',
  '..#.#..##.##.###.#..#####', '####..##...#..###..###.##',
  '.###.#..#.#.##.###.##..##', '#####..##.#..#.##.#.###..',
  '###.###.##.#.#.##.#..#..#', '####.##.###..#.###..#.#..',
  '##.####.###..###.#...#..#', '#####.##.##.#.##..#.#.#..',
  '#.#...##.#.#.##.#.##.####', '#####.#.#.#...#..#.###.##',
  '###..#..##...###..###.###', '.#...#.###.#.#.##.#.#####',
  '####.##.##.#.##.#...#..##', '#..#...##.###..###..#####',
  '.##.#..#.#####...##..####', '##.###.###.#.#.#.###..#..',
  '#...#..##.##.#.##.##.####', '.#.#..#.#.###.#.##.#.####',
  '####.#.##.##.###..#..#..#', '..#..#.####.#..##.##.####',
  '#.##.##...#.####.#.#.#.##', '#####.#.#..#.###..#.##.#.'
];
const ranks = [3,20,8,13,5,19,1,14,9,21,18,15,24,2,12,7,10,22,4,16,25,11,23,17,6];
const squareA = 'HILQETUARSBKXFGPWCOZDVYMN';
const squareB = 'ZNOCHBXAVIUDTGWMYELSKPQRF';
const sourceVectors = [
  { engine: 'rasterschluessel44', plain: 'FEINDGREIFTSEITELFXVIERFUENFUHRBEIAAIGQALFISIGQALFISEEMITAQTPANZNAQSUEDWESTAN',
    cipher: 'DIANMRQTVFNNRISIFFGPUEFZGNAEEHAEUTAIIEADAGQQLWIBSFFXUTITEEAAENIQSSIRLIEFESELT', length: 77 },
  { engine: 'rasterschluessel44', plain: 'SATURRNNAUFKLFLIEGERMELDETVORBTLABSQNITTFDLBEREITSTELLUNGKKAAESE',
    cipher: 'GDESLLLLLRITNIAUENBLETEKMTEARENABTUSKNRRALEGETAFTOSFETFBUDIKRVQS', length: 64,
    key: {startRow:20, startColumn:1, minute:21, strict:true} },
  { engine: 'doublePlayfair', plain: 'FEINDLIQERANGRIFFAUFSTRASZEADORFSTRIQBEHAUSENABGEWEHRT',
    cipher: 'VDLGCTUQZREOMFCIFEALFYLBAPKWCTEIWBTYMFLNMVMQZTVLHUPILF', length: 54 },
  { engine: 'amsco', plain: 'INCOMPLETECOLUMNARWITHALTERNATINGSINGLELETTERSANDDIGRAPHS',
    cipher: 'CECRTEGLENPHPLUTNANTEIOMOWIRSITDDSINTNALINESAALEMHATGLRGR', length: 57, key:'41325' }
];
for (const v of sourceVectors) {
  assert.equal(v.plain.length, v.length);
  assert.equal(v.cipher.length, v.length);
  assert.equal(engines[v.engine].encode(v.plain, v.key), v.cipher);
  assert.equal(engines[v.engine].decode(v.cipher, v.key), v.plain);
  assert.equal(engines[v.engine].trace(v.plain, v.key, false).output, v.cipher);
  assert.equal(engines[v.engine].trace(v.cipher, v.key, true).output, v.plain);
}

function rsReference(plain, start, minute) {
  const sheet = Array(600).fill('');
  let placed = 0;
  for (let n = 0; n < 600 && placed < plain.length; n++) {
    const pos = (start + n) % 600;
    if (grid[Math.floor(pos / 25)][pos % 25] === '.') sheet[pos] = plain[placed++];
  }
  const sum = Array.from(String(minute).padStart(2, '0') + plain.length, Number).reduce((a,b) => a+b, 0);
  const firstRank = ranks[(start % 25 + sum) % 25];
  let output = '';
  for (let n = 0; n < 25; n++) {
    const col = ranks.indexOf((firstRank - 1 + n) % 25 + 1);
    for (let row = 0; row < 24; row++) output += sheet[row * 25 + col];
  }
  return output;
}
assert(grid.every(row => row.length === 25 && [...row].filter(c => c === '.').length === 10));
let rsCases = 0;
for (let start = 0; start < 600; start++) for (const minute of [0,3,25,59]) {
  const plain = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(8).slice(0, (start * 19) % 201);
  const key = {startRow:Math.floor(start / 25), startColumn:start % 25, minute};
  const expected = rsReference(plain, start, minute);
  assert.equal(engines.rasterschluessel44.encode(plain, key), expected);
  assert.equal(engines.rasterschluessel44.decode(expected, key), plain);
  rsCases++;
}
assert.equal(rsReference(sourceVectors[1].plain, 20*25+1, 21), sourceVectors[1].cipher);

function dpStage(pair) {
  const x = squareA.indexOf(pair[0]), y = squareB.indexOf(pair[1]);
  const rowA = Math.floor(x / 5), rowB = Math.floor(y / 5), colA = x % 5, colB = y % 5;
  if (rowA === rowB) return squareB.slice(rowB*5, rowB*5+5)[(colB+1)%5] + squareA.slice(rowA*5, rowA*5+5)[(colA+1)%5];
  return squareB[rowA*5+colB] + squareA[rowB*5+colA];
}
function dpReference(plain) {
  plain = plain.replace(/J/g, 'II');
  if (plain.length % 2) plain += 'Z';
  let output = '';
  for (let start = 0; start < plain.length; start += 34) {
    const block = plain.slice(start, start+34);
    for (let i = 0; i < block.length / 2; i++) output += dpStage(dpStage(block[i] + block[i+block.length/2]));
  }
  return output;
}
assert.equal(dpStage('AA'), 'VR'); assert.equal(dpStage('VR'), 'FY');
assert.equal(dpStage('FA'), 'TR'); assert.equal(dpStage('TR'), 'VD');
let dpPairs = 0;
for (const x of squareA) for (const y of squareB) {
  const plain = x+y, expected = dpReference(plain);
  assert.equal(engines.doublePlayfair.encode(plain), expected);
  assert.equal(engines.doublePlayfair.decode(expected), plain);
  dpPairs++;
}
for (let n = 0; n <= 100; n++) {
  const plain = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(4).slice(0,n);
  assert.equal(engines.doublePlayfair.encode(plain), dpReference(plain));
}
assert.equal(dpReference(sourceVectors[2].plain), sourceVectors[2].cipher);

function amReference(plain, order, first) {
  const cols = order.map(() => []);
  let at = 0, row = 0;
  while (at < plain.length) {
    for (let col = 0; col < order.length && at < plain.length; col++) {
      const length = (row+col)%2 ? 3-first : first;
      cols[col].push(plain.slice(at, at+length)); at += length;
    }
    row++;
  }
  return order.map((_, i) => cols[order.indexOf(i+1)].join('')).join('');
}
let amCases = 0;
for (let width = 2; width <= 12; width++) for (const first of [1,2]) for (let n = 0; n <= 60; n++) {
  const order = Array.from({length:width}, (_,i) => width-i);
  const plain = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.repeat(3).slice(0,n), expected = amReference(plain,order,first);
  assert.equal(engines.amsco.encode(plain,{order,first}),expected);
  assert.equal(engines.amsco.decode(expected,{order,first}),plain);
  amCases++;
}
assert.equal(amReference(sourceVectors[3].plain,[4,1,3,2,5],2),sourceVectors[3].cipher);

const read = rel => fs.readFileSync(path.join(root,rel));
const baseline = '5a519c8c11db9c7b0810455491d019b9f9883f7d';
const oldEntries = JSON.parse(execFileSync('git',['show',baseline+':data/exhibit-trust.json'],{cwd:root,encoding:'utf8'})).exhibits;
const entries = JSON.parse(read('data/exhibit-trust.json')).exhibits;
for (const old of oldEntries) {
  const current = entries.find(e => e.number === old.number);
  assert(current, 'Historical identity retained: '+old.number);
  for (const field of ['number','path','label','note']) assert.deepEqual(current[field],old[field],old.path+': '+field);
}
execFileSync('git',['diff','--exit-code',baseline,'--','public/corpus'],{cwd:root,stdio:'pipe'});
// Independently exercise ordinary-motion controls, using the literal answers
// above through the deployed minified engine rather than the fixture helper.
const { JSDOM, VirtualConsole } = require('jsdom');
let normalMotionPages = 0;
for (const [slug, vector] of [['rs44',sourceVectors[0]], ['double-playfair',sourceVectors[2]], ['amsco',sourceVectors[3]]]) {
  const errors = [], vc = new VirtualConsole(); vc.on('jsdomError', error => errors.push(error.message));
  const dom = new JSDOM(read('ciphers/'+slug+'.html').toString(), {runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
  const w = dom.window, d = w.document, el = id => d.getElementById(id);
  let tick = null;
  w.matchMedia = () => ({matches:false});
  w.setInterval = callback => { assert.equal(tick,null); tick=callback; return 1; };
  w.clearInterval = () => { tick=null; };
  for (const s of d.querySelectorAll('script[src]')) {
    const rel = path.posix.normalize(path.posix.join('ciphers',s.getAttribute('src')));
    if (!rel.endsWith('/nav.js') && !rel.endsWith('/lightbox.js')) w.eval(read(rel).toString());
  }
  assert.deepEqual(errors,[]);
  assert.equal(el('manual-output').textContent,vector.cipher);
  el('manual-play').click();
  assert.equal(el('manual-play').textContent,'Pause');
  assert.equal(el('manual-play').getAttribute('aria-pressed'),'true');
  tick(); tick();
  assert.match(el('manual-animation-status').textContent,/^2 \/ /);
  el('manual-play').click(); assert.equal(tick,null);
  assert.equal(el('manual-play').textContent,'Play');
  assert.equal(el('manual-play').getAttribute('aria-pressed'),'false');
  el('manual-reset').click(); assert.match(el('manual-animation-status').textContent,/^0 \/ /);
  el('manual-play').click();
  el('manual-message').value=''; el('manual-message').dispatchEvent(new w.Event('input',{bubbles:true}));
  assert.equal(tick,null); assert.equal(el('manual-output').textContent,'');
  el('manual-message').value=vector.plain; el('manual-message').dispatchEvent(new w.Event('input',{bubbles:true}));
  el('manual-play').click(); w.dispatchEvent(new w.Event('pagehide')); assert.equal(tick,null);
  dom.window.close(); normalMotionPages++;
}
const comparisonDom = new JSDOM(read('comparison.html').toString(),{runScripts:'outside-only'});
comparisonDom.window.eval(read('js/trust-labels.js').toString());
for (const s of comparisonDom.window.document.querySelectorAll('script:not([src])')) comparisonDom.window.eval(s.textContent);
const comparisonRenderedRows = comparisonDom.window.document.querySelectorAll('#cipher-tbody tr').length;
for (const meta of comparisonDom.window.document.querySelectorAll('meta[name="description"],meta[property="og:description"],meta[name="twitter:description"]')) {
  assert(meta.content.includes(comparisonRenderedRows+' exhibits'));
  assert(meta.content.includes(entries.length+'-exhibit collection'));
}
const searchComparison = JSON.parse(read('js/search-index.json')).entries.find(e=>e.u==='comparison.html');
assert.equal(searchComparison.c,comparisonRenderedRows+' Compared Exhibits from the '+entries.length+'-exhibit Collection');
assert(searchComparison.s.includes(entries.length+'-exhibit collection'));
comparisonDom.window.close();
const files = ['js/ciphers/all-engines.js','js/ciphers/all-engines.min.js','js/manual-cipher-demos.js',
  'css/manual-cipher-demos.css','ciphers/rs44.html','ciphers/double-playfair.html','ciphers/amsco.html',
  'tests/engines/helpers/historical-vectors.js','tests/engines/specs/rasterschluessel44.spec.js',
  'tests/engines/specs/doublePlayfair.spec.js','tests/engines/specs/amsco.spec.js',
  'tests/test-manual-cipher-exhibits.js','data/exhibit-trust.json','data/exhibit-counts.json',
  'README.md','comparison.html','js/search-index.json','js/demo-loader.js','lab/workbench.html','sw.js','docs/HISTORICAL_PROCEDURES.md',
  'scripts/build-counts.js','tests/test-counts.js','docs/COLLECTION_COUNTS.md'];
const head = execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
console.log(JSON.stringify({
  head,
  note:'HEAD identifies the checkout base. These SHA-256 digests identify the tested working-tree bytes.',
  trackedEvidenceFilesMatchHead:files.every(rel => read(rel).equals(execFileSync('git',['show',head+':'+rel],{cwd:root}))),
  sourceVectors:sourceVectors.length,rsCases,dpPairs,dpLengths:101,amCases,
  normalMotionPages,comparisonRenderedRows,comparisonSearchHeading:searchComparison.c,
  preservedHistoricalIdentities:oldEntries.length,corpusUnchanged:true,
  sha256:Object.fromEntries(files.map(rel => [rel,crypto.createHash('sha256').update(read(rel)).digest('hex')]))
},null,2));
