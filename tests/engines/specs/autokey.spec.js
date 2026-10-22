'use strict';
require('../helpers/contracts').defineContractSpec('autokey');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { engines } = require('../helpers/engine-spec');

test('autokey: a key normalized to no letters uses the same default as empty input', () => {
  for (const key of ['', '   ', '!!!', '123']) {
    // ATTACKATDAWN + KEYATTACKATD, with A=0, gives KXRAVDAVNAPQ.
    assert.equal(engines.autokey.encode('ATTACKATDAWN', key), 'KXRAVDAVNAPQ');
    assert.equal(engines.autokey.decode('KXRAVDAVNAPQ', key), 'ATTACKATDAWN');
  }
});
