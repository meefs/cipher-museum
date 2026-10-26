> Review handoff recorded before final integration. The main tracker and final validation record supersede pending integration notes below.

# Research cases handoff — items 43–46

Edited only ciphers/nfc-deployment.html, ciphers/sodark.html, ciphers/ua-8295.html, lab/modern-attack-evidence.html. No commits/pushes or shared ledger edits.

## NFC (full local primary revision 1.1, 28 August 2026)
Source: https://eprint.iacr.org/2026/100; local [local consulted sources]/nfc.pdf and nfc.txt.
- §12.1, PDF p.16: CMAC "offers protection against attackers injecting unauthorized commands"; relayed tearing depends on reader timing and interrupts genuine WRITE commands. Added this distinction, with storage configuration prerequisite.
- §14, PDF p.19: "no NTAG 224 DNA" and interpretations "should be treated as preliminary". Added visible warning that samples were NTAG223 StatusDetect; NTAG224 discussion is documentation/analogy, not measured hardware evidence.
- §17, PDF p.26: first segment has 2^27 average writes/auth attempts; two attempts/sec -> 777 days. Subsequent segments and five-million-write endurance experiment are separate. Existing accurate limitation retained.
- Corrected/expanded section/page locators.

## SoDark (full local primary ToSC paper)
Source: https://doi.org/10.46586/tosc.v2021.i3.36-53; local sodark.pdf/txt in source folder above.
- §3.4, journal pp.44–46 (PDF pp.9–11), distinguishes oracle generation for two tweaks from passive unique-tweak ALE frames. The latter requires about 2^21.9 three-word frames at 50% success. §3.5 retains the data complexity for eight rounds.
- Table4 p.49/PDF p.14: GPU known plaintext 2^12.7, GPU chosen ciphertext 2^8, each 42 minutes; table caption explicitly 50% success. §4 six Nvidia GPUs; brute-force whole keyspace five days. Existing measurements preserved and specifically identified as Table4, avoiding conflation with §3.6's differing pair/tuple accounting.
- Added oracle-model restriction to small tuple number and separate passive collection paragraph. Collection time is additional to computation.
- §5 does not demonstrate sixteen-round 3G break. Existing scope retained.

## UA-8295 (primary abstract/record only; full paper inaccessible)
Source: https://eprint.iacr.org/2026/1309 (web ref turn243view1). Abstract verifies forensic backdoor design study and Backdoor Conjecture methodology; record says Preprint, last revision 2026-09-22. Full PDF inaccessible (root and this research received 403; no reliable full primary substitute obtained).
- Removed unverified original/replacement cipher specifics, checksum/interface claims, hardware/sample/memory/timing figures, and purported full-PDF locators. Reframed title/body around verified forensic research question and intent inference, with one explicit public scope paragraph.
- Root will remove generated trust label and align data/exhibit-trust.json note; this agent did not edit shared metadata.

## Modern attack evidence
GPU source: https://research.sabanciuniv.edu/id/eprint/51583/1/GPU%20Assisted.pdf (web turn243view2 / turn252view0).
- Primary p.2 explicitly repeats 64-bit key twice, not independent128-bit search; §3/4/5 and Tables5–8 separate measured GPU throughput, TMTO prep, and extrapolated full search. §6 states SPECK96 brute force impractical. TEA3 target. Existing prose sound; added reachable institutional fulltext.
GEA sources: https://eprint.iacr.org/2026/1806 (turn245view1) and https://pure.bit.edu.cn/en/publications/practical-differential-fault-attacks-on-the-gprs-standard-ciphers/ (turn244search3).
- ePrint publication info: "Published elsewhere. Minor revision." BIT record: peer-reviewed IEEE TDSC23(3)7129–7142, 2026-05-01, DOI10.1109/TDSC.2026.3671957. Corrected misleading preprint-only status.
- Abstract verifies random fault model, simulated full attacks on ChipWhisperer Lite, within16min/common laptop. Full PDF403; removed unsupported detailed voltage-glitch/single-bit/reinitialization/GEA2M claims, retained explicit tested-model vs universal-phone limit.
Conditional DES: obtained full journal PDF via curl https://tosc.iacr.org/index.php/ToSC/article/download/7302/6476; local conditional-des.pdf/txt in source folder.
- Table1, PDFp.5: 2^41.90 data AND time, 85% known-plaintext model.
- §4.7 PDFpp.30–31 replaces full key search with counting keys preceding correct one; §4.7.1 PDFp.34 reports79 full-DES runs, data collection several hours/48threads and count analysis ~1min; complete search would add hours. Clarified actual measurement rather than implying repeated complete recoveries, corrected locators.

## Checks
Passed: HTMLHint all4edited pages, git diff --check, tests/test-local-links.js (214files,6501links,0broken), tests/test-research-workbench.js. No new implementation tests for prose changes. Root should integrate shared source/trust/coverage metadata and regenerate indexes after concurrent work completes.

## Source ledger integration
Amended existing IDs: NFC-2026-REV1.1, SODARK-2021. Added missing identities after complete key/title/URL scan: UA8295-2026, GEA-FAULTS-2026, GPU-SEARCH-2025, CONDITIONAL-DES-2018. GEA publication/ePrint/institutional records are one work identity. Other source records preserved; no coverage or tracker changes.
