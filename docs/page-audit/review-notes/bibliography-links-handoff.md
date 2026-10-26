> Review handoff recorded before final integration. The main tracker and final validation record supersede pending integration notes below.

# Bibliography and ebook-link audit — items 59–60

## Edited files

- `further-reading.html`: full Kahn and Holden titles; full Singh, Cryptography Engineering, Fagone, Marks, Seizing the Enigma, Battle of Wits, Hut Six, Combined Fleet Decoded, Crypto and Spycatcher titles. Added Paul Greengrass's credit. Fixed Codebreaking date to Robinson 2020, Boneh–Shoup to version 0.6 January 2023, Singh's cited paperback to 2000, Seizing's revised-edition ISBN to 9781591148074, and Prados's cited reprint to 2001. Removed unsupported comparative/promotional claims about the textbooks and histories. Removed the CrypTool book-download landing link while preserving book/edition/ISBN and trail references. Ordinary publisher/author information pages remain.
- `js/demo-loader.js`: full Singh citations (with original/paperback dates), full Seizing title, Hodges edition, Rochefort/Shattered Sword titles, Stockdale coauthor/full title, Colossus editor/full title/year, Meadows year, Beckman full title/year, Mullaney edition date and Boghardt full subtitle/year. Removed DTU book viewer and Victorian Internet ebook product URL, retaining plain bibliographic credits. Removed unsupported McKenna book attribution from a Wikipedia overview link and unsupported KL-7 retirement-1968 wording from an NSA general-portal label.
- `js/cipher-corpus.js`: coordinated with corpus_utilities. Suppresses known ebook hosts/textbook paths and ebook file formats when constructing live corpus source links; retains plain explanatory credit and immutable source record metadata. Primary PDF papers/manuals and archival text resources remain linkable. This is a curated guard, not a claim to classify every book on the Internet.
- `tests/test-book-source-links.js`: new actual-DOM regression test. Ten forbidden ebook destinations, four allowed primary/catalogue controls, unchanged underlying data, static HTML and shared dynamic-bibliography scan.

## Validation completed

- `node tests/test-book-source-links.js` — PASS: 10 suppressed ebook destinations, 4 allowed controls, 215 public HTML pages, shared bibliography URL fields.
- `node tests/test-reading-trails.js` — PASS: four edition-pinned books, seven Sweigart stops, 28 internal routes, source/deep-link/mutation checks.
- `node tests/test-corpus-browser-v08.js` — PASS: existing browser sample still matches distributed corpus and retains provenance warnings.
- `node tests/test-history-modern-review.js` — PASS: 9 checks.
- `node --check js/demo-loader.js`; `node --check js/cipher-corpus.js` — PASS.
- `git diff --check -- further-reading.html js/demo-loader.js js/cipher-corpus.js tests/test-book-source-links.js` — PASS.

## Exact scan scope and disposition

Read AGENTS.md; sources.json core book entries and relevant publication metadata; full reading-trail section and all book cards; shared SOURCES/GENERAL_RESOURCES/rendering in demo-loader; corpus sourceLink/renderCard; reading/corpus/history test files. Read-only checks searched ciphers, halls, foundations, tours, learn, glossary and cryptanalysis for core abbreviated references.

1. Extracted HTTP(S) URLs from all public `.html`, `.js`, `.json` files, excluding `.git`, node_modules, tmp, docs, tests and scripts: initial scan 329 files / 770 distinct URLs. Manually reviewed matches for PDF, EPUB/MOBI, Archive.org, Gutenberg, books.google, textbook hosts and book-viewer paths.
2. Subsequent corpus stream scan covered 38 `.json`, `.jsonl`, `.csv` and `.jsonl.gz` files under public/corpus, including v0.8 compressed canonical data. Remaining Gutenberg URLs occur in frozen attribution and citation_erratum metadata, including old archived synthetic-source material. They are not public HTML anchors; all Gutenberg host destinations are now suppressed by sourceLink. No corpus record, compressed file, hash or manifest was changed.
3. Primary documents deliberately retained: NSA/Friedman archival files; original RS44/Double Playfair manuals; Culper codebook facsimile/transcription; technical papers such as ChaCha, Weil signatures, HistoCrypt and modern Truppenschlüssel cryptanalysis; ACA instruction sheets; government gazette/standards/technical notices. Numeric Archive.org Friedman document identifiers are archival records, not ebook copies.
4. Corrected raw-scan false positives: `codebook` substring; inert incorrectSourceLinks URL keys; foundation-links.test.js regression strings; stale minified source awaiting root rebuild.
5. Sent root read-only findings for columnar's Gaines/Holden title, cryptanalysis's Holden title and foundations/reduction's Boneh/Shoup date/names. Root/other agents have addressed these in current files. corpus_utilities owns turning-grille's Friedman and de Leeuw bibliography correction.

