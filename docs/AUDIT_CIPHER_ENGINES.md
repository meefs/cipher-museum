# Cipher engines and attack demonstrations: correctness review

Review date: 22 October 2026. Starting revision: `5a680ac2773cc609a5c158770b89a92e15d4fc41`.
This report describes the source and tests reviewed in this working-tree audit;
it does not certify every historical machine or every possible input.

## Scope and evidence

The review covers all 88 exports of `js/ciphers/all-engines.js`, the remaining
readable files in `js/ciphers/`, and `js/historical-ciphers.js`,
`js/historical-demos.js`, `js/manual-cipher-demos.js`, `js/pad-experiments.js`, and
`js/multiple-anagramming.js`. The registry runner requires exactly one spec for
each export, so a missing or misnamed spec fails the run.

The existing verification layers are useful but answer different questions:

| Evidence | What it checks | What it cannot establish |
| --- | --- | --- |
| Published or independently derived answers | Selected arithmetic, table entries, routes, and complete worked examples | That every supported configuration matches a historical machine |
| Property tests and boundary examples | Reversibility on each declared normalized domain, isolation, empty input, Unicode policy, large input | Historical authenticity; matching encode/decode errors can cancel |
| Pinned vectors | Stability of a specified model | Independent correctness of that model |
| Corpus replay | Agreement or explicitly categorized disagreement with stored records | That synthetic records are independently sourced historical evidence |
| DOM interaction tests | Displayed states, buttons, errors and the output of the wired-up engine | Pixel layout, real assistive-technology behavior or all browser implementations |
| Timing and mutation canaries | Excessive scaling and selected corruptions are detected by the harness | A proof of asymptotic complexity or complete mutation coverage |

The existing fixed-answer registry has 70 published, derived or procedure-based
checks and 18 pinned checks. Some derived answers are deliberately small; a
single-letter lookup must not be described as full historical validation.
`ENGINE_AUDIT.md` and `ENGINE_INVENTORY.md` document an earlier sweep, not the
absence of defects found by this later review. In particular, old claims that
invalid affine multipliers are silently repaired no longer describe the code.

## Verified defects corrected

Each row below has a regression that failed against the pre-fix source and
passed against the corrected source. Existing ordinary-input examples remain
part of the checks.

| Area | Defect | Correction and independent check |
| --- | --- | --- |
| Hill matrix | Fractional, excess, empty and unsafe entries were accepted; large safe integers were multiplied before reduction; odd ciphertext lost its last letter | Require exactly four safe integers, reduce modulo 26 before multiplication, and reject incomplete ciphertext pairs. A large-entry matrix congruent to `[[3,3],[2,5]]` must give `HELP → HIAT`, and malformed matrices must fail in both directions. |
| Trifid period | A negative period could make the block loop run forever; partial numeric strings and fractions were accepted | Require a positive safe integer. VM timeout-backed tests reject negative, zero, fractional, infinite, unsafe and partially numeric periods; period one preserves the independently expected coordinate identity. |
| Autokey empty primer | Whitespace or punctuation normalized to an empty primer, corrupting decryption | Apply the existing `KEY` fallback after normalization. Independently computed `ATTACKATDAWN + KEYATTACKATD → KXRAVDAVNAPQ` covers blank, space, punctuation and digit-only keys. |
| Affine integers | Unsafe numeric strings silently rounded before modular arithmetic | Reject entries outside JavaScript's safe-integer range instead of encrypting with a different key. Both directions reject the same cases. |
| Automatic alphabetic pads | A sufficiently long request exceeded Web Crypto's per-call random-byte limit | Fill bytes in chunks of at most 65,536 and retain rejection sampling for unbiased A–Z letters. A 40,000-letter all-A message encrypts exactly to its generated mod-26 pad. |
| Automatic Vernam pad | Random A–Z characters were used as bytewise-XOR key bytes; the bytes were not uniformly distributed over 0–255 | Generate raw random bytes and expose their exact value as `[Key: hex:…]`. A stub supplying `00 ff 80 7f` must produce `HHHH → 48b7c837`; 70,000-byte generation/decryption also checks chunking. Supplied text and hex keys retain their existing interpretation. |
| M-94 model row | Offset 25 was clamped to 24 because disk count was used where alphabet length was required | Allow all 25 nonidentity rows of a 26-letter disk. Independently of disk wiring, row `+25` must equal row `−1`; row 24 must differ. |
| Legacy Caesar file | Decryption with shift 27 used JavaScript's negative remainder and emitted backticks instead of Z/z | Normalize the signed shift modulo 26. Shifts `1, 27, 53, −25, −51` all independently map `Az az! ↔ Ba ba!`. This file is still loaded by the Caesar page, although the shared demo uses the registry engine. |
| ELS expectation | The estimate counted impossible placements and could give positive expectation when the target did not fit | Count only `N − d(L−1)` positive-length placements. For `N=10, L=3, d=2…4`, the independent count is `6+4+2=12`; impossible targets give zero. Search bounds/options are validated. |
| Lorenz crib display | A positive English score was asserted to be the recovered matching plaintext | Label it a conditional candidate and state that the score does not confirm the crib. A rendered counterexample uses identical ciphertexts: their zero XOR makes any guessed crib reproduce itself, even when its truth is unknown. |

