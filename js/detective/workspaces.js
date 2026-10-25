/* Manual substitution and source-preserving transcription workspaces.
 * Reading: Sweigart (2018), ch.17; Esslinger (2024), ch.3 §§3.4–3.5.1.
 * Original teaching fixtures; no third-party dictionary or manuscript data.
 */
'use strict';
(function (global) {
  var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function validMap(map) {
    var seen = {};
    return Object.keys(map).every(function (key) {
      var value = map[key];
      if (!/^[A-Z]$/.test(key) || !/^[A-Z]$/.test(value) || seen[value]) return false;
      seen[value] = true; return true;
    });
  }
  function mergeWord(map, cipher, plain) {
    if (cipher.length !== plain.length) return null;
    var next = copy(map);
    for (var i = 0; i < cipher.length; i++) {
      if (next[cipher[i]] && next[cipher[i]] !== plain[i]) return null;
      next[cipher[i]] = plain[i];
    }
    return validMap(next) ? next : null;
  }
  function decode(text, map) {
    // Only ASCII letters belong to this alphabet; never silently transliterate.
    return text.replace(/[a-z]/gi, function (letter) { return map[letter.toUpperCase()] || '·'; });
  }
  function pattern(word) {
    var ids = {}, next = 0;
    return word.split('').map(function (letter) {
      if (!Object.prototype.hasOwnProperty.call(ids, letter)) ids[letter] = next++;
      return ids[letter];
    }).join('.');
  }
  function Desk(text) { this.state = { text: text || '', map: {}, locks: {} }; this.history = []; }
  Desk.prototype.save = function () { this.history.push(copy(this.state)); if (this.history.length > 100) this.history.shift(); };
  Desk.prototype.setText = function (text) {
    if (text === this.state.text) return;
    this.save(); this.state = { text: text, map: {}, locks: {} };
  };
  Desk.prototype.assign = function (cipher, plain) {
    if (!/^[A-Z]$/.test(cipher) || !/^[A-Z]?$/.test(plain)) throw new Error('Use one A–Z letter, or leave the entry blank.');
    if (this.state.locks[cipher]) throw new Error('Unlock ' + cipher + ' before editing its mapping.');
    var next = copy(this.state.map);
    if (plain) next[cipher] = plain; else delete next[cipher];
    if (!validMap(next)) throw new Error('That plaintext letter is already assigned to another cipher letter.');
    this.save(); this.state.map = next;
  };
  Desk.prototype.lock = function (cipher, locked) {
    if (!/^[A-Z]$/.test(cipher) || (locked && !this.state.map[cipher])) throw new Error('Assign a letter before locking it.');
    this.save(); if (locked) this.state.locks[cipher] = true; else delete this.state.locks[cipher];
  };
  Desk.prototype.undo = function () { if (this.history.length) this.state = this.history.pop(); };
  Desk.prototype.clear = function () {
    this.save(); var self = this;
    Object.keys(this.state.map).forEach(function (key) { if (!self.state.locks[key]) delete self.state.map[key]; });
  };
  Desk.prototype.suggest = function (suggestions) {
    var next = copy(this.state.map), added = 0;
    suggestions.forEach(function (suggestion) {
      if (next[suggestion.cipher]) return;
      var trial = copy(next); trial[suggestion.cipher] = suggestion.plain;
      if (validMap(trial)) { next = trial; added++; }
    });
    if (added) { this.save(); this.state.map = next; }
    return added;
  };
  Desk.prototype.apply = function (map) {
    if (!validMap(map)) throw new Error('Candidate is not a one-to-one mapping.');
    var self = this;
    Object.keys(this.state.map).forEach(function (key) {
      if (map[key] !== self.state.map[key]) throw new Error('Candidate conflicts with the current key. Compare patterns again.');
    });
    this.save(); this.state.map = copy(map);
  };

  function candidates(text, dictionary, map) {
    if (!/^[A-Za-z\s]*$/.test(text)) throw new Error('Pattern matching needs resolved A–Z words separated by whitespace. Do not turn unknown symbols or punctuation into guessed word boundaries.');
    var words = Array.from(new Set((text.match(/[A-Za-z]+/g) || []).map(function (word) { return word.toUpperCase(); })));
    var dict = dictionary.trim() ? dictionary.trim().split(/\s+/) : [];
    if (dict.length > 100 || dict.some(function (word) { return !/^[a-z]{1,20}$/i.test(word); })) throw new Error('Use at most 100 A–Z dictionary words, each 1–20 letters long.');
    if (!words.length || words.length > 8 || words.some(function (word) { return word.length > 20; })) throw new Error('Use 1–8 distinct cipherwords, each 1–20 letters long; supply word boundaries yourself.');
    dict = Array.from(new Set(dict.map(function (word) { return word.toUpperCase(); })));
    var local = words.map(function (word) { return dict.filter(function (guess) { return pattern(word) === pattern(guess) && !!mergeWord(map, word, guess); }); });
    var allowed = words.map(function () { return new Set(); }), solutions = [], visits = 0, complete = true;
    function search(index, current, chosen) {
      if (++visits > 5000) { complete = false; return; }
      if (index === words.length) {
        solutions.push({ map: current, words: chosen });
        chosen.forEach(function (word, i) { allowed[i].add(word); }); return;
      }
      for (var i = 0; i < local[index].length; i++) {
        var next = mergeWord(current, words[index], local[index][i]);
        if (next) search(index + 1, next, chosen.concat(local[index][i]));
        if (!complete) return;
      }
    }
    search(0, copy(map), []);
    return { words: words, local: local, compatible: allowed.map(function (set) { return Array.from(set); }), solutions: solutions, complete: complete };
  }

  function tokenize(raw, mode, width) {
    if (typeof raw !== 'string' || raw.length > 10000) throw new Error('The transcription must be text no longer than 10,000 characters.');
    if (['symbols', 'digits', 'letters'].indexOf(mode) < 0 || [1, 2, 5].indexOf(width) < 0) throw new Error('Choose a supported alphabet and token width.');
    var tokens = [], excluded = [], spaces = 0, uppercased = 0, group = '', start = 0;
    function flush() { if (group) { tokens.push({ text: group, start: start, incomplete: Array.from(group).length < width }); group = ''; } }
    Array.from(raw).forEach(function (ch, index) {
      if (/\s/u.test(ch)) { spaces++; flush(); return; }
      var keep = mode === 'symbols' || ch === '?' || (mode === 'digits' ? /^[0-9]$/.test(ch) : /^[A-Za-z]$/.test(ch));
      if (!keep) { excluded.push({ symbol: ch, position: index + 1 }); flush(); return; }
      if (mode === 'letters' && /^[a-z]$/.test(ch)) { uppercased++; ch = ch.toUpperCase(); }
      if (!group) start = index + 1;
      group += ch;
      if (Array.from(group).length === width) flush();
    });
    flush();
    var projection = raw.replace(/[^A-Za-z]/g, '').toUpperCase();
    return { tokens: tokens, excluded: excluded, spaces: spaces, uppercased: uppercased, projection: projection,
      projectionRemoved: Array.from(raw).filter(function (ch) { return !/^[A-Za-z]$/.test(ch); }).length };
  }
  function validateDocument(value) {
    if (!value || value.version !== 1 || value.kind !== 'cipher-museum-transcription' || !value.annotations || typeof value.annotations !== 'object' || Array.isArray(value.annotations)) throw new Error('This is not a supported transcription export.');
    var result = tokenize(value.raw, value.mode, value.width), annotations = {};
    Object.keys(value.annotations).forEach(function (key) {
      if (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= result.tokens.length || ['uncertain', 'missing'].indexOf(value.annotations[key]) < 0) throw new Error('An annotation has an invalid position or status.');
      annotations[key] = value.annotations[key];
    });
    return { version: 1, kind: 'cipher-museum-transcription', raw: value.raw, mode: value.mode, width: value.width, annotations: annotations };
  }
  function projectionAllowed(doc, result) {
    return doc.raw.indexOf('?') < 0 && Object.keys(doc.annotations).length === 0 && result.projection.length > 0;
  }

  function boot() {
    var d = document;
    function el(id) { return d.getElementById(id); }
    if (!el('manual-key') || !el('prep-raw')) return;
    var desk = new Desk(el('manual-cipher').value), lastCandidates = null;
    function status(message) { el('manual-status').textContent = message || ''; }
    function renderDesk() {
      el('manual-cipher').value = desk.state.text;
      ALPHABET.split('').forEach(function (cipher) {
        el('manual-map-' + cipher).value = desk.state.map[cipher] || '';
        el('manual-map-' + cipher).readOnly = !!desk.state.locks[cipher];
        el('manual-lock-' + cipher).checked = !!desk.state.locks[cipher];
      });
      el('manual-plain').textContent = decode(desk.state.text, desk.state.map);
      el('manual-undo').disabled = !desk.history.length;
      el('manual-apply').disabled = true; lastCandidates = null;
      el('manual-candidates').textContent = 'Compare patterns to see candidates for the current text and key.';
    }
    ALPHABET.split('').forEach(function (cipher) {
      var cell = d.createElement('div'); cell.className = 'det-key-cell';
      var label = d.createElement('label'); label.htmlFor = 'manual-map-' + cipher; label.textContent = cipher + ' →';
      var input = d.createElement('input'); input.type = 'text'; input.id = label.htmlFor; input.maxLength = 1; input.autocomplete = 'off'; input.setAttribute('aria-label', 'Plaintext for cipher ' + cipher);
      input.addEventListener('change', function () { try { desk.assign(cipher, input.value.trim().toUpperCase()); status('Mapping updated.'); } catch (e) { status(e.message); } renderDesk(); });
      var lockLabel = d.createElement('label'); lockLabel.className = 'det-lock';
      var checkbox = d.createElement('input'); checkbox.type = 'checkbox'; checkbox.id = 'manual-lock-' + cipher; checkbox.setAttribute('aria-label', 'Lock cipher ' + cipher);
      checkbox.addEventListener('change', function () { try { desk.lock(cipher, checkbox.checked); status('Lock updated.'); } catch (e) { status(e.message); } renderDesk(); });
      lockLabel.appendChild(checkbox); lockLabel.appendChild(d.createTextNode('Lock'));
      cell.appendChild(label); cell.appendChild(input); cell.appendChild(lockLabel); el('manual-key').appendChild(cell);
    });
    function newText(text) { var changed = text !== desk.state.text; desk.setText(text); renderDesk(); status(changed ? 'New ciphertext loaded; the key is clear. Undo restores the previous desk.' : 'Ciphertext is unchanged; your current key and locks are retained.'); }
    el('manual-cipher').addEventListener('change', function () { newText(this.value); });
    el('manual-copy').addEventListener('click', function () { newText(el('detective-input').value); });
    el('manual-example').addEventListener('click', function () { newText('ABBA AB'); el('manual-words').value = 'NOON DEED NO DO'; });
    el('manual-undo').addEventListener('click', function () { desk.undo(); renderDesk(); status('Restored the previous text, key and locks.'); });
    el('manual-clear').addEventListener('click', function () { desk.clear(); renderDesk(); status('Cleared unlocked mappings.'); });
    el('manual-frequency').addEventListener('click', function () {
      var suggestions = global.DetectiveAttacks ? global.DetectiveAttacks.substFreqSuggestions(desk.state.text).mapping : [];
      var count = desk.suggest(suggestions); renderDesk(); status('Added ' + count + ' frequency guesses; existing assignments and locks are unchanged.');
    });
    el('manual-words').addEventListener('input', function () { lastCandidates = null; el('manual-apply').disabled = true; el('manual-candidates').textContent = 'Dictionary changed. Compare patterns again.'; });
    el('manual-patterns').addEventListener('click', function () {
      try {
        lastCandidates = candidates(desk.state.text, el('manual-words').value, desk.state.map);
        var result = lastCandidates;
        el('manual-candidates').textContent = result.words.map(function (word, index) {
          return word + ' [' + pattern(word) + ']\n  Pattern + current key: ' + (result.local[index].join(', ') || 'none') + '\n  Compatible across all words: ' + (result.compatible[index].join(', ') || 'none');
        }).join('\n\n') + '\n\n' + (result.complete ? result.solutions.length + ' compatible full assignment(s) within this dictionary.' : 'Search stopped at 5,000 steps. Candidate lists are partial; no uniqueness claim can be made.');
        el('manual-apply').disabled = !(result.complete && result.solutions.length === 1);
        status('Patterns compared. These are dictionary-dependent hypotheses.');
      } catch (e) { lastCandidates = null; el('manual-apply').disabled = true; status(e.message); }
    });
    el('manual-apply').addEventListener('click', function () {
      if (!lastCandidates || !lastCandidates.complete || lastCandidates.solutions.length !== 1) return;
      try { desk.apply(lastCandidates.solutions[0].map); renderDesk(); status('Applied the sole compatible candidate in this dictionary. This is not proof of the original plaintext.'); } catch (e) { status(e.message); }
    });
    renderDesk();

    var prep = { version: 1, kind: 'cipher-museum-transcription', raw: el('prep-raw').value, mode: el('prep-mode').value, width: Number(el('prep-width').value), annotations: {} };
    function prepStatus(message) { el('prep-status').textContent = message || ''; }
    function renderPrep() {
      var result = tokenize(prep.raw, prep.mode, prep.width);
      el('prep-raw').value = prep.raw; el('prep-mode').value = prep.mode; el('prep-width').value = String(prep.width);
      el('prep-losses').textContent = result.tokens.length + ' tokens; ' + result.spaces + ' whitespace characters kept in the original, used as group boundaries; ' + result.uppercased + ' lowercase letters uppercased in tokens. Excluded from tokens: ' + (result.excluded.length ? result.excluded.length + ' symbol(s): ' + result.excluded.slice(0, 30).map(function (item) { return JSON.stringify(item.symbol) + ' at character ' + item.position; }).join(', ') + (result.excluded.length > 30 ? ' …' : '') : 'none') + '.';
      var body = el('prep-tokens'); body.textContent = '';
      result.tokens.slice(0, 300).forEach(function (token, index) {
        var tr = d.createElement('tr'), pos = d.createElement('td'), text = d.createElement('td'), state = d.createElement('td'), select = d.createElement('select');
        pos.textContent = (index + 1) + ' (character ' + token.start + ')';
        text.textContent = token.text + (token.incomplete ? ' [incomplete group]' : '');
        ['read', 'uncertain', 'missing'].forEach(function (value) { var option = d.createElement('option'); option.value = value; option.textContent = value === 'read' ? 'As transcribed' : value === 'uncertain' ? 'Uncertain reading' : 'Missing token'; select.appendChild(option); });
        select.value = prep.annotations[index] || 'read'; select.setAttribute('aria-label', 'Status of token ' + (index + 1));
        select.addEventListener('change', function () { if (select.value === 'read') delete prep.annotations[index]; else prep.annotations[index] = select.value; renderPrep(); var replacement = el('prep-tokens').querySelectorAll('select')[index]; if (replacement) replacement.focus(); prepStatus('Annotation saved for token ' + (index + 1) + '.'); });
        state.appendChild(select); tr.appendChild(pos); tr.appendChild(text); tr.appendChild(state); body.appendChild(tr);
      });
      if (result.tokens.length > 300) { var row = d.createElement('tr'), note = d.createElement('td'); note.colSpan = 3; note.textContent = 'Showing the first 300 tokens. All tokens and annotations remain in the export and counts.'; row.appendChild(note); body.appendChild(row); }
      var counts = new Map();
      result.tokens.forEach(function (token, index) { var key = token.text + (prep.annotations[index] ? ' [' + prep.annotations[index] + ']' : token.text.indexOf('?') >= 0 ? ' [unreadable symbol]' : ''); counts.set(key, (counts.get(key) || 0) + 1); });
      el('prep-frequencies').textContent = Array.from(counts).map(function (entry) { return entry[0] + ': ' + entry[1]; }).join('  |  ') || 'No tokens in this alphabet.';
      el('prep-projection').textContent = result.projection || '(no A–Z letters)';
      var permitted = projectionAllowed(prep, result);
      el('prep-projection-note').textContent = 'This separate projection removes ' + result.projectionRemoved + ' non-ASCII-letter characters, including whitespace, and uppercases ASCII letters. It ignores the selected token width. ' + (permitted ? 'Review this loss before sending it to the Detective. The original stays here.' : 'Sending is blocked while any symbol is unreadable, uncertain or missing, or no A–Z letters remain. Resolve uncertainty explicitly first; dropping a position can invalidate a positional attack.');
      el('prep-send').disabled = !permitted;
    }
    function readPrep() {
      if (Object.keys(prep.annotations).length) { renderPrep(); prepStatus('Change refused: first review and explicitly clear the annotations, or mark each token as transcribed. Changing the alphabet or width does not resolve uncertainty.'); return; }
      prep.raw = el('prep-raw').value; prep.mode = el('prep-mode').value; prep.width = Number(el('prep-width').value); renderPrep(); prepStatus('Transcription or tokenization changed; the original text remains in this workspace.');
    }
    el('prep-clear-annotations').addEventListener('click', function () { prep.annotations = {}; renderPrep(); prepStatus('Annotations explicitly cleared after review. Any question marks still block sending a projection.'); });
    ['prep-raw', 'prep-mode', 'prep-width'].forEach(function (id) { el(id).addEventListener('change', readPrep); });
    el('prep-copy').addEventListener('click', function () { if (Object.keys(prep.annotations).length) { prepStatus('Copy refused: export a copy if needed, then explicitly clear the current annotations before replacing the transcription.'); return; } if (el('detective-input').value.length > 10000) { prepStatus('Copy refused: this workspace accepts up to 10,000 characters. Keep the full source separately and deliberately select an excerpt.'); return; } el('prep-raw').value = el('detective-input').value; readPrep(); prepStatus('Copied Detective input into an independent transcription.'); });
    el('prep-example').addEventListener('click', function () { prep.raw = '12 ?4 56\n12 34 5? ◆'; prep.mode = 'digits'; prep.width = 2; prep.annotations = { '1': 'uncertain' }; renderPrep(); prepStatus('Original exercise: compare widths 1 and 2, and try the all-symbols alphabet to retain the diamond. Question marks keep unreadable positions visible.'); });
    el('prep-send').addEventListener('click', function () {
      var result = tokenize(prep.raw, prep.mode, prep.width); if (!projectionAllowed(prep, result)) return;
      el('detective-input').value = result.projection; el('detective-input').dispatchEvent(new Event('input', { bubbles: true })); prepStatus('Sent only the reviewed A–Z projection. Original transcription and annotations remain here.');
    });
    function exportPrep() { var json = JSON.stringify(validateDocument(prep), null, 2); el('prep-json').value = json; prepStatus('Export includes the exact original transcription, alphabet, width and positional annotations.'); return json; }
    el('prep-export').addEventListener('click', exportPrep);
    if (el('prep-evidence')) el('prep-evidence').addEventListener('click', function () {
      try {
        global.sessionStorage.setItem('museum-evidence-import', JSON.stringify(validateDocument(prep)));
        global.location.href = 'lab/evidence-workbench.html';
      } catch (e) { prepStatus('Could not transfer the record. Export JSON and import it in the Evidence Workbench. ' + e.message); }
    });
    el('prep-download').addEventListener('click', function () {
      var json = exportPrep();
      if (!global.URL || !global.URL.createObjectURL) { prepStatus('Use the exported JSON text below to save this transcription.'); return; }
      var url = global.URL.createObjectURL(new Blob([json], { type: 'application/json' })), link = d.createElement('a');
      link.href = url; link.download = 'cipher-museum-transcription.json'; d.body.appendChild(link); link.click(); link.remove(); setTimeout(function () { global.URL.revokeObjectURL(url); }, 1000);
    });
    el('prep-import').addEventListener('click', function () { try { if (el('prep-json').value.length > 100000) throw new Error('Export is too large.'); prep = validateDocument(JSON.parse(el('prep-json').value)); renderPrep(); prepStatus('Restored the exact transcription and its annotations.'); } catch (e) { prepStatus('Could not load transcription: ' + e.message); } });
    renderPrep();
  }
  var api = { Desk: Desk, decode: decode, pattern: pattern, candidates: candidates, tokenize: tokenize, validateDocument: validateDocument, projectionAllowed: projectionAllowed };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.DetectiveWorkspaces = api;
  if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot(); }
})(typeof window !== 'undefined' ? window : globalThis);
