/* Fastaqim adhkar reader (v7). (c) Fastaqim, all rights reserved.
   One surah or one dhikr at a time. Audio for each one repeats the number of times it should be said,
   counts each time by itself, then moves on. Tap anywhere to count. Tap a word (Word by word) to hear it,
   read it and see its meaning. Text size slider and pinch to zoom.
   Loaded last (defer). Replaces the older reader functions zOpen/zDraw/zNext/zIndex/zTap/zClose and draws into #zr. */
(function(){
'use strict';
if(typeof ZK!=='object'||!document.getElementById('zr'))return;
const ROOT=/\/next\/v6\//.test(location.pathname)?'../../':'';
const FT=(e,a,o,s)=>L==='ar'?a:LI===0?(o||e):LI===1?(s||e):e;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=id=>document.getElementById(id);
const N=n=>AR(n);
const STORE='fqz';                                   // reader settings on this phone (+ S.zs for the shared ones)
const D={size:1,ar:1,tr:1,me:1,auto:1,rep:'n',rate:1,tapw:0};
const st=Object.assign({},D,store(STORE)||{});
if(!st.m2){st.rep='n';delete st.wbw;st.m2=1;store(STORE,st)}   // 24 Nov: 'As many times as needed' is everyone's default; whole-page word mode replaced by tap-a-word card
if(S.zs){['ar','tr','me','auto'].forEach(k=>{if(S.zs[k]!=null&&(store(STORE)||{})[k]==null)st[k]=S.zs[k]});if(S.zs.size&&!(store(STORE)||{}).size)st.size=S.zs.size}
const saveSt=()=>{store(STORE,st);S.zs=Object.assign(S.zs||{},{ar:st.ar,tr:st.tr,me:st.me,auto:st.auto,size:st.size});save()};

try{if((S.zkv||0)<2){Object.values(S.zk||{}).forEach(d=>['morning','evening'].forEach(k=>{const o=d&&d[k];if(!o)return;const n={};Object.keys(o).forEach(x=>{const m=/^(\d+)(\..+)?$/.exec(x);if(m)n[(+m[1]+1)+(m[2]||'')]=o[x];else n[x]=o[x]});d[k]=n}));S.zkv=2;save()}}catch(e){}
/* ---------- data: words, timings, clips ---------- */
let W=null,WP=null;
function loadWords(){if(!WP)WP=fetch(ROOT+'data/adhkar/words.json').then(r=>r.json()).then(d=>{W=d;return d}).catch(()=>{W={q:{},h:{},c:{},g:{},dur:{}};return W});return WP}
loadWords();

const SUR={1:['Al-Fatihah','الفاتحة'],2:['Al-Baqarah','البقرة'],3:['Al Imran','آل عمران'],21:['Al-Anbiya','الأنبياء'],112:['Al-Ikhlas','الإخلاص'],113:['Al-Falaq','الفلق'],114:['An-Nas','الناس']};
const QULS=['112:1','112:2','112:3','112:4','|','113:1','113:2','113:3','113:4','113:5','|','114:1','114:2','114:3','114:4','114:5','114:6'];
const ISTI='أَعُوذُ بِٱللَّهِ مِنَ ٱلشَّيۡطَٰنِ ٱلرَّجِيمِ';
// set -> item -> clip file in hisn/clips (male reader of the site's Hisn al-Muslim recording, cut at the dhikr's own words)
const CLIP={
 morning:{2:'m-asbahna',3:'m-bika-asbahna',4:'sayyid-istighfar',5:'bismillah-la-yadurr',6:'subhan-adada',7:'subhan-wabihamdih',8:'astaghfir-atub'},
 evening:{3:'e-bika-amsayna',4:'sayyid-istighfar',5:'bismillah-la-yadurr',6:'audhu-kalimat',7:'subhan-wabihamdih'},  // item 0 = Ayat al-Kursi (added 24 Nov)
 sleep:{3:'bismika-rabbi',4:'bismika-amutu',5:'subhanallah',6:'alhamdulillah',7:'allahu-akbar'},
 ruqyah:{5:'audhu-kalimat',8:'istiadha'}
};
// short names so everyone knows where they are
const NAME={
 'm-asbahna':['We have entered the morning','أصبحنا وأصبح الملك لله'],'e-amsayna':['We have entered the evening','أمسينا وأمسى الملك لله'],
 'm-bika-asbahna':['By You we enter the morning','اللهم بك أصبحنا'],'e-bika-amsayna':['By You we enter the evening','اللهم بك أمسينا'],
 'sayyid-istighfar':['The best way to ask forgiveness','سيد الاستغفار'],'bismillah-la-yadurr':['In the name of Allah, nothing harms','بسم الله الذي لا يضر'],
 'subhan-adada':['Glory be to Allah, as many as His creation','سبحان الله وبحمده عدد خلقه'],'subhan-wabihamdih':['Glory be to Allah and praise be to Him','سبحان الله وبحمده'],
 'astaghfir-atub':['I ask Allah to forgive me','أستغفر الله وأتوب إليه'],'audhu-kalimat':['The perfect words of Allah','أعوذ بكلمات الله التامات'],
 'bismika-rabbi':['In Your name, my Lord, I lie down','باسمك ربي وضعت جنبي'],'bismika-amutu':['In Your name I die and live','باسمك اللهم أموت وأحيا'],
 'subhanallah':['Glory be to Allah','سبحان الله'],'alhamdulillah':['All praise is for Allah','الحمد لله'],'allahu-akbar':['Allah is the Greatest','الله أكبر'],
 'istiadha':['Refuge from Shaytan','الاستعاذة'],'r-tammah':['From every devil and evil eye','أعوذ بكلمات الله التامة'],
 'r-bism3':['In the name of Allah','بسم الله'],'r-qudrah':['Allah and His power','أعوذ بالله وقدرته'],'r-arqik':['Ruqyah of Jibril','بسم الله أرقيك'],
 'd-hamm':['Worry and grief','اللهم إني أعوذ بك من الهم والحزن']
};
const HNAME={'evening:2':'e-amsayna','ruqyah:4':'r-tammah','ruqyah:7':'r-arqik','dua:0':'d-hamm'};

const strip=h=>String(h||'').replace(/<[^>]+>/g,' ').replace(/\(×\s*\d+\)/g,' ').replace(/۝/g,' ').replace(/\s+/g,' ').trim();
const nkey=w=>w.replace(/[،,.؛:!?«»"]/g,'');
function hWords(ar){return strip(ar).split(' ').filter(Boolean).map(w=>{const k=nkey(w),g=(W&&W.h[k])||['',''];return{ar:w,k,tr:g[0],en:g[1]}})}

/* ---------- steps: Qur'an items split per surah; ruqyah "bismillah x3 then ... x7" split in two ---------- */
const CACHE={};
function steps(set){if(CACHE[set])return CACHE[set];const z=ZK[set],out=[];
 z.items.forEach((it,j)=>{
  let qk=it._qk||(set==='sleep'&&j===2?QULS:null);
  if(!qk&&it.mt==='q'&&/class="an"/.test(it.ar))qk=QULS;
  if(qk){const groups=[];let g=[];qk.forEach(k=>{if(k==='|'){groups.push(g);g=[]}else g.push(k)});groups.push(g);
   groups.forEach((keys,k)=>out.push({j,k:groups.length>1?k:null,parts:groups.length,n:it.n,q:true,keys,pre:(it.pre==='isti'||(/^أَعُوذُ/.test(strip(it.ar))&&keys[0]==='2:255')),it,src:it.src,why:k===0||groups.length===1?it.why:''}));
   return}
  if(set==='ruqyah'&&/\(×\s*3\)/.test(it.ar)){const a='بِسْمِ اللَّهِ',b=strip(it.ar).replace(/^بِسْمِ اللَّهِ\s*/,'');
   out.push({j,k:0,parts:2,n:3,q:false,ar:a,tr:'Bismillāh',me:FT('In the name of Allah. Put your hand on the place that hurts and say it three times.','بسم الله، ضع يدك على الذي تألّم من جسدك وقلها ثلاثًا.'),it,src:it.src,name:'r-bism3'});
   out.push({j,k:1,parts:2,n:7,q:false,ar:b,tr:'Aʿūdhu billāhi wa qudratihi min sharri mā ajidu wa uḥādhir',me:FT('I seek refuge in Allah and His power from the evil of what I feel and what I fear. Say it seven times.','أعوذ بالله وقدرته من شر ما أجد وأحاذر، سبع مرات.'),it,src:it.src,name:'r-qudrah'});return}
  const clip=(CLIP[set]||{})[j];
  out.push({j,k:null,parts:1,n:it.n,q:false,ar:strip(it.ar),tr:it.tr,it,src:it.src,why:it.why,clip,name:clip||HNAME[set+':'+j]})});
 return CACHE[set]=out}
function title(s){if(s.q){if(s.keys.length===1&&s.keys[0]==='2:255')return FT('Ayat al-Kursi','آية الكرسي','Aayaat al-Kursii','Aayatul Kursi');const su=+s.keys[0].split(':')[0],a=s.keys[0].split(':')[1],b=s.keys[s.keys.length-1].split(':')[1],nm=SUR[su]||['Surah '+su,'سورة '+su];
  const whole=su>=112||su===1;return whole?FT(nm[0],'سورة '+nm[1]):FT(nm[0]+' '+a+(b!==a?'–'+b:''),nm[1]+' '+N(a)+(b!==a?'–'+N(b):''))}
 const nm=NAME[s.name];return nm?FT(nm[0],nm[1]):''}

/* ---------- progress (kept in S.zk like before, so Home and Today's list stay right) ---------- */
function P(){const dk=dkey(NOW());S.zk[dk]=S.zk[dk]||{};return S.zk[dk][ZS.set]=S.zk[dk][ZS.set]||{}}
const ck=s=>s.k==null?String(s.j):s.j+'.'+s.k;
function cnt(s,p){p=p||zProg(ZS.set);if(s.k==null)return p[s.j]||0;const v=p[ck(s)];if(v!=null)return v;return (p[s.j]||0)>=s.it.n?s.n:0}
function sync(s,p){if(s.k==null)return;const all=steps(ZS.set).filter(x=>x.j===s.j);const done=all.every(x=>cnt(x,p)>=x.n);p[s.j]=done?s.it.n:Math.min(s.it.n-1,Math.min(...all.map(x=>Math.min(cnt(x,p),x.it.n))))}
const isDone=(s,p)=>cnt(s,p)>=s.n;

/* ---------- audio ---------- */
const A=new Audio();A.preload='auto';A.setAttribute('playsinline','');
const AU={q:[],qi:0,step:-1,on:false,word:null,gap:0,round:0};
function qFor(s){if(s.q){const L=[];const su=+s.keys[0].split(':')[0];
  if(s.keys[0].endsWith(':1')&&su!==1&&su!==9)L.push({f:'audio/g/001001.mp3',tm:'1:1',basm:1});
  s.keys.forEach(k=>{const [a,b]=k.split(':');L.push({f:'audio/g/'+String(a).padStart(3,'0')+String(b).padStart(3,'0')+'.mp3',tm:k})});return L}
 return s.clip?[{f:'hisn/clips/'+s.clip+'.m4a',clip:s.clip}]:[]}
function segDur(x){const d=W&&W.dur&&W.dur[x.f];return d||0}
function total(){return AU.q.reduce((t,x)=>t+segDur(x),0)}
function elapsed(){let t=0;for(let i=0;i<AU.qi;i++)t+=segDur(AU.q[i]);return t+(A.currentTime||0)}
function setRate(){A.defaultPlaybackRate=st.rate;A.playbackRate=st.rate;try{A.preservesPitch=true;A.webkitPreservesPitch=true}catch(e){}}
function loadSeg(i,t){AU.qi=i;const x=AU.q[i];const url=ROOT+x.f;if(!A.src.endsWith(x.f)){A.src=url}setRate();if(t){const go=()=>{try{A.currentTime=t}catch(e){}};if(A.readyState>0)go();else A.addEventListener('loadedmetadata',go,{once:true})}}
function play(){if(!AU.q.length)return;AU.word=null;AU.on=true;if(A.ended||!A.src)loadSeg(AU.qi||0);setRate();A.play().catch(()=>{AU.on=false;toast(FT('Audio could not play','تعذّر تشغيل الصوت','Sagaleen hin taphanne','Codka lama shidi karin'));paintPlayer()});paintPlayer();media()}
function pause(){AU.on=false;clearTimeout(AU.gap);A.pause();paintPlayer()}
function stop(){AU.on=false;clearTimeout(AU.gap);try{A.pause()}catch(e){}AU.word=null;paintPlayer()}
function restart(){clearTimeout(AU.gap);loadSeg(0,0);try{A.currentTime=0}catch(e){}play()}
function seekTo(sec){let i=0;while(i<AU.q.length-1&&sec>segDur(AU.q[i])){sec-=segDur(AU.q[i]);i++}const was=AU.on;if(i!==AU.qi||!A.src.endsWith(AU.q[i].f))loadSeg(i,sec);else try{A.currentTime=Math.max(0,sec)}catch(e){}if(was)A.play().catch(()=>{});paint()}
function skip(d){seekTo(Math.max(0,Math.min(total()-.2,elapsed()+d)))}
A.addEventListener('ended',()=>{if(AU.word)return;if(AU.qi<AU.q.length-1){loadSeg(AU.qi+1,0);A.play().catch(()=>{});return}roundEnd()});
A.addEventListener('timeupdate',()=>{if(AU.word&&A.currentTime>=AU.word.e){A.pause();AU.word=null;hl(-1)}});
A.addEventListener('pause',()=>{if(!AU.word&&!A.ended&&AU.on&&document.hidden===false){}paintPlayer()});
A.addEventListener('play',paintPlayer);
function roundEnd(){const s=cur();if(!s){stop();return}AU.round++;
 if(st.rep==='loop'){bump(s,'audio',true);AU.gap=setTimeout(()=>{if(AU.on){loadSeg(0,0);A.play().catch(()=>{})}},600);return}
 const done=bump(s,'audio');
 if(st.rep==='n'&&!done){AU.gap=setTimeout(()=>{if(AU.on&&cur()===s){loadSeg(0,0);A.play().catch(()=>{})}},600);return}
 const nx=nextOpen();if(done&&nx>=0){win();AU.gap=setTimeout(()=>{if(cur()!==s)return;const was=AU.on;go(nx,was&&st.auto)},1100);return}
 AU.on=false;loadSeg(0,0);paintPlayer()}
// highlight the word being read
let RAF=0;function tick(){cancelAnimationFrame(RAF);if(A.paused&&!AU.word){return}const x=AU.q[AU.qi];if(x&&!AU.word){hl(wordAt(x,A.currentTime))}paintTime();RAF=requestAnimationFrame(tick)}
A.addEventListener('playing',tick);A.addEventListener('seeked',()=>{const x=AU.q[AU.qi];if(x)hl(wordAt(x,A.currentTime));paintTime()});
// match the clip's aligned words to the words shown, so each shown word knows where it is in the audio
const nrm=w=>String(w).replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640،,.؛]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/^و(?=..)/,'').replace(/^ال/,'');
const MAPC={};
function clipTimes(clip){if(MAPC[clip])return MAPC[clip];const cw=W.c[clip];if(!cw||!cw.length)return null;const s=cur();if(!s)return null;const dw=hWords(s.ar);
 const sim=(a,b)=>{a=nrm(a);b=nrm(b);if(a===b)return 1;if(!a||!b)return 0;let m=0;for(const ch of a)if(b.includes(ch))m++;return m/Math.max(a.length,b.length)};
 const T=new Array(dw.length).fill(null);let j=0;
 dw.forEach((w,i)=>{let best=-1,bs=.55;for(let k=j;k<Math.min(cw.length,j+3);k++){const v=sim(w.ar,cw[k][2]);if(v>bs){bs=v;best=k}}if(best>=0){T[i]=[cw[best][0],cw[best][1]];j=best+1}});
 // fill gaps by sharing the time between known neighbours
 for(let i=0;i<T.length;i++){if(T[i])continue;let a=i;while(a<T.length&&!T[a])a++;const t0=i?T[i-1][1]:cw[0][0],t1=a<T.length?T[a][0]:cw[cw.length-1][1],n=a-i;for(let k=0;k<n;k++)T[i+k]=[t0+(t1-t0)*k/n,t0+(t1-t0)*(k+1)/n];i=a}
 return MAPC[clip]=T}
function timesFor(x){if(!W)return null;if(x.clip)return clipTimes(x.clip);const t=W.g[x.tm];return t?t.map(v=>[v[1]/1000,v[2]/1000]):null}
function wordAt(x,t){const T=timesFor(x);if(!T)return -1;for(let i=0;i<T.length;i++){if(t>=T[i][0]-.03&&t<T[i][1]+.04)return (x.off||0)+i}return -2}
let HL=-1;function hl(i){if(i===-2)return;if(i===HL)return;HL=i;const c=$('fzT');if(!c)return;c.querySelectorAll('.fzw.on').forEach(e=>e.classList.remove('on'));if(i<0)return;const seg=AU.qi;const e=c.querySelector(`.fzw[data-s="${seg}"][data-i="${i}"]`);if(e){e.classList.add('on');const r=e.getBoundingClientRect(),b=$('fzB').getBoundingClientRect();if(r.bottom>b.bottom-130||r.top<b.top+20)e.scrollIntoView({block:'center',behavior:'smooth'})}}
// play one word
function sayWord(seg,i,slow){const s=cur();if(!s)return;const x=AU.q[seg];const T=x&&timesFor(x);if(!T||!T[i])return false;clearTimeout(AU.gap);AU.on=false;
 AU.word={e:T[i][1]+.05};const st0=Math.max(0,T[i][0]-.04);loadSeg(seg,st0);A.playbackRate=slow?.7:1;const go=()=>{try{A.currentTime=st0}catch(e){}A.play().catch(()=>{})};if(A.readyState>0)go();else A.addEventListener('loadedmetadata',go,{once:true});hl(i);paintPlayer();tick();return true}
function media(){try{if(!('mediaSession' in navigator))return;const s=cur();navigator.mediaSession.metadata=new MediaMetadata({title:title(s)||ZK[ZS.set].t,artist:'Fastaqim',album:ZK[ZS.set].t,artwork:[{src:ROOT+'icon-512.png',sizes:'512x512',type:'image/png'}]});
 navigator.mediaSession.setActionHandler('play',play);navigator.mediaSession.setActionHandler('pause',pause);
 navigator.mediaSession.setActionHandler('nexttrack',()=>go(ZS.i+1,AU.on));navigator.mediaSession.setActionHandler('previoustrack',()=>go(ZS.i-1,AU.on));
 navigator.mediaSession.setActionHandler('seekto',e=>seekTo(e.seekTime))}catch(e){}}

/* ---------- counting ---------- */
function hap(strong){try{if(window.__tbx&&window.__tbx.haptic){window.__tbx.haptic(strong);return}}catch(e){}vib(strong?[20,40,20]:10)}
// returns true when this step is now done
function bump(s,how,loop){const p=P();const c=cnt(s,p);if(c>=s.n&&!loop)return true;if(c<s.n){p[ck(s)]=c+1;if(s.k!=null)sync(s,p);else p[s.j]=c+1}
 dzAdd(1);save();const done=cnt(s,p)>=s.n;if(how!=='audio')hap(done);paintCount(true);
 if(done){paintSteps();const all=steps(ZS.set).every(x=>isDone(x,p));if(all&&!loop){setTimeout(finish,700);return true}}
 return done}
function tapCount(){const s=cur();if(!s)return;const p=zProg(ZS.set);
 if(isDone(s,p)){const nx=nextOpen();if(nx>=0)go(nx,false);return}
 const done=bump(s,'tap');
 if(done){const was=AU.on;if(AU.on){clearTimeout(AU.gap);A.pause()}const nx=nextOpen();if(nx>=0){win();setTimeout(()=>{if(cur()===s)go(nx,was&&st.auto)},1100)}else{AU.on=false;paintPlayer()}}}
// the next one not yet finished: first after this one, then any skipped earlier
function nextOpen(){const ss=steps(ZS.set),p=zProg(ZS.set);for(let k=1;k<ss.length;k++){const i=(ZS.i+k)%ss.length;if(!isDone(ss[i],p))return i}return -1}
// a short moment that recognises the one just finished
function win(){const c=$('zCard');if(!c)return;c.classList.remove('win');void c.offsetWidth;c.classList.add('win');const a=c.querySelector('.fz-arc');if(a&&!a.querySelector('.fz-burst')){let h='';for(let k=0;k<10;k++){const t=k/10*Math.PI*2;h+=`<i style="--x:${Math.cos(t)*34}px;--y:${Math.sin(t)*34}px;--d:${k%2?.05:0}s"></i>`}a.insertAdjacentHTML('beforeend',`<span class="fz-burst">${h}</span>`)}
 const h=$('fzHint');if(h)h.innerHTML=`<span class="fz-ok"><i class="ph-bold ph-check"></i>${esc(FT('Done. Moving to the next one','تمّ. الانتقال إلى التالي','Xumurame. Gara itti aanutti','Waa la dhammeeyey. U gudbaya kan xiga'))}</span>`}
function undo(){const s=cur();if(!s)return;const p=P();const c=cnt(s,p);if(!c)return;p[ck(s)]=c-1;if(s.k!=null)sync(s,p);else p[s.j]=c-1;save();hap(false);paintCount();paintSteps()}
function finish(){stop();try{const set=ZS.set;if(['morning','evening','sleep'].includes(set)){const dk=dkey(NOW());S.ci=S.ci||{};S.ci[dk]=S.ci[dk]||{};if(!S.ci[dk][set]){S.ci[dk][set]=true;const c=(typeof CI!=='undefined'?CI:[]).find(x=>x[0]===set);if(c)star('ci-'+set+'-'+dk,c[1]);save();if(typeof renderCI==='function'&&$('ci'))renderCI()}}}catch(e){}try{celebrate(ZS.set)}catch(e){}try{const h=document.querySelector('#cel h2');if(h&&ZS&&ZS.set!=='sleep')h.textContent=FT('All done. May Allah accept it.','تمّت كلها. تقبّل الله منك.','Hundi xumurameera. Rabbiin si irraa haa fudhatu.','Dhammaan waa la dhammeeyey. Alle ha kaa aqbalo.')}catch(e){}}

/* ---------- drawing ---------- */
const cur=()=>ZS&&steps(ZS.set)[ZS.i];
function build(){const zr=$('zr');zr.classList.add('fz');
 zr.innerHTML=`<div class="fz-hd"><button class="fz-ib" id="fzX" aria-label="${esc(FT('Close','إغلاق','Cufi','Xir'))}"><i class="ph ph-x"></i></button><h1 id="fzTitle"></h1><button class="fz-ib" id="fzO" aria-label="${esc(FT('Reading and audio options','خيارات القراءة والصوت','Filannoo','Doorashooyin'))}"><i class="ph ph-sliders-horizontal"></i></button></div>
 <div class="fz-steps" id="fzS"></div>
 <div class="fz-body" id="fzB"><article class="fz-card" id="zCard"></article><p class="fz-hint" id="fzHint"></p></div>
 <div class="fz-dock" id="fzD"></div>`;
 $('fzX').onclick=()=>zClose();$('fzO').onclick=options;
 const B=$('fzB');
 // tap anywhere to count (not on buttons, links, words in Word by word, or the player)
 B.addEventListener('click',e=>{if(LP.fired){LP.fired=false;return}if(e.target.closest('a,button,input,label,.fz-dock'))return;if(PZ.moved){PZ.moved=false;return}
  const w=st.tapw&&e.target.closest('.fzw');if(w){wordPop(+w.dataset.s,+w.dataset.i);return}tapCount()});
 holdWords(B);pinch(B);B.addEventListener('scroll',()=>popClose(),{passive:true})}
function paintSteps(){const ss=steps(ZS.set),p=zProg(ZS.set);$('fzS').innerHTML=`<div class="fz-path">${ss.map((s,i)=>`<button type="button" data-go="${i}" class="${isDone(s,p)?'dn':''} ${i===ZS.i?'cur':''}" aria-label="${esc(FT('Go to '+(i+1),'اذهب إلى '+N(i+1)))}"><i></i></button>`).join('')}</div>`;
 $('fzS').querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(+b.dataset.go,false))}
function qText(s){let h='',segs=qFor(s),si=0;
 if(s.pre)h+=`<div class="fz-pre"><small>${esc(FT('First say','قل أولًا','Dura jedhi','Marka hore dheh'))}</small><span lang="ar" dir="rtl">${ISTI}</span></div>`;
 segs.forEach((x,i)=>{const isB=!!x.basm;const key=x.tm;const wd=(W&&W.q[key]&&W.q[key].w)||null;
  const words=wd?wd.map(w=>({ar:w[0],tr:w[1],en:w[2]})):(QD[key]?QD[key].a.split(' ').map(a=>({ar:a,tr:'',en:''})):[]);
  h+=`<div class="fz-ay${isB?' b':''}" lang="ar" dir="rtl">${words.map((w,k)=>wcell(w,i,k,true)).join(' ')}</div>`;
  if(st.tr&&!isB&&wd)h+=`<p class="fz-tr">${esc(wd.map(w=>w[1]).join(' '))}</p>`;
  if(st.me&&!isB&&L!=='ar')h+=`<p class="fz-me">${esc(qMean(key))}</p>`});
 return h}
function qMean(k){try{if(LI>=0&&typeof QTR_ID!=='undefined'){const c=JSON.parse(localStorage.getItem('fq5.qtr.'+QTR_ID)||'{}');if(c[k])return c[k]}}catch(e){}return QD[k]?QD[k].en:''}
function wcell(w,seg,i,q){return `<span class="fzw" data-s="${seg}" data-i="${i}">${esc(w.ar)}</span>`}
function phrases(words,seg){// keep each phrase (up to a comma) together, so lines break at natural pauses
 const out=[];let cur=[];words.forEach((w,i)=>{cur.push(wcell(w,seg,i,false));if(/[،,]$/.test(w.ar)){out.push(cur);cur=[]}});if(cur.length)out.push(cur);
 return out.map(p=>`<span class="fz-ph">${p.join(' ')}</span>`).join(' ')}
function hText(s){const ws=hWords(s.ar);let h=`<div class="fz-h" lang="ar" dir="rtl">${phrases(ws,0)}</div>`;
 if(st.tr&&s.tr)h+=`<p class="fz-tr">${esc(s.tr)}</p>`;
 const me=s.me!=null?s.me:s.it.me;if(st.me&&me&&L!=='ar')h+=`<p class="fz-me">${esc(me)}</p>`;return h}
function card(){const s=cur(),ss=steps(ZS.set),p=zProg(ZS.set),c=cnt(s,p);
 const src=s.q?`<a href="https://quran.com/${s.keys[0].split(':')[0]}/${s.keys[0].split(':')[1]}${s.keys.length>1?'-'+s.keys[s.keys.length-1].split(':')[1]:''}" target="_blank" rel="noopener">${esc(FT("Qur'an",'القرآن','Qur\'aana','Qur\'aanka'))} ${s.keys[0]}${s.keys.length>1?'–'+s.keys[s.keys.length-1].split(':')[1]:''} ↗</a>`:'';
 const hs=s.src?`<a href="${esc(s.src[1])}" target="_blank" rel="noopener">${esc(s.src[0])} ↗</a>`:'';
 const tt=title(s);
 $('zCard').className='fz-card'+(isDone(s,p)?' done':'');
 $('zCard').style.setProperty('--fz',st.size);
 $('zCard').innerHTML=`<header class="fz-top"><div class="fz-lbl"><small>${esc(FT((ZS.i+1)+' of '+ss.length,N(ZS.i+1)+' من '+N(ss.length),(ZS.i+1)+' keessaa '+ss.length,(ZS.i+1)+' ee '+ss.length))}</small>${tt?`<b>${esc(tt)}</b>`:''}</div>
  <div class="fz-cnt" id="fzC"></div></header>
  <div class="fz-txt" id="fzT">${s.q?qText(s):hText(s)}</div>
  ${s.why&&L!=='ar'?`<p class="fz-why">${esc(s.why)}</p>`:''}
  <footer class="fz-src">${[src,hs].filter(Boolean).join('<span>·</span>')}</footer>`;
 if(!st.ar)$('zCard').classList.add('noar');
 paintCount()}
function paintCount(pop){const s=cur();if(!s)return;const p=zProg(ZS.set),c=Math.min(cnt(s,p),s.n),done=c>=s.n,el=$('fzC');if(!el)return;
 const arc=window.FQ&&FQ.arc?FQ.arc(c,s.n,{w:50}):'';
 el.innerHTML=`${c&&!done?`<button class="fz-un" id="fzU" aria-label="${esc(FT('Undo one','تراجع عن واحدة','Tokko deebisi','Mid ka noqo'))}"><i class="ph ph-arrow-counter-clockwise"></i></button>`:''}<div class="fz-arc${pop?' pop':''}">${arc}<span class="fz-num">${done?esc(FT('Done','تمّ','Xumurame','Waa dhammaatay')):`${N(c)}<i>/</i>${N(s.n)}`}</span></div>`;
 const u=$('fzU');if(u)u.onclick=e=>{e.stopPropagation();undo()};
 $('zCard').classList.toggle('done',done);
 const last=ZS.i>=steps(ZS.set).length-1;
 $('fzHint').innerHTML=done?(last?'':(st.auto?`<span class="fz-mv">${esc(FT('Moving to the next one','الانتقال إلى التالي','Gara itti aanutti','U gudbaya kan xiga'))}</span>`:`<button class="fz-next" id="fzN">${esc(FT('Next','التالي','Itti aanu','Xiga'))} <i class="ph ph-arrow-right flip"></i></button>`))
  :`<span>${esc(s.n>1?FT('Tap anywhere to count · '+s.n+' times','اضغط في أي مكان للعدّ · '+N(s.n)+(s.n>2&&s.n<11?' مرات':' مرة'),'Lakkaa\'uuf bakka kamiyyuu tuqi · yeroo '+s.n,'Meel kasta taabo si aad u tiriso · '+s.n+' jeer'):FT('Tap anywhere when you have said it','اضغط في أي مكان بعد أن تقوله','Erga jettee booda bakka kamiyyuu tuqi','Meel kasta taabo markaad tiraahdo'))}</span><small class="fz-lw"><i class="ph ph-hand-tap"></i>${esc(st.tapw?FT('Tap a word to hear it and see its meaning','اضغط على كلمة لتسمعها وترى معناها','Jecha tokko tuqii dhaggeeffadhu, hiika isaas argi','Eray taabo si aad u maqasho una aragto macnihiisa'):FT('Press and hold a word to hear it and see its meaning','اضغط مطوّلًا على كلمة لتسمعها وترى معناها','Jecha tokko qabadhuu dhaggeeffadhu, hiika isaas argi','Eray ku hay farta si aad u maqasho una aragto macnihiisa'))}</small>`;
 const n=$('fzN');if(n)n.onclick=e=>{e.stopPropagation();const nx=nextOpen();go(nx>=0?nx:ZS.i+1,false)}}
const fmt=t=>{t=Math.max(0,Math.round(t||0));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')};
const RATES=[.75,1,1.25,1.5,2];
const REPS={n:['As many times as needed','بعدد المرات المطلوبة','Hamma barbaachisu','Inta loo baahdo'],one:['Play once','مرة واحدة','Yeroo tokko','Hal mar'],loop:['Keep repeating','كرّر دائمًا','Irra deebi\'i','Ku celi']};
function paintPlayer(){const d=$('fzD');if(!d||!ZS)return;const s=cur();const has=AU.q.length>0;
 if(!has){d.innerHTML=`<p class="fz-noau">${esc(FT('No recording for this one yet. Read it and tap to count.','لا يوجد تسجيل لهذا الذكر بعد. اقرأه واضغط للعدّ.','Kanaaf sagaleen hin jiru. Dubbisii tuqi.','Midkan cod weli uma laha. Akhri oo taabo.'))}</p>`;return}
 const on=AU.on&&!A.paused||AU.on;
 if(!d.querySelector('.fz-pl')){d.innerHTML=`<div class="fz-pl"><div class="fz-seek"><span id="fzE">0:00</span><input type="range" id="fzR" min="0" max="1000" value="0" aria-label="${esc(FT('Position','الموضع','Bakka','Meesha'))}"><span id="fzL">0:00</span></div>
  <div class="fz-ctl"><button id="fzRe" aria-label="${esc(FT('Start again','من البداية','Jalqabaa','Bilow'))}"><i class="ph ph-arrow-counter-clockwise"></i></button>
  <button id="fzBk" aria-label="-5"><i class="ph ph-rewind"></i><small>5</small></button>
  <button class="fz-pp" id="fzP" aria-label="Play"><i class="ph-fill ph-play"></i></button>
  <button id="fzFw" aria-label="+5"><i class="ph ph-fast-forward"></i><small>5</small></button>
  <button class="fz-sp" id="fzSp" aria-label="${esc(FT('Speed','السرعة','Saffisa','Xawaare'))}"></button>
  <button class="fz-rp" id="fzRp" aria-label="${esc(FT('Repeat','التكرار','Irra deebi\'uu','Ku celin'))}"></button></div></div>`;
  $('fzP').onclick=e=>{e.stopPropagation();if(AU.on&&!A.paused)pause();else play()};
  $('fzRe').onclick=e=>{e.stopPropagation();restart()};
  $('fzBk').onclick=e=>{e.stopPropagation();skip(-5)};$('fzFw').onclick=e=>{e.stopPropagation();skip(5)};
  $('fzSp').onclick=e=>{e.stopPropagation();st.rate=RATES[(RATES.indexOf(st.rate)+1)%RATES.length]||1;saveSt();setRate();paintPlayer();toast(FT('Speed ','السرعة ')+st.rate+'×')};
  $('fzRp').onclick=e=>{e.stopPropagation();const o=['n','one','loop'];st.rep=o[(o.indexOf(st.rep)+1)%3];saveSt();paintPlayer();toast(FT(...REPS[st.rep]))};
  const R=$('fzR');let drag=false;R.addEventListener('input',()=>{drag=true;$('fzE').textContent=fmt(R.value/1000*total())});
  R.addEventListener('change',()=>{drag=false;seekTo(R.value/1000*total())});R.addEventListener('pointerdown',e=>e.stopPropagation());R._drag=()=>drag}
 const pl=AU.on&&!A.paused;$('fzP').innerHTML=`<i class="ph-fill ${pl||AU.on?'ph-pause':'ph-play'}"></i>`;$('fzP').setAttribute('aria-label',pl?'Pause':'Play');
 $('fzSp').textContent=(st.rate===1?'1':String(st.rate))+'×';
 $('fzRp').innerHTML=`<i class="ph ${st.rep==='loop'?'ph-repeat':st.rep==='one'?'ph-number-circle-one':'ph-repeat-once'}"></i><small>${st.rep==='n'?'×'+N(s.n):st.rep==='one'?'1':'∞'}</small>`;
 $('fzRp').classList.toggle('on',st.rep!=='one');paintTime()}
function paintTime(){const R=$('fzR');if(!R)return;const T=total(),e=elapsed();if(R._drag&&R._drag())return;$('fzE').textContent=fmt(e);$('fzL').textContent=fmt(T);R.value=T?Math.round(e/T*1000):0;R.style.setProperty('--p',(T?e/T*100:0)+'%')}
function paint(){paintSteps();card();paintPlayer()}

/* ---------- moving between steps ---------- */
function go(i,autoplay){const ss=steps(ZS.set);if(i<0||i>=ss.length)return;popClose();stop();ZS.i=i;AU.q=qFor(ss[i]);AU.qi=0;AU.round=0;if(AU.q.length)loadSeg(0,0);HL=-1;paint();$('fzB').scrollTop=0;if(autoplay&&AU.q.length)play();else media()}

/* ---------- word sheet: hear it, read it, its meaning ---------- */
function wordList(){const s=cur();if(s.q){const segs=qFor(s);return segs.map((x,i)=>{const wd=W&&W.q[x.tm]&&W.q[x.tm].w;return (wd||[]).map((w,k)=>({seg:i,i:k,ar:w[0],tr:w[1],en:w[2]}))}).flat()}
 return hWords(s.ar).map((w,k)=>({seg:0,i:k,ar:w.ar,tr:w.tr,en:w.en}))}
const LP={t:0,fired:false,x:0,y:0};
function holdWords(B){const clr=()=>{clearTimeout(LP.t);LP.t=0};
 B.addEventListener('pointerdown',e=>{const w=e.target.closest('.fzw');if(!w||e.isPrimary===false)return;LP.x=e.clientX;LP.y=e.clientY;clr();LP.fired=false;
  LP.t=setTimeout(()=>{LP.t=0;if(PZ.d)return;LP.fired=true;hap(false);wordPop(+w.dataset.s,+w.dataset.i)},380)});
 B.addEventListener('pointermove',e=>{if(LP.t&&Math.hypot(e.clientX-LP.x,e.clientY-LP.y)>9)clr()});
 ['pointerup','pointercancel','pointerleave'].forEach(t=>B.addEventListener(t,clr));
 B.addEventListener('contextmenu',e=>{if(e.target.closest('.fzw'))e.preventDefault()})}
let POP=null;
function popClose(){if(!POP)return;POP.el.remove();document.removeEventListener('pointerdown',POP.out,true);document.querySelectorAll('.fzw.pk').forEach(x=>x.classList.remove('pk'));if(AU.word){AU.word=null;try{A.pause()}catch(e){}paintPlayer()}POP=null}
// a small card next to the word: the word, how to say it, its meaning, hear it (normal or slow), previous / next word
function wordPop(seg,i){const all=wordList();let at=all.findIndex(w=>w.seg===seg&&w.i===i);if(at<0)return;stop();popClose();
 const el=document.createElement('div');el.className='fz-pop';el.setAttribute('role','dialog');$('zr').appendChild(el);
 const out=e=>{if(!e.target.closest('.fz-pop')){e.stopPropagation();e.preventDefault();popClose();LP.fired=true;setTimeout(()=>LP.fired=false,450)}};
 POP={el,out};setTimeout(()=>{if(POP&&POP.el===el)document.addEventListener('pointerdown',out,true)},0);
 const draw=(say)=>{const w=all[at];const T=timesFor(AU.q[w.seg]||{});const can=!!(T&&T[w.i]);
  document.querySelectorAll('.fzw.pk').forEach(x=>x.classList.remove('pk'));const we=document.querySelector(`#zCard .fzw[data-s="${w.seg}"][data-i="${w.i}"]`);if(we)we.classList.add('pk');
  el.innerHTML=`<div class="fz-pt"><span>${N(at+1)} / ${N(all.length)}</span><button class="fz-px" aria-label="${esc(FT('Close','إغلاق','Cufi','Xir'))}"><i class="ph ph-x"></i></button></div>
  <div class="fz-wa" lang="ar" dir="rtl">${esc(w.ar.replace(/[،,]$/,''))}</div>${w.tr?`<div class="fz-wt" dir="ltr">${esc(w.tr)}</div>`:''}${w.en&&L!=='ar'?`<div class="fz-wm" dir="ltr">${esc(w.en)}</div>`:''}
  <div class="fz-pb"><button class="fz-pn" data-d="-1" ${at?'':'disabled'} aria-label="${esc(FT('Previous word','الكلمة السابقة'))}"><i class="ph ph-caret-left"></i></button>
  ${can?`<button class="fz-wp" data-sl="0"><i class="ph-fill ph-speaker-high"></i>${esc(FT('Hear','استمع','Dhaggeeffadhu','Dhageyso'))}</button><button class="fz-wp lt" data-sl="1" aria-label="${esc(FT('Hear slowly','استمع ببطء','Suuta dhaggeeffadhu','Si tartiib ah u dhageyso'))}"><i class="ph ph-gauge"></i>${esc(FT('Slow','ببطء','Suuta','Tartiib'))}</button>`:`<span class="fz-wn">${esc(FT('No recording of this word yet','لا يوجد تسجيل لهذه الكلمة بعد','Sagaleen jecha kanaa hin jiru','Erayga cod uma laha weli'))}</span>`}
  <button class="fz-pn" data-d="1" ${at<all.length-1?'':'disabled'} aria-label="${esc(FT('Next word','الكلمة التالية'))}"><i class="ph ph-caret-right"></i></button></div>`;
  el.querySelector('.fz-px').onclick=popClose;el.querySelectorAll('[data-sl]').forEach(b=>b.onclick=()=>sayWord(w.seg,w.i,b.dataset.sl==='1'));
  el.querySelectorAll('.fz-pn').forEach(b=>b.onclick=()=>{const rtlNext=b.dataset.d==='1';at=Math.max(0,Math.min(all.length-1,at+(rtlNext?1:-1)));draw(true)});
  place(we);if(can&&say)sayWord(w.seg,w.i,false)};
 const place=we=>{const vw=innerWidth,vh=innerHeight,pw=Math.min(320,vw-24);el.style.width=pw+'px';
  const r=we?we.getBoundingClientRect():{left:vw/2,right:vw/2,top:vh/3,bottom:vh/3,width:0};const h=el.offsetHeight;
  let x=Math.max(12,Math.min(vw-pw-12,r.left+r.width/2-pw/2));const dock=$('fzD')?$('fzD').getBoundingClientRect().top:vh;
  let below=r.bottom+12+h<dock-8;let y=below?r.bottom+12:r.top-12-h;if(y<12){y=Math.max(12,Math.min(dock-h-8,r.bottom+12));}
  el.style.left=x+'px';el.style.top=y+'px';el.classList.toggle('up',!below);el.style.setProperty('--ax',Math.max(18,Math.min(pw-18,r.left+r.width/2-x))+'px');
  requestAnimationFrame(()=>el.classList.add('on'))};
 if(!W)loadWords().then(()=>draw(true));else draw(true)}
const wordSheet=wordPop;

/* ---------- options: text size slider, what to show, auto-next, audio ---------- */
function options(){const sw=(k,l,sub)=>`<label class="fz-row"><span><b>${esc(l)}</b>${sub?`<small>${esc(sub)}</small>`:''}</span><button class="sw ${st[k]?'on':''}" data-k="${k}" aria-label="${esc(l)}"></button></label>`;
 const seg=(k,vals,lab)=>`<div class="fz-seg" data-seg="${k}">${vals.map(v=>`<button data-v="${v}" class="${String(st[k])===String(v)?'on':''}">${esc(lab(v))}</button>`).join('')}</div>`;
 openSheet(`<div class="hd sub"><span style="width:44px"></span><h1>${esc(FT('Reading and audio','القراءة والصوت','Dubbisaa fi sagalee','Akhriska iyo codka'))}</h1>${XB}</div>
 <div class="fz-opt">
 <h3>${esc(FT('Text size','حجم الخط','Hamma barreeffamaa','Cabbirka qoraalka'))}</h3>
 <div class="fz-size"><span class="s">ع</span><input type="range" id="fzZ" min="80" max="220" step="5" value="${Math.round(st.size*100)}" aria-label="${esc(FT('Text size','حجم الخط'))}"><span class="l">ع</span></div>
 <p class="fz-sz" id="fzZv">${Math.round(st.size*100)}% · ${esc(FT('You can also pinch the text with two fingers','يمكنك أيضًا التكبير بإصبعين','Quba lamaan dabalchuu dandeessa','Labo farood ayaad ku weynayn kartaa'))}</p>
 <h3>${esc(FT('Show','إظهار','Agarsiisi','Tus'))}</h3><div class="fz-card2">
 ${sw('ar',FT('Arabic','العربية','Arabiffa','Carabi'))}${sw('tr',FT('How to say it','النطق بالحروف اللاتينية','Akkaataa itti jedhamu','Sida loo dhawaaqo'),FT('Transliteration','نطق','Qubee','Higgaad'))}${sw('me',FT('Meaning','المعنى','Hiika','Macnaha'))}${sw('tapw',FT('Open words with one tap','فتح الكلمة بضغطة واحدة','Jecha tuqii bani','Eray ku fur hal taabasho'),FT('Off: press and hold a word, and a tap anywhere counts. On: one tap on a word opens it.','مغلق: اضغط مطوّلًا على الكلمة، والضغط في أي مكان يعدّ. مفعّل: ضغطة على الكلمة تفتحها.','Cufaa: jecha qabadhu. Banaa: tuqa tokkoon bana.','Dansan: eraygii ku hay farta. Shidan: hal taabasho ayaa furta.'))}</div>
 <h3>${esc(FT('Audio','الصوت','Sagalee','Codka'))}</h3><div class="fz-card2">
 ${sw('auto',FT('Move on by itself','الانتقال تلقائيًا','Ofumaan itti fufi','Si toos ah u gudub'),FT('When one is finished, the next one starts','عند الانتهاء يبدأ التالي','Yeroo tokko xumuramu kan itti aanu jalqaba','Marka mid dhammaado kan xiga ayaa bilaabma'))}
 <div class="fz-row col"><b>${esc(FT('Repeat','التكرار','Irra deebi\'uu','Ku celin'))}</b>${seg('rep',['n','one','loop'],v=>FT(...REPS[v]))}</div>
 <div class="fz-row col"><b>${esc(FT('Speed','السرعة','Saffisa','Xawaare'))}</b>${seg('rate',RATES,v=>v+'×')}</div></div>
 <button class="fz-reset" id="fzRs"><i class="ph ph-arrow-counter-clockwise"></i>${esc(FT('Start this set again from the beginning','ابدأ هذه الأذكار من جديد','Kana jalqabarraa irra deebi\'ii jalqabi','Ka bilow mar kale bilowga'))}</button>
 </div>`);
 const z=$('fzZ');z.oninput=()=>{st.size=z.value/100;$('fzZv').firstChild.textContent=z.value+'% · ';const c=$('zCard');if(c)c.style.setProperty('--fz',st.size)};z.onchange=saveSt;
 document.querySelectorAll('#sh .fz-row .sw').forEach(b=>b.onclick=e=>{e.preventDefault();const k=b.dataset.k;st[k]=st[k]?0:1;if(!st.ar&&!st.tr&&!st.me)st.ar=1;saveSt();b.classList.toggle('on',!!st[k]);card()});
 document.querySelectorAll('#sh [data-seg]').forEach(g=>g.querySelectorAll('button').forEach(b=>b.onclick=()=>{const k=g.dataset.seg;st[k]=k==='rate'?+b.dataset.v:b.dataset.v;saveSt();g.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));setRate();paintPlayer()}));
 $('fzRs').onclick=()=>{const dk=dkey(NOW());if(S.zk[dk])delete S.zk[dk][ZS.set];save();closeSheet();go(0,false);toast(FT('Started again','بدأت من جديد','Irra deebi\'ee jalqabe','Mar kale ayaa la bilaabay'))}}

