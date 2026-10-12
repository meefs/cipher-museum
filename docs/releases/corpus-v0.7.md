# Cipher Corpus v0.7 — release notes (tagged, awaiting archive)

**Status: tagged in the repository; not yet archived.** The source commit is
tagged `corpus-v0.7`, so the dataset is reproducible from a fixed point. **No
Zenodo deposit exists for v0.7 and no DOI has been reserved or assigned.**

Cite v0.6 ([10.5281/zenodo.23297920](https://doi.org/10.5281/zenodo.23297920))
until a v0.7 DOI is issued. v0.6 remains published, unchanged, and served from
`public/corpus/`; nothing about it was replaced.

v0.7 resolves the four dataset findings that v0.6 could only mitigate, because
correcting them requires changing record bytes and the v0.6 archive is
immutable. It is derived from v0.6 by `scripts/build-corpus-v07.js`, which never
writes to the v0.6 files.

## Before and after

| | v0.6 | v0.7 |
|---|---|---|
| Canonical records | 100,326 | **100,313** |
| Historical records | 54 | **41** |
| Synthetic records | 100,272 | 100,272 |
| Cipher-type labels | 85 | 85 |
| Languages (canonical) | 9 | **7** |
| Records with duplicate tags | 484 | **0** |
| Records whose length fields match a stated contract | undefined | **100,313** |
| Records marked benchmark-eligible | not expressible | **99,801** |

13 records were withdrawn and 84,002 changed. Every changed record is listed in
[`public/corpus/v0.7/change-inventory.json`](../../public/corpus/v0.7/change-inventory.json).

## What changed, and why

### CM-002 — historical records and reconstructions

The v0.6 review catalogued five incomplete matched pairs and eleven declared
reconstructions. Those two lists overlap in `hist-enigma-barbarossa-001`, so
they cover **15 distinct records, not 16**.

Auditing all 54 historical records found a larger problem than the review
recorded. **13 records carry a ciphertext whose letters are all distinct** (20
or more letters), or which is a contiguous run of the alphabet. Real ciphertext
of that length is essentially never like that: the uniform probability of 26
distinct letters is about 6.6e-11, of 25 about 1.7e-9 — and **none of the
100,272 synthetic records in v0.6 shows the signature**. These are placeholders,
not transcriptions. Eight of the 13 were not catalogued by any previous review:
`hist-jefferson-wheel-001`, `hist-m94-wwii-001`, `hist-diana-cia-001`,
`hist-geheimschreiber-001`, `hist-kl7-nato-001`, `hist-fialka-001`,
`hist-wheatstone-1867-001`, `hist-copiale-2011-001`.

All 13 are **withdrawn** from the canonical set and listed with their evidence
in [`excluded-records.json`](../../public/corpus/v0.7/excluded-records.json).
They were not re-encrypted into place: generating a replacement ciphertext with
a seeded pedagogical engine would produce a synthetic exercise wearing a
historical title. Their IDs are retired, not reused, and the records remain in
the immutable v0.6 archive.

**`hist-kryptos-k1-001` is corrected rather than withdrawn.** v0.6 stored the
first 32 characters of K1 against a 63-character plaintext, and named `KRYPTOS`
— the alphabet keyword — as the Vigenère key. v0.7 stores the full 63-character
ciphertext with keyword `PALIMPSEST`. Verified two ways: the CIA's own Kryptos
page shows Panel 1 beginning with exactly those 63 characters followed by
`VFPJUDEEH…` (the start of K2), and decrypting them on the KRYPTOS-keyed
alphabet reproduces the stored plaintext exactly, misspelling included. The
test suite redoes that decryption rather than trusting the stored bytes.

**`hist-kryptos-k3-001` and `hist-enigma-barbarossa-001` are classified, not
corrected.** Both pair authentic ciphertext with a plaintext covering a
different extent. Restoring either needs material no available primary source
provides — the CIA page publishes unlabelled panel ciphertext and no plaintext —
so they are marked `not_a_pair` and excluded from benchmarks instead of being
altered. Reconstructing the missing text from memory is not evidence.

Every record now carries three new fields:

- `authenticity` — `authentic_artifact`, `authentic_excerpt`, `reconstruction`,
  `catalogued_unreviewed`, or `synthetic`.
- `pair_status` — `verified_pair`, `unverified_pair`, or `not_a_pair`.
- `benchmark_eligible` — true only for a verified pair.

The two axes are independent: a teaching reconstruction can be a perfectly
reproducible pair, and an authentic artifact often is not one. `verification_method`
records how a pair was established (`engine_replay` or `documented_computation`),
so tooling that drives the museum engines can filter to what it can execute.

`catalogued_unreviewed` carries forward the v0.6 review's own default wording
for the 31 historical records no review has certified. It states the absence of
certification instead of implying authenticity.

### CM-008 — length conventions

`text_length` and `normalized_text_length` now have one definition, in
[`scripts/corpus-text-metrics.js`](../../scripts/corpus-text-metrics.js), shared
by the generator, the validator and the reports:

- **`text_length`** — Unicode code points in the plaintext after NFC
  normalization, every character as written.
- **`normalized_text_length`** — NFD normalize, drop combining marks, then count
  code points in Unicode categories L and N.

Both derive from `plaintext` alone, so a cipher that expands its output cannot
change the measured length of the message. Counting is by code point, not UTF-16
unit. Normalization happens before filtering, never after. Cipher-specific
preparation (J→I folding, digraph padding) is out of scope. `text_length >=
normalized_text_length` is enforced.

In v0.6, `text_length` equalled a raw plaintext length in 17,211 records and a
raw ciphertext length in 97,495. **83,918 records needed correction.**

### CM-014 — repeated tags

The 484 affected records were confirmed, all in generator batch `0.2`.
Duplicates are removed deterministically, keeping first-use order. **Every v0.7
record has unique tags, whatever batch it came from**, and the schema declares
`uniqueItems`.

The compatibility exception is now scoped to the dataset, not the record. The
0.6 contract tolerates the duplicates because those bytes are frozen; the 0.7
contract rejects them for any record. A historical batch label can no longer
wave a record past validation.

### CM-020 — evaluation wording

The v0.7 schema describes `split` accurately: both labels are published and
downloadable, and neither is secret or withheld. The description does not repeat
the retired phrasing, so a consumer rendering it never sees the misleading
claim; the exact archived wording stays in
[`docs/CORPUS-V06-ERRATA.md`](../CORPUS-V06-ERRATA.md), which the v0.7 schema
points to.

## Compatibility

Breaking and material changes for anyone consuming the dataset:

1. **13 IDs are gone.** Pin v0.6 if you need them.
2. **Japanese and Russian leave the canonical set.** The only `ja` and `ru`
   records were three of the withdrawn ones. Both languages remain available in
   the non-canonical `historical-expanded.jsonl` supplement.
3. **`verified` changed meaning.** In v0.6 it was a generator flag that
   certified nothing. In v0.7 it equals `benchmark_eligible`. Code that read it
   as provenance must move to `authenticity`.
4. **`dataset_version` is now the release (`0.7`) for every record.** The old
   per-batch label moved to `source_batch`. This matters because the old field
   never ordered releases: `2.0` was batches 2 and 3, older data than `0.6`.
5. **Length fields changed in 83,918 records.** Anything that cached or
   recomputed them should re-read.
6. **Benchmarks must filter on `benchmark_eligible`.** 512 records are not
   verified pairs and must not be scored as known-answer items.

## Reproducing this release

```sh
npm ci
npm run build:corpus:replay-status   # optional: regenerates the replay evidence
npm run build:corpus:v07             # writes public/corpus/v0.7/
cd public/corpus/v0.7 && sha256sum -c SHA256SUMS.txt
npm run validate:corpus:v07
```

The canonical `all.jsonl` is 120MB and is not committed; it is rebuilt from the
immutable v0.6 archive and verified against the committed manifest. CI performs
exactly these steps on a clean checkout, so a non-deterministic generator fails
the build rather than shipping.

## Publication status

Done:

1. **Tagged `corpus-v0.7`** on `main`, so the Zenodo deposit has a fixed source
   commit to cite — the same thing `corpus-v0.6` records.

Outstanding, and requiring Zenodo credentials this repository does not hold:

2. Reserve a Zenodo **dataset** version DOI under the existing dataset concept
   DOI [10.5281/zenodo.23297919](https://doi.org/10.5281/zenodo.23297919).
3. Upload `all.jsonl` plus the manifest files, and confirm every digest against
   `public/corpus/v0.7/SHA256SUMS.txt`. Build the bytes with
   `npm run build:corpus:v07`; they are not committed.
4. Record the issued DOI in `CITATION.cff`, `docs/CORPUS_PUBLISHING.md`, this
   file, and the website citation surfaces — **after** it is issued, never before.

**Do not create a GitHub release for a dataset version.** An active Zenodo
webhook on this repository fires on `release` events and would mint a new
*software* DOI from `.zenodo.json`, which describes the software, not the
corpus. Both existing dataset versions are annotated tags with no GitHub
release; the dataset deposits were made directly on Zenodo. This release
follows that convention.
