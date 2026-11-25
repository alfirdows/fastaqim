/* Fastaqim "Today's cup" (25 Nov 2026): an original golden cup that fills with light as the day's worship and to-dos are done.
   - Fills: 5 salah (on time or made up), the 6 daily checklist items, and up to 3 to-dos done today. Excused salah are left out.
   - Untick anything and the light goes back down. A salah whose time has passed unmarked gently dims the light (no words, no guilt).
   - Every real tick sends a drop of light into the cup, with a tap of haptic. Half full: a glow. Full: a trophy celebration.
   - Tap the cup at the top of Home: today's cup, this week's cups, stars and days in a row.
   Drawn in code for Fastaqim (no images, no beings with souls, no music, no star shapes). (c) Fastaqim, all rights reserved. */
(function(){'use strict';
if(typeof S!=='object'||typeof CI==='undefined')return;
const X=(en,ar,om,so)=>L==='ar'?ar:(LI===0&&om)?om:(LI===1&&so)?so:en;
const N=n=>typeof AR==='function'?AR(n):n;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const hz=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
const LS='fq.cupFull',TD=3;

/* ---------- the day's numbers ---------- */
const PR=()=>SAL.filter(z=>z[0]!=='sunrise');
function cupT(dk){S.cupT=S.cupT||{};return S.cupT[dk]||[]}
function tasksDone(dk){return cupT(dk).filter(id=>S.starLog['task-'+id]).length}
function stat(dk,today){const sal=S.salah[dk]||{},o=(S.ci||{})[dk]||{},now=NOW(),P=PR(),sr=SAL.find(z=>z[0]==='sunrise');
 let sT=0,sD=0,miss=0;
 P.forEach((z,i)=>{const v=sal[z[0]];if(v==='exc')return;sT++;if(v)return void sD++;
  if(today){const e=i===0&&sr?sr[3]:(P[i+1]||[])[3];if(e&&at(e,now)<=now)miss++}});
 const cT=CI.length,cD=CI.filter(c=>o[c[0]]).length;
 const td=tasksDone(dk),tT=today?Math.min(TD,td+S.tasks.length):Math.min(TD,td),tD=Math.min(TD,td);
 const hb=(S.tl||{}).habits||{},hi=(hb.items||[]).filter(h=>h&&h.id!=null),hd=(hb.d||{})[dk]||{};let hT=hi.length,hD=0;
 hi.forEach(h=>{const v=hd[h.id];if(h.k==='stop'?v==='k':v===true)hD++;if(h.k==='stop'&&v==='s'&&today)miss++});
 const total=sT+cT+tT+hT,done=sD+cD+tD+hD;
 return{sT,sD,cT,cD,tT,tD,hT,hD,total,done,miss,lv:total?done/total:0}}
const dkOff=i=>{const x=NOW();x.setDate(x.getDate()-i);return dkey(x)};
function fullRun(){let n=stat(dkOff(0),true).lv>=1?1:0;for(let i=1;i<400;i++){const s=stat(dkOff(i),false);if(s.total&&s.lv>=1)n++;else break}return n}

/* ---------- the trophy (original drawing). It levels up with your last 7 days ---------- */
/* 1 Bronze · 2 Silver · 3 Gold (knop on the stem) · 4 Jewelled gold (emeralds, curled handles) · 5 Champion (rim pearls, moving shine, orbiting lights) */
const MET={1:['#7d4f2c','#e6b388','#b07445','#6a4123'],2:['#7f868e','#f7f9fb','#bcc2c9','#6f757d'],3:['#a77f3c','#ecd49a','#c39f5c','#8f6a30'],4:['#a47a34','#fff1c2','#d6ae5a','#8a6327'],5:['#a8803a','#fff5d1','#ddb862','#8a6327']};
const TIERS=[[0,'Bronze','برونزية','Naasii','Naxaas'],[.25,'Silver','فضية','Meetii','Fiddo'],[.45,'Gold','ذهبية','Warqee','Dahab'],[.65,'Jewelled gold','ذهبية مرصّعة','Warqee faayaa','Dahab la qurxiyey'],[.85,'Champion','كأس البطل','Injifataa','Horyaal']];
function week(){let a=0;for(let i=0;i<7;i++)a+=stat(dkOff(i),i===0).lv;return a/7}
function tierOf(w){let t=1;TIERS.forEach((x,i)=>{if(w>=x[0])t=i+1});return t}
const tierName=t=>{const x=TIERS[t-1];return X(x[1],x[2],x[3],x[4])};
let TIER=1;
let UID=0;
function cup(lv,o){o=o||{};const u='fqc'+(++UID),y=(26+(1-Math.max(0,Math.min(1,lv)))*64).toFixed(1),mini=o.mini,dim=Math.min(.5,(o.miss||0)*.13),t=o.tier||TIER,M=MET[t];
 const sw=mini?4.2:2.2,big=!mini;
 const wave=()=>{let d='M-60 0';for(let x=-60;x<180;x+=30)d+=' q7.5 -3.5 15 0 q7.5 3.5 15 0';return d+' V120 H-60Z'};
 const bub=mini||RM?'':[14,30,46,62,78,24,54].map((x,i)=>`<circle class="cb" cx="${30+x*.8}" cy="92" r="${1.1+(i%3)*.5}" style="animation-delay:${(i*.53).toFixed(2)}s;animation-duration:${(2.6+(i%4)*.6).toFixed(1)}s"/>`).join('');
 const hdl=t>=4?'M24 30C2 28 2 62 31 64M24 30C18 23 8 26 10.5 33M96 30C118 28 118 62 89 64M96 30C102 23 112 26 109.5 33':'M24 31C8 30 7 57 30 63M96 31C112 30 113 57 90 63';
 const gem=(cx,cy,r)=>`<path d="M${cx} ${cy-r}L${cx+r*.85} ${cy}L${cx} ${cy+r}L${cx-r*.85} ${cy}Z" fill="url(#${u}e)" stroke="#e9d39a" stroke-width="${mini?1.4:.8}"/>${mini?'':`<path d="M${cx} ${cy-r}L${cx+r*.3} ${cy}L${cx} ${cy+r*.35}" fill="#fff" opacity=".35"/>`}`;
 const shine=t>=5&&!RM;
 const metal=f=>`<path class="hd" d="${hdl}" fill="none" stroke="${f}" stroke-width="${mini?5:3.2}" stroke-linecap="round"/>`;
 const base=f=>`<path d="M54.5 91C56 100 56.5 106 52 114H68C63.5 106 64 100 65.5 91Z" fill="${f}"/><rect x="36" y="114" width="48" height="9" rx="3" fill="${f}"/><rect x="29" y="123" width="62" height="11" rx="3.5" fill="${f}"/>${t>=3?`<ellipse cx="60" cy="101" rx="${t>=4?8:6.5}" ry="3.4" fill="${f}"/>`:''}`;
 return `<span class="fqcup ft${t}${mini?' mini':''}${lv>=1?' full':''}" style="--lv:${lv.toFixed(3)};--dim:${dim.toFixed(2)}" role="img" aria-label="${esc(tierName(t))} · ${esc(X("Today's cup",'كأس اليوم',"Kubbaa har'aa",'Koobka maanta'))}: ${Math.round(lv*100)}%">
 <i class="halo"></i>${t>=5&&big?'<i class="halo h2"></i>':''}
 <svg viewBox="0 0 120 142" aria-hidden="true">
  <defs>
   <linearGradient id="${u}m" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${M[0]}"/><stop offset=".35" stop-color="${M[1]}"/><stop offset=".6" stop-color="${M[2]}"/><stop offset="1" stop-color="${M[3]}"/></linearGradient>
   <linearGradient id="${u}l" gradientUnits="userSpaceOnUse" x1="0" y1="-4" x2="0" y2="46"><stop offset="0" stop-color="#f7e5ad"/><stop offset=".12" stop-color="#e6c677"/><stop offset=".5" stop-color="#cc9e50"/><stop offset="1" stop-color="#ae8037"/></linearGradient>
   <linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffdf7"/><stop offset="1" stop-color="#f4ecdb"/></linearGradient>
   <linearGradient id="${u}e" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fc29a"/><stop offset=".45" stop-color="#2f7a4c"/><stop offset="1" stop-color="#174d2e"/></linearGradient>
   ${shine?`<linearGradient id="${u}s" x1="0" y1="0" x2="1" y2=".4"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".85"/><stop offset=".58" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0"/><animateTransform attributeName="gradientTransform" type="translate" values="-1.2 0;1.2 0;1.2 0" keyTimes="0;.55;1" dur="3.8s" repeatCount="indefinite"/></linearGradient>`:''}
   <clipPath id="${u}c"><path d="M25 22H95C95 61 82 84 60 87.5 38 84 25 61 25 22Z"/></clipPath>
  </defs>
  ${t>=5&&big&&!RM?`<g class="orb"><animateTransform attributeName="transform" type="rotate" from="0 60 58" to="360 60 58" dur="9s" repeatCount="indefinite"/><circle cx="60" cy="-6" r="2.4" fill="#f3d993"/><circle cx="118" cy="70" r="1.8" fill="#f7e5ad"/><circle cx="4" cy="84" r="2" fill="#e8c878"/></g>`:''}
  ${metal(`url(#${u}m)`)}${shine?metal(`url(#${u}s)`):''}
  <path class="gls" d="M22 19H98C98 63 84 88 60 91.5 36 88 22 63 22 19Z" fill="url(#${u}g)"/>
  <g clip-path="url(#${u}c)">
   <g class="lq" style="transform:translateY(${y}px)">
    <path class="w2" d="${wave(0)}" fill="#ecd08f" opacity=".55"/>
    <path class="w1" d="${wave(0)}" fill="url(#${u}l)"/>
    ${bub}
   </g>
   <rect class="dm" x="0" y="0" width="120" height="100" fill="#ebe6dc" style="opacity:${dim.toFixed(2)}"/>
   <path class="gl" d="M-40 100 L10 0 H28 L-22 100Z" fill="#fff" opacity="0"/>
  </g>
  <path d="M22 19H98C98 63 84 88 60 91.5 36 88 22 63 22 19Z" fill="none" stroke="url(#${u}m)" stroke-width="${sw}" stroke-linejoin="round"/>
  ${big?`<path d="M31 27C31 52 38 70 49 79" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".75"/><path d="M21 19.5H99" stroke="${t===2?'#f4f6f8':t===1?'#f1cfae':'#f6e7c1'}" stroke-width="1.2"/>`:''}
  ${t>=5&&big?[...Array(10)].map((_,k)=>`<circle cx="${(25+k*7.8).toFixed(1)}" cy="17.2" r="1.7" fill="#fff3cf" stroke="#c9a24f" stroke-width=".5"/>`).join(''):''}
  ${base(`url(#${u}m)`)}${shine?base(`url(#${u}s)`):''}
  ${big?`<rect x="40" y="126.5" width="40" height="4" rx="1.5" fill="#fff" opacity=".28"/>`:''}
  ${t>=4?gem(60,128.5,mini?6:4.6)+(big?gem(60,101,3)+gem(42,118.5,2.6)+gem(78,118.5,2.6):''):''}
 </svg></span>`}
function setLv(el,lv,miss){if(!el)return;const g=el.querySelector('.lq'),d=el.querySelector('.dm'),dim=Math.min(.5,(miss||0)*.13);
 el.style.setProperty('--lv',lv.toFixed(3));el.style.setProperty('--dim',dim.toFixed(2));el.classList.toggle('full',lv>=1);
 if(g)g.style.transform=`translateY(${(26+(1-Math.max(0,Math.min(1,lv)))*64).toFixed(1)}px)`;if(d)d.style.opacity=dim.toFixed(2);
 el.setAttribute('aria-label',X("Today's cup",'كأس اليوم',"Kubbaa har'aa",'Koobka maanta')+': '+Math.round(lv*100)+'%')}

/* ---------- where it lives: top of Home + the daily checklist card ---------- */
const toGo=(d,t)=>d>=t?X('All done','تمّ كله','Hundi xumurame','Dhammaan waa la dhammeeyey'):d?X(d+' done · '+(t-d)+' to go','تمّ '+N(d)+' · بقي '+N(t-d),d+' xumurame · '+(t-d)+' hafe',d+' la dhammeeyey · '+(t-d)+' ayaa haray'):X(t+' to do today','اليوم: '+N(t),"Har'a "+t,t+' maanta');
function paint(){const dk=dkey(NOW()),s=stat(dk,true);TIER=tierOf(week());
 const hs=$('hStars');if(hs){let c=hs.querySelector('.fqcup');const sv=hs.querySelector(':scope > svg');if(sv)sv.remove();
  if(c&&!c.classList.contains("ft"+TIER)){c.remove();c=null}if(!c){hs.insertAdjacentHTML('afterbegin',cup(s.lv,{mini:1,miss:s.miss}));c=hs.querySelector('.fqcup')}else setLv(c,s.lv,s.miss);
  hs.setAttribute('aria-label',X("Today's cup and stars",'كأس اليوم والنجوم',"Kubbaa har'aa fi urjiiwwan","Koobka maanta iyo xiddigaha"));
  hs.onclick=sheet}
 document.querySelectorAll('#ci .cir2 .st').forEach(e=>{for(const n of e.childNodes)if(n.nodeType===3&&n.nodeValue.includes('★'))n.nodeValue=n.nodeValue.replace(/\s*★\s*/,'')});
 const ci=$('ci');if(ci){const h=$('ciH');if(h){let c=h.querySelector('.fqcup');const a=h.querySelector(':scope > .fq-arc,:scope > .cir');
   if(a){a.remove();c=null}
   if(c&&!c.classList.contains("ft"+TIER)){c.remove();c=null}if(!c){h.insertAdjacentHTML('afterbegin',cup(s.lv,{miss:s.miss}));c=h.querySelector('.fqcup')}else setLv(c,s.lv,s.miss);
   const sm=h.querySelector('.cit small');if(sm)sm.textContent=toGo(s.done,s.total)}
  let r=$('cupTd');if(!r){const sr=ci.querySelector('.cis');if(sr){sr.insertAdjacentHTML('afterend',`<button class="cis cup-td" id="cupTd" data-tab="todo"><i class="fqi ph ph-check-square" aria-hidden="true"></i><span></span><em></em></button>`);r=$('cupTd')}}
  if(r){r.querySelector('span').textContent=X('To-dos today','مهام اليوم',"Hojiiwwan har'aa",'Hawlaha maanta');
   r.querySelector('em').innerHTML=s.tT?`<span class="cup-dots">${[...Array(s.tT)].map((_,i)=>`<i class="${i<s.tD?'on':''}"></i>`).join('')}</span>`:`<small>${esc(X('None yet','لا شيء بعد','Hin jiru','Weli ma jiro'))}</small>`}}
 return s}

/* ---------- a drop of light flies into the cup ---------- */
let PX=null;addEventListener('pointerdown',e=>{PX=[e.clientX,e.clientY]},true);
function vis(el){if(!el)return null;const r=el.getBoundingClientRect();return r.width&&r.bottom>8&&r.top<innerHeight-70?r:null}
function fly(){if(RM||!PX)return;const tg=[document.querySelector('#ciH .fqcup'),document.querySelector('#hStars .fqcup')].map(e=>[e,vis(e)]).find(x=>x[1]);if(!tg)return;
 const [el,r]=tg,tx=r.left+r.width/2,ty=r.top+r.height*.3,[sx,sy]=PX;if(Math.hypot(tx-sx,ty-sy)<30)return;
 for(let k=0;k<3;k++){const d=document.createElement('i');d.className='cupdrop';d.style.left=sx+'px';d.style.top=sy+'px';document.body.appendChild(d);
  const mx=(sx+tx)/2+(k-1)*28,my=Math.min(sy,ty)-60-k*14;
  const a=d.animate([{transform:'translate(-50%,-50%) scale(.4)',opacity:0},{transform:`translate(calc(${mx-sx}px - 50%),calc(${my-sy}px - 50%)) scale(1.1)`,opacity:1,offset:.45},{transform:`translate(calc(${tx-sx}px - 50%),calc(${ty-sy}px - 50%)) scale(.5)`,opacity:.9}],{duration:620+k*90,delay:k*70,easing:'cubic-bezier(.45,0,.3,1)',fill:'forwards'});
  a.onfinish=()=>{d.remove();if(k===0){el.classList.remove('gulp');void el.offsetWidth;el.classList.add('gulp')}}}}

/* ---------- hooks: every tick and untick repaints the cup ---------- */
const _st=window.star;if(typeof _st==='function')window.star=function(key,why){const r=_st.apply(this,arguments);
 if(r){if(/^task-/.test(key)){const dk=dkey(NOW());S.cupT=S.cupT||{};const a=S.cupT[dk]=S.cupT[dk]||[],id=+key.slice(5);if(!a.includes(id))a.push(id);trim();save()}
  const t=$('toast');if(t&&t.textContent.indexOf('★')>=0){t.innerHTML=`<span class="cup-tst">${cup(1,{mini:1})}</span>`+esc(t.textContent.replace('+1 ★ ','+1 · '))}
  setTimeout(sync,380)}
 return r};
function trim(){const ks=Object.keys(S.cupT||{}).sort();while(ks.length>40)delete S.cupT[ks.shift()]}
function wrap(o,n){const f=o[n];if(typeof f!=='function'||f.__cup)return;const w=function(){const r=f.apply(this,arguments);try{sync()}catch(e){console.warn(e)}return r};w.__cup=1;o[n]=w}
['renderStars','renderCI','renderSalah'].forEach(n=>wrap(window,n));['home','todo'].forEach(n=>wrap(R,n));

/* ---------- milestones ---------- */
let prev=null;
function sync(){const s=paint();const dk=dkey(NOW()),was=+localStorage.getItem('fq.cupTier')||0,up=prev!==null&&was&&TIER>was;
 localStorage.setItem('fq.cupTier',TIER);
 if(prev!==null&&s.lv>prev.lv&&prev.dk===dk){fly();
  if(s.lv>=1&&localStorage.getItem(LS)!==dk){localStorage.setItem(LS,dk);setTimeout(()=>celebrate('full',up?was:0),520);return void(prev={lv:s.lv,dk})}
  else if(!up&&prev.lv<.5&&s.lv>=.5&&s.lv<1)setTimeout(half,700)}
 if(up)setTimeout(()=>celebrate('up',was),700);
 prev={lv:s.lv,dk}}
document.addEventListener('click',()=>setTimeout(()=>{try{sync()}catch(e){}},350),true);
function half(){hz([18,40,18]);document.querySelectorAll('.fqcup').forEach(c=>{c.classList.remove('glow');void c.offsetWidth;c.classList.add('glow')});
 const t=$('toast');if(t){t.innerHTML=`<span class="cup-tst">${cup(.5,{mini:1})}</span>`+esc(X('Half your cup is full','امتلأ نصف كأسك',"Kubbaan kee walakkaan guutame",'Koobkaagu badh ayuu buuxsamay'));t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),2200)}}
window.ciAll=function(){const s=stat(dkey(NOW()),true);if(s.lv>=1||$('cupCel')&&$('cupCel').classList.contains('on'))return;celebrate('ci')};

/* ---------- the celebration ---------- */
function celebrate(kind,from){const s=stat(dkey(NOW()),true),full=kind==='full',upk=kind==='up',run=full?fullRun():0;
 let el=$('cupCel');if(!el){el=document.createElement('div');el.id='cupCel';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');document.body.appendChild(el)}
 el.innerHTML=`<button class="cupx" aria-label="${esc(X('Close','إغلاق','Cufi','Xir'))}"><i class="ph ph-x"></i></button>
 <div class="cupst"><i class="rg r1"></i><i class="rg r2"></i><i class="rg r3"></i><div class="cupbig">${cup(upk?1:full?Math.max(.55,(prev&&prev.lv)||.6):s.lv,{miss:full||upk?0:s.miss})}</div><i class="plinth"></i></div>
 ${from?`<p class="cupup">${esc(tierName(from))} <i class="ph ph-arrow-${L==='ar'?'left':'right'}"></i> <b>${esc(tierName(TIER))}</b></p>`:''}
 <h2>${upk?esc(X('Your trophy levelled up','ارتقت كأسك',"Kubbaan kee ol ka'e",'Koobkaagii wuu kor u kacay')):full?esc(X('Today’s cup is full','امتلأت كأس اليوم',"Kubbaan har'aa guutame",'Koobka maanta waa buuxsamay')):esc(X('Daily checklist complete','اكتملت قائمة اليوم',"Tarreen guyyaa xumurame",'Liiska maanta waa dhammaaday'))}</h2>
 <p class="cupm">${esc(X('MashaAllah','ما شاء الله','MashaAllah','MashaAllah'))}</p>
 <p class="cups">${upk?esc(X('Your steady salah, dhikr and good habits made it shine brighter.','صلاتك وذكرك وعاداتك الطيبة المستمرة جعلتها أكثر لمعانًا.','Salaata, zikrii fi amala gaarii itti fufte irraa kan ka ka\'e caalaatti calaqqisa.','Salaaddaada, dhikrigaaga iyo caadooyinkaaga wanaagsan ee joogtada ah ayaa ka dhigay mid dhalaalaya.')):full?esc(X('Every salah, dhikr and to-do for today is done.','أتممت صلوات اليوم وأذكاره ومهامه.',"Salaata, zikrii fi hojiiwwan har'aa hunda xumurte.",'Salaadda, dhikriga iyo hawlaha maanta oo dhan waad dhammeysay.')):esc(X('Your cup keeps filling with each salah and to-do.','تمتلئ كأسك مع كل صلاة ومهمة.','Kubbaan kee salaataa fi hojii hundaan guutama.','Koobkaagu wuxuu ku buuxsamayaa salaad iyo hawl kasta.'))}</p>
 ${run>1?`<p class="cupr"><span class="cup-dots big">${[...Array(Math.min(run,7))].map(()=>'<i class="on"></i>').join('')}</span>${esc(X(run+' full days in a row',N(run)+' أيام ممتلئة متتالية','Guyyoota guutuu '+run+' walitti aanan',run+' maalmood oo buuxa oo isku xiga'))}</p>`:''}
 ${full||upk?`<p class="cuph">${L==='ar'?'«أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ»':'“'+esc(X('The most beloved deeds to Allah are the most consistent, even if small.','','Hojiiwwan Rabbiin biratti jaallatamoon kanneen itti fufiinsaan hojjetamanidha, xiqqaatanis.','Camalka Alle ugu jecel waa kan joogtada ah, xitaa haddii uu yar yahay.'))+'”'}<a href="https://sunnah.com/bukhari:6464" target="_blank" rel="noopener">${esc(X('Sahih al-Bukhari 6464','صحيح البخاري ٦٤٦٤','Sahih al-Bukhari 6464','Sahih al-Bukhari 6464'))} ↗</a></p>`:''}
 <button class="cupgo">${esc(X('Continue','متابعة','Itti fufi','Sii wad'))}</button>`;
 const close=()=>{el.classList.remove('on');setTimeout(()=>{if(!el.classList.contains('on'))el.innerHTML=''},400)};
 el.querySelector('.cupx').onclick=close;el.querySelector('.cupgo').onclick=close;
 requestAnimationFrame(()=>{el.classList.add('on');if(full)setTimeout(()=>setLv(el.querySelector('.fqcup'),1,0),650);if(upk){const c=el.querySelector('.fqcup');c.classList.add('lvup')}});
 hz(full||upk?[30,60,30,60,30,60,90]:[25,50,25,50,40]);if(!RM)burst(el,full||upk)}
function burst(el,full){const st=el.querySelector('.cupst');const C=['#d9b86a','#c39f5c','#efd9a2','#b8955a','#2e6b32','#e2c98f','#a98042'];
 const n=full?60:30;for(let i=0;i<n;i++){const p=document.createElement('i');const rib=i%3===0;p.className=rib?'cr':'cd';
  if(rib){p.style.background=C[i%C.length];p.style.left=(8+Math.random()*84)+'%';p.style.setProperty('--r',(Math.random()*720-360)+'deg');p.style.setProperty('--x',(Math.random()*80-40)+'px');p.style.animationDelay=(.25+Math.random()*.9).toFixed(2)+'s';p.style.animationDuration=(2.2+Math.random()*1.6).toFixed(2)+'s';el.appendChild(p)}
  else{const a=Math.random()*Math.PI*2,d=70+Math.random()*120;p.style.setProperty('--x',Math.cos(a)*d+'px');p.style.setProperty('--y',(Math.sin(a)*d*.8-60)+'px');const z=4+Math.random()*7;p.style.width=p.style.height=z+'px';p.style.animationDelay=((i%2?.35:1.4)+Math.random()*.5).toFixed(2)+'s';st.appendChild(p)}}
 setTimeout(()=>el.querySelectorAll('.cr,.cd').forEach(p=>p.remove()),5200)}

/* ---------- the cup page: today, this week, stars ---------- */
function sheet(){const dk=dkey(NOW()),s=stat(dk,true),now=NOW();
 const row=(ic,t,d,tot)=>`<div class="cupln"><i class="ph ${ic}"></i><span><b>${esc(t)}</b><small>${esc(toGo(d,tot))}</small></span><em style="--p:${tot?Math.round(d/tot*100):0}%"></em></div>`;
 const wk=[...Array(7)].map((_,j)=>{const i=6-j,k=dkOff(i),x=new Date(now);x.setDate(x.getDate()-i);const st=stat(k,i===0);
  return `<div class="cupd${i===0?' now':''}">${cup(st.lv,{mini:1,miss:i===0?st.miss:0})}<small>${esc(x.toLocaleDateString(L==='ar'?'ar':'en',{weekday:'short'}))}</small></div>`}).join('');
 const run=fullRun(),days=typeof ciStreak==='function'?ciStreak():0;
 TIER=tierOf(week());const w=week(),nx=TIERS[TIER];
 const pips=TIERS.map((x,i)=>`<span class="${i<TIER?'on':''}${i===TIER-1?' cur':''}">${cup(1,{mini:1,tier:i+1})}<small>${esc(X(x[1],x[2],x[3],x[4]))}</small></span>`).join('');
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${esc(X("Today's cup",'كأس اليوم',"Kubbaa har'aa",'Koobka maanta'))}</h1>${XB}</div>
 <div class="cupsh"><p class="cuptier">${esc(tierName(TIER))}</p><div class="cupbig">${cup(s.lv,{miss:s.miss})}</div><p class="cupst2">${esc(toGo(s.done,s.total))}</p>
 <div class="cupls">${row('ph-sun-horizon',X('Salah','الصلاة','Salaata','Salaadda'),s.sD,s.sT)}${row('ph-list-checks',X('Daily checklist','قائمة اليوم','Tarree guyyaa','Liiska maanta'),s.cD,s.cT)}${s.tT?row('ph-check-square',X('To-dos (up to 3 a day)','المهام (حتى ٣ يوميًا)',"Hojiiwwan (guyyaatti hanga 3)",'Hawlaha (ilaa 3 maalintii)'),s.tD,s.tT):''}${s.hT?row('ph-plant',X('Habits: built and left','العادات: بناءً وتركًا','Amaloota: ijaaruu fi dhiisuu','Caadooyinka: dhisid iyo ka tagid'),s.hD,s.hT):''}</div>
 <h3 class="cuph3">${esc(X('Your trophy','كأسك','Kubbaa kee','Koobkaaga'))}</h3><div class="cuplv">${pips}</div>
 <div class="cupbar"><em style="--p:${Math.round(Math.min(1,nx?(w-TIERS[TIER-1][0])/(nx[0]-TIERS[TIER-1][0]):1)*100)}%"></em></div>
 <p class="cupnote" style="margin-top:8px">${nx?esc(X('Your last 7 days shape it. Keep going and it becomes '+nx[1]+'.','تتشكّل من آخر ٧ أيام. واصل لتصبح '+nx[2]+'.',"Guyyoota 7 darban irraa ijaarama. Itti fufi, "+nx[3]+" ta'a.",'Waxaa qaabeeya 7-dii maalmood ee la soo dhaafay. Sii wad, wuxuu noqonayaa '+nx[4]+'.')):esc(X('The highest level. MashaAllah, keep it shining.','أعلى مستوى. ما شاء الله، حافظ على لمعانها.',"Sadarkaa olaanaa. MashaAllah, akka calaqqisu eegi.",'Heerka ugu sarreeya. MashaAllah, ilaali dhalaalkiisa.'))}</p>
 <h3 class="cuph3">${esc(X('This week','هذا الأسبوع','Torban kana','Toddobaadkan'))}</h3><div class="cupwk">${wk}</div>
 <div class="cupft"><span><b>${N(S.stars)}</b><small>${esc(X('Stars earned','النجوم المكتسبة','Urjiiwwan argamte','Xiddigaha la helay'))}</small></span><span><b>${N(days)}</b><small>${esc(X('Days in a row','أيام متتالية','Guyyoota walitti aanan','Maalmo isku xiga'))}</small></span><span><b>${N(run)}</b><small>${esc(X('Full cups in a row','كؤوس ممتلئة متتالية','Kubbaa guutuu walitti aanan','Koob buuxa oo isku xiga'))}</small></span></div>
 <p class="cupnote">${esc(X('Each real tick fills it. Untick and it goes back down. Nothing is ever ticked for you.','كل علامة حقيقية تملؤها، والتراجع يُنقصها، ولا يُعلَّم شيء نيابةً عنك.','Mallattoon dhugaa hundi ni guuta. Yoo deebifte ni gadi bu\'a. Homtuu siif hin mallatteeffamu.','Calaamad kasta oo run ah ayaa buuxisa. Haddii aad ka noqoto way dhacdaa. Waxba laguuma calaamadeeyo.'))}</p></div>`)}

/* ---------- start ---------- */
try{sync()}catch(e){console.warn(e)}
setInterval(()=>{if(!document.hidden)try{sync()}catch(e){}},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)try{sync()}catch(e){}});
window.FQCUP={cup,stat,sync,celebrate,sheet};
})();
