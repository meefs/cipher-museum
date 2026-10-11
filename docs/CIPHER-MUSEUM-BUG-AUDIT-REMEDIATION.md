# Cipher Museum bug-audit remediation

**Audit baseline:** `652ca8188e47ce09115db17f2e9c01621bb3610b` on `main`  
**Remediation date:** 2026-10-11  
**Source audit:** [CIPHER-MUSEUM-BUG-AUDIT.md](CIPHER-MUSEUM-BUG-AUDIT.md)

This change set addresses all 15 findings from the evidence-based audit. It
does not rewrite the already-published, immutable Cipher Corpus v0.6 archive.
Where a finding concerns archived record bytes, the repair is an explicit
erratum, machine-readable review data, safer live-site wording, and stricter
validation for new records. Canonical record corrections require a later
versioned dataset release.

## Finding disposition

| ID | Disposition | Repair and regression evidence |
|---|---|---|
| CM-001 | Fixed | The M-209 engine now represents six pin wheels, six starts, and 27 two-lug bars, counts each displaced bar once, and applies the machine's reversed-alphabet equation `C = 25 - P + D (mod 26)`. Explicit settings and deterministic teaching seeds are supported. Tests independently check all 27 bars and the TM 11-380 example arithmetic in which A with displacement 20 enciphers as T. The old one-seed transform remains reachable only through an internal `legacy:` replay adapter so published v0.6 records continue to reproduce. |
| CM-002 | Mitigated; archived bytes immutable | The corpus page and README no longer call the 54 historical-context exercises verified-provenance pairs. `data/corpus-historical-review.json` inventories all 54, identifies five known incomplete/mismatched pairs and eleven declared reconstructions, and defines the legacy meaning of `verified`. `CORPUS-V06-ERRATA.md` records the limitation. Tests require complete review coverage and prevent the false website claim from returning. |
| CM-003 | Fixed by precise scope disclosure | Fialka and KL-7 are now labelled prominently as inspired seeded 26-letter models, not authentic machine simulations. The exhibit, demo, and workbench disclosures enumerate the omitted alphabets/wiring, stepping, key-card or re-entry mechanisms so the model can no longer be mistaken for the mechanism described in the historical text. |
| CM-004 | Fixed | Pages deployment is now a job in the CI workflow, depends on both the full test job and corpus validation, checks out the exact validated SHA with LFS, and verifies corpus download hashes before upload. The former independent racing deployment workflow was removed. |
| CM-005 | Fixed | Caesar and Alberti retain a supplied zero, Enigma accepts exactly three displayed rotor-position letters, the workbench supplies `AAA`, and Affine rejects malformed or non-invertible keys instead of silently changing them. Switching workbench ciphers now installs that cipher's documented default. Invalid-key and boundary tests cover the behavior. |
| CM-006 | Fixed | Finite-field and Wadsworth controllers retain one interval handle and cancel it on Reset, Step, a replacement run, and relevant input changes. A registered regression test verifies the cancellation path remains wired. |
| CM-007 | Fixed | The benchmark runner accepts explicit `--split public`, `--split blind`, or `--split all`, defaults to public, records the selected split in results and receipts, and filters the real `split` field. Mixed-split fixtures test output IDs and denominators. Documentation consistently describes `blind` as a public, downloadable evaluation label—not confidential held-out data. |
| CM-008 | Mitigated; archived bytes immutable | Live benchmark statistics now recompute a consistent Unicode letter/number count from plaintext rather than aggregate ambiguous legacy fields. The v0.6 errata documents that the archived length fields were produced under mixed conventions. New versioned fields can be introduced only in a future corpus release. |
| CM-009 | Fixed | Search applies NFKD accent folding and Unicode tokenization to both query and index text, retains useful partial matching, and synchronizes query/filter state with the URL and browser history. Tests cover `vigenere`/`Vigenère`, partial matching, and URL-era behavior. |
| CM-010 | Fixed | Incorrect Civil War/WWI and other era presentation classes were corrected. Controlled `wwi` and `wwii` matches now require exact era tokens, so WWI no longer matches WWII. Search-index assets were regenerated and tested. |
| CM-011 | Fixed | VIC, Stager, Culper Ring, Arnold–André, and Che Guevara are classified as historical rather than cryptographically broken. Their notes preserve whether the event was capture, defection, obsolescence, or no known cryptanalytic break. Generated badges, halls, cards, comparison data, and search assets agree; semantic tests reject the original contradictions. |
| CM-012 | Fixed | The five definite 404 targets were replaced with current author, DBLP, Stockholm University, Cryptiana, and US National Archives pages. Unavailable/blocked URLs were not misreported as false claims. |
| CM-013 | Fixed | Engine source and audit/inventory documentation now report 88 engines, 167 exhibits, the 100,326-record v0.6 corpus, and the four new engine rows. M-209 documentation identifies its external manual check and legacy corpus-replay boundary. |
| CM-014 | Mitigated; archived bytes immutable | The live validator now rejects duplicate IDs, empty required strings, empty/non-object keys, and negative/non-integer lengths. It rejects duplicate tags in newly generated v0.6 records while accepting the 484 immutable pre-v0.6 legacy duplicates. Negative mutation tests prove the added semantic layer runs. The errata documents the legacy duplicates. |
| CM-015 | Fixed | Direct and transitive dependency patches were locked. `npm audit` and `npm audit --omit=dev` report zero vulnerabilities. |

## Additional performance repair

The unchanged engine complexity gate detected an AMSCO garbage-collection spike
during final validation. Bulk encode/decode now uses typed layout arrays instead
of allocating an object for every one- or two-letter cell; the detailed trace
path remains available for teaching views. All 88 engines pass the existing 10×
ratio bound for a 4× input, and the AMSCO exhaustive/ragged-layout tests remain
unchanged.

## Corpus integrity boundary

No canonical JSONL record, ID, split, answer, or key was changed. Corpus replay
remains at 99,800 exact records, 526 known-deviation records, 1,051 known
mismatch events, and zero unexplained failures. The published v0.6 checksums
continue to verify. Errata and review metadata are additive repository files and
are not represented as modifications to the Zenodo deposit.

## Validation

Validation is performed with the repository's Node.js 22 runtime and includes:

- clean dependency installation and zero-advisory audit;
- the full registered test suite, 88-engine property/known-answer/scaling suite,
  mutation canaries, corpus replay, browser-structure, accessibility, search,
  trust-label, example-vector, service-worker, and foundation checks;
- corpus schema/semantic validation of all 100,326 records;
- HTML lint, release metadata validation, corpus SHA-256 verification, and Git
  LFS object verification;
- generated metadata/minified-bundle/service-worker freshness and a clean
  regeneration-diff check for the immutable corpus.
