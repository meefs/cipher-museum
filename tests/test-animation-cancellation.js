#!/usr/bin/env node
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const finiteFields = fs.readFileSync(
  path.join(root, 'hall-of-foundations/finite-fields.html'), 'utf8');
const wadsworth = fs.readFileSync(
  path.join(root, 'ciphers/wadsworth-cipher.html'), 'utf8');

// The handle must live outside the click handler so Reset and Step can cancel
// an animation that is already in flight. These checks guard the exact race
// that previously allowed an old interval to keep mutating freshly reset UI.
assert.match(finiteFields, /var Wp=97,[^;]*walkInterval=null;/,
  'finite-field walk keeps a persistent interval handle');
assert.match(finiteFields,
  /function stopWalk\(\)\{[\s\S]*?clearInterval\(walkInterval\);[\s\S]*?walkInterval=null;/,
  'finite-field walk exposes a cancellation function');
assert.match(finiteFields, /function resetWalk\(\)\{ stopWalk\(\);/,
  'finite-field Reset cancels an active walk before resetting state');
assert.match(finiteFields,
  /getElementById\("step"\)\.addEventListener\("click",function\(\)\{ stopWalk\(\); stepWalk\(\); \}\);/,
  'finite-field Step cancels an active walk before advancing once');

assert.match(wadsworth, /var runInterval = null;/,
  'Wadsworth keeps a persistent interval handle');
assert.match(wadsworth,
  /function stop\(\) \{[\s\S]*?clearInterval\(runInterval\); runInterval = null;/,
  'Wadsworth exposes a cancellation function');
assert.match(wadsworth, /function reset\(\) \{\s*stop\(\);/,
  'Wadsworth Reset cancels an active run before resetting state');
assert.match(wadsworth,
  /getElementById\("wd-step"\)\.addEventListener\("click", function \(\) \{ stop\(\); step\(\); \}\);/,
  'Wadsworth Step cancels an active run before advancing once');

console.log('Animation cancellation regression checks passed.');
