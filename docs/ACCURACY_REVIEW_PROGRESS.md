# Cipher Museum — 67-item accuracy review tracker

Last updated: 26 October 2026. **Audit in progress; not merged or deployed.**

This is the single progress checklist for the current review. The **67 items are work packages, not 67 pages**. The site inventory contains **214 public HTML pages**. A completed item records only the stated scope, not a guarantee that an entire exhibit is flawless.

**Status: 12 done · 10 drafted · 1 active · 44 to do.**

- **DONE:** the specific work and evidence described in that row are complete.
- **DRAFT:** edits or checks exist, but the row's remaining review/validation is unfinished.
- **ACTIVE:** the next item being worked on.
- **TODO:** open work; source collection may have started.

**Saved work:** [draft PR #13](https://github.com/systemslibrarian/cipher-museum/pull/13). The first four batches are saved at `395266cb88e68ff9ae807d3e38bb5f3282d804ec`, covering corrections to **165 HTML pages**. The latest uncommitted draft brings that to **170 HTML pages**. That draft is not covered by the earlier full-suite pass and has not been deployed.

**Current focus: item 23, Zimmermann Telegram.** Source review found a real contradiction: the body attributes additive superencipherment to the historical telegram, while the sidebar correctly describes successive codebook transmissions. The correction must separate history from the museum's additive teaching model.

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
| 13 | DRAFT | Five cultural exhibit revisions | Geʼez, field hollers, Gravity Falls, microdot and Navajo prose revised; finish final source/prose review. |
| 14 | DRAFT | Cultural metadata and shared labels | Comparison, map, descriptions and microdot trust note edited; regenerate shared data and check agreement. |
| 15 | TODO | Cultural demonstrations in browser | Exercise the five revised pages at desktop/mobile widths; verify labels match the actual models. |
| 16 | DRAFT | The Gold-Bug edition and explanation | 203-symbol claim checked against 1843 text; selected steps distinguished from an exhaustive decipherment. Finish rendered check. |
| 17 | DRAFT | Arnold–André chronology | June 1779 correspondence checked in Kahn; fact boxes corrected. Reread and propagate repeated dates. |
| 18 | DRAFT | Chinese Telegraph Code provenance | Removed unsupported first/every-later-code narrative; reconcile remaining edition dates with source evidence. |
| 19 | DRAFT | Solitaire operating guidance | Manual conventions qualified; normalised-message wording corrected. Check visualizer and original vectors against specification. |
| 20 | DRAFT | Wadsworth and Wheatstone limits | Remove editorial audit language; retain only claims supported by the available study/abstract and clearly identify model limitations. |
| 21 | DRAFT | Two-Square and other comparison dates | Two-Square origin made undated; check the entire table against exhibit and timeline dates. |
| 22 | DRAFT | Regression checks for cultural claims | 34 claim checks and 34 restored-error controls pass locally; add final historical corrections before release run. |
| 23 | ACTIVE | Zimmermann Telegram | Remove unsupported additive layer, naval-codebook conflation and routing claims; verify against NSA pp. 44–45 and Page's February 1917 telegram; add regression guard. |
| 24 | TODO | Fialka and KL-7 comparisons | Correct backwards chronology and key-card/session-key analogy; distinguish M-125 variants and 26-letter teaching model. |
| 25 | TODO | M-209 dates and production | Kahn and Lasry support roughly 140,000 units; make adoption/production dates precise and consistent across surfaces. |
| 26 | TODO | SIGSALY installations and scope | Verify terminal count/location list and equipment claims; keep typed arithmetic distinct from speech encryption. |
| 27 | TODO | Beurling and T52 history | FRA account read; IAS appointment dates found. Record evidence, verify remaining biography details and qualify variant claims. |
| 28 | TODO | C-36, NEMA and Geheimschreiber | Check machine-specific mechanisms, dates and operational claims against technical references; avoid transferring claims between variants. |
| 29 | TODO | RS44, Double Playfair, AMSCO and turning grille | Compare documented procedures and independent vectors with cited source editions and current widgets. |
| 30 | TODO | Colossus and Tunny final check | Verify remaining historical summaries and run the corrected synthetic statistic experiment in the browser. |
| 31 | TODO | VENONA, SIGTOT and 5-UCO | Verify operational details against the supplied historical sources; keep decimal field systems separate from binary demonstrations. |
| 32 | TODO | Driscoll, Elizebeth Friedman and Rochefort | Finish biographical claims and awards; resolve Rochefort's recorded birth-date discrepancy with explicit source scope. |
| 33 | TODO | Batey, Marks, Dunin and Lasry remaining details | Finish later-life, publication and role checks; do not treat earlier corrections as whole-biography certification. |
| 34 | TODO | Kryptos current status | Verify 2025 plaintext discovery versus methods, auction/ownership claims, and remove stale editorial notes. |
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
