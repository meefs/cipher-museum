# Editorial accuracy and historical expansion — 10 October 2026

Baseline: `5a519c8c11db9c7b0810455491d019b9f9883f7d`. Branch:
`feat/rs44-double-playfair-amsco`. Existing checkout was clean; other worktrees
were preserved. PRs #1/#2 were already merged; this work will be a new PR.

## Editorial pass (completed before exhibit implementation)

The exact HTML wording and replacements are also preserved in
[editorial-accuracy-changes.json](editorial-accuracy-changes.json). Locations in
this table refer to the inspected baseline; generated additions may move lines.

| Item | File:line | Before | After / disposition | Verification |
| --- | --- | --- | --- | --- |
| 1 | `halls/modern-crypto.html:61` (baseline) | Every cipher in the previous ten halls eventually fell. The five classical primitives in this hall &mdash; DES, Diffie-Hellman, RSA, AES, SHA-256 &mdash; were designed in the public eye, scrutinised for decades, and now anchor essentially every secure system on Earth. They are not the <em>only</em> modern primitives &mdash; ChaCha20, ECDH (X25519), Ed25519, BLAKE2/3, and the post-quantum NIST finalists all sit alongside them &mdash; but they are the canonical foundation from which the rest of the field is built. Only one of them, AES, is technically a cipher in the classical sense. The other four solve problems that classical cryptography could not: distributing keys without meeting in person, signing documents at a distance, and verifying integrity without a shared secret. | The earlier halls distinguish cryptanalytic breaks, operational misuse, obsolescence, and unresolved systems; a correctly used one-time pad remains unbreakable. The five primitives here serve different purposes. DES and AES are symmetric block ciphers; DES is now unsafe because its 56-bit key is too small. RSA supports distinct public-key encryption and signature schemes, with appropriate encoding and padding such as OAEP and PSS. Diffie–Hellman is key agreement, and SHA-256 is a hash function. These building blocks explain encryption, shared-secret establishment, signatures, and integrity; none alone provides a complete secure system. | Focused claim guard; surrounding prose reread. |
| 2 | `modern.html:60` (baseline) | Every exhibit in this museum is a <strong>cipher</strong> — a reversible method for turning plaintext into ciphertext and back. Modern cryptography includes ciphers (AES, ChaCha20), but also key exchange protocols, digital signatures, and hash functions that are <em>not ciphers at all</em>. This page maps the journey from classical failure to modern practice. | This collection includes ciphers, people, historical and cultural context, mathematical foundations, hashes, signatures, and protocols. A cipher reversibly transforms plaintext into ciphertext with a key, but many exhibits explain other parts of cryptography. This page connects that broader history to modern practice. | Focused claim guard; surrounding prose reread. |
| 3 | `learn.html:76` (baseline) | Vigenère's repeating keyword became ChaCha20's continuous pseudorandom keystream — the same combine-with-keystream idea, with a key that never repeats. | Vigenère's repeating keyword and ChaCha20's pseudorandom keystream illustrate combining a message with a keystream. A ChaCha20 key can protect multiple messages, but nonces must not repeat under that key, and the block counter must not wrap. | Focused claim guard; surrounding prose reread. |
| 1 | `modern.html:167` (baseline) | Only the first category below — symmetric ciphers — contains actual <em>ciphers</em> (reversible plaintext↔ciphertext transformations). Key exchange, public-key cryptography, and hash functions are <strong>cryptographic primitives</strong>, not ciphers. They solve different problems: establishing shared secrets, proving identity, and verifying integrity. | Symmetric and public-key encryption schemes both reversibly transform plaintext into ciphertext. RSA encryption and RSA signatures are distinct schemes with different encoding and padding requirements. Diffie–Hellman establishes shared secrets; signatures authenticate messages; hash functions produce digests. These primitives solve different problems and must be combined with appropriate protocols. | Focused claim guard; surrounding prose reread. |
| 4 | `modern.html:179` (baseline) | Designed by Daniel Bernstein. 256-bit key, 64-bit nonce. XORs plaintext with a cryptographically random, never-repeating keystream. | Designed by Daniel Bernstein. Original ChaCha uses a 64-bit nonce and 64-bit block counter. IETF ChaCha20 (RFC 8439) uses a 256-bit key, 96-bit nonce, and 32-bit block counter. Both XOR plaintext with a deterministic pseudorandom keystream: never reuse a nonce under the same key, and never let the block counter wrap. <a href="https://cr.yp.to/chacha/chacha-20080128.pdf" target="_blank" rel="noopener noreferrer">Original specification</a>; <a href="https://www.rfc-editor.org/rfc/rfc8439.html#section-2.3" target="_blank" rel="noopener noreferrer">RFC 8439 §§2.3, 4</a> and <a href="https://www.rfc-editor.org/errata/rfc8439" target="_blank" rel="noopener noreferrer">errata</a>. | Focused claim guard; surrounding prose reread. |
| 5 | `timeline.html:384` (baseline) | — and finally identifies the prisoner known as the Man in the Iron Mask. | — and proposes General Vivien de Bulonde as the Man in the Iron Mask. That identification remains disputed; deciphering a letter did not settle the prisoner’s identity. | Focused claim guard; surrounding prose reread. |
| 5 | `ciphers/great-cipher.html:96` (baseline) | Among the messages he read was finally an answer to one of history's great mysteries: a 1691 letter naming a prisoner who would later become legend as <strong>"the Man in the Iron Mask."</strong> | A 1691 letter about General Vivien de Bulonde led Bazeries to propose an identity for the Man in the Iron Mask. His identification remains disputed: the decipherment and the historical inference are separate claims. | Focused claim guard; surrounding prose reread. |
| 5 | `ciphers/great-cipher.html:183` (baseline) | Most modern historians disagree — Bulonde was alive and free again by 1708 — but the discovery showed the world that the Great Cipher had finally fallen, and that its protected secrets had been historically significant ones. | The identification remains disputed, including the interpretation of the numbers supposedly denoting a mask. David Kahn revisited the evidence in <em>Cryptologia</em> 29(1), pp. 43–49 (2005), “The Man in the Iron Mask — Encore et Enfin, Cryptologically.” The letter is evidence of the cipher’s decipherment, not a confirmed solution to the prisoner’s identity. | Focused claim guard; surrounding prose reread. |
| 7 | `halls/unbreakable.html:66` (baseline) | Every cipher you've seen in this museum has been broken. Some in days. Some after centuries. One cipher exists that Claude Shannon proved mathematically unbreakable — yet we almost never use it, because its requirements are practically impossible to meet. This hall confronts that paradox and examines why classical cryptography collapsed entirely in WWII. | Many historical ciphers succumbed to cryptanalysis; others were exposed by operational mistakes, became obsolete, or remain unresolved. Claude Shannon proved perfect secrecy for a correctly used one-time pad: a secret, truly random, message-length key used once. Its demanding key-distribution requirements limit its use. This hall examines that guarantee and how pad reuse undermined it. | Focused claim guard; surrounding prose reread. |
| 7 | `modern.html:226` (baseline) | Every classical cipher failed because it relied on obscurity or physical key distribution. Modern cryptography replaced both with mathematical hardness and public-key mathematics — and expanded far beyond ciphers into protocols, signatures, and proofs. | Many historical systems failed through structural weaknesses, key reuse, or operational mistakes; others are obsolete or unresolved. A correctly used one-time pad retains perfect secrecy. Modern cryptography adds computational security and public-key methods, while still depending on sound key management, and extends into protocols, signatures, and proofs. | Focused claim guard; surrounding prose reread. |
| 7 | `learn.html:106` (baseline) | the tools that broke every classical cipher. | tools that break many classical ciphers given suitable ciphertext, rather than every historical system or a correctly used one-time pad. | Focused claim guard; surrounding prose reread. |
| 7 | `halls/polyalphabetic.html:237` (baseline) | Modern cryptography uses 128–256 bit keys that never repeat within a session, and key derivation functions ensure no two sessions share key material. | Modern systems can reuse a suitably strong key for multiple messages, but must respect each scheme’s nonce, counter, and usage limits. Key derivation can separate session keys; it does not automatically guarantee unique key material. | Focused claim guard; surrounding prose reread. |
| 7 | `halls/substitution.html:246` | Every monoalphabetic cipher is broken by counting symbol frequencies and matching them to known language distributions. | Frequency and word-pattern analysis require enough suitable ciphertext; short messages need not have a unique solution. | Focused claim guard. |
| 6 | `scripts/build-counts.js:34`; `museum-map.html:465` | Disk-derived “ciphers: 144”; “The Roster · 140 Ciphers + 3 Protocol Exhibits”; README: 84 engines, 113 demos | Extend existing identity source with collection/demo fields. 144 cipher/history + 17 Foundations + 3 protocol/construction = 164 exhibits. Registry: 85 engines; 132 interactive exhibits, including 114 main-collection exhibits. Owned totals generated, stable IDs retained. | Registration, canonical search ID, static freshness/idempotence checks; deliberate stale-count mutation rejected. |

