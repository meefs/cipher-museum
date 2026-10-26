# Cipher Museum — 67-item accuracy review tracker

Last updated: 26 October 2026. **Audit in progress; not merged or deployed.**

This is the single progress checklist for the current review. The **67 items are work packages, not 67 pages**. The site inventory contains **214 public HTML pages**. A completed item records only the stated scope, not a guarantee that an entire exhibit is flawless.

**Status: 42 done · 1 drafted · 1 active · 23 to do.**

- **DONE:** the specific work and evidence described in that row are complete.
- **DRAFT:** edits or checks exist, but the row's remaining review/validation is unfinished.
- **ACTIVE:** the next item being worked on.
- **TODO:** open work; source collection may have started.

**Saved work:** [draft PR #13](https://github.com/systemslibrarian/cipher-museum/pull/13). Seven batches are saved through `5b7aa9db8788fcafbd1a0ba33a566c48a4934a93`, with a complete test-suite pass. Eighth-batch targeted tests and68desktop/mobile checks pass; complete test run passed all other suites and identified three generated-asset/citation gates. Rebuilding assets and adding the two reviewed primary-source URLs repaired those gates; all three targeted reruns pass. A fresh full-suite release run remains required.

**Current focus: item43, NFC paper detail.** Items21,38–42 have completed their stated source/model checks. Whole-site reconciliation and release remain pending.

## Checklist

| # | Status | Work item | Evidence / condition for completion |
|---|---|---|---|
| 01 | DONE | Inventory all public pages | 214 tracked HTML pages inventoried; coverage ledger exists for every page. |
| 02 | DONE | Initial page-by-page prose reading | 151,229 extracted words read. This is a first pass, not verification of every statement. |
| 03 | DONE | Book-credit policy | Shared credits use titles, authors and editions; supplied ebook links removed. Final site-wide link sweep remains item 60. |
| 04 | DONE | Save the first four correction batches | Draft PR #13 contains corrections to 165 HTML pages at commit 395266c. Not merged or deployed. |
| 05 | DONE | Fourth-batch complete test suite | Full npm test passed at 395266c. Later draft edits require another complete run. |
| 06 | DONE | Initial browser sweep | All 214 pages loaded without script errors or horizontal overflow; external resources blocked. Not proof of historical accuracy. |
| 07 | DONE | Fourth-batch browser follow-up | 16 revised pages checked; Dorabella and Sator interactions exercised; mobile inspector visually rechecked. |
| 08 | DONE | Independent arithmetic checks | Challenge ciphertexts, 676 DIANA pairs, SIGSALY illustration and IRA reconstruction checked independently. |
| 09 | DONE | IRA challenge correction | 51 surviving letters; Richard Bean's 2019 solution; original keyword distinguished from equivalent column order. |
| 10 | DONE | Phaistos sign-count verification | All 45 frequencies reconstructed from a published transcription; 241 tokens, with gaps and strokes excluded. |
| 11 | DONE | Dorabella and Sator corrections | Short-sample claims qualified; 25-letter anagram checked; Sator input validation and mobile layout corrected. |
| 12 | DONE | Fourth-batch biography corrections | Kahn's 2020 induction, Lasry's 2017 defence versus 2018 publication, and Wallis's 1643 interception corrected. Remaining biography checks are separate below. |
| 13 | DONE | Five cultural exhibit revisions | Source/prose review completed for Geʼez, field hollers, Gravity Falls, microdot and Navajo. Historical evidence is distinguished from each invented widget; sources and limits recorded. |
| 14 | DONE | Cultural metadata and shared labels | Shared cultural cards and descriptions regenerated; corrected Navajo misclassification as a rotor machine, Geʼez teaching provenance and microdot/field-holler limits. |
| 15 | DONE | Cultural demonstrations in browser | Five cultural widgets exercised independently at 1280px and 390px. Mobile screenshots inspected; no script errors or overflow. See browser-culture-fifth.json. |
| 16 | DONE | The Gold-Bug edition and explanation | 1843 edition and 203-symbol cryptogram checked; selected steps distinguished from exhaustive explanation. Desktop/mobile render passes. |
| 17 | DONE | Arnold–André chronology | Kahn’s June1779 correspondence checked; 1779–1780 labels propagated. Entire prose reread; document capture separated from cryptanalysis and simplistic legal claims removed. |
| 18 | DONE | Chinese Telegraph Code provenance | JHU collection account and Unicode mapping properties checked alongside NSA and Hong Kong sources. 1870s development/1881 revision and edition-specific mappings clarified; invented widget remains explicit. |
| 19 | DONE | Solitaire operating guidance | Published FOO/fifteen-A vector and inverse pass in the visualizer at both widths. Reread exposed a padding mismatch: visualizer now correctly says it processes entered letters without automatic padding. |
| 20 | DONE | Wadsworth and Wheatstone limits | Wadsworth prose reread against Friedman description and correspondence. Wheatstone mechanism/model boundary reread; Kaeding abstract-only evidence limit made visible. Desktop/mobile checks pass. |
| 21 | DONE | Two-Square and other comparison dates| All120comparison rows read; uncertain dates labeled as ranges, context or undated. Bacon1605/1623, Morse1844demonstration, Argenti succession and ROT13popularisation distinguished. Shared teaching-key labels aligned; browser pass. |
| 22 | DONE | Regression checks for cultural claims | 35 public-claim guards and 35 restored-error controls pass. Manual-cipher UI tests pass after replacing a brittle wording-based undated-row test with date-data classification. |
| 23 | DONE | Zimmermann Telegram | Corrected history/model distinction, routes, codebook conflation and causal wording; NSA pp. 44–45 and Page telegram read. New restored-error guard passes; desktop/mobile vectors and visual review pass. See browser-item23.json. |
| 24 | DONE | Fialka and KL-7 comparisons | Fialka/KL-7 sources and full prose checked. Reversed chronology and session-key analogy corrected; M-125-3M, 30 contacts and 26-letter model distinguished. Desktop/mobile render passes. |
| 25 | DONE | M-209 dates and production | Kahn and Lasry checked for 1940 trials, production from1942 and roughly140000 units; printed-output operation verified. Exhibit, comparison and timeline aligned; browser render passes. |
| 26 | DONE | SIGSALY installations and scope | NSA SIGSALY history printed pp.2–9 checked:12terminals,initial service15July1943,equipment and locations. Arithmetic remains explicitly a text-only illustration; browser passes. |
| 27 | DONE | Beurling and T52 history | FRA account and Borelius hypothesis distinguished; IAS member1952–54/facultyfrom1954 corrected. Daily-key teamwork retained; browser passes. |
| 28 | DONE | C-36, NEMA and Geheimschreiber | C-36 variants and physical alphabet offsets qualified; Greenough abstract-only limit explicit. NEMA wheel/reflector/period and independent vector checked. T52 bit control not transferred between models. |
| 29 | DONE | RS44, Double Playfair, AMSCO and turning grille | Original RS44 and December1941 DoublePlayfair manual examples visually compared with independent vectors; ACA AMSCO57-letter answer checked; deLeeuw1913 reconstruction pp.49–52 read. UI/inverse/invalid-input tests and browser controls pass. |
| 30 | DONE | Colossus and Tunny final check | Tunny passages and synthetic statistic limits rechecked;1024-symbol planted-bias and no-bias browser runs pass, with explicit inconclusive result. Mobile result visually inspected; Node independent residual/statistic tests pass. |
| 31 | DONE | VENONA, SIGTOT and 5-UCO | Benson chronology and codebook/additive distinction checked;1953SIGTOT assessment is conditional,5-UCO acronym/handling claims qualified. Binary widget remains distinguished from Soviet decimal systems. |
| 32 | DONE | Driscoll, Elizebeth Friedman and Rochefort | Driscoll death in Fairfax and unsupported award corrected; Elizebeth team/recognition scope corrected. Rochefort teamwork,later intelligence service and30May1986medal checked; birth-record discrepancy remains explicit. |
| 33 | DONE | Batey, Marks, Dunin and Lasry remaining details | Batey MBE checked against Gazette; unsupported death location/reputation removed. Marks publisher bio/poem context read; Dunin self-biography and archive scope checked; Lasry unsupported Zodiac attribution removed. Prior cited memoir/degree scope retained. |
| 34 | DONE | Kryptos current status | K4 archival discovery,20November2025sale,June2026stewardship and verifier distinguished from public cryptanalysis. Source access limits explicit; CIA transcript independently counted869/865/4. Desktop/mobile controls pass. |
| 35 | DONE | Voynich physical description | Yale102leaves/foldouts distinguished from page counts; Reddy–Knight37919tokens tied to transcription; Hodgins1404–1438/95.4% parchment range checked. Writing date not inferred. |
| 36 | DONE | Other unresolved-puzzle status | Reread Somerton,McCormick,Beale,Shugborough. Somerton police statement dated6July2026; McCormick2011appeal not recast as current. Beale treasure/algorithm and Shugborough acrostic remain unproved. Browser controls pass. |
| 37 | DONE | Classical worked examples | Complete ADFGX/ADFGVX fractionation/transposition examples independently calculated; Alberti rings made consistent; Chaocipher reference checked against published vector before widget seed.515exhibit assertions and20desktop/mobile checks pass; two mobile explanations visually inspected. |
| 38 | DONE | Classical historical consistency| Remaining classical prose reread against Kahn, Holden and available archival reconstructions. Removed unsupported attribution/deployment guarantees. Weber chapter9 verifies original and later Patterson variants; inaccessible full attack detail explicitly bounded; three-row example independently corrected. |
| 39 | DONE | Foundations index and summaries| All18foundation pages and index reread. Card summaries distinguish related models, Euler unit condition, scalar multiplication, visual scatter and cryptographic assumptions. |
| 40 | DONE | Foundations mathematics and interactions| Complete foundation tests pass, including153interaction checks. Independently enumerated194LWE boundary cases and103-point ECDSA group. Corrected duplicated cancellation term, zero-error possibility and finite-field/real distinction; mobile/desktop checks pass. |
| 41 | DONE | AES and RSA claims| AES/RSA full prose reread; standards, CNSA indexed evidence and Signal rev4 scope recorded. Historical priority and encoding/protocol boundaries qualified. Protocol tests and browser pass. |
| 42 | DONE | DH, ECDSA and zero-knowledge pages| DH export downgrade separated from larger-group estimates; ECDSA nonce/hash/group conditions and ZK transcript limits checked.37math+34page tests pass; browser nonce-recovery example succeeds at both widths. |
| 43 | ACTIVE | NFC paper detail check | Read remaining relevant sections of the locally available author PDF; verify configurations and attack assumptions beyond the first-phase timing correction. |
| 44 | TODO | SoDark paper detail check | Complete table-to-exhibit comparison; retain measured hardware, data and round-count conditions. |
| 45 | TODO | UA-8295 full-evidence boundary | Obtain/read full paper if accessible; otherwise visibly limit claims to what can be verified and document inaccessible details. |
| 46 | TODO | Modern attack evidence overview | Recheck KASUMI, TEA3 and GEA attack conditions and distinguish theoretical work, measurements and browser simulations. |
| 47 | TODO | Cryptanalysis teaching page | Remove recovery guarantees, universal IC bounds and unsupported causal claims; verify examples and terminology. |
| 48 | TODO | Glossary final consistency | Reread definitions after corrections; check that simplified definitions retain necessary conditions. |
| 49 | TODO | Homepage and Learn narrative | Distinguish unusual Egyptian writing from demonstrated secrecy; verify counts and avoid unsupported direct-lineage claims. |
| 50 | DRAFT | Museum map and collection categories | M-94 disks versus M-138-A strips and Geʼez labels edited; finish hall/breadcrumb and 152+3+17 category checks. |
| 51 | TODO | All thirteen hall summaries | Compare every summary, badge, date and example against corrected exhibits; remove residual contradictions. |
| 52 | TODO | Tours and tour JSON | Read and reconcile all tour narratives and links with final exhibit wording. |
| 53 | TODO | Learning paths, quiz and flow explorer | Check dynamic explanations, recommendations and route logic; keep teaching models distinct from production guidance. |
| 54 | TODO | Culture survey and related cards | Verify all fourteen cards and related-exhibit descriptions against the corrected cultural pages. |
| 55 | TODO | Corpus, teaching and benchmark counts | Verify record/type/engine/language counts against manifests; change generators when generated reports need correction. |
| 56 | TODO | Utility pages and offline behavior | Verify 404 phrase, search, embed labels and conditional offline availability against actual runtime behavior. |
| 57 | TODO | Final full-page reread | Reread every final page including sidebars, metadata, examples and related cards; resolve or visibly bound remaining claims. |
| 58 | TODO | Final coverage ledger reconciliation | Replace stale working notes with checked claims, sources, limits and current file hashes for all 214 pages. |
| 59 | TODO | Bibliographic completeness | Use full book titles, correct authors and supplied edition/year; include verified chapter/page references where available. |
| 60 | TODO | Final no-ebook-link sweep | Check public HTML, dynamically rendered references, generated data and reading pages for direct ebook URLs. |
| 61 | TODO | Regenerate derived site data | Rebuild counts, trust labels, search, artifact cards and required minified assets; inspect semantic changes. |
| 62 | TODO | Full tests and HTML/link checks | Run complete npm test and appropriate lint/link checks after edits stop; resolve failures rather than marking partial runs complete. |
| 63 | TODO | Demonstrate regression guards | Restore retired mistakes in controlled test inputs and confirm guards reject them; retain independent arithmetic/vector checks. |
| 64 | TODO | Final browser and visual review | Repeat whole-site smoke checks; inspect changed desktop/mobile layouts and exercise affected controls with explicit failure reporting. |
| 65 | TODO | Review final changes and save checkpoint | Inspect full diff, reconcile documentation and PR description, and ensure every intended file is committed without scratch/dependency files. |
| 66 | TODO | Merge and deploy | Use existing user authorization only after release checks pass; record merged commit and deployment result. |
| 67 | TODO | Verify live release and publish links | Confirm deployed commit and representative changed pages on ciphermuseum.com; mark release complete only after verification. |

## How progress will be recorded

Update this file after each bounded batch. For each closed item, record its source/evidence, relevant tests or visual check, and commit when saved. An inaccessible source must lead to a documented limit, qualified wording, or removal of the unsupported claim—not a verified label. Do not expand the checklist merely to avoid closing existing items; put newly found issues into the relevant numbered item.

The release gate is items 57–67. Existing authorization covers merging and deployment once those checks pass. This tracker does not change that authorization.

## Supporting evidence

- [Detailed audit narrative](PAGE_BY_PAGE_ACCURACY_AUDIT.md)
- [214-page coverage ledger](page-audit/coverage.json)
- [Source passages and their limits](page-audit/sources.json)
- [Fourth-checkpoint browser evidence](page-audit/browser-fourth.json)
- [Public-claim regression checks](../tests/test-page-audit-claims.js)

## Progress log

- **26 October 2026 — tracker created:** Consolidated completed work, current drafts and remaining release work into 67 numbered items at the user's request. Paused open-ended research to make the work reviewable. Current work resumes at item 23.

- **26 October 2026 — item 23 completed:** Zimmermann history corrected; 35 public-claim checks and 35 restored-error controls pass, history/modern review passes 9 checks, and exhibit examples pass 507 assertions. Browser checks pass at 1280px and 390px; mobile model/controls screenshot inspected. A pre-existing test expected the retired wording; its assertion was updated to the stronger model boundary. No release claimed.

- **26 October 2026 — fifth batch:** Closed items13–20,22,24,25. Fourteen pages passed desktop/mobile smoke checks; six widget behaviors exercised, including the author’s Solitaire vector. The intermediate full suite failed on a brittle comparison-test predicate; the predicate was corrected and targeted checks pass. After metadata generation, the fresh complete npm test run passed.

- **26 October 2026 — sixth batch:** Closed items26–33 with source-specific limits. Corrected machine histories, operational claims and biographies; original manual vectors checked. All36browser checks pass across18pages, and Colossus/mobile results were visually inspected. Fresh complete `npm test` passes. Saved as a draft checkpoint; no merge/deployment.

- **26 October 2026 — seventh batch, items34–37:** Reconciled current puzzle evidence and counting conventions; corrected complete classical examples. Targeted vectors and20browser checks pass. Fresh complete `npm test` passes; no release claimed.

- **26 October 2026 — eighth batch, items21,38–42:** Closed remaining classical chronology and foundations/protocol scopes.68desktop/mobile checks pass.194independent LWE cases and103-point curve count agree. Full release review remains open.
