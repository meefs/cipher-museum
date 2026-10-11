# Publishing Cipher Corpus v0.6

The repository contains the v0.6 dataset and reproducible generator. External
Zenodo/Hugging Face publication is a separate step; do not claim a DOI or mirror
has been updated merely because repository tests pass.

## Repository release checklist

1. Run `npm run validate:corpus`, `node tests/test-corpus-v06.js`,
   `npm run test:engines`, and the full `npm test` suite.
2. Run `sha256sum -c SHA256SUMS.txt` from `public/corpus`.
3. Verify the Git LFS objects for `all.json` and `all.jsonl` are uploaded.
4. Create a new `corpus-v0.6` tag/release only on the verified commit; never
   move `corpus-v0.5`. Use the v0.6 changelog entry and disclose the unchanged
   526 known-deviation records and deferred supplemental merge.

## Zenodo and Hugging Face

Zenodo repository archives may contain LFS pointers. Attach the actual dataset
files and checksums as release assets before calling an archive self-contained.
For Hugging Face, upload the canonical exports, evaluation prompts, checksums,
statistics and dataset README; retain per-record licensing and document split
labels accurately. Update DOI and mirror links only after publication succeeds.

## Scope

v0.6 adds 300 synthetic RS44, German Double Playfair and AMSCO exercises to the
100,026-record baseline: 100,326 records across 85 cipher-type labels. The older
1,710 Arabic and 45 historical supplemental records remain outside canonical
replay; merging them is deferred. The baseline prefix hash in `stats.json`
proves previous records and split assignments remain unchanged.
