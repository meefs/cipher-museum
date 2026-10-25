'use strict';
(async function () {
  const $=id=>document.getElementById(id),R=window.MuseumResearch;
  let fixture=null,timer=null;
  function stop(){if(timer)clearInterval(timer);timer=null;$('route-play').textContent='Play route';}
  function render(){
    if(!fixture)return;
    const route=R.z340Route($('route-kind').value),n=Number($('route-step').value),read=new Set(route.slice(0,n));
    Array.from($('route-grid').children).forEach((cell,i)=>{cell.dataset.read=String(read.has(i));cell.dataset.current=String(n>0&&route[n-1]===i);});
    const plain=route.slice(0,n).map(i=>fixture.key[fixture.ciphertext[i]]).join('');
    $('route-output').textContent=plain||'No symbols read yet.';
    $('route-position').textContent=n+' / 153 symbols'+(n?' · current source row '+(Math.floor(route[n-1]/17)+1)+', column '+(route[n-1]%17+1):'');
    $('route-verification').textContent=n<153?'Complete the route to compare with the published diplomatic reading.':plain===fixture.expectedDiplomatic?'Exact match to the published first-section diplomatic reading. This verifies a known-key replay, not a new recovery.':'Does not match the published reading. The same consistent key on a different route is insufficient.';
  }
  $('route-kind').onchange=()=>{stop();$('route-step').value='0';render();};
  $('route-step').oninput=()=>{stop();render();};
  $('route-next').onclick=()=>{stop();$('route-step').value=String(Math.min(153,Number($('route-step').value)+1));render();};
  $('route-complete').onclick=()=>{stop();$('route-step').value='153';render();};
  $('route-play').onclick=()=>{
    if(timer){stop();return;}
    if(Number($('route-step').value)===153)$('route-step').value='0';
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){$('route-step').value='153';render();return;}
    $('route-play').textContent='Pause route';timer=setInterval(()=>{$('route-step').value=String(Number($('route-step').value)+1);render();if(Number($('route-step').value)>=153)stop();},100);
  };
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',stop);
  $('route-workbench').onclick=()=>{
    if(!fixture)return;
    try{
      const d=R.create(fixture.ciphertext);d.source={...d.source,artifactId:'Z340:1969-11-08:rows1-9',archive:'Published solver transcription',folio:'First nine rows',method:fixture.convention,url:fixture.transcriptionUrl};
      d.keys.push({id:'key-1',title:'Published Z340 refined substitution key',sourceUrl:fixture.sourceUrl,entries:Object.entries(fixture.key).map(([symbol,value])=>({symbol,type:'letter',values:[value]}))});
      const route=R.z340Route($('route-kind').value),transposed=route.map(i=>fixture.ciphertext[i]).join(' ');
      const next=R.addLayer(d,'symbols','revision-1',transposed,'Route hypothesis: '+$('route-kind').value+'. '+fixture.sourceLocator);
      sessionStorage.setItem('museum-evidence-import',JSON.stringify(next));location.href='evidence-workbench.html';
    }catch(e){$('route-verification').textContent='Could not transfer the record: '+e.message;}
  };
  try{
    if(typeof fetch !== 'function') throw new Error('This browser does not support loading the source fixture.');
    const response=await fetch('../data/research/v1/z340-section-1.json');if(!response.ok)throw new Error('Could not load the source fixture.');
    fixture=await response.json();
    Array.from(fixture.ciphertext).forEach((symbol,i)=>{const cell=document.createElement('span');cell.className='route-cell';cell.textContent=symbol;cell.title='Row '+(Math.floor(i/17)+1)+', column '+(i%17+1)+'; symbol '+symbol+' → '+fixture.key[symbol];$('route-grid').appendChild(cell);});
    $('route-key').textContent=JSON.stringify(fixture.key,null,2);$('route-controls').disabled=false;render();
  }catch(e){$('route-verification').textContent=e.message+' Reload online to cache the historical replay.';}
})();
