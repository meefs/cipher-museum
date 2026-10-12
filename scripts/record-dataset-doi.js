#!/usr/bin/env node
'use strict';

/**
 * record-dataset-doi.js — record a Zenodo DOI for a dataset version that has
 * just been deposited, updating every citation surface in one step.
 *
 *   node scripts/record-dataset-doi.js 0.7 10.5281/zenodo.12345678
 *   node scripts/record-dataset-doi.js 0.7 10.5281/zenodo.12345678 --dry-run
 *
 * Why this exists. A dataset DOI appears in `data/release-identifiers.json`,
 * `CITATION.cff`, `.zenodo.json`, the publishing doc, the release notes and the
 * dataset README. This repository's recorded failure mode is a claim that was
 * corrected on some surfaces and not others, so the DOI is written once, by one
 * command, and `npm run validate:release` then checks the surfaces agree.
 *
 * What it will not do:
 *
 *   - Invent a DOI. The DOI is an argument; there is no default and no guess.
 *   - Record a DOI for a version that is not listed as `pending`, or that is
 *     already published, or whose git tag does not exist.
 *   - Half-apply. Every edit is located before anything is written, and a
 *     missing target is a hard error naming the file and the expected text.
 *
 * Run it only after the Zenodo deposit is published and the DOI resolves.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const positional = args.filter((value) => !value.startsWith('--'));
const rootFlag = args.indexOf('--root');
const ROOT = rootFlag >= 0 ? path.resolve(args[rootFlag + 1]) : path.resolve(__dirname, '..');

const [version, doi] = positional;

function die(message) {
  console.error(`record-dataset-doi: ${message}`);
  process.exit(1);
}

if (!version || !doi) {
  die('usage: record-dataset-doi.js <dataset-version> <doi> [--dry-run] [--root <dir>]');
}
// Zenodo DOIs are 10.5281/zenodo.<digits>; accept any registrant but require
// the shape, so a typo or a placeholder cannot be recorded.
if (!/^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/.test(doi)) {
  die(`"${doi}" is not a DOI. Pass the identifier Zenodo issued, without a URL prefix.`);
}
if (/x{4,}|1234567|placeholder|example/i.test(doi)) {
  die(`"${doi}" looks like a placeholder, not an issued DOI.`);
}

const file = (relative) => path.join(ROOT, relative);
const read = (relative) => fs.readFileSync(file(relative), 'utf8');

const IDENTIFIERS = 'data/release-identifiers.json';
const identifiers = JSON.parse(read(IDENTIFIERS));

const pendingIndex = (identifiers.pending || []).findIndex((entry) => entry.version === version);
if (pendingIndex < 0) {
  const known = (identifiers.pending || []).map((entry) => entry.version).join(', ') || 'none';
  die(`dataset v${version} is not pending (pending: ${known}). Only a pending version can be recorded.`);
}
if (identifiers.datasets.some((entry) => entry.version === version)) {
  die(`dataset v${version} is already recorded as published; refusing to overwrite a DOI.`);
}
if (identifiers.datasets.some((entry) => entry.doi === doi)) {
  die(`${doi} is already recorded for another dataset version.`);
}

const pending = identifiers.pending[pendingIndex];

// The deposit cites a source commit, so the tag must exist and must match what
// the pending entry claims. A DOI pointing at a commit nobody can check is not
// a reproducible citation.
if (rootFlag < 0) {
  let tagged;
  try {
    tagged = execFileSync('git', ['rev-parse', `${pending.tag}^{commit}`], { cwd: ROOT })
      .toString().trim();
  } catch {
    die(`tag ${pending.tag} does not exist; tag the dataset's source commit before recording a DOI.`);
  }
  if (tagged !== pending.source_commit) {
    die(`tag ${pending.tag} points at ${tagged.slice(0, 12)} but the pending entry records `
      + `${String(pending.source_commit).slice(0, 12)}; resolve that before recording a DOI.`);
  }
}

const today = new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------- edits */

const edits = [];

// 1. release-identifiers.json: pending -> datasets.
{
  const next = JSON.parse(JSON.stringify(identifiers));
  const entry = next.pending.splice(pendingIndex, 1)[0];
  delete entry.status;
  delete entry.blocked_on;
  delete entry.on_issue;
  entry.doi = doi;
  entry.published = today;
  entry.immutable = true;
  entry.notes = `Published to Zenodo from tag ${entry.tag}. Canonical bytes are listed in `
    + `${entry.local_archive}SHA256SUMS.txt; they are generated, not committed.`;
  next.datasets.push(entry);
  next.datasets.sort((left, right) => Number(left.version) - Number(right.version));
  edits.push({ file: IDENTIFIERS, contents: `${JSON.stringify(next, null, 2)}\n` });
}

// 2. CITATION.cff: add a dataset reference. The existing v0.6 reference stays:
//    software v1.0.0 genuinely shipped against v0.6, and a citation file records
//    what a release used, not only the newest thing available.
{
  const citation = read('CITATION.cff');
  if (citation.includes(doi)) die('CITATION.cff already cites this DOI.');
  const reference = [
    '  - type: data',
    `    title: "Cipher Corpus v${version}: A Classical Cryptography Dataset"`,
    '    authors:',
    '      - family-names: Clark',
    '        given-names: "Paul A."',
    `        orcid: "https://orcid.org/${identifiers.software.orcid}"`,
    `    doi: "${doi}"`,
    `    url: "https://doi.org/${doi}"`,
    '    publisher:',
    '      name: Zenodo',
    `    version: "${version}"`,
    `    month: ${Number(today.slice(5, 7))}`,
    `    year: ${Number(today.slice(0, 4))}`,
    '    notes: >-',
    `      Related dataset with ${pending.records.toLocaleString('en-US')} canonical records across`,
    `      ${pending.cipher_type_labels} cipher-type labels. Synthetic records are CC0 1.0; historical`,
    '      records retain their per-record public-domain assertions and provenance.',
    ''
  ].join('\n');
  edits.push({ file: 'CITATION.cff', contents: `${citation.replace(/\n+$/, '\n')}${reference}` });
}

