#!/usr/bin/env node
'use strict';

// data/exhibit-trust.json owns trust classification. HTML is generated output:
// exhibit headers, map roster rows, and existing trust badges on hall cards.
// null means omit the badge; it is not a fifth visitor-facing category.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LABELS = {
  broken: {
    text: 'Broken',
    description: 'Cryptographically broken — historically important but unsafe to use today.',
    icon: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>'
  },
  historical: {
    text: 'Historical Only',
    description: 'No longer in use, or never confirmed broken/deciphered.',
    icon: '<path d="M3 7a2 2 0 0 1 2-2h11v12a2 2 0 0 0 2 2H6a3 3 0 0 1-3-3V7z"/><path d="M16 5a2 2 0 0 1 2 2v8h3a0 0 0 0 1 0 0v2a2 2 0 0 1-2 2"/>'
  },
  educational: {
    text: 'Educational',
    description: 'A didactic construction for learning cryptographic concepts, not for security.',
    icon: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>'
  },
  secure: {
    text: 'Secure (Modern)',
    description: 'Still considered secure when used correctly with modern key handling.',
    icon: '<path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/>'
  }
};

function compactLabel(key) {
  if (key === null) return '';
  const { text, description } = LABELS[key];
  const tooltip = key === 'historical' ? description : text;
  return `<span class="trust-label trust-label--${key} trust-label--sm" title="${tooltip}">${text}</span>`;
}

function exhibitLabel(key) {
  if (key === null) return '';
  const { text, description, icon } = LABELS[key];
  return `<div class="trust-label-wrap"><a class="trust-label trust-label--${key}" href="../museum-map.html#trust-labels" title="${description}" aria-label="Trust label: ${text}. ${description}"><svg class="trust-label__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg><span class="trust-label__text">${text}</span></a></div>`;
}

function buildTrustLabels({ root = ROOT, check = false } = {}) {
  const { exhibits } = JSON.parse(fs.readFileSync(path.join(root, 'data/exhibit-trust.json'), 'utf8'));
  const byPath = new Map();
  const numbers = new Set();
  for (const entry of exhibits) {
    if (byPath.has(entry.path) || numbers.has(entry.number)) throw new Error(`Duplicate exhibit: ${entry.path}`);
    if (!Number.isInteger(entry.number) || !/^(ciphers|hall-of-foundations)\/[a-z0-9-]+\.html$/.test(entry.path)) {
      throw new Error(`Invalid exhibit identity: ${entry.path}`);
    }
    if (entry.label !== null && !Object.hasOwn(LABELS, entry.label)) throw new Error(`Unknown trust label: ${entry.label}`);
    byPath.set(entry.path, entry);
    numbers.add(entry.number);
  }

  // Assemble all outputs before writing, so a missing roster row fails before
  // any HTML is changed. Only the small badge fragments are regenerated.
  const outputs = new Map();
  for (const entry of exhibits) {
    const html = fs.readFileSync(path.join(root, entry.path), 'utf8');
    const badge = exhibitLabel(entry.label);
    const blocks = html.match(/<div class="trust-label-wrap">[\s\S]*?<\/div>/g) || [];
    if (blocks.length > 1) throw new Error(`Duplicate trust label: ${entry.path}`);
    let next = html;
    if (blocks.length) {
      next = badge ? html.replace(blocks[0], badge)
        : html.replace(/^[ \t]*<div class="trust-label-wrap">[\s\S]*?<\/div>\r?\n/m, '');
    } else if (badge) {
      if (!/<h1\b[^>]*>[\s\S]*?<\/h1>/.test(html)) throw new Error(`Missing exhibit heading: ${entry.path}`);
      const newline = html.includes('\r\n') ? '\r\n' : '\n';
      next = html.replace(/(<h1\b[^>]*>[\s\S]*?<\/h1>)/, `$1${newline}  ${badge}`);
    }
    outputs.set(entry.path, next);
  }

  const rosterPaths = new Set();
  const mapHtml = fs.readFileSync(path.join(root, 'museum-map.html'), 'utf8');
  outputs.set('museum-map.html', mapHtml.replace(
    /(<tr><td>(\d+)<\/td><td><a href="(ciphers\/[^"]+\.html)">[^<]+<\/a>)([\s\S]*?)(<\/td><td>[^<]+<\/td><\/tr>)/g,
    (row, start, number, href, old, end) => {
      const entry = byPath.get(href);
      if (!entry || entry.number !== Number(number)) throw new Error(`Roster identity differs from trust source: ${href}`);
      if (rosterPaths.has(href)) throw new Error(`Duplicate roster entry: ${href}`);
      rosterPaths.add(href);
      return start + compactLabel(entry.label) + end;
    }
  ));
  for (const entry of exhibits.filter(e => e.path.startsWith('ciphers/'))) {
    if (!rosterPaths.has(entry.path)) throw new Error(`Missing roster entry: ${entry.path}`);
  }

  for (const file of fs.readdirSync(path.join(root, 'halls')).filter(f => f.endsWith('.html'))) {
    const rel = `halls/${file}`;
    const html = fs.readFileSync(path.join(root, rel), 'utf8');
    outputs.set(rel, html.replace(/<a\b[^>]*class="cipher-card"[^>]*>[\s\S]*?<\/a>/g, card => {
      const href = card.match(/href="\.\.\/([^"]+)"/)?.[1];
      const entry = byPath.get(href);
      // Older gallery cards used green security badges for unbroken service
      // history. Render the canonical label there as well.
      if (entry?.label === 'historical') {
        card = card.replace(/<span class="badge sec-secure">[^<]*<\/span>/g, compactLabel(entry.label));
      }
      if (!/class="trust-label\b/.test(card)) return card;
      if (!entry) throw new Error(`Unknown hall trust badge target: ${href}`);
      return card.replace(/<span class="trust-label\b[^>]*>[\s\S]*?<\/span>/g, compactLabel(entry.label))
        .replace(/<div class="card-badges">\s*<\/div>/g, '');
    }));
  }

  const changed = [];
  for (const [rel, html] of outputs) {
    const file = path.join(root, rel);
    if (fs.readFileSync(file, 'utf8') === html) continue;
    changed.push(rel);
    if (!check) fs.writeFileSync(file, html);
  }
  return changed;
}

if (require.main === module) {
  const check = process.argv.includes('--check');
  const changed = buildTrustLabels({ check });
  if (check && changed.length) {
    console.error(`Trust labels need regeneration: ${changed.join(', ')}`);
    process.exitCode = 1;
  } else {
    console.log(check ? 'Trust labels are current.' : `Trust labels regenerated (${changed.length} files changed).`);
  }
}

module.exports = { buildTrustLabels, LABELS };
