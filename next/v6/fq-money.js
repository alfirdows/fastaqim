/* Fastaqim Money: budget, savings first, receipts for taxes, gentle alerts and advice (24 Nov 2026)  (c) Fastaqim, all rights reserved.
   - Start with saving: goals with no limits on amount or number; every time money comes in, Fastaqim offers to put the saving aside first.
   - Money in (what, when, from where), spending (what, where, how much, kind), repeats (weekly, every 2 weeks, monthly, yearly).
   - The math is done for you: in, saved, spent, left, a safe amount per day, and each kind against its budget.
   - Receipt photos stay on this phone (IndexedDB), never on a shared server. The Tax pack downloads them with a spreadsheet (.zip).
   - Alerts and advice are plain rules from reputable personal-finance guidance; nothing interest-based (riba) is ever suggested.
   Data: S.money (synced to the person's own account with the rest of their state). Receipt images: IndexedDB "fq-money".
   Uses the page's globals: $, $$, T, L, LI, LX, S, save, go, R, TABOF, openSheet, closeSheet, XB, toast, undoToast, vib, esc, AR, dkey, NOW, ciBurst. */
(function(){'use strict';
const X=(en,ar,om,so)=>L==='ar'?ar:(LI===0&&om)?om:(LI===1&&so)?so:(LI>=0&&typeof DICT==='object'&&DICT[en])?DICT[en][LI]:en;
const IC=(n,s)=>`<i class="ph ph-${n}"${s?` style="font-size:${s}px"`:''}></i>`;
const pad=n=>String(n).padStart(2,'0');
const dOf=k=>new Date(k+'T12:00:00');
const addD=(k,n)=>{const d=dOf(k);d.setDate(d.getDate()+n);return dkey(d)};
const today=()=>dkey(NOW());
const loc=()=>L==='ar'?'ar-EG-u-nu-latn':(typeof LX==='string'&&LX!=='en'?LX:'en-US');
const fmt=(k,o)=>{try{return dOf(k).toLocaleDateString(loc(),o)}catch(e){return dOf(k).toLocaleDateString('en-US',o)}};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const mkey=k=>k.slice(0,7);

/* ---------------- data ---------------- */
const M=()=>{S.money=S.money||{};const m=S.money;m.cur=m.cur||guessCur();m.tx=m.tx||[];m.rec=m.rec||[];m.goals=m.goals||[];m.bud=m.bud||{};m.pct=m.pct==null?null:m.pct;m.seen=m.seen||{};return m};
function guessCur(){try{const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';const r={'Africa/Addis_Ababa':'ETB','Africa/Nairobi':'KES','Africa/Mogadishu':'SOS','Asia/Riyadh':'SAR','Asia/Dubai':'AED','Africa/Cairo':'EGP','Europe/London':'GBP','America/Toronto':'CAD','Asia/Karachi':'PKR','Asia/Kolkata':'INR','Asia/Kuala_Lumpur':'MYR','Asia/Jakarta':'IDR','Europe/Istanbul':'TRY','Australia/Sydney':'AUD'};if(r[tz])return r[tz];if(/^Europe\//.test(tz)&&!/London|Istanbul|Moscow/.test(tz))return 'EUR'}catch(e){}return 'USD'}
const CURS=['USD','CAD','GBP','EUR','AUD','SAR','AED','QAR','KWD','EGP','ETB','KES','SOS','DJF','NGN','ZAR','TRY','PKR','INR','BDT','MYR','IDR'];
function money(c,o){o=o||{};const cur=M().cur,v=c/100;let s;try{s=new Intl.NumberFormat(loc(),{style:'currency',currency:cur,minimumFractionDigits:o.whole||Number.isInteger(v)?0:2,maximumFractionDigits:o.whole?0:2}).format(v)}catch(e){s=cur+' '+v.toFixed(2)}return o.sign&&c>0?'+'+s:s}
const parseAmt=v=>{v=String(v||'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^\d.,]/g,'');if(/,\d{1,2}$/.test(v)&&!/\./.test(v))v=v.replace(',','.');v=v.replace(/,/g,'');const n=parseFloat(v);return isFinite(n)&&n>0?Math.round(n*100):0};

const OUTC=[['home','house','Home & rent','السكن والإيجار'],['bills','lightning','Bills','الفواتير'],['food','shopping-cart','Groceries','البقالة'],['eat','fork-knife','Eating out','الأكل خارج البيت'],['move','car','Transport','المواصلات'],['phone','device-mobile','Phone & internet','الهاتف والإنترنت'],['health','heartbeat','Health','الصحة'],['family','gift','Family & gifts','الأسرة والهدايا'],['edu','graduation-cap','Education','التعليم'],['clothes','t-shirt','Clothes','الملابس'],['give','heart-straight','Giving (sadaqah)','الصدقة والعطاء'],['biz','briefcase','Business costs','مصاريف العمل'],['debt','credit-card','Paying back debt','سداد الديون'],['fun','ticket','Outings & trips','النزهات والسفر'],['other','dots-three','Other','أخرى']];
const INC=[['pay','wallet','Salary or wages','الراتب أو الأجر'],['bizin','storefront','Business income','دخل العمل الخاص'],['gift','gift','Gift','هدية'],['help','heart-straight','Support or benefits','دعم أو إعانة'],['back','arrows-clockwise','Refund','استرداد'],['oth','dots-three','Other','أخرى']];
const GOALS=[['emerg','shield-check','Emergency fund','صندوق الطوارئ'],['hajj','house-line','Hajj or Umrah','الحج أو العمرة'],['home','house','Home','منزل'],['car','car','Car','سيارة'],['nikah','gift','Nikah','الزواج'],['edu','graduation-cap','Education','التعليم'],['give','heart-straight','Sadaqah jar','صندوق الصدقة'],['zakat','scales','Zakat set-aside','مدّخر الزكاة'],['own','target','My own goal','هدفي الخاص']];
const catInfo=(k,c)=>(k==='in'?INC:OUTC).find(x=>x[0]===c)||(k==='in'?INC[5]:OUTC[14]);
const catName=(k,c)=>{const i=catInfo(k,c);return X(i[2],i[3])};
const TAXC=['biz','give','health','edu','bizin'];
const REP=[['',X('Once','مرة واحدة','Al tokko','Hal mar')],['w',X('Weekly','أسبوعيًا','Torbaniin','Toddobaadle')],['2w',X('Every 2 weeks','كل أسبوعين','Torban 2 tokkotti','2 toddobaad kasta')],['m',X('Monthly','شهريًا','Ji\'aan','Bil kasta')],['y',X('Yearly','سنويًا','Waggaan','Sanad kasta')]];

/* recurring: the dates a rule falls on between a and b (keys) */
function occ(r,a,b){const out=[];let d=dOf(r.start),i=0;const B=dOf(b),A=dOf(a),day=dOf(r.start).getDate();
 while(d<=B&&i<2000){if(d>=A)out.push(dkey(d));i++;
  if(r.rep==='w')d.setDate(d.getDate()+7);else if(r.rep==='2w')d.setDate(d.getDate()+14);
  else if(r.rep==='m'){const n=new Date(dOf(r.start));n.setDate(1);n.setMonth(n.getMonth()+i);const last=new Date(n.getFullYear(),n.getMonth()+1,0).getDate();n.setDate(Math.min(day,last));d=n}
  else if(r.rep==='y'){const n=new Date(dOf(r.start));n.setFullYear(n.getFullYear()+i);d=n}else break}
 return out}
const isDone=(r,k)=>M().tx.some(t=>t.rid===r.id&&t.occ===k)||(r.skip||[]).includes(k);
/* unpaid repeats from 31 days ago up to `ahead` days ahead */
function upcoming(ahead){const m=M(),t=today(),a=addD(t,-31),b=addD(t,ahead==null?30:ahead),out=[];
 m.rec.forEach(r=>{if(r.end&&r.end<t)return;occ(r,a,b).forEach(k=>{if(k>=r.start&&!isDone(r,k))out.push({r,k,late:k<t})})});return out.sort((x,y)=>x.k<y.k?-1:1)}

/* ---------------- month math ---------------- */
function monthOf(mk){const m=M(),tx=m.tx.filter(t=>mkey(t.dt)===mk);
 const sum=(f)=>tx.filter(f).reduce((s,t)=>s+t.amt,0);
 const inn=sum(t=>t.k==='in'),out=sum(t=>t.k==='out'),sv=sum(t=>t.k==='save')-sum(t=>t.k==='take');
 const byCat={};tx.filter(t=>t.k==='out').forEach(t=>{byCat[t.cat]=(byCat[t.cat]||0)+t.amt});
 return {tx,inn,out,sv,left:inn-sv-out,byCat}}
function goalSaved(g){return M().tx.filter(t=>t.goal===g.id).reduce((s,t)=>s+(t.k==='save'?t.amt:t.k==='take'?-t.amt:0),0)}
function avgOut(){const t=dOf(today());let s=0,n=0;for(let i=1;i<=3;i++){const d=new Date(t.getFullYear(),t.getMonth()-i,15);const mo=monthOf(dkey(d).slice(0,7));if(mo.out){s+=mo.out;n++}}
 if(!n){const c=monthOf(today().slice(0,7));const day=t.getDate();return c.out?Math.round(c.out/day*30):0}return Math.round(s/n)}
function daysLeft(mk){const t=today();if(mkey(t)!==mk)return 0;const d=dOf(t),last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();return last-d.getDate()+1}

/* ---------------- receipts: on this phone only ---------------- */
const DB={p:null,open(){if(this.p)return this.p;this.p=new Promise((ok,no)=>{try{const r=indexedDB.open('fq-money',1);r.onupgradeneeded=()=>{r.result.createObjectStore('rc')};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)}catch(e){no(e)}});return this.p},
 async put(id,v){const d=await this.open();return new Promise((ok,no)=>{const t=d.transaction('rc','readwrite');t.objectStore('rc').put(v,id);t.oncomplete=()=>ok();t.onerror=()=>no(t.error)})},
 async get(id){const d=await this.open();return new Promise((ok,no)=>{const t=d.transaction('rc');const q=t.objectStore('rc').get(id);q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)})},
 async del(id){const d=await this.open();return new Promise(ok=>{const t=d.transaction('rc','readwrite');t.objectStore('rc').delete(id);t.oncomplete=()=>ok();t.onerror=()=>ok()})}};
function shrink(file,max,q){return new Promise((ok,no)=>{const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{let w=im.naturalWidth,h=im.naturalHeight;const s=Math.min(1,max/Math.max(w,h));w=Math.round(w*s);h=Math.round(h*s);
  const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(im,0,0,w,h);URL.revokeObjectURL(u);c.toBlob(b=>b?ok(b):no(new Error('blob')),'image/jpeg',q)};im.onerror=()=>{URL.revokeObjectURL(u);no(new Error('img'))};im.src=u})}
async function saveReceipt(file){const big=await shrink(file,1800,.82),th=await shrink(file,220,.7),id='r'+uid();await DB.put(id,{img:big,th,at:Date.now(),name:file.name||''});
 try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}return id}
const thumbs={};
async function paintThumbs(root){for(const el of $$('[data-rth]',root||document)){const id=el.dataset.rth;try{if(!thumbs[id]){const v=await DB.get(id);if(!v){el.classList.add('gone');continue}thumbs[id]=URL.createObjectURL(v.th||v.img)}el.style.backgroundImage=`url("${thumbs[id]}")`}catch(e){}}}

/* ---------------- tiny zip (stored, no compression) for the Tax pack ---------------- */
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0}return b=>{let c=0xffffffff;for(let i=0;i<b.length;i++)c=t[(c^b[i])&255]^(c>>>8);return(c^0xffffffff)>>>0}})();
function zip(files){const enc=new TextEncoder(),parts=[],cen=[];let off=0;const now=new Date(),dt=((now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1)),dd=(((now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate());
 files.forEach(f=>{const nm=enc.encode(f.name),data=f.data,crc=CRC(data),h=new DataView(new ArrayBuffer(30));
  h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(8,0,true);h.setUint16(10,dt,true);h.setUint16(12,dd,true);h.setUint32(14,crc,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,nm.length,true);h.setUint16(28,0,true);
  parts.push(new Uint8Array(h.buffer),nm,data);const c=new DataView(new ArrayBuffer(46));
  c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(10,0,true);c.setUint16(12,dt,true);c.setUint16(14,dd,true);c.setUint32(16,crc,true);c.setUint32(20,data.length,true);c.setUint32(24,data.length,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);
  cen.push(new Uint8Array(c.buffer),nm);off+=30+nm.length+data.length});
 const cs=cen.reduce((s,a)=>s+a.length,0),e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);
 return new Blob([...parts,...cen,new Uint8Array(e.buffer)],{type:'application/zip'})}
const csvq=v=>{v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
const safe=s=>String(s||'').replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'').slice(0,30)||'receipt';
async function taxPack(year,onlyTax){const m=M(),list=m.tx.filter(t=>t.dt.slice(0,4)===String(year)&&(!onlyTax||t.tax)).sort((a,b)=>a.dt<b.dt?-1:1),files=[],enc=new TextEncoder();
 const rows=[['Date','Type','What','Where / from','Kind','Amount','Currency','For taxes','Receipt file','Note']];
 for(const t of list){let fn='';if(t.rc){try{const v=await DB.get(t.rc);if(v){fn=`receipts/${t.dt}_${safe(t.src||t.t)}_${t.rc.slice(-4)}.jpg`;files.push({name:fn,data:new Uint8Array(await v.img.arrayBuffer())})}}catch(e){}}
  rows.push([t.dt,{in:'Money in',out:'Spent',save:'Saved',take:'Taken from savings'}[t.k],t.t,t.src||'',t.k==='in'||t.k==='out'?catInfo(t.k,t.cat)[2]:(m.goals.find(g=>g.id===t.goal)||{}).t||'',(t.amt/100).toFixed(2),m.cur,t.tax?'Yes':'',fn,t.note||''])}
 const tot={};list.filter(t=>t.k==='out').forEach(t=>{const n=catInfo('out',t.cat)[2];tot[n]=(tot[n]||0)+t.amt});
 rows.push([],['Totals spent by kind'],...Object.entries(tot).map(([k,v])=>['',k,'','','',(v/100).toFixed(2),m.cur]));
 files.unshift({name:`Fastaqim-money-${year}.csv`,data:enc.encode('﻿'+rows.map(r=>r.map(csvq).join(',')).join('\r\n'))});
 files.push({name:'README.txt',data:enc.encode(`Fastaqim money ${year}\r\nMade ${new Date().toLocaleString()}\r\nOpen the .csv in Numbers, Excel or Google Sheets. Receipt photos are in the receipts folder, named by date and place.\r\nKeep this file somewhere safe (Files, iCloud Drive or email it to yourself). Ask a tax professional what you can claim where you live.\r\n`)});
 return {blob:zip(files),n:list.length,r:files.length-2}}
async function deliver(blob,name){const f=new File([blob],name,{type:blob.type});
 try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:name});return true}}catch(e){if(e&&e.name==='AbortError')return false}
 const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);return true}

