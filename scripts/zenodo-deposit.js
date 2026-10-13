#!/usr/bin/env node
'use strict';

/**
 * zenodo-deposit.js — create (and optionally publish) a Zenodo new-version
 * deposit for a staged Cipher Corpus package.
 *
 *   export ZENODO_TOKEN=...            # or put it in ~/.config/zenodo/token
 *   node scripts/zenodo-deposit.js 0.7              # create/refresh the draft
 *   node scripts/zenodo-deposit.js 0.7 --publish    # draft, verify, then publish
 *
 * By default this stops at a reviewable draft and publishes nothing. A draft can
 * be deleted; a published DOI cannot be withdrawn, so --publish is opt-in and
 * runs only after every uploaded file's checksum has been confirmed against the
 * local manifest.
 *
 * What it does:
 *   1. Confirms the token carries deposit scope.
 *   2. Opens a new version under the dataset concept DOI, so the new DOI joins
 *      the existing version lineage rather than starting a new record.
 *   3. Removes the files inherited from the previous version, so the draft
 *      cannot ship a mix of two payloads.
 *   4. Uploads every file in the staged package.
 *   5. Verifies each file's server-side MD5 against the local bytes, and the
 *      file list against SHA256SUMS.txt.
 *   6. Applies the metadata from zenodo-metadata.json.
 *   7. Publishes only if --publish was passed and every check above held.
 *
 * The token is read from the environment or a mode-600 file. It is never
 * printed, never written to the repository, and never passed on a command line.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const API = process.env.ZENODO_API || 'https://zenodo.org/api';

const args = process.argv.slice(2);
const version = args.find((value) => /^\d+\.\d+$/.test(value));
const PUBLISH = args.includes('--publish');
const outFlag = args.indexOf('--package');

if (!version) {
  console.error('usage: zenodo-deposit.js <version> [--package <dir>] [--publish]');
  process.exit(1);
}

const PKG = outFlag >= 0
  ? path.resolve(args[outFlag + 1])
  : path.join(ROOT, `dist/corpus-v${version}-deposit`);

function token() {
  if (process.env.ZENODO_TOKEN) return process.env.ZENODO_TOKEN.trim();
  const file = path.join(os.homedir(), '.config/zenodo/token');
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8').trim();
  console.error('No Zenodo token. Set ZENODO_TOKEN or write it to ~/.config/zenodo/token (chmod 600).');
  process.exit(1);
}
const TOKEN = token();

const identifiers = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/release-identifiers.json'), 'utf8'));
const CONCEPT_DOI = identifiers.dataset_concept_doi;

async function api(route, options = {}) {
  const url = route.startsWith('http') ? route : `${API}${route}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      ...(options.body && !options.raw ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  });
  const text = response.status === 204 ? '' : await response.text();
  let body = null;
  if (text) { try { body = JSON.parse(text); } catch { body = text; } }
  if (!response.ok) {
    const detail = typeof body === 'string' ? body : JSON.stringify(body);
    throw new Error(`${options.method || 'GET'} ${url} -> HTTP ${response.status}\n${String(detail).slice(0, 600)}`);
  }
  return body;
}

const md5 = (file) => crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex');

function manifest() {
  return fs.readFileSync(path.join(PKG, 'SHA256SUMS.txt'), 'utf8').trim().split('\n')
    .map((line) => { const [digest, name] = line.split(/\s+/); return { digest, name }; });
}

async function main() {
  if (!fs.existsSync(PKG)) {
    console.error(`staged package not found: ${PKG}\nRun: node scripts/build-corpus-deposit.js ${version}`);
    process.exit(1);
  }

  // ---- 0. local integrity first. Never upload bytes we have not re-verified.
  const files = manifest();
  for (const entry of files) {
    const actual = crypto.createHash('sha256')
      .update(fs.readFileSync(path.join(PKG, entry.name))).digest('hex');
    if (actual !== entry.digest) {
      console.error(`local checksum mismatch for ${entry.name}; refusing to upload.`);
      process.exit(1);
    }
  }
  console.log(`Local package verified: ${files.length} files.`);

  // ---- 1. token scope
  await api('/deposit/depositions?size=1');
  console.log('Token has deposit scope.');

  // ---- 2. find the latest published version in the concept lineage
  const conceptId = CONCEPT_DOI.split('.').pop();
  const lineage = await api(`/records?q=conceptrecid:${conceptId}&all_versions=true&size=50&sort=-version`);
  const hits = lineage?.hits?.hits || [];
  if (!hits.length) throw new Error(`no published records found for concept ${CONCEPT_DOI}`);
  const latest = hits[0];
  console.log(`Concept ${CONCEPT_DOI}: latest published version is `
    + `${latest.metadata?.version || '?'} (record ${latest.id}, doi ${latest.doi}).`);
  if (latest.metadata?.version === version) {
    console.error(`v${version} is already published as ${latest.doi}. Refusing to deposit it twice.`);
    process.exit(1);
  }

  // ---- 3. open a new version draft
  let draft;
  const existing = await api(`/deposit/depositions?q=conceptrecid:${conceptId}&size=50`)
    .catch(() => []);
  const openDraft = (Array.isArray(existing) ? existing : [])
    .find((entry) => entry.submitted === false);
  if (openDraft) {
    draft = await api(`/deposit/depositions/${openDraft.id}`);
    console.log(`Reusing the existing unsubmitted draft ${draft.id}.`);
  } else {
    const action = await api(`/deposit/depositions/${latest.id}/actions/newversion`, { method: 'POST' });
    const draftUrl = action.links?.latest_draft;
    if (!draftUrl) throw new Error('Zenodo did not return a draft link for the new version');
    draft = await api(draftUrl);
    console.log(`Opened new-version draft ${draft.id}.`);
  }

  // ---- 4. clear inherited files so two payloads cannot mix
  const inherited = draft.files || [];
  for (const file of inherited) {
    await api(`/deposit/depositions/${draft.id}/files/${file.id}`, { method: 'DELETE' });
  }
  if (inherited.length) console.log(`Removed ${inherited.length} inherited file(s) from the draft.`);

  // ---- 5. upload
  const bucket = draft.links?.bucket;
  if (!bucket) throw new Error('draft has no bucket link; cannot upload files');
  for (const entry of files) {
    const source = path.join(PKG, entry.name);
    const size = fs.statSync(source).size;
    process.stdout.write(`  uploading ${entry.name} (${(size / 1e6).toFixed(1)} MB)... `);
    const uploaded = await api(`${bucket}/${encodeURIComponent(entry.name)}`, {
      method: 'PUT',
      raw: true,
      body: fs.createReadStream(source),
      duplex: 'half',
      headers: { 'Content-Type': 'application/octet-stream' }
    });
    const remote = String(uploaded.checksum || '').replace(/^md5:/, '');
    const local = md5(source);
    if (remote !== local) {
      throw new Error(`${entry.name}: Zenodo stored md5 ${remote}, local is ${local}`);
    }
    process.stdout.write('ok (md5 verified)\n');
  }

  // ---- 6. metadata
  const staged = JSON.parse(fs.readFileSync(path.join(PKG, 'zenodo-metadata.json'), 'utf8'));
  await api(`/deposit/depositions/${draft.id}`, {
    method: 'PUT',
    body: JSON.stringify({ metadata: staged })
  });
  console.log('Metadata applied.');

  // ---- 7. confirm the draft contains exactly the package
  const refreshed = await api(`/deposit/depositions/${draft.id}`);
  const remoteNames = (refreshed.files || []).map((file) => file.filename).sort();
  const localNames = files.map((entry) => entry.name).sort();
  if (JSON.stringify(remoteNames) !== JSON.stringify(localNames)) {
    throw new Error(`draft file list does not match the package.\n  draft: ${remoteNames.join(', ')}`
      + `\n  package: ${localNames.join(', ')}`);
  }
  console.log(`Draft ${refreshed.id} holds exactly the ${localNames.length} package files.`);
  console.log(`Review it: ${refreshed.links?.html || `https://zenodo.org/deposit/${refreshed.id}`}`);

  if (!PUBLISH) {
    console.log('\nDraft only. Nothing published.');
    console.log(`To publish: node scripts/zenodo-deposit.js ${version} --publish`);
    return;
  }

  // ---- 8. publish (irreversible)
  const published = await api(`/deposit/depositions/${refreshed.id}/actions/publish`, { method: 'POST' });
  console.log(`\nPUBLISHED. Version DOI: ${published.doi}`);
  console.log(`Concept DOI: ${published.conceptdoi || CONCEPT_DOI}`);
  console.log(`\nNow record it:\n  node scripts/record-dataset-doi.js ${version} ${published.doi}`);
}

main().catch((error) => {
  console.error(`\nzenodo-deposit failed: ${error.message}`);
  process.exit(1);
});
