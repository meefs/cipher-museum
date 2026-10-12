'use strict';

/**
 * corpus-text-metrics.js — the single definition of the Cipher Corpus length
 * fields, shared by the v0.7 generator, the validator, the benchmark report and
 * the LLM export so that one name cannot mean two quantities again.
 *
 * Why this file exists (CM-008). In v0.6 and earlier, `text_length` equalled a
 * raw plaintext length in 17,211 records and a raw ciphertext length in 97,495,
 * and `normalized_text_length` equalled an A-Z/0-9 plaintext count in 75,628 and
 * a ciphertext count in 86,400. Averaging either field therefore averaged more
 * than one quantity. Both fields are now defined only in terms of `plaintext`.
 *
 * ## Contract (corpus v0.7)
 *
 * Both fields are derived from the record's `plaintext` and from nothing else.
 * The ciphertext never contributes: a cipher that expands or contracts its
 * output (Polybius digits, Navajo word substitution, a null-cipher carrier)
 * must not change the measured length of the message that was encrypted.
 *
 * `text_length`
 *   Unicode code points in the stored plaintext after NFC normalization,
 *   counting every character as written — letters, digits, marks, spaces and
 *   punctuation all included.
 *
 * `normalized_text_length`
 *   Cipher-relevant symbols in the plaintext: NFD normalize, drop combining
 *   marks (\p{M}), then count the code points in Unicode general categories
 *   L (letter) and N (number). Spaces, punctuation and symbols are excluded.
 *   "Attaqué à l'aube" therefore measures 13, not 16.
 *
 * ## Fixed decisions
 *
 * - **Counting unit is the Unicode code point**, obtained by iterating the
 *   string, never `String.prototype.length` (a UTF-16 unit count, which counts
 *   an astral character twice).
 * - **Normalization order is normalize-then-filter**, never the reverse:
 *   filtering first would strip the base letter of a decomposed accent.
 * - **`text_length` uses NFC and `normalized_text_length` uses NFD** on
 *   purpose. NFC gives a stable canonical count of the text as written; NFD
 *   plus mark removal makes an accented letter count once whether the source
 *   stored it composed or decomposed.
 * - **Cipher-specific preparation is out of scope.** Playfair's J→I folding,
 *   double-Playfair's J→II expansion, digraph padding and Hill block padding
 *   change what an engine consumes, not what the message was; they never alter
 *   these fields.
 * - **`text_length >= normalized_text_length` always**, since the second counts
 *   a subset of the categories the first counts. The validator enforces it.
 */

/** Count Unicode code points, not UTF-16 code units. */
function codePointCount(value) {
  let count = 0;
  for (const _character of String(value ?? '')) count += 1;
  return count;
}

/** Every character as written, NFC-normalized. */
function textLength(plaintext) {
  return codePointCount(String(plaintext ?? '').normalize('NFC'));
}

/** Letters and digits only: NFD, drop combining marks, keep \p{L} and \p{N}. */
function normalizedTextLength(plaintext) {
  const folded = String(plaintext ?? '').normalize('NFD').replace(/\p{M}/gu, '');
  let count = 0;
  for (const character of folded) {
    if (/[\p{L}\p{N}]/u.test(character)) count += 1;
  }
  return count;
}

/** Both fields for a record, as the generator and validator compute them. */
function metricsFor(record) {
  const plaintext = record && record.plaintext;
  return {
    text_length: textLength(plaintext),
    normalized_text_length: normalizedTextLength(plaintext)
  };
}

/**
 * Explain how a record's stored fields differ from the contract.
 * Returns [] when the record already satisfies it.
 */
function metricsDrift(record) {
  const expected = metricsFor(record);
  const drift = [];
  for (const field of ['text_length', 'normalized_text_length']) {
    if (record[field] !== expected[field]) {
      drift.push(`${field} is ${record[field]}, contract requires ${expected[field]}`);
    }
  }
  return drift;
}

const CONTRACT_VERSION = '0.7';

module.exports = {
  CONTRACT_VERSION,
  codePointCount,
  textLength,
  normalizedTextLength,
  metricsFor,
  metricsDrift
};
