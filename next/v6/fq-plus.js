/* Fastaqim plus (21 Nov 2026): Settings, profile picture, Reset everything, shake-to-report with a screenshot,
   Today's path guide, What's new, owner change log, team chat, Qur'an word-by-word highlight + word meanings,
   Ayat al-Kursi audio in the adhkar reader, and the bell dot that now clears.
   Kept in its own file so other work on index.html never overwrites it. It uses the page's own helpers
   ($, $$, T, L, LI, LX, S, save, store, go, R, TABOF, openSheet, closeSheet, XB, toast, vib, esc, AR, FQA, AU, aUrl, ZK, ZS). */
(function(){'use strict';
const X=(en,ar,om,so)=>L==='ar'?ar:(LI===0&&om)?om:(LI===1&&so)?so:(LI>=0&&typeof DICT==='object'&&DICT[en])?DICT[en][LI]:en;
const ROOT=(typeof ROOTP==='string')?ROOTP:(/\/next\/v6\//.test(location.pathname)?'../../':'');
const ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}};
const fmtDay=d=>new Date(d+'T12:00:00').toLocaleDateString(L==='ar'?'ar':(LI>=0?LX:'en-US'),{weekday:'short',day:'numeric',month:'long'});
const BACK=`<button class="ib" data-back aria-label="${X('Back','رجوع','Duubatti','Dib u noqo')}"><i class="ph ph-caret-left flip"></i></button>`;
const row=(id,icon,label,em,cls)=>`<button id="${id}"${cls?` class="${cls}"`:''}><span class="ic c-a"><i class="ph ${icon}"></i></span><span>${label}</span>${em!=null?`<em>${em}</em>`:''}<i class="ph ph-caret-right cv flip"></i></button>`;
const tog=(id,icon,label,small,on)=>`<div class="fqp-tg"><span class="ic c-a"><i class="ph ${icon}"></i></span><span class="tx"><b>${label}</b>${small?`<small>${small}</small>`:''}</span><button class="sw ${on?'on':''}" id="${id}" role="switch" aria-checked="${!!on}" aria-label="${esc(label)}"></button></div>`;
function addScreen(id,html,tab){if($('s-'+id))return;const last=$$('.scr');last[last.length-1].insertAdjacentHTML('afterend',`<section class="scr" id="s-${id}">${html}</section>`);TABOF[id]=tab||'more'}

/* ================= What's new (everyone) + change log ================= */
const NEWS=[
 {id:'2026-11-21',d:'2026-11-21',items:[
  ['fix',X('Ayat al-Kursi now plays in Before-sleep and morning/evening adhkar, like the last ayat of Al-Baqarah.','آية الكرسي تُشغَّل الآن في أذكار النوم والصباح والمساء مثل خواتيم البقرة.')],
  ['fix',X('The red dot on the bell now goes away once you have seen what is new.','النقطة الحمراء على الجرس تختفي بعد رؤية الجديد.')],
  ['new',X("Qur'an: each word lights up while the recitation plays, and you can tap a word to see its meaning.",'القرآن: تُضاء كل كلمة أثناء التلاوة.')],
  ['new',X('Settings page: profile picture, language, reminders, your data and Reset everything.','صفحة الإعدادات: صورة الملف، اللغة، التذكيرات، بياناتك، وإعادة الضبط.')],
  ['new',X("Today's path has a ? that explains each item, including what Witr is and when to pray it.",'طريق اليوم فيه علامة ؟ تشرح كل عنصر، ومنها الوتر ووقته.')],
  ['new',X('Shake your phone on any screen to report a problem. A picture of the screen is added for you.','هزّ هاتفك في أي شاشة للإبلاغ عن مشكلة، وتُضاف صورة الشاشة تلقائيًا.')],
  ['new',X("This What's new page.",'صفحة ما الجديد هذه.')]]}];
const NEWS_ID=NEWS[0].id;
const newsSeen=()=>ls.get('fq5.newsSeen','')>=NEWS_ID;
function dotSync(){document.documentElement.classList.toggle('fqp-new',!newsSeen());const e=$('fqpNewsEm');if(e)e.hidden=newsSeen()}
function markNews(){ls.set('fq5.newsSeen',NEWS_ID);dotSync()}
addScreen('news',`<div class="hd sub">${BACK}<h1>${X("What's new",'ما الجديد','Haaraa maal','Maxaa cusub')}</h1><span style="width:44px"></span></div><div id="fqpNews"></div>`);
R.news=()=>{markNews();$('fqpNews').innerHTML=NEWS.map(n=>`<p class="glh">${esc(fmtDay(n.d))}</p><div class="kh fqp-list">${n.items.map(([k,t])=>`<div class="fqp-li"><span class="fqp-tag ${k}">${k==='fix'?X('Fixed','إصلاح','Sirraa’e','La hagaajiyay'):X('New','جديد','Haaraa','Cusub')}</span><p>${esc(t)}</p></div>`).join('')}</div>`).join('')+
 `<p class="note fqp-c">${X('Something not right? Shake your phone on that screen, or use Report a problem in Settings.','هل هناك خطأ؟ هزّ هاتفك في تلك الشاشة أو استخدم الإبلاغ عن مشكلة في الإعدادات.')}</p>`};

/* owner-only change log (rows live in Supabase, readable only by the owner) */
addScreen('log',`<div class="hd sub">${BACK}<h1>${X('Change log','سجل التغييرات')}</h1><span style="width:44px"></span></div><div id="fqpLog"></div>`);
R.log=async()=>{const B=$('fqpLog');B.innerHTML=`<p class="rload">${T('Loading…','جارٍ التحميل…')}</p>`;
 if(!(await isOwner())){B.innerHTML=`<div class="qbe"><i class="ph ph-lock-simple"></i><p>${T('Only the owner can open this.','هذه الصفحة للمالك فقط.')}</p></div>`;return}
 try{const sb=await FQA.sb();const {data,error}=await sb.from('fastaqim_changelog').select('day,kind,what').order('day',{ascending:false}).order('id',{ascending:true}).limit(400);if(error)throw error;
  const by={};(data||[]).forEach(r=>{(by[r.day]=by[r.day]||[]).push(r)});const KL={added:X('Added','أُضيف'),changed:X('Changed','تغيّر'),fixed:X('Fixed','أُصلح'),removed:X('Removed','أُزيل')};
  B.innerHTML=`<p class="note">${X('Everything added, changed, fixed or removed, newest first. Only you can see this page.','كل ما أُضيف أو تغيّر أو أُصلح أو أُزيل، الأحدث أولًا. هذه الصفحة تراها أنت فقط.')}</p>`+
   (Object.keys(by).map(d=>`<p class="glh">${esc(fmtDay(d))}</p><div class="kh fqp-list">${by[d].map(r=>`<div class="fqp-li"><span class="fqp-tag ${r.kind}">${KL[r.kind]||r.kind}</span><p dir="auto">${esc(r.what)}</p></div>`).join('')}</div>`).join('')||`<p class="note fqp-c">${X('Nothing yet.','لا شيء بعد.')}</p>`)}
 catch(e){B.innerHTML=`<div class="rerr"><p>${T("Couldn't load. Check your internet and try again.",'تعذّر التحميل. تحقق من الإنترنت وحاول مجددًا.')}</p></div>`}};

/* ================= roles ================= */
const ROLE={u:null,own:null,team:null};
async function roles(){const u=window.FQA&&FQA.user();if(!u){ROLE.u=null;ROLE.own=ROLE.team=false;return ROLE}if(ROLE.u===u.id&&ROLE.team!==null)return ROLE;
 try{const sb=await FQA.sb();const [a,b]=await Promise.all([sb.rpc('is_admin'),sb.rpc('is_team')]);ROLE.own=!a.error&&a.data===true;ROLE.team=!b.error&&b.data===true}catch(e){ROLE.own=ROLE.team=false}ROLE.u=u.id;return ROLE}
const isOwner=async()=>(await roles()).own;
if(window.FQA)FQA.on(()=>{ROLE.team=null;moreRows()});

/* ================= profile picture ================= */
const AV=[['letter',''],['leaf','ph-leaf'],['plant','ph-plant'],['tree','ph-tree'],['pine','ph-tree-evergreen'],['mount','ph-mountains'],['sun','ph-sun-horizon'],['drop','ph-drop'],['waves','ph-waves'],['cloud','ph-cloud'],['book','ph-book-open'],['pen','ph-pen-nib'],['cactus','ph-cactus'],['coffee','ph-coffee'],['tulip','ph-flower-tulip']];
const AVC=[['sage','var(--accT)','var(--acc)'],['sand','#f5eedf','#86672e'],['mist','#eceff1','#4f5b62'],['stone','#efebe6','#6e6458'],['sea','#e6eff2','#3c6e7a']];
const prof=()=>S.prof=S.prof||{av:'letter',c:'sage',home:0};
function avHTML(size,p){p=p||prof();const c=AVC.find(x=>x[0]===p.c)||AVC[0],a=AV.find(x=>x[0]===p.av)||AV[0];
 const ini=(String(S.name||'').trim()[0]||'').toUpperCase();
 const own=p.av==='photo'&&localStorage.getItem('fq5.avImg');if(own)return `<span class="fqp-av" style="--s:${size}px" aria-hidden="true"><img src="${own}" alt=""></span>`;
 const inner=a[0]==='letter'?(ini?`<b>${esc(ini)}</b>`:'<i class="ph ph-leaf"></i>'):`<i class="ph ${a[1]}"></i>`;
 return `<span class="fqp-av" style="--s:${size}px;background:${c[1]};color:${c[2]}" aria-hidden="true">${inner}</span>`}
function homeAv(){const fh=document.querySelector('#s-home .fh');if(!fh)return;let b=$('fqpHAv');
 if(!prof().home){if(b){b.remove();try{fhFit()}catch(e){}}return}
 if(!b){fh.querySelector('.wm').insertAdjacentHTML('afterend',`<button class="fqp-hav" id="fqpHAv" aria-label="${esc(X('Settings','الإعدادات','Qindaa’ina','Dejinta'))}"></button>`);b=$('fqpHAv');b.onclick=()=>go('settings')}
 b.innerHTML=avHTML(36);try{if(typeof fhFit==='function')fhFit()}catch(e){}}

/* ================= Settings ================= */
addScreen('settings',`<div class="hd sub">${BACK}<h1>${X('Settings','الإعدادات','Qindaa’ina','Dejinta')}</h1><span style="width:44px"></span></div><div id="fqpSet"></div>`);
R.settings=()=>{const p=prof(),B=$('fqpSet'),u=window.FQA&&FQA.user(),bak=ls.get('fq5.resetBak',null);
 B.innerHTML=`
 <div class="kh fqp-prof"><div class="fqp-pv" id="fqpPv">${avHTML(64)}</div>
  <label class="fqp-nm"><small>${X('Your name','اسمك','Maqaa kee','Magacaaga')}</small><input class="inp" id="fqpName" maxlength="40" autocomplete="given-name" value="${esc(S.name||'')}" placeholder="${esc(X('Optional','اختياري','Filannoo','Ikhtiyaari'))}"></label></div>
 <p class="glh">${X('Profile picture','صورة الملف','Suuraa piroofaayilii','Sawirka astaanta')}</p>
 <div class="kh"><div class="fqp-avg" role="radiogroup" aria-label="${esc(X('Profile picture','صورة الملف'))}"><button class="fqp-own ${p.av==='photo'?'on':''}" id="fqpAvOwn" aria-label="${esc(X('Your photo','صورتك'))}">${localStorage.getItem('fq5.avImg')?avHTML(46,{av:'photo',c:p.c}):`<span class="fqp-av fqp-add" style="--s:46px"><i class="ph ph-camera-plus"></i></span>`}</button>${AV.map(a=>`<button role="radio" aria-checked="${p.av===a[0]}" class="${p.av===a[0]?'on':''}" data-av="${a[0]}">${avHTML(46,{av:a[0],c:p.c})}</button>`).join('')}</div>
  <div class="fqp-avc" role="radiogroup" aria-label="${esc(X('Colour','اللون'))}">${AVC.map(c=>`<button role="radio" aria-checked="${p.c===c[0]}" class="${p.c===c[0]?'on':''}" data-avc="${c[0]}" style="background:${c[1]};color:${c[2]}" aria-label="${c[0]}"><i class="ph ph-check"></i></button>`).join('')}</div>
</div>
 <div class="gl">${tog('fqpHome','ph-house',X('Show on Home','إظهارها في الرئيسية','Mana irratti agarsiisi','Ku muuji Hoyga'),X('Off by default. Turn on if you like it.','متوقف افتراضيًا. فعّله إن أحببت.'),p.home)}</div>

 <p class="glh">${X('Home background','خلفية الرئيسية','Duuba Manaa','Asalka Hoyga')}</p>
 <div class="kh"><div class="fqp-wpg">${WP.map(w=>`<button class="${(S.wp||'none')===w[0]?'on':''}" data-wp="${w[0]}"><span class="fqp-wps" style="${w[0]==='photo'?(localStorage.getItem('fq5.wpImg')?`background-image:url(${localStorage.getItem('fq5.wpImg')})`:''):w[2]}">${w[0]==='photo'&&!localStorage.getItem('fq5.wpImg')?'<i class="ph ph-image"></i>':w[0]==='none'?'<i class="ph ph-prohibit"></i>':''}</span><small>${w[1]}</small></button>`).join('')}</div>
  ${localStorage.getItem('fq5.wpImg')?`<button class="fqp-link" id="fqpWpNew"><i class="ph ph-image"></i>${X('Choose a different photo','اختر صورة أخرى')}</button>`:''}</div>
 <input type="file" id="fqpFileAv" accept="image/*" hidden><input type="file" id="fqpFileWp" accept="image/*" hidden>
 <p class="glh">${X('General','عام','Waliigala','Guud')}</p>
 <div class="gl">${row('fqpLang','ph-translate',X('Language','اللغة','Afaan','Luqadda'),esc(($('mLang')&&$('mLang').querySelector('em')||{}).textContent||''))}
  ${row('fqpNot','ph-bell',X('Notifications','الإشعارات','Beeksisa','Ogeysiisyada'),null)}
  ${tog('fqpShake','ph-device-mobile-camera',X('Shake to report a problem','هزّ للإبلاغ عن مشكلة','Rakkoo gabaasuuf raasi','Lulid si aad u soo sheegto'),X('A picture of the screen is added for you.','تُضاف صورة الشاشة تلقائيًا.'),shakeOn())}</div>

 <p class="glh">${X('Help','مساعدة','Gargaarsa','Caawimo')}</p>
 <div class="gl">${row('fqpNews2','ph-gift',X("What's new",'ما الجديد','Haaraa maal','Maxaa cusub'),null)}
  ${row('fqpGuide','ph-question',X("Today's path guide",'دليل طريق اليوم','Qajeelfama karaa har’aa','Hagaha jidka maanta'),null)}
  ${row('fqpRep','ph-bug',X('Report a problem','الإبلاغ عن مشكلة','Rakkoo gabaasi','Soo sheeg dhibaato'),null)}
  ${row('fqpIdea','ph-chat-circle-text',X('Feedback','ملاحظات','Yaada','Jawaab celin'),null)}</div>

 <p class="glh">${X('Your data','بياناتك','Odeeffannoo kee','Xogtaada')}</p>
 <div class="gl">${row('fqpAcct','ph-user-circle',u?X('Account','الحساب','Herrega','Akoonka'):X('Sign in','تسجيل الدخول','Seeni','Gal'),u?esc(u.email||''):null)}
  ${row('fqpDl','ph-download-simple',X('Download my data','تنزيل بياناتي','Odeeffannoo koo buufadhu','Soo dejiso xogtayda'),null)}
  ${ls.get('fq5.restoreCh',null)?row('fqpRc','ph-arrows-left-right',X('Change restore choice','تغيير اختيار الاستعادة'),esc(X('until ','حتى ')+new Date(ls.get('fq5.restoreCh',{}).until).toLocaleDateString(L==='ar'?'ar':'en-US',{day:'numeric',month:'short'}))):''}
  ${bak?row('fqpUndo','ph-arrow-counter-clockwise',X('Undo reset','تراجع عن إعادة الضبط','Deebisi','Ka noqo dib-u-dejinta'),esc(X('until ','حتى ')+new Date(bak.until).toLocaleDateString(L==='ar'?'ar':'en-US',{day:'numeric',month:'short'}))):''}</div>
 <p class="fqp-priv"><i class="ph ph-lock-simple"></i><span>${X('Private by design. Your data stays on this phone, and in your own account if you sign in. Fastaqim never sells or shares it. No ads, no tracking.','خصوصيتك أولًا. تبقى بياناتك على هذا الجهاز، وفي حسابك أنت إن سجّلت الدخول. فاستقم لا يبيعها ولا يشاركها أبدًا. بلا إعلانات ولا تتبّع.','Dhuunfaa kee. Odeeffannoon kee bilbila kana irra, yoo seente immoo herrega kee irra jira. Fastaqim gonkumaa hin gurguru, hin qoodu. Beeksisni fi hordoffiin hin jiru.','Gaar ahaan loo sameeyay. Xogtaadu waxay ku jirtaa taleefankan, iyo akoonkaaga haddii aad gasho. Fastaqim weligeed ma iibiso, lamana wadaago. Xayeysiis iyo raadraac midna ma jiro.')}</span></p>
 <button class="dang fqp-reset" id="fqpReset"><i class="ph ph-arrow-counter-clockwise"></i>${X('Reset everything','إعادة ضبط كل شيء','Hunda haaromsi','Dib u deji wax walba')}</button>
 ${u?`<button class="fqp-delacc" id="fqpDel">${X('Delete my account','حذف حسابي')}</button>`:''}
 <p class="fqp-ver">Fastaqim · v6</p>`;
 const nm=$('fqpName');nm.onchange=nm.onblur=()=>{const v=nm.value.trim().slice(0,40);if(v===(S.name||''))return;S.name=v;save();$('fqpPv').innerHTML=avHTML(64);B.querySelectorAll('[data-av="letter"]').forEach(b=>b.innerHTML=avHTML(46,{av:'letter',c:p.c}));homeAv()};
 $$('#fqpSet [data-av]').forEach(b=>b.onclick=()=>{p.av=b.dataset.av;save();vib(8);R.settings();homeAv()});
 $$('#fqpSet [data-avc]').forEach(b=>b.onclick=()=>{p.c=b.dataset.avc;save();vib(8);R.settings();homeAv()});
 $('fqpAvOwn').onclick=()=>{if(localStorage.getItem('fq5.avImg')&&p.av!=='photo'){p.av='photo';save();vib(8);R.settings();homeAv();return}$('fqpFileAv').click()};
 $('fqpFileAv').onchange=e=>{const f=e.target.files[0];e.target.value='';if(f)pickPhoto(f,'av')};
 $('fqpFileWp').onchange=e=>{const f=e.target.files[0];e.target.value='';if(f)pickPhoto(f,'wp')};
 $$('#fqpSet [data-wp]').forEach(b=>b.onclick=()=>{const k=b.dataset.wp;if(k==='photo'&&!localStorage.getItem('fq5.wpImg')){$('fqpFileWp').click();return}S.wp=k;save();vib(8);applyWp();R.settings()});
 if($('fqpWpNew'))$('fqpWpNew').onclick=()=>$('fqpFileWp').click();
 $('fqpHome').onclick=()=>{p.home=p.home?0:1;save();vib(8);R.settings();homeAv()};
 $('fqpLang').onclick=()=>{const m=$('mLang');if(m)m.click()};$('fqpNot').onclick=()=>go('notif');
 $('fqpShake').onclick=async()=>{const on=!shakeOn();if(on&&!(await shakeAsk())){toast(X('Motion was not allowed. You can allow it in your phone settings.','لم يُسمح بالحركة. يمكنك السماح بها من إعدادات الهاتف.'));return}ls.set('fq5.shake',on?1:0);shakeArm();R.settings()};
 $('fqpNews2').onclick=()=>go('news');$('fqpGuide').onclick=()=>go('guide');$('fqpRep').onclick=()=>reportSheet(null);$('fqpIdea').onclick=()=>OLD_FB('idea');
 $('fqpAcct').onclick=()=>acctSheet();$('fqpDl').onclick=dlData;if($('fqpUndo'))$('fqpUndo').onclick=undoReset;if($('fqpRc'))$('fqpRc').onclick=changeRestore;if($('fqpDel'))$('fqpDel').onclick=delSheet;$('fqpReset').onclick=resetSheet};

/* ---- the person's own photo (profile or Home background): kept only on this phone, checked first ---- */
const WP=[['none',X('None','بلا','Homaa','Midna'),''],
 ['dawn',X('Dawn','الفجر','Barii','Waaberi'),'background:linear-gradient(180deg,#f7ecdc 0%,#fbf6ee 55%,#fbf9f4 100%)'],
 ['sage',X('Sage','مريمية','Magariisa','Cagaar'),'background:linear-gradient(180deg,#e4eee6 0%,#f3f7f2 60%,#fbf9f4 100%)'],
 ['mist',X('Mist','ضباب','Hurrii','Ceeryaamo'),'background:linear-gradient(180deg,#e6ecf1 0%,#f4f6f8 60%,#fbf9f4 100%)'],
 ['sand',X('Sand','رمل','Cirracha','Ciid'),'background:linear-gradient(180deg,#efe6d6 0%,#f7f2e9 60%,#fbf9f4 100%)'],
 ['photo',X('Your photo','صورتك','Suuraa kee','Sawirkaaga'),'']];
const BAD_FILE=['nsfw','xxx','porn','nude','naked','sex','sexy','bikini','lingerie','onlyfans','hentai','weed','marijuana','cannabis','kush','joint','blunt','cocaine','coke','heroin','meth','drug','drugs','pills','vape','vaping','cigarette','cigar','smoke','smoking','hookah','shisha','beer','wine','vodka','whiskey','whisky','alcohol','drunk','cocktail','champagne','tequila','rum','casino','gamble','poker','cross','crucifix','jesus','christ','church','buddha','idol','statue','shrine','temple','pagoda','tarot','zodiac','horoscope','satan','devil','demon','pentagram','evil eye','nazar','hamsa','amulet','talisman','christmas','xmas','halloween','valentine','pride','rainbow flag','anime','cartoon'];
function badName(n){const t=String(n||'').toLowerCase().replace(/[_\-.]+/g,' ');if(typeof blocked==='function'&&blocked(t))return true;return BAD_FILE.some(w=>new RegExp('(^|[^a-z])'+w.replace(/\s/g,'\\s')+'([^a-z]|$)').test(t))}
let NS=null;function nsLoad(){if(NS)return NS;const base=H2C_SRC.replace(/h2c\.min\.js$/,'nsfw/');const add=f=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=base+f;s.onload=ok;s.onerror=no;document.head.appendChild(s)});
 NS=(async()=>{await add('model.min.js');await add('group1-shard1of1.min.js');await add('nsfwjs.min.js');return window.nsfwjs.load('MobileNetV2')})();NS.catch(()=>{NS=null});return NS}
