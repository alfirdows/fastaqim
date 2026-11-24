/* Fastaqim Appearance in Settings (24 Nov 2026): Light, Night or Auto (follows the phone).
   Uses the night mode in fq-night.js (window.fqNight). Key fq5.theme = "auto" when following the phone;
   otherwise fq-night's own fq5.night decides. Tapping the moon on Home leaves Auto. Own file so other work never overwrites it. */
(function(){'use strict';
var K='fq5.theme',mq=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):null,H=document.documentElement;
function auto(){try{return localStorage.getItem(K)==='auto'}catch(e){return false}}
function mode(){return auto()?'auto':H.classList.contains('dark')?'dark':'light'}
/* early: before the page paints */
if(auto()&&mq)H.classList.toggle('dark',mq.matches);
function follow(){if(!auto()||!mq)return;var on=mq.matches;if(window.fqNight){if(fqNight.on()!==on)fqNight.set(on)}else H.classList.toggle('dark',on)}
if(mq){mq.addEventListener?mq.addEventListener('change',follow):mq.addListener(follow)}
document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.fqn-btn')){try{localStorage.removeItem(K)}catch(x){}setTimeout(paint,30)}},true);
function X(en,ar,om,so){try{if(L==='ar')return ar;if(LI===0&&om)return om;if(LI===1&&so)return so;if(LI>=0&&typeof DICT==='object'&&DICT[en])return DICT[en][LI]}catch(e){}return en}
function paint(){var m=mode();document.querySelectorAll('#fqpSet [data-th]').forEach(function(x){var on=x.dataset.th===m;x.classList.toggle('on',on);x.setAttribute('aria-checked',on)})}
function choose(m){try{if(m==='auto')localStorage.setItem(K,'auto');else localStorage.removeItem(K)}catch(e){}
 var on=m==='auto'?!!(mq&&mq.matches):m==='dark';if(window.fqNight){if(fqNight.on()!==on)fqNight.set(on);else if(m!=='auto')try{localStorage.setItem('fq5.night',on?'1':'0')}catch(e){}}else H.classList.toggle('dark',on);paint()}
function add(){var B=document.getElementById('fqpSet');if(!B||B.querySelector('.fqt-seg'))return;
 var gen=[].slice.call(B.querySelectorAll('p.glh')).filter(function(p){return p.nextElementSibling&&p.nextElementSibling.querySelector('#fqpLang')})[0];if(!gen)return;
 var t=X('Appearance','المظهر','Bifa','Muuqaalka'),O=[['light','ph-sun',X('Light','فاتح','Ifaa','Iftiin')],['dark','ph-moon',X('Night','ليلي','Halkan','Habeen')],['auto','ph-circle-half',X('Auto','تلقائي','Ofumaan','Toos')]];
 gen.insertAdjacentHTML('beforebegin','<p class="glh">'+t+'</p><div class="kh"><div class="fqt-seg" role="radiogroup" aria-label="'+t+'">'+O.map(function(o){return '<button type="button" role="radio" data-th="'+o[0]+'"><i class="ph '+o[1]+'"></i><span>'+o[2]+'</span></button>'}).join('')+'</div><small class="fqt-n">'+X('Auto matches your phone.','تلقائي يطابق إعداد هاتفك.','Ofumaan bilbila kee hordofa.','Toos wuxuu raacaa taleefankaaga.')+'</small></div>');
 B.querySelectorAll('[data-th]').forEach(function(b){b.onclick=function(){choose(b.dataset.th)}});paint()}
function hook(){if(typeof R!=='object'||typeof R.settings!=='function')return false;if(R.settings.__fqt)return true;
 var o=R.settings;R.settings=function(){var r=o.apply(this,arguments);try{add()}catch(e){}return r};R.settings.__fqt=1;return true}
function boot(){if(!hook()){setTimeout(boot,300);return}follow();if(document.getElementById('fqpSet'))add()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,0)});else setTimeout(boot,0);
})();
