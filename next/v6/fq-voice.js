/* Fastaqim "Say it, I'll fit it" voice planner (23 Nov 2026)  (c) Fastaqim, all rights reserved.
   Talk freely (or type), Fastaqim pulls out each task or event and fits it into your day around the five salah,
   your weekly schedule and what is already planned. Fixed times stay where you said them; flexible ones go into
   the first free gap that suits them. Nothing is saved until you press Add, and Undo takes it all back.
   Free and on the phone: speech becomes text with the browser's own speech service (or the keyboard mic),
   and the understanding is plain rules in this file. No AI service, no cost, no recording kept.
   Own file so other work on index.html never overwrites it. Uses the page's globals:
   $, $$, T, L, LI, S, save, go, R, openSheet, closeSheet, XB, toast, vib, esc, AR, f12, dkey, SAL, NOW, undoToast, blocked, prayerTimes. */
(function(){'use strict';
const X=(en,ar)=>L==='ar'?ar:(LI>=0&&typeof DICT==='object'&&DICT[en])?DICT[en][LI]:en;
const pad=n=>String(n).padStart(2,'0');
const hm=m=>pad(Math.floor(m/60)%24)+':'+pad(Math.round(m)%60);
const fm=m=>f12(hm(m));
const toM=s=>{const[h,m]=String(s).split(':').map(Number);return h*60+m};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const dOf=k=>new Date(k+'T12:00:00');
const addD=(k,n)=>{const d=dOf(k);d.setDate(d.getDate()+n);return dkey(d)};
const today=()=>dkey(NOW());
const loc=()=>L==='ar'?'ar':(typeof LX==='string'&&LX!=='en'?LX:'en-US');
const dayLabel=k=>{const t=today();if(k===t)return X('Today','اليوم');if(k===addD(t,1))return X('Tomorrow','غدًا');
 try{return dOf(k).toLocaleDateString(loc(),{weekday:'short',day:'numeric',month:'short'})}catch(e){return k}};
const enLabel=k=>{const t=today();if(k===t)return'Today';if(k===addD(t,1))return'Tomorrow';return dOf(k).toLocaleDateString('en-US',{weekday:'short',day:'numeric',month:'short'})};
const en12=m=>{let h=Math.floor(m/60)%24;const s=h>=12?'PM':'AM';h=h%12||12;return h+':'+pad(m%60)+' '+s};
const durTx=m=>m<60?X(m+' min',AR(m)+' د'):(m%60?X((m/60).toFixed(1).replace('.0','')+' h',AR((m/60).toFixed(1))+' س'):X(m/60+' h',AR(m/60)+' س'));

S.vp=S.vp||{};const VP=S.vp;if(!VP.ws)VP.ws='08:00';if(!VP.we)VP.we='22:00';
const LF=()=>(S.life=S.life||{},S.life.sch=S.life.sch||[],S.life.fam=S.life.fam||[],S.life);

/* ---------------- salah times for any day ---------------- */
const SK=['fajr','dhuhr','asr','maghrib','isha'];
const SN={fajr:['Fajr','الفجر'],dhuhr:['Dhuhr','الظهر'],asr:['Asr','العصر'],maghrib:['Maghrib','المغرب'],isha:['Isha','العشاء']};
function salFor(k){const o={};try{const l=S.loc;if(l&&isFinite(l.lat)&&typeof prayerTimes==='function'){const p=prayerTimes(dOf(k),l.lat,l.lng,l.meth||'mwl',l.hanafi),A=l.adj||{};
  SK.forEach(s=>{o[s]=(toM(p[s])+(A[s]||0)+1440)%1440});return o}}catch(e){}
 SAL.forEach(s=>{if(SK.includes(s[0]))o[s[0]]=toM(s[3])});return o}
const salName=s=>X(SN[s][0],SN[s][1]);

/* ---------------- what is already on a day ---------------- */
const meOk=x=>x.who.includes('all')||(VP.me&&x.who.includes(VP.me))||!LF().fam.length;
function busy(k,skipIds){const sl=salFor(k),fri=dOf(k).getDay()===5,out=[];
 SK.forEach(s=>out.push({a:sl[s],b:sl[s]+(s==='dhuhr'&&fri?60:20),sal:s,t:salName(s)}));
 LF().sch.forEach(x=>{if(x.d.includes(dOf(k).getDay())&&meOk(x))out.push({a:toM(x.s),b:toM(x.e),t:x.t,sch:1})});
 S.tasks.forEach(t=>{if(skipIds&&skipIds.has(t.id))return;if(t.dt===k&&t.s!=null)out.push({a:t.s,b:t.s+(t.du||30),t:t.t,id:t.id});
  else if(!t.dt&&k===today()){const m=/(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(t.due||'');if(m&&/Today|اليوم/.test(t.due||'')){let h=+m[1]%12;if(/pm/i.test(m[3]))h+=12;out.push({a:h*60+ +m[2],b:h*60+ +m[2]+30,t:t.t,id:t.id})}}});
 return out.sort((x,y)=>x.a-y.a)}
const overlap=(a,b,l)=>l.filter(x=>x.a<b&&a<x.b);

/* ---------------- understanding what was said ---------------- */
const NW={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,fifteen:15,twenty:20,thirty:30,'forty five':45,'forty-five':45,ninety:90};
const NWR=new RegExp('\\b('+Object.keys(NW).sort((a,b)=>b.length-a.length).join('|')+')\\b','gi');
const WD=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const WDR='(sun|mon|tues?|wed(?:nes)?|thu(?:rs?)?|fri|sat(?:ur)?)(?:day)?';
const wdIdx=w=>{w=w.toLowerCase();return WD.findIndex(d=>d.startsWith(w.slice(0,3)))};
const MO=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const SALR='(fajr|fajir|fajar|dhuhr|zuhr|duhr|dhur|zohr|thuhr|zuhur|asr|asar|aser|asir|maghrib|magrib|maghreb|isha|esha|ishaa|jumu\'?ah|jummah|juma)';
const salKey=w=>{w=w.toLowerCase();return /^fa/.test(w)?'fajr':/^(dh|zu|du|zo|th)/.test(w)?'dhuhr':/^a/.test(w)?'asr':/^ma/.test(w)?'maghrib':/^j/.test(w)?'dhuhr':'isha'};
const AD={'٠':0,'١':1,'٢':2,'٣':3,'٤':4,'٥':5,'٦':6,'٧':7,'٨':8,'٩':9};
const ARSAL={'الفجر':'fajr','الظهر':'dhuhr','العصر':'asr','المغرب':'maghrib','العشاء':'isha','الجمعة':'dhuhr'};
const DUR=[[/\b(exam|test|final)s?\b/i,120],[/\b(work|shift)\b/i,480],[/\b(school)\b/i,360],[/\b(class|lecture|lesson|course|halaqa|halaqah|seminar|training)\b/i,60],[/\b(meeting|appointment|appt|doctor|dentist|therapy|interview|session|visit)\b/i,60],
 [/\b(gym|workout|work out|exercise|run|swim)\b/i,60],[/\b(study|homework|revise|review|essay|assignment|project|memori[sz]e|hifz)\b/i,60],[/\b(shop|shopping|groceries|grocery|market|mall|errands?)\b/i,45],
 [/\b(cook|bake|dinner|lunch|breakfast|meal prep)\b/i,45],[/\b(clean|tidy|laundry|dishes|vacuum|iron)\b/i,30],[/\b(walk)\b/i,30],[/\b(read|quran|qur'an|tafsir|adhkar)\b/i,30],
 [/\b(call|text|email|e-mail|message|reply|pay|book|order|ring|whatsapp)\b/i,15],[/\b(pick up|drop off|pickup|dropoff)\b/i,20],[/(امتحان)/,120],[/(دوام|عمل)/,480],[/(درس|محاضرة|حلقة|موعد|اجتماع|طبيب)/,60],[/(مذاكرة|دراسة)/,60],[/(اتصال|اتصل)/,15]];
const EVT=/\b(class|lecture|lesson|course|halaqa|halaqah|seminar|training|meeting|appointment|appt|doctor|dentist|therapy|interview|session|exam|test|work|shift|school|flight|wedding|aqiqah|event|dinner at|visit)\b|درس|محاضرة|حلقة|موعد|اجتماع|امتحان|دوام|عمل/i;

function prep(s){return s.replace(/[٠-٩]/g,d=>AD[d]).replace(/\bp\.\s?m\.?/gi,'pm').replace(/\ba\.\s?m\.?/gi,'am').replace(/\bo'?\s?clock\b/gi,'')
 .replace(/\bnoon\b/gi,'12 pm').replace(/\bmidday\b/gi,'12 pm').replace(/\bmidnight\b/gi,'12 am')
 .replace(NWR,w=>NW[w.toLowerCase()]).replace(/\b(\d{1,2})\s+(15|30|45)\b(?!\s*(?:min|minutes|mins|hours?|hrs?))/gi,'$1:$2')
 .replace(/\bhalf\s+past\s+(\d{1,2})\b/gi,'$1:30').replace(/\bquarter\s+past\s+(\d{1,2})\b/gi,'$1:15').replace(/\bquarter\s+to\s+(\d{1,2})\b/gi,(m,h)=>((+h+11)%12||12)+':45')
 .replace(/(\d)\s*(am|pm)\b/gi,'$1 $2').replace(/\s+/g,' ').trim()}

/* split the brain dump into separate things */
const VERB='(?:i\\s|i\'m|i\'ve|i\'ll|im\\s|need|have|has|got|go|call|buy|pick|study|read|clean|cook|pray|email|text|visit|meet|finish|do|make|take|send|pay|book|wash|fix|work|grab|get|drop|attend|review|prepare|write|walk|exercise|gym|shop|return|bring|feed|help|check|order|plan|practi[cs]e|memori[sz]e|revise|remind|don\'t forget|also|there\'s|there is|my\\s)';
function split(text){const t=prep(text);
 let parts=t.split(/[\n.!?;؛]+(?:\s|$)|[\n؛]/);
 parts=parts.flatMap(p=>p.split(/,\s*(?!(?:and\s+)?(?:on\s+)?(?:mon|tue|wed|thu|fri|sat|sun|\d))/i));
 parts=parts.flatMap(p=>p.split(/\s*\b(?:and then|after that|then|also|plus|oh and|and also|another thing|next)\b\s*/i));
 parts=parts.flatMap(p=>p.split(new RegExp('\\s+and\\s+(?='+VERB+')','i')));
 parts=parts.flatMap(p=>p.split(/\s+(?:ثم|وبعدين|وكمان|وأيضا|وأيضًا)\s+|\s*،\s*/));
 return parts.map(x=>x.trim()).filter(x=>x.replace(/[\s\p{P}]/gu,'').length>1)}

function parse(chunk,base){let s=' '+chunk+' ';const it={raw:chunk,date:null,rep:null,s:null,e:null,du:null,win:null,anchor:null,by:null};
 const cut=re=>{const m=re.exec(s);if(m)s=s.slice(0,m.index)+' '+s.slice(m.index+m[0].length);return m};
 let m;
 /* repeats */
 if((m=cut(/\b(?:every\s*day|daily|each day)\b/i)))it.rep=[0,1,2,3,4,5,6];
 else if((m=cut(/\b(?:every\s+)?week\s*days\b|\bmonday (?:to|through|thru) friday\b/i)))it.rep=[1,2,3,4,5];
 else if((m=cut(/\bweekends\b|\bevery weekend\b/i)))it.rep=[0,6];
 else if((m=cut(new RegExp('\\b(?:every|each)\\s+'+WDR+'(?:\\s*(?:,|and|&)\\s*'+WDR+')*','i')))||(m=cut(new RegExp('\\b(?:on\\s+)?'+WDR+'s\\b(?:\\s*(?:,|and|&)\\s*'+WDR+'s?)*','i')))){
  it.rep=[...new Set((m[0].match(new RegExp(WDR,'gi'))||[]).map(wdIdx).filter(i=>i>=0))].sort();if(!it.rep.length)it.rep=null}
 else if((m=cut(/كل\s+يوم/)))it.rep=[0,1,2,3,4,5,6];
 /* day */
 if(!it.rep){
  if((m=cut(/\b(?:the\s+)?day after tomorrow\b/i)))it.date=addD(base,2);
  else if((m=cut(/\b(?:tomorrow|tmrw|tmr|tomorow)\b|بكرة|بكره|غدا|غدًا/i)))it.date=addD(base,1);
  else if((m=cut(/\btonight\b|\bthis evening\b|الليلة/i))){it.date=base;it.win='eve'}
  else if((m=cut(/\btoday\b|\bthis (?:morning|afternoon)\b|اليوم/i))){it.date=base;if(/morning/i.test(m[0]))it.win='am';if(/afternoon/i.test(m[0]))it.win='pm'}
  else if((m=cut(/\bnext week\b/i))){const d=dOf(base);it.date=addD(base,((8-d.getDay())%7)||7)}
  else if((m=cut(/\bthis weekend\b|\bon the weekend\b/i))){const d=dOf(base);it.date=addD(base,(6-d.getDay()+7)%7||0)}
  else if((m=cut(new RegExp('\\b(next|this|on|coming)?\\s*'+WDR+'\\b(?!s)','i')))){const w=wdIdx(m[2]);if(w>=0){let n=(w-dOf(base).getDay()+7)%7;if(n===0&&/next/i.test(m[1]||''))n=7;it.date=addD(base,n)}}
  else if((m=cut(new RegExp('\\b(?:on\\s+)?(?:the\\s+)?(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+of)?\\s+('+MO.join('|')+')[a-z]*\\b|\\b(?:on\\s+)?('+MO.join('|')+')[a-z]*\\s+(?:the\\s+)?(\\d{1,2})(?:st|nd|rd|th)?\\b','i')))){
   const day=+(m[1]||m[4]),mo=MO.indexOf((m[2]||m[3]).slice(0,3).toLowerCase()),b=dOf(base);let d=new Date(b.getFullYear(),mo,day,12);if(d<b&&dkey(d)!==base)d.setFullYear(d.getFullYear()+1);it.date=dkey(d)}
  else if((m=cut(/\bon the (\d{1,2})(?:st|nd|rd|th)\b/i))){const b=dOf(base);let d=new Date(b.getFullYear(),b.getMonth(),+m[1],12);if(dkey(d)<base)d.setMonth(d.getMonth()+1);it.date=dkey(d)}
 }
 /* duration */
 if((m=cut(/\b(?:for\s+)?(?:about\s+|around\s+)?(?:an?\s+)?hour and a half\b|\b(?:for\s+)?1\.5\s*(?:hours?|hrs?)\b/i)))it.du=90;
 else if((m=cut(/\b(?:for\s+)?(?:about\s+|around\s+)?(?:a\s+)?half(?:\s+an?)?\s+hour\b/i)))it.du=30;
 else if((m=cut(/\b(?:for\s+)?(?:about\s+|around\s+)?(\d+(?:\.\d+)?|an?|a couple(?: of)?|couple of)\s*(hours?|hrs?|h)\b(?:\s*(?:and\s*)?(\d{1,2})\s*(?:minutes?|mins?|m)\b)?/i))){const n=/couple/i.test(m[1])?2:/^an?$/i.test(m[1])?1:+m[1];it.du=Math.round(n*60)+(+m[3]||0)}
 else if((m=cut(/\b(?:for\s+)?(?:about\s+|around\s+)?(\d{1,3})\s*(?:minutes?|mins?|m)\b/i)))it.du=+m[1];
 else if((m=cut(/(?:لمدة\s+)?(?:ساعة ونص|ساعة ونصف)/)))it.du=90;else if((m=cut(/(?<![\u0600-\u06FF])(?:لمدة\s+)?(\d+)\s*(?:ساعات|ساعة)(?![\u0600-\u06FF])|(?<![\u0600-\u06FF])(?:لمدة\s+)?(ساعتين|ساعة)(?![\u0600-\u06FF])/))){it.du=m[1]?+m[1]*60:m[2]==='ساعتين'?120:60}
 else if((m=cut(/(?:لمدة\s+)?(\d+)\s*(?:دقيقة|دقائق|د)\b/)))it.du=+m[1];
 /* salah anchors */
 if((m=cut(new RegExp('\\b(right after|straight after|after|before|between)\\s+'+SALR+'(?:\\s+(?:and|&)\\s+'+SALR+')?(?:\\s+(?:salah|salat|prayer|namaz))?','i')))){
  const k=salKey(m[2]);it.anchor={k:/before/i.test(m[1])?'before':'after',s:k};if(m[3])it.anchor={k:'between',s:k,s2:salKey(m[3])}}
 else if((m=cut(new RegExp('\\b(?:at)\\s+'+SALR+'(?:\\s+time)?\\b','i'))))it.anchor={k:'after',s:salKey(m[1])};
 else if((m=cut(/(بعد|قبل)\s*(الفجر|الظهر|العصر|المغرب|العشاء|الجمعة)/)))it.anchor={k:m[1]==='قبل'?'before':'after',s:ARSAL[m[2]]};
 /* clock times: a range first, then one time */
 const tm=(h,mi,ap,ctx)=>{h=+h;mi=+(mi||0);if(h>24||mi>59)return null;if(ap)it.ap=1;if(ap){ap=ap.toLowerCase();if(ap==='pm'&&h<12)h+=12;if(ap==='am'&&h===12)h=0}
  else if(h<=12){const eve=ctx==='eve'||/\b(evening|night|tonight|after work)\b/i.test(chunk);const morn=/\bmorning\b/i.test(chunk);if(eve&&h<12)h+=12;else if(!morn&&h>=1&&h<=6)h+=12;else if(h===12)h=12}return h*60+mi};
 {const RR=/\b(?:from\s+|between\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|—|to|until|till|til|and)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b(?!\s*(?:hours?|hrs?|minutes?|mins?|people|kids|times))/i;
  const r0=RR.exec(s);if(r0&&(r0[3]||r0[6]||/from|between/i.test(r0[0])||/:/.test(r0[0])||(EVT.test(chunk)&&+r0[1]<=12&&+r0[4]<=12&&!/\band\b/i.test(r0[0])))){m=cut(RR);
   const ap1=m[3]||(m[6]&&+m[1]<=+m[4]?m[6]:null);let a=tm(m[1],m[2],ap1,it.win),b=tm(m[4],m[5],m[6],it.win);if(a!=null&&b!=null){if(b<=a&&b+720>a&&!m[6])b+=720;if(b>a){it.s=a;it.e=b;it.du=b-a}}}}
 if(it.s==null){
  if((m=cut(/\b(by|before)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b(?!\s*(?:hours?|hrs?|minutes?|mins?|th|st|nd|rd))/i))){const t=tm(m[2],m[3],m[4],it.win);if(t!=null)it.by=t}
  else if((m=cut(/\b(?:at|@|around|from|starting at|starts at|start at)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i))||(m=cut(/\b(?:at|@|around|from|starting at|starts at|start at)\s+(\d{1,2})(?::(\d{2}))?\b(?!\s*(?:hours?|hrs?|h\b|minutes?|mins?|th|st|nd|rd|%|people|kids|times))/i))||(m=cut(/\b(\d{1,2}):(\d{2})\b/))){const t=tm(m[1],m[2],m[3],it.win);if(t!=null)it.s=t}
  else if((m=cut(/(?:الساعة|ساعة|على)\s*(\d{1,2})(?::(\d{2}))?\s*(صباحا|صباحًا|الصبح|ص|مساء|مساءً|المساء|العصر|م)?/))){const pm=/مساء|المساء|العصر|^م$/.test(m[3]||'');const t=tm(m[1],m[2],m[3]?(pm?'pm':'am'):null,it.win);if(t!=null)it.s=t}
 }
 /* part of day */
 if(!it.win){if((m=cut(/\b(?:in the\s+|this\s+)?morning\b|صباحا|الصبح/i)))it.win='am';else if((m=cut(/\b(?:in the\s+)?afternoon\b|بعد الظهر/i)))it.win='pm';else if((m=cut(/\b(?:in the\s+|this\s+)?(?:evening|night)\b|\bafter (?:work|school|class)\b|مساء|بالليل/i)))it.win='eve';else if((m=cut(/\b(?:at\s+)?lunch\s*time\b|\bat lunch\b/i)))it.win='lunch'}
 else cut(/\b(?:in the\s+)?(?:morning|afternoon|evening|night)\b/i);
 /* the words that are left are the title */
 let t=s.replace(/\s+/g,' ').trim();
 const lead=/^(?:and|also|then|so|okay|ok|um+|uh+|erm|like|oh|plus|well|alright|right|hey|siri|fastaqim|please|and then|i think|basically|i mean|first|second|third|finally|lastly|و)[\s,]+/i;
 for(let i=0;i<6;i++){const b=t;t=t.replace(lead,'');t=t.replace(/^(?:add|put|schedule|plan|remind me to|remind me|don't let me forget to|don't forget to|dont forget to|make sure (?:i|to)|i need you to|can you|could you)\s+/i,'');
  t=t.replace(/^(?:i\s+|i'm\s+|im\s+|we\s+|i've\s+|ive\s+)?(?:have got to|have to|has to|got to|gotta|need to|needs to|must|should|want to|wanna|would like to|am going to|going to|gonna|will|'ll|plan to|have a|have an|have my|have the|have|got a|got an|got my|got|need|am|is)\s+/i,'');
  t=t.replace(/^(?:there's|there is|there are)\s+(?:a|an|my)?\s*/i,'');t=t.replace(/^(?:a|an|my)\s+(?=\S+\s*$|class|meeting|appointment|lecture|exam|test|shift)/i,'');if(t===b)break}
 t=t.replace(/\s+(?:to|in|on|into|onto)\s+(?:my|the)\s+(?:schedule|calendar|day|plan|planner|list|to-?do(?: list)?)\b/gi,'').replace(/\b(?:please|okay|ok|thanks|thank you)\b/gi,'')
  .replace(/(?:\s+(?:at|on|for|from|by|in|the|to|and|around|about|of|this|that|is|it|um|uh|like|so|which|starts|starting|then))+\s*$/i,'').replace(/^[\s,\-–:]+|[\s,\-–:]+$/g,'').replace(/\s{2,}/g,' ').trim();
 t=t.replace(/^(?:بدي|لازم|عندي|أريد|اريد|ضيف|أضف|اضف|ذكرني)\s+/,'');
 it.t=t?t.charAt(0).toUpperCase()+t.slice(1):'';
 if(it.du==null){const d=DUR.find(x=>x[0].test(chunk));it.du=d?d[1]:30}
 if(it.s!=null&&it.e==null)it.e=it.s+it.du;
 it.ev=EVT.test(chunk)||it.s!=null&&!it.by;
 return it}

/* ---------------- fitting into the day ---------------- */
function winFor(it,k){const sl=salFor(k),ws=toM(VP.ws),we=toM(VP.we);let a=ws,b=we;
 if(it.win==='am'){a=Math.max(ws,sl.fajr+20);b=Math.min(we,sl.dhuhr)}else if(it.win==='pm'){a=Math.max(ws,sl.dhuhr+20);b=Math.min(we,sl.maghrib)}else if(it.win==='eve'){a=Math.max(sl.maghrib+20,Math.min(we-60,17*60));b=Math.max(we,sl.isha+90)}else if(it.win==='lunch'){a=12*60;b=14*60}
 if(it.anchor){const x=it.anchor;if(x.k==='after'){a=Math.max(sl[x.s]+(x.s==='dhuhr'&&dOf(k).getDay()===5?60:20),x.s==='fajr'?0:a);if(x.s==='fajr')a=sl.fajr+20;if(b<=a)b=Math.max(we,a+180)}
  else if(x.k==='before'){b=sl[x.s];if(a>=b-it.du)a=Math.max(0,x.s==='fajr'?b-120:b-240)}else{a=sl[x.s]+20;b=sl[x.s2]}}
 if(it.by!=null)b=Math.min(b,it.by);
 if(k===today()){const n=NOW(),nm=n.getHours()*60+n.getMinutes();a=Math.max(a,Math.ceil((nm+10)/5)*5)}
 return[a,b]}
function gap(k,it,taken,skip){const[a,b]=winFor(it,k),l=busy(k,skip).concat(taken.filter(x=>x.dt===k).map(x=>({a:x.s,b:x.s+x.du,t:x.t})));let t=Math.ceil(a/5)*5;
 for(let i=0;i<300&&t+it.du<=b;i++){const o=overlap(t,t+it.du,l);if(!o.length)return t;t=Math.ceil(Math.max(...o.map(x=>x.b))/5)*5}return null}
function plan(text){const base=today(),out=[],left=[],mv=[];let last=null;
 for(const c of split(text)){const it=parse(c,base);
  if(!it.t){if(last&&(it.s!=null||it.date||it.anchor||it.win||it.rep)){for(const k of['date','rep','s','e','anchor','win','by'])if(it[k]!=null&&last[k]==null)last[k]=it[k];if(it.s!=null){last.e=it.s+last.du;last.ev=true}}continue}
  if(blocked(it.t)){left.push(it.t);continue}
  out.push(it);last=it}
 const taken=[];let carry=null,nowM=(()=>{const n=NOW();return n.getHours()*60+n.getMinutes()})();
 for(const it of out){if(it.date)carry=it.date;else if(carry&&!it.rep){it.date=carry;it.carried=1}
  if(!it.rep&&it.s!=null&&(it.date||base)===base&&it.e<=nowM+5){if(!it.ap&&it.s<720&&it.s+720>nowM){it.s+=720;it.e+=720}else if(!it.date||it.carried){it.date=addD(base,1);it.past=1}}
 }
 for(const it of out){
  if(it.rep){it.kind='rep';if(it.s==null){const sl=salFor(base);const w=winFor(Object.assign({},it,{rep:null}),addD(base,7));it.s=Math.max(w[0],toM(VP.ws));it.e=it.s+it.du;it.guess=1}continue}
  const k=it.date||base;it.dt=k;
  if(it.s!=null){it.kind='fix';taken.push(it);const sl=salFor(k);
   const hit=SK.filter(s=>sl[s]>=it.s&&sl[s]<it.e),before=SK.find(s=>sl[s]<it.s&&sl[s]+25>it.s);
   it.note=hit.length?{w:1,t:X('Salah during this: ','صلاة أثناء هذا: ')+hit.map(s=>salName(s)+' '+fm(sl[s])).join(', ')+'. '+X('Plan a short break to pray.','خطّط لاستراحة قصيرة للصلاة.')}
    :before?{t:X('Pray '+SN[before][0]+' first ('+fm(sl[before])+').','صلِّ '+SN[before][1]+' أولًا ('+fm(sl[before])+').')}:null;
   const cl=overlap(it.s,it.e,busy(k).filter(x=>!x.sal&&!x.id));if(cl.length)it.note={w:1,t:X('Overlaps','يتداخل مع')+' “'+cl[0].t+'” ('+fm(cl[0].a)+').'};
   if(it.past)it.note={w:1,t:X('That time has passed today, so it’s set for tomorrow.','فات هذا الوقت اليوم، فوُضع غدًا.')};
   /* move flexible voice tasks out of the way */
   S.tasks.forEach(t=>{if(t.dt===k&&t.flex&&t.s!=null&&t.s<it.e&&it.s<t.s+(t.du||30)&&!mv.find(x=>x.id===t.id))mv.push({id:t.id,t:t.t,from:t.s,du:t.du||30,k})})}}
 const skip=new Set(mv.map(x=>x.id));
 for(const it of out){if(it.kind)continue;let k=it.date||base,t=gap(k,it,taken,skip),moved=0;
  if(t==null&&!it.date&&!it.by){for(let n=1;n<=6&&t==null;n++){k=addD(base,n);t=gap(k,it,taken,skip);moved=n}}
  it.dt=k;if(t==null){it.kind='any';it.note={w:1,t:X('No free '+durTx(it.du)+' left that day. Added without a time.','لا يوجد وقت فارغ كافٍ في ذلك اليوم. أُضيف بلا وقت.')};continue}
  it.kind='fit';it.s=t;it.e=t+it.du;taken.push(it);
  const sl=salFor(k),pv=SK.filter(s=>sl[s]+20<=t).pop(),nx=SK.find(s=>sl[s]>=it.e);
  it.note={t:(moved?X('No room today, so ','لا متسع اليوم، لذا ')+dayLabel(k)+'. ':'')+(pv&&nx?X('Fits after '+SN[pv][0]+', before '+SN[nx][0]+'.','بعد '+SN[pv][1]+' وقبل '+SN[nx][1]+'.'):pv?X('Fits after '+SN[pv][0]+'.','بعد '+SN[pv][1]+'.'):nx?X('Fits before '+SN[nx][0]+'.','قبل '+SN[nx][1]+'.'):X('Fits a free gap.','في وقت فارغ.'))}}
 for(const x of mv){const t=gap(x.k,{du:x.du},taken,skip);x.to=t;if(t!=null)taken.push({dt:x.k,s:t,du:x.du,t:x.t})}
 return{items:out,left,mv}}

/* ---------------- the sheet ---------------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let REC=null,LIS=false,BASE='',PL=null,TXT='';
const IC=(n,s)=>`<i class="ph ph-${n}"${s?` style="font-size:${s}px"`:''}></i>`;
/* soft colour by kind of thing: learning, work, calls, home, errands, other (salah stays gold) */
const CATS=[['learn',/\b(class|lecture|lesson|course|halaqa|halaqah|seminar|study|homework|revise|review|essay|assignment|exam|test|quran|qur'an|tafsir|read|memori[sz]e|hifz|school|training)\b|درس|محاضرة|حلقة|مذاكرة|دراسة|امتحان|قرآن|مدرسة/i],
 ['work',/\b(work|shift|meeting|appointment|appt|doctor|dentist|therapy|interview|session|clinic|office|job|client|project)\b|دوام|عمل|موعد|اجتماع|طبيب/i],
 ['talk',/\b(call|ring|phone|text|email|e-mail|message|reply|whatsapp|visit|meet)\b|اتصل|اتصال|رسالة|زيارة/i],
 ['home',/\b(clean|tidy|laundry|dishes|vacuum|iron|cook|bake|dinner|lunch|breakfast|family|kids|room|house|home|trash|meal)\b|تنظيف|طبخ|غسيل|عائلة|البيت/i],
 ['out',/\b(shop|shopping|groceries|grocery|market|mall|errands?|bank|buy|pick up|pickup|drop off|post office|pharmacy|store|gym|walk|run|exercise|workout|swim)\b|تسوق|شراء|بنك|صيدلية|رياضة|مشي/i]];
const catOf=t=>{t=String(t||'');const c=CATS.find(x=>x[1].test(t));return c?c[0]:'other'};
const CATN={learn:['Learning','تعلّم'],work:['Work','عمل'],talk:['Calls','تواصل'],home:['Home','البيت'],out:['Out','خارج البيت'],other:['Other','أخرى']};
const icon=it=>it.kind==='rep'?'repeat':it.ev?'calendar-dots':/\b(call|ring|phone)\b/i.test(it.raw)?'phone':/\b(email|text|message|reply)\b/i.test(it.raw)?'chat-text':/\b(study|read|homework|quran|revise|essay)\b/i.test(it.raw)?'book-open-text':/\b(shop|groceries|buy|market)\b/i.test(it.raw)?'basket':/\b(clean|laundry|dishes|tidy)\b/i.test(it.raw)?'broom':/\b(gym|walk|run|exercise|workout)\b/i.test(it.raw)?'person-simple-walk':'check-square-offset';
function stopRec(){LIS=false;try{REC&&REC.stop()}catch(e){}const b=$('vpMic');if(b){b.classList.remove('on');b.setAttribute('aria-label',X('Start talking','ابدأ الكلام'))}const s=$('vpSt');if(s)s.textContent=SR?X('Tap the circle and talk','اضغط الدائرة وتكلّم'):''}
function startRec(){const ta=$('vpT');if(!SR||!ta)return;try{REC=new SR()}catch(e){noMic();return}
 REC.lang=L==='ar'?'ar-SA':(navigator.language||'en-US');REC.continuous=true;REC.interimResults=true;BASE=ta.value?ta.value.replace(/\s*$/,' '):'';LIS=true;
 REC.onresult=e=>{let f='',n='';for(let i=0;i<e.results.length;i++){const r=e.results[i];if(r.isFinal)f+=r[0].transcript+' ';else n+=r[0].transcript}ta.value=BASE+f+n;ta.scrollTop=ta.scrollHeight;vpBtn()};
 REC.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'||e.error==='audio-capture'){LIS=false;noMic(e.error)}};
 REC.onend=()=>{if(LIS){BASE=ta.value?ta.value.replace(/\s*$/,' '):'';try{REC.start();return}catch(e){}}stopRec()};
 try{REC.start();vib(12);const b=$('vpMic');b.classList.add('on');b.setAttribute('aria-label',X('Stop','إيقاف'));$('vpSt').textContent=X('Listening… tap to stop','أستمع… اضغط للإيقاف')}catch(e){noMic()}}
function noMic(why){stopRec();const w=$('vpMicW');if(w)w.outerHTML=kbHint(why);const ta=$('vpT');if(ta)ta.focus()}
const kbHint=why=>`<div class="vp-kb" id="vpMicW">${IC('microphone',22)}<p><b>${why==='not-allowed'?X('The microphone was not allowed.','لم يُسمح بالميكروفون.'):X('Use your keyboard’s mic','استخدم ميكروفون لوحة المفاتيح')}</b><small>${X('Tap the box below, then the mic key on your keyboard, and talk.','اضغط المربع بالأسفل، ثم زر الميكروفون في لوحة المفاتيح، وتكلّم.')}</small></p></div>`;
function vpBtn(){const b=$('vpGo');if(b)b.disabled=!$('vpT').value.trim()}
function openVoice(pre){PL=null;stopRec();
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Say it, I’ll fit it','قلها، وأنا أرتّبها')}</h1>${XB}</div>
 <div class="vp">
  ${SR?`<div class="vp-mw" id="vpMicW"><button class="vp-mic" id="vpMic" aria-label="${X('Start talking','ابدأ الكلام')}"><span class="vp-r1"></span><span class="vp-r2"></span>${IC('microphone',30)}</button><p class="vp-st" id="vpSt">${X('Tap the circle and talk','اضغط الدائرة وتكلّم')}</p></div>`:kbHint()}
  <textarea id="vpT" rows="4" dir="auto" placeholder="${X('Say everything on your mind. For example: “I have class at 5 pm tomorrow, call the clinic, study 2 hours after Asr, and every Monday Qur’an class 6 to 7.”','قل كل ما في بالك. مثال: «عندي درس الساعة ٥ مساءً غدًا، اتصل بالعيادة، مذاكرة ساعتين بعد العصر.»')}">${esc(pre||TXT||'')}</textarea>
  <p class="vp-fine">${IC('lock-simple',14)}${X('Your voice becomes text on your phone’s own speech service. Fastaqim keeps no recording.','يتحوّل صوتك إلى نص بخدمة الكلام في هاتفك. لا يحفظ Fastaqim أي تسجيل.')}</p>
  <button class="big vp-go" id="vpGo" disabled>${IC('magic-wand',20)} ${X('Fit into my day','رتّبها في يومي')}</button>
 </div>`);
 const ta=$('vpT');ta.oninput=vpBtn;vpBtn();
 if($('vpMic'))$('vpMic').onclick=()=>LIS?stopRec():startRec();
 $('vpGo').onclick=()=>{stopRec();TXT=ta.value;const p=plan(ta.value);if(!p.items.length){toast(p.left.length?X('That one can’t be added.','لا يمكن إضافة هذا.'):X('I didn’t find a task in that. Try “call the clinic at 3 pm”.','لم أجد مهمة. جرّب «الاتصال بالعيادة الساعة ٣ م».'));return}PL=p;review()};
 $$('#sh [data-x]').forEach(b=>b.addEventListener('click',stopRec))}

/* a horizon line for one day: salah marks + what is already there + the new items */
function strip(k,items){const sl=salFor(k),a0=Math.min(toM(VP.ws),sl.fajr)-15,b0=Math.max(toM(VP.we),sl.isha+30),W=b0-a0,P=m=>((Math.max(a0,Math.min(b0,m))-a0)/W*100).toFixed(2)+'%';
 const old=busy(k,new Set(PL?PL.mv.map(x=>x.id):[])).filter(x=>!x.sal);
 let lx=-99;const lab=SK.map(s=>{const x=(Math.max(a0,Math.min(b0,sl[s]))-a0)/W*100,up=x-lx<11;lx=up?-99:x;return up});const nn=items.length;
 return `<div class="vp-day"><div class="vp-dh"><b>${esc(dayLabel(k))}</b><small>${X(nn+' new','جديد: '+AR(nn))}</small></div><div class="vp-hz">
  ${old.map(x=>`<i class="vp-old" style="inset-inline-start:${P(x.a)};width:calc(${P(x.b)} - ${P(x.a)})"></i>`).join('')}
  ${items.filter(i=>i.s!=null&&i.kind!=='any').map(i=>`<i class="vp-new c-${catOf(i.raw+' '+i.t)}" style="inset-inline-start:${P(i.s)};width:max(6px,calc(${P(i.e)} - ${P(i.s)}))"></i>`).join('')}
  ${SK.map((s,j)=>`<span class="vp-sm${lab[j]?' up':''}" style="inset-inline-start:${P(sl[s])}"><em>${esc(salName(s))}</em></span>`).join('')}</div></div>`}
function whoRow(it){const f=LF().fam;if(!f.length)return'';const w=it.who||(VP.me?[VP.me]:['all']);it.who=w;
 return `<div class="vp-who">${[['all',X('Everyone','الجميع'),null],...f.map(p=>[p.id,p.n,p.c])].map(([id,n,c])=>`<button data-vw="${id}" class="${w.includes(id)?'on':''}"><i class="vp-dot" style="background:${c||'var(--acc)'}"></i>${esc(n)}</button>`).join('')}</div>`}
const DN=i=>new Date(2026,10,15+i).toLocaleDateString(loc(),{weekday:'short'});
function card(it,i){const when=it.kind==='rep'?it.rep.map(DN).join(', ')+' · '+fm(it.s)+' – '+fm(it.e):it.kind==='any'?dayLabel(it.dt)+' · '+X('any time','أي وقت'):dayLabel(it.dt)+' · '+fm(it.s)+' – '+fm(it.e);
 const tag=it.kind==='fix'?X('Your time','وقتك'):it.kind==='fit'?X('Fitted','رُتّب'):it.kind==='rep'?X('Every week','أسبوعيًا'):X('Any time','أي وقت');
 return `<div class="vp-it c-${catOf(it.raw+' '+it.t)}" data-i="${i}"><span class="vp-ic">${IC(icon(it),20)}</span><div class="vp-bd">
  <input class="vp-tt" data-tt="${i}" value="${esc(it.t)}" dir="auto" maxlength="120" aria-label="${X('Title','العنوان')}">
  <button class="vp-wh" data-ed="${i}"><span>${esc(when)}</span>${IC('pencil-simple',14)}<em class="vp-tag k-${it.kind}">${tag}</em></button>
  ${it.note?`<p class="vp-nt${it.note.w?' w':''}">${IC(it.note.w?'info':'check-circle',14)}${esc(it.note.t)}</p>`:''}
  ${it.kind==='rep'?`<p class="vp-nt">${IC('calendar-blank',14)}${X('Saved to your weekly schedule.','يُحفظ في جدولك الأسبوعي.')}${it.guess?' '+X('Check the time.','تأكّد من الوقت.'):''}</p>${whoRow(it)}`:''}
  <div class="vp-ef" id="vpE${i}" hidden></div></div>
  <button class="vp-x" data-rm="${i}" aria-label="${X('Remove','إزالة')}">${IC('x',16)}</button></div>`}
function review(){const p=PL;let ks=[...new Set(p.items.filter(i=>i.dt&&i.kind!=='rep').map(i=>i.dt))].sort().slice(0,3);if(!ks.length)ks=[today()];
 openSheet(`<div class="hd sub"><button class="tlk" id="vpBk">${IC('caret-left flip',16)} ${X('Back','رجوع')}</button><h1>${X('Your day','يومك')}</h1><span style="width:60px"></span></div>
 <div class="vp">
  ${ks.map(k=>strip(k,p.items.filter(i=>i.dt===k).concat(p.items.filter(i=>i.kind==='rep'&&i.rep.includes(dOf(k).getDay()))))).join('')}
  <p class="vp-cnt">${X(p.items.length+(p.items.length===1?' thing':' things')+' to add','سيُضاف '+AR(p.items.length))}${p.left.length?' · '+X(p.left.length+' left out','تُرك '+AR(p.left.length)):''}</p>
  <div class="vp-list">${p.items.map(card).join('')}</div>
  ${p.mv.length?`<p class="vp-mvh">${IC('arrows-clockwise',16)}${X('Moved to make room','نُقل لإفساح المجال')}</p><div class="vp-list">${p.mv.map(x=>`<div class="vp-it vp-mv c-${catOf(x.t)}"><span class="vp-ic">${IC('arrow-bend-down-right',18)}</span><div class="vp-bd"><b dir="auto">${esc(x.t)}</b><p class="vp-nt">${fm(x.from)} → ${x.to!=null?fm(x.to):X('any time','أي وقت')}</p></div></div>`).join('')}</div>`:''}
  <button class="vp-day2" id="vpWin">${IC('sun-horizon',16)}${X('My day runs','يومي من')} <b>${fm(toM(VP.ws))} – ${fm(toM(VP.we))}</b>${IC('pencil-simple',14)}</button>
  <div class="vp-ef" id="vpWinE" hidden><label>${X('Start','البداية')}<input type="time" id="vpWs" value="${VP.ws}"></label><label>${X('End','النهاية')}<input type="time" id="vpWe" value="${VP.we}"></label><button class="vp-ok" id="vpWok">${X('Re-fit','أعد الترتيب')}</button></div>
  <button class="big vp-go" id="vpAdd" ${p.items.length?'':'disabled'}>${IC('check',20)} ${p.items.length===1?X('Add it','أضفها'):X('Add all '+p.items.length,'أضف الكل ('+AR(p.items.length)+')')}</button>
 </div>`);
 $('vpBk').onclick=()=>openVoice(TXT);
 $$('#sh [data-rm]').forEach(b=>b.onclick=()=>{p.items.splice(+b.dataset.rm,1);vib(8);refit()});
 $$('#sh [data-tt]').forEach(b=>b.onchange=()=>{const v=b.value.trim();if(v)p.items[+b.dataset.tt].t=v});
 $$('#sh [data-vw]').forEach(b=>b.onclick=()=>{const it=p.items[+b.closest('[data-i]').dataset.i],id=b.dataset.vw;if(id==='all')it.who=['all'];else{it.who=it.who.filter(w=>w!=='all');const j=it.who.indexOf(id);j>=0?it.who.splice(j,1):it.who.push(id);if(!it.who.length)it.who=['all']}if(id!=='all')VP.me=id;
  b.parentNode.querySelectorAll('[data-vw]').forEach(y=>y.classList.toggle('on',it.who.includes(y.dataset.vw)))});
 $$('#sh [data-ed]').forEach(b=>b.onclick=()=>editor(+b.dataset.ed));
 $('vpWin').onclick=()=>{$('vpWinE').hidden=!$('vpWinE').hidden};
 $('vpWok').onclick=()=>{const a=$('vpWs').value,b=$('vpWe').value;if(a&&b&&toM(b)>toM(a)+60){VP.ws=a;VP.we=b;save();refit()}else toast(X('End must be after start','النهاية بعد البداية'))};
 $('vpAdd').onclick=commit}
function refit(){const keep=PL.items;/* re-run the fitting with the user's edits kept */
 keep.forEach(it=>{if(it.kind==='fit'||it.kind==='any'){if(!it.pin){it.s=null;it.e=null;it.kind=null}}});
 const base=today(),taken=keep.filter(it=>it.kind==='fix'||it.pin&&it.s!=null);const skip=new Set(PL.mv.map(x=>x.id));
 for(const it of keep){if(it.kind)continue;let k=it.date||base,t=gap(k,it,taken,skip);if(t==null&&!it.date){for(let n=1;n<=6&&t==null;n++){k=addD(base,n);t=gap(k,it,taken,skip)}}it.dt=k;
  if(t==null){it.kind='any';continue}it.kind='fit';it.s=t;it.e=t+it.du;taken.push(it)}
 review()}
function editor(i){const it=PL.items[i],e=$('vpE'+i);if(!e)return;if(!e.hidden){e.hidden=true;return}
 const DUS=[5,10,15,20,30,45,60,90,120,180,240,300,360,480];if(!DUS.includes(it.du))DUS.push(it.du),DUS.sort((a,b)=>a-b);
 e.innerHTML=it.kind==='rep'?`<div class="vp-days">${[0,1,2,3,4,5,6].map(d=>`<button data-rd="${d}" class="${it.rep.includes(d)?'on':''}">${esc(DN(d))}</button>`).join('')}</div>
   <label>${X('From','من')}<input type="time" id="vpS${i}" value="${hm(it.s)}"></label><label>${X('To','إلى')}<input type="time" id="vpT${i}" value="${hm(it.e)}"></label><button class="vp-ok" id="vpO${i}">${X('Done','تم')}</button>`
  :`<label>${X('Day','اليوم')}<input type="date" id="vpD${i}" value="${it.dt}" min="${today()}"></label><label>${X('Time','الوقت')}<input type="time" id="vpS${i}" value="${it.s!=null?hm(it.s):''}"></label>
   <label>${X('Length','المدة')}<select id="vpL${i}">${DUS.map(d=>`<option value="${d}"${d===it.du?' selected':''}>${durTx(d)}</option>`).join('')}</select></label>
   <button class="vp-ok" id="vpO${i}">${X('Done','تم')}</button><button class="vp-auto" id="vpA${i}">${IC('magic-wand',14)}${X('Find a time for me','اختر لي وقتًا')}</button>`;
 e.hidden=false;
 $$('[data-rd]',e).forEach(b=>b.onclick=()=>{const d=+b.dataset.rd,j=it.rep.indexOf(d);if(j>=0){if(it.rep.length>1)it.rep.splice(j,1)}else it.rep.push(d);it.rep.sort();$$('[data-rd]',e).forEach(y=>y.classList.toggle('on',it.rep.includes(+y.dataset.rd)))});
 $('vpO'+i).onclick=()=>{if(it.kind==='rep'){const a=$('vpS'+i).value,b=$('vpT'+i).value;if(!a||!b||toM(b)<=toM(a)){toast(X('End must be after start','النهاية بعد البداية'));return}it.s=toM(a);it.e=toM(b);it.du=it.e-it.s;it.guess=0;review();return}
  const d=$('vpD'+i).value||it.dt,s=$('vpS'+i).value,du=+$('vpL'+i).value;it.du=du;it.date=d;it.dt=d;
  if(s){it.s=toM(s);it.e=it.s+du;it.kind='fix';it.pin=1;it.note=null;const sl=salFor(d),hit=SK.filter(k=>sl[k]>=it.s&&sl[k]<it.e);if(hit.length)it.note={w:1,t:X('Salah during this: ','صلاة أثناء هذا: ')+hit.map(k=>salName(k)+' '+fm(sl[k])).join(', ')+'. '+X('Plan a short break to pray.','خطّط لاستراحة قصيرة للصلاة.')};review()}
  else{it.kind=null;it.pin=0;it.note=null;refit()}};
 if($('vpA'+i))$('vpA'+i).onclick=()=>{it.date=$('vpD'+i).value||it.dt;it.du=+$('vpL'+i).value;it.kind=null;it.pin=0;it.s=null;it.note=null;refit()}}

/* ---------------- save + undo ---------------- */
function due(k,s,du){return (s==null?(enLabel(k)==='Today'?T('Today','اليوم'):enLabel(k)):enLabel(k)+', '+en12(s))+(du?' · '+durTx(du):'')}
const szOf=m=>m<=10?'s':m<=45?'m':'l';
function commit(){$$('#sh [data-tt]').forEach(b=>{const v=b.value.trim();if(v)PL.items[+b.dataset.tt].t=v});
 const bad=PL.items.find(it=>blocked(it.t));if(bad){blkWarn(bad.t);return}
 const add=[],sch=[],moved=[],now=Date.now();let n=0;
 for(const it of PL.items){if(it.kind==='rep'){const x={id:uid(),t:it.t.slice(0,50),s:hm(it.s),e:hm(it.e),d:[...it.rep],who:it.who||['all']};LF().sch.push(x);sch.push(x.id)}
  else{const t={id:now+(n++),t:it.t,due:due(it.dt,it.kind==='any'?null:it.s,it.du),p:it.ev?'h':'m',dt:it.dt,du:it.du,vp:1};if(it.kind!=='any')t.s=it.s;if(it.kind==='fit')t.flex=1;S.tasks.unshift(t);add.push(t.id)}}
 for(const x of PL.mv){const t=S.tasks.find(y=>y.id===x.id);if(!t)continue;moved.push({id:t.id,s:t.s,due:t.due});if(x.to!=null){t.s=x.to;t.due=due(t.dt,x.to,t.du)}else{delete t.s;t.due=due(t.dt,null,t.du)}}
 const cnt=add.length+sch.length;VP.last={add,sch,moved,at:now};save();closeSheet();TXT='';PL=null;vib([18,40,18]);rer();
 undoToast(cnt===1?X('Added to your day','أُضيف إلى يومك'):X(cnt+' added to your day','أُضيف '+AR(cnt)+' إلى يومك'),undo)}
function undo(){const l=VP.last;if(!l)return;S.tasks=S.tasks.filter(t=>!l.add.includes(t.id));LF().sch=LF().sch.filter(x=>!l.sch.includes(x.id));
 l.moved.forEach(m=>{const t=S.tasks.find(y=>y.id===m.id);if(t){if(m.s==null)delete t.s;else t.s=m.s;t.due=m.due}});VP.last=null;save();rer();toast(X('Taken back','تم التراجع'))}
function rer(){try{R.todo&&R.todo()}catch(e){}try{R.home&&R.home()}catch(e){}try{R.fam&&$('s-fam')&&$('s-fam').classList.contains('on')&&R.fam()}catch(e){}}

/* keep "Today / Tomorrow" labels true as days pass */
function roll(){let ch=0;S.tasks.forEach(t=>{if(t.vp&&t.dt){const d=due(t.dt,t.s,t.du);if(d!==t.due){t.due=d;ch=1}}});if(ch)save()}

/* ---------------- To-do: mic button + "Your day" line ---------------- */
function dayCard(){const k=VPD||today(),items=busy(k).filter(x=>!x.sal),sl=salFor(k),n=NOW(),nm=n.getHours()*60+n.getMinutes(),isT=k===today();
 const rows=SK.map(s=>({a:sl[s],sal:s})).concat(items).sort((x,y)=>x.a-y.a);
 return `<div class="vp-card"><div class="vp-ch"><b>${X('Your day','يومك')}</b><div class="vp-seg">${[today(),addD(today(),1)].map(d=>`<button data-vd="${d}" class="${d===k?'on':''}">${esc(dayLabel(d))}</button>`).join('')}</div></div>
  ${(function(){const a0=Math.min(toM(VP.ws),sl.fajr)-15,b0=Math.max(toM(VP.we),sl.isha+30),W=b0-a0,P=m=>((Math.max(a0,Math.min(b0,m))-a0)/W*100).toFixed(2)+'%';
   return `<div class="vp-hz sm">${items.map(x=>`<i class="vp-new c-${catOf(x.t)}" style="inset-inline-start:${P(x.a)};width:max(5px,calc(${P(x.b)} - ${P(x.a)}))"></i>`).join('')}${SK.map(s=>`<span class="vp-sm" style="inset-inline-start:${P(sl[s])}"></span>`).join('')}${isT&&nm>a0&&nm<b0?`<span class="vp-now" style="inset-inline-start:${P(nm)}"></span>`:''}</div>`})()}
  ${items.length?`<div class="vp-lg">${[...new Set(items.map(x=>catOf(x.t)))].map(c=>`<span class="c-${c}"><i></i>${X(CATN[c][0],CATN[c][1])}</span>`).join('')}<span class="c-sal"><i></i>${X('Salah','الصلاة')}</span></div><div class="vp-ag">${rows.map(r=>r.sal?`<p class="vp-as">${esc(salName(r.sal))}<span>${fm(r.a)}</span></p>`:`<p class="vp-ai c-${catOf(r.t)}${isT&&r.b<=nm?' past':''}"><span class="vp-at">${fm(r.a)}</span><b dir="auto">${esc(r.t)}</b>${r.sch?`<em>${X('weekly','أسبوعي')}</em>`:''}</p>`).join('')}</div>`
   :`<p class="vp-emp">${X('Nothing timed yet. Talk it out and I’ll place it around salah.','لا شيء بوقت بعد. تكلّم وأنا أرتّبه حول الصلاة.')}</p>`}
  <button class="vp-talk" id="vpOpen">${IC('microphone',19)}<span>${X('Say it, I’ll fit it','قلها، وأنا أرتّبها')}</span></button></div>`}
let VPD=null;
function tint(){const byId={};S.tasks.concat(S.done||[]).forEach(t=>{byId[t.id]=catOf(t.t)});
 $$('#tList [data-tk],#tDone [data-tk]').forEach(b=>{const c=byId[+b.dataset.tk],r=b.closest('.tr');if(r){r.className=r.className.replace(/\s*vc-\S+/g,'');if(c)r.className+=' vc-'+c}})}
function mount(){const td=$('s-todo');if(!td)return;roll();try{tint()}catch(e){}
 const qa=$('qa');if(qa&&!$('vpQ')){qa.insertAdjacentHTML('beforeend',`<button type="button" class="vp-q" id="vpQ" aria-label="${X('Talk it out','تكلّم')}">${IC('microphone',22)}</button>`);$('vpQ').onclick=()=>openVoice()}
 let box=$('vpBox');if(!box){(qa||td.firstElementChild).insertAdjacentHTML('afterend','<div id="vpBox"></div>');box=$('vpBox')}
 box.innerHTML=dayCard();$('vpOpen').onclick=()=>openVoice();$$('#vpBox [data-vd]').forEach(b=>b.onclick=()=>{VPD=b.dataset.vd;mount()})}
if(typeof R!=='undefined'&&R.todo){const _t=R.todo;R.todo=function(){const r=_t.apply(this,arguments);try{mount()}catch(e){console.error(e)}return r}}
try{mount()}catch(e){}
/* Calendar: colour dots on days that have plans, and that day's plan under the salah row */
function calPaint(){const cd=$('cDays');if(!cd)return;
 $$('#cDays [data-cd]').forEach(b=>{const k=b.dataset.cd,l=busy(k).filter(x=>!x.sal);const old=b.querySelector('.vp-cdots');if(old)old.remove();
  if(l.length)b.insertAdjacentHTML('beforeend',`<span class="vp-cdots">${[...new Set(l.map(x=>catOf(x.t)))].slice(0,3).map(c=>`<em class="c-${c}"></em>`).join('')}</span>`)});
 const k=typeof cSel==='string'?cSel:null,box=$('cDay');if(!k||!box)return;const l=busy(k).filter(x=>!x.sal),any=S.tasks.filter(t=>t.dt===k&&t.s==null);
 const old=$('vpCalD');if(old)old.remove();
 box.insertAdjacentHTML('beforeend',`<div id="vpCalD" class="vp-cald">${l.length||any.length?`<div class="vp-ag">${l.map(r=>`<p class="vp-ai c-${catOf(r.t)}"><span class="vp-at">${fm(r.a)}</span><b dir="auto">${esc(r.t)}</b>${r.sch?`<em>${X('weekly','أسبوعي')}</em>`:''}</p>`).join('')}${any.map(t=>`<p class="vp-ai c-${catOf(t.t)}"><span class="vp-at">${X('Any time','أي وقت')}</span><b dir="auto">${esc(t.t)}</b></p>`).join('')}</div>`:''}
  <button class="vp-talk sm" id="vpCalT">${IC('microphone',17)}<span>${X('Plan this day','خطّط لهذا اليوم')}</span></button></div>`);
 $('vpCalT').onclick=()=>{const d=dOf(k),t=today();TXT='';openVoice(k===t?'':(k===addD(t,1)?'Tomorrow ':'On '+d.toLocaleDateString('en-US',{month:'long',day:'numeric'})+' '))}}
if(typeof R!=='undefined'&&R.cal){const _c=R.cal;R.cal=function(){const r=_c.apply(this,arguments);try{calPaint()}catch(e){console.error(e)}return r}}

/* open from a link: ?x=voice or #voice */
if(/[?&]x=voice\b/.test(location.search)||location.hash==='#voice')setTimeout(()=>{try{go('todo')}catch(e){}openVoice()},500);
window.FQV={plan,parse,split,openVoice,busy,salFor};
})();
