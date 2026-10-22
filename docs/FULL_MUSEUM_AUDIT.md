# Cipher Museum accuracy, links and behavior audit

Review: 22 October 2026. Starting revision: `5a680ac2773cc609a5c158770b89a92e15d4fc41`.
This is the follow-up to the earlier [book-guided improvements](BOOK_REVIEW_IMPROVEMENTS.md).
It reviews the whole museum rather than only the reading page. It is not a
certification that every historical interpretation, browser, or cryptographic
parameter has been independently validated.

## Coverage and method

- Inventoried all **207 served HTML pages**, the **169 numbered exhibits**,
  shared JavaScript, tours, glossary, timeline, comparison data, generated cards,
  README and the links in downloadable JSON/JSONL. The numbered roster contains
  149 cipher/history exhibits, 17 mathematical exhibits and 3 protocol exhibits;
  it is not a claim that there are 169 encryption algorithms.
- Reviewed text and implementation together. Historical methods, modern
  illustrative models, authenticated examples, proposed interpretations and
  unverified attributions are now described separately.
- Reviewed all **88 registered engines**, their declared input domains and
  reference/property tests. A roundtrip tests consistency, not historical
  authenticity. See [engine audit and model boundaries](AUDIT_CIPHER_ENGINES.md).
- Exercised **90 shared-demo pages** through default runs, empty and invalid
  inputs, mode switching and clearing. Bespoke exhibits have dedicated suites;
  they are not counted as generic-controller checks.
- Shared navigation, footer, breadcrumb and learning-path scripts were executed
  across 207 pages, resolving 6,095 rendered navigation links. The independent
  static scan includes CSS assets, anchors, JSON data and downloadable citations.
  See [link evidence and remaining uncertainties](LINK_AUDIT.md).
- Used relevant passages from the available eBooks, not a claim of reading every
  supplied volume cover to cover. Historical and current technical claims were
  cross-checked against primary papers, standards, archival institutions and
  documented cipher procedures where available. Unsupported specificity was
  removed or labeled as uncertain rather than supplied with a plausible URL.

The per-page interaction inventory is [AUDIT_INTERACTION_INVENTORY.json](AUDIT_INTERACTION_INVENTORY.json).
Automated tests use JSDOM; they do not establish pixel layout, real
screen-reader behavior, or full WCAG conformance. A local real-browser executable
was unavailable during this run. Those limits are also reflected in the README.

## Main corrections

