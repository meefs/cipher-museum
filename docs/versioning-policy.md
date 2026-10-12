# Cipher Corpus Versioning Policy & Archive Infrastructure (v0.3)

## Versioning Policy
- All corpus and schema changes are versioned using semantic versioning (MAJOR.MINOR.PATCH)
- Each version is documented in the changelog
- Deprecated fields and breaking changes are announced in advance

## Dataset layout from v0.7

A published dataset version is never edited in place. v0.6 remains exactly where
it was published, at the root of `/public/corpus/`, with its own
`SHA256SUMS.txt`. Each later version lives in its own directory
(`/public/corpus/v0.7/`) with its own schema, stats, exclusions, change
inventory and checksum manifest, so a reader can fetch one version without
inheriting another's bytes and the published checksums keep verifying.

Dataset versions are tagged `corpus-vX.Y` and are independent of the software
version, which is tagged `vX.Y.Z`. They are published as separate Zenodo
deposits under separate concept DOIs.

## Archive Infrastructure
- Old schema and corpus versions are stored in `/public/corpus/archive/`
- Each archived file is named with its version (e.g., `cipher-corpus.schema.v0.2.json`)
- Reports and receipts are retained for all published runs

## Access
- Users can browse and download archived versions for reproducibility and research

---

This ensures long-term stability and transparency for all users and contributors.
