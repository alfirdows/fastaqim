/* Fastaqim v6 · Dhikr plus
   1) Tasbih page with two modes: Beads (swipe a bead down or up) and Tap (the original circle).
      8 bead materials drawn in code (no image files), haptic on every bead, stronger at 33/100,
      one mute button, optional soft bead click (synthesised, never music or voice).
   2) Friday salawat card at the top of the Dhikr page (local day).
   3) Hisn al-Muslim audio per dhikr inside the adhkar reader (see HISN_CLIPS).
   Loaded with defer, so it runs after the main script and can use its globals
   (T, AR, L, LI, store, toast, undoToast, openSheet, closeSheet, XB, dzAdd, renderTab, R, NOW, dkey, DICT). */
(function(){
'use strict';
const TX=(e,a,o,s)=>L==='ar'?a:LI===0?(o||e):LI===1?(s||e):e;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const IS_IOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);

/* ---------- settings ---------- */
const DEF={mode:'beads',mat:'olive',goal:33,mute:false,vib:true,snd:true,vol:30};
const st=Object.assign({},DEF,store('tbx')||{});
if(st.mute){st.snd=false;st.vib=false}st.mute=false;   // old single mute button -> two separate switches
const saveSt=()=>store('tbx',st);

/* ---------- haptics ----------
   Android/Chrome: navigator.vibrate. iPhone (iOS 18+): Safari plays the system "switch" tick
   when an <input type=checkbox switch> is toggled through its label, so we click a hidden one.
   It only works inside a tap/swipe handler, so we always call it from pointerup/click/keydown.
   iPad has no vibration motor, so nothing happens there. */
let HL=null;
function hapticEl(){
  // one switch kept in the page (rendered but invisible). Older code put it in <head> with display:none,
  // which newer iOS versions ignore, so nothing was felt.
  if(HL&&HL.isConnected)return HL;
  HL=document.createElement('label');HL.setAttribute('aria-hidden','true');HL.id='tbHL';
  HL.style.cssText='position:fixed;left:0;bottom:0;width:1px;height:1px;opacity:.01;overflow:hidden;pointer-events:none;z-index:-1';
  const i=document.createElement('input');i.type='checkbox';i.setAttribute('switch','');i.tabIndex=-1;HL.appendChild(i);
  document.body.appendChild(HL);return HL
}
function tick(){
  if(IS_IOS){try{hapticEl().click()}catch(e){}return}   // iPhone: always the switch (never navigator.vibrate)
  if(navigator.vibrate){try{navigator.vibrate(12)}catch(e){}}
}
function haptic(strong){
  if(!st.vib)return;
  if(!IS_IOS&&navigator.vibrate){try{navigator.vibrate(strong?[14,45,22,110,14,45,22,110,30]:[7,38,13])}catch(e){}return}
  tick();if(strong){setTimeout(tick,110);setTimeout(tick,220)}
}
/* iOS 26.5+ only buzzes for a REAL finger tap on a <label> that holds a switch (script clicks are
   ignored since WebKit bug 309082). So every tap target here is a label with a hidden switch inside:
   the finger's own tap flips it and iOS plays the tick. Drags make no tap, so on new iPhones a swipe
   can't buzz; a tap can. TAPH tells count() the native tick already covers this tap. */
let TAPH=false;
const HSW='<input type="checkbox" switch class="tb-hs" tabindex="-1" aria-hidden="true">';
function hsw(root){(root||document).querySelectorAll('.tb-hs').forEach(i=>{i.disabled=!st.vib;if(!i._w){i._w=1;i.addEventListener('click',e=>e.stopPropagation())}})}
/* ---------- soft bead click (Web Audio, generated; respects the iPhone silent switch) ---------- */
let AC=null,NB=null;
function ac(){
  if(!AC){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
    try{if(navigator.audioSession)navigator.audioSession.type='ambient'}catch(e){}
    try{AC=new C()}catch(e){return null}
    NB=AC.createBuffer(1,Math.floor(AC.sampleRate*.05),AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
  if(AC.state==='suspended')AC.resume().catch(()=>{});
  loadBeads(AC);
  return AC
}
function knock(a,t,f,q,dec,vol){
  const n=a.createBufferSource();n.buffer=NB;const bp=a.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f;bp.Q.value=q;
  const g=a.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.0015);g.gain.exponentialRampToValueAtTime(.0001,t+dec);
  n.connect(bp).connect(g).connect(a.destination);n.start(t);n.stop(t+dec+.01);
  const o=a.createOscillator();o.type='sine';o.frequency.setValueAtTime(f*.55,t);o.frequency.exponentialRampToValueAtTime(f*.42,t+dec);
  const og=a.createGain();og.gain.setValueAtTime(.0001,t);og.gain.exponentialRampToValueAtTime(vol*.5,t+.001);og.gain.exponentialRampToValueAtTime(.0001,t+dec*.7);
  o.connect(og).connect(a.destination);o.start(t);o.stop(t+dec+.01)
}
/* real bead clicks: short cuts from a CC0 field recording of beads (Freesound #345511 by juliansmart, Creative Commons 0).
   Five takes, picked at random and tuned per material (rate = pitch, lp = warmth), so no two clicks sound the same. */
// [rate, lowpass Hz, gain] - gain evens out loudness between warm (filtered) and bright materials
const SND={olive:[.95,3000,1.46],sandal:[1,3400,1.42],amber:[1.08,4800,1.26],onyx:[1.18,0,.6],jade:[1.15,0,.6],lapis:[1.12,0,.6],
  crystal:[1.42,0,.6],frost:[1.28,6500,1.28],smoky:[1.32,0,.6],pearl:[1.2,5800,1.28],steel:[1.55,0,.65],ceramic:[1.24,6200,1.26]};
let BEADS=null,BLOAD=false;
function loadBeads(a){if(BLOAD||!a)return;BLOAD=true;const base=HCB.replace('hisn/clips/','sfx/');
  Promise.all([1,2,3,4,5].map(i=>fetch(base+'bead-'+i+'.wav').then(r=>r.arrayBuffer()).then(b=>new Promise((ok,no)=>{const pr=a.decodeAudioData(b,ok,no);if(pr&&pr.then)pr.then(ok,no)}))))
   .then(L=>{BEADS=L}).catch(()=>{BLOAD=false})}
function bead(a,t,gain,rate,lp){const src=a.createBufferSource();src.buffer=BEADS[Math.floor(Math.random()*BEADS.length)];
  src.playbackRate.value=rate*(.96+Math.random()*.08);const g=a.createGain();g.gain.value=gain;let n=src;
  if(lp){const f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;f.Q.value=.5;n.connect(f);n=f}
  n.connect(g).connect(a.destination);src.start(t)}
function clack(strong){
  if(!st.snd)return;const a=ac();if(!a)return;const m=MAT[st.mat]||MAT.olive,t=a.currentTime+.005;
  const V=Math.pow(Math.max(0,Math.min(100,st.vol))/100,1.6)*.22;if(V<.001)return; // volume slider (default 30 = soft)
  if(st.mode==='clicker'&&OPEN){knock(a,t,4300,9,.018,V*1.1);knock(a,t+.009,2100,4,.03,V*.6);if(strong){knock(a,t+.15,4300,9,.018,V);knock(a,t+.16,2100,4,.03,V*.5)}return}
  if(BEADS){const p=SND[st.mat]||SND.olive,G=V*1.6*p[2];bead(a,t,G,p[0],p[1]);if(strong){bead(a,t+.14,G*.9,p[0]*.97,p[1]);bead(a,t+.2,G*.55,p[0]*1.02,p[1])}return}
  loadBeads(a);
  knock(a,t,m.f,m.q,m.dec,V);knock(a,t+.022,m.f*1.08,m.q,m.dec*.8,V*.4);
  if(strong){knock(a,t+.16,m.f*.9,m.q,m.dec*1.3,V*.9);knock(a,t+.18,m.f,m.q,m.dec,V*.36)}
}

/* ---------- bead materials, drawn per pixel (sphere + light + texture) ---------- */
const MAT={
 // modern
 crystal: {g:'m',n:['Crystal','كريستال','Kiristaala','Kiristaal'],f:4300,q:12,dec:.07,sq:.84,sp:'gold'},
 frost:   {g:'m',n:['Frosted glass','زجاج مُثلَّج','Burcuqqoo cabbii','Muraayad baraf'],f:3600,q:8,dec:.05},
 smoky:   {g:'m',n:['Smoky quartz','كوارتز مدخّن','Kuwaartsii aaraa','Kuwaarts qiiq'],f:3900,q:10,dec:.06},
 pearl:   {g:'m',n:['Pearl white','أبيض لؤلؤي',"Adii lu'lu'",'Luul cad'],f:3000,q:6,dec:.05},
 steel:   {g:'m',n:['Brushed steel','فولاذ مصقول','Sibiila','Bir la sifeeyay'],f:4500,q:12,dec:.08},
 ceramic: {g:'m',n:['White ceramic','سيراميك أبيض','Seeramikii adii','Dhoobo cad'],f:2900,q:6,dec:.04},
 // classic
 olive:   {g:'c',n:['Olive wood','خشب الزيتون','Muka ejersaa','Alwaax saytuun'],f:1500,q:3,dec:.035},
 sandal:  {g:'c',n:['Sandalwood','خشب الصندل','Muka sandal','Alwaax sandal'],f:1700,q:3,dec:.03},
 amber:   {g:'c',n:['Amber','كهرمان','Ambar','Cambar'],f:2600,q:5,dec:.045},
 onyx:    {g:'c',n:['Onyx','عقيق أسود','Oniksii','Oniks'],f:3300,q:7,dec:.055},
 jade:    {g:'c',n:['Jade','يَشْم','Jeedii','Jeyd'],f:3100,q:7,dec:.055},
 lapis:   {g:'c',n:['Lapis','لازورد','Laaziwardii','Laajward'],f:3200,q:7,dec:.05}
};
if(st.mat==='hematite')st.mat='steel';if(!MAT[st.mat])st.mat='olive';
const matName=k=>{const n=(MAT[k]||MAT.olive).n;return TX(n[0],n[1],n[2],n[3])};

// gradient noise (3D) + fbm
const PERM=(()=>{const p=[];for(let i=0;i<256;i++)p[i]=i;let s=1234567;for(let i=255;i>0;i--){s=(s*16807)%2147483647;const j=s%(i+1);[p[i],p[j]]=[p[j],p[i]]}return p.concat(p)})();
const G3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
const fade=t=>t*t*t*(t*(t*6-15)+10),lerp=(a,b,t)=>a+(b-a)*t;
function noise(x,y,z){const X=Math.floor(x)&255,Y=Math.floor(y)&255,Z=Math.floor(z)&255;x-=Math.floor(x);y-=Math.floor(y);z-=Math.floor(z);
  const u=fade(x),v=fade(y),w=fade(z),g=(h,a,b,c)=>{const q=G3[h%12];return q[0]*a+q[1]*b+q[2]*c};
  const A=PERM[X]+Y,AA=PERM[A]+Z,AB=PERM[A+1]+Z,B=PERM[X+1]+Y,BA=PERM[B]+Z,BB=PERM[B+1]+Z;
  return lerp(lerp(lerp(g(PERM[AA],x,y,z),g(PERM[BA],x-1,y,z),u),lerp(g(PERM[AB],x,y-1,z),g(PERM[BB],x-1,y-1,z),u),v),
              lerp(lerp(g(PERM[AA+1],x,y,z-1),g(PERM[BA+1],x-1,y,z-1),u),lerp(g(PERM[AB+1],x,y-1,z-1),g(PERM[BB+1],x-1,y-1,z-1),u),v),w)}
function fbm(x,y,z,o){let s=0,a=.5,f=1;for(let i=0;i<(o||4);i++){s+=a*noise(x*f,y*f,z*f);a*=.5;f*=2}return s}
const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const sst=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};

// surface: returns {c:[r,g,b] 0..1, spec, pow, metal, trans}
function surface(k,P){
  const [x,y,z]=P;
  switch(k){
  case 'olive':{const w=fbm(x*.9,y*.9,z*.9,3),d=Math.sqrt(x*x+z*z)*4.2+w*1.1,ring=Math.pow(.5+.5*Math.sin(d*6.2832),4);
    const pore=fbm(x*3,y*26,z*3,3)*.5+.5,fig=fbm(x*1.2+9,y*.6,z*1.2,3)*.5+.5;let c=mix([.74,.55,.35],[.60,.42,.25],fig);c=mix(c,[.40,.25,.13],ring*.55);c=mix(c,[.45,.30,.17],sst(.45,.8,pore)*.28);return{c,spec:.42,pow:34}}
  case 'sandal':{const w=fbm(x*.8,y*.8,z*.8,3),d=Math.sqrt(x*x+z*z)*6+w*.9,ring=Math.pow(.5+.5*Math.sin(d*6.2832),5);
    const pore=fbm(x*3,y*30,z*3,3)*.5+.5;let c=mix([.88,.74,.57],[.80,.64,.47],pore);c=mix(c,[.64,.46,.30],ring*.45);return{c,spec:.28,pow:22}}
  case 'amber':{const n=fbm(x*1.1+3,y*1.1,z*1.1,3)*.5+.5,core=Math.min(1,Math.hypot(x,y,z)/1.6);let c=mix([.62,.27,.03],[.93,.58,.14],sst(.3,.75,n)*.55+.2);c=mix(c,[.55,.22,.02],(1-core)*.25);return{c,spec:1.1,pow:110,trans:[1,.66,.2]}}
  case 'pearl':{const n=fbm(x*2,y*2,z*2,3)*.5+.5;return{c:mix([.97,.95,.92],[.90,.88,.86],n),spec:.55,pow:16,pearl:1}}
  case 'onyx':{const b=Math.sin((y+fbm(x,y,z)*.8)*9)*.5+.5;return{c:mix([.04,.04,.05],[.11,.11,.12],b*.35),spec:1.1,pow:140,env:.35}}
  case 'jade':{const n=fbm(x*1.4,y*1.4,z*1.4,5)*.5+.5,v=Math.abs(fbm(x*3+7,y*3,z*3,3));let c=mix([.30,.56,.42],[.58,.76,.62],sst(.3,.75,n));c=mix(c,[.80,.88,.80],sst(.06,0,v)*.35);return{c,spec:.75,pow:70,trans:[.55,.8,.6]}}
  case 'lapis':{const n=fbm(x*1.8,y*1.8,z*1.8,5)*.5+.5,fl=noise(x*22,y*22,z*22),wv=Math.abs(fbm(x*2.5+5,y*2.5,z*2.5,3));let c=mix([.09,.17,.47],[.18,.30,.66],n);
    c=mix(c,[.80,.82,.86],sst(.05,0,wv)*.45);if(fl>.42)c=mix(c,[.86,.70,.36],sst(.42,.6,fl));return{c,spec:.6,pow:60}}
  case 'steel':{const br=noise(x*1.5,y*46,z*1.5)*.07+noise(x*3,y*90,z*3)*.04;return{c:[.60+br,.62+br,.65+br],spec:.9,pow:50,metal:1,env:.85}}
  case 'ceramic':{const n=fbm(x*3,y*3,z*3,2)*.012;return{c:[.94+n,.935+n,.92+n],spec:.55,pow:46}}
  case 'gold':return{c:[.80,.60,.24],spec:1.1,pow:80,metal:1,env:.9,et:[1,.82,.48]};
  }
  return{c:[.5,.5,.5],spec:.3,pow:20}
}
/* glass family: faceted crystal with a soft rainbow (AB) shimmer, frosted glass, smoky quartz.
   Returns [r,g,b,alpha]; alpha < 1 so the thread shows through, like real glass. */
const fr=x=>x-Math.floor(x);
function glass(k,nx,ny,nz,HZ,seed){
  const ndh=Math.max(0,nx*H3[0]+ny*H3[1]+nz*H3[2]),ndl=nx*L3[0]+ny*L3[1]+nz*L3[2],rim=Math.pow(1-nz,2.2);
  if(k==='crystal'){
    // faceted rondelle with diamond-shaped facets. Mostly clear and bright, a few facets catch the darker
    // surroundings (that contrast is what makes cut glass read as glass), some carry a soft rainbow coat.
    const ox=HZ?ny:nx,oy=HZ?nx:ny,lat=Math.asin(Math.max(-1,Math.min(1,oy))),lon=Math.atan2(ox,nz)+seed*1.7;
    const A=lon/(2*Math.PI)*14,B=lat/Math.PI*5.2,pp=A+B,qq=A-B,pi=Math.floor(pp),qi=Math.floor(qq);
    const de=Math.min(fr(pp),1-fr(pp),fr(qq),1-fr(qq))*Math.max(.35,Math.cos(lat));
    const Ac=(pi+qi+1)/2,Bc=(pi-qi)/2,latC=Bc/5.2*Math.PI,lonC=Ac/14*2*Math.PI-seed*1.7;
    const fy=Math.sin(latC),fx=Math.cos(latC)*Math.sin(lonC),fz=Math.cos(latC)*Math.cos(lonC);
    const vx=HZ?fy:fx,vy=HZ?fx:fy,vz=fz,h=fr(Math.sin(pi*12.99+qi*78.23+seed*37.7)*43758.5);
    const ry=-vy*.8+vx*.3;let env=.93+.07*sst(-.5,.6,ry)+.04*nz;
    if(h<.13)env=.66+h*1.2;else if(h<.25)env=.86;                                          // darker facets = depth
    let c=[env*.97,env*.982,env];
    if(h>.76){const hu=fr(h*5.3+seed*.37),t=(h-.76)/.24*.5,rb=[.5+.5*Math.cos(6.283*hu),.5+.5*Math.cos(6.283*(hu+.33)),.5+.5*Math.cos(6.283*(hu+.67))].map(v=>.66+.34*v);c=mix(c,rb,t)}
    const edge=1-sst(0,.05,de);c=c.map(v=>v*(1-.11*edge));
    const fdh=Math.max(0,vx*H3[0]+vy*H3[1]+vz*H3[2]),sp=Math.pow(fdh,60)*1.1+Math.pow(ndh,300)*.8;
    c=c.map(v=>v*(1-.28*rim)+sp);
    return[c[0],c[1],c[2],.90+.10*rim]}
  if(k==='frost'){
    const gr=noise(nx*40+seed,ny*40,nz*40)*.02,b=.86+.08*sst(-.3,.9,ny)+.06*Math.max(0,ndl)+gr;
    let c=[b*.985,b*.99,b];c=c.map(v=>v*(1-.10*rim)+Math.pow(ndh,14)*.22);
    return[c[0],c[1],c[2],.92]}
  // smoky quartz
  const tint=[.50,.43,.37],caus=Math.pow(Math.max(0,-ndl*.7+.35),2)*1.1;
  let c=tint.map((v,ix)=>v*(.55+.45*sst(-.4,.9,ny))+[.95,.78,.6][ix]*caus*.35);
  c=c.map(v=>v*(1-.45*rim)+Math.pow(ndh,130)*1.4+Math.pow(ndh,18)*.08);
  return[c[0],c[1],c[2],.86+.14*rim]
}
const L3=(()=>{const v=[-.48,-.62,.62],m=Math.hypot(...v);return v.map(a=>a/m)})();
const H3=(()=>{const v=[L3[0],L3[1],L3[2]+1],m=Math.hypot(...v);return v.map(a=>a/m)})();
function drawBead(k,seed,px,ax){
  const HZ=ax==='h';
  const c=document.createElement('canvas');c.width=c.height=px;const g=c.getContext('2d');
  const pad=px*.1,r=(px-2*pad)/2,cx=px/2,cy=px/2-pad*.25;
  // soft contact shadow under the bead
  const sh=g.createRadialGradient(cx+r*.12,cy+r*.22,r*.2,cx+r*.12,cy+r*.22,r*1.12);sh.addColorStop(0,'rgba(40,30,15,.28)');sh.addColorStop(1,'rgba(40,30,15,0)');
  g.fillStyle=sh;g.beginPath();g.arc(cx+r*.12,cy+r*.22,r*1.12,0,7);g.fill();
  const img=g.getImageData(0,0,px,px),d=img.data;
  const ca=Math.cos(seed*2.1),sa=Math.sin(seed*2.1),cb=Math.cos(seed*1.3),sb=Math.sin(seed*1.3);
  const SQ=(MAT[k]&&MAT[k].sq)||1,GL=k==='crystal'||k==='frost'||k==='smoky';
  for(let j=0;j<px;j++)for(let i=0;i<px;i++){
    const ex=(i+.5-cx)/r,ey=(j+.5-cy)/r,nx=HZ?ex/SQ:ex,ny=HZ?ey:ey/SQ,q=nx*nx+ny*ny;if(q>1.02)continue;
    const nz=Math.sqrt(Math.max(0,1-q)),aa=Math.min(1,Math.max(0,(1-Math.sqrt(q))*r*SQ+.5));
    if(GL){const o=(j*px+i)*4,gc=glass(k,nx,ny,nz,HZ,seed),A=aa*gc[3];
      d[o]=d[o]*(1-A)+Math.min(255,gc[0]*255)*A;d[o+1]=d[o+1]*(1-A)+Math.min(255,gc[1]*255)*A;d[o+2]=d[o+2]*(1-A)+Math.min(255,gc[2]*255)*A;d[o+3]=Math.max(d[o+3],A*255);continue}
    // object-space point (rotated per seed so beads differ)
    const ox=HZ?ny:nx,oy=HZ?nx:ny;let px1=ox*ca-nz*sa,pz1=ox*sa+nz*ca,py1=oy*cb-pz1*sb,pz2=oy*sb+pz1*cb;
    const s=surface(k,[px1*1.3+seed*5.7,py1*1.3,pz2*1.3]);
    const ndl=nx*L3[0]+ny*L3[1]+nz*L3[2],dif=Math.max(0,ndl),ndh=Math.max(0,nx*H3[0]+ny*H3[1]+nz*H3[2]);
    let col=s.c.map(v=>v*(.30+.78*dif));
    if(s.trans){const back=Math.pow(Math.max(0,-ndl*.6+.45),2)*.9;col=col.map((v,ix)=>v+s.trans[ix]*back*.55)}
    if(s.pearl){const t=Math.pow(1-nz,1.6);col=[col[0]+.025*Math.sin(t*7)+.02*t,col[1]+.015*Math.sin(t*7+2),col[2]+.03*Math.sin(t*7+4)]}
    const ry=2*nz*ny,env=.55-.45*ry;
    if(s.env){const e=Math.max(0,env)*s.env;col=col.map((v,ix)=>v*(1-(s.metal?.55:0))+e*(s.metal?.75:.22)*(s.et?s.et[ix]:1))}
    const fres=Math.pow(1-nz,3)*(s.metal?.35:.28);col=col.map(v=>v*(1-fres)+fres*.92);
    const sp=Math.pow(ndh,s.pow)*s.spec+Math.pow(ndh,s.pow/6)*s.spec*.12;col=col.map(v=>v+sp);
    // darken where beads touch the string hole (poles)
    const pole=sst(.86,1,Math.abs(oy))*nz*.25;col=col.map(v=>v*(1-pole));
    const o=(j*px+i)*4,A=aa;
    d[o]=d[o]*(1-A)+Math.min(255,col[0]*255)*A;d[o+1]=d[o+1]*(1-A)+Math.min(255,col[1]*255)*A;d[o+2]=d[o+2]*(1-A)+Math.min(255,col[2]*255)*A;d[o+3]=Math.max(d[o+3],A*255)}
  g.putImageData(img,0,0);return c.toDataURL('image/png')
}
const BCACHE={};
function beadImg(k,v,px,ax){ax=ax==='h'?'h':'v';const key=k+v+ax+'_'+px;return BCACHE[key]||(BCACHE[key]=drawBead(k,v+(Math.max(0,Object.keys(MAT).indexOf(k))*.37),px,ax))}

/* ---------- counting ---------- */
let ctx=null; // {key, title, phrase, goal}
const DK=()=>dkey(NOW());
function getN(){if(ctx&&ctx.key)return (store(ctx.key)||{})[DK()]||0;return store('tsb')||0}
function setN(n){if(ctx&&ctx.key){const o=store(ctx.key)||{},dk=DK();o[dk]=n;Object.keys(o).forEach(x=>{if(x<dkey(new Date(NOW()-40*864e5)))delete o[x]});store(ctx.key,o)}else store('tsb',n)}
const goal=()=>ctx?ctx.goal:st.goal;
function strongAt(n){const g=goal();if(n<=0)return false;if(g===100){const w=((n-1)%100)+1;return w===33||w===66||w===100}if(g===0)return n%33===0||n%100===0;return n%33===0}
function curTab(){const a=document.querySelector('#tab a.on');return a?a.dataset.tab:'home'}
function count(){
  const n=getN()+1;setN(n);dzAdd(1);try{renderTab(curTab())}catch(e){}
  const g=goal(),strong=strongAt(n),done=g>0&&n%g===0;
  if(!(IS_IOS&&TAPH))haptic(strong||done);clack(strong||done);
  paintCount(n,true);if(done)roundDone(n);else if(strong)pulse()
}

/* ---------- page ---------- */
function ensurePage(){
  let p=document.getElementById('tbx');if(p)return p;
  p=document.createElement('div');p.id='tbx';p.className='tbx';p.setAttribute('role','dialog');p.setAttribute('aria-modal','true');
  document.body.appendChild(p);return p
}
let OPEN=false;
function tasbihPlus(o){
  ctx=o&&o.key?o:null;
  const p=ensurePage();OPEN=true;
  p.innerHTML=`<div class="tbw">
  <div class="hd sub"><button class="ib" id="tbBack" aria-label="${esc(TX('Back','رجوع','Duubatti','Dib u noqo'))}"><i class="ph ph-caret-left flip"></i></button><h1 id="tbT"></h1><span class="tb-av"><button class="ib tb-mu" id="tbSndB"></button><button class="ib tb-mu" id="tbVibB"></button></span></div>
  ${styRow()}
  <p class="tb-ph" id="tbPh" lang="ar" dir="rtl" hidden></p>
  <div class="tb-cn" id="tbCn" aria-live="polite"><b id="tbN"></b><small id="tbOf"></small><span class="tb-pr"><i id="tbPr"></i></span><span class="tb-rg" id="tbRg"></span></div>
  <div class="tb-stage" id="tbStage"></div>
  <p class="tb-hint" id="tbHint"></p>
  <div class="tb-goal" role="group" aria-label="${esc(TX('Goal','الهدف','Galma','Hadaf'))}">${[33,99,100,0].map(g=>`<button data-g="${g}">${g?AR(g):'∞'}</button>`).join('')}</div>
  <div class="tb-bar"><button class="tb-mat" id="tbMat"><img alt="" id="tbMatI"><span id="tbMatN"></span><i class="ph ph-caret-down"></i></button><button class="tb-rs" id="tbUndo"><i class="ph ph-arrow-u-up-left flip"></i><span>${TX('Undo','تراجع','Deebisi','Ka noqo')}</span></button><button class="tb-rs" id="tbReset"><i class="ph ph-arrow-counter-clockwise"></i><span>${TX('Reset','تصفير','Haqi','Tirtir')}</span></button></div>
  </div>`;
  document.getElementById('tbT').textContent=ctx?ctx.title:T('Tasbih','التسبيح');
  if(ctx&&ctx.phrase){const ph=document.getElementById('tbPh');ph.textContent=ctx.phrase;ph.hidden=false}
  p.classList.add('on');document.documentElement.classList.add('tbx-open');
  document.getElementById('tbBack').onclick=closePage;
  // sound and vibration are two separate switches (no popup: the button itself shows on / off)
  document.getElementById('tbSndB').onclick=()=>{st.snd=!st.snd;saveSt();paintAV();if(st.snd)clack(false)};
  document.getElementById('tbVibB').onclick=()=>{st.vib=!st.vib;saveSt();paintAV();hsw();if(st.vib&&!IS_IOS)haptic(false)};
  p.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{if(st.mode===b.dataset.m)return;st.mode=b.dataset.m;saveSt();haptic(false);paintMode()});
  p.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{const g=+b.dataset.g;if(ctx){ctx.goal=g;st.salGoal=g}else st.goal=g;saveSt();haptic(false);paintGoal();paintCount(getN())});
  document.getElementById('tbMat').onclick=styleSheet;
  document.getElementById('tbUndo').onclick=()=>{if(!getN())return;if(beads&&beads.undo)beads.undo();else uncount();if(beads&&beads.paint)beads.paint()};
  document.getElementById('tbReset').onclick=()=>{const was=getN();if(!was)return;setN(0);paintCount(0);try{renderTab(curTab())}catch(e){}
    undoToast(T('Counter reset to 0','تم التصفير'),()=>{setN(was);paintCount(was)})};
  paintAV();paintGoal();paintMode();paintMat();paintCount(getN());
  document.addEventListener('keydown',onKey);
  ac();// prepare audio inside the opening tap
}
function closePage(){const p=document.getElementById('tbx');if(!p)return;OPEN=false;p.classList.remove('on');document.documentElement.classList.remove('tbx-open');
  document.removeEventListener('keydown',onKey);if(beads)beads.stop();beads=null;
  try{if(document.getElementById('s-dhikr').classList.contains('on'))R.dhikr();R.home&&R.home()}catch(e){}}
