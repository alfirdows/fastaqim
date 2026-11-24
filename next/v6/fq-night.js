/* Fastaqim light / night switch. Per device, like the phone's own setting. Key: fq5.night = "1" | "0".
   Night mode = calm deep green-grey (never pure black). Fixed light colours written in the site's style
   sheets are turned into matching night colours while night mode is on, and put back for light mode. */
(function(){
 var H=document.documentElement,K='fq5.night',done=new WeakSet(),saved=[];
 function isOn(){return H.classList.contains('dark')}
 /* ---- colour helpers ---- */
 var NAMED={white:[255,255,255,1],black:[0,0,0,1]};
 function parse(c){c=c.trim().toLowerCase();if(NAMED[c])return NAMED[c].slice();
  var m=c.match(/^#([0-9a-f]{3,8})$/);if(m){var h=m[1];if(h.length<6)h=h.split('').map(function(x){return x+x}).join('');
   return [parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16),h.length>=8?parseInt(h.substr(6,2),16)/255:1]}
  m=c.match(/^rgba?\(([^)]+)\)$/);if(m){var p=m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);return [p[0],p[1],p[2],p[3]==null?1:p[3]]}return null}
 function toHsl(r,g,b){r/=255;g/=255;b/=255;var mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,h=0,s=0,d=mx-mn;
  if(d){s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6}return [h,s,l]}
 function str(h,s,l,a){return 'hsla('+Math.round(h*360)+','+Math.round(s*100)+'%,'+Math.round(l*100)+'%,'+(+a.toFixed(3))+')'}
 function bgT(c){var p=parse(c);if(!p)return null;var x=toHsl(p[0],p[1],p[2]);if(x[2]<=.55)return null;
  if(p[3]<1&&p[3]<.5)return 'rgba(255,255,255,'+(+(p[3]*0.1).toFixed(3))+')';
  return str(x[0]||0.4,Math.min(x[1]*.45,.25),.115+(1-x[2])*.55,p[3])}
 function bdT(c){var p=parse(c);if(!p)return null;var x=toHsl(p[0],p[1],p[2]);if(x[2]<=.55)return null;return str(x[0]||0.4,Math.min(x[1]*.4,.2),.2+(1-x[2])*.35,p[3])}
 function fgT(c){var p=parse(c);if(!p)return null;var x=toHsl(p[0],p[1],p[2]);if(x[2]>=.66)return null;
  var l=x[2]<.4?.93-x[2]*.4:Math.max(x[2],.72);return str(x[0],Math.min(x[1],.55),l,p[3])}
 var COL=/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\bwhite\b/g;
 function mapAll(v,f){return v.replace(COL,function(m){var r=f(m);return r||m})}
 var BG=['background-color'],BD=['border-color','border-top-color','border-bottom-color','border-left-color','border-right-color','outline-color'],FG=['color','fill','stroke','-webkit-text-fill-color','caret-color'];
 function fixRule(r){var st=r.style,ch={};
  function put(p,v){if(v!=null&&v!==st.getPropertyValue(p)){ch[p]=[st.getPropertyValue(p),st.getPropertyPriority(p)];st.setProperty(p,v,st.getPropertyPriority(p))}}
  BG.forEach(function(p){var v=st.getPropertyValue(p);if(v&&v.indexOf('var(')<0)put(p,mapAll(v,bgT))});
  var bi=st.getPropertyValue('background-image');if(bi&&bi.indexOf('gradient')>=0&&bi.indexOf('var(')<0)put('background-image',mapAll(bi,bgT));
  BD.forEach(function(p){var v=st.getPropertyValue(p);if(v&&v.indexOf('var(')<0)put(p,mapAll(v,bdT))});
  FG.forEach(function(p){var v=st.getPropertyValue(p);if(v&&v.indexOf('var(')<0)put(p,mapAll(v,fgT))});
  /* white text on an accent fill: accent turns soft in night mode, so the text turns deep */
  var bgv=(st.getPropertyValue('background-color')+' '+st.getPropertyValue('background')).toLowerCase(),cv=st.getPropertyValue('color').toLowerCase();
  if(/var\(--(acc|ok|gold)\)/.test(bgv)&&/#fff|white|255, ?255, ?255/.test(cv))put('color','#0f1c14');
  for(var k in ch){saved.push([r,ch]);break}}
 function walk(list){for(var i=0;i<list.length;i++){var r=list[i];if(r.cssRules&&!r.style){try{walk(r.cssRules)}catch(e){}continue}
  if(r.style&&r.selectorText&&!done.has(r)){done.add(r);fixRule(r)}}}
 function convert(){for(var i=0;i<document.styleSheets.length;i++){var sh=document.styleSheets[i];
  if(sh.ownerNode&&sh.ownerNode.id==='fqn-keep')continue;try{walk(sh.cssRules)}catch(e){}}}
 function restore(){for(var i=saved.length-1;i>=0;i--){var r=saved[i][0],ch=saved[i][1];for(var p in ch){if(ch[p][0])r.style.setProperty(p,ch[p][0],ch[p][1]);else r.style.removeProperty(p)}}saved=[];done=new WeakSet()}
 /* inline style="" colours on elements made by the page's scripts */
 var inl=new WeakMap();
 function fixEl(e){if(!e.getAttribute)return;var s=e.getAttribute('style');if(!s||!/#|rgb|white/i.test(s)||inl.has(e))return;
  var n=s.replace(/(background(?:-color)?\s*:\s*)([^;]+)/gi,function(m,a,v){return v.indexOf('var(')>=0||v.indexOf('url(')>=0?m:a+mapAll(v,bgT)})
   .replace(/((?:^|;)\s*color\s*:\s*)([^;]+)/gi,function(m,a,v){return v.indexOf('var(')>=0?m:a+mapAll(v,fgT)})
   .replace(/(border(?:-[a-z]+)?\s*:\s*)([^;]+)/gi,function(m,a,v){return v.indexOf('var(')>=0?m:a+mapAll(v,bdT)});
  if(n!==s){inl.set(e,s);e.setAttribute('style',n)}}
 var mo=null;
 function inlineOn(){document.querySelectorAll('[style]').forEach(fixEl);
  if(!mo){mo=new MutationObserver(function(ms){if(!isOn())return;ms.forEach(function(m){m.addedNodes&&m.addedNodes.forEach(function(n){if(n.nodeType===1){fixEl(n);n.querySelectorAll&&n.querySelectorAll('[style]').forEach(fixEl)}})})});
   mo.observe(document.body,{childList:true,subtree:true})}}
 function inlineOff(){document.querySelectorAll('[style]').forEach(function(e){if(inl.has(e)){e.setAttribute('style',inl.get(e));inl.delete(e)}})}
 function apply(){if(isOn()){convert();if(document.body)inlineOn()}else{restore();inlineOff()}}
 /* ---- switch ---- */
 function meta(){var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',isOn()?'#161b18':'#fbf9f4')}
 function lbl(){var ar=(H.lang||'').indexOf('ar')===0;return isOn()?(ar?'الوضع الفاتح':'Light mode'):(ar?'الوضع الليلي':'Night mode')}
 function paint(){document.querySelectorAll('.fqn-btn').forEach(function(b){b.innerHTML='<i class="ph '+(isOn()?'ph-sun':'ph-moon')+'"></i>';b.setAttribute('aria-label',lbl());b.setAttribute('aria-pressed',isOn()?'true':'false');b.title=lbl()})}
 function set(on){H.classList.add('fqn-anim');H.classList.toggle('dark',on);try{localStorage.setItem(K,on?'1':'0')}catch(e){}apply();meta();paint();
  try{if(navigator.vibrate)navigator.vibrate(8)}catch(e){}setTimeout(function(){H.classList.remove('fqn-anim')},450)}
 window.fqNight={set:set,on:isOn,toggle:function(){set(!isOn())},refresh:function(){if(isOn())convert()}};
 function mount(){var fh=document.querySelector('#s-home .fh'),lg=document.getElementById('hLang');
  if(fh&&!fh.querySelector('.fqn-btn')){var b=document.createElement('button');b.className='ib fqn-btn';b.type='button';b.onclick=function(){set(!isOn())};
   if(lg)fh.insertBefore(b,lg);else fh.appendChild(b)}
  paint();meta();if(isOn())apply()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
 window.addEventListener('load',function(){mount();setTimeout(function(){if(isOn())convert()},1500)});
})();
/* hairline under the sticky title bar once the page is scrolled */
(function(){var on=false;addEventListener('scroll',function(){var s=scrollY>8;if(s!==on){on=s;document.documentElement.classList.toggle('fq-scrolled',s)}},{passive:true})})();
