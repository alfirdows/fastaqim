/* Fastaqim "Recite from memory" (24 Nov 2026)  (c) Fastaqim, all rights reserved.
   You recite, the page follows word by word and marks a word that was missed, changed or added, or a part that was skipped.
   The listening engine is Tilawa (tilawa.dev, code MIT, model CC BY 4.0), vendor/tilawa/tilawa.mjs, loaded only when used.
   It runs fully on the phone: the voice is never sent anywhere. The model downloads once from tilawa.dev into this
   browser (not into Fastaqim's site storage). A recording, if the reader keeps one, stays on this phone (IndexedDB).
   Only a tiny summary (date, passage, words to look at) is saved with the reader's other data.
   It checks memorization (words) only, not tajweed, and it was made for adult voices.
   Uses the page's globals: $, $$, T, L, S, save, openSheet, closeSheet, XB, toast, vib, esc, AR, ARD, SU, RQ, RD, qJ, qOpen, AU. */
(function(){'use strict';
const TW_URL='vendor/tilawa/tilawa.mjs';
/* the 5 ayat where Fastaqim's text joins two of the engine's words into one (display word m holds engine words m and m+1) */
const MERGE={'15:7':1,'27:20':4,'36:22':1,'37:164':1,'41:47':25};
const dIdx=(a,k)=>{const m=MERGE[RD.su+':'+a];return m&&k>m?k-1:k};
const KIND={wrong_word:()=>T('Different word','كلمة مختلفة'),omitted_word:()=>T('Missed word','كلمة متروكة'),added_word:()=>T('Extra word','كلمة زائدة'),skipped_passage:()=>T('Skipped part','مقطع متروك')};
const KCLS={wrong_word:'x',omitted_word:'om',added_word:'ad',skipped_passage:'om'};
const MB=n=>Math.round(n/1e6);const SEP=()=>L==='ar'?'، ':' · ';
const ui=()=>S.rcUi=S.rcUi||{hide:0,rec:0};
let MOD=null,TW=null,LOADING=null,RUN=null;

/* ---------- engine ---------- */
async function mod(){if(window.FQ_RC_ENGINE)return window.FQ_RC_ENGINE;if(!MOD)MOD=await import(new URL(TW_URL,location.href).href);return MOD}
const isPhone=()=>/iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
function tierGuess(){const n=navigator;if(typeof n.deviceMemory==='number'&&n.deviceMemory<4)return'lite';return isPhone()&&!('gpu' in n)?'lite':'full'}
const dlSize=()=>tierGuess()==='lite'?60:100; /* model + Qur'an reference + engine runtime, rounded up */
async function load(onP,signal){if(TW)return TW;if(LOADING)return LOADING;
 LOADING=(async()=>{const m=await mod();const t=await m.createTilawa({onProgress:p=>onP&&onP(p),signal});TW=t;try{localStorage.setItem('fq5.rcReady','1')}catch(e){}return t})();
 try{return await LOADING}finally{LOADING=null}}

/* ---------- recordings kept on this phone ---------- */
function idb(){return new Promise((ok,no)=>{const r=indexedDB.open('fq-recite',1);r.onupgradeneeded=()=>r.result.createObjectStore('rec',{keyPath:'id'});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function idbDo(mode,fn){const db=await idb();return new Promise((ok,no)=>{const tx=db.transaction('rec',mode),st=tx.objectStore('rec');const r=fn(st);tx.oncomplete=()=>ok(r&&r.result);tx.onerror=()=>no(tx.error)})}
const recPut=o=>idbDo('readwrite',s=>s.put(o));const recGet=id=>idbDo('readonly',s=>s.get(id));const recDel=id=>idbDo('readwrite',s=>s.delete(id));
function wav(chunks,rate){let n=0;chunks.forEach(c=>n+=c.length);const b=new DataView(new ArrayBuffer(44+n*2));const w=(o,s)=>{for(let i=0;i<s.length;i++)b.setUint8(o+i,s.charCodeAt(i))};
 w(0,'RIFF');b.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');b.setUint32(16,16,true);b.setUint16(20,1,true);b.setUint16(22,1,true);b.setUint32(24,rate,true);b.setUint32(28,rate*2,true);b.setUint16(32,2,true);b.setUint16(34,16,true);w(36,'data');b.setUint32(40,n*2,true);
 let o=44;chunks.forEach(c=>{for(let i=0;i<c.length;i++){const v=Math.max(-1,Math.min(1,c[i]));b.setInt16(o,v<0?v*32768:v*32767,true);o+=2}});return new Blob([b],{type:'audio/wav'})}

/* ---------- words on the page ---------- */
function wrapAyat(a1,a2){const d=RQ.c[RD.su];if(!d)return;
 $$('#rdB .ra').forEach(el=>{const n=+el.dataset.n,inR=n>=a1&&n<=a2;el.classList.toggle('rc-in',inR);el.classList.toggle('rc-out',!inR);el.classList.remove('dn','peek');
  if(!inR)return;const p=el.querySelector('.rar');if(!p||p.dataset.rcw)return;
  const ws=d.v[n-1][0].split(' ');p.innerHTML=ws.map((w,i)=>`<span class="rw" data-w="${i+1}">${w}</span>`).join(' ')+' '+ARD(n);p.dataset.rcw='1'})}
function clearMarks(){$('rdB').classList.remove('rc-on','rc-hide');$$('#rdB .ra').forEach(el=>el.classList.remove('rc-in','rc-out','dn','peek'));$$('#rdB .rw').forEach(w=>w.className='rw')}
const wEl=(a,k)=>{const el=$('a'+a);return el&&el.querySelector(`.rw[data-w="${dIdx(a,k)}"]`)};

/* ---------- start sheet ---------- */
function startSheet(from){const su=RD.su,s=SU[su-1],max=s[2],o=ui();from=Math.max(1,Math.min(max,from||1));
 const ready=!!TW||localStorage.getItem('fq5.rcReady')==='1';
 const opts=(sel)=>Array.from({length:max},(_,i)=>`<option value="${i+1}"${i+1===sel?' selected':''}>${AR(i+1)}</option>`).join('');
 const to=Math.min(max,from+(max-from>9?9:max-from));
 openSheet(`<div class="rcs"><div class="hd sub"><span style="width:44px"></span><h1>${T('Recite from memory','تسميع الحفظ')}</h1>${XB}</div>
 <div class="card"><div class="rcr"><span>${T('Surah','السورة')}</span><b class="rcsu" lang="ar" dir="rtl">سُورَةُ ${s[1]}</b></div>
  <div class="rcr"><span>${T('Ayat','الآيات')}</span><div class="rng"><select id="rcA1" aria-label="${T('From ayah','من الآية')}">${opts(from)}</select><span>${T('to','إلى')}</span><select id="rcA2" aria-label="${T('To ayah','إلى الآية')}">${opts(to)}</select></div></div></div>
 <div class="card"><div class="rcr"><span>${T('Hide the ayat','إخفاء الآيات')}<small>${T('Each word shows once you recite it. Tap an ayah to peek.','تظهر كل كلمة بعد أن تقرأها. اضغط على الآية لإلقاء نظرة.')}</small></span><button class="sw ${o.hide?'on':''}" id="rcH" aria-label="${T('Hide the ayat','إخفاء الآيات')}"></button></div>
  <div class="rcr"><span>${T('Keep a recording','احفظ تسجيلًا')}<small>${T('Kept only on this phone, never uploaded. You can save it to Files.','يُحفظ على هذا الهاتف فقط ولا يُرفع. يمكنك حفظه في الملفات.')}</small></span><button class="sw ${o.rec?'on':''}" id="rcK" aria-label="${T('Keep a recording','احفظ تسجيلًا')}"></button></div></div>
 ${ready?'':`<div class="inf"><i class="ph ph-download-simple"></i><span>${T('First time only: about '+dlSize()+' MB downloads to this phone. After that it works without internet. Wi-Fi is best.','للمرة الأولى فقط: يُنزَّل نحو '+AR(dlSize())+' ميغابايت إلى هذا الهاتف، ثم يعمل دون إنترنت. يُفضَّل الواي فاي.')}</span></div>`}
 <div id="rcMsg"></div>
 <button class="go" id="rcGo"><i class="bar" id="rcBar"></i><span id="rcGoT"><i class="ph-fill ph-microphone"></i> ${ready?T('Start reciting','ابدأ التسميع'):T('Download and start','نزّل وابدأ')}</span></button>
 <p class="nt">${T('It listens for missed, changed or extra words. It does not check tajweed, and it is made for adult voices. Your voice stays on your phone.','يتنبّه للكلمات المتروكة أو المختلفة أو الزائدة، ولا يحكم على التجويد، وهو مصمَّم لأصوات الكبار. صوتك يبقى على هاتفك.')}</p>
 <div id="rcHist"></div>
 <p class="cr">${T('Listening engine: Tilawa (tilawa.dev)','محرك الاستماع: Tilawa (tilawa.dev)')} · <button id="rcCr">${T('Credits','الشكر والتراخيص')}</button></p></div>`);
 const a1=$('rcA1'),a2=$('rcA2');a1.onchange=()=>{if(+a2.value<+a1.value)a2.value=a1.value};a2.onchange=()=>{if(+a2.value<+a1.value)a1.value=a2.value};
 $('rcH').onclick=e=>{o.hide=o.hide?0:1;save();e.currentTarget.classList.toggle('on',!!o.hide)};
 $('rcK').onclick=e=>{o.rec=o.rec?0:1;save();e.currentTarget.classList.toggle('on',!!o.rec)};
 $('rcCr').onclick=credits;histDraw();if(ready&&!MOD&&!window.FQ_RC_ENGINE)mod().catch(()=>{});
 $('rcGo').onclick=()=>goTap(+a1.value,+a2.value)}
function msg(h,err){const m=$('rcMsg');if(m)m.innerHTML=h?`<div class="inf${err?' err':''}"><i class="ph ${err?'ph-warning-circle':'ph-info'}"></i><span>${h}</span></div>`:''}
function goTap(a1,a2){const b=$('rcGo');if(!b||b.disabled)return;
 /* iPhone: the microphone must be asked for inside the tap itself. Only do that when the engine is ready or cached. */
 let prep=null;const cached=!!TW||localStorage.getItem('fq5.rcReady')==='1';
 if(cached){try{prep=(MOD||window.FQ_RC_ENGINE)?(MOD||window.FQ_RC_ENGINE).prepareMicrophone():null}catch(e){return micErr(e)}}
 b.disabled=true;msg('');const gt=$('rcGoT'),bar=$('rcBar');
 const ac=new AbortController();const sh=$('sh');const obs=new MutationObserver(()=>{if(!sh.classList.contains('on')){ac.abort();obs.disconnect()}});obs.observe(sh,{attributes:true,attributeFilter:['class']});
 gt.innerHTML=T('Getting ready…','جارٍ التجهيز…');
 load(p=>{if(p.stage==='model'&&p.total){bar.style.width=Math.round(p.fraction*100)+'%';if(!p.fromCache&&p.total>2e6)gt.textContent=T('Downloading… '+MB(p.loaded)+' of '+MB(p.total)+' MB','جارٍ التنزيل… '+AR(MB(p.loaded))+' من '+AR(MB(p.total))+' ميغابايت')}
  else if(p.stage==='warmup')gt.textContent=T('Getting ready…','جارٍ التجهيز…')},ac.signal).then(async tw=>{obs.disconnect();
  if(!prep){/* first download finished: one more tap opens the microphone (iPhone rule) */
   b.disabled=false;bar.style.width='0';gt.innerHTML=`<i class="ph-fill ph-microphone"></i> ${T('Start reciting','ابدأ التسميع')}`;msg(T('Ready. It now works without internet.','جاهز. يعمل الآن دون إنترنت.'));
   const i=document.querySelector('.rcs .inf:not(#rcMsg .inf)');if(i)i.remove();return}
  closeSheet();await begin(tw,prep,a1,a2)}).catch(e=>{obs.disconnect();if(prep)try{prep.release()}catch(x){}
  if(ac.signal.aborted)return;b.disabled=false;bar.style.width='0';gt.innerHTML=`<i class="ph ph-arrow-clockwise"></i> ${T('Try again','حاول مرة أخرى')}`;
  console.warn('recite load',e);msg(navigator.onLine===false?T('No internet. The first download needs a connection.','لا يوجد إنترنت. التنزيل الأول يحتاج اتصالًا.'):T("Couldn't get the listening engine ready on this browser. Try again, or try on Wi-Fi.",'تعذّر تجهيز محرك الاستماع على هذا المتصفح. حاول مرة أخرى أو على الواي فاي.'),1)})}
function micErr(e){const r=e&&e.reason;msg(r==='denied'?T('The microphone is blocked. On iPhone: Settings app › Safari › Microphone › Allow, then try again.','الميكروفون محظور. في الآيفون: الإعدادات › سفاري › الميكروفون › السماح، ثم حاول مجددًا.'):T('No microphone was found on this device.','لم يُعثر على ميكروفون في هذا الجهاز.'),1);const b=$('rcGo');if(b){b.disabled=false;$('rcGoT').innerHTML=`<i class="ph-fill ph-microphone"></i> ${T('Start reciting','ابدأ التسميع')}`}}

/* ---------- one recitation ---------- */
async function begin(tw,prep,a1,a2){const su=RD.su,o=ui();try{AU.pause()}catch(e){}
 wrapAyat(a1,a2);const B=$('rdB');B.classList.add('rc-on');B.classList.toggle('rc-hide',!!o.hide);document.documentElement.classList.add('rc-busy');
 const ses=tw.startMemorization({surah:su,fromAyah:a1,toAyah:a2});
 const run=RUN={ses,su,a1,a2,t0:Date.now(),marks:new Map(),cur:null,rec:null,chunks:[],wl:null,mic:null,stopping:false};
 const tot=$$('#rdB .ra.rc-in .rw').length||1;
 ses.subscribe(e=>{if(RUN!==run)return;
  if(e.type==='position'&&(e.state==='locked')&&e.observed&&e.observed[0]){const w=e.observed[0].word;if(w.surah!==su)return;const el=wEl(w.ayah,w.word);if(!el)return;
   if(run.cur)run.cur.classList.remove('now');el.classList.add('now');run.cur=el;
   /* every word up to here has been recited */
   let done=0;for(const r of $$('#rdB .ra.rc-in')){const n=+r.dataset.n,ws=$$('.rw',r);if(n<w.ayah){ws.forEach(x=>x.classList.add('dn'));r.classList.add('dn');done+=ws.length}else if(n===w.ayah){const k=dIdx(n,w.word);ws.forEach((x,i)=>{if(i<k)x.classList.add('dn')});done+=k;if(k>=ws.length)r.classList.add('dn')}}
   run.heard=1;barSet(w.ayah,done/tot);const rr=el.getBoundingClientRect();if(rr.top<90||rr.bottom>innerHeight-190)scrollTo({top:rr.top+scrollY-innerHeight*.35,behavior:'smooth'})}
  if(e.type==='checker'){const el=wEl(e.location.ayah,e.location.word);
   if(e.state==='confirmed'){run.marks.set(e.id,e);if(el){el.classList.add(KCLS[e.errorClass]||'x');el.classList.add('dn')}vib(30)}
   else if((e.state==='resolved'||e.state==='uncertain')&&run.marks.has(e.id)){run.marks.delete(e.id);if(el)el.classList.remove('x','om','ad')}
   barSet()}});
 /* recording (optional, phone only) */
 if(o.rec){try{const st=await prep.stream;const mt=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t));
   if(mt){const mr=new MediaRecorder(st,{mimeType:mt,audioBitsPerSecond:64000});mr.ondataavailable=ev=>ev.data&&ev.data.size&&run.chunks.push(ev.data);mr.start(1000);run.rec={mr,mt}}
   else{run.pcm=[];ses.onAudio(p=>run.pcm.push(p.slice(0)))}}catch(e){}}
 barShow(a1,a2);
 try{run.mic=await tw.listen(ses,{prepared:prep,onLevel:db=>{const b=document.querySelector('.rcb .st');if(b)b.style.setProperty('--lv',Math.max(0,Math.min(1,(db+60)/45)).toFixed(2))}})}
 catch(e){RUN=null;barHide();clearMarks();try{ses.dispose()}catch(x){}startSheet(a1);setTimeout(()=>micErr(e),350);return}
 try{run.wl=await navigator.wakeLock?.request('screen')}catch(e){}
 vib(15)}
function barShow(a1,a2){let b=document.querySelector('.rcb');if(!b){document.body.insertAdjacentHTML('beforeend',`<div class="rcb" role="status"><button class="st" aria-label="${T('Stop','إيقاف')}"><i class="ph-fill ph-stop"></i></button><span class="tx"><b></b><small></small></span><button class="ey" aria-label="${T('Hide or show the ayat','إخفاء الآيات أو إظهارها')}"><i class="ph ph-eye"></i></button><span class="pr"><i></i></span></div>`);b=document.querySelector('.rcb');
  b.querySelector('.st').onclick=()=>stop();b.querySelector('.ey').onclick=()=>{const o=ui();o.hide=o.hide?0:1;save();$('rdB').classList.toggle('rc-hide',!!o.hide);eyeIc()}}
 b.querySelector('.pr i').style.width='0';b.classList.add('on');eyeIc();barSet(a1,0)}
function eyeIc(){const i=document.querySelector('.rcb .ey i');if(i)i.className='ph '+(ui().hide?'ph-eye-slash':'ph-eye')}
function barSet(ay,fr){const b=document.querySelector('.rcb');if(!b||!RUN)return;if(ay)RUN.ay=ay;const n=RUN.marks.size;
 b.querySelector('b').textContent=RUN.heard?T('Listening','أستمع'):T('Listening… recite when ready','أستمع… اقرأ حين تكون جاهزًا');
 b.querySelector('small').innerHTML=esc(T('Ayah '+(RUN.ay||RUN.a1)+' of '+RUN.a1+'–'+RUN.a2,'الآية '+AR(RUN.ay||RUN.a1)+' من '+AR(RUN.a1)+'–'+AR(RUN.a2)))+(n?`${SEP()}<em>${esc(T(n===1?'1 word to check':n+' words to check',AR(n)+' للمراجعة'))}</em>`:'');
 if(typeof fr==='number')b.querySelector('.pr i').style.width=Math.round(Math.min(1,fr)*100)+'%'}
function barHide(){const b=document.querySelector('.rcb');if(b)b.classList.remove('on');document.documentElement.classList.remove('rc-busy')}
async function stop(quiet){const run=RUN;if(!run||run.stopping)return;run.stopping=true;barHide();
 try{run.wl&&run.wl.release()}catch(e){}
 let blob=null;
 if(run.rec){blob=await new Promise(ok=>{const mr=run.rec.mr;if(mr.state==='inactive')return ok(null);mr.onstop=()=>ok(new Blob(run.chunks,{type:run.rec.mt.split(';')[0]}));try{mr.stop()}catch(e){ok(null)}})}
 try{if(run.mic)await run.mic.stop();else await run.ses.end()}catch(e){}
 if(!blob&&run.pcm&&run.pcm.length)blob=wav(run.pcm,16000);
 let mk=[];try{mk=run.ses.mistakes().filter(e=>e.state==='confirmed')}catch(e){mk=[...run.marks.values()]}
 RUN=null;if(run.cur)run.cur.classList.remove('now');$('rdB').classList.remove('rc-on','rc-hide');$$('#rdB .rc-out').forEach(x=>x.classList.remove('rc-out'));
 const ms=Date.now()-run.t0,id=Date.now().toString(36);
 const reached=$$('#rdB .ra.rc-in.dn').length+($$('#rdB .ra.rc-in .rw.dn').length?1:0);
 const h={id,t:Date.now(),su:run.su,a1:run.a1,a2:run.a2,ms,mk:mk.map(e=>[e.location.ayah,e.location.word,e.errorClass]),rec:0};
 if(blob&&blob.size>2000){try{await recPut({id,blob,mime:blob.type,t:h.t});h.rec=1;navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}}
 if(ms>4000||mk.length){S.rc=[h,...(S.rc||[])].slice(0,30);save()}
 if(!quiet)result(h,reached)}

/* ---------- result ---------- */
function burst(){let d='';const cs=['#2e6b32','#b8955a','#7fb38a','#d8c08e'];for(let i=0;i<16;i++){const a=i/16*Math.PI*2,r=78+Math.random()*26;d+=`<i class="dot" style="--x:${(Math.cos(a)*r).toFixed(0)}px;--y:${(Math.sin(a)*r).toFixed(0)}px;--d:${(1+Math.random()*.25).toFixed(2)}s;--c:${cs[i%4]}"></i>`}
 return `<div class="rcok"><i class="wave"></i><i class="wave"></i>${d}<svg viewBox="0 0 118 118"><circle class="ring" cx="59" cy="59" r="54" transform="rotate(-90 59 59)"/><path class="tick" d="M37 61l15 15 30-33"/></svg></div>`}
const dur=ms=>{const s=Math.round(ms/1000);return s<60?T(s+' sec',AR(s)+' ث'):T(Math.floor(s/60)+' min '+(s%60)+' sec',AR(Math.floor(s/60))+' د '+AR(s%60)+' ث')};
const pas=h=>(L==='ar'?'سورة '+SU[h.su-1][1]:SU[h.su-1][0])+' '+AR(h.a1)+(h.a2>h.a1?'–'+AR(h.a2):'');
function wordText(su,a,k){const d=RQ.c[su];if(!d)return'';const ws=d.v[a-1][0].split(' ');const m=MERGE[su+':'+a];return ws[(m&&k>m?k-1:k)-1]||''}
function result(h,reached){const n=h.mk.length,ok=!n&&reached>0;
 openSheet(`<div class="rcs"><div class="hd sub"><span style="width:44px"></span><h1>${T('Your recitation','تسميعك')}</h1>${XB}</div><div class="rcz">
 ${ok?burst():''}
 <p class="ttl">${ok?T('No mistakes heard','لم تُسمع أخطاء'):n?T(n===1?'1 word to look at again':n+' words to look at again',n===1?'كلمة واحدة للمراجعة':AR(n)+' كلمات للمراجعة'):T('Nothing was heard yet','لم يُسمع شيء بعد')}</p>
 <p class="sub">${esc(pas(h))}${SEP()}${dur(h.ms)}</p>
 ${!ok&&!n?`<p class="sub">${T('Recite a little louder, close to the phone, starting from the first ayah you chose.','اقرأ بصوت أعلى قليلًا وقريبًا من الهاتف، بدءًا من أول آية اخترتها.')}</p>`:''}
 ${n?`<div class="rcl">${h.mk.map(([a,k,c],i)=>`<button data-rj="${a}:${k}"><b class="w" lang="ar" dir="rtl">${esc(wordText(h.su,a,k))}</b><span><b>${esc((KIND[c]||KIND.wrong_word)())}</b><small>${T('Ayah '+a,'الآية '+AR(a))}</small></span><i class="ph ph-caret-right flip"></i></button>`).join('')}</div>`:''}
 <div id="rcAu"></div>
 <div class="rcbt">${h.rec?`<button class="w2" id="rcPl"><i class="ph-fill ph-play"></i>${T('Listen to my recitation','استمع إلى تسميعي')}</button>`:''}<button id="rcAg"><i class="ph ph-arrow-counter-clockwise"></i>${T('Recite again','أعد التسميع')}</button><button class="p" data-x>${T('Done','تم')}</button></div>
 <p class="nt">${T('These are prompts, not a verdict. A teacher has the final word.','هذه تنبيهات وليست حكمًا. الكلمة الأخيرة للمعلّم.')}</p></div></div>`);
 if(ok){vib([20,60,20]);}
 $$('#sh [data-rj]').forEach(b=>b.onclick=()=>{const[a,k]=b.dataset.rj.split(':').map(Number);closeSheet();const el=wEl(a,k)||$('a'+a);if(el){const r=el.getBoundingClientRect();scrollTo({top:r.top+scrollY-innerHeight*.35,behavior:'smooth'});const ra=$('a'+a);ra.classList.add('flash');setTimeout(()=>ra.classList.remove('flash'),1600)}});
 const p=$('rcPl');if(p)p.onclick=()=>playRec(h.id,$('rcAu'),p);
 $('rcAg').onclick=()=>{closeSheet();clearMarks();setTimeout(()=>startSheet(h.a1),300)};
 /* leaving the marks on the page until the reader starts again or leaves */}
async function playRec(id,box,btn){try{const r=await recGet(id);if(!r){toast(T('This recording is not on this phone','هذا التسجيل غير موجود على هذا الهاتف'));return}
 const u=URL.createObjectURL(r.blob);box.innerHTML=`<audio class="rcau" controls playsinline src="${u}"></audio>`;try{AU.pause()}catch(e){}box.querySelector('audio').play().catch(()=>{});if(btn)btn.remove()}catch(e){toast(T("Couldn't open the recording",'تعذّر فتح التسجيل'))}}
async function shareRec(h){try{const r=await recGet(h.id);if(!r)return toast(T('This recording is not on this phone','هذا التسجيل غير موجود على هذا الهاتف'));
 const ext=/mp4/.test(r.mime)?'m4a':/webm/.test(r.mime)?'webm':'wav';const name=('Fastaqim '+SU[h.su-1][0]+' '+h.a1+'-'+h.a2+' '+new Date(h.t).toISOString().slice(0,10)).replace(/[^\w\- ]/g,'')+'.'+ext;
 const f=new File([r.blob],name,{type:r.mime});
 if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f]}).catch(()=>{});return}
 const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=name;document.body.appendChild(a);a.click();a.remove()}catch(e){}}

