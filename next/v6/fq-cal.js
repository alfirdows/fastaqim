/* Fastaqim Calendar tab + one Worship tab (24 Nov 2026)  (c) Fastaqim, all rights reserved.
   - Qur'an and Dhikr share one bottom tab ("Worship") with a two-part switch at the top; the tab remembers the last part.
   - The freed tab is the Calendar: Day, Week and Month, built on the horizon language (salah are gold marks on the day line).
     It shows timed and dated to-dos, the weekly family schedule, salah, Islamic dates and sunnah fasts, and money that is due.
   - The older Hijri-month view stays one tap away ("Hijri month").
   Own file so other work on index.html never overwrites it. Loaded after fq-voice.js (uses window.FQV) and before fq-money.js.
   Uses the page's globals: $, $$, T, L, LI, LX, S, save, go, R, TABS, TABOF, renderTab, hist, openSheet, closeSheet, XB, toast,
   undoToast, vib, esc, AR, f12, dkey, SAL, NOW, hParts, hms, dzCount, star. */
(function(){'use strict';
const X=(en,ar,om,so)=>L==='ar'?ar:(LI===0&&om)?om:(LI===1&&so)?so:(LI>=0&&typeof DICT==='object'&&DICT[en])?DICT[en][LI]:en;
const pad=n=>String(n).padStart(2,'0');
const dOf=k=>new Date(k+'T12:00:00');
const addD=(k,n)=>{const d=dOf(k);d.setDate(d.getDate()+n);return dkey(d)};
const today=()=>dkey(NOW());
const loc=()=>L==='ar'?'ar-EG-u-nu-latn':(typeof LX==='string'&&LX!=='en'?LX:'en-US');
const fmt=(k,o)=>{try{return dOf(k).toLocaleDateString(loc(),o)}catch(e){return dOf(k).toLocaleDateString('en-US',o)}};
const toM=s=>{const[h,m]=String(s).split(':').map(Number);return h*60+m};
const hm=m=>pad(Math.floor(m/60)%24)+':'+pad(Math.round(m)%60);
const fm=m=>f12(hm(m));
const IC=(n,s)=>`<i class="ph ph-${n}"${s?` style="font-size:${s}px"`:''}></i>`;
const V=()=>window.FQV||null;
const catOf=t=>V()&&V().catOf?V().catOf(t):'other';

/* =============== 1. one Worship tab =============== */
const qi=TABS.findIndex(t=>t[0]==='quran'),di=TABS.findIndex(t=>t[0]==='dhikr');
if(qi>=0)TABS[qi]=['quran','ph-book-open-text',X('Worship','العبادة','Ibaadaa','Cibaado')];
if(di>=0)TABS.splice(di,1,['cal','ph-calendar-dots',X('Calendar','التقويم','Kaalaandara','Jadwalka')]);
Object.assign(TABOF,{dhikr:'quran',quran:'quran',index:'quran',cal:'cal',hcal:'cal'});
const WS='fq5.wseg';
function segHtml(on){return `<div class="wk-seg" role="tablist">${[['quran',X("Qur'an",'القرآن',"Qur'aana","Qur'aanka")],['dhikr',X('Dhikr','الذكر','Zikrii','Dhikriga')]].map(([k,l])=>`<button role="tab" data-ws="${k}" aria-selected="${k===on}" class="${k===on?'on':''}">${l}</button>`).join('')}<i class="wk-ink"></i></div>`}
['quran','dhikr'].forEach(k=>{const s=$('s-'+k);if(!s)return;const hd=s.querySelector('.hd');if(!hd||hd.querySelector('.wk-seg'))return;
 const h=hd.querySelector('h1');if(h)h.classList.add('wk-h');hd.insertAdjacentHTML('afterbegin',segHtml(k));hd.classList.add('wk-hd')});
document.addEventListener('click',e=>{const b=e.target.closest('[data-ws]');if(b){e.preventDefault();e.stopPropagation();const k=b.dataset.ws;try{localStorage.setItem(WS,k)}catch(x){}vib(6);go(k,false);return}
 const a=e.target.closest('#tab a[data-tab="quran"]');if(a){let last='quran';try{last=localStorage.getItem(WS)||'quran'}catch(x){}
  if(last==='dhikr'){e.preventDefault();e.stopImmediatePropagation();hist=[];go('dhikr',false)}}},true);
/* remember the part whenever it is opened from anywhere (Home cards, links) */
{const _g=window.go;window.go=function(s){if(s==='quran'||s==='dhikr'||s==='index')try{localStorage.setItem(WS,s==='index'?'quran':s)}catch(x){}return _g.apply(this,arguments)}}

/* tab icons: Calendar in the same horizon style as the other tabs; tasbih count moves to the Worship tab */
const CALI='<rect class="s w" x="4.6" y="6.2" width="14.8" height="13.6" rx="3"/><path class="s" d="M8.6 4.4v3.4M15.4 4.4v3.4M4.8 10.6h14.4"/><circle class="s" cx="9.2" cy="14.6" r=".55"/><circle class="s" cx="12" cy="14.6" r=".55"/><circle class="s" cx="14.8" cy="14.6" r=".55"/>';
const calIc=on=>`<svg class="fq-ti fqi${on?' on':''}" viewBox="0 0 24 24" aria-hidden="true">${CALI}<path class="h" d="M2.5 21.8h19"/></svg>`;
{const _rt=window.renderTab;window.renderTab=function(on){_rt.apply(this,arguments);try{
  const c=document.querySelector('#tab a[data-tab="cal"]');if(c){const o=c.querySelector('svg,i');if(o)o.outerHTML=calIc(c.classList.contains('on'))}
  const q=document.querySelector('#tab a[data-tab="quran"]'),zn=typeof dzCount==='function'?dzCount():0;
  if(q&&zn&&!q.querySelector('.tbd'))q.insertAdjacentHTML('afterbegin',`<span class="tbd">${AR(zn>999?'999+':zn)}</span>`)}catch(e){}}}

/* =============== 2. Calendar screen =============== */
/* the older Hijri month view stays, as "Hijri month" */
const old=$('s-cal');
if(old&&!$('s-hcal')){old.id='s-hcal';R.hcal=R.cal;const h=old.querySelector('.hd h1');if(h){h.removeAttribute('data-t');h.textContent=X('Hijri month','الشهر الهجري','Ji\'a Hijraa','Bisha Hijriga')}}
old.insertAdjacentHTML('afterend',`<section class="scr" id="s-cal">
 <div class="hd kc-hd"><h1>${X('Calendar','التقويم','Kaalaandara','Jadwalka')}</h1><button class="kc-td" id="kcToday">${X('Today','اليوم','Har\'a','Maanta')}</button><button class="ib kc-add" id="kcAdd" aria-label="${X('Add','إضافة')}">${IC('plus',22)}</button></div>
 <div class="kc-seg" role="tablist" id="kcSeg"></div>
 <div class="kc-nav"><button class="ib" id="kcPrev" aria-label="${X('Previous','السابق')}">${IC('caret-left flip')}</button><div class="kc-tt" id="kcTitle"></div><button class="ib" id="kcNext" aria-label="${X('Next','التالي')}">${IC('caret-right flip')}</button></div>
 <div id="kcBody"></div>
</section>`);

const KC={v:(()=>{try{return localStorage.getItem('fq5.kcv')||'week'}catch(e){return 'week'}})(),sel:null};
const VIEWS=[['day',X('Day','يوم','Guyyaa','Maalin')],['week',X('Week','أسبوع','Torban','Toddobaad')],['month',X('Month','شهر','Ji\'a','Bil')]];

/* Islamic dates: occasions, white days, Monday/Thursday fasts */
const OCC={'1.1':['Islamic New Year','رأس السنة الهجرية'],'1.9':["Fast of 9 Muharram (Tasu'a)",'صيام تاسوعاء'],'1.10':["Fast of 'Ashura",'صيام عاشوراء'],'9.1':['Ramadan begins','بداية رمضان'],'10.1':['Eid al-Fitr','عيد الفطر'],'12.1':['First 10 days of Dhul-Hijjah','العشر الأوائل من ذي الحجة'],'12.9':["Day of 'Arafah fast",'صيام يوم عرفة'],'12.10':['Eid al-Adha','عيد الأضحى']};
function hijri(k){try{return hParts(dOf(k))}catch(e){return null}}
function islamic(k){const h=hijri(k),out=[];if(!h)return out;const o=OCC[h.m+'.'+h.d];if(o)out.push({t:X(o[0],o[1]),big:1});
 const wd=[13,14,15].includes(h.d)&&h.m!==9;if(wd)out.push({t:X('White day: a Sunnah fast','من الأيام البيض: صيام سنة','Guyyaa adii: soomana Sunnaa','Maalin cad: soon Sunno ah'),wd:1});
 const g=dOf(k).getDay();if(!wd&&(g===1||g===4)&&h.m!==9&&!(h.m===10&&h.d===1)&&!(h.m===12&&h.d>=10&&h.d<=13))out.push({t:X('Sunnah fast ('+fmt(k,{weekday:'long'})+')','صيام سنة ('+fmt(k,{weekday:'long'})+')'),soft:1});
 if(g===5)out.push({t:X("Jumu'ah: Surat al-Kahf, salawat, du'a",'الجمعة: سورة الكهف، الصلاة على النبي، الدعاء'),soft:1});
 return out}

/* everything on one day */
function itemsOn(k){const out=[],v=V();
 if(v&&v.busy){try{v.busy(k).forEach(x=>{if(x.sal)out.push({a:x.a,b:x.b,t:x.t,sal:x.sal});else out.push({a:x.a,b:x.b,t:x.t,id:x.id,sch:x.sch,c:catOf(x.t)})})}catch(e){}}
 else SAL.forEach(z=>out.push({a:toM(z[3]),b:toM(z[3])+20,t:T(z[1],z[2]),sal:z[0]}));
 S.tasks.forEach(t=>{if(t.dt===k&&t.s==null)out.push({any:1,t:t.t,id:t.id,c:catOf(t.t)})});
 (S.done||[]).forEach(t=>{if(t.dt===k)out.push({a:t.s,b:t.s!=null?t.s+(t.du||30):null,any:t.s==null,t:t.t,id:t.id,dn:1,c:catOf(t.t)})});
 if(window.FQM&&FQM.dueOn)try{FQM.dueOn(k).forEach(m=>out.push({any:1,t:m.t,money:m,c:'money'}))}catch(e){}
 return out}
const hasPlan=k=>itemsOn(k).some(x=>!x.sal);

/* ---- rows ---- */
function row(x){if(x.sal)return `<p class="kc-sal"><span class="kc-tm">${fm(x.a)}</span><b>${esc(x.t)}</b></p>`;
 const tm=x.money?`<span class="kc-tm">${x.money.k==='in'?IC('arrow-down-left',15):IC('arrow-up-right',15)}</span>`:(x.any||x.a==null)?`<span class="kc-tm kc-any">${X('Any time','أي وقت','Yeroo kamiyyuu','Wakhti kasta')}</span>`:`<span class="kc-tm">${fm(x.a)}</span>`;
 const meta=x.money?`<em>${esc(x.money.amtTx)}</em>`:x.sch?`<em>${X('weekly','أسبوعي','torbanii','toddobaadle')}</em>`:'';
 return `<button class="kc-it c-${x.c||'other'}${x.dn?' dn':''}" ${x.id!=null?`data-kt="${x.id}"`:x.money?`data-km="${esc(x.money.key)}"`:x.sch?`data-ks="1"`:''}>${tm}<b dir="auto">${esc(x.t)}</b>${meta}</button>`}
function agenda(k,opt){opt=opt||{};const l=itemsOn(k),isl=islamic(k);
 const plans=l.filter(x=>!x.sal),sal=l.filter(x=>x.sal),timed=plans.filter(x=>!x.any&&x.a!=null).sort((a,b)=>a.a-b.a),any=plans.filter(x=>x.any||x.a==null);
 let rows=[];if(opt.withSal){rows=[...timed.map(x=>({...x})),...sal].sort((a,b)=>a.a-b.a)}else rows=timed;
 return `${isl.length?`<div class="kc-isl">${isl.filter(x=>!opt.short||!x.soft).map(x=>`<p class="${x.big?'big':''}">${IC(x.big?'sun':x.wd?'sun-dim':'sun-horizon',15)}<span>${x.t}</span></p>`).join('')}</div>`:''}
 ${any.length?`<div class="kc-l">${any.map(row).join('')}</div>`:''}
 ${rows.length?`<div class="kc-l">${rows.map(row).join('')}</div>`:''}
 ${!plans.length?`<p class="kc-free">${X('Nothing planned. A calm day.','لا شيء مخطط. يوم هادئ.','Wanti karoorfame hin jiru.','Wax qorsheysan ma jiro.')}</p>`:''}`}

/* ---- Month ---- */
function monthView(){const sel=KC.sel,s=dOf(sel),y=s.getFullYear(),m=s.getMonth(),first=new Date(y,m,1,12),start=new Date(first);start.setDate(1-first.getDay());
 const tk=today(),wds=[...Array(7)].map((_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d.toLocaleDateString(loc(),{weekday:'narrow'})});
 const cells=[];for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);cells.push(d)}
 const rows=cells[35].getMonth()!==m?35:42;
 const html=cells.slice(0,rows).map(d=>{const k=dkey(d),out=d.getMonth()!==m,h=hijri(k),l=itemsOn(k).filter(x=>!x.sal),isl=islamic(k).filter(x=>!x.soft);
  const cs=[...new Set(l.map(x=>x.c||'other'))].slice(0,3);
  return `<button class="kc-d${out?' out':''}${k===tk?' td':''}${k===sel?' sel':''}" data-kd="${k}" aria-label="${fmt(k,{weekday:'long',day:'numeric',month:'long'})}"><b>${AR(d.getDate())}</b>${h?`<small class="${h.d===1?'h1':''}">${h.d===1?esc(hms(h.m)).slice(0,6):AR(h.d)}</small>`:''}<span class="kc-dots">${isl.length?'<em class="g"></em>':''}${cs.map(c=>`<em class="c-${c}"></em>`).join('')}</span></button>`}).join('');
 return `<div class="kc-card kc-mo"><div class="kc-wd">${wds.map(w=>`<span>${w}</span>`).join('')}</div><div class="kc-grid">${html}</div></div>
 <div class="kc-card kc-day"><div class="kc-dh"><b>${fmt(sel,{weekday:'long',day:'numeric',month:'long'})}</b><small>${hLabel(sel)}</small></div>${agenda(sel,{short:0})}
 <div class="kc-acts"><button class="kc-pl" data-kadd="${sel}">${IC('plus',17)}<span>${X('Add to this day','أضف لهذا اليوم','Guyyaa kanatti dabali','Ku dar maalintan')}</span></button><button class="kc-pl" data-kgo="day">${IC('clock',17)}<span>${X('Open day','افتح اليوم','Guyyaa bani','Fur maalinta')}</span></button></div></div>
 <button class="kc-hj" data-go="hcal">${IC('moon',18)}<span><b>${X('Hijri month','الشهر الهجري','Ji\'a Hijraa','Bisha Hijriga')}</b><small>${X('Salah you marked, white days, occasions','صلواتك المسجّلة، الأيام البيض، المناسبات')}</small></span>${IC('caret-right flip')}</button>`}
