const fs = require('node:fs'), assert = require('node:assert/strict');
const { chromium } = require('/Users/gmcas/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const phase = process.argv[2], repaired = phase === 'after', results = [];
// Explicit ports keep the immutable reviewed trees separate from repair trees.
const url = pr => `http://localhost:${(repaired ? 8710 : 8610) + pr}`;
const expected = { nema: 'HRSBVOOTZUCRWLMGRMGVWYWOVNF', 'turning-grille': 'ABCEMDFGNOIHPJKL', myszkowski: 'ROFOACDTEDSEEEACWEIVRLENE' };
const plain = { nema: 'A'.repeat(27), 'turning-grille': 'ABCDEFGHIJKLMNOP', myszkowski: 'WEAREDISCOVEREDFLEEATONCE' };
(async () => {
 const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
 try {
  for (const pr of [1,2]) for (const width of [1280,390]) {
   for (const delayed of ['artifact-cards-data.min.js', 'artifact-cards.js']) {
    const c = await browser.newContext({ viewport: {width,height:900}, serviceWorkers: 'block' });
    const p = await c.newPage(), errors = [];
    p.on('pageerror', e => errors.push(e.message));
    await p.addInitScript(() => { window.__auditOrder = []; });
    await p.route('**/js/artifact-cards*.js', async route => {
     const basename = new URL(route.request().url()).pathname.split('/').pop();
     const kind = basename.includes('data') ? 'data' : 'renderer';
     const response = await route.fetch();
     if (basename === delayed) await new Promise(r => setTimeout(r,350));
     await route.fulfill({response, body: 'window.__auditOrder.push('+JSON.stringify(kind)+');\n'+await response.text()});
    });
    const slug = pr === 1 ? 'caesar' : 'nema';
    await p.goto(url(pr)+`/ciphers/${slug}.html`, {waitUntil:'networkidle'});
    const order = await p.evaluate(() => window.__auditOrder);
    assert.deepEqual(order, delayed.includes('data') ? ['renderer','data'] : ['data','renderer']);
    const first = await p.locator('.artifact-card').count();
    assert.equal(first, !repaired && delayed.includes('data') ? 0 : 1);
    assert(await p.evaluate(() => !!window.__ARTIFACT_CARDS__));
    await p.addScriptTag({ url: url(pr)+'/js/artifact-cards.js' });
    await p.addScriptTag({ url: url(pr)+'/js/artifact-cards-data.min.js' });
    assert.equal(await p.locator('.artifact-card').count(),1,'Reloads must not duplicate the card');
    assert.deepEqual(errors,[]);
    results.push({pr,width,case:'artifact-loading-order',delayed,order,first,afterReload:1});
    await c.close();
   }
   const c = await browser.newContext({ viewport:{width,height:900}, serviceWorkers:'block' }), p = await c.newPage();
   if (pr === 2) {
    for (const slug of ['nema','hagelin-c36','turning-grille','myszkowski']) {
     await p.goto(url(pr)+`/ciphers/${slug}.html`,{waitUntil:'networkidle'});
     if(repaired) assert.equal(await p.locator('.artifact-card').count(),1);
     assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
     if(expected[slug]) {
      assert.equal(await p.locator('#historical-output').textContent(),expected[slug]);
      await p.locator('#historical-use-output').click();
      assert.equal(await p.locator('#historical-output').textContent(),plain[slug]);
     }
     if(slug==='myszkowski') {
      await p.locator('[data-mode="encrypt"]').click();
      await p.locator('#historical-message').fill(plain[slug]);
      for(const key of ['', 'A', '123!']) {
       await p.locator('#myszkowski-key').fill(key);
       const state = await p.evaluate(()=>({ranks:document.getElementById('myszkowski-ranks').textContent,grid:document.getElementById('myszkowski-grid').children.length,columns:document.getElementById('myszkowski-grid').style.gridTemplateColumns,output:document.getElementById('historical-output').textContent,status:document.getElementById('historical-status').textContent}));
       assert.equal(state.grid,0);assert.equal(state.output,'');assert.match(state.status,/keyword/);
       if(repaired){assert.equal(state.ranks,'');assert.equal(state.columns,'');}else assert(state.ranks.includes('4 3 2 1 4 3'));
       results.push({pr,width,case:'myszkowski-rejected-key',key,...state});
       await p.locator('#myszkowski-key').fill('TOMATO');
       assert.equal(await p.locator('#historical-output').textContent(),expected[slug]);
      }
      await p.locator('#myszkowski-key').fill('BANANA');
      assert.match(await p.locator('#myszkowski-ranks').textContent(),/2 1 3 1 3 1/);
      assert.equal(await p.locator('#historical-output').textContent(),'ERDSOEEFEAOCWIREEAECVDLTN');
      await p.locator('#historical-use-output').click();assert.equal(await p.locator('#historical-output').textContent(),plain[slug]);
     }
     if(repaired) await p.screenshot({path:__dirname+`/after-${slug}-${width}.png`});
    }
   }
   for(const slug of ['sigaba','vernam','bletchley-park']) {
    await p.goto(url(pr)+'/search.html?q='+slug,{waitUntil:'networkidle'});
    const card=p.locator(`.sr-card[href="ciphers/${slug}.html"]`);await card.waitFor();
    const text=await card.textContent();assert(!text.includes('Broken:'));
    assert.equal(await card.locator('.trust-label').count(),slug==='bletchley-park'?0:1);
    if(slug!=='bletchley-park')assert(text.includes('Trust:'));
   }
   if(repaired) {
    for(const slug of ['caesar','sigaba','vernam','aeneas-tacticus']) {
     await p.goto(url(pr)+'/ciphers/'+slug+'.html',{waitUntil:'networkidle'});
     assert.equal(await p.locator('.artifact-card').count(),1);
     const wanted={caesar:'Broken',sigaba:'Historical Only',vernam:'Secure (Modern)','aeneas-tacticus':null}[slug];
     const badge=p.locator('.artifact-card .trust-label');
     assert.equal(await badge.count(),wanted?1:0);
     if(wanted)assert.equal(await badge.textContent(),wanted);
     results.push({pr,width,case:'live-artifact-trust',slug,trust:wanted});
    }
    await p.goto(url(pr)+'/museum-map.html',{waitUntil:'networkidle'});
    const historical=p.locator('.trust-legend__item').filter({hasText:'Historical Only'});
    assert.equal(await historical.locator('.trust-legend__desc').textContent(),'No longer in use, or never confirmed broken/deciphered.');
    assert.equal(await historical.locator('.trust-label').getAttribute('title'),'No longer in use, or never confirmed broken/deciphered.');
    await p.goto(url(pr)+'/halls/ancient.html',{waitUntil:'networkidle'});
    assert.equal(await p.locator('a.cipher-card[href="../ciphers/aeneas-tacticus.html"] .trust-label').count(),0);
    await p.goto(url(pr)+'/comparison.html',{waitUntil:'networkidle'});await p.locator('#security-filter').selectOption('Historical Only');
    for(const slug of ['sigaba','navajo-code-talkers']) {
     const row=p.locator('#cipher-tbody tr').filter({has:p.locator(`a[href="ciphers/${slug}.html"]`)});
     assert.equal(await row.locator('.trust-label').textContent(),'Historical Only');
    }
    results.push({pr,width,case:'map-hall-comparison',pass:true});
   }
   await c.close();
  }
  for(const width of [1280,390]) {
   const c=await browser.newContext({viewport:{width,height:900}}),p=await c.newPage(),errors=[],allFailures=[];
   c.on('requestfailed',r=>allFailures.push({path:new URL(r.url()).pathname,serviceWorker:!!r.serviceWorker(),error:r.failure()?.errorText}));
   p.on('requestfailed',r=>errors.push(new URL(r.url()).pathname+': '+r.failure()?.errorText));
   await p.goto(url(2)+'/index.html',{waitUntil:'networkidle'});
   await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>navigator.serviceWorker.controller);
   const initial=await p.evaluate(async()=>{const o={};for(const n of await caches.keys())o[n]=(await(await caches.open(n)).keys()).map(r=>new URL(r.url).pathname);return o;});
   assert.equal(await p.evaluate(()=>!!window.__ARTIFACT_CARDS__),false,'Index must not preload metadata in page context');
   const cachePaths=Object.values(initial).flat();
   assert.equal(cachePaths.includes('/js/artifact-cards-data.min.js'),repaired);
   await c.setOffline(true);
   for(const slug of ['nema','hagelin-c36','turning-grille','myszkowski']) {
    errors.length=0;allFailures.length=0;await p.goto(url(2)+`/ciphers/${slug}.html`,{waitUntil:'networkidle'});
    const state=await p.evaluate(()=>({heading:document.querySelector('h1').textContent,artifacts:document.querySelectorAll('.artifact-card').length,data:!!window.__ARTIFACT_CARDS__,trust:document.querySelector('.artifact-card .trust-label')?.textContent,output:document.getElementById('historical-output')?.textContent}));
    assert.equal(state.artifacts,repaired?1:0);assert.equal(state.data,repaired);
    if(expected[slug]){assert.equal(state.output,expected[slug]);await p.locator('#historical-use-output').click();assert.equal(await p.locator('#historical-output').textContent(),plain[slug]);}
    if(repaired)assert.deepEqual(errors,[],'All cold-offline dependencies must be present');else assert(errors.some(e=>e.includes('artifact-cards-data.min.js')));
    results.push({pr:2,width,case:'fresh-profile-first-use-offline',slug,...state,errors:[...errors],allFailures:[...allFailures],initialCache:initial});
    if(repaired)await p.screenshot({path:__dirname+`/after-offline-${slug}-${width}.png`});
   }
   await c.close();
  }
 } finally { await browser.close(); }
 fs.writeFileSync(__dirname+`/${phase}-browser-results.json`,JSON.stringify({phase,results},null,2)+'\n');
 console.log(`${phase}: ${results.length} browser reproduction/verification cases passed.`);
})().catch(e=>{console.error(e);process.exitCode=1});
