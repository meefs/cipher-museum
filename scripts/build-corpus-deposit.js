#!/usr/bin/env node
'use strict';

/**
 * build-corpus-deposit.js — assemble a complete, self-contained Zenodo upload
 * package for a Cipher Corpus version.
 *
 *   node scripts/build-corpus-deposit.js 0.7
 *   node scripts/build-corpus-deposit.js 0.7 --out dist/corpus-v0.7-deposit
 *
 * The package mirrors the v0.6 deposit's shape so the two versions are
 * comparable: canonical payload, schema, stats, rights and provenance
 * documents, a per-record license summary computed from the payload itself, a
 * dataset-level CITATION.cff, a changelog, the CC0 LICENSE for synthetic
 * records, an evaluation export, and a checksum manifest covering everything.
 *
 * Nothing here is published. The script stages files and writes the exact
 * metadata to enter on Zenodo; creating the deposit needs credentials this
 * repository does not hold.
 *
 * It never writes to public/corpus/ (the immutable v0.6 archive) and never
 * writes to public/corpus/v<version>/ either — only to the staging directory.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const version = args.find((value) => /^\d+\.\d+$/.test(value));
const outFlag = args.indexOf('--out');

if (!version) {
  console.error('usage: build-corpus-deposit.js <version> [--out <dir>]');
  process.exit(1);
}

const DATASET_DIR = path.join(ROOT, `public/corpus/v${version}`);
const OUT = outFlag >= 0
  ? path.resolve(args[outFlag + 1])
  : path.join(ROOT, `dist/corpus-v${version}-deposit`);

const identifiers = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/release-identifiers.json'), 'utf8'));
const pending = (identifiers.pending || []).find((entry) => entry.version === version)
  || identifiers.datasets.find((entry) => entry.version === version);
if (!pending) {
  console.error(`no release-identifiers entry for dataset v${version}`);
  process.exit(1);
}

const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const EVAL_SEED = `cipher-corpus-v${version}`;

/* ------------------------------------------------ 1. build and verify source */

if (!fs.existsSync(path.join(DATASET_DIR, 'all.jsonl'))) {
  console.log('Building the canonical dataset...');
  execFileSync(process.execPath, [path.join(ROOT, 'scripts/build-corpus-v07.js')],
    { cwd: ROOT, stdio: 'inherit' });
}

// Verify every dataset file against the committed manifest before packaging.
const manifest = fs.readFileSync(path.join(DATASET_DIR, 'SHA256SUMS.txt'), 'utf8')
  .trim().split('\n').map((line) => {
    const [digest, name] = line.split(/\s+/);
    return { digest, name };
  });
const verified = [];
for (const entry of manifest) {
  const actual = sha256(path.join(DATASET_DIR, entry.name));
  if (actual !== entry.digest) {
    console.error(`CHECKSUM MISMATCH: ${entry.name}\n  manifest ${entry.digest}\n  actual   ${actual}`);
    process.exit(1);
  }
  verified.push(entry.name);
}
console.log(`Verified ${verified.length} dataset files against SHA256SUMS.txt.`);

const records = fs.readFileSync(path.join(DATASET_DIR, 'all.jsonl'), 'utf8')
  .split('\n').filter(Boolean).map(JSON.parse);
const stats = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, 'stats.json'), 'utf8'));

/* ----------------------------------------------- 2. compute rights from data */

