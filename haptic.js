/* Fastaqim haptics: Android uses navigator.vibrate; iPhone (Safari 18+) gets a real tap from a hidden system switch.
   Patterns like [on, off, on] become one tap per "on". Older iPhones simply stay silent. */
(function(){var ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 if(!ios&&typeof navigator.vibrate==='function')return;
 var lb=null,last=0;
 function mk(){if(lb&&lb.isConnected)return lb;lb=document.createElement('label');lb.setAttribute('aria-hidden','true');
  lb.style.cssText='position:fixed;left:-200px;top:0;width:1px;height:1px;overflow:hidden;opacity:.01;pointer-events:none;z-index:-1';
  var i=document.createElement('input');i.type='checkbox';i.setAttribute('switch','');i.tabIndex=-1;lb.appendChild(i);
  var stop=function(e){e.stopPropagation()};lb.addEventListener('click',stop);i.addEventListener('click',stop);i.addEventListener('change',stop);
  (document.body||document.documentElement).appendChild(lb);return lb}
 function tap(){try{mk().click()}catch(e){}}
 var fn=function(p){var a=Array.isArray(p)?p:[p];if(!a.length||!(+a[0]))return true;var now=Date.now();if(now-last<35)return true;last=now;tap();
  var t=0;for(var k=1;k<a.length;k++){t+=+a[k-1]||0;if(k%2===0)(function(d){setTimeout(tap,d)})(t)}return true};
 try{Object.defineProperty(navigator,'vibrate',{value:fn,configurable:true,writable:true})}catch(e){try{navigator.vibrate=fn}catch(_){}}
 window.fqHaptic=fn})();
