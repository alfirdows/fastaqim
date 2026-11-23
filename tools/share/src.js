/* Fastaqim share + daily wird (23 Nov 2026).
   1) Daily wird page: today's Qur'an portion (whole pages, so no ayah is ever cut) + the du'as the owner chose.
   2) One share sheet for any ayah, dhikr or the daily card: picture (drawn here, Fastaqim's own design), text for WhatsApp, copy, family link.
   3) "Add to Saved" puts an ayah or dhikr into the Saved tool.
   Own file so other work on index.html never overwrites it. (c) Fastaqim, all rights reserved. */
(function(){'use strict';
const X=(en,ar,om,so)=>L==='ar'?ar:(LI===0&&om)?om:(LI===1&&so)?so:(LI>=0&&typeof DICT==='object'&&DICT[en])?DICT[en][LI]:en;
const IS_NEXT=/\/next\//.test(location.pathname);
/* links point to the page you are on (the preview while testing, the main site once live) */
const SITE=/github\.io$/.test(location.hostname)?new URL('.',location.href).href:'https://alfirdows.github.io/fastaqim/';
const ARD=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const N=n=>L==='ar'?ARD(n):String(n);
const BACK=`<button class="ib" data-back aria-label="${X('Back','رجوع','Duubatti','Dib u noqo')}"><i class="ph ph-caret-left flip"></i></button>`;
const LIB=/*LIB*/[];
const SIZES=[['p1',1],['p2',2],['p5',5],['p10',10],['j',0]];
const sizeName=z=>({p1:X('1 page a day','صفحة واحدة يوميًا','Fuula 1 guyyaatti','1 bog maalintii'),p2:X('2 pages a day','صفحتان يوميًا','Fuula 2 guyyaatti','2 bog maalintii'),p5:X('5 pages a day','٥ صفحات يوميًا','Fuula 5 guyyaatti','5 bog maalintii'),p10:X('10 pages a day','١٠ صفحات يوميًا','Fuula 10 guyyaatti','10 bog maalintii'),j:X('1 juz a day','جزء واحد يوميًا','Juz 1 guyyaatti','1 juz maalintii')})[z]||z;
const DEF={s:'2026-11-23',z:'p2',d:['q17-24','q2-201','m2721','t2140'],c:[]};

/* ---------------- owner ---------------- */
let OWN={u:null,v:false};
async function isOwner(){if(IS_NEXT&&P.get('wo')==='1')return true;const u=window.FQA&&FQA.user();if(!u)return false;if(OWN.u===u.id)return OWN.v;
 try{const sb=await FQA.sb();const r=await sb.rpc('is_admin');OWN={u:u.id,v:!r.error&&r.data===true}}catch(e){OWN={u:u.id,v:false}}return OWN.v}
if(window.FQA&&FQA.on)FQA.on(()=>{OWN.u=null;if($('s-wird')&&$('s-wird').classList.contains('on'))R.wird()});

/* ---------------- the plan ---------------- */
const fromLink=()=>S.wirdF&&S.wirdF.s?S.wirdF:null;
function plan(own){return (own&&S.wird)||(!own&&fromLink())||S.wird||DEF}
const enc=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const dec=s=>{try{return JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/')))))}catch(e){return null}};
const link=p=>SITE+'?wird='+enc({s:p.s,z:p.z,d:p.d,c:p.c||[],n:p.n||''})+'#wird';
const dayN=s=>Math.round((new Date(dkey(NOW())+'T12:00:00')-new Date(s+'T12:00:00'))/864e5);
const prevAy=([s,a])=>a>1?[s,a-1]:[s-1,SU[s-2][2]];
async function portion(p){const M=await qMeta();if(!M)return null;const n=(SIZES.find(x=>x[0]===p.z)||SIZES[1])[1];
 const d=dayN(p.s),total=n?Math.ceil(604/n):30,i=d<0?0:d%total,round=d<0?0:Math.floor(d/total);
 const pageOf=([s,a])=>{let k=0;for(let j=0;j<604;j++){const q=M.page[j];if(q[0]<s||(q[0]===s&&q[1]<=a))k=j;else break}return k+1};
 let a,b,st,en;
 if(n){a=i*n+1;b=Math.min(604,a+n-1);st=M.page[a-1];en=b<604?prevAy(M.page[b]):[114,6]}
 else{st=M.juz[i];en=i<29?prevAy(M.juz[i+1]):[114,6];a=pageOf(st);b=pageOf(en)}
 return{day:d<0?1:i+1,total,round,early:d<0,a,b,st,en,juz:n?null:i+1}}
const rangeHTML=po=>rangeTxt(po).split(' – ').map(x=>`<span class="fqw-nw">${esc(x)}</span>`).join(' – ');
const rangeTxt=po=>{const [s1,a1]=po.st,[s2,a2]=po.en;
 return s1===s2?suName(s1)+' '+N(s1)+':'+N(a1)+(a1!==a2?'–'+N(a2):''):suName(s1)+' '+N(s1)+':'+N(a1)+' – '+suName(s2)+' '+N(s2)+':'+N(a2)};
const pagesTxt=po=>po.a===po.b?X('Page '+po.a,'الصفحة '+ARD(po.a),'Fuula '+po.a,'Bogga '+po.a):X('Pages '+po.a+'–'+po.b,'الصفحات '+ARD(po.a)+'–'+ARD(po.b),'Fuula '+po.a+'–'+po.b,'Bogagga '+po.a+'–'+po.b);
const bigTxt=po=>po.juz?X('Juz '+po.juz,'الجزء '+ARD(po.juz),'Juz '+po.juz,'Juz '+po.juz):pagesTxt(po);
const qcUrl=po=>po.st[0]===po.en[0]?'https://quran.com/'+po.st[0]+'/'+po.st[1]+'-'+po.en[1]:'https://quran.com/page/'+po.a;
const dateLine=()=>{const d=NOW();let g;try{g=d.toLocaleDateString(L==='ar'?'ar':(LI>=0?LX:'en-US'),{weekday:'long',day:'numeric',month:'long'})}catch(e){g=d.toDateString()}
 let h='';try{const p=hParts(d);h=(L==='ar'?ARD(p.d):p.d)+' '+hms(p.m)+' '+(L==='ar'?ARD(p.y):p.y)}catch(e){h=hijri(d,{day:'numeric',month:'long',year:'numeric'})}return g+(h?' · '+h:'')};

/* du'as: library + the adhkar sets already on the site + the owner's own */
const hash=s=>{let h=5381;for(const c of s)h=(h*33+c.charCodeAt(0))|0;return (h>>>0).toString(36)};
const plain=h=>String(h||'').replace(/<span class="a[nm]">([^<]*)<\/span>/g,' $1').replace(/<br\s*\/?>/g,'\n').replace(/<\/p>/g,'\n').replace(/<[^>]+>/g,'').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{2,}/g,'\n').trim();
function zkLib(){const out=[];const sets=[['dua',X("Du'as for worry",'أدعية الهمّ')],['morning',X('Morning adhkar','أذكار الصباح')],['evening',X('Evening adhkar','أذكار المساء')],['sleep',X('Before sleep','أذكار النوم')]];
 sets.forEach(([k,g])=>{const z=typeof ZK==='object'&&ZK[k];if(!z)return;z.items.forEach(it=>{if(it.q||it._qk||!it.src)return;const ar=plain(it.ar);if(ar.length<14)return;const id='z'+hash(ar);if(out.some(x=>x.id===id))return;
  out.push({id,ar,en:it._en||it.me||'',src:it.src,g})})});return out}
function libAll(){return LIB.concat(zkLib())}
function duaOf(id,p){if(/^c\d+$/.test(id)){const c=(p.c||[])[+id.slice(1)];return c?{id,ar:c.ar||'',en:c.me||'',own:1}:null}return libAll().find(x=>x.id===id)||null}
const duaMe=d=>L==='ar'?'':(d.en||'');
const isQ=d=>!!d.qk;
const srcOf=d=>d.src?(L==='ar'&&d.sa?d.sa:d.src[0]):'';

/* ---------------- picture card (canvas) ---------------- */
const C={bg:'#fbf9f4',card:'#ffffff',line:'#ece6da',ink:'#24231f',sub:'#6e6b63',acc:'#2e6b32',gold:'#b8955a',goldL:'#e8d3a5',goldD:'#86672e',track:'#efe7d6'};
const LAT='Inter,-apple-system,"Segoe UI",Roboto,sans-serif',ARF='Plex,Inter,sans-serif';
async function fontsReady(txt){try{await Promise.all(['48px "FQ Quran"','600 44px Plex','700 44px Plex','400 30px Inter','700 40px Inter','800 40px Inter'].map(f=>document.fonts.load(f,txt||'بسم abc')))}catch(e){}}
function wrapAr(ctx,par,maxW){/* whole phrases first: a phrase ends at ، , ؛ . or a waqf sign */
 const ph=[];let cur=[];par.split(/\s+/).filter(Boolean).forEach((w,i,arr)=>{cur.push(w);const nx=arr[i+1]||'';if(/[،,؛;.]$/.test(w)||/^[ۚۖۗۛۙ]$/.test(nx)===false&&/[ۚۖۗۛۙ]$/.test(w)||/^[ۚۖۗۛۙ]$/.test(w)){ph.push(cur.join(' '));cur=[]}});if(cur.length)ph.push(cur.join(' '));
 if(ph.length<2)return null;const ls=[];let ln='';for(const x of ph){if(ctx.measureText(x).width>maxW)return null;const t=ln?ln+' '+x:x;if(ln&&ctx.measureText(t).width>maxW){ls.push(ln);ln=x}else ln=t}if(ln)ls.push(ln);return ls}
function wrap(ctx,text,maxW){const out=[];String(text).split('\n').forEach(par=>{
  if(/[\u0600-\u06FF]/.test(par)){const pa=wrapAr(ctx,par,maxW);if(pa){out.push(...pa);return}}const w=par.split(/\s+/).filter(Boolean);if(!w.length)return;
  const greedy=lim=>{const ls=[];let cur='';w.forEach(x=>{const t=cur?cur+' '+x:x;if(cur&&ctx.measureText(t).width>lim){ls.push(cur);cur=x}else cur=t});if(cur)ls.push(cur);return ls};
  let ls=greedy(maxW);if(ls.length>1){const tot=ctx.measureText(par).width,lim=Math.min(maxW,tot/ls.length*1.12);const b=greedy(lim);if(b.length===ls.length)ls=b}
  /* prefer a break right after a pause (، , ۚ ۖ ۗ ؛ .) when it keeps the line at least 60% full */
  for(let i=0;i<ls.length-1;i++){const ws=ls[i].split(' ');for(let j=ws.length-2;j>=Math.ceil(ws.length*.6)-1&&j>0;j--){if(/[،,؛;.ۚۖۗۛ]$/.test(ws[j])||/^[ۚۖۗۛ]$/.test(ws[j+1]||'')){const keep=ws.slice(0,j+1).join(' '),move=ws.slice(j+1).join(' ');const nxt=move+' '+ls[i+1];if(ctx.measureText(nxt).width<=maxW){ls[i]=keep;ls[i+1]=nxt}break}}}
  /* never leave one word alone on the last line */
  if(ls.length>1&&ls[ls.length-1].split(' ').length===1){const ws=ls[ls.length-2].split(' ');if(ws.length>2){const mv=ws.pop();const t=mv+' '+ls[ls.length-1];if(ctx.measureText(t).width<=maxW){ls[ls.length-2]=ws.join(' ');ls[ls.length-1]=t}}}
  out.push(...ls)});return out}
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
/* o: {kick, title, sub, prog:[day,total], blocks:[{ar,q,me,src,rep}], foot} */
function drawCard(cv,o){const W=1080,M=48,PX=96,IW=W-2*PX,rtl=L==='ar';const ctx=cv.getContext('2d');let y=0;
 const dry=!cv._real;const T2=(t,x,yy,font,col,al)=>{if(dry)return;ctx.font=font;ctx.fillStyle=col;ctx.textAlign=al||'center';ctx.direction=/[؀-ۿ]/.test(t)?'rtl':'ltr';ctx.fillText(t,x,yy)};
 const para=(t,font,col,lh,al)=>{ctx.font=font;ctx.direction=/[؀-ۿ]/.test(t)?'rtl':'ltr';const ls=wrap(ctx,t,IW);ls.forEach(l=>{y+=lh;T2(l,al==='start'?(rtl?W-PX:PX):W/2,y-lh*.28,font,col,al==='start'?(rtl?'right':'left'):'center')});return ls.length};
 if(!dry){ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,cv.height);ctx.save();ctx.shadowColor='rgba(60,50,20,.08)';ctx.shadowBlur=30;ctx.shadowOffsetY=8;rr(ctx,M,M,W-2*M,cv.height-2*M,44);ctx.fillStyle=C.card;ctx.fill();ctx.restore();
  rr(ctx,M,M,W-2*M,cv.height-2*M,44);ctx.strokeStyle=C.line;ctx.lineWidth=2;ctx.stroke()}
 /* header: own mark + name + date */
 y=M+70;const mx=rtl?W-PX-56:PX;
 if(!dry){rr(ctx,mx,y-28,56,56,14);ctx.fillStyle=C.acc;ctx.fill();rr(ctx,mx+2,y-26,52,52,12);ctx.strokeStyle='#d2b47a';ctx.lineWidth=3;ctx.stroke();rr(ctx,mx+12,y-2,32,4,2);ctx.fillStyle=C.goldL;ctx.fill()}
 T2(rtl?'فاستقم':'Fastaqim',rtl?W-PX-76:PX+76,y+12,rtl?'700 40px '+ARF:'800 38px '+LAT,C.ink,rtl?'right':'left');
 y+=74;ctx.font='400 26px '+(rtl?ARF:LAT);const dl=wrap(ctx,dateLine(),IW);dl.forEach(l=>{T2(l,rtl?W-PX:PX,y,'400 26px '+(rtl?ARF:LAT),C.sub,rtl?'right':'left');y+=36});
 /* horizon: line + rising arc (progress when there is a plan) */
 y+=o.prog?150:70;const cx=W/2,R0=o.prog?118:46;
 if(!dry){ctx.strokeStyle=C.line;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(M+40,y);ctx.lineTo(W-M-40,y);ctx.stroke();
  ctx.lineCap='round';ctx.lineWidth=o.prog?12:8;ctx.strokeStyle=C.track;ctx.beginPath();ctx.arc(cx,y-4,R0,Math.PI,2*Math.PI);ctx.stroke();
  const f=o.prog?Math.max(.02,o.prog[0]/o.prog[1]):1;const g=ctx.createLinearGradient(cx-R0,0,cx+R0,0);g.addColorStop(0,C.acc);g.addColorStop(1,C.gold);ctx.strokeStyle=o.prog?g:C.gold;ctx.beginPath();ctx.arc(cx,y-4,R0,Math.PI,Math.PI+Math.PI*f);ctx.stroke();ctx.lineCap='butt';
  if(o.prog){T2(N(o.prog[0]),cx,y-46,'700 56px '+(rtl?ARF:LAT),C.ink);T2(X('day of '+o.prog[1],'يوم من '+ARD(o.prog[1]),'guyyaa '+o.prog[1]+' keessaa','maalin '+o.prog[1]+' ka mid ah'),cx,y-12,'400 22px '+(rtl?ARF:LAT),C.sub)}}
 y+=56+(o._pad||0);
 if(o.kick){T2(o.kick,W/2,y,'700 24px '+(rtl?ARF:LAT),C.goldD);y+=20}
 if(o.title){y+=10;para(o.title,'700 52px '+(rtl?ARF:LAT),C.ink,66)}
 if(o.sub){para(o.sub,'500 30px '+(rtl?ARF:LAT),C.sub,44)}
 if(o.sub||o.title)y+=24;
 (o.blocks||[]).forEach((b,k)=>{
  if(k||o.title){y+=28;if(!dry){ctx.strokeStyle=C.line;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(PX+120,y);ctx.lineTo(W-PX-120,y);ctx.stroke()}y+=30}
  if(b.label){T2(b.label,W/2,y+26,'700 24px '+(rtl?ARF:LAT),C.goldD);y+=50}
  para(b.ar,b.q?'46px "FQ Quran"':'600 42px '+ARF,C.ink,b.q?92:74);
  if(b.me){y+=14;para(b.me,'400 29px '+LAT,'#4a4842',44)}
  if(b.rep){y+=6;para(b.rep,'500 25px '+(rtl?ARF:LAT),C.sub,38)}
  if(b.src){y+=10;para(b.src,'600 25px '+(rtl?ARF:LAT),C.acc,38)}});
 y+=60+(o._pad||0);if(!dry){ctx.strokeStyle=C.line;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(M+40,y);ctx.lineTo(W-M-40,y);ctx.stroke()}
 y+=56;T2(o.foot||'alfirdows.github.io/fastaqim',W/2,y,'500 25px '+LAT,C.sub);y+=M+44;return y}
async function cardBlob(o){await fontsReady(JSON.stringify(o).slice(0,400));const cv=document.createElement('canvas');cv.width=1080;cv.height=10;cv.setAttribute('dir',L==='ar'?'rtl':'ltr');cv.style.cssText='position:fixed;left:-9999px;top:0';document.body.appendChild(cv);
 o=Object.assign({},o,{_pad:0});let h=drawCard(cv,o);if(h<1350){o._pad=Math.round((1350-h)/3);h=1350}cv.height=h;cv._real=1;drawCard(cv,o);const bl=await new Promise(r=>cv.toBlob(r,'image/png'));cv.remove();return bl}

/* ---------------- share sheet ---------------- */
/* it: {kind:'ayah'|'dhikr'|'wird', card:{...}, text:'', saveT, saveN, link} */
let LASTURL=null;
async function shareSheet(it){vib(8);
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Share','مشاركة','Qooduu','La wadaag')}</h1>${XB}</div>
  <div class="fqs-prev" id="fqsPrev"><div class="fqs-ld"><i class="ph ph-circle-notch"></i></div></div>
  <button class="fqs-main" id="fqsPic"><i class="ph ph-image"></i>${X('Share picture','مشاركة الصورة','Suuraa qoodi','La wadaag sawirka')}</button>
  <div class="fqs-row"><button id="fqsTxt"><i class="ph ph-chat-text"></i>${X('Send as text','إرسال كنص','Akka barreeffamaatti ergi','U dir qoraal ahaan')}</button><button id="fqsCp"><i class="ph ph-copy"></i>${X('Copy text','نسخ النص','Barreeffama garagalchi','Koobiyee qoraalka')}</button></div>
  <div class="fqs-row">${it.link?`<button id="fqsLk"><i class="ph ph-link-simple"></i>${X('Copy family link','نسخ رابط العائلة','Liinkii maatii garagalchi','Koobiyee xiriirka qoyska')}</button>`:''}${it.saveT?`<button id="fqsSv"><i class="ph ph-bookmarks-simple"></i>${X('Add to Saved','أضف إلى المحفوظ','Kan olkaa’e keessa kaa’i','Ku dar La kaydiyay')}</button>`:''}<button id="fqsDl"><i class="ph ph-download-simple"></i>${X('Save picture','حفظ الصورة','Suuraa olkaa’i','Kaydi sawirka')}</button></div>
  <p class="fqs-tip">${X('On iPhone: Share picture, then Save Image puts it in Photos.','على الآيفون: مشاركة الصورة ثم «حفظ الصورة» تضعها في الصور.','iPhone irratti: Suuraa qoodi, achiis Save Image.','iPhone-ka: La wadaag sawirka, kadibna Save Image.')}</p>`);
 const sh=$('sh');sh.classList.add('fqs-sh');
 let blob=null;const fname='fastaqim-'+(it.kind||'card')+'-'+dkey(NOW())+'.png';
 const ready=cardBlob(it.card).then(b=>{blob=b;if(LASTURL)URL.revokeObjectURL(LASTURL);LASTURL=URL.createObjectURL(b);const pv=$('fqsPrev');if(pv)pv.innerHTML=`<img src="${LASTURL}" alt="${esc(X('Picture to share','الصورة للمشاركة'))}">`;return b}).catch(e=>{console.warn(e);const pv=$('fqsPrev');if(pv)pv.innerHTML=`<p class="note">${X("Couldn't make the picture. You can still send it as text.",'تعذّر إنشاء الصورة. يمكنك الإرسال كنص.')}</p>`});
 const file=async()=>{const b=blob||await ready;return b?new File([b],fname,{type:'image/png'}):null};
 const dl=async()=>{const b=blob||await ready;if(!b)return;const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=fname;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)};
 $('fqsPic').onclick=async()=>{const f=await file();if(!f)return;try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f]});return}}catch(e){if(e&&e.name==='AbortError')return}await dl();toast(X('Picture saved to Downloads','حُفظت الصورة في التنزيلات'))};
 $('fqsTxt').onclick=async()=>{try{if(navigator.share){await navigator.share({text:it.text});return}}catch(e){if(e&&e.name==='AbortError')return}location.href='https://wa.me/?text='+encodeURIComponent(it.text)};
 $('fqsCp').onclick=async()=>{try{await navigator.clipboard.writeText(it.text);vib(10);toast(X('Copied','تم النسخ','Garagalfameera','Waa la koobiyeeyay'))}catch(e){toast(X('Could not copy','تعذّر النسخ'))}};
 $('fqsDl').onclick=async()=>{const f=await file();if(!f)return;try{if(navigator.canShare&&navigator.canShare({files:[f]})&&/iP(hone|ad|od)/.test(navigator.userAgent)){await navigator.share({files:[f]});return}}catch(e){if(e&&e.name==='AbortError')return}await dl()};
 if($('fqsLk'))$('fqsLk').onclick=async()=>{try{await navigator.clipboard.writeText(it.link);vib(10);toast(X('Link copied','تم نسخ الرابط','Liinkiin garagalfameera','Xiriirka waa la koobiyeeyay'))}catch(e){toast(X('Could not copy','تعذّر النسخ'))}};
 if($('fqsSv'))$('fqsSv').onclick=()=>{addSaved(it.saveT,it.saveN);closeSheet()}}
function addSaved(t,n){const items=tItems('saved');if(items.some(x=>x.t===t&&x.n===n)){toast(X('Already in Saved','موجود في المحفوظ'));return}
 const x={id:Date.now(),t,n};items.unshift(x);save();vib([10,30,10]);
 const undo=()=>{const i=items.indexOf(x);if(i>=0){items.splice(i,1);save()}};
 if(typeof undoToast==='function')undoToast(X('Added to Saved','أُضيف إلى المحفوظ','Kan olkaa’e keessa kaa’ame','Waa lagu daray La kaydiyay'),undo);else toast(X('Added to Saved','أُضيف إلى المحفوظ'))}
window.FQS={shareSheet,cardBlob,addSaved};

/* ---------------- builders ---------------- */
const srcLine=s=>s?s[0]+' · '+s[1]:'';
async function ayahItem(su,n){const d=RQ.c[su];if(!d)return null;const [a,en]=d.v[n-1];let me=en;
 if(L==='ar')me='';else if(LI>=0){try{const mt=await qTrCh(su);if(mt&&mt[n-1])me=mt[n-1]}catch(e){}}
 const ref=X("Qur'an, Surah "+SU[su-1][0]+' '+su+':'+n,'القرآن، سورة '+SU[su-1][1]+' '+ARD(su)+':'+ARD(n)),url='https://quran.com/'+su+'/'+n;
 return{kind:'ayah',card:{kick:X('AYAH','آية','AAYAA','AAYAD'),blocks:[{ar:a+' '+ARD(n),q:1,me,src:ref}]},
  text:a+' ﴿'+ARD(n)+'﴾\n\n'+(me?me+'\n\n':'')+ref+'\n'+url+'\n\n'+X('Shared from Fastaqim','من فاستقم')+': '+SITE,
  saveT:ref,saveN:a+'\n\n'+(me?me+'\n':'')+url}}
function dhikrItem(set,i){const z=ZK[set];if(!z)return null;const it=z.items[i];if(!it)return null;const ar=plain(it.ar),me=L==='ar'?'':(it.me||''),src=it.src||null;
 const rep=it.n>1?X('Say it '+it.n+' times','يُقال '+ARD(it.n)+' مرات','Yeroo '+it.n+' jedhi',it.n+' jeer dheh'):'';
 const title=z.t+' · '+X('Dhikr '+(i+1),'الذكر '+ARD(i+1),'Zikrii '+(i+1),'Dhikr '+(i+1));
 return{kind:'dhikr',card:{kick:String(z.t).toUpperCase(),blocks:[{ar,q:!!(it.q||it._qk),me,rep,src:src?src[0]:''}]},
  text:ar+'\n\n'+(me?me+'\n\n':'')+(rep?rep+'\n':'')+(src?src[0]+'\n'+src[1]+'\n':'')+'\n'+X('Shared from Fastaqim','من فاستقم')+': '+SITE,
  saveT:title,saveN:ar+'\n\n'+(me?me+'\n':'')+(src?src[0]+' '+src[1]:'')}}
async function wirdItem(p){const po=await portion(p);if(!po)return null;const ds=(p.d||[]).map(id=>duaOf(id,p)).filter(Boolean);
 const big=bigTxt(po),rg=rangeTxt(po);
 const blocks=ds.map((d,k)=>({label:k?'':X("DU'AS FOR TODAY",'أدعية اليوم',"KADHANNAA HAR'AA","DUCOOYINKA MAANTA"),ar:d.ar,q:isQ(d),me:duaMe(d),src:srcOf(d)}));
 if(p.n)blocks.unshift({label:X('A NOTE','تذكير','YAADACHIISA','XUSUUSIN'),ar:p.n,q:0});
 const lines=[`*${X('Fastaqim · Daily wird','فاستقم · الورد اليومي','Fastaqim · Wirdii guyyaa','Fastaqim · Wirdiga maalinta')}*`,dateLine(),'',`*${X("Today's Qur'an",'قرآن اليوم',"Qur'aana har'aa","Qur'aanka maanta")}* (${X('day '+po.day+' of '+po.total,'اليوم '+ARD(po.day)+' من '+ARD(po.total),'guyyaa '+po.day+'/'+po.total,'maalinta '+po.day+'/'+po.total)})`,big+' · '+rg,qcUrl(po)];
 if(p.n)lines.push('',p.n);
 if(ds.length){lines.push('',`*${X("Du'as for today",'أدعية اليوم',"Kadhannaa har'aa",'Ducooyinka maanta')}*`);ds.forEach((d,k)=>{lines.push('',(k+1)+'. '+(isQ(d)?d.ar.replace(/ ([٠-٩]+)(?= |$)/g,' ﴿$1﴾'):d.ar));const m=duaMe(d);if(m)lines.push(m);if(d.src)lines.push(d.src[0]+' '+d.src[1])})}
 const lk=link(p);lines.push('',X('Read with us every day','اقرأ معنا كل يوم','Guyyaa guyyaan nu waliin dubbisi','Maalin kasta nala akhri')+': '+lk);
 return{kind:'wird',po,ds,link:lk,card:{prog:[po.day,po.total],kick:X("TODAY'S QUR'AN",'ورد اليوم',"QUR'AANA HAR'AA","QUR'AANKA MAANTA"),title:big,sub:rg,blocks},text:lines.join('\n')}}

/* ---------------- incoming family link ---------------- */
{const w=P.get('wird');if(w){const o=dec(w);if(o&&/^\d{4}-\d\d-\d\d$/.test(o.s||'')){S.wirdF={s:o.s,z:o.z,d:(o.d||[]).slice(0,12),c:(o.c||[]).slice(0,6).map(c=>({ar:String(c.ar||'').slice(0,600),me:String(c.me||'').slice(0,600)})),n:String(o.n||'').slice(0,300),at:Date.now()};save()}}}

/* ---------------- the Daily wird page ---------------- */
function addScreen(id,html,tab){if($('s-'+id))return;const last=$$('.scr');last[last.length-1].insertAdjacentHTML('afterend',`<section class="scr" id="s-${id}">${html}</section>`);TABOF[id]=tab||'quran'}
addScreen('wird',`<div class="hd sub">${BACK}<h1>${X('Daily wird','الورد اليومي','Wirdii guyyaa','Wirdiga maalinta')}</h1><span id="fqwEd" class="fqw-ed"></span></div><div id="fqwB"></div>`,'quran');
let WI=null;
R.wird=async()=>{const B=$('fqwB');if(!B)return;const own=await isOwner(),p=plan(own);
 $('fqwEd').innerHTML=own?`<button class="ib" id="fqwEdit" aria-label="${X('Change plan and du\'as','تعديل الخطة والأدعية')}"><i class="ph ph-pencil-simple-line"></i></button>`:'<span style="width:44px;display:inline-block"></span>';
 if($('fqwEdit'))$('fqwEdit').onclick=()=>editSheet();
 const it=await wirdItem(p);if(!it){B.innerHTML=`<div class="rerr"><p>${X("Couldn't load. Check your internet and try again.",'تعذّر التحميل. تحقق من الإنترنت وحاول مجددًا.')}</p></div>`;return}WI=it;const po=it.po;
 const doneK='wird-'+dkey(NOW()),done=!!(S.wirdDone||{})[dkey(NOW())];
 B.innerHTML=`<div class="fqw-hero">
   <p class="fqw-date">${esc(dateLine())}</p>
   <div class="fqw-arc">${window.FQ&&FQ.arc?FQ.arc(po.day,po.total,{w:132,label:N(po.day)}):''}<small>${X('day '+po.day+' of '+po.total,'اليوم '+ARD(po.day)+' من '+ARD(po.total),'guyyaa '+po.day+' / '+po.total,'maalinta '+po.day+' / '+po.total)}</small></div>
   <p class="fqw-k">${X("Today's Qur'an",'ورد اليوم',"Qur'aana har'aa","Qur'aanka maanta")}</p>
   <h2 class="fqw-big">${esc(bigTxt(po))}</h2>
   <p class="fqw-rg">${esc(rangeTxt(po))}${po.juz?'':' · '+X('Juz '+(qJuzOf(po)),'الجزء '+ARD(qJuzOf(po)),'Juz '+qJuzOf(po),'Juz '+qJuzOf(po))}</p>
   ${po.early?`<p class="fqw-early">${X('The plan starts on '+new Date(p.s+'T12:00:00').toLocaleDateString('en-US',{day:'numeric',month:'long'})+'. You can read ahead.','تبدأ الخطة في '+new Date(p.s+'T12:00:00').toLocaleDateString('ar',{day:'numeric',month:'long'})+'. يمكنك القراءة مسبقًا.')}</p>`:''}
   ${po.round?`<p class="fqw-early">${X('Khatmah '+(po.round+1)+'. May Allah accept it.','الختمة '+ARD(po.round+1)+'. تقبّل الله منا ومنكم.')}</p>`:''}
   <div class="fqw-act"><button class="fqs-main" id="fqwRead"><i class="ph ph-book-open-text"></i>${X('Read now','اقرأ الآن','Amma dubbisi','Hadda akhri')}</button>
   <button class="fqw-done ${done?'on':''}" id="fqwDone" aria-pressed="${done}"><i class="ph ${done?'ph-check-circle':'ph-circle'}"></i>${done?X('Read today','قرأتُ اليوم',"Har'a dubbiseera",'Maanta waan akhriyay'):X('Mark as read','تمّت القراءة','Akka dubbifametti mallatteessi','U calaamadee akhriyay')}</button></div>
   <a class="fqw-qc" href="${qcUrl(po)}" target="_blank" rel="noopener">${X('Open on Quran.com','افتح في Quran.com','Quran.com irratti bani','Ka fur Quran.com')} ↗</a></div>
  ${p.n?`<p class="glh">${X('A note','تذكير','Yaadachiisa','Xusuusin')}</p><div class="kh fqw-note" dir="auto">${esc(p.n)}</div>`:''}
  ${it.ds.length?`<p class="glh">${X("Du'as for today",'أدعية اليوم',"Kadhannaa har'aa",'Ducooyinka maanta')}</p>`+it.ds.map((d,k)=>`<div class="fqw-dua">
    <div class="za ${isQ(d)?'':'h'}" lang="ar" dir="rtl">${esc(d.ar)}</div>${duaMe(d)?`<p class="zm">${esc(duaMe(d))}</p>`:''}
    <div class="fqw-src">${d.src?`<a href="${d.src[1]}" target="_blank" rel="noopener">${esc(srcOf(d))} ↗</a>`:`<span>${X("Personal du'a",'دعاء شخصي','Kadhannaa dhuunfaa','Duco shakhsi ah')}</span>`}<button class="fqw-one" data-fqd="${k}" aria-label="${X('Share this du\'a','شارك هذا الدعاء')}"><i class="ph ph-share-network"></i></button></div></div>`).join(''):''}
  <button class="fqs-main fqw-share" id="fqwShare"><i class="ph ph-share-network"></i>${X("Share today's card",'شارك بطاقة اليوم',"Kaardii har'aa qoodi",'La wadaag kaarka maanta')}</button>
  <p class="note fqp-c">${own?X('Only you can change the plan and du\'as. Your family gets the same card from your link, and it updates by itself each day.','أنت فقط من يغيّر الخطة والأدعية. تصل عائلتك نفس البطاقة من رابطك، وتتجدد تلقائيًا كل يوم.'):fromLink()?X("This plan came from your family's link. It moves to the next portion by itself each day.",'هذه الخطة من رابط عائلتك، وتنتقل إلى الورد التالي تلقائيًا كل يوم.'):X('Read along with everyone using Fastaqim. It moves to the next portion by itself each day.','اقرأ مع مستخدمي فاستقم، وينتقل الورد تلقائيًا كل يوم.')}</p>`;
 try{readFmt(B)}catch(e){}
 $('fqwRead').onclick=()=>{RD={su:po.st[0],ay:po.st[1],scroll:true};go('read')};
 $('fqwDone').onclick=()=>{S.wirdDone=S.wirdDone||{};const k=dkey(NOW());if(S.wirdDone[k]){delete S.wirdDone[k];if(S.starLog&&S.starLog[doneK]){delete S.starLog[doneK];S.stars=Math.max(0,(S.stars||0)-1)}}else{S.wirdDone[k]=1;try{if(typeof star==='function')star(doneK,X("Today's wird read",'قرأتُ ورد اليوم'))}catch(e){}vib([12,30,12])}save();R.wird()};
 $('fqwShare').onclick=()=>shareSheet(it);
 $$('#fqwB [data-fqd]').forEach(b=>b.onclick=()=>{const d=it.ds[+b.dataset.fqd];const t=d.ar+'\n\n'+(duaMe(d)?duaMe(d)+'\n\n':'')+(d.src?d.src[0]+'\n'+d.src[1]+'\n\n':'')+X('Shared from Fastaqim','من فاستقم')+': '+SITE;
  shareSheet({kind:'dua',card:{kick:X("DU'A",'دعاء','KADHANNAA','DUCO'),blocks:[{ar:d.ar,q:isQ(d),me:duaMe(d),src:srcOf(d)}]},text:t,saveT:d.src?d.src[0]:X("Du'a",'دعاء'),saveN:d.ar+'\n\n'+(duaMe(d)?duaMe(d)+'\n':'')+(d.src?d.src[1]:'')})})};
function qJuzOf(po){const d=RQ.c[po.st[0]];if(d&&d.j)return d.j[po.st[1]-1];try{const M=QMETA;let k=1;M.juz.forEach((q,i)=>{if(q[0]<po.st[0]||(q[0]===po.st[0]&&q[1]<=po.st[1]))k=i+1});return k}catch(e){return 1}}

/* ---------------- owner: change plan + du'as ---------------- */
function editSheet(){const p=JSON.parse(JSON.stringify(S.wird||DEF));p.c=p.c||[];p.d=p.d||[];
 const draw=()=>{const lib=libAll();const chosen=p.d.map(id=>duaOf(id,p)).filter(Boolean);
  const grp={};lib.forEach(d=>{const g=d.qk?X("From the Qur'an",'من القرآن'):d.g||X('From the Sunnah','من السنة');(grp[g]=grp[g]||[]).push(d)});
  openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Plan and du\'as','الخطة والأدعية')}</h1>${XB}</div>
  <p class="glh">${X('How much each day','المقدار اليومي')}</p><div class="kh fqw-sz">${SIZES.map(([z])=>`<button class="${p.z===z?'on':''}" data-z="${z}">${sizeName(z)}</button>`).join('')}</div>
  <p class="glh">${X('Start date','تاريخ البدء')}</p><div class="kh"><input type="date" id="fqwS" value="${esc(p.s)}" class="fqw-in"><small class="note">${X('Day 1 is the first portion of the Qur\'an. After the last portion it starts again.','اليوم الأول هو أول ورد في القرآن، وبعد آخر ورد تبدأ الخطة من جديد.')}</small></div>
  <p class="glh">${X("Du'as every day",'الأدعية اليومية')} · ${N(chosen.length)}</p>
  <div class="kh fqw-ch">${chosen.length?chosen.map((d,k)=>`<div class="fqw-cr"><span class="za ${isQ(d)?'':'h'}" dir="rtl">${esc(d.ar)}</span><span class="fqw-cb">${k?`<button data-up="${k}" aria-label="${X('Move up','للأعلى')}"><i class="ph ph-arrow-up"></i></button>`:''}<button data-rm="${k}" aria-label="${X('Remove','إزالة')}"><i class="ph ph-x"></i></button></span></div>`).join(''):`<p class="note">${X("No du'as yet. Pick from the list below.",'لا أدعية بعد. اختر من القائمة بالأسفل.')}</p>`}</div>
  <p class="glh">${X('Note for today (optional)','تذكير اليوم (اختياري)')}</p><div class="kh"><textarea id="fqwN" class="fqw-in" rows="2" maxlength="300" dir="auto" placeholder="${X('For example: please make du\'a for grandmother','مثال: ادعوا لجدّتي بالشفاء')}">${esc(p.n||'')}</textarea></div>
  <p class="glh">${X("Add your own du'a",'أضف دعاءك')}</p><div class="kh"><textarea id="fqwCA" class="fqw-in" rows="2" dir="rtl" lang="ar" placeholder="${X('Arabic text','النص العربي')}"></textarea>${L==='ar'?'':`<textarea id="fqwCM" class="fqw-in" rows="2" dir="auto" placeholder="${X('Meaning (optional)','المعنى (اختياري)')}"></textarea>`}<button class="chip" id="fqwCAdd"><i class="ph ph-plus"></i>${X('Add','إضافة')}</button></div>
  ${Object.keys(grp).map(g=>`<p class="glh">${esc(g)}</p><div class="kh fqw-lib">${grp[g].map(d=>{const on=p.d.includes(d.id);return `<button class="fqw-li ${on?'on':''}" data-id="${d.id}" aria-pressed="${on}"><span class="za ${d.qk?'':'h'}" dir="rtl">${esc(d.ar)}</span>${duaMe(d)?`<small>${esc(duaMe(d))}</small>`:''}<em>${esc(srcOf(d))}</em><i class="ph ${on?'ph-check-circle':'ph-plus-circle'}"></i></button>`}).join('')}</div>`).join('')}
  <div class="fqw-sv"><button class="fqs-main" id="fqwSave"><i class="ph ph-check"></i>${X('Save','حفظ')}</button></div>`);
  $('sh').classList.add('fqs-sh');
  const keep=()=>{p.s=$('fqwS').value||p.s;p.n=$('fqwN').value.trim()};
  $$('#sh [data-z]').forEach(b=>b.onclick=()=>{keep();p.z=b.dataset.z;draw()});
  $$('#sh [data-id]').forEach(b=>b.onclick=()=>{keep();const id=b.dataset.id,i=p.d.indexOf(id);if(i>=0)p.d.splice(i,1);else{if(p.d.length>=12){toast(X('Up to 12 du\'as','حتى ١٢ دعاءً'));return}p.d.push(id)}vib(8);const sc=$('sh').scrollTop;draw();$('sh').scrollTop=sc});
  $$('#sh [data-rm]').forEach(b=>b.onclick=()=>{keep();p.d.splice(+b.dataset.rm,1);const sc=$('sh').scrollTop;draw();$('sh').scrollTop=sc});
  $$('#sh [data-up]').forEach(b=>b.onclick=()=>{keep();const k=+b.dataset.up;[p.d[k-1],p.d[k]]=[p.d[k],p.d[k-1]];const sc=$('sh').scrollTop;draw();$('sh').scrollTop=sc});
  $('fqwCAdd').onclick=()=>{keep();const a=$('fqwCA').value.trim(),m=$('fqwCM')?$('fqwCM').value.trim():'';if(!a){toast(X("Write the du'a first",'اكتب الدعاء أولًا'));return}if(p.c.length>=6){toast(X("Up to 6 own du'as",'حتى ٦ أدعية خاصة'));return}p.c.push({ar:a.slice(0,600),me:m.slice(0,600)});p.d.push('c'+(p.c.length-1));vib(10);draw()};
  $('fqwSave').onclick=()=>{keep();/* drop own du'as that were removed, and renumber */const used=p.c.map((c,i)=>p.d.includes('c'+i));const map={};const nc=[];p.c.forEach((c,i)=>{if(used[i]){map['c'+i]='c'+nc.length;nc.push(c)}});p.d=p.d.map(id=>map[id]||id);p.c=nc;
   S.wird={s:p.s,z:p.z,d:p.d,c:p.c,n:p.n||''};save();closeSheet();vib([10,30,10]);toast(X('Saved','تم الحفظ'));R.wird()}};
 draw()}

