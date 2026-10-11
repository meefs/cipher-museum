# Publishing Cipher Museum software

## Release identity

Cipher Museum `v1.0.0` is the initial GitHub/Zenodo software release. The
version DOI is [10.5281/zenodo.23298941](https://doi.org/10.5281/zenodo.23298941),
and the concept DOI for all Cipher Museum software versions is
[10.5281/zenodo.23298940](https://doi.org/10.5281/zenodo.23298940). Do not use
either Cipher Corpus dataset DOI as a software identifier.

The published tag is `v1.0.0`. The repository had no earlier software tags or
GitHub Releases, and `package.json` identified the application as `1.0.0`
throughout its recorded history. The `corpus-v0.5` and `corpus-v0.6` tags belong
to the separately versioned dataset and do not establish a software version
line.

## Archive identities

Three related resources must remain distinct:

1. **Live museum:** <https://ciphermuseum.com> is the continuously deployed
   website and may advance beyond an archived release.
2. **Software archive:** the published `v1.0.0` GitHub Release triggered the
   enabled Zenodo GitHub integration. Zenodo archived it under version DOI
   [10.5281/zenodo.23298941](https://doi.org/10.5281/zenodo.23298941) and
   software concept DOI
   [10.5281/zenodo.23298940](https://doi.org/10.5281/zenodo.23298940).
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
  describes the software, cites the published software version DOI, and
  includes the published dataset only as a reference.
- `public/corpus/README.md` and `docs/CORPUS_PUBLISHING.md` remain authoritative
  for citing and interpreting the dataset.

`.zenodo.json` intentionally omits a DOI, release date, and version so future
GitHub releases receive their own Zenodo-supplied values. `CITATION.cff`
records the published v1.0.0 DOI, release date, tag artifact, and release
commit. `.zenodo.json` also omits `language`, keeping the file within Zenodo's
legacy GitHub-ingestion schema.

## Git LFS and the generated source archive

`public/corpus/all.json` and `public/corpus/all.jsonl` are tracked through Git
LFS. The Git tree contains 134-byte pointers whose declared payload sizes are
132,249,188 and 103,772,164 bytes respectively. The published Zenodo software
archive `systemslibrarian/cipher-museum-v1.0.0.zip` was inspected on 2026-10-11;
its MD5 is `39d4fb50272eb3cf37adb92220649df5`, and both archive members are the
134-byte pointers, not dataset records.

For this software release, keep that separation: the GitHub/Zenodo software
archive contains the source tree and LFS pointers, while the canonical archived
dataset is downloaded from the dataset DOI above. A normal Git clone with Git
LFS can also fetch the repository payloads.

GitHub does not expose the archive-LFS option through its supported repository
API. The archived result confirms that LFS objects were not embedded for this
release. Enabling **Repository Settings → General → Archives → Include Git LFS
objects in archives** in the future would duplicate more than 236 MB of corpus
payloads into the software archive, consume Git LFS bandwidth, and blur the
software/dataset licensing boundary.

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

## v1.0.0 publication receipt

The release was published from main commit
`5ca041200b26dc2447dcae72cb63f051dca8064c` through
[PR #7](https://github.com/systemslibrarian/cipher-museum/pull/7). The annotated
`v1.0.0` tag peels to that commit. Publishing the GitHub Release triggered the
enabled Zenodo integration; merely pushing the tag did not.

Zenodo verification confirmed:

1. Resource type Software, version `v1.0.0`, and publication date 2026-10-11.
2. Creator Paul A. Clark with ORCID `0009-0004-2394-0991`.
3. MIT license and the dataset relation `isSupplementedBy`.
4. Software version DOI `10.5281/zenodo.23298941` and software concept DOI
   `10.5281/zenodo.23298940`, distinct from both corpus DOIs.
5. One 44,195,984-byte source ZIP with checksum
   `md5:39d4fb50272eb3cf37adb92220649df5`; its large corpus JSON/JSONL members
   are Git LFS pointers.

For a future software release, update the version and release notes, validate
main, then create an annotated version tag and publish the matching GitHub
Release:

```bash
git fetch origin
git switch main
git pull --ff-only origin main
git tag -a vNEXT -m "Cipher Museum vNEXT"
git push origin vNEXT
gh release create vNEXT \
  --repo systemslibrarian/cipher-museum \
  --verify-tag \
  --title "Cipher Museum vNEXT" \
  --notes-file docs/releases/vNEXT.md
```

Publishing that GitHub Release will trigger the enabled Zenodo integration.
Verify the resulting metadata and source archive, then record the new version
DOI without replacing the corpus DOI badge or corpus citation.
