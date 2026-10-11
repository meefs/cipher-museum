// test-runner-receipt.js: Ensure benchmark runner produces a valid reproducibility receipt
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cipher-receipt-'));
const corpus = path.join(outDir, 'minicorpus.jsonl');
fs.writeFileSync(corpus, JSON.stringify({
  ciphertext: 'ABC',
  plaintext: 'ABC',
  cipher_name: 'Dummy',
  language: 'en',
  homophonic: false,
  noisy: false,
  synthetic: false,
  source_provenance: { type: 'synthetic', details: 'test' }
}) + '\n');
execSync(`${JSON.stringify(process.execPath)} scripts/benchmark-runner.js --corpus ${JSON.stringify(corpus)} --solvers solvers/ --out ${JSON.stringify(outDir)} --split all`, { cwd: root, stdio: 'inherit' });
const files = fs.readdirSync(outDir).filter(f => f.startsWith('receipt-') && f.endsWith('.json'));
if (files.length === 0) throw new Error('No receipt file produced.');
const receipt = JSON.parse(fs.readFileSync(path.join(outDir, files[0]), 'utf8'));
if (!receipt.run_id || !receipt.timestamp || !receipt.corpus_version || !receipt.schema_version) throw new Error('Receipt missing required fields.');
if (receipt.parameters.split !== 'all') throw new Error('Receipt did not record selected split.');
fs.rmSync(outDir, { recursive: true, force: true });
console.log('Runner receipt test passed.');