function onKey(e){if(!OPEN)return;if(document.getElementById('sh').classList.contains('on'))return;
  if(e.key==='Escape'){closePage();return}
  if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
  if(e.key==='ArrowDown'||e.key===' '||e.key==='Enter'){if(e.target&&e.target.tagName==='BUTTON'&&e.key!=='ArrowDown')return;e.preventDefault();beads?beads.step(1):count()}
  else if(e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();beads?beads.step(-1):count()}
  else if(e.key==='ArrowRight'){e.preventDefault();beads?beads.step(1):count()}}
function paintAV(){
  const sb=document.getElementById('tbSndB'),vb=document.getElementById('tbVibB');if(!sb)return;
  sb.innerHTML=`<i class="ph ${st.snd?'ph-speaker-high':'ph-speaker-slash'}"></i>`;sb.setAttribute('aria-pressed',String(st.snd));sb.classList.toggle('off',!st.snd);
  sb.setAttribute('aria-label',TX('Bead sound','صوت الحبّات','Sagalee callee','Codka kuusha')+': '+(st.snd?TX('on','يعمل','banaa','shidan'):TX('off','مُطفأ','cufaa','dansan')));
  vb.innerHTML=`<i class="ph ph-vibrate"></i>`;vb.setAttribute('aria-pressed',String(st.vib));vb.classList.toggle('off',!st.vib);
  vb.setAttribute('aria-label',TX('Vibration','الاهتزاز','Raafama','Gariir')+': '+(st.vib?TX('on','يعمل','banaa','shidan'):TX('off','مُطفأ','cufaa','dansan')))}
