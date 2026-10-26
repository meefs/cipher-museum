#!/usr/bin/env node
'use strict';
// Public claims must agree across prose, fact boxes and metadata.
// The mutation checks demonstrate that restoring an old error is rejected.
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
function visible(html) {
  const dom = new JSDOM(html), d = dom.window.document;
  d.querySelectorAll('script,style').forEach(e => e.remove());
  const s = [d.body.textContent, ...Array.from(d.querySelectorAll('meta[content]'), e => e.content)].join(' ').replace(/\s+/g, ' ');
  dom.window.close();
  return s;
}
const checks = [
  ['timeline.html', s => {
    assert.match(s, /Undated Origins and Teaching Models/);
    assert.match(s, /1623 full description/);
    assert.match(s, /selected Rijndael in October 2000/);
    assert.doesNotMatch(s, /earliest surviving instance of a deliberate substitution cipher|Swedish FRA in summer 1940|called le chiffre indéchiffrable for 300 years/);
  }, 'Broken by Arne Beurling and the Swedish FRA in summer 1940.'],
  ['ciphers/red-army-faction.html', s => {
    assert.match(s, /adds letters modulo 26/);
    assert.match(s, /not a decimal field-pad reconstruction/);
    assert.doesNotMatch(s, /KGB-supplied cryptographic material used|Soviet standard field format|book-cipher model/);
  }, 'One-Time Pad (Soviet standard field format)'],
  ['ciphers/stager.html', s => {
    assert.match(s, /transposes individual Latin letters/);
    assert.match(s, /not a transcription of a dated dispatch/);
    assert.doesNotMatch(s, /protected every sensitive|Unbreakable during the Civil War|precursors to modern public-key infrastructure/);
  }, 'The cipher protected every sensitive Union telegraph.'],
  ['ciphers/sigsaly.html', s => {
    assert.match(s, /does not process speech/);
    assert.match(s, /public deterministic sequence/);
    assert.doesNotMatch(s, /Spoken message \(SIGSALY digitized|Try encoding a message as this cipher does/);
  }, 'Try encoding a message as this cipher does.'],
  ['ciphers/des.html', s => {
    assert.match(s, /In 1994, IBM designer Don Coppersmith/);
    assert.doesNotMatch(s, /until 1991, when Biham and Shamir showed the NSA's S-boxes/);
  }, "until 1991, when Biham and Shamir showed the NSA's S-boxes"],
  ['ciphers/culper-ring.html', s => {
    assert.match(s, /not a manuscript facsimile/);
    assert.match(s, /998\/999 markers are not transcribed/);
    assert.doesNotMatch(s, /the same trick Tallmadge would have used|749 of its 763 entries/);
  }, '749 of its 763 entries are legible in the text layer.'],
  ['ciphers/nomenclator.html', s => {
    assert.match(s, /Lavinde’s 1379 collection/);
    assert.doesNotMatch(s, /earliest surviving nomenclator dates to .*1401|Any easy-to-break component .*opens the rest/);
  }, 'The earliest surviving nomenclator dates to the Mantua chancery in 1401.'],
  ['ciphers/joan-clarke.html', s => {
    assert.match(s, /MBE 1946/);
    assert.doesNotMatch(s, /MBE 1947|Developed Banburismus|continuous Naval Enigma breaks/);
  }, 'MBE 1947'],
  ['ciphers/gchq-trio.html', s => {
    assert.match(s, /Companion of the Order of the Bath \(CB\) in 2008/);
    assert.doesNotMatch(s, /CMG 2008|St Michael and St George|No one knew for 27 years/);
  }, 'Clifford Cocks: CMG 2008'],
  ['ciphers/bill-tutte.html', s => {
    assert.match(s, /keystream first recovered by John Tiltman/);
    assert.doesNotMatch(s, /two identical messages alone|near-identical pair of ciphertexts|relay-based systems/);
  }, 'He deduced the machine from two identical messages alone.'],
  ['ciphers/station-hypo.html', s => {
    assert.match(s, /not a decrypted Japanese naval attack plan/);
    assert.doesNotMatch(s, /attack .*came through a diplomatic channel|carriers Japan could not replace/);
  }, 'The Pearl Harbor attack came through a diplomatic channel.'],
  ['ciphers/chinese-telegraph.html', s => {
    assert.match(s, /digit by digit modulo 10, without carries/);
    assert.match(s, /modulo 10,000, with carries/);
    assert.match(s, /invented A–Z table/);
    assert.doesNotMatch(s, /mainland Chinese passports, and Taiwanese name registrations all carry|precisely the technique Rochefort/);
  }, 'Hong Kong identity cards, mainland Chinese passports, and Taiwanese name registrations all carry CCC numbers.'],
  ['ciphers/fractionated-morse.html', s => {
    assert.match(s, /26 of the 27 possible triples/);
    assert.match(s, /removing spaces and punctuation/);
    assert.doesNotMatch(s, /~1880s/);
  }, 'Invented ~1880s.'],
  ['ciphers/one-time-pad.html', s => {
    assert.match(s, /no random-source provenance claimed/);
    assert.match(s, /ciphertext does not change the prior probabilities/i);
    assert.doesNotMatch(s, /from true random source|Violate any condition → security collapses/);
  }, 'This fixed example comes from true random source — dice, radiation, etc.'],
  ['ciphers/vernam.html', s => {
    assert.match(s, /pseudorandom generator instead supports computational security/);
    assert.match(s, /decimal additive pages/);
    assert.doesNotMatch(s, /non-random\s*→ Vigenère-equivalent/);
  }, 'Repeating or non-random → Vigenère-equivalent (breakable)'],
  ['ciphers/cardano-grille.html', s => {
    // Independent combinatorial calculation pins the actual seven-hole example.
    let c = 1; for (let i = 1; i <= 7; i++) c = c * (26 - i) / i;
    assert.equal(c, 480700);
    assert.match(s, /seven holes/);
    assert.match(s, /C\(25,7\) = 480,700/);
    assert.doesNotMatch(s, /every past and future message becomes readable/);
  }, 'Once captured, every past and future message becomes readable.'],
  ['ciphers/vic.html', s => {
    assert.match(s, /not interoperable with historical VIC traffic/);
    assert.match(s, /two ordinary columnar transpositions/);
    assert.doesNotMatch(s, /resisted all NSA attacks|most complex and secure pencil-and-paper cipher/);
  }, 'The cipher resisted all NSA attacks.']
];
for (const [file, check, oldError] of checks) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  check(visible(html));
  const regressed = html.replace('</body>', `<p>${oldError}</p></body>`);
  assert.throws(() => check(visible(regressed)), assert.AssertionError, `${file}: old error escaped the guard`);
}
{
  function timelineStructure(html) {
    const dom = new JSDOM(html), d = dom.window.document;
    try {
      for (const link of d.querySelectorAll('.tl-legend-item')) {
        const era = link.dataset.filter;
        assert.ok(d.getElementById('era-' + era), 'Every era navigation target exists');
        const stated = Number(link.querySelector('.tl-legend-count').textContent.replace(/\D/g, ''));
        assert.equal(stated, d.querySelectorAll(`.tl-event[data-era="${era}"]`).length, era + ' count');
      }
      for (const slug of ['rail-fence', 'running-key', 'columnar', 'straddling-checkerboard', 'fractionated-morse', 'two-square', 'amharic-ge-ez-ciphers']) {
        const card = d.querySelector(`.tl-card[data-href="ciphers/${slug}.html"]`);
        assert.equal(card.closest('.tl-event').dataset.era, 'undated', slug + ' must not invent a dated origin');
      }
    } finally { dom.window.close(); }
  }
  const html = fs.readFileSync(path.join(root, 'timeline.html'), 'utf8');
  timelineStructure(html);
  assert.throws(() => timelineStructure(html.replace(/(class="tl-legend-count">)\(\d+\)/, '$1(999)')), assert.AssertionError);
  assert.throws(() => timelineStructure(html.replace('data-era="undated"', 'data-era="ancient"')), assert.AssertionError);
}
// Check the rendered arithmetic itself: no speech input or randomness is involved.
{
  const html = fs.readFileSync(path.join(root, 'ciphers/sigsaly.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously' });
  const input = 'ATTACK AT DAWN CONFIRM';
  dom.window.document.getElementById('input').value = input;
  dom.window.encode();
  const residues = Array.from(input.slice(0, 20), (ch, i) => (ch.charCodeAt(0) % 6 + (i * 37 + 19) % 6) % 6);
  const out = dom.window.document.getElementById('output').textContent;
  assert.ok(out.includes(`[${residues.join(' ')}]`));
  assert.match(out, /not speech encryption or a one-time pad/);
  assert.equal(dom.window.sigDemo(input), dom.window.sigDemo(input));
  dom.window.close();
}
console.log(`page-audit-claims: ${checks.length} page checks and ${checks.length} deliberately regressed examples passed`);
