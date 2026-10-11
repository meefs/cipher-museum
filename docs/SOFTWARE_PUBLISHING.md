# Publishing Cipher Museum software

## Release identity

Cipher Museum `v1.0.0` is the initial GitHub/Zenodo software release. The
release source intentionally contains no software DOI or software concept DOI:
Zenodo assigns those identifiers only after it processes the published GitHub
Release. Do not use either Cipher Corpus dataset DOI as a software identifier.

The recommended tag is `v1.0.0`. The repository has no earlier software tags
or GitHub Releases, and `package.json` has identified the application as
`1.0.0` throughout its recorded history. The existing `corpus-v0.5` tag belongs
to the separately versioned dataset and does not establish a software version
line. The current corpus is v0.6; it was published independently without a
`corpus-v0.6` Git tag.

## Archive identities

Three related resources must remain distinct:

1. **Live museum:** <https://ciphermuseum.com> is the continuously deployed
   website and may advance beyond an archived release.
2. **Software archive:** publishing the `v1.0.0` GitHub Release will trigger the
   enabled Zenodo GitHub integration and create a new software record. Zenodo
   will assign that record's DOI; none is known before publication.
3. **Dataset archive:** Cipher Corpus v0.6 is already published under version
   DOI [10.5281/zenodo.23297920](https://doi.org/10.5281/zenodo.23297920) and
   concept DOI [10.5281/zenodo.23297919](https://doi.org/10.5281/zenodo.23297919).
   The version DOI is the reproducible dataset reference used by this software
   release.

The software uses the repository's MIT License. Synthetic corpus records are
CC0 1.0, while historical records retain their per-record public-domain
assertions and provenance. MIT does not relicense the dataset, third-party
works, or underlying historical source material.

## Metadata authority

Zenodo's GitHub integration gives `.zenodo.json` precedence when both it and
`CITATION.cff` are present. The roles here are intentional:

- `.zenodo.json` is the authoritative Zenodo ingestion metadata. It declares a
  software record, creator Paul A. Clark and ORCID
  `0009-0004-2394-0991`, open access, Zenodo license identifier `mit`, and an
  `isSupplementedBy` relationship to the v0.6 dataset. The version is omitted
  from this override so Zenodo uses the exact GitHub Release tag, `v1.0.0`.
- `CITATION.cff` drives GitHub's citation UI and other CFF-aware clients. It
  describes the software and includes the published dataset only as a
  reference.
- `public/corpus/README.md` and `docs/CORPUS_PUBLISHING.md` remain authoritative
  for citing and interpreting the dataset.

Neither metadata file includes a software DOI or release date before the
release exists. `.zenodo.json` also omits `language`, keeping the file within
Zenodo's legacy GitHub-ingestion schema.

## Git LFS and the generated source archive

`public/corpus/all.json` and `public/corpus/all.jsonl` are tracked through Git
LFS. The Git tree contains 134-byte pointers whose declared payload sizes are
132,249,188 and 103,772,164 bytes respectively. A generated GitHub source
archive of main commit `310aa876197ea366db3a1c0392040c6cf0e49cfc` was inspected
on 2026-10-11; both archive members were the 134-byte pointers, not dataset
records.

For this software release, keep that separation: the GitHub/Zenodo software
archive contains the source tree and LFS pointers, while the canonical archived
dataset is downloaded from the dataset DOI above. A normal Git clone with Git
LFS can also fetch the repository payloads.

GitHub does not expose the archive-LFS option through its supported repository
API. Immediately before publishing, an administrator should open
**Repository Settings → General → Archives** and confirm **Include Git LFS
objects in archives** remains unchecked. Enabling it would duplicate more than
236 MB of corpus payloads into the software archive, consume Git LFS bandwidth,
and blur the software/dataset licensing boundary.

## Validation before release

From a clean checkout of the intended release commit, using Node 22:

```bash
npm ci
npm run validate:release
npm run validate:corpus
node tests/test-corpus-v06.js
npm test
npm run lint:html
npm run build:search-index -- --check
git lfs fsck
(cd public/corpus && sha256sum -c SHA256SUMS.txt)
```

Also validate `CITATION.cff` with a CFF 1.2 validator and validate
`.zenodo.json` against Zenodo's legacy deposit JSON Schema.

## Release procedure

Once main is green and the LFS archive setting has been confirmed:

```bash
git fetch origin
git switch main
git pull --ff-only origin main
git tag -a v1.0.0 -m "Cipher Museum v1.0.0"
git push origin v1.0.0
gh release create v1.0.0 \
  --repo systemslibrarian/cipher-museum \
  --verify-tag \
  --title "Cipher Museum v1.0.0" \
  --notes-file docs/releases/v1.0.0.md
```

Publishing the GitHub Release—not merely pushing the tag—will trigger the
enabled Zenodo integration. Afterward:

1. Wait for Zenodo to finish processing the release.
2. Verify that the new record is resource type Software, version `1.0.0`,
   creator Paul A. Clark with the correct ORCID, and MIT licensed.
3. Confirm the dataset is listed as a related dataset with relation
   `isSupplementedBy`, not as the software's DOI.
4. Inspect the archived source file and its LFS members.
5. Record the new software version DOI and software concept DOI in a follow-up
   commit. Do not replace the corpus DOI badge or corpus citation with them.
