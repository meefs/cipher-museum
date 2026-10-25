'use strict';
(function(global){
  function build(data){
    if(!data||data.id!=='museum-prose-quadgram-v1'||data.version!==1)throw new Error('Unsupported homophonic language model.');
    const qfloor=Math.log(data.floorCount/data.quadTotal),tfloor=Math.log(data.floorCount/data.triTotal);
    const quad=new Float64Array(26**4).fill(qfloor),tri=new Float64Array(26**3).fill(tfloor);
    data.quad.forEach(([i,n])=>{quad[i]=Math.log(n/data.quadTotal);});data.tri.forEach(([i,n])=>{tri[i]=Math.log(n/data.triTotal);});
    const letterLogs=data.letters.map(n=>Math.log(n/data.letterTotal));
    function fitness(text){
      const n=text.length,counts=new Uint16Array(26);let score=0,last=0;
      for(let i=0;i<n;i++){
        const c=text.charCodeAt(i)-65;if(c<0||c>25)throw new Error('Language model accepts uppercase A–Z only.');counts[c]++;
        last=(last%17576)*26+c;
        if(i>=3)score+=quad[last];else if(i===2&&n===3)score+=tri[last];
      }
      // A declared unigram-distribution penalty discourages collapsed letter keys.
      for(let c=0;c<26;c++)if(counts[c])score-=data.frequencyPenalty*counts[c]*(Math.log(counts[c]/n)-letterLogs[c]);
      return score;
    }
    fitness.modelId=data.id;return{fitness,id:data.id};
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={build};
  global.MuseumResearchLanguage={build};
})(typeof window!=='undefined'?window:globalThis);