/* ---------- past recitations (in the start sheet) ---------- */
function histDraw(){const box=$('rcHist');if(!box)return;const hs=(S.rc||[]).slice(0,6);if(!hs.length){box.innerHTML='';return}
 const df=t=>new Date(t).toLocaleDateString(L==='ar'?'ar':undefined,{month:'short',day:'numeric'})+SEP()+new Date(t).toLocaleTimeString(L==='ar'?'ar':undefined,{hour:'numeric',minute:'2-digit',hour12:true});
 box.innerHTML=`<h3>${T('Past recitations','التسميعات السابقة')}</h3><div class="card">${hs.map(h=>`<div class="rch" data-h="${h.id}"><span><b>${esc(pas(h))}</b><small>${esc(df(h.t))}${SEP()}${h.mk.length?esc(T(h.mk.length+' to look at',AR(h.mk.length)+' للمراجعة')):T('No mistakes heard','لم تُسمع أخطاء')}</small></span>
  ${h.rec?`<button class="pl" data-hp aria-label="${T('Listen','استمع')}"><i class="ph-fill ph-play"></i></button><button data-hs aria-label="${T('Save or share','احفظ أو شارك')}"><i class="ph ph-export"></i></button>`:''}<button data-hd aria-label="${T('Delete','حذف')}"><i class="ph ph-trash"></i></button></div><div data-ha="${h.id}"></div>`).join('')}</div>`;
 box.onclick=e=>{const row=e.target.closest('.rch');if(!row)return;const h=(S.rc||[]).find(x=>x.id===row.dataset.h);if(!h)return;
  if(e.target.closest('[data-hp]'))playRec(h.id,box.querySelector(`[data-ha="${h.id}"]`),null);
  else if(e.target.closest('[data-hs]'))shareRec(h);
  else if(e.target.closest('[data-hd]')){const i=S.rc.indexOf(h);S.rc.splice(i,1);save();histDraw();let gone=false;
   const t=setTimeout(()=>{gone=true;if(h.rec)recDel(h.id).catch(()=>{})},5000);
   (typeof undoToast==='function'?undoToast:(m=>toast(m)))(T('Recitation deleted','حُذف التسميع'),()=>{if(gone)return;clearTimeout(t);S.rc.splice(i,0,h);save();histDraw()})}}}

