/* Fastaqim mini games: Coin Catch (dhikr or free), Memory Match, Gem Merge.
   Same rules as Road Run: free play uses the daily free-play minutes, every 15 min of play asks for one real task. No music. */
(function(){
Object.assign(T,{
 mi_score:['Score','النقاط','Qabxii','Dhibcaha'],mi_moves:['Moves','الحركات','Sochii','Dhaqdhaqaaq'],mi_again:['Play again','العب مجددًا','Ammas taphadhu','Mar kale ciyaar'],
 mi_restart:['Restart','إعادة','Irra deebi\'i','Dib u bilow'],mi_menu:['Menu','القائمة','Baafata','Liiska'],mi_win:['All pairs found!','وجدت كل الأزواج!','Lameen hunda argatte!','Dhammaan lammaanaha waad heshay!'],
 mi_over:['No more moves','لا توجد حركات','Sochiin hin jiru','Dhaqdhaqaaq kale ma jiro'],mi_time:['Free play time is up for today','انتهى وقت اللعب الحر لليوم','Yeroon tapha bilisaa har\'aa dhumeera','Waqtiga ciyaarta xorta ah maanta waa dhammaaday'],
 mi_done:['Target reached!','وصلت للهدف!','Galma geesse!','Hadafka waad gaartay!'],mi_lvl:['Level','المستوى','Sadarkaa','Heer'],
 mi_hint_c:['Drag to move the tray. Catch coins, skip the grey rocks.','اسحب لتحريك الصينية. التقط العملات وتجنّب الصخور.','Saanii sochoosuuf harkisi. Saantima qabi, dhagaa irraa fagaadhu.','Jiid si aad u dhaqaajiso saxanka. Qabo lacagta, ka fogow dhagxaanta.'],
 mi_hint_m:['Flip two cards. Find all the pairs.','اقلب بطاقتين. اعثر على كل الأزواج.','Kaardii lama garagalchi. Lameen hunda barbaadi.','Rog laba kaar. Hel dhammaan lammaanaha.'],
 mi_hint_g:['Swipe to slide. Same numbers join into one.','اسحب للتحريك. الأرقام المتشابهة تندمج.','Sochoosuuf harkisi. Lakkoofsi walfakkaatu walitti makama.','Jiid si aad u dhaqaajiso. Tirooyinka isku midka ah way isku darmaan.']});
const tt=k=>tl(k),wal=n=>{try{if(window.FQWallet&&n>0)FQWallet.add(n)}catch(e){}};
let M=null;
const css=document.createElement('style');css.textContent=`
#mini{position:fixed;inset:0;z-index:40;display:flex;flex-direction:column;background:linear-gradient(#3b82f6,#8b5cf6);color:#fff;font-family:Inter,system-ui,sans-serif;touch-action:none;user-select:none;-webkit-user-select:none}
#mini .mb{display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top) + 10px) 12px 8px}
#mini .mb button,#mini .mb span{height:40px;border-radius:20px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.2);color:#fff;font:800 15px Inter,system-ui;padding:0 14px;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
#mini .mb .sp{flex:1;background:none;border:0;padding:0}
#mini .bar{position:relative;top:auto;padding:0;display:block;z-index:auto;flex:none;height:8px;margin:0 14px;border-radius:5px;background:rgba(255,255,255,.18);overflow:hidden}#mini .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#fde047,#f59e0b);transition:width .2s}
#mini .ar{font-family:"FQ","Scheherazade New",serif}
#mini canvas{flex:1;width:100%;display:block}
#mini .hint{position:absolute;left:50%;right:auto;bottom:auto;top:42%;transform:translate(-50%,-50%);background:rgba(15,23,42,.72);padding:12px 18px;border-radius:16px;font:700 15px/1.35 Inter,system-ui;text-align:center;width:min(86%,340px);pointer-events:none;transition:opacity .5s}
#mini .board{flex:1;display:flex;align-items:center;justify-content:center;padding:10px 14px calc(env(safe-area-inset-bottom) + 14px)}
.mm{display:grid;gap:8px;width:min(100%,420px)}
.mc{aspect-ratio:3/4;perspective:600px;cursor:pointer}.mc>div{position:relative;width:100%;height:100%;transition:transform .35s;transform-style:preserve-3d}
.mc.f>div,.mc.ok>div{transform:rotateY(180deg)}.mc b,.mc u{position:absolute;inset:0;border-radius:14px;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:grid;place-items:center}
.mc b{background:linear-gradient(145deg,#60a5fa,#6366f1);box-shadow:inset 0 0 0 3px rgba(255,255,255,.25),0 6px 14px -6px rgba(0,0,0,.5)}
.mc b::after{content:'';width:42%;aspect-ratio:1;border-radius:50%;border:3px solid rgba(255,255,255,.35)}
.mc u{text-decoration:none;background:#fff;transform:rotateY(180deg);font-size:clamp(26px,9vw,40px);box-shadow:0 6px 14px -6px rgba(0,0,0,.5)}
.mc.ok u{background:#fefce8;box-shadow:0 0 0 3px #facc15}
.g2{position:relative;width:min(100%,400px);aspect-ratio:1;background:rgba(15,23,42,.28);border-radius:18px;padding:8px}
.g2 .c,.g2 .t{position:absolute;width:calc((100% - 40px)/4);height:calc((100% - 40px)/4);border-radius:12px}
.g2 .c{background:rgba(255,255,255,.08)}
.g2 .t{display:grid;place-items:center;font:900 clamp(18px,6.5vw,30px) Inter,system-ui;color:#fff;transition:left .12s,top .12s;box-shadow:inset 0 -4px 0 rgba(0,0,0,.18)}
.g2 .t.n{animation:mpop .18s}.g2 .t.m{animation:mpop2 .2s}
@keyframes mpop{from{transform:scale(.3)}to{transform:scale(1)}}@keyframes mpop2{50%{transform:scale(1.15)}}`;
document.head.appendChild(css);
const GEM=['#94a3b8','#4ade80','#2dd4bf','#0ea5e9','#3b82f6','#6366f1','#8b5cf6','#d946ef','#ec4899','#f43f5e','#f97316','#f59e0b','#eab308'];
/* ---------- shared: time rules ---------- */
function canStart(mode){try{BR=brGet();if(brTaskSince(BR.at)){BR={s:0,at:Date.now()};brSet(BR)}if(BR.s>=BR_MAX){brCard();return false}}catch(e){}
 if(mode==='free'){try{if(fqLeft()<=0){toast('🌟 '+tl('fq_back'));return false}FQ=plGet();FQ._d=fqDay();FQ._sp=0}catch(e){}}return true}
function tick(dt){if(!M)return;try{if(M.mode!=='dhikr'){const b0=BR.s;BR.s+=dt;if(b0<BR_MAX-300&&BR.s>=BR_MAX-300)toast('⏱ '+tl('br_w5'));if(b0<BR_MAX-60&&BR.s>=BR_MAX-60)toast('⏱ '+tl('br_w1'));if(Math.floor(b0)!==Math.floor(BR.s))brSet(BR);if(BR.s>=BR_MAX){brSet(BR);end(true);brCard();return}}
 if(M.mode==='free'){fqAdd(dt);const l=fqLeftO(FQ);M.left=l;if(l<=0){fqSave();end(false,tt('mi_time'));return}}}catch(e){}}
function shell(top){const d=document.createElement('div');d.id='mini';d.innerHTML=`<div class="mb"><button id="mX" aria-label="Back">‹</button><span id="mS">${CI2()} 0</span><span class="sp"></span><span id="mT" hidden></span><button id="mPz" aria-label="Pause">⏸</button></div>${top||''}`;document.body.appendChild(d);
 d.querySelector('#mX').onclick=()=>pause();d.querySelector('#mPz').onclick=()=>pause();return d}
function pause(){if(!M||M.paused)return;M.paused=true;const d=$('mini');if(!d)return;const o=document.createElement('div');o.id='mPo';o.style.cssText='position:absolute;inset:0;z-index:5;background:rgba(15,23,42,.6);display:grid;place-items:center';
 o.innerHTML=`<div class="sheet" style="max-width:320px;width:86%"><h1>⏸ ${tl('paused')}</h1><div class="stats"><div><b>${M.score}</b><span>${tt('mi_score')}</span></div></div><button class="go" id="mR">${tl('resume')}</button><button class="sec" id="mRs">↻ ${tt('mi_restart')}</button><button class="sec" id="mMn">${tt('mi_menu')}</button></div>`;d.appendChild(o);
 o.querySelector('#mR').onclick=()=>{o.remove();M.paused=false;M.lastT=performance.now()};o.querySelector('#mRs').onclick=()=>{const k=M.kind,m=M.mode;end(true);start(k,m)};o.querySelector('#mMn').onclick=()=>end(false)}
function MCONF(n){try{if(window.G&&G.parts)return confetti(n)}catch(e){}const d=$('mini');if(!d)return;const cols=['#fbbf24','#34d399','#f472b6','#60a5fa','#fb923c','#a78bfa'];for(let i=0;i<Math.min(n,70);i++){const e=document.createElement('i');const x=Math.random()*100,dx=(Math.random()-.5)*120,r=Math.random()*720,du=1.4+Math.random()*1.2;e.style.cssText=`position:absolute;top:-12px;left:${x}%;width:${6+Math.random()*5}px;height:${9+Math.random()*6}px;border-radius:2px;background:${cols[i%6]};pointer-events:none;z-index:4`;d.appendChild(e);e.animate([{transform:'translate(0,0) rotate(0)',opacity:1},{transform:`translate(${dx}px,${innerHeight+40}px) rotate(${r}deg)`,opacity:.9}],{duration:du*1000,easing:'cubic-bezier(.2,.6,.4,1)',delay:Math.random()*250}).onfinish=()=>e.remove()}}
const MCOL=c=>(window.MINI&&MINI.col)?MINI.col(c):c;
function CI2(){return '<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10.5" fill="#f5b301" stroke="#a35f00"/><path d="M12 6.8l1.5 3.2 3.5.4-2.6 2.4.7 3.5L12 14.6l-3.1 1.7.7-3.5L7 10.4l3.5-.4z" fill="#fff8d6"/></svg>'}
function setScore(n){const s=$('mS');if(s)s.innerHTML=CI2()+' '+n}
function setTime(){const t=$('mT');if(!t||!M)return;if(M.mode==='free'&&M.left!=null){t.hidden=false;const l=Math.max(0,Math.ceil(M.left));t.textContent='⏱ '+Math.floor(l/60)+':'+String(l%60).padStart(2,'0')}}
function hintBox(d,k){const h=document.createElement('div');h.className='hint';h.textContent=tt(k);d.appendChild(h);setTimeout(()=>{h.style.opacity=0;setTimeout(()=>h.remove(),600)},2600)}
function start(kind,mode){if(!canStart(mode))return;try{SFX.ctx()}catch(e){}cancelAnimationFrame(raf);state='mini';try{menuHide()}catch(e){}
 M={kind,mode,score:0,coins:0,t0:performance.now()};try{if(window.MINI&&MINI.onStart)MINI.onStart(kind,mode)}catch(e){}(Object.assign({catch:catchGame,match:matchGame,merge:mergeGame},(window.MINI&&MINI.games)||{})[kind]||catchGame)()}
function end(silent,msg){if(!M)return;const m=M;M=null;cancelAnimationFrame(m.raf);clearInterval(m.iv);try{fqSave()}catch(e){}try{brSet(BR)}catch(e){}
 if(m.off)m.off();const d=$('mini');if(d)d.remove();const earned=m.coins||0;wal(earned);
 if(silent)return;state='menu';G=null;
 menuShow(`<p class="big" style="font-size:2.4rem;margin:0">${m.won?'🎉':'⭐'}</p><h1>${msg||(m.won?(m.kind==='match'?tt('mi_win'):tt('mi_done')):tt('mi_score')+': '+m.score)}</h1>
  <div class="stats"><div><b>${m.score}</b><span>${tt('mi_score')}</span></div><div><b>+${earned}</b><span>🪙 ${tl('coins')}</span></div>${m.mode==='dhikr'?`<div><b>${m.count||0}</b><span>📿</span></div>`:''}</div>
  <button class="go" id="mA">${tt('mi_again')}</button><button class="sec" id="mM">${tt('mi_menu')}</button>`);
 $('mA').onclick=()=>start(m.kind,m.mode);$('mM').onclick=()=>{showMenu()};last=performance.now();loop()}
/* ---------- Coin Catch ---------- */
function catchGame(){const dk=M.mode==='dhikr',z=DZ[ST.dz||0],tg=ST.tgt||33;
 const d=shell(dk?`<div class="bar"><i id="mP"></i></div><div style="text-align:center;margin-top:6px;font-size:22px" class="ar">${z.ar}</div>`:'');
 const cv=document.createElement('canvas');d.appendChild(cv);hintBox(d,'mi_hint_c');const x=cv.getContext('2d');let W=0,H=0;const DPR=Math.min(2,devicePixelRatio||1);
 const rs=()=>{const r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*DPR;cv.height=H*DPR;x.setTransform(DPR,0,0,DPR,0,0)};rs();addEventListener('resize',rs);
 const sf={slow:.8,normal:1,fast:1.25}[ST.spd]||1;let tx=W/2,px=W/2,items=[],parts=[],fl=[],spawn=0,lives=3,combo=0,count=0,shake=0,last0=performance.now(),el=0;
 const mv=e=>{const r=cv.getBoundingClientRect();tx=(e.touches?e.touches[0].clientX:e.clientX)-r.left;if(e.cancelable)e.preventDefault()};
 cv.addEventListener('pointermove',mv);cv.addEventListener('pointerdown',mv);cv.addEventListener('touchmove',mv,{passive:false});
 M.off=()=>removeEventListener('resize',rs);
 const coinD=(cx,cy,r,rot)=>{x.save();x.translate(cx,cy);x.scale(Math.max(.25,Math.abs(Math.cos(rot))),1);const g=x.createRadialGradient(-r*.3,-r*.35,r*.1,0,0,r);g.addColorStop(0,'#fff1a6');g.addColorStop(.55,'#f5b301');g.addColorStop(1,'#b86a00');x.fillStyle=g;x.beginPath();x.arc(0,0,r,0,7);x.fill();x.strokeStyle='rgba(255,248,214,.7)';x.lineWidth=r*.12;x.beginPath();x.arc(0,0,r*.72,0,7);x.stroke();
  x.fillStyle='#fff8d6';x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.2:r*.46;x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}x.fill();x.restore()};
 const gemD=(cx,cy,r)=>{x.save();x.translate(cx,cy);const g=x.createLinearGradient(-r,-r,r,r);g.addColorStop(0,'#99f6e4');g.addColorStop(1,'#0d9488');x.fillStyle=g;x.beginPath();x.moveTo(0,-r);x.lineTo(r*.85,-r*.25);x.lineTo(0,r);x.lineTo(-r*.85,-r*.25);x.closePath();x.fill();x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.moveTo(0,-r);x.lineTo(r*.3,-r*.25);x.lineTo(-r*.3,-r*.25);x.closePath();x.fill();x.restore()};
 const rockD=(cx,cy,r,rot)=>{x.save();x.translate(cx,cy);x.rotate(rot);const g=x.createRadialGradient(-r*.3,-r*.3,r*.1,0,0,r*1.1);g.addColorStop(0,'#cbd5e1');g.addColorStop(1,'#475569');x.fillStyle=g;x.beginPath();for(let i=0;i<7;i++){const a=i/7*Math.PI*2,rr=r*(.82+((i*37)%5)/20);x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}x.closePath();x.fill();x.restore()};
 const pop=(px0,py0,col,n)=>{for(let i=0;i<n;i++){const a=Math.random()*7,s=60+Math.random()*160;parts.push({x:px0,y:py0,vx:Math.cos(a)*s,vy:Math.sin(a)*s-60,l:.6,c:col})}};
 function frame(now){if(!M)return;if(M.paused){last0=now;M.raf=requestAnimationFrame(frame);return}const dt=Math.min(.05,(now-last0)/1000);last0=now;el+=dt;tick(dt);if(!M)return;setTime();
  const lvl=1+el/40,trW=Math.min(150,W*.34),trY=H-70;px+=(tx-px)*Math.min(1,dt*14);px=Math.max(trW/2,Math.min(W-trW/2,px));
  spawn-=dt;if(spawn<=0){spawn=Math.max(.28,.75/lvl)/sf;const r=Math.random(),k=r<(dk?.12:.2)?'rock':r<.27?'gem':'coin';items.push({k,x:20+Math.random()*(W-40),y:-30,v:(150+Math.random()*80)*lvl*sf,rot:Math.random()*6,r:k==='rock'?20:k==='gem'?15:17})}
  for(const it of items){it.y+=it.v*dt;it.rot+=dt*(it.k==='rock'?2:5);
   if(!it.done&&it.y>trY-18&&it.y<trY+16&&Math.abs(it.x-px)<trW/2+6){it.done=1;
    if(it.k==='rock'){combo=0;shake=.35;vib([30,40,30]);if(!dk){lives--;if(lives<=0){M.score=M.score;M.coins=Math.round(M.score/4);end(false);return}}fl.push({t:dk?'✕':'♥ -1',x:it.x,y:trY-30,l:1,c:'#fca5a5'})}
    else{combo++;const mul=Math.min(5,1+Math.floor(combo/10)),v=(it.k==='gem'?5:1)*mul;M.score+=v;if(dk){count++;M.count=count;fl.push({t:z.ar,x:it.x,y:trY-34,l:1,c:'#fff',ar:1})}else fl.push({t:'+'+v,x:it.x,y:trY-30,l:1,c:'#fde047'});
     pop(it.x,trY-10,it.k==='gem'?'#5eead4':'#fde047',it.k==='gem'?16:9);vib(it.k==='gem'?[10,20,10]:6);try{SFX.plip()}catch(e){}setScore(M.score);
     if(dk){const p=$('mP');if(p)p.style.width=Math.min(100,count/tg*100)+'%';if(count>=tg){M.won=1;M.coins=Math.round(count/3)+20;MCONF(80);vib([20,40,20,40,20]);setTimeout(()=>end(false),900);it.y=H+99}}}}}
  items=items.filter(it=>!it.done&&it.y<H+40);
  /* draw */
  const sx=shake>0?(Math.random()-.5)*12*shake:0;shake=Math.max(0,shake-dt);x.setTransform(DPR,0,0,DPR,sx*DPR,0);x.clearRect(-20,0,W+40,H);
  for(let i=0;i<14;i++){const yy=((i*97+el*40)%(H+40))-20;x.fillStyle='rgba(255,255,255,.06)';x.beginPath();x.arc((i*131)%W,yy,2+i%3,0,7);x.fill()}
  for(const it of items){if(it.k==='coin')coinD(it.x,it.y,it.r,it.rot);else if(it.k==='gem')gemD(it.x,it.y,it.r);else rockD(it.x,it.y,it.r,it.rot)}
  /* tray */
  x.save();x.translate(px,trY);const tg2=x.createLinearGradient(0,-14,0,22);tg2.addColorStop(0,'#a78bfa');tg2.addColorStop(1,'#6d28d9');x.fillStyle='rgba(0,0,0,.25)';x.beginPath();x.ellipse(0,30,trW/2,7,0,0,7);x.fill();
  x.fillStyle=tg2;x.beginPath();x.moveTo(-trW/2,-12);x.lineTo(trW/2,-12);x.lineTo(trW/2-16,20);x.lineTo(-trW/2+16,20);x.closePath();x.fill();x.fillStyle='#ddd6fe';x.fillRect(-trW/2-4,-16,trW+8,7);x.restore();
  for(const p of parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt;p.l-=dt;x.globalAlpha=Math.max(0,p.l/.6);x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,3,0,7);x.fill()}parts=parts.filter(p=>p.l>0);x.globalAlpha=1;
  for(const f of fl){f.y-=50*dt;f.l-=dt*1.2;x.globalAlpha=Math.max(0,f.l);x.textAlign='center';x.font=f.ar?'26px FQ,"Scheherazade New",serif':'900 22px Inter,system-ui';x.fillStyle=MCOL(f.c);x.fillText(f.t,f.x,f.y)}fl=fl.filter(f=>f.l>0);x.globalAlpha=1;
  if(!dk){x.font='18px system-ui';x.textAlign='left';x.fillStyle=MCOL('#fca5a5');x.fillText('❤'.repeat(Math.max(0,lives)),12,24)}
  if(combo>=10){x.font='900 20px Inter,system-ui';x.textAlign='right';x.fillStyle=MCOL('#fde047');x.fillText('x'+Math.min(5,1+Math.floor(combo/10)),W-12,26)}
  if(!dk)M.coins=Math.round(M.score/4);M.raf=requestAnimationFrame(frame)}
 M.raf=requestAnimationFrame(frame)}
