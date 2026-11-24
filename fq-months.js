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

/* Sunnah for every month */
const SUN=()=>[['Fast Mondays and Thursdays: "Deeds are presented on Monday and Thursday, and I love that my deeds are presented while I am fasting."','صيام الاثنين والخميس: «تُعْرَضُ الأَعْمَالُ يَوْمَ الاِثْنَيْنِ وَالْخَمِيسِ فَأُحِبُّ أَنْ يُعْرَضَ عَمَلِي وَأَنَا صَائِمٌ»',h('tirmidhi','747')],
 ['Fast three days each month, best on the white days: the 13th, 14th and 15th.','صيام ثلاثة أيام من كل شهر، وأفضلها الأيام البيض: ١٣ و١٤ و١٥.',h('tirmidhi','761')]];
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
  ['Fasting on the day of Eid al-Adha.','صيام يوم عيد الأضحى.',h('bukhari','1991')]]},
2:{k:0,tag:X('No bad luck in Safar','لا تشاؤم بصفر'),
 why:[],
 do:SUN(),
 no:[['Believing Safar brings bad luck. The Prophet ﷺ said: "There is no bad omen in Safar."','التشاؤم بشهر صفر؛ قال ﷺ: «لاَ عَدْوَى وَلاَ طِيَرَةَ وَلاَ هَامَةَ وَلاَ صَفَرَ»',h('bukhari','5707')]]},
3:{k:0,tag:X('Every-month Sunnah','سنن كل شهر'),why:[],do:SUN(),no:[]},
4:{k:0,tag:X('Every-month Sunnah','سنن كل شهر'),why:[],do:SUN(),no:[]},
5:{k:0,tag:X('Every-month Sunnah','سنن كل شهر'),why:[],do:SUN(),no:[]},
6:{k:0,tag:X('Every-month Sunnah','سنن كل شهر'),why:[],do:SUN(),no:[]}
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

/* ---------- the straight path (Fastaqim's horizon line with stops) ---------- */
/* stops: [{t:label, s:sub, at:0..1, on:bool, end:bool}] ; me: 0..1 where you are now */
function path(stops,me){const n=stops.length,at=k=>n<2?0:k/(n-1);return `<div class="fqm-p n${n}" aria-hidden="true"><div class="fqm-pl"><i class="fqm-pf" style="--w:${Math.round(me*100)}%"></i>${stops.map((s,k)=>`<i class="fqm-ps${s.end?' e':''}${s.on?' on':''}" style="--x:${Math.round(at(k)*100)}%"></i>`).join('')}<b class="fqm-me" style="--x:${Math.round(me*100)}%"></b></div>
 <div class="fqm-pt">${stops.map((s,k)=>`<span class="${k===0?'a':k===n-1?'z':'m'}"><b>${s.t}</b><small>${s.s}</small></span>`).join('')}</div></div>`}
const shortD=d=>gFmt(d,{weekday:'short',day:'numeric',month:'short'});
function homePath(s){const f=s.f;
 if(s.mode==='ram'){const t10=Math.max(0,21-s.day),eid=s.left;
  return path([{t:X('Day 1','اليوم ١'),s:hm(9),at:0,on:1},{t:X('Last ten','العشر الأواخر'),s:t10?inDays(t10):X('Now','الآن'),at:20/s.len,on:s.day>=21},{t:X('Eid al-Fitr','عيد الفطر'),s:inDays(eid),at:1,end:1}],s.day<21?.5*(s.day-1)/20:.5+.5*(s.day-21)/Math.max(1,s.len-20))}
 const r=ram(f);if(!r)return'';const stops=[{t:X('Today','اليوم','Har\'a','Maanta'),s:N(f.hn.d)+' '+hms(f.hn.m),at:0,on:1}];
 const nm=f.hn.m%12+1;if(nm!==9){const x=findNext(nm,1,f);if(x&&x.left<r.left)stops.push({t:hm(nm),s:shortD(x.g),at:x.left/r.left})}
 if(nm!==8&&f.hn.m!==8){const x=findNext(8,1,f);if(x&&x.left<r.left&&x.left>0&&(stops.length<2||x.left>stops[1].at*r.left))stops.push({t:hm(8),s:shortD(x.g),at:x.left/r.left})}
 stops.push({t:hm(9),s:shortD(r.g),at:1,end:1});
 /* keep labels readable: at most 3 stops, middle one centred */
 const st=stops.length>3?[stops[0],stops[1],stops[stops.length-1]]:stops;return path(st,0)}

