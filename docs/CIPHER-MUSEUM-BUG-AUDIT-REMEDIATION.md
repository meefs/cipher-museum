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
| CM-006 | Fixed | Finite-field and Wadsworth controllers retain one interval handle and cancel it on Reset, Step, a replacement run, and relevant input changes. The registered regression test drives the real controls in JSDOM and counts live timers; see CM-022 for the behavioural rewrite. |
| CM-007 | Fixed in live surfaces; archived schema bytes immutable | The benchmark runner accepts explicit `--split public`, `--split blind`, or `--split all`, defaults to public, records the selected split in results and receipts, and filters the real `split` field. Mixed-split fixtures test output IDs and denominators. The runner, generators and repository documentation describe `blind` as a public, downloadable evaluation label—not confidential held-out data. The published `cipher-corpus.schema.json` still reads “held-out for evaluation”; those bytes are covered by `SHA256SUMS.txt` and verified before deployment, so the repair is the erratum recorded in `CORPUS-V06-ERRATA.md` rather than an edit. See CM-020. |
| CM-008 | Mitigated; archived bytes immutable | Live benchmark statistics now recompute a consistent Unicode letter/number count from plaintext rather than aggregate ambiguous legacy fields. The v0.6 errata documents that the archived length fields were produced under mixed conventions. New versioned fields can be introduced only in a future corpus release. |
| CM-009 | Fixed | Search applies NFKD accent folding and Unicode tokenization to both query and index text, retains useful partial matching, and synchronizes query/filter state with the URL and browser history. Tests cover `vigenere`/`Vigenère`, partial matching, and URL-era behavior. |
| CM-010 | Fixed | Incorrect Civil War/WWI and other era presentation classes were corrected. Controlled `wwi` and `wwii` matches now require exact era tokens, so WWI no longer matches WWII. Search-index assets were regenerated and tested. |
| CM-011 | Fixed | VIC, Stager, Culper Ring, Arnold–André, and Che Guevara are classified as historical rather than cryptographically broken. Their notes preserve whether the event was capture, defection, obsolescence, or no known cryptanalytic break. Generated badges, halls, cards, comparison data, and search assets agree; semantic tests reject the original contradictions. |
| CM-012 | Fixed | The five definite 404 targets were replaced with current author, DBLP, Stockholm University, Cryptiana, and US National Archives pages. Unavailable/blocked URLs were not misreported as false claims. |
| CM-013 | Fixed | Engine source and audit/inventory documentation now report 88 engines, 167 exhibits, the 100,326-record v0.6 corpus, and the four new engine rows. M-209 documentation identifies its external manual check and legacy corpus-replay boundary. |
| CM-014 | Mitigated; archived bytes immutable | The live validator now rejects duplicate IDs, empty required strings, empty/non-object keys, and negative/non-integer lengths. It rejects duplicate tags in every record except the immutable batches that already carry them, grandfathered by explicit batch label (`0.2`, all 484 of them) because `dataset_version` is a per-batch generator label and not a release ordering; any other label, future ones included, fails closed. Tests cover the rejection under five batch labels and the continued acceptance of the legacy duplicates. Negative mutation tests prove the added semantic layer runs. The errata documents the legacy duplicates. |
| CM-015 | Fixed | Direct and transitive dependency patches were locked. `npm audit` and `npm audit --omit=dev` report zero vulnerabilities. |

## Second-pass findings

| ID | Disposition | Repair and regression evidence |
|---|---|---|
| CM-016 | Fixed | The dedicated full-corpus validation job now runs on pull requests as well as pushes to `main`, while Pages deployment remains restricted to validated `main` commits. The corpus release test rejects a future PR-only skip condition. |
| CM-017 | Fixed | The Community page no longer claims its static form transmits a submission or collects an email address into persistent browser storage. It explicitly describes its local-only boundary, downloads a plain-text draft, and directs users to the repository issue tracker for actual review. An executable DOM test checks the disclosure, absence of email/local-storage collection, downloaded contents and temporary-URL cleanup. |
| CM-018 | Fixed | Community cards formerly presented placeholder concepts as actual visitor write-ups or a recurring daily challenge and sent the Dorabella card to an unrelated exhibit. They are now accurately labelled as study topics, research leads, or practice ideas, with direct destinations. The Community regression rejects the prior unsupported labels and pins the corrected Dorabella link. |

