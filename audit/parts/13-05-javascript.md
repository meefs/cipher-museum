# javascript appendix 5

Snapshot: `96e6d4efcb2cadce34bdfbe4bcac2e884472e619`. Part of the Cipher Museum independent audit export. Read REVIEW_PROMPT.md and README.md first. Prior review notes are not independent proof.

## JavaScript — js/learning-path.js

**Dormant repository content:** no live HTML reference was found in this snapshot. Do not attribute these quizzes to a currently displayed page.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/learning-path.js`
- Served SHA-256: `cca1c5bddf2c0937585e8c9b843d8c8172576977b10d476e4fb582b559cb6b9d`
- Readable-source SHA-256: `cca1c5bddf2c0937585e8c9b843d8c8172576977b10d476e4fb582b559cb6b9d`


```javascript
'use strict';
/**
 * THE CIPHER MUSEUM — Cryptographer's Path (Learning Mode)
 * Toggleable overlay that sequences users through halls with quizzes & badges.
 * Include on every page: <script src="js/learning-path.js" defer></script>
 */
(function(){
  var HALLS = [
    {id:'ancient',      label:'Hall I',   name:'World Origins of Cryptography', href:'halls/ancient.html'},
    {id:'substitution', label:'Hall II',  name:'Classical Substitution', href:'halls/substitution.html'},
    {id:'polyalphabetic',label:'Hall III',name:'Polyalphabetic',         href:'halls/polyalphabetic.html'},
    {id:'transposition',label:'Hall IV',  name:'Transposition',          href:'halls/transposition.html'},
    {id:'military',     label:'Hall V',   name:'Military & Spy',         href:'halls/military.html'},
    {id:'civil-war',    label:'Hall VI',       name:'Civil War Gallery',      href:'halls/civil-war.html'},
    {id:'machines',     label:'Hall VII', name:'Mechanical Machines',     href:'halls/machines.html'},
    {id:'puzzle',       label:'Hall VIII',name:'Puzzle Ciphers',          href:'halls/puzzle.html'},
    {id:'unbreakable',  label:'Hall IX',  name:'The Unbreakable',        href:'halls/unbreakable.html'},
    {id:'codebreakers', label:'Hall X',   name:'Hall of Codebreakers',   href:'halls/codebreakers.html'},
    {id:'foundations',  label:'Annex',    name:'Hall of Foundations',    href:'hall-of-foundations/index.html'}
  ];

  var QUIZZES = {
    ancient:[
      {q:'What does the traditional modern scytale reconstruction illustrate?',opts:['A substitution cipher','A transposition device using a rod','A Roman military code','A Greek frequency table'],a:1},
      {q:'For a 26-letter alphabet, how many nontrivial Caesar shifts are there (excluding the identity shift)?',opts:['26','25','52','10'],a:1},
      {q:'Which scholar described frequency analysis in a surviving ninth-century treatise?',opts:['Julius Caesar','Al-Kindi','Leon Battista Alberti','Blaise de Vigenère'],a:1}
    ],
    substitution:[
      {q:'What makes frequency analysis effective against monoalphabetic ciphers?',opts:['Each letter always maps to the same cipher letter','The key is too short','The alphabet is preserved','It uses a known plaintext'],a:0},
      {q:'How many permutations are possible for a general monoalphabetic substitution of 26 letters?',opts:['26','26!','2²⁵⁶','52!'],a:1},
      {q:'What does a homophonic cipher do differently?',opts:['Uses polyalphabetic shifting','Assigns multiple symbols to common letters','Encrypts pairs of letters','Transposes text positions'],a:1}
    ],
    polyalphabetic:[
      {q:'What gives repeating-key Vigenère its periodic structure?',opts:['Removing spaces','Reversing the alphabet','Reusing the keyword cyclically','Changing the key after every message'],a:2},
      {q:'What technique did Kasiski use to break the Vigenère cipher?',opts:['Brute force','Finding repeated sequences to suggest possible key lengths','Known plaintext attack','Matrix inversion'],a:1},
      {q:'What makes the Alberti disk historically significant?',opts:['It was unbreakable','It is an early documented device for polyalphabetic substitution','It used a rotor mechanism','It was used in WWII'],a:1}
    ],
    transposition:[
      {q:'What does a transposition cipher preserve?',opts:['Letter positions','Letter frequencies','The key','The alphabet order'],a:1},
      {q:'What does a second transposition pass do?',opts:['Guarantees security','Rearranges positions again according to another key','Changes letter frequencies','Adds substitution'],a:1},
      {q:'In the usual Rail Fence zigzag, what happens if the rail count is at least the message length?',opts:['The letters remain in their original order','The key space becomes infinite','Every letter changes','The message becomes perfectly secret'],a:0}
    ],
    military:[
      {q:'What was ADFGVX designed for?',opts:['Naval communication','WWI German field telegraph','Cold War espionage','WWII Pacific theater'],a:1},
      {q:'Which techniques does VIC combine, without thereby proving it unbreakable?',opts:['A computer and RSA','A checkerboard and two transposition stages','A 256-bit block cipher','An unused one-time pad'],a:1},
      {q:'What can help attack a repeating-key Nihilist substitution?',opts:['Machine learning','Frequency analysis on digit sums with repeating key detection','Brute force','A defector revealed the key'],a:1}
    ],
    'civil-war':[
      {q:'Which side used Stager route systems, for which no Confederate cryptanalytic break is documented?',opts:['Confederate','Union','Both used the same system','Neither used ciphers'],a:1},
      {q:'What type of cipher did the Stager system use?',opts:['Substitution','Route transposition plus code words','Enigma-style rotors','One-time pad'],a:1},
      {q:'Which weakness affected the Confederate repeating-key systems shown here?',opts:['Too complex to use','They relied on Vigenère with known weaknesses','They used physical machines','The keys were too long'],a:1}
    ],
    machines:[
      {q:'Why does an Enigma key-space count need a specified machine and keying procedure?',opts:['Every model has the same settings','Rotor choices, plugboard and permitted settings vary','Enigma has no key','Only message length matters'],a:1},
      {q:'What was the historical significance of Colossus?',opts:['It was the first personal computer','It was an early programmable electronic digital computer for codebreaking','It broke the Caesar cipher','It invented public-key cryptography'],a:1},
      {q:'What Enigma property ensures a letter never encrypts to itself?',opts:['The plugboard','The reflector','The rotors','The ring settings'],a:1}
    ],
    puzzle:[
      {q:'What makes the Pigpen cipher easy to recognize?',opts:['Its numeric output','Its distinctive geometric symbols','Its use of colors','Its ASCII art'],a:1},
      {q:'The Zodiac Killer\'s Z340 cipher was solved after how many years?',opts:['5 years','20 years','Over 50 years','It remains unsolved'],a:2},
      {q:'Bacon\'s cipher is an early example of what?',opts:['Public-key cryptography','Steganography','Hash functions','Digital signatures'],a:1}
    ],
    unbreakable:[
      {q:'Who proved the One-Time Pad is perfectly secret?',opts:['Alan Turing','Claude Shannon','Blaise de Vigenère','Auguste Kerckhoffs'],a:1},
      {q:'What is the One-Time Pad\'s critical practical requirement?',opts:['A computer','A secret, independent, uniformly random key as long as the message, used once','A 256-bit key','A public key exchange'],a:1},
      {q:'Which operational failure enabled VENONA’s partial recoveries?',opts:['Better computers','Duplicated one-time-pad material','A mathematical breakthrough','Social engineering'],a:1}
    ],
    codebreakers:[
      {q:'Whose ninth-century treatise is the earliest surviving description of frequency analysis?',opts:['Al-Kindi (9th century)','Alan Turing (20th century)','Charles Babbage (19th century)','Julius Caesar (1st century BC)'],a:0},
      {q:'What did Marian Rejewski use to initially break Enigma?',opts:['A captured machine','Mathematical group theory applied to rotor permutations','Brute force','A defector'],a:1},
      {q:'What principle states that a cipher\'s security must depend only on the key, not secrecy of the algorithm?',opts:['Shannon\'s theorem','Kerckhoffs\'s principle','Turing\'s law','Diffie-Hellman theorem'],a:1}
    ],
    foundations:[
      {q:'What does the Prime Number Theorem estimate for RSA candidate search?',opts:['Primes become denser as numbers grow','The Prime Number Theorem: about 1 in ln(x) numbers near x is prime','Factoring large numbers is easy'],a:1},
      {q:'Which basis makes coordinate rounding exact in the two-dimensional preset shown here?',opts:['The orthogonal basis','Every short, nearly orthogonal basis','Any skewed basis'],a:0},
      {q:'For a bilinear pairing, e(aP, bQ) equals…',opts:['e(P,Q)^(a+b)','e(P,Q)^(ab)','e(P,Q)^(a−b)'],a:1}
    ]
  };

  var LS_PREFIX = 'ciphermuseum.path.';
  var LS_ACTIVE = LS_PREFIX + 'active';

  // Storage may be blocked, or contain data from an older/corrupted session.
  // Keep the current page usable even when persistence is unavailable.
  var memory = {};
  function readSaved(key){
    if(Object.prototype.hasOwnProperty.call(memory, key)) return memory[key];
    try { return localStorage.getItem(key); } catch(e) { return memory[key] || null; }
  }
  function writeSaved(key, value){
    memory[key] = value;
    try { localStorage.setItem(key, value); } catch(e) { /* session-only progress */ }
  }
  function isActive(){ return readSaved(LS_ACTIVE) === '1'; }
  function getPassedHalls(){
    try{
      var saved = JSON.parse(readSaved(LS_PREFIX+'passed'));
      if(!Array.isArray(saved)) return [];
      return saved.filter(function(id, i){
        return saved.indexOf(id) === i && HALLS.some(function(hall){ return hall.id === id; });
      });
    }
    catch(e){ return []; }
  }
  function setPassedHalls(arr){ writeSaved(LS_PREFIX+'passed', JSON.stringify(arr)); }
  function markPassed(hallId){
    var arr = getPassedHalls();
    if(arr.indexOf(hallId)===-1){ arr.push(hallId); setPassedHalls(arr); }
  }

  /* ── Determine current page context ─────────────────── */
  var path = location.pathname;
  var pageName = path.split('/').pop() || 'index.html';
  var parentDir = path.split('/').slice(-2,-1)[0] || '';
  var inSub = ['halls','ciphers','tours','lab','community','hall-of-foundations'].indexOf(parentDir) !== -1;
  var pre = inSub ? '../' : '';

  function currentHallIndex(){
    if(parentDir==='hall-of-foundations' && pageName==='index.html'){
      for(var f=0;f<HALLS.length;f++){ if(HALLS[f].id==='foundations') return f; }
    }
    if(parentDir!=='halls') return -1;
    var id = pageName.replace('.html','');
    for(var i=0;i<HALLS.length;i++){ if(HALLS[i].id===id) return i; }
    return -1;
  }

  /* ── Create Toggle Button ───────────────────────────── */
  var toggle = document.createElement('button');
  toggle.id = 'lpToggle';
  toggle.setAttribute('aria-label','Toggle Learning Path mode');
  toggle.setAttribute('aria-pressed', String(isActive()));
  toggle.innerHTML = '🎓 <span class="lp-label" style="font-family:var(--fm);font-size:.65rem;letter-spacing:.1em">Learning Path</span>';
  Object.assign(toggle.style, {
    position:'fixed', top:'78px', right:'1rem', zIndex:'190',
    background: 'var(--s2)', border:'1px solid var(--gold-b)', borderRadius:'var(--r)',
    color:'var(--gold)', padding:'.5rem .9rem', cursor:'pointer',
    display:'flex', alignItems:'center', gap:'.4rem',
    transition:'all var(--trs)', boxShadow:'0 4px 16px rgba(0,0,0,.3)'
  });
  /* On narrow screens, collapse to icon-only and move below nav */
  function adjustToggle(){
    var narrow = window.innerWidth <= 600;
    toggle.querySelector('.lp-label').style.display = narrow ? 'none' : '';
    toggle.style.top = narrow ? 'auto' : '78px';
    toggle.style.bottom = narrow ? '70px' : 'auto';
    toggle.style.right = narrow ? '1rem' : '1rem';
  }
  adjustToggle();
  window.addEventListener('resize', adjustToggle);
  toggle.addEventListener('mouseenter',function(){ toggle.style.background='var(--gold-glow)'; });
  toggle.addEventListener('mouseleave',function(){ toggle.style.background='var(--s2)'; });
  document.body.appendChild(toggle);

  /* ── Progress Bar ──────────────────────────────────── */
  var progressBar = document.createElement('div');
  progressBar.id = 'lpProgress';
  progressBar.setAttribute('role','progressbar');
  progressBar.setAttribute('aria-label','Learning Path progress');
  Object.assign(progressBar.style, {
    position:'fixed', top:'62px', left:'0', right:'0', height:'4px',
    background:'var(--s3)', zIndex:'199', display:'none'
  });
  var progressFill = document.createElement('div');
  Object.assign(progressFill.style, {
    height:'100%', background:'linear-gradient(90deg,var(--gold-dim),var(--gold))',
    transition:'width .4s ease', width:'0%', borderRadius:'0 2px 2px 0'
  });
  progressBar.appendChild(progressFill);
  document.body.appendChild(progressBar);

  /* ── Next Hall Navigation ──────────────────────────── */
  var nextBar = document.createElement('div');
  nextBar.id = 'lpNext';
  Object.assign(nextBar.style, {
    position:'fixed', bottom:'0', left:'0', right:'0', zIndex:'195',
    background:'rgba(6,6,8,.95)', backdropFilter:'blur(12px)',
    borderTop:'1px solid var(--gold-b)', padding:'.75rem 1rem',
    display:'none', alignItems:'center', justifyContent:'space-between',
    flexWrap:'wrap', gap:'.5rem', fontSize:'.85rem'
  });
  document.body.appendChild(nextBar);

  function updateProgress(){
    var passed = getPassedHalls();
    var pct = Math.round((passed.length / HALLS.length) * 100);
    progressFill.style.width = pct + '%';
    progressBar.setAttribute('aria-valuenow', String(pct));
    progressBar.setAttribute('aria-valuemin','0');
    progressBar.setAttribute('aria-valuemax','100');
  }

  function updateNextBar(){
    var idx = currentHallIndex();
    var passed = getPassedHalls();
    nextBar.innerHTML = '';
    if(idx === -1){
      /* Not on a hall page — show dashboard link + dismiss button */
      nextBar.innerHTML =
        '<span style="font-family:var(--fm);font-size:.65rem;letter-spacing:.1em;color:var(--tx3)">LEARNING PATH ACTIVE</span>' +
        '<div style="display:flex;align-items:center;gap:1rem">' +
          '<a href="'+pre+'my-path.html" style="font-family:var(--fd);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);text-decoration:none">My Dashboard →</a>' +
          '<button id="lpDismiss" style="background:none;border:1px solid var(--s5);color:var(--tx3);font-family:var(--fm);font-size:.6rem;padding:.3rem .6rem;border-radius:var(--r);cursor:pointer;letter-spacing:.08em" title="Turn off Learning Path">✕ OFF</button>' +
        '</div>';
      var dismissBtn = document.getElementById('lpDismiss');
      if(dismissBtn) dismissBtn.addEventListener('click', function(){ deactivate(); });
      return;
    }
    /* On a hall page */
    var hall = HALLS[idx];
    var isPassed = passed.indexOf(hall.id) !== -1;
    var nextIdx = idx + 1;
    var quizBtn = '';
    if(!isPassed && QUIZZES[hall.id]){
      quizBtn = '<button id="lpQuizBtn" style="font-family:var(--fd);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--black);background:var(--gold);border:none;padding:.5rem 1.2rem;border-radius:var(--r);cursor:pointer">Take Quiz</button>';
    } else if(isPassed){
      quizBtn = '<span style="font-family:var(--fm);font-size:.65rem;letter-spacing:.1em;color:var(--green)">✓ PASSED</span>';
    }
    var nextLink = '';
    if(nextIdx < HALLS.length){
      nextLink = '<a href="'+pre+HALLS[nextIdx].href+'" style="font-family:var(--fd);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);text-decoration:none">Next: '+HALLS[nextIdx].name+' →</a>';
    } else {
      nextLink = '<a href="'+pre+'my-path.html" style="font-family:var(--fd);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);text-decoration:none">View Dashboard →</a>';
    }
    nextBar.innerHTML =
      '<span style="font-family:var(--fm);font-size:.65rem;letter-spacing:.1em;color:var(--tx3)">' + hall.label + ' · ' + hall.name + '</span>' +
      '<div style="display:flex;align-items:center;gap:1rem">' + quizBtn + nextLink + '</div>';
    var qb = document.getElementById('lpQuizBtn');
    if(qb) qb.addEventListener('click', function(){ showQuiz(hall.id); });
  }

  /* ── Quiz Modal ──────────────────────────────────── */
  function showQuiz(hallId){
    var questions = QUIZZES[hallId];
    if(!questions) return;
    var overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position:'fixed',inset:'0',zIndex:'500',
      background:'rgba(0,0,0,.8)',backdropFilter:'blur(6px)',
      display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem'
    });
    var modal = document.createElement('div');
    Object.assign(modal.style, {
      background:'var(--s2)',border:'1px solid var(--gold-b)',borderRadius:'var(--rl)',
      padding:'2.5rem',maxWidth:'600px',width:'100%',maxHeight:'80vh',overflowY:'auto'
    });
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Learning Path quiz');
    var previousFocus = document.activeElement;
    var previousOverflow = document.body.style.overflow;
    overlay.appendChild(modal);
    function closeQuiz(){
      overlay.remove();
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      updateProgress(); updateNextBar();
      (previousFocus && previousFocus.isConnected ? previousFocus : toggle).focus();
    }
    function onKey(e){
      if(e.key === 'Escape'){ e.preventDefault(); closeQuiz(); return; }
      if(e.key !== 'Tab') return;
      var buttons = modal.querySelectorAll('button:not([disabled]),a[href],input,select,textarea');
      if(!buttons.length) return;
      var first = buttons[0], last = buttons[buttons.length - 1];
      if(!modal.contains(document.activeElement) || (e.shiftKey && document.activeElement === first) ||
         (!e.shiftKey && document.activeElement === last)){
        e.preventDefault(); (e.shiftKey ? last : first).focus();
      }
    }
    overlay.addEventListener('click',function(e){ if(e.target===overlay) closeQuiz(); });
    document.addEventListener('keydown', onKey);

    var currentQ = 0;
    var score = 0;

    function renderQ(){
      var q = questions[currentQ];
      modal.innerHTML =
        '<div style="font-family:var(--fm);font-size:.6rem;letter-spacing:.15em;color:var(--tx3);margin-bottom:1rem">QUESTION ' + (currentQ+1) + ' OF ' + questions.length + '</div>' +
        '<p style="font-family:var(--fd);font-size:1.15rem;color:var(--tx);margin-bottom:1.5rem;line-height:1.5">' + escapeHTML(q.q) + '</p>' +
        '<div id="quizOpts" style="display:flex;flex-direction:column;gap:.6rem"></div>' +
        '<button type="button" class="lp-quiz-dismiss" style="margin-top:1rem">Close quiz</button>';
      var optsEl = modal.querySelector('#quizOpts');
      modal.querySelector('.lp-quiz-dismiss').addEventListener('click', closeQuiz);
      q.opts.forEach(function(opt,i){
        var btn = document.createElement('button');
        Object.assign(btn.style, {
          fontFamily:'var(--fb)',fontSize:'1rem',textAlign:'left',
          padding:'.85rem 1.2rem',border:'1px solid var(--s5)',borderRadius:'var(--r)',
          background:'var(--s3)',color:'var(--tx2)',cursor:'pointer',transition:'all .2s'
        });
        btn.textContent = opt;
        btn.addEventListener('mouseenter',function(){ btn.style.borderColor='var(--gold-b)';btn.style.color='var(--tx)'; });
        btn.addEventListener('mouseleave',function(){ btn.style.borderColor='var(--s5)';btn.style.color='var(--tx2)'; });
        btn.addEventListener('click', function(){
          if(i === q.a) score++;
          currentQ++;
          if(currentQ < questions.length){ renderQ(); }
          else { renderResult(); }
        });
        optsEl.appendChild(btn);
      });
      optsEl.querySelector('button').focus();
    }

    function renderResult(){
      var passed = score >= 2; /* Pass = 2/3 correct */
      if(passed) markPassed(hallId);
      modal.innerHTML =
        '<div style="text-align:center">' +
          '<div style="font-size:3rem;margin-bottom:1rem">' + (passed ? '🏆' : '📖') + '</div>' +
          '<p style="font-family:var(--fd);font-size:1.3rem;color:'+(passed?'var(--gold)':'var(--tx)')+';margin-bottom:.5rem">' +
            (passed ? 'Hall Completed!' : 'Keep Studying') + '</p>' +
          '<p style="font-family:var(--fm);font-size:.75rem;color:var(--tx3);margin-bottom:1.5rem">' +
            score + ' / ' + questions.length + ' correct' +
            (passed ? '' : ' — need 2 to pass') + '</p>' +
          (passed ? '<div style="margin-bottom:1.5rem"><svg width="80" height="80" viewBox="0 0 80 80"><circle cx="40" cy="40" r="36" fill="none" stroke="var(--gold)" stroke-width="2"/><circle cx="40" cy="40" r="28" fill="var(--gold-glow)" stroke="var(--gold-dim)" stroke-width="1"/><text x="40" y="36" text-anchor="middle" font-family="var(--fd)" font-size="11" fill="var(--gold)" letter-spacing=".1em">BADGE</text><text x="40" y="50" text-anchor="middle" font-family="var(--fm)" font-size="7" fill="var(--tx3)">' + escapeHTML(hallId.toUpperCase()) + '</text></svg></div>' : '') +
          '<button id="quizClose" style="font-family:var(--fd);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--black);background:var(--gold);border:none;padding:.65rem 1.5rem;border-radius:var(--r);cursor:pointer">' +
            (passed ? 'Continue' : 'Try Again Later') + '</button>' +
        '</div>';
      modal.querySelector('#quizClose').addEventListener('click', closeQuiz);
      modal.querySelector('#quizClose').focus();
    }

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    renderQ();
  }

  function escapeHTML(s){
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(s));
    return d.innerHTML;
  }

  /* ── Activate / Deactivate ─────────────────────────── */
  function activate(){
    writeSaved(LS_ACTIVE, '1');
    document.body.classList.add('learning-path-active');
    toggle.setAttribute('aria-pressed','true');
    toggle.style.borderColor = 'var(--gold)';
    toggle.style.background = 'rgba(201,168,76,.12)';
    progressBar.style.display = 'block';
    nextBar.style.display = 'flex';
    updateProgress();
    updateNextBar();
  }

  function deactivate(){
    writeSaved(LS_ACTIVE, '0');
    document.body.classList.remove('learning-path-active');
    toggle.setAttribute('aria-pressed','false');
    toggle.style.borderColor = 'var(--gold-b)';
    toggle.style.background = 'var(--s2)';
    progressBar.style.display = 'none';
    nextBar.style.display = 'none';
  }

  toggle.addEventListener('click', function(){
    if(isActive()) deactivate(); else activate();
  });

  /* ── Auto-activate on load if previously active ───── */
  if(isActive()) activate();
})();
```


## JavaScript — js/lightbox.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/lightbox.js`
- Served SHA-256: `df66c54172a603518ed1085ddbe3b963fef68a5a2846e0836ba96386b2286c15`
- Readable-source SHA-256: `df66c54172a603518ed1085ddbe3b963fef68a5a2846e0836ba96386b2286c15`