function loadImg(file){return new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=URL.createObjectURL(file)})}
function toJpeg(img,max,sq){const c=document.createElement('canvas');let w=img.naturalWidth,h=img.naturalHeight,sx=0,sy=0,sw=w,sh=h;
 if(sq){const m=Math.min(w,h);sx=(w-m)/2;sy=(h-m)/2;sw=sh=m;w=h=Math.min(max,m)}else{const k=Math.min(1,max/Math.max(w,h));w=Math.round(w*k);h=Math.round(h*k)}
 c.width=w;c.height=h;c.getContext('2d').drawImage(img,sx,sy,sw,sh,0,0,w,h);return c.toDataURL('image/jpeg',.78)}
function photoNo(){openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X("This picture can't be used",'لا يمكن استخدام هذه الصورة')}</h1>${XB}</div>
 <div class="kh"><p class="fqp-pn">${X('Please choose another one, like a view of nature, your favourite place or something calm.','اختر صورة أخرى، مثل منظر طبيعي أو مكانك المفضل أو شيء هادئ.')}</p></div><button class="big" data-x>${X('Okay','حسنًا')}</button>`);vib([20,40,20])}
async function pickPhoto(file,kind){if(!/^image\//.test(file.type||'image/')||file.size>25e6){toast(X('Please choose a photo.','اختر صورة.'));return}
 if(badName(file.name)){photoNo();return}
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Checking your photo…','جارٍ فحص صورتك…')}</h1><span style="width:44px"></span></div><div class="fqp-chk"><span class="fqp-spin"></span><p>${X('This takes a few seconds the first time.','يستغرق هذا بضع ثوانٍ في المرة الأولى.')}</p></div>`);
 let img;try{img=await loadImg(file)}catch(e){closeSheet();toast(X("Couldn't open this photo.",'تعذّر فتح هذه الصورة.'));return}
 let ok=false;try{const m=await nsLoad();const pr=await m.classify(img,5);const P={};pr.forEach(x=>P[x.className]=x.probability);
  ok=((P.Porn||0)+(P.Hentai||0)+(P.Sexy||0))<0.2&&(P.Drawing||0)<0.6}catch(e){console.warn('check',e);closeSheet();toast(X("Couldn't check this photo. Check your internet and try again.",'تعذّر فحص الصورة. تحقق من الإنترنت وحاول مجددًا.'));URL.revokeObjectURL(img.src);return}
 if(!ok){URL.revokeObjectURL(img.src);photoNo();return}
 const d=kind==='av'?toJpeg(img,256,true):toJpeg(img,1080,false);URL.revokeObjectURL(img.src);
 try{localStorage.setItem(kind==='av'?'fq5.avImg':'fq5.wpImg',d)}catch(e){closeSheet();toast(X('Not enough space on this phone for this photo.','لا توجد مساحة كافية لهذه الصورة.'));return}
 if(kind==='av'){prof().av='photo'}else{S.wp='photo';applyWp()}save();closeSheet();vib([10,30,10]);toast(X('Saved. Only you can see it.','تم الحفظ. لا يراها أحد غيرك.'));R.settings();homeAv()}