/* ---------- pinch to zoom the text ---------- */
const PZ={d:0,s:1,moved:false};
function pinch(el){const dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
 el.addEventListener('touchstart',e=>{if(e.touches.length===2){PZ.d=dist(e.touches);PZ.s=st.size;PZ.moved=true}},{passive:true});
 el.addEventListener('touchmove',e=>{if(e.touches.length===2&&PZ.d){e.preventDefault();st.size=Math.max(.8,Math.min(2.2,PZ.s*dist(e.touches)/PZ.d));const c=$('zCard');if(c)c.style.setProperty('--fz',st.size)}},{passive:false});
 el.addEventListener('touchend',e=>{if(PZ.d&&e.touches.length<2){PZ.d=0;saveSt();setTimeout(()=>PZ.moved=false,350)}});
 ['gesturestart','gesturechange'].forEach(t=>el.addEventListener(t,e=>e.preventDefault(),{passive:false}))}

/* ---------- every sheet: swipe down to close, shadow under the sticky title row ---------- */
(function(){const sh=$('sh');if(!sh||sh.dataset.sw)return;sh.dataset.sw=1;let y0=null,dy=0;
 sh.addEventListener('scroll',()=>sh.classList.toggle('scr',sh.scrollTop>4),{passive:true});
 sh.addEventListener('touchstart',e=>{if(e.touches.length!==1||e.target.closest('input,textarea,select,.fz-seg'))return;if(sh.scrollTop>0&&!e.target.closest('.grab,.hd'))return;y0=e.touches[0].clientY;dy=0},{passive:true});
 sh.addEventListener('touchmove',e=>{if(y0==null)return;dy=e.touches[0].clientY-y0;if(dy>0){sh.classList.add('drag');sh.style.transform=`translateY(${dy}px)`;if(e.cancelable)e.preventDefault()}else if(dy<-6){y0=null;sh.classList.remove('drag');sh.style.transform=''}},{passive:false});
 sh.addEventListener('touchend',()=>{if(y0==null)return;y0=null;sh.classList.remove('drag');sh.style.transform='';if(dy>90)closeSheet();dy=0});
 let was=false;new MutationObserver(()=>{const on=sh.classList.contains('on');if(on===was)return;was=on;if(!on){sh.style.transform='';sh.classList.remove('scr')}}).observe(sh,{attributes:true,attributeFilter:['class']});
})();