```javascript
/* ─── Cipher Museum — Image & Diagram Lightbox ─── */
document.addEventListener('DOMContentLoaded', function () {
  // Build overlay
  var overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Enlarged image');

  var closeBtn = document.createElement('button');
  closeBtn.className = 'lightbox-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '×';

  var lbImg = document.createElement('img');
  lbImg.src = '';
  lbImg.alt = '';

  // Inline SVG figures are enlarged by cloning the node, not via src
  var svgHolder = document.createElement('div');

  var caption = document.createElement('div');
  caption.className = 'lightbox-caption';

  overlay.appendChild(closeBtn);
  overlay.appendChild(lbImg);
  overlay.appendChild(svgHolder);
  overlay.appendChild(caption);
  document.body.appendChild(overlay);

  var lastTrigger = null; // focus returns here on close
  var previousOverflow = '';
  function lockScroll(){
    if(!overlay.classList.contains('active')) previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  function openLightbox(src, alt, cap) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    lbImg.style.display = '';
    caption.textContent = cap || '';
    lockScroll();
    overlay.classList.add('active');
    closeBtn.focus();
  }

  function openLightboxSvg(svgEl, cap) {
    var clone = svgEl.cloneNode(true);
    // The in-page figure caps its own width; let the enlarged copy fill the viewport
    clone.style.maxWidth = '92vw';
    clone.style.maxHeight = '90vh';
    clone.style.width = '1100px';
    clone.style.height = 'auto';
    clone.removeAttribute('tabindex');
    clone.removeAttribute('role');
    svgHolder.innerHTML = '';
    svgHolder.appendChild(clone);
    lbImg.style.display = 'none';
    caption.textContent = cap || '';
    lockScroll();
    overlay.classList.add('active');
    closeBtn.focus();
  }

  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.style.overflow = previousOverflow;
    lbImg.src = '';
    svgHolder.innerHTML = '';
    if (lastTrigger) { lastTrigger.focus(); lastTrigger = null; }
  }

  // Close handlers
  closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    closeLightbox();
  });

  overlay.addEventListener('click', function (e) {
    if (e.target !== lbImg && !svgHolder.contains(e.target)) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape') {
      e.preventDefault(); closeLightbox();
    } else if (e.key === 'Tab') {
      // Images/diagrams are display content; Close is the sole dialog control.
      e.preventDefault(); closeBtn.focus();
    }
  });

  function captionFor(el) {
    var fig = el.closest('figure') || el.closest('.figure');
    var capEl = fig ? fig.querySelector('.figure-caption') : null;
    return capEl ? capEl.textContent : '';
  }

  // Make a figure openable by mouse and keyboard alike
  function attach(el, open) {
    el.style.cursor = 'zoom-in';
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    var base = el.getAttribute('aria-label') || el.getAttribute('alt') || 'figure';
    el.setAttribute('aria-label', 'Enlarge: ' + base);
    function fire(e) {
      e.preventDefault();
      e.stopPropagation();
      lastTrigger = el;
      open();
    }
    el.addEventListener('click', fire);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') fire(e);
    });
  }

  document.querySelectorAll('.figure img').forEach(function (img) {
    attach(img, function () { openLightbox(img.src, img.alt, captionFor(img)); });
  });

  document.querySelectorAll('.figure svg').forEach(function (svg) {
    attach(svg, function () { openLightboxSvg(svg, captionFor(svg)); });
  });
});
```


## JavaScript — js/manual-cipher-demos.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/manual-cipher-demos.js`
- Served SHA-256: `84b99d862dc976f26d28d4d7b91d765025a4c98cfd3103ffa76a2b346b49f3ab`
- Readable-source SHA-256: `84b99d862dc976f26d28d4d7b91d765025a4c98cfd3103ffa76a2b346b49f3ab`