function paintGoal(){const g=goal();document.querySelectorAll('#tbx [data-g]').forEach(b=>{const on=+b.dataset.g===g;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on))})}
function paintMat(){document.getElementById('tbMatI').src=beadImg(st.mat,0,72);document.getElementById('tbMatN').textContent=matName(st.mat)}
function paintCount(n,bump){const ub=document.getElementById('tbUndo');if(ub)ub.disabled=!n;
  const g=goal(),b=document.getElementById('tbN');if(!b)return;b.textContent=AR(n);
  const within=g>0?(n>0?((n-1)%g)+1:0):n,round=g>0?Math.max(1,Math.ceil(n/g)):0;
  document.getElementById('tbOf').textContent=g>0?TX(`${within} of ${g} · Round ${round}`,`${AR(within)} من ${AR(g)} · الجولة ${AR(round)}`,`${within} keessaa ${g} · Marsaa ${round}`,`${within} ka mid ah ${g} · Wareeg ${round}`):TX('No goal','بلا هدف','Galma malee','Hadaf la\'aan');
  document.getElementById('tbPr').style.width=(g>0?within/g*100:0)+'%';
  document.getElementById('tbCn').classList.toggle('nog',!(g>0));
  if(bump){b.classList.remove('bp');void b.offsetWidth;b.classList.add('bp')}
  const tapB=document.getElementById('tbTap');if(tapB)tapB.querySelector('b').textContent=AR(n);
  const lcd=document.getElementById('tbLcd');if(lcd)lcd.innerHTML=seg7(n)
}
function pulse(){const r=document.getElementById('tbRg');if(!r)return;r.classList.remove('go');void r.offsetWidth;r.classList.add('go')}
function roundDone(n){
  pulse();const cn=document.getElementById('tbCn');if(!cn)return;
  let sp='';for(let i=0;i<16;i++){const a=i/16*Math.PI*2,rr=70+Math.random()*36;sp+=`<i style="--x:${(Math.cos(a)*rr).toFixed(0)}px;--y:${(Math.sin(a)*rr).toFixed(0)}px;animation-delay:${(Math.random()*.12).toFixed(2)}s"></i>`}
  const f=document.createElement('div');f.className='tb-fx';f.innerHTML=sp+`<em>${esc(TX('Round complete','اكتملت الجولة','Marsaan xumurame','Wareeggii waa dhammaaday'))}</em>`;cn.appendChild(f);setTimeout(()=>f.remove(),1700)
}
/* ---------- styles: 4 bead strands + counter device + tap ---------- */
const STY=(()=>{
  const ring=(()=>{let s='<circle cx="12" cy="12.5" r="8" class="t"/>';for(let i=0;i<9;i++){const a=-Math.PI/2+(i+1)*2*Math.PI/10.6,x=12+8*Math.cos(a),y=12.5+8*Math.sin(a);s+=`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="1.9" class="b"/>`}return s})();
  const loop=(()=>{let s='<path d="M4.5 1.5V9a7.5 8.5 0 0 0 15 0V1.5" class="t"/>';const P=[[4.5,4],[4.9,9.2],[6.6,13.3],[9.4,16.4],[14.6,16.4],[17.4,13.3],[19.1,9.2],[19.5,4]];P.forEach(p=>s+=`<circle cx="${p[0]}" cy="${p[1]}" r="1.9" class="b"/>`);return s})();
  return[
  {k:'beads',kind:'v',n:['Up-down','أعلى وأسفل','Ol-gad','Kor-hoos'],h:['Slide a bead until it touches the next one','حرّك الحبّة حتى تلامس التي بعدها','Callee itti aanu tuqutti harkisi','Kuul jiid ilaa ay taabato tan xigta'],
   i:'<path d="M12 1v22" class="t"/><circle cx="12" cy="4.6" r="2.7" class="b"/><circle cx="12" cy="10.2" r="2.7" class="b"/><circle cx="12" cy="18.6" r="2.7" class="b"/>'},
  {k:'side',kind:'h',n:['Side','جانبي','Gama-gama','Dhinac'],h:['Slide a bead until it touches the next one','حرّك الحبّة حتى تلامس التي بعدها','Callee itti aanu tuqutti harkisi','Kuul jiid ilaa ay taabato tan xigta'],
   i:'<path d="M1 12h22" class="t"/><circle cx="4.6" cy="12" r="2.7" class="b"/><circle cx="10.2" cy="12" r="2.7" class="b"/><circle cx="18.6" cy="12" r="2.7" class="b"/>'},
  {k:'ring',kind:'ring',n:['Round','دائري','Geengoo','Goobo'],h:['Slide a bead until it touches the next one','حرّك الحبّة حتى تلامس التي بعدها','Callee itti aanu tuqutti harkisi','Kuul jiid ilaa ay taabato tan xigta'],i:ring},
  {k:'loop',kind:'loop',n:['Hanging','معلّقة','Fannifamaa','Sudhan'],h:['Slide a bead until it touches the next one','حرّك الحبّة حتى تلامس التي بعدها','Callee itti aanu tuqutti harkisi','Kuul jiid ilaa ay taabato tan xigta'],i:loop},
  {k:'clicker',n:['Counter','عدّاد','Lakkooftuu','Tiriye'],h:['Press the button to count','اضغط الزرّ للعدّ',"Lakkaa'uuf qabduu tuqi",'Riix badhanka si aad u tiriso'],
   i:'<path d="M10.6 2.6a1.4 1.4 0 0 1 2.8 0" class="t"/><path d="M12 3.6c4.5 0 7.6 3.6 7.6 9.1 0 5-3.4 8.7-7.6 8.7s-7.6-3.7-7.6-8.7c0-5.5 3.1-9.1 7.6-9.1z" class="t"/><rect x="8.7" y="7" width="6.6" height="3.2" rx="1" class="t"/><circle cx="12" cy="15.2" r="3.3" class="b"/>'},
  {k:'tap',n:['Tap','لمس','Tuqi','Taabo'],h:['Tap the circle to count','اضغط على الدائرة للعدّ',"Lakkaa'uuf geengoo tuqi",'Taabo goobada si aad u tiriso'],
   i:'<circle cx="12" cy="12" r="9" class="t"/><circle cx="12" cy="12" r="4.2" class="b"/>'}]})();