/* ---------------- alerts + advice (plain rules) ---------------- */
function alerts(mk){const m=M(),mo=monthOf(mk),out=[],t=today(),dl=daysLeft(mk);if(mkey(t)!==mk)return out;
 upcoming(2).forEach(u=>{if(u.r.k!=='out'&&u.r.k!=='in')return;const when=u.late?X('was due','كان مستحقًا')+' '+fmt(u.k,{day:'numeric',month:'short'}):u.k===t?X('due today','مستحق اليوم'):u.k===addD(t,1)?X('due tomorrow','مستحق غدًا'):X('due','مستحق')+' '+fmt(u.k,{weekday:'long'});
  out.push({ic:u.r.k==='in'?'arrow-down-left':'calendar-check',tx:`${esc(u.r.t)} · ${money(u.r.amt)} · ${when}`,key:u.r.id+'|'+u.k,due:1})});
 Object.entries(m.bud).forEach(([c,b])=>{if(!b)return;const s=mo.byCat[c]||0,p=s/b;
  if(p>=1)out.push({ic:'warning-circle',lv:'over',tx:X(`${catName('out',c)} is ${money(s-b)} over its budget. No stress: lower another kind a little, or move money over.`,`${catName('out',c)} تجاوز ميزانيته بـ ${money(s-b)}. لا بأس: خفّف نوعًا آخر قليلًا، أو انقل مالًا إليه.`)});
  else if(p>=.8)out.push({ic:'info',lv:'near',tx:X(`${catName('out',c)}: ${Math.round(p*100)}% used, ${money(b-s)} left for ${dl} day${dl===1?'':'s'}.`,`${catName('out',c)}: استُخدم ${AR(Math.round(p*100))}٪، بقي ${money(b-s)} لـ ${AR(dl)} يوم.`)})});
 if(mo.inn&&mo.out+mo.sv>mo.inn)out.push({ic:'warning-circle',lv:'over',tx:X('This month, spending and saving are more than the money in. Look at the biggest kind below first.','هذا الشهر، الإنفاق والادخار أكثر من الدخل. ابدأ بأكبر نوع في الأسفل.')});
 return out}
const SRC={cfpb:['Consumer Financial Protection Bureau (US): emergency fund guide','https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/'],
 cfpbb:['Consumer Financial Protection Bureau (US): budgeting tools','https://www.consumerfinance.gov/consumer-tools/'],
 irs:['IRS (US): how long to keep records','https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records'],
 q275:["Qur'an, Surah Al-Baqarah 2:275",'https://quran.com/2/275'],q2567:["Qur'an, Surah Al-Furqan 25:67",'https://quran.com/25/67'],q1729:["Qur'an, Surah Al-Isra 17:29",'https://quran.com/17/29'],
 m2588:['Sahih Muslim 2588','https://sunnah.com/muslim:2588']};
