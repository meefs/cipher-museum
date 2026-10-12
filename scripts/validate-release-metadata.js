#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// --root lets the release tests validate a scratch copy of the metadata, so the
// DOI-recording path is exercised end to end without touching the repository.
const rootFlag = process.argv.indexOf('--root');
const root = rootFlag >= 0
  ? path.resolve(process.argv[rootFlag + 1])
  : path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const fail = (message) => {
  console.error(`Release metadata validation failed: ${message}`);
  process.exit(1);
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const packageJson = JSON.parse(read('package.json'));
const zenodo = JSON.parse(read('.zenodo.json'));
const citation = read('CITATION.cff');
const license = read('LICENSE');
const attributes = read('.gitattributes');
const corpusStats = JSON.parse(read('public/corpus/stats.json'));
const allMetadata = `${JSON.stringify(zenodo)}\n${citation}`;

// Identifiers come from data/release-identifiers.json so that a DOI is written
// in exactly one place and every citation surface is checked against it. The
// local v0.6 assertions below still pin the archive that this repository serves,
// which is the immutable v0.6 deposit.
const identifiers = JSON.parse(read('data/release-identifiers.json'));
const publishedDatasets = identifiers.datasets;
const servedDataset = publishedDatasets.find((entry) => entry.local_archive === 'public/corpus/');
assert(servedDataset, 'release identifiers must describe the dataset served from public/corpus/');

const expected = {
  version: packageJson.version,
  title: identifiers.software.title,
  author: identifiers.software.author,
  orcid: identifiers.software.orcid,
  softwareDoi: identifiers.software.doi,
  releaseDate: identifiers.software.release_date,
  releaseCommit: identifiers.software.release_commit,
  datasetVersion: servedDataset.version,
  datasetDoi: servedDataset.doi,
  datasetRecords: servedDataset.records,
  datasetLabels: servedDataset.cipher_type_labels,
};

assert(identifiers.software.version === packageJson.version,
  'release identifiers must record the same software version as package.json');

// A DOI may never be recorded for a dataset that has not been deposited, and a
// pending version may never be cited as though it had one. This is the guard
// against the one unrecoverable mistake in a release: publishing a reference to
// an identifier that does not resolve.
for (const entry of publishedDatasets) {
  assert(/^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/.test(entry.doi || ''),
    `dataset v${entry.version} is listed as published but carries no valid DOI`);
}
for (const entry of identifiers.pending || []) {
  assert(entry.doi === null,
    `dataset v${entry.version} is pending, so its DOI must be null until Zenodo issues one`);
  assert(!publishedDatasets.some((published) => published.version === entry.version),
    `dataset v${entry.version} cannot be both published and pending`);
  const claim = new RegExp(`Cipher Corpus v${entry.version.replaceAll('.', '\\.')}[^\n]*10\\.5281`);
  assert(!claim.test(citation), `CITATION.cff cites a DOI for unpublished dataset v${entry.version}`);
  assert(!claim.test(JSON.stringify(zenodo)),
    `.zenodo.json cites a DOI for unpublished dataset v${entry.version}`);
}

assert(zenodo.upload_type === 'software', '.zenodo.json must use upload_type "software"');
assert(zenodo.title === expected.title, '.zenodo.json has an unexpected software title');
assert(zenodo.access_right === 'open', '.zenodo.json must describe an open-access record');
assert(zenodo.license === 'mit', '.zenodo.json must use Zenodo\'s MIT license identifier');
assert(!Object.hasOwn(zenodo, 'doi'), '.zenodo.json must not invent or borrow a software DOI');
assert(!Object.hasOwn(zenodo, 'version'),
  '.zenodo.json must let the GitHub release tag supply the software version');
assert(Array.isArray(zenodo.creators) && zenodo.creators.length === 1,
  '.zenodo.json must name exactly one software creator');
assert(zenodo.creators[0].name === expected.author, '.zenodo.json creator is incorrect');
assert(zenodo.creators[0].orcid === expected.orcid, '.zenodo.json ORCID is incorrect');

const relatedDataset = zenodo.related_identifiers?.find(
  (item) => item.identifier === expected.datasetDoi,
);
assert(relatedDataset, '.zenodo.json must link the published Cipher Corpus v0.6 DOI');
assert(relatedDataset.scheme === 'doi', 'the related corpus identifier must use the DOI scheme');
assert(relatedDataset.relation === 'isSupplementedBy',
  'the software-to-dataset relation must be isSupplementedBy');
assert(relatedDataset.resource_type === 'dataset', 'the related corpus must be typed as a dataset');

assert(/^type: software$/m.test(citation), 'CITATION.cff must describe software');
assert(citation.includes(`title: "${expected.title}"`), 'CITATION.cff title is incorrect');
assert(citation.includes('family-names: Clark') && citation.includes('given-names: "Paul A."'),
  'CITATION.cff author is incorrect');
assert(citation.includes(`orcid: "https://orcid.org/${expected.orcid}"`),
  'CITATION.cff ORCID is incorrect');
assert(citation.includes(`version: "${expected.version}"`),
  'CITATION.cff version must match package.json');
assert(new RegExp(`^doi: "${expected.softwareDoi.replaceAll('.', '\\.')}"$`, 'm').test(citation),
  'CITATION.cff must cite the published software version DOI');
assert(citation.includes(`date-released: "${expected.releaseDate}"`),
  'CITATION.cff must contain the published software release date');
assert(citation.includes(`commit: "${expected.releaseCommit}"`),
  'CITATION.cff must identify the archived release commit');
for (const entry of publishedDatasets) {
  assert(citation.includes(`doi: "${entry.doi}"`),
    `CITATION.cff must cite published dataset v${entry.version} (${entry.doi})`);
  const linked = zenodo.related_identifiers?.find((item) => item.identifier === entry.doi);
  assert(linked, `.zenodo.json must link published dataset v${entry.version} (${entry.doi})`);
  assert(linked.scheme === 'doi' && linked.resource_type === 'dataset',
    `the v${entry.version} related identifier must be a DOI typed as a dataset`);
}

assert(license.startsWith('MIT License\n'), 'the repository software license must remain MIT');
assert(attributes.includes('public/corpus/all.json filter=lfs'), 'all.json must remain tracked by Git LFS');
assert(attributes.includes('public/corpus/all.jsonl filter=lfs'), 'all.jsonl must remain tracked by Git LFS');
assert(corpusStats.version === expected.datasetVersion,
  `local Cipher Corpus must remain at v${expected.datasetVersion}`);
assert(corpusStats.records === expected.datasetRecords,
  `Cipher Corpus v${expected.datasetVersion} must contain ${expected.datasetRecords} records`);
assert(corpusStats.cipherTypes === expected.datasetLabels,
  `Cipher Corpus v${expected.datasetVersion} must contain ${expected.datasetLabels} cipher-type labels`);
assert(!/Paul Lester|Lester, Paul/i.test(allMetadata), 'release metadata contains an erroneous author');

console.log('Release metadata validation passed:');
console.log(`  Software: ${expected.title} v${expected.version}`);
console.log(`  Creator: ${expected.author} (${expected.orcid})`);
console.log('  Type/license: software / MIT');
console.log(`  Related dataset: Cipher Corpus v${expected.datasetVersion}, ${expected.datasetRecords} records / ${expected.datasetLabels} labels`);
console.log(`  Dataset DOI/relation: ${expected.datasetDoi} (isSupplementedBy)`);
for (const entry of publishedDatasets) {
  console.log(`  Published dataset: Cipher Corpus v${entry.version} -> ${entry.doi}`);
}
for (const entry of identifiers.pending || []) {
  console.log(`  Pending dataset: Cipher Corpus v${entry.version} -> no DOI (${entry.status})`);
}
console.log(`  Software release: v${expected.version}, ${expected.releaseDate}, commit ${expected.releaseCommit}`);
console.log(`  Software DOI: ${expected.softwareDoi}`);
