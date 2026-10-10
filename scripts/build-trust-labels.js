#!/usr/bin/env node
'use strict';

// data/exhibit-trust.json owns trust classification. HTML is generated output:
// exhibit headers, all hall cards, map rows/legend, and comparison metadata.
// null means omit the badge; it is not a fifth visitor-facing category.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const { loadTrust, LABELS } = require('./exhibit-trust');
const { badge: renderBadge, escapeHTML } = require('../js/trust-labels');

function compactLabel(key, labels = LABELS) {
  return key === null ? '' : renderBadge({ key, ...labels[key] });
}

function exhibitLabel(key, labels = LABELS) {
  if (key === null) return '';
  const { icon } = labels[key];
  const text = escapeHTML(labels[key].text), description = escapeHTML(labels[key].description);
  return `<div class="trust-label-wrap"><a class="trust-label trust-label--${key}" href="../museum-map.html#trust-labels" title="${description}" aria-label="Trust label: ${text}. ${description}"><svg class="trust-label__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg><span class="trust-label__text">${text}</span></a></div>`;
}

function buildTrustLabels({ root = ROOT, check = false } = {}) {
  const { exhibits, byPath, labels } = loadTrust(root);

  // Assemble all outputs before writing, so a missing roster row fails before
  // any HTML is changed. Only the small badge fragments are regenerated.
  const outputs = new Map();
  for (const entry of exhibits) {
    const html = fs.readFileSync(path.join(root, entry.path), 'utf8');
    const badge = exhibitLabel(entry.label, labels);
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
    // Retire independent security badges. Historical/usage notes are prose,
    // separate from classification, and remain available in generated metadata.
    next = next.replace(/^[ \t]*<span class="badge\s+sec-[^"]*">[\s\S]*?<\/span>\r?\n/gm, '')
      .replace(/^[ \t]*<p class="exhibit-status-note">[\s\S]*?<\/p>\r?\n?/gm, '');
    if (entry.note) next = next.replace(/(<p class="page-tagline">[\s\S]*?<\/p>)/,
      `$1\n  <p class="exhibit-status-note">${escapeHTML(entry.note)}</p>`);
    if (entry.path.startsWith('ciphers/') && !next.includes('src="../js/trust-labels.js"')) {
      next = next.replace(/(<script\b[^>]*src="\.\.\/js\/[^"]+"[^>]*>)/,
        '<script src="../js/trust-labels.js"></script>\n$1');
    }
    next = next.replace(/<tr><td>(?:Security|Trust)<\/td><td>[\s\S]*?<\/td><\/tr>/g,
      entry.label === null ? '' : `<tr><td>Trust</td><td>${compactLabel(entry.label, labels)}</td></tr>`);
    next = next.replace(/<div class="fact"><span class="fact-label">(?:Security|Trust)<\/span><span class="fact-value">[\s\S]*?<\/span><\/div>/g,
      entry.label === null ? '' : `<div class="fact"><span class="fact-label">Trust</span><span class="fact-value">${compactLabel(entry.label, labels)}</span></div>`);
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
      return start + compactLabel(entry.label, labels) + end;
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
      if (!entry) return card;
      // Every exhibit card receives its classification, including cards which
      // used only legacy sec-* markup or carried no badge before this audit.
      card = card.replace(/<span class="badge\s+sec-[^"]*">([^<]*)<\/span>/g, (old, text) =>
        /^(Track |Broke:)/.test(text) ? `<span class="badge">${text}</span>` : '')
        .replace(/<span class="trust-label\b[^>]*>[\s\S]*?<\/span>/g, '');
      const badge = compactLabel(entry.label, labels);
      if (badge) {
        if (/class="card-badges"/.test(card)) card = card.replace(/(<div class="card-badges">)/, '$1' + badge);
        else if (/class="card-foot"/.test(card)) card = card.replace(/(<div class="card-foot">)/,
          '$1<div class="card-badges">' + badge + '</div>');
        else throw new Error(`Missing hall card footer: ${href}`);
      }
      return card.replace(/<div class="card-badges">\s*<\/div>/g, '');
    }).replace(/<span class="badge\s+sec-[^"]*">[^<]*<\/span>/g, ''));
  }

  // Definitions are generated alongside the roster, rather than independently
  // authored in HTML. The same exact description is used in every tooltip.
  const legend = '<div class="trust-legend" role="list" aria-label="Trust label categories">\n' +
    Object.entries(labels).map(([key, definition]) =>
      `    <div class="trust-legend__item" role="listitem">${compactLabel(key, labels)}<p class="trust-legend__desc">${escapeHTML(definition.description)}</p></div>`
    ).join('\n') + '\n  </div>';
  outputs.set('museum-map.html', outputs.get('museum-map.html').replace(
    /<div class="trust-legend"[^>]*>[\s\S]*?\n  <\/div>/, legend));

  const comparison = fs.readFileSync(path.join(root, 'comparison.html'), 'utf8');
  let compared = comparison.replace(/\{ name:[^\n]+href:'([^']+)'[^\n]+\}/g, (row, href) => {
    const entry = byPath.get(href);
    if (!entry) throw new Error(`Unknown comparison exhibit: ${href}`);
    const trust = entry.label === null ? null : { key: entry.label, text: labels[entry.label].text, description: labels[entry.label].description };
    return row.replace(/security:(?:'[^']*'|"[^"]*")/, 'security:' + JSON.stringify(trust?.text || ''))
      .replace(/, trust:[\s\S]*?(?= \}$)/, '')
      .replace(/ \}$/, ', trust:' + JSON.stringify(trust) + ' }');
  });
  compared = compared.replace(/(<select\b[^>]*id="security-filter"[^>]*>)[\s\S]*?<\/select>/,
    '$1\n        <option value="">All Trust Labels</option>\n' +
    Object.values(labels).map(d => `        <option value="${escapeHTML(d.text)}">${escapeHTML(d.text)}</option>`).join('\n') + '\n      </select>');
  outputs.set('comparison.html', compared);

  const changed = [];
  for (const [rel, generated] of outputs) {
    const file = path.join(root, rel);
    const existing = fs.readFileSync(file, 'utf8');
    if (existing === generated) continue;
    const html = generated.replace(/^[ \t]+(?=\r?$)/gm, '');
    if (existing === html) continue;
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
