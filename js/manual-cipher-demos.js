/* Original-manual demos: rendering only. Procedures and traces live in CipherEngines. */
(function () {
  'use strict';
  const root = document.querySelector('[data-manual-demo]');
  if (!root) return;
  const name = root.dataset.manualDemo;
  const engine = window.CipherEngines && window.CipherEngines[name];
  const $ = id => root.querySelector('#' + id);
  let mode = 'encrypt', trace = null, frames = [], progress = 0, timer = null;
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function stop() {
    if (timer !== null) { clearInterval(timer); timer = null; }
    $('manual-play').textContent = 'Play';
    $('manual-play').setAttribute('aria-pressed', 'false');
  }
  function key() {
    if (name === 'rasterschluessel44') return {
      startRow: Number($('rs-row').value) - 1, startColumn: Number($('rs-column').value) - 1,
      minute: Number($('rs-minute').value), strict: $('rs-policy').value === 'strict'
    };
    if (name === 'doublePlayfair') return {
      squareA: $('dp-a').value, squareB: $('dp-b').value, filler: $('dp-filler').value, strict: true
    };
    const value = $('amsco-key').value.trim();
    if (!value) throw new Error('Enter a permutation of column ranks, such as 41325.');
    if (!/^\d+(?:\s+\d+)*$/.test(value)) throw new Error('Column ranks must be digits, separated by spaces when needed.');
    return { order: value.includes(' ') ? value.split(/\s+/).map(Number) : [...value].map(Number), first: Number($('amsco-first').value) };
  }
  function node(tag, text, cls) {
    const n = document.createElement(tag); if (text !== undefined) n.textContent = text;
    if (cls) n.className = cls; return n;
  }
  function buildFrames(t) {
    if (name !== 'doublePlayfair') return (t.decrypt ? t.extraction : t.placement)
      .map(pos => ({ phase: 'entry', pos })).concat((t.decrypt ? t.placement : t.extraction).map(pos => ({ phase: 'read', pos })));
    const f = [];
    t.blocks.forEach((block, index) => {
      if (!t.decrypt) for (let p = 0; p < block.top.length * 2; p++) f.push({ phase: 'arrange', block: index, pos: p });
      t.pairs.filter(p => p.block === index).forEach(pair => {
        for (const phase of ['pair', 'stage1', 'stage2']) f.push({ phase, block: index, pair });
      });
    }); return f;
  }
  function drawTransposition() {
    const active = frames[progress - 1];
    const entered = new Set(frames.slice(0, progress).filter(f => f.phase === 'entry').map(f => f.pos));
    const read = new Set(frames.slice(0, progress).filter(f => f.phase === 'read').map(f => f.pos));
    const table = node('table', undefined, 'cipher-table manual-table');
    table.append(node('caption', name === 'rasterschluessel44' ? 'Original manual stencil; blocked cells are unavailable' : 'Alternating cell lengths; column ranks above'));
    const head = node('thead'), hr = node('tr'); hr.append(node('th', 'Row'));
    const order = trace.order;
    order.forEach((rank, col) => { const th = node('th', String(rank)); th.scope = 'col'; th.title = 'Column ' + (col + 1) + ', rank ' + rank; hr.append(th); });
    head.append(hr); table.append(head); const body = node('tbody');
    const width = name === 'rasterschluessel44' ? 25 : trace.width;
    const rows = name === 'rasterschluessel44' ? 24 : Math.ceil(trace.cells.length / width);
    for (let row = 0; row < rows; row++) {
      const tr = node('tr'), th = node('th', String(row + 1)); th.scope = 'row'; tr.append(th);
      for (let col = 0; col < width; col++) {
        const pos = row * width + col;
        const blocked = name === 'rasterschluessel44' && trace.grid[row][col] === '#';
        const cell = trace.cells[pos];
        const value = name === 'rasterschluessel44' ? cell : cell && cell.value;
        const td = node('td', blocked ? '×' : entered.has(pos) ? value : '', blocked ? 'manual-blocked' : 'manual-cell');
        if (name === 'amsco' && cell) { td.dataset.length = cell.length; td.title = cell.length + '-letter cell'; }
        if (read.has(pos)) td.classList.add('manual-read');
        if (active && active.pos === pos) td.classList.add('manual-active');
        if (name === 'rasterschluessel44' && pos === trace.beginning) td.classList.add('manual-start');
        tr.append(td);
      } body.append(tr);
    }
    table.append(body); $('manual-grid').replaceChildren(table);
    $('manual-caption').textContent = name === 'rasterschluessel44'
      ? 'Digit sum ' + trace.sum + '; read begins in physical column ' + (trace.readColumn + 1) + ', rank ' + trace.firstRank + '. ' + trace.input.length + ' of 240 writing cells used.'
      : 'Ranks: ' + trace.order.join(' ') + '. First cell: ' + trace.first + ' letter(s). Last cell retains its actual length; no nulls added.';
    $('manual-progress-output').textContent = frames.slice(0, progress).filter(f => f.phase === 'read')
      .map(f => name === 'rasterschluessel44' ? trace.cells[f.pos] : trace.cells[f.pos].value).join('');
    return active ? (active.phase === 'entry' ? 'Place input in ' : 'Extract output from ') + 'row ' + (Math.floor(active.pos / width) + 1) + ', column ' + (active.pos % width + 1) + '.' : 'Ready to place the input.';
  }
  function square(text, label, positions) {
    const table = node('table', undefined, 'cipher-table manual-square'); table.append(node('caption', label));
    const body = node('tbody'); for (let row = 0; row < 5; row++) {
      const tr = node('tr'); for (let col = 0; col < 5; col++) {
        const index = row * 5 + col, td = node('td', text[index]); if (positions.includes(index)) td.classList.add('manual-active'); tr.append(td);
      } body.append(tr);
    } table.append(body); return table;
  }
  function drawDouble() {
    const active = frames[progress - 1], index = active ? active.block : 0;
    const block = trace.blocks[index];
    const table = node('table', undefined, 'cipher-table manual-table'); table.append(node('caption', 'Plaintext arrangement: block ' + (index + 1) + ', up to 17 columns'));
    const body = node('tbody');
    if (block) for (const [row, text] of [['Top', block.top], ['Bottom', block.bottom]]) {
      const tr = node('tr'), th = node('th', row); th.scope = 'row'; tr.append(th);
      [...text].forEach((letter, col) => {
        const p = col + (row === 'Bottom' ? block.top.length : 0);
        const visible = frames.slice(0, progress).some(f => f.block === index && (trace.decrypt
          ? f.phase === 'stage2' && f.pair.column === col : f.phase === 'arrange' && f.pos === p));
        const td = node('td', visible ? letter : ''); if (active && active.pair && active.pair.column === col) td.classList.add('manual-active'); tr.append(td);
      }); body.append(tr);
    }
    table.append(body); $('manual-grid').replaceChildren(table);
    let a = [], b = [], message = 'Ready to arrange the plaintext into two rows.';
    if (active) {
      if (active.phase === 'arrange') message = 'Place plaintext letter ' + (active.pos + 1) + ' in block ' + (index + 1) + '.';
      else {
        const pair = active.pair;
        if (active.phase === 'pair') message = 'Form pair ' + pair.pair + (trace.decrypt ? ' from ciphertext.' : ' vertically: top first, bottom second.');
        else {
          const stage = pair[active.phase];
          [a, b] = trace.decrypt ? [[stage.positions[1]], [stage.positions[0]]] : [[stage.positions[0]], [stage.positions[1]]];
          message = (active.phase === 'stage1' ? 'First' : 'Second') + ' substitution: ' + stage.pair + ' → ' + stage.result + '; ' +
            (stage.sameRow ? 'same row, move ' + (trace.decrypt ? 'left' : 'right') + ', cross the squares.' : 'rectangle, cross the row and column coordinates.');
        }
      }
    }
    $('manual-squares').replaceChildren(square(trace.squareA, 'Square A', a), square(trace.squareB, 'Square B', b));
    $('manual-caption').textContent = 'Two substitutions per pair. ' + trace.blocks.length + ' block(s); ' + trace.padding + ' filler letter(s) added and retained on decryption.';
    // During decryption recovered pairs rebuild row order, not interleaved output.
    const complete = frames.slice(0, progress).filter(f => f.phase === 'stage2');
    $('manual-progress-output').textContent = trace.decrypt ? trace.blocks.map((_, i) => {
      const ps = complete.filter(f => f.block === i).map(f => f.pair.stage2.result); return ps.map(p => p[0]).join('') + ps.map(p => p[1]).join('');
    }).join('') : complete.map(f => f.pair.stage2.result).join('');
    return message;
  }
  function draw() {
    if (!trace) return;
    const text = name === 'doublePlayfair' ? drawDouble() : drawTransposition();
    $('manual-animation-status').textContent = progress + ' / ' + frames.length + ': ' + text;
    $('manual-step').disabled = progress >= frames.length;
    $('manual-play').disabled = progress >= frames.length;
  }
  function clear() {
    trace = null; frames = []; progress = 0;
    for (const id of ['manual-output', 'manual-grid', 'manual-caption', 'manual-progress-output', 'manual-animation-status', 'manual-squares']) {
      const el = $(id); if (el) el.replaceChildren();
    }
    for (const id of ['manual-step', 'manual-play', 'manual-reset', 'manual-use-output']) $(id).disabled = true;
  }
  function run() {
    stop(); clear();
    try {
      if (!engine) throw new Error('The cipher engine could not load. Reload this page.');
      trace = engine.trace($('manual-message').value, key(), mode === 'decrypt');
      frames = buildFrames(trace); $('manual-output').textContent = trace.output;
      $('manual-status').textContent = 'Computed ' + trace.input.length + ' normalized letters. ' + (trace.padding ? 'One filler letter added; decryption retains it.' : 'No padding added.');
      for (const id of ['manual-reset', 'manual-use-output']) $(id).disabled = false;
      draw();
    } catch (error) { clear(); $('manual-status').textContent = error.message; }
  }
  function setMode(next) {
    mode = next; root.querySelectorAll('[data-mode]').forEach(btn => {
      const active = btn.dataset.mode === mode; btn.classList.toggle('active', active); btn.setAttribute('aria-pressed', String(active));
    });
  }
  root.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => { setMode(btn.dataset.mode); run(); }));
  root.querySelectorAll('input, textarea, select').forEach(el => el.addEventListener('input', run));
  $('manual-run').addEventListener('click', run);
  $('manual-use-output').addEventListener('click', () => { if (!trace) return; $('manual-message').value = trace.output; setMode(mode === 'encrypt' ? 'decrypt' : 'encrypt'); run(); });
  $('manual-step').addEventListener('click', () => { stop(); progress = Math.min(progress + 1, frames.length); draw(); });
  $('manual-reset').addEventListener('click', () => { stop(); progress = 0; draw(); });
  $('manual-play').addEventListener('click', () => {
    if (timer !== null) { stop(); return; }
    if (reduced()) { progress = frames.length; draw(); return; }
    $('manual-play').textContent = 'Pause'; $('manual-play').setAttribute('aria-pressed', 'true');
    timer = setInterval(() => { progress++; draw(); if (progress >= frames.length) stop(); }, 220);
  });
  window.addEventListener('pagehide', stop);
  run();
}());