const hLabel=k=>{const h=hijri(k);return h?`${AR(h.d)} ${esc(hms(h.m))} ${AR(h.y)}`:''};

/* ---- Week ---- */
function weekStart(k){const d=dOf(k);d.setDate(d.getDate()-d.getDay());return dkey(d)}
function strip(k,mode){const ws=weekStart(k),tk=today();return `<div class="kc-strip">${[...Array(7)].map((_,i)=>{const d=addD(ws,i);
 return `<button class="${d===k?'sel':''}${d===tk?' td':''}" data-kd="${d}"><small>${fmt(d,{weekday:'short'})}</small><b>${AR(dOf(d).getDate())}</b>${hasPlan(d)?'<i></i>':'<i class="no"></i>'}</button>`}).join('')}</div>`}
function weekView(){const ws=weekStart(KC.sel),tk=today();
 return strip(KC.sel)+[...Array(7)].map((_,i)=>{const d=addD(ws,i),l=itemsOn(d).filter(x=>!x.sal),isl=islamic(d).filter(x=>!x.soft);
  return `<div class="kc-card kc-wk${d===tk?' td':''}${d===KC.sel?' sel':''}" id="kw-${d}"><div class="kc-dh"><button class="kc-dn" data-kday="${d}"><b>${fmt(d,{weekday:'long'})}</b><small>${fmt(d,{day:'numeric',month:'short'})} · ${hLabel(d)}${d===tk?' · '+X('Today','اليوم'):''}</small></button><button class="ib kc-mini" data-kadd="${d}" aria-label="${X('Add','إضافة')}">${IC('plus',18)}</button></div>
  ${isl.length?`<div class="kc-isl">${isl.map(x=>`<p class="${x.big?'big':''}">${IC(x.big?'sun':'sun-dim',15)}<span>${x.t}</span></p>`).join('')}</div>`:''}
  ${l.length?`<div class="kc-l">${l.sort((a,b)=>(a.any?-1:a.a)-(b.any?-1:b.a)).map(row).join('')}</div>`:`<p class="kc-free sm">${X('Free','فارغ','Bilisa','Bannaan')}</p>`}</div>`}).join('')}

