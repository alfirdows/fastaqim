// Daily wird + share checks (preview /next/v6/): every language, iPhone SE and 13, WebKit.
// Checks: page opens, no page errors, nothing wider than the screen, the share picture is made,
// a family link opens the same plan on a new phone, Share/Add to Saved never count a dhikr, reader buttons appear.
const pw=require('playwright'),fs=require('fs'),path=require('path');
const ENGINE=process.env.ENGINE||'webkit',ROOT=process.env.ROOT||path.resolve(__dirname,'../..'),OUT=process.argv[2]||'qa-share',BASE=process.env.SBASE||'/next/v6/';
const MT={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.otf':'font/otf','.mp3':'audio/mpeg'};
fs.mkdirSync(OUT,{recursive:true});let bad=0;const fail=m=>{bad++;console.log('ISSUE',m)};
const route=c=>c.route('**/*',r=>{const u0=new URL(r.request().url());if(u0.host!=='fq.test')return r.abort();let u=u0.pathname;if(u.endsWith('/'))u+='index.html';const f=path.join(ROOT,decodeURIComponent(u));if(fs.existsSync(f))r.fulfill({body:fs.readFileSync(f),contentType:MT[path.extname(f)]||'application/octet-stream'});else r.fulfill({status:404,body:''})});
const wide=p=>p.evaluate(()=>{const W=document.documentElement.clientWidth,o=[];document.querySelectorAll('.scr.on *, #sh.on *').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&(r.right>W+1||r.left<-1)&&getComputedStyle(e).position!=='fixed')o.push(e.tagName.toLowerCase()+'.'+[...e.classList].join('.'))});return document.documentElement.scrollWidth>W+1?['page']:o.slice(0,4)});
(async()=>{const b=await pw[ENGINE].launch();
 for(const dev of ['iPhone SE','iPhone 13'])for(const L of ['en','ar','om','so']){
  const c=await b.newContext({...pw.devices[dev]});await route(c);const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));const tag=dev+' '+L;
  await p.goto(`http://fq.test${BASE}?wo=1&lang=${L}#wird`);await p.waitForTimeout(1500);
  if(!(await p.$('#s-wird.on .fqw-big')))fail(tag+': Daily wird page did not open');
  let w=await wide(p);if(w.length)fail(tag+': wird page too wide '+w.join(' '));
  await p.click('#fqwShare');await p.waitForTimeout(2500);
  if(!(await p.$('#fqsPrev img')))fail(tag+': share picture was not made');
  w=await wide(p);if(w.length)fail(tag+': share sheet too wide '+w.join(' '));
  await p.screenshot({path:`${OUT}/${dev.replace(/ /g,'')}_${L}_share.png`});
  await p.evaluate(()=>closeSheet());await p.click('#fqwEdit');await p.waitForTimeout(400);
  w=await wide(p);if(w.length)fail(tag+': owner sheet too wide '+w.join(' '));
  const lk=await p.evaluate(async()=>{closeSheet();S.wird={s:'2026-11-20',z:'j',d:['m2697','c0'],c:[{ar:'اللهم اشف جدتي',me:'O Allah, heal grandmother'}],n:'Test note'};save();return (await FQS.wirdItem(FQS.plan(true))).link});
  // family member: a new phone opens the link
  const c2=await b.newContext({...pw.devices[dev]});await route(c2);const q=await c2.newPage();q.on('pageerror',e=>errs.push('family: '+e.message));
  await q.goto(lk.replace(/^https?:\/\/[^?]+/,`http://fq.test${BASE}`).replace('?','?lang='+L+'&'));await q.waitForTimeout(1800);
  const r=await q.evaluate(()=>({on:(document.querySelector('.scr.on')||{}).id,duas:document.querySelectorAll('.fqw-dua').length,edit:!!document.getElementById('fqwEdit'),note:!!document.querySelector('.fqw-note')}));
  if(r.on!=='s-wird'||r.duas!==2||r.edit||!r.note)fail(tag+': family link '+JSON.stringify(r));
  w=await wide(q);if(w.length)fail(tag+': family page too wide '+w.join(' '));
  await q.evaluate(()=>go('home'));await q.waitForTimeout(600);w=await wide(q);if(w.length)fail(tag+': home too wide '+w.join(' '));
  if(!(await q.$('#fqwHome .fqw-open')))fail(tag+': Home wird card missing');
  await c2.close();
  // adhkar: Share and Add to Saved never count
  await p.goto(`http://fq.test${BASE}?z=morning&lang=${L}#dhikr`);await p.waitForTimeout(1200);
  if(!(await p.$('#zCard .fqs-bar')))fail(tag+': dhikr share bar missing');
  else{await p.evaluate(()=>{document.getElementById('zc').scrollTop=99999});await p.waitForTimeout(200);await p.click('[data-fqz=save]');await p.waitForTimeout(300);const pr=await p.evaluate(()=>[JSON.stringify(zProg('morning')),tItems('saved').length]);if(pr[0]!=='{}'||pr[1]<1)fail(tag+': dhikr save '+pr)}
  // reader: tap an ayah, Share + Add to Saved appear
  await p.evaluate(()=>{zClose();RD={su:1,ay:1};go('read')});await p.waitForTimeout(1500);await p.$eval('#a2',e=>e.scrollIntoView({block:'center'}));await p.click('#a2');await p.waitForTimeout(300);
  if(!(await p.$('#a2 [data-fqs=share]')))fail(tag+': reader share button missing');
  w=await wide(p);if(w.length)fail(tag+': reader too wide '+w.join(' '));
  if(errs.length)fail(tag+': errors '+errs.join(' | '));
  await c.close()}
 console.log(`SUMMARY share ${ENGINE}: ${bad?bad+' issue(s)':'all clean'}`);await b.close();process.exit(0)})();
