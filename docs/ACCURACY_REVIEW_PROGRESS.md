# Cipher Museum — 67-item accuracy review tracker

Last updated: 26 October 2026. **Audit complete, merged and deployed.**

This is the single progress checklist for the current review. The **67 items are work packages, not 67 pages**. The site inventory contains **214 public HTML pages**. A completed item records only the stated scope, not a guarantee that an entire exhibit is flawless.

**Status: 67 of 67 done.**

- **DONE:** the specific work and evidence described in that row are complete.
- **DRAFT:** edits or checks exist, but the row's remaining review/validation is unfinished.
- **ACTIVE:** the next item being worked on.
- **TODO:** open work; source collection may have started.

**Release:** [PR #13](https://github.com/systemslibrarian/cipher-museum/pull/13) merged as `bedb4d9d82b3ecbb54b198c2c7d191c7576d5fc4`. [GitHub CI and Pages deployment](https://github.com/systemslibrarian/cipher-museum/actions/runs/40401756569) passed. The [live verification record](page-audit/live-verification.json) confirms that all 26 sampled pages/shared files match the reviewed release byte for byte.

**Complete:** all 67 work packages have their evidence recorded. All 214 public pages received the bounded review; 200 HTML pages changed. The complete local suite, GitHub CI, 428 desktop/mobile page checks and 12 changed-control checks passed. Source-access and historical uncertainties remain documented in the report and ledger.

## Checklist

| # | Status | Work item | Evidence / condition for completion |
|---|---|---|---|
| 01 | DONE | Inventory all public pages | 214 tracked HTML pages inventoried; coverage ledger exists for every page. |
| 02 | DONE | Initial page-by-page prose reading | 151,229 extracted words read. This is a first pass, not verification of every statement. |
| 03 | DONE | Book-credit policy | Shared credits use titles, authors and editions; supplied ebook links removed. Final site-wide link sweep completed under item 60. |
| 04 | DONE | Save the first four correction batches | The first four draft batches corrected 165 HTML pages at commit 395266c; the completed release is recorded above. |
| 05 | DONE | Fourth-batch complete test suite | Full npm test passed at 395266c. Later changes passed the final complete run under item 62. |
| 06 | DONE | Initial browser sweep | All 214 pages loaded without script errors or horizontal overflow; external resources blocked. Not proof of historical accuracy. |
| 07 | DONE | Fourth-batch browser follow-up | 16 revised pages checked; Dorabella and Sator interactions exercised; mobile inspector visually rechecked. |
| 08 | DONE | Independent arithmetic checks | Challenge ciphertexts, 676 DIANA pairs, SIGSALY illustration and IRA reconstruction checked independently. |
| 09 | DONE | IRA challenge correction | 51 surviving letters; Richard Bean's 2019 solution; original keyword distinguished from equivalent column order. |
| 10 | DONE | Phaistos sign-count verification | All 45 frequencies reconstructed from a published transcription; 241 tokens, with gaps and strokes excluded. |
| 11 | DONE | Dorabella and Sator corrections | Short-sample claims qualified; 25-letter anagram checked; Sator input validation and mobile layout corrected. |
| 12 | DONE | Fourth-batch biography corrections | Kahn's 2020 induction, Lasry's 2017 defence versus 2018 publication, and Wallis's 1643 interception corrected. Remaining biography checks are separate below. |
| 13 | DONE | Five cultural exhibit revisions | Source/prose review completed for Geʼez, field hollers, Gravity Falls, microdot and Navajo. Historical evidence is distinguished from each invented widget; sources and limits recorded. |
| 14 | DONE | Cultural metadata and shared labels | Shared cultural cards and descriptions regenerated; corrected Navajo misclassification as a rotor machine, Geʼez teaching provenance and microdot/field-holler limits. |
| 15 | DONE | Cultural demonstrations in browser | Five cultural widgets exercised independently at 1280 px and 390 px. Mobile screenshots inspected; no script errors or overflow. See browser-culture-fifth.json. |
| 16 | DONE | The Gold-Bug edition and explanation | 1843 edition and 203-symbol cryptogram checked; selected steps distinguished from exhaustive explanation. Desktop/mobile render passes. |
| 17 | DONE | Arnold–André chronology | Kahn’s June 1779 correspondence checked; 1779–1780 labels propagated. Entire prose reread; document capture separated from cryptanalysis and simplistic legal claims removed. |
| 18 | DONE | Chinese Telegraph Code provenance | JHU collection account and Unicode mapping properties checked alongside NSA and Hong Kong sources. 1870s development/1881 revision and edition-specific mappings clarified; invented widget remains explicit. |
| 19 | DONE | Solitaire operating guidance | Published FOO/fifteen-A vector and inverse pass in the visualizer at both widths. Reread exposed a padding mismatch: visualizer now correctly says it processes entered letters without automatic padding. |
| 20 | DONE | Wadsworth and Wheatstone limits | Wadsworth prose reread against Friedman description and correspondence. Wheatstone mechanism/model boundary reread; Kaeding abstract-only evidence limit made visible. Desktop/mobile checks pass. |
| 21 | DONE | Two-Square and other comparison dates| All 120 comparison rows read; uncertain dates labeled as ranges, context or undated. Bacon 1605/1623, Morse 1844 demonstration, Argenti succession and ROT13 popularisation distinguished. Shared teaching-key labels aligned; browser pass. |
| 22 | DONE | Regression checks for cultural claims | 35 public-claim guards and 35 restored-error controls pass. Manual-cipher UI tests pass after replacing a brittle wording-based undated-row test with date-data classification. |
| 23 | DONE | Zimmermann Telegram | Corrected history/model distinction, routes, codebook conflation and causal wording; NSA pp. 44–45 and Page telegram read. New restored-error guard passes; desktop/mobile vectors and visual review pass. See browser-item23.json. |
| 24 | DONE | Fialka and KL-7 comparisons | Fialka/KL-7 sources and full prose checked. Reversed chronology and session-key analogy corrected; M-125-3M, 30 contacts and 26-letter model distinguished. Desktop/mobile render passes. |
| 25 | DONE | M-209 dates and production | Kahn and Lasry checked for 1940 trials, production from 1942 and roughly 140000 units; printed-output operation verified. Exhibit, comparison and timeline aligned; browser render passes. |
| 26 | DONE | SIGSALY installations and scope | NSA SIGSALY history printed pp. 2–9 checked: 12 terminals, initial service 15 July 1943, equipment and locations. Arithmetic remains explicitly a text-only illustration; browser passes. |
| 27 | DONE | Beurling and T52 history | FRA account and Borelius hypothesis distinguished; IAS member 1952–54/faculty from  1954 corrected. Daily-key teamwork retained; browser passes. |
| 28 | DONE | C-36, NEMA and Geheimschreiber | C-36 variants and physical alphabet offsets qualified; Greenough abstract-only limit explicit. NEMA wheel/reflector/period and independent vector checked. T52 bit control not transferred between models. |
| 29 | DONE | RS44, Double Playfair, AMSCO and turning grille | Original RS44 and December 1941 Double Playfair manual examples visually compared with independent vectors; ACA AMSCO57-letter answer checked; de Leeuw 1913 reconstruction pp. 49–52 read. UI/inverse/invalid-input tests and browser controls pass. |
| 30 | DONE | Colossus and Tunny final check | Tunny passages and synthetic statistic limits rechecked; 1024-symbol planted-bias and no-bias browser runs pass, with explicit inconclusive result. Mobile result visually inspected; Node independent residual/statistic tests pass. |
| 31 | DONE | VENONA, SIGTOT and 5-UCO | Benson chronology and codebook/additive distinction checked; 1953 SIGTOT assessment is conditional,5-UCO acronym/handling claims qualified. Binary widget remains distinguished from Soviet decimal systems. |
| 32 | DONE | Driscoll, Elizebeth Friedman and Rochefort | Driscoll death in Fairfax and unsupported award corrected; Elizebeth team/recognition scope corrected. Rochefort teamwork, later intelligence service and 30 May 1986 medal checked; birth-record discrepancy remains explicit. |
| 33 | DONE | Batey, Marks, Dunin and Lasry remaining details | Batey MBE checked against Gazette; unsupported death location/reputation removed. Marks publisher bio/poem context read; Dunin self-biography and archive scope checked; Lasry unsupported Zodiac attribution removed. Prior cited memoir/degree scope retained. |
| 34 | DONE | Kryptos current status | K4 archival discovery,20 November 2025 sale, June 2026 stewardship and verifier distinguished from public cryptanalysis. Source access limits explicit; CIA transcript independently counted 869/865/4. Desktop/mobile controls pass. |
| 35 | DONE | Voynich physical description | Yale 102 leaves/foldouts distinguished from page counts; Reddy–Knight 37919 tokens tied to transcription; Hodgins 1404–1438/95.4% parchment range checked. Writing date not inferred. |
| 36 | DONE | Other unresolved-puzzle status | Reread Somerton, McCormick, Beale, Shugborough. Somerton police statement dated6 July 2026; McCormick 2011 appeal not recast as current. Beale treasure/algorithm and Shugborough acrostic remain unproved. Browser controls pass. |
| 37 | DONE | Classical worked examples | Complete ADFGX/ADFGVX fractionation/transposition examples independently calculated; Alberti rings made consistent; Chaocipher reference checked against published vector before widget seed. 515 exhibit assertions and 20 desktop/mobile checks pass; two mobile explanations visually inspected. |
| 38 | DONE | Classical historical consistency| Remaining classical prose reread against Kahn, Holden and available archival reconstructions. Removed unsupported attribution/deployment guarantees. Weber chapter 9 verifies original and later Patterson variants; inaccessible full attack detail explicitly bounded; three-row example independently corrected. |
| 39 | DONE | Foundations index and summaries| All 18 foundation pages and index reread. Card summaries distinguish related models, Euler unit condition, scalar multiplication, visual scatter and cryptographic assumptions. |
| 40 | DONE | Foundations mathematics and interactions| Complete foundation tests pass, including 153 interaction checks. Independently enumerated 194 LWE boundary cases and 103-point ECDSA group. Corrected duplicated cancellation term, zero-error possibility and finite-field/real distinction; mobile/desktop checks pass. |
| 41 | DONE | AES and RSA claims| AES/RSA full prose reread; standards, CNSA indexed evidence and Signal revision 4 scope recorded. Historical priority and encoding/protocol boundaries qualified. Protocol tests and browser pass. |
| 42 | DONE | DH, ECDSA and zero-knowledge pages| DH export downgrade separated from larger-group estimates; ECDSA nonce/hash/group conditions and ZK transcript limits checked. 37 math+34 page tests pass; browser nonce-recovery example succeeds at both widths. |
| 43 | DONE | NFC paper detail check | NFC revision 1.1 §§12.1,14,17 checked: genuine-WRITE tearing conditions, NTAG 223 sample/NTAG 224 limitation, and 777-day first-segment estimate distinguished. |
| 44 | DONE | SoDark paper detail check | SoDark §3.4–3.5 and Table 4 checked: oracle tuples versus passive ALE frames, six-GPU measurements, 50% success and eight-round scope retained. |
| 45 | DONE | UA-8295 full-evidence boundary | Full PDF inaccessible. Removed unverified cipher/firmware/timing details; exhibit and trust registry explicitly limit verification to the primary abstract and publication record. |
| 46 | DONE | Modern attack evidence overview | GPU full primary paper separates 64-bit repeated-key target, throughput and extrapolation. GEA published status/abstract limit corrected; conditional-DES full paper distinguishes candidate counts from full key search. |
| 47 | DONE | Cryptanalysis teaching page | Complete prose/inline-demo review. IC and Kasiski limits corrected; terminal repeat included; annealing uses current-state score; candidate HTML escaped. 137 playground checks and independent seeded acceptance trace pass. |
| 48 | DONE | Glossary final consistency | Definitions reread and corrected: cribs, cryptanalytic goals, CBC, confusion, polynomial rings and classical constructions retain their required conditions. |
| 49 | DONE | Homepage and Learn narrative | Egypt secrecy/lineage and summary claims qualified. Counts checked; Bacon 25-letter widget labelled, Polybius coordinates restricted to 1–5. |
| 50 | DONE | Museum map and collection categories | All map rows and breadcrumbs reconciled. Editorial 152+3+17 partition distinguished from registry categories; M-94 disk, Geʼez chronology and research-case labels corrected. |
| 51 | DONE | All thirteen hall summaries | All 13 hall summaries/cards read and cross-checked against 115 target exhibits and 17 foundation targets; residual date, attribution and security claims corrected. |
| 52 | DONE | Tours and tour JSON | Five tours and all 51 stops read. Notes match model boundaries; progress survives unavailable/malformed browser storage. Targeted tour tests pass. |
| 53 | DONE | Learning paths, quiz and flow explorer | Actual my-path/learning-path quiz implementation reviewed; 11 curated destinations distinguished from 13 halls. All 12 flow routes/resets and quiz integration checks pass. |
| 54 | DONE | Culture survey and related cards | All 14 culture cards and filter logic reread; medium/date labels and audience claims corrected. Alphabetical exhibit rereads include all related cards. |
| 55 | DONE | Corpus, teaching and benchmark counts | Complete shipped datasets independently counted: v0.6=100326/85 types/9 languages; v0.8=100313/85 types/7 languages; 88 engines. All 85 report rows checked; mixed difficulty and unsupported comparison claims corrected. |
| 56 | DONE | Utility pages and offline behavior | 404 decoded independently; nested paths repaired. Seven real-bundle embed cases, search, teaching navigation and conditional offline tests pass; storage/cache limitations explicit. |
| 57 | DONE | Final full-page reread | All 214 final public pages reread across six reviewers and root, including metadata, examples, sidebars and related cards. Remaining source-access limits retained; unsupported DIANA deployment dates and Boak locator removed. |
| 58 | DONE | Final coverage ledger reconciliation | All 214 rows reconciled with actual readers, scoped source IDs/limits, current SHA-256 and final browser results; no unread pages remain. |
| 59 | DONE | Bibliographic completeness | Shared and page-specific book credits expanded/corrected; edition metadata checked. Citations record only consulted passages, not whole-book verification. |
| 60 | DONE | Final no-ebook-link sweep | Public anchors/shared bibliography and 38 corpus data files swept. Ten ebook destinations blocked in rendered-card tests; four primary/catalogue controls preserved. Frozen provenance metadata retained, without live ebook links. |
| 61 | DONE | Regenerate derived site data | Counts/trust/search/155 artifact cards/minified assets rebuilt. Corrected stale UA technical overrides, DIANA metadata and non-OTP family classifications; semantic output reviewed. |
| 62 | DONE | Full tests and HTML/link checks | Fresh complete npm test: 63 suites passed after all content/metadata edits. HTMLHint 214 pages, 6501 local links and release metadata pass. Earlier stale-index integration failure resolved. |
| 63 | DONE | Demonstrate regression guards | 35 public-claim guards reject 35 deliberately restored errors. Engine mutation/complexity canaries and independent arithmetic/vector checks pass; Detective high-IC counterexample retained. |
| 64 | DONE | Final browser and visual review | 428/428 page checks and 12/12 changed-control checks pass at 1280/390 px. Six selected layouts visually inspected; evidence in browser-final*.json. |
| 65 | DONE | Review final changes and save checkpoint | Final changes independently reviewed, 214-row ledger/hashes reconciled, report/PR rewritten and release checkpoint saved in PR #13. Scratch files and dependencies excluded. |
| 66 | DONE | Merge and deploy | PR #13 merged as `bedb4d9` after passing CI. Main-branch tests, corpus checks and Pages deployment succeeded; see the linked workflow. |
| 67 | DONE | Verify live release and publish links | 26 representative pages and shared files returned HTTP 200 and matched reviewed SHA-256 bytes. Live cache version: `cipher-museum-ca4277b5`. Completion record includes URLs and verification time. |

## How progress will be recorded

Update this file after each bounded batch. For each closed item, record its source/evidence, relevant tests or visual check, and commit when saved. An inaccessible source must lead to a documented limit, qualified wording, or removal of the unsupported claim—not a verified label. Do not expand the checklist merely to avoid closing existing items; put newly found issues into the relevant numbered item.

Items 57–67 completed the release gate. The existing user authorization covered the merge and deployment after checks passed.

## Supporting evidence

- [Detailed audit narrative](PAGE_BY_PAGE_ACCURACY_AUDIT.md)
- [214-page coverage ledger](page-audit/coverage.json)
- [Source passages and their limits](page-audit/sources.json)
- [Fourth-checkpoint browser evidence](page-audit/browser-fourth.json)
- [Public-claim regression checks](../tests/test-page-audit-claims.js)

## Progress log

- **26 October 2026 — tracker created:** Consolidated completed work, current drafts and remaining release work into 67 numbered items at the user's request. Paused open-ended research to make the work reviewable. Current work resumes at item 23.

- **26 October 2026 — item 23 completed:** Zimmermann history corrected; 35 public-claim checks and 35 restored-error controls pass, history/modern review passes 9 checks, and exhibit examples pass 507 assertions. Browser checks pass at 1280 px and 390 px; mobile model/controls screenshot inspected. A pre-existing test expected the retired wording; its assertion was updated to the stronger model boundary. No release claimed.

- **26 October 2026 — fifth batch:** Closed items 13–20,22,24,25. Fourteen pages passed desktop/mobile smoke checks; six widget behaviors exercised, including the author’s Solitaire vector. The intermediate full suite failed on a brittle comparison-test predicate; the predicate was corrected and targeted checks pass. After metadata generation, the fresh complete npm test run passed.

- **26 October 2026 — sixth batch:** Closed items 26–33 with source-specific limits. Corrected machine histories, operational claims and biographies; original manual vectors checked. All 36 browser checks pass across 18 pages, and Colossus/mobile results were visually inspected. Fresh complete `npm test` passes. Saved as a draft checkpoint; no merge/deployment.

- **26 October 2026 — seventh batch, items 34–37:** Reconciled current puzzle evidence and counting conventions; corrected complete classical examples. Targeted vectors and 20 browser checks pass. Fresh complete `npm test` passes; no release claimed.

- **26 October 2026 — eighth batch, items 21,38–42:** Closed remaining classical chronology and foundations/protocol scopes. 68 desktop/mobile checks pass. 194 independent LWE cases and 103-point curve count agree. Full release review remains open.

- **26 October 2026 — parallel final review:** Six agents completed bounded exhibit, research, teaching, navigation, corpus and bibliography reviews. Root integrated all 214 page rereads, independent implementation review, source limits and additional generated-card corrections. 60 of 67 work packages are complete; final release gates remain open.

- **26 October 2026 — release checkpoint:**65/67 complete. Fresh 63-suite run,214-page HTML lint and 6501 local links pass. 428 page-load checks and 12 changed-control checks pass; selected layouts visually inspected. Final hashes and source limits reconciled; merge/deployment pending.

- **26 October 2026 — release complete:** All 67 work packages closed. PR #13 merged; main CI and GitHub Pages deployment passed; 26 live pages/shared assets match the reviewed bytes. Remaining evidence limits are retained explicitly, with no claim of blanket factual certification.