/* ---- Day (the horizon, upright) ---- */
function dayView(){const k=KC.sel,l=itemsOn(k),tk=today(),PX=60;
 const sal=l.filter(x=>x.sal),timed=l.filter(x=>!x.sal&&!x.any&&x.a!=null),any=l.filter(x=>!x.sal&&(x.any||x.a==null));
 const fa=(sal[0]||{a:330}).a,is=(sal[sal.length-1]||{a:1170}).a;
 let a0=Math.min(fa-30,6*60,...timed.map(x=>x.a)),b0=Math.max(is+60,22*60,...timed.map(x=>x.b||x.a+30));a0=Math.max(0,Math.floor(a0/60)*60);b0=Math.min(24*60,Math.ceil(b0/60)*60);
 const Y=m=>((m-a0)/60*PX).toFixed(1),H=(b0-a0)/60*PX;
 /* lay out overlapping blocks side by side */
 const blocks=timed.map(x=>({...x,b:Math.max(x.b||x.a+30,x.a+20)})).sort((p,q)=>p.a-q.a);const cols=[];blocks.forEach(x=>{let c=0;while(cols[c]&&cols[c]>x.a)c++;cols[c]=x.b;x.col=c});
 blocks.forEach(x=>{x.n=Math.max(...blocks.filter(y=>y.a<x.b&&x.a<y.b).map(y=>y.col))+1});
 const nm=NOW().getHours()*60+NOW().getMinutes();
 let hrs='';for(let m=a0;m<=b0;m+=60)hrs+=`<span class="kc-hr" style="top:${Y(m)}px"><em>${m<24*60?fm(m).replace(':00',''):''}</em></span>`;
 return strip(k)+`<div class="kc-card kc-dayv"><div class="kc-dh"><b>${fmt(k,{weekday:'long',day:'numeric',month:'long'})}</b><small>${hLabel(k)}</small></div>
 ${agenda(k,{short:0}).split('<div class="kc-l">')[0]}
 ${any.length?`<p class="kc-sub">${X('Any time today','في أي وقت','Yeroo kamiyyuu','Wakhti kasta')}</p><div class="kc-l">${any.map(row).join('')}</div>`:''}
 <div class="kc-tl" style="height:${H}px" id="kcTl">${hrs}
  ${sal.map(s=>`<span class="kc-sm" style="top:${Y(s.a)}px"><em>${esc(s.t)} · ${fm(s.a)}</em></span>`).join('')}
  ${blocks.map(x=>`<button class="kc-bk c-${x.c||'other'}${x.dn?' dn':''}" ${x.id!=null?`data-kt="${x.id}"`:x.sch?'data-ks="1"':''} style="top:${Y(x.a)}px;height:${Math.max(26,(x.b-x.a)/60*PX-3).toFixed(1)}px;inset-inline-start:calc(54px + (100% - 58px) * ${x.col}/${x.n});width:calc((100% - 58px) / ${x.n} - 3px)"><b dir="auto">${esc(x.t)}</b><small>${fm(x.a)} – ${fm(x.b)}</small></button>`).join('')}
  ${k===tk&&nm>a0&&nm<b0?`<span class="kc-now" style="top:${Y(nm)}px"></span>`:''}
 </div><p class="kc-tip">${X('Tap an empty hour to add something there.','اضغط ساعة فارغة لإضافة شيء فيها.')}</p></div>`}