const styOf=k=>STY.find(s=>s.k===k)||STY[0];
const styName=s=>TX(s.n[0],s.n[1],s.n[2],s.n[3]);
function styRow(){return`<div class="tb-sty" role="radiogroup" aria-label="${esc(TX('Counting style','طريقة العدّ',"Akkaataa lakkaa'uu",'Qaabka tirinta'))}">${STY.map(s=>`<button role="radio" data-m="${s.k}" aria-label="${esc(styName(s))}" title="${esc(styName(s))}"><svg viewBox="0 0 24 24" aria-hidden="true">${s.i}</svg></button>`).join('')}</div>`}

function paintMode(){
  if(!STY.some(s=>s.k===st.mode))st.mode='beads';
  const s=styOf(st.mode);
  document.querySelectorAll('#tbx [data-m]').forEach(b=>{const on=b.dataset.m===st.mode;b.classList.toggle('on',on);b.setAttribute('aria-checked',String(on))});
  const sg=document.getElementById('tbStage');if(beads){beads.stop();beads=null}
  const noBeads=st.mode==='tap'||st.mode==='clicker';
  document.getElementById('tbx').classList.toggle('tap',noBeads);
  document.getElementById('tbHint').innerHTML=`<b>${esc(styName(s))}</b> · ${esc(TX(s.h[0],s.h[1],s.h[2],s.h[3]))}`;
  document.getElementById('tbMat').hidden=noBeads;
  if(st.mode==='tap'){sg.innerHTML=`<label class="tb-tap" id="tbTap" role="button" aria-label="${esc(TX('Count','عُدّ',"Lakkaa'i",'Tiri'))}">${HSW}<b>${AR(getN())}</b></label>`;hsw(sg);
    document.getElementById('tbTap').addEventListener('click',()=>{TAPH=true;count();TAPH=false;const t=document.getElementById('tbTap');t.classList.remove('pr');void t.offsetWidth;t.classList.add('pr')})}
  else if(st.mode==='clicker')beads=Clicker(sg);
  else beads=Beads(sg,s.kind);
}

