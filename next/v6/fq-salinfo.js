/* Fastaqim "Excused from salah": what Islam counts as an excuse, when it starts and ends,
   and today's exact salah windows. Every point carries its Qur'an or sahih hadith source.
   Opens from the small (i) beside "excused" (More > Salah this week, and the salah sheet).
   (c) Fastaqim, all rights reserved. */
(function(){'use strict';
const OS={"What counts as an excuse": ["Maaltu sababa ta'a", "Maxaa cudur-daar ah"], "Sunrise": ["Ba'uu aduu", "Qorrax soo bax"], "Ends at sunrise": ["Ba'uu aduutiin xumurama", "Wuxuu ku dhammaadaa qorrax soo baxa"], "Ends when Asr begins": ["Yeroo Asriin jalqabu xumurama", "Wuxuu dhammaadaa marka Casarku galo"], "Pray before the sun turns pale. Ends at sunset": ["Osoo aduun hin keelloomin salaati. Lixa aduutiin xumurama", "Tuko inta qorraxdu aysan huruudoobin. Wuxuu ku dhammaadaa qorrax dhaca"], "Ends when the twilight is gone (Isha)": ["Diimaan samii yeroo badu xumurama (Ishaa)", "Wuxuu dhammaadaa marka casaanka cirku baaba'o (Cishaha)"], "Ends at the middle of the night": ["Walakkaa halkanii irratti xumurama", "Wuxuu ku dhammaadaa badhka habeenka"], "Starts": ["Jalqaba", "Bilaabma"], "Ends": ["Xumurama", "Dhammaada"], "Excused from salah": ["Sababa salaata irraa nama hambisu", "Cudur-daarka salaadda"], "Salah is prescribed for the believers at fixed times.": ["Dhugumatti salaanni mu'mintoota irratti yeroo murtaa'een dirqama.", "Salaaddu waxay mu'miniinta ku waajibtay waqtiyo go'an."], "Salah is never skipped on purpose. Only these two excuse it. In the tracker, excused prayers are not counted for or against you.": ["Salaanni beekaa gonkumaa hin dhiifamu. Kan ishee irraa nama hambisu lamaan kana qofa. Hordoffii keessatti, salaanni sababaan hafe siif ykn sirratti hin lakkaa'amu.", "Salaadda si ula kac ah looma daayo. Kaliya labadan ayaa cudur-daar ah. Raadraaca, salaadda cudur-daarka ah laguuma xisaabo, laguumana xisaabiyo."], "Excused": ["Dhimma qaba", "Cudurdaar"], "Monthly or after-birth bleeding (hayd, nifas)": ["Dhiiga ji'aa ykn da'umsa booda (haydii, nifaasii)", "Dhiigga caadada ama dhalmada kadib (xayd, nifaas)"], "No salah while it lasts, and it is not made up later.": ["Hamma itti fufetti salaanni hin jiru, boodas hin baafamu.", "Inta uu socdo salaad ma jirto, gadaalna lama gudo."], "When the bleeding begins": ["Yeroo dhiigni jalqabu", "Marka dhiiggu bilaabmo"], "When it stops. Then ghusl, and pray the next salah": ["Yeroo dhaabbatu. Achiis ghusla, salaata itti aanu salaati", "Marka uu joogsado. Kadib qubeys (ghusl), oo tuko salaadda xigta"], "Losing the mind or consciousness (for example a coma)": ["Sammuu ykn of beekuu dhabuu (fakkeenyaaf koomaa)", "Caqli ama miyir beelid (tusaale ahaan koomo)"], "The pen is lifted until the mind returns. Scholars differ on making up a long unconsciousness; ask a trusted scholar.": ["Hamma sammuun deebi'utti qalamni ol fudhatameera. Of wallaaluu dheeraa baafachuu irratti beektonni ni wal dhabu; beekaa amanattu gaafadhu.", "Qalinka waa laga qaaday ilaa caqligu soo noqdo. Culimadu way ku kala duwan yihiin gudashada miyir-beel dheer; weydii caalim aad aaminto."], "When awareness is lost": ["Yeroo of beekuun badu", "Marka miyirku tago"], "When it returns. Pray the salah whose time you are in": ["Yeroo deebi'u. Salaata yeroo ati keessa jirtuu salaati", "Marka uu soo noqdo. Tuko salaadda waqtigeeda aad ku jirto"], "Not excused: pray as you can": ["Sababa miti: akka dandeessetti salaati", "Cudur-daar maaha: u tuko sida aad awoodo"], "Slept through it or forgot": ["Rafuu ykn irraanfachuu", "Hurdo ama hilmaan"], "Pray it as soon as you wake up or remember.": ["Akkuma dammaqxe ykn yaadatteen salaati.", "Tuko isla marka aad toosto ama xusuusato."], "Ill or in pain": ["Dhukkuba ykn dhukkubbii", "Jirro ama xanuun"], "Pray standing. If you cannot, sitting. If you cannot, lying on your side.": ["Dhaabbadhuu salaati. Yoo hin dandeenye, taa'ii. Yoo hin dandeenye, cinaachaan ciisii.", "Tuko adigoo taagan. Haddii aadan karin, fadhiiso. Haddii aadan karin, dhinac u jiifso."], "Travelling": ["Imala", "Safar"], "Shorten the 4-rakah prayers to 2. Joining two prayers is allowed.": ["Salaata raka'aa 4 gara 2tti gabaabsi. Salaata lama walitti qabuun ni hayyamama.", "Salaadaha 4-ta rakac ah ka dhig 2. Isu-geynta laba salaadood waa la oggol yahay."], "Work, school, busy or tired": ["Hojii, mana barumsaa, qabatamuu ykn dadhabuu", "Shaqo, iskuul, mashquul ama daal"], "Not an excuse. Pray within its time.": ["Sababa miti. Yeroo isaa keessatti salaati.", "Cudur-daar maaha. Ku tuko waqtigeeda."], "Today's salah times": ["Yeroo salaataa har'aa", "Waqtiyada salaadda maanta"], "Times are for your saved location.": ["Yeroon bakka kee kuufame irratti hundaa'a.", "Waqtiyadu waa kuwa goobtaada la keydiyay."]};
const X=(en,ar)=>L==='ar'?ar:(LI>=0&&OS[en])?OS[en][LI]:(LI>=0&&typeof DICT==='object'&&DICT[en])?DICT[en][LI]:en;
const Q=(s,a)=>`https://quran.com/${s}/${a}`,H=p=>`https://sunnah.com/${p}`;
const src=(u,en,ar)=>`<a class="fsi-src" href="${u}" target="_blank" rel="noopener">${X(en,ar)} ↗</a>`;
const ib=(a)=>`<button class="fsi-i" type="button" data-fsi aria-label="${X('What counts as an excuse','ما الأعذار في الصلاة')}"${a||''}><i class="ph ph-info"></i></button>`;
window.fqExcBtn=ib;

/* ---- today's windows ---- */
const mm=hm=>{const[h,m]=hm.split(':').map(Number);return h*60+m};
const hm=t=>{t=((Math.round(t)%1440)+1440)%1440;return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0')};
function adj(p){const A=(S.loc&&S.loc.adj)||{};for(const k in A)if(p[k])p[k]=hm(mm(p[k])+A[k]);return p}
function times(){try{typeof salApply==='function'&&salApply()}catch(e){}const g={};SAL.forEach(s=>g[s[0]]=s[3]);let sr=null,nf=g.fajr;
 try{if(S.loc&&isFinite(S.loc.lat)&&typeof prayerTimes==='function'){const d=NOW(),t=new Date(d);t.setDate(t.getDate()+1);
  const m=S.loc.meth||'mwl';sr=adj(prayerTimes(d,S.loc.lat,S.loc.lng,m,S.loc.hanafi)).sunrise;nf=adj(prayerTimes(t,S.loc.lat,S.loc.lng,m,S.loc.hanafi)).fajr}}catch(e){}
 const mg=mm(g.maghrib),mid=hm(mg+((mm(nf)+1440-mg)%1440)/2);return{g,sr,mid}}
function win(){const{g,sr,mid}=times(),f=f12;
 const row=(k,en,ar,from,to,ne,na)=>`<div class="fsi-tr"><b>${X(en,ar)}</b><span><em>${f(from)}</em><i class="ph ph-arrow-right"></i><em>${to?f(to):X('Sunrise','الشروق')}</em></span><small>${X(ne,na)}</small></div>`;
 return row('fajr','Fajr','الفجر',g.fajr,sr,'Ends at sunrise','ينتهي بشروق الشمس')
  +row('dhuhr','Dhuhr','الظهر',g.dhuhr,g.asr,'Ends when Asr begins','ينتهي بدخول العصر')
  +row('asr','Asr','العصر',g.asr,g.maghrib,'Pray before the sun turns pale. Ends at sunset','صلِّها قبل اصفرار الشمس، وينتهي بالغروب')
  +row('maghrib','Maghrib','المغرب',g.maghrib,g.isha,'Ends when the twilight is gone (Isha)','ينتهي بغياب الشفق (العشاء)')
  +row('isha','Isha','العشاء',g.isha,mid,'Ends at the middle of the night','ينتهي بمنتصف الليل')}

function item(icon,t,body,when,s){return `<div class="fsi-it"><i class="ph ${icon} fsi-ic"></i><div><b>${t}</b><p>${body}</p>${when||''}<div class="fsi-ss">${s}</div></div></div>`}
const when=(a,b)=>`<div class="fsi-w"><span><small>${X('Starts','يبدأ')}</small>${a}</span><span><small>${X('Ends','ينتهي')}</small>${b}</span></div>`;

function open(){if(typeof openSheet!=='function')return;
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Excused from salah','الأعذار في الصلاة')}</h1>${XB}</div>
 <div class="fsi">
 <div class="fsi-ay"><p class="fsi-ar">إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ<br>كِتَابًا مَّوْقُوتًا</p>
  ${L==='ar'?'':`<p class="fsi-en">${X('Salah is prescribed for the believers at fixed times.','')}</p>`}${src(Q(4,103),"Qur'an, Surah An-Nisa 4:103",'القرآن، سورة النساء ٤:١٠٣')}</div>
 <p class="fsi-lead">${X('Salah is never skipped on purpose. Only these two excuse it. In the tracker, excused prayers are not counted for or against you.','لا تُترك الصلاة عمدًا. لا يُسقطها إلا هذان العذران. في المتابعة، الصلاة بعذر لا تُحسب لك ولا عليك.')}</p>

 <h3 class="fsi-h">${X('Excused','عذر يُسقط الصلاة')}</h3>
 ${item('ph-drop',X('Monthly or after-birth bleeding (hayd, nifas)','الحيض والنفاس'),
   X('No salah while it lasts, and it is not made up later.','لا صلاة مدّته، ولا تُقضى بعده.'),
   when(X('When the bleeding begins','عند نزول الدم'),X('When it stops. Then ghusl, and pray the next salah','عند انقطاعه، ثم الغسل والصلاة')),
   src(H('bukhari:306'),'Sahih al-Bukhari 306','صحيح البخاري ٣٠٦')+src(H('muslim:335a'),'Sahih Muslim 335','صحيح مسلم ٣٣٥'))}
 ${item('ph-heartbeat',X('Losing the mind or consciousness (for example a coma)','زوال العقل أو الوعي (كالغيبوبة)'),
   X('The pen is lifted until the mind returns. Scholars differ on making up a long unconsciousness; ask a trusted scholar.','رُفع القلم حتى يعود العقل. واختلف العلماء في قضاء الإغماء الطويل؛ فاسأل عالمًا تثق به.'),
   when(X('When awareness is lost','عند زوال الوعي'),X('When it returns. Pray the salah whose time you are in','عند عودته، فصلِّ صلاة الوقت')),
   src(H('abudawud:4403'),'Sunan Abi Dawud 4403 (sahih)','سنن أبي داود ٤٤٠٣ (صحيح)'))}

 <h3 class="fsi-h">${X('Not excused: pray as you can','ليس عذرًا: صلِّ بما تستطيع')}</h3>
 ${item('ph-moon',X('Slept through it or forgot','النوم أو النسيان'),
   X('Pray it as soon as you wake up or remember.','صلِّها حين تستيقظ أو تتذكّر.'),'',
   src(H('muslim:684a'),'Sahih Muslim 684','صحيح مسلم ٦٨٤'))}
 ${item('ph-first-aid',X('Ill or in pain','المرض أو الألم'),
   X('Pray standing. If you cannot, sitting. If you cannot, lying on your side.','صلِّ قائمًا، فإن لم تستطع فقاعدًا، فإن لم تستطع فعلى جنب.'),'',
   src(H('bukhari:1117'),'Sahih al-Bukhari 1117','صحيح البخاري ١١١٧')+src(Q(64,16),"Qur'an 64:16",'القرآن ٦٤:١٦'))}
 ${item('ph-airplane-tilt',X('Travelling','السفر'),
   X('Shorten the 4-rakah prayers to 2. Joining two prayers is allowed.','تُقصر الرباعية إلى ركعتين، ويجوز الجمع.'),'',
   src(Q(4,101),"Qur'an 4:101",'القرآن ٤:١٠١')+src(H('bukhari:1106'),'Sahih al-Bukhari 1106','صحيح البخاري ١١٠٦'))}
 ${item('ph-briefcase',X('Work, school, busy or tired','العمل أو الدراسة أو الانشغال أو التعب'),
   X('Not an excuse. Pray within its time.','ليس عذرًا. صلِّها في وقتها.'),'',
   src(H('muslim:82'),'Sahih Muslim 82','صحيح مسلم ٨٢'))}

 <h3 class="fsi-h">${X("Today's salah times",'أوقات الصلاة اليوم')}</h3>
 <div class="fsi-t">${win()}</div>
 <p class="fsi-n">${X('Times are for your saved location.','الأوقات حسب موقعك المحفوظ.')} ${src(H('muslim:612a'),'Sahih Muslim 612','صحيح مسلم ٦١٢')}</p>
 </div>`)}
window.fqExc=open;
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-fsi]');if(!b)return;e.preventDefault();e.stopPropagation();vib&&vib(8);open()},true);
})();
