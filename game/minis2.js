/* Fastaqim preview: 4 more games (Stack Tower, Block Breaker, Color Sort, Bubble Pop), light themes for every
   small game, and a short how-to card (what to do / what scores / what loses) for all 8 games.
   Original code and drawings; no outside art. Same time rules as the other games (free-play minutes, 15-min task break). */
(function(){if(!window.MINI||!MINI.api)return;window.FQNEXT=1;const A=MINI.api,cur=()=>MINI.cur;
const L4=a=>a[{en:0,ar:1,om:2,so:3}[LG]]||a[0];
Object.assign(T,{m_stack:['Stack Tower','برج التكديس','Masaraa Tuuluu','Munaaradda Isku-dul'],m_brick:['Block Breaker','كاسر الطوب','Cabsaa Bulookii','Jebiye Bulooga'],
 m_sort:['Color Sort','ترتيب الألوان','Halluu Qindeessi','Kala-sooc Midabada'],m_pop:['Bubble Pop','فقاعات','Bubbulii Dhoosi','Xumbo Qarxi'],
 th:['Theme','الطابع','Bifa','Muuqaal'],th_ice:['Ice','جليد','Cabbii','Baraf'],th_desert:['Desert','صحراء','Gammoojjii','Saxare'],th_candy:['Candy','حلوى','Mi\'aawaa','Nacnac'],th_sky:['Sky','سماء','Samii','Cir'],
 h_do:['How to play','طريقة اللعب','Akkaataa taphaa','Sida loo ciyaaro'],h_sc:['Points','النقاط','Qabxii','Dhibcaha'],h_lo:['You lose','تخسر','Ni moo\'amta','Waad guuldareysataa'],h_ok:['Got it','فهمت','Hubadheera','Waan fahmay'],
 lv:['Level','المستوى','Sadarkaa','Heer'],undo:['Undo','تراجع','Duubatti','Ka noqo'],tgt2:['Target','الهدف','Galma','Hadaf'],nice2:['Perfect!','ممتاز!','Baay\'ee gaarii!','Heer sare!']});
/* ---------- themes (light, calm) ---------- */
const THEMES={ice:{bg:'linear-gradient(#e0f2fe,#f8fafc)',ink:'#0c4a6e',acc:'#0ea5e9',pal:['#7dd3fc','#38bdf8','#93c5fd','#a5b4fc','#c4b5fd','#f0abfc','#fda4af']},
 desert:{bg:'linear-gradient(#fef3c7,#fffbeb)',ink:'#78350f',acc:'#d97706',pal:['#fbbf24','#f59e0b','#fb923c','#f87171','#fcd34d','#a3a3a3','#d6b98c']},
 candy:{bg:'linear-gradient(#fef3f2,#f3f0ff)',ink:'#3b2a6b',acc:'#8b5cf6',pal:['#f9a8d4','#f472b6','#c084fc','#a5b4fc','#fde68a','#86efac','#fca5a5']},
 sky:{bg:'linear-gradient(#dbeafe,#f5f3ff)',ink:'#1e3a8a',acc:'#6366f1',pal:['#93c5fd','#a5b4fc','#c4b5fd','#f9a8d4','#fde68a','#86efac','#67e8f9']}};
const TH=()=>THEMES[ST.theme]||THEMES.sky;
const css=document.createElement('style');css.textContent=`#mini.lt{color:var(--ink)}#mini.lt .mb button,#mini.lt .mb span:not(.sp){background:rgba(255,255,255,.85);color:var(--ink);border-color:rgba(15,23,42,.08);box-shadow:0 2px 8px -4px rgba(15,23,42,.3)}
#mini.lt .bar{background:rgba(15,23,42,.1)}#mini.lt .g2{background:rgba(15,23,42,.12)}#mini.lt .mc b{background:linear-gradient(145deg,var(--acc),color-mix(in srgb,var(--acc) 70%,#1e293b))}
#mini.lt .hint{background:rgba(255,255,255,.94);color:var(--ink);box-shadow:0 10px 30px -12px rgba(15,23,42,.35)}#mini.lt #mPo{background:rgba(15,23,42,.3)!important}#mini.lt .g2 .t{color:#0f172a}
#ruleL,.hwr span{text-wrap:balance}
.pill{background:rgba(255,255,255,.9)!important;color:#0f172a!important;border-color:rgba(15,23,42,.08)!important;box-shadow:0 4px 14px -6px rgba(15,23,42,.35)}.pill svg{color:#0f172a}#hearts{color:#ef4444!important}.mult{background:rgba(255,255,255,.92)!important;color:#b45309!important;border-color:rgba(15,23,42,.08)!important;box-shadow:0 4px 14px -6px rgba(15,23,42,.35)}.mult i{background:#f59e0b!important}
#mini .scn{position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden}#mini .scn svg{position:absolute;left:0;right:0;bottom:0;width:100%;height:34%}#mini>*:not(.scn):not(i):not(#hw):not(#mPo):not(.hint){position:relative;z-index:1}
#mini canvas{min-height:0;flex:1 1 0}#mini .dzp{text-align:center;padding:0 12px 4px;position:relative;z-index:2}#mini .dzp .bar{margin:0 0 6px}
.dza{font-family:"FQ","Scheherazade New",serif;font-size:24px;line-height:1.5;direction:rtl}#mini .dzp .dza{color:var(--ink,#0b5d4a)}
.dztl{font:700 13px/1.3 Inter,system-ui;opacity:.85}.dzm{font:600 12.5px/1.35 Inter,system-ui;opacity:.7;text-wrap:balance;max-width:320px;margin:2px auto 0}
.dzb{display:flex;gap:6px;justify-content:center;align-items:center;flex-wrap:wrap;margin-top:6px;pointer-events:auto}.dzb .dzn{font:800 13px Inter,system-ui;margin-inline-end:4px}
.dzb button{display:inline-flex;align-items:center;gap:4px;height:30px;padding:0 10px;border-radius:15px;border:1px solid rgba(15,23,42,.1);background:rgba(255,255,255,.9);color:#0f172a;font:700 12px Inter,system-ui;cursor:pointer}
.dzb button.on{background:#0f172a;color:#fff}.dzb [data-dz="x"].on{background:#e0f2fe;color:#0c4a6e;border-color:#bae6fd}
.goal .dztl{color:#334155}.goal .dzm{color:#475569}.goal>div{pointer-events:auto}
#mini .mb #mI{width:40px;padding:0;justify-content:center}.fqd2{margin-top:8px;font:600 .85rem Inter,system-ui;color:#475569}.fqd2 summary{cursor:pointer;padding:6px 0;text-align:center}
.fq span{font:600 .85rem/1.35 Inter,system-ui}
#hw{position:absolute;inset:0;z-index:6;background:rgba(15,23,42,.3);display:grid;place-items:center}#hw .sheet{max-width:340px;width:88%}
.hwr{display:flex;gap:10px;align-items:flex-start;text-align:start;padding:8px 0;border-bottom:1px solid #f1f5f9;font:600 .92rem/1.35 Inter,system-ui;color:#0f172a}.hwr i{font-style:normal;flex:none;width:34px;height:34px;border-radius:10px;display:grid;place-items:center;font-size:18px}
.hwr b{display:block;font:800 .72rem Inter,system-ui;text-transform:uppercase;letter-spacing:.05em;color:#64748b}[dir=rtl] .hwr b{letter-spacing:0}
.thg{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.thg button{border:2px solid #e2e8f0;border-radius:16px;padding:0;overflow:hidden;background:#fff;cursor:pointer}.thg button.on{border-color:#0f172a}
.thg i{display:block;height:64px}.thg span{display:block;padding:8px;font:800 .9rem Inter,system-ui;color:#0f172a}`;document.head.appendChild(css);
const PZ='<svg viewBox="0 0 24 24" width="16" height="16"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor"/></svg>';
MINI.col=c=>{const d=$('mini');if(!d||!d.classList.contains('lt'))return c;return {'#fff':TH().ink,'#fde047':'#d97706','#fca5a5':'#ef4444'}[c]||c};
/* ---------- own icon set for Memory Match (original SVG, no emoji) ---------- */
const SV=(b)=>`<svg viewBox="0 0 48 48" style="width:62%;height:62%">${b}</svg>`;
const ICO=[
 SV('<path d="M30 8a17 17 0 1 0 10 28A14 14 0 0 1 30 8z" fill="#f5b301"/>'),
 SV('<path d="M10 40V28a14 12 0 0 1 28 0v12z" fill="#38bdf8"/><path d="M24 8v8" stroke="#0369a1" stroke-width="3" stroke-linecap="round"/><rect x="6" y="38" width="36" height="5" rx="2" fill="#0369a1"/><path d="M20 40v-7a4 4 0 0 1 8 0v7z" fill="#e0f2fe"/>'),
 SV('<path d="M24 14c-5-4-12-5-18-4v26c6-1 13 0 18 4 5-4 12-5 18-4V10c-6-1-13 0-18 4z" fill="#fff" stroke="#16a34a" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 14v26" stroke="#16a34a" stroke-width="2.5"/>'),
 SV('<circle cx="24" cy="24" r="17" fill="#fff" stroke="#64748b" stroke-width="3"/><path d="M24 11l5 13-5 13-5-13z" fill="#ef4444"/><path d="M24 24l5 0-5 13-5-13z" fill="#94a3b8"/>'),
 SV('<path d="M14 10h20l8 10-18 20L6 20z" fill="#a78bfa"/><path d="M6 20h36M14 10l10 30 10-30" stroke="#ede9fe" stroke-width="2" fill="none"/>'),
 SV('<path d="M23 42c0-12 1-20 3-26" stroke="#92400e" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M26 16c-6-6-14-6-18-2 6-1 11 1 14 4zM26 16c4-8 12-10 17-7-6 0-11 3-13 7zM26 16c-2-7 0-12 4-14-1 5-1 9-2 14z" fill="#22c55e"/>'),
 SV('<path d="M24 5v6" stroke="#b45309" stroke-width="3" stroke-linecap="round"/><path d="M16 14h16l3 6v14l-3 6H16l-3-6V20z" fill="#fbbf24"/><path d="M19 20h10v14H19z" fill="#fff7d6"/><path d="M13 20h22M13 34h22" stroke="#b45309" stroke-width="2.5"/>'),
 SV('<path d="M24 6c7 10 12 16 12 23a12 12 0 0 1-24 0c0-7 5-13 12-23z" fill="#3b82f6"/><path d="M18 30a6 6 0 0 0 5 6" stroke="#dbeafe" stroke-width="3" fill="none" stroke-linecap="round"/>'),
 SV('<circle cx="24" cy="24" r="9" fill="#f59e0b"/><g stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round"><path d="M24 5v5M24 38v5M5 24h5M38 24h5M10.5 10.5l3.5 3.5M34 34l3.5 3.5M37.5 10.5L34 14M14 34l-3.5 3.5"/></g>'),
 SV('<path d="M4 40l14-24 8 12 5-7 13 19z" fill="#64748b"/><path d="M18 16l5 8-5-2-4 3z" fill="#fff"/>'),
 SV('<path d="M10 38C10 20 22 8 40 8c0 18-12 30-30 30z" fill="#4ade80"/><path d="M10 38L30 18" stroke="#166534" stroke-width="2.5" stroke-linecap="round"/>'),
 SV('<rect x="8" y="20" width="32" height="20" rx="3" fill="#f472b6"/><rect x="6" y="14" width="36" height="8" rx="2" fill="#ec4899"/><path d="M24 14v26" stroke="#fde68a" stroke-width="5"/><path d="M24 14c-4-7-12-6-10-1 1 2 6 2 10 1zM24 14c4-7 12-6 10-1-1 2-6 2-10 1z" fill="#fbbf24"/>')];
MINI.icons=()=>ICO.slice();
/* ---------- world scenery behind every small game ---------- */
const SC={
 ice:`<svg viewBox="0 0 400 200" preserveAspectRatio="none"><path d="M0 120 60 70 110 110 170 40 240 115 300 60 400 120V200H0z" fill="#e0f2fe"/><path d="M170 40l-18 26 18-6 16 8zM60 70l-12 16 12-4 10 6zM300 60l-14 20 14-5 12 7z" fill="#fff"/><path d="M0 150q100-20 200 0t200 0V200H0z" fill="#f0f9ff"/></svg>`,
 desert:`<svg viewBox="0 0 400 200" preserveAspectRatio="none"><path d="M0 130q80-50 170 0t230-10V200H0z" fill="#fcd9a0"/><path d="M0 165q120-35 240 0t160-5V200H0z" fill="#f8c77e"/></svg>`,
 candy:`<svg viewBox="0 0 400 200" preserveAspectRatio="none"><path d="M0 140q50-30 100 0t100 0 100 0 100 0V200H0z" fill="#ede9fe"/><path d="M0 165q50-25 100 0t100 0 100 0 100 0V200H0z" fill="#fde2e4"/></svg>`,
 sky:`<svg viewBox="0 0 400 200" preserveAspectRatio="none"><g fill="#fff"><ellipse cx="90" cy="150" rx="70" ry="22"/><ellipse cx="130" cy="138" rx="40" ry="22"/><ellipse cx="300" cy="160" rx="90" ry="24"/><ellipse cx="270" cy="146" rx="40" ry="20"/><ellipse cx="0" cy="185" rx="120" ry="30"/><ellipse cx="400" cy="190" rx="120" ry="30"/><ellipse cx="200" cy="195" rx="120" ry="25"/></g></svg>`};
const PT={ice:['#ffffff',1,3],desert:['#f59e0b',.5,2],candy:['#f9a8d4',.6,5],sky:['#ffffff',.8,0]};
function scenery(d){if(d.querySelector('.scn'))return;const k=ST.theme||'sky',sc=document.createElement('div');sc.className='scn';
 sc.innerHTML=(k==='desert'?'<b style="position:absolute;right:12%;bottom:27%;width:64px;height:64px;border-radius:50%;background:radial-gradient(#fef3c7,#fde68a 60%,rgba(253,230,138,0) 72%)"></b>':'')+(SC[k]||SC.sky);d.prepend(sc);const [col,op,sz]=PT[k]||PT.sky;if(!sz)return;
 for(let i=0;i<18;i++){const e=document.createElement('i');const x=Math.random()*100,du=7+Math.random()*7,s=sz*(.6+Math.random()*.8);
  e.style.cssText=`position:absolute;left:${x}%;top:-10px;width:${s}px;height:${s}px;border-radius:50%;background:${col};opacity:${op};pointer-events:none;box-shadow:0 0 0 1px rgba(15,23,42,.04)`;sc.appendChild(e);
  e.animate([{transform:'translate(0,0)'},{transform:`translate(${(Math.random()-.5)*60}px,${innerHeight+20}px)`}],{duration:du*1000,iterations:Infinity,delay:-Math.random()*du*1000})}}

function fitBoards(){const d=$('mini');if(!d)return;const H=d.clientHeight;const g=d.querySelector('#mG');if(g&&g.children.length){const cols=getComputedStyle(g).gridTemplateColumns.split(' ').length,rows=Math.ceil(g.children.length/cols),top=g.getBoundingClientRect().top-d.getBoundingClientRect().top,gap=parseFloat(getComputedStyle(g).rowGap)||8,ch=(H-top-16-gap*(rows-1))/rows;g.style.maxWidth=Math.max(160,ch*.75*cols+gap*(cols-1))+'px';g.style.marginInline='auto'}
 const b=d.querySelector('.g2');if(b){const top=b.parentElement.getBoundingClientRect().top-d.getBoundingClientRect().top;b.style.width='min(100%,400px,'+Math.max(200,H-top-24)+'px)'}}
addEventListener('resize',fitBoards);setInterval(fitBoards,600);
function applyTheme(){const d=$('mini');if(!d)return;const pz=d.querySelector('#mPz');if(pz)pz.innerHTML=PZ;const bk=d.querySelector('#mX');if(bk)bk.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';const t=TH();d.classList.add('lt');d.style.background=t.bg;scenery(d);d.style.setProperty('--ink',t.ink);d.style.setProperty('--acc',t.acc)}
MINI.onStart=()=>{setTimeout(()=>{applyTheme();dzPanel();miniInfo();howCard(cur()&&cur().kind,true)},0)};
let _lastS=0;MINI.onScore=n=>{const m=cur();if(!m){return}if(m.mode==='dhikr'&&(m.kind==='match'||m.kind==='merge')&&n>(m._ls||0)){m._ls=n;dhikrStep(m,1)}else m._ls=n};
/* ---------- how to play: what to do / what scores / what loses ---------- */
const HOW={
 run:[['Swipe to move. Up = jump. Down = duck.','اسحب للتحرك. للأعلى = قفز. للأسفل = انخفاض.','Sochuuf harkisi. Ol = utaali. Gadi = gadi jedhi.','Jiid si aad u dhaqaaqdo. Kor = bood. Hoos = foorarso.'],
  ['Each coin = 1 point. In Dhikr: each coin = 1 dhikr.','كل عملة = نقطة. في الذكر: كل عملة = ذكر.','Saantima tokko = qabxii 1. Zikrii keessatti: saantima 1 = zikrii 1.','Qadaadiic kasta = 1 dhibic. Dhikriga: qadaadiic = 1 dhikri.'],
  ['Free play: a crash takes a heart. 3 hearts.','اللعب الحر: الاصطدام يأخذ قلبًا. ٣ قلوب.','Tapha bilisaa: rukuttaan onnee 1 fudhata. Onnee 3.','Ciyaar xor ah: shilku wadne ayuu qaadaa. 3 wadne.']],
 catch:[['Drag to move the tray.','اسحب لتحريك الصينية.','Saanii sochoosuuf harkisi.','Jiid si aad u dhaqaajiso saxanka.'],
  ['Coin = 1. Gem = 5. In Dhikr: each catch = 1 dhikr.','عملة = ١. جوهرة = ٥. في الذكر: كل التقاط = ذكر.','Saantima = 1. Dhagaa = 5. Zikrii keessatti: qabannaan 1 = zikrii 1.','Qadaadiic = 1. Dhagax = 5. Dhikriga: qabasho kasta = 1 dhikri.'],
  ['Free play: a grey rock takes a heart. 3 hearts.','اللعب الحر: الصخرة الرمادية تأخذ قلبًا. ٣ قلوب.','Tapha bilisaa: dhagaan daalachaa onnee 1 fudhata.','Ciyaar xor ah: dhagaxa cawlka ah wadne ayuu qaadaa.']],
 stack:[['Tap to drop the block on the tower.','اضغط لإسقاط القطعة على البرج.','Bulookii masaraa irra buusuuf tuqi.','Taabo si aad bulooga u dhigto.'],
  ['Each floor = 1 point. Perfect drop = +3. In Dhikr: each floor = 1 dhikr.','كل طابق = نقطة. إسقاط مثالي = +٣. في الذكر: كل طابق = ذكر.','Darbii tokko = qabxii 1. Zikrii keessatti: darbii 1 = zikrii 1.','Dabaq kasta = 1 dhibic. Dhikriga: dabaq kasta = 1 dhikri.'],
  ['Free play: miss the tower and the game ends.','اللعب الحر: إذا أخطأت البرج تنتهي اللعبة.','Tapha bilisaa: masaraa yoo dhabde xumurama.','Ciyaar xor ah: haddii aad seegto way dhammaataa.']],
 brick:[['Drag the paddle. Bounce the ball into the blocks.','اسحب المضرب. ارتد الكرة إلى الطوب.','Saanii harkisi. Kubbaa bulookiitti darbi.','Jiid usha. Kubbadda ku tuur bulooga.'],
  ['Each block = 1 point. In Dhikr: each block = 1 dhikr.','كل طوبة = نقطة. في الذكر: كل طوبة = ذكر.','Bulookii 1 = qabxii 1. Zikrii keessatti: bulookii 1 = zikrii 1.','Bulooq kasta = 1 dhibic. Dhikriga: bulooq = 1 dhikri.'],
  ['Free play: a missed ball takes a heart. 3 hearts.','اللعب الحر: الكرة الضائعة تأخذ قلبًا. ٣ قلوب.','Tapha bilisaa: kubbaan bade onnee 1 fudhata.','Ciyaar xor ah: kubbad lumay wadne ayay qaadaa.']],
 match:[['Flip two cards. Find the pairs.','اقلب بطاقتين. اعثر على الأزواج.','Kaardii lama garagalchi. Lameen barbaadi.','Rogo laba kaar. Hel lammaanaha.'],
  ['Each pair = 10 points. In Dhikr: each pair = 1 dhikr.','كل زوج = ١٠ نقاط. في الذكر: كل زوج = ذكر.','Lameen 1 = qabxii 10. Zikrii keessatti: lameen 1 = zikrii 1.','Lammaane kasta = 10 dhibic. Dhikriga: lammaane = 1 dhikri.'],
  ['You cannot lose.','لا تخسر أبدًا.','Hin moo\'amtu.','Ma guuldareysan kartid.']],
 sort:[['Tap a tube, then another, to move the top ball.','اضغط أنبوبًا ثم آخر لنقل الكرة العلوية.','Ujummoo tokko, achii kan biraa tuqi.','Taabo tuubo, kadib mid kale.'],
  ['One color per tube = level done. In Dhikr: each move = 1 dhikr.','لون واحد في كل أنبوب = مستوى. في الذكر: كل نقلة = ذكر.','Ujummoo 1 halluu 1 = sadarkaa. Zikrii: sochii 1 = zikrii 1.','Midab kasta tuubo = heer. Dhikriga: dhaqaaq = 1 dhikri.'],
  ['You cannot lose. Stuck? Tap Undo.','لا تخسر. علقت؟ اضغط تراجع.','Hin moo\'amtu. Yoo dhaabatte Duubatti tuqi.','Ma guuldareysan. Haddii aad xanibanto taabo Ka noqo.']],
 merge:[['Swipe. Same numbers join.','اسحب. الأرقام المتساوية تندمج.','Harkisi. Lakkoofsi walfakkaatu walitti makama.','Jiid. Tirooyinka isku midka ah way isku darmaan.'],
  ['Each join adds points. In Dhikr: each join = 1 dhikr.','كل دمج يضيف نقاطًا. في الذكر: كل دمج = ذكر.','Makiinsi hundi qabxii dabala. Zikrii: makiinsa 1 = zikrii 1.','Isku-dar kasta dhibco ayuu daraa. Dhikriga: isku-dar = 1 dhikri.'],
  ['Board full and no moves = game over.','امتلأت اللوحة ولا حركات = انتهت اللعبة.','Gabateen guuttee sochiin hin jiru = xumura.','Looxu buuxo oo dhaqdhaqaaq la\'aan = dhammaad.']],
 pop:[['Tap 2 or more same-color bubbles that touch.','اضغط فقاعتين أو أكثر متلاصقة من نفس اللون.','Bubbulii 2+ halluu tokko walqunnaman tuqi.','Taabo 2+ xumbo oo isku midab ah oo taabanaya.'],
  ['Bigger groups = more points. In Dhikr: each pop = 1 dhikr.','مجموعات أكبر = نقاط أكثر. في الذكر: كل فقعة = ذكر.','Gareen guddaan qabxii guddaa. Zikrii: dhoosa 1 = zikrii 1.','Koox weyn = dhibco badan. Dhikriga: qarxin = 1 dhikri.'],
  ['Free play: no groups left under the target = game over.','اللعب الحر: لا مجموعات تحت الهدف = انتهت اللعبة.','Tapha bilisaa: gareen hin hafne galma gaditti = xumura.','Ciyaar xor ah: koox la\'aan hadafka hoostiisa = dhammaad.']]};
function howHTML(k){const h=HOW[k]||HOW.run,ic=['<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="4" fill="#0284c7"/><circle cx="12" cy="12" r="8.5" fill="none" stroke="#0284c7" stroke-width="2" opacity=".45"/></svg>','<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="10" fill="#f5b301" stroke="#a35f00"/><path d="M12 6.8l1.5 3.2 3.5.4-2.6 2.4.7 3.5L12 14.6l-3.1 1.7.7-3.5L7 10.4l3.5-.4z" fill="#fff8d6"/></svg>','<svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 6l12 12M18 6L6 18" stroke="#dc2626" stroke-width="3" stroke-linecap="round"/></svg>'],bg=['#e0f2fe','#fef9c3','#fee2e2'],lab=['h_do','h_sc','h_lo'];
 return h.map((r,i)=>`<div class="hwr"><i style="background:${bg[i]}">${ic[i]}</i><div><b>${tl(lab[i])}</b>${L4(r).replace(/([.!؟])\s+/g,'$1\n').split('\n').map(q=>`<span style="display:block">${q}</span>`).join('')}</div></div>`).join('')}
function howCard(k,auto){const seen=JSON.parse(localStorage.getItem('fastaqim.howseen')||'{}');if(auto&&seen[k])return;const d=$('mini');if(!d||!cur())return;cur().paused=true;
 const o=document.createElement('div');o.id='hw';o.innerHTML=`<div class="sheet"><h1 style="font-size:1.25rem">${tl('m_'+k)}</h1>${howHTML(k)}<button class="go" id="hwOk">${tl('h_ok')}</button></div>`;d.appendChild(o);
 o.querySelector('#hwOk').onclick=()=>{seen[k]=1;localStorage.setItem('fastaqim.howseen',JSON.stringify(seen));o.remove();if(cur())cur().paused=false}}
/* ---------- canvas + loop helpers ---------- */
function canvasIn(d){const cv=document.createElement('canvas');cv.style.cssText='max-width:600px;margin:0 auto';d.appendChild(cv);const x=cv.getContext('2d'),o={cv,x,W:0,H:0,DPR:Math.min(2,devicePixelRatio||1)};
 o.rs=()=>{const r=cv.getBoundingClientRect();o.W=r.width;o.H=r.height;cv.width=o.W*o.DPR;cv.height=o.H*o.DPR;x.setTransform(o.DPR,0,0,o.DPR,0,0)};o.rs();addEventListener('resize',o.rs);cur().off=()=>removeEventListener('resize',o.rs);return o}
function onKey(fn){const m=cur(),h=e=>{if(cur()!==m||m.paused||document.getElementById('hw'))return;if(fn(e.key)!==false)e.preventDefault()};addEventListener('keydown',h);const o=m.off;m.off=()=>{removeEventListener('keydown',h);if(o)o()}}
function run(fn){let l=performance.now();const f=now=>{const m=cur();if(!m)return;if(m.paused){l=now;m.raf=requestAnimationFrame(f);return}const dt=Math.min(.05,(now-l)/1000);l=now;A.tick(dt);if(!cur())return;A.setTime();fn(dt);if(cur())cur().raf=requestAnimationFrame(f)};cur().raf=requestAnimationFrame(f)}
const rr=(x,X,Y,w,h,r)=>{x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()};
const shade=(c,f)=>{const n=parseInt(c.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const t=f<0?0:255,p=Math.abs(f);r=Math.round((t-r)*p+r);g=Math.round((t-g)*p+g);b=Math.round((t-b)*p+b);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)};
function sparks(P,x0,y0,col,n){for(let i=0;i<n;i++){const a=Math.random()*7,s=60+Math.random()*170;P.push({x:x0,y:y0,vx:Math.cos(a)*s,vy:Math.sin(a)*s-70,l:.6,c:col})}}
function drawParts(x,P,dt){for(const p of P){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=520*dt;p.l-=dt;x.globalAlpha=Math.max(0,p.l/.6);x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,3,0,7);x.fill()}x.globalAlpha=1;return P.filter(p=>p.l>0)}
function floatTxt(x,F,dt,ink){for(const f of F){f.y-=46*dt;f.l-=dt*1.1;x.globalAlpha=Math.max(0,f.l);x.textAlign='center';x.font=f.ar?'26px FQ,"Scheherazade New",serif':'900 22px Inter,system-ui';const hw=x.measureText(f.t).width/2+6,W0=x.canvas.width/(devicePixelRatio>2?2:(devicePixelRatio||1));f.x=Math.max(hw,Math.min(W0-hw,f.x));x.lineWidth=4;x.strokeStyle='rgba(255,255,255,.9)';x.strokeText(f.t,f.x,f.y);x.fillStyle=f.c||ink;x.fillText(f.t,f.x,f.y)}x.globalAlpha=1;return F.filter(f=>f.l>0)}
const dzTop=()=>{const z=DZ[ST.dz||0];return `<div class="bar"><i id="mP"></i></div><div style="text-align:center;margin-top:6px;font-size:22px" class="ar">${z.ar}</div>`};
function dhikrStep(m,n){m.count=(m.count||0)+n;const tg=ST.tgt||33,p=$('mP');if(p)p.style.width=Math.min(100,m.count/tg*100)+'%';if(m.count>=tg&&!m.won){m.won=1;m.coins=Math.round(m.count/3)+20;A.MCONF(80);vib([20,40,20,40,20]);setTimeout(()=>MINI.end(false),900);return true}return false}
/* ---------- 1) Stack Tower ---------- */
MINI.games.stack=function(){const m=cur(),dk=m.mode==='dhikr',t=TH(),d=A.shell(dk?dzTop():''),c=canvasIn(d),x=c.x;let P=[],F=[],fall=[];
 const BH=26,base={x:0,w:0};let tower=[],mv=null,camY=0,dir=1,speed=170,perfect=0,over=false;
 function init(){const w=Math.min(220,c.W*.6);tower=[{x:(c.W-w)/2,w,c:t.pal[0]}];next()}
 function next(){const top=tower[tower.length-1],w=top.w;speed=Math.min(420,170+tower.length*7);dir=tower.length%2?1:-1;mv={x:dir>0?-w:c.W,w,c:t.pal[tower.length%t.pal.length]}}
 function drop(){if(!mv||over||m.paused)return;const top=tower[tower.length-1],l=Math.max(mv.x,top.x),r=Math.min(mv.x+mv.w,top.x+top.w),ov=r-l;const yTop=c.H-120-tower.length*BH+camY;
  if(ov<=0){vib([30,40,30]);fall.push({x:mv.x,w:mv.w,y:yTop,vy:0,c:mv.c});if(dk){F.push({t:'✕',x:c.W/2,y:yTop-20,l:1,c:'#ef4444'});perfect=0;next();return}over=true;m.coins=Math.round(m.score/2);setTimeout(()=>MINI.end(false),900);return}
  let nb;if(dk){nb={x:top.x,w:top.w,c:mv.c};m.score+=1;sparks(P,c.W/2,yTop,t.acc,8);vib(8)}else if(Math.abs(mv.x-top.x)<5){nb={x:Math.max(4,top.x-3),w:Math.min(top.w+6,c.W*.7),c:mv.c};perfect++;m.score+=3;F.push({t:tl('nice2')+' +3',x:c.W/2,y:yTop-24,l:1.2,c:t.acc});sparks(P,c.W/2,yTop,t.acc,18);vib([10,20,10])}
  else{nb={x:l,w:ov,c:mv.c};const cut=mv.w-ov;fall.push({x:mv.x<top.x?mv.x:r,w:cut,y:yTop,vy:0,c:mv.c});perfect=0;m.score+=1;vib(8)}
  tower.push(nb);A.setScore(m.score);try{SFX.plip()}catch(e){}if(dk){F.push({t:DZ[ST.dz||0].ar,x:c.W/2,y:yTop-40,l:1,ar:1});if(dhikrStep(m,1))return}next()}
 c.cv.addEventListener('pointerdown',e=>{e.preventDefault();drop()});init();onKey(k=>{if(k===' '||k==='Enter'||k==='ArrowDown')drop();else return false});m._t={get gap(){return mv?mv.x-tower[tower.length-1].x:99},drop};A.hintBox(d,'mi_hint_s');
 run(dt=>{const W=c.W,H=c.H;if(mv&&!over){mv.x+=dir*speed*dt;if(mv.x+mv.w>W+10){mv.x=W+10-mv.w;dir=-1}if(mv.x<-10){mv.x=-10;dir=1}}
  const want=Math.max(0,tower.length*BH-(H*.45));camY+=(want-camY)*Math.min(1,dt*5);
  x.clearRect(0,0,W,H);const box=(X,Y,w,col)=>{const dz=12;x.fillStyle=shade(col,-.18);x.beginPath();x.moveTo(X+w,Y);x.lineTo(X+w+dz,Y-dz);x.lineTo(X+w+dz,Y-dz+BH);x.lineTo(X+w,Y+BH);x.fill();
   x.fillStyle=shade(col,.25);x.beginPath();x.moveTo(X,Y);x.lineTo(X+dz,Y-dz);x.lineTo(X+w+dz,Y-dz);x.lineTo(X+w,Y);x.fill();x.fillStyle=col;x.fillRect(X,Y,w,BH)};
  x.fillStyle='rgba(15,23,42,.08)';x.fillRect(0,H-120+BH+camY,W,H);
  tower.forEach((b,i)=>{const Y=H-120-i*BH+camY;if(Y<H+40&&Y>-60)box(b.x,Y,b.w,b.c)});
  if(mv&&!over)box(mv.x,H-120-tower.length*BH+camY,mv.w,mv.c);
  for(const f of fall){f.vy+=900*dt;f.y+=f.vy*dt;box(f.x,f.y,f.w,f.c)}fall=fall.filter(f=>f.y<H+80);
  P=drawParts(x,P,dt);F=floatTxt(x,F,dt,t.ink);
  x.fillStyle=t.ink;x.globalAlpha=.85;x.font='900 44px Inter,system-ui';x.textAlign='center';x.fillText(String(tower.length-1),W/2,dk?40:60);x.globalAlpha=1;if(!dk)m.coins=Math.round(m.score/2)})}
/* ---------- 2) Block Breaker ---------- */
MINI.games.brick=function(){const m=cur(),dk=m.mode==='dhikr',t=TH(),d=A.shell(dk?dzTop():''),c=canvasIn(d),x=c.x;let P=[],F=[];
 let lvl=1,lives=3,bricks=[],ball,pad={x:0,w:96},tx=0,launched=false,shake=0;
 function layout(){const cols=7,rows=Math.min(3+lvl,8),gap=6,bw=(c.W-24-gap*(cols-1))/cols;bricks=[];for(let r=0;r<rows;r++)for(let k=0;k<cols;k++)bricks.push({x:12+k*(bw+gap),y:16+r*24,w:bw,h:18,hp:r<2&&lvl>1?2:1,c:t.pal[(r+lvl)%t.pal.length]})}
 function reset(){pad.x=c.W/2;tx=pad.x;ball={x:pad.x,y:c.H-80,vx:0,vy:0,r:8};launched=false}
 function launch(){if(launched)return;launched=true;const s=(300+lvl*25)*({slow:.85,normal:1,fast:1.2}[ST.spd]||1);ball.vx=s*.45*(Math.random()<.5?-1:1);ball.vy=-s}
 const mvP=e=>{const r=c.cv.getBoundingClientRect();tx=(e.touches?e.touches[0].clientX:e.clientX)-r.left;if(e.cancelable)e.preventDefault()};
 c.cv.addEventListener('pointermove',mvP);c.cv.addEventListener('pointerdown',e=>{mvP(e);launch()});c.cv.addEventListener('touchmove',mvP,{passive:false});
 layout();reset();A.hintBox(d,'mi_hint_b');m._t={get bricks(){return bricks},get ball(){return ball}};let kx=0;onKey(k=>{if(k==='ArrowLeft')tx=Math.max(0,tx-c.W*.12);else if(k==='ArrowRight')tx=Math.min(c.W,tx+c.W*.12);else if(k===' '||k==='ArrowUp')launch();else return false});
 run(dt=>{const W=c.W,H=c.H,py=H-56;pad.w=Math.min(110,W*.26);pad.x+=(tx-pad.x)*Math.min(1,dt*16);pad.x=Math.max(pad.w/2,Math.min(W-pad.w/2,pad.x));
  if(!launched){ball.x=pad.x;ball.y=py-ball.r-2}else{const n=Math.ceil(Math.hypot(ball.vx,ball.vy)*dt/6);for(let s=0;s<n;s++){const sd=dt/n;ball.x+=ball.vx*sd;ball.y+=ball.vy*sd;
   if(ball.x<ball.r){ball.x=ball.r;ball.vx*=-1}if(ball.x>W-ball.r){ball.x=W-ball.r;ball.vx*=-1}if(ball.y<ball.r){ball.y=ball.r;ball.vy*=-1}
   if(ball.vy>0&&ball.y+ball.r>=py&&ball.y<py+14&&Math.abs(ball.x-pad.x)<pad.w/2+ball.r){const off=(ball.x-pad.x)/(pad.w/2),sp=Math.hypot(ball.vx,ball.vy);ball.vx=sp*Math.sin(off*1.05);ball.vy=-Math.abs(sp*Math.cos(off*1.05));vib(4)}
   for(const b of bricks){if(b.hp<=0)continue;if(ball.x+ball.r>b.x&&ball.x-ball.r<b.x+b.w&&ball.y+ball.r>b.y&&ball.y-ball.r<b.y+b.h){
     const ox=Math.min(ball.x+ball.r-b.x,b.x+b.w-(ball.x-ball.r)),oy=Math.min(ball.y+ball.r-b.y,b.y+b.h-(ball.y-ball.r));if(ox<oy)ball.vx*=-1;else ball.vy*=-1;
     b.hp--;if(b.hp<=0){m.score++;A.setScore(m.score);sparks(P,b.x+b.w/2,b.y+b.h/2,b.c,10);vib(6);try{SFX.plip()}catch(e){}if(dk){F.push({t:DZ[ST.dz||0].ar,x:b.x+b.w/2,y:b.y+30,l:1,ar:1});if(dhikrStep(m,1))return}}break}}}
   if(ball.y>H+20){shake=.35;vib([30,40,30]);if(!dk){lives--;if(lives<=0){m.coins=Math.round(m.score/2);MINI.end(false);return}}reset()}
   if(bricks.every(b=>b.hp<=0)){lvl++;m.score+=10;A.setScore(m.score);F.push({t:tl('lv')+' '+lvl,x:W/2,y:H/2,l:1.4,c:t.acc});A.MCONF(50);layout();reset()}}
  const sx=shake>0?(Math.random()-.5)*10*shake:0;shake=Math.max(0,shake-dt);x.setTransform(c.DPR,0,0,c.DPR,sx*c.DPR,0);x.clearRect(-20,0,W+40,H);
  for(const b of bricks){if(b.hp<=0)continue;const g=x.createLinearGradient(0,b.y,0,b.y+b.h);g.addColorStop(0,shade(b.c,.25));g.addColorStop(1,b.c);x.fillStyle=g;rr(x,b.x,b.y,b.w,b.h,6);x.fill();if(b.hp>1){x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=2;rr(x,b.x+3,b.y+3,b.w-6,b.h-6,4);x.stroke()}}
  x.fillStyle='rgba(15,23,42,.12)';rr(x,pad.x-pad.w/2,py+6,pad.w,12,6);x.fill();const pg=x.createLinearGradient(0,py,0,py+14);pg.addColorStop(0,shade(t.acc,.3));pg.addColorStop(1,t.acc);x.fillStyle=pg;rr(x,pad.x-pad.w/2,py,pad.w,14,7);x.fill();
  const bg=x.createRadialGradient(ball.x-3,ball.y-3,1,ball.x,ball.y,ball.r);bg.addColorStop(0,'#fff');bg.addColorStop(1,shade(t.acc,-.1));x.fillStyle=bg;x.beginPath();x.arc(ball.x,ball.y,ball.r,0,7);x.fill();
  P=drawParts(x,P,dt);F=floatTxt(x,F,dt,t.ink);if(!dk){x.font='18px system-ui';x.textAlign='left';x.fillStyle='#ef4444';x.fillText('❤'.repeat(Math.max(0,lives)),12,H-14)}
  if(!launched){x.font='800 15px Inter,system-ui';x.textAlign='center';x.fillStyle=t.ink;x.globalAlpha=.7;x.globalAlpha=1;const pr=(performance.now()/900)%1;x.strokeStyle=t.acc;x.lineWidth=2;x.globalAlpha=1-pr;x.beginPath();x.arc(ball.x,ball.y,ball.r+4+pr*18,0,7);x.stroke();x.globalAlpha=1}if(!dk)m.coins=Math.round(m.score/2)})}
/* ---------- 3) Color Sort ---------- */
MINI.games.sort=function(lv){lv=lv||1;const m=cur(),t=TH(),d=A.shell(`<div style="display:flex;justify-content:center;gap:8px;margin-top:2px"><span style="font:800 14px Inter,system-ui;opacity:.85;align-self:center">${tl('lv')} ${lv}</span><button class="chip" id="sU">↶ ${tl('undo')}</button><button class="chip" id="sR">↻</button></div>`),c=canvasIn(d),x=c.x;let P=[];
 const nc=Math.min(7,2+Math.ceil(lv/1.5)),cap=4,nt=nc+2;let tubes=[],sel=-1,hist=[],won=false,lift=0;
 function gen(){const balls=[];for(let i=0;i<nc;i++)for(let k=0;k<cap;k++)balls.push(i);do{balls.sort(()=>Math.random()-.5);tubes=[];for(let i=0;i<nc;i++)tubes.push(balls.slice(i*cap,i*cap+cap));tubes.push([],[])}while(tubes.some(tb=>tb.length===cap&&tb.every(b=>b===tb[0])))}
 gen();const start0=JSON.stringify(tubes);
 const geo=()=>{const per=Math.min(nt,nt>6?Math.ceil(nt/2):nt),rows=Math.ceil(nt/per),tw=Math.min(64,(c.W-20)/per-10),bh=tw*.9,th=bh*cap+16,gapX=(c.W-per*tw)/(per+1),top=(c.H-rows*(th+40))/2+20;
  return tubes.map((_,i)=>{const r=Math.floor(i/per),k=i%per,inRow=Math.min(per,nt-r*per),gx=(c.W-inRow*tw)/(inRow+1);return {x:gx+k*(tw+gx),y:top+r*(th+40),w:tw,h:th,bh}})};
 function tap(e){if(won||cur().paused)return;const r=c.cv.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top,G2=geo();const i=G2.findIndex(g=>px>g.x-6&&px<g.x+g.w+6&&py>g.y-30&&py<g.y+g.h+10);if(i<0){sel=-1;return}
  if(sel<0){if(tubes[i].length){sel=i;lift=0;vib(4)}return}if(i===sel){sel=-1;return}
  const a=tubes[sel],b=tubes[i],ball=a[a.length-1];if(b.length<cap&&(!b.length||b[b.length-1]===ball)){hist.push(JSON.stringify(tubes));b.push(a.pop());vib(6);try{SFX.plip()}catch(e){}if(m.mode==='dhikr'&&dhikrStep(m,1))return;
   if(b.length===cap&&b.every(v=>v===b[0])){const g=G2[i];sparks(P,g.x+g.w/2,g.y,t.pal[b[0]%t.pal.length],16);vib([10,20,10])}
   if(tubes.every(tb=>!tb.length||(tb.length===cap&&tb.every(v=>v===tb[0])))){won=true;m.score+=20+lv*5;m.coins=Math.round(m.score/2);A.setScore(m.score);A.MCONF(70);
    setTimeout(()=>{const mm=cur();if(!mm)return;const keep={score:mm.score,coins:mm.coins};cancelAnimationFrame(mm.raf);if(mm.off)mm.off();$('mini').remove();MINI.games.sort(lv+1);applyTheme();cur().score=keep.score;cur().coins=keep.coins;A.setScore(keep.score)},1100)}}
  else vib([20,30]);sel=-1}
 onKey(k=>{const n=+k;if(n>=1&&n<=tubes.length){const g=geo()[n-1],r=c.cv.getBoundingClientRect();tap({clientX:r.left+g.x+g.w/2,clientY:r.top+g.y+g.h/2})}else if((k==='z'||k==='u')&&hist.length){tubes=JSON.parse(hist.pop());sel=-1}else return false});m._t={get tubes(){return tubes},set tubes(v){tubes=v},geo,tap};c.cv.addEventListener('pointerdown',tap);$('sU').onclick=()=>{if(hist.length){tubes=JSON.parse(hist.pop());sel=-1}};$('sR').onclick=()=>{tubes=JSON.parse(start0);hist=[];sel=-1};
 const PAL=['#f87171','#60a5fa','#facc15','#4ade80','#c084fc','#fb923c','#f472b6'];
 run(dt=>{const W=c.W,H=c.H;x.clearRect(0,0,W,H);lift=Math.min(1,lift+dt*8);const G2=geo();
  G2.forEach((g,i)=>{x.fillStyle='rgba(255,255,255,.65)';rr(x,g.x,g.y,g.w,g.h,g.w/2.4);x.fill();x.strokeStyle='rgba(15,23,42,.18)';x.lineWidth=2;x.stroke();
   tubes[i].forEach((v,k)=>{let cy=g.y+g.h-8-g.bh/2-k*g.bh;if(i===sel&&k===tubes[i].length-1)cy=g.y-18-(1-lift)*0;const cx=g.x+g.w/2,r0=g.bh*.42,col=PAL[v];
    const gr=x.createRadialGradient(cx-r0*.35,cy-r0*.35,r0*.1,cx,cy,r0);gr.addColorStop(0,shade(col,.45));gr.addColorStop(1,col);x.fillStyle=gr;x.beginPath();x.arc(cx,cy,r0,0,7);x.fill()})});
  P=drawParts(x,P,dt);m.coins=Math.round(m.score/2)})}
/* ---------- 4) Bubble Pop ---------- */
MINI.games.pop=function(){const m=cur(),t=TH(),d=A.shell(`<div class="bar"><i id="mP"></i></div><div style="text-align:center;margin-top:4px;font:800 13px Inter,system-ui;opacity:.85">${tl('lv')} <b id="pL">1</b> · ${tl('tgt2')}: <b id="pT"></b></div>`),c=canvasIn(d),x=c.x;let P=[],F=[];
 const C=8,R=10,PAL=['#f87171','#60a5fa','#facc15','#4ade80','#c084fc'];let lv=1,g=[],target=0,lvScore=0,pops=[],busy=false;
 function newBoard(){const nc=Math.min(5,3+Math.floor((lv+1)/2));g=[];for(let k=0;k<C;k++){g.push([]);for(let r=0;r<R;r++)g[k].push({v:Math.floor(Math.random()*nc),y:r,s:1})}target=500+lv*250;lvScore=0;$('pL').textContent=lv;$('pT').textContent=target;upd()}
 function upd(){if(m.mode==='dhikr')return;const p=$('mP');if(p)p.style.width=Math.min(100,lvScore/target*100)+'%'}
 const cell=()=>{const s=Math.min(64,(c.W-16)/C,(c.H-20)/R);return {s,ox:(c.W-s*C)/2,oy:c.H-s*R-10}};
 function group(k,r){const v=g[k][r].v,seen=new Set([k+','+r]),st=[[k,r]];while(st.length){const [a,b]=st.pop();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const A2=a+dx,B2=b+dy;if(A2<0||A2>=g.length||!g[A2]||B2<0||B2>=g[A2].length)continue;const key=A2+','+B2;if(seen.has(key)||g[A2][B2].v!==v)continue;seen.add(key);st.push([A2,B2])}}return [...seen].map(s=>s.split(',').map(Number))}
 function anyMove(){for(let k=0;k<g.length;k++)for(let r=0;r<g[k].length;r++)if(group(k,r).length>1)return true;return false}
 function tap(e){if(busy||cur().paused)return;const rc=c.cv.getBoundingClientRect(),px=e.clientX-rc.left,py=e.clientY-rc.top,q=cell();const k=Math.floor((px-q.ox)/q.s),r=Math.floor((q.oy+q.s*R-py)/q.s);if(k<0||k>=g.length||r<0||!g[k]||r>=g[k].length)return;
  const grp=group(k,r);if(grp.length<2){vib([15,20]);return}const pts=grp.length*(grp.length-1);m.score+=pts;lvScore+=pts;A.setScore(m.score);upd();if(m.mode==='dhikr'&&dhikrStep(m,1))return;vib(grp.length>6?[10,20,10]:8);try{SFX.plip()}catch(e){}
  for(const [a,b] of grp){const cx=q.ox+a*q.s+q.s/2,cy=q.oy+q.s*R-b*q.s-q.s/2;sparks(P,cx,cy,PAL[g[a][b].v],3)}F.push({t:'+'+pts,x:q.ox+k*q.s+q.s/2,y:q.oy+q.s*R-r*q.s-q.s,l:1.1,c:t.acc});
  const del=new Set(grp.map(p=>p.join(',')));for(let a=0;a<g.length;a++)g[a]=g[a].filter((_,b)=>!del.has(a+','+b));g=g.filter(col=>col.length);
  if(!anyMove()){busy=true;setTimeout(()=>{busy=false;if(!cur())return;if(m.mode==='dhikr'){newBoard();return}if(lvScore>=target){lv++;A.MCONF(60);F.push({t:tl('lv')+' '+lv,x:c.W/2,y:c.H/2,l:1.4,c:t.acc});newBoard()}else{m.coins=Math.round(m.score/20);MINI.end(false,tl('mi_over'))}},800)}}
 c.cv.addEventListener('pointerdown',tap);newBoard();
 run(dt=>{const W=c.W,H=c.H,q=cell();x.clearRect(0,0,W,H);
  for(let k=0;k<g.length;k++)for(let r=0;r<g[k].length;r++){const b=g[k][r];b.y+=(r-b.y)*Math.min(1,dt*14);const cx=q.ox+k*q.s+q.s/2,cy=q.oy+q.s*R-b.y*q.s-q.s/2,r0=q.s*.44,col=PAL[b.v];
   const gr=x.createRadialGradient(cx-r0*.35,cy-r0*.4,r0*.1,cx,cy,r0);gr.addColorStop(0,shade(col,.5));gr.addColorStop(1,col);x.fillStyle=gr;x.beginPath();x.arc(cx,cy,r0,0,7);x.fill();x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.arc(cx-r0*.35,cy-r0*.4,r0*.18,0,7);x.fill()}
  P=drawParts(x,P,dt);F=floatTxt(x,F,dt,t.ink);m.coins=Math.round(m.score/20)})}
Object.assign(T,{mi_hint_s:['Tap to drop the block.','اضغط لإسقاط القطعة.','Buusuuf tuqi.','Taabo si aad u dhigto.'],mi_hint_b:['Drag the paddle. Tap to launch.','اسحب المضرب. اضغط للإطلاق.','Saanii harkisi. Darbuuf tuqi.','Jiid usha. Taabo si aad u tuurto.']});
/* ---------- menu: 8 games, theme picker, how-to for the chosen game ---------- */
const NG=[['stack','m_stack'],['brick','m_brick'],['sort','m_sort'],['pop','m_pop']];NG.forEach(g=>{if(!GAMES.some(q=>q[0]===g[0]))GAMES.push(g)});
Object.assign(GMODES,{stack:['dhikr','free'],brick:['dhikr','free'],sort:['free'],pop:['free']});
GIC.run='<img src="game/cars/sedan_sports.png" alt="" style="width:52px;height:36px;object-fit:contain">';
Object.assign(GIC,{stack:'<svg viewBox="0 0 48 48"><path d="M10 34h28v8H10z" fill="#60a5fa"/><path d="M14 26h22v8H14z" fill="#a78bfa"/><path d="M12 18h22v8H12z" fill="#f472b6"/><path d="M16 8h20v8H16z" fill="#fbbf24"/></svg>',
 brick:'<svg viewBox="0 0 48 48"><rect x="5" y="7" width="11" height="6" rx="2" fill="#f87171"/><rect x="18.5" y="7" width="11" height="6" rx="2" fill="#fbbf24"/><rect x="32" y="7" width="11" height="6" rx="2" fill="#60a5fa"/><rect x="5" y="15" width="11" height="6" rx="2" fill="#c084fc"/><rect x="32" y="15" width="11" height="6" rx="2" fill="#4ade80"/><circle cx="26" cy="30" r="4" fill="#0ea5e9"/><rect x="14" y="38" width="20" height="5" rx="2.5" fill="#6366f1"/></svg>',
 sort:'<svg viewBox="0 0 48 48"><rect x="8" y="6" width="12" height="36" rx="6" fill="#fff" stroke="#94a3b8" stroke-width="2"/><rect x="28" y="6" width="12" height="36" rx="6" fill="#fff" stroke="#94a3b8" stroke-width="2"/><circle cx="14" cy="35" r="4.5" fill="#f87171"/><circle cx="14" cy="26" r="4.5" fill="#60a5fa"/><circle cx="34" cy="35" r="4.5" fill="#60a5fa"/><circle cx="34" cy="26" r="4.5" fill="#f87171"/><circle cx="14" cy="17" r="4.5" fill="#facc15"/></svg>',
 pop:'<svg viewBox="0 0 48 48"><circle cx="14" cy="33" r="8" fill="#60a5fa"/><circle cx="31" cy="33" r="8" fill="#60a5fa"/><circle cx="22.5" cy="18" r="8" fill="#f472b6"/><circle cx="38" cy="17" r="6" fill="#facc15"/><circle cx="11" cy="30" r="2" fill="#fff" opacity=".7"/><circle cx="28" cy="30" r="2" fill="#fff" opacity=".7"/><circle cx="20" cy="15" r="2" fill="#fff" opacity=".7"/></svg>'});
/* ---------- dhikr: meaning + transliteration + listen + change, in every game (Tasnim 24 Nov) ---------- */
const DZM=[['Glory be to Allah','Rabbiin hir\'ina hunda irraa qulqulluu dha','Ilaahay waa ka nasahan yahay ceeb kasta'],
 ['All praise is for Allah','Galanni hundi kan Rabbii ti','Mahad oo dhan Ilaahay ayaa iska leh'],
 ['Allah is the Greatest','Rabbiin waan hundaa caala guddaa dha','Ilaahay waa ka weyn yahay wax walba'],
 ['None is worthy of worship but Allah','Dhugaan kan gabbaramu Allaah malee hin jiru','Ilaah xaq lagu caabudo ma jiro Allaah mooyee'],
 ['Glory be to Allah, and praise is His','Rabbiin qulqulluu dha, galanni isaaf haa ta\'u','Ilaahay waa nasahan yahay, mahadna isagaa leh'],
 ['I ask Allah for forgiveness','Rabbii dhiifama nan kadhadha','Ilaahay dambi dhaaf ayaan weydiisanayaa'],
 ['There is no power or strength except with Allah','Humnii fi jijjiiramni Allaahiin malee hin jiru','Awood iyo xoog midna ma jiro Ilaahay mooyee'],
 ['O Allah, send blessings upon Muhammad','Yaa Rabbii, Muhammad irratti rahmata buusi','Ilaahayow, naxariis ku naxariiso Muxammad']];
const DZCLIP={0:'subhanallah.m4a',1:'alhamdulillah.m4a',2:'allahu-akbar.m4a',4:'subhan-wabihamdih.m4a'};
Object.assign(T,{dz_l:['Listen','استمع','Dhaggeeffadhu','Dhageyso'],dz_c:['Change','تغيير','Jijjiiri','Beddel'],dz_m:['Meaning','المعنى','Hiika','Macnaha'],dz_pick:['Choose a dhikr','اختر ذكرًا','Zikrii filadhu','Dooro dhikri']});
const dzMean=i=>LG==='ar'?'':DZM[i][{en:0,om:1,so:2}[LG]||0];
const dzShow=()=>ST.dzx!==false;
let dzA=null;function dzListen(b){const f=DZCLIP[ST.dz||0];if(!f)return;try{if(dzA&&!dzA.paused){dzA.pause();dzA=null;if(b)b.classList.remove('on');return}dzA=new Audio('hisn/clips/'+f);dzA.play();if(b){b.classList.add('on');dzA.onended=()=>b.classList.remove('on')}}catch(e){}}
const ICL='<svg viewBox="0 0 24 24" width="14" height="14"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const ICC='<svg viewBox="0 0 24 24" width="14" height="14"><path d="M4 8h13l-3-3M20 16H7l3 3" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function dzFill(root){const i=ST.dz||0,z=DZ[i];const q=s=>root.querySelector(s);if(q('.dza'))q('.dza').textContent=z.ar;
 const tr=q('.dztl'),mn=q('.dzm');if(tr){tr.textContent=z.tr;tr.hidden=!dzShow()||LG==='ar'}if(mn){mn.textContent=dzMean(i);mn.hidden=!dzShow()||!dzMean(i)}
 const L=q('[data-dz="l"]');if(L)L.hidden=!DZCLIP[i];const X=q('[data-dz="x"]');if(X){X.hidden=LG==='ar';X.classList.toggle('on',dzShow())}}
function dzBtns(){return `<button data-dz="l">${ICL}<span>${tl('dz_l')}</span></button><button data-dz="c">${ICC}<span>${tl('dz_c')}</span></button><button data-dz="x"><span>${tl('dz_m')}</span></button>`}
function dzList(onPick){return [`<div class="dk">${DZ.map((d,i)=>`<button data-z="${i}" class="${(ST.dz||0)===i?'on':''}"><span class="ar">${d.ar}</span>${LG==='ar'?'':`<small>${esc(d.tr)} · ${esc(dzMean(i))}</small>`}</button>`).join('')}</div>`,(c,cl)=>c.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>{ST.dz=+b.dataset.z;stSave();cl();onPick()})]}
function dzBind(root,pause,resume){root.querySelectorAll('[data-dz]').forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.dz;
  if(k==='l')dzListen(b);else if(k==='x'){ST.dzx=!dzShow();stSave();dzFill(root)}
  else{pause();const [h,bd]=dzList(()=>{dzFill(root);resume()});pickSheet(tl('dz_pick'),h,bd);const pk=$('pk');if(pk){pk.style.zIndex=60;pk.querySelectorAll('.pkx,.pkb').forEach(x=>x.addEventListener('click',resume))}}})}
