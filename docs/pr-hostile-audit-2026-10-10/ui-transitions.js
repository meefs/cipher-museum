const fs=require('fs'),assert=require('assert/strict');
const {chromium}=require('/Users/gmcas/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const plain='WEAREDISCOVEREDFLEEATONCE',results=[];
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try {for(const width of [1280,390]){
 const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'}),page=await context.newPage();
 await page.goto('http://localhost:8712/ciphers/myszkowski.html',{waitUntil:'networkidle'});
 const state=()=>page.evaluate(()=>({ranks:document.getElementById('myszkowski-ranks').textContent,columns:document.getElementById('myszkowski-grid').style.gridTemplateColumns,cells:[...document.getElementById('myszkowski-grid').children].map(n=>n.textContent),output:document.getElementById('historical-output').textContent,status:document.getElementById('historical-status').textContent,modes:[...document.querySelectorAll('[data-mode]')].map(n=>({mode:n.dataset.mode,active:n.classList.contains('active'),pressed:n.getAttribute('aria-pressed')}))}));
 for(const invalid of ['', 'A','123!']){
  await page.locator('[data-mode="encrypt"]').click();await page.locator('#historical-message').fill(plain);await page.locator('#myszkowski-key').fill('TOMATO');
  let s=await state();assert.equal(s.output,'ROFOACDTEDSEEEACWEIVRLENE');assert.deepEqual(s.cells.slice(0,6),['T 4','O 3','M 2','A 1','T 4','O 3']);assert.equal(s.cells.length,31);results.push({width,stage:'valid-TOMATO',...s});
  await page.locator('#myszkowski-key').fill(invalid);s=await state();assert.equal(s.ranks,'');assert.equal(s.columns,'');assert.equal(s.output,'');assert.deepEqual(s.cells,[]);assert.match(s.status,/keyword/);results.push({width,stage:'rejected',key:invalid,...s});
  await page.locator('#historical-use-output').click();assert.deepEqual(await state(),s,'Rejected state cannot reuse stale output');
  await page.screenshot({path:__dirname+`/invalid-myszkowski-${width}-${invalid||'empty'}.png`,animations:'disabled'});
  await page.locator('#myszkowski-key').fill('BANANA');s=await state();assert.equal(s.output,'ERDSOEEFEAOCWIREEAECVDLTN');assert.match(s.ranks,/2 1 3 1 3 1/);assert.deepEqual(s.cells.slice(0,6),['B 2','A 1','N 3','A 1','N 3','A 1']);assert.equal(s.cells.length,31);assert.match(s.status,/Encrypted 25/);results.push({width,stage:'recovered-BANANA',...s});
  await page.locator('#historical-use-output').click();s=await state();assert.equal(s.output,plain);assert.deepEqual(s.modes,[{mode:'encrypt',active:false,pressed:'false'},{mode:'decrypt',active:true,pressed:'true'}]);assert.match(s.status,/Decrypted 25/);results.push({width,stage:'decrypted-BANANA',...s});
 }
 await page.screenshot({path:__dirname+`/verified-myszkowski-${width}.png`,animations:'disabled'});await context.close();
}}finally{await browser.close();}
fs.writeFileSync(__dirname+'/ui-transition-results.json',JSON.stringify({results},null,2)+'\n');console.log(results.length+' real UI transition states verified, including mode classes and ARIA state.');
})().catch(e=>{console.error(e);process.exitCode=1;});
