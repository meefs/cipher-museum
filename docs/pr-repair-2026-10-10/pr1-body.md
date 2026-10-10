Repairs the modern-security label regression and centralizes trust classifications and definitions across all 160 original exhibits, halls, map, search, comparison and artifact metadata. The eight classical ciphers retain Broken, context badges are omitted, and the secure allowlist remains exactly nine approved identities with correct-use qualifications.

This branch now also repairs the shared findings from the October 10 independent review:

- **Pre-existing artifact-card race**, isolated in `eca039fba786caf4c5258811430191e0facd61af`: the generated metadata bundle announces readiness, and rendering retries when metadata or markup arrives. Both loading orders, delayed markup and repeated delivery are tested; each card appears exactly once. The defect also exists on main and predates both PRs.
- **Production scaling guard verification**, `6055904cbc8f1b0066b7ac57054924359a8f8f63`: the guard retains the 10× limit and measures all 85 registered engines. The canary runs legitimate Caesar/OTP controls through the production guard and requires it to reject real quadratic work. Deliberately changing the production bound to 20× now fails because the guard accepts that quadratic work; this is not an independent copy of the threshold. The console displays the actual configured bound.
- **Cold-offline dependency closure**, `c29a8668e2c3dcb4e6e5b46bc61c0f95e0edca72`: artifact metadata, generic demo loader, lightbox and all museum stylesheet font dependencies are precached. Their bytes participate in cache freshness. Metadata invalidation, binary preservation, LF/CRLF equivalence and dependency presence are tested.

The generated service-worker version is **`cipher-museum-db092287`**. Text hashing still canonicalizes CRLF only for text assets and preserves binary bytes; there is no repository-wide renormalization or hardcoded expected hash. Shared Historical Only wording remains **“No longer in use, or never confirmed broken/deciphered.”** Historical notes remain separate from classifications.

Repair verification on exact final head **`c29a8668e2c3dcb4e6e5b46bc61c0f95e0edca72`**, using **Node 22.23.3** on macOS ARM64:

- `npm test`: all **29 top-level suites** passed, including every suite after timing; **85 registered engines measured, 0 skips, 0 production scaling violations**. The real quadratic negative control is rejected by the production guard; positive controls pass.
- Hosted CI **test** job passed on this head (run 38050397591); the separate corpus job is skipped by its main-push condition, while local corpus schema/replay checks passed.
- Corpus replay: **100,026 records; 99,500 passing, 526 documented-deviation records / 1,051 events across all 34 documented categories, 0 unexplained**. Schema validation: 100,026 valid / 0 invalid. Accounting matches the prior review exactly.
- `npm run lint:html`: **197 files, 0 errors**. Working-tree and complete PR-range `git diff --check`: clean.
- Trust/search/artifact/minified/SW freshness passed before regeneration. Trust, search, artifacts, counts and minification ran twice with **no tracked-byte changes**.
- Chrome desktop/mobile viewport checks reproduce both loader orders, canonical artifact trust and omitted context badges, neutral search, shared legend wording and comparison filters. Visited existing exhibits load offline with exactly one card and no failed dependency requests.
- Deliberate restoration of the old renderer, removal of the readiness event, weakening to 20×, and removal of offline metadata are rejected by the intended assertions. Mutations were restored in a disposable worktree.

This is **repair verification by the author of these fixes, not subsequent independent approval**. The original FAIL report/evidence are preserved unchanged locally; the repair follow-up and logs are saved under `docs/pr-repair-2026-10-10.md` and `docs/pr-repair-2026-10-10/`. Remaining limits: one Chrome version with desktop/mobile viewports, finite timing inputs and representative keys, and the existing visit-first offline policy for older exhibit pages. The older unvisited-page fallback's relative-asset limitation is outside these five repairs. No merge, deployment or base change was performed. Keep PR #2 stacked on this branch and both PRs open/unmerged.

The secure allowlist is exactly these nine identities; no additions:

| # | Entry | Correct-use justification |
| --- | --- | --- |
| 36 | One-Time Pad | Perfect secrecy requires a uniformly random, secret, message-length pad used exactly once. |
| 37 | Vernam | Secure only under those OTP conditions; XOR alone, repeating tape, or pad reuse is insufficient. |
| 60 | Diffie–Hellman | Vetted groups, strong secret exponents, and authentication are required for secure key agreement. |
| 61 | RSA | Adequate key sizes, secure padding, and correct key handling are required. |
| 62 | AES | Secure modes, nonce discipline, and protected keys are required. |
| 63 | SHA-256 | Resists practical collision and preimage attacks; it is a hash, with secure use depending on the application. |
| 158 | ECDSA | Vetted curves, protected keys, and correctly generated, never-reused nonces are required. |
| 159 | Shamir’s Secret Sharing | Fewer than the threshold shares reveal no secret when coefficients are uniformly random in the correct field. |
| 160 | Zero-Knowledge Proofs | The selected protocol’s assumptions, setup, parameters, and implementation must hold. |