## Third-pass findings

Found by auditing the first- and second-pass change set itself, not the audit
baseline. CM-019 and CM-020 are prose surfaces that carried a claim the code
had already retired — the failure mode `CLAUDE.md` describes. CM-021 and
CM-022 are guards that passed for the wrong reason: neither protected what its
finding claimed, so neither would have failed if the defect returned.

| ID | Disposition | Repair and regression evidence |
|---|---|---|
| CM-019 | Fixed | `README.md` was not on the surface checklist and kept four claims that CM-011 had retired everywhere else: VIC “Broken in 1957” with an NSA probable-word attack, a Culper Ring codebook “captured by British”, a CIA/FBI probable-word attack on Che Guevara's variant, and a Stager status reading “Union operators knew the word lists from captures” where the exhibit says Confederate wiretappers never read a message and the system became public in post-war memoirs. Each contradicted its own exhibit page, trust note, comparison row, map row and search entry, all of which were already correct. The rows now match the exhibits; the Culper entry count was also still 750 against the page's ~760, corrected in `54c7d6e` and missed here. `tests/test-trust-labels.js`, which already owns these five slugs, now pins every row against the live trust notes and exhibit metadata; each of the eight assertions was confirmed to fail with its own defect reintroduced, then restored. |
| CM-020 | Mitigated; archived bytes immutable | The `split` description in the published `cipher-corpus.schema.json` (and `archive/cipher-corpus.schema.v0.2.json`) still called `blind` “held-out for evaluation”, the exact wording CM-007 retired from every executable surface. The schema is checksummed in `SHA256SUMS.txt` and verified by the deploy job, so it is corrected by erratum, as CM-002, CM-008 and CM-014 are. `CORPUS-V06-ERRATA.md` now records it and the test requires that erratum to stay present. |
| CM-021 | Fixed | CM-014's duplicate-tag rule was pinned to `dataset_version === '0.6'`, so it would have lapsed silently at the next release and never applied to the 70,656 published records labelled `2.0`. Because `dataset_version` is a per-batch generator label and not a release ordering, the rule now grandfathers the immutable batches by name (`0.2`) and fails closed for every other label. Tests assert rejection under `0.7`, `1.0`, `2.0`, `0.5` and an unknown label, and continued acceptance of the legacy duplicates; restoring the old pinned condition fails them. |
| CM-022 | Fixed | CM-006's guard asserted source text, so a `var`-to-`let` refactor would have failed it for no reason and a leak that preserved the declaration's shape would have passed. It now opens both pages in JSDOM, instruments `setInterval`/`clearInterval` before the inline scripts run, and drives Run, repeated Run, Step and Reset while counting live timers. All eight cancellation defects were reintroduced one at a time and each fails; the test also fails if a dependency path goes stale or if the reduced-motion stub flips, either of which would make it vacuous. Teardown runs in a `finally`, because a leaked timer otherwise keeps the event loop alive and hangs the suite instead of failing it. |

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

## Known drift in dated evidence scripts

`docs/manual-cipher-independent-reference-check.js` is dated review evidence and
is deliberately left byte-identical, so it is not in `npm test` or CI. It pins
`data/exhibit-trust.json` against baseline `5a519c8` and therefore asserts
`ciphers/vic.html` carries the label `broken`. This remediation pass changed that
label to `historical`, together with `stager`, `culper-ring`, `arnold-andre` and
`che-guevara`: each was compromised by defection, capture or other operational
means rather than by cryptanalysis, and the VIC entry's own note already read
"Never broken by cryptanalysis — exposed by defector (1957)". The label now
agrees with the note and with the `historical` category description.

Consequently the script stops at its baseline comparison when run at a later
head. Its primary purpose is unaffected — the RS44, Double Playfair and AMSCO
source-vector assertions precede that point and still reproduce the printed
ciphertexts — but the checks that follow it (the JSDOM animation-control
workflow, the comparison-table row accounting, the search-index agreement and
the file digests) do not execute. Those behaviours are covered by the permanent
suites `tests/test-manual-cipher-exhibits.js`, `tests/test-historical-exhibits.js`,
`tests/test-counts.js` and `tests/test-search.js`.

The script is not updated to pass at the new head: rewriting a dated artifact
would imply its evidence was gathered at a commit it never ran against. Read it
as a record of `5a519c8`, and treat this note as its erratum.