function applyWp(){let el=$('fqpWp');const k=S.wp||'none',w=WP.find(x=>x[0]===k);const img=k==='photo'&&localStorage.getItem('fq5.wpImg');
 if(k==='none'||!w||(k==='photo'&&!img)){if(el)el.remove();document.documentElement.classList.remove('fqp-haswp');return}
 if(!el){document.body.insertAdjacentHTML('afterbegin','<div id="fqpWp" aria-hidden="true"></div>');el=$('fqpWp')}
 el.className=k==='photo'?'ph2':'';el.setAttribute('style',k==='photo'?`background-image:url(${img})`:w[2]);document.documentElement.classList.add('fqp-haswp')}

/* ---- download / reset / undo ---- */
const MY_KEYS=()=>Object.keys(localStorage).filter(k=>/^fq5\./.test(k)&&!/^fq5\.(lang|liveImp|resetBak|restoreCh|newsSeen|shake|shakeAsked|pushH|qtr\.|qch\.)/.test(k));
function dlData(){const o={app:'Fastaqim',at:new Date().toISOString(),data:{}};MY_KEYS().forEach(k=>{try{o.data[k]=JSON.parse(localStorage.getItem(k))}catch(e){o.data[k]=localStorage.getItem(k)}});
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(o,null,1)],{type:'application/json'}));a.download='fastaqim-my-data-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);toast(X('Your data file is ready.','ملف بياناتك جاهز.'))}
function resetSheet(){const u=window.FQA&&FQA.user();
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Reset everything?','إعادة ضبط كل شيء؟')}</h1>${XB}</div>
 <div class="kh fqp-rs"><p>${X('This clears your ticks, stars, streaks, tasks, khatmah, dhikr counts, place and settings, so Fastaqim starts fresh.','يمسح هذا علاماتك ونجومك وسلاسلك ومهامك وختمتك وعدّاد الذكر وموقعك وإعداداتك، لتبدأ فستقم من جديد.')}</p>
 <ul><li>${u?X('Also cleared from your account on every device.','ويُمسح أيضًا من حسابك على كل الأجهزة.'):X('Only on this phone.','على هذا الهاتف فقط.')}</li><li>${X('You can undo it in Settings for 30 days.','يمكنك التراجع من الإعدادات خلال ٣٠ يومًا.')}</li><li>${X('Your language and sign-in stay.','تبقى لغتك وتسجيل دخولك.')}</li></ul></div>
 <button class="dang fqp-reset" id="fqpRsGo">${X('Yes, reset everything','نعم، أعد ضبط كل شيء')}</button><button class="fqp-cancel" data-x>${X('Keep my data','أبقِ بياناتي')}</button>`);
 $('fqpRsGo').onclick=doReset}
async function doReset(){const b=$('fqpRsGo');b.disabled=true;const data={};MY_KEYS().forEach(k=>data[k]=localStorage.getItem(k));
 if(!ls.set('fq5.resetBak',{at:Date.now(),until:Date.now()+30*864e5,data})){dlData();toast(X('A copy of your data was downloaded first.','تم تنزيل نسخة من بياناتك أولًا.'))}
 MY_KEYS().forEach(k=>localStorage.removeItem(k));
 try{for(const k in S)delete S[k];Object.assign(S,{salah:{},stars:0,starLog:{},tasks:[],done:[],kh:[],zk:{},ci:{},resetAt:Date.now()});save();
  if(window.FQA&&FQA.user()&&typeof syPush==='function'){SY.last='';await syPush()}}catch(e){console.warn('reset',e)}
 sessionStorage.setItem('fq5.pulled','1');location.hash='#home';location.reload()}
/* restore: ask whether to keep what was added since the reset; the answer can be changed for 7 days */
const jp=v=>{try{return JSON.parse(v)}catch(e){return v}};
const isO=v=>v&&typeof v==='object'&&!Array.isArray(v);
const idOf=x=>isO(x)?(x.id!=null?'i'+x.id:x.k!=null?'k'+x.k:JSON.stringify(x)):JSON.stringify(x);
function mAdd(base,add,top){if(isO(base)&&isO(add)){const o=Object.assign({},base);for(const k in add){if(k==='_at')continue;if(top&&k==='stars'&&typeof add[k]==='number'){o[k]=(base[k]||0)+add[k];continue}o[k]=k in base?mAdd(base[k],add[k],false):add[k]}return o}
 if(Array.isArray(base)&&Array.isArray(add)){const have=new Set(base.map(idOf));return base.concat(add.filter(x=>!have.has(idOf(x))))}return base}
function mSub(cur,add,pre,top){if(isO(cur)&&isO(add)){const o=Object.assign({},cur);for(const k in add){if(k==='_at'||!(k in o))continue;if(top&&k==='stars'&&typeof add[k]==='number'){o[k]=Math.max(0,(o[k]||0)-add[k]);continue}
  if(!pre||!isO(pre)||!(k in pre))delete o[k];else o[k]=mSub(o[k],add[k],pre[k],false)}return o}
 if(Array.isArray(cur)&&Array.isArray(add)){const p=new Set((Array.isArray(pre)?pre:[]).map(idOf)),rm=new Set(add.map(idOf).filter(i=>!p.has(i)));return cur.filter(x=>!rm.has(idOf(x)))}return cur}
const mapAll=(a,b,f)=>{const o={},ks=new Set([...Object.keys(a||{}),...Object.keys(b||{})]);ks.forEach(k=>{const x=(a||{})[k],y=(b||{})[k];o[k]=x==null?y:y==null?x:f(k,x,y)});return o};
function writeKeys(d){MY_KEYS().forEach(k=>localStorage.removeItem(k));for(const k in d)if(d[k]!=null)try{localStorage.setItem(k,d[k])}catch(e){}}
async function finishRestore(msg){try{const st=JSON.parse(localStorage.getItem('fq5.state')||'{}');for(const k in S)delete S[k];Object.assign(S,st);save();if(window.FQA&&FQA.user()&&typeof syPush==='function'){SY.last='';await syPush()}}catch(e){}
 sessionStorage.setItem('fq5.pulled','1');toast(msg);setTimeout(()=>location.reload(),600)}
function undoReset(){const bak=ls.get('fq5.resetBak',null);if(!bak)return;const since=new Date(bak.at).toLocaleDateString(L==='ar'?'ar':'en-US',{day:'numeric',month:'long'});
 const now={};MY_KEYS().forEach(k=>now[k]=localStorage.getItem(k));const st=jp(now['fq5.state']||'{}');
 const added=Object.keys(st).some(k=>!['_at','resetAt','salah','stars','starLog','tasks','done','kh','zk','ci'].includes(k))||Object.keys(st.salah||{}).length||Object.keys(st.ci||{}).length||(st.tasks||[]).length||(st.stars||0)>0||Object.keys(st.zk||{}).length;
 if(!added){doRestore(bak,now,false);return}
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Bring your data back','استعادة بياناتك')}</h1>${XB}</div>
 <div class="kh"><p class="fqp-pn">${X('You also used Fastaqim since the reset on '+since+'. Do you want to keep what you added from then until today?','استخدمت فستقم أيضًا منذ إعادة الضبط في '+since+'. هل تريد إبقاء ما أضفته من ذلك اليوم حتى اليوم؟')}</p>
 <p class="fqp-pn fqp-sm">${X('You can change this answer for 7 days in Settings.','يمكنك تغيير هذا الجواب خلال ٧ أيام من الإعدادات.')}</p></div>
 <button class="big" id="fqpRsM">${X('Yes, keep both','نعم، أبقِ الاثنين')}</button><button class="fqp-cancel" id="fqpRsO" style="margin-top:8px">${X('No, only my old data','لا، بياناتي القديمة فقط')}</button>`);
 $('fqpRsM').onclick=()=>doRestore(bak,now,true);$('fqpRsO').onclick=()=>doRestore(bak,now,false)}
function combine(pre,post){return mapAll(pre,post,(k,x,y)=>{const a=jp(x),b=jp(y);if(isO(a)||Array.isArray(a)){return JSON.stringify(k==='fq5.state'?Object.assign(mAdd(a,b,true),{_at:Date.now()}):mAdd(a,b,false))}return x})}
function doRestore(bak,post,keep){closeSheet();writeKeys(keep?combine(bak.data,post):bak.data);localStorage.removeItem('fq5.resetBak');
 ls.set('fq5.restoreCh',{until:Date.now()+7*864e5,at:bak.at,keep,pre:bak.data,post});finishRestore(X('Your data is back.','عادت بياناتك.'))}
