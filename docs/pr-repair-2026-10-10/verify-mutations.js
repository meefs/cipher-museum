const fs=require('node:fs'),cp=require('node:child_process'),path=require('node:path'),assert=require('node:assert/strict');
const root='/tmp/cipher-repair-20261010-mutation',results=[];
const head = pr => cp.execFileSync('git',['rev-parse','HEAD'],{cwd:`/tmp/cipher-repair-20261010-pr${pr}`,encoding:'utf8'}).trim();
function clean(){assert.equal(cp.execFileSync('git',['status','--porcelain','--untracked-files=no'],{cwd:root,encoding:'utf8'}),'');}
function checkout(sha){clean();cp.execFileSync('git',['checkout','--detach',sha],{cwd:root,stdio:'pipe'});clean();}
function mutate(name,files,script,prepare,diagnostic){
 const backups=Object.fromEntries(files.map(f=>[f,fs.readFileSync(path.join(root,f))]));
 try {
  prepare();const r=cp.spawnSync(process.execPath,[script],{cwd:root,encoding:'utf8'});
  const log=r.stdout+r.stderr;fs.writeFileSync(path.join(__dirname,`mutation-${name}.log`),log);
  assert.equal(r.status,1,`${name}: regression must be rejected`);assert(log.includes(diagnostic),`${name}: protected assertion must fail`);
  results.push({name,sha:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),command:[process.execPath,script],exit:r.status,diagnostic});
 } finally {for(const[f,b]of Object.entries(backups))fs.writeFileSync(path.join(root,f),b);clean();}
}
function replace(file,a,b){const p=path.join(root,file),s=fs.readFileSync(p,'utf8');assert(s.includes(a));fs.writeFileSync(p,s.replace(a,b));}
checkout(head(1));
mutate('old-artifact-renderer',['js/artifact-cards.js'],'tests/test-artifact-loading.js',()=>{
 fs.writeFileSync(path.join(root,'js/artifact-cards.js'),cp.execFileSync('git',['show','663cbffe736b88353ac4d17ecff300c5d6ae665e:js/artifact-cards.js'],{cwd:root}));
},'rendering survives either dependency order');
mutate('silent-artifact-publisher',['js/artifact-cards-data.min.js'],'tests/test-artifact-loading.js',()=>{
 fs.writeFileSync(path.join(root,'js/artifact-cards-data.min.js'),cp.execFileSync('git',['show','663cbffe736b88353ac4d17ecff300c5d6ae665e:js/artifact-cards-data.min.js'],{cwd:root}));
},'rendering survives either dependency order');
mutate('threshold20',['tests/engines/scaling.js'],'tests/engines/scaling-canary.js',()=>{
 replace('tests/engines/scaling.js','const RATIO_LIMIT = 10;','const RATIO_LIMIT = 20;');
},'Missing expected exception: The production guard must reject real quadratic work');
mutate('missing-offline-metadata',['sw.js'],'tests/test-sw-version.js',()=>{
 replace('sw.js',"  '/js/artifact-cards-data.min.js',\n",'');
 cp.execFileSync(process.execPath,['-e',"const fs=require('fs'),{swVersionFor}=require('./scripts/sw-version');const p='sw.js',s=fs.readFileSync(p,'utf8');fs.writeFileSync(p,s.replace(/const VERSION = '[^']*';/,\"const VERSION = '\"+swVersionFor(process.cwd())+\"';\"));"],{cwd:root});
},'shared exhibit dependencies are precached');
checkout(head(2));
for(const[slug,explanation,wrong]of [
 ['nema','It presents an obsolete machine and makes no claim of modern security.','Its <strong>Broken</strong> classification records an obsolete machine; it makes no claim of modern security.'],
 ['hagelin-c36','Public attacks exist against members of the cipher family; those results are not a blanket statement about identical internals or attacks across all variants.','This lineage carries <strong>Historical Only</strong> because public attacks exist against members of the cipher family.']
])mutate(`independent-${slug}-classification`,[`ciphers/${slug}.html`],'tests/test-historical-exhibits.js',()=>replace(`ciphers/${slug}.html`,explanation,wrong),'classification statements must use canonical badges');
mutate('stale-myszkowski-caption',['js/historical-demos.js'],'tests/test-historical-exhibits.js',()=>{
 replace('js/historical-demos.js',"        $('myszkowski-grid').style.gridTemplateColumns = '';\n        $('myszkowski-ranks').textContent = '';\n",'');
},'Rejected key clears derived rank explanation');
clean();fs.writeFileSync(path.join(__dirname,'after-mutation-results.json'),JSON.stringify({results,allRestored:true},null,2)+'\n');
console.log(`${results.length} deliberate regressions rejected by the intended assertions; all source restored.`);
