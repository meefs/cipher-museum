/* Finite probability models for the OTP exhibit, not an encryption tool. */
'use strict';
(function(global){
  function distribution(rows,left,right){
    const joint=new Map(),a=new Map(),b=new Map();
    for(const row of rows){const x=left(row),y=right(row),key=JSON.stringify([x,y]);
      joint.set(key,(joint.get(key)||0)+row.p);a.set(x,(a.get(x)||0)+row.p);b.set(y,(b.get(y)||0)+row.p);}
    let information=0,distance=0;
    for(const [x,px] of a)for(const [y,py] of b){
      const p=joint.get(JSON.stringify([x,y]))||0,independent=px*py;
      if(p>0)information+=p*Math.log2(p/independent);
      distance+=Math.abs(p-independent)/2;
    }
    return {information:Math.abs(information)<1e-12?0:information,distance};
  }
  function binary(priorZero,padOne){
    if(![priorZero,padOne].every(x=>Number.isFinite(x)&&x>=0&&x<=1))throw new Error('Probabilities must be between0 and1.');
    const rows=[];
    for(let m=0;m<2;m++)for(let k=0;k<2;k++)rows.push({m,k,c:m^k,p:(m?1-priorZero:priorZero)*(k?padOne:1-padOne)});
    const ciphertext=[0,1].map(c=>rows.filter(r=>r.c===c).reduce((sum,r)=>sum+r.p,0));
    const posteriorZero=ciphertext.map((p,c)=>p?rows.filter(r=>r.m===0&&r.c===c).reduce((sum,r)=>sum+r.p,0)/p:null);
    return {rows,ciphertext,posteriorZero,information:distribution(rows,r=>r.m,r=>r.c).information,
      pairwiseDistance:Math.abs(1-2*padOne),decryptionError:0};
  }
  function twoMessages(fresh){
    const rows=[],count=fresh?256:64;
    for(let m1=0;m1<4;m1++)for(let m2=0;m2<4;m2++)for(let k1=0;k1<4;k1++){
      for(let j=0;j<(fresh?4:1);j++){const k2=fresh?j:k1;rows.push({m1,m2,c1:m1^k1,c2:m2^k2,p:1/count});}
    }
    const joint=distribution(rows,r=>r.m1+','+r.m2,r=>r.c1+','+r.c2);
    return {count,singleInformation:distribution(rows,r=>r.m1,r=>r.c1).information,
      jointInformation:joint.information,jointDistance:joint.distance};
  }
  const api={binary,twoMessages};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  global.MuseumSecrecy=api;
  if(typeof document==='undefined'||!document.getElementById('secrecy-model'))return;
  const $=id=>document.getElementById(id),fmt=x=>x===null?'undefined (impossible observation)':x.toFixed(5);
  function render(){
    const r=binary(Number($('secrecy-prior').value),Number($('secrecy-bias').value));
    $('secrecy-joint').replaceChildren();
    r.rows.forEach(row=>{const tr=document.createElement('tr');[row.m,row.k,row.c,fmt(row.p)].forEach(value=>{const td=document.createElement('td');td.textContent=String(value);tr.appendChild(td);});$('secrecy-joint').appendChild(tr);});
    $('secrecy-result').textContent='Ciphertext probabilities: C=0: '+fmt(r.ciphertext[0])+', C=1: '+fmt(r.ciphertext[1])+'. '+
      'Pr(M=0 | C=0): '+fmt(r.posteriorZero[0])+'. Pr(M=0 | C=1): '+fmt(r.posteriorZero[1])+'. '+
      'Mutual information I(M;C): '+fmt(r.information)+' bits. Pairwise ciphertext total-variation distance: '+fmt(r.pairwiseDistance)+'. Decryption error:0.';
    const t=twoMessages($('secrecy-fresh').checked);
    $('secrecy-reuse-result').textContent=t.count+' equally likely message/message/pad outcomes. '+
      'Single-message I(M₁;C₁): '+fmt(t.singleInformation)+' bits. Joint I((M₁,M₂);(C₁,C₂)): '+fmt(t.jointInformation)+' bits. '+
      'Distance between the joint message/ciphertext-pair distribution and the product of its marginals: '+fmt(t.jointDistance)+'.';
  }
  ['secrecy-prior','secrecy-bias','secrecy-fresh'].forEach(id=>$(id).addEventListener('change',render));
  render();
})(typeof window!=='undefined'?window:globalThis);
