#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const { run, assertCoverage } = require('./scaling');

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
// Exercise the production decision, not a second copy of its threshold. If
// RATIO_LIMIT is weakened to 20, quadratic work is accepted and this assertion
// fails. Positive controls ensure a guard that rejects everything also fails.
assert.doesNotThrow(() => run({
  caesar: global.CipherEngines.caesar,
  otp: global.CipherEngines.otp
}), 'Legitimate engines must pass the production guard');
assert.throws(() => run({ quadraticCanary: quadratic }), /Engine scaling bound exceeded/,
  'The production guard must reject real quadratic work');
assert.throws(() => run({ invalidKey: { encode() { throw new Error('bad key'); }, decode(t) { return t; } } }),
  /not timeable/, 'Unmeasured engines must fail coverage, never silently pass');
assert.throws(() => assertCoverage(84, 85), /coverage/, 'One missing registry engine fails coverage');
assert.throws(() => assertCoverage(40, 85), /coverage/, 'The old forty-engine minimum is insufficient');
assertCoverage(85, 85);
console.log(`Production guard accepted Caesar/OTP controls and rejected quadratic work; invalid-key coverage failure caught; checksum ${checksum}.`);
