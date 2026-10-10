'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

function loadTrust(root = ROOT) {
  const labels = JSON.parse(fs.readFileSync(path.join(root, 'data/trust-labels.json'), 'utf8'));
  const { exhibits } = JSON.parse(fs.readFileSync(path.join(root, 'data/exhibit-trust.json'), 'utf8'));
  const byPath = new Map();
  const numbers = new Set();
  for (const entry of exhibits) {
    if (byPath.has(entry.path) || numbers.has(entry.number)) throw new Error(`Duplicate exhibit: ${entry.path}`);
    if (!Number.isInteger(entry.number) || !/^(ciphers|hall-of-foundations)\/[a-z0-9-]+\.html$/.test(entry.path)) {
      throw new Error(`Invalid exhibit identity: ${entry.path}`);
    }
    if (entry.label !== null && !Object.hasOwn(labels, entry.label)) throw new Error(`Unknown trust label: ${entry.label}`);
    byPath.set(entry.path, entry);
    numbers.add(entry.number);
  }
  function trustFor(rel) {
    const entry = byPath.get(rel);
    if (!entry) throw new Error(`Exhibit missing from trust source: ${rel}`);
    if (entry.label === null) return null;
    const definition = labels[entry.label];
    return { key: entry.label, text: definition.text, description: definition.description };
  }
  return { labels, exhibits, byPath, trustFor };
}

module.exports = { loadTrust, LABELS: loadTrust().labels };
