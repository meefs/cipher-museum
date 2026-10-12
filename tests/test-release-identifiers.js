#!/usr/bin/env node
'use strict';

/**
 * test-release-identifiers.js — guard the release-identifier surfaces and the
 * one command that writes a dataset DOI.
 *
 * Two things are being protected.
 *
 * First, that no DOI is ever claimed for a dataset that has not been deposited.
 * A citation pointing at an identifier that does not resolve is the one release
 * mistake that cannot be taken back once someone has copied it.
 *
 * Second, that recording a real DOI actually works. The repository's recorded
 * failure mode is a claim fixed on some surfaces and missed on others, and a
 * dataset DOI lives on six. The recorder is therefore exercised end to end
 * against a scratch copy with a synthetic DOI, and the release validator is run
 * over the result — so the path is known to work before anyone needs it at
 * publication time, when getting it wrong is public.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const identifiers = JSON.parse(read('data/release-identifiers.json'));

let checks = 0;
const check = (label, fn) => { fn(); checks += 1; void label; };

const DOI_SHAPE = /^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/;

/* ----------------------------------------- nothing unpublished may be cited */

check('every published dataset has a real DOI and every pending one has none', () => {
  assert.ok(identifiers.datasets.length > 0, 'at least one dataset is published');
  for (const entry of identifiers.datasets) {
    assert.match(entry.doi, DOI_SHAPE, `v${entry.version} DOI shape`);
    assert.ok(entry.published, `v${entry.version} records when it was published`);
  }
  for (const entry of identifiers.pending || []) {
    assert.equal(entry.doi, null, `v${entry.version} is pending and must carry no DOI`);
    assert.ok(entry.blocked_on, `v${entry.version} records what it is waiting on`);
  }
});

check('a pending dataset is not cited as citable anywhere in the repository', () => {
  const surfaces = ['CITATION.cff', '.zenodo.json', 'docs/CORPUS_PUBLISHING.md', 'README.md'];
  const publishedDois = new Set(identifiers.datasets.map((entry) => entry.doi));
  for (const entry of identifiers.pending || []) {
    for (const surface of surfaces) {
      const text = read(surface);
      // Any Zenodo DOI mentioned on a citation surface must be one that exists.
      for (const match of text.matchAll(/10\.5281\/zenodo\.\d+/g)) {
        const known = publishedDois.has(match[0])
          || match[0] === identifiers.dataset_concept_doi
          || match[0] === identifiers.software.doi
          || match[0] === identifiers.software.concept_doi;
        assert.ok(known, `${surface} cites unknown DOI ${match[0]}`);
      }
      void entry;
    }
  }
});

check('the tagged source commit of a pending dataset exists and matches its tag', () => {
  for (const entry of identifiers.pending || []) {
    if (!entry.tag) continue;
    const resolved = spawnSync('git', ['rev-parse', `${entry.tag}^{commit}`],
      { cwd: root, encoding: 'utf8' });
    if (resolved.status !== 0) continue; // tag not created yet: nothing to check
    assert.equal(resolved.stdout.trim(), entry.source_commit,
      `${entry.tag} must point at the commit recorded for v${entry.version}`);
  }
});

/* -------------------------------- the recorder, exercised end to end */

const NEEDED = [
  'package.json', '.zenodo.json', 'CITATION.cff', 'LICENSE', '.gitattributes',
  'data/release-identifiers.json', 'public/corpus/stats.json',
  'docs/CORPUS_PUBLISHING.md', 'docs/releases/corpus-v0.7.md',
  'public/corpus/v0.7/README.md'
];

function scratchRoot() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-ids-'));
  for (const relative of NEEDED) {
    const target = path.join(dir, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(root, relative), target);
  }
  return dir;
}

const record = (dir, version, doi, extra = []) => spawnSync(process.execPath,
  [path.join(root, 'scripts/record-dataset-doi.js'), version, doi, '--root', dir, ...extra],
  { cwd: root, encoding: 'utf8' });