| Area | What changed | Evidence or check |
| --- | --- | --- |
| Bibliography | Six starting books, correct publisher/title/edition destinations, wrong-book URLs, original-source versus overview labels, and unsupported book attributions | Publisher and library catalog identity checks, not just HTTP status; [link audit](LINK_AUDIT.md) |
| Historical claims | Rosetta has two languages and three scripts; Aeneas’s water-clock device selects preset messages; Cardano’s procedure differs from the modern one-letter-primer widget; Mary Stuart’s decipherment covers about 50,000 **words**, with publication in February 2023 | Polybius, museum collections, Holden §5.3 and the researchers’ paper linked in the exhibits |
| Codebreaking history | Corrected Copiale’s manual/statistical workflow, the separate stages of Lorenz analysis, PURPLE versus Pearl Harbor operational intelligence, Polish/French Enigma cooperation, VENONA decimal arithmetic and pad duplication, Driscoll/Grotjan chronology, KL-7 re-entry, and Navajo language versus code | Original Copiale paper, GCHQ and NSA histories, Smithsonian/National Museum of the American Indian sources |
| Uncertain attribution | Geʽez, RAF and Vietnamese teaching widgets no longer assert an authenticated operational cipher; Wheatstone’s equal-dial widget is clearly a fixed-substitution model; Guevara’s pad system is distinct from the condensed VIC comparison | Source-to-code comparison; [engine model table](AUDIT_CIPHER_ENGINES.md) |
| Unsolved material | Kryptos K4 archival plaintext recovery is distinguished from public cryptanalytic recovery; proposed Somerton identification does not decipher the inscription; Sator interpretations and short-text solutions remain qualified | Researcher/archival sources linked on each exhibit; multiplicity test for Sator |
| Mathematics and modern cryptography | Corrected entropy versus key length, independent/uniform OTP conditions, authentication, IV/nonce requirements, DH assumptions, RSA padding, SHA-256 application claims, reduction direction, finite-field conditions and pairing-model limits | Relevant textbooks, NIST standards, RFCs and independent arithmetic tests |
| Cipher correctness | Hill validation and modular arithmetic; Trifid negative-period hang; empty Autokey primer; unsafe affine integers; long random-pad generation; unbiased bytewise Vernam pads; M-94 row 25; legacy Caesar negative remainder; Stager flat-array route traversal | Independent examples, invalid-input controls, timeout/boundary tests and complete engine suite |
| Two-square | Replaced the nonstandard rectangle transformation with the ACA horizontal rule, including output order and same-row reversal | ACA’s worked example, plus explicit legacy replay of unchanged archived records |
| Standalone widgets | Playfair decrypt no longer inserts plaintext fillers; Sator counts letter multiplicities; Shugborough rejects extra words; the microdot illustration handles Unicode and no longer claims Base64 performs optical reduction | Five regression groups in `tests/test-final-audit.js`, including the Two-square reference example |
| Mathematical interactions | Corrected stale ECDSA analysis after invalid input, Schnorr zero sampling, real-curve inverse points, singular lattice bases, duplicate interpolation coordinates and an LWE guarantee-boundary display | Independent edge cases in protocol and Foundations suites |
| Visitor workflows | Learning-path quizzes mount and retain focus; malformed/blocked progress storage is handled; search retries failed loads and filters before truncating; highlighting preserves text; lightbox focus restores; stale Detective results are cleared; corpus tools transfer ciphertext locally and handle missing clipboard APIs | Fifteen behavioral regression groups, plus a sweep of shared-demo wiring |
| Evaluation honesty | Removed invented expected-accuracy percentages and unsupported solver-success claims; reports now distinguish computed dataset statistics from unmeasured solver performance | Generator and generated reports inspected; no claimed LLM benchmark result is inferred from record counts |
| Shared surfaces | Updated hall cards, timeline descriptions, glossary, tours, trust notes, comparison labels, README index, search index and artifact cards to carry the same qualifications | Metadata regeneration and consistency tests |

## Reading and primary-source trail

Books supplied questions and explanations; a general book reference is not a
claim that its author independently verified this museum implementation.

- Helen Fouché Gaines, *Cryptanalysis* (1939; 1956 reprint): substitution,
  transposition and multiple-anagramming methods; see the earlier review’s
  chapter-specific reading trails.
- Joshua Holden, *The Mathematics of Secrets* (2017), §5.3, pp. 157–159:
  Cardano’s word-level plaintext restart and the distinct Vigenère-style primer.
- Al Sweigart, *Cracking Codes with Python* (2018), especially ch. 17:
  partial substitutions and word-pattern evidence, not proof from a score alone.
- Bernhard Esslinger, *Learning and Experiencing Cryptography with CrypTool and
  SageMath* (2024), ch. 3: preserve transcription evidence before normalization.
