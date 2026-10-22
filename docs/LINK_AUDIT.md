# Link audit — 22 October 2026

This audit inventories the whole served source tree, including links assembled
by shared JavaScript and citations in downloadable corpus releases. It is a
link and destination-identity audit, not a claim that every cited source proves
every statement or every corpus plaintext/ciphertext pair.

## Coverage

- 207 served HTML files; HTML, inline/shared JavaScript, JSON, JSONL, and CSS
  sources were scanned. Test fixtures, tooling, documentation, dependencies, and
  Git internals were excluded from served-page counts.
- 10,811 local references were resolved against files and HTML anchor targets.
- 416 unique external destinations were checked with bounded, read-only HTTP
  GET requests or reused from the same audit session. This includes v0.7,
  v0.6, legacy JSONL files, citations, bibliography data, and shared footers.
- Shared navigation, footer, breadcrumbs, and learning-path scripts were also
  executed in a DOM across 207 pages: 6,095 resulting navigation links had no
  missing target or anchor, and no script errors were observed.
- Publisher/author and institutional destinations were reviewed for identity,
  not merely HTTP success. Examples included incorrect ISBN editions, book
  links leading to unrelated titles, and institution homepages substituted for
  the purported source.

The machine-readable snapshot, individual statuses, locations, verified
replacement recommendations, and identity errors are in
[LINK_AUDIT_EVIDENCE.json](LINK_AUDIT_EVIDENCE.json). Counts describe the final source snapshot after remediation.

## Defects and correction rules

The local scan found a Detective link to nonexistent `ciphers/otp.html`, a
Wadsworth link to a missing simulated-annealing anchor, and a benchmark-report
skip link without a `main-content` target. All three were corrected at their source or generator and the output was rechecked.

The external sweep found broken destinations in demo bibliography data and
frozen corpus citations. The evidence file records 29 specific replacement or
removal decisions, now applied to live navigation and bibliography data. A replacement can require a label correction too:
for example, a 1920 sixth-edition ABC codebook must not be linked to its 1901
fifth edition, and a library catalog record must not be described as a complete
facsimile. Unsubstantiated author/title combinations should be removed rather
than repaired by guessing a new URL.

Published v0.6 corpus files and the tagged v0.7 files are preserved. Their
original URLs and source claims remain inspectable. The newer, separately
versioned [v0.8 download](releases/corpus-v0.8.md) retires five unsupported
URLs from active provenance and keeps them in `citation_erratum`. Repairing a
source link does **not** authenticate the fixture or establish a historical
plaintext/ciphertext pair.

Three legacy Gutenberg links return successful HTTP responses for the wrong
works:

| Original link | Claimed source | Actual destination |
| --- | --- | --- |
| `https://www.gutenberg.org/ebooks/12994` | *The Beale Papers* | Russell, *Sydney Smith* |
| `https://www.gutenberg.org/ebooks/31958` | Aeneas Tacticus | Onkel Adam, *Tunturikoski* |
| `https://www.gutenberg.org/ebooks/7012` | *Le Petit Prince* | Mistral, *Mes Origines* |

The first occurs in published v0.6 and its prepared v0.7 descendant; the
others are in legacy source/archive JSONL. Treat these as attribution errors in errata, not ordinary
redirect updates. Two older NSA heritage URLs also resolve to generic About
content instead of the cited collection. Legacy frozen files contain additional
404 citations listed individually in the evidence file. At the time of this
audit, all 21 remaining HTTP 404 candidates belonged to archived JSON/JSONL
citations; five were also lookup keys in the live source-correction map, not
rendered link destinations. The v0.8 record-level citation errata identify
four of those unavailable old links without treating related pages as proof of
the cryptograms. No
confirmed 404 remains in active navigation or bibliography targets from this
scan. The live corpus browser shows related sources or wrong-work warnings,
and the older downloadable records retain their original fields.

## Limits and inconclusive results

HTTP 200 is not proof of the intended content. HTTP 403/429, bot challenges,
access restrictions, timeouts, and temporary 5xx responses were kept separate
from confirmed wrong destinations and 404 candidates. PracticalCryptography
returned 503 responses; CBC returned a “Site Unavailable” page with HTTP 200;
several publisher, JSTOR, military-history, and archive links imposed access
restrictions. No claim of permanent link failure follows from those responses.

Of 416 external destinations, 319 were retrieved, 46 remained inconclusive,
29 were access-restricted, 21 were archived 404 candidates, and one action URL
was deliberately not requested. A retrieved page still requires identity
review; these counts are not 319 endorsements of its contents.

External URL fragments were not exhaustively checked. Static parsing cannot
prove all arbitrary runtime URLs; the separate DOM check covered the shared
navigation scripts, while interactive flows are covered by the interaction
audit. No forms, issue-creation URLs, purchases, or other action endpoints were
submitted. This audit does not bypass access controls.

## Repeat the inventory

```sh
python scripts/audit-links.py --output /tmp/cipher-museum-links.json
python scripts/audit-links.py --http --output /tmp/cipher-museum-links.json
```

For a follow-up in the same session, reuse prior HTTP evidence while scanning
the current source tree and checking newly introduced destinations:

```sh
python scripts/audit-links.py --http \
  --reuse /tmp/cipher-museum-links.json \
  --output /tmp/cipher-museum-links-updated.json
```

The script defaults to eight workers, at most two concurrent requests per
host, a 15-second request timeout, and bounded response reads. It reports
network evidence conservatively and requires human review of destination
identity. Parser, status-classification, and action-exclusion smoke checks were
run during this audit. The initial local defects also confirmed that missing
targets and anchors are detected.