/* ---------- counter device (original design: light body, LCD with ghost digits, one big button) ---------- */
const SEGS={0:'abcdef',1:'bc',2:'abged',3:'abgcd',4:'fgbc',5:'afgcd',6:'afgedc',7:'abc',8:'abcdefg',9:'abcdfg'};
function seg7(n){
  const W=13,Hh=24,T=2.6,G=.5,str=String(n%10000),dg=4,out=[];
  const hz=(x,y)=>`${x+T/2+G},${y} ${x+T+G},${y-T/2} ${x+W-T-G},${y-T/2} ${x+W-T/2-G},${y} ${x+W-T-G},${y+T/2} ${x+T+G},${y+T/2}`;
  const vt=(x,y0,y1)=>`${x},${y0+T/2+G} ${x+T/2},${y0+T+G} ${x+T/2},${y1-T-G} ${x},${y1-T/2-G} ${x-T/2},${y1-T-G} ${x-T/2},${y0+T+G}`;
  for(let d=0;d<dg;d++){const x=3+d*16.5,y=3,ch=str[str.length-dg+d],on=ch!=null?SEGS[ch]:'';
    const P={a:hz(x,y),g:hz(x,y+Hh/2),d:hz(x,y+Hh),f:vt(x+T/2,y,y+Hh/2),e:vt(x+T/2,y+Hh/2,y+Hh),b:vt(x+W-T/2,y,y+Hh/2),c:vt(x+W-T/2,y+Hh/2,y+Hh)};
    for(const k in P)out.push(`<polygon points="${P[k]}" class="${on.includes(k)?'on':''}"/>`)}
  return out.join('')
}
function Clicker(stage){
  stage.innerHTML=`<div class="tb-clk"><div class="tb-ck" id="tbClk"><div class="tb-lcd"><svg viewBox="0 0 70 30" id="tbLcd" aria-hidden="true"></svg></div><label class="tb-ckb" id="tbCkB" role="button" aria-label="${esc(TX('Count','عُدّ',"Lakkaa'i",'Tiri'))}">${HSW}<span></span></label></div></div>`;
  const lcd=document.getElementById('tbLcd'),b=document.getElementById('tbCkB');
  const paint=()=>{lcd.innerHTML=seg7(getN())};paint();
  const dn=()=>b.classList.add('dn'),upv=()=>b.classList.remove('dn');
  b.addEventListener('pointerdown',dn);b.addEventListener('pointerleave',upv);b.addEventListener('pointercancel',upv);
  hsw(stage);b.addEventListener('click',()=>{upv();TAPH=true;count();TAPH=false;paint()});
  return{step(){dn();count();paint();setTimeout(upv,110)},stop(){},refresh(){},paint}
}

/* ---------- bead strands: v (up-down), h (side), ring (round), loop (hanging) ----------
   Real-bead physics: every bead sits on the thread on its own. The bead under the finger follows it
   1:1 and pushes any beads it runs into; nothing else moves. A bead counts the moment it is moved
   across open space and touches the bead on the other side (the click and tick land right then).
   Flick it and it glides on by itself and clicks into place. The space can be anywhere: pull any
   bead away from its neighbour and a new space opens there. Pulling a bead back in the same
   gesture takes that count back. */
