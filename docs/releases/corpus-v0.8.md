# Cipher Corpus v0.8 — corrected website download

**Status (22 October 2026):** A complete compressed JSONL download is served
from the museum website. It has **no Zenodo deposit or DOI**. The published
[v0.6 archive](https://doi.org/10.5281/zenodo.23297920) remains a distinct,
unchanged dataset; the tagged v0.7 snapshot remains separately identifiable.
Cite the v0.6 DOI only when using v0.6 data.

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

v0.7's separate corrections to historical-pair status, withheld records,
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
- [Corrected historical supplement (87 entries)](../../public/corpus/v0.8/historical-supplement.jsonl)
- [Corrected LLM evaluation export (300 prompts)](../../public/corpus/v0.8/llm-3shot-eval.jsonl)
- [Supplement manifest](../../public/corpus/v0.8/supplements-manifest.json)
- [Supplement checksums](../../public/corpus/v0.8/supplements-SHA256SUMS.txt)

The **historical supplement is separate from the canonical full corpus**. It
retains 87 entries from the older 100-entry supplemental download after removing
13 withdrawn records. Forty-two have canonical v0.8 IDs: 41 remain labelled
historical and one Enigma teaching example has been reclassified synthetic.
The other 45 remain for historical context with `verified: false`,
`pair_status: unverified_pair`, `benchmark_eligible: false`, and explicit
`supplement_inclusion: legacy_unreviewed`; their original v0.6 verification
flag is preserved only as `legacy_verified_flag` for auditing. Neither a
historical title nor a contextual source link authenticates a plaintext and
ciphertext pair. The Beale wrong-work citation is retired in the canonical
record, and the Aeneas wrong-work citation is retired from the supplemental
record, each with a `citation_erratum` retaining its old URL.

The new **LLM evaluation export** copies the 300 legacy prompts and replaces
the three outdated Two-square prompt records using v0.8's corrected examples
and challenges. The other 297 prompts were not independently revalidated.
Their original v0.6 download remains available as a clearly labelled archive;
do not mix its Two-square prompts with the v0.8 cipher engine.

```sh
cd public/corpus/v0.8
sha256sum -c SHA256SUMS.txt
gunzip -k all.jsonl.gz
```

The download is the entire dataset, rather than a patch. `all.jsonl.gz` is a
compressed UTF-8 JSON Lines file: decompress it, then read one JSON object per
line. The checksum manifest verifies the file you received. The site browser
uses a corrected v0.8 sample. The v0.6 JSON/CSV/subset buttons still present
the published archive and should not be confused with the v0.8 downloads.

To regenerate v0.8 from the immutable inputs, follow
[`public/corpus/v0.8/README.md`](../../public/corpus/v0.8/README.md). The build
and tests replay the corrected Two-square examples using the standard rule and
check that unrelated cipher pairs have not changed.