function changeRestore(){const rc=ls.get('fq5.restoreCh',null);if(!rc)return;const since=new Date(rc.at).toLocaleDateString(L==='ar'?'ar':'en-US',{day:'numeric',month:'long'});
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Your restore choice','اختيار الاستعادة')}</h1>${XB}</div>
 <div class="kh"><p class="fqp-pn">${rc.keep?X('Right now you kept both: your old data and what you added after the reset on '+since+'.','حاليًا أبقيت الاثنين: بياناتك القديمة وما أضفته بعد إعادة الضبط في '+since+'.'):X('Right now you kept only your old data, without what you added after the reset on '+since+'.','حاليًا أبقيت بياناتك القديمة فقط، بدون ما أضفته بعد إعادة الضبط في '+since+'.')}</p></div>
 <button class="big" id="fqpRcGo">${rc.keep?X('Remove what I added after the reset','أزل ما أضفته بعد إعادة الضبط'):X('Add back what I added after the reset','أعد ما أضفته بعد إعادة الضبط')}</button><button class="fqp-cancel" data-x style="margin-top:8px">${X('Keep it as it is','أبقِه كما هو')}</button>`);
 $('fqpRcGo').onclick=()=>{const cur={};MY_KEYS().forEach(k=>cur[k]=localStorage.getItem(k));let out;
  if(rc.keep){out=mapAll(cur,rc.post,(k,x,y)=>{const a=jp(x),b=jp(y),p=jp((rc.pre||{})[k]);return (isO(a)||Array.isArray(a))?JSON.stringify(k==='fq5.state'?Object.assign(mSub(a,b,p,true),{_at:Date.now()}):mSub(a,b,p,false)):x});
   for(const k in rc.post)if(!(k in (rc.pre||{}))&&out[k]===rc.post[k])delete out[k]}
  else out=combine(cur,rc.post);
  closeSheet();writeKeys(out);rc.keep=!rc.keep;ls.set('fq5.restoreCh',rc);finishRestore(X('Done. Your data is updated.','تم. حُدّثت بياناتك.'))}}
{const rc=ls.get('fq5.restoreCh',null);if(rc&&rc.until<Date.now())localStorage.removeItem('fq5.restoreCh')}

/* ---- delete account: signed out now, removed for good after 30 days; signing in again within 30 days can keep it ---- */
async function delStatus(){try{const sb=await FQA.sb(),u=FQA.user();if(!u)return null;const {data}=await sb.from('fastaqim_state').select('state').eq('user_id',u.id).maybeSingle();const d=data&&data.state&&data.state.deletedAt;return d?+d:null}catch(e){return null}}
function delSheet(){const u=window.FQA&&FQA.user();if(!u){acctSheet();return}
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Delete your account?','حذف حسابك؟')}</h1>${XB}</div>
 <div class="kh fqp-rs"><ul><li>${X('You will be signed out on every device and reminders stop.','سيتم تسجيل خروجك من كل الأجهزة وتتوقف التذكيرات.')}</li><li>${X('After 30 days your account and everything in it are removed for good.','بعد ٣٠ يومًا يُحذف حسابك وكل ما فيه نهائيًا.')}</li><li>${X('Changed your mind? Sign in again within 30 days and tap Keep my account.','غيّرت رأيك؟ سجّل الدخول خلال ٣٠ يومًا واضغط «أبقِ حسابي».')}</li></ul></div>
 <button class="dang fqp-reset" id="fqpDelAcc">${X('Delete my account','احذف حسابي')}</button><button class="fqp-cancel" data-x>${X('Keep my account','أبقِ حسابي')}</button><p class="fqa-m" id="fqpDelM"></p>`);
 $('fqpDelAcc').onclick=async()=>{const b=$('fqpDelAcc');b.disabled=true;try{const sb=await FQA.sb(),u2=FQA.user();const {data,error}=await sb.from('fastaqim_state').select('state').eq('user_id',u2.id).maybeSingle();if(error)throw error;
   const st=Object.assign({},(data&&data.state)||{},{deletedAt:Date.now()});const r=data?await sb.from('fastaqim_state').update({state:st}).eq('user_id',u2.id):await sb.from('fastaqim_state').insert({user_id:u2.id,state:st});if(r.error)throw r.error;
   try{await sb.from('push_queue').delete().eq('user_id',u2.id).eq('sent',false)}catch(e){}try{await sb.from('push_subs').delete().eq('user_id',u2.id)}catch(e){}
   S.pushOn=0;save();await FQA.signOut();closeSheet();toast(X('Your account will be deleted in 30 days.','سيُحذف حسابك بعد ٣٠ يومًا.'));R.settings()}
  catch(e){b.disabled=false;$('fqpDelM').textContent=T("Couldn't send. Check your internet and try again.",'تعذّر الإرسال. تحقق من الإنترنت وحاول مجددًا.')}}}
async function delCheck(){const d=await delStatus();if(!d)return;const end=new Date(d+30*864e5).toLocaleDateString(L==='ar'?'ar':'en-US',{day:'numeric',month:'long'});
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Keep your account?','إبقاء حسابك؟')}</h1>${XB}</div>
 <div class="kh"><p class="fqp-pn">${X('Your account is set to be deleted on '+end+'. Do you want to keep it?','حسابك سيُحذف في '+end+'. هل تريد إبقاءه؟')}</p></div>
 <button class="big" id="fqpKeepAcc">${X('Keep my account','أبقِ حسابي')}</button><button class="fqp-cancel" id="fqpStillDel" style="margin-top:8px">${X('No, delete it','لا، احذفه')}</button>`);
 $('fqpKeepAcc').onclick=async()=>{try{const sb=await FQA.sb(),u=FQA.user();const {data}=await sb.from('fastaqim_state').select('state').eq('user_id',u.id).maybeSingle();const st=Object.assign({},(data&&data.state)||{});delete st.deletedAt;const r=await sb.from('fastaqim_state').update({state:st}).eq('user_id',u.id);if(r.error)throw r.error;closeSheet();vib([10,30,10]);toast(X('Your account is kept.','تم إبقاء حسابك.'))}catch(e){toast(T("Couldn't send. Check your internet and try again.",'تعذّر الإرسال. تحقق من الإنترنت وحاول مجددًا.'))}};
 $('fqpStillDel').onclick=async()=>{await FQA.signOut();closeSheet();toast(X('Signed out. Your account will be deleted on '+end+'.','تم تسجيل الخروج. سيُحذف حسابك في '+end+'.'))}}
if(window.FQA){let last=null;FQA.on(u=>{const id=u&&u.id;if(id&&id!==last)setTimeout(delCheck,1200);last=id})}

{const bak=ls.get('fq5.resetBak',null);if(bak&&bak.until<Date.now())localStorage.removeItem('fq5.resetBak')}

/* ================= Report a problem: screenshot + shake ================= */
const OLD_FB=window.fbSheet;
let H2C=null;
const H2C_SRC=(document.currentScript&&document.currentScript.src||'fq-plus.js').replace(/fq-plus\.js.*$/,'')+'vendor/h2c.min.js';
function h2cLoad(){if(window.html2canvas)return Promise.resolve();if(H2C)return H2C;H2C=new Promise((ok,no)=>{const s=document.createElement('script');s.src=H2C_SRC;s.onload=ok;s.onerror=()=>{H2C=null;no()};document.head.appendChild(s)});return H2C}
async function snap(){await h2cLoad();const W=innerWidth,H=innerHeight;
 const c=await html2canvas(document.body,{x:scrollX,y:scrollY,width:W,height:H,windowWidth:W,windowHeight:H,scale:Math.min(2,devicePixelRatio||1),useCORS:true,logging:false,backgroundColor:getComputedStyle(document.body).backgroundColor||'#fbf9f4',
  ignoreElements:el=>el.id==='toast'||el.id==='utoast'||el.id==='scrim'||el.id==='sh'||el.classList&&el.classList.contains('fqp-flash')});
 let cv=c;if(c.width>900){cv=document.createElement('canvas');cv.width=900;cv.height=Math.round(c.height*900/c.width);cv.getContext('2d').drawImage(c,0,0,cv.width,cv.height)}
 let q=.8,d=cv.toDataURL('image/jpeg',q);while(d.length>560000&&q>.3){q-=.1;d=cv.toDataURL('image/jpeg',q)}return d.length<=600000?d:null}
const SCR_NAMES=()=>({home:X('Home','الرئيسية'),quran:X("Qur'an",'القرآن'),index:X('All surahs','كل السور'),read:X("Qur'an reader",'قارئ القرآن'),dhikr:X('Dhikr','الذكر'),todo:X('To-do','المهام'),more:X('More','المزيد'),notif:X('Notifications','الإشعارات'),cal:X('Calendar','التقويم'),tools:X('Tools','الأدوات'),tool:X('Tool','أداة'),stars:X('Stars','النجوم'),qibla:X('Qibla','القبلة'),settings:X('Settings','الإعدادات'),guide:X("Today's path guide",'دليل طريق اليوم'),news:X("What's new",'ما الجديد'),team:X('Team','الفريق'),apv:X('Approvals','الموافقات'),log:X('Change log','سجل التغييرات')});
const curScr=()=>{if($('zr')&&$('zr').classList.contains('on'))return 'adhkar';const c=$$('.scr.on')[0];return c?c.id.slice(2):'home'};
let lastScr='home';{const g=window.go;window.go=go=function(s){const c=curScr();if(!['settings','more'].includes(c))lastScr=c;return g.apply(this,arguments)}}
function flash(){const f=document.createElement('div');f.className='fqp-flash';document.body.appendChild(f);setTimeout(()=>f.remove(),450)}
let RP={shot:null,where:'',busy:false};
async function reportSheet(shot,where){RP={shot:shot||null,where:where||curScr(),busy:false};const nm=SCR_NAMES();
 const shotBox=()=>RP.shot?`<div class="fqp-shot"><img src="${RP.shot}" alt=""><span><b>${X('Screenshot added','أُضيفت صورة الشاشة')}</b><small>${esc(nm[RP.where]||RP.where)}</small><button id="fqpShX">${X('Remove','إزالة')}</button></span></div>`
  :`<button class="fqp-addshot" id="fqpShA"><i class="ph ph-camera"></i><span><b>${X('Add a picture of a screen','أضف صورة شاشة')}</b><small>${esc(X('Takes you to ','ينقلك إلى ')+(nm[lastScr]||X('Home','الرئيسية'))+X(' for a second','لثانية'))}</small></span></button>`;
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Report a problem','الإبلاغ عن مشكلة','Rakkoo gabaasi','Soo sheeg dhibaato')}</h1>${XB}</div>
 <p class="note">${X('Tell us what happened. We read every message.','أخبرنا بما حدث. نقرأ كل رسالة.')}</p>
 <div id="fqpShB">${shotBox()}</div>
 <textarea id="fbT" class="inp fbt" rows="4" maxlength="1800" placeholder="${esc(X('What went wrong?','ما الذي حدث؟'))}"></textarea>
 <label class="fbi"><input type="checkbox" id="fbI" checked><span>${X('Include device details (phone type, screen size)','أرفق معلومات الجهاز (نوع الهاتف، حجم الشاشة)')}</span></label>
 <button class="big" id="fbS">${X('Send','إرسال')}</button><p class="fqa-m" id="fbM"></p>`);
 const wire=()=>{const x=$('fqpShX');if(x)x.onclick=()=>{RP.shot=null;$('fqpShB').innerHTML=shotBox();wire()};
  const a=$('fqpShA');if(a)a.onclick=async()=>{const txt=$('fbT').value,back=curScr();closeSheet();const tgt=lastScr&&$('s-'+lastScr)?lastScr:'home';go(tgt,false);await new Promise(r=>setTimeout(r,450));let s=null;try{s=await snap()}catch(e){}flash();go(back,false);reportSheet(s,tgt);$('fbT').value=txt}};wire();
 $('fbS').onclick=async()=>{const body=$('fbT').value.trim(),M=$('fbM'),btn=$('fbS');if(body.length<3&&!RP.shot){M.textContent=X('Please write a few words first.','اكتب بضع كلمات أولًا.');return}
  btn.disabled=true;M.textContent=X('Sending…','جارٍ الإرسال…');let txt=(body||X('(picture only)','(صورة فقط)'))+'\n\n['+'#'+RP.where;
  if($('fbI').checked)txt+=' · '+navigator.userAgent+' · '+innerWidth+'x'+innerHeight+((navigator.standalone||matchMedia('(display-mode: standalone)').matches)?' · Home Screen':'');txt+=' · v6 · '+LX+']';
  try{const sb=await FQA.sb(),u=FQA.user(),row=u?{user_id:u.id,email:u.email||'',name:S.name||'',kind:'problem',body:txt.slice(0,2000),lang:LX,area:String(RP.where).slice(0,20)}:{name:'visitor',kind:'problem',body:txt.slice(0,2000),lang:LX,area:String(RP.where).slice(0,20)};
   if(RP.shot)row.shot=RP.shot;let {error}=await sb.from('fastaqim_feedback').insert(row);
   if(error&&row.shot){delete row.shot;row.body=(row.body+' (screenshot too large)').slice(0,2000);({error}=await sb.from('fastaqim_feedback').insert(row))}
   if(error)throw error;closeSheet();vib([10,30,10]);toast(X('Sent. Thank you!','أُرسلت. شكرًا لك!'))}
  catch(e){console.warn('report',e);btn.disabled=false;M.textContent=X("Couldn't send. Check your internet and try again.",'تعذّر الإرسال. تحقق من الإنترنت وحاول مجددًا.')}}}
