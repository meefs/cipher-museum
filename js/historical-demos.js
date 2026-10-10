(function () {
  'use strict';
  const demo = document.querySelector('[data-historical-demo]');
  if (!demo) return;
  const cipher = demo.dataset.historicalDemo, api = window.HistoricalCiphers;
  const $ = id => document.getElementById(id);
  let mode = 'encrypt', turn = 0, holes = [], last = null;
  const size = () => Number($('grille-size').value);

  function resetHoles() {
    const n = size(), seen = new Set();
    holes = [];
    for (let cell = 0; cell < n * n; cell++) {
      if (seen.has(cell)) continue;
      holes.push(cell);
      let next = cell;
      for (let t = 0; t < 4; t++) { seen.add(next); next = api.rotate(next, n); }
    }
    turn = 0;
  }

  function drawGrille() {
    const n = size(), grid = $('grille-grid');
    grid.replaceChildren();
    grid.style.gridTemplateColumns = `repeat(${n}, minmax(2.75rem, 1fr))`;
    const order = api.grilleOrder(n, holes);
    const visible = new Set(order.orientations[turn]);
    for (let cell = 0; cell < n * n; cell++) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'historical-cell' + (visible.has(cell) ? ' is-hole' : '');
      button.textContent = last?.blocks[0]?.[cell] || '·';
      button.setAttribute('aria-pressed', String(visible.has(cell)));
      button.setAttribute('aria-label', `Row ${Math.floor(cell / n) + 1}, column ${cell % n + 1}: ${visible.has(cell) ? 'hole' : 'covered'}, ${button.textContent}`);
      // Select a new representative in the current orientation, then undo
      // the viewing rotation to store it in the original key orientation.
      button.addEventListener('click', () => {
        let base = cell;
        for (let t = turn; t < 4 && turn !== 0; t++) base = api.rotate(base, n);
        const orbit = [base];
        for (let t = 1; t < 4; t++) orbit.push(api.rotate(orbit[t - 1], n));
        holes = holes.filter(h => !orbit.includes(h));
        holes.push(base);
        run();
        grid.children[cell]?.focus();
      });
      grid.appendChild(button);
    }
    $('grille-angle').textContent = `Orientation ${turn * 90}° clockwise. Highlighted cells are the holes; each rotation covers one quarter of the grid.`;
    $('grille-key').textContent = [...holes].sort((a, b) => a - b).join(', ');
    $('grille-reading').textContent = last?.blocks[0]
      ? `Read through these holes: ${order.orientations[turn].map(c => last.blocks[0][c]).join('')}`
      : 'Enter a message to fill the grid.';
  }

  function drawMyszkowski(result) {
    const grid = $('myszkowski-grid');
    grid.replaceChildren();
    grid.style.gridTemplateColumns = `repeat(${result.key.length}, minmax(2.75rem, 1fr))`;
    [...result.key].forEach((letter, i) => {
      const cell = document.createElement('span');
      cell.className = 'historical-cell historical-key-heading';
      cell.textContent = `${letter} ${result.ranks[i]}`;
      grid.appendChild(cell);
    });
    // Keep large messages usable; the full transformation is still output.
    result.cells.slice(0, result.key.length * 12).forEach(letter => {
      const cell = document.createElement('span');
      cell.className = 'historical-cell'; cell.textContent = letter; grid.appendChild(cell);
    });
    $('myszkowski-ranks').textContent = `Ranks: ${result.ranks.join(' ')}. Equal ranks are read across rows together. Grid shows at most twelve message rows.`;
  }

  function run() {
    try {
      const text = $('historical-message').value;
      if (cipher === 'nema') {
        last = api.nema(text, $('nema-windows').value);
        $('nema-trace').replaceChildren();
        last.trace.forEach((step, i) => {
          const row = document.createElement('tr');
          [i + 1, step.input, step.output, step.windows].forEach(value => {
            const cell = document.createElement('td'); cell.textContent = value; row.appendChild(cell);
          });
          $('nema-trace').appendChild(row);
        });
        $('historical-status').textContent = `${mode === 'encrypt' ? 'Encrypted' : 'Decrypted'} ${last.output.length} letters. Each run resets to the supplied windows. Final windows: ${last.windows}.`;
      } else if (cipher === 'turning-grille') {
        last = api.turningGrille(text, size(), holes, mode === 'decrypt');
        drawGrille();
        $('historical-status').textContent = `${last.blocks.length} block(s). ${mode === 'encrypt' ? `${last.padding} X padding letter(s) added.` : 'Padding is retained: remove it only if you know the original length.'} Grid shows the first block.`;
      } else {
        last = api.myszkowski(text, $('myszkowski-key').value, mode === 'decrypt');
        drawMyszkowski(last);
        $('historical-status').textContent = `${mode === 'encrypt' ? 'Encrypted' : 'Decrypted'} ${last.output.length} letters; no padding added.`;
      }
      $('historical-output').textContent = last.output || 'Enter a message to begin.';
    } catch (error) {
      last = null;
      $('historical-output').textContent = '';
      $('historical-status').textContent = error.message;
      if (cipher === 'turning-grille') drawGrille();
      if (cipher === 'nema') $('nema-trace').replaceChildren();
      if (cipher === 'myszkowski') $('myszkowski-grid').replaceChildren();
    }
  }

  demo.querySelectorAll('[data-mode]').forEach(button => {
    button.addEventListener('click', () => {
      mode = button.dataset.mode;
      demo.querySelectorAll('[data-mode]').forEach(b => {
        b.classList.toggle('active', b === button);
        b.setAttribute('aria-pressed', String(b === button));
      });
      run();
    });
  });
  $('historical-run').addEventListener('click', run);
  $('historical-use-output').addEventListener('click', () => {
    if (!last?.output) return;
    $('historical-message').value = last.output;
    demo.querySelector(`[data-mode="${mode === 'encrypt' ? 'decrypt' : 'encrypt'}"]`).click();
  });
  $('historical-message').addEventListener('input', run);
  if (cipher === 'nema') $('nema-windows').addEventListener('input', run);
  if (cipher === 'myszkowski') $('myszkowski-key').addEventListener('input', run);
  if (cipher === 'turning-grille') {
    resetHoles();
    $('grille-size').addEventListener('change', () => { resetHoles(); run(); });
    $('grille-rotate').addEventListener('click', () => { turn = (turn + 1) % 4; drawGrille(); });
    $('grille-reset').addEventListener('click', () => { resetHoles(); run(); });
  }
  run();
})();
