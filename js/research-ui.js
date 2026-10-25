/* Evidence workbench: local files only; imported text is never inserted as HTML. */
'use strict';
(function () {
  const R = window.MuseumResearch, $ = id => document.getElementById(id);
  let doc = R.create(''), previous = null, imageURL = null, worker = null, receipt = null, searchGeneration = 0;
  const sourceFields = ['artifactId','archive','shelfmark','folio','transcriber','date','method','url','imageName'];
  function status(message, error = false) { $('record-status').textContent = message; $('record-status').dataset.error = String(error); }
  function guard(fn) { return function () { try { fn(); } catch (e) { status(e.message, true); } }; }
  function el(tag, text, parent) { const n = document.createElement(tag); n.textContent = text; if (parent) parent.appendChild(n); return n; }
  function download(name, value) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], {type:'application/json'}));
    const a = el('a', ''); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function pending() { return $('source-raw').value !== doc.raw; }
  function commit() {
    let next = R.revise(doc, $('source-raw').value, $('revision-reason').value);
    for (const f of sourceFields) next.source[f] = $('source-' + f).value;
    next = R.validate(next); previous = doc; doc = next; $('restore-record').disabled = false;
    $('revision-reason').value = ''; render();
  }
  function paintRegion(region) {
    const box = $('image-region'); box.hidden = !region || !imageURL;
    if (region) ['left','top','width','height'].forEach((f,i) => { box.style[f] = (region[i] * 100) + '%'; });
  }
  function clearImage() { if (imageURL) URL.revokeObjectURL(imageURL); imageURL = null; $('source-image').removeAttribute('src'); $('image-wrap').hidden = true; $('image-file').value = ''; }
  function render() {
    $('source-raw').value = doc.raw;
    sourceFields.forEach(f => { $('source-' + f).value = doc.source[f]; });
    $('revision-label').textContent = 'Current revision ' + doc.revision + ' · ' + Array.from(doc.raw).length + ' Unicode characters. Original transcription retained.';
    const revisions = $('revision-list'); revisions.replaceChildren();
    doc.revisions.forEach(r => { const d = el('details','',revisions); el('summary','Revision ' + r.id + ' — ' + r.reason,d); el('pre',r.raw,d); });
    const spans = $('span-list'); spans.replaceChildren();
    doc.spans.forEach(s => {
      const card = el('div','',spans); card.className = 'research-card';
      el('h3',s.id + ' · ' + s.type + (s.uncertain ? ' · unresolved' : ' · recorded reading'),card);
      el('p','Revision ' + s.revision + (s.revision === doc.revision ? ' (current)' : ' (earlier source; not moved to current text)') + ', characters ' + (s.start+1) + '–' + s.end + ': ' + s.literal,card);
      el('p','Alternatives: ' + (s.alternatives.join(' / ') || 'none recorded') + '. Reading: ' + (s.reading || 'unresolved') + '. Reason: ' + (s.reason || 'not recorded'),card);
      if (s.region) { el('p','Region image: '+s.imageName,card); const b = el('button','Show image region',card); b.type = 'button'; b.onclick = () => {
        if (!imageURL || !$('image-file').files[0] || $('image-file').files[0].name !== s.imageName) { paintRegion(null);status('Choose the recorded image '+s.imageName+' first. A matching filename is not an authenticity check.');return; }
        paintRegion(s.region);status('Region displayed. Verify the selected image against the archive source; filenames alone cannot establish identity.');
      }; }
    });
    const layers = $('layer-list'), parent = $('layer-parent'); layers.replaceChildren(); parent.replaceChildren();
    const op = el('option','Source revision ' + doc.revision,parent); op.value = 'revision-' + doc.revision;
    doc.layers.forEach(l => {
      if (l.revision === doc.revision) { const o = el('option',l.id + ' (' + l.kind + ')',parent); o.value = l.id; }
      const d = el('details','',layers); el('summary',l.id + ' · ' + l.kind + ' · revision ' + l.revision,d); el('p','Derived from ' + l.parent + '. ' + l.note,d); el('pre',l.text,d);
    });
    $('relations-list').textContent = JSON.stringify({keys:doc.keys,relations:doc.relations},null,2);
    paintRegion(null);
  }
  $('save-revision').onclick = guard(() => { commit(); status('Source and revision saved in this tab. Export the record to keep it after closing.'); });
  $('restore-record').onclick = guard(() => { if (previous) { const current = doc; doc = previous; previous = current; clearImage(); render(); status('Previous record restored. Press again to return to the other record.'); } });
  $('export-record').onclick = guard(() => { commit(); download('cipher-museum-evidence-v2.json', doc); status('Evidence record exported. Local image bytes are separate.'); });
  $('import-file').onchange = async function () {
    const file = this.files[0]; if (!file) return;
    try {
      if (file.size > 750000) throw new Error('Import is limited to 750,000 bytes.');
      const next = R.migrate(JSON.parse(await file.text())); previous = doc; doc = next; clearImage(); render(); $('restore-record').disabled = false;
      status('Imported version ' + doc.version + ' evidence record. Previous saved record is available with Restore.');
    } catch (e) { status('Import rejected; saved record retained. ' + e.message, true); }
    this.value = '';
  };
  $('image-file').onchange = function () {
    const file = this.files[0]; if (!file) return;
    if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 8000000) { status('Choose a PNG, JPEG or WebP image under 8 MB.',true); return; }
    if (imageURL) URL.revokeObjectURL(imageURL); imageURL = URL.createObjectURL(file);
    $('source-image').src = imageURL; $('image-wrap').hidden = false; $('source-imageName').value = file.name; paintRegion(null);
    status('Image opened locally. Save the source record to retain its filename; the image itself is not exported.');
  };
  $('source-image').onerror = () => { clearImage(); status('The selected file could not be decoded as an image.',true); };
  $('select-span').onclick = () => {
    const t = $('source-raw'); $('span-start').value = Array.from(t.value.slice(0,t.selectionStart)).length + 1;
    $('span-end').value = Array.from(t.value.slice(0,t.selectionEnd)).length;
    status('Selected text copied to character positions. Save any source change before adding a span.');
  };
  $('add-span').onclick = guard(() => {
    if (pending()) throw new Error('Save the revised source before annotating it.');
    const region = $('span-region').value.trim() ? JSON.parse('[' + $('span-region').value + ']') : null;
    if (region && $('source-imageName').value !== doc.source.imageName) throw new Error('Save the source image filename before attaching a region.');
    const next = R.annotate(doc,{start:Number($('span-start').value)-1,end:Number($('span-end').value),type:$('span-type').value,
      uncertain:$('span-uncertain').checked, alternatives:$('span-alternatives').value.split('\n').map(x=>x.trim()).filter(Boolean),
      reading:$('span-reading').value, reason:$('span-reason').value, region});
    previous = doc; doc = next; $('restore-record').disabled=false; render(); paintRegion(region); status('Evidence span appended. Earlier annotations remain in the record.');
  });
  $('add-layer').onclick = guard(() => {
    if (pending()) throw new Error('Save the source revision first.');
    const next = R.addLayer(doc,$('layer-kind').value,$('layer-parent').value,$('layer-text').value,$('layer-note').value);
    previous=doc;doc=next;$('restore-record').disabled=false;render();status('Derived reading appended; the source has not been overwritten.');
  });
  ['typed-key','key-input'].forEach(id=>$(id).addEventListener('input',()=>{$('key-output').textContent='Inputs changed. Apply the key again.';}));
  $('apply-key').onclick = guard(() => {
    const tokens=$('key-input').value.trim().split(/\s+/u).filter(Boolean);
    if (!tokens.length || tokens.length>3000) throw new Error('Use 1–3,000 whitespace-separated symbol IDs.');
    const result=R.applyKey(tokens,JSON.parse($('typed-key').value));
    $('key-output').textContent=result.text+'\n'+result.unresolved+' unresolved occurrences. Known-key application; no key recovery performed.';
  });
  $('save-key').onclick = guard(() => {
    const next=R.validate(doc), entries=JSON.parse($('typed-key').value); R.validateKey(entries);
    const id='key-'+(next.keys.length+1);next.keys.push({id,title:$('key-title').value,sourceUrl:$('key-source').value,entries});
    previous=doc;doc=R.validate(next);$('restore-record').disabled=false;render();status(id+' recorded. Add an evidence-backed relationship below if you applied it to a reading.');
  });
  $('add-relation').onclick = guard(() => {
    const next=R.validate(doc);next.relations.push({from:$('relation-from').value,to:$('relation-to').value,type:$('relation-type').value,evidence:$('relation-evidence').value});
    previous=doc;doc=R.validate(next);$('restore-record').disabled=false;render();status('Relationship and its supporting evidence recorded. External identifiers are allowed.');
  });
  let segmentation=null;
  function invalidateSegments() { segmentation=null;$('segment-output').textContent='Inputs changed. Recompute the alternatives.'; }
  ['segment-digits','segment-key','segment-locks','segment-budget','segment-score'].forEach(id=>$(id).addEventListener('input',invalidateSegments));
  $('segment-run').onclick=guard(()=>{
    const digits=$('segment-digits').value,key=JSON.parse($('segment-key').value),bounds=$('segment-locks').value.trim();
    const scoring=$('segment-score').value;
    const fit=scoring==='english' ? s=>{const letters=s.toUpperCase().replace(/[^A-Z]/g,'');return letters.length>=3 ? DetectiveLangModel.fitness(letters) : 0;} : ()=>0;
    segmentation=R.segment(digits,key,bounds?bounds.split(',').map(s=>Number(s.trim())):[],Number($('segment-budget').value),fit);
    const out=$('segment-output');out.replaceChildren();
    el('p',(segmentation.complete?'All paths explored.':'Budget reached; alternatives may be missing.')+' '+segmentation.total+' complete paths found; '+segmentation.retained+' retained. '+segmentation.visited+' search nodes visited. Scoring: '+scoring+'.',out);
    if (!segmentation.paths.length) el('p',segmentation.complete?'No path matches this key and these boundary locks. Every digit is unresolved.':'No complete path found within the budget. This is not proof that no path exists.',out);
    segmentation.paths.forEach(p=>{
      const d=el('div','',out);d.className='research-card';el('pre',p.codes.join(' | ')+' → '+p.text+'\nModel score: '+p.score.toFixed(2),d);
      const b=el('button','Record this segmentation as a hypothesis',d);b.type='button';b.onclick=guard(()=>{
        if(pending()||doc.raw!==digits)throw new Error('The saved source must be exactly these digits before attaching a segmentation. Copy them into the source and save a revision first.');
        const note='Known-key segmentation hypothesis. Key: '+JSON.stringify(key)+'. Mandatory boundaries: '+JSON.stringify(segmentation.boundaries)+'. Scoring: '+scoring+'. Choice does not establish a historical reading.';
        previous=doc;doc=R.addLayer(doc,'symbols','revision-'+doc.revision,p.codes.join(' | '),note);$('restore-record').disabled=false;render();status('Segmentation hypothesis appended; original digits retained.');
      });
    });
  });
  function stopSearch(message) { searchGeneration++;if(worker)worker.terminate();worker=null;receipt=null;$('search-run').disabled=false;$('search-cancel').disabled=true;$('search-export').disabled=true;$('search-results').replaceChildren();$('search-status').textContent=message; }
  ['search-raw','search-locks','search-seed','search-steps'].forEach(id=>$(id).addEventListener('input',()=>stopSearch('Inputs changed. Run a new search.')));
  $('search-cancel').onclick=()=>stopSearch('Search cancelled. No completed receipt was recorded.');
  $('search-run').onclick=guard(()=>{
    stopSearch('Starting local search…');const raw=$('search-raw').value;R.parseSymbols(raw);
    const options={seed:Number($('search-seed').value),steps:Number($('search-steps').value),locks:JSON.parse($('search-locks').value)};
    if(!window.Worker)throw new Error('This browser does not support the background worker required for search.');
    const started=performance.now(),generation=searchGeneration;worker=new Worker('../js/research-worker.js');$('search-run').disabled=true;$('search-cancel').disabled=false;
    worker.onerror=()=>{if(generation===searchGeneration)stopSearch('Search worker could not run. Reload online to cache its files, then try again.');};
    worker.onmessage=event=>{
      if(generation!==searchGeneration)return;
      if(event.data.error){stopSearch('Search rejected: '+event.data.error);return;}
      if(event.data.progress){$('search-status').textContent='Searching: '+event.data.progress.step+' / '+event.data.progress.steps+' steps.';return;}
      const r=event.data.result;worker.terminate();worker=null;$('search-run').disabled=false;$('search-cancel').disabled=true;
      receipt={version:1,kind:'cipher-museum-homophonic-search',raw,options,result:r,elapsedMs:Math.round(performance.now()-started)};
      $('search-export').disabled=false;$('search-status').textContent=(r.task==='known-key-application'?'Known-key application: all symbols were locked.':'Search completed; these are unverified candidates.')+' '+r.completedSteps+' mutation steps. Seed '+r.seed+'.';
      const out=$('search-results');out.replaceChildren();
      r.candidates.forEach((c,i)=>{const d=el('details','',out);d.open=i===0;el('summary','Candidate '+(i+1)+' · model score '+c.score.toFixed(2),d);el('pre',c.plaintext,d);el('pre',JSON.stringify(c.key,null,2),d);});
      const d=el('details','',out);el('summary','Best retained score by step',d);el('pre',r.trace.map(t=>t.step+': '+t.score.toFixed(2)).join('\n'),d);
    };worker.postMessage({raw,options});
  });
  $('search-export').onclick=()=>{if(receipt)download('homophonic-search-receipt.json',receipt);};
  $('search-example').onclick=()=>{
    stopSearch('Original generated exercise loaded. This is a public demonstration, not a blind historical test.');
    const plain='THESECRETLETTERISINTHECHESTTHEKEYISINTHELETTERREADTHELETTERTHENOPENTHECHEST';
    const ids=new Map();let next=1;
    $('search-raw').value=Array.from(plain).map((c,i)=>{const k=c+(i%2);if(!ids.has(k))ids.set(k,'s'+next++);return ids.get(k);}).join(' ');
    $('search-locks').value='{}';$('search-seed').value='41';$('search-steps').value='15000';
  };
  window.addEventListener('pagehide',()=>{if(worker)worker.terminate();if(imageURL)URL.revokeObjectURL(imageURL);});
  // Explicit handoff from Detective; never fetch source images or papers automatically.
  try {const v=sessionStorage.getItem('museum-evidence-import');if(v){doc=R.migrate(JSON.parse(v));sessionStorage.removeItem('museum-evidence-import');status('Imported your Detective transcription. Add source information, then export to keep the record.');}}catch(e){status('Could not read the Detective handoff: '+e.message,true);}
  render();
})();