window.fbSheet=fbSheet=function(kind){if(kind==='problem')return reportSheet(null,lastScr);return OLD_FB.apply(this,arguments)};
async function shakeReport(){if($('sh')&&$('sh').classList.contains('on'))return;const where=curScr();let s=null;try{s=await snap()}catch(e){console.warn('snap',e)}flash();vib([12,40,12]);reportSheet(s,where)}
window.fqReport=shakeReport;
/* shake: on iPhone the motion permission is asked once (from the Settings switch or the first tap) */
const needAsk=typeof DeviceMotionEvent!=='undefined'&&typeof DeviceMotionEvent.requestPermission==='function';
function shakeOn(){const v=ls.get('fq5.shake',null);return v===null?true:!!v}
async function shakeAsk(){if(!needAsk)return true;try{return (await DeviceMotionEvent.requestPermission())==='granted'}catch(e){return false}}
let shk={armed:false,t:0,n:0,last:0};
function onMotion(e){const a=e.accelerationIncludingGravity;if(!a)return;const m=Math.hypot(a.x||0,a.y||0,a.z||0),now=Date.now();
 if(m>24){if(now-shk.t>900)shk.n=0;shk.n++;shk.t=now;if(shk.n>=3&&now-shk.last>4000){shk.last=now;shk.n=0;shakeReport()}}}
function shakeArm(){const on=shakeOn();if(on&&!shk.armed){addEventListener('devicemotion',onMotion);shk.armed=true}else if(!on&&shk.armed){removeEventListener('devicemotion',onMotion);shk.armed=false}}
shakeArm();
setTimeout(()=>{if(shakeOn())h2cLoad().catch(()=>{})},4000);
if(needAsk&&shakeOn()&&!ls.get('fq5.shakeAsked',0)){const once=async()=>{removeEventListener('touchend',once,true);ls.set('fq5.shakeAsked',1);try{await DeviceMotionEvent.requestPermission()}catch(e){}};addEventListener('touchend',once,true)}

/* ================= Today's path guide ================= */
const SN=(c,n)=>`https://sunnah.com/${c}:${n}`;
const src=(label,url)=>`<a class="fqp-src" href="${url}" target="_blank" rel="noopener">${esc(label)} <i class="ph ph-arrow-square-out"></i></a>`;
addScreen('guide',`<div class="hd sub">${BACK}<h1>${X("Today's path",'طريق اليوم','Karaa har’aa','Jidka maanta')}</h1><span style="width:44px"></span></div><div id="fqpGd"></div>`,'home');
R.guide=()=>{const G=[
 ['f:fajr',X('5 salah','الصلوات الخمس'),X('Fajr, Dhuhr, Asr, Maghrib and Isha. Tap “I prayed” on the salah card, or the circle on the line, after you pray each one.','الفجر والظهر والعصر والمغرب والعشاء. اضغط «صلّيت» في بطاقة الصلاة بعد أداء كل صلاة.'),X('Each at its own time. The card on Home shows the next one.','كلٌّ في وقته، وبطاقة الرئيسية تُظهر الصلاة القادمة.'),
  src(X('The deed most loved by Allah: salah at its time · Bukhari 527','أحب الأعمال إلى الله: الصلاة على وقتها · البخاري ٥٢٧'),SN('bukhari',527))],
 ['f:quran',X('Ayat al-Kursi after salah','آية الكرسي بعد الصلاة'),X("The greatest ayah of the Qur'an (Al-Baqarah 2:255). Read it once after each obligatory salah.",'أعظم آية في القرآن (البقرة ٢٥٥). اقرأها مرة بعد كل صلاة مكتوبة.'),X('Right after each of the 5 salah.','بعد كل صلاة من الخمس.'),
  src(X('The greatest ayah · Muslim 810','أعظم آية · مسلم ٨١٠'),SN('muslim',810))+`<span class="fqp-src">${X("After every obligatory salah: an-Nasa'i, al-Kubra 9848 (sahih)",'دبر كل صلاة مكتوبة: النسائي في الكبرى ٩٨٤٨ (صحيح)')}</span>`+src(X("Qur'an, Surah Al-Baqarah 2:255",'القرآن، سورة البقرة ٢:٢٥٥'),'https://quran.com/2/255')],
 ['ph-sun-horizon',X('Morning adhkar','أذكار الصباح'),X('Short remembrances said each morning. Open them from Dhikr; each one shows how many times.','أذكار قصيرة تُقال كل صباح. افتحها من الذكر، وكل ذكر يُظهر عدده.'),X('After Fajr, before the sun is high.','بعد الفجر قبل ارتفاع الشمس.'),
  src(X("Qur'an, Surah Qaf 50:39 · before the rising of the sun",'القرآن، سورة ق ٥٠:٣٩ · قبل طلوع الشمس'),'https://quran.com/50/39')],
 ['ph-sun-dim',X('Evening adhkar','أذكار المساء'),X('The evening set of the same remembrances.','أذكار المساء بنفس الطريقة.'),X('After Asr, before Maghrib.','بعد العصر قبل المغرب.'),
  src(X("Qur'an, Surah Qaf 50:39 · and before its setting",'القرآن، سورة ق ٥٠:٣٩ · وقبل الغروب'),'https://quran.com/50/39')],
 ['ph-sun',X('Duha','الضحى'),X('A voluntary prayer of at least 2 rak‘ahs in the forenoon. It counts as charity for every joint of the body.','صلاة نافلة ركعتان على الأقل في الضحى، وتجزئ عن الصدقة عن كل مفصل.'),X('After the sun has fully risen until shortly before Dhuhr. Best when the day gets hot.','بعد ارتفاع الشمس إلى قبيل الظهر، وأفضلها حين يشتد الحر.'),
  src(X('Two rak‘ahs of Duha are enough · Muslim 720','تجزئ ركعتان من الضحى · مسلم ٧٢٠'),SN('muslim',720))+src(X('Best when the day gets hot · Muslim 748a','أفضلها حين ترمض الفصال · مسلم ٧٤٨'),SN('muslim','748a'))],
 ['ph-hourglass-medium',X('Witr','الوتر'),X('An odd number of rak‘ahs (1, 3, 5…) and the last prayer of your night. It is not prayed during the day.','صلاة بعدد فردي من الركعات (١، ٣، ٥…) وهي آخر صلاة الليل، ولا تُصلّى في النهار.'),
  X('Only after Isha, and before Fajr begins. If you may not wake up, pray it before you sleep. If you will wake up, the end of the night is better.','بعد العشاء فقط وقبل دخول الفجر. إن خشيت ألا تقوم فأوتر قبل النوم، وإن كنت ستقوم فآخر الليل أفضل.'),
  src(X('Make Witr your last prayer at night · Bukhari 998','اجعلوا آخر صلاتكم بالليل وترًا · البخاري ٩٩٨'),SN('bukhari',998))+src(X('Pray Witr before the morning · Muslim 754','أوتروا قبل أن تصبحوا · مسلم ٧٥٤'),SN('muslim',754))+src(X('Afraid you won’t wake up? Pray it early · Muslim 755a','من خاف ألا يقوم فليوتر أوله · مسلم ٧٥٥'),SN('muslim','755a'))+src(X('He prayed Witr in every part of the night · Bukhari 996','أوتر من كل الليل · البخاري ٩٩٦'),SN('bukhari',996))],
 ['ph-bed',X('Before-sleep adhkar','أذكار النوم'),X('Ayat al-Kursi, the last two ayat of Al-Baqarah and the sleep du‘as. Both have audio.','آية الكرسي وخواتيم البقرة وأدعية النوم، ولكلها صوت.'),X('In bed, before you sleep.','في الفراش قبل النوم.'),
  src(X('The last two ayat of Al-Baqarah at night suffice you · Bukhari 5009','الآيتان من آخر البقرة كفتاه · البخاري ٥٠٠٩'),SN('bukhari',5009))]];
 $('fqpGd').innerHTML=`<div class="kh fqp-howto"><p><b>${X('How it works','كيف يعمل')}</b></p><p>${X('Tap an item when you have done it. Tap again to undo. Each real tick gives +1 star; nothing is ever ticked for you.','اضغط على العنصر بعد أدائه، واضغط مرة أخرى للتراجع. كل علامة حقيقية تعطي نجمة، ولا يُعلَّم شيء نيابةً عنك.')}</p></div>`+
 G.map(([ic,t,what,when,s])=>`<div class="kh fqp-gi"><div class="fqp-gh"><span class="ic c-a">${ic.startsWith('f:')?FQI(ic.slice(2)):`<i class="ph ${ic}"></i>`}</span><h3>${t}</h3></div><p>${what}</p><p class="fqp-when"><i class="ph ph-clock"></i><span><b>${X('When','متى')}</b> ${when}</span></p><div class="fqp-srcs">${s}</div></div>`).join('')+
 ''};
/* the ? on Today's path */
{const rc=window.renderCI;if(typeof rc==='function'){window.renderCI=renderCI=function(){const r=rc.apply(this,arguments);try{pathQ()}catch(e){}return r}}}
function pathQ(){const ci=$('ci');if(!ci||$('fqpQ'))return;const h=$('ciH');if(!h)return;h.insertAdjacentHTML('afterend',`<button class="fqp-q" id="fqpQ" aria-label="${esc(X("What is each item?",'ما معنى كل عنصر؟'))}"><i class="ph ph-question"></i></button>`);$('fqpQ').onclick=e=>{e.stopPropagation();go('guide')}}

/* ================= Ayat al-Kursi (and other Qur'an items) audio in the adhkar reader ================= */
let qA=null,qKey='',qQ=[];
function qBtn(){if(typeof ZS!=='object'||!ZS)return;const top=document.querySelector('#zCard .top');if(!top)return;const old=$('zQa');if(old)old.remove();
 if($('zHa'))return;const it=(ZK[ZS.set]||{items:[]}).items[ZS.i];const ks=it&&(it._qk||it.qk);if(!ks)return;const keys=ks.filter(k=>k!=='|');if(!keys.length)return;
 const key=ZS.set+':'+ZS.i,playing=qA&&!qA.paused&&qKey===key;const b=document.createElement('button');b.id='zQa';b.className='zha'+(playing?' on':'');
 b.setAttribute('aria-label',X('Listen','استمع','Dhaggeeffadhu','Dhageyso'));b.innerHTML=`<i class="ph-fill ${playing?'ph-pause':'ph-play'}"></i><span>${esc(X('Listen','استمع','Dhaggeeffadhu','Dhageyso'))}</span>`;
 b.onclick=e=>{e.stopPropagation();if(!qA){qA=new Audio();qA.preload='none';qA.onplay=qA.onpause=()=>qBtn();qA.onended=()=>{if(qQ.length){qA.src=aUrl(qQ.shift());qA.play().catch(()=>{})}else qBtn()}}
  if(qKey===key&&!qA.paused){qA.pause();return}
  if(qKey!==key||qA.ended||!qA.src){qQ=keys.slice(1);qA.src=aUrl(keys[0]);qKey=key}try{AU.pause()}catch(_){}
  qA.play().catch(()=>toast(X('Audio could not play','تعذّر تشغيل الصوت','Sagaleen hin taphanne','Codka lama shidi karin')))};
 top.appendChild(b)}
{const oz=window.zDraw;if(typeof oz==='function')window.zDraw=zDraw=function(){const r=oz.apply(this,arguments);try{qBtn()}catch(e){}return r}}
{const oc=window.zClose;if(typeof oc==='function')window.zClose=zClose=function(){if(qA)qA.pause();return oc.apply(this,arguments)}}
{const zx=$('zrX');if(zx)zx.onclick=()=>window.zClose()}

/* ================= Qur'an reader: word-by-word highlight + word meanings ================= */
const WT={};const WM={};let wCur=null;
async function wTimes(su){if(WT[su]!==undefined)return WT[su];WT[su]=null;try{const r=await fetch(ROOT+'data/wbw/ghamdi/'+String(su).padStart(3,'0')+'.json');if(r.ok)WT[su]=await r.json()}catch(e){}return WT[su]}
function wrapWords(){$$('#rdB .rar:not([data-w])').forEach(p=>{const ra=p.closest('.ra');if(!ra)return;const t=p.textContent.trim().split(/\s+/);const num=t.pop();
 p.innerHTML=t.map((w,i)=>`<span class="w" data-i="${i+1}">${w}</span>`).join(' ')+' '+num;p.dataset.w=t.length})}
{const od=window.rdDraw;if(typeof od==='function')window.rdDraw=rdDraw=async function(){const r=await od.apply(this,arguments);try{wrapWords();wTimes(RD.su);rdBar()}catch(e){}return r}}
function wTick(){const m=String(AU.src||'').match(/(\d{3})(\d{3})\.mp3/);if(!m||!$('s-read').classList.contains('on'))return wClear();const su=+m[1],n=+m[2];if(su!==RQ.su)return wClear();
 const tm=WT[su]&&WT[su][n];const p=document.querySelector('#a'+n+' .rar');if(!tm||!p)return wClear();if(+p.dataset.w!==Math.max(...tm.map(x=>x[0])))return wClear();
 const ms=AU.currentTime*1000;let w=0;for(const x of tm){if(ms>=x[1]&&ms<x[2]){w=x[0];break}}const el=w?p.querySelector('.w[data-i="'+w+'"]'):null;if(el===wCur)return;wClear();if(el){el.classList.add('on');wCur=el}}
