'use strict';
require('../helpers/contracts').defineContractSpec('m209');

const assert = require('node:assert/strict');
const { test } = require('node:test');
const { engines } = require('../helpers/engine-spec');

test('m209: all 27 lug bars contribute independently', () => {
  const settings = {
    pins: [Array(26).fill(1), Array(25).fill(0), Array(23).fill(0), Array(21).fill(0), Array(19).fill(0), Array(17).fill(0)],
    lugs: Array.from({ length: 27 }, () => [1, 0]),
    positions: [0, 0, 0, 0, 0, 0]
  };
  assert.deepEqual(engines.m209.trace('A', settings).shifts, [27]);
  assert.equal(engines.m209.encode('A', settings), 'A');
});

test('m209: TM 11-380 reciprocal alphabet arithmetic', () => {
  const settings = {
    pins: [Array(26).fill(1), Array(25).fill(0), Array(23).fill(0), Array(21).fill(0), Array(19).fill(0), Array(17).fill(0)],
    lugs: [
      ...Array.from({ length: 20 }, () => [1, 0]),
      ...Array.from({ length: 7 }, () => [2, 0])
    ],
    positions: [0, 0, 0, 0, 0, 0]
  };
  assert.equal(engines.m209.encode('A', settings), 'T');
  assert.equal(engines.m209.decode('T', settings), 'A');
});

test('m209: seeded teaching settings use displacements above six', () => {
  const shifts = engines.m209.trace('A'.repeat(1000), 'HAGELIN').shifts;
  assert.ok(shifts.every(value => value >= 0 && value <= 27));
  assert.ok(shifts.some(value => value > 6));
});
