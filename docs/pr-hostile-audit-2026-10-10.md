Fresh hostile recheck of Cipher Museum PR #1 and PR #2 — 2026-10-10

**The five repaired findings pass this fresh recheck. Both PRs are NOT MERGE-READY because A-0 is confirmed: the required repair follow-up and evidence are absent from both committed PR trees.** No new runtime defect was found within the five-finding scope. I authored the repairs earlier in this conversation; this is a fresh hostile recheck, not independent approval by a different reviewer.

Both expected heads matched GitHub exactly before and after testing. PR #1 remains OPEN against main; PR #2 remains OPEN against fix/trust-label-audit. No source repair, commit, push, merge, retargeting, deployment, or PR-description edit was performed. Temporary mutations were made only in a new disposable worktree and restored. Generator runs in detached review worktrees preserved all tracked bytes. The original checkout's tracked files and all 209 existing review/repair report and evidence files remain unchanged. This report and its new evidence directory are local, uncommitted review artifacts.

| PR | Exact tested head | Actual base |
| --- | --- | --- |
| #1 | `c29a8668e2c3dcb4e6e5b46bc61c0f95e0edca72` | main, `55266306b5904c743429288481aaa5cf09e709b8` |
| #2 / combined | `abaaceec27f63ecb13770a7ec8fdf9852b0f6330` | fix/trust-label-audit, PR #1 head above |

Repository guidance and the complete original FAIL and repair reports were read. The applicable source, tests, CI workflow and evidence helpers were checked directly. No applicable AGENTS.md was found. Five new detached worktrees under `/tmp/cipher-hostile-20261010-` hold pr1, pr2, pre1, pre2 and mutation. Pre-fix revisions are PR #1 `663cbffe736b88353ac4d17ecff300c5d6ae665e` and PR #2 `1e190e0e7d347e5684d36a40827e602ac821045d`. Existing checkouts and unrelated uncommitted work were preserved.

| Finding | Reproduced pre-fix | Fixed at requested head | Evidence |
| --- | --- | --- | --- |
| Artifact loading race | YES: renderer→data gives zero cards; data→renderer gives one, on both PRs and both widths. Data is present after the failed rendering. | PASS, both heads: exactly one in both measured execution orders, including after repeated delivery. Delayed-DOM cases also pass. | `js/artifact-cards.js:75`; `tests/test-artifact-loading.js:29`; before/after-browser-results.json and main-race-results.json. |
| Timing detector gap | YES: production constant changed temporarily to 20, old canary exits 0; actual correctness-preserving quadratic Caesar is accepted, measured 14.0064×. | PASS, both heads: production threshold remains 10. Its canary passes positive controls and rejects real quadratic work; changing only the actual production constant to 20 fails the canary's expected-exception assertion. | `tests/engines/scaling.js:39`; `tests/engines/scaling-canary.js:27`; pre-regression-results.json and mutation-threshold20.log. |
| Offline metadata | YES: index-only installation in fresh profiles, followed by offline first visits to all four exhibits, leaves zero artifact cards and failed metadata requests. All three demos still work. | PASS, PR #2/combined: all four pages, three encrypt/decrypt demos and exactly one artifact card per page work on first offline visit. Shared dependency/hash coverage passes on PR #1 too. | `sw.js:40`; `tests/test-sw-version.js:57`; before/after-browser-results.json. |
| Independent classifications | YES: the old NEMA/Hagelin statements are independently maintained; wrong Broken/Historical Only prose is accepted by both old trust and historical tests. | PASS, PR #2: remaining text explains obsolete machinery and model-specific public attacks without independently naming a current trust classification. Both wrong statements and the exact original classification wording are rejected when restored. | `ciphers/nema.html:113`, `ciphers/hagelin-c36.html:86`; `tests/test-historical-exhibits.js:21`; pre-regression-results.json and after-mutation-results.json. |
| Myszkowski stale caption | YES: valid TOMATO → empty, A or 123! leaves old ranks despite an empty grid/output. | PASS, PR #2: invalid state clears caption, cells, output and derived column width; BANANA recovery updates all four correctly and decrypts to the original plaintext. Reusing output while invalid leaves the rejected state unchanged. | `js/historical-demos.js:104`; ui-transition-results.json, before/after-browser-results.json and mutation-stale-myszkowski-caption.log. |

Defect list, ordered by severity:

1. **A-0 — P2, blocking delivery/provenance defect, both PRs.** `docs/pr-repair-2026-10-10.md` and `docs/pr-repair-2026-10-10/` exist only as untracked local files. The former is absent from both requested commit trees: `git cat-file -e <head>:docs/pr-repair-2026-10-10.md` exits 128 for each. Its local text explicitly says the report/evidence were saved locally rather than committed. A remote reviewer or clean checkout cannot access the supplied repair record. This is a missing required review artifact, not evidence of a runtime failure. See A-0-evidence.json; the absent committed file has no source line to cite.