function wClear(){if(wCur){wCur.classList.remove('on');wCur=null}}
let wRaf=0;function wLoop(){cancelAnimationFrame(wRaf);const f=()=>{wTick();if(!AU.paused)wRaf=requestAnimationFrame(f)};f()}
AU.addEventListener('play',wLoop);AU.addEventListener('playing',wLoop);AU.addEventListener('pause',()=>{cancelAnimationFrame(wRaf)});AU.addEventListener('ended',wClear);AU.addEventListener('loadedmetadata',()=>{const m=String(AU.src).match(/(\d{3})\d{3}\.mp3/);if(m)wTimes(+m[1])});
/* tap a word for its meaning (Quran.com word-by-word, English; kept on this phone after the first load) */
async function wMeans(su){if(WM[su])return WM[su];const ck='fq5.wbw.'+su;try{const c=JSON.parse(sessionStorage.getItem(ck)||'null');if(c)return WM[su]=c}catch(e){}
 const out={};let page=1,pages=1;do{const r=await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${su}?words=true&word_fields=text_uthmani&word_translation_language=en&per_page=50&page=${page}`);if(!r.ok)throw new Error('wbw');const j=await r.json();
  (j.verses||[]).forEach(v=>{out[v.verse_number]=(v.words||[]).filter(w=>w.char_type_name==='word').map(w=>[w.text_uthmani||w.text||'',(w.translation&&w.translation.text)||'',(w.transliteration&&w.transliteration.text)||''])});pages=(j.pagination&&j.pagination.total_pages)||1;page++}while(page<=pages);
 WM[su]=out;try{sessionStorage.setItem(ck,JSON.stringify(out))}catch(e){}return out}
$('rdB').addEventListener('click',async e=>{const w=e.target.closest('.rar .w');if(!w||rdOpt().wm===0)return;e.stopPropagation();const ra=w.closest('.ra'),n=+ra.dataset.n,i=+w.dataset.i,su=RD.su;
 $$('#rdB .w.tap').forEach(x=>x.classList.remove('tap'));w.classList.add('tap');let box=ra.querySelector('.fqp-wm');if(!box){ra.querySelector('.rar').insertAdjacentHTML('afterend','<div class="fqp-wm"></div>');box=ra.querySelector('.fqp-wm')}
 $$('#rdB .fqp-wm').forEach(b=>{if(b!==box)b.remove()});box.innerHTML=`<span class="ld">${T('Loading…','جارٍ التحميل…')}</span>`;
 try{const m=await wMeans(su),ws=m[n]||[];const cnt=+ra.querySelector('.rar').dataset.w;const x=ws.length===cnt?ws[i-1]:null;
  const pl=`<a class="pl" data-wpl="1"><i class="ph-fill ph-play"></i>${T('Play from here','شغّل من هنا')}</a>`;
  box.innerHTML=(x?`<b lang="ar" dir="rtl">${esc(x[0])}</b>${x[2]?`<i>${esc(x[2])}</i>`:''}<span>${esc(x[1])}</span>`:`<span>${X('Meaning for this word is not available yet.','معنى هذه الكلمة غير متوفر بعد.')}</span>`)+pl+`<button aria-label="${esc(X('Close','إغلاق'))}"><i class="ph ph-x"></i></button>`}
 catch(er){box.innerHTML=`<span>${X("Couldn't load word meanings. Check your internet.",'تعذّر تحميل معاني الكلمات. تحقق من الإنترنت.')}</span><button aria-label="Close"><i class="ph ph-x"></i></button>`}
 const c=box.querySelector('button');if(c)c.onclick=ev=>{ev.stopPropagation();box.remove();w.classList.remove('tap')};
 const p2=box.querySelector('[data-wpl]');if(p2)p2.onclick=ev=>{ev.stopPropagation();const ks=[];for(let k=n;k<=SU[su-1][2];k++)ks.push(su+':'+k);playAyat(ks,suName(su)+' '+AR(su)+':'+AR(n))}},true);
const rdOpt=()=>{const o=S.rd=S.rd||{sz:1,me:1};if(o.wm===undefined)o.wm=L==='ar'?0:1;return o};
/* a clear Meaning switch at the top of the reader, for people who need the translation */
function rdBar(){if(L==='ar'){const o=$('fqpRb');if(o)o.remove();return}const B=$('rdB');let bar=$('fqpRb');const o=rdOpt();
 if(!bar){B.insertAdjacentHTML('beforebegin','<div class="fqp-rb" id="fqpRb"></div>');bar=$('fqpRb')}
 bar.innerHTML=`<button class="${o.me?'on':''}" id="fqpRbM" aria-pressed="${!!o.me}"><i class="ph ph-translate"></i>${X('Meaning','المعنى','Hiika','Macnaha')}</button><button class="${o.wm?'on':''}" id="fqpRbW" aria-pressed="${!!o.wm}"><i class="ph ph-hand-tap"></i>${X('Tap a word','اضغط كلمة','Jecha tuqi','Taabo eray')}</button>`;
 $('fqpRbM').onclick=()=>{o.me=o.me?0:1;save();vib(8);RQ.key='';rdDraw()};
 $('fqpRbW').onclick=()=>{o.wm=o.wm?0:1;save();vib(8);rdBar();if(o.wm)toast(X('Tap any word to see its meaning.','اضغط أي كلمة لترى معناها.'));else $$('#rdB .fqp-wm').forEach(b=>b.remove())}}

/* ================= bell dot + notification wording ================= */
dotSync();
{const rn=R.notif;R.notif=function(){const r=rn.apply(this,arguments);try{const host=$('npC')||$('nGroups');if(host&&!$('fqpNewsRow')){host.insertAdjacentHTML('beforebegin',`<div class="gl" id="fqpNewsRow">${row('fqpNewsBtn','ph-gift',X("What's new",'ما الجديد','Haaraa maal','Maxaa cusub'),'')}</div>`);$('fqpNewsBtn').onclick=()=>go('news')}
  const em=document.querySelector('#fqpNewsBtn em');if(em)em.innerHTML=newsSeen()?'':`<span class="fqp-nd">${X('New','جديد','Haaraa','Cusub')}</span>`;markNews()}catch(e){}return r}}
/* the test reminder is titled with what it is, never with the site's name */
window.pushTest=pushTest=async function(){try{const sb=await FQA.sb(),u=FQA.user();const {error}=await sb.from('push_queue').insert({user_id:u.id,at:new Date(Date.now()+5000).toISOString(),title:X('Reminders are on','التذكيرات مفعّلة'),body:X('This is how your reminders will look.','هكذا ستظهر تذكيراتك.'),tag:'test',url:location.pathname.replace(/index\.html$/,'')});if(error)throw error;toast(T('A test reminder will arrive in about a minute.','سيصل تذكير تجريبي خلال دقيقة تقريبًا.'))}catch(e){toast(T("Couldn't send. Check your internet and try again.",'تعذّر الإرسال. تحقق من الإنترنت وحاول مجددًا.'))}};

/* ================= Team (owner + admin only) ================= */
addScreen('team',`<div class="hd sub">${BACK}<h1>${X('Team','الفريق')}</h1><button class="ib" id="fqpTmR" aria-label="${esc(X('Refresh','تحديث'))}"><i class="ph ph-arrows-clockwise"></i></button></div><div id="fqpTm"></div>`);
const TM={msgs:[],mem:{},me:null,poll:0,about:null,shot:null,items:null,tab:'chat',lastRead:0};
R.team=async()=>{const B=$('fqpTm');const r=await roles();if(!r.team){B.innerHTML=`<div class="qbe"><i class="ph ph-lock-simple"></i><p>${T('Only the team can open this.','هذه الصفحة للفريق فقط.')}</p></div>`;return}
 TM.me=FQA.user().id;TM.own=r.own;B.innerHTML=`<div class="seg fqp-seg" id="fqpTmT"><button data-tt="chat">${X('Chat','المحادثة')}</button><button data-tt="prev">${X('Previews','المعاينات')}</button>${r.own?`<button data-tt="mem">${X('Members','الأعضاء')}</button>`:''}</div><div id="fqpTmB"></div>`;
 $$('#fqpTmT [data-tt]').forEach(b=>b.onclick=()=>{TM.tab=b.dataset.tt;tmTab()});$('fqpTmR').onclick=()=>{vib(8);tmLoad(true)};
 try{const sb=await FQA.sb();const {data}=await sb.rpc('team_members');(data||[]).forEach(m=>TM.mem[m.user_id]=m)}catch(e){}tmTab()};
function tmTab(){$$('#fqpTmT [data-tt]').forEach(b=>b.classList.toggle('on',b.dataset.tt===TM.tab));if(TM.tab==='prev')return tmPrev();if(TM.tab==='mem')return tmMem();
 $('fqpTmB').innerHTML=`<div class="fqp-chat" id="fqpCh"><p class="rload">${T('Loading…','جارٍ التحميل…')}</p></div>
 <div class="fqp-cmp"><div id="fqpAb"></div><div class="fqp-cmpr" id="fqpCmpR"><button class="ib" id="fqpPic" aria-label="${esc(X('Add a picture','أضف صورة'))}"><i class="ph ph-image"></i></button><button class="ib fqp-idb" id="fqpIdea" aria-pressed="false" aria-label="${esc(X('Send as an idea','أرسل كفكرة'))}"><i class="ph ph-lightbulb"></i></button><textarea id="fqpMsg" rows="1" maxlength="2000" dir="auto" placeholder="${esc(X('Message','رسالة'))}"></textarea><button class="fqp-send" id="fqpSend" aria-label="${esc(X('Send','إرسال'))}"><i class="ph-fill ph-paper-plane-right flip"></i></button><button class="fqp-send fqp-mic" id="fqpMic" aria-label="${esc(X('Record a voice note','سجّل رسالة صوتية'))}"><i class="ph-fill ph-microphone"></i></button></div><div class="fqp-rec" id="fqpRec" hidden><button class="ib" id="fqpRecX" aria-label="${esc(X('Cancel','إلغاء'))}"><i class="ph ph-trash"></i></button><span class="dot"></span><b id="fqpRecT">0:00</b><span class="tx">${X('Recording…','جارٍ التسجيل…')}</span><button class="fqp-send" id="fqpRecS" aria-label="${esc(X('Send','إرسال'))}"><i class="ph-fill ph-paper-plane-right flip"></i></button></div><input type="file" id="fqpFile" accept="image/*" hidden></div>`;
 const ta=$('fqpMsg');ta.oninput=()=>{ta.style.height='auto';ta.style.height=Math.min(140,ta.scrollHeight)+'px';cmpBtns()};
 $('fqpIdea').onclick=()=>{TM.idea=!TM.idea;$('fqpIdea').classList.toggle('on',TM.idea);$('fqpIdea').setAttribute('aria-pressed',TM.idea);ta.placeholder=TM.idea?X('Write your idea','اكتب فكرتك'):X('Message','رسالة');vib(8);if(TM.idea)ta.focus()};
 $('fqpMic').onclick=recStart;$('fqpRecX').onclick=()=>recStop(false);$('fqpRecS').onclick=()=>recStop(true);
 $('fqpSend').onclick=tmSend;$('fqpPic').onclick=()=>$('fqpFile').click();$('fqpFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;TM.shot=await shrink(f);abDraw();cmpBtns()};abDraw();cmpBtns();tmLoad(true);
 clearInterval(TM.poll);TM.poll=setInterval(()=>{if(!$('s-team').classList.contains('on')||document.hidden)return;tmLoad(false)},8000)}
function abDraw(){const b=$('fqpAb');if(!b)return;b.innerHTML=(TM.about?`<div class="fqp-abt"><i class="ph ph-link-simple"></i><span>${esc(TM.about.t)}</span><button id="fqpAbX" aria-label="Remove"><i class="ph ph-x"></i></button></div>`:'')+(TM.shot?`<div class="fqp-abt"><img src="${TM.shot}" alt=""><span>${X('Picture','صورة')}</span><button id="fqpShX2" aria-label="Remove"><i class="ph ph-x"></i></button></div>`:'');
 const x=$('fqpAbX');if(x)x.onclick=()=>{TM.about=null;abDraw()};const y=$('fqpShX2');if(y)y.onclick=()=>{TM.shot=null;abDraw()}}
function shrink(file){return new Promise(ok=>{const img=new Image();img.onload=()=>{const k=Math.min(1,1000/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);let q=.8,d=c.toDataURL('image/jpeg',q);while(d.length>560000&&q>.3){q-=.1;d=c.toDataURL('image/jpeg',q)}URL.revokeObjectURL(img.src);ok(d)};img.onerror=()=>ok(null);img.src=URL.createObjectURL(file)})}
async function tmLoad(scroll){try{const sb=await FQA.sb();const {data,error}=await sb.from('fastaqim_team_chat').select('id,author,body,shot,about,created_at,kind,pinned,audio,audio_secs').order('id',{ascending:false}).limit(120);if(error)throw error;
  const msgs=(data||[]).reverse();const sig=a=>JSON.stringify(a.map(m=>m.id+(m.pinned?'p':'')));const changed=sig(msgs)!==sig(TM.msgs);TM.msgs=msgs;if(changed||scroll)tmDraw(scroll||changed);
  const top=msgs.length?msgs[msgs.length-1].id:0;if(top>TM.lastRead){TM.lastRead=top;await sb.from('fastaqim_team_reads').upsert({user_id:TM.me,last_read_id:top,at:new Date().toISOString()});teamBadge()}}
 catch(e){const c=$('fqpCh');if(c&&!TM.msgs.length)c.innerHTML=`<p class="note fqp-c">${T("Couldn't load. Check your internet and try again.",'تعذّر التحميل. تحقق من الإنترنت وحاول مجددًا.')}</p>`}}
function tmDraw(scroll){const c=$('fqpCh');if(!c)return;if(!TM.msgs.length){c.innerHTML=`<div class="fqp-empty"><i class="ph ph-chat-circle-dots"></i><p>${X('Your team chat. Messages here are only for the team.','محادثة الفريق. الرسائل هنا للفريق فقط.')}</p></div>`;return}
 let lastDay='';c.innerHTML=TM.msgs.map(m=>{const mine=m.author===TM.me,d=new Date(m.created_at),day=d.toDateString();const who=(TM.mem[m.author]||{}).name||'';
  const sep=day!==lastDay?(lastDay=day,`<p class="fqp-day">${esc(d.toLocaleDateString(L==='ar'?'ar':'en-US',{weekday:'short',day:'numeric',month:'short'}))}</p>`):'';
  const voice=m.audio?`<div class="fqp-vn" data-vn="${m.id}"><button class="pl" aria-label="${esc(X('Play','تشغيل'))}"><i class="ph-fill ph-play"></i></button><span class="bar"><i></i></span><small>${fmtS(m.audio_secs||0)}</small></div>`:'';
  return sep+`<div class="fqp-m ${mine?'me':''} ${m.kind==='idea'?'idea':''}" data-id="${m.id}">${m.pinned?`<span class="fqp-pin"><i class="ph-fill ph-push-pin"></i>${X('Pinned','مثبّتة')}</span>`:''}${!mine&&who?`<small class="who">${esc(who)}</small>`:''}${m.kind==='idea'?`<span class="il"><i class="ph-fill ph-lightbulb"></i>${X('Idea','فكرة')}</span>`:''}${m.about?`<span class="ab"><i class="ph ph-link-simple"></i>${esc(m.about)}</span>`:''}${m.shot?`<img src="${m.shot}" alt="" loading="lazy">`:''}${voice}${m.body&&!m.audio?`<p dir="auto">${esc(m.body)}</p>`:''}<time>${d.toLocaleTimeString(L==='ar'?'ar':'en-US',{hour:'numeric',minute:'2-digit'})}</time></div>`}).join('');
 const pins=TM.msgs.filter(m=>m.pinned);c.insertAdjacentHTML('afterbegin',pins.length?`<button class="fqp-pins" id="fqpPins"><i class="ph-fill ph-push-pin"></i><span><b>${X(pins.length+' pinned','مثبّتة: '+AR(pins.length))}</b><small dir="auto">${esc(pinTxt(pins[pins.length-1]))}</small></span><i class="ph ph-caret-right flip"></i></button>`:'');if($('fqpPins'))$('fqpPins').onclick=pinList;
 $$('#fqpCh [data-vn]').forEach(v=>{const m=TM.msgs.find(x=>x.id===+v.dataset.vn);v.querySelector('.pl').onclick=e=>{e.stopPropagation();vnPlay(v,m)}});
 $$('#fqpCh .fqp-m img').forEach(i=>i.onclick=()=>{openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Picture','صورة')}</h1>${XB}</div><img class="fqp-big" src="${i.src}" alt="">`)});
 $$('#fqpCh .fqp-m').forEach(el=>{let t=0,moved=false;el.addEventListener('touchstart',()=>{moved=false;t=setTimeout(()=>{if(!moved)tmAct(+el.dataset.id)},550)},{passive:true});el.addEventListener('touchmove',()=>{moved=true;clearTimeout(t)},{passive:true});el.addEventListener('touchend',()=>clearTimeout(t));el.addEventListener('contextmenu',e=>{e.preventDefault();tmAct(+el.dataset.id)})});
 if(scroll)requestAnimationFrame(()=>scrollTo(0,document.body.scrollHeight))}
