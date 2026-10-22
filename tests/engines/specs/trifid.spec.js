'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
require('../helpers/contracts').defineContractSpec('trifid');

test('trifid: invalid periods fail promptly instead of looping or being truncated', () => {
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../../../js/ciphers/all-engines.js'), 'utf8'), context);
  for (const period of ['-1', '0', '1.5', 'Infinity', 'NaN', '"2tail"', '9007199254740992']) {
    for (const mode of ['encode', 'decode']) {
      assert.throws(() => vm.runInContext(
        `CipherEngines.trifid.${mode}('TEST', 'FELIX', ${period})`, context, { timeout: 100 }
      ), /Trifid period must be a positive safe integer/, `${mode}: ${period}`);
    }
  }
});

test('trifid: period-one cube coordinates map each letter to itself', () => {
  const { engines } = require('../helpers/engine-spec');
  // One symbol contributes its own three coordinates, so regrouping cannot change it.
  assert.equal(engines.trifid.encode('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'FELIX', 1), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
});
