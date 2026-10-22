'use strict';
require('../helpers/contracts').defineContractSpec('m94');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { engines } = require('../helpers/engine-spec');

test('m94: row 25 is the inverse of row 1 on a 26-letter disk', () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // Independent disk arithmetic: +25 and -1 are equal modulo 26,
  // regardless of the seeded order of letters on each disk.
  assert.equal(engines.m94.encode(alphabet, '25'), engines.m94.decode(alphabet, '1'));
  assert.notEqual(engines.m94.encode(alphabet, '25'), engines.m94.encode(alphabet, '24'));
});