function advice(mk){const m=M(),mo=monthOf(mk),out=[],av=avgOut(),em=m.goals.find(g=>g.kind==='emerg'),tips=[];
 if(!m.goals.length)tips.push({ic:'shield-check',b:X('Start with an emergency fund','ابدأ بصندوق للطوارئ'),tx:X('Before anything else, build a small cushion for surprises. First aim: one month of spending. Then grow it to 3 to 6 months.','قبل أي شيء، كوّن احتياطًا صغيرًا للمفاجآت. الهدف الأول: إنفاق شهر واحد. ثم نمّه إلى ٣ إلى ٦ أشهر.'),s:['cfpb'],go:'goal'});
 else if(em&&av){const have=goalSaved(em);if(have<av)tips.push({ic:'shield-check',b:X('Emergency fund: first month','صندوق الطوارئ: الشهر الأول'),tx:X(`You spend about ${money(av,{whole:1})} a month. ${money(av-have,{whole:1})} more and your first month is covered.`,`تنفق تقريبًا ${money(av,{whole:1})} شهريًا. بقي ${money(av-have,{whole:1})} ليغطي الشهر الأول.`),s:['cfpb']});
  else if(have<av*3)tips.push({ic:'shield-check',b:X('Emergency fund: keep growing','صندوق الطوارئ: استمر'),tx:X(`One month is covered. Next step: 3 months (${money(av*3,{whole:1})}).`,`غطّيت شهرًا. الخطوة التالية: ٣ أشهر (${money(av*3,{whole:1})}).`),s:['cfpb']})}
 if(m.pct==null)tips.push({ic:'percent',b:X('Pay yourself first','ادفع لنفسك أولًا'),tx:X('Choose a share of every income to save the moment it arrives, before spending. Many people start with 10%. Any amount is a good start.','اختر نسبة من كل دخل تدّخرها فور وصوله، قبل الإنفاق. كثيرون يبدؤون بـ ١٠٪. أي مقدار بداية جيدة.'),s:['cfpbb'],go:'pct'});
 else if(mo.inn&&mo.sv<mo.inn*m.pct/100)tips.push({ic:'percent',b:X('Your saving share','نسبة ادخارك'),tx:X(`Your plan is ${m.pct}% (${money(Math.round(mo.inn*m.pct/100))} this month). Saved so far: ${money(Math.max(0,mo.sv))}.`,`خطتك ${AR(m.pct)}٪ (${money(Math.round(mo.inn*m.pct/100))} هذا الشهر). ادّخرت حتى الآن: ${money(Math.max(0,mo.sv))}.`),s:['cfpbb']});
 const subs=m.rec.filter(r=>r.k==='out'&&(r.rep==='m'||r.rep==='y')&&!['home','bills','debt'].includes(r.cat));
 if(subs.length>=2){const t=subs.reduce((s,r)=>s+(r.rep==='y'?Math.round(r.amt/12):r.amt),0);tips.push({ic:'arrows-clockwise',b:X('Check your repeating costs','راجع المصاريف المتكررة'),tx:X(`${subs.length} repeating costs add up to about ${money(t,{whole:1})} a month. Cancel any you have not used in the last month.`,`${AR(subs.length)} مصاريف متكررة مجموعها تقريبًا ${money(t,{whole:1})} شهريًا. ألغِ ما لم تستخدمه في الشهر الماضي.`),s:['cfpbb']})}
 if(mo.out){const eat=mo.byCat.eat||0;if(eat>mo.out*.15)tips.push({ic:'fork-knife',b:X('Eating out is a big part','الأكل خارج البيت جزء كبير'),tx:X(`${Math.round(eat/mo.out*100)}% of spending this month. Planning a few home meals for the week usually lowers it the fastest.`,`${AR(Math.round(eat/mo.out*100))}٪ من الإنفاق هذا الشهر. تخطيط بضع وجبات في البيت للأسبوع يخفّضه غالبًا أسرع.`),s:['cfpbb']})
  const small=mo.tx.filter(t=>t.k==='out'&&t.amt<1500&&!['bills','home','debt'].includes(t.cat));if(small.length>=12)tips.push({ic:'clock',b:X('Small buys add up','المشتريات الصغيرة تتجمّع'),tx:X(`${small.length} small buys came to ${money(small.reduce((s,t)=>s+t.amt,0))}. For wants, wait 24 hours before buying.`,`${AR(small.length)} مشتريات صغيرة بلغت ${money(small.reduce((s,t)=>s+t.amt,0))}. للكماليات، انتظر ٢٤ ساعة قبل الشراء.`),s:['cfpbb']})}
 if((mo.byCat.debt||0)>0||m.tx.some(t=>t.cat==='debt'))tips.push({ic:'credit-card',b:X('Clear debts, avoid interest','سدّد الديون وتجنّب الربا'),tx:X('Pay debts on time, the most expensive first, and avoid new interest-based loans and cards. Allah permitted trade and forbade riba.','سدّد ديونك في وقتها، الأغلى أولًا، وتجنّب القروض والبطاقات الربوية. أحلّ الله البيع وحرّم الربا.'),s:['q275','cfpbb']});
 if(m.biz||mo.byCat.biz||m.tx.some(t=>t.cat==='bizin'))tips.push({ic:'briefcase',b:X('Business money','مال العمل الخاص'),tx:X('Keep business money apart from personal, snap every receipt, and set aside part of each profit for tax. A tax professional can tell you how much.','افصل مال العمل عن مالك الشخصي، وصوّر كل إيصال، وخصّص جزءًا من كل ربح للضريبة. المختص الضريبي يحدد المقدار.'),s:['irs']});
 tips.push({ic:'scales',b:X('The middle way','الاعتدال'),tx:X('"Those who, when they spend, are neither wasteful nor stingy, but in between." Spend on needs, save steadily, give regularly.','﴿وَالَّذِينَ إِذَا أَنفَقُوا لَمْ يُسْرِفُوا وَلَمْ يَقْتُرُوا وَكَانَ بَيْنَ ذَٰلِكَ قَوَامًا﴾ أنفق على حاجتك، وادّخر بانتظام، وتصدّق دائمًا.'),s:['q2567','q1729']});
 tips.push({ic:'heart-straight',b:X('Giving never makes you poorer','الصدقة لا تنقص المال'),tx:X('The Prophet ﷺ said: "Charity does not decrease wealth." A small regular amount counts.','قال النبي ﷺ: «ما نقصت صدقة من مال». القليل الدائم يكفي.'),s:['m2588']});
 tips.push({ic:'receipt',b:X('Keep receipts for taxes','احتفظ بالإيصالات للضرائب'),tx:X('Snap receipts for work costs, giving and health. Records are usually kept for at least 3 years. Download your Tax pack each year.','صوّر إيصالات مصاريف العمل والصدقة والصحة. تُحفظ السجلات عادةً ٣ سنوات على الأقل. نزّل ملف الضرائب كل سنة.'),s:['irs']});
 return tips}

/* ---------------- screen ---------------- */
TABOF.money='more';
const lastScr=$$('.scr');lastScr[lastScr.length-1].insertAdjacentHTML('afterend',`<section class="scr" id="s-money">
 <div class="hd sub"><button class="ib" data-back aria-label="${X('Back','رجوع')}"><i class="ph ph-caret-left flip"></i></button><h1>${X('Money','المال','Maallaqa','Lacagta')}</h1><button class="ib" id="mnSet" aria-label="${X('Settings','الإعدادات')}">${IC('gear-six',21)}</button></div>
 <div id="mnB"></div></section>`);
