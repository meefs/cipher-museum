# Cipher Corpus v0.8 — corrected website download

**Status (22 October 2026):** A complete compressed JSONL download is served
from the museum website. It has **no Zenodo deposit or DOI**. The published
[v0.6 archive](https://doi.org/10.5281/zenodo.23297920) remains a distinct,
unchanged dataset; the prepared, tagged v0.7 files and checksums are also
unchanged. Cite the v0.6 DOI only when using v0.6 data.

## What changed

v0.8 is derived from v0.7 and contains **100,313 canonical records**. It
corrects the `two_square` known-answer examples, whose v0.7 ciphertext was
produced by an older museum-only rectangle convention. Their plaintexts and
keys are retained, while their ciphertexts are regenerated with the current
American Cryptogram Association horizontal rectangle rule. The museum engine's
`legacy:` prefix remains available to reproduce historical corpus bytes; that
compatibility mode does not make the older transformation the standard rule.
The [ACA Two-square reference](https://www.cryptogram.org/downloads/aca.info/ciphers/TwoSquare.pdf)
supplies the published rule and example.

v0.7's separate corrections to historical-pair status, withdrawn placeholders,
Kryptos K1, length definitions and duplicate tags carry forward. See the
[v0.7 release notes](corpus-v0.7.md) for their exact scope. The
[v0.6 errata](../CORPUS-V06-ERRATA.md) still governs v0.6's immutable bytes.

Five unsupported source citations are also removed from their active link fields
and preserved in explicit citation-erratum metadata for auditing. One was a
Gutenberg page for a different work; four were dead URLs. **This does not
establish an authentic source for the associated ciphertexts.** The
[link audit](../LINK_AUDIT.md) records the old links and evidence. Other
unverified source claims must still be checked at record level before reuse.

**Compatibility:** code relying on a Two-square ciphertext from v0.6 or v0.7
must pin that version. Do not concatenate or silently substitute v0.8 ciphertext
against v0.6/v0.7 keys in a benchmark. Use the record-level change inventory
and version field to compare datasets. Historical source descriptions are
context, not certification that every historical pair was transcribed from
the linked source.

## Download and verify

- [Complete corpus (`all.jsonl.gz`)](../../public/corpus/v0.8/all.jsonl.gz)
- [SHA-256 checksums](../../public/corpus/v0.8/SHA256SUMS.txt)
- [Record schema](../../public/corpus/v0.8/cipher-corpus.schema.json)
- [Changes by record](../../public/corpus/v0.8/change-inventory.json)
- [Statistics](../../public/corpus/v0.8/stats.json)

```sh
cd public/corpus/v0.8
sha256sum -c SHA256SUMS.txt
gunzip -k all.jsonl.gz
```

The download is the entire dataset, rather than a patch. `all.jsonl.gz` is a
compressed UTF-8 JSON Lines file: decompress it, then read one JSON object per
line. The checksum manifest verifies the file you received. The site browser
and its v0.6 JSON/CSV/subset buttons still present v0.6; only the explicitly
labeled v0.8 link serves this newer version.

To regenerate v0.8 from the immutable inputs, follow
[`public/corpus/v0.8/README.md`](../../public/corpus/v0.8/README.md). The build
and tests replay the corrected Two-square examples using the standard rule and
check that unrelated cipher pairs have not changed.