## Bibliographic verification sources (metadata only, not new full-book verification)

Existing `docs/page-audit/sources.json`: KAHN-1996, HOLDEN-2017, GAINES-1956, HAC-1997, BONEH-SHOUP-2023, LASRY-2018, CODEBREAKING-2020.

- Penguin Random House, Singh ISBN 9780385495325: https://penguinrandomhousehighereducation.com/book/?isbn=9780385495325 — full subtitle, 2000 paperback.
- Wiley/author, Cryptography Engineering: https://www.schneier.com/books/cryptography-engineering/ — full subtitle and authors.
- Jason Fagone author page: https://www.jasonfagone.com/woman-who-smashed — full title and archive-based research description.
- Naval Institute Press: https://www.usni.org/press/books/seizing-enigma — revised subtitle 1939–1945, 15 March 2012, ISBN 9781591148074.
- Simon & Schuster: https://www.simonandschuster.net/books/Between-Silk-and-Cyanide/Leo-Marks/9780684867809 and https://www.simonandschuster.net/books/Battle-of-Wits/Stephen-Budiansky/9780743217347 — full titles.
- Australian War Memorial: https://www.awm.gov.au/collection/LIB3683 — Prados full title, original Random House 1995; WorldCat OCLC 47755936 lists Naval Institute 2001 reprint (ISBN already cited by page).
- WorldCat/library catalogue: https://search.worldcat.org/title/Spycatcher-%3A-the-candid-autobiography-of-a-senior-intelligence-officer/oclc/18286392 — full title and Greengrass credit.
- Oxford University Press: https://academic.oup.com/book/40641 — Colossus full title, 2006 metadata.
- NLM catalogue: https://www.ncbi.nlm.nih.gov/nlmcatalog/101668007 — Meadows 2002 metadata.
- NSA National Cryptologic Museum library catalogue and AMS Notices bibliography — Beckman full title and 2002 English publication.
- USNI: https://www.usni.org/magazines/proceedings/2006/may/notable-naval-books-2005 — Shattered Sword full title, authors, 2005.
- State Library Victoria catalogue — Rochefort full subtitle; existing citation already gave 2011.
- MIT Press: https://mitpress.mit.edu/9780262536103/the-chinese-typewriter/ — original 2017, cited paperback 2018.
- USNI: https://www.usni.org/press/books/zimmermann-telegram — Boghardt full title, 2012.
- Bloomsbury ISBN 9781635573961 page was explicitly an EPUB/MOBI product; removed that link instead of presenting it as a neutral book information link.
- John McVey ABC-code bibliography: 1920 sixth edition's title is ABC Universal Commercial Telegraphic Code; removed the DTU book-viewer URL.

## Root integration remaining

- Add `tests/test-book-source-links.js` to shared `tests/run-all.js` (root owns runner).
- Run final `npm run build:js` to synchronize `js/demo-loader.min.js` and any other agents' JS changes. Do not release stale minified bibliography (still has the removed DTU/Victorian Internet URL until rebuilt).
- Regenerate search-index with normal final metadata build so expanded reading titles are discoverable.
- No changes needed to corpus manifests or hashes: corpus data was untouched.
- No commit/push performed. Shared tracker, coverage and sources ledger were not edited.
