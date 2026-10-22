/**
 * Equidistant Letter Sequence (ELS) Search
 * ----------------------------------------
 * The pattern-finding method behind the "Bible code" claims of
 * Witztum-Rips-Rosenberg (1994) and the popular book by Drosnin (1997).
 * Given a body of text and a target word, ELS slides a "skip" of size
 * d across the text and asks: starting at position p, do every d-th
 * letter spell the target?
 *
 *     skip d=5, start p=0:  T____X____Y____Z   →  reads "TXYZ"
 *
 * Under an independent-letter model, the expected number of hits is
 * the number of legal placements times the product of letter frequencies.
 * Searching more placements creates more opportunities for coincidences.
 * This classroom search illustrates that effect; it does not reproduce
 * the full WRR experiment, the McKay et al. critique, or a significance
 * test comparing natural-language texts with random controls.
 *
 * Public API
 * ----------
 *   normalise(text)                     → letters-only uppercase string
 *   findELS(text, target, opts)         → array of {start, skip, end}
 *                                         opts: { minSkip=2, maxSkip=1000,
 *                                                 maxResults=100 }
 *   expectedHits(textLen, target)       → analytic estimate using English
 *                                         letter frequencies; explains why
 *                                         long texts trivially produce hits
 *
 *   This is purely a search; no claim is made about the meaningfulness
 *   of any hit.
 */
(function (root) {
  'use strict';

  // Fixed rounded English letter-frequency heuristic. This is not a
  // frequency estimate measured from the visitor's selected text.
  const FREQ = {
    A:0.0817, B:0.0150, C:0.0278, D:0.0425, E:0.1270, F:0.0223,
    G:0.0202, H:0.0609, I:0.0697, J:0.0015, K:0.0077, L:0.0403,
    M:0.0241, N:0.0675, O:0.0751, P:0.0193, Q:0.0010, R:0.0599,
    S:0.0633, T:0.0906, U:0.0276, V:0.0098, W:0.0236, X:0.0015,
    Y:0.0197, Z:0.0007,
  };

  /** Strip everything except letters; return uppercase. */
  function normalise(text) {
    if (!text) return '';
    return String(text).toUpperCase().replace(/[^A-Z]/g, '');
  }

  function options(opts) {
    const o = opts || {};
    const positiveInteger = (value, fallback, name) => {
      const number = value === undefined ? fallback : Number(value);
      if (!Number.isSafeInteger(number) || number < 1) throw new Error(name + ' must be a positive safe integer.');
      return number;
    };
    const minSkip = positiveInteger(o.minSkip, 2, 'Minimum skip');
    return {
      minSkip,
      maxSkip: Math.max(minSkip, positiveInteger(o.maxSkip, 1000, 'Maximum skip')),
      maxResults: positiveInteger(o.maxResults, 100, 'Result limit')
    };
  }

  /**
   * Find every position where the target appears as an equidistant
   * letter sequence in text (after normalisation).
   *
   * For each skip d in [minSkip, maxSkip], slide start p across the
   * text and check whether text[p], text[p+d], text[p+2d], ... spells
   * the target.
   *
   * Negative skips are not searched separately; they are equivalent to
   * positive skips read in reverse, which the caller can do by
   * reversing the input text.
   *
   * Returns at most maxResults hits, in scan order. Each hit is
   * { start, skip, end } where end = start + skip*(target.length-1).
   */
  function findELS(text, target, opts) {
    const { minSkip, maxSkip, maxResults } = options(opts);

    const txt = normalise(text);
    const tgt = normalise(target);
    if (!txt.length || !tgt.length) return [];

    const N = txt.length;
    const L = tgt.length;
    const hits = [];

    const lastSkip = L > 1 ? Math.min(maxSkip, Math.floor((N - 1) / (L - 1))) : maxSkip;
    for (let d = minSkip; d <= lastSkip && hits.length < maxResults; d++) {
      const span = d * (L - 1);
      const lastStart = N - span - 1;
      if (lastStart < 0) continue;
      // Only positions where text[p] === tgt[0] are candidates;
      // this is a 26x speed-up vs blind scanning.
      for (let p = 0; p <= lastStart; p++) {
        if (txt.charCodeAt(p) !== tgt.charCodeAt(0)) continue;
        let ok = true;
        for (let k = 1; k < L; k++) {
          if (txt.charCodeAt(p + k * d) !== tgt.charCodeAt(k)) { ok = false; break; }
        }
        if (ok) {
          hits.push({ start: p, skip: d, end: p + span });
          if (hits.length >= maxResults) break;
        }
      }
    }
    return hits;
  }

  /**
   * Analytic estimate of expected ELS hits for a target word in a
   * random text of given length, summed over skips [minSkip, maxSkip].
   *
   * For each (start, skip), the probability of a hit is the product of
   * English letter frequencies of the target. The number of (start, skip)
   * pairs is the sum of max(0, textLen - skip*(targetLength-1)).
   * Multiplying gives the expectation under this independent-letter model;
   * real prose need not follow that model. Overlapping placements do not
   * invalidate the sum of their individual expectations.
   *
   * This is the single most important number on the page: it is why
   * "the Bible predicts" any short word.
   */
  function expectedHits(textLen, target, opts) {
    const { minSkip, maxSkip } = options(opts);
    if (!Number.isSafeInteger(textLen) || textLen < 0) throw new Error('Text length must be a nonnegative safe integer.');
    const tgt = normalise(target);
    if (!tgt.length || textLen <= 0) return 0;
    let p = 1;
    for (let i = 0; i < tgt.length; i++) {
      p *= (FREQ[tgt[i]] || 0.0001);
    }
    // Count only starts whose final character is inside the text. Summing
    // this arithmetic progression is exact even for very short passages.
    const strideCount = tgt.length - 1;
    const lastSkip = strideCount ? Math.min(maxSkip, Math.floor((textLen - 1) / strideCount)) : maxSkip;
    if (lastSkip < minSkip) return 0;
    const count = lastSkip - minSkip + 1;
    const pairs = count * textLen - strideCount * count * (minSkip + lastSkip) / 2;
    return p * pairs;
  }

  const api = {
    normalise: normalise,
    findELS: findELS,
    expectedHits: expectedHits,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.ELS = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
