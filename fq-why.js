/* Fastaqim "My reasons": the reasons that push you to get up and do the work.
   One reason on Home (a new one each day, "Another" for the next), and a sheet to add or remove your own.
   Saved in S.reasons, so it syncs with the account like the rest of the state. (c) Fastaqim, all rights reserved. */
(function(){'use strict';
const X=(en,ar,om,so)=>L==='ar'?ar:(LI===0&&om)?om:(LI===1&&so)?so:(LI>=0&&typeof DICT==='object'&&DICT[en])?DICT[en][LI]:en;
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const SEED=['25:15','12:57'];
const SU_N={25:['Al-Furqan','الفرقان'],12:['Yusuf','يوسف']};
const cache={};
/* line breaks at the natural pauses in meaning (word counts per line) */
const BR={'25:15':[6,3,4],'12:57':[3,4]};
function lines(ref,a){const b=BR[ref];if(!b)return a;const w=a.split(/\s+/);let i=0;const out=b.map(n=>{const l=w.slice(i,i+n).join(' ');i+=n;return l}).filter(Boolean);if(i<w.length)out.push(w.slice(i).join(' '));return out.map(l=>'<span class="fqy-l">'+l+'</span>').join('')}
function ayah(ref){const p=ref.split(':').map(Number);if(cache[ref])return Promise.resolve(cache[ref]);
 return fetch('q/'+p[0]+'.json').then(r=>r.json()).then(j=>{const v=j.v[p[1]-1];return cache[ref]={a:v[0],en:v[1]}})}
function init(){let ch=false;
 if(!Array.isArray(S.reasons)){S.reasons=[];ch=true;
  try{const o=JSON.parse(localStorage.getItem('launchpad.v1')||'null');((o&&o.reasons)||[]).forEach(r=>{if(r&&r.text&&r.text.indexOf('الْخُلْدِ')<0)S.reasons.push({id:uid(),t:String(r.text).slice(0,400),n:String(r.note||'').slice(0,200)})})}catch(e){}}
 SEED.slice().reverse().forEach(ref=>{if(!S.reasons.some(r=>r.ref===ref)){S.reasons.unshift({id:uid(),ref:ref});ch=true}});
 if(ch)save()}
function refLabel(ref){const p=ref.split(':'),n=SU_N[p[0]]||[p[0],p[0]];return X("Qur'an, Surah "+n[0]+' '+ref,'القرآن، سورة '+n[1]+' '+AR(p[0])+':'+AR(p[1]))}
function idx(){const d=NOW(),day=Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5),o=(S.whyO&&S.whyO.d===dkey(d))?S.whyO.n:0;return (day+o)%Math.max(1,S.reasons.length)}
function body(r){if(r.ref){const v=cache[r.ref];if(!v)return '<div class="fqy-ar">…</div>';const p=r.ref.split(':');
  return '<div class="fqy-ar" dir="rtl" lang="ar">'+lines(r.ref,v.a)+'</div>'+(L==='ar'?'':'<p class="fqy-m">'+esc(v.en)+'</p>')+'<a class="fqy-s" href="https://quran.com/'+p[0]+'/'+p[1]+'" target="_blank" rel="noopener">'+refLabel(r.ref)+' ↗</a>'}
 return '<div class="fqy-t" dir="auto">'+esc(r.t)+'</div>'+(r.n?'<p class="fqy-m" dir="auto">'+esc(r.n)+'</p>':'')}
function card(){const h=$('s-home');if(!h)return;let el=$('fqWhy');if(!el){el=document.createElement('div');el.id='fqWhy';el.className='fqy';const qc=$('qc');if(qc)qc.parentNode.insertBefore(el,qc);else h.appendChild(el)}
 if(!S.reasons.length){el.hidden=true;return}el.hidden=false;const i=idx(),r=S.reasons[i];
 if(r.ref&&!cache[r.ref])ayah(r.ref).then(card).catch(()=>{});
 el.innerHTML='<div class="fqy-h"><span class="fqy-e">'+X('My reason','سببي','Sababa koo','Sababtayda')+'</span>'
  +(S.reasons.length>1?'<button class="fqy-b" id="fwNx" aria-label="'+X('Another reason','سبب آخر','Sababa biraa','Sabab kale')+'"><i class="ph ph-arrows-clockwise"></i></button>':'')
  +'<button class="fqy-b" id="fwEd" aria-label="'+X('My reasons','أسبابي','Sababoota koo','Sababahayga')+'"><i class="ph ph-list"></i></button></div>'+body(r);
 const nx=$('fwNx');if(nx)nx.onclick=()=>{const dk=dkey(NOW());S.whyO={d:dk,n:((S.whyO&&S.whyO.d===dk?S.whyO.n:0)+1)%S.reasons.length};save();vib(10);card()};
 $('fwEd').onclick=sheet}
function sheet(){const rows=S.reasons.map(r=>{const t=r.ref?(cache[r.ref]?cache[r.ref].a:''):r.t,s=r.ref?refLabel(r.ref):(r.n||'');
  return '<div class="fqy-row"><div class="fqy-rt"><b dir="auto"'+(r.ref?' class="fqy-rar" lang="ar"':'')+'>'+esc(t)+'</b>'+(s?'<small dir="auto">'+esc(s)+'</small>':'')+'</div><button class="ib" data-del="'+r.id+'" aria-label="'+X('Remove','إزالة','Haqi','Ka saar')+'"><i class="ph ph-trash"></i></button></div>'}).join('');
 openSheet('<div class="hd sub"><span style="width:44px"></span><h1>'+X('My reasons','أسبابي','Sababoota koo','Sababahayga')+'</h1>'+XB+'</div>'
 +'<p class="note" style="text-align:center">'+X('What pushes you to get up and do it. One shows on Home each day.','ما يدفعك للقيام والعمل. يظهر واحد في الرئيسية كل يوم.','Waan si kaasu. Guyyaa guyyaan tokko Mana irratti mul’ata.','Waxa ku kiciya. Maalin kasta mid ayaa Hoyga ka muuqda.')+'</p>'
 +'<div class="fqy-list">'+rows+'</div>'
 +'<div class="fqy-add"><textarea class="inp" id="fwIn" rows="2" maxlength="400" dir="auto" placeholder="'+X('Add your own reason…','أضف سببك…','Sababa kee dabali…','Ku dar sababtaada…')+'"></textarea><button class="big" id="fwAdd">'+X('Add','إضافة','Dabali','Ku dar')+'</button></div>');
 $$('#sh [data-del]').forEach(b=>b.onclick=()=>{const k=S.reasons.findIndex(r=>r.id===b.dataset.del);if(k<0)return;const old=S.reasons.splice(k,1)[0];save();card();sheet();
  if(typeof undoToast==='function')undoToast(X('Reason removed','أزيل السبب','Sababni haqame','Sababta waa la saaray'),()=>{S.reasons.splice(k,0,old);save();card();if(document.querySelector('#sh .fqy-list'))sheet()})});
 $('fwAdd').onclick=()=>{const v=$('fwIn').value.trim();if(!v)return;if(typeof blocked==='function'&&blocked(v)){toast(X('Please write it another way.','اكتبها بطريقة أخرى.'));return}
  S.reasons.push({id:uid(),t:v.slice(0,400)});save();vib(15);card();sheet();toast(X('Added','أُضيف','Dabalame','Waa la daray'))}}
function boot(){try{init()}catch(e){console.warn('why',e)}
 Promise.all(S.reasons.filter(r=>r.ref).map(r=>ayah(r.ref).catch(()=>{}))).then(card);
 const _h=R.home;R.home=function(){_h.apply(this,arguments);try{card()}catch(e){}};
 const m=$('mLang'),gl=m&&m.closest('.gl');
 if(gl&&!$('fwMore')){const b=document.createElement('button');b.id='fwMore';b.innerHTML='<span class="ic c-g"><i class="ph ph-heart"></i></span><span>'+X('My reasons','أسبابي','Sababoota koo','Sababahayga')+'</span><em></em><i class="ph ph-caret-right cv flip"></i>';b.onclick=sheet;gl.insertBefore(b,gl.firstChild)}
 window.fqWhy={open:sheet}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