let MK=today().slice(0,7),FIL='all';
const KIND={out:['arrow-up-right',X('Spent','صرفت','Baasii','Kharash')],in:['arrow-down-left',X('Money in','دخل','Galii','Dakhli')],save:['vault',X('Put aside','ادّخرت','Kuusi','Kayd')],take:['arrow-circle-up',X('Used savings','من المدّخرات','Kuusaa fayyadame','Kaydka laga qaatay')]};
function monthTitle(mk){const d=dOf(mk+'-15');return d.toLocaleDateString(loc(),{month:'long',year:'numeric'})}
R.money=function(){const m=M(),mo=monthOf(MK),isNow=MK===today().slice(0,7),dl=daysLeft(MK),upL=isNow?upcoming(31).filter(u=>mkey(u.k)===MK&&!u.late):[],up=upL.filter(u=>u.r.k==='out').reduce((s,u)=>s+u.r.amt,0),upIn=upL.filter(u=>u.r.k==='in').reduce((s,u)=>s+u.r.amt,0);
 const per=isNow&&dl&&mo.inn?Math.max(0,Math.floor((mo.left-up+upIn)/dl)):null,al=alerts(MK),tips=advice(MK);
 const W=Math.max(mo.inn,mo.sv+mo.out,1),pc=v=>Math.max(0,Math.min(100,v/W*100)).toFixed(1)+'%';
 const list=mo.tx.filter(t=>FIL==='all'||(FIL==='rc'?t.rc:FIL==='tax'?t.tax:FIL==='save'?(t.k==='save'||t.k==='take'):t.k===FIL)).sort((a,b)=>a.dt<b.dt?1:a.dt>b.dt?-1:b.at-a.at);
 const days=[...new Set(list.map(t=>t.dt))];
 const yr=MK.slice(0,4),yTx=m.tx.filter(t=>t.dt.slice(0,4)===yr),yR=yTx.filter(t=>t.rc).length,yTax=yTx.filter(t=>t.tax&&t.k==='out').reduce((s,t)=>s+t.amt,0);
 $('mnB').innerHTML=`
 <div class="mn-mo"><button class="ib" id="mnPrev" aria-label="${X('Previous month','الشهر السابق')}">${IC('caret-left flip')}</button><b>${monthTitle(MK)}</b><button class="ib" id="mnNext" aria-label="${X('Next month','الشهر التالي')}" ${isNow?'disabled':''}>${IC('caret-right flip')}</button></div>
 ${!m.goals.length&&!m.tx.length?startCard():''}
 <div class="mn-hero">
  <small>${mo.inn?X('Left to spend','المتبقي للإنفاق','Kan baasii hafe','Inta harsan'):X('Spent this month','أنفقت هذا الشهر','Ji\'a kana baasame','Bishan la kharashay')}</small>
  <b class="mn-big ${mo.inn&&mo.left<0?'neg':''}">${mo.inn?money(mo.left):money(mo.out)}</b>
  ${per!=null?`<p class="mn-per">${X(`About <strong>${money(per,{whole:1})}</strong> a day for the ${dl} day${dl===1?'':'s'} left`,`تقريبًا <strong>${money(per,{whole:1})}</strong> يوميًا للأيام الـ${AR(dl)} الباقية`)}${up||upIn?`<em>${X('counting what is still coming this month','مع حساب ما هو قادم هذا الشهر')}: ${up?'−'+money(up,{whole:1}):''}${up&&upIn?', ':''}${upIn?'+'+money(upIn,{whole:1}):''}</em>`:''}</p>`:!mo.inn&&isNow?`<p class="mn-per">${X('Add your money in to see what is left and a safe amount per day.','أضف دخلك لترى المتبقي ومقدارًا آمنًا لكل يوم.')}</p>`:''}
  <div class="mn-hz" aria-hidden="true"><i class="hzs" style="width:${pc(Math.max(0,mo.sv))}"></i><i class="hzp" style="width:${pc(mo.out)}"></i></div>
  <div class="mn-3"><span><small>${KIND.in[1]}</small><b>${money(mo.inn)}</b></span><span class="m3s"><small>${X('Saved first','ادّخرت أولًا','Dursa kuufame','Marka hore la kaydiyay')}</small><b>${money(Math.max(0,mo.sv))}</b></span><span class="m3p"><small>${KIND.out[1]}</small><b>${money(mo.out)}</b></span></div>
 </div>
 <div class="mn-act"><button data-add="save">${IC('vault',22)}<span>${X('Put aside','ادّخر','Kuusi','Kaydi')}</span></button><button data-add="out" class="mn-pri">${IC('minus',22)}<span>${X('Spent','صرفت','Baasii','Kharash')}</span></button><button data-add="in">${IC('plus',22)}<span>${X('Money in','دخل','Galii','Dakhli')}</span></button></div>
 ${al.length?`<div class="mn-al">${al.map(a=>`<div class="mn-ai ${a.lv||''}">${IC(a.ic,18)}<span>${a.tx}</span>${a.due?`<button data-due="${esc(a.key)}">${X('Done','تم')}</button>`:''}</div>`).join('')}</div>`:''}
 <div class="sec"><h2>${X('Savings first','الادخار أولًا','Dursa kuusuu','Kaydka marka hore')}</h2><button class="lk" id="mnGoalAdd">${IC('plus')}<span>${X('New goal','هدف جديد')}</span></button></div>
 ${m.goals.length?`<div class="mn-goals">${m.goals.map(g=>{const h=goalSaved(g),gi=GOALS.find(x=>x[0]===g.kind)||GOALS[8],p=g.target?Math.min(1,h/g.target):0,C=2*Math.PI*19;
   return `<button class="mn-g" data-goal="${g.id}"><span class="mn-ring">${g.target?`<svg viewBox="0 0 46 46"><circle cx="23" cy="23" r="19" class="rb"/><circle cx="23" cy="23" r="19" class="rf" style="stroke-dasharray:${C};stroke-dashoffset:${(C*(1-p)).toFixed(1)}"/></svg>`:''}${IC(gi[1],19)}</span><span class="mn-gt"><b dir="auto">${esc(g.t)}</b><small>${money(h)}${g.target?` ${X('of','من')} ${money(g.target,{whole:1})}`:` · ${X('no limit','بلا حد')}`}</small></span>${g.target&&h>=g.target?`<em class="mn-done">${X('Reached','تحقق')}</em>`:''}</button>`}).join('')}</div>`
  :`<button class="mn-empty" id="mnGoal0">${IC('shield-check',22)}<span><b>${X('Start your first saving goal','ابدأ أول هدف ادخار')}</b><small>${X('An emergency fund is the best first goal.','صندوق الطوارئ أفضل هدف أول.')}</small></span>${IC('caret-right flip')}</button>`}
 <p class="mn-pct">${m.pct!=null?X(`Saving plan: ${m.pct}% of every money in, put aside first.`,`خطة الادخار: ${AR(m.pct)}٪ من كل دخل، تُدّخر أولًا.`):X('No saving share yet.','لا توجد نسبة ادخار بعد.')} <button id="mnPct">${m.pct!=null?X('Change','غيّر'):X('Set one','حدّدها')}</button></p>
 <div class="sec"><h2>${X('Budget by kind','الميزانية حسب النوع','Baajata akaakuun','Miisaaniyadda nooc ahaan')}</h2><button class="lk" id="mnBud">${IC('pencil-simple')}<span>${X('Set budgets','حدّد الميزانية')}</span></button></div>
 ${budCard(mo)}
 ${isNow?comingCard():''}
 <div class="sec"><h2>${X('Advice for you','نصائح لك','Gorsa siif','Talo adiga kuu gaar ah')}</h2><button class="mn-src" id="mnSrc">${IC('check-circle',15)}<span>${X('Backed by sources','مدعومة بالمصادر')}</span></button></div>
 <div class="mn-tips">${tips.slice(0,3).map(tipHtml).join('')}${tips.length>3?`<details class="mn-more"><summary>${X('More tips','نصائح أخرى')} (${AR(tips.length-3)})</summary>${tips.slice(3).map(tipHtml).join('')}</details>`:''}</div>
 <div class="sec"><h2>${X('This month','هذا الشهر','Ji\'a kana','Bishan')}</h2></div>
 <div class="mn-fil">${[['all',X('All','الكل')],['out',KIND.out[1]],['in',KIND.in[1]],['save',X('Savings','الادخار')],['rc',X('Receipts','الإيصالات')],['tax',X('For taxes','للضرائب')]].map(([k,l])=>`<button data-fil="${k}" class="${k===FIL?'on':''}">${l}</button>`).join('')}</div>
 ${days.length?days.map(d=>`<p class="mn-dh">${d===today()?X('Today','اليوم'):fmt(d,{weekday:'long',day:'numeric',month:'short'})}</p><div class="mn-list">${list.filter(t=>t.dt===d).map(txRow).join('')}</div>`).join(''):`<p class="mn-none">${X('Nothing here yet. Tap Spent or Money in above.','لا شيء هنا بعد. اضغط صرفت أو دخل في الأعلى.')}</p>`}
 <div class="mn-tax"><div>${IC('folder-simple',22)}<span><b>${X('Receipts & taxes','الإيصالات والضرائب')} ${AR(yr)}</b><small>${X(`${yR} receipt photo${yR===1?'':'s'} · ${money(yTax)} marked for taxes`,`${AR(yR)} صورة إيصال · ${money(yTax)} للضرائب`)}</small></span></div>
  <button class="kc-big" id="mnPack">${IC('download-simple',19)} ${X('Download Tax pack','نزّل ملف الضرائب')}</button>
  <p class="mn-fine">${IC('lock-simple',14)} ${X('Receipt photos stay on this phone only. Download the Tax pack now and then to keep a copy in Files or iCloud.','صور الإيصالات تبقى على هذا الهاتف فقط. نزّل ملف الضرائب من حين لآخر لتحفظ نسخة في الملفات أو iCloud.')}</p></div>`;
 bind();paintThumbs($('mnB'))};
