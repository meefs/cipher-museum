# Cipher Corpus v0.8 — corrected full download

The complete 100,313-record corpus is [`all.jsonl.gz`](all.jsonl.gz), a
compressed UTF-8 JSON Lines file served by the website. This version has no
Zenodo deposit or DOI as of 22 October 2026. The published, citable v0.6
archive and the prepared v0.7 tag are unchanged. A v0.8 link must never be
cited with the v0.6 DOI.

## Changes from v0.7

- All 1,072 synthetic Two-square pairs were recalculated with the American
  Cryptogram Association's horizontal rectangle rule. 1,071 ciphertexts
  changed; one already matched by chance. Keys and plaintexts did not change.
- Five unsupported historical source links have `source_provenance.url: null`
  and an explicit `citation_erratum` containing the old URL, its former label,
  and why it was retired. One link leads to a different work; four returned 404
  in the 22 October 2026 link audit. Their historical claims and pairs have
  **not** been authenticated by substituting a related reading link.
- Every record carries `dataset_version` and `corpus_version` `0.8`. Other
  v0.7 records and fields remain unchanged.

The ACA's [Two-square reference](https://www.cryptogram.org/downloads/aca.info/ciphers/TwoSquare.pdf)
defines the convention; the [link audit](../../../docs/LINK_AUDIT.md) records
the source-link evidence. Compare individual changes in
[`change-inventory.json`](change-inventory.json) and aggregate counts in
[`stats.json`](stats.json). `SHA256SUMS.txt` checks the downloadable gzip,
schema, statistics and inventory. The SHA-256 of the generated uncompressed
JSONL is `stats.json`'s `raw_jsonl_sha256`.

## Use and verification

From this directory:

```sh
sha256sum -c SHA256SUMS.txt
gunzip -k all.jsonl.gz
sha256sum all.jsonl
```

The last digest should equal `raw_jsonl_sha256` in `stats.json`. To rebuild
exactly from the immutable v0.6 archive, run at repository root:

```sh
npm run build:corpus:v07
npm run build:corpus:v08
npm run build:corpus:v08 -- --check
npm run validate:corpus:v08
```

The builder emits `all.jsonl` locally; it is deliberately ignored by Git.
The committed 9 MB gzip is the **full** dataset, not a delta file. Use the
[`cipher-corpus.schema.json`](cipher-corpus.schema.json) record schema and
filter on `benchmark_eligible` for reproducible known-answer pairs. The older
v0.6 file-format buttons on the website remain explicitly versioned; they are
not interchangeable with this corrected download. The on-page browser now
uses a corrected v0.8 sample.

## Versioned supporting downloads

- [Historically themed supplement](historical-supplement.jsonl): 87 entries
  retained from the older 100-entry supplement after 13 historical records
  requiring source review were removed. Of the 87, 42 have canonical v0.8 IDs (41
  historical, one Enigma example reclassified synthetic). The remaining 45
  are supplemental-only, marked `legacy_unreviewed` and
  `benchmark_eligible: false`; their old `verified` flag is archived under
  `legacy_verified_flag` and replaced by `verified: false`. Aeneas's wrong
  Gutenberg citation is retired, with the former URL in `citation_erratum`.
  The canonical Beale record already has the equivalent v0.8 correction.
  An October 22 source review corrected demonstrably wrong links and
  distinguished contextual passages from generated teaching pairs. Its 45
  supplemental-only records have 13 checked contextual passages, 27 linked
  full texts unavailable to this review, four unchecked citations, and one
  specific historical claim not substantiated. None has an exact original
  plaintext/ciphertext source; all remain unverified and benchmark-ineligible.
  Former claims that linked works were public domain are retained as legacy
  metadata, while rights to those works are marked `not_assessed`.
  Five examples (Ge'ez, rail fence, straddling checkerboard, generic Two-square
  and Beale-inspired homophonic) are now labeled modern reconstructions rather
  than historical source pairs; their previous classification is retained as
  legacy metadata.
- [LLM three-shot evaluation export](llm-3shot-eval.jsonl): 300 prompts
  retained from the old export. All three Two-square prompt records now use
  the corrected v0.8 examples and challenges. Sixty-two prompts for
  fixed-convention ciphers no longer ask learners to recover a nonexistent
  `value=null` key. All 300 prompt records and 1,200 source/example pair uses
  were checked against the canonical v0.8 download and replayed through the
  current engines. These public fixtures are not a blind held-out benchmark;
  exact-string scoring of a key may reject an equivalent valid key.

The [supplemental-pair replay audit](../../../data/corpus-v0.8-supplement-replay-audit.json)
reports 42 of the 45 supplemental-only pairs matching the museum engines in
both directions. `hist-geez-001` and `hist-homophonic-001` fail in both
directions; `hist-foursquare-001` decodes as stored but re-encodes differently.
An engine match shows only that a teaching calculation reproduces. It does
not authenticate a historical artifact or promote a pair into a benchmark.

The [supplement manifest](supplements-manifest.json) records the counts,
lineage, and caveats. Check the
[supplement SHA-256 list](supplements-SHA256SUMS.txt) separately from the
complete-corpus checksum list. These supporting downloads are not an
authenticated historical archive or a replacement for the full corpus. To
regenerate and check them from the immutable v0.6 source and corrected v0.8
download:

```sh
node scripts/build-corpus-v08-supplements.js
node scripts/build-corpus-v08-supplements.js --check
node tests/test-corpus-supplements.js
node tests/test-corpus-supplement-replay.js
node tests/test-corpus-eval-v08.js
```
