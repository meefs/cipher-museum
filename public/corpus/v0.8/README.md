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
v0.6 browser and other file-format buttons on the website remain explicitly
versioned; they are not interchangeable with this corrected download.
