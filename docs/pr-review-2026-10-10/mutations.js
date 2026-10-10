const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=process.argv[2],label=process.argv[3],node=process.execPath,results=[];
const tracked=cp.execFileSync('git',['ls-files','-z'],{cwd:root}).toString().split('\0').filter(Boolean),original=new Map(tracked.map(f=>[f,fs.readFileSync(path.join(root,f))]));
const read=f=>fs.readFileSync(path.join(root,f),'utf8'); const write=(f,s)=>fs.writeFileSync(path.join(root,f),s);
function replace(f,a,b){assert(read(f).includes(a),'Mutation anchor exists: '+f);write(f,read(f).replace(a,b));}
function restore(){for(const [f,b] of original){const actual=fs.readFileSync(path.join(root,f));if(!actual.equals(b))fs.writeFileSync(path.join(root,f),b);}}
function json(f,fn){const x=JSON.parse(read(f));fn(x);write(f,JSON.stringify(x,null,2)+'\n');}
function test(name,mutate,script,expectReject=true){restore();let r;try{mutate();r=cp.spawnSync(node,[script],{cwd:root,encoding:'utf8',maxBuffer:4000000});}finally{restore();}const passed=(r.status!==0)===expectReject;fs.writeFileSync(__dirname+'/'+label+'-mutation-'+name+'.log',r.stdout+r.stderr);results.push({name,script,exit:r.status,expected:expectReject?'reject':'accept',pass:passed,diagnostic:(r.stdout+r.stderr).split('\n').filter(s=>/Assertion|Error|❌|actual|expected|reserved|legacy|context|Historical|SECURE|Security|Chaocipher|Legend|coverage/.test(s)).slice(0,12)});console.log(JSON.stringify(results.at(-1)));}
if(label==='pr1'){
 test('unauthorized-secure',()=>json('data/exhibit-trust.json',x=>x.exhibits.find(e=>e.path==='ciphers/caesar.html').label='secure'),'tests/test-trust-labels.js');
 test('secure-identity',()=>json('data/exhibit-trust.json',x=>x.exhibits.find(e=>e.number===36).number=999),'tests/test-trust-labels.js');
 test('restore-broken',()=>json('data/exhibit-trust.json',x=>x.exhibits.find(e=>e.path==='ciphers/scytale.html').label='historical'),'tests/test-trust-labels.js');
 test('context-hall-badge',()=>replace('halls/ancient.html','<div class="card-name">Aeneas','<span class="trust-label trust-label--broken">Broken</span><div class="card-name">Aeneas'),'tests/test-trust-labels.js');
 test('legacy-caesar-badge',()=>replace('ciphers/caesar.html','<h1','<span class="badge sec-historical">Historical Only</span><h1'),'tests/test-trust-labels.js');
 test('historical-definition',()=>json('data/trust-labels.json',x=>x.historical.description='Old and secure.'),'tests/test-trust-labels.js');
 test('search-prefix',()=>replace('search.html',"meta.push('Trust: '","meta.push('Broken: '"),'tests/test-trust-labels.js');
 test('comparison-sigaba',()=>{const s=read('comparison.html'),re=/(href:'ciphers\/sigaba\.html'[^\n]*security:)"Historical Only"/;assert(re.test(s));write('comparison.html',s.replace(re,'$1"Secure (Modern)"'));},'tests/test-trust-labels.js');
 test('artifact-chaocipher',()=>json('data/artifact-cards.json',x=>x.cards.chaocipher.securityFailure='Never cryptanalytically broken.'),'tests/test-trust-labels.js');
 test('legend',()=>replace('museum-map.html','<p class="trust-legend__desc">No longer in use, or never confirmed broken/deciphered.</p>','<p class="trust-legend__desc">Historically secure.</p>'),'tests/test-trust-labels.js');
 test('sw-stamp',()=>replace('sw.js',"cipher-museum-9664d4d3","cipher-museum-00000000"),'tests/test-sw-version.js');
 test('sw-crlf',()=>replace('scripts/sw-version.js',"bytes.toString('utf8').replace(/\\r\\n/g, '\\n')","bytes.toString('utf8')"),'tests/test-sw-version.js');
 test('sw-binary',()=>replace('scripts/sw-version.js',"/\\.(css|js|json|svg|webmanifest)$/i.test(rel)","true"),'tests/test-sw-version.js');
 test('timing-coverage',()=>replace('tests/engines/scaling.js','assert.equal(judged, total,','assert(judged >= 40,'),'tests/engines/scaling-canary.js');
}else{
 test('nema-wiring',()=>replace('js/historical-ciphers.js','NSKITCOYMVWAUJDRLZXHFQEGPB','SNKITCOYMVWAUJDRLZXHFQEGPB'),'tests/test-historical-exhibits.js');
 test('grille-direction',()=>replace('js/historical-ciphers.js','return col * size + size - 1 - row;','return (size - 1 - col) * size + row;'),'tests/test-historical-exhibits.js');
 test('myszkowski-ties',()=>replace('js/historical-ciphers.js','const groups = [...new Set(key)].sort();','const groups = [...key].sort();'),'tests/test-historical-exhibits.js');
 test('offline-page-coverage',()=>replace('sw.js',"  '/ciphers/nema.html',\n",''),'tests/test-historical-exhibits.js');
 test('wrong-prose-label',()=>replace('ciphers/nema.html','Its <strong>Historical Only</strong> classification','Its <strong>Broken</strong> classification'),'tests/test-trust-labels.js',false);
 test('wrong-prose-label-historical',()=>replace('ciphers/nema.html','Its <strong>Historical Only</strong> classification','Its <strong>Broken</strong> classification'),'tests/test-historical-exhibits.js',false);
}
restore();const dirty=cp.execFileSync('git',['status','--porcelain','--untracked-files=no'],{cwd:root,encoding:'utf8'});assert.equal(dirty,'','All temporary source mutations restored');fs.writeFileSync(__dirname+'/'+label+'-mutation-results.json',JSON.stringify(results,null,2)+'\n');if(results.some(x=>!x.pass))process.exitCode=1;
