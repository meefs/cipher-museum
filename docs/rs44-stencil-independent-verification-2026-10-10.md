# Independent verification of all RS44 stencil cells

**Result: exact 600/600 cell match, with no discrepancies.** The unminified
engine, served minified engine and real exhibit renderer at PR4 head
`2f7bc497b6fc5f562f886fcad7391ee0947e276f` all reproduce the source stencil in
its original orientation. All 25 numeric column ranks also match. There are
240 white writing cells and 360 blocked cells; each of the 24 rows has exactly
ten white cells.

This targeted follow-up addresses the earlier review's stated limitation that
the entire stencil had not been independently retranscribed. It preserves that
earlier review's chronology. No implementation files were changed.

## Source and independent transcription

The primary image is **Abbildung 1 zu Ziffer 24**, printed page **17**, PDF page
**25** of the [27 March 1944 RS44 manual](https://cryptocellar.org/wmc/schluesselanleitung-zum-rs44.pdf).
The downloaded PDF's SHA-256 is
`3ac21e12454d93236b6d23b470bae102bb107cd3f678a40bf0e94cbedbd5bf6f`.
The page number and caption were verified directly in a fresh render of the PDF,
rather than assumed from an existing image filename.

The [fresh source-only reference](evidence/rs44-independent-blind-stencil-2026-10-10.json)
was fixed on disk at **2026-10-10 17:10:12 UTC**, before reading the candidate
stencil for this comparison. Its SHA-256 is
`20fe434e55259e1a2d8eb8490d0ac88c5d1854f1e31ba92f1c76ca11bbb8af4a`.
It records all 600 cell states, all 24 row labels, all 25 column labels, all
25 numeric ranks, orientation and scan ambiguities.

The implementation, existing fixture, `rs44-grid.json`, earlier reference script
and root agent's new reference were not consulted during this transcription.
The reviewer had participated in the earlier review and had previously seen
candidate material; this is a fresh extraction from source images with a fixed
reference before comparison, not a claim of no prior familiarity.

The PDF page was rendered afresh at 300 dpi. Four six-row clips rendered at
400 dpi were inspected for every white/hatched cell. A separate source-raster
calculation corroborated all 600 states: median grayscale values were sampled
inside each cell, away from grid lines, and compared with 90% of the highest
observed median in that physical column. Column-local normalization accounts
for the photographed paper's shading. The sampling geometry was PDF points
left 34, top 112, column pitch 18.92, row pitch 25.4, using the rectangle
offsets (5,7)–(14,18) within each cell. The visual transcription and this
source-only calculation agreed at every cell. Source renders and sample data
remain in `/tmp/rs44-independent-stencil-20261010`; no archival artwork is
rehosted in the repository.

Orientation is upright as printed: rows run **top to bottom**, physical columns
**left to right**. Row-coordinate labels sit to the right, outside the 25-cell
grid. Column-coordinate labels sit above the numeric permutation. Grid arrows
and crossed labels are instructional annotations, not blocked-cell boundaries.

## Labels and all 24 rows

`#` means blocked/gray/hatched; `.` means white/permitted. Spaces below separate
five-cell groups and are not cells. The complete machine-readable strings are
in the fixed reference.

```text
Physical columns:  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25
Coordinate labels: cb ac ba cd eb ee db aa be cc da ec ae bb ca dc de ab ce ed dd bc ad ea bd
Numeric ranks:     3 20  8 13  5 19  1 14  9 21 18 15 24  2 12  7 10 22  4 16 25 11 23 17  6

Row Label  Cells, left to right
 1   bd    ##..# ##..# ..#.# #.#.# #.###
 2   ac    .##.# .#..# .##.# #.### .##.#
 3   ca    ..#.# ..##. ##.## #.#.. #####
 4   ea    ####. .##.. .#..# ##..# ##.##
 5   ae    .###. #..#. #.##. ###.# #..##
 6   ee    ##### ..##. #..#. ##.#. ###..
 7   bc    ###.# ##.## .#.#. ##.#. .#..#
 8   be    ####. ##.## #..#. ###.. #.#..
 9   dc    ##.## ##.## #..## #.#.. .#..#
10   aa    ##### .##.# #.#.# #..#. #.#..
11   ec    #.#.. .##.# .#.## .#.## .####
12   ce    ##### .#.#. #...# ..#.# ##.##
13   dd    ###.. #..## ...## #..## #.###
14   cb    .#... #.### .#.#. ##.#. #####
15   ab    ####. ##.## .#.## .#... #..##
16   eb    #..#. ..##. ###.. ###.. #####
17   bb    .##.# ..#.# ####. ..##. .####
18   cd    ##.## #.### .#.#. #.### ..#..
19   ed    #...# ..##. ##.#. ##.## .####
20   ad    .#.#. .#.#. ###.# .##.# .####
21   cc    ####. #.##. ##.## #..#. .#..#
22   da    ..#.. #.### #.#.. ##.## .####
23   ba    #.##. ##... #.### #.#.# .#.##
24   db    ##### .#.#. .#.## #..#. ##.#.
```

## Resolved ambiguities

- **Row 2/column 1 and row 3/column 1 are white.** Darker paper shading at the
  scan's left edge differs from the regular gray hatching. Direct strip
  inspection and Figure 4 confirm the states.
- **Faint central hatching is blocked.** Examples include row 4 columns
  12/15/16/17 and row 15 columns 14/15. A trial absolute grayscale threshold
  of 170 underclassified these cells; visual hatching and column-normalized
  sampling resolve them without reference to the candidate.
- **Column-coordinate label 21 is `dd`, not `bd`.** A 1000 dpi Figure 1 header
  close-up shows both ascenders despite the crossing stroke. The uncrossed
  header in Figure 4, printed page 20/PDF page 28, independently confirms `dd`.
  This was established from the lettering, not inferred from the permutation.
- **Arrows and crossed labels do not change cell states.** Their underlying
  hatching/white background and coordinate letters remain observable. Figures
  2 and 4 were freshly rendered from PDF pages 26 and 28 to corroborate label
  alignment and annotated regions.

No cell-state, coordinate-label or rank ambiguity remains unresolved.

## Comparison after the reference was fixed

Only after fixing the reference was `git show` used to read the immutable PR4
candidate source. Each `(row,column)` state was compared individually; the
numeric ranks were compared at the same physical column positions. The minified
bundle's default trace was checked independently. The actual exhibit scripts
from that commit were then evaluated in JSDOM, and all 600 rendered cell classes,
24 row headers and 25 column/rank headers were compared in DOM order.

| Checked surface | Result |
| --- | --- |
| `RS44_GRID` in unminified engine | 600/600 cells, zero discrepancies |
| Default grid from minified engine | 600/600 cells, zero discrepancies |
| Actual exhibit renderer | 600/600 cell states, zero discrepancies |
| Numeric permutation | 25/25 ranks; displayed ranks also 25/25 |
| Orientation and numeric headers | 24/24 rows top-to-bottom; 25/25 physical columns left-to-right |
| Coordinate/example alignment | Row 5=`ae`, column 14=`bb`, readout column 6=`ee`; wrap row 21=`cc`, column 2=`ac` |

The exhibit displays numeric row/column coordinates rather than all 49 letter
labels. All source labels are recorded above; the candidate's displayed and
worked-example correspondences match them. There is no transpose, mirror,
rotation, omitted row/column or off-by-one shift.

The [comparison evidence](evidence/rs44-independent-stencil-comparison-2026-10-10.json)
records the exact commit, source/reference hashes and empty discrepancy lists.
Candidate source SHA-256:
`7d7573b8723bb4c902588a16bcf025450128317036d54761cc1019d37a4e4ebe`.
Candidate minified bundle SHA-256:
`0a0de54f53537c728484b4442fe6e93f7dd1761771215b8e8a4c7ef59bccb867`.

This supplement verifies the factual stencil, rank order and display alignment.
It does not replace the separately recorded operating-procedure, known-answer,
UI, browser or full-suite checks. No implementation correction is required.
