# Research review of 30 October 2026 — implementation record

This implements findings F01–F13 from the new full-paper audit against main
`8b5dd46f8e5cff70bea87b3a93fc349af52f91e1`. The earlier R01–R14 features remain;
this pass repairs their edge cases and extends existing exhibits.

The research scope is the twelve additions to the previous101-paper Museum
selection: **364 PDF pages**, including appendices and references. Reading is
not independent verification of every theorem or reproduction of experiments.
CM023 pp19–22 were additionally rechecked for the memory/feasibility wording;
that older32-page paper was not reread in full in this pass.

## What changed

| Finding | Result | Main source / check |
|---|---|---|
| F01 | Saturating numerical path counts no longer manufacture forced boundaries. Forcedness comes from complete-path edge reachability; capped counts are labeled separately. | `research-model.js`;80repeated2digits give79ambiguous,0forced boundaries; a final singleton remains forced. |
| F02 | Bundle v2 binds results to inputs, locks, algorithms/budgets, model identities, selected layer and evidence. Original producing tools remain readable. Import/export retains seed0, candidates, key decisions and available/unavailable model selections. Legacy v1 receipts remain readable but explicitly unbound/stale. | Model mutation probes and real DOM import→export; candidates remain historical/unverified when settings change. |
| F03 | Rebuilding archives the prior inventory, including its source revision, occurrences, classes and split/merge history. Snapshots are inspectable and travel in evidence/bundle JSON. | Cross-revision rebuild/export/import regression. |
| F04 | Existing constant-time panel now names compiler/JIT, platform and observations. It does not equate equal elapsed times or branch-free code with universal assurance. | CL655 pp1–5,17–22; CL648 pp7–10,19–25. |
| F05 | SVG maps original image pixels into the actual cropped/rotated frame used by overlays. A highlighted region is keyboard/click operable in the reverse direction to its transcription span. Image load handlers are installed before loading; stale file loads are ignored. | Independent matrix-versus-overlay DOM check and actual browser screen-coordinate checks. |
| F06 | Repeated normalized reference identities cannot satisfy the strongest support label. The page reminds readers that distinct references still need an independence assessment. | Duplicate-reference rejection probe. |
| F07 | UA-8295 separates measured3.3MiB C++ memory from a proposed640KiB memory-minimized port. Actual Branch-and-Prune medians15s/5s replace ambiguous milliseconds wording. | CM023 p19 and Table4/§5.4, pp21–22. No historical port claimed. |
| F08 | Added one bounded DMP evidence card: leakage classes, partition assumptions, baseline-relative proof, simulation and omitted hardware behaviors. | CL648 pp3–14,19–25; no commercial/browser defense claim. |
| F09 | Added historical cache-mitigation and physical FPGA-EM evidence rows.7,000traces remain a hypothesis/set distinguisher result, separate from theoretical full-key-search input counts. | CL980 pp4–12; CL984 pp4–13. |
| F10 | Added exact finite OTP distributions with message-prior/key-bias controls and reused/fresh pad comparison. Mutual information, pairwise TV, joint independence and decryption error remain distinct. | CL967 pp7–16,24–31; exact finite cases and live controls. |
| F11 | Added a compact secrecy/non-malleability/authenticity comparison beside the existing tamper lesson, with full-version/model restrictions and a weak-but-perfectly-secret splitting-code example. | CL952 pp3–7,10–15,22; CL968 full2012version, §§2–6/AppendixB. |
| F12 | Added a quantum-resource evidence card with logical/physical counts, per-shot time, expected retries and unachieved hardware assumptions. Existing conditional Shor warnings link to it. | CL646 TablesI–II/pp5–7; pp30–38,66,97–116. |
| F13 | Existing complete-formula explanation now makes cost workload/coordinate-dependent, with the one-multiplication/five-addition trade-off and retained curve/subgroup scope. Arithmetic engines are unchanged. | CL642 pp2–3,11–12; existing361-pair F17 oracle. |

The full-page reread also removed the finite-fields preview's visual-hardness
implication, corrected its “fewer than100elements” shorthand (the selector
includes127), qualified seeded replay across JavaScript engines, and removed
the ACTS paragraph's unsupported attribution of the entire metadata gap to
filenames alone.

## Papers reviewed without a new Museum engine

- CL686, ePrint2011/315, all16pages: GLV/GLS j=0 construction is not applicable
  to the Museum's a=2/a=3 prime-field toys. Fewer doublings are not a universal
  proportional runtime gain; historical comparators differ in side-channel protection.
- CL687, ePrint2005/454, all20pages: trace-one extension-field/Frobenius
  recodings require their actual field, curve, basis and cost model.
- CL688, ePrint2004/191, all15pages: specialist hardware scheduling, not a
  browser-worker optimization. As printed on pp4/7, comb-spaced bits with a
  contiguous-multiple table fail m=4,w=2,t=2. It returns2P instead of4P;
  original pages and independent toy arithmetic were checked. This is an
  audit inference about the printed recipe, not an external implementation/erratum.

CL968's affine example uses the mathematically correct inverse
`a^(-1)(C−b)` with a nonzero. The supplied manuscript p23 prints a different
coefficient in that sentence; the Museum does not copy it into an engine.
Its two-distinct-message property is not unrestricted repeated-message secrecy.

## Evaluation and limits

The existing v1/v2 evaluation exports were regenerated because the source
identity of `research-model.js` changed. Original fixtures, task definitions
and tolerance rules are retained. This is not an improvement claim for the
homophonic solver: the small-budget39-item comparison still has0exact
recoveries for both solvers. Independent-work/author/collection generalization,
larger multi-seed studies and the live matched-input LLM experiment remain
separate unfinished experiments; no results were invented for them.

Validation results are recorded in `docs/page-audit/research-2026-10-30-validation.json`.
New guards were shown to fail on the prior code/content; targeted mutations
also catch ignored key bias, accidental pad reuse, removal of the bit-flip
condition and a distinguisher misreported as full recovery. The audit export
is regenerated from committed source so subsequent AI review sees the new
lessons and code, rather than the previous frozen pages.

No paper's compiler, device, FPGA, Proteus or quantum-resource experiment was
reproduced. The browser check is local Chromium at desktop/phone widths,
not a cross-browser or deployed-site certification. Teaching JavaScript is
not promoted to production cryptography by this work.
