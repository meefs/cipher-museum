#!/usr/bin/env node
'use strict';

/**
 * Publish corrected, separately versioned supporting downloads. The v0.6
 * exports remain frozen. A historical supplement is an inventory of teaching
 * records, not a source-authenticated benchmark.
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const readline = require('node:readline');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public/corpus/v0.8');
const OLD = path.join(ROOT, 'public/corpus');
const CHECK = process.argv.includes('--check');
const REVIEWED_ON = '2026-10-22';
const names = ['historical-supplement.jsonl', 'llm-3shot-eval.jsonl',
  'supplements-manifest.json', 'supplements-SHA256SUMS.txt'];
const changedIds = ['two-square-002', 'two-square-003', 'two-square-004',
  'two-square-005', 'two-square-006', 'two-square-007'];
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const jsonl = values => values.map(value => JSON.stringify(value)).join('\n') + '\n';

async function readSelected(input, predicate) {
  const found = new Map();
  const lines = readline.createInterface({ input, crlfDelay: Infinity });
  for await (const line of lines) {
    if (!line) continue;
    const record = JSON.parse(line);
    if (predicate(record)) found.set(record.id, record);
  }
  return found;
}

function write(name, value) {
  const file = path.join(OUT, name);
  if (CHECK) {
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== value)
      throw new Error(`Stale or missing ${name}: run node scripts/build-corpus-v08-supplements.js`);
  } else {
    fs.writeFileSync(file, value);
  }
}

function fixHistorical(previous, canonical, excluded) {
  if (previous.length !== 100 || excluded.size !== 13)
    throw new Error('Unexpected historical supplement or exclusion count');
  const ids = new Set();
  const output = [];
  let inCanonical = 0, canonicalHistorical = 0, canonicalSynthetic = 0, legacyUnreviewed = 0;
  for (const original of previous) {
    if (ids.has(original.id)) throw new Error(`Duplicate historical ID ${original.id}`);
    ids.add(original.id);
    if (excluded.has(original.id)) continue;
    const current = canonical.get(original.id);
    if (current) {
      if (current.corpus_version !== '0.8' ||
          !['historical', 'synthetic'].includes(current.source_type))
        throw new Error(`Unexpected canonical record ${original.id}`);
      output.push({ ...current, supplement_release: '0.8', supplement_inclusion: 'canonical_v0.8' });
      inCanonical++;
      if (current.source_type === 'historical') canonicalHistorical++;
      else canonicalSynthetic++;
      continue;
    }
    // The older supplement includes records never admitted to the canonical
    // set. A v0.6 verified flag cannot assert that these historical pairs are
    // authenticated or reproducible under the modern corpus contract.
    const record = {
      ...original,
      legacy_verified_flag: original.verified,
      verified: false,
      pair_status: 'unverified_pair',
      verification_method: 'none',
      benchmark_eligible: false,
      authenticity: 'catalogued_unreviewed',
      supplement_release: '0.8',
      supplement_inclusion: 'legacy_unreviewed',
      source_link_status: 'context_only_not_pair_provenance'
    };
    if (original.id === 'hist-aeneas-001') {
      const bad = 'https://www.gutenberg.org/ebooks/31958';
      if (record.source_provenance?.url !== bad)
        throw new Error('Reviewed Aeneas wrong-work citation has changed');
      record.source_provenance = {
        ...record.source_provenance,
        url: null,
        archive: 'Original source citation unresolved'
      };
      record.source_link_status = 'wrong_work_retired';
      record.citation_erratum = {
        status: 'wrong_work',
        previous_url: bad,
        previous_archive: original.source_provenance.archive,
        reviewed_on: '2026-10-22',
        note: 'Project Gutenberg 31958 is Tunturikoski, not Aeneas Tacticus. A source for this teaching pair has not been verified.'
      };
    }
    output.push(record);
    legacyUnreviewed++;
  }
  if (ids.size !== 100 || output.length !== 87 || inCanonical !== 42 ||
      canonicalHistorical !== 41 || canonicalSynthetic !== 1 || legacyUnreviewed !== 45 ||
      ![...excluded].every(id => ids.has(id)))
    throw new Error('Historical supplement ID accounting changed');
  if (output.some(record => excluded.has(record.id)))
    throw new Error('Withdrawn record retained in corrected supplement');
  return { records: output, inCanonical, canonicalHistorical, canonicalSynthetic, legacyUnreviewed };
}

function correctEval(previous, canonical, originalById) {
  if (previous.length !== 300) throw new Error('Unexpected LLM export count');
  let corrected = 0;
  const output = previous.map(original => {
    if (original.cipher_type !== 'two_square') return original;
    const challengeId = original.source_record;
    const expected = ['two-square-005', 'two-square-006', 'two-square-007'][corrected];
    if (challengeId !== expected) throw new Error(`Unexpected Two-square prompt ${challengeId}`);
    const ids = [...changedIds.slice(0, 3), challengeId];
    const oldRecords = ids.map(id => originalById.get(id));
    const newRecords = ids.map(id => canonical.get(id));
    if ([...oldRecords, ...newRecords].some(record => !record))
      throw new Error(`Missing Two-square pair for ${challengeId}`);
    if (original.prompts.three_shot.evaluation.target !== newRecords[3].plaintext ||
        original.prompts.challenge.evaluation.target !== newRecords[3].plaintext)
      throw new Error(`Mismatched evaluation plaintext for ${challengeId}`);
    const updated = structuredClone(original);
    const keys = ['three_shot', 'challenge', 'key_recovery'];
    for (const kind of keys) {
      let prompt = updated.prompts[kind].prompt;
      const matches = [...prompt.matchAll(/Ciphertext: ([A-Z]+)/g)];
      const pairIds = kind === 'three_shot' ? [0, 1, 2, 3] : [3];
      if (matches.length !== pairIds.length) throw new Error(`Unexpected ${kind} examples for ${challengeId}`);
      let position = 0;
      prompt = prompt.replace(/Ciphertext: ([A-Z]+)/g, (whole, cipher) => {
        const i = pairIds[position++];
        if (cipher !== oldRecords[i].ciphertext)
          throw new Error(`Prompt disagrees with archived ${ids[i]}: ${cipher}`);
        return `Ciphertext: ${newRecords[i].ciphertext}`;
      });
      updated.prompts[kind].prompt = prompt;
    }
    corrected++;
    return updated;
  });
  if (corrected !== 3) throw new Error(`Unexpected corrected LLM prompt count: ${corrected}`);
  return { records: output, corrected };
}

// An HTTP status from this environment cannot settle whether an Internet
// Archive/NSA item is genuinely removed or access-restricted. Preserve these
// URLs and report only that the full text was unavailable to this review.
const accessUnavailable = new Set([
  'https://archive.org/details/bealepapers00ward',
  'https://archive.org/details/betweensilkcyani00mark',
  'https://archive.org/details/codebook00sing',
  'https://archive.org/details/codebreakers00kahn',
  'https://archive.org/details/defurtivis00port',
  'https://archive.org/details/desubtilitate00card',
  'https://archive.org/details/ethiopiabible00ulle',
  'https://archive.org/details/militarycryptana00frie',
  'https://archive.org/details/militarytelegrap01plum',
  'https://archive.org/details/netizens-on-history-and-impact-of-usenet',
  'https://archive.org/details/polygraphia00trit',
  'https://archive.org/details/traictedeschiffr00vige',
  'https://archive.org/details/traiteelement00dela',
  'https://www.nsa.gov/portals/75/documents/news-features/declassified-documents/cryptologic-spectrum/the_vic_cipher.pdf',
  'https://www.pownetwork.org/taps.htm'
]);

function replaceContextLink(row, url, archive, reason) {
  const oldUrl = row.source_provenance.url;
  row.source_provenance = { ...row.source_provenance, url, archive };
  row.source_link_status = 'context_only_not_pair_provenance';
  if (oldUrl && oldUrl !== url) {
    row.citation_erratum = {
      status: reason,
      previous_url: oldUrl,
      reviewed_on: REVIEWED_ON,
      note: 'The previous link did not establish this illustrative plaintext/ciphertext pair.'
    };
  }
}

function correctHistory(row) {
  // An explicit inventory state for every supplemental-only record. Reviewing
  // a citation does not turn an invented example into an historical artifact.
  row.supplement_release = '0.8';
  row.pair_review = {
    status: 'not_source_authenticated',
    reviewed_on: REVIEWED_ON,
    note: 'No original document was matched to this exact plaintext/ciphertext pair.'
  };
  // The old label described generated pair rights and was also placed under
  // source_provenance for copyrighted secondary works. Do not imply that
  // historical books or linked modern scholarship are public domain.
  row.legacy_source_license_label = row.source_provenance.license;
  row.source_provenance.license = 'not_assessed';
  row.citation_review = {
    status: accessUnavailable.has(row.source_provenance?.url)
      ? 'full_text_access_unavailable' : 'not_independently_checked',
    reviewed_on: REVIEWED_ON,
    scope: 'Source-link inventory; the cited work is contextual unless a passage is identified.'
  };
  const confirmed = (url, scope) => {
    row.citation_review = { status: 'context_passage_checked', reviewed_on: REVIEWED_ON,
      url, scope };
  };

  switch (row.id) {
    case 'hist-atbash-001':
      row.title = 'Atbash in Jeremiah — Hebrew Alphabet Tradition';
      row.legacy_historical_year = row.year;
      row.year = 'Biblical text; composition date debated';
      row.legacy_source_publication_date = row.source_provenance.publication_date;
      row.source_provenance.publication_date = null;
      replaceContextLink(row, 'https://www.sefaria.org/Jeremiah.51.41',
        'Jeremiah 51:41; compare 25:26 and Rashi on Jeremiah 51:41:1',
        'wrong_work');
      row.notes = 'Jeremiah names Sheshach, traditionally interpreted as Babel through Hebrew atbash. This English A–Z reversal and sentence are a modern teaching example, not biblical ciphertext.';
      row.historical_context = 'Hebrew atbash reverses the alphabet. Jeremiah 25:26 and 51:41 use the name Sheshach; traditional interpretation connects it to Babel. The text does not contain the English sentence in this record or establish why the name was chosen.';
      confirmed('https://www.sefaria.org/Jeremiah.51.41', 'Jeremiah reference and traditional reading; English pair is illustrative.');
      break;
    case 'hist-aeneas-001':
      row.source_provenance = { ...row.source_provenance,
        url: 'https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Aeneas_Tacticus/E*.html',
        archive: 'Aeneas Tacticus, Siege Defense 31.14 and 31.21–22 (Loeb English translation, 1928)' };
      row.source_link_status = 'context_only_not_pair_provenance';
      row.notes = 'Aeneas describes separate concealment methods: writing beneath wax and passing thread through letter holes in a wooden disc. The numbered English message here is a modern adaptation.';
      row.historical_context = 'In Siege Defense 31, Aeneas describes concealing writing beneath wax (§31.14) and a separate wooden disc perforated for Greek letters, with thread passed through the holes (§§31.21–22). The source does not give this English message or a rule for filling all remaining holes.';
      confirmed(row.source_provenance.url, 'Section 31.14 and 31.21–22; illustrative pair not authenticated.');
      break;
    case 'hist-caesar-002':
      row.title = "Augustus's One-Place Substitution — Suetonius";
      row.legacy_historical_year = row.year;
      row.year = 'Augustus reign (27 BCE–14 CE)';
      row.legacy_source_publication_date = row.source_provenance.publication_date;
      row.source_provenance.publication_date = 'c. 121 CE';
      row.notes = 'Suetonius says Augustus changed letters by one place, using B for A and double A for the final X. The A–Z wraparound and sample Latin phrase here are modern teaching choices, not a surviving Augustus letter.';
      row.historical_context = 'Suetonius, Augustus §88, describes a one-place substitution for confidential letters and double A for X. A quotation elsewhere about replacing A by D concerns Julius Caesar, not Augustus. This A–Z example uses a different alphabet and wrapping convention.';
      confirmed(row.source_provenance.url, 'Suetonius, Augustus §88; not a historical Augustus message.');
      break;
    case 'hist-kamasutra-001':
      row.notes = 'The Kāmasūtra lists writing in cipher among the 64 arts. The linked Burton translation does not specify reciprocal random letter pairs. This English letter-pair substitution is a modern illustration.';
      row.historical_context = 'The Burton translation lists understanding cipher writing and peculiar writing as an art. It does not supply the key, letter-pair rule or English example shown here; those details should not be attributed to the ancient text.';
      confirmed(row.source_provenance.url, 'List of 64 arts; no original letter-pair key or ciphertext.');
      break;
    case 'hist-geez-001':
      row.title = "Ge'ez-inspired Substitution — Modern Teaching Example";
      row.legacy_historical_year = row.year;
      row.year = 'modern reconstruction';
      row.legacy_source_type = row.source_type;
      row.source_type = 'synthetic';
      row.legacy_source_publication_date = row.source_provenance.publication_date;
      row.source_provenance.publication_date = null;
      row.notes = "An illustrative Latin-letter substitution inspired by the existence of Ethiopic manuscript traditions. The cited background has not been shown to document this scheme, a 1200 CE use, or this pair. The pair also does not replay against the current museum engine.";
      row.historical_context = "Cryptographic writing occurs in some Ethiopic manuscript scholarship, but this specific Ge'ez monastic substitution, date, intended use and English pair have no verified manuscript source. Treat this as a modern example awaiting a sourced historical replacement.";
      row.source_link_status = 'contextual_reference_does_not_support_specific_claim';
      row.citation_review = { status: 'historical_claim_not_substantiated', reviewed_on: REVIEWED_ON,
        scope: 'The existing citation was not matched to a manuscript or a primary description of this transform.' };
      break;
    case 'hist-bacon-001':
      row.title = 'Bacon Biliteral Cipher — 1605 Mention, 1623 Exposition';
      row.notes = 'Bacon mentioned a fivefold cipher in The Advancement of Learning (1605). His more detailed biliteral presentation appeared in De Augmentis Scientiarum (1623). The A/B sequence here is a modern example, not a transcription from either book.';
      row.historical_context = 'The linked 1605 text mentions the capacity of a fivefold cipher. The explicit biliteral method and worked account appeared in the later Latin De Augmentis Scientiarum (1623). Two forms of type can carry the A/B values in steganographic use.';
      confirmed(row.source_provenance.url, '1605 mention; full rules require the later 1623 work.');
      break;
    case 'hist-monoalpha-001':
      replaceContextLink(row, 'https://www.gutenberg.org/ebooks/2147',
        'Poe, The Gold-Bug (1843), in The Works of Edgar Allan Poe, Volume 1',
        'wrong_volume');
      row.notes = "Poe's The Gold-Bug contains a symbol-and-number cryptogram and a frequency-analysis explanation. This alphabetic pair is a modern illustration, not Poe's published cryptogram.";
      row.historical_context = "Poe published The Gold-Bug in 1843. Its characters solve a symbol-and-number cryptogram by reasoning about letter frequencies. The alphabetic pair here is a new illustration; it does not transcribe the story's cipher. Other claims about Poe's newspaper challenge need separate periodical evidence.";
      confirmed(row.source_provenance.url, 'Gutenberg Volume 1 contents include The Gold-Bug; pair illustrative.');
      break;
    case 'hist-morse-001':
      replaceContextLink(row, 'https://www.loc.gov/item/mcc.019/',
        'Library of Congress, original first telegraphic message tape, 24 May 1844',
        'wrong_item');
      row.notes = 'The historical message was “What hath God wrought” (24 May 1844). This dot-and-dash ciphertext uses modern International Morse to re-encode the words; it is not a transcription of the original American Morse tape. Morse code is an encoding, not secrecy.';
      row.historical_context = 'The Library of Congress holds the original first-message tape. The 1844 telegraph used American Morse; the International Morse notation used for this downloadable example differs from that historical tape.';
      confirmed(row.source_provenance.url, 'LOC identifies the original message tape; pair is modern re-encoding.');
      break;
    case 'hist-twosquare-001':
      row.title = 'Two-Square Cipher — Modern One-Pass Teaching Example';
      row.legacy_historical_year = row.year;
      row.year = 'modern reconstruction';
      row.legacy_source_type = row.source_type;
      row.source_type = 'synthetic';
      row.legacy_source_publication_date = row.source_provenance.publication_date;
      row.source_provenance.publication_date = null;
      row.notes = 'This modern horizontal Two-square example illustrates the rectangle rule. A related two-box Double Playfair system had military use, but a source for deployment of this exact one-pass exercise has not been established.';
      row.historical_context = 'Generic Two-square uses two keyed 5×5 squares. Double Playfair (Doppelkastenschlüssel) is a related two-pass construction and should not be conflated with this one-pass example. The cited contextual bibliography does not authenticate a WWII use of this pair.';
      break;
    case 'hist-kryha-001':
      replaceContextLink(row, 'https://www.nsa.gov/portals/75/documents/news-features/declassified-documents/tech-journals/qed.pdf',
        'NSA, Lambros D. Callimahos, Q.E.D.—2 Hours, 41 Minutes; 1933 correspondence',
        'more_direct_official_source');
      row.notes = 'The Kryha machine advanced an alphabet by an irregular mechanism. NSA recounts the 1933 demonstration in which a team solved a Kryha message in 2 hours 41 minutes of work. This sample pair is a modern toy, not that historical challenge.';
      row.historical_context = 'A contemporary letter and later NSA account document a 1933 cryptanalytic demonstration against the Kryha machine. The 2 hours 41 minutes count excludes a lunch break. This teaching ciphertext has not been matched to that material.';
      confirmed(row.source_provenance.url, 'NSA account of 1933 demonstration, not pair provenance.');
      break;
    case 'hist-typex-001':
      replaceContextLink(row, 'https://www.asd.gov.au/about/history/asd-stories/2022-04-01-typex',
        'Australian Signals Directorate, Typex historical account (2022)',
        'more_direct_institutional_source');
      row.notes = 'Typex was a British five-rotor machine developed from commercial Enigma designs. Some Typex machines could be modified to emulate Enigma settings. This exercise is illustrative, not output from a historical Typex setup.';
      row.historical_context = 'The Australian Signals Directorate describes Typex as a British rotor machine and notes that modified Typex could emulate Enigma settings. That capability does not mean all Typex machines were designed for general Enigma compatibility or that this downloadable pair reflects a real setup.';
      confirmed(row.source_provenance.url, 'Official historical account; no pair provenance.');
      break;
    case 'hist-otp-001':
      row.title = 'Vernam Teleprinter Cipher and One-Time Pad Conditions';
      row.legacy_historical_year = row.year;
      row.year = '1919 patent';
      row.notes = 'Vernam’s patent describes combining teleprinter signals with a cipher tape, which may be random or predetermined. Perfect secrecy requires a truly random key at least as long as the message and never reused. The A–Z pair here is a modern teaching example, not a patent specimen.';
      row.historical_context = 'US patent 1,310,719, Secret Signaling System, was filed in 1918 and published 22 July 1919. The patent permits a predetermined as well as a random cipher tape, so the patent does not by itself establish one-time-pad perfect secrecy for every implementation.';
      row.source_provenance = { ...row.source_provenance,
        url: 'https://patents.google.com/patent/US1310719A/en',
        archive: 'Vernam, US Patent 1,310,719, Secret Signaling System (filed 1918; published 1919)',
        publication_date: '1919-07-22' };
      confirmed(row.source_provenance.url, 'Patent filing, title, publication and tape options; not pair provenance.');
      break;
    case 'hist-polybius-002':
      row.title = 'Polybius Torch Signaling — Greek Coordinate System';
      row.notes = 'Polybius describes two groups of torches selecting coordinates from a five-by-five Greek alphabet. FIRE and its I/J-combined Latin coordinates are a modern adaptation, not a transmitted historical message.';
      row.historical_context = 'In Histories 10.45–47 Polybius describes letter-by-letter signaling and credits Cleoxenus and Democleitus for a prior method. The passage does not establish that Roman armies used this exact system across the Mediterranean.';
      row.source_provenance = { ...row.source_provenance,
        archive: 'Polybius, Histories Book 10.45–47, translated by W. R. Paton (Loeb)' };
      confirmed(row.source_provenance.url, 'Greek torch signaling and attribution; no Latin pair or Roman deployment.');
      break;
    case 'hist-hill-001':
      replaceContextLink(row, 'https://www.jstor.org/stable/2298294',
        'Lester S. Hill, Cryptography in an Algebraic Alphabet, American Mathematical Monthly 36(6), 306–312 (1929)',
        'wrong_article');
      row.notes = 'Hill’s 1929 paper describes a mathematical matrix cipher. The downloadable pair is an illustrative example; the linked paper has not been matched to this pair or to the claimed WWII US military deployment.';
      row.historical_context = 'Hill presented a polygraphic matrix construction in the American Mathematical Monthly in 1929. This record has no source for the previous claim that the US Army Signal Corps deployed this exact cipher in WWII.';
      confirmed('https://www.jstor.org/stable/i314580', '1929 volume TOC identifies the correct paper and stable URL; pair not checked against full article.');
      break;
    case 'hist-straddling-001':
      row.title = 'Straddling Checkerboard — VIC-Style Teaching Example';
      row.legacy_historical_year = row.year;
      row.year = 'modern reconstruction';
      row.legacy_source_type = row.source_type;
      row.source_type = 'synthetic';
      row.legacy_source_publication_date = row.source_provenance.publication_date;
      row.source_provenance.publication_date = null;
      row.notes = 'This digit encoding illustrates a straddling checkerboard. The previously cited NSA URL was not accessible in this review, and a source establishing the record’s specific 1920s NKVD/GRU deployment has not been verified.';
      row.historical_context = 'The VIC case involved a 1953 hollow-nickel message and subsequent disclosure after Reino Häyhänen defected. This downloadable mapping is an illustrative reconstruction, not a recovered original key; its particular date and alleged early deployments require further source review.';
      break;
    case 'hist-foursquare-001':
      row.notes = 'A four-square cipher uses two plaintext and two keyed alphabet squares. This historical-themed pair is unverified; its ciphertext does not reproduce under the current museum encoder, although the current decoder yields its plaintext.';
      break;
    case 'hist-homophonic-001':
      row.title = 'Homophonic Substitution — Beale-Inspired Teaching Example';
      row.legacy_historical_year = row.year;
      row.year = 'modern reconstruction';
      row.legacy_source_type = row.source_type;
      row.source_type = 'synthetic';
      row.legacy_source_publication_date = row.source_provenance.publication_date;
      row.source_provenance.publication_date = '1885';
      replaceContextLink(row, 'https://en.wikisource.org/wiki/Beale_Papers',
        'The Beale Papers (1885), pamphlet transcription; Paper No. 2',
        'unresolved_archive_link_replaced_with_text');
      row.notes = 'The 1885 Beale pamphlet explains Paper No. 2 using numbered words from the Declaration of Independence. This homophonic-style example is not a Beale ciphertext and does not replay against the current museum engine.';
      row.historical_context = 'The Beale treasure narrative is attributed to an 1885 pamphlet; its authenticity remains contested. Paper No. 2 uses first letters of numbered Declaration words, not this modern homophonic mapping. Do not attribute this illustrative pair to Thomas Beale.';
      confirmed(row.source_provenance.url, 'Pamphlet transcription identifies the Paper No. 2 method; pair is separate.');
      break;
    case 'hist-railfence-001':
      row.title = 'Rail Fence Cipher — Modern Teaching Example';
      row.legacy_historical_year = row.year;
      row.year = 'modern reconstruction';
      row.legacy_source_type = row.source_type;
      row.source_type = 'synthetic';
      row.legacy_source_publication_date = row.source_provenance.publication_date;
      row.source_provenance.publication_date = null;
      row.notes = 'The rail fence cipher writes letters on zigzag rails and reads each rail in turn. This message is an illustrative phrase; the cited telegraph history has not been matched to a Union Army rail-fence deployment or to this telegram.';
      row.historical_context = 'The example demonstrates a rail-fence transposition. Its Civil War military deployment, three-rail popularity and specific sample phrase need a primary citation before being presented as documented historical facts.';
      break;
    default:
      break;
  }
  return row;
}

function reviseHistory(previous) {
  if (previous.length !== 87) throw new Error('Unexpected v0.8 historical supplement count');
  let unreviewed = 0;
  const rows = previous.map(original => {
    const row = structuredClone(original);
    if (row.supplement_inclusion === 'legacy_unreviewed') {
      unreviewed++;
      if (row.verified !== false || row.benchmark_eligible !== false)
        throw new Error('Supplemental-only pair improperly marked verified: ' + row.id);
      return correctHistory(row);
    }
    row.supplement_release = '0.8';
    return row;
  });
  if (unreviewed !== 45) throw new Error('Unexpected supplemental-only count');
  return { rows, unreviewed };
}

function reviseEval(previous) {
  if (previous.length !== 300) throw new Error('Unexpected v0.8 evaluation count');
  let keyless = 0;
  const rows = previous.map(original => {
    const row = structuredClone(original);
    if (row.prompts.key_recovery.evaluation.target !== 'value=null') return row;
    if (!row.prompts.three_shot.prompt.includes('Key: value=null') ||
        !row.prompts.key_recovery.prompt.includes('Determine the key or settings used.'))
      throw new Error('Unexpected keyless prompt: ' + row.id);
    row.prompts.three_shot.prompt = row.prompts.three_shot.prompt
      .replaceAll('Key: value=null', 'Key: none (fixed teaching convention)');
    row.prompts.key_recovery.prompt = row.prompts.key_recovery.prompt
      .replace('Determine the key or settings used.',
        'State any required settings, or explain why no external key is needed for this fixed teaching convention.')
      .replace(/Key:$/, 'Key/settings:');
    row.prompts.key_recovery.evaluation.target = 'No external key (fixed teaching convention)';
    keyless++;
    return row;
  });
  if (keyless !== 62) throw new Error('Unexpected keyless prompt count: ' + keyless);
  return { rows, keyless };
}


async function main() {
  const historical = fs.readFileSync(path.join(OLD, 'historical.jsonl'), 'utf8')
    .trimEnd().split('\n').map(line => JSON.parse(line));
  const evalRows = fs.readFileSync(path.join(OLD, 'llm-3shot-eval.jsonl'), 'utf8')
    .trimEnd().split('\n').map(line => JSON.parse(line));
  const excluded = new Set(JSON.parse(fs.readFileSync(path.join(OLD, 'v0.7/excluded-records.json'), 'utf8'))
    .records.map(record => record.id));
  const historyIds = new Set(historical.map(record => record.id));
  const wanted = new Set([...historyIds, ...changedIds]);
  const canonical = await readSelected(fs.createReadStream(path.join(OUT, 'all.jsonl.gz'))
    .pipe(zlib.createGunzip()), record => wanted.has(record.id));
  const originalById = await readSelected(fs.createReadStream(path.join(OLD, 'all.jsonl')),
    record => changedIds.includes(record.id));
  const revisedHistory = fixHistorical(historical, canonical, excluded);
  const revisedEval = correctEval(evalRows, canonical, originalById);
  const reviewedHistory = reviseHistory(revisedHistory.records);
  const reviewedEval = reviseEval(revisedEval.records);
  const reviewStates = {};
  for (const row of reviewedHistory.rows.filter(r => r.supplement_inclusion === 'legacy_unreviewed')) {
    const status = row.citation_review.status;
    reviewStates[status] = (reviewStates[status] || 0) + 1;
  }
  const files = {
    'historical-supplement.jsonl': jsonl(reviewedHistory.rows),
    'llm-3shot-eval.jsonl': jsonl(reviewedEval.rows)
  };
  files['supplements-manifest.json'] = JSON.stringify({
    supplement_release: '0.8',
    full_corpus: 'public/corpus/v0.8/all.jsonl.gz',
    historical: {
      file: 'historical-supplement.jsonl',
      source_file: 'public/corpus/historical.jsonl',
      source_count: historical.length,
      excluded_withdrawn: excluded.size,
      records: reviewedHistory.rows.length,
      citation_review_states: reviewStates,
      canonical_v0_8: revisedHistory.inCanonical,
      canonical_historical: revisedHistory.canonicalHistorical,
      canonical_reclassified_synthetic: revisedHistory.canonicalSynthetic,
      legacy_unreviewed: revisedHistory.legacyUnreviewed,
      note: 'Historical links are contextual and do not authenticate an exact plaintext/ciphertext pair. Forty-five supplemental-only examples remain unverified and excluded from benchmarks. Citation review distinguishes checked passages, unavailable full text, unchecked citations and unsupported claims. Linked works rights were not assessed; older source license labels are archived.'
    },
    llm_eval: {
      file: 'llm-3shot-eval.jsonl',
      source_file: 'public/corpus/llm-3shot-eval.jsonl',
      records: reviewedEval.rows.length,
      keyless_prompt_labels_corrected: reviewedEval.keyless,
      two_square_prompts_corrected: revisedEval.corrected,
      note: 'Three Two-square prompts were corrected against v0.8 and 62 no-key prompts now use meaningful labels and targets. The evaluation export is replay-checked against canonical v0.8 pairs and current engines.'
    },
    published_v0_6_files_unchanged: true
  }, null, 2) + '\n';
  files['supplements-SHA256SUMS.txt'] = Object.entries(files)
    .map(([name, content]) => `${sha256(content)}  ${name}`).join('\n') + '\n';
  for (const name of names) write(name, files[name]);
  console.log(`v0.8 supporting downloads ${CHECK ? 'verified' : 'built'}: 87 historical, 300 LLM prompts`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