let beads=null;
const clampN=(a,b,...v)=>Math.round(Math.max(a,Math.min(b,...v)));
function uncount(){const n=getN();if(n<=0)return;setN(n-1);dzAdd(-1);try{renderTab(curTab())}catch(e){}paintCount(n-1)}
function Beads(stage,kind){
  stage.innerHTML=`<div class="tb-str k-${kind}" id="tbStr" tabindex="0" role="button"><svg class="tb-th" aria-hidden="true"><path/></svg><label class="tb-hl" aria-hidden="true">${HSW}</label></div>`;
  const el=stage.firstChild,svg=el.firstChild,thp=svg.firstChild,lab=el.querySelector('.tb-hl');hsw(el);
  el.setAttribute('aria-label',TX('Bead counter. Slide a bead across the space, or press the arrow keys.','عدّاد المسبحة. حرّك حبّة عبر الفراغ أو استخدم الأسهم.',"Lakkaa'aa callee. Callee tokko harkisi.",'Tiriyaha kuusha. Kuul jiid.'));
  const dpr=Math.min(3,window.devicePixelRatio||2),RTL=document.documentElement.dir==='rtl';
  const tapDir=(kind==='h'||kind==='loop')&&RTL?-1:1;
  let SPC=false,W=0,H=0,D=0,E=0,S=0,GAP=0,N=0,LV=0,C=0,R=0,cx=0,cy=0,px=0,P=null,periodic=false,alive=true;
  let BS=[],FREE=[],gid=0,raf=0,dn=null,last=null,idle=0;
  const EPS=.6;                                   // px: closer than this = touching
  const ease=t=>1-Math.pow(1-t,3);
  const mk=()=>{const b=FREE.pop()||(()=>{const e=document.createElement('i');e.className='tb-bd';e.setAttribute('aria-hidden','true');el.appendChild(e);
      let s=null;if(SPC){s=document.createElement('i');s.className='tb-bd tb-sp';s.setAttribute('aria-hidden','true');el.appendChild(s)}return{el:e,sp:s}})();
    b.el.style.visibility='';b.tw=null;b.v=0;return b};
  const drop=b=>{b.el.style.visibility='hidden';if(b.sp)b.sp.style.visibility='hidden';FREE.push(b)};
  // signed distance from bead a to the next bead in direction d (periodic aware); Infinity if none
  const idx=b=>BS.indexOf(b);
  function nb(i,d){if(periodic)return BS[(i+d+N)%N];return BS[i+d]}
  function sep(i,d){const o=nb(i,d);if(!o)return Infinity;let g=(o.x-BS[i].x)*d;if(periodic){g=((g%C)+C)%C}return g-S}
  function layout(){
    W=el.clientWidth||340;H=el.clientHeight||360;cx=W/2;cy=H/2;periodic=false;let d='';
    if(kind==='v'){D=clampN(46,74,H/6.6,W*.22);P=u=>[cx,cy+u,0,1];LV=H/2;d=`M${cx} -20V${H+20}`}
    else if(kind==='h'){D=clampN(42,66,W/6.2,H*.3);P=u=>[cx+u,cy,1,0];LV=W/2;d=`M-20 ${cy}H${W+20}`}
    else if(kind==='ring'){D=clampN(30,46,Math.min(W,H)*.13);R=Math.min(W,H)/2-D*.66;C=2*Math.PI*R;
      P=u=>{const t=-Math.PI/2+u/R,c=Math.cos(t),s=Math.sin(t);return[cx+R*c,cy+R*s,-s,c]};d=`M${cx} ${cy-R}a${R} ${R} 0 1 1 -.01 0Z`}
    else{D=clampN(34,54,Math.min(W*.13,H*.16));const a=Math.min(W*.34,H*.4),b=Math.min(H*.52,a*1.3),cyE=H-D*.72-b;
      const M=240,pts=[];let acc=0,pv=null;for(let i=0;i<=M;i++){const f=-Math.PI/2+Math.PI*i/M,x=cx+a*Math.sin(f),y=cyE+b*Math.cos(f);if(pv)acc+=Math.hypot(x-pv[0],y-pv[1]);pts.push([acc,x,y,f]);pv=[x,y]}
      const half=acc/2;LV=half+cyE+D;
      P=u=>{if(u>=half)return[cx+a,cyE-(u-half),0,-1];if(u<=-half)return[cx-a,cyE-(-u-half),0,1];
        const t=u+half;let lo=0,hi=M;while(hi-lo>1){const m=(lo+hi)>>1;if(pts[m][0]<t)lo=m;else hi=m}
        const A=pts[lo],B=pts[hi],k=(t-A[0])/((B[0]-A[0])||1),f=A[3]+(B[3]-A[3])*k,tx=a*Math.cos(f),ty=-b*Math.sin(f),m=Math.hypot(tx,ty)||1;
        return[A[1]+(B[1]-A[1])*k,A[2]+(B[2]-A[2])*k,tx/m,ty/m]};
      d=`M${cx-a} -30V${cyE}A${a} ${b} 0 0 0 ${cx+a} ${cyE}V-30`}
    const spc=!!(MAT[st.mat]||{}).sp;
    if(spc!==SPC||!BS.length){BS.concat(FREE).forEach(b=>{b.el.remove();if(b.sp)b.sp.remove()});BS=[];FREE=[]}
    SPC=spc;S=D*(SPC?1.2:.97);GAP=D*(kind==='ring'?.9:.95);E=D/.8;px=Math.round(E*dpr);
    // keep the beads where they are on a resize; start fresh only the first time (one space in the middle)
    BS.forEach(drop);BS=[];
    if(kind==='ring'){N=Math.max(12,Math.floor((C-GAP)/S));periodic=true;
      for(let i=0;i<N;i++){const b=mk();b.x=GAP/2+S/2+i*S;b.vi=i%5;BS.push(b)}}
    else{const n=Math.ceil(LV/S)+3;for(let i=-n;i<n;i++){const b=mk();b.x=(i+.5)*S+(i<0?-GAP/2:GAP/2);b.vi=((i%5)+5)%5;b.g=i;BS.push(b)}}
    BS.forEach(b=>{b.el.style.width=b.el.style.height=E+'px';b.el._k='';if(b.sp){const se=D*.36/.8;b.sp.style.width=b.sp.style.height=se+'px';b.sp._e=se;b.sp.style.backgroundImage=`url(${beadImg('gold',0,Math.round(se*dpr),'v')})`}});
    svg.setAttribute('width',W);svg.setAttribute('height',H);thp.setAttribute('d',d);el.dataset.step=String(Math.round(GAP));draw()
  }
  // endless thread: add packed beads at an open end, drop beads far out of view
  function recycle(){if(periodic)return;
    while(BS[0].x>-LV-E-S){const f=BS[0],b=mk();b.x=f.x-S;b.g=f.g-1;b.vi=((b.g%5)+5)%5;b.el.style.width=b.el.style.height=E+'px';b.el._k='';if(b.sp){b.sp.style.width=b.sp.style.height=(D*.36/.8)+'px';b.sp._e=D*.36/.8;b.sp.style.backgroundImage=`url(${beadImg('gold',0,Math.round(D*.36/.8*dpr),'v')})`}BS.unshift(b)}
    while(BS[BS.length-1].x<LV+E+S){const f=BS[BS.length-1],b=mk();b.x=f.x+S;b.g=f.g+1;b.vi=((b.g%5)+5)%5;b.el.style.width=b.el.style.height=E+'px';b.el._k='';if(b.sp){b.sp.style.width=b.sp.style.height=(D*.36/.8)+'px';b.sp._e=D*.36/.8;b.sp.style.backgroundImage=`url(${beadImg('gold',0,Math.round(D*.36/.8*dpr),'v')})`}BS.push(b)}
    while(BS.length>4&&BS[1].x<-LV-E-3*S&&!(dn&&dn.b===BS[0]))drop(BS.shift());
    while(BS.length>4&&BS[BS.length-2].x>LV+E+3*S&&!(dn&&dn.b===BS[BS.length-1]))drop(BS.pop())}
  function draw(){recycle();
    for(let i=0;i<BS.length;i++){const b=BS[i],u=periodic?((b.x%C)+C)%C-C/2*0:b.x;
      if(!periodic&&Math.abs(u)>LV+E){b.el.style.visibility='hidden';if(b.sp)b.sp.style.visibility='hidden';continue}
      const p=P(u),ax=Math.abs(p[2])>Math.abs(p[3])?'h':'v',key=st.mat+b.vi+ax+px;
      if(b.el._k!==key){b.el.style.backgroundImage=`url(${beadImg(st.mat,b.vi,px,ax)})`;b.el._k=key}
      b.el.style.visibility='';b.el.style.transform=`translate3d(${(p[0]-E/2).toFixed(2)}px,${(p[1]-E/2).toFixed(2)}px,0)`;b.el.style.zIndex=String(1000+Math.round(p[1]));
      if(b.sp){const g=sep(i,1),op=1-sst(0,S*.3,g);if(op<.03){b.sp.style.visibility='hidden'}else{const q=P(u+S/2),e=b.sp._e;b.sp.style.visibility='';b.sp.style.opacity=op.toFixed(2);
        b.sp.style.transform=`translate3d(${(q[0]-e/2).toFixed(2)}px,${(q[1]-e/2).toFixed(2)}px,0)`;b.sp.style.zIndex=String(999+Math.round(q[1]))}}}
  }
  /* move bead i to x. push=true: it pushes the beads it runs into (finger). push=false: it stops on contact (gliding). */
  function moveTo(i,x,push){const b=BS[i];let dx=x-b.x;if(!dx)return 0;const d=dx>0?1:-1;
    if(!push){const g=sep(i,d);if(Math.abs(dx)>g){dx=d*Math.max(0,g)}}
    b.x+=dx;
    if(push){let j=i,k=i+d;for(let n=0;n<(periodic?N-1:BS.length);n++){const o=nb(j,d);if(!o||o===b)break;const g=sep(j,d);if(g>=0)break;o.x+=-g*d;j=periodic?(j+d+N)%N:j+d}}
    return dx}
  /* counting: track the side the bead last left; a new contact on the other side, after moving
     across at least half a bead of open space, is one count. Contact back on the side it left = nothing. */
  function contacts(g){const i=idx(g.b);if(i<0)return;
    for(const d of[1,-1]){const t=sep(i,d)<=EPS;
      if(!t&&g.t[d]){g.t[d]=false;g.side=g.b.ls=d;g.ax=g.b.lax=g.px}
      else if(t&&!g.t[d]){g.t[d]=true;if(g.side!==d&&g.side!==0&&Math.abs(g.b.x-g.ax)>=D*.45){reach(g,d)}g.side=g.b.ls=d;g.ax=g.b.lax=g.b.x}}g.px=g.b.x}
  function reach(g,d){
    if(g.dir===0||g.dir===d){g.dir=d;g.c++;g.pend=1;count();last={b:g.b,from:g.ax,d}}
    else{g.c--;uncount();if(g.c===0)g.dir=0;last=null}}
  const state=b=>{const i=idx(b),t1=sep(i,1)<=EPS,t0=sep(i,-1)<=EPS,fl=!t1&&!t0&&b.ls;   // a bead left half-way remembers where it came from
    return{b,px:b.x,dir:0,c:0,pend:0,side:fl?b.ls:0,ax:fl?b.lax:b.x,t:{'1':t1,'-1':t0}}};
  // ---- animation: gliding beads (momentum + soft friction), short tweens, gentle re-centre
  let glides=[];
  function loop(now){raf=0;if(!alive)return;let busy=false;
    for(const gl of glides){const i=idx(gl.g.b);if(i<0){gl.done=true;continue}
      if(gl.tw){const t=Math.min(1,(now-gl.t0)/gl.ms);moveTo(i,gl.x0+(gl.x1-gl.x0)*ease(t),false);contacts(gl.g);if(t>=1)gl.done=true}
      else{const dt=Math.min(32,now-(gl.lt||now));gl.lt=now;const d=gl.v>0?1:-1;const mv=moveTo(i,gl.g.b.x+gl.v*dt,false);contacts(gl.g);
        gl.v*=Math.exp(-dt/150);
        if(Math.abs(gl.v)<.03){const g=sep(i,d);if(g>EPS&&g<D*.22){gl.tw=1;gl.t0=now;gl.ms=120;gl.x0=gl.g.b.x;gl.x1=gl.g.b.x+d*g}else gl.done=true}
        else if(dt>0&&Math.abs(mv)<Math.abs(gl.v*dt)*.5)gl.done=true}   // hit the next bead
      if(gl.done&&gl.g.pend&&IS_IOS){}busy=busy||!gl.done}
    glides=glides.filter(g=>!g.done);
    if(rc){const t=Math.min(1,(now-rc.t0)/rc.ms),dv=(ease(Math.max(0,t))-rc.p)*rc.dx;rc.p=ease(Math.max(0,t));BS.forEach(b=>b.x+=dv);if(t>=1)rc=null;busy=true}
    draw();if(busy||rc)raf=requestAnimationFrame(loop);else idle=setTimeout(centre,260)}
  const kick=()=>{clearTimeout(idle);if(!raf)raf=requestAnimationFrame(loop)};
  function glide(g,v){glides=glides.filter(x=>x.g.b!==g.b);glides.push({g,v,lt:0});kick()}
  function tweenTo(g,x,ms){glides=glides.filter(x=>x.g.b!==g.b);glides.push({g,tw:1,t0:performance.now(),ms,x0:g.b.x,x1:x});kick()}
  // only when the open space has drifted near the edge: the hand slides the strand so a space is in view again
  let rc=null;
  function centre(){if(periodic||dn||!alive)return;let best=null;
    for(let i=0;i<BS.length-1;i++){const g=sep(i,1);if(g>D*.6){const c=BS[i].x+S/2+g/2;if(!best||Math.abs(c)<Math.abs(best.c))best={c,g}}}
    const lim=LV*.62;
    if(best&&Math.abs(best.c)<lim)return;
    if(!best){ // no space anywhere: open one in the middle
      let k=BS.findIndex(b=>b.x>0);if(k<1)return;for(let i=0;i<BS.length;i++)BS[i]._to=i<k?-GAP/2:GAP/2;
      const t0=performance.now();const f=now=>{const t=Math.min(1,(now-t0)/320),e=ease(t);BS.forEach(b=>{b.x+=(b._to*e-(b._d||0));b._d=b._to*e});draw();if(t<1&&alive&&!dn)requestAnimationFrame(f);else BS.forEach(b=>{b._d=0})};requestAnimationFrame(f);return}
    rc={t0:performance.now(),ms:420,dx:-best.c,p:0};kick()}
  // where on the thread is the finger?
  function grabU(x,y){   // [position along the thread, distance from it]
    if(kind==='v')return[y-cy,Math.abs(x-cx)];if(kind==='h')return[x-cx,Math.abs(y-cy)];
    if(kind==='ring'){let a=Math.atan2(y-cy,x-cx)+Math.PI/2;if(a<0)a+=2*Math.PI;return[a*R,Math.abs(Math.hypot(x-cx,y-cy)-R)]}
    let best=0,bd=1e9;for(let u=-LV;u<=LV;u+=3){const p=P(u),dd=(p[0]-x)**2+(p[1]-y)**2;if(dd<bd){bd=dd;best=u}}return[best,Math.sqrt(bd)]}
  const wrapD=(a,b)=>{let d=a-b;if(periodic){d=((d%C)+C+C/2)%C-C/2}return d};
  // which bead does a gesture move? the one under the finger; in open space, the bead that moves into it
  function pick(u,d,far){
    if(far){   // finger away from the thread: move the bead next to the nearest open space
      let best=null;for(let i=0;i<BS.length;i++){const g=sep(i,d);if(g>D*.45&&g<1e8){const c=BS[i].x+d*(S/2+g/2),dd=Math.abs(wrapD(c,u));if(!best||dd<best.dd)best={i,dd}}}
      if(best)return BS[best.i]}
    let bi=-1,bd=1e9;BS.forEach((b,i)=>{const dd=Math.abs(wrapD(b.x,u));if(dd<bd){bd=dd;bi=i}});
    if(bi<0)return null;
    if(bd<S*.55){   // on a bead: swiping toward an open space moves the front bead of that group across it
      let j=bi;for(let n=0;n<BS.length&&sep(j,d)<=EPS;n++){const o=nb(j,d);if(!o)break;j=idx(o)}
      const g=sep(j,d),f=BS[j];if(j!==bi&&g>D*.45&&g<1e8&&(periodic||Math.abs(f.x)<LV))return f;return BS[bi]}
    const side=wrapD(BS[bi].x,u)>0?1:-1;   // nearest bead is after (+1) or before (-1) the finger
    if(side===d)return nb(bi,-d)||BS[bi];  // moving toward it: take the bead behind the space
    return BS[bi]}
  // tap / arrow key: the bead before the nearest space glides across it
  function pull(u,d){let best=null;for(let i=0;i<BS.length;i++){const g=sep(i,d);if(g>D*.45&&g<1e8){const c=BS[i].x+d*(S/2+g/2),dd=Math.abs(wrapD(c,u));if(!best||dd<best.dd)best={i,dd,g}}}
    if(!best){count();return}
    const b=BS[best.i],g=state(b);g.side=-d;g.ax=b.x;g.t[-d]=false;if(g.t[d])g.t[d]=false;tweenTo(g,b.x+d*best.g,Math.max(150,Math.min(260,best.g*1.6)))}
  const ds2=(dx,dy,p)=>{if(kind==='loop')return Math.abs(dx)>Math.abs(dy*p[3])?dx:dy*p[3];
    const al=dx*p[2]+dy*p[3],pe=dx*p[3]-dy*p[2];return Math.abs(pe)>Math.abs(al)*1.4?pe:al};
  el.addEventListener('pointerdown',e=>{if(dn)return;const r=el.getBoundingClientRect(),now=performance.now();if(rc)rc=null;
    const gu=grabU(e.clientX-r.left,e.clientY-r.top);dn={id:e.pointerId,x0:e.clientX,y0:e.clientY,lx:e.clientX,ly:e.clientY,t0:now,lt:now,u:gu[0],far:gu[1]>D*.9,v:0,mx:0,g:null,pre:0,b:null};
    try{lab.setPointerCapture(e.pointerId)}catch(_){}});  // capture on the label so a tap's click still lands on it
  el.addEventListener('pointermove',e=>{if(!dn||e.pointerId!==dn.id)return;const now=performance.now(),dx=e.clientX-dn.lx,dy=e.clientY-dn.ly;dn.lx=e.clientX;dn.ly=e.clientY;
    dn.mx=Math.max(dn.mx,Math.hypot(e.clientX-dn.x0,e.clientY-dn.y0));
    if(!dn.g){dn.pre+=1;if(dn.mx<5)return;
      const tx=e.clientX-dn.x0,ty=e.clientY-dn.y0,p0=P(periodic?dn.u:Math.max(-LV,Math.min(LV,dn.u))),s0=ds2(tx,ty,p0);
      const b=pick(dn.u,s0>0?1:-1,dn.far);if(!b)return;glides=glides.filter(x=>x.g.b!==b);dn.b=b;dn.g=state(b);dn.u+=s0;moveTo(idx(b),b.x+s0,true);contacts(dn.g);draw();return}
    const i=idx(dn.b);if(i<0)return;const p=P(periodic?dn.u:Math.max(-LV,Math.min(LV,dn.u))),s=ds2(dx,dy,p);dn.u+=s;   // the gesture follows the thread under the finger
    if(now>dn.lt){dn.v=dn.v*.35+(s/(now-dn.lt))*.65;dn.lt=now}
    moveTo(i,dn.b.x+s,true);contacts(dn.g);draw()});
  const up=e=>{if(!dn||e.pointerId!==dn.id)return;const g=dn;dn=null;const dt=performance.now()-g.t0;
    if(e.type!=='pointercancel'){
      if(!g.g&&g.mx<8&&dt<450){TAPH=true;pull(g.u,tapDir);TAPH=false;kick();return}   // tap = one bead glides across
      if(g.g){if(g.g.pend&&IS_IOS)haptic(false);   // older iPhones only tick inside a finger-up
        const v=(performance.now()-g.lt>80)?0:g.v;
        if(Math.abs(v)>.12)glide(g.g,Math.max(-2.2,Math.min(2.2,v)));
        else{const i=idx(g.b),d=g.g.side===1?-1:1;const ga=sep(i,d),gb=sep(i,-d);   // let go just short of a bead: it settles against it
          if(ga>EPS&&ga<D*.2)tweenTo(g.g,g.b.x+d*ga,110);else if(gb>EPS&&gb<D*.2)tweenTo(g.g,g.b.x-d*gb,110)}}}
    kick()};
  el._bs=()=>BS.map(b=>Math.round(b.x));   // for the automatic checks
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  const ro=('ResizeObserver' in window)?new ResizeObserver(()=>{if(!dn)layout()}):null;if(ro)ro.observe(el);
  requestAnimationFrame(layout);
  return{
    undo(){uncount();if(last){const i=idx(last.b);if(i>=0){const g=state(last.b);g.side=0;tweenTo(g,last.from,200)}last=null}},
    step(dir){pull(0,dir>0?1:-1)},
    stop(){alive=false;clearTimeout(idle);if(raf)cancelAnimationFrame(raf);if(ro)ro.disconnect()},
    refresh(){layout()}}
}