/* ---------- Home card (sits under the salah card) ---------- */
const inDays=n=>n===0?X('today','اليوم','har\'a','maanta'):n===1?X('tomorrow','غدًا','boru','berri'):X('in '+n+' days','بعد '+N(n)+' يومًا','guyyaa '+n+' booda',n+' maalmood kadib');
function homeCard(){if(S.fqmHide){const o=$('fqmH');if(o)o.remove();return}
 const anchor=$('hero')||$('greet');if(!anchor)return;let el=$('fqmH');
 if(!el||el.previousElementSibling!==anchor){if(el)el.remove();anchor.insertAdjacentHTML('afterend','<button class="fqm-h fq-leaf" id="fqmH"></button>');el=$('fqmH');el.onclick=()=>{vib(8);go('months')}}
 const s=season(),f=s.f;let head,sub;
 if(s.mode==='ram'){head=X('Ramadan · day '+s.day,'رمضان · اليوم '+N(s.day),'Ramadaan · guyyaa '+s.day,'Ramadaan · maalinta '+s.day);
  sub=s.last10?X('Last ten nights. Seek Laylat al-Qadr in the odd nights.','العشر الأواخر. تحرَّ ليلة القدر في الليالي الوتر.'):X(s.left+' days left','بقي '+N(s.left)+' يومًا','Guyyoota '+s.left+' hafan',s.left+' maalmood ayaa haray')}
 else{const r=ram(f);if(!r){el.remove();return}
  head=r.left===0?X('Ramadan begins tonight','يبدأ رمضان الليلة'):r.left===1?X('Ramadan begins tonight at Maghrib','يبدأ رمضان الليلة عند المغرب'):X('Ramadan in '+r.left+' days','رمضان بعد '+N(r.left)+' يومًا','Ramadaan guyyaa '+r.left+' booda','Ramadaan '+r.left+' maalmood kadib');
  sub=X('Expected '+gFmt(r.g,{weekday:'short',day:'numeric',month:'short'})+' · moon sighting decides','متوقّع '+gFmt(r.g,{weekday:'short',day:'numeric',month:'short'})+' · العبرة برؤية الهلال','≈ '+gFmt(r.g,{weekday:'short',day:'numeric',month:'short'}),'≈ '+gFmt(r.g,{weekday:'short',day:'numeric',month:'short'}));
  if(s.mode==='dh'&&s.day<=10)sub=X('Now: the best ten days, day '+s.day+' of 10','الآن: العشر من ذي الحجة، اليوم '+N(s.day)+' من ١٠');
  if(s.mode==='dh'&&s.day>10)sub=X('Now: days of eating, drinking and remembering Allah','الآن: أيام أكل وشرب وذكر لله');
  if(s.mode==='mu')sub=X("Now: Muharram, Allah's month. 'Ashura is the 10th.",'الآن: محرم شهر الله، وعاشوراء يوم العاشر.')}
 const sac=SACRED.has(f.hn.m)?`<em class="fqm-tag">${X('Sacred month now','الآن شهر حرام','Ji\'a kabajamaa','Bil xurmeysan')}</em>`:'';
 el.setAttribute('aria-label',head);
 el.innerHTML=`<span class="fqm-hd"><b>${head}</b><i class="ph ph-caret-right flip"></i></span><small class="fqm-sub">${sub}</small>${sac}${homePath(s)}`}


/* ---------- make-up fasts (qada) before Ramadan ----------
   The question starts on 1 Rajab. A simple count, one dash per fast on the straight line, ticked off one
   per day. Saved per Ramadan year in S.qada = {y, n, total, log:[dates], none}. */
let QSTEP=null;
function qadaY(f){const r=ram(f);return r?r.y:f.hn.y}
function qadaState(f){const y=qadaY(f);if(!S.qada||S.qada.y!==y)return{y,fresh:1};return S.qada}
function qadaShow(f){const m=f.hn.m,q=qadaState(f);if(m===9||q.none)return false;
 if(!q.fresh&&q.n>0)return true;
 if(!q.fresh&&q.n===0&&q.log&&q.log.length&&q.log[q.log.length-1]===dkey(NOW()))return true;
 return !!q.fresh&&(m===7||m===8)}