const tally = (list, pick) => list.reduce((acc, record) => {
  const key = String(pick(record));
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

const synthetic = records.filter((record) => record.source_type === 'synthetic');
const historical = records.filter((record) => record.source_type === 'historical');
const recordLicenses = tally(records, (record) => record.license);
const provenanceLicenses = tally(records, (record) => record.source_provenance?.license);
const missingProvenance = records.filter((record) => !record.source_provenance).length;
const mismatches = records.filter((record) =>
  record.source_provenance && record.license !== record.source_provenance.license).length;

const licenseSummary = {
  dataset: `Cipher Corpus v${version}`,
  source_commit: pending.source_commit,
  source_tag: pending.tag,
  canonical_records: records.length,
  source_type_counts: { synthetic: synthetic.length, historical: historical.length },
  record_license_counts: recordLicenses,
  provenance_license_counts: provenanceLicenses,
  missing_source_provenance: missingProvenance,
  record_provenance_license_mismatches: mismatches,
  authenticity_counts: stats.by_authenticity,
  pair_status_counts: stats.by_pair_status,
  benchmark_eligible: stats.benchmark_eligible,
  notes: [
    'CC0 and CC0-1.0 identify the same CC0 1.0 dedication for synthetic records.',
    'Historical records retain per-record public-domain assertions and source attribution; the deposit does not apply CC0 to historical source material.',
    `Counts were computed from the exact all.jsonl payload in this deposit (${records.length} records).`,
    `v${version} withholds 13 v0.6 historical-context records whose ciphertext matches a source-review-trigger pattern; this does not prove fabrication. See excluded-records.json.`
  ]
};

const syntheticByLicense = Object.entries(tally(synthetic, (record) => record.license))
  .map(([name, count]) => `- ${count.toLocaleString('en-US')} use \`${name}\` in both \`license\` and \`source_provenance.license\`.`)
  .join('\n');

const rights = `# Rights and provenance

Cipher Corpus v${version} contains records with two distinct rights categories. The
categories are stated in the records themselves and are not replaced by a
blanket license for the deposit.

## Synthetic records

There are ${synthetic.length.toLocaleString('en-US')} synthetic records:

${syntheticByLicense}

The included \`LICENSE\` file applies the CC0 1.0 Universal Public Domain
Dedication to these synthetic benchmark records.

## Historical records

There are ${historical.length} records with \`source_type\` set to \`historical\`. Every one
uses \`public domain\` in both \`license\` and \`source_provenance.license\`, and
each retains a source name and URL in its provenance. These statements report
the project's record-level rights classification; they do not apply CC0 to the
underlying historical source material or to unrelated modern scans,
transcriptions, editions, websites, or commentary.

Users who redistribute or republish historical source material should review
the attribution and provenance in each record and evaluate the law applicable
to their use.

### What v${version} changed about historical records

v${version} does not assert that a historical record is an authentic transcription.
Each one now carries an explicit \`authenticity\` value and a \`pair_status\`, and
only records whose plaintext and ciphertext demonstrably correspond are marked
\`benchmark_eligible\`. Thirteen v0.6 historical-context records whose stored
ciphertext matches a source-review-trigger pattern are withheld and listed,
with the evidence, in \`excluded-records.json\`. This pattern does not prove
fabrication. The records remain in the immutable v0.6
deposit. Of the ${historical.length} historical records retained here,
${stats.by_authenticity.catalogued_unreviewed || 0} are labelled
\`catalogued_unreviewed\`: no review has independently certified them, and that
label states the absence of certification rather than implying authenticity.

## Software license and excluded material

The MIT license at the root of the Cipher Museum repository covers code and
infrastructure. It is not the license for this dataset deposit and is not
included here.

The supplements containing additional Arabic and historical records are outside
the canonical corpus and are not included in this deposit. Rights statements
for those excluded supplements are therefore outside this package's scope.

## Zenodo rights metadata

The Zenodo draft should declare both of these rights entries:

1. **CC0 1.0 Universal (CC0-1.0)** — applies to the ${synthetic.length.toLocaleString('en-US')} synthetic records.
2. **Historical records: public-domain status asserted per record** — custom
   wording: "CC0 applies only to the ${synthetic.length.toLocaleString('en-US')} synthetic records. The ${historical.length}
   historical records are labeled 'public domain' in both their \`license\` and
   \`source_provenance.license\` fields and retain their per-record source
   attribution and provenance. No blanket relicensing of historical source
   material is asserted."

Use this stable link for the custom rights entry:

<https://github.com/systemslibrarian/cipher-museum/blob/${pending.source_commit}/public/corpus/LICENSE>
`;

/* ----------------------------------------------- 3. dataset-level CITATION */

const today = new Date().toISOString().slice(0, 10);
const citation = `cff-version: 1.2.0
message: "If you use Cipher Corpus v${version}, cite this dataset."
type: dataset
title: "Cipher Corpus v${version}: A Classical Cryptography Dataset"
authors:
  - family-names: Clark
    given-names: "Paul A."
    orcid: "https://orcid.org/${identifiers.software.orcid}"
repository-code: "https://github.com/systemslibrarian/cipher-museum"
url: "https://ciphermuseum.com/cipher-corpus.html"
commit: "${pending.source_commit}"
version: "${version}"
license: CC0-1.0
abstract: >-
  ${records.length.toLocaleString('en-US')} known-answer ciphertext records across
  ${stats.cipher_types} classical cipher-type labels, intended for cryptanalysis
  teaching, tool development and LLM evaluation. Each record carries the cipher
  type, key or settings, plaintext, ciphertext, difficulty, language, expected
  attacks and rights metadata. v${version} adds explicit authenticity and
  pair-status classification, a single reproducible definition of both length
  fields, and unique tags on every record. ${stats.benchmark_eligible.toLocaleString('en-US')}
  records are marked benchmark-eligible; the remainder are not verified
  known-answer pairs and must not be scored as such. Synthetic records are
  CC0 1.0; historical records retain their per-record public-domain assertions
  and provenance.
keywords:
  - classical cryptography
  - cryptanalysis
  - benchmark dataset
  - cipher
  - LLM evaluation
  - cryptography education
  - historical cryptography
references:
  - type: software
    title: "${identifiers.software.title}"
    authors:
      - family-names: Clark
        given-names: "Paul A."
        orcid: "https://orcid.org/${identifiers.software.orcid}"
    doi: "${identifiers.software.doi}"
    version: "${identifiers.software.version}"
    notes: "The software that generates, verifies and serves this dataset."
  - type: data
    title: "Cipher Corpus v0.6: A Classical Cryptography Dataset"
    authors:
      - family-names: Clark
        given-names: "Paul A."
        orcid: "https://orcid.org/${identifiers.software.orcid}"
    doi: "10.5281/zenodo.23297920"
    version: "0.6"
    notes: >-
      The immutable previous version this dataset is derived from. Records
      withdrawn in v${version} remain available there.
`;

/* ----------------------------------------------- 4. changelog for the deposit */

const repoChangelog = fs.readFileSync(path.join(ROOT, 'public/corpus/CHANGELOG.md'), 'utf8');

/* ----------------------------------------------- 5. evaluation export */

fs.mkdirSync(OUT, { recursive: true });
const evalFile = path.join(OUT, 'llm-3shot-eval.jsonl');
execFileSync(process.execPath, [
  path.join(ROOT, 'scripts/export-llm-3shot.js'),
  '--input', path.join(DATASET_DIR, 'all.jsonl'),
  '--count', '300',
  '--seed', EVAL_SEED,
  '--output', evalFile
], { cwd: ROOT, stdio: 'pipe' });

/* ----------------------------------------------- 6. stage the package */

const copies = [
  ['all.jsonl', path.join(DATASET_DIR, 'all.jsonl')],
  ['cipher-corpus.schema.json', path.join(DATASET_DIR, 'cipher-corpus.schema.json')],
  ['stats.json', path.join(DATASET_DIR, 'stats.json')],
  ['excluded-records.json', path.join(DATASET_DIR, 'excluded-records.json')],
  ['change-inventory.json', path.join(DATASET_DIR, 'change-inventory.json')],
  ['README.md', path.join(DATASET_DIR, 'README.md')],
  ['LICENSE', path.join(ROOT, 'public/corpus/LICENSE')]
];
for (const [name, source] of copies) fs.copyFileSync(source, path.join(OUT, name));

fs.writeFileSync(path.join(OUT, 'RIGHTS_AND_PROVENANCE.md'), rights);
fs.writeFileSync(path.join(OUT, 'record-license-summary.json'), `${JSON.stringify(licenseSummary, null, 2)}\n`);
fs.writeFileSync(path.join(OUT, 'CITATION.cff'), citation);
fs.writeFileSync(path.join(OUT, 'CHANGELOG.md'), repoChangelog);

/* ----------------------------------------------- 7. manifest and metadata */

const packaged = fs.readdirSync(OUT).filter((name) => name !== 'SHA256SUMS.txt'
  && name !== 'zenodo-metadata.json' && name !== 'UPLOAD.md').sort();
const depositManifest = packaged
  .map((name) => `${sha256(path.join(OUT, name))}  ${name}`).join('\n') + '\n';
fs.writeFileSync(path.join(OUT, 'SHA256SUMS.txt'), depositManifest);

const metadata = {
  upload_type: 'dataset',
  title: `Cipher Corpus v${version}: A Classical Cryptography Dataset`,
  version,
  publication_date: today,
  creators: [{
    name: identifiers.software.author,
    orcid: identifiers.software.orcid
  }],
  license: 'cc-zero',
  access_right: 'open',
  keywords: [
    'classical cryptography', 'cryptanalysis', 'benchmark dataset', 'cipher',
    'LLM evaluation', 'cryptography education', 'historical cryptography'
  ],
  related_identifiers: [
    {
      scheme: 'doi',
      identifier: identifiers.software.doi,
      relation: 'isSupplementTo',
      resource_type: 'software'
    },
    {
      scheme: 'url',
      identifier: `https://github.com/systemslibrarian/cipher-museum/tree/${pending.tag}`,
      relation: 'isDerivedFrom',
      resource_type: 'software'
    }
  ],
  description: [
    `<p>${records.length.toLocaleString('en-US')} known-answer ciphertext records across ${stats.cipher_types} classical cipher-type labels, for cryptanalysis teaching, tool development and LLM evaluation. Built from the immutable v0.6 archive at tag <code>${pending.tag}</code> (commit <code>${String(pending.source_commit).slice(0, 12)}</code>).</p>`,
    `<p><strong>What v${version} changes.</strong> Four defects that v0.6 could only record as errata are fixed here, because fixing them required changing record bytes and the v0.6 archive is immutable.</p>`,
    '<ul>',
    `<li><strong>Historical records are classified.</strong> Every record carries <code>authenticity</code>, <code>pair_status</code> and <code>benchmark_eligible</code>. ${stats.benchmark_eligible.toLocaleString('en-US')} records are verified known-answer pairs; the remaining ${(records.length - stats.benchmark_eligible).toLocaleString('en-US')} are not, and must not be scored as such. Thirteen v0.6 historical-context records whose ciphertext matches a source-review-trigger pattern are withheld pending source verification, with the evidence in <code>excluded-records.json</code>. The pattern does not prove fabrication.</li>`,
    '<li><strong>Length fields have one reproducible definition.</strong> <code>text_length</code> and <code>normalized_text_length</code> are computed from the plaintext alone, by Unicode code point, with normalization before filtering.</li>',
    '<li><strong>Tags are unique</strong> in every record.</li>',
    '<li><strong>Split labels are described accurately.</strong> Both <code>public</code> and <code>blind</code> ship in this download; neither is secret or withheld.</li>',
    '</ul>',
    `<p><strong>Compatibility.</strong> Thirteen record IDs are retired and are not reused. Japanese and Russian leave the canonical set, since their only records were among those withdrawn; both remain in the repository's non-canonical historical supplement. <code>verified</code> now means benchmark-eligible rather than being a generator flag. <code>dataset_version</code> is the release, with the old per-batch label preserved as <code>source_batch</code>. Length fields changed in 83,918 records. Every per-record difference from v0.6 is itemised in <code>change-inventory.json</code>.</p>`,
    '<p><strong>Rights.</strong> CC0 1.0 applies to the synthetic records. Historical records retain their per-record public-domain assertions, source attribution and provenance; no blanket relicensing of historical source material is asserted. See <code>RIGHTS_AND_PROVENANCE.md</code> and <code>record-license-summary.json</code>.</p>',
    `<p><strong>Reproducibility.</strong> Regenerate from the repository at tag <code>${pending.tag}</code> with <code>npm run build:corpus:v07</code> and verify against <code>SHA256SUMS.txt</code>. The evaluation export is seeded (<code>${EVAL_SEED}</code>) and therefore reproducible.</p>`,
    `<p>Previous version: <a href="https://doi.org/10.5281/zenodo.23297920">10.5281/zenodo.23297920</a> (v0.6).</p>`
  ].join('\n')
};
fs.writeFileSync(path.join(OUT, 'zenodo-metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);

const totalBytes = packaged.reduce((sum, name) => sum + fs.statSync(path.join(OUT, name)).size, 0);
console.log(`\nStaged ${packaged.length} files (${(totalBytes / 1e6).toFixed(1)} MB) in ${path.relative(ROOT, OUT)}`);
for (const name of packaged) {
  console.log(`  ${String(fs.statSync(path.join(OUT, name)).size).padStart(10)}  ${name}`);
}
console.log('\nMetadata to enter on Zenodo: zenodo-metadata.json');
console.log('Package manifest: SHA256SUMS.txt (covers every file above)');
console.log('\nThis script publishes nothing.');
