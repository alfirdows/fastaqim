// Tap test: Ramadan countdown + Blessed months (next/v6 preview). Checks every month page, 4 languages,
// Ramadan / last ten / Maghrib switch / Dhul-Hijjah dates, nothing cut off, no errors, Qur'an font loaded.
// Run: ENGINE=webkit node months.js out   (BASE=/next/v6/ by default)
const pw=require('playwright');const devices=pw.devices;const eng=pw[process.env.ENGINE||'chromium'];const fs=require('fs'),path=require('path');
const ROOT=process.env.ROOT||'/home/user/fastaqim',BASE=process.env.MBASE||'/next/v6/';
const MT={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.otf':'font/otf','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const OUT=process.argv[2]||'qa-months';fs.mkdirSync(OUT,{recursive:true});let fails=0;
const ok=(n,v,x)=>{console.log((v?'PASS ':'FAIL ')+n+(x?' '+x:''));if(!v)fails++};
(async()=>{const b=await eng.launch();
 const run=async(name,{lang='en',date,act,check,shot})=>{
  const c=await b.newContext({...devices[process.env.DEV||'iPhone 13'],deviceScaleFactor:1});
  await c.route('**/*',r=>{const u0=new URL(r.request().url());if(u0.host!=='fq.test')return r.abort();let u=u0.pathname;if(u.endsWith('/'))u+='index.html';const f=path.join(ROOT,decodeURIComponent(u));if(fs.existsSync(f))r.fulfill({body:fs.readFileSync(f),contentType:MT[path.extname(f)]||'application/octet-stream'});else r.fulfill({status:404,body:''})});
  const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  if(date)await p.clock.install({time:new Date(date)});
  await p.goto('http://fq.test'+BASE+'?nosync=1&lang='+lang+'#home');await p.waitForTimeout(1200);
  if(act)await act(p);
  const r=await p.evaluate(()=>{const W=innerWidth,bad=[];document.querySelectorAll('#fqmH *,#s-months.on *,#s-month.on *').forEach(e=>{const R=e.getBoundingClientRect();if(R.width&&(R.right>W+1||R.left<-1))bad.push(e.className)});
   const h=document.getElementById('fqmH');return{h:h?h.innerText.replace(/\n/g,' | '):'',sw:document.documentElement.scrollWidth,W,bad:bad.slice(0,3),font:document.fonts.check('20px "FQ Quran"')}});
  ok(name+' · no errors',!errs.length,errs.join(';'));ok(name+' · nothing cut off',r.sw<=r.W&&!r.bad.length,JSON.stringify(r.bad));
  if(check)await check(p,r);if(shot)await p.screenshot({path:path.join(OUT,shot+'.png'),fullPage:true});await c.close()};
 const openM=async p=>{await p.click('#fqmH');await p.waitForTimeout(500)};
 const month=m=>async p=>{await openM(p);await p.click(`.fqm-yr [data-m="${m}"]`);await p.waitForTimeout(500)};
 await run('Home 23 Nov',{date:'2026-11-23T14:00:00',shot:'home',check:async(p,r)=>{ok('countdown text',/Ramadan in 77 days/.test(r.h),r.h);ok('below salah card',await p.evaluate(()=>document.getElementById('hero').nextElementSibling.id==='fqmH'));ok('next month Rajab',/Rajab/.test(r.h))}});
 await run('After Maghrib 23 Nov',{date:'2026-11-23T20:00:00',check:async(p,r)=>ok('day changes at Maghrib',/Ramadan in 76 days/.test(r.h),r.h)});
 await run('Blessed months page',{date:'2026-11-23T14:00:00',act:openM,shot:'months',check:async p=>ok('12 months listed',(await p.$$('.fqm-yr li')).length===12)});
 for(let m=1;m<=12;m++)await run('Month '+m,{date:'2026-11-23T14:00:00',act:month(m),shot:'month'+m,check:async p=>{ok('month '+m+' page open',await p.isVisible('#s-month.on'));const n=await p.$$eval('#s-month .fqm-src',a=>a.filter(x=>x.href).map(x=>x.href));ok('month '+m+' sources link to quran.com / sunnah.com',n.length>0&&n.every(u=>/^https:\/\/(quran\.com|sunnah\.com)\//.test(u)))}});
 for(const L of ['ar','om','so'])await run('Language '+L,{lang:L,date:'2026-11-23T14:00:00',act:month(9),shot:'month9-'+L,check:async(p,r)=>{if(L==='ar')ok('Qur\'an font ready',r.font)}});
 await run('Ramadan day 12',{date:'2027-02-19T10:00:00',shot:'ramadan',check:async(p,r)=>ok('Ramadan day shown',/day 12/.test(r.h),r.h)});
 await run('Last ten',{date:'2027-03-02T10:00:00',check:async(p,r)=>ok('last ten shown',/Last ten nights/.test(r.h),r.h)});
 await run('Dhul-Hijjah',{date:'2027-05-12T10:00:00',check:async(p,r)=>ok('best ten days shown',/best ten days/.test(r.h),r.h)});
 await run('Back from month',{date:'2026-11-23T14:00:00',act:async p=>{await month(7)(p);await p.click('#s-month.on [data-back]');await p.waitForTimeout(400)},check:async p=>ok('back returns to months',await p.isVisible('#s-months.on'))});
 await b.close();console.log(fails?'FAILED '+fails:'ALL PASS');process.exit(fails?1:0)})();