No unresolved reproduction of the original five findings or additional blocking code defect was found in this scope. Independent approval remains unavailable from this author recheck. PR #2 also lacks hosted CI because the workflow triggers PRs only when their base is main (`.github/workflows/ci.yml:7`). Its local checks are evidence, not a hosted status check.

The artifact repair commit **eca039fba786caf4c5258811430191e0facd61af** is isolated to the pre-existing loading problem: renderer readiness retry, generated publisher event, derived minified output, one regression suite/runner registration and the corresponding SW stamp, across seven files. No classification or unrelated runtime change occurs in it. A separate JSDOM reproduction directly loads main's committed renderer and metadata and also obtains zero renderer-first cards / one data-first card. Main's nav loader is byte-identical at PR #1 head. See eca039f.patch, main-race.js and main-race-results.json.

Validation ran under **Node 22.23.3**, Darwin 25.6.0 ARM64, native Chrome **154.0.8037.98**, Playwright **1.63.0**, with separate npm installations and hydrated LFS corpus files. Full suites and timing mutations ran serially. No failing unmodified timing run was rerun until green. All later engine stages and Foundations suites executed. Expected quadratic and invalid-key failures inside canary assertions are deliberate controls, not production failures.

| Required check on exact heads | PR #1 | PR #2 |
| --- | --- | --- |
| npm ci | PASS | PASS |
| Separate CI test:engines step | Not separately required; engines run within npm test | PASS |
| Full npm test | PASS, all 29 top-level suites | PASS, all 30 top-level suites |
| Engine property specs | 689 pass, 0 fail, 0 skip | Same in both engine runs |
| Production complexity coverage | 85/85, zero skips/violations | Same in both engine runs |
| Actual quadratic rejection control | 16.3×, rejected | 15.6× in CI engine step; 15.3× in full suite, rejected |
| HTML lint | 197 files, zero errors | 201 files, zero errors |
| Corpus schema | 100,026 valid, zero invalid | Same |
| Corpus replay | 100,026 records, zero unexplained | Same in both runs |
| Initial generator freshness | PASS | PASS |
| Two complete generator passes | 561 tracked files, zero byte changes | 569 tracked files, zero byte changes |
| git diff --check, worktree and actual-base range | PASS | PASS |
| Final tracked cleanliness | Clean | Clean |

Both legacy engine runs retain their two documented skips: Fractionated Morse's encrypt-only legacy fixture and Caesar's generic configuration check because its exhibit has a dedicated demo. These are unchanged; the 689 property specs and 85-engine timing coverage have no skips.

Commands are recorded with timestamps, exact SHAs, exits and full output in pr1-validation.json/pr2-validation.json and their logs. `validate.js` continues the required checks after any nonzero result; none occurred. The shared command sequence was:

```sh
export PATH="/Users/gmcas/.npm/_npx/52027bd8fc0022aa/node_modules/node/bin:$PATH"
node --version
git lfs checkout
npm ci
# PR #2: npm run test:engines, exactly before npm test
npm test
npm run lint:html
npm run validate:corpus
node scripts/build-trust-labels.js --check
node scripts/build-search-index.js --check
node scripts/build-artifact-cards.js --check
node tests/test-min-fresh.js
node tests/test-sw-version.js
# Twice, hashing every tracked file before/after each pass:
node scripts/build-trust-labels.js
node scripts/build-search-index.js
node scripts/build-artifact-cards.js
node scripts/build-counts.js
node scripts/build-min.js
git diff --check
git diff --check <actual-base-sha> HEAD
git status --porcelain --untracked-files=no
```

For PR #2 specifically, the workflow's exact shell steps **npm ci → npm run test:engines → npm test → npm run lint:html** all passed against abaaceec…, in that order. Local checkout/LFS hydration and exact Node setup preceded them. The separate main-push-only schema job was additionally run locally. This is **local macOS evidence only**; it does not execute GitHub action wrappers or reproduce the hosted ubuntu-latest environment. PR #1's existing hosted test success was confirmed on GitHub; its main-push-only corpus job is skipped. Neither PR was retargeted to obtain a hosted run.

All three fresh corpus replays agree category-by-category: **99,500 passing records, 526 documented-deviation records, 1,051 deviation events, zero unexplained results**. Every one of the 34 categories, its count and rationale is explicitly saved in corpus-accounting.json. Totals are 959 intentional-noise events, six Navajo events, eleven historical-variant categories with four events each and twenty-one with two each. Records may contribute several events. Corpus data/policy and pinned expectations are byte-identical to pre-fix revisions; no additional waiver was introduced.

All **seven** deliberate regressions from the repair evidence were reapplied in the disposable mutation worktree and rejected at their intended assertions, exit 1: old renderer; silent data publisher; 20× production threshold; removed offline metadata (even with a regenerated stamp); wrong independent NEMA classification; wrong independent Hagelin classification; stale Myszkowski caption. Two additional mutations restore each page's exact original wording, including its otherwise-correct classification name; both fail too. Legitimate Caesar/OTP controls and the real quadratic negative control run through the actual production guard. Shared guard/renderer/test code is byte-identical between requested heads. All nine mutations were restored; see after-mutation-results.json and restoration-preservation.json.