```javascript
/* Original-manual demos: rendering only. Procedures and traces live in CipherEngines. */
(function () {
  'use strict';
  const root = document.querySelector('[data-manual-demo]');
  if (!root) return;
  const name = root.dataset.manualDemo;
  const engine = window.CipherEngines && window.CipherEngines[name];
  const $ = id => root.querySelector('#' + id);
  let mode = 'encrypt', trace = null, frames = [], progress = 0, timer = null;
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function stop() {
    if (timer !== null) { clearInterval(timer); timer = null; }
    $('manual-play').textContent = 'Play';
    $('manual-play').setAttribute('aria-pressed', 'false');
  }
  function key() {
    if (name === 'rasterschluessel44') {
      for (const id of ['rs-row', 'rs-column', 'rs-minute']) {
        if (!$(id).value.trim()) throw new Error('Beginning row, column and minute are required.');
      }
      return { startRow: Number($('rs-row').value) - 1, startColumn: Number($('rs-column').value) - 1,
        minute: Number($('rs-minute').value), strict: $('rs-policy').value === 'strict' };
    }
    if (name === 'doublePlayfair') return {
      squareA: $('dp-a').value, squareB: $('dp-b').value, filler: $('dp-filler').value, strict: true
    };
    const value = $('amsco-key').value.trim();
    if (!value) throw new Error('Enter a permutation of column ranks, such as 41325.');
    if (!/^\d+(?:\s+\d+)*$/.test(value)) throw new Error('Column ranks must be digits, separated by spaces when needed.');
    return { order: value.includes(' ') ? value.split(/\s+/).map(Number) : [...value].map(Number), first: Number($('amsco-first').value) };
  }
  function node(tag, text, cls) {
    const n = document.createElement(tag); if (text !== undefined) n.textContent = text;
    if (cls) n.className = cls; return n;
  }
  function buildFrames(t) {
    if (name !== 'doublePlayfair') return (t.decrypt ? t.extraction : t.placement)
      .map(pos => ({ phase: 'entry', pos })).concat((t.decrypt ? t.placement : t.extraction).map(pos => ({ phase: 'read', pos })));
    const f = [];
    t.blocks.forEach((block, index) => {
      if (!t.decrypt) for (let p = 0; p < block.top.length * 2; p++) f.push({ phase: 'arrange', block: index, pos: p });
      t.pairs.filter(p => p.block === index).forEach(pair => {
        for (const phase of ['pair', 'stage1', 'stage2']) f.push({ phase, block: index, pair });
      });
    }); return f;
  }
  function drawTransposition() {
    const active = frames[progress - 1];
    const entered = new Set(frames.slice(0, progress).filter(f => f.phase === 'entry').map(f => f.pos));
    const read = new Set(frames.slice(0, progress).filter(f => f.phase === 'read').map(f => f.pos));
    const table = node('table', undefined, 'cipher-table manual-table');
    table.append(node('caption', name === 'rasterschluessel44' ? 'Original manual stencil; blocked cells are unavailable' : 'Alternating cell lengths; column ranks above'));
    const head = node('thead'), hr = node('tr'); hr.append(node('th', 'Row'));
    const order = trace.order;
    order.forEach((rank, col) => { const th = node('th', String(rank)); th.scope = 'col'; th.title = 'Column ' + (col + 1) + ', rank ' + rank; hr.append(th); });
    head.append(hr); table.append(head); const body = node('tbody');
    const width = name === 'rasterschluessel44' ? 25 : trace.width;
    const rows = name === 'rasterschluessel44' ? 24 : Math.ceil(trace.cells.length / width);
    for (let row = 0; row < rows; row++) {
      const tr = node('tr'), th = node('th', String(row + 1)); th.scope = 'row'; tr.append(th);
      for (let col = 0; col < width; col++) {
        const pos = row * width + col;
        const blocked = name === 'rasterschluessel44' && trace.grid[row][col] === '#';
        const cell = trace.cells[pos];
        const value = name === 'rasterschluessel44' ? cell : cell && cell.value;
        const td = node('td', blocked ? '×' : entered.has(pos) ? value : '', blocked ? 'manual-blocked' : 'manual-cell');
        if (name === 'amsco' && cell) { td.dataset.length = cell.length; td.title = cell.length + '-letter cell'; }
        if (read.has(pos)) td.classList.add('manual-read');
        if (active && active.pos === pos) td.classList.add('manual-active');
        if (name === 'rasterschluessel44' && pos === trace.beginning) td.classList.add('manual-start');
        tr.append(td);
      } body.append(tr);
    }
    table.append(body); $('manual-grid').replaceChildren(table);
    $('manual-caption').textContent = name === 'rasterschluessel44'
      ? 'Digit sum ' + trace.sum + '; read begins in physical column ' + (trace.readColumn + 1) + ', rank ' + trace.firstRank + '. ' + trace.input.length + ' of 240 writing cells used.'
      : 'Ranks: ' + trace.order.join(' ') + '. First cell: ' + trace.first + ' letter(s). Last cell retains its actual length; no nulls added.';
    $('manual-progress-output').textContent = frames.slice(0, progress).filter(f => f.phase === 'read')
      .map(f => name === 'rasterschluessel44' ? trace.cells[f.pos] : trace.cells[f.pos].value).join('');
    return active ? (active.phase === 'entry' ? 'Place input in ' : 'Extract output from ') + 'row ' + (Math.floor(active.pos / width) + 1) + ', column ' + (active.pos % width + 1) + '.' : 'Ready to place the input.';
  }
  function square(text, label, positions) {
    const table = node('table', undefined, 'cipher-table manual-square'); table.append(node('caption', label));
    const body = node('tbody'); for (let row = 0; row < 5; row++) {
      const tr = node('tr'); for (let col = 0; col < 5; col++) {
        const index = row * 5 + col, td = node('td', text[index]); if (positions.includes(index)) td.classList.add('manual-active'); tr.append(td);
      } body.append(tr);
    } table.append(body); return table;
  }
  function drawDouble() {
    const active = frames[progress - 1], index = active ? active.block : 0;
    const block = trace.blocks[index];
    const table = node('table', undefined, 'cipher-table manual-table'); table.append(node('caption', 'Plaintext arrangement: block ' + (index + 1) + ', up to 17 columns'));
    const body = node('tbody');
    if (block) for (const [row, text] of [['Top', block.top], ['Bottom', block.bottom]]) {
      const tr = node('tr'), th = node('th', row); th.scope = 'row'; tr.append(th);
      [...text].forEach((letter, col) => {
        const p = col + (row === 'Bottom' ? block.top.length : 0);
        const visible = frames.slice(0, progress).some(f => f.block === index && (trace.decrypt
          ? f.phase === 'stage2' && f.pair.column === col : f.phase === 'arrange' && f.pos === p));
        const td = node('td', visible ? letter : ''); if (active && active.pair && active.pair.column === col) td.classList.add('manual-active'); tr.append(td);
      }); body.append(tr);
    }
    table.append(body); $('manual-grid').replaceChildren(table);
    let a = [], b = [], message = 'Ready to arrange the plaintext into two rows.';
    if (active) {
      if (active.phase === 'arrange') message = 'Place plaintext letter ' + (active.pos + 1) + ' in block ' + (index + 1) + '.';
      else {
        const pair = active.pair;
        if (active.phase === 'pair') message = 'Form pair ' + pair.pair + (trace.decrypt ? ' from ciphertext.' : ' vertically: top first, bottom second.');
        else {
          const stage = pair[active.phase];
          [a, b] = trace.decrypt ? [[stage.positions[1]], [stage.positions[0]]] : [[stage.positions[0]], [stage.positions[1]]];
          message = (active.phase === 'stage1' ? 'First' : 'Second') + ' substitution: ' + stage.pair + ' → ' + stage.result + '; ' +
            (stage.sameRow ? 'same row, move ' + (trace.decrypt ? 'left' : 'right') + ', cross the squares.' : 'rectangle, cross the row and column coordinates.');
        }
      }
    }
    $('manual-squares').replaceChildren(square(trace.squareA, 'Square A', a), square(trace.squareB, 'Square B', b));
    $('manual-caption').textContent = 'Two substitutions per pair. ' + trace.blocks.length + ' block(s); ' + trace.padding + ' filler letter(s) added and retained on decryption.';
    // During decryption recovered pairs rebuild row order, not interleaved output.
    const complete = frames.slice(0, progress).filter(f => f.phase === 'stage2');
    $('manual-progress-output').textContent = trace.decrypt ? trace.blocks.map((_, i) => {
      const ps = complete.filter(f => f.block === i).map(f => f.pair.stage2.result); return ps.map(p => p[0]).join('') + ps.map(p => p[1]).join('');
    }).join('') : complete.map(f => f.pair.stage2.result).join('');
    return message;
  }
  function draw() {
    if (!trace) return;
    const text = name === 'doublePlayfair' ? drawDouble() : drawTransposition();
    $('manual-animation-status').textContent = progress + ' / ' + frames.length + ': ' + text;
    $('manual-step').disabled = progress >= frames.length;
    $('manual-play').disabled = progress >= frames.length;
  }
  function clear() {
    trace = null; frames = []; progress = 0;
    for (const id of ['manual-output', 'manual-grid', 'manual-caption', 'manual-progress-output', 'manual-animation-status', 'manual-squares']) {
      const el = $(id); if (el) el.replaceChildren();
    }
    for (const id of ['manual-step', 'manual-play', 'manual-reset', 'manual-use-output']) $(id).disabled = true;
  }
  function run() {
    stop(); clear();
    try {
      if (!engine) throw new Error('The cipher engine could not load. Reload this page.');
      trace = engine.trace($('manual-message').value, key(), mode === 'decrypt');
      frames = buildFrames(trace); $('manual-output').textContent = trace.output;
      $('manual-status').textContent = 'Computed ' + trace.input.length + ' normalized letters. ' + (trace.padding ? 'One filler letter added; decryption retains it.' : 'No padding added.');
      for (const id of ['manual-reset', 'manual-use-output']) $(id).disabled = false;
      draw();
    } catch (error) { clear(); $('manual-status').textContent = error.message; }
  }
  function setMode(next) {
    mode = next; root.querySelectorAll('[data-mode]').forEach(btn => {
      const active = btn.dataset.mode === mode; btn.classList.toggle('active', active); btn.setAttribute('aria-pressed', String(active));
    });
  }
  root.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => { setMode(btn.dataset.mode); run(); }));
  root.querySelectorAll('input, textarea, select').forEach(el => el.addEventListener('input', run));
  $('manual-run').addEventListener('click', run);
  $('manual-use-output').addEventListener('click', () => { if (!trace) return; $('manual-message').value = trace.output; setMode(mode === 'encrypt' ? 'decrypt' : 'encrypt'); run(); });
  $('manual-step').addEventListener('click', () => { stop(); progress = Math.min(progress + 1, frames.length); draw(); });
  $('manual-reset').addEventListener('click', () => { stop(); progress = 0; draw(); });
  $('manual-play').addEventListener('click', () => {
    if (timer !== null) { stop(); return; }
    if (reduced()) { progress = frames.length; draw(); return; }
    $('manual-play').textContent = 'Pause'; $('manual-play').setAttribute('aria-pressed', 'true');
    timer = setInterval(() => { progress++; draw(); if (progress >= frames.length) stop(); }, 220);
  });
  window.addEventListener('pagehide', stop);
  run();
}());
```


## JavaScript — js/multiple-anagramming.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/multiple-anagramming.js`
- Served SHA-256: `6e7cfd2872d5f4ba7483f0f74ad46e71eee7f51451847caa7d708fd48344efb8`
- Readable-source SHA-256: `6e7cfd2872d5f4ba7483f0f74ad46e71eee7f51451847caa7d708fd48344efb8`


```javascript
/* Multiple anagramming: original, complete-rectangle teaching fixtures.
 * A strip is one four-letter column from each intercept, kept in transmitted
 * order. Rearranging a strip applies the same hypothesis to every message.
 * No imported historical ciphertext, dictionary or language model is used.
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document) {
    root.MultipleAnagramming = api;
    var start = function () { api.mount(root.document); };
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start);
    else start();
  }
}(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  var WIDTH = 5, HEIGHT = 4;
  // Independently recorded: plaintext written in four rows of five, columns
  // transmitted in order 3, 1, 5, 2, 4. The control uses 5, 2, 4, 1, 3.
  var fixtures = [
    { name: 'Intercept 1', ciphertext: 'ECEOMHRTTUANEEINTORO', plaintext: 'MEETTHECOURIERATNOON' },
    { name: 'Intercept 2', ciphertext: 'ITFUBWBEGRRKRAEDNEOS', plaintext: 'BRINGWATERBEFOREDUSK' },
    { name: 'Intercept 3', ciphertext: 'OEHOSTRNTORDCHTRUNEA', plaintext: 'SCOUTTHENORTHERNROAD' },
    { name: 'Different-key control', ciphertext: 'RTRKEPEDDROSSEBENOFU', plaintext: 'SENDREPORTBEFOREDUSK' }
  ];
  var sharedOrder = [1, 3, 0, 4, 2]; // B, D, A, E, C: transmitted-strip identities.
  var contacts = new Set('TH HE IN ER AN RE ON AT EN ND TI ES OR TE OF ED IS IT AL AR ST TO NT NG SE HA AS OU IO LE VE CO BE RT WA SC RO UR'.split(' '));

  function validOrder(order) {
    return Array.isArray(order) && order.length === WIDTH &&
      order.every(function (v) { return Number.isInteger(v) && v >= 0 && v < WIDTH; }) &&
      new Set(order).size === WIDTH;
  }
  function splitColumns(ciphertext) {
    if (!/^[A-Z]{20}$/.test(ciphertext)) throw new Error('Use exactly twenty A–Z letters for this 4 × 5 exercise.');
    return ciphertext.match(/.{4}/g);
  }
  function reconstruct(ciphertext, order) {
    if (!validOrder(order)) throw new Error('Each of the five strips must appear exactly once.');
    var columns = splitColumns(ciphertext), result = '';
    for (var row = 0; row < HEIGHT; row++) {
      for (var col = 0; col < WIDTH; col++) result += columns[order[col]][row];
    }
    return result;
  }
  function move(order, strip, direction) {
    if (!validOrder(order) || (direction !== -1 && direction !== 1)) throw new Error('Invalid strip movement.');
    var next = order.slice(), at = next.indexOf(strip), target = at + direction;
    if (at === -1) throw new Error('Unknown strip.');
    if (target >= 0 && target < WIDTH) {
      next[at] = next[target];
      next[target] = strip;
    }
    return next;
  }
  function contactScore(order) {
    var count = 0;
    fixtures.slice(0, 3).forEach(function (fixture) {
      var candidate = reconstruct(fixture.ciphertext, order);
      // Count only horizontal contacts between adjacent strips, not the
      // contact from the last column of a row to the first of the next row.
      for (var row = 0; row < HEIGHT; row++) {
        for (var col = 0; col < WIDTH - 1; col++) {
          if (contacts.has(candidate.slice(row * WIDTH + col, row * WIDTH + col + 2))) count++;
        }
      }
    });
    return count;
  }

  function mount(document) {
    var panel = document.getElementById('multiple-anagramming');
    if (!panel || panel.dataset.ready) return;
    panel.dataset.ready = 'true';
    var order = [0, 1, 2, 3, 4], checked = false;
    var select = document.getElementById('ma-selected');
    var stripList = document.getElementById('ma-strips');
    var outputs = document.getElementById('ma-candidates');
    var status = document.getElementById('ma-status');
    var showControl = document.getElementById('ma-control');
    var left = document.getElementById('ma-left'), right = document.getElementById('ma-right');
    var label = function (strip) { return String.fromCharCode(65 + strip); };

    function render() {
      var selected = Number(select.value), visible = showControl.checked ? fixtures : fixtures.slice(0, 3);
      stripList.replaceChildren();
      order.forEach(function (strip, position) {
        var tile = document.createElement('li');
        tile.className = 'ma-strip' + (selected === strip ? ' ma-selected' : '');
        var title = document.createElement('strong');
        title.textContent = label(strip);
        title.setAttribute('aria-label', 'Strip ' + label(strip) + ', position ' + (position + 1));
        tile.appendChild(title);
        visible.forEach(function (fixture, index) {
          var column = document.createElement('div');
          column.className = 'ma-column';
          var tag = document.createElement('small');
          tag.textContent = index === 3 ? 'Control' : 'Msg ' + (index + 1);
          var letters = document.createElement('span');
          var text = splitColumns(fixture.ciphertext)[strip];
          letters.className = 'ma-letters';
          letters.textContent = text.split('').join('\n');
          letters.setAttribute('aria-label', fixture.name + ': ' + text);
          column.append(tag, letters);
          tile.appendChild(column);
        });
        stripList.appendChild(tile);
      });
      outputs.replaceChildren();
      visible.forEach(function (fixture, index) {
        var block = document.createElement('div'), heading = document.createElement('h3');
        heading.textContent = fixture.name;
        var cipher = document.createElement('p');
        cipher.className = 'ma-intercept';
        cipher.textContent = 'Received: ' + splitColumns(fixture.ciphertext).join(' ');
        var candidate = document.createElement('code');
        candidate.className = 'ma-candidate';
        var text = reconstruct(fixture.ciphertext, order);
        candidate.textContent = text;
        candidate.dataset.message = String(index + 1);
        block.append(heading, cipher, candidate);
        if (checked) {
          var result = document.createElement('p');
          result.className = 'ma-check-result';
          result.textContent = text === fixture.plaintext ? 'Matches this prepared message.' :
            (index === 3 ? 'Does not match: this control used a different column order.' : 'Does not yet match this prepared message.');
          block.appendChild(result);
        }
        outputs.appendChild(block);
      });
      var at = order.indexOf(selected);
      left.disabled = at === 0;
      right.disabled = at === WIDTH - 1;
      document.getElementById('ma-order').textContent = order.map(label).join(' → ');
      document.getElementById('ma-score').textContent = contactScore(order) + ' of 48 common contacts';
      if (checked) {
        var solved = fixtures.slice(0, 3).every(function (fixture) { return reconstruct(fixture.ciphertext, order) === fixture.plaintext; });
        status.textContent = solved ? 'All three same-key messages match the prepared answer. The different-key control needs its own ordering.' :
          'This arrangement does not match all three prepared messages. A higher contact score is a clue, not proof.';
      }
    }
    function shift(direction) {
      var strip = Number(select.value);
      order = move(order, strip, direction);
      checked = false;
      render();
      status.textContent = 'Moved strip ' + label(strip) + ' to position ' + (order.indexOf(strip) + 1) + ' in every intercept.';
    }
    select.addEventListener('change', render);
    left.addEventListener('click', function () { shift(-1); });
    right.addEventListener('click', function () { shift(1); });
    showControl.addEventListener('change', render);
    document.getElementById('ma-check').addEventListener('click', function () { checked = true; render(); });
    document.getElementById('ma-reveal').addEventListener('click', function () { order = sharedOrder.slice(); checked = true; render(); });
    document.getElementById('ma-reset').addEventListener('click', function () {
      order = [0, 1, 2, 3, 4]; checked = false; select.value = '0'; render();
      status.textContent = 'Reset to the received strip order A → B → C → D → E.';
    });
    render();
  }
  return { fixtures: fixtures, reconstruct: reconstruct, splitColumns: splitColumns, move: move, contactScore: contactScore, mount: mount };
}));
```


## JavaScript — js/nav.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/nav.js`
- Served SHA-256: `5a45581ad08fd412e0d38e35a7d456fb85134042c142a078e9fa75339eb3fa33`
- Readable-source SHA-256: `5a45581ad08fd412e0d38e35a7d456fb85134042c142a078e9fa75339eb3fa33`