function tipHtml(t){return `<div class="mn-tip">${IC(t.ic,20)}<span><b>${t.b}</b><small>${t.tx}</small>${t.go?`<button data-tgo="${t.go}">${t.go==='goal'?X('Start it','ابدأه'):X('Choose my share','اختر نسبتي')}</button>`:''}</span></div>`}
function startCard(){return `<div class="mn-start"><div class="mn-sz">${IC('vault',28)}</div><b>${X('Start with saving','ابدأ بالادخار','Kuusuu irraa jalqabi','Ka bilow kaydinta')}</b><p>${X('Pick a goal, choose how much of each income to put aside first, then spend from what is left. No limits on amounts or goals.','اختر هدفًا، وحدد كم تدّخر من كل دخل أولًا، ثم أنفق مما يبقى. بلا حدود للمبالغ أو الأهداف.')}</p><button class="kc-big" id="mnStart">${X('Start','ابدأ','Jalqabi','Bilow')}</button></div>`}
function budCard(mo){const m=M(),cats=OUTC.filter(c=>m.bud[c[0]]||mo.byCat[c[0]]);if(!cats.length)return `<p class="mn-none">${X('Spending will show here by kind. Set a budget to see what is left for each.','سيظهر الإنفاق هنا حسب النوع. حدّد ميزانية لترى المتبقي لكل نوع.')}</p>`;
 return `<div class="mn-bud">${cats.sort((a,b)=>(mo.byCat[b[0]]||0)-(mo.byCat[a[0]]||0)).map(c=>{const s=mo.byCat[c[0]]||0,b=m.bud[c[0]]||0,p=b?s/b:0;
  return `<div class="mn-b ${b&&p>=1?'over':b&&p>=.8?'near':''}"><span class="mn-bi">${IC(c[1],18)}</span><span class="mn-bt"><span class="mn-bl"><b>${X(c[2],c[3])}</b><em>${money(s)}${b?` / ${money(b,{whole:1})}`:''}</em></span>${b?`<span class="mn-bar"><i style="width:${Math.min(100,p*100).toFixed(1)}%"></i></span><small>${p>=1?X(money(s-b)+' over','تجاوز '+money(s-b)):X(money(b-s)+' left','بقي '+money(b-s))}</small>`:''}</span></div>`}).join('')}</div>`}
function comingCard(){const u=upcoming(30);if(!u.length)return `<div class="sec"><h2>${X('Coming up','القادم')}</h2></div><p class="mn-none">${X('Add rent, bills or pay with Repeat, and they will show here and on your Calendar.','أضف الإيجار أو الفواتير أو الراتب مع التكرار، وستظهر هنا وفي التقويم.')}</p>`;
 return `<div class="sec"><h2>${X('Coming up','القادم')}</h2></div><div class="mn-list">${u.slice(0,8).map(x=>`<div class="mn-tx due ${x.late?'late':''}"><span class="mn-ti ${x.r.k}">${IC(catInfo(x.r.k,x.r.cat)[1],18)}</span><span class="mn-tt"><b dir="auto">${esc(x.r.t)}</b><small>${x.late?X('Was due ','كان مستحقًا '):''}${fmt(x.k,{weekday:'short',day:'numeric',month:'short'})} · ${REP.find(r=>r[0]===x.r.rep)[1]}</small></span><em class="${x.r.k}">${money(x.r.amt)}</em><button data-due="${esc(x.r.id+'|'+x.k)}">${x.r.k==='in'?X('Got it','وصل'):X('Paid','دُفع')}</button></div>`).join('')}</div>`}
function txRow(t){const m=M(),g=m.goals.find(x=>x.id===t.goal),ic=t.k==='in'||t.k==='out'?catInfo(t.k,t.cat)[1]:KIND[t.k][0],sub=t.k==='save'||t.k==='take'?(g?g.t:''):[catName(t.k,t.cat),t.src].filter(Boolean).join(' · ');
 return `<button class="mn-tx" data-tx="${t.id}"><span class="mn-ti ${t.k}">${IC(ic,18)}</span><span class="mn-tt"><b dir="auto">${esc(t.t||KIND[t.k][1])}</b><small dir="auto">${esc(sub)}${t.rid?' · '+X('repeats','متكرر'):''}${t.tax?` · <i class="mn-tg">${X('tax','ضريبة')}</i>`:''}</small></span>${t.rc?`<span class="mn-th" data-rth="${t.rc}"></span>`:''}<em class="${t.k}">${t.k==='in'?'+':t.k==='out'?'−':''}${money(t.amt)}</em></button>`}
function bind(){const b=$('mnB');
 $('mnPrev').onclick=()=>{const d=dOf(MK+'-15');d.setMonth(d.getMonth()-1);MK=dkey(d).slice(0,7);vib(6);R.money()};
 $('mnNext').onclick=()=>{const d=dOf(MK+'-15');d.setMonth(d.getMonth()+1);const k=dkey(d).slice(0,7);if(k>today().slice(0,7))return;MK=k;vib(6);R.money()};
 $$('[data-add]',b).forEach(x=>x.onclick=()=>addSheet(x.dataset.add));
 $$('[data-fil]',b).forEach(x=>x.onclick=()=>{FIL=x.dataset.fil;R.money()});
 $$('[data-tx]',b).forEach(x=>x.onclick=()=>editSheet(x.dataset.tx));
 $$('[data-goal]',b).forEach(x=>x.onclick=()=>goalSheet(x.dataset.goal));
 $$('[data-due]',b).forEach(x=>x.onclick=()=>dueSheet(x.dataset.due));
 $$('[data-tgo]',b).forEach(x=>x.onclick=()=>x.dataset.tgo==='goal'?newGoal():pctSheet());
 if($('mnStart'))$('mnStart').onclick=()=>newGoal(true);if($('mnGoal0'))$('mnGoal0').onclick=()=>newGoal();
 $('mnGoalAdd').onclick=()=>newGoal();$('mnPct').onclick=()=>pctSheet();$('mnBud').onclick=budSheet;$('mnSrc').onclick=srcSheet;
 $('mnPack').onclick=packSheet;$('mnSet').onclick=setSheet}

