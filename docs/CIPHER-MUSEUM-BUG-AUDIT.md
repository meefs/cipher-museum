# Cipher Museum evidence-based bug audit

> **Status:** This document records the pre-repair state at the starting commit
> below. The findings have since been remediated without rewriting the immutable
> Cipher Corpus v0.6 archive; see
> [`CIPHER-MUSEUM-BUG-AUDIT-REMEDIATION.md`](CIPHER-MUSEUM-BUG-AUDIT-REMEDIATION.md).

**Audit date:** 2026-10-11<br>
**Audited repository:** `systemslibrarian/cipher-museum`<br>
**Starting branch:** `main`<br>
**Starting commit:** `652ca8188e47ce09115db17f2e9c01621bb3610b` (`Merge pull request #9 from systemslibrarian/docs/fix-software-doi-badge`)<br>
**Starting remote state:** `main` and `origin/main` were identical after `git fetch origin --prune`<br>
**Starting working tree:** clean (`## main...origin/main`)<br>
**Audit environment:** macOS, Node.js 22.23.2, npm 10.9.8, Google Chrome 154.0.8037.98, Playwright 1.64.0, Git LFS 3.7.1

This is a read-only audit of production code and data. No production source, corpus
record, generated asset, branch, tag, release, remote, or deployment was changed.
The browser and corpus harnesses were created only as untracked files in the
detached worktree `/private/tmp/cipher-museum-audit-20261011.zcVxKm` at the exact
starting commit. Existing detached worktrees and local branches were left alone.

## Executive result

The repository is unusually well supplied with structural, round-trip,
performance, accessibility-markup, link, and corpus-accounting tests. All required
checks passed. That does **not** establish educational correctness. This audit found
the following independently reproducible defects:

| Severity | Confirmed by execution | Source-confirmed, not separately executed | Total |
|---|---:|---:|---:|
| Critical | 0 | 0 | 0 |
| High | 4 | 0 | 4 |
| Medium | 7 | 0 | 7 |
| Low | 3 | 1 | 4 |
| **Total** | **14** | **1** | **15** |

The four highest-priority risks are:

1. The M-209 demo omits the 27-bar lug cage and can produce only six active-pin
   contributions, while the exhibit teaches the real 0–27 lug sum.
2. The canonical corpus calls all 54 historical records verified, but multiple
   pairs are mathematically impossible or demonstrably truncated as represented.
3. The KL-7 and Fialka demos implement seeded reflector machines that contradict
   defining mechanisms described immediately beside them.
4. GitHub Pages deploys concurrently with, rather than after, CI. A commit has
   already been deployed even though its CI run was later cancelled.

No exploitable runtime XSS, credential disclosure, telemetry leak, path traversal,
or browser-side dependency vulnerability was reproduced. Intentional weakness in
historical ciphers was not classified as an application security defect.

## Architecture and shipped surface

### Application

Cipher Museum is a static, multi-page GitHub Pages application. The audited tree
contains 206 HTML files, 237 JavaScript files, 167 canonical exhibits (147
cipher/history, 17 foundations, and 3 protocols), 13 halls, a search/catalog UI,
the Cipher Detective, a common cipher workbench, dedicated exhibit visualizations,
and corpus download/evaluation pages. Production pages load checked-in HTML, CSS,
JavaScript, minified JavaScript, JSON indexes, and dataset files directly; there is
no application server.

The shared runtime registry in
[`js/ciphers/all-engines.js`](../js/ciphers/all-engines.js) exports 88 engines with
`encode`/`decode` APIs. Dedicated implementations supplement it: the Caesar exhibit
uses [`js/ciphers/caesar.js`](../js/ciphers/caesar.js), the Enigma exhibit uses the
configurable [`js/ciphers/enigma.js`](../js/ciphers/enigma.js), and NEMA, turning
grille, and Myszkowski have page/historical modules. Foundation and protocol pages
also implement number theory, finite-field, elliptic-curve, LWE/lattice, RSA,
Diffie-Hellman, and related teaching calculations. A second file,
`js/ciphers/cipher-engines.js`, contains legacy standalone Vigenere, rail-fence, and
columnar implementations but is not loaded by the current exhibit pages found in
the audit.

### Engine inventory and actual conventions

Every current registry name was loaded and executed by the 88-spec engine suite.
The detailed per-engine contracts for the original engines are in
[`docs/ENGINE_INVENTORY.md`](ENGINE_INVENTORY.md), but its headline counts are stale;
CM-013 below records that documentation defect. The current inventory is:

| Actual implementation family and input convention | Registry engines |
|---|---|
| A–Z substitution/shift, integer or keyword key; punctuation policy varies by engine | `caesar`, `monoalphabetic`, `vigenere`, `beaufort`, `gronsfeld`, `porta`, `runningKey`, `confederateVigenere`, `bazeries`, `alberti`, `autokey`, `affine`, `trithemius`, `cardanoAutokey`, `wheatstone` |
| Coordinate, digraph, fractionation, or keyed-square models; most 5×5 forms merge I/J | `polybius`, `homophonic`, `playfair`, `hill`, `bifid`, `trifid`, `adfgx`, `adfgvx`, `nihilist`, `fractionatedMorse`, `foursquare`, `twosquare`, `straddlingCheckerboard`, `chaocipher`, `doublePlayfair` |
| Positional/transposition models; numeric rails/columns, keywords, routes, or explicit settings | `railFence`, `columnar`, `doubleTransposition`, `stager`, `scytale`, `cardanoGrille`, `nullCipher`, `rasterschluessel44`, `amsco` |
| Fixed encodings, symbols, codebooks, or illustrative mappings | `bacon`, `tapCode`, `pigpen`, `dictionaryCode`, `greatCipher`, `babington`, `navajo`, `voynich`, `atbash`, `rot13`, `beale`, `copiale`, `kryptos`, `nomenclator`, `bookCipher`, `kamaSutra`, `aeneasTacticus`, `jn25`, `morse`, `chineseTelegraph`, `zimmermann`, `commercialCode`, `culperRing`, `arnoldAndre`, `argenti`, `wallisCiphers`, `geezMonastic` |
| Pad/stream constructions; key length and generated-pad rules are engine-specific | `otp`, `venonaPadReuse`, `vernam`, `solitaire`, `diana` |
| Mechanical/rotor teaching models, generally seeded rather than accepting historical settings | `jefferson`, `enigma`, `lorenz`, `vic`, `m209`, `purple`, `sigaba`, `typex`, `redTypeA`, `fialka`, `kl7`, `geheimschreiber`, `kryha`, `m94`, `slidex`, `patterson`, `wadsworth` |