function qadaCard(){const f=today(),old=$('fqmQ');if(S.fqmHide||!qadaShow(f)){if(old)old.remove();return}
 const card=$('fqmH');if(!card)return;let el=old;if(!el||el.previousElementSibling!==card){if(el)el.remove();card.insertAdjacentHTML('afterend','<div class="fqm-qd fq-leaf" id="fqmQ"></div>');el=$('fqmQ')}
 const q=qadaState(f),r=ram(f),left=r?r.left:0;
 const lk=(u,l)=>`<a class="fqm-src" href="${u}" target="_blank" rel="noopener">${l}<i class="ph ph-arrow-up-right"></i></a>`;
 if(q.fresh){
  const act=QSTEP==null
   ?`<button class="fqm-qb" data-qy="1">${X('Yes, count them','نعم، أحسبها')}</button><button class="fqm-ql" data-qno="1">${X('No missed fasts','لم يفتني شيء')}</button>`
   :`<span class="fqm-st"><button data-qs="-1" aria-label="${X('Less','أقل')}"><i class="ph ph-minus"></i></button><b>${N(QSTEP)}</b><button data-qs="1" aria-label="${X('More','أكثر')}"><i class="ph ph-plus"></i></button></span><button class="fqm-qb" data-qok="1">${X('Save','حفظ')}</button>`;
  el.innerHTML=`<b>${X('Any missed fasts from last Ramadan?','هل فاتك صيام أيام من رمضان الماضي؟')}</b>
  <p>${X('Make them up before Ramadan, '+left+' days from now. Allah says: "then an equal number of other days."','اقضِها قبل رمضان، بعد '+N(left)+' يومًا. قال تعالى: ﴿فَعِدَّةٌ مِّنْ أَيَّامٍ أُخَرَ﴾')} ${lk('https://quran.com/2/184',X("Qur'an, Al-Baqarah 2:184",'القرآن، البقرة ٢:١٨٤'))}</p>
  <div class="fqm-qa">${act}</div>`}
 else if(q.n>0){const wk=Math.max(1,Math.floor(left/7)),per=Math.ceil(q.n/wk);
  el.innerHTML=`<b>${X('Make-up fasts: '+q.n+' left','صيام القضاء: بقي '+N(q.n))}</b>
  <span class="fqm-qs" aria-hidden="true">${[...Array(q.total)].map((_,i)=>`<i class="${i<q.total-q.n?'on':''}"></i>`).join('')}</span>
  <p>${left>0?X('Ramadan in '+left+' days. About '+per+' a week is enough. ','رمضان بعد '+N(left)+' يومًا. يكفي نحو '+N(per)+' في الأسبوع. '):''}${X("Aisha would make up her missed Ramadan fasts in Sha'ban.",'كانت عائشة تقضي ما عليها من رمضان في شعبان.')} ${lk('https://sunnah.com/bukhari:1950',X('Sahih al-Bukhari 1950','صحيح البخاري ١٩٥٠'))}</p>
  <div class="fqm-qa"><button class="fqm-qb" data-qd="1"><i class="ph ph-check"></i>${X('I made one up today','قضيت يومًا اليوم')}</button><button class="fqm-ql" data-qe="1">${X('Change','تعديل')}</button></div>`}
 else el.innerHTML=`<b>${X('All your make-up fasts are done. Alhamdulillah.','أتممت قضاء ما عليك. الحمد لله.')}</b><p>${X('May Allah accept them from you.','تقبّل الله منك.')}</p>`;
 const set=n=>{QSTEP=null;S.qada={y:q.y,n,total:n,log:[],none:n===0?1:0};save();vib(10);qadaCard()};
 const on=(sel,fn)=>{el.querySelectorAll(sel).forEach(b=>b.onclick=()=>fn(b))};
 on('[data-qno]',()=>{set(0);toast(X('Noted. May Allah accept your fasts.','تم. تقبّل الله صيامك.'))});
 on('[data-qy]',()=>{QSTEP=1;vib(6);qadaCard()});
 on('[data-qs]',b=>{QSTEP=Math.min(30,Math.max(1,QSTEP+Number(b.dataset.qs)));vib(6);qadaCard()});
 on('[data-qok]',()=>set(QSTEP));
 on('[data-qd]',()=>{const k=dkey(NOW());if(q.log.includes(k)){toast(X('Already marked for today.','سُجّل اليوم مسبقًا.'));return}
  q.n=Math.max(0,q.n-1);q.log.push(k);S.qada=q;save();vib([10,40,10]);toast(X('Marked. May Allah accept it.','سُجّل. تقبّل الله منك.'));qadaCard()});
 on('[data-qe]',()=>{QSTEP=q.n||1;delete S.qada;save();qadaCard()})}