```javascript
/**
 * THE CIPHER MUSEUM — Navigation System
 * 1. Standardizes nav links to one canonical set (handles subdirectory paths)
 * 2. Injects a hamburger toggle at <768px with CSS transition drawer
 * Load on every page: <script src="js/nav.js" defer></script>
 */
'use strict';
(function () {
  var nav = document.querySelector('.museum-nav');
  if (!nav) return;
  var inner = nav.querySelector('.nav-inner');
  if (!inner) return;
  var links = nav.querySelector('.nav-links');
  if (!links) return;

  /* ── Standardize nav links ───────────────────────────── */
  var NAV = [
    ['museum-map.html',   'Explore'],
    ['timeline.html',     'Timeline'],
    ['learn.html',        'Learn'],
    ['cipher-corpus.html','Cipher Corpus'],
    ['cryptanalysis.html', 'Cryptanalysis'],
    ['challenges.html',   'Challenges'],
    ['lab/workbench.html','Lab'],
    ['search.html',       'Search']
  ];
  var path = location.pathname;
  var inSub = /\/(ciphers|halls|tours|lab|community|hall-of-foundations)\//.test(path);
  var pre = inSub ? '../' : '';
  var basename = path.split('/').pop() || 'index.html';
  var parentDir = path.split('/').slice(-2, -1)[0] || '';
  var DIR_ACTIVE = {halls:'Explore',tours:'Explore',community:'Explore',lab:'Lab','hall-of-foundations':'Explore'};
  var ALIASES = {
    'index.html': null,
    'museum-map.html': 'Explore',
    'timeline.html': 'Timeline',
    'glossary.html': 'Learn',
    'modern.html': 'Learn',
    'learn.html': 'Learn',
    'cipher-corpus.html': 'Cipher Corpus',
    'cryptanalysis.html': 'Cryptanalysis',
    'challenges.html': 'Challenges',
    'comparison.html': 'Learn',
    'cipher-flow.html': 'Explore',
    'search.html': 'Search'
  };
  var activeLabel = DIR_ACTIVE[parentDir] || ALIASES[basename] || null;
  links.innerHTML = '';
  NAV.forEach(function (n) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = pre + n[0];
    a.textContent = n[1];
    if (n[1] === activeLabel) a.className = 'active';
    li.appendChild(a);
    links.appendChild(li);
  });

  /* ── Inject hamburger button ──────────────────────────── */
  var btn = document.createElement('button');
  btn.className = 'nav-hamburger';
  btn.setAttribute('aria-label', 'Toggle navigation menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'nav-drawer');
  btn.innerHTML =
    '<span class="hamburger-bar"></span>' +
    '<span class="hamburger-bar"></span>' +
    '<span class="hamburger-bar"></span>';
  inner.appendChild(btn);

  /* ── Mobile-only extra links (visible in drawer only) ──
     Must not repeat anything in NAV above — the drawer shows both lists,
     so an entry in both renders twice. */
  var MOBILE_NAV = [
    ['tours/index.html',    'Guided Tours'],
    ['hall-of-foundations/index.html', 'Hall of Foundations'],
    ['glossary.html',       'Glossary'],
    ['modern.html',         'Modern Cryptography'],
    ['cipher-detective.html','Cipher Detective'],
    ['comparison.html',     'Cipher Comparison'],
    ['community/index.html','Community']
  ];
  var primary = {};
  NAV.forEach(function (n) { primary[n[0]] = true; });
  MOBILE_NAV = MOBILE_NAV.filter(function (n) { return !primary[n[0]]; });

  var divider = document.createElement('li');
  divider.className = 'nav-drawer-divider';
  divider.textContent = 'More to Explore';
  links.appendChild(divider);
  MOBILE_NAV.forEach(function (n) {
    var li = document.createElement('li');
    li.className = 'nav-drawer-only';
    var a = document.createElement('a');
    a.href = pre + n[0];
    a.textContent = n[1];
    li.appendChild(a);
    links.appendChild(li);
  });

  /* Give the links list an id for aria-controls. No role/aria-label here:
     the list already sits inside <nav aria-label="Primary">, and a second
     navigation landmark nested in the first just duplicates the entry in a
     screen reader's landmark list. */
  links.id = 'nav-drawer';

  /* ── Toggle drawer ────────────────────────────────────── */
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('nav-open');
    btn.setAttribute('aria-expanded', String(open));
  });

  /* Close on link click */
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  /* Close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
      nav.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });

  /* ── Accessibility patches ──────────────────────────── */
  var logoSvg = nav.querySelector('.nav-logo-icon');
  if (logoSvg) logoSvg.setAttribute('aria-hidden', 'true');
  document.querySelectorAll('.section-divider').forEach(function(el){
    el.setAttribute('aria-hidden', 'true');
  });

  /* ── "/" focuses search from anywhere ─────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    var q = document.getElementById('q');
    e.preventDefault();
    if (q) { q.focus(); q.select(); }
    else { location.href = pre + 'search.html'; }
  });

  /* ── Offline support ──────────────────────────────────── */
  if ('serviceWorker' in navigator &&
      (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register(pre + 'sw.js').catch(function () {});
  }

  /* ── Auto-load companion scripts ─────────────────────── */
  var companions = ['breadcrumbs.js', 'footer.js', 'ui-delegates.js'];
  if (/\/ciphers\//.test(path)) {
    companions.push('artifact-cards-data.min.js', 'artifact-cards.js');
  }

  companions.forEach(function(f){
    var s = document.createElement('script');
    s.src = pre + 'js/' + f;
    s.defer = true;
    document.body.appendChild(s);
  });
})();

/* ── Scroll-reveal entrance animations (Phase 2C) ──────── */
(function () {
  if (typeof IntersectionObserver === 'undefined') return;
  var targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach(function (el) { observer.observe(el); });
})();
```


## JavaScript — js/pad-experiments.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/pad-experiments.js`
- Served SHA-256: `d92bae704213cdb6c4b391657eac0f0656f8412220678951d9a86f1bb1f18d5c`
- Readable-source SHA-256: `d92bae704213cdb6c4b391657eac0f0656f8412220678951d9a86f1bb1f18d5c`


```javascript
/* Small, original teaching fixtures; not historical traffic or secure messaging. */
(function (root) {
  'use strict';
  function mod(n, base) { return ((n % base) + base) % base; }
  function decimalGroup(value) {
    if (!/^\d{5}$/.test(value)) throw new Error('Enter exactly five digits in each decimal field, including leading zeroes.');
    return value;
  }
  function decimalCombine(a, b, subtract) {
    decimalGroup(a); decimalGroup(b);
    return a.split('').map(function (digit, i) {
      return String(mod(Number(digit) + (subtract ? -1 : 1) * Number(b[i]), 10));
    }).join('');
  }
  var sampleBook = Object.freeze({ '12345': 'MEET', '13579': 'DAWN', '97531': 'COURIER' });
  function lookup(group) { return sampleBook[group] || 'Unknown — no meaning supplied in this invented codebook'; }
  function decimalTrial(a, b, pad, guess) {
    var c1 = decimalCombine(a, pad, false), c2 = decimalCombine(b, pad, false);
    var difference = decimalCombine(c1, c2, true);
    var candidate = decimalCombine(guess, difference, true);
    return { c1: c1, c2: c2, difference: difference, candidate: candidate, meaning: lookup(candidate) };
  }
  function letters(value) {
    if (!/^[A-Z]{1,32}$/.test(value)) throw new Error('Use 1–32 uppercase A–Z letters, without spaces, for the message and pad.');
    return value;
  }
  function letterCombine(a, b, subtract) {
    letters(a); letters(b);
    if (a.length !== b.length) throw new Error('The demonstration pad must have exactly one letter for every message letter.');
    return a.split('').map(function (letter, i) {
      return String.fromCharCode(65 + mod(letter.charCodeAt(0) - 65 + (subtract ? -1 : 1) * (b.charCodeAt(i) - 65), 26));
    }).join('');
  }
  function tamper(ciphertext, position, delta) {
    letters(ciphertext);
    if (!Number.isInteger(position) || position < 1 || position > ciphertext.length) throw new Error('Choose a position from 1 to the message length.');
    if (!Number.isInteger(delta) || delta < 0 || delta > 25) throw new Error('Choose a whole-number shift from 0 to 25.');
    var changed = ciphertext.split('');
    changed[position - 1] = String.fromCharCode(65 + mod(changed[position - 1].charCodeAt(0) - 65 + delta, 26));
    return changed.join('');
  }
  function mountDecimal(doc) {
    if (!doc.getElementById('venona-decimal-experiment')) return;
    function el(id) { return doc.getElementById('decimal-' + id); }
    function render() {
      el('error').textContent = '';
      try {
        var a = el('a').value, b = el('b').value, pad = el('pad').value;
        var result = decimalTrial(a, b, pad, el('guess').value);
        el('results').hidden = false;
        el('cipher-a').textContent = result.c1;
        el('cipher-b').textContent = result.c2;
        el('difference').textContent = result.difference;
        el('candidate').textContent = result.candidate;
        el('meaning').textContent = result.meaning;
        el('steps').textContent = a.split('').map(function (digit, i) {
          return 'Column ' + (i + 1) + ': ' + digit + ' + ' + pad[i] + ' → ' + result.c1[i] +
            '; ' + b[i] + ' + ' + pad[i] + ' → ' + result.c2[i] +
            '; ' + result.c1[i] + ' − ' + result.c2[i] + ' → ' + result.difference[i];
        }).join('\n') + '\nAll results are reduced modulo 10, independently in each column.';
      } catch (e) {
        el('results').hidden = true;
        el('error').textContent = e.message;
      }
    }
    el('run').addEventListener('click', render);
    ['a', 'b', 'pad', 'guess'].forEach(function (id) {
      el(id).addEventListener('input', render);
    });
    render();
  }
  function mountTampering(doc) {
    if (!doc.getElementById('otp-tampering-experiment')) return;
    function el(id) { return doc.getElementById('tamper-' + id); }
    function render() {
      var hidden = el('hide').checked;
      el('sender').hidden = hidden;
      el('error').textContent = '';
      try {
        var plain = el('message').value, pad = el('pad').value;
        var ciphertext = letterCombine(plain, pad, false);
        el('position').max = String(plain.length);
        if (!el('position').value || !el('delta').value) throw new Error('Enter both a position and a shift.');
        var position = Number(el('position').value), delta = Number(el('delta').value);
        var altered = tamper(ciphertext, position, delta);
        var received = letterCombine(altered, pad, true);
        el('results').hidden = false;
        el('cipher').textContent = ciphertext;
        el('altered').textContent = altered;
        el('original').textContent = hidden ? 'Hidden in attacker view' : plain;
        el('received').textContent = hidden ? 'Hidden in attacker view' : received;
        el('outcome').textContent = delta === 0
          ? 'Shift 0 leaves every letter unchanged.'
          : 'The receiver’s letter at position ' + position + ' shifts by ' + delta + ' modulo 26. Every other letter stays unchanged.';
        el('equation').textContent = hidden
          ? 'At the chosen position: (C + Δ − K) mod 26 = (P + Δ) mod 26. No knowledge of P or K is needed to apply Δ to C.'
          : 'At position ' + position + ': ' + plain[position - 1] + '(' + (plain.charCodeAt(position - 1) - 65) + ') + ' + delta +
            ' mod 26 → ' + received[position - 1] + '(' + (received.charCodeAt(position - 1) - 65) + ').';
      } catch (e) {
        el('results').hidden = true;
        el('error').textContent = e.message;
      }
    }
    el('run').addEventListener('click', render);
    ['message', 'pad', 'position', 'delta'].forEach(function (id) { el(id).addEventListener('input', render); });
    el('hide').addEventListener('change', render);
    render();
  }
  function mount(doc) { mountDecimal(doc); mountTampering(doc); }
  var api = { decimalCombine: decimalCombine, decimalTrial: decimalTrial, lookup: lookup, letterCombine: letterCombine, tamper: tamper, mount: mount };
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root.document) {
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', function () { mount(root.document); });
    else mount(root.document);
  }
})(typeof window !== 'undefined' ? window : globalThis);
```


## JavaScript — js/protocol-math.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/protocol-math.js`
- Served SHA-256: `a9fb45687f0d4d032a8dbf135741502fe35bf6da3835e27556c85a45197e8966`
- Readable-source SHA-256: `a9fb45687f0d4d032a8dbf135741502fe35bf6da3835e27556c85a45197e8966`


