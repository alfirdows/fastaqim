// Fastaqim preview QA: opens every screen in every language on phone, tablet and desktop sizes,
// and reports page errors, sideways overflow and text cut off with "…". Run: ENGINE=webkit node screens.js
const pw=require('playwright');const fs=require('fs'),path=require('path');
const ENGINE=process.env.ENGINE||'webkit',ROOT=process.env.ROOT||path.resolve(__dirname,'../..'),OUT=process.env.OUT||'qa-shots';
const MT={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.otf':'font/otf','.mp3':'audio/mpeg','.m4a':'audio/mp4'};
const DEVS=[['iPhone SE',pw.devices['iPhone SE']],['iPhone 13',pw.devices['iPhone 13']],['iPad Pro 11',pw.devices['iPad Pro 11']],['iPad Pro 11 landscape',pw.devices['iPad Pro 11 landscape']],['Desktop 1440',{viewport:{width:1440,height:900}}]];
const LANGS=(process.env.LANGS||'en,ar,om,so').split(',');
const SCREENS=['#home','#tools','?x=tool-water#home','?x=tool-money#home','?x=newlist#home','?x=path#home','?x=salah#home','#quran','#index','#dhikr','?z=morning#dhikr','?x=tasbih#dhikr','?tbx=tap#dhikr','?tbs=1&tbx=beads#dhikr','?fri=1#dhikr','?tbset=1#more','?tbx=ring#dhikr','?tbx=loop#dhikr','?tbx=clicker#dhikr','?tbx=side#dhikr','?z=morning&zi=1#dhikr','?z=sleep&zi=3#dhikr','#todo','#more','#notif','#cal','#read','#stars','#qibla'];
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await pw[ENGINE].launch();let bad=0,total=0;
 for(const [dn,dev] of DEVS){const isMobile=ENGINE!=='firefox'?dev.isMobile:undefined;const c=await b.newContext({...dev,isMobile,deviceScaleFactor:1});
  await c.route('**/*',r=>{const u0=new URL(r.request().url());if(/fonts\.(googleapis|gstatic)\.com$/.test(u0.host))return r.continue();if(u0.host!=='fq.test')return r.abort();
   let u=u0.pathname;if(u.endsWith('/'))u+='index.html';const f=path.join(ROOT,decodeURIComponent(u));if(fs.existsSync(f))r.fulfill({body:fs.readFileSync(f),contentType:MT[path.extname(f)]||'application/octet-stream'});else r.fulfill({status:404,body:''})});
  const p=await c.newPage();let errs=[];p.on('pageerror',e=>errs.push(e.message));
  for(const L of LANGS)for(const sc of SCREENS){total++;errs=[];const [q,h]=sc.includes('#')?sc.split('#'):[sc,''];const qs=(q.startsWith('?')?q.slice(1)+'&':'')+'lang='+L;
   await p.goto('http://fq.test/next/v6/?'+qs+'&n='+total+'#'+(h||'home'));await p.waitForTimeout(700);
   const r=await p.evaluate(()=>{const W=document.documentElement.clientWidth,o=[],cut=[];
    const root=[...document.querySelectorAll('.scr.on, #sh.on, .tab, .zr.on, .tbx.on')];
    root.forEach(R=>R.querySelectorAll('*').forEach(e=>{const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden')return;const rc=e.getBoundingClientRect();if(!rc.width||!rc.height)return;
     const clipped=()=>{for(let a=e.parentElement;a&&a!==document.body;a=a.parentElement){const s=getComputedStyle(a);if(/(hidden|auto|scroll|clip)/.test(s.overflowX)){const ar=a.getBoundingClientRect();return ar.right<=W+1&&ar.left>=-1}}return false};
     if(cs.position!=='fixed'&&(rc.right>W+1||rc.left<-1)&&!clipped())o.push((e.id?'#'+e.id:e.tagName.toLowerCase()+'.'+[...e.classList].join('.'))+'['+Math.round(rc.left)+','+Math.round(rc.right)+']');
     if(cs.textOverflow==='ellipsis'&&e.scrollWidth>e.clientWidth+1&&e.textContent.trim())cut.push(e.textContent.trim().slice(0,40))}));
    return{over:document.documentElement.scrollWidth>W+1,o:[...new Set(o)].slice(0,5),cut:[...new Set(cut)].slice(0,6)}});
   const name=(dn+'_'+L+'_'+sc).replace(/[^\w]+/g,'_');const issues=[];if(errs.length)issues.push('ERRORS '+errs.join(' | '));if(r.over||r.o.length)issues.push('OVERFLOW '+r.o.join(' '));if(r.cut.length)issues.push('CUT "'+r.cut.join('" "')+'"');
   if(issues.length){bad++;console.log('ISSUE',dn,L,sc,issues.join(' ; '));await p.screenshot({path:path.join(OUT,name+'.png')})}}
  await c.close()}
 // compare page
 {const c=await b.newContext({...pw.devices['iPad Pro 11 landscape'],isMobile:ENGINE!=='firefox'?true:undefined});await c.route('**/*',r=>{const u0=new URL(r.request().url());if(u0.host!=='fq.test')return r.abort();let u=u0.pathname;if(u.endsWith('/'))u+='index.html';const f=path.join(ROOT,decodeURIComponent(u));if(fs.existsSync(f))r.fulfill({body:fs.readFileSync(f),contentType:MT[path.extname(f)]||'application/octet-stream'});else r.fulfill({status:404,body:''})});
  const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('http://fq.test/next/compare/');await p.waitForTimeout(2500);
  const n=await p.$$eval('iframe',f=>f.length);console.log('compare: iframes',n,'errors',errs.join(' | ')||'none');await p.screenshot({path:path.join(OUT,'compare_ipad.png')});await c.close()}
 console.log(`SUMMARY ${ENGINE}: ${total-bad} of ${total} screen checks clean, ${bad} with issues`);await b.close()})();
