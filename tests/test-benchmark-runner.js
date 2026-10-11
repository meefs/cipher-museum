// test-benchmark-runner.js: Unit test for benchmark runner

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

// Create a minimal corpus file. Ciphertext and plaintext MUST differ so the
// accuracy measurement is meaningful — the no-op stub solvers return the
// ciphertext, which should score as incorrect against the known plaintext.
const root = path.resolve(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'cipher-benchmark-'));
const corpusPath = path.join(temp, 'minicorpus.jsonl');
const outDir = path.join(temp, 'public-results');
const records = [{
  ciphertext: 'DWWDFN',
  plaintext: 'ATTACK',
  id: 'public-record',
  split: 'public',
  cipher_name: 'Dummy',
  language: 'en',
  homophonic: false,
  noisy: false,
  synthetic: false,
  source_provenance: { type: 'synthetic', details: 'test' }
}, {
  ciphertext: 'KHOOR',
  plaintext: 'HELLO',
  id: 'blind-record',
  split: 'blind',
  cipher_name: 'Blind Dummy'
}];
fs.writeFileSync(corpusPath, records.map(JSON.stringify).join('\n') + '\n');

// Run the benchmark runner
execSync(`${JSON.stringify(process.execPath)} scripts/benchmark-runner.js --corpus ${JSON.stringify(corpusPath)} --solvers solvers/ --out ${JSON.stringify(outDir)}`, { cwd: root, stdio: 'inherit' });

// Check that reports exist
if (!fs.existsSync(path.join(outDir, 'benchmark-report.html')) || !fs.existsSync(path.join(outDir, 'benchmark-report.json'))) {
  throw new Error('Benchmark runner did not produce reports.');
}

// The runner must now actually MEASURE accuracy, not just emit rows.
if (!fs.existsSync(path.join(outDir, 'benchmark-summary.json'))) {
  throw new Error('Benchmark runner did not produce an accuracy summary.');
}
const summary = JSON.parse(fs.readFileSync(path.join(outDir, 'benchmark-summary.json'), 'utf8'));
if (!Array.isArray(summary) || summary.length === 0) {
  throw new Error('Benchmark summary is empty.');
}
for (const s of summary) {
  if (typeof s.scored !== 'number' || typeof s.correct !== 'number') {
    throw new Error(`Summary for ${s.solver_name} is missing accuracy fields.`);
  }
  if (s.scored !== 1) {
    throw new Error(`Expected 1 scored record for ${s.solver_name}, got ${s.scored}.`);
  }
  // The stub solvers echo the ciphertext, which differs from the plaintext.
  if (s.correct !== 0) {
    throw new Error(`No-op solver ${s.solver_name} should score 0 correct, got ${s.correct}.`);
  }
}

// Each per-record result must carry a correctness verdict.
const rows = fs.readFileSync(path.join(outDir, 'benchmark-report.json'), 'utf8').split('\n').filter(Boolean).map(JSON.parse);
if (!rows.every(r => r.correct === false && typeof r.char_accuracy === 'number' && r.split === 'public')) {
  throw new Error('Per-record results are missing correctness/accuracy fields.');
}
if (rows.some(row => row.record_id === 'blind-record')) throw new Error('Default run leaked the blind-labelled split.');

const blindOut = path.join(temp, 'blind-results');
execSync(`${JSON.stringify(process.execPath)} scripts/benchmark-runner.js --corpus ${JSON.stringify(corpusPath)} --solvers solvers/ --out ${JSON.stringify(blindOut)} --split blind`, { cwd: root, stdio: 'inherit' });
const blindRows = fs.readFileSync(path.join(blindOut, 'benchmark-report.json'), 'utf8').split('\n').filter(Boolean).map(JSON.parse);
if (!blindRows.length || !blindRows.every(row => row.split === 'blind')) throw new Error('Blind split selection failed.');

fs.rmSync(temp, { recursive: true, force: true });

console.log('benchmark runner test passed.');
