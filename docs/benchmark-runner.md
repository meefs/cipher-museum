# Cipher Corpus Benchmark Runner

The Benchmark Runner executes all solvers on one selected corpus split and produces HTML and JSON reports. Both split labels are publicly downloadable; `blind` is not confidential data.

## Usage

```
node scripts/benchmark-runner.js --corpus public/corpus/all.jsonl --solvers solvers/ --out reports/ --split public
```

- `--split public` is the default. Use `--split blind` to evaluate that labelled partition or `--split all` for both.
- Run training/development and evaluation separately; the runner never runs both phases implicitly.
- Outputs:
  - `reports/benchmark-report.html` (summary table, per-cipher breakdown)
  - `reports/benchmark-report.json` (raw results)
  - `reports/benchmark-summary.json` (per-solver accuracy)
  - `reports/receipt-runner-*.json` (inputs, selected split, environment, and hashes)

## Requirements
- Solvers must implement a standard interface (see `solvers/README.md`).
- All results must be reproducible and timestamped.

## See also
- [Blind Split Policy](blind-split-policy.md)
- [LLM Eval Export Schema](../public/corpus/llm-eval-export.schema.v0.2.md)
