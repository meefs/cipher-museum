#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const { measureEngine, run, assertCoverage } = require('./scaling');

// Real quadratic work, independent of any museum engine. Returning the input
// keeps correctness intact; only the complexity guard can reject this mutant.
let checksum = 0;
const quadratic = {
  encode(text) {
    const n = Math.ceil(text.length / 64);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      checksum ^= text.charCodeAt((i + j) % text.length) + i * j;
    }
    return text;
  },
  decode(text) { return text; }
};
const measured = measureEngine('quadratic-canary', quadratic);
assert(!measured.skipped, 'Quadratic mutant must be measured');
assert(measured.ratio > 10, `Quadratic work must exceed the unchanged 10x bound; observed ${measured.ratio.toFixed(2)}x`);
assert.throws(() => run({ invalidKey: { encode() { throw new Error('bad key'); }, decode(t) { return t; } } }),
  /not timeable/, 'Unmeasured engines must fail coverage, never silently pass');
assert.throws(() => assertCoverage(84, 85), /coverage/, 'One missing registry engine fails coverage');
assert.throws(() => assertCoverage(40, 85), /coverage/, 'The old forty-engine minimum is insufficient');
assertCoverage(85, 85);
console.log(`Complexity canary caught quadratic work (${measured.ratio.toFixed(2)}x); invalid-key coverage failure caught; checksum ${checksum}.`);
