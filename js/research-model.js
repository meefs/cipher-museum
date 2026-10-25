/* Source-preserving research tools. All examples and searches run locally.
 * Papers and model boundaries: docs/PAPER_REVIEW_IMPLEMENTATION.md.
 */
'use strict';
(function (global) {
  const KIND = 'cipher-museum-transcription';
  const TYPES = ['ciphertext', 'cleartext', 'marginal', 'missing', 'editorial'];
  const KEY_TYPES = ['letter', 'syllable', 'word', 'name', 'null', 'space', 'repeat', 'erase', 'unknown'];
  const copy = x => JSON.parse(JSON.stringify(x));
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  function check(ok, message) { if (!ok) throw new Error(message); }
  function string(x, max, label) { check(typeof x === 'string' && x.length <= max, label + ' is missing or too long.'); return x; }
  function integer(x, min, max, label) { check(Number.isInteger(x) && x >= min && x <= max, 'Invalid ' + label + '.'); return x; }
  function list(x, max, label) { check(Array.isArray(x) && x.length <= max, 'Invalid ' + label + '.'); return x; }
  function url(x) {
    string(x, 2000, 'Source URL');
    if (x) { let parsed; try { parsed = new URL(x); } catch (_) { throw new Error('Use a complete http or https source URL.'); }
      check(['https:', 'http:'].includes(parsed.protocol) && !parsed.username && !parsed.password, 'Use a source URL without credentials and with http or https.'); }
    return x;
  }
  function source(x) {
    check(x && typeof x === 'object' && !Array.isArray(x), 'Invalid source record.');
    const result = {};
    for (const field of ['artifactId', 'archive', 'shelfmark', 'folio', 'transcriber', 'date', 'method', 'imageName']) result[field] = string(x[field] || '', 500, field);
    result.url = url(x.url || ''); return result;
  }
  function create(raw = '') {
    string(raw, 10000, 'Transcription');
    return { version: 2, kind: KIND, raw, mode: 'symbols', width: 1, annotations: {}, revision: 1,
      source: source({}), revisions: [{ id: 1, raw, reason: 'Initial transcription' }], spans: [], layers: [], keys: [], relations: [] };
  }
  // Legacy positions count Unicode code points, not UTF-16 code units.
  function legacyTokens(raw, mode, width) {
    const tokens = []; let start = -1, text = '';
    function flush(end) { if (text) tokens.push({ start, end, text }); text = ''; start = -1; }
    const chars = Array.from(raw);
    chars.forEach((ch, i) => {
      const keep = !/\s/u.test(ch) && (mode === 'symbols' || ch === '?' || (mode === 'digits' ? /[0-9]/.test(ch) : /[A-Za-z]/.test(ch)));
      if (!keep) { flush(i); return; }
      if (start < 0) start = i;
      text += ch; if (Array.from(text).length === width) flush(i + 1);
    }); flush(chars.length); return tokens;
  }
  function migrate(v) {
    check(v && v.kind === KIND && (v.version === 1 || v.version === 2), 'Unsupported transcription export.');
    if (v.version === 2) return validate(v);
    string(v.raw, 10000, 'Transcription');
    check(['symbols', 'digits', 'letters'].includes(v.mode) && [1, 2, 5].includes(v.width), 'Unsupported legacy alphabet or width.');
    check(v.annotations && typeof v.annotations === 'object' && !Array.isArray(v.annotations), 'Invalid legacy annotations.');
    const d = create(v.raw); d.mode = v.mode; d.width = v.width;
    const tokens = legacyTokens(v.raw, v.mode, v.width);
    Object.entries(v.annotations).forEach(([index, status]) => {
      check(/^(0|[1-9]\d*)$/.test(index) && Number(index) < tokens.length && ['uncertain', 'missing'].includes(status), 'Invalid legacy annotation.');
      const t = tokens[Number(index)];
      d.spans.push({ id: 'span-' + (d.spans.length + 1), revision: 1, start: t.start, end: t.end, literal: t.text,
        type: status === 'missing' ? 'missing' : 'ciphertext', uncertain: true, alternatives: [], reading: '', reason: 'Imported legacy ' + status + ' annotation', region: null });
    }); return validate(d);
  }
  function validate(value) {
    check(value && value.version === 2 && value.kind === KIND, 'Unsupported evidence document.');
    check(JSON.stringify(value).length <= 750000, 'Evidence document exceeds 750,000 characters.');
    const d = copy(value); string(d.raw, 10000, 'Transcription'); d.source = source(d.source);
    check(['symbols', 'digits', 'letters'].includes(d.mode) && [1, 2, 5].includes(d.width), 'Invalid token settings.');
    integer(d.revision, 1, 50, 'revision'); const revisions = new Map();
    list(d.revisions, 50, 'revisions').forEach(r => {
      integer(r.id, 1, 50, 'revision ID'); check(!revisions.has(r.id), 'Duplicate revision.');
      string(r.raw, 10000, 'Revision text'); string(r.reason, 1000, 'Revision reason');
      check(r.id === 1 || r.reason.trim(), 'Each changed transcription needs a revision reason.'); revisions.set(r.id, r);
    });
    check(revisions.has(d.revision) && revisions.get(d.revision).raw === d.raw, 'Current transcription must match its recorded revision.');
    check(revisions.has(1), 'The original transcription must be retained.');
    check(d.revisions.every((r,i) => r.id === i+1) && d.revision === d.revisions.length, 'Revisions must be consecutive, with the latest revision current.');
    d.annotations = {}; // v2 annotations use source spans, never mutable token indices.
    const ids = new Set();
    function unique(id) { string(id, 100, 'Record ID'); check(/^[A-Za-z][A-Za-z0-9_-]*$/.test(id) && !/^revision-/.test(id) && !ids.has(id), 'Invalid, reserved or duplicate record ID.'); ids.add(id); }
    list(d.spans, 500, 'spans').forEach(s => {
      unique(s.id); check(revisions.has(s.revision), 'Span has no source revision.');
      const chars = Array.from(revisions.get(s.revision).raw);
      integer(s.start, 0, chars.length - 1, 'span start'); integer(s.end, s.start + 1, chars.length, 'span end');
      check(s.literal === chars.slice(s.start, s.end).join(''), 'Span does not match its source.');
      check(TYPES.includes(s.type) && typeof s.uncertain === 'boolean', 'Invalid span type or uncertainty.');
      list(s.alternatives, 20, 'alternative readings').forEach(a => string(a, 200, 'Alternative'));
      string(s.reading, 200, 'Accepted reading'); string(s.reason, 1000, 'Reading reason');
      check(!s.reading || !s.alternatives.length || s.alternatives.includes(s.reading), 'Accepted reading must be one of the alternatives.');
      check(s.uncertain || (!s.alternatives.length || (s.reading && s.reason.trim())), 'Resolving alternative readings requires a choice and reason.');
      if (s.region !== null) {
        string(s.imageName, 500, 'Region image filename'); check(s.imageName.trim(), 'An image region needs its recorded source filename.');
        list(s.region, 4, 'image region'); check(s.region.length === 4 && s.region.every(n => Number.isFinite(n) && n >= 0 && n <= 1), 'Image region uses four fractions between 0 and 1.');
        check(s.region[2] > 0 && s.region[3] > 0 && s.region[0] + s.region[2] <= 1.00000001 && s.region[1] + s.region[3] <= 1.00000001, 'Image region must fit inside the image.');
      }
    });
    const parents = new Set(d.revisions.map(r => 'revision-' + r.id));
    list(d.layers, 100, 'reading layers').forEach(l => {
      unique(l.id); check(['symbols', 'diplomatic', 'normalized', 'translation'].includes(l.kind), 'Unknown reading layer.');
      check(parents.has(l.parent), 'A reading layer must reference an earlier source or layer.');
      check(revisions.has(l.revision), 'Reading layer has no source revision.');
      const parentLayer = d.layers.find(p => p.id === l.parent);
      const parentRevision = parentLayer ? parentLayer.revision : Number(l.parent.replace('revision-', ''));
      check(parentRevision === l.revision, 'Reading layer belongs to a different source revision.');
      string(l.text, 20000, 'Layer text'); string(l.note, 1000, 'Transformation note'); check(l.note.trim(), 'Describe the transformation.'); parents.add(l.id);
    });
    list(d.keys, 30, 'keys').forEach(k => { unique(k.id); string(k.title, 200, 'Key title'); url(k.sourceUrl); validateKey(k.entries); });
    list(d.relations, 100, 'relationships').forEach(r => {
      ['from', 'to', 'evidence'].forEach(f => string(r[f], 2000, 'Relationship ' + f));
      check(r.from.trim() && r.to.trim() && r.evidence.trim(), 'Relationships need two identifiers and supporting evidence.');
      check(['transcribes', 'applies-key', 'supports', 'alternative-to'].includes(r.type), 'Unsupported relationship type.');
    });
    return d;
  }
  function revise(d, raw, reason) {
    d = validate(d); string(raw, 10000, 'Transcription'); if (raw === d.raw) return d;
    check(d.revisions.length < 50, 'Export this record before starting a new document: 50 revisions reached.');
    check(typeof reason === 'string' && reason.trim(), 'Describe why the transcription changed.');
    d.revision = Math.max(...d.revisions.map(r => r.id)) + 1; d.raw = raw;
    d.revisions.push({ id: d.revision, raw, reason }); return validate(d);
  }
  function annotate(d, input) {
    d = validate(d); const s = copy(input);
    s.id = 'span-' + (1 + Math.max(0, ...d.spans.map(x => Number(x.id.split('-').pop()) || 0)));
    s.revision = d.revision; s.literal = Array.from(d.raw).slice(s.start, s.end).join('');
    if (s.region !== null) s.imageName = d.source.imageName;
    d.spans.push(s); return validate(d);
  }
  function addLayer(d, kind, parent, text, note) {
    d = validate(d); d.layers.push({ id: 'layer-' + (d.layers.length + 1), revision: d.revision, kind, parent, text, note }); return validate(d);
  }
  function validateKey(entries) {
    list(entries, 150, 'key entries'); const seen = new Set();
    entries.forEach(e => {
      string(e.symbol, 100, 'Key symbol'); check(e.symbol.trim() && !seen.has(e.symbol), 'Each key symbol must be nonempty and unique.'); seen.add(e.symbol);
      check(KEY_TYPES.includes(e.type), 'Unknown key-entry type.'); list(e.values, 20, 'key readings').forEach(v => string(v, 200, 'Key reading'));
      if (['null', 'space', 'repeat', 'erase', 'unknown'].includes(e.type)) check(e.values.length === 0, 'Control entries have no literal readings.');
      else { check(e.values.length > 0 && e.values.every(v => v.length > 0), 'Supply at least one reading.'); if (e.type === 'letter') check(e.values.every(v => Array.from(v).length === 1), 'A letter entry contains single characters.'); }
    }); return entries;
  }
  function applyKey(tokens, entries) {
    validateKey(entries); const key = new Map(entries.map(e => [e.symbol, e])); let text = '', unresolved = 0;
    tokens.forEach(t => {
      const e = key.get(t);
      if (!e || e.type === 'unknown') { text += '⟦' + t + '?⟧'; unresolved++; }
      else if (e.type === 'null') return;
      else if (e.type === 'space') text += ' ';
      else if (e.type === 'repeat' || e.type === 'erase') {
        // This explicit teaching convention acts on one resolved Unicode character.
        if (!text || text.endsWith('⟧')) { text += '⟦' + e.type + '?⟧'; unresolved++; }
        else { const chars = Array.from(text); if (e.type === 'repeat') text += chars.at(-1); else text = chars.slice(0, -1).join(''); }
      } else if (e.values.length > 1) { text += '⟦' + e.values.join('/') + '⟧'; unresolved++; }
      else text += e.values[0];
    }); return { text, unresolved, tokens: tokens.length };
  }
  function segment(digits, key, boundaries = [], limit = 10000, score = () => 0) {
    check(typeof digits === 'string' && /^[0-9]{1,80}$/.test(digits), 'Use 1–80 digits without spaces; the source will not be normalized.');
    check(key && typeof key === 'object' && !Array.isArray(key), 'Supply a code-to-reading object.');
    const entries = Object.entries(key); check(entries.length > 0 && entries.length <= 64, 'Use 1–64 numerical key entries.');
    entries.forEach(([c, p]) => { check(/^[0-9]{1,6}$/.test(c), 'Codes must contain 1–6 digits.'); string(p, 50, 'Code reading'); check(p.length > 0, 'Code readings cannot be empty.'); });
    integer(limit, 1, 20000, 'path budget'); list(boundaries, 79, 'locked boundaries').forEach(b => integer(b, 1, digits.length - 1, 'locked boundary'));
    const paths = []; let visited = 0, complete = true, total = 0;
    function visit(pos, codes, text) {
      if (visited >= limit) { complete = false; return; } visited++;
      if (pos === digits.length) {
        const value = score(text); check(Number.isFinite(value), 'The selected scoring model cannot score this reading.');
        paths.push({ codes, text, score: value }); total++;
        paths.sort((a,b) => b.score - a.score || a.codes.join('|').localeCompare(b.codes.join('|'))); if (paths.length > 32) paths.pop(); return;
      }
      for (const [code, reading] of entries) {
        const end = pos + code.length;
        if (digits.startsWith(code, pos) && !boundaries.some(b => b > pos && b < end)) visit(end, codes.concat(code), text + reading);
        if (!complete) return;
      }
    }
    visit(0, [], ''); return { paths, visited, complete, total, retained: paths.length, limit, boundaries: boundaries.slice() };
  }
  function rng(seed) {
    let x = seed >>> 0;
    return function () { x += 0x6D2B79F5; let t = x; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function parseSymbols(raw) {
    string(raw, 12000, 'Symbol sequence'); const tokens = raw.trim().split(/\s+/u).filter(Boolean);
    check(tokens.length >= 3 && tokens.length <= 600, 'Use 3–600 whitespace-separated symbol IDs.');
    check(tokens.every(t => t.length <= 40 && !t.includes('?')), 'Resolve unknown symbols first; IDs may be at most 40 characters.');
    check(new Set(tokens).size <= 100, 'Use at most 100 distinct symbol IDs.'); return tokens;
  }
  // Deterministic simulated annealing; independent assignments permit many-to-one keys.
  function search(tokens, options, score, progress = () => {}) {
    parseSymbols(tokens.join(' ')); const symbols = Array.from(new Set(tokens));
    const seed = integer(options.seed, 0, 4294967295, 'seed');
    const steps = integer(options.steps, 1, 100000, 'search budget');
    check(steps * tokens.length <= 20000000, 'Reduce the step budget: maximum 20 million symbol evaluations.');
    const locks = options.locks || {}; check(typeof locks === 'object' && !Array.isArray(locks), 'Invalid locked key.');
    Object.entries(locks).forEach(([s,v]) => check(symbols.includes(s) && /^[A-Z]$/.test(v), 'A lock must name a present symbol and one A–Z letter.'));
    const random = rng(seed), alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', weighted = 'EEEEEEEEEEEETTTTTTTTTAAAAAAAAOOOOOOOIIIIIIINNNNNNNSSSSSSHHHHHHRRRRRRDDDDLLLLCCCUUUMMWWFFGGYYPPBBVKJXQZ';
    const ids = tokens.map(t => symbols.indexOf(t)), free = symbols.map((_,i) => i).filter(i => !own(locks, symbols[i]));
    let key = [], current = -Infinity, best = -Infinity; const candidates = [], trace = [];
    function decode(k) { return ids.map(i => k[i]).join(''); }
    function retain(k, fit, step) {
      const plaintext = decode(k); if (candidates.some(c => c.plaintext === plaintext)) return;
      candidates.push({ plaintext, score: fit, step, key: Object.fromEntries(symbols.map((s,i) => [s,k[i]])) });
      candidates.sort((a,b) => b.score - a.score || a.plaintext.localeCompare(b.plaintext)); if (candidates.length > 5) candidates.pop();
    }
    const restartLength = Math.min(5000, steps);
    for (let i = 0; i < steps; i++) {
      if (i % restartLength === 0) {
        key = symbols.map(s => own(locks,s) ? locks[s] : weighted[Math.floor(random() * weighted.length)]);
        current = score(decode(key)); check(Number.isFinite(current), 'Scoring model returned an invalid value.'); retain(key, current, i);
      }
      if (!free.length) { retain(key, current, i); best = current; trace.push({ step: 0, score: current }); break; }
      const a = free[Math.floor(random() * free.length)], oldA = key[a];
      let b = -1, oldB;
      if (free.length > 1 && random() < 0.2) { b = free[Math.floor(random() * free.length)]; oldB = key[b]; key[a] = oldB; key[b] = oldA; }
      else key[a] = alphabet[Math.floor(random() * 26)];
      const next = score(decode(key)), temp = 0.2 + 8 * (1 - (i % restartLength) / restartLength);
      check(Number.isFinite(next), 'Scoring model returned an invalid value.');
      if (next >= current || random() < Math.exp((next - current) / temp)) current = next;
      else { key[a] = oldA; if (b >= 0) key[b] = oldB; }
      if (current >= best || i % 1000 === 0) { retain(key, current, i + 1); best = Math.max(best, current); }
      if (i % 1000 === 0 || i === steps - 1) { trace.push({ step: i + 1, score: candidates[0].score }); progress({ step: i + 1, steps, score: candidates[0].score }); }
    }
    return { candidates, trace, seed, requestedSteps: steps, completedSteps: free.length ? steps : 0,
      task: free.length ? 'key-recovery-candidates' : 'known-key-application', locks: copy(locks),
      model: score.modelId || 'custom-scoring-function', verified: false, scope: 'Letter homophones only; no word codes, nulls, control signs or historical-language model.' };
  }
  function metrics(expected, actual, expectedKey, actualKey) {
    // Levenshtein distance keeps insertions/deletions distinct from key errors.
    const a = Array.from(expected), b = Array.from(actual); let row = b.map((_,i) => i + 1); row.unshift(0);
    for (let i=1;i<=a.length;i++) { const next=[i]; for (let j=1;j<=b.length;j++) next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]===b[j-1]?0:1)); row=next; }
    const keys = Object.keys(expectedKey || {});
    return { exact: expected === actual, editDistance: row[b.length], plaintextError: row[b.length] / Math.max(1,a.length),
      keyError: keys.length ? keys.filter(k => !actualKey || actualKey[k] !== expectedKey[k]).length / keys.length : null };
  }
  function z340Route(kind = 'diagonal') {
    check(['diagonal', 'row-major'].includes(kind), 'Unknown route.');
    return Array.from({length:153}, (_, i) => kind === 'diagonal' ? (i % 9) * 17 + (2 * i % 17) : i);
  }
  const api = { TYPES, KEY_TYPES, create, migrate, validate, revise, annotate, addLayer, validateKey, applyKey, segment, rng, parseSymbols, search, metrics, url, z340Route };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.MuseumResearch = api;
})(typeof window !== 'undefined' ? window : globalThis);
