#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
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

const expected = {
  version: packageJson.version,
  title: 'Cipher Museum: An Interactive History of Cryptography and Codebreaking',
  author: 'Clark, Paul A.',
  orcid: '0009-0004-2394-0991',
  softwareDoi: '10.5281/zenodo.23298941',
  releaseDate: '2026-10-11',
  releaseCommit: '5ca041200b26dc2447dcae72cb63f051dca8064c',
  datasetVersion: '0.6',
  datasetDoi: '10.5281/zenodo.23297920',
  datasetRecords: 100326,
  datasetLabels: 85,
};

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
assert(citation.includes(`doi: "${expected.datasetDoi}"`),
  'CITATION.cff must retain the related dataset citation');

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
console.log(`  Software release: v${expected.version}, ${expected.releaseDate}, commit ${expected.releaseCommit}`);
console.log(`  Software DOI: ${expected.softwareDoi}`);
