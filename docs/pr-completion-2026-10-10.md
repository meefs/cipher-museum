Cipher Museum audit archive and suite clarification — 2026-10-10

This documentation follow-up archives the [original FAIL review](pr-review-2026-10-10.md), [repair verification](pr-repair-2026-10-10.md), and [fresh hostile recheck](pr-hostile-audit-2026-10-10.md), together with their complete supporting evidence. The 308 original report/evidence files are preserved byte-for-byte. Their historical verdicts, local-only status statements, branch bases and tested SHAs describe the time of those reports; this later archival commit does not rewrite that evidence.

The repair and hostile recheck tested PR #1 at `c29a8668e2c3dcb4e6e5b46bc61c0f95e0edca72` and PR #2 at `abaaceec27f63ecb13770a7ec8fdf9852b0f6330`. New documentation commits have different SHAs. Historical local macOS results remain evidence for those named revisions; hosted CI results for subsequent documentation heads must be recorded separately in the PRs. No new local full-suite or browser run is implied by this archive.

The shorthand “29/30 suites” described different totals, not a partial pass:

| PR | Registered top-level suites | Executed | Passed | Failed | Skipped top-level suites |
| --- | --- | --- | --- | --- | --- |
| #1 | 29 | 29 | 29 | 0 | 0 |
| #2 | 30 | 30 | 30 | 0 | 0 |

PR #2 adds `tests/test-historical-exhibits.js`, which verifies its four new exhibits, independent vectors, actual DOM controls, canonical classifications, registration and offline dependency closure. PR #1 contains no such exhibits, so that suite is not registered there. It is an additional passing suite on PR #2, not a failure or a skipped common suite. The exact registered lists and historical execution markers are recorded in [suite-accounting.json](pr-completion-2026-10-10/suite-accounting.json).

Both legacy engine runs have two documented subcheck skips: Fractionated Morse’s encrypt-only legacy fixture, and Caesar’s generic configuration check because its exhibit has a dedicated demo. These skips do not remove any top-level suite. The 689 engine property specs and production timing coverage of all 85 registry engines have no skips; the real quadratic and invalid-key canary failures are expected negative controls. No test exclusion or threshold changed in this documentation follow-up. Narrow `.gitattributes` rules preserve the dated audit files verbatim: `-text` prevents line-ending conversion, and captured `.log`, `.patch` and `.diff` files permit their original trailing spaces/blank final lines. The staged archive initially triggered Git whitespace diagnostics on captured output and diff context; trimming those artifacts would invalidate their hashes. Runtime source and ordinary prose keep their existing whitespace checks.

A-0 concerned remote access to the repair record. The [archive inventory](pr-completion-2026-10-10/archive-inventory.json) hashes all 308 original report/evidence files. The [verification helper](pr-completion-2026-10-10/verify-audit-archive.py) checks those bytes, all five historical hash manifests, and relative report links directly from a staged or committed tree:

```sh
python3 docs/pr-completion-2026-10-10/verify-audit-archive.py --ref <fetched-remote-head>
```

The [precommit verification](pr-completion-2026-10-10/precommit-verification.json) confirms 308 preserved files, 629 historical manifest entries and 32 relative report links before staging. A-0 is closed only after that verification succeeds against each updated fetched remote PR head. Closure details, final documentation SHAs, hosted run URLs and separately tested SHAs belong in the current PR records; the historical FAIL report remains intact.

Retargeting PR #2 to main exposes the combined trust audit and four-exhibit expansion. Preserve both authorized scopes and inspect its full diff against main. The workflow runs `npm ci`, `npm run test:engines`, `npm test` and `npm run lint:html` for main-based PRs. Its separate schema job is conditional on a push to main and is skipped on PR events; full corpus replay is nevertheless part of the engine verification job. No deployment or PR merge is authorized.

The repair author’s recheck is not independent approval. A separate reviewer must identify the exact final heads reviewed and any limits of their assessment. Hosted CI and any independent review are separate evidence from the archived local macOS checks.
