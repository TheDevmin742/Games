#!/usr/bin/env node
// Builds the root index.html: a cozy launcher with every game embedded,
// so the single file plays the whole arcade anywhere — hosted, file://,
// or dropped into a chat. Run after editing any game:  node build-arcade.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const GAMES = [
  { id:'a-way-home',        emoji:'🏡', title:'A WAY HOME',      act:'WANDER',
    thumb:'a-way-home/screenshots/bridge.png',
    blurb:'The rain has stopped. Cross the creek, follow the lanterns, and find the warm window waiting far to the east. Where it all began.' },
  { id:'lighthouse-island', emoji:'🗼', title:'THE LIGHTHOUSE',  act:'SET SAIL',
    thumb:'lighthouse-island/screenshots/night.png',
    blurb:'An island, a keeper named Maren, and a lamp that turns all night. Swim, snack on beach berries, find her lost shells — and mind the urchins.' },
  { id:'firefly-catcher',   emoji:'✨', title:'FIREFLY CATCHER', act:'POUNCE',
    thumb:'firefly-catcher/screenshots/play.png',
    blurb:'One jar, one meadow, one setting moon. Pounce on drifting lights before the night ends — then let every one of them go.' },
  { id:'creek-fishing',     emoji:'🎣', title:'CREEK FISHING',   act:'CAST OFF',
    thumb:'creek-fishing/screenshots/play.png',
    blurb:'A bamboo rod, a patient frog, and eight things that might tug the line. Fill the journal one gentle catch at a time.' },
  { id:'little-garden',     emoji:'🌻', title:'LITTLE GARDEN',   act:'PUTTER',
    thumb:'little-garden/screenshots/play.png',
    blurb:'Till, plant, water, wait. Sunflowers, pumpkins, and catnip that grow in real time — even while you’re away. Shoo the crows.' },
  { id:'star-paths',        emoji:'🌠', title:'STAR PATHS',      act:'LOOK UP',
    thumb:'star-paths/screenshots/play.png',
    blurb:'From the cottage roof, connect the stars — five constellations, five chapters of how one small black cat found her way home.' },
];

const payload = {};
for (const g of GAMES)
  payload[g.id] = Buffer.from(readFileSync(`${g.id}/index.html`, 'utf8'), 'utf8').toString('base64');

const cards = GAMES.map(g => `
      <div class="slot">
        <button class="card" data-game="${g.id}" aria-label="Play ${g.title}">
          <span class="thumb">
            <img src="${g.thumb}" alt="" loading="lazy"
              onerror="this.style.display='none';this.nextElementSibling.hidden=false">
            <span class="ph" hidden>${g.emoji}</span>
          </span>
          <span class="body">
            <span class="name">${g.emoji}&nbsp; ${g.title}</span>
            <span class="blurb">${g.blurb}</span>
            <span class="play">▶ ${g.act}</span>
          </span>
        </button>
        <a class="solo" href="${g.id}/index.html">open on its own page ↗</a>
      </div>`).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>The Cozy Arcade — tiny tales of a small black cat</title>