The Vernam generated-key extraction in `tests/test-demo-pages.js` now accepts
the `hex:` prefix as well as alphabetic OTP annotations. The exposed pad is an
educational convenience, not a secure way to transmit a secret key.

## Canonical scope of the 18 pinned models

These descriptions come from the actual implementations, not from the titles
of the exhibits. They are suitable limits for captions and trust metadata.
All rows refer to the corresponding named block in `all-engines.js`.

| Export | What the implemented model does | Boundary that must remain visible |
| --- | --- | --- |
| `lorenz` | ITA2 letter conversion and XOR with chi/psi streams from 12 keyword-seeded wheels, including a motor-stepping model | Synthetic pins/settings; not a reconstruction of intercepted traffic or an independently validated complete SZ machine |
| `purple` | Sixes/twenties partition with seeded substitution tables and a counter-based stepping schedule | No claim that the generated wiring or schedule reproduces an operational PURPLE machine |
| `vic` | Checkerboard, chain addition and two transpositions, deriving settings from one keyword | Omits the complete historical phrase/date/personal-number and disrupted-transposition key procedure |
| `sigaba` | Selects among 64 seeded substitution alphabets using a repeating 4,096-entry pseudo-random schedule | Does not implement the historical five cipher, five control and five index rotor banks |
| `typex` | Five seeded 26-letter rotors and reflector; three have synthetic movement and two stay fixed | No authentic rotor wirings/notch rings. Movement is every character, every five, and every 35 characters, not the formerly claimed 5/7/11-notch rule |
| `fialka` | Ten seeded 26-letter rotors, a reflector, and four synthetically moving positions | Not a 30-character Fialka wiring, punched-card permutation or complete historical stepping mechanism |
| `kl7` | Eight seeded 26-letter rotors with synthetic notches and an added reciprocal reflector | The reflector is a teaching convenience, not evidence that the historical KL-7 had that signal path or was reciprocal |
| `geheimschreiber` | Ten seeded wheels choose a mod-26 additive value and one of six alphabet permutations | Not the T52's five-bit teleprinter XOR/permutation, historical wheel wiring or variant-specific stepping |
| `kryha` | A seeded mixed alphabet advanced by a repeating 26-entry step table | Illustrates irregular disk movement; does not reproduce an original keyed Kryha mechanism |
| `m94` | Twenty-five seeded mixed alphabets with a selected cyclic row offset | Disk alphabets are generated, not original M-94 disks or M-138 strip sets |
| `redTypeA` | Separately cycles seeded vowel and consonant substitution tables | Illustrates the partition weakness; does not reproduce an original RED machine |
| `slidex` | Seeded 26×26 bigram substitution card with reversible filler handling | Does not reproduce a historical vocabulary card and cursor procedure |
| `copiale` | Seeded letter/digit homophones and null tokens | Not the recovered manuscript's original glyph mapping; pinned stability is not evidence of historical decryption |
| `argenti` | Seeded numeric homophones plus a small null mechanism | An illustration of homophony, not a transcribed archival Argenti key |
| `greatCipher` | Invented syllable/single-letter codebook with nulls and a delete token | Not the Rossignol numeric codebook or a reproduction of a specific historical message |
| `babington` | Invented bracketed symbols, small nomenclator, nulls and a doubling convention | Not Mary's original cipher alphabet, original symbol shapes or an authenticated intercepted message |
| `geezMonastic` | A seeded permutation of Latin A–Z | Does not implement a Ge'ez syllabary or establish any particular historical monastic cipher |
| `trifid` | Keyworded 27-cell cube and standard coordinate fractionation in explicit periods | Unlike the synthetic machines above, the mathematical construction is directly derivable. The existing period-five fixed vector is only pinned; the new period-one independent property does not validate every cube/period configuration |