/* panel inside the small games */
function dzPanel(){const d=$('mini'),m=cur();if(!d||!m||m.mode!=='dhikr'||d.querySelector('.dzp'))return;
 [...d.children].forEach(e=>{if(e.classList.contains('bar')||(e.classList.contains('ar')&&!e.closest('.mb')))e.remove()});
 const p=document.createElement('div');p.className='dzp';p.innerHTML=`<div class="bar"><i id="mP"></i></div><div class="dza ar"></div><div class="dztl"></div><div class="dzm"></div><div class="dzb"><b class="dzn"></b>${dzBtns()}</div>`;
 d.querySelector('.mb').after(p);dzFill(p);const pl=d.querySelector('#pL');if(pl&&pl.parentElement)pl.parentElement.style.display='none';requestAnimationFrame(()=>dispatchEvent(new Event('resize')));const tg=ST.tgt||33,bar=p.querySelector('#mP');bar.style.width=Math.min(100,(m.count||0)/tg*100)+'%';
 dzBind(p,()=>{if(cur())cur().paused=true},()=>{if(cur())cur().paused=false});
 const n=p.querySelector('.dzn'),iv=setInterval(()=>{const mm=cur();if(!mm||!document.body.contains(p)){clearInterval(iv);return}n.textContent=(mm.count||0)+' / '+tg},250)}
