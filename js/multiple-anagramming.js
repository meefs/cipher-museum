/* Multiple anagramming: original, complete-rectangle teaching fixtures.
 * A strip is one four-letter column from each intercept, kept in transmitted
 * order. Rearranging a strip applies the same hypothesis to every message.
 * No imported historical ciphertext, dictionary or language model is used.
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document) {
    root.MultipleAnagramming = api;
    var start = function () { api.mount(root.document); };
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start);
    else start();
  }
}(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  var WIDTH = 5, HEIGHT = 4;
  // Independently recorded: plaintext written in four rows of five, columns
  // transmitted in order 3, 1, 5, 2, 4. The control uses 5, 2, 4, 1, 3.
  var fixtures = [
    { name: 'Intercept 1', ciphertext: 'ECEOMHRTTUANEEINTORO', plaintext: 'MEETTHECOURIERATNOON' },
    { name: 'Intercept 2', ciphertext: 'ITFUBWBEGRRKRAEDNEOS', plaintext: 'BRINGWATERBEFOREDUSK' },
    { name: 'Intercept 3', ciphertext: 'OEHOSTRNTORDCHTRUNEA', plaintext: 'SCOUTTHENORTHERNROAD' },
    { name: 'Different-key control', ciphertext: 'RTRKEPEDDROSSEBENOFU', plaintext: 'SENDREPORTBEFOREDUSK' }
  ];
  var sharedOrder = [1, 3, 0, 4, 2]; // B, D, A, E, C: transmitted-strip identities.
  var contacts = new Set('TH HE IN ER AN RE ON AT EN ND TI ES OR TE OF ED IS IT AL AR ST TO NT NG SE HA AS OU IO LE VE CO BE RT WA SC RO UR'.split(' '));

  function validOrder(order) {
    return Array.isArray(order) && order.length === WIDTH &&
      order.every(function (v) { return Number.isInteger(v) && v >= 0 && v < WIDTH; }) &&
      new Set(order).size === WIDTH;
  }
  function splitColumns(ciphertext) {
    if (!/^[A-Z]{20}$/.test(ciphertext)) throw new Error('Use exactly twenty A–Z letters for this 4 × 5 exercise.');
    return ciphertext.match(/.{4}/g);
  }
  function reconstruct(ciphertext, order) {
    if (!validOrder(order)) throw new Error('Each of the five strips must appear exactly once.');
    var columns = splitColumns(ciphertext), result = '';
    for (var row = 0; row < HEIGHT; row++) {
      for (var col = 0; col < WIDTH; col++) result += columns[order[col]][row];
    }
    return result;
  }
  function move(order, strip, direction) {
    if (!validOrder(order) || (direction !== -1 && direction !== 1)) throw new Error('Invalid strip movement.');
    var next = order.slice(), at = next.indexOf(strip), target = at + direction;
    if (at === -1) throw new Error('Unknown strip.');
    if (target >= 0 && target < WIDTH) {
      next[at] = next[target];
      next[target] = strip;
    }
    return next;
  }
  function contactScore(order) {
    var count = 0;
    fixtures.slice(0, 3).forEach(function (fixture) {
      var candidate = reconstruct(fixture.ciphertext, order);
      // Count only horizontal contacts between adjacent strips, not the
      // contact from the last column of a row to the first of the next row.
      for (var row = 0; row < HEIGHT; row++) {
        for (var col = 0; col < WIDTH - 1; col++) {
          if (contacts.has(candidate.slice(row * WIDTH + col, row * WIDTH + col + 2))) count++;
        }
      }
    });
    return count;
  }

  function mount(document) {
    var panel = document.getElementById('multiple-anagramming');
    if (!panel || panel.dataset.ready) return;
    panel.dataset.ready = 'true';
    var order = [0, 1, 2, 3, 4], checked = false;
    var select = document.getElementById('ma-selected');
    var stripList = document.getElementById('ma-strips');
    var outputs = document.getElementById('ma-candidates');
    var status = document.getElementById('ma-status');
    var showControl = document.getElementById('ma-control');
    var left = document.getElementById('ma-left'), right = document.getElementById('ma-right');
    var label = function (strip) { return String.fromCharCode(65 + strip); };

    function render() {
      var selected = Number(select.value), visible = showControl.checked ? fixtures : fixtures.slice(0, 3);
      stripList.replaceChildren();
      order.forEach(function (strip, position) {
        var tile = document.createElement('li');
        tile.className = 'ma-strip' + (selected === strip ? ' ma-selected' : '');
        var title = document.createElement('strong');
        title.textContent = label(strip);
        title.setAttribute('aria-label', 'Strip ' + label(strip) + ', position ' + (position + 1));
        tile.appendChild(title);
        visible.forEach(function (fixture, index) {
          var column = document.createElement('div');
          column.className = 'ma-column';
          var tag = document.createElement('small');
          tag.textContent = index === 3 ? 'Control' : 'Msg ' + (index + 1);
          var letters = document.createElement('span');
          var text = splitColumns(fixture.ciphertext)[strip];
          letters.className = 'ma-letters';
          letters.textContent = text.split('').join('\n');
          letters.setAttribute('aria-label', fixture.name + ': ' + text);
          column.append(tag, letters);
          tile.appendChild(column);
        });
        stripList.appendChild(tile);
      });
      outputs.replaceChildren();
      visible.forEach(function (fixture, index) {
        var block = document.createElement('div'), heading = document.createElement('h3');
        heading.textContent = fixture.name;
        var cipher = document.createElement('p');
        cipher.className = 'ma-intercept';
        cipher.textContent = 'Received: ' + splitColumns(fixture.ciphertext).join(' ');
        var candidate = document.createElement('code');
        candidate.className = 'ma-candidate';
        var text = reconstruct(fixture.ciphertext, order);
        candidate.textContent = text;
        candidate.dataset.message = String(index + 1);
        block.append(heading, cipher, candidate);
        if (checked) {
          var result = document.createElement('p');
          result.className = 'ma-check-result';
          result.textContent = text === fixture.plaintext ? 'Matches this prepared message.' :
            (index === 3 ? 'Does not match: this control used a different column order.' : 'Does not yet match this prepared message.');
          block.appendChild(result);
        }
        outputs.appendChild(block);
      });
      var at = order.indexOf(selected);
      left.disabled = at === 0;
      right.disabled = at === WIDTH - 1;
      document.getElementById('ma-order').textContent = order.map(label).join(' → ');
      document.getElementById('ma-score').textContent = contactScore(order) + ' of 48 common contacts';
      if (checked) {
        var solved = fixtures.slice(0, 3).every(function (fixture) { return reconstruct(fixture.ciphertext, order) === fixture.plaintext; });
        status.textContent = solved ? 'All three same-key messages match the prepared answer. The different-key control needs its own ordering.' :
          'This arrangement does not match all three prepared messages. A higher contact score is a clue, not proof.';
      }
    }
    function shift(direction) {
      var strip = Number(select.value);
      order = move(order, strip, direction);
      checked = false;
      render();
      status.textContent = 'Moved strip ' + label(strip) + ' to position ' + (order.indexOf(strip) + 1) + ' in every intercept.';
    }
    select.addEventListener('change', render);
    left.addEventListener('click', function () { shift(-1); });
    right.addEventListener('click', function () { shift(1); });
    showControl.addEventListener('change', render);
    document.getElementById('ma-check').addEventListener('click', function () { checked = true; render(); });
    document.getElementById('ma-reveal').addEventListener('click', function () { order = sharedOrder.slice(); checked = true; render(); });
    document.getElementById('ma-reset').addEventListener('click', function () {
      order = [0, 1, 2, 3, 4]; checked = false; select.value = '0'; render();
      status.textContent = 'Reset to the received strip order A → B → C → D → E.';
    });
    render();
  }
  return { fixtures: fixtures, reconstruct: reconstruct, splitColumns: splitColumns, move: move, contactScore: contactScore, mount: mount };
}));