- Stephen Budiansky, *Code Warriors* (2016), appendix A, together with the
  [NSA’s *VENONA Story*](https://www.nsa.gov/portals/75/documents/about/cryptologic-heritage/historical-figures-publications/publications/coldwar/venona_story.pdf):
  codebook interpretation and decimal additive cancellation are separate steps.
- Katz and Lindell, revised 3rd edition (2025), Ferguson/Schneier/Kohno (2010),
  and Boneh/Shoup: distinguish confidentiality, authenticity, randomness,
  assumptions and security models. [Boneh and Shoup’s author-hosted text](https://toc.cryptobook.us/)
  gives a publicly accessible treatment.
- [American Cryptogram Association: Two-square](https://www.cryptogram.org/downloads/aca.info/ciphers/TwoSquare.pdf):
  two complete squares and a worked example. The independent regression uses
  its first ten pairs, which do not invoke the museum’s extra filler escaping.
- [Knight, Megyesi and Schaefer, *The Copiale Cipher* (2011)](https://aclanthology.org/W11-1202/):
  original account, instead of the former claim that an HMM directly solved it.
- [GCHQ, the Pyry meeting (21 July 2020)](https://www.gchq.gov.uk/information/the-pyry-forest-meeting):
  the Polish contribution and subsequent cooperation.
- [NSA, Genevieve Grotjan Feinstein](https://www.nsa.gov/Press-Room/Digital-Media-Center/Biographies/Biography-View-Page/Article/1621585/genevieve-grotjan-feinstein/):
  departure from government in 1947, rather than joining the later NSA.
- [NIST SP 800-38A](https://csrc.nist.gov/pubs/sp/800/38/a/final) and
  [SP 800-38D](https://csrc.nist.gov/pubs/sp/800/38/d/final):
  mode-specific IV requirements and GCM uniqueness, rather than one universal
  “random IV” rule.

## Archived data and remaining limits

Published corpus bytes were not rewritten. The live browser offers explicitly
labeled related sources where appropriate; record downloads preserve their
original fields. [Corpus errata](CORPUS-V06-ERRATA.md) records wrong Gutenberg
destinations, broken source links and the old Two-square convention. The same
source and algorithm limitations can exist in the prepared v0.7 descendant;
a stricter schema does not establish historical authenticity.

The current Two-square engine accepts `legacy:` before the comma-separated
keywords solely to reproduce the old museum transformation. This mode must not
be presented as the ACA procedure. The museum’s reversible filler escaping
also remains an explicitly disclosed teaching convention.

Seeded machine simulations and invented codebooks remain educational models.
This audit does not replace them with full historical implementations. Some
external sites block automated access or return temporary errors; those links
are recorded as inconclusive, not silently claimed verified. No book text,
private Drive identifier or copyrighted book file is included in this change.

## Integrated verification

- **PASS:** all 51 suites in `npm test`, Node 22.23.4.
- **PASS:** all 88 engine specifications (713 property/edge subtests), with
  every engine measured by the scaling guard. The guard’s deliberately
  quadratic control was rejected; corrupted-engine controls were caught.
- **PASS:** corpus replay: 99,800 exact matches, 526 explicitly known
  limitations, zero unexpected failures. Archived corpus files have no diff.
- **PASS:** 90 shared-demo pages, 15 visitor-workflow regression groups, five
  final-audit regression groups, 153 Foundations interaction assertions and
  504 exhibit-example assertions. These are simulated-DOM checks, subject to
  the browser/visual limitations described above.
- **PASS:** HTMLHint across 207 pages; no errors. Static link audit resolved
  10,811 local references with no missing target or anchor. See the separate
  link report for 416 external destinations and unresolved access restrictions.
- **PASS:** generated metadata, minified assets and service-worker version
  freshness; all 152 artifact-card entries retained their fields.
- **PASS:** `git diff --check`.

The first integrated run exposed a Stager allocation/scaling problem and
outdated prose/link-policy assertions. Stager now traverses a flat array; the
original performance threshold is unchanged. Assertions were updated to
preserve the corrected qualifications, and the Foundations wing now permits
an exact list of reviewed primary-source citations while retaining its
internal-navigation requirements. The complete integrated rerun passed.

Defect regressions included negative or before/after controls. A successful
roundtrip alone was not accepted as proof of a historical algorithm. All
published corpus bytes remain unchanged; the explicit legacy replay adapter
is documented above.
