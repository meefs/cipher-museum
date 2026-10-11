# Cipher Corpus v0.6 errata and verification scope

The published v0.6 record at [Zenodo](https://doi.org/10.5281/zenodo.23297920)
is immutable. This errata does not rewrite its 100,326 canonical records.

The `verified` boolean in v0.6 is a legacy generation/reviewer flag. It does
not certify that a record is an authentic historical cryptogram, that the
nearby source supports every field, or that plaintext and ciphertext form an
independently reproduced known-answer pair. Historical records remain useful
as catalogued teaching exercises, but record-level provenance must be reviewed
before quoting or redistributing source material.

Five historical entries are known not to be complete matched pairs. Counts
below are Latin letters after spaces and punctuation are removed:

- `hist-enigma-barbarossa-001`: 26 plaintext letters and 15 ciphertext letters.
- `hist-enigma-weather-001`: 29 plaintext letters and a 21-letter illustrative ciphertext containing a literal alphabet fragment.
- `hist-lorenz-fish-001`: 25 plaintext letters and 26 ciphertext letters.
- `hist-kryptos-k1-001`: 63 plaintext letters paired with only the first 32 K1 ciphertext letters.
- `hist-kryptos-k3-001`: 96 plaintext letters paired with the full 237-letter K3 ciphertext.

Several additional records explicitly describe themselves as reconstructed
rather than quoted historical messages. The complete machine-readable review
scope, defect list, and reconstruction IDs are in
[`data/corpus-historical-review.json`](../data/corpus-historical-review.json).
Kryptos section boundaries can be checked against the
[CIA's official Kryptos page](https://www.cia.gov/legacy/headquarters/kryptos-sculpture/).

Two legacy field conventions also need care when analysing the archive:

- `text_length` and `normalized_text_length` were populated by more than one
  generation path and are not a single comparable unit across every historical
  corpus release. The live benchmark report therefore recomputes letter/number
  counts from `plaintext` instead of aggregating either field.
- 484 pre-v0.6 records contain a repeated tag. The duplicate value has no
  semantic meaning. The 300 v0.6 additions do not contain repeated tags, and
  the current validator rejects them for newly generated v0.6 records.

Corrections to canonical record fields belong in a future corpus release so
that v0.6 citations and checksums remain reproducible.
