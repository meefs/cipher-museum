# Ebook recommendations: implementation progress

**21 of 21 implemented and locally verified: five corrections and 16 teaching enhancements.** Existing Crypto Lab demonstrations are linked, not recreated. The implementation adds short explanations and original worked examples; it extends the existing Museum Caesar lesson and reuses the existing columnar solver for a small classroom worksheet.

See the [original evidence and recommendations](EBOOK_REVIEW_RECOMMENDATIONS.md) and [machine-readable implementation record](../docs/ebook-followup/implementation.json). Book credits retain full titles and verified locators without ebook download/viewer links. This is bounded implementation evidence, not certification of every Museum claim.

| ID | Delivered change | Status | Verification |
|---|---|---|---|
| EBR-01 | [Correct Auto-Solve language labels](https://ciphermuseum.com/cipher-detective.html) | Implemented; locally verified | Actual model/renderer regression; four-letter example; fixed baseline scores; mobile result and keyboard table checks. |
| EBR-02 | [Qualify workbench IC conclusions](https://ciphermuseum.com/lab/workbench.html) | Implemented; locally verified | Live repeated-alphabet IC 0.0381, permutation and small-input controls; exact cyclic-source enumeration. |
| EBR-03 | [Correct the Lorenz signal path](https://ciphermuseum.com/ciphers/lorenz.html#lorenz-signal-path) | Implemented; locally verified | Primary facsimile passage and visible flow checked; retained Lorenz regression tests. |
| EBR-04 | [Qualify Lorenz wheel-setting reuse](https://ciphermuseum.com/ciphers/lorenz.html#lorenz-feedback) | Implemented; locally verified | Reuse algebra and historical configuration boundary reviewed; existing depth experiment tests pass. |
| EBR-05 | [Separate Tutte’s inference from Turingery](https://ciphermuseum.com/ciphers/bill-tutte.html#tunny-three-tasks) | Implemented; locally verified | Three-task chronology cross-checked against report/book passages; narrow table accessible by scrolling. |
| EBR-06 | [Explain AES wide-trail diffusion](https://ciphermuseum.com/ciphers/aes.html#wide-trail) | Implemented; locally verified | All 69 nonempty MixColumns minors and ShiftRows dispersion independently checked; trail/proof boundaries reviewed. |
| EBR-07 | [Show DES S-box differential filtering](https://ciphermuseum.com/ciphers/des.html#s1-differential) | Implemented; locally verified | Independent full S1 DDT enumeration and two-observation intersection {17,23}; exposed-component boundary retained. |
| EBR-08 | [Separate DES attack resource measures](https://ciphermuseum.com/lab/modern-attack-evidence.html#des-differential) | Implemented; locally verified | Displayed exponents, phase labels, structure arithmetic and probabilistic/access caveats checked. |
| EBR-09 | [Show all 26 Caesar scores](https://ciphermuseum.com/cryptanalysis.html) | Implemented; locally verified | Independent score table; actual run/edit/restore/empty-input controls; escaped input; desktop/mobile checks. |
| EBR-10 | [Make columnar comparisons repeatable](https://ciphermuseum.com/teaching.html#columnar-classroom) | Implemented; locally verified | Independent fixture preparation; exact replay excluding timing; budget/failure denominators; distinct key/plaintext recovery. |
| EBR-11 | [Compare entropy with first-guess success](https://ciphermuseum.com/hall-of-foundations/entropy.html#first-guess) | Implemented; locally verified | Exact small-distribution enumeration and endpoints; large preset independently calculated. |
| EBR-12 | [Explain privacy amplification and its limits](https://ciphermuseum.com/hall-of-foundations/entropy.html#privacy-amplification) | Implemented; locally verified | Every displayed row checked; conditional parity independence and failing control enumerated. |
| EBR-13 | [Separate authenticity from freshness](https://ciphermuseum.com/modern.html#replay-freshness) | Implemented; locally verified | Independent real HMAC and receiver-state calculation for every row; ordered-delivery limits explicit. |
| EBR-14 | [Demonstrate ambiguous hash inputs](https://ciphermuseum.com/ciphers/sha256.html#structured-hashing) | Implemented; locally verified | Exact bytes/digests, empty/separator/non-ASCII inputs and malformed decoding checked; no false collision claim. |
| EBR-15 | [Explain purpose-separated HKDF outputs](https://ciphermuseum.com/ciphers/diffie-hellman.html#key-derivation) | Implemented; locally verified | PRK/output recomputed independently using HMAC and Node/OpenSSL HKDF; all bytes visible on mobile. |
| EBR-16 | [Explain why ML-DSA aborts](https://ciphermuseum.com/hall-of-foundations/random-oracle.html#why-abort) | Implemented; locally verified | All small mask/shift outcomes and rejected-edge control enumerated; no standard signer or security proof claimed. |
| EBR-17 | [Explain KEM reencryption and implicit rejection](https://ciphermuseum.com/hall-of-foundations/learning-with-errors.html#from-pke-to-kem) | Implemented; locally verified | Conceptual text compared with verified source algorithms; existing toy remains explicitly nonstandard. |
| EBR-18 | [Connect noisy equations to a q-ary lattice](https://ciphermuseum.com/hall-of-foundations/closest-vector.html#lwe-lattice) | Implemented; locally verified | Lattice membership, determinant, minimum distance, unique recovery, tie and representative-change checks. |
| EBR-19 | [Show Colossus clock, condition and count](https://ciphermuseum.com/ciphers/colossus.html#clock-condition-count) | Implemented; locally verified | Hand-countable XOR/count table and strict threshold boundary; historical tape-rate units kept distinct. |
| EBR-20 | [Explain implementation leakage conditions](https://ciphermuseum.com/lab/modern-attack-evidence.html#power-leakage) | Implemented; locally verified | Model/physical-evidence boundary reviewed; existing planned measured-trace work not duplicated. |
| EBR-21 | [Connect masking to joint leakage](https://ciphermuseum.com/ciphers/aes.html#masking) | Implemented; locally verified | All 65,536 byte/mask pairs checked, including full marginal histograms and covariance identity. |

## Release evidence

- 67 suites are registered, including four new focused suites. The initial full run passed 66 and correctly rejected an outdated cache version after the final mobile CSS change. Rebuilding and rerunning the cache and affected suites resolved it. GitHub CI independently reruns the release gates.
- All 214 public HTML pages passed lint. The existing solver-evaluation replay changed only its language-model file hash; scores and recovery results stayed identical.
- [Desktop/mobile evidence](../docs/ebook-followup/browser.json): 19 changed pages × 2 widths, plus 8 actual control checks, with no recorded script errors or document overflow. Selected screenshots were visually reviewed; resulting table/result clipping was fixed and checked again.
- All 14 newly added Crypto Lab destinations returned HTTP 200: [link evidence](../docs/ebook-followup/lab-link-check.json). Availability is not a new audit of those labs.
- Source register expanded from 148 to 160 entries: 12 new works and an extended Lasry entry supply the 13 follow-up sources. The changed-page evidence records source and browser scope separately.
- The 214-page independent export is regenerated from the implementation source commit, including the classroom worksheet, fixtures and Node.js runner. Its manifest and ZIP checksums are verified separately.
- Commit, CI and deployment evidence are recorded in the GitHub history and Actions run. A local pass alone does not establish live deployment.

## Delivery decisions

The user explicitly requested links to existing Crypto Lab demonstrations. Proposed new widgets for wide-trail analysis, DDTs, power leakage, masking, rejection sampling and KEM behavior were therefore delivered as concise Museum explanations/worked examples with those links. No new signer, KEM, AES, differential-attack or power-analysis engine was added.

The 13 books/reports were read in the selected passages listed in the recommendations. Printed, reflowed and author-recompilation pagination remain distinguished; neither external ebook files nor their download links are published.
