/* Fastaqim offline support: the page is fetched fresh when online (so updates reach everyone) and kept for offline use.
   Your to-dos and calendar live on your phone, so they open without WiFi and sync when you are back online. */
const CACHE="fastaqim-v62";
const CORE=["./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png"];
const LIBS=["fonts.googleapis.com","fonts.gstatic.com","cdn.jsdelivr.net","unpkg.com"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function rangeFrom(cached,req){const buf=await cached.arrayBuffer();const m=/bytes=(\d*)-(\d*)/.exec(req.headers.get("range")||"");let a=m&&m[1]?+m[1]:0,b=m&&m[2]?+m[2]:buf.byteLength-1;b=Math.min(b,buf.byteLength-1);
 return new Response(buf.slice(a,b+1),{status:206,headers:{"Content-Type":cached.headers.get("Content-Type")||"audio/mp4","Content-Range":`bytes ${a}-${b}/${buf.byteLength}`,"Content-Length":String(b-a+1),"Accept-Ranges":"bytes"}})}
self.addEventListener("fetch",e=>{const req=e.request;if(req.method!=="GET")return;const url=new URL(req.url);
 if(url.pathname.endsWith(".ics"))return;
 const same=url.origin===self.location.origin;
 if(!same&&!LIBS.includes(url.hostname))return; /* account data, translation, Quran.com: always live */
 if(req.mode==="navigate"||(same&&(url.pathname.endsWith("/index.html")||url.pathname.endsWith("/")))){
  e.respondWith(fetch(req,{cache:"no-cache"}).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put("index.html",cp));return r}).catch(()=>caches.match("index.html")));return}
 if(/\.(m4a|mp3)$/.test(url.pathname)){e.respondWith((async()=>{const c=await caches.open(CACHE);const hit=await c.match(req.url,{ignoreSearch:true});
  if(hit)return req.headers.get("range")?rangeFrom(hit,req):hit;
  try{const full=await fetch(req.url);if(full.ok){await c.put(req.url,full.clone());return req.headers.get("range")?rangeFrom(full,req):full}}catch(err){}return fetch(req)})());return}
 if(url.pathname.endsWith(".pdf"))return;
 e.respondWith(caches.match(req).then(hit=>{const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==="opaque")){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r}).catch(()=>hit);return hit||net}))});
/* reminders sent by the server (when set up) */
self.addEventListener("push",e=>{let d={};try{d=e.data.json()}catch(err){d={title:"Fastaqim",body:e.data?e.data.text():""}}
 e.waitUntil(self.registration.showNotification(d.title||"Fastaqim",{body:d.body||"",icon:"icon-192.png",badge:"icon-192.png",tag:d.tag||"fq",data:{url:d.url||"./"}}))});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(ws=>{for(const w of ws){if("focus" in w)return w.focus()}return clients.openWindow(e.notification.data&&e.notification.data.url||"./")}))});