/* ---------- credits ---------- */
function credits(){openSheet(`<div class="rccr"><div class="hd sub"><span style="width:44px"></span><h1>${T('Credits','الشكر والتراخيص')}</h1>${XB}</div><div class="rcs"><div class="card" style="padding:14px 16px">
 <p><b>Tilawa</b> (<a href="https://tilawa.dev" target="_blank" rel="noopener">tilawa.dev</a>) listens to the recitation and finds missed, changed or extra words. Code: MIT licence. Model: CC BY 4.0. <a href="https://github.com/yazinsai/tilawa" target="_blank" rel="noopener">Source ↗</a></p>
 <p>The Tilawa model was trained with tlog (Tarteel, CC BY), Quranic Universal Ayahs (QUD Technologies, CC BY), muaalem and quran-transcript (obadx, MIT) and k2-fsa icefall (Apache-2.0). Its Qur'an reference is from the Tanzil Uthmani text (<a href="https://tanzil.net" target="_blank" rel="noopener">tanzil.net</a>).</p>
 <p style="margin:0">ONNX Runtime (Microsoft, MIT) runs the model in the browser.</p></div></div></div>`)}

/* ---------- entry points ---------- */
function entry(){const h=document.querySelector('#rdB .rsh');if(h&&!h.querySelector('.rcp'))h.insertAdjacentHTML('beforeend',`<button class="rcp" data-rc="1"><i class="ph ph-microphone"></i>${T('Recite from memory','تسميع الحفظ')}</button>`);
 $$('#rdB .rac').forEach(r=>{if(!r.querySelector('[data-rc]'))r.querySelector('[data-ra="mark"]')?.insertAdjacentHTML('afterend',`<button data-rc="here"><i class="ph ph-microphone"></i>${T('Recite from here','سمّع من هنا')}</button>`)})}