check('recording a DOI updates all six surfaces and leaves metadata valid', () => {
  const dir = scratchRoot();
  const synthetic = '10.5281/zenodo.99887766';

  const result = record(dir, '0.7', synthetic);
  assert.equal(result.status, 0, `recorder failed:\n${result.stdout}${result.stderr}`);

  const updated = JSON.parse(fs.readFileSync(path.join(dir, 'data/release-identifiers.json'), 'utf8'));
  const entry = updated.datasets.find((candidate) => candidate.version === '0.7');
  assert.ok(entry, 'v0.7 moved into the published list');
  assert.equal(entry.doi, synthetic);
  assert.ok(entry.published, 'a publication date was recorded');
  assert.equal(entry.status, undefined, 'the pending status fields were cleared');
  assert.ok(!(updated.pending || []).some((candidate) => candidate.version === '0.7'),
    'v0.7 is no longer pending');
  assert.ok(updated.datasets.some((candidate) => candidate.version === '0.6'),
    'the previous version is retained, since software v1.0.0 shipped against it');

  const citation = fs.readFileSync(path.join(dir, 'CITATION.cff'), 'utf8');
  assert.ok(citation.includes(`doi: "${synthetic}"`), 'CITATION.cff cites the new DOI');
  assert.ok(citation.includes('doi: "10.5281/zenodo.23297920"'), 'and still cites v0.6');

  const zenodo = JSON.parse(fs.readFileSync(path.join(dir, '.zenodo.json'), 'utf8'));
  assert.ok(zenodo.related_identifiers.some((item) => item.identifier === synthetic
    && item.resource_type === 'dataset' && item.relation === 'isSupplementedBy'),
    '.zenodo.json links the new dataset');

  // Prose no longer says the dataset is unpublished.
  for (const relative of ['public/corpus/v0.7/README.md', 'docs/releases/corpus-v0.7.md',
    'docs/CORPUS_PUBLISHING.md']) {
    const text = fs.readFileSync(path.join(dir, relative), 'utf8');
    assert.ok(text.includes(synthetic), `${relative} records the DOI`);
    assert.doesNotMatch(text, /no Zenodo deposit (exists|and no DOI)/i,
      `${relative} must stop saying there is no deposit`);
    assert.doesNotMatch(text, /has no DOI/i, `${relative} must stop saying there is no DOI`);
  }

  // The release validator must accept the result: this is the assertion that
  // makes the command trustworthy at publication time.
  const validated = spawnSync(process.execPath,
    [path.join(root, 'scripts/validate-release-metadata.js'), '--root', dir],
    { cwd: root, encoding: 'utf8' });
  assert.equal(validated.status, 0,
    `release metadata invalid after recording:\n${validated.stdout}${validated.stderr}`);

  fs.rmSync(dir, { recursive: true, force: true });
});

check('the recorder refuses every way of getting it wrong', () => {
  const dir = scratchRoot();
  const cases = [
    [['0.7', '10.5281/zenodo.1234567'], /placeholder/i, 'a placeholder DOI'],
    [['0.7', 'https://doi.org/10.5281/zenodo.123456'], /is not a DOI/i, 'a URL instead of a DOI'],
    [['0.7', 'zenodo.123456'], /is not a DOI/i, 'a bare record id'],
    [['0.9', '10.5281/zenodo.99887766'], /not pending/i, 'an unknown version'],
    [['0.6', '10.5281/zenodo.99887766'], /not pending/i, 'an already-published version']
  ];
  for (const [argv, pattern, label] of cases) {
    const result = record(dir, argv[0], argv[1]);
    assert.notEqual(result.status, 0, `must refuse ${label}`);
    assert.match(result.stderr, pattern, `must explain refusing ${label}`);
  }
  // Nothing was written by any refusal.
  assert.deepEqual(
    JSON.parse(fs.readFileSync(path.join(dir, 'data/release-identifiers.json'), 'utf8')).datasets
      .map((entry) => entry.version),
    identifiers.datasets.map((entry) => entry.version),
    'a refused run must not modify anything');
  fs.rmSync(dir, { recursive: true, force: true });
});

check('recording twice is refused rather than duplicating a citation', () => {
  const dir = scratchRoot();
  assert.equal(record(dir, '0.7', '10.5281/zenodo.99887766').status, 0);
  const second = record(dir, '0.7', '10.5281/zenodo.99887766');
  assert.notEqual(second.status, 0, 'the second run must refuse');
  assert.match(second.stderr, /not pending/i);
  fs.rmSync(dir, { recursive: true, force: true });
});

check('--dry-run writes nothing', () => {
  const dir = scratchRoot();
  const before = fs.readFileSync(path.join(dir, 'CITATION.cff'), 'utf8');
  const result = record(dir, '0.7', '10.5281/zenodo.99887766', ['--dry-run']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Nothing written/);
  assert.equal(fs.readFileSync(path.join(dir, 'CITATION.cff'), 'utf8'), before);
  fs.rmSync(dir, { recursive: true, force: true });
});

console.log(`Release identifier checks passed: ${checks} groups; `
  + `${identifiers.datasets.length} published dataset(s), `
  + `${(identifiers.pending || []).length} pending with no DOI.`);