<style>
  :root{
    --bg:#101613; --card:#1a231c; --edge:#2f4033; --ink:#efe6cf;
    --sub:#9db38f; --glow:#f2d98a; --wood:#3d2f22; --wood-hi:#57432f; --wood-lo:#2a2016;
  }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;min-height:100%;background:
    radial-gradient(120% 90% at 50% -10%, #1a2a2e 0%, var(--bg) 55%, #0b100d 100%);
    font-family:"Courier New",monospace;color:var(--ink)}
  #sky{position:fixed;inset:0;z-index:0;pointer-events:none}
  main{position:relative;z-index:1;max-width:900px;margin:0 auto;padding:34px 18px 70px}

  /* ---- wooden sign header ---- */
  header{display:flex;flex-direction:column;align-items:center;margin-bottom:38px}
  #mascot{image-rendering:pixelated;width:96px;height:60px;margin-bottom:-6px;position:relative;z-index:2}
  .sign{position:relative;background:linear-gradient(180deg,var(--wood-hi),var(--wood) 30%,var(--wood-lo));
    border:3px solid #1b140d;border-radius:8px;padding:18px 34px 16px;text-align:center;
    box-shadow:inset 0 2px 0 rgba(255,230,180,.16), inset 0 -3px 0 rgba(0,0,0,.4), 0 10px 26px rgba(0,0,0,.5)}
  .sign::before,.sign::after{content:"";position:absolute;top:9px;width:7px;height:7px;border-radius:50%;
    background:#141312;box-shadow:inset 0 -1px 0 rgba(255,255,255,.15)}
  .sign::before{left:11px}.sign::after{right:11px}
  h1{font-size:clamp(19px,4.6vw,30px);letter-spacing:.32em;margin:0;color:#f4e9cd;
    text-shadow:0 2px 0 #17100a}
  .tag{color:#c9b892;font-size:12.5px;margin:8px 0 0;letter-spacing:.06em}

  /* ---- game buttons ---- */
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(255px,1fr));gap:24px}
  .slot{display:flex;flex-direction:column;gap:7px}
  button.card{appearance:none;font:inherit;color:var(--ink);text-align:left;cursor:pointer;
    padding:0;display:flex;flex-direction:column;background:var(--card);
    border:2px solid var(--edge);border-radius:12px;overflow:hidden;
    box-shadow:0 4px 0 #0c110e, 0 10px 22px rgba(0,0,0,.38);
    transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease}
  button.card:hover,button.card:focus-visible{transform:translateY(-3px);border-color:#597a5f;
    box-shadow:0 7px 0 #0c110e, 0 16px 30px rgba(0,0,0,.5), 0 0 22px rgba(242,217,138,.10);outline:none}
  button.card:active{transform:translateY(2px);box-shadow:0 2px 0 #0c110e, 0 6px 14px rgba(0,0,0,.4)}
  .thumb{aspect-ratio:16/9;background:#0c110e;overflow:hidden;position:relative;display:block}
  .thumb img{width:100%;height:100%;object-fit:cover;display:block;image-rendering:pixelated}
  .thumb .ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:44px}
  .thumb .ph[hidden]{display:none}
  .thumb::after{content:"";position:absolute;inset:0;box-shadow:inset 0 -18px 22px -14px rgba(0,0,0,.65)}
  .body{padding:13px 15px 15px;display:flex;flex-direction:column;gap:8px;flex:1}
  .name{font-size:14.5px;font-weight:bold;letter-spacing:.13em}
  .blurb{color:var(--sub);font-size:12px;line-height:1.5;flex:1}
  .play{align-self:flex-start;font-size:11px;font-weight:bold;letter-spacing:.18em;color:#1c130b;
    background:linear-gradient(180deg,#f6e0a2,var(--glow) 60%,#d9b964);
    border:1px solid #8a6f36;border-radius:7px;padding:6px 12px;
    box-shadow:0 2px 0 #7a6230, inset 0 1px 0 rgba(255,255,255,.5)}
  button.card:active .play{box-shadow:0 0 0 #7a6230, inset 0 1px 0 rgba(255,255,255,.5)}
  a.solo{align-self:center;color:#7d947a;font-size:11px;letter-spacing:.05em;
    text-decoration:none;border-bottom:1px dotted #4a5c48;padding-bottom:1px}
  a.solo:hover,a.solo:focus-visible{color:var(--glow);border-color:var(--glow);outline:none}

  footer{text-align:center;margin-top:52px;color:#5c705a;font-size:12px;line-height:1.9}
  footer a{color:#7d947a}

  /* ---- fullscreen player ---- */
  #player{position:fixed;inset:0;z-index:10;background:#0b100d;display:none}
  #player.on{display:block}
  #player iframe{width:100%;height:100%;border:0;display:block}
  #back{position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:11;display:none;
    font:bold 12px "Courier New",monospace;letter-spacing:.12em;color:var(--ink);
    background:rgba(13,19,15,.55);border:1px solid rgba(239,230,207,.3);border-radius:99px;
    padding:7px 14px;cursor:pointer;backdrop-filter:blur(2px);opacity:.65;
    transition:opacity .15s ease}
  #back:hover,#back:focus-visible{opacity:1;outline:none}
  #player.on ~ #back{display:block}
  @media (prefers-reduced-motion: reduce){ button.card,#back{transition:none} }
</style>
</head>
<body>
<canvas id="sky"></canvas>
<main>
  <header>
    <canvas id="mascot" width="24" height="15" aria-hidden="true"></canvas>
    <div class="sign">
      <h1>THE COZY ARCADE</h1>
      <p class="tag">tiny tales of a small black cat — tap a card to play, right here</p>
    </div>
  </header>

  <div class="grid">
${cards}
  </div>

  <footer>
    every game is a single file — vanilla js, a canvas, and a cat<br>
    all six live inside this very page, too. no internet required once it loads.<br>
    made with 🖤 by a human and a robot, vibing
  </footer>
</main>

<div id="player"><iframe id="frame" title="game" allow="autoplay"></iframe></div>
<button id="back" type="button">⌂ &nbsp;BACK TO THE ARCADE</button>

<script>
'use strict';
/* ---- embedded games (base64 of each folder's index.html) ---- */
const PAYLOAD=${JSON.stringify(payload)};
function decode(b64){
  const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
const player=document.getElementById('player'),
      frame=document.getElementById('frame'),
      back=document.getElementById('back');
let scrollPos=0;
function openGame(id){
  scrollPos=scrollY;
  frame.srcdoc=decode(PAYLOAD[id]);
  player.classList.add('on');
  document.body.style.overflow='hidden';
  back.style.display='block';
  frame.focus();
}
function closeGame(){
  player.classList.remove('on');
  frame.srcdoc='';                      // stops the game and its audio
  document.body.style.overflow='';
  back.style.display='none';
  scrollTo(0,scrollPos);
}
for(const b of document.querySelectorAll('button.card'))
  b.addEventListener('click',()=>openGame(b.dataset.game));
back.addEventListener('click',closeGame);
addEventListener('keydown',e=>{ if(e.key==='Escape'&&player.classList.contains('on')) closeGame(); });

/* ---- pixel cat mascot, sitting on the sign ---- */
const mc=document.getElementById('mascot').getContext('2d');
function drawMascot(t){
  mc.clearRect(0,0,24,15);
  const K='#16161f', blink=(t%4.2)>4.05;
  const bob=Math.round(Math.sin(t*1.8)*0.6);
  mc.fillStyle=K;
  mc.fillRect(8,5+bob,8,7);  mc.fillRect(9,4+bob,6,1);  mc.fillRect(9,12,6,1);
  mc.fillRect(9,1+bob,2,3);  mc.fillRect(13,1+bob,2,3);            // ears
  const wag=Math.round(Math.sin(t*2.5)*1);
  mc.fillRect(16,8+wag,2,1); mc.fillRect(18,6+wag,1,3);            // tail
  if(!blink){ mc.fillStyle='#e8c04a'; mc.fillRect(10,6+bob,1,2); mc.fillRect(13,6+bob,1,2); }
}
/* ---- fireflies + stars ---- */
const cvs=document.getElementById('sky'),ctx=cvs.getContext('2d');
let W,H;function fit(){W=cvs.width=innerWidth;H=cvs.height=innerHeight;}
addEventListener('resize',fit);fit();
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const stars=Array.from({length:60},()=>({x:Math.random(),y:Math.random()*.5,tw:Math.random()*7}));
const flies=Array.from({length:24},()=>({x:Math.random()*W,y:Math.random()*H,
  a:Math.random()*7,ph:Math.random()*7,sp:.2+Math.random()*.4}));
let last=performance.now();
function loop(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  const t=now/1000;
  ctx.clearRect(0,0,W,H);
  for(const s of stars){
    const a=.25+.35*(Math.sin(t*1.3+s.tw)+1)/2;
    ctx.fillStyle='rgba(220,230,235,'+a+')';
    ctx.fillRect(s.x*W,s.y*H,1.5,1.5);
  }
  for(const f of flies){
    f.ph+=dt;f.a+=dt*f.sp*(Math.sin(f.ph*.7)>0?1:-1);
    f.x+=Math.cos(f.a)*12*dt;f.y+=Math.sin(f.a*1.3)*9*dt;
    if(f.x<-10)f.x=W+10;if(f.x>W+10)f.x=-10;
    if(f.y<-10)f.y=H+10;if(f.y>H+10)f.y=-10;
    const tw=(Math.sin(f.ph*2.2)+1)/2;
    if(tw<.2)continue;
    const g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,7);
    g.addColorStop(0,'rgba(242,217,138,'+(tw*.5)+')');
    g.addColorStop(1,'rgba(242,217,138,0)');
    ctx.fillStyle=g;ctx.fillRect(f.x-7,f.y-7,14,14);
    ctx.fillStyle='rgba(255,240,190,'+tw+')';
    ctx.fillRect(f.x,f.y,1.5,1.5);
  }
  drawMascot(t);
  if(!reduced)requestAnimationFrame(loop);
}
drawMascot(0);
if(!reduced)requestAnimationFrame(loop); else { for(const s of stars){ctx.fillStyle='rgba(220,230,235,.4)';ctx.fillRect(s.x*W,s.y*H,1.5,1.5);} }
</script>
</body>
</html>
`;
writeFileSync('index.html', html);
const kb = Math.round(Buffer.byteLength(html)/1024);
console.log(`built index.html (${kb} KB, ${GAMES.length} games embedded)`);
