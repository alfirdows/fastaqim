/* Fastaqim "Horizon" design language: own progress marks, own tab icons, own adhkar list.
   (c) Fastaqim, all rights reserved. Loaded after the main script; it only wraps and refines. */
(function(){
'use strict';
const FT=(e,a,o,s)=>L==='ar'?a:LI===0?(o||e):LI===1?(s||e):e;
const N=v=>+String(v).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const A=n=>AR(n);
const CHK='<path d="M15.5 20.2l3.6 3.4 7.6-8" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>';

/* ---------- the rising arc: count c of n, drawn on a horizon ---------- */
function arc(c,n,o){o=o||{};c=Math.max(0,Math.min(+c||0,+n||0));n=+n||0;const done=n>0&&c>=n,seg=n>1&&n<=12,G=seg?(n>8?3:4):0;
 const P='M5 26A17 17 0 0 1 39 26';let tr='',pr='';
 if(seg){const s=(100-G*(n-1))/n;tr=`stroke-dasharray="${s.toFixed(2)} ${G}"`;
  pr=c?`stroke-dasharray="${Array.from({length:c},()=>s.toFixed(2)+' '+G).join(' ')} 0 200"`:'stroke-dasharray="0 200"'}
 else pr=`stroke-dasharray="${n?(100*c/n).toFixed(2):0} 200"`;
 const lab=o.label!=null?o.label:done?'':(n>1||c?A(c):'');
 return `<span class="fq-arc${done?' done':''}${o.lt?' lt':''}" style="--w:${o.w||44}px" role="img" aria-label="${c} / ${n}"><svg viewBox="0 0 44 28" aria-hidden="true"><path class="f" d="${P}Z"/><path class="t" d="${P}" pathLength="100" ${tr}/><path class="p" d="${P}" pathLength="100" ${pr}/><path class="b" d="M1 26.5h42"/>${done&&!o.label?`<g style="color:${o.lt?'#fff':'var(--acc)'}" transform="translate(-0.6,-0.4) scale(.92)">${CHK}</g>`:''}</svg><b>${lab}</b></span>`}

/* ---------- the path strip: one dash per step ---------- */
function steps(n,isDone,cur){return `<div class="fq-steps" role="group">${Array.from({length:n},(_,j)=>`<button type="button" data-fqj="${j}" class="${isDone(j)?'dn':''} ${j===cur?'cur':''}" aria-label="${FT('Dhikr '+(j+1),'الذكر '+A(j+1),'Zikrii '+(j+1),'Dhikr '+(j+1))}"><i></i></button>`).join('')}</div>`}
window.FQ={arc,steps,FT};

const timesTxt=n=>n===1?FT('Once','مرة واحدة','Yeroo tokko','Hal mar'):FT(n+' times',A(n)+(n>2&&n<11?' مرات':' مرة'),'Yeroo '+n,n+' jeer');
const leftTxt=r=>FT(r+' to go','بقي '+A(r),r+' hafe',r+' ayaa haray');
const doneTxt=()=>FT('Done','تمّ','Xumurame','Waa la dhammeeyey');

/* ---------- adhkar list: the whole set, full text, never cut ---------- */
function zText(h){return String(h).replace(/<p[^>]*>([\s\S]*?)<\/p>/g,'$1 · ').replace(/<br\s*\/?>/g,' ').replace(/<(?!\/?span\b)[^>]+>/g,' ').replace(/\s+/g,' ').replace(/^ · | · $/g,'').trim()}
window.zIndex=function(){const z=ZK[ZS.set],p=zProg(ZS.set),fin=z.items.filter((it,j)=>(p[j]||0)>=it.n).length,left=z.items.length-fin;
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${z.t}</h1>${XB}</div>
 ${steps(z.items.length,j=>(p[j]||0)>=z.items[j].n,ZS.i)}
 <div class="fq-zh"><b>${left?FT(z.items.length+' adhkar',A(z.items.length)+' أذكار',z.items.length+' zikrii',z.items.length+' adkaar'):FT('All finished today','اكتملت كلها اليوم','Hundi har\'a xumurame','Dhammaan maanta waa dhammaadeen')}</b><span>${left&&fin?FT(fin+' done · '+left+' to go','تمّ '+A(fin)+' · بقي '+A(left),fin+' xumurame · '+left+' hafe',fin+' la dhammeeyey · '+left+' ayaa haray'):''}</span></div>
 <div class="fq-zl">${z.items.map((it,j)=>{const c=p[j]||0,f=c>=it.n;return `<button type="button" class="fq-zi ${j===ZS.i?'cur':''} ${f?'fin':''}" data-j="${j}"><span class="ar ${it.q?'':'h'}" lang="ar">${zText(it.ar)}</span><span class="mt">${arc(c,it.n,{w:34})}<span>${timesTxt(it.n)} · <em>${f?doneTxt():c?leftTxt(it.n-c):FT('Not yet','لم يبدأ','Ammaaf miti','Weli')}</em></span><span class="no">${A(j+1)}</span></span></button>`}).join('')}</div>`);
 $('sh').classList.add('fq-full');$('scrim').classList.add('fq-none');
 const go=j=>{ZS.i=j;closeSheet();zDraw();const zc=$('zc');if(zc)zc.scrollTop=0};
 $$('#sh [data-j]').forEach(b=>b.onclick=()=>go(+b.dataset.j));$$('#sh [data-fqj]').forEach(b=>b.onclick=()=>go(+b.dataset.fqj));
 const cur=document.querySelector('#sh .fq-zi.cur');if(cur&&ZS.i>1)setTimeout(()=>cur.scrollIntoView({block:'center'}),60)};

if(typeof window.closeSheet==='function'){const _cs=window.closeSheet;window.closeSheet=function(){const r=_cs.apply(this,arguments);setTimeout(()=>{if(!$('sh').classList.contains('on')){$('sh').classList.remove('fq-full');$('scrim').classList.remove('fq-none')}},350);return r}}
/* ---------- dhikr reader: steps strip + rising arc on the count button ---------- */
{const _zd=window.zDraw;window.zDraw=function(a){const r=_zd.apply(this,arguments);try{fqReader()}catch(e){console.warn(e)}return r}}
function zParts(it){return String(it.ar).split(/<br>\s*(?=<p)/).filter(x=>x.trim())}
function fqReader(){if(!ZS)return;const z=ZK[ZS.set],it=z.items[ZS.i],p=zProg(ZS.set),c=p[ZS.i]||0,card=$('zCard');if(!card)return;
 const key=ZS.set+':'+ZS.i;if(ZS._k!==key){ZS._k=key;ZS.sub=0}
 const parts=it.q?zParts(it):[],np=parts.length>1&&c<it.n?parts.length:0;
 card.classList.toggle('fq-multi',!!np);
 if(np){const za=card.querySelector('.za');if(za){za.innerHTML=parts[ZS.sub];za.dataset.fmt=1}
  if(it._qk&&LI<0&&L!=='ar'){const gs=[[]];it._qk.forEach(k=>k==='|'?gs.push([]):gs[gs.length-1].push(k));const m=card.querySelector('.zm');if(m&&gs[ZS.sub])m.textContent=zkQ(gs[ZS.sub])}}
 {const za=card.querySelector('.za');if(za&&!za.dataset.fqay){za.dataset.fqay=1;za.innerHTML=za.innerHTML.replace(/<br\s*\/?>/g,' ').replace(/([^<>]+<span class="an">[^<]*<\/span>)/g,m=>'<span class="ay">'+m.trim()+'</span> ')}}
 const top=card.querySelector('.top');if(top){const w=document.createElement('div');w.className='fq-ztop';
  w.innerHTML=steps(z.items.length,j=>(p[j]||0)>=z.items[j].n,ZS.i)+`<div class="top fq-zt"><b>${FT('Dhikr '+(ZS.i+1),'الذكر '+A(ZS.i+1),'Zikrii '+(ZS.i+1),'Dhikr '+(ZS.i+1))}</b>${np?`<span class="fq-sub">${parts.map((_,k)=>`<i class="${k===ZS.sub?'on':k<ZS.sub?'dn':''}"></i>`).join('')}</span>`:''}</div>`;
  top.replaceWith(w);w.querySelectorAll('[data-fqj]').forEach(b=>b.onclick=e=>{e.stopPropagation();ZS.i=+b.dataset.fqj;zDraw();$('zc').scrollTop=0})}
 // say "N times" once: drop "(33 times)" from the meaning and "Repeat 33 times ·" from the source line
 card.querySelectorAll('.zm').forEach(zm=>{zm.innerHTML=zm.innerHTML.replace(/\s*<br\s*\/?>\s*/g,' ').replace(/\s*\((\d+|[٠-٩]+) times\)/,'').replace(/\s*\(\d+ times\)/,'')});
 const zs=card.querySelector('.zs');if(zs){zs.innerHTML=zs.innerHTML.replace(/^[^<]*·\s*/,'');const a=zs.querySelector('a');if(a)a.innerHTML=a.innerHTML.replace(/\s*↗\s*$/,'&nbsp;↗')}
 const t=$('zCntT'),last=!np||ZS.sub>=np-1;
 if(t)t.innerHTML=c>=it.n?`${arc(c,it.n,{w:46,lt:1})}<span class="lb"><b>${doneTxt()}</b><small>${ZS.i<z.items.length-1?FT('Tap for the next one','اضغط للتالي','Kan itti aanuuf tuqi','Taabo kan xiga'):FT('Set complete','اكتملت','Guutameera','Waa dhammaatay')}</small></span>`
  :!last?`${arc(c,it.n,{w:46,lt:1})}<span class="lb"><b>${FT('Next surah','السورة التالية','Suuraa itti aanu','Suuradda xigta')}</b><small>${FT('Then tap to count','ثم اضغط للعدّ','Achii lakkaa\'i','Kadib tiri')} · ${timesTxt(it.n)}</small></span>`
  :`${arc(c,it.n,{w:46,lt:1})}<span class="lb"><b>${FT('Tap to count','اضغط للعدّ','Lakkaa\'uuf tuqi','Taabo oo tiri')}</b><small>${c?leftTxt(it.n-c):timesTxt(it.n)}</small></span>`;
 const fl=$('zFl');if(fl)fl.style.width='0';
 const sk=$('zSkip');if(sk&&!sk.dataset.fq){sk.dataset.fq=1;sk.innerHTML=`<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 12h13M13 7.5 17.5 12 13 16.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 6v12" stroke="var(--fqG,#b8955a)" stroke-width="1.9" stroke-linecap="round"/></svg><small>${FT('Skip','تخطَّ','Darbi','Ka bood')}</small>`;sk.querySelector('svg').classList.add('flip');sk.setAttribute('aria-label',FT('Skip','تخطَّ','Darbi','Ka bood'))}}
function fqTap(){if(ZS){const it=ZK[ZS.set].items[ZS.i],c=(zProg(ZS.set)[ZS.i]||0),parts=it.q?zParts(it):[];
 if(parts.length>1&&c<it.n&&(ZS.sub||0)<parts.length-1){ZS.sub=(ZS.sub||0)+1;vib(8);zDraw();$('zc').scrollTop=0;return}
 if(parts.length>1&&c<it.n){ZS.sub=0}}
 zTap()}
{const b=$('zCnt');if(b)b.onclick=fqTap;const card=()=>$('zCard');new MutationObserver(()=>{const k=card();if(k&&!k.dataset.fqt){k.dataset.fqt=1;k.onclick=e=>{if(!e.target.closest('a,button'))fqTap()}}}).observe($('zc'),{childList:true})}

/* ---------- words instead of "x of y" ---------- */
{const _zs=window.zSum;window.zSum=function(set){const z=ZK[set],p=zProg(set),d=z.items.filter((it,j)=>(p[j]||0)>=it.n).length,n=z.items.length;
 if(d===n)return _zs(set);return d?FT(d+' done · '+(n-d)+' to go','تمّ '+A(d)+' · بقي '+A(n-d),d+' xumurame · '+(n-d)+' hafe',d+' la dhammeeyey · '+(n-d)+' ayaa haray'):FT(n+' adhkar',A(n)+' أذكار',n+' zikrii',n+' adkaar')}}
{const _rd=R.dhikr;R.dhikr=function(){_rd.apply(this,arguments);try{const e=$('zDayN');if(e){const m=e.textContent.match(/[0-9٠-٩]+/);e.innerHTML=arc(m?N(m[0]):0,4,{w:36})}
 const sr=document.querySelector('#zPath [data-z="sleep"] .tx small');if(sr&&!sr.querySelector('b'))sr.textContent=zSum('sleep')}catch(e){}}}

/* ---------- Today's path (Home): the ring becomes a rising arc ---------- */
if(typeof window.renderCI==='function'){const _ci=window.renderCI;window.renderCI=function(){const r=_ci.apply(this,arguments);try{fqCI()}catch(e){console.warn(e)}return r}}
function fqCI(){const ci=$('ci');if(!ci)return;const dk=dkey(NOW()),o=(S.ci||{})[dk]||{},sal=Object.keys(S.salah[dk]||{}).length,done=CI.filter(c=>o[c[0]]).length+sal,tot=CI.length+5;
 const r=ci.querySelector('.cir');if(r){r.outerHTML=arc(done,tot,{w:58})}
 const s=ci.querySelector('.cit small');if(s)s.textContent=done>=tot?FT('All done today','تمّ كله اليوم','Har\'a hundi xumurame','Maanta dhammaan waa la dhammeeyey'):done?FT(done+' done · '+(tot-done)+' to go','تمّ '+A(done)+' · بقي '+A(tot-done),done+' xumurame · '+(tot-done)+' hafe',done+' la dhammeeyey · '+(tot-done)+' ayaa haray'):FT(tot+' steps today','خطوات اليوم: '+A(tot),'Har\'a tarkaanfii '+tot,tot+' tallaabo maanta');
 const em=ci.querySelector('.cis em');if(em)em.innerHTML=arc(sal,5,{w:34})}
try{fqCI()}catch(e){}

/* ---------- More: numbers on arcs, no fractions ---------- */
{const _rm=R.more;R.more=function(){_rm.apply(this,arguments);try{const y=$('yp');if(!y)return;const b=y.querySelectorAll('div>b');
 if(b[1]){const m=b[1].textContent.match(/([0-9٠-٩]+)\s*\/\s*([0-9٠-٩]+)/);if(m)b[1].outerHTML=arc(N(m[1]),N(m[2]),{w:58,label:A(N(m[1]))})}
 if(b[2]){const m=b[2].textContent.match(/[0-9٠-٩]+/);const v=m?N(m[0]):0;b[2].outerHTML=arc(v,100,{w:58,label:A(v)+'%'})}}catch(e){}}}

/* ---------- any leftover "3/5" style fraction becomes a small arc ---------- */
const FR=/^\s*([0-9٠-٩]{1,3})\s*\/\s*([0-9٠-٩]{1,3})\s*$/;
function fracs(root){(root||document).querySelectorAll('em,b,small,span').forEach(e=>{if(e.children.length||e.closest('.fq-arc,input,textarea,[contenteditable],.mhn,.cg'))return;const m=e.textContent.match(FR);if(!m)return;const c=N(m[1]),n=N(m[2]);if(!n||c>n)return;
 e.innerHTML=arc(c,n,{w:30});e.classList.add('fq-fr');e.style.background='none';e.style.padding='0'})}
let qd=0;const mo=new MutationObserver(()=>{if(qd)return;qd=requestAnimationFrame(()=>{qd=0;try{fracs(document.querySelector('.scr.on'));fracs($('sh'))}catch(e){}})});
mo.observe(document.body,{subtree:true,childList:true,characterData:true});

/* ---------- own tab icons: each stands on the horizon ---------- */
const TI={home:'<path class="s w" d="M6.5 20.5V10.8L12 6l5.5 4.8v9.7"/><path class="s" d="M4.5 12.4 12 5.8l7.5 6.6"/><path class="s" d="M10.2 20.5v-3a1.8 1.8 0 0 1 3.6 0v3"/>',
 quran:'<path class="s w" d="M12 8.2C10.1 6.7 7.4 6.2 4.8 6.6v11.6c2.6-.4 5.3.1 7.2 1.6 1.9-1.5 4.6-2 7.2-1.6V6.6c-2.6-.4-5.3.1-7.2 1.6z"/><path class="s" d="M12 8.2v11.3"/>',
 dhikr:[0,1,2,3,4,5,6].map(i=>{const a=Math.PI+i*Math.PI/6;return `<circle class="s w" cx="${(12+7.2*Math.cos(a)).toFixed(2)}" cy="${(18.6+7.2*Math.sin(a)).toFixed(2)}" r="1.45"/>`}).join(''),
 todo:'<path class="s w" d="M8.2 5h7.6A3.2 3.2 0 0 1 19 8.2v7.6a3.2 3.2 0 0 1-3.2 3.2H6.2a1.2 1.2 0 0 1-1.2-1.2V8.2A3.2 3.2 0 0 1 8.2 5z"/><path class="s" d="M8.7 12.2l2.4 2.4 4.4-4.8"/>',
 more:'<circle class="s w" cx="6.5" cy="15" r="1.6"/><circle class="s w" cx="12" cy="11.6" r="1.6"/><circle class="s w" cx="17.5" cy="15" r="1.6"/>'};
const tabIc=(k,on)=>`<svg class="fq-ti fqi${on?' on':''}" viewBox="0 0 24 24" aria-hidden="true">${TI[k]}<path class="h" d="M2.5 21.8h19"/></svg>`;
if(typeof renderTab==='function'){const _rt=renderTab;window.renderTab=function(on){_rt.apply(this,arguments);try{$$('#tab a[data-tab]').forEach(a=>{const k=a.dataset.tab;if(!TI[k])return;const old=a.querySelector('.fqi');if(old)old.outerHTML=tabIc(k,a.classList.contains('on'))})}catch(e){}}
 try{const cur=document.querySelector('#tab a.on');window.renderTab(cur?cur.dataset.tab:'home')}catch(e){}}

/* first paint */
try{const s=document.querySelector('.scr.on');if(s){const k=s.id.replace('s-','');if(R[k])R[k]()}}catch(e){}
try{if(ZS)zDraw()}catch(e){}
})();
