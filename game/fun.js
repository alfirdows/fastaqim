/* Road Run "fun pack" (17 Nov): combo multiplier, surprise events, mystery gifts, daily challenges, wallet,
   milestones, close-call bonus, longer To-do run with "go do it now" coaching and bigger rewards.
   Loaded after the game script; wraps existing functions only. Dhikr counting is never multiplied: 1 coin = 1 dhikr. */
(function(){
"use strict";
const L={en:0,ar:1,om:2,so:3}[LG]||0;
const tx=(en,ar,om,so)=>[en,ar,om,so][L]||en;
Object.assign(T,{
 ev_rain:['COIN RAIN!','مطر العملات!','Rooba saantimaa!','Roob qadaadiic!'],
 ev_gold:['GOLDEN TIME x3','وقت ذهبي x3','Yeroo warqee x3','Waqti dahab x3'],
 ev_sky:['SKY BRIDGE: JUMP!','جسر السماء: اقفز!','Riqicha samii: utaali!','Buundada cirka: bood!'],
 ev_snake:['ZIGZAG!','متعرج!','Jal-jallaa!','Qalqalloocan!'],
 gift:['Surprise!','مفاجأة!','Dinqisiisaa!','Layaab!'],
 close:['Close one! +5','نجوت! +5','Dhiyoo! +5','Ku dhawaad! +5'],
 dc_t:['Today\'s challenges','تحديات اليوم','Qormaata har\'aa','Tartamada maanta'],
 dc_done:['Challenge done! +','أنجزت التحدي! +','Qormaanni xumurame! +','Tartankii waa dhammaaday! +'],
 wal:['Your coins','عملاتك','Saantima kee','Qadaadiicdaada'],
 earned:['added to your coins','أضيفت لعملاتك','saantima keetti dabalame','lagu daray qadaadiicdaada'],
 goNow:['Go do it now!','اذهب وافعلها الآن!','Amma deemii hojjedhu!','Hadda tag oo samee!'],
 back2:['Tap Done when you are back','اضغط "تم" عند رجوعك','Yeroo deebitu Xumureera tuqi','Taabo Dhammaad markaad soo noqoto'],
 chest:['Reward chest','صندوق المكافأة','Saanduqa badhaasaa','Sanduuqa abaalmarinta'],
 stepRw:['Step done!','خطوة منجزة!','Tarkaanfiin xumurame!','Tallaabadii waa dhammaatay!']
});
const DCK='fastaqim.gdaily',WK='fastaqim.gwallet';
const wallet={get(){try{return +localStorage.getItem(WK)||0}catch(e){return 0}},add(n){try{localStorage.setItem(WK,String(this.get()+n))}catch(e){}}};
window.FQWallet=wallet;
/* ---------- daily challenges: 3 a day, picked by date so everyone gets the same set ---------- */
const POOL=[
 {k:'coins',n:250,t:()=>tx('Collect 250 coins','اجمع ٢٥٠ عملة','Saantima 250 walitti qabi','Ururi 250 qadaadiic'),r:60},
 {k:'jumps',n:25,t:()=>tx('Jump 25 times','اقفز ٢٥ مرة','Yeroo 25 utaali','Bood 25 jeer'),r:40},
 {k:'pows',n:3,t:()=>tx('Catch 3 power-ups','التقط ٣ قوى','Humna 3 qabadhu','Qabo 3 awood'),r:50},
 {k:'dist',n:1500,t:()=>tx('Drive 1500 m','قد ١٥٠٠ م','Meetira 1500 oofi','Wad 1500 m'),r:50},
 {k:'gifts',n:2,t:()=>tx('Open 2 surprise gifts','افتح هديتين مفاجأة','Kennaa dinqisiisaa 2 bani','Fur 2 hadiyadood oo layaab ah'),r:60},
 {k:'steps',n:2,t:()=>tx('Finish 2 To-do steps','أنجز خطوتين من المهام','Tarkaanfii hojii 2 xumuri','Dhammee 2 tallaabo oo hawl ah'),r:100},
 {k:'dhikr',n:100,t:()=>tx('Say 100 dhikr in runs','قل ١٠٠ ذكر في الجولات','Zikrii 100 jedhi','Dheh 100 dhikri'),r:100},
 {k:'combo',n:5,t:()=>tx('Reach combo x5','صل إلى مضاعف x5','Combo x5 ga\'i','Gaar combo x5'),r:60}];
function day(){const d=new Date();return d.getFullYear()*1e4+(d.getMonth()+1)*100+d.getDate()}
function dcGet(){let o={};try{o=JSON.parse(localStorage.getItem(DCK)||'{}')}catch(e){}if(o.d!==day()){const s=day();const ids=[];let x=s;while(ids.length<3){x=(x*9301+49297)%233280;const i=x%POOL.length;if(!ids.includes(i))ids.push(i)}o={d:day(),ids,p:[0,0,0],done:[0,0,0]}}return o}
function dcSave(o){try{localStorage.setItem(DCK,JSON.stringify(o))}catch(e){}}
let DC=dcGet();
function dc(k,v,set){DC=DC.d===day()?DC:dcGet();DC.ids.forEach((id,i)=>{const c=POOL[id];if(c.k!==k||DC.done[i])return;DC.p[i]=set?Math.max(DC.p[i],v):DC.p[i]+v;if(DC.p[i]>=c.n){DC.done[i]=1;wallet.add(c.r);banner(tl('dc_done')+c.r,'#f59e0b');try{confetti(80)}catch(e){}}});dcSave(DC)}
window.FQdc=dc;
function dcHTML(){DC=dcGet();return `<h2>${tl('dc_t')}</h2><div class="dc">${DC.ids.map((id,i)=>{const c=POOL[id],p=Math.min(c.n,DC.p[i]);return `<div class="dc-r${DC.done[i]?' ok':''}"><span>${DC.done[i]?'✓ ':''}${c.t()}</span><b>${DC.done[i]?'+'+c.r:Math.floor(p)+'/'+c.n}</b><i><u style="width:${p/c.n*100}%"></u></i></div>`}).join('')}</div><div class="wal">${CI()} ${tl('wal')}: <b>${wallet.get()}</b></div>`}
/* ---------- big banner for events ---------- */
function banner(t,col){const d=document.createElement('div');d.className='fbn';d.textContent=t;d.style.background=col||'#10956b';document.body.appendChild(d);setTimeout(()=>d.remove(),1700)}
const st=document.createElement('style');st.textContent=`.fbn{position:fixed;left:50%;top:30%;transform:translate(-50%,-50%) scale(.6);z-index:31;pointer-events:none;color:#fff;font:900 26px/1 Inter,system-ui;padding:14px 22px;border-radius:18px;box-shadow:0 10px 30px -8px rgba(0,0,0,.5);white-space:nowrap;animation:fbn 1.7s cubic-bezier(.2,1.4,.4,1) forwards}
@keyframes fbn{0%{opacity:0;transform:translate(-50%,-50%) scale(.6)}12%{opacity:1;transform:translate(-50%,-50%) scale(1.05)}20%{transform:translate(-50%,-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-70%) scale(1)}}
.mult{position:fixed;right:10px;top:calc(env(safe-area-inset-top) + 150px);z-index:12;min-width:64px;height:40px;border-radius:14px;background:rgba(15,23,42,.66);backdrop-filter:blur(8px);color:#ffd257;font:900 20px/40px Inter,system-ui;text-align:center;overflow:hidden;border:1px solid rgba(255,255,255,.18)}
.mult i{position:absolute;left:0;bottom:0;height:4px;background:#ffd257;transition:width .2s}
[dir=rtl] .mult{right:auto;left:10px}
.dc{display:flex;flex-direction:column;gap:6px}.dc-r{position:relative;display:flex;justify-content:space-between;gap:8px;padding:9px 12px 12px;border-radius:12px;background:#f8fafc;border:1.5px solid #e2e8f0;font:700 .86rem Inter,system-ui;color:#0f172a;overflow:hidden}
.dc-r b{color:#b45309;white-space:nowrap}.dc-r i{position:absolute;left:0;right:0;bottom:0;height:4px;background:#e2e8f0}.dc-r u{display:block;height:100%;background:linear-gradient(90deg,#f59e0b,#fbbf24)}
.dc-r.ok{background:#ecfdf5;border-color:#a7f3d0}.dc-r.ok b{color:#047857}.wal{margin-top:8px;text-align:center;font:700 .9rem Inter,system-ui;color:#475569}.wal b{color:#b45309}
.coach{font:900 1.5rem/1.2 Inter,system-ui;text-align:center;color:#10956b;margin:2px 0 4px}.tmo{display:flex;gap:6px;justify-content:center;margin:6px 0}.tmo button{flex:1;min-height:46px;border-radius:14px;border:1.5px solid #e2e8f0;background:#fff;font:800 1rem Inter,system-ui}
.tmo button.on{background:#0f172a;color:#fff;border-color:#0f172a}`;document.head.appendChild(st);
const mult=document.createElement('div');mult.className='mult';mult.hidden=true;mult.innerHTML='x1<i></i>';document.body.appendChild(mult);
/* ---------- run extras ---------- */
const MULT=[1,2,3,4,5];
{const _n=newRun;newRun=function(){const r=_n.apply(this,arguments);Object.assign(G,{mi:0,mc:0,gold:0,evNext:30,evOn:null,mile:500,jumps:0,pows:0,gifts:0,dcD:0});return r}}
{const _j=jump;jump=function(){const y=G&&G.y;_j.apply(this,arguments);if(G&&y<.05&&G.vy>0){G.jumps++;dc('jumps',1)}}}
{const _p=power;power=function(k){_p.apply(this,arguments);if(G){G.pows++;dc('pows',1)}}}
{const _c=coin;coin=function(ob){const g=G,c0=g.coins;_c.apply(this,arguments);
  const base=g.coins-c0,m=MULT[g.mi]*(g.gold>0?3:1),extra=base*(m-1);if(extra>0)g.coins+=extra;dc('coins',base*m);if(g.mode==='dhikr')dc('dhikr',1);
  g.mc++;if(g.mc>=10&&g.mi<MULT.length-1){g.mi++;g.mc=0;banner('COMBO x'+MULT[g.mi],'#f59e0b');dc('combo',MULT[g.mi],true);try{vib([10,20,10])}catch(e){}}}}
{const _b=bonus;bonus=function(ob){if(ob.mys){G.gifts++;dc('gifts',1);const r=Math.random();const p=P(ob.ln-1,0,(ob.h||0)+.5);burst(p.x,p.y,'#f472b6',24);SFX.power();
   if(r<.3){G.coins+=25;banner(tl('gift')+' +25','#ec4899')}else if(r<.5){power('mag');}else if(r<.65){power('boost')}else if(r<.8){G.gold=8;banner(tl('ev_gold'),'#d97706')}else if(r<.95){G.coins+=50;banner(tl('gift')+' +50','#ec4899')}else{G.coins+=150;banner('JACKPOT +150','#7c3aed');confetti(120)}return}
  return _b.apply(this,arguments)}}
{const _h=hurt;hurt=function(){if(G){G.mi=0;G.mc=0}return _h.apply(this,arguments)}}
function spawnEvent(g){if(g.mode==='dhikr'&&g.finishZ!=null)return;const z0=g.dist+30;g.objs=g.objs.filter(o=>!(o.z>z0-4&&o.z<z0+40&&['low','high','block'].includes(o.k)));
 const e=pick(g.mode==='dhikr'?['rain','snake','sky']:['rain','gold','sky','snake']);g.evOn=e;
 if(e==='rain'){for(let i=0;i<14;i++)for(let ln=0;ln<3;ln++)g.objs.push({k:'coin',ln,z:z0+i*1.4,h:0});banner(tl('ev_rain'),'#0ea5e9')}
 else if(e==='gold'){g.gold=9;banner(tl('ev_gold'),'#d97706')}
 else if(e==='sky'){for(let s=0;s<3;s++){const ln=s%3;for(let k=0;k<7;k++)g.objs.push({k:'coin',ln,z:z0+s*11+k*1.3,h:Math.sin(k/6*Math.PI)*2.1+.2})}banner(tl('ev_sky'),'#8b5cf6')}
 else{for(let i=0;i<24;i++)g.objs.push({k:'coin',ln:[0,1,2,1][i%4],z:z0+i*1.5,h:0});banner(tl('ev_snake'),'#10b981')}
 g.objs.sort((a,b)=>a.z-b.z);g.next=Math.max(g.next,z0+42)}
{const _s=step;step=function(dt){const g=G;const r=_s.apply(this,arguments);try{if(!g||state!=='play'||g.cd>0)return r;
  g.gold=Math.max(0,g.gold-dt);
  if(g.t>g.evNext){g.evNext=g.t+rnd(28,40);spawnEvent(g)}
  if(g.dist>=g.mile){banner(g.mile+' m!','#334155');g.coins+=10;g.mile+=500}
  const dd=Math.floor(g.dist)-g.dcD;if(dd>=50){dc('dist',dd);g.dcD+=dd}
  for(const ob of g.objs){if(ob.close||ob.hit||!['low','high','block'].includes(ob.k))continue;const d=ob.z-g.dist;if(d<-.7&&d>-2){ob.close=1;if(Math.abs(ob.ln-Math.round(g.x+1))===1&&Math.abs(g.x-(ob.ln-1))<1.25){g.coins+=5;floatT(tl('close'),W/2,H*.62,'#fde047')}}}
  mult.hidden=false;mult.firstChild.textContent='x'+MULT[g.mi]*(g.gold>0?3:1);mult.lastChild.style.width=(g.mc/10*100)+'%';mult.style.color=g.gold>0?'#fbbf24':'#ffd257'}catch(e){}return r}}
/* gifts: some bonus stars become surprise gifts */
{const _bd=build;build=function(){const n0=G.objs.length;_bd.apply(this,arguments);for(let i=n0;i<G.objs.length;i++){const o=G.objs[i];if(o.k==='star5'&&Math.random()<.6)o.mys=1}}}
/* ---------- To-do run: longer, coached, bigger rewards ---------- */
{const _bg=begin;begin=function(tasks){const r=_bg.apply(this,arguments);try{const g=G;if(g&&g.mode==='task'&&g.steps.length){g.gates=[];g.objs=g.objs.filter(o=>o.k!=='gate');const n=g.steps.length,span=Math.max(150,1500/n);
  g.steps.forEach((s,i)=>{const z=120+i*span;g.gates.push(z);g.objs.push({k:'gate',z,i,ln:1})})}}catch(e){}return r}}
{const _gh=gateHit;gateHit=function(ob){_gh.apply(this,arguments);try{const g=G,box=document.querySelector('#menuS .stepbox');if(box&&!document.querySelector('#menuS .coach')){const c=document.createElement('div');c.className='coach';c.textContent=tl('goNow');box.before(c);
   const d=$('sDone');if(d){const _o=d.onclick;d.onclick=e=>{const c0=g.coins;g.coins+=50;dc('steps',1);_o&&_o(e);banner(tl('stepRw')+' +50','#10956b')}}}}catch(e){}}}
{const _f=finish;finish=function(){const g=G;try{if(g.mode==='task'){g.coins+=150;}else if(g.mode==='dhikr'){g.coins+=Math.round(g.count/3)}}catch(e){}return _f.apply(this,arguments)}}
/* wallet: every run's coins are kept; end card shows the total */
{const _e=endCard;endCard=function(top,won){const g=G;try{if(!g.banked){g.banked=1;wallet.add(g.coins)}}catch(e){}_e.apply(this,arguments);try{const st=document.querySelector('#menuS .stats');if(st){const w=document.createElement('p');w.className='wal';w.innerHTML=`+${g.coins} ${tl('earned')} · ${CI()} <b>${wallet.get()}</b>`;st.after(w)}}catch(e){}}}

/* ---------- free car choice: any car style, any color, in any world (Tasnim: everyone can pick for free) ---------- */
Object.assign(T,{carT:['Your car','سيارتك','Konkolaataa kee','Gaarigaaga'],k_sleek:['Sport','رياضية','Ispoortii','Isboorti'],k_toy:['Toy','لعبة','Taphataa','Ciyaar'],k_cute:['Bubble','فقاعة','Bubbulii','Xumbo']});
const COLS=[['#0f8a64','#0a5c45'],['#e11d2e','#9f1220'],['#2f7bf6','#1e4fb3'],['#ff6fae','#d63d86'],['#f59e0b','#b45309'],['#8b5cf6','#5b21b6'],['#111827','#030712'],['#f8fafc','#cbd5e1'],['#14b8a6','#0f766e'],['#facc15','#ca8a04'],['#64748b','#334155'],['#fb7185','#be123c']];
const KC=['sedan','sedan_sports','hatchback_sports','suv','suv_luxury','taxi','police_car','van','delivery_van','truck','ambulance','firetruck','garbage_truck','tractor','race_car','race_car_future'];
function carHTML(){const k=ST.car||WD.car,c=(ST.carC||WD.carC)[0],classic=!k.startsWith('k:');return `<h2>${tl('carT')}</h2><div class="cks kc">${KC.map(n=>`<button class="ck${k==='k:'+n?' on':''}" data-ck="k:${n}" aria-label="${n.replace(/_/g,' ')}"><img src="game/cars/${n}.png" alt="" loading="lazy"></button>`).join('')}</div>
 <div class="cks" style="margin-top:8px">${['sleek','toy','cute'].map(x=>`<button class="ck${k===x?' on':''}" data-ck="${x}"><svg viewBox="0 0 60 34" width="54" height="30">${x==='sleek'?'<path d="M4 24 Q6 16 16 14 L24 8 Q30 6 40 8 L50 14 Q57 16 57 24 Z" fill="'+c+'"/><path d="M25 10 L38 10 L45 14 L22 14 Z" fill="#0d1622"/>':x==='toy'?'<rect x="5" y="12" width="50" height="13" rx="5" fill="'+c+'"/><rect x="16" y="4" width="26" height="11" rx="4" fill="'+c+'"/><rect x="19" y="6" width="20" height="7" rx="2" fill="#bfe3ff"/>':'<rect x="7" y="14" width="46" height="12" rx="6" fill="'+c+'"/><circle cx="30" cy="12" r="9" fill="#ffe6f2" stroke="'+c+'" stroke-width="2"/>'}<circle cx="16" cy="26" r="5" fill="#1f2937"/><circle cx="44" cy="26" r="5" fill="#1f2937"/></svg><span>${tl('k_'+x)}</span></button>`).join('')}</div>${classic?`
 <div class="cols">${COLS.map((p,i)=>`<button class="col${c===p[0]?' on':''}" data-cc="${i}" style="background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.7),transparent 40%),${p[0]}" aria-label="color ${i+1}"></button>`).join('')}</div>`:''}`}
function addCar(){try{const w=document.querySelector('#menuS .worlds');if(!w||$('carBox'))return;const d=document.createElement('div');d.id='carBox';d.innerHTML=carHTML();w.after(d);
 d.querySelectorAll('[data-ck]').forEach(b=>b.onclick=()=>{ST.car=b.dataset.ck;if(!ST.carC)ST.carC=WD.carC;stSave();const y=$('menuS').scrollTop;d.remove();addCar();$('menuS').scrollTop=y});
 d.querySelectorAll('[data-cc]').forEach(b=>b.onclick=()=>{ST.carC=COLS[+b.dataset.cc];if(!ST.car)ST.car=WD.car;stSave();const y=$('menuS').scrollTop;d.remove();addCar();$('menuS').scrollTop=y})}catch(e){}}
st.textContent+=`.cks{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.ck{border:2px solid #e2e8f0;background:#fff;border-radius:14px;padding:6px 2px;display:flex;flex-direction:column;align-items:center;gap:2px;font:800 .78rem Inter,system-ui;color:#0f172a;cursor:pointer}.ck.on{border-color:#0f172a;box-shadow:0 0 0 3px rgba(15,23,42,.15)}.kc{grid-template-columns:repeat(4,1fr);gap:6px}.kc .ck{padding:2px;background:#f1f5f9}.kc img{width:100%;aspect-ratio:200/138;object-fit:contain;display:block}
.cols{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-top:8px}.col{aspect-ratio:1;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1.5px #e2e8f0,0 3px 8px rgba(0,0,0,.18);cursor:pointer}.col.on{box-shadow:0 0 0 3px #0f172a}`;


/* ---------- gold coin icon (3 styles; ?coin=1|2|3 for previews) ---------- */
const COINS=[
 '<svg class="ci" viewBox="0 0 24 24"><defs><radialGradient id="cg1" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffe68a"/><stop offset=".55" stop-color="#f5b301"/><stop offset="1" stop-color="#c77800"/></radialGradient></defs><circle cx="12" cy="12" r="10.5" fill="url(#cg1)" stroke="#a35f00" stroke-width="1"/><circle cx="12" cy="12" r="7.6" fill="none" stroke="#fff1b0" stroke-opacity=".7" stroke-width=".9"/><path d="M12 6.8l1.5 3.2 3.5.4-2.6 2.4.7 3.5L12 14.6l-3.1 1.7.7-3.5L7 10.4l3.5-.4z" fill="#fff8d6"/></svg>',
 '<svg class="ci" viewBox="0 0 24 24"><defs><linearGradient id="cg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd84d"/><stop offset="1" stop-color="#e08e00"/></linearGradient></defs><circle cx="12" cy="12" r="10.5" fill="#b86a00"/><circle cx="12" cy="11.2" r="9.6" fill="url(#cg2)"/><circle cx="12" cy="11.2" r="6.6" fill="none" stroke="#b86a00" stroke-opacity=".45" stroke-width="1.4"/><ellipse cx="8.6" cy="7.4" rx="2.6" ry="1.4" fill="#fff" fill-opacity=".55" transform="rotate(-35 8.6 7.4)"/></svg>',
 '<svg class="ci" viewBox="0 0 24 24"><defs><linearGradient id="cg3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe066"/><stop offset="1" stop-color="#f29d00"/></linearGradient></defs><circle cx="12" cy="12" r="10.5" fill="url(#cg3)" stroke="#a35f00" stroke-width="1"/><text x="12" y="16.6" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-weight="900" font-size="12.5" fill="#8a4f00">F</text></svg>'];
const coinQ=+(new URLSearchParams(location.search).get('coin')||0);
const CI=()=>COINS[(coinQ||ST.coinS||1)-1]||COINS[0];
{const _h=hud;hud=function(){_h.apply(this,arguments);try{const hc=$('hc'),v=G&&G.coins;if(hc)hc.innerHTML=CI()+'<span>'+v+'</span>'}catch(e){}}}
{const _m=menuShow;menuShow=function(h){return _m.call(this,typeof h==='string'?h.split('🪙').join(CI()):h)}}
st.textContent+=`.ci{width:1.15em;height:1.15em;display:inline-block;vertical-align:-.2em;flex:none;filter:drop-shadow(0 1px 1px rgba(0,0,0,.2))}#hc{display:inline-flex;align-items:center;gap:5px}#hc[hidden]{display:none}`;
/* ---------- game Settings + picture guide ---------- */
Object.assign(T,{ok:['OK','حسنًا','Tole','Hagaag'],view:['View','زاوية الكاميرا','Mul\'ata','Muuqaal'],v_high:['High','عالية','Ol','Sare'],v_top:['Top','من فوق','Gubbaa','Kor'],v_classic:['Low','منخفضة','Gadi','Hoose'],set_t:['Game settings','إعدادات اللعبة','Qindaa\'ina taphaa','Dejinta ciyaarta'],snd_l:['Sound effects','المؤثرات الصوتية','Sagalee','Codadka'],vib_l:['Vibration','الاهتزاز','Raafama','Gariir'],
 on:['On','تشغيل','Banaa','Shidan'],off:['Off','إيقاف','Cufaa','Damsan'],g_t:['How it works','كيف تعمل','Akkamitti hojjeta','Sida ay u shaqeyso'],
 g_coin:['1 coin = 1 dhikr (in a Dhikr run)','عملة = ذكر واحد (في سباق الذكر)','Saantima 1 = zikrii 1','1 qadaadiic = 1 dhikri'],
 g_gift:['Gift: a surprise reward','هدية: مكافأة مفاجئة','Kennaa: badhaasa dinqisiisaa','Hadiyad: abaalmarin layaab ah'],
 g_mag:['Magnet: pulls coins to you','مغناطيس: يجذب العملات','Maagneetii: saantima harkisa','Birlab: qadaadiicda ayuu soo jiidaa'],
 g_sh:['Shield: blocks one hit','درع: يحميك من ضربة','Gaachana: rukuttaa tokko dhorka','Gaashaan: hal garaac ayuu celiyaa'],
 g_x2:['x2: double coins','x2: عملات مضاعفة','x2: saantima dachaa','x2: qadaadiic labanlaab'],
 g_bo:['Boost: super fast and safe','تسارع: سريع جدًا وآمن','Saffisa: baay\'ee ariifataa fi nagaa','Xawaare: aad u dhakhso badan oo ammaan ah'],
 g_combo:['10 coins in a row = combo up to x5. A hit resets it.','١٠ عملات متتالية = مضاعف حتى x5. الاصطدام يعيده.','Saantima 10 walitti aansee = combo hanga x5.','10 qadaadiic oo xiriir ah = combo ilaa x5.'],
 g_av:['Avoid','تجنّب','Irraa fagaadhu','Ka fogow'],
 g_jump:['Low barrier: jump','حاجز منخفض: اقفز','Daangaa gadi aanaa: utaali','Xayndaab hoose: bood'],
 g_duck:['High bar: duck','عارضة عالية: انخفض','Daangaa ol aanaa: gadi jedhi','Xayndaab sare: foorarso'],
 g_lane:['Big block: change lane','عائق كبير: غيّر المسار','Danqaraa guddaa: karaa jijjiiri','Xannibaad weyn: beddel waddada'],
 g_lose:['A hit slows you down. Free play: 3 hearts, lose all 3 = run over. Dhikr and To-do runs never end from a hit.','الاصطدام يبطئك. اللعب الحر: ٣ قلوب، إذا خسرتها تنتهي الجولة. سباق الذكر والمهام لا ينتهي بالاصطدام.','Rukuttaan si suuta godha. Tapha bilisaa: onnee 3; 3n yoo dhumte fiigichi xumurama. Fiigichi zikrii fi hojii rukuttaan hin xumuramu.','Garaacu wuu ku gaabiyaa. Ciyaar xor ah: 3 wadne; haddii 3da lumiso orodku wuu dhammaadaa. Orodka dhikriga iyo hawlaha garaac kuma dhammaado.'],
 g_time:['Time','الوقت','Yeroo','Waqtiga']});
const ic=(svg,bg)=>`<span class="gi" style="background:${bg}">${svg}</span>`;
const SV={coin:'<svg viewBox="0 0 24 24" width="26" height="26"><circle cx="12" cy="12" r="10" fill="#f5b301" stroke="#b86a00" stroke-width="1.2"/><path d="M12 6.5l1.6 3.4 3.7.4-2.8 2.5.8 3.7L12 14.6l-3.3 1.9.8-3.7-2.8-2.5 3.7-.4z" fill="#fff6c9"/></svg>',
 gift:'<svg viewBox="0 0 24 24" width="24" height="24"><rect x="3" y="9" width="18" height="12" rx="2" fill="#ec4899"/><rect x="2" y="6" width="20" height="5" rx="1.5" fill="#f472b6"/><rect x="10.5" y="6" width="3" height="15" fill="#fde047"/></svg>',
 mag:'<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M6 4v8a6 6 0 0 0 12 0V4"/></svg>',
 sh:'<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" fill="#fff"/></svg>',
 x2:'<b style="color:#fff;font:900 15px Inter">x2</b>',bo:'<svg viewBox="0 0 24 24" width="24" height="24"><path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" fill="#fff"/></svg>',
 jump:'<svg viewBox="0 0 30 24" width="30" height="24"><rect x="2" y="15" width="26" height="6" rx="1.5" fill="#ef4444"/><rect x="6" y="15" width="5" height="6" fill="#fff"/><rect x="16" y="15" width="5" height="6" fill="#fff"/><path d="M15 12V3M11 7l4-4 4 4" stroke="#0f172a" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>',
 duck:'<svg viewBox="0 0 30 24" width="30" height="24"><rect x="2" y="3" width="26" height="5" rx="1.5" fill="#f59e0b"/><path d="M15 11v10M11 17l4 4 4-4" stroke="#0f172a" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>',
 lane:'<svg viewBox="0 0 30 24" width="30" height="24"><rect x="3" y="5" width="12" height="15" rx="2" fill="#64748b"/><path d="M18 12h9M23 8l4 4-4 4" stroke="#0f172a" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>'};
function guideHTML(){const row=(i,t)=>`<div class="gr">${i}<span>${t}</span></div>`;return `<h1>${tl('g_t')}</h1><div class="gd">
 ${row(ic(CI().replace('class="ci"','class="ci" style="width:26px;height:26px"'),'#fff7d6'),tl('g_coin'))}${row(ic(SV.gift,'#fde7f3'),tl('g_gift'))}${row(ic(SV.mag,'#ef4444'),tl('g_mag'))}${row(ic(SV.sh,'#3b82f6'),tl('g_sh'))}${row(ic(SV.x2,'#f59e0b'),tl('g_x2'))}${row(ic(SV.bo,'#8b5cf6'),tl('g_bo'))}
 ${row(ic('<b style="color:#b45309;font:900 14px Inter">x5</b>','#fff7d6'),tl('g_combo'))}</div>
 <h2>${tl('g_av')}</h2><div class="gd">${row(ic(SV.jump,'#f1f5f9'),tl('g_jump'))}${row(ic(SV.duck,'#f1f5f9'),tl('g_duck'))}${row(ic(SV.lane,'#f1f5f9'),tl('g_lane'))}</div><p class="gl">${tl('g_lose')}</p>
 <h2>${tl('g_time')}</h2><p class="gl">⏱ ${tl('rule')}</p><button class="go" id="gOk">${tl('ok')}</button>`}
if(ST.vib===undefined)ST.vib=true;
try{if(navigator.vibrate){const _v=navigator.vibrate.bind(navigator);navigator.vibrate=p=>ST.vib===false?false:_v(p)}}catch(e){}
function setHTML(){const tg=(id,on)=>`<div class="tg"><button data-t="${id}" data-v="1" class="${on?'on':''}">${tl('on')}</button><button data-t="${id}" data-v="0" class="${on?'':'on'}">${tl('off')}</button></div>`;
 return `<h1>${tl('set_t')}</h1><div class="sr"><span>${tl('snd_l')}</span>${tg('snd',ST.snd)}</div><div class="sr"><span>${tl('vib_l')}</span>${tg('vib',ST.vib!==false)}</div><div class="sr"><span>${tl('view')}</span><div class="tg">${['high','top','classic'].map(v=>`<button data-vw="${v}" class="${(ST.view||'high')===v?'on':''}">${tl('v_'+v)}</button>`).join('')}</div></div>
 <button class="sec" id="sGd">${tl('g_t')}</button><button class="go" id="sOk">${tl('ok')}</button>`}
function sheet(html){if(state==='play')pause();const ctx=state==='pause'&&G?'pause':state;menuShow(html);
 return ()=>{if(ctx==='pause'){state='play';pause()}else if(ctx==='menu')showMenu();else menuHide()}}
function openGuide(){const close=sheet(guideHTML());$('gOk').onclick=close}
function openSet(){const close=sheet(setHTML());const m=$('menuS');
 m.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{ST[b.dataset.t]=b.dataset.v==='1';stSave();m.querySelectorAll(`[data-t="${b.dataset.t}"]`).forEach(x=>x.classList.toggle('on',x===b));try{const sl=$('snd');if(sl)sl.textContent=ST.snd?'🔈':'🔇'}catch(e){}});
 m.querySelectorAll('[data-vw]').forEach(b=>b.onclick=()=>{ST.view=b.dataset.vw;stSave();m.querySelectorAll('[data-vw]').forEach(x=>x.classList.toggle('on',x===b))});
 $('sGd').onclick=openGuide;$('sOk').onclick=close}
{const bar=document.querySelector('.bar');if(bar){const b=document.createElement('button');b.className='pill ib';b.id='gset';b.setAttribute('aria-label','Settings');b.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';b.onclick=()=>{if(state==='menu'||state==='play'||state==='pause')openSet()};$('snd').before(b)}}
function addHelp(){try{const how=document.querySelector('#menuS .how');if(how&&!$('hlp')){const b=document.createElement('button');b.id='hlp';b.className='sec';b.textContent='? '+tl('g_t');b.onclick=openGuide;how.after(b)}}catch(e){}}
st.textContent+=`.gd{display:flex;flex-direction:column;gap:6px}.gr{display:flex;align-items:center;gap:10px;font:700 .88rem/1.3 Inter,system-ui;color:#0f172a;text-align:start}.gi{flex:none;width:40px;height:40px;border-radius:12px;display:grid;place-items:center}
.gl{font-size:.84rem!important;text-align:start!important}.sr{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid #f1f5f9;font:700 .95rem Inter,system-ui;color:#0f172a}
.tg{display:flex;background:#f1f5f9;border-radius:12px;padding:3px;gap:3px}.tg button{border:0;background:none;border-radius:9px;min-height:36px;padding:0 12px;font:700 .85rem Inter,system-ui;color:#475569}.tg button.on{background:#0f172a;color:#fff}`;
/* menu: daily challenges under the options */
function addDC(){try{const o=$('opt');if(o&&!$('dcBox')){const d=document.createElement('div');d.id='dcBox';d.innerHTML=dcHTML();o.after(d)}}catch(e){}}
{const _sm=showMenu;showMenu=function(){const r=_sm.apply(this,arguments);mult.hidden=true;addDC();addCar();addHelp();return r}}addDC();addCar();addHelp();
})();
