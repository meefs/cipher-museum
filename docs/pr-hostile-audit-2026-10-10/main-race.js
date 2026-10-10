const fs=require('fs'),cp=require('child_process'),assert=require('assert/strict');
const {JSDOM}=require('/tmp/cipher-hostile-20261010-pr1/node_modules/jsdom');
const base='55266306b5904c743429288481aaa5cf09e709b8',read=rel=>cp.execFileSync('git',['show',base+':'+rel],{encoding:'utf8'}),cases=[];
for(const dataFirst of [true,false]){
 const dom=new JSDOM('<main id="main-content"><header class="page-hero">Caesar</header></main>',{runScripts:'outside-only',url:'http://localhost/ciphers/caesar.html'});
 const scripts=['js/artifact-cards-data.min.js','js/artifact-cards.js'];if(!dataFirst)scripts.reverse();scripts.forEach(rel=>dom.window.eval(read(rel)));
 const count=dom.window.document.querySelectorAll('.artifact-card').length;assert.equal(count,dataFirst?1:0);assert(dom.window.__ARTIFACT_CARDS__);cases.push({base,dataFirst,cards:count});dom.window.close();
}
fs.writeFileSync(__dirname+'/main-race-results.json',JSON.stringify(cases,null,2)+'\n');console.log('Main also loses renderer-first cards, while data-first succeeds.');
