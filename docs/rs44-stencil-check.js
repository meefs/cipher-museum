'use strict';
// Targeted source-derived audit; no expected values are imported from engine fixtures.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const referencePath = 'docs/evidence/rs44-stencil-2026-10-10/source-reference.json';
const ref = JSON.parse(read(referencePath));
assert.equal(ref.states.length, 24);
assert(ref.states.every(row => row.length === 25 && /^[WB]+$/.test(row) && row.split('W').length - 1 === 10));
assert.equal(ref.rowLabels[4], 'ae');
assert.equal(ref.columnLabels[13], 'bb');
assert.equal(ref.columnLabels[5], 'ee');
assert.equal(ref.rowLabels[20], 'cc');
assert.equal(ref.columnLabels[1], 'ac');
assert.deepEqual(ref.uncertainCellStates, []);
const result = {
  testedHead: cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  sourcePdfSha256: ref.sha256,
  sourceReferenceSha256: crypto.createHash('sha256').update(read(referencePath)).digest('hex'),
  orientation: ref.orientation,
  engineComparisons: [], renderedComparison: null
};
for (const filename of ['js/ciphers/all-engines.js', 'js/ciphers/all-engines.min.js']) {
  const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(read(filename), ctx);
  const t = ctx.window.CipherEngines.rasterschluessel44.trace('', 'manual', false);
  const differences = [], ranks = [];
  for (let r = 0; r < 24; r++) for (let c = 0; c < 25; c++) {
    const wanted = ref.states[r][c] === 'W' ? '.' : '#';
    if (t.grid[r][c] !== wanted) differences.push({ row: r + 1, column: c + 1, wanted, actual: t.grid[r][c] });
  }
  ref.columnReadRanks.forEach((wanted, i) => { if (t.order[i] !== wanted) ranks.push({ column: i + 1, wanted, actual: t.order[i] }); });
  result.engineComparisons.push({ file: filename, cellsCompared: 600, white: 240, blocked: 360, differences, rankDifferences: ranks });
  assert.deepEqual(differences, [], filename + ' differs from independently transcribed source');
  assert.deepEqual(ranks, [], filename + ' column rank alignment');
}
const dom = new JSDOM(read('ciphers/rs44.html'), { runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window; w.matchMedia = () => ({ matches: true });
w.eval(read('js/ciphers/all-engines.min.js')); w.eval(read('js/manual-cipher-demos.js'));
const table = w.document.querySelector('#manual-grid table');
const rows = [...table.querySelectorAll('tbody tr')];
assert.equal(rows.length, 24);
const differences = [];
rows.forEach((row, r) => {
  assert.equal(row.querySelector('th').textContent, String(r + 1), 'Row origin/order');
  const cells = [...row.querySelectorAll('td')]; assert.equal(cells.length, 25);
  cells.forEach((td, c) => {
    const wanted = ref.states[r][c] === 'B';
    if (td.classList.contains('manual-blocked') !== wanted) differences.push({ row: r + 1, column: c + 1 });
  });
});
[...table.querySelectorAll('thead th')].slice(1).forEach((th, c) => {
  assert.equal(th.textContent, String(ref.columnReadRanks[c]));
  assert.equal(th.title, 'Column ' + (c + 1) + ', rank ' + ref.columnReadRanks[c]);
});
assert.deepEqual(differences, [], 'Rendered source grid orientation/alignment');
result.renderedComparison = { cellsCompared: 600, differences, rowHeaders: 24, columnHeaders: 25, sourceOrigin: 'top-left', mirrored: false, rotated: false };
w.close();
console.log(JSON.stringify(result, null, 2));
