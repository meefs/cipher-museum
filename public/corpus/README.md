# Cipher Corpus — Classical Cryptanalysis Benchmark

**v0.6 · 2026-10-11 · 100,326 records · 85 cipher types.**

Known-plaintext/ciphertext exercises for education and classical cryptanalysis
benchmarking. This release adds **300 synthetic records: 100 each for RS44,
German Double Playfair, and AMSCO**. These are generated exercises, not newly
recovered historical messages. Existing independent published known-answer
fixtures remain in the engine tests.

## Dataset statistics

| Metric | Canonical `all.jsonl` |
|---|---:|
| Records | 100,326 |
| Cipher-type labels | 85 |
| Distinct registered engines represented | 84 of 88 |
| Languages | 9: de, en, es, fr, it, ja, la, ru, zh |
| Records labeled historical | 54 |
| Exact engine replay matches | 99,800 |
| Existing known-deviation records | 526 |
| Unexplained failures required | 0 |

Cipher labels are not engine counts: `wallis_cipher` and `wallis_ciphers` map
to the same engine. Dictionary Code, Beale, Cardano Grille, and Patterson have
no canonical corpus family. Counts by type and engine are in `stats.json`.
The 526 deviations retain their existing rules and exact 1,051 mismatch events:
intentional transcription noise and historical settings outside the teaching
engines' APIs. They are not exact replay successes.

## Reproducible manual-cipher expansion

Run `node scripts/expand-corpus-v06.js` at the repository root. Generation is
deterministic and idempotent; it refuses an altered v0.5 prefix or an unexpected
existing expansion. All original 100,026 JSONL records remain byte-identical,
including IDs, keys, ciphertexts and split assignments. The baseline SHA-256
and source commit are recorded in `stats.json`; the old benchmark can be
reconstructed from that commit or the first 100,026 lines, verified against
that hash. No existing release tag is moved.

New IDs use `v06-<type>-001` through `100`. Each type has 70 public and 30 blind
labels. The new plaintexts are distinct, with deterministic synthetic keys.
This is a compact teaching expansion, not a claim of comprehensive statistical
coverage or realistic intercepted traffic.

| Type | Convention | Key |
|---|---|---|
| `rs44` | March 1944 calculated readout; already prepared A–Z, strict 60–200-letter bounds | Explicit synthetic 24×25 stencil, column ranks, start row/column, minute and strict flag |
| `double_playfair` | December 1941 two-stage procedure; J→II before pairing; odd prepared length adds Z, retained on decode | Both 25-letter squares, filler and strict flag |
| `amsco` | ACA row/column alternation, including even widths and ragged endings | Rank permutation and first-cell size (1 or 2) |

Every new record uses `key: {"type":"settings","settings":{...}}`.
Missing settings fail replay rather than silently using a default. Double
Playfair scoring compares prepared plaintext, including legitimate trailing Z;
never strip an arbitrary final letter. These conventions appear in record
notes, the browser and the evaluation prompts. See
[historical procedure definitions](../../docs/HISTORICAL_PROCEDURES.md).

## Files and scope

| File | Contents |
|---|---|
| `all.jsonl`, `all.json`, `all.csv` | 100,326 canonical records; CSV includes JSON-serialized keys and scoring notes |
| `manual-ciphers-v0.6.jsonl` | All 300 additions, a strict canonical subset |
| `beginner.jsonl` | 14,433 English exercises |
| `intermediate.jsonl` | 27,069 English exercises |
| `advanced.jsonl` | 27,681 English exercises |
| `expert.jsonl` | 26,966 English exercises |
| `historical.jsonl` | 100 supplemental records; 55 IDs occur in canonical, 45 do not |
| `multilingual.jsonl` | 5,348 supplemental records; 3,638 canonical IDs and 1,710 additional Arabic records |
| `noisy.jsonl` | 484 intentionally noisy canonical records |
| `browser-sample.json` | Browsable sample including nine public examples from the new types |
| `llm-3shot-eval.jsonl` | 300 deterministic evaluation prompts; public, clean, nonhistorical source records only |
| `stats.json` | Canonical counts, per-type/per-engine coverage and baseline identity |
| `SHA256SUMS.txt` | Checksums for downloads, browser sample, statistics and schema |
| `cipher-corpus.schema.json` | Record schema |

The 54 `source_type: historical` entries are catalogued historical-context
exercises, not 54 independently authenticated known-answer pairs. The legacy
`verified` boolean records generator/reviewer state and must not be interpreted
as source authentication. Known pair defects and declared reconstructions are
documented in the repository's [v0.6 errata](../../docs/CORPUS-V06-ERRATA.md)
and [machine-readable review](../../data/corpus-historical-review.json). The
published archive remains unchanged; record-field corrections require a later
dataset version.

The difficulty downloads preserve the existing English exercise subsets;
they do not partition the full multilingual/historical corpus. The historical
file's 55 overlapping IDs include one reconstructed record labeled synthetic;
that is why canonical historical source-type count is 54. The older supplement
merge is **deferred to a future release**, superseding the earlier v0.6 plan.
Those outside-canonical records are not covered by canonical replay.

