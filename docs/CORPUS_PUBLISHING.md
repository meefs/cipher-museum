# Publishing Cipher Corpus v0.6

## Published archive

Cipher Corpus v0.6 was published on Zenodo on 2026-10-11:

- **Version DOI:** [10.5281/zenodo.23297920](https://doi.org/10.5281/zenodo.23297920)
- **Concept DOI:** [10.5281/zenodo.23297919](https://doi.org/10.5281/zenodo.23297919)
- **Creator:** Paul A. Clark
- **ORCID:** [0009-0004-2394-0991](https://orcid.org/0009-0004-2394-0991)
- **Source commit:** `43845a38ef35c94f1ac01cb403b3e982a3401e89`

Use the version DOI for reproducible citations to v0.6. The concept DOI is for
links intended to follow the evolving dataset across versions.

The deposit contains 12 files. `all.jsonl` is the canonical archived dataset
format; the other files provide the schema, 300-record v0.6 subset, evaluation
prompts, statistics, record-license summary, citation and rights metadata,
documentation, changelog, and checksums. The website's derived JSON and CSV
exports, difficulty subsets, browser sample, and separate supplements are not
part of the Zenodo v0.6 deposit.

## Rights and scope

The Zenodo record uses CC0 1.0 for the synthetic records. The 54 canonical
historical records retain their per-record public-domain assertions, source
attribution, and provenance; CC0 is not newly asserted over underlying
historical source material.

v0.6 adds 300 synthetic RS44, German Double Playfair, and AMSCO exercises to
the 100,026-record baseline: 100,326 canonical records across 85 cipher-type
labels. The older 1,710 Arabic and 45 historical supplemental records remain
outside canonical replay and were not deposited as canonical v0.6 records.

Both `public` and `blind` split labels are downloadable. “Blind” is a split
designation, not confidential held-out data.

## Repository and mirrors

The Zenodo dataset deposit was published independently of a GitHub release.
No existing release tag was moved, and no `corpus-v0.6` tag is implied by the
Zenodo publication.

The Hugging Face mirror has not been updated for v0.6. Do not claim that it has
been updated until its files and metadata have been independently verified.

## Corpus v0.7 (tagged, not yet archived)

v0.7 is built in `public/corpus/v0.7/` and resolves the four findings v0.6 could
only record as errata. Its source commit is tagged **`corpus-v0.7`**; it has
**no Zenodo deposit and no DOI**, so it is not yet citable. v0.6 remains the
published, citable dataset and the version the on-page browser samples; its
files and checksums are untouched.

Dataset versions are tagged but **never released on GitHub**. The Zenodo webhook
on this repository is active on `release` events and would mint a *software* DOI
from `.zenodo.json`; a dataset deposit is made directly on Zenodo instead. That
is how v0.5 and v0.6 were handled and how v0.7 must be.

Release notes and the full before/after accounting:
[`releases/corpus-v0.7.md`](releases/corpus-v0.7.md).

The original website downloads, page counts, and citation surfaces still describe
v0.6. They must not be silently reassigned to a different dataset version.

## Corpus v0.8 (corrected website download; no DOI)

The site also offers a separately labeled, complete
[`all.jsonl.gz`](../public/corpus/v0.8/all.jsonl.gz) download derived from v0.7.
It corrects the 1,072 Two-square known-answer pairs using the museum's current
American Cryptogram Association rectangle rule. Read the
[v0.8 release notes](releases/corpus-v0.8.md) and verify the digest in
[`SHA256SUMS.txt`](../public/corpus/v0.8/SHA256SUMS.txt) before comparing results.
Serving a downloadable file on GitHub Pages is not a Zenodo deposit; no v0.8
DOI has been issued. The v0.6 citation on the page applies only to v0.6, not
the newer download.

## Future release checklist

1. Run `npm run validate:corpus`, the version-specific corpus regression test,
   `npm run test:engines`, and the full `npm test` suite.
2. Run `sha256sum -c SHA256SUMS.txt` from `public/corpus`.
3. Verify Git LFS objects and all downloadable files contain payload data, not
   pointer text.
4. Prepare a self-contained archive with a manifest covering exactly the files
   deposited.
5. Reserve the next version DOI, update citation metadata, and publish only
   after file checksums and rights metadata are verified.
6. Add the published version DOI to repository and website citation surfaces;
   use the concept DOI only for version-independent links.
