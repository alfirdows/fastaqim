/* Fastaqim v6 · Life & family module (own file so the main v6 build can't overwrite it).
   Adds: About Fastaqim card (name meaning + recitation) on More, Life hub, Habits (build + leave),
   Rules (family, mine, each person), Family schedule (everyone sees everyone), 52 guides with breathing and thought-check helpers.
   Uses the main page's globals: S, save, T, L, LI, LX, LOCX, AR, esc, $, $$, go, R, TABOF, openSheet, closeSheet, XB, TI, PH, TOOLS, toolOf, tile, tSub, openTool, vib, toast, undoToast, ciBurst, f12, dkey, NOW, playAyat, qTrCh. */
(function(){
'use strict';
const X=a=>a==null?'':Array.isArray(a)?(L==='ar'?a[1]:LI===0?(a[2]||a[0]):LI===1?(a[3]||a[0]):a[0]):String(a);
const U=(en,ar,om,so)=>X([en,ar,om,so]);
const IC=(n,sz=22,fill)=>`<i class="ph${fill?'-fill':''} ph-${n}" style="font-size:${sz}px" aria-hidden="true"></i>`;
const BACK=`<button class="ib" data-back aria-label="${U('Back','رجوع','Duubatti','Dib u noqo')}"><i class="ph ph-caret-left flip"></i></button>`;
const rerender=()=>{const c=$$('.scr.on')[0];if(c&&R[c.id.slice(2)])R[c.id.slice(2)]()};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);

/* ---------- state ---------- */
S.life=S.life||{};const LF=S.life;
LF.fam=LF.fam||[];LF.rules=LF.rules||{fam:[],me:[]};LF.sch=LF.sch||[];LF.th=LF.th||[];
const COLORS=['#4f8a74','#b8955a','#5b7fb5','#b5684a','#3f8f98','#7d8a3e','#8a6a4f','#6b7280'];
const person=id=>LF.fam.find(p=>p.id===id);

/* ---------- screens ---------- */
$('s-more').insertAdjacentHTML('afterend',`
<section class="scr" id="s-life"><div class="hd sub">${BACK}<h1 id="lfT"></h1><span style="width:44px"></span></div><div id="lfB"></div></section>
<section class="scr" id="s-hab"><div class="hd sub">${BACK}<h1 id="hbT"></h1><button class="ib" id="hbAdd" aria-label="Add"><i class="ph ph-plus"></i></button></div><div id="hbB"></div></section>
<section class="scr" id="s-rules"><div class="hd sub">${BACK}<h1 id="ruT"></h1><span style="width:44px"></span></div><div id="ruB"></div></section>
<section class="scr" id="s-fam"><div class="hd sub">${BACK}<h1 id="fmT"></h1><button class="ib" id="fmAdd" aria-label="Add"><i class="ph ph-plus"></i></button></div><div id="fmB"></div></section>
<section class="scr" id="s-gc"><div class="hd sub">${BACK}<h1 id="gcT"></h1><span style="width:44px"></span></div><div id="gcB"></div></section>
<section class="scr" id="s-g"><div class="hd sub">${BACK}<h1 id="gT"></h1><span style="width:44px"></span></div><div id="gB"></div></section>`);
Object.assign(TABOF,{life:'more',hab:'more',rules:'more',fam:'more',gc:'more',g:'more'});

/* ---------- small shared pieces ---------- */
const srcChip=()=>`<button class="lf-src" data-lfsrc>${IC('seal-check',15,1)}<span>${U('Backed by sources','مدعوم بالمصادر','Madda qaba','Il-lo leh')}</span></button>`;
function srcSheet(){openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${U('Backed by sources','مدعوم بالمصادر','Madda qaba','Il-lo leh')}</h1>${XB}</div>
 <div class="lf-srcb">${IC('seal-check',38,1)}<p>${U('Every method here comes from established research and practice (psychology, CBT, DBT, child and family therapy) and from trusted Islamic scholars. Fastaqim rewrote them in simple words.','كل طريقة هنا مأخوذة من أبحاث وممارسات راسخة (علم النفس، العلاج المعرفي السلوكي، العلاج السلوكي الجدلي، علاج الطفل والأسرة) ومن علماء مسلمين موثوقين. أعادت فاستقم صياغتها بكلمات بسيطة.','Malli asii jiru hundi qorannoo fi hojii mirkanaaʼe (saayikoloojii, CBT, DBT, yaala ijoollee fi maatii) fi beekota Islaamaa amanamoo irraa dhufe. Fastaqim jecha salphaan irra deebiʼee barreesse.','Hab kasta oo halkan ah wuxuu ka yimid cilmi-baaris iyo ku-dhaqan la aqoonsan yahay (cilmi-nafsiga, CBT, DBT, daaweynta carruurta iyo qoyska) iyo culimo Islaam ah oo la isku halleyn karo. Fastaqim ayaa ku qortay erayo fudud.')}</p>
 <p>${U("Qur'an and hadith are quoted word for word, only sahih or hasan, with links to Quran.com and Sunnah.com.",'القرآن والحديث منقولان بنصّهما، الصحيح والحسن فقط، مع روابط إلى Quran.com وSunnah.com.',"Qur'aanni fi hadiisni akkuma jirutti, sahiih ykn hasan qofa, Quran.com fi Sunnah.com waliin.",'Quraanka iyo xadiiska waa erey-erey, saxiix ama xasan kaliya, oo leh xiriirro Quran.com iyo Sunnah.com.')}</p>
 <p class="lf-mut">${U('This is general guidance, not a diagnosis. For ongoing problems, please see a doctor or therapist.','هذه إرشادات عامة وليست تشخيصًا. للمشكلات المستمرة، راجع طبيبًا أو معالجًا.','Kun qajeelfama waliigalaa malee qorannoo dhukkubaa miti. Rakkoo itti fufaaf ogeessa fayyaa ilaali.','Tani waa hage guud, ma aha baaritaan. Dhibaatooyinka joogtada ah, la kulan dhakhtar.')}</p></div>`)}
document.addEventListener('click',e=>{if(e.target.closest('[data-lfsrc]')){e.preventDefault();srcSheet()}
 const g=e.target.closest('[data-lfg]');if(g){e.preventDefault();openGuide(g.dataset.lfg)}
 const c=e.target.closest('[data-lfc]');if(c){e.preventDefault();GC=c.dataset.lfc;go('gc')}});

/* Qur'an and hadith cards: reading style (medium Arabic, centred, lines break at natural pauses) */
const ayLines=a=>a.replace(/([ۚۖۗۛۙۘ])\s+/g,'$1\n').split('\n');
function hadithCard(k){const h=LH[k];if(!h)return'';
 return `<figure class="lf-ref"><p class="lf-ar" lang="ar" dir="rtl">${h.ar.replace(/،\s*/g,'،\n').split('\n').map(esc).join('<br>')}</p>${L==='ar'?'':`<p class="lf-me">${LI>=0?`<small class="lf-ml">${U('','','Hiika (Afaan Ingilizii)','Macnaha (Ingiriisi)')}</small>`:''}${esc(h.en)}</p>`}<figcaption><a href="${h.u}" target="_blank" rel="noopener">${esc(h.src)}</a></figcaption></figure>`}
function ayahCard(key){return `<figure class="lf-ref" data-lfq="${key}"><p class="lf-ar" lang="ar" dir="rtl">…</p><figcaption></figcaption></figure>`}
async function fillAyat(root){const els=$$('[data-lfq]',root);for(const el of els){const[su,ay]=el.dataset.lfq.split(':').map(Number);
 try{const d=await qJ(su),v=d.v[ay-1];let me=v[1];if(L!=='ar'&&LI>=0){const t=await qTrCh(su);if(t&&t[ay-1])me=t[ay-1]}
  const nm=SU[su-1];el.innerHTML=`<p class="lf-ar lfq" lang="ar" dir="rtl">${ayLines(v[0]).map(esc).join('<br>')} <span class="lf-an">﴿${AR(ay)}﴾</span></p>${L==='ar'?'':`<p class="lf-me">${esc(me)}</p>`}<figcaption><a href="https://quran.com/${su}:${ay}" target="_blank" rel="noopener">${L==='ar'?'القرآن الكريم، سورة '+nm[1]+' '+AR(ay):T("Qur'an, Surah "+nm[0]+' '+su+':'+ay,'')}</a></figcaption>`}catch(e){el.remove()}}}
const refHTML=r=>(r||[]).map(x=>x.startsWith('q:')?ayahCard(x.slice(2)):hadithCard(x.slice(2))).join('');

/* =================== ABOUT FASTAQIM (bug fix: name meaning + audio on the signed-in page) =================== */
const NAME_ME=['Be steadfast','استقِم كما أُمرت','Gadi dhaabbadhu','U toosnow'];
function aboutCard(){return `<div class="lf-ab" id="lfAb"><button class="lf-abm" id="lfAbO"><span class="lf-abw" lang="ar" dir="rtl">فَٱسۡتَقِمۡ</span><span class="lf-abt"><small class="ey">${U('About Fastaqim','عن فاستقم',"Waa'ee Fastaqim",'Ku saabsan Fastaqim')}</small><b>${L==='ar'?'«فاستقم كما أُمرت»':'“'+X(NAME_ME)+'”'}</b><small>${L==='ar'?'سورة هود ١١٢':T("Qur'an, Surah Hud 11:112",'')}</small></span></button><button class="lf-abp" id="lfAbP" aria-label="${U('Listen','استمع','Dhaggeeffadhu','Dhegeyso')}">${IC('play',20,1)}</button></div>`}
const playName=()=>{vib(10);playAyat(['11:112'],L==='ar'?'هود ١١٢':'Hud 11:112')};
async function aboutSheet(){
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${U('About Fastaqim','عن فاستقم',"Waa'ee Fastaqim",'Ku saabsan Fastaqim')}</h1>${XB}</div>
 <div class="lf-abs"><div class="lf-abbig" lang="ar" dir="rtl">فَٱسۡتَقِمۡ</div><p class="lf-abn">Fastaqim · <b>${esc(X(NAME_ME))}</b></p>
 <p class="lf-abx">${U('Fastaqim is the first word of Surah Hud 11:112. It means "so be steadfast": stay on the straight path, step by step, every day.','«فاستقم» أول كلمة في الآية ١١٢ من سورة هود، ومعناها: اثبت على الطريق المستقيم، خطوة بخطوة، كل يوم.','Fastaqim jecha jalqabaa Suuraa Huud 11:112 ti. Hiikni isaa “gadi dhaabbadhu”: karaa qajeelaa irratti tarkaanfii tarkaanfiin, guyyaa guyyaan turi.','Fastaqim waa erayga ugu horreeya ee Suuradda Huud 11:112. Macnihiisu waa “u toosnow”: ku sii jir jidka toosan, tallaabo tallaabo, maalin kasta.')}</p>
 <button class="lf-listen" id="lfAbL">${IC('play',18,1)}<span>${U('Listen to the ayah','استمع إلى الآية','Aayaa dhaggeeffadhu','Dhegeyso aayadda')}</span><small>${U('Saad al-Ghamdi','سعد الغامدي','Saad al-Ghamdi','Saad al-Ghamdi')}</small></button>
 ${ayahCard('11:112')}
 ${L==='ar'?`<figure class="lf-ref"><p class="lf-me" dir="rtl" style="text-align:center">أمر نبيَّه ﷺ ومن معه من المؤمنين أن يستقيموا كما أُمروا، فيسلكوا ما شرعه الله… ولا يزيغوا عن ذلك يمنةً ولا يسرة، ويدوموا على ذلك</p><figcaption>تفسير السعدي</figcaption></figure>`:''}
 ${hadithCard('muslim38')}
 <p class="lf-abx">${U('That is the goal of this site: to help you stay steady with small, regular steps, and to keep them.','وهذا هدف الموقع: أن يعينك على الثبات بخطوات صغيرة منتظمة تداوم عليها.','Kaayyoon marsariitii kanaa kana: tarkaanfii xiqqaa yeroo hundaatiin akka jabaattu si gargaaruu.','Taasi waa hadafka goobtan: inay kaa caawiso inaad ku sii jirto tallaabooyin yaryar oo joogto ah.')}</p></div>`);
 $('lfAbL').onclick=playName;fillAyat($('sh'))}

