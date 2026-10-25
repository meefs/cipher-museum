'use strict';
importScripts('research-language-model.js', 'research-model.js');
let modelPromise;
self.onmessage = async function (event) {
  try {
    const input = event.data;
    if (typeof fetch !== 'function') throw new Error('This browser cannot load the scoring model.');
    if (!modelPromise) modelPromise = fetch('../data/research/v1/language-model.json').then(response => {
      if (!response.ok) throw new Error('Could not load the scoring model.'); return response.json();
    }).then(data => MuseumResearchLanguage.build(data));
    const model = await modelPromise;
    const result = MuseumResearch.search(MuseumResearch.parseSymbols(input.raw), input.options,
      model.fitness, progress => self.postMessage({ progress }));
    self.postMessage({ result });
  } catch (error) { self.postMessage({ error: error.message }); }
};