/* ---------------- sheets ---------------- */
const head=t=>`<div class="hd sub"><span style="width:44px"></span><h1>${t}</h1>${XB}</div>`;
function chips(list,on,attr){return `<div class="mn-chips">${list.map(c=>`<button type="button" ${attr}="${c[0]}" class="${c[0]===on?'on':''}">${IC(c[1],17)}<span>${X(c[2],c[3])}</span></button>`).join('')}</div>`}
function pick(sel,attr,cb){$$(`${sel} [${attr}]`).forEach(b=>b.onclick=()=>{$$(`${sel} [${attr}]`).forEach(x=>x.classList.toggle('on',x===b));vib(5);cb(b.getAttribute(attr))})}
function amtField(v){return `<label class="mn-amt"><span>${esc(curSym())}</span><input id="maA" inputmode="decimal" autocomplete="off" placeholder="0" value="${v?(v/100).toFixed(2).replace(/\.00$/,''):''}" aria-label="${X('Amount','المبلغ')}"></label>`}
function curSym(){try{return new Intl.NumberFormat(loc(),{style:'currency',currency:M().cur}).formatToParts(0).find(p=>p.type==='currency').value}catch(e){return M().cur}}
function addSheet(k,pre){pre=pre||{};const m=M();let cat=pre.cat||(k==='in'?'pay':'food'),goal=pre.goal||(m.goals[0]&&m.goals[0].id)||'',rep=pre.rep||'',rc=pre.rc||null,tax=pre.tax!=null?pre.tax:TAXC.includes(cat);
 if((k==='save'||k==='take')&&!m.goals.length){newGoal(true);return}
 const TT={out:X('I spent','صرفت','Nan baase','Waan kharash gareeyay'),in:X('Money in','دخل','Maallaqa gale','Lacag soo gashay'),save:X('Put aside','ادّخر','Kuusi','Kaydi'),take:X('Use savings','استخدم المدّخرات','Kuusaa fayyadami','Isticmaal kaydka')};
 openSheet(head(TT[k])+`<div class="kc-form">${amtField(pre.amt)}
  ${k==='save'||k==='take'?`<div class="kc-f"><span>${X('Goal','الهدف')}</span><div class="mn-chips" id="maG">${m.goals.map(g=>`<button type="button" data-g="${g.id}" class="${g.id===goal?'on':''}">${IC((GOALS.find(x=>x[0]===g.kind)||GOALS[8])[1],17)}<span dir="auto">${esc(g.t)}</span></button>`).join('')}</div></div>`:`
  <label class="kc-f"><span>${k==='in'?X('What is it','ما هو'):X('What did you buy','ماذا اشتريت')}</span><input id="maT" dir="auto" autocomplete="off" value="${esc(pre.t||'')}" placeholder="${k==='in'?X('e.g. November pay','مثال: راتب نوفمبر'):X('e.g. Groceries for the week','مثال: بقالة الأسبوع')}"></label>
  <label class="kc-f"><span>${k==='in'?X('From where','من أين'):X('Where','أين')} <em>${X('optional','اختياري')}</em></span><input id="maW" dir="auto" autocomplete="off" value="${esc(pre.src||'')}" placeholder="${k==='in'?X('Employer, person, shop…','جهة العمل، شخص، متجر…'):X('Shop or place','المتجر أو المكان')}"></label>
  <div class="kc-f"><span>${X('Kind','النوع')}</span>${chips(k==='in'?INC:OUTC,cat,'data-c')}</div>`}
  <div class="kc-2"><label class="kc-f"><span>${X('When','متى')}</span><input id="maD" type="date" value="${pre.dt||today()}"></label>
  <label class="kc-f" ${pre.edit?'hidden':''}><span>${X('Repeat','تكرار')}</span><select id="maR">${REP.map(r=>`<option value="${r[0]}" ${r[0]===rep?'selected':''}>${r[1]}</option>`).join('')}</select></label></div>
  ${k==='out'||k==='in'?`<div class="mn-rc" id="maRc"></div>
  <label class="mn-sw"><span><b>${X('For taxes','للضرائب')}</b><small>${X('Shows in your Tax pack','يظهر في ملف الضرائب')}</small></span><input type="checkbox" id="maX" ${tax?'checked':''}><i></i></label>`:''}
  <label class="kc-f"><span>${X('Note','ملاحظة')} <em>${X('optional','اختياري')}</em></span><input id="maN" dir="auto" autocomplete="off" value="${esc(pre.note||'')}"></label>
  <button class="kc-big" id="maGo">${X('Save','احفظ','Olkaa\'i','Kaydi')}</button></div>`);
 const rcPaint=()=>{const box=$('maRc');if(!box)return;box.innerHTML=rc?`<span class="mn-th big" data-rth="${rc}"></span><span class="mn-rct"><b>${X('Receipt saved on this phone','الإيصال محفوظ على هذا الهاتف')}</b><button type="button" id="maRx">${X('Remove','إزالة')}</button></span>`
  :`<label class="mn-rcb">${IC('camera',20)}<span>${X('Add receipt photo','أضف صورة الإيصال')}</span><input type="file" accept="image/*" id="maF" hidden></label>`;
  if(rc){paintThumbs(box);$('maRx').onclick=()=>{rc=null;rcPaint()}}else $('maF').onchange=async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;box.innerHTML=`<p class="mn-wait">${X('Saving photo…','جارٍ حفظ الصورة…')}</p>`;
   try{rc=await saveReceipt(f);vib(10)}catch(x){toast(X("Couldn't read that photo. Try another.",'تعذّرت قراءة الصورة. جرّب أخرى.'))}rcPaint()}};
 rcPaint();
 pick('#sh .mn-chips:not(#maG)','data-c',v=>{cat=v;if($('maX')&&TAXC.includes(v))$('maX').checked=true});pick('#maG','data-g',v=>goal=v);
 setTimeout(()=>{try{$('maA').focus()}catch(e){}},350);
 $('maGo').onclick=()=>{const amt=parseAmt($('maA').value);if(!amt){$('maA').focus();$('maA').closest('.mn-amt').classList.add('kc-need');return}
  const dt=$('maD').value||today(),rp=$('maR').value,t=$('maT')?$('maT').value.trim():'',src=$('maW')?$('maW').value.trim():'',note=$('maN').value.trim();
  if(typeof blocked==='function'&&(blocked(t)||blocked(note))){toast(X('Please use kind words','من فضلك استخدم كلمات طيبة'));return}
  const g=m.goals.find(x=>x.id===goal),tx={id:uid(),k,amt,dt,at:Date.now(),t:t||(k==='save'||k==='take'?(g?g.t:''):catName(k,cat))};
  if(k==='in'||k==='out'){tx.cat=cat;if(src)tx.src=src;if(rc)tx.rc=rc;if($('maX')&&$('maX').checked)tx.tax=1}else tx.goal=goal;if(note)tx.note=note;
  if(pre.edit){const o=pre.edit;['t','amt','dt','cat','src','rc','tax','note','goal'].forEach(f=>{if(tx[f]===undefined)delete o[f];else o[f]=tx[f]});save();closeSheet();vib(10);toast(X('Saved','تم الحفظ'));MK=dt.slice(0,7);R.money();return}
  if(rp){const r={id:'p'+uid(),k,t:tx.t,amt,cat:tx.cat,goal:tx.goal,src,start:dt,rep:rp};m.rec.push(r);if(dt<=today()){tx.rid=r.id;tx.occ=dt;m.tx.push(tx)}}
  else m.tx.push(tx);
  save();closeSheet();vib([12,30,12]);if(k==='save'){celebrate(g,amt)}
  undoToast(X('Saved','تم الحفظ'),()=>{m.tx=m.tx.filter(x=>x.id!==tx.id);if(rp)m.rec=m.rec.filter(x=>!(x.start===dt&&x.amt===amt&&x.t===tx.t));save();R.money()});
  MK=dt.slice(0,7)<=today().slice(0,7)?dt.slice(0,7):MK;R.money();
  if(k==='in'&&m.pct&&m.goals.length&&dt<=today())setTimeout(()=>payFirst(amt,dt),500)}}
/* Start with saving: after money comes in, offer the saving first */
function payFirst(amt,dt){const m=M(),v=Math.round(amt*m.pct/100),g=m.goals.find(x=>x.kind==='emerg')||m.goals[0];if(!v||!g)return;
 openSheet(head(X('Save first','ادّخر أولًا','Dursa kuusi','Marka hore kaydi'))+`<div class="mn-pf"><div class="mn-sz">${IC('vault',28)}</div><p>${X(`Your plan: ${m.pct}% of every income. Put <b>${money(v)}</b> into <b>${esc(g.t)}</b> now, before spending?`,`خطتك: ${AR(m.pct)}٪ من كل دخل. هل تضع <b>${money(v)}</b> في <b>${esc(g.t)}</b> الآن قبل الإنفاق؟`)}</p>
 <button class="kc-big" id="pfY">${X('Yes, put it aside','نعم، ادّخره')}</button><button class="kc-alt" id="pfO">${X('Another amount','مبلغ آخر')}</button><button class="mn-later" data-x>${X('Not now','ليس الآن')}</button></div>`);
 $('pfY').onclick=()=>{m.tx.push({id:uid(),k:'save',amt:v,dt,at:Date.now(),t:g.t,goal:g.id});save();closeSheet();celebrate(g,v);R.money()};
 $('pfO').onclick=()=>addSheet('save',{goal:g.id,amt:v,dt})}
function celebrate(g,amt){try{const el=document.createElement('div');el.className='mn-cel';el.innerHTML=`<div class="mn-celc"><span class="mn-coin">${IC('vault',34)}</span><b>${money(amt)}</b><small dir="auto">${X('put aside for','ادُّخر لـ')} ${esc(g?g.t:'')}</small>${[...Array(14)].map((_,i)=>`<i style="--a:${i*360/14}deg;--d:${(i%3)*60}ms"></i>`).join('')}</div>`;
 document.body.appendChild(el);vib([15,40,15,40,25]);setTimeout(()=>el.classList.add('out'),1500);setTimeout(()=>el.remove(),1900)}catch(e){}}
function editSheet(id){const m=M(),t=m.tx.find(x=>x.id===id);if(!t)return;
 openSheet(head(esc(t.t||KIND[t.k][1]))+`<div class="mn-ed"><p class="mn-edA ${t.k}">${t.k==='in'?'+':t.k==='out'?'−':''}${money(t.amt)}</p><p class="mn-edS">${fmt(t.dt,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}${t.src?' · '+esc(t.src):''}${t.cat?' · '+catName(t.k,t.cat):''}</p>${t.note?`<p class="mn-edS" dir="auto">${esc(t.note)}</p>`:''}
 ${t.rc?`<button class="mn-rcv" id="edR"><span class="mn-th big" data-rth="${t.rc}"></span><span>${X('Open receipt','افتح الإيصال')}</span></button>`:''}
 <div class="kc-row2"><button class="kc-alt" id="edE">${IC('pencil-simple',18)}<span>${X('Edit','عدّل')}</span></button><button class="kc-alt kc-del" id="edD">${IC('trash',18)}<span>${X('Delete','احذف')}</span></button></div>
 ${t.rid?`<button class="mn-later" id="edStop">${X('Stop repeating','أوقف التكرار')}</button>`:''}</div>`);paintThumbs($('sh'));
 if($('edR'))$('edR').onclick=()=>viewReceipt(t);
 $('edE').onclick=()=>addSheet(t.k,Object.assign({},t,{rep:'',edit:t}));
 $('edD').onclick=()=>{const i=m.tx.indexOf(t);m.tx.splice(i,1);save();closeSheet();R.money();undoToast(X('Deleted','حُذف'),()=>{m.tx.splice(i,0,t);save();R.money()});if(t.rc)setTimeout(()=>{if(!m.tx.some(x=>x.rc===t.rc))DB.del(t.rc)},6000)};
 if($('edStop'))$('edStop').onclick=()=>{const r=m.rec.find(x=>x.id===t.rid);if(r){r.end=today();save();toast(X('It will not repeat any more','لن يتكرر بعد الآن'));closeSheet();R.money()}}}