## Sources checked

- NIST [FIPS 46-3](https://csrc.nist.gov/pubs/fips/46-3/final) and
  [FIPS 197](https://csrc.nist.gov/pubs/fips/197/final): DES/AES block ciphers.
- [RFC 8017 §§7–9](https://www.rfc-editor.org/rfc/rfc8017.html): distinct RSA
  encryption/signature schemes and their encodings.
- Bernstein, [ChaCha, a variant of Salsa20](https://cr.yp.to/chacha/chacha-20080128.pdf),
  28 January 2008, pp. 1 and 3, checked from downloaded original PDF;
  [RFC 8439 §§2.3 and 4](https://www.rfc-editor.org/rfc/rfc8439.html).
  Verified errata 5689, 5989, 6025, 6257 and 7880 were inspected. They correct
  pseudocode bounds/concatenation, arithmetic advice and a typo, and do not alter
  the nonce/counter dimensions stated here. No ChaCha engine/exhibit was added.
- Kahn, “The Man in the Iron Mask — Encore et Enfin, Cryptologically,”
  *Cryptologia* 29(1), 43–49 (2005), DOI
  [10.1080/0161-110591893753](https://doi.org/10.1080/0161-110591893753).
  Publisher full text is access-restricted; bibliographic/abstract evidence and
  the museum's existing explicit dispute section support qualified wording.
  No alternative identity is asserted as established.

## Editorial validation

Local macOS arm64, Node **22.23.3**. Working-tree editorial candidate based on the
baseline above; tests were not run against the old historical PR heads.

- `npm test`: **31/31 top-level suites passed**; the runner executes every suite
  after the timing guard. 85 engines measured; 10× limit unchanged. The legacy
  engine suite's two documented skips remain skips, not failures.
- `npm run lint:html`: **201 files, no errors**.
- Counts, trust and search generation checks, artifact regeneration, minified
  freshness, service-worker freshness and `git diff --check`: passed.
- [editorial-mutation-evidence.json](editorial-mutation-evidence.json): in a
  disposable worktree, a wrong original-ChaCha nonce/counter statement and a
  stale homepage count both failed their guards; restored afterward.

Archived release/audit totals remain historical. This pass does not change
cryptographic implementations or the nine-entry secure allowlist. Unrelated
observations retained for a future task: the Great Cipher's opening account of
its “delete previous letter” breakthrough merits its own source audit; existing
engine educational approximations and older README test-result examples are not
re-certified by this editorial pass.

## Independent editorial follow-up

The separate reviewer found three functioning controls omitted by the initial
interactive metadata: §144 PNT and §151 entropy sliders, and §140 Bible Code ELS
search. The final editorial count is **135 interactive exhibits**, including
**115 cipher/history exhibits**. This corrects the initial candidate reported
above; it does not rewrite the earlier test results. Focused tests now exercise
these three real controls and pin their registrations. The reviewer also found
universal-substitution wording duplicated on timeline lines 308/312; both were
qualified. Literal count markers inside README code fences were removed and
current inventory prose now avoids an independent fixed engine total.

A first JSDOM recheck omitted nav.js's dynamically loaded ui-delegates.js,
which made eight legacy widgets appear inert. Loading that actual dependency
proved the controls work. Their registrations were corrected too: §109, 110,
112, 113, 124, 127, 128, 129. Final baseline counts are **143 interactive
exhibits**, including **123 cipher/history exhibits**. The earlier 135/115
intermediate figures above record the first correction, not the final totals.
Tests now bind the real companion script before exercising those controls.
