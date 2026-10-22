'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { engines } = require('../helpers/engine-spec');

require('../helpers/contracts').defineContractSpec('hill');

test('hill: singular matrices are rejected on encode and decode', () => {
	for (const key of ['1,2,2,4', '2,4,1,2', '13,13,13,13', '0,0,0,0']) {
		assert.equal(engines.hill.encode('TEST', key), 'Matrix not invertible mod 26', `encode key=${key}`);
		assert.equal(engines.hill.decode('ABCD', key), 'Matrix not invertible mod 26', `decode key=${key}`);
	}
});

test('hill: non-numeric matrix entries are rejected on encode', () => {
	assert.equal(engines.hill.encode('TEST', 'a,b,c,d'), 'Need 4 safe integers (2x2 matrix)');
});

test('hill: only four safe integer entries define a matrix over Z/26Z', () => {
  for (const key of ['1.5,0,0,2', '3,3,2,5,7', '3,,2,5', '9007199254740992,0,0,1']) {
    for (const mode of ['encode', 'decode']) {
      assert.match(engines.hill[mode]('ABCD', key), /^Need 4 /, `${mode}: ${key}`);
    }
  }
});

test('hill: reduce integer entries before multiplication to avoid precision loss', () => {
  // These large exact integers reduce to [[3,3],[2,5]] modulo 26.
  // Independently hand-computed: HE=(7,4) -> HI=(7,8), LP=(11,15) -> AT=(0,19).
  const key = '9007199254740963,9007199254740963,9007199254740962,9007199254740965';
  assert.equal(engines.hill.encode('HELP', key), 'HIAT');
  assert.equal(engines.hill.decode('HIAT', key), 'HELP');
});

test('hill: incomplete ciphertext blocks are rejected, not silently dropped', () => {
  assert.match(engines.hill.decode('HIA', '3,3,2,5'), /complete two-letter blocks/);
});