/* =================== TOOLS registry (Tools page + pin to Home) =================== */
Object.assign(PH,{rules:'scroll',family:'calendar-blank',guides:'book-bookmark',calm:'wind',life:'compass-rose'});
TOOLS.push({id:'rules',g:'lf',ic:'rules',n:['Rules','القواعد'],type:'life',go:'rules'},{id:'family',g:'lf',ic:'family',n:['Family schedule','جدول العائلة'],type:'life',go:'fam'},
 {id:'guides',g:'lf',ic:'guides',n:['Guides','الأدلة'],type:'life',go:'life'},{id:'calm',g:'lf',ic:'calm',n:['Calm down now','تهدئة الآن'],type:'life',go:'g',arg:'calm/breath'});
const TNO={rules:['Seerota','Xeerarka'],family:['Sagantaa maatii','Jadwalka qoyska'],guides:['Qajeelfamoota','Hagayaal'],calm:['Amma tasgabbaaʼi','Hadda deg'],habits:['Amaloota','Caadooyinka']};
{const en={rules:'Rules',family:'Family schedule',guides:'Guides',calm:'Calm down now'};for(const k in en)if(!DICT[en[k]])DICT[en[k]]=TNO[k]}
{const _ot=openTool;openTool=function(id){const t=toolOf(id);if(id==='habits'){go('hab');return}if(t&&t.type==='life'){if(t.arg){const[c,g]=t.arg.split('/');GC=c;GD=g}go(t.go);return}return _ot(id)}}
{const _ts=tSub;tSub=function(id){const t=toolOf(id);if(!t)return'';
 if(id==='habits'){const h=habStats(dkey(NOW()));return h.n?U(h.ok+' of '+h.n+' today',AR(h.ok)+' من '+AR(h.n)+' اليوم','Har’a '+h.n+' keessaa '+h.ok,h.ok+' / '+h.n+' maanta'):U('None yet','لا شيء بعد','Ammaaf hin jiru','Weli ma jiro')}
 if(id==='rules'){const n=Object.values(LF.rules).reduce((a,x)=>a+x.length,0);return n?U(n+' rules',AR(n)+' قواعد','Seera '+n,n+' xeer'):U('Family and mine','للعائلة ولي','Maatii fi kan koo','Qoyska iyo kayga')}
 if(id==='family'){const n=schFor(new Date().getDay()).length;return n?U(n+' today',AR(n)+' اليوم',"Har'a "+n,n+' maanta'):U('Everyone’s day','يوم الجميع','Guyyaa hundaa','Maalinta qof walba')}
 if(id==='guides'){const n=LG.reduce((a,c)=>a+c.g.length,0);return U(n+' guides',AR(n)+' دليلًا','Qajeelfama '+n,n+' hage')}
 if(id==='calm')return U('Slow breathing','التنفس البطيء','Hargansuu suuta','Neefsasho tartiib ah');
 return _ts(id)}}
{const _rt=R.tools;R.tools=function(){_rt();const g=$('tlg');if(!g||$('tlLife'))return;const h=[...g.querySelectorAll('.tgh')].pop();
 const html=`<h3 class="tgh" id="tlLife">${U('Life & family','الحياة والعائلة','Jireenya fi maatii','Nolosha iyo qoyska')}</h3><div class="tgrid">${TOOLS.filter(t=>t.g==='lf').map(t=>tile(t.id)).join('')}</div>`;
 if(h)h.insertAdjacentHTML('beforebegin',html);else g.insertAdjacentHTML('beforeend',html);
 $$('#tlLife+.tgrid [data-pin]').forEach(b=>b.onclick=()=>{const id=b.dataset.pin,i=S.pins.indexOf(id);
  if(i>=0)S.pins.splice(i,1);else{if(S.pins.length>=3){toast(T('Home holds 3. Unpin one first.','الرئيسية تتسع لـ٣. أزل واحدة أولاً.'));return}S.pins.push(id);vib(10);toast(T('Added to Home','أُضيفت إلى الرئيسية'))}save();R.tools()})}}

