/* ================================================================
   THE CIPHER MUSEUM — Detective Scoring v1.5

   window.DetectiveScoring.rank(stats) → { suspects, caseNotes,
                                            nextAttack, realityLabels }

   Takes the stats object produced by DetectiveAnalyses.run() and
   returns a ranked list of cipher-family suspects with confidence
   labels, evidence lists, case-notes narrative, and a single
   recommended next-attack.

   Pure: no DOM access. Depends only on DetectiveAnalyses being
   loaded first (uses DetectiveAnalyses._periodIoC).
   ================================================================ */
'use strict';

(function (global) {

  /* ─── Family registry ────────────────────────────────────────── */
  var FAMILIES = [
    { id: 'caesar',        name: 'Caesar / ROT Cipher',                   url: 'ciphers/caesar.html',      era: 'classical' },
    { id: 'simple-sub',    name: 'Monoalphabetic Substitution',            url: null,                       era: 'classical' },
    { id: 'vigenere',      name: 'Vigenère / Polyalphabetic',              url: 'ciphers/vigenere.html',    era: 'classical' },
    { id: 'transposition', name: 'Transposition (Columnar / Rail-Fence)',  url: 'ciphers/columnar.html',    era: 'classical' },
    { id: 'playfair',      name: 'Playfair Digraphic Cipher',              url: 'ciphers/playfair.html',    era: 'classical' },
    { id: 'adfgvx',        name: 'ADFGVX Fractionated (WWI German)',       url: 'ciphers/adfgvx.html',      era: 'classical' },
    { id: 'morse',         name: 'Morse Code',                             url: 'ciphers/morse.html',       era: 'classical' },
    { id: 'numeric',       name: 'Book Cipher / Numeric Code',             url: 'ciphers/book-cipher.html', era: 'classical' },
    { id: 'otp',           name: 'One-Time Pad / Random / Modern',         url: 'ciphers/one-time-pad.html',         era: 'modern'   },
    { id: 'bifid',         name: 'Bifid / Polybius Fractionated',          url: 'ciphers/bifid.html',       era: 'classical' }
  ];

  /* ─── Score one family against the analysis stats ────────────── */
  function scoreFamily(family, stats) {
    var n       = stats.n;
    var ioc     = stats.ioc;
    var chi0    = stats.chi0;
    var bsr     = stats.bestShiftResult;
    var kasiski = stats.kasiski;
    var charset = stats.charset;
    var dg      = stats.dg;
    var letters = stats.letters;
    var score   = 0;
    var forEv = [], againstEv = [];

    /* Grab periodIoC from analyses module — loaded before scoring. */
    var periodIoC = global.DetectiveAnalyses ? global.DetectiveAnalyses._periodIoC
                                              : function () { return 0; };

    switch (family) {

      case 'caesar':
        if (ioc >= 0.060) {
          score += 3; forEv.push('IoC ' + ioc.toFixed(4) + ' is near a common English benchmark; compatible with a single-alphabet cipher');
        } else if (ioc >= 0.054) {
          score += 1; forEv.push('IoC ' + ioc.toFixed(4) + ' is somewhat elevated');
        } else {
          againstEv.push('IoC ' + ioc.toFixed(4) + ' is below the English benchmark; this does not exclude a single-alphabet cipher');
        }
        if (bsr.chi < 40) {
          score += 6; forEv.push('Shift ' + bsr.shift + ' gives chi-square ' + bsr.chi.toFixed(1) + ' — very strong match to English letter frequencies');
        } else if (bsr.chi < 80) {
          score += 4; forEv.push('Shift ' + bsr.shift + ' gives chi-square ' + bsr.chi.toFixed(1) + ' — good English match');
        } else if (bsr.chi < 150) {
          score += 1; forEv.push('Shift ' + bsr.shift + ' gives chi-square ' + bsr.chi.toFixed(1) + ' — passable English match');
        } else {
          againstEv.push('Best-shift chi-square ' + bsr.chi.toFixed(1) + ' — no single shift gives English-like distribution');
        }
        if (chi0 > 100 && bsr.chi < 100) {
          score += 1; forEv.push('Unshifted chi-square ' + chi0.toFixed(1) + ' is consistent with a fixed offset');
        }
        if (charset === 'alpha') { score += 1; forEv.push('Letters-only ciphertext — consistent with a letter cipher'); }
        if (ioc < 0.050) { score -= 3; }
        break;

      case 'simple-sub':
        if (ioc >= 0.060) {
          score += 3; forEv.push('IoC ' + ioc.toFixed(4) + ' is compatible with an English-language single-alphabet hypothesis');
        } else {
          againstEv.push('IoC ' + ioc.toFixed(4) + ' — below a common English benchmark, but not an exclusion');
        }
        /* If no single shift explains the frequencies, the alphabet is scrambled. */
        if (bsr.chi >= 120) {
          score += 3; forEv.push('Chi-square remains high (' + bsr.chi.toFixed(1) + ') at every shift — no tested shift fits the English model well');
        } else if (bsr.chi >= 60) {
          score += 1;
        } else {
          againstEv.push('A single shift accounts for the frequency pattern — more consistent with Caesar');
        }
        if (dg.district >= 22) {
          score += 2; forEv.push(dg.district + ' distinct letters — rich usage typical of full-alphabet keyword substitution');
        } else if (dg.district >= 18) {
          score += 1; forEv.push(dg.district + ' distinct letters observed');
        }
        if (charset === 'alpha') { score += 1; forEv.push('Letters-only ciphertext'); }
        if (ioc < 0.050) { score -= 3; againstEv.push('Low IoC weakens this English-language heuristic; monoalphabetic substitution remains possible'); }
        break;

      case 'vigenere':
        if (ioc >= 0.040 && ioc <= 0.062) {
          score += 3; forEv.push('IoC ' + ioc.toFixed(4) + ' lies between random (0.038) and English (0.067) — compatible with some polyalphabetic samples, not a diagnostic interval');
        } else if (ioc > 0.062) {
          againstEv.push('IoC ' + ioc.toFixed(4) + ' is above this heuristic range; polyalphabetic encryption can also produce high IoC');
        } else {
          againstEv.push('IoC ' + ioc.toFixed(4) + ' is low; key length cannot be determined from this alone');
        }
        if (kasiski.length > 0) {
          var topK = kasiski[0];
          var pioc = periodIoC(letters, topK.period);
          if (pioc > 0.060) {
            score += 5; forEv.push('Kasiski test suggests period ' + topK.period + '; sliced-IoC ' + pioc.toFixed(4) + ' ≈ English — strongest Vigenère signature');
          } else if (pioc > 0.052) {
            score += 3; forEv.push('Kasiski period ' + topK.period + '; sliced-IoC ' + pioc.toFixed(4) + ' partially elevated');
          } else if (pioc > 0.044) {
            score += 1; forEv.push('Repeated trigrams point to period ' + topK.period + ' (period IoC moderate)');
          }
        }
        if (charset === 'alpha') { score += 1; forEv.push('Letters-only ciphertext'); }
        if (ioc > 0.066) { score -= 3; }
        if (charset !== 'alpha') { score -= 1; }
        break;

      case 'transposition':
        if (ioc >= 0.060) {
          score += 3; forEv.push('IoC ' + ioc.toFixed(4) + ' at English level — transposition preserves letter frequencies exactly');
        } else {
          againstEv.push('IoC ' + ioc.toFixed(4) + ' — below a common English benchmark. Transposition preserves the input’s IoC, whatever its value');
        }
        if (chi0 < 50) {
          score += 5; forEv.push('Chi-square ' + chi0.toFixed(1) + ' — close fit to this English frequency model; it does not establish the transformation');
        } else if (chi0 < 100) {
          score += 3; forEv.push('Chi-square ' + chi0.toFixed(1) + ' — close to English frequencies, compatible with rearrangement');
        } else if (chi0 < 160) {
          score += 1; forEv.push('Chi-square ' + chi0.toFixed(1) + ' — moderately English-like');
        } else {
          againstEv.push('Chi-square ' + chi0.toFixed(1) + ' — substitution seems to have altered the frequencies');
        }
        if (charset === 'alpha') { score += 1; forEv.push('Letters only'); }
        if (bsr.chi < chi0 - 50) {
          againstEv.push('Shifting reduces chi-square — substitution likely occurred alongside any rearrangement');
        }
        if (ioc < 0.055) { score -= 3; againstEv.push('Low IoC under this English heuristic; pure transposition still preserves that exact input value'); }
        break;

      case 'playfair':
        if (dg.isEvenLen) {
          score += 2; forEv.push('Even letter count — Playfair always outputs an even number of letters');
        } else {
          score -= 2; againstEv.push('Odd letter count — Playfair output is always even-length');
        }
        if (dg.adjDupPairs === 0 && n >= 20) {
          score += 4; forEv.push('No duplicate letters in any consecutive digraph — the structural Playfair constraint');
        } else if (dg.adjDupPairs > 0) {
          score -= 3; againstEv.push(dg.adjDupPairs + ' digraph pair(s) with duplicate letters — Playfair never produces these');
        }
        if (dg.district === 25) {
          score += 3; forEv.push('Exactly 25 distinct letters — Playfair merges I and J into a 25-letter alphabet');
        } else if (dg.district >= 23) {
          score += 1; forEv.push(dg.district + ' distinct letters — near the 25-letter Playfair alphabet');
        }
        if (ioc >= 0.046 && ioc <= 0.065) {
          score += 2; forEv.push('IoC ' + ioc.toFixed(4) + ' — slightly flattened, typical for digraphic substitution');
        }
        if (n < 20) { score -= 1; againstEv.push('Sample too short for reliable Playfair identification'); }
        break;

      case 'adfgvx':
        if (charset === 'adfgvx') {
          score += 9; forEv.push('Every letter is A, D, F, G, V, or X — the ADFGVX fractionation alphabet (German WWI, June 1918)');
        } else if (charset === 'adfgx') {
          score += 7; forEv.push('Every letter is A, D, F, G, or X — ADFGX variant (German WWI, March–May 1918)');
        } else {
          againstEv.push('Ciphertext contains letters outside the ADFGVX set');
          score -= 3;
        }
        break;

      case 'morse':
        if (charset === 'morse') {
          score += 10; forEv.push('Text contains only dots (·), dashes (−), and spaces — standard Morse code structure');
        } else if (/[\.\-]{2,}/.test(stats.raw)) {
          score += 3; forEv.push('Dots and dashes present — possible Morse or Fractionated Morse');
        } else {
          score -= 5; againstEv.push('No dot/dash pattern — not standard Morse code');
        }
        break;

      case 'numeric':
        if (charset === 'numeric') {
          score += 8; forEv.push('Ciphertext is predominantly digits — book cipher, codebook, or numeric substitution');
        } else {
          var numTokens = (stats.raw.match(/\b\d+\b/g) || []).length;
          var allTokens = (stats.raw.match(/\S+/g) || []).length;
          var numRatio = numTokens / (allTokens || 1);
          if (numRatio > 0.60) { score += 5; forEv.push(Math.round(numRatio * 100) + '% of tokens are numbers'); }
          else if (numRatio > 0.30) { score += 2; forEv.push(Math.round(numRatio * 100) + '% of tokens are numbers'); }
          else { score -= 4; againstEv.push('Insufficient numeric tokens for a book or numeric cipher'); }
        }
        break;

      case 'otp':
        if (ioc >= 0.034 && ioc <= 0.044) {
          score += 5; forEv.push('IoC ' + ioc.toFixed(4) + ' ≈ 0.038, the uniform A–Z expectation. This statistic alone cannot establish randomness or identify a cipher');
        } else if (ioc > 0.044 && ioc <= 0.054) {
          score += 2; forEv.push('IoC ' + ioc.toFixed(4) + ' approaching random — could be a very long key');
        } else if (ioc > 0.060) {
          score -= 3; againstEv.push('IoC ' + ioc.toFixed(4) + ' — OTP/random output should approach ~0.038');
        }
        if (chi0 > 280) { score += 2; forEv.push('Very high chi-square (' + chi0.toFixed(1) + ') — no usable alphabetical ordering'); }
        if (kasiski.length === 0 || kasiski[0].count <= 2) {
          score += 1; forEv.push('No significant repeated trigrams — consistent with a unique key');
        } else {
          againstEv.push('Repeated trigrams found; random output, including a genuine OTP, can contain repetitions by chance');
        }
        if (charset === 'alpha' && dg.district >= 24) {
          score += 1; forEv.push('Many distinct letters appear; this alone does not establish randomness');
        }
        break;

      case 'bifid':
        if (ioc >= 0.044 && ioc <= 0.062) {
          score += 2; forEv.push('IoC ' + ioc.toFixed(4) + ' — fractionated ciphers partially flatten letter frequencies');
        }
        if (dg.district === 25) {
          score += 2; forEv.push('Exactly 25 distinct letters — Polybius square merges I and J (Bifid family)');
        } else if (dg.district >= 23 && dg.district <= 25) {
          score += 1; forEv.push(dg.district + ' distinct letters — close to the 25-letter Polybius constraint');
        }
        if (charset === 'alpha') { score += 1; forEv.push('Letters only'); }
        if (n >= 40) { score += 1; forEv.push(n + ' characters available for these heuristic comparisons; no detection guarantee'); }
        if (ioc > 0.065) { score -= 1; againstEv.push('IoC above this heuristic range; fractionated ciphers are not excluded'); }
        break;
    }

    return { score: Math.max(score, 0), forEv: forEv, againstEv: againstEv };
  }

  /* ─── Confidence label from score ────────────────────────────── */
  function scoreToLabel(score, maxScore, tooShort) {
    var pct = maxScore > 0 ? (score / maxScore) : 0;
    if (tooShort) {
      // Cap confidence for short inputs: even a strong score can't be trusted,
      // so the ceiling is 'Possible' regardless of how high pct climbs.
      if (pct >= 0.20) return 'Possible';
      if (pct >= 0.05) return 'Unlikely';
      return 'Inconclusive';
    }
    if (pct >= 0.85) return 'Strongest fit';
    if (pct >= 0.55) return 'Similar fit';
    if (pct >= 0.25) return 'Possible';
    if (pct >= 0.08) return 'Unlikely';
    return 'Inconclusive';
  }

  function labelClass(label) {
    return ({
      'Strongest fit': 'conf-very-likely',
      'Similar fit':  'conf-likely',
      'Possible':     'conf-possible',
      'Unlikely':     'conf-unlikely',
      'Inconclusive': 'conf-inconclusive'
    })[label] || 'conf-inconclusive';
  }

  /* ─── Case Notes narrative ────────────────────────────────────── */
  function buildCaseNotes(stats, topSuspect) {
    var sentences = [];
    var ioc  = stats.ioc;
    var chi0 = stats.chi0;
    var bsr  = stats.bestShiftResult;

    /* IoC reading */
    if (ioc >= 0.065) {
      sentences.push('The Index of Coincidence is ' + ioc.toFixed(4) + ', close to the English benchmark of ~0.067. The letter distribution looks like natural English — consistent with a cipher that substitutes or rearranges whole letters without mixing alphabets.');
    } else if (ioc >= 0.050) {
      sentences.push('The Index of Coincidence is ' + ioc.toFixed(4) + ' — between the English benchmark (~0.067) and the random baseline (~0.038). Some polyalphabetic samples fall here, but plaintext statistics, key and sample length affect the result.');
    } else if (ioc >= 0.036) {
      sentences.push('The Index of Coincidence is ' + ioc.toFixed(4) + ', approaching the random baseline of ~0.038. This value alone does not identify a long key, an OTP or modern encryption, or establish a uniform distribution.');
    } else {
      sentences.push('The Index of Coincidence is ' + ioc.toFixed(4) + ', below the uniform A–Z expectation, which is not a minimum for finite samples. Sample composition and length matter.');
    }

    /* Chi-square / best shift reading */
    if (chi0 < 50) {
      sentences.push('The letters already follow English proportions closely (unshifted chi-square: ' + chi0.toFixed(1) + '). The cipher likely rearranged rather than substituted letters — compare against a transposition family.');
    } else if (bsr.chi < 80 && bsr.shift > 0) {
      sentences.push('Shifting the ciphertext by ' + bsr.shift + ' position' + (bsr.shift === 1 ? '' : 's') + ' gives a chi-square of ' + bsr.chi.toFixed(1) + ' — a strong match to English. A single fixed offset likely maps the cipher alphabet onto plain text.');
    } else if (bsr.chi < 150) {
      sentences.push('Shift ' + bsr.shift + ' produces chi-square ' + bsr.chi.toFixed(1) + ' — a partial English match, but not definitive. Multiple alphabets or a scrambled keyword may be in play.');
    } else {
      sentences.push('No single shift brings the frequencies close to English (best chi-square: ' + bsr.chi.toFixed(1) + ' at shift ' + bsr.shift + '). The alphabet is likely scrambled rather than simply shifted, or multiple alphabets are at work.');
    }

    /* Kasiski hint */
    if (stats.kasiski.length > 0 && stats.periodHint) {
      sentences.push('Kasiski examination found repeated trigrams whose spacing GCDs suggest a key period around ' + stats.periodHint + '. Period-sliced IoC is another heuristic clue, not confirmation of a particular cipher or key length.');
    }

    /* Top suspect */
    if (topSuspect && topSuspect.score > 0) {
      sentences.push('Weighing all the evidence, the strongest match is ' + topSuspect.name + '.');
    } else {
      sentences.push('The evidence is mixed. A longer sample would sharpen the picture considerably.');
    }

    return sentences.join(' ');
  }

  /* ─── Recommended Next Attack ────────────────────────────────── */
  var ATTACK_MAP = {
    'caesar': {
      text: 'The evidence strongly suggests a Caesar or ROT cipher. There are only 25 possible shifts — try brute-forcing them on the Cryptanalysis page, scoring each candidate against English letter frequencies.',
      link: 'cryptanalysis.html', linkText: 'Frequency Analysis on Cryptanalysis →'
    },
    'simple-sub': {
      text: 'Try frequency analysis: map the most frequent ciphertext letters to E, T, A, O, I, N, and look for recognisable English patterns. The Cryptanalysis page has an interactive frequency-analysis tool.',
      link: 'cryptanalysis.html', linkText: 'Frequency Analysis →'
    },
    'vigenere': {
      text: 'The evidence suggests a polyalphabetic cipher. Use Kasiski examination and the Friedman test on the Cryptanalysis page to estimate the key length, then recover individual key letters by single-alphabet frequency analysis on each period slice.',
      link: 'cryptanalysis.html', linkText: 'Kasiski Examination →'
    },
    'transposition': {
      text: 'Letter frequencies match English but the order is scrambled. Try anagram-solving on short recognisable fragments first, then open the seeded columnar search to compare candidate widths and keys.',
      link: 'ciphers/columnar.html#advanced-search', linkText: 'Columnar search →'
    },
    'playfair': {
      text: 'The digraph evidence points to Playfair. Decryption requires recovering the 5×5 key square — typically via digraph frequency analysis and known-plaintext attack. Read the Playfair exhibit for the method.',
      link: 'ciphers/playfair.html', linkText: 'Playfair Cipher →'
    },
    'adfgvx': {
      text: 'The character set is compatible with ADFGX or ADFGVX, but does not prove either identification. This is a two-stage cipher: Polybius-square substitution followed by columnar transposition. Read the exhibit for the historical decryption approach.',
      link: 'ciphers/adfgvx.html', linkText: 'ADFGVX Cipher →'
    },
    'morse': {
      text: 'This looks like Morse code. Dots and dashes separated by spaces represent individual letters; slashes (/) separate words. Any standard Morse decoder will convert it.',
      link: 'ciphers/morse.html', linkText: 'Morse Code →'
    },
    'numeric': {
      text: 'This may be a book cipher or codebook. Identify the reference document indicated, then map each numeric code to its corresponding word or letter on that page.',
      link: 'ciphers/book-cipher.html', linkText: 'Book Cipher →'
    },
    'otp': {
      text: 'These letter-based statistics do not identify a modern cipher or prove secrecy. A long repeating key is not automatically an OTP. Establish the source, representation, key handling and available evidence before choosing an attack.',
      link: null, linkText: null
    },
    'bifid': {
      text: 'The fractionated-cipher signature suggests Bifid or a Polybius-family cipher. Decryption requires recovering the 5×5 key square and the period. The Bifid exhibit introduces the attack approach.',
      link: 'ciphers/bifid.html', linkText: 'Bifid Cipher →'
    },
    'inconclusive': {
      text: 'The evidence is mixed. Try a longer sample, consider whether the original plaintext might not be English, or run several attacks on the Cryptanalysis page and compare the results.',
      link: 'cryptanalysis.html', linkText: 'Cryptanalysis Techniques →'
    }
  };

  function buildNextAttack(topSuspect) {
    if (!topSuspect || topSuspect.score === 0) return ATTACK_MAP['inconclusive'];
    return ATTACK_MAP[topSuspect.id] || ATTACK_MAP['inconclusive'];
  }

  /* ─── Reality Labels ─────────────────────────────────────────── */
  function buildRealityLabels(stats, suspects) {
    var labels = [];
    var top = suspects && suspects[0];
    var n   = stats ? stats.n : 0;

    labels.push({ key: 'edu',   text: 'Educational demo',           title: 'This tool is for learning cryptanalysis. Results are heuristic rankings, not calibrated probabilities or definitive identifications.' });
    labels.push({ key: 'prob',  text: 'Relative heuristic fit', title: 'Labels compare hand-scored candidates; they are not measured probabilities and cannot guarantee identification.' });

    if (top && top.era === 'classical') {
      labels.push({ key: 'class', text: 'Classical cipher',   title: 'The top suspect is a classical (pre-modern) cipher family.' });
    }
    if (!top || top.id !== 'otp') {
      labels.push({ key: 'nomod', text: 'Classical model suggested', title: 'Classical ciphers are not computationally secure. Do not use them to protect sensitive data.' });
    }
    if (n < 200) {
      labels.push({ key: 'short', text: 'More text improves reliability', title: 'Samples under 200 characters give statistical tests less signal. A longer representative sample may help; it cannot guarantee identification.' });
    }
    return labels;
  }

  /* ─── Main entry point ────────────────────────────────────────── */
  function rank(stats) {
    if (!stats) {
      return {
        suspects:      [],
        caseNotes:     '',
        nextAttack:    ATTACK_MAP['inconclusive'],
        realityLabels: []
      };
    }

    var results = FAMILIES.map(function (f) {
      var s = scoreFamily(f.id, stats);
      return { id: f.id, name: f.name, url: f.url, era: f.era,
               score: s.score, forEv: s.forEv, againstEv: s.againstEv };
    });

    results.sort(function (a, b) { return b.score - a.score; });

    var maxScore = Math.max(results[0].score, 1);

    /* Top 3–5 suspects with positive scores (always at least 1). */
    var suspects = results.filter(function (r) { return r.score > 0; }).slice(0, 5);
    if (suspects.length === 0) suspects = [results[0]];

    suspects.forEach(function (r) {
      r.confidenceLabel = scoreToLabel(r.score, maxScore, stats.tooShort);
      r.confidenceClass = labelClass(r.confidenceLabel);
    });

    return {
      suspects:      suspects,
      caseNotes:     buildCaseNotes(stats, suspects[0]),
      nextAttack:    buildNextAttack(suspects[0]),
      realityLabels: buildRealityLabels(stats, suspects)
    };
  }

  /* ─── Export ─────────────────────────────────────────────────── */
  global.DetectiveScoring = {
    rank: rank,
    _scoreToLabel:       scoreToLabel,
    _buildNextAttack:    buildNextAttack,
    _buildRealityLabels: buildRealityLabels
  };

})(typeof window !== 'undefined' ? window : global);
