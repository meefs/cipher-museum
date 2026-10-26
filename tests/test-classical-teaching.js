#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { runExperiment, withoutTimings, referenceEncrypt } = require('../scripts/columnar-classroom');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const model = global.DetectiveLangModel;

async function main() {
  // Pin ranking values from the pre-label-change model; this is a presentation fix.
  const examples = [
    ['ZXQJ', -7.7148458878609185],
    ['THE THE THE THE THE THE', -5.360493745081466],
    ['Meet Dr. Zyx at QX-17.', -11.096782762265063],
    ['THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG', -10.85488184204247]
  ];
  for (const [text, expected] of examples) {
    const n = text.replace(/[^a-z]/gi, '').length;
    assert(Math.abs(model.fitness(text) / n - expected) < 1e-12, 'Language fitness must remain unchanged');
    const label = model.confidenceLabel(model.fitness(text), n);
    assert.match(label.label, /Short sample/);
    assert(!/likely|probab|strong/i.test(label.label));
  }
  for (const text of ['', 'A', 'AB']) assert.match(model.confidenceLabel(model.fitness(text), text.length).label, /Insufficient/);
  const long = 'THE '.repeat(30);
  assert.equal(model.confidenceLabel(model.fitness(long), 90).label, 'Uncalibrated model fit');

  // Exercise the actual Detective button/result renderer, with a bounded solver fixture.
  const det = new JSDOM(read('cipher-detective.html'), {runScripts:'outside-only'});
  const dw = det.window, dd = dw.document;
  for (const file of ['analyses.js','scoring.js','lang-model.js']) dw.eval(read('js/detective/' + file));
  dw.DetectiveRender = {draw(){}, clear(){}};
  const result = text => ({method:'Fixture',key:'test',plaintext:text,fitness:dw.DetectiveLangModel.fitness(text),perChar:dw.DetectiveLangModel.fitness(text)/4,confidence:dw.DetectiveLangModel.confidenceLabel(dw.DetectiveLangModel.fitness(text),4)});
  dw.DetectiveSolvers = {solveAuto(){ const best = result('ZXQJ'); return {best, attempts:[best,result('QJZX')],runtimeMs:0}; }};
  dw.eval(read('js/detective/detective.js'));
  await new Promise(resolve => dw.addEventListener('load', resolve));
  dd.getElementById('detective-input').value = 'ZXQJ';
  dd.getElementById('detective-input').dispatchEvent(new dw.Event('input'));
  dd.getElementById('det-autosolve-btn').click();
  await new Promise(resolve => setTimeout(resolve,60));
  const rendered = dd.getElementById('det-autosolve-result').textContent;
  assert.match(rendered, /Best-scoring candidate \(unverified\)/);
  assert.match(rendered, /Short sample/);
  assert.match(rendered, /Model-fit note/);
  assert.match(rendered, /2 overlapping trigrams/);
  assert.match(rendered, /not a language probability/);
  assert(!/Very likely English|Confidence/.test(rendered));
  const scrollRegion = dd.querySelector('.autosolve-table-scroll');
  assert.equal(scrollRegion.tabIndex,0);
  assert.equal(scrollRegion.getAttribute('role'),'region');
  assert.match(scrollRegion.getAttribute('aria-label'),/candidate results/);
  assert(!scrollRegion.contains(dd.querySelector('.autosolve-best')), 'Only the table scrolls; explanatory content stays outside.');
  det.window.close();

  const dom = new JSDOM(read('cryptanalysis.html'), {runScripts:'outside-only'});
  const w = dom.window, d = w.document;
  d.querySelectorAll('script:not([src])').forEach(script => {
    if (!script.type || script.type === 'text/javascript') w.eval(script.textContent);
  });
  w.setTimeout = callback => { callback(); return 0; }; // Skip animation delay, retain search logic.
  assert(Math.abs(w.caesarToyScore('HELLOWORLD') - 5.85) < 1e-12);
  assert(Math.abs(w.caesarToyScore('HELLOWORLD') - w.caesarToyScore('DLROWOLLEH')) < 1e-12);
  assert(Math.abs(w.caesarToyScore('EEEEEEEEEE') - 12.7) < 1e-12);
  assert.equal(w.caesarToyDecrypt('KHOOR ZRUOG',3), 'HELLO WORLD');
  const freq = [8.2,1.5,2.8,4.3,12.7,2.2,2.0,6.1,7.0,.15,.77,4,2.4,6.7,7.5,1.9,.095,6,6.3,9.1,2.8,.98,2.4,.15,2,.074];
  for (const prefix of ['hill','anneal']) {
    const input = d.getElementById(prefix + 'Input').value;
    const rows = Array.from(d.querySelectorAll('#' + prefix + 'Landscape tbody tr'));
    assert.equal(rows.length,26);
    const expected = [];
    for (let shift=0;shift<26;shift++) {
      const codes = [...input.replace(/[^A-Z]/g,'')].map(c => (c.charCodeAt(0)-65-shift+26)%26);
      const score = codes.reduce((sum,c) => sum+freq[c],0)/codes.length;
      expected.push(score);
      assert(Math.abs(Number(rows[shift].dataset.score)-score)<1e-12);
    }
    const max = Math.max(...expected);
    rows.forEach((row,i) => assert.equal(row.textContent.includes('Score optimum'),Math.abs(expected[i]-max)<1e-10));
    assert.match(rows[3].textContent,/Supplied answer/);
  }
  assert(!d.querySelector('#hillLandscape tr[data-shift="3"]').textContent.includes('Score optimum'), 'Supplied correct key need not maximize this score');
  await w.runHillClimb();
  assert.equal(d.querySelectorAll('#hillLandscape tbody tr').length,26);
  assert.equal(Array.from(d.querySelectorAll('#hillLandscape tbody tr')).filter(r=>r.textContent.includes('Stopping point')).length,1);
  assert.match(d.getElementById('hillLandscape').textContent,/Evaluated path/);
  w.Math.random = () => 0.5;
  await w.runAnneal();
  assert.equal(Array.from(d.querySelectorAll('#annealLandscape tbody tr')).filter(r=>r.textContent.includes('Stopping point')).length,1);
  assert.equal(d.getElementById('annealInput').disabled,false);
  const hill = d.getElementById('hillInput');
  hill.value = '<img src=x onerror=alert(1)>AAAA';hill.dispatchEvent(new w.Event('input'));
  assert.equal(d.querySelectorAll('#hillLandscape img').length,0);
  assert.match(d.getElementById('hillLandscape').textContent,/none for this edited input/);
  hill.value = '123 !';hill.dispatchEvent(new w.Event('input'));await w.runHillClimb();
  assert.match(d.getElementById('hillLandscape').textContent,/at least one/);
  assert.equal(d.querySelectorAll('#hillLandscape tbody tr').length,0);
  d.getElementById('hillExample').click();
  assert.equal(hill.value,'KHOOR ZRUOG');
  assert.match(d.getElementById('hillLandscape').textContent,/Supplied known answer: shift 3/);
  dom.window.close();

  // Independent hand-checkable encryption and repeated actual solver runs.
  assert.equal(referenceEncrypt('ATTACKATDAWN',[2,0,3,1]),'TAWACDATNTKA');
  let clock=0;
  const first = runExperiment({clock:()=>++clock}), second=runExperiment({clock:()=>clock+=2});
  assert.deepEqual(withoutTimings(first),withoutTimings(second));
  assert.equal(first.runs.length,24);
  assert(first.runs.some(run=>run.exactPlaintext));
  assert(first.runs.some(run=>!run.exactPlaintext));
  assert(first.runs.some(run=>!run.candidate));
  for (const run of first.runs) {
    assert(run.evaluations<=run.options.budget);
    assert(run.preprocessingEvaluations<=run.evaluations);
    assert.equal(run.elapsedMs,1);
    assert.equal(typeof run.exactKey,'boolean');
    assert.equal(run.rectangle,run.remainder?'incomplete':'complete');
  }
  for (const row of first.summary) {
    assert.equal(row.runs,12);
    assert.equal(row.exactPlaintexts+row.unsuccessfulPlaintexts,row.runs);
    assert.equal(row.noCandidate,first.runs.filter(run=>run.variant===row.variant&&!run.candidate).length);
  }
  console.log('Classical teaching: model labels preserve fitness; 26-shift landscapes and DOM controls verified; 24-run classroom experiment replays with failures retained.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