The count of 18 is a **test-provenance category**, not a list of every simplified
exhibit. Other engines also use illustrative codebooks or restricted APIs.
For example, JN-25 and Chinese Telegraph use invented Latin-letter groups;
Navajo has a vocabulary subset; the simplified registry Enigma accepts fewer
settings than the full Enigma exhibit; the Beale/Arnold–André/book demonstrations
cannot prove the historical documents or editions they discuss.

## Additional reviewed constructions and boundaries

| Module or family | Evidence reviewed | Limit or disposition |
| --- | --- | --- |
| Caesar, Atbash, ROT13, affine, Vigenère, Beaufort, Gronsfeld, Porta, Trithemius, autokey families | Formula checks, fixed vectors, declared-domain properties, invalid-key behavior | Models use explicit Latin alphabets and normalization policies |
| Polybius, Bacon, Tap Code, Pigpen, checkerboards, Bifid/Trifid, ADFGX/ADFGVX, Nihilist, Fractionated Morse | Displayed tables, square/cube coordinate logic and route/inverse logic | J/I merging, word-boundary loss and alphabet variants are part of declared domains; the museum's Bacon variant merges I/J while retaining U/V |
| Playfair, Hill, Four-Square, Two-Square, Scytale, Stager, Solitaire, Slidex | Fixed examples, reversible framing and properties | Some use a museum `X/Q/Z → ZA/ZB/ZC` escape convention to preserve original filler letters. That framing is not an original historical convention |
| Rail fence, columnar/double transposition, grille and route families | Independent order examples, ragged rows and inverse logic | A stated route/normalization is required; roundtrip alone does not identify a historical variant |
| Full Enigma (`enigma.js`, `enigma-flagship.js`) | Existing full reference tests, including extended stepping/double step, separate from registry's simplified interface | Tested reference settings are stronger evidence than seeded machine examples; not certification of every configuration/input |
| M-209 | TM 11-380-style independent bar-displacement arithmetic with explicit pin/lug fixture | Keyword-derived synthetic settings are not historical daily keys |
| NEMA (`historical-ciphers.js`) | Independent published rmsk2/Sullivan reference vector, trace and setting validation | Particular documented model/configuration, not every NEMA variant |
| Turning grille and Myszkowski (`historical-ciphers.js`, `historical-demos.js`) | Exact hole-orbit coverage, hand-derived repeated-rank route, invalid keys, rendered controls | Turning grille's X padding is explicitly retained; malformed/overlapping hole selections fail |
| RS44, Double Playfair, AMSCO (`all-engines.js`, `manual-cipher-demos.js`) | Source-backed independent answers, setup constraints, staged animation, encrypt/decrypt controls | Illustrated settings/boards rather than all operational historical key material |
| `pad-experiments.js` | Decimal no-carry addition, reused-pad cancellation, invented-codebook boundary, mod-26 tamper properties and rendered controls | Reused-pad cancellation is not immediate complete plaintext recovery; encryption without authentication allows controlled modifications |
| `multiple-anagramming.js` | Four independent fixtures, all 120 five-column orders, manual controls, shared-key condition | Scoring ranks hypotheses on synthetic examples, not proof that a real message is solved |
| `lorenz-depth.js`, `lorenz-page.js` | XOR cancellation, known-crib offsets, wrong-crib counterexample and rendered qualification | Invented text and repeating byte stream, not a Lorenz machine simulation; an English score is not a probability or proof |
| `els.js` | Planted hits, exact placement count, capped output and independent-letter expectation | Illustration of search opportunity, not reproduction of the WRR experiment or a significance test of prose versus controls |
| `caesar-break.js` | Existing known-shift and ranked-candidate tests; inspected scoring interface | Frequency scoring is a heuristic, particularly for short/non-English samples; UI review coordinated with the applied-interface audit |
| `cipher-engines.js` | Legacy standalone Vigenère, rail-fence and columnar source inspected | No current HTML loads it. It is not the registry used by present demos; its padded columnar convention is not interchangeable with the current ragged registry convention |

