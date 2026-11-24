// Tap test: "Recite from memory" in the Qur'an reader. Run: ENGINE=webkit BASE=/next/v6/ node recite.js out
// Default: the listening engine is replaced by a small fake inside the page (it "hears" the ayat word by word and reports
// one changed word and one missed word), so the test needs no microphone and no download.
// REAL=1 (Chromium only, needs internet to tilawa.dev): the real Tilawa engine, with a recorded recitation played into a fake microphone (WAV=path).
const pw=require('playwright');const devices=pw.devices;const fs=require('fs'),path=require('path');
const REAL=process.env.REAL==='1';const eng=pw[REAL?'chromium':(process.env.ENGINE||'chromium')];
const ROOT=process.env.ROOT||'/home/user/fastaqim',BASE=process.env.BASE||'/next/v6/';const MT={'.html':'text/html','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.otf':'font/otf','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const OUT=process.argv[2]||'qa-recite';fs.mkdirSync(OUT,{recursive:true});let fails=0;
const ok=(n,v)=>{console.log((v?'PASS ':'FAIL ')+n);if(!v)fails++};
const FAKE=()=>{const subs=[];let ses=null;
 window.FQ_RC_ENGINE={prepareMicrophone:()=>({context:null,stream:Promise.resolve(null),release(){}}),
  createTilawa:async(o)=>{for(let i=1;i<=4;i++){await new Promise(r=>setTimeout(r,120));o.onProgress&&o.onProgress({stage:'model',loaded:i*6e6,total:24e6,fraction:i/4})}o.onProgress&&o.onProgress({stage:'warmup',loaded:1,total:1,fraction:1});
   return{startMemorization(p){const L=[];let mk=[];ses={p,state:'active',subscribe(f){L.push(f)},onAudio(){return()=>{}},emit(e){L.forEach(f=>f(e))},mistakes:()=>mk,end:async()=>[],dispose(){},_mk:m=>mk=m};return ses},
    async listen(s,o){const d=RQ.c[RD.su];let a=s.p.fromAyah,w=0,stop=false;const m1={type:'checker',id:'m1',state:'confirmed',errorClass:'wrong_word',location:{surah:RD.su,ayah:s.p.fromAyah,word:2},timeMs:0,confidence:.9},
      m2={type:'checker',id:'m2',state:'confirmed',errorClass:'omitted_word',location:{surah:RD.su,ayah:Math.min(s.p.toAyah,s.p.fromAyah+1),word:1},timeMs:0,confidence:.9};
     const tick=()=>{if(stop)return;const n=d.v[a-1][0].split(' ').length;w++;if(w>n){a++;w=1}if(a>s.p.toAyah)return;s.emit({type:'position',state:'locked',observed:[{word:{surah:RD.su,ayah:a,word:w}}]});o.onLevel&&o.onLevel(-30+Math.random()*20);
      if(a===m1.location.ayah&&w===3){s.emit(m1);s._mk([m1])}if(a===m2.location.ayah&&w===2&&window.__twoMistakes!==false){s.emit(m2);s._mk([m1,m2])}setTimeout(tick,window.__tick||90)};setTimeout(tick,200);
     return{stop:async()=>{stop=true;return[]}}}}}}};
(async()=>{const b=await eng.launch(REAL?{args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+process.env.WAV]}:{});
 const c=await b.newContext({...devices[process.env.DEV||'iPhone 13'],deviceScaleFactor:Number(process.env.DSF||1),...(REAL?{permissions:['microphone']}:{})});
 await c.route('**/*',r=>{const u0=new URL(r.request().url());if(u0.host==='accounts.google.com')return r.fulfill({body:'',contentType:'application/javascript'});
  if(u0.host==='tilawa.dev'&&REAL)return r.continue();if(u0.host!=='fq.test')return r.abort();let u=u0.pathname;if(u.endsWith('/'))u+='index.html';const f=path.join(ROOT,decodeURIComponent(u));
  if(fs.existsSync(f))r.fulfill({body:fs.readFileSync(f),contentType:MT[path.extname(f)]||'application/octet-stream'});else r.fulfill({status:404,body:''})});
 if(!REAL)await c.addInitScript(FAKE);
 const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(REAL)console.log('  [page]',m.text().slice(0,200))});
 const snap=n=>p.screenshot({path:path.join(OUT,n+'.png')});
 await p.goto('https://fq.test'+BASE+'?nosync=1'+(process.env.LANGQ?'&'+process.env.LANGQ:'')+'#home');await p.waitForTimeout(1200);
 await p.evaluate(()=>{S.qLast={su:67,ay:1,p:562,j:29};S.rcUi={hide:0,rec:0};save();go('quran')});await p.waitForTimeout(600);
 ok('Recite button on the Qur\'an page',await p.isVisible('.qh .act .rc'));await snap('1_quran_tab');
 await p.evaluate(k=>qOpen(k),(process.env.RSU||'67')+':1');await p.waitForTimeout(1200);
 ok('Recite pill under the surah title',await p.isVisible('#rdB .rsh .rcp'));await snap('2_reader');
 await p.click('#rdB .rsh .rcp');await p.waitForTimeout(500);await snap('3_start_sheet');
 ok('start sheet open',await p.isVisible('#rcGo'));ok('first-time download note',await p.isVisible('.rcs .inf'));
 const ov=await p.evaluate(()=>{const sh=document.getElementById('sh');return[...sh.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&(r.right>innerWidth+1||r.left<-1)}).map(e=>e.className).slice(0,5)});ok('nothing wider than the screen '+JSON.stringify(ov),!ov.length);
 await p.selectOption('#rcA2',process.env.RA2||'5');
 if(REAL){await p.click('#rcGo');await p.waitForFunction(()=>/Start/.test(document.getElementById('rcGoT')?.textContent||''),null,{timeout:240000});await snap('4r_ready');
  const info=await p.evaluate(()=>FQRC&&1);await p.click('#rcGo');await p.waitForTimeout(500);
  ok('bar shows while listening',await p.isVisible('.rcb.on'));await p.waitForTimeout(Number(process.env.LISTEN_MS||14000));await snap('5r_listening');
  const heard=await p.evaluate(()=>({dn:document.querySelectorAll('#rdB .rw.dn').length,now:document.querySelector('#rdB .rw.now')?.textContent||''}));console.log('  heard',JSON.stringify(heard));
  ok('real engine followed the recitation (words marked as recited)',heard.dn>0);
  await p.click('.rcb .st');await p.waitForTimeout(2500);await snap('6r_result');const res=(await p.textContent('#sh')).replace(/\s+/g,' ');console.log('  result:',res.slice(0,300));
  if(process.env.EXPECT==='clean')ok('clean recitation: no mistakes reported',res.includes('No mistakes heard'));
  if(process.env.EXPECT==='mistake')ok('recitation with a skipped ayah: a mistake is reported',/to look at again/.test(res));
 }else{
  await p.click('#rcH');await p.click('#rcGo');await p.waitForTimeout(250);await snap('4_downloading');
  await p.waitForFunction(()=>{const b=document.getElementById('rcGo');return b&&!b.disabled},null,{timeout:8000});await snap('4b_ready');ok('after download asks for one more tap (iPhone microphone rule)',true);
  await p.click('#rcGo');await p.waitForTimeout(1400);await snap('5_listening_hidden');
  ok('bar shows while listening',await p.isVisible('.rcb.on'));
  const st=await p.evaluate(()=>({hidden:document.getElementById('rdB').classList.contains('rc-hide'),dn:document.querySelectorAll('#rdB .rw.dn').length,x:document.querySelectorAll('#rdB .rw.x').length,now:!!document.querySelector('#rdB .rw.now')}));
  ok('ayat hidden until recited',st.hidden);ok('recited words revealed',st.dn>3);ok('changed word marked',st.x===1);ok('current word underlined',st.now);
  await p.click('.rcb .ey');await p.waitForTimeout(300);ok('eye button shows the ayat',!(await p.evaluate(()=>document.getElementById('rdB').classList.contains('rc-hide'))));await snap('6_listening_shown');
  await p.waitForTimeout(1800);await p.click('.rcb .st');await p.waitForTimeout(900);await snap('7_result');
  const rt=await p.textContent('#sh');ok('result lists 2 words',rt.includes('2 words to look at again')||rt.includes('٢'));ok('kinds named',/Different word|كلمة مختلفة/.test(rt)&&/Missed word|كلمة متروكة/.test(rt));
  ok('summary saved',await p.evaluate(()=>S.rc&&S.rc.length===1&&S.rc[0].mk.length===2));
  await p.click('#sh .rcl [data-rj]');await p.waitForTimeout(800);await snap('8_jump_to_word');
  // a clean run gets the animated celebration
  await p.evaluate(()=>{window.__twoMistakes=false;window.__tick=40});
  await p.evaluate(()=>{const R=window.FQ_RC_ENGINE;const o=R.listen;});
  await p.click('#rdB .rsh .rcp');await p.waitForTimeout(400);ok('past recitation listed',(await p.textContent('#rcHist')).length>5);await snap('9_sheet_history');
  await p.evaluate(()=>{const f=window.FQ_RC_ENGINE;f.__orig=f.__orig||null});
  await p.selectOption('#rcA2','1');await p.click('#rcGo');await p.waitForTimeout(1500);
  await p.evaluate(()=>{const s=FQRC.state();if(s)s.ses._mk([])});await p.click('.rcb .st');await p.waitForTimeout(1300);await snap('10_result_clean');
  const t2=await p.textContent('#sh');ok('clean run: celebration',t2.includes('No mistakes heard')||t2.includes('لم تُسمع'));ok('celebration is animated',await p.evaluate(()=>!!document.querySelector('#sh .rcok .ring')&&getComputedStyle(document.querySelector('#sh .rcok .ring')).animationName!=='none'));
  await p.click('#sh [data-x]');await p.waitForTimeout(400);
  await p.click('#rdB .rsh .rcp');await p.waitForTimeout(300);await p.click('#rcCr');await p.waitForTimeout(400);await snap('11_credits');ok('credits name Tilawa',(await p.textContent('#sh')).includes('tilawa.dev'));
  // leaving the reader stops listening
  await p.evaluate(()=>closeSheet());await p.click('#rdB .rsh .rcp');await p.waitForTimeout(300);await p.click('#rcGo');await p.waitForTimeout(700);
  await p.evaluate(()=>go('home'));await p.waitForTimeout(900);ok('leaving the page stops listening',!(await p.evaluate(()=>!!FQRC.state()))&&!(await p.isVisible('.rcb.on')));
 }
 ok('no page errors '+JSON.stringify(errs.slice(0,3)),!errs.length);
 await b.close();console.log(fails?fails+' FAILED':'ALL PASSED');process.exit(fails?1:0)})();
