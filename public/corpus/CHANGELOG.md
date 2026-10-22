# Cipher Corpus Changelog

## v0.7 (unreleased — tagged `corpus-v0.7`, no DOI issued)
- Resolves the four v0.6 findings that could only be carried as errata, since each needed record bytes to change and the v0.6 archive is immutable. Derived from v0.6 by `scripts/build-corpus-v07.js`; v0.6 keeps its bytes, checksums and DOI.
- **100,313 canonical records** (from 100,326): 13 withdrawn, 84,002 changed. Every per-record difference is itemised in `v0.7/change-inventory.json`.
- **Historical records withheld pending source review.** 13 records stored 20+ all-distinct ciphertext letters or a contiguous alphabet run, and no synthetic v0.6 record showed the pattern. Eight had not been catalogued by an earlier review. Under independent uniform A-Z draws, P(26 distinct) is about 6.6e-11, but other cipher and message models can yield distinct letters; the pattern does not prove fabrication. These records are withheld instead of re-encrypted, because generating a replacement with a seeded teaching engine would produce a synthetic exercise under a historical title. IDs are retired, not reused; evidence is in `v0.7/excluded-records.json`.
- **Exclusion wording corrected 22 October 2026.** The original tagged v0.7 snapshot described that statistical pattern as proof of fabricated ciphertext. The main-branch exclusion explanation and checksum manifest now state its limited inference; the tagged snapshot and canonical v0.7 records remain unchanged.
- **Kryptos K1 corrected.** v0.6 stored 32 of the 63 ciphertext characters and named the alphabet keyword as the Vigenère key. v0.7 stores the full section with keyword `PALIMPSEST`, verified by decrypting to the stored plaintext and against the CIA's published panel text.
- **Explicit classification.** Every record carries `authenticity`, `pair_status`, `verification_method` and `benchmark_eligible`. 99,801 records are verified known-answer pairs; the other 512 are not, and must not be scored as such. Authenticity and pair status are independent: a teaching reconstruction can be a reproducible pair, and an authentic artifact often is not.
- **One length contract.** `text_length` and `normalized_text_length` are computed from the plaintext alone, by Unicode code point, normalizing before filtering (`scripts/corpus-text-metrics.js`). 83,918 records corrected.
- **Unique tags everywhere**, whatever generator batch a record came from. The tolerance for the 484 repeated tags now belongs to the v0.6 dataset contract rather than to a record label.
- **Split labels described accurately.** Both `public` and `blind` ship in the download; neither is secret or withheld.
- `dataset_version` is now the release for every record, with the former per-batch label preserved as `source_batch` — the old field never ordered releases (`2.0` was batches 2 and 3, older than `0.6`).
- Canonical languages drop from 9 to 7: the only Japanese and Russian records were among those withdrawn. Both remain in the non-canonical `historical-expanded.jsonl` supplement.

## v0.6 (2026-10-11)
- Append 300 synthetic exercises: 100 each for RS44, German Double Playfair, and AMSCO. Total: 100,326 records, 85 cipher types mapping to 84 museum engines.
- Preserve the complete 100,026-record v0.5 prefix byte for byte, including IDs, answers, and public/blind assignments; its hash and source commit are recorded in `stats.json`.
- Store explicit structured keys and conventions: RS44 synthetic stencils with 60–200-letter strict bodies, Double Playfair J→II and retained odd filler, AMSCO alternating cells with explicit first-cell size.
- Replay: 99,800 exact matches; the same 526 known-deviation records and 1,051 mismatch events; no widened exceptions.
- Regenerate JSON/JSONL/CSV downloads, difficulty subsets, browser samples, engine manifest, checksums and 300 public-split evaluation prompts. CSV now includes JSON keys, notes and scoring conventions.
- Canonical set: 9 languages and 54 records labeled historical. Separate historical file: 100 records, with 45 IDs outside canonical; Arabic supplement: 1,710 records outside canonical. Their merge is deferred, superseding the earlier v0.6 plan.
- Existing public and blind labels are preserved. Both labels remain downloadable; “blind” is a split designation, not secret held-out data.

