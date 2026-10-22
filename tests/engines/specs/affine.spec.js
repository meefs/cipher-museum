'use strict';
require('../helpers/contracts').defineContractSpec('affine');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { engines } = require('../helpers/engine-spec');

test('affine: reject integer strings that cannot be represented exactly', () => {
  for (const key of ['1,9007199254740993', '9007199254740993,1', '1,' + '9'.repeat(400)]) {
    assert.throws(() => engines.affine.encode('A', key), /safe integers/);
    assert.throws(() => engines.affine.decode('A', key), /safe integers/);
  }
});