/* =================== MORE page: About card + Life row =================== */
{const _rm=R.more;R.more=function(){_rm();
 if(!$('lfAb')){const a=$('mAcct');const anchor=a?a.closest('.gl'):$('yp');anchor.insertAdjacentHTML('afterend',aboutCard());$('lfAbO').onclick=aboutSheet;$('lfAbP').onclick=e=>{e.stopPropagation();playName()}}
 if(!$('mLife')){const tb=$('s-more').querySelector('[data-go="tools"]');if(tb)tb.insertAdjacentHTML('afterend',`<button id="mLife" data-go="life"><span class="ic c-a">${IC('compass-rose',22)}</span><span>${U('Life & family','الحياة والعائلة','Jireenya fi maatii','Nolosha iyo qoyska')}</span><em>${U('Habits, rules, guides','العادات، القواعد، الأدلة','Amaloota, seerota, qajeelfama','Caadooyin, xeerar, hagayaal')}</em><i class="ph ph-caret-right cv flip"></i></button>`)}}}

/* =================== LIFE HUB =================== */
R.life=()=>{$('lfT').textContent=U('Life & family','الحياة والعائلة','Jireenya fi maatii','Nolosha iyo qoyska');
 const row=(go,ic,t,s,attr)=>`<button ${attr||`data-go="${go}"`}><span class="ic c-a">${IC(ic,22)}</span><span class="lf-rt"><b>${t}</b><small>${s}</small></span><i class="ph ph-caret-right cv flip"></i></button>`;
 $('lfB').innerHTML=`<button class="lf-calm" data-lfg="calm/breath"><span class="lf-calmr"><i></i>${IC('wind',24)}</span><span><b>${X(LG[0].t)}</b><small>${U('One minute of slow breathing','دقيقة من التنفس البطيء','Daqiiqaa tokko hargansuu suuta','Hal daqiiqo oo neefsasho tartiib ah')}</small></span><i class="ph ph-caret-right flip"></i></button>
 <p class="tgh">${U('My days','أيامي','Guyyoota koo','Maalmahayga')}</p>
 <div class="gl lf-gl">${row('hab','check-circle',U('Habits','العادات','Amaloota','Caadooyinka'),esc(tSub('habits')))}${row('rules','scroll',U('Rules','القواعد','Seerota','Xeerarka'),U('Family rules, my rules, each person','قواعد العائلة، قواعدي، ولكل فرد','Seera maatii, kan koo, nama hundaaf','Xeerarka qoyska, kayga, qof walba'))}</div>
 <p class="tgh">${U('Family','العائلة','Maatii','Qoyska')}</p>
 <div class="gl lf-gl">${row('fam','calendar-blank',U('Family schedule','جدول العائلة','Sagantaa maatii','Jadwalka qoyska'),U('Who does what, and when','من يفعل ماذا، ومتى','Eenyutu maal yoom hojjeta','Yaa samaynaya maxay iyo goorma'))}${row('','house-line',X(LG[6].t),X(LG[6].s),'data-lfc="fam"')}</div>
 <div class="lf-gh"><p class="tgh">${U('Guides','الأدلة','Qajeelfamoota','Hagayaal')}</p>${srcChip()}</div>
 <div class="gl lf-gl">${LG.filter(c=>c.id!=='fam').map(c=>row('',c.ic,X(c.t),X(c.s),`data-lfc="${c.id}"`)).join('')}</div>`};

/* =================== HABITS =================== */
const HD=()=>{const d=tData('habits');d.d=d.d||{};d.rv=d.rv||{};return d};
const HI=()=>tItems('habits');
function habStats(dk){const it=HI(),td=HD().d[dk]||{};let ok=0;it.forEach(h=>{const v=td[h.id];if(h.k==='stop'?v==='k':v===true)ok++});return{n:it.length,ok}}
let HV='day';
function habSheet(h,kind){const st=h?h.k||'do':kind||'do';let k=st;
 openSheet(`<div class="hd sub"><button class="tlk" id="hsC">${U('Cancel','إلغاء','Dhiisi','Jooji')}</button><h1>${h?U('Edit habit','تعديل العادة','Amala gulaali','Wax ka beddel caadada'):U('New habit','عادة جديدة','Amala haaraa','Caado cusub')}</h1><button class="tlk b" id="hsOk">${U('Save','حفظ','Olkaaʼi','Kaydi')}</button></div>
 <div class="fm"><div class="seg lf-seg" id="hsK"><button data-k="do" class="${k==='do'?'on':''}">${IC('plant',16)} ${U('Build','أبنيها','Ijaari','Dhis')}</button><button data-k="stop" class="${k==='stop'?'on':''}">${IC('prohibit',16)} ${U('Leave','أتركها','Dhiisi','Ka tag')}</button></div>
 <label>${U('Habit','العادة','Amala','Caado')}<input id="hsT" maxlength="60" value="${h?esc(h.t):''}" placeholder="${U('e.g. Walk after Asr','مثال: المشي بعد العصر','Fkn. Asrii booda deemuu','Tusaale: Socod Casarka kadib')}"></label>
 <label>${U('Note (optional)','ملاحظة (اختياري)','Yaadannoo (filannoo)','Qoraal (ikhtiyaari)')}<input id="hsN" maxlength="80" value="${h&&h.n?esc(h.n):''}" placeholder="${U('When, where or why','متى أو أين أو لماذا','Yoom, eessa ykn maaliif','Goorma, xaggee ama sababta')}"></label>
 ${h?`<button class="danger" id="hsDel">${U('Delete habit','حذف العادة','Amala haqi','Tirtir caadada')}</button>`:''}</div>`);
 $$('#hsK [data-k]').forEach(b=>b.onclick=()=>{k=b.dataset.k;$$('#hsK [data-k]').forEach(x=>x.classList.toggle('on',x===b))});
 $('hsC').onclick=closeSheet;setTimeout(()=>{if(!h)$('hsT').focus()},250);
 $('hsOk').onclick=()=>{const t=$('hsT').value.trim();if(!t){$('hsT').classList.add('err');$('hsT').focus();return}
  if(h){h.t=t;h.n=$('hsN').value.trim();h.k=k}else HI().push({id:Date.now(),t,n:$('hsN').value.trim(),k});save();closeSheet();R.hab()};
 if(h)$('hsDel').onclick=()=>{const it=HI(),i=it.indexOf(h);it.splice(i,1);save();closeSheet();R.hab();undoToast(U('Habit deleted','حُذفت العادة','Amalli haqameera','Caadada waa la tirtiray'),()=>{it.splice(i,0,h);save();R.hab()})}}
