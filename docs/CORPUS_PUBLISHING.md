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

## Corpus v0.7 (prepared, not published)

v0.7 is built in `public/corpus/v0.7/` and resolves the four findings v0.6 could
only record as errata. It has **no Zenodo deposit, no DOI and no tag**. v0.6
remains the published, citable dataset and the one the website serves; its files
and checksums are untouched.

Release notes and the full before/after accounting:
[`releases/corpus-v0.7.md`](releases/corpus-v0.7.md).

Website download links, the corpus page's counts and the citation surfaces still
describe v0.6 deliberately. They change only when v0.7 is actually published, so
the site never advertises a dataset that has no DOI behind it.

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
