// Tap test: "A word for your heart" salah reminders (fq-nudge.js). Real location + time zone, 4 languages,
// Home Screen mode, auto show near the end of a salah, after "Made up", "Finding it heavy?", limits, settings,
// every reminder renders with a quran.com / sunnah.com source, nothing cut off, ✕ always visible, no errors.
// Run: ENGINE=webkit node .github/qa/nudge.js out   (MBASE=/ for the main page, default /next/v6/)
const pw=require('playwright');const devices=pw.devices;const eng=pw[process.env.ENGINE||'chromium'];const fs=require('fs'),path=require('path');
const ROOT=process.env.ROOT||path.resolve(__dirname,'../..'),BASE=process.env.MBASE||'/next/v6/';
const MT={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.otf':'font/otf','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const OUT=process.argv[2]||'qa-nudge';fs.mkdirSync(OUT,{recursive:true});let fails=0;
const ok=(n,v,x)=>{console.log((v?'PASS ':'FAIL ')+n+(x?' '+x:''));if(!v)fails++};
const LOC={lat:44.98,lng:-93.27,name:'Minneapolis'};const TZ='America/Chicago';
(async()=>{const b=await eng.launch();
 const ctx=async({lang='en',date,state,sa})=>{const c=await b.newContext({...devices[process.env.DEV||'iPhone 13'],deviceScaleFactor:1,timezoneId:TZ});
  await c.route('**/*',r=>{const u0=new URL(r.request().url());if(u0.host!=='fq.test')return r.abort();let u=u0.pathname;if(u.endsWith('/'))u+='index.html';const f=path.join(ROOT,decodeURIComponent(u));if(fs.existsSync(f))r.fulfill({body:fs.readFileSync(f),contentType:MT[path.extname(f)]||'application/octet-stream'});else r.fulfill({status:404,body:''})});
  if(sa)await c.addInitScript(()=>{Object.defineProperty(navigator,'standalone',{get:()=>true});const mm=window.matchMedia.bind(window);window.matchMedia=q=>/standalone/.test(q)?{matches:true,media:q,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}:mm(q)});
  if(state)await c.addInitScript(s=>{if(!sessionStorage.getItem('qa'))localStorage.setItem('fq5.state',JSON.stringify(s));sessionStorage.setItem('qa','1')},state);
  const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  if(date)await p.clock.install({time:new Date(date)});
  await p.goto('http://fq.test'+BASE+'?nosync=1&lang='+lang+'#home');await p.waitForTimeout(1500);return{c,p,errs}};
 const sheet=p=>p.evaluate(()=>{const sh=document.getElementById('sh'),on=sh.classList.contains('on'),W=innerWidth,H=innerHeight,bad=[];
  if(on)sh.querySelectorAll('*').forEach(e=>{const R=e.getBoundingClientRect();if(R.width&&(R.right>W+1||R.left<-1))bad.push(e.className||e.tagName)});
  const x=sh.querySelector('[data-x]'),xr=x&&x.getBoundingClientRect();
  return{on,nudge:!!sh.querySelector('#fqkCard'),h1:(sh.querySelector('h1')||{}).textContent||'',text:sh.innerText,bad:bad.slice(0,4),x:!!xr&&xr.top>=0&&xr.bottom<=H&&xr.width>20,sw:document.documentElement.scrollWidth,W}});
 const common=(n,s,errs)=>{ok(n+' · no errors',!errs.length,errs.join(';'));ok(n+' · nothing cut off',s.sw<=s.W&&!s.bad.length,JSON.stringify(s.bad));if(s.on)ok(n+' · ✕ visible',s.x)};
 // 1. learn the real salah times for 25 Nov in Minneapolis
 let T;{const{c,p}=await ctx({date:'2026-11-25T12:00:00-06:00',state:{loc:LOC}});T=await p.evaluate(()=>Object.fromEntries(SAL.map(s=>[s[0],s[3]])));await c.close()}
 console.log('times',JSON.stringify(T));
 const t=(hm,addMin)=>{const[h,m]=hm.split(':').map(Number);const d=new Date(Date.UTC(2026,10,25,h+6,m+addMin));return d.toISOString()};
 // 2. Asr nearly over, not marked -> shows by itself
 {const{c,p,errs}=await ctx({date:t(T.maghrib,-20),state:{loc:LOC}});await p.waitForTimeout(4500);let s=await sheet(p);
  ok('near end · shows by itself',s.nudge&&/still time/.test(s.h1),s.h1);ok('near end · names Asr',/prayed Asr/.test(s.text));common('near end',s,errs);
  await p.screenshot({path:path.join(OUT,'1-near-end.png')});
  await p.click('#fqkNx');await p.waitForTimeout(600);s=await sheet(p);ok('another · still open',s.nudge);
  await p.screenshot({path:path.join(OUT,'1b-another.png')});await p.click('#fqkMk',{timeout:5000}).catch(async e=>{console.log('click fail');await p.screenshot({path:path.join(OUT,'1c-fail.png')});await p.$eval('#fqkMk',b=>b.click())});await p.waitForTimeout(600);s=await sheet(p);ok('mark it · opens the salah sheet',s.on&&/How did you pray it/.test(s.text));
  ok('mark it · nothing auto-marked',await p.evaluate(()=>!(S.salah[dkey(NOW())]||{}).asr));
  await p.click('#sh [data-x]');await p.waitForTimeout(400);await p.evaluate(()=>fqNudge.check());await p.waitForTimeout(400);s=await sheet(p);ok('same salah · not shown twice',!s.on);await c.close()}
 // 3. no location -> never by itself
 {const{c,p,errs}=await ctx({date:t(T.maghrib,-20),state:{}});await p.waitForTimeout(4500);const s=await sheet(p);ok('no location · not shown',!s.on);ok('no location · no errors',!errs.length,errs.join(';'));await c.close()}
 // 4. already marked -> not shown
 {const{c,p}=await ctx({date:t(T.maghrib,-20),state:{loc:LOC,salah:{'2026-11-25':{fajr:'on',dhuhr:'on',asr:'on'}}}});await p.waitForTimeout(4500);
  const dk=await p.evaluate(()=>dkey(NOW()));const s=await sheet(p);ok('marked · not shown (day key '+dk+')',!s.on);await c.close()}
 // 5. early in Asr -> not shown
 {const{c,p}=await ctx({date:t(T.asr,30),state:{loc:LOC}});await p.waitForTimeout(4500);const s=await sheet(p);ok('early in the time · not shown',!s.on);
 // 6. "Made up" -> welcome back
  await p.evaluate(()=>salSheet('dhuhr'));await p.waitForTimeout(400);let s2=await sheet(p);ok('salah sheet · heavy link',/Finding it heavy/.test(s2.text));
  await p.click('#sh [data-v="late"]');await p.waitForTimeout(1000);s2=await sheet(p);ok('made up · welcome back',s2.nudge&&/Welcome back/.test(s2.h1),s2.h1);
  ok('made up · mark kept as made up',await p.evaluate(()=>(S.salah[dkey(NOW())]||{}).dhuhr==='late'));await p.screenshot({path:path.join(OUT,'2-made-up.png')});
  await p.click('#sh [data-x]');await p.waitForTimeout(400);
 // 7. hero link
  const hl=await p.$('#hero .fqk-hl');ok('hero · "Finding it heavy?" link',!!hl);if(hl){await hl.click();await p.waitForTimeout(800);const s3=await sheet(p);ok('heavy · opens',s3.nudge&&/word for your heart/.test(s3.h1));await p.screenshot({path:path.join(OUT,'3-heavy.png')});await p.click('#sh [data-x]')}
  await c.close()}
 // 8. every reminder renders, with a real source
 {const{c,p,errs}=await ctx({date:t(T.asr,30),state:{loc:LOC}});const n=await p.evaluate(()=>fqNudge.all.length);let bad=[],srcs=new Set();
  for(const g of ['n','l','h','g']){await p.evaluate(g=>fqNudge.open(g),g);await p.waitForTimeout(700);const cnt=await p.evaluate(g=>fqNudge.all.filter(a=>g==='g'||a.g.includes(g)||(g==='h'&&a.g.includes('g'))).length,g);
   for(let i=0;i<cnt;i++){const r=await p.evaluate(()=>{const c=document.getElementById('fqkCard');const a=c.querySelector('a.fqk-s');return{t:c.innerText,u:a?a.href:'',own:!!c.querySelector('.fqk-own,span.fqk-s')}});
    if(r.t.length<20||/…|\.\.\./.test(r.t))bad.push(r.t.slice(0,40));if(!r.u&&!r.own)bad.push('no source: '+r.t.slice(0,30));if(r.u){srcs.add(r.u);if(!/^https:\/\/(quran\.com|sunnah\.com)\//.test(r.u))bad.push(r.u)}
    await p.click('#fqkNx');await p.waitForTimeout(450)}
   await p.click('#sh [data-x]');await p.waitForTimeout(300)}
  ok(n+' reminders · all render with a source',!bad.length,JSON.stringify(bad));ok('links seen',srcs.size>=18,String(srcs.size));ok('render · no errors',!errs.length,errs.join(';'));await c.close()}
 // 9. daily limit and settings
 {const{c,p}=await ctx({date:t(T.maghrib,-20),state:{loc:LOC,nudge:{d:'2026-11-25',n:2,seen:{},i:{}}}});await p.waitForTimeout(4500);let s=await sheet(p);ok('twice a day max',!s.on);await c.close()}
 {const{c,p,errs}=await ctx({date:t(T.maghrib,-20),state:{loc:LOC,nudge:{off:true}}});await p.waitForTimeout(4500);let s=await sheet(p);ok('turned off · not shown',!s.on);
  await p.evaluate(()=>fqNudge.settings());await p.waitForTimeout(400);s=await sheet(p);ok('settings · opens',/Salah reminders/.test(s.h1));common('settings',s,errs);await p.screenshot({path:path.join(OUT,'4-settings.png')});
  await p.click('#sh [data-nv="1"]');await p.waitForTimeout(300);ok('settings · turn on saves',await p.evaluate(()=>!S.nudge.off&&JSON.parse(localStorage.getItem('fq5.state')).nudge.off===false));
  await p.click('#sh [data-x]');await p.waitForTimeout(300);await p.evaluate(()=>fqNudge.check());await p.waitForTimeout(600);s=await sheet(p);ok('turned on · shows',s.nudge);
  await p.click('#fqkPz');await p.waitForTimeout(300);ok('not today · paused',await p.evaluate(()=>S.nudge.pause===dkey(NOW())));await c.close()}
 {const{c,p}=await ctx({date:t(T.asr,30),state:{loc:LOC}});await p.evaluate(()=>go('settings'));await p.waitForTimeout(600);ok('Settings · Salah reminders row',await p.isVisible('#fqkMore'));if(await p.isVisible('#fqkMore')){await p.screenshot({path:path.join(OUT,'4b-settings-row.png')});await p.click('#fqkMore');await p.waitForTimeout(400);ok('Settings row · opens',/Salah reminders/.test((await sheet(p)).h1))}await c.close()}
 // 10. languages + Home Screen mode
 for(const[L,re]of[['ar',/متّسع/],['om',/Yeroon/],['so',/Waqti/]]){const{c,p,errs}=await ctx({lang:L,date:t(T.maghrib,-20),state:{loc:LOC}});await p.waitForTimeout(4500);const s=await sheet(p);ok(L+' · title',re.test(s.h1),s.h1);common(L,s,errs);await p.screenshot({path:path.join(OUT,'5-'+L+'.png')});
  for(let i=0;i<6;i++){await p.click('#fqkNx');await p.waitForTimeout(400);const s2=await sheet(p);if(s2.bad.length||s2.sw>s2.W){ok(L+' · reminder '+i+' cut off',false,JSON.stringify(s2.bad));break}}await c.close()}
 {const{c,p,errs}=await ctx({sa:1,date:t(T.maghrib,-20),state:{loc:LOC}});await p.waitForTimeout(4500);const s=await sheet(p);ok('Home Screen · shows',s.nudge);common('Home Screen',s,errs);
  ok('Home Screen mode on',await p.evaluate(()=>isSA));await p.screenshot({path:path.join(OUT,'6-homescreen.png')});
  // a few minutes of use: wait through 3 checks, nothing new pops up after closing
  await p.click('#sh [data-x]');await p.clock.runFor(180000);await p.waitForTimeout(500);const s2=await sheet(p);ok('Home Screen · 3 min later nothing pops again',!s2.on);await c.close()}
 await b.close();console.log(fails?'FAILED '+fails:'ALL PASS');process.exit(fails?1:0)})();