```javascript
/* ==========================================================================
   protocol-math.js — pure logic for the museum's modern protocol exhibits.
   No DOM. Backs:
     ciphers/ecdsa.html                 (§158)
     ciphers/shamir-secret-sharing.html (§159)
     ciphers/zero-knowledge-proofs.html (§160)

   These three are protocols, not ciphers: they sign, share and prove rather
   than encrypt. Each is the deployed counterpart of a Hall of Foundations
   exhibit — §150 elliptic curves, §155 interpolation, §154 Fiat-Shamir — and
   the mathematics here is the same mathematics, at working size.

   All randomness is injected by the caller as explicit values, so every
   result is reproducible and the CI tests can replay exact cases.
   Exposed on window.ProtocolMath (browser) and module.exports (Node/CI).
   ========================================================================== */
(function (root) {
  "use strict";

  function mod(a, m) { return ((a % m) + m) % m; }

  // Modular inverse by extended Euclid. null when gcd(a, m) != 1.
  function modInv(a, m) {
    var t = 0, newT = 1, r = m, newR = mod(a, m);
    while (newR !== 0) {
      var q = Math.floor(r / newR);
      var tmp = t - q * newT; t = newT; newT = tmp;
      tmp = r - q * newR; r = newR; newR = tmp;
    }
    if (r > 1) return null;
    return mod(t, m);
  }

  function powmod(b, e, m) {
    var result = 1; b = mod(b, m);
    while (e > 0) {
      if (e & 1) result = mod(result * b, m);
      b = mod(b * b, m);
      e = Math.floor(e / 2);
    }
    return result;
  }

  /* ---------------------------------------------------------------- curves */
  // Points are {x, y}; the point at infinity is null (the group identity).

  function ecAdd(P, Q, a, p) {
    if (P === null) return Q;
    if (Q === null) return P;
    if (P.x === Q.x && mod(P.y + Q.y, p) === 0) return null; // P + (-P)
    var lam;
    if (P.x === Q.x && P.y === Q.y) {
      var inv2y = modInv(mod(2 * P.y, p), p);
      if (inv2y === null) return null;
      lam = mod((3 * P.x * P.x + a) * inv2y, p);
    } else {
      var invdx = modInv(mod(Q.x - P.x, p), p);
      if (invdx === null) return null;
      lam = mod((Q.y - P.y) * invdx, p);
    }
    var x = mod(lam * lam - P.x - Q.x, p);
    return { x: x, y: mod(lam * (P.x - x) - P.y, p) };
  }

  // Scalar multiplication by double-and-add.
  function ecMul(k, P, a, p) {
    var R = null, N = P;
    if (k < 0) return null;
    while (k > 0) {
      if (k & 1) R = ecAdd(R, N, a, p);
      N = ecAdd(N, N, a, p);
      k = Math.floor(k / 2);
    }
    return R;
  }

  function ecOnCurve(P, a, b, p) {
    if (P === null) return true;
    return mod(P.y * P.y, p) === mod(P.x * P.x * P.x + a * P.x + b, p);
  }

  /* ---------------------------------------------------------------- ECDSA */
  // curve = {a, b, p, G, n} — n is the (prime) order of G.
  // h is the message hash reduced into [0, n). k is the per-signature nonce.
  // Returns null when the nonce produces a degenerate signature, which is the
  // real algorithm's behaviour too: you resample and try again.
  function ecdsaSign(h, d, k, curve) {
    var R = ecMul(k, curve.G, curve.a, curve.p);
    if (R === null) return null;
    var r = mod(R.x, curve.n);
    if (r === 0) return null;
    var kInv = modInv(k, curve.n);
    if (kInv === null) return null;
    var s = mod(kInv * mod(h + r * d, curve.n), curve.n);
    if (s === 0) return null;
    return { r: r, s: s };
  }

  function ecdsaVerify(h, sig, Q, curve) {
    if (!sig) return false;
    if (sig.r <= 0 || sig.r >= curve.n || sig.s <= 0 || sig.s >= curve.n) return false;
    if (!ecOnCurve(Q, curve.a, curve.b, curve.p) || Q === null) return false;
    var w = modInv(sig.s, curve.n);
    if (w === null) return false;
    var u1 = mod(h * w, curve.n);
    var u2 = mod(sig.r * w, curve.n);
    var X = ecAdd(ecMul(u1, curve.G, curve.a, curve.p),
                  ecMul(u2, Q, curve.a, curve.p), curve.a, curve.p);
    if (X === null) return false;
    return mod(X.x, curve.n) === sig.r;
  }

  // The failure that broke the PlayStation 3 and drained Bitcoin wallets:
  // sign twice with the same nonce and the private key falls out by algebra.
  //   s1 = k^-1 (h1 + r d),  s2 = k^-1 (h2 + r d)
  //   => k = (h1 - h2) / (s1 - s2),  then d = (s1 k - h1) / r
  // Returns {k, d} or null if the two signatures do not share a nonce.
  function recoverFromReusedNonce(h1, s1, h2, s2, r, n) {
    var ds = mod(s1 - s2, n);
    if (ds === 0) return null;
    var dsInv = modInv(ds, n);
    if (dsInv === null) return null;
    var k = mod(mod(h1 - h2, n) * dsInv, n);
    var rInv = modInv(r, n);
    if (rInv === null) return null;
    var d = mod(mod(mod(s1 * k, n) - h1, n) * rInv, n);
    return { k: k, d: d };
  }

  /* ------------------------------------------------------ Shamir sharing */
  // Split `secret` so that any `k` of `n` shares reconstruct it and any k-1
  // reveal nothing. coeffs are the k-1 random coefficients above the constant
  // term, supplied by the caller.
  function shamirSplit(secret, k, n, p, coeffs) {
    var poly = [mod(secret, p)];
    for (var i = 0; i < k - 1; i++) poly.push(mod(coeffs[i], p));
    var shares = [];
    for (var x = 1; x <= n; x++) shares.push({ x: x, y: polyEval(poly, x, p) });
    return { shares: shares, poly: poly };
  }

  function polyEval(poly, x, p) {
    var acc = 0;
    for (var i = poly.length - 1; i >= 0; i--) acc = mod(acc * x + poly[i], p);
    return acc;
  }

  // Lagrange interpolation evaluated at zero — the constant term is the secret.
  function shamirCombine(shares, p) {
    var total = 0;
    for (var i = 0; i < shares.length; i++) {
      var num = 1, den = 1;
      for (var j = 0; j < shares.length; j++) {
        if (i === j) continue;
        num = mod(num * mod(-shares[j].x, p), p);
        den = mod(den * mod(shares[i].x - shares[j].x, p), p);
      }
      var dInv = modInv(den, p);
      if (dInv === null) return null;
      total = mod(total + mod(shares[i].y * mod(num * dInv, p), p), p);
    }
    return total;
  }

  /* --------------------------------------------- Schnorr zero-knowledge */
  // group = {p, q, g} with g of prime order q modulo p. Public key y = g^x.
  //   commit:  t = g^r
  //   respond: s = r + c x  (mod q)
  //   verify:  g^s == t * y^c  (mod p)
  function schnorrCommit(r, group) { return powmod(group.g, r, group.p); }
  function schnorrRespond(r, c, x, group) { return mod(r + c * x, group.q); }
  function schnorrVerify(t, c, s, y, group) {
    return powmod(group.g, s, group.p) === mod(t * powmod(y, c, group.p), group.p);
  }

  // The zero-knowledge argument, made concrete: pick the response and the
  // challenge first, then solve for the commitment. The transcript verifies
  // perfectly and no secret was used — which is exactly why a real transcript
  // proves nothing to anyone who did not choose the challenge themselves.
  function schnorrSimulate(c, s, y, group) {
    var yc = powmod(y, c, group.p);
    var inv = modInv(yc, group.p);
    if (inv === null) return null;
    return { t: mod(powmod(group.g, s, group.p) * inv, group.p), c: c, s: s };
  }

  // Soundness from the other side: a prover who can answer two different
  // challenges on one commitment must know the secret, and it drops out.
  //   s1 - s2 = (c1 - c2) x  =>  x = (s1 - s2) / (c1 - c2)
  function schnorrExtract(s1, c1, s2, c2, group) {
    var dc = mod(c1 - c2, group.q);
    if (dc === 0) return null;
    var inv = modInv(dc, group.q);
    if (inv === null) return null;
    return mod(mod(s1 - s2, group.q) * inv, group.q);
  }

  var api = {
    mod: mod, modInv: modInv, powmod: powmod,
    ecAdd: ecAdd, ecMul: ecMul, ecOnCurve: ecOnCurve,
    ecdsaSign: ecdsaSign, ecdsaVerify: ecdsaVerify,
    recoverFromReusedNonce: recoverFromReusedNonce,
    shamirSplit: shamirSplit, shamirCombine: shamirCombine, polyEval: polyEval,
    schnorrCommit: schnorrCommit, schnorrRespond: schnorrRespond,
    schnorrVerify: schnorrVerify, schnorrSimulate: schnorrSimulate,
    schnorrExtract: schnorrExtract,
    // The toy parameters the exhibits use, kept here so pages and tests agree.
    // y^2 = x^3 + 3x + 2 over F_97: 102 affine points plus infinity, so the
    // group has prime order 103 and every point except infinity generates it.
    CURVE: { a: 3, b: 2, p: 97, G: { x: 2, y: 4 }, n: 103 },
    GROUP: { p: 467, q: 233, g: 4 },
    SHAMIR_P: 257
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ProtocolMath = api;

})(typeof self !== "undefined" ? self : this);
```


## JavaScript — js/research-cases.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/research-cases.js`
- Served SHA-256: `bc67c743e701eab7ac56c2ee391435c4c540255a5968c55524d9698fd01256e9`
- Readable-source SHA-256: `bc67c743e701eab7ac56c2ee391435c4c540255a5968c55524d9698fd01256e9`


```javascript
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
```


## JavaScript — js/research-language-model.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/research-language-model.js`
- Served SHA-256: `2621e72bf6124d1d0e864d7ff643bcac62cbb22ae56a4cb0be70388f6129a492`
- Readable-source SHA-256: `2621e72bf6124d1d0e864d7ff643bcac62cbb22ae56a4cb0be70388f6129a492`


```javascript
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
```


## JavaScript — js/research-model.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/research-model.js`
- Served SHA-256: `8b7b94977421047d3cb360dad250af8513c3d7d350c141b0d4f1fc466e42b174`
- Readable-source SHA-256: `8b7b94977421047d3cb360dad250af8513c3d7d350c141b0d4f1fc466e42b174`


