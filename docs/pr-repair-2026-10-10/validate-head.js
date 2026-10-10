const fs=require('node:fs'),cp=require('node:child_process'),path=require('node:path');
const root=process.argv[2],label=process.argv[3],base=process.argv[4];
const sha=cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const results=[];
const commands=[
 ['npm-test',['npm','test']],['html-lint',['npm','run','lint:html']],
 ['corpus-schema',['npm','run','validate:corpus']],
 ['generators',[process.execPath,path.join(__dirname,'generator-checks.js'),root,label]],
 ['diff-check',['git','diff','--check']],['base-diff-check',['git','diff','--check',base,'HEAD']]
];
for(const[name,[command,...args]]of commands){
 const started=new Date().toISOString(),out=fs.openSync(path.join(__dirname,`${label}-${name}.log`),'w');
 const result=cp.spawnSync(command,args,{cwd:root,stdio:['ignore',out,out]});fs.closeSync(out);
 results.push({name,command:[command,...args],exit:result.status,started,ended:new Date().toISOString()});
 console.log(`${label} ${name}: exit ${result.status}`);
}
const trackedStatus=cp.execFileSync('git',['status','--porcelain','--untracked-files=no'],{cwd:root,encoding:'utf8'});
fs.writeFileSync(path.join(__dirname,`${label}-validation.json`),JSON.stringify({sha,node:process.version,platform:process.platform,architecture:process.arch,base,results,trackedStatus},null,2)+'\n');
if(results.some(r=>r.exit!==0)||trackedStatus)process.exitCode=1;
