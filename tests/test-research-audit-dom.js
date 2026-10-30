'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom'),R=require('../js/research-model');
const root=path.join(__dirname,'..');
async function main(){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'lab/evidence-workbench.html'),'utf8'),{url:'https://ciphermuseum.com/lab/evidence-workbench.html',runScripts:'outside-only'});
 const w=dom.window,$=id=>w.document.getElementById(id),blobs=[];
 w.fetch=undefined;w.URL.createObjectURL=b=>{blobs.push(b);return 'blob:local-test';};w.URL.revokeObjectURL=()=>{};
 w.Blob=class{constructor(parts){this.parts=parts;}};
 w.document.addEventListener('click',e=>{if(e.target.tagName==='A')e.preventDefault();});
 for(const f of ['js/research-model.js','js/research-language-model.js','js/detective/lang-model.js'])w.eval(fs.readFileSync(path.join(root,f),'utf8'));
 w.eval(fs.readFileSync(process.env.RESEARCH_UI_SOURCE||path.join(root,'js/research-ui.js'),'utf8'));
 let d=R.addLayer(R.create('a b a'),'symbols','revision-1','a b a','Kept original grouping');
 const b=R.bundle(d,{title:'Round trip',created:'2026-10-30',selectedLayer:'layer-1',scoringModel:'historical-latin-classical',solver:'annealing',
  keyRevisions:[{at:'2026-10-29',reason:'Original analyst decision',locks:{a:'A'}}],
  search:{raw:'a b a',algorithm:'annealing',seed:0,steps:17,beam:150,locks:{a:'A'},elapsedMs:12},
  segmentation:{digits:'222',key:{2:'A',22:'N'},boundaries:[],budget:100,scoring:'neutral',lineBreaks:'boundary'},
  candidates:[{plaintext:'ANA',score:-1,key:{a:'A',b:'N'},chosen:true,provenance:'Original result'}]});
 const failures=[];
 try {
 Object.defineProperty($('bundle-import'),'files',{value:[{size:JSON.stringify(b).length,text:async()=>JSON.stringify(b)}],configurable:true});
 await $('bundle-import').onchange();
 assert.equal($('search-seed').value,'0','seed zero restores');
 assert.equal($('search-model').value,'historical-latin-classical','saved model restores even offline');
 assert.equal($('layer-parent').value,'layer-1','selected layer restores');
 $('bundle-export').click();
 let saved=JSON.parse(blobs.at(-1).parts.join(''));
 assert.deepEqual(saved.search,b.search,'recorded search receipt survives import/export');
 assert.deepEqual(saved.candidates,b.candidates,'candidate history survives import/export');
 assert.deepEqual(saved.keyRevisions,b.keyRevisions,'key decision history survives import/export');
 assert.equal(saved.selectedLayer,b.selectedLayer);assert.equal(saved.tool.scoringModel,b.tool.scoringModel);
 assert.equal(saved.stale.search,false);assert.equal(saved.stale.segmentation,false);
 $('search-seed').value='1';$('search-seed').dispatchEvent(new w.Event('input'));
 $('bundle-export').click();saved=JSON.parse(blobs.at(-1).parts.join(''));
 assert.equal(saved.stale.search,true);assert.equal(saved.stale.candidates,true);
 assert.deepEqual(saved.candidates,b.candidates,'editing inputs retains the historical candidate as stale');
 } catch(e){failures.push('Bundle round trip: '+e.message);}
 // Exercise the real UI view operation, then compare its pixel transform to the
 // independent original-image→overlay mapping. A clip-path on a full-size img fails.
 try {
 Object.defineProperty($('image-file'),'files',{value:[{name:'folio.png',type:'image/png',size:10}],configurable:true});
 Object.defineProperty($('source-image'),'naturalWidth',{value:2000});
 Object.defineProperty($('source-image'),'naturalHeight',{value:1500});
 await $('image-file').onchange();$('source-image').onload();$('image-register').click();
 for(const rotation of [0,90,180,270]){
  $('image-rotation').value=String(rotation);$('image-crop').value='.25, .25, .5, .5';$('image-apply-view').click();
  const a=R.displayAspect({id:'image-1',name:'folio.png',width:2000,height:1500,crop:[.25,.25,.5,.5],rotation});
  assert.equal($('image-view').getAttribute('viewBox'),`0 0 ${a.width} ${a.height}`);
  const matrix=$('image-pixels').getAttribute('transform').match(/matrix\((.*)\)/)[1].split(' ').map(Number);
  for(const region of [[.25,.25,.1,.1],[.65,.25,.1,.1],[.25,.65,.1,.1],[.65,.65,.1,.1]]){
   const expected=R.regionToDisplay({id:'image-1',name:'folio.png',width:2000,height:1500,crop:[.25,.25,.5,.5],rotation},region).box;
   const corners=[[region[0],region[1]],[region[0]+region[2],region[1]],[region[0],region[1]+region[3]],[region[0]+region[2],region[1]+region[3]]].map(([x,y])=>[(matrix[0]*2000*x+matrix[2]*1500*y+matrix[4])/a.width,(matrix[1]*2000*x+matrix[3]*1500*y+matrix[5])/a.height]);
   const xs=corners.map(p=>p[0]),ys=corners.map(p=>p[1]);
   const actual=[Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)];
   assert.ok(actual.every((v,i)=>Math.abs(v-expected[i])<1e-9),'actual SVG pixels and overlay agree for rotation'+rotation);
  }
 }
 } catch(e){failures.push('Displayed geometry: '+e.message);}
 const legacy=JSON.parse(JSON.stringify(b));legacy.version=1;legacy.tool.modelBuild='research-model-2026-10-29';
 legacy.search.producedWith=null;delete legacy.search.configurationFingerprint;
 Object.defineProperty($('bundle-import'),'files',{value:[{size:JSON.stringify(legacy).length,text:async()=>JSON.stringify(legacy)}],configurable:true});
 await $('bundle-import').onchange();$('bundle-export').click();
 const old=JSON.parse(blobs.at(-1).parts.join(''));
 assert.equal(old.legacyUnbound,true);assert.equal(old.stale.search,true);
 assert.equal(old.search.producedWith.modelBuild,'research-model-2026-10-29','legacy reported producer remains readable');
 if(failures.length){dom.window.close();throw new Error(failures.join('\n'));}
 dom.window.close();console.log('PASS bundle UI round trip, stale history, and real SVG crop/rotation wiring');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