/* ---------- bead settings sheet: materials (optional) + vibration + bead sound + volume ---------- */
function styleSheet(){beadSettings(true)}
function beadSettings(mats){
  const keys=Object.keys(MAT);
  openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${esc(mats?TX('Bead style','شكل الحبّات','Akkaataa callee','Qaabka kuusha'):TX('Tasbih beads','حبّات التسبيح','Callee tasbiihaa','Kuusha tasbiixda'))}</h1>${XB}</div>
  ${mats?[['m',TX('Modern','عصري','Ammayyaa','Casri')],['c',TX('Classic','كلاسيكي','Durii','Caadi')]].map(([gk,gt])=>`<p class="tb-sh">${esc(gt)}</p><div class="tb-mg">${keys.filter(k=>MAT[k].g===gk).map(k=>`<button data-mat="${k}" class="${k===st.mat?'on':''}" aria-pressed="${k===st.mat}"><img alt="" src="${beadImg(k,1,96)}"><span>${esc(matName(k))}</span></button>`).join('')}</div>`).join(''):''}
  <p class="tb-sh">${esc(TX('Vibration','الاهتزاز','Raafama','Gariir'))}</p>
  <div class="tb-sw">
   <label><span><b>${esc(TX('Bead vibration','اهتزاز الحبّات','Raafama callee','Gariirka kuusha'))}</b><small>${esc(TX('On every bead, stronger at 33 and 100','مع كل حبّة، وأقوى عند ٣٣ و١٠٠','Callee hundaaf, 33 fi 100 irratti cimaa','Kuul kasta, 33 iyo 100 way ka xoog badan tahay'))}</small></span><input type="checkbox" switch id="tbVib" ${st.vib?'checked':''}></label>
   <label class="tb-try" id="tbTryV" role="button">${HSW}<i class="ph ph-vibrate"></i><span>${esc(TX('Test vibration','جرّب الاهتزاز','Raafama yaali','Tijaabi gariirka'))}</span></label>
  </div>
  <p class="tb-sh">${esc(TX('Bead sound','صوت الحبّات','Sagalee callee','Codka kuusha'))}</p>
  <div class="tb-sw">
   <label><span><b>${esc(TX('Bead click','طقطقة الحبّات','Sagalee callee','Shanqarta kuusha'))}</b><small>${esc(TX('Recorded from real beads. No music, no voice.','مسجّل من حبّات حقيقية، بلا موسيقى ولا صوت بشري.','Callee dhugaa irraa waraabame. Muuziqaa fi sagalee namaa hin qabu.','Laga duubay kuul dhab ah. Muusig iyo cod qof midna ma leh.'))}</small></span><input type="checkbox" switch id="tbSnd" ${st.snd?'checked':''}></label>
   <div class="tb-vol${st.snd?'':' off'}" id="tbVolW"><i class="ph ph-speaker-low"></i><input type="range" id="tbVol" min="0" max="100" step="5" value="${st.vol}" aria-label="${esc(TX('Bead click volume','مستوى صوت الطقطقة','Sagalee callee hammam','Heerka codka kuusha'))}"><i class="ph ph-speaker-high"></i></div>
  </div>
  <p class="tb-note">${esc(TX('iPhone: you feel a tick each time you tap a bead or the button. Since iOS 26.5, Safari allows vibration only for taps, not swipes, so swipes give the click sound. iPad has no vibration motor. The click follows your silent switch.','آيفون: تشعر بنقرة مع كل لمسة على حبّة أو على الزرّ. منذ iOS 26.5 يسمح سفاري بالاهتزاز للّمس فقط وليس للسحب، فالسحب يعطي صوت الطقطقة. آيباد لا يحتوي على محرّك اهتزاز. الطقطقة تتبع زرّ الصامت.',"iPhone: yeroo callee ykn qabduu tuqxu raafama ni dhageessa. iOS 26.5 irraa kaasee Safari raafama tuqaaf qofa hayyama, harkisuuf miti. iPad motora raafamaa hin qabu.",'iPhone: waxaad dareemaysaa gariir mar kasta oo aad taabato kuul ama badhanka. Laga bilaabo iOS 26.5, Safari wuxuu gariir u oggol yahay taabashada oo keliya, ma aha jiidista. iPad ma laha matoor gariir.'))}</p>`);
  document.querySelectorAll('#sh [data-mat]').forEach(b=>b.onclick=()=>{st.mat=b.dataset.mat;saveSt();haptic(false);clack(false);
    document.querySelectorAll('#sh [data-mat]').forEach(x=>{const on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on))});if(document.getElementById('tbMatI'))paintMat();if(beads)beads.refresh()});
  document.getElementById('tbVib').onchange=e=>{st.vib=e.target.checked;saveSt();hsw();paintAV()};
  const tv=document.getElementById('tbTryV');tv.querySelector('.tb-hs').disabled=false;tv.querySelector('.tb-hs').addEventListener('click',e=>e.stopPropagation());
  tv.addEventListener('click',()=>{if(!IS_IOS){const v=st.vib;st.vib=true;haptic(false);st.vib=v}});
  document.getElementById('tbSnd').onchange=e=>{st.snd=e.target.checked;saveSt();paintAV();document.getElementById('tbVolW').classList.toggle('off',!st.snd);if(st.snd)clack(false)};
  let lt=0;const vr=document.getElementById('tbVol'),vp=()=>vr.style.setProperty('--p',vr.value+'%');vp();
  vr.oninput=()=>{st.vol=+vr.value;saveSt();vp();const n=performance.now();if(n-lt>120&&st.snd){lt=n;clack(false)}};
  vr.onchange=()=>{st.vol=+vr.value;saveSt()};
}
/* Settings row in More: "Tasbih beads" (separate from everything else) */
(function addSettingsRow(){const lang=document.getElementById('mLang');if(!lang||document.getElementById('mBeads'))return;
  const b=document.createElement('button');b.id='mBeads';
  b.innerHTML=`<span class="ic c-g"><i class="ph ph-vibrate"></i></span><span>${esc(TX('Tasbih beads','حبّات التسبيح','Callee tasbiihaa','Kuusha tasbiixda'))}</span><i class="ph ph-caret-right cv flip"></i>`;
  b.onclick=()=>{ac();beadSettings(false)};lang.after(b)})();
/* The Settings screen (fq-plus.js) loads after this file: add the same row to its General group */
function settingsRow(){const after=document.getElementById('fqpNot')||document.getElementById('fqpLang');if(!after||document.getElementById('fqpBeads'))return;
  const b=document.createElement('button');b.id='fqpBeads';
  b.innerHTML=`<span class="ic c-a"><i class="ph ph-vibrate"></i></span><span>${esc(TX('Tasbih beads','حبّات التسبيح','Callee tasbiihaa','Kuusha tasbiixda'))}</span><i class="ph ph-caret-right cv flip"></i>`;
  b.onclick=()=>{ac();beadSettings(false)};after.after(b)}
document.addEventListener('DOMContentLoaded',()=>{if(R&&R.settings&&!R.settings._tb){const rs=R.settings;R.settings=function(){const r=rs.apply(this,arguments);try{settingsRow()}catch(e){}return r};R.settings._tb=1}settingsRow()});

/* browsers without the native switch (Chrome, Android) get a styled one */
if(!('switch' in HTMLInputElement.prototype))document.documentElement.classList.add('tb-fsw');

/* ---------- wire into the app ---------- */
window.tasbih=function(){tasbihPlus(null)};
window.tasbihPlus=tasbihPlus;
const tb=document.getElementById('tsbBtn');if(tb)tb.onclick=()=>tasbihPlus(null);

/* ---------- Friday salawat (local day) ---------- */
const SAL_AR=['اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ،','كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ،','إِنَّكَ حَمِيدٌ مَجِيدٌ،','اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ،','كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ،','إِنَّكَ حَمِيدٌ مَجِيدٌ'];
function salCtx(){return{key:'salF',title:TX('Salawat on the Prophet ﷺ','الصلاة على النبي ﷺ','Salawaata Nabiyyii ﷺ','Salawaadka Nabiga ﷺ'),phrase:'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',goal:st.salGoal!=null?st.salGoal:0}}
function friday(){
  const sec=document.getElementById('s-dhikr');if(!sec)return;let c=document.getElementById('frC');
  const isFri=NOW().getDay()===5||new URLSearchParams(location.search).get('fri')==='1';
  if(!isFri){if(c)c.remove();return}
  if(!c){c=document.createElement('div');c.id='frC';c.className='fr-c';const hd=sec.querySelector('.hd');hd.after(c)}
  const n=(store('salF')||{})[DK()]||0;
  c.innerHTML=`<div class="fr-t"><span class="fr-i"><i class="ph ph-sun"></i></span><span><small>${esc(TX("Jumu'ah",'يوم الجمعة',"Jum'aa",'Jimce'))}</small><b>${esc(TX('Send salawat on the Prophet ﷺ','أكثِر من الصلاة على النبي ﷺ','Nabiyyii ﷺ irratti salawaata baay\'isi','Nabiga ﷺ salawaad badan ku dir'))}</b></span></div>
  <p class="fr-ar" lang="ar" dir="rtl">${SAL_AR.map(l=>`<span>${l}</span>`).join('')}</p>
  <a class="fr-src" href="https://sunnah.com/bukhari:3370" target="_blank" rel="noopener">${esc(TX('Sahih al-Bukhari 3370','صحيح البخاري ٣٣٧٠','Sahiih al-Bukhaarii 3370','Saxiix al-Bukhaari 3370'))}</a>
  <p class="fr-why">${esc(TX('The Prophet ﷺ said Friday is among the best of days, and told us to send much salawat on him on it, because it is shown to him.','أخبر النبي ﷺ أن يوم الجمعة من أفضل الأيام، وأمر بالإكثار من الصلاة عليه فيه، لأنها تُعرض عليه.',"Nabiyyiin ﷺ Jimaatni guyyoota hundaa caalaa keessaa tokko akka ta'e himee, guyyaa sana salawaata isa irratti baay'isuu nu ajaje, sababni isaas isaaf dhiyaata.",'Nabigu ﷺ wuxuu sheegay in Jimcuhu ka mid yahay maalmaha ugu fiican, wuxuuna na faray inaan maalintaas salawaad badan ku dirno, maxaa yeelay waa loo bandhigaa.'))}
   <a href="https://sunnah.com/abudawud:1047" target="_blank" rel="noopener">${esc(TX('Abu Dawud 1047 · sahih','أبو داود ١٠٤٧ · صحيح','Abuu Daawud 1047 · sahiih','Abu Daawuud 1047 · saxiix'))}</a></p>
  <div class="fr-row"><button class="fr-go" id="frGo"><span class="fr-bi">${TSB(false)}</span>${esc(TX('Count with beads','عُدّ بالمسبحة',"Callee'n lakkaa'i",'Ku tiri kuusha'))}</button><span class="fr-n">${esc(TX(n+' today','اليوم: '+AR(n),'Har\'a: '+n,'Maanta: '+n))}</span></div>`;
  document.getElementById('frGo').onclick=()=>{const o=salCtx();const m=st.mode;if(m==='tap'||m==='clicker')st.mode='beads';tasbihPlus(o);st.mode=m;saveSt()};
}
if(R&&R.dhikr){const o=R.dhikr;R.dhikr=function(){const r=o.apply(this,arguments);try{friday()}catch(e){}return r}}
try{friday()}catch(e){}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)try{friday()}catch(e){}});

/* ---------- Hisn al-Muslim audio per dhikr (cut from the site's own Hisn recording) ---------- */
// set -> item index -> clip in /hisn/clips (cut by tools/hisn/cut.py from the site's Hisn recording).
// Qur'an items read only by name in that recording (Ayat al-Kursi, the 3 Quls) and evening "Amsayna" (read as a note) have no clip.
const HISN_CLIPS={
 morning:{1:'m-asbahna.m4a',2:'m-bika-asbahna.m4a',3:'sayyid-istighfar.m4a',4:'bismillah-la-yadurr.m4a',5:'subhan-adada.m4a',6:'subhan-wabihamdih.m4a',7:'astaghfir-atub.m4a'},
 evening:{2:'e-bika-amsayna.m4a',3:'sayyid-istighfar.m4a',4:'bismillah-la-yadurr.m4a',5:'audhu-kalimat.m4a',6:'subhan-wabihamdih.m4a'},
 sleep:{1:'baqarah-285-286.m4a',3:'bismika-rabbi.m4a',4:'bismika-amutu.m4a',5:'subhanallah.m4a',6:'alhamdulillah.m4a',7:'allahu-akbar.m4a'}
};
const HCB='hisn/clips/';
let hA=null,hKey='';
function hisnBtn(){
  if(typeof ZS!=='object'||!ZS)return;const f=(HISN_CLIPS[ZS.set]||{})[ZS.i];const top=document.querySelector('#zCard .top');if(!top)return;
  const old=document.getElementById('zHa');if(old)old.remove();if(!f)return;
  const key=ZS.set+':'+ZS.i,playing=hA&&!hA.paused&&hKey===key;
  const b=document.createElement('button');b.id='zHa';b.className='zha'+(playing?' on':'');
  b.setAttribute('aria-label',TX('Listen','استمع','Dhaggeeffadhu','Dhageyso'));
  b.innerHTML=`<i class="ph-fill ${playing?'ph-pause':'ph-play'}"></i><span>${esc(TX('Listen','استمع','Dhaggeeffadhu','Dhageyso'))}</span>`;
  b.onclick=e=>{e.stopPropagation();if(!hA){hA=new Audio();hA.preload='none';hA.onended=hA.onpause=hA.onplay=()=>hisnBtn()}
    if(hKey===key&&!hA.paused){hA.pause();return}
    if(hKey!==key){hA.src=HCB+f;hKey=key}hA.play().catch(()=>toast(TX('Audio could not play','تعذّر تشغيل الصوت','Sagaleen hin taphanne','Codka lama shidi karin')))};
  top.appendChild(b)
}
if(typeof window.zDraw==='function'){const oz=window.zDraw;window.zDraw=function(){const r=oz.apply(this,arguments);try{hisnBtn()}catch(e){}return r}}
if(typeof window.zClose==='function'){const oc=window.zClose;window.zClose=function(){if(hA)hA.pause();return oc.apply(this,arguments)}}
{const zx=document.getElementById('zrX');if(zx)zx.onclick=()=>window.zClose()}
try{if(typeof ZS==='object'&&ZS)hisnBtn()}catch(e){}

/* deep links for previews/tests: ?tbx=beads|tap&mat=jade */
const QP=new URLSearchParams(location.search);
if(QP.get('mat')&&MAT[QP.get('mat')]){st.mat=QP.get('mat')}
if(QP.get('tbx')){st.mode=STY.some(x=>x.k===QP.get('tbx'))?QP.get('tbx'):'beads';setTimeout(()=>QP.get('sal')?tasbihPlus(salCtx()):tasbihPlus(null),60)}
if(QP.get('tbs'))setTimeout(styleSheet,400);
if(QP.get('tbset'))setTimeout(()=>beadSettings(false),400);
window.__tbx={MAT,beadImg,haptic,st};
})();
