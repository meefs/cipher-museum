# Ebook review: further Cipher Museum recommendations

Reviewed 26 October 2026. **21 proposed work packages: five corrections and 16 teaching enhancements. None of these 21 has been implemented by this review.**

The strongest next step is to correct three Lorenz/Tutte historical statements and two analysis-result labels. The remaining work would make existing explanations more useful: show what an attack assumes, what a statistic measures, and where an educational model stops. Several topics already have substantial Crypto Lab demonstrations; the Museum should explain and link to those demonstrations instead of building duplicate engines.

This report follows substantive reading of selected passages in **13 books, monographs or historical reports** from the supplied Crypto-Lab/eBooks collection. It is not a cover-to-cover review of those works or of every file in the folder. The fresh inventory covered the ebook root and eight immediate subject folders; nested source collections were not exhaustively traversed. Filenames and tables of contents alone were not treated as evidence. The three new root uploads—*Power Analysis Attacks*, the second edition of *The Design of Rijndael*, and the author recompilation of *Differential Cryptanalysis of the Data Encryption Standard*—were included.

Museum comparison baseline: `4b8e0b8440695edd9953595b1edee05b600ede94`. Crypto Lab overlap check: catalog and encyclopedia roadmap at `3dd70fcb658780ba30d92a0a0a17c4c5d30a81dd`. Catalog descriptions establish overlap, not a fresh execution or source audit of every linked lab. Museum file/line references below refer to the baseline and may move later.

The earlier 67 work packages remain completed within their recorded scope. The 214-page review was a reading/consistency pass with targeted source checks, not source verification of every statement. This deeper, passage-based review found additional issues; it should not be represented as proof that the remaining site is error-free.

Book credits use title, author, edition/date and verified section/page locators. **No ebook download or viewer links are included.** PDF page numbers are one-based physical positions. Reflowed PDFs and author recompilations are identified explicitly; their positions are not silently substituted for printed folios.

## Work list

Status is **Proposed** for every row. P1 means correct misleading existing output or prose; P2 means add explanatory depth. Some P2 work is especially valuable but does not repair an established factual error. EBR-02 includes an optional entropy-rate extension after its wording fix.

