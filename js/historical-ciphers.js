/* Historical exhibit algorithms. Each call starts from the supplied key.
 * NEMA wiring/notch measurements: https://www.cryptomuseum.com/crypto/nema/
 * Military stepping and window convention checked against Martin Grap's rmsk2:
 * https://github.com/rmsk2/rmsk2/blob/master/nema_test.cpp
 * This is an independent implementation of the published machine specification.
 */
(function (root) {
  'use strict';
  const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const clean = text => String(text).normalize('NFD').replace(/\p{M}/gu, '')
    .toUpperCase().replace(/[^A-Z]/g, '');
  const mod = n => (n % 26 + 26) % 26;

  // Electrical contact zero is I. Positions are the lower window row, not
  // the top of the wheels. A two-contact offset connects those conventions.
  const CONTACTS = 'IJKLMNOPQRSTUVWXYZABCDEFGH';
  const physicalWiring = {
    A: 'NSKITCOYMVWAUJDRLZXHFQEGPB', B: 'KJYNTMEHLOZQBWPSXIRFAGUDVC',
    C: 'PNFUTEDIZYAHVRWOJSGBQMKCXL', D: 'WJBEYFUCMDTAZKXPIQHSVLGONR',
    U: 'KWPNGHEFVTAZUDYCXSRJMIBQOL'
  };
  const wiring = Object.fromEntries(Object.entries(physicalWiring).map(([name, w]) =>
    [name, [...CONTACTS].map(c => CONTACTS.indexOf(w[ABC.indexOf(c)]))]));
  const entry = [...'QMNBVCXYLKJHGFDSAPOIUZTREW'].map(c => CONTACTS.indexOf(c));
  const notches = {
    1: 'BJSYZ', 12: 'BCDEFGHIJKLPQRSUVWXYZ', 13: 'ABDEFGJKMNPQRTUVWXY',
    14: 'CEFGHJKLMNOPQSVXZ', 15: 'ADEGMOPQRSTVXYZ', 22: 'ABEGHKMNPQRSVWX'
  };

  function nema(text, windows = 'MQQPZQSOEV') {
    const key = String(windows).trim().toUpperCase();
    if (!/^[A-Z]{10}$/.test(key)) throw new Error('Enter exactly ten A–Z window letters.');
    // Index from the right: red drive, D, drive 15, C, drive 14, B,
    // drive 13, A, drive 12, reflector. The electrical entry is static.
    const position = [0, ...[...key].reverse().map(c => CONTACTS.indexOf(c))];
    const wheels = { 0: entry, 2: wiring.D, 4: wiring.C, 6: wiring.B, 8: wiring.A, 10: wiring.U };
    const notch = (slot, wheel, offset) =>
      notches[wheel].includes(CONTACTS[mod(position[slot] + offset)]);
    const pass = (x, slot, inverse = false) => {
      const displacement = slot === 0 ? 0 : mod(position[slot] - 2);
      const contact = mod(x + displacement);
      return mod((inverse ? wheels[slot].indexOf(contact) : wheels[slot][contact]) - displacement);
    };
    const trace = [];
    let output = '';
    for (const letter of clean(text)) {
      // Sense all notches in the old state, then step backwards before
      // passing current. The two red-wheel tracks drive separate linkages.
      const slow = notch(1, 1, 17);
      const moving = [1, 5, 9];
      if (notch(1, 22, 16)) moving.push(2);
      if (slow) moving.push(3, 7);
      if (slow && notch(3, 15, 16)) moving.push(4);
      if (notch(5, 14, 16)) moving.push(6);
      if (slow && notch(7, 13, 16)) moving.push(8);
      if (notch(9, 12, 16)) moving.push(10);
      moving.forEach(slot => { position[slot] = mod(position[slot] - 1); });
      let x = pass(CONTACTS.indexOf(letter), 0, true);
      [2, 4, 6, 8, 10].forEach(slot => { x = pass(x, slot); });
      [8, 6, 4, 2].forEach(slot => { x = pass(x, slot, true); });
      const result = CONTACTS[pass(x, 0)];
      output += result;
      if (trace.length < 12) trace.push({ input: letter, output: result,
        windows: position.slice(1).reverse().map(p => CONTACTS[p]).join('') });
    }
    return { output, trace, windows: position.slice(1).reverse().map(p => CONTACTS[p]).join('') };
  }

  function rotate(index, size) {
    const row = Math.floor(index / size), col = index % size;
    return col * size + size - 1 - row;
  }

  function grilleOrder(size, holes) {
    if (![4, 6, 8].includes(size)) throw new Error('Choose a 4×4, 6×6, or 8×8 grille.');
    if (!Array.isArray(holes) || holes.length !== size * size / 4 ||
      holes.some(h => !Number.isInteger(h) || h < 0 || h >= size * size)) {
      throw new Error('Select one hole from each rotation orbit.');
    }
    const orientations = [];
    let current = [...holes];
    for (let turn = 0; turn < 4; turn++) {
      orientations.push([...current].sort((a, b) => a - b));
      current = current.map(h => rotate(h, size));
    }
    const order = orientations.flat();
    if (new Set(order).size !== size * size) throw new Error('Rotated holes overlap; every cell must be visited once.');
    return { order, orientations };
  }

  function turningGrille(text, size, holes, decrypt = false) {
    const { order, orientations } = grilleOrder(size, holes);
    const capacity = size * size;
    let input = clean(text);
    const padding = decrypt ? 0 : (capacity - input.length % capacity) % capacity;
    if (decrypt && input.length % capacity) throw new Error(`Ciphertext must contain complete ${capacity}-letter blocks.`);
    input += 'X'.repeat(padding);
    const blocks = [];
    let output = '';
    for (let start = 0; start < input.length; start += capacity) {
      const chunk = input.slice(start, start + capacity);
      const grid = decrypt ? [...chunk] : Array(capacity);
      if (decrypt) output += order.map(i => grid[i]).join('');
      else { order.forEach((cell, i) => { grid[cell] = chunk[i]; }); output += grid.join(''); }
      blocks.push(grid);
    }
    return { output, blocks, padding, orientations };
  }

  function myszkowski(text, keyword, decrypt = false) {
    const key = clean(keyword);
    if (key.length < 2 || key.length > 24) throw new Error('Use a keyword of 2–24 letters.');
    const input = clean(text), width = key.length;
    const groups = [...new Set(key)].sort();
    const ranks = [...key].map(c => groups.indexOf(c) + 1);
    const order = [];
    for (const letter of groups) {
      const cols = [...key].flatMap((c, i) => c === letter ? [i] : []);
      // One column: downwards. Tied columns: across each row before the
      // next row. Missing cells in the last row are skipped, never padded.
      for (let row = 0; row * width < input.length; row++) {
        for (const col of cols) if (row * width + col < input.length) order.push(row * width + col);
      }
    }
    const cells = decrypt ? Array(input.length) : [...input];
    if (decrypt) order.forEach((cell, i) => { cells[cell] = input[i]; });
    const output = decrypt ? cells.join('') : order.map(cell => input[cell]).join('');
    return { output, cells, key, ranks, order };
  }

  const api = { clean, nema, rotate, grilleOrder, turningGrille, myszkowski };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HistoricalCiphers = api;
})(typeof window === 'undefined' ? globalThis : window);