/* ---------- take over the old reader ---------- */
const oldClose=window.zClose;
window.zOpen=function(set){const z=ZK[set];if(!z)return;delete CACHE[set];ZS={set,i:0};const ss=steps(set),p=zProg(set);let i=ss.findIndex(s=>!isDone(s,p));if(i<0)i=0;
 build();$('zr').classList.add('on');document.body.style.overflow='hidden';$('fzTitle').textContent=z.t;
 const start=()=>go(i,false);if(W)start();else{paint0();loadWords().then(()=>{if(ZS&&ZS.set===set)start()})}};
function paint0(){ZS.i=ZS.i||0;AU.q=qFor(cur());paint()}
window.zDraw=function(){if(!ZS)return;if(!$('fzB')){build();$('fzTitle').textContent=ZK[ZS.set].t}const ss=steps(ZS.set);if(ZS.i>=ss.length)ZS.i=ss.length-1;AU.q=qFor(cur());paint()};
window.zNext=function(){if(ZS)go(ZS.i+1,false)};
window.zTap=tapCount;window.zIndex=function(){};
window.zClose=function(){popClose();stop();try{A.removeAttribute('src');A.load()}catch(e){}$('zr').classList.remove('fz');return oldClose.apply(this,arguments)};
window.FQZ={steps,go,st,A,AU,tapCount,wordSheet,options,cur};
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&ZS&&$('fzD'))paintPlayer()});
// a reader already open (deep link) gets the new one
if(ZS&&$('zr').classList.contains('on')){const s=ZS.set;window.zOpen(s)}
})();