/* ---------- Memory Match ---------- */
function matchGame(lv){lv=lv||1;const ICONS=(window.MINI&&MINI.icons&&MINI.icons())||['🌙','⭐','🕌','📖','🧭','💎','🌴','🏮','🍉','🎁','🌿','☀️'];const pairs=lv===1?6:lv===2?8:10,cols=lv===1?3:4;
 const d=shell(`<div style="text-align:center;font:800 14px Inter,system-ui;opacity:.85;margin-top:2px">${tt('mi_lvl')} ${lv} · ${tt('mi_moves')}: <b id="mMv">0</b></div>`);d.insertAdjacentHTML('beforeend','<div class="board"><div class="mm" id="mG"></div></div>');hintBox(d,'mi_hint_m');
 const deck=ICONS.slice(0,pairs).flatMap(i=>[i,i]).sort(()=>Math.random()-.5),G0=$('mG');G0.style.gridTemplateColumns=`repeat(${cols},1fr)`;G0.style.width=`min(100%,${cols*104}px)`;
 G0.innerHTML=deck.map((ic,i)=>`<div class="mc" data-i="${i}"><div><b></b><u>${ic}</u></div></div>`).join('');let open=[],moves=0,found=0,lock=false,last0=performance.now();
 M.iv=setInterval(()=>{const n=performance.now(),dt=Math.min(1,(n-last0)/1000);last0=n;if(M&&!M.paused){tick(dt);setTime()}},250);
 G0.querySelectorAll('.mc').forEach(c=>c.onclick=()=>{if(lock||c.classList.contains('f')||c.classList.contains('ok'))return;c.classList.add('f');vib(5);open.push(c);
  if(open.length===2){moves++;$('mMv').textContent=moves;const [a,b]=open;if(deck[a.dataset.i]===deck[b.dataset.i]){a.classList.add('ok');b.classList.add('ok');found++;M.score+=10;setScore(M.score);vib([10,20,10]);try{SFX.plip()}catch(e){}open=[];
    if(found===pairs){M.won=1;M.score+=Math.max(0,pairs*6-moves)*2;M.coins=Math.round(M.score/3);setScore(M.score);MCONF(70);
     setTimeout(()=>{if(!M)return;if(lv<3){const keep={score:M.score,coins:M.coins};clearInterval(M.iv);$('mini').remove();M.won=0;matchGame(lv+1);M.score=keep.score;M.coins=keep.coins;setScore(M.score)}else end(false)},1100)}}
   else{lock=true;setTimeout(()=>{a.classList.remove('f');b.classList.remove('f');open=[];lock=false},700)}}})}
