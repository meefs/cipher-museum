/**
 * THE CIPHER MUSEUM — Site Search
 * Loads /js/search-index.json and provides ranked substring + token matching
 * across the 167-exhibit collection (cipher pages, exhibit halls, biographies,
 * cryptanalysis techniques, the timeline, and key tool pages).
 *
 * Public API on window.CipherSearch:
 *   load()            → Promise<entries>
 *   query(q, limit)   → array of {entry, score, matchedField}
 *   highlight(text,q) → text with <mark> wrapped tokens
 *
 * Resolves URLs relative to the page that loaded the script
 * (handles ciphers/, halls/, etc. subfolders automatically).
 */
'use strict';
(function () {
  var INDEX_URL_REL = 'js/search-index.json';
  var BASE = (function () {
    var p = location.pathname;
    var inSub = /\/(ciphers|halls|tours|lab|community)\//.test(p);
    return inSub ? '../' : '';
  })();

  var _entries = null;
  var _loadPromise = null;

  function normalizeSearchText(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      // Elide every apostrophe form rather than folding them to one, so an
      // apostrophe-free query ("geez") reaches an apostrophised title ("Geʼez").
      .replace(/[\u2018\u2019\u02bbʼ']/g, '')
      .toLowerCase();
  }

  function words(value) {
    return normalizeSearchText(value).match(/[\p{L}\p{N}]+/gu) || [];
  }

  // Separator-insensitive form. Titles hyphenate designations that visitors type
  // closed up — "M-209", "SHA-256", "KL-7" are searched as "m209", "sha256",
  // "kl7" — so matching also consults a form with every separator removed.
  // Used only as an extra alternative, never to replace a normal match.
  function flatten(value) {
    return normalizeSearchText(value).replace(/[^\p{L}\p{N}]+/gu, '');
  }

  function load() {
    if (_entries) return Promise.resolve(_entries);
    if (_loadPromise) return _loadPromise;
    if (typeof fetch !== 'function') {
      _entries = [];
      return Promise.resolve(_entries);
    }
    _loadPromise = fetch(BASE + INDEX_URL_REL, {cache: 'force-cache'})
      .then(function (r) {
        if (!r.ok) throw new Error('Index HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        _entries = (data.entries || []).map(function (e) {
          var haystack = e.t + ' ' + (e.h || '') + ' ' + (e.s || '') + ' ' + (e.g || []).join(' ');
          return {
            title: e.t,
            url: BASE + e.u,
            kind: e.k,
            hall: e.h,
            created: e.c,
            broken: e.b,
            trust: e.trust || null,
            exhibitNumber: e.exhibitNumber,
            note: e.n || '',
            summary: e.s,
            tags: e.g || [],
            _hay: normalizeSearchText(haystack),
            _words: words(haystack),
            _flat: flatten(haystack)
          };
        });
        return _entries;
      })
      .catch(function (err) {
        console.error('[CipherSearch] index load failed:', err);
        _entries = [];
        return _entries;
      });
    return _loadPromise;
  }

  function tokenize(q) {
    return words(q);
  }

  /**
   * Score an entry against the query.
   *  +50 exact title match
   *  +25 title startsWith
   *  +12 title substring
   *  +10 tag exact
   *  +6  hall match
   *  +4  summary substring
   *  +2  any haystack substring
   * AND-mode: every token must hit something.
   */
  function score(entry, tokens, raw) {
    var rawLower = normalizeSearchText(raw);
    var titleLower = normalizeSearchText(entry.title);
    var s = 0;
    var matchedField = null;

    var rawFlat = flatten(raw);
    var titleFlat = flatten(entry.title);
    if (titleLower === rawLower || titleFlat === rawFlat) { s += 50; matchedField = 'title'; }
    else if (titleLower.indexOf(rawLower) === 0 || titleFlat.indexOf(rawFlat) === 0) { s += 25; matchedField = 'title'; }
    else if (titleLower.indexOf(rawLower) >= 0 || titleFlat.indexOf(rawFlat) >= 0) { s += 12; matchedField = 'title'; }

    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i];
      var hit = false;
      var eraToken = tok === 'wwi' || tok === 'wwii';
      var includesToken = function (value) {
        if (eraToken) return words(value).indexOf(tok) >= 0;
        return normalizeSearchText(value).indexOf(tok) >= 0 || flatten(value).indexOf(tok) >= 0;
      };

      if (includesToken(titleLower)) { s += 8; hit = true; matchedField = matchedField || 'title'; }
      for (var j = 0; j < entry.tags.length; j++) {
        var tag = normalizeSearchText(entry.tags[j]);
        if (tag === tok) { s += 10; hit = true; matchedField = matchedField || 'tag'; break; }
        if (!eraToken && tag.indexOf(tok) >= 0) { s += 4; hit = true; matchedField = matchedField || 'tag'; }
      }
      if (includesToken(entry.hall || '')) { s += 6; hit = true; matchedField = matchedField || 'hall'; }
      if (includesToken(entry.summary || '')) { s += 4; hit = true; matchedField = matchedField || 'summary'; }
      if (!hit && (eraToken ? entry._words.indexOf(tok) >= 0
          : (entry._hay.indexOf(tok) >= 0 || entry._flat.indexOf(tok) >= 0))) { s += 2; hit = true; matchedField = matchedField || 'any'; }
      if (!hit) return 0; // AND-mode: must hit every token
    }

    // Kind preference: ciphers > halls > pages
    if (entry.kind === 'cipher') s += 1;
    if (entry.kind === 'hall') s += 0.5;
    return s;
  }

  function query(q, limit) {
    if (!_entries) return [];
    var raw = (q || '').trim();
    if (!raw) return [];
    var tokens = tokenize(raw);
    if (!tokens.length) return [];
    var out = [];
    for (var i = 0; i < _entries.length; i++) {
      var sc = score(_entries[i], tokens, raw);
      if (sc > 0) out.push({entry: _entries[i], score: sc});
    }
    out.sort(function (a, b) { return b.score - a.score; });
    return limit ? out.slice(0, limit) : out;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function highlight(text, q) {
    var safe = escapeHTML(text);
    var tokens = tokenize(q).filter(function (t) { return t.length >= 2; });
    if (!tokens.length) return safe;
    tokens.sort(function (a, b) { return b.length - a.length; });
    tokens.forEach(function (t) {
      var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      safe = safe.replace(re, '<mark>$1</mark>');
    });
    return safe;
  }

  window.CipherSearch = {
    load: load,
    query: query,
    highlight: highlight,
    normalize: normalizeSearchText,
    base: BASE
  };
})();