function tmDel(id){openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Delete this message?','حذف هذه الرسالة؟')}</h1>${XB}</div><button class="dang fqp-reset" id="fqpDelGo">${X('Delete','حذف')}</button><button class="fqp-cancel" data-x>${X('Keep','إبقاء')}</button>`);
 $('fqpDelGo').onclick=async()=>{try{const sb=await FQA.sb();const {error}=await sb.from('fastaqim_team_chat').delete().eq('id',id);if(error)throw error;closeSheet();TM.msgs=TM.msgs.filter(m=>m.id!==id);tmDraw(false)}catch(e){toast(T("Couldn't send. Check your internet and try again.",'تعذّر الإرسال. تحقق من الإنترنت وحاول مجددًا.'))}}}
async function tmSend(){const ta=$('fqpMsg'),body=ta.value.trim(),btn=$('fqpSend');if(!body&&!TM.shot)return;btn.disabled=true;
 try{const sb=await FQA.sb();const row={body:body||null,shot:TM.shot||null,about:TM.about?TM.about.t.slice(0,120):null,kind:TM.idea&&body?'idea':'msg'};const {error}=await sb.from('fastaqim_team_chat').insert(row);if(error)throw error;
  ta.value='';ta.style.height='';TM.shot=null;TM.about=null;if(TM.idea)$('fqpIdea').click();abDraw();cmpBtns();vib(10);await tmLoad(true)}catch(e){toast(T("Couldn't send. Check your internet and try again.",'تعذّر الإرسال. تحقق من الإنترنت وحاول مجددًا.'))}btn.disabled=false}
const fmtS=n=>Math.floor(n/60)+':'+String(Math.round(n%60)).padStart(2,'0');
const pinTxt=m=>m.audio?X('Voice note','رسالة صوتية'):m.body||(m.shot?X('Picture','صورة'):'');
function cmpBtns(){const ta=$('fqpMsg');if(!ta)return;const has=!!ta.value.trim()||!!TM.shot;$('fqpSend').hidden=!has;$('fqpMic').hidden=has||!window.MediaRecorder}
function tmAct(id){const m=TM.msgs.find(x=>x.id===id);if(!m)return;const mine=m.author===TM.me;vib(10);
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Message','رسالة')}</h1>${XB}</div><div class="gl">
 <button id="fqpAPin"><span class="ic c-a"><i class="ph ph-push-pin${m.pinned?'-slash':''}"></i></span><span>${m.pinned?X('Unpin','إلغاء التثبيت'):X('Pin','تثبيت')}</span></button>
 ${m.body&&!m.audio?`<button id="fqpACopy"><span class="ic c-a"><i class="ph ph-copy"></i></span><span>${X('Copy text','نسخ النص')}</span></button>`:''}
 ${mine?`<button id="fqpADel"><span class="ic c-r"><i class="ph ph-trash"></i></span><span>${X('Delete','حذف')}</span></button>`:''}</div>`);
 $('fqpAPin').onclick=async()=>{try{const sb=await FQA.sb();const {error}=await sb.from('fastaqim_team_chat').update({pinned:!m.pinned}).eq('id',id);if(error)throw error;m.pinned=!m.pinned;closeSheet();vib(10);toast(m.pinned?X('Pinned','تم التثبيت'):X('Unpinned','أُلغي التثبيت'));tmDraw(false)}catch(e){toast(T("Couldn't send. Check your internet and try again.",'تعذّر الإرسال. تحقق من الإنترنت وحاول مجددًا.'))}};
 if($('fqpACopy'))$('fqpACopy').onclick=async()=>{try{await navigator.clipboard.writeText(m.body);toast(X('Copied','تم النسخ'))}catch(e){}closeSheet()};
 if($('fqpADel'))$('fqpADel').onclick=()=>tmDel(id)}
function pinList(){const pins=TM.msgs.filter(m=>m.pinned).reverse();openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Pinned','المثبّتة')}</h1>${XB}</div><div class="gl">${pins.map(m=>`<button data-pj="${m.id}"><span class="ic c-a"><i class="ph ${m.kind==='idea'?'ph-lightbulb':m.audio?'ph-microphone':'ph-push-pin'}"></i></span><span dir="auto">${esc(pinTxt(m).slice(0,90))}</span><i class="ph ph-caret-right cv flip"></i></button>`).join('')}</div>`);
 $$('#sh [data-pj]').forEach(b=>b.onclick=()=>{closeSheet();const el=document.querySelector('#fqpCh .fqp-m[data-id="'+b.dataset.pj+'"]');if(el){el.scrollIntoView({block:'center',behavior:'smooth'});el.classList.add('fl');setTimeout(()=>el.classList.remove('fl'),1400)}})}
/* voice notes: recorded on the phone, up to 2 minutes */
const RC={mr:null,chunks:[],t0:0,tick:0,stream:null};
async function recStart(){if(!window.MediaRecorder){toast(X('Voice notes are not supported on this browser.','الرسائل الصوتية غير مدعومة في هذا المتصفح.'));return}
 try{RC.stream=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){toast(X('Microphone was not allowed. You can allow it in your phone settings.','لم يُسمح بالميكروفون. يمكنك السماح به من إعدادات الهاتف.'));return}
 const mt=['audio/mp4','audio/aac','audio/webm;codecs=opus','audio/webm'].find(t=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t));
 RC.mr=new MediaRecorder(RC.stream,Object.assign({audioBitsPerSecond:32000},mt?{mimeType:mt}:{}));RC.chunks=[];RC.mr.ondataavailable=e=>{if(e.data&&e.data.size)RC.chunks.push(e.data)};RC.mr.start(250);RC.t0=Date.now();
 $('fqpCmpR').hidden=true;$('fqpRec').hidden=false;vib(15);clearInterval(RC.tick);RC.tick=setInterval(()=>{const s=(Date.now()-RC.t0)/1000;$('fqpRecT').textContent=fmtS(Math.floor(s));if(s>=120)recStop(true)},250)}