/* ---- title + paint ---- */
function title(){const k=KC.sel;if(KC.v==='month'){const s=dOf(k),f=new Date(s.getFullYear(),s.getMonth(),1,12),e=new Date(s.getFullYear(),s.getMonth()+1,0,12),h1=hijri(dkey(f)),h2=hijri(dkey(e));
  return `<b>${s.toLocaleDateString(loc(),{month:'long',year:'numeric'})}</b><small>${h1&&h2?(h1.m===h2.m?esc(hms(h1.m))+' '+AR(h1.y):esc(hms(h1.m))+' – '+esc(hms(h2.m))+' '+AR(h2.y)):''}</small>`}
 if(KC.v==='week'){const ws=weekStart(k),we=addD(ws,6);return `<b>${fmt(ws,{day:'numeric',month:'short'})} – ${fmt(we,{day:'numeric',month:'short'})}</b><small>${hLabel(ws).replace(/\s\S+$/,'')} – ${hLabel(we)}</small>`}
 return `<b>${k===today()?X('Today','اليوم'):k===addD(today(),1)?X('Tomorrow','غدًا'):fmt(k,{weekday:'long'})}</b><small>${fmt(k,{day:'numeric',month:'long',year:'numeric'})}</small>`}
R.cal=function(){if(!KC.sel)KC.sel=today();
 $('kcSeg').innerHTML=VIEWS.map(([k,l])=>`<button role="tab" data-kv="${k}" aria-selected="${k===KC.v}" class="${k===KC.v?'on':''}">${l}</button>`).join('');
 $('kcTitle').innerHTML=title();$('kcToday').classList.toggle('dim',KC.sel===today());
 $('kcBody').innerHTML=KC.v==='month'?monthView():KC.v==='week'?weekView():dayView();
 if(KC.v==='day'){const tl=$('kcTl');if(tl&&KC.sel===today()&&!KC.scrolled){KC.scrolled=1}}};