async function viewReceipt(t){let v;try{v=await DB.get(t.rc)}catch(e){}if(!v){toast(X('This receipt is not on this phone','هذا الإيصال ليس على هذا الهاتف'));return}
 const u=URL.createObjectURL(v.img);openSheet(head(X('Receipt','الإيصال'))+`<img class="mn-rimg" src="${u}" alt="${X('Receipt photo','صورة الإيصال')}"><button class="kc-big" id="rvS">${IC('share-network',19)} ${X('Save or share','احفظ أو شارك')}</button>`);
 $('rvS').onclick=()=>deliver(v.img,`receipt-${t.dt}-${safe(t.src||t.t)}.jpg`)}
function dueSheet(key){const m=M(),[rid,k]=String(key).split('|'),r=m.rec.find(x=>x.id===rid);if(!r)return;
 openSheet(head(esc(r.t))+`<div class="mn-ed"><p class="mn-edA ${r.k}">${money(r.amt)}</p><p class="mn-edS">${fmt(k,{weekday:'long',day:'numeric',month:'long'})} · ${REP.find(x=>x[0]===r.rep)[1]}</p>
 <label class="kc-f"><span>${X('Amount this time','المبلغ هذه المرة')}</span>${amtField(r.amt)}</label>
 <button class="kc-big" id="duY">${r.k==='in'?X('Got it','وصل'):X('Paid','دُفع')}</button><div class="kc-row2"><button class="kc-alt" id="duS">${X('Skip this time','تخطَّ هذه المرة')}</button><button class="kc-alt kc-del" id="duE">${X('Stop repeating','أوقف التكرار')}</button></div></div>`);
 $('duY').onclick=()=>{const amt=parseAmt($('maA').value)||r.amt,tx={id:uid(),k:r.k,amt,dt:k>today()?today():k,at:Date.now(),t:r.t,rid:r.id,occ:k};if(r.cat)tx.cat=r.cat;if(r.goal)tx.goal=r.goal;if(r.src)tx.src=r.src;if(TAXC.includes(r.cat))tx.tax=1;
  m.tx.push(tx);save();closeSheet();vib([12,30,12]);toast(X('Recorded','سُجّل'));refresh();if(r.k==='in'&&m.pct&&m.goals.length)setTimeout(()=>payFirst(amt,tx.dt),500)};
 $('duS').onclick=()=>{r.skip=r.skip||[];r.skip.push(k);save();closeSheet();refresh()};
 $('duE').onclick=()=>{r.end=addD(k,-1);save();closeSheet();toast(X('It will not repeat any more','لن يتكرر بعد الآن'));refresh()}}
function refresh(){try{if($('s-money').classList.contains('on'))R.money();if($('s-cal')&&$('s-cal').classList.contains('on'))R.cal();moreBadge()}catch(e){}}
function newGoal(first){let kind=first?'emerg':'emerg';const m=M();
 openSheet(head(first?X('Start with saving','ابدأ بالادخار'):X('New saving goal','هدف ادخار جديد'))+`<div class="kc-form">
  ${first?`<p class="mn-lead">${X('Step 1 of 2. What are you saving for? An emergency fund is the best first goal.','الخطوة ١ من ٢. لماذا تدّخر؟ صندوق الطوارئ أفضل هدف أول.')}</p>`:''}
  <div class="kc-f"><span>${X('Goal','الهدف')}</span>${chips(GOALS,kind,'data-k')}</div>
  <label class="kc-f"><span>${X('Name','الاسم')}</span><input id="ngT" dir="auto" autocomplete="off" value="${X(GOALS[0][2],GOALS[0][3])}"></label>
  <label class="kc-f"><span>${X('Target','المبلغ المستهدف')} <em>${X('optional, no limit','اختياري، بلا حد')}</em></span>${amtField(0).replace('id="maA"','id="ngA"')}</label>
  ${kind==='emerg'&&avgOut()?`<p class="mn-hint" id="ngH">${X(`Suggested first step: one month of your spending, about ${money(avgOut(),{whole:1})}.`,`خطوة أولى مقترحة: إنفاق شهر، تقريبًا ${money(avgOut(),{whole:1})}.`)}</p>`:''}
  <button class="kc-big" id="ngGo">${first?X('Next','التالي'):X('Add goal','أضف الهدف')}</button></div>`);
 pick('#sh .mn-chips','data-k',v=>{kind=v;const g=GOALS.find(x=>x[0]===v);$('ngT').value=X(g[2],g[3]);if($('ngH'))$('ngH').hidden=v!=='emerg'});
 $('ngGo').onclick=()=>{const t=$('ngT').value.trim()||X('Savings','مدّخرات');const g={id:'g'+uid(),kind,t,target:parseAmt($('ngA').value)||0};m.goals.push(g);save();vib([12,30,12]);
  if(first&&m.pct==null){pctSheet(true)}else{closeSheet();R.money()}}}
function pctSheet(first){const m=M();let p=m.pct==null?10:m.pct;
 openSheet(head(X('Your saving share','نسبة ادخارك'))+`<div class="kc-form">${first?`<p class="mn-lead">${X('Step 2 of 2. Each time money comes in, how much goes to savings first?','الخطوة ٢ من ٢. كلما جاءك مال، كم يذهب للادخار أولًا؟')}</p>`:''}
  <div class="mn-chips" id="pcC">${[5,10,15,20,25].map(v=>`<button type="button" data-p="${v}" class="${v===p?'on':''}"><span>${AR(v)}%</span></button>`).join('')}</div>
  <label class="kc-f"><span>${X('Or your own','أو نسبتك الخاصة')}</span><input id="pcI" inputmode="decimal" value="${[5,10,15,20,25].includes(p)?'':p}" placeholder="%"></label>
  <p class="mn-hint">${X('Many people start with 10%. Any amount is a good start, and you can change it any time.','كثيرون يبدؤون بـ ١٠٪. أي مقدار بداية جيدة، ويمكنك تغييره متى شئت.')}</p>
  <button class="kc-big" id="pcGo">${X('Save','احفظ')}</button>${m.pct!=null?`<button class="mn-later" id="pcOff">${X('Turn off','إيقاف')}</button>`:''}</div>`);
 pick('#pcC','data-p',v=>{p=+v;$('pcI').value=''});
 $('pcGo').onclick=()=>{const own=parseFloat(String($('pcI').value).replace(',','.'));m.pct=isFinite(own)&&own>0?Math.min(100,own):p;save();closeSheet();vib([12,30,12]);toast(X('Saving first is set','تم ضبط الادخار أولًا'));R.money()};
 if($('pcOff'))$('pcOff').onclick=()=>{m.pct=null;save();closeSheet();R.money()}}
function goalSheet(id){const m=M(),g=m.goals.find(x=>x.id===id);if(!g)return;const h=goalSaved(g);
 openSheet(head(esc(g.t))+`<div class="mn-ed"><p class="mn-edA save">${money(h)}</p><p class="mn-edS">${g.target?X(`${Math.round(h/g.target*100)}% of ${money(g.target)}`,`${AR(Math.round(h/g.target*100))}٪ من ${money(g.target)}`):X('No limit: keep going','بلا حد: استمر')}</p>
 <button class="kc-big" id="gsA">${IC('vault',19)} ${X('Put aside','ادّخر')}</button>
 <div class="kc-row2"><button class="kc-alt" id="gsT">${X('Use some','استخدم منه')}</button><button class="kc-alt" id="gsE">${X('Edit','عدّل')}</button></div><button class="mn-later kc-del" id="gsD">${X('Delete goal','احذف الهدف')}</button></div>`);
 $('gsA').onclick=()=>addSheet('save',{goal:id});$('gsT').onclick=()=>addSheet('take',{goal:id});
 $('gsE').onclick=()=>{openSheet(head(X('Edit goal','عدّل الهدف'))+`<div class="kc-form"><label class="kc-f"><span>${X('Name','الاسم')}</span><input id="geT" dir="auto" value="${esc(g.t)}"></label><label class="kc-f"><span>${X('Target','المبلغ المستهدف')} <em>${X('optional, no limit','اختياري، بلا حد')}</em></span>${amtField(g.target).replace('id="maA"','id="geA"')}</label><button class="kc-big" id="geGo">${X('Save','احفظ')}</button></div>`);
  $('geGo').onclick=()=>{g.t=$('geT').value.trim()||g.t;g.target=parseAmt($('geA').value)||0;save();closeSheet();R.money()}};
 $('gsD').onclick=()=>{const i=m.goals.indexOf(g);m.goals.splice(i,1);save();closeSheet();R.money();undoToast(X('Goal deleted. Its history stays.','حُذف الهدف. يبقى سجله.'),()=>{m.goals.splice(i,0,g);save();R.money()})}}
