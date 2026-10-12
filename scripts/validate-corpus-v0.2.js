#!/usr/bin/env node
'use strict';

/**
 * validate-corpus-v0.2.js — compatibility entry point.
 *
 * The validator now lives in scripts/validate-corpus.js, which validates a file
 * against a named dataset contract. This wrapper keeps the historical command
 * line working (CI, docs and CONTRIBUTING all reference it) and forwards to the
 * contract inferred from the file, so validating the immutable v0.6 archive
 * behaves exactly as before while a v0.7 file is held to the v0.7 contract.
 *
 * The duplicate-tag exception that used to live here as a per-record check on
 * `dataset_version` is gone. Tolerating the 484 repeated tags is a property of
 * the frozen v0.6 dataset, not of a batch label a new record could inherit, so
 * it now belongs to the 0.6 contract alone.
 */

// Call main() explicitly: when this file is the entry point, validate-corpus.js
// is a required module, so its own `require.main === module` guard is false and
// requiring it alone would validate nothing while still exiting 0.
require('./validate-corpus.js').main();
