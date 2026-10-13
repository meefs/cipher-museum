# Codebreaking exhibits and verification — 13 October 2026

Starting main: `47ba89e` (full SHA recorded in the commit parent).

## Existing repairs verified, not duplicated

The current source already centralizes all exhibit classifications in
`data/exhibit-trust.json`, with shared definitions in `data/trust-labels.json`.
The five named historical systems are Historical Only; biographies, places,
principles, culture and foundations omit cipher trust labels. The full trust
suite scans every registered exhibit plus map, halls, search and live artifact
rendering. Its independent modern-security allowlist contains nine entries.

The August map repair `59ee6a44b92001e481e793e799f161766716394f` still contains
Secure (Modern) on Navajo Code Talkers and SIGABA. Those same labels survive at
`40f9fde^`. This supports an incomplete earlier repair; it does not establish a
later regression. The canonical classification repair began at `40f9fde` and
was integrated through PR #1 on October 10. No current regression was reproduced.

Before this expansion, both homepage and map state 167 total, 147 cipher/history,
17 Foundations and 3 protocols/constructions. These agree with the canonical
source and the existing build-counts generator. The Foundations range 141–157
is an identity range, not a separate total. Live web retrieval agreed with these
totals on October 13; no deployment or browser-cache diagnosis is inferred.

## Added

- 168: Turing–Welchman Bombe; 169: Colossus, both in Hall VII.
- Static historical exhibits, with no cipher security badges or claimed engine.
- Reciprocal related links with Enigma, Lorenz, Bletchley Park and Bill Tutte.
- Hall cards, map roster, sitemap, README roster, search and artifact metadata.
- Explicit artifact metadata describes cryptanalysis, not encryption.
- Generated totals: 169 = 149 cipher/history + 17 Foundations + 3 protocols.
  Engine count (88) and interactive exhibit count (146) are unchanged.
- Optional TLS, PGP and Signal exhibits are deferred.

Sources: The National Museum of Computing's
[Bombe](https://www.tnmoc.org/bombe) and
[Colossus](https://www.tnmoc.org/colossus) reconstruction/historical accounts,
read October 13. The classroom examples are marked as conceptual; neither is
presented as a working historical simulator.

## Validation

Existing trust and count suites pass on the expanded collection. New tests
check identities, neutral labels, source links, reciprocal navigation, sitemap
registration and artifact classification. Homepage/map visible subset and total
counts are now directly asserted against computed counts.

Nine disposable-copy mutations fail at their intended assertions: changing each
of the five named historical systems to secure; labeling Kahn or Bombe broken;
restoring the map total to 160; removing Enigma's Bombe doorway. Unmutated trust
and count controls pass in that same copy. See the adjacent mutation JSON.

Full `npm test`: all suites passed, including engine tests and corpus replay.
`npm run lint:html`: 207 files, zero errors. `build-counts --check` and
`git diff --check`: passed. Generated-data changes reviewed.

Browser visual QA was attempted but not completed: Playwright had no installed
Chromium, and the browser download returned a truncated/non-ZIP response.
No visual screenshot result or deployment is claimed.
