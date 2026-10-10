# Collection counts

`data/exhibit-trust.json` is the existing authoritative exhibit identity source.
Its `collection` and `interactive` fields now also own collection totals; no
parallel exhibit manifest is maintained. Trust classification is a separate
field and does not determine collection membership.

- **Total exhibits**: every unique registered exhibit ID/path, including people,
  institutions, history, culture, mathematics and cryptographic constructions.
- **Cipher and history exhibits** (`cipher-history`): the main collection,
  including ciphers, machines, people, places and cultural subjects. This is not
  a count of encryption algorithms. New historical exhibits append IDs after
  §164; earlier IDs stay fixed.
- **Foundations exhibits** (`foundations`): mathematical exhibits in the annex,
  §141–157. Its landing page is not an exhibit.
- **Protocols and constructions** (`protocols`): §158–160, ECDSA, Shamir's Secret
  Sharing and Zero-Knowledge Proofs. The label includes signatures and secret
  sharing rather than implying all three are encryption ciphers or protocols.
- **Registered engines**: keys in `window.CipherEngines`, evaluated without a DOM.
  Engines and exhibits are different units; some exhibits have bespoke math or
  visualization code outside this registry.
- **Interactive exhibits**: entries marked `interactive: true` with an on-page
  working demo or controllable visualization. This includes the Rosetta and
  Dorabella viewers, mathematical and protocol interactives, and the historical
  demos. Static explanatory pages and navigation controls do not qualify.
  It is a count of exhibits with an interactive, not of buttons, widgets or
  reversible encryption algorithms. The cipher/history subset is reported
  separately. The previous main-collection demo count omitted working visualizations.
  Review also identified the Bible Code ELS controls and the annex’s PNT and
  entropy sliders; these count as interactives, not encryption engines.

Run `npm run build:counts` to render current totals into owned static surfaces:
count slots, meta descriptions, roster headings, search fallback, README current
inventory sections, and global “Exhibit X of Y” chips. `node
scripts/build-counts.js --check` fails for stale output. Search entries carry
canonical IDs and collection membership instead of counting descriptive kinds.
`tests/test-counts.js` checks registrations, output freshness, idempotence and
number preservation. Historical prose, dated release summaries, corpus record
accounting and archived audit results are outside this generator's ownership.

Order after changing registrations: counts → trust labels → search/artifact
metadata → minified bundles and service-worker version. Full validation remains
`npm test`, `npm run test:engines`, `npm run lint:html` and corpus replay.

The comparison table is a curated subset and includes historical/cultural context.
`comparisonExhibits` counts its actual registered rows, validates every row against
the same collection identities, and generates its heading and metadata. Undated
specifications remain undated and sort after dated entries.