R.hab=()=>{$('hbT').textContent=U('Habits','العادات','Amaloota','Caadooyinka');$('hbAdd').onclick=()=>habSheet();
 const it=HI(),d=HD(),dk=dkey(NOW()),td=d.d[dk]=d.d[dk]||{},doH=it.filter(h=>h.k!=='stop'),stH=it.filter(h=>h.k==='stop'),s=habStats(dk);
 const sug=(arr,kind)=>`<div class="lf-sug">${arr.filter(x=>!it.some(h=>h.t===X(x))).slice(0,6).map(x=>`<button data-hs="${kind}" data-t="${esc(X(x))}">${IC('plus',14)}${esc(X(x))}</button>`).join('')}</div>`;
 const C=2*Math.PI*30,f=s.n?s.ok/s.n:0;
 let h=`<div class="seg lf-seg2"><button data-hv="day" class="${HV==='day'?'on':''}">${U('Today','اليوم',"Har'a",'Maanta')}</button><button data-hv="wk" class="${HV==='wk'?'on':''}">${U('This week','هذا الأسبوع','Torban kana','Toddobaadkan')}</button></div>`;
 if(HV==='day'){
  h+=s.n?`<div class="lf-hsum"><svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="30" class="rb"/><circle cx="36" cy="36" r="30" class="rf" style="stroke-dasharray:${C};stroke-dashoffset:${C*(1-f)}"/></svg><span><b>${AR(s.ok)} / ${AR(s.n)}</b><small>${s.ok===s.n?U('All kept today. Alhamdulillah.','حافظت على الكل اليوم، الحمد لله.',"Har'a hunda eegde. Alhamdulillaah.",'Maanta dhammaan waad ilaalisay. Alxamdulillaah.'):U('Kept today','ما حافظت عليه اليوم',"Har'a kan eegde",'Waxa maanta la ilaaliyay')}</small></span></div>`:'';
  h+=`<div class="lf-hh"><p class="tgh">${IC('plant',15)} ${U('Build','أبنيها','Ijaari','Dhis')}</p><button class="lf-lk" data-hn="do">${IC('plus',15)}${U('Add','إضافة','Dabali','Ku dar')}</button></div>`;
  h+=doH.length?`<div class="lst">${doH.map(x=>`<div class="hb ${td[x.id]===true?'on':''}"><button class="ck3b" data-hd="${x.id}" aria-pressed="${td[x.id]===true}" aria-label="${esc(x.t)}">${td[x.id]===true?'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>':''}</button><button class="hbt" data-he="${x.id}"><b>${esc(x.t)}</b>${x.n?`<small>${esc(x.n)}</small>`:''}</button></div>`).join('')}</div>`:`<p class="lf-mut">${U('Good habits you want to build. Tap one to add it:','عادات طيبة تريد بناءها. اضغط لإضافتها:','Amaloota gaarii ijaaruu barbaaddu. Dabaluuf tuqi:','Caadooyin wanaagsan oo aad rabto inaad dhisto. Taabo si aad ugu darto:')}</p>`;
  h+=sug(LS.hdo,'do');
  h+=`<div class="lf-hh"><p class="tgh">${IC('prohibit',15)} ${U('Leave','أتركها','Dhiisi','Ka tag')}</p><button class="lf-lk" data-hn="stop">${IC('plus',15)}${U('Add','إضافة','Dabali','Ku dar')}</button></div>`;
  h+=stH.length?`<div class="lst">${stH.map(x=>{const v=td[x.id];return `<div class="hb lf-st"><button class="hbt" data-he="${x.id}"><b>${esc(x.t)}</b>${x.n?`<small>${esc(x.n)}</small>`:''}</button><span class="lf-ks"><button data-hk="${x.id}" data-v="k" class="${v==='k'?'on k':''}" aria-pressed="${v==='k'}">${IC('check',14)}${U('Kept away','ابتعدت','Irraa fagaadhe','Ka fogaaday')}</button><button data-hk="${x.id}" data-v="s" class="${v==='s'?'on s':''}" aria-pressed="${v==='s'}">${U('Slipped','زللت','Mucucadhe','Siibtay')}</button></span></div>`}).join('')}</div>`:`<p class="lf-mut">${U('Habits you want to leave. Mark each day honestly, with no blame.','عادات تريد تركها. سجّل كل يوم بصدق ودون لوم.','Amaloota dhiisuu barbaaddu. Guyyaa guyyaan dhugaan, komii malee galmeessi.','Caadooyin aad rabto inaad ka tagto. Maalin kasta si daacad ah u calaamadee, eed la’aan.')}</p>`;
  h+=sug(LS.hstop,'stop');
  const rv=d.rv[dk]||{};
  h+=`<div class="lf-hh"><p class="tgh">${IC('notebook',15)} ${U('Evening review','محاسبة المساء','Of qoruu galgalaa','Is-xisaabin fiidkii')}</p></div>
  <div class="lf-rv"><label>${U('What went well today?','ما الذي سار جيدًا اليوم؟',"Har'a maaltu gaarii taʼe?",'Maxaa si fiican u dhacay maanta?')}<textarea id="rvG" rows="2" placeholder="${U('Alhamdulillah for…','الحمد لله على…','Alhamdulillaah…','Alxamdulillaah…')}">${esc(rv.g||'')}</textarea></label>
  <label>${U('One thing to do better tomorrow','شيء واحد أحسّنه غدًا','Waan boru fooyyessu tokko','Hal shay oo aan berri hagaajiyo')}<textarea id="rvB" rows="2">${esc(rv.b||'')}</textarea></label>
  <small class="lf-saved" id="rvS"></small></div>${ayahCard('59:18')}`;
 }else{
  const days=[...Array(7)].map((_,i)=>{const x=NOW();x.setDate(x.getDate()-6+i);return x});
  h+=it.length?`<div class="lf-wk"><div class="lf-wkr lf-wkh"><span></span>${days.map(x=>`<i>${esc(x.toLocaleDateString(L==='ar'?'ar':LOCX,{weekday:'narrow'}))}</i>`).join('')}</div>${it.map(x=>`<div class="lf-wkr"><span><b>${esc(x.t)}</b><small>${x.k==='stop'?U('Leave','أتركها','Dhiisi','Ka tag'):U('Build','أبنيها','Ijaari','Dhis')}</small></span>${days.map(dd=>{const v=(d.d[dkey(dd)]||{})[x.id];const ok=x.k==='stop'?v==='k':v===true;return `<i class="${ok?'ok':v==='s'?'sl':''}"></i>`}).join('')}</div>`).join('')}</div>
  <p class="lf-key"><span><i class="ok"></i>${U('Kept','حافظت','Eegame','La ilaaliyay')}</span><span><i class="sl"></i>${U('Slipped','زللت','Mucucadhe','Siibtay')}</span><span><i></i>${U('Not marked','غير مسجّل','Hin galmoofne','Lama calaamadin')}</span></p>`:`<div class="empty2">${IC('check-circle',34)}<p>${U('Add a habit to see your week.','أضف عادة لترى أسبوعك.','Torban kee arguuf amala dabali.','Ku dar caado si aad u aragto toddobaadkaaga.')}</p></div>`;
 }
 h+=`<div class="lf-foot">${srcChip()}</div>`;
 $('hbB').innerHTML=h;
 $$('#hbB [data-hv]').forEach(b=>b.onclick=()=>{HV=b.dataset.hv;R.hab()});
 $$('#hbB [data-hn]').forEach(b=>b.onclick=()=>habSheet(null,b.dataset.hn));
 $$('#hbB [data-hs]').forEach(b=>b.onclick=()=>{HI().push({id:Date.now(),t:b.dataset.t,k:b.dataset.hs});vib(10);save();R.hab()});
 $$('#hbB [data-he]').forEach(b=>b.onclick=()=>habSheet(HI().find(x=>String(x.id)===b.dataset.he)));
 $$('#hbB [data-hd]').forEach(b=>b.onclick=()=>{const id=b.dataset.hd;const was=habStats(dk);td[id]=td[id]===true?undefined:true;if(td[id]===undefined)delete td[id];save();
  if(td[id]){vib([12,30,12]);try{ciBurst(b)}catch(e){}}const now=habStats(dk);R.hab();if(now.n&&now.ok===now.n&&was.ok<now.n)allKept()});
 $$('#hbB [data-hk]').forEach(b=>b.onclick=()=>{const id=b.dataset.hk,v=b.dataset.v;const was=habStats(dk);if(td[id]===v)delete td[id];else td[id]=v;save();if(td[id]==='k'){vib([12,30,12]);try{ciBurst(b)}catch(e){}}else vib(8);
  const now=habStats(dk);R.hab();if(now.n&&now.ok===now.n&&was.ok<now.n)allKept()});
 const rvSave=()=>{d.rv[dk]={g:$('rvG').value,b:$('rvB').value};save();$('rvS').textContent=U('Saved','حُفظ','Olkaaʼameera','Waa la kaydiyay')};
 if($('rvG')){let t;['rvG','rvB'].forEach(i=>$(i).oninput=()=>{clearTimeout(t);t=setTimeout(rvSave,500)})}
 fillAyat($('hbB'))};
function allKept(){try{celebrateTool()}catch(e){}}

