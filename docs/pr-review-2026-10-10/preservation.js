const fs=require('fs'),cp=require('child_process'),assert=require('assert/strict');
const roots=['/tmp/cipher-final-review-pr1','/tmp/cipher-final-review-pr2'], refs=['55266306b5904c743429288481aaa5cf09e709b8','663cbffe736b88353ac4d17ecff300c5d6ae665e'];
function old(root,ref,file){return JSON.parse(cp.execFileSync('git',['show',ref+':'+file],{cwd:root,encoding:'utf8',maxBuffer:5000000}));}
const reports=[];
for(let i=0;i<2;i++){
 const root=roots[i],ref=refs[i],report={pr:i+1,artifactChanges:[],searchChanges:[],removedSearch:[],newSearch:[]};
 const before=old(root,ref,'data/artifact-cards.json'),after=JSON.parse(fs.readFileSync(root+'/data/artifact-cards.json'));
 for(const [slug,card] of Object.entries(before.cards)){assert(after.cards[slug],slug+' preserved');for(const [key,value] of Object.entries(card)){if(key==='securityFailure'||key==='trust')continue;if(JSON.stringify(value)!==JSON.stringify(after.cards[slug][key]))report.artifactChanges.push({slug,key,before:value,after:after.cards[slug][key]});}}
 const bs=old(root,ref,'js/search-index.json').entries,as=JSON.parse(fs.readFileSync(root+'/js/search-index.json')).entries,am=new Map(as.map(e=>[e.u,e])),bm=new Map(bs.map(e=>[e.u,e]));
 for(const b of bs){const a=am.get(b.u);if(!a){report.removedSearch.push(b.u);continue;}for(const k of Object.keys(b)){if(['b','n','g','trust'].includes(k))continue;if(JSON.stringify(b[k])!==JSON.stringify(a[k]))report.searchChanges.push({u:b.u,field:k,before:b[k],after:a[k]});}}
 report.newSearch=as.filter(a=>!bm.has(a.u)).map(a=>a.u);report.counts={artifactBefore:Object.keys(before.cards).length,artifactAfter:Object.keys(after.cards).length,searchBefore:bs.length,searchAfter:as.length};
 if(i===1){const prev=old(root,ref,'data/exhibit-trust.json').exhibits,next=JSON.parse(fs.readFileSync(root+'/data/exhibit-trust.json')).exhibits;for(const e of prev)assert.deepEqual(next.find(n=>n.path===e.path),e,'Existing manifest identity and descriptive note preserved');report.preservedManifest=prev.length;}
 assert.deepEqual(report.removedSearch,[]);reports.push(report);
}
fs.writeFileSync(__dirname+'/preservation-results.json',JSON.stringify(reports,null,2)+'\n');console.log(JSON.stringify(reports,null,2));