/* ---------- Gem Merge ---------- */
function mergeGame(){const d=shell(`<div style="text-align:center;font:800 14px Inter,system-ui;opacity:.85">🏆 ${tl('best')}: <b>${+(localStorage.getItem('fastaqim.gmbest')||0)}</b></div>`);d.insertAdjacentHTML('beforeend','<div class="board"><div class="g2" id="mB"></div></div>');hintBox(d,'mi_hint_g');
 const B=$('mB');let grid=Array.from({length:4},()=>Array(4).fill(null)),id=0,last0=performance.now();
 for(let r=0;r<4;r++)for(let c=0;c<4;c++){const e=document.createElement('div');e.className='c';pos(e,r,c);B.appendChild(e)}
 function pos(e,r,c){e.style.left=`calc(8px + ${c} * ((100% - 40px)/4 + 8px))`;e.style.top=`calc(8px + ${r} * ((100% - 40px)/4 + 8px))`}
 function add(){const em=[];for(let r=0;r<4;r++)for(let c=0;c<4;c++)if(!grid[r][c])em.push([r,c]);if(!em.length)return;const [r,c]=em[Math.floor(Math.random()*em.length)];const v=Math.random()<.9?2:4,e=document.createElement('div');e.className='t n';
  const t={v,e,id:id++};grid[r][c]=t;paint(t);pos(e,r,c);B.appendChild(e)}
 function paint(t){const lv=Math.log2(t.v);t.e.textContent=t.v;t.e.style.background=GEM[Math.min(GEM.length-1,lv)];t.e.style.fontSize=t.v>=1000?'clamp(14px,5vw,22px)':''}
 add();add();M.iv=setInterval(()=>{const n=performance.now(),dt=Math.min(1,(n-last0)/1000);last0=n;if(M&&!M.paused){tick(dt);setTime()}},250);
 function move(dr,dc){let moved=false,gain=0;const rng=[0,1,2,3],rs=dr>0?rng.slice().reverse():rng,cs=dc>0?rng.slice().reverse():rng,merged=new Set();
  for(const r of rs)for(const c of cs){const t=grid[r][c];if(!t)continue;let nr=r,nc=c;
   while(true){const rr=nr+dr,cc=nc+dc;if(rr<0||rr>3||cc<0||cc>3)break;const o=grid[rr][cc];if(!o){nr=rr;nc=cc;continue}
    if(o.v===t.v&&!merged.has(o.id)){grid[r][c]=null;o.v*=2;gain+=o.v;merged.add(o.id);pos(t.e,rr,cc);const te=t.e;setTimeout(()=>te.remove(),120);setTimeout(()=>{paint(o);o.e.classList.remove('m');void o.e.offsetWidth;o.e.classList.add('m')},120);moved=true;nr=null;break}break}
   if(nr!==null&&(nr!==r||nc!==c)){grid[r][c]=null;grid[nr][nc]=t;pos(t.e,nr,nc);moved=true}}
  if(!moved)return;M.score+=gain;M.coins=Math.round(M.score/20);setScore(M.score);if(gain){vib(gain>=64?[10,20,10]:6);try{SFX.plip()}catch(e){}}
  setTimeout(()=>{if(!M)return;add();if(!canMove()){const b=+(localStorage.getItem('fastaqim.gmbest')||0);if(M.score>b)localStorage.setItem('fastaqim.gmbest',M.score);setTimeout(()=>end(false,tt('mi_over')),700)}},130)}
 function canMove(){for(let r=0;r<4;r++)for(let c=0;c<4;c++){const t=grid[r][c];if(!t)return true;if(c<3&&grid[r][c+1]&&grid[r][c+1].v===t.v)return true;if(r<3&&grid[r+1][c]&&grid[r+1][c].v===t.v)return true}return false}
 let sx=0,sy=0;const ts=e=>{const p=e.touches?e.touches[0]:e;sx=p.clientX;sy=p.clientY},te=e=>{const p=e.changedTouches?e.changedTouches[0]:e,dx=p.clientX-sx,dy=p.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;
  if(Math.abs(dx)>Math.abs(dy))move(0,dx>0?1:-1);else move(dy>0?1:-1,0)};
 d.addEventListener('touchstart',ts,{passive:true});d.addEventListener('touchend',te);d.addEventListener('mousedown',ts);d.addEventListener('mouseup',te);
 const kd=e=>{const k={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key];if(k){e.preventDefault();move(k[0],k[1])}};addEventListener('keydown',kd);M.off=()=>removeEventListener('keydown',kd);
 M.move=move}
window.MINI={start,end,get cur(){return M},games:{},api:{MCONF,shell,tick,setScore,setTime,hintBox,pause,wal,CI2}};
/* pause the mini game timer when the page is hidden: end quietly saves time and returns to menu */
document.addEventListener('visibilitychange',()=>{if(document.hidden&&M){pause();try{fqSave();brSet(BR)}catch(e){}}});
})();
