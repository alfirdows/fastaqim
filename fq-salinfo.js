/* Fastaqim "Excused from salah": what Islam counts as an excuse, when it starts and ends,
   and today's exact salah windows. Every point carries its Qur'an or sahih hadith source.
   Opens from the small (i) beside "excused" (More > Salah this week, and the salah sheet).
   (c) Fastaqim, all rights reserved. */
(function(){'use strict';
const OS={"Marking salah": ["Mallattoo salaataa", "Calaamadinta salaadda"], "Prayed early in its time, soon after it begins. The most beloved deed to Allah.": ["Jalqaba yeroo ishee, akkuma seenteen salaatame. Hojii Rabbiin biratti caalaa jaallatamu.", "Lagu tukaday bilowga waqtigeeda, isla marka uu galo. Camalka Alle ugu jecel."], "Later in its time": ["Yeroo ishee keessatti booda", "Dib, waqtigeeda gudihiisa"], "Still in its time and valid. For example Dhuhr 50 minutes after it begins, or just before Asr. Fine at times, but try not to make it a habit. Asr: pray before the sun turns pale.": ["Ammayyuu yeroo ishee keessa, ni fudhatama. Fakkeenyaaf Zuhrii daqiiqaa 50 booda, ykn Asrii dura. Yeroo tokko tokko ni ta'a, garuu barsiifata hin godhatin. Asrii: osoo aduun hin keelloomin salaati.", "Weli waa waqtigeedii, waana la aqbalay. Tusaale ahaan Duhurka 50 daqiiqo kadib, ama Casarka wax yar ka hor. Mararka qaar waa caadi, laakiin ha ka dhigin caado. Casarka: tuko inta qorraxdu aysan huruudoobin."], "Prayed after its time ended. Only for sleeping through it or forgetting.": ["Yeroon ishee erga darbee booda salaatame. Rafuu ykn irraanfachuu qofaaf.", "La tukaday kadib markii waqtigeedu dhammaaday. Kaliya hurdo ama hilmaan."], "Combining two salah": ["Salaata lama walitti qabuu", "Isu-geynta laba salaadood"], "Dhuhr with Asr, or Maghrib with Isha": ["Zuhrii fi Asrii, ykn Magribii fi Ishaa", "Duhurka iyo Casarka, ama Maqribka iyo Cishaha"], "Allowed when travelling, and for a real need such as illness or heavy rain, so you are not in hardship. Not as a daily habit. Mark both as On time.": ["Imala irratti, akkasumas barbaachisummaa dhugaa kan akka dhukkubaa ykn rooba cimaaf ni hayyamama, akka ati hin rakkanneef. Barsiifata guyyaa guyyaa miti. Lamaanuu “Yeroon” jedhii mallatteessi.", "Waa la oggol yahay safarka, iyo baahi dhab ah sida jirro ama roob culus, si aadan u dhibaatoon. Caado maalinle ah maaha. Labadaba u calaamadee “Waqtigeeda”."], "More about making up": ["Waa'ee baafachuu dabalataan", "Wax dheeraad ah oo gudasho ku saabsan"], "What counts as an excuse?": ["Maaltu sababa ta'a?", "Maxaa cudur-daar ah?"], "Early in its time": ["Jalqaba yeroo ishee", "Bilowga waqtigeeda"], "Still in its time": ["Ammayyuu yeroo ishee keessa", "Weli waqtigeeda gudihiisa"], "What do these mean?": ["Kunneen maal jechuu?", "Kuwani maxay ka dhigan yihiin?"], "In its time. Earliest is the most beloved.": ["Yeroo ishee keessa. Jalqaba isheetu caalaa jaallatama.", "Waqtigeeda gudihiisa. Bilowgu waa kan ugu jecel."],"Made up (qada)": ["Baafachuu (qadaa)", "Gudasho (qadaa)"], "Made up means praying a salah after its time has ended, only because you slept through it or forgot. Its time is the moment you wake up or remember.": ["Baafachuun salaata yeroon ishee darbe booda salaatuu dha, sababa rafuu ykn irraanfachuu qofaan. Yeroon ishee yeroo dammaqxu ykn yaadattu sana.", "Gudashadu waa tukashada salaad waqtigeedii dhammaaday, kaliya hurdo ama hilmaan dartiis. Waqtigeedu waa marka aad toosto ama xusuusato."], "Pray it right away": ["Battaluma salaati", "Isla markiiba tuko"], "As soon as you wake up or remember, pray it. Do not wait for a later salah.": ["Akkuma dammaqxe ykn yaadatteen salaati. Salaata booda dhuftu hin eegin.", "Isla marka aad toosto ama xusuusato tuko. Ha sugin salaad dambe."], "Example": ["Fakkeenya", "Tusaale"], "Woke up at 9 AM after missing Fajr: pray Fajr at 9 AM, not at Maghrib or the next morning.": ["Fajrii darbeeffattee 9 AM dammaqxe: Fajrii 9 AM salaati, Magriba ykn ganama itti aanutti miti.", "Fajrka ayaa kaa dhaafay oo 9-ka subaxnimo ayaad toosay: Fajarka tuko 9-ka, ha sugin Maqribka ama subaxda xigta."], "Delaying on purpose is not making up": ["Beekaa turfachuun baafachuu miti", "Ula kac u dib-u-dhigid gudasho maaha"], "Letting a salah pass its time on purpose, then praying it later, is a serious sin. Pray every salah inside its time.": ["Salaata beekaa yeroo ishee darbuu, booda salaatuun cubbuu guddaa dha. Salaata hunda yeroo ishee keessatti salaati.", "In salaad si ula kac ah waqtigeedu kaaga baxo, kadibna aad tukato, waa dembi weyn. Salaad kasta ku tuko waqtigeeda."], "More than one missed": ["Tokkoo ol darbe", "Wax ka badan hal ka dhaafay"], "Pray them in their order, then the salah of the time you are in.": ["Akkaataa tartiiba isaaniitiin salaati, achii salaata yeroo ati keessa jirtu.", "U tuko sida ay isugu xigaan, kadib salaadda waqtiga aad ku jirto."], "Many years missed": ["Waggoota hedduu darbe", "Sanado badan oo ka dhaafay"], "Repent sincerely, keep every salah on time from now, and ask a trusted scholar how to make up the past.": ["Dhugaan tawbadhu, amma booda salaata hunda yeroon salaati, kan darbe akkamitti akka baafattu beekaa amanattu gaafadhu.", "Si daacad ah u toobad keen, hadda kadib salaad kasta waqtigeeda ku tuko, oo weydii caalim aad aaminto sida aad u gudato wixii hore."], "About “Made up”": ["Waa'ee “Baafachuu”", "Ku saabsan “Gudasho”"], "About “Excused”": ["Waa'ee “Dhimma qaba”", "Ku saabsan “Cudurdaar”"], "So woe to those who pray, who are heedless of their salah.": ["Badiinni warra salaatan, warra salaata isaanii irraa dagatoo jiraniif haa ta'u.", "Hoog waxaa leh kuwa tukada, ee salaaddooda ka halmaama."],"What counts as an excuse": ["Maaltu sababa ta'a", "Maxaa cudur-daar ah"], "Sunrise": ["Ba'uu aduu", "Qorrax soo bax"], "Ends at sunrise": ["Ba'uu aduutiin xumurama", "Wuxuu ku dhammaadaa qorrax soo baxa"], "Ends when Asr begins": ["Yeroo Asriin jalqabu xumurama", "Wuxuu dhammaadaa marka Casarku galo"], "Pray before the sun turns pale. Ends at sunset": ["Osoo aduun hin keelloomin salaati. Lixa aduutiin xumurama", "Tuko inta qorraxdu aysan huruudoobin. Wuxuu ku dhammaadaa qorrax dhaca"], "Ends when the twilight is gone (Isha)": ["Diimaan samii yeroo badu xumurama (Ishaa)", "Wuxuu dhammaadaa marka casaanka cirku baaba'o (Cishaha)"], "Ends at the middle of the night": ["Walakkaa halkanii irratti xumurama", "Wuxuu ku dhammaadaa badhka habeenka"], "Starts": ["Jalqaba", "Bilaabma"], "Ends": ["Xumurama", "Dhammaada"], "Excused from salah": ["Sababa salaata irraa nama hambisu", "Cudur-daarka salaadda"], "Salah is prescribed for the believers at fixed times.": ["Dhugumatti salaanni mu'mintoota irratti yeroo murtaa'een dirqama.", "Salaaddu waxay mu'miniinta ku waajibtay waqtiyo go'an."], "Salah is never skipped on purpose. Only these two excuse it. In the tracker, excused prayers are not counted for or against you.": ["Salaanni beekaa gonkumaa hin dhiifamu. Kan ishee irraa nama hambisu lamaan kana qofa. Hordoffii keessatti, salaanni sababaan hafe siif ykn sirratti hin lakkaa'amu.", "Salaadda si ula kac ah looma daayo. Kaliya labadan ayaa cudur-daar ah. Raadraaca, salaadda cudur-daarka ah laguuma xisaabo, laguumana xisaabiyo."], "Excused": ["Dhimma qaba", "Cudurdaar"], "Monthly or after-birth bleeding (hayd, nifas)": ["Dhiiga ji'aa ykn da'umsa booda (haydii, nifaasii)", "Dhiigga caadada ama dhalmada kadib (xayd, nifaas)"], "No salah while it lasts, and it is not made up later.": ["Hamma itti fufetti salaanni hin jiru, boodas hin baafamu.", "Inta uu socdo salaad ma jirto, gadaalna lama gudo."], "When the bleeding begins": ["Yeroo dhiigni jalqabu", "Marka dhiiggu bilaabmo"], "When it stops. Then ghusl, and pray the next salah": ["Yeroo dhaabbatu. Achiis ghusla, salaata itti aanu salaati", "Marka uu joogsado. Kadib qubeys (ghusl), oo tuko salaadda xigta"], "Losing the mind or consciousness (for example a coma)": ["Sammuu ykn of beekuu dhabuu (fakkeenyaaf koomaa)", "Caqli ama miyir beelid (tusaale ahaan koomo)"], "The pen is lifted until the mind returns. Scholars differ on making up a long unconsciousness; ask a trusted scholar.": ["Hamma sammuun deebi'utti qalamni ol fudhatameera. Of wallaaluu dheeraa baafachuu irratti beektonni ni wal dhabu; beekaa amanattu gaafadhu.", "Qalinka waa laga qaaday ilaa caqligu soo noqdo. Culimadu way ku kala duwan yihiin gudashada miyir-beel dheer; weydii caalim aad aaminto."], "When awareness is lost": ["Yeroo of beekuun badu", "Marka miyirku tago"], "When it returns. Pray the salah whose time you are in": ["Yeroo deebi'u. Salaata yeroo ati keessa jirtuu salaati", "Marka uu soo noqdo. Tuko salaadda waqtigeeda aad ku jirto"], "Not excused: pray as you can": ["Sababa miti: akka dandeessetti salaati", "Cudur-daar maaha: u tuko sida aad awoodo"], "Slept through it or forgot": ["Rafuu ykn irraanfachuu", "Hurdo ama hilmaan"], "Pray it as soon as you wake up or remember.": ["Akkuma dammaqxe ykn yaadatteen salaati.", "Tuko isla marka aad toosto ama xusuusato."], "Ill or in pain": ["Dhukkuba ykn dhukkubbii", "Jirro ama xanuun"], "Pray standing. If you cannot, sitting. If you cannot, lying on your side.": ["Dhaabbadhuu salaati. Yoo hin dandeenye, taa'ii. Yoo hin dandeenye, cinaachaan ciisii.", "Tuko adigoo taagan. Haddii aadan karin, fadhiiso. Haddii aadan karin, dhinac u jiifso."], "Travelling": ["Imala", "Safar"], "Shorten the 4-rakah prayers to 2. Joining two prayers is allowed.": ["Salaata raka'aa 4 gara 2tti gabaabsi. Salaata lama walitti qabuun ni hayyamama.", "Salaadaha 4-ta rakac ah ka dhig 2. Isu-geynta laba salaadood waa la oggol yahay."], "Work, school, busy or tired": ["Hojii, mana barumsaa, qabatamuu ykn dadhabuu", "Shaqo, iskuul, mashquul ama daal"], "Not an excuse. Pray within its time.": ["Sababa miti. Yeroo isaa keessatti salaati.", "Cudur-daar maaha. Ku tuko waqtigeeda."], "Today's salah times": ["Yeroo salaataa har'aa", "Waqtiyada salaadda maanta"], "Times are for your saved location.": ["Yeroon bakka kee kuufame irratti hundaa'a.", "Waqtiyadu waa kuwa goobtaada la keydiyay."]};
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
 <div class="fsi-ay"><p class="fsi-ar">إِنَّ ٱلصَّلَوٰةَ كَانَتۡ عَلَى ٱلۡمُؤۡمِنِينَ<br>كِتَٰبٗا مَّوۡقُوتٗا</p>
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

function openQ(){if(typeof openSheet!=='function')return;
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Marking salah','تسجيل الصلاة')}</h1>${XB}</div>
 <div class="fsi">
 <div class="fsi-ay"><p class="fsi-ar">فَوَيۡلٞ لِّلۡمُصَلِّينَ<br>ٱلَّذِينَ هُمۡ عَن صَلَاتِهِمۡ سَاهُونَ</p>
  ${L==='ar'?'':`<p class="fsi-en">${X('So woe to those who pray, who are heedless of their salah.','')}</p>`}${src(Q(107,4)+'-5',"Qur'an, Surah Al-Ma'un 107:4-5",'القرآن، سورة الماعون ١٠٧:٤-٥')}</div>
 ${item('ph-check-circle',T('On time','في وقتها'),
   X('Prayed early in its time, soon after it begins. The most beloved deed to Allah.','صُلّيت في أول وقتها بعد دخوله بقليل. وهي أحبّ الأعمال إلى الله.'),'',
   src(H('bukhari:527'),'Sahih al-Bukhari 527','صحيح البخاري ٥٢٧'))}
 ${item('ph-hourglass-medium',X('Later in its time','متأخرة في وقتها'),
   X('Still in its time and valid. For example Dhuhr 50 minutes after it begins, or just before Asr. Fine at times, but try not to make it a habit. Asr: pray before the sun turns pale.','ما زالت في وقتها وصحيحة، كالظهر بعد دخوله بخمسين دقيقة أو قبيل العصر. لا بأس أحيانًا، لكن لا تجعلها عادة. والعصر: قبل اصفرار الشمس.'),'',
   src(H('muslim:612a'),'Sahih Muslim 612','صحيح مسلم ٦١٢'))}
 ${item('ph-clock',T('Made up','قضاء'),
   X('Prayed after its time ended. Only for sleeping through it or forgetting.','صُلّيت بعد خروج وقتها، ولا يكون ذلك إلا لنوم أو نسيان.')+' '+X('As soon as you wake up or remember, pray it. Do not wait for a later salah.','حين تستيقظ أو تتذكّر فصلِّها، ولا تؤخّرها إلى صلاة أخرى.'),
   `<div class="fsi-ex"><small>${X('Example','مثال')}</small>${X('Woke up at 9 AM after missing Fajr: pray Fajr at 9 AM, not at Maghrib or the next morning.','فاتك الفجر واستيقظت الساعة ٩ صباحًا: صلِّ الفجر الساعة ٩، لا عند المغرب ولا في صباح الغد.')}</div>`,
   src(H('muslim:684a'),'Sahih Muslim 684','صحيح مسلم ٦٨٤')+src(H('bukhari:597'),'Sahih al-Bukhari 597','صحيح البخاري ٥٩٧'))}

 <h3 class="fsi-h">${X('Combining two salah','الجمع بين صلاتين')}</h3>
 ${item('ph-stack',X('Dhuhr with Asr, or Maghrib with Isha','الظهر مع العصر، أو المغرب مع العشاء'),
   X('Allowed when travelling, and for a real need such as illness or heavy rain, so you are not in hardship. Not as a daily habit. Mark both as On time.','يجوز في السفر، وللحاجة الحقيقية كالمرض أو المطر الشديد، رفعًا للحرج. لا يُتّخذ عادة يومية. سجّل الصلاتين «في وقتها».'),'',
   src(H('bukhari:1106'),'Sahih al-Bukhari 1106','صحيح البخاري ١١٠٦')+src(H('muslim:705a'),'Sahih Muslim 705','صحيح مسلم ٧٠٥'))}

 <h3 class="fsi-h">${X('More about making up','المزيد عن القضاء')}</h3>
 ${item('ph-hourglass-simple-low',X('Delaying on purpose is not making up','التأخير عمدًا ليس قضاءً'),
   X('Letting a salah pass its time on purpose, then praying it later, is a serious sin. Pray every salah inside its time.','ترك الصلاة حتى يخرج وقتها عمدًا ثم صلاتها بعده ذنب عظيم. صلِّ كل صلاة في وقتها.'),'',
   src(H('muslim:681'),'Sahih Muslim 681','صحيح مسلم ٦٨١')+src(Q(4,103),"Qur'an 4:103",'القرآن ٤:١٠٣'))}
 ${item('ph-list-numbers',X('More than one missed','فاتتك أكثر من صلاة'),
   X('Pray them in their order, then the salah of the time you are in.','صلِّها بالترتيب، ثم صلاة الوقت الحاضر.'),'',
   src(H('bukhari:596'),'Sahih al-Bukhari 596','صحيح البخاري ٥٩٦'))}
 ${item('ph-arrow-counter-clockwise',X('Many years missed','فاتتك سنوات'),
   X('Repent sincerely, keep every salah on time from now, and ask a trusted scholar how to make up the past.','تُب توبة صادقة، وحافظ على كل صلاة في وقتها من الآن، واسأل عالمًا تثق به عن قضاء ما مضى.'),'',
   src(Q(20,82),"Qur'an 20:82",'القرآن ٢٠:٨٢'))}
 <button class="fsi-lk" type="button" data-fsi><i class="ph ph-info"></i>${X('What counts as an excuse?','ما الأعذار في الصلاة؟')}</button>
 </div>`)}
window.fqQada=openQ;
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-fqd]');if(!b)return;e.preventDefault();e.stopPropagation();vib&&vib(8);openQ()},true);
window.fqExc=open;
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-fsi]');if(!b)return;e.preventDefault();e.stopPropagation();vib&&vib(8);open()},true);
})();