Two existing model boundaries were intentionally not rewritten during this
audit:

- **Wheatstone:** both dials in the current model have 26 positions and advance
  equally. The position difference stays zero, so the output is a fixed keyword
  substitution, not a demonstration of the historical unequal-dial device's
  polyalphabetic behavior. Source comments were corrected and the content owner
  was informed to label the exhibit honestly.
- **Running key and DIANA:** short supplied keys cycle in the existing engine.
  The arithmetic examples remain useful, but repeated keys do not have one-time
  pad security. Running-key wrap behavior was retained by explicit coordination
  with the main audit; the UI/content owners handle visible disclosure.

## Verification record

- Final `node tests/engines/run.js` passed: 713 engine subtests,
  scaling and mutation canaries, legacy integration, 250 deep checks, full
  Enigma references and corpus replay.
- Corpus replay accounted for all 100,326 records: 99,800 exact passes and 526
  records in existing explicit known-deviation categories, with zero unexplained
  failures. The 1,051 known-deviation mismatch **events** are not 1,051 additional
  records.
- The M-94 and legacy Caesar regressions are included in that final full run
  and also passed their 19-subtest targeted run.
- `node tests/test-historical-exhibits.js`,
  `node tests/test-manual-cipher-exhibits.js`,
  `node tests/test-pad-experiments.js` and
  `node tests/test-multiple-anagramming.js` all passed.
- `node tests/test-els.js`: 16 checks passed after the finite-text fix.
- `node tests/test-lorenz-depth.js`: 14 checks passed, including the new rendered
  wrong-crib counterexample.

The main audit is responsible for rebuilding minified assets, checking all
content changes together and running the repository-wide `npm test`. Those
integration results are not inferred from this engine-only review.

## Integration follow-up: Two-square

The final shared-content review exposed a further algorithm error: the old
“horizontal” implementation exchanged columns within each square instead of
using the opposite corners of the horizontal rectangle. It now follows the
[ACA procedure](https://www.cryptogram.org/downloads/aca.info/ciphers/TwoSquare.pdf),
including right-square output first and same-row reversal. Its published
`ANOTHERDIGRAPHICSETU → IRRTEHMKGIMEQGRUNMMZ` example is independently
checked in `tests/test-final-audit.js`. This test failed before the correction.

The `legacy:` key prefix preserves the old nonstandard mapping for immutable
corpus replay only. Replay adapters select it explicitly; old records and
checksums are untouched. The widget still discloses its extra reversible
filler escaping, which is not part of the ACA historical procedure.