### Published archive

The immutable v0.6 archive is published on Zenodo under the
[version DOI 10.5281/zenodo.23297920](https://doi.org/10.5281/zenodo.23297920).
Use that DOI when citing or reproducing this release. The
[concept DOI 10.5281/zenodo.23297919](https://doi.org/10.5281/zenodo.23297919)
resolves to the evolving collection across versions.

The Zenodo record contains 12 files. Its canonical dataset format is
`all.jsonl`; the other 11 files provide the schema, v0.6 subset, evaluation
prompts, statistics, citation and rights metadata, documentation, changelog,
and checksums. The website download area additionally provides the derived
`all.json` and `all.csv` representations, difficulty subsets, browser sample,
and separate supplements. Those additional website downloads are not part of
the 12-file Zenodo v0.6 archive.

Both public and blind split records are downloadable. “Blind” denotes a split
label, not confidentiality or protection against benchmark contamination. Do
not train and evaluate on the same split; use a separately held-out dataset
when genuinely unseen evaluation is required. Historical known-answer fixtures
are not included in the new synthetic evaluation examples.

## Verification and regeneration

`all.json` and `all.jsonl` use Git LFS; clone with LFS enabled or run `git lfs pull`.

```sh
npm ci
node scripts/expand-corpus-v06.js
npm run validate:corpus
node tests/test-corpus-v06.js
npm run test:engines
# From public/corpus:
sha256sum -c SHA256SUMS.txt
```

The release generator rebuilds derived exports, new difficulty entries,
browser samples, the engine manifest, statistics, evaluation prompts and
checksums. `scripts/generate-llm-eval.js` can also be run on its own, followed by
release regeneration to refresh checksums. Existing per-engine property,
known-answer, robustness, mutation and performance tests remain required.

## Usage

```python
import json
with open("all.jsonl", encoding="utf-8") as corpus:
    for line in corpus:
        record = json.loads(line)
        print(record["id"], record["cipher_type"], record["key"])
```

Synthetic records are CC0; source/license fields describe other records.
Review per-record provenance before redistributing historical source material.

## Attribution & Related Work

### CipherBank Foundation

Cipher Corpus builds on the pioneering work of **CipherBank** by Li et al. (2025), which established the first systematic benchmark for LLM classical cryptanalysis evaluation, demonstrating that even advanced models achieve only ~45% accuracy on classical cipher tasks.

**CipherBank Resources:**
- [Research Paper (arXiv:2504.19093)](https://arxiv.org/pdf/2504.19093)
- [Dataset (Hugging Face)](https://huggingface.co/datasets/yu0226/CipherBank)
- [Code (GitHub)](https://github.com/Leey21/CipherBank)

**CipherBank citation:**
```bibtex
@article{li2025cipherbank,
  title={CipherBank: Exploring the Boundary of LLM Reasoning Capabilities through Cryptography Challenges},
  author={Li, Yu and Pei, Qizhi and Sun, Mengyuan and Lin, Honglin and Ming, Chenlin and Gao, Xin and Wu, Jiang and He, Conghui and Wu, Lijun},
  journal={arXiv preprint arXiv:2504.19093},
  year={2025},
  url={https://arxiv.org/pdf/2504.19093}
}
```

### Comparison with CipherBank

| Benchmark | Records | Algorithms | Historical | Multilingual | Blind Splits | LLM Eval Format |
|---|---|---|---|---|---|---|
| CipherBank (Li et al., 2025) | 2,358 | 9 | No | No | No | No |
| **Cipher Corpus v0.6** | **100,326** | **85 types** | **54 canonical historical** | **9 canonical languages** | **Publicly downloadable labels** | **Yes** |

### Cite Cipher Corpus

```bibtex
@dataset{clark_2026_23297920,
  author={Clark, Paul A.},
  title={Cipher Corpus v0.6: A Classical Cryptography Dataset},
  month={oct},
  year={2026},
  publisher={Zenodo},
  version={0.6},
  doi={10.5281/zenodo.23297920},
  url={https://doi.org/10.5281/zenodo.23297920}
}
```

## Quality Rules

All Cipher Corpus records must:
- Include both plaintext and ciphertext with the key/settings required to reproduce the encryption.
- Specify cipher family and cipher type.
- State the language, alphabet, and casing.
- Specify spacing and punctuation handling.
- Assign a difficulty level (beginner, intermediate, advanced, expert).
- Include expected attack methods.
- Include source type and license (CC0 for synthetic).
- Pass JSON Schema validation (see `cipher-corpus.schema.json`).
- Historical records must include provenance and rights.

Validation is enforced via JSON Schema and automated test scripts in `tests/` and `scripts/`.

## License

- Synthetic records: **CC0** (public domain)
- Historical records: **public domain** (per-record attribution)
- Code and infrastructure: **MIT**
- See `CITATION.cff` for academic citation format.

## How to Contribute

Submit records with: plaintext, ciphertext, cipher type, key/settings, source, license, verification status, expected attacks, and difficulty. Historical submissions must include source and rights. See the [Cipher Corpus page](https://ciphermuseum.com/cipher-corpus.html) for the community submission form.