/* ---------------- entry points: Home card + Qur'an tab card ---------------- */
async function homeCard(){const host=$('s-home');if(!host)return;let c=$('fqwHome');if(!c){c=document.createElement('div');c.id='fqwHome';c.className='fqw-card';const qc=$('qc');(qc&&qc.parentNode===host?qc:host.lastElementChild).insertAdjacentElement('afterend',c)}
 const own=await isOwner(),p=plan(own),po=await portion(p);if(!po){c.hidden=true;return}c.hidden=false;const done=!!(S.wirdDone||{})[dkey(NOW())];
 c.innerHTML=`<button class="fqw-open"><span class="fqw-l"><small>${X('Daily wird','الورد اليومي','Wirdii guyyaa','Wirdiga maalinta')}${done?' · ✓':''}</small><b>${esc(bigTxt(po))}</b><span>${rangeHTML(po)}</span></span>${window.FQ&&FQ.arc?FQ.arc(po.day,po.total,{w:54,label:N(po.day)}):''}</button>
  <button class="fqw-sh" id="fqwHS" aria-label="${X("Share today's card",'شارك بطاقة اليوم')}"><i class="ph ph-share-network"></i>${X('Share','مشاركة','Qoodi','La wadaag')}</button>`;
 c.querySelector('.fqw-open').onclick=()=>go('wird');$('fqwHS').onclick=async()=>{const it=await wirdItem(p);if(it)shareSheet(it)}}
