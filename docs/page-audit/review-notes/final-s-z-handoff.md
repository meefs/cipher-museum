> Review handoff recorded before final integration. The main tracker and final validation record supersede pending integration notes below.

# Final s–z public-page reread

All 34 files below were read as full static public prose, including all body text, SVG text/worked examples, hero facts, sidebar facts, related-card captions, description/Open Graph/Twitter metadata, and evidence limitations. Scripts, styles, global navigation and footer boilerplate were excluded from the prose extraction. This was a consistency reread, not a new primary-source investigation. Existing corrected body text and the source ledger supplied the limits; no claim of independently rereading every cited book is made.

## Exact read list

- `ciphers/sator-square.html`
- `ciphers/scytale.html`
- `ciphers/sha256.html`
- `ciphers/shamir-secret-sharing.html`
- `ciphers/shugborough.html`
- `ciphers/sigaba.html`
- `ciphers/sigsaly.html`
- `ciphers/slidex.html`
- `ciphers/sodark.html`
- `ciphers/solitaire.html`
- `ciphers/somerton-man.html`
- `ciphers/stager.html`
- `ciphers/station-hypo.html`
- `ciphers/straddling-checkerboard.html`
- `ciphers/tap-code.html`
- `ciphers/trifid.html`
- `ciphers/trithemius.html`
- `ciphers/turning-grille.html`
- `ciphers/two-square.html`
- `ciphers/typex.html`
- `ciphers/ua-8295.html`
- `ciphers/venona.html`
- `ciphers/vernam.html`
- `ciphers/vic.html`
- `ciphers/vietnamese-underground.html`
- `ciphers/vigenere.html`
- `ciphers/voynich.html`
- `ciphers/wadsworth-cipher.html`
- `ciphers/wallis-ciphers.html`
- `ciphers/wheatstone.html`
- `ciphers/yardley.html`
- `ciphers/zero-knowledge-proofs.html`
- `ciphers/zimmermann.html`
- `ciphers/zodiac.html`

## Narrow corrections

- `ciphers/sha256.html`: all three descriptions now state the message-length limit and avoid describing every Git repository as SHA-256-based; sender authentication caveat matches the body.
- `ciphers/slidex.html`: all three descriptions qualify German recovery times as reports about particular traffic, matching the source caveat already in the body.
- `ciphers/station-hypo.html`: all three descriptions describe partial JN-25 recovery plus traffic analysis/context, avoiding a blanket unit-level break or sole-cause Midway claim.
- `ciphers/straddling-checkerboard.html`: removes unsupported 1930s metadata date, unconditional “Strong (in VIC)” status language, and related-card claim of direct Polybius ancestry. Matches the page’s explicitly unestablished first use and transmission history.
- `ciphers/typex.html`: removes “no plugboard” from all three descriptions (body correctly describes later plugboards), replaces categorical attack-cost language with the scoped public-record claim, distinguishes rotor stepping from M-209 lug function, and removes speculative captions in related cards.
- `ciphers/vigenere.html`: all three descriptions drop the 300-year security myth; hero facts distinguish Bellaso’s related 1553 precursor from Vigenère’s distinct 1586 constructions, as the body already does.
- `ciphers/sigaba.html`: hero and duplicated facts now state the documented-public-record scope of the wartime no-break claim; replaces absolute Enigma superiority/reflection ranking with the actual distinction of signal paths and control design.
- `ciphers/shamir-secret-sharing.html`: removes “no cipher can” rhetoric and an unsupported adoption/dated-interpolation causal story. States the already-explained field-element shares, public coordinates and polynomial interpolation directly. Does not change protocol arithmetic.
- `ciphers/yardley.html`: removes “from scratch”/“first permanent” rhetoric inconsistent with the body’s discussion of continuing American cryptologic work; related Purple/VENONA cards no longer invent direct causal descent.
- `ciphers/vic.html`: explicitly labels the preformatted steps and SVG as the teaching model, aligns their keyword/additive stream with the actual widget, and removes the claim that those diagram inputs represent the historical lyric/date/disrupted-transposition procedure. Main historical limitations remain intact.
- `ciphers/turning-grille.html`: full public credits now give **William F. Friedman, Advanced Military Cryptography (1935)** and **Karl de Leeuw, “The Solving of a Fleissner Grille during an Exercise by the Royal Netherlands Army in 1913” (HistoCrypt 2018)**. Exact paper title checked against `DELEEUW-2018` ledger entry; supplied missing space in “in1913” ledger typography without changing the ledger.

No edits were needed on the other 23 files in this reread. Their existing historical caveats, demo/real-system distinctions, uncertainties and source limitations were retained. Research-case full-paper limits on UA-8295 remain explicit. Z-340/Z-408 distinctions, Somerton official-vs-research identification, Voynich parchment-vs-writing dates, and VENONA decimal-vs-binary arithmetic all remain explicit.

## Evidence used

The existing page body/source sections and shared ledger, especially `HAC-1997`, `KAHN-1996`, `TYPEX-ARTIFACT`, `NSA-YARDLEY`, `NSA-ROCHEFORT`, the Hollow Nickel entry, and `DELEEUW-2018`. These edits reconcile already reviewed facts and remove broader unsupported statements; they do not assert new archival findings. No shared tracker, coverage, or sources ledger was modified by this agent.

## Checks

- Targeted HTMLHint: all 11 changed s–z pages plus 404/embed/teaching/public report = **15 files, no errors**.
- `node tests/test-protocol-pages.js`: **34 passed, 0 failed**.
- `git diff --check -- <owned files>`: clean (exit 0).
- Utility/corpus verification and seven embed runtime cases are recorded separately in `tmp/corpus-utilities-handoff.md`.

Root must regenerate the shared search index after all page wording settles (metadata changes otherwise leave old snippets in the index). Root owns the final rendered 214-page pass, full test suite and any minification/service-worker version refresh. No generators beyond the single owned benchmark-report generator were run. No git commit, push, merge or deployment performed.
