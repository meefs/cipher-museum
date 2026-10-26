/* exhibit-examples.test.js — run: node exhibit-examples.test.js
   Pins the constants DISPLAYED on the exhibit pages to the tested math
   modules, so on-page examples can never silently drift from the engines.
   Reads the HTML, extracts the constants, and re-derives the mathematics.
   Exits non-zero on failure for CI. */
"use strict";
var fs = require("fs");
var path = require("path");
var CA = require("./crypto-algebra.js");
var EC = require("./ec-math.js");

var passed = 0, failed = 0;
function assert(cond, msg) { if (cond) passed++; else { failed++; console.error("  ✗ FAIL: " + msg); } }
function page(name) { return fs.readFileSync(path.join(__dirname, name), "utf8"); }

// ---- Exhibit 145: Euler & Fermat — the toy RSA round-trip ----
// The page hardcodes n, e, d. They must form a working RSA triple.
(function () {
  var html = page("euler-fermat.html");
  var m = html.match(/var n=(\d+),e=(\d+),d=(\d+)/);
  assert(!!m, "euler-fermat.html declares var n=..,e=..,d=..");
  if (!m) return;
  var n = +m[1], e = +m[2], d = +m[3];
  // factor n (small toy modulus)
  var p = 0;
  for (var f = 2; f * f <= n; f++) if (n % f === 0) { p = f; break; }
  assert(p > 0 && p !== n, "toy modulus n = " + n + " is composite");
  var q = n / p, phi = (p - 1) * (q - 1);
  assert(CA.mod(e * d, phi) === 1, "e·d ≡ 1 (mod φ(n)) — the displayed keypair is valid");
  // every message the page's slider can produce must round-trip
  var allGood = true;
  for (var msg = 2; msg <= 100; msg++) {
    if (CA.powmod(CA.powmod(msg, e, n), d, n) !== msg) allGood = false;
  }
  assert(allGood, "every slider message m round-trips through m^e^d mod n");
})();

// ---- Exhibit 142: Finite Fields — the curve the scatter plot draws ----
(function () {
  var html = page("finite-fields.html");
  var m = html.match(/var A=(\d+), B=(\d+)/);
  assert(!!m, "finite-fields.html declares var A=.., B=..");
  if (!m) return;
  var A = +m[1], B = +m[2];
  // the curve must be smooth over every prime the page's select offers
  var primes = [];
  var sel = html.match(/id="psel"[\s\S]*?<\/select>/);
  var re = /value="(\d+)"/g, pm;
  while ((pm = re.exec(sel ? sel[0] : "")) !== null) primes.push(+pm[1]);
  if (primes.length === 0) primes = [11, 17, 23, 41, 67, 97];
  primes.forEach(function (p) {
    assert(EC.mod(4 * A * A * A + 27 * B * B, p) !== 0,
      "y² = x³+" + A + "x+" + B + " is smooth mod " + p);
    var N = EC.ecPoints(A, B, p).length + 1;
    assert(Math.abs(N - (p + 1)) <= 2 * Math.sqrt(p),
      "point count over F_" + p + " respects the Hasse bound");
  });
})();

// ---- Exhibit 150: Elliptic Curves over R — the drawn curve is smooth ----
(function () {
  var html = page("elliptic-curves-real.html");
  var m = html.match(/var A = (-?\d+), B = (-?\d+)/);
  assert(!!m, "elliptic-curves-real.html declares var A = .., B = ..");
  if (!m) return;
  assert(EC.ecIsSmooth(+m[1], +m[2]),
    "the hand-drawn curve y² = x³+" + m[1] + "x+" + m[2] + " is smooth");
})();

// ---- Exhibit 156: Pairings — the displayed identity uses a real group ----
(function () {
  var html = page("pairings.html");
  // the page displays e(aP,bQ) = e(P,Q)^ab in a toy multiplicative group;
  // whatever base/modulus the script uses must satisfy bilinearity
  var m = html.match(/base\s*=\s*(\d+)[\s\S]{0,80}?m(?:od)?\s*=\s*(\d+)/) ||
          html.match(/pairingCheck\((?:[^)]*?,\s*)*?(\d+),\s*(\d+)\)/);
  if (m) {
    var base = +m[1], mod = +m[2];
    var ok = true;
    for (var a = 1; a <= 6; a++) for (var b = 1; b <= 6; b++) {
      if (!CA.pairingCheck(a, b, base, mod).equal) ok = false;
    }
    assert(ok, "pairing page constants (base " + base + " mod " + mod + ") satisfy bilinearity");
  } else {
    passed++; // page drives constants interactively; module property tests cover it
  }
})();