```javascript
/* Source-preserving research tools. All examples and searches run locally.
 * Papers and model boundaries: docs/PAPER_REVIEW_IMPLEMENTATION.md.
 */
'use strict';
(function (global) {
  const KIND = 'cipher-museum-transcription';
  const TYPES = ['ciphertext', 'cleartext', 'marginal', 'missing', 'editorial'];
  const KEY_TYPES = ['letter', 'syllable', 'word', 'name', 'null', 'space', 'repeat', 'erase', 'unknown'];
  const copy = x => JSON.parse(JSON.stringify(x));
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  function check(ok, message) { if (!ok) throw new Error(message); }
  function string(x, max, label) { check(typeof x === 'string' && x.length <= max, label + ' is missing or too long.'); return x; }
  function integer(x, min, max, label) { check(Number.isInteger(x) && x >= min && x <= max, 'Invalid ' + label + '.'); return x; }
  function list(x, max, label) { check(Array.isArray(x) && x.length <= max, 'Invalid ' + label + '.'); return x; }
  function url(x) {
    string(x, 2000, 'Source URL');
    if (x) { let parsed; try { parsed = new URL(x); } catch (_) { throw new Error('Use a complete http or https source URL.'); }
      check(['https:', 'http:'].includes(parsed.protocol) && !parsed.username && !parsed.password, 'Use a source URL without credentials and with http or https.'); }
    return x;
  }
  function source(x) {
    check(x && typeof x === 'object' && !Array.isArray(x), 'Invalid source record.');
    const result = {};
    for (const field of ['artifactId', 'archive', 'shelfmark', 'folio', 'transcriber', 'date', 'method', 'imageName']) result[field] = string(x[field] || '', 500, field);
    result.url = url(x.url || ''); return result;
  }
  function create(raw = '') {
    string(raw, 10000, 'Transcription');
    return { version: 2, kind: KIND, raw, mode: 'symbols', width: 1, annotations: {}, revision: 1,
      source: source({}), revisions: [{ id: 1, raw, reason: 'Initial transcription' }], spans: [], layers: [], keys: [], relations: [] };
  }
  // Legacy positions count Unicode code points, not UTF-16 code units.
  function legacyTokens(raw, mode, width) {
    const tokens = []; let start = -1, text = '';
    function flush(end) { if (text) tokens.push({ start, end, text }); text = ''; start = -1; }
    const chars = Array.from(raw);
    chars.forEach((ch, i) => {
      const keep = !/\s/u.test(ch) && (mode === 'symbols' || ch === '?' || (mode === 'digits' ? /[0-9]/.test(ch) : /[A-Za-z]/.test(ch)));
      if (!keep) { flush(i); return; }
      if (start < 0) start = i;
      text += ch; if (Array.from(text).length === width) flush(i + 1);
    }); flush(chars.length); return tokens;
  }
  function migrate(v) {
    check(v && v.kind === KIND && (v.version === 1 || v.version === 2), 'Unsupported transcription export.');
    if (v.version === 2) return validate(v);
    string(v.raw, 10000, 'Transcription');
    check(['symbols', 'digits', 'letters'].includes(v.mode) && [1, 2, 5].includes(v.width), 'Unsupported legacy alphabet or width.');
    check(v.annotations && typeof v.annotations === 'object' && !Array.isArray(v.annotations), 'Invalid legacy annotations.');
    const d = create(v.raw); d.mode = v.mode; d.width = v.width;
    const tokens = legacyTokens(v.raw, v.mode, v.width);
    Object.entries(v.annotations).forEach(([index, status]) => {
      check(/^(0|[1-9]\d*)$/.test(index) && Number(index) < tokens.length && ['uncertain', 'missing'].includes(status), 'Invalid legacy annotation.');
      const t = tokens[Number(index)];
      d.spans.push({ id: 'span-' + (d.spans.length + 1), revision: 1, start: t.start, end: t.end, literal: t.text,
        type: status === 'missing' ? 'missing' : 'ciphertext', uncertain: true, alternatives: [], reading: '', reason: 'Imported legacy ' + status + ' annotation', region: null });
    }); return validate(d);
  }
  function validate(value) {
    check(value && value.version === 2 && value.kind === KIND, 'Unsupported evidence document.');
    check(JSON.stringify(value).length <= 750000, 'Evidence document exceeds 750,000 characters.');
    const d = copy(value); string(d.raw, 10000, 'Transcription'); d.source = source(d.source);
    check(['symbols', 'digits', 'letters'].includes(d.mode) && [1, 2, 5].includes(d.width), 'Invalid token settings.');
    integer(d.revision, 1, 50, 'revision'); const revisions = new Map();
    list(d.revisions, 50, 'revisions').forEach(r => {
      integer(r.id, 1, 50, 'revision ID'); check(!revisions.has(r.id), 'Duplicate revision.');
      string(r.raw, 10000, 'Revision text'); string(r.reason, 1000, 'Revision reason');
      check(r.id === 1 || r.reason.trim(), 'Each changed transcription needs a revision reason.'); revisions.set(r.id, r);
    });
    check(revisions.has(d.revision) && revisions.get(d.revision).raw === d.raw, 'Current transcription must match its recorded revision.');
    check(revisions.has(1), 'The original transcription must be retained.');
    check(d.revisions.every((r,i) => r.id === i+1) && d.revision === d.revisions.length, 'Revisions must be consecutive, with the latest revision current.');
    d.annotations = {}; // v2 annotations use source spans, never mutable token indices.
    const ids = new Set();
    function unique(id) { string(id, 100, 'Record ID'); check(/^[A-Za-z][A-Za-z0-9_-]*$/.test(id) && !/^revision-/.test(id) && !ids.has(id), 'Invalid, reserved or duplicate record ID.'); ids.add(id); }
    list(d.spans, 500, 'spans').forEach(s => {
      unique(s.id); check(revisions.has(s.revision), 'Span has no source revision.');
      const chars = Array.from(revisions.get(s.revision).raw);
      integer(s.start, 0, chars.length - 1, 'span start'); integer(s.end, s.start + 1, chars.length, 'span end');
      check(s.literal === chars.slice(s.start, s.end).join(''), 'Span does not match its source.');
      check(TYPES.includes(s.type) && typeof s.uncertain === 'boolean', 'Invalid span type or uncertainty.');
      list(s.alternatives, 20, 'alternative readings').forEach(a => string(a, 200, 'Alternative'));
      string(s.reading, 200, 'Accepted reading'); string(s.reason, 1000, 'Reading reason');
      check(!s.reading || !s.alternatives.length || s.alternatives.includes(s.reading), 'Accepted reading must be one of the alternatives.');
      check(s.uncertain || (!s.alternatives.length || (s.reading && s.reason.trim())), 'Resolving alternative readings requires a choice and reason.');
      if (s.region !== null) {
        string(s.imageName, 500, 'Region image filename'); check(s.imageName.trim(), 'An image region needs its recorded source filename.');
        list(s.region, 4, 'image region'); check(s.region.length === 4 && s.region.every(n => Number.isFinite(n) && n >= 0 && n <= 1), 'Image region uses four fractions between 0 and 1.');
        check(s.region[2] > 0 && s.region[3] > 0 && s.region[0] + s.region[2] <= 1.00000001 && s.region[1] + s.region[3] <= 1.00000001, 'Image region must fit inside the image.');
      }
    });
    const parents = new Set(d.revisions.map(r => 'revision-' + r.id));
    list(d.layers, 100, 'reading layers').forEach(l => {
      unique(l.id); check(['symbols', 'diplomatic', 'normalized', 'translation'].includes(l.kind), 'Unknown reading layer.');
      check(parents.has(l.parent), 'A reading layer must reference an earlier source or layer.');
      check(revisions.has(l.revision), 'Reading layer has no source revision.');
      const parentLayer = d.layers.find(p => p.id === l.parent);
      const parentRevision = parentLayer ? parentLayer.revision : Number(l.parent.replace('revision-', ''));
      check(parentRevision === l.revision, 'Reading layer belongs to a different source revision.');
      string(l.text, 20000, 'Layer text'); string(l.note, 1000, 'Transformation note'); check(l.note.trim(), 'Describe the transformation.'); parents.add(l.id);
    });
    list(d.keys, 30, 'keys').forEach(k => { unique(k.id); string(k.title, 200, 'Key title'); url(k.sourceUrl); validateKey(k.entries); });
    list(d.relations, 100, 'relationships').forEach(r => {
      ['from', 'to', 'evidence'].forEach(f => string(r[f], 2000, 'Relationship ' + f));
      check(r.from.trim() && r.to.trim() && r.evidence.trim(), 'Relationships need two identifiers and supporting evidence.');
      check(['transcribes', 'applies-key', 'supports', 'alternative-to'].includes(r.type), 'Unsupported relationship type.');
    });
    return d;
  }
  function revise(d, raw, reason) {
    d = validate(d); string(raw, 10000, 'Transcription'); if (raw === d.raw) return d;
    check(d.revisions.length < 50, 'Export this record before starting a new document: 50 revisions reached.');
    check(typeof reason === 'string' && reason.trim(), 'Describe why the transcription changed.');
    d.revision = Math.max(...d.revisions.map(r => r.id)) + 1; d.raw = raw;
    d.revisions.push({ id: d.revision, raw, reason }); return validate(d);
  }
  function annotate(d, input) {
    d = validate(d); const s = copy(input);
    s.id = 'span-' + (1 + Math.max(0, ...d.spans.map(x => Number(x.id.split('-').pop()) || 0)));
    s.revision = d.revision; s.literal = Array.from(d.raw).slice(s.start, s.end).join('');
    if (s.region !== null) s.imageName = d.source.imageName;
    d.spans.push(s); return validate(d);
  }
  function addLayer(d, kind, parent, text, note) {
    d = validate(d); d.layers.push({ id: 'layer-' + (d.layers.length + 1), revision: d.revision, kind, parent, text, note }); return validate(d);
  }
  function validateKey(entries) {
    list(entries, 150, 'key entries'); const seen = new Set();
    entries.forEach(e => {
      string(e.symbol, 100, 'Key symbol'); check(e.symbol.trim() && !seen.has(e.symbol), 'Each key symbol must be nonempty and unique.'); seen.add(e.symbol);
      check(KEY_TYPES.includes(e.type), 'Unknown key-entry type.'); list(e.values, 20, 'key readings').forEach(v => string(v, 200, 'Key reading'));
      if (['null', 'space', 'repeat', 'erase', 'unknown'].includes(e.type)) check(e.values.length === 0, 'Control entries have no literal readings.');
      else { check(e.values.length > 0 && e.values.every(v => v.length > 0), 'Supply at least one reading.'); if (e.type === 'letter') check(e.values.every(v => Array.from(v).length === 1), 'A letter entry contains single characters.'); }
    }); return entries;
  }
  function applyKey(tokens, entries) {
    validateKey(entries); const key = new Map(entries.map(e => [e.symbol, e])); let text = '', unresolved = 0;
    tokens.forEach(t => {
      const e = key.get(t);
      if (!e || e.type === 'unknown') { text += '⟦' + t + '?⟧'; unresolved++; }
      else if (e.type === 'null') return;
      else if (e.type === 'space') text += ' ';
      else if (e.type === 'repeat' || e.type === 'erase') {
        // This explicit teaching convention acts on one resolved Unicode character.
        if (!text || text.endsWith('⟧')) { text += '⟦' + e.type + '?⟧'; unresolved++; }
        else { const chars = Array.from(text); if (e.type === 'repeat') text += chars.at(-1); else text = chars.slice(0, -1).join(''); }
      } else if (e.values.length > 1) { text += '⟦' + e.values.join('/') + '⟧'; unresolved++; }
      else text += e.values[0];
    }); return { text, unresolved, tokens: tokens.length };
  }
  function segment(digits, key, boundaries = [], limit = 10000, score = () => 0) {
    check(typeof digits === 'string' && /^[0-9]{1,80}$/.test(digits), 'Use 1–80 digits without spaces; the source will not be normalized.');
    check(key && typeof key === 'object' && !Array.isArray(key), 'Supply a code-to-reading object.');
    const entries = Object.entries(key); check(entries.length > 0 && entries.length <= 64, 'Use 1–64 numerical key entries.');
    entries.forEach(([c, p]) => { check(/^[0-9]{1,6}$/.test(c), 'Codes must contain 1–6 digits.'); string(p, 50, 'Code reading'); check(p.length > 0, 'Code readings cannot be empty.'); });
    integer(limit, 1, 20000, 'path budget'); list(boundaries, 79, 'locked boundaries').forEach(b => integer(b, 1, digits.length - 1, 'locked boundary'));
    const paths = []; let visited = 0, complete = true, total = 0;
    function visit(pos, codes, text) {
      if (visited >= limit) { complete = false; return; } visited++;
      if (pos === digits.length) {
        const value = score(text); check(Number.isFinite(value), 'The selected scoring model cannot score this reading.');
        paths.push({ codes, text, score: value }); total++;
        paths.sort((a,b) => b.score - a.score || a.codes.join('|').localeCompare(b.codes.join('|'))); if (paths.length > 32) paths.pop(); return;
      }
      for (const [code, reading] of entries) {
        const end = pos + code.length;
        if (digits.startsWith(code, pos) && !boundaries.some(b => b > pos && b < end)) visit(end, codes.concat(code), text + reading);
        if (!complete) return;
      }
    }
    visit(0, [], ''); return { paths, visited, complete, total, retained: paths.length, limit, boundaries: boundaries.slice() };
  }
  function rng(seed) {
    let x = seed >>> 0;
    return function () { x += 0x6D2B79F5; let t = x; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function parseSymbols(raw) {
    string(raw, 12000, 'Symbol sequence'); const tokens = raw.trim().split(/\s+/u).filter(Boolean);
    check(tokens.length >= 3 && tokens.length <= 600, 'Use 3–600 whitespace-separated symbol IDs.');
    check(tokens.every(t => t.length <= 40 && !t.includes('?')), 'Resolve unknown symbols first; IDs may be at most 40 characters.');
    check(new Set(tokens).size <= 100, 'Use at most 100 distinct symbol IDs.'); return tokens;
  }
  // Deterministic simulated annealing; independent assignments permit many-to-one keys.
  function search(tokens, options, score, progress = () => {}) {
    parseSymbols(tokens.join(' ')); const symbols = Array.from(new Set(tokens));
    const seed = integer(options.seed, 0, 4294967295, 'seed');
    const steps = integer(options.steps, 1, 100000, 'search budget');
    check(steps * tokens.length <= 20000000, 'Reduce the step budget: maximum 20 million symbol evaluations.');
    const locks = options.locks || {}; check(typeof locks === 'object' && !Array.isArray(locks), 'Invalid locked key.');
    Object.entries(locks).forEach(([s,v]) => check(symbols.includes(s) && /^[A-Z]$/.test(v), 'A lock must name a present symbol and one A–Z letter.'));
    const random = rng(seed), alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', weighted = 'EEEEEEEEEEEETTTTTTTTTAAAAAAAAOOOOOOOIIIIIIINNNNNNNSSSSSSHHHHHHRRRRRRDDDDLLLLCCCUUUMMWWFFGGYYPPBBVKJXQZ';
    const ids = tokens.map(t => symbols.indexOf(t)), free = symbols.map((_,i) => i).filter(i => !own(locks, symbols[i]));
    let key = [], current = -Infinity, best = -Infinity; const candidates = [], trace = [];
    function decode(k) { return ids.map(i => k[i]).join(''); }
    function retain(k, fit, step) {
      const plaintext = decode(k); if (candidates.some(c => c.plaintext === plaintext)) return;
      candidates.push({ plaintext, score: fit, step, key: Object.fromEntries(symbols.map((s,i) => [s,k[i]])) });
      candidates.sort((a,b) => b.score - a.score || a.plaintext.localeCompare(b.plaintext)); if (candidates.length > 5) candidates.pop();
    }
    const restartLength = Math.min(5000, steps);
    for (let i = 0; i < steps; i++) {
      if (i % restartLength === 0) {
        key = symbols.map(s => own(locks,s) ? locks[s] : weighted[Math.floor(random() * weighted.length)]);
        current = score(decode(key)); check(Number.isFinite(current), 'Scoring model returned an invalid value.'); retain(key, current, i);
      }
      if (!free.length) { retain(key, current, i); best = current; trace.push({ step: 0, score: current }); break; }
      const a = free[Math.floor(random() * free.length)], oldA = key[a];
      let b = -1, oldB;
      if (free.length > 1 && random() < 0.2) { b = free[Math.floor(random() * free.length)]; oldB = key[b]; key[a] = oldB; key[b] = oldA; }
      else key[a] = alphabet[Math.floor(random() * 26)];
      const next = score(decode(key)), temp = 0.2 + 8 * (1 - (i % restartLength) / restartLength);
      check(Number.isFinite(next), 'Scoring model returned an invalid value.');
      if (next >= current || random() < Math.exp((next - current) / temp)) current = next;
      else { key[a] = oldA; if (b >= 0) key[b] = oldB; }
      if (current >= best || i % 1000 === 0) { retain(key, current, i + 1); best = Math.max(best, current); }
      if (i % 1000 === 0 || i === steps - 1) { trace.push({ step: i + 1, score: candidates[0].score }); progress({ step: i + 1, steps, score: candidates[0].score }); }
    }
    return { candidates, trace, seed, requestedSteps: steps, completedSteps: free.length ? steps : 0,
      task: free.length ? 'key-recovery-candidates' : 'known-key-application', locks: copy(locks),
      model: score.modelId || 'custom-scoring-function', verified: false, scope: 'Letter homophones only; no word codes, nulls, control signs or historical-language model.' };
  }
  function metrics(expected, actual, expectedKey, actualKey) {
    // Levenshtein distance keeps insertions/deletions distinct from key errors.
    const a = Array.from(expected), b = Array.from(actual); let row = b.map((_,i) => i + 1); row.unshift(0);
    for (let i=1;i<=a.length;i++) { const next=[i]; for (let j=1;j<=b.length;j++) next[j]=Math.min(next[j-1]+1,row[j]+1,row[j-1]+(a[i-1]===b[j-1]?0:1)); row=next; }
    const keys = Object.keys(expectedKey || {});
    return { exact: expected === actual, editDistance: row[b.length], plaintextError: row[b.length] / Math.max(1,a.length),
      keyError: keys.length ? keys.filter(k => !actualKey || actualKey[k] !== expectedKey[k]).length / keys.length : null };
  }
  function z340Route(kind = 'diagonal') {
    check(['diagonal', 'row-major'].includes(kind), 'Unknown route.');
    return Array.from({length:153}, (_, i) => kind === 'diagonal' ? (i % 9) * 17 + (2 * i % 17) : i);
  }
  const api = { TYPES, KEY_TYPES, create, migrate, validate, revise, annotate, addLayer, validateKey, applyKey, segment, rng, parseSymbols, search, metrics, url, z340Route };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.MuseumResearch = api;
})(typeof window !== 'undefined' ? window : globalThis);
```


## JavaScript — js/research-ui.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/research-ui.js`
- Served SHA-256: `848a83b9b5fdd26f278b1843e1b6cf5a75fa162788be29c75a19df4e83cacba6`
- Readable-source SHA-256: `848a83b9b5fdd26f278b1843e1b6cf5a75fa162788be29c75a19df4e83cacba6`