function recStop(send){clearInterval(RC.tick);const mr=RC.mr;if(!mr)return;const secs=Math.max(1,Math.round((Date.now()-RC.t0)/1000));RC.mr=null;
 mr.onstop=async()=>{try{RC.stream.getTracks().forEach(t=>t.stop())}catch(e){}$('fqpCmpR').hidden=false;$('fqpRec').hidden=true;if(!send||!RC.chunks.length)return;
  const blob=new Blob(RC.chunks,{type:mr.mimeType||'audio/mp4'});const d=await new Promise(ok=>{const r=new FileReader();r.onload=()=>ok(r.result);r.readAsDataURL(blob)});
  if(d.length>1400000){toast(X('This voice note is too long. Please keep it under 2 minutes.','الرسالة الصوتية طويلة. اجعلها أقل من دقيقتين.'));return}
  try{const sb=await FQA.sb();const {error}=await sb.from('fastaqim_team_chat').insert({body:X('Voice note','رسالة صوتية'),audio:d.replace(/^data:audio\/[^;,]*/,m=>m.split(';')[0]),audio_secs:Math.min(180,secs),about:TM.about?TM.about.t.slice(0,120):null});if(error)throw error;TM.about=null;abDraw();vib(10);await tmLoad(true)}
  catch(e){toast(T("Couldn't send. Check your internet and try again.",'تعذّر الإرسال. تحقق من الإنترنت وحاول مجددًا.'))}};
 try{mr.stop()}catch(e){}}
let VA=null,VAel=null;
function vnPlay(el,m){if(VA&&VAel===el&&!VA.paused){VA.pause();return}if(VA){VA.pause();if(VAel)VAel.classList.remove('on')}
 VA=new Audio(m.audio);VAel=el;try{AU.pause()}catch(e){}const ic=el.querySelector('.pl i'),bar=el.querySelector('.bar i');
 VA.onplay=()=>{el.classList.add('on');ic.className='ph-fill ph-pause'};VA.onpause=VA.onended=()=>{el.classList.remove('on');ic.className='ph-fill ph-play'};
 VA.ontimeupdate=()=>{const dur=isFinite(VA.duration)?VA.duration:(m.audio_secs||1);bar.style.width=Math.min(100,VA.currentTime/dur*100)+'%'};
 VA.play().catch(()=>toast(X('Audio could not play','تعذّر تشغيل الصوت')))}
/* members: only the owner adds or removes */
async function tmMem(){const B=$('fqpTmB');clearInterval(TM.poll);if(!TM.own){B.innerHTML='';return}B.innerHTML=`<p class="rload">${T('Loading…','جارٍ التحميل…')}</p>`;
 let rows=[];try{const sb=await FQA.sb();const {data,error}=await sb.from('site_helpers').select('email,added_at').order('added_at');if(error)throw error;rows=data||[]}catch(e){B.innerHTML=`<p class="note fqp-c">${T("Couldn't load. Check your internet and try again.",'تعذّر التحميل. تحقق من الإنترنت وحاول مجددًا.')}</p>`;return}
 const nameOf=em=>{const m=Object.values(TM.mem).find(x=>x.role==='admin'&&x.name&&rows.length===1);return m?m.name:''};
 B.innerHTML=`<p class="note">${X('Only you can add or remove members. Members can use Team chat and see Previews.','أنت فقط تستطيع إضافة الأعضاء أو إزالتهم. يستطيع الأعضاء استخدام محادثة الفريق ورؤية المعاينات.')}</p>
 <div class="gl"><div class="fqp-mr"><span class="fqp-av" style="--s:38px;background:var(--accT);color:var(--acc)"><i class="ph ph-crown-simple"></i></span><span class="tx"><b>${X('You','أنت')}</b><small>${X('Owner','المالك')}</small></span></div>
 ${rows.map(r=>`<div class="fqp-mr"><span class="fqp-av" style="--s:38px;background:var(--card2);color:var(--sub)"><b>${esc((r.email[0]||'?').toUpperCase())}</b></span><span class="tx"><b>${esc(r.email)}</b><small>${X('Admin','مشرف')}</small></span><button class="fqp-rm" data-rm="${esc(r.email)}">${X('Remove','إزالة')}</button></div>`).join('')}</div>
 <p class="glh">${X('Add a member','إضافة عضو')}</p><div class="kh"><input class="inp" id="fqpMemE" type="email" inputmode="email" autocomplete="off" placeholder="${esc(X('Their sign-in email','بريد تسجيل دخوله'))}"><button class="big" id="fqpMemA">${X('Add','إضافة')}</button><p class="fqa-m" id="fqpMemM"></p></div>`;
 $$('#fqpTmB [data-rm]').forEach(b=>b.onclick=()=>{const em=b.dataset.rm;openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Remove this member?','إزالة هذا العضو؟')}</h1>${XB}</div><div class="kh"><p class="fqp-pn">${esc(em)}</p><p class="fqp-pn fqp-sm">${X('They will no longer see Team chat or Previews. You can add them again any time.','لن يرى محادثة الفريق أو المعاينات بعد الآن. يمكنك إضافته مرة أخرى في أي وقت.')}</p></div><button class="dang fqp-reset" id="fqpRmGo">${X('Remove','إزالة')}</button><button class="fqp-cancel" data-x>${X('Keep','إبقاء')}</button>`);
  $('fqpRmGo').onclick=async()=>{try{const sb=await FQA.sb();const {error}=await sb.from('site_helpers').delete().eq('email',em);if(error)throw error;closeSheet();vib(10);toast(X('Removed','تمت الإزالة'));tmMem()}catch(e){toast(T("Couldn't send. Check your internet and try again.",'تعذّر الإرسال. تحقق من الإنترنت وحاول مجددًا.'))}}});
 $('fqpMemA').onclick=async()=>{const em=$('fqpMemE').value.trim().toLowerCase(),M=$('fqpMemM');if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){M.textContent=X('Please write a full email address.','اكتب بريدًا إلكترونيًا كاملًا.');return}
  if(rows.some(r=>r.email.toLowerCase()===em)){M.textContent=X('Already a member.','عضو بالفعل.');return}
  try{const sb=await FQA.sb();const {error}=await sb.from('site_helpers').insert({email:em});if(error)throw error;vib([10,30,10]);toast(X('Added. They see Team after they sign in with this email.','تمت الإضافة. سيرى الفريق بعد تسجيل الدخول بهذا البريد.'));tmMem()}catch(e){M.textContent=T("Couldn't send. Check your internet and try again.",'تعذّر الإرسال. تحقق من الإنترنت وحاول مجددًا.')}}}
async function tmPrev(){const B=$('fqpTmB');B.innerHTML=`<p class="rload">${T('Loading…','جارٍ التحميل…')}</p>`;clearInterval(TM.poll);
 if(!TM.items){try{TM.items=(await (await fetch(ROOT+'decisions/items.json',{cache:'no-store'})).json()).items||[]}catch(e){TM.items=[]}}
 const own=(await roles()).own;let ans={};if(own){try{ans=JSON.parse(localStorage.getItem('fq.dec')||'{}')}catch(e){}}
 const link=u=>/^https?:/.test(u)?u:ROOT+u;
 B.innerHTML=`<p class="note">${X('New designs before they go live. Look, then comment in Chat.','التصاميم الجديدة قبل نشرها. شاهِد ثم علّق في المحادثة.')}</p>
 <a class="apcmp" href="${ROOT}next/compare/" target="_blank" rel="noopener"><i class="ph ph-columns"></i><span><b>${X('Every screen side by side','كل شاشة جنبًا إلى جنب')}</b><small>${X('Live previews of each screen.','معاينات حية لكل شاشة.')}</small></span><i class="ph ph-arrow-square-out"></i></a>`+
 (TM.items.length?TM.items.map((x,k)=>`<div class="kh fqp-pv2"><div class="appics">${(x.pics||[]).slice(0,3).map(p=>`<img src="${esc(link(p))}" alt="" loading="lazy">`).join('')}</div><h3 dir="auto">${esc(L==='ar'&&x.ar?x.ar:x.t)}</h3>${x.s?`<p dir="auto">${esc(x.s)}</p>`:''}
  <div class="fqp-pvb">${x.link?`<a class="khop" href="${esc(link(x.link))}" target="_blank" rel="noopener"><i class="ph ph-arrow-square-out"></i>${X('Open it live','افتحه مباشرة')}</a>`:''}<button class="khop" data-cm="${k}"><i class="ph ph-chat-circle-text"></i>${X('Comment','تعليق')}</button>${own&&ans[x.id]?`<span class="fqp-st">${ans[x.id].a==='approve'?'✓ '+X('Approved','موافق'):'✎ '+X('Change','تغيير')}</span>`:''}</div></div>`).join(''):`<p class="note fqp-c">${X('Nothing waiting right now.','لا شيء ينتظر الآن.')}</p>`);
 $$('#fqpTmB [data-cm]').forEach(b=>b.onclick=()=>{const x=TM.items[+b.dataset.cm];TM.about={id:x.id,t:x.t};TM.tab='chat';tmTab();setTimeout(()=>$('fqpMsg').focus(),100)})}
async function teamBadge(){const em=$('fqpTeamEm');if(!em)return;try{const sb=await FQA.sb(),me=FQA.user().id;const r=await sb.from('fastaqim_team_reads').select('last_read_id').eq('user_id',me).maybeSingle();const lr=(r.data&&r.data.last_read_id)||0;
 const {count}=await sb.from('fastaqim_team_chat').select('id',{count:'exact',head:true}).gt('id',lr).neq('author',me);em.innerHTML=count?`<span class="fqp-nd">${AR(count)}</span>`:''}catch(e){}}

/* ================= More screen: Settings, What's new, owner rows ================= */
function moreRows(){const more=$('s-more');if(!more)return;
 if(!$('fqpSetRow')){const lb=$('mLang');const gl=lb&&lb.closest('.gl');const html=`<div class="gl" id="fqpSetRow">${row('fqpGoSet','ph-gear-six',X('Settings','الإعدادات','Qindaa’ina','Dejinta'),'')}${row('fqpGoNews','ph-gift',X("What's new",'ما الجديد','Haaraa maal','Maxaa cusub'),'')}</div>`;
  if(gl){gl.insertAdjacentHTML('beforebegin',html);gl.style.display='none'}else more.insertAdjacentHTML('beforeend',html);
  const glh=[...more.querySelectorAll('.glh')].find(p=>/Settings|الإعدادات/.test(p.dataset.t||''));if(glh)glh.style.display='none';
  $('fqpGoSet').onclick=()=>go('settings');$('fqpGoNews').onclick=()=>go('news');const ne=document.querySelector('#fqpGoNews em');if(ne)ne.id='fqpNewsEm';ne.innerHTML=`<span class="fqp-nd">${X('New','جديد','Haaraa','Cusub')}</span>`;dotSync()}
 roles().then(r=>{let g=$('fqpOwn');if(!r.team&&!r.own){if(g)g.remove();return}
  if(!g){$('fqpSetRow').insertAdjacentHTML('beforebegin','<div class="gl" id="fqpOwn"></div>');g=$('fqpOwn')}
  g.innerHTML=(r.team?row('fqpGoTeam','ph-chats-circle',X('Team','الفريق'),''):'')+(r.own?row('fqpGoLog','ph-clock-counter-clockwise',X('Change log','سجل التغييرات'),''):'');
  if($('fqpGoTeam')){$('fqpGoTeam').onclick=()=>go('team');document.querySelector('#fqpGoTeam em').id='fqpTeamEm';teamBadge()}if($('fqpGoLog'))$('fqpGoLog').onclick=()=>go('log')})}
moreRows();
{const rm=R.more;R.more=function(){const r=rm?rm.apply(this,arguments):undefined;try{moreRows();teamBadge()}catch(e){}return r}}
{const rh=R.home;R.home=function(){const r=rh.apply(this,arguments);try{homeAv();pathQ()}catch(e){}return r}}
homeAv();pathQ();applyWp();
/* open the screen in the address (#settings, #guide, #news, #team, #log) once these screens exist */
{const h=(window.__fqHash||location.hash||'').slice(1);if(['settings','guide','news','team','log'].includes(h))go(h,false)}
const QP=new URLSearchParams(location.search);if(QP.get('x')==='report2')setTimeout(()=>reportSheet(null),300);if(QP.get('x')==='reset')setTimeout(resetSheet,300);window.__fqp={undoReset,changeRestore,doRestore,combine,mSub,mAdd,pickPhoto,applyWp,delSheet};
})();