/* ---------- screen: the year as one straight path, starting where you are ---------- */
const BACK=`<button class="ib" data-back aria-label="${X('Back','رجوع')}"><i class="ph ph-caret-left flip"></i></button>`;
if(!$('s-months')){const last=$$('.scr');last[last.length-1].insertAdjacentHTML('afterend',`<section class="scr" id="s-months"><div class="hd sub">${BACK}<h1>${X('Blessed months','الأشهر الفاضلة','Ji\'oota eebbifamoo','Bilaha barakaysan')}</h1><span style="width:44px"></span></div><div id="fqmB"></div></section>`);TABOF.months='home'}
const KTAG={1:['Sacred','حرام'],2:['Fasting','الصيام'],3:['Blessed','فاضل'],0:['',''] };
R.months=()=>{const s=season(),f=s.f,r=ram(f),M=MO();
 const head=s.mode==='ram'?X('Ramadan · day '+s.day+' of '+s.len,'رمضان · اليوم '+N(s.day)+' من '+N(s.len)):r?(r.left===0?X('Ramadan begins tonight','يبدأ رمضان الليلة'):X('Ramadan in '+r.left+' days','رمضان بعد '+N(r.left)+' يومًا')):'';
 const months=[...Array(12)].map((_,i)=>{const m=(f.hn.m-1+i)%12+1;return{m,cur:i===0,nx:i===0?null:findNext(m,1,f)}});
 const days=(m)=>EV().filter(e=>e[0]===m&&e[1]!==1);
 $('fqmB').innerHTML=`<div class="fqm-top fq-leaf"><b>${head}</b>${homePath(s)}<p class="fqm-note">${X('Dates follow the Umm al-Qura calendar in your time zone. The Hijri day starts at Maghrib. Follow your local moon sighting.','التواريخ حسب تقويم أم القرى بتوقيتك، واليوم الهجري يبدأ عند المغرب. اتّبع رؤية الهلال في بلدك.')}</p></div>
 <ol class="fqm-yr">${months.map(({m,cur,nx})=>{const o=M[m],bl=o.k>0;
  const lead=o.why[0]||o.no[0];
  return `<li class="${bl?'bl':'pl'} ${cur?'cur':''} k${o.k}"><span class="fqm-dot"></span><button class="fqm-mc${bl?' fq-leaf':''}" data-m="${m}">
   <span class="fqm-mh"><b>${hm(m)}</b>${o.k?`<em class="fqm-k k${o.k}">${X(KTAG[o.k][0],KTAG[o.k][1])}</em>`:''}<small>${cur?X('You are here','أنت هنا'):nx?shortD(nx.g)+' · '+inDays(nx.left):''}</small></span>
   ${bl&&lead?`<span class="fqm-q"${L==='ar'?' dir="rtl"':''}>${L==='ar'?lead[1]:lead[0]}</span>`:`<span class="fqm-q m">${o.tag}</span>`}
   ${days(m).length?`<span class="fqm-days">${days(m).map(e=>`<i>${N(e[1])} · ${e[2]}</i>`).join('')}</span>`:''}
   <span class="fqm-more">${bl?X('Virtues, what to do and avoid','الفضل وما يُستحب وما يُجتنب'):X('What to do this month','ما يُستحب في هذا الشهر')}<i class="ph ph-caret-right flip"></i></span></button></li>`}).join('')}</ol>
 <div class="fqm-set fq-leaf"><span class="tx"><b>${X('Show on Home','إظهار في الرئيسية')}</b><small>${X('Ramadan countdown under the salah card','العدّ التنازلي لرمضان تحت بطاقة الصلاة')}</small></span><button class="sw ${S.fqmHide?'':'on'}" id="fqmTg" role="switch" aria-checked="${!S.fqmHide}" aria-label="${X('Show on Home','إظهار في الرئيسية')}"></button></div>
 <p class="fqm-note c">${X("Qur'an from Quran.com. Hadith sahih or hasan only, from sunnah.com. Tap a source to read it in full.",'القرآن من Quran.com، والأحاديث صحيحة أو حسنة فقط من sunnah.com. اضغط المصدر لقراءته كاملًا.')}</p>`;
 $$('#fqmB [data-m]').forEach(b=>b.onclick=()=>{vib(6);sheet(+b.dataset.m)});
 $('fqmTg').onclick=()=>{S.fqmHide=S.fqmHide?0:1;save();vib(10);R.months()}};