/* Road Run: same lines under the Arabic in the dhikr card */
(function(){const g=document.querySelector('.goal>div'),ar=$('gAr');if(!g||!ar||g.querySelector('.dztl'))return;
 ar.classList.add('dza');ar.insertAdjacentHTML('afterend','<div class="dztl"></div><div class="dzm"></div>');
 const b=document.createElement('div');b.className='dzb';b.innerHTML=dzBtns();g.appendChild(b);
 let was=null;dzBind(g,()=>{if(state==='play'){was='play';state='pause';cancelAnimationFrame(raf)}},()=>{if(was==='play'&&state==='pause'){was=null;state='play';last=performance.now();loop()}});
 const _h=hud;hud=function(){const r=_h.apply(this,arguments);try{const gg=G;g.querySelector('.dztl').hidden=true;g.querySelector('.dzm').hidden=true;b.hidden=!gg||gg.mode!=='dhikr';if(gg&&gg.mode==='dhikr'&&hud.k!==ST.dz+'|'+ST.dzx){hud.k=ST.dz+'|'+ST.dzx;}if(gg&&gg.mode==='dhikr')dzFill(g)}catch(e){}return r}})();
/* ---------- small "i" in every game: how to play, points, losing ---------- */
const ICI='<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="7.6" r="1.4" fill="currentColor"/><path d="M12 11v6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
function miniInfo(){const d=$('mini');if(!d||d.querySelector('#mI'))return;const pz=d.querySelector('#mPz');if(!pz)return;const b=document.createElement('button');b.id='mI';b.setAttribute('aria-label',tl('h_do'));b.innerHTML=ICI;b.onclick=()=>{const m=cur();if(m&&!m.paused)howCard(m.kind,false)};pz.before(b)}
{const bar=document.querySelector('.bar'),pz=$('pz');if(bar&&pz&&!$('runI')){const b=document.createElement('button');b.className='pill ib';b.id='runI';b.hidden=true;b.setAttribute('aria-label',tl('h_do'));b.innerHTML=ICI;pz.before(b);
  b.onclick=()=>{let was=false;if(state==='play'){was=true;state='pause';cancelAnimationFrame(raf)}pickSheet(tl('m_run'),howHTML('run')+`<button class="go" id="riOk" style="margin-top:12px">${tl('h_ok')}</button>`,(c,cl)=>{c.querySelector('#riOk').onclick=cl});
   const res=()=>{if(was&&state==='pause'){was=false;state='play';last=performance.now();loop()}};const pk=$('pk');if(pk)pk.querySelectorAll('.pkx,.pkb,#riOk').forEach(x=>x.addEventListener('click',res))};
  new MutationObserver(()=>{b.hidden=pz.hidden}).observe(pz,{attributes:true,attributeFilter:['hidden']})}}