function budSheet(){const m=M(),av=monthOf(today().slice(0,7));
 openSheet(head(X('Budget by kind','الميزانية حسب النوع'))+`<p class="mn-lead">${X('A monthly amount for each kind. Leave empty for no budget. Fastaqim does the math and tells you gently when one is close.','مبلغ شهري لكل نوع. اتركه فارغًا لعدم التحديد. Fastaqim يحسب وينبّهك بلطف عند الاقتراب.')}</p>
 <div class="mn-bset">${OUTC.map(c=>`<label class="mn-bs">${IC(c[1],19)}<span>${X(c[2],c[3])}</span><input inputmode="decimal" data-bc="${c[0]}" placeholder="${esc(curSym())}" value="${m.bud[c[0]]?(m.bud[c[0]]/100):''}"></label>`).join('')}</div>
 <button class="kc-big" id="bsGo">${X('Save','احفظ')}</button>`);
 $('bsGo').onclick=()=>{$$('#sh [data-bc]').forEach(i=>{const v=parseAmt(i.value);if(v)m.bud[i.dataset.bc]=v;else delete m.bud[i.dataset.bc]});save();closeSheet();toast(X('Budgets saved','حُفظت الميزانية'));R.money()}}
function srcSheet(){openSheet(head(X('Where these tips come from','مصادر هذه النصائح'))+`<p class="mn-lead">${X('Advice follows trusted public guidance and the Qur\'an and Sunnah. Fastaqim never suggests interest-based (riba) products. For big decisions, ask a qualified professional and a trusted scholar.','النصائح مبنية على إرشادات عامة موثوقة وعلى القرآن والسنة. Fastaqim لا يقترح أي منتجات ربوية. في القرارات الكبيرة استشر مختصًا مؤهلًا وعالمًا موثوقًا.')}</p>
 <div class="mn-srcs">${Object.values(SRC).map(([t,u])=>`<a href="${u}" target="_blank" rel="noopener">${IC('arrow-up-right',16)}<span>${esc(t)}</span></a>`).join('')}</div>`)}
function packSheet(){const m=M(),years=[...new Set(m.tx.map(t=>t.dt.slice(0,4)))].sort().reverse();if(!years.length)years.push(today().slice(0,4));let y=years[0],only=0;
 openSheet(head(X('Tax pack','ملف الضرائب'))+`<div class="kc-form"><p class="mn-lead">${X('One .zip file with a spreadsheet of your money and all receipt photos, named by date and place. Save it to Files or iCloud Drive, or send it to your tax helper.','ملف ‎.zip‎ واحد فيه جدول بمالك وكل صور الإيصالات، مسمّاة بالتاريخ والمكان. احفظه في الملفات أو iCloud Drive أو أرسله لمن يساعدك في الضرائب.')}</p>
 <div class="kc-f"><span>${X('Year','السنة')}</span><div class="mn-chips" id="tpY">${years.map(v=>`<button type="button" data-y="${v}" class="${v===y?'on':''}"><span>${AR(v)}</span></button>`).join('')}</div></div>
 <div class="kc-f"><span>${X('Include','يشمل')}</span><div class="mn-chips" id="tpO"><button type="button" data-o="0" class="on"><span>${X('Everything','كل شيء')}</span></button><button type="button" data-o="1"><span>${X('Only marked for taxes','المعلّم للضرائب فقط')}</span></button></div></div>
 <button class="kc-big" id="tpGo">${IC('download-simple',19)} ${X('Make Tax pack','أنشئ ملف الضرائب')}</button><p class="mn-fine">${X('Fastaqim is not tax advice. Ask a tax professional what you can claim where you live.','Fastaqim ليس استشارة ضريبية. اسأل مختصًا عمّا يمكنك خصمه في بلدك.')}</p></div>`);
 pick('#tpY','data-y',v=>y=v);pick('#tpO','data-o',v=>only=+v);
 $('tpGo').onclick=async()=>{const b=$('tpGo');b.disabled=true;b.textContent=X('Making…','جارٍ الإنشاء…');try{const p=await taxPack(y,only);await deliver(p.blob,`Fastaqim-tax-pack-${y}.zip`);toast(X(`${p.n} entries, ${p.r} receipts`,`${AR(p.n)} قيود، ${AR(p.r)} إيصالات`))}catch(e){console.error(e);toast(X("Couldn't make it. Try again.",'تعذّر الإنشاء. حاول مجددًا.'))}b.disabled=false;b.innerHTML=`${IC('download-simple',19)} ${X('Make Tax pack','أنشئ ملف الضرائب')}`}}
function setSheet(){const m=M();openSheet(head(X('Money settings','إعدادات المال'))+`<div class="kc-form">
 <label class="kc-f"><span>${X('Currency','العملة')}</span><select id="stC">${[...new Set([m.cur,...CURS])].map(c=>`<option ${c===m.cur?'selected':''}>${c}</option>`).join('')}</select></label>
 <label class="mn-sw"><span><b>${X('I have a business or side work','لدي عمل خاص أو جانبي')}</b><small>${X('Adds business advice and tax reminders','يضيف نصائح العمل وتذكيرات الضرائب')}</small></span><input type="checkbox" id="stB" ${m.biz?'checked':''}><i></i></label>
 <label class="mn-sw"><span><b>${X('Show money on Calendar','أظهر المال في التقويم')}</b><small>${X('Bills and pay that repeat','الفواتير والراتب المتكررة')}</small></span><input type="checkbox" id="stK" ${m.noCal?'':'checked'}><i></i></label>
 <p class="mn-fine">${IC('lock-simple',14)} ${X('Your money notes are private. They are saved on this phone and, when you are signed in, in your own account. Receipt photos stay on this phone only.','ملاحظاتك المالية خاصة. تُحفظ على هذا الهاتف، وفي حسابك الخاص عند تسجيل الدخول. صور الإيصالات تبقى على هذا الهاتف فقط.')}</p>
 <button class="kc-big" id="stGo">${X('Save','احفظ')}</button></div>`);
 $('stGo').onclick=()=>{m.cur=$('stC').value;m.biz=$('stB').checked?1:0;m.noCal=$('stK').checked?0:1;save();closeSheet();R.money()}}

/* ---------------- Calendar + More ---------------- */
window.FQM={dueOn(k){const m=M();if(m.noCal)return [];const out=[];m.rec.forEach(r=>{if(r.k!=='in'&&r.k!=='out')return;if(r.end&&r.end<k)return;if(occ(r,k,k).length&&!isDone(r,k))out.push({t:r.t,k:r.k,amt:r.amt,amtTx:money(r.amt),key:r.id+'|'+k})});return out},dueSheet,R:()=>R.money()};
function moreBadge(){try{const n=alerts(today().slice(0,7)).length,b=$('mnMore');if(b){const e=b.querySelector('em');e.innerHTML=n?`<span class="mn-bdg">${AR(n)}</span>`:''}}catch(e){}}
try{const yp=$('yp');const row=`<div class="gl" id="mnMoreG"><button id="mnMore" data-go="money"><span class="ic c-g"><i class="ph ph-wallet"></i></span><span>${X('Money','المال','Maallaqa','Lacagta')}</span><em></em><i class="ph ph-caret-right cv flip"></i></button></div>`;
 if(yp&&!$('mnMore'))yp.insertAdjacentHTML('afterend',row);moreBadge();
 if(R.more){const _m=R.more;R.more=function(){const r=_m.apply(this,arguments);moreBadge();return r}}}catch(e){console.error(e)}
/* the older weekly Money tool (Tools / Home pin) now opens this Money screen; its spending is brought over once */
try{const m=M();if(!m.impOld&&typeof tData==='function'){const d=tData('money')||{};(d.items||[]).forEach(x=>{const amt=Math.round((+x.amt||0)*100);if(!amt)return;const at=+x.at||Date.now();m.tx.push({id:'o'+(x.id||uid()),k:'out',amt,dt:dkey(new Date(at)),at,t:String(x.t||X('Spending','مصروف')).slice(0,200),cat:'other'})});m.impOld=1;save()}}catch(e){console.error(e)}
if(typeof window.openTool==='function'){const _o=window.openTool;window.openTool=function(id){if(id==='money'){go('money');return}return _o.apply(this,arguments)}}
if(typeof window.tSub==='function'){const _s=window.tSub;window.tSub=function(id){if(id==='money'){try{const mo=monthOf(today().slice(0,7));return mo.inn?X(money(mo.left)+' left this month','متبقٍ '+money(mo.left)+' هذا الشهر'):mo.out?X(money(mo.out)+' spent this month','أنفقت '+money(mo.out)+' هذا الشهر'):X('Savings first','الادخار أولًا')}catch(e){}}return _s.apply(this,arguments)}}
try{if(R.home&&$('s-home').classList.contains('on'))R.home()}catch(e){}
/* open from a link: #money */
try{const h0=((performance.getEntriesByType('navigation')[0]||{}).name||'').split('#')[1];if(location.hash==='#money'||h0==='money')go('money',false)}catch(e){}
})();
