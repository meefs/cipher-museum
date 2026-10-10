# Independent review: editorial counts and three manual ciphers

Review date: 10 October 2026. This was a separately requested review, not the
implementation agent's self-review. The reviewer read `CLAUDE.md`, inspected
primary facsimiles, wrote separate reference calculations, and made no changes
to implementation files. Only this report and its evidence files were written.

Final scoped verdict: **no outstanding findings at
`102a2fb01ec71405f6be6518c62710471b4f24b7`**. The short final follow-up below
closes the last P3 item; the earlier snapshot chronology is preserved here.

The editorial baseline was `5a519c8c11db9c7b0810455491d019b9f9883f7d`;
the first editorial candidate was `4e5b0c3`. The Phase 2 code reviewed here is
`5217889b0d012fbdbc4b20303d8126520b141846`, including its parent implementation
commit `08fdf0ad01e3f14ccc3f5d9b33e4a1b6124084f1`. The
[5217889 evidence JSON](manual-cipher-independent-evidence-5217889.json) records
SHA-256 digests of the tested working-tree bytes, independently of the commit
name. At this snapshot every listed tracked file matched that commit.

## Verdict at the recorded snapshot

No blocking defect remains in the reviewed implementation and integration.
The four complete source vectors pass encryption, decryption and animation
trace output. Separate reference calculations pass 4,468 additional cases.
The chosen editions, omitted field procedures, normalization and retained
padding are qualified on the pages rather than presented as complete military
message preparation.

The final count correction was independently checked through the actual
comparison UI: **120 rows** from the **167-exhibit collection**, with fresh
description metadata and search summary. The subset is accurately described as
compared exhibits, because it includes historical and cultural context.

A nonblocking P3 search metadata regression remains: the comparison entry's
`c` field is now `—` rather than its eyebrow text. `scripts/build-search-index.js`
line 64 only extracts immediate text, while the generated comparison heading
starts with nested count spans. Its result description still has the correct
120/167 totals, and the page remains searchable. This limitation was reported;
it does not affect the cipher procedures or comparison table.

## Findings and their disposition

| Finding | Evidence and disposition |
| --- | --- |
| Interactive registrations undercounted functioning controls | The first candidate omitted Bible Code, PNT and entropy controls, plus eight legacy controls that depend on `js/ui-delegates.js`. Real control interactions established that all eleven qualify. Corrected by `2b60824` and `d5ade24`; final canonical totals are 146 interactives, including 126 cipher/history exhibits. |
| Universal substitution-break claim survived the editorial correction | `timeline.html` lines 308 and 312 retained the claim that every substitution falls to a frequency table. The final prose qualifies ciphertext sufficiency and possible non-uniqueness. Corrected in `2b60824` and added to the exact change record. |
| Generated count markers appeared literally in README code fences | Initial `README.md` lines 323, 335, 356, 360 and 436 exposed marker syntax. The rendering uses appropriate code-fence replacements now. Corrected in `2b60824`. |
| Current engine requirement was not generated | Initial `README.md` line 425 said all 85 engines; a simulated 88-engine rendering left it unchanged. The requirement is now owned by generation. Historical 84-engine milestone prose remains historical. Corrected in `2b60824`. |
| RS44 example time was mistranscribed | Candidate `ciphers/rs44.html` line 98 said 1103; printed manual p. 12 uses 1203. Corrected before `08fdf0a`. The minute, digit sum and ciphertext were already 03/17/correct. |
| AMSCO entry broke the README hall table | Candidate line 44 put a four-column cipher-index row inside the three-column Hall III table and displaced its contents. Corrected in `08fdf0a`; all three additions now appear in the actual alphabetical index, with Hall II/IV overview links. |
| Undated AMSCO sorted as year zero | Candidate `comparison.html` numeric comparison coerced `null` to zero. Corrected in `08fdf0a`; actual Year and Era controls put it last in both directions. |
| Independent-answer chronology was overstated | The first procedure document claimed both RS answers predated implementation. The 77-letter RS, 54-letter DK and 57-letter ACA answers were independently reconstructed before the new engines; the 64-letter RS wrap answer was transcribed and separately checked during Phase 2. The corrected document distinguishes these stages. |
| Comparison count prose was stale | At `08fdf0a`, `comparison.html` lines 7, 9, 18, 97 and 99 and the search entry retained 117/160. Corrected in `5217889`; generator derives 120 actual rows and canonical total 167, validates row identities, and owns the heading/metadata/roster copy. |
| Comparison search eyebrow disappears | Nonblocking P3 at `5217889`, as detailed above; nested count spans cause the existing immediate-text extractor to emit `c: '—'`. Description totals remain correct. |

