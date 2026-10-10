'use strict';
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../../..');
const out=path.join(root,'docs/evidence/manual-exhibits-2026-10-10');
const vectors=require(path.join(root,'tests/engines/helpers/historical-vectors'));
const cases=[['rs44',vectors.rs44,'rs-row','0','5'],['double-playfair',vectors.doublePlayfair,'dp-a','AAAAAAAAAAAAAAAAAAAAAAAAA','HILQETUARSBKXFGPWCOZDVYMN'],['amsco',vectors.amsco,'amsco-key','41125','41325']];
const assert=(cond,msg)=>{if(!cond)throw new Error(msg);};
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const result={testedHead:require('child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),node:process.version,browser:browser.version(),origin:'http://localhost:8714',checks:[],failures:[]};
 try{
  for(const [label,viewport] of [['desktop',{width:1280,height:900}],['mobile',{width:390,height:844}]]){
   const context=await browser.newContext({viewport,reducedMotion:'reduce'}), page=await context.newPage();
   const errors=[], failed=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',req=>failed.push({url:req.url(),error:req.failure().errorText}));
   for(const [slug,v,invalidId,bad,good] of cases){
    await page.goto(result.origin+'/ciphers/'+slug+'.html',{waitUntil:'networkidle'});
    await page.waitForSelector('.artifact-card');
    assert(await page.locator('.artifact-card').count()===1,slug+' artifact exactly once');
    assert(await page.locator('#manual-output').textContent()===v.cipher,slug+' source vector');
    await page.locator('#manual-step').focus();await page.keyboard.press('Enter');
    assert(await page.evaluate(()=>document.activeElement.id)==='manual-step','keyboard step focus');
    await page.locator('#manual-play').click();assert(await page.locator('#manual-progress-output').textContent()===v.cipher,'complete animation');
    await page.locator('#manual-use-output').click();assert(await page.locator('#manual-output').textContent()===v.plain,slug+' decryption');
    await page.locator('#'+invalidId).fill(bad);
    for(const id of ['manual-output','manual-grid','manual-caption','manual-progress-output','manual-animation-status'])assert(await page.locator('#'+id).textContent()==='',slug+' stale '+id);
    await page.locator('#'+invalidId).fill(good);assert(await page.locator('#manual-output').textContent()===v.plain,slug+' recovery');
    const dimensions=await page.evaluate(()=>({viewport:innerWidth,body:document.documentElement.scrollWidth}));assert(dimensions.body<=dimensions.viewport+1,slug+' body overflow '+JSON.stringify(dimensions));
    await page.locator('[data-mode="encrypt"]').click();await page.locator('#manual-message').fill(v.plain);await page.locator('#manual-play').click();
    await page.screenshot({path:path.join(out,label+'-'+slug+'.png'),fullPage:true});
    result.checks.push({viewport:label,page:slug,sourceVector:true,roundtrip:true,invalidRecovery:true,keyboardFocus:true,reducedMotion:true,artifactCards:1,dimensions});
   }
   // Normal-motion Play/Pause uses the real timed path rather than only reduced motion.
   await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('#manual-reset').click();await page.locator('#manual-play').click();
   await page.waitForFunction(()=>/^2 \/|^3 \//.test(document.querySelector('#manual-animation-status').textContent));await page.locator('#manual-play').click();
   const paused=await page.locator('#manual-animation-status').textContent();await page.waitForTimeout(400);assert(await page.locator('#manual-animation-status').textContent()===paused,'Pause holds');
   assert(errors.length===0,JSON.stringify(errors));assert(failed.length===0,JSON.stringify(failed));
   result.checks.push({viewport:label,normalPlayPause:true,pageErrors:errors,failedRequests:failed});await context.close();
  }
  // FRESH profile. No new exhibit or metadata visited before offline.
  const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'}), page=await context.newPage();
  const failed=[],errors=[];page.on('requestfailed',req=>failed.push({url:req.url(),error:req.failure().errorText}));page.on('pageerror',e=>errors.push(e.message));
  await page.goto(result.origin+'/',{waitUntil:'networkidle'});
  await page.evaluate(async()=>{await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Service worker activation timeout')),20000))]);});
  await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
  const installed=await page.evaluate(async()=>({worker:navigator.serviceWorker.controller.scriptURL,caches:await caches.keys()}));
  await context.setOffline(true);
  for(const [slug,v] of cases){
   await page.goto(result.origin+'/ciphers/'+slug+'.html',{waitUntil:'networkidle'});await page.waitForSelector('.artifact-card');
   assert(await page.locator('.artifact-card').count()===1,'offline '+slug+' artifact');assert(await page.locator('#manual-output').textContent()===v.cipher,'offline '+slug+' vector');
   await page.locator('#manual-use-output').click();assert(await page.locator('#manual-output').textContent()===v.plain,'offline '+slug+' decryption');
   await page.locator('#manual-play').click();assert(await page.locator('#manual-progress-output').textContent()===v.plain,'offline '+slug+' animation');
   result.checks.push({freshProfileOffline:true,page:slug,sourceVector:true,decryption:true,animation:true,artifactCards:1});
  }
  assert(errors.length===0,JSON.stringify(errors));assert(failed.length===0,JSON.stringify(failed));
  result.offline={installed,failedRequests:failed,pageErrors:errors,exhibitsPreviouslyVisited:false,metadataPreviouslyVisited:false};await context.close();
 }catch(e){result.failures.push(e.stack);process.exitCode=1;}
 finally{await browser.close();fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));}
})();
