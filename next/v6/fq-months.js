/* Fastaqim "Blessed months" (23 Nov 2026): Ramadan countdown on Home + the virtuous months and days,
   each with why it is special, what to do and what to avoid. Sources: Qur'an (Quran.com) and sahih or
   hasan hadith only (sunnah.com); every number was checked against the hadith text before use.
   Hijri dates come from the page's hParts(), so they follow the phone's time zone and change at Maghrib.
   Kept in its own file so other work on index.html never overwrites it. (c) Fastaqim, all rights reserved. */
(function(){'use strict';
const X=(en,ar,om,so)=>L==='ar'?ar:(LI===0&&om!=null)?om:(LI===1&&so!=null)?so:en;
const N=n=>AR(n);
const DAY=864e5;
const noon=(d,add)=>{const x=new Date(d);x.setHours(12,0,0,0);if(add)x.setDate(x.getDate()+add);return x};
const gFmt=(d,o)=>d.toLocaleDateString(L==='ar'?'ar-EG-u-nu-latn':(LI>=0?LX:'en-US'),o);

/* ---------- sources ---------- */
const SUR={2:['Al-Baqarah','البقرة'],9:['At-Tawbah','التوبة'],22:['Al-Hajj','الحج'],89:['Al-Fajr','الفجر'],97:['Al-Qadr','القدر'],108:['Al-Kawthar','الكوثر']};
const BK={bukhari:['Sahih al-Bukhari','صحيح البخاري'],muslim:['Sahih Muslim','صحيح مسلم'],nasai:["Sunan an-Nasa'i",'سنن النسائي'],tirmidhi:["Jami' at-Tirmidhi",'جامع الترمذي']};
const q=(s,a)=>({u:'https://quran.com/'+s+'/'+a,l:X("Qur'an, "+SUR[s][0]+' '+s+':'+a,'القرآن، '+SUR[s][1]+' '+N(s)+':'+N(a))});
const h=(b,n,g)=>({u:'https://sunnah.com/'+b+':'+n,l:X(BK[b][0]+' '+n.replace(/[a-z]$/,''),BK[b][1]+' '+N(n.replace(/[a-z]$/,'')))+(g?X(' · Hasan',' · حسن'):'')});

/* ---------- the months ---------- */
/* k: 1 sacred, 2 fasting month, 3 season. why/do/no: [en, ar, source] */
const MO=()=>({
1:{k:1,tag:X('Sacred month · Allah\'s month','شهر حرام · شهر الله'),
 why:[[ 'One of the four sacred months: "Of these, four are sacred… so do not wrong yourselves during them."','أحد الأشهر الحرم: ﴿مِنْهَا أَرْبَعَةٌ حُرُمٌ ۚ ... فَلَا تَظْلِمُوا فِيهِنَّ أَنفُسَكُمْ﴾',q(9,36)],
  ['"The best fasting after Ramadan is in Allah\'s month, al-Muharram, and the best prayer after the obligatory is the night prayer."','«أَفْضَلُ الصِّيَامِ بَعْدَ رَمَضَانَ شَهْرُ اللَّهِ الْمُحَرَّمُ، وَأَفْضَلُ الصَّلَاةِ بَعْدَ الْفَرِيضَةِ صَلَاةُ اللَّيْلِ»',h('muslim','1163a')],
  ["'Ashura (the 10th) is the day Allah saved Musa's people from their enemy. The Prophet ﷺ fasted it and told us to fast it.",'عاشوراء يوم نجّى الله فيه بني إسرائيل من عدوّهم، فصامه موسى، وصامه النبي ﷺ وأمر بصيامه.',h('bukhari','2004')],
  ["Fasting 'Ashura: \"It expiates the year before it.\"",'صيام عاشوراء: «يُكَفِّرُ السَّنَةَ الْمَاضِيَةَ»',h('muslim','1162b')]],
 do:[['Fast extra days this month, as many as is easy for you.','أكثِر من صيام النافلة في هذا الشهر بما تيسّر.',h('muslim','1163a')],
  ["Fast 'Ashura on the 10th, and the 9th with it.",'صُم عاشوراء (العاشر) ومعه التاسع.',h('muslim','1134b')],
  ['Pray at night, even two short rak\'ahs.','صلِّ من الليل ولو ركعتين خفيفتين.',h('muslim','1163a')]],
 no:[['Wronging yourself or others. Allah names these months by name.','ظلم النفس أو الغير؛ فقد خصّ الله هذه الأشهر بالنهي.',q(9,36)]]},
7:{k:1,tag:X('Sacred month','شهر حرام'),
 why:[['One of the four sacred months that Allah set from the day He created the heavens and the earth.','أحد الأشهر الحرم التي كتبها الله يوم خلق السماوات والأرض.',q(9,36)],
  ['The Prophet ﷺ named them: "Dhul-Qa\'dah, Dhul-Hijjah and Muharram, and Rajab, which comes between Jumada and Sha\'ban."','«ثَلَاثَةٌ مُتَوَالِيَاتٌ: ذُو الْقَعْدَةِ وَذُو الْحِجَّةِ وَالْمُحَرَّمُ، وَرَجَبُ مُضَرَ الَّذِي بَيْنَ جُمَادَى وَشَعْبَانَ»',h('bukhari','3197')]],
 do:[['Keep your Sunnah fasts: three days each month.','حافظ على صيام ثلاثة أيام من كل شهر.',h('bukhari','1981')],
  ['Start getting ready for Ramadan: a small daily Qur\'an habit now grows by Ramadan.','ابدأ الاستعداد لرمضان: عادة يومية صغيرة مع القرآن من الآن.',null]],
 no:[['Wronging yourself or others in a sacred month.','ظلم النفس أو الغير في الشهر الحرام.',q(9,36)],
  ['Adding a special prayer or fast only for Rajab. No sahih hadith teaches one.','تخصيص رجب بصلاة أو صيام معيّن؛ لم يثبت في ذلك حديث صحيح.',null]]},
8:{k:3,tag:X('Getting ready for Ramadan','الاستعداد لرمضان'),
 why:[['Aisha said: "I never saw him fast more in any month than in Sha\'ban."','قالت عائشة: «وَمَا رَأَيْتُهُ أَكْثَرَ صِيَامًا مِنْهُ فِي شَعْبَانَ»',h('bukhari','1969')],
  ['"It is a month people overlook, between Rajab and Ramadan. In it deeds are raised to the Lord of the worlds, and I love that my deeds are raised while I am fasting."','«ذَلِكَ شَهْرٌ يَغْفُلُ النَّاسُ عَنْهُ بَيْنَ رَجَبٍ وَرَمَضَانَ، وَهُوَ شَهْرٌ تُرْفَعُ فِيهِ الْأَعْمَالُ إِلَى رَبِّ الْعَالَمِينَ، فَأُحِبُّ أَنْ يُرْفَعَ عَمَلِي وَأَنَا صَائِمٌ»',h('nasai','2357',1)]],
 do:[['Fast more than in other months.','أكثِر من الصيام فيه.',h('bukhari','1969')],
  ['Make up any missed Ramadan fasts before Ramadan comes.','اقضِ ما عليك من رمضان الماضي قبل دخول رمضان.',h('bukhari','1950')]],
 no:[['Fasting a day or two just before Ramadan "to be safe", unless it is a fast you already keep.','تقدّم رمضان بصوم يوم أو يومين، إلا من كان له صوم معتاد.',h('bukhari','1914')]]},
9:{k:2,tag:X('The month of fasting','شهر الصيام'),
 why:[['"The month of Ramadan, in which the Qur\'an was revealed, a guidance for the people."','﴿شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ﴾',q(2,185)],
  ['"When Ramadan begins, the gates of heaven are opened, the gates of Hell are closed and the devils are chained."','«إِذَا دَخَلَ شَهْرُ رَمَضَانَ فُتِّحَتْ أَبْوَابُ السَّمَاءِ، وَغُلِّقَتْ أَبْوَابُ جَهَنَّمَ، وَسُلْسِلَتِ الشَّيَاطِينُ»',h('bukhari','1899')],
  ['"Whoever fasts Ramadan with faith, hoping for reward, his past sins are forgiven."','«مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ»',h('bukhari','38')],
  ['"The Night of Decree is better than a thousand months."','﴿لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ﴾',q(97,3)]],
 do:[['Fast every day with faith, hoping for Allah\'s reward.','صُم الشهر إيمانًا واحتسابًا.',h('bukhari','38')],
  ['Pray at night (Taraweeh) with faith, hoping for reward.','قُم ليله إيمانًا واحتسابًا.',h('bukhari','37')],
  ['Seek Laylat al-Qadr in the odd nights of the last ten.','تحرَّ ليلة القدر في الوتر من العشر الأواخر.',h('bukhari','2017')],
  ['Give Zakat al-Fitr before the Eid prayer.','أخرج زكاة الفطر قبل صلاة العيد.',h('bukhari','1503')],
  ['Ill or travelling? Make up the days later. Allah wants ease for you.','مريض أو مسافر؟ اقضِ الأيام لاحقًا؛ يريد الله بكم اليسر.',q(2,185)]],
 no:[['False speech and acting on it. Allah has no need of a fast that keeps them.','قول الزور والعمل به؛ فليس لله حاجة في أن يدع طعامه وشرابه.',h('bukhari','1903')],
  ['Rude talk and arguing. If someone fights you, say "I am fasting."','الرفث والجهل؛ وإن قاتله أحد أو شاتمه فليقل: إني صائم.',h('bukhari','1894')]]},
10:{k:3,tag:X('Eid and six days','العيد والست من شوال'),
 why:[['"Whoever fasts Ramadan and follows it with six days of Shawwal, it is as if he fasted the whole year."','«مَنْ صَامَ رَمَضَانَ ثُمَّ أَتْبَعَهُ سِتًّا مِنْ شَوَّالٍ كَانَ كَصِيَامِ الدَّهْرِ»',h('muslim','1164a')]],
 do:[['Fast six days of Shawwal after Eid. They can be on any days of the month.','صُم ستًّا من شوال بعد العيد، في أي أيام الشهر.',h('muslim','1164a')]],
 no:[['Fasting on the day of Eid al-Fitr.','صيام يوم عيد الفطر.',h('bukhari','1991')]]},
11:{k:1,tag:X('Sacred month','شهر حرام'),
 why:[['One of the four sacred months.','أحد الأشهر الحرم.',q(9,36)],
  ["The Prophet ﷺ made his 'Umrahs in Dhul-Qa'dah, except the one with his Hajj.",'اعتمر النبي ﷺ عُمَره كلها في ذي القعدة إلا التي مع حجّته.',h('bukhari','4148')]],
 do:[['Plan now for the first ten days of Dhul-Hijjah, the best days of the year.','خطّط من الآن للعشر الأوائل من ذي الحجة.',h('bukhari','969')]],
 no:[['Wronging yourself or others in a sacred month.','ظلم النفس أو الغير في الشهر الحرام.',q(9,36)]]},
12:{k:1,tag:X('Sacred month · best ten days','شهر حرام · خير الأيام'),
 why:[['"No good deeds are better than those done in these days", meaning the first ten days of Dhul-Hijjah.','«مَا الْعَمَلُ فِي أَيَّامِ الْعَشْرِ أَفْضَلَ مِنَ الْعَمَلِ فِي هَذِهِ»',h('bukhari','969')],
  ['"By the dawn, and ten nights." Many scholars explain these as the first ten nights of Dhul-Hijjah.','﴿وَالْفَجْرِ ۝ وَلَيَالٍ عَشْرٍ﴾ وفسّرها كثير من العلماء بعشر ذي الحجة.',q(89,2)],
  ['Fasting the day of \'Arafah: "It expiates the year before and the year after."','صيام يوم عرفة: «يُكَفِّرُ السَّنَةَ الْمَاضِيَةَ وَالْبَاقِيَةَ»',h('muslim','1162b')]],
 do:[['Do more good deeds and remember Allah often in the ten days.','أكثِر من العمل الصالح وذكر الله في العشر.',q(22,28)],
  ['Fast the day of \'Arafah (9th) if you are not on Hajj.','صُم يوم عرفة (التاسع) لغير الحاج.',h('muslim','1162b')],
  ['Offer a sacrifice for Allah after the Eid prayer, if you can.','ضحِّ لله بعد صلاة العيد إن استطعت.',q(108,2)],
  ['Days 11 to 13 are days of eating, drinking and remembering Allah.','أيام التشريق أيام أكل وشرب وذكر لله.',h('muslim','1141b')]],
 no:[['If you plan to sacrifice: no cutting hair or nails from the 1st until you sacrifice.','لمن أراد أن يضحّي: لا يأخذ من شعره ولا أظفاره من أول الشهر حتى يضحّي.',h('tirmidhi','1523')],
  ['Fasting on the day of Eid al-Adha.','صيام يوم عيد الأضحى.',h('bukhari','1991')]]}
});
const ORDER=[1,7,8,9,10,11,12];
const SACRED=new Set([1,7,11,12]);

/* ---------- special days (Hijri month.day) ---------- */
const EV=()=>[
 [1,1,X('Muharram begins','بداية محرم','Muharram jalqaba','Muxarram ayaa bilaabmaya'),X('Sacred month','شهر حرام'),1],
 [1,9,X('Tasu\'a fast (9th)','صيام تاسوعاء'),X('Fast it with \'Ashura','يُصام مع عاشوراء'),1],
 [1,10,X("'Ashura fast",'صيام عاشوراء',"Soomana 'Aashuuraa",'Soonka Caashuuraa'),X('Expiates the year before','يكفّر السنة الماضية'),1],
 [7,1,X('Rajab begins','بداية رجب','Rajab jalqaba','Rajab ayaa bilaabmaya'),X('Sacred month','شهر حرام'),7],
 [8,1,X("Sha'ban begins",'بداية شعبان',"Sha'baan jalqaba","Shacbaan ayaa bilaabmaya"),X('Get ready for Ramadan','الاستعداد لرمضان'),8],
 [9,1,X('Ramadan begins','بداية رمضان','Ramadaan jalqaba','Ramadaan ayaa bilaabmaya'),X('Expected date · moon sighting decides','تاريخ متوقع · العبرة برؤية الهلال'),9],
 [9,21,X('Last ten nights','العشر الأواخر'),X('Begin the evening before','تبدأ مساء اليوم السابق'),9],
 [10,1,X('Eid al-Fitr','عيد الفطر','Iid al-Fitrii','Ciid al-Fidri'),X('No fasting today','لا صيام فيه'),10],
 [11,1,X("Dhul-Qa'dah begins",'بداية ذي القعدة'),X('Sacred month','شهر حرام'),11],
 [12,1,X('Best ten days begin','بداية العشر من ذي الحجة'),X('Sacred month','شهر حرام'),12],
 [12,9,X("Day of 'Arafah",'يوم عرفة'),X('Fast if not on Hajj','يُصام لغير الحاج'),12],
 [12,10,X('Eid al-Adha','عيد الأضحى','Iid al-Adhaa','Ciid al-Adxa'),X('Sacrifice after the Eid prayer','الأضحية بعد صلاة العيد'),12]];

/* ---------- date math (local time zone, Hijri day changes at Maghrib) ---------- */
function today(){const n=NOW(),hn=hParts(n),t=noon(n),ht=hParts(t);return{n,hn,t,eve:hn.d!==ht.d||hn.m!==ht.m}}
/* days until Hijri m/d, counted in Hijri days from now (0 = it is that day now) */
const cache={};
function findNext(m,d,from){const key=dkey(from.t)+(from.eve?'e':'')+m+'.'+d;if(cache[key])return cache[key];
 for(let i=0;i<400;i++){const g=noon(from.t,i),p=hParts(g);if(p.m===m&&p.d===d){const left=i-(from.eve?1:0);if(left<0)continue;return cache[key]={g,left,y:p.y}}}
 return null}
function monthLen(m,y,from){let s=null;for(let i=-31;i<400;i++){const g=noon(from.t,i),p=hParts(g);if(p.m===m&&p.y===y){if(!s)s=g}else if(s)return Math.round((g-s)/DAY)}return 30}
function season(){const f=today(),c=f.hn;
 if(c.m===9){const len=monthLen(9,c.y,f),left=len-c.d+1;return{f,mode:'ram',day:c.d,len,left,last10:c.d>=21}}
 if(c.m===12&&c.d<=13)return{f,mode:'dh',day:c.d};
 if(c.m===1&&c.d<=10)return{f,mode:'mu',day:c.d};
 return{f,mode:'cd'}}
const ram=f=>findNext(9,1,f);

/* ---------- the year line (the straight path, one step per month) ---------- */
function yearLine(cur,big){const f=today(),len=monthLen(cur.m,cur.y,f);
 return `<div class="fqm-yl${big?' fqm-big':''}" aria-hidden="true">${[...Array(12)].map((_,i)=>{const m=i+1,k=m===9?'r':SACRED.has(m)?'s':(m===8||m===10)?'t':'';
  return `<span class="${k} ${m<cur.m?'past':''} ${m===cur.m?'now':''}">${m===cur.m?`<i style="--p:${Math.min(100,Math.round((cur.d-.5)/len*100))}%"></i>`:''}${big?`<small>${N(m)}</small>`:''}</span>`}).join('')}</div>`}

/* ---------- Home card ---------- */
function nextEvent(f,skipRam){const c=f.hn;let best=null;EV().forEach(e=>{if(skipRam&&e[0]===9&&e[1]===1)return;if(e[0]===c.m&&e[1]===c.d)return;const r=findNext(e[0],e[1],f);if(r&&(!best||r.left<best.r.left))best={e,r}});return best}
const inDays=n=>n===0?X('today','اليوم','har\'a','maanta'):n===1?X('tomorrow','غدًا','boru','berri'):X('in '+n+' days','بعد '+N(n)+' يومًا','guyyaa '+n+' booda',n+' maalmood kadib');
function homeCard(){if(S.fqmHide){const o=$('fqmH');if(o)o.remove();return}
 const g=$('greet');if(!g)return;let el=$('fqmH');if(!el){g.insertAdjacentHTML('afterend','<button class="fqm-h fq-leaf" id="fqmH"></button>');el=$('fqmH');el.onclick=()=>{vib(8);go('months')}}
 const s=season(),f=s.f;let big,unit,top,sub,line='';
 if(s.mode==='ram'){top=X('Ramadan','رمضان')+' '+N(f.hn.y);big=N(s.day);unit=X('of '+s.len,'من '+N(s.len),'/ '+s.len,'/ '+s.len);
  sub=s.last10?X('Last ten nights · seek Laylat al-Qadr','العشر الأواخر · تحرَّ ليلة القدر'):X(s.left+' days left','بقي '+N(s.left)+' يومًا','Guyyoota '+s.left+' hafan',s.left+' maalmood ayaa haray')}
 else{const r=ram(f);if(!r){el.remove();return}
  top=X('Ramadan','رمضان','Ramadaan','Ramadaan')+' '+N(r.y);big=N(r.left);unit=r.left===1?X('day','يوم','guyyaa','maalin'):X('days','يومًا','guyyoota','maalmood');
  sub=r.left===0?X('Ramadan begins tonight','يبدأ رمضان الليلة'):X('Expected ','متوقّع ','≈ ','≈ ')+gFmt(r.g,{weekday:'short',day:'numeric',month:'short'});
  if(s.mode==='dh')sub=X('Best ten days · day '+Math.min(s.day,10),'العشر من ذي الحجة · اليوم '+N(Math.min(s.day,10)));
  if(s.mode==='dh'&&s.day>10)sub=X('Days of eating, drinking and dhikr','أيام أكل وشرب وذكر لله')}
 const ne=nextEvent(f,s.mode!=='ram');if(ne)line=`<span class="fqm-nx"><b>${ne.e[2]}</b> · ${inDays(ne.r.left)}</span>`;
 const now=SACRED.has(f.hn.m)?`<em class="fqm-tag s">${X('Sacred month','شهر حرام','Ji\'a kabajamaa','Bil xurmeysan')}</em>`:'';
 el.setAttribute('aria-label',top+' '+big+' '+unit);
 el.innerHTML=`<span class="fqm-n"><b>${big}</b><small>${unit}</small></span><span class="fqm-t"><small class="fqm-k">${s.mode==='ram'?'':X('Until ','حتى ','','Ilaa ')}${top}</small><span class="fqm-s">${sub}</span>${yearLine(f.hn)}${line||now?`<span class="fqm-l">${now}${line}</span>`:''}</span><i class="ph ph-caret-right flip fqm-c"></i>`}

/* ---------- screen ---------- */
const BACK=`<button class="ib" data-back aria-label="${X('Back','رجوع')}"><i class="ph ph-caret-left flip"></i></button>`;
if(!$('s-months')){const last=$$('.scr');last[last.length-1].insertAdjacentHTML('afterend',`<section class="scr" id="s-months"><div class="hd sub">${BACK}<h1>${X('Blessed months','الأشهر الفاضلة','Ji\'oota eebbifamoo','Bilaha barakaysan')}</h1><span style="width:44px"></span></div><div id="fqmB"></div></section>`);TABOF.months='home'}
R.months=()=>{const s=season(),f=s.f,r=ram(f),M=MO();
 let hero;
 if(s.mode==='ram')hero=`<p class="fqm-hk">${X('Ramadan','رمضان')} ${N(f.hn.y)}</p><p class="fqm-hn"><b>${N(s.day)}</b><span>${X('of','من')} ${N(s.len)}</span></p><p class="fqm-hs">${s.last10?X('Last ten nights. Seek Laylat al-Qadr in the odd nights.','العشر الأواخر. تحرَّ ليلة القدر في الليالي الوتر.'):X(s.left+' days left','بقي '+N(s.left)+' يومًا')}</p>`;
 else hero=`<p class="fqm-hk">${X('Until Ramadan','حتى رمضان')} ${r?N(r.y):''}</p><p class="fqm-hn"><b>${r?N(r.left):'–'}</b><span>${r&&r.left===1?X('day','يوم'):X('days','يومًا')}</span></p><p class="fqm-hs">${r?(r.left===0?X('Ramadan begins tonight at Maghrib.','يبدأ رمضان الليلة عند المغرب.'):X('Expected ','متوقّع ')+gFmt(r.g,{weekday:'long',day:'numeric',month:'long',year:'numeric'})):''}</p>`;
 const evs=EV().map(e=>({e,r:findNext(e[0],e[1],f)})).filter(x=>x.r).sort((a,b)=>a.r.left-b.r.left).slice(0,6);
 $('fqmB').innerHTML=`<div class="fqm-hero fq-leaf">${hero}${yearLine(f.hn,1)}
  <p class="fqm-lg"><span><i class="s"></i>${X('Sacred','حرام')}</span><span><i class="r"></i>${X('Ramadan','رمضان')}</span><span><i class="t"></i>${X("Sha'ban, Shawwal",'شعبان، شوال')}</span><span><i class="n"></i>${X('Now','الآن')}</span></p>
  <p class="fqm-note">${X('Dates follow the Umm al-Qura calendar in your time zone, and the day changes at Maghrib. Follow your local moon sighting.','التواريخ حسب تقويم أم القرى بتوقيتك، ويبدأ اليوم عند المغرب. اتّبع رؤية الهلال في بلدك.')}</p></div>
  <p class="glh">${X('Coming up','القادم','Dhufaa jira','Soo socda')}</p>
  <div class="fqm-ev fq-leaf">${evs.map(({e,r})=>`<button data-m="${e[4]}"><span class="fqm-d"><b>${N(e[1])}</b><small>${hms(e[0])}</small></span><span class="tx"><b>${e[2]}</b><small>${gFmt(r.g,{weekday:'short',day:'numeric',month:'short'})} · ${e[3]}</small></span><em>${r.left===0?X('Today','اليوم'):N(r.left)+X(' d',' ي')}</em></button>`).join('')}</div>
  <p class="glh">${X('The months','الأشهر')}</p>
  <div class="fqm-ml">${ORDER.map(m=>{const o=M[m],cur=f.hn.m===m,nx=cur?null:findNext(m,1,f);return `<button class="fq-leaf ${cur?'cur':''}" data-m="${m}"><span class="fqm-mi k${o.k}">${N(m)}</span><span class="tx"><b>${hm(m)}</b><small>${o.tag}</small></span><em>${cur?X('Now','الآن'):nx?inDays(nx.left):''}</em><i class="ph ph-caret-right flip"></i></button>`}).join('')}</div>
  <div class="fqm-set"><span class="tx"><b>${X('Show countdown on Home','إظهار العدّ التنازلي في الرئيسية')}</b></span><button class="sw ${S.fqmHide?'':'on'}" id="fqmTg" role="switch" aria-checked="${!S.fqmHide}" aria-label="${X('Show countdown on Home','إظهار العدّ التنازلي في الرئيسية')}"></button></div>
  <p class="fqm-note c">${X('Hadith: sahih or hasan only. Tap a source to read it in full.','الأحاديث صحيحة أو حسنة فقط. اضغط المصدر لقراءته كاملًا.')}</p>`;
 $$('#fqmB [data-m]').forEach(b=>b.onclick=()=>{vib(6);sheet(+b.dataset.m)});
 $('fqmTg').onclick=()=>{S.fqmHide=S.fqmHide?0:1;save();vib(10);R.months()}};

function sheet(m){const o=MO()[m];if(!o)return;const f=today(),cur=f.hn.m===m,nx=cur?null:findNext(m,1,f);
 const src=s=>s?`<a class="fqm-src" href="${s.u}" target="_blank" rel="noopener">${s.l}<i class="ph ph-arrow-up-right"></i></a>`:`<span class="fqm-src tip">${X('Tip','نصيحة')}</span>`;
 const it=(arr,ic,cls)=>arr.map(([en,ar,s])=>`<li class="${cls}"><i class="ph ${ic}"></i><span><p dir="auto"${L==='ar'&&/[ً-ْ]/.test(ar)?' class="ar"':''}>${L==='ar'?ar:en}</p>${src(s)}</span></li>`).join('');
 openSheet(`<div class="fqm-shh"><span class="fqm-mi k${o.k}">${N(m)}</span><span class="tx"><b>${hm(m)}</b><small>${o.tag}${cur?' · '+X('Now','الآن'):nx?' · '+inDays(nx.left):''}</small></span>${XB}</div>
  <div class="fqm-sh">
   <p class="glh">${X('Why it is special','فضله')}</p><ul class="fqm-li w fq-leaf">${it(o.why,'ph-sparkle','w')}</ul>
   <p class="glh">${X('What to do','ما يُستحب')}</p><ul class="fqm-li d fq-leaf">${it(o.do,'ph-check-circle','d')}</ul>
   <p class="glh">${X('What to avoid','ما يُجتنب')}</p><ul class="fqm-li n fq-leaf">${it(o.no,'ph-prohibit','n')}</ul>
  </div>`);
 const sh=$('sh');sh.classList.add('fqm-shx');const cl=()=>sh.classList.remove('fqm-shx');$$('[data-x]',sh).forEach(b=>b.addEventListener('click',cl));$('scrim').addEventListener('click',cl,{once:true})}

/* ---------- Calendar link ---------- */
function calLink(){const c=$('s-cal');if(!c||$('fqmCal'))return;const hd=c.querySelector('.hd');if(!hd)return;
 hd.insertAdjacentHTML('afterend',`<button class="fqm-cal fq-leaf" id="fqmCal"><i class="ph ph-sparkle"></i><span>${X('Blessed months and days','الأشهر والأيام الفاضلة')}</span><i class="ph ph-caret-right flip"></i></button>`);$('fqmCal').onclick=()=>go('months')}

/* ---------- hooks ---------- */
const _h=R.home;R.home=function(){_h.apply(this,arguments);try{homeCard()}catch(e){console.error(e)}};
calLink();
try{if($('s-home').classList.contains('on'))homeCard()}catch(e){}
if(location.hash==='#months')go('months',false);
/* the Hijri day can change at Maghrib while the page is open */
let lastKey='';setInterval(()=>{const f=today(),k=f.hn.y+'.'+f.hn.m+'.'+f.hn.d;if(k!==lastKey){const first=!lastKey;lastKey=k;if(!first){try{if($('s-home').classList.contains('on'))homeCard();if($('s-months').classList.contains('on'))R.months()}catch(e){}}}},30000);
window.FQM={season,findNext,today,MO,EV};
})();
