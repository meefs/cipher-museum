#!/usr/bin/env node
'use strict';

/**
 * zenodo-deposit.js — create (and optionally publish) a Zenodo new-version
 * deposit for a staged Cipher Corpus package.
 *
 *   export ZENODO_TOKEN=...            # or put it in ~/.config/zenodo/token
 *   node scripts/zenodo-deposit.js 0.7              # create/refresh the draft
 *   node scripts/zenodo-deposit.js 0.7 --verify     # read-only audit of the draft
 *   node scripts/zenodo-deposit.js 0.7 --publish    # draft, verify, then publish
 *
 * --verify makes GET requests only. It creates, modifies and publishes nothing,
 * so it is safe to run repeatedly while reviewing a draft before approving it.
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
const VERIFY_ONLY = args.includes('--verify');
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Zenodo fronts its API with a rate limiter that answers bursts with an HTML
 * 403 ("unusual traffic from your network"), and it also returns the usual 429
 * and 5xx. None of those mean the request was wrong, and losing a 120 MB upload
 * to one would be painful, so transient failures are retried with backoff.
 *
 * A genuine authorization failure answers with JSON, so an HTML body is the
 * signal that distinguishes "the gatekeeper is throttling us" from "this token
 * may not do that". A JSON 403 is never retried.
 */
function isTransient(status, body) {
  if (status === 429 || status >= 500) return true;
  if (status === 403 && typeof body === 'string' && /<html/i.test(body)) return true;
  return false;
}