The review initially misclassified the eight delegated legacy controls as inert
because its JSDOM harness omitted the dependency dynamically loaded by
`nav.js`. That assessment was withdrawn after loading `ui-delegates.js` and
exercising their controls. It is not a remaining implementation limitation.

## Source and page checks

Sources were checked in locally rendered research copies and against the
linked publications. Page numbers below are printed page numbers unless a PDF
offset is stated.

| Procedure | Primary evidence inspected | Result |
| --- | --- | --- |
| RS44 | [27 March 1944 manual](https://cryptocellar.org/wmc/schluesselanleitung-zum-rs44.pdf): second addendum, pp. 8–14 and 17–20; complete answers pp. 12–15, Figs. 2/4. Corresponding complete-vector PDF pages are 20–23, 26 and 28. | The indicated cell is included if white; otherwise writing proceeds to the next white cell. Column counting excludes the start only on the initial step, and counts it again after wrap. The engine uses the calculated physical-column readout and ranked extraction, not the later directly selected readout variant. |
| December 1941 Double Playfair | [Provisional manual](https://cryptocellar.org/wmc/schluesselanleitung-dk-1941.pdf), pp. 3–6, §§4, 9–23. | J expands to II; full rows have 17 letters, the final even block is split equally, and odd text gets a non-X filler. Both substitution stages, same-row wrap, reversed lookup/leftward inverse and row reconstruction match this edition. The complete 54-letter answer also exercises the shorter final rows. |
| AMSCO | [ACA specification](https://www.cryptogram.org/downloads/aca.info/ciphers/Amsco.pdf), p. 32. | First row and first column both alternate, including even widths; either starting cell length is allowed. The complete key-41325 example has 57 letters and an incomplete final row. No nulls are appended. |

The RS original example uses beginning `ae/bb`, time 1203 and read rank 19.
The wrap example uses `cc/ac`, minute 21 and read rank 12; its printed `alege`
group contains one L. Both complete ciphertexts constrain the operation.
The independent script embeds their printed strings directly rather than
importing the candidate fixture helper. Its grid was taken from the separate
research transcription and checked for 24 × 25 geometry and ten white cells
per row; this is **not** a claim of a second independent transcription of all
600 cells. The two-square keys and both complete DK ciphertext groups were
checked against the scans. Hand-derived AMSCO width-two checks are
`ABCDEF → ABDCEF` (digraph first) and `ABCDEF → ADEBCF` (single first).

[Fried's contemporary reports](https://cryptocellar.org/wmc/captain-w.j.fried-on-rs44.pdf)
were checked for the historical RS claims: F-49, 20 June 1944, describes planned
1 August introduction; F-64 pp. 10–12 describes supply delays; F-79, 22 August,
describes known-stencil fitting; F-93, 18 September, pp. 1–2 describes
retransmissions, recovered rows, cribs and 36 sliding masks conditional on
known column order. The exhibit preserves those conditions. It does not claim
routine solution of every isolated intercept.

[Ostwald and Weierud's author manuscript](https://cryptocellar.org/pubs/mcts.pdf),
dated 22 October 2021, pp. 2–4, supports the historical Double Playfair account
and distinguishes variants. The exhibit correctly identifies its modern
hill-climbing experiments as Truppenschlüssel results rather than a validation
of the December 1941 engine. ACA's undated sheet supplies no military deployment
or invention date; the AMSCO page does not assign one.

The initial editorial statements were checked against the exact baseline and
recorded replacement strings in `docs/editorial-accuracy-changes.json`, including
recorded file lines. RFC 8439 and the original ChaCha specification support the
64/64 versus 96/32 nonce/counter distinction; RFC 8017 supports separate RSA
encryption/signature schemes. The Iron Mask prose is properly qualified as a
disputed identification. The cited Kahn paper's full text was not independently
accessible in this review, so no claim of checking its complete argument is made.

## Independent calculations and executable checks

The saved [reference comparison script](manual-cipher-independent-reference-check.js)
uses separate procedures derived from the manuals. It obtains candidate output
only for comparison; none of its expected answers is generated by the candidate.

- RS44: 2,400 cases cover all 600 indicated starts, minutes 00/03/25/59 and
  varying lengths 0–200. A separate 600-cell sheet traversal determines writing,
  physical-column selection and ranked extraction. Candidate decryption is also
  compared against the independently calculated ciphertext.
- Double Playfair: all 625 possible pairs with the original squares exercise
  both forward branches and the inverse. Another 101 lengths cover J expansion,
  odd filler, full blocks and shorter final rows. Literal `AA→VR→FY` and
  `FA→TR→VD` checks pin the intermediate stages.
- AMSCO: 1,342 cases cover widths 2–12, both first-cell conventions, lengths
  0–60 and reversed column ranks. A separate column-array construction supplies
  expected encryption; decoding must recover the normalized letters.
- Four complete primary vectors pass encode, decode and trace output. The new
  production property specifications also pass all nine tests, including 250
  random-key trials per engine and malformed-input/state checks.

Reproduced focused checks on `5217889`:

```text
node docs/manual-cipher-independent-reference-check.js
node --test tests/engines/specs/rasterschluessel44.spec.js tests/engines/specs/doublePlayfair.spec.js tests/engines/specs/amsco.spec.js
node tests/test-manual-cipher-exhibits.js
node tests/test-counts.js
node scripts/build-counts.js --check
node tests/test-editorial-claims.js
node tests/test-local-links.js
git diff --check
```

All passed. Local links: 205 HTML files, 6,265 relative links, zero broken.
The real-control JSDOM suite checks complete source answers, both modes,
intermediate animation stages, reduced motion, focus preservation and
valid→invalid→valid recovery. A separate normal-motion harness also checked
Play/Pause state, two timer advances, Reset and input-triggered timer cancellation
and page-hide cancellation for all three pages; that harness is now included in
the saved reference script. It also independently counts rendered comparison
rows and verifies their metadata and search-summary totals. The renderer consumes the registered engine trace and
does not contain a second cipher implementation.

Canonical entries 165–167 are appended to the existing registry with correct
halls, collection membership, trust label and interactive flags. Checks cover
the hall cards, map, comparison, search identities, artifact metadata, workbench,
generic demo configuration, sitemap, service-worker page/script/style registration,
both `STATIC_PAGES` lists and reciprocal contextual links. Generated totals are
167 overall, 147 cipher/history, 17 foundations, three protocols/constructions,
88 engines and 146 interactive exhibits; the comparison subset contains 120.
The baseline 164 number/path/label/note
identities are unchanged. `public/corpus` has no diff against the baseline;
the historical v0.5/100,026-record, 84-engine and 139-page milestone prose remains
historical rather than being rewritten as current inventory.

Representative tested working-tree SHA-256 digests:

| File | SHA-256 |
| --- | --- |
| `js/ciphers/all-engines.js` | `7d7573b8723bb4c902588a16bcf025450128317036d54761cc1019d37a4e4ebe` |
| `js/ciphers/all-engines.min.js` | `0a0de54f53537c728484b4442fe6e93f7dd1761771215b8e8a4c7ef59bccb867` |
| `js/manual-cipher-demos.js` | `84b99d862dc976f26d28d4d7b91d765025a4c98cfd3103ffa76a2b346b49f3ab` |
| `tests/engines/helpers/historical-vectors.js` | `44260cf193daa5fd8e993ad902023fa804fa1425fb0abe7849117694446b145c` |

The evidence JSON contains the full page, registration, integration and test-file
digest list. Full `npm test` passed for the initial editorial snapshot in the
disposable review worktree; it has **not** been rerun in full by this reviewer
for Phase 2. The implementation agent separately reports all 32 suites passing
on `08fdf0a`, with the full rerun on `5217889` still in progress at report time.
It also reports desktop/mobile Chrome vector, control and animation checks plus
cold first-visit offline checks after warming only the home page. Those browser
results, scaling measurements and host CI are implementation-agent validation,
not independently reproduced browser/performance results claimed by this review.

## Final follow-up: 102a2fb

Independently verified `102a2fb01ec71405f6be6518c62710471b4f24b7`. Direct heading
text preserves the existing search extractor; the search `c` field is exactly
`120 Compared Exhibits from the 167-exhibit Collection`. The real table still
renders 120 rows. Count generation freshness/idempotence and real-control UI
checks pass, as do the refreshed four source vectors, 4,468 additional reference
cases and three normal-motion control checks. **No outstanding findings remain
within this review's scope.**

The refreshed [evidence JSON](manual-cipher-independent-evidence-2026-10-10.json)
records working-tree SHA-256 digests; every listed tracked file matches this
commit. Compared with the preserved 521 snapshot, only `comparison.html`,
`js/search-index.json` and `sw.js` changed among the previously hashed files.
Engine, renderer, exhibit and fixture bytes are unchanged. The current evidence
also hashes the count generator, count tests and count-definition document.

The implementation agent now reports 32/32 full suites, desktop/mobile browser
checks and fresh-profile offline first visits passing on 521, plus ten rejected
mutation trials across the two implementation snapshots. These remain separately
attributed implementation validation. Final-head CI is still to run. Review
limitations remain: no independently repeated full Phase 2 suite, browser or
scaling run, and no second independent transcription of all 600 stencil cells.
