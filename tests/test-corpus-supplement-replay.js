#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { audit } = require('../scripts/audit-corpus-v08-supplement-replay.js');

const ROOT = path.resolve(__dirname, '..');
const reviewed = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'data/corpus-v0.8-supplement-replay-audit.json'), 'utf8'));
const current = audit();
assert.deepEqual(current, reviewed, 'reviewed replay report matches current supplement and engines');
assert.equal(current.records.length, 45);
assert.deepEqual({ ...current.counts }, {
  match_match: 42,
  mismatch_mismatch: 2,
  mismatch_match: 1
});
assert.deepEqual(current.records.filter(row => row.encode !== 'match' || row.decode !== 'match')
  .map(row => row.id).sort(),
['hist-foursquare-001', 'hist-geez-001', 'hist-homophonic-001']);
console.log('v0.8 supplemental-only pairs: 42 replay, 3 documented mismatches');