| ID | Priority / kind | Proposed change | Main Museum location | Book evidence |
|---|---|---|---|---|
| [EBR-01](#ebr-01) | P1 / Correction | Correct Auto-Solve language labels | Detective / language model | Lasry; Sweigart |
| [EBR-02](#ebr-02) | P1 / Correction | Qualify workbench IC conclusions | Workbench; entropy | Gray |
| [EBR-03](#ebr-03) | P1 / Correction | Correct the Lorenz signal path | Lorenz | General Report on Tunny |
| [EBR-04](#ebr-04) | P1 / Correction | Qualify Lorenz wheel-setting reuse | Lorenz | General Report on Tunny |
| [EBR-05](#ebr-05) | P1 / Correction | Separate Tutte’s inference from Turingery | Bill Tutte; Colossus | Tunny; Gannon |
| [EBR-06](#ebr-06) | P2 / Enhancement | Explain AES wide-trail diffusion | AES; modern wing | Daemen and Rijmen |
| [EBR-07](#ebr-07) | P2 / Enhancement | Show DES S-box differential filtering | DES; cryptanalysis | Biham and Shamir |
| [EBR-08](#ebr-08) | P2 / Enhancement | Separate DES attack resource measures | DES; attack evidence | Biham and Shamir |
| [EBR-09](#ebr-09) | P2 / Enhancement | Show all 26 Caesar scores | Cryptanalysis | Lasry |
| [EBR-10](#ebr-10) | P2 / Enhancement | Make columnar comparisons repeatable | Columnar; teaching | Lasry |
| [EBR-11](#ebr-11) | P2 / Enhancement | Compare entropy with first-guess success | Entropy; glossary | Vadhan |
| [EBR-12](#ebr-12) | P2 / Enhancement | Explain privacy amplification and its limits | Entropy; XOR / OTP | Tyagi and Watanabe |
| [EBR-13](#ebr-13) | P2 / Enhancement | Separate authenticity from freshness | Modern wing; AES | Anderson; Wong |
| [EBR-14](#ebr-14) | P2 / Enhancement | Demonstrate ambiguous hash inputs | SHA-256; ZKP | Wong |
| [EBR-15](#ebr-15) | P2 / Enhancement | Explain purpose-separated HKDF outputs | Diffie–Hellman; SHA-256 | Wong |
| [EBR-16](#ebr-16) | P2 / Enhancement | Explain why ML-DSA aborts | Random oracle; polynomial rings | Menezes |
| [EBR-17](#ebr-17) | P2 / Enhancement | Explain KEM reencryption and implicit rejection | LWE; modern wing | Menezes |
| [EBR-18](#ebr-18) | P2 / Enhancement | Connect noisy equations to a q-ary lattice | LWE; closest vector | Menezes |
| [EBR-19](#ebr-19) | P2 / Enhancement | Show Colossus clock, condition and count | Colossus | Tunny; Gannon |
| [EBR-20](#ebr-20) | P2 / Enhancement | Explain implementation leakage conditions | AES; attack evidence | Mangard, Oswald and Popp |
| [EBR-21](#ebr-21) | P2 / Enhancement | Connect masking to joint leakage | AES; sharing; entropy | Mangard, Oswald and Popp |

## Suggested order and reuse

1. **Correct existing statements:** EBR-01–05. Capture the current failure or disputed wording, make the bounded change, and verify its visible result.
2. **Add small, high-value explanations:** EBR-11, 13–15 and 20. These can start as short worked examples rather than large simulators.
3. **Add deeper history, mathematics and experiments:** the remaining P2 packages, with the acceptance checks below.

| Existing Crypto Lab coverage | Museum work it can support | Boundary to preserve |
|---|---|---|
| [AES Anatomy](https://systemslibrarian.github.io/crypto-lab-aes-anatomy/) | EBR-06 wide-trail explanation | Four-round trail bounds and the existing integral experiment are already covered; no new AES engine is needed. |
| [Biham Lens](https://systemslibrarian.github.io/crypto-lab-biham-lens/) | EBR-07–08 differential methods | Existing DDT/SPN/FEAL/PRESENT activities are not a full DES attack. A DES S1 worked example has a distinct, small scope. |
| [Good Randomness](https://systemslibrarian.github.io/crypto-lab-good-randomness/) and [Noise to Numbers](https://systemslibrarian.github.io/crypto-lab-noise-to-numbers/) | EBR-02, 11–12 randomness and dependence | They already teach tests versus predictability and dependence; the Museum additions should bridge to those lessons. |
| [Dilithium Reject](https://systemslibrarian.github.io/crypto-lab-dilithium-reject/) | EBR-16 rejection sampling | Explain the distribution issue in the Museum and reuse the instrumented signer. |
| [KEM Trap](https://systemslibrarian.github.io/crypto-lab-kem-trap/) | EBR-17 implicit rejection | Reuse the existing mechanism; preserve its distinction between schematic misuse and correct ML-KEM. |
| [Lattice Gentle](https://systemslibrarian.github.io/crypto-lab-lattice-gentle/) and [Lattice Builder](https://systemslibrarian.github.io/crypto-lab-lattice-builder/) | EBR-18 geometry bridge | The exact rectangular q-ary example still needs verification; the current square Museum toy is different. |
| [Power Trace](https://systemslibrarian.github.io/crypto-lab-power-trace/) | EBR-20 passive leakage | CPA/DPA on simulated traces already exists. The roadmap’s `RR-POWER-MEASURED` already plans measured-trace evidence; do not add a duplicate roadmap item. |
| [Masked Core](https://systemslibrarian.github.io/crypto-lab-masked-core/) | EBR-21 joint leakage | First- versus second-order centered-product demonstrations already exist. Add Museum interpretation and navigation. |

These are recommendations for Museum content and its connections to Crypto Lab. The review does **not** establish a separate new defect list for the implementation of those labs. It also does not reopen previously completed LMS, KWP or ML-DSA-unpacking work without new evidence.

## Books and passages actually used

| Source | Edition / date | Substantive reading used in this report |
|---|---|---|
| George Lasry, *A Methodology for the Cryptanalysis of Classical Ciphers with Search Metaheuristics* | kassel university press, 2018 published thesis | Printed pp.28–37, 49–60, 67–80; PDF pp.49–58, 70–81, 88–101. Scoring, experimental method and columnar search. |
| Al Sweigart, *Cracking Codes with Python: An Introduction to Building and Breaking Ciphers* | No Starch Press, 2018 | Chapter 11 selected sections, PDF pp.182–188, 199–202. Supplied reflowed copy has no verified original printed folios. |
| Robert M. Gray, *Entropy and Information Theory* | Corrected first edition dated 26 June 2023; original copyright 1990 | §§2.2, 2.3 and 2.6 selected material, especially printed pp.18–20 and 42–44. This is not the 2011 second edition. |
| Salil P. Vadhan, *Pseudorandomness* | Foundations and Trends in Theoretical Computer Science 7(1–3); volume dated 2011, copyright 2012 | §§6.1.2–6.1.3 and §6.2.1, printed pp.171–180; key example pp.171–172 / PDF pp.174–175. |
| Himanshu Tyagi and Shun Watanabe, *Information-theoretic Cryptography* | Cambridge University Press, 2023 | §§7.1 and 7.3, printed pp.119–121 and 124–127; key example p.124 / PDF p.139. |
| I. J. Good, Donald Michie and Geoffrey Timms, *General Report on Tunny: With Emphasis on Statistical Methods* | 1945; supplied modern collected archival facsimile | Selected §§11A–B, 43B–C and 53B, F–G. Printed/PDF mappings are given with each finding. |
| Paul Gannon, *Colossus: Bletchley Park’s Greatest Secret* | Atlantic Books, 2014 edition; original copyright 2006 | Chapters 10, 13, 15; converted PDF pp.94–97, 132–135, 153–156. These are not verified printed-edition folios. |
| Joan Daemen and Vincent Rijmen, *The Design of Rijndael: The Advanced Encryption Standard (AES)* | Springer, second edition, 2020 | §§9.1.3, 9.2.2–9.2.3, 9.4.4–9.5.2 and chapter 13 opening. |
| Eli Biham and Adi Shamir, *Differential Cryptanalysis of the Data Encryption Standard* | Springer book, 1993; supplied author LaTeX recompilation dated 7 December 2009 | §3.2, start of §3.3, chapter 5 / §5.1 through Table 5.2. Numbered-page references below belong to the recompilation. |
| Ross Anderson, *Security Engineering: A Guide to Building Dependable Distributed Systems* | Wiley, third edition, 2020 | Protocol context, PDF pp.167–173; §4.3 printed pp.122–124 / PDF pp.169–171. |
| David Wong, *Real-World Cryptography* | Manning, 2021 | §§2.5.4, 3.3.3, 8.6; PDF pp.120–124, 140–143, 349–357. Supplied 768-page reflowed copy has no verified printed folios. |
| Alfred Menezes, *A Gentle Introduction to Lattice-Based Cryptography* | Version 3.3, 16 September 2026 | §§4.3–4.4 printed pp.35–40 / PDF pp.48–53; §6.4 pp.64–66 / PDF pp.77–79; §7.1, especially pp.73–74 / PDF pp.86–87. |
| Stefan Mangard, Elisabeth Oswald and Thomas Popp, *Power Analysis Attacks: Revealing the Secrets of Smart Cards* | Springer, 2007 | Introduction printed pp.1–13; §3.3 pp.38–42; §§6.1–6.2 pp.119–124; §9.1 pp.223–226; §§10.1–10.2 pp.245–249. PDF mapping given below. |

Title/version pages were checked. Relevant historical scans, equations and tables were visually checked where OCR could change the finding. *Cryptography Engineering* was inspected only in its front matter and is not counted as supporting reading. Weierud, Beyne/Rijmen, Takagi, Thaler and other unneeded titles are not claimed as read in this pass. No books or scans are republished with this report.

## Detailed recommendations

<a id="ebr-01"></a>

### EBR-01 — Correct Auto-Solve language labels

**Status: Proposed · P1 · Correction.**

**Current page and quotation:** `cipher-detective.html`, Auto-Solve introduction, lines 463–467: “Run every applicable solver against this ciphertext and rank the results by how English-like each candidate plaintext is.” `js/detective/lang-model.js:200` returns the exact public label **“Very likely English”** whenever fitness per letter exceeds -8.5. `js/detective/detective.js:327` calls the table column **“Confidence”**, and lines 310–317 render the same label on the best candidate. `js/detective/solvers.js:469` permits inputs of four letters or more.

**Evidence and finding:** Loading the actual language model in Node gives:

| Candidate | Letters | Score/letter | Current label |
|---|---:|---:|---|
| `ZXQJ` | 4 | -7.7148458879 | Very likely English |
| `THE THE THE THE THE THE` | 18 | -5.3604937451 | Very likely English |
| `Meet Dr. Zyx at QX-17.` | 13 | -11.0967827623 | Unlikely English (weak fit) |
| `THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG` | 35 | -10.8548818420 | Unlikely English (weak fit) |

The four-letter case is structural, not a lucky counterexample. Four letters contribute only two trigrams and three bigrams. Even when every n-gram receives the lowest floor value and no word bonus applies, `(2*TRIGRAM_FLOOR + 0.4*3*BIGRAM_FLOOR)/4 = -7.7148458879`, which passes the top-label threshold. Every four-letter candidate therefore receives the top tier. Current general short-text warnings do not repair this result-level label.

**Book support actually read:** Sweigart, full citation in the reading register, Chapter 11 “How Can a Computer Understand English?”, PDF pp. 183–184 (printed folio unavailable), explains that dictionary recognition misses valid words, identifiers and other languages; “Detecting English Words” and “Using Default Arguments,” PDF pp. 199–202, treat the thresholds as adjustable heuristics. Lasry, full citation in the reading register, §3.2.3, printed pp. 29–30 / PDF pp. 50–51, distinguishes word and n-gram evidence; §3.2.4 and preceding paragraph, printed pp. 33–34 / PDF pp. 54–55, discuss spurious scores and sensitivity to sample length. These sources motivate checking recognition separately from optimizing its score; the four-letter defect comes from the local reproduction, not a book claim.

**Recommended change:** Rename the result column and badges to describe **fit to the embedded English model**, with an explicit unverified-candidate status. Suppress a strong language conclusion for insufficient n-gram evidence. Revisit normalization and length-stratified thresholds using declared held-out samples, including unusual but valid English and repeated high-frequency fragments. Do not relabel an arbitrary threshold as a measured probability. A compact expandable breakdown of n-gram and word contributions would make the bias teachable.

**Validation:** Regression-check four-letter all-floor inputs, no-letter/one-/two-letter inputs, repeated fragments, ordinary prose, proper names/identifiers and non-English controls. Check that displayed labels do not imply authentication and that the model-fit change does not silently alter solver ranking unless intentionally chosen. Any later calibrated performance claim needs held-out results with sample counts and length ranges.

<a id="ebr-02"></a>

### EBR-02 — Qualify workbench IC conclusions

**Status: Proposed · P1 · Correction.**

**Current evidence:** `lab/workbench.html:417–423`, `updateFreq()`, emits “Suggests polyalphabetic with short key” for `0.04 < IC <= 0.06` and “Flat distribution — polyalphabetic or random” for `IC <= 0.04`. The latter is a disjunction that omits simple deterministic sequences. `hall-of-foundations/entropy.html:71–93` illustrates only a single biased coin; no public HTML currently mentions “entropy rate” (repository-wide public-HTML search, excluding docs, tests, tmp and node_modules).

**Concrete reproduction:** Set workbench input to the alphabet A–Z repeated 100 times. Its 2,600 characters contain 100 of each letter. The actual implementation's formula gives `26*100*99/(2600*2599) = 0.03809157368218546`, displayed as `0.0381`, which selects “Flat distribution — polyalphabetic or random”. This entirely predictable sequence needs neither a polyalphabetic cipher nor fresh randomness. Any permutation of the same character multiset produces the same bars and IC.

**Source:** Robert M. Gray, *Entropy and Information Theory*, First Edition, Corrected, dated June 26, 2023 (original copyright 1990; this is the corrected first edition, not the 2011 second edition). §2.2, printed pp.18–20 / PDF pp.40–42 defines single-variable entropy, normalized block entropy and entropy rate. §2.6, printed p.42 / PDF p.64, Lemmas 2.6.1–2.6.2 relate a stationary process's entropy rate to conditional uncertainty given preceding symbols. PDF p.64 was visually inspected; printed p.42 and the lemma statements were confirmed.

**Evidence synopsis:** A one-symbol distribution and the uncertainty of an entire sequence are different objects. A stationary source can have uniform one-symbol marginals while future symbols are determined by the past. The book does not claim an IC diagnostic; applying this distinction to the museum's histogram/IC widget is our inference, supported by the exact reproduction above.

**Proposed change:** Replace the low-IC hint with a bounded description such as “Low observed coincidence: compatible with many sources, including balanced deterministic text. This statistic does not identify a cipher or prove randomness.” Retain useful comparisons with reference-language IC without categorical key-length inference. Link to a small entropy-rate comparison in the foundations exhibit: choose one of 26 cyclic alphabet phases uniformly once, then emit the alphabet cyclically forever. Each position is uniform, `H(X_i)=log2(26)`, but an n-symbol block has only `log2(26)` bits of uncertainty, so its entropy per symbol tends to zero. Compare this declared source with independent uniform letter draws. Explicitly describe sources/distributions, not the “entropy of this particular string”.

**Validation before implementation acceptance:** Test the exact repeated-alphabet input and a rearrangement; both retain identical IC without a randomness verdict. Exhaustively enumerate the 26 cyclic phases for small block lengths and confirm `H(X_1...X_n)=log2(26)`. Check the independent model's block entropy `n*log2(26)`. Keep observed finite-sample estimates distinct from declared model values. This adds dependence/sequence structure to the current one-coin exhibit rather than merely adding another independence warning.

<a id="ebr-03"></a>

### EBR-03 — Correct the Lorenz signal path

**Status: Proposed · P1 · Correction.**

Current ciphers/lorenz.html:98 says: “Lorenz was a fully automatic teleprinter attachment — messages fed in on paper tape, encrypted output punched automatically.” The comparison table at line 184 says: “Inline teleprinter attachment — paper tape in, encrypted tape out, fully automatic”.

**Evidence:** Good, Michie and Timms, *General Report on Tunny: With Emphasis on Statistical Methods* (1945), §11A(b)–(c), **printed p.4 / PDF p.7**, scan visually checked. Messages could originate at a keyboard or from prepared plaintext tape. The cipher attachment sat between the sending teleprinter and wireless transmitter, with a corresponding attachment between the receiving wireless set and teleprinter. The report describes the absence of a ciphertext recorder at these interfaces. A receiving teleprinter could punch tape as well as, or instead of, printing; that output was recovered plaintext.

**Recommendation:** Replace both statements with a keyboard/plaintext-tape → cipher attachment → transmitted ciphertext → receiving cipher attachment → plaintext printer/tape explanation. A compact signal-flow illustration would help. Distinguish this operational chain from intercepted ciphertext tapes used by British cryptanalytic equipment.

**Check:** Trace every arrow and tape label. Plaintext occurs before German encryption and after German decryption; ciphertext occurs in transmission and on British intercept tapes. Do not imply normal Lorenz operation required a punched ciphertext intermediate. This does not exclude specialized recording arrangements; it corrects the unqualified normal-operation claim.

<a id="ebr-04"></a>

### EBR-04 — Qualify Lorenz wheel-setting reuse

**Status: Proposed · P1 · Correction.**

Current ciphers/lorenz.html:187 says: “Reusing a wheel setting collapses two messages into a depth (P_A ⊕ P_B)”. The page covers SZ40/42 broadly, although its simulator is properly bounded as a “pedagogical model of the SZ40’s structure” at line 170.

**Evidence:** Good, Michie and Timms, *General Report on Tunny: With Emphasis on Statistical Methods* (1945):

- §11B(g), **printed p.8 / PDF p.11**, visually checked, distinguishes motor-control limitations and explains that those incorporating the fifth plaintext impulse make the keystream depend on plaintext.
- §11B(j), **printed p.10 / PDF p.13**, visually checked, distinguishes no-limitation SZ40 from SZ42A and SZ42B configurations. Not every SZ42 configuration used plaintext feedback.
- §43C(g), **printed p.317 / PDF p.311**, visually checked, explains how the Herring link’s plaintext-feedback configuration prevented full depth despite identical starting settings: differing plaintext made the psi streams diverge.

**Recommendation:** Change the table’s condition to “Reusing the same keystream…” and add a short note explaining that some later configurations fed a delayed plaintext impulse into motor control. Equal initial settings then did not guarantee equal full keystreams. Preserve the existing reuse widget’s correct condition of the **same keystream**. Do not imply all SZ42 variants were autoclave or that feedback made the system generally secure.

**Check:** C_A ⊕ C_B = P_A ⊕ P_B ⊕ K_A ⊕ K_B, so cancellation requires K_A = K_B. Matching starts alone is insufficient when plaintext affects subsequent stepping. A future historical feedback simulator would require separate verification of delay conventions, startup behavior and vectors; this wording fix does not require that engineering work.

<a id="ebr-05"></a>

### EBR-05 — Separate Tutte’s inference from Turingery

**Status: Proposed · P1 · Correction.**

Current ciphers/bill-tutte.html:103 says: “When Tutte was given Tiltman’s recovered key, he performed a statistical attack called "wheel breaking": by XOR-differencing successive characters of the recovered keystream, he could identify statistical biases introduced by the Chi-wheel keystream. Working with the Research Section through early 1942, he inferred the wheel structure and sizes…”

**Evidence:** Good, Michie and Timms, *General Report on Tunny: With Emphasis on Statistical Methods* (1945), §43B, **printed p.313 / PDF p.307**, visually checked, places Turing’s work on the July 1942 key and attributes the introduction of adjacent-key differencing to Turingery. This passage concerns recovering wheel patterns from key, not the initial diagnosis of machine structure.

Paul Gannon, *Colossus: Bletchley Park’s Greatest Secret* (Atlantic Books, 2014), chapter 10, “Fishing the Depths,” **converted PDF pp.94–97**, describes Tutte’s earlier structural inference from repetitions and periodicity. Chapter 13, “Making the Difference,” **converted PDF pp.132–135, especially p.133** (p.133 visually checked), distinguishes the later problem of finding settings with known wheel patterns and identifies Tutte’s use of differencing previously devised by Turing for hand wheel-breaking.

**Recommendation:** Distinguish three tasks: (1) infer structure from recovered key and repeated patterns, completed by early 1942; (2) recover wheel pin patterns from key using Turingery in 1942; (3) find message settings statistically from ciphertext with known patterns, later accelerated by Colossus. A small input/unknown/method table could connect the Tutte and Colossus exhibits.

**Check:** Keep structure, pin patterns and starting positions separate. Preserve Tiltman’s key recovery, Tutte’s inference and statistical work, Turing’s method, and Flowers’s engineering. Do not claim Tutte never experimented with differences before 1942; the narrower correction removes the existing unsupported assignment of the later named method to the initial breakthrough.

**Source caution:** Gannon’s explanation around converted p.95 contains an arithmetic slip concerning 41 and 574. Do not reproduce it: 574 = 14 × 41. Use the primary report for Turingery’s attribution and Gannon for the broader distinction between tasks.

<a id="ebr-06"></a>

### EBR-06 — Explain AES wide-trail diffusion

**Status: Proposed · P2 · Enhancement.**

**Existing-lab reuse.** AES Anatomy already contains four-round trail limits and an integral lesson. Keep the Museum panel short and link to that existing depth; this report does not propose a second AES engine.

**Current location and quotation.** `ciphers/aes.html:88`, How It Works: “Repeated rounds spread changes through the state; diffusion alone is not a proof of security.” `modern.html:158` already correctly says changing one input bit changes about half the full-AES output bits *on average* and that this is not a standalone security proof. Preserve these completed corrections.

**Book and exact evidence.** Joan Daemen and Vincent Rijmen, *The Design of Rijndael: The Advanced Encryption Standard (AES)*, second edition, Springer, 2020. Sections 9.2.2–9.2.3, printed pp. 131–132 / PDF pp. 151–152 define active S-boxes and byte-weight diffusion. Sections 9.4.4–9.5.2, printed pp. 140–143 / PDF pp. 160–163 explain the dispersion condition and establish the four-round lower bound. Theorem 9.5.1 bounds a nonzero four-round trail by the square of the diffusion branch number. For Rijndael, MixColumns has branch number 5, and ShiftRows supplies the required dispersion, giving at least 25 active S-boxes in a four-round trail. Printed p. 143 / PDF p. 163 was also inspected visually. Section 9.1.3, printed p. 128 / PDF p. 148, and the opening of chapter 13, printed p. 195 / PDF p. 215, supply the essential boundary: individual trails and the aggregate differential or linear correlation are different objects; trail clustering and key dependence matter.

**Recommended change.** Add a compact “Why these diffusion steps?” panel, optionally with an active-byte visualization. Define an active S-box as one receiving a nonzero input difference. Show the MixColumns constraint that input and output active-byte counts sum to at least five for a nonzero column difference, then explain how ShiftRows prevents successive rounds from concentrating activity in one column. End with the four-round 25-active-S-box theorem, explicitly labeled a bound on an individual trail. Distinguish byte activity from the number of changed bits. Do not present 25 as an exact count for every pair, multiply maximum S-box probabilities into a claimed full-AES security proof, or replace the existing caveat with an avalanche-only animation. A linked expansion on `modern.html` can connect its current diffusion definition to this design criterion.

**Meaningful validation before implementation is accepted.** Independently implement the AES field arithmetic and verify all 69 nonempty square minors of the 4×4 MixColumns matrix are nonsingular (the MDS criterion behind branch number five). Test chosen differences that exhibit cancellation as well as full activity. Check ShiftRows column dispersion and the theorem's nonzero-trail assumptions. Explain the theorem rather than claiming a handful of example states proves it. If showing bit counts too, keep them separate from byte weights and handle the all-zero difference explicitly. Confirm the displayed four-round construction matches the book's round conventions.

<a id="ebr-07"></a>

### EBR-07 — Show DES S-box differential filtering

**Status: Proposed · P2 · Enhancement.**

**Existing-lab reuse.** Biham Lens already teaches DDTs and differential methods in other bounded constructions. Use the DES S1 example as a small Museum-specific worked example and link the broader lab rather than rebuilding its engine.

**Current location and quotation.** `cryptanalysis.html:510–513` contains a historical timeline item rather than an explanation of the method: “Biham and Shamir later developed the technique publicly. Its effectiveness depends on the cipher and the available data.” `ciphers/des.html:89` describes the “eight 6-to-4-bit S-boxes (the heart of DES's non-linearity)” but does not demonstrate how their differential behavior constrains candidate keys. The inspected technique cards do not supply this component-level exercise.

**Book and exact evidence.** Eli Biham and Adi Shamir, *Differential Cryptanalysis of the Data Encryption Standard*, Springer, 1993; supplied copy is the authors' **7 December 2009 LaTeX recompilation**, which explicitly warns that its pagination differs from the original printed book. All page numbers here refer to the numbered pages in that supplied version. Section 3.2, numbered pp. 15–22 / PDF pp. 21–28, particularly Definition 3.2, Table 3.2, and Examples 3.4–3.7, constructs difference-distribution tables and demonstrates candidate-key filtering. Numbered pp. 18 and 20 / PDF pp. 24 and 26 were also inspected visually.

The XOR key disappears from the input difference, but the nonlinear S-box has a nonuniform output-difference distribution. For DES S1, input difference `34` hexadecimal produces output difference `02` for 16 of 64 ordered inputs, but output difference `04` for only 2 of 64. Differences `00` and `09` are impossible for that input difference. Example 3.7 supplies a useful exercise with an honestly ambiguous outcome: known inputs before subkey XOR `(01,35)` and observed S1 output XOR `0D` admit eight six-bit subkeys; `(21,15)` with output XOR `03` admits six. Their intersection is `{17,23}`, so these two observations do not identify a unique key. All values in this paragraph are hexadecimal except counts.

**Recommended change.** Add an interactive differential-cryptanalysis technique card or small lab linked from the DES exhibit: enumerate the 64 inputs for one selected S1 input difference, draw the output-difference histogram, and filter the 64 candidate six-bit subkeys with the two book examples. Explain why the two survivors remain and what additional observation would resolve them. State exactly what is given: the inputs to the subkey-XOR/S1 component and its output differences. This is an isolated component exercise with intentionally exposed intermediate information, not a full-DES key-recovery demonstration or a claim that these values are normally visible in intercepted traffic. The exercise need not introduce a full DES attack implementation.

**Meaningful validation.** Check S1 indexing independently: outer input bits choose the row, middle four choose the column. Exhaustively enumerate the 64×64 input/difference combinations; each DDT row must sum to 64, the zero row must contain 64 at output difference zero, and nonzero-input-difference counts are even under the ordered-input convention. Test the exact book examples and retain the two-survivor result. During this research, a small independent enumeration reproduced the `34` row as `[0,8,16,6,2,0,0,12,6,0,0,0,0,8,0,6]` and the `{17,23}` intersection; this validates the proposed fixture, not any existing website implementation. Use an original visualization rather than a scanned book table.

<a id="ebr-08"></a>

### EBR-08 — Separate DES attack resource measures

**Status: Proposed · P2 · Enhancement.**

**Existing-lab reuse.** Link the differential-method explanation to Biham Lens. Do not present its existing toy/reduced constructions, or Matsui Line’s separate composition lesson, as execution of this historical full-DES attack.

**Current location and quotation.** `ciphers/des.html:94`: “Differential and linear cryptanalysis also showed important theoretical weaknesses, although their data requirements limit their practical use.” `lab/modern-attack-evidence.html` already distinguishes the conditions of newer GPU, fault, and conditional-linear results. Preserve those corrections; add a separate historical differential-attack card and link it from DES rather than repurposing the existing conditional-linear card.

**Book and exact evidence.** Biham and Shamir, *Differential Cryptanalysis of the Data Encryption Standard*, 1993 book, supplied 2009 author recompilation as identified in the reading register. Chapter 5 and §5.1, numbered pp. 78–86 / PDF pp. 84–92, were read. Table 5.2, numbered p. 86 / PDF p. 92, inspected visually, gives distinct columns for the 16-round result: approximately `2^47` chosen plaintexts, `2^55` known plaintexts for the separate known-plaintext variant, `2^36` analyzed plaintexts, and `2^37` complexity of analysis. The preface (PDF p. 2) describes the analyzed data as usable ciphertexts retained from the much larger collection. These are rounded table values; §5.1 gives the more precise metastructure estimate `2^47.2` chosen plaintexts and `2^37.2` equivalent DES operations for analysis. The attack uses the standard DES key schedule.

Numbered p. 84 / PDF p. 90 explains the base schedule: `2^35` structures containing `2^13` plaintexts each, about `2^36.25` retained ciphertexts, about `2^37` analysis operations, and about 58% chance of at least one right pair. Metastructures obtain four times as many pairs from twice as many plaintexts, reducing the rounded collection estimate from `2^48` to `2^47`. The 58% figure belongs to the described probabilistic schedule; it should not be silently attached as an exact success probability to every rounded table row. Numbered p. 85 / PDF p. 91 gives a concrete access limitation: ASCII-only plaintexts cannot realize the original required differences; the adapted attack requires about `2^49` chosen ASCII plaintexts.

**Recommended change.** Present a small resource table distinguishing data collection, retained/analyzed data, analysis work, success assumptions, and chosen versus known plaintext access. Label `2^37` as the analysis phase, never as total end-to-end attack work. Explain that a chosen-plaintext capability requires the needed input differences, with the ASCII restriction as an optional concrete example. Attribute this as a historical published result, not a current hardware benchmark. Avoid implying that passive possession of `2^36` arbitrary ciphertexts suffices. A modern runtime estimate would require separate evidence.

**Meaningful validation.** Independently check the structure arithmetic, metastructure factor-of-two saving, and the different units in every table column. Assert that the standard 16-round DES/key-schedule assumption remains visible. Distinguish the known-plaintext variant from the chosen-plaintext result in both the visible table and any machine-readable metadata. If an optional scaling control is added, derive its probability model explicitly; do not infer exact success probability from rounded powers of two or claim to simulate the enormous data collection.

<a id="ebr-09"></a>

### EBR-09 — Show all 26 Caesar scores

**Status: Proposed · P2 · Enhancement.**

**Current page and quotation:** `cryptanalysis.html:422`: “Watch a small Caesar-key search score candidate shifts against English frequencies.” At lines 869–877 and 933–938 the objective is the mean of the reference frequency assigned to each candidate letter: `s += ENG_FREQ[...]` followed by `return s / clean.length;`. The visible search trace does not explain that objective or compare the visited result with all 26 shifts.

**Evidence and finding:** The actual frequency array gives `HELLOWORLD` 5.85, its reversed anagram `DLROWOLLEH` the same score (floating-point rounding aside), and `EEEEEEEEEE` 12.7. This is a frequency-weighted letter preference, not a distance between the observed and expected distributions. Maximizing it and finding authentic plaintext are separate tasks. The existing caveats correctly say recovery is not guaranteed; a concrete counterexample would now teach why.

**Book support actually read:** Lasry, full citation in the reading register, §§3.2.1–3.2.3, printed pp. 29–30 / PDF pp. 50–51, explicitly separates fitness maximization from cost minimization and describes distribution-distance and log-frequency objectives. §3.2.4, printed pp. 33–34 / PDF pp. 54–55, uses score-versus-key-error experiments to assess usefulness. §4.5, printed pp. 56–57 / PDF pp. 77–78, argues for assessing/adapting the objective. Its large-key fitness-distance results should not be represented as measured results for this tiny Caesar demonstration.

**Recommended change:** Keep the 26-key example small and show all 26 scores alongside the search path. Name the existing objective plainly; optionally compare it with a distribution-distance or n-gram objective. For synthetic known-answer examples, distinguish three outcomes: the search's stopping point, the best score under the selected objective, and the supplied correct shift. Include an equal-letter-count anagram and repeated-letter counterexample. This teaches optimizer behavior without suggesting that a better search procedure can repair an unsuitable scoring function.

**Validation:** Exhaustively compute the 26-key reference table for each fixture; the displayed global score optimum must match it. Verify objective direction (lower cost versus higher fitness), anagram equality for monograms, and that a global score winner may differ from the known-answer key. Existing annealing acceptance behavior need not change.

<a id="ebr-10"></a>

### EBR-10 — Make columnar comparisons repeatable

**Status: Proposed · P2 · Enhancement.**

**Current page and quotation:** `ciphers/columnar.html`, advanced search controls: “Change one option at a time to compare searches with the same seed and budget.” `js/columnar-search-ui.js` displays **“Best candidate (unverified)”** and **“Equal evaluation counts are not equal CPU time. Scores do not certify a decryption or uniqueness.”** `teaching.html:48` says **“Demonstrate solver benchmarking and reproducibility.”** These qualifications and seed/budget controls are already useful. The current UI returns one outcome; there is no batch success report across seeds and known-answer messages.

**Book support actually read:** Lasry, full citation in the reading register, §4.7, printed pp. 59–60 / PDF pp. 80–81, discusses stochastic success, restarts and initialization cost. §5.3 introductory evaluation design, printed p. 67 / PDF p. 88, compares success and work across complete/incomplete rectangles, key lengths and row counts. Tables 5.5–5.8, printed pp. 69–71 / PDF pp. 90–92, compare baseline and modified attacks; Figure 5.4 and Table 5.9, printed pp. 74–75 / PDF pp. 95–96, distinguish move-set contribution and work factor. Tables 5.10–5.11, printed pp. 79–80 / PDF pp. 100–101, separately characterize incomplete rectangles. These are methodological examples, not performance expectations for the museum's deliberately bounded implementation.

**Recommended change:** Add a small downloadable/classroom experiment preset using synthetic known-answer messages and an explicit fixed list of seeds. Compare one option at a time across several widths, lengths and complete/incomplete rectangles; report each run, exact plaintext recovery, key recovery separately, score evaluations, preprocessing evaluations, and elapsed time. Retain failed/exhausted runs in the denominator. Record the input/fixture, model and algorithm version, configuration and seed in a receipt. Keep a small default batch and cancellation control. A teacher-facing worksheet or script is sufficient; this need not become a large browser benchmark product.

**Why new:** The current implementation already supports staged initialization, restarts and budget accounting. The recommendation adds evidence about their behavior across trials, instead of inferring effectiveness from a single displayed winner. The same seed under a changed algorithm does not by itself make the two searches follow corresponding random paths.

**Validation:** A repeated run with the same fixtures, versions, options and seeds must reproduce candidates and evaluation counts; elapsed time is recorded, not expected to match exactly. Confirm total budget accounting includes preprocessing and every restart, exact-answer checks use an independent encryption/decryption fixture, complete/incomplete cases are labeled, and failures remain visible. Never import Lasry's success rates as the museum's measured rates.

<a id="ebr-11"></a>

### EBR-11 — Compare entropy with first-guess success

**Status: Proposed · P2 · Enhancement.**

**Current evidence:** `hall-of-foundations/entropy.html:67` says “Shannon entropy measures average uncertainty. Min-entropy, guessing distributions and the cost of each trial are also relevant to attacks.” The only interactive models below it are a binary Shannon-entropy curve (§1) and uniformly selected character bars (§2). `glossary.html:234` mentions min-entropy but supplies neither a numerical example nor a guessing calculation. Public-HTML search found min-entropy only in these two prose passages.

**Source:** Salil P. Vadhan, *Pseudorandomness*, complete monograph, *Foundations and Trends in Theoretical Computer Science* 7(1–3), pp.1–336; copyright 2012, with the volume dated 2011 on the supplied title page. §6.1.2, printed pp.171–172 / PDF pp.174–175: Definition 6.7, Lemma 6.8, and the mixture example that outputs the all-zero n-bit string with probability .99 and otherwise draws a uniform n-bit string. PDF p.175 was visually inspected; the printed p.172 heading, .99/.01 example and explanatory paragraph were confirmed.

**Evidence synopsis:** Vadhan separates Shannon, collision and min-entropy. The all-zero/uniform mixture has Shannon entropy growing with n but is overwhelmingly predictable on one guess. This is a concrete way to explain why an average entropy value is not a password-guessing work factor. The chapter also states that deterministic postprocessing cannot increase these entropy quantities; no claim that hashing automatically repairs the distribution follows.

**Proposed change:** Add a two-mode “average uncertainty versus first guess” panel beside the current uniform model. One mode is uniform n-bit output; the other first chooses a fixed all-zero result with probability a and otherwise samples uniformly. Show `P_best = a + (1-a)/2^n`, `H_min = -log2(P_best)`, and the Shannon entropy computed from that exact distribution. An original teaching preset `n=256, a=1/2` has Shannon entropy approximately 129 bits but first-guess success approximately 1/2 and min-entropy approximately 1 bit. Label this as an adaptation of the source's mixture example, not a measured password population. Do not call 2^Shannon “guesses required”. Optional short-source view can display the ordered cumulative guessing-success curve.

**Validation before implementation acceptance:** Exact enumeration for n≤8 must match formulas; at a=0 all models must give n-bit Shannon/min-entropy and first-guess success 2^-n; at a=1, entropy must be zero and success one. Independently calculated n=256,a=.5 fixture gives Shannon≈129, min≈1, first guess≈.5. Handle 0log0 and avoid underflow for long n. Keep guessing success, entropy and cost per trial separately labelled. This makes a presently verbal distinction inspectable rather than redoing the existing caveat.

<a id="ebr-12"></a>

### EBR-12 — Explain privacy amplification and its limits

**Status: Proposed · P2 · Enhancement.**

**Current evidence:** `glossary.html:541` correctly says “XOR with an independent uniform bit produces a uniform output; XOR alone does not create randomness from arbitrary inputs.” `hall-of-foundations/entropy.html:119–126` moves directly from uniform-source key length to the OTP and its randomness cost. Public-HTML searches for “privacy amplification”, “leftover hash”, “seeded extractor” and “conditional min-entropy” returned no lesson. The existing OTP tampering exercise is about integrity; it does not address extracting a shorter secret from partially exposed randomness.

**Source:** Himanshu Tyagi and Shun Watanabe, *Information-theoretic Cryptography*, Cambridge University Press, first published 2023 (title and copyright page checked). §7.3, printed p.124 / PDF p.139, Example 7.9 and Definition 7.10. Supporting general formulation: printed pp.125–127 / PDF pp.140–142, conditional min-entropy and Theorem 7.13. PDF p.139 was visually inspected; the printed p.124 number, leakage model, XOR construction and security definition were confirmed.

**Evidence synopsis:** In Example 7.9 the legitimate parties share two random bits. The adversary learns exactly one bit, with the erased coordinate explicitly identified. Their XOR is a uniform secret bit independent of that specified observation, even though the parties do not know which bit leaked. The general goal is an almost-uniform output independent of adversary side information and the public extractor choice. This depends on the joint source/leakage model; it is not a theorem that any XOR removes any leakage.

**Proposed change:** Add an eight-row distribution explorer (four bit pairs × two equally likely revealed coordinates) with legitimate-party and adversary views. Show the adversary's remaining possibilities and the parity output for each observation. Contrast two modes: “one constituent bit revealed” leaves parity balanced; “parity itself revealed” makes the proposed output completely known. The second mode is our deliberately constructed negative control, not the book's example. State the source model as two independent fair bits; label the fixed table as a model enumeration, not a source of secret randomness. Link from the entropy/XOR material. An optional advanced note can name privacy amplification and conditional min-entropy without implementing a real key-generation system.

**Validation before implementation acceptance:** Enumerate all eight equiprobable outcomes. For each of the four adversary observations `(revealed coordinate, bit value)`, verify parity 0 and 1 each have probability 1/2; equivalently verify `P(K,Z)=P(K)P(Z)`. In the parity-leakage control verify `P(K=Z)=1`. Do not show a generic “secure” indicator outside this toy model or imply that simulated bits are operational keys. This is a constructive lesson on secrecy after partial leakage, distinct from the existing uniform-pad and malleability lessons.

<a id="ebr-13"></a>

### EBR-13 — Separate authenticity from freshness

**Status: Proposed · P2 · Enhancement.**

**Current location/evidence.** `ciphers/aes.html:78` says, “the mode of operation, authentication, nonce handling and key management matter too.” Its security section at line 93 covers nonce reuse, authentication and implementation failures. The reviewed AES page, `modern.html`, `learn.html` and five tour JSON files contain no replay/receiver-state exercise. This is a bounded absence: `halls/military.html:286` already mentions “freshness checks,” so the proposal must not claim the entire site omits freshness.

**Verified book passages.** Ross Anderson, *Security Engineering: A Guide to Building Dependable Distributed Systems*, third edition (Wiley, 2020), §4.3, “Who goes there? – simple authentication,” printed pp. 122–124 / PDF pp. 169–171. The supplied PDF's title and copyright pages verify author, subtitle, edition and year. Anderson describes an electricity meter that remembered only the last token: alternating two previously valid tokens allowed repeated acceptance. He then contrasts replay history with counters and discusses synchronization and rollover problems. Supporting reading: David Wong, *Real-World Cryptography*, 2021 edition (Manning), §3.3.3, “Replay attacks,” PDF pp. 140–143. Wong demonstrates replay of correctly tagged messages and a counter included in the authenticated input. **Printed pagination for Wong is unavailable in the supplied reflowed PDF; do not substitute these PDF numbers for printed pages.**

**Proposed change.** Add one compact “Replay the valid message” exercise to `modern.html`, linked from the AES security panel and `learn.html`. Let the visitor deliver token A, token B, then A again. Compare (a) valid-tag-only acceptance, (b) remembering only the previous token, and (c) an explicitly defined authenticated sequence number plus receiver state. Show tag validity and freshness acceptance as separate results. Include one reset scenario: forgetting receiver state under an unchanged key can restore replay acceptance. State the model's delivery-order assumption; a strict increasing counter is not a complete design for every transport. Explain that sender nonce uniqueness and receiver replay detection answer different questions. Replaying a captured ciphertext is not generating a second encryption under a reused nonce.

**Acceptance check.** A valid old message retains a valid tag but fails the stateful freshness policy; A/B/A defeats last-token-only checking; counter manipulation invalidates the tag; rejected input does not advance the accepted counter. A receiver reset visibly restores the model's vulnerability unless a new session/key context is established. Treat this as a teaching protocol, not deployable access control. Link the existing military freshness sentence to the exercise if useful.

<a id="ebr-14"></a>

### EBR-14 — Demonstrate ambiguous hash inputs

**Status: Proposed · P2 · Enhancement.**

**Current location/evidence.** `ciphers/sha256.html:78` explains collision resistance; line 88 explains compression and idealized work factors; line 93 explains length extension and HMAC. None of these sections explains that different field tuples can become the same byte string before hashing. There is no `data-cipher` demo placeholder on this page. `ciphers/zero-knowledge-proofs.html:135` already says, “Domain separation and unambiguous encodings matter.” The new addition would demonstrate that existing principle in the general hash exhibit, rather than add another unsupported warning.

**Verified book passage.** David Wong, *Real-World Cryptography*, 2021 edition (Manning), §2.5.4, “Avoid ambiguous hashing with TupleHash,” PDF pp. 120–123; printed pages unavailable in this reflowed copy. Wong's transaction example shifts a digit between the amount and fee fields while leaving the concatenated bytes unchanged; a signature over their hash consequently cannot distinguish the intended structured records. The section explains unambiguous serialization and motivates TupleHash.

**Proposed change.** Add a two-row worked example or small widget to `ciphers/sha256.html`: the field lists `["ab", "c"]` and `["a", "bc"]` both concatenate to `abc`. Show their identical raw input bytes and digest, then show a specified encoding with a fixed-width byte-length prefix for each UTF-8 field. The encoded messages differ and the example digests differ. Explain explicitly: this is an encoding ambiguity, **not a collision attack on SHA-256**, because the original hash inputs were identical. Mention TupleHash as one standardized construction for tuples without conflating it with SHA-256. Cross-link from the existing Fiat–Shamir context sentence and, optionally, RSA's signature discussion.

**Acceptance check.** Test the two ambiguous tuples, empty fields, a field containing a separator character, and non-ASCII UTF-8. Display lengths in bytes, not JavaScript UTF-16 code units. Encoding must recover the exact original tuple and reject incomplete lengths. Do not present ad hoc delimiter concatenation as generally safe. For the fixed example, confirm equal naive inputs/digests and distinct encoded inputs/digests. Do not generalize the latter into a mathematical guarantee that hashes never collide.

<a id="ebr-15"></a>

### EBR-15 — Explain purpose-separated HKDF outputs

**Status: Proposed · P2 · Enhancement.**

**Current location/evidence.** `ciphers/diffie-hellman.html:142` accurately says, “Protocols feed DH outputs through a key derivation function; this exhibit shows the underlying shared-value arithmetic.” `ciphers/sha256.html:153` mentions HKDF in its DH related card; `modern.html:80` and line 139 mention KDFs. The DH page explains shared-value arithmetic and toy parameters but has no Extract/Expand, role-label or output-length example. `tours/mathematics.json` ends at `modern.html` with the note “Number theory, elliptic curves, and computational hardness assumptions.” Thus this proposal fills the next-step gap; it does not claim the current pages wrongly use raw DH as a production key.

**Verified book passage.** David Wong, *Real-World Cryptography*, 2021 edition (Manning), §8.6, “Key derivation with HKDF,” PDF pp. 349–356; printed pages unavailable in this reflowed copy. The prose distinguishes extraction from expansion, explains optional public customization inputs, motivates deriving multiple secrets, and shows that requests differing only in output length produce prefixes of the same expanded output (especially PDF p. 354). The supplied copy interchanges the figure 8.7/8.8 references or captions: follow the prose and a verified specification when implementing; do not reproduce those captions blindly.

**Proposed change.** Add an optional “From a shared value to separate keys” panel after the DH arithmetic. Use a fixed, explicitly educational high-entropy input, show Extract then Expand, and compare labels such as `museum-demo/client-to-server` and `museum-demo/server-to-client`. Let visitors repeat an identical call, change the purpose label, and change only the requested length. Explain deterministic outputs, distinct uses, and the prefix relationship. Salt/info are not secret passwords and do not rescue a guessable input; the small DH arithmetic example remains insecure even if passed through HKDF. Link the panel from the current KDF sentence and the mathematics tour's final stop, without expanding that tour into a separate protocol syllabus.

**Acceptance check.** Verify the implementation with established HKDF test vectors before shipping. In the teaching fixture, identical parameters reproduce the same key; changing direction labels changes the example outputs; a 16-byte output equals the first 16 bytes of a 32-byte output when all other inputs match. Specify byte encoding for labels/context. Do not call derived keys mathematically independent or claim a KDF creates additional input entropy. Keep authentication/group-validation caveats already present.

<a id="ebr-16"></a>

### EBR-16 — Explain why ML-DSA aborts

**Status: Proposed · P2 · Enhancement.**

**Current evidence:** `hall-of-foundations/random-oracle.html:130` says: “ML-DSA uses SHAKE-based hashing and a construction often described as Fiat–Shamir with aborts.” It distinguishes constructions correctly, but neither this page's prose nor its inline interaction explains the abort condition. The polynomial-rings page explains multiplication and names the relevant assumptions; the zero-knowledge exhibit already covers Schnorr simulation and transcript binding. Repeating those lessons would add little.

**Book evidence:** Menezes, full title/version in the reading register, §7.1.4 Issue #5, printed pp.73–74 / PDF pp.86–87, including Figure 7.1. The response is `z = y + c*s1`. Bounded masking produces a shifted support: extreme output coefficients can constrain the secret-dependent shift `c*s1`. Repeating the sample until it lies in a common interior removes this particular edge leakage. The book explicitly distinguishes its explanatory interval from FIPS 204's stricter infinity-norm bound.

**Recommended change:** Add a short “Why abort a valid-looking response?” box after the current ML-DSA paragraph, with a small scalar interval illustration. Show two possible secret-dependent shifts before and after the same acceptance filter. Connect it to the existing Schnorr exhibit: modular uniform masking and bounded lattice responses have different distribution issues. State that this scalar illustration explains one reason for rejection; it neither implements ML-DSA nor proves the full protocol zero knowledge or secure. Link [Dilithium Reject](https://systemslibrarian.github.io/crypto-lab-dilithium-reject/), especially “Why Each Check Exists” and “Watch the Loop,” whose source-pinned catalog entry already documents bound examples and instrumented ML-DSA signing. Its existing histograms provide the larger experiment; a new Museum signing engine is unnecessary. Preserve the catalog caveat that retry histograms alone do not establish key leakage.

**Validation if implemented:** Exhaustively enumerate a small uniform integer mask and every allowed shift; compare exact conditional output distributions after acceptance. Include a negative control with filtering disabled and endpoint tests. Align any stated ML-DSA norm inequality with FIPS 204 Algorithm 7 line 23, and acknowledge that the real signer has additional rejection checks. No production cryptographic implementation is requested.

<a id="ebr-17"></a>

### EBR-17 — Explain KEM reencryption and implicit rejection

**Status: Proposed · P2 · Enhancement.**

**Current evidence:** `hall-of-foundations/learning-with-errors.html:203` says: “ML-KEM is a key-encapsulation mechanism with compression, a Fujisaki–Okamoto transform for chosen-ciphertext security, and rejection steps this page has no equivalent of.” `modern.html:214` correctly labels ML-KEM as key encapsulation. Neither passage shows the public ciphertext/secret shared-key outputs or explains the rejection mechanism. This is an acknowledged omission, not a misleading assertion that the current one-bit demo implements ML-KEM.

**Book evidence:** Menezes, §6.4, printed pp.64–66 / PDF pp.77–79; Algorithm 6.12 on printed p.65 / PDF p.78. Encapsulation derives a shared key and encryption randomness from sampled input and the public-key hash. Decapsulation decrypts, regenerates the candidate ciphertext, and chooses the candidate key or a secret-dependent fallback. The authentic-public-key requirement is explicit in the algorithm.

**Recommended change:** Add a compact three-stage diagram or table: KeyGen → public encapsulation key/private decapsulation key; Encaps → secret key plus public ciphertext; Decaps → recovered shared key. Then explain reencryption and implicit rejection on a correctly sized altered ciphertext. The fallback is deterministically derived from private `z` and ciphertext (`J(z || c)`), not fresh random bytes drawn on every failed call. An educational internal trace must be clearly separated from the real API: the standard does not export the implicit-rejection flag. Keep public input-validation failures distinct from this internal ciphertext-consistency check. Briefly connect the shared key to later symmetric cryptography and explain why authenticating the encapsulation key matters. Link [KEM Trap](https://systemslibrarian.github.io/crypto-lab-kem-trap/), specifically its cataloged “The Fujisaki–Okamoto branch” and malformed-length/caller lessons. Its existing full ML-KEM decapsulation supplies the experiment. The catalog warns that its separate truncated-comparison example is schematic and does not reproduce key recovery; do not describe that as breaking correct ML-KEM.

**Validation if implemented:** Check the diagram against FIPS 203 Algorithms 16–18 and external interfaces 19–21. If an existing lab is linked, verify its actual semantics: normal ciphertext agreement; repeat decapsulation of an identical rejected ciphertext under the same key produces the same fallback; altered correctly sized ciphertext takes the intended internal path; malformed-size inputs are treated separately. A toy teaching hash/model must remain labeled nonstandard. Do not promise that arbitrary tiny-model tampering always produces a different key—collisions remain possible.

<a id="ebr-18"></a>

### EBR-18 — Connect noisy equations to a q-ary lattice

**Status: Proposed · P2 · Enhancement.**

**Current evidence:** `hall-of-foundations/closest-vector.html:167` says: “The connection is geometric intuition: lattice attacks can turn noisy equations into decoding or short-vector problems.” It correctly names primal, dual and hybrid attacks and rejects equating them with the displayed two-dimensional task. The LWE page's opening (`:59`) explicitly samples square invertible matrices modulo 97. No current foundation passage constructs the integer lattice associated with a rectangular LWE system or states the unique-nearby-point promise.

**Book evidence:** Menezes, §4.3, Definition 4.15 and Theorem 4.16, printed pp.35–36 / PDF pp.48–49; §4.4.1, printed pp.37–38 / PDF pp.50–51. For prime `q` and an `m × n` matrix `A` of column rank `n` over the finite field `F_q`, with `m > n`, define `L_A = { y in Z^m : y = A z (mod q) for some z in Z^n }`. It is a full-rank integer lattice of volume `q^(m-n)`. For `b = A s + e (mod q)`, the integer lift `y = b - e` lies in that lattice and is close to `b`. Recovering that point lets one solve for `s` modulo q. Bounded-distance decoding adds a promise that the nearby point is unique.

**Recommended change:** Add a short derivation and a separately chosen, tiny rectangular example to the closest-vector/LWE transition, with a link back to the lattice definition. This supplies the missing reason these algebraic schemes are called lattice based. Do not retrofit the present square invertible demo into this exact illustration: for that `m=n` construction the ordinary `L_A` is all of `Z^n`, so this unaugmented lattice does not capture the page's small-secret search constraint. Keep the current small-secret enumeration demonstration; use a distinct small static rectangular example as the mathematical bridge. Link [Lattice Gentle](https://systemslibrarian.github.io/crypto-lab-lattice-gentle/) for its existing LWE residual/SIS and basis exercises, and optionally [Lattice Builder](https://systemslibrarian.github.io/crypto-lab-lattice-builder/) for the geometry-to-ML-KEM progression. The catalog establishes those activities, but not that either already displays this exact q-ary construction; do not assert that without checking the target section. No new lattice engine is proposed.

**Validation if implemented:** Enumerate the proposed tiny lattice in a bounded region, verify congruence membership and `b-y=e`, and explicitly check the closest-point uniqueness promise for the selected example. Include one boundary/tie example where uniqueness fails. Show that changing a modular representative does not change the lattice-membership result. Describe this as a primal-attack bridge only; it does not prove hardness, model every attack, or specify Module-LWE parameters.

<a id="ebr-19"></a>

### EBR-19 — Show Colossus clock, condition and count

**Status: Proposed · P2 · Enhancement.**

Current ciphers/colossus.html:61 says: “Punched paper tape supplied ciphertext. Electronic logic evaluated combinations of tape data and generated wheel patterns, while counters accumulated statistical scores.” Its synthetic experiment correctly states at line 64 that it does not emulate Colossus hardware.

**Evidence:** Good, Michie and Timms, *General Report on Tunny: With Emphasis on Statistical Methods* (1945), §53B, **printed pp.333–334 / PDF pp.327–328**, visually checked, describes tape sprocket holes controlling counting and electronic wheel movement, a friction-driven tape loop, and approximately 5,000 tape characters per second. §53F–G, **printed pp.337–338 / PDF pp.331–332** (p.331 visually checked; p.332 read as extracted text), describes independent counters and configurable thresholds selecting scores for printing. Gannon, *Colossus: Bletchley Park’s Greatest Secret* (2014), chapter 15, “Inventing the Electronic Computing Machine,” **converted PDF pp.153–156**, especially pp.154 and 156 (both visually checked), explains replacing the predictable wheel tape electronically and the surviving message tape’s timing role.

**Recommendation:** A bounded animation of tape clock → Boolean condition → counter → threshold-selected printout. Show electronic wheel-pattern generation instead of a second synchronized tape. Retain the current experiment’s teaching-model disclaimer.

**Check:** With a fixed tape and setting, playback speed changes elapsed time but not the final count. Verify a hand-countable condition and threshold example. Label 5,000 as tape characters per second, not keys or complete trials per second. Do not import broad invention-priority claims or assertions that valves never failed.

<a id="ebr-20"></a>

### EBR-20 — Explain implementation leakage conditions

**Status: Proposed · P2 · Enhancement.**

**Current evidence.** `ciphers/aes.html:93` already distinguishes secure AES from cache/timing leakage and protocol mistakes; `modern.html:216` mentions implementation attacks. `lab/modern-attack-evidence.html` already separates GPU search, faults and conditional-linear results. Those statements are useful and should remain. The missing connection in these inspected Museum sections is an explanation of how repeated physical measurements and a leakage model produce a key hypothesis.

**Book evidence.** Stefan Mangard, Elisabeth Oswald and Thomas Popp, *Power Analysis Attacks: Revealing the Secrets of Smart Cards* (Springer, 2007), introduction printed pp.1–13 / PDF pp.23–35; §3.3 printed pp.38–42 / PDF pp.58–62; §§6.1–6.2 printed pp.119–124 / PDF pp.138–143. The five-stage procedure selects a key-dependent intermediate value, associates known nonconstant data with aligned traces, predicts intermediates under small subkey hypotheses, applies a leakage model, then compares predictions with observations. Printed p.124 / PDF p.143 and its correlation formula were visually inspected.

**Recommended change.** Add a small evidence panel linking [Power Trace](https://systemslibrarian.github.io/crypto-lab-power-trace/) from the AES security discussion and contrasting passive power observation with active fault injection. Name the attack conditions: repeated executions under the relevant key, known associated inputs, alignment or an alignment method, an appropriate model, and adequate signal relative to noise. Explain `HD(a,b) = HW(a XOR b)` and why a hardware transition model may differ from the Hamming weight of one stored value. Neither is an exact identity for every device’s physical consumption.

Keep correlation/rank separate from recovery confirmed against a known answer. Noise, model mismatch and the acquisition setup affect the result; no universal trace count or recovery time follows. The book’s example acquisition is a particular implementation, not a claim that modern AES is mathematically broken. The current lab already computes real statistics over simulated leakage; the Museum need only explain and connect it. Measured-trace work is already planned as `RR-POWER-MEASURED` in Crypto Lab’s roadmap and should retain its provenance, independent ground-truth and negative-control requirements.

**Acceptance checks if implemented.** Ensure the panel labels measured and simulated evidence separately and distinguishes observation from induced faults. For any embedded illustration, state whether signed or absolute correlation is ranked, include a wrong input/trace association and a mismatched-model case, and treat zero-variance correlation as undefined rather than a successful result. Do not claim this report executed the existing Power Trace lab or certified hardware resistance.

<a id="ebr-21"></a>

### EBR-21 — Connect masking to joint leakage

**Status: Proposed · P2 · Enhancement.**

**Current evidence.** The Museum’s AES implementation caveat, entropy exhibit and secret-sharing material provide pieces of the explanation but no joint-leakage example in the inspected sections. The Crypto Lab catalog already describes [Masked Core](https://systemslibrarian.github.io/crypto-lab-masked-core/) with Boolean masks and first- versus second-order centered-product analysis. This is a Museum bridge to that existing experiment, not a request to duplicate it.

**Book evidence.** Mangard, Oswald and Popp, *Power Analysis Attacks: Revealing the Secrets of Smart Cards* (Springer, 2007), §9.1 printed pp.223–226 / PDF pp.240–243, especially §9.1.2 on two-share masking and §9.1.4 on the independence model; §10.1.1 printed pp.246–247 / PDF pp.263–264 on joint leakage and preprocessing. Printed p.226 / PDF p.243 was visually inspected. The source discusses mask reuse, bias and multiplicative masking limitations in §10.2; its implementation-era generalizations should not be copied as universal statements about modern masking.

**Recommended change.** Explain fresh uniform Boolean shares `m` and `v XOR m`: either share alone has a distribution independent of the secret byte `v`, while the pair determines `v`. Then show an original, exact Hamming-weight model illustration. For all 256 equally likely masks,

```text
E[HW(m)] = E[HW(v XOR m)] = 4
Cov(HW(m), HW(v XOR m)) = 2 - HW(v)/2
```

Thus the marginal means can stay unchanged while the joint statistic depends on the secret’s Hamming weight. This is not a unique secret-byte recovery formula: many byte values share one Hamming weight. It illustrates why checking only one leakage component or its mean is insufficient, then sends the visitor to the existing Masked Core experiment. The covariance formula is this review’s derived example, not a quotation or numbered theorem from the book.

**Checks already completed.** Exact integer/rational enumeration of all 65,536 `(v,m)` pairs confirmed both marginal means and the covariance formula for every byte value. Representative covariances: `v=0` gives 2; `v=1` gives 1.5; `v=15` gives 0; `v=255` gives −2.

**Acceptance checks if implemented.** Preserve the uniform fresh-mask and idealized leakage assumptions. Compare marginal distributions as well as means; show explicitly what combining observations changes. Add a biased/reused-mask control if expanding the exercise. Do not turn this two-share illustration into a security proof for a hardware implementation, a claim that all masking fails, or a claim that real leakage is exactly Hamming weight. Glitches, transitions and the chosen security model require separate analysis.

## Verification boundaries and source cautions

- **Reproduced now:** the Auto-Solve four-letter scoring defect; repeated-alphabet IC; the cited DES S1 DDT/key-filter examples; simple ambiguous-encoding and HKDF prefix fixtures; and the complete byte-mask covariance enumeration. These are research checks, not tests of newly implemented website features. No site implementation changed in this review.
- **Source-backed findings:** the Lorenz and Tutte corrections were checked against the relevant *General Report on Tunny* scans, with Gannon used for historical context. The books’ individual claims were not assumed infallible: Gannon’s converted p.95 contains an arithmetic slip (`574 = 14 × 41`), and Wong’s supplied figure 8.7/8.8 references/captions need reconciliation. Neither slip is imported into a recommendation.
- **PQC standards:** the relevant FIPS 203 and FIPS 204 publication pages and algorithm passages were consulted. FIPS 203 Algorithm 18 confirms deterministic implicit rejection; FIPS 204 Algorithm 7 gives the stricter accepted-response norm. The publication pages flag potential errata, but their linked spreadsheets could not be retrieved in this pass. Their contents are therefore unverified. Before implementing a standards-aligned exercise, inspect those errata rather than treating this conceptual review as conformance validation. Official publication pages: [FIPS 203](https://csrc.nist.gov/pubs/fips/203/final), [FIPS 204](https://csrc.nist.gov/pubs/fips/204/final).
- **Reading and coverage:** passages and exact locations are recorded above; no entire-book reading or renewed review of every Museum statement is claimed. The existing source register and frozen 214-page export retain their original scope. No new SIGSALY correction or current-quantum-security correction was established by the selected reading.
- **Implementation evidence is future work:** acceptance checks in each item specify what must pass if that item is implemented. They are not claims that the proposed UI, experiment or benchmark already exists or passed. Source excerpts support the lesson; they do not substitute for testing actual code.

## Maintaining this list

Use the stable EBR identifiers in follow-up commits or pull requests. Move an item from **Proposed** to **Implemented** only with the changed files and acceptance evidence; record **Verified** separately after checking the rendered result. A reasoned **Deferred** decision should name its dependency or limited value. Do not merge these 21 proposed packages into the completed 67-item denominator.

The [214-page audit export](README.md) remains the independent-review snapshot. This recommendations report is a separate dated supplement and is not included retroactively inside its frozen ZIP.
