const fs=require('node:fs'), path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('/Users/gmcas/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const DIR=__dirname, results=[], findings=[];
const HIST='No longer in use, or never confirmed broken/deciphered.';
function check(name,fn){try{fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.message});}}
async function snapshot(page){return page.evaluate(()=>({title:document.title,heading:document.querySelector('h1')?.textContent,artifacts:document.querySelectorAll('.artifact-card').length,artifactData:!!window.__ARTIFACT_CARDS__,badges:[...document.querySelectorAll('.trust-label')].map(n=>({text:n.textContent.trim(),title:n.title})),output:document.getElementById('historical-output')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth+1}));}
async function demo(page,slug,label){
 if(slug==='hagelin-c36'){
  const text=await page.locator('main').innerText();check(label+': M-209 described as a related simulation',()=>assert.match(text,/related machine, rather than pretending to reproduce every C-36 or C-52 configuration/));return;
 }
 const expected={nema:'HRSBVOOTZUCRWLMGRMGVWYWOVNF','turning-grille':'ABCEMDFGNOIHPJKL',myszkowski:'ROFOACDTEDSEEEACWEIVRLENE'}[slug];
 const plain={nema:'A'.repeat(27),'turning-grille':'ABCDEFGHIJKLMNOP',myszkowski:'WEAREDISCOVEREDFLEEATONCE'}[slug];
 await page.waitForFunction(()=>document.getElementById('historical-output')?.textContent.length>0);
 const out=await page.locator('#historical-output').innerText();check(label+': known ciphertext',()=>assert.equal(out,expected));
 await page.locator('#historical-use-output').click();const awaitedPlain=await page.locator('#historical-output').innerText();
 check(label+': actual decrypt control',()=>assert.equal(awaitedPlain,plain));
 await page.locator('[data-mode="encrypt"]').click();
 if(slug==='nema'){
  await page.locator('#nema-windows').fill('ABC');const invalid=await page.locator('#historical-output').innerText();check(label+': invalid windows clear stale result',()=>assert.equal(invalid,''));
  await page.locator('#nema-windows').fill('MQQPZQSOEV');await page.locator('#historical-message').fill('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  const cipher=await page.locator('#historical-output').innerText();check(label+': reflector prevents self-encryption',()=>assert([...cipher].every((c,i)=>c!=='ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i])));
  await page.locator('#historical-use-output').click();const decoded=await page.locator('#historical-output').innerText();check(label+': second live roundtrip',()=>assert.equal(decoded,'ABCDEFGHIJKLMNOPQRSTUVWXYZ'));
 }else if(slug==='turning-grille'){
  const masks=[];for(let r=0;r<4;r++){masks.push(await page.locator('#grille-grid button').evaluateAll(ns=>ns.flatMap((n,i)=>n.getAttribute('aria-pressed')==='true'?[i]:[])));await page.locator('#grille-rotate').click();}
  check(label+': four rotations visit all cells once',()=>assert.equal(new Set(masks.flat()).size,16));
  for(const n of [6,8]){await page.locator('#grille-size').selectOption(String(n));await page.locator('#historical-message').fill('HELLOX');await page.locator('#historical-use-output').click();const padded=await page.locator('#historical-output').innerText();check(label+`: ${n}x${n} roundtrip retains real and padding Xs`,()=>assert.equal(padded,'HELLOX'+'X'.repeat(n*n-6)));await page.locator('[data-mode="encrypt"]').click();}
  await page.locator('#grille-rotate').click();await page.locator('#grille-grid button').last().click();
  const pressed=await page.locator('#grille-grid [aria-pressed="true"]').count();check(label+': edited 8x8 mask remains valid',()=>assert.equal(pressed,16));
 }else{
  await page.locator('#myszkowski-key').fill('AAAAAAAA');await page.locator('#historical-message').fill('Café 123!');const identity=await page.locator('#historical-output').innerText();check(label+': tied-all-columns and text normalization',()=>assert.equal(identity,'CAFE'));
  await page.locator('#myszkowski-key').fill('ABCDEFGHIJKLMNOPQRSTUVWX');await page.locator('#historical-use-output').click();const decoded=await page.locator('#historical-output').innerText();check(label+': 24-letter key and incomplete row roundtrip',()=>assert.equal(decoded,'CAFE'));
  await page.locator('#myszkowski-key').fill('');const invalid=await page.locator('#historical-output').innerText();check(label+': invalid key clears result',()=>assert.equal(invalid,''));
 }
}
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const environment={browser:await browser.version(),playwright:require('/Users/gmcas/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/package.json').version,node:process.version};
 const snapshots=[];
 for(const pr of [1,2])for(const width of [1280,390]){
  const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'}),page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()+': '+r.failure()?.errorText));
  const base=`http://localhost:831${pr}`;
  const slugs=pr===1?['caesar','sigaba','vernam','aeneas-tacticus']:['nema','hagelin-c36','turning-grille','myszkowski'];
  for(const slug of slugs){
   errors.length=0;const label=`PR${pr}/${width}/${slug}`;await page.goto(base+`/ciphers/${slug}.html`,{waitUntil:'networkidle'});const snap=await snapshot(page);snapshots.push({label,...snap,errors:[...errors]});
   check(label+': no uncaught script errors',()=>assert.deepEqual(errors,[]));check(label+': no page-width overflow',()=>assert.equal(snap.overflow,false));
   if(pr===2){await page.screenshot({path:path.join(DIR,`${slug}-${width}.png`)});await demo(page,slug,label);if(slug!=='hagelin-c36')await page.locator('.demo-section').screenshot({path:path.join(DIR,`${slug}-${width}-demo.png`)});}
   const expected=slug==='aeneas-tacticus'?null:['sigaba','nema'].includes(slug)?'Historical Only':slug==='vernam'?'Secure (Modern)':'Broken';
   check(label+': canonical header',()=>assert.equal(snap.badges[0]?.text||null,expected));
   if(snap.artifacts!==1)findings.push({kind:'missing-online-artifact',label,artifactData:snap.artifactData,artifacts:snap.artifacts});
  }
  await page.goto(base+'/museum-map.html',{waitUntil:'networkidle'});const legends=await page.locator('.trust-legend__item').evaluateAll(ns=>ns.map(n=>({text:n.querySelector('.trust-label').textContent.trim(),title:n.querySelector('.trust-label').title,description:n.querySelector('.trust-legend__desc').textContent})));
  check(`PR${pr}/${width}: shared Historical legend`,()=>assert.deepEqual(legends.find(x=>x.text==='Historical Only'),{text:'Historical Only',title:HIST,description:HIST}));
  await page.goto(base+'/halls/ancient.html',{waitUntil:'networkidle'});const contextBadges=await page.locator('a.cipher-card[href="../ciphers/aeneas-tacticus.html"] .trust-label').count();check(`PR${pr}/${width}: context hall omits trust`,()=>assert.equal(contextBadges,0));
  for(const slug of ['sigaba','vernam','bletchley']){await page.goto(base+'/search.html?q='+slug,{waitUntil:'networkidle'});const card=page.locator(`.sr-card[href="ciphers/${slug==='bletchley'?'bletchley-park':slug}.html"]`);await card.waitFor();const text=await card.innerText();const badges=await card.locator('.trust-label').count();check(`PR${pr}/${width}: neutral search ${slug}`,()=>{assert(!text.includes('Broken:'));assert.equal(badges,slug==='bletchley'?0:1);if(slug!=='bletchley')assert(text.includes('Trust:'));});}
  await page.goto(base+'/comparison.html',{waitUntil:'networkidle'});await page.locator('#security-filter').selectOption('Historical Only');for(const slug of ['sigaba','navajo-code-talkers']){const row=page.locator('#cipher-tbody tr').filter({has:page.locator(`a[href="ciphers/${slug}.html"]`)});const text=await row.locator('.trust-label').innerText();check(`PR${pr}/${width}: comparison ${slug}`,()=>assert.equal(text,'Historical Only'));}
  await context.close();
 }
 // Delayed ordinary asset delivery exposes dependency-order races without source mutation.
 for(const pr of [1,2]){
  const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();
  await page.route('**/js/artifact-cards-data.min.js',async route=>{await new Promise(r=>setTimeout(r,350));await route.continue();});
  await page.goto(`http://localhost:831${pr}/ciphers/${pr===1?'caesar':'nema'}.html`,{waitUntil:'networkidle'});
  const snap=await snapshot(page);findings.push({kind:'delayed-artifact-dependency',pr,...snap});await context.close();
 }
 const offline=[];
 for(const pr of [1,2])for(const warm of [false,true]){
  const context=await browser.newContext({viewport:{width:390,height:900}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(new URL(r.url()).pathname+': '+r.failure()?.errorText));
  const base=`http://localhost:831${pr}`,slugs=pr===1?['caesar','sigaba']:['nema','hagelin-c36','turning-grille','myszkowski'];
  await page.goto(base+'/index.html',{waitUntil:'networkidle'});await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>navigator.serviceWorker.controller);
  if(warm)for(const slug of slugs)await page.goto(base+`/ciphers/${slug}.html`,{waitUntil:'networkidle'});
  const cached=await page.evaluate(async()=>{const names=await caches.keys();const out={};for(const n of names)out[n]=(await(await caches.open(n)).keys()).map(k=>new URL(k.url).pathname);return out;});
  await context.setOffline(true);
  for(const slug of slugs){errors.length=0;await page.goto(base+`/ciphers/${slug}.html`,{waitUntil:'networkidle'});const snap=await snapshot(page);offline.push({pr,warm,slug,cached,...snap,errors:[...errors]});if(pr===2){check(`PR2 offline ${warm?'warm':'cold'} ${slug}: correct exhibit HTML`,()=>assert(snap.heading.includes({nema:'NEMA','hagelin-c36':'Hagelin','turning-grille':'Grille',myszkowski:'Myszkowski'}[slug])));if(slug!=='hagelin-c36')await demo(page,slug,`PR2 offline ${warm?'warm':'cold'} ${slug}`);}await page.screenshot({path:path.join(DIR,`offline-pr${pr}-${warm?'warm':'cold'}-${slug}.png`)});}
  await context.close();
 }
 await browser.close();fs.writeFileSync(path.join(DIR,'browser-results.json'),JSON.stringify({environment,results,snapshots,findings,offline},null,2)+'\n');
 console.log(JSON.stringify({environment,checks:results.length,passed:results.filter(x=>x.pass).length,failures:results.filter(x=>!x.pass),findings,offline:offline.map(x=>({pr:x.pr,warm:x.warm,slug:x.slug,heading:x.heading,artifacts:x.artifacts,output:x.output,errors:x.errors}))},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
