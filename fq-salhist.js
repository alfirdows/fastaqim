/* Fastaqim "Salah this week": a clear picture of the last 7 days, every salah with how it was marked
   and when. Tap any salah to change or undo it (stars follow). Opens from More (the salah count) and
   from Home (under the day line). (c) Fastaqim, all rights reserved. */
(function(){'use strict';
const OS={
 'Salah this week':['Salaata torban kanaa','Salaadda toddobaadkan'],
 'On time':['Yeroon','Waqtigeeda'],'Later in its time':['Yeroo ishee keessatti booda','Dib, waqtigeeda gudihiisa'],
 'Made up':['Booda baafame','La gudday'],'Excused':['Dhimma qaba','Cudurdaar'],'Not marked':['Hin mallattoofne','Lama calaamadin'],
 'Tap any salah to change or undo it.':["Jijjiiruuf ykn haquuf salaata kamiyyuu tuqi.",'Taabo salaad kasta si aad u beddesho ama uga noqoto.'],
 'Today':["Har'a",'Maanta'],'Yesterday':['Kaleessa','Shalay'],
 'Marked at {0}':['{0} irratti mallattaa\'e','Waxaa la calaamadeeyay {0}'],
 'Not marked yet':['Ammaaf hin mallattoofne','Weli lama calaamadin'],
 'Clear':['Haqi','Tirtir'],'Undo':['Deebisi','Ka noqo'],
 'Changed':['Jijjiirame','Waa la beddelay'],'Cleared':['Haqame','Waa la tirtiray'],
 'Back to the week':['Gara torbaniitti deebi\'i','Ku noqo toddobaadka'],
 'What do these mean?':['Kunneen maal jechuu?','Kuwani maxay ka dhigan yihiin?'],
 'Not yet due':['Yeroon isaa hin geenye','Waqtigeedu weli ma gaarin'],
 'What counts as an excuse?':["Maaltu sababa ta'a?",'Maxaa cudur-daar ah?'],
 'prayed':['salaatame','la tukaday']};
const X=(en,ar)=>L==='ar'?ar:(LI>=0&&OS[en])?OS[en][LI]:(LI>=0&&typeof DICT==='object'&&DICT[en])?DICT[en][LI]:en;
const ST={on:['ph-check','On time','في وقتها'],mid:['ph-hourglass-medium','Later in its time','متأخرة في وقتها'],
 late:['ph-clock-counter-clockwise','Made up','قضاء'],exc:['ph-shield-check','Excused','بعذر'],none:['ph-minus','Not marked','لم تُسجَّل']};
const lang=()=>L==='ar'?'ar':(LI>=0?LX:(typeof LX==='string'?LX:'en'));
function day(i){const d=NOW();d.setHours(12,0,0,0);d.setDate(d.getDate()-i);return d}
function dlabel(d,i){if(i===0)return X('Today','اليوم');if(i===1)return X('Yesterday','أمس');
 try{return d.toLocaleDateString(lang(),{weekday:'short'})}catch(e){return d.toDateString().slice(0,3)}}
function dsub(d){try{return d.toLocaleDateString(lang(),{month:'short',day:'numeric'})}catch(e){return ''}}
function due(i,s){if(i>0)return true;const n=NOW(),[h,m]=s[3].split(':').map(Number);return h*60+m<=n.getHours()*60+n.getMinutes()}
function tm(iso){try{const d=new Date(iso);return f12(String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'))}catch(e){return ''}}
function salName(k){const s=SAL.find(x=>x[0]===k);return s?T(s[1],s[2]):k}

/* one place that changes a mark, so stars and the time stay right */
function setMark(dk,k,v){S.salah[dk]=S.salah[dk]||{};S.salT=S.salT||{};S.salT[dk]=S.salT[dk]||{};
 const id='sal-'+dk+'-'+k,s=SAL.find(x=>x[0]===k);
 if(v){S.salah[dk][k]=v;S.salT[dk][k]=new Date().toISOString()}else{delete S.salah[dk][k];delete S.salT[dk][k]}
 if(v==='on'||v==='mid'){if(!S.starLog[id]&&s)star(id,T(s[1]+' on time',s[2]+' في وقتها'))}
 else if(S.starLog[id]){delete S.starLog[id];S.stars=Math.max(0,S.stars-1)}
 save();refresh()}
function refresh(){try{renderSalah()}catch(e){}try{const y=document.getElementById('yp');if(y&&y.offsetParent&&R.more)R.more()}catch(e){}
 try{if(typeof renderHero==='function'&&document.getElementById('hero'))renderHero()}catch(e){}}

function cell(i,dk,s){const v=(S.salah[dk]||{})[s[0]];const k=v||(due(i,s)?'none':'soon');
 const lab=k==='soon'?X('Not yet due','لم يحن بعد'):X(ST[k][1],ST[k][2]);
 return `<button class="fsh-c fsh-${k}" type="button" data-hd="${dk}" data-hk="${s[0]}" aria-label="${salName(s[0])}: ${lab}"${k==='soon'?' disabled':''}><i class="ph ${k==='soon'?'ph-dot':ST[k][0]}"></i></button>`}

function open(){if(typeof openSheet!=='function')return;const c={on:0,mid:0,late:0,exc:0,none:0};let rows='';
 for(let i=0;i<7;i++){const d=day(i),dk=dkey(d),o=S.salah[dk]||{};
  SAL.forEach(s=>{const v=o[s[0]];if(v&&c[v]!=null)c[v]++;else if(!v&&due(i,s))c.none++});
  rows+=`<div class="fsh-r${i===0?' fsh-today':''}"><span class="fsh-d"><b>${dlabel(d,i)}</b><small>${AR(dsub(d))}</small></span>${SAL.map(s=>cell(i,dk,s)).join('')}</div>`}
 const leg=['on','mid','late','exc','none'].map(k=>`<div class="fsh-l"><span class="fsh-c fsh-${k} fsh-sm"><i class="ph ${ST[k][0]}"></i></span><b>${AR(c[k])}</b><small>${X(ST[k][1],ST[k][2])}</small></div>`).join('');
 const pr=c.on+c.mid+c.late,tot=pr+c.none;
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${X('Salah this week','صلوات الأسبوع')}</h1>${XB}</div>
 <div class="fsh">
  <div class="fsh-top"><div class="fsh-big"><b>${AR(pr)}</b><span>/ ${AR(tot)}</span><small>${X('prayed','صُلّيت')}</small></div><div class="fsh-bar">${['on','mid','late','none'].map(k=>c[k]?`<i class="fsh-b-${k}" style="flex:${c[k]}"></i>`:'').join('')}</div></div>
  <div class="fsh-leg">${leg}</div>
  <div class="fsh-g"><div class="fsh-r fsh-h"><span class="fsh-d"></span>${SAL.map(s=>`<span class="fsh-n">${T(s[1],s[2])}</span>`).join('')}</div>${rows}</div>
  <p class="fsh-tip"><i class="ph ph-hand-tap"></i>${X('Tap any salah to change or undo it.','اضغط على أي صلاة لتغييرها أو التراجع عنها.')}</p>
  <div class="fsi-lks">${window.fqQada?`<button class="fsi-lk" type="button" data-fqd><i class="ph ph-info"></i>${X('What do these mean?','ما معنى هذه؟')}</button>`:''}${window.fqExc?`<button class="fsi-lk" type="button" data-fsi><i class="ph ph-info"></i>${X('What counts as an excuse?','ما الأعذار في الصلاة؟')}</button>`:''}</div>
 </div>`);
 document.querySelectorAll('#sh [data-hd]').forEach(b=>b.onclick=()=>{vib&&vib(8);edit(b.dataset.hd,b.dataset.hk)})}

function edit(dk,k){const cur=(S.salah[dk]||{})[k],t=((S.salT||{})[dk]||{})[k];
 const [y,m,d]=dk.split('-').map(Number),dt=new Date(y,m-1,d,12);
 openSheet(`<div class="hd sub"><button class="ib" type="button" id="fshBk" aria-label="${X('Back to the week','العودة إلى الأسبوع')}"><i class="ph ph-arrow-left flip"></i></button><h1>${salName(k)}</h1>${XB}</div>
 <p class="note" style="text-align:center">${AR(dsub(dt))} · ${cur?(t?X('Marked at {0}','سُجّلت {0}').replace('{0}',tm(t)):X(ST[cur][1],ST[cur][2])):X('Not marked yet','لم تُسجَّل بعد')}</p>
 ${['on','mid','late','exc'].map(v=>`<button class="opt ${cur===v?'on':''}" data-ev="${v}"><span class="fsh-c fsh-${v} fsh-sm"><i class="ph ${ST[v][0]}"></i></span><span><b>${X(ST[v][1],ST[v][2])}</b></span><span class="rd">✓</span></button>`).join('')}
 ${cur?`<button class="ghost" style="border-color:var(--line);color:var(--sub)" data-ev="">${X('Clear','مسح')}</button>`:''}
 ${window.fqQada?`<button class="fsi-lk" type="button" data-fqd><i class="ph ph-info"></i>${X('What do these mean?','ما معنى هذه؟')}</button>`:''}`);
 const bk=document.getElementById('fshBk');if(bk)bk.onclick=open;
 document.querySelectorAll('#sh [data-ev]').forEach(b=>b.onclick=()=>{const v=b.dataset.ev,prev=cur||'';if(v===prev){open();return}
  setMark(dk,k,v);vib&&vib(15);open();
  if(typeof undoToast==='function')setTimeout(()=>undoToast((v?X('Changed','تم التغيير'):X('Cleared','تم المسح'))+': '+salName(k),()=>{setMark(dk,k,prev);if(document.querySelector('#sh .fsh'))open()}),400)})}

window.fqSalHist=open;window.fqSalMark=setMark;
document.addEventListener('click',e=>{if(!e.target.closest)return;if(e.target.closest('[data-fsi],[data-fqd]'))return;
 const b=e.target.closest('[data-fsh],#yp>div:nth-child(2)');if(!b)return;e.preventDefault();vib&&vib(8);open()},true);

/* Home: a small "Salah this week" under the day line */
function boot(){const _rh=window.renderHero;
 if(typeof _rh==='function')window.renderHero=renderHero=function(){_rh.apply(this,arguments);try{const h=document.getElementById('hero');if(!h||h.querySelector('.fsh-hl'))return;
  const b=document.createElement('button');b.type='button';b.className='fsh-hl';b.setAttribute('data-fsh','');b.innerHTML='<i class="ph ph-calendar-check"></i>'+X('Salah this week','صلوات الأسبوع')+'<i class="ph ph-caret-right flip"></i>';
  const q=h.querySelector('.nw-q');if(q)q.insertAdjacentElement('beforebegin',b);else h.appendChild(b)}catch(e){}};
 try{renderHero()}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else setTimeout(boot,0);
})();