// 3. .zenodo.json: link the dataset from the software record, for the next
//    software deposit. The v0.6 link stays for the same reason as above.
{
  const zenodo = JSON.parse(read('.zenodo.json'));
  zenodo.related_identifiers = zenodo.related_identifiers || [];
  if (zenodo.related_identifiers.some((item) => item.identifier === doi)) {
    die('.zenodo.json already links this DOI.');
  }
  zenodo.related_identifiers.push({
    scheme: 'doi',
    identifier: doi,
    relation: 'isSupplementedBy',
    resource_type: 'dataset'
  });
  edits.push({ file: '.zenodo.json', contents: `${JSON.stringify(zenodo, null, 2)}\n` });
}

// 4. Prose surfaces. Each target is located exactly; a miss is a hard error
//    rather than a silent no-op, so the command can never half-apply.
const prose = [
  {
    file: `public/corpus/v${version}/README.md`,
    from: `# Cipher Corpus v${version} (tagged — not yet archived)`,
    to: `# Cipher Corpus v${version}`
  },
  {
    file: `public/corpus/v${version}/README.md`,
    from: `**This dataset has no DOI.** The source commit is tagged \`corpus-v${version}\`, but no\n`
      + 'Zenodo deposit has been created, so v0.7 is not yet citable. For a citable\n'
      + 'dataset use **v0.6**:',
    to: `**DOI:** [${doi}](https://doi.org/${doi}) — archived on Zenodo from tag\n`
      + `\`corpus-v${version}\`. The previous version remains available and citable at`
  },
  {
    file: `docs/releases/corpus-v${version}.md`,
    from: `# Cipher Corpus v${version} — release notes (tagged, awaiting archive)`,
    to: `# Cipher Corpus v${version} — release notes`
  },
  {
    file: `docs/releases/corpus-v${version}.md`,
    from: '**Status: tagged in the repository; not yet archived.** The source commit is\n'
      + `tagged \`corpus-v${version}\`, so the dataset is reproducible from a fixed point. **No\n`
      + `Zenodo deposit exists for v${version} and no DOI has been reserved or assigned.**`,
    to: `**Status: published.** Archived on Zenodo as\n`
      + `[${doi}](https://doi.org/${doi}), from tag \`corpus-v${version}\`\n`
      + `(commit \`${String(pending.source_commit).slice(0, 7)}\`).`
  },
  {
    file: 'docs/CORPUS_PUBLISHING.md',
    from: `## Corpus v${version} (tagged, not yet archived)`,
    to: `## Corpus v${version} (published)`
  },
  {
    file: 'docs/CORPUS_PUBLISHING.md',
    from: `Its source commit is tagged **\`corpus-v${version}\`**; it has\n`
      + '**no Zenodo deposit and no DOI**, so it is not yet citable.',
    to: `Its source commit is tagged **\`corpus-v${version}\`** and it is archived on\n`
      + `Zenodo as [${doi}](https://doi.org/${doi}).`
  },
  {
    // This paragraph describes a pre-publication posture and goes stale the
    // moment the DOI exists, so it is rewritten rather than left to contradict
    // the section above it.
    file: 'docs/CORPUS_PUBLISHING.md',
    from: 'Website download links, the corpus page\'s counts and the citation surfaces still\n'
      + `describe v0.6 deliberately. They change only when v${version} is actually published, so\n`
      + 'the site never advertises a dataset that has no DOI behind it.',
    to: `Citation surfaces record v${version} as of its publication; run\n`
      + `\`node scripts/record-dataset-doi.js <version> <doi>\` to update them all at once, and\n`
      + 'never ahead of an issued DOI. The website download links and the corpus page\n'
      + `still serve the v0.6 archive from \`public/corpus/\`, which keeps its own DOI;\n`
      + `the v${version} canonical bytes are distributed from the Zenodo deposit, since they\n`
      + 'are generated rather than committed.'
  }
];

const byFile = new Map();
for (const change of prose) {
  const current = byFile.get(change.file) ?? read(change.file);
  const count = current.split(change.from).length - 1;
  if (count !== 1) {
    die(`${change.file}: expected exactly one occurrence of:\n---\n${change.from}\n---\nfound ${count}. `
      + 'The document changed since this script was written; update it by hand and re-check.');
  }
  byFile.set(change.file, current.replace(change.from, change.to));
}
for (const [name, contents] of byFile) edits.push({ file: name, contents });

/* ------------------------------------------------------------------- apply */

if (DRY_RUN) {
  console.log(`Would record Cipher Corpus v${version} = ${doi}`);
  for (const edit of edits) console.log(`  update ${edit.file}`);
  console.log('\nNothing written (--dry-run).');
  process.exit(0);
}

for (const edit of edits) fs.writeFileSync(file(edit.file), edit.contents);

console.log(`Recorded Cipher Corpus v${version} = ${doi}`);
for (const edit of edits) console.log(`  updated ${edit.file}`);
console.log('\nNow run:');
console.log('  npm run validate:release');
console.log('  npm test');
console.log('and commit the result.');
