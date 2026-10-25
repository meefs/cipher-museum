#!/usr/bin/env node
'use strict';
// Explicit model refresh, not part of routine metadata builds. No external corpus.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.join(__dirname,'..'),quad=Object.create(null),tri=Object.create(null),letters=Array(26).fill(0),sources=[];
let quadTotal=0,triTotal=0,letterTotal=0;
for(const file of fs.readdirSync(path.join(root,'ciphers')).filter(f=>f.endsWith('.html')).sort()){
  const html=fs.readFileSync(path.join(root,'ciphers',file),'utf8'),paragraphs=[];
  for(const m of html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)){
    const text=m[1].replace(/<[^>]+>/g,' ').replace(/&[a-z#0-9]+;/gi,' ').toUpperCase().replace(/[^A-Z]/g,'');
    if(!text)continue;paragraphs.push(text);const c=Array.from(text,x=>x.charCodeAt(0)-65);
    c.forEach(x=>{letters[x]++;letterTotal++;});
    for(let i=0;i<c.length-2;i++){const n=c[i]*676+c[i+1]*26+c[i+2];tri[n]=(tri[n]||0)+1;triTotal++;}
    for(let i=0;i<c.length-3;i++){const n=c[i]*17576+c[i+1]*676+c[i+2]*26+c[i+3];quad[n]=(quad[n]||0)+1;quadTotal++;}
  }
  sources.push({path:'ciphers/'+file,paragraphTextSha256:crypto.createHash('sha256').update(paragraphs.join('\n')).digest('hex')});
}
const data={version:1,id:'museum-prose-quadgram-v1',provenance:'Counts from English prose paragraphs in the public Cipher Museum exhibits at the reviewed implementation snapshot. Not an external historical-language corpus. No evaluation fixtures or keys are read by the builder.',normalization:'Remove markup and entities; uppercase ASCII A–Z; do not form n-grams across paragraph boundaries.',floorCount:0.1,frequencyPenalty:1.5,quadTotal,triTotal,letterTotal,letters,quad:Object.entries(quad).map(([n,c])=>[Number(n),c]),tri:Object.entries(tri).map(([n,c])=>[Number(n),c]),sources};
const out=path.join(root,'data/research/v1/language-model.json');fs.writeFileSync(out,JSON.stringify(data)+'\n');
console.log('Model snapshot: '+quadTotal+' quadgrams, '+data.quad.length+' distinct, '+fs.statSync(out).size+' bytes.');
