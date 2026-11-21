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
  if(st.mute||!st.vib)return;
  if(!IS_IOS&&navigator.vibrate){try{navigator.vibrate(strong?[35,70,35,70,60]:12)}catch(e){}return}
  tick();if(strong){setTimeout(tick,110);setTimeout(tick,220)}
}
/* ---------- soft bead click (Web Audio, generated; respects the iPhone silent switch) ---------- */
let AC=null,NB=null;
function ac(){
  if(!AC){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
    try{if(navigator.audioSession)navigator.audioSession.type='ambient'}catch(e){}
    try{AC=new C()}catch(e){return null}
    NB=AC.createBuffer(1,Math.floor(AC.sampleRate*.05),AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
  if(AC.state==='suspended')AC.resume().catch(()=>{});
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
function clack(strong){
  if(st.mute||!st.snd)return;const a=ac();if(!a)return;const m=MAT[st.mat]||MAT.olive,t=a.currentTime+.005;
  const V=Math.pow(Math.max(0,Math.min(100,st.vol))/100,1.6)*.22;if(V<.001)return; // volume slider (default 30 = soft)
  knock(a,t,m.f,m.q,m.dec,V);knock(a,t+.022,m.f*1.08,m.q,m.dec*.8,V*.4);
  if(strong){knock(a,t+.16,m.f*.9,m.q,m.dec*1.3,V*.9);knock(a,t+.18,m.f,m.q,m.dec,V*.36)}
}

/* ---------- bead materials, drawn per pixel (sphere + light + texture) ---------- */
const MAT={
 olive:   {n:['Olive wood','خشب الزيتون','Muka ejersaa','Alwaax saytuun'],f:1500,q:3,dec:.035},
 sandal:  {n:['Sandalwood','خشب الصندل','Muka sandal','Alwaax sandal'],f:1700,q:3,dec:.03},
 amber:   {n:['Amber','كهرمان','Ambar','Cambar'],f:2600,q:5,dec:.045},
 pearl:   {n:['Pearl','لؤلؤ',"Lu'lu'",'Luul'],f:3000,q:6,dec:.05},
 onyx:    {n:['Onyx','عقيق أسود','Oniksii','Oniks'],f:3300,q:7,dec:.055},
 jade:    {n:['Jade','يَشْم','Jeedii','Jeyd'],f:3100,q:7,dec:.055},
 lapis:   {n:['Lapis','لازورد','Laaziwardii','Laajward'],f:3200,q:7,dec:.05},
 hematite:{n:['Hematite','هيماتيت','Hemaatayitii','Hematayt'],f:3800,q:8,dec:.06}
};
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
  case 'hematite':return{c:[.23,.24,.27],spec:1.2,pow:110,metal:1,env:.9};
  }
  return{c:[.5,.5,.5],spec:.3,pow:20}
}
const L3=(()=>{const v=[-.48,-.62,.62],m=Math.hypot(...v);return v.map(a=>a/m)})();
const H3=(()=>{const v=[L3[0],L3[1],L3[2]+1],m=Math.hypot(...v);return v.map(a=>a/m)})();
function drawBead(k,seed,px){
  const c=document.createElement('canvas');c.width=c.height=px;const g=c.getContext('2d');
  const pad=px*.1,r=(px-2*pad)/2,cx=px/2,cy=px/2-pad*.25;
  // soft contact shadow under the bead
  const sh=g.createRadialGradient(cx+r*.12,cy+r*.22,r*.2,cx+r*.12,cy+r*.22,r*1.12);sh.addColorStop(0,'rgba(40,30,15,.28)');sh.addColorStop(1,'rgba(40,30,15,0)');
  g.fillStyle=sh;g.beginPath();g.arc(cx+r*.12,cy+r*.22,r*1.12,0,7);g.fill();
  const img=g.getImageData(0,0,px,px),d=img.data;
  const ca=Math.cos(seed*2.1),sa=Math.sin(seed*2.1),cb=Math.cos(seed*1.3),sb=Math.sin(seed*1.3);
  for(let j=0;j<px;j++)for(let i=0;i<px;i++){
    const nx=(i+.5-cx)/r,ny=(j+.5-cy)/r,q=nx*nx+ny*ny;if(q>1.02)continue;
    const nz=Math.sqrt(Math.max(0,1-q)),aa=Math.min(1,Math.max(0,(1-Math.sqrt(q))*r+.5));
    // object-space point (rotated per seed so beads differ)
    let px1=nx*ca-nz*sa,pz1=nx*sa+nz*ca,py1=ny*cb-pz1*sb,pz2=ny*sb+pz1*cb;
    const s=surface(k,[px1*1.3+seed*5.7,py1*1.3,pz2*1.3]);
    const ndl=nx*L3[0]+ny*L3[1]+nz*L3[2],dif=Math.max(0,ndl),ndh=Math.max(0,nx*H3[0]+ny*H3[1]+nz*H3[2]);
    let col=s.c.map(v=>v*(.30+.78*dif));
    if(s.trans){const back=Math.pow(Math.max(0,-ndl*.6+.45),2)*.9;col=col.map((v,ix)=>v+s.trans[ix]*back*.55)}
    if(s.pearl){const t=Math.pow(1-nz,1.6);col=[col[0]+.025*Math.sin(t*7)+.02*t,col[1]+.015*Math.sin(t*7+2),col[2]+.03*Math.sin(t*7+4)]}
    const ry=2*nz*ny,env=.55-.45*ry;
    if(s.env){const e=Math.max(0,env)*s.env;col=col.map(v=>v*(1-(s.metal?.55:0))+e*(s.metal?.75:.22))}
    const fres=Math.pow(1-nz,3)*(s.metal?.35:.28);col=col.map(v=>v*(1-fres)+fres*.92);
    const sp=Math.pow(ndh,s.pow)*s.spec+Math.pow(ndh,s.pow/6)*s.spec*.12;col=col.map(v=>v+sp);
    // darken where beads touch the string hole (poles)
    const pole=sst(.86,1,Math.abs(ny))*nz*.25;col=col.map(v=>v*(1-pole));
    const o=(j*px+i)*4,A=aa;
    d[o]=d[o]*(1-A)+Math.min(255,col[0]*255)*A;d[o+1]=d[o+1]*(1-A)+Math.min(255,col[1]*255)*A;d[o+2]=d[o+2]*(1-A)+Math.min(255,col[2]*255)*A;d[o+3]=Math.max(d[o+3],A*255)}
  g.putImageData(img,0,0);return c.toDataURL('image/png')
}
const BCACHE={};
function beadImg(k,v,px){const key=k+v+'_'+px;return BCACHE[key]||(BCACHE[key]=drawBead(k,v+(Object.keys(MAT).indexOf(k)*.37),px))}

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
  haptic(strong||done);clack(strong||done);
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
  <div class="hd sub"><button class="ib" id="tbBack" aria-label="${esc(TX('Back','رجوع','Duubatti','Dib u noqo'))}"><i class="ph ph-caret-left flip"></i></button><h1 id="tbT"></h1><button class="ib tb-mu" id="tbMute"></button></div>
  <div class="seg tb-seg" role="tablist"><button role="tab" data-m="beads">${TX('Beads','المسبحة','Callee','Kuul')}</button><button role="tab" data-m="tap">${TX('Tap','اللمس','Tuqi','Taabo')}</button></div>
  <p class="tb-ph" id="tbPh" lang="ar" dir="rtl" hidden></p>
  <div class="tb-cn" id="tbCn" aria-live="polite"><b id="tbN"></b><small id="tbOf"></small><span class="tb-pr"><i id="tbPr"></i></span><span class="tb-rg" id="tbRg"></span></div>
  <div class="tb-stage" id="tbStage"></div>
  <p class="tb-hint" id="tbHint"></p>
  <div class="tb-goal" role="group" aria-label="${esc(TX('Goal','الهدف','Galma','Hadaf'))}">${[33,99,100,0].map(g=>`<button data-g="${g}">${g?AR(g):'∞'}</button>`).join('')}</div>
  <div class="tb-bar"><button class="tb-mat" id="tbMat"><img alt="" id="tbMatI"><span id="tbMatN"></span><i class="ph ph-caret-down"></i></button><button class="tb-rs" id="tbReset"><i class="ph ph-arrow-counter-clockwise"></i><span>${TX('Reset','تصفير','Haqi','Tirtir')}</span></button></div>
  </div>`;
  document.getElementById('tbT').textContent=ctx?ctx.title:T('Tasbih','التسبيح');
  if(ctx&&ctx.phrase){const ph=document.getElementById('tbPh');ph.textContent=ctx.phrase;ph.hidden=false}
  p.classList.add('on');document.documentElement.classList.add('tbx-open');
  document.getElementById('tbBack').onclick=closePage;
  document.getElementById('tbMute').onclick=()=>{st.mute=!st.mute;saveSt();paintMute();
    if(!st.mute){haptic(false);clack(false)}
    toast(st.mute?TX('Sound and vibration off','الصوت والاهتزاز مُطفآن','Sagaleen fi raafamni dhaamsameera','Codka iyo gariirku waa damsan yihiin'):TX('Sound and vibration on','الصوت والاهتزاز يعملان','Sagaleen fi raafamni hojii irra jiru','Codka iyo gariirku waa shidan yihiin'))};
  p.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{if(st.mode===b.dataset.m)return;st.mode=b.dataset.m;saveSt();haptic(false);paintMode()});
  p.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{const g=+b.dataset.g;if(ctx){ctx.goal=g;st.salGoal=g}else st.goal=g;saveSt();haptic(false);paintGoal();paintCount(getN())});
  document.getElementById('tbMat').onclick=styleSheet;
  document.getElementById('tbReset').onclick=()=>{const was=getN();if(!was)return;setN(0);paintCount(0);try{renderTab(curTab())}catch(e){}
    undoToast(T('Counter reset to 0','تم التصفير'),()=>{setN(was);paintCount(was)})};
  paintMute();paintGoal();paintMode();paintMat();paintCount(getN());
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
  else if(e.key==='ArrowUp'){e.preventDefault();beads?beads.step(-1):count()}}
function paintMute(){const b=document.getElementById('tbMute');b.innerHTML=`<i class="ph ${st.mute?'ph-speaker-slash':'ph-speaker-high'}"></i>`;b.setAttribute('aria-pressed',String(st.mute));
  b.setAttribute('aria-label',TX('Mute sound and vibration','كتم الصوت والاهتزاز','Sagalee fi raafama dhaamsi','Aamusi codka iyo gariirka'));b.classList.toggle('off',st.mute)}
function paintGoal(){const g=goal();document.querySelectorAll('#tbx [data-g]').forEach(b=>{const on=+b.dataset.g===g;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on))})}
function paintMat(){document.getElementById('tbMatI').src=beadImg(st.mat,0,72);document.getElementById('tbMatN').textContent=matName(st.mat)}
function paintCount(n,bump){
  const g=goal(),b=document.getElementById('tbN');if(!b)return;b.textContent=AR(n);
  const within=g>0?(n>0?((n-1)%g)+1:0):n,round=g>0?Math.max(1,Math.ceil(n/g)):0;
  document.getElementById('tbOf').textContent=g>0?TX(`${within} of ${g} · Round ${round}`,`${AR(within)} من ${AR(g)} · الجولة ${AR(round)}`,`${within} keessaa ${g} · Marsaa ${round}`,`${within} ka mid ah ${g} · Wareeg ${round}`):TX('No goal','بلا هدف','Galma malee','Hadaf la\'aan');
  document.getElementById('tbPr').style.width=(g>0?within/g*100:0)+'%';
  document.getElementById('tbCn').classList.toggle('nog',!(g>0));
  if(bump){b.classList.remove('bp');void b.offsetWidth;b.classList.add('bp')}
  const tapB=document.getElementById('tbTap');if(tapB)tapB.querySelector('b').textContent=AR(n)
}
function pulse(){const r=document.getElementById('tbRg');if(!r)return;r.classList.remove('go');void r.offsetWidth;r.classList.add('go')}
function roundDone(n){
  pulse();const cn=document.getElementById('tbCn');if(!cn)return;
  let sp='';for(let i=0;i<16;i++){const a=i/16*Math.PI*2,rr=70+Math.random()*36;sp+=`<i style="--x:${(Math.cos(a)*rr).toFixed(0)}px;--y:${(Math.sin(a)*rr).toFixed(0)}px;animation-delay:${(Math.random()*.12).toFixed(2)}s"></i>`}
  const f=document.createElement('div');f.className='tb-fx';f.innerHTML=sp+`<em>${esc(TX('Round complete','اكتملت الجولة','Marsaan xumurame','Wareeggii waa dhammaaday'))}</em>`;cn.appendChild(f);setTimeout(()=>f.remove(),1700)
}
function paintMode(){
  document.querySelectorAll('#tbx [data-m]').forEach(b=>{const on=b.dataset.m===st.mode;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on))});
  const sg=document.getElementById('tbStage');if(beads){beads.stop();beads=null}
  document.getElementById('tbx').classList.toggle('tap',st.mode==='tap');
  const h=document.getElementById('tbHint');
  if(st.mode==='tap'){sg.innerHTML=`<button class="tb-tap" id="tbTap" aria-label="${esc(TX('Count','عُدّ',"Lakkaa'i",'Tiri'))}"><b>${AR(getN())}</b></button>`;
    document.getElementById('tbTap').onclick=()=>{count();const t=document.getElementById('tbTap');t.classList.remove('pr');void t.offsetWidth;t.classList.add('pr')};
    h.textContent=T('Tap the circle to count','اضغط على الدائرة للعدّ');document.getElementById('tbMat').hidden=true}
  else{beads=Beads(sg);h.textContent=TX('Swipe a bead down or up','اسحب حبّة للأسفل أو للأعلى','Callee tokko gadi ykn ol harkisi','Kuul hoos ama kor u jiid');document.getElementById('tbMat').hidden=false}
}