/* ---------- simpler start screen ---------- */
const ORD=['run','catch','stack','brick','match','sort','merge','pop'];GAMES.sort((a,b)=>ORD.indexOf(a[0])-ORD.indexOf(b[0]));
GAMES.forEach(([k])=>{if(k!=='run')GMODES[k]=['dhikr','free']});
Object.assign(T,{fq_short:['Finish your tasks 3 days in a row: +20 min','أنجز مهامك ٣ أيام متتالية: +٢٠ دقيقة','Guyyaa 3 walitti hojii kee xumuri: +20 daq.','3 maalmood oo xiriir ah dhammee hawlahaaga: +20 daq.'],fq_det:['Details','التفاصيل','Bal\'ina','Faahfaahin']});
const _fi=freeInfo;freeInfo=function(){const o=plGet(),l=fqLeftO(o);return `<div class="fq${l>0?'':' done'}"><b class="fq-big">${l>0?tl('fq_today').replace('{n}',Math.ceil(l/60)):tl('fq_done')}</b><span>${tl('fq_short')}</span></div><details class="fqd2"><summary>${tl('fq_det')}</summary>${_fi()}</details>`};
{const _sm=showMenu;showMenu=function(){const r=_sm.apply(this,arguments);try{const s=$('plS');if(s)s.remove();const rl=$('ruleL');if(rl)rl.textContent='⏱ '+tl('rule_n').replace('{n}',Math.max(0,Math.ceil((BR_MAX-BR.s)/60)));
  const P=$('pills');if(P)P.querySelectorAll('.pl').forEach(q=>{const i=q.querySelector('i');if(i&&(i.textContent==='?'))i.innerHTML=ICI})}catch(e){}return r}}