## v0.5 (2026-07-17)
- **Engine-verified regeneration.** The 2026 engine verification sweep corrected real defects in the museum's cipher engines (Vernam is now true bytewise XOR with hex ciphertext, Lorenz is a 12-wheel ITA2 XOR model, VIC applies checkerboard + chain addition + double transposition, Purple preserves the sixes/twenties partition, and nine engines use reversible X/Q/Z filler escaping). 7,708 records whose ciphertexts were produced by the old engines were regenerated with the corrected engines (`scripts/regenerate-corpus-v05.js`); touched records carry a regeneration note and `dataset_version: 0.5`.
- **Key metadata repaired on 1,292 records** so every record is reproducible from its own metadata: running-key records now store the actual key text instead of the label "Declaration of Independence (opening)"; solitaire records store the explicit CRYPTONOMICON passphrase; one-time-pad/Vernam "(repeating)" stubs are materialized to full-length explicit pads.
- **Historical data corrections:** `hist-caesar-augustus-001` (stored ciphertext was not a uniform shift-1 encoding), `hist-playfair-wheatstone-001` (key metadata said PLAYFAIR; the stored canonical vector uses PLAYFAIR EXAMPLE), `hist-solitaire-cryptonomicon-001` (ciphertext is Schneier's unkeyed sample output 1; key metadata wrongly claimed the CRYPTONOMICON passphrase).
- **Verification status:** 99,500 of 100,026 records now reproduce exactly with the live engines (`npm run test:engines` replays the full dataset with pinned accounting and 0 unexplained failures). The remaining 526 records are the intentionally noisy transcription variants plus historical records whose real keys or codebooks the pedagogical engines cannot represent — each class carries an explicit rationale in `tests/engines/corpus-replay.js`.
- **Metadata reconciled:** `corpus/engine-manifest.json` per-engine record counts and header total now match the canonical `all.jsonl` exactly (100,026); subset-file counts in this README corrected; the unshipped `llm-3shot-eval.jsonl` reference removed.
- Derived exports `all.json` and `all.csv` regenerated from the canonical `all.jsonl`; subset files (`beginner`/`intermediate`/`advanced`/`expert`/`historical`/`multilingual` and expansions) updated in place for touched record ids.
- **Release packaging:** `SHA256SUMS.txt` added for download verification; `CITATION.cff` updated to v0.5; superseded v0.2 expansion/template files moved to `archive/`; `llm-3shot-eval.jsonl` (300 deterministic prompts from the public split, via `scripts/generate-llm-eval.js`) now actually ships.
- **Known gap, planned for v0.6:** 1,710 Arabic records in `multilingual.jsonl` and 46 v0.4 additions in `historical.jsonl` are not yet merged into canonical `all.jsonl` and are therefore outside the pinned engine replay.
- **Diana provenance fix (same day):** research against NSA's declassified Boak lectures and Special Forces sources established the authentic DIANA rule `C = (25 - P - K) mod 26`; the engine's former Beaufort arithmetic was corrected and the 1,680 synthetic `diana` records were regenerated to match.

## v0.4 (2026-04-27)
- **historical.jsonl expanded to 101 records** (up from 55) — 46 new entries spanning 4,000 years of cryptographic history, from the Atbash cipher in the Hebrew Bible (c. 600 BCE) through WWII cipher machines and Vietnam-era tap code.
  - New cipher types covered: atbash, scytale, aeneas_tacticus, affine, autokey, bacon, bazeries, beaufort, bifid, cardano, foursquare, fractionated_morse, geez_monastic, gronsfeld, hill, homophonic, kama_sutra, kryha, monoalphabetic, morse, nihilist, nomenclator, otp, pigpen, porta, rail_fence, red_type_a, rot13, running_key, slidex, straddling_checkerboard, tap_code, trifid, trithemius, twosquare, typex (38 new cipher types in historical coverage, total 78 types covered).
- **multilingual.jsonl expanded to 5,348 records** (up from 3,638) — added Arabic (ar) with 1,710 records using Buckwalter Latin transliteration, bringing the corpus to 10 languages.
- **New analysis tools** added to `scripts/`:
  - `hill-climbing-solver.js` — monoalphabetic cipher solver using quadgram scoring + hill climbing (95% accuracy on 80+ char ciphertexts, 25 restarts)
  - `sa-solver.js` — simulated annealing variant with hill-climbing polish; better on short ciphertexts
  - `build-quadgrams.js` — regenerates English quadgram statistics from corpus plaintext
  - `data/english-quadgrams.json` — 8,877 quadgram log-probability entries from 896K corpus observations

## v0.3 (2026-04-27)
- **100,026 verified records** across 82 cipher types and 84 cipher engines — ~5× scale-up from v0.2.1.
- Difficulty distribution: 15,533 beginner · 26,969 intermediate · 26,381 advanced · 26,966 expert · 3,638 multilingual · 484 noisy · 55 historical.
- All core records pass automated roundtrip verification.

## v0.2.1 (2026-04-27)
- **17,425 verified records** across 81 cipher types and 84 cipher engines — full-scale comprehensive generation.
- Added all Cipher Museum engines: Caesar through SIGABA, Lorenz, Fialka, KL-7, Geheimschreiber, Solitaire, Navajo, Venona, Chinese Telegraph, Zimmermann, Culper Ring, Wallis Ciphers, Wadsworth, Geez Monastic, Diana, and 50+ more.
- All records pass automated roundtrip verification.
- 70/30 public/blind split assigned at generation time.
- Engine manifest updated in `corpus/engine-manifest.json`.

## v0.2
- Major dataset expansion: added Playfair, Hill, Polybius, Bacon, Rail Fence, and multilingual (Spanish, French, Russian, German) records.
- Added noisy ciphertext records simulating OCR errors and typos (English, French).
- Added modern cipher baselines (AES, DES, RSA) for educational contrast.
- Updated beginner/intermediate/advanced/expert splits.

## v0.1
- Initial synthetic benchmark release.
- Includes Caesar, ROT13, Atbash, Affine, Vigenère, Playfair, substitution, and transposition examples.