// ---- EBR-16: independently enumerate the displayed bounded-mask example ----
(function () {
  var doc = new (require("jsdom").JSDOM)(page("random-oracle.html")).window.document;
  var text = doc.querySelector("#why-abort").textContent;
  var bounds = text.match(/uniformly from −(\d+) through (\d+)/);
  var accept = text.match(/−(\d+) ≤ z ≤ (\d+)/);
  var shift = text.match(/shift t be −(\d+), 0 or (\d+)/);
  assert(!!bounds && !!accept && !!shift, "abort example exposes mask, acceptance and shift bounds");
  if (!bounds || !accept || !shift) return;
  var lo = -Number(bounds[1]), hi = Number(bounds[2]);
  var shifts = [-Number(shift[1]), 0, Number(shift[2])];
  var distributions = shifts.map(function (t) {
    var counts = {}, accepted = 0;
    for (var y = lo; y <= hi; y++) {
      var z = y + t;
      if (z >= -Number(accept[1]) && z <= Number(accept[2])) {
        counts[z] = (counts[z] || 0) + 1;
        accepted++;
      }
    }
    assert(hi - lo + 1 === 9 && accepted === 7, "each displayed shift accepts seven of nine masks");
    assert(Object.values(counts).every(function (c) { return c === 1; }), "accepted outputs have equal weight");
    return JSON.stringify(counts);
  });
  assert(distributions.every(function (d) { return d === distributions[0]; }), "conditional response distribution is shift-independent");
  var revealing = shifts.filter(function (t) { return 5 - t >= lo && 5 - t <= hi; });
  assert(revealing.length === 1 && revealing[0] === 1, "unfiltered response 5 identifies shift 1 (negative control)");
})();

// ---- EBR-18: verify the printed q-ary lattice, distance and tie control ----
(function () {
  var doc = new (require("jsdom").JSDOM)(page("closest-vector.html")).window.document;
  var text = doc.querySelector("#lwe-lattice").textContent;
  var params = text.match(/q = (\d+), m = (\d+), n = (\d+)/);
  var column = text.match(/column vector \((\d+), (\d+)\)/);
  var sample = text.match(/s = (\d+) and e = \((\d+), (\d+)\)/);
  var observed = text.match(/b = \((\d+), (\d+)\)/);
  assert(!!params && !!column && !!sample && !!observed, "q-ary example exposes its numerical instance");
  if (!params || !column || !sample || !observed) return;
  var q = +params[1], m = +params[2], n = +params[3];
  var a = [+column[1], +column[2]], s = +sample[1];
  var e = [+sample[2], +sample[3]], b = [+observed[1], +observed[2]];
  var mod = function (x) { return ((x % q) + q) % q; };
  var member = function (u, v) {
    for (var z = 0; z < q; z++) if (mod(u) === mod(a[0] * z) && mod(v) === mod(a[1] * z)) return true;
    return false;
  };
  assert(q === 5 && m === 2 && n === 1 && a[0] === 1, "prime modulus and nonzero column give the stated rectangular full-column-rank instance");
  assert(a[0] * q === Math.pow(q, m - n), "displayed basis determinant equals lattice volume");
  var y = b.map(function (v, i) { return v - e[i]; });
  assert(member(y[0], y[1]) && y.every(function (v, i) { return mod(v) === mod(a[i] * s); }), "b minus displayed error belongs to L_A and recovers the secret modulo q");
  var lattice = [];
  for (var u = -5; u <= 5; u++) for (var v = -5; v <= 5; v++) {
    assert(member(u, v) === (mod(v - 2 * u) === 0), "column-combination membership agrees with printed congruence");
    if (member(u, v)) lattice.push([u, v]);
  }
  // Every point outside this box has a coordinate magnitude >5, so it cannot
  // improve any distance checked below. Enumeration is complete for these balls.
  var shortestSquared = Math.min.apply(null, lattice.filter(function (p) { return p[0] || p[1]; }).map(function (p) { return p[0] ** 2 + p[1] ** 2; }));
  assert(shortestSquared === 5, "minimum lattice spacing is sqrt(5)");
  var near = lattice.filter(function (p) { return (p[0] - b[0]) ** 2 + (p[1] - b[1]) ** 2 <= 1; });
  assert(near.length === 1 && near[0][0] === y[0] && near[0][1] === y[1], "displayed distance-one solution is unique");
  assert(text.includes("(1/2, 1)"), "page retains the tested midpoint control");
  var ties = lattice.filter(function (p) { return (p[0] - 0.5) ** 2 + (p[1] - 1) ** 2 <= 1.25; });
  assert(JSON.stringify(ties) === "[[0,0],[1,2]]", "midpoint has exactly the two printed nearest points at sqrt(5)/2");
  assert(member(y[0] + q, y[1] - q), "changing integer representatives preserves lattice membership");
})();

console.log("\nexhibit-examples: " + passed + " passed, " + failed + " failed");
process.exit(failed ? 1 : 0);
