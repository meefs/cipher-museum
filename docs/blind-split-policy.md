# Cipher Corpus Blind Split Policy

To support consistent benchmarking, Cipher Corpus records carry `public` or
`blind` split labels. Both splits are publicly downloadable. “Blind” is a split
designation, not confidential or genuinely held-out data.

## Policy
- Records store the label in the `split` field.
- Existing split assignments are versioned data and must not be silently changed.
- Current deterministic generators generally assign 70% `public` and 30%
  `blind` within a generated cipher family.
- Do not train and evaluate on the same records. For genuinely unseen
  evaluation, use a separately held-out dataset that has not been downloaded
  or inspected during development.

## Enforcement
- Schema and regression tests check valid split values and preserve pinned
  assignments across corpus releases.
- The full canonical corpus remains downloadable for reproducibility.

---

For questions, contact the maintainers.
