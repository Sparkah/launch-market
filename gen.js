/* Launch Market - client-side instant game generator.
   window.LMGen.generate(prompt) -> { id, title, mechanic, theme, html }
   html is a COMPLETE self-contained playable HTML5 game (canvas, mouse+touch,
   particles, sfx, score/lives/combo, start + game-over screens). No deps, no API,
   generated in <1s, deterministic from the prompt. */
(function () {
  var EMOJI = {
    cat:'🐱',kitten:'🐱',dog:'🐶',puppy:'🐶',fox:'🦊',panda:'🐼',frog:'🐸',monkey:'🐵',
    bear:'🐻',bunny:'🐰',rabbit:'🐰',dragon:'🐉',dino:'🦖',dinosaur:'🦖',unicorn:'🦄',
    alien:'👽',robot:'🤖',ghost:'👻',fish:'🐟',shark:'🦈',octopus:'🐙',bird:'🐦',
    chick:'🐤',chicken:'🐔',penguin:'🐧',bee:'🐝',butterfly:'🦋',snail:'🐌',
    pizza:'🍕',burger:'🍔',taco:'🌮',sushi:'🍣',donut:'🍩',doughnut:'🍩',cookie:'🍪',
    cake:'🍰',candy:'🍬',sweet:'🍬',icecream:'🍦',banana:'🍌',apple:'🍎',cherry:'🍒',
    coin:'🪙',gold:'🪙',gem:'💎',diamond:'💎',crystal:'💎',star:'⭐',heart:'❤️',
    rocket:'🚀',ship:'🚀',ufo:'🛸',planet:'🪐',moon:'🌙',sun:'☀️',cloud:'☁️',lightning:'⚡',
    bomb:'💣',skull:'💀',fire:'🔥',poop:'💩',spike:'🔺',trash:'🗑️',virus:'🦠',
    ninja:'🥷',wizard:'🧙',zombie:'🧟',knight:'🛡️',crown:'👑',
    ball:'⚽',soccer:'⚽',football:'🏈',basketball:'🏀',
    flower:'🌸',tree:'🌳',mushroom:'🍄',leaf:'🍃',bamboo:'🎋',money:'💵',cash:'💵',trophy:'🏆',key:'🗝️',
    car:'🚗',plane:'✈️',brain:'🧠',eye:'👁️',slime:'🟢'
  };
  var GOOD_DEFAULT = ['⭐','🪙','💎','❤️','🍪'];
  var BAD_DEFAULT  = ['💣','💀','🔥','🦠','🔺'];

  function titleCase(s){
    var w = (s||'').replace(/[^a-z0-9 ]/gi,' ').trim().split(/\s+/).filter(Boolean).slice(0,4);
    if(!w.length) return 'Mystery Game';
    return w.map(function(x){return x[0].toUpperCase()+x.slice(1).toLowerCase();}).join(' ');
  }
  function hash(s){ var h=2166136261; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return (h>>>0); }
  function pickEmoji(words, fallback){
    for(var i=0;i<words.length;i++){ if(EMOJI[words[i]]) return EMOJI[words[i]]; }
    return fallback;
  }
  function mechanicFor(p){
    if(/\b(fly|flap|flappy|bird|rocket|space|jetpack|balloon|helicopter)\b/.test(p)) return 'flappy';
    if(/\b(run|runner|jump|dash|endless|parkour|obby|dodge the ground)\b/.test(p)) return 'runner';
    return 'catch';
  }

  var BADSET = {'💣':1,'💀':1,'🔥':1,'💩':1,'🔺':1,'🦠':1,'🧟':1};
  function emojiMatches(words){
    var out=[],seen={};
    for(var i=0;i<words.length;i++){ var w=words[i].replace(/s$/,''); var e=EMOJI[w]||EMOJI[words[i]];
      if(e&&!seen[e]){ seen[e]=1; out.push(e); } }
    return out;
  }
  function theme(prompt){
    var p = (prompt||'').toLowerCase();
    var words = p.replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(Boolean);
    var h = hash(p||'seed');
    var hue = h % 360;
    var found = emojiMatches(words);
    var goods = found.filter(function(e){return !BADSET[e];});
    var bads  = found.filter(function(e){return BADSET[e];});
    var hero = goods[0] || ['🐱','🦊','🤖','🐸','🦄','🐼','🦖','🐧'][h%8];
    var good = goods[1] || GOOD_DEFAULT[h%GOOD_DEFAULT.length];
    if(good===hero) good = GOOD_DEFAULT[(h+1)%GOOD_DEFAULT.length];
    var bad = bads[0] || BAD_DEFAULT[(h>>>3)%BAD_DEFAULT.length];
    return { title: titleCase(prompt), hue: hue, hero: hero, good: good, bad: bad, mechanic: mechanicFor(p) };
  }

  // ---- the game template (token-replaced; the game's own JS reads the injected literals) ----
  var TEMPLATE = [
'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="generator" content="launch-market-gen">',
'<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">',
'<title>__TITLE__</title><style>',
'*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;user-select:none}',
'html,body{height:100%;overflow:hidden;background:#0a0d12;font-family:-apple-system,Segoe UI,Roboto,sans-serif;touch-action:none}',
'#c{display:block;width:100vw;height:100vh}',
'#ui{position:fixed;inset:0;pointer-events:none;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.6)}',
'#hud{position:absolute;top:12px;left:0;right:0;display:flex;justify-content:space-between;padding:0 16px;font-weight:800;font-size:18px}',
'#lives{letter-spacing:2px}',
'.screen{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;pointer-events:auto;background:radial-gradient(120% 90% at 50% 0%,hsla(__HUE__,70%,30%,.55),rgba(8,10,14,.9))}',
'.screen.hide{display:none}',
'.big{font-size:clamp(30px,9vw,56px);font-weight:900;line-height:1.05;margin-bottom:8px}',
'.sub{font-size:16px;opacity:.85;max-width:18em;margin-bottom:22px;line-height:1.5}',
'.btn{pointer-events:auto;font:inherit;font-weight:900;font-size:20px;color:#06121a;background:hsl(__HUE__,90%,62%);border:0;border-radius:14px;padding:15px 34px;cursor:pointer;box-shadow:0 8px 26px hsla(__HUE__,90%,50%,.5)}',
'.btn:active{transform:translateY(2px)}',
'.tag{font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.7;margin-bottom:14px}',
'.emoji{font-size:54px;margin-bottom:10px;filter:drop-shadow(0 4px 10px rgba(0,0,0,.5))}',
'</style></head><body>',
'<canvas id="c"></canvas>',
'<div id="ui"><div id="hud"><span id="score">0</span><span id="lives"></span></div></div>',
'<div class="screen" id="start"><div class="emoji">__HERO__</div><div class="tag">__MECH__ // launch market</div><div class="big">__TITLE__</div><div class="sub" id="howto"></div><button class="btn" id="go">Play</button></div>',
'<div class="screen hide" id="over"><div class="big" id="otitle">Game Over</div><div class="sub" id="oscore"></div><button class="btn" id="again">Play again</button></div>',
'<script>',
'var T={title:"__TITLE__",hue:__HUE__,hero:"__HERO__",good:"__GOOD__",bad:"__BAD__",mech:"__MECH__"};',
'var c=document.getElementById("c"),x=c.getContext("2d"),W=0,H=0,DPR=Math.min(2,window.devicePixelRatio||1);',
'function fit(){W=c.clientWidth;H=c.clientHeight;c.width=W*DPR;c.height=H*DPR;x.setTransform(DPR,0,0,DPR,0,0);}',
'addEventListener("resize",fit);fit();',
'var AC,muted=false;function beep(f,d,t){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();var o=AC.createOscillator(),g=AC.createGain();o.type=t||"sine";o.frequency.value=f;o.connect(g);g.connect(AC.destination);g.gain.setValueAtTime(.0001,AC.currentTime);g.gain.exponentialRampToValueAtTime(.3,AC.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+(d||.12));o.start();o.stop(AC.currentTime+(d||.12));}catch(e){}}',
'var parts=[];function burst(px,py,col){for(var i=0;i<12;i++){parts.push({x:px,y:py,vx:(Math.random()-.5)*6,vy:(Math.random()-.5)*6-2,life:1,col:col});}}',
'function drawParts(){for(var i=parts.length-1;i>=0;i--){var p=parts[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.25;p.life-=.03;if(p.life<=0){parts.splice(i,1);continue;}x.globalAlpha=Math.max(0,p.life);x.fillStyle=p.col;x.beginPath();x.arc(p.x,p.y,3,0,7);x.fill();}x.globalAlpha=1;}',
'var px=0,score=0,lives=3,best=0,state="menu",shake=0,combo=0,items=[],spawnT=0,speed=1,t=0;',
'var hud=document.getElementById("score"),lv=document.getElementById("lives");',
'function setHud(){hud.textContent=score;var s="";for(var i=0;i<lives;i++)s+="\\u2764\\ufe0f";lv.textContent=s;}',
'function reset(){score=0;lives=3;combo=0;speed=1;items=[];parts=[];spawnT=0;t=0;px=W/2;setHud();}',
'var pointerX=null;function onMove(e){var r=c.getBoundingClientRect();var cx=(e.touches?e.touches[0].clientX:e.clientX)-r.left;pointerX=cx;}',
'c.addEventListener("mousemove",onMove);c.addEventListener("touchmove",function(e){e.preventDefault();onMove(e);},{passive:false});',
'var flap=false;function tap(){flap=true;}',
'c.addEventListener("mousedown",tap);c.addEventListener("touchstart",function(e){e.preventDefault();tap();},{passive:false});',
'// ---- CATCH / RUNNER share falling-item logic; FLAPPY is separate ----',
'var hero={x:0,y:0,vy:0};',
'function startGame(){reset();state="play";document.getElementById("start").classList.add("hide");document.getElementById("over").classList.add("hide");hero.x=W/2;hero.y=H-70;hero.vy=0;if(AC&&AC.state==="suspended")AC.resume();}',
'function gameOver(){state="over";best=Math.max(best,score);document.getElementById("over").classList.remove("hide");document.getElementById("oscore").innerHTML="Score <b>"+score+"</b> &middot; best "+best;beep(120,.3,"sawtooth");}',
'function spawn(){var bad=Math.random()<.32;items.push({x:30+Math.random()*(W-60),y:-30,vy:(2.2+Math.random()*1.8)*speed,bad:bad,e:bad?T.bad:T.good,r:20});}',
'function loop(){t++;x.clearRect(0,0,W,H);',
'  var g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"hsl("+T.hue+",55%,16%)");g.addColorStop(1,"#0a0d12");x.fillStyle=g;x.fillRect(0,0,W,H);',
'  var sx=0,sy=0;if(shake>0){sx=(Math.random()-.5)*shake;sy=(Math.random()-.5)*shake;shake*=.86;}x.save();x.translate(sx,sy);',
'  if(state==="play"){',
'    if(T.mech==="flappy"){flappyStep();}else{catchStep();}',
'  } else { x.restore(); drawParts(); requestAnimationFrame(loop); return; }',
'  drawParts();x.restore();requestAnimationFrame(loop);',
'}',
'function catchStep(){',
'  if(pointerX!=null)hero.x+=(pointerX-hero.x)*.35; else hero.x+=(W/2-hero.x)*.02;',
'  hero.x=Math.max(24,Math.min(W-24,hero.x));hero.y=H-70;',
'  spawnT--;if(spawnT<=0){spawn();spawnT=Math.max(16,46-t*0.02)/speed;}',
'  speed=1+t*0.0009;',
'  for(var i=items.length-1;i>=0;i--){var it=items[i];it.y+=it.vy;',
'    x.font="34px sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(it.e,it.x,it.y);',
'    var dx=it.x-hero.x,dy=it.y-hero.y;if(dx*dx+dy*dy<46*46){',
'      if(it.bad){lives--;combo=0;shake=16;beep(140,.18,"square");setHud();if(lives<=0){items.splice(i,1);gameOver();return;}}',
'      else{combo++;var pts=1+Math.floor(combo/4);score+=pts;burst(it.x,it.y,"hsl("+T.hue+",90%,65%)");beep(520+combo*18,.09);setHud();}',
'      items.splice(i,1);continue;}',
'    if(it.y>H+30){if(!it.bad){combo=0;}items.splice(i,1);}',
'  }',
'  x.font="48px sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(T.hero,hero.x,hero.y);',
'  if(combo>2){x.fillStyle="hsl("+T.hue+",90%,70%)";x.font="800 16px sans-serif";x.fillText("x"+combo+" combo",W/2,40);}',
'}',
'var pipes=[],pipeT=0,gap=170;',
'function flappyStep(){',
'  if(flap){hero.vy=-6.2;burst(hero.x,hero.y,"hsl("+T.hue+",90%,65%)");beep(440,.07);}flap=false;',
'  hero.vy+=0.32;hero.y+=hero.vy;hero.x=W*0.3;',
'  pipeT--;if(pipeT<=0){var gy=70+Math.random()*(H-220);pipes.push({x:W+30,gy:gy,scored:false});pipeT=Math.max(70,110-t*0.02);}',
'  speed=1+t*0.0006;',
'  for(var i=pipes.length-1;i>=0;i--){var pp=pipes[i];pp.x-=2.6*speed;',
'    x.fillStyle="hsl("+T.hue+",60%,45%)";x.fillRect(pp.x-26,0,52,pp.gy-gap/2);x.fillRect(pp.x-26,pp.gy+gap/2,52,H);',
'    if(!pp.scored&&pp.x<hero.x){pp.scored=true;score++;combo++;burst(hero.x,hero.y,"hsl("+T.hue+",90%,65%)");beep(560+score*8,.08);setHud();}',
'    if(Math.abs(pp.x-hero.x)<40&&(hero.y<pp.gy-gap/2||hero.y>pp.gy+gap/2)){shake=18;gameOver();return;}',
'    if(pp.x<-40)pipes.splice(i,1);',
'  }',
'  if(hero.y>H-20||hero.y<0){shake=18;gameOver();return;}',
'  x.font="46px sans-serif";x.textAlign="center";x.textBaseline="middle";x.save();x.translate(hero.x,hero.y);x.rotate(Math.max(-.4,Math.min(.9,hero.vy*.06)));x.fillText(T.hero,0,0);x.restore();',
'}',
'function startFlappy(){pipes=[];pipeT=20;hero.y=H/2;hero.vy=0;}',
'var _origStart=startGame;startGame=function(){_origStart();if(T.mech==="flappy")startFlappy();};',
'document.getElementById("howto").textContent=T.mech==="flappy"?("Tap to fly "+T.hero+" through the gaps. Do not crash."):("Move "+T.hero+" to catch "+T.good+". Dodge "+T.bad+". 3 lives.");',
'document.getElementById("otitle").textContent=T.title;',
'document.getElementById("go").onclick=startGame;document.getElementById("again").onclick=startGame;',
'fit();requestAnimationFrame(loop);',
'</script></body></html>'
  ].join('\n');

  function buildHTML(th){
    return TEMPLATE
      .replace(/__TITLE__/g, th.title.replace(/"/g,''))
      .replace(/__HUE__/g, String(th.hue))
      .replace(/__HERO__/g, th.hero)
      .replace(/__GOOD__/g, th.good)
      .replace(/__BAD__/g, th.bad)
      .replace(/__MECH__/g, th.mechanic);
  }

  function generate(prompt){
    var th = theme(prompt || 'a fun arcade game');
    var id = 'g' + hash((prompt||'') + '|' + Date.now()).toString(36);
    return { id: id, title: th.title, mechanic: th.mechanic, theme: th, html: buildHTML(th) };
  }

  window.LMGen = { generate: generate, theme: theme };
})();