/* =================== RULES =================== */
let RT='fam';
function personSheet(p){let c=p?p.c:COLORS[LF.fam.length%COLORS.length];
 openSheet(`<div class="hd sub"><button class="tlk" id="psC">${U('Cancel','إلغاء','Dhiisi','Jooji')}</button><h1>${p?U('Edit person','تعديل الفرد','Nama gulaali','Wax ka beddel qofka'):U('Add a person','إضافة فرد','Nama dabali','Ku dar qof')}</h1><button class="tlk b" id="psOk">${U('Save','حفظ','Olkaaʼi','Kaydi')}</button></div>
 <div class="fm"><label>${U('Name','الاسم','Maqaa','Magac')}<input id="psN" maxlength="24" value="${p?esc(p.n):''}" placeholder="${U('e.g. Dad, Ahmed','مثال: أبي، أحمد','Fkn. Abbaa, Ahmed','Tusaale: Aabbe, Axmed')}"></label>
 <p class="fl2">${U('Colour','اللون','Halluu','Midab')}</p><div class="lf-cols">${COLORS.map(x=>`<button data-c="${x}" class="${x===c?'on':''}" style="--c:${x}" aria-label="${x}"></button>`).join('')}</div>
 ${p?`<button class="danger" id="psDel">${U('Remove person','إزالة الفرد','Nama haqi','Ka saar qofka')}</button>`:''}</div>`);
 $$('#sh [data-c]').forEach(b=>b.onclick=()=>{c=b.dataset.c;$$('#sh [data-c]').forEach(x=>x.classList.toggle('on',x===b))});
 $('psC').onclick=closeSheet;setTimeout(()=>{if(!p)$('psN').focus()},250);
 $('psOk').onclick=()=>{const n=$('psN').value.trim();if(!n){$('psN').classList.add('err');$('psN').focus();return}
  if(p){p.n=n;p.c=c}else{const np={id:'p'+uid(),n,c};LF.fam.push(np);if($$('.scr.on')[0].id==='s-rules')RT=np.id}save();closeSheet();rerender()};
 if(p)$('psDel').onclick=()=>{const i=LF.fam.indexOf(p),rr=LF.rules[p.id];LF.fam.splice(i,1);delete LF.rules[p.id];const touched=LF.sch.filter(x=>x.who.includes(p.id));touched.forEach(x=>x.who=x.who.filter(w=>w!==p.id));
  if(RT===p.id)RT='fam';save();closeSheet();rerender();undoToast(U('Person removed','أُزيل الفرد','Namni haqameera','Qofka waa la saaray'),()=>{LF.fam.splice(i,0,p);if(rr)LF.rules[p.id]=rr;touched.forEach(x=>x.who.push(p.id));save();rerender()})}}
function ruleSheet(list,r){openSheet(`<div class="hd sub"><button class="tlk" id="rsC">${U('Cancel','إلغاء','Dhiisi','Jooji')}</button><h1>${r?U('Edit rule','تعديل القاعدة','Seera gulaali','Wax ka beddel xeerka'):U('New rule','قاعدة جديدة','Seera haaraa','Xeer cusub')}</h1><button class="tlk b" id="rsOk">${U('Save','حفظ','Olkaaʼi','Kaydi')}</button></div>
 <div class="fm"><label>${U('Rule','القاعدة','Seera','Xeer')}<textarea id="rsT" rows="2" maxlength="120" placeholder="${U('Say what to do, e.g. "Speak kindly."','اكتب ما يجب فعله، مثل «نتكلم بلطف».','Waan godhamu jedhi, fkn. “Gaariin dubbanna.”','Sheeg waxa la sameeyo, tusaale “Si naxariis leh u hadal.”')}">${r?esc(r.t):''}</textarea></label>
 <label>${U('Why (optional)','لماذا (اختياري)','Maaliif (filannoo)','Sababta (ikhtiyaari)')}<input id="rsW" maxlength="100" value="${r&&r.w?esc(r.w):''}"></label>
 <div class="how">${IC('lightbulb',20)}<div><b>${U('Tip','نصيحة','Gorsa','Talo')}</b><small>${U('A few clear rules, said as what to do, work better than many "don’ts".','قواعد قليلة واضحة بصيغة «افعل» أنفع من كثرة «لا تفعل».','Seerri muraasni ifaan “godhi” jedhu “hin godhin” baayʼee caala.','Xeerar yar oo cad oo sheegaya waxa la sameeyo ayaa ka fiican “ha samayn” badan.')}</small></div></div>
 ${r?`<button class="danger" id="rsDel">${U('Delete rule','حذف القاعدة','Seera haqi','Tirtir xeerka')}</button>`:''}</div>`);
 $('rsC').onclick=closeSheet;setTimeout(()=>{if(!r)$('rsT').focus()},250);
 $('rsOk').onclick=()=>{const t=$('rsT').value.trim();if(!t){$('rsT').classList.add('err');$('rsT').focus();return}if(r){r.t=t;r.w=$('rsW').value.trim()}else list.push({id:uid(),t,w:$('rsW').value.trim()});save();closeSheet();R.rules()};
 if(r)$('rsDel').onclick=()=>{const i=list.indexOf(r);list.splice(i,1);save();closeSheet();R.rules();undoToast(U('Rule deleted','حُذفت القاعدة','Seerri haqameera','Xeerka waa la tirtiray'),()=>{list.splice(i,0,r);save();R.rules()})}}
R.rules=()=>{$('ruT').textContent=U('Rules','القواعد','Seerota','Xeerarka');if(RT!=='fam'&&RT!=='me'&&!person(RT))RT='fam';
 const list=LF.rules[RT]=LF.rules[RT]||[],p=person(RT);
 const tabs=[['fam',U('Family','العائلة','Maatii','Qoyska'),'house-line'],['me',U('Mine','قواعدي','Kan koo','Kayga'),'note-pencil'],...LF.fam.map(x=>[x.id,x.n,null,x.c])];
 const sg=RT==='fam'?LS.fam:RT==='me'?LS.me:[];const left=sg.filter(x=>!list.some(r=>r.t===X(x)));
 $('ruB').innerHTML=`<div class="lf-chips">${tabs.map(([id,n,ic,c])=>`<button data-rt="${id}" class="${id===RT?'on':''}">${ic?IC(ic,16):`<i class="lf-dot" style="background:${c}"></i>`}${esc(n)}</button>`).join('')}<button data-rp class="lf-add">${IC('plus',15)}${U('Person','فرد','Nama','Qof')}</button></div>
 <p class="lf-mut">${RT==='fam'?U('Rules everyone at home follows together.','قواعد يتبعها الجميع في البيت.','Seerota namni manaa hundi waliin hordofu.','Xeerar qof walba oo guriga ku jira raaco.'):RT==='me'?U('Your own rules, to live by your values.','قواعدك الخاصة لتعيش بقيمك.','Seerota kee, gatii keetiin jiraachuuf.','Xeerarkaaga si aad ugu noolaato qiyamkaaga.'):U('Rules just for '+p.n+'.','قواعد خاصة بـ'+p.n+'.','Seerota '+p.n+' qofaaf.','Xeerar u gaar ah '+p.n+'.')}${p?` <button class="lf-lk" data-rpe>${IC('pencil-simple',14)}${U('Edit person','تعديل الفرد','Nama gulaali','Wax ka beddel qofka')}</button>`:''}</p>
 ${RT==='me'?hadithCard('bukhari1'):''}
 ${list.length?`<ol class="lf-rules">${list.map((r,i)=>`<li><button data-re="${i}"><span class="lf-n">${AR(i+1)}</span><span><b>${esc(r.t)}</b>${r.w?`<small>${esc(r.w)}</small>`:''}</span></button></li>`).join('')}</ol>`:`<div class="empty2">${IC('scroll',34)}<p>${U('No rules yet. Add your own, or tap a suggestion.','لا قواعد بعد. أضف قاعدتك أو اختر اقتراحًا.','Ammaaf seerri hin jiru. Kan kee dabali ykn yaada filadhu.','Weli xeer ma jiro. Ku dar adiga, ama dooro talo.')}</p></div>`}
 <button class="addb" id="ruAdd">${IC('plus',18)}${U('Add rule','إضافة قاعدة','Seera dabali','Ku dar xeer')}</button>
 ${left.length?`<p class="tgh">${U('Suggested','مقترحات','Yaada','La soo jeediyay')}</p><div class="lf-sug">${left.map(x=>`<button data-rs="${esc(X(x))}">${IC('plus',14)}${esc(X(x))}</button>`).join('')}</div>`:''}
 <div class="lf-foot">${srcChip()}</div>`;
 $$('#ruB [data-rt]').forEach(b=>b.onclick=()=>{RT=b.dataset.rt;R.rules()});
 $$('#ruB [data-rp]').forEach(b=>b.onclick=()=>personSheet());const pe=$('ruB').querySelector('[data-rpe]');if(pe)pe.onclick=()=>personSheet(p);
 $('ruAdd').onclick=()=>ruleSheet(list);$$('#ruB [data-re]').forEach(b=>b.onclick=()=>ruleSheet(list,list[+b.dataset.re]));
 $$('#ruB [data-rs]').forEach(b=>b.onclick=()=>{list.push({id:uid(),t:b.dataset.rs});vib(10);save();R.rules()})};

