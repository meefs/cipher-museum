# Targeted RS44 stencil verification

The separately authored [independent report](../../rs44-stencil-independent-verification-2026-10-10.md)
closes the prior 600-cell transcription limitation at code head
`2f7bc497b6fc5f562f886fcad7391ee0947e276f`. Its source-only reference and
comparison JSON are preserved in the parent evidence directory.

The implementation agent also made a fresh source-only extraction before
reading the candidate grid. `source-reference.json` records all 600 cell
observations, row/column lettering, rank order, visual clarifications and source
PDF hash. Its W/B states are derived from a new rendering of the original
image, not the implementation or existing fixture. `root-comparison.json`
records exact matches for both engine bundles and the actual renderer.
Both new source references agree on every cell, all 49 coordinate labels and
all 25 read ranks. No implementation correction was needed.

Reproduce the focused check under Node 22.23.3, from the repository root:

```sh
node docs/rs44-stencil-check.js
node --test tests/engines/specs/rasterschluessel44.spec.js
node tests/test-manual-cipher-exhibits.js
git diff --check
```

All passed at the original code head, with the new audit checker/reference
present. The RS44 specification passed all three tests; the real controls
continued to reproduce the independent manual answers.

`negative-control.json` records a mutation in a disposable worktree based on
that same head: swapping row 1 cells 1 and 3 preserves the number of white cells
and grid geometry, but the executable source-based checker rejects it. After
byte-for-byte restoration, the same checker passes. The production checkout
was never modified by that mutation.

The new commit contains audit material only. Historical tested heads and prior
reports are preserved rather than rewritten to imply tests ran at a new SHA.
Original source scans and temporary diagnostic crops are not republished.