async function api(route, options = {}) {
  const url = route.startsWith('http') ? route : `${API}${route}`;
  const attempts = options.body && options.raw ? 3 : 5;
  let last;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    // A stream body can only be read once, so re-open it per attempt.
    const body = typeof options.reopenBody === 'function' ? options.reopenBody() : options.body;
    const response = await fetch(url, {
      ...options,
      body,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        ...(options.body && !options.raw ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
      }
    });
    const text = response.status === 204 ? '' : await response.text();
    let parsed = null;
    if (text) { try { parsed = JSON.parse(text); } catch { parsed = text; } }
    if (response.ok) return parsed;

    const detail = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
    last = new Error(`${options.method || 'GET'} ${url} -> HTTP ${response.status}\n`
      + `${String(detail).slice(0, 400)}`);
    if (!isTransient(response.status, parsed) || attempt === attempts) throw last;
    const wait = Math.min(60000, 4000 * 2 ** (attempt - 1));
    process.stderr.write(`  HTTP ${response.status} (transient); retrying in ${wait / 1000}s `
      + `[${attempt}/${attempts - 1}]\n`);
    await sleep(wait);
  }
  throw last;
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
  //
  // Resolve it through the concept record, then that record's own versions
  // endpoint. A `?q=conceptrecid:<id>` search is NOT used: Zenodo answers that
  // query shape with HTTP 400, which would have failed this step every time.
  const conceptId = CONCEPT_DOI.split('.').pop();
  const concept = await api(`/records/${conceptId}`, { redirect: 'follow' });
  const conceptRecId = concept.conceptrecid || conceptId;
  const lineage = await api(`/records/${concept.id}/versions`);
  const hits = (lineage?.hits?.hits || [])
    .slice()
    .sort((left, right) => Number(right.id) - Number(left.id));
  if (!hits.length) throw new Error(`no published records found for concept ${CONCEPT_DOI}`);
  const latest = hits[0];
  if (String(latest.conceptrecid) !== String(conceptRecId)) {
    throw new Error(`record ${latest.id} is not in concept ${conceptRecId}; refusing to branch `
      + 'a new version off an unrelated record');
  }
  console.log(`Concept ${CONCEPT_DOI}: latest published version is `
    + `${latest.metadata?.version || '?'} (record ${latest.id}, doi ${latest.doi}).`);
  if (latest.metadata?.version === version) {
    console.error(`v${version} is already published as ${latest.doi}. Refusing to deposit it twice.`);
    process.exit(1);
  }

  // ---- 2a. read-only audit of an existing draft, for review before approval.
  if (VERIFY_ONLY) {
    const depositions = await api('/deposit/depositions?size=100&all_versions=true');
    const candidates = (Array.isArray(depositions) ? depositions : [])
      .filter((entry) => String(entry.conceptrecid) === String(conceptRecId));
    const unsubmitted = candidates.filter((entry) => entry.submitted === false);
    const problems = [];

    console.log(`\n--- Cipher Corpus v${version} draft audit (read-only) ---`);
    console.log(`Depositions in concept ${conceptRecId}: ${candidates.length}`
      + ` (${unsubmitted.length} unsubmitted)`);
    if (unsubmitted.length === 0) {
      console.log('\nNo unsubmitted draft exists. Nothing to audit.');
      process.exit(1);
    }
    if (unsubmitted.length > 1) {
      problems.push(`${unsubmitted.length} unsubmitted drafts exist; expected exactly one`);
    }
    const target = await api(`/deposit/depositions/${unsubmitted[0].id}`);

    // Relationship to the existing dataset.
    console.log(`\nDraft id        : ${target.id}`);
    console.log(`State           : submitted=${target.submitted} (false means UNPUBLISHED)`);
    console.log(`Concept recid   : ${target.conceptrecid}`);
    console.log(`Previous version: v${latest.metadata?.version} (record ${latest.id}, ${latest.doi})`);
    console.log(`Reserved DOI    : ${target.metadata?.prereserve_doi?.doi
      || target.doi || '(not shown until publication)'}`);
    if (String(target.conceptrecid) !== String(conceptRecId)) {
      problems.push('draft is not in the dataset concept lineage');
    }
    if (target.submitted) problems.push('draft reports submitted=true; it is not an open draft');

    // Files: names, count, and md5 against the local package.
    const remote = target.files || [];
    console.log(`\nFiles on draft  : ${remote.length} (package has ${files.length})`);
    const remoteByName = new Map(remote.map((file) => [file.filename, file]));
    for (const entry of files) {
      const found = remoteByName.get(entry.name);
      if (!found) { problems.push(`missing from draft: ${entry.name}`); console.log(`  MISSING  ${entry.name}`); continue; }
      const remoteMd5 = String(found.checksum || '').replace(/^md5:/, '');
      const localMd5 = md5(path.join(PKG, entry.name));
      const ok = remoteMd5 === localMd5;
      if (!ok) problems.push(`checksum mismatch: ${entry.name}`);
      console.log(`  ${ok ? 'ok      ' : 'MISMATCH'} ${entry.name}  md5 ${remoteMd5.slice(0, 16)}…`
        + `  sha256(local) ${entry.digest.slice(0, 16)}…`);
      remoteByName.delete(entry.name);
    }
    for (const leftover of remoteByName.keys()) {
      problems.push(`unexpected file on draft: ${leftover}`);
      console.log(`  EXTRA    ${leftover}`);
    }

    // Metadata, field by field, against the staged definition.
    const want = JSON.parse(fs.readFileSync(path.join(PKG, 'zenodo-metadata.json'), 'utf8'));
    const have = target.metadata || {};
    console.log('\nMetadata:');
    for (const key of ['upload_type', 'title', 'version', 'publication_date', 'license', 'access_right']) {
      const expected = want[key];
      const actual = typeof have[key] === 'object' && have[key] !== null
        ? (have[key].id || JSON.stringify(have[key])) : have[key];
      const ok = String(actual) === String(expected);
      if (!ok) problems.push(`metadata ${key}: draft has ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
      console.log(`  ${ok ? 'ok      ' : 'MISMATCH'} ${key}: ${JSON.stringify(actual)}`);
    }
    const creator = (have.creators || [])[0] || {};
    const wantCreator = want.creators[0];
    const creatorOk = creator.name === wantCreator.name && creator.orcid === wantCreator.orcid;
    if (!creatorOk) problems.push('creator name/ORCID does not match');
    console.log(`  ${creatorOk ? 'ok      ' : 'MISMATCH'} creator: ${creator.name} / ${creator.orcid}`);
    const wantKeywords = new Set(want.keywords);
    const haveKeywords = new Set(have.keywords || []);
    const keywordsOk = wantKeywords.size === haveKeywords.size
      && [...wantKeywords].every((keyword) => haveKeywords.has(keyword));
    if (!keywordsOk) problems.push('keywords differ from the staged metadata');
    console.log(`  ${keywordsOk ? 'ok      ' : 'MISMATCH'} keywords: ${haveKeywords.size} present`);
    for (const related of want.related_identifiers || []) {
      const present = (have.related_identifiers || [])
        .some((item) => item.identifier === related.identifier && item.relation === related.relation);
      if (!present) problems.push(`related identifier missing: ${related.identifier} (${related.relation})`);
      console.log(`  ${present ? 'ok      ' : 'MISSING '} related: ${related.identifier} (${related.relation})`);
    }

    console.log(`\nReview URL      : ${target.links?.html || `https://zenodo.org/deposit/${target.id}`}`);
    if (problems.length) {
      console.log(`\n${problems.length} PROBLEM(S) — do not publish:`);
      for (const problem of problems) console.log(`  - ${problem}`);
      process.exit(1);
    }
    console.log('\nAll checks passed. The draft matches the staged package exactly.');
    console.log('NOT PUBLISHED. Publication requires an explicit --publish run.');
    return;
  }

  // ---- 3. open a new version draft
  let draft;
  // List the account's depositions and pick an unsubmitted draft in this concept.
  // Filtering client-side avoids depending on a server query syntax that has
  // already proved unreliable here.
  const existing = await api('/deposit/depositions?size=100&all_versions=true')
    .catch(() => []);
  const openDraft = (Array.isArray(existing) ? existing : []).find((entry) =>
    entry.submitted === false && String(entry.conceptrecid) === String(conceptRecId));
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
      body: true, // placeholder: reopenBody supplies the real stream per attempt
      reopenBody: () => fs.createReadStream(source),
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