function sheet(m){const o=MO()[m];if(!o)return;const f=today(),cur=f.hn.m===m,nx=cur?null:findNext(m,1,f);
 const src=s=>s?`<a class="fqm-src" href="${s.u}" target="_blank" rel="noopener">${s.l}<i class="ph ph-arrow-up-right"></i></a>`:`<span class="fqm-src tip">${X('Advice','نصيحة')}</span>`;
 const ar=t=>/[ً-ْ]/.test(t);
 const it=(arr,cls)=>arr.map(([en,a,s])=>`<li class="${cls}"><span class="fqm-b"></span><span><p ${L==='ar'?`dir="rtl"${ar(a)?' class="ar"':''}`:''}>${L==='ar'?(ar(a)?esc(a).replace(/،/g,'<span class="fqm-cm">،</span>'):a):en}</p>${src(s)}</span></li>`).join('');
 const sec=(t,arr,cls)=>arr.length?`<p class="glh">${t}</p><ul class="fqm-li ${cls} fq-leaf">${it(arr,cls)}</ul>`:'';
 FQM_M=m;$('fqmMT').textContent=X('Blessed months','الأشهر الفاضلة','Ji\'oota eebbifamoo','Bilaha barakaysan');
 $('fqmMB').innerHTML=`<div class="fqm-shh fq-leaf"><b>${hm(m)}</b><small>${o.tag}${cur?' · '+X('You are here','أنت هنا'):nx?' · '+shortD(nx.g)+' · '+inDays(nx.left):''}</small></div>
  ${o.why.length?sec(X('Virtues','الفضل'),o.why,'w'):`<p class="fqm-none fq-leaf">${X('No sahih hadith gives this month a special virtue. These Sunnah acts are for every month:','لم يثبت في حديث صحيح فضل خاص لهذا الشهر. وهذه سنن لكل شهر:')}</p>`}
  ${sec(X('What to do','ما يُستحب'),o.do,'d')}
  ${sec(X('What to avoid','ما يُجتنب'),o.no,'n')}
  <p class="fqm-note c">${X('Hadith sahih or hasan only. Tap a source to read it in full.','الأحاديث صحيحة أو حسنة فقط. اضغط المصدر لقراءته كاملًا.')}</p>`;
 if(!$('s-month').classList.contains('on'))go('month');else scrollTo(0,0)}
let FQM_M=9;
if(!$('s-month')){$('s-months').insertAdjacentHTML('afterend',`<section class="scr" id="s-month"><div class="hd sub">${BACK}<h1 id="fqmMT"></h1><span style="width:44px"></span></div><div id="fqmMB"></div></section>`);TABOF.month='home'}
R.month=()=>{if(!$('fqmMB').innerHTML)sheet(FQM_M)};

/* ---------- Calendar link ---------- */
function calLink(){const c=$('s-cal');if(!c||$('fqmCal'))return;const hd=c.querySelector('.hd');if(!hd)return;
 hd.insertAdjacentHTML('afterend',`<button class="fqm-cal fq-leaf" id="fqmCal"><i class="ph ph-sparkle"></i><span>${X('Blessed months and days','الأشهر والأيام الفاضلة')}</span><i class="ph ph-caret-right flip"></i></button>`);$('fqmCal').onclick=()=>go('months')}

/* ---------- hooks ---------- */
const _h=R.home;R.home=function(){_h.apply(this,arguments);try{homeCard();qadaCard()}catch(e){console.error(e)}};
calLink();
try{if($('s-home').classList.contains('on')){homeCard();qadaCard()}}catch(e){}
if(location.hash==='#months')go('months',false);
/* the Hijri day can change at Maghrib while the page is open */
let lastKey='';setInterval(()=>{const f=today(),k=f.hn.y+'.'+f.hn.m+'.'+f.hn.d;if(k!==lastKey){const first=!lastKey;lastKey=k;if(!first){try{if($('s-home').classList.contains('on')){homeCard();qadaCard()}if($('s-months').classList.contains('on'))R.months()}catch(e){}}}},30000);
window.FQM={season,findNext,today,MO,EV};
})();