function setSel(k){KC.sel=k;R.cal()}
$('kcPrev').onclick=()=>{vib(6);const k=KC.sel;if(KC.v==='month'){const d=dOf(k);d.setDate(1);d.setMonth(d.getMonth()-1);setSel(dkey(d))}else setSel(addD(k,KC.v==='week'?-7:-1))};
$('kcNext').onclick=()=>{vib(6);const k=KC.sel;if(KC.v==='month'){const d=dOf(k);d.setDate(1);d.setMonth(d.getMonth()+1);setSel(dkey(d))}else setSel(addD(k,KC.v==='week'?7:1))};
$('kcToday').onclick=()=>{vib(6);setSel(today())};
$('kcAdd').onclick=()=>addSheet(KC.sel);
/* swipe left/right to move through days, weeks or months */
{let sx=0,sy=0,st=0;const b=$('kcBody');b.addEventListener('touchstart',e=>{const t=e.touches[0];sx=t.clientX;sy=t.clientY;st=Date.now()},{passive:true});
 b.addEventListener('touchend',e=>{const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;if(Date.now()-st<600&&Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.6){const rtl=document.documentElement.dir==='rtl';((dx<0)!==rtl?$('kcNext'):$('kcPrev')).click()}},{passive:true})}
$('s-cal').addEventListener('click',e=>{let b;
 if(b=e.target.closest('[data-kv]')){KC.v=b.dataset.kv;try{localStorage.setItem('fq5.kcv',KC.v)}catch(x){}vib(6);R.cal();return}
 if(b=e.target.closest('[data-kd]')){vib(6);const k=b.dataset.kd;if(KC.v==='week'){KC.sel=k;R.cal();const c=$('kw-'+k);if(c)c.scrollIntoView({behavior:'smooth',block:'center'})}else setSel(k);return}
 if(b=e.target.closest('[data-kday]')){KC.v='day';try{localStorage.setItem('fq5.kcv','day')}catch(x){}setSel(b.dataset.kday);return}
 if(b=e.target.closest('[data-kgo]')){KC.v=b.dataset.kgo;try{localStorage.setItem('fq5.kcv',KC.v)}catch(x){}R.cal();return}
 if(b=e.target.closest('[data-kadd]')){addSheet(b.dataset.kadd);return}
 if(b=e.target.closest('[data-kt]')){taskSheet(+b.dataset.kt);return}
 if(b=e.target.closest('[data-km]')){if(window.FQM)FQM.dueSheet(b.dataset.km);return}
 if(b=e.target.closest('[data-ks]')){openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Weekly schedule','الجدول الأسبوعي')}</h1>${XB}</div><p class="note">${X('This repeats every week. Change it in Life & family, Family schedule.','هذا يتكرر كل أسبوع. غيّره من الحياة والأسرة، جدول الأسرة.')}</p><button class="kc-big" id="kcFam">${X('Open family schedule','افتح جدول الأسرة')}</button>`);$('kcFam').onclick=()=>{closeSheet();if($('s-fam'))go('fam');else go('more')};return}
 const tl=e.target.closest('#kcTl');if(tl&&e.target===tl||e.target.classList&&e.target.classList.contains('kc-hr')){const r=$('kcTl').getBoundingClientRect(),y=e.clientY-r.top,PX=60;
  const first=$('kcTl').querySelector('.kc-hr');const a0=toMFromLabel();const m=Math.floor((a0+y/PX*60)/30)*30;addSheet(KC.sel,m);return}});
function toMFromLabel(){/* the timeline starts at the first hour line; recompute the same way dayView does */
 const l=itemsOn(KC.sel),sal=l.filter(x=>x.sal),timed=l.filter(x=>!x.sal&&!x.any&&x.a!=null),fa=(sal[0]||{a:330}).a;return Math.max(0,Math.floor(Math.min(fa-30,360,...timed.map(x=>x.a))/60)*60)}

/* ---- add sheet ---- */
const DURS=[[15,'15 min'],[30,'30 min'],[60,'1 h'],[90,'1.5 h'],[120,'2 h'],[180,'3 h']];
function addSheet(k,m){k=k||today();const wk=dOf(k).getDay();
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Add to calendar','أضف إلى التقويم','Kaalaandaratti dabali','Ku dar jadwalka')}</h1>${XB}</div>
 <div class="kc-form">
  <label class="kc-f"><span>${X('What','ماذا','Maal','Maxay')}</span><input id="kaT" dir="auto" autocomplete="off" placeholder="${X('e.g. Class, dentist, call Mum','مثال: درس، طبيب أسنان، اتصال بالأم')}"></label>
  <div class="kc-2"><label class="kc-f"><span>${X('Day','اليوم','Guyyaa','Maalin')}</span><input id="kaD" type="date" value="${k}"></label>
  <label class="kc-f"><span>${X('Time','الوقت','Sa\'aatii','Waqti')} <em>${X('optional','اختياري')}</em></span><input id="kaS" type="time" value="${m!=null?hm(m):''}"></label></div>
  <div class="kc-f"><span>${X('How long','المدة','Hammam','Intee')}</span><div class="kc-chips" id="kaU">${DURS.map(([v,l],i)=>`<button type="button" data-du="${v}" class="${v===60?'on':''}">${L==='ar'?l.replace('min','د').replace('h','س'):l}</button>`).join('')}</div></div>
  <div class="kc-f"><span>${X('Repeat','تكرار','Irra deebi\'i','Ku celi')}</span><div class="kc-chips" id="kaR"><button type="button" data-rp="0" class="on">${X('Once','مرة واحدة','Al tokko','Hal mar')}</button><button type="button" data-rp="1">${X('Every','كل','Hunda','Kasta')} ${fmt(k,{weekday:'long'})}</button></div></div>
  <button class="kc-big" id="kaGo">${X('Add','أضف','Dabali','Ku dar')}</button>
  ${V()&&V().openVoice?`<button class="kc-alt" id="kaV">${IC('microphone',18)}<span>${X('Or say it, I’ll fit it','أو قلها، وأنا أرتّبها')}</span></button>`:''}
 </div>`);
 let du=60,rp=0;$$('#kaU [data-du]').forEach(b=>b.onclick=()=>{du=+b.dataset.du;$$('#kaU button').forEach(x=>x.classList.toggle('on',x===b))});
 $$('#kaR [data-rp]').forEach(b=>b.onclick=()=>{rp=+b.dataset.rp;$$('#kaR button').forEach(x=>x.classList.toggle('on',x===b))});
 $('kaD').onchange=()=>{const v=$('kaD').value;if(v){const b=$('kaR').querySelector('[data-rp="1"]');b.textContent=X('Every','كل','Hunda','Kasta')+' '+fmt(v,{weekday:'long'})}};
 if(V()&&V().openVoice)$('kaV').onclick=()=>{const d=$('kaD').value||k,t=today();closeSheet();V().openVoice(d===t?'':d===addD(t,1)?'Tomorrow ':'On '+dOf(d).toLocaleDateString('en-US',{month:'long',day:'numeric'})+' ')};
 setTimeout(()=>{try{$('kaT').focus()}catch(e){}},350);
 $('kaGo').onclick=()=>{const t=$('kaT').value.trim();if(!t){$('kaT').focus();$('kaT').classList.add('kc-need');return}
  if(typeof blocked==='function'&&blocked(t)){toast(X('Please use kind words','من فضلك استخدم كلمات طيبة'));return}
  const d=$('kaD').value||k,sv=$('kaS').value,s=sv?toM(sv):null;
  if(rp&&s!=null){S.life=S.life||{};S.life.sch=S.life.sch||[];const id='k'+Date.now().toString(36);S.life.sch.push({id,t,d:[dOf(d).getDay()],s:hm(s),e:hm(Math.min(s+du,24*60-1)),who:['all']});save();closeSheet();vib([10,30,10]);
   undoToast(X('Added every week','أضيف كل أسبوع'),()=>{S.life.sch=S.life.sch.filter(x=>x.id!==id);save();R.cal()});KC.sel=d;R.cal();return}
  const id=Date.now(),lab=V()&&V().due?V().due(d,s,s!=null?du:null):d;
  S.tasks.unshift(Object.assign({id,t,due:lab,p:'m',dt:d,du:s!=null?du:undefined},s!=null?{s}:{}));save();closeSheet();vib([10,30,10]);
  undoToast(X('Added','أضيف','Dabalame','Lagu daray'),()=>{S.tasks=S.tasks.filter(x=>x.id!==id);save();R.cal()});
  if(rp&&s==null)toast(X('Pick a time to repeat it weekly','اختر وقتًا لتكراره أسبوعيًا'));
  KC.sel=d;R.cal()}}

/* ---- one task ---- */
function taskSheet(id){const open=S.tasks.find(t=>t.id===id),dn=(S.done||[]).find(t=>t.id===id),t=open||dn;if(!t)return;
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1 dir="auto">${esc(t.t)}</h1>${XB}</div>
 <p class="kc-when">${IC('calendar-dots',17)}<span>${esc(t.dt?fmt(t.dt,{weekday:'long',day:'numeric',month:'long'}):'')}${t.s!=null?' · '+fm(t.s)+(t.du?' – '+fm(t.s+t.du):''):''}</span></p>
 <div class="kc-form"><div class="kc-2"><label class="kc-f"><span>${X('Move to','انقل إلى','Gara','U guuri')}</span><input id="ktD" type="date" value="${t.dt||today()}"></label><label class="kc-f"><span>${X('Time','الوقت')}</span><input id="ktS" type="time" value="${t.s!=null?hm(t.s):''}"></label></div>
 <button class="kc-big" id="ktDone">${open?X('Mark done','تم','Xumurame','Waa la dhammeeyay'):X('Not done yet','لم يتم بعد')}</button>
 <div class="kc-row2"><button class="kc-alt" id="ktSave">${IC('check',18)}<span>${X('Save time','احفظ الوقت')}</span></button><button class="kc-alt kc-del" id="ktDel">${IC('trash',18)}<span>${X('Delete','احذف','Haqi','Tirtir')}</span></button></div></div>`);
 $('ktDone').onclick=()=>{if(open){S.tasks=S.tasks.filter(x=>x!==t);S.done=S.done||[];S.done.unshift(t);if(typeof star==='function')star('task-'+id,T('Task done','أنجزت مهمة'));vib([12,30,12])}
  else{S.done=S.done.filter(x=>x!==t);S.tasks.unshift(t);if(S.starLog&&S.starLog['task-'+id]){delete S.starLog['task-'+id];S.stars=Math.max(0,S.stars-1)}}save();closeSheet();R.cal()};
 $('ktSave').onclick=()=>{const d=$('ktD').value||t.dt,sv=$('ktS').value;t.dt=d;if(sv){t.s=toM(sv);t.du=t.du||30}else{delete t.s}delete t.flex;
  t.due=V()&&V().due?V().due(d,t.s!=null?t.s:null,t.s!=null?t.du:null):t.due;save();closeSheet();toast(X('Saved','تم الحفظ'));KC.sel=d;R.cal()};
 $('ktDel').onclick=()=>{const wasOpen=!!open,arr=wasOpen?S.tasks:S.done,i=arr.indexOf(t);arr.splice(i,1);save();closeSheet();R.cal();
  undoToast(X('Deleted','حُذف','Haqame','La tirtiray'),()=>{arr.splice(i,0,t);save();R.cal()})}}

/* first paint: if the page opened on #cal before this file loaded, show the new calendar */
try{const on=document.querySelector('.scr.on');if(on&&on.id==='s-hcal'&&location.hash==='#cal'){on.classList.remove('on');$('s-cal').classList.add('on');R.cal()}
 const sc=document.querySelector('.scr.on'),sk=sc?sc.id.slice(2):'home';window.renderTab(TABOF[sk]||'home')}catch(e){console.error(e)}
/* More: the Calendar row now lives on the tab bar */
try{const r=document.querySelector('#s-more [data-go="cal"]');if(r)r.remove()}catch(e){}
window.FQC={R:()=>R.cal(),addSheet,itemsOn};
})();
