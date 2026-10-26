# Cipher Museum — 67-item accuracy review tracker

Last updated: 26 October 2026. **Audit in progress; not merged or deployed.**

This is the single progress checklist for the current review. The **67 items are work packages, not 67 pages**. The site inventory contains **214 public HTML pages**. A completed item records only the stated scope, not a guarantee that an entire exhibit is flawless.

**Status: 32 done · 2 drafted · 1 active · 32 to do.**

- **DONE:** the specific work and evidence described in that row are complete.
- **DRAFT:** edits or checks exist, but the row's remaining review/validation is unfinished.
- **ACTIVE:** the next item being worked on.
- **TODO:** open work; source collection may have started.

**Saved work:** [draft PR #13](https://github.com/systemslibrarian/cipher-museum/pull/13). Five batches are saved through `62a2691a7b5ca747c1f1e7363fc989301f93ae20`, covering corrections to **172 HTML pages**, with the complete test suite passing at that checkpoint. The sixth checkpoint covers corrections to **174 HTML pages** cumulatively. Its complete `npm test` run passes;18 pages also pass both desktop and mobile browser checks. Release checks remain open.

**Current focus: item 34, Kryptos current status.** Items26–33 have completed their stated source and model checks. Comparison chronology (21), whole-site reconciliation and release remain pending.

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
| 21 | DRAFT | Two-Square and other comparison dates | Two-Square origin made undated; check the entire table against exhibit and timeline dates. |
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
| 34 | ACTIVE | Kryptos current status | Verify 2025 plaintext discovery versus methods, auction/ownership claims, and remove stale editorial notes. |
| 35 | TODO | Voynich physical description | Verify leaves/foldouts, word-count convention and parchment dating; do not equate parchment age with ink/writing date. |
| 36 | TODO | Other unresolved-puzzle status | Reread Somerton, McCormick, Beale and Shugborough for dated evidence and uncertainty; avoid claiming current official resolution. |
| 37 | TODO | Classical worked examples | Finish independent checks for ADFGX/ADFGVX, Alberti, Chaocipher and other examples flagged in the ledger. |
| 38 | TODO | Classical historical consistency | Close remaining attribution, origin-date and deployment questions; qualify or remove claims lacking adequate evidence. |
| 39 | TODO | Foundations index and summaries | Reconcile CVP/LWE, random-oracle, Euler unit-condition and other card summaries with the detailed exhibits. |
| 40 | TODO | Foundations mathematics and interactions | Recheck finite-field/real-model boundaries, noise edge cases, diagrams and input constraints with existing meaningful tests. |
| 41 | TODO | AES and RSA claims | Verify standards/current-use wording and historic priority; keep primitive security distinct from protocol and implementation security. |
| 42 | TODO | DH, ECDSA and zero-knowledge pages | Check subgroup, nonce, soundness and deployment qualifications; verify worked examples and related cards. |
| 43 | TODO | NFC paper detail check | Read remaining relevant sections of the locally available author PDF; verify configurations and attack assumptions beyond the first-phase timing correction. |
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
