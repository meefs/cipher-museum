# Cipher Corpus v0.7 (prepared — not published)

**This dataset has not been published.** There is no Zenodo deposit, no DOI and
no `corpus-v0.7` tag for v0.7. For a citable dataset use **v0.6**:
[10.5281/zenodo.23297920](https://doi.org/10.5281/zenodo.23297920), whose files
are the ones in the parent directory.

v0.7 is derived from the immutable v0.6 archive by
`scripts/build-corpus-v07.js`. It resolves four findings that v0.6 could only
record as errata, because fixing them means changing record bytes.

## Contents

| File | What it is |
|---|---|
| `all.jsonl` | The canonical dataset, 100,313 records. **Not committed** (120MB) — rebuild with `npm run build:corpus:v07`. |
| `cipher-corpus.schema.json` | The v0.7 record schema. |
| `stats.json` | Record counts by source type, split, authenticity, pair status and batch. |
| `excluded-records.json` | The 13 records withdrawn from v0.6, each with the evidence for withdrawal. |
| `change-inventory.json` | Every record that differs from v0.6, with reason codes. |
| `SHA256SUMS.txt` | Checksums for all of the above, including the rebuilt `all.jsonl`. |

## Rebuild and verify

```sh
npm run build:corpus:v07
cd public/corpus/v0.7 && sha256sum -c SHA256SUMS.txt
npm run validate:corpus:v07
```

The generator is deterministic: input order is preserved, record keys are
emitted in a fixed order, and no clock or random source is consulted. A rebuild
that does not match the manifest is a bug.

## What is new in a record

```jsonc
{
  "authenticity": "authentic_artifact",   // what the material is
  "pair_status": "verified_pair",         // whether plaintext/ciphertext correspond
  "verification_method": "engine_replay", // how that was established
  "benchmark_eligible": true,             // true only for a verified pair
  "corpus_version": "0.7",                // the release
  "source_batch": "0.2"                   // the generator batch it came from
}
```

`authenticity` and `pair_status` are independent. A modern teaching
reconstruction can be a perfectly reproducible pair; an authentic historical
artifact often is not one, because reproducing it would need codebooks or
machine settings the museum does not model.

**Benchmarks must filter on `benchmark_eligible`.** 512 of the 100,313 records
are not verified known-answer pairs and scoring a solver against them measures
nothing.

## Known limitations

- 41 historical records remain, of which 31 are `catalogued_unreviewed`: no
  review has independently certified them as authentic transcriptions. The
  label states that rather than implying authenticity.
- Two records (`hist-kryptos-k3-001`, `hist-enigma-barbarossa-001`) pair
  authentic ciphertext with a plaintext covering a different extent. They are
  marked `not_a_pair` and excluded from benchmarks; correcting them needs
  primary-source material that is not available.
- The canonical set covers 7 languages, down from 9. The only Japanese and
  Russian records were among the withdrawn ones; both languages remain in the
  non-canonical `../historical-expanded.jsonl` supplement.

Full detail: [`docs/releases/corpus-v0.7.md`](../../../docs/releases/corpus-v0.7.md).