Important supported variants are not interchangeable. The full Enigma exhibit
accepts rotor order, reflector, ring settings, positions, and plugboard, whereas the
registry `enigma` accepts only three start-position letters and fixes rotors I/II/III
and reflector B. `rasterschluessel44`, `doublePlayfair`, and `amsco` accept explicit
structured settings in corpus replay; the v0.6 conventions are strict 60–200-letter
RS44 input, Double Playfair J→II with retained odd filler, and explicit AMSCO
permutation/first-cell size. Many later machine engines are seeded pedagogical
models, not emulators. CM-001 and CM-003 identify cases where the disclosed model
boundary is inadequate or contradictory.

### Corpus pipeline

The canonical dataset is `public/corpus/all.jsonl`; `all.json` and `all.csv` are
derived representations. `all.jsonl` and `all.json` are Git LFS objects and were
materialized before testing (99 MB and 126 MB respectively). The pipeline includes
batch generators, `scripts/expand-corpus-v06.js`, schema validation, replay through
the production registry, difficulty and browser subsets, LLM-evaluation export,
statistics, the engine manifest, and SHA-256 manifests. Supplemental historical and
multilingual files remain distinct from the 100,326 canonical records as documented
in [`public/corpus/README.md`](../public/corpus/README.md#L59).

### Build and deployment

There is no conventional compile step for the site. Metadata/search and minified JS
are checked in and reproducibly regenerated. CI in
[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) installs Node 22 packages,
checks release metadata, runs engine and general tests, lints HTML, and validates the
corpus on `main` pushes. A separate
[Pages workflow](../.github/workflows/deploy-pages.yml) checks out Git LFS data,
validates download hashes, uploads the repository root, and deploys it. CM-008
describes the missing dependency between those workflows.

## Coverage

| Area | Scope and method | Result / limit |
|---|---|---|
| Repository and history | Read `AGENTS.md`; recorded Git state; fetched origin; inspected branches, worktrees, tags, PR history, workflows, recent Actions runs | Complete for current commit and visible GitHub state; no branch/worktree changed |
| Registry ciphers | Loaded all 88 production engines; ran every spec, fixed vector, property/round-trip, Unicode, malformed-key, state-isolation, 100 KB, complexity, and mutation-canary test | 88/88 executed; 698/698 engine assertions passed. Independent KAT quality is uneven; see CM-001, CM-003, CM-013 |
| Dedicated/page implementations | Ran full Enigma vectors, 172 page vectors (502 assertions), deep/legacy/manual/foundation/protocol suites; source-reviewed special modules | Strong automated coverage, but not every animation state has a pixel oracle |
| Browser pages | Loaded all 206 HTML pages in Chrome at desktop and 390×844 touch/reduced-motion viewport | 206/206 documents returned success; no page exception, network-level failed local request, or horizontal overflow. Chrome made harmless fallback `/favicon.ico` requests that returned 404 on pages without an icon declaration |
| Interactive state | Exercised search/deep-link/reload, workbench keys, finite-field run/reset, and Wadsworth run/reset; existing suites covered common demo controls, manual ciphers, foundations, protocols, keyboard/static accessibility | Targeted dynamic coverage, not a full manual traversal of every control with a screen reader |
| Search/catalog | Queried accents, apostrophes, punctuation, multiword phrases, eras, empty/no-result behavior, URL reload, and an HTML-event payload | Defects CM-009 and CM-010; injection did not execute |
| Canonical corpus structure | Streamed and parsed all 100,326 JSONL records; compared every record byte-for-object with JSON; checked IDs, tags, required fields, key objects, split/type/source/license/language distributions, URLs, and length fields | 100% structurally inspected; zero duplicate IDs or malformed provenance URLs; CM-007 |
| Corpus cryptographic semantics | Full production replay plus exact deviation accounting; independently checked all 300 v0.6 additions through their dedicated regression suite; stratified historical/invariant review | 99,800 exact, 526 known-deviation records/1,051 events, zero unexplained. Replay does not validate historical pairs; CM-002 |
| Historical/provenance review | Inspected all 54 canonical `source_type: historical` records for invariants, labels, notes, and source specificity; checked decisive samples against official CIA, NSA, Bletchley Park, NARA, and archival sources | Not an exhaustive scholarly fact-check of every claim. Four invalid pairs are conclusive; generic or blocked sources remain evidence gaps, not presumed falsehoods |
| Generated/release integrity | Regenerated v0.6 corpus, metadata, and JS; inspected Git diff; checked all corpus SHA-256 entries and `git lfs fsck` | Deterministic: no tracked diff; all hashes and LFS objects valid |
| Service worker/cache | Ran existing service-worker/offline/version tests; checked live worker version and production responses | No mixed-cache defect reproduced; offline behavior was not exercised across a real two-version upgrade |
| Security/privacy | Traced inputs and sinks, external navigation, corpus render paths, local tooling, network calls, and dependency trees; browser-tested search injection; ran npm audits | No confirmed exploitable runtime security flaw. CM-015 is constrained toolchain exposure |
| External citations | Requested 133 distinct off-site HTML links with HEAD/GET fallback | 111 successful/partial, 13 automation-blocked (403), 1 transient 503, 3 transport failures, 5 definite 404s; CM-014 |

## Findings

### CM-001 — M-209 demonstration omits the lug cage it claims to teach

**Severity:** High<br>
**Evidence:** Confirmed by execution<br>
**Affected:** M-209 exhibit demo, shared registry engine, workbench, related corpus/KAT interpretation

**Code and claim.** The exhibit correctly explains that 27 lug bars convert active
wheel pins into a displacement from 0 through 27
([`ciphers/m209.html:91`](../ciphers/m209.html#L91)). The production engine instead
generates six Boolean pin arrays and returns the sum of the six active pins, expressly
bounded to 0–6
([`all-engines.js:1872`](../js/ciphers/all-engines.js#L1872),
[`all-engines.js:1886`](../js/ciphers/all-engines.js#L1886)). It never represents a
lug bar, bar overlap, effective/ineffective lug position, wheel start, or explicit pin
settings. The demo says only “Wheel Pin Seed,” while the workbench calls the same
opaque word “Wheel Settings.”

**Minimal reproduction.** Load the production registry and encode 200 `A` characters
with each of `HAGELIN`, `AAAAAA`, `SECRET`, and `M209`. The distinct output symbols
are subsets of `ABCDEFG`; because the engine applies `K - plaintext`, this directly
exposes only K=0…6. For `HAGELIN`, the set was `BCDEFG`. As a positive control, the
source and exhibit agree on six wheel periods, and the engine advances those periods.

**Expected / actual.** A model advertised as demonstrating the described M-209
mechanism should accept or faithfully derive six pin sets *and 27 two-lug drum bars*,
then count displaced bars. The current result merely sums the six pins. The US War
Department's March 1944 manual specifies the 27 drum bars and two lug positions per
bar; the NSA hosts both the
[catalog entry](https://www.nsa.gov/Helpful-Links/NSA-FOIA/Declassification-Transparency-Initiatives/Historical-Releases/Friedman-Documents/Publications/)
and [manual PDF](https://www.nsa.gov/Portals/75/documents/news-features/declassified-documents/friedman-documents/publications/FOLDER_075/41709299074861.pdf).

**Impact and root cause.** A successful animation teaches the wrong key-generation
mechanism and drastically changes the keystream distribution—the core cryptographic
idea of the exhibit. Round-trip and a pinned `A → E` regression vector cannot detect
this because encryption and decryption share the same toy transform.

**Repair and regression test.** Implement explicit pin, lug-bar, and start-position
settings (or clearly relabel the current control and output as a six-pin-sum toy that
is not an M-209 simulation). Add at least one independently transcribed manual
known-answer example, verify the 27-bar displacement calculation independently, and
test intermediate bar activation—not only final round-trip. Keep any simplified
mode visibly distinct.

**Remaining uncertainty:** This audit did not select a definitive historical key list
for a replacement vector; that does not affect the demonstrated 6-versus-27
structural contradiction.

### CM-002 — “Verified” historical corpus includes impossible and truncated pairs

**Severity:** High<br>
**Evidence:** Confirmed by execution<br>
**Affected:** Canonical corpus, historical subset, browser claims, benchmark consumers, published v0.6 interpretation

**Minimal reproduction and observed evidence.** All 54 canonical records with
`source_type: historical` have `verified: true`. A complete invariant scan followed
by source review found, among others:

| Record | Normalized plaintext / ciphertext lengths | Why the pair cannot be valid as represented |
|---|---:|---|
| `hist-enigma-barbarossa-001` ([JSONL line 21,565](../public/corpus/all.jsonl#L21565)) | 26 / 15 | Enigma emits one letter per input letter. The record's settings therefore cannot connect these strings. |
| `hist-enigma-weather-001` ([line 21,566](../public/corpus/all.jsonl#L21566)) | 29 / 21 | Same invariant; ciphertext is the literal alphabet prefix `ABCDEFGHIJKLMNOPQRSTU`. |
| `hist-lorenz-fish-001` ([line 21,567](../public/corpus/all.jsonl#L21567)) | 25 / 26 | Lorenz's teleprinter addition is symbol-for-symbol; the provided strings are not a pair. |
| `hist-kryptos-k1-001` ([line 21,596](../public/corpus/all.jsonl#L21596)) | 63 / 32 | The ciphertext stops after the first displayed line, although the plaintext continues. The CIA's official [Kryptos transcription](https://www.cia.gov/legacy/headquarters/kryptos-sculpture/) gives the rest of K1 (`YQT…MFD`) and also identifies the artwork as copyrighted by James Sanborn. |

The records' own `text_length` fields follow the truncated ciphertext in these
cases. `hist-kryptos-k3-001` similarly pairs an excerpt of plaintext with a much
longer ciphertext rather than defining aligned excerpts. Eleven of the 54 notes or
source fields explicitly say “reconstructed,” “illustrative,” or “training,” while
all still carry the same verified flag. Nine historical records cite the Museum's
own corpus page as provenance, and several cite only an archive home page. The site
nevertheless markets “54 canonical historical records with verified provenance”
([`cipher-corpus.html:345`](../cipher-corpus.html#L345)).

**Why tests pass.** Corpus replay explicitly exempts historical records by engine
name whenever the teaching API cannot express their settings
([`tests/engines/corpus-replay.js:68`](../tests/engines/corpus-replay.js#L68),
[`tests/engines/corpus-replay.js:104`](../tests/engines/corpus-replay.js#L104)). It
pins the aggregate mismatch count, but it never establishes that an exempt pair is
real, mutually corresponding, or supported by its URL. This explains how “zero
unexplained failures” and false historical pairs coexist.

**Impact and root cause.** Researchers and learners can treat placeholder or excerpt
data as authenticated known-answer material. The generic Boolean `verified` conflates
schema review, transcription review, source identity, and cryptographic
reproducibility. Generic landing pages and a blanket `public domain` label do not
support record-level provenance; the official CIA page explicitly contradicts that
rights label for Kryptos itself.

**Repair and regression test.** Do not rewrite the immutable Zenodo v0.6 archive.
For the next dataset version, define separate fields for `source_verified`,
`transcription_verified`, `pair_verified`, and `reconstructed`; provide record-level
citations; distinguish excerpts; correct rights metadata; and either supply the full
pair/settings or label the record as a non-paired historical teaching excerpt. Add
length-preservation invariants by cipher family and require source-backed hashes or
transcriptions for a “verified historical” badge. Tests must fail if a length-
preserving pair differs in symbol count.

**Remaining uncertainty:** This was a 100% structural review and a 54/54
invariant/provenance-label review, not a full archival authentication of all 54
items. Records not listed above are not thereby certified or condemned.

### CM-003 — KL-7 and Fialka “models” contradict the mechanisms shown beside them

**Severity:** High<br>
**Evidence:** Confirmed by execution<br>
**Affected:** KL-7 and Fialka exhibits, workbench, registry engines, seeded-model KATs

**KL-7.** The exhibit says that the re-entrant alphabet is wider than 26 and that
signal flow is one-way with **no reflector**
([`ciphers/kl-7.html:86`](../ciphers/kl-7.html#L86)). The engine uses an A–Z alphabet,
constructs a pairwise reflector, traverses all eight rotors forward and backward,
and exports the same function for encode and decode
([`all-engines.js:2598`](../js/ciphers/all-engines.js#L2598)). Executing the actual
engine confirmed `encode(encode("ATTACKATDAWN", "TSEC"), "TSEC")` returns the
plaintext. That is an Enigma-like reflector involution, the opposite of the adjacent
explanation.

**Fialka.** The exhibit says five rotors step forward and five backward on each
keypress ([`ciphers/fialka.html:86`](../ciphers/fialka.html#L86)). The engine moves
only rotor 0 on every character, rotors 1–3 on 7/31/91-character intervals, and uses
rotors 4–9 as stators; it also constructs a reciprocal reflector
([`all-engines.js:2541`](../js/ciphers/all-engines.js#L2541)).

**Expected / actual and impact.** “Model” in the workbench name discloses that this
is not a key-compatible emulator, but does not license reversal of the defining
properties the same page asks the learner to understand. The demos' animation/output
can therefore reinforce a false mental model. Pinned output vectors merely stabilize
the invented seeded shuffle.

**Root cause.** Generic 26-letter seeded-reflector scaffolding was reused for
machines whose alphabet and signal path are essential differences.

**Repair and regression test.** Either implement the page's structural mechanisms or
give each demo a prominent, precise disclosure listing every omitted/replaced
feature and avoid statements that the model “matches” the real machine. Add tests
over intermediate signal direction and rotor movement: KL-7 must not rely on a
reflector involution, and the Fialka model must exercise the documented ten-rotor
counter-motion if it claims to demonstrate it. Use independent references rather
than seeded output snapshots.

**Remaining uncertainty:** Public details of these classified machines are
incomplete. The finding is limited to contradictions between this repository's own
explanation and implementation, so it does not depend on resolving every historical
setting.

### CM-004 — Pages can publish a commit before—or without—its CI result

**Severity:** High<br>
**Evidence:** Confirmed by execution and GitHub run history<br>
**Affected:** Release integrity, all deployed pages and downloads

**Trigger and reproduction.** Push any commit to `main`. CI and Pages are separate
workflows with the same trigger. The Pages job has no dependency on CI and checks
only corpus hashes before uploading the whole repository
([`deploy-pages.yml:18`](../.github/workflows/deploy-pages.yml#L18)); the full checks
run independently in [`ci.yml:9`](../.github/workflows/ci.yml#L9). On the audited
commit, [Pages finished at 17:45:19Z](https://github.com/systemslibrarian/cipher-museum/actions/runs/38160911087)
and [CI finished at 17:48:24Z](https://github.com/systemslibrarian/cipher-museum/actions/runs/38160911057).
More decisively, commit `85a0b421…` was
[successfully deployed](https://github.com/systemslibrarian/cipher-museum/actions/runs/38142874862)
while its corresponding [CI run was cancelled](https://github.com/systemslibrarian/cipher-museum/actions/runs/38142874941).
The `main` branch is not protected, and the `github-pages` environment has no
approval rule.

**Expected / actual.** A production artifact should deploy only after all required
tests for that exact SHA succeed. Actual deployment is a race between independent
workflows and cannot consume CI's conclusion.

**Impact and root cause.** A syntactically deployable but semantically broken cipher,
stale generated asset, or failing test can become public. GitHub's official
[custom Pages workflow documentation](https://docs.github.com/en/enterprise-cloud%40latest/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
uses `needs` to order build/validation and deployment. Here deployment was split
without an equivalent gate.

**Repair and regression test.** Put validation/build and deploy in one workflow with
the deploy job `needs` the exact-SHA validation jobs, or trigger a deployment
workflow from a successful completed CI run while verifying its SHA and branch.
Add branch protection/required checks and a Pages environment policy. Test a
deliberately failing validation commit in a non-production fork and assert no Pages
deployment is created.

**Remaining uncertainty:** The demonstrated cancelled CI run does not prove that
that particular deployed artifact was broken; it proves the required gate does not
exist.

### CM-005 — The workbench silently changes or misinterprets valid-looking keys

**Severity:** Medium<br>
**Evidence:** Confirmed by execution<br>
**Affected:** Common workbench for Caesar, Enigma, Alberti, and Affine

**Minimal reproductions.** Using `lab/workbench.html` and its actual registry engines:

| Selection/input/key | Expected from label/convention | Observed |
|---|---|---|
| Caesar, `ABC`, shift `0` | `ABC` | `DEF`; `parseInt(k) || 3` treats zero as absent ([source](../js/ciphers/all-engines.js#L59)) |
| Enigma, `AAAAA`, default `I,II,III/AAA` | Rotor I/II/III, positions AAA → canonical `BDZGO` | `XVEBQ`; cleaning the whole string makes its first three letters `III`. Supplying `AAA` produces `BDZGO` ([source](../js/ciphers/all-engines.js#L953)) |
| Alberti, `ATTACK`, displayed default `K` | A setting derived from K or an error | `YLLYDH`, exactly the same as numeric setting `3`; `parseInt("K") || 3` silently defaults ([source](../js/ciphers/all-engines.js#L884)) |
| Affine, `ABCXYZ`, invalid `4,8` | Validation error because 4 is not invertible mod 26 | `INSTYD`, exactly the result for `5,8`; parser snaps to a nearby valid value ([source](../js/ciphers/all-engines.js#L2817)) |

The misleading field metadata is at
[`lab/workbench.html:186`](../lab/workbench.html#L186) through
[`lab/workbench.html:221`](../lab/workbench.html#L221); the run path passes the string
unchanged and displays no normalized key
([`lab/workbench.html:284`](../lab/workbench.html#L284)). The dedicated Caesar
implementation is a positive control: it preserves shift zero.

**Impact and root cause.** Learners can enter a documented boundary value or accept a
provided default and receive output from a different key without notice. This is
cryptographic correctness, not merely validation polish. Generic workbench metadata
does not match engine-specific parsers; JavaScript truthiness and silent key repair
hide the mismatch.

**Repair and regression test.** Define typed key schemas per engine, reject rather
than snap malformed keys, preserve numeric zero, and display the effective normalized
key. For simplified Enigma, label the input “start positions (three letters)” and use
`AAA`; do not advertise rotor/plugboard fields it cannot parse. Add browser tests for
the exact four rows above plus invalid/empty/Unicode keys.

**Remaining uncertainty:** No other silent coercions are asserted as findings here;
the engine suite's invalid-key contract intentionally permits some defaults and
needs a product-level decision per engine.

### CM-006 — Reset does not cancel two active animations

**Severity:** Medium<br>
**Evidence:** Confirmed by execution<br>
**Affected:** Finite-field elliptic-curve walk and Wadsworth interactive

**Minimal reproduction.** In Chrome with normal motion:

1. On `hall-of-foundations/finite-fields.html`, select Run, wait 210 ms, then Reset.
   The reset display was immediately `k = 1` in the observed run and advanced to
   `k = 3, kG = (24, 10)` 420 ms later.
2. On `ciphers/wadsworth-cipher.html`, select Run All, then Reset. The output becomes
   empty, but 600 ms later the old interval writes `B` back to the tape.

**Expected / actual.** Reset or an input/key change should invalidate outstanding
work and leave the new state stable. Both implementations store the interval in a
function-local `iv`, so reset cannot clear it
([`finite-fields.html:275`](../hall-of-foundations/finite-fields.html#L275),
[`finite-fields.html:278`](../hall-of-foundations/finite-fields.html#L278),
[`wadsworth-cipher.html:474`](../ciphers/wadsworth-cipher.html#L474)). A positive
control is `js/manual-cipher-demos.js`, whose controller retains and stops its timer.

**Impact and root cause.** Results mix pre-reset and post-reset state; rapid Run
clicks can create multiple writers. For an educational step display, the shown
intermediate point or ciphertext can no longer be attributed to the visible action.

**Repair and regression test.** Store one timer per controller; cancel it on run,
reset, navigation-relevant changes, and reduced-motion transitions; or use a
generation token checked by every callback. A fake-timer/browser test should assert
state remains reset after at least two old tick periods and that repeated Run creates
only one sequence.

**Remaining uncertainty:** The two confirmed pages were selected from distinct
shared interaction patterns. Other inline animations without retained handles should
be searched during repair.

### CM-007 — Benchmark runner does not recognize the corpus's blind split

**Severity:** Medium<br>
**Evidence:** Confirmed by execution<br>
**Affected:** `scripts/benchmark-runner.js`, benchmark reports/receipts, runner documentation

**Minimal reproduction.** An isolated two-line corpus was created with one
`split:"public"` and one `split:"blind"` record plus an echo solver. The production
command reported `echo: 2/2 exact (100.0%)` and wrote both records. The filter checks
`record.blind` instead of `record.split === "blind"`
([`benchmark-runner.js:52`](../scripts/benchmark-runner.js#L52)). No canonical record
has the Boolean field.

**Expected / actual.** The comment says blind records are skipped for training, and
the runner guide says it enforces separate training/evaluation. Actual code executes
one undifferentiated pass over all records. The guide also names nonexistent
`public/corpus/all.v2.jsonl`
([`docs/benchmark-runner.md:1`](benchmark-runner.md#L1)). The two runner tests exist
but are not invoked from `tests/run-all.js`, and their fixtures contain no `split`.

The governance document correctly says both labels are public and “blind” is not
confidential ([`blind-split-policy.md:1`](blind-split-policy.md#L1)). In contrast, the
schema calls it “held-out”
([`cipher-corpus.schema.json:21`](../public/corpus/cipher-corpus.schema.json#L21)),
generation documentation recommends holding the downloadable records out, and the
LLM export comment incorrectly says public-only selection “cannot leak” that split.

**Impact and root cause.** Report consumers can believe they measured a designated
split when they actually measured the full corpus. The wrong legacy field name,
stale docs, and missing test-suite registration jointly conceal it.

**Repair and regression test.** Decide and name explicit runner modes (`--split
public`, `--split blind`, or both reported separately), filter the `split` enum, put
the runner tests in the default suite, and assert output IDs and denominators for a
mixed fixture. Use “downloadable evaluation split label,” never confidential or
unseen held-out data; genuinely unseen evaluation must live elsewhere.

**Remaining uncertainty:** No external reports produced by this runner were found in
the repository, so downstream impact outside it is unknown.

### CM-008 — Corpus length fields have incompatible meanings but drive statistics

**Severity:** Medium<br>
**Evidence:** Confirmed by execution<br>
**Affected:** Canonical schema/data, generated benchmark statistics, downstream consumers

**Full-corpus reproduction.** Across all 100,326 records:

- `text_length` equaled raw plaintext length in 17,211 records and raw ciphertext
  length in 97,495; 2,749 matched neither (categories overlap when lengths agree).
- `normalized_text_length` equaled an A–Z/0–9 plaintext count in 75,628 and the
  ciphertext count in 86,400; 10,671 matched neither (again with overlap).
- The v0.6 generator explicitly sets both fields from plaintext
  ([`expand-corpus-v06.js:53`](../scripts/expand-corpus-v06.js#L53)), while older
  batches evidently follow other conventions.

The schema requires both fields but defines only “integer,” without a minimum or
semantics ([`cipher-corpus.schema.json:42`](../public/corpus/cipher-corpus.schema.json#L42)).
Nevertheless, the report generator averages `normalized_text_length` as though it
were one comparable measure
([`generate-benchmark-report.js:44`](../scripts/generate-benchmark-report.js#L44)).

**Expected / actual and impact.** A named length metric should specify source field,
Unicode normalization, permitted alphabet, whitespace/punctuation, and treatment of
multi-symbol preparations such as J→II. Actual values mix at least plaintext- and
ciphertext-oriented conventions. Aggregate “average normalized length” and filters
can therefore compare different quantities.

**Root cause.** The schema versioned field presence, not field meaning, across
several generator generations; preservation of the immutable prefix retained those
differences.

**Repair and regression test.** Preserve old records but document legacy semantics,
add unambiguous versioned fields such as `prepared_plaintext_symbol_count` and
`ciphertext_symbol_count`, and make statistics choose one. Schema/tests should
define normalization and independently recompute the declared counts per algorithm.

**Remaining uncertainty:** Because the schema supplies no normative definition,
10,671 “neither” results are evidence of ambiguity, not by themselves proof that
each stored integer is wrong.

### CM-009 — Search fails advertised unaccented names and does not preserve edited state

**Severity:** Medium<br>
**Evidence:** Confirmed by execution<br>
**Affected:** Search page, aliases/diacritics, search deep links and browser history

**Minimal reproduction.** The page placeholder and quick-search button both offer
ASCII `vigenere`
([`search.html:56`](../search.html#L56), [`search.html:81`](../search.html#L81)). In
Chrome, that query returned zero cards; `Vigenère` returned 11. A query containing
only `é` also returned none. The index haystack retains accents, but query tokens are
split with ASCII-only `/[^a-z0-9]+/` and neither side is Unicode-normalized
([`js/search.js:52`](../js/search.js#L52), [`js/search.js:67`](../js/search.js#L67)).

For state, load `search.html?q=enigma`, replace the input with `vigenere`, and wait.
The URL remains `?q=enigma`; reload restores `enigma`. Filter changes likewise do
not enter the URL or history because the query string is read only once
([`search.html:177`](../search.html#L177), [`search.html:186`](../search.html#L186)).

**Expected / actual and impact.** Common unaccented aliases should find canonical
names, and a visible search state should be shareable/restorable. The advertised
button itself produces an empty result, and back/forward/reload can show a different
query than the one the user last saw.

**Repair and regression test.** Normalize both index and query with NFKD/NFD plus
combining-mark removal, preserve meaningful apostrophes, and add explicit aliases.
Synchronize query and filter with `history.replaceState`/`pushState` and handle
`popstate`. Browser-test `vigenere`/`Vigenère`, composed/decomposed accents, Geʼez
apostrophe forms, encoded multiword URLs, reload, and back/forward.

**Remaining uncertainty:** `Étienne`, `Geʼez`, and `double playfair` happened to work
because their surviving ASCII substrings matched; this is not general Unicode
support.

### CM-010 — Era metadata and substring matching make WWI search historically false

**Severity:** Medium<br>
**Evidence:** Confirmed by execution<br>
**Affected:** Search index generation and era search

**Minimal reproduction.** Search `wwi`. It returns WWII entries because token matches
are raw substrings (`wwi` is a prefix of `wwii`)
([`js/search.js:92`](../js/search.js#L92)). It also returns three US Civil War
exhibits—Confederate Vigenère, Confederate Dictionary Code, and Stager—because their
1861/1862 badges use the CSS class `era-wwi`
([`confederate-vigenere.html:65`](../ciphers/confederate-vigenere.html#L65),
[`dictionary-code.html:65`](../ciphers/dictionary-code.html#L65),
[`stager.html:65`](../ciphers/stager.html#L65)). The index builder cannot recognize
their badge text as an era, so it falls back to that class
([`build-search-index.js:128`](../scripts/build-search-index.js#L128),
[`build-search-index.js:187`](../scripts/build-search-index.js#L187)).

**Expected / actual and impact.** Partial title matching can be useful, but controlled
era tags should have token boundaries and historically valid source metadata. A WWI
filter/query currently teaches that 1861–1865 exhibits belong to WWI and conflates
both world wars.

**Repair and regression test.** Correct the Civil War badge classes; store eras as
explicit controlled metadata rather than infer them from presentation classes; and
use exact tag matching for `wwi`/`wwii` while retaining substring matching for titles
where appropriate. Assert Civil War, WWI, and WWII result sets separately.

**Remaining uncertainty:** Broad hall pages intentionally span multiple eras and
should be specified separately from single-event exhibit tags.

### CM-011 — “Broken” trust badges contradict their own evidence notes

**Severity:** Medium<br>
**Evidence:** Confirmed by execution<br>
**Affected:** Trust-label system and at least VIC, Stager, Culper Ring, Arnold–André, and Che Guevara exhibits/search cards

The global badge definition says “Broken” means **cryptographically broken**
([`data/trust-labels.json:2`](../data/trust-labels.json#L2)). Yet the data marks as
broken entries whose notes say “Never broken by cryptanalysis,” “Never broken in
wartime,” “never captured, never broken,” or compromised through physical capture
([`data/exhibit-trust.json:27`](../data/exhibit-trust.json#L27),
[`data/exhibit-trust.json:83`](../data/exhibit-trust.json#L83)). Browser rendering
shows the generic “Broken” badge beside the contradictory note.

**Expected / actual and impact.** Cryptanalytic defeat, key/document capture,
operator compromise, obsolescence, and unsuitability for modern use are distinct
historical/security claims. The UI collapses them into a label whose tooltip makes a
more specific false assertion. Learners can infer that stolen keys demonstrate a
cipher attack.

**Root cause.** One safety-oriented Boolean taxonomy is being used as both a modern
warning and a historical account of how a system failed.

**Repair and regression test.** Use orthogonal labels (for example, “historical/not
for modern security,” “public cryptanalytic break,” and “operational compromise”) or
change the definition and visible wording so it does not claim cryptanalysis. Add a
semantic consistency test that rejects `broken` records whose evidence note says
never cryptanalytically broken unless an explicit distinct compromise field is set.

**Remaining uncertainty:** This audit did not independently adjudicate every trust
record; the five internal contradictions are sufficient for this finding.

### CM-012 — Five curated further-reading links return definitive 404 responses

**Severity:** Low<br>
**Evidence:** Confirmed by execution<br>
**Affected:** `further-reading.html`

The external-link sweep covered 133 distinct off-site HTML URLs. Five returned 404
after HEAD/GET fallback: Jason Fagone's author page
([line 289](../further-reading.html#L289)), a Google Scholar profile
([line 466](../further-reading.html#L466)), an old Uppsala faculty page
([line 474](../further-reading.html#L474)), the Cryptiana code page
([line 482](../further-reading.html#L482)), and NARA's old SIGINT finding-aid URL
([line 553](../further-reading.html#L553)). Thirteen 403s, one 503, and three transport
failures were treated as unavailable evidence—not as broken or false sources.

**Impact/root cause.** Users cannot reach five explicitly curated resources; ordinary
link rot is the likely cause. This finding does not challenge the nearby historical
claim merely because its link failed.

**Repair and regression test.** Replace each with the publisher/archive's current
canonical URL or a stable archived copy, preserving title/author identity. Run an
allowlisted external link checker periodically and distinguish 404 from bot blocking.

**Remaining uncertainty:** Server responses can change; recheck immediately before
editing.

### CM-013 — Engine audit/inventory describes the previous 84-engine, v0.5 system

**Severity:** Low<br>
**Evidence:** Source-confirmed defect, not separately executed<br>
**Affected:** Engine audit documentation and top-level registry comment

The live registry exports 88 engines, there are 88 matching spec files, and the
canonical corpus is v0.6 with 100,326 records. The inventory still declares 84
engines and v0.5/100,026 records
([`ENGINE_INVENTORY.md:7`](ENGINE_INVENTORY.md#L7)); it omits `patterson`,
`rasterschluessel44`, `doublePlayfair`, and `amsco`. The audit repeats 84/84,
100,026, and 18 pinned vectors
([`ENGINE_AUDIT.md:9`](ENGINE_AUDIT.md#L9)), although its own list contains 19 names
and current known-answer metadata has changed. The source header also says 84 engines
across 140 exhibits ([`all-engines.js:7`](../js/ciphers/all-engines.js#L7)).

**Expected / actual and impact.** Audit evidence should identify the software it
actually covers. Readers can mistake old 84-engine certification for current full
coverage, while the four newest engines are validated elsewhere.

**Repair and regression test.** Regenerate counts and coverage tables directly from
the registry/spec/corpus manifests; add the four implementation rows and date/commit
scope; separate historical audit results from current continuous status. Add a doc
consistency test for declared registry/spec/corpus totals.

**Remaining uncertainty:** Most individual original 84 rows still accurately
describe their APIs; this finding does not invalidate each row.

### CM-014 — Corpus schema permits semantically malformed records and duplicate tags

**Severity:** Low<br>
**Evidence:** Confirmed by execution<br>
**Affected:** Canonical schema/validator and 484 noisy records

The complete scan found 484 records whose `tags` arrays contain at least one duplicate
(usually `noisy`). The schema defines tags as an unconstrained string array and does
not use `uniqueItems`; IDs and most strings likewise lack minimum length/pattern
constraints, length integers lack minima, and `key` accepts any object
([`cipher-corpus.schema.json:9`](../public/corpus/cipher-corpus.schema.json#L9),
[`cipher-corpus.schema.json:53`](../public/corpus/cipher-corpus.schema.json#L53)). The
current validator therefore reports all 100,326 valid even when these semantic
conditions are violated or undefined.

**Expected / actual and impact.** “Schema valid” should remain a syntactic claim, but
duplicate tags create noisy filters/statistics and the permissive schema can accept
plausible but unusable records. This is lower severity because current consumers
generally deduplicate or tolerate the values and IDs are in fact unique.

**Repair and regression test.** Add safe constraints in the next schema version,
keep algorithm-specific semantic validation separate, and de-duplicate tags during a
future versioned data release rather than rewriting v0.6. Include negative fixtures
for duplicate tags, negative lengths, empty IDs, malformed typed keys, and invalid
pair invariants.

**Remaining uncertainty:** Tightening the current schema in place could make the
published corpus fail its own schema; version it deliberately.

### CM-015 — npm reports current advisories, but audited reachability is tooling-only

**Severity:** Low<br>
**Evidence:** Confirmed by execution (advisory scan); exploit not reproduced<br>
**Affected:** Development/validation dependency tree, not shipped browser JavaScript

`npm audit` reported four high-severity package entries with fixes available:
`brace-expansion`, `fast-uri`, `form-data`, and `ws`. With dev dependencies omitted,
only `fast-uri@3.1.2` remains, transitively through `ajv@8.20.0`; current advisories
include [GHSA-fph4-wmhf-6fwf](https://github.com/advisories/GHSA-fph4-wmhf-6fwf)
and related URI authority/normalization issues. Ajv is used by the Node corpus
validator over repository-controlled schemas/data and is not served to browsers.
The validator does not make network requests from validated URLs, so SSRF or host
confusion was not reachable in the audited flow. The other three packages are dev
dependencies.

**Expected / actual and impact.** A clean lockfile is preferable, but package-advisory
severity is not the application's impact. The realistic exposure is local/CI
validation correctness or denial of service if an operator deliberately feeds
untrusted pathological inputs; no production runtime compromise was demonstrated.

**Repair and regression test.** Update the lockfile through normal dependency review,
rerun the full suite, and add a policy that separately reports shipped, CI, and dev
dependency reachability. If corpus validation becomes an upload service, reassess
these advisories before accepting untrusted schemas or URLs.

**Remaining uncertainty:** This is not a proof that every advisory primitive is
unreachable in every ad-hoc developer use; it is the traced reachability of repository
scripts and the deployed site.

## Corpus validation and semantic sampling

The structural pass parsed **100,326/100,326 (100%)** records, found **100,326 unique
IDs**, and compared every JSON array entry with its JSONL source (zero mismatches).
It confirmed 85 cipher-type labels, 70,132 public and 30,194 blind labels, 100,272
synthetic and 54 historical source labels, and 9 languages. License labels are 99,972
`CC0`, 300 `CC0-1.0`, and 54 `public domain`; this count describes the metadata and
does not validate rights ownership.

Semantic coverage was stratified as follows:

- **All 100,326 records:** production encode/decode replay with exact event
  accounting. This tests compatibility with the current engine/convention, not
  historical authenticity.
- **All 300 v0.6 additions (100 RS44, 100 Double Playfair, 100 AMSCO):** deterministic
  regeneration, explicit structured-key checks, independent manual-cipher test
  procedures, export parity, preserved old prefix, and corpus replay. No defect was
  found in this new subset.
- **All 54 canonical historical records:** source specificity, verified/reconstructed
  labels, length-preservation invariants, and notes were reviewed. Decisive records
  were compared to official/archival transcriptions. This yielded CM-002.
- **All 88 engine labels:** property/round-trip/robustness/performance specs, with
  fixed-vector quality classified. Many seeded machine vectors are regression
  snapshots rather than independent known answers, so passing them was not treated
  as historical proof.

The replay outcome was **99,800 exact record passes, 526 known-deviation records,
1,051 known mismatch events, and zero unexplained failures**. Its exception rules are
valuable regression accounting, but CM-002 shows why the phrase “cryptographically
verified corpus” would overstate that evidence.

## Test quality assessment

### What the tests do well

- The 88-engine spec registry compares actual engine names with spec filenames,
  executes boundary/Unicode/invalid-key/state-isolation cases, and uses property
  generation rather than one happy-path example.
- The serial complexity guard judged all 88 engines and its quadratic canary was
  caught at about 14.7×/15.8×, demonstrating that the guard can fail.
- Mutation canaries caught deliberately corrupted Caesar and Playfair behavior.
- The full Enigma implementation has independent known-answer vectors; manual v0.6
  ciphers have procedure-specific regression coverage.
- Corpus replay pins both total records and each known-deviation event count, so a
  new mismatch cannot silently enter an existing broad category.
- Static accessibility, link, navigation, responsive, and generated-asset checks
  cover the shipped files rather than only source templates.

### Gaps demonstrated by findings

- A round-trip plus a pinned output from the same implementation cannot validate a
  historical algorithm. CM-001 and CM-003 pass those tests.
- Corpus replay exceptions validate accounting, not the truth of exempt records.
  CM-002 passes replay and schema validation.
- UI metadata and parser behavior are not contract-tested end to end; CM-005 passes
  engine-level tests.
- Existing interaction tests do not advance timers after Reset; CM-006 survives.
- Benchmark-runner tests are not registered in the main suite and omit split fields;
  CM-007 survives.
- Search tests cover generated/index structure more than Unicode and history state;
  CM-009 and CM-010 survive.
- Deployment workflow correctness is not tested as a release state machine; CM-004
  is visible only in workflow source and run history.

## Security and privacy conclusions

The deployed site is static. No file upload/archive extraction surface, server-side
request path, account/session state, analytics beacon, or intentional telemetry was
found. Searches and demo outputs use text nodes/escaping in the reachable paths. A
search payload `<img src=x onerror="window.__auditXSS=1">` did not execute. Existing
external links generally use `rel="noopener"`, and local-link/static checks passed.
The 100 KB engine inputs and complexity tests found no practical superlinear freeze
in the registry; the complexity canary proved the detector is active.

Some source contains `innerHTML`, including controlled error/teaching markup, but no
reachable user-controlled HTML sink was demonstrated. That distinction matters: a
potentially dangerous API call is not by itself an exploitable finding. Dependency
advisories are scoped in CM-015. The intentionally weak ciphers and public “blind”
records are product characteristics, not security/privacy vulnerabilities.

## Earlier audit status

| Earlier report/item | Current status |
|---|---|
| `docs/site-audit-2026-08-04.md`: Patterson line limit, Pigpen caption, Polybius HELLO, Slidex dimensions, Kryptos count, Beale caveat, Enigma rotor wording | Rechecked and resolved on audited `main` |
| `docs/pr-hostile-audit-2026-10-10.md`: artifact/deploy mismatch, performance guard, offline metadata, classification, Myszkowski stale state | Rechecked as resolved in application/tests; CM-004 is a distinct remaining exact-SHA CI gate defect |
| `docs/ENGINE_AUDIT.md`: seeded-model independent KAT limitation | Still materially relevant; current document/count is stale (CM-013), and source comparison exposed CM-001/CM-003 |
| Corpus v0.6 PR/release checks | Counts, original prefix, 300 additions, deterministic generation, hashes, LFS, CI, and live deployment reconfirmed; historical truth claim remains defective (CM-002) |
| Open pull requests | None at audit start; closed/unmerged PR #3 was not treated as production code |

## Commands and outcomes

All substantive commands ran in the detached audit worktree unless explicitly noted.

| Command/check | Outcome |
|---|---|
| `git fetch origin --prune`; Git/PR/worktree inspection | Audited SHA matches `origin/main`; primary tree initially clean; no open PRs |
| `git lfs pull`; file inspection | Real 99 MB JSONL and 126 MB JSON materialized, not pointer text |
| `npm ci` under Node 22.23.2 | Succeeded; npm reported four high advisory entries |
| `npm run validate:release` | Passed (software 1.0.0/MIT and dataset v0.6 metadata distinguished) |
| `npm run test:engines` | Passed: 698/698 engine assertions; 88/88 specs; complexity/mutation/corpus replay passed |
| `npm test` | Passed: legacy 453 pass/2 intentional skips; deep 249; comprehensive 1,951; full Enigma 9; page vectors 502; accessibility 2,050; structural 2,271; 6,266 local links; other registered suites passed |
| `npm run lint:html` | Passed for 204 lint-target HTML files |
| `npm run validate:corpus` | 100,326 valid, 0 invalid |
| `node tests/test-corpus-v06.js` | Passed all v0.6 count/prefix/key/export/regeneration assertions |
| `node scripts/expand-corpus-v06.js` | Passed; 100,326 records/85 types/300 additions; no tracked diff |
| `npm run build:metadata`; `npm run build:js` | Passed; no tracked diff |
| `shasum -a 256 -c public/corpus/SHA256SUMS.txt` | Every listed artifact OK |
| `git lfs fsck` | OK |
| Chrome all-page sweep | 206/206 desktop and mobile documents loaded; 0 exceptions/network-level local failures/mobile horizontal overflows; fallback `/favicon.ico` 404s had no content impact |
| Targeted Chrome interaction harness | Reproduced CM-005, CM-006, CM-009, CM-010, and CM-011 |
| Full JSONL audit harness | Reproduced CM-002, CM-008, CM-014; JSON/JSONL parity exact |
| Two-record benchmark fixture | Reproduced CM-007: public and blind both scored (2/2) |
| External-link sweep | 133 unique off-site links; 5 definite 404s, recorded as CM-012 |
| `npm audit`; `npm audit --omit=dev`; `npm explain` | 4 total high entries; 1 non-dev (`fast-uri` via Ajv); reachability assessed in CM-015 |
| GitHub Actions/API inspection | Reproduced CM-004; `main` unprotected and Pages environment lacks approval rules |

## Prioritized repair order

1. **Quarantine misleading educational output:** label/disable the current M-209,
   KL-7, and Fialka models until the mechanism or disclosure is corrected (CM-001,
   CM-003).
2. **Correct the corpus trust contract:** publish an erratum now and prepare a
   versioned future dataset correction with pair/provenance verification fields and
   invariant tests; do not mutate the v0.6 archive (CM-002, then CM-008/CM-014).
3. **Gate deployment on exact-SHA CI success** and protect `main`/Pages (CM-004).
4. **Fix end-to-end user correctness:** typed workbench keys, cancellable animations,
   and split-aware benchmark execution (CM-005 through CM-007).
5. **Repair discovery/trust semantics:** Unicode/URL search, controlled eras, and
   non-conflated compromise labels (CM-009 through CM-011).
6. Refresh audit docs, links, schema constraints, and dependencies (CM-012 through
   CM-015).

## Unresolved release risk and limits

The current site is structurally healthy and reproducible, but it should not be
described as fully historically or cryptographically verified. The main release
risks are misleading machine demonstrations, overclaimed historical corpus records,
and deployment that is not gated by CI. These are present on the audited `main`, not
merely in unmerged proposals.

Coverage limits are explicit: the audit did not authenticate every historical claim
against an original manuscript, did not use a physical M-209/KL-7/Fialka, did not run
a full assistive-technology lab, did not simulate a real two-version service-worker
upgrade, and did not exercise every one-off animation visually frame by frame. Links
blocked by automation were not declared broken, and unavailable evidence was not
converted into a false-claim finding. Within those limits, every reported defect has
a traced production path and reproducible evidence; speculative concerns were
excluded.
