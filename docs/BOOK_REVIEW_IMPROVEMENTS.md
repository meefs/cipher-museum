# Book-guided corrections and experiments

Reviewed and implemented on 22 October 2026. This work extends existing pages;
it does not add numbered exhibits or change the published cipher corpus.
The exercises use original, synthetic teaching fixtures. References identify
the books' ideas; they do not imply that the museum reproduces an entire
chapter, a historical intercepted message, or a complete production protocol.

## Nine correction areas

| Area | Location | Evidence or condition made explicit |
| --- | --- | --- |
| Known-plaintext recovery | [Cryptanalysis](../cryptanalysis.html) | An observed keystream fragment supports only the known span. A possible period and any extrapolated tail remain hypotheses. |
| Additive crib testing | [Cryptanalysis](../cryptanalysis.html) | The arithmetic is subtraction modulo 26, not an Enigma attack. Repetition requires a periodic sequence, not merely few distinct letters. |
| Running keys | [Running Key](../ciphers/running-key.html) | Natural-language keys remain biased and structured even without a short repeating period. They do not meet the OTP's uniform independent-key condition. |
| Hill recovery | [Hill](../ciphers/hill.html), Cryptanalysis | Direct recovery from matched blocks requires an invertible plaintext matrix modulo 26. Two valid keys can agree on unsuitable known blocks. |
| Lorenz history | [Lorenz](../ciphers/lorenz.html), [Bill Tutte](../ciphers/bill-tutte.html), timeline and summaries | Tiltman recovered the 1941 depth manually; Tutte and the Research Section inferred the structure by early 1942; Colossus became operational in February 1944. |
| Zimmermann history | [Zimmermann](../ciphers/zimmermann.html), README and summaries | 0075 and 13040 belong to successive transmission legs, not Triple DES or two nested encryption layers. |
| ECDSA | [ECDSA](../ciphers/ecdsa.html), Modern Cryptography hall | Deterministic nonce generation is not a guarantee of distinct nonces for every message and does not remove side-channel conditions. Negligible probability is not impossibility. |
| Diffie–Hellman | [Diffie–Hellman](../ciphers/diffie-hellman.html) | Recovering exponents is DLP; computing the shared group element is CDH. A DLP solver solves CDH, without establishing an unconditional general converse. |
| Transcription preparation | [Cipher Detective](../cipher-detective.html) | Preserve raw evidence and uncertainties. A–Z normalization is a disclosed analysis projection, not the universal first step in historical cryptanalysis. |

## Six learning additions

| Addition | Where to try it | Reading connection and limits |
| --- | --- | --- |
| Manual substitution desk | [Cipher Detective](../cipher-detective.html#manual-substitution) | Al Sweigart, *Cracking Codes with Python* (2018), ch. 17: partial mappings, word patterns and intersecting candidates. One-to-one substitution and retained word boundaries are explicit assumptions; homophonic substitution needs other rules. |
| Multiple anagramming | [Columnar Transposition](../ciphers/columnar.html#multiple-anagramming) | Helen Fouché Gaines, *Cryptanalysis* (1939; 1956 reprint), ch. VII; Joshua Holden, *The Mathematics of Secrets* (2017), §3.7. Rearrange several synthetic same-key intercepts together and compare a different-key control. Contact scores are clues, not probabilities. |
| Chapter reading trails | [Further Reading](../further-reading.html#reading-trails) | Edition-specific routes through Sweigart, Gaines, Holden and Bernhard Esslinger. Museum demonstrations illustrate selected concepts; the original books supply the full treatment. Only public author/publisher sources are linked. |
| Transcription workspace | [Cipher Detective](../cipher-detective.html#transcription-workspace) | Esslinger, *Learning and Experiencing Cryptography with CrypTool and SageMath* (2024), ch. 3 §§3.4–3.5.1: preserve symbols, boundaries and uncertainty before choosing an analysis representation. Export and re-import retain the source and annotations; this is not OCR. |
| Decimal VENONA exercise | [VENONA](../ciphers/venona.html#venona-decimal-experiment) | Stephen Budiansky, *Code Warriors* (2016), appendix A; NSA, *The VENONA Story*, pp. 26–28. Five-digit synthetic groups illustrate carryless decimal pad arithmetic and separate it from codebook interpretation. The existing binary XOR analogy is retained and labeled. |
| OTP tampering | [One-Time Pad](../ciphers/one-time-pad.html#otp-tampering-experiment) | Jonathan Katz and Yehuda Lindell, *Introduction to Modern Cryptography*, revised 3rd ed. (2025), §4.1.2; Ferguson, Schneier and Kohno, *Cryptography Engineering* (2010), chs. 2 and 6. A change to ciphertext changes the corresponding plaintext symbol; secrecy alone does not authenticate a message. Without knowing the plaintext, the attacker need not know its semantic effect. |

## Sources and independent checks

Books suggested the questions; arithmetic and primary sources settle the
specific claims. Public sources used in the exhibits include:

- [Sweigart, chapter 17](https://inventwithpython.com/cracking/chapter17.html).
- [Bombe reconstruction: Running the Bombe](https://bombe.org.uk/running-the-bombe/): cribs, menus and consistency checks.
- [The National Museum of Computing: Tunny and Heath Robinson](https://www.tnmoc.org/tunny-heath-robinson): the stages of Lorenz analysis and mechanization.
- [NSA: John Tiltman](https://www.nsa.gov/portals/75/documents/about/cryptologic-heritage/historical-figures-publications/publications/misc/tiltman.pdf), pp. 25–26.
- [NSA: The Zimmermann Telegram](https://www.nsa.gov/portals/75/documents/news-features/declassified-documents/cryptologic-quarterly/the_zimmermann_telegram.pdf), including the contemporary investigation of the transmission routes.
- [RFC 6979](https://www.rfc-editor.org/rfc/rfc6979.html) (August 2013), §§1 and 4: deterministic signing and security considerations.
- [Boneh and Shoup, *A Graduate Course in Applied Cryptography*](https://toc.cryptobook.us/) (v0.6, January 2023), §10.4.2: Diffie–Hellman assumptions.
- [CrypTool Transcriber and Solver](https://www.cryptool.org/en/ctts/): source-aware transcription and interpretation.
- [NSA: The VENONA Story](https://www.nsa.gov/portals/75/documents/about/cryptologic-heritage/historical-figures-publications/publications/coldwar/venona_story.pdf), pp. 26–28.

Regression fixtures include a short Vigenère observation that cannot verify
the remainder, genuinely periodic and nonperiodic crib fragments, two distinct
Hill keys consistent with the same known blocks, one-to-one word constraints,
same-key and different-key transpositions, and decimal versus integer
subtraction. DOM tests exercise the displayed results as well as the arithmetic.
No test treats a readable guess or a language score as proof of recovery.

## Maintenance

The six review suites are registered in `tests/run-all.js` and run with
`npm test`. They cover corrections, stateful controls, fixtures, source links
and reading routes. After changing exhibit copy or shared metadata, regenerate
`npm run build:metadata` and `npm run build:js`, inspect the generated diff,
and run the full suite and `npm run lint:html`. Check the experiments in a real
browser at desktop and narrow widths as well as in JSDOM.
