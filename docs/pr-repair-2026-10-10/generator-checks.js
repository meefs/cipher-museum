const fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.argv[2],label=process.argv[3];
function command(args){const r=cp.spawnSync(process.execPath,args,{cwd:root,encoding:'utf8'});console.log('$ node '+args.join(' ')+'\n'+r.stdout+r.stderr);assert.equal(r.status,0);}
function hashes(){return Object.fromEntries(cp.execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean).map(rel=>[rel,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel))).digest('hex')]));}
const original=hashes();
for(const script of ['build-trust-labels','build-search-index','build-artifact-cards'])command([`scripts/${script}.js`,'--check']);
command(['tests/test-min-fresh.js']);command(['tests/test-sw-version.js']);
const passes=[];
for(let iteration=1;iteration<=2;iteration++){
 for(const script of ['build-trust-labels','build-search-index','build-artifact-cards','build-counts','build-min'])command([`scripts/${script}.js`]);
 const next=hashes(),changed=Object.keys(original).filter(rel=>original[rel]!==next[rel]);passes.push({iteration,changed});assert.deepEqual(changed,[],`${label}: generators changed the exact reviewed head`);
}
fs.writeFileSync(path.join(__dirname,`${label}-generator-results.json`),JSON.stringify({trackedFiles:Object.keys(original).length,passes},null,2)+'\n');
console.log(`${label}: initial freshness and both generator passes preserve every tracked byte.`);