/* =================== FAMILY SCHEDULE =================== */
let FD=new Date().getDay(),FW=null;
const dName=(i,f='short')=>new Date(2026,10,15+i).toLocaleDateString(L==='ar'?'ar':LOCX,{weekday:f});
const mins=hm=>{const[h,m]=hm.split(':').map(Number);return h*60+m};
const schFor=(day,who)=>LF.sch.filter(x=>x.d.includes(day)&&(!who||x.who.includes('all')||x.who.includes(who))).sort((a,b)=>mins(a.s)-mins(b.s));
const whoChips=x=>x.who.includes('all')?`<span class="lf-who"><i class="lf-dot all"></i>${U('Everyone','الجميع','Hunda','Dhammaan')}</span>`:x.who.map(id=>{const p=person(id);return p?`<span class="lf-who"><i class="lf-dot" style="background:${p.c}"></i>${esc(p.n)}</span>`:''}).join('');
function schSheet(x){const it=x||{t:'',s:'08:00',e:'09:00',d:[FD],who:FW?[FW]:['all']};let d=[...it.d],who=[...it.who];
 openSheet(`<div class="hd sub"><button class="tlk" id="ssC">${U('Cancel','إلغاء','Dhiisi','Jooji')}</button><h1>${x?U('Edit','تعديل','Gulaali','Wax ka beddel'):U('Add to schedule','إضافة إلى الجدول','Sagantaatti dabali','Ku dar jadwalka')}</h1><button class="tlk b" id="ssOk">${U('Save','حفظ','Olkaaʼi','Kaydi')}</button></div>
 <div class="fm"><label>${U('What','ماذا','Maal','Maxay')}<input id="ssT" maxlength="50" value="${esc(it.t)}" placeholder="${U('e.g. School, Work, Qur’an class','مثال: المدرسة، العمل، حلقة القرآن','Fkn. Mana barumsaa, Hojii, Barnoota Qur’aanaa','Tusaale: Dugsi, Shaqo, Dugsi Quraan')}"></label>
 <div class="lf-two"><label>${U('From','من','Irraa','Laga bilaabo')}<input id="ssS" type="time" value="${it.s}"></label><label>${U('To','إلى','Hanga','Ilaa')}<input id="ssE" type="time" value="${it.e}"></label></div>
 <p class="fl2">${U('Days','الأيام','Guyyoota','Maalmaha')}</p><div class="lf-days">${[0,1,2,3,4,5,6].map(i=>`<button data-sd="${i}" class="${d.includes(i)?'on':''}">${esc(dName(i))}</button>`).join('')}</div>
 <p class="fl2">${U('Who','مَن','Eenyu','Yaa')}</p><div class="lf-chips wrap">${[['all',U('Everyone','الجميع','Hunda','Dhammaan'),null],...LF.fam.map(p=>[p.id,p.n,p.c])].map(([id,n,c])=>`<button data-sw="${id}" class="${who.includes(id)?'on':''}">${c?`<i class="lf-dot" style="background:${c}"></i>`:`<i class="lf-dot all"></i>`}${esc(n)}</button>`).join('')}<button data-sp class="lf-add">${IC('plus',15)}${U('Person','فرد','Nama','Qof')}</button></div>
 ${x?`<button class="danger" id="ssDel">${U('Delete','حذف','Haqi','Tirtir')}</button>`:''}</div>`);
 $$('#sh [data-sd]').forEach(b=>b.onclick=()=>{const i=+b.dataset.sd,k=d.indexOf(i);if(k>=0){if(d.length>1)d.splice(k,1)}else d.push(i);$$('#sh [data-sd]').forEach(y=>y.classList.toggle('on',d.includes(+y.dataset.sd)))});
 $$('#sh [data-sw]').forEach(b=>b.onclick=()=>{const id=b.dataset.sw;if(id==='all')who=['all'];else{who=who.filter(w=>w!=='all');const k=who.indexOf(id);if(k>=0)who.splice(k,1);else who.push(id);if(!who.length)who=['all']}$$('#sh [data-sw]').forEach(y=>y.classList.toggle('on',who.includes(y.dataset.sw)))});
 $('sh').querySelector('[data-sp]').onclick=()=>personSheet();
 $('ssC').onclick=closeSheet;setTimeout(()=>{if(!x)$('ssT').focus()},250);
 $('ssOk').onclick=()=>{const t=$('ssT').value.trim(),s=$('ssS').value,e=$('ssE').value;if(!t){$('ssT').classList.add('err');$('ssT').focus();return}if(!s||!e||mins(e)<=mins(s)){$('ssE').classList.add('err');toast(U('End time must be after start time','وقت الانتهاء يجب أن يكون بعد البداية','Yeroon xumuraa jalqabaa booda taʼuu qaba','Waqtiga dhammaadku waa inuu ka dambeeyaa bilowga'));return}
  if(x)Object.assign(x,{t,s,e,d:d.sort(),who});else LF.sch.push({id:uid(),t,s,e,d:d.sort(),who});save();closeSheet();R.fam()};
 if(x)$('ssDel').onclick=()=>{const i=LF.sch.indexOf(x);LF.sch.splice(i,1);save();closeSheet();R.fam();undoToast(U('Deleted','حُذف','Haqameera','Waa la tirtiray'),()=>{LF.sch.splice(i,0,x);save();R.fam()})}}
function nowCard(){const n=NOW(),day=n.getDay(),m=n.getHours()*60+n.getMinutes();const ppl=[...LF.fam.map(p=>p.id)];if(!ppl.length)return'';
 return `<div class="lf-now"><p class="ey">${U('Right now','الآن','Amma','Hadda')} · ${f12(String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0'))}</p>${ppl.map(id=>{const p=person(id),l=schFor(day,id),cur=l.find(x=>mins(x.s)<=m&&m<mins(x.e)),nx=l.find(x=>mins(x.s)>m);
  return `<div class="lf-nr"><i class="lf-dot" style="background:${p.c}"></i><b>${esc(p.n)}</b><span>${cur?`${esc(cur.t)} <small>${U('until','حتى','hanga','ilaa')} ${f12(cur.e)}</small>`:`<small>${U('Free','متفرّغ','Bilisa','Firaaqo')}${nx?' · '+U('next','التالي','itti aanu','xiga')+': '+esc(nx.t)+' '+f12(nx.s):''}</small>`}</span></div>`}).join('')}</div>`}
function icsFor(who){const pad=n=>String(n).padStart(2,'0'),BY=['SU','MO','TU','WE','TH','FR','SA'],now=new Date(),st=now.getUTCFullYear()+pad(now.getUTCMonth()+1)+pad(now.getUTCDate())+'T'+pad(now.getUTCHours())+pad(now.getUTCMinutes())+'00Z';
 const esc2=s=>String(s).replace(/[\\;,]/g,m=>'\\'+m).replace(/\n/g,'\\n');let o='BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Fastaqim//Family schedule//EN\r\nCALSCALE:GREGORIAN\r\n';
 LF.sch.filter(x=>!who||x.who.includes('all')||x.who.includes(who)).forEach(x=>{const d=new Date();d.setHours(0,0,0,0);while(!x.d.includes(d.getDay()))d.setDate(d.getDate()+1);const ds=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate());
  const nm=x.who.includes('all')?'':' ('+x.who.map(id=>(person(id)||{}).n).filter(Boolean).join(', ')+')';
  o+=`BEGIN:VEVENT\r\nUID:${x.id}@fastaqim\r\nDTSTAMP:${st}\r\nDTSTART:${ds}T${x.s.replace(':','')}00\r\nDTEND:${ds}T${x.e.replace(':','')}00\r\nRRULE:FREQ=WEEKLY;BYDAY=${x.d.map(i=>BY[i]).join(',')}\r\nSUMMARY:${esc2(x.t+nm)}\r\nEND:VEVENT\r\n`});
 return o+'END:VCALENDAR\r\n'}
