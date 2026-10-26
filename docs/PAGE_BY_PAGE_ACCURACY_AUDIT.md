# Page-by-page accuracy audit — in progress

Started 26 October 2026 against commit `15efc4402155a35a1b455c9fcb5ba0f507e96d6e`.

All **214 tracked public HTML pages** have received a static-prose reading (151,229 extracted words). Corrections are prepared on **123 HTML pages**, alongside shared bibliography rendering and generated metadata. This is a work checkpoint, **not a completed accuracy certification or release**. No page receives a final verified status merely because its automated tests pass.

The review distinguishes original constructions, later variants, museum teaching models, theoretical security assumptions, demonstrated attacks and uncertain historical claims. Book credits use full titles, authors, edition/year and verified sections or pages. There are no links to the supplied ebook copies or private reading files. Public papers, standards and archival sources supplement books where appropriate.

The coverage ledger is [page-audit/coverage.json](page-audit/coverage.json). It records findings and remaining work for every page. [page-audit/sources.json](page-audit/sources.json) records passages actually consulted and their limits; it is not a claim that every listed book was read cover to cover. Some initial review notes remain rough working notes.

Corrections so far include classical-cipher chronology and attribution; perfect-secrecy and computational-security distinctions; limitations of Schnorr and lattice teaching models; machine variants and historical operational claims; codebook formats and public versus secret pad material; and source-specific descriptions of puzzle decipherments. The comparison table no longer labels modern cryptography “Solved.” The cultural survey no longer classifies music and sculpture as novels or internet works.

Validation completed at this checkpoint includes HTML lint on214 pages; targeted protocol, mathematics and interactive checks;48 foundation prose guards; independent calculations for the10 challenge ciphertexts and676 DIANA input pairs; JSDOM rendering of120 comparison rows and14 cultural cards; and regenerated metadata with record counts and fields retained. The first full `npm test` run found outdated expectations for linked ebooks, source-object formatting and a single undated comparison entry. Targeted reruns now pass: all-engine checks (458 assertions, two skips), history/modern review, reading trails and manual-cipher exhibits. The complete suite must be run again after the remaining edits.

Remaining work includes source checks documented in the ledger; the rest of the scripted teaching content; related claims in halls, tours, glossary and timelines; full rereading of corrected pages; browser layout and interaction review; regression checks that are shown to reject the retired errors; final complete test run; and publication verification. The branch must stay unmerged until those checks and the outstanding factual issues are resolved or clearly scoped on the relevant pages.

Second working checkpoint: additional biographies, classical models and five hall summaries corrected. Ten new public-claim checks each reject a deliberately reintroduced error; the existing nine history/modern checks still pass. These targeted checks do not complete the outstanding source and rendered audit.
