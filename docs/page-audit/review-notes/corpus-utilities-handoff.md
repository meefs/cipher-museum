> Review handoff recorded before final integration. The main tracker and final validation record supersede pending integration notes below.

# Items 55–56 handoff

## Exact files read

Public pages: `cipher-corpus.html`, `teaching.html`, `public/reports/benchmark-baselines.html`, `404.html`, `search.html`, `embed.html`, `offline.html`. `corpus-guide.html` and `research.html` do not exist in this checkout; the research case exhibits are separately audited. `public/reports/benchmark-baselines.html` is the only public report HTML.

Supporting implementations/data: `scripts/generate-benchmark-report.js`, `scripts/build-counts.js`, `js/cipher-corpus.js`, `js/nav.js`, `js/demo-loader.js`, shipped `js/demo-loader.min.js` and `js/ciphers/all-engines.min.js` in runtime probes, `sw.js`, `corpus/engine-manifest.json`, `public/corpus/v0.8/stats.json`, `public/corpus/v0.8/supplements-manifest.json`, `public/reports/benchmark-baselines.json`, complete `public/corpus/all.jsonl` and decompressed `public/corpus/v0.8/all.jsonl.gz` for computed counts. Read existing targeted test implementations before running them.

## Changed files

- `404.html`: root-relative local links, stylesheet, icon/manifest and scripts work at nested missing URLs. Existing Caesar phrase is correct: `WKLV SDJH KDV EHHQ ORVW`, shift −3, is `THIS PAGE HAS BEEN LOST`.
- `embed.html`: strict URLSearchParams-based validated identifier now accepts digits after the initial letter; fixes real `rot13` and `m209` embeds. Unknown and invalid names still fail safely.
- `teaching.html`: supplies the navigation elements required by `js/nav.js`; the former empty nav caused immediate return, so the menu/footer companions never initialized. Aligns the UI label with Known Answers, links the corrected v0.8 schema and verification notes, and qualifies historical classroom examples.
- `scripts/generate-benchmark-report.js`: preserves the explicitly versioned v0.6 archive report; marks cipher types with multiple difficulty labels as `mixed` and emits exact distributions, computes public counts directly, removes unsupported CipherBank historical/infrastructure/blind/multilingual comparisons and claims of extending its methodology, clarifies collection sizes are not accuracy comparisons, and links the corrected v0.8 dataset.
- `public/reports/benchmark-baselines.html` and `.json`: regenerated ONLY with `node scripts/generate-benchmark-report.js`. No corpus files or broad metadata generators were written.
- `sw.js`: comments only. They now state cached availability is conditional and that **all** `/public/` requests—including samples and reports—bypass the service-worker cache. No behavior or cache-version modification.

`cipher-corpus.html`, `search.html`, and `offline.html` needed no edits: current counts are correct, search counts canonical integer exhibit identities, and the offline page already says previously visited pages **may** be available. The service worker can supply its self-contained notice for uncached non-public navigations, but not bypassed `/public/` requests. Registration depends on browser support and HTTPS or localhost; installation/cache retention are further prerequisites. A visited page does not guarantee all assets are retained.

## Count evidence and reproducible commands

Run `node tmp/corpus-utilities-verify.js` from the repository root. This reads both complete shipped datasets, groups actual records, asserts v0.8 stats, checks all **85** generated per-cipher rows (counts, splits, and difficulty distributions), loads the shipped engine bundle, checks nested-URL 404 resources, decodes its phrase, executes teaching navigation, and runs seven embed scenarios with the real shipped engine/demo bundles.

Verified output:

```
v0.6: 100326 records, 85 cipher types, 9 languages, 54 historical-labeled records
v0.8: 100313 records, 85 cipher types, 7 languages, 41 historical-labeled records
engines: 88
reportCipherRowsChecked: 85
caesar404: THIS PAGE HAS BEEN LOST
embedCases: 7
teachingNavigation: initialized
```

Embed cases: caesar, rot13, m209, vigenere, railFence, unknownCipher and encoded `<script>` input. Valid cases produce actual controls, unknown case produces its message, invalid input never gets `data-cipher`.

Run `node -e "console.log(require('./scripts/build-counts').computeCounts())"` (read-only). Verified: total 172 = cipherHistory 152 + foundations 17 + protocols 3; 13 halls; 88 registered engines. Registry collection names remain `protocols` even though the three new research case exhibits are separate from the established protocol exhibits. Do not reinterpret that arithmetic as a count of cipher algorithms. Root owns the 214-public-HTML inventory/coverage.

The v0.8 supplement manifest confirms 87 historical-supplement entries = 42 canonical (41 historical + 1 reclassified synthetic) + 45 supplemental-only, with 13 withheld. The evaluation export is 300 records. No historical pair is authenticated by these counts or by an engine replay.

## Targeted test results

All commands exited 0:

- `node tests/test-search.js`: “Search normalization, partial matching, era-token boundaries, and URL state passed.”
- `node tests/test-sw-offline-fallback.js`: “Offline fallback: uncached notice, visited exhibit, and nested-path assets verified.”
- `node tests/test-corpus-browser-v08.js`: “v0.8 browser sample matches the shipped corpus and labels historical limitations.” Includes equality of all 104 sample records with shipped v0.8 gzip.
- `node tests/test-benchmark-runner.js`: public and blind split isolation, stub solver scores 0/1, reproducibility receipt/report generation; “benchmark runner test passed.”
- `node tmp/corpus-utilities-verify.js`: exact results above. The initial temporary harness expected 16 navigation links but the actual documented menu has 8 primary + 7 mobile links; correcting that harness expectation to 15 passed. No product issue was hidden.

## Limits / coordination

JSDOM and mocked SW fetch/cache behavior are not a full browser service-worker/storage test. Root owns the final 214-page renderer and bundle/version checks. This work does not measure solver accuracy or independently authenticate historical corpus provenance. CipherBank size figures were retained from the existing reviewed material; unsupported broader comparisons were removed. No new external-research claim was added.

Bibliography agent owns the `js/cipher-corpus.js` ebook-link guard and associated targeted test; no archived provenance data should be rewritten. All changes remain uncommitted. No git commit, push or deployment performed.