new MutationObserver(entry).observe($('rdB'),{childList:true,subtree:true});
function qhEntry(){const a=document.querySelector('.qh .act');if(a&&!a.querySelector('.rc'))a.insertAdjacentHTML('beforeend',`<button class="rc" data-rcq aria-label="${T('Recite from memory','تسميع الحفظ')}"><i class="ph ph-microphone"></i></button>`)}
qhEntry();
document.addEventListener('click',e=>{
 const q=e.target.closest('[data-rcq]');if(q){e.preventDefault();e.stopPropagation();const l=S.qLast||{su:2,ay:255};qOpen(l.su+':'+l.ay);const want=l.su,ay=l.ay;
  const wait=()=>RQ.su===want&&$('a'+ay)?startSheet(ay):setTimeout(wait,120);setTimeout(wait,150);return}
 const b=e.target.closest('#rdB [data-rc]');if(b){e.preventDefault();e.stopPropagation();if(RUN)return;let from=1;
  if(b.dataset.rc==='here')from=+b.closest('.ra').dataset.n;else{const top=$$('#rdB .ra').find(el=>el.getBoundingClientRect().bottom>120);from=top&&scrollY>200?+top.dataset.n:1}
  $$('#rdB .ra.sel').forEach(x=>{x.classList.remove('sel');x.querySelector('.rac')?.remove()});clearMarks();startSheet(from);return}
 /* while reciting with hidden ayat, a tap on an ayah peeks at it for 3 seconds */
 const ra=e.target.closest('#rdB.rc-on .ra.rc-in');if(ra){e.preventDefault();e.stopPropagation();if($('rdB').classList.contains('rc-hide')){ra.classList.add('peek');clearTimeout(ra._pk);ra._pk=setTimeout(()=>ra.classList.remove('peek'),3000)}return}},true);
/* stop when the reader leaves the page or the app goes to the background */
new MutationObserver(()=>{if(RUN&&!$('s-read').classList.contains('on'))stop(true).then(()=>{clearMarks();toast(T('Recitation stopped','توقف التسميع'))})}).observe($('s-read'),{attributes:true,attributeFilter:['class']});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&RUN)stop()});
window.FQRC={startSheet,stop,state:()=>RUN};
})();
