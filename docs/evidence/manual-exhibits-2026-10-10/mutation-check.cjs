'use strict';
// Run only against the disposable worktree path passed as argv[2].
const fs=require('fs'),path=require('path'),{spawnSync,execFileSync}=require('child_process');
const root=path.resolve(__dirname,'../../..'),wt=path.resolve(process.argv[2]||'');
if(!process.argv[2]||wt===root)throw Error('Pass a disposable worktree; never mutate the main checkout.');
const cases=[
 ['RS44 physical-column readout instead of ranks','js/ciphers/all-engines.js','k.order.indexOf((firstRank-1+i)%25+1)','(readColumn+i)%25',['--test','tests/engines/specs/rasterschluessel44.spec.js'],'RS44: original March 1944 examples'],
 ['Double Playfair drops second substitution','js/ciphers/all-engines.js','substitute(capture ? stage1.result : stage1,false)','stage1',['--test','tests/engines/specs/doublePlayfair.spec.js'],'Double Playfair: complete December 1941 example'],
 ['Double Playfair reverts J to generic single I','js/ciphers/all-engines.js',"input.replace(/J/g,'II')","input.replace(/J/g,'I')",['--test','tests/engines/specs/doublePlayfair.spec.js'],'Double Playfair: malformed keys'],
 ['AMSCO flattened alternation breaks even widths','js/ciphers/all-engines.js','(row+col)%2','(row*k.order.length+col)%2',['--test','tests/engines/specs/amsco.spec.js'],'AMSCO: ACA p32 complete example'],
 ['Invalid UI retains old caption','js/manual-cipher-demos.js','if (el) el.replaceChildren();',"if (el && id !== 'manual-caption') el.replaceChildren();",['tests/test-manual-cipher-exhibits.js'],'invalid input clears derived state manual-caption'],
 ['Cold offline omits engine bundle','sw.js',"  '/js/ciphers/all-engines.min.js',\n",'', ['tests/test-manual-cipher-exhibits.js'],'cold-offline script js/ciphers/all-engines.min.js'],
 ['Stale Quick Facts denominator','ciphers/rs44.html','<td>165 of 167</td>','<td>165 of 164</td>',['tests/test-counts.js'],'Quick Facts'],
 ['Production timing guard weakened to 20x','tests/engines/scaling.js','const RATIO_LIMIT = 10;','const RATIO_LIMIT = 20;',['tests/engines/scaling-canary.js'],'The production guard must reject real quadratic work']
];
const out={testedHead:execFileSync('git',['rev-parse','HEAD'],{cwd:wt,encoding:'utf8'}).trim(),node:process.version,results:[]};
for(const [name,file,before,after,args,expected] of cases){
 const p=path.join(wt,file),original=fs.readFileSync(p);
 if(!original.toString().includes(before))throw Error('Mutation anchor missing: '+name);
 try{
  fs.writeFileSync(p,original.toString().replace(before,after));
  const r=spawnSync(process.execPath,args,{cwd:wt,encoding:'utf8',timeout:180000});
  const output=(r.stdout||'')+(r.stderr||'');
  const caught=r.status!==0&&output.includes(expected);
  out.results.push({name,file,command:'node '+args.join(' '),exitCode:r.status,rejected:caught,guard:expected,evidence:output.slice(-6000)});
  console.log(name+': '+(caught?'rejected':'NOT REJECTED'));
 }finally{fs.writeFileSync(p,original);}
}
out.restored=execFileSync('git',['status','--porcelain'],{cwd:wt,encoding:'utf8'}).trim()==='';
fs.writeFileSync(path.join(__dirname,'mutations.json'),JSON.stringify(out,null,2)+'\n');
if(out.results.some(r=>!r.rejected)||!out.restored)process.exitCode=1;