async function quranCard(){const host=$('s-quran');if(!host)return;let c=$('fqwQ');if(!c){c=document.createElement('div');c.id='fqwQ';c.className='fqw-card';const qh=host.querySelector('.qh');(qh||host.firstElementChild).insertAdjacentElement('afterend',c)}
 const own=await isOwner(),p=plan(own),po=await portion(p);if(!po){c.hidden=true;return}c.hidden=false;
 c.innerHTML=`<button class="fqw-open"><span class="fqw-l"><small>${X('Daily wird','الورد اليومي','Wirdii guyyaa','Wirdiga maalinta')}</small><b>${esc(bigTxt(po))}</b><span>${rangeHTML(po)}</span></span>${window.FQ&&FQ.arc?FQ.arc(po.day,po.total,{w:54,label:N(po.day)}):''}</button>
  <button class="fqw-sh" id="fqwQS" aria-label="${X("Share today's card",'شارك بطاقة اليوم')}"><i class="ph ph-share-network"></i>${X('Share','مشاركة','Qoodi','La wadaag')}</button>`;
 c.querySelector('.fqw-open').onclick=()=>go('wird');$('fqwQS').onclick=async()=>{const it=await wirdItem(p);if(it)shareSheet(it)};
 /* Ayah of the day: share button */
 const vt=$('qVq')&&$('qVq').querySelector('.t');if(vt&&!vt.querySelector('[data-fqvs]')){vt.insertAdjacentHTML('beforeend',`<button data-fqvs aria-label="${X('Share','مشاركة')}"><i class="ph ph-share-network"></i></button>`);
  vt.querySelector('[data-fqvs]').onclick=()=>{const v=QD['13:28'],me=L==='ar'?'':v.en,ref=X("Qur'an, Surah Ar-Ra'd 13:28",'القرآن، سورة الرعد ١٣:٢٨');
   shareSheet({kind:'ayah',card:{kick:X('AYAH OF THE DAY','آية اليوم'),blocks:[{ar:v.a+' '+ARD(28),q:1,me,src:ref}]},text:v.a+' ﴿٢٨﴾\n\n'+(me?me+'\n\n':'')+ref+'\nhttps://quran.com/13/28\n\n'+X('Shared from Fastaqim','من فاستقم')+': '+SITE,saveT:ref,saveN:v.a+'\n\n'+(me?me+'\n':'')+'https://quran.com/13/28'})}}}
{const rh=R.home;R.home=function(){const r=rh.apply(this,arguments);homeCard().catch(e=>console.warn(e));/* header fit is measured only when Home is visible; Home opened from another tab first was never measured */try{if(typeof fhFit==='function')fhFit()}catch(e){}return r}}
{const rq=R.quran;R.quran=function(){const r=rq.apply(this,arguments);quranCard().catch(e=>console.warn(e));return r}}