All changed roster/header classifications are below, plus Voynich/Dorabella metadata corrections. Old labels show **map / header** when they differ. **None** means the badge is omitted. Uniform definition/tooltips and removal of obsolete legacy badges also apply to other exhibits whose canonical classification stays unchanged.

| # | Entry | Old label | New label | Reason |
| --- | --- | --- | --- | --- |
| 1 | Scytale | Historical Only | Broken | Classical transposition has known attacks; restore Broken under the keep-Broken rule. |
| 2 | Caesar Cipher | Historical Only | Broken | The small shift space is exhaustively searchable; restore Broken. |
| 3 | Polybius Square | Historical Only | Broken | Coordinate substitution has known attacks; restore Broken. |
| 31 | Navajo Code Talkers | Secure (Modern) / Historical Only | Historical Only | Unbroken wartime code, not a modern security system. |
| 32 | Pigpen Cipher | Historical Only | Broken | The cipher is a symbolic substitution; retain Broken, separate from the cultural Freemason exhibit. |
| 33 | Bacon's Cipher | Historical Only | Broken | The public binary alphabet can be decoded; restore Broken. |
| 34 | Tap Code | Historical Only | Broken | The public coordinate code can be decoded; restore Broken. |
| 38 | The Great Cipher (Rossignols) | Historical Only | Broken | Deciphered by Étienne Bazeries in 1893. |
| 40 | Voynich Manuscript | Historical Only | Historical Only | Search now uses the existing Historical Only label when legacy badge metadata is empty. |
| 41 | Atbash | Historical Only | Broken | A fixed reversed alphabet gives no confidentiality; restore Broken. |
| 42 | ROT13 | Historical Only | Broken | The public fixed shift gives no confidentiality; restore Broken. |
| 46 | Chaocipher | Historical Only | Broken | Published known-plaintext and in-depth ciphertext-only attacks recover keys. |
| 47 | M-209 (Hagelin C-38) | Historical Only | Broken | Known-plaintext and ciphertext-only attacks break the pin-and-lug cipher. |
| 56 | Dorabella Cipher | Historical Only | Historical Only | Replace the stale Secure shield with the Historical Only scroll icon. |
| 57 | SIGABA (ECM Mark II) | Secure (Modern) / Historical Only | Historical Only | Obsolete rotor machine; unbroken service history is not modern security. |
| 58 | Typex | Secure (Modern) / Historical Only | Historical Only | Obsolete rotor machine; unbroken service history is not modern security. |
| 64 | Egyptian Substitution | Broken | None | Ornamental hieroglyph variants; encryption intent is disputed. |
| 65 | Histiaeus Tattoo | Broken | Historical Only | Steganographic concealment belongs to Historical Only under the map definition. |
| 66 | Aeneas Tacticus | Broken | None | Military signaling treatise, rather than a confidentiality cipher. |
| 71 | Rosetta Stone | Broken | None | Multilingual inscription and linguistic decipherment, not encryption. |
| 78 | Cardano Grille | Broken | Historical Only | Steganographic concealment belongs to Historical Only under the map definition. |
| 83 | Diana Cryptosystem | Broken / Historical Only | Historical Only | Retired operational OTP implementation; modern label is reserved for the explicit allowlist. |
| 85 | Red Army Faction OTP | Broken / Historical Only | Historical Only | Historical OTP use; not a broken cipher or an allowlisted modern system. |
| 86 | Null Cipher | Broken | Historical Only | Steganographic concealment belongs to Historical Only under the map definition. |
| 87 | Chinese Telegraph Code | Broken | None | Public character encoding, not a confidentiality cipher. |
| 88 | Morse Code | Historical Only | None | Public signaling alphabet, not a confidentiality cipher. |
| 93 | Fialka M-125 | Secure (Modern) / Historical Only | Historical Only | Obsolete rotor machine; unbroken service history is not modern security. |
| 94 | KL-7 | Secure (Modern) / Historical Only | Historical Only | Obsolete rotor machine; unbroken service history is not modern security. |
| 100 | Freemason Pigpen | Historical Only | None | Cultural, fictional, or puzzle-community exhibit, not a deployed cipher. |
| 101 | Bach BACH Motif | Broken | None | Cultural, fictional, or puzzle-community exhibit, not a deployed cipher. |
| 102 | Sator Word Square | Broken | None | Cultural, fictional, or puzzle-community exhibit, not a deployed cipher. |
| 103 | Shugborough Inscription | Broken / Historical Only | Historical Only | No confirmed decipherment; the roster’s Broken label contradicts the exhibit. |
| 104 | D'Agapeyeff Cipher | Broken / Historical Only | Historical Only | No confirmed decipherment; the roster’s Broken label contradicts the exhibit. |
| 105 | Somerton Man | Broken / Historical Only | Historical Only | No confirmed decipherment; the roster’s Broken label contradicts the exhibit. |
| 106 | McCormick Cipher | Broken / Historical Only | Historical Only | No confirmed decipherment; the roster’s Broken label contradicts the exhibit. |
| 107 | Phaistos Disc | Broken / Historical Only | None | Undeciphered writing system, not an established cipher. |
| 109 | SIGSALY | Broken / Historical Only | Historical Only | Obsolete wartime voice encryption; not a broken cipher. |
| 110 | Microdot Steganography | Broken | Historical Only | Steganographic concealment belongs to Historical Only under the map definition. |
| 111 | Bletchley Park | Broken | None | Codebreaking site, not a cipher. |
| 112 | Cabinet Noir | Broken | None | Intelligence institution, not a cipher. |
| 113 | Kerckhoffs's Principle | Broken | None | Security principle, not a cipher. |
| 114 | Station HYPO | Broken | None | Intelligence station, not a cipher. |
| 115 | Joseph Rochefort | Broken | None | Biography, not a cipher; Hall X’s deciphered Mary Stuart letters retain Broken. |
| 116 | Arne Beurling | Broken | None | Biography, not a cipher; Hall X’s deciphered Mary Stuart letters retain Broken. |
| 117 | Dilly Knox | Broken | None | Biography, not a cipher; Hall X’s deciphered Mary Stuart letters retain Broken. |
| 118 | Herbert Yardley | Broken | None | Biography, not a cipher; Hall X’s deciphered Mary Stuart letters retain Broken. |
| 119 | Mavis Batey | Broken / Historical Only | None | Biography, not a cipher; Hall X’s deciphered Mary Stuart letters retain Broken. |
| 120 | GCHQ Trio | Broken | None | Biography, not a cipher; Hall X’s deciphered Mary Stuart letters retain Broken. |
| 121 | David Kahn | Broken / Historical Only | None | Biography, not a cipher; Hall X’s deciphered Mary Stuart letters retain Broken. |
| 122 | Elonka Dunin | Broken | None | Biography, not a cipher; Hall X’s deciphered Mary Stuart letters retain Broken. |
| 123 | George Lasry | Broken / Historical Only | None | Biography, not a cipher; Hall X’s deciphered Mary Stuart letters retain Broken. |
| 124 | Field Hollers | Broken | None | Cultural, fictional, or puzzle-community exhibit, not a deployed cipher. |
| 125 | Gold-Bug (Poe) | Broken | None | Cultural, fictional, or puzzle-community exhibit, not a deployed cipher. |
| 126 | Dancing Men (Conan Doyle) | Broken | None | Cultural, fictional, or puzzle-community exhibit, not a deployed cipher. |
| 127 | Da Vinci Code | Broken | None | Cultural, fictional, or puzzle-community exhibit, not a deployed cipher. |
| 128 | National Treasure | Broken | None | Cultural, fictional, or puzzle-community exhibit, not a deployed cipher. |
| 129 | Gravity Falls Ciphers | Broken | None | Cultural, fictional, or puzzle-community exhibit, not a deployed cipher. |
| 130 | Cicada 3301 | Broken | None | Cultural, fictional, or puzzle-community exhibit, not a deployed cipher. |
| 131 | MIT Mystery Hunt | Broken | None | Cultural, fictional, or puzzle-community exhibit, not a deployed cipher. |
| 132 | Krypto ARG | Broken | None | Cultural, fictional, or puzzle-community exhibit, not a deployed cipher. |
| 133 | Agnes Meyer Driscoll | Broken | None | Biography, not a cipher; Hall X’s deciphered Mary Stuart letters retain Broken. |
| 134 | Bill Tutte | Broken | None | Biography, not a cipher; Hall X’s deciphered Mary Stuart letters retain Broken. |
| 135 | Elizebeth Smith Friedman | Broken | None | Biography, not a cipher; Hall X’s deciphered Mary Stuart letters retain Broken. |
| 136 | Joan Clarke | Broken | None | Biography, not a cipher; Hall X’s deciphered Mary Stuart letters retain Broken. |
| 137 | Leo Marks | Broken / Historical Only | None | Biography, not a cipher; Hall X’s deciphered Mary Stuart letters retain Broken. |
| 140 | Bible Code (ELS) | Broken | None | Statistical and cultural exhibit about refuted ELS claims. |