function shareSheet(){const opts=[['',U('Everyone’s schedule','جدول الجميع','Sagantaa hundaa','Jadwalka dhammaan'),null],...LF.fam.map(p=>[p.id,p.n,p.c])];
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${U('Share the schedule','مشاركة الجدول','Sagantaa qooduu','La wadaag jadwalka')}</h1>${XB}</div>
 <p class="note">${U('Each person can add their part to their own phone calendar. It repeats every week.','يستطيع كل فرد إضافة جزئه إلى تقويم هاتفه، ويتكرر كل أسبوع.','Namni hundi qooda isaa kaalaandarii bilbila isaatti dabaluu dandaʼa. Torban torbaniin irra deebiʼa.','Qof walba wuxuu ku dari karaa qaybtiisa kalandarka taleefankiisa. Toddobaad kasta ayuu soo noqdaa.')}</p>
 <div class="gl">${opts.map(([id,n,c])=>`<button data-ics="${id}">${c?`<i class="lf-dot lg" style="background:${c}"></i>`:`<span class="ic c-a">${IC('calendar-plus',20)}</span>`}<span>${esc(n)}</span><em>${U('Add to calendar','أضف إلى التقويم','Kaalaandaritti dabali','Ku dar kalandarka')}</em>${IC('download-simple',18)}</button>`).join('')}</div>
 <button class="lf-btn" id="shTx">${IC('share-network',18)}${U('Send today as a message','أرسل جدول اليوم كرسالة',"Har'a akka ergaatti ergi",'U dir maanta fariin ahaan')}</button>`);
 $$('#sh [data-ics]').forEach(b=>b.onclick=()=>{const who=b.dataset.ics,p=person(who),blob=new Blob([icsFor(who)],{type:'text/calendar'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Fastaqim-'+(p?p.n.replace(/[^\w؀-ۿ-]+/g,'-'):'family')+'.ics';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);toast(U('Calendar file ready','ملف التقويم جاهز','Faayiliin kaalaandarii qophaaʼeera','Faylka kalandarka waa diyaar'))});
 $('shTx').onclick=async()=>{const day=new Date().getDay(),l=schFor(day);const txt=U('Family schedule','جدول العائلة','Sagantaa maatii','Jadwalka qoyska')+' · '+dName(day,'long')+'\n'+l.map(x=>f12(x.s)+'–'+f12(x.e)+'  '+x.t+'  ('+(x.who.includes('all')?U('Everyone','الجميع','Hunda','Dhammaan'):x.who.map(id=>(person(id)||{}).n).filter(Boolean).join(', '))+')').join('\n');
  try{if(navigator.share){await navigator.share({text:txt});return}await navigator.clipboard.writeText(txt);toast(U('Copied','نُسخ','Garagalfameera','Waa la koobiyeeyay'))}catch(e){}}}
R.fam=()=>{$('fmT').textContent=U('Family schedule','جدول العائلة','Sagantaa maatii','Jadwalka qoyska');$('fmAdd').onclick=()=>schSheet();if(FW&&!person(FW))FW=null;
 const l=schFor(FD,FW),today=new Date().getDay();
 $('fmB').innerHTML=`${LF.fam.length?nowCard():`<div class="how lf-how">${IC('calendar-plus',22)}<div><b>${U('Add your family first','أضف أفراد العائلة أولًا','Dura maatii kee dabali','Marka hore ku dar qoyskaaga')}</b><small>${U('Then everyone’s day shows here, so each person knows where the others are.','بعدها يظهر يوم الجميع هنا، فيعرف كل فرد أين الآخرون.','Achiin guyyaan hundaa asitti mulʼata; namni hundi kaan eessa akka jiran beeka.','Kadib maalinta qof walba halkan ayay ka muuqataa, qof walbana wuu ogaadaa halka kuwa kale joogaan.')}</small><button class="lf-btn" data-fp>${IC('plus',16)}${U('Add a person','إضافة فرد','Nama dabali','Ku dar qof')}</button></div></div>`}
 <div class="lf-days sc">${[0,1,2,3,4,5,6].map(i=>`<button data-fd="${i}" class="${i===FD?'on':''}${i===today?' td':''}">${esc(dName(i))}</button>`).join('')}</div>
 <div class="lf-chips">${[['',U('Everyone','الجميع','Hunda','Dhammaan'),null],...LF.fam.map(p=>[p.id,p.n,p.c])].map(([id,n,c])=>`<button data-fw="${id}" class="${(FW||'')===id?'on':''}">${c?`<i class="lf-dot" style="background:${c}"></i>`:`<i class="lf-dot all"></i>`}${esc(n)}</button>`).join('')}${LF.fam.length?`<button data-fp class="lf-add">${IC('plus',15)}${U('Person','فرد','Nama','Qof')}</button>`:''}</div>
 ${l.length?`<div class="lf-tl">${l.map(x=>`<button class="lf-ti" data-fe="${x.id}"><span class="lf-tt"><b>${f12(x.s)}</b><small>${f12(x.e)}</small></span><span class="lf-tb" style="--c:${x.who.includes('all')?'var(--acc)':(person(x.who[0])||{}).c||'var(--acc)'}"><b>${esc(x.t)}</b><span class="lf-ws">${whoChips(x)}</span></span></button>`).join('')}</div>`:`<div class="empty2">${IC('calendar-blank',34)}<p>${U('Nothing on '+dName(FD,'long')+' yet. Tap + to add school, work, Qur’an class, meals or chores.','لا شيء يوم '+dName(FD,'long')+' بعد. اضغط + لإضافة المدرسة أو العمل أو حلقة القرآن أو الوجبات أو المهام.',dName(FD,'long')+' ammaaf homaa hin jiru. Mana barumsaa, hojii, barnoota Qur’aanaa, nyaata ykn hojii manaa dabaluuf + tuqi.','Weli waxba ma jiraan '+dName(FD,'long')+'. Taabo + si aad ugu darto dugsi, shaqo, dugsi Quraan, cunto ama shaqooyin.')}</p></div>`}
 ${LF.sch.length?`<button class="lf-btn" id="fmSh">${IC('calendar-plus',18)}${U('Share or add to phone calendar','شارك أو أضف إلى تقويم الهاتف','Qoodi ykn kaalaandarii bilbilaatti dabali','La wadaag ama ku dar kalandarka taleefanka')}</button>`:''}`;
 $$('#fmB [data-fd]').forEach(b=>b.onclick=()=>{FD=+b.dataset.fd;R.fam()});$$('#fmB [data-fw]').forEach(b=>b.onclick=()=>{FW=b.dataset.fw||null;R.fam()});
 $$('#fmB [data-fp]').forEach(b=>b.onclick=()=>personSheet());$$('#fmB [data-fe]').forEach(b=>b.onclick=()=>schSheet(LF.sch.find(x=>x.id===b.dataset.fe)));
 if($('fmSh'))$('fmSh').onclick=shareSheet};

/* =================== GUIDES =================== */
let GC='calm',GD='breath';
const cat=id=>LG.find(c=>c.id===id)||LG[0];
function openGuide(k){const[c,g]=k.split('/');GC=c;GD=g;go('g')}
R.gc=()=>{const c=cat(GC);$('gcT').textContent=X(c.t);
 $('gcB').innerHTML=`<div class="lf-ch"><span class="ic c-a">${IC(c.ic,24)}</span><p>${esc(X(c.s))}</p>${srcChip()}</div>
 <div class="gl lf-gl">${c.g.map(g=>`<button data-lfg="${c.id}/${g.id}"><span class="ic c-a">${IC(g.ic,21)}</span><span class="lf-rt"><b>${esc(X(g.t))}</b><small>${esc(X(g.d))}</small></span><i class="ph ph-caret-right cv flip"></i></button>`).join('')}</div>
 ${LI>=0?`<p class="lf-mut sm">${U('','','Hiikkaan Afaan Oromoo kun kan Fastaqim, ammas ni sakatta’ama.','Turjumaadda Soomaaliga waa tan Fastaqim, weli waa la eegayaa.')}</p>`:''}`};
R.g=()=>{const c=cat(GC),g=c.g.find(x=>x.id===GD)||c.g[0],i=c.g.indexOf(g),pv=c.g[i-1],nx=c.g[i+1];$('gT').textContent=X(c.t);
 const goLbl={dhikr:U('Open Dhikr','افتح الذكر','Zikrii bani','Fur Dikriga'),hab:U('Open my evening review','افتح محاسبة المساء','Of qoruu galgalaa bani','Fur is-xisaabinta fiidka')};
 $('gB').innerHTML=`<div class="lf-gh2"><span class="ic c-a">${IC(g.ic,26)}</span><h2>${esc(X(g.t))}</h2><p>${esc(X(g.d))}</p></div>
 ${g.tool==='breath'?breathHTML():''}
 <ol class="lf-steps">${g.st.map(s=>{const lk=s.find(x=>x&&x.u);return `<li><span class="lf-n">${AR(g.st.indexOf(s)+1)}</span><p>${esc(X(s.filter(x=>typeof x==='string')))}${lk?` <a href="${lk.u}" target="_blank" rel="noopener" class="lf-sl">${esc(lk.l)}</a>`:''}</p></li>`}).join('')}</ol>
 ${g.tool==='thought'?thoughtHTML():''}
 ${g.go?`<button class="lf-btn" data-go="${g.go}">${IC('arrow-right',16)}${goLbl[g.go]}</button>`:''}
 ${g.w?`<div class="how lf-why">${IC('lightbulb',20)}<div><b>${U('Why it helps','لماذا ينفع','Maaliif akka gargaaru','Sababta ay u caawiso')}</b><small>${esc(X(g.w))}</small></div></div>`:''}
 ${refHTML(g.r)}
 <div class="lf-foot">${srcChip()}</div>
 <div class="lf-pn">${pv?`<button data-lfg="${c.id}/${pv.id}">${IC('caret-left',16)}<span>${esc(X(pv.t))}</span></button>`:'<span></span>'}${nx?`<button data-lfg="${c.id}/${nx.id}" class="nx"><span>${esc(X(nx.t))}</span>${IC('caret-right',16)}</button>`:''}</div>`;
 $$('#gB .lf-pn .ph-caret-left,#gB .lf-pn .ph-caret-right').forEach(e=>e.classList.add('flip'));
 if(g.tool==='breath')breathBind();if(g.tool==='thought')thoughtBind();fillAyat($('gB'))};

/* breathing helper: in 4, out 6, five rounds, gentle vibration on each change (no sound) */
let BR=null;
function breathHTML(){return `<div class="lf-br"><div class="lf-brc" id="brC"><span id="brT">${U('Ready','جاهز','Qophaaʼi','Diyaar')}</span><small id="brN"></small></div><button class="addb" id="brGo">${IC('play',18,1)}${U('Start','ابدأ','Jalqabi','Bilow')}</button></div>`}
function breathStop(msg){if(BR){clearTimeout(BR.t);BR=null}const c=$('brC');if(c){c.className='lf-brc';c.style.transitionDuration='.6s'}if($('brT'))$('brT').textContent=msg||U('Ready','جاهز','Qophaaʼi','Diyaar');if($('brN'))$('brN').textContent='';if($('brGo'))$('brGo').innerHTML=IC('play',18,1)+U('Start','ابدأ','Jalqabi','Bilow')}
function breathBind(){breathStop();$('brGo').onclick=()=>{if(BR){breathStop();return}BR={n:0};$('brGo').innerHTML=IC('stop',18,1)+U('Stop','إيقاف','Dhaabi','Jooji');
 const step=ph=>{if(!BR||!$('brC'))return breathStop();const c=$('brC');
  if(ph==='in'){BR.n++;if(BR.n>5){breathStop(U('Well done','أحسنت','Baayʼee gaarii','Si fiican'));vib([15,40,15]);try{ciBurst($('brC'))}catch(e){}return}
   c.style.transitionDuration='4s';c.className='lf-brc in';$('brT').textContent=U('Breathe in','شهيق','Ol fudhu','Neef qaado');$('brN').textContent=AR(BR.n)+' / '+AR(5);vib(12);BR.t=setTimeout(()=>step('out'),4000)}
  else{c.style.transitionDuration='6s';c.className='lf-brc out';$('brT').textContent=U('Breathe out slowly','زفير ببطء','Suuta baasi','Si tartiib ah u neef saar');vib(8);BR.t=setTimeout(()=>step('in'),6000)}};
 step('in')}}
{const _go=go;go=function(s,p){if(BR&&s!=='g')breathStop();return _go(s,p)}}

/* thought check: saved on the device and synced with the account */
function thoughtHTML(){const q=[['thT',U('The thought','الفكرة','Yaada','Fikradda')],['thF',U('Facts for it','حقائق تؤيدها','Dhugaa deeggaru','Xaqiiqooyin taageeraya')],['thA',U('Facts against it','حقائق لا تؤيدها','Dhugaa hin deeggarre','Xaqiiqooyin aan taageerin')],['thB',U('A fairer thought','فكرة أعدل','Yaada caalaatti haqaa','Fikrad caddaalad badan')]];
 return `<div class="lf-th"><p class="tgh">${U('Try it now','جرّبها الآن','Amma yaali','Hadda isku day')}</p><div class="fm">${q.map(([id,l])=>`<label>${l}<textarea id="${id}" rows="2"></textarea></label>`).join('')}<button class="addb" id="thSave">${IC('check',18)}${U('Save','حفظ','Olkaaʼi','Kaydi')}</button></div>
 ${LF.th.length?`<p class="tgh">${U('Saved','المحفوظ','Kan olkaaʼame','La kaydiyay')}</p><div class="lst lf-thl">${LF.th.slice().reverse().map(x=>`<details><summary><b>${esc(x.b||x.t)}</b><small>${esc(new Date(x.at).toLocaleDateString(L==='ar'?'ar':LOCX,{day:'numeric',month:'short'}))}</small></summary><p><i>${U('Thought','الفكرة','Yaada','Fikradda')}:</i> ${esc(x.t)}</p>${x.f?`<p><i>${U('For','مع','Deeggaru','Taageero')}:</i> ${esc(x.f)}</p>`:''}${x.a?`<p><i>${U('Against','ضد','Faallaa','Ka soo horjeed')}:</i> ${esc(x.a)}</p>`:''}<button class="lf-lk" data-thd="${x.at}">${IC('trash',14)}${U('Delete','حذف','Haqi','Tirtir')}</button></details>`).join('')}</div>`:''}</div>`}
function thoughtBind(){$('thSave').onclick=()=>{const v=id=>$(id).value.trim();if(!v('thT')){$('thT').classList.add('err');$('thT').focus();return}
 LF.th.push({at:Date.now(),t:v('thT'),f:v('thF'),a:v('thA'),b:v('thB')});save();vib([12,30,12]);toast(U('Saved','حُفظ','Olkaaʼameera','Waa la kaydiyay'));R.g()};
 $$('#gB [data-thd]').forEach(b=>b.onclick=()=>{const i=LF.th.findIndex(x=>String(x.at)===b.dataset.thd),x=LF.th[i];LF.th.splice(i,1);save();R.g();undoToast(U('Deleted','حُذف','Haqameera','Waa la tirtiray'),()=>{LF.th.splice(i,0,x);save();R.g()})})}

/* deep links (#life, #hab, #rules, #fam, #g) open straight away */
let h0='';try{h0=new URL(performance.getEntriesByType('navigation')[0].name).hash.slice(1)}catch(e){}if(!h0)h0=location.hash.slice(1);if(['life','hab','rules','fam','gc','g'].includes(h0))setTimeout(()=>go(h0,false),0);
if($$('.scr.on')[0]&&$$('.scr.on')[0].id==='s-more')R.more();
window.fqLife={openGuide};
})();