/* ---------------- Qur'an reader: Share + Add to Saved on the ayah you tap ---------------- */
function racAdd(rac){if(rac.querySelector('[data-fqs]'))return;const a=rac.querySelector('a');
 const h=`<button data-fqs="share"><i class="ph ph-share-network"></i>${X('Share','مشاركة','Qoodi','La wadaag')}</button><button data-fqs="save"><i class="ph ph-bookmarks-simple"></i>${X('Add to Saved','أضف إلى المحفوظ','Kaa’i','Kaydi')}</button>`;
 if(a)a.insertAdjacentHTML('beforebegin',h);else rac.insertAdjacentHTML('beforeend',h)}
{const B=$('rdB');if(B){new MutationObserver(()=>{const r=B.querySelector('.ra.sel .rac');if(r)racAdd(r)}).observe(B,{childList:true,subtree:true});
 B.addEventListener('click',async e=>{const b=e.target.closest('[data-fqs]');if(!b)return;e.stopPropagation();e.preventDefault();const n=+b.closest('.ra').dataset.n,it=await ayahItem(RD.su,n);if(!it)return;
  if(b.dataset.fqs==='share')shareSheet(it);else addSaved(it.saveT,it.saveN)},true)}}

/* ---------------- adhkar reader: Share + Add to Saved on each dhikr ---------------- */
function zBar(){const card=$('zCard');if(!card||!ZS||card.querySelector('.fqs-bar'))return;
 card.insertAdjacentHTML('beforeend',`<div class="fqs-bar"><button data-fqz="share"><i class="ph ph-share-network"></i>${X('Share','مشاركة','Qoodi','La wadaag')}</button><button data-fqz="save"><i class="ph ph-bookmarks-simple"></i>${X('Add to Saved','أضف إلى المحفوظ','Kaa’i','Kaydi')}</button></div>`)}
{const oz=window.zDraw;if(typeof oz==='function')window.zDraw=function(){const r=oz.apply(this,arguments);try{zBar()}catch(e){}return r}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-fqz]');if(!b)return;e.stopPropagation();e.preventDefault();if(!ZS)return;const it=dhikrItem(ZS.set,ZS.i);if(!it)return;
 if(b.dataset.fqz==='share')shareSheet(it);else addSaved(it.saveT,it.saveN)},true);

Object.assign(window.FQS,{wirdItem,ayahItem,dhikrItem,plan,isOwner});
/* open from a link: ?wird=... or #wird */
try{if(ZS)zBar()}catch(e){}
setTimeout(()=>{try{if(P.get('wird')||window.__fqHash==='#wird'||location.hash==='#wird')go('wird',false);else if($('s-home')&&$('s-home').classList.contains('on'))homeCard()}catch(e){console.warn(e)}},60);
})();