/* ---------- bead strand ---------- */
let beads=null;
function Beads(stage){
  stage.innerHTML='<div class="tb-str" id="tbStr" tabindex="0" role="button"></div>';
  const el=stage.firstChild;el.setAttribute('aria-label',TX('Bead counter. Swipe down or up, or press the arrow keys.','عدّاد المسبحة. اسحب للأسفل أو للأعلى.',"Lakkaa'aa callee. Gadi ykn ol harkisi.",'Tiriyaha kuusha. Hoos ama kor u jiid.'));
  const thread=document.createElement('span');thread.className='tb-th';el.appendChild(thread);
  const dpr=Math.min(3,window.devicePixelRatio||2);
  let H=0,D=0,S=0,GAP=0,POOL=[],phase=.5,anim=null,alive=true;
  function layout(){
    H=el.clientHeight||360;D=Math.round(Math.max(46,Math.min(74,H/6.6,el.clientWidth*.22)));S=D*.97;GAP=D*.95;
    const need=Math.ceil((H/2+GAP)/S)*2+4;
    while(POOL.length<need){const b=document.createElement('i');b.className='tb-bd';b.setAttribute('aria-hidden','true');el.appendChild(b);POOL.push(b)}
    const px=Math.round(D/.8*dpr);POOL.forEach(b=>{b.style.width=b.style.height=(D/.8)+'px';b._v=-1});
    el._px=px;draw()
  }
  function yOf(v){return v+(GAP/2)*Math.tanh(v/(S*.55))}
  function draw(){
    const c=H/2,base=Math.floor(phase),half=POOL.length/2;
    for(let k=0;k<POOL.length;k++){
      const j=base-Math.floor(half)+k,v=(j-phase)*S,y=c+yOf(v);// rest: phase=x.5 -> beads at ±S/2
      const b=POOL[k],vi=((j%5)+5)%5;
      if(b._v!==vi||b._m!==st.mat){b.style.backgroundImage=`url(${beadImg(st.mat,vi,el._px)})`;b._v=vi;b._m=st.mat}
      b.style.transform=`translate3d(-50%,${(y-D/.8/2).toFixed(2)}px,0)`;b.style.zIndex=String(1000+Math.round(y))
    }
  }
  function animTo(target,ms){
    if(anim)cancelAnimationFrame(anim.id);const from=phase,t0=performance.now();
    const ease=t=>1-Math.pow(1-t,3);
    anim={target,id:0};const stepf=now=>{const t=Math.min(1,(now-t0)/ms);phase=from+(target-from)*ease(t);draw();if(t<1&&alive)anim.id=requestAnimationFrame(stepf);else{phase=target;draw();anim=null}};
    anim.id=requestAnimationFrame(stepf)
  }
  function finish(){if(anim){cancelAnimationFrame(anim.id);phase=anim.target;anim=null;draw()}}
  // gesture: one bead per swipe; counted on release (needed for iPhone haptics)
  let down=null;
  el.addEventListener('pointerdown',e=>{if(down)return;finish();down={id:e.pointerId,y:e.clientY,x:e.clientX,p0:phase,t:performance.now(),ly:e.clientY,lt:performance.now(),vy:0};try{el.setPointerCapture(e.pointerId)}catch(_){}});
  el.addEventListener('pointermove',e=>{if(!down||e.pointerId!==down.id)return;const now=performance.now(),dy=e.clientY-down.y;
    if(now>down.lt){down.vy=(e.clientY-down.ly)/(now-down.lt);down.ly=e.clientY;down.lt=now}
    let d=dy/S;const lim=1.12;if(Math.abs(d)>1)d=Math.sign(d)*(1+(Math.abs(d)-1)*.25);d=Math.max(-lim,Math.min(lim,d));
    phase=down.p0-d;draw()});
  const up=e=>{if(!down||e.pointerId!==down.id)return;const dy=e.clientY-down.y,dx=e.clientX-down.x,dt=performance.now()-down.t,d=down.p0-phase,v=down.vy;const p0=down.p0;down=null;
    if(e.type==='pointercancel'){animTo(p0,160);return}
    let dir=0;
    if(Math.abs(dy)<8&&Math.abs(dx)<8&&dt<400)dir=1;            // a tap pulls one bead down
    else if(Math.abs(d)>.28||(Math.abs(v)>.35&&Math.abs(dy)>12))dir=(Math.abs(d)>.28?Math.sign(-d):Math.sign(v))>0?1:-1;
    if(dir){count();animTo(p0-dir,150)}else animTo(p0,180)};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  const ro=('ResizeObserver' in window)?new ResizeObserver(()=>layout()):null;if(ro)ro.observe(el);
  requestAnimationFrame(layout);
  return{step(dir){finish();count();animTo(phase-dir,150)},stop(){alive=false;if(ro)ro.disconnect();if(anim)cancelAnimationFrame(anim.id)},refresh(){POOL.forEach(b=>b._m=null);layout()}}
}