const _xp=window.FQExtraPills;window.FQExtraPills=(P,gk)=>{if(gk==='run'){if(_xp)_xp(P,gk)}
 else{const b=document.createElement('button');b.className='pl';const th=TH();b.innerHTML=`<i style="background:${th.bg}"></i><span>${tl('th_'+(ST.theme||'sky'))}</span><b>▾</b>`;
  b.onclick=()=>pickSheet(tl('th'),`<div class="thg">${Object.keys(THEMES).map(k=>`<button data-th2="${k}" class="${(ST.theme||'sky')===k?'on':''}"><i style="background:${THEMES[k].bg};border-bottom:4px solid ${THEMES[k].acc}"></i><span>${tl('th_'+k)}</span></button>`).join('')}</div>`,(c,cl)=>c.querySelectorAll('[data-th2]').forEach(q=>q.onclick=()=>{ST.theme=q.dataset.th2;stSave();cl();showMenu()}));P.appendChild(b)}
 const h=document.createElement('button');h.className='pl';h.innerHTML='<i>?</i><span>'+tl('h_do')+'</span>';h.onclick=()=>pickSheet(tl('m_'+gk),howHTML(gk),()=>{});
 const old=[...P.querySelectorAll('.pl')].find(q=>q.textContent.includes(tl('g_t'))||q.textContent.includes(tl('how')));if(old)old.replaceWith(h);else P.appendChild(h)};
try{const pz=document.getElementById('pz');if(pz)pz.innerHTML=PZ;}catch(e){}
try{if(state==='menu')showMenu()}catch(e){}
})();