```javascript
/* Evidence workbench: local files only; imported text is never inserted as HTML. */
'use strict';
(function () {
  const R = window.MuseumResearch, $ = id => document.getElementById(id);
  let doc = R.create(''), previous = null, imageURL = null, worker = null, receipt = null, searchGeneration = 0;
  const sourceFields = ['artifactId','archive','shelfmark','folio','transcriber','date','method','url','imageName'];
  function status(message, error = false) { $('record-status').textContent = message; $('record-status').dataset.error = String(error); }
  function guard(fn) { return function () { try { fn(); } catch (e) { status(e.message, true); } }; }
  function el(tag, text, parent) { const n = document.createElement(tag); n.textContent = text; if (parent) parent.appendChild(n); return n; }
  function download(name, value) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], {type:'application/json'}));
    const a = el('a', ''); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function pending() { return $('source-raw').value !== doc.raw; }
  function commit() {
    let next = R.revise(doc, $('source-raw').value, $('revision-reason').value);
    for (const f of sourceFields) next.source[f] = $('source-' + f).value;
    next = R.validate(next); previous = doc; doc = next; $('restore-record').disabled = false;
    $('revision-reason').value = ''; render();
  }
  function paintRegion(region) {
    const box = $('image-region'); box.hidden = !region || !imageURL;
    if (region) ['left','top','width','height'].forEach((f,i) => { box.style[f] = (region[i] * 100) + '%'; });
  }
  function clearImage() { if (imageURL) URL.revokeObjectURL(imageURL); imageURL = null; $('source-image').removeAttribute('src'); $('image-wrap').hidden = true; $('image-file').value = ''; }
  function render() {
    $('source-raw').value = doc.raw;
    sourceFields.forEach(f => { $('source-' + f).value = doc.source[f]; });
    $('revision-label').textContent = 'Current revision ' + doc.revision + ' · ' + Array.from(doc.raw).length + ' Unicode characters. Original transcription retained.';
    const revisions = $('revision-list'); revisions.replaceChildren();
    doc.revisions.forEach(r => { const d = el('details','',revisions); el('summary','Revision ' + r.id + ' — ' + r.reason,d); el('pre',r.raw,d); });
    const spans = $('span-list'); spans.replaceChildren();
    doc.spans.forEach(s => {
      const card = el('div','',spans); card.className = 'research-card';
      el('h3',s.id + ' · ' + s.type + (s.uncertain ? ' · unresolved' : ' · recorded reading'),card);
      el('p','Revision ' + s.revision + (s.revision === doc.revision ? ' (current)' : ' (earlier source; not moved to current text)') + ', characters ' + (s.start+1) + '–' + s.end + ': ' + s.literal,card);
      el('p','Alternatives: ' + (s.alternatives.join(' / ') || 'none recorded') + '. Reading: ' + (s.reading || 'unresolved') + '. Reason: ' + (s.reason || 'not recorded'),card);
      if (s.region) { el('p','Region image: '+s.imageName,card); const b = el('button','Show image region',card); b.type = 'button'; b.onclick = () => {
        if (!imageURL || !$('image-file').files[0] || $('image-file').files[0].name !== s.imageName) { paintRegion(null);status('Choose the recorded image '+s.imageName+' first. A matching filename is not an authenticity check.');return; }
        paintRegion(s.region);status('Region displayed. Verify the selected image against the archive source; filenames alone cannot establish identity.');
      }; }
    });
    const layers = $('layer-list'), parent = $('layer-parent'); layers.replaceChildren(); parent.replaceChildren();
    const op = el('option','Source revision ' + doc.revision,parent); op.value = 'revision-' + doc.revision;
    doc.layers.forEach(l => {
      if (l.revision === doc.revision) { const o = el('option',l.id + ' (' + l.kind + ')',parent); o.value = l.id; }
      const d = el('details','',layers); el('summary',l.id + ' · ' + l.kind + ' · revision ' + l.revision,d); el('p','Derived from ' + l.parent + '. ' + l.note,d); el('pre',l.text,d);
    });
    $('relations-list').textContent = JSON.stringify({keys:doc.keys,relations:doc.relations},null,2);
    paintRegion(null);
  }
  $('save-revision').onclick = guard(() => { commit(); status('Source and revision saved in this tab. Export the record to keep it after closing.'); });
  $('restore-record').onclick = guard(() => { if (previous) { const current = doc; doc = previous; previous = current; clearImage(); render(); status('Previous record restored. Press again to return to the other record.'); } });
  $('export-record').onclick = guard(() => { commit(); download('cipher-museum-evidence-v2.json', doc); status('Evidence record exported. Local image bytes are separate.'); });
  $('import-file').onchange = async function () {
    const file = this.files[0]; if (!file) return;
    try {
      if (file.size > 750000) throw new Error('Import is limited to 750,000 bytes.');
      const next = R.migrate(JSON.parse(await file.text())); previous = doc; doc = next; clearImage(); render(); $('restore-record').disabled = false;
      status('Imported version ' + doc.version + ' evidence record. Previous saved record is available with Restore.');
    } catch (e) { status('Import rejected; saved record retained. ' + e.message, true); }
    this.value = '';
  };
  $('image-file').onchange = function () {
    const file = this.files[0]; if (!file) return;
    if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 8000000) { status('Choose a PNG, JPEG or WebP image under 8 MB.',true); return; }
    if (imageURL) URL.revokeObjectURL(imageURL); imageURL = URL.createObjectURL(file);
    $('source-image').src = imageURL; $('image-wrap').hidden = false; $('source-imageName').value = file.name; paintRegion(null);
    status('Image opened locally. Save the source record to retain its filename; the image itself is not exported.');
  };
  $('source-image').onerror = () => { clearImage(); status('The selected file could not be decoded as an image.',true); };
  $('select-span').onclick = () => {
    const t = $('source-raw'); $('span-start').value = Array.from(t.value.slice(0,t.selectionStart)).length + 1;
    $('span-end').value = Array.from(t.value.slice(0,t.selectionEnd)).length;
    status('Selected text copied to character positions. Save any source change before adding a span.');
  };
  $('add-span').onclick = guard(() => {
    if (pending()) throw new Error('Save the revised source before annotating it.');
    const region = $('span-region').value.trim() ? JSON.parse('[' + $('span-region').value + ']') : null;
    if (region && $('source-imageName').value !== doc.source.imageName) throw new Error('Save the source image filename before attaching a region.');
    const next = R.annotate(doc,{start:Number($('span-start').value)-1,end:Number($('span-end').value),type:$('span-type').value,
      uncertain:$('span-uncertain').checked, alternatives:$('span-alternatives').value.split('\n').map(x=>x.trim()).filter(Boolean),
      reading:$('span-reading').value, reason:$('span-reason').value, region});
    previous = doc; doc = next; $('restore-record').disabled=false; render(); paintRegion(region); status('Evidence span appended. Earlier annotations remain in the record.');
  });
  $('add-layer').onclick = guard(() => {
    if (pending()) throw new Error('Save the source revision first.');
    const next = R.addLayer(doc,$('layer-kind').value,$('layer-parent').value,$('layer-text').value,$('layer-note').value);
    previous=doc;doc=next;$('restore-record').disabled=false;render();status('Derived reading appended; the source has not been overwritten.');
  });
  ['typed-key','key-input'].forEach(id=>$(id).addEventListener('input',()=>{$('key-output').textContent='Inputs changed. Apply the key again.';}));
  $('apply-key').onclick = guard(() => {
    const tokens=$('key-input').value.trim().split(/\s+/u).filter(Boolean);
    if (!tokens.length || tokens.length>3000) throw new Error('Use 1–3,000 whitespace-separated symbol IDs.');
    const result=R.applyKey(tokens,JSON.parse($('typed-key').value));
    $('key-output').textContent=result.text+'\n'+result.unresolved+' unresolved occurrences. Known-key application; no key recovery performed.';
  });
  $('save-key').onclick = guard(() => {
    const next=R.validate(doc), entries=JSON.parse($('typed-key').value); R.validateKey(entries);
    const id='key-'+(next.keys.length+1);next.keys.push({id,title:$('key-title').value,sourceUrl:$('key-source').value,entries});
    previous=doc;doc=R.validate(next);$('restore-record').disabled=false;render();status(id+' recorded. Add an evidence-backed relationship below if you applied it to a reading.');
  });
  $('add-relation').onclick = guard(() => {
    const next=R.validate(doc);next.relations.push({from:$('relation-from').value,to:$('relation-to').value,type:$('relation-type').value,evidence:$('relation-evidence').value});
    previous=doc;doc=R.validate(next);$('restore-record').disabled=false;render();status('Relationship and its supporting evidence recorded. External identifiers are allowed.');
  });
  let segmentation=null;
  function invalidateSegments() { segmentation=null;$('segment-output').textContent='Inputs changed. Recompute the alternatives.'; }
  ['segment-digits','segment-key','segment-locks','segment-budget','segment-score'].forEach(id=>$(id).addEventListener('input',invalidateSegments));
  $('segment-run').onclick=guard(()=>{
    const digits=$('segment-digits').value,key=JSON.parse($('segment-key').value),bounds=$('segment-locks').value.trim();
    const scoring=$('segment-score').value;
    const fit=scoring==='english' ? s=>{const letters=s.toUpperCase().replace(/[^A-Z]/g,'');return letters.length>=3 ? DetectiveLangModel.fitness(letters) : 0;} : ()=>0;
    segmentation=R.segment(digits,key,bounds?bounds.split(',').map(s=>Number(s.trim())):[],Number($('segment-budget').value),fit);
    const out=$('segment-output');out.replaceChildren();
    el('p',(segmentation.complete?'All paths explored.':'Budget reached; alternatives may be missing.')+' '+segmentation.total+' complete paths found; '+segmentation.retained+' retained. '+segmentation.visited+' search nodes visited. Scoring: '+scoring+'.',out);
    if (!segmentation.paths.length) el('p',segmentation.complete?'No path matches this key and these boundary locks. Every digit is unresolved.':'No complete path found within the budget. This is not proof that no path exists.',out);
    segmentation.paths.forEach(p=>{
      const d=el('div','',out);d.className='research-card';el('pre',p.codes.join(' | ')+' → '+p.text+'\nModel score: '+p.score.toFixed(2),d);
      const b=el('button','Record this segmentation as a hypothesis',d);b.type='button';b.onclick=guard(()=>{
        if(pending()||doc.raw!==digits)throw new Error('The saved source must be exactly these digits before attaching a segmentation. Copy them into the source and save a revision first.');
        const note='Known-key segmentation hypothesis. Key: '+JSON.stringify(key)+'. Mandatory boundaries: '+JSON.stringify(segmentation.boundaries)+'. Scoring: '+scoring+'. Choice does not establish a historical reading.';
        previous=doc;doc=R.addLayer(doc,'symbols','revision-'+doc.revision,p.codes.join(' | '),note);$('restore-record').disabled=false;render();status('Segmentation hypothesis appended; original digits retained.');
      });
    });
  });
  function stopSearch(message) { searchGeneration++;if(worker)worker.terminate();worker=null;receipt=null;$('search-run').disabled=false;$('search-cancel').disabled=true;$('search-export').disabled=true;$('search-results').replaceChildren();$('search-status').textContent=message; }
  ['search-raw','search-locks','search-seed','search-steps'].forEach(id=>$(id).addEventListener('input',()=>stopSearch('Inputs changed. Run a new search.')));
  $('search-cancel').onclick=()=>stopSearch('Search cancelled. No completed receipt was recorded.');
  $('search-run').onclick=guard(()=>{
    stopSearch('Starting local search…');const raw=$('search-raw').value;R.parseSymbols(raw);
    const options={seed:Number($('search-seed').value),steps:Number($('search-steps').value),locks:JSON.parse($('search-locks').value)};
    if(!window.Worker)throw new Error('This browser does not support the background worker required for search.');
    const started=performance.now(),generation=searchGeneration;worker=new Worker('../js/research-worker.js');$('search-run').disabled=true;$('search-cancel').disabled=false;
    worker.onerror=()=>{if(generation===searchGeneration)stopSearch('Search worker could not run. Reload online to cache its files, then try again.');};
    worker.onmessage=event=>{
      if(generation!==searchGeneration)return;
      if(event.data.error){stopSearch('Search rejected: '+event.data.error);return;}
      if(event.data.progress){$('search-status').textContent='Searching: '+event.data.progress.step+' / '+event.data.progress.steps+' steps.';return;}
      const r=event.data.result;worker.terminate();worker=null;$('search-run').disabled=false;$('search-cancel').disabled=true;
      receipt={version:1,kind:'cipher-museum-homophonic-search',raw,options,result:r,elapsedMs:Math.round(performance.now()-started)};
      $('search-export').disabled=false;$('search-status').textContent=(r.task==='known-key-application'?'Known-key application: all symbols were locked.':'Search completed; these are unverified candidates.')+' '+r.completedSteps+' mutation steps. Seed '+r.seed+'.';
      const out=$('search-results');out.replaceChildren();
      r.candidates.forEach((c,i)=>{const d=el('details','',out);d.open=i===0;el('summary','Candidate '+(i+1)+' · model score '+c.score.toFixed(2),d);el('pre',c.plaintext,d);el('pre',JSON.stringify(c.key,null,2),d);});
      const d=el('details','',out);el('summary','Best retained score by step',d);el('pre',r.trace.map(t=>t.step+': '+t.score.toFixed(2)).join('\n'),d);
    };worker.postMessage({raw,options});
  });
  $('search-export').onclick=()=>{if(receipt)download('homophonic-search-receipt.json',receipt);};
  $('search-example').onclick=()=>{
    stopSearch('Original generated exercise loaded. This is a public demonstration, not a blind historical test.');
    const plain='THESECRETLETTERISINTHECHESTTHEKEYISINTHELETTERREADTHELETTERTHENOPENTHECHEST';
    const ids=new Map();let next=1;
    $('search-raw').value=Array.from(plain).map((c,i)=>{const k=c+(i%2);if(!ids.has(k))ids.set(k,'s'+next++);return ids.get(k);}).join(' ');
    $('search-locks').value='{}';$('search-seed').value='41';$('search-steps').value='15000';
  };
  window.addEventListener('pagehide',()=>{if(worker)worker.terminate();if(imageURL)URL.revokeObjectURL(imageURL);});
  // Explicit handoff from Detective; never fetch source images or papers automatically.
  try {const v=sessionStorage.getItem('museum-evidence-import');if(v){doc=R.migrate(JSON.parse(v));sessionStorage.removeItem('museum-evidence-import');status('Imported your Detective transcription. Add source information, then export to keep the record.');}}catch(e){status('Could not read the Detective handoff: '+e.message,true);}
  render();
})();
```


## JavaScript — js/research-worker.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/research-worker.js`
- Served SHA-256: `ed2a941f8f50a76f690ffc2ffa4a49e1fd3c164f59041996fd0e13133627ca35`
- Readable-source SHA-256: `ed2a941f8f50a76f690ffc2ffa4a49e1fd3c164f59041996fd0e13133627ca35`


```javascript
'use strict';
importScripts('research-language-model.js', 'research-model.js');
let modelPromise;
self.onmessage = async function (event) {
  try {
    const input = event.data;
    if (typeof fetch !== 'function') throw new Error('This browser cannot load the scoring model.');
    if (!modelPromise) modelPromise = fetch('../data/research/v1/language-model.json').then(response => {
      if (!response.ok) throw new Error('Could not load the scoring model.'); return response.json();
    }).then(data => MuseumResearchLanguage.build(data));
    const model = await modelPromise;
    const result = MuseumResearch.search(MuseumResearch.parseSymbols(input.raw), input.options,
      model.fitness, progress => self.postMessage({ progress }));
    self.postMessage({ result });
  } catch (error) { self.postMessage({ error: error.message }); }
};
```


## JavaScript — js/search.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/search.js`
- Served SHA-256: `cb152e1c07e71650fb727b994c94a0c3685217bf139dd194e52372039bedf0d7`
- Readable-source SHA-256: `cb152e1c07e71650fb727b994c94a0c3685217bf139dd194e52372039bedf0d7`


```javascript
/**
 * THE CIPHER MUSEUM — Site Search
 * Loads /js/search-index.json and provides ranked substring + token matching
 * across the 167-exhibit collection (cipher pages, exhibit halls, biographies,
 * cryptanalysis techniques, the timeline, and key tool pages).
 *
 * Public API on window.CipherSearch:
 *   load()            → Promise<entries>
 *   query(q, limit)   → array of {entry, score, matchedField}
 *   highlight(text,q) → text with <mark> wrapped tokens
 *
 * Resolves URLs relative to the page that loaded the script
 * (handles ciphers/, halls/, etc. subfolders automatically).
 */
'use strict';
(function () {
  var INDEX_URL_REL = 'js/search-index.json';
  var BASE = (function () {
    var p = location.pathname;
    var inSub = /\/(ciphers|halls|tours|lab|community|hall-of-foundations)\//.test(p);
    return inSub ? '../' : '';
  })();

  var _entries = null;
  var _loadPromise = null;

  function normalizeSearchText(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      // Elide every apostrophe form rather than folding them to one, so an
      // apostrophe-free query ("geez") reaches an apostrophised title ("Geʼez").
      .replace(/[\u2018\u2019\u02bbʼ']/g, '')
      .toLowerCase();
  }

  function words(value) {
    return normalizeSearchText(value).match(/[\p{L}\p{N}]+/gu) || [];
  }

  // Separator-insensitive form. Titles hyphenate designations that visitors type
  // closed up — "M-209", "SHA-256", "KL-7" are searched as "m209", "sha256",
  // "kl7" — so matching also consults a form with every separator removed.
  // Used only as an extra alternative, never to replace a normal match.
  function flatten(value) {
    return normalizeSearchText(value).replace(/[^\p{L}\p{N}]+/gu, '');
  }

  function load() {
    if (_entries) return Promise.resolve(_entries);
    if (_loadPromise) return _loadPromise;
    if (typeof fetch !== 'function') {
      return Promise.reject(new Error('Fetch is unavailable'));
    }
    _loadPromise = fetch(BASE + INDEX_URL_REL, {cache: 'force-cache'})
      .then(function (r) {
        if (!r.ok) throw new Error('Index HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (!data || !Array.isArray(data.entries)) throw new Error('Invalid search index');
        _entries = data.entries.map(function (e) {
          var haystack = e.t + ' ' + (e.h || '') + ' ' + (e.s || '') + ' ' + (e.g || []).join(' ');
          return {
            title: e.t,
            url: BASE + e.u,
            kind: e.k,
            hall: e.h,
            created: e.c,
            broken: e.b,
            trust: e.trust || null,
            exhibitNumber: e.exhibitNumber,
            note: e.n || '',
            summary: e.s,
            tags: e.g || [],
            _hay: normalizeSearchText(haystack),
            _words: words(haystack),
            _flat: flatten(haystack)
          };
        });
        return _entries;
      })
      .catch(function (err) {
        console.error('[CipherSearch] index load failed:', err);
        _loadPromise = null;
        throw err;
      });
    return _loadPromise;
  }

  function tokenize(q) {
    return words(q);
  }

  /**
   * Score an entry against the query.
   *  +50 exact title match
   *  +25 title startsWith
   *  +12 title substring
   *  +10 tag exact
   *  +6  hall match
   *  +4  summary substring
   *  +2  any haystack substring
   * AND-mode: every token must hit something.
   */
  function score(entry, tokens, raw) {
    var rawLower = normalizeSearchText(raw);
    var titleLower = normalizeSearchText(entry.title);
    var s = 0;
    var matchedField = null;

    var rawFlat = flatten(raw);
    var titleFlat = flatten(entry.title);
    if (titleLower === rawLower || titleFlat === rawFlat) { s += 50; matchedField = 'title'; }
    else if (titleLower.indexOf(rawLower) === 0 || titleFlat.indexOf(rawFlat) === 0) { s += 25; matchedField = 'title'; }
    else if (titleLower.indexOf(rawLower) >= 0 || titleFlat.indexOf(rawFlat) >= 0) { s += 12; matchedField = 'title'; }

    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i];
      var hit = false;
      var eraToken = tok === 'wwi' || tok === 'wwii';
      var includesToken = function (value) {
        if (eraToken) return words(value).indexOf(tok) >= 0;
        return normalizeSearchText(value).indexOf(tok) >= 0 || flatten(value).indexOf(tok) >= 0;
      };

      if (includesToken(titleLower)) { s += 8; hit = true; matchedField = matchedField || 'title'; }
      for (var j = 0; j < entry.tags.length; j++) {
        var tag = normalizeSearchText(entry.tags[j]);
        if (tag === tok) { s += 10; hit = true; matchedField = matchedField || 'tag'; break; }
        if (!eraToken && tag.indexOf(tok) >= 0) { s += 4; hit = true; matchedField = matchedField || 'tag'; }
      }
      if (includesToken(entry.hall || '')) { s += 6; hit = true; matchedField = matchedField || 'hall'; }
      if (includesToken(entry.summary || '')) { s += 4; hit = true; matchedField = matchedField || 'summary'; }
      if (!hit && (eraToken ? entry._words.indexOf(tok) >= 0
          : (entry._hay.indexOf(tok) >= 0 || entry._flat.indexOf(tok) >= 0))) { s += 2; hit = true; matchedField = matchedField || 'any'; }
      if (!hit) return 0; // AND-mode: must hit every token
    }

    // Kind preference: ciphers > halls > pages
    if (entry.kind === 'cipher') s += 1;
    if (entry.kind === 'hall') s += 0.5;
    return s;
  }

  function query(q, limit) {
    if (!_entries) return [];
    var raw = (q || '').trim();
    if (!raw) return [];
    var tokens = tokenize(raw);
    if (!tokens.length) return [];
    var out = [];
    for (var i = 0; i < _entries.length; i++) {
      var sc = score(_entries[i], tokens, raw);
      if (sc > 0) out.push({entry: _entries[i], score: sc});
    }
    out.sort(function (a, b) { return b.score - a.score; });
    return limit ? out.slice(0, limit) : out;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function highlight(text, q) {
    var raw = String(text);
    var tokens = tokenize(q).filter(function (t) { return t.length >= 2; });
    if (!tokens.length) return escapeHTML(raw);
    // Match original text once. Repeated replacements over escaped HTML can
    // highlight inside an entity or inside the <mark> tags just inserted.
    tokens.sort(function (a, b) { return b.length - a.length; });
    var re = new RegExp(tokens.map(function (t) {
      return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('|'), 'gi');
    var result = '', cursor = 0, match;
    while ((match = re.exec(raw))) {
      result += escapeHTML(raw.slice(cursor, match.index)) + '<mark>' + escapeHTML(match[0]) + '</mark>';
      cursor = match.index + match[0].length;
    }
    return result + escapeHTML(raw.slice(cursor));
  }

  window.CipherSearch = {
    load: load,
    query: query,
    highlight: highlight,
    normalize: normalizeSearchText,
    base: BASE
  };
})();
```