Browser tests use real controls at **1280×900 and 390×900**. Network response instrumentation records actual dependency execution order rather than assuming the 350 ms delay took effect; renderer→data and data→renderer are both confirmed. There are 22 pre-fix reproduction records, 42 post-fix records, and 24 additional Myszkowski UI transition-state snapshots checking ranks, grid headings/cells, column width, ciphertext/plaintext, active mode classes and ARIA state. Relevant screenshots were visually inspected. A capture made during the mode button's color transition can show its previous color; additional screenshots disable animations and actual DOM/ARIA state is separately asserted.

Cold offline verification uses fresh contexts with empty storage, visits only index once, awaits an installed controlling service worker, confirms metadata is not loaded in the page's global state, then disables networking before first visiting any new exhibit. The test server uses Cache-Control: no-store, so HTTP cache is not a substitute for service-worker availability. All four correct pages render, with canonical artifact trust labels and exactly one card each; all three known-vector demos decrypt successfully. User-facing failed requests drop from **12/11/12/12** per desktop/mobile page on pre-fix NEMA/Hagelin/grille/Myszkowski to **zero for every repaired page**. Worker-level network-first and background refresh requests intentionally fail while offline and are caught by cache fallback: **25/21/25/25** per repaired page at each width. They are recorded individually with path, service-worker origin and ERR_INTERNET_DISCONNECTED in after-browser-results.json. Zero failed page dependencies does not mean zero attempted network refreshes.

Known vectors exercised through real controls, online and offline:

| Demo | Settings / input | Ciphertext |
| --- | --- | --- |
| NEMA | Fixed military configuration, windows MQQPZQSOEV, 27 As | HRSBVOOTZUCRWLMGRMGVWYWOVNF |
| Turning grille | 4×4, holes 0/1/2/5, clockwise, ABCDEFGHIJKLMNOP | ABCEMDFGNOIHPJKL |
| Myszkowski | TOMATO, WEAREDISCOVEREDFLEEATONCE | ROFOACDTEDSEEEACWEIVRLENE |
| Myszkowski recovery | BANANA, same plaintext | ERDSOEEFEAOCWIREEAECVDLTN |

Hagelin remains a narrative lineage page linking a clearly related M-209 demo. It does not present an M-209 implementation as a C-36/C-52 simulator. Live trust checks also pass for Caesar, SIGABA, Vernam, Aeneas context omission, neutral search, the exact map definition, context hall cards and comparison filters. Full trust tests protect every canonical surface, the eight Broken entries and the exact nine identities/qualifications. Protected trust/definition JSON, complete artifact JSON, search index, sitemap and algorithms are unchanged from the corresponding pre-fix heads. LF/CRLF-equivalent hashing, binary-byte preservation, metadata invalidation and full non-HTML cache-asset coverage pass on both heads; final stamps are db092287 and 437eacda.

Both PRs were diffed against their actual bases, with full patches saved separately from repair deltas. **Changes outside these five findings are present in the full PRs and are flagged as earlier authorized work, not newly introduced repair scope**:

- PR #1 vs main: 182 files, +3,161/−1,062. Besides these repairs, it contains the original trust centralization, restored Broken/context classifications, cross-surface generated outputs/tests, line-ending-stable hashing and earlier timing coverage work. That work was already present at 663cbff.
- PR #2 vs PR #1: 84 files, +1,477/−166. Besides findings 4/5 and dependency coverage, it contains the four new exhibits, demos/assets, canonical registrations, reciprocal links, map/search/sitemap updates, counts/navigation, artifact overrides and historical/demo coverage. These were already present at 1e190e0. The count-range change in scripts/build-counts.js:53 preserves Foundations/protocol identities when numbers 161–164 are appended; generic-demo exemptions at tests/test-comprehensive.js:62 and tests/test-demo-pages.js:114 are accompanied by dedicated historical tests.
- Repair-only ranges: PR #1 663cbff→c29a866 changes 11 files, +165/−57; PR #2 1e190e0→abaacee changes 15 files, +217/−60 including the shared repairs. No unrelated runtime change or weakened assertion was found in these deltas. The sw-version.js change here is commentary clarifying dependencies now precached; fonts and lightbox/generic loader are the offline exhibit dependencies from finding 3.

This finite recheck does not prove the absence of every bug, certify every browser/device or timing platform, independently re-research all historical sources, or supply independent approval of its author's work. Previously recorded unvisited legacy-page offline fallback limitations are outside the five repairs and remain. All requested five-finding checks were completed; A-0 is the outstanding deliverable defect. Original reports/evidence are preserved; see original-audit-hashes.json, preservation-scope-results.json and restoration-preservation.json. The new evidence directory's evidence-sha256.json hashes every saved artifact.

**PR #1: NOT MERGE-READY — A-0 unresolved.**

**PR #2: NOT MERGE-READY — A-0 unresolved; hosted CI still pending.**

PR #2 needs a hosted CI run after retargeting to main. Its current stacked relationship was preserved. Independent approval requires a reviewer who did not author these repairs.
