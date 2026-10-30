'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const root=process.env.EVIDENCE_ROOT||path.join(__dirname,'..');
const document=file=>new JSDOM(fs.readFileSync(path.join(root,file),'utf8')).window.document;
let failures=0;
function test(name,fn){try{fn();console.log('PASS '+name);}catch(e){failures++;console.error('FAIL '+name+': '+e.message);}}
const attack=document('lab/modern-attack-evidence.html'),fields=document('hall-of-foundations/finite-fields.html'),ua=document('ciphers/ua-8295.html');
test('quantum quantities and assumption boundary stay attached',()=>{
 const q=attack.querySelector('#quantum-resources');assert.ok(q,'resource card exists');
 const rows=Object.fromEntries([...q.querySelectorAll('tbody tr')].map(r=>[r.querySelector('th').textContent,r.querySelector('td').textContent]));
 const number=s=>Number(s.replace(/[^0-9.]/g,''));
 assert.equal(number(rows['Algorithmic logical qubits']),1433);assert.equal(number(rows['Physical cat qubits']),22593);
 assert.equal(Math.round(number(rows['Quantum time per shot'])*number(rows['Expected shots'])/24*100)/100,number(rows['Expected total quantum time']));
 assert.match(q.textContent,/negligible bit flips/);assert.match(q.textContent,/not a guaranteed deadline/);
 assert.match(q.textContent,/not.*measurement/);assert.match(q.textContent,/eight orders/);
});
test('FPGA evidence keeps distinguisher and full recovery separate',()=>{
 const p=attack.querySelector('#aes-historical-evidence');assert.ok(p);
 assert.match(p.textContent,/hypothesis\/set distinguisher feasibility/);
 assert.match(p.textContent,/not an observed end-to-end full AES-key recovery/);
 assert.match(p.textContent,/7,000/);assert.match(p.textContent,/nearby physical EM probe/);
 assert.match(p.textContent,/promised for a later version/);
});
test('hardware-relative assurance and arithmetic scope survive summaries',()=>{
 const p=fields.querySelector('#assurance');assert.match(p.textContent,/execution and observation model/);
 assert.match(p.textContent,/JIT.*hardware/);assert.match(p.textContent,/toy curves are not all prime-order/);
 assert.match(p.textContent,/one multiplication for five field additions/);
 assert.doesNotMatch(p.textContent,/formulas cost more field multiplications/);
});
test('measured memory is distinct from a hypothetical 640KiB port',()=>{
 const paragraphs=[...ua.querySelectorAll('.evidence-claim')];
 const p=paragraphs.find(p=>/memory-minimized/.test(p.textContent));assert.ok(p);
 assert.equal(p.querySelector('[data-kind]').dataset.kind,'inference');
 assert.match(p.textContent,/3\.3\s*MiB/);assert.match(p.textContent,/640\s*KiB/);
 assert.match(p.textContent,/do not demonstrate that port/);
});
if(failures)process.exitCode=1;