## JavaScript — js/trust-labels.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/trust-labels.js`
- Served SHA-256: `df5dd97d87412f530ae69bc145c70159f52e13b7a1cfa8d3403c0f0c83d0476e`
- Readable-source SHA-256: `df5dd97d87412f530ae69bc145c70159f52e13b7a1cfa8d3403c0f0c83d0476e`


```javascript
/* Canonical metadata is generated from data/exhibit-trust.json and data/trust-labels.json. */
'use strict';
(function (global) {
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function badge(trust) {
    if (!trust) return '';
    if (!/^(broken|historical|educational|secure)$/.test(trust.key)) throw new Error('Unknown trust category');
    return '<span class="trust-label trust-label--' + trust.key + ' trust-label--sm" title="' +
      escapeHTML(trust.description) + '">' + escapeHTML(trust.text) + '</span>';
  }
  const api = { badge, escapeHTML };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.TrustLabels = api;
})(typeof window !== 'undefined' ? window : globalThis);
```


## JavaScript — js/ui-delegates.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `js/ui-delegates.js`
- Served SHA-256: `533029a0253d48b410e3e6f14dfbb616ff3bc233a2f6ef7d1387babd26af4959`
- Readable-source SHA-256: `533029a0253d48b410e3e6f14dfbb616ff3bc233a2f6ef7d1387babd26af4959`


```javascript
'use strict';
/**
 * Global delegated event handlers — replaces inline onclick= attributes.
 *
 * Handles three data-attribute patterns:
 *   data-file="name.jsonl"      → open corpus/eval file in new tab
 *   data-reveal-next            → show nextElementSibling, hide self
 *   data-fn="fnName"            → call window[fnName](data-arg)
 *   data-fn="fnName" data-arg   → call window[fnName](arg), numeric args coerced
 */
(function () {
  // Hide broken images (replaces onerror= inline handlers)
  document.addEventListener('error', function (e) {
    if (e.target && e.target.tagName === 'IMG' && e.target.parentElement) {
      e.target.parentElement.style.display = 'none';
    }
  }, true);

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-file],[data-reveal-next],[data-fn]');
    if (!el) return;

    if ('file' in el.dataset) {
      var name = el.dataset.file;
      var base = '/public/corpus/';
      window.open(base + name, '_blank');
      return;
    }

    if ('revealNext' in el.dataset) {
      var next = el.nextElementSibling;
      if (next) { next.hidden = false; next.style.display = 'block'; }
      el.style.display = 'none';
      return;
    }

    if ('fn' in el.dataset) {
      var fn = window[el.dataset.fn];
      if (typeof fn !== 'function') return;
      if ('arg' in el.dataset) {
        var arg = el.dataset.arg;
        fn(!isNaN(arg) && arg !== '' ? Number(arg) : arg);
      } else {
        fn();
      }
    }
  });
})();
```


## JavaScript — scripts/columnar-classroom.js

**Classroom command-line tool:** runs with Node.js in a repository checkout; it is not a browser demo. The linked worksheet and fixed fixtures are included separately.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `scripts/columnar-classroom.js`
- Served SHA-256: `fc4b64e8877c3fad1c6866029f58189c1c7a6f555a4a44fdcc148f78e68fc4f3`
- Readable-source SHA-256: `fc4b64e8877c3fad1c6866029f58189c1c7a6f555a4a44fdcc148f78e68fc4f3`


```javascript
#!/usr/bin/env node
'use strict';
// A small receipt-producing classroom experiment; reuses the Museum solver.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { performance } = require('node:perf_hooks');
const root = path.join(__dirname, '..');
const columnar = require('../js/columnar-search');
require('../js/detective/lang-model');
const fixturePath = 'public/teaching/columnar-classroom-fixtures.json';
const corpus = JSON.parse(fs.readFileSync(path.join(root, fixturePath), 'utf8'));
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');

// Reference preparation is separate from the search implementation: write rows,
// then read the specified columns. Fixed ciphertexts are retained in the fixture.
function referenceEncrypt(plaintext, order) {
  const rows = [];
  for (let i = 0; i < plaintext.length; i += order.length) rows.push(plaintext.slice(i, i + order.length));
  return order.map(column => rows.map(row => row[column] || '').join('')).join('');
}
function runExperiment({clock = () => performance.now()} = {}) {
  const runs = [];
  const variants = [{id:'direct', staged:false}, {id:'staged', staged:true}];
  for (const fixture of corpus.fixtures) {
    if (referenceEncrypt(fixture.plaintext, fixture.order) !== fixture.ciphertext) throw Error('Fixture does not match its independent row/column reference: ' + fixture.id);
    if (fixture.length !== fixture.plaintext.length || fixture.width !== fixture.order.length || fixture.remainder !== fixture.length % fixture.width) throw Error('Fixture shape mismatch: ' + fixture.id);
    for (const seed of corpus.seeds) for (const variant of variants) {
      const options = {width:fixture.width, budget:corpus.budget, restarts:corpus.restarts, seed, staged:variant.staged, alignment:true, segments:true};
      const started = clock();
      const result = columnar.solve(fixture.ciphertext, options);
      const elapsedMs = Math.max(0, clock() - started);
      if (result.evaluations > options.budget || result.preprocessing > result.evaluations) throw Error('Budget accounting failed.');
      const exactPlaintext = !!result.best && result.best.plaintext === fixture.plaintext;
      const exactKey = !!result.best && result.best.order.every((value, i) => value === fixture.order[i]);
      runs.push({fixture:fixture.id, variant:variant.id, options, length:fixture.length, remainder:fixture.remainder,
        rectangle:fixture.remainder ? 'incomplete' : 'complete', evaluations:result.evaluations,
        preprocessingEvaluations:result.preprocessing, elapsedMs,
        exactPlaintext, exactKey, outcome:exactPlaintext ? 'plaintext-recovered' : result.best ? 'different-candidate' : 'no-candidate',
        candidate:result.best ? {plaintext:result.best.plaintext, order:result.best.order, score:result.best.score} : null,
        reason:result.reason});
    }
  }
  const summary = variants.map(variant => {
    const rows = runs.filter(run => run.variant === variant.id);
    return {variant:variant.id, runs:rows.length, exactPlaintexts:rows.filter(run => run.exactPlaintext).length,
      exactKeys:rows.filter(run => run.exactKey).length, noCandidate:rows.filter(run => !run.candidate).length,
      unsuccessfulPlaintexts:rows.filter(run => !run.exactPlaintext).length};
  });
  return {schema:'museum-columnar-classroom-receipt-v1', fixtureSet:corpus,
    sources:{fixturesSha256:digest(fixturePath), solverSha256:digest('js/columnar-search.js'), languageModelSha256:digest('js/detective/lang-model.js'), runnerSha256:digest('scripts/columnar-classroom.js')},
    runtime:{node:process.version, platform:process.platform, arch:process.arch},
    scope:'24 fixed runs: four synthetic messages, three seeds, two variants differing only in staged initialization. Every failure is retained. These counts describe this small fixture set, not general recovery probabilities. Repeated seeds on a message are dependent. Equal evaluation budgets are not equal CPU work. Timings vary and are excluded from exact replay.',
    summary, runs};
}
function withoutTimings(report) {
  return {...report, runs:report.runs.map(({elapsedMs, ...run}) => run)};
}
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.some(arg => !['--check','--help'].includes(arg))) throw Error('Usage: node scripts/columnar-classroom.js [--check | --help]');
  if (args.includes('--help')) {
    console.log('Emit 24-run JSON receipt to stdout: node scripts/columnar-classroom.js > columnar-classroom-results.json\nCheck deterministic replay, excluding time: node scripts/columnar-classroom.js --check');
  } else if (args.includes('--check')) {
    const first = runExperiment(), second = runExperiment();
    require('node:assert/strict').deepEqual(withoutTimings(first), withoutTimings(second));
    console.log('All 24 classroom runs replay exactly apart from elapsed time. Failures and exhausted budgets remain in the receipt.');
  } else {
    console.log(JSON.stringify(runExperiment(), null, 2));
  }
}
module.exports = {runExperiment, withoutTimings, referenceEncrypt};
```


## JavaScript — sw.js

Supporting source for public page behavior; presence of code does not prove that every branch was exercised.

Any ebook URL is replaced by a stable omission ID. Redacted code is for inspection, not execution; the hashes below identify the unmodified source files.

- Served/distributed path: `sw.js`
- Served SHA-256: `e5afa22bfa4aa21f19e72b90f1a5f8607f2add60cbf15ca64d5c890e1a147bed`
- Readable-source SHA-256: `e5afa22bfa4aa21f19e72b90f1a5f8607f2add60cbf15ca64d5c890e1a147bed`


```javascript
/**
 * THE CIPHER MUSEUM — Service Worker
 * Offline support for classrooms and flaky connections.
 *
 * Strategy:
 *   - HTML navigations: network-first, falling back to cache (content stays fresh
 *     online; cached pages may be available offline while their assets remain cached).
 *   - Static assets (css/js/images/json): cache-first with background refresh.
 *   - Requests under /public/, including corpus samples and reports, bypass this cache.
 *
 * VERSION is stamped automatically by `npm run build:js` from a hash of every
 * asset served cache-first — the minified bundles, the non-HTML entries of
 * CORE below, and the self-contained offline fallback page (scripts/sw-version.js).
 * tests/test-sw-version.js fails the suite if it drifts. Old caches are purged
 * on activate, so adding an asset to CORE also re-stamps VERSION.
 */
'use strict';

const VERSION = 'cipher-museum-56ec9ae8';

const CORE = [
  '/',
  '/index.html',
  '/offline.html',
  '/ciphers/myszkowski.html',
  '/ciphers/turning-grille.html',
  '/ciphers/hagelin-c36.html',
  '/ciphers/nema.html',
  '/ciphers/rs44.html',
  '/ciphers/double-playfair.html',
  '/ciphers/amsco.html',
  '/css/manual-cipher-demos.css',
  '/js/manual-cipher-demos.js',
  '/css/multiple-anagramming.css',
  '/js/multiple-anagramming.js',
  '/css/pad-experiments.css',
  '/js/pad-experiments.js',
  '/css/detective-workspaces.css',
  '/js/detective/workspaces.js',
  '/js/detective/playback.js',
  '/js/detective/lang-model.js',
  '/lab/evidence-workbench.html',
  '/lab/decipherment-cases.html',
  '/lab/modern-attack-evidence.html',
  '/ciphers/ua-8295.html',
  '/ciphers/sodark.html',
  '/ciphers/nfc-deployment.html',
  '/css/research-workbench.css',
  '/js/research-model.js',
  '/js/research-worker.js',
  '/js/research-language-model.js',
  '/data/research/v1/language-model.json',
  '/js/research-ui.js',
  '/js/research-cases.js',
  '/data/research/v1/z340-section-1.json',
  '/js/ciphers/all-engines.min.js',
  '/css/museum.css',
  '/css/historical-demos.css',
  '/js/historical-ciphers.js',
  '/js/historical-demos.js',
  '/js/nav.js',
  '/js/footer.js',
  '/js/breadcrumbs.js',
  '/js/ui-delegates.js',
  '/js/trust-labels.js',
  '/js/search.js',
  '/js/search-index.json',
  '/js/artifact-cards.js',
  '/js/artifact-cards-data.min.js',
  '/js/demo-loader.min.js',
  '/js/lightbox.js',
  '/fonts/cinzel-400-latin-ext.woff2',
  '/fonts/cinzel-400-latin.woff2',
  '/fonts/cinzel-600-latin-ext.woff2',
  '/fonts/cinzel-600-latin.woff2',
  '/fonts/cinzel-700-latin-ext.woff2',
  '/fonts/cinzel-700-latin.woff2',
  '/fonts/cormorant-garamond-italic-300-latin-ext.woff2',
  '/fonts/cormorant-garamond-italic-300-latin.woff2',
  '/fonts/cormorant-garamond-italic-400-latin-ext.woff2',
  '/fonts/cormorant-garamond-italic-400-latin.woff2',
  '/fonts/cormorant-garamond-italic-600-latin-ext.woff2',
  '/fonts/cormorant-garamond-italic-600-latin.woff2',
  '/fonts/cormorant-garamond-300-latin-ext.woff2',
  '/fonts/cormorant-garamond-300-latin.woff2',
  '/fonts/cormorant-garamond-400-latin-ext.woff2',
  '/fonts/cormorant-garamond-400-latin.woff2',
  '/fonts/cormorant-garamond-600-latin-ext.woff2',
  '/fonts/cormorant-garamond-600-latin.woff2',
  '/fonts/cormorant-garamond-700-latin-ext.woff2',
  '/fonts/cormorant-garamond-700-latin.woff2',
  '/fonts/jetbrains-mono-300-latin-ext.woff2',
  '/fonts/jetbrains-mono-300-latin.woff2',
  '/fonts/jetbrains-mono-400-latin-ext.woff2',
  '/fonts/jetbrains-mono-400-latin.woff2',
  '/fonts/jetbrains-mono-500-latin-ext.woff2',
  '/fonts/jetbrains-mono-500-latin.woff2',
  '/fonts/jetbrains-mono-700-latin-ext.woff2',
  '/fonts/jetbrains-mono-700-latin.woff2',
  '/hall-of-foundations/index.html',
  '/hall-of-foundations/foundations.css',
  '/images/icons.svg',
  '/favicon.svg',
  '/manifest.webmanifest',
  '/images/icons/icon-192.png',
  '/images/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Bypass all /public/ requests, including corpus downloads, samples and reports.
  if (url.pathname.startsWith('/public/')) return;

  if (req.mode === 'navigate') {
    // Network-first for pages. An unvisited exhibit must display an explicit
    // offline notice, not the homepage at an exhibit URL with broken relative
    // assets (or misleading homepage content).
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('/offline.html')))
    );
    return;
  }

  // Cache-first with background refresh for static assets.
  event.respondWith(
    caches.match(req).then((hit) => {
      const refresh = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || refresh;
    })
  );
});
```