/* ---------- bead settings sheet: materials (optional) + vibration + bead sound + volume ---------- */
function styleSheet(){beadSettings(true)}
function beadSettings(mats){
  const keys=Object.keys(MAT);
  openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${esc(mats?TX('Bead style','شكل الحبّات','Akkaataa callee','Qaabka kuusha'):TX('Tasbih beads','حبّات التسبيح','Callee tasbiihaa','Kuusha tasbiixda'))}</h1>${XB}</div>
  ${mats?`<div class="tb-mg">${keys.map(k=>`<button data-mat="${k}" class="${k===st.mat?'on':''}" aria-pressed="${k===st.mat}"><img alt="" src="${beadImg(k,1,96)}"><span>${esc(matName(k))}</span></button>`).join('')}</div>`:''}
  <p class="tb-sh">${esc(TX('Vibration','الاهتزاز','Raafama','Gariir'))}</p>
  <div class="tb-sw">
   <label><span><b>${esc(TX('Bead vibration','اهتزاز الحبّات','Raafama callee','Gariirka kuusha'))}</b><small>${esc(TX('On every bead, stronger at 33 and 100','مع كل حبّة، وأقوى عند ٣٣ و١٠٠','Callee hundaaf, 33 fi 100 irratti cimaa','Kuul kasta, 33 iyo 100 way ka xoog badan tahay'))}</small></span><input type="checkbox" switch id="tbVib" ${st.vib?'checked':''}></label>
   <button class="tb-try" id="tbTryV"><i class="ph ph-vibrate"></i><span>${esc(TX('Test vibration','جرّب الاهتزاز','Raafama yaali','Tijaabi gariirka'))}</span></button>
  </div>
  <p class="tb-sh">${esc(TX('Bead sound','صوت الحبّات','Sagalee callee','Codka kuusha'))}</p>
  <div class="tb-sw">
   <label><span><b>${esc(TX('Bead click','طقطقة الحبّات','Sagalee callee','Shanqarta kuusha'))}</b><small>${esc(TX('A soft click only. No music, no voice.','طقطقة خفيفة فقط، بلا موسيقى ولا صوت بشري.','Sagalee laafaa qofa. Muuziqaa fi sagalee namaa hin qabu.','Cod jilicsan oo keliya. Muusig iyo cod qof midna ma leh.'))}</small></span><input type="checkbox" switch id="tbSnd" ${st.snd?'checked':''}></label>
   <div class="tb-vol${st.snd?'':' off'}" id="tbVolW"><i class="ph ph-speaker-low"></i><input type="range" id="tbVol" min="0" max="100" step="5" value="${st.vol}" aria-label="${esc(TX('Bead click volume','مستوى صوت الطقطقة','Sagalee callee hammam','Heerka codka kuusha'))}"><i class="ph ph-speaker-high"></i></div>
  </div>
  <p class="tb-note">${esc(TX('Feel nothing on iPhone? It needs iOS 18 or newer, and System Haptics on (iPhone Settings, Sounds & Haptics). iPad has no vibration motor. The click follows your silent switch.','لا تشعر بشيء على الآيفون؟ يلزم iOS 18 أو أحدث، وتفعيل «اهتزازات النظام» (الإعدادات، الأصوات والاهتزازات). آيباد لا يحتوي على محرّك اهتزاز. الطقطقة تتبع زرّ الصامت.','iPhone irratti homaa hin dhaga\'attu? iOS 18 ykn haaraa fi System Haptics banuu barbaachisa (Settings, Sounds & Haptics). iPad motora raafamaa hin qabu.','iPhone waxba ma dareentid? Waxay u baahan tahay iOS 18 ama ka cusub, iyo System Haptics oo shidan (Settings, Sounds & Haptics). iPad ma laha matoor gariir.'))}</p>`);
  document.querySelectorAll('#sh [data-mat]').forEach(b=>b.onclick=()=>{st.mat=b.dataset.mat;saveSt();haptic(false);clack(false);
    document.querySelectorAll('#sh [data-mat]').forEach(x=>{const on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on))});if(document.getElementById('tbMatI'))paintMat();if(beads)beads.refresh()});
  document.getElementById('tbVib').onchange=e=>{st.vib=e.target.checked;saveSt();if(st.vib)haptic(false)};
  document.getElementById('tbTryV').onclick=()=>{if(!st.vib){st.vib=true;saveSt();document.getElementById('tbVib').checked=true}
    const m=st.mute;st.mute=false;haptic(false);st.mute=m};
  document.getElementById('tbSnd').onchange=e=>{st.snd=e.target.checked;saveSt();document.getElementById('tbVolW').classList.toggle('off',!st.snd);if(st.snd)clack(false)};
  let lt=0;const vr=document.getElementById('tbVol'),vp=()=>vr.style.setProperty('--p',vr.value+'%');vp();
  vr.oninput=()=>{st.vol=+vr.value;saveSt();vp();const n=performance.now();if(n-lt>120&&st.snd){lt=n;const m=st.mute;st.mute=false;clack(false);st.mute=m}};
  vr.onchange=()=>{st.vol=+vr.value;saveSt()};
}
/* Settings row in More: "Tasbih beads" (separate from everything else) */
(function addSettingsRow(){const lang=document.getElementById('mLang');if(!lang||document.getElementById('mBeads'))return;
  const b=document.createElement('button');b.id='mBeads';
  b.innerHTML=`<span class="ic c-g"><i class="ph ph-vibrate"></i></span><span>${esc(TX('Tasbih beads','حبّات التسبيح','Callee tasbiihaa','Kuusha tasbiixda'))}</span><i class="ph ph-caret-right cv flip"></i>`;
  b.onclick=()=>{ac();beadSettings(false)};lang.after(b)})();

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
  document.getElementById('frGo').onclick=()=>{const o=salCtx();const m=st.mode;st.mode='beads';tasbihPlus(o);st.mode=m;saveSt()};
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
const HCB='../../hisn/clips/';
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
if(QP.get('tbx')){st.mode=QP.get('tbx')==='tap'?'tap':'beads';setTimeout(()=>QP.get('sal')?tasbihPlus(salCtx()):tasbihPlus(null),60)}
if(QP.get('tbs'))setTimeout(styleSheet,400);
if(QP.get('tbset'))setTimeout(()=>beadSettings(false),400);
window.__tbx={MAT,beadImg,haptic,st};
})();
